import { describe, it, expect, beforeEach } from 'vitest';
import {
  dataQualityService,
  resetDataQualityDb,
  computeSlaDueDate,
} from '../src/lib/data-integrity/data-quality';
import {
  dataHealthScoreService,
  scoreToGrade,
} from '../src/lib/data-integrity/health-score';
import {
  integrityConsoleService,
} from '../src/lib/data-integrity/integrity-console';
import {
  getMasterTrackerDb,
  resetMasterTrackerDb,
  partnerService,
  opportunityService,
  epService,
  exchangeService,
} from '../src/lib/data-integrity/master-tracker';
import { qualityCaseService, resetQualityCasesDb } from '../src/lib/data-integrity/quality-cases';
import { irEcosystemService, resetIrEcosystemDb } from '../src/lib/data-integrity/ir-ecosystem';
import { resetStatusRequestDb } from '../src/lib/data-integrity/status-governance';

describe('Plan 07-01 / 07-02 / 07-03: Data Quality Engine & Integrity Console (M7)', () => {
  const actorId = 'mem-wadii-001';

  beforeEach(() => {
    resetMasterTrackerDb();
    resetDataQualityDb();
    resetQualityCasesDb();
    resetIrEcosystemDb();
    resetStatusRequestDb();
  });

  describe('1. Plan 07-01: DQ Issue Lifecycle & Severity SLAs (§13.2)', () => {
    it('computes statutory SLA due dates by severity (Urgent 24h, Blocker 48h, Warn 168h)', () => {
      const now = new Date('2026-11-03T10:00:00Z');
      const urgentDue = computeSlaDueDate(now, 'Urgent');
      const blockerDue = computeSlaDueDate(now, 'Blocker');
      const warnDue = computeSlaDueDate(now, 'Warn');

      expect(new Date(urgentDue).getTime() - now.getTime()).toBe(24 * 60 * 60 * 1000);
      expect(new Date(blockerDue).getTime() - now.getTime()).toBe(48 * 60 * 60 * 1000);
      expect(new Date(warnDue).getTime() - now.getTime()).toBe(7 * 24 * 60 * 60 * 1000);
    });

    it('raises issues, prevents duplicates, and auto-resolves when condition clears', () => {
      const issue1 = dataQualityService.raiseIssue(
        'DQ-060',
        'Partner missing touchpoint for 40 days',
        'Warn',
        { tableName: 'op_partner', recordId: 'ptn-01' }
      );
      expect(issue1.status).toBe('open');

      // Duplicate raise returns existing open issue
      const issueDuplicate = dataQualityService.raiseIssue(
        'DQ-060',
        'Partner missing touchpoint for 40 days',
        'Warn',
        { tableName: 'op_partner', recordId: 'ptn-01' }
      );
      expect(issueDuplicate.id).toBe(issue1.id);

      // Auto-resolve
      const resolved = dataQualityService.autoResolveIssue('DQ-060', 'ptn-01', 'Touchpoint logged');
      expect(resolved?.status).toBe('auto_resolved');
      expect(resolved?.resolved_at).toBeDefined();

      // Open issues list no longer contains this issue
      expect(dataQualityService.listIssues({ status: 'open' }).length).toBe(0);
    });

    it('flags overdue issues based on SLA deadline', () => {
      const pastTime = new Date('2026-11-01T00:00:00Z').toISOString();
      dataQualityService.raiseIssue('DQ-052', 'Overdue realization', 'Urgent', {
        detectedAt: pastTime,
      });

      const evalTime = new Date('2026-11-03T10:00:00Z');
      const overdue = dataQualityService.getOverdueIssues(evalTime);
      expect(overdue.length).toBe(1);
      expect(overdue[0].rule_id).toBe('DQ-052');
    });
  });

  describe('2. Plan 07-01: Automated 26-Rule Scanner Engine (§13.2)', () => {
    it('detects duplicate EP, touchpoint gap, and overdue realization violations', () => {
      const now = new Date('2026-11-20T12:00:00Z');

      // 1. Create duplicate EPs (DQ-001 / DQ-002)
      epService.createEp(
        {
          id: 'ep-dq-1',
          expa_ep_id: 8888,
          full_name: 'Amine Benali',
          home_entity_id: 'ent-rabat',
          contact: {},
          owner_id: actorId,
        },
        actorId
      );
      // Second EP with same expa_ep_id in master tracker directly
      getMasterTrackerDb().eps.set('ep-dq-2', {
        id: 'ep-dq-2',
        expa_ep_id: 8888,
        full_name: 'Amine Benali',
        home_entity_id: 'ent-rabat',
        contact: {},
        owner_id: actorId,
        created_at: now.toISOString(),
      });

      // 2. Partner with 40-day touchpoint gap (DQ-060)
      const partner = partnerService.createPartner(
        {
          id: 'ptn-stale-01',
          name: 'Stale NGO',
          type: 'NGO',
          city: 'Casablanca',
          owner_id: actorId,
          last_touchpoint_at: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000).toISOString(),
        },
        actorId
      );

      // 3. APD with passed RE date (DQ-052)
      const opp = opportunityService.createOpportunity(
        {
          op_id: partner.id,
          title: 'Youth Lead',
          programme: 'GV',
          slots: 2,
          duration_weeks: 6,
          benefits: [],
          accommodation_provided: true,
        },
        actorId
      );

      const { exchange } = exchangeService.createExchange(
        {
          ep_id: 'ep-dq-1',
          opportunity_id: opp.id,
          programme: 'GV',
          status: 'APD',
          re_date: '2026-11-10', // 10 days before now
          owner_id: actorId,
        },
        actorId
      );

      // Run scanner
      const scanResult = dataQualityService.runDataQualityScan({ now });

      expect(scanResult.totalScanned).toBeGreaterThan(0);
      expect(scanResult.openIssues.some((i) => i.rule_id === 'DQ-001')).toBe(true);
      expect(scanResult.openIssues.some((i) => i.rule_id === 'DQ-060')).toBe(true);
      expect(scanResult.openIssues.some((i) => i.rule_id === 'DQ-052')).toBe(true);
    });
  });

  describe('3. Plan 07-02: Weighted Data Health Score (§14)', () => {
    it('computes weighted score across completeness, freshness, EXPA consistency, and ownership', () => {
      const now = new Date('2026-11-20T12:00:00Z');

      // Grade classification utility
      expect(scoreToGrade(95)).toBe('A');
      expect(scoreToGrade(85)).toBe('B');
      expect(scoreToGrade(75)).toBe('C');
      expect(scoreToGrade(65)).toBe('D');
      expect(scoreToGrade(50)).toBe('F');

      // Clean state: everything optimal -> Score 100, Grade A
      const cleanScore = dataHealthScoreService.computeHealthScore({ now });
      expect(cleanScore.overallScore).toBe(100);
      expect(cleanScore.grade).toBe('A');
      expect(cleanScore.dimensions.completeness.score).toBe(100);
      expect(cleanScore.dimensions.freshness.score).toBe(100);
      expect(cleanScore.dimensions.expaConsistency.score).toBe(100);
      expect(cleanScore.dimensions.ownership.score).toBe(100);

      // Introduce open reconciliation issues (DQ-040, DQ-041)
      dataQualityService.raiseIssue('DQ-040', 'Status mismatch', 'Blocker', {
        recordId: 'ex-sync-1',
      });
      dataQualityService.raiseIssue('DQ-041', 'Date drift', 'Warn', {
        recordId: 'ex-sync-2',
      });

      const degradedScore = dataHealthScoreService.computeHealthScore({ now });
      expect(degradedScore.overallScore).toBeLessThan(100);
      expect(degradedScore.dimensions.expaConsistency.score).toBe(60); // 100 - (2 * 20)
    });
  });

  describe('4. Plan 07-03: Integrity Console Aggregator Engine (§14)', () => {
    it('aggregates complete summary across all 15 operational console views', () => {
      const now = new Date('2026-11-20T12:00:00Z');

      // 1. Add partner
      const partner = partnerService.createPartner(
        {
          id: 'ptn-console-01',
          name: 'Tech Future',
          type: 'Startup',
          city: 'Rabat',
          owner_id: actorId,
          last_touchpoint_at: now.toISOString(),
        },
        actorId
      );

      // 2. Add opportunity & exchange
      const opp = opportunityService.createOpportunity(
        {
          op_id: partner.id,
          title: 'Full Stack Trainee',
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
          id: 'ep-console-01',
          expa_ep_id: 7777,
          full_name: 'Zineb Alami',
          home_entity_id: 'ent-france',
          contact: {},
          owner_id: actorId,
        },
        actorId
      );

      const { exchange } = exchangeService.createExchange(
        {
          ep_id: ep.id,
          opportunity_id: opp.id,
          programme: 'GV',
          status: 'RE',
          re_date: '2026-11-25', // within 14 days!
          owner_id: actorId,
        },
        actorId
      );

      // 3. Add quality case
      qualityCaseService.createCase(
        {
          exchange_id: exchange.id,
          title: 'Orientation support',
          description: 'EP needed local SIM card support.',
          classification: 'expectation_gap',
          owner_id: actorId,
        },
        actorId
      );

      // 4. Add IR partner
      irEcosystemService.createIrPartner(
        {
          home_entity_id: 'ent-france',
          owner_id: actorId,
          re_growth_target: 10,
          tracker_status: 'active',
          review_frequency: 'monthly',
          cluster: 'upscale',
        },
        actorId
      );

      const summary = integrityConsoleService.getConsoleSummary({ now });

      expect(summary.healthScore).toBeDefined();
      expect(summary.healthScore.overallScore).toBeGreaterThan(0);
      expect(summary.healthScore.grade).toBeDefined();
      expect(summary.totalPartners).toBe(1);
      expect(summary.partnersWithOverdueTouchpoint).toBe(0);
      expect(summary.deadlinesNext14DaysCount).toBe(1);
      expect(summary.irClustersCount.upscale).toBe(1);
      expect(summary.openCasesCount).toBe(1);
    });
  });
});
