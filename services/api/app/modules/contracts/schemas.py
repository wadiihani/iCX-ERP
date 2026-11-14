from datetime import datetime, date
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict, Field


VALID_CONTRACT_STATUSES = ["DRAFT", "UNDER_REVIEW", "SIGNED", "ACTIVE", "EXPIRED", "TERMINATED"]
VALID_RISK_CATEGORIES = ["LEGAL", "FINANCIAL", "REPUTATIONAL", "OPERATIONAL", "SAFETY"]
VALID_RISK_STATUSES = ["OPEN", "MITIGATED", "ACCEPTED", "CLOSED"]


class ContractBase(BaseModel):
    contract_number: str = Field(..., min_length=3, max_length=100)
    organization_id: str
    lead_id: Optional[str] = None
    title: str = Field(..., min_length=3, max_length=255)
    product_types: List[str] = Field(default_factory=list)
    start_date: date
    end_date: date
    total_slots: int = Field(default=1, ge=1)
    financial_terms: Dict[str, Any] = Field(default_factory=dict)
    special_clauses: Optional[str] = None
    document_url: Optional[str] = None
    iac_audit_ready: bool = False
    iac_notes: Optional[str] = None


class ContractCreate(ContractBase):
    pass


class ContractUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    status: Optional[str] = Field(None, pattern="^(DRAFT|UNDER_REVIEW|SIGNED|ACTIVE|EXPIRED|TERMINATED)$")
    product_types: Optional[List[str]] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    total_slots: Optional[int] = Field(None, ge=1)
    financial_terms: Optional[Dict[str, Any]] = None
    special_clauses: Optional[str] = None
    document_url: Optional[str] = None
    iac_audit_ready: Optional[bool] = None
    iac_notes: Optional[str] = None


class ContractSignRequest(BaseModel):
    signed_by_partner: str = Field(..., min_length=2, max_length=255)
    signed_at: Optional[datetime] = None


class ContractResponse(ContractBase):
    id: str
    status: str
    version: int
    signed_at: Optional[datetime] = None
    signed_by_partner: Optional[str] = None
    signed_by_aiesec_user_id: Optional[str] = None
    days_to_expiry: Optional[int] = None
    is_expiring_soon: bool = False
    is_expired: bool = False
    organization_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class OperationalRiskBase(BaseModel):
    organization_id: Optional[str] = None
    contract_id: Optional[str] = None
    title: str = Field(..., min_length=3, max_length=255)
    category: str = Field("OPERATIONAL", pattern="^(LEGAL|FINANCIAL|REPUTATIONAL|OPERATIONAL|SAFETY)$")
    probability: int = Field(..., ge=1, le=5)
    impact: int = Field(..., ge=1, le=5)
    mitigation_plan: str = Field(..., min_length=5)
    owner_id: Optional[str] = None
    status: str = Field("OPEN", pattern="^(OPEN|MITIGATED|ACCEPTED|CLOSED)$")


class OperationalRiskCreate(OperationalRiskBase):
    pass


class OperationalRiskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    category: Optional[str] = Field(None, pattern="^(LEGAL|FINANCIAL|REPUTATIONAL|OPERATIONAL|SAFETY)$")
    probability: Optional[int] = Field(None, ge=1, le=5)
    impact: Optional[int] = Field(None, ge=1, le=5)
    mitigation_plan: Optional[str] = Field(None, min_length=5)
    owner_id: Optional[str] = None
    status: Optional[str] = Field(None, pattern="^(OPEN|MITIGATED|ACCEPTED|CLOSED)$")


class OperationalRiskResponse(OperationalRiskBase):
    id: str
    score: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
