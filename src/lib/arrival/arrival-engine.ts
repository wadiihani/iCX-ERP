/**
 * Arrival Readiness & Airport Pickup Engine
 * Invariant & Automations: REQ-062, REQ-063, AUTO-018, AUTO-019, TEST-059, TEST-060
 */

import {
  ArrivalReadinessRecord,
  HardLockEvaluationResult,
  PickupMission,
  PickupMissionEvaluationResult,
  PickupInstructionsPack,
  TransitPort,
} from '../types/arrival-readiness';

const TRANSIT_PORT_DETAILS: Record<
  TransitPort,
  { name: string; meetingPoint: string }
> = {
  CMN_AIRPORT: {
    name: 'Casablanca Mohammed V International Airport (CMN)',
    meetingPoint:
      'Terminal 2 International Arrivals Hall, directly in front of the Paul Bakery counter. Look for your AIESEC buddy holding an LC Rabat sign.',
  },
  RBA_AIRPORT: {
    name: 'Rabat-Salé Airport (RBA)',
    meetingPoint:
      'Main Arrivals Terminal exit gate. Look for your AIESEC buddy holding an AIESEC in Rabat welcoming sign.',
  },
  RABAT_VILLE_TRAIN: {
    name: 'Gare Rabat-Ville (Train Station)',
    meetingPoint:
      'Main station hall next to the central departures digital board (Avenue Mohammed V exit).',
  },
  RABAT_AGDAL_TRAIN: {
    name: 'Gare Rabat-Agdal (High-Speed Train Al Boraq Station)',
    meetingPoint:
      'Avenue Haj Ahmed Cherkaoui main glass entrance, ground floor concourse.',
  },
};

/**
 * REQ-062, AUTO-018 & TEST-059: Evaluates Rabat 14-day pre-arrival hard lock.
 * At T-14 days prior to realization start date, checks all 4 statutory reconfirmations:
 * 1. Opportunity reconfirmation (op14dReconfirmedAt)
 * 2. Accommodation provider reconfirmation (provider14dReconfirmedAt)
 * 3. Verified inbound flight / train ticket
 * 4. Moroccan entry visa or exemption clearance
 */
export function evaluateRabat14DayHardLock(
  record: ArrivalReadinessRecord,
  currentDate: Date = new Date()
): HardLockEvaluationResult {
  const realizationMs = new Date(record.realizationStartDate).getTime();
  const currentMs = currentDate.getTime();
  const diffDays = Math.ceil((realizationMs - currentMs) / (1000 * 60 * 60 * 24));

  // If arrival is > 14 days away, hard lock gate is inactive
  if (diffDays > 14) {
    return {
      isHardLockActive: false,
      daysUntilArrival: diffDays,
      isArrivalCleared: true,
      missingPrerequisites: [],
    };
  }

  // Arrival is <= 14 days away (or today/past)
  const missingPrerequisites: string[] = [];

  // Gate 1: Host Opportunity Reconfirmation
  if (!record.op14dReconfirmedAt) {
    missingPrerequisites.push('Host Opportunity Mentor Reconfirmation (Standard #9)');
  }

  // Gate 2: Accommodation Provider Reconfirmation
  if (!record.provider14dReconfirmedAt) {
    missingPrerequisites.push('Accommodation Provider & Bed Reconfirmation (Standard #8)');
  }

  // Gate 3: Verified Inbound Flight/Train
  const hasFlight =
    Boolean(record.flightVerifiedAt) &&
    Boolean(record.pickupMission?.flightOrTrainNumber);
  if (!hasFlight) {
    missingPrerequisites.push('Verified Inbound Flight/Train Ticket (Standard #7)');
  }

  // Gate 4: Moroccan Entry Visa Clearance
  if (!record.visaClearedAt) {
    missingPrerequisites.push('Moroccan Entry Visa or Exemption Clearance (Standard #6)');
  }

  const isArrivalCleared = missingPrerequisites.length === 0;

  return {
    isHardLockActive: true,
    daysUntilArrival: diffDays,
    isArrivalCleared,
    missingPrerequisites,
    blockerMessage: isArrivalCleared
      ? undefined
      : `Statutory Blocker AUTO-018 (TEST-059): Arrival clearance locked at T-${diffDays}d. Missing required reconfirmations: ${missingPrerequisites.join(
          ', '
        )}.`,
  };
}

/**
 * Generates official AIESEC in Rabat 3-day pre-arrival instruction pack for volunteers.
 */
export function generatePickupInstructionsPack(
  record: ArrivalReadinessRecord
): PickupInstructionsPack {
  const mission = record.pickupMission;
  const portInfo = TRANSIT_PORT_DETAILS[mission.transitPort];

  return {
    applicationId: record.applicationId,
    epName: record.epName,
    arrivalDateTime: mission.arrivalDateTime,
    transitPortName: portInfo.name,
    flightOrTrainNumber: mission.flightOrTrainNumber,
    buddyName: mission.pickupBuddyName || 'Unassigned Buddy',
    buddyWhatsapp: mission.pickupBuddyPhone || '+212600000000',
    meetingPointInstructions: portInfo.meetingPoint,
    simCardGuidance:
      'Immediately upon exiting baggage reclaim, visit the Maroc Telecom or Inwi kiosk in the arrivals concourse. Present your passport to receive a complimentary Moroccan SIM card with 4G data.',
    currencyExchangeGuidance:
      'Morocco is primarily cash-oriented. Exchange 500–1000 MAD (~50–100 EUR) at the airport bank counter or withdraw cash from the Al Barid / Attijariwafa bank ATM for local transit and initial expenses.',
    emergencyCrisisLine:
      '+212 537 77 00 00 (LC Rabat 24/7 Operations Hotline & Safety Protocol AUTO-022)',
  };
}

/**
 * REQ-063, AUTO-019 & TEST-060: Airport/Transit Pickup Mission Tracker at T-3 days (72 hours).
 * At <= 72 hours prior to arrival:
 * - If no pickup buddy is assigned, raises critical safety alert.
 * - If buddy is assigned, generates complete 3-day arrival instruction pack.
 */
export function evaluatePickupMissionAtT3(
  record: ArrivalReadinessRecord,
  currentDate: Date = new Date()
): PickupMissionEvaluationResult {
  const mission = record.pickupMission;
  const arrivalMs = new Date(mission.arrivalDateTime).getTime();
  const currentMs = currentDate.getTime();
  const hoursUntilArrival = (arrivalMs - currentMs) / (1000 * 60 * 60);

  // If arrival is > 72 hours away, T-3 dispatch window is not yet active
  if (hoursUntilArrival > 72) {
    return {
      hoursUntilArrival,
      isT3WindowActive: false,
      instructionsDispatched: false,
      hasUnassignedBuddyAlert: false,
    };
  }

  // T-3 Window Active (<= 72 hours)
  const isBuddyAssigned = Boolean(mission.pickupBuddyId);

  if (!isBuddyAssigned) {
    return {
      hoursUntilArrival,
      isT3WindowActive: true,
      instructionsDispatched: false,
      hasUnassignedBuddyAlert: true,
      alertMessage: `CRITICAL SAFETY ALERT AUTO-019 (TEST-060): Volunteer "${
        record.epName
      }" arriving in ${Math.round(hoursUntilArrival)}h at ${
        TRANSIT_PORT_DETAILS[mission.transitPort].name
      } has no assigned pickup buddy! Immediate CXP Team Leader escalation required.`,
    };
  }

  const pack = generatePickupInstructionsPack(record);

  return {
    hoursUntilArrival,
    isT3WindowActive: true,
    instructionsDispatched: true,
    instructionsPack: pack,
    hasUnassignedBuddyAlert: false,
  };
}

/**
 * Records verified completion of airport/transit pickup mission.
 */
export function markPickupCompleted(
  mission: PickupMission,
  notes: string = 'EP met at arrival gate and transported safely to host accommodation',
  completedAt: Date = new Date()
): PickupMission {
  if (!mission.pickupBuddyId) {
    throw new Error('Cannot complete pickup mission: no pickup buddy was assigned.');
  }

  return {
    ...mission,
    pickupCompletedAt: completedAt.toISOString(),
    notes,
  };
}
