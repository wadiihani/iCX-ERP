-- =============================================================================
-- AIESEC iCX ERP — Quality Cases & Customer Support Minimums v1.0
-- Author: Wadii Hani <wadii.hani.pro@gmail.com>
-- Specification: iCX_Data_Integrity_Tracking_Spec.md v1.0 (§10 Module E, S4, S9)
-- Milestone: M5 (Plan 05-01)
-- Enforces: INV-01 (No Hard Deletes), INV-03 (Active Owner), INV-09 (Attribution), CS Minimums 1–4
-- =============================================================================

-- 1. Create Enums
DO $$ BEGIN
  CREATE TYPE case_classification AS ENUM ('policy_breach', 'expectation_gap', 'other');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE compensation_type AS ENUM ('refund', 'reimbursement', 'migration_fine', 'goodwill', 'other');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Create case_quality table
CREATE TABLE IF NOT EXISTS case_quality (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exchange_id uuid NOT NULL REFERENCES exchange(id) ON DELETE RESTRICT,
  title text NOT NULL,
  description text NOT NULL,
  classification case_classification NOT NULL,
  
  opened_at timestamptz NOT NULL DEFAULT now(),
  first_response_at timestamptz,
  closed_at timestamptz,
  
  -- Ordered list of resolution steps with timestamps
  resolution_steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  
  compensation_amount numeric NOT NULL DEFAULT 0 CHECK (compensation_amount >= 0),
  currency text NOT NULL DEFAULT 'MAD',
  compensation_type compensation_type,
  
  financial_proof_id uuid,
  final_agreement_id text,
  
  recurrence_of uuid REFERENCES case_quality(id) ON DELETE RESTRICT,
  owner_id uuid NOT NULL REFERENCES member(id) ON DELETE RESTRICT,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  deleted_reason text
);

-- Indexes for fast queries & foreign keys
CREATE INDEX IF NOT EXISTS idx_case_quality_exchange ON case_quality(exchange_id);
CREATE INDEX IF NOT EXISTS idx_case_quality_owner ON case_quality(owner_id);
CREATE INDEX IF NOT EXISTS idx_case_quality_opened_at ON case_quality(opened_at);
CREATE INDEX IF NOT EXISTS idx_case_quality_closed_at ON case_quality(closed_at);
CREATE INDEX IF NOT EXISTS idx_case_quality_classification ON case_quality(classification);
CREATE INDEX IF NOT EXISTS idx_case_quality_recurrence ON case_quality(recurrence_of);
CREATE INDEX IF NOT EXISTS idx_case_quality_deleted ON case_quality(deleted_at);

-- Attach INV-01 Prevent Hard Delete Trigger
DROP TRIGGER IF EXISTS trg_prevent_delete_case_quality ON case_quality;
CREATE TRIGGER trg_prevent_delete_case_quality
BEFORE DELETE ON case_quality
FOR EACH ROW EXECUTE FUNCTION fn_icx_prevent_hard_delete();

-- Attach INV-09 Universal Audit Logger
DROP TRIGGER IF EXISTS trg_audit_case_quality ON case_quality;
CREATE TRIGGER trg_audit_case_quality
AFTER INSERT OR UPDATE ON case_quality
FOR EACH ROW EXECUTE FUNCTION fn_icx_universal_audit_log();
