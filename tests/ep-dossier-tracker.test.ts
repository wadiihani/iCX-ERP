import { describe, it, expect } from 'vitest';
import { INITIAL_OPPORTUNITIES } from '../src/lib/opportunity/opportunity-data';
import { INITIAL_IR_PARTNERS } from '../src/lib/irm/irm-data';
import { INITIAL_EPS } from '../src/lib/ep/ep-data';

describe('Phase 4: Opportunities, Slots & EP Dossier Matching Engine', () => {
  it('correctly tracks opportunity slot capacity without over-allocation (Plan 04-01)', () => {
    expect(INITIAL_OPPORTUNITIES.length).toBeGreaterThanOrEqual(3);

    INITIAL_OPPORTUNITIES.forEach((opp) => {
      expect(opp.slots.length).toBe(opp.totalOpenings);
      const confirmed = opp.slots.filter(s => s.status === 'CONFIRMED').length;
      const reserved = opp.slots.filter(s => s.status === 'RESERVED').length;
      const unallocated = opp.slots.filter(s => s.status === 'UNALLOCATED').length;

      expect(confirmed + reserved + unallocated).toBe(opp.totalOpenings);
      expect(opp.availableOpenings).toBeLessThanOrEqual(opp.totalOpenings);
    });
  });

  it('tracks bilateral IR partner quotas and sub-12h response SLAs (Plan 04-02)', () => {
    expect(INITIAL_IR_PARTNERS.length).toBeGreaterThanOrEqual(4);

    const munich = INITIAL_IR_PARTNERS.find(p => p.entity_code === 'DE-MUC');
    expect(munich).toBeDefined();
    expect(munich?.tier).toBe('STRATEGIC_IR');
    expect(munich?.avg_response_time_hours).toBeLessThan(12);
    expect(munich?.current_supply_count).toBeLessThanOrEqual(munich!.agreed_annual_quota);
  });

  it('validates EP dossier records and EXPA lifecycle stages (Plan 04-03)', () => {
    expect(INITIAL_EPS.length).toBeGreaterThanOrEqual(4);

    const sofia = INITIAL_EPS.find(e => e.id === 'ep_2026_081');
    expect(sofia).toBeDefined();
    expect(sofia?.full_name).toBe('Sofia Martinez');
    expect(sofia?.product).toBe('iGV');
    expect(sofia?.status).toBe('APPROVED');
    expect(sofia?.insurance_verified).toBe(true);
    expect(sofia?.pickup_confirmed).toBe(true);
  });
});
