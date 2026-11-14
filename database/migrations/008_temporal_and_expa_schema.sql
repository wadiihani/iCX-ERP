-- ============================================================================
-- Migration 008: Temporal Durable Workflows & Isolated EXPA Sync Adapter
-- ============================================================================

-- 1. Temporal Workflow Executions Table
CREATE TABLE IF NOT EXISTS temporal_workflow_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id VARCHAR(150) NOT NULL UNIQUE,
    workflow_type VARCHAR(80) NOT NULL, -- SLA_FIRST_CONTACT, SLA_OP_REVIEW, PRE_ARRIVAL_COUNTDOWN, STANDARDS_CHECKPOINT
    entity_type VARCHAR(50) NOT NULL, -- APPLICATION, EXCHANGE, OPPORTUNITY
    entity_id UUID NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'RUNNING', -- RUNNING, COMPLETED, TIMED_OUT, FAILED, CANCELLED
    input_payload JSONB DEFAULT '{}'::jsonb,
    current_step VARCHAR(100),
    due_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_temporal_wf_entity ON temporal_workflow_executions(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_temporal_wf_status ON temporal_workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_temporal_wf_due_at ON temporal_workflow_executions(due_at);

-- 2. Temporal Activity Execution Logs (Idempotency tracking)
CREATE TABLE IF NOT EXISTS temporal_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id UUID NOT NULL REFERENCES temporal_workflow_executions(id) ON DELETE CASCADE,
    activity_name VARCHAR(100) NOT NULL,
    idempotency_key VARCHAR(200) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'STARTED', -- STARTED, SUCCESS, FAILED
    retry_count INTEGER NOT NULL DEFAULT 0,
    result_payload JSONB DEFAULT '{}'::jsonb,
    executed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_temporal_act_idempotency ON temporal_activity_logs(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_temporal_act_exec ON temporal_activity_logs(execution_id);

-- 3. Operational Escalations Table
CREATE TABLE IF NOT EXISTS operational_escalations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_execution_id UUID REFERENCES temporal_workflow_executions(id) ON DELETE SET NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    severity VARCHAR(30) NOT NULL DEFAULT 'WARNING', -- WARNING, CRITICAL
    reason VARCHAR(255) NOT NULL,
    escalated_to_role VARCHAR(50) NOT NULL DEFAULT 'LCVP_ICX', -- LCVP_ICX, TEAM_LEADER, LCP
    resolved BOOLEAN NOT NULL DEFAULT FALSE,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_escalation_entity ON operational_escalations(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_escalation_resolved ON operational_escalations(resolved);

-- 4. EXPA Sync Runs
CREATE TABLE IF NOT EXISTS expa_sync_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sync_mode VARCHAR(50) NOT NULL DEFAULT 'POLLING', -- POLLING, WEBHOOK, MANUAL_RECONCILIATION
    status VARCHAR(50) NOT NULL DEFAULT 'RUNNING', -- RUNNING, SUCCESS, PARTIAL_FAILURE, FAILED
    records_scanned INTEGER NOT NULL DEFAULT 0,
    records_staged INTEGER NOT NULL DEFAULT 0,
    conflicts_detected INTEGER NOT NULL DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ
);

-- 5. EXPA Staged Records
CREATE TABLE IF NOT EXISTS expa_staged_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sync_run_id UUID NOT NULL REFERENCES expa_sync_runs(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL, -- OPPORTUNITY, APPLICATION, EP_PROFILE
    expa_id VARCHAR(100) NOT NULL,
    raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    status VARCHAR(50) NOT NULL DEFAULT 'STAGED', -- STAGED, RECONCILED, CONFLICT_DETECTED, IGNORED
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_expa_staged_expa_id ON expa_staged_records(expa_id);
CREATE INDEX IF NOT EXISTS idx_expa_staged_status ON expa_staged_records(status);

-- 6. EXPA Reconciliation Records (Discrepancy Matrix)
CREATE TABLE IF NOT EXISTS expa_reconciliation_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staged_record_id UUID REFERENCES expa_staged_records(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,
    local_entity_id UUID,
    field_name VARCHAR(80) NOT NULL, -- status, start_date, compensation, ep_name
    local_value VARCHAR(255),
    expa_value VARCHAR(255),
    discrepancy_type VARCHAR(60) NOT NULL, -- STATUS_MISMATCH, DATE_MISMATCH, UNLINKED_EP, MISSING_LOCAL_RECORD
    resolution_status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, LOCAL_KEPT, EXPA_ACCEPTED, MANUAL_OVERRIDE
    resolved_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_expa_recon_res_status ON expa_reconciliation_records(resolution_status);
CREATE INDEX IF NOT EXISTS idx_expa_recon_local_entity ON expa_reconciliation_records(entity_type, local_entity_id);

-- 7. EXPA Gated Outbound Mutations Queue
CREATE TABLE IF NOT EXISTS expa_gated_mutations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL,
    local_entity_id UUID NOT NULL,
    expa_id VARCHAR(100) NOT NULL,
    target_action VARCHAR(80) NOT NULL, -- ACCEPT_APPLICATION, APPROVE_APPLICATION, UPDATE_DATES
    mutation_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING_HUMAN_APPROVAL', -- PENDING_HUMAN_APPROVAL, APPROVED, DISPATCHED, REJECTED
    requested_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    approved_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    rejection_reason TEXT,
    dispatched_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_expa_mutations_status ON expa_gated_mutations(status);
