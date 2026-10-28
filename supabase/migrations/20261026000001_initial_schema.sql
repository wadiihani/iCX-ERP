-- =============================================================================
-- AIESEC iCX ERP — Migration 000001: Normalized Relational Schema (54 Tables)
-- Authoritative Specification: AIESEC iCX ERP Master Specification v2.0.0
-- Database: PostgreSQL 16 (Managed via Supabase / Supabase Best Practices)
-- Primary Deployment Target: AIESEC in Rabat, Morocco (LC Rabat · MC Morocco)
-- =============================================================================

-- Enable mandatory extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- Set default timezone for session
SET timezone = 'Africa/Casablanca';

-- -----------------------------------------------------------------------------
-- 1. ENUMS & DOMAIN TYPES
-- -----------------------------------------------------------------------------

CREATE TYPE user_status AS ENUM ('INVITED', 'NDA_PENDING', 'ACTIVE', 'SUSPENDED', 'DEACTIVATED');
CREATE TYPE user_role_code AS ENUM (
  'MEMBER_BD', 'MEMBER_CXP', 'MM_EXTERNAL', 'MM_INTERNAL',
  'LCVP_ICX', 'LCVP_FNL', 'LCP', 'ECB_AUDITOR', 'ADMIN'
);
CREATE TYPE product_type AS ENUM ('iGV', 'iGTa', 'iGTe');
CREATE TYPE modality_type AS ENUM ('PHYSICAL', 'PARTLY_REMOTE', 'FULLY_REMOTE');
CREATE TYPE b2b_deal_stage AS ENUM (
  'LEAD', 'CONTACTED', 'DISCOVERY_SCHEDULED', 'DISCOVERY_COMPLETED',
  'PROPOSAL_SENT', 'NEGOTIATION', 'CONTRACT_SIGNED', 'CLOSED_LOST', 'DISQUALIFIED'
);
CREATE TYPE agreement_status_type AS ENUM (
  'DRAFT', 'UNDER_REVIEW', 'APPROVED_FOR_SIGNATURE', 'SIGNED', 'ACTIVE', 'EXPIRING', 'EXPIRED', 'RENEWED', 'TERMINATED'
);
CREATE TYPE opportunity_status_type AS ENUM (
  'DRAFT', 'VALIDATION_PENDING', 'READY_TO_PUBLISH', 'LIVE_ON_EXPA', 'PAUSED_SUSPENDED', 'CLOSED'
);
CREATE TYPE slot_status_type AS ENUM ('OPEN', 'FULL', 'CANCELLED', 'COMPLETED');
CREATE TYPE ep_readiness_status AS ENUM (
  'APPLIED', 'FIRST_CONTACTED', 'HOST_SCREENING', 'SHORTLISTED', 'OP_REVIEW',
  'ACCEPTED_BY_HOST', 'PRE_APPROVAL_AUDIT', 'READY_FOR_HUMAN_APPROVAL',
  'APPROVED_PENDING_DOCS', 'DOCS_ISSUED', 'VISA_APPLIED', 'VISA_APPROVED',
  'PRE_ARRIVAL_LOCKED', 'ARRIVAL_CLEARED', 'PICKUP_COMPLETED',
  'DAY1_DONE', 'REALIZED_ONGOING', 'FINISHED_DEBRIEFED', 'COMPLETED_VERIFIED',
  'REJECTED', 'WITHDRAWN', 'APPROVAL_BROKEN', 'REALIZATION_BROKEN'
);
CREATE TYPE accommodation_provider_type AS ENUM ('GLOBAL_HOST_FAMILY', 'PARTNER_HOSTEL', 'RENTED_APARTMENT', 'OP_DORMITORY');
CREATE TYPE vetting_status_type AS ENUM ('PENDING_INSPECTION', 'APPROVED_VETTED', 'SUSPENDED', 'BLACKLISTED');
CREATE TYPE bed_gender_restriction AS ENUM ('FEMALE_ONLY', 'MALE_ONLY', 'COED_PRIVATE');
CREATE TYPE alloc_status_type AS ENUM ('RESERVED_LOCKED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED');
CREATE TYPE standard_phase_type AS ENUM ('PRE_ARRIVAL', 'WEEK_1_MIDDLE', 'ONGOING_DELIVERY', 'FINAL_COMPLETION');
CREATE TYPE standard_delivery_status AS ENUM ('PENDING', 'DELIVERED_VERIFIED', 'BREACHED', 'NOT_APPLICABLE_REMOTE');
CREATE TYPE survey_response_type AS ENUM ('UNANSWERED', 'YES_FULFILLED', 'NO_UNFULFILLED');
CREATE TYPE case_category_type AS ENUM (
  'VISA_DELAY_REJECTION', 'ACCOMMODATION_SUBSTANDARD', 'JD_HOURS_MISMATCH',
  'SALARY_DELAY_UNPAID', 'UNLAWFUL_DISMISSAL', 'HARASSMENT_VIOLENCE_ANNEX1',
  'EP_UNREACHABLE_SAFETY', 'FAKE_STATUS_OCCA', 'EARLY_FINISH_EXTENSION'
);
CREATE TYPE case_stage_type AS ENUM (
  'STAGE_1_LC_TO_LC', 'STAGE_2_ECB_TO_ECB', 'STAGE_3_ICB_OCA',
  'STAGE_3_ICB_OCCA', 'URGENCY_PROTOCOL_48H', 'HARASSMENT_COMMITTEE',
  'RESOLVED_CLOSED', 'APPEALED_ANNEX9'
);
CREATE TYPE invoice_status_type AS ENUM (
  'DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE_FLAGGED', 'RECONCILED', 'DISPUTED', 'VOID'
);
CREATE TYPE outbox_status_type AS ENUM (
  'DRAFT', 'BLOCKED', 'READY_FOR_HUMAN', 'OPENED_EXTERNALLY', 'AWAITING_READBACK',
  'CONFIRMED', 'EXPIRED', 'CANCELLED', 'FAILED', 'NEEDS_REVIEW'
);
CREATE TYPE sync_run_mode AS ENUM ('SCHEDULED_SERVICE', 'MANUAL_USER_SESSION', 'CSV_FALLBACK_IMPORT');
CREATE TYPE sync_run_status AS ENUM ('SCHEDULED', 'RUNNING', 'SUCCEEDED', 'PARTIAL', 'FAILED');

-- -----------------------------------------------------------------------------
-- 2. DOMAIN 1: CORE GOVERNANCE, AUDIT & THRESHOLDS (Tables 1 to 15)
-- -----------------------------------------------------------------------------

-- 1. local_committees
CREATE TABLE local_committees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lc_code VARCHAR(40) UNIQUE NOT NULL,
  lc_name VARCHAR(120) NOT NULL,
  country_code VARCHAR(2) NOT NULL DEFAULT 'MA',
  expa_office_id INT UNIQUE,
  timezone VARCHAR(60) NOT NULL DEFAULT 'Africa/Casablanca',
  currency_code VARCHAR(3) NOT NULL DEFAULT 'MAD',
  multi_lc_enabled BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  archived_at TIMESTAMPTZ,
  archived_by UUID,
  archive_reason TEXT,
  row_version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID
);

-- 2. users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lc_id UUID NOT NULL REFERENCES local_committees(id),
  aiesec_email VARCHAR(180) UNIQUE NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  expa_person_id INT UNIQUE,
  phone_whatsapp VARCHAR(30),
  status user_status NOT NULL DEFAULT 'INVITED',
  nda_accepted_at TIMESTAMPTZ,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  archived_at TIMESTAMPTZ,
  archived_by UUID,
  archive_reason TEXT,
  row_version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID
);
CREATE INDEX idx_users_lc_id ON users(lc_id);
CREATE INDEX idx_users_email ON users(aiesec_email);

-- 3. role_assignments
CREATE TABLE role_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lc_id UUID NOT NULL REFERENCES local_committees(id),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_code user_role_code NOT NULL,
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to DATE NOT NULL,
  approved_by UUID NOT NULL REFERENCES users(id),
  revoked_at TIMESTAMPTZ,
  revocation_reason TEXT,
  row_version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  CONSTRAINT chk_no_self_role_approval CHECK (user_id != approved_by)
);
CREATE INDEX idx_role_assignments_user ON role_assignments(user_id);
CREATE INDEX idx_role_assignments_lc ON role_assignments(lc_id);

-- 4. nda_acceptances
CREATE TABLE nda_acceptances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nda_version VARCHAR(30) NOT NULL,
  ip_address VARCHAR(60),
  user_agent TEXT,
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  row_version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID
);
CREATE INDEX idx_nda_user ON nda_acceptances(user_id);

-- 5. audit_events (INV-02: Append-only with SHA-256 hash chaining)
CREATE TABLE audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lc_id UUID REFERENCES local_committees(id),
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actor_user_id UUID REFERENCES users(id),
  actor_service VARCHAR(80),
  action VARCHAR(80) NOT NULL,
  object_type VARCHAR(80) NOT NULL,
  object_id UUID NOT NULL,
  outcome VARCHAR(30) NOT NULL DEFAULT 'SUCCESS',
  reason TEXT,
  correlation_id UUID,
  changed_fields JSONB,
  prev_hash VARCHAR(64) NOT NULL,
  hash VARCHAR(64) NOT NULL
);
CREATE INDEX idx_audit_lc_id ON audit_events(lc_id);
CREATE INDEX idx_audit_object ON audit_events(object_type, object_id);
CREATE INDEX idx_audit_occurred_at ON audit_events(occurred_at DESC);

-- 6. pii_access_events
CREATE TABLE pii_access_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lc_id UUID NOT NULL REFERENCES local_committees(id),
  accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accessor_user_id UUID NOT NULL REFERENCES users(id),
  data_subject_type VARCHAR(60) NOT NULL,
  data_subject_id UUID NOT NULL,
  fields_accessed TEXT[] NOT NULL,
  access_purpose TEXT NOT NULL,
  ip_address VARCHAR(60)
);
CREATE INDEX idx_pii_access_lc ON pii_access_events(lc_id);

-- 7. config_thresholds
CREATE TABLE config_thresholds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  threshold_code VARCHAR(30) UNIQUE NOT NULL,
  name VARCHAR(120) NOT NULL,
  numeric_value NUMERIC(12,2),
  text_value VARCHAR(120),
  unit VARCHAR(30),
  basis VARCHAR(10) NOT NULL,
  evidence_id VARCHAR(30),
  epistemic_status VARCHAR(40) NOT NULL DEFAULT 'SPEC-CLAIM',
  scope VARCHAR(40) NOT NULL DEFAULT 'GLOBAL',
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to DATE,
  row_version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID
);

-- 8. policy_evidence
CREATE TABLE policy_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evidence_code VARCHAR(30) UNIQUE NOT NULL,
  claim TEXT NOT NULL,
  source_title VARCHAR(200) NOT NULL,
  source_version VARCHAR(60),
  source_url_or_ref TEXT,
  epistemic_label VARCHAR(40) NOT NULL DEFAULT 'SPEC-CLAIM',
  owner_role VARCHAR(60) NOT NULL,
  reviewer_name VARCHAR(120),
  reviewed_at TIMESTAMPTZ,
  row_version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID
);

-- 9. working_calendar
CREATE TABLE working_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lc_id UUID NOT NULL REFERENCES local_committees(id),
  calendar_date DATE NOT NULL,
  is_working_day BOOLEAN NOT NULL DEFAULT true,
  holiday_name VARCHAR(120),
  notes TEXT,
  UNIQUE(lc_id, calendar_date)
);
CREATE INDEX idx_working_cal_lookup ON working_calendar(lc_id, calendar_date);

-- 10. feature_flags
CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_key VARCHAR(80) UNIQUE NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES users(id)
);

-- 11. gv_portfolio_templates
CREATE TABLE gv_portfolio_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_code VARCHAR(30) UNIQUE NOT NULL,
  project_name VARCHAR(150) NOT NULL,
  sdg_goal INT NOT NULL CHECK (sdg_goal BETWEEN 1 AND 17),
  sdg_target VARCHAR(20) NOT NULL,
  standard_jd_summary TEXT NOT NULL,
  portfolio_edition VARCHAR(40) NOT NULL DEFAULT '2024-2026',
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- 12. exchange_standards_catalog
CREATE TABLE exchange_standards_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  standard_number INT UNIQUE NOT NULL CHECK (standard_number BETWEEN 1 AND 18),
  standard_name VARCHAR(150) NOT NULL,
  is_mandatory BOOLEAN NOT NULL,
  responsible_party VARCHAR(40) NOT NULL,
  survey_stage VARCHAR(30) NOT NULL,
  applies_to_physical BOOLEAN NOT NULL DEFAULT true,
  applies_to_partly_remote BOOLEAN NOT NULL DEFAULT true,
  applies_to_fully_remote BOOLEAN NOT NULL DEFAULT false,
  version VARCHAR(20) NOT NULL DEFAULT '2024'
);

-- 13. mc_fee_tariffs
CREATE TABLE mc_fee_tariffs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code VARCHAR(2) NOT NULL DEFAULT 'MA',
  term_code VARCHAR(20) NOT NULL,
  product_code product_type NOT NULL,
  min_partner_fee_mad NUMERIC(10,2) NOT NULL,
  max_ep_fee_mad NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  mc_affiliation_split_pct NUMERIC(5,2) NOT NULL DEFAULT 30.00,
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(country_code, term_code, product_code)
);

-- 14. visa_regime_reference
CREATE TABLE visa_regime_reference (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nationality_code VARCHAR(3) UNIQUE NOT NULL,
  country_name VARCHAR(100) NOT NULL,
  entry_regime VARCHAR(40) NOT NULL, -- 'VISA_FREE', 'AEVM_EVISA', 'EMBASSY_CONSULAR'
  standard_lead_time_days INT NOT NULL DEFAULT 14,
  official_source_ref TEXT,
  reviewed_at DATE
);

-- 15. afpm_accounts
CREATE TABLE afpm_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_code VARCHAR(30) UNIQUE NOT NULL,
  account_name VARCHAR(150) NOT NULL,
  category VARCHAR(60) NOT NULL, -- 'INFLOW_REVENUE', 'OUTFLOW_DIRECT', 'OUTFLOW_OVERHEAD'
  is_direct_exchange BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- -----------------------------------------------------------------------------
-- 3. DOMAIN 2: STAKEHOLDERS, CRM, B2B & CONTRACTS (Tables 16 to 23)
-- -----------------------------------------------------------------------------

-- 16. organizations
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lc_id UUID NOT NULL REFERENCES local_committees(id),
  legal_name VARCHAR(200) NOT NULL,
  normalized_name VARCHAR(200) NOT NULL,
  org_type VARCHAR(60) NOT NULL,
  city VARCHAR(80) NOT NULL,
  full_address TEXT,
  ice_number VARCHAR(15), -- 15 digits Moroccan Corporate Identifier
  rc_number VARCHAR(40),
  legal_form VARCHAR(80),
  tax_regime VARCHAR(80), -- Reviewer-set CGI Art. 57 or Mécénat
  status VARCHAR(40) NOT NULL DEFAULT 'ACTIVE',
  expa_company_id INT,
  bd_owner_user_id UUID REFERENCES users(id),
  cxp_owner_user_id UUID REFERENCES users(id),
  relationship_health_score NUMERIC(5,2) DEFAULT 100.0,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  archived_at TIMESTAMPTZ,
  archived_by UUID,
  archive_reason TEXT,
  row_version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  CONSTRAINT chk_ice_length CHECK (ice_number IS NULL OR LENGTH(ice_number) = 15)
);
CREATE INDEX idx_org_lc_id ON organizations(lc_id);
CREATE INDEX idx_org_normalized ON organizations(normalized_name, city);

-- 17. organization_contacts
CREATE TABLE organization_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lc_id UUID NOT NULL REFERENCES local_committees(id),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  full_name VARCHAR(150) NOT NULL,
  job_title VARCHAR(120),
  contact_role VARCHAR(60), -- 'SUPERVISOR', 'SIGNATORY', 'BILLING'
  email VARCHAR(180),
  phone_e164 VARCHAR(30),
  preferred_language VARCHAR(5) NOT NULL DEFAULT 'FR',
  preferred_channel VARCHAR(30) NOT NULL DEFAULT 'WHATSAPP',
  is_primary BOOLEAN NOT NULL DEFAULT false,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  archived_at TIMESTAMPTZ,
  archived_by UUID,
  archive_reason TEXT,
  row_version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID
);
CREATE INDEX idx_org_contacts_org ON organization_contacts(org_id);

-- 18. b2b_deals
CREATE TABLE b2b_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lc_id UUID NOT NULL REFERENCES local_committees(id),
  org_id UUID NOT NULL REFERENCES organizations(id),
  deal_title VARCHAR(200) NOT NULL,
  owner_user_id UUID NOT NULL REFERENCES users(id),
  target_product product_type NOT NULL,
  target_slots INT NOT NULL DEFAULT 1,
  stage b2b_deal_stage NOT NULL DEFAULT 'LEAD',
  discovery_notes JSONB,
  loss_reason TEXT,
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_archived BOOLEAN NOT NULL DEFAULT false,
  archived_at TIMESTAMPTZ,
  archived_by UUID,
  archive_reason TEXT,
  row_version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID
);
CREATE INDEX idx_deals_lc_stage ON b2b_deals(lc_id, stage);
CREATE INDEX idx_deals_org ON b2b_deals(org_id);

-- 19. partner_agreements
CREATE TABLE partner_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lc_id UUID NOT NULL REFERENCES local_committees(id),
  org_id UUID NOT NULL REFERENCES organizations(id),
  funder_org_id UUID REFERENCES organizations(id),
  funder_coverage_pct NUMERIC(5,2) DEFAULT 0.0,
  agreement_number VARCHAR(60) UNIQUE NOT NULL,
  status agreement_status_type NOT NULL DEFAULT 'DRAFT',
  effective_start_date DATE NOT NULL,
  expiration_date DATE NOT NULL,
  signed_document_id UUID,
  reviewed_by_user_id UUID REFERENCES users(id),
  approved_by_user_id UUID REFERENCES users(id),
  is_archived BOOLEAN NOT NULL DEFAULT false,
  archived_at TIMESTAMPTZ,
  archived_by UUID,
  archive_reason TEXT,
  row_version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  CONSTRAINT chk_agreement_term CHECK (expiration_date >= effective_start_date + INTERVAL '365 days')
);
CREATE INDEX idx_agreements_lc_id ON partner_agreements(lc_id);
CREATE INDEX idx_agreements_org ON partner_agreements(org_id);

-- 20. documents
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lc_id UUID NOT NULL REFERENCES local_committees(id),
  doc_type VARCHAR(60) NOT NULL,
  title VARCHAR(200) NOT NULL,
  storage_path TEXT NOT NULL,
  sha256_hash VARCHAR(64) NOT NULL,
  version INT NOT NULL DEFAULT 1,
  signer_evidence JSONB,
  expires_at TIMESTAMPTZ,
  access_class VARCHAR(20) NOT NULL DEFAULT 'CONFIDENTIAL',
  is_archived BOOLEAN NOT NULL DEFAULT false,
  archived_at TIMESTAMPTZ,
  archived_by UUID,
  archive_reason TEXT,
  row_version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID
);
CREATE INDEX idx_docs_lc ON documents(lc_id);

-- 21. communication_logs
CREATE TABLE communication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lc_id UUID NOT NULL REFERENCES local_committees(id),
  stakeholder_type VARCHAR(40) NOT NULL,
  stakeholder_id UUID NOT NULL,
  channel VARCHAR(30) NOT NULL,
  direction VARCHAR(10) NOT NULL,
  outcome VARCHAR(60) NOT NULL,
  template_version VARCHAR(30),
  thread_ref TEXT,
  notes TEXT,
  logged_by_user_id UUID NOT NULL REFERENCES users(id),
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_comm_stakeholder ON communication_logs(stakeholder_type, stakeholder_id);

-- 22. opportunities
CREATE TABLE opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lc_id UUID NOT NULL REFERENCES local_committees(id),
  org_id UUID NOT NULL REFERENCES organizations(id),
  agreement_id UUID NOT NULL REFERENCES partner_agreements(id),
  supervisor_contact_id UUID NOT NULL REFERENCES organization_contacts(id),
  product_code product_type NOT NULL,
  modality_code modality_type NOT NULL DEFAULT 'PHYSICAL',
  title VARCHAR(200) NOT NULL,
  gv_project_id UUID REFERENCES gv_portfolio_templates(id),
  professional_field VARCHAR(100),
  working_hours_per_week INT NOT NULL,
  duration_weeks INT NOT NULL,
  remote_duration_weeks INT DEFAULT 0,
  salary_amount_mad NUMERIC(10,2) DEFAULT 0.00,
  ep_project_fee_mad NUMERIC(10,2) DEFAULT 0.00,
  accommodation_provided BOOLEAN NOT NULL DEFAULT false,
  partly_remote_icb_audit_ref VARCHAR(100),
  account_manager_user_id UUID REFERENCES users(id),
  internal_status opportunity_status_type NOT NULL DEFAULT 'DRAFT',
  expa_opportunity_id INT UNIQUE,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  archived_at TIMESTAMPTZ,
  archived_by UUID,
  archive_reason TEXT,
  row_version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID
);
CREATE INDEX idx_opp_lc ON opportunities(lc_id);
CREATE INDEX idx_opp_agreement ON opportunities(agreement_id);

-- 23. opportunity_slots
CREATE TABLE opportunity_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lc_id UUID NOT NULL REFERENCES local_committees(id),
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  slot_code VARCHAR(40) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_openings INT NOT NULL CHECK (total_openings > 0),
  approved_count INT NOT NULL DEFAULT 0,
  applications_close_date DATE NOT NULL,
  slot_status slot_status_type NOT NULL DEFAULT 'OPEN',
  expa_slot_id INT UNIQUE,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  archived_at TIMESTAMPTZ,
  archived_by UUID,
  archive_reason TEXT,
  row_version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  CONSTRAINT chk_approved_openings CHECK (approved_count <= total_openings)
);
CREATE INDEX idx_slots_opp ON opportunity_slots(opportunity_id);

-- -----------------------------------------------------------------------------
-- 4. DOMAIN 3: INTERNATIONAL RELATIONS & APPLICANT FUNNEL (Tables 24 to 34)
-- -----------------------------------------------------------------------------

-- 24. ir_entities
CREATE TABLE ir_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lc_id UUID NOT NULL REFERENCES local_committees(id),
  home_entity_code VARCHAR(40) NOT NULL,
  country_name VARCHAR(100) NOT NULL,
  nationality_code VARCHAR(3) NOT NULL REFERENCES visa_regime_reference(nationality_code),
  partnership_tier VARCHAR(20) NOT NULL DEFAULT 'TIER_3',
  owner_user_id UUID REFERENCES users(id),
  responsiveness_score NUMERIC(5,2) DEFAULT 50.0,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  archived_at TIMESTAMPTZ,
  archived_by UUID,
  archive_reason TEXT,
  row_version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID
);
CREATE INDEX idx_ir_lc ON ir_entities(lc_id);

-- 25. ir_contacts
CREATE TABLE ir_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ir_entity_id UUID NOT NULL REFERENCES ir_entities(id) ON DELETE CASCADE,
  full_name VARCHAR(150) NOT NULL,
  role_title VARCHAR(80),
  email VARCHAR(180),
  whatsapp_phone VARCHAR(30),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- 26. ir_slot_allocations
CREATE TABLE ir_slot_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ir_entity_id UUID NOT NULL REFERENCES ir_entities(id),
  slot_id UUID NOT NULL REFERENCES opportunity_slots(id),
  term_code VARCHAR(20) NOT NULL,
  target_allocations INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(ir_entity_id, slot_id, term_code)
);

-- 27. shared_views
CREATE TABLE shared_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lc_id UUID NOT NULL REFERENCES local_committees(id),
  view_token_hash VARCHAR(64) UNIQUE NOT NULL,
  target_entity_type VARCHAR(40) NOT NULL,
  target_entity_id UUID NOT NULL,
  scope_description TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  is_revoked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 28. ep_profiles
CREATE TABLE ep_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expa_person_id INT UNIQUE NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(180) NOT NULL,
  phone_whatsapp VARCHAR(30),
  nationality_code VARCHAR(3) NOT NULL,
  home_country VARCHAR(100) NOT NULL,
  home_lc_name VARCHAR(120),
  date_of_birth DATE NOT NULL,
  gender VARCHAR(20),
  passport_expiry_date DATE,
  passport_checked_by UUID REFERENCES users(id),
  passport_checked_at TIMESTAMPTZ,
  cv_url TEXT,
  encrypted_pii JSONB,
  row_version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 29. ep_applications (EXPA Owned Statuses)
CREATE TABLE ep_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lc_id UUID NOT NULL REFERENCES local_committees(id),
  ep_profile_id UUID NOT NULL REFERENCES ep_profiles(id),
  opportunity_id UUID NOT NULL REFERENCES opportunities(id),
  slot_id UUID NOT NULL REFERENCES opportunity_slots(id),
  sending_ir_entity_id UUID REFERENCES ir_entities(id),
  expa_application_id INT UNIQUE NOT NULL,
  raw_expa_status VARCHAR(60) NOT NULL,
  mapped_expa_status VARCHAR(40) NOT NULL,
  match_score NUMERIC(5,2),
  date_applied TIMESTAMPTZ NOT NULL,
  date_matched TIMESTAMPTZ,
  date_approved TIMESTAMPTZ,
  date_realized TIMESTAMPTZ,
  date_finished TIMESTAMPTZ,
  date_completed TIMESTAMPTZ,
  row_version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_apps_lc ON ep_applications(lc_id);
CREATE INDEX idx_apps_slot ON ep_applications(slot_id);

-- 30. ep_readiness (ERP Operational States)
CREATE TABLE ep_readiness (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID UNIQUE NOT NULL REFERENCES ep_applications(id) ON DELETE CASCADE,
  readiness_status ep_readiness_status NOT NULL DEFAULT 'APPLIED',
  assigned_cxp_user_id UUID REFERENCES users(id),
  first_contacted_at TIMESTAMPTZ,
  host_interviewed_at TIMESTAMPTZ,
  host_screening_score INT,
  screening_feedback TEXT,
  op_interviewed_at TIMESTAMPTZ,
  op_decision_feedback TEXT,
  is_op_unjustified_rejection BOOLEAN DEFAULT false,
  an_signed_at TIMESTAMPTZ,
  se_approved_at TIMESTAMPTZ,
  pre_approval_checklist_complete BOOLEAN NOT NULL DEFAULT false,
  rejection_break_reason TEXT,
  row_version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 31. ep_visa_records
CREATE TABLE ep_visa_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID UNIQUE NOT NULL REFERENCES ep_applications(id) ON DELETE CASCADE,
  entry_regime VARCHAR(40) NOT NULL,
  he_docs_sent_at TIMESTAMPTZ,
  ep_status_updated_at TIMESTAMPTZ,
  ep_visa_applied_at TIMESTAMPTZ,
  visa_granted_at TIMESTAMPTZ,
  ep_14d_apply_sla_breached BOOLEAN NOT NULL DEFAULT false,
  visa_reference_number VARCHAR(80),
  visa_rejection_reason TEXT,
  row_version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 32. ep_touchpoints
CREATE TABLE ep_touchpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES ep_applications(id) ON DELETE CASCADE,
  conducted_by_user_id UUID NOT NULL REFERENCES users(id),
  touchpoint_type VARCHAR(40) NOT NULL,
  scheduled_date DATE NOT NULL,
  completed_at TIMESTAMPTZ,
  ep_mood_score INT CHECK (ep_mood_score BETWEEN 1 AND 5),
  hours_compliance BOOLEAN,
  notes TEXT,
  escalated_to_case BOOLEAN DEFAULT false,
  row_version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_touchpoints_app ON ep_touchpoints(application_id);

-- 33. ep_standards_evidence
CREATE TABLE ep_standards_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES ep_applications(id) ON DELETE CASCADE,
  standard_number INT NOT NULL REFERENCES exchange_standards_catalog(standard_number),
  internal_status standard_delivery_status NOT NULL DEFAULT 'PENDING',
  delivered_at TIMESTAMPTZ,
  verified_by_user_id UUID REFERENCES users(id),
  evidence_document_id UUID REFERENCES documents(id),
  notes TEXT,
  row_version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(application_id, standard_number)
);

-- 34. ep_survey_responses
CREATE TABLE ep_survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES ep_applications(id) ON DELETE CASCADE,
  standard_number INT NOT NULL REFERENCES exchange_standards_catalog(standard_number),
  survey_stage VARCHAR(30) NOT NULL,
  ep_response survey_response_type NOT NULL DEFAULT 'UNANSWERED',
  synced_from_expa_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(application_id, standard_number, survey_stage)
);

-- -----------------------------------------------------------------------------
-- 5. DOMAIN 4: LOGISTICS & ACCOMMODATION (Tables 35 to 40)
-- -----------------------------------------------------------------------------

-- 35. service_providers
CREATE TABLE service_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lc_id UUID NOT NULL REFERENCES local_committees(id),
  provider_name VARCHAR(150) NOT NULL,
  service_category VARCHAR(60) NOT NULL, -- 'TRANSIT_TAXI', 'HOSTEL', 'INSURANCE'
  contact_person VARCHAR(120),
  phone VARCHAR(30),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- 36. accommodation_providers
CREATE TABLE accommodation_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lc_id UUID NOT NULL REFERENCES local_committees(id),
  provider_name VARCHAR(150) NOT NULL,
  provider_type accommodation_provider_type NOT NULL,
  neighborhood VARCHAR(100) NOT NULL,
  full_address TEXT NOT NULL,
  contact_person VARCHAR(120),
  phone_whatsapp VARCHAR(30),
  vetting_status vetting_status_type NOT NULL DEFAULT 'PENDING_INSPECTION',
  last_vetted_date DATE,
  vetted_by_user_id UUID REFERENCES users(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  archived_at TIMESTAMPTZ,
  archived_by UUID,
  archive_reason TEXT,
  row_version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID
);
CREATE INDEX idx_accomm_lc ON accommodation_providers(lc_id);

-- 37. accommodation_units
CREATE TABLE accommodation_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES accommodation_providers(id) ON DELETE CASCADE,
  unit_name VARCHAR(60) NOT NULL,
  has_single_beds BOOLEAN NOT NULL DEFAULT true,
  has_clean_water BOOLEAN NOT NULL DEFAULT true,
  has_clean_bathroom BOOLEAN NOT NULL DEFAULT true,
  has_electricity BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- 38. accommodation_beds
CREATE TABLE accommodation_beds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL REFERENCES accommodation_units(id) ON DELETE CASCADE,
  bed_code VARCHAR(40) NOT NULL,
  gender_restriction bed_gender_restriction NOT NULL DEFAULT 'COED_PRIVATE',
  monthly_cost_mad NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  deposit_mad NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(unit_id, bed_code)
);

-- 39. accommodation_allocations (INV-01: Exclusion Constraint)
CREATE TABLE accommodation_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES ep_applications(id),
  bed_id UUID NOT NULL REFERENCES accommodation_beds(id),
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  alloc_status alloc_status_type NOT NULL DEFAULT 'RESERVED_LOCKED',
  provider_14d_reconfirmed_at TIMESTAMPTZ,
  op_14d_reconfirmed_at TIMESTAMPTZ,
  deposit_paid_mad NUMERIC(10,2) DEFAULT 0.00,
  deposit_refunded_mad NUMERIC(10,2) DEFAULT 0.00,
  checkin_report_doc_id UUID REFERENCES documents(id),
  checkout_report_doc_id UUID REFERENCES documents(id),
  is_archived BOOLEAN NOT NULL DEFAULT false,
  archived_at TIMESTAMPTZ,
  archived_by UUID,
  archive_reason TEXT,
  row_version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  CONSTRAINT chk_alloc_dates CHECK (check_out_date > check_in_date),
  CONSTRAINT no_overlapping_bed_allocations EXCLUDE USING gist (
    bed_id WITH =,
    tstzrange(check_in_date::timestamptz, check_out_date::timestamptz, '[)') WITH &&
  ) WHERE (alloc_status IN ('RESERVED_LOCKED', 'CHECKED_IN') AND is_archived = false)
);
CREATE INDEX idx_alloc_bed ON accommodation_allocations(bed_id);
CREATE INDEX idx_alloc_app ON accommodation_allocations(application_id);

-- 40. pickup_missions
CREATE TABLE pickup_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES ep_applications(id),
  arrival_datetime TIMESTAMPTZ NOT NULL,
  arrival_airport_or_station VARCHAR(80) NOT NULL,
  flight_or_train_number VARCHAR(40),
  pickup_buddy_user_id UUID REFERENCES users(id),
  instructions_sent_at TIMESTAMPTZ,
  pickup_completed_at TIMESTAMPTZ,
  row_version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 6. DOMAIN 5: QUALITY, FINANCE & AUDIT TRAIL (Tables 41 to 46)
-- -----------------------------------------------------------------------------

-- 41. quality_cases
CREATE TABLE quality_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lc_id UUID NOT NULL REFERENCES local_committees(id),
  application_id UUID NOT NULL REFERENCES ep_applications(id),
  case_category case_category_type NOT NULL,
  stage case_stage_type NOT NULL DEFAULT 'STAGE_1_LC_TO_LC',
  is_harassment_vault BOOLEAN NOT NULL DEFAULT false,
  assigned_owner_user_id UUID NOT NULL REFERENCES users(id),
  opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  stage_1_ack_due_at TIMESTAMPTZ,
  stage_1_reply_due_at TIMESTAMPTZ,
  stage_1_escalation_due_at TIMESTAMPTZ,
  stage_2_due_at TIMESTAMPTZ,
  stage_3_due_at TIMESTAMPTZ,
  resolution_summary TEXT,
  resolved_at TIMESTAMPTZ,
  row_version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID
);
CREATE INDEX idx_cases_lc ON quality_cases(lc_id);
CREATE INDEX idx_cases_app ON quality_cases(application_id);

-- 42. case_events
CREATE TABLE case_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES quality_cases(id) ON DELETE CASCADE,
  event_type VARCHAR(60) NOT NULL,
  actor_user_id UUID NOT NULL REFERENCES users(id),
  notes TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 43. compensation_claims
CREATE TABLE compensation_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES quality_cases(id),
  annex_clause VARCHAR(40) NOT NULL,
  formula_version VARCHAR(20) NOT NULL DEFAULT '2024.1',
  salary_delay_days INT DEFAULT 0,
  internship_completion_pct NUMERIC(5,2) DEFAULT 0.0,
  draft_amount_mad NUMERIC(10,2) NOT NULL,
  approved_amount_mad NUMERIC(10,2),
  approved_by_user_id UUID REFERENCES users(id),
  settlement_status VARCHAR(40) NOT NULL DEFAULT 'DRAFT',
  row_version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 44. invoices
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lc_id UUID NOT NULL REFERENCES local_committees(id),
  org_id UUID REFERENCES organizations(id),
  application_id UUID REFERENCES ep_applications(id),
  invoice_number VARCHAR(60) UNIQUE NOT NULL,
  afpm_account_code VARCHAR(30) NOT NULL REFERENCES afpm_accounts(account_code),
  amount_ht_mad NUMERIC(10,2) NOT NULL,
  total_ttc_mad NUMERIC(10,2) NOT NULL,
  paid_amount_mad NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  due_date DATE NOT NULL,
  status invoice_status_type NOT NULL DEFAULT 'DRAFT',
  issued_at TIMESTAMPTZ,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  archived_at TIMESTAMPTZ,
  archived_by UUID,
  archive_reason TEXT,
  row_version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID
);
CREATE INDEX idx_invoices_lc ON invoices(lc_id);

-- 45. financial_transactions
CREATE TABLE financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lc_id UUID NOT NULL REFERENCES local_committees(id),
  invoice_id UUID REFERENCES invoices(id),
  account_code VARCHAR(30) NOT NULL REFERENCES afpm_accounts(account_code),
  tx_type VARCHAR(40) NOT NULL, -- 'INFLOW_REVENUE', 'OUTFLOW_DIRECT', 'REFUND'
  amount_mad NUMERIC(10,2) NOT NULL,
  payment_method VARCHAR(40) NOT NULL,
  receipt_doc_id UUID REFERENCES documents(id),
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  row_version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID
);
CREATE INDEX idx_tx_lc ON financial_transactions(lc_id);

-- 46. approvals (INV-06: Dual-Control Check)
CREATE TABLE approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lc_id UUID NOT NULL REFERENCES local_committees(id),
  object_type VARCHAR(60) NOT NULL,
  object_id UUID NOT NULL,
  creator_user_id UUID NOT NULL REFERENCES users(id),
  approver_user_id UUID NOT NULL REFERENCES users(id),
  decision VARCHAR(30) NOT NULL,
  decision_notes TEXT,
  decided_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_dual_control CHECK (creator_user_id != approver_user_id)
);
CREATE INDEX idx_approvals_object ON approvals(object_type, object_id);

-- -----------------------------------------------------------------------------
-- 7. DOMAIN 6: TASKS, INTEGRATIONS & MEMORY (Tables 47 to 54)
-- -----------------------------------------------------------------------------

-- 47. tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lc_id UUID NOT NULL REFERENCES local_committees(id),
  title VARCHAR(200) NOT NULL,
  owner_user_id UUID NOT NULL REFERENCES users(id),
  escalation_user_id UUID NOT NULL REFERENCES users(id),
  automation_code VARCHAR(20),
  due_at TIMESTAMPTZ NOT NULL,
  priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
  is_snoozed BOOLEAN NOT NULL DEFAULT false,
  snooze_reason TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  idempotency_key VARCHAR(100),
  row_version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID
);
CREATE INDEX idx_tasks_owner_due ON tasks(owner_user_id, due_at);

-- 48. governance_meetings
CREATE TABLE governance_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lc_id UUID NOT NULL REFERENCES local_committees(id),
  meeting_cadence VARCHAR(40) NOT NULL, -- 'WEEKLY_TEAM', 'CORE_MEETING', 'LCM', 'O2O'
  scheduled_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  attendees_user_ids UUID[] NOT NULL,
  action_items JSONB,
  row_version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID
);

-- 49. notification_log
CREATE TABLE notification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lc_id UUID NOT NULL REFERENCES local_committees(id),
  channel VARCHAR(30) NOT NULL,
  recipient_ref VARCHAR(180) NOT NULL,
  template_version VARCHAR(40) NOT NULL,
  dedup_key VARCHAR(100) NOT NULL,
  delivery_status VARCHAR(30) NOT NULL DEFAULT 'SENT',
  dispatched_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 50. sync_runs
CREATE TABLE sync_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lc_id UUID NOT NULL REFERENCES local_committees(id),
  sync_mode sync_run_mode NOT NULL,
  status sync_run_status NOT NULL DEFAULT 'RUNNING',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  fetched_count INT DEFAULT 0,
  created_count INT DEFAULT 0,
  updated_count INT DEFAULT 0,
  conflict_count INT DEFAULT 0,
  error_message TEXT
);

-- 51. sync_staging
CREATE TABLE sync_staging (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_run_id UUID NOT NULL REFERENCES sync_runs(id) ON DELETE CASCADE,
  entity_type VARCHAR(60) NOT NULL,
  payload_hash VARCHAR(64) NOT NULL,
  raw_payload JSONB NOT NULL,
  parsed_record JSONB,
  staging_status VARCHAR(30) NOT NULL DEFAULT 'STAGED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 52. reconciliation_queue
CREATE TABLE reconciliation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lc_id UUID NOT NULL REFERENCES local_committees(id),
  conflict_type VARCHAR(60) NOT NULL,
  expa_value JSONB NOT NULL,
  local_value JSONB NOT NULL,
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_by_user_id UUID REFERENCES users(id),
  resolution_decision VARCHAR(40),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 53. action_outbox (SM-09: Human-in-the-Loop)
CREATE TABLE action_outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lc_id UUID NOT NULL REFERENCES local_committees(id),
  action_type VARCHAR(60) NOT NULL,
  target_object_type VARCHAR(60) NOT NULL,
  target_object_id UUID NOT NULL,
  status outbox_status_type NOT NULL DEFAULT 'READY_FOR_HUMAN',
  deep_link_url TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  confirmed_at TIMESTAMPTZ,
  requested_by_user_id UUID NOT NULL REFERENCES users(id),
  row_version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 54. status_transitions
CREATE TABLE status_transitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lc_id UUID NOT NULL REFERENCES local_committees(id),
  entity_type VARCHAR(60) NOT NULL,
  entity_id UUID NOT NULL,
  from_status VARCHAR(60) NOT NULL,
  to_status VARCHAR(60) NOT NULL,
  actor_user_id UUID REFERENCES users(id),
  source VARCHAR(40) NOT NULL, -- 'USER_UI', 'EXPA_SYNC_READBACK', 'SLA_CRON'
  transition_reason TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_transitions_entity ON status_transitions(entity_type, entity_id);
