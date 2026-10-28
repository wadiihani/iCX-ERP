import { describe, it, expect } from 'vitest';
import {
  validatePartlyRemoteOpportunity,
  validateFullyRemoteOpportunity,
  getApplicableStandards,
  PARTLY_REMOTE_MIN_TOTAL_WEEKS,
  PARTLY_REMOTE_MAX_REMOTE_SHARE_PERCENT,
  FULLY_REMOTE_MIN_WEEKS,
  FULLY_REMOTE_MAX_WEEKS,
} from '../src/lib/professional/remote-modality-engine';
import type {
  PartlyRemoteSchedule,
  FullyRemoteSchedule,
} from '../src/lib/types/remote-modalities';

describe('Phase 6 Plan 02: Partly Remote & Fully Remote Exchange Modalities (REQ-038, REQ-039)', () => {
  // Test 1: REQ-038 / TEST-036: Partly Remote Opportunity Criteria & ICB Gate
  describe('Partly Remote Exchange Validation (REQ-038, TEST-036)', () => {
    const validPartlyRemote: PartlyRemoteSchedule = {
      totalDurationWeeks: 16, // >= 13 weeks
      remoteWeeks: 6, // 6/16 = 37.5% <= 50%
      onsiteWeeks: 10,
      remoteSharePercentage: 37.5,
      icbAuditReference: 'ICB-REMOTE-2026-RABAT-009',
      icbApprovedAt: '2026-03-01T10:00:00Z',
    };

    it('passes compliant partly remote exchange with valid duration, remote share <= 50%, and ICB reference', () => {
      const result = validatePartlyRemoteOpportunity(validPartlyRemote);
      expect(result.isValid).toBe(true);
      expect(result.violations.length).toBe(0);
      expect(result.remotePercentage).toBe(37.5);
      expect(result.icbApprovalValid).toBe(true);
      expect(result.applicableStandardsCount).toBe(18); // Full 18 apply across dual phases
    });

    it('rejects partly remote exchange with total duration under 13 weeks', () => {
      const shortExchange: PartlyRemoteSchedule = {
        ...validPartlyRemote,
        totalDurationWeeks: 10, // < 13 weeks
        remoteWeeks: 4,
        onsiteWeeks: 6,
      };
      const result = validatePartlyRemoteOpportunity(shortExchange);
      expect(result.isValid).toBe(false);
      expect(result.violations.some((v) => v.includes('Invalid Duration'))).toBe(true);
      expect(result.violations.some((v) => v.includes('must be at least 13 weeks'))).toBe(true);
    });

    it('rejects partly remote exchange where remote share exceeds 50%', () => {
      const excessiveRemote: PartlyRemoteSchedule = {
        ...validPartlyRemote,
        totalDurationWeeks: 14,
        remoteWeeks: 8, // 8 / 14 = 57.1% > 50%
        onsiteWeeks: 6,
      };
      const result = validatePartlyRemoteOpportunity(excessiveRemote);
      expect(result.isValid).toBe(false);
      expect(result.violations.some((v) => v.includes('Excessive Remote Share'))).toBe(true);
      expect(result.violations.some((v) => v.includes('exceeds the statutory ceiling of 50%'))).toBe(true);
    });

    it('strictly blocks partly remote exchange missing mandatory ICB audit reference (TEST-036)', () => {
      const missingIcb: PartlyRemoteSchedule = {
        ...validPartlyRemote,
        icbAuditReference: '', // Missing
      };
      const result = validatePartlyRemoteOpportunity(missingIcb);
      expect(result.isValid).toBe(false);
      expect(result.icbApprovalValid).toBe(false);
      expect(result.violations.some((v) => v.includes('Missing ICB Reference'))).toBe(true);
    });
  });

  // Test 2: REQ-039 / TEST-037: Fully Remote Exchange Validation & Standards Filtering
  describe('Fully Remote Exchange Validation & Standards Catalog (REQ-039, TEST-037)', () => {
    const validFullyRemote: FullyRemoteSchedule = {
      totalDurationWeeks: 12, // 6 to 26 weeks
      virtualWorkspaceUrl: 'https://workspace.slack.com/rabat-cxp',
      timeZoneOffset: 'GMT+1 (Casablanca)',
    };

    it('passes compliant fully remote exchange within 6 to 26 weeks', () => {
      const result = validateFullyRemoteOpportunity(validFullyRemote);
      expect(result.isValid).toBe(true);
      expect(result.violations.length).toBe(0);
      expect(result.modality).toBe('FULLY_REMOTE');
      expect(result.remotePercentage).toBe(100);
      expect(result.applicableStandardsCount).toBe(13); // 13 virtual/operational standards
      expect(result.physicalStandardsExempted).toBe(5); // 5 physical standards exempted (Pickup, Accompaniment, Visa, Housing, Departure)
    });

    it('rejects fully remote exchange with duration under 6 weeks', () => {
      const tooShort: FullyRemoteSchedule = {
        ...validFullyRemote,
        totalDurationWeeks: 4, // < 6 weeks
      };
      const result = validateFullyRemoteOpportunity(tooShort);
      expect(result.isValid).toBe(false);
      expect(result.violations.some((v) => v.includes('Invalid Duration'))).toBe(true);
      expect(result.violations.some((v) => v.includes('between 6 and 26 weeks'))).toBe(true);
    });

    it('rejects fully remote exchange with duration exceeding 26 weeks', () => {
      const tooLong: FullyRemoteSchedule = {
        ...validFullyRemote,
        totalDurationWeeks: 30, // > 26 weeks
      };
      const result = validateFullyRemoteOpportunity(tooLong);
      expect(result.isValid).toBe(false);
      expect(result.violations.some((v) => v.includes('Invalid Duration'))).toBe(true);
    });

    it('rejects fully remote exchange missing virtual workspace URL', () => {
      const missingWorkspace: FullyRemoteSchedule = {
        ...validFullyRemote,
        virtualWorkspaceUrl: '',
      };
      const result = validateFullyRemoteOpportunity(missingWorkspace);
      expect(result.isValid).toBe(false);
      expect(result.violations.some((v) => v.includes('Virtual workspace'))).toBe(true);
    });

    it('filters out physical standards (Airport Pickup, Housing, Departure) for fully remote modality', () => {
      const fullyRemoteStandards = getApplicableStandards('FULLY_REMOTE');
      expect(fullyRemoteStandards.length).toBe(13);

      // Verify physical standards are excluded
      const titles = fullyRemoteStandards.map((s) => s.title);
      expect(titles).not.toContain('Airport Pickup');
      expect(titles).not.toContain('Accommodation');
      expect(titles).not.toContain('Departure Support');

      // Verify onsite retains all 18 standards
      const onsiteStandards = getApplicableStandards('ONSITE');
      expect(onsiteStandards.length).toBe(18);
    });
  });
});
