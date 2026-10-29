/**
 * Non-Fictional Master KPI Dictionary
 * Statutory Baseline: AIESEC Hub Operating Model (Exchange, IM, ICB, Finance)
 * Compliance Rule 1 & 2: No invented formulas, 100% reconcilable to source tables.
 */

export interface MasterKPIDefinition {
  kpiId: string;
  name: string;
  category:
    | 'SALES'
    | 'OPPORTUNITY_SUPPLY'
    | 'IR_SUPPLY'
    | 'EP_FUNNEL'
    | 'EXPERIENCE_QUALITY'
    | 'LOGISTICS_SAFETY'
    | 'FINANCE'
    | 'TEAM_EXECUTION';
  officialFormula: string;
  sourceTables: string[];
  grain: string;
  exclusions: string;
  freshnessSla: string;
  responsibleRole: string;
  confidenceStatus: 'VERIFIED_OFFICIAL' | 'CONFIRMED_LOCAL';
  targetBenchmark: string;
  drillDownUrl: string;
  description: string;
}

export const MASTER_KPI_DICTIONARY: MasterKPIDefinition[] = [
  // 1. Sales & B2B Partner CRM
  {
    kpiId: 'KPI-SALES-01',
    name: 'B2B Sales Win Rate',
    category: 'SALES',
    officialFormula: 'Count(Deals in SIGNED_AGREEMENT or OPP_SETUP) / Count(Deals in Closed Won + Closed Lost) * 100',
    sourceTables: ['db.b2bDeals', 'db.organizations'],
    grain: 'Per B2B Deal',
    exclusions: 'Disqualified leads and exploratory prospects are excluded from denominator',
    freshnessSla: 'Realtime query on state change',
    responsibleRole: 'VP Business Development (BD)',
    confidenceStatus: 'CONFIRMED_LOCAL',
    targetBenchmark: '>= 40% Win Rate',
    drillDownUrl: '/sales',
    description: 'Measures sales conversion efficiency across Moroccan corporate, NGO, and educational partners.',
  },
  {
    kpiId: 'KPI-SALES-02',
    name: 'Partner Standards Fulfillment Rate',
    category: 'SALES',
    officialFormula: 'Sum(Delivered Partner Standard Checkpoints) / Sum(Total Applicable Partner Standards) * 100',
    sourceTables: ['db.partnerStandards', 'db.contracts'],
    grain: 'Per Signed Partner Contract',
    exclusions: 'Standards marked NOT_APPLICABLE by verified audit review',
    freshnessSla: '< 1 hour',
    responsibleRole: 'VP Business Development (BD)',
    confidenceStatus: 'VERIFIED_OFFICIAL',
    targetBenchmark: '100% of mandatory checkpoints before realization',
    drillDownUrl: '/sales#standards',
    description: 'Audits physical and legal readiness of host partner organizations before publishing opportunities.',
  },

  // 2. Opportunity Supply & Capacity
  {
    kpiId: 'KPI-OPP-01',
    name: 'Slot Capacity Utilization Rate',
    category: 'OPPORTUNITY_SUPPLY',
    officialFormula: 'Count(Slots with Status = APPROVED or REALIZED) / Count(Total Approved Available Slots) * 100',
    sourceTables: ['db.opportunities', 'db.slotWaves'],
    grain: 'Per Opportunity Slot Position',
    exclusions: 'Draft or archived opportunity slots',
    freshnessSla: 'Realtime query',
    responsibleRole: 'VP Product (iGV / iGTa / iGTe)',
    confidenceStatus: 'VERIFIED_OFFICIAL',
    targetBenchmark: '>= 85% Fill Rate per peak wave',
    drillDownUrl: '/opportunities',
    description: 'Tracks how effectively committed organizational slot capacity is matched with approved participants.',
  },

  // 3. IR Supply Pipeline
  {
    kpiId: 'KPI-IR-01',
    name: 'IR Confirmed Supply Coverage',
    category: 'IR_SUPPLY',
    officialFormula: 'Sum(IR Partner Confirmed Quotas) / Sum(LC Opportunity Target Demand) * 100',
    sourceTables: ['db.irPartners', 'db.opportunities'],
    grain: 'Per IR Partnership Agreement',
    exclusions: 'Unverified or broken IR supply commitments',
    freshnessSla: 'Weekly sync or on IR log update',
    responsibleRole: 'VP International Relations (IR)',
    confidenceStatus: 'VERIFIED_OFFICIAL',
    targetBenchmark: '>= 120% supply buffer across target peaks',
    drillDownUrl: '/opportunities/irm',
    description: 'Guarantees reliable supply pipelines from trusted overseas entities with active bilateral partnerships.',
  },

  // 4. EP Funnel & Matching
  {
    kpiId: 'KPI-EP-01',
    name: 'Applied-to-Approved Conversion Rate',
    category: 'EP_FUNNEL',
    officialFormula: 'Count(EPs in APPROVED or REALIZED) / Count(Total Unique Applicants) * 100',
    sourceTables: ['db.exchangeParticipants'],
    grain: 'Per EP Application',
    exclusions: 'Withdrawn applications within 24 hours of submission',
    freshnessSla: 'Daily EXPA read-sync',
    responsibleRole: 'VP Customer Experience (CXP)',
    confidenceStatus: 'VERIFIED_OFFICIAL',
    targetBenchmark: '>= 25% E2E Funnel Conversion',
    drillDownUrl: '/crm',
    description: 'Measures participant screening and interview efficiency from initial interest to formal approval.',
  },

  // 5. Experience Quality (Exchange Standards)
  {
    kpiId: 'KPI-CXP-01',
    name: '18 Exchange Standards Fulfillment Rate',
    category: 'EXPERIENCE_QUALITY',
    officialFormula: 'Count(Delivered Standards) / 18 Total Refreshed Standards * 100',
    sourceTables: ['db.epStandardsDossiers', 'db.customerTouchpoints'],
    grain: 'Per In-Country Exchange Participant',
    exclusions: 'Home-entity-only standards if host entity delivers 100% of host obligations',
    freshnessSla: 'Realtime checklist update',
    responsibleRole: 'VP Customer Experience (CXP)',
    confidenceStatus: 'VERIFIED_OFFICIAL',
    targetBenchmark: '>= 16 / 18 (>= 88.8%) complete delivery',
    drillDownUrl: '/accommodation#standards',
    description: 'Evaluates statutory delivery of the 18 Refreshed Standards with #10a (Mid) and #10b (Final) split.',
  },

  // 6. Logistics & Safety
  {
    kpiId: 'KPI-OPS-01',
    name: 'Arrival Readiness & Pickup Compliance (Std #6)',
    category: 'LOGISTICS_SAFETY',
    officialFormula: 'Count(Pickups with Written Guide Sent >= 3 Days Prior & Buddy Assigned) / Count(Total Upcoming Arrivals) * 100',
    sourceTables: ['db.arrivalPickups', 'db.accommodationAllocations'],
    grain: 'Per Arrival Mission',
    exclusions: 'Self-organized arrivals with recorded formal liability waiver',
    freshnessSla: 'Realtime date-math countdown',
    responsibleRole: 'Logistics & Greeter Officer',
    confidenceStatus: 'VERIFIED_OFFICIAL',
    targetBenchmark: '100% on-time pickup guides and greeting',
    drillDownUrl: '/accommodation#pickups',
    description: 'Guarantees that every arriving exchange participant is provided written directions 3 days prior and greeted at the port.',
  },

  // 7. Finance & Sustainability
  {
    kpiId: 'KPI-FIN-01',
    name: 'AFPM Liquid Reserve Solvency Ratio',
    category: 'FINANCE',
    officialFormula: 'Current Liquid Balance (MAD) / Minimum Required Statutory Reserve (50,000 MAD) * 100',
    sourceTables: ['db.afpmLedger', 'db.payoutRequests'],
    grain: 'Per Financial Quarter',
    exclusions: 'Unconfirmed expected grants or contracted receivables',
    freshnessSla: 'On bank balance reconciliation',
    responsibleRole: 'VP Finance (FNL) & Local Committee President (LCP)',
    confidenceStatus: 'VERIFIED_OFFICIAL',
    targetBenchmark: '>= 120% Solvency Ratio (AFPM Compliance)',
    drillDownUrl: '/dashboards',
    description: 'Enforces the AIESEC Financial and Procurement Manual (AFPM) reserve solvency floor for LC Rabat.',
  },
  {
    kpiId: 'KPI-FIN-02',
    name: 'Accounts Receivable Overdue (>14d) Warning',
    category: 'FINANCE',
    officialFormula: 'Sum(Invoices in ISSUED with currentDate > dueDate + 14 days) in MAD',
    sourceTables: ['db.invoices'],
    grain: 'Per Issued B2B Invoice',
    exclusions: 'Paid or formally cancelled invoices',
    freshnessSla: 'Daily automated date check',
    responsibleRole: 'VP Finance (FNL)',
    confidenceStatus: 'VERIFIED_OFFICIAL',
    targetBenchmark: '0 MAD overdue > 14 days (Zero realization freeze)',
    drillDownUrl: '/dashboards#invoices',
    description: 'Flags invoices exceeding 14 days past due for 5% statutory penalty application and opportunity freeze.',
  },
  {
    kpiId: 'KPI-FIN-03',
    name: 'iGV Trainee Cost Coverage Ratio',
    category: 'FINANCE',
    officialFormula: 'Total Confirmed Partner/CSR Inflows (MAD) / Total Direct Volunteer Delivery Costs (MAD) * 100',
    sourceTables: ['db.invoices', 'db.payoutRequests'],
    grain: 'Per Exchange Cohort',
    exclusions: 'Administrative overhead unrelated to participant delivery',
    freshnessSla: 'Monthly financial close',
    responsibleRole: 'VP Finance (FNL) & VP iGV',
    confidenceStatus: 'CONFIRMED_LOCAL',
    targetBenchmark: '>= 70% to 100% Cost Coverage',
    drillDownUrl: '/dashboards',
    description: 'Verifies that volunteer projects remain financially sustainable through legitimate corporate and CSR partnerships.',
  },

  // 8. Team Execution
  {
    kpiId: 'KPI-TM-01',
    name: 'Composite Member Engagement Score (MES)',
    category: 'TEAM_EXECUTION',
    officialFormula: '0.35 * Meeting Attendance + 0.35 * KPI Goal Attainment + 0.15 * O2O Coaching + 0.15 * Operations Hours',
    sourceTables: ['db.members', 'db.o2oLogs', 'db.teamStandards'],
    grain: 'Per Team Member',
    exclusions: 'Members on approved sabbatical or academic leave',
    freshnessSla: 'Weekly Sunday aggregation in Africa/Casablanca',
    responsibleRole: 'VP Talent Management (TM)',
    confidenceStatus: 'CONFIRMED_LOCAL',
    targetBenchmark: '>= 75% Average MES across LC',
    drillDownUrl: '/members',
    description: 'Composite leadership development score classifying members into Tier 1 Core, Tier 2 Strong, Tier 3 Moderate, and Tier 4 At Risk.',
  },
];
