-- =============================================================================
-- AIESEC iCX ERP — International Relations (IR) Partner Ecosystem v1.0
-- Author: Wadii Hani <wadii.hani.pro@gmail.com>
-- Specification: iCX_Data_Integrity_Tracking_Spec.md v1.0 (§9.3, §12.1)
-- Milestone: M4 (Plan 04-03)
-- Enforces: INV-01 (No Hard Deletes), INV-03 (Active Owner), INV-09 (Attribution)
-- =============================================================================

-- 1. Create IR Cluster enum if not exists
DO $$ BEGIN
  CREATE TYPE ir_cluster AS ENUM ('upscale', 'grow', 'understand', 'invest');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Create ir_partner table
CREATE TABLE IF NOT EXISTS ir_partner (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  home_entity_id uuid NOT NULL REFERENCES entity_org(id) ON DELETE RESTRICT,
  owner_id uuid NOT NULL REFERENCES member(id) ON DELETE RESTRICT,
  
  -- Define
  purpose text,
  partnership_goals jsonb NOT NULL DEFAULT '[]'::jsonb,
  
  -- Analyze
  persona text,
  timeline jsonb NOT NULL DEFAULT '{}'::jsonb,
  result_history jsonb NOT NULL DEFAULT '{}'::jsonb,
  custom_supply_threshold numeric,
  custom_readiness_threshold numeric,
  
  -- Promote
  physical_content jsonb NOT NULL DEFAULT '[]'::jsonb,
  digital_content jsonb NOT NULL DEFAULT '[]'::jsonb,
  comms_channels jsonb NOT NULL DEFAULT '[]'::jsonb,
  
  -- Deliver
  re_growth_target integer NOT NULL DEFAULT 0,
  process_time_target_days integer,
  standards_codelivery_notes text,
  strategy text,
  
  -- Track
  tracker_status text NOT NULL DEFAULT 'active'
    CHECK (tracker_status IN ('active', 'in_discussion', 'paused', 'archived')),
  routines jsonb NOT NULL DEFAULT '[]'::jsonb,
  review_frequency text NOT NULL DEFAULT 'monthly'
    CHECK (review_frequency IN ('weekly', 'biweekly', 'monthly', 'quarterly')),
  network_touchpoints jsonb NOT NULL DEFAULT '[]'::jsonb,
  investment text,
  last_review_at timestamptz,
  cluster ir_cluster NOT NULL DEFAULT 'understand',
  
  -- Audit & Soft-delete
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  deleted_reason text,

  CONSTRAINT uq_ir_partner_home_entity UNIQUE (home_entity_id, deleted_at)
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_ir_partner_home_entity ON ir_partner(home_entity_id);
CREATE INDEX IF NOT EXISTS idx_ir_partner_owner ON ir_partner(owner_id);
CREATE INDEX IF NOT EXISTS idx_ir_partner_cluster ON ir_partner(cluster);
CREATE INDEX IF NOT EXISTS idx_ir_partner_deleted ON ir_partner(deleted_at);

-- Attach INV-01 Prevent Hard Delete Trigger
DROP TRIGGER IF EXISTS trg_prevent_delete_ir_partner ON ir_partner;
CREATE TRIGGER trg_prevent_delete_ir_partner
BEFORE DELETE ON ir_partner
FOR EACH ROW EXECUTE FUNCTION fn_icx_prevent_hard_delete();

-- Attach INV-09 Universal Audit Logger
DROP TRIGGER IF EXISTS trg_audit_ir_partner ON ir_partner;
CREATE TRIGGER trg_audit_ir_partner
AFTER INSERT OR UPDATE ON ir_partner
FOR EACH ROW EXECUTE FUNCTION fn_icx_universal_audit_log();
