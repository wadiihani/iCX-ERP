export interface StandardItem {
  id: number;
  code: string;
  title: string;
  phase: 'PREPARATION' | 'EXPERIENCE' | 'POST_EXPERIENCE';
  responsibleParty: 'HOME_ENTITY' | 'HOST_ENTITY' | 'BOTH';
  isDelivered: boolean;
  deliveredAt?: string;
  evidenceType?: 'DOCUMENT' | 'FORM' | 'TIMESTAMP' | 'VERIFICATION';
  evidenceUrl?: string;
  verifiedBy?: string;
}

export interface EPStandardsDossier {
  epId: string;
  epName: string;
  product: 'iGV' | 'iGTa' | 'iGTe';
  homeLc: string;
  hostOpportunity: string;
  standards: StandardItem[];
  fulfillmentRate: number; // 0 to 100%
  status: 'IN_PROGRESS' | 'COMPLETED' | 'AT_RISK';
}

export interface ArrivalPickupRecord {
  id: string;
  epId: string;
  epName: string;
  product: 'iGV' | 'iGTa' | 'iGTe';
  flightNumber: string;
  airline: string;
  arrivalAirport: string;
  arrivalDateTime: string;
  driverName: string;
  greeterVolunteerName: string;
  accommodationAddress: string;
  day1AccompanimentOfficer: string;
  status: 'FLIGHT_PENDING' | 'PICKUP_SCHEDULED' | 'EP_COLLECTED' | 'CHECKED_IN';
  emergencyContact: string;
}

export interface CaseSolvingRecord {
  id: string;
  caseNumber: string;
  epId: string;
  epName: string;
  entityName: string;
  tier: 'TIER_1_LOCAL' | 'TIER_2_NATIONAL' | 'TIER_3_ICB';
  category: 'SAFETY_HEALTH' | 'ACCOMMODATION_BREACH' | 'JOB_DESCRIPTION_DISPUTE' | 'FINANCIAL_MISCONDUCT' | 'LEGAL_VISA';
  severity: 'MEDIUM' | 'HIGH' | 'EMERGENCY';
  summary: string;
  assignedInvestigator: string;
  openedAt: string;
  escalationDeadline: string;
  status: 'OPEN_INVESTIGATION' | 'RESOLUTION_PROPOSED' | 'ESCALATED' | 'RESOLVED';
  resolutionNotes?: string;
  isRestrictedConfidential: boolean;
}

export const INITIAL_18_STANDARDS: StandardItem[] = [
  { id: 1, code: 'STD-01', title: 'Personal Goal Setting', phase: 'PREPARATION', responsibleParty: 'BOTH', isDelivered: true, deliveredAt: '2026-10-25' },
  { id: 2, code: 'STD-02', title: 'Outgoing Preparation (OPS)', phase: 'PREPARATION', responsibleParty: 'HOME_ENTITY', isDelivered: true, deliveredAt: '2026-10-22' },
  { id: 3, code: 'STD-03', title: 'Expectation Setting', phase: 'PREPARATION', responsibleParty: 'HOST_ENTITY', isDelivered: true, deliveredAt: '2026-10-24' },
  { id: 4, code: 'STD-04', title: 'Visa and Work Permit', phase: 'PREPARATION', responsibleParty: 'HOST_ENTITY', isDelivered: true, deliveredAt: '2026-10-20' },
  { id: 5, code: 'STD-05', title: 'Arrival Pickup', phase: 'PREPARATION', responsibleParty: 'HOST_ENTITY', isDelivered: false },
  { id: 6, code: 'STD-06', title: 'Departure Support', phase: 'POST_EXPERIENCE', responsibleParty: 'HOST_ENTITY', isDelivered: false },
  { id: 7, code: 'STD-07', title: 'Accommodation', phase: 'EXPERIENCE', responsibleParty: 'HOST_ENTITY', isDelivered: true, deliveredAt: '2026-10-26' },
  { id: 8, code: 'STD-08', title: 'Basic Living Cost', phase: 'EXPERIENCE', responsibleParty: 'HOST_ENTITY', isDelivered: true, deliveredAt: '2026-10-26' },
  { id: 9, code: 'STD-09', title: 'Job Description', phase: 'EXPERIENCE', responsibleParty: 'HOST_ENTITY', isDelivered: true, deliveredAt: '2026-10-25' },
  { id: 10, code: 'STD-10', title: 'Working Hours', phase: 'EXPERIENCE', responsibleParty: 'HOST_ENTITY', isDelivered: true, deliveredAt: '2026-10-25' },
  { id: 11, code: 'STD-11', title: 'First Day of Work', phase: 'EXPERIENCE', responsibleParty: 'HOST_ENTITY', isDelivered: false },
  { id: 12, code: 'STD-12', title: 'Individual Responsibilities', phase: 'EXPERIENCE', responsibleParty: 'HOST_ENTITY', isDelivered: true, deliveredAt: '2026-10-25' },
  { id: 13, code: 'STD-13', title: 'Lead Spaces (Global Goal Spaces)', phase: 'EXPERIENCE', responsibleParty: 'HOST_ENTITY', isDelivered: false },
  { id: 14, code: 'STD-14', title: 'Opportunities for Learning', phase: 'EXPERIENCE', responsibleParty: 'HOST_ENTITY', isDelivered: false },
  { id: 15, code: 'STD-15', title: 'Cultural Understanding', phase: 'EXPERIENCE', responsibleParty: 'HOST_ENTITY', isDelivered: false },
  { id: 16, code: 'STD-16', title: 'Debrief & Handover', phase: 'POST_EXPERIENCE', responsibleParty: 'BOTH', isDelivered: false },
  { id: 17, code: 'STD-17', title: 'Integration with LC Community', phase: 'EXPERIENCE', responsibleParty: 'HOST_ENTITY', isDelivered: false },
  { id: 18, code: 'STD-18', title: 'Exchange Evaluation & Survey', phase: 'POST_EXPERIENCE', responsibleParty: 'BOTH', isDelivered: false },
];

export const INITIAL_STANDARDS_DOSSIERS: EPStandardsDossier[] = [
  {
    epId: 'ep_2026_081',
    epName: 'Sofia Martinez',
    product: 'iGV',
    homeLc: 'AIESEC in Bogota UniAndes',
    hostOpportunity: 'Youth Digital Literacy & Coding Coach',
    standards: INITIAL_18_STANDARDS,
    fulfillmentRate: 50, // 9 / 18 delivered
    status: 'IN_PROGRESS',
  },
  {
    epId: 'ep_2026_065',
    epName: 'Elif Demir',
    product: 'iGTe',
    homeLc: 'AIESEC in Izmir',
    hostOpportunity: 'STEM & Robotics Teaching Assistant',
    standards: INITIAL_18_STANDARDS.map((s, idx) => ({ ...s, isDelivered: idx < 12 })),
    fulfillmentRate: 67, // 12 / 18 delivered
    status: 'IN_PROGRESS',
  },
];

export const INITIAL_PICKUPS: ArrivalPickupRecord[] = [
  {
    id: 'pck_001',
    epId: 'ep_2026_081',
    epName: 'Sofia Martinez',
    product: 'iGV',
    flightNumber: 'AT201',
    airline: 'Royal Air Maroc',
    arrivalAirport: 'Casablanca Mohammed V (CMN) Terminal 2',
    arrivalDateTime: '2026-10-31T18:45:00Z',
    driverName: 'Abdelkader Driver (AIESEC Van)',
    greeterVolunteerName: 'Yassine Alami (VP CXP Officer)',
    accommodationAddress: '14 Rue Oukaimeden, Agdal, Rabat (Dar Zellige)',
    day1AccompanimentOfficer: 'Amina Benali (VP CXP)',
    status: 'PICKUP_SCHEDULED',
    emergencyContact: '+57 310 882 1904',
  },
  {
    id: 'pck_002',
    epId: 'ep_2026_077',
    epName: 'Lukas Schneider',
    product: 'iGTa',
    flightNumber: 'LH1330',
    airline: 'Lufthansa',
    arrivalAirport: 'Rabat-Salé Airport (RBA)',
    arrivalDateTime: '2027-01-04T13:15:00Z',
    driverName: 'Mustapha Driver',
    greeterVolunteerName: 'Sara Kabbaj (BD Host)',
    accommodationAddress: 'Avenue Allal Al Fassi, Souissi, Rabat',
    day1AccompanimentOfficer: 'Sara Kabbaj',
    status: 'FLIGHT_PENDING',
    emergencyContact: '+49 176 9928 3411',
  },
];

export const INITIAL_CASES: CaseSolvingRecord[] = [
  {
    id: 'cas_001',
    caseNumber: 'CASE-2026-004',
    epId: 'ep_2026_081',
    epName: 'Sofia Martinez',
    entityName: 'LC Rabat & BMCE Bank Foundation',
    tier: 'TIER_1_LOCAL',
    category: 'ACCOMMODATION_BREACH',
    severity: 'MEDIUM',
    summary: 'Water heater malfunction in Agdal host flat during first week of stay. Host notified.',
    assignedInvestigator: 'Amina Benali (VP CXP)',
    openedAt: '2026-10-27T09:00:00Z',
    escalationDeadline: '2026-10-30T09:00:00Z', // 72-hour SLA
    status: 'OPEN_INVESTIGATION',
    isRestrictedConfidential: true,
  },
];
