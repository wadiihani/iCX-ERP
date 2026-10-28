/**
 * Types & Domain Interfaces for Arrival Readiness & Airport Pickup Missions
 * Baseline: REQ-062, REQ-063, SCR-23, AUTO-018, AUTO-019, TEST-059, TEST-060
 */

export type TransitPort =
  | 'CMN_AIRPORT' // Casablanca Mohammed V Airport
  | 'RBA_AIRPORT' // Rabat-Salé Airport
  | 'RABAT_VILLE_TRAIN' // Rabat-Ville Train Station (Al Boraq / Atlas)
  | 'RABAT_AGDAL_TRAIN'; // Rabat-Agdal Train Station

export type ArrivalStage =
  | 'PLANNING' // > 14 days out
  | 'T14_HARD_LOCK' // <= 14 days out, awaiting 4-gate clearance
  | 'T3_PICKUP_READY' // <= 3 days (72h) out, pickup instructions dispatch
  | 'ARRIVING_TODAY' // Arrival day
  | 'PICKUP_COMPLETED'; // Successfully met and transported to housing

export interface PickupMission {
  id: string;
  applicationId: string;
  arrivalDateTime: string; // ISO 8601
  transitPort: TransitPort;
  flightOrTrainNumber: string;
  pickupBuddyId: string | null;
  pickupBuddyName: string | null;
  pickupBuddyPhone: string | null;
  instructionsSentAt: string | null; // ISO 8601
  pickupCompletedAt: string | null; // ISO 8601
  notes?: string;
}

export interface PickupInstructionsPack {
  applicationId: string;
  epName: string;
  arrivalDateTime: string;
  transitPortName: string;
  flightOrTrainNumber: string;
  buddyName: string;
  buddyWhatsapp: string;
  meetingPointInstructions: string;
  simCardGuidance: string;
  currencyExchangeGuidance: string;
  emergencyCrisisLine: string;
}

export interface ArrivalReadinessRecord {
  applicationId: string;
  epId: string;
  epName: string;
  epGender: 'MALE' | 'FEMALE' | 'OTHER';
  homeLc: string;
  opportunityTitle: string;
  realizationStartDate: string; // YYYY-MM-DD
  // 4 Statutory Clearance Gates (REQ-062, TEST-059)
  op14dReconfirmedAt: string | null;
  provider14dReconfirmedAt: string | null;
  flightVerifiedAt: string | null;
  visaClearedAt: string | null;
  // Housing allocation reference (REQ-060)
  bedAllocationId?: string;
  bedCode?: string;
  housingAddress?: string;
  // Pickup Mission reference (REQ-063)
  pickupMission: PickupMission;
}

export interface HardLockEvaluationResult {
  isHardLockActive: boolean;
  daysUntilArrival: number;
  isArrivalCleared: boolean;
  missingPrerequisites: string[];
  blockerMessage?: string;
}

export interface PickupMissionEvaluationResult {
  hoursUntilArrival: number;
  isT3WindowActive: boolean; // <= 72h
  instructionsDispatched: boolean;
  instructionsPack?: PickupInstructionsPack;
  hasUnassignedBuddyAlert: boolean;
  alertMessage?: string;
}
