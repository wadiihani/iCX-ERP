/**
 * Passport Data Minimisation & Moroccan Immigration Validity Engine
 * Baseline: DEC-010, REQ-029, and Moroccan Immigration Statutory Requirements
 */

export interface PassportRecordInput {
  rawPassportNumber: string;
  issuingCountryCode: string; // ISO 2-letter or 3-letter
  expirationDate: string; // ISO YYYY-MM-DD
  projectEndDate: string; // ISO YYYY-MM-DD
}

export interface MinimisedPassportRecord {
  maskedNumber: string;
  issuingCountryCode: string;
  expirationDate: string;
  isValidForEntry: boolean;
  monthsValidBeyondProject: number;
  validationError?: string;
}

/**
 * Masks a passport number to protect PII per DEC-010.
 * Example: 'AB1234567' -> 'AB*****67'
 */
export function maskPassportNumber(rawNumber: string): string {
  const clean = rawNumber.trim().replace(/\s+/g, '');
  if (clean.length <= 4) return clean;

  const prefix = clean.substring(0, 2);
  const suffix = clean.substring(clean.length - 2);
  const maskedMiddle = '*'.repeat(clean.length - 4);

  return `${prefix}${maskedMiddle}${suffix}`;
}

/**
 * Validates passport validity under Moroccan Immigration regulations:
 * Passport must be valid for at least 6 months (180 days) beyond the project end date.
 */
export function validatePassportForMorocco(
  input: PassportRecordInput
): MinimisedPassportRecord {
  const maskedNumber = maskPassportNumber(input.rawPassportNumber);
  const cleanCountry = input.issuingCountryCode.trim().toUpperCase();

  const expDateMs = new Date(input.expirationDate).getTime();
  const projEndMs = new Date(input.projectEndDate).getTime();

  if (isNaN(expDateMs)) {
    return {
      maskedNumber,
      issuingCountryCode: cleanCountry,
      expirationDate: input.expirationDate,
      isValidForEntry: false,
      monthsValidBeyondProject: 0,
      validationError: 'Invalid passport expiration date format.',
    };
  }

  if (isNaN(projEndMs)) {
    return {
      maskedNumber,
      issuingCountryCode: cleanCountry,
      expirationDate: input.expirationDate,
      isValidForEntry: false,
      monthsValidBeyondProject: 0,
      validationError: 'Invalid project end date format.',
    };
  }

  const diffMs = expDateMs - projEndMs;
  const daysValidBeyond = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const monthsValidBeyond = Number((daysValidBeyond / 30.4375).toFixed(1));

  // Statutory Moroccan Immigration Invariant: Minimum 180 days (6 months)
  const isValidForEntry = daysValidBeyond >= 180;

  return {
    maskedNumber,
    issuingCountryCode: cleanCountry,
    expirationDate: input.expirationDate,
    isValidForEntry,
    monthsValidBeyondProject: monthsValidBeyond,
    validationError: isValidForEntry
      ? undefined
      : `Moroccan Immigration Invariant Breach (DEC-010): Passport must be valid for at least 6 months (180 days) after project realization end (${input.projectEndDate}). Current validity: ${daysValidBeyond} days (${monthsValidBeyond} months).`,
  };
}
