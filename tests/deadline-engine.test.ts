import { describe, it, expect, beforeEach } from 'vitest';
import {
  deadlineEngine,
  evaluateAlertLadder,
  getDaysRemaining,
  addDays,
} from '../src/lib/data-integrity/deadline-engine';
import {
  getMasterTrackerDb,
  resetMasterTrackerDb,
  partnerService,
  opportunityService,
  epService,
  exchangeService,
} from '../src/lib/data-integrity/master-tracker';
import { standardsService } from '../src/lib/data-integrity/standards-service';

describe('Plan 03-03: Deadline Engine & Radar Escalations (M3)', () => {
  const actorId = 'mem-wadii-001';
  let exchangeId: string;
  let epId: string;
  let partnerId: string;

  beforeEach(() => {
    resetMasterTrackerDb();

    const partner = partnerService.createPartner(
      {
        id: 'ptn-test-01',
        name: 'Casablanca Education Trust',
        tier: 'Tier 1',
        status: 'Active',
        owner_id: actorId,
      },
      actorId
    );
    partnerId = partner.id;

    opportunityService.createOpportunity(
      {
        id: 'opp-test-01',
        partner_id: partnerId,
        title: 'Teaching Specialist iGV',
        programme: 'GV',
        standard_duration_weeks: 6,
        open_slots: 2,
        status: 'Open',
        owner_id: actorId,
      },
      actorId
    );

    const ep = epService.createEp(
      {
        id: 'ep-test-01',
        expa_ep_id: 111,
        full_name: 'Arthur Pendelton',
        email: 'arthur.p@example.com',
        home_mc: 'United Kingdom',
        home_lc: 'AIESEC in London',
        status: 'Open',
        owner_id: actorId,
      },
      actorId
    );
    epId = ep.id;

    const created = exchangeService.createExchange(
      {
        ep_id: epId,
        opportunity_id: 'opp-test-01',
        programme: 'GV',
        status: 'APD',
        approved_at: '2026-11-01',
        re_date: '2026-12-01',
        fi_date: '2027-01-15',
        owner_id: actorId,
      },
      actorId
    );
    exchangeId = created.exchange.id;
  });

  describe('1. Alert Ladder & Escalation Hierarchy (§8)', () => {
    it('evaluates status and escalation according to days remaining', () => {
      // > 7 days -> upcoming (owner)
      expect(evaluateAlertLadder(10)).toEqual({ status: 'upcoming', escalation: 'owner' });

      // 3 to 7 days -> notice (owner)
      expect(evaluateAlertLadder(7)).toEqual({ status: 'notice', escalation: 'owner' });
      expect(evaluateAlertLadder(4)).toEqual({ status: 'notice', escalation: 'owner' });

      // 1 to 2 days -> warning (lcvp)
      expect(evaluateAlertLadder(2)).toEqual({ status: 'warning', escalation: 'lcvp' });
      expect(evaluateAlertLadder(1)).toEqual({ status: 'warning', escalation: 'lcvp' });

      // 0 days (due today) -> urgent (lcvp)
      expect(evaluateAlertLadder(0)).toEqual({ status: 'urgent', escalation: 'lcvp' });

      // < 0 days (overdue) -> overdue (lcp)
      expect(evaluateAlertLadder(-1)).toEqual({ status: 'overdue', escalation: 'lcp' });
      expect(evaluateAlertLadder(-5)).toEqual({ status: 'overdue', escalation: 'lcp' });
    });

    it('computes days remaining and date arithmetic accurately', () => {
      expect(addDays('2026-11-01', 14)).toBe('2026-11-15');
      expect(addDays('2026-11-15', -14)).toBe('2026-11-01');
      expect(getDaysRemaining('2026-11-15', '2026-11-01')).toBe(14);
      expect(getDaysRemaining('2026-11-01', '2026-11-15')).toBe(-14);
    });
  });

  describe('2. Acceptance Test T-12: Visa Documents Delivery Cutoff (§8, §16 T-12, DQ-053)', () => {
    it('T-12: Given approval on day 0 with visa required and no visa docs on day 15, then DQ-053 urgent', () => {
      const masterDb = getMasterTrackerDb();
      const exchange = masterDb.exchanges.get(exchangeId)!;

      // Approval date is 2026-11-01 (Day 0)
      // Check on 2026-11-15 (Day 14) -> due date, no DQ-053 urgent yet
      const day14Check = deadlineEngine.evaluateExchangeDeadlines(exchange, '2026-11-15');
      expect(day14Check.dqIssues.some((i) => i.rule_id === 'DQ-053')).toBe(false);

      // Check on 2026-11-16 (Day 15) -> DQ-053 is Urgent!
      const day15Check = deadlineEngine.evaluateExchangeDeadlines(exchange, '2026-11-16');
      const dq053 = day15Check.dqIssues.find((i) => i.rule_id === 'DQ-053');

      expect(dq053).toBeDefined();
      expect(dq053?.rule_id).toBe('DQ-053');
      expect(dq053?.severity).toBe('Urgent');
      expect(dq053?.owner_id).toBe(actorId);
      expect(dq053?.details?.days_since_approval).toBe(15);
      expect(dq053?.subject).toContain('Visa docs not delivered within 14 d of approval');

      // Once visa standard is marked delivered with proof, deadline item is resolved/cleared
      standardsService.updateTrackedStatus(exchangeId, 5, 'delivered', actorId, 'proof-visa-01');
      const clearedCheck = deadlineEngine.evaluateExchangeDeadlines(exchange, '2026-11-16');
      expect(clearedCheck.items.some((i) => i.id === `dl-visa-${exchangeId}`)).toBe(false);
      expect(clearedCheck.dqIssues.some((i) => i.rule_id === 'DQ-053')).toBe(false);
    });
  });

  describe('3. Acceptance Test T-17: Partner Touchpoint Staleness (§8, §16 T-17, DQ-060)', () => {
    it('T-17: Given partner with no touchpoint for 36 days, then DQ-060 warns', () => {
      const masterDb = getMasterTrackerDb();
      const partner = masterDb.partners.get(partnerId)!;

      // Created at day 0 (2026-10-01)
      partner.last_touchpoint_at = '2026-10-01T10:00:00Z';

      // On day 35 (2026-11-05), touchpoint is due today -> no warning yet
      const day35Check = deadlineEngine.evaluatePartnerDeadlines(partner, '2026-11-05');
      expect(day35Check.dqIssues.some((i) => i.rule_id === 'DQ-060')).toBe(false);

      // On day 36 (2026-11-06) -> DQ-060 warns!
      const day36Check = deadlineEngine.evaluatePartnerDeadlines(partner, '2026-11-06');
      const dq060 = day36Check.dqIssues.find((i) => i.rule_id === 'DQ-060');

      expect(dq060).toBeDefined();
      expect(dq060?.rule_id).toBe('DQ-060');
      expect(dq060?.severity).toBe('Warn');
      expect(dq060?.owner_id).toBe(actorId);
      expect(dq060?.details?.days_since_touchpoint).toBe(36);
      expect(dq060?.subject).toContain('without touchpoint within 35 days');
    });
  });

  describe('4. Departure Support Procedure SLA (§8, DQ-056)', () => {
    it('raises DQ-056 warning when departure support is not sent by fi_date - 14 d', () => {
      const masterDb = getMasterTrackerDb();
      const exchange = masterDb.exchanges.get(exchangeId)!;

      // Transition exchange to RE
      exchange.status = 'RE';
      exchange.fi_date = '2026-12-15';

      // fi_date - 14 d is 2026-12-01
      // On 2026-11-25 (6 days before cutoff) -> T-6 notice, no DQ-056 yet
      const beforeCutoff = deadlineEngine.evaluateExchangeDeadlines(exchange, '2026-11-25');
      expect(beforeCutoff.dqIssues.some((i) => i.rule_id === 'DQ-056')).toBe(false);

      // On 2026-12-02 (past cutoff) -> DQ-056 warning!
      const pastCutoff = deadlineEngine.evaluateExchangeDeadlines(exchange, '2026-12-02');
      const dq056 = pastCutoff.dqIssues.find((i) => i.rule_id === 'DQ-056');

      expect(dq056).toBeDefined();
      expect(dq056?.rule_id).toBe('DQ-056');
      expect(dq056?.severity).toBe('Warn');
      expect(dq056?.subject).toContain('Departure support not sent by fi_date - 14 d');
    });
  });

  describe('5. National Compliance Radar & Nightly Scanner (§8, §11)', () => {
    it('computes ECB quarterly and ICB audit submission radar deadlines', () => {
      const radar = deadlineEngine.computeComplianceRadar(2026, '2026-04-01');

      // 4 ECB reports + 2 ICB checks = 6 statutory compliance deadlines
      expect(radar).toHaveLength(6);

      const ecbQ1 = radar.find((r) => r.id === 'dl-ecb-Q1-2026');
      expect(ecbQ1?.due_at).toContain('2026-04-28');
      expect(ecbQ1?.rule_key).toBe('ecb.report_deadlines');

      const icbSpring = radar.find((r) => r.id === 'dl-icb-Spring-2026');
      expect(icbSpring?.due_at).toContain('2026-03-31');
      expect(icbSpring?.rule_key).toBe('icb.audit_check_months');
    });

    it('executes full nightly deadline scan and produces radar summary', () => {
      const scanResult = deadlineEngine.runNightlyDeadlineScan('2026-11-16');

      expect(scanResult.items.length).toBeGreaterThan(0);
      expect(scanResult.summary.total).toBe(scanResult.items.length);
      expect(scanResult.summary.byStatus).toBeDefined();
      expect(scanResult.summary.byEscalation).toBeDefined();

      // Check radar summary escalation levels
      const totalEscalations =
        scanResult.summary.byEscalation.owner +
        scanResult.summary.byEscalation.lcvp +
        scanResult.summary.byEscalation.lcp;
      expect(totalEscalations).toBe(scanResult.summary.total);
    });
  });
});
