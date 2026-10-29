/**
 * Phase 16 Test Suite: Refreshed Exchange Standards, CXP, Human-Verified Visa Registry, Case Solving Vault & Accommodation Board
 * Statutory References: HUB-STD-02, HUB-STD-03, HUB-CXP-01, HUB-VISA-01, HUB-CASE-01, HUB-OPS-01, HUB-OPS-02
 */

import { describe, it, expect } from 'vitest';
import {
  REFRESHED_STANDARDS_CATALOG,
  calculateRefreshedFulfillment,
  generateCorrectiveTaskFromTouchpoint,
  type CustomerTouchpointRecord,
  type EpStandardDeliveryItem,
} from '../src/lib/delivery/refreshed-standards';
import {
  buildVisaRecord,
  executeHumanVisaVerification,
  type HumanVerifiedVisaRecord,
} from '../src/lib/visa/visa-registry';
import {
  checkTemporalBedCollision,
  allocateBedToEp,
  validateProviderVettingForBooking,
} from '../src/lib/accommodation/accommodation-engine';
import {
  AccommodationProvider,
  AccommodationBed,
  AccommodationAllocation,
} from '../src/lib/types/accommodation';
import {
  evaluateStageClock,
  pauseCaseClock,
  resumeCaseClock,
  createQualityCase,
} from '../src/lib/cases/quality-case-engine';
import {
  calculateAnnex2DraftCompensation,
} from '../src/lib/cases/compensation-calculator';

describe('Phase 16: Refreshed Standards, CXP, Visa Registry, Case Vault & Accommodation', () => {
  // =========================================================================
  // 1. Plan 16-01: Refreshed Exchange Standards (#10a/#10b Split & CXP Loop)
  // =========================================================================
  describe('Plan 16-01: Refreshed Standards & CXP Feedback Action Loop', () => {
    it('contains 19 items with Standard #10 split into #10a and #10b', () => {
      expect(REFRESHED_STANDARDS_CATALOG.length).toBe(19);

      const std10a = REFRESHED_STANDARDS_CATALOG.find((s) => s.id === '10a');
      const std10b = REFRESHED_STANDARDS_CATALOG.find((s) => s.id === '10b');

      expect(std10a).toBeDefined();
      expect(std10a?.code).toBe('STD-10a');
      expect(std10a?.surveyPhase).toBe('Middle Survey');

      expect(std10b).toBeDefined();
      expect(std10b?.code).toBe('STD-10b');
      expect(std10b?.surveyPhase).toBe('Final Survey');
    });

    it('computes fulfillment % and identifies survey discrepancies', () => {
      const mockStandards: Record<string, EpStandardDeliveryItem> = {
        '1': { standardId: '1', internalDelivered: true, expaSurveyAnswer: 'YES', isDiscrepancy: false },
        '2': { standardId: '2', internalDelivered: true, expaSurveyAnswer: 'YES', isDiscrepancy: false },
        '10a': { standardId: '10a', internalDelivered: true, expaSurveyAnswer: 'NO', isDiscrepancy: true }, // Discrepancy!
      };

      const result = calculateRefreshedFulfillment(mockStandards);
      expect(result.total).toBe(19);
      expect(result.deliveredCount).toBe(3);
      expect(result.discrepancyCount).toBe(1);
      expect(result.fulfillmentPercentage).toBe(Math.round((3 / 19) * 100));
    });

    it('converts negative touchpoint feedback into an actionable corrective task', () => {
      const negativeTouchpoint: CustomerTouchpointRecord = {
        id: 'tp_01',
        epId: 'ep_test',
        epName: 'Sofia Martinez',
        touchpointDate: '2026-10-28',
        officerName: 'Amina Benali',
        overallMood: 2, // Low mood!
        workingHoursSatisfied: false,
        housingSatisfied: true,
        deliverablesOnTrack: true,
        notes: 'Working hours dispute with OP manager.',
        requiresAction: true,
      };

      const task = generateCorrectiveTaskFromTouchpoint(negativeTouchpoint);
      expect(task.epId).toBe('ep_test');
      expect(task.severity).toBe('HIGH');
      expect(task.status).toBe('PENDING');
      expect(task.title).toContain('Working hours dispute');
      expect(task.assignedRole).toBe('VP CXP');
      expect(task.deadlineHours).toBeLessThanOrEqual(48);
    });
  });

  // =========================================================================
  // 2. Plan 16-02: Human-Verified Visa Registry & Restricted Case Vault
  // =========================================================================
  describe('Plan 16-02: Human-Verified Visa Registry & Restricted Case Vault', () => {
    it('blocks automated clearance; requires explicit human verification and 180-day passport validity', () => {
      const visa = buildVisaRecord({
        epId: 'ep_india',
        epName: 'Aarav Sharma',
        passportNumber: 'IND-12345',
        nationalityCountry: 'India',
        residenceCountry: 'India',
        arrivalDate: '2026-11-15',
        departureDate: '2026-12-27',
        passportExpiryDate: '2028-05-01', // Plenty of validity
      });

      // Needs verification initially
      expect(visa.moroccanRegime).toBe('AEVM_EVISA');
      expect(visa.leadTimeDays).toBe(21);
      expect(visa.verificationStatus).toBe('NEEDS_VERIFICATION');
      expect(visa.isTravelCleared).toBe(false);

      // Execute human verification
      const verified = executeHumanVisaVerification(visa, {
        verifierName: 'Amina Benali',
        verifierRole: 'VP CXP',
        newStatus: 'VERIFIED_HUMAN',
        notes: 'eVisa approved on MAE portal.',
      });

      expect(verified.verificationStatus).toBe('VERIFIED_HUMAN');
      expect(verified.humanVerifierName).toBe('Amina Benali');
      expect(verified.isTravelCleared).toBe(true);
    });

    it('flags passport expiring within 180 days of departure as non-compliant', () => {
      const expiringVisa = buildVisaRecord({
        epId: 'ep_cameroon',
        epName: 'Jean-Paul Kamga',
        passportNumber: 'CMR-999',
        nationalityCountry: 'Cameroon',
        residenceCountry: 'Cameroon',
        arrivalDate: '2026-12-01',
        departureDate: '2027-03-01',
        passportExpiryDate: '2027-04-01', // Only 31 days after departure! (<180 days)
      });

      expect(expiringVisa.isPassportValid180DaysPostDeparture).toBe(false);
      expect(expiringVisa.isTravelCleared).toBe(false);
    });

    it('evaluates statutory 3-tier escalation clocks and supports pausing (REQ-078)', () => {
      const fixedStart = new Date('2026-10-27T10:00:00Z');
      const qCase = createQualityCase({
        lcId: 'lc_rabat',
        applicationId: 'app_01',
        epId: 'ep_01',
        epName: 'Sofia Rossi',
        homeLc: 'AIESEC in Milan',
        classification: 'STANDARDS_BREACH',
        description: 'Hours dispute',
        timestamp: fixedStart.toISOString(),
      });

      expect(qCase.stage).toBe('STAGE_1_LC_DIRECT');

      // Check after 24h
      const checkTime = new Date('2026-10-28T10:00:00Z');
      const clock = evaluateStageClock(qCase, checkTime);
      expect(clock.clockLimitHours).toBe(72);
      expect(clock.grossElapsedHours).toBe(24);
      expect(clock.remainingHours).toBe(48);
      expect(clock.isBreached).toBe(false);

      // Pause clock
      const pausedCase = pauseCaseClock(qCase, {
        reason: 'WAITING_ON_EXTERNAL_EVIDENCE',
        notes: 'Waiting for official supervisor timetable confirmation',
        userId: 'vp-cxp',
        timestamp: checkTime.toISOString(),
      });
      expect(pausedCase.isClockPaused).toBe(true);
      expect(pausedCase.pauseIntervals.length).toBe(1);

      // Check 10 hours later while paused
      const checkPaused = evaluateStageClock(pausedCase, new Date('2026-10-28T20:00:00Z'));
      expect(checkPaused.effectiveElapsedHours).toBe(24); // Did not advance!
    });

    it('calculates Annex 2 draft compensation in MAD with 70% threshold reduction', () => {
      const comp = calculateAnnex2DraftCompensation({
        caseId: 'case_101',
        epName: 'Test EP',
        homeLc: 'AIESEC in Curitiba',
        totalFeePaidMad: 3000,
        exchangeDurationDays: 42,
        completedDays: 35, // >70% completed!
        unfulfilledStandardsCount: 2,
        emergencyAccommodationNights: 2,
        emergencyNightRateMad: 250,
      });

      expect(comp.isPast70PercentDismissalThreshold).toBe(true);
      expect(comp.totalDraftCompensationMad).toBeGreaterThan(0);
      expect(comp.requiresHumanApproval).toBe(true);
    });
  });

  // =========================================================================
  // 3. Plan 16-03: Accommodation Bed Allocation & Airport Pickups
  // =========================================================================
  describe('Plan 16-03: Bed Allocation Board (INV-01) & Airport Pickups', () => {
    const mockProvider: AccommodationProvider = {
      id: 'prov-01',
      lcId: 'LC_RABAT',
      providerName: 'Dar Zellige Host Family',
      providerType: 'GLOBAL_HOST_FAMILY',
      neighborhood: 'Agdal',
      fullAddress: '14 Rue Oukaimeden, Agdal, Rabat',
      contactPerson: 'Mme. Bennani',
      phoneWhatsapp: '+212661234567',
      vettingStatus: 'APPROVED_VETTED',
      lastVettedDate: '2026-06-01',
      vettedByUserId: 'vp-igv',
      isActive: true,
    };

    const mockBed: AccommodationBed = {
      id: 'bed-agdal-101',
      unitId: 'unit-01',
      unitName: 'Chambre 1',
      providerName: 'Dar Zellige Host Family',
      bedCode: 'BED-AGDAL-A1',
      genderRestriction: 'FEMALE_ONLY',
      monthlyCostMad: 1800,
      depositMad: 500,
      isActive: true,
    };

    const existingAllocation: AccommodationAllocation = {
      id: 'alloc-01',
      applicationId: 'app-01',
      bedId: 'bed-agdal-101',
      epName: 'Sofia Martinez',
      epGender: 'FEMALE',
      checkInDate: '2026-11-15',
      checkOutDate: '2026-12-27',
      allocStatus: 'RESERVED_LOCKED',
      isArchived: false,
    };

    it('enforces mathematical temporal exclusion (INV-01) and rejects overlapping bookings', () => {
      // Proposed booking overlaps existing [2026-11-15, 2026-12-27)
      const collision = checkTemporalBedCollision(
        'bed-agdal-101',
        '2026-12-01',
        '2027-01-15',
        [existingAllocation]
      );

      expect(collision.hasCollision).toBe(true);
      expect(collision.error).toContain('Temporal collision');
    });

    it('permits adjacent sequential booking where check-in equals previous check-out date', () => {
      // Next EP checks in exactly when previous EP checks out: 2026-12-27
      const collision = checkTemporalBedCollision(
        'bed-agdal-101',
        '2026-12-27',
        '2027-02-15',
        [existingAllocation]
      );

      expect(collision.hasCollision).toBe(false);
    });

    it('strictly enforces gender restriction compatibility (REQ-061)', () => {
      const maleResult = allocateBedToEp({
        applicationId: 'app-male',
        bed: mockBed, // FEMALE_ONLY
        provider: mockProvider,
        epGender: 'MALE',
        epName: 'Carlos Gomez',
        checkInDate: '2027-01-01',
        checkOutDate: '2027-02-01',
        existingBedAllocations: [],
      });

      expect(maleResult.success).toBe(false);
      expect(maleResult.errors.some((e) => e.includes('FEMALE_ONLY'))).toBe(true);
    });

    it('successfully allocates bed when provider is vetted, gender matches, and dates do not collide', () => {
      const successResult = allocateBedToEp({
        applicationId: 'app-female',
        bed: mockBed,
        provider: mockProvider,
        epGender: 'FEMALE',
        epName: 'Fatima Zahra',
        checkInDate: '2027-01-01',
        checkOutDate: '2027-02-01',
        existingBedAllocations: [existingAllocation],
      });

      expect(successResult.success).toBe(true);
      expect(successResult.allocation).toBeDefined();
      expect(successResult.allocation?.bedId).toBe('bed-agdal-101');
      expect(successResult.allocation?.allocStatus).toBe('RESERVED_LOCKED');
    });
  });
});
