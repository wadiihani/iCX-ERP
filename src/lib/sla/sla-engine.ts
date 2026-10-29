/**
 * Deterministic SLA Automations Engine (AUTO-001..035)
 * Baseline: REQ-049, REQ-050, REQ-051, THR-002, THR-010, THR-021, and TEST-044, TEST-046, TEST-047
 * Extended with AEPP 4.4.3.1, AEPP 4.4.2.1, Standard #6 Pickup Guide, and 14d OP/Bed Lock.
 */

import { addMoroccoBusinessHours, calculateBusinessHoursBetween } from './morocco-calendar';
import type { EPRecord } from '../ep/ep-data';

export interface SlaTimerResult {
  isBreached: boolean;
  hoursElapsed: number;
  hoursAllowed: number;
  deadlineIso: string;
  urgency: 'NORMAL' | 'WARNING_80' | 'BREACHED_100' | 'CRITICAL_150';
  alertMessage?: string;
}

/**
 * AUTO-010: First-Contact SLA (24 Hours per THR-002 / TEST-044)
 * Triggers when new application is ingested in 'applied' status.
 */
export function evaluateFirstContactSla(
  applicationCreatedAt: string | Date,
  firstContactedAt?: string | Date | null,
  nowDate: Date = new Date()
): SlaTimerResult {
  const hoursAllowed = 24; // 24 business hours per THR-002
  const deadline = addMoroccoBusinessHours(applicationCreatedAt, hoursAllowed);
  const evaluationDate = firstContactedAt ? new Date(firstContactedAt) : nowDate;

  const hoursElapsed = calculateBusinessHoursBetween(applicationCreatedAt, evaluationDate);
  const isBreached = evaluationDate > deadline;

  let urgency: SlaTimerResult['urgency'] = 'NORMAL';
  if (isBreached) {
    urgency = hoursElapsed >= 36 ? 'CRITICAL_150' : 'BREACHED_100';
  } else if (hoursElapsed >= 19.2) {
    // 80% of 24h = 19.2h
    urgency = 'WARNING_80';
  }

  return {
    isBreached,
    hoursElapsed,
    hoursAllowed,
    deadlineIso: deadline.toISOString(),
    urgency,
    alertMessage: isBreached
      ? `SLA Breach AUTO-010 (TEST-044): First contact deadline exceeded (${hoursElapsed}h elapsed vs 24h allowed). Team Leader and VP notified.`
      : urgency === 'WARNING_80'
      ? `SLA Warning: 80% of first-contact window elapsed (${hoursElapsed}h/24h). Immediate outreach required.`
      : undefined,
  };
}

/**
 * AUTO-018: 14-Day Pre-Arrival Hard Lock (THR-010 / TEST-046)
 * Blocks ARRIVAL_CLEARED status unless:
 * 1. Bed allocation is confirmed
 * 2. EP flight ticket proof is uploaded
 * 3. Visa status is confirmed (or exempt)
 */
export function evaluatePreArrivalHardLock(params: {
  realizationStartDate: string; // ISO
  currentDateMs?: number;
  hasBedAllocated: boolean;
  hasFlightTicketVerified: boolean;
  isVisaCleared: boolean;
}): {
  isHardLockActive: boolean;
  isArrivalCleared: boolean;
  daysUntilArrival: number;
  missingItems: string[];
  blockerMessage?: string;
} {
  const nowMs = params.currentDateMs ?? Date.now();
  const arrivalMs = new Date(params.realizationStartDate).getTime();
  const daysUntilArrival = Math.floor((arrivalMs - nowMs) / (1000 * 60 * 60 * 24));

  // T-14 Day Hard Lock activates when days until arrival <= 14
  const isHardLockActive = daysUntilArrival <= 14;

  const missingItems: string[] = [];
  if (!params.hasBedAllocated) missingItems.push('Confirmed Bed Allocation (Standard #8)');
  if (!params.hasFlightTicketVerified) missingItems.push('Verified Inbound Flight Ticket (Standard #7)');
  if (!params.isVisaCleared) missingItems.push('Valid Entry Visa or Exemption Clearance (Standard #6)');

  const isArrivalCleared = missingItems.length === 0;

  return {
    isHardLockActive,
    isArrivalCleared,
    daysUntilArrival,
    missingItems,
    blockerMessage:
      isHardLockActive && !isArrivalCleared
        ? `Pre-Arrival Hard Lock AUTO-018 (TEST-046): At T-${daysUntilArrival} days before arrival, EP cannot be marked ARRIVAL_CLEARED due to missing statutory requirements: ${missingItems.join(', ')}.`
        : undefined,
  };
}

/**
 * AUTO-022: Unreachable EP Safety Protocol (48h Idle Check per THR-021 / TEST-047)
 * Triggered if an approved/realized EP has no verified contact for >48h.
 */
export function evaluateUnreachableEpSafetyProtocol(params: {
  lastContactTimestamp: string | Date;
  currentTimestampMs?: number;
}): {
  isCrisisEscalated: boolean;
  hoursUnreachable: number;
  escalationNotice?: string;
} {
  const nowMs = params.currentTimestampMs ?? Date.now();
  const lastContactMs = new Date(params.lastContactTimestamp).getTime();
  const diffMs = nowMs - lastContactMs;
  const hoursUnreachable = Math.floor(diffMs / (1000 * 60 * 60));

  // 48 hours threshold per THR-021
  const isCrisisEscalated = hoursUnreachable >= 48;

  return {
    isCrisisEscalated,
    hoursUnreachable,
    escalationNotice: isCrisisEscalated
      ? `CRITICAL SAFETY ALERT AUTO-022 (TEST-047): EP has been uncontactable for ${hoursUnreachable} hours (>48h statutory threshold). Crisis protocol engaged: LCP, MC VP, and Sending LC alerted immediately.`
      : undefined,
  };
}

/**
 * 14-Day Post-APD Visa & Expectation Pack SLA (AEPP 4.4.3.1)
 * Host LC must send the official stamped Visa Invitation Letter & Expectation Pack
 * within 14 calendar days of approval (APD).
 */
export function evaluatePostApdVisaPackSla(
  approvedAt?: string | null,
  heVisaPackSentAt?: string | null,
  nowMs: number = Date.now()
): {
  isBreached: boolean;
  daysRemaining: number;
  status: 'NOT_APPLICABLE' | 'COMPLETED' | 'IN_COUNTDOWN' | 'BREACHED';
  badgeLabel: string;
} {
  if (!approvedAt) {
    return {
      isBreached: false,
      daysRemaining: 14,
      status: 'NOT_APPLICABLE',
      badgeLabel: 'Pending Approval',
    };
  }

  if (heVisaPackSentAt) {
    return {
      isBreached: false,
      daysRemaining: 0,
      status: 'COMPLETED',
      badgeLabel: 'Visa Pack Delivered',
    };
  }

  const approvedMs = new Date(approvedAt).getTime();
  const deadlineMs = approvedMs + 14 * 24 * 60 * 60 * 1000;
  const diffDays = Math.ceil((deadlineMs - nowMs) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      isBreached: true,
      daysRemaining: diffDays,
      status: 'BREACHED',
      badgeLabel: `AEPP 4.4.3.1 Overdue (${Math.abs(diffDays)}d)`,
    };
  }

  return {
    isBreached: false,
    daysRemaining: diffDays,
    status: 'IN_COUNTDOWN',
    badgeLabel: `${diffDays}d Visa Pack Due`,
  };
}

/**
 * 3-Day Pre-Arrival Written Pickup Guide SLA (Exchange Standard #6)
 * Written directions, meeting point, and pickup buddy contact must be transmitted
 * at least 3 days before scheduled arrivalDate.
 */
export function evaluatePickupGuideSla(
  arrivalDate?: string | null,
  pickup3dGuideSentAt?: string | null,
  nowMs: number = Date.now()
): {
  isBreached: boolean;
  daysRemaining: number;
  status: 'PENDING_ARRIVAL_DATE' | 'COMPLETED' | 'IN_COUNTDOWN' | 'BREACHED';
  badgeLabel: string;
} {
  if (!arrivalDate) {
    return {
      isBreached: false,
      daysRemaining: 99,
      status: 'PENDING_ARRIVAL_DATE',
      badgeLabel: 'No Flight Date',
    };
  }

  if (pickup3dGuideSentAt) {
    return {
      isBreached: false,
      daysRemaining: 0,
      status: 'COMPLETED',
      badgeLabel: 'Standard #6 Cleared',
    };
  }

  const arrivalMs = new Date(arrivalDate).getTime();
  const deadlineMs = arrivalMs - 3 * 24 * 60 * 60 * 1000;
  const diffDays = Math.ceil((deadlineMs - nowMs) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      isBreached: true,
      daysRemaining: diffDays,
      status: 'BREACHED',
      badgeLabel: `Standard #6 Overdue (${Math.abs(diffDays)}d)`,
    };
  }

  return {
    isBreached: false,
    daysRemaining: diffDays,
    status: 'IN_COUNTDOWN',
    badgeLabel: `T-${diffDays}d Pickup Guide Due`,
  };
}

/**
 * Full EP SLA Rollup
 */
export function evaluateEpAllSla(ep: EPRecord, nowMs: number = Date.now()) {
  const visaPackSla = evaluatePostApdVisaPackSla(ep.approvedAt, ep.heVisaPackSentAt, nowMs);
  const pickupSla = evaluatePickupGuideSla(ep.arrivalDate || ep.start_date, ep.pickup3dGuideSentAt, nowMs);
  const safetySla = ep.lastContactAt
    ? evaluateUnreachableEpSafetyProtocol({ lastContactTimestamp: ep.lastContactAt, currentTimestampMs: nowMs })
    : { isCrisisEscalated: false, hoursUnreachable: 0 };

  return {
    visaPackSla,
    pickupSla,
    safetySla,
  };
}
