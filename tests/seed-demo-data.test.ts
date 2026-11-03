import { describe, it, expect, beforeEach } from 'vitest';
import { ensureDemoDataSeeded } from '../src/lib/data-integrity/seed-demo-data';
import { getMasterTrackerDb, resetMasterTrackerDb } from '../src/lib/data-integrity/master-tracker';
import { irEcosystemService, resetIrEcosystemDb } from '../src/lib/data-integrity/ir-ecosystem';

describe('Seed Demo Data (Mandate 26.2)', () => {
  beforeEach(() => {
    resetMasterTrackerDb();
    resetIrEcosystemDb();
  });

  it('seeds demo data idempotently without duplicate IR partnership errors', () => {
    // First invocation
    expect(() => ensureDemoDataSeeded()).not.toThrow();

    const db = getMasterTrackerDb();
    expect(db.exchanges.size).toBe(4);
    expect(db.entities.size).toBeGreaterThanOrEqual(5);

    const irPartners = irEcosystemService.listIrPartners();
    expect(irPartners.length).toBe(4);

    // Verify all 4 IR partners have distinct home entities
    const homeEntityIds = irPartners.map((p) => p.home_entity_id);
    const uniqueHomeEntityIds = new Set(homeEntityIds);
    expect(uniqueHomeEntityIds.size).toBe(4);

    // Second invocation must be safe and idempotent
    expect(() => ensureDemoDataSeeded()).not.toThrow();
    expect(irEcosystemService.listIrPartners().length).toBe(4);
  });
});
