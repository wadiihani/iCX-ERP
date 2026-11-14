import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Boolean,
    Text,
    DateTime,
    Date,
    Numeric,
    Integer,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class Application(Base):
    __tablename__ = "applications"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    application_code = Column(String(100), unique=True, nullable=False, index=True)
    expa_application_id = Column(String(50), unique=True, nullable=True, index=True)
    ep_id = Column(String(36), ForeignKey("exchange_participants.id", ondelete="RESTRICT"), nullable=False, index=True)
    opportunity_id = Column(String(36), ForeignKey("opportunities.id", ondelete="RESTRICT"), nullable=False, index=True)
    slot_id = Column(String(36), ForeignKey("opportunity_slots.id", ondelete="SET NULL"), nullable=True, index=True)

    # 9 Screening Stages
    current_stage = Column(String(50), default="APPLIED", nullable=False, index=True)
    # Dual Status Decoupling
    official_expa_status = Column(String(50), default="APP", nullable=False, index=True)
    operational_readiness = Column(String(50), default="DRAFT", nullable=False)

    assigned_manager_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    first_contact_deadline = Column(DateTime(timezone=True), nullable=True)
    first_contacted_at = Column(DateTime(timezone=True), nullable=True)
    op_feedback_deadline = Column(DateTime(timezone=True), nullable=True)

    applied_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    accepted_at = Column(DateTime(timezone=True), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    rejection_reason = Column(String(255), nullable=True)
    withdrawal_reason = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    ep = relationship("ExchangeParticipant", back_populates="applications")
    opportunity = relationship("Opportunity")
    slot = relationship("OpportunitySlot")
    screenings = relationship("ApplicationScreening", back_populates="application", cascade="all, delete-orphan")
    op_interviews = relationship("OPInterview", back_populates="application", cascade="all, delete-orphan")
    acceptance_notes = relationship("AcceptanceNote", back_populates="application", cascade="all, delete-orphan")
    se_payment_proofs = relationship("SEPaymentProof", back_populates="application", cascade="all, delete-orphan")


class ApplicationScreening(Base):
    __tablename__ = "application_screenings"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    application_id = Column(String(36), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False, index=True)
    reviewer_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    language_proficiency = Column(String(50), default="INTERMEDIATE", nullable=False)
    background_check_passed = Column(Boolean, default=True, nullable=False)
    cultural_fit_rating = Column(Integer, default=3, nullable=False)
    skills_match_rating = Column(Integer, default=3, nullable=False)
    motivation_notes = Column(Text, nullable=True)
    recommendation = Column(String(50), default="RECOMMENDED", nullable=False)  # RECOMMENDED, NEUTRAL, REJECTED
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    application = relationship("Application", back_populates="screenings")


class OPInterview(Base):
    __tablename__ = "op_interviews"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    application_id = Column(String(36), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False, index=True)
    interviewer_name = Column(String(150), nullable=False)
    interview_type = Column(String(50), default="ONLINE", nullable=False)  # ONLINE, IN_PERSON
    scheduled_at = Column(DateTime(timezone=True), nullable=False)
    conducted_at = Column(DateTime(timezone=True), nullable=True)
    op_decision = Column(String(50), default="PENDING", nullable=False)  # PENDING, ACCEPTED, REJECTED, SECOND_ROUND
    feedback_notes = Column(Text, nullable=True)
    questions_asked = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    application = relationship("Application", back_populates="op_interviews")


class AcceptanceNote(Base):
    __tablename__ = "acceptance_notes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    application_id = Column(String(36), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False, index=True)
    document_url = Column(String(500), nullable=False)
    ep_signature_date = Column(Date, nullable=False)
    partner_signature_date = Column(Date, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    verified_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    verification_notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    application = relationship("Application", back_populates="acceptance_notes")


class SEPaymentProof(Base):
    __tablename__ = "se_payment_proofs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    application_id = Column(String(36), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False, index=True)
    sending_entity_id = Column(String(36), ForeignKey("sending_entities.id", ondelete="SET NULL"), nullable=True)
    payment_reference = Column(String(100), nullable=False)
    amount_eur = Column(Numeric(10, 2), default=0.00, nullable=False)
    proof_document_url = Column(String(500), nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    verified_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    application = relationship("Application", back_populates="se_payment_proofs")
