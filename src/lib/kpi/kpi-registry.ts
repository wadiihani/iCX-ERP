/**
 * Comprehensive KPI Registry
 * Authoritative implementation of AIESEC_iCX_ERP_KPI_Dashboard_Specification.md
 * 11 Functional Workflows mapped to AIESEC Hub Knowledge Authorities.
 */

import { KpiRegistryEntry } from '@/lib/types/dashboard-spec';

export const COMPREHENSIVE_KPI_REGISTRY: KpiRegistryEntry[] = [
  // -------------------------------------------------------------
  // Workflow 1 — Market Research and Partner Prospecting
  // -------------------------------------------------------------
  {
    kpiKey: 'KPI-MKT-01',
    name: 'Target-Account Coverage',
    domain: 'MARKET_RESEARCH',
    confidence: 'CONFIRMED_LOCAL',
    officialSource: {
      authority: 'Partners Hub',
      url: 'https://www.hub.aiesec.org/partners-hub',
      docTitle: 'B2B Market Research & Account Planning Framework',
    },
    definition: 'Proportion of planned target organizations in the local market that have been researched and documented.',
    formulaDescription: 'Unique target organizations researched / Target organizations planned * 100',
    numeratorDescription: 'Organizations with documented research profile',
    denominatorDescription: 'Planned target account list for the term',
    unit: '%',
    dateBasis: 'STAGE_ENTRY_DATE',
    targetBenchmark: '>= 80% market account coverage',
    responsibleRole: 'VP Business Development (BD)',
    drillDownUrl: '/sales',
  },
  {
    kpiKey: 'KPI-MKT-02',
    name: 'Qualified Lead Rate',
    domain: 'MARKET_RESEARCH',
    confidence: 'CONFIRMED_LOCAL',
    definition: 'Proportion of researched organizations that meet the minimum B2B partnership criteria.',
    formulaDescription: 'Qualified leads / Total leads researched * 100',
    numeratorDescription: 'Leads passing financial and mission qualification',
    denominatorDescription: 'Total leads researched',
    unit: '%',
    dateBasis: 'STAGE_ENTRY_DATE',
    targetBenchmark: '>= 50% qualification yield',
    responsibleRole: 'BD Team Leader',
    drillDownUrl: '/sales',
  },
  {
    kpiKey: 'KPI-MKT-03',
    name: 'First-Contact Rate',
    domain: 'MARKET_RESEARCH',
    confidence: 'CONFIRMED_LOCAL',
    definition: 'Proportion of qualified leads who received documented first outreach.',
    formulaDescription: 'Qualified leads with logged outreach / Total qualified leads * 100',
    unit: '%',
    dateBasis: 'STAGE_ENTRY_DATE',
    targetBenchmark: '100% within 5 business days',
    responsibleRole: 'BD Team Member',
    drillDownUrl: '/sales',
  },
  {
    kpiKey: 'KPI-MKT-04',
    name: 'First-Response Rate',
    domain: 'MARKET_RESEARCH',
    confidence: 'CONFIRMED_LOCAL',
    definition: 'Proportion of contacted leads that replied to initial outreach.',
    formulaDescription: 'Leads replying / Leads contacted * 100',
    unit: '%',
    dateBasis: 'STAGE_ENTRY_DATE',
    targetBenchmark: '>= 30% response rate',
    responsibleRole: 'BD Team Member',
    drillDownUrl: '/sales',
  },

  // -------------------------------------------------------------
  // Workflow 2 — Sales and Partner CRM
  // -------------------------------------------------------------
  {
    kpiKey: 'KPI-SALES-01',
    name: 'Meetings Booked & Held',
    domain: 'SALES_CRM',
    confidence: 'CONFIRMED_LOCAL',
    definition: 'Count of validated discovery or sales meetings held with corporate, NGO, or institutional partners.',
    formulaDescription: 'Count(Meetings held in period)',
    unit: 'count',
    dateBasis: 'STAGE_ENTRY_DATE',
    targetBenchmark: '>= 12 meetings per month',
    responsibleRole: 'VP Business Development (BD)',
    drillDownUrl: '/sales',
  },
  {
    kpiKey: 'KPI-SALES-02',
    name: 'Qualified B2B Pipeline',
    domain: 'SALES_CRM',
    confidence: 'CONFIRMED_LOCAL',
    definition: 'Sum of monetary value or weighted opportunity potential for active deals meeting qualification criteria.',
    formulaDescription: 'Sum(Estimated TTC MAD value of open qualified deals)',
    unit: 'MAD',
    dateBasis: 'STAGE_ENTRY_DATE',
    targetBenchmark: '>= 150,000 MAD active pipeline',
    responsibleRole: 'VP Business Development (BD)',
    drillDownUrl: '/sales',
  },
  {
    kpiKey: 'KPI-SALES-03',
    name: 'B2B Sales Win Rate',
    domain: 'SALES_CRM',
    confidence: 'CONFIRMED_LOCAL',
    definition: 'Percentage of closed deals that resulted in a signed agreement.',
    formulaDescription: 'Won deals / (Won deals + Lost deals) * 100',
    unit: '%',
    dateBasis: 'STAGE_ENTRY_DATE',
    targetBenchmark: '>= 40% win rate',
    responsibleRole: 'VP Business Development (BD)',
    drillDownUrl: '/sales',
  },
  {
    kpiKey: 'KPI-SALES-04',
    name: 'Follow-up SLA Compliance',
    domain: 'SALES_CRM',
    confidence: 'CONFIRMED_LOCAL',
    definition: 'Percentage of scheduled partner follow-ups completed by the designated SLA deadline.',
    formulaDescription: 'Follow-ups completed on time / Follow-ups due * 100',
    unit: '%',
    dateBasis: 'TASK_DUE_DATE',
    targetBenchmark: '>= 95% on-time follow-ups',
    responsibleRole: 'BD Team Leader',
    drillDownUrl: '/sales',
  },
  {
    kpiKey: 'KPI-SALES-05',
    name: 'Stale-Deal Rate (>14d)',
    domain: 'SALES_CRM',
    confidence: 'CONFIRMED_LOCAL',
    definition: 'Proportion of open deals that have had no logged interaction for more than 14 calendar days.',
    formulaDescription: 'Open deals with idle time > 14 days / Total open deals * 100',
    unit: '%',
    dateBasis: 'STAGE_ENTRY_DATE',
    targetBenchmark: '0% stale deals',
    responsibleRole: 'VP Business Development (BD)',
    drillDownUrl: '/sales',
  },

  // -------------------------------------------------------------
  // Workflow 3 — Contracts and Opportunity Creation
  // -------------------------------------------------------------
  {
    kpiKey: 'KPI-CONT-01',
    name: 'Signed Partner Count',
    domain: 'CONTRACTS_SUPPLY',
    confidence: 'VERIFIED_OFFICIAL',
    officialSource: {
      authority: 'Partners Hub',
      url: 'https://www.hub.aiesec.org/partners-hub',
      docTitle: 'AIESEC Partner Standards & Contract Signing Governance',
    },
    definition: 'Number of unique organizations with a legally verified and signed partnership agreement in the period.',
    formulaDescription: 'Count(Unique organizations with active signed contract)',
    unit: 'count',
    dateBasis: 'STAGE_ENTRY_DATE',
    targetBenchmark: '>= 10 active partner organizations',
    responsibleRole: 'VP Business Development (BD)',
    drillDownUrl: '/sales#contracts',
  },
  {
    kpiKey: 'KPI-CONT-02',
    name: 'Available Valid Opportunity Slots',
    domain: 'CONTRACTS_SUPPLY',
    confidence: 'VERIFIED_OFFICIAL',
    officialSource: {
      authority: 'Exchange Hub',
      url: 'https://www.hub.aiesec.org/exchange-hub',
      docTitle: 'APIP / AEPP Opportunity Validity Rules',
    },
    definition: 'Sum of valid, open, unfilled slots across all active approved opportunities.',
    formulaDescription: 'Sum(Total slots - Matched slots) for all verified valid opportunities',
    unit: 'count',
    dateBasis: 'STAGE_ENTRY_DATE',
    targetBenchmark: '>= 60 slots per peak',
    responsibleRole: 'VP Product (iGV)',
    drillDownUrl: '/opportunities',
  },
  {
    kpiKey: 'KPI-CONT-03',
    name: 'Slot Fill Rate',
    domain: 'CONTRACTS_SUPPLY',
    confidence: 'VERIFIED_OFFICIAL',
    definition: 'Percentage of total valid opportunity slots that have been filled by approved or realized participants.',
    formulaDescription: 'Filled valid slots / Total valid slots available to cohort * 100',
    unit: '%',
    dateBasis: 'STAGE_ENTRY_DATE',
    targetBenchmark: '>= 80% slot fill rate',
    responsibleRole: 'VP Product (iGV)',
    drillDownUrl: '/opportunities',
  },

  // -------------------------------------------------------------
  // Workflow 4 — International Relations (IR) and Supply Management
  // -------------------------------------------------------------
  {
    kpiKey: 'KPI-IR-01',
    name: 'Active IR Partners Count',
    domain: 'IR_MANAGEMENT',
    confidence: 'VERIFIED_OFFICIAL',
    officialSource: {
      authority: 'Exchange Hub',
      url: 'https://www.hub.aiesec.org/exchange-hub',
      docTitle: 'International Relations & Entity Partnership Protocol',
    },
    definition: 'Unique overseas AIESEC entities with a verified bilateral agreement and active applicant pipeline in current term.',
    formulaDescription: 'Count(Overseas entities with active bilateral agreement)',
    unit: 'count',
    dateBasis: 'STAGE_ENTRY_DATE',
    targetBenchmark: '>= 6 active bilateral IR partners',
    responsibleRole: 'VP International Relations (IR)',
    drillDownUrl: '/opportunities/irm',
  },
  {
    kpiKey: 'KPI-IR-02',
    name: 'IR Response Time SLA',
    domain: 'IR_MANAGEMENT',
    confidence: 'CONFIRMED_LOCAL',
    definition: 'Median elapsed time from IR request dispatch to documented reply from partner entity.',
    formulaDescription: 'Median(Hours to first response)',
    unit: 'days',
    dateBasis: 'TASK_DUE_DATE',
    targetBenchmark: '<= 48 hours response time',
    responsibleRole: 'IR Officer',
    drillDownUrl: '/opportunities/irm',
  },

  // -------------------------------------------------------------
  // Workflow 5 — EP Application and Funnel
  // -------------------------------------------------------------
  {
    kpiKey: 'KPI-FUNNEL-01',
    name: 'Applications (APD)',
    domain: 'EP_FUNNEL',
    confidence: 'VERIFIED_OFFICIAL',
    officialSource: {
      authority: 'IM Hub',
      url: 'https://www.hub.aiesec.org/im-hub',
      docTitle: 'EXPA Status Definitions: Applied (APD)',
    },
    definition: 'Total unique participant applications registered in the selected cohort.',
    formulaDescription: 'Count(Unique applications in cohort)',
    unit: 'count',
    dateBasis: 'APPLICATION_DATE',
    targetBenchmark: '>= 100 applications per peak',
    responsibleRole: 'VP Customer Experience (CXP)',
    drillDownUrl: '/crm',
  },
  {
    kpiKey: 'KPI-FUNNEL-02',
    name: 'Application-to-Realization Rate (Cohort)',
    domain: 'EP_FUNNEL',
    confidence: 'VERIFIED_OFFICIAL',
    officialSource: {
      authority: 'Exchange Hub',
      url: 'https://www.hub.aiesec.org/exchange-hub',
      docTitle: 'GV Performance Dashboard: End-to-End Funnel Conversion',
    },
    definition: 'Percentage of applicants from a specific application cohort who ultimately realized their exchange.',
    formulaDescription: 'Realized EPs from cohort / Total unique applicants in same cohort * 100',
    unit: '%',
    dateBasis: 'APPLICATION_DATE',
    targetBenchmark: '>= 20% cohort conversion',
    responsibleRole: 'VP Customer Experience (CXP)',
    drillDownUrl: '/crm',
  },
  {
    kpiKey: 'KPI-FUNNEL-03',
    name: 'Application-to-Completion Rate (Cohort)',
    domain: 'EP_FUNNEL',
    confidence: 'VERIFIED_OFFICIAL',
    definition: 'Percentage of applicants from a specific cohort who successfully completed the exchange and standards survey.',
    formulaDescription: 'Completed EPs from cohort / Total unique applicants in same cohort * 100',
    unit: '%',
    dateBasis: 'APPLICATION_DATE',
    targetBenchmark: '>= 18% cohort completion',
    responsibleRole: 'VP Customer Experience (CXP)',
    drillDownUrl: '/crm',
  },

  // -------------------------------------------------------------
  // Workflow 6 — Matching and Opportunity Capacity
  // -------------------------------------------------------------
  {
    kpiKey: 'KPI-MATCH-01',
    name: 'Eligible Unmatched EPs Beyond SLA (>7d)',
    domain: 'MATCHING_CAPACITY',
    confidence: 'CONFIRMED_LOCAL',
    definition: 'Count of eligible, screened EPs waiting more than 7 days for slot matching without a confirmed allocation.',
    formulaDescription: 'Count(Eligible EPs waiting > 7 days without slot match)',
    unit: 'count',
    dateBasis: 'STAGE_ENTRY_DATE',
    targetBenchmark: '0 EPs beyond 7d SLA',
    responsibleRole: 'Matching Officer',
    drillDownUrl: '/crm?status=UNMATCHED',
  },
  {
    kpiKey: 'KPI-MATCH-02',
    name: 'Overbooking Count',
    domain: 'MATCHING_CAPACITY',
    confidence: 'VERIFIED_OFFICIAL',
    definition: 'Confirmed matches in excess of valid slot capacity. Strict invariant: must always be zero.',
    formulaDescription: 'Count(Matches exceeding slot capacity)',
    unit: 'count',
    dateBasis: 'MATCH_DATE',
    targetBenchmark: '0 (Strict Invariant)',
    responsibleRole: 'VP Product (iGV)',
    drillDownUrl: '/opportunities',
  },

  // -------------------------------------------------------------
  // Workflow 7 — Visa, Documents, and Pre-Arrival Readiness
  // -------------------------------------------------------------
  {
    kpiKey: 'KPI-VISA-01',
    name: 'Pre-Arrival Readiness Rate',
    domain: 'VISA_PRE_ARRIVAL',
    confidence: 'VERIFIED_OFFICIAL',
    officialSource: {
      authority: 'Exchange Hub',
      url: 'https://www.hub.aiesec.org/exchange-hub',
      docTitle: 'Visa Hub & Exchange Standard #6 Preparation',
    },
    definition: 'Percentage of confirmed arrivals who have completed all mandatory pre-arrival requirements (visa clearance, flight details, pickup guide).',
    formulaDescription: 'Arrivals with all mandatory items complete / Total confirmed arrivals in cohort * 100',
    unit: '%',
    dateBasis: 'REALIZATION_DATE',
    targetBenchmark: '100% pre-arrival readiness',
    responsibleRole: 'Logistics Officer',
    drillDownUrl: '/accommodation#pickups',
  },

  // -------------------------------------------------------------
  // Workflow 8 — Arrival, Accommodation, Pickup, and Delivery
  // -------------------------------------------------------------
  {
    kpiKey: 'KPI-OPS-01',
    name: 'Pickup Coverage & Greeter Allocation',
    domain: 'ARRIVAL_DELIVERY',
    confidence: 'VERIFIED_OFFICIAL',
    officialSource: {
      authority: 'Exchange Hub',
      url: 'https://www.hub.aiesec.org/exchange-hub',
      docTitle: 'Exchange Standard #6: Pickup Protocol',
    },
    definition: 'Proportion of arriving participants with a verified greeter buddy assigned and 3-day written directions sent.',
    formulaDescription: 'Arrivals with assigned greeter & guide / Total arrivals * 100',
    unit: '%',
    dateBasis: 'REALIZATION_DATE',
    targetBenchmark: '100% pickup coverage',
    responsibleRole: 'Logistics Team Leader',
    drillDownUrl: '/accommodation#pickups',
  },
  {
    kpiKey: 'KPI-OPS-02',
    name: 'Accommodation Temporal Collision Count',
    domain: 'ARRIVAL_DELIVERY',
    confidence: 'VERIFIED_OFFICIAL',
    definition: 'Violations of INV-01: overlapping bed allocations in the same physical space. Must always be zero.',
    formulaDescription: 'Count(Detected temporal bed overlaps)',
    unit: 'count',
    dateBasis: 'REALIZATION_DATE',
    targetBenchmark: '0 (Strict Mathematical Invariant)',
    responsibleRole: 'Housing Coordinator',
    drillDownUrl: '/accommodation#board',
  },

  // -------------------------------------------------------------
  // Workflow 9 — Exchange Standards, Partner Standards, and CXP
  // -------------------------------------------------------------
  {
    kpiKey: 'KPI-STD-01',
    name: '18 Exchange Standards Compliance',
    domain: 'EXCHANGE_STANDARDS',
    confidence: 'VERIFIED_OFFICIAL',
    officialSource: {
      authority: 'Exchange Hub',
      url: 'https://www.hub.aiesec.org/exchange-hub',
      docTitle: '18 Refreshed Exchange Standards (with #10a and #10b split)',
    },
    definition: 'Percentage of applicable mandatory exchange checkpoints completed with verified documentary evidence.',
    formulaDescription: 'Delivered checkpoints with evidence / Total applicable checkpoints due * 100',
    unit: '%',
    dateBasis: 'REALIZATION_DATE',
    targetBenchmark: '>= 16 / 18 standards delivered (>= 88.8%)',
    responsibleRole: 'VP Customer Experience (CXP)',
    drillDownUrl: '/accommodation#standards',
  },
  {
    kpiKey: 'KPI-STD-02',
    name: 'Overdue Mandatory Checkpoints',
    domain: 'EXCHANGE_STANDARDS',
    confidence: 'VERIFIED_OFFICIAL',
    definition: 'Count of active participants with a mandatory exchange standard checkpoint past due date.',
    formulaDescription: 'Count(Exchange standards checkpoints past due)',
    unit: 'count',
    dateBasis: 'TASK_DUE_DATE',
    targetBenchmark: '0 overdue checkpoints',
    responsibleRole: 'VP Customer Experience (CXP)',
    drillDownUrl: '/accommodation#standards',
  },
  {
    kpiKey: 'KPI-STD-03',
    name: 'Unresolved High-Severity Cases (Mood <= 2)',
    domain: 'EXCHANGE_STANDARDS',
    confidence: 'VERIFIED_OFFICIAL',
    officialSource: {
      authority: 'ICB Hub',
      url: 'https://www.hub.aiesec.org/icb-hub',
      docTitle: 'ICB Case Solving Protocol & Escalation Guidelines',
    },
    definition: 'Count of active participants reporting touchpoint mood <= 2 or open quality cases under active countdown.',
    formulaDescription: 'Count(Open cases in Stage 1/2/3 + Touchpoint mood <= 2)',
    unit: 'count',
    dateBasis: 'TASK_DUE_DATE',
    targetBenchmark: '0 unresolved cases beyond SLA',
    responsibleRole: 'VP Customer Experience (CXP)',
    drillDownUrl: '/accommodation#cases',
  },

  // -------------------------------------------------------------
  // Workflow 10 — Finance and Partnership Economics
  // -------------------------------------------------------------
  {
    kpiKey: 'KPI-FIN-01',
    name: 'Accounts Receivable Overdue > 14 Days',
    domain: 'FINANCE_ECONOMICS',
    confidence: 'VERIFIED_OFFICIAL',
    officialSource: {
      authority: 'Finance Academy',
      url: 'https://www.hub.aiesec.org/finance-academy-2023',
      docTitle: 'AIESEC Financial and Procurement Manual (AFPM) Section 6',
    },
    definition: 'Monetary value of B2B partner invoices exceeding 14 days past due, incurring 5% statutory penalty and realization freeze.',
    formulaDescription: 'Sum(Balance due MAD) for invoices where today > dueDate + 14 days',
    unit: 'MAD',
    dateBasis: 'INVOICE_DATE',
    targetBenchmark: '0 MAD overdue > 14 days',
    responsibleRole: 'VP Finance (FNL)',
    drillDownUrl: '/dashboards#invoices',
  },
  {
    kpiKey: 'KPI-FIN-02',
    name: 'iGV Trainee Cost Coverage Ratio',
    domain: 'FINANCE_ECONOMICS',
    confidence: 'CONFIRMED_LOCAL',
    definition: 'Ratio of confirmed corporate/CSR sponsorship inflows to total direct trainee delivery expenses.',
    formulaDescription: 'Confirmed inflows MAD / Direct volunteer costs MAD * 100',
    unit: '%',
    dateBasis: 'INVOICE_DATE',
    targetBenchmark: '>= 70% to 100% cost coverage',
    responsibleRole: 'VP Finance (FNL)',
    drillDownUrl: '/dashboards',
  },
  {
    kpiKey: 'KPI-FIN-03',
    name: 'AFPM Liquid Reserve Solvency Ratio',
    domain: 'FINANCE_ECONOMICS',
    confidence: 'VERIFIED_OFFICIAL',
    officialSource: {
      authority: 'Finance Academy',
      url: 'https://www.hub.aiesec.org/finance-academy-2023',
      docTitle: 'AFPM Statutory Reserve Solvency Floor',
    },
    definition: 'Ratio of current liquid bank balance to the minimum required reserve floor (50,000 MAD).',
    formulaDescription: 'Liquid balance MAD / 50,000 MAD * 100',
    unit: '%',
    dateBasis: 'INVOICE_DATE',
    targetBenchmark: '>= 120% reserve ratio',
    responsibleRole: 'VP Finance (FNL) & LCP',
    drillDownUrl: '/dashboards',
  },

  // -------------------------------------------------------------
  // Workflow 11 — Team Execution and Ownership
  // -------------------------------------------------------------
  {
    kpiKey: 'KPI-TM-01',
    name: 'Composite Member Engagement Score (MES)',
    domain: 'TEAM_EXECUTION',
    confidence: 'CONFIRMED_LOCAL',
    officialSource: {
      authority: 'MX Hub',
      url: 'https://www.hub.aiesec.org/mxknowledge',
      docTitle: 'AIESEC Member Engagement Scorecard & Team Standards',
    },
    definition: 'Weighted leadership development index evaluating meeting attendance, personal KPI attainment, coaching, and operational hours.',
    formulaDescription: '0.35 * Attendance + 0.35 * KPI Goal + 0.15 * O2O Coaching + 0.15 * Operations Hours',
    unit: 'score',
    dateBasis: 'TASK_DUE_DATE',
    targetBenchmark: '>= 75% Average MES across LC',
    responsibleRole: 'VP Talent Management (TM)',
    drillDownUrl: '/members',
  },
  {
    kpiKey: 'KPI-TM-02',
    name: 'Task On-Time Completion Rate',
    domain: 'TEAM_EXECUTION',
    confidence: 'CONFIRMED_LOCAL',
    definition: 'Proportion of operational delivery tasks completed on or before the assigned deadline.',
    formulaDescription: 'Tasks completed on time / Total tasks due * 100',
    unit: '%',
    dateBasis: 'TASK_DUE_DATE',
    targetBenchmark: '>= 90% on-time completion',
    responsibleRole: 'VP Talent Management (TM)',
    drillDownUrl: '/dashboards#tasks',
  },
];

export function getKpiRegistryEntry(kpiKey: string): KpiRegistryEntry | undefined {
  return COMPREHENSIVE_KPI_REGISTRY.find((k) => k.kpiKey === kpiKey);
}

export function getKpisByDomain(domain: string): KpiRegistryEntry[] {
  return COMPREHENSIVE_KPI_REGISTRY.filter((k) => k.domain === domain);
}
