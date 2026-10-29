import { OpportunityLifecycleRecord } from './opportunity-machine';
import { OpportunitySlot } from './slot-machine';
import { OpportunitySlotWave } from './opportunity-portfolio-data';

export interface ExtendedOpportunity extends OpportunityLifecycleRecord {
  product: 'igv' | 'igt' | 'igte';
  organizationName: string;
  contractId?: string;
  sdgTarget: number;
  durationWeeks: number;
  weeklyWorkingHours: number;
  fundingPercentage: number;
  slots: OpportunitySlot[];
  slotWaves: OpportunitySlotWave[];

  // Modality & Remote Governance
  modality: 'PHYSICAL' | 'PARTLY_REMOTE' | 'FULLY_REMOTE';
  remoteWeeks?: number;
  icbAuditUrl?: string;

  // iGV Specifics
  portfolioProject?: string;
  primarySdg?: number;
  secondarySdgs?: number[];
  targetBeneficiaries?: string;
  plannedActivities?: string[];
  expectedOutputs?: string;

  // iGTa / iGTe Specifics
  monthlySalaryMad?: number;
  epFeeMad?: number;
  professionalField?: string;
  teachingSubject?: string;
  teachingLevel?: string;
  curriculumOutline?: string;
  supervisorContactId?: string;
  supervisorName?: string;
  supervisorTitle?: string;

  // Benefit Locking (AEPP 4.2.1.4)
  isBenefitsLocked?: boolean;
  variationAddendumUrl?: string;
}

export const INITIAL_OPPORTUNITIES: ExtendedOpportunity[] = [
  {
    id: 'opp-1',
    lcId: 'lc_rabat_001',
    organizationId: 'org_rabat_001',
    organizationName: 'BMCE Bank Foundation',
    contractId: 'ct_001',
    title: 'Global Classroom: Youth Digital Literacy & Coding Coach',
    product: 'igv',
    portfolioProject: 'Global Classroom',
    primarySdg: 4,
    secondarySdgs: [1, 8],
    sdgTarget: 4,
    status: 'APPLICATIONS_OPEN',
    createdAt: '2026-10-20T10:00:00Z',
    submittedForReviewAt: '2026-10-21T10:00:00Z',
    approvedAt: '2026-10-22T14:00:00Z',
    assignedManagerId: 'mem_001',
    totalOpenings: 5,
    availableOpenings: 3,
    durationWeeks: 6,
    weeklyWorkingHours: 30,
    fundingPercentage: 100,
    modality: 'PHYSICAL',
    monthlySalaryMad: 0,
    epFeeMad: 0,
    targetBeneficiaries: 'Public school students aged 9-15 in rural Rabat-Salé schools',
    plannedActivities: [
      'Interactive English & French communication clubs',
      'Digital literacy and introductory Scratch coding labs',
      'Cross-cultural awareness presentations',
      'Final school tech exhibition showcase',
    ],
    expectedOutputs: '120 public school students completing 24 hours of interactive digital coaching.',
    isBenefitsLocked: true,
    history: [],
    slots: [
      { id: 's1', opportunityId: 'opp-1', slotNumber: 1, startDate: '2026-11-01', endDate: '2026-12-15', status: 'CONFIRMED' },
      { id: 's2', opportunityId: 'opp-1', slotNumber: 2, startDate: '2026-11-01', endDate: '2026-12-15', status: 'RESERVED' },
      { id: 's3', opportunityId: 'opp-1', slotNumber: 3, startDate: '2026-11-01', endDate: '2026-12-15', status: 'UNALLOCATED' },
      { id: 's4', opportunityId: 'opp-1', slotNumber: 4, startDate: '2027-02-01', endDate: '2027-03-15', status: 'UNALLOCATED' },
      { id: 's5', opportunityId: 'opp-1', slotNumber: 5, startDate: '2027-02-01', endDate: '2027-03-15', status: 'UNALLOCATED' },
    ],
    slotWaves: [
      {
        id: 'wave-1',
        opportunityId: 'opp-1',
        waveLabel: 'Wave 1 — Winter 26 (Nov - Dec)',
        startDate: '2026-11-01',
        endDate: '2026-12-15',
        capacity: 3,
        appliedCount: 8,
        acceptedCount: 4,
        approvedCount: 2,
        realizedCount: 0,
        completedCount: 0,
      },
      {
        id: 'wave-2',
        opportunityId: 'opp-1',
        waveLabel: 'Wave 2 — Spring 27 (Feb - Mar)',
        startDate: '2027-02-01',
        endDate: '2027-03-15',
        capacity: 2,
        appliedCount: 2,
        acceptedCount: 0,
        approvedCount: 0,
        realizedCount: 0,
        completedCount: 0,
      },
    ],
  },
  {
    id: 'opp-2',
    lcId: 'lc_rabat_001',
    organizationId: 'org_rabat_002',
    organizationName: 'Rabat American School',
    contractId: 'ct_002',
    title: 'STEM & Robotics Teaching Assistant',
    product: 'igte',
    sdgTarget: 4,
    status: 'APPLICATIONS_OPEN',
    createdAt: '2026-09-20T09:00:00Z',
    submittedForReviewAt: '2026-09-21T09:30:00Z',
    approvedAt: '2026-09-23T10:00:00Z',
    assignedManagerId: 'mem_002',
    totalOpenings: 3,
    availableOpenings: 1,
    durationWeeks: 16,
    weeklyWorkingHours: 35,
    fundingPercentage: 100,
    modality: 'PHYSICAL',
    monthlySalaryMad: 5500,
    epFeeMad: 0,
    teachingSubject: 'STEM_EDUCATION',
    teachingLevel: 'MIDDLE_SCHOOL',
    curriculumOutline: 'Hands-on LEGO Mindstorms and VEX Robotics modules for Grades 6-8.',
    supervisorName: 'Dr. Sarah Jenkins',
    supervisorTitle: 'Dean of Academic Affairs',
    isBenefitsLocked: true,
    history: [],
    slots: [
      { id: 's6', opportunityId: 'opp-2', slotNumber: 1, startDate: '2026-11-15', endDate: '2027-03-15', status: 'CONFIRMED' },
      { id: 's7', opportunityId: 'opp-2', slotNumber: 2, startDate: '2026-11-15', endDate: '2027-03-15', status: 'CONFIRMED' },
      { id: 's8', opportunityId: 'opp-2', slotNumber: 3, startDate: '2027-03-20', endDate: '2027-07-15', status: 'UNALLOCATED' },
    ],
    slotWaves: [
      {
        id: 'wave-ras-1',
        opportunityId: 'opp-2',
        waveLabel: 'Fall/Winter Cohort 26',
        startDate: '2026-11-15',
        endDate: '2027-03-15',
        capacity: 2,
        appliedCount: 5,
        acceptedCount: 3,
        approvedCount: 2,
        realizedCount: 1,
        completedCount: 0,
      },
      {
        id: 'wave-ras-2',
        opportunityId: 'opp-2',
        waveLabel: 'Spring/Summer Cohort 27',
        startDate: '2027-03-20',
        endDate: '2027-07-15',
        capacity: 1,
        appliedCount: 1,
        acceptedCount: 0,
        approvedCount: 0,
        realizedCount: 0,
        completedCount: 0,
      },
    ],
  },
  {
    id: 'opp-3',
    lcId: 'lc_rabat_001',
    organizationId: 'org_rabat_003',
    organizationName: 'Casatech Innovation Labs',
    contractId: 'ct_003',
    title: 'Fullstack React & Node.js Software Engineer',
    product: 'igt',
    sdgTarget: 8,
    status: 'OPEN',
    createdAt: '2026-10-10T14:00:00Z',
    submittedForReviewAt: '2026-10-11T10:00:00Z',
    approvedAt: '2026-10-12T16:00:00Z',
    assignedManagerId: 'mem_003',
    totalOpenings: 2,
    availableOpenings: 2,
    durationWeeks: 26,
    weeklyWorkingHours: 40,
    fundingPercentage: 100,
    modality: 'PARTLY_REMOTE',
    remoteWeeks: 4,
    icbAuditUrl: 'https://aies.ec/icb-remote-casatech-009',
    monthlySalaryMad: 6000,
    epFeeMad: 0,
    professionalField: 'INFORMATION_TECHNOLOGY',
    supervisorName: 'Mehdi Alami',
    supervisorTitle: 'VP Engineering & Tech Lead',
    isBenefitsLocked: false,
    history: [],
    slots: [
      { id: 's9', opportunityId: 'opp-3', slotNumber: 1, startDate: '2027-01-05', endDate: '2027-07-05', status: 'UNALLOCATED' },
      { id: 's10', opportunityId: 'opp-3', slotNumber: 2, startDate: '2027-01-05', endDate: '2027-07-05', status: 'UNALLOCATED' },
    ],
    slotWaves: [
      {
        id: 'wave-casa-1',
        opportunityId: 'opp-3',
        waveLabel: 'H1 2027 Intake (Partly Remote)',
        startDate: '2027-01-05',
        endDate: '2027-07-05',
        capacity: 2,
        appliedCount: 4,
        acceptedCount: 1,
        approvedCount: 0,
        realizedCount: 0,
        completedCount: 0,
      },
    ],
  },
];
