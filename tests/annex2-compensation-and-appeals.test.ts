/**
 * Annex 2 Draft Compensation & Annex 9 Appeal Window Test Suite
 * Statutory References: AEPP Annex 2 (Compensation Schedules), Annex 9 (Appeals), AFPM, REQ-081..083, TEST-075, TEST-077
 * Jurisdiction: AIESEC in Rabat (LC Rabat, MC Morocco)
 */

import { describe, it, expect } from 'vitest';
import {
  calculateAnnex2DraftCompensation,
  trackAnnex9AppealWindow,
} from '../src/lib/cases/compensation-calculator';

describe('Plan 05-02: Annex 2 Compensation & Annex 9 Appeals Suite', () => {
  describe('REQ-081 & TEST-075: Annex 2 Draft Compensation Calculator', () => {
    it('calculates accurate prorated fee refund when exchange is <= 70% completed', () => {
      // 14 days completed out of 42 days = 33.3% (<= 70%)
      // 3 unfulfilled standards out of 18 on 3,000 MAD fee = (3/18) * 3000 = 500 MAD
      const report = calculateAnnex2DraftCompensation({
        caseId: 'case_001',
        epName: 'Sofia Rossi',
        homeLc: 'AIESEC in Milan',
        totalFeePaidMad: 3000,
        exchangeDurationDays: 42,
        completedDays: 14,
        unfulfilledStandardsCount: 3,
        totalStandardsCount: 18,
      });

      expect(report.requiresHumanApproval).toBe(true);
      expect(report.status).toBe('DRAFT_ESTIMATE');
      expect(report.completionPercentage).toBe(33);
      expect(report.isPast70PercentDismissalThreshold).toBe(false);

      const feeItem = report.lineItems.find((i) => i.category === 'PRORATED_FEE_REFUND');
      expect(feeItem).toBeDefined();
      expect(feeItem?.amountMad).toBe(500);
      expect(report.totalDraftCompensationMad).toBe(500);
    });

    it('enforces 70% completion rule reducing fee refund entitlement by 50%', () => {
      // 35 days completed out of 42 days = 83.3% (> 70% statutory threshold)
      // Raw refund: (3/18) * 3000 = 500 MAD.
      // Under >70% rule, reduced by 50% = 250 MAD.
      const report = calculateAnnex2DraftCompensation({
        caseId: 'case_002',
        epName: 'Lucas Silva',
        homeLc: 'AIESEC in Curitiba',
        totalFeePaidMad: 3000,
        exchangeDurationDays: 42,
        completedDays: 35,
        unfulfilledStandardsCount: 3,
        totalStandardsCount: 18,
      });

      expect(report.isPast70PercentDismissalThreshold).toBe(true);
      expect(report.completionPercentage).toBe(83);

      const feeItem = report.lineItems.find((i) => i.category === 'PRORATED_FEE_REFUND');
      expect(feeItem?.amountMad).toBe(250);
      expect(feeItem?.description).toContain('>70% duration threshold');
    });

    it('applies 2% daily fine on unpaid monthly stipend after Day 30', () => {
      // 4,000 MAD monthly stipend, delayed by 10 days past Day 30
      // 2% of 4,000 = 80 MAD/day. 80 * 10 = 800 MAD fine.
      const report = calculateAnnex2DraftCompensation({
        caseId: 'case_003',
        epName: 'Elena Petrova',
        homeLc: 'AIESEC in Sofia',
        totalFeePaidMad: 0,
        exchangeDurationDays: 42,
        completedDays: 40,
        unfulfilledStandardsCount: 0,
        monthlyStipendMad: 4000,
        stipendDelayDaysAfterDay30: 10,
      });

      const stipendFineItem = report.lineItems.find((i) => i.category === 'SALARY_DELAY_FINE');
      expect(stipendFineItem).toBeDefined();
      expect(stipendFineItem?.amountMad).toBe(800);
      expect(report.totalDraftCompensationMad).toBe(800);
    });

    it('incorporates emergency accommodation allowance subject to 2,500 MAD statutory ceiling', () => {
      // 12 nights at 250 MAD = 3000 MAD -> capped at 2,500 MAD
      const report = calculateAnnex2DraftCompensation({
        caseId: 'case_004',
        epName: 'Sofia Rossi',
        homeLc: 'AIESEC in Milan',
        totalFeePaidMad: 0,
        exchangeDurationDays: 42,
        completedDays: 10,
        unfulfilledStandardsCount: 0,
        emergencyAccommodationNights: 12,
        emergencyNightRateMad: 250,
      });

      const housingItem = report.lineItems.find((i) => i.category === 'EMERGENCY_ACCOMMODATION');
      expect(housingItem?.amountMad).toBe(2500); // Capped at 2500 MAD
    });
  });

  describe('REQ-082 & TEST-077: Annex 9 Appeal Window Tracker (10-Day Clock)', () => {
    const rulingDate = '2026-03-01T12:00:00Z';

    it('tracks active appeal window and remaining hours', () => {
      // Evaluated 3 days after ruling (7 days / 168 hours remain)
      const currentDate = new Date('2026-03-04T12:00:00Z');
      const appeal = trackAnnex9AppealWindow({
        caseId: 'case_001',
        caseNumber: 'CASE-2026-RABAT-101',
        rulingDate,
        currentDate,
      });

      expect(appeal.status).toBe('WINDOW_ACTIVE');
      expect(appeal.isWindowExpired).toBe(false);
      expect(appeal.isStayOfExecutionActive).toBe(false);
      expect(appeal.remainingHours).toBe(168);
    });

    it('activates stay of execution when appeal is filed within 10-day window', () => {
      // Appeal filed 6 days after ruling (within 10 days)
      const appealFiledAt = '2026-03-07T14:00:00Z';
      const currentDate = new Date('2026-03-07T15:00:00Z');

      const appeal = trackAnnex9AppealWindow({
        caseId: 'case_001',
        caseNumber: 'CASE-2026-RABAT-101',
        rulingDate,
        appealFiledAt,
        appellantRole: 'HOME_LC',
        appellantName: 'AIESEC in Milan',
        appealGrounds: 'New evidence regarding host mentor communication submitted.',
        currentDate,
      });

      expect(appeal.status).toBe('APPEAL_FILED');
      expect(appeal.isStayOfExecutionActive).toBe(true);
      expect(appeal.appellantRole).toBe('HOME_LC');
    });

    it('marks ruling as final and binding when 10-day window elapses without appeal', () => {
      // Evaluated 11 days after ruling
      const currentDate = new Date('2026-03-12T13:00:00Z');
      const appeal = trackAnnex9AppealWindow({
        caseId: 'case_001',
        caseNumber: 'CASE-2026-RABAT-101',
        rulingDate,
        currentDate,
      });

      expect(appeal.status).toBe('FINAL_AND_BINDING');
      expect(appeal.isWindowExpired).toBe(true);
      expect(appeal.isStayOfExecutionActive).toBe(false);
      expect(appeal.remainingHours).toBe(0);
    });
  });
});
