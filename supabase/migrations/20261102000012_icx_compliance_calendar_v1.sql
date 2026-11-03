-- =============================================================================
-- AIESEC iCX ERP — Compliance Calendar & ICB Freeze Gate v1.0
-- Author: Wadii Hani <wadii.hani.pro@gmail.com>
-- Specification: iCX_Data_Integrity_Tracking_Spec.md v1.0 (§11 Module F, S3, S9, D10)
-- Milestone: M6 (Plan 06-01, Plan 06-02)
-- Enforces: INV-01 (No Hard Deletes), INV-03 (Active Owner), INV-07 (Freeze Gate), INV-09 (Attribution), T-11
-- =============================================================================

-- 1. Create Enums
DO $$ BEGIN
  CREATE TYPE compliance_kind AS ENUM (
    'icb_audit_doc',
    'ecb_quarterly_report',
    'unfreezing_submission',
    'internal_audit'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE compliance_result AS ENUM (
    'passed',
    'failed',
    'pending',
    'waived'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Create compliance_item table
CREATE TABLE IF NOT EXISTS compliance_item (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id uuid NOT NULL REFERENCES entity_org(id) ON DELETE RESTRICT,
  kind compliance_kind NOT NULL,
  doc_number integer, -- 1-13 for statutory ICB audit documents
  title text NOT NULL,
  section text NOT NULL, -- General, 3.1.1, 3.1.2, 3.1.3, 3.1.4
  due_at timestamptz NOT NULL,
  submitted_at timestamptz,
  result compliance_result NOT NULL DEFAULT 'pending',
  pass_pct numeric CHECK (pass_pct IS NULL OR (pass_pct >= 0 AND pass_pct <= 100)),
  evidence_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  violation_level smallint CHECK (violation_level IS NULL OR (violation_level BETWEEN 1 AND 5)),
  notes text,
  source_link text,
  owner_id uuid NOT NULL REFERENCES member(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  deleted_reason text
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_compliance_item_entity ON compliance_item(entity_id);
CREATE INDEX IF NOT EXISTS idx_compliance_item_kind ON compliance_item(kind);
CREATE INDEX IF NOT EXISTS idx_compliance_item_doc_num ON compliance_item(doc_number);
CREATE INDEX IF NOT EXISTS idx_compliance_item_due_at ON compliance_item(due_at);
CREATE INDEX IF NOT EXISTS idx_compliance_item_result ON compliance_item(result);
CREATE INDEX IF NOT EXISTS idx_compliance_item_owner ON compliance_item(owner_id);
CREATE INDEX IF NOT EXISTS idx_compliance_item_deleted ON compliance_item(deleted_at);

-- Attach INV-01 Prevent Hard Delete Trigger
DROP TRIGGER IF EXISTS trg_prevent_delete_compliance_item ON compliance_item;
CREATE TRIGGER trg_prevent_delete_compliance_item
BEFORE DELETE ON compliance_item
FOR EACH ROW EXECUTE FUNCTION fn_icx_prevent_hard_delete();

-- Attach INV-09 Universal Audit Logger
DROP TRIGGER IF EXISTS trg_audit_compliance_item ON compliance_item;
CREATE TRIGGER trg_audit_compliance_item
AFTER INSERT OR UPDATE ON compliance_item
FOR EACH ROW EXECUTE FUNCTION fn_icx_universal_audit_log();
