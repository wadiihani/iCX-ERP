import { describe, it, expect } from 'vitest';
import {
  INITIAL_B2B_ORGANIZATIONS,
  INITIAL_B2B_CONTACTS,
  INITIAL_B2B_TOUCHPOINTS,
  type B2BTouchpoint,
} from '../src/lib/crm/organizations-data';

describe('B2B Partner CRM & Directory Engine (Plan 03-01)', () => {
  it('loads valid initial B2B partner organizations for LC Rabat', () => {
    expect(INITIAL_B2B_ORGANIZATIONS.length).toBeGreaterThanOrEqual(4);
    const bmce = INITIAL_B2B_ORGANIZATIONS.find(o => o.id === 'org_rabat_001');
    expect(bmce).toBeDefined();
    expect(bmce?.name).toBe('BMCE Bank Foundation');
    expect(bmce?.tier).toBe('TIER_1');
    expect(bmce?.sector).toBe('FINANCE');
    expect(bmce?.city).toBe('Casablanca');
    expect(bmce?.status).toBe('ACTIVE_PARTNER');
    expect(bmce?.total_deal_value_mad).toBeGreaterThan(0);
  });

  it('validates contact directory relationships and primary contact flags', () => {
    expect(INITIAL_B2B_CONTACTS.length).toBeGreaterThanOrEqual(3);
    const primaryContacts = INITIAL_B2B_CONTACTS.filter(c => c.is_primary);
    expect(primaryContacts.length).toBeGreaterThan(0);

    const bmcePrimary = INITIAL_B2B_CONTACTS.find(c => c.organization_id === 'org_rabat_001' && c.is_primary);
    expect(bmcePrimary?.name).toBe('Dr. Leila Benhayoun');
    expect(bmcePrimary?.email).toContain('@');
  });

  it('enforces mandatory SLA next action deliverable on every touchpoint', () => {
    expect(INITIAL_B2B_TOUCHPOINTS.length).toBeGreaterThan(0);

    INITIAL_B2B_TOUCHPOINTS.forEach((tp) => {
      expect(tp.minutes).toBeTruthy();
      expect(tp.next_action).toBeTruthy();
      expect(tp.next_action_due_date).toBeTruthy();
      expect(tp.next_action_owner).toBeTruthy();
      expect(new Date(tp.next_action_due_date).getTime()).toBeGreaterThan(0);
    });
  });

  it('allows adding a new touchpoint and records assigned owner', () => {
    const newTouchpoint: B2BTouchpoint = {
      id: 'tp_test_100',
      organization_id: 'org_rabat_002',
      organization_name: 'Rabat American School',
      touchpoint_type: 'PHONE_CALL',
      meeting_date: '2026-10-28T09:00:00Z',
      minutes: 'Spoke with Dean Williams regarding visa documentation.',
      next_action: 'Send scanned passport copy and embassy letter',
      next_action_due_date: '2026-11-02T00:00:00Z',
      next_action_owner: 'Mehdi Benjelloun',
      created_by: 'Mehdi Benjelloun',
      created_at: '2026-10-28T09:30:00Z',
    };

    expect(newTouchpoint.organization_name).toBe('Rabat American School');
    expect(newTouchpoint.next_action_owner).toBe('Mehdi Benjelloun');
  });
});
