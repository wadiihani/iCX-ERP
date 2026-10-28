-- =============================================================================
-- AIESEC iCX ERP — Migration 000002: Tamper-Evident Audit & Invariant Triggers
-- Enforces Invariants INV-02, INV-05, and Optimistic Concurrency row_version
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. IMMUTABILITY TRIGGER (Revokes UPDATE & DELETE on Audit Tables)
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION fn_prevent_audit_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Security Violation: % operation is forbidden on immutable table % (Invariant INV-02)', TG_OP, TG_TABLE_NAME
    USING ERRCODE = 'restrict_violation';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_events_immutable
BEFORE UPDATE OR DELETE ON audit_events
FOR EACH ROW EXECUTE FUNCTION fn_prevent_audit_mutation();

CREATE TRIGGER trg_status_transitions_immutable
BEFORE UPDATE OR DELETE ON status_transitions
FOR EACH ROW EXECUTE FUNCTION fn_prevent_audit_mutation();

-- -----------------------------------------------------------------------------
-- 2. SHA-256 HASH CHAINING TRIGGER ON audit_events (INV-02)
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION fn_chain_audit_event_hash()
RETURNS TRIGGER AS $$
DECLARE
  v_last_hash VARCHAR(64);
  v_genesis_hash CONSTANT VARCHAR(64) := '0000000000000000000000000000000000000000000000000000000000000000';
  v_payload TEXT;
BEGIN
  -- Obtain the latest hash for this Local Committee (or genesis hash if first event)
  SELECT hash INTO v_last_hash
  FROM audit_events
  WHERE lc_id = NEW.lc_id OR (NEW.lc_id IS NULL AND lc_id IS NULL)
  ORDER BY occurred_at DESC, id DESC
  LIMIT 1;

  IF v_last_hash IS NULL THEN
    NEW.prev_hash := v_genesis_hash;
  ELSE
    NEW.prev_hash := v_last_hash;
  END IF;

  -- Compute deterministic SHA-256 hash over chained fields
  v_payload := NEW.prev_hash || '|' ||
               COALESCE(NEW.lc_id::TEXT, '') || '|' ||
               NEW.occurred_at::TEXT || '|' ||
               NEW.action || '|' ||
               NEW.object_type || '|' ||
               NEW.object_id::TEXT || '|' ||
               COALESCE(NEW.actor_user_id::TEXT, '') || '|' ||
               COALESCE(NEW.changed_fields::TEXT, '');

  NEW.hash := encode(digest(v_payload, 'sha256'), 'hex');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_events_hash_chain
BEFORE INSERT ON audit_events
FOR EACH ROW EXECUTE FUNCTION fn_chain_audit_event_hash();

-- -----------------------------------------------------------------------------
-- 3. OPTIMISTIC CONCURRENCY CONTROL & updated_at TRIGGER
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION fn_handle_row_version_and_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.row_version := OLD.row_version + 1;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all mutable business tables
DO $$
DECLARE
  t TEXT;
  tables_to_version TEXT[] := ARRAY[
    'local_committees', 'users', 'role_assignments', 'organizations',
    'organization_contacts', 'b2b_deals', 'partner_agreements', 'documents',
    'opportunities', 'opportunity_slots', 'ir_entities', 'ep_profiles',
    'ep_applications', 'ep_readiness', 'ep_visa_records', 'ep_touchpoints',
    'ep_standards_evidence', 'accommodation_providers', 'accommodation_allocations',
    'pickup_missions', 'quality_cases', 'compensation_claims', 'invoices',
    'financial_transactions', 'tasks', 'action_outbox'
  ];
BEGIN
  FOREACH t IN ARRAY tables_to_version LOOP
    EXECUTE format('
      CREATE TRIGGER trg_%I_version
      BEFORE UPDATE ON %I
      FOR EACH ROW
      EXECUTE FUNCTION fn_handle_row_version_and_timestamp();
    ', t, t);
  END LOOP;
END;
$$;
