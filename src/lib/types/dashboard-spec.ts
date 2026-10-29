/**
 * AIESEC iCX ERP — KPI Dashboard Specification Types
 * Reference: AIESEC_iCX_ERP_KPI_Dashboard_Specification.md
 * Strict adherence to Hub authorities, cohort-aware analytics, best-chart rules,
 * and 100% drill-down governance.
 */

export type ProgramType = 'ALL' | 'iGV' | 'iGTa' | 'iGTe';
export type TermMandate = '26.1' | '26.2' | 'CUSTOM';
export type CohortPeriod = '2026-Q1' | '2026-Q2' | '2026-Q3' | 'PEAK_WINTER' | 'PEAK_SUMMER' | 'ALL';

export type KpiWorkflowDomain =
  | 'MARKET_RESEARCH'
  | 'SALES_CRM'
  | 'CONTRACTS_SUPPLY'
  | 'IR_MANAGEMENT'
  | 'EP_FUNNEL'
  | 'MATCHING_CAPACITY'
  | 'VISA_PRE_ARRIVAL'
  | 'ARRIVAL_DELIVERY'
  | 'EXCHANGE_STANDARDS'
  | 'FINANCE_ECONOMICS'
  | 'TEAM_EXECUTION';

export type MetricConfidenceLevel = 'VERIFIED_OFFICIAL' | 'CONFIRMED_LOCAL' | 'PROPOSED';

export type DateBasisType =
  | 'APPLICATION_DATE'
  | 'STAGE_ENTRY_DATE'
  | 'MATCH_DATE'
  | 'REALIZATION_DATE'
  | 'COMPLETION_DATE'
  | 'INVOICE_DATE'
  | 'TASK_DUE_DATE';

export interface OfficialSourceAttribution {
  authority: 'Exchange Hub' | 'IM Hub' | 'ICB Hub' | 'Finance Academy' | 'Partners Hub' | 'MX Hub' | 'Local SOP';
  url: string;
  docTitle: string;
  version?: string;
  reviewDate?: string;
}

export interface KpiRegistryEntry {
  kpiKey: string;
  name: string;
  domain: KpiWorkflowDomain;
  confidence: MetricConfidenceLevel;
  officialSource?: OfficialSourceAttribution;
  definition: string;
  formulaDescription: string;
  numeratorDescription?: string;
  denominatorDescription?: string;
  unit: '%' | 'MAD' | 'count' | 'days' | 'ratio' | 'score';
  dateBasis: DateBasisType;
  targetBenchmark: string;
  responsibleRole: string;
  drillDownUrl: string;
}

export interface CohortRateMetric {
  value: number;
  numerator: number;
  denominator: number;
  formattedRate: string; // e.g. "21.4%"
  fractionText: string;  // e.g. "24/112"
  target?: number;
  targetFormatted?: string;
  trendDirection: 'UP' | 'DOWN' | 'STABLE';
  isGood: boolean;
  wowDelta: string;
}

export interface ExecutiveOutcomeCards {
  realized: {
    current: number;
    target: number;
    attainmentPct: number;
    deltaText: string;
    trend: 'UP' | 'DOWN' | 'STABLE';
    isGood: boolean;
  };
  completed: {
    current: number;
    target: number;
    attainmentPct: number;
    deltaText: string;
    trend: 'UP' | 'DOWN' | 'STABLE';
    isGood: boolean;
  };
  cohortAppToRealized: CohortRateMetric;
  standardsCompliance: CohortRateMetric;
}

export interface ExecutiveSupplyCards {
  qualifiedPipelineMad: {
    amountMad: number;
    dealCount: number;
    targetMad: number;
    attainmentPct: number;
    deltaText: string;
    trend: 'UP' | 'DOWN' | 'STABLE';
    isGood: boolean;
  };
  signedPartnersCount: {
    current: number;
    target: number;
    attainmentPct: number;
    deltaText: string;
    trend: 'UP' | 'DOWN' | 'STABLE';
    isGood: boolean;
  };
  validAvailableSlots: {
    openSlots: number;
    totalSlots: number;
    projectCount: number;
  };
  slotFillRate: CohortRateMetric;
}

export interface SteppedFunnelStage {
  stageId: 'APD' | 'ACC' | 'APD_FEE' | 'REA' | 'COM';
  stageName: string;
  cohortCount: number;
  conversionFromPriorPct: number; // e.g. 75%
  conversionFraction: string;    // e.g. "36/48"
  dropOffCount: number;
  medianDaysInStage: number;
  primaryDropOffReason?: string;
}

export interface ProjectCapacityItem {
  projectCode: string;
  projectName: string;
  sdgNumber: number;
  sdgName: string;
  totalValidSlots: number;
  filledSlots: number;
  openSlots: number;
  fillRatePct: number;
  fillRateFraction: string;
  status: 'OPTIMAL' | 'AT_RISK' | 'CRITICAL';
}

export type ActionQueueCategory =
  | 'OVERDUE_STANDARDS'
  | 'UNMATCHED_EPS'
  | 'STALE_DEALS'
  | 'ARRIVALS_READINESS'
  | 'HIGH_SEVERITY_CASES'
  | 'OVERDUE_INVOICES';

export interface ActionQueueItem {
  id: string;
  category: ActionQueueCategory;
  categoryLabel: string;
  title: string;
  entityName: string;
  entityId: string;
  assignedOwner: string;
  ownerRole: string;
  daysIdleOrOverdue: number;
  severity: 'critical' | 'warning' | 'info';
  rootCauseSignal: string;
  recommendedAction: string;
  drillDownUrl: string;
}

export interface KpiDiagnosticExplanation {
  summary: string;
  primaryBottleneck: string;
  affectedEntitiesCount: number;
  evidenceCitations: string[];
  recommendedPrescription: string;
}

export interface KpiDetailViewData {
  kpiKey: string;
  name: string;
  domain: KpiWorkflowDomain;
  confidence: MetricConfidenceLevel;
  officialSource?: OfficialSourceAttribution;
  definition: string;
  formulaDescription: string;
  numerator: number | null;
  denominator: number | null;
  rateFormatted: string;
  fractionText: string;
  cohortBasis: string;
  target: string;
  trend: {
    currentVal: string | number;
    priorVal: string | number;
    deltaText: string;
    direction: 'up' | 'down' | 'neutral';
    isGood: boolean;
  };
  breakdowns: Array<{
    label: string;
    count: number;
    percentage: number;
  }>;
  exceptionRecords: Array<{
    id: string;
    title: string;
    subtitle?: string;
    owner: string;
    severity: 'critical' | 'warning' | 'info';
    daysIdle: number;
    nextAction: string;
    recordUrl: string;
  }>;
  reasonCodes: Array<{
    code: string;
    label: string;
    count: number;
    percentage: number;
  }>;
  diagnostic: KpiDiagnosticExplanation;
  nextAction: {
    owner: string;
    deadline: string;
    actionText: string;
    routeUrl: string;
  };
}
