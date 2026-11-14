import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Integer, Numeric, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


def generate_uuid():
    return str(uuid.uuid4())


class PRMLead(Base):
    __tablename__ = "prm_leads"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    stage = Column(String(50), nullable=False, default="SUSPECT")
    # Stages: SUSPECT, QUALIFIED, CONTACTED, MEETING_SCHEDULED, MEETING_HELD, PROPOSAL, NEGOTIATION, CONTRACT_SIGNED, ACTIVE_ACCOUNT, UNQUALIFIED, NO_RESPONSE, ON_HOLD, LOST
    source = Column(String(100), nullable=False, default="Cold Outreach")
    territory = Column(String(100), nullable=False, default="Rabat")
    owner_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    team_id = Column(String(36), ForeignKey("teams.id", ondelete="SET NULL"), nullable=True)

    # BANT Framework
    bant_budget = Column(String(50), nullable=False, default="UNKNOWN")  # UNKNOWN, NO_BUDGET, ADEQUATE, HIGH
    bant_budget_notes = Column(Text, nullable=True)
    bant_authority = Column(String(50), nullable=False, default="UNKNOWN")  # UNKNOWN, NO_DECISION_POWER, INFLUENCER, DECISION_MAKER
    bant_authority_notes = Column(Text, nullable=True)
    bant_need = Column(String(50), nullable=False, default="UNKNOWN")  # UNKNOWN, LOW, CLEAR_NEED, CRITICAL_PAIN
    bant_need_notes = Column(Text, nullable=True)
    bant_timeline = Column(String(50), nullable=False, default="UNKNOWN")  # UNKNOWN, GREATER_6_MONTHS, WITHIN_3_6_MONTHS, IMMEDIATE_1_3_MONTHS
    bant_timeline_notes = Column(Text, nullable=True)
    bant_score = Column(Integer, nullable=False, default=0)
    is_qualified = Column(Boolean, nullable=False, default=False)

    estimated_value = Column(Numeric(12, 2), nullable=False, default=0.00)
    target_products = Column(JSON, nullable=False, default=list)  # ["iGV", "iGTa", "iGTe"]
    target_openings = Column(Integer, nullable=False, default=1)
    lost_reason = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    organization = relationship("Organization", back_populates="leads")
    owner = relationship("User", foreign_keys=[owner_id])
    team = relationship("Team", foreign_keys=[team_id])
    activities = relationship("PRMActivity", back_populates="lead", cascade="all, delete-orphan")
    contracts = relationship("Contract", back_populates="lead")


class PRMActivity(Base):
    __tablename__ = "prm_activities"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    lead_id = Column(String(36), ForeignKey("prm_leads.id", ondelete="SET NULL"), nullable=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    activity_type = Column(String(50), nullable=False)  # CALL, MEETING, EMAIL, NOTE, FOLLOW_UP, STATUS_CHANGE
    summary = Column(String(255), nullable=False)
    details = Column(Text, nullable=True)
    occurred_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    next_step = Column(Text, nullable=True)
    next_step_due = Column(DateTime(timezone=True), nullable=True)
    is_completed = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    lead = relationship("PRMLead", back_populates="activities")
    user = relationship("User", foreign_keys=[user_id])
