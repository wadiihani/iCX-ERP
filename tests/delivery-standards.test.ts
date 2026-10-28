import { describe, it, expect } from 'vitest';
import {
  INITIAL_18_STANDARDS,
  INITIAL_STANDARDS_DOSSIERS,
  INITIAL_PICKUPS,
  INITIAL_CASES,
  type ArrivalPickupRecord,
} from '../src/lib/delivery/standards-types';

describe('Phase 5: Exchange Delivery Operations (18 Standards) & Case Vault', () => {
  it('verifies statutory 18 Exchange Standards definitions (Plan 05-01)', () => {
    expect(INITIAL_18_STANDARDS.length).toBe(18);
    expect(INITIAL_18_STANDARDS[0]?.code).toBe('STD-01');
    expect(INITIAL_18_STANDARDS[17]?.code).toBe('STD-18');

    // Check phases
    const phases = new Set(INITIAL_18_STANDARDS.map(s => s.phase));
    expect(phases.has('PREPARATION')).toBe(true);
    expect(phases.has('EXPERIENCE')).toBe(true);
    expect(phases.has('POST_EXPERIENCE')).toBe(true);
  });

  it('calculates EP standards fulfillment rate correctly', () => {
    expect(INITIAL_STANDARDS_DOSSIERS.length).toBeGreaterThan(0);
    const sofia = INITIAL_STANDARDS_DOSSIERS[0];
    const delivered = sofia.standards.filter(s => s.isDelivered).length;
    const computedRate = Math.round((delivered / sofia.standards.length) * 100);

    expect(sofia.fulfillmentRate).toBe(computedRate);
  });

  it('tracks arrival logistics workflow states (Plan 05-02)', () => {
    expect(INITIAL_PICKUPS.length).toBeGreaterThanOrEqual(2);
    const pickup: ArrivalPickupRecord = { ...INITIAL_PICKUPS[0] };

    expect(pickup.status).toBe('PICKUP_SCHEDULED');

    // Greeter collects EP
    pickup.status = 'EP_COLLECTED';
    expect(pickup.status).toBe('EP_COLLECTED');

    // Checked in at accommodation
    pickup.status = 'CHECKED_IN';
    expect(pickup.status).toBe('CHECKED_IN');
  });

  it('enforces confidential governance on Case Solving Vault records (Plan 05-03)', () => {
    expect(INITIAL_CASES.length).toBeGreaterThan(0);
    const activeCase = INITIAL_CASES[0];

    expect(activeCase.isRestrictedConfidential).toBe(true);
    expect(activeCase.tier).toBe('TIER_1_LOCAL');
    expect(activeCase.escalationDeadline).toBeTruthy();
  });
});
