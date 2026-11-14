from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date


class RiskRegisterCreate(BaseModel):
    risk_category: str = Field(..., pattern="^(FINANCIAL|LEGAL|HEALTH_SAFETY|PARTNER_RELATIONS|REPUTATION)$")
    title: str
    description: str
    probability: int = Field(..., ge=1, le=5)
    impact: int = Field(..., ge=1, le=5)
    mitigation_plan: str
    contingency_plan: Optional[str] = None
    owner_id: Optional[str] = None


class RiskRegisterUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    probability: Optional[int] = Field(None, ge=1, le=5)
    impact: Optional[int] = Field(None, ge=1, le=5)
    mitigation_plan: Optional[str] = None
    contingency_plan: Optional[str] = None
    status: Optional[str] = Field(None, pattern="^(IDENTIFIED|MITIGATING|MONITORED|CLOSED)$")


class RiskRegisterResponse(BaseModel):
    id: str
    risk_category: str
    title: str
    description: str
    probability: int
    impact: int
    severity_score: int
    mitigation_plan: str
    contingency_plan: Optional[str] = None
    owner_id: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class IACAuditItemCreate(BaseModel):
    audit_cycle: str
    check_item: str
    category: str = Field(..., pattern="^(CONTRACTS|FINANCE|HEALTH_SAFETY|STANDARDS|LEGAL)$")
    description: str
    is_mandatory: bool = True
    evidence_url: Optional[str] = None


class IACAuditItemUpdate(BaseModel):
    compliance_status: str = Field(..., pattern="^(PENDING_AUDIT|VERIFIED|FLAGGED_NON_COMPLIANT)$")
    evidence_url: Optional[str] = None
    findings: Optional[str] = None


class IACAuditItemResponse(BaseModel):
    id: str
    audit_cycle: str
    check_item: str
    category: str
    description: str
    is_mandatory: bool
    compliance_status: str
    evidence_url: Optional[str] = None
    audited_by: Optional[str] = None
    audited_at: Optional[datetime] = None
    findings: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class LegalDocumentCreate(BaseModel):
    document_category: str = Field(..., pattern="^(CONTRACT|AGREEMENT_MOU|INSURANCE|VISA_LETTER|EMERGENCY_CONTACT_FORM)$")
    title: str
    entity_id: Optional[str] = None
    file_url: str
    valid_from: date
    valid_until: Optional[date] = None
    is_signed: bool = False


class LegalDocumentResponse(BaseModel):
    id: str
    document_category: str
    title: str
    entity_id: Optional[str] = None
    file_url: str
    valid_from: date
    valid_until: Optional[date] = None
    is_signed: bool
    uploaded_by: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
