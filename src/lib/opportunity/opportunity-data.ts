import { OpportunityLifecycleRecord } from './opportunity-machine';
import { OpportunitySlot } from './slot-machine';

export interface ExtendedOpportunity extends OpportunityLifecycleRecord {
  product: 'igv' | 'igt' | 'igte';
  organizationName: string;
  sdgTarget: number;
  durationWeeks: number;
  weeklyWorkingHours: number;
  fundingPercentage: number;
  slots: OpportunitySlot[];
}

export const INITIAL_OPPORTUNITIES: ExtendedOpportunity[] = [
  {
    id: 'opp-1',
    lcId: 'lc_rabat_001',
    organizationId: 'org_rabat_001',
    organizationName: 'BMCE Bank Foundation',
    title: 'Youth Digital Literacy & Coding Coach',
    product: 'igv',
    sdgTarget: 4,
    status: 'APPLICATIONS_OPEN',
    createdAt: '2026-10-20T10:00:00Z',
    submittedForReviewAt: '2026-10-21T10:00:00Z',
    approvedAt: '2026-10-22T14:00:00Z',
    totalOpenings: 5,
    availableOpenings: 3,
    durationWeeks: 6,
    weeklyWorkingHours: 30,
    fundingPercentage: 100,
    history: [],
    slots: [
      { id: 's1', opportunityId: 'opp-1', slotNumber: 1, startDate: '2026-11-01', endDate: '2026-12-15', status: 'CONFIRMED' },
      { id: 's2', opportunityId: 'opp-1', slotNumber: 2, startDate: '2026-11-01', endDate: '2026-12-15', status: 'RESERVED' },
      { id: 's3', opportunityId: 'opp-1', slotNumber: 3, startDate: '2026-11-01', endDate: '2026-12-15', status: 'UNALLOCATED' },
      { id: 's4', opportunityId: 'opp-1', slotNumber: 4, startDate: '2026-11-01', endDate: '2026-12-15', status: 'UNALLOCATED' },
      { id: 's5', opportunityId: 'opp-1', slotNumber: 5, startDate: '2026-11-01', endDate: '2026-12-15', status: 'UNALLOCATED' },
    ],
  },
  {
    id: 'opp-2',
    lcId: 'lc_rabat_001',
    organizationId: 'org_rabat_002',
    organizationName: 'Rabat American School',
    title: 'STEM & Robotics Teaching Assistant',
    product: 'igt',
    sdgTarget: 4,
    status: 'APPLICATIONS_OPEN',
    createdAt: '2026-09-20T09:00:00Z',
    submittedForReviewAt: '2026-09-21T09:30:00Z',
    approvedAt: '2026-09-23T10:00:00Z',
    totalOpenings: 3,
    availableOpenings: 1,
    durationWeeks: 12,
    weeklyWorkingHours: 35,
    fundingPercentage: 100,
    history: [],
    slots: [
      { id: 's6', opportunityId: 'opp-2', slotNumber: 1, startDate: '2026-11-15', endDate: '2027-02-15', status: 'CONFIRMED' },
      { id: 's7', opportunityId: 'opp-2', slotNumber: 2, startDate: '2026-11-15', endDate: '2027-02-15', status: 'CONFIRMED' },
      { id: 's8', opportunityId: 'opp-2', slotNumber: 3, startDate: '2026-11-15', endDate: '2027-02-15', status: 'UNALLOCATED' },
    ],
  },
  {
    id: 'opp-3',
    lcId: 'lc_rabat_001',
    organizationId: 'org_rabat_003',
    organizationName: 'Casatech Innovation Labs',
    title: 'Fullstack React & Node.js Software Engineer',
    product: 'igt',
    sdgTarget: 8,
    status: 'OPEN',
    createdAt: '2026-10-10T14:00:00Z',
    submittedForReviewAt: '2026-10-11T10:00:00Z',
    approvedAt: '2026-10-12T16:00:00Z',
    totalOpenings: 2,
    availableOpenings: 2,
    durationWeeks: 26,
    weeklyWorkingHours: 40,
    fundingPercentage: 100,
    history: [],
    slots: [
      { id: 's9', opportunityId: 'opp-3', slotNumber: 1, startDate: '2027-01-05', endDate: '2027-07-05', status: 'UNALLOCATED' },
      { id: 's10', opportunityId: 'opp-3', slotNumber: 2, startDate: '2027-01-05', endDate: '2027-07-05', status: 'UNALLOCATED' },
    ],
  },
];
