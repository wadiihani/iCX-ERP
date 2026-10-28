-- =============================================================================
-- AIESEC iCX ERP — Migration 20261027000002: Operations, Logistics & Tasks
-- Authoritative Specification: AIESEC iCX ERP Tracker-First Master Specification
-- Phase 1, Plan 01-02: IR, EP, Logistics, Finance & Tasks Tables (24 to 54)
-- Best Practices: Supabase Postgres Best Practices (btree_gist, Foreign Key Indexes)
-- =============================================================================

SET timezone = 'Africa/Casablanca';

-- -----------------------------------------------------------------------------
-- 1. TASK & WORKLOAD ENGINE ENHANCEMENTS (Section 0.5 & 0.8)
-- Links tasks directly to accountable department, linked entity, and handoffs
-- -----------------------------------------------------------------------------

-- Add department and entity links to tasks if not present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tasks' AND column_name = 'department'
  ) THEN
    ALTER TABLE tasks ADD COLUMN department VARCHAR(60) NOT NULL DEFAULT 'Operations';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tasks' AND column_name = 'linked_record_type'
  ) THEN
    ALTER TABLE tasks ADD COLUMN linked_record_type VARCHAR(60);
    ALTER TABLE tasks ADD COLUMN linked_record_id UUID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tasks' AND column_name = 'handoff_id'
  ) THEN
    ALTER TABLE tasks ADD COLUMN handoff_id UUID REFERENCES stakeholder_handoffs(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tasks' AND column_name = 'escalation_level'
  ) THEN
    ALTER TABLE tasks ADD COLUMN escalation_level INT NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Indexes for tasks
CREATE INDEX IF NOT EXISTS idx_tasks_dept ON tasks(department, due_at);
CREATE INDEX IF NOT EXISTS idx_tasks_linked_record ON tasks(linked_record_type, linked_record_id);
CREATE INDEX IF NOT EXISTS idx_tasks_handoff ON tasks(handoff_id);
CREATE INDEX IF NOT EXISTS idx_tasks_escalation_user ON tasks(escalation_user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_lc_id ON tasks(lc_id);

-- -----------------------------------------------------------------------------
-- 2. ACCOMMODATION EXCLUSION & AVAILABILITY HELPER (INV-01)
-- -----------------------------------------------------------------------------

-- Helper function to check if a bed is available for a date interval without violating exclusion
CREATE OR REPLACE FUNCTION check_bed_availability(
  p_bed_id UUID,
  p_check_in DATE,
  p_check_out DATE,
  p_exclude_allocation_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_conflict_count INT;
BEGIN
  SELECT COUNT(*)
  INTO v_conflict_count
  FROM accommodation_allocations
  WHERE bed_id = p_bed_id
    AND (alloc_status IN ('RESERVED_LOCKED', 'CHECKED_IN'))
    AND is_archived = false
    AND (p_exclude_allocation_id IS NULL OR id != p_exclude_allocation_id)
    AND tstzrange(check_in_date::timestamptz, check_out_date::timestamptz, '[)') &&
        tstzrange(p_check_in::timestamptz, p_check_out::timestamptz, '[)');

  RETURN (v_conflict_count = 0);
END;
$$;

COMMENT ON FUNCTION check_bed_availability IS 'INV-01 preflight check to test bed availability before allocation write';

-- -----------------------------------------------------------------------------
-- 3. AFPM RESERVE FUNDS & SUSTAINABILITY RATIO (Section 0.8 & AFPM Aug 2022)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS afpm_reserve_funds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lc_id UUID NOT NULL REFERENCES local_committees(id),
  term_code VARCHAR(20) NOT NULL,
  reserve_type VARCHAR(40) NOT NULL DEFAULT 'EXCHANGE_OPERATIONAL_RESERVE',
  minimum_reserve_mad NUMERIC(12,2) NOT NULL DEFAULT 10000.00,
  current_balance_mad NUMERIC(12,2) NOT NULL DEFAULT 10000.00,
  last_reconciled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reconciled_by_user_id UUID REFERENCES users(id),
  sustainability_ratio NUMERIC(5,2) NOT NULL DEFAULT 1.00, -- Operating Revenue / Direct Exchange Expenses >= 1.0
  row_version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(lc_id, term_code, reserve_type)
);

CREATE INDEX IF NOT EXISTS idx_reserve_funds_lc ON afpm_reserve_funds(lc_id);

COMMENT ON TABLE afpm_reserve_funds IS 'AFPM mandatory liquidity buffer and exchange sustainability ratio tracking';

-- -----------------------------------------------------------------------------
-- 4. MISSING FOREIGN KEY INDEXES ON DOMAINS 3-6 (Tables 24 to 54)
-- Enforces Supabase Best Practices (schema-foreign-key-indexes.md)
-- Eliminates sequential table scans during cascading operations & joins
-- -----------------------------------------------------------------------------

-- ir_entities & contacts
CREATE INDEX IF NOT EXISTS idx_ir_entities_owner ON ir_entities(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_ir_contacts_entity ON ir_contacts(ir_entity_id);
CREATE INDEX IF NOT EXISTS idx_ir_alloc_entity ON ir_slot_allocations(ir_entity_id);
CREATE INDEX IF NOT EXISTS idx_ir_alloc_slot ON ir_slot_allocations(slot_id);

-- ep_profiles & ep_applications
CREATE INDEX IF NOT EXISTS idx_ep_profiles_passport_checker ON ep_profiles(passport_checked_by);
CREATE INDEX IF NOT EXISTS idx_ep_apps_profile ON ep_applications(ep_profile_id);
CREATE INDEX IF NOT EXISTS idx_ep_apps_opp ON ep_applications(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_ep_apps_ir ON ep_applications(sending_ir_entity_id);

-- ep_readiness & visa
CREATE INDEX IF NOT EXISTS idx_ep_readiness_cxp_user ON ep_readiness(assigned_cxp_user_id);
CREATE INDEX IF NOT EXISTS idx_ep_touchpoints_user ON ep_touchpoints(conducted_by_user_id);
CREATE INDEX IF NOT EXISTS idx_ep_standards_verified_by ON ep_standards_evidence(verified_by_user_id);
CREATE INDEX IF NOT EXISTS idx_ep_standards_doc ON ep_standards_evidence(evidence_document_id);

-- accommodation & logistics
CREATE INDEX IF NOT EXISTS idx_accomm_prov_vetted_by ON accommodation_providers(vetted_by_user_id);
CREATE INDEX IF NOT EXISTS idx_accomm_units_provider ON accommodation_units(provider_id);
CREATE INDEX IF NOT EXISTS idx_accomm_beds_unit ON accommodation_beds(unit_id);
CREATE INDEX IF NOT EXISTS idx_pickup_buddy ON pickup_missions(pickup_buddy_user_id);
CREATE INDEX IF NOT EXISTS idx_pickup_app ON pickup_missions(application_id);

-- quality cases & claims
CREATE INDEX IF NOT EXISTS idx_cases_owner ON quality_cases(assigned_owner_user_id);
CREATE INDEX IF NOT EXISTS idx_case_events_case ON case_events(case_id);
CREATE INDEX IF NOT EXISTS idx_case_events_actor ON case_events(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_claims_case ON compensation_claims(case_id);
CREATE INDEX IF NOT EXISTS idx_claims_approved_by ON compensation_claims(approved_by_user_id);

-- invoices & transactions
CREATE INDEX IF NOT EXISTS idx_invoices_org ON invoices(org_id);
CREATE INDEX IF NOT EXISTS idx_invoices_app ON invoices(application_id);
CREATE INDEX IF NOT EXISTS idx_invoices_afpm ON invoices(afpm_account_code);
CREATE INDEX IF NOT EXISTS idx_tx_invoice ON financial_transactions(invoice_id);
CREATE INDEX IF NOT EXISTS idx_tx_receipt_doc ON financial_transactions(receipt_doc_id);

-- approvals (Dual Control)
CREATE INDEX IF NOT EXISTS idx_approvals_creator ON approvals(creator_user_id);
CREATE INDEX IF NOT EXISTS idx_approvals_approver ON approvals(approver_user_id);

-- sync staging & reconciliation
CREATE INDEX IF NOT EXISTS idx_staging_run ON sync_staging(sync_run_id);
CREATE INDEX IF NOT EXISTS idx_recon_resolved_by ON reconciliation_queue(resolved_by_user_id);
CREATE INDEX IF NOT EXISTS idx_outbox_requested_by ON action_outbox(requested_by_user_id);
CREATE INDEX IF NOT EXISTS idx_transitions_actor ON status_transitions(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_transitions_lc ON status_transitions(lc_id);
