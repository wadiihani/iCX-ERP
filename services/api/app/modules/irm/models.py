import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Date, ForeignKey, Text, Integer
from sqlalchemy.orm import relationship
from app.core.database import Base


def generate_uuid():
    return str(uuid.uuid4())


class SendingEntity(Base):
    __tablename__ = "sending_entities"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    country = Column(String(100), nullable=False)
    mc_name = Column(String(150), nullable=False)
    lc_name = Column(String(150), nullable=False)
    region = Column(String(50), nullable=False, default="Europe")  # 'MEA', 'Europe', 'Americas', 'Asia-Pacific'
    expa_id = Column(String(50), nullable=True)
    snd_cluster = Column(String(50), nullable=False, default="GROW")  # 'UPSCALE', 'GROW', 'INVEST', 'UNDERSTAND'
    primary_contact_name = Column(String(150), nullable=True)
    primary_contact_email = Column(String(255), nullable=True)
    status = Column(String(50), nullable=False, default="ACTIVE")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    partnerships = relationship("IRMPartnership", back_populates="sending_entity", cascade="all, delete-orphan")


class VisaFeasibilityAssessment(Base):
    __tablename__ = "visa_feasibility_assessments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    country = Column(String(100), nullable=False, unique=True)
    assessment_status = Column(String(50), nullable=False, default="FEASIBLE")  # 'FEASIBLE', 'CONDITIONAL', 'HIGH_RISK', 'RESTRICTED'
    estimated_processing_days = Column(Integer, nullable=False, default=30)
    visa_category = Column(String(100), nullable=False, default="Internship / Volunteer")
    source_citation = Column(String(255), nullable=False)
    effective_date = Column(Date, nullable=False)
    advisory_disclaimer = Column(
        Text,
        nullable=False,
        default="Operational assessment for planning purposes only; does not constitute official legal advice.",
    )
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )


class IRMPartnership(Base):
    __tablename__ = "irm_partnerships"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    sending_entity_id = Column(String(36), ForeignKey("sending_entities.id", ondelete="CASCADE"), nullable=False)
    product_type = Column(String(50), nullable=False, default="ALL")  # 'iGV', 'iGTa', 'iGTe', 'ALL'
    target_pipeline_eps = Column(Integer, nullable=False, default=0)
    delivered_eps = Column(Integer, nullable=False, default=0)
    status = Column(String(50), nullable=False, default="ACTIVE")  # 'PROSPECT', 'ACTIVE', 'STALLED', 'COMPLETED'
    weekly_sync_cadence = Column(String(50), nullable=False, default="Weekly")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    sending_entity = relationship("SendingEntity", back_populates="partnerships")
