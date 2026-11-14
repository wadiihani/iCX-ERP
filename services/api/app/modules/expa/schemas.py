from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, ConfigDict


class EXPASyncRunResponse(BaseModel):
    id: str
    sync_mode: str
    status: str
    records_scanned: int
    records_staged: int
    conflicts_detected: int
    error_message: Optional[str] = None
    started_at: datetime
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class EXPAStagedRecordResponse(BaseModel):
    id: str
    sync_run_id: str
    entity_type: str
    expa_id: str
    raw_payload: Dict[str, Any]
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EXPAReconciliationRecordResponse(BaseModel):
    id: str
    staged_record_id: Optional[str] = None
    entity_type: str
    local_entity_id: Optional[str] = None
    field_name: str
    local_value: Optional[str] = None
    expa_value: Optional[str] = None
    discrepancy_type: str
    resolution_status: str
    resolved_by_user_id: Optional[str] = None
    resolution_notes: Optional[str] = None
    created_at: datetime
    resolved_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class ReconciliationResolveRequest(BaseModel):
    resolution_strategy: str # LOCAL_KEPT, EXPA_ACCEPTED, MANUAL_OVERRIDE
    resolution_notes: Optional[str] = None
    custom_value: Optional[str] = None


class EXPAGatedMutationCreate(BaseModel):
    entity_type: str
    local_entity_id: str
    expa_id: str
    target_action: str
    mutation_payload: Dict[str, Any]


class EXPAGatedMutationResponse(BaseModel):
    id: str
    entity_type: str
    local_entity_id: str
    expa_id: str
    target_action: str
    mutation_payload: Dict[str, Any]
    status: str
    requested_by_user_id: str
    approved_by_user_id: Optional[str] = None
    rejection_reason: Optional[str] = None
    dispatched_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MutationRejectRequest(BaseModel):
    rejection_reason: str
