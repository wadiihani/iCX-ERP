/**
 * Touchpoint Generator, Day-1 Accompaniment Gatekeeper, Safety Radar & Complaint Intake Engine
 * Baseline: REQ-069, REQ-070, REQ-071, REQ-075, AUTO-022, AUTO-023, TEST-066, TEST-067, TEST-068, TEST-071
 */

import {
  EpTouchpointRecord,
  Day1AccompanimentProof,
  UnreachableEpStatus,
  ComplaintIntakeRecord,
  ComplaintCategory,
} from '../types/touchpoints-and-care';
import {
  calculateBusinessHoursBetween,
  addMoroccoBusinessHours,
} from '../sla/morocco-calendar';

/**
 * REQ-069, AUTO-022 & TEST-066: Generates regular touchpoint cadence for Standard #17.
 * - iGV (Global Volunteer): Bi-weekly cadence (every 14 days, e.g. Day 14, 28, 42).
 * - iGTa / iGTe (Global Talent): Monthly cadence (every 30 days, e.g. Day 30, 60, 90).
 */
export function generateTouchpointSchedule(
  applicationId: string,
  product: 'iGV' | 'iGTa' | 'iGTe',
  startDateStr: string,
  durationWeeks: number
): EpTouchpointRecord[] {
  const startMs = new Date(startDateStr).getTime();
  const schedule: EpTouchpointRecord[] = [];

  const intervalDays = product === 'iGV' ? 14 : 30;
  const totalDays = durationWeeks * 7;
  const touchpointCount = Math.floor(totalDays / intervalDays);

  for (let i = 1; i <= touchpointCount; i++) {
    const touchpointDateMs = startMs + i * intervalDays * 24 * 60 * 60 * 1000;
    const scheduledDate = new Date(touchpointDateMs).toISOString().split('T')[0];

    schedule.push({
      id: `touchpoint_${applicationId}_${i}`,
      applicationId,
      touchpointNumber: i,
      touchpointType: product === 'iGV' ? 'BIWEEKLY_TOUCHPOINT' : 'MONTHLY_TOUCHPOINT',
      scheduledDate,
      completedAt: null,
      conductedByUserId: null,
      epMoodScore: null,
      hoursCompliance: null,
      notes: undefined,
      escalatedToCase: false,
    });
  }

  return schedule;
}

/**
 * Logs touchpoint completion, capturing volunteer mood score (1–5) and hours compliance.
 * Automatically flags for case escalation if mood score <= 2.
 */
export function logTouchpointCompletion(
  touchpoint: EpTouchpointRecord,
  params: {
    conductedByUserId: string;
    epMoodScore: number;
    hoursCompliance: boolean;
    notes: string;
    completedAt?: Date;
  }
): EpTouchpointRecord {
  if (params.epMoodScore < 1 || params.epMoodScore > 5) {
    throw new Error('Invalid mood score: must be an integer between 1 and 5.');
  }

  const completedAtIso = (params.completedAt ?? new Date()).toISOString();
  const escalatedToCase = params.epMoodScore <= 2 || !params.hoursCompliance;

  return {
    ...touchpoint,
    conductedByUserId: params.conductedByUserId,
    epMoodScore: params.epMoodScore,
    hoursCompliance: params.hoursCompliance,
    notes: params.notes,
    completedAt: completedAtIso,
    escalatedToCase,
  };
}

/**
 * REQ-071 & TEST-068: Day-1 Work Accompaniment Gatekeeper (Standard #9).
 * Realization gatekeeper: strictly blocks transition to DAY1_DONE / REALIZED_ACTIVE
 * unless verified host accompaniment proof is uploaded.
 */
export function validateDay1AccompanimentProof(
  proof: Partial<Day1AccompanimentProof>
): { isValid: boolean; verifiedStatus?: string; error?: string } {
  if (
    !proof.accompaniedByUserId ||
    !proof.accompaniedAt ||
    !proof.proofDocumentId ||
    !proof.supervisorSignatureName
  ) {
    return {
      isValid: false,
      error:
        'Statutory Violation REQ-071 (TEST-068): Transition to DAY1_DONE rejected. Mandatory Day-1 work accompaniment proof requires host representative ID, arrival timestamp, workplace check-in evidence document, and supervisor signature.',
    };
  }

  return {
    isValid: true,
    verifiedStatus: 'DAY1_DONE',
  };
}

/**
 * REQ-070, AUTO-023 & TEST-067: 2-Working-Day Unreachable EP Safety Protocol.
 * Evaluates business hours elapsed in Africa/Casablanca timezone:
 * - >= 48 business hours (2 working days): Triggers Critical Safety Alert AUTO-023.
 * - Starts 24-hour crisis reporting countdown for executive team (LCP, MC VP, Sending LC).
 * - >= 72 business hours (48h + 24h): Flags crisis report as overdue.
 */
export function evaluateUnreachableEpProtocol(params: {
  applicationId: string;
  epName: string;
  lastContactAt: string; // ISO 8601
  currentDate?: Date;
}): UnreachableEpStatus {
  const current = params.currentDate ?? new Date();
  const lastContactDate = new Date(params.lastContactAt);

  const businessHoursElapsed = calculateBusinessHoursBetween(lastContactDate, current);
  const isCrisisAlertActive = businessHoursElapsed >= 48;

  let crisisAlertTriggeredAt: string | undefined;
  let crisisReportDeadlineIso: string | undefined;
  let isCrisisReportOverdue = false;
  let alertNotice: string | undefined;

  if (isCrisisAlertActive) {
    // Alert triggered at exactly 48 business hours
    const alertDate = addMoroccoBusinessHours(lastContactDate, 48);
    crisisAlertTriggeredAt = alertDate.toISOString();

    // Crisis report deadline is 24 business hours following the 48h alert
    const deadlineDate = addMoroccoBusinessHours(alertDate, 24);
    crisisReportDeadlineIso = deadlineDate.toISOString();

    isCrisisReportOverdue = businessHoursElapsed >= 72;

    alertNotice = `CRITICAL SAFETY ALERT AUTO-023 (TEST-067): Volunteer "${
      params.epName
    }" has been uncontactable for ${businessHoursElapsed} business hours (>48h). 24h crisis report timer engaged for LCP, MC VP, and Sending LC.`;
  }

  return {
    applicationId: params.applicationId,
    epName: params.epName,
    lastContactAt: params.lastContactAt,
    businessHoursElapsed,
    isCrisisAlertActive,
    crisisAlertTriggeredAt,
    crisisReportDeadlineIso,
    isCrisisReportOverdue,
    alertNotice,
  };
}

/**
 * REQ-075 & TEST-071: Documented EP Complaint Intake Channel.
 * Enforces 1-working-day (24 Moroccan business hours) acknowledgment SLA timer.
 */
export function createComplaintIntake(params: {
  id?: string;
  applicationId: string;
  complainantName: string;
  complainantRole: 'EP' | 'OP_PARTNER' | 'HOST_FAMILY';
  category: ComplaintCategory;
  description: string;
  intakeDate?: Date;
}): ComplaintIntakeRecord {
  const intakeDate = params.intakeDate ?? new Date();
  const ackDeadline = addMoroccoBusinessHours(intakeDate, 24); // Exactly 1 working day (24 business hours)

  return {
    id: params.id || `complaint_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    applicationId: params.applicationId,
    complainantName: params.complainantName,
    complainantRole: params.complainantRole,
    category: params.category,
    description: params.description,
    intakeTimestamp: intakeDate.toISOString(),
    ackDeadlineIso: ackDeadline.toISOString(),
    assignedOfficerUserId: null,
    acknowledgedAt: null,
    status: 'RECEIVED_PENDING_ACK',
  };
}

/**
 * Acknowledges complaint within 1 working day and assigns responsible officer.
 */
export function acknowledgeComplaint(
  complaint: ComplaintIntakeRecord,
  assignedOfficerUserId: string,
  ackDate: Date = new Date(),
  resolutionNotes?: string
): { complaint: ComplaintIntakeRecord; isWithinSla: boolean } {
  const ackMs = ackDate.getTime();
  const deadlineMs = new Date(complaint.ackDeadlineIso).getTime();
  const isWithinSla = ackMs <= deadlineMs;

  const updatedComplaint: ComplaintIntakeRecord = {
    ...complaint,
    assignedOfficerUserId,
    acknowledgedAt: ackDate.toISOString(),
    status: 'ACKNOWLEDGED',
    resolutionNotes,
  };

  return {
    complaint: updatedComplaint,
    isWithinSla,
  };
}
