import { describe, it, expect } from 'vitest';
import {
  DashboardDataEngine,
  INITIAL_RABAT_MEMBERS,
  INITIAL_TEAM_STANDARDS,
} from '../src/lib/dashboard/dashboard-data-engine';
import { type DashboardFilterState } from '../src/lib/dashboard/dashboard-types';

describe('DashboardDataEngine (Module 1 Specification)', () => {
  it('returns all 9 required domain cards with correct IDs and indices', () => {
    const filters: DashboardFilterState = {
      term: '26.2',
      product: 'ALL',
      engine: 'ALL',
      role: 'ALL',
    };

    const summaries = DashboardDataEngine.getDomainSummaries(filters);
    expect(summaries).toHaveLength(9);

    const cardIds = summaries.map((s) => s.id);
    expect(cardIds).toEqual([
      'card-1',
      'card-2',
      'card-3',
      'card-4',
      'card-5',
      'card-6',
      'card-7',
      'card-8',
      'card-9',
    ]);
  });

  it('correctly calculates Composite Member Engagement Score (MES)', () => {
    // 100% attendance, 90% KPI, 90% tasks, O2O done
    // 0.35 * 100 + 0.30 * 90 + 0.20 * 90 + 0.15 * 100 = 35 + 27 + 18 + 15 = 95
    const mes = DashboardDataEngine.calculateMes({
      attendancePct: 100,
      personalKpiPct: 90,
      taskOnTimePct: 90,
      o2oCompleted: true,
    });
    expect(mes).toBe(95);

    // Disengaged member: 15% attendance, 10% KPI, 20% tasks, no O2O
    // 0.35 * 15 + 0.30 * 10 + 0.20 * 20 + 0.15 * 0 = 5.25 + 3 + 4 = 12.25 -> 12
    const lowMes = DashboardDataEngine.calculateMes({
      attendancePct: 15,
      personalKpiPct: 10,
      taskOnTimePct: 20,
      o2oCompleted: false,
    });
    expect(lowMes).toBe(12);
  });

  it('accurately resolves Member Engagement Tiers based on MES and delay', () => {
    expect(DashboardDataEngine.resolveTier(95, 2)).toBe('TIER_1_CORE');
    expect(DashboardDataEngine.resolveTier(92, 18)).toBe('TIER_2_STRONG'); // Late arrival >15m knocks down from Core
    expect(DashboardDataEngine.resolveTier(80, 5)).toBe('TIER_2_STRONG');
    expect(DashboardDataEngine.resolveTier(50, 10)).toBe('TIER_3_MODERATE');
    expect(DashboardDataEngine.resolveTier(15, 30)).toBe('TIER_4_DROPOFF');
  });

  it('filters member engagement metrics reactively by organizational engine', () => {
    const externalFilters: DashboardFilterState = {
      term: '26.2',
      product: 'ALL',
      engine: 'EXTERNAL',
      role: 'ALL',
    };
    const summariesExt = DashboardDataEngine.getDomainSummaries(externalFilters);
    const card9Ext = summariesExt.find((s) => s.id === 'card-9')!;
    expect(card9Ext.microVisualData.total).toBe(5); // 5 external members in roster

    const internalFilters: DashboardFilterState = {
      term: '26.2',
      product: 'ALL',
      engine: 'INTERNAL',
      role: 'ALL',
    };
    const summariesInt = DashboardDataEngine.getDomainSummaries(internalFilters);
    const card9Int = summariesInt.find((s) => s.id === 'card-9')!;
    expect(card9Int.microVisualData.total).toBe(5); // 5 internal members in roster
  });

  it('verifies AFPM direct exchange sustainability ratio exceeds 1.00', () => {
    const filters: DashboardFilterState = {
      term: '26.2',
      product: 'ALL',
      engine: 'ALL',
      role: 'ALL',
    };
    const summaries = DashboardDataEngine.getDomainSummaries(filters);
    const card8 = summaries.find((s) => s.id === 'card-8')!;

    expect(card8.microVisualData.actualRatio).toBeGreaterThan(1.0);
    expect(card8.microVisualData.actualRatio).toBe(1.32);
    expect(card8.healthBadge).toBe('GREEN');
  });
});
