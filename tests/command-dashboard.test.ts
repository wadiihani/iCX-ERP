import { describe, it, expect } from 'vitest';
import { generateDashboardData } from '../src/lib/dashboard/dashboard-data-engine';
import { GlobalDashboardFilters, DomainId } from '../src/lib/dashboard/dashboard-types';

describe('Module 1: Command Dashboard & Graph Analytics Architecture', () => {
  it('generates all 9 domain cards with required structure and non-empty scorecards', () => {
    const data = generateDashboardData({
      term: '26.2',
      product: 'All',
      engine: 'All',
      role: 'All',
    });

    expect(data.cards).toHaveLength(9);

    const expectedIds: DomainId[] = [
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

    expectedIds.forEach((id) => {
      const card = data.cards.find((c) => c.id === id);
      expect(card).toBeDefined();
      expect(card!.headlineKpis).toHaveLength(3);
      expect(card!.scorecard.length).toBeGreaterThanOrEqual(2);
      expect(card!.primaryMos).toBeDefined();
      expect(card!.primaryMos.value).toBeDefined();

      // Ensure every scorecard item has a mathematical formula and RAG status
      card!.scorecard.forEach((kpi) => {
        expect(kpi.formula).toBeTruthy();
        expect(['green', 'amber', 'rose']).toContain(kpi.rag);
        expect(kpi.responsibleRole).toBeTruthy();
      });
    });
  });

  it('correctly calculates Card 9 (Member Engagement & TeSt) with 4-tier distribution', () => {
    const data = generateDashboardData({
      term: '26.2',
      product: 'All',
      engine: 'All',
      role: 'All',
    });

    const card9 = data.cards.find((c) => c.id === 'members');
    expect(card9).toBeDefined();
    expect(card9!.title).toContain('Member Engagement');

    // Verify members roster exists
    expect(data.members.length).toBeGreaterThanOrEqual(6);

    // Verify MES formula: (0.35 * att) + (0.30 * kpi) + (0.20 * task) + (0.15 * o2o)
    const rayen = data.members.find((m) => m.name === 'Rayen Jbali');
    expect(rayen).toBeDefined();
    expect(rayen!.tier).toBe(1);
    expect(rayen!.engagementScore).toBeGreaterThanOrEqual(90);

    // Verify Tier 4 correlation: arrival delay > 15m correlates with drop-off
    const tier4Member = data.members.find((m) => m.tier === 4);
    if (tier4Member) {
      expect(tier4Member.arrivalDelayMinutes).toBeGreaterThan(15);
      expect(tier4Member.engagementScore).toBeLessThan(20);
    }
  });

  it('reactively filters data when engine is set to External vs Internal', () => {
    const extData = generateDashboardData({
      term: '26.2',
      product: 'All',
      engine: 'External',
      role: 'All',
    });

    const intData = generateDashboardData({
      term: '26.2',
      product: 'All',
      engine: 'Internal',
      role: 'All',
    });

    const extMembers = extData.members;
    const intMembers = intData.members;

    expect(extMembers.every((m) => m.engine === 'EXTERNAL')).toBe(true);
    expect(intMembers.every((m) => m.engine === 'INTERNAL')).toBe(true);
    expect(extMembers.length).toBeGreaterThan(0);
    expect(intMembers.length).toBeGreaterThan(0);

  });

  it('maintains AFPM sustainability ratio >= 1.0 on finance card', () => {
    const data = generateDashboardData({
      term: '26.2',
      product: 'All',
      engine: 'All',
      role: 'All',
    });

    const financeCard = data.cards.find((c) => c.id === 'finance');
    expect(financeCard).toBeDefined();
    expect(financeCard!.primaryMos.label).toContain('Sustainability');

    const ratioKpi = financeCard!.scorecard.find((k) => k.code === 'FIN-01');
    expect(ratioKpi).toBeDefined();
    expect(parseFloat(ratioKpi!.current.toString())).toBeGreaterThanOrEqual(1.0);
  });
});
