from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.identity.models import User
from app.modules.identity.permissions import get_current_user
from app.modules.logistics.schemas import (
    ArrivalLogisticsCreate,
    ArrivalLogisticsResponse,
    PickupStatusUpdate,
    AccommodationUnitCreate,
    AccommodationUnitResponse,
    AccommodationAssignPayload,
)
from app.modules.logistics.service import LogisticsService

router = APIRouter(prefix="/logistics", tags=["Arrivals & Accommodation Logistics"])


@router.get("/arrivals", response_model=List[ArrivalLogisticsResponse])
def list_arrivals(
    pickup_status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return LogisticsService.get_arrivals(db=db, pickup_status=pickup_status)


@router.post("/arrivals", response_model=ArrivalLogisticsResponse, status_code=status.HTTP_201_CREATED)
def record_arrival(
    payload: ArrivalLogisticsCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return LogisticsService.record_arrival(db=db, payload=payload)


@router.put("/arrivals/{logistics_id}/status", response_model=ArrivalLogisticsResponse)
def update_pickup_status(
    logistics_id: str,
    payload: PickupStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return LogisticsService.update_pickup_status(db=db, logistics_id=logistics_id, payload=payload)


@router.get("/accommodations", response_model=List[AccommodationUnitResponse])
def list_accommodations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return LogisticsService.get_accommodation_units(db=db)


@router.post("/accommodations", response_model=AccommodationUnitResponse, status_code=status.HTTP_201_CREATED)
def create_accommodation(
    payload: AccommodationUnitCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return LogisticsService.create_accommodation_unit(db=db, payload=payload)


@router.post("/accommodations/assign", status_code=status.HTTP_201_CREATED)
def assign_accommodation(
    payload: AccommodationAssignPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return LogisticsService.assign_accommodation(db=db, payload=payload)
