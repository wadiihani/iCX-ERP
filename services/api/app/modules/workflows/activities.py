import uuid
from datetime import datetime, timezone
from typing import Dict, Any
from sqlalchemy.orm import Session

from app.modules.workflows.models import TemporalActivityLog, OperationalEscalation
from app.modules.applications.models import Application
from app.modules.exchanges.models import Exchange, ExchangeChecklist


def execute_activity_idempotent(
    db: Session,
    exec_id: str,
    activity_name: str,
    idempotency_key: str,
    handler_func,
    **kwargs
) -> Dict[str, Any]:
    """
    Executes an activity with strict idempotency guarantees.
    If the activity has already been executed successfully with the given idempotency key,
    returns the cached result payload without re-executing.
    """
    existing_log = db.query(TemporalActivityLog).filter(
        TemporalActivityLog.idempotency_key == idempotency_key
    ).first()

    if existing_log and existing_log.status == "SUCCESS":
        return {
            "cached": True,
            "status": "SUCCESS",
            "result": existing_log.result_payload
        }

    activity_log = existing_log or TemporalActivityLog(
        execution_id=exec_id,
        activity_name=activity_name,
        idempotency_key=idempotency_key,
        status="STARTED",
        retry_count=0
    )
    if not existing_log:
        db.add(activity_log)
    else:
        activity_log.retry_count += 1
        activity_log.status = "STARTED"
    db.commit()

    try:
        result = handler_func(db, **kwargs)
        activity_log.status = "SUCCESS"
        activity_log.result_payload = result
        db.commit()
        return {
            "cached": False,
            "status": "SUCCESS",
            "result": result
        }
    except Exception as exc:
        activity_log.status = "FAILED"
        activity_log.result_payload = {"error": str(exc)}
        db.commit()
        raise exc


def _handle_send_notification(db: Session, recipient_role: str, title: str, message: str) -> Dict[str, Any]:
    return {
        "delivered": True,
        "recipient_role": recipient_role,
        "title": title,
        "message": message,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


def _handle_escalate_sla_breach(
    db: Session,
    execution_id: str,
    entity_type: str,
    entity_id: str,
    reason: str,
    severity: str = "WARNING",
    role: str = "LCVP_ICX"
) -> Dict[str, Any]:
    escalation = OperationalEscalation(
        workflow_execution_id=execution_id,
        entity_type=entity_type,
        entity_id=entity_id,
        severity=severity,
        reason=reason,
        escalated_to_role=role,
        resolved=False
    )
    db.add(escalation)

    if entity_type == "APPLICATION":
        app = db.query(Application).filter(Application.id == entity_id).first()
        if app and app.operational_readiness != "DONE":
            app.operational_readiness = "AT_RISK"
    elif entity_type == "EXCHANGE":
        exchange = db.query(Exchange).filter(Exchange.id == entity_id).first()
        if exchange and exchange.operational_readiness != "DONE":
            exchange.operational_readiness = "AT_RISK"

    db.commit()
    return {
        "escalation_id": str(escalation.id),
        "severity": severity,
        "role": role,
        "reason": reason
    }


def _handle_evaluate_checklist_status(db: Session, exchange_id: str) -> Dict[str, Any]:
    exchange = db.query(Exchange).filter(Exchange.id == exchange_id).first()
    if not exchange:
        return {"error": "Exchange not found", "all_completed": False}

    checklists = db.query(ExchangeChecklist).filter(
        ExchangeChecklist.exchange_id == exchange_id
    ).all()

    total = len(checklists)
    completed = sum(1 for c in checklists if c.status == "COMPLETED")
    missing_mandatory = [
        c.item_key for c in checklists
        if c.is_mandatory and c.status != "COMPLETED"
    ]

    has_bed = exchange.accommodation_bed_id is not None

    return {
        "exchange_id": str(exchange_id),
        "total_items": total,
        "completed_items": completed,
        "missing_mandatory": missing_mandatory,
        "has_bed_assigned": has_bed,
        "is_ready_for_arrival": (len(missing_mandatory) == 0 and has_bed)
    }


def activity_send_notification(
    db: Session,
    execution_id: str,
    idempotency_key: str,
    recipient_role: str,
    title: str,
    message: str
) -> Dict[str, Any]:
    return execute_activity_idempotent(
        db,
        execution_id,
        activity_name="activity_send_notification",
        idempotency_key=idempotency_key,
        handler_func=_handle_send_notification,
        recipient_role=recipient_role,
        title=title,
        message=message
    )


def activity_escalate_sla_breach(
    db: Session,
    execution_id: str,
    idempotency_key: str,
    entity_type: str,
    entity_id: str,
    reason: str,
    severity: str = "WARNING",
    role: str = "LCVP_ICX"
) -> Dict[str, Any]:
    return execute_activity_idempotent(
        db,
        execution_id,
        activity_name="activity_escalate_sla_breach",
        idempotency_key=idempotency_key,
        handler_func=_handle_escalate_sla_breach,
        execution_id=execution_id,
        entity_type=entity_type,
        entity_id=entity_id,
        reason=reason,
        severity=severity,
        role=role
    )


def activity_evaluate_checklist_status(
    db: Session,
    execution_id: str,
    idempotency_key: str,
    exchange_id: str
) -> Dict[str, Any]:
    return execute_activity_idempotent(
        db,
        execution_id,
        activity_name="activity_evaluate_checklist_status",
        idempotency_key=idempotency_key,
        handler_func=_handle_evaluate_checklist_status,
        exchange_id=exchange_id
    )
