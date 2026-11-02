-- =============================================================================
-- AIESEC iCX ERP — Data Integrity Triggers & Append-Only Guarantees v1.0
-- Author: Wadii Hani <wadii.hani.pro@gmail.com>
-- Specification: iCX_Data_Integrity_Tracking_Spec.md v1.0 (§2, §3.3)
-- Milestone: M0 (Plan 00-02)
-- Enforces: INV-01, INV-02, INV-05, INV-09, DQ-080, DQ-081
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0. DATA QUALITY ISSUE TABLE (DQ Issues & Invariant Breaches)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS dq_issue (
  id bigserial PRIMARY KEY,
  rule_id text NOT NULL,
  subject text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('Urgent', 'Blocker', 'Warn', 'Review')),
  detected_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  owner_id uuid REFERENCES member(id) ON DELETE RESTRICT,
  details jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_dq_issue_rule_id ON dq_issue(rule_id);
CREATE INDEX IF NOT EXISTS idx_dq_issue_severity ON dq_issue(severity);
CREATE INDEX IF NOT EXISTS idx_dq_issue_owner_id ON dq_issue(owner_id);
CREATE INDEX IF NOT EXISTS idx_dq_issue_resolved_at ON dq_issue(resolved_at);

-- -----------------------------------------------------------------------------
-- 1. TRIGGER 1: INV-01 HARD DELETE PROHIBITION (Rule DQ-081)
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION fn_icx_prevent_hard_delete()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'INV-01: Hard deletes are strictly forbidden on table "%". Soft delete by setting deleted_at, deleted_reason, and actor instead (Rule DQ-081).'
    USING ERRCODE = 'restrict_violation',
          HINT = 'Use soft delete: UPDATE table SET deleted_at = now(), deleted_reason = ... WHERE id = ...';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  tbl text;
  business_tables text[] := ARRAY[
    'member',
    'entity_org',
    'op_partner',
    'opportunity',
    'contract',
    'ep',
    'exchange',
    'standard_def',
    'rule_registry',
    'dq_issue'
  ];
BEGIN
  FOREACH tbl IN ARRAY business_tables LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_prevent_delete_%I ON %I;', tbl, tbl);
    EXECUTE format('
      CREATE TRIGGER trg_prevent_delete_%I
      BEFORE DELETE ON %I
      FOR EACH ROW EXECUTE FUNCTION fn_icx_prevent_hard_delete();
    ', tbl, tbl);
  END LOOP;
END $$;

-- -----------------------------------------------------------------------------
-- 2. TRIGGER 2: INV-02 APPEND-ONLY LEDGER IMMUTABILITY (status_history & audit_log)
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION fn_icx_enforce_append_only()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'INV-02: Table "%" is an immutable append-only ledger. % operations are strictly forbidden.', TG_TABLE_NAME, TG_OP
    USING ERRCODE = 'restrict_violation',
          HINT = 'Append-only ledger entries can only be inserted, never updated or deleted.';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_append_only_status_history ON status_history;
CREATE TRIGGER trg_append_only_status_history
BEFORE UPDATE OR DELETE ON status_history
FOR EACH ROW EXECUTE FUNCTION fn_icx_enforce_append_only();

DROP TRIGGER IF EXISTS trg_append_only_audit_log ON audit_log;
CREATE TRIGGER trg_append_only_audit_log
BEFORE UPDATE OR DELETE ON audit_log
FOR EACH ROW EXECUTE FUNCTION fn_icx_enforce_append_only();

-- -----------------------------------------------------------------------------
-- 3. TRIGGER 3: INV-05 EP VOICE IMMUTABILITY (Write-Once on ep_reported_*)
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION fn_icx_prevent_ep_reported_mutation()
RETURNS TRIGGER AS $$
BEGIN
  -- If ep_reported_answer was already populated, reject any subsequent modification
  IF OLD.ep_reported_answer IS NOT NULL THEN
    IF NEW.ep_reported_answer IS DISTINCT FROM OLD.ep_reported_answer OR
       NEW.ep_reported_at IS DISTINCT FROM OLD.ep_reported_at THEN
      RAISE EXCEPTION 'INV-05: ep_reported_answer and ep_reported_at are write-once immutable fields. Once recorded, EP survey answers cannot be modified or influenced.'
        USING ERRCODE = 'restrict_violation',
              HINT = 'EP voice responses are protected against retroactive alteration.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_immutability_standard_check_ep ON standard_check;
CREATE TRIGGER trg_immutability_standard_check_ep
BEFORE UPDATE ON standard_check
FOR EACH ROW EXECUTE FUNCTION fn_icx_prevent_ep_reported_mutation();

-- -----------------------------------------------------------------------------
-- 4. TRIGGER 4: INV-09 UNIVERSAL ATTRIBUTION AUDIT LOGGER
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION fn_icx_universal_audit_log()
RETURNS TRIGGER AS $$
DECLARE
  v_actor uuid;
  v_record_id text;
  v_before jsonb := NULL;
  v_after jsonb := NULL;
  v_request_id text;
BEGIN
  -- Extract actor safely from session variables or jwt claims
  BEGIN
    v_actor := NULLIF(current_setting('app.current_actor_id', true), '')::uuid;
  EXCEPTION WHEN OTHERS THEN
    v_actor := NULL;
  END;

  -- Extract request_id safely
  BEGIN
    v_request_id := NULLIF(current_setting('app.current_request_id', true), '');
  EXCEPTION WHEN OTHERS THEN
    v_request_id := NULL;
  END;

  -- Determine appropriate record ID string representation
  IF TG_TABLE_NAME = 'standard_check' THEN
    v_record_id := NEW.exchange_id::text || ':' || NEW.std_no::text;
  ELSIF TG_TABLE_NAME = 'rule_registry' THEN
    v_record_id := NEW.key || ':' || NEW.effective_from::text;
  ELSE
    v_record_id := NEW.id::text;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    v_before := row_to_json(OLD)::jsonb;
  END IF;
  v_after := row_to_json(NEW)::jsonb;

  INSERT INTO audit_log (actor, action, table_name, record_id, before, after, request_id)
  VALUES (v_actor, TG_OP, TG_TABLE_NAME, v_record_id, v_before, v_after, v_request_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  tbl text;
  audit_tables text[] := ARRAY[
    'member',
    'entity_org',
    'op_partner',
    'opportunity',
    'contract',
    'ep',
    'exchange',
    'standard_check',
    'rule_registry',
    'dq_issue'
  ];
BEGIN
  FOREACH tbl IN ARRAY audit_tables LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_audit_%I ON %I;', tbl, tbl);
    EXECUTE format('
      CREATE TRIGGER trg_audit_%I
      AFTER INSERT OR UPDATE ON %I
      FOR EACH ROW EXECUTE FUNCTION fn_icx_universal_audit_log();
    ', tbl, tbl);
  END LOOP;
END $$;

-- -----------------------------------------------------------------------------
-- 5. TRIGGER 5: DQ-080 STATUS TRANSITION SYNCHRONIZATION
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION fn_icx_sync_status_history()
RETURNS TRIGGER AS $$
DECLARE
  v_source text;
  v_reason text;
  v_by_member uuid;
  v_proof_id uuid;
  v_history_exists boolean;
BEGIN
  -- Only act when status actually changes
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    -- Check if a matching status_history row was already inserted in this transaction
    SELECT EXISTS (
      SELECT 1 FROM status_history
      WHERE exchange_id = NEW.id
        AND to_status = NEW.status
        AND at >= (now() - interval '2 seconds')
    ) INTO v_history_exists;

    -- If no history row exists yet, automatically create it to guarantee DQ-080 synchronization
    IF NOT v_history_exists THEN
      BEGIN
        v_source := COALESCE(NULLIF(current_setting('app.status_change_source', true), ''), 'system');
      EXCEPTION WHEN OTHERS THEN
        v_source := 'system';
      END;

      IF v_source NOT IN ('expa_sync', 'manual', 'system') THEN
        v_source := 'system';
      END IF;

      BEGIN
        v_reason := NULLIF(current_setting('app.status_change_reason', true), '');
      EXCEPTION WHEN OTHERS THEN
        v_reason := NULL;
      END;

      BEGIN
        v_by_member := NULLIF(current_setting('app.current_actor_id', true), '')::uuid;
      EXCEPTION WHEN OTHERS THEN
        v_by_member := NEW.owner_id;
      END;

      IF v_by_member IS NULL THEN
        v_by_member := NEW.owner_id;
      END IF;

      BEGIN
        v_proof_id := NULLIF(current_setting('app.status_change_proof_id', true), '')::uuid;
      EXCEPTION WHEN OTHERS THEN
        v_proof_id := NULL;
      END;

      INSERT INTO status_history (
        exchange_id,
        from_status,
        to_status,
        break_type,
        at,
        by_member,
        source,
        reason,
        proof_id
      ) VALUES (
        NEW.id,
        OLD.status,
        NEW.status,
        NEW.break_type,
        now(),
        v_by_member,
        v_source,
        v_reason,
        v_proof_id
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_exchange_status_sync ON exchange;
CREATE TRIGGER trg_exchange_status_sync
AFTER UPDATE OF status ON exchange
FOR EACH ROW EXECUTE FUNCTION fn_icx_sync_status_history();
