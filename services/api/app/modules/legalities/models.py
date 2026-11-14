from sqlalchemy import Column, String, Integer, Boolean, DateTime, Date, ForeignKey, Text
from datetime import datetime, timezone
import uuid

from app.core.database import Base


class RiskRegisterEntry(Base):
    __tablename__ = "risk_register_entries"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    risk_category = Column(String(30), nullable=False)  # 'FINANCIAL', 'LEGAL', 'HEALTH_SAFETY', 'PARTNER_RELATIONS', 'REPUTATION'
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    probability = Column(Integer, nullable=False)  # 1-5
    impact = Column(Integer, nullable=False)       # 1-5
    severity_score = Column(Integer, nullable=False)  # probability * impact
    mitigation_plan = Column(Text, nullable=False)
    contingency_plan = Column(Text, nullable=True)
    owner_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    status = Column(String(20), nullable=False, default="IDENTIFIED")  # 'IDENTIFIED', 'MITIGATING', 'MONITORED', 'CLOSED'
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))


class IACAuditItem(Base):
    __tablename__ = "iac_audit_items"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    audit_cycle = Column(String(50), nullable=False)  # e.g. "2026-Q1-AUDIT"
    check_item = Column(String(150), nullable=False)
    category = Column(String(30), nullable=False)     # 'CONTRACTS', 'FINANCE', 'HEALTH_SAFETY', 'STANDARDS', 'LEGAL'
    description = Column(Text, nullable=False)
    is_mandatory = Column(Boolean, nullable=False, default=True)
    compliance_status = Column(String(25), nullable=False, default="PENDING_AUDIT")  # 'PENDING_AUDIT', 'VERIFIED', 'FLAGGED_NON_COMPLIANT'
    evidence_url = Column(Text, nullable=True)
    audited_by = Column(String(36), ForeignKey("users.id"), nullable=True)
    audited_at = Column(DateTime, nullable=True)
    findings = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))


class LegalDocument(Base):
    __tablename__ = "legal_documents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_category = Column(String(30), nullable=False)  # 'CONTRACT', 'AGREEMENT_MOU', 'INSURANCE', 'VISA_LETTER', 'EMERGENCY_CONTACT_FORM'
    title = Column(String(150), nullable=False)
    entity_id = Column(String(36), nullable=True)
    file_url = Column(Text, nullable=False)
    valid_from = Column(Date, nullable=False)
    valid_until = Column(Date, nullable=True)
    is_signed = Column(Boolean, nullable=False, default=False)
    uploaded_by = Column(String(36), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
