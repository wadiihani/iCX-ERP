from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.identity.models import User
from app.modules.identity.permissions import get_current_user, require_role
from app.modules.cxp.schemas import (
    StandardFulfillmentUpdate,
    StandardFulfillmentResponse,
    CompletionEvaluationReport,
    CompletionApprovePayload,
)
from app.modules.cxp.service import CXPService

router = APIRouter(prefix="/cxp", tags=["Customer Experience & Standards (18)"])


@router.get("/exchanges/{exchange_id}/standards", response_model=List[StandardFulfillmentResponse])
def get_standards(
    exchange_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return CXPService.get_standards(db=db, exchange_id=exchange_id)


@router.put("/exchanges/{exchange_id}/standards/{standard_number}", response_model=StandardFulfillmentResponse)
def update_standard_fulfillment(
    exchange_id: str,
    standard_number: int,
    payload: StandardFulfillmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return CXPService.update_standard(
        db=db,
        exchange_id=exchange_id,
        standard_number=standard_number,
        reviewer_id=current_user.id,
        payload=payload,
    )


@router.get("/exchanges/{exchange_id}/completion/evaluation", response_model=CompletionEvaluationReport)
def evaluate_completion(
    exchange_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return CXPService.evaluate_completion(db=db, exchange_id=exchange_id)


@router.post("/exchanges/{exchange_id}/completion/approve", status_code=status.HTTP_200_OK)
def approve_completion(
    exchange_id: str,
    payload: CompletionApprovePayload = CompletionApprovePayload(),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["LCP_ADMIN", "LCVP_ICX", "TEAM_LEADER"])),
):
    comp = CXPService.approve_completion(
        db=db,
        exchange_id=exchange_id,
        user_id=current_user.id,
        notes=payload.notes,
    )
    return {
        "status": "APPROVED",
        "exchange_id": exchange_id,
        "completion_status": comp.completion_status,
        "total_standards_fulfilled": comp.total_standards_fulfilled,
        "mandatory_standards_fulfilled": comp.mandatory_standards_fulfilled,
        "approved_at": comp.approved_at,
    }
