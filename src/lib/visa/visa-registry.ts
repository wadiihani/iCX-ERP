/**
 * Human-Verified Visa Registry & Expiry Reminders Engine
 * Statutory Baseline: HUB-VISA-01, APIP/AEPP Visa Compliance, Official Morocco Entry Regulations
 * 
 * Invariants:
 * 1. AI or automated systems CANNOT grant travel clearance. Human verification is strictly required.
 * 2. Passport must remain valid at least 6 months (180 days) past the planned exchange departure date.
 * 3. Required visa lead times (14d Visa-Free, 21d AEVM eVisa, 45d Consular) compute urgent filing deadlines.
 */

import { resolveMoroccanVisaRegime, type MoroccanVisaRegime } from '../ir/moroccan-visa-matrix';

export type HumanVerificationStatus =
  | 'NEEDS_VERIFICATION'
  | 'VERIFIED_HUMAN'
  | 'NOT_REQUIRED'
  | 'BLOCKED';

export interface HumanVerifiedVisaRecord {
  id: string;
  epId: string;
  epName: string;
  passportNumber: string;
  nationalityCountry: string;
  residenceCountry: string;
  moroccanRegime: MoroccanVisaRegime;
  leadTimeDays: number;
  officialSourceUrl: string;
  
  // Travel dates
  arrivalDate: string; // YYYY-MM-DD
  departureDate: string; // YYYY-MM-DD
  passportExpiryDate: string; // YYYY-MM-DD
  
  // Verification details (Must be filled by human officer)
  verificationStatus: HumanVerificationStatus;
  humanVerifierName: string | null;
  humanVerifierRole: string | null;
  verifiedAt: string | null;
  verificationNotes: string;
  
  // Calculated compliance fields
  daysUntilPassportExpiry: number;
  isPassportValid180DaysPostDeparture: boolean;
  daysUntilArrival: number;
  filingDeadlineDate: string; // YYYY-MM-DD
  isFilingDeadlinePassed: boolean;
  isTravelCleared: boolean;
}

/**
 * Creates or computes a verified visa record from EP details.
 */
export function buildVisaRecord(params: {
  id?: string;
  epId: string;
  epName: string;
  passportNumber: string;
  nationalityCountry: string;
  residenceCountry: string;
  arrivalDate: string;
  departureDate: string;
  passportExpiryDate: string;
  verificationStatus?: HumanVerificationStatus;
  humanVerifierName?: string | null;
  humanVerifierRole?: string | null;
  verifiedAt?: string | null;
  verificationNotes?: string;
  currentDate?: Date;
}): HumanVerifiedVisaRecord {
  const now = params.currentDate || new Date();
  const currentMs = now.getTime();
  
  const regimeInfo = resolveMoroccanVisaRegime({
    nationalityCountry: params.nationalityCountry,
    residenceCountry: params.residenceCountry,
  });
  
  // Calculate passport validity post departure
  const departureMs = new Date(params.departureDate).getTime();
  const passportExpiryMs = new Date(params.passportExpiryDate).getTime();
  const daysPostDeparture = Math.floor((passportExpiryMs - departureMs) / (1000 * 60 * 60 * 24));
  const isPassportValid180Days = daysPostDeparture >= 180;
  
  // Days until passport expires from today
  const daysUntilPassportExpiry = Math.floor((passportExpiryMs - currentMs) / (1000 * 60 * 60 * 24));
  
  // Days until arrival
  const arrivalMs = new Date(params.arrivalDate).getTime();
  const daysUntilArrival = Math.floor((arrivalMs - currentMs) / (1000 * 60 * 60 * 24));
  
  // Filing deadline = arrivalDate - leadTimeDays
  const leadTime = regimeInfo.leadTimeDaysRequired || 21;
  const deadlineMs = arrivalMs - leadTime * 24 * 60 * 60 * 1000;
  const filingDeadlineDate = !isNaN(deadlineMs) ? new Date(deadlineMs).toISOString().slice(0, 10) : params.arrivalDate;
  const isFilingDeadlinePassed = currentMs > deadlineMs;
  
  const status = params.verificationStatus || (
    regimeInfo.regime === 'VISA_FREE_90D' ? 'NOT_REQUIRED' : 'NEEDS_VERIFICATION'
  );
  
  const isTravelCleared = (status === 'VERIFIED_HUMAN' || status === 'NOT_REQUIRED') && isPassportValid180Days;

  return {
    id: params.id || `visa_${params.epId}`,
    epId: params.epId,
    epName: params.epName,
    passportNumber: params.passportNumber,
    nationalityCountry: params.nationalityCountry,
    residenceCountry: params.residenceCountry,
    moroccanRegime: regimeInfo.regime,
    leadTimeDays: leadTime,
    officialSourceUrl: regimeInfo.officialInstructions.includes('acces-maroc.ma') ? 'https://www.acces-maroc.ma' : 'https://www.diplomatie.ma',
    arrivalDate: params.arrivalDate,
    departureDate: params.departureDate,
    passportExpiryDate: params.passportExpiryDate,
    verificationStatus: status,
    humanVerifierName: params.humanVerifierName || null,
    humanVerifierRole: params.humanVerifierRole || null,
    verifiedAt: params.verifiedAt || null,
    verificationNotes: params.verificationNotes || '',
    daysUntilPassportExpiry,
    isPassportValid180DaysPostDeparture: isPassportValid180Days,
    daysUntilArrival,
    filingDeadlineDate,
    isFilingDeadlinePassed,
    isTravelCleared,
  };
}

/**
 * Executes Human Verification of travel clearance (Rule: Zero automated clearance).
 */
export function executeHumanVisaVerification(
  record: HumanVerifiedVisaRecord,
  params: {
    verifierName: string;
    verifierRole: string;
    newStatus: 'VERIFIED_HUMAN' | 'BLOCKED';
    notes: string;
    currentDate?: Date;
  }
): HumanVerifiedVisaRecord {
  if (!params.verifierName.trim()) {
    throw new Error('HUB-VISA-01 Statutory Violation: Verifier name is mandatory for human visa sign-off.');
  }

  const now = params.currentDate || new Date();
  const isCleared = params.newStatus === 'VERIFIED_HUMAN' && record.isPassportValid180DaysPostDeparture;

  return {
    ...record,
    verificationStatus: params.newStatus,
    humanVerifierName: params.verifierName.trim(),
    humanVerifierRole: params.verifierRole.trim(),
    verifiedAt: now.toISOString(),
    verificationNotes: params.notes.trim(),
    isTravelCleared: isCleared,
  };
}

/**
 * Baseline mock data for Human-Verified Visa Registry.
 */
export const INITIAL_VISA_RECORDS: HumanVerifiedVisaRecord[] = [
  buildVisaRecord({
    id: 'visa_081',
    epId: 'ep_2026_081',
    epName: 'Sofia Martinez',
    passportNumber: 'COL-88912304',
    nationalityCountry: 'Colombia',
    residenceCountry: 'Colombia',
    arrivalDate: '2026-11-15',
    departureDate: '2026-12-27',
    passportExpiryDate: '2028-04-10', // Plenty of validity
    verificationStatus: 'VERIFIED_HUMAN',
    humanVerifierName: 'Amina Benali',
    humanVerifierRole: 'VP CXP',
    verifiedAt: '2026-10-24T14:30:00Z',
    verificationNotes: 'AEVM eVisa application approved by Moroccan Ministry of Foreign Affairs (MAE). Copy filed in dossier.',
  }),
  buildVisaRecord({
    id: 'visa_077',
    epId: 'ep_2026_077',
    epName: 'Amara Diop',
    passportNumber: 'SEN-34201992',
    nationalityCountry: 'Senegal',
    residenceCountry: 'Senegal',
    arrivalDate: '2026-11-20',
    departureDate: '2027-01-05',
    passportExpiryDate: '2027-09-15',
    verificationStatus: 'NOT_REQUIRED',
    humanVerifierName: 'Yassine Alami',
    humanVerifierRole: 'VP iGV',
    verifiedAt: '2026-10-25T11:00:00Z',
    verificationNotes: 'Senegal enjoys 90-day bilateral visa exemption with Morocco. Verified on MAE portal.',
  }),
  buildVisaRecord({
    id: 'visa_065',
    epId: 'ep_2026_065',
    epName: 'Elif Demir',
    passportNumber: 'TUR-99823101',
    nationalityCountry: 'Turkey',
    residenceCountry: 'Turkey',
    arrivalDate: '2026-11-25',
    departureDate: '2027-02-15',
    passportExpiryDate: '2027-10-30',
    verificationStatus: 'NOT_REQUIRED',
    humanVerifierName: 'Amina Benali',
    humanVerifierRole: 'VP CXP',
    verifiedAt: '2026-10-25T15:20:00Z',
    verificationNotes: 'Turkey bilateral visa exemption (90 days).',
  }),
  buildVisaRecord({
    id: 'visa_090',
    epId: 'ep_2026_090',
    epName: 'Lucas Silva',
    passportNumber: 'BRA-55419088',
    nationalityCountry: 'Brazil',
    residenceCountry: 'Brazil',
    arrivalDate: '2026-12-01',
    departureDate: '2027-03-01',
    passportExpiryDate: '2027-11-15',
    verificationStatus: 'NOT_REQUIRED',
    humanVerifierName: 'Mehdi Benjelloun',
    humanVerifierRole: 'VP BD',
    verifiedAt: '2026-10-26T09:00:00Z',
    verificationNotes: 'Brazil bilateral visa-free entry.',
  }),
  buildVisaRecord({
    id: 'visa_099',
    epId: 'ep_2026_099',
    epName: 'Jean-Paul Kamga',
    passportNumber: 'CMR-77123490',
    nationalityCountry: 'Cameroon',
    residenceCountry: 'Cameroon',
    arrivalDate: '2026-12-10',
    departureDate: '2027-03-15',
    passportExpiryDate: '2027-05-01', // Short validity warning! Only 47 days after departure
    verificationStatus: 'NEEDS_VERIFICATION',
    verificationNotes: 'Cameroon requires Consular Embassy Visa in Yaounde (45-day lead time). Formal invitation letter dispatched.',
  }),
];
