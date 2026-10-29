/**
 * Official Exchange Participant (EP) Data Contracts & Roster
 * Complies with:
 * - AIESEC Exchange Program Policies (AEPP 4.2.1, 4.4.2, 4.4.3, 4.5.4)
 * - APIP 5.3.5.1 (±20 days realization start window)
 * - Moroccan Passport Validity Rule (valid >= slotEndDate + 180 days)
 * - Age restriction (18..30)
 */

export interface EpTouchpointEntry {
  id: string;
  date: string;
  moodScore: number; // 1 to 5
  hoursOk: boolean;
  housingOk: boolean;
  mooMetrics: string;
  notes: string;
  loggedBy: string;
}

export interface EpStandardDeliveryState {
  internalDelivered: boolean;
  evidenceUrl?: string;
  deliveryDate?: string;
  expaSurveyAnswer?: 'PENDING' | 'YES' | 'NO';
  discrepancyFlag?: boolean;
}

export interface EPRecord {
  id: string;
  expa_ep_id: string;
  expaPersonId?: number;
  lc_id: string;

  // Identity & Contact (Atomic)
  full_name: string;
  fullName?: string;
  dob?: string; // YYYY-MM-DD (Age 18..30)
  email: string;
  phone: string;
  whatsappPhone?: string;
  nationality: string;
  residenceCountry?: string;
  hasSchengenOrUkOrUsPermit?: boolean;

  // Passport (Atomic)
  passportNumber?: string;
  passportExpiryDate?: string; // Valid >= slotEndDate + 180 days

  // Sending IR Partner Linkage
  home_lc: string;
  home_mc: string;
  sendingIrId?: string; // Foreign key to INITIAL_IR_PARTNERS
  sePocName?: string;
  sePocPhone?: string;

  // Opportunity & Host
  product: 'iGV' | 'iGTa' | 'iGTe';
  status: 'APPLIED' | 'ACCEPTED' | 'APPROVED' | 'REALIZED' | 'FINISHED' | 'COMPLETED' | 'REJECTED' | 'WITHDRAWN' | 'APPROVAL_BROKEN' | 'REALIZATION_BROKEN';
  opportunity_id: string;
  opportunity_title: string;
  partner_organization_name: string;
  host_manager_id: string;
  host_manager_name: string;
  start_date: string;
  end_date: string;

  // Arrival & Logistics (Atomic)
  arrivalDate?: string;
  arrivalTime?: string;
  arrivalPort?: 'CMN' | 'RBA' | 'RABAT_AGDAL' | 'RABAT_VILLE' | 'TANGIER';
  flightNumber?: string;
  accommProviderId?: string;
  bedId?: string;
  pickupBuddyUserId?: string;
  epManagerUserId?: string;

  // Statutory Timestamps for Date-Math SLA Timers
  appliedAt?: string;
  firstContactedAt?: string;
  acceptedAt?: string;
  approvedAt?: string;
  heVisaPackSentAt?: string;
  epVisaAppliedAt?: string;
  op14dConfirmedAt?: string;
  accomm14dConfirmedAt?: string;
  pickup3dGuideSentAt?: string;
  realizedAt?: string;
  finishedAt?: string;
  completedAt?: string;
  lastContactAt?: string;

  // Visas & Care
  visa_status: 'NOT_REQUIRED' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  insurance_verified: boolean;
  pickup_confirmed: boolean;

  // Exception / Break Tracking (AEPP 4.2.3.5 / Annex 2)
  unjustifiedRejection?: boolean;
  rejectionReason?: string;
  withdrawalReason?: string;
  breakReason?: string;
  qualityCaseId?: string;

  // Delivery Standards & Regular Touchpoints (Standard #17)
  standardsDelivery?: Record<string, EpStandardDeliveryState>;
  touchpoints?: EpTouchpointEntry[];

  created_at: string;
  updated_at: string;
}

export const INITIAL_EPS: EPRecord[] = [
  {
    id: 'ep_2026_081',
    expa_ep_id: 'EXPA-892144',
    expaPersonId: 892144,
    lc_id: 'lc_rabat',
    full_name: 'Sofia Martinez',
    fullName: 'Sofia Martinez',
    dob: '2001-04-18', // Age 25
    email: 'sofia.martinez@email.com',
    phone: '+57 310 882 1904',
    whatsappPhone: '+57 310 882 1904',
    nationality: 'Colombia',
    residenceCountry: 'CO',
    passportNumber: 'CO-9921844',
    passportExpiryDate: '2028-10-15', // Well beyond slotEnd + 180d
    home_lc: 'AIESEC in Bogota UniAndes',
    home_mc: 'Colombia',
    sendingIrId: 'ir_003',
    sePocName: 'Camila Rodriguez',
    sePocPhone: '+57 310 882 1904',
    product: 'iGV',
    status: 'APPROVED',
    opportunity_id: 'opp-1',
    opportunity_title: 'Youth Digital Literacy & Coding Coach',
    partner_organization_name: 'BMCE Bank Foundation',
    host_manager_id: 'usr_cxp_01',
    host_manager_name: 'Amina Benali',
    epManagerUserId: 'usr_cxp_01',
    pickupBuddyUserId: 'mem_004',
    start_date: '2026-11-01',
    end_date: '2026-12-15',
    arrivalDate: '2026-10-31',
    arrivalTime: '14:20',
    arrivalPort: 'CMN',
    flightNumber: 'AT 781 (RAM)',
    accommProviderId: 'acc_001',
    bedId: 'bed_agdal_03',
    visa_status: 'APPROVED',
    insurance_verified: true,
    pickup_confirmed: true,
    appliedAt: '2026-09-20T10:00:00Z',
    firstContactedAt: '2026-09-21T09:00:00Z',
    acceptedAt: '2026-09-28T14:00:00Z',
    approvedAt: '2026-10-02T16:00:00Z',
    heVisaPackSentAt: '2026-10-05T11:00:00Z',
    epVisaAppliedAt: '2026-10-10T10:00:00Z',
    op14dConfirmedAt: '2026-10-15T10:00:00Z',
    accomm14dConfirmedAt: '2026-10-16T12:00:00Z',
    pickup3dGuideSentAt: '2026-10-28T09:00:00Z',
    lastContactAt: '2026-10-28T16:00:00Z',
    standardsDelivery: {
      '1': { internalDelivered: true, expaSurveyAnswer: 'YES' },
      '2': { internalDelivered: true, expaSurveyAnswer: 'YES' },
      '3': { internalDelivered: true, expaSurveyAnswer: 'YES' },
      '4': { internalDelivered: true, evidenceUrl: 'https://docs.aiesec.org/sofia-expectations.pdf', expaSurveyAnswer: 'YES' },
      '5': { internalDelivered: true, evidenceUrl: 'https://docs.aiesec.org/sofia-visa.pdf', expaSurveyAnswer: 'YES' },
      '6': { internalDelivered: true, evidenceUrl: 'https://docs.aiesec.org/sofia-pickup.pdf', expaSurveyAnswer: 'YES' },
      '7': { internalDelivered: true, evidenceUrl: 'https://docs.aiesec.org/sofia-housing.pdf', expaSurveyAnswer: 'YES' },
      '8': { internalDelivered: true, evidenceUrl: 'https://docs.aiesec.org/sofia-ips.pdf', expaSurveyAnswer: 'PENDING' },
      '9': { internalDelivered: false, expaSurveyAnswer: 'PENDING' },
      '10a': { internalDelivered: false, expaSurveyAnswer: 'PENDING' },
      '10b': { internalDelivered: false, expaSurveyAnswer: 'PENDING' },
      '11': { internalDelivered: false, expaSurveyAnswer: 'PENDING' },
      '12': { internalDelivered: false, expaSurveyAnswer: 'PENDING' },
      '13': { internalDelivered: false, expaSurveyAnswer: 'PENDING' },
      '14': { internalDelivered: false, expaSurveyAnswer: 'PENDING' },
      '15': { internalDelivered: false, expaSurveyAnswer: 'PENDING' },
      '16': { internalDelivered: false, expaSurveyAnswer: 'PENDING' },
      '17': { internalDelivered: false, expaSurveyAnswer: 'PENDING' },
      '18': { internalDelivered: false, expaSurveyAnswer: 'PENDING' },
    },
    touchpoints: [
      {
        id: 'tp_01',
        date: '2026-10-28',
        moodScore: 5,
        hoursOk: true,
        housingOk: true,
        mooMetrics: 'Pre-departure packing completed, SIM and arrival confirmed.',
        notes: 'EP excited to arrive in Casablanca/Rabat.',
        loggedBy: 'Amina Benali',
      },
    ],
    created_at: '2026-10-10T11:00:00Z',
    updated_at: '2026-10-28T16:00:00Z',
  },
  {
    id: 'ep_2026_077',
    expa_ep_id: 'EXPA-884210',
    expaPersonId: 884210,
    lc_id: 'lc_rabat',
    full_name: 'Lukas Schneider',
    fullName: 'Lukas Schneider',
    dob: '1999-08-12', // Age 27
    email: 'lukas.schneider@tum.de',
    phone: '+49 176 9928 3411',
    whatsappPhone: '+49 176 9928 3411',
    nationality: 'Germany',
    residenceCountry: 'DE',
    passportNumber: 'DE-C229811',
    passportExpiryDate: '2029-05-20',
    home_lc: 'AIESEC in Munich',
    home_mc: 'Germany',
    sendingIrId: 'ir_001',
    sePocName: 'Maximilian Weber',
    sePocPhone: '+49 176 9928 3411',
    product: 'iGTa',
    status: 'APPROVED',
    opportunity_id: 'opp-3',
    opportunity_title: 'Fullstack React & Node.js Software Engineer',
    partner_organization_name: 'Casatech Innovation Labs',
    host_manager_id: 'usr_bd_02',
    host_manager_name: 'Sara Kabbaj',
    epManagerUserId: 'usr_bd_02',
    pickupBuddyUserId: 'mem_005',
    start_date: '2027-01-05',
    end_date: '2027-07-05',
    arrivalDate: '2027-01-03',
    arrivalTime: '18:40',
    arrivalPort: 'CMN',
    flightNumber: 'LH 1330',
    accommProviderId: 'acc_002',
    bedId: 'bed_rabat_01',
    visa_status: 'SUBMITTED',
    insurance_verified: true,
    pickup_confirmed: false,
    appliedAt: '2026-09-15T09:00:00Z',
    firstContactedAt: '2026-09-16T10:00:00Z',
    acceptedAt: '2026-09-25T11:00:00Z',
    approvedAt: '2026-10-05T15:00:00Z',
    heVisaPackSentAt: '2026-10-12T14:00:00Z',
    epVisaAppliedAt: '2026-10-18T09:00:00Z',
    lastContactAt: '2026-10-25T11:00:00Z',
    standardsDelivery: {
      '1': { internalDelivered: true, expaSurveyAnswer: 'YES' },
      '2': { internalDelivered: true, expaSurveyAnswer: 'YES' },
      '3': { internalDelivered: true, expaSurveyAnswer: 'YES' },
      '4': { internalDelivered: true, evidenceUrl: 'https://docs.aiesec.org/lukas-expectations.pdf', expaSurveyAnswer: 'YES' },
      '5': { internalDelivered: true, evidenceUrl: 'https://docs.aiesec.org/lukas-visa.pdf', expaSurveyAnswer: 'YES' },
    },
    touchpoints: [],
    created_at: '2026-10-05T09:00:00Z',
    updated_at: '2026-10-25T14:30:00Z',
  },
  {
    id: 'ep_2026_065',
    expa_ep_id: 'EXPA-871109',
    expaPersonId: 871109,
    lc_id: 'lc_rabat',
    full_name: 'Elif Demir',
    fullName: 'Elif Demir',
    dob: '2000-02-24', // Age 26
    email: 'elif.demir@ege.edu.tr',
    phone: '+90 532 441 89 20',
    whatsappPhone: '+90 532 441 89 20',
    nationality: 'Turkey',
    residenceCountry: 'TR',
    passportNumber: 'TR-U889100',
    passportExpiryDate: '2028-01-10',
    home_lc: 'AIESEC in Izmir',
    home_mc: 'Turkey',
    sendingIrId: 'ir_002',
    sePocName: 'Elif Yilmaz',
    sePocPhone: '+90 532 441 89 20',
    product: 'iGTe',
    status: 'REALIZED',
    opportunity_id: 'opp-2',
    opportunity_title: 'STEM & Robotics Teaching Assistant',
    partner_organization_name: 'Rabat American School',
    host_manager_id: 'usr_cxp_01',
    host_manager_name: 'Amina Benali',
    epManagerUserId: 'usr_cxp_01',
    pickupBuddyUserId: 'mem_004',
    start_date: '2026-09-15',
    end_date: '2026-12-15',
    arrivalDate: '2026-09-13',
    arrivalTime: '11:15',
    arrivalPort: 'RBA',
    flightNumber: 'TK 619',
    accommProviderId: 'acc_001',
    bedId: 'bed_agdal_01',
    visa_status: 'APPROVED',
    insurance_verified: true,
    pickup_confirmed: true,
    appliedAt: '2026-08-01T10:00:00Z',
    acceptedAt: '2026-08-10T14:00:00Z',
    approvedAt: '2026-08-15T16:00:00Z',
    heVisaPackSentAt: '2026-08-18T10:00:00Z',
    epVisaAppliedAt: '2026-08-22T09:00:00Z',
    realizedAt: '2026-09-15T09:00:00Z',
    lastContactAt: '2026-10-27T10:00:00Z',
    standardsDelivery: {
      '1': { internalDelivered: true, expaSurveyAnswer: 'YES' },
      '2': { internalDelivered: true, expaSurveyAnswer: 'YES' },
      '3': { internalDelivered: true, expaSurveyAnswer: 'YES' },
      '4': { internalDelivered: true, expaSurveyAnswer: 'YES' },
      '5': { internalDelivered: true, expaSurveyAnswer: 'YES' },
      '6': { internalDelivered: true, expaSurveyAnswer: 'YES' },
      '7': { internalDelivered: true, expaSurveyAnswer: 'YES' },
      '8': { internalDelivered: true, expaSurveyAnswer: 'YES' },
      '9': { internalDelivered: true, expaSurveyAnswer: 'YES' },
      '10a': { internalDelivered: true, evidenceUrl: 'https://docs.aiesec.org/elif-op-alignment-middle.pdf', expaSurveyAnswer: 'YES' },
      '10b': { internalDelivered: false, expaSurveyAnswer: 'PENDING' },
      '11': { internalDelivered: true, expaSurveyAnswer: 'YES' },
      '12': { internalDelivered: true, expaSurveyAnswer: 'YES' },
      '13': { internalDelivered: true, expaSurveyAnswer: 'YES' },
      '14': { internalDelivered: true, expaSurveyAnswer: 'YES' },
      '15': { internalDelivered: true, expaSurveyAnswer: 'YES' },
      '16': { internalDelivered: false, expaSurveyAnswer: 'PENDING' },
      '17': { internalDelivered: true, expaSurveyAnswer: 'YES' },
      '18': { internalDelivered: false, expaSurveyAnswer: 'PENDING' },
    },
    touchpoints: [
      {
        id: 'tp_elif_01',
        date: '2026-09-28',
        moodScore: 4,
        hoursOk: true,
        housingOk: true,
        mooMetrics: 'Completed first week of robotics tutoring.',
        notes: 'Students engaged, good collaboration with supervisor.',
        loggedBy: 'Amina Benali',
      },
      {
        id: 'tp_elif_02',
        date: '2026-10-12',
        moodScore: 5,
        hoursOk: true,
        housingOk: true,
        mooMetrics: 'Led intermediate LEGO Mindstorms challenge.',
        notes: 'Middle school staff praised curriculum delivery.',
        loggedBy: 'Amina Benali',
      },
      {
        id: 'tp_elif_03',
        date: '2026-10-26',
        moodScore: 5,
        hoursOk: true,
        housingOk: true,
        mooMetrics: 'Mid-term project showcase with parents.',
        notes: 'All standards in compliance.',
        loggedBy: 'Amina Benali',
      },
    ],
    created_at: '2026-08-20T10:00:00Z',
    updated_at: '2026-10-27T10:00:00Z',
  },
  {
    id: 'ep_2026_090',
    expa_ep_id: 'EXPA-899120',
    expaPersonId: 899120,
    lc_id: 'lc_rabat',
    full_name: 'Lucas Silva',
    fullName: 'Lucas Silva',
    dob: '2002-07-19', // Age 24
    email: 'lucas.silva@usp.br',
    phone: '+55 11 98765 4321',
    whatsappPhone: '+55 11 98765 4321',
    nationality: 'Brazil',
    residenceCountry: 'BR',
    passportNumber: 'BR-FP882190',
    passportExpiryDate: '2028-11-20',
    home_lc: 'AIESEC in São Paulo',
    home_mc: 'Brazil',
    sendingIrId: 'ir_003',
    sePocName: 'Thiago Mendes',
    sePocPhone: '+55 11 99882 1100',
    product: 'iGTa',
    status: 'ACCEPTED',
    opportunity_id: 'opp-3',
    opportunity_title: 'Fullstack React & Node.js Software Engineer',
    partner_organization_name: 'Casatech Innovation Labs',
    host_manager_id: 'usr_bd_02',
    host_manager_name: 'Sara Kabbaj',
    epManagerUserId: 'usr_bd_02',
    start_date: '2027-01-05',
    end_date: '2027-07-05',
    visa_status: 'NOT_REQUIRED',
    insurance_verified: false,
    pickup_confirmed: false,
    appliedAt: '2026-10-22T15:00:00Z',
    firstContactedAt: '2026-10-23T10:00:00Z',
    acceptedAt: '2026-10-26T18:00:00Z',
    created_at: '2026-10-22T15:00:00Z',
    updated_at: '2026-10-26T18:00:00Z',
  },
];
