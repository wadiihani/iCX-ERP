import { describe, it, expect } from 'vitest';
import {
  safeDivide,
  buildCohortRate,
  generateExecutiveOutcomeCards,
  generateExecutiveSupplyCards,
  generateCohortFunnelStages,
  generateProjectCapacities,
  generateActionQueueItems,
} from '@/lib/analytics/cohort-analytics-engine';
import {
  COMPREHENSIVE_KPI_REGISTRY,
  getKpiRegistryEntry,
  getKpisByDomain,
} from '@/lib/kpi/kpi-registry';

describe('Phase 18: Shared Analytics Registry & Cohort Calculation Engine', () => {
  describe('safeDivide & buildCohortRate Safeguards', () => {
    it('returns 0 when denominator is 0, negative, or undefined without throwing', () => {
      expect(safeDivide(10, 0)).toBe(0);
      expect(safeDivide(0, 0)).toBe(0);
      expect(safeDivide(5, -2)).toBe(0);
    });

    it('calculates correct percentages for valid inputs', () => {
      expect(safeDivide(24, 112)).toBeCloseTo(21.428, 2);
      expect(safeDivide(48, 60)).toBe(80);
    });

    it('formats CohortRateMetric with explicit X/Y fraction and formatted percentage', () => {
      const metric = buildCohortRate(24, 112, 20.0, 18.0);
      expect(metric.numerator).toBe(24);
      expect(metric.denominator).toBe(112);
      expect(metric.fractionText).toBe('24/112');
      expect(metric.formattedRate).toBe('21.4%');
      expect(metric.isGood).toBe(true);
      expect(metric.trendDirection).toBe('UP');
      expect(metric.wowDelta).toContain('+');
    });

    it('handles zero denominator safely in buildCohortRate', () => {
      const metric = buildCohortRate(0, 0, 80.0);
      expect(metric.numerator).toBe(0);
      expect(metric.denominator).toBe(0);
      expect(metric.fractionText).toBe('0/0');
      expect(metric.formattedRate).toBe('0.0%');
      expect(metric.isGood).toBe(false);
      expect(metric.trendDirection).toBe('STABLE');
    });
  });

  describe('Executive Outcome & Supply Cards Generation', () => {
    it('generates Row 1 Outcome cards with explicit numerators and denominators', () => {
      const outcomes = generateExecutiveOutcomeCards({ program: 'iGV', cohort: '2026-Q2' });
      expect(outcomes.realized.current).toBe(24);
      expect(outcomes.realized.target).toBe(30);
      expect(outcomes.completed.current).toBe(21);
      
      // Cohort App-to-Realized
      expect(outcomes.cohortAppToRealized.fractionText).toBe('24/112');
      expect(outcomes.cohortAppToRealized.formattedRate).toBe('21.4%');
      
      // Standards Compliance
      expect(outcomes.standardsCompliance.numerator).toBeGreaterThan(0);
      expect(outcomes.standardsCompliance.denominator).toBe(24 * 18);
      expect(outcomes.standardsCompliance.fractionText).toContain('/');
    });

    it('generates Row 2 Supply cards with slot fill rate fractions', () => {
      const supply = generateExecutiveSupplyCards({ program: 'iGV', cohort: '2026-Q2' });
      expect(supply.qualifiedPipelineMad.amountMad).toBeGreaterThan(0);
      expect(supply.signedPartnersCount.current).toBe(12);
      expect(supply.validAvailableSlots.totalSlots).toBe(60);
      expect(supply.validAvailableSlots.openSlots).toBe(12);
      expect(supply.slotFillRate.fractionText).toBe('48/60');
      expect(supply.slotFillRate.formattedRate).toBe('80.0%');
    });
  });

  describe('Stepped Funnel Stages & Project Capacities', () => {
    it('generates 5 sequential funnel stages from APD to COM with drop-off counts', () => {
      const stages = generateCohortFunnelStages({ program: 'iGV', cohort: '2026-Q2' });
      expect(stages).toHaveLength(5);
      expect(stages.map((s) => s.stageId)).toEqual(['APD', 'ACC', 'APD_FEE', 'REA', 'COM']);

      // Ensure monotonically non-increasing cohort count
      for (let i = 0; i < stages.length - 1; i++) {
        expect(stages[i].cohortCount).toBeGreaterThanOrEqual(stages[i + 1].cohortCount);
        expect(stages[i].conversionFraction).toContain('/');
      }
    });

    it('generates project capacity breakdowns for official SDG projects', () => {
      const projects = generateProjectCapacities({ program: 'iGV', cohort: '2026-Q2' });
      expect(projects.length).toBeGreaterThanOrEqual(4);
      const ecoRabat = projects.find((p) => p.projectCode === 'GV-ECO-01');
      expect(ecoRabat).toBeDefined();
      expect(ecoRabat?.sdgNumber).toBe(14);
      expect(ecoRabat?.fillRateFraction).toBe('16/18');
      expect(ecoRabat?.status).toBe('OPTIMAL');
    });
  });

  describe('Row 4 Action Queue Generation', () => {
    it('generates actionable items across all 6 risk categories with owners and drillDownUrls', () => {
      const queue = generateActionQueueItems({ program: 'iGV', cohort: '2026-Q2' });
      expect(queue.length).toBeGreaterThanOrEqual(6);

      const categories = new Set(queue.map((q) => q.category));
      expect(categories.has('OVERDUE_STANDARDS')).toBe(true);
      expect(categories.has('UNMATCHED_EPS')).toBe(true);
      expect(categories.has('STALE_DEALS')).toBe(true);
      expect(categories.has('ARRIVALS_READINESS')).toBe(true);
      expect(categories.has('HIGH_SEVERITY_CASES')).toBe(true);
      expect(categories.has('OVERDUE_INVOICES')).toBe(true);

      queue.forEach((item) => {
        expect(item.assignedOwner.length).toBeGreaterThan(0);
        expect(item.rootCauseSignal.length).toBeGreaterThan(10);
        expect(item.recommendedAction.length).toBeGreaterThan(10);
        expect(item.drillDownUrl.startsWith('/')).toBe(true);
      });
    });
  });

  describe('Comprehensive KPI Registry Governance', () => {
    it('registers KPIs across all 11 workflows from the specification', () => {
      expect(COMPREHENSIVE_KPI_REGISTRY.length).toBeGreaterThanOrEqual(20);
      
      const salesKpis = getKpisByDomain('SALES_CRM');
      expect(salesKpis.length).toBeGreaterThanOrEqual(4);

      const fin01 = getKpiRegistryEntry('KPI-FIN-01');
      expect(fin01).toBeDefined();
      expect(fin01?.name).toContain('Overdue');
      expect(fin01?.confidence).toBe('VERIFIED_OFFICIAL');
      expect(fin01?.officialSource?.authority).toBe('Finance Academy');

      const std01 = getKpiRegistryEntry('KPI-STD-01');
      expect(std01).toBeDefined();
      expect(std01?.officialSource?.authority).toBe('Exchange Hub');
      expect(std01?.targetBenchmark).toContain('16 / 18');
    });
  });
});
