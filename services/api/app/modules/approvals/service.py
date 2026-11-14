from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime, timezone
from typing import List, Optional

from app.modules.approvals.models import ApprovalProposal
from app.modules.approvals.schemas import ApprovalReviewRequest
from app.modules.applications.models import Application
from app.modules.finance.models import PaymentObligation


def get_proposals(db: Session, status_filter: Optional[str] = None) -> List[ApprovalProposal]:
    q = db.query(ApprovalProposal)
    if status_filter:
        q = q.filter(ApprovalProposal.status == status_filter)
    return q.order_by(ApprovalProposal.created_at.desc()).all()


def review_proposal(
    db: Session,
    proposal_id: str,
    review: ApprovalReviewRequest,
    user_id: str
) -> ApprovalProposal:
    proposal = db.query(ApprovalProposal).filter(ApprovalProposal.id == proposal_id).first()
    if not proposal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Approval proposal '{proposal_id}' not found"
        )

    if proposal.status != "PENDING_HUMAN_REVIEW":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Proposal is already in status '{proposal.status}'"
        )

    proposal.reviewed_by = user_id
    proposal.reviewed_at = datetime.now(timezone.utc)

    if review.decision == "APPROVED":
        proposal.status = "APPROVED_EXECUTED"

        # Execute the domain mutation
        if proposal.target_entity_type == "APPLICATION":
            app = db.query(Application).filter(Application.id == proposal.target_entity_id).first()
            if app:
                next_stage = proposal.proposed_payload.get("next_stage")
                if next_stage:
                    app.current_stage = next_stage
                    app.updated_at = datetime.now(timezone.utc)

        elif proposal.target_entity_type == "OBLIGATION":
            ob = db.query(PaymentObligation).filter(PaymentObligation.id == proposal.target_entity_id).first()
            if ob and proposal.proposed_action == "WAIVE_FEES":
                ob.status = "WAIVED"
                ob.updated_at = datetime.now(timezone.utc)

    else:
        proposal.status = "REJECTED"
        proposal.rejection_reason = review.rejection_reason or "Rejected by human executive officer."

    db.commit()
    db.refresh(proposal)
    return proposal
