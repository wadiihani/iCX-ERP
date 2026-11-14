from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field, EmailStr


class SendingEntityBase(BaseModel):
    country: str = Field(..., min_length=2, max_length=100)
    mc_name: str = Field(..., min_length=2, max_length=150)
    lc_name: str = Field(..., min_length=2, max_length=150)
    region: str = Field("Europe", pattern="^(MEA|Europe|Americas|Asia-Pacific)$")
    expa_id: Optional[str] = None
    snd_cluster: str = Field("GROW", pattern="^(UPSCALE|GROW|INVEST|UNDERSTAND)$")
    primary_contact_name: Optional[str] = None
    primary_contact_email: Optional[EmailStr] = None
    status: str = Field("ACTIVE", pattern="^(ACTIVE|INACTIVE)$")


class SendingEntityCreate(SendingEntityBase):
    pass


class SendingEntityResponse(SendingEntityBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class VisaFeasibilityBase(BaseModel):
    country: str = Field(..., min_length=2, max_length=100)
    assessment_status: str = Field("FEASIBLE", pattern="^(FEASIBLE|CONDITIONAL|HIGH_RISK|RESTRICTED)$")
    estimated_processing_days: int = Field(default=30, ge=1, le=180)
    visa_category: str = Field("Internship / Volunteer", max_length=100)
    source_citation: str = Field(..., min_length=5, max_length=255)
    effective_date: date
    advisory_disclaimer: str = Field(
        default="Operational assessment for planning purposes only; does not constitute official legal advice."
    )
    notes: Optional[str] = None


class VisaFeasibilityCreate(VisaFeasibilityBase):
    pass


class VisaFeasibilityResponse(VisaFeasibilityBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class IRMPartnershipBase(BaseModel):
    sending_entity_id: str
    product_type: str = Field("ALL", pattern="^(iGV|iGTa|iGTe|ALL)$")
    target_pipeline_eps: int = Field(default=0, ge=0)
    delivered_eps: int = Field(default=0, ge=0)
    status: str = Field("ACTIVE", pattern="^(PROSPECT|ACTIVE|STALLED|COMPLETED)$")
    weekly_sync_cadence: str = Field("Weekly", max_length=50)
    notes: Optional[str] = None


class IRMPartnershipCreate(IRMPartnershipBase):
    pass


class IRMPartnershipResponse(IRMPartnershipBase):
    id: str
    sending_entity_country: Optional[str] = None
    sending_entity_lc: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
