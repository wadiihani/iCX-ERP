import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship

from app.core.database import Base


class EXPASyncRun(Base):
    __tablename__ = "expa_sync_runs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    sync_mode = Column(String(50), nullable=False, default="POLLING") # POLLING, WEBHOOK, MANUAL_RECONCILIATION
    status = Column(String(50), nullable=False, default="RUNNING") # RUNNING, SUCCESS, PARTIAL_FAILURE, FAILED
    records_scanned = Column(Integer, default=0)
    records_staged = Column(Integer, default=0)
    conflicts_detected = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    started_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime(timezone=True), nullable=True)

    staged_records = relationship("EXPAStagedRecord", back_populates="sync_run", cascade="all, delete-orphan")


class EXPAStagedRecord(Base):
    __tablename__ = "expa_staged_records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    sync_run_id = Column(String(36), ForeignKey("expa_sync_runs.id", ondelete="CASCADE"), nullable=False, index=True)
    entity_type = Column(String(50), nullable=False) # OPPORTUNITY, APPLICATION, EP_PROFILE
    expa_id = Column(String(100), nullable=False, index=True)
    raw_payload = Column(JSON, default=dict)
    status = Column(String(50), nullable=False, default="STAGED") # STAGED, RECONCILED, CONFLICT_DETECTED, IGNORED
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    sync_run = relationship("EXPASyncRun", back_populates="staged_records")
    reconciliations = relationship("EXPAReconciliationRecord", back_populates="staged_record", cascade="all, delete-orphan")


class EXPAReconciliationRecord(Base):
    __tablename__ = "expa_reconciliation_records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    staged_record_id = Column(String(36), ForeignKey("expa_staged_records.id", ondelete="CASCADE"), nullable=True)
    entity_type = Column(String(50), nullable=False) # APPLICATION, OPPORTUNITY, EP_PROFILE
    local_entity_id = Column(String(36), nullable=True, index=True)
    field_name = Column(String(80), nullable=False) # status, start_date, compensation, ep_name
    local_value = Column(String(255), nullable=True)
    expa_value = Column(String(255), nullable=True)
    discrepancy_type = Column(String(60), nullable=False) # STATUS_MISMATCH, DATE_MISMATCH, UNLINKED_EP, MISSING_LOCAL_RECORD
    resolution_status = Column(String(50), nullable=False, default="PENDING", index=True) # PENDING, LOCAL_KEPT, EXPA_ACCEPTED, MANUAL_OVERRIDE
    resolved_by_user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    resolution_notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    staged_record = relationship("EXPAStagedRecord", back_populates="reconciliations")


class EXPAGatedMutation(Base):
    __tablename__ = "expa_gated_mutations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    entity_type = Column(String(50), nullable=False)
    local_entity_id = Column(String(36), nullable=False)
    expa_id = Column(String(100), nullable=False)
    target_action = Column(String(80), nullable=False) # ACCEPT_APPLICATION, APPROVE_APPLICATION, UPDATE_DATES
    mutation_payload = Column(JSON, default=dict)
    status = Column(String(50), nullable=False, default="PENDING_HUMAN_APPROVAL", index=True) # PENDING_HUMAN_APPROVAL, APPROVED, DISPATCHED, REJECTED
    requested_by_user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    approved_by_user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    rejection_reason = Column(Text, nullable=True)
    dispatched_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
