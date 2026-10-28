import { describe, it, expect } from 'vitest';
import { validateICE, validateIF } from '../src/lib/validation/moroccan-tax';
import { normalizeOrgName, detectDuplicate, calculateLevenshteinSimilarity } from '../src/lib/crm/deduplication';
import { dryRunLeadImport, createBatchCommit, type RawLeadRow } from '../src/lib/crm/lead-importer';

describe('Plan 01-02: CRM & Stakeholder Management', () => {
  describe('Moroccan Statutory Tax Identifiers (REQ-011)', () => {
    it('validates a valid 15-digit ICE number and formats it', () => {
      const result = validateICE('001524316000045');
      expect(result.isValid).toBe(true);
      expect(result.formatted).toBe('001 524 316 0000 45');
    });

    it('rejects an ICE with invalid length or non-digits', () => {
      const shortResult = validateICE('123456');
      expect(shortResult.isValid).toBe(false);
      expect(shortResult.error).toContain('expected exactly 15 digits');

      const nonDigitsResult = validateICE('00152431600004A');
      expect(nonDigitsResult.isValid).toBe(false);
    });

    it('validates Moroccan IF (7-8 digits)', () => {
      expect(validateIF('1234567').isValid).toBe(true);
      expect(validateIF('12345678').isValid).toBe(true);
      expect(validateIF('123').isValid).toBe(false);
    });
  });

  describe('Deduplication Engine (REQ-012)', () => {
    it('normalizes organization names ignoring French legal forms, punctuation, and diacritics', () => {
      expect(normalizeOrgName('Fondation Orient-Occident')).toBe('orient occident');
      expect(normalizeOrgName('Association Marocaine des Droits Humains')).toBe('marocaine des droits humains');
      expect(normalizeOrgName('Société Nouvelle SARL AU')).toBe('nouvelle');
      expect(normalizeOrgName('École Al-Amal - Rabat')).toBe('ecole al amal rabat');
    });

    it('detects duplicate via exact ICE match', () => {
      const existing = [
        {
          id: 'org-1',
          name: 'Fondation Orient-Occident',
          ice_number: '001524316000045',
        },
      ];

      const match = detectDuplicate(
        {
          name: 'Orient Occident Rabat',
          ice_number: '001524316000045',
        },
        existing
      );

      expect(match.isDuplicate).toBe(true);
      expect(match.confidenceScore).toBe(100);
      expect(match.matchReason).toBe('EXACT_ICE');
    });

    it('detects duplicate via normalized name match', () => {
      const existing = [
        {
          id: 'org-2',
          name: 'Association Solidarité Féminine',
          normalized_name: 'solidarite feminine',
        },
      ];

      const match = detectDuplicate(
        {
          name: 'Solidarité Féminine (ONG)',
        },
        existing
      );

      expect(match.isDuplicate).toBe(true);
      expect(match.confidenceScore).toBe(95);
      expect(match.matchReason).toBe('NORMALIZED_NAME_EXACT');
    });

    it('detects fuzzy name similarity with matching city', () => {
      const sim = calculateLevenshteinSimilarity('centre social rabat', 'centre sociale rabat');
      expect(sim).toBeGreaterThan(0.9);

      const existing = [
        {
          id: 'org-3',
          name: 'Centre Social Rabat',
          city: 'Rabat',
        },
      ];

      const match = detectDuplicate(
        {
          name: 'Centre Sociale Rabat',
          city: 'Rabat',
        },
        existing
      );

      expect(match.isDuplicate).toBe(true);
      expect(match.matchReason).toBe('FUZZY_NAME_AND_CITY');
    });
  });

  describe('TEST-019 & TEST-020: CSV Lead Import Wizard & Reversible Batch Commit', () => {
    it('TEST-019: processes raw rows and previews duplicates and validation errors before committing', () => {
      const existing = [
        {
          id: 'org-10',
          name: 'Fondation Orient-Occident',
          ice_number: '001524316000045',
          city: 'Rabat',
        },
      ];

      const rawRows: RawLeadRow[] = [
        {
          name: 'Fondation Orient-Occident Branch',
          ice_number: '001524316000045', // Duplicate ICE
          city: 'Rabat',
        },
        {
          name: 'X', // Invalid name (<2 chars)
          city: 'Salé',
        },
        {
          name: 'Association Bayti',
          ice_number: '002345678000099', // Valid new lead
          city: 'Rabat',
        },
      ];

      const preview = dryRunLeadImport(rawRows, existing);

      expect(preview.totalRows).toBe(3);
      expect(preview.duplicateRowsCount).toBe(1);
      expect(preview.errorRowsCount).toBe(1);
      expect(preview.netNewRowsCount).toBe(1);

      // Row 1: Duplicate ICE detected
      expect(preview.items[0].isDuplicate).toBe(true);
      expect(preview.items[0].duplicateDetails?.matchReason).toBe('EXACT_ICE');

      // Row 2: Validation error (<2 chars)
      expect(preview.items[1].validationErrors.length).toBeGreaterThan(0);

      // Row 3: Net new valid lead
      expect(preview.items[2].resolutionAction).toBe('INSERT');
      expect(preview.items[2].validationErrors.length).toBe(0);
    });

    it('TEST-020: generates reversible batch payload with tracked IDs for transactional rollback', () => {
      const rawRows: RawLeadRow[] = [
        { name: 'Association Bayti', city: 'Rabat' },
        { name: 'Institut Français Rabat', city: 'Rabat' },
      ];

      const preview = dryRunLeadImport(rawRows, []);
      const batch = createBatchCommit('lc_rabat_001', 'user_vp_sales', preview.items);

      expect(batch.batchId).toMatch(/^batch_\d+_/);
      expect(batch.lcId).toBe('lc_rabat_001');
      expect(batch.committedBy).toBe('user_vp_sales');
      expect(batch.insertedOrgIds.length).toBe(2);
      expect(batch.skippedCount).toBe(0);
    });
  });
});
