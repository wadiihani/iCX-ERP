export type AppRole =
  | 'lcp'
  | 'lc_vp'
  | 'team_leader'
  | 'member'
  | 'finance_manager'
  | 'harassment_officer'
  | 'mc_auditor';

export type LeadStatus = 'uncontacted' | 'contacted' | 'meeting_scheduled' | 'qualified' | 'disqualified';
export type OpportunityStatus = 'draft' | 'under_review' | 'open' | 'applications_open' | 'matched' | 'realized' | 'completed' | 'closed';
export type OpportunityProduct = 'igv' | 'igt' | 'igte';
export type ApplicationStatus = 'applied' | 'interview_scheduled' | 'interviewed' | 'accepted' | 'approved' | 'realized' | 'completed' | 'dropped';
export type OutboxActionType = 'send_whatsapp' | 'expa_sync' | 'generate_contract' | 'send_email';
export type OutboxStatus = 'pending' | 'approved' | 'rejected' | 'executed' | 'failed';

export interface LocalCommittee {
  id: string;
  name: string;
  country_code: string;
  entity_code: string;
  is_active: boolean;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  lc_id: string;
  email: string;
  full_name: string;
  role: AppRole;
  phone?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  lc_id: string;
  name: string;
  normalized_name: string;
  ice_number?: string | null;
  tax_id?: string | null;
  website?: string | null;
  phone?: string | null;
  industry?: string | null;
  address?: string | null;
  city?: string | null;
  lead_status: LeadStatus;
  lead_score: number;
  assigned_to?: string | null;
  created_at: string;
  updated_at: string;
  row_version: number;
}

export interface Opportunity {
  id: string;
  lc_id: string;
  organization_id: string;
  product: OpportunityProduct;
  sub_product?: string | null;
  sdg_target?: number | null;
  title: string;
  description?: string | null;
  status: OpportunityStatus;
  available_openings: number;
  total_openings: number;
  start_date: string;
  end_date: string;
  fee_amount: number;
  currency: string;
  expa_id?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  row_version: number;
}

export interface Application {
  id: string;
  lc_id: string;
  opportunity_id: string;
  ep_name: string;
  ep_email: string;
  ep_phone?: string | null;
  home_lc?: string | null;
  home_mc?: string | null;
  status: ApplicationStatus;
  expa_application_id?: string | null;
  current_stage_date: string;
  sla_deadline?: string | null;
  sla_breached: boolean;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  row_version: number;
}

export interface BedAllocation {
  id: string;
  lc_id: string;
  bed_id: string;
  application_id: string;
  check_in_date: string;
  check_out_date: string;
  allocated_by: string;
  created_at: string;
}

export interface StatutoryThreshold {
  id: string;
  threshold_code: string;
  category: string;
  parameter_name: string;
  numeric_value?: number | null;
  unit: string;
  epistemic_status: 'SOURCE-VERIFIED' | 'ESTIMATED' | 'SPEC-CLAIM';
  citation?: string | null;
  enforcement_action: 'HARD_STOP' | 'WARNING_AND_TASK' | 'ESCALATION';
  description?: string | null;
  is_active: boolean;
  updated_at: string;
}

export interface AuditEvent {
  id: string;
  lc_id: string;
  actor_id?: string | null;
  table_name: string;
  record_id: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE' | 'EXECUTE' | 'AUTH';
  old_state?: Record<string, unknown> | null;
  new_state?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  prev_hash?: string | null;
  hash: string;
  created_at: string;
}

export interface ActionOutboxItem {
  id: string;
  lc_id: string;
  action_type: OutboxActionType;
  entity_type: string;
  entity_id: string;
  payload: Record<string, unknown>;
  requires_human_approval: boolean;
  status: OutboxStatus;
  proposed_by: string;
  approved_by?: string | null;
  rejection_reason?: string | null;
  executed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export type HandoffStatus = 'INITIATED' | 'PREPARED' | 'ACCEPTED' | 'REJECTED' | 'ESCALATED';

export interface StakeholderHandoff {
  id: string;
  handoff_id: string;
  lc_id: string;
  record_type: 'EP_PROFILE' | 'ORGANIZATION' | 'DEAL' | 'OPPORTUNITY';
  record_id: string;
  from_owner_id: string;
  to_owner_id: string;
  from_team: string;
  to_team: string;
  reason: string;
  handoff_status: HandoffStatus;
  rejection_reason?: string | null;
  open_task_count: number;
  blocking_items: Array<{ id: string; description: string; resolved: boolean }>;
  required_context_confirmed: boolean;
  due_at: string;
  accepted_at?: string | null;
  escalation_owner_id?: string | null;
  audit_event_id?: string | null;
  row_version: number;
  created_at: string;
  updated_at: string;
}

export interface B2BMeetingLog {
  id: string;
  lc_id: string;
  org_id: string;
  deal_id?: string | null;
  primary_contact_id?: string | null;
  host_user_id: string;
  meeting_type: 'PHYSICAL' | 'GOOGLE_MEET' | 'PHONE';
  occurred_at: string;
  duration_minutes: number;
  agenda?: string | null;
  minutes_notes: string;
  next_action_due_at?: string | null;
  next_action_owner_id?: string | null;
  next_action_summary?: string | null;
  created_at: string;
  updated_at: string;
}

export interface B2BProposal {
  id: string;
  lc_id: string;
  deal_id: string;
  version_number: number;
  proposal_title: string;
  target_product: 'iGV' | 'iGTa' | 'iGTe';
  proposed_openings: number;
  partner_fee_mad: number;
  stipend_salary_mad: number;
  accommodation_included: boolean;
  proposal_status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REVISED' | 'DECLINED';
  document_id?: string | null;
  sent_at?: string | null;
  decided_at?: string | null;
  decision_notes?: string | null;
  created_by_user_id: string;
  created_at: string;
  updated_at: string;
}

export interface KpiDefinition {
  id: string;
  kpi_code: string;
  name: string;
  purpose: string;
  department: string;
  formula: string;
  unit: string;
  numerator_def?: string | null;
  denominator_def?: string | null;
  inclusion_rules: unknown[];
  exclusion_rules: unknown[];
  source_entities: string[];
  default_filters: Record<string, unknown>;
  timezone: string;
  reporting_period: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
  refresh_cadence: 'REALTIME' | 'HOURLY' | 'DAILY';
  metric_status: 'DRAFT' | 'APPROVED' | 'DEPRECATED';
  version: number;
  effective_date: string;
  created_at: string;
  updated_at: string;
}

export interface KpiSnapshot {
  id: string;
  lc_id: string;
  kpi_id: string;
  period_start: string;
  period_end: string;
  calculated_value: number;
  numerator_value?: number | null;
  denominator_value?: number | null;
  underlying_records_count: number;
  definition_version: number;
  query_checksum: string;
  computed_at: string;
}

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Task {
  id: string;
  lc_id: string;
  title: string;
  owner_user_id: string;
  escalation_user_id: string;
  department: string;
  linked_record_type?: string | null;
  linked_record_id?: string | null;
  handoff_id?: string | null;
  automation_code?: string | null;
  due_at: string;
  priority: TaskPriority;
  is_snoozed: boolean;
  snooze_reason?: string | null;
  is_completed: boolean;
  completed_at?: string | null;
  escalation_level: number;
  idempotency_key?: string | null;
  row_version: number;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
}

export interface AfpmReserveFund {
  id: string;
  lc_id: string;
  term_code: string;
  reserve_type: string;
  minimum_reserve_mad: number;
  current_balance_mad: number;
  last_reconciled_at: string;
  reconciled_by_user_id?: string | null;
  sustainability_ratio: number;
  row_version: number;
  created_at: string;
  updated_at: string;
}
