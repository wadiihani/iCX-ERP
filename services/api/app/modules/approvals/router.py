from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.modules.identity.models import User
from app.modules.identity.permissions import get_current_user, require_role
from app.modules.approvals.schemas import ApprovalProposalResponse, ApprovalReviewRequest
from app.modules.approvals import service

router = APIRouter(prefix="/approvals", tags=["Human Approval Center"])


@router.get("", response_model=List[ApprovalProposalResponse])
def list_approval_proposals(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return service.get_proposals(db, status)


@router.put("/{proposal_id}/review", response_model=ApprovalProposalResponse)
def review_proposal(
    proposal_id: str,
    payload: ApprovalReviewRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["LCP_ADMIN", "LCVP_ICX", "LCVP_FINANCE", "ADMIN", "LCP"]))
):
    return service.review_proposal(db, proposal_id, payload, user_id=current_user.id)
