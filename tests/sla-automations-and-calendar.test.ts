import { describe, it, expect } from 'vitest';
import {
  isMoroccoBusinessDay,
  addMoroccoBusinessHours,
  calculateBusinessHoursBetween,
} from '../src/lib/sla/morocco-calendar';
import {
  evaluateFirstContactSla,
  evaluatePreArrivalHardLock,
  evaluateUnreachableEpSafetyProtocol,
} from '../src/lib/sla/sla-engine';
import {
  dispatchSlaEscalation,
} from '../src/lib/sla/escalation-dispatcher';

describe('Plan 02-05: Deterministic SLA Automations & Moroccan Working Calendar', () => {
  // TEST-045: Africa/Casablanca working calendar & statutory holiday skip
  describe('Moroccan Working Calendar (TEST-045, REQ-048)', () => {
    it('correctly identifies business days and excludes weekends', () => {
      // 2026-10-26 is a Monday (business day)
      const monday = new Date('2026-10-26T10:00:00Z');
      expect(isMoroccoBusinessDay(monday)).toBe(true);

      // 2026-10-31 is a Saturday (weekend)
      const saturday = new Date('2026-10-31T10:00:00Z');
      expect(isMoroccoBusinessDay(saturday)).toBe(false);

      // 2026-11-01 is a Sunday (weekend)
      const sunday = new Date('2026-11-01T10:00:00Z');
      expect(isMoroccoBusinessDay(sunday)).toBe(false);
    });

    it('excludes Moroccan statutory holidays (e.g. Green March Day on Nov 6)', () => {
      const greenMarchDay = new Date('2026-11-06T12:00:00Z');
      expect(isMoroccoBusinessDay(greenMarchDay)).toBe(false);

      const independenceDay = new Date('2026-11-18T10:00:00Z');
      expect(isMoroccoBusinessDay(independenceDay)).toBe(false);
    });

    it('adds business hours skipping weekend days correctly', () => {
      // Friday 2026-10-30 at 16:00
      const fridayAfternoon = new Date('2026-10-30T16:00:00Z');
      // Add 24 business hours -> skips Saturday (31st) and Sunday (1st)
      const deadline = addMoroccoBusinessHours(fridayAfternoon, 24);

      // 8h on Friday evening (16:00 to 24:00)
      // Sat + Sun skipped (48h)
      // 16h on Monday (00:00 to 16:00)
      // Total elapsed calendar hours = 8 + 48 + 16 = 72 hours
      const diffHours = (deadline.getTime() - fridayAfternoon.getTime()) / (1000 * 60 * 60);
      expect(diffHours).toBe(72);
      expect(deadline.toISOString()).toBe('2026-11-02T16:00:00.000Z');
    });

    it('calculates business hours accurately ignoring weekend days', () => {
      const fridayStart = new Date('2026-10-30T10:00:00Z');
      const mondaySameTime = new Date('2026-11-02T10:00:00Z'); // 72 real hours apart

      const bizHours = calculateBusinessHoursBetween(fridayStart, mondaySameTime);
      // Friday 10:00 to 24:00 = 14h
      // Sat + Sun = 0h
      // Monday 00:00 to 10:00 = 10h
      // Total biz hours = 24h
      expect(bizHours).toBe(24);
    });
  });

  // TEST-044: First-Contact SLA (AUTO-010, THR-002)
  describe('First-Contact SLA Evaluation (TEST-044, AUTO-010)', () => {
    it('evaluates normal state when contact is well within 24h', () => {
      const appliedAt = '2026-10-26T08:00:00Z';
      const contactedAt = '2026-10-26T14:00:00Z'; // 6 hours later

      const result = evaluateFirstContactSla(appliedAt, contactedAt);
      expect(result.isBreached).toBe(false);
      expect(result.urgency).toBe('NORMAL');
      expect(result.hoursElapsed).toBe(6);
      expect(result.hoursAllowed).toBe(24);
    });

    it('triggers WARNING_80 when >= 80% (19.2h) of window has elapsed without contact', () => {
      const appliedAt = '2026-10-26T00:00:00Z';
      const evaluationNow = new Date('2026-10-26T20:00:00Z'); // 20 hours later

      const result = evaluateFirstContactSla(appliedAt, null, evaluationNow);
      expect(result.isBreached).toBe(false);
      expect(result.urgency).toBe('WARNING_80');
      expect(result.hoursElapsed).toBe(20);
      expect(result.alertMessage).toContain('80% of first-contact window elapsed');
    });

    it('triggers BREACHED_100 and notifies TL/VP when 24h is exceeded', () => {
      const appliedAt = '2026-10-26T08:00:00Z';
      const evaluationNow = new Date('2026-10-27T12:00:00Z'); // 28 business hours later

      const result = evaluateFirstContactSla(appliedAt, null, evaluationNow);
      expect(result.isBreached).toBe(true);
      expect(result.urgency).toBe('BREACHED_100');
      expect(result.alertMessage).toContain('SLA Breach AUTO-010 (TEST-044)');
    });

    it('escalates to CRITICAL_150 when >= 36 business hours (150%) elapse without contact', () => {
      const appliedAt = '2026-10-26T08:00:00Z';
      const evaluationNow = new Date('2026-10-28T00:00:00Z'); // 40 business hours later

      const result = evaluateFirstContactSla(appliedAt, null, evaluationNow);
      expect(result.isBreached).toBe(true);
      expect(result.urgency).toBe('CRITICAL_150');
    });
  });

  // TEST-046: 14-Day Pre-Arrival Hard Lock (AUTO-018, THR-010)
  describe('Pre-Arrival Hard Lock Protocol (TEST-046, AUTO-018)', () => {
    const realizationStartDate = '2026-11-10T00:00:00Z';

    it('does not trigger hard lock when arrival is >14 days away', () => {
      // 20 days prior
      const currentMs = new Date('2026-10-21T00:00:00Z').getTime();
      const evalResult = evaluatePreArrivalHardLock({
        realizationStartDate,
        currentDateMs: currentMs,
        hasBedAllocated: false,
        hasFlightTicketVerified: false,
        isVisaCleared: false,
      });

      expect(evalResult.isHardLockActive).toBe(false);
      expect(evalResult.daysUntilArrival).toBe(20);
      expect(evalResult.blockerMessage).toBeUndefined();
    });

    it('activates hard lock at T-14 and blocks clearance if statutory requirements are missing', () => {
      // 10 days prior
      const currentMs = new Date('2026-10-31T00:00:00Z').getTime();
      const evalResult = evaluatePreArrivalHardLock({
        realizationStartDate,
        currentDateMs: currentMs,
        hasBedAllocated: false,
        hasFlightTicketVerified: true,
        isVisaCleared: false,
      });

      expect(evalResult.isHardLockActive).toBe(true);
      expect(evalResult.isArrivalCleared).toBe(false);
      expect(evalResult.missingItems).toContain('Confirmed Bed Allocation (Standard #8)');
      expect(evalResult.missingItems).toContain('Valid Entry Visa or Exemption Clearance (Standard #6)');
      expect(evalResult.blockerMessage).toContain('Pre-Arrival Hard Lock AUTO-018 (TEST-046)');
    });

    it('grants ARRIVAL_CLEARED at T-14 when all bed, flight, and visa requirements are satisfied', () => {
      const currentMs = new Date('2026-11-01T00:00:00Z').getTime(); // 9 days prior
      const evalResult = evaluatePreArrivalHardLock({
        realizationStartDate,
        currentDateMs: currentMs,
        hasBedAllocated: true,
        hasFlightTicketVerified: true,
        isVisaCleared: true,
      });

      expect(evalResult.isHardLockActive).toBe(true);
      expect(evalResult.isArrivalCleared).toBe(true);
      expect(evalResult.missingItems).toHaveLength(0);
      expect(evalResult.blockerMessage).toBeUndefined();
    });
  });

  // TEST-047: Unreachable EP Safety Protocol (AUTO-022, THR-021)
  describe('Unreachable EP Safety Protocol (TEST-047, AUTO-022)', () => {
    it('remains calm when EP contacted within last 24h', () => {
      const nowMs = 1793000000000;
      const lastContact = new Date(nowMs - 12 * 60 * 60 * 1000); // 12h ago

      const result = evaluateUnreachableEpSafetyProtocol({
        lastContactTimestamp: lastContact,
        currentTimestampMs: nowMs,
      });

      expect(result.isCrisisEscalated).toBe(false);
      expect(result.hoursUnreachable).toBe(12);
      expect(result.escalationNotice).toBeUndefined();
    });

    it('engages crisis protocol and alerts LCP/MC VP when EP is unreachable for >48 hours', () => {
      const nowMs = 1793000000000;
      const lastContact = new Date(nowMs - 52 * 60 * 60 * 1000); // 52 hours ago

      const result = evaluateUnreachableEpSafetyProtocol({
        lastContactTimestamp: lastContact,
        currentTimestampMs: nowMs,
      });

      expect(result.isCrisisEscalated).toBe(true);
      expect(result.hoursUnreachable).toBe(52);
      expect(result.escalationNotice).toContain('CRITICAL SAFETY ALERT AUTO-022 (TEST-047)');
      expect(result.escalationNotice).toContain('LCP, MC VP, and Sending LC alerted immediately');
    });
  });

  // TEST-048: Multi-tier Escalation Dispatcher (REQ-052)
  describe('Multi-Tier Escalation Dispatcher (TEST-048, REQ-052)', () => {
    const basePayload = {
      applicationId: 'APP-RABAT-2026-99',
      epName: 'Sofia Rossi',
      slaName: 'First Contact SLA',
      hoursAllowed: 24,
    };

    it('routes NORMAL urgency only to Member', () => {
      const dispatch = dispatchSlaEscalation({
        ...basePayload,
        urgency: 'NORMAL',
        hoursElapsed: 5,
      });

      expect(dispatch.dispatchedTiers).toEqual(['MEMBER']);
      expect(dispatch.highestTier).toBe('MEMBER');
      expect(dispatch.recipients[0].role).toBe('MEMBER');
      expect(dispatch.recipients[0].mandatoryActionRequired).toBe(false);
    });

    it('escalates WARNING_80 to Team Leader via push notification', () => {
      const dispatch = dispatchSlaEscalation({
        ...basePayload,
        urgency: 'WARNING_80',
        hoursElapsed: 20,
      });

      expect(dispatch.dispatchedTiers).toContain('TEAM_LEADER');
      expect(dispatch.highestTier).toBe('TEAM_LEADER');
      const tl = dispatch.recipients.find((r) => r.role === 'TEAM_LEADER');
      expect(tl?.channel).toBe('PUSH_NOTIFICATION');
      expect(tl?.mandatoryActionRequired).toBe(true);
    });

    it('escalates BREACHED_100 to TL and VP iGV with email alert', () => {
      const dispatch = dispatchSlaEscalation({
        ...basePayload,
        urgency: 'BREACHED_100',
        hoursElapsed: 28,
      });

      expect(dispatch.dispatchedTiers).toEqual(['MEMBER', 'TEAM_LEADER', 'VP_IGV']);
      expect(dispatch.highestTier).toBe('VP_IGV');
      const vp = dispatch.recipients.find((r) => r.role === 'VP_IGV');
      expect(vp?.channel).toBe('EMAIL_ALERT');
      expect(vp?.mandatoryActionRequired).toBe(true);
    });

    it('escalates CRITICAL_150 or Safety Crisis to LCP with WhatsApp / Urgent Alert', () => {
      const dispatch = dispatchSlaEscalation({
        ...basePayload,
        urgency: 'CRITICAL_150',
        hoursElapsed: 40,
        isCrisis: true,
      });

      expect(dispatch.dispatchedTiers).toEqual(['MEMBER', 'TEAM_LEADER', 'VP_IGV', 'LCP']);
      expect(dispatch.highestTier).toBe('LCP');
      const lcp = dispatch.recipients.find((r) => r.role === 'LCP');
      expect(lcp?.channel).toBe('WHATSAPP_CRISIS');
      expect(dispatch.auditMessage).toContain('[SLA-ESCALATION]');
    });
  });
});
