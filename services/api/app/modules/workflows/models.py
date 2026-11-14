import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship

from app.core.database import Base


class TemporalWorkflowExecution(Base):
    __tablename__ = "temporal_workflow_executions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    workflow_id = Column(String(150), unique=True, nullable=False, index=True)
    workflow_type = Column(String(80), nullable=False) # SLA_FIRST_CONTACT, SLA_OP_REVIEW, PRE_ARRIVAL_COUNTDOWN, STANDARDS_CHECKPOINT
    entity_type = Column(String(50), nullable=False) # APPLICATION, EXCHANGE, OPPORTUNITY
    entity_id = Column(String(36), nullable=False, index=True)
    status = Column(String(50), nullable=False, default="RUNNING") # RUNNING, COMPLETED, TIMED_OUT, FAILED, CANCELLED
    input_payload = Column(JSON, default=dict)
    current_step = Column(String(100), nullable=True)
    due_at = Column(DateTime(timezone=True), nullable=True, index=True)
    started_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    activity_logs = relationship("TemporalActivityLog", back_populates="execution", cascade="all, delete-orphan")
    escalations = relationship("OperationalEscalation", back_populates="execution")


class TemporalActivityLog(Base):
    __tablename__ = "temporal_activity_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    execution_id = Column(String(36), ForeignKey("temporal_workflow_executions.id", ondelete="CASCADE"), nullable=False, index=True)
    activity_name = Column(String(100), nullable=False)
    idempotency_key = Column(String(200), unique=True, nullable=False, index=True)
    status = Column(String(50), nullable=False, default="STARTED") # STARTED, SUCCESS, FAILED
    retry_count = Column(Integer, default=0)
    result_payload = Column(JSON, default=dict)
    executed_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    execution = relationship("TemporalWorkflowExecution", back_populates="activity_logs")


class OperationalEscalation(Base):
    __tablename__ = "operational_escalations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    workflow_execution_id = Column(String(36), ForeignKey("temporal_workflow_executions.id", ondelete="SET NULL"), nullable=True)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(String(36), nullable=False, index=True)
    severity = Column(String(30), nullable=False, default="WARNING") # WARNING, CRITICAL
    reason = Column(String(255), nullable=False)
    escalated_to_role = Column(String(50), nullable=False, default="LCVP_ICX") # LCVP_ICX, TEAM_LEADER, LCP_ADMIN
    resolved = Column(Boolean, default=False, index=True)
    resolution_notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    execution = relationship("TemporalWorkflowExecution", back_populates="escalations")
