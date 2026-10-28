import { describe, it, expect } from 'vitest';
import { transitionDealStage, type DealRecord } from '../src/lib/sales/pipeline-machine';

describe('B2B Deal Pipeline Engine & Gates (Plan 03-02)', () => {
  const getBaseDeal = (): DealRecord => ({
    id: 'deal_test_1',
    lcId: 'lc_rabat',
    organizationId: 'org_rabat_001',
    stage: 'LEAD',
    dealValue: 30000,
    product: 'igv',
    assignedTo: 'Youssef Mansouri',
    history: [],
  });

  it('allows advancing along the standard sequence: LEAD -> CONTACTED -> MEETING_SCHEDULED', () => {
    const deal = getBaseDeal();
    const res1 = transitionDealStage(deal, 'CONTACTED', 'user_1');
    expect(res1.success).toBe(true);
    expect(deal.stage).toBe('CONTACTED');

    const res2 = transitionDealStage(deal, 'MEETING_SCHEDULED', 'user_1');
    expect(res2.success).toBe(true);
    expect(deal.stage).toBe('MEETING_SCHEDULED');
  });

  it('blocks skipping stages (e.g. LEAD directly to PROPOSAL_SENT)', () => {
    const deal = getBaseDeal();
    const res = transitionDealStage(deal, 'PROPOSAL_SENT', 'user_1');
    expect(res.success).toBe(false);
    expect(res.error).toContain('Invalid transition');
  });

  it('enforces statutory Discovery Gate before PROPOSAL_SENT', () => {
    const deal = getBaseDeal();
    deal.stage = 'DISCOVERY_COMPLETED';
    // Without discovery answers
    deal.discoveryAnswers = null;

    const res = transitionDealStage(deal, 'PROPOSAL_SENT', 'user_1');
    expect(res.success).toBe(false);
    expect(res.error).toContain('Discovery Gate Block');

    // With valid discovery answers
    deal.discoveryAnswers = {
      sdgGoal: 4,
      weeklyWorkingHours: 30,
      durationWeeks: 6,
      hasSupervisorAssigned: true,
      supervisorName: 'Dr. Leila',
      accommodationConfirmed: true,
      fundingCommitmentPercentage: 100,
      completedAt: '2026-10-25T10:00:00Z',
      completedBy: 'Youssef Mansouri',
    };

    const resValid = transitionDealStage(deal, 'PROPOSAL_SENT', 'user_1');
    expect(resValid.success).toBe(true);
    expect(deal.stage).toBe('PROPOSAL_SENT');
  });

  it('allows marking deal CLOSED_LOST with mandatory audit reason', () => {
    const deal = getBaseDeal();
    const res = transitionDealStage(deal, 'CLOSED_LOST', 'user_1', 'BUDGET_CANCELLED: Partner budget frozen for Q4');
    expect(res.success).toBe(true);
    expect(deal.stage).toBe('CLOSED_LOST');
    expect(deal.history[0]?.reason).toContain('BUDGET_CANCELLED');
  });
});
