import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Boolean,
    Text,
    DateTime,
    Date,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class Exchange(Base):
    __tablename__ = "exchanges"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    application_id = Column(String(36), ForeignKey("applications.id", ondelete="RESTRICT"), unique=True, nullable=False, index=True)
    exchange_code = Column(String(100), unique=True, nullable=False, index=True)
    modality = Column(String(50), default="PHYSICAL", nullable=False)  # PHYSICAL, PARTLY_REMOTE, FULLY_REMOTE
    delivery_status = Column(String(50), default="PRE_ARRIVAL", nullable=False, index=True)
    # PRE_ARRIVAL, ARRIVED, REALIZED, FINISHED, COMPLETED, EARLY_FINISH, BROKEN

    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    actual_arrival_date = Column(Date, nullable=True)
    actual_departure_date = Column(Date, nullable=True)

    ips_completed = Column(Boolean, default=False, nullable=False)
    worksite_verified = Column(Boolean, default=False, nullable=False)
    first_day_attended = Column(Boolean, default=False, nullable=False)
    lead_manager_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    application = relationship("Application")
    checklists = relationship("ExchangeChecklist", back_populates="exchange", cascade="all, delete-orphan")
    incidents = relationship("ExchangeIncident", back_populates="exchange", cascade="all, delete-orphan")
    logistics = relationship("ArrivalLogistics", back_populates="exchange", uselist=False, cascade="all, delete-orphan")
    accommodations = relationship("ExchangeAccommodation", back_populates="exchange", cascade="all, delete-orphan")
    standards_fulfillments = relationship("ExchangeStandardsFulfillment", back_populates="exchange", cascade="all, delete-orphan")
    completion = relationship("ExchangeCompletion", back_populates="exchange", uselist=False, cascade="all, delete-orphan")


class ExchangeChecklist(Base):
    __tablename__ = "exchange_checklists"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    exchange_id = Column(String(36), ForeignKey("exchanges.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(String(50), nullable=False)  # PRE_ARRIVAL, ARRIVAL, IPS, WORKSITE, LEGAL, DEPARTURE
    item_key = Column(String(100), nullable=False)
    item_title = Column(String(255), nullable=False)
    is_mandatory = Column(Boolean, default=True, nullable=False)
    is_completed = Column(Boolean, default=False, nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    completed_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    exchange = relationship("Exchange", back_populates="checklists")


class ExchangeIncident(Base):
    __tablename__ = "exchange_incidents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    exchange_id = Column(String(36), ForeignKey("exchanges.id", ondelete="CASCADE"), nullable=False, index=True)
    incident_type = Column(String(50), nullable=False)  # HEALTH, SAFETY, HARASSMENT, LEGAL, CONTRACT_BREACH, BREAK_REQUEST
    severity = Column(String(50), default="MEDIUM", nullable=False)  # LOW, MEDIUM, HIGH, CRITICAL
    description = Column(Text, nullable=False)
    reported_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    status = Column(String(50), default="OPEN", nullable=False)  # OPEN, INVESTIGATING, ESCALATED, RESOLVED
    resolution_notes = Column(Text, nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    exchange = relationship("Exchange", back_populates="incidents")
