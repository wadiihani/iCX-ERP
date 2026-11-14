from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.modules.identity.models import User
from app.modules.identity.permissions import require_permission
from app.modules.irm.schemas import (
    SendingEntityCreate,
    SendingEntityResponse,
    VisaFeasibilityCreate,
    VisaFeasibilityResponse,
    IRMPartnershipCreate,
    IRMPartnershipResponse,
)
from app.modules.irm.service import IRMService

router = APIRouter(prefix="/irm", tags=["International Relations Management (IRM)"])


@router.get("/entities", response_model=List[SendingEntityResponse])
def list_sending_entities(
    region: Optional[str] = None,
    cluster: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("partner:read")),
):
    return IRMService.get_sending_entities(db=db, region=region, cluster=cluster, search=search)


@router.post("/entities", response_model=SendingEntityResponse, status_code=status.HTTP_201_CREATED)
def create_sending_entity(
    data: SendingEntityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("partner:write")),
):
    return IRMService.create_sending_entity(db=db, data=data, user_id=current_user.id)


@router.get("/visa-feasibility", response_model=List[VisaFeasibilityResponse])
def list_visa_assessments(
    country: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("partner:read")),
):
    return IRMService.get_visa_assessments(db=db, country=country)


@router.post("/visa-feasibility", response_model=VisaFeasibilityResponse)
def create_or_update_visa_assessment(
    data: VisaFeasibilityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("partner:write")),
):
    return IRMService.create_or_update_visa_assessment(db=db, data=data, user_id=current_user.id)


@router.get("/partnerships", response_model=List[IRMPartnershipResponse])
def list_partnerships(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("partner:read")),
):
    return IRMService.get_partnerships(db=db)


@router.post("/partnerships", response_model=IRMPartnershipResponse, status_code=status.HTTP_201_CREATED)
def create_partnership(
    data: IRMPartnershipCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("partner:write")),
):
    return IRMService.create_partnership(db=db, data=data, user_id=current_user.id)
