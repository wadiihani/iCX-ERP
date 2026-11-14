import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Date, ForeignKey, Text, Integer, Numeric, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


def generate_uuid():
    return str(uuid.uuid4())


class Opportunity(Base):
    __tablename__ = "opportunities"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    opportunity_code = Column(String(100), nullable=False, unique=True)
    contract_id = Column(String(36), ForeignKey("contracts.id", ondelete="RESTRICT"), nullable=False)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="RESTRICT"), nullable=False)
    title = Column(String(255), nullable=False)
    product_type = Column(String(50), nullable=False)  # 'iGV', 'iGTa', 'iGTe'
    modality = Column(String(50), nullable=False, default="PHYSICAL")  # 'PHYSICAL', 'PARTLY_REMOTE', 'FULLY_REMOTE'
    status = Column(String(50), nullable=False, default="DRAFT")  # 'DRAFT', 'INTERNAL_REVIEW', 'VERIFIED', 'PUBLISHED', 'CLOSED'
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    duration_weeks = Column(Integer, nullable=False)
    working_hours_per_week = Column(Integer, nullable=False)
    location = Column(String(255), nullable=False, default="Rabat, Morocco")
    description = Column(Text, nullable=False)
    role_description = Column(Text, nullable=False)
    required_skills = Column(JSON, nullable=False, default=list)
    required_languages = Column(JSON, nullable=False, default=list)
    openings_capacity = Column(Integer, nullable=False, default=1)
    filled_openings = Column(Integer, nullable=False, default=0)
    line_manager_name = Column(String(150), nullable=True)
    line_manager_contact = Column(String(150), nullable=True)
    publication_checklist = Column(JSON, nullable=False, default=dict)
    is_published = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    contract = relationship("Contract")
    organization = relationship("Organization")
    igv_details = relationship("OpportunityIGVDetails", back_populates="opportunity", uselist=False, cascade="all, delete-orphan")
    igt_details = relationship("OpportunityIGTDetails", back_populates="opportunity", uselist=False, cascade="all, delete-orphan")
    slots = relationship("OpportunitySlot", back_populates="opportunity", cascade="all, delete-orphan")


class OpportunityIGVDetails(Base):
    __tablename__ = "opportunity_igv_details"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    opportunity_id = Column(String(36), ForeignKey("opportunities.id", ondelete="CASCADE"), nullable=False, unique=True)
    sdg_number = Column(Integer, nullable=False)  # 1 to 17
    sdg_target = Column(String(100), nullable=True)
    global_project_name = Column(String(150), nullable=False)
    housing_provided = Column(Boolean, nullable=False, default=True)
    food_provided = Column(Boolean, nullable=False, default=False)
    transport_provided = Column(Boolean, nullable=False, default=False)
    project_fee_amount = Column(Numeric(10, 2), nullable=False, default=0.00)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    opportunity = relationship("Opportunity", back_populates="igv_details")


class OpportunityIGTDetails(Base):
    __tablename__ = "opportunity_igt_details"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    opportunity_id = Column(String(36), ForeignKey("opportunities.id", ondelete="CASCADE"), nullable=False, unique=True)
    work_field = Column(String(100), nullable=False)  # 'BA', 'BD', 'MKT', 'IT', 'ENG', 'FIN', 'Other'
    sub_field = Column(String(150), nullable=True)
    duration_tier = Column(String(50), nullable=False, default="SHORT")  # 'SHORT', 'MEDIUM', 'LONG'
    monthly_salary = Column(Numeric(10, 2), nullable=False, default=0.00)
    currency = Column(String(20), nullable=False, default="MAD")
    salary_covers_living_costs = Column(Boolean, nullable=False, default=False)
    accommodation_covered = Column(Boolean, nullable=False, default=False)
    is_teaching_role = Column(Boolean, nullable=False, default=False)
    accredited_institution = Column(Boolean, nullable=False, default=False)
    accreditation_details = Column(Text, nullable=True)
    icb_audit_status = Column(String(50), nullable=False, default="PENDING")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    opportunity = relationship("Opportunity", back_populates="igt_details")


class OpportunitySlot(Base):
    __tablename__ = "opportunity_slots"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    opportunity_id = Column(String(36), ForeignKey("opportunities.id", ondelete="CASCADE"), nullable=False)
    slot_number = Column(String(100), nullable=False, unique=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    status = Column(String(50), nullable=False, default="OPEN")  # 'OPEN', 'RESERVED', 'FILLED', 'CANCELLED'
    current_application_id = Column(String(36), nullable=True)
    lock_version = Column(Integer, nullable=False, default=1)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    opportunity = relationship("Opportunity", back_populates="slots")
