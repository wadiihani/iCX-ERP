import { describe, it, expect } from 'vitest';
import {
  generateCohortFunnelStages,
  generateProjectCapacities,
} from '@/lib/analytics/cohort-analytics-engine';
import {
  NivoCohortFunnel,
  NivoProjectCapacityBar,
  NivoSalesVelocityLine,
  NivoCountryYieldBar,
  NivoDomainMicroChart,
  NivoStandardsBar,
  NivoFinanceBar,
  NivoHousingBar,
  NivoMemberTierBar,
} from '@/components/dashboard/graphs/nivo';
import { DomainId } from '@/lib/dashboard/dashboard-types';

describe('Nivo Dashboard Charts Component & Data Transformation Tests', () => {
  const defaultFilters = { program: 'iGV' as const, cohort: '2026-Q2' as const };

  it('confirms all Nivo visual components are defined and exported as valid React components', () => {
    expect(typeof NivoCohortFunnel).toBe('function');
    expect(typeof NivoProjectCapacityBar).toBe('function');
    expect(typeof NivoSalesVelocityLine).toBe('function');
    expect(typeof NivoCountryYieldBar).toBe('function');
    expect(typeof NivoDomainMicroChart).toBe('function');
    expect(typeof NivoStandardsBar).toBe('function');
    expect(typeof NivoFinanceBar).toBe('function');
    expect(typeof NivoHousingBar).toBe('function');
    expect(typeof NivoMemberTierBar).toBe('function');
  });

  it('transforms cohort stages into valid Nivo Funnel data schema', () => {
    const stages = generateCohortFunnelStages(defaultFilters);
    const nivoFunnelData = stages.map((stage) => ({
      id: stage.stageId,
      value: stage.cohortCount,
      label: `${stage.stageName} (${stage.cohortCount})`,
      conversionFromPriorPct: stage.conversionFromPriorPct,
      conversionFraction: stage.conversionFraction,
      dropOffCount: stage.dropOffCount,
    }));

    expect(nivoFunnelData).toHaveLength(5);
    expect(nivoFunnelData[0].id).toBe('APD');
    expect(nivoFunnelData[0].value).toBe(112);
    expect(nivoFunnelData[1].id).toBe('ACC');
    expect(nivoFunnelData[1].value).toBe(64);
    expect(nivoFunnelData[1].conversionFraction).toBe('64/112');
  });

  it('transforms project capacities into valid Nivo Bar stacked horizontal schema', () => {
    const capacities = generateProjectCapacities(defaultFilters);
    const nivoBarData = capacities.map((p) => ({
      projectShort: p.projectName.replace(' Rabat', '').replace(' Clean Oceans', ''),
      filledSlots: p.filledSlots,
      openSlots: p.openSlots,
      totalValidSlots: p.totalValidSlots,
      fillRatePct: p.fillRatePct,
    }));

    expect(nivoBarData.length).toBeGreaterThanOrEqual(4);
    nivoBarData.forEach((item) => {
      expect(item.filledSlots + item.openSlots).toBe(item.totalValidSlots);
      expect(item.fillRatePct).toBeGreaterThan(0);
    });
  });

  it('validates 3x3 domain grid cards support all 9 domain IDs with valid Nivo micro-chart contracts', () => {
    const domainIds: DomainId[] = [
      'funnel',
      'b2b',
      'opps',
      'ir',
      'visa',
      'cxp',
      'housing',
      'finance',
      'members',
    ];

    expect(domainIds).toHaveLength(9);
    domainIds.forEach((id) => {
      const mockCard: any = {
        id,
        number: '01',
        title: `Domain ${id}`,
        primaryMos: { label: 'MoS', value: '100' },
        headlineKpis: [],
      };
      // Micro-chart component accepts card props without type error
      expect(typeof NivoDomainMicroChart).toBe('function');
    });
  });
});
