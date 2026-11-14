from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.identity.models import User
from app.modules.identity.permissions import get_current_user
from app.modules.applications.schemas import (
    ApplicationCreate,
    ApplicationTransition,
    ApplicationResponse,
    ApplicationScreeningCreate,
    ApplicationScreeningResponse,
    OPInterviewCreate,
    OPInterviewResponse,
    AcceptanceNoteCreate,
    AcceptanceNoteResponse,
    SEPaymentProofCreate,
    SEPaymentProofResponse,
    MatchApprovePayload,
    ReadinessUpdatePayload,
)
from app.modules.applications.service import ApplicationService

router = APIRouter(prefix="/applications", tags=["Applications & Screening Pipeline"])


@router.get("", response_model=List[ApplicationResponse])
def list_applications(
    stage: Optional[str] = None,
    opportunity_id: Optional[str] = None,
    ep_id: Optional[str] = None,
    is_breached: Optional[bool] = None,
    search: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return ApplicationService.get_applications(
        db=db,
        stage=stage,
        opportunity_id=opportunity_id,
        ep_id=ep_id,
        is_breached=is_breached,
        search=search,
        limit=limit,
        offset=offset,
    )


@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def create_application(
    payload: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    app = ApplicationService.create_application(db=db, payload=payload)
    return ApplicationService.get_application_by_id(db=db, app_id=app.id)


@router.get("/{app_id}", response_model=ApplicationResponse)
def get_application(
    app_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return ApplicationService.get_application_by_id(db=db, app_id=app_id)


@router.post("/{app_id}/transition", response_model=ApplicationResponse)
def transition_application(
    app_id: str,
    payload: ApplicationTransition,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ApplicationService.transition_stage(
        db=db, app_id=app_id, target_stage=payload.target_stage, reason=payload.reason
    )
    return ApplicationService.get_application_by_id(db=db, app_id=app_id)


@router.post("/{app_id}/screening", response_model=ApplicationScreeningResponse)
def record_screening(
    app_id: str,
    payload: ApplicationScreeningCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return ApplicationService.record_screening(
        db=db, app_id=app_id, reviewer_id=current_user.id, payload=payload
    )


@router.post("/{app_id}/op-forward", response_model=ApplicationResponse)
def forward_to_op(
    app_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Transition to SENT_TO_OP
    ApplicationService.transition_stage(db=db, app_id=app_id, target_stage="SENT_TO_OP")
    return ApplicationService.get_application_by_id(db=db, app_id=app_id)


@router.post("/{app_id}/op-interview", response_model=OPInterviewResponse)
def record_op_interview(
    app_id: str,
    payload: OPInterviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return ApplicationService.record_op_interview(db=db, app_id=app_id, payload=payload)


@router.post("/{app_id}/acceptance-note", response_model=AcceptanceNoteResponse)
def record_acceptance_note(
    app_id: str,
    payload: AcceptanceNoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return ApplicationService.record_acceptance_note(
        db=db, app_id=app_id, reviewer_id=current_user.id, payload=payload
    )


@router.post("/{app_id}/se-payment", response_model=SEPaymentProofResponse)
def record_se_payment(
    app_id: str,
    payload: SEPaymentProofCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return ApplicationService.record_se_payment(
        db=db, app_id=app_id, reviewer_id=current_user.id, payload=payload
    )


@router.post("/{app_id}/match-approve", response_model=ApplicationResponse)
def approve_match(
    app_id: str,
    payload: MatchApprovePayload = MatchApprovePayload(),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ApplicationService.approve_match(
        db=db, app_id=app_id, slot_id=payload.slot_id, notes=payload.notes
    )
    return ApplicationService.get_application_by_id(db=db, app_id=app_id)


@router.put("/{app_id}/readiness", response_model=ApplicationResponse)
def update_readiness(
    app_id: str,
    payload: ReadinessUpdatePayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ApplicationService.update_operational_readiness(
        db=db, app_id=app_id, new_readiness=payload.operational_readiness, notes=payload.notes
    )
    return ApplicationService.get_application_by_id(db=db, app_id=app_id)
