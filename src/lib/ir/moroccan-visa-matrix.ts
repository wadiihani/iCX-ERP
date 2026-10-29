/**
 * Moroccan Statutory Visa Regime Matrix & Resolver
 * Official Moroccan Ministry of Foreign Affairs (MAEC) & DGSN Regulations
 * Implements:
 * - HUB-VISA-01 / CHG-26: Dual Resolution (Nationality + Residence Permit)
 * - Minimum statutory lead times: 14d (Visa-Free), 21d (AEVM eVisa), 45d (Consular Visa)
 */

export type MoroccanVisaRegime =
  | 'VISA_EXEMPT' // Legacy
  | 'VISA_FREE_90D'
  | 'AEVM_EVISA'
  | 'CONSULAR_VISA' // Legacy
  | 'CONSULAR_EMBASSY_VISA';

export interface CountryEntry {
  code: string;
  name: string;
  nationalityName: string;
  regime: 'VISA_FREE_90D' | 'AEVM_EVISA' | 'CONSULAR_EMBASSY_VISA';
  standardLeadDays: number;
}

export const SEARCHABLE_COUNTRIES_CATALOG: CountryEntry[] = [
  // Visa Free (Selection of 90-day bilateral agreements)
  { code: 'FR', name: 'France', nationalityName: 'French', regime: 'VISA_FREE_90D', standardLeadDays: 14 },
  { code: 'DE', name: 'Germany', nationalityName: 'German', regime: 'VISA_FREE_90D', standardLeadDays: 14 },
  { code: 'ES', name: 'Spain', nationalityName: 'Spanish', regime: 'VISA_FREE_90D', standardLeadDays: 14 },
  { code: 'IT', name: 'Italy', nationalityName: 'Italian', regime: 'VISA_FREE_90D', standardLeadDays: 14 },
  { code: 'GB', name: 'United Kingdom', nationalityName: 'British', regime: 'VISA_FREE_90D', standardLeadDays: 14 },
  { code: 'US', name: 'United States', nationalityName: 'American', regime: 'VISA_FREE_90D', standardLeadDays: 14 },
  { code: 'CA', name: 'Canada', nationalityName: 'Canadian', regime: 'VISA_FREE_90D', standardLeadDays: 14 },
  { code: 'BR', name: 'Brazil', nationalityName: 'Brazilian', regime: 'VISA_FREE_90D', standardLeadDays: 14 },
  { code: 'TR', name: 'Turkey', nationalityName: 'Turkish', regime: 'VISA_FREE_90D', standardLeadDays: 14 },
  { code: 'TN', name: 'Tunisia', nationalityName: 'Tunisian', regime: 'VISA_FREE_90D', standardLeadDays: 14 },
  { code: 'SN', name: 'Senegal', nationalityName: 'Senegalese', regime: 'VISA_FREE_90D', standardLeadDays: 14 },
  { code: 'CI', name: "Côte d'Ivoire", nationalityName: 'Ivorian', regime: 'VISA_FREE_90D', standardLeadDays: 14 },
  { code: 'JP', name: 'Japan', nationalityName: 'Japanese', regime: 'VISA_FREE_90D', standardLeadDays: 14 },
  { code: 'KR', name: 'South Korea', nationalityName: 'South Korean', regime: 'VISA_FREE_90D', standardLeadDays: 14 },
  { code: 'RO', name: 'Romania', nationalityName: 'Romanian', regime: 'VISA_FREE_90D', standardLeadDays: 14 },
  { code: 'PL', name: 'Poland', nationalityName: 'Polish', regime: 'VISA_FREE_90D', standardLeadDays: 14 },
  { code: 'DZ', name: 'Algeria', nationalityName: 'Algerian', regime: 'VISA_FREE_90D', standardLeadDays: 14 },
  { code: 'BE', name: 'Belgium', nationalityName: 'Belgian', regime: 'VISA_FREE_90D', standardLeadDays: 14 },
  { code: 'NL', name: 'Netherlands', nationalityName: 'Dutch', regime: 'VISA_FREE_90D', standardLeadDays: 14 },
  { code: 'CH', name: 'Switzerland', nationalityName: 'Swiss', regime: 'VISA_FREE_90D', standardLeadDays: 14 },
  { code: 'PT', name: 'Portugal', nationalityName: 'Portuguese', regime: 'VISA_FREE_90D', standardLeadDays: 14 },
  { code: 'AT', name: 'Austria', nationalityName: 'Austrian', regime: 'VISA_FREE_90D', standardLeadDays: 14 },
  { code: 'CO', name: 'Colombia', nationalityName: 'Colombian', regime: 'VISA_FREE_90D', standardLeadDays: 14 },

  // AEVM / eVisa Direct Nationalities
  { code: 'IN', name: 'India', nationalityName: 'Indian', regime: 'AEVM_EVISA', standardLeadDays: 21 },
  { code: 'EG', name: 'Egypt', nationalityName: 'Egyptian', regime: 'AEVM_EVISA', standardLeadDays: 21 },
  { code: 'JO', name: 'Jordan', nationalityName: 'Jordanian', regime: 'AEVM_EVISA', standardLeadDays: 21 },
  { code: 'TH', name: 'Thailand', nationalityName: 'Thai', regime: 'AEVM_EVISA', standardLeadDays: 21 },
  { code: 'AZ', name: 'Azerbaijan', nationalityName: 'Azerbaijani', regime: 'AEVM_EVISA', standardLeadDays: 21 },
  { code: 'GT', name: 'Guatemala', nationalityName: 'Guatemalan', regime: 'AEVM_EVISA', standardLeadDays: 21 },

  // Consular / Embassy Visa Nationalities
  { code: 'CM', name: 'Cameroon', nationalityName: 'Cameroonian', regime: 'CONSULAR_EMBASSY_VISA', standardLeadDays: 45 },
  { code: 'CD', name: 'DR Congo', nationalityName: 'Congolese', regime: 'CONSULAR_EMBASSY_VISA', standardLeadDays: 45 },
  { code: 'NG', name: 'Nigeria', nationalityName: 'Nigerian', regime: 'CONSULAR_EMBASSY_VISA', standardLeadDays: 45 },
  { code: 'PK', name: 'Pakistan', nationalityName: 'Pakistani', regime: 'CONSULAR_EMBASSY_VISA', standardLeadDays: 45 },
  { code: 'BD', name: 'Bangladesh', nationalityName: 'Bangladeshi', regime: 'CONSULAR_EMBASSY_VISA', standardLeadDays: 45 },
  { code: 'GH', name: 'Ghana', nationalityName: 'Ghanaian', regime: 'CONSULAR_EMBASSY_VISA', standardLeadDays: 45 },
  { code: 'KE', name: 'Kenya', nationalityName: 'Kenyan', regime: 'CONSULAR_EMBASSY_VISA', standardLeadDays: 45 },
  { code: 'ET', name: 'Ethiopia', nationalityName: 'Ethiopian', regime: 'CONSULAR_EMBASSY_VISA', standardLeadDays: 45 },
  { code: 'ID', name: 'Indonesia', nationalityName: 'Indonesian', regime: 'CONSULAR_EMBASSY_VISA', standardLeadDays: 45 },
  { code: 'NP', name: 'Nepal', nationalityName: 'Nepali', regime: 'CONSULAR_EMBASSY_VISA', standardLeadDays: 45 },
];

export const SCHENGEN_OECD_RESIDENCE_COUNTRIES = new Set([
  'FR', 'DE', 'ES', 'IT', 'GB', 'US', 'CA', 'BE', 'NL', 'CH', 'PT', 'AT', 'SE', 'NO', 'DK', 'FI', 'IE', 'PL', 'CZ', 'GR', 'AU', 'NZ', 'JP'
]);

export interface VisaRegimeResolution {
  regime: 'VISA_FREE_90D' | 'AEVM_EVISA' | 'CONSULAR_EMBASSY_VISA';
  leadTimeDaysRequired: number;
  isExempt: boolean;
  isAevmEligible: boolean;
  requiresEmbassyPack: boolean;
  legalBasis: string;
  officialInstructions: string;
}

export function resolveMoroccanVisaRegime(params: {
  nationalityCountry: string; // ISO 2-letter or name
  residenceCountry?: string; // ISO 2-letter or name
  hasSchengenOrUkOrUsPermit?: boolean;
}): VisaRegimeResolution {
  const normNat = params.nationalityCountry.trim().toUpperCase();
  const normRes = params.residenceCountry?.trim().toUpperCase();

  // Find country by code or name
  const natCountry = SEARCHABLE_COUNTRIES_CATALOG.find(
    (c) => c.code === normNat || c.name.toUpperCase() === normNat || c.nationalityName.toUpperCase() === normNat
  );

  // 1. Direct Visa-Free check
  if (natCountry && natCountry.regime === 'VISA_FREE_90D') {
    return {
      regime: 'VISA_FREE_90D',
      leadTimeDaysRequired: 14,
      isExempt: true,
      isAevmEligible: false,
      requiresEmbassyPack: false,
      legalBasis: 'DGSN / MAEC Bilateral Visa-Exemption Agreement (90 Days).',
      officialInstructions:
        'Valid passport with at least 6 months validity beyond exchange duration. Return ticket and accommodation confirmation required at border control.',
    };
  }

  // 2. AEVM / eVisa Check:
  // Either direct eVisa country OR applicant holds valid residence permit in EU/US/UK/Canada/Japan/Schengen
  const isResPermitEligible =
    Boolean(params.hasSchengenOrUkOrUsPermit) ||
    (normRes && SCHENGEN_OECD_RESIDENCE_COUNTRIES.has(normRes));

  if ((natCountry && natCountry.regime === 'AEVM_EVISA') || isResPermitEligible) {
    const basis = isResPermitEligible
      ? 'Moroccan AEVM eVisa via Schengen / US / UK Residence Permit exemption.'
      : 'Moroccan Direct eVisa (Accès Électronique aux Visas pour le Maroc).';

    return {
      regime: 'AEVM_EVISA',
      leadTimeDaysRequired: 21,
      isExempt: false,
      isAevmEligible: true,
      requiresEmbassyPack: false,
      legalBasis: basis,
      officialInstructions:
        'Apply online at acces-maroc.ma at least 21 days before departure. Upload passport copy, residence permit, and AIESEC host acceptance letter.',
    };
  }

  // 3. Consular / Embassy Visa Required
  return {
    regime: 'CONSULAR_EMBASSY_VISA',
    leadTimeDaysRequired: 45,
    isExempt: false,
    isAevmEligible: false,
    requiresEmbassyPack: true,
    legalBasis: 'Traditional Consular Entry Visa (Moroccan Embassy / Consulate General).',
    officialInstructions:
      'Host LC must issue official stamped AIESEC Visa Invitation Pack (MoU, Host Letter, Accommodation Certificate). EP must apply at accredited Moroccan Embassy at least 45 days prior.',
  };
}

// Backward compatibility interfaces & helpers for existing callers
export interface VisaRegimeInfo {
  countryCode: string;
  countryName: string;
  regime: MoroccanVisaRegime;
  estimatedProcessingDays: number;
  requiresInvitationPack: boolean;
  notes: string;
}

export function getMoroccanVisaRegime(countryCode: string): VisaRegimeInfo {
  const code = countryCode.trim().toUpperCase();
  const resolved = resolveMoroccanVisaRegime({ nationalityCountry: code });

  const found = SEARCHABLE_COUNTRIES_CATALOG.find((c) => c.code === code || c.name.toUpperCase() === code);
  const countryName = found?.name || code;

  const legacyRegime: MoroccanVisaRegime =
    resolved.regime === 'VISA_FREE_90D'
      ? 'VISA_EXEMPT'
      : resolved.regime === 'AEVM_EVISA'
      ? 'AEVM_EVISA'
      : 'CONSULAR_VISA';

  return {
    countryCode: code,
    countryName,
    regime: legacyRegime,
    estimatedProcessingDays: legacyRegime === 'VISA_EXEMPT' ? 0 : legacyRegime === 'AEVM_EVISA' ? 3 : 30,
    requiresInvitationPack: resolved.requiresEmbassyPack,
    notes: resolved.officialInstructions,
  };
}

export function checkVisaLeadTime(
  countryCode: string,
  approvalDate: string,
  realizationStartDate: string
): { isCompliant: boolean; daysDifference: number; warning?: string } {
  const regimeInfo = getMoroccanVisaRegime(countryCode);
  if (regimeInfo.regime !== 'CONSULAR_VISA') {
    return { isCompliant: true, daysDifference: 999 };
  }

  const approvalMs = new Date(approvalDate).getTime();
  const startMs = new Date(realizationStartDate).getTime();
  const daysDifference = Math.floor((startMs - approvalMs) / (1000 * 60 * 60 * 24));

  const isCompliant = daysDifference >= 30;

  return {
    isCompliant,
    daysDifference,
    warning: isCompliant
      ? undefined
      : `Statutory Lead Time Warning THR-047 (TEST-041): Applicant from ${regimeInfo.countryName} requires a Consular Visa, which mandates at least 30 days processing lead time. Current lead time is only ${daysDifference} days before scheduled arrival (${realizationStartDate}). High risk of visa refusal or delayed flight.`,
  };
}
