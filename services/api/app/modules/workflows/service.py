from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session

from app.modules.workflows.models import (
    TemporalWorkflowExecution,
    TemporalActivityLog,
    OperationalEscalation
)
from app.modules.workflows.workflows import (
    WorkflowFirstContactSLA,
    WorkflowOPReviewSLA,
    WorkflowPreArrivalCountdown
)


class WorkflowService:
    @staticmethod
    def start_first_contact_sla(
        db: Session,
        application_id: str,
        sla_hours: int = 48
    ) -> TemporalWorkflowExecution:
        return WorkflowFirstContactSLA.start(db, str(application_id), sla_hours)

    @staticmethod
    def evaluate_first_contact_sla(
        db: Session,
        execution_id: str
    ) -> Dict[str, Any]:
        return WorkflowFirstContactSLA.evaluate_check(db, str(execution_id))

    @staticmethod
    def start_op_review_sla(
        db: Session,
        application_id: str,
        sla_hours: int = 72
    ) -> TemporalWorkflowExecution:
        return WorkflowOPReviewSLA.start(db, str(application_id), sla_hours)

    @staticmethod
    def evaluate_op_review_sla(
        db: Session,
        execution_id: str
    ) -> Dict[str, Any]:
        return WorkflowOPReviewSLA.evaluate_check(db, str(execution_id))

    @staticmethod
    def start_pre_arrival_countdown(
        db: Session,
        exchange_id: str
    ) -> TemporalWorkflowExecution:
        return WorkflowPreArrivalCountdown.start(db, str(exchange_id))

    @staticmethod
    def trigger_pre_arrival_cascade(
        db: Session,
        execution_id: str,
        days_before: int
    ) -> Dict[str, Any]:
        return WorkflowPreArrivalCountdown.trigger_cascade_audit(db, str(execution_id), days_before)

    @staticmethod
    def list_executions(
        db: Session,
        status: Optional[str] = None,
        workflow_type: Optional[str] = None,
        limit: int = 50
    ) -> List[TemporalWorkflowExecution]:
        query = db.query(TemporalWorkflowExecution)
        if status:
            query = query.filter(TemporalWorkflowExecution.status == status)
        if workflow_type:
            query = query.filter(TemporalWorkflowExecution.workflow_type == workflow_type)
        return query.order_by(TemporalWorkflowExecution.created_at.desc()).limit(limit).all()

    @staticmethod
    def list_escalations(
        db: Session,
        resolved: Optional[bool] = None,
        limit: int = 50
    ) -> List[OperationalEscalation]:
        query = db.query(OperationalEscalation)
        if resolved is not None:
            query = query.filter(OperationalEscalation.resolved == resolved)
        return query.order_by(OperationalEscalation.created_at.desc()).limit(limit).all()

    @staticmethod
    def resolve_escalation(
        db: Session,
        escalation_id: str,
        resolution_notes: str
    ) -> OperationalEscalation:
        escalation = db.query(OperationalEscalation).filter(
            OperationalEscalation.id == str(escalation_id)
        ).first()
        if not escalation:
            raise ValueError("Escalation not found")
        escalation.resolved = True
        escalation.resolution_notes = resolution_notes
        escalation.resolved_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(escalation)
        return escalation
