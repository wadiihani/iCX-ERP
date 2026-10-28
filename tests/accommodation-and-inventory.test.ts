import { describe, it, expect } from 'vitest';
import {
  validateProviderVettingForBooking,
  validateGenderCompatibility,
  checkTemporalBedCollision,
  allocateBedToEp,
} from '../src/lib/accommodation/accommodation-engine';
import {
  AccommodationProvider,
  AccommodationBed,
  AccommodationAllocation,
} from '../src/lib/types/accommodation';

describe('Plan 03-01: Accommodation Provider Vetting & Bed Inventory Exclusion Constraints', () => {
  const mockValidProvider: AccommodationProvider = {
    id: 'prov-rabat-001',
    lcId: 'LC_RABAT',
    providerName: 'Dar Zellige Host Family (Agdal)',
    providerType: 'GLOBAL_HOST_FAMILY',
    neighborhood: 'Agdal',
    fullAddress: '14 Rue Oukaimeden, Agdal, Rabat',
    contactPerson: 'Mme. Aicha Bennani',
    phoneWhatsapp: '+212661234567',
    vettingStatus: 'APPROVED_VETTED',
    lastVettedDate: '2026-06-01', // ~4.5 months ago
    vettedByUserId: 'user-vp-igv',
    isActive: true,
  };

  const mockBed: AccommodationBed = {
    id: 'bed-agdal-101',
    unitId: 'unit-agdal-1',
    unitName: 'Appartement Agdal Chambre 1',
    providerName: 'Dar Zellige Host Family (Agdal)',
    bedCode: 'BED-A1',
    genderRestriction: 'FEMALE_ONLY',
    monthlyCostMad: 1800,
    depositMad: 500,
    isActive: true,
  };

  // =========================================================================
  // TEST-056: Accommodation Provider Vetting Gatekeeper (REQ-059)
  // =========================================================================
  describe('TEST-056: Provider Vetting Gatekeeper (REQ-059)', () => {
    const fixedNow = new Date('2026-10-26T12:00:00Z');

    it('approves booking for verified provider with vetting inspection < 365 days', () => {
      const result = validateProviderVettingForBooking(mockValidProvider, fixedNow);
      expect(result.isValid).toBe(true);
      expect(result.daysUntilExpiry).toBeGreaterThan(0);
      expect(result.error).toBeUndefined();
    });

    it('strictly blocks booking if provider vetting status is PENDING_INSPECTION', () => {
      const pendingProvider: AccommodationProvider = {
        ...mockValidProvider,
        vettingStatus: 'PENDING_INSPECTION',
      };
      const result = validateProviderVettingForBooking(pendingProvider, fixedNow);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Statutory Violation REQ-059 (TEST-056)');
      expect(result.error).toContain('PENDING_INSPECTION');
    });

    it('strictly blocks booking if provider is SUSPENDED or BLACKLISTED', () => {
      const suspendedProvider: AccommodationProvider = {
        ...mockValidProvider,
        vettingStatus: 'SUSPENDED',
      };
      expect(validateProviderVettingForBooking(suspendedProvider, fixedNow).isValid).toBe(false);

      const blacklistedProvider: AccommodationProvider = {
        ...mockValidProvider,
        vettingStatus: 'BLACKLISTED',
      };
      const res = validateProviderVettingForBooking(blacklistedProvider, fixedNow);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('BLACKLISTED');
    });

    it('blocks booking when provider annual vetting has expired (> 365 days)', () => {
      const expiredProvider: AccommodationProvider = {
        ...mockValidProvider,
        lastVettedDate: '2025-08-01', // > 400 days prior to Oct 2026
      };
      const result = validateProviderVettingForBooking(expiredProvider, fixedNow);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Statutory Violation REQ-059 (TEST-056)');
      expect(result.error).toContain('>365 days');
      expect(result.daysUntilExpiry).toBeLessThan(0);
    });

    it('blocks deactivated provider even if vetting was valid', () => {
      const deactivatedProvider: AccommodationProvider = {
        ...mockValidProvider,
        isActive: false,
      };
      const result = validateProviderVettingForBooking(deactivatedProvider, fixedNow);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('deactivated');
    });
  });

  // =========================================================================
  // TEST-057: Bed Exclusion Constraint INV-01 (REQ-060)
  // =========================================================================
  describe('TEST-057: Bed Overlap Exclusion Constraint (INV-01, REQ-060)', () => {
    const existingAllocations: AccommodationAllocation[] = [
      {
        id: 'alloc-01',
        applicationId: 'app-camilla',
        bedId: 'bed-agdal-101',
        checkInDate: '2026-11-01',
        checkOutDate: '2026-11-30',
        allocStatus: 'RESERVED_LOCKED',
        isArchived: false,
      },
    ];

    it('rejects allocation overlapping inside an existing reservation', () => {
      // Incoming: Nov 10 to Nov 25 (nested inside Nov 1 - Nov 30)
      const collision = checkTemporalBedCollision(
        'bed-agdal-101',
        '2026-11-10',
        '2026-11-25',
        existingAllocations
      );
      expect(collision.hasCollision).toBe(true);
      expect(collision.error).toContain('Statutory Violation INV-01 (TEST-057)');
      expect(collision.conflictingAllocation?.id).toBe('alloc-01');
    });

    it('rejects allocation overlapping start boundary of existing reservation', () => {
      // Incoming: Oct 20 to Nov 10 (overlaps Nov 1 - Nov 30)
      const collision = checkTemporalBedCollision(
        'bed-agdal-101',
        '2026-10-20',
        '2026-11-10',
        existingAllocations
      );
      expect(collision.hasCollision).toBe(true);
    });

    it('rejects allocation overlapping end boundary of existing reservation', () => {
      // Incoming: Nov 20 to Dec 10 (overlaps Nov 1 - Nov 30)
      const collision = checkTemporalBedCollision(
        'bed-agdal-101',
        '2026-11-20',
        '2026-12-10',
        existingAllocations
      );
      expect(collision.hasCollision).toBe(true);
    });

    it('accepts perfectly adjacent booking where check-in equals previous check-out [half-open interval)', () => {
      // Existing: Nov 1 to Nov 30. Incoming: Nov 30 to Dec 31.
      const collision = checkTemporalBedCollision(
        'bed-agdal-101',
        '2026-11-30',
        '2026-12-31',
        existingAllocations
      );
      expect(collision.hasCollision).toBe(false);
      expect(collision.error).toBeUndefined();
    });

    it('accepts non-overlapping booking before existing reservation', () => {
      // Incoming: Oct 01 to Oct 31. Existing starts Nov 01.
      const collision = checkTemporalBedCollision(
        'bed-agdal-101',
        '2026-10-01',
        '2026-10-31',
        existingAllocations
      );
      expect(collision.hasCollision).toBe(false);
    });

    it('ignores CANCELLED allocations when testing collision', () => {
      const allocationsWithCancelled: AccommodationAllocation[] = [
        {
          id: 'alloc-cancelled',
          applicationId: 'app-cancelled',
          bedId: 'bed-agdal-101',
          checkInDate: '2026-11-01',
          checkOutDate: '2026-11-30',
          allocStatus: 'CANCELLED',
          isArchived: false,
        },
      ];

      const collision = checkTemporalBedCollision(
        'bed-agdal-101',
        '2026-11-10',
        '2026-11-25',
        allocationsWithCancelled
      );
      expect(collision.hasCollision).toBe(false);
    });

    it('rejects invalid date range where checkOut <= checkIn', () => {
      const collision = checkTemporalBedCollision(
        'bed-agdal-101',
        '2026-11-20',
        '2026-11-15',
        []
      );
      expect(collision.hasCollision).toBe(true);
      expect(collision.error).toContain('check-out date must be strictly after check-in date');
    });
  });

  // =========================================================================
  // TEST-058: Gender Restriction Compatibility (REQ-061)
  // =========================================================================
  describe('TEST-058: Gender Restriction Compatibility (REQ-061)', () => {
    it('accepts FEMALE EP into FEMALE_ONLY room/bed', () => {
      const res = validateGenderCompatibility('FEMALE_ONLY', 'FEMALE');
      expect(res.isCompatible).toBe(true);
      expect(res.error).toBeUndefined();
    });

    it('rejects MALE EP into FEMALE_ONLY room/bed', () => {
      const res = validateGenderCompatibility('FEMALE_ONLY', 'MALE');
      expect(res.isCompatible).toBe(false);
      expect(res.error).toContain('Statutory Violation REQ-061 (TEST-058)');
      expect(res.error).toContain('FEMALE_ONLY');
    });

    it('accepts MALE EP into MALE_ONLY room/bed', () => {
      const res = validateGenderCompatibility('MALE_ONLY', 'MALE');
      expect(res.isCompatible).toBe(true);
    });

    it('rejects FEMALE EP into MALE_ONLY room/bed', () => {
      const res = validateGenderCompatibility('MALE_ONLY', 'FEMALE');
      expect(res.isCompatible).toBe(false);
      expect(res.error).toContain('Statutory Violation REQ-061 (TEST-058)');
      expect(res.error).toContain('MALE_ONLY');
    });

    it('accepts any gender into COED_PRIVATE room/bed', () => {
      expect(validateGenderCompatibility('COED_PRIVATE', 'MALE').isCompatible).toBe(true);
      expect(validateGenderCompatibility('COED_PRIVATE', 'FEMALE').isCompatible).toBe(true);
      expect(validateGenderCompatibility('COED_PRIVATE', 'OTHER').isCompatible).toBe(true);
    });
  });

  // =========================================================================
  // Full Allocation Pipeline Test
  // =========================================================================
  describe('Complete Bed Allocation Pipeline (REQ-059..061, INV-01)', () => {
    it('successfully allocates bed when provider is vetted, gender matches, and dates do not collide', () => {
      const result = allocateBedToEp({
        applicationId: 'app-sofia-001',
        bed: mockBed, // FEMALE_ONLY
        provider: mockValidProvider, // APPROVED_VETTED
        epGender: 'FEMALE',
        epName: 'Sofia Rossi',
        checkInDate: '2026-11-15',
        checkOutDate: '2026-12-20',
        existingBedAllocations: [],
        currentDate: new Date('2026-10-26'),
      });

      expect(result.success).toBe(true);
      expect(result.allocation).toBeDefined();
      expect(result.allocation?.bedId).toBe(mockBed.id);
      expect(result.allocation?.allocStatus).toBe('RESERVED_LOCKED');
      expect(result.allocation?.depositPaidMad).toBe(500);
      expect(result.errors).toHaveLength(0);
    });

    it('fails with multiple explicit statutory errors if provider expired and gender mismatches', () => {
      const expiredProvider: AccommodationProvider = {
        ...mockValidProvider,
        lastVettedDate: '2024-01-01', // Expired
      };

      const result = allocateBedToEp({
        applicationId: 'app-lucas-002',
        bed: mockBed, // FEMALE_ONLY
        provider: expiredProvider,
        epGender: 'MALE', // Gender mismatch
        epName: 'Lucas Dubois',
        checkInDate: '2026-11-15',
        checkOutDate: '2026-12-20',
        existingBedAllocations: [],
        currentDate: new Date('2026-10-26'),
      });

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors.some((e) => e.includes('REQ-059 (TEST-056)'))).toBe(true);
      expect(result.errors.some((e) => e.includes('REQ-061 (TEST-058)'))).toBe(true);
    });
  });
});
