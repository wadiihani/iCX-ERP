import { describe, it, expect } from 'vitest';
import {
  resolveMoroccanVisaRegime,
  SEARCHABLE_COUNTRIES_CATALOG,
} from '../src/lib/ir/moroccan-visa-matrix';
import {
  evaluatePostApdVisaPackSla,
  evaluatePickupGuideSla,
  evaluateUnreachableEpSafetyProtocol,
} from '../src/lib/sla/sla-engine';
import {
  validateIgvRealizationDateWindow,
  transitionEpStage,
  calculateMatchmakerScore,
  type EpFunnelApplication,
} from '../src/lib/funnel/ep-funnel-machine';
import { STANDARDS_WITH_10_SPLIT } from '../src/components/delivery/standards-modal';

describe('Phase 15: IR Supply Pipeline, EXPA Alignment & EP Funnel Lifecycle', () => {
  // Plan 15-01: Moroccan Visa Matrix & Resolver
  describe('Plan 15-01: Searchable Moroccan Visa Regime Resolver (HUB-VISA-01)', () => {
    it('resolves bilateral visa-free entry for Colombia, France, and Germany (14-day lead time)', () => {
      const co = resolveMoroccanVisaRegime({ nationalityCountry: 'Colombia' });
      expect(co.regime).toBe('VISA_FREE_90D');
      expect(co.leadTimeDaysRequired).toBe(14);
      expect(co.isExempt).toBe(true);

      const de = resolveMoroccanVisaRegime({ nationalityCountry: 'DE' });
      expect(de.regime).toBe('VISA_FREE_90D');
    });

    it('resolves direct AEVM eVisa for India and Egypt (21-day lead time)', () => {
      const inRes = resolveMoroccanVisaRegime({ nationalityCountry: 'India' });
      expect(inRes.regime).toBe('AEVM_EVISA');
      expect(inRes.leadTimeDaysRequired).toBe(21);
      expect(inRes.isAevmEligible).toBe(true);
    });

    it('upgrades consular nationality to AEVM eVisa when holding valid Schengen / US / UK residence permit', () => {
      // Indian or Cameroonian national residing in Germany (DE)
      const resPermitHolder = resolveMoroccanVisaRegime({
        nationalityCountry: 'Cameroon',
        residenceCountry: 'DE',
        hasSchengenOrUkOrUsPermit: true,
      });

      expect(resPermitHolder.regime).toBe('AEVM_EVISA');
      expect(resPermitHolder.leadTimeDaysRequired).toBe(21);
      expect(resPermitHolder.legalBasis).toContain('Residence Permit exemption');
    });

    it('resolves consular embassy visa for Cameroon and Nigeria without EU/US permit (45-day lead time)', () => {
      const cm = resolveMoroccanVisaRegime({
        nationalityCountry: 'Cameroon',
        residenceCountry: 'CM',
        hasSchengenOrUkOrUsPermit: false,
      });

      expect(cm.regime).toBe('CONSULAR_EMBASSY_VISA');
      expect(cm.leadTimeDaysRequired).toBe(45);
      expect(cm.requiresEmbassyPack).toBe(true);
    });
  });

  // Plan 15-02: Live Date-Math SLA Engine & Exception Breaks
  describe('Plan 15-02: Live Date-Math SLA Timers & AEPP Exception Handling (HUB-EP-03, HUB-EP-04)', () => {
    it('computes 14-day Post-APD Visa Pack SLA countdown and detects breach (AEPP 4.4.3.1)', () => {
      const now = new Date('2026-10-29T10:00:00Z').getTime();

      // Approved 5 days ago, not yet sent -> 9 days remaining
      const inProgress = evaluatePostApdVisaPackSla('2026-10-24T10:00:00Z', null, now);
      expect(inProgress.isBreached).toBe(false);
      expect(inProgress.status).toBe('IN_COUNTDOWN');
      expect(inProgress.daysRemaining).toBe(9);

      // Approved 20 days ago, not yet sent -> Breached by 6 days
      const breached = evaluatePostApdVisaPackSla('2026-10-09T10:00:00Z', null, now);
      expect(breached.isBreached).toBe(true);
      expect(breached.status).toBe('BREACHED');
      expect(breached.badgeLabel).toContain('Overdue');

      // Sent within window -> Completed
      const completed = evaluatePostApdVisaPackSla('2026-10-09T10:00:00Z', '2026-10-14T10:00:00Z', now);
      expect(completed.status).toBe('COMPLETED');
      expect(completed.isBreached).toBe(false);
    });

    it('computes 3-day Pre-Arrival Written Pickup Guide SLA (Standard #6)', () => {
      const now = new Date('2026-10-29T10:00:00Z').getTime();

      // Arriving in 10 days (Nov 8), guide not sent -> 7 days remaining until deadline
      const onTrack = evaluatePickupGuideSla('2026-11-08', null, now);
      expect(onTrack.isBreached).toBe(false);
      expect(onTrack.status).toBe('IN_COUNTDOWN');

      // Arriving tomorrow (Oct 30), guide not sent -> Deadline was Oct 27, breached
      const overdue = evaluatePickupGuideSla('2026-10-30', null, now);
      expect(overdue.isBreached).toBe(true);
      expect(overdue.status).toBe('BREACHED');
      expect(overdue.badgeLabel).toContain('Standard #6 Overdue');
    });

    it('triggers critical safety alert when EP contact is idle for >48h during realization (AEPP 4.5.4.11)', () => {
      const now = new Date('2026-10-29T12:00:00Z').getTime();

      // Contact 24 hours ago -> Safe
      const safe = evaluateUnreachableEpSafetyProtocol({
        lastContactTimestamp: '2026-10-28T12:00:00Z',
        currentTimestampMs: now,
      });
      expect(safe.isCrisisEscalated).toBe(false);
      expect(safe.hoursUnreachable).toBe(24);

      // Contact 60 hours ago -> Crisis Escalation
      const crisis = evaluateUnreachableEpSafetyProtocol({
        lastContactTimestamp: '2026-10-27T00:00:00Z',
        currentTimestampMs: now,
      });
      expect(crisis.isCrisisEscalated).toBe(true);
      expect(crisis.hoursUnreachable).toBe(60);
      expect(crisis.escalationNotice).toContain('CRITICAL SAFETY ALERT');
    });
  });

  // Plan 15-03: Realization Gate, Standards #10a/#10b Split, & Matchmaker Score
  describe('Plan 15-03: Realization Gates (±20d Rule), Standards Split, & Matchmaker Score', () => {
    it('enforces APIP 5.3.5.1 ±20 days rule for iGV realization start date', () => {
      const slotStart = '2026-11-01';

      // 10 days difference -> Allowed
      const compliant = validateIgvRealizationDateWindow('2026-11-10', slotStart);
      expect(compliant.isValid).toBe(true);
      expect(compliant.daysDifference).toBe(9);

      // 25 days difference -> Breach
      const breach = validateIgvRealizationDateWindow('2026-11-26', slotStart);
      expect(breach.isValid).toBe(false);
      expect(breach.error).toContain('APIP 5.3.5.1 Violation');
      expect(breach.daysDifference).toBe(25);
    });

    it('blocks transition to REALIZED if Pre-Arrival Standards #4–#9 are incomplete', () => {
      const app: EpFunnelApplication = {
        id: 'app-501',
        lcId: 'lc_rabat',
        opportunityId: 'opp-1',
        epName: 'Sofia Martinez',
        epEmail: 'sofia@email.com',
        homeCountry: 'Colombia',
        product: 'iGV',
        slotStartDate: '2026-11-01',
        stage: 'PRE_ARRIVAL_CLEAR',
        history: [],
      };

      // Only 4 of 6 pre-arrival standards delivered
      const res = transitionEpStage(app, 'REALIZED', 'usr_admin', {
        actualRealizedDate: '2026-11-02',
        standardsDeliveredCount: 4, // Needs 6
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain('Realization Gate Block (CHG-29)');
      expect(app.stage).toBe('PRE_ARRIVAL_CLEAR');

      // 6 of 6 pre-arrival standards delivered -> Realization allowed
      const successRes = transitionEpStage(app, 'REALIZED', 'usr_admin', {
        actualRealizedDate: '2026-11-02',
        standardsDeliveredCount: 6,
      });

      expect(successRes.success).toBe(true);
      expect(app.stage).toBe('REALIZED');
    });

    it('splits Standard #10 into #10a (Middle Survey) and #10b (Final Survey)', () => {
      const std10a = STANDARDS_WITH_10_SPLIT.find((s) => s.id === '10a');
      const std10b = STANDARDS_WITH_10_SPLIT.find((s) => s.id === '10b');

      expect(std10a).toBeDefined();
      expect(std10a?.name).toContain('Initial Alignment');
      expect(std10a?.stage).toContain('Middle');

      expect(std10b).toBeDefined();
      expect(std10b?.name).toContain('Closing Alignment');
      expect(std10b?.stage).toContain('Final');
    });

    it('computes Algorithmic Matchmaker Score based on visa feasibility, language, skill, and dates', () => {
      const scoreResult = calculateMatchmakerScore({
        nationalityCountry: 'Colombia', // Visa exempt 90d
        residenceCountry: 'CO',
        applicantLanguages: ['Spanish', 'English', 'French'],
        requiredLanguages: ['English', 'French'],
        applicantFieldOrSkills: ['Digital Literacy', 'Coding', 'Scratch'],
        targetFieldOrSdg: 'Digital Literacy',
        slotStartDate: '2026-12-01',
      });

      expect(scoreResult.matchScore).toBeGreaterThanOrEqual(80);
      expect(scoreResult.tier).toBe('HIGH');
      expect(scoreResult.breakdown.visaLeadScore).toBe(100);
      expect(scoreResult.breakdown.languageScore).toBe(100);
      expect(scoreResult.breakdown.skillMatchScore).toBe(95);
    });
  });
});
