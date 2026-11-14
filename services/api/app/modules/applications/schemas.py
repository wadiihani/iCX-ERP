from datetime import datetime, date
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict, Field

VALID_STAGES = [
    "APPLIED",
    "CONTACTED",
    "SCREENING",
    "SHORTLISTED",
    "SENT_TO_OP",
    "INTERVIEW",
    "OP_DECISION",
    "ACCEPTED",
    "APPROVED",
    "REJECTED",
    "WITHDRAWN",
]

ALLOWED_TRANSITIONS = {
    "APPLIED": ["CONTACTED", "REJECTED", "WITHDRAWN"],
    "CONTACTED": ["SCREENING", "REJECTED", "WITHDRAWN"],
    "SCREENING": ["SHORTLISTED", "REJECTED", "WITHDRAWN"],
    "SHORTLISTED": ["SENT_TO_OP", "REJECTED", "WITHDRAWN"],
    "SENT_TO_OP": ["INTERVIEW", "REJECTED", "WITHDRAWN"],
    "INTERVIEW": ["OP_DECISION", "REJECTED", "WITHDRAWN"],
    "OP_DECISION": ["ACCEPTED", "REJECTED", "WITHDRAWN"],
    "ACCEPTED": ["APPROVED", "WITHDRAWN"],
    "APPROVED": ["WITHDRAWN"],
    "REJECTED": ["APPLIED"],  # Re-open if reconsidered
    "WITHDRAWN": ["APPLIED"],
}


class ApplicationScreeningCreate(BaseModel):
    language_proficiency: str = Field("INTERMEDIATE", pattern="^(BASIC|INTERMEDIATE|ADVANCED|NATIVE)$")
    background_check_passed: bool = True
    cultural_fit_rating: int = Field(3, ge=1, le=5)
    skills_match_rating: int = Field(3, ge=1, le=5)
    motivation_notes: Optional[str] = None
    recommendation: str = Field("RECOMMENDED", pattern="^(RECOMMENDED|NEUTRAL|REJECTED)$")


class ApplicationScreeningResponse(ApplicationScreeningCreate):
    id: str
    application_id: str
    reviewer_id: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class OPInterviewCreate(BaseModel):
    interviewer_name: str = Field(..., min_length=2, max_length=150)
    interview_type: str = Field("ONLINE", pattern="^(ONLINE|IN_PERSON)$")
    scheduled_at: datetime
    conducted_at: Optional[datetime] = None
    op_decision: str = Field("PENDING", pattern="^(PENDING|ACCEPTED|REJECTED|SECOND_ROUND)$")
    feedback_notes: Optional[str] = None
    questions_asked: Optional[str] = None


class OPInterviewResponse(OPInterviewCreate):
    id: str
    application_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ApplicationCreate(BaseModel):
    ep_id: str
    opportunity_id: str
    slot_id: Optional[str] = None
    assigned_manager_id: Optional[str] = None
    notes: Optional[str] = None


class ApplicationTransition(BaseModel):
    target_stage: str = Field(..., pattern=f"^({'|'.join(VALID_STAGES)})$")
    reason: Optional[str] = None


class AcceptanceNoteCreate(BaseModel):
    document_url: str
    ep_signature_date: date
    partner_signature_date: date
    is_verified: bool = True
    verification_notes: Optional[str] = None


class AcceptanceNoteResponse(AcceptanceNoteCreate):
    id: str
    application_id: str
    verified_by: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SEPaymentProofCreate(BaseModel):
    sending_entity_id: Optional[str] = None
    payment_reference: str = Field(..., min_length=3, max_length=100)
    amount_eur: float = Field(default=0.0, ge=0)
    proof_document_url: str
    is_verified: bool = True


class SEPaymentProofResponse(SEPaymentProofCreate):
    id: str
    application_id: str
    verified_by: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MatchApprovePayload(BaseModel):
    slot_id: Optional[str] = None
    notes: Optional[str] = None


class ReadinessUpdatePayload(BaseModel):
    operational_readiness: str = Field(..., pattern="^(DRAFT|READY|AT_RISK|BLOCKED|DONE)$")
    notes: Optional[str] = None


class ApplicationResponse(BaseModel):
    id: str
    application_code: str
    expa_application_id: Optional[str] = None
    ep_id: str
    opportunity_id: str
    slot_id: Optional[str] = None
    current_stage: str
    official_expa_status: str
    operational_readiness: str
    assigned_manager_id: Optional[str] = None
    first_contact_deadline: Optional[datetime] = None
    first_contacted_at: Optional[datetime] = None
    op_feedback_deadline: Optional[datetime] = None
    applied_at: datetime
    accepted_at: Optional[datetime] = None
    approved_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    withdrawal_reason: Optional[str] = None
    notes: Optional[str] = None
    is_sla_breached: bool = False
    created_at: datetime
    updated_at: datetime
    ep_name: Optional[str] = None
    ep_email: Optional[str] = None
    ep_country: Optional[str] = None
    opportunity_title: Optional[str] = None
    opportunity_code: Optional[str] = None
    product_type: Optional[str] = None
    screenings: List[ApplicationScreeningResponse] = []
    op_interviews: List[OPInterviewResponse] = []
    acceptance_notes: List[AcceptanceNoteResponse] = []
    se_payment_proofs: List[SEPaymentProofResponse] = []

    model_config = ConfigDict(from_attributes=True)
