from datetime import datetime, date
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict, Field


class ExchangeChecklistResponse(BaseModel):
    id: str
    exchange_id: str
    category: str
    item_key: str
    item_title: str
    is_mandatory: bool
    is_completed: bool
    completed_at: Optional[datetime] = None
    completed_by: Optional[str] = None
    notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ExchangeIncidentCreate(BaseModel):
    incident_type: str = Field(..., pattern="^(HEALTH|SAFETY|HARASSMENT|LEGAL|CONTRACT_BREACH|BREAK_REQUEST)$")
    severity: str = Field("MEDIUM", pattern="^(LOW|MEDIUM|HIGH|CRITICAL)$")
    description: str = Field(..., min_length=10)


class ExchangeIncidentResponse(ExchangeIncidentCreate):
    id: str
    exchange_id: str
    reported_by: Optional[str] = None
    status: str
    resolution_notes: Optional[str] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ExchangeResponse(BaseModel):
    id: str
    application_id: str
    exchange_code: str
    modality: str
    delivery_status: str
    start_date: date
    end_date: date
    actual_arrival_date: Optional[date] = None
    actual_departure_date: Optional[date] = None
    ips_completed: bool
    worksite_verified: bool
    first_day_attended: bool
    lead_manager_id: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    ep_name: Optional[str] = None
    ep_country: Optional[str] = None
    opportunity_title: Optional[str] = None
    product_type: Optional[str] = None
    checklists: List[ExchangeChecklistResponse] = []
    incidents: List[ExchangeIncidentResponse] = []

    model_config = ConfigDict(from_attributes=True)


class ChecklistUpdatePayload(BaseModel):
    is_completed: bool
    notes: Optional[str] = None


class IncidentResolvePayload(BaseModel):
    resolution_notes: str = Field(..., min_length=5)
