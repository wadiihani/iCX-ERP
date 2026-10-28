-- =============================================================================
-- AIESEC iCX ERP — Migration 000003: Row-Level Security (RLS) & Tenant Isolation
-- Follows supabase-postgres-best-practices: (SELECT auth.uid()), cached lookups, indexes
-- Enforces REQ-003 (Server-Side RBAC) and REQ-004 (Cross-LC Isolation)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. HELPER FUNCTIONS FOR HIGH-PERFORMANCE RLS EVALUATION
-- -----------------------------------------------------------------------------

-- Get current authenticated user ID in application
CREATE OR REPLACE FUNCTION current_user_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT id FROM public.users
  WHERE aiesec_email = (SELECT auth.jwt()->>'email')
    AND status = 'ACTIVE'
    AND is_archived = false
  LIMIT 1;
$$;

-- Get current user's assigned Local Committee ID (cached per query)
CREATE OR REPLACE FUNCTION current_user_lc_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT lc_id FROM public.users
  WHERE id = (SELECT public.current_user_id());
$$;

-- Check if current user has an active role assignment
CREATE OR REPLACE FUNCTION has_active_role(p_role_code public.user_role_code)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.role_assignments
    WHERE user_id = (SELECT public.current_user_id())
      AND role_code = p_role_code
      AND CURRENT_DATE BETWEEN effective_from AND effective_to
      AND revoked_at IS NULL
  );
$$;

-- Check if current user is an authorized member of the Harassment Committee (Annex 1 Vault)
CREATE OR REPLACE FUNCTION is_harassment_committee_member()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT (
    public.has_active_role('LCP'::public.user_role_code) OR
    public.has_active_role('ECB_AUDITOR'::public.user_role_code) OR
    public.has_active_role('LCVP_ICX'::public.user_role_code)
  );
$$;

-- -----------------------------------------------------------------------------
-- 2. ENABLE ROW-LEVEL SECURITY ON ALL APPLICATION TABLES
-- -----------------------------------------------------------------------------

DO $$
DECLARE
  t TEXT;
  all_tables TEXT[] := ARRAY[
    'local_committees', 'users', 'role_assignments', 'nda_acceptances',
    'audit_events', 'pii_access_events', 'organizations', 'organization_contacts',
    'b2b_deals', 'partner_agreements', 'documents', 'communication_logs',
    'opportunities', 'opportunity_slots', 'ir_entities', 'ir_contacts',
    'ir_slot_allocations', 'shared_views', 'ep_profiles', 'ep_applications',
    'ep_readiness', 'ep_visa_records', 'ep_touchpoints', 'ep_standards_evidence',
    'ep_survey_responses', 'service_providers', 'accommodation_providers',
    'accommodation_units', 'accommodation_beds', 'accommodation_allocations',
    'pickup_missions', 'quality_cases', 'case_events', 'compensation_claims',
    'invoices', 'financial_transactions', 'approvals', 'tasks', 'governance_meetings',
    'notification_log', 'sync_runs', 'sync_staging', 'reconciliation_queue',
    'action_outbox', 'status_transitions'
  ];
BEGIN
  FOREACH t IN ARRAY all_tables LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
  END LOOP;
END;
$$;

-- -----------------------------------------------------------------------------
-- 3. CORE TENANT ISOLATION POLICIES (REQ-004)
-- -----------------------------------------------------------------------------

-- Organizations: users can only view and update organizations in their own LC
CREATE POLICY org_tenant_isolation_select ON organizations
FOR SELECT USING (
  lc_id = (SELECT public.current_user_lc_id())
);

CREATE POLICY org_tenant_isolation_insert ON organizations
FOR INSERT WITH CHECK (
  lc_id = (SELECT public.current_user_lc_id())
);

CREATE POLICY org_tenant_isolation_update ON organizations
FOR UPDATE USING (
  lc_id = (SELECT public.current_user_lc_id())
) WITH CHECK (
  lc_id = (SELECT public.current_user_lc_id())
);

-- B2B Deals: isolated by LC
CREATE POLICY deals_tenant_isolation ON b2b_deals
FOR ALL USING (
  lc_id = (SELECT public.current_user_lc_id())
) WITH CHECK (
  lc_id = (SELECT public.current_user_lc_id())
);

-- Partner Agreements: isolated by LC
CREATE POLICY agreements_tenant_isolation ON partner_agreements
FOR ALL USING (
  lc_id = (SELECT public.current_user_lc_id())
) WITH CHECK (
  lc_id = (SELECT public.current_user_lc_id())
);

-- Opportunities & Slots: isolated by LC
CREATE POLICY opp_tenant_isolation ON opportunities
FOR ALL USING (
  lc_id = (SELECT public.current_user_lc_id())
) WITH CHECK (
  lc_id = (SELECT public.current_user_lc_id())
);

CREATE POLICY slots_tenant_isolation ON opportunity_slots
FOR ALL USING (
  lc_id = (SELECT public.current_user_lc_id())
) WITH CHECK (
  lc_id = (SELECT public.current_user_lc_id())
);

-- Applications & Readiness: isolated by LC
CREATE POLICY apps_tenant_isolation ON ep_applications
FOR ALL USING (
  lc_id = (SELECT public.current_user_lc_id())
) WITH CHECK (
  lc_id = (SELECT public.current_user_lc_id())
);

CREATE POLICY readiness_tenant_isolation ON ep_readiness
FOR ALL USING (
  application_id IN (
    SELECT id FROM public.ep_applications
    WHERE lc_id = (SELECT public.current_user_lc_id())
  )
);

-- Accommodation Allocations: isolated by bed provider's LC
CREATE POLICY alloc_tenant_isolation ON accommodation_allocations
FOR ALL USING (
  application_id IN (
    SELECT id FROM public.ep_applications
    WHERE lc_id = (SELECT public.current_user_lc_id())
  )
);

-- Quality Cases (REQ-080: Harassment Vault Protection)
CREATE POLICY quality_cases_tenant_isolation ON quality_cases
FOR ALL USING (
  lc_id = (SELECT public.current_user_lc_id())
  AND (
    is_harassment_vault = false
    OR (SELECT public.is_harassment_committee_member())
  )
);

-- Invoices & Finance: isolated by LC
CREATE POLICY invoices_tenant_isolation ON invoices
FOR ALL USING (
  lc_id = (SELECT public.current_user_lc_id())
);

CREATE POLICY tx_tenant_isolation ON financial_transactions
FOR ALL USING (
  lc_id = (SELECT public.current_user_lc_id())
);

-- Tasks: isolated by LC
CREATE POLICY tasks_tenant_isolation ON tasks
FOR ALL USING (
  lc_id = (SELECT public.current_user_lc_id())
);

-- Action Outbox: isolated by LC
CREATE POLICY outbox_tenant_isolation ON action_outbox
FOR ALL USING (
  lc_id = (SELECT public.current_user_lc_id())
);

-- Audit Events: read-only for current LC (ADMIN / LCP / Auditor)
CREATE POLICY audit_events_tenant_select ON audit_events
FOR SELECT USING (
  lc_id = (SELECT public.current_user_lc_id())
);

-- Public Reference Catalogs: readable by all authenticated users
CREATE POLICY catalog_public_select ON exchange_standards_catalog FOR SELECT TO authenticated USING (true);
CREATE POLICY gv_portfolio_public_select ON gv_portfolio_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY thresholds_public_select ON config_thresholds FOR SELECT TO authenticated USING (true);
CREATE POLICY evidence_public_select ON policy_evidence FOR SELECT TO authenticated USING (true);
CREATE POLICY afpm_public_select ON afpm_accounts FOR SELECT TO authenticated USING (true);
CREATE POLICY visa_regime_public_select ON visa_regime_reference FOR SELECT TO authenticated USING (true);
