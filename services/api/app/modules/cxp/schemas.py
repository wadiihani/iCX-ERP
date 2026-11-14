from datetime import datetime, date
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict, Field


class StandardFulfillmentUpdate(BaseModel):
    is_fulfilled: bool
    fulfillment_date: Optional[date] = None
    evidence_doc_url: Optional[str] = None
    verification_notes: Optional[str] = None


class StandardFulfillmentResponse(BaseModel):
    id: str
    exchange_id: str
    standard_number: int
    standard_name: str
    is_mandatory: bool
    is_fulfilled: bool
    fulfillment_date: Optional[date] = None
    evidence_doc_url: Optional[str] = None
    verification_notes: Optional[str] = None
    verified_by: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CompletionEvaluationReport(BaseModel):
    exchange_id: str
    total_standards_fulfilled: int
    mandatory_standards_fulfilled: int
    total_mandatory_required: int = 13
    overall_threshold_required: int = 16
    is_eligible_for_completion: bool
    missing_mandatory_standards: List[str]
    missing_optional_standards: List[str]
    completion_status: str


class CompletionApprovePayload(BaseModel):
    notes: Optional[str] = None
