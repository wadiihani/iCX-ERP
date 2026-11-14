from sqlalchemy import Column, String, DateTime, ForeignKey, Text, JSON
from datetime import datetime, timezone
import uuid

from app.core.database import Base


class ApprovalProposal(Base):
    __tablename__ = "approval_proposals"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    run_id = Column(String(36), ForeignKey("ai_agent_runs.id"), nullable=True)
    proposed_by = Column(String(36), ForeignKey("users.id"), nullable=False)
    agent_name = Column(String(50), nullable=False)
    proposal_type = Column(String(50), nullable=False)  # 'STATUS_MUTATION', 'FEE_WAIVER', 'EMAIL_DISPATCH', 'EXCHANGE_COMPLETION', 'STANDARD_OVERRIDE'
    target_entity_type = Column(String(50), nullable=False)  # 'APPLICATION', 'OBLIGATION', 'EXCHANGE', 'CONTRACT'
    target_entity_id = Column(String(36), nullable=False)
    proposed_action = Column(String(50), nullable=False)
    proposed_payload = Column(JSON, nullable=False, default=dict)
    rationale = Column(Text, nullable=False)
    status = Column(String(25), nullable=False, default="PENDING_HUMAN_REVIEW")  # 'PENDING_HUMAN_REVIEW', 'APPROVED_EXECUTED', 'REJECTED'
    reviewed_by = Column(String(36), ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    rejection_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
