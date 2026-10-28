import { describe, it, expect } from 'vitest';
import { validateOpportunity, type OpportunityInput } from '../src/lib/opportunity/opportunity-validator';
import {
  transitionOpportunityStatus,
  checkOpportunityReviewSLA,
  type OpportunityLifecycleRecord,
} from '../src/lib/opportunity/opportunity-machine';
import {
  reserveSlot,
  confirmSlot,
  validateSlotCapacity,
  type OpportunitySlot,
} from '../src/lib/opportunity/slot-machine';

describe('Plan 01-04: Opportunity & Slot Registry', () => {
  describe('TEST-025: iGV Opportunity Creation Statutory Validator (REQ-022)', () => {
    it('approves a fully compliant iGV opportunity', () => {
      const compliant: OpportunityInput = {
        title: 'Youth Digital Literacy Coach',
        product: 'igv',
        sdgTarget: 4,
        durationWeeks: 6,
        weeklyWorkingHours: 30,
        fundingPercentage: 100,
        totalOpenings: 5,
        startDate: '2026-11-01',
        endDate: '2026-12-15',
      };

      const res = validateOpportunity(compliant);
      expect(res.isValid).toBe(true);
      expect(res.errors.length).toBe(0);
    });

    it('rejects an opportunity with invalid duration (<6 weeks or >8 weeks)', () => {
      const shortDuration: OpportunityInput = {
        title: 'Short Camp',
        product: 'igv',
        sdgTarget: 4,
        durationWeeks: 4, // Too short
        weeklyWorkingHours: 30,
        fundingPercentage: 80,
        totalOpenings: 2,
        startDate: '2026-11-01',
        endDate: '2026-11-28',
      };

      const res = validateOpportunity(shortDuration);
      expect(res.isValid).toBe(false);
      expect(res.errors[0]).toContain('duration must be between 6 and 8 weeks');
    });

    it('rejects an opportunity with invalid weekly working hours (<25h or >40h)', () => {
      const tooManyHours: OpportunityInput = {
        title: 'Exhaustive Project',
        product: 'igv',
        sdgTarget: 4,
        durationWeeks: 6,
        weeklyWorkingHours: 45, // Violates max 40h
        fundingPercentage: 80,
        totalOpenings: 2,
        startDate: '2026-11-01',
        endDate: '2026-12-15',
      };

      const res = validateOpportunity(tooManyHours);
      expect(res.isValid).toBe(false);
      expect(res.errors[0]).toContain('weekly working hours must be between 25 and 40 hours');
    });

    it('rejects an opportunity with funding below the 70% statutory threshold', () => {
      const lowFunding: OpportunityInput = {
        title: 'Unfunded Initiative',
        product: 'igv',
        sdgTarget: 4,
        durationWeeks: 6,
        weeklyWorkingHours: 30,
        fundingPercentage: 50, // Violates 70% threshold
        totalOpenings: 2,
        startDate: '2026-11-01',
        endDate: '2026-12-15',
      };

      const res = validateOpportunity(lowFunding);
      expect(res.isValid).toBe(false);
      expect(res.errors[0]).toContain('funding commitment must be at least 70%');
    });
  });

  describe('TEST-026: Opportunity Lifecycle State Machine SM-02 (REQ-023)', () => {
    it('advances opportunity through compliant lifecycle stages', () => {
      const opp: OpportunityLifecycleRecord = {
        id: 'opp-101',
        lcId: 'lc_rabat_001',
        organizationId: 'org-1',
        title: 'SDG 4 Project',
        status: 'DRAFT',
        createdAt: new Date().toISOString(),
        totalOpenings: 5,
        availableOpenings: 5,
        history: [],
      };

      // DRAFT -> UNDER_REVIEW
      const r1 = transitionOpportunityStatus(opp, 'UNDER_REVIEW', 'user_creator');
      expect(r1.success).toBe(true);
      expect(opp.status).toBe('UNDER_REVIEW');
      expect(opp.submittedForReviewAt).toBeDefined();

      // UNDER_REVIEW -> OPEN (Approved by VP)
      const r2 = transitionOpportunityStatus(opp, 'OPEN', 'user_vp');
      expect(r2.success).toBe(true);
      expect(opp.status).toBe('OPEN');
      expect(opp.approvedAt).toBeDefined();

      // OPEN -> APPLICATIONS_OPEN
      const r3 = transitionOpportunityStatus(opp, 'APPLICATIONS_OPEN', 'user_vp');
      expect(r3.success).toBe(true);
      expect(opp.status).toBe('APPLICATIONS_OPEN');
    });

    it('rejects illegal status transition', () => {
      const opp: OpportunityLifecycleRecord = {
        id: 'opp-102',
        lcId: 'lc_rabat_001',
        organizationId: 'org-1',
        title: 'SDG 8 Project',
        status: 'DRAFT',
        createdAt: new Date().toISOString(),
        totalOpenings: 3,
        availableOpenings: 3,
        history: [],
      };

      // DRAFT cannot jump directly to REALIZED
      const r = transitionOpportunityStatus(opp, 'REALIZED', 'user_creator');
      expect(r.success).toBe(false);
      expect(r.error).toContain('Invalid transition');
      expect(opp.status).toBe('DRAFT');
    });
  });

  describe('TEST-027: Slot Allocation Machine SM-03 & Horizon Guard (THR-048)', () => {
    it('reserves and confirms an unallocated slot', () => {
      const now = Date.now();
      const in30Days = new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString();

      const slot: OpportunitySlot = {
        id: 'slot-1',
        opportunityId: 'opp-101',
        slotNumber: 1,
        startDate: in30Days,
        endDate: new Date(now + 72 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'UNALLOCATED',
      };

      // Reserve slot for applicant
      const res = reserveSlot({
        slot,
        applicationId: 'app-501',
        currentDateMs: now,
      });

      expect(res.success).toBe(true);
      expect(slot.status).toBe('RESERVED');
      expect(slot.reservedApplicationId).toBe('app-501');

      // Confirm slot
      const confRes = confirmSlot(slot);
      expect(confRes.success).toBe(true);
      expect(slot.status).toBe('CONFIRMED');
    });

    it('blocks slot reservation if start date exceeds 180-day horizon limit (THR-048)', () => {
      const now = Date.now();
      const in250Days = new Date(now + 250 * 24 * 60 * 60 * 1000).toISOString(); // 250 days > 180 days

      const distantSlot: OpportunitySlot = {
        id: 'slot-distant',
        opportunityId: 'opp-101',
        slotNumber: 2,
        startDate: in250Days,
        endDate: new Date(now + 292 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'UNALLOCATED',
      };

      // Attempt to reserve without VP override
      const res = reserveSlot({
        slot: distantSlot,
        applicationId: 'app-502',
        currentDateMs: now,
        hasVpOverride: false,
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain('Horizon Breach THR-048 (TEST-027)');
      expect(distantSlot.status).toBe('UNALLOCATED');

      // Attempt with VP override
      const overrideRes = reserveSlot({
        slot: distantSlot,
        applicationId: 'app-502',
        currentDateMs: now,
        hasVpOverride: true,
      });

      expect(overrideRes.success).toBe(true);
      expect(distantSlot.status).toBe('RESERVED');
    });

    it('enforces capacity invariant INV-04', () => {
      const validCheck = validateSlotCapacity(5, 3);
      expect(validCheck.isValid).toBe(true);

      const invalidCheck = validateSlotCapacity(3, 4); // 4 active slots > 3 openings
      expect(invalidCheck.isValid).toBe(false);
      expect(invalidCheck.error).toContain('Capacity Invariant Violation INV-04');
    });
  });

  describe('TEST-028: Account Manager 7-Day Review Timer (THR-012)', () => {
    it('detects SLA breach when opportunity is pending review for 7 or more days', () => {
      const now = Date.now();
      const eightDaysAgo = new Date(now - 8 * 24 * 60 * 60 * 1000).toISOString();

      const staleOpp: OpportunityLifecycleRecord = {
        id: 'opp-stale',
        lcId: 'lc_rabat_001',
        organizationId: 'org-1',
        title: 'Stale SDG Opportunity',
        status: 'UNDER_REVIEW',
        createdAt: eightDaysAgo,
        submittedForReviewAt: eightDaysAgo,
        totalOpenings: 4,
        availableOpenings: 4,
        history: [],
      };

      const slaCheck = checkOpportunityReviewSLA(staleOpp, now);
      expect(slaCheck.isBreached).toBe(true);
      expect(slaCheck.daysPending).toBe(8);
      expect(slaCheck.warning).toContain('SLA Breach THR-012 (TEST-028)');
    });

    it('returns compliant when review is under 7 days', () => {
      const now = Date.now();
      const threeDaysAgo = new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString();

      const freshOpp: OpportunityLifecycleRecord = {
        id: 'opp-fresh',
        lcId: 'lc_rabat_001',
        organizationId: 'org-1',
        title: 'Fresh SDG Opportunity',
        status: 'UNDER_REVIEW',
        createdAt: threeDaysAgo,
        submittedForReviewAt: threeDaysAgo,
        totalOpenings: 4,
        availableOpenings: 4,
        history: [],
      };

      const slaCheck = checkOpportunityReviewSLA(freshOpp, now);
      expect(slaCheck.isBreached).toBe(false);
      expect(slaCheck.daysPending).toBe(3);
    });
  });
});
