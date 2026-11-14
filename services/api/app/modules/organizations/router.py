from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.modules.identity.models import User
from app.modules.identity.permissions import get_current_user, require_permission
from app.modules.organizations.schemas import (
    OrganizationCreate,
    OrganizationUpdate,
    OrganizationResponse,
    ContactCreate,
    ContactUpdate,
    ContactResponse,
)
from app.modules.organizations.service import OrganizationService

router = APIRouter(prefix="/organizations", tags=["Organizations & PRM"])


@router.get("", response_model=List[OrganizationResponse])
def list_organizations(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    status: Optional[str] = None,
    sector: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("partner:read")),
):
    return OrganizationService.get_organizations(
        db=db,
        skip=skip,
        limit=limit,
        status_filter=status,
        sector_filter=sector,
        search=search,
    )


@router.post("", response_model=OrganizationResponse, status_code=status.HTTP_201_CREATED)
def create_organization(
    data: OrganizationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("partner:write")),
):
    return OrganizationService.create_organization(db=db, data=data, user_id=current_user.id)


@router.get("/{org_id}", response_model=OrganizationResponse)
def get_organization(
    org_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("partner:read")),
):
    org = OrganizationService.get_organization_by_id(db, org_id)
    if not org:
        from fastapi import HTTPException
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")
    return org


@router.put("/{org_id}", response_model=OrganizationResponse)
def update_organization(
    org_id: str,
    data: OrganizationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("partner:write")),
):
    return OrganizationService.update_organization(db=db, org_id=org_id, data=data, user_id=current_user.id)


@router.post("/{org_id}/contacts", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
def add_organization_contact(
    org_id: str,
    data: ContactCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("partner:write")),
):
    return OrganizationService.add_contact(db=db, org_id=org_id, data=data, user_id=current_user.id)


@router.put("/contacts/{contact_id}", response_model=ContactResponse)
def update_contact(
    contact_id: str,
    data: ContactUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("partner:write")),
):
    return OrganizationService.update_contact(db=db, contact_id=contact_id, data=data, user_id=current_user.id)


@router.delete("/contacts/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_contact(
    contact_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("partner:write")),
):
    OrganizationService.delete_contact(db=db, contact_id=contact_id, user_id=current_user.id)
    return None
