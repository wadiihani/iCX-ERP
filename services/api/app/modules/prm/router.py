from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.modules.identity.models import User
from app.modules.identity.permissions import require_permission
from app.modules.prm.schemas import (
    LeadCreate,
    LeadUpdate,
    LeadStageUpdate,
    LeadResponse,
    ActivityCreate,
    ActivityResponse,
    PipelineSummaryResponse,
)
from app.modules.prm.service import PRMService

router = APIRouter(prefix="/prm", tags=["PRM & Partner Leads"])


@router.get("/pipeline/summary", response_model=PipelineSummaryResponse)
def get_pipeline_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("partner:read")),
):
    return PRMService.get_pipeline_summary(db)


@router.get("/leads", response_model=List[LeadResponse])
def list_leads(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    stage: Optional[str] = None,
    organization_id: Optional[str] = None,
    owner_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("partner:read")),
):
    leads = PRMService.get_leads(
        db=db,
        skip=skip,
        limit=limit,
        stage=stage,
        organization_id=organization_id,
        owner_id=owner_id,
    )
    # Add organization_name helper for UI
    responses = []
    for l in leads:
        resp = LeadResponse.model_validate(l)
        if l.organization:
            resp.organization_name = l.organization.name
        responses.append(resp)
    return responses


@router.post("/leads", response_model=LeadResponse, status_code=status.HTTP_201_CREATED)
def create_lead(
    data: LeadCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("partner:write")),
):
    lead = PRMService.create_lead(db=db, data=data, user_id=current_user.id)
    resp = LeadResponse.model_validate(lead)
    if lead.organization:
        resp.organization_name = lead.organization.name
    return resp


@router.get("/leads/{lead_id}", response_model=LeadResponse)
def get_lead(
    lead_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("partner:read")),
):
    lead = PRMService.get_lead_by_id(db, lead_id)
    if not lead:
        from fastapi import HTTPException
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")
    resp = LeadResponse.model_validate(lead)
    if lead.organization:
        resp.organization_name = lead.organization.name
    return resp


@router.put("/leads/{lead_id}", response_model=LeadResponse)
def update_lead(
    lead_id: str,
    data: LeadUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("partner:write")),
):
    lead = PRMService.update_lead(db=db, lead_id=lead_id, data=data, user_id=current_user.id)
    resp = LeadResponse.model_validate(lead)
    if lead.organization:
        resp.organization_name = lead.organization.name
    return resp


@router.post("/leads/{lead_id}/stage", response_model=LeadResponse)
def update_lead_stage(
    lead_id: str,
    data: LeadStageUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("partner:write")),
):
    lead = PRMService.update_lead_stage(db=db, lead_id=lead_id, stage_data=data, user_id=current_user.id)
    resp = LeadResponse.model_validate(lead)
    if lead.organization:
        resp.organization_name = lead.organization.name
    return resp


@router.post("/activities", response_model=ActivityResponse, status_code=status.HTTP_201_CREATED)
def add_activity(
    data: ActivityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("partner:write")),
):
    return PRMService.add_activity(db=db, data=data, user_id=current_user.id)


@router.get("/activities", response_model=List[ActivityResponse])
def get_activities(
    organization_id: Optional[str] = None,
    lead_id: Optional[str] = None,
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("partner:read")),
):
    return PRMService.get_activities(
        db=db,
        organization_id=organization_id,
        lead_id=lead_id,
        limit=limit,
    )


@router.get("/follow-ups", response_model=List[ActivityResponse])
def get_pending_follow_ups(
    my_tasks_only: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("partner:read")),
):
    user_filter = current_user.id if my_tasks_only else None
    return PRMService.get_pending_follow_ups(db=db, user_id=user_filter)


@router.post("/follow-ups/{activity_id}/complete", response_model=ActivityResponse)
def complete_follow_up(
    activity_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("partner:write")),
):
    return PRMService.complete_follow_up(db=db, activity_id=activity_id, user_id=current_user.id)
