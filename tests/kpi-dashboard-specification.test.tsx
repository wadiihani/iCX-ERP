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
import { buildKpiDiagnosticDetail } from '@/lib/dashboard/diagnostic-engine';
import {
  COMPREHENSIVE_KPI_REGISTRY,
  getKpiRegistryEntry,
  getKpisByDomain,
} from '@/lib/kpi/kpi-registry';

describe('AIESEC iCX ERP — KPI Dashboard Specification Test Suite', () => {
  const defaultFilters = { program: 'iGV' as const, cohort: '2026-Q2' as const };

  describe('Section 1 & 2: Executive 4-Row Calculation Engine', () => {
    it('calculates Row 1 Outcomes with grounded fractions (X/Y) and targets', () => {
      const outcomes = generateExecutiveOutcomeCards(defaultFilters);
      expect(outcomes.realized.current).toBe(24);
      expect(outcomes.realized.target).toBe(30);
      expect(outcomes.completed.current).toBe(21);
      expect(outcomes.completed.target).toBe(28);

      // Explicit fraction verification
      expect(outcomes.cohortAppToRealized.fractionText).toBe('24/112');
      expect(outcomes.cohortAppToRealized.formattedRate).toBe('21.4%');
      expect(outcomes.cohortAppToRealized.isGood).toBe(true);
      expect(outcomes.standardsCompliance.fractionText).toContain('/');
      expect(outcomes.standardsCompliance.value).toBeGreaterThanOrEqual(88.8);
      expect(outcomes.standardsCompliance.formattedRate).toMatch(/90\.[23]%/);
      expect(outcomes.standardsCompliance.isGood).toBe(true);
    });

    it('calculates Row 2 Supply with B2B pipeline, partners, and capacity fractions', () => {
      const supply = generateExecutiveSupplyCards(defaultFilters);
      expect(supply.qualifiedPipelineMad.amountMad).toBe(245000);
      expect(supply.qualifiedPipelineMad.dealCount).toBe(14);
      expect(supply.signedPartnersCount.current).toBe(12);
      expect(supply.validAvailableSlots.openSlots).toBe(12);
      expect(supply.validAvailableSlots.totalSlots).toBe(60);
      expect(supply.slotFillRate.fractionText).toBe('48/60');
      expect(supply.slotFillRate.formattedRate).toBe('80.0%');
    });

    it('generates Row 3 sequential funnel without skips and with stage drop-off math', () => {
      const stages = generateCohortFunnelStages(defaultFilters);
      expect(stages).toHaveLength(5);
      expect(stages[0].stageId).toBe('APD');
      expect(stages[1].stageId).toBe('ACC');
      expect(stages[2].stageId).toBe('APD_FEE');
      expect(stages[3].stageId).toBe('REA');
      expect(stages[4].stageId).toBe('COM');

      // Monotonic non-increasing cohort count
      expect(stages[0].cohortCount).toBe(112);
      expect(stages[1].cohortCount).toBe(64);
      expect(stages[2].cohortCount).toBe(38);
      expect(stages[3].cohortCount).toBe(24);
      expect(stages[4].cohortCount).toBe(21);

      // Fraction checks
      expect(stages[1].conversionFraction).toBe('64/112');
      expect(stages[2].conversionFraction).toBe('38/64');
      expect(stages[3].conversionFraction).toBe('24/38');
      expect(stages[4].conversionFraction).toBe('21/24');
    });

    it('generates project capacity breakdowns for official SDG projects', () => {
      const projects = generateProjectCapacities(defaultFilters);
      expect(projects.length).toBeGreaterThanOrEqual(4);
      
      const ecoRabat = projects.find((p) => p.projectCode === 'GV-ECO-01');
      expect(ecoRabat).toBeDefined();
      expect(ecoRabat?.sdgNumber).toBe(14);
      expect(ecoRabat?.fillRateFraction).toBe('16/18');
      expect(ecoRabat?.status).toBe('OPTIMAL');

      const classroom = projects.find((p) => p.projectCode === 'GV-EDU-02');
      expect(classroom).toBeDefined();
      expect(classroom?.sdgNumber).toBe(4);
      expect(classroom?.fillRateFraction).toBe('14/16');
    });

    it('generates Row 4 Action Queue answering "Who needs to do what, by when?"', () => {
      const queue = generateActionQueueItems(defaultFilters);
      expect(queue.length).toBeGreaterThanOrEqual(6);

      const stdItem = queue.find((q) => q.category === 'OVERDUE_STANDARDS');
      expect(stdItem).toBeDefined();
      expect(stdItem?.assignedOwner).toBe('Rayen Jbali');
      expect(stdItem?.rootCauseSignal).toContain('Standard #10a');
      expect(stdItem?.recommendedAction).toContain('OP alignment');

      const unmatchedItem = queue.find((q) => q.category === 'UNMATCHED_EPS');
      expect(unmatchedItem).toBeDefined();
      expect(unmatchedItem?.entityName).toContain('Lucas Dubois');
      expect(unmatchedItem?.daysIdleOrOverdue).toBeGreaterThanOrEqual(7);

      const staleItem = queue.find((q) => q.category === 'STALE_DEALS');
      expect(staleItem).toBeDefined();
      expect(staleItem?.entityName).toContain('Fondation OCP');
      expect(staleItem?.daysIdleOrOverdue).toBeGreaterThanOrEqual(14);

      const invItem = queue.find((q) => q.category === 'OVERDUE_INVOICES');
      expect(invItem).toBeDefined();
      expect(invItem?.entityName).toContain('Atlas EcoTours');
      expect(invItem?.rootCauseSignal).toContain('5% late penalty active');
      expect(invItem?.drillDownUrl).toBe('/dashboards#invoices');
    });
  });

  describe('Section 6: Rule-Based Diagnostic Engine', () => {
    it('produces 10-point diagnostic explanation for Cohort Conversion (KPI-FUNNEL-02)', () => {
      const detail = buildKpiDiagnosticDetail('KPI-FUNNEL-02');
      expect(detail.kpiKey).toBe('KPI-FUNNEL-02');
      expect(detail.fractionText).toBe('24/112');
      expect(detail.diagnostic.primaryBottleneck).toContain('EcoRabat');
      expect(detail.diagnostic.affectedEntitiesCount).toBe(12);
      expect(detail.diagnostic.evidenceCitations.length).toBeGreaterThanOrEqual(2);
      expect(detail.nextAction.owner).toContain('Rayen Jbali');
      expect(detail.exceptionRecords.length).toBeGreaterThanOrEqual(2);
      expect(detail.reasonCodes.length).toBeGreaterThanOrEqual(3);
    });

    it('produces 10-point diagnostic explanation for 18 Standards (KPI-STD-01)', () => {
      const detail = buildKpiDiagnosticDetail('KPI-STD-01');
      expect(detail.kpiKey).toBe('KPI-STD-01');
      expect(detail.fractionText).toBe('389/432');
      expect(detail.diagnostic.primaryBottleneck).toContain('Standard #10a');
      expect(detail.exceptionRecords[0].title).toContain('Standard #10a');
      expect(detail.nextAction.routeUrl).toBe('/accommodation#standards');
    });

    it('produces 10-point diagnostic explanation for Overdue Invoices (KPI-FIN-01)', () => {
      const detail = buildKpiDiagnosticDetail('KPI-FIN-01');
      expect(detail.kpiKey).toBe('KPI-FIN-01');
      expect(detail.rateFormatted).toBe('14.1%');
      expect(detail.diagnostic.summary).toContain('INV-2026-003');
      expect(detail.diagnostic.primaryBottleneck).toContain('Net-60');
      expect(detail.exceptionRecords[0].id).toBe('INV-2026-003');
      expect(detail.nextAction.routeUrl).toBe('/dashboards#invoices');
    });
  });

  describe('Section 8: Master KPI Registry Governance', () => {
    it('contains comprehensive metrics covering all 11 workflows from specification', () => {
      expect(COMPREHENSIVE_KPI_REGISTRY.length).toBeGreaterThanOrEqual(20);

      const mkt = getKpisByDomain('MARKET_RESEARCH');
      expect(mkt.length).toBeGreaterThanOrEqual(4);

      const sales = getKpisByDomain('SALES_CRM');
      expect(sales.length).toBeGreaterThanOrEqual(5);

      const contracts = getKpisByDomain('CONTRACTS_SUPPLY');
      expect(contracts.length).toBeGreaterThanOrEqual(3);

      const ir = getKpisByDomain('IR_MANAGEMENT');
      expect(ir.length).toBeGreaterThanOrEqual(2);

      const funnel = getKpisByDomain('EP_FUNNEL');
      expect(funnel.length).toBeGreaterThanOrEqual(3);

      const matching = getKpisByDomain('MATCHING_CAPACITY');
      expect(matching.length).toBeGreaterThanOrEqual(2);

      const visa = getKpisByDomain('VISA_PRE_ARRIVAL');
      expect(visa.length).toBeGreaterThanOrEqual(1);

      const arrival = getKpisByDomain('ARRIVAL_DELIVERY');
      expect(arrival.length).toBeGreaterThanOrEqual(2);

      const standards = getKpisByDomain('EXCHANGE_STANDARDS');
      expect(standards.length).toBeGreaterThanOrEqual(3);

      const finance = getKpisByDomain('FINANCE_ECONOMICS');
      expect(finance.length).toBeGreaterThanOrEqual(3);

      const execution = getKpisByDomain('TEAM_EXECUTION');
      expect(execution.length).toBeGreaterThanOrEqual(2);
    });

    it('ensures every KPI has valid metadata, formula, date basis, and drill-down link', () => {
      for (const kpi of COMPREHENSIVE_KPI_REGISTRY) {
        expect(kpi.kpiKey).toBeTruthy();
        expect(kpi.name).toBeTruthy();
        expect(kpi.definition).toBeTruthy();
        expect(kpi.formulaDescription).toBeTruthy();
        expect(kpi.dateBasis).toBeTruthy();
        expect(kpi.targetBenchmark).toBeTruthy();
        expect(kpi.responsibleRole).toBeTruthy();
        expect(kpi.drillDownUrl.startsWith('/')).toBe(true);
        expect(['VERIFIED_OFFICIAL', 'CONFIRMED_LOCAL', 'PROPOSED']).toContain(kpi.confidence);
      }
    });
  });
});
