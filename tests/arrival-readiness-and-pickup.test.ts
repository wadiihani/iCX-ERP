import { describe, it, expect } from 'vitest';
import {
  evaluateRabat14DayHardLock,
  evaluatePickupMissionAtT3,
  generatePickupInstructionsPack,
  markPickupCompleted,
} from '../src/lib/arrival/arrival-engine';
import { ArrivalReadinessRecord } from '../src/lib/types/arrival-readiness';

describe('Plan 03-02: Arrival Readiness Board, 14-Day Lock & Pickup Missions', () => {
  const createBaseRecord = (): ArrivalReadinessRecord => ({
    applicationId: 'APP-RABAT-2026-301',
    epId: 'EP-4411',
    epName: 'Matteo Rossi',
    epGender: 'MALE',
    homeLc: 'AIESEC in Milan',
    opportunityTitle: 'EcoRabat Climate Champion',
    realizationStartDate: '2026-11-10', // Target arrival start
    op14dReconfirmedAt: '2026-10-25T10:00:00Z',
    provider14dReconfirmedAt: '2026-10-25T11:00:00Z',
    flightVerifiedAt: '2026-10-25T12:00:00Z',
    visaClearedAt: '2026-10-25T14:00:00Z',
    bedAllocationId: 'alloc-99',
    bedCode: 'BED-IRF-01',
    housingAddress: 'Residence Al Irfane, Souissi, Rabat',
    pickupMission: {
      id: 'pickup-001',
      applicationId: 'APP-RABAT-2026-301',
      arrivalDateTime: '2026-11-09T16:30:00Z',
      transitPort: 'CMN_AIRPORT',
      flightOrTrainNumber: 'AT-801',
      pickupBuddyId: 'user-buddy-mehdi',
      pickupBuddyName: 'Mehdi Benkaddour',
      pickupBuddyPhone: '+212661889900',
      instructionsSentAt: null,
      pickupCompletedAt: null,
    },
  });

  // =========================================================================
  // TEST-059: Rabat 14-Day Pre-Arrival Hard Lock (REQ-062, AUTO-018)
  // =========================================================================
  describe('TEST-059: Rabat 14-Day Pre-Arrival Hard Lock (REQ-062, AUTO-018)', () => {
    it('keeps hard lock inactive when arrival is > 14 days away', () => {
      // 20 days prior (Oct 21)
      const currentDate = new Date('2026-10-21T00:00:00Z');
      const record = createBaseRecord();
      // Even if reconfirmations are null, at >14d it's not locked
      record.op14dReconfirmedAt = null;
      record.provider14dReconfirmedAt = null;

      const result = evaluateRabat14DayHardLock(record, currentDate);
      expect(result.isHardLockActive).toBe(false);
      expect(result.daysUntilArrival).toBe(20);
      expect(result.isArrivalCleared).toBe(true);
      expect(result.blockerMessage).toBeUndefined();
    });

    it('activates hard lock at T-14 and blocks clearance when OP reconfirmation is missing', () => {
      // 10 days prior (Oct 31)
      const currentDate = new Date('2026-10-31T00:00:00Z');
      const record = createBaseRecord();
      record.op14dReconfirmedAt = null; // Missing OP reconfirmation

      const result = evaluateRabat14DayHardLock(record, currentDate);
      expect(result.isHardLockActive).toBe(true);
      expect(result.isArrivalCleared).toBe(false);
      expect(result.missingPrerequisites).toContain(
        'Host Opportunity Mentor Reconfirmation (Standard #9)'
      );
      expect(result.blockerMessage).toContain('Statutory Blocker AUTO-018 (TEST-059)');
    });

    it('blocks clearance when accommodation provider reconfirmation is missing', () => {
      const currentDate = new Date('2026-11-01T00:00:00Z'); // 9 days prior
      const record = createBaseRecord();
      record.provider14dReconfirmedAt = null; // Missing accommodation

      const result = evaluateRabat14DayHardLock(record, currentDate);
      expect(result.isArrivalCleared).toBe(false);
      expect(result.missingPrerequisites).toContain(
        'Accommodation Provider & Bed Reconfirmation (Standard #8)'
      );
    });

    it('blocks clearance when inbound flight/train ticket is unverified', () => {
      const currentDate = new Date('2026-11-01T00:00:00Z');
      const record = createBaseRecord();
      record.flightVerifiedAt = null; // Missing flight

      const result = evaluateRabat14DayHardLock(record, currentDate);
      expect(result.isArrivalCleared).toBe(false);
      expect(result.missingPrerequisites).toContain(
        'Verified Inbound Flight/Train Ticket (Standard #7)'
      );
    });

    it('blocks clearance when Moroccan entry visa is missing', () => {
      const currentDate = new Date('2026-11-01T00:00:00Z');
      const record = createBaseRecord();
      record.visaClearedAt = null; // Missing visa

      const result = evaluateRabat14DayHardLock(record, currentDate);
      expect(result.isArrivalCleared).toBe(false);
      expect(result.missingPrerequisites).toContain(
        'Moroccan Entry Visa or Exemption Clearance (Standard #6)'
      );
    });

    it('grants ARRIVAL_CLEARED at T-14 when all 4 statutory reconfirmations are satisfied', () => {
      const currentDate = new Date('2026-11-02T00:00:00Z'); // 8 days prior
      const record = createBaseRecord(); // All 4 populated

      const result = evaluateRabat14DayHardLock(record, currentDate);
      expect(result.isHardLockActive).toBe(true);
      expect(result.isArrivalCleared).toBe(true);
      expect(result.missingPrerequisites).toHaveLength(0);
      expect(result.blockerMessage).toBeUndefined();
    });

    it('enforces exact boundary condition at T-14 days (336 hours)', () => {
      // Exactly 14 days prior (Oct 27 to Nov 10)
      const currentDate = new Date('2026-10-27T00:00:00Z');
      const record = createBaseRecord();
      record.provider14dReconfirmedAt = null;

      const result = evaluateRabat14DayHardLock(record, currentDate);
      expect(result.isHardLockActive).toBe(true);
      expect(result.daysUntilArrival).toBe(14);
      expect(result.isArrivalCleared).toBe(false);
    });
  });

  // =========================================================================
  // TEST-060: Airport/Transit Pickup Mission Tracker (REQ-063, AUTO-019)
  // =========================================================================
  describe('TEST-060: Airport/Transit Pickup Mission Tracker (REQ-063, AUTO-019)', () => {
    it('does not dispatch instructions when arrival is > 72 hours away', () => {
      // Arrival: 2026-11-09T16:30:00Z. Now: Nov 05 (96 hours away)
      const currentDate = new Date('2026-11-05T16:30:00Z');
      const record = createBaseRecord();

      const result = evaluatePickupMissionAtT3(record, currentDate);
      expect(result.isT3WindowActive).toBe(false);
      expect(result.instructionsDispatched).toBe(false);
      expect(result.hasUnassignedBuddyAlert).toBe(false);
      expect(result.hoursUntilArrival).toBe(96);
    });

    it('raises critical safety alert when volunteer arrives in <= 72h without assigned buddy', () => {
      // Arrival: Nov 09 16:30. Now: Nov 07 16:30 (48 hours away)
      const currentDate = new Date('2026-11-07T16:30:00Z');
      const record = createBaseRecord();
      record.pickupMission.pickupBuddyId = null; // No buddy assigned!
      record.pickupMission.pickupBuddyName = null;

      const result = evaluatePickupMissionAtT3(record, currentDate);
      expect(result.isT3WindowActive).toBe(true);
      expect(result.instructionsDispatched).toBe(false);
      expect(result.hasUnassignedBuddyAlert).toBe(true);
      expect(result.alertMessage).toContain('CRITICAL SAFETY ALERT AUTO-019 (TEST-060)');
      expect(result.alertMessage).toContain('has no assigned pickup buddy');
      expect(result.alertMessage).toContain('CXP Team Leader escalation required');
    });

    it('dispatches complete 3-day arrival instructions pack when buddy is assigned at <= 72h', () => {
      // 48 hours away with buddy assigned
      const currentDate = new Date('2026-11-07T16:30:00Z');
      const record = createBaseRecord();

      const result = evaluatePickupMissionAtT3(record, currentDate);
      expect(result.isT3WindowActive).toBe(true);
      expect(result.instructionsDispatched).toBe(true);
      expect(result.hasUnassignedBuddyAlert).toBe(false);
      expect(result.instructionsPack).toBeDefined();

      const pack = result.instructionsPack!;
      expect(pack.epName).toBe('Matteo Rossi');
      expect(pack.transitPortName).toContain('Casablanca Mohammed V');
      expect(pack.flightOrTrainNumber).toBe('AT-801');
      expect(pack.buddyName).toBe('Mehdi Benkaddour');
      expect(pack.buddyWhatsapp).toBe('+212661889900');
      expect(pack.simCardGuidance).toContain('Maroc Telecom or Inwi kiosk');
      expect(pack.currencyExchangeGuidance).toContain('Exchange 500–1000 MAD');
      expect(pack.emergencyCrisisLine).toContain('+212 537 77 00 00');
    });

    it('generates port-specific meeting point instructions for train stations', () => {
      const record = createBaseRecord();
      record.pickupMission.transitPort = 'RABAT_VILLE_TRAIN';
      record.pickupMission.flightOrTrainNumber = 'Al Boraq 104';

      const pack = generatePickupInstructionsPack(record);
      expect(pack.transitPortName).toContain('Gare Rabat-Ville');
      expect(pack.meetingPointInstructions).toContain('Avenue Mohammed V exit');
    });

    it('records verified pickup completion upon meeting volunteer', () => {
      const record = createBaseRecord();
      const completedMission = markPickupCompleted(
        record.pickupMission,
        'EP met at Terminal 2, SIM card obtained, transported via Al Boraq to Rabat housing',
        new Date('2026-11-09T17:45:00Z')
      );

      expect(completedMission.pickupCompletedAt).toBe('2026-11-09T17:45:00.000Z');
      expect(completedMission.notes).toContain('SIM card obtained');
    });

    it('throws error when trying to complete pickup without assigned buddy', () => {
      const record = createBaseRecord();
      record.pickupMission.pickupBuddyId = null;

      expect(() => markPickupCompleted(record.pickupMission)).toThrow(
        'Cannot complete pickup mission: no pickup buddy was assigned.'
      );
    });
  });
});
