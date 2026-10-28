/**
 * AIESEC in Rabat — All-in-One ICX ERP
 * Module 1 Dashboard Types & Specification Interfaces
 * Based on Aiesec Icx Erp Dashboard Kpis And Graph Architecture.md
 */

export type TermFilter = '26.1' | '26.2' | 'CUSTOM' | 'PEAK_WINTER' | 'PEAK_SUMMER';
export type ProductFilter = 'ALL' | 'iGV' | 'iGTa' | 'iGTe';
export type EngineFilter = 'ALL' | 'EXTERNAL' | 'INTERNAL';
export type RoleFilter = 'ALL' | 'LCVP' | 'MM_TL' | 'TM';

export interface DashboardFilterState {
  term: TermFilter;
  product: ProductFilter;
  engine: EngineFilter;
  role: RoleFilter;
  selectedMemberId?: string;
  customDateRange?: {
    startDate: string;
    endDate: string;
  };
}

export type DomainCardId =
  | 'card-1'
  | 'card-2'
  | 'card-3'
  | 'card-4'
  | 'card-5'
  | 'card-6'
  | 'card-7'
  | 'card-8'
  | 'card-9';

export type DomainId =
  | 'funnel'
  | 'b2b'
  | 'opps'
  | 'ir'
  | 'visa'
  | 'cxp'
  | 'housing'
  | 'finance'
  | 'members'
  | DomainCardId;

export interface GlobalDashboardFilters {
  term: string;
  product: string;
  engine: string;
  role: string;
  memberId?: string;
}

export type HealthStatus = 'GREEN' | 'AMBER' | 'RED';


export interface HeadlineKpi {
  id: string;
  label: string;
  value: string;
  target?: string;
  wowDelta: string; // e.g. "+12%", "-4%"
  trend: 'UP' | 'DOWN' | 'STABLE';
  isGood: boolean; // green vs red
}

export interface KpiScorecardItem {
  id: string;
  metricType: string;
  name: string;
  formula: string;
  dataSource: string;
  currentValue: number | string;
  unit: string;
  target: number | string;
  achievedPercentage: number;
  ragStatus: HealthStatus;
  benchmarkDescription: string;
  responsibleRole: string;
}

export type MicroVisualType =
  | 'funnel'
  | 'stacked_pipeline'
  | 'capacity_bar'
  | 'countries_bar'
  | 'readiness_strip'
  | 'standards_strip'
  | 'occupancy_bullet'
  | 'sustainability_bullet'
  | 'engagement_tiers';

export interface DomainCardSummary {
  id: DomainId;
  cardIndex?: number; // 1..9
  number?: string;
  title: string;
  subtitle?: string;
  healthBadge?: HealthStatus;
  healthStatus?: 'green' | 'amber' | 'rose';
  healthLabel?: string;
  healthReason?: string;
  primaryMos: {
    label: string;
    actual?: string | number;
    value?: string | number;
    target?: string | number;
    pctAchieved?: number;
    attainmentPct?: number;
    unit?: string;
  };
  headlineKpis: Array<{
    id?: string;
    label: string;
    value: string;
    target?: string;
    wowDelta?: string;
    trend?: 'UP' | 'DOWN' | 'STABLE';
    isGood?: boolean;
    delta?: {
      value?: string;
      direction?: 'up' | 'down' | 'neutral';
    };
  }>;
  microVisualType?: MicroVisualType;
  microVisualData?: Record<string, any>;
  microVisual?: Record<string, any>;
  kpiScorecard?: KpiScorecardItem[];
  scorecard?: Array<{
    id: string;
    code: string;
    name: string;
    formula: string;
    current: string | number;
    target: string | number;
    achievedPct: number;
    rag: 'green' | 'amber' | 'rose';
    responsibleRole: string;
    unit?: string;
  }>;
  exceptions: Array<{
    id: string;
    title: string;
    severity: string;
    description?: string;
    details?: string;
    entityType?: string;
    entityId?: string;
    referenceCode?: string;
    owner: string;
    agingDays?: number;
    daysOverdue?: number;
    recommendedAction?: string;
  }>;
}


// -------------------------------------------------------------
// Specialized Types for Card 9 (Member Engagement & TeSt)
// -------------------------------------------------------------
export type MemberEngagementTier =
  | 'TIER_1_CORE'      // 90% - 100% Attendance & Score (Rayen, Firdawsse, Abdenasser...)
  | 'TIER_2_STRONG'    // 70% - 89% Consistent contributor
  | 'TIER_3_MODERATE'  // 20% - 69% Partial, late joiner (>15m)
  | 'TIER_4_DROPOFF';  // <20% Critical drop-off risk

export interface MemberAnalyticsRecord {
  id: string;
  fullName: string;
  email: string;
  engine: 'EXTERNAL' | 'INTERNAL';
  team: string; // e.g. 'BD & B2B Sales', 'Ops & Delivery', 'IR & Match'
  role: 'LCVP' | 'MM_TL' | 'TM';
  compositeMesScore: number; // 0..100%
  tier: MemberEngagementTier;
  attendancePct: number; // 0..100%
  avgDelayMinutes: number; // minutes late
  personalKpiPct: number; // 0..100%
  taskOnTimePct: number; // 0..100%
  o2oCompleted: boolean;
  o2oDate?: string;
  o2oWellbeingScore?: number; // 1..5
  activeTasksCount: number;
  overdueTasksCount: number;
  weeklyAttendance: Array<{ week: number; status: 'PRESENT' | 'LATE' | 'ABSENT'; hasO2o?: boolean }>;
}

export interface TeamStandardsProgress {
  stage: 'BUILDING' | 'PERFORMING' | 'CLOSING';
  items: Array<{
    id: string;
    title: string;
    description: string;
    isCompleted: boolean;
    completedAt?: string;
    responsible: string;
  }>;
  compliancePct: number;
}
