/**
 * Domain Types for Touchpoints, Day-1 Accompaniment, Safety & Complaints
 * Baseline: REQ-069, REQ-070, REQ-071, REQ-075, AUTO-022, AUTO-023, TEST-066..068, TEST-071
 */

export type TouchpointType =
  | 'DAY1_ORIENTATION'
  | 'BIWEEKLY_TOUCHPOINT'
  | 'MONTHLY_TOUCHPOINT'
  | 'CRISIS_TOUCHPOINT'
  | 'EXIT_DEBRIEF';

export interface EpTouchpointRecord {
  id: string;
  applicationId: string;
  touchpointNumber: number;
  touchpointType: TouchpointType;
  scheduledDate: string; // YYYY-MM-DD
  completedAt: string | null; // ISO 8601
  conductedByUserId: string | null;
  epMoodScore: number | null; // 1 to 5
  hoursCompliance: boolean | null;
  notes?: string;
  escalatedToCase: boolean;
}

export interface Day1AccompanimentProof {
  applicationId: string;
  accompaniedByUserId: string;
  accompaniedByUserName: string;
  opportunityPartnerName: string;
  workplaceAddress: string;
  accompaniedAt: string; // ISO 8601
  proofDocumentId: string; // e.g. "doc-day1-photo-agdal-01"
  supervisorSignatureName: string;
  notes?: string;
}

export interface UnreachableEpStatus {
  applicationId: string;
  epName: string;
  lastContactAt: string; // ISO 8601
  businessHoursElapsed: number;
  isCrisisAlertActive: boolean;
  crisisAlertTriggeredAt?: string;
  crisisReportDeadlineIso?: string;
  isCrisisReportOverdue: boolean;
  alertNotice?: string;
}

export type ComplaintCategory =
  | 'ACCOMMODATION_SUBSTANDARD'
  | 'JD_HOURS_MISMATCH'
  | 'EP_UNREACHABLE_SAFETY'
  | 'HARASSMENT_VIOLENCE_ANNEX1'
  | 'GENERAL_COMPLAINT';

export interface ComplaintIntakeRecord {
  id: string;
  applicationId: string;
  complainantName: string;
  complainantRole: 'EP' | 'OP_PARTNER' | 'HOST_FAMILY';
  category: ComplaintCategory;
  description: string;
  intakeTimestamp: string; // ISO 8601
  ackDeadlineIso: string; // Exactly 24 Moroccan business hours from intake
  assignedOfficerUserId: string | null;
  acknowledgedAt: string | null;
  status: 'RECEIVED_PENDING_ACK' | 'ACKNOWLEDGED' | 'ESCALATED_TO_CASE';
  resolutionNotes?: string;
}
