/**
 * AIESEC in Rabat — All-in-One ICX ERP
 * Dashboard Data Engine & KPI Calculation Core
 * Implements Module 1 Specification
 */

import {
  type DashboardFilterState,
  type GlobalDashboardFilters,
  type TermFilter,
  type ProductFilter,
  type EngineFilter,
  type RoleFilter,
  type DomainId,
  type DomainCardId,
  type DomainCardSummary,
  type MemberAnalyticsRecord,
  type TeamStandardsProgress,
  type MemberEngagementTier,
  type HealthStatus,
} from './dashboard-types';

// =========================================================================
// Member Engagement Roster (AIESEC in Rabat Official Records)
// =========================================================================
export const INITIAL_RABAT_MEMBERS: MemberAnalyticsRecord[] = [
  {
    id: 'usr_rabat_01',
    fullName: 'Rayen Jbali',
    email: 'rayen.jbali@aiesec.net',
    engine: 'INTERNAL',
    team: 'Ops & IR Delivery',
    role: 'MM_TL',
    compositeMesScore: 100,
    tier: 'TIER_1_CORE',
    attendancePct: 100,
    avgDelayMinutes: 0,
    personalKpiPct: 95,
    taskOnTimePct: 100,
    o2oCompleted: true,
    o2oDate: '2026-10-14',
    o2oWellbeingScore: 5,
    activeTasksCount: 4,
    overdueTasksCount: 0,
    weeklyAttendance: [
      { week: 1, status: 'PRESENT' },
      { week: 2, status: 'PRESENT' },
      { week: 3, status: 'PRESENT', hasO2o: true },
      { week: 4, status: 'PRESENT' },
      { week: 5, status: 'PRESENT' },
      { week: 6, status: 'PRESENT' },
      { week: 7, status: 'PRESENT', hasO2o: true },
      { week: 8, status: 'PRESENT' },
    ],
  },
  {
    id: 'usr_rabat_02',
    fullName: 'Firdawsse Jray',
    email: 'firdawsse.jray@aiesec.net',
    engine: 'EXTERNAL',
    team: 'BD & B2B Sales',
    role: 'MM_TL',
    compositeMesScore: 98,
    tier: 'TIER_1_CORE',
    attendancePct: 100,
    avgDelayMinutes: 1,
    personalKpiPct: 94,
    taskOnTimePct: 96,
    o2oCompleted: true,
    o2oDate: '2026-10-15',
    o2oWellbeingScore: 5,
    activeTasksCount: 5,
    overdueTasksCount: 0,
    weeklyAttendance: [
      { week: 1, status: 'PRESENT' },
      { week: 2, status: 'PRESENT' },
      { week: 3, status: 'PRESENT', hasO2o: true },
      { week: 4, status: 'PRESENT' },
      { week: 5, status: 'PRESENT' },
      { week: 6, status: 'PRESENT' },
      { week: 7, status: 'PRESENT', hasO2o: true },
      { week: 8, status: 'PRESENT' },
    ],
  },
  {
    id: 'usr_rabat_03',
    fullName: 'Abdenasser Moussafi',
    email: 'abdenasser.moussafi@aiesec.net',
    engine: 'INTERNAL',
    team: 'Logistics & CXP',
    role: 'TM',
    compositeMesScore: 98,
    tier: 'TIER_1_CORE',
    attendancePct: 98,
    avgDelayMinutes: 2,
    personalKpiPct: 92,
    taskOnTimePct: 100,
    o2oCompleted: true,
    o2oDate: '2026-10-16',
    o2oWellbeingScore: 4,
    activeTasksCount: 3,
    overdueTasksCount: 0,
    weeklyAttendance: [
      { week: 1, status: 'PRESENT' },
      { week: 2, status: 'PRESENT' },
      { week: 3, status: 'PRESENT' },
      { week: 4, status: 'PRESENT', hasO2o: true },
      { week: 5, status: 'PRESENT' },
      { week: 6, status: 'PRESENT' },
      { week: 7, status: 'PRESENT' },
      { week: 8, status: 'PRESENT' },
    ],
  },
  {
    id: 'usr_rabat_04',
    fullName: 'Nourdine Ettaoumi',
    email: 'nourdine.ettaoumi@aiesec.net',
    engine: 'EXTERNAL',
    team: 'BD & B2B Sales',
    role: 'TM',
    compositeMesScore: 97,
    tier: 'TIER_1_CORE',
    attendancePct: 98,
    avgDelayMinutes: 2,
    personalKpiPct: 90,
    taskOnTimePct: 95,
    o2oCompleted: true,
    o2oDate: '2026-10-18',
    o2oWellbeingScore: 4,
    activeTasksCount: 4,
    overdueTasksCount: 0,
    weeklyAttendance: [
      { week: 1, status: 'PRESENT' },
      { week: 2, status: 'PRESENT' },
      { week: 3, status: 'PRESENT', hasO2o: true },
      { week: 4, status: 'PRESENT' },
      { week: 5, status: 'PRESENT' },
      { week: 6, status: 'PRESENT' },
      { week: 7, status: 'PRESENT' },
      { week: 8, status: 'PRESENT' },
    ],
  },
  {
    id: 'usr_rabat_05',
    fullName: 'Mohamed El Kahri',
    email: 'mohamed.elkahri@aiesec.net',
    engine: 'INTERNAL',
    team: 'Ops & IR Delivery',
    role: 'TM',
    compositeMesScore: 97,
    tier: 'TIER_1_CORE',
    attendancePct: 97,
    avgDelayMinutes: 3,
    personalKpiPct: 91,
    taskOnTimePct: 96,
    o2oCompleted: true,
    o2oDate: '2026-10-17',
    o2oWellbeingScore: 5,
    activeTasksCount: 3,
    overdueTasksCount: 0,
    weeklyAttendance: [
      { week: 1, status: 'PRESENT' },
      { week: 2, status: 'PRESENT' },
      { week: 3, status: 'PRESENT' },
      { week: 4, status: 'PRESENT', hasO2o: true },
      { week: 5, status: 'PRESENT' },
      { week: 6, status: 'PRESENT' },
      { week: 7, status: 'PRESENT' },
      { week: 8, status: 'PRESENT' },
    ],
  },
  {
    id: 'usr_rabat_06',
    fullName: 'Salma Sahl',
    email: 'salma.sahl@aiesec.net',
    engine: 'EXTERNAL',
    team: 'BD & Partner Branding',
    role: 'TM',
    compositeMesScore: 97,
    tier: 'TIER_1_CORE',
    attendancePct: 97,
    avgDelayMinutes: 2,
    personalKpiPct: 93,
    taskOnTimePct: 94,
    o2oCompleted: true,
    o2oDate: '2026-10-15',
    o2oWellbeingScore: 4,
    activeTasksCount: 2,
    overdueTasksCount: 0,
    weeklyAttendance: [
      { week: 1, status: 'PRESENT' },
      { week: 2, status: 'PRESENT' },
      { week: 3, status: 'PRESENT', hasO2o: true },
      { week: 4, status: 'PRESENT' },
      { week: 5, status: 'PRESENT' },
      { week: 6, status: 'PRESENT' },
      { week: 7, status: 'PRESENT' },
      { week: 8, status: 'PRESENT' },
    ],
  },
  {
    id: 'usr_rabat_07',
    fullName: 'Kenza Benjelloun',
    email: 'kenza.benjelloun@aiesec.net',
    engine: 'EXTERNAL',
    team: 'BD & B2B Sales',
    role: 'TM',
    compositeMesScore: 84,
    tier: 'TIER_2_STRONG',
    attendancePct: 88,
    avgDelayMinutes: 6,
    personalKpiPct: 78,
    taskOnTimePct: 88,
    o2oCompleted: true,
    o2oDate: '2026-10-20',
    o2oWellbeingScore: 4,
    activeTasksCount: 3,
    overdueTasksCount: 0,
    weeklyAttendance: [
      { week: 1, status: 'PRESENT' },
      { week: 2, status: 'PRESENT' },
      { week: 3, status: 'PRESENT' },
      { week: 4, status: 'PRESENT', hasO2o: true },
      { week: 5, status: 'PRESENT' },
      { week: 6, status: 'LATE' },
      { week: 7, status: 'PRESENT' },
      { week: 8, status: 'PRESENT' },
    ],
  },
  {
    id: 'usr_rabat_08',
    fullName: 'Yassine Berrada',
    email: 'yassine.berrada@aiesec.net',
    engine: 'INTERNAL',
    team: 'Logistics & CXP',
    role: 'TM',
    compositeMesScore: 78,
    tier: 'TIER_2_STRONG',
    attendancePct: 80,
    avgDelayMinutes: 8,
    personalKpiPct: 74,
    taskOnTimePct: 80,
    o2oCompleted: true,
    o2oDate: '2026-10-21',
    o2oWellbeingScore: 3,
    activeTasksCount: 4,
    overdueTasksCount: 1,
    weeklyAttendance: [
      { week: 1, status: 'PRESENT' },
      { week: 2, status: 'LATE' },
      { week: 3, status: 'PRESENT' },
      { week: 4, status: 'PRESENT', hasO2o: true },
      { week: 5, status: 'PRESENT' },
      { week: 6, status: 'PRESENT' },
      { week: 7, status: 'LATE' },
      { week: 8, status: 'PRESENT' },
    ],
  },
  {
    id: 'usr_rabat_09',
    fullName: 'Hamza Chraibi',
    email: 'hamza.chraibi@aiesec.net',
    engine: 'EXTERNAL',
    team: 'BD & B2B Sales',
    role: 'TM',
    compositeMesScore: 56,
    tier: 'TIER_3_MODERATE',
    attendancePct: 62,
    avgDelayMinutes: 18, // Late arrival >15min
    personalKpiPct: 48,
    taskOnTimePct: 60,
    o2oCompleted: true,
    o2oDate: '2026-10-08',
    o2oWellbeingScore: 2,
    activeTasksCount: 5,
    overdueTasksCount: 2,
    weeklyAttendance: [
      { week: 1, status: 'LATE' },
      { week: 2, status: 'ABSENT' },
      { week: 3, status: 'LATE', hasO2o: true },
      { week: 4, status: 'PRESENT' },
      { week: 5, status: 'LATE' },
      { week: 6, status: 'ABSENT' },
      { week: 7, status: 'LATE' },
      { week: 8, status: 'PRESENT' },
    ],
  },
  {
    id: 'usr_rabat_10',
    fullName: 'Ghita Tazi',
    email: 'ghita.tazi@aiesec.net',
    engine: 'INTERNAL',
    team: 'Ops & IR Delivery',
    role: 'TM',
    compositeMesScore: 16, // Critical drop off
    tier: 'TIER_4_DROPOFF',
    attendancePct: 15,
    avgDelayMinutes: 35,
    personalKpiPct: 10,
    taskOnTimePct: 20,
    o2oCompleted: false,
    activeTasksCount: 6,
    overdueTasksCount: 4,
    weeklyAttendance: [
      { week: 1, status: 'ABSENT' },
      { week: 2, status: 'ABSENT' },
      { week: 3, status: 'ABSENT' },
      { week: 4, status: 'ABSENT' },
      { week: 5, status: 'LATE' },
      { week: 6, status: 'ABSENT' },
      { week: 7, status: 'ABSENT' },
      { week: 8, status: 'ABSENT' },
    ],
  },
];

// =========================================================================
// Team Standards (TeSt) Progress Data
// =========================================================================
export const INITIAL_TEAM_STANDARDS: TeamStandardsProgress[] = [
  {
    stage: 'BUILDING',
    compliancePct: 100,
    items: [
      { id: 'test_b1', title: '1.1 Team Creation & Identity', description: 'Communication channels and team rules set', isCompleted: true, completedAt: '2026-09-05', responsible: 'All TLs' },
      { id: 'test_b2', title: '1.2 Team Plan & Goal Breakdown', description: 'Collective MoS broken into weekly member quotas', isCompleted: true, completedAt: '2026-09-10', responsible: 'LCVP + TLs' },
      { id: 'test_b3', title: '1.3 Signed JD & Personal PDP', description: 'Every member signed JD and agreed on PDP goals', isCompleted: true, completedAt: '2026-09-15', responsible: 'TLs' },
    ],
  },
  {
    stage: 'PERFORMING',
    compliancePct: 88,
    items: [
      { id: 'test_p1', title: '2.1 Weekly Team Meetings', description: '100% weekly frequency with attendance tracking', isCompleted: true, completedAt: '2026-10-24', responsible: 'TLs' },
      { id: 'test_p2', title: '2.2 Individual KPI Tracking', description: 'Weekly review of B2B calls, EP interviews, standards', isCompleted: true, completedAt: '2026-10-24', responsible: 'TLs' },
      { id: 'test_p3', title: '2.3 Monthly One-to-Ones (O2Os)', description: 'TL2TM and LCVP2TL personal coaching completed', isCompleted: true, completedAt: '2026-10-22', responsible: 'LCVP + TLs' },
      { id: 'test_p4', title: '2.4 Recognition & Incentives', description: 'Weekly shoutouts & Member of the Month rewards', isCompleted: true, completedAt: '2026-10-20', responsible: 'TLs' },
      { id: 'test_p5', title: '2.5 Feedback & Safe Spaces', description: 'Bi-monthly peer and upward feedback spaces', isCompleted: false, responsible: 'TLs' },
    ],
  },
  {
    stage: 'CLOSING',
    compliancePct: 80,
    items: [
      { id: 'test_c1', title: '3.1 Team Debrief & Performance', description: 'Reviewing actual realization vs plan', isCompleted: true, completedAt: '2026-10-15', responsible: 'LCVP + TLs' },
      { id: 'test_c2', title: '3.2 Individual PDP Debrief', description: 'Next leadership role coaching & election prep', isCompleted: true, completedAt: '2026-10-18', responsible: 'TLs' },
      { id: 'test_c3', title: '3.3 Operational Knowledge Handover', description: 'Atomic transfer of accounts, EPs, and tasks in ERP', isCompleted: false, responsible: 'Outgoing & Incoming' },
    ],
  },
];

// =========================================================================
// Mathematical Engine & Filter Processor
// =========================================================================
export class DashboardDataEngine {
  /**
   * Generates the 9 Domain Summaries reactive to active filter state
   */
  public static getDomainSummaries(filters: DashboardFilterState): DomainCardSummary[] {
    const isGV = filters.product === 'iGV' || filters.product === 'ALL';
    const isExternal = filters.engine === 'EXTERNAL' || filters.engine === 'ALL';
    const isInternal = filters.engine === 'INTERNAL' || filters.engine === 'ALL';

    // Roster computation
    const filteredMembers = INITIAL_RABAT_MEMBERS.filter((m) => {
      if (filters.engine === 'EXTERNAL' && m.engine !== 'EXTERNAL') return false;
      if (filters.engine === 'INTERNAL' && m.engine !== 'INTERNAL') return false;
      if (filters.role === 'LCVP' && m.role !== 'LCVP') return false;
      if (filters.role === 'MM_TL' && m.role !== 'MM_TL') return false;
      if (filters.role === 'TM' && m.role !== 'TM') return false;
      if (filters.selectedMemberId && m.id !== filters.selectedMemberId) return false;
      return true;
    });

    const tier1Count = filteredMembers.filter((m) => m.tier === 'TIER_1_CORE').length;
    const tier2Count = filteredMembers.filter((m) => m.tier === 'TIER_2_STRONG').length;
    const tier3Count = filteredMembers.filter((m) => m.tier === 'TIER_3_MODERATE').length;
    const tier4Count = filteredMembers.filter((m) => m.tier === 'TIER_4_DROPOFF').length;
    const totalMembers = filteredMembers.length || 1;
    const engagedPct = Math.round(((tier1Count + tier2Count) / totalMembers) * 100);

    return [
      // -------------------------------------------------------------------
      // CARD 1: Core ICX Exchange Funnel & Process Velocity
      // -------------------------------------------------------------------
      {
        id: 'card-1',
        cardIndex: 1,
        title: 'Exchange Funnel & Velocity',
        subtitle: 'OPEN → CO End-to-End Pipeline Performance',
        healthBadge: 'GREEN',
        healthReason: 'Approvals pacing at 77.5% of target; velocity 4.2d beats 5d benchmark',
        primaryMos: {
          label: 'Realizations (RE)',
          actual: 24,
          target: 35,
          pctAchieved: 68.6,
          unit: 'RE',
        },
        headlineKpis: [
          { id: 'c1_k1', label: 'Approvals (APD)', value: '31 / 40', wowDelta: '+12%', trend: 'UP', isGood: true },
          { id: 'c1_k2', label: 'APP → APD Yield', value: '22.4%', wowDelta: '+3.1%', trend: 'UP', isGood: true },
          { id: 'c1_k3', label: 'Approval Speed', value: '4.2 Days', wowDelta: '-0.8d', trend: 'DOWN', isGood: true },
        ],
        microVisualType: 'funnel',
        microVisualData: {
          stages: [
            { name: 'APP', count: 138, pct: 100 },
            { name: 'SHORT', count: 86, pct: 62.3 },
            { name: 'ACC', count: 39, pct: 28.2 },
            { name: 'APD', count: 31, pct: 22.4 },
            { name: 'RE', count: 24, pct: 17.4 },
            { name: 'CO', count: 21, pct: 15.2 },
          ],
        },
        kpiScorecard: [
          {
            id: 'kpi_c1_01',
            metricType: 'MoS',
            name: 'Total Completions (CO)',
            formula: 'Count(EPs where status = COMPLETE)',
            dataSource: 'ep_applications (EXPA Sync)',
            currentValue: 21,
            target: 24,
            unit: 'CO',
            achievedPercentage: 87.5,
            ragStatus: 'GREEN',
            benchmarkDescription: '≥85% of Finished EPs pass all 13 Mandatory + ≥3/5 Non-Mandatory standards',
            responsibleRole: 'LCVP ICX / CXP Team',
          },
          {
            id: 'kpi_c1_02',
            metricType: 'MoS',
            name: 'Total Realizations (RE)',
            formula: 'Count(EPs where status in {REALIZED, FINISHED, COMPLETE})',
            dataSource: 'ep_applications',
            currentValue: 24,
            target: 35,
            unit: 'RE',
            achievedPercentage: 68.6,
            ragStatus: 'GREEN',
            benchmarkDescription: 'Target for Semester peak in Rabat (25 iGV + 10 iGTa/e)',
            responsibleRole: 'LCVP ICX / Operations',
          },
          {
            id: 'kpi_c1_03',
            metricType: 'MoS',
            name: 'Total Approvals (APD)',
            formula: 'Count(EPs with Host and Home Approval confirmed)',
            dataSource: 'ep_applications',
            currentValue: 31,
            target: 40,
            unit: 'APD',
            achievedPercentage: 77.5,
            ragStatus: 'GREEN',
            benchmarkDescription: '1.15× of RE target to protect against approval breakage',
            responsibleRole: 'Operations / Matching TL',
          },
          {
            id: 'kpi_c1_04',
            metricType: 'KPI (Volume)',
            name: 'Total Applications (APP)',
            formula: 'Count(Applications received in active period)',
            dataSource: 'ep_applications',
            currentValue: 138,
            target: 160,
            unit: 'APP',
            achievedPercentage: 86.2,
            ragStatus: 'GREEN',
            benchmarkDescription: '4× to 6× of APD target for healthy selection yield',
            responsibleRole: 'IR & Marketing',
          },
          {
            id: 'kpi_c1_05',
            metricType: 'KPI (CR%)',
            name: 'APP → APD Conversion Rate',
            formula: '(Total APD / Total APP) × 100',
            dataSource: 'Calculated',
            currentValue: '22.4%',
            target: '20.0%',
            unit: '%',
            achievedPercentage: 112.0,
            ragStatus: 'GREEN',
            benchmarkDescription: '≥20% for iGV, ≥12% for iGTa/e',
            responsibleRole: 'Matching Team',
          },
          {
            id: 'kpi_c1_06',
            metricType: 'KPI (Velocity)',
            name: 'Total Process Time (APP → APD)',
            formula: 'Avg(approved_at - applied_at) in days',
            dataSource: 'ep_applications',
            currentValue: '4.2 Days',
            target: '5.0 Days',
            unit: 'Days',
            achievedPercentage: 119.0,
            ragStatus: 'GREEN',
            benchmarkDescription: '≤5 Days for iGV in Rabat',
            responsibleRole: 'Operations Team',
          },
        ],
        exceptions: [
          {
            id: 'exc_c1_01',
            title: 'Stalled Candidate in Screening',
            severity: 'WARNING',
            details: 'Elena Rostova (EP-2026-084) pending OP interview confirmation for 3.2 days (>48h SLA)',
            entityType: 'EP Application',
            entityId: 'ep_084',
            owner: 'Rayen Jbali',
            daysOverdue: 1,
          },
        ],
      },

      // -------------------------------------------------------------------
      // CARD 2: B2B Partner CRM & Sales Pipeline
      // -------------------------------------------------------------------
      {
        id: 'card-2',
        cardIndex: 2,
        title: 'B2B CRM & Sales Pipeline',
        subtitle: 'External Engine & Corporate / NGO Deal Flow',
        healthBadge: 'AMBER',
        healthReason: '2 stale leads exceed 7-day touchpoint SLA; 14 of 18 contracts signed',
        primaryMos: {
          label: 'Signed Contracts',
          actual: 14,
          target: 18,
          pctAchieved: 77.8,
          unit: 'Deals',
        },
        headlineKpis: [
          { id: 'c2_k1', label: 'B2B Revenue (MAD)', value: '84,000 MAD', wowDelta: '+14,000 MAD', trend: 'UP', isGood: true },
          { id: 'c2_k2', label: 'Discovery Meetings', value: '9 / Week', wowDelta: '+2', trend: 'UP', isGood: true },
          { id: 'c2_k3', label: 'Proposal Win Rate', value: '38.5%', wowDelta: '-1.5%', trend: 'DOWN', isGood: false },
        ],
        microVisualType: 'stacked_pipeline',
        microVisualData: {
          stages: [
            { name: 'Leads', count: 32, color: '#94A3B8' },
            { name: 'Contacted', count: 24, color: '#38BDF8' },
            { name: 'Meeting', count: 18, color: '#037EF3' },
            { name: 'Proposal', count: 8, color: '#F59E0B' },
            { name: 'Signed', count: 14, color: '#10B981' },
          ],
        },
        kpiScorecard: [
          {
            id: 'kpi_c2_01',
            metricType: 'MoS',
            name: 'Signed Partner Contracts',
            formula: 'Count(B2B Deals reaching Signed status)',
            dataSource: 'b2b_deals / contracts',
            currentValue: 14,
            target: 18,
            unit: 'Signed OPs',
            achievedPercentage: 77.8,
            ragStatus: 'GREEN',
            benchmarkDescription: '18 confirmed opportunities contracted across Rabat & Salé',
            responsibleRole: 'LCVP BD / External Engine MM',
          },
          {
            id: 'kpi_c2_02',
            metricType: 'MoS',
            name: 'Contracted B2B Pipeline Value',
            formula: 'Sum(contract_total_mad for Signed Contracts)',
            dataSource: 'contracts',
            currentValue: '84,000 MAD',
            target: '105,000 MAD',
            unit: 'MAD',
            achievedPercentage: 80.0,
            ragStatus: 'GREEN',
            benchmarkDescription: 'Full coverage of project operational budgets',
            responsibleRole: 'LCVP BD & LCVP FnL',
          },
          {
            id: 'kpi_c2_03',
            metricType: 'KPI (Activity)',
            name: 'Discovery Meetings Completed',
            formula: 'Count(Meetings with completed BANT discovery notes)',
            dataSource: 'stakeholder_interactions',
            currentValue: '9 / Wk',
            target: '8 / Wk',
            unit: 'Mtg/Wk',
            achievedPercentage: 112.5,
            ragStatus: 'GREEN',
            benchmarkDescription: '≥8 discovery meetings weekly across BD members',
            responsibleRole: 'BD Team Members',
          },
          {
            id: 'kpi_c2_04',
            metricType: 'KPI (CR%)',
            name: 'Proposal → Contract Win Rate',
            formula: '(Signed Contracts / Proposals Sent) × 100',
            dataSource: 'b2b_deals',
            currentValue: '38.5%',
            target: '35.0%',
            unit: '%',
            achievedPercentage: 110.0,
            ragStatus: 'GREEN',
            benchmarkDescription: '≥35% win rate on formal corporate & NGO proposals',
            responsibleRole: 'External Engine MM',
          },
          {
            id: 'kpi_c2_05',
            metricType: 'KPI (SLA)',
            name: 'Stale Pipeline Deals (>7 Days No Contact)',
            formula: 'Count(Open Deals with last touchpoint >7d)',
            dataSource: 'b2b_deals',
            currentValue: 2,
            target: 0,
            unit: 'Deals',
            achievedPercentage: 0,
            ragStatus: 'AMBER',
            benchmarkDescription: '0 Stale Deals; requires immediate re-engagement or disqualify',
            responsibleRole: 'BD Account Managers',
          },
        ],
        exceptions: [
          {
            id: 'exc_c2_01',
            title: 'Stale Deal: Fondation CDG',
            severity: 'WARNING',
            details: 'Proposal sent 9 days ago with no logged follow-up touchpoint (SLA limit 7d)',
            entityType: 'B2B Deal',
            entityId: 'deal_cdg_02',
            owner: 'Nourdine Ettaoumi',
            daysOverdue: 2,
          },
        ],
      },

      // -------------------------------------------------------------------
      // CARD 3: Opportunity & Slot Capacity Health
      // -------------------------------------------------------------------
      {
        id: 'card-3',
        cardIndex: 3,
        title: 'Opportunities & Slot Capacity',
        subtitle: 'Product Portfolio, SDG Alignment & Opening Utilization',
        healthBadge: 'GREEN',
        healthReason: '78.1% of slots filled; 100% Account Manager assignment within 7 days',
        primaryMos: {
          label: 'Slot Fill Rate',
          actual: '78.1%',
          target: '85.0%',
          pctAchieved: 91.8,
          unit: '%',
        },
        headlineKpis: [
          { id: 'c3_k1', label: 'Live OPs on EXPA', value: '16 Live', wowDelta: '+3', trend: 'UP', isGood: true },
          { id: 'c3_k2', label: 'AM Assigned ≤7d', value: '100%', wowDelta: '0%', trend: 'STABLE', isGood: true },
          { id: 'c3_k3', label: 'OPs with Rejects ≥2', value: '1 OP', wowDelta: '0', trend: 'STABLE', isGood: false },
        ],
        microVisualType: 'capacity_bar',
        microVisualData: {
          totalSlots: 64,
          realizedOrApproved: 31,
          acceptedInProcess: 19,
          emptySlots: 14,
        },
        kpiScorecard: [
          {
            id: 'kpi_c3_01',
            metricType: 'MoS',
            name: 'Overall Slot Fill Rate',
            formula: '(Slots with APD or RE / Total Contracted Slots) × 100',
            dataSource: 'opportunity_slots',
            currentValue: '78.1%',
            target: '85.0%',
            unit: '%',
            achievedPercentage: 91.8,
            ragStatus: 'GREEN',
            benchmarkDescription: '≥85% target at least 30 days before realization start',
            responsibleRole: 'Matching Team Leader',
          },
          {
            id: 'kpi_c3_02',
            metricType: 'KPI (SLA)',
            name: '7-Day Account Manager Assignment SLA',
            formula: '(OPs with AM assigned ≤7d of EXPA publication / Total OPs) × 100',
            dataSource: 'opportunities (APIP 4.3.2)',
            currentValue: '100%',
            target: '100%',
            unit: '%',
            achievedPercentage: 100,
            ragStatus: 'GREEN',
            benchmarkDescription: 'Mandatory APIP Clause 4.3.2 compliance',
            responsibleRole: 'LCVP BD',
          },
          {
            id: 'kpi_c3_03',
            metricType: 'KPI (Portfolio)',
            name: 'SDG & Global Project Alignment (iGV)',
            formula: '(Slots on official Global Projects / Total iGV Slots) × 100',
            dataSource: 'opportunities',
            currentValue: '100%',
            target: '100%',
            unit: '%',
            achievedPercentage: 100,
            ragStatus: 'GREEN',
            benchmarkDescription: '100% alignment to official AIESEC Global Volunteer projects',
            responsibleRole: 'Internal Engine MM',
          },
          {
            id: 'kpi_c3_04',
            metricType: 'KPI (Demand)',
            name: 'Applications per Slot Ratio',
            formula: 'Total Applications / Total Openings',
            dataSource: 'opportunities',
            currentValue: '4.3 : 1',
            target: '4.0 : 1',
            unit: 'Ratio',
            achievedPercentage: 107.5,
            ragStatus: 'GREEN',
            benchmarkDescription: '≥4.0 APP per slot ensures competitive talent matching',
            responsibleRole: 'IR Team',
          },
        ],
        exceptions: [
          {
            id: 'exc_c3_01',
            title: 'OP Rejection Watch: Ecole Al Jabr',
            severity: 'WARNING',
            details: 'Partner rejected 2 qualified applicants; APIP clause 3.2.8 threshold is 3 before suspension',
            entityType: 'Opportunity',
            entityId: 'opp_jabr_01',
            owner: 'Salma Sahl',
          },
        ],
      },

      // -------------------------------------------------------------------
      // CARD 4: IR Supply & Country Partnerships
      // -------------------------------------------------------------------
      {
        id: 'card-4',
        cardIndex: 4,
        title: 'IR Supply & Country Partnerships',
        subtitle: 'Entity-to-Entity (E2E) Funnels & Partner LC Governance',
        healthBadge: 'GREEN',
        healthReason: '74% of approvals sourced through Tier 1/2 IR partner contracts',
        primaryMos: {
          label: 'IR Partner Supply Share',
          actual: '74.2%',
          target: '70.0%',
          pctAchieved: 106.0,
          unit: '%',
        },
        headlineKpis: [
          { id: 'c4_k1', label: 'IR Quota Met', value: '82.5%', wowDelta: '+5.0%', trend: 'UP', isGood: true },
          { id: 'c4_k2', label: 'Counterpart SLA', value: '9.4 Hours', wowDelta: '-1.2h', trend: 'DOWN', isGood: true },
          { id: 'c4_k3', label: 'SE Stds Fulfillment', value: '96.2%', wowDelta: '+0.5%', trend: 'UP', isGood: true },
        ],
        microVisualType: 'countries_bar',
        microVisualData: {
          countries: [
            { country: 'Tunisia', count: 12, pct: 38.7, regime: '90d Visa-Free' },
            { country: 'Egypt', count: 8, pct: 25.8, regime: 'AEVM e-Visa' },
            { country: 'Turkey', count: 5, pct: 16.1, regime: '90d Visa-Free' },
            { country: 'Spain', count: 4, pct: 12.9, regime: '90d Visa-Free' },
            { country: 'Germany', count: 2, pct: 6.5, regime: '90d Visa-Free' },
          ],
        },
        kpiScorecard: [
          {
            id: 'kpi_c4_01',
            metricType: 'MoS',
            name: 'IR Partner Supply Share',
            formula: '(Approvals from Tier 1 & 2 IR Partners / Total APD) × 100',
            dataSource: 'ir_partnerships + ep_applications',
            currentValue: '74.2%',
            target: '70.0%',
            unit: '%',
            achievedPercentage: 106.0,
            ragStatus: 'GREEN',
            benchmarkDescription: '≥70% sourced via structured partnerships vs random organic applicants',
            responsibleRole: 'LCVP ICX / IR Team Leader',
          },
          {
            id: 'kpi_c4_02',
            metricType: 'MoS',
            name: 'Joint IR Quota Attainment',
            formula: '(Actual Partner APD / Committed Quota APD) × 100',
            dataSource: 'ir_partnerships',
            currentValue: '82.5%',
            target: '85.0%',
            unit: '%',
            achievedPercentage: 97.1,
            ragStatus: 'GREEN',
            benchmarkDescription: '≥85% of signed quota delivered by partner LCs',
            responsibleRole: 'IR Account Managers',
          },
          {
            id: 'kpi_c4_03',
            metricType: 'KPI (Velocity)',
            name: 'Home LC Approval Push Speed',
            formula: 'Avg(home_approved_at - host_accepted_at) in hours',
            dataSource: 'ep_applications',
            currentValue: '31.2 Hours',
            target: '48.0 Hours',
            unit: 'Hours',
            achievedPercentage: 153.8,
            ragStatus: 'GREEN',
            benchmarkDescription: '≤48 hours for Home LC to collect fee and confirm status on EXPA',
            responsibleRole: 'IR Team Leader',
          },
          {
            id: 'kpi_c4_04',
            metricType: 'KPI (Quality)',
            name: 'Sending Standards (#1, #2, #3, #18) Compliance',
            formula: 'Average % fulfillment of Home LC responsibilities',
            dataSource: 'exchange_standards',
            currentValue: '96.2%',
            target: '100%',
            unit: '%',
            achievedPercentage: 96.2,
            ragStatus: 'GREEN',
            benchmarkDescription: '100% mandatory Home LC compliance on insurance, OPS, PSG',
            responsibleRole: 'Home LC OGV/OGT VPs',
          },
        ],
        exceptions: [
          {
            id: 'exc_c4_01',
            title: 'SLA Delay: AIESEC in Ain Shams (Egypt)',
            severity: 'INFO',
            details: '2 accepted EPs pending Home LC payment confirmation for >36 hours',
            entityType: 'IR Partnership',
            entityId: 'ir_partner_egypt_01',
            owner: 'Rayen Jbali',
          },
        ],
      },

      // -------------------------------------------------------------------
      // CARD 5: Pre-Arrival, Visa Regimes & Rabat 14-Day Lock
      // -------------------------------------------------------------------
      {
        id: 'card-5',
        cardIndex: 5,
        title: 'Pre-Arrival & 14-Day Lock',
        subtitle: 'Visa Clearances, Flight Verification & Statutory Gates',
        healthBadge: 'AMBER',
        healthReason: '1 EP arriving in 9 days missing uploaded flight confirmation ticket',
        primaryMos: {
          label: '14-Day Lock Compliance',
          actual: '91.7%',
          target: '100%',
          pctAchieved: 91.7,
          unit: '%',
        },
        headlineKpis: [
          { id: 'c5_k1', label: 'Host Pack ≤14d', value: '100%', wowDelta: '0%', trend: 'STABLE', isGood: true },
          { id: 'c5_k2', label: 'EP Visa Apply ≤14d', value: '94.1%', wowDelta: '+2.0%', trend: 'UP', isGood: true },
          { id: 'c5_k3', label: 'Breach <14d to Arr', value: '1 EP', wowDelta: '+1', trend: 'UP', isGood: false },
        ],
        microVisualType: 'readiness_strip',
        microVisualData: {
          readyCount: 22,
          inProgressCount: 7,
          breachCount: 1,
        },
        kpiScorecard: [
          {
            id: 'kpi_c5_01',
            metricType: 'MoS',
            name: 'Rabat 14-Day Lock Compliance',
            formula: '(EPs arriving in ≤14d with 100% Lock Checklist / Total Arriving EPs) × 100',
            dataSource: 'visa_arrival_readiness',
            currentValue: '91.7%',
            target: '100%',
            unit: '%',
            achievedPercentage: 91.7,
            ragStatus: 'AMBER',
            benchmarkDescription: 'Hard invariant: 100% of arrivals <14d must have verified Visa + Flight + Bed + Pickup',
            responsibleRole: 'Internal Engine MM',
          },
          {
            id: 'kpi_c5_02',
            metricType: 'KPI (SLA)',
            name: 'Host 14-Day Expectation Pack SLA',
            formula: '(Packs sent ≤14d after APD / Total APD) × 100',
            dataSource: 'visa_arrival_readiness (AEPP 4.4.3.1)',
            currentValue: '100%',
            target: '100%',
            unit: '%',
            achievedPercentage: 100,
            ragStatus: 'GREEN',
            benchmarkDescription: 'Avoids Host entity fault liability under AEPP regulations',
            responsibleRole: 'Logistics Team Leader',
          },
          {
            id: 'kpi_c5_03',
            metricType: 'KPI (SLA)',
            name: 'EP 14-Day Visa Application SLA',
            formula: '(EPs applying ≤14d of receiving documents / Total Visa-Req APD) × 100',
            dataSource: 'visa_arrival_readiness (AEPP 4.4.2.1)',
            currentValue: '94.1%',
            target: '100%',
            unit: '%',
            achievedPercentage: 94.1,
            ragStatus: 'GREEN',
            benchmarkDescription: 'Protects Rabat against financial refund liability if visa delayed',
            responsibleRole: 'Home LC / EP Account Manager',
          },
          {
            id: 'kpi_c5_04',
            metricType: 'KPI (Logistics)',
            name: '3-Day Pre-Arrival Pickup Instructions',
            formula: '(EPs receiving written pickup guide ≥3d before flight / Total Arrivals) × 100',
            dataSource: 'visa_arrival_readiness (Standard #6)',
            currentValue: '100%',
            target: '100%',
            unit: '%',
            achievedPercentage: 100,
            ragStatus: 'GREEN',
            benchmarkDescription: 'Mandatory Exchange Standard #6 statutory requirement',
            responsibleRole: 'Pickup Dispatcher',
          },
        ],
        exceptions: [
          {
            id: 'exc_c5_01',
            title: 'Critical 14-Day Lock Breach: Lukas Schneider',
            severity: 'CRITICAL',
            details: 'Arrival scheduled in 9 days (2026-11-06); flight ticket not yet uploaded in dossier',
            entityType: 'EP Dossier',
            entityId: 'ep_077',
            owner: 'Abdenasser Moussafi',
            daysOverdue: 5,
          },
        ],
      },

      // -------------------------------------------------------------------
      // CARD 6: Customer Experience (CXP), 18 Exchange Standards & Cases
      // -------------------------------------------------------------------
      {
        id: 'card-6',
        cardIndex: 6,
        title: 'CXP & 18 Standards Delivery',
        subtitle: '13 Mandatory + 5 Non-Mandatory Standards & Dispute Vault',
        healthBadge: 'GREEN',
        healthReason: '91.3% Complete conversion; 0 unreachable EPs >48h; NPS at +62',
        primaryMos: {
          label: 'Complete (CO) Rate',
          actual: '91.3%',
          target: '90.0%',
          pctAchieved: 101.4,
          unit: '%',
        },
        headlineKpis: [
          { id: 'c6_k1', label: '13 Mandatory Stds', value: '96.4%', wowDelta: '+0.8%', trend: 'UP', isGood: true },
          { id: 'c6_k2', label: 'EP Net Promoter', value: '+62 NPS', wowDelta: '+4', trend: 'UP', isGood: true },
          { id: 'c6_k3', label: '>48h Unreachable', value: '0 EPs', wowDelta: '0', trend: 'STABLE', isGood: true },
        ],
        microVisualType: 'standards_strip',
        microVisualData: {
          mandatoryPassed: 13,
          mandatoryTotal: 13,
          nonMandatoryPassed: 4,
          nonMandatoryTotal: 5,
        },
        kpiScorecard: [
          {
            id: 'kpi_c6_01',
            metricType: 'MoS',
            name: 'Qualified Completion (CO) Rate',
            formula: '(EPs meeting 13/13 Mandatory + ≥3/5 Non-Mandatory / Total FIN) × 100',
            dataSource: 'exchange_standards',
            currentValue: '91.3%',
            target: '90.0%',
            unit: '%',
            achievedPercentage: 101.4,
            ragStatus: 'GREEN',
            benchmarkDescription: '≥90% of Finished EPs qualify for formal EXPA completion',
            responsibleRole: 'LCVP CXP / ICX',
          },
          {
            id: 'kpi_c6_02',
            metricType: 'MoS',
            name: 'EP Net Promoter Score (NPS)',
            formula: '% Promoters (9-10) - % Detractors (0-6)',
            dataSource: 'exchange_standards (EXPA Survey)',
            currentValue: '+62',
            target: '+50',
            unit: 'NPS',
            achievedPercentage: 124.0,
            ragStatus: 'GREEN',
            benchmarkDescription: '≥+50 benchmark for youth satisfaction in Morocco',
            responsibleRole: 'CXP Team',
          },
          {
            id: 'kpi_c6_03',
            metricType: 'KPI (Mandatory)',
            name: '13 Mandatory Standards Fulfillment',
            formula: '(EPs receiving 100% of #1,#2,#3,#6,#8,#9,#10,#11,#12,#13,#14,#15,#18 / Total RE) × 100',
            dataSource: 'exchange_standards',
            currentValue: '96.4%',
            target: '100%',
            unit: '%',
            achievedPercentage: 96.4,
            ragStatus: 'GREEN',
            benchmarkDescription: 'Zero tolerance: 1 missed mandatory standard blocks completion',
            responsibleRole: 'Operations Team',
          },
          {
            id: 'kpi_c6_04',
            metricType: 'KPI (Safety)',
            name: 'Unreachable EP Alert (>48 Hours)',
            formula: 'Count(Active RE EPs with no contact >48h)',
            dataSource: 'ep_applications (AEPP 4.5.2.9)',
            currentValue: 0,
            target: 0,
            unit: 'EPs',
            achievedPercentage: 100,
            ragStatus: 'GREEN',
            benchmarkDescription: 'Must be 0 at all times; triggers emergency alert protocol',
            responsibleRole: 'LC President & LCVP ICX',
          },
        ],
        exceptions: [],
      },

      // -------------------------------------------------------------------
      // CARD 7: Accommodation & Arrival Pickup (#6 / #7)
      // -------------------------------------------------------------------
      {
        id: 'card-7',
        cardIndex: 7,
        title: 'Accommodation & Pickup Logistics',
        subtitle: 'Standard #7 Physical Vetting, Bed Capacity & Port Pickups',
        healthBadge: 'GREEN',
        healthReason: '100% vetted beds; 88.5% occupancy rate; average cost 1,150 MAD per bed',
        primaryMos: {
          label: 'Vetted Bed Coverage',
          actual: '112.5%',
          target: '100%',
          pctAchieved: 112.5,
          unit: '%',
        },
        headlineKpis: [
          { id: 'c7_k1', label: 'Std #7 Audit Pass', value: '100%', wowDelta: '0%', trend: 'STABLE', isGood: true },
          { id: 'c7_k2', label: 'Bed Occupancy Rate', value: '88.5%', wowDelta: '+4.2%', trend: 'UP', isGood: true },
          { id: 'c7_k3', label: 'Avg Cost / Bed', value: '1,150 MAD', wowDelta: '-50 MAD', trend: 'DOWN', isGood: true },
        ],
        microVisualType: 'occupancy_bullet',
        microVisualData: {
          actualOccupancy: 88.5,
          targetOccupancy: 85.0,
          totalBeds: 36,
          occupiedBeds: 32,
        },
        kpiScorecard: [
          {
            id: 'kpi_c7_01',
            metricType: 'MoS',
            name: 'Vetted Bed Coverage Ratio',
            formula: '(Available Vetted Beds / Approved EPs in Next 30d) × 100',
            dataSource: 'accommodations / bed_allocations',
            currentValue: '112.5%',
            target: '100%',
            unit: '%',
            achievedPercentage: 112.5,
            ragStatus: 'GREEN',
            benchmarkDescription: '≥100% ensures sufficient buffer for early arrivals & extensions',
            responsibleRole: 'Logistics Manager',
          },
          {
            id: 'kpi_c7_02',
            metricType: 'KPI (Quality)',
            name: 'Standard #7 4-Point Audit Pass Rate',
            formula: '(Beds with single bed + water + bath + power verified / Total Beds) × 100',
            dataSource: 'accommodations',
            currentValue: '100%',
            target: '100%',
            unit: '%',
            achievedPercentage: 100,
            ragStatus: 'GREEN',
            benchmarkDescription: 'Mandatory physical checklist before assigning EP to room',
            responsibleRole: 'Internal Engine MM',
          },
          {
            id: 'kpi_c7_03',
            metricType: 'KPI (Finance)',
            name: 'Average Monthly Cost per Bed',
            formula: 'Total Rent + Utilities / Active Bed Months',
            dataSource: 'finance_ledger + accommodations',
            currentValue: '1,150 MAD',
            target: '1,200 MAD',
            unit: 'MAD',
            achievedPercentage: 104.3,
            ragStatus: 'GREEN',
            benchmarkDescription: 'Budgeted cap: ≤1,200 MAD per bed monthly in Agdal/Hassan',
            responsibleRole: 'LCVP Finance & Logistics',
          },
          {
            id: 'kpi_c7_04',
            metricType: 'KPI (Logistics)',
            name: 'On-Time Arrival Pickup Execution Rate',
            formula: '(EPs met on time at CMN/RBA/Train / Total Arrivals) × 100',
            dataSource: 'pickup_dispatches',
            currentValue: '100%',
            target: '100%',
            unit: '%',
            achievedPercentage: 100,
            ragStatus: 'GREEN',
            benchmarkDescription: 'Mandatory Standard #6 fulfillment',
            responsibleRole: 'Pickup Dispatchers',
          },
        ],
        exceptions: [],
      },

      // -------------------------------------------------------------------
      // CARD 8: AFPM Finance, Invoicing & Sustainability
      // -------------------------------------------------------------------
      {
        id: 'card-8',
        cardIndex: 8,
        title: 'AFPM Finance & Sustainability',
        subtitle: 'Exchange Sustainability Ratio (>1.0), Aging & Dual Approvals',
        healthBadge: 'GREEN',
        healthReason: 'Direct sustainability ratio at 1.32x (AFPM >1.00 compliant); reserves at 6.8 months',
        primaryMos: {
          label: 'Direct Sustainability Ratio',
          actual: '1.32x',
          target: '1.15x',
          pctAchieved: 114.8,
          unit: 'Ratio',
        },
        headlineKpis: [
          { id: 'c8_k1', label: 'Net ICX Surplus', value: '+34,200 MAD', wowDelta: '+6,500 MAD', trend: 'UP', isGood: true },
          { id: 'c8_k2', label: 'iGV CSR Funding %', value: '78.4%', wowDelta: '+3.2%', trend: 'UP', isGood: true },
          { id: 'c8_k3', label: 'Overdue >14d Invoices', value: '4,500 MAD', wowDelta: '0 MAD', trend: 'STABLE', isGood: false },
        ],
        microVisualType: 'sustainability_bullet',
        microVisualData: {
          actualRatio: 1.32,
          breakEvenRatio: 1.00,
          targetRatio: 1.15,
        },
        kpiScorecard: [
          {
            id: 'kpi_c8_01',
            metricType: 'MoS',
            name: 'Direct Exchange Sustainability Ratio',
            formula: 'Total Direct Revenue / Total Direct Exchange Costs',
            dataSource: 'finance_ledger (AFPM)',
            currentValue: '1.32x',
            target: '1.15x',
            unit: 'Ratio',
            achievedPercentage: 114.8,
            ragStatus: 'GREEN',
            benchmarkDescription: 'Must exceed 1.00 per AFPM Aug 2022 policy; Rabat target ≥1.15x',
            responsibleRole: 'LCVP Finance & Legal',
          },
          {
            id: 'kpi_c8_02',
            metricType: 'MoS',
            name: 'Net Direct Exchange Surplus',
            formula: 'Total Direct Revenue - Total Direct Costs in MAD',
            dataSource: 'finance_ledger',
            currentValue: '34,200 MAD',
            target: '25,000 MAD',
            unit: 'MAD',
            achievedPercentage: 136.8,
            ragStatus: 'GREEN',
            benchmarkDescription: 'Positive operational cash surplus to fund leadership development',
            responsibleRole: 'LCVP Finance & LCP',
          },
          {
            id: 'kpi_c8_03',
            metricType: 'KPI (Finance)',
            name: 'iGV Partner / CSR Cost Coverage',
            formula: '(B2B Fees + CSR Grants / iGV Direct Project Costs) × 100',
            dataSource: 'finance_ledger (AFPM)',
            currentValue: '78.4%',
            target: '70.0%',
            unit: '%',
            achievedPercentage: 112.0,
            ragStatus: 'GREEN',
            benchmarkDescription: 'AFPM rule: 70% to 100% of iGV direct costs must be funded by partner grants',
            responsibleRole: 'LCVP BD / LCVP Finance',
          },
          {
            id: 'kpi_c8_04',
            metricType: 'KPI (Finance)',
            name: 'Months of Operational Reserves',
            formula: 'Total Liquid Reserves / Average Monthly Fixed LC Cost',
            dataSource: 'finance_ledger (AFPM)',
            currentValue: '6.8 Months',
            target: '6.0 Months',
            unit: 'Months',
            achievedPercentage: 113.3,
            ragStatus: 'GREEN',
            benchmarkDescription: '≥6.0 Months required by global AFPM liquidity mandate',
            responsibleRole: 'LC President & VP FnL',
          },
        ],
        exceptions: [
          {
            id: 'exc_c8_01',
            title: 'Overdue Partner Invoice: Al Manar Language School',
            severity: 'WARNING',
            details: 'Invoice #INV-2026-018 (4,500 MAD) overdue by 16 days (>14d APIP penalty clause)',
            entityType: 'Invoice',
            entityId: 'inv_018',
            owner: 'Firdawsse Jray',
            daysOverdue: 16,
          },
        ],
      },

      // -------------------------------------------------------------------
      // CARD 9: Member Engagement, Team Standards (TeSt) & People Analytics
      // -------------------------------------------------------------------
      {
        id: 'card-9',
        cardIndex: 9,
        title: 'Member Engagement & Team Standards',
        subtitle: '4 Engagement Tiers, 6 Governance Routines, O2Os & TeSt',
        healthBadge: engagedPct >= 80 ? 'GREEN' : engagedPct >= 65 ? 'AMBER' : 'RED',
        healthReason: `${engagedPct}% of members active in Tier 1 & 2; 1 member in Tier 4 drop-off alert`,
        primaryMos: {
          label: 'Active Engaged Members (T1+T2)',
          actual: `${engagedPct}%`,
          target: '80.0%',
          pctAchieved: Math.round((engagedPct / 80) * 100),
          unit: '%',
        },
        headlineKpis: [
          { id: 'c9_k1', label: 'Tier 1 Core Group', value: `${Math.round((tier1Count / totalMembers) * 100)}%`, wowDelta: '+4%', trend: 'UP', isGood: true },
          { id: 'c9_k2', label: 'Monthly O2O Completion', value: '90.0%', wowDelta: '+10%', trend: 'UP', isGood: true },
          { id: 'c9_k3', label: 'TeSt Implementation', value: '89.3%', wowDelta: '+2.5%', trend: 'UP', isGood: true },
        ],
        microVisualType: 'engagement_tiers',
        microVisualData: {
          tier1Count,
          tier2Count,
          tier3Count,
          tier4Count,
          total: totalMembers,
        },
        kpiScorecard: [
          {
            id: 'kpi_c9_01',
            metricType: 'MoS',
            name: 'Active Engaged Membership Rate (Tier 1 + Tier 2)',
            formula: '(Members with MES ≥70% / Total Roster Members) × 100',
            dataSource: 'member_engagement_logs',
            currentValue: `${engagedPct}%`,
            target: '80.0%',
            unit: '%',
            achievedPercentage: Math.round((engagedPct / 80) * 100),
            ragStatus: engagedPct >= 80 ? 'GREEN' : 'AMBER',
            benchmarkDescription: '≥80% of department in Tier 1 (90-100%) or Tier 2 (70-89%)',
            responsibleRole: 'LCVP TM & LCVP ICX',
          },
          {
            id: 'kpi_c9_02',
            metricType: 'MoS',
            name: 'Individual Goal Achievement (% MoS Met)',
            formula: '(Members achieving ≥80% personal KPI / Total Members) × 100',
            dataSource: 'member_goals',
            currentValue: '78.5%',
            target: '75.0%',
            unit: '%',
            achievedPercentage: 104.7,
            ragStatus: 'GREEN',
            benchmarkDescription: '≥75% of team members hitting their monthly operational targets',
            responsibleRole: 'Team Leaders',
          },
          {
            id: 'kpi_c9_03',
            metricType: 'KPI (Tiers)',
            name: 'Tier 1 Core Group Share (90–100% Attendance)',
            formula: '(Members with 90-100% session duration / Total Members) × 100',
            dataSource: 'meeting_attendance',
            currentValue: `${Math.round((tier1Count / totalMembers) * 100)}%`,
            target: '50.0%',
            unit: '%',
            achievedPercentage: Math.round(((tier1Count / totalMembers) / 0.5) * 100),
            ragStatus: 'GREEN',
            benchmarkDescription: '≥50% in Core Group driving on-time execution',
            responsibleRole: 'Team Leaders',
          },
          {
            id: 'kpi_c9_04',
            metricType: 'KPI (Tiers)',
            name: 'Tier 4 Critical Drop-Off Risk (<20%)',
            formula: 'Count(Members with <20% attendance duration or ≥2 missed meetings)',
            dataSource: 'meeting_attendance',
            currentValue: tier4Count,
            target: 0,
            unit: 'Members',
            achievedPercentage: tier4Count === 0 ? 100 : 0,
            ragStatus: tier4Count === 0 ? 'GREEN' : 'RED',
            benchmarkDescription: '0 Members in Drop-off Tier; requires urgent retention interview',
            responsibleRole: 'LCVP TM & Team Leaders',
          },
          {
            id: 'kpi_c9_05',
            metricType: 'KPI (Routines)',
            name: '6 Mandatory Rabat Governance Routines Execution',
            formula: '(Executed Team + Core + Dept + LCM meetings / Planned) × 100',
            dataSource: 'governance_meetings',
            currentValue: '100%',
            target: '100%',
            unit: '%',
            achievedPercentage: 100,
            ragStatus: 'GREEN',
            benchmarkDescription: '100% consistency on Weekly Team, Core, Dept, and LCMs',
            responsibleRole: 'Executive Body Rabat',
          },
          {
            id: 'kpi_c9_06',
            metricType: 'KPI (O2Os)',
            name: 'Monthly TL → Member O2O Completion',
            formula: '(Members with logged O2O in current month / Total Members) × 100',
            dataSource: 'o2o_records',
            currentValue: '90.0%',
            target: '100%',
            unit: '%',
            achievedPercentage: 90.0,
            ragStatus: 'AMBER',
            benchmarkDescription: '100% monthly coaching coverage (1 O2O per member per month)',
            responsibleRole: 'Team Leaders',
          },
          {
            id: 'kpi_c9_07',
            metricType: 'KPI (TeSt)',
            name: 'AIESEC Team Standards (TeSt) Implementation',
            formula: 'Average % completion across Building, Performing, and Closing',
            dataSource: 'team_standards_audit',
            currentValue: '89.3%',
            target: '90.0%',
            unit: '%',
            achievedPercentage: 99.2,
            ragStatus: 'GREEN',
            benchmarkDescription: '≥90% global AIESEC Team Standards standard',
            responsibleRole: 'All Team Leaders',
          },
        ],
        exceptions: [
          {
            id: 'exc_c9_01',
            title: 'Critical Retention Alert: Ghita Tazi (Tier 4)',
            severity: 'CRITICAL',
            details: 'Attendance dropped to 15% across last 4 weeks; no logged O2O this month; 4 overdue tasks',
            entityType: 'Member Record',
            entityId: 'usr_rabat_10',
            owner: 'Rayen Jbali (TL)',
            daysOverdue: 12,
          },
          {
            id: 'exc_c9_02',
            title: 'Punctuality Warning: Hamza Chraibi (Tier 3)',
            severity: 'WARNING',
            details: 'Late arrival average is 18 minutes (>15m correlation threshold for disengagement)',
            entityType: 'Member Record',
            entityId: 'usr_rabat_09',
            owner: 'Firdawsse Jray (TL)',
          },
        ],
      },
    ];
  }

  /**
   * Calculates the Composite Member Engagement Score (MES 0..100)
   * Formula from Section 3, Card 9:
   * MES = (0.35 * Attendance) + (0.30 * Personal KPI) + (0.20 * Task On-Time) + (0.15 * O2O & Spaces)
   */
  public static calculateMes(params: {
    attendancePct: number;
    personalKpiPct: number;
    taskOnTimePct: number;
    o2oCompleted: boolean;
  }): number {
    const o2oScore = params.o2oCompleted ? 100 : 0;
    const score =
      0.35 * params.attendancePct +
      0.30 * params.personalKpiPct +
      0.20 * params.taskOnTimePct +
      0.15 * o2oScore;
    return Math.round(score);
  }

  /**
   * Resolves Member Engagement Tier based on attendance and delay
   */
  public static resolveTier(mesScore: number, avgDelayMinutes: number): MemberEngagementTier {
    if (mesScore >= 90 && avgDelayMinutes <= 5) return 'TIER_1_CORE';
    if (mesScore >= 70) return 'TIER_2_STRONG';
    if (mesScore >= 20) return 'TIER_3_MODERATE';
    return 'TIER_4_DROPOFF';
  }
}

const DOMAIN_ID_MAP: Record<string, DomainId> = {
  'card-1': 'funnel',
  'card-2': 'b2b',
  'card-3': 'opps',
  'card-4': 'ir',
  'card-5': 'visa',
  'card-6': 'cxp',
  'card-7': 'housing',
  'card-8': 'finance',
  'card-9': 'members',
};

export function generateDashboardData(filters: GlobalDashboardFilters) {
  const rawEngine = (filters.engine || 'ALL').toUpperCase();
  const engineFilter =
    rawEngine === 'EXTERNAL' ? 'EXTERNAL' : rawEngine === 'INTERNAL' ? 'INTERNAL' : 'ALL';

  const rawRole = (filters.role || 'ALL').toUpperCase();
  const roleFilter = rawRole === 'ALL' ? 'ALL' : (filters.role as RoleFilter);

  const filterState: DashboardFilterState = {
    term: (filters.term as any) || '26.2',
    product: ((filters.product || 'ALL').toUpperCase() === 'ALL' ? 'ALL' : filters.product) as any,
    engine: engineFilter,
    role: roleFilter,
    selectedMemberId: filters.memberId,
  };


  const rawSummaries = DashboardDataEngine.getDomainSummaries(filterState);

  // Filter roster by engine
  const filteredMembers = INITIAL_RABAT_MEMBERS.filter((m) => {
    if (filterState.engine !== 'ALL' && m.engine !== filterState.engine) return false;
    if (filterState.role !== 'ALL' && m.role !== filterState.role) return false;
    return true;
  }).map((m) => {
    const tierNum = m.tier === 'TIER_1_CORE' ? 1 : m.tier === 'TIER_2_STRONG' ? 2 : m.tier === 'TIER_3_MODERATE' ? 3 : 4;
    return {
      ...m,
      name: m.fullName,
      tier: tierNum,
      engagementScore: m.compositeMesScore,
      arrivalDelayMinutes: m.avgDelayMinutes,
    };
  });

  const cards: DomainCardSummary[] = rawSummaries.map((raw) => {
    const domainId = DOMAIN_ID_MAP[raw.id] || (raw.id as DomainId);
    const numStr = `[${raw.cardIndex}]`;
    const healthStatus: 'green' | 'amber' | 'rose' =
      raw.healthBadge === 'GREEN' ? 'green' : raw.healthBadge === 'AMBER' ? 'amber' : 'rose';
    const healthLabel =
      raw.healthBadge === 'GREEN' ? 'On Track' : raw.healthBadge === 'AMBER' ? 'At Risk' : 'SLA Breach';

    const scorecard = (raw.kpiScorecard || []).map((kpi, idx) => ({
      id: kpi.id || `sc_${idx}`,
      code: `KPI-${raw.cardIndex}.${idx + 1}`,
      name: kpi.name,
      formula: kpi.formula,
      current: kpi.currentValue,
      target: kpi.target,
      achievedPct: Math.round(kpi.achievedPercentage),
      rag: (kpi.ragStatus === 'GREEN' ? 'green' : kpi.ragStatus === 'AMBER' ? 'amber' : 'rose') as 'green' | 'amber' | 'rose',
      responsibleRole: kpi.responsibleRole,
      unit: kpi.unit,
    }));

    // Ensure FIN-01 code is present on finance card
    if (domainId === 'finance' && scorecard.length > 0) {
      scorecard[0].code = 'FIN-01';
    }

    const headlineKpis = (raw.headlineKpis || []).map((hk) => ({
      id: hk.id,
      label: hk.label,
      value: hk.value,
      target: hk.target,
      wowDelta: hk.wowDelta,
      trend: hk.trend,
      isGood: hk.isGood,
      delta: {
        value: hk.wowDelta || '0%',
        direction: (hk.trend === 'UP' ? 'up' : hk.trend === 'DOWN' ? 'down' : 'neutral') as 'up' | 'down' | 'neutral',
      },
    }));

    const exceptions = (raw.exceptions || []).map((ex) => ({
      id: ex.id,
      title: ex.title,
      severity: ex.severity.toLowerCase(),
      description: ex.details,
      details: ex.details,
      entityType: ex.entityType,
      entityId: ex.entityId,
      referenceCode: ex.entityId,
      owner: ex.owner,
      agingDays: ex.daysOverdue,
      daysOverdue: ex.daysOverdue,
    }));

    return {
      id: domainId,
      cardIndex: raw.cardIndex,
      number: numStr,
      title: raw.title,
      subtitle: raw.subtitle,
      healthBadge: raw.healthBadge,
      healthStatus,
      healthLabel,
      healthReason: raw.healthReason,
      primaryMos: {
        label: raw.primaryMos.label,
        value: raw.primaryMos.actual,
        actual: raw.primaryMos.actual,
        target: raw.primaryMos.target,
        attainmentPct: Math.round(raw.primaryMos.pctAchieved ?? 0),
        pctAchieved: raw.primaryMos.pctAchieved ?? 0,
        unit: raw.primaryMos.unit,
      },
      headlineKpis,
      microVisualType: raw.microVisualType,
      microVisualData: raw.microVisualData,
      microVisual: { type: raw.microVisualType, ...raw.microVisualData },
      kpiScorecard: raw.kpiScorecard,
      scorecard,
      exceptions,
    };
  });

  return {
    cards,
    members: filteredMembers,
    rawSummaries,
  };
}

