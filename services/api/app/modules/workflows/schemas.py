from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, ConfigDict


class WorkflowExecutionCreate(BaseModel):
    workflow_type: str
    entity_type: str
    entity_id: str
    due_at: Optional[datetime] = None
    input_payload: Optional[Dict[str, Any]] = None


class WorkflowExecutionResponse(BaseModel):
    id: str
    workflow_id: str
    workflow_type: str
    entity_type: str
    entity_id: str
    status: str
    input_payload: Optional[Dict[str, Any]] = None
    current_step: Optional[str] = None
    due_at: Optional[datetime] = None
    started_at: datetime
    completed_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ActivityLogResponse(BaseModel):
    id: str
    execution_id: str
    activity_name: str
    idempotency_key: str
    status: str
    retry_count: int
    result_payload: Optional[Dict[str, Any]] = None
    executed_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EscalationResponse(BaseModel):
    id: str
    workflow_execution_id: Optional[str] = None
    entity_type: str
    entity_id: str
    severity: str
    reason: str
    escalated_to_role: str
    resolved: bool
    resolution_notes: Optional[str] = None
    created_at: datetime
    resolved_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class EscalationResolveRequest(BaseModel):
    resolution_notes: str
