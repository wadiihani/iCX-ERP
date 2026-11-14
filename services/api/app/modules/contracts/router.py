from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.modules.identity.models import User
from app.modules.identity.permissions import require_permission
from app.modules.contracts.schemas import (
    ContractCreate,
    ContractUpdate,
    ContractSignRequest,
    ContractResponse,
    OperationalRiskCreate,
    OperationalRiskUpdate,
    OperationalRiskResponse,
)
from app.modules.contracts.service import ContractService

router = APIRouter(tags=["Contracts & Legal Compliance"])


@router.get("/contracts", response_model=List[ContractResponse])
def list_contracts(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    status: Optional[str] = None,
    organization_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("contract:read")),
):
    return ContractService.get_contracts(
        db=db,
        skip=skip,
        limit=limit,
        status_filter=status,
        organization_id=organization_id,
    )


@router.post("/contracts", response_model=ContractResponse, status_code=status.HTTP_201_CREATED)
def create_contract(
    data: ContractCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("contract:draft")),
):
    return ContractService.create_contract(db=db, data=data, user_id=current_user.id)


@router.get("/contracts/expiring/alerts", response_model=List[ContractResponse])
def get_expiring_contract_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("contract:read")),
):
    return ContractService.get_expiring_contracts(db)


@router.get("/contracts/{contract_id}", response_model=ContractResponse)
def get_contract(
    contract_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("contract:read")),
):
    contract = ContractService.get_contract_by_id(db, contract_id)
    if not contract:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contract not found")
    return ContractService.to_response(contract)


@router.put("/contracts/{contract_id}", response_model=ContractResponse)
def update_contract(
    contract_id: str,
    data: ContractUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("contract:draft")),
):
    return ContractService.update_contract(db=db, contract_id=contract_id, data=data, user_id=current_user.id)


@router.post("/contracts/{contract_id}/sign", response_model=ContractResponse)
def sign_contract(
    contract_id: str,
    data: ContractSignRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("contract:approve")),
):
    return ContractService.sign_contract(db=db, contract_id=contract_id, data=data, user_id=current_user.id)


@router.post("/contracts/{contract_id}/version", response_model=ContractResponse)
def create_contract_version(
    contract_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("contract:draft")),
):
    return ContractService.create_contract_version(db=db, contract_id=contract_id, user_id=current_user.id)


# ==================== Operational Risks Endpoints ====================

@router.get("/risks", response_model=List[OperationalRiskResponse])
def list_risks(
    organization_id: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("partner:read")),
):
    return ContractService.get_risks(
        db=db,
        organization_id=organization_id,
        category=category,
        status_filter=status,
    )


@router.post("/risks", response_model=OperationalRiskResponse, status_code=status.HTTP_201_CREATED)
def create_risk(
    data: OperationalRiskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("partner:write")),
):
    return ContractService.create_risk(db=db, data=data, user_id=current_user.id)


@router.put("/risks/{risk_id}", response_model=OperationalRiskResponse)
def update_risk(
    risk_id: str,
    data: OperationalRiskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("partner:write")),
):
    return ContractService.update_risk(db=db, risk_id=risk_id, data=data, user_id=current_user.id)
