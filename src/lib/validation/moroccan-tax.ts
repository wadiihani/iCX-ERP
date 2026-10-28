/**
 * Moroccan Statutory Tax & Corporate Identifiers Validator
 * Baseline: REQ-011 & Section 4.1 Partner Organization Schema
 */

/**
 * Validates a Moroccan ICE (Identifiant Commun de l'Entreprise).
 * An ICE is composed of exactly 15 numeric digits:
 * - 9 digits: Unique company identifier
 * - 4 digits: Establishment/branch code (e.g. 0000 for headquarters)
 * - 2 digits: Verification control key
 */
export function validateICE(ice: string | null | undefined): {
  isValid: boolean;
  formatted?: string;
  error?: string;
} {
  if (!ice || ice.trim() === '') {
    return { isValid: false, error: 'ICE number is required for Moroccan registered corporate entities.' };
  }

  // Strip whitespace, hyphens, and dots
  const sanitized = ice.replace(/[\s.-]/g, '');

  if (!/^\d{15}$/.test(sanitized)) {
    return {
      isValid: false,
      error: `Invalid ICE length: expected exactly 15 digits, got ${sanitized.length}. Example format: 001524316000045`,
    };
  }

  // Format with standard grouping: 001 524 316 0000 45
  const formatted = `${sanitized.slice(0, 3)} ${sanitized.slice(3, 6)} ${sanitized.slice(6, 9)} ${sanitized.slice(9, 13)} ${sanitized.slice(13, 15)}`;

  return {
    isValid: true,
    formatted,
  };
}

/**
 * Validates a Moroccan IF (Identifiant Fiscal).
 * Typically 7 to 8 numeric digits.
 */
export function validateIF(ifNumber: string | null | undefined): {
  isValid: boolean;
  error?: string;
} {
  if (!ifNumber || ifNumber.trim() === '') {
    return { isValid: true }; // IF may be optional for certain NGOs
  }

  const sanitized = ifNumber.replace(/[\s.-]/g, '');

  if (!/^\d{7,8}$/.test(sanitized)) {
    return {
      isValid: false,
      error: `Invalid Moroccan IF (Identifiant Fiscal): expected 7 to 8 digits, got ${sanitized.length}.`,
    };
  }

  return { isValid: true };
}
