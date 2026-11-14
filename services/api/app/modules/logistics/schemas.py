from datetime import datetime, date
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict, Field
from decimal import Decimal


class ArrivalLogisticsCreate(BaseModel):
    exchange_id: str
    flight_number: Optional[str] = None
    airline: Optional[str] = None
    arrival_airport: str = Field("RBA_RABAT", pattern="^(RBA_RABAT|CMN_CASABLANCA|RAK_MARRAKECH)$")
    arrival_datetime: datetime
    terminal: Optional[str] = None
    transport_mode: str = Field("CAR", pattern="^(CAR|TRAIN|TAXI)$")
    driver_name: Optional[str] = None
    driver_contact: Optional[str] = None
    notes: Optional[str] = None


class ArrivalLogisticsResponse(ArrivalLogisticsCreate):
    id: str
    pickup_status: str
    assigned_driver_id: Optional[str] = None
    created_at: datetime
    exchange_code: Optional[str] = None
    ep_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class PickupStatusUpdate(BaseModel):
    pickup_status: str = Field(..., pattern="^(PENDING|ASSIGNED|EN_ROUTE|PICKED_UP|NO_SHOW)$")
    driver_name: Optional[str] = None
    driver_contact: Optional[str] = None
    notes: Optional[str] = None


class AccommodationUnitCreate(BaseModel):
    unit_name: str = Field(..., min_length=2, max_length=150)
    address: str = Field(..., min_length=5, max_length=255)
    neighborhood: str = Field("Agdal", max_length=100)
    unit_type: str = Field("AIESEC_APARTMENT", pattern="^(HOST_FAMILY|AIESEC_APARTMENT|DORMITORY|HOTEL)$")
    capacity_beds: int = Field(1, ge=1, le=50)
    monthly_rent_mad: Decimal = Field(default=Decimal("0.00"), ge=0)
    landlord_name: Optional[str] = None
    landlord_phone: Optional[str] = None
    safety_inspection_passed: bool = False


class AccommodationUnitResponse(AccommodationUnitCreate):
    id: str
    occupied_beds: int
    last_inspected_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AccommodationAssignPayload(BaseModel):
    exchange_id: str
    accommodation_unit_id: str
    check_in_date: date
    check_out_date: date
    bed_number: str = "Bed 1"
    key_deposit_mad: Decimal = Field(default=Decimal("0.00"), ge=0)
    notes: Optional[str] = None
