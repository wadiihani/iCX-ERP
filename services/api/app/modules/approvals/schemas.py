from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime


class ApprovalReviewRequest(BaseModel):
    decision: str = Field(..., pattern="^(APPROVED|REJECTED)$")
    rejection_reason: Optional[str] = None
    review_notes: Optional[str] = None


class ApprovalProposalResponse(BaseModel):
    id: str
    run_id: Optional[str] = None
    proposed_by: str
    agent_name: str
    proposal_type: str
    target_entity_type: str
    target_entity_id: str
    proposed_action: str
    proposed_payload: Dict[str, Any]
    rationale: str
    status: str
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
