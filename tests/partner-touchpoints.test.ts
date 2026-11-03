import { describe, it, expect, beforeEach } from 'vitest';
import {
  partnerTouchpointService,
  resetPartnerTouchpointsDb,
} from '../src/lib/data-integrity/partner-touchpoints';
import {
  getMasterTrackerDb,
  resetMasterTrackerDb,
  partnerService,
  opportunityService,
  epService,
  exchangeService,
} from '../src/lib/data-integrity/master-tracker';
import { InvariantViolationError } from '../src/lib/data-integrity/invariants';

describe('Plan 04-02: Partner Touchpoint Logging & Buyer Personas (M4)', () => {
  const actorId = 'mem-wadii-001';
  let partnerId: string;

  beforeEach(() => {
    resetMasterTrackerDb();
    resetPartnerTouchpointsDb();

    const partner = partnerService.createPartner(
      {
        id: 'ptn-test-touchpoint-01',
        name: 'Casablanca Tech Academy',
        tier: 'Tier 1',
        status: 'Active',
        owner_id: actorId,
      },
      actorId
    );
    partnerId = partner.id;
  });

  describe('1. Touchpoint Logging & Automatic SLA Sync (§9.2, DQ-060)', () => {
    it('logs touchpoints across all 5 statutory types', () => {
      const types = [
        'monthly_call',
        'site_visit',
        'lc_touchpoint',
        'newsletter',
        'quarterly_review',
      ] as const;

      for (const type of types) {
        const tp = partnerTouchpointService.logTouchpoint(
          {
            partner_id: partnerId,
            type,
            notes: `Routine ${type} touchpoint completed`,
            next_action: 'Send proposal document',
            next_action_due_at: '2026-11-20T10:00:00Z',
          },
          actorId
        );

        expect(tp.id).toBeDefined();
        expect(tp.type).toBe(type);
        expect(tp.actor_id).toBe(actorId);
      }

      const list = partnerTouchpointService.listTouchpoints(partnerId);
      expect(list).toHaveLength(5);
    });

    it('automatically updates partner.last_touchpoint_at upon logging touchpoint', () => {
      const touchpointTime = '2026-11-03T14:30:00Z';
      partnerTouchpointService.logTouchpoint(
        {
          partner_id: partnerId,
          type: 'monthly_call',
          occurred_at: touchpointTime,
          notes: 'Discussed project slot expansion and visa status',
        },
        actorId
      );

      const masterDb = getMasterTrackerDb();
      const partner = masterDb.partners.get(partnerId)!;

      // Crucial: last_touchpoint_at must match the touchpoint time to reset DQ-060 timer
      expect(partner.last_touchpoint_at).toBe(touchpointTime);
    });

    it('records universal audit log entry for touchpoint (INV-09)', () => {
      const tp = partnerTouchpointService.logTouchpoint(
        {
          partner_id: partnerId,
          type: 'site_visit',
          notes: 'Inspected accommodation and project office facilities',
        },
        actorId
      );

      const masterDb = getMasterTrackerDb();
      const lastAudit = masterDb.auditLogs[masterDb.auditLogs.length - 1];
      expect(lastAudit.action).toBe('LOG_PARTNER_TOUCHPOINT');
      expect(lastAudit.record_id).toBe(tp.id);
      expect(lastAudit.actor).toBe(actorId);
    });
  });

  describe('2. Buyer Persona Profiling & Pipeline Management (§5.2)', () => {
    it('updates buyer persona tags, preferred channels, and objection tags', () => {
      const updated = partnerTouchpointService.updatePartnerPersona(
        partnerId,
        {
          persona: 'NGO Project Manager',
          preferred_channel: 'WhatsApp',
          objection_tags: ['payment-before-value', 'no accommodation/food'],
          funnel_stage: 'meeting',
        },
        actorId
      );

      expect(updated.persona).toBe('NGO Project Manager');
      expect(updated.preferred_channel).toBe('WhatsApp');
      expect(updated.objection_tags).toEqual(['payment-before-value', 'no accommodation/food']);
      expect(updated.funnel_stage).toBe('meeting');
    });
  });

  describe('3. Pipeline Conversion Metrics (§5.3)', () => {
    it('computes Call -> Open, Open -> APL, and APL -> APD conversion metrics', () => {
      // Set partner 1 as called with an open opportunity
      partnerTouchpointService.updatePartnerPersona(
        partnerId,
        { funnel_stage: 'open created' },
        actorId
      );

      const opp = opportunityService.createOpportunity(
        {
          id: 'opp-conv-01',
          op_id: partnerId,
          partner_id: partnerId,
          title: 'IT Project Manager',
          programme: 'GV',
          slots: 2,
          duration_weeks: 6,
          benefits: [],
          accommodation_provided: false,
          owner_id: actorId,
        } as any,
        actorId
      );

      const ep = epService.createEp(
        {
          id: 'ep-conv-01',
          expa_ep_id: 301,
          full_name: 'Clara Oswald',
          email: 'clara@example.com',
          home_mc: 'UK',
          home_lc: 'London',
          status: 'Open',
          owner_id: actorId,
        },
        actorId
      );

      exchangeService.createExchange(
        {
          ep_id: ep.id,
          opportunity_id: opp.id,
          programme: 'GV',
          status: 'APD',
          owner_id: actorId,
        },
        actorId
      );

      const metrics = partnerTouchpointService.computeFunnelMetrics();

      expect(metrics.totalPartners).toBe(1);
      expect(metrics.byFunnelStage['open created']).toBe(1);
      expect(metrics.callToOpenConversionPct).toBe(100.0);
      expect(metrics.openToAplConversionPct).toBe(100.0);
      expect(metrics.aplToApdConversionPct).toBe(100.0);
    });
  });

  describe('4. Invariants Enforcement (INV-01, INV-09)', () => {
    it('soft deletes touchpoint with actor attribution and prohibits hard delete', () => {
      const tp = partnerTouchpointService.logTouchpoint(
        {
          partner_id: partnerId,
          type: 'monthly_call',
          notes: 'Cancelled call by partner',
        },
        actorId
      );

      const deleted = partnerTouchpointService.softDeleteTouchpoint(
        tp.id,
        'Logged to wrong partner by mistake',
        actorId
      );

      expect(deleted.deleted_at).not.toBeNull();
      expect(deleted.deleted_reason).toContain('Logged to wrong partner by mistake');
      expect(partnerTouchpointService.listTouchpoints(partnerId)).toHaveLength(0);

      // Attempt hard delete -> throws INV-01
      expect(() => {
        partnerTouchpointService.hardDeleteTouchpoint(tp.id, actorId);
      }).toThrowError(InvariantViolationError);
    });
  });
});
