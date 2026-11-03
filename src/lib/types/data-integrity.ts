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

export type MemberRole =
  | 'lcvp'
  | 'lcvp_igv'
  | 'lcvp_icx'
  | 'ecb'
  | 'ecb_auditor'
  | 'admin'
  | 'mm'
  | 'tl'
  | 'member'
  | 'finance'
  | 'auditor'
  | string;

export interface Member {
  id: string; // uuid
  name: string;
  role: MemberRole;
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
  funnel_stage?: PartnerFunnelStage | null;
  next_action?: string | null;
  next_action_due_at?: string | null;
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

export type DqStatus = 'open' | 'resolved' | 'auto_resolved' | 'ignored';

export interface DqIssue {
  id: number; // bigserial
  rule_id: string; // e.g., 'DQ-001' .. 'DQ-084'
  subject: string;
  severity: DqSeverity;
  status?: DqStatus;
  table_name?: string | null;
  record_id?: string | null;
  detected_at: string;
  sla_due_at?: string | null;
  resolved_at?: string | null;
  resolved_by?: string | null;
  resolution_note?: string | null;
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

export type DeadlineCategory = 'exchange' | 'partner' | 'compliance' | 'case';

export type DeadlineStatus =
  | 'upcoming'
  | 'notice'
  | 'warning'
  | 'urgent'
  | 'overdue'
  | 'resolved';

export type EscalationLevel = 'owner' | 'lcvp' | 'lcp';

export interface DeadlineItem {
  id: string;
  category: DeadlineCategory;
  subject: string;
  due_at: string; // ISO date / timestamptz
  rule_key: string;
  owner_id: string; // references Member(id)
  source: string;
  status: DeadlineStatus;
  escalation_level: EscalationLevel;
  entity_id: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  deleted_at?: string | null;
  deleted_reason?: string | null;
}

export interface PartnerStandardDef {
  std_no: number; // 1 to 8
  name: string;
  stage: FlowStage;
  rule_description: string;
}

export interface PartnerStandardCheck {
  opportunity_id: string; // references Opportunity(id)
  std_no: number; // 1 to 8
  delivered: boolean;
  delivered_at?: string | null;
  delivered_by?: string | null; // references Member(id)
  meeting_logged_at?: string | null;
  meeting_notes?: string | null;
  criteria_met: Record<string, unknown>;
  proof_id?: string | null; // references ProofDocument(id)
  metadata?: Record<string, unknown>;
  created_at: string;
  deleted_at?: string | null;
  deleted_reason?: string | null;
}

export interface PartnerNpsPrerequisites {
  partner_id: string;
  expa_org_id?: number | null;
  has_linked_employees: boolean;
  partner_portal_signup: boolean;
  is_eligible_for_nps: boolean;
  missing_prerequisites: string[];
}

export type PartnerPersona =
  | 'NGO Project Manager'
  | 'NGO Founder'
  | 'School Director'
  | 'Other';

export type PreferredChannel =
  | 'call'
  | 'WhatsApp'
  | 'email'
  | 'Facebook/Instagram'
  | 'meeting';

export type ObjectionTag =
  | 'payment-before-value'
  | 'bad past experience'
  | 'no budget'
  | 'no accommodation/food'
  | 'low priority';

export type PartnerFunnelStage =
  | 'lead'
  | 'called'
  | 'meeting'
  | 'open created'
  | 'contract signed'
  | 'hosting'
  | 'retained'
  | 'lost';

export type TouchpointType =
  | 'monthly_call'
  | 'site_visit'
  | 'lc_touchpoint'
  | 'newsletter'
  | 'quarterly_review';

export interface PartnerTouchpoint {
  id: string; // uuid
  partner_id: string; // references OpPartner(id)
  type: TouchpointType;
  occurred_at: string;
  actor_id: string; // references Member(id)
  notes: string;
  next_action?: string | null;
  next_action_due_at?: string | null;
  metadata?: Record<string, unknown>;
  created_at: string;
  deleted_at?: string | null;
  deleted_reason?: string | null;
}

// =============================================================================
// INTERNATIONAL RELATIONS (IR) PARTNER ECOSYSTEM & 2×2 CLUSTERING (§9.3)
// =============================================================================

export type IrCluster = 'upscale' | 'grow' | 'understand' | 'invest';

export type IrTrackerStatus = 'active' | 'in_discussion' | 'paused' | 'archived';

export type IrReviewFrequency = 'weekly' | 'biweekly' | 'monthly' | 'quarterly';

export interface IrPartner {
  id: string; // uuid
  home_entity_id: string; // references EntityOrg(id)
  owner_id: string; // references Member(id)
  
  // Define
  purpose?: string | null;
  partnership_goals?: string[] | null;
  
  // Analyze
  persona?: string | null;
  timeline?: Record<string, unknown> | null;
  result_history?: Record<string, unknown> | null;
  custom_supply_threshold?: number | null;
  custom_readiness_threshold?: number | null;
  
  // Promote
  physical_content?: string[] | null;
  digital_content?: string[] | null;
  comms_channels?: string[] | null;
  
  // Deliver
  re_growth_target: number;
  process_time_target_days?: number | null;
  standards_codelivery_notes?: string | null;
  strategy?: string | null;
  
  // Track
  tracker_status: IrTrackerStatus;
  routines?: string[] | null;
  review_frequency: IrReviewFrequency;
  network_touchpoints?: Record<string, unknown>[] | null;
  investment?: string | null;
  last_review_at?: string | null;
  cluster: IrCluster;
  
  // Audit & Invariant fields
  created_at: string;
  deleted_at?: string | null;
  deleted_reason?: string | null;
}

export interface IrClusterAnalysis {
  cluster: IrCluster;
  supply: number; // applicants received from them (iCX)
  marketReadiness: number; // our opportunities available (iCX)
  supplyThreshold: number;
  readinessThreshold: number;
  isHighSupply: boolean;
  isHighReadiness: boolean;
  meaning: string;
}

export interface IrCustomerFlowAnalytics {
  attraction: number; // Open EPs
  consideration: number; // APL + ACP
  preparation: number; // APD
  experience: number; // RE
  postExperience: number; // FI + CO
  total: number;
  aplToAcpConversionPct: number;
  acpToApdConversionPct: number;
  apdToReConversionPct: number;
  reToCoConversionPct: number;
  avgProcessTimeDays: {
    aplToApd: number | null;
    apdToRe: number | null;
  };
}

export interface IrStandardsDeliveryAnalytics {
  totalExchanges: number;
  hostStandardsDeliveredPct: number; // #4–#15
  homeStandardsDeliveredPct: number; // #1–#3, #16
  overallDeliveryPct: number;
  byStandard: Record<number, { name: string; deliveredPct: number; deliveredBy: string }>;
}

export interface StuckEp {
  epId: string;
  fullName: string;
  exchangeId: string;
  status: ExStatus;
  currentStage: FlowStage;
  idleDays: number;
  ownerId: string;
  stuckReason: string;
}

// =============================================================================
// QUALITY CASES & CUSTOMER SUPPORT (CS) MINIMUMS (§10 MODULE E, S4, S9)
// =============================================================================

export type CaseClassification = 'policy_breach' | 'expectation_gap' | 'other';

export type CompensationType =
  | 'refund'
  | 'reimbursement'
  | 'migration_fine'
  | 'goodwill'
  | 'other';

export interface ResolutionStep {
  step_no: number;
  action_taken: string;
  description: string;
  timestamp: string; // ISO timestamptz
  actor_id: string; // references Member(id)
}

export interface CaseQuality {
  id: string; // uuid
  exchange_id: string; // references Exchange(id)
  title: string;
  description: string;
  classification: CaseClassification;
  opened_at: string;
  first_response_at?: string | null;
  closed_at?: string | null;
  resolution_steps: ResolutionStep[];
  compensation_amount: number;
  currency: string;
  compensation_type?: CompensationType | null;
  financial_proof_id?: string | null;
  final_agreement_id?: string | null;
  recurrence_of?: string | null; // references CaseQuality(id)
  owner_id: string; // references Member(id)
  created_at: string;
  deleted_at?: string | null;
  deleted_reason?: string | null;
}

export interface ExchangeCaseDossier {
  exchange: Exchange;
  ep: Ep;
  opportunity: Opportunity;
  cases: CaseQuality[];
  statusRequests: StatusRequest[];
  totalCompensationMAD: number;
  hasOpenCases: boolean;
  hasPolicyBreach: boolean;
}

export interface CsKpiReport {
  month: string; // YYYY-MM
  totalCases: number;
  openCasesCount: number;
  closedCasesCount: number;
  avgResolutionTimeDays: number | null;
  avgFirstResponseHours: number | null;
  totalCompensationAmount: number;
  compensationByClassification: Record<CaseClassification, number>;
  compensationByType: Record<string, number>;
  recurrenceRatePct: number;
}

// =============================================================================
// COMPLIANCE CALENDAR & ICB FREEZE GATE (§11 MODULE F, S3, S9, D10, T-11)
// =============================================================================

export type ComplianceKind =
  | 'icb_audit_doc'
  | 'ecb_quarterly_report'
  | 'unfreezing_submission'
  | 'internal_audit';

export type ComplianceResult = 'passed' | 'failed' | 'pending' | 'waived';

export interface IcbAuditDocDef {
  doc_number: number;
  title: string;
  section: string;
  description: string;
}

export interface ComplianceItem {
  id: string; // uuid
  entity_id: string; // references EntityOrg(id)
  kind: ComplianceKind;
  doc_number?: number | null;
  title: string;
  section: string;
  due_at: string;
  submitted_at?: string | null;
  result: ComplianceResult;
  pass_pct?: number | null;
  evidence_ids: string[];
  violation_level?: number | null;
  notes?: string | null;
  source_link?: string | null;
  owner_id: string; // references Member(id)
  created_at: string;
  deleted_at?: string | null;
  deleted_reason?: string | null;
}

export interface FreezeEntityPayload {
  entity_id: string;
  is_frozen: boolean;
  icb_audit_reference_link: string;
  reason: string;
  actor_id: string;
  actor_role?: MemberRole;
}

// =============================================================================
// DATA QUALITY ENGINE & INTEGRITY CONSOLE (§13.2, §14)
// =============================================================================

export type HealthGrade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface HealthDimensionScore {
  score: number; // 0-100
  weight: number; // 0-1
  weightedScore: number; // score * weight
  details: Record<string, number | string | boolean>;
}

export interface DataHealthScoreResult {
  overallScore: number; // 0-100
  grade: HealthGrade;
  calculatedAt: string;
  dimensions: {
    completeness: HealthDimensionScore; // 35%
    freshness: HealthDimensionScore; // 25%
    expaConsistency: HealthDimensionScore; // 25%
    ownership: HealthDimensionScore; // 15%
  };
  blockerCount: number;
  urgentCount: number;
  warnCount: number;
  reviewCount: number;
}

export interface IntegrityConsoleSummary {
  healthScore: DataHealthScoreResult;
  openIssuesBySeverity: Record<DqSeverity, number>;
  openIssuesByOwner: Record<string, number>;
  stalenessByStage: Record<FlowStage, { total: number; stale: number; stalePct: number }>;
  completenessByStage: Record<FlowStage, { requiredCount: number; filledCount: number; completenessPct: number }>;
  reconciliationMismatchCount: number;
  orphanedRecordsCount: number;
  deadlinesNext14DaysCount: number;
  openRequestsCount: number;
  overallStandardsDeliveryPct: number;
  standardsMismatchCount: number;
  totalPartners: number;
  partnersWithOverdueTouchpoint: number;
  irClustersCount: Record<IrCluster, number>;
  openCasesCount: number;
  totalCompensationMAD: number;
}

// =============================================================================
// OWNERSHIP, HANDOFF & DISASTER RECOVERY (§12, §13.3, §16 T-14, T-15, T-19)
// =============================================================================

export interface RaciMatrix {
  responsible?: string[];
  accountable: string; // Member ID
  consulted?: string[];
  informed?: string[];
}

export type SynergyTag = 'marketing' | 'b2b' | 'tm_mxp' | 'finance_legal';

export type HandoffStatus =
  | 'initiated'
  | 'packet_generated'
  | 'reviewed_by_outgoing'
  | 'acknowledged_by_incoming'
  | 'transferred'
  | 'completed'
  | 'reopened';

export type HandoffScope = 'individual' | 'team' | 'department' | 'term_transition';

export interface HandoffPacket {
  generated_at: string;
  outgoing_owner_id: string;
  incoming_owner_id: string;
  scope: HandoffScope;
  openExchangesByStage: Record<FlowStage, Exchange[]>;
  overdueDeadlines: Record<string, unknown>[];
  openRequests: StatusRequest[];
  openCases: CaseQuality[];
  partners: OpPartner[];
  irPartners: IrPartner[];
  openDqIssues: DqIssue[];
  proofIndex: ProofDocument[];
  changeLog30d: AuditLogEntry[];
  accessList: { member_id: string; role: MemberRole }[];
}

export interface HandoffRecord {
  id: string;
  scope: HandoffScope;
  outgoing_owner_id: string;
  incoming_owner_id: string;
  status: HandoffStatus;
  packet: HandoffPacket;
  outgoing_reviewed_at?: string | null;
  incoming_acknowledged_at?: string | null;
  transferred_at?: string | null;
  transferred_counts: Record<string, number>;
  watch_period_ends_at?: string | null;
  created_at: string;
  deleted_at?: string | null;
  deleted_reason?: string | null;
}

export interface SnapshotManifest {
  timestamp: string;
  environment: string;
  tables: Record<string, { rowCount: number; sha256: string }>;
  totalRows: number;
  manifestChecksum: string;
}

export interface FullExportBundle {
  exported_at: string;
  actor_id: string;
  scope: string;
  manifest: SnapshotManifest;
  tables: Record<string, unknown[]>;
  proofIndex: ProofDocument[];
  handoffPacket?: HandoffPacket | null;
  ruleRegistryState: Record<string, unknown>;
}

export interface HandoffTask {
  id: string;
  rule_id: 'DQ-010' | 'DQ-011';
  record_id: string;
  record_type: string;
  previous_owner_id?: string;
  assigned_manager_id: string;
  status: 'pending' | 'in_progress' | 'resolved';
  created_at: string;
  resolved_at?: string | null;
}











