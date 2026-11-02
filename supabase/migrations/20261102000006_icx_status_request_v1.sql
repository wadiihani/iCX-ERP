-- =============================================================================
-- AIESEC iCX ERP — Status-Change Governance & Request Lifecycle v1.0
-- Author: Wadii Hani <wadii.hani.pro@gmail.com>
-- Specification: iCX_Data_Integrity_Tracking_Spec.md v1.0 (§7 Module C)
-- Milestone: M3 (Plan 03-01)
-- Enforces: INV-01 (No Hard Deletes), INV-03 (Owner Required), INV-06 (Single EP), INV-09 (Attribution)
-- =============================================================================

CREATE TABLE IF NOT EXISTS status_request (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exchange_id uuid NOT NULL REFERENCES exchange(id) ON DELETE RESTRICT,
  ep_id uuid NOT NULL REFERENCES ep(id) ON DELETE RESTRICT,
  kind text NOT NULL CHECK (kind IN ('early_fi', 'extension_fi', 'break_apd', 'break_re', 'break_fi', 'break_co')),
  current_status text NOT NULL DEFAULT 'draft'
    CHECK (current_status IN ('draft', 'ready', 'submitted', 'approved', 'rejected', 'applied_in_expa')),
  desired_date date,
  reason text NOT NULL,
  apip_clause_ref text,
  ticket_ref text,
  checklist_state jsonb NOT NULL DEFAULT '{}'::jsonb,
  evidence_proof_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  owner_id uuid NOT NULL REFERENCES member(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  submitted_at timestamptz,
  decided_at timestamptz,
  applied_at timestamptz,
  rejection_reason text,
  deleted_at timestamptz,
  deleted_reason text
);

-- B-tree indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_status_request_exchange ON status_request(exchange_id);
CREATE INDEX IF NOT EXISTS idx_status_request_ep ON status_request(ep_id);
CREATE INDEX IF NOT EXISTS idx_status_request_kind ON status_request(kind);
CREATE INDEX IF NOT EXISTS idx_status_request_status ON status_request(current_status);
CREATE INDEX IF NOT EXISTS idx_status_request_owner ON status_request(owner_id);
CREATE INDEX IF NOT EXISTS idx_status_request_created_at ON status_request(created_at);

-- Attach INV-01 Prevent Hard Delete Trigger
DROP TRIGGER IF EXISTS trg_prevent_delete_status_request ON status_request;
CREATE TRIGGER trg_prevent_delete_status_request
BEFORE DELETE ON status_request
FOR EACH ROW EXECUTE FUNCTION fn_icx_prevent_hard_delete();

-- Attach INV-09 Universal Audit Logger
DROP TRIGGER IF EXISTS trg_audit_status_request ON status_request;
CREATE TRIGGER trg_audit_status_request
AFTER INSERT OR UPDATE ON status_request
FOR EACH ROW EXECUTE FUNCTION fn_icx_universal_audit_log();
