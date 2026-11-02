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
  persona?: 'NGO Project Manager' | 'NGO Founder' | 'School Director' | 'Other' | string | null;
  preferred_channel?: 'call' | 'WhatsApp' | 'email' | 'Facebook/Instagram' | 'meeting' | null;
  objection_tags?: string[];
  contact_person?: {
    name?: string;
    phone?: string;
    email?: string;
    role?: string;
  } | null;
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
  answer_options?: string[] | Record<string, unknown> | null;
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

export type ImportBatchStatus = 'applied' | 'quarantined' | 'failed';

export interface ImportBatch {
  id: number; // bigserial
  source: 'expa_csv' | 'expa_api' | 'manual_csv';
  file_sha256: string;
  rows_in: number;
  rows_ok: number;
  rows_rejected: number;
  schema_version: string;
  status: ImportBatchStatus;
  quarantine_reason?: string | null;
  created_at: string;
  deleted_at?: string | null;
  deleted_reason?: string | null;
}

export type ProofVerificationStatus =
  | 'verified'
  | 'dead_link'
  | 'checksum_mismatch'
  | 'unverified';

export interface ProofDocument {
  id: string; // uuid
  file_name: string;
  mime_type: string;
  file_size_bytes: number;
  drive_url: string;
  sha256_hash: string;
  uploaded_by: string; // references Member(id)
  uploaded_at: string;
  last_verified_at?: string | null;
  verification_status: ProofVerificationStatus;
  metadata?: Record<string, unknown>;
  deleted_at?: string | null;
  deleted_reason?: string | null;
}

export type StatusRequestKind =
  | 'early_fi'
  | 'extension_fi'
  | 'break_apd'
  | 'break_re'
  | 'break_fi'
  | 'break_co';

export type StatusRequestLifecycle =
  | 'draft'
  | 'ready'
  | 'submitted'
  | 'approved'
  | 'rejected'
  | 'applied_in_expa';

export interface StatusRequest {
  id: string; // uuid
  exchange_id: string; // references Exchange(id)
  ep_id: string; // references Ep(id) (INV-06)
  kind: StatusRequestKind;
  current_status: StatusRequestLifecycle;
  desired_date?: string | null; // YYYY-MM-DD
  reason: string;
  apip_clause_ref?: string | null;
  ticket_ref?: string | null; // mandatory when submitted
  checklist_state: Record<string, boolean>;
  evidence_proof_ids: string[]; // references ProofDocument(id)
  owner_id: string; // references Member(id) (INV-03)
  created_at: string;
  submitted_at?: string | null;
  decided_at?: string | null;
  applied_at?: string | null;
  rejection_reason?: string | null;
  deleted_at?: string | null;
  deleted_reason?: string | null;
}


