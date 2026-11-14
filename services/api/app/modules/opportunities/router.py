from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.modules.identity.models import User
from app.modules.identity.permissions import require_permission
from app.modules.opportunities.schemas import (
    OpportunityCreate,
    OpportunityUpdate,
    OpportunityResponse,
    OpportunitySlotResponse,
    PublicationChecklistResponse,
)
from app.modules.opportunities.service import OpportunityService

router = APIRouter(prefix="/opportunities", tags=["Opportunities & Products"])


@router.get("", response_model=List[OpportunityResponse])
def list_opportunities(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    product_type: Optional[str] = None,
    status: Optional[str] = None,
    organization_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("opportunity:read")),
):
    opps = OpportunityService.get_opportunities(
        db=db,
        skip=skip,
        limit=limit,
        product_type=product_type,
        status_filter=status,
        organization_id=organization_id,
    )
    responses = []
    for opp in opps:
        resp = OpportunityResponse.model_validate(opp)
        if opp.organization:
            resp.organization_name = opp.organization.name
        responses.append(resp)
    return responses


@router.post("", response_model=OpportunityResponse, status_code=status.HTTP_201_CREATED)
def create_opportunity(
    data: OpportunityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("opportunity:create")),
):
    opp = OpportunityService.create_opportunity(db=db, data=data, user_id=current_user.id)
    resp = OpportunityResponse.model_validate(opp)
    if opp.organization:
        resp.organization_name = opp.organization.name
    return resp


@router.get("/{opp_id}", response_model=OpportunityResponse)
def get_opportunity(
    opp_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("opportunity:read")),
):
    opp = OpportunityService.get_opportunity_by_id(db, opp_id)
    if not opp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Opportunity not found")
    resp = OpportunityResponse.model_validate(opp)
    if opp.organization:
        resp.organization_name = opp.organization.name
    return resp


@router.get("/{opp_id}/checklist", response_model=PublicationChecklistResponse)
def get_publication_checklist(
    opp_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("opportunity:read")),
):
    return OpportunityService.get_publication_checklist(db=db, opp_id=opp_id)


@router.post("/{opp_id}/publish", response_model=OpportunityResponse)
def publish_opportunity(
    opp_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("opportunity:publish")),
):
    opp = OpportunityService.publish_opportunity(db=db, opp_id=opp_id, user_id=current_user.id)
    resp = OpportunityResponse.model_validate(opp)
    if opp.organization:
        resp.organization_name = opp.organization.name
    return resp


@router.get("/{opp_id}/slots", response_model=List[OpportunitySlotResponse])
def get_opportunity_slots(
    opp_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("opportunity:read")),
):
    opp = OpportunityService.get_opportunity_by_id(db, opp_id)
    if not opp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Opportunity not found")
    return [OpportunitySlotResponse.model_validate(s) for s in opp.slots]


@router.post("/slots/{slot_id}/reserve", response_model=OpportunitySlotResponse)
def reserve_slot(
    slot_id: str,
    application_id: str = Query(..., description="ID of application being matched"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("application:match")),
):
    slot = OpportunityService.reserve_slot_concurrency_safe(
        db=db,
        slot_id=slot_id,
        application_id=application_id,
        user_id=current_user.id,
    )
    return OpportunitySlotResponse.model_validate(slot)
