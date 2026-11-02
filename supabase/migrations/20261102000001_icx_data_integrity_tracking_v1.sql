-- =============================================================================
-- AIESEC iCX ERP — Data Integrity & Tracking System Migration v1.0
-- Author: Wadii Hani <wadii.hani.pro@gmail.com>
-- Specification: iCX_Data_Integrity_Tracking_Spec.md v1.0 (§3 Data Model)
-- Milestone: M0 (Plan 00-01)
-- Standards: Supabase Postgres Best Practices (Strict FK Indexes, No Hard Deletes)
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. ENUMS & DOMAIN TYPES (§3.3)
-- -----------------------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE programme AS ENUM ('GV', 'GTa', 'GTe');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE flow_stage AS ENUM ('attraction', 'consideration', 'preparation', 'experience', 'post_experience');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE ex_status AS ENUM ('APL', 'ACP', 'APD', 'RE', 'FI', 'CO', 'REJECTED', 'WITHDRAWN');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE break_type AS ENUM ('APD', 'RE', 'FI', 'CO');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- -----------------------------------------------------------------------------
-- 2. CORE RELATIONAL TABLES (§3.2, §3.3)
-- -----------------------------------------------------------------------------

-- Member (People who own records in the tracker)
CREATE TABLE IF NOT EXISTS member (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  team_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  deleted_reason text
);

CREATE INDEX IF NOT EXISTS idx_member_active ON member(active);
CREATE INDEX IF NOT EXISTS idx_member_deleted_at ON member(deleted_at);

-- Entity Org (LCs / MCs / Home Entities — includes ICB freeze flag per INV-07)
CREATE TABLE IF NOT EXISTS entity_org (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('LC', 'MC', 'GLOBAL', 'EXTERNAL')),
  country text NOT NULL,
  is_frozen boolean NOT NULL DEFAULT false,
  frozen_since timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  deleted_reason text
);

CREATE INDEX IF NOT EXISTS idx_entity_org_is_frozen ON entity_org(is_frozen);
CREATE INDEX IF NOT EXISTS idx_entity_org_country ON entity_org(country);
CREATE INDEX IF NOT EXISTS idx_entity_org_deleted_at ON entity_org(deleted_at);

-- Opportunity Partner (B2B Customer / Hosting Provider)
CREATE TABLE IF NOT EXISTS op_partner (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  city text NOT NULL,
  expa_org_id integer UNIQUE,
  owner_id uuid NOT NULL REFERENCES member(id) ON DELETE RESTRICT,
  stage text NOT NULL DEFAULT 'lead' CHECK (stage IN ('lead', 'contacted', 'meeting', 'negotiation', 'agreement', 'closed_lost')),
  last_touchpoint_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  deleted_reason text
);

CREATE INDEX IF NOT EXISTS idx_op_partner_owner_id ON op_partner(owner_id);
CREATE INDEX IF NOT EXISTS idx_op_partner_stage ON op_partner(stage);
CREATE INDEX IF NOT EXISTS idx_op_partner_expa_org_id ON op_partner(expa_org_id);
CREATE INDEX IF NOT EXISTS idx_op_partner_deleted_at ON op_partner(deleted_at);

-- Opportunity (Project / Slot Container)
CREATE TABLE IF NOT EXISTS opportunity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  op_id uuid NOT NULL REFERENCES op_partner(id) ON DELETE RESTRICT,
  programme programme NOT NULL DEFAULT 'GV',
  expa_opp_id integer UNIQUE,
  title text NOT NULL,
  slots integer NOT NULL DEFAULT 1 CHECK (slots > 0),
  duration_weeks integer CHECK (duration_weeks > 0),
  hours_per_week numeric(4,1) CHECK (hours_per_week > 0),
  benefits text[] DEFAULT ARRAY[]::text[],
  accommodation_provided boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  deleted_reason text
);

CREATE INDEX IF NOT EXISTS idx_opportunity_op_id ON opportunity(op_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_programme ON opportunity(programme);
CREATE INDEX IF NOT EXISTS idx_opportunity_expa_opp_id ON opportunity(expa_opp_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_deleted_at ON opportunity(deleted_at);

-- Contract (Agreement between AIESEC and Opportunity Partner)
CREATE TABLE IF NOT EXISTS contract (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id uuid NOT NULL REFERENCES opportunity(id) ON DELETE RESTRICT,
  signed_at date NOT NULL,
  payment_terms text,
  key_deadlines jsonb DEFAULT '{}'::jsonb,
  document_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  deleted_reason text
);

CREATE INDEX IF NOT EXISTS idx_contract_opportunity_id ON contract(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_contract_deleted_at ON contract(deleted_at);

-- EP (Exchange Participant Profile)
CREATE TABLE IF NOT EXISTS ep (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expa_ep_id integer UNIQUE NOT NULL,
  full_name text NOT NULL,
  home_entity_id uuid NOT NULL REFERENCES entity_org(id) ON DELETE RESTRICT,
  contact jsonb NOT NULL DEFAULT '{}'::jsonb,
  owner_id uuid NOT NULL REFERENCES member(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  deleted_reason text
);

CREATE INDEX IF NOT EXISTS idx_ep_home_entity_id ON ep(home_entity_id);
CREATE INDEX IF NOT EXISTS idx_ep_owner_id ON ep(owner_id);
CREATE INDEX IF NOT EXISTS idx_ep_expa_ep_id ON ep(expa_ep_id);
CREATE INDEX IF NOT EXISTS idx_ep_deleted_at ON ep(deleted_at);

-- Exchange (Central Record: 1 EP × 1 Opportunity)
CREATE TABLE IF NOT EXISTS exchange (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ep_id uuid NOT NULL REFERENCES ep(id) ON DELETE RESTRICT,
  opportunity_id uuid NOT NULL REFERENCES opportunity(id) ON DELETE RESTRICT,
  programme programme NOT NULL,
  status ex_status NOT NULL DEFAULT 'APL',
  break_type break_type,
  approved_at date,
  re_date date,
  fi_date date,
  co_date date,
  owner_id uuid NOT NULL REFERENCES member(id) ON DELETE RESTRICT,
  expa_hash text,
  expa_synced_at timestamptz,
  deleted_at timestamptz,
  deleted_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_exchange_ep_opportunity UNIQUE (ep_id, opportunity_id)
);

CREATE INDEX IF NOT EXISTS idx_exchange_ep_id ON exchange(ep_id);
CREATE INDEX IF NOT EXISTS idx_exchange_opportunity_id ON exchange(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_exchange_owner_id ON exchange(owner_id);
CREATE INDEX IF NOT EXISTS idx_exchange_status ON exchange(status);
CREATE INDEX IF NOT EXISTS idx_exchange_programme ON exchange(programme);
CREATE INDEX IF NOT EXISTS idx_exchange_re_date ON exchange(re_date);
CREATE INDEX IF NOT EXISTS idx_exchange_deleted_at ON exchange(deleted_at);

-- Status History (Append-Only Status Progression)
CREATE TABLE IF NOT EXISTS status_history (
  id bigserial PRIMARY KEY,
  exchange_id uuid NOT NULL REFERENCES exchange(id) ON DELETE RESTRICT,
  from_status ex_status,
  to_status ex_status NOT NULL,
  break_type break_type,
  at timestamptz NOT NULL DEFAULT now(),
  by_member uuid REFERENCES member(id) ON DELETE RESTRICT,
  source text NOT NULL CHECK (source IN ('expa_sync', 'manual', 'system')),
  reason text,
  proof_id uuid
);

CREATE INDEX IF NOT EXISTS idx_status_history_exchange_id ON status_history(exchange_id);
CREATE INDEX IF NOT EXISTS idx_status_history_by_member ON status_history(by_member);
CREATE INDEX IF NOT EXISTS idx_status_history_at ON status_history(at);

-- Standard Definition (Seed Catalogue for Exchange Standards #1–#16)
CREATE TABLE IF NOT EXISTS standard_def (
  std_no smallint PRIMARY KEY CHECK (std_no BETWEEN 1 AND 16),
  name text NOT NULL,
  phase flow_stage NOT NULL,
  delivered_by text NOT NULL,
  mandatory boolean NOT NULL DEFAULT true,
  yop_question text,
  answer_options jsonb
);

-- Standard Check (Tracking and EP Responses per Exchange × Standard)
CREATE TABLE IF NOT EXISTS standard_check (
  exchange_id uuid NOT NULL REFERENCES exchange(id) ON DELETE RESTRICT,
  std_no smallint NOT NULL REFERENCES standard_def(std_no) ON DELETE RESTRICT,
  tracked_status text NOT NULL DEFAULT 'not_started'
    CHECK (tracked_status IN ('not_started', 'in_progress', 'delivered', 'not_delivered', 'n_a')),
  tracked_at timestamptz,
  tracked_by uuid REFERENCES member(id) ON DELETE RESTRICT,
  proof_id uuid,
  ep_reported_answer text,
  ep_reported_at timestamptz,
  PRIMARY KEY (exchange_id, std_no)
);

CREATE INDEX IF NOT EXISTS idx_standard_check_exchange_id ON standard_check(exchange_id);
CREATE INDEX IF NOT EXISTS idx_standard_check_std_no ON standard_check(std_no);
CREATE INDEX IF NOT EXISTS idx_standard_check_tracked_by ON standard_check(tracked_by);

-- Rule Registry (Versioned Business & Regulatory Rules — INV-08)
CREATE TABLE IF NOT EXISTS rule_registry (
  key text NOT NULL,
  value jsonb NOT NULL,
  effective_from date NOT NULL,
  effective_to date,
  source text NOT NULL,
  note text,
  PRIMARY KEY (key, effective_from)
);

CREATE INDEX IF NOT EXISTS idx_rule_registry_key ON rule_registry(key);

-- Universal Audit Log (Append-Only Audit Trail — INV-09)
CREATE TABLE IF NOT EXISTS audit_log (
  id bigserial PRIMARY KEY,
  ts timestamptz NOT NULL DEFAULT now(),
  actor uuid,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id text NOT NULL,
  before jsonb,
  after jsonb,
  request_id text
);

CREATE INDEX IF NOT EXISTS idx_audit_log_table_record ON audit_log(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_ts ON audit_log(ts);
CREATE INDEX IF NOT EXISTS idx_audit_log_actor ON audit_log(actor);
