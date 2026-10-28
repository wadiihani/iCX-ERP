-- =============================================================================
-- AIESEC iCX ERP — Migration 20261027000001: Core Governance & CRM Contracts
-- Authoritative Specification: AIESEC iCX ERP Tracker-First Master Specification
-- Phase 1, Plan 01-01: Core Governance (1-15) and CRM/PRM (16-23) Enhancements
-- Best Practices: Supabase Postgres Best Practices (Indexed FKs, UUID PKs, TIMESTAMPTZ)
-- =============================================================================

-- Ensure required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- Set session timezone
SET timezone = 'Africa/Casablanca';

-- -----------------------------------------------------------------------------
-- 1. STAKEHOLDER HANDOFF CONTRACT TABLE (Section 0.6)
-- Prevents records from becoming "owned by everyone / owned by nobody"
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS stakeholder_handoffs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handoff_id VARCHAR(40) UNIQUE NOT NULL,
  lc_id UUID NOT NULL REFERENCES local_committees(id),
  record_type VARCHAR(60) NOT NULL, -- 'EP_PROFILE', 'ORGANIZATION', 'DEAL', 'OPPORTUNITY'
  record_id UUID NOT NULL,
  from_owner_id UUID NOT NULL REFERENCES users(id),
  to_owner_id UUID NOT NULL REFERENCES users(id),
  from_team VARCHAR(60) NOT NULL,
  to_team VARCHAR(60) NOT NULL,
  reason TEXT NOT NULL,
  handoff_status VARCHAR(30) NOT NULL DEFAULT 'INITIATED', -- 'INITIATED', 'PREPARED', 'ACCEPTED', 'REJECTED', 'ESCALATED'
  rejection_reason TEXT,
  open_task_count INT NOT NULL DEFAULT 0 CHECK (open_task_count >= 0),
  blocking_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  required_context_confirmed BOOLEAN NOT NULL DEFAULT false,
  due_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  escalation_owner_id UUID REFERENCES users(id),
  audit_event_id UUID REFERENCES audit_events(id),
  row_version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_different_owners CHECK (from_owner_id != to_owner_id)
);

-- Foreign Key Indexes for stakeholder_handoffs (Supabase Best Practice)
CREATE INDEX IF NOT EXISTS idx_handoffs_lc_id ON stakeholder_handoffs(lc_id);
CREATE INDEX IF NOT EXISTS idx_handoffs_from_owner ON stakeholder_handoffs(from_owner_id);
CREATE INDEX IF NOT EXISTS idx_handoffs_to_owner ON stakeholder_handoffs(to_owner_id);
CREATE INDEX IF NOT EXISTS idx_handoffs_record ON stakeholder_handoffs(record_type, record_id);
CREATE INDEX IF NOT EXISTS idx_handoffs_status_due ON stakeholder_handoffs(handoff_status, due_at);

COMMENT ON TABLE stakeholder_handoffs IS 'Section 0.6 non-negotiable stakeholder transfer contract ensuring zero orphaned records during owner rotation';

-- -----------------------------------------------------------------------------
-- 2. B2B MEETINGS & TOUCHPOINT LOGS (Section 0.5 & Deliverable 4)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS b2b_meeting_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lc_id UUID NOT NULL REFERENCES local_committees(id),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES b2b_deals(id) ON DELETE SET NULL,
  primary_contact_id UUID REFERENCES organization_contacts(id),
  host_user_id UUID NOT NULL REFERENCES users(id),
  meeting_type VARCHAR(30) NOT NULL DEFAULT 'PHYSICAL', -- 'PHYSICAL', 'GOOGLE_MEET', 'PHONE'
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duration_minutes INT NOT NULL DEFAULT 30 CHECK (duration_minutes > 0),
  agenda TEXT,
  minutes_notes TEXT NOT NULL,
  next_action_due_at TIMESTAMPTZ,
  next_action_owner_id UUID REFERENCES users(id),
  next_action_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Foreign Key Indexes for b2b_meeting_logs
CREATE INDEX IF NOT EXISTS idx_meeting_logs_lc_id ON b2b_meeting_logs(lc_id);
CREATE INDEX IF NOT EXISTS idx_meeting_logs_org_id ON b2b_meeting_logs(org_id);
CREATE INDEX IF NOT EXISTS idx_meeting_logs_deal_id ON b2b_meeting_logs(deal_id);
CREATE INDEX IF NOT EXISTS idx_meeting_logs_host_id ON b2b_meeting_logs(host_user_id);
CREATE INDEX IF NOT EXISTS idx_meeting_logs_occurred_at ON b2b_meeting_logs(occurred_at DESC);

COMMENT ON TABLE b2b_meeting_logs IS 'Section 0.5 Business Development meeting minutes and accountable next actions';

-- -----------------------------------------------------------------------------
-- 3. B2B PROPOSAL RECORDS (Section 0.5 & 0.8)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS b2b_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lc_id UUID NOT NULL REFERENCES local_committees(id),
  deal_id UUID NOT NULL REFERENCES b2b_deals(id) ON DELETE CASCADE,
  version_number INT NOT NULL DEFAULT 1 CHECK (version_number > 0),
  proposal_title VARCHAR(200) NOT NULL,
  target_product product_type NOT NULL,
  proposed_openings INT NOT NULL DEFAULT 1 CHECK (proposed_openings > 0),
  partner_fee_mad NUMERIC(10,2) NOT NULL CHECK (partner_fee_mad >= 0.00),
  stipend_salary_mad NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (stipend_salary_mad >= 0.00),
  accommodation_included BOOLEAN NOT NULL DEFAULT false,
  proposal_status VARCHAR(30) NOT NULL DEFAULT 'DRAFT', -- 'DRAFT', 'SENT', 'ACCEPTED', 'REVISED', 'DECLINED'
  document_id UUID REFERENCES documents(id),
  sent_at TIMESTAMPTZ,
  decided_at TIMESTAMPTZ,
  decision_notes TEXT,
  created_by_user_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(deal_id, version_number)
);

-- Foreign Key Indexes for b2b_proposals
CREATE INDEX IF NOT EXISTS idx_proposals_lc_id ON b2b_proposals(lc_id);
CREATE INDEX IF NOT EXISTS idx_proposals_deal_id ON b2b_proposals(deal_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON b2b_proposals(proposal_status);

COMMENT ON TABLE b2b_proposals IS 'Section 0.8 B2B proposals with commercial pricing terms and version control';

-- -----------------------------------------------------------------------------
-- 4. KPI DEFINITIONS & ANALYTICS SPECIFICATION (Section 0.10)
-- Strict mathematical definition of KPIs with numerator/denominator rules
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS kpi_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kpi_code VARCHAR(40) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  purpose TEXT NOT NULL,
  department VARCHAR(60) NOT NULL,
  formula TEXT NOT NULL,
  unit VARCHAR(30) NOT NULL,
  numerator_def TEXT,
  denominator_def TEXT,
  inclusion_rules JSONB NOT NULL DEFAULT '[]'::jsonb,
  exclusion_rules JSONB NOT NULL DEFAULT '[]'::jsonb,
  source_entities TEXT[] NOT NULL,
  default_filters JSONB NOT NULL DEFAULT '{}'::jsonb,
  timezone VARCHAR(60) NOT NULL DEFAULT 'Africa/Casablanca',
  reporting_period VARCHAR(30) NOT NULL DEFAULT 'MONTHLY',
  refresh_cadence VARCHAR(30) NOT NULL DEFAULT 'DAILY',
  metric_status VARCHAR(30) NOT NULL DEFAULT 'APPROVED', -- 'DRAFT', 'APPROVED', 'DEPRECATED'
  version INT NOT NULL DEFAULT 1,
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kpi_def_dept ON kpi_definitions(department);
CREATE INDEX IF NOT EXISTS idx_kpi_def_status ON kpi_definitions(metric_status);

COMMENT ON TABLE kpi_definitions IS 'Section 0.10 versioned KPI metadata preventing unverified manually-typed numbers';

-- -----------------------------------------------------------------------------
-- 5. KPI SNAPSHOTS & REPRODUCIBILITY CACHE (Section 0.10)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS kpi_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lc_id UUID NOT NULL REFERENCES local_committees(id),
  kpi_id UUID NOT NULL REFERENCES kpi_definitions(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  calculated_value NUMERIC(14,4) NOT NULL,
  numerator_value NUMERIC(14,4),
  denominator_value NUMERIC(14,4),
  underlying_records_count INT NOT NULL DEFAULT 0,
  definition_version INT NOT NULL,
  query_checksum VARCHAR(64) NOT NULL,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(lc_id, kpi_id, period_start, period_end, definition_version)
);

-- Foreign Key Indexes for kpi_snapshots
CREATE INDEX IF NOT EXISTS idx_kpi_snapshots_lookup ON kpi_snapshots(lc_id, kpi_id, period_start);

COMMENT ON TABLE kpi_snapshots IS 'Section 0.10 historically reproducible aggregate metrics linking directly to source records';

-- -----------------------------------------------------------------------------
-- 6. MISSING FOREIGN KEY INDEXES ON INITIAL SCHEMA TABLES (1-23)
-- Enforces Supabase Best Practices (references/schema-foreign-key-indexes.md)
-- -----------------------------------------------------------------------------

-- organizations
CREATE INDEX IF NOT EXISTS idx_org_bd_owner ON organizations(bd_owner_user_id);
CREATE INDEX IF NOT EXISTS idx_org_cxp_owner ON organizations(cxp_owner_user_id);

-- b2b_deals
CREATE INDEX IF NOT EXISTS idx_deals_owner ON b2b_deals(owner_user_id);

-- partner_agreements
CREATE INDEX IF NOT EXISTS idx_agreements_funder ON partner_agreements(funder_org_id);
CREATE INDEX IF NOT EXISTS idx_agreements_reviewed_by ON partner_agreements(reviewed_by_user_id);
CREATE INDEX IF NOT EXISTS idx_agreements_approved_by ON partner_agreements(approved_by_user_id);

-- communication_logs
CREATE INDEX IF NOT EXISTS idx_comm_logged_by ON communication_logs(logged_by_user_id);
CREATE INDEX IF NOT EXISTS idx_comm_lc_id ON communication_logs(lc_id);

-- opportunities
CREATE INDEX IF NOT EXISTS idx_opp_supervisor_contact ON opportunities(supervisor_contact_id);
CREATE INDEX IF NOT EXISTS idx_opp_account_manager ON opportunities(account_manager_user_id);
CREATE INDEX IF NOT EXISTS idx_opp_gv_template ON opportunities(gv_project_id);
