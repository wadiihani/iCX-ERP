/**
 * Moroccan Statutory Visa Regime Matrix
 * Baseline: REQ-032, THR-047, and TEST-041
 */

export type MoroccanVisaRegime =
  | 'VISA_EXEMPT' // 90 days visa-free entry
  | 'AEVM_EVISA' // eVisa / Accès Électronique aux Visas pour le Maroc
  | 'CONSULAR_VISA'; // Traditional consular visa requiring Embassy application

export interface VisaRegimeInfo {
  countryCode: string;
  countryName: string;
  regime: MoroccanVisaRegime;
  estimatedProcessingDays: number;
  requiresInvitationPack: boolean;
  notes: string;
}

// Statutory Moroccan Entry Reference (Direction Générale de la Sûreté Nationale / Ministère des Affaires Étrangères)
const VISA_REGIMES: Record<string, { name: string; regime: MoroccanVisaRegime; days: number }> = {
  // Visa Exempt (selection of major AIESEC sending countries)
  FR: { name: 'France', regime: 'VISA_EXEMPT', days: 0 },
  DE: { name: 'Germany', regime: 'VISA_EXEMPT', days: 0 },
  ES: { name: 'Spain', regime: 'VISA_EXEMPT', days: 0 },
  IT: { name: 'Italy', regime: 'VISA_EXEMPT', days: 0 },
  GB: { name: 'United Kingdom', regime: 'VISA_EXEMPT', days: 0 },
  US: { name: 'United States', regime: 'VISA_EXEMPT', days: 0 },
  CA: { name: 'Canada', regime: 'VISA_EXEMPT', days: 0 },
  BR: { name: 'Brazil', regime: 'VISA_EXEMPT', days: 0 },
  TR: { name: 'Turkey', regime: 'VISA_EXEMPT', days: 0 },
  TN: { name: 'Tunisia', regime: 'VISA_EXEMPT', days: 0 },
  SN: { name: 'Senegal', regime: 'VISA_EXEMPT', days: 0 },
  CI: { name: "Côte d'Ivoire", regime: 'VISA_EXEMPT', days: 0 },
  JP: { name: 'Japan', regime: 'VISA_EXEMPT', days: 0 },
  KR: { name: 'South Korea', regime: 'VISA_EXEMPT', days: 0 },
  RO: { name: 'Romania', regime: 'VISA_EXEMPT', days: 0 },
  PL: { name: 'Poland', regime: 'VISA_EXEMPT', days: 0 },

  // AEVM / eVisa Eligible Nationalities
  IN: { name: 'India', regime: 'AEVM_EVISA', days: 3 },
  EG: { name: 'Egypt', regime: 'AEVM_EVISA', days: 3 },
  JO: { name: 'Jordan', regime: 'AEVM_EVISA', days: 3 },
  TH: { name: 'Thailand', regime: 'AEVM_EVISA', days: 3 },

  // Consular Visa Nationalities (Require formal host LC Visa Invitation Pack)
  CM: { name: 'Cameroon', regime: 'CONSULAR_VISA', days: 25 },
  CD: { name: 'DR Congo', regime: 'CONSULAR_VISA', days: 30 },
  NG: { name: 'Nigeria', regime: 'CONSULAR_VISA', days: 30 },
  PK: { name: 'Pakistan', regime: 'CONSULAR_VISA', days: 35 },
  BD: { name: 'Bangladesh', regime: 'CONSULAR_VISA', days: 35 },
  GH: { name: 'Ghana', regime: 'CONSULAR_VISA', days: 30 },
  DZ: { name: 'Algeria', regime: 'VISA_EXEMPT', days: 0 },
};

/**
 * Looks up statutory Moroccan visa regime for a country code.
 */
export function getMoroccanVisaRegime(countryCode: string): VisaRegimeInfo {
  const code = countryCode.trim().toUpperCase();
  const entry = VISA_REGIMES[code];

  if (!entry) {
    // Default unlisted countries to consular visa for statutory safety
    return {
      countryCode: code,
      countryName: code,
      regime: 'CONSULAR_VISA',
      estimatedProcessingDays: 30,
      requiresInvitationPack: true,
      notes: 'Unlisted territory: Consular visa required. Official Host LC Visa Invitation Pack mandatory.',
    };
  }

  return {
    countryCode: code,
    countryName: entry.name,
    regime: entry.regime,
    estimatedProcessingDays: entry.days,
    requiresInvitationPack: entry.regime === 'CONSULAR_VISA',
    notes:
      entry.regime === 'VISA_EXEMPT'
        ? '90-day visa-free entry for tourism and youth exchange. Valid passport required.'
        : entry.regime === 'AEVM_EVISA'
        ? 'Eligible for Moroccan eVisa (Accès Électronique aux Visas pour le Maroc) with valid US/UK/Schengen visa or direct eVisa application.'
        : 'Consular visa required via Moroccan Embassy. Host LC must issue official stamped Visa Invitation Pack.',
  };
}

/**
 * Checks statutory lead time for consular visas (THR-047 / TEST-041).
 * Consular visas require at least 30 days between approval and realization start date.
 */
export function checkVisaLeadTime(
  countryCode: string,
  approvalDate: string, // ISO
  realizationStartDate: string // ISO
): { isCompliant: boolean; daysDifference: number; warning?: string } {
  const regimeInfo = getMoroccanVisaRegime(countryCode);
  if (regimeInfo.regime !== 'CONSULAR_VISA') {
    return { isCompliant: true, daysDifference: 999 };
  }

  const approvalMs = new Date(approvalDate).getTime();
  const startMs = new Date(realizationStartDate).getTime();
  const daysDifference = Math.floor((startMs - approvalMs) / (1000 * 60 * 60 * 24));

  // Statutory 30-day minimum lead time per THR-047
  const isCompliant = daysDifference >= 30;

  return {
    isCompliant,
    daysDifference,
    warning: isCompliant
      ? undefined
      : `Statutory Lead Time Warning THR-047 (TEST-041): Applicant from ${regimeInfo.countryName} requires a Consular Visa, which mandates at least 30 days processing lead time. Current lead time is only ${daysDifference} days before scheduled arrival (${realizationStartDate}). High risk of visa refusal or delayed flight.`,
  };
}
