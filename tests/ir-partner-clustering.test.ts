import { describe, it, expect, beforeEach } from 'vitest';
import {
  irEcosystemService,
  resetIrEcosystemDb,
} from '../src/lib/data-integrity/ir-ecosystem';
import {
  getMasterTrackerDb,
  resetMasterTrackerDb,
  entityService,
  opportunityService,
  epService,
  exchangeService,
} from '../src/lib/data-integrity/master-tracker';
import { standardsService } from '../src/lib/data-integrity/standards-service';
import { InvariantViolationError } from '../src/lib/data-integrity/invariants';

describe('Plan 04-03: IR Partner Record & 2×2 Clustering Engine (M4)', () => {
  const actorId = 'mem-wadii-001';
  let entityIdA: string;
  let entityIdB: string;

  beforeEach(() => {
    resetMasterTrackerDb();
    resetIrEcosystemDb();

    // Create 2 test home entities (e.g. AIESEC in France, AIESEC in Germany)
    const entityA = entityService.createEntity(
      {
        id: 'ent-aiesec-france',
        expa_id: 111,
        name: 'AIESEC in France',
        type: 'MC',
        country: 'France',
      },
      actorId
    );
    entityIdA = entityA.id;

    const entityB = entityService.createEntity(
      {
        id: 'ent-aiesec-germany',
        expa_id: 222,
        name: 'AIESEC in Germany',
        type: 'MC',
        country: 'Germany',
      },
      actorId
    );
    entityIdB = entityB.id;
  });

  describe('1. IR Partner Lifecycle & Invariants (INV-01, INV-03, INV-09)', () => {
    it('creates an IR partner with all 5 lifecycle groups and default cluster understand', () => {
      const partner = irEcosystemService.createIrPartner(
        {
          home_entity_id: entityIdA,
          owner_id: actorId,
          purpose: 'Strategic pipeline for environmental projects in Rabat',
          partnership_goals: ['Deliver 20 GV realizations in Summer 2026', 'Maintain >90% standards'],
          persona: 'European students seeking cultural impact in North Africa',
          timeline: { target_realization_window: 'July-August 2026' },
          result_history: { realized_2025: 12 },
          physical_content: ['Flyers', 'University Booth Toolkit'],
          digital_content: ['Instagram Carousels', 'EP Testimonial Videos'],
          comms_channels: ['WhatsApp Community', 'Biweekly IR alignment call'],
          re_growth_target: 25,
          process_time_target_days: 7,
          standards_codelivery_notes: 'Host covers 4-15; Home commits to 1-3 prep spaces',
          strategy: 'Focus on university partnerships in Paris and Lyon',
          tracker_status: 'active',
          routines: ['Weekly tracking dashboard review', 'Monthly LCVP sync'],
          review_frequency: 'monthly',
        },
        actorId
      );

      expect(partner.id).toBeDefined();
      expect(partner.home_entity_id).toBe(entityIdA);
      expect(partner.owner_id).toBe(actorId);
      expect(partner.cluster).toBe('understand');
      expect(partner.tracker_status).toBe('active');

      // Check INV-09 universal audit log
      const audit = getMasterTrackerDb().auditLogs.find(
        (l) => l.table_name === 'ir_partner' && l.record_id === partner.id && l.action === 'INSERT'
      );
      expect(audit).toBeDefined();
      expect(audit?.actor).toBe(actorId);
    });

    it('enforces INV-03: throws if owner_id is missing on creation or update', () => {
      expect(() => {
        irEcosystemService.createIrPartner(
          {
            home_entity_id: entityIdB,
            owner_id: '',
            re_growth_target: 10,
            tracker_status: 'active',
            review_frequency: 'monthly',
          },
          actorId
        );
      }).toThrowError(/INV-03.*mandatory active owner_id/i);

      const validPartner = irEcosystemService.createIrPartner(
        {
          home_entity_id: entityIdB,
          owner_id: actorId,
          re_growth_target: 10,
          tracker_status: 'active',
          review_frequency: 'monthly',
        },
        actorId
      );

      expect(() => {
        irEcosystemService.updateIrPartner(validPartner.id, { owner_id: '' }, actorId);
      }).toThrowError(/INV-03.*mandatory active owner_id/i);
    });

    it('enforces uniqueness: prevents creating duplicate active IR partner for same entity', () => {
      irEcosystemService.createIrPartner(
        {
          home_entity_id: entityIdA,
          owner_id: actorId,
          re_growth_target: 5,
          tracker_status: 'active',
          review_frequency: 'monthly',
        },
        actorId
      );

      expect(() => {
        irEcosystemService.createIrPartner(
          {
            home_entity_id: entityIdA,
            owner_id: actorId,
            re_growth_target: 10,
            tracker_status: 'active',
            review_frequency: 'monthly',
          },
          actorId
        );
      }).toThrowError(/already exists/i);
    });

    it('enforces INV-01: soft delete works with reason & audit, hard delete is blocked', () => {
      const partner = irEcosystemService.createIrPartner(
        {
          home_entity_id: entityIdA,
          owner_id: actorId,
          re_growth_target: 5,
          tracker_status: 'active',
          review_frequency: 'monthly',
        },
        actorId
      );

      const deleted = irEcosystemService.softDeleteIrPartner(
        partner.id,
        actorId,
        'Partner merged into regional cluster'
      );
      expect(deleted.deleted_at).toBeDefined();
      expect(deleted.deleted_reason).toContain('Partner merged');

      // Cannot retrieve soft-deleted partner through normal get
      expect(irEcosystemService.getIrPartner(partner.id)).toBeNull();

      // Hard delete attempt throws INV-01
      expect(() => {
        irEcosystemService.hardDeleteAttempt(partner.id, actorId);
      }).toThrowError(/INV-01.*Hard deletes are strictly forbidden/i);
    });
  });

  describe('2. 2×2 Clustering Matrix Engine (§9.3, S6, D6)', () => {
    it('evaluates all 4 quadrants accurately based on Supply and Market Readiness', () => {
      // Create opportunities in Rabat to establish Market Readiness
      // Opp 1: 6 slots
      // Opp 2: 6 slots -> total 12 slots (High Readiness >= 10)
      const opp1 = opportunityService.createOpportunity(
        {
          op_id: 'ptn-test-01',
          title: 'Eco Leaders Summer',
          programme: 'GV',
          slots: 6,
          duration_weeks: 6,
          benefits: [],
          accommodation_provided: true,
        },
        actorId
      );

      const opp2 = opportunityService.createOpportunity(
        {
          op_id: 'ptn-test-02',
          title: 'Youth Mentors',
          programme: 'GV',
          slots: 6,
          duration_weeks: 6,
          benefits: [],
          accommodation_provided: true,
        },
        actorId
      );

      // Create IR Partner for France
      const irFrance = irEcosystemService.createIrPartner(
        {
          home_entity_id: entityIdA,
          owner_id: actorId,
          re_growth_target: 15,
          tracker_status: 'active',
          review_frequency: 'monthly',
          custom_supply_threshold: 5,
          custom_readiness_threshold: 10,
        },
        actorId
      );

      // Scenario A: Low Supply (< 5), High Readiness (12 >= 10) -> 'grow'
      let analysis = irEcosystemService.analyzeCluster(irFrance.id);
      expect(analysis.supply).toBe(0);
      expect(analysis.marketReadiness).toBe(12);
      expect(analysis.isHighSupply).toBe(false);
      expect(analysis.isHighReadiness).toBe(true);
      expect(analysis.cluster).toBe('grow');
      expect(analysis.meaning).toContain('Potential to grow');

      // Now add 5 EPs from France to create High Supply (>= 5)
      for (let i = 1; i <= 5; i++) {
        const ep = epService.createEp(
          {
            id: `ep-fr-${i}`,
            expa_ep_id: 1000 + i,
            full_name: `French EP ${i}`,
            home_entity_id: entityIdA,
            contact: { email: `ep${i}@france.org` },
            owner_id: actorId,
          },
          actorId
        );

        exchangeService.createExchange(
          {
            ep_id: ep.id,
            opportunity_id: opp1.id,
            programme: 'GV',
            status: 'APL',
            owner_id: actorId,
          },
          actorId
        );
      }

      // Scenario B: High Supply (5 >= 5), High Readiness (12 >= 10) -> 'upscale'
      analysis = irEcosystemService.analyzeCluster(irFrance.id);
      expect(analysis.supply).toBe(5);
      expect(analysis.isHighSupply).toBe(true);
      expect(analysis.isHighReadiness).toBe(true);
      expect(analysis.cluster).toBe('upscale');
      expect(analysis.meaning).toContain('Innovate together');

      // Update partner with recomputeCluster
      const updatedPartner = irEcosystemService.recomputeCluster(irFrance.id, actorId);
      expect(updatedPartner.cluster).toBe('upscale');

      // Scenario C: High Supply, Low Readiness (suppose readiness threshold is raised to 20)
      analysis = irEcosystemService.analyzeCluster(irFrance.id, {
        supplyThreshold: 5,
        readinessThreshold: 20,
      });
      expect(analysis.isHighSupply).toBe(true);
      expect(analysis.isHighReadiness).toBe(false);
      expect(analysis.cluster).toBe('invest');
      expect(analysis.meaning).toContain('Fix bottlenecks / attraction');

      // Scenario D: Low Supply, Low Readiness (threshold supply: 10, readiness: 20)
      analysis = irEcosystemService.analyzeCluster(irFrance.id, {
        supplyThreshold: 10,
        readinessThreshold: 20,
      });
      expect(analysis.isHighSupply).toBe(false);
      expect(analysis.isHighReadiness).toBe(false);
      expect(analysis.cluster).toBe('understand');
      expect(analysis.meaning).toContain('New cooperation, explore');
    });

    it('recomputeAllClusters updates all partnerships across the LC in bulk', () => {
      const p1 = irEcosystemService.createIrPartner(
        {
          home_entity_id: entityIdA,
          owner_id: actorId,
          re_growth_target: 10,
          tracker_status: 'active',
          review_frequency: 'monthly',
        },
        actorId
      );

      const p2 = irEcosystemService.createIrPartner(
        {
          home_entity_id: entityIdB,
          owner_id: actorId,
          re_growth_target: 5,
          tracker_status: 'active',
          review_frequency: 'monthly',
        },
        actorId
      );

      const updated = irEcosystemService.recomputeAllClusters(actorId, {
        supplyThreshold: 2,
        readinessThreshold: 5,
      });

      expect(updated.length).toBe(2);
      expect(updated[0].cluster).toBeDefined();
      expect(updated[1].cluster).toBeDefined();
    });
  });

  describe('3. E2E Customer Flow Analytics (§9.3, S6)', () => {
    it('computes customer flow counts, conversion percentages, and average process speed', () => {
      const irPartner = irEcosystemService.createIrPartner(
        {
          home_entity_id: entityIdA,
          owner_id: actorId,
          re_growth_target: 10,
          tracker_status: 'active',
          review_frequency: 'monthly',
        },
        actorId
      );

      const opp = opportunityService.createOpportunity(
        {
          op_id: 'ptn-test-01',
          title: 'Cultural Exchange 2026',
          programme: 'GV',
          slots: 10,
          duration_weeks: 6,
          benefits: [],
          accommodation_provided: true,
        },
        actorId
      );

      // Create 4 EPs from Entity A:
      // EP1: APL
      // EP2: ACP
      // EP3: APD (took 3 days from APL to APD)
      // EP4: RE (took 2 days from APL to APD, 10 days from APD to RE)
      const ep1 = epService.createEp(
        {
          id: 'ep-fl-1',
          expa_ep_id: 2001,
          full_name: 'Applicant One',
          home_entity_id: entityIdA,
          contact: {},
          owner_id: actorId,
        },
        actorId
      );
      exchangeService.createExchange(
        {
          ep_id: ep1.id,
          opportunity_id: opp.id,
          programme: 'GV',
          status: 'APL',
          owner_id: actorId,
        },
        actorId
      );

      const ep2 = epService.createEp(
        {
          id: 'ep-fl-2',
          expa_ep_id: 2002,
          full_name: 'Applicant Two',
          home_entity_id: entityIdA,
          contact: {},
          owner_id: actorId,
        },
        actorId
      );
      exchangeService.createExchange(
        {
          ep_id: ep2.id,
          opportunity_id: opp.id,
          programme: 'GV',
          status: 'ACP',
          owner_id: actorId,
        },
        actorId
      );

      const ep3 = epService.createEp(
        {
          id: 'ep-fl-3',
          expa_ep_id: 2003,
          full_name: 'Approved Three',
          home_entity_id: entityIdA,
          contact: {},
          owner_id: actorId,
        },
        actorId
      );
      const { exchange: ex3 } = exchangeService.createExchange(
        {
          ep_id: ep3.id,
          opportunity_id: opp.id,
          programme: 'GV',
          status: 'APD',
          approved_at: '2026-06-05',
          owner_id: actorId,
        },
        actorId
      );
      // manually adjust created_at to 2026-06-02 (3 days)
      getMasterTrackerDb().exchanges.set(ex3.id, {
        ...ex3,
        created_at: '2026-06-02T10:00:00Z',
      });

      const ep4 = epService.createEp(
        {
          id: 'ep-fl-4',
          expa_ep_id: 2004,
          full_name: 'Realized Four',
          home_entity_id: entityIdA,
          contact: {},
          owner_id: actorId,
        },
        actorId
      );
      const { exchange: ex4 } = exchangeService.createExchange(
        {
          ep_id: ep4.id,
          opportunity_id: opp.id,
          programme: 'GV',
          status: 'RE',
          approved_at: '2026-06-04',
          re_date: '2026-06-14',
          owner_id: actorId,
        },
        actorId
      );
      // created_at: 2026-06-02 (2 days to APD, 10 days to RE)
      getMasterTrackerDb().exchanges.set(ex4.id, {
        ...ex4,
        created_at: '2026-06-02T10:00:00Z',
      });

      const analytics = irEcosystemService.getE2EAnalytics(irPartner.id);

      expect(analytics.attraction).toBe(4);
      expect(analytics.consideration).toBe(2); // APL + ACP
      expect(analytics.preparation).toBe(1); // APD
      expect(analytics.experience).toBe(1); // RE
      expect(analytics.total).toBe(4);

      // Conversion rates:
      // APL -> ACP: 3 of 4 reached at least ACP (75.0%)
      expect(analytics.aplToAcpConversionPct).toBe(75.0);
      // ACP -> APD: 2 of 3 progressed to at least APD (66.7%)
      expect(analytics.acpToApdConversionPct).toBe(66.7);
      // APD -> RE: 1 of 2 reached RE (50.0%)
      expect(analytics.apdToReConversionPct).toBe(50.0);

      // Process speed
      // ex3: 3 days, ex4: 2 days -> avg = 2.5 days
      expect(analytics.avgProcessTimeDays.aplToApd).toBe(2.5);
      // ex4: 10 days -> avg = 10 days
      expect(analytics.avgProcessTimeDays.apdToRe).toBe(10.0);
    });
  });

  describe('4. E2E Standards Co-Delivery Analytics (§9.3, S6)', () => {
    it('computes host vs home standards delivery % for the IR partner', () => {
      const irPartner = irEcosystemService.createIrPartner(
        {
          home_entity_id: entityIdA,
          owner_id: actorId,
          re_growth_target: 5,
          tracker_status: 'active',
          review_frequency: 'monthly',
        },
        actorId
      );

      const opp = opportunityService.createOpportunity(
        {
          op_id: 'ptn-test-01',
          title: 'Global Classroom',
          programme: 'GV',
          slots: 2,
          duration_weeks: 6,
          benefits: [],
          accommodation_provided: true,
        },
        actorId
      );

      const ep = epService.createEp(
        {
          id: 'ep-std-01',
          expa_ep_id: 3001,
          full_name: 'Elena Rostova',
          home_entity_id: entityIdA,
          contact: {},
          owner_id: actorId,
        },
        actorId
      );

      const { exchange: ex } = exchangeService.createExchange(
        {
          ep_id: ep.id,
          opportunity_id: opp.id,
          programme: 'GV',
          status: 'RE',
          owner_id: actorId,
        },
        actorId
      );

      // Deliver 6 out of 12 Host standards (#4 to #9)
      for (let s = 4; s <= 9; s++) {
        standardsService.updateTrackedStatus(ex.id, s, 'delivered', actorId);
      }
      // Leave standards #10 to #15 not delivered
      for (let s = 10; s <= 15; s++) {
        standardsService.updateTrackedStatus(ex.id, s, 'not_delivered', actorId);
      }

      // Deliver 2 out of 4 Home standards (#1, #2 delivered, #3, #16 not delivered)
      standardsService.updateTrackedStatus(ex.id, 1, 'delivered', actorId);
      standardsService.updateTrackedStatus(ex.id, 2, 'delivered', actorId);
      standardsService.updateTrackedStatus(ex.id, 3, 'not_delivered', actorId);
      standardsService.updateTrackedStatus(ex.id, 16, 'not_delivered', actorId);

      const metrics = irEcosystemService.getE2EStandardsDelivery(irPartner.id);

      expect(metrics.totalExchanges).toBe(1);
      // 6 / 12 = 50.0%
      expect(metrics.hostStandardsDeliveredPct).toBe(50.0);
      // 2 / 4 = 50.0%
      expect(metrics.homeStandardsDeliveredPct).toBe(50.0);
      // 8 / 16 = 50.0%
      expect(metrics.overallDeliveryPct).toBe(50.0);
      expect(metrics.byStandard[4].deliveredPct).toBe(100.0);
      expect(metrics.byStandard[10].deliveredPct).toBe(0.0);
    });
  });

  describe('5. Stuck EPs in Funnel (§9.3, S6, D7)', () => {
    it('detects EPs that exceed the 14-day SLA in active stages without progression', () => {
      const irPartner = irEcosystemService.createIrPartner(
        {
          home_entity_id: entityIdA,
          owner_id: actorId,
          re_growth_target: 5,
          tracker_status: 'active',
          review_frequency: 'monthly',
        },
        actorId
      );

      const opp = opportunityService.createOpportunity(
        {
          op_id: 'ptn-test-01',
          title: 'Summer School',
          programme: 'GV',
          slots: 5,
          duration_weeks: 6,
          benefits: [],
          accommodation_provided: true,
        },
        actorId
      );

      // EP1: Created 20 days ago, still in APL -> STUCK
      const ep1 = epService.createEp(
        {
          id: 'ep-stuck-1',
          expa_ep_id: 4001,
          full_name: 'Stuck Applicant',
          home_entity_id: entityIdA,
          contact: {},
          owner_id: actorId,
        },
        actorId
      );
      const { exchange: ex1 } = exchangeService.createExchange(
        {
          ep_id: ep1.id,
          opportunity_id: opp.id,
          programme: 'GV',
          status: 'APL',
          owner_id: actorId,
        },
        actorId
      );
      const twentyDaysAgo = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString();
      getMasterTrackerDb().exchanges.set(ex1.id, {
        ...ex1,
        created_at: twentyDaysAgo,
      });
      const h1 = getMasterTrackerDb().statusHistories.find((h) => h.exchange_id === ex1.id);
      if (h1) h1.at = twentyDaysAgo;

      // EP2: Created 5 days ago, in APL -> ACTIVE, NOT STUCK
      const ep2 = epService.createEp(
        {
          id: 'ep-active-2',
          expa_ep_id: 4002,
          full_name: 'Fresh Applicant',
          home_entity_id: entityIdA,
          contact: {},
          owner_id: actorId,
        },
        actorId
      );
      const { exchange: ex2 } = exchangeService.createExchange(
        {
          ep_id: ep2.id,
          opportunity_id: opp.id,
          programme: 'GV',
          status: 'APL',
          owner_id: actorId,
        },
        actorId
      );
      getMasterTrackerDb().exchanges.set(ex2.id, {
        ...ex2,
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      });

      const stuckEps = irEcosystemService.getStuckEps(irPartner.id, { maxIdleDays: 14 });

      expect(stuckEps.length).toBe(1);
      expect(stuckEps[0].epId).toBe(ep1.id);
      expect(stuckEps[0].fullName).toBe('Stuck Applicant');
      expect(stuckEps[0].currentStage).toBe('consideration');
      expect(stuckEps[0].idleDays).toBeGreaterThanOrEqual(19);
      expect(stuckEps[0].stuckReason).toContain('without Approval');
    });
  });
});
