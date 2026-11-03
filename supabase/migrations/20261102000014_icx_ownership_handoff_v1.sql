-- =============================================================================
-- AIESEC iCX ERP — Ownership Handoff & Disaster Recovery v1.0
-- Author: Wadii Hani <wadii.hani.pro@gmail.com>
-- Specification: iCX_Data_Integrity_Tracking_Spec.md v1.0 (§12, §13.3)
-- Milestone: M8 (Plan 08-01, Plan 08-02, Plan 08-03, Plan 08-04)
-- Enforces: INV-01 (No Hard Deletes), INV-03 (Active Owner), INV-09 (Attribution), T-14, T-15
-- =============================================================================

-- 1. Create Enums
DO $$ BEGIN
  CREATE TYPE handoff_status AS ENUM (
    'initiated',
    'packet_generated',
    'reviewed_by_outgoing',
    'acknowledged_by_incoming',
    'transferred',
    'completed',
    'reopened'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE handoff_scope AS ENUM ('individual', 'team', 'department', 'term_transition');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Create handoff_record table
CREATE TABLE IF NOT EXISTS handoff_record (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope handoff_scope NOT NULL DEFAULT 'individual',
  outgoing_owner_id uuid NOT NULL REFERENCES member(id) ON DELETE RESTRICT,
  incoming_owner_id uuid NOT NULL REFERENCES member(id) ON DELETE RESTRICT,
  status handoff_status NOT NULL DEFAULT 'initiated',
  
  packet jsonb NOT NULL DEFAULT '{}'::jsonb,
  
  outgoing_reviewed_at timestamptz,
  incoming_acknowledged_at timestamptz,
  transferred_at timestamptz,
  
  transferred_counts jsonb NOT NULL DEFAULT '{}'::jsonb,
  watch_period_ends_at timestamptz,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  deleted_reason text
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_handoff_outgoing ON handoff_record(outgoing_owner_id);
CREATE INDEX IF NOT EXISTS idx_handoff_incoming ON handoff_record(incoming_owner_id);
CREATE INDEX IF NOT EXISTS idx_handoff_status ON handoff_record(status);
CREATE INDEX IF NOT EXISTS idx_handoff_deleted ON handoff_record(deleted_at);

-- Attach INV-01 Prevent Hard Delete Trigger
DROP TRIGGER IF EXISTS trg_prevent_delete_handoff_record ON handoff_record;
CREATE TRIGGER trg_prevent_delete_handoff_record
BEFORE DELETE ON handoff_record
FOR EACH ROW EXECUTE FUNCTION fn_icx_prevent_hard_delete();

-- Attach INV-09 Universal Audit Logger
DROP TRIGGER IF EXISTS trg_audit_handoff_record ON handoff_record;
CREATE TRIGGER trg_audit_handoff_record
AFTER INSERT OR UPDATE ON handoff_record
FOR EACH ROW EXECUTE FUNCTION fn_icx_universal_audit_log();
