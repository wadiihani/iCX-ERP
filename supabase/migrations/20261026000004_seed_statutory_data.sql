-- =============================================================================
-- AIESEC iCX ERP — Migration 000004: Statutory Seed Data
-- Populates 48 Thresholds, 18 Standards Catalog (2024), GV Portfolio, AFPM Accounts, and LC Rabat
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. LOCAL COMMITTEE SEED (LC Rabat)
-- -----------------------------------------------------------------------------

INSERT INTO local_committees (id, lc_code, lc_name, country_code, expa_office_id, timezone, currency_code, multi_lc_enabled)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'LC_RABAT',
  'AIESEC in Rabat',
  'MA',
  2168, -- EXPA Office ID for Rabat
  'Africa/Casablanca',
  'MAD',
  false
) ON CONFLICT (lc_code) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 2. FEATURE FLAGS (Default Safe State)
-- -----------------------------------------------------------------------------

INSERT INTO feature_flags (flag_key, is_enabled, description) VALUES
  ('multi_lc', false, 'Enable multi-tenancy for national scale (MC Morocco)'),
  ('expa_scheduled_sync', false, 'Enable automated 15-minute scheduled sync via service account'),
  ('expa_write_mutations', false, 'Enable direct GraphQL write mutations to EXPA (DEC-003 strictly requires false)'),
  ('enforce_strict_nda', true, 'Hard-block unaccepted NDAs server-side'),
  ('audit_log_tamper_alerts', true, 'Emit high-priority alerts on audit chain mismatch')
ON CONFLICT (flag_key) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 3. THE 48 THRESHOLDS REGISTER (Section 6, THR-001 to THR-048)
-- -----------------------------------------------------------------------------

INSERT INTO config_thresholds (threshold_code, name, numeric_value, text_value, unit, basis, evidence_id, epistemic_status) VALUES
  ('THR-001', 'iGV duration', 6.00, '6–8 weeks', 'weeks', 'GP', 'EV-01', 'SPEC-CLAIM'),
  ('THR-002', 'iGV weekly hours', 25.00, '25–40 h', 'hours/week', 'GP', 'EV-01', 'SPEC-CLAIM'),
  ('THR-003', 'iGTa duration', 6.00, '6–78 weeks', 'weeks', 'GP', 'EV-01', 'SPEC-CLAIM'),
  ('THR-004', 'iGTa/iGTe weekly hours', 35.00, '35–45 h', 'hours/week', 'GP', 'EV-01', 'SPEC-CLAIM'),
  ('THR-005', 'iGTe duration', 9.00, '9–78 weeks', 'weeks', 'GP', 'EV-01', 'SPEC-CLAIM'),
  ('THR-006', 'Partly remote minimum total duration', 13.00, '13 weeks', 'weeks', 'GP', 'EV-01', 'SPEC-CLAIM'),
  ('THR-007', 'Partly remote max remote share', 50.00, '50%', 'percent', 'GP', 'EV-01', 'SPEC-CLAIM'),
  ('THR-008', 'Fully remote duration', 6.00, '6–26 weeks', 'weeks', 'GP', 'EV-01', 'SPEC-CLAIM'),
  ('THR-009', 'iGV minimum external funding coverage', 70.00, '70–100%', 'percent', 'GP', 'EV-02', 'SPEC-CLAIM'),
  ('THR-010', 'Account manager assignment', 7.00, '7 days', 'days', 'GP', 'EV-02', 'SPEC-CLAIM'),
  ('THR-011', 'Slot opening horizon', 365.00, '≤ 365 days ahead', 'days', 'GP', 'EV-02', 'SPEC-CLAIM'),
  ('THR-012', 'OP unjustified rejections', 3.00, 'warn at 3, escalate above 3', 'count', 'GP', 'EV-01', 'SPEC-CLAIM'),
  ('THR-013', 'Post-approval responsible-contact', 7.00, '7 days', 'days', 'GP', 'EV-01', 'SPEC-CLAIM'),
  ('THR-014', 'Post-approval visa pack + expectation setting', 14.00, '14 days', 'days', 'GP', 'EV-01', 'SPEC-CLAIM'),
  ('THR-015', 'EP visa: status update / application', 7.00, '7 days / 14 days', 'days', 'GP', 'EV-01', 'SPEC-CLAIM'),
  ('THR-016', 'Cancellation cutoff before realization', 28.00, 'GV 28d / GT 56d', 'days', 'GP', 'EV-01', 'SPEC-CLAIM'),
  ('THR-017', 'Partner agreement minimum term', 365.00, '365 days (1 year)', 'days', 'GP', 'EV-02', 'SPEC-CLAIM'),
  ('THR-018', 'Passport validity beyond exchange end', 180.00, '≥ 6 months', 'days', 'GP', 'EV-01', 'SPEC-CLAIM'),
  ('THR-019', 'iGV realization tolerance vs. slot start', 20.00, '±20 days', 'days', 'GP', 'EV-02', 'SPEC-CLAIM'),
  ('THR-020', 'Unreachable EP alert', 48.00, '48 hours (2 working days)', 'hours', 'GP', 'EV-01', 'SPEC-CLAIM'),
  ('THR-021', 'Crisis report deadline', 24.00, '24 hours', 'hours', 'GP', 'EV-02', 'SPEC-CLAIM'),
  ('THR-022', 'Touchpoint cadence', 14.00, 'GV 14d / GT 30d', 'days', 'GP', 'EV-07', 'SPEC-CLAIM'),
  ('THR-023', 'Salary delay fine rate', 2.00, '2% daily fine after day 30', 'percent/day', 'GP', 'EV-04', 'SPEC-CLAIM'),
  ('THR-024', 'Unlawful dismissal completion threshold', 70.00, '70% duration', 'percent', 'GP', 'EV-04', 'SPEC-CLAIM'),
  ('THR-025', 'Replacement window', 14.00, 'APD break 14d / RE break 7d', 'days', 'GP', 'EV-04', 'SPEC-CLAIM'),
  ('THR-026', 'Case-solving clocks', 24.00, 'Stage 1: 24/48/72h; Stage 2: 48/48/96h', 'hours', 'GP', 'EV-02', 'SPEC-CLAIM'),
  ('THR-027', 'Harassment committee start clock', 24.00, 'start within 24h; report 7d', 'hours', 'GP', 'EV-03', 'SPEC-CLAIM'),
  ('THR-028', 'Appeal window', 48.00, '48h leave; 72h submission', 'hours', 'GP', 'EV-06', 'SPEC-CLAIM'),
  ('THR-029', 'AR overdue threshold', 14.00, 'flag at 14d; escalate at 30d', 'days', 'GP', 'EV-09', 'SPEC-CLAIM'),
  ('THR-030', 'Sustainability ratio floor', 1.00, 'floor > 1.0; target 1.25', 'ratio', 'GP', 'EV-09', 'SPEC-CLAIM'),
  ('THR-031', 'CO evaluation rule', 13.00, '13/13 Mandatory + ≥3/5 Non-Mandatory', 'count', 'GP', 'EV-07', 'SPEC-CLAIM'),
  ('THR-032', 'First contact with applicant SLA', 24.00, '24 hours; escalate at 48h', 'hours', 'LR', 'EV-11', 'CONFIRMED-LOCAL'),
  ('THR-033', 'OP candidate review SLA', 72.00, '72 hours (3 days)', 'hours', 'LR', 'EV-11', 'CONFIRMED-LOCAL'),
  ('THR-034', 'Accepted to approved target', 48.00, '48–72 hours', 'hours', 'LR', 'EV-11', 'CONFIRMED-LOCAL'),
  ('THR-035', 'Pre-arrival reconfirmation lock', 14.00, '14 days before arrival', 'days', 'LR', 'EV-11', 'CONFIRMED-LOCAL'),
  ('THR-036', 'Pickup instructions lead time', 3.00, '3 days before arrival', 'days', 'GP', 'EV-07', 'SPEC-CLAIM'),
  ('THR-037', 'Departure support lead time', 14.00, '14 days before finish', 'days', 'GP', 'EV-07', 'SPEC-CLAIM'),
  ('THR-038', 'Extension request notice', 14.00, '≥ 14 days before end', 'days', 'GP', 'EV-01', 'SPEC-CLAIM'),
  ('THR-039', 'Stale deal inactivity flag', 7.00, 'flag at 7d; escalate at 14d', 'days', 'LR', 'EV-11', 'CONFIRMED-LOCAL'),
  ('THR-040', 'Outreach follow-up cadence', 3.00, 'T+3 and T+7 business days', 'business_days', 'LR', 'EV-11', 'CONFIRMED-LOCAL'),
  ('THR-041', 'Contract renewal notice', 30.00, '30 days before expiry', 'days', 'LR', 'EV-11', 'CONFIRMED-LOCAL'),
  ('THR-042', 'Match score weights', 100.00, 'visa:30, lang:25, sdg:25, avail:20', 'points', 'DS', NULL, 'PROPOSED-DESIGN'),
  ('THR-043', 'Sync lag alert threshold', 60.00, '> 60 minutes', 'minutes', 'DS', NULL, 'PROPOSED-DESIGN'),
  ('THR-044', 'Action outbox expiry', 72.00, '72 hours', 'hours', 'DS', NULL, 'PROPOSED-DESIGN'),
  ('THR-045', 'Middle survey chase cadence', 7.00, 'day 7; escalate day 14', 'days', 'GP', 'EV-07', 'SPEC-CLAIM'),
  ('THR-046', 'Final survey chase cadence', 10.00, 'escalate at finish + 10 days', 'days', 'GP', 'EV-07', 'SPEC-CLAIM'),
  ('THR-047', 'Applicant age range', 18.00, '18–30 years', 'years', 'GP', 'EV-01', 'SPEC-CLAIM'),
  ('THR-048', 'Retention period general', 365.00, 'Pending privacy reviewer setting', 'days', 'LG', 'EV-12', 'OPEN-BLOCKING')
ON CONFLICT (threshold_code) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 4. THE 18 EXCHANGE STANDARDS CATALOG (2024 Refreshment)
-- -----------------------------------------------------------------------------

INSERT INTO exchange_standards_catalog (
  standard_number, standard_name, is_mandatory, responsible_party, survey_stage,
  applies_to_physical, applies_to_partly_remote, applies_to_fully_remote
) VALUES
  (1, 'Personal Goal Setting', true, 'SENDING_ENTITY', 'MIDDLE', true, true, true),
  (2, 'Outgoing Preparation', true, 'SENDING_ENTITY', 'MIDDLE', true, true, true),
  (3, 'Insurance', false, 'SENDING_ENTITY', 'MIDDLE', true, true, false),
  (4, 'Expectation Setting', true, 'HOST_ENTITY', 'MIDDLE', true, true, true),
  (5, 'Visa and Work Validity', true, 'HOST_ENTITY', 'MIDDLE', true, true, false),
  (6, 'Arrival Pickup', true, 'HOST_ENTITY', 'MIDDLE', true, true, false),
  (7, 'Accommodation', true, 'HOST_ENTITY', 'MIDDLE', true, true, false),
  (8, 'Incoming Preparation Seminar (IPS)', true, 'HOST_ENTITY', 'MIDDLE', true, true, true),
  (9, 'First Day of Work Accompaniment', true, 'HOST_ENTITY', 'MIDDLE', true, true, true),
  (10, 'Alignment with Opportunity Provider', true, 'HOST_ENTITY', 'MIDDLE_AND_FINAL', true, true, true),
  (11, 'Job Description Compliance', true, 'HOST_ENTITY', 'FINAL', true, true, true),
  (12, 'Working Hours Compliance', false, 'HOST_ENTITY', 'FINAL', true, true, false),
  (13, 'Duration Compliance', true, 'HOST_ENTITY', 'FINAL', true, true, true),
  (14, 'Opportunity Benefits', true, 'HOST_ENTITY', 'FINAL', true, true, false),
  (15, 'Value-Driven Leadership Education (LEAD)', false, 'HOST_ENTITY', 'FINAL', true, true, false),
  (16, 'Departure Support', false, 'HOST_ENTITY', 'FINAL', true, true, false),
  (17, 'Regular Touchpoints', false, 'BOTH_ENTITIES', 'FINAL', true, true, true),
  (18, 'Debrief with Sending Entity', true, 'SENDING_ENTITY', 'FINAL', true, true, true)
ON CONFLICT (standard_number) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 5. GLOBAL VOLUNTEER PORTFOLIO (2024–2026 Edition)
-- -----------------------------------------------------------------------------

INSERT INTO gv_portfolio_templates (project_code, project_name, sdg_goal, sdg_target, standard_jd_summary) VALUES
  ('GV-HEARTBEAT', 'Heartbeat', 3, '3.4', 'Promote healthy lifestyles, mental health awareness and physical well-being.'),
  ('GV-GLOBAL-CLASS', 'Global Classroom', 4, '4.1', 'Support primary and secondary education through interactive language and skill sessions.'),
  ('GV-YOUTH4IMPACT', 'Youth 4 Impact', 4, '4.7', 'Deliver interactive workshops on global citizenship, SDGs and leadership in schools.'),
  ('GV-RAISE-VOICE', 'Raise Your Voice', 5, '5.1', 'Advocate for gender equality, female empowerment, and women entrepreneurship.'),
  ('GV-CLEAN-WATER', 'Clean Water', 6, '6.b', 'Raise awareness regarding water sanitation, hygiene and water preservation practices.'),
  ('GV-SKILL-UP', 'Skill Up!', 8, '8.6', 'Provide digital, communication and employability skills to youth seeking work.'),
  ('GV-ON-THE-MAP', 'On The Map', 8, '8.9', 'Promote sustainable local tourism, cultural heritage, and local artisans.'),
  ('GV-EQUIFY', 'Equify', 10, '10.2', 'Empower underprivileged youth, refugees and marginalized communities through social activities.'),
  ('GV-SAFE-CITIES', 'Safe Cities', 11, '11.b', 'Collaborate with local communities on road safety, disaster resilience and civic spaces.'),
  ('GV-RESP-CONSUMP', 'Responsible Consumption', 12, '12.5', 'Implement waste reduction, recycling drives, and sustainable consumption education.'),
  ('GV-GREEN-LEAD', 'Green Leaders', 13, '13.3', 'Climate action education, tree planting, and local environmental advocacy campaigns.'),
  ('GV-AQUATICA', 'Aquatica', 14, '14.1', 'Marine conservation, coastal clean-ups, and ocean plastic pollution education.'),
  ('GV-ROOTED', 'Rooted', 15, '15.5', 'Biodiversity protection, reforestation, and ecological preservation initiatives.'),
  ('GV-PEACE', 'Peace', 16, '16.1', 'Conflict resolution workshops, anti-bullying campaigns, and peaceful civic engagement.'),
  ('GV-SCALE-UP', 'Scale Up!', 17, '17.17', 'Strengthen local NGO capacity, fundraising models, and partnership development.')
ON CONFLICT (project_code) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 6. AFPM OPERATIONAL CHART OF ACCOUNTS
-- -----------------------------------------------------------------------------

INSERT INTO afpm_accounts (account_code, account_name, category, is_direct_exchange) VALUES
  ('REV-EXCH-IGV', 'iGV Partner Affiliation Revenue', 'INFLOW_REVENUE', true),
  ('REV-EXCH-IGTA', 'iGTa Opportunity Inflow', 'INFLOW_REVENUE', true),
  ('REV-EXCH-IGTE', 'iGTe Opportunity Inflow', 'INFLOW_REVENUE', true),
  ('REV-SPONSOR-ART57', 'Commercial Sponsorship (CGI Art. 57)', 'INFLOW_REVENUE', false),
  ('REV-MECENAT-ART10', 'Patronage / Mécénat (CGI Art. 10)', 'INFLOW_REVENUE', false),
  ('EXP-DIRECT-ACCOMM', 'Direct EP Accommodation Costs', 'OUTFLOW_DIRECT', true),
  ('EXP-DIRECT-PICKUP', 'Direct Airport Pickup Logistics', 'OUTFLOW_DIRECT', true),
  ('EXP-DIRECT-IPS', 'Direct Incoming Preparation Seminar Costs', 'OUTFLOW_DIRECT', true),
  ('EXP-DIRECT-VISA', 'Direct Visa Documentation Logistics', 'OUTFLOW_DIRECT', true),
  ('EXP-OVERHEAD-GOV', 'Governance, Meetings & LCM Costs', 'OUTFLOW_OVERHEAD', false),
  ('EXP-OVERHEAD-TECH', 'IT Systems & Communications Overhead', 'OUTFLOW_OVERHEAD', false),
  ('EXP-CLAIM-COMPENS', 'Annex 2 Case Compensation Payouts', 'OUTFLOW_DIRECT', true)
ON CONFLICT (account_code) DO NOTHING;
