-- =============================================================================
-- AIESEC iCX ERP — Deadline Engine & Radar Escalation View v1.0
-- Author: Wadii Hani <wadii.hani.pro@gmail.com>
-- Specification: iCX_Data_Integrity_Tracking_Spec.md v1.0 (§8, §13.2, §16 T-12, T-17)
-- Milestone: M3 (Plan 03-03)
-- Enforces: INV-01 (No Hard Deletes), INV-09 (Attribution), Alert Ladder Escalation
-- =============================================================================

CREATE TABLE IF NOT EXISTS deadline_item (
  id text PRIMARY KEY,
  category text NOT NULL CHECK (category IN ('exchange', 'partner', 'compliance', 'case')),
  subject text NOT NULL,
  due_at timestamptz NOT NULL,
  rule_key text NOT NULL,
  owner_id uuid NOT NULL REFERENCES member(id) ON DELETE RESTRICT,
  source text NOT NULL,
  status text NOT NULL DEFAULT 'upcoming' 
    CHECK (status IN ('upcoming', 'notice', 'warning', 'urgent', 'overdue', 'resolved')),
  escalation_level text NOT NULL DEFAULT 'owner'
    CHECK (escalation_level IN ('owner', 'lcvp', 'lcp')),
  entity_id text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  deleted_reason text
);

-- B-tree indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_deadline_item_due_at ON deadline_item(due_at);
CREATE INDEX IF NOT EXISTS idx_deadline_item_owner ON deadline_item(owner_id);
CREATE INDEX IF NOT EXISTS idx_deadline_item_status ON deadline_item(status);
CREATE INDEX IF NOT EXISTS idx_deadline_item_category ON deadline_item(category);

-- Attach INV-01 Prevent Hard Delete Trigger
DROP TRIGGER IF EXISTS trg_prevent_delete_deadline_item ON deadline_item;
CREATE TRIGGER trg_prevent_delete_deadline_item
BEFORE DELETE ON deadline_item
FOR EACH ROW EXECUTE FUNCTION fn_icx_prevent_hard_delete();

-- Attach INV-09 Universal Audit Logger
DROP TRIGGER IF EXISTS trg_audit_deadline_item ON deadline_item;
CREATE TRIGGER trg_audit_deadline_item
AFTER INSERT OR UPDATE ON deadline_item
FOR EACH ROW EXECUTE FUNCTION fn_icx_universal_audit_log();
