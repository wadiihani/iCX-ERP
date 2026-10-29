export type PipelineStage =
  | 'PROSPECT'
  | 'QUALIFIED'
  | 'DISCOVERY'
  | 'PROPOSAL'
  | 'NEGOTIATION'
  | 'AGREEMENT_SIGNED'
  | 'OPP_SETUP'
  | 'ACTIVE_DELIVERY'
  | 'CLOSED_LOST'
  | 'DISQUALIFIED';

export interface B2bDealRecord {
  id: string;
  orgId: string;
  orgName: string;
  title: string;
  term: '26.1' | '26.2';
  peak: 'SUMMER' | 'WINTER';
  product: 'iGV' | 'iGTa' | 'iGTe' | 'CSR_SPONSOR';
  stage: PipelineStage;
  revenueMad: number;
  expectedHeadcount: number;
  assignedOwnerId: string;
  assignedOwnerName: string;
  nextFollowupDate: string;
  lastActivityDate: string;
  lossReason?: string;
  contractId?: string;
  contractUrl?: string;
  bantAnswers?: {
    budgetMad: number;
    authorityContactName: string;
    needSummary: string;
    timelineWeeks: number;
    completedAt?: string;
    completedBy?: string;
  } | null;
  history: Array<{
    fromStage: PipelineStage;
    toStage: PipelineStage;
    timestamp: string;
    actorName: string;
    reason?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export const PIPELINE_STAGE_CONFIG: Record<
  PipelineStage,
  { label: string; badgeClass: string; stepNumber: number; isTerminal?: boolean }
> = {
  PROSPECT: { label: '1. Prospect', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200', stepNumber: 1 },
  QUALIFIED: { label: '2. Qualified', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200', stepNumber: 2 },
  DISCOVERY: { label: '3. Discovery', badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200', stepNumber: 3 },
  PROPOSAL: { label: '4. Proposal', badgeClass: 'bg-purple-50 text-purple-700 border-purple-200', stepNumber: 4 },
  NEGOTIATION: { label: '5. Negotiation', badgeClass: 'bg-sky-50 text-sky-700 border-sky-200', stepNumber: 5 },
  AGREEMENT_SIGNED: { label: '6. Agreement Signed', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200', stepNumber: 6 },
  OPP_SETUP: { label: '7. Opportunity Setup', badgeClass: 'bg-teal-50 text-teal-700 border-teal-200', stepNumber: 7 },
  ACTIVE_DELIVERY: { label: '8. Active Delivery', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold', stepNumber: 8 },
  CLOSED_LOST: { label: 'Closed Lost', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200', stepNumber: 0, isTerminal: true },
  DISQUALIFIED: { label: 'Disqualified', badgeClass: 'bg-slate-100 text-slate-500 border-slate-300', stepNumber: 0, isTerminal: true },
};

export const INITIAL_B2B_DEALS: B2bDealRecord[] = [
  {
    id: 'deal-01',
    orgId: 'org_rabat_001',
    orgName: 'BMCE Bank Foundation',
    title: 'Q4 2026 CSR Rural Schools Literacy Initiative (8 EPs)',
    term: '26.2',
    peak: 'WINTER',
    product: 'CSR_SPONSOR',
    stage: 'ACTIVE_DELIVERY',
    revenueMad: 45000,
    expectedHeadcount: 8,
    assignedOwnerId: 'mbr-01',
    assignedOwnerName: 'Wadii Hani',
    nextFollowupDate: '2026-11-05',
    lastActivityDate: '2026-10-25',
    contractId: 'cntr-bmce-2026',
    contractUrl: 'https://drive.google.com/drive/folders/bmce-mou-signed',
    bantAnswers: {
      budgetMad: 45000,
      authorityContactName: 'Dr. Leila Benhayoun',
      needSummary: 'Equip 4 rural elementary schools near Kenitra with English education and library kits.',
      timelineWeeks: 6,
      completedAt: '2026-08-18',
      completedBy: 'Wadii Hani',
    },
    history: [
      { fromStage: 'PROSPECT', toStage: 'QUALIFIED', timestamp: '2026-08-10', actorName: 'Wadii Hani' },
      { fromStage: 'QUALIFIED', toStage: 'DISCOVERY', timestamp: '2026-08-18', actorName: 'Wadii Hani' },
      { fromStage: 'DISCOVERY', toStage: 'PROPOSAL', timestamp: '2026-08-22', actorName: 'Wadii Hani' },
      { fromStage: 'PROPOSAL', toStage: 'AGREEMENT_SIGNED', timestamp: '2026-08-28', actorName: 'Wadii Hani' },
      { fromStage: 'AGREEMENT_SIGNED', toStage: 'ACTIVE_DELIVERY', timestamp: '2026-09-01', actorName: 'Wadii Hani' },
    ],
    createdAt: '2026-08-05T10:00:00Z',
    updatedAt: '2026-10-25T11:30:00Z',
  },
  {
    id: 'deal-02',
    orgId: 'org_rabat_002',
    orgName: 'Rabat American School',
    title: '2026-2027 International Teaching Fellows (4 iGTe)',
    term: '26.2',
    peak: 'WINTER',
    product: 'iGTe',
    stage: 'AGREEMENT_SIGNED',
    revenueMad: 72000,
    expectedHeadcount: 4,
    assignedOwnerId: 'mbr-02',
    assignedOwnerName: 'Omar Joukhane',
    nextFollowupDate: '2026-11-02',
    lastActivityDate: '2026-10-26',
    contractId: 'cntr-ras-2026',
    contractUrl: 'https://drive.google.com/drive/folders/ras-contract-signed',
    bantAnswers: {
      budgetMad: 72000,
      authorityContactName: 'Sarah Williams',
      needSummary: 'Native English & Spanish teaching fellows for Middle and High school language immersion.',
      timelineWeeks: 16,
      completedAt: '2026-08-25',
      completedBy: 'Omar Joukhane',
    },
    history: [
      { fromStage: 'PROSPECT', toStage: 'QUALIFIED', timestamp: '2026-08-12', actorName: 'Omar Joukhane' },
      { fromStage: 'QUALIFIED', toStage: 'DISCOVERY', timestamp: '2026-08-25', actorName: 'Omar Joukhane' },
      { fromStage: 'DISCOVERY', toStage: 'PROPOSAL', timestamp: '2026-09-05', actorName: 'Omar Joukhane' },
      { fromStage: 'PROPOSAL', toStage: 'AGREEMENT_SIGNED', timestamp: '2026-09-18', actorName: 'Omar Joukhane' },
    ],
    createdAt: '2026-08-10T14:00:00Z',
    updatedAt: '2026-10-26T16:00:00Z',
  },
  {
    id: 'deal-03',
    orgId: 'org_rabat_003',
    orgName: 'Casatech Innovation Labs',
    title: 'Winter 2026 Fullstack Developer Trainee (1 iGTa)',
    term: '26.2',
    peak: 'WINTER',
    product: 'iGTa',
    stage: 'NEGOTIATION',
    revenueMad: 28000,
    expectedHeadcount: 1,
    assignedOwnerId: 'mbr-06',
    assignedOwnerName: 'Rayen Jbali',
    nextFollowupDate: '2026-10-31',
    lastActivityDate: '2026-10-24',
    bantAnswers: {
      budgetMad: 28000,
      authorityContactName: 'Omar Chraibi',
      needSummary: 'React/Node.js fullstack trainee for 6-month product buildout with 4,000 MAD stipend.',
      timelineWeeks: 24,
      completedAt: '2026-09-20',
      completedBy: 'Rayen Jbali',
    },
    history: [
      { fromStage: 'PROSPECT', toStage: 'QUALIFIED', timestamp: '2026-09-10', actorName: 'Rayen Jbali' },
      { fromStage: 'QUALIFIED', toStage: 'DISCOVERY', timestamp: '2026-09-20', actorName: 'Rayen Jbali' },
      { fromStage: 'DISCOVERY', toStage: 'PROPOSAL', timestamp: '2026-10-05', actorName: 'Rayen Jbali' },
      { fromStage: 'PROPOSAL', toStage: 'NEGOTIATION', timestamp: '2026-10-18', actorName: 'Rayen Jbali' },
    ],
    createdAt: '2026-09-01T10:00:00Z',
    updatedAt: '2026-10-24T08:45:00Z',
  },
  {
    id: 'deal-04',
    orgId: 'org_rabat_004',
    orgName: 'Medina Green Initiative (NGO)',
    title: 'Eco-City Waste Management Volunteer Wave (4 iGV)',
    term: '26.2',
    peak: 'WINTER',
    product: 'iGV',
    stage: 'PROPOSAL',
    revenueMad: 12000,
    expectedHeadcount: 4,
    assignedOwnerId: 'mbr-06',
    assignedOwnerName: 'Rayen Jbali',
    nextFollowupDate: '2026-11-04',
    lastActivityDate: '2026-10-22',
    bantAnswers: {
      budgetMad: 12000,
      authorityContactName: 'Fatima-Zahra Tahiri',
      needSummary: 'Environmental awareness workshops and coastal cleanup activities in Rabat-Salé.',
      timelineWeeks: 6,
      completedAt: '2026-10-10',
      completedBy: 'Rayen Jbali',
    },
    history: [
      { fromStage: 'PROSPECT', toStage: 'QUALIFIED', timestamp: '2026-09-15', actorName: 'Rayen Jbali' },
      { fromStage: 'QUALIFIED', toStage: 'DISCOVERY', timestamp: '2026-10-10', actorName: 'Rayen Jbali' },
      { fromStage: 'DISCOVERY', toStage: 'PROPOSAL', timestamp: '2026-10-20', actorName: 'Rayen Jbali' },
    ],
    createdAt: '2026-09-12T11:00:00Z',
    updatedAt: '2026-10-22T14:15:00Z',
  },
  {
    id: 'deal-05',
    orgId: 'org_rabat_005',
    orgName: 'Atlas Hospitality Group',
    title: 'Customer Relations Traineeship',
    term: '26.2',
    peak: 'WINTER',
    product: 'iGTa',
    stage: 'CLOSED_LOST',
    revenueMad: 35000,
    expectedHeadcount: 2,
    assignedOwnerId: 'mbr-02',
    assignedOwnerName: 'Omar Joukhane',
    nextFollowupDate: '2026-12-01',
    lastActivityDate: '2026-10-15',
    lossReason: 'Budget Freeze / Hotel renovation postponed intern hiring to Q2 2027.',
    history: [
      { fromStage: 'PROSPECT', toStage: 'QUALIFIED', timestamp: '2026-09-05', actorName: 'Omar Joukhane' },
      { fromStage: 'QUALIFIED', toStage: 'DISCOVERY', timestamp: '2026-09-18', actorName: 'Omar Joukhane' },
      { fromStage: 'DISCOVERY', toStage: 'CLOSED_LOST', timestamp: '2026-10-15', actorName: 'Omar Joukhane', reason: 'Budget Freeze' },
    ],
    createdAt: '2026-09-01T15:00:00Z',
    updatedAt: '2026-10-15T16:00:00Z',
  },
];

/**
 * Validates B2B deal stage progression and gates
 */
export function validateDealTransition(
  deal: B2bDealRecord,
  targetStage: PipelineStage,
  lossReason?: string
): { isValid: boolean; error?: string } {
  // If transitioning to CLOSED_LOST or DISQUALIFIED, require mandatory reason
  if (targetStage === 'CLOSED_LOST' || targetStage === 'DISQUALIFIED') {
    if (!lossReason || !lossReason.trim()) {
      return {
        isValid: false,
        error: 'Mandatory Loss / Disqualification reason is required to maintain loss analytics history.',
      };
    }
    return { isValid: true };
  }

  // Gate 1: BANT required before PROPOSAL
  if (targetStage === 'PROPOSAL' || targetStage === 'NEGOTIATION' || targetStage === 'AGREEMENT_SIGNED') {
    if (!deal.bantAnswers || !deal.bantAnswers.needSummary) {
      return {
        isValid: false,
        error: 'BANT Discovery Gate Block: Partner need summary and budget must be documented before sending a proposal.',
      };
    }
  }

  // Gate 2: Contract required before OPP_SETUP / ACTIVE_DELIVERY
  if (targetStage === 'OPP_SETUP' || targetStage === 'ACTIVE_DELIVERY') {
    if (!deal.contractId && !deal.contractUrl) {
      return {
        isValid: false,
        error: 'Contract Gate Block: Signed contract or MoU document link is required before opening opportunity slots.',
      };
    }
  }

  return { isValid: true };
}
