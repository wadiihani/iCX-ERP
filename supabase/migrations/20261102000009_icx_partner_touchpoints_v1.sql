-- =============================================================================
-- AIESEC iCX ERP — Partner Touchpoints & Buyer Personas v1.0
-- Author: Wadii Hani <wadii.hani.pro@gmail.com>
-- Specification: iCX_Data_Integrity_Tracking_Spec.md v1.0 (§5.2, §5.3, §9.2)
-- Milestone: M4 (Plan 04-02)
-- Enforces: INV-01 (No Hard Deletes), INV-09 (Attribution), Touchpoint Gap SLAs
-- =============================================================================

-- 1. Ensure op_partner has buyer persona and funnel columns
ALTER TABLE op_partner
ADD COLUMN IF NOT EXISTS persona text 
  CHECK (persona IN ('NGO Project Manager', 'NGO Founder', 'School Director', 'Other')),
ADD COLUMN IF NOT EXISTS preferred_channel text 
  CHECK (preferred_channel IN ('call', 'WhatsApp', 'email', 'Facebook/Instagram', 'meeting')),
ADD COLUMN IF NOT EXISTS objection_tags jsonb NOT NULL DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS funnel_stage text NOT NULL DEFAULT 'lead'
  CHECK (funnel_stage IN ('lead', 'called', 'meeting', 'open created', 'contract signed', 'hosting', 'retained', 'lost')),
ADD COLUMN IF NOT EXISTS next_action text,
ADD COLUMN IF NOT EXISTS next_action_due_at timestamptz;

-- 2. Partner Touchpoint Table
CREATE TABLE IF NOT EXISTS partner_touchpoint (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES op_partner(id) ON DELETE RESTRICT,
  type text NOT NULL CHECK (type IN ('monthly_call', 'site_visit', 'lc_touchpoint', 'newsletter', 'quarterly_review')),
  occurred_at timestamptz NOT NULL DEFAULT now(),
  actor_id uuid NOT NULL REFERENCES member(id) ON DELETE RESTRICT,
  notes text NOT NULL,
  next_action text,
  next_action_due_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  deleted_reason text
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_partner_touchpoint_partner ON partner_touchpoint(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_touchpoint_occurred ON partner_touchpoint(occurred_at);
CREATE INDEX IF NOT EXISTS idx_partner_touchpoint_type ON partner_touchpoint(type);

-- Attach INV-01 Prevent Hard Delete Trigger
DROP TRIGGER IF EXISTS trg_prevent_delete_partner_touchpoint ON partner_touchpoint;
CREATE TRIGGER trg_prevent_delete_partner_touchpoint
BEFORE DELETE ON partner_touchpoint
FOR EACH ROW EXECUTE FUNCTION fn_icx_prevent_hard_delete();

-- Attach INV-09 Universal Audit Logger
DROP TRIGGER IF EXISTS trg_audit_partner_touchpoint ON partner_touchpoint;
CREATE TRIGGER trg_audit_partner_touchpoint
AFTER INSERT OR UPDATE ON partner_touchpoint
FOR EACH ROW EXECUTE FUNCTION fn_icx_universal_audit_log();
