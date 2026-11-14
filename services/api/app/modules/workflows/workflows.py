import uuid
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from app.modules.workflows.models import TemporalWorkflowExecution
from app.modules.workflows.activities import (
    activity_send_notification,
    activity_escalate_sla_breach,
    activity_evaluate_checklist_status
)
from app.modules.applications.models import Application
from app.modules.exchanges.models import Exchange


class WorkflowFirstContactSLA:
    @staticmethod
    def start(
        db: Session,
        app_id: str,
        sla_hours: int = 48
    ) -> TemporalWorkflowExecution:
        workflow_id = f"wf-sla-contact-{app_id}"
        existing = db.query(TemporalWorkflowExecution).filter(
            TemporalWorkflowExecution.workflow_id == workflow_id
        ).first()
        if existing and existing.status == "RUNNING":
            return existing

        now = datetime.now(timezone.utc)
        due_at = now + timedelta(hours=sla_hours)

        execution = TemporalWorkflowExecution(
            workflow_id=workflow_id,
            workflow_type="SLA_FIRST_CONTACT",
            entity_type="APPLICATION",
            entity_id=str(app_id),
            status="RUNNING",
            input_payload={"sla_hours": sla_hours},
            current_step="INITIAL_NOTIFICATION_SENT",
            due_at=due_at,
            started_at=now
        )
        db.add(execution)
        db.commit()

        # Idempotent Activity 1: Send initial notification to EP Manager
        activity_send_notification(
            db,
            execution_id=execution.id,
            idempotency_key=f"act-notify-start-{execution.id}",
            recipient_role="EP_MANAGER",
            title="First Contact SLA Clock Started",
            message=f"Application {app_id} must be contacted within {sla_hours} hours (due at {due_at.isoformat()})."
        )

        return execution

    @staticmethod
    def evaluate_check(db: Session, execution_id: str) -> Dict[str, Any]:
        execution = db.query(TemporalWorkflowExecution).filter(
            TemporalWorkflowExecution.id == execution_id
        ).first()
        if not execution:
            return {"error": "Execution not found"}

        app = db.query(Application).filter(Application.id == execution.entity_id).first()
        if not app:
            execution.status = "FAILED"
            db.commit()
            return {"error": "Application not found"}

        now = datetime.now(timezone.utc)
        # If application has already advanced beyond APPLIED (i.e. CONTACTED or later)
        if app.current_stage != "APPLIED":
            execution.status = "COMPLETED"
            execution.current_step = "SLA_MET"
            execution.completed_at = now
            db.commit()
            return {"status": "COMPLETED", "sla_met": True, "stage": app.current_stage}

        # Check if due_at passed -> Breach
        # In SQLite, due_at might be naive or tz-aware; ensure comparison is safe
        due = execution.due_at
        if due and due.tzinfo is None:
            due = due.replace(tzinfo=timezone.utc)

        if due and now >= due:
            execution.status = "TIMED_OUT"
            execution.current_step = "SLA_BREACHED_ESCALATED"
            execution.completed_at = now
            db.commit()

            # Trigger Escalation Activity
            ep_display = f"{app.ep.first_name} {app.ep.last_name}" if app.ep else f"EP {app.ep_id}"
            activity_escalate_sla_breach(
                db,
                execution_id=execution.id,
                idempotency_key=f"act-escalate-{execution.id}",
                entity_type="APPLICATION",
                entity_id=str(app.id),
                reason=f"48h First Contact SLA breached for candidate {ep_display}. Stage remains APPLIED.",
                severity="WARNING",
                role="LCVP_ICX"
            )

            return {"status": "TIMED_OUT", "sla_met": False, "escalated": True}

        return {"status": "RUNNING", "due_at": execution.due_at.isoformat()}


class WorkflowOPReviewSLA:
    @staticmethod
    def start(
        db: Session,
        app_id: str,
        sla_hours: int = 72
    ) -> TemporalWorkflowExecution:
        workflow_id = f"wf-sla-op-review-{app_id}"
        existing = db.query(TemporalWorkflowExecution).filter(
            TemporalWorkflowExecution.workflow_id == workflow_id
        ).first()
        if existing and existing.status == "RUNNING":
            return existing

        now = datetime.now(timezone.utc)
        due_at = now + timedelta(hours=sla_hours)

        execution = TemporalWorkflowExecution(
            workflow_id=workflow_id,
            workflow_type="SLA_OP_REVIEW",
            entity_type="APPLICATION",
            entity_id=str(app_id),
            status="RUNNING",
            input_payload={"sla_hours": sla_hours},
            current_step="SENT_TO_OP_NOTIFICATION",
            due_at=due_at,
            started_at=now
        )
        db.add(execution)
        db.commit()

        activity_send_notification(
            db,
            execution_id=execution.id,
            idempotency_key=f"act-notify-op-review-{execution.id}",
            recipient_role="ACCOUNT_MANAGER",
            title="OP Review 72h SLA Clock Started",
            message=f"Application {app_id} sent to Opportunity Provider. Follow-up required within {sla_hours} hours."
        )

        return execution

    @staticmethod
    def evaluate_check(db: Session, execution_id: str) -> Dict[str, Any]:
        execution = db.query(TemporalWorkflowExecution).filter(
            TemporalWorkflowExecution.id == execution_id
        ).first()
        if not execution:
            return {"error": "Execution not found"}

        app = db.query(Application).filter(Application.id == execution.entity_id).first()
        if not app:
            return {"error": "Application not found"}

        now = datetime.now(timezone.utc)
        if app.current_stage not in ("SENT_TO_OP",):
            execution.status = "COMPLETED"
            execution.current_step = "OP_REVIEW_RESOLVED"
            execution.completed_at = now
            db.commit()
            return {"status": "COMPLETED", "resolved": True}

        due = execution.due_at
        if due and due.tzinfo is None:
            due = due.replace(tzinfo=timezone.utc)

        if due and now >= due:
            execution.status = "TIMED_OUT"
            execution.current_step = "OP_REVIEW_OVERDUE_ESCALATED"
            execution.completed_at = now
            db.commit()

            ep_display = f"{app.ep.first_name} {app.ep.last_name}" if app.ep else f"EP {app.ep_id}"
            activity_escalate_sla_breach(
                db,
                execution_id=execution.id,
                idempotency_key=f"act-escalate-op-review-{execution.id}",
                entity_type="APPLICATION",
                entity_id=str(app.id),
                reason=f"72h OP Review SLA breached for candidate {ep_display}. No feedback from Opportunity Provider.",
                severity="WARNING",
                role="LCVP_ICX"
            )
            return {"status": "TIMED_OUT", "sla_met": False, "escalated": True}

        return {"status": "RUNNING", "due_at": execution.due_at.isoformat()}


class WorkflowPreArrivalCountdown:
    @staticmethod
    def start(
        db: Session,
        exchange_id: str
    ) -> TemporalWorkflowExecution:
        workflow_id = f"wf-pre-arrival-{exchange_id}"
        existing = db.query(TemporalWorkflowExecution).filter(
            TemporalWorkflowExecution.workflow_id == workflow_id
        ).first()
        if existing and existing.status == "RUNNING":
            return existing

        exchange = db.query(Exchange).filter(Exchange.id == exchange_id).first()
        now = datetime.now(timezone.utc)
        arrival_datetime = datetime.combine(exchange.start_date, datetime.min.time(), tzinfo=timezone.utc) if exchange and exchange.start_date else now + timedelta(days=14)

        execution = TemporalWorkflowExecution(
            workflow_id=workflow_id,
            workflow_type="PRE_ARRIVAL_COUNTDOWN",
            entity_type="EXCHANGE",
            entity_id=str(exchange_id),
            status="RUNNING",
            input_payload={"arrival_date": exchange.start_date.isoformat() if exchange and exchange.start_date else None},
            current_step="COUNTDOWN_INITIALIZED",
            due_at=arrival_datetime,
            started_at=now
        )
        db.add(execution)
        db.commit()

        return execution

    @staticmethod
    def trigger_cascade_audit(db: Session, execution_id: str, checkpoint_days: int) -> Dict[str, Any]:
        execution = db.query(TemporalWorkflowExecution).filter(
            TemporalWorkflowExecution.id == execution_id
        ).first()
        if not execution:
            return {"error": "Execution not found"}

        audit_result = activity_evaluate_checklist_status(
            db,
            execution_id=execution.id,
            idempotency_key=f"act-audit-tminus-{checkpoint_days}-{execution.id}",
            exchange_id=execution.entity_id
        )

        res = audit_result["result"]
        if not res.get("is_ready_for_arrival"):
            activity_escalate_sla_breach(
                db,
                execution_id=execution.id,
                idempotency_key=f"act-escalate-tminus-{checkpoint_days}-{execution.id}",
                entity_type="EXCHANGE",
                entity_id=str(execution.entity_id),
                reason=f"Pre-arrival T-{checkpoint_days} days alert: missing bed or mandatory checklist ({res.get('missing_mandatory')}).",
                severity="CRITICAL" if checkpoint_days <= 3 else "WARNING",
                role="LCVP_ICX"
            )

        execution.current_step = f"T_MINUS_{checkpoint_days}_CHECKED"
        db.commit()
        return {"checkpoint": f"T-{checkpoint_days}", "audit": res}
