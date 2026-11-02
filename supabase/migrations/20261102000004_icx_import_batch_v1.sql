-- =============================================================================
-- AIESEC iCX ERP — Import Batch & EXPA Reconciliation Tracking v1.0
-- Author: Wadii Hani <wadii.hani.pro@gmail.com>
-- Specification: iCX_Data_Integrity_Tracking_Spec.md v1.0 (§3.2, §13.1, §13.2 DQ-082)
-- Milestone: M1 (Plan 01-03)
-- Enforces: INV-01 (No Hard Deletes), DQ-082 (Row Drop Quarantine)
-- =============================================================================

CREATE TABLE IF NOT EXISTS import_batch (
  id bigserial PRIMARY KEY,
  source text NOT NULL CHECK (source IN ('expa_csv', 'expa_api', 'manual_csv')),
  file_sha256 text NOT NULL,
  rows_in integer NOT NULL,
  rows_ok integer NOT NULL DEFAULT 0,
  rows_rejected integer NOT NULL DEFAULT 0,
  schema_version text NOT NULL DEFAULT 'v1',
  status text NOT NULL DEFAULT 'applied' CHECK (status IN ('applied', 'quarantined', 'failed')),
  quarantine_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  deleted_reason text
);

CREATE INDEX IF NOT EXISTS idx_import_batch_status ON import_batch(status);
CREATE INDEX IF NOT EXISTS idx_import_batch_sha256 ON import_batch(file_sha256);
CREATE INDEX IF NOT EXISTS idx_import_batch_created_at ON import_batch(created_at);

-- Attach INV-01 Prevent Hard Delete Trigger
DROP TRIGGER IF EXISTS trg_prevent_delete_import_batch ON import_batch;
CREATE TRIGGER trg_prevent_delete_import_batch
BEFORE DELETE ON import_batch
FOR EACH ROW EXECUTE FUNCTION fn_icx_prevent_hard_delete();

-- Attach INV-09 Universal Audit Logger
DROP TRIGGER IF EXISTS trg_audit_import_batch ON import_batch;
CREATE TRIGGER trg_audit_import_batch
AFTER INSERT OR UPDATE ON import_batch
FOR EACH ROW EXECUTE FUNCTION fn_icx_universal_audit_log();
