from datetime import datetime, date
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict, Field
from decimal import Decimal


VALID_PRODUCTS = ["iGV", "iGTa", "iGTe"]
VALID_MODALITIES = ["PHYSICAL", "PARTLY_REMOTE", "FULLY_REMOTE"]
VALID_STATUSES = ["DRAFT", "INTERNAL_REVIEW", "VERIFIED", "PUBLISHED", "CLOSED"]
VALID_WORK_FIELDS = ["BA", "BD", "MKT", "IT", "ENG", "FIN", "Other"]


class IGVDetailsBase(BaseModel):
    sdg_number: int = Field(..., ge=1, le=17)
    sdg_target: Optional[str] = None
    global_project_name: str = Field(..., min_length=2, max_length=150)
    housing_provided: bool = True
    food_provided: bool = False
    transport_provided: bool = False
    project_fee_amount: Decimal = Field(default=Decimal("0.00"), ge=0)


class IGVDetailsCreate(IGVDetailsBase):
    pass


class IGVDetailsResponse(IGVDetailsBase):
    id: str
    opportunity_id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class IGTDetailsBase(BaseModel):
    work_field: str = Field(..., pattern="^(BA|BD|MKT|IT|ENG|FIN|Other)$")
    sub_field: Optional[str] = None
    duration_tier: str = Field("SHORT", pattern="^(SHORT|MEDIUM|LONG)$")
    monthly_salary: Decimal = Field(default=Decimal("0.00"), ge=0)
    currency: str = Field("MAD", max_length=20)
    salary_covers_living_costs: bool = False
    accommodation_covered: bool = False
    is_teaching_role: bool = False
    accredited_institution: bool = False
    accreditation_details: Optional[str] = None
    icb_audit_status: str = "PENDING"


class IGTDetailsCreate(IGTDetailsBase):
    pass


class IGTDetailsResponse(IGTDetailsBase):
    id: str
    opportunity_id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class OpportunitySlotResponse(BaseModel):
    id: str
    opportunity_id: str
    slot_number: str
    start_date: date
    end_date: date
    status: str
    current_application_id: Optional[str] = None
    lock_version: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class OpportunityBase(BaseModel):
    opportunity_code: str = Field(..., min_length=3, max_length=100)
    contract_id: str
    organization_id: str
    title: str = Field(..., min_length=3, max_length=255)
    product_type: str = Field(..., pattern="^(iGV|iGTa|iGTe)$")
    modality: str = Field("PHYSICAL", pattern="^(PHYSICAL|PARTLY_REMOTE|FULLY_REMOTE)$")
    start_date: date
    end_date: date
    duration_weeks: int = Field(..., ge=1, le=78)
    working_hours_per_week: int = Field(..., ge=20, le=50)
    location: str = Field("Rabat, Morocco", max_length=255)
    description: str = Field(..., min_length=10)
    role_description: str = Field(..., min_length=10)
    required_skills: List[str] = Field(default_factory=list)
    required_languages: List[str] = Field(default_factory=list)
    openings_capacity: int = Field(default=1, ge=1)
    line_manager_name: Optional[str] = None
    line_manager_contact: Optional[str] = None


class OpportunityCreate(OpportunityBase):
    igv_details: Optional[IGVDetailsCreate] = None
    igt_details: Optional[IGTDetailsCreate] = None


class OpportunityUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    modality: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    duration_weeks: Optional[int] = None
    working_hours_per_week: Optional[int] = None
    description: Optional[str] = None
    role_description: Optional[str] = None
    required_skills: Optional[List[str]] = None
    required_languages: Optional[List[str]] = None
    line_manager_name: Optional[str] = None
    line_manager_contact: Optional[str] = None
    igv_details: Optional[IGVDetailsCreate] = None
    igt_details: Optional[IGTDetailsCreate] = None


class PublicationChecklistResponse(BaseModel):
    opportunity_id: str
    contract_active: bool
    product_rules_passed: bool
    slots_generated: bool
    line_manager_confirmed: bool
    jd_complete: bool
    ready_to_publish: bool
    issues: List[str] = []


class OpportunityResponse(OpportunityBase):
    id: str
    status: str
    filled_openings: int
    is_published: bool
    organization_name: Optional[str] = None
    igv_details: Optional[IGVDetailsResponse] = None
    igt_details: Optional[IGTDetailsResponse] = None
    slots: List[OpportunitySlotResponse] = []
    publication_checklist: Dict[str, Any] = {}
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
