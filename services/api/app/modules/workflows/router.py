from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.identity.permissions import get_current_user, require_role
from app.modules.workflows.service import WorkflowService
from app.modules.workflows.schemas import (
    WorkflowExecutionResponse,
    EscalationResponse,
    EscalationResolveRequest
)

router = APIRouter(prefix="/workflows", tags=["Temporal Workflows & SLA Engine"])


@router.post("/sla/first-contact/{app_id}", response_model=WorkflowExecutionResponse)
def trigger_first_contact_sla(
    app_id: str,
    sla_hours: int = Query(48, ge=1, le=168),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return WorkflowService.start_first_contact_sla(db, app_id, sla_hours)


@router.post("/sla/first-contact/evaluate/{execution_id}")
def evaluate_first_contact_sla(
    execution_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return WorkflowService.evaluate_first_contact_sla(db, execution_id)


@router.post("/sla/op-review/{app_id}", response_model=WorkflowExecutionResponse)
def trigger_op_review_sla(
    app_id: str,
    sla_hours: int = Query(72, ge=1, le=168),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return WorkflowService.start_op_review_sla(db, app_id, sla_hours)


@router.post("/sla/op-review/evaluate/{execution_id}")
def evaluate_op_review_sla(
    execution_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return WorkflowService.evaluate_op_review_sla(db, execution_id)


@router.post("/pre-arrival/{exchange_id}", response_model=WorkflowExecutionResponse)
def trigger_pre_arrival_countdown(
    exchange_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return WorkflowService.start_pre_arrival_countdown(db, exchange_id)


@router.post("/pre-arrival/cascade/{execution_id}")
def trigger_pre_arrival_cascade(
    execution_id: str,
    days_before: int = Query(7, ge=1, le=30),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return WorkflowService.trigger_pre_arrival_cascade(db, execution_id, days_before)


@router.get("/executions", response_model=List[WorkflowExecutionResponse])
def list_workflow_executions(
    status: Optional[str] = None,
    workflow_type: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return WorkflowService.list_executions(db, status, workflow_type, limit)


@router.get("/escalations", response_model=List[EscalationResponse])
def list_operational_escalations(
    resolved: Optional[bool] = None,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return WorkflowService.list_escalations(db, resolved, limit)


@router.post("/escalations/{id}/resolve", response_model=EscalationResponse)
def resolve_operational_escalation(
    id: str,
    req: EscalationResolveRequest,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["LCP_ADMIN", "LCVP_ICX", "TEAM_LEADER"]))
):
    try:
        return WorkflowService.resolve_escalation(db, id, req.resolution_notes)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
