from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict, Field
from decimal import Decimal


VALID_STAGES = [
    "SUSPECT",
    "QUALIFIED",
    "CONTACTED",
    "MEETING_SCHEDULED",
    "MEETING_HELD",
    "PROPOSAL",
    "NEGOTIATION",
    "CONTRACT_SIGNED",
    "ACTIVE_ACCOUNT",
    "UNQUALIFIED",
    "NO_RESPONSE",
    "ON_HOLD",
    "LOST",
]

BANT_BUDGET_SCORES = {
    "UNKNOWN": 0,
    "NO_BUDGET": 0,
    "ADEQUATE": 25,
    "HIGH": 25,
}

BANT_AUTHORITY_SCORES = {
    "UNKNOWN": 0,
    "NO_DECISION_POWER": 0,
    "INFLUENCER": 15,
    "DECISION_MAKER": 25,
}

BANT_NEED_SCORES = {
    "UNKNOWN": 0,
    "LOW": 5,
    "CLEAR_NEED": 20,
    "CRITICAL_PAIN": 25,
}

BANT_TIMELINE_SCORES = {
    "UNKNOWN": 0,
    "GREATER_6_MONTHS": 10,
    "WITHIN_3_6_MONTHS": 20,
    "IMMEDIATE_1_3_MONTHS": 25,
}


class BANTUpdate(BaseModel):
    bant_budget: Optional[str] = Field(None, pattern="^(UNKNOWN|NO_BUDGET|ADEQUATE|HIGH)$")
    bant_budget_notes: Optional[str] = None
    bant_authority: Optional[str] = Field(None, pattern="^(UNKNOWN|NO_DECISION_POWER|INFLUENCER|DECISION_MAKER)$")
    bant_authority_notes: Optional[str] = None
    bant_need: Optional[str] = Field(None, pattern="^(UNKNOWN|LOW|CLEAR_NEED|CRITICAL_PAIN)$")
    bant_need_notes: Optional[str] = None
    bant_timeline: Optional[str] = Field(None, pattern="^(UNKNOWN|GREATER_6_MONTHS|WITHIN_3_6_MONTHS|IMMEDIATE_1_3_MONTHS)$")
    bant_timeline_notes: Optional[str] = None


class ActivityCreate(BaseModel):
    lead_id: Optional[str] = None
    organization_id: str
    activity_type: str = Field(..., pattern="^(CALL|MEETING|EMAIL|NOTE|FOLLOW_UP|STATUS_CHANGE)$")
    summary: str = Field(..., min_length=2, max_length=255)
    details: Optional[str] = None
    occurred_at: Optional[datetime] = None
    next_step: Optional[str] = None
    next_step_due: Optional[datetime] = None


class ActivityResponse(BaseModel):
    id: str
    organization_id: str
    lead_id: Optional[str] = None
    user_id: str
    activity_type: str
    summary: str
    details: Optional[str] = None
    occurred_at: datetime
    next_step: Optional[str] = None
    next_step_due: Optional[datetime] = None
    is_completed: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LeadBase(BaseModel):
    organization_id: str
    title: str = Field(..., min_length=2, max_length=255)
    stage: str = Field("SUSPECT", max_length=50)
    source: str = Field("Cold Outreach", max_length=100)
    territory: str = Field("Rabat", max_length=100)
    owner_id: Optional[str] = None
    team_id: Optional[str] = None
    estimated_value: Decimal = Field(default=Decimal("0.00"), ge=0)
    target_products: List[str] = Field(default_factory=list)
    target_openings: int = Field(default=1, ge=1)


class LeadCreate(LeadBase):
    bant: Optional[BANTUpdate] = None


class LeadUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=2, max_length=255)
    stage: Optional[str] = None
    source: Optional[str] = None
    territory: Optional[str] = None
    owner_id: Optional[str] = None
    team_id: Optional[str] = None
    estimated_value: Optional[Decimal] = None
    target_products: Optional[List[str]] = None
    target_openings: Optional[int] = None
    lost_reason: Optional[str] = None
    bant: Optional[BANTUpdate] = None


class LeadStageUpdate(BaseModel):
    stage: str = Field(..., pattern="^(SUSPECT|QUALIFIED|CONTACTED|MEETING_SCHEDULED|MEETING_HELD|PROPOSAL|NEGOTIATION|CONTRACT_SIGNED|ACTIVE_ACCOUNT|UNQUALIFIED|NO_RESPONSE|ON_HOLD|LOST)$")
    notes: Optional[str] = None
    lost_reason: Optional[str] = None


class LeadResponse(LeadBase):
    id: str
    bant_budget: str
    bant_budget_notes: Optional[str] = None
    bant_authority: str
    bant_authority_notes: Optional[str] = None
    bant_need: str
    bant_need_notes: Optional[str] = None
    bant_timeline: str
    bant_timeline_notes: Optional[str] = None
    bant_score: int
    is_qualified: bool
    lost_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    days_in_stage: Optional[int] = 0
    organization_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class PipelineSummaryItem(BaseModel):
    stage: str
    count: int
    total_value: Decimal
    total_openings: int


class PipelineSummaryResponse(BaseModel):
    stages: List[PipelineSummaryItem]
    total_leads: int
    total_pipeline_value: Decimal
