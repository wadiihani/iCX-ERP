import { describe, it, expect } from 'vitest';
import {
  calculateCompositeMes,
  deriveEngagementTier,
  getTierMeta,
  INITIAL_MEMBERS,
} from '../src/lib/members/member-data';

describe('Member Engagement & MES Calculation Engine (Phase 12 / HUB-TM-01)', () => {
  it('correctly calculates Composite MES using the official weighted formula', () => {
    // MES = 0.35 * Attendance + 0.30 * Quota + 0.20 * SLA + 0.15 * O2O
    const perfectScores = {
      attendance: 100,
      quotaAttainment: 100,
      slaOnTime: 100,
      o2oParticipation: 100,
    };
    expect(calculateCompositeMes(perfectScores)).toBe(100);

    const zeroScores = {
      attendance: 0,
      quotaAttainment: 0,
      slaOnTime: 0,
      o2oParticipation: 0,
    };
    expect(calculateCompositeMes(zeroScores)).toBe(0);

    // Realistic mixed case:
    // 0.35*90 (31.5) + 0.30*80 (24) + 0.20*70 (14) + 0.15*60 (9) = 78.5 -> Math.round = 79
    const mixedScores = {
      attendance: 90,
      quotaAttainment: 80,
      slaOnTime: 70,
      o2oParticipation: 60,
    };
    expect(calculateCompositeMes(mixedScores)).toBe(79);
  });

  it('clamps values between 0 and 100 even with out-of-range inputs', () => {
    const overflowScores = {
      attendance: 120,
      quotaAttainment: 150,
      slaOnTime: 110,
      o2oParticipation: 105,
    };
    expect(calculateCompositeMes(overflowScores)).toBe(100);

    const negativeScores = {
      attendance: -20,
      quotaAttainment: -10,
      slaOnTime: -5,
      o2oParticipation: -50,
    };
    expect(calculateCompositeMes(negativeScores)).toBe(0);
  });

  it('correctly derives 4 engagement tiers at exact boundary thresholds', () => {
    // Tier 1: Core (90% - 100%)
    expect(deriveEngagementTier(100)).toBe('TIER_1_CORE');
    expect(deriveEngagementTier(90)).toBe('TIER_1_CORE');

    // Tier 2: Strong (70% - 89%)
    expect(deriveEngagementTier(89)).toBe('TIER_2_STRONG');
    expect(deriveEngagementTier(70)).toBe('TIER_2_STRONG');

    // Tier 3: Moderate (20% - 69%)
    expect(deriveEngagementTier(69)).toBe('TIER_3_MODERATE');
    expect(deriveEngagementTier(20)).toBe('TIER_3_MODERATE');

    // Tier 4: Risk (<20%)
    expect(deriveEngagementTier(19)).toBe('TIER_4_RISK');
    expect(deriveEngagementTier(0)).toBe('TIER_4_RISK');
  });

  it('provides tier metadata with badges and colors', () => {
    const metaCore = getTierMeta('TIER_1_CORE');
    expect(metaCore.badge).toContain('Tier 1 Core');
    expect(metaCore.colorClass).toContain('text-emerald-700');

    const metaRisk = getTierMeta('TIER_4_RISK');
    expect(metaRisk.badge).toContain('Tier 4 Drop-Off Risk');
    expect(metaRisk.colorClass).toContain('text-rose-700');
  });

  it('verifies Rabat Mandate 26.2 preloaded roster integrity', () => {
    expect(INITIAL_MEMBERS.length).toBeGreaterThanOrEqual(10);

    const wadii = INITIAL_MEMBERS.find((m) => m.fullName === 'Wadii Hani');
    expect(wadii).toBeDefined();
    expect(wadii?.role).toBe('LCVP');
    expect(wadii?.department).toBe('EXTERNAL_BD');
    expect(wadii?.tier).toBe('TIER_1_CORE');
    expect(wadii?.email).toBe('wadii.hani.pro@gmail.com');

    const riskMember = INITIAL_MEMBERS.find((m) => m.tier === 'TIER_4_RISK');
    expect(riskMember).toBeDefined();
    expect(riskMember?.compositeMes).toBeLessThan(20);
  });
});
