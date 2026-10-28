import { describe, it, expect } from 'vitest';
import {
  EXCHANGE_STANDARDS_CATALOG,
  getMandatoryStandards,
  getNonMandatoryStandards,
} from '../src/lib/standards/standards-catalog';
import {
  buildStandardsMatrix,
  calculateCoAdvisoryScore,
  evaluateSurveyChasing,
} from '../src/lib/standards/standards-engine';
import {
  HostStandardEvidence,
  EpSurveyResponse,
} from '../src/lib/types/standards';

describe('Plan 03-03: 18 Exchange Standards Catalog, Dual-Source Vault & Survey Chasing', () => {
  // =========================================================================
  // TEST-063: 18 Exchange Standards Catalog (2024 Refresh) (REQ-066)
  // =========================================================================
  describe('TEST-063: 18 Exchange Standards Catalog (REQ-066)', () => {
    it('contains exactly 18 standards in the catalog', () => {
      expect(EXCHANGE_STANDARDS_CATALOG).toHaveLength(18);
    });

    it('contains exactly 13 mandatory standards and 5 non-mandatory standards', () => {
      const mandatory = getMandatoryStandards();
      const nonMandatory = getNonMandatoryStandards();

      expect(mandatory).toHaveLength(13);
      expect(nonMandatory).toHaveLength(5);
    });

    it('structures standard numbers consecutively from 1 to 18', () => {
      const numbers = EXCHANGE_STANDARDS_CATALOG.map((s) => s.standardNumber);
      expect(numbers).toEqual([
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
      ]);
    });

    it('verifies non-mandatory standards are #3 (Insurance), #12 (Working Hours), #15 (LEAD), #16 (Departure Support), #17 (Touchpoints)', () => {
      const nonMandatoryNumbers = getNonMandatoryStandards().map((s) => s.standardNumber);
      expect(nonMandatoryNumbers).toEqual([3, 12, 15, 16, 17]);
    });
  });

  // =========================================================================
  // TEST-064: Dual-Source Evidence Separation & Discrepancies (REQ-067)
  // =========================================================================
  describe('TEST-064: Dual-Source Evidence Separation & Discrepancies (REQ-067)', () => {
    const appId = 'APP-RABAT-901';

    it('strictly separates host internal evidence from EP survey responses', () => {
      const hostEvidence: HostStandardEvidence[] = [
        {
          applicationId: appId,
          standardNumber: 7, // Accommodation
          internalStatus: 'DELIVERED_VERIFIED',
          deliveredAt: '2026-10-25T10:00:00Z',
          verifiedByUserId: 'user-cxp-lead',
          evidenceDocumentId: 'doc-lease-agdal',
          notes: 'Single bed allocated at Dar Zellige Agdal',
        },
      ];

      const epResponses: EpSurveyResponse[] = [
        {
          applicationId: appId,
          standardNumber: 7,
          surveyStage: 'MIDDLE',
          epResponse: 'NO_UNFULFILLED', // EP claims accommodation was not as promised
          syncedFromExpaAt: '2026-10-26T12:00:00Z',
        },
      ];

      const matrix = buildStandardsMatrix(appId, hostEvidence, epResponses);
      const row7 = matrix.find((r) => r.definition.standardNumber === 7);

      expect(row7).toBeDefined();
      expect(row7?.isDeliveredByHost).toBe(true);
      expect(row7?.isConfirmedByEp).toBe(false);
      expect(row7?.hasDiscrepancy).toBe(true); // Flagged as discrepancy without overwriting
      expect(row7?.hostEvidence?.notes).toContain('Dar Zellige Agdal');
      expect(row7?.epResponse?.epResponse).toBe('NO_UNFULFILLED');
    });

    it('identifies clean alignment when both host and EP agree on delivery', () => {
      const hostEvidence: HostStandardEvidence[] = [
        {
          applicationId: appId,
          standardNumber: 6, // Arrival Pickup
          internalStatus: 'DELIVERED_VERIFIED',
          deliveredAt: '2026-10-25T10:00:00Z',
          verifiedByUserId: 'user-buddy',
          evidenceDocumentId: null,
        },
      ];

      const epResponses: EpSurveyResponse[] = [
        {
          applicationId: appId,
          standardNumber: 6,
          surveyStage: 'MIDDLE',
          epResponse: 'YES_FULFILLED',
          syncedFromExpaAt: '2026-10-26T12:00:00Z',
        },
      ];

      const matrix = buildStandardsMatrix(appId, hostEvidence, epResponses);
      const row6 = matrix.find((r) => r.definition.standardNumber === 6);

      expect(row6?.hasDiscrepancy).toBe(false);
      expect(row6?.isDeliveredByHost).toBe(true);
      expect(row6?.isConfirmedByEp).toBe(true);
    });
  });

  // =========================================================================
  // TEST-065: Advisory Complete (CO) Calculation Formula (REQ-068)
  // =========================================================================
  describe('TEST-065: Advisory Complete Status (CO) Calculation Formula (REQ-068)', () => {
    const appId = 'APP-RABAT-902';

    const buildFullMockEvidence = (
      deliveredMandatoryCount: number,
      deliveredNonMandatoryCount: number
    ): HostStandardEvidence[] => {
      const mandatoryStandards = getMandatoryStandards();
      const nonMandatoryStandards = getNonMandatoryStandards();

      const evidence: HostStandardEvidence[] = [];

      // Add mandatory delivered
      for (let i = 0; i < mandatoryStandards.length; i++) {
        const isDelivered = i < deliveredMandatoryCount;
        evidence.push({
          applicationId: appId,
          standardNumber: mandatoryStandards[i].standardNumber,
          internalStatus: isDelivered ? 'DELIVERED_VERIFIED' : 'PENDING',
          deliveredAt: isDelivered ? '2026-10-26T10:00:00Z' : null,
          verifiedByUserId: 'user-test',
          evidenceDocumentId: null,
        });
      }

      // Add non-mandatory delivered
      for (let i = 0; i < nonMandatoryStandards.length; i++) {
        const isDelivered = i < deliveredNonMandatoryCount;
        evidence.push({
          applicationId: appId,
          standardNumber: nonMandatoryStandards[i].standardNumber,
          internalStatus: isDelivered ? 'DELIVERED_VERIFIED' : 'PENDING',
          deliveredAt: isDelivered ? '2026-10-26T10:00:00Z' : null,
          verifiedByUserId: 'user-test',
          evidenceDocumentId: null,
        });
      }

      return evidence;
    };

    it('qualifies as Complete (CO) with exactly 13/13 Mandatory + 3/5 Non-Mandatory (16 standards total)', () => {
      const evidence = buildFullMockEvidence(13, 3);
      const matrix = buildStandardsMatrix(appId, evidence, []);
      const score = calculateCoAdvisoryScore(matrix);

      expect(score.isCoQualified).toBe(true);
      expect(score.qualificationStatus).toBe('QUALIFIED_COMPLETE');
      expect(score.mandatoryDeliveredCount).toBe(13);
      expect(score.nonMandatoryDeliveredCount).toBe(3);
      expect(score.totalDeliveredCount).toBe(16);
      expect(score.missingMandatoryStandards).toHaveLength(0);
    });

    it('qualifies as Complete (CO) with 13/13 Mandatory + 5/5 Non-Mandatory (18 standards total)', () => {
      const evidence = buildFullMockEvidence(13, 5);
      const matrix = buildStandardsMatrix(appId, evidence, []);
      const score = calculateCoAdvisoryScore(matrix);

      expect(score.isCoQualified).toBe(true);
      expect(score.totalDeliveredCount).toBe(18);
      expect(score.deliveryPercentage).toBe(100);
    });

    it('fails Complete qualification with 12/13 Mandatory even if 5/5 Non-Mandatory delivered (17 total)', () => {
      // 12 Mandatory + 5 Non-Mandatory = 17 total, but MUST fail because 1 Mandatory is missing!
      const evidence = buildFullMockEvidence(12, 5);
      const matrix = buildStandardsMatrix(appId, evidence, []);
      const score = calculateCoAdvisoryScore(matrix);

      expect(score.isCoQualified).toBe(false);
      expect(score.qualificationStatus).toBe('DEFICIENT_MANDATORY_FAIL');
      expect(score.mandatoryDeliveredCount).toBe(12);
      expect(score.nonMandatoryDeliveredCount).toBe(5);
      expect(score.missingMandatoryStandards).toHaveLength(1);
    });

    it('fails Complete qualification with 13/13 Mandatory but only 2/5 Non-Mandatory (15 total)', () => {
      const evidence = buildFullMockEvidence(13, 2);
      const matrix = buildStandardsMatrix(appId, evidence, []);
      const score = calculateCoAdvisoryScore(matrix);

      expect(score.isCoQualified).toBe(false);
      expect(score.qualificationStatus).toBe('DEFICIENT_NON_MANDATORY_FAIL');
      expect(score.mandatoryDeliveredCount).toBe(13);
      expect(score.nonMandatoryDeliveredCount).toBe(2);
      expect(score.missingMandatoryStandards).toHaveLength(0);
    });
  });

  // =========================================================================
  // TEST-069: Automated Middle & Final Survey Chaser (REQ-072, AUTO-021/026)
  // =========================================================================
  describe('TEST-069: Automated Middle & Final Survey Chaser (REQ-072, AUTO-021/026)', () => {
    const startDate = '2026-10-01'; // 42 days total (ends 2026-11-12)
    const endDate = '2026-11-12';

    it('does not chase Middle Survey when before midpoint', () => {
      // Midpoint is ~Oct 22. Current date: Oct 10
      const currentDate = new Date('2026-10-10T12:00:00Z');
      const evalResult = evaluateSurveyChasing({
        applicationId: 'APP-CHASE-01',
        startDate,
        endDate,
        middleSurveyAnswered: false,
        finalSurveyAnswered: false,
        currentDate,
      });

      expect(evalResult.isMidpointReached).toBe(false);
      expect(evalResult.isMiddleSurveyDue).toBe(false);
      expect(evalResult.actionsDue).not.toContain('MIDDLE_SURVEY_CHASE');
    });

    it('triggers Middle Survey chaser (AUTO-021) at midpoint when survey is unanswered', () => {
      // Current date: Oct 23 (past midpoint)
      const currentDate = new Date('2026-10-23T12:00:00Z');
      const evalResult = evaluateSurveyChasing({
        applicationId: 'APP-CHASE-01',
        startDate,
        endDate,
        middleSurveyAnswered: false,
        finalSurveyAnswered: false,
        currentDate,
      });

      expect(evalResult.isMidpointReached).toBe(true);
      expect(evalResult.isMiddleSurveyDue).toBe(true);
      expect(evalResult.actionsDue).toContain('MIDDLE_SURVEY_CHASE');
    });

    it('triggers Final Survey T-7 chaser (AUTO-026) at 7 days before completion', () => {
      // End date: Nov 12. Current: Nov 06 (6 days remaining)
      const currentDate = new Date('2026-11-06T12:00:00Z');
      const evalResult = evaluateSurveyChasing({
        applicationId: 'APP-CHASE-01',
        startDate,
        endDate,
        middleSurveyAnswered: true,
        finalSurveyAnswered: false,
        currentDate,
      });

      expect(evalResult.isFinalSurveyDue).toBe(true);
      expect(evalResult.actionsDue).toContain('FINAL_SURVEY_CHASE_T7');
    });

    it('triggers Final Survey T-3 chaser at 3 days before completion', () => {
      // Current: Nov 10 (2 days remaining)
      const currentDate = new Date('2026-11-10T12:00:00Z');
      const evalResult = evaluateSurveyChasing({
        applicationId: 'APP-CHASE-01',
        startDate,
        endDate,
        middleSurveyAnswered: true,
        finalSurveyAnswered: false,
        currentDate,
      });

      expect(evalResult.actionsDue).toContain('FINAL_SURVEY_CHASE_T3');
    });

    it('triggers Final Survey T-0 chaser on departure day', () => {
      // Current: Nov 12 (departure day)
      const currentDate = new Date('2026-11-12T18:00:00Z');
      const evalResult = evaluateSurveyChasing({
        applicationId: 'APP-CHASE-01',
        startDate,
        endDate,
        middleSurveyAnswered: true,
        finalSurveyAnswered: false,
        currentDate,
      });

      expect(evalResult.actionsDue).toContain('FINAL_SURVEY_CHASE_T0');
    });

    it('does not trigger any survey chasing when both surveys are answered', () => {
      const currentDate = new Date('2026-11-10T12:00:00Z');
      const evalResult = evaluateSurveyChasing({
        applicationId: 'APP-CHASE-01',
        startDate,
        endDate,
        middleSurveyAnswered: true,
        finalSurveyAnswered: true,
        currentDate,
      });

      expect(evalResult.actionsDue).toHaveLength(0);
      expect(evalResult.alertMessage).toBeUndefined();
    });
  });
});
