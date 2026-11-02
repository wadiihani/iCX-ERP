/**
 * AIESEC iCX ERP — Data Integrity & Tracking System Types v1.0
 * Author: Wadii Hani <wadii.hani.pro@gmail.com>
 * Reference: iCX_Data_Integrity_Tracking_Spec.md v1.0 (§3 Data Model)
 * Milestone: M0 (Plan 00-01)
 */

export type Programme = 'GV' | 'GTa' | 'GTe';

export type FlowStage =
  | 'attraction'
  | 'consideration'
  | 'preparation'
  | 'experience'
  | 'post_experience';

export type ExStatus =
  | 'APL'
  | 'ACP'
  | 'APD'
  | 'RE'
  | 'FI'
  | 'CO'
  | 'REJECTED'
  | 'WITHDRAWN';

export type BreakType = 'APD' | 'RE' | 'FI' | 'CO';

export type EntityKind = 'LC' | 'MC' | 'GLOBAL' | 'EXTERNAL';

export type OpPartnerStage =
  | 'lead'
  | 'contacted'
  | 'meeting'
  | 'negotiation'
  | 'agreement'
  | 'closed_lost';

export type StatusHistorySource = 'expa_sync' | 'manual' | 'system';

export type StandardTrackedStatus =
  | 'not_started'
  | 'in_progress'
  | 'delivered'
  | 'not_delivered'
  | 'n_a';

export interface Member {
  id: string; // uuid
  name: string;
  role: string;
  active: boolean;
  team_id?: string | null;
  created_at: string;
  deleted_at?: string | null;
  deleted_reason?: string | null;
}

export interface EntityOrg {
  id: string; // uuid
  name: string;
  kind: EntityKind;
  country: string;
  is_frozen: boolean;
  frozen_since?: string | null;
  created_at: string;
  deleted_at?: string | null;
  deleted_reason?: string | null;
}

export interface OpPartner {
  id: string; // uuid
  name: string;
  type: string;
  city: string;
  expa_org_id?: number | null;
  owner_id: string; // references Member(id)
  stage: OpPartnerStage;
  last_touchpoint_at?: string | null;
  created_at: string;
  deleted_at?: string | null;
  deleted_reason?: string | null;
}

export interface Opportunity {
  id: string; // uuid
  op_id: string; // references OpPartner(id)
  programme: Programme;
  expa_opp_id?: number | null;
  title: string;
  slots: number;
  duration_weeks?: number | null;
  hours_per_week?: number | null;
  benefits: string[];
  accommodation_provided: boolean;
  created_at: string;
  deleted_at?: string | null;
  deleted_reason?: string | null;
}

export interface Contract {
  id: string; // uuid
  opportunity_id: string; // references Opportunity(id)
  signed_at: string; // YYYY-MM-DD
  payment_terms?: string | null;
  key_deadlines: Record<string, unknown>;
  document_id?: string | null;
  created_at: string;
  deleted_at?: string | null;
  deleted_reason?: string | null;
}

export interface Ep {
  id: string; // uuid
  expa_ep_id: number;
  full_name: string;
  home_entity_id: string; // references EntityOrg(id)
  contact: {
    email?: string;
    phone?: string;
    whatsapp?: string;
    [key: string]: unknown;
  };
  owner_id: string; // references Member(id)
  created_at: string;
  deleted_at?: string | null;
  deleted_reason?: string | null;
}

export interface Exchange {
  id: string; // uuid
  ep_id: string; // references Ep(id)
  opportunity_id: string; // references Opportunity(id)
  programme: Programme;
  status: ExStatus;
  break_type?: BreakType | null;
  approved_at?: string | null; // YYYY-MM-DD
  re_date?: string | null; // YYYY-MM-DD
  fi_date?: string | null; // YYYY-MM-DD
  co_date?: string | null; // YYYY-MM-DD
  owner_id: string; // references Member(id)
  expa_hash?: string | null;
  expa_synced_at?: string | null;
  deleted_at?: string | null;
  deleted_reason?: string | null;
  created_at: string;
}

export interface StatusHistory {
  id: number; // bigserial
  exchange_id: string; // references Exchange(id)
  from_status?: ExStatus | null;
  to_status: ExStatus;
  break_type?: BreakType | null;
  at: string;
  by_member?: string | null; // references Member(id)
  source: StatusHistorySource;
  reason?: string | null;
  proof_id?: string | null;
}

export interface StandardDef {
  std_no: number; // 1 to 16
  name: string;
  phase: FlowStage;
  delivered_by: string;
  mandatory: boolean;
  yop_question?: string | null;
  answer_options?: Record<string, unknown> | null;
}

export interface StandardCheck {
  exchange_id: string; // references Exchange(id)
  std_no: number; // references StandardDef(std_no)
  tracked_status: StandardTrackedStatus;
  tracked_at?: string | null;
  tracked_by?: string | null; // references Member(id)
  proof_id?: string | null;
  ep_reported_answer?: string | null;
  ep_reported_at?: string | null;
}

export interface RuleRegistryEntry<T = unknown> {
  key: string;
  value: T;
  effective_from: string; // YYYY-MM-DD
  effective_to?: string | null; // YYYY-MM-DD
  source: string;
  note?: string | null;
}

export interface AuditLogEntry {
  id: number; // bigserial
  ts: string;
  actor?: string | null;
  action: string;
  table_name: string;
  record_id: string;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  request_id?: string | null;
}

export type DqSeverity = 'Urgent' | 'Blocker' | 'Warn' | 'Review';

export interface DqIssue {
  id: number; // bigserial
  rule_id: string; // e.g., 'DQ-081', 'DQ-080'
  subject: string;
  severity: DqSeverity;
  detected_at: string;
  resolved_at?: string | null;
  owner_id?: string | null; // references Member(id)
  details?: Record<string, unknown>;
}

