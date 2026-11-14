import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Boolean,
    Text,
    DateTime,
    Date,
    Integer,
    ForeignKey,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class ExchangeStandardsFulfillment(Base):
    __tablename__ = "exchange_standards_fulfillment"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    exchange_id = Column(String(36), ForeignKey("exchanges.id", ondelete="CASCADE"), nullable=False, index=True)
    standard_number = Column(Integer, nullable=False)  # 1 to 18
    standard_name = Column(String(150), nullable=False)
    is_mandatory = Column(Boolean, default=True, nullable=False)
    is_fulfilled = Column(Boolean, default=False, nullable=False)
    fulfillment_date = Column(Date, nullable=True)
    verified_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    evidence_doc_url = Column(String(500), nullable=True)
    verification_notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        UniqueConstraint("exchange_id", "standard_number", name="uq_exchange_standard"),
    )

    exchange = relationship("Exchange", back_populates="standards_fulfillments")


class PartnerStandardsEvaluation(Base):
    __tablename__ = "partner_standards_evaluations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    exchange_id = Column(String(36), ForeignKey("exchanges.id", ondelete="CASCADE"), nullable=False, index=True)
    standard_number = Column(Integer, nullable=False)  # 1 to 10
    standard_name = Column(String(150), nullable=False)
    is_fulfilled = Column(Boolean, default=False, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        UniqueConstraint("exchange_id", "standard_number", name="uq_exchange_partner_standard"),
    )


class ExchangeCompletion(Base):
    __tablename__ = "exchange_completions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    exchange_id = Column(String(36), ForeignKey("exchanges.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    total_standards_fulfilled = Column(Integer, default=0, nullable=False)
    mandatory_standards_fulfilled = Column(Integer, default=0, nullable=False)
    is_eligible_for_completion = Column(Boolean, default=False, nullable=False)
    completion_status = Column(String(50), default="PENDING", nullable=False)  # PENDING, APPROVED, REJECTED
    calculated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    approved_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    rejection_reason = Column(Text, nullable=True)

    exchange = relationship("Exchange", back_populates="completion")
