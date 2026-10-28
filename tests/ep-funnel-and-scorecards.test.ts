import { describe, it, expect } from 'vitest';
import { maskPassportNumber, validatePassportForMorocco } from '../src/lib/funnel/passport-validator';
import { evaluateScorecard, type InterviewScorecardMetrics } from '../src/lib/funnel/scorecard';
import { transitionEpStage, type EpFunnelApplication } from '../src/lib/funnel/ep-funnel-machine';

describe('Plan 02-03: EP Funnel & Readiness State Machine (SM-04)', () => {
  describe('Passport Data Minimisation & Moroccan Validity (DEC-010)', () => {
    it('masks passport number for privacy preservation', () => {
      expect(maskPassportNumber('AB1234567')).toBe('AB*****67');
      expect(maskPassportNumber('FR987654321')).toBe('FR*******21');
      expect(maskPassportNumber('A123')).toBe('A123');
    });

    it('approves a passport valid for more than 6 months (180 days) after project end', () => {
      const res = validatePassportForMorocco({
        rawPassportNumber: 'AB1234567',
        issuingCountryCode: 'FR',
        expirationDate: '2027-08-01',
        projectEndDate: '2026-12-15', // ~228 days difference (>180 days)
      });

      expect(res.isValidForEntry).toBe(true);
      expect(res.maskedNumber).toBe('AB*****67');
      expect(res.monthsValidBeyondProject).toBeGreaterThan(6);
      expect(res.validationError).toBeUndefined();
    });

    it('rejects a passport with under 6 months validity after project end', () => {
      const res = validatePassportForMorocco({
        rawPassportNumber: 'AB1234567',
        issuingCountryCode: 'FR',
        expirationDate: '2027-02-01', // ~48 days difference (<180 days)
        projectEndDate: '2026-12-15',
      });

      expect(res.isValidForEntry).toBe(false);
      expect(res.validationError).toContain('Moroccan Immigration Invariant Breach (DEC-010)');
    });
  });

  describe('Scorecard Rubric Engine (REQ-045, THR-042)', () => {
    it('computes weighted composite score accurately', () => {
      const metrics: InterviewScorecardMetrics = {
        languageProficiency: 80, // 80 * 0.3 = 24
        sdgMotivationAndAlignment: 90, // 90 * 0.3 = 27
        availabilityAndCommitment: 85, // 85 * 0.2 = 17
        culturalAdaptability: 75, // 75 * 0.2 = 15
        interviewerId: 'user_interviewer',
        interviewDate: '2026-10-26T14:00:00Z',
      };

      const evalRes = evaluateScorecard(metrics);
      expect(evalRes.compositeScore).toBe(83); // 24 + 27 + 17 + 15 = 83
      expect(evalRes.passed).toBe(true);
      expect(evalRes.recommendation).toBe('ACCEPT');
    });

    it('flags failing score when composite is below 70%', () => {
      const metrics: InterviewScorecardMetrics = {
        languageProficiency: 50, // 15
        sdgMotivationAndAlignment: 60, // 18
        availabilityAndCommitment: 70, // 14
        culturalAdaptability: 50, // 10
        interviewerId: 'user_interviewer',
        interviewDate: '2026-10-26T14:00:00Z',
      };

      const evalRes = evaluateScorecard(metrics);
      expect(evalRes.compositeScore).toBe(57); // 15 + 18 + 14 + 10 = 57
      expect(evalRes.passed).toBe(false);
      expect(evalRes.recommendation).toBe('REJECT');
    });
  });

  describe('TEST-042: EP Funnel Acceptance Gate Enforcement', () => {
    const validScorecard: InterviewScorecardMetrics = {
      languageProficiency: 85,
      sdgMotivationAndAlignment: 85,
      availabilityAndCommitment: 90,
      culturalAdaptability: 80,
      interviewerId: 'user_evaluator',
      interviewDate: '2026-10-26T14:00:00Z',
    };

    it('blocks transition to ACCEPTED if screening scorecard is missing', () => {
      const app: EpFunnelApplication = {
        id: 'ep-app-001',
        lcId: 'lc_rabat_001',
        opportunityId: 'opp-101',
        epName: 'Elena Rostova',
        epEmail: 'elena@aiesec.net',
        homeCountry: 'RO',
        stage: 'OP_INTERVIEWED',
        history: [],
      };

      const res = transitionEpStage(app, 'ACCEPTED', 'user_vp');
      expect(res.success).toBe(false);
      expect(res.error).toContain('Screening Gate Block (TEST-042)');
      expect(app.stage).toBe('OP_INTERVIEWED');
    });

    it('blocks transition to ACCEPTED if OP interview score is below 70%', () => {
      const failingOpScorecard: InterviewScorecardMetrics = {
        languageProficiency: 40,
        sdgMotivationAndAlignment: 50,
        availabilityAndCommitment: 60,
        culturalAdaptability: 50,
        interviewerId: 'op_supervisor',
        interviewDate: '2026-10-26T15:00:00Z',
      };

      const app: EpFunnelApplication = {
        id: 'ep-app-002',
        lcId: 'lc_rabat_001',
        opportunityId: 'opp-101',
        epName: 'Marco Rossi',
        epEmail: 'marco@aiesec.net',
        homeCountry: 'IT',
        stage: 'OP_INTERVIEWED',
        screeningScorecard: validScorecard,
        opInterviewScorecard: failingOpScorecard, // Below 70%
        history: [],
      };

      const res = transitionEpStage(app, 'ACCEPTED', 'user_vp');
      expect(res.success).toBe(false);
      expect(res.error).toContain('OP Interview Gate Block (TEST-042)');
    });

    it('allows progression from APPLIED through ACCEPTED and APPROVED with valid scorecards and passport', () => {
      const app: EpFunnelApplication = {
        id: 'ep-app-003',
        lcId: 'lc_rabat_001',
        opportunityId: 'opp-101',
        epName: 'Camille Laurent',
        epEmail: 'camille@aiesec.net',
        homeCountry: 'FR',
        stage: 'APPLIED',
        history: [],
      };

      // 1. APPLIED -> SCREENED
      expect(transitionEpStage(app, 'SCREENED', 'user_evaluator').success).toBe(true);

      // 2. SCREENED -> OP_INTERVIEW_SCHEDULED
      expect(transitionEpStage(app, 'OP_INTERVIEW_SCHEDULED', 'user_evaluator').success).toBe(true);

      // 3. OP_INTERVIEW_SCHEDULED -> OP_INTERVIEWED
      expect(transitionEpStage(app, 'OP_INTERVIEWED', 'user_evaluator').success).toBe(true);

      // Attach passing scorecards
      app.screeningScorecard = validScorecard;
      app.opInterviewScorecard = validScorecard;

      // 4. OP_INTERVIEWED -> ACCEPTED
      expect(transitionEpStage(app, 'ACCEPTED', 'user_evaluator').success).toBe(true);
      expect(app.stage).toBe('ACCEPTED');

      // Attach valid passport
      app.passportRecord = validatePassportForMorocco({
        rawPassportNumber: 'FR12345678',
        issuingCountryCode: 'FR',
        expirationDate: '2027-08-01',
        projectEndDate: '2026-12-15',
      });

      // 5. ACCEPTED -> APPROVED
      expect(transitionEpStage(app, 'APPROVED', 'user_vp').success).toBe(true);
      expect(app.stage).toBe('APPROVED');
    });
  });
});
