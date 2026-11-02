-- =============================================================================
-- AIESEC iCX ERP — Proof Document Vault & Integrity Tracking v1.0
-- Author: Wadii Hani <wadii.hani.pro@gmail.com>
-- Specification: iCX_Data_Integrity_Tracking_Spec.md v1.0 (§3.2, §6.4, §13.1, §13.2 DQ-083, §16 T-20)
-- Milestone: M2 (Plan 02-03)
-- Enforces: INV-01 (No Hard Deletes), INV-09 (Attribution), DQ-083 (Dead Link / Hash Drift)
-- =============================================================================

CREATE TABLE IF NOT EXISTS proof_document (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text NOT NULL,
  mime_type text NOT NULL,
  file_size_bytes bigint NOT NULL CHECK (file_size_bytes > 0),
  drive_url text NOT NULL,
  sha256_hash text NOT NULL CHECK (length(sha256_hash) = 64),
  uploaded_by uuid NOT NULL REFERENCES member(id) ON DELETE RESTRICT,
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  last_verified_at timestamptz,
  verification_status text NOT NULL DEFAULT 'verified' 
    CHECK (verification_status IN ('verified', 'dead_link', 'checksum_mismatch', 'unverified')),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  deleted_at timestamptz,
  deleted_reason text
);

-- B-tree indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_proof_document_uploaded_by ON proof_document(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_proof_document_verification_status ON proof_document(verification_status);
CREATE INDEX IF NOT EXISTS idx_proof_document_sha256 ON proof_document(sha256_hash);
CREATE INDEX IF NOT EXISTS idx_proof_document_uploaded_at ON proof_document(uploaded_at);

-- Foreign key constraints for proof references
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_standard_check_proof'
  ) THEN
    ALTER TABLE standard_check 
    ADD CONSTRAINT fk_standard_check_proof 
    FOREIGN KEY (proof_id) REFERENCES proof_document(id) ON DELETE RESTRICT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_status_history_proof'
  ) THEN
    ALTER TABLE status_history 
    ADD CONSTRAINT fk_status_history_proof 
    FOREIGN KEY (proof_id) REFERENCES proof_document(id) ON DELETE RESTRICT;
  END IF;
END $$;

-- Attach INV-01 Prevent Hard Delete Trigger
DROP TRIGGER IF EXISTS trg_prevent_delete_proof_document ON proof_document;
CREATE TRIGGER trg_prevent_delete_proof_document
BEFORE DELETE ON proof_document
FOR EACH ROW EXECUTE FUNCTION fn_icx_prevent_hard_delete();

-- Attach INV-09 Universal Audit Logger
DROP TRIGGER IF EXISTS trg_audit_proof_document ON proof_document;
CREATE TRIGGER trg_audit_proof_document
AFTER INSERT OR UPDATE ON proof_document
FOR EACH ROW EXECUTE FUNCTION fn_icx_universal_audit_log();
