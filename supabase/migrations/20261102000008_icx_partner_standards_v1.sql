-- =============================================================================
-- AIESEC iCX ERP — Partner Standards per Opportunity v1.0
-- Author: Wadii Hani <wadii.hani.pro@gmail.com>
-- Specification: iCX_Data_Integrity_Tracking_Spec.md v1.0 (§9.1 Standards #1–#8, §13.2 DQ-062)
-- Milestone: M4 (Plan 04-01)
-- Enforces: INV-01 (No Hard Deletes), INV-09 (Attribution), Account-Management Routines
-- =============================================================================

CREATE TABLE IF NOT EXISTS partner_standard_check (
  opportunity_id uuid NOT NULL REFERENCES opportunity(id) ON DELETE RESTRICT,
  std_no smallint NOT NULL CHECK (std_no BETWEEN 1 AND 8),
  delivered boolean NOT NULL DEFAULT false,
  delivered_at timestamptz,
  delivered_by uuid REFERENCES member(id) ON DELETE RESTRICT,
  meeting_logged_at timestamptz,
  meeting_notes text,
  criteria_met jsonb NOT NULL DEFAULT '{}'::jsonb,
  proof_id uuid REFERENCES proof_document(id) ON DELETE RESTRICT,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  deleted_reason text,
  PRIMARY KEY (opportunity_id, std_no)
);

-- B-tree indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_partner_std_opp ON partner_standard_check(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_partner_std_delivered ON partner_standard_check(delivered);
CREATE INDEX IF NOT EXISTS idx_partner_std_proof ON partner_standard_check(proof_id);

-- Attach INV-01 Prevent Hard Delete Trigger
DROP TRIGGER IF EXISTS trg_prevent_delete_partner_standard ON partner_standard_check;
CREATE TRIGGER trg_prevent_delete_partner_standard
BEFORE DELETE ON partner_standard_check
FOR EACH ROW EXECUTE FUNCTION fn_icx_prevent_hard_delete();

-- Attach INV-09 Universal Audit Logger
DROP TRIGGER IF EXISTS trg_audit_partner_standard ON partner_standard_check;
CREATE TRIGGER trg_audit_partner_standard
AFTER INSERT OR UPDATE ON partner_standard_check
FOR EACH ROW EXECUTE FUNCTION fn_icx_universal_audit_log();
