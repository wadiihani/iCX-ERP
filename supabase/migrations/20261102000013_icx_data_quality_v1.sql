-- =============================================================================
-- AIESEC iCX ERP — Data Quality Engine & Issue Tracker v1.0
-- Author: Wadii Hani <wadii.hani.pro@gmail.com>
-- Specification: iCX_Data_Integrity_Tracking_Spec.md v1.0 (§13.2, §14)
-- Milestone: M7 (Plan 07-01, Plan 07-02, Plan 07-03)
-- Enforces: INV-01 (No Hard Deletes), INV-03 (Active Owner), INV-09 (Attribution)
-- =============================================================================

-- 1. Create Enums
DO $$ BEGIN
  CREATE TYPE dq_severity AS ENUM ('Blocker', 'Urgent', 'Warn', 'Review');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE dq_status AS ENUM ('open', 'resolved', 'auto_resolved', 'ignored');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Create dq_issue table
CREATE TABLE IF NOT EXISTS dq_issue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id text NOT NULL, -- e.g. 'DQ-001' .. 'DQ-084'
  subject text NOT NULL,
  severity dq_severity NOT NULL,
  status dq_status NOT NULL DEFAULT 'open',
  
  table_name text,
  record_id text,
  
  detected_at timestamptz NOT NULL DEFAULT now(),
  sla_due_at timestamptz NOT NULL,
  
  owner_id uuid REFERENCES member(id) ON DELETE RESTRICT,
  
  resolved_at timestamptz,
  resolved_by uuid REFERENCES member(id) ON DELETE RESTRICT,
  resolution_note text,
  
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  deleted_reason text
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_dq_issue_rule_id ON dq_issue(rule_id);
CREATE INDEX IF NOT EXISTS idx_dq_issue_severity ON dq_issue(severity);
CREATE INDEX IF NOT EXISTS idx_dq_issue_status ON dq_issue(status);
CREATE INDEX IF NOT EXISTS idx_dq_issue_owner ON dq_issue(owner_id);
CREATE INDEX IF NOT EXISTS idx_dq_issue_detected_at ON dq_issue(detected_at);
CREATE INDEX IF NOT EXISTS idx_dq_issue_sla_due_at ON dq_issue(sla_due_at);
CREATE INDEX IF NOT EXISTS idx_dq_issue_table_record ON dq_issue(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_dq_issue_deleted ON dq_issue(deleted_at);

-- Attach INV-01 Prevent Hard Delete Trigger
DROP TRIGGER IF EXISTS trg_prevent_delete_dq_issue ON dq_issue;
CREATE TRIGGER trg_prevent_delete_dq_issue
BEFORE DELETE ON dq_issue
FOR EACH ROW EXECUTE FUNCTION fn_icx_prevent_hard_delete();

-- Attach INV-09 Universal Audit Logger
DROP TRIGGER IF EXISTS trg_audit_dq_issue ON dq_issue;
CREATE TRIGGER trg_audit_dq_issue
AFTER INSERT OR UPDATE ON dq_issue
FOR EACH ROW EXECUTE FUNCTION fn_icx_universal_audit_log();
