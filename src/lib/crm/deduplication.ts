/**
 * CRM Deduplication & Conflict Detection Engine
 * Baseline: REQ-012, DEC-001, and TEST-019
 */

export interface OrganizationRecord {
  id: string;
  name: string;
  normalized_name?: string;
  ice_number?: string | null;
  tax_id?: string | null;
  phone?: string | null;
  city?: string | null;
}

export interface DuplicateMatchResult {
  isDuplicate: boolean;
  confidenceScore: number; // 0 to 100
  matchReason?: 'EXACT_ICE' | 'EXACT_TAX_ID' | 'NORMALIZED_NAME_EXACT' | 'FUZZY_NAME_AND_CITY' | 'PHONE_EXACT';
  matchedRecord?: OrganizationRecord;
}

/**
 * Normalizes an organization name for deterministic matching:
 * - Converts to lowercase and removes French / Arabic diacritics
 * - Removes corporate legal form abbreviations (SARL, SA, SAS, Association, Fondation, ONG, Coopérative)
 * - Removes punctuation and collapses whitespace
 */
export function normalizeOrgName(name: string): string {
  if (!name) return '';

  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Strip diacritics
    .toLowerCase()
    .replace(/\b(sarl|au|s\.a\.r\.l|sa|s\.a|sas|association|fondation|ong|cooperative|ste|societe|groupe)\b/g, '')
    .replace(/[^a-z0-9]/g, ' ') // Strip special characters
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculates string similarity using Levenshtein distance (normalized 0 to 1)
 */
export function calculateLevenshteinSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1.0;
  if (!str1.length || !str2.length) return 0.0;

  const track = Array(str2.length + 1)
    .fill(null)
    .map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i += 1) {
    track[0][i] = i;
  }
  for (let j = 0; j <= str2.length; j += 1) {
    track[j][0] = j;
  }

  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1, // deletion
        track[j - 1][i] + 1, // insertion
        track[j - 1][i - 1] + indicator // substitution
      );
    }
  }

  const distance = track[str2.length][str1.length];
  const maxLength = Math.max(str1.length, str2.length);
  return 1 - distance / maxLength;
}

/**
 * Checks a candidate organization against existing local directory records.
 */
export function detectDuplicate(
  candidate: {
    name: string;
    ice_number?: string | null;
    tax_id?: string | null;
    phone?: string | null;
    city?: string | null;
  },
  existingRecords: OrganizationRecord[]
): DuplicateMatchResult {
  const normCandidateName = normalizeOrgName(candidate.name);
  const cleanCandidateIce = candidate.ice_number ? candidate.ice_number.replace(/[\s.-]/g, '') : null;
  const cleanCandidateTaxId = candidate.tax_id ? candidate.tax_id.replace(/[\s.-]/g, '') : null;
  const cleanCandidatePhone = candidate.phone ? candidate.phone.replace(/[\s.-]/g, '') : null;

  for (const record of existingRecords) {
    // 1. Exact ICE Match -> 100% confidence
    if (cleanCandidateIce && record.ice_number) {
      const cleanRecordIce = record.ice_number.replace(/[\s.-]/g, '');
      if (cleanCandidateIce === cleanRecordIce) {
        return {
          isDuplicate: true,
          confidenceScore: 100,
          matchReason: 'EXACT_ICE',
          matchedRecord: record,
        };
      }
    }

    // 2. Exact Tax ID Match -> 100% confidence
    if (cleanCandidateTaxId && record.tax_id) {
      const cleanRecordTaxId = record.tax_id.replace(/[\s.-]/g, '');
      if (cleanCandidateTaxId === cleanRecordTaxId) {
        return {
          isDuplicate: true,
          confidenceScore: 100,
          matchReason: 'EXACT_TAX_ID',
          matchedRecord: record,
        };
      }
    }

    // 3. Exact Normalized Name Match -> 95% confidence
    const normRecordName = record.normalized_name || normalizeOrgName(record.name);
    if (normCandidateName && normRecordName && normCandidateName === normRecordName) {
      return {
        isDuplicate: true,
        confidenceScore: 95,
        matchReason: 'NORMALIZED_NAME_EXACT',
        matchedRecord: record,
      };
    }

    // 4. Fuzzy Name Match with same City
    if (normCandidateName && normRecordName) {
      const similarity = calculateLevenshteinSimilarity(normCandidateName, normRecordName);
      const sameCity = candidate.city && record.city && candidate.city.toLowerCase().trim() === record.city.toLowerCase().trim();

      if (similarity >= 0.85 && sameCity) {
        return {
          isDuplicate: true,
          confidenceScore: Math.round(similarity * 100),
          matchReason: 'FUZZY_NAME_AND_CITY',
          matchedRecord: record,
        };
      }
    }

    // 5. Phone Match -> 80% confidence
    if (cleanCandidatePhone && record.phone) {
      const cleanRecordPhone = record.phone.replace(/[\s.-]/g, '');
      if (cleanCandidatePhone.length >= 8 && cleanCandidatePhone === cleanRecordPhone) {
        return {
          isDuplicate: true,
          confidenceScore: 80,
          matchReason: 'PHONE_EXACT',
          matchedRecord: record,
        };
      }
    }
  }

  return {
    isDuplicate: false,
    confidenceScore: 0,
  };
}
