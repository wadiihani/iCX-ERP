import { describe, it, expect, beforeEach } from 'vitest';
import {
  STATUTORY_STANDARD_DEFS,
  getStandardDef,
  isNegativeEpAnswer,
  getExchangeStandardsWithDefs,
  standardsService,
} from '../src/lib/data-integrity/standards-service';
import {
  getMasterTrackerDb,
  resetMasterTrackerDb,
  partnerService,
  opportunityService,
  epService,
  exchangeService,
} from '../src/lib/data-integrity/master-tracker';

describe('Plan 02-01: Exchange Standards Parallel-Truth Service (M2)', () => {
  const actorId = 'mem-wadii-001';
  let exchangeId: string;

  beforeEach(() => {
    resetMasterTrackerDb();

    // Set up active base records
    partnerService.createPartner(
      {
        id: 'ptn-test-01',
        name: 'Tech Maroc',
        tier: 'Tier 1',
        status: 'Active',
        owner_id: actorId,
      },
      actorId
    );

    opportunityService.createOpportunity(
      {
        id: 'opp-test-01',
        partner_id: 'ptn-test-01',
        title: 'Software Developer iGV',
        programme: 'iGV',
        standard_duration_weeks: 6,
        open_slots: 5,
        status: 'Open',
        owner_id: actorId,
      },
      actorId
    );

    epService.createEp(
      {
        id: 'ep-test-01',
        expa_person_id: 'expa-p-999',
        full_name: 'Alex Rivera',
        email: 'alex.rivera@example.com',
        home_mc: 'Germany',
        home_lc: 'AIESEC in Berlin',
        status: 'Open',
        owner_id: actorId,
      },
      actorId
    );

    const exchange = exchangeService.createExchange(
      {
        id: 'exc-std-test-01',
        ep_id: 'ep-test-01',
        opportunity_id: 'opp-test-01',
        programme: 'iGV',
        status: 'approved',
        flow_stage: 'preparation',
        owner_id: actorId,
      },
      actorId
    );
    exchangeId = exchange.id;
  });

  describe('1. Statutory Standard Definitions (§6.1)', () => {
    it('defines all 16 statutory standards accurately', () => {
      expect(STATUTORY_STANDARD_DEFS).toHaveLength(16);

      const hostStandards = STATUTORY_STANDARD_DEFS.filter((s) => s.delivered_by.includes('Host'));
      const homeStandards = STATUTORY_STANDARD_DEFS.filter((s) => s.delivered_by.includes('Home'));
      const mandatoryHost = hostStandards.filter((s) => s.mandatory);

      expect(hostStandards).toHaveLength(12); // Standards #4 through #15
      expect(homeStandards).toHaveLength(4);  // Standards #1, #2, #3, #16
      expect(mandatoryHost).toHaveLength(8);   // #4, #5, #7, #8, #10, #11, #13, #14

      expect(getStandardDef(4)?.name).toBe('Expectations setting');
      expect(getStandardDef(5)?.name).toBe('Visa and work permit');
      expect(getStandardDef(7)?.name).toBe('Accommodation');
      expect(getStandardDef(8)?.name).toBe('Incoming preparation');
      expect(getStandardDef(10)?.name).toBe('Alignment spaces with opportunity provider');
      expect(getStandardDef(11)?.name).toBe('Job description');
      expect(getStandardDef(13)?.name).toBe('Duration');
      expect(getStandardDef(14)?.name).toBe('Opportunity benefits');
    });

    it('identifies negative EP survey answers correctly', () => {
      expect(isNegativeEpAnswer(4, 'No')).toBe(true);
      expect(isNegativeEpAnswer(4, 'no')).toBe(true);
      expect(isNegativeEpAnswer(4, 'Yes')).toBe(false);

      // Standard #8 answers
      expect(isNegativeEpAnswer(8, 'Yes & attended')).toBe(false);
      expect(isNegativeEpAnswer(8, 'Yes & did not attend')).toBe(true);
      expect(isNegativeEpAnswer(8, 'No')).toBe(true);

      // Standard #11 / #13 answers
      expect(isNegativeEpAnswer(11, 'Same JD')).toBe(false);
      expect(isNegativeEpAnswer(11, 'Changed but agreed')).toBe(false);
      expect(isNegativeEpAnswer(11, 'Changed, not agreed')).toBe(true);

      expect(isNegativeEpAnswer(13, 'Same')).toBe(false);
      expect(isNegativeEpAnswer(13, 'Changed, not agreed')).toBe(true);

      // Blank or null answers
      expect(isNegativeEpAnswer(4, null)).toBe(false);
      expect(isNegativeEpAnswer(4, undefined)).toBe(false);
    });
  });

  describe('2. Parallel-Truth Operational Tracking & EP Voice (INV-05)', () => {
    it('allows updating tracked status independently from EP answer', () => {
      const check = standardsService.updateTrackedStatus(
        exchangeId,
        4,
        'delivered',
        actorId,
        'doc-proof-4'
      );

      expect(check.tracked_status).toBe('delivered');
      expect(check.tracked_by).toBe(actorId);
      expect(check.proof_id).toBe('doc-proof-4');
      expect(check.ep_reported_answer).toBeNull();

      // Check audit log
      const db = getMasterTrackerDb();
      const lastAudit = db.auditLogs[db.auditLogs.length - 1];
      expect(lastAudit.action).toBe('UPDATE_STANDARD_TRACKING');
      expect(lastAudit.record_id).toBe(`${exchangeId}:4`);
    });

    it('records EP survey response with write-once immutability (INV-05)', () => {
      const recorded = standardsService.recordEpSurveyResponse(
        exchangeId,
        4,
        'Yes',
        '2026-11-03T10:00:00Z'
      );

      expect(recorded.ep_reported_answer).toBe('Yes');
      expect(recorded.ep_reported_at).toBe('2026-11-03T10:00:00Z');

      // Attempting to overwrite EP survey response with a different answer must throw INV-05 error
      expect(() => {
        standardsService.recordEpSurveyResponse(
          exchangeId,
          4,
          'No',
          '2026-11-03T11:00:00Z'
        );
      }).toThrow(/INV-05.*write-once immutable/i);
    });

    it('flags delivered standard as amber unproven when proof_id is missing (§6.4)', () => {
      standardsService.updateTrackedStatus(exchangeId, 4, 'delivered', actorId, null);

      const standards = getExchangeStandardsWithDefs(exchangeId);
      const std4 = standards.find((s) => s.std_no === 4);

      expect(std4).toBeDefined();
      expect(std4?.tracked_status).toBe('delivered');
      expect(std4?.proof_id).toBeNull();
      expect(std4?.is_unproven).toBe(true);

      const metrics = standardsService.computeMetrics(exchangeId);
      expect(metrics.unprovenCount).toBe(1);
    });
  });

  describe('3. Statutory Quality Delivery Metrics & Completion Readiness (§6.3)', () => {
    const mandatoryStdNos = [4, 5, 7, 8, 10, 11, 13, 14];

    it('computes stdDeliveryPct based on delivered mandatory host standards', () => {
      // Initially 0 delivered
      let metrics = standardsService.computeMetrics(exchangeId);
      expect(metrics.mandatoryHostTotal).toBe(8);
      expect(metrics.mandatoryHostDelivered).toBe(0);
      expect(metrics.stdDeliveryPct).toBe(0);
      expect(metrics.completionReadiness).toBe(false);

      // Deliver 4 out of 8 mandatory host standards
      mandatoryStdNos.slice(0, 4).forEach((stdNo) => {
        standardsService.updateTrackedStatus(exchangeId, stdNo, 'delivered', actorId, `proof-${stdNo}`);
      });

      metrics = standardsService.computeMetrics(exchangeId);
      expect(metrics.mandatoryHostDelivered).toBe(4);
      expect(metrics.stdDeliveryPct).toBe(50.0);
      expect(metrics.completionReadiness).toBe(false);
    });

    it('requires all 8 mandatory host standards to have proof attached for completionReadiness', () => {
      // Deliver all 8, but leave standard 14 without proof
      mandatoryStdNos.forEach((stdNo) => {
        const proof = stdNo === 14 ? null : `proof-${stdNo}`;
        standardsService.updateTrackedStatus(exchangeId, stdNo, 'delivered', actorId, proof);
      });

      let metrics = standardsService.computeMetrics(exchangeId);
      expect(metrics.mandatoryHostDelivered).toBe(8);
      expect(metrics.stdDeliveryPct).toBe(100.0);
      expect(metrics.mandatoryHostProven).toBe(7);
      expect(metrics.unprovenCount).toBe(1);
      expect(metrics.completionReadiness).toBe(false); // blocked because proof-14 is missing

      // Now attach proof to standard 14
      standardsService.updateTrackedStatus(exchangeId, 14, 'delivered', actorId, 'proof-14');
      metrics = standardsService.computeMetrics(exchangeId);
      expect(metrics.mandatoryHostProven).toBe(8);
      expect(metrics.unprovenCount).toBe(0);
      expect(metrics.completionReadiness).toBe(true);
    });
  });

  describe('4. DQ-055 Parallel-Truth Discrepancy Detection (§6.3, §13.2)', () => {
    it('detects mismatch when AIESEC tracks delivered but EP reports negative answer', () => {
      // Standard #4 Expectations setting
      standardsService.updateTrackedStatus(exchangeId, 4, 'delivered', actorId, 'proof-4');
      standardsService.recordEpSurveyResponse(exchangeId, 4, 'No');

      const standards = getExchangeStandardsWithDefs(exchangeId);
      const std4 = standards.find((s) => s.std_no === 4);
      expect(std4?.is_mismatch).toBe(true);

      const metrics = standardsService.computeMetrics(exchangeId);
      expect(metrics.mismatchCount).toBe(1);
      expect(metrics.dqIssues).toHaveLength(1);
      expect(metrics.dqIssues[0].rule_id).toBe('DQ-055');
      expect(metrics.dqIssues[0].severity).toBe('Review');
      expect(metrics.dqIssues[0].details.std_no).toBe(4);
      expect(metrics.dqIssues[0].details.tracked_status).toBe('delivered');
      expect(metrics.dqIssues[0].details.ep_reported_answer).toBe('No');
    });

    it('detects mismatch when AIESEC tracks not_delivered but EP reports positive answer', () => {
      // Standard #7 Accommodation
      standardsService.updateTrackedStatus(exchangeId, 7, 'not_delivered', actorId);
      standardsService.recordEpSurveyResponse(exchangeId, 7, 'Yes');

      const standards = getExchangeStandardsWithDefs(exchangeId);
      const std7 = standards.find((s) => s.std_no === 7);
      expect(std7?.is_mismatch).toBe(true);

      const metrics = standardsService.computeMetrics(exchangeId);
      expect(metrics.mismatchCount).toBe(1);
      expect(metrics.dqIssues[0].rule_id).toBe('DQ-055');
    });

    it('does not flag mismatch when both tracking and EP answer agree', () => {
      standardsService.updateTrackedStatus(exchangeId, 10, 'delivered', actorId, 'proof-10');
      standardsService.recordEpSurveyResponse(exchangeId, 10, 'Yes');

      const standards = getExchangeStandardsWithDefs(exchangeId);
      const std10 = standards.find((s) => s.std_no === 10);
      expect(std10?.is_mismatch).toBe(false);

      const metrics = standardsService.computeMetrics(exchangeId);
      expect(metrics.mismatchCount).toBe(0);
      expect(metrics.dqIssues).toHaveLength(0);
    });
  });
});
