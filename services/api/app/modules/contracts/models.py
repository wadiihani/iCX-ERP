import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Date, ForeignKey, Text, Integer, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


def generate_uuid():
    return str(uuid.uuid4())


class Contract(Base):
    __tablename__ = "contracts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    contract_number = Column(String(100), nullable=False, unique=True)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    lead_id = Column(String(36), ForeignKey("prm_leads.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), nullable=False)
    status = Column(String(50), nullable=False, default="DRAFT")  # DRAFT, UNDER_REVIEW, SIGNED, ACTIVE, EXPIRED, TERMINATED
    version = Column(Integer, nullable=False, default=1)
    product_types = Column(JSON, nullable=False, default=list)  # ["iGTa", "iGV", "iGTe"]
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    total_slots = Column(Integer, nullable=False, default=1)
    financial_terms = Column(JSON, nullable=False, default=dict)
    special_clauses = Column(Text, nullable=True)
    document_url = Column(String(500), nullable=True)
    signed_at = Column(DateTime(timezone=True), nullable=True)
    signed_by_partner = Column(String(255), nullable=True)
    signed_by_aiesec_user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    iac_audit_ready = Column(Boolean, nullable=False, default=False)
    iac_notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    organization = relationship("Organization", back_populates="contracts")
    lead = relationship("PRMLead", back_populates="contracts")
    signed_by_aiesec = relationship("User", foreign_keys=[signed_by_aiesec_user_id])
    risks = relationship("OperationalRisk", back_populates="contract")


class OperationalRisk(Base):
    __tablename__ = "operational_risks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=True)
    contract_id = Column(String(36), ForeignKey("contracts.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), nullable=False)
    category = Column(String(50), nullable=False, default="OPERATIONAL")  # LEGAL, FINANCIAL, REPUTATIONAL, OPERATIONAL, SAFETY
    probability = Column(Integer, nullable=False, default=1)  # 1 to 5
    impact = Column(Integer, nullable=False, default=1)  # 1 to 5
    score = Column(Integer, nullable=False, default=1)  # probability * impact
    mitigation_plan = Column(Text, nullable=False)
    owner_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    status = Column(String(50), nullable=False, default="OPEN")  # OPEN, MITIGATED, ACCEPTED, CLOSED
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    contract = relationship("Contract", back_populates="risks")
    owner = relationship("User", foreign_keys=[owner_id])
