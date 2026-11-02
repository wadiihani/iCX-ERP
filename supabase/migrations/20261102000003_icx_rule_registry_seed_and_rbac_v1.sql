-- =============================================================================
-- AIESEC iCX ERP — Rule Registry Seed, Standard Definitions & RBAC v1.0
-- Author: Wadii Hani <wadii.hani.pro@gmail.com>
-- Specification: iCX_Data_Integrity_Tracking_Spec.md v1.0 (§3.4, §6.1, §12.4)
-- Milestone: M0 (Plan 00-03)
-- Enforces: INV-08 (Versioned Rules), INV-10 (Confidentiality & RBAC)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. SEED: RULE REGISTRY (§3.4)
-- -----------------------------------------------------------------------------

INSERT INTO rule_registry (key, value, effective_from, effective_to, source, note)
VALUES
  -- GV Duration Weeks: Legacy (6-8 weeks) vs ECBA 2026 Update (4-8 weeks)
  ('gv.duration_weeks', '{"min": 6, "max": 8}'::jsonb, '2020-01-01', '2025-12-31', 'S1, S7', 'Legacy GV duration rule (6-8 weeks)'),
  ('gv.duration_weeks', '{"min": 4, "max": 8}'::jsonb, '2026-01-01', NULL, 'S9', 'ECBA 2026 update: GV duration changed to 4-8 weeks'),

  -- GTe Short Experience Weeks
  ('gte.short_experience_weeks', '{"min": 6, "max": 12}'::jsonb, '2026-01-01', NULL, 'S9', 'ECBA 2026 update: previously 9-12 weeks'),

  -- GTa Duration Weeks
  ('gta.duration_weeks', 'null'::jsonb, '2020-01-01', NULL, 'S1', 'Source text garbled in legacy decks; unconstrained until national EB confirmation'),

  -- Working Hours
  ('hours.gv_per_week', '{"min": 25, "max": 45}'::jsonb, '2020-01-01', NULL, 'S1, S5', 'Mandatory weekly volunteer hours for GV'),
  ('hours.gta_gte_per_week', '{"min": 35, "max": 45}'::jsonb, '2020-01-01', NULL, 'S1, S5', 'Mandatory weekly internship hours for GTa/GTe'),

  -- Visa & Logistics Timelines
  ('visa.docs_due_days_after_approval', '14'::jsonb, '2020-01-01', NULL, 'S9', 'Host entity must deliver visa documentation within 14 days of approval'),
  ('departure_support.days_before_fi', '14'::jsonb, '2020-01-01', NULL, 'S1', 'Written legal and logistic departure procedure sent >= 14 days before FI'),
  ('early_fi.request_min_days_before_new_finish', '7'::jsonb, '2020-01-01', NULL, 'S2', 'Early finish request must be submitted >= 7 days before desired finish date'),
  ('extension_fi.request_min_days_before_finish', '14'::jsonb, '2020-01-01', NULL, 'S2', 'Extension request must be submitted >= 14 days before current finish date'),

  -- APD / RE Status Breaches
  ('apd_re_passed.gv_direct_break_after_days', '20'::jsonb, '2020-01-01', NULL, 'S2', 'GV: RE date passed > 20 days allows direct extraordinary break'),
  ('apd_re_passed.auto_violation_level', '5'::jsonb, '2020-01-01', NULL, 'S2', 'APD left after RE date constitutes fake status -> Level 5 violation'),

  -- Partner Account Management
  ('partner.closing_meeting_max_days_after_fi', '30'::jsonb, '2020-01-01', NULL, 'S5', 'Closing meeting must be held within 30 days of FI; cannot coincide with final review'),
  ('partner.nps_reminder_months_after_start', '1'::jsonb, '2020-01-01', NULL, 'S5', 'Partner NPS reminder trigger 1 month after start date'),
  ('partner.touchpoint_max_gap_days', '35'::jsonb, '2020-01-01', NULL, 'S5', 'Monthly partner check-in SLA (max 35 days between touchpoints)'),

  -- Statutory Compliance & Audit Cycles
  ('ecb.report_deadlines', '{"Q1": "04-28", "Q2": "07-28", "Q3": "10-28", "Q4": "01-28"}'::jsonb, '2026-01-01', NULL, 'S9', 'ECB statutory quarterly reporting deadlines (changed from 21st to 28th)'),
  ('icb.audit_check_months', '[3, 9]'::jsonb, '2020-01-01', NULL, 'S3', 'ICB bi-annual audit check months (March and September)'),

  -- System Configuration
  ('sync.max_age_hours', '24'::jsonb, '2020-01-01', NULL, 'CONFIG', 'Maximum allowed age of EXPA sync before triggering DQ-031 stale banner'),
  ('import.max_row_drop_pct', '5'::jsonb, '2020-01-01', NULL, 'CONFIG', 'Maximum allowed percentage drop in imported rows before quarantine (DQ-082)')
ON CONFLICT (key, effective_from) DO UPDATE SET
  value = EXCLUDED.value,
  effective_to = EXCLUDED.effective_to,
  source = EXCLUDED.source,
  note = EXCLUDED.note;

-- -----------------------------------------------------------------------------
-- 2. SEED: EXCHANGE STANDARDS DEFINITIONS (§6.1)
-- -----------------------------------------------------------------------------

INSERT INTO standard_def (std_no, name, phase, delivered_by, mandatory, yop_question, answer_options)
VALUES
  (1, 'Personal goal setting', 'preparation', 'Home entity (oGX)', false, 'Did your home entity support you in setting personal goals?', '["Yes", "No"]'::jsonb),
  (2, 'Outgoing preparation', 'preparation', 'Home entity (oGX)', false, 'Did you receive preparation from your home entity before departure?', '["Yes", "No"]'::jsonb),
  (3, 'Insurance', 'preparation', 'Home entity (oGX)', false, 'Did you have insurance coverage during your exchange?', '["Yes", "No"]'::jsonb),
  (4, 'Expectations setting', 'preparation', 'Host entity (iCX)', true, 'Did the host entity provide written preparation on culture, safety, and living conditions?', '["Yes", "No"]'::jsonb),
  (5, 'Visa and work permit', 'preparation', 'Host entity (iCX)', true, 'Did the host entity support you with necessary visa invitation letters and permits?', '["Yes", "No", "Visa not required", "Work permit not required"]'::jsonb),
  (6, 'Arrival pick-up', 'preparation', 'Host entity (iCX)', false, 'Were you picked up by an AIESEC representative upon arrival?', '["Yes", "No"]'::jsonb),
  (7, 'Accommodation', 'preparation', 'Host entity (iCX)', true, 'Did the accommodation match conditions promised and provide basic necessities?', '["Yes", "No"]'::jsonb),
  (8, 'Incoming preparation', 'preparation', 'Host entity (iCX)', true, 'Did you attend an incoming preparation seminar (IPS)?', '["Yes & attended", "Yes & did not attend", "No"]'::jsonb),
  (9, 'First day of work', 'experience', 'Host entity (iCX)', false, 'Did an AIESEC representative accompany you to your workplace on day 1?', '["Yes", "No"]'::jsonb),
  (10, 'Alignment spaces with opportunity provider', 'experience', 'Host entity (iCX)', true, 'Did you have structured alignment spaces with your project host?', '["Yes", "No"]'::jsonb),
  (11, 'Job description', 'experience', 'Host entity (iCX)', true, 'Did your daily tasks match the job description agreed upon?', '["Same JD", "Changed but agreed", "Changed, not agreed"]'::jsonb),
  (12, 'Working hours', 'experience', 'Host entity (iCX)', false, 'Did your weekly hours match what was specified on EXPA?', '["Yes", "No"]'::jsonb),
  (13, 'Duration', 'experience', 'Host entity (iCX)', true, 'Did the duration of your project match the approved timeline?', '["Same", "Changed but agreed", "Changed, not agreed"]'::jsonb),
  (14, 'Opportunity benefits', 'experience', 'Host entity (iCX)', true, 'Were all promised project benefits delivered?', '["Yes", "No", "No benefits specified"]'::jsonb),
  (15, 'Departure support', 'experience', 'Host entity (iCX)', false, 'Did you receive written departure support at least 14 days before finishing?', '["Yes", "No"]'::jsonb),
  (16, 'Debrief with AIESEC', 'post_experience', 'Home entity (oGX)', false, 'Did you participate in a debriefing space upon returning home?', '["Yes", "No"]'::jsonb)
ON CONFLICT (std_no) DO UPDATE SET
  name = EXCLUDED.name,
  phase = EXCLUDED.phase,
  delivered_by = EXCLUDED.delivered_by,
  mandatory = EXCLUDED.mandatory,
  yop_question = EXCLUDED.yop_question,
  answer_options = EXCLUDED.answer_options;

-- -----------------------------------------------------------------------------
-- 3. CONFIDENTIALITY & RBAC (INV-10, §12.4)
-- -----------------------------------------------------------------------------

-- Helper function to inspect user role
CREATE OR REPLACE FUNCTION fn_icx_current_role()
RETURNS text AS $$
BEGIN
  RETURN COALESCE(
    NULLIF(current_setting('app.current_user_role', true), ''),
    NULLIF(current_setting('request.jwt.claims', true)::jsonb->>'role', ''),
    'MEMBER'
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Helper function to inspect current user ID
CREATE OR REPLACE FUNCTION fn_icx_current_user_id()
RETURNS uuid AS $$
BEGIN
  RETURN NULLIF(
    COALESCE(
      NULLIF(current_setting('app.current_actor_id', true), ''),
      NULLIF(current_setting('request.jwt.claims', true)::jsonb->>'sub', '')
    ),
    ''
  )::uuid;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Redact EP contact data for non-privileged viewers
-- Privileged roles with full EP contact access: LCVP_ICX, ECB, MM (team leader), direct record owner
CREATE OR REPLACE FUNCTION fn_icx_can_view_ep_contact(
  p_ep_owner_id uuid,
  p_ep_team_id text DEFAULT NULL
)
RETURNS boolean AS $$
DECLARE
  v_role text;
  v_user_id uuid;
BEGIN
  v_role := fn_icx_current_role();
  v_user_id := fn_icx_current_user_id();

  -- LCVP_ICX, ECB, and ADMIN can view all EP contacts
  IF v_role IN ('LCVP_ICX', 'LCVP_IGV', 'ECB', 'ECB_AUDITOR', 'ADMIN') THEN
    RETURN true;
  END IF;

  -- Record owner can always view their own EP contact
  IF v_user_id IS NOT NULL AND v_user_id = p_ep_owner_id THEN
    RETURN true;
  END IF;

  -- Default: restricted
  RETURN false;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Log CSV/Full exports into audit_log (INV-09, T-19)
CREATE OR REPLACE FUNCTION fn_icx_log_export(
  p_scope text,
  p_row_count integer,
  p_format text DEFAULT 'CSV'
)
RETURNS bigint AS $$
DECLARE
  v_actor uuid;
  v_log_id bigint;
BEGIN
  v_actor := fn_icx_current_user_id();

  INSERT INTO audit_log (
    actor,
    action,
    table_name,
    record_id,
    before,
    after,
    request_id
  ) VALUES (
    v_actor,
    'EXPORT',
    p_scope,
    'export_batch_' || to_char(now(), 'YYYYMMDD_HH24MISS'),
    NULL,
    jsonb_build_object(
      'format', p_format,
      'row_count', p_row_count,
      'exported_at', now()
    ),
    current_setting('app.current_request_id', true)
  ) RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;
