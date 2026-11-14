from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.modules.identity.models import User
from app.modules.identity.permissions import get_current_user, require_permission, require_role
from app.modules.legalities.schemas import (
    RiskRegisterCreate,
    RiskRegisterUpdate,
    RiskRegisterResponse,
    IACAuditItemCreate,
    IACAuditItemUpdate,
    IACAuditItemResponse,
    LegalDocumentCreate,
    LegalDocumentResponse
)
from app.modules.legalities import service

router = APIRouter(prefix="/legalities", tags=["Legalities & Compliance"])


@router.get("/risks", response_model=List[RiskRegisterResponse])
def list_risk_entries(
    status: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return service.get_risk_entries(db, status, category)


@router.post("/risks", response_model=RiskRegisterResponse, status_code=status.HTTP_201_CREATED)
def create_risk_entry(
    payload: RiskRegisterCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return service.create_risk_entry(db, payload)


@router.put("/risks/{risk_id}", response_model=RiskRegisterResponse)
def update_risk_entry(
    risk_id: str,
    payload: RiskRegisterUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return service.update_risk_entry(db, risk_id, payload)


@router.get("/iac", response_model=List[IACAuditItemResponse])
def list_iac_audit_items(
    cycle: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return service.get_iac_items(db, cycle)


@router.post("/iac", response_model=IACAuditItemResponse, status_code=status.HTTP_201_CREATED)
def create_iac_audit_item(
    payload: IACAuditItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["LCP_ADMIN", "LCVP_ICX", "LCVP_FINANCE", "ADMIN", "LCP"]))
):
    return service.create_iac_item(db, payload)


@router.put("/iac/{item_id}", response_model=IACAuditItemResponse)
def audit_iac_item(
    item_id: str,
    payload: IACAuditItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["LCP_ADMIN", "LCVP_ICX", "LCVP_FINANCE", "ADMIN", "LCP"]))
):
    return service.audit_iac_item(db, item_id, payload, user_id=current_user.id)


@router.get("/documents", response_model=List[LegalDocumentResponse])
def list_legal_documents(
    category: Optional[str] = None,
    entity_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return service.get_legal_documents(db, category, entity_id)


@router.post("/documents", response_model=LegalDocumentResponse, status_code=status.HTTP_201_CREATED)
def upload_legal_document(
    payload: LegalDocumentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return service.upload_legal_document(db, payload, user_id=current_user.id)
