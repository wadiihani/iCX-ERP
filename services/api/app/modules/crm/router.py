from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query, UploadFile, File, Form, status, Body
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.identity.models import User
from app.modules.identity.permissions import get_current_user, require_permission
from app.modules.identity.service import get_user_roles_and_permissions
from app.modules.crm.schemas import EPCreate, EPUpdate, EPResponse, BulkImportReport
from app.modules.crm.service import CRMService

router = APIRouter(prefix="/crm", tags=["CRM & EP Directory"])


def user_can_read_pii(db: Session, user: User) -> bool:
    roles, permissions = get_user_roles_and_permissions(db, user)
    return (
        "ep:pii:view" in permissions
        or "ep:read_pii" in permissions
        or any(r in ["LCP_ADMIN", "LCVP_ICX", "ADMIN", "LCP", "VP_ICX"] for r in roles)
    )


@router.get("/eps", response_model=List[Dict[str, Any]])
def list_eps(
    country: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    has_pii = user_can_read_pii(db, current_user)
    return CRMService.get_eps(
        db=db,
        has_pii_permission=has_pii,
        country=country,
        search=search,
        limit=limit,
        offset=offset,
    )


@router.post("/eps", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
def create_ep(
    payload: EPCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ep = CRMService.create_ep(db=db, payload=payload)
    has_pii = user_can_read_pii(db, current_user)
    return CRMService.get_ep_by_id(db=db, ep_id=ep.id, has_pii_permission=has_pii)


@router.get("/eps/{ep_id}", response_model=Dict[str, Any])
def get_ep(
    ep_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    has_pii = user_can_read_pii(db, current_user)
    return CRMService.get_ep_by_id(db=db, ep_id=ep_id, has_pii_permission=has_pii)


@router.post("/eps/import/dry-run", response_model=BulkImportReport)
def dry_run_bulk_import(
    csv_content: str = Body(..., media_type="text/plain"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return CRMService.parse_and_validate_csv(db=db, csv_content=csv_content, is_dry_run=True)


@router.post("/eps/import/execute", response_model=BulkImportReport)
def execute_bulk_import(
    csv_content: str = Body(..., media_type="text/plain"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return CRMService.parse_and_validate_csv(db=db, csv_content=csv_content, is_dry_run=False)
