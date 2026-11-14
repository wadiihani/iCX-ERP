from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.identity.permissions import get_current_user, require_role
from app.modules.expa.service import EXPAService
from app.modules.expa.schemas import (
    EXPASyncRunResponse,
    EXPAReconciliationRecordResponse,
    ReconciliationResolveRequest,
    EXPAGatedMutationCreate,
    EXPAGatedMutationResponse,
    MutationRejectRequest
)

router = APIRouter(prefix="/expa", tags=["Isolated EXPA Sync & Reconciliation"])


@router.post("/sync/trigger", response_model=EXPASyncRunResponse)
def trigger_expa_sync(
    sync_mode: str = Query("POLLING", pattern="^(POLLING|WEBHOOK|MANUAL_RECONCILIATION)$"),
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["LCP_ADMIN", "LCVP_ICX", "TEAM_LEADER"]))
):
    return EXPAService.trigger_sync(db, sync_mode)


@router.get("/sync/runs", response_model=List[EXPASyncRunResponse])
def list_sync_runs(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return EXPAService.list_sync_runs(db, limit)


@router.get("/reconciliations", response_model=List[EXPAReconciliationRecordResponse])
def list_reconciliations(
    resolution_status: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return EXPAService.list_reconciliations(db, resolution_status, limit)


@router.post("/reconciliations/{id}/resolve", response_model=EXPAReconciliationRecordResponse)
def resolve_reconciliation(
    id: str,
    req: ReconciliationResolveRequest,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["LCP_ADMIN", "LCVP_ICX", "TEAM_LEADER"]))
):
    try:
        return EXPAService.resolve_reconciliation(
            db,
            recon_id=id,
            user_id=current_user.id,
            strategy=req.resolution_strategy,
            notes=req.resolution_notes,
            custom_value=req.custom_value
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/mutations", response_model=EXPAGatedMutationResponse)
def create_gated_mutation(
    req: EXPAGatedMutationCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return EXPAService.create_gated_mutation(
        db,
        user_id=current_user.id,
        entity_type=req.entity_type,
        local_entity_id=req.local_entity_id,
        expa_id=req.expa_id,
        target_action=req.target_action,
        payload=req.mutation_payload
    )


@router.get("/mutations", response_model=List[EXPAGatedMutationResponse])
def list_mutations(
    status: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return EXPAService.list_mutations(db, status, limit)


@router.post("/mutations/{id}/approve", response_model=EXPAGatedMutationResponse)
def approve_mutation(
    id: str,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["LCP_ADMIN", "LCVP_ICX"]))
):
    try:
        return EXPAService.approve_and_dispatch_mutation(db, id, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/mutations/{id}/reject", response_model=EXPAGatedMutationResponse)
def reject_mutation(
    id: str,
    req: MutationRejectRequest,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["LCP_ADMIN", "LCVP_ICX"]))
):
    try:
        return EXPAService.reject_mutation(db, id, current_user.id, req.rejection_reason)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
