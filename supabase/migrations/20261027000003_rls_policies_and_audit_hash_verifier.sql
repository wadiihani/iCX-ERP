-- =============================================================================
-- AIESEC iCX ERP — Migration 20261027000003: RLS Policies & Audit Verification
-- Authoritative Specification: AIESEC iCX ERP Tracker-First Master Specification
-- Phase 1, Plan 01-03: Row-Level Security, Immutability & SHA-256 Verification Engine
-- Best Practices: Supabase Postgres Best Practices (security-rls-performance.md)
-- =============================================================================

SET timezone = 'Africa/Casablanca';

-- -----------------------------------------------------------------------------
-- 1. ENABLE ROW LEVEL SECURITY ON NEW CONTRACT TABLES
-- -----------------------------------------------------------------------------

ALTER TABLE stakeholder_handoffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_meeting_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE afpm_reserve_funds ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 2. TENANT ISOLATION POLICIES (REQ-004 & Supabase Subquery Optimization)
-- -----------------------------------------------------------------------------

-- Stakeholder Handoffs: isolated by LC
CREATE POLICY handoffs_tenant_isolation ON stakeholder_handoffs
FOR ALL USING (
  lc_id = (SELECT public.current_user_lc_id())
) WITH CHECK (
  lc_id = (SELECT public.current_user_lc_id())
);

-- B2B Meeting Logs: isolated by LC
CREATE POLICY meeting_logs_tenant_isolation ON b2b_meeting_logs
FOR ALL USING (
  lc_id = (SELECT public.current_user_lc_id())
) WITH CHECK (
  lc_id = (SELECT public.current_user_lc_id())
);

-- B2B Proposals: isolated by LC
CREATE POLICY proposals_tenant_isolation ON b2b_proposals
FOR ALL USING (
  lc_id = (SELECT public.current_user_lc_id())
) WITH CHECK (
  lc_id = (SELECT public.current_user_lc_id())
);

-- AFPM Reserve Funds: isolated by LC, write-restricted to LCP and LCVP_FNL
CREATE POLICY reserve_funds_tenant_select ON afpm_reserve_funds
FOR SELECT USING (
  lc_id = (SELECT public.current_user_lc_id())
);

CREATE POLICY reserve_funds_tenant_write ON afpm_reserve_funds
FOR ALL USING (
  lc_id = (SELECT public.current_user_lc_id())
  AND (
    (SELECT public.has_active_role('LCP'::public.user_role_code)) OR
    (SELECT public.has_active_role('LCVP_FNL'::public.user_role_code))
  )
) WITH CHECK (
  lc_id = (SELECT public.current_user_lc_id())
  AND (
    (SELECT public.has_active_role('LCP'::public.user_role_code)) OR
    (SELECT public.has_active_role('LCVP_FNL'::public.user_role_code))
  )
);

-- KPI Definitions: readable by all authenticated members; writeable by LCP / ECB
CREATE POLICY kpi_definitions_public_select ON kpi_definitions
FOR SELECT TO authenticated USING (true);

CREATE POLICY kpi_definitions_admin_write ON kpi_definitions
FOR ALL USING (
  (SELECT public.has_active_role('LCP'::public.user_role_code)) OR
  (SELECT public.has_active_role('ECB_AUDITOR'::public.user_role_code))
) WITH CHECK (
  (SELECT public.has_active_role('LCP'::public.user_role_code)) OR
  (SELECT public.has_active_role('ECB_AUDITOR'::public.user_role_code))
);

-- KPI Snapshots: isolated by LC
CREATE POLICY kpi_snapshots_tenant_isolation ON kpi_snapshots
FOR ALL USING (
  lc_id = (SELECT public.current_user_lc_id())
) WITH CHECK (
  lc_id = (SELECT public.current_user_lc_id())
);

-- -----------------------------------------------------------------------------
-- 3. VERSION & OPTIMISTIC CONCURRENCY TRIGGERS ON NEW CONTRACT TABLES
-- -----------------------------------------------------------------------------

CREATE TRIGGER trg_stakeholder_handoffs_version
BEFORE UPDATE ON stakeholder_handoffs
FOR EACH ROW EXECUTE FUNCTION fn_handle_row_version_and_timestamp();

CREATE TRIGGER trg_b2b_proposals_version
BEFORE UPDATE ON b2b_proposals
FOR EACH ROW EXECUTE FUNCTION fn_handle_row_version_and_timestamp();

CREATE TRIGGER trg_afpm_reserve_funds_version
BEFORE UPDATE ON afpm_reserve_funds
FOR EACH ROW EXECUTE FUNCTION fn_handle_row_version_and_timestamp();

-- -----------------------------------------------------------------------------
-- 4. CRYPTOGRAPHIC AUDIT CHAIN VERIFICATION FUNCTION (INV-02 & TEST-005)
-- Traverses SHA-256 hash chaining sequentially to detect any database tampering
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION verify_audit_hash_chain(p_lc_id UUID DEFAULT NULL)
RETURNS TABLE (
  is_valid BOOLEAN,
  total_events_checked INT,
  first_broken_event_id UUID,
  first_broken_occurred_at TIMESTAMPTZ,
  details TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public, pg_catalog'
AS $$
DECLARE
  v_rec RECORD;
  v_prev_expected_hash VARCHAR(64) := '0000000000000000000000000000000000000000000000000000000000000000';
  v_calculated_hash VARCHAR(64);
  v_payload TEXT;
  v_count INT := 0;
BEGIN
  -- Iterate through audit events in chronological order
  FOR v_rec IN (
    SELECT id, lc_id, occurred_at, actor_user_id, action, object_type, object_id, changed_fields, prev_hash, hash
    FROM audit_events
    WHERE (p_lc_id IS NULL OR lc_id = p_lc_id)
    ORDER BY occurred_at ASC, id ASC
  ) LOOP
    v_count := v_count + 1;

    -- Verify prev_hash link
    IF v_rec.prev_hash != v_prev_expected_hash THEN
      RETURN QUERY SELECT
        false,
        v_count,
        v_rec.id,
        v_rec.occurred_at,
        format('Prev hash broken at record %s. Expected: %s, Found: %s', v_rec.id, v_prev_expected_hash, v_rec.prev_hash);
      RETURN;
    END IF;

    -- Compute payload hash
    v_payload := v_rec.prev_hash || '|' ||
                 COALESCE(v_rec.lc_id::TEXT, '') || '|' ||
                 v_rec.occurred_at::TEXT || '|' ||
                 v_rec.action || '|' ||
                 v_rec.object_type || '|' ||
                 v_rec.object_id::TEXT || '|' ||
                 COALESCE(v_rec.actor_user_id::TEXT, '') || '|' ||
                 COALESCE(v_rec.changed_fields::TEXT, '');

    v_calculated_hash := encode(digest(v_payload, 'sha256'), 'hex');

    -- Verify hash match
    IF v_rec.hash != v_calculated_hash THEN
      RETURN QUERY SELECT
        false,
        v_count,
        v_rec.id,
        v_rec.occurred_at,
        format('Hash mismatch at record %s. Computed: %s, Found: %s', v_rec.id, v_calculated_hash, v_rec.hash);
      RETURN;
    END IF;

    -- Step to next hash
    v_prev_expected_hash := v_rec.hash;
  END LOOP;

  -- If chain passed all checks
  RETURN QUERY SELECT
    true,
    v_count,
    NULL::UUID,
    NULL::TIMESTAMPTZ,
    format('Tamper-evident hash chain verified across %s audit events', v_count);
  RETURN;
END;
$$;

COMMENT ON FUNCTION verify_audit_hash_chain IS 'Invariant INV-02 mathematical audit verification against unauthorized database mutation';
