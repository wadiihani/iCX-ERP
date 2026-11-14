from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.identity.models import User
from app.modules.identity.permissions import get_current_user
from app.modules.exchanges.schemas import (
    ExchangeResponse,
    ExchangeChecklistResponse,
    ExchangeIncidentCreate,
    ExchangeIncidentResponse,
    ChecklistUpdatePayload,
    IncidentResolvePayload,
)
from app.modules.exchanges.service import ExchangeService

router = APIRouter(prefix="/exchanges", tags=["Exchange Operations"])


@router.get("", response_model=List[ExchangeResponse])
def list_exchanges(
    delivery_status: Optional[str] = None,
    modality: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return ExchangeService.get_exchanges(
        db=db,
        delivery_status=delivery_status,
        modality=modality,
        search=search,
        limit=limit,
        offset=offset,
    )


@router.post("/spawn-from-app/{app_id}", response_model=ExchangeResponse, status_code=status.HTTP_201_CREATED)
def spawn_exchange(
    app_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ex = ExchangeService.spawn_from_application(db=db, application_id=app_id)
    return ExchangeService.get_exchange_by_id(db=db, exchange_id=ex.id)


@router.get("/{exchange_id}", response_model=ExchangeResponse)
def get_exchange(
    exchange_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return ExchangeService.get_exchange_by_id(db=db, exchange_id=exchange_id)


@router.put("/{exchange_id}/checklists/{checklist_id}", response_model=ExchangeChecklistResponse)
def update_checklist_item(
    exchange_id: str,
    checklist_id: str,
    payload: ChecklistUpdatePayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return ExchangeService.update_checklist_item(
        db=db,
        exchange_id=exchange_id,
        checklist_id=checklist_id,
        user_id=current_user.id,
        payload=payload,
    )


@router.post("/{exchange_id}/incidents", response_model=ExchangeIncidentResponse, status_code=status.HTTP_201_CREATED)
def report_incident(
    exchange_id: str,
    payload: ExchangeIncidentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return ExchangeService.report_incident(
        db=db, exchange_id=exchange_id, user_id=current_user.id, payload=payload
    )


@router.put("/incidents/{incident_id}/resolve", response_model=ExchangeIncidentResponse)
def resolve_incident(
    incident_id: str,
    payload: IncidentResolvePayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return ExchangeService.resolve_incident(
        db=db,
        incident_id=incident_id,
        user_id=current_user.id,
        resolution_notes=payload.resolution_notes,
    )
