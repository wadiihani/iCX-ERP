/**
 * Remote Modality Engine (Partly Remote, Fully Remote, ICB Audit Gate & Remote Standards Catalog)
 * Statutory References: AEPP Section 4.4, ICB Global Remote Protocol, REQ-038, REQ-039, TEST-036, TEST-037
 * Jurisdiction: AIESEC in Rabat (LC Rabat, MC Morocco)
 */

import type {
  ExchangeModality,
  PartlyRemoteSchedule,
  FullyRemoteSchedule,
  RemoteStandardApplicability,
  RemoteOpportunityValidationResult,
} from '../types/remote-modalities';

export const PARTLY_REMOTE_MIN_TOTAL_WEEKS = 13;
export const PARTLY_REMOTE_MAX_REMOTE_SHARE_PERCENT = 50;
export const FULLY_REMOTE_MIN_WEEKS = 6;
export const FULLY_REMOTE_MAX_WEEKS = 26;

/**
 * 18 Exchange Standards Catalog (2024 Refresh) with Remote Applicability Metadata.
 */
export const REMOTE_STANDARDS_CATALOG: RemoteStandardApplicability[] = [
  { standardNumber: 1, title: 'Personal Goal Setting', category: 'PREPARATION', isMandatoryOnsite: true, isApplicableRemote: true, adaptationGuidance: 'Virtual 1-on-1 coaching session prior to start date.' },
  { standardNumber: 2, title: 'Expectation Setting', category: 'PREPARATION', isMandatoryOnsite: true, isApplicableRemote: true, adaptationGuidance: 'Virtual alignment on hours, time zone, and deliverables.' },
  { standardNumber: 3, title: 'Job Description', category: 'DEVELOPMENT', isMandatoryOnsite: true, isApplicableRemote: true, adaptationGuidance: 'Clear digital task roadmap and SLA deliverables.' },
  { standardNumber: 4, title: 'Working Hours', category: 'DEVELOPMENT', isMandatoryOnsite: true, isApplicableRemote: true, adaptationGuidance: 'Time tracking within agreed 35-45h Moroccan / home time window.' },
  { standardNumber: 5, title: 'First Day of Work', category: 'DEVELOPMENT', isMandatoryOnsite: true, isApplicableRemote: true, adaptationGuidance: 'Virtual team welcome and onboarding call.' },
  { standardNumber: 6, title: 'Individual Development Plan (IDP)', category: 'DEVELOPMENT', isMandatoryOnsite: true, isApplicableRemote: true, adaptationGuidance: 'Digital IDP maintained in cloud repository.' },
  { standardNumber: 7, title: 'Leadership Development Spaces (Lead)', category: 'DEVELOPMENT', isMandatoryOnsite: true, isApplicableRemote: true, adaptationGuidance: 'Virtual Lead sessions hosted by LC Rabat CXP.' },
  { standardNumber: 8, title: 'Airport Pickup', category: 'EXPERIENCE', isMandatoryOnsite: true, isApplicableRemote: false, adaptationGuidance: 'EXEMPTED for fully remote. Required during onsite phase of partly remote.' },
  { standardNumber: 9, title: 'Work Accompaniment (Day 1 Physical)', category: 'EXPERIENCE', isMandatoryOnsite: true, isApplicableRemote: false, adaptationGuidance: 'EXEMPTED for fully remote. Required on Day 1 of onsite arrival for partly remote.' },
  { standardNumber: 10, title: 'Visa and Work Permit', category: 'EXPERIENCE', isMandatoryOnsite: true, isApplicableRemote: false, adaptationGuidance: 'EXEMPTED for fully remote if EP remains in home country. Required for onsite.' },
  { standardNumber: 11, title: 'Accommodation', category: 'EXPERIENCE', isMandatoryOnsite: true, isApplicableRemote: false, adaptationGuidance: 'EXEMPTED for fully remote. Required in Rabat for onsite weeks.' },
  { standardNumber: 12, title: 'Basic Living Costs / Salary', category: 'EXPERIENCE', isMandatoryOnsite: true, isApplicableRemote: true, adaptationGuidance: 'Direct international wire or digital wallet transfer.' },
  { standardNumber: 13, title: 'Health Insurance', category: 'EXPERIENCE', isMandatoryOnsite: true, isApplicableRemote: true, adaptationGuidance: 'Coverage verified for digital worker.' },
  { standardNumber: 14, title: 'Regular Touchpoints', category: 'EXPERIENCE', isMandatoryOnsite: true, isApplicableRemote: true, adaptationGuidance: 'Bi-weekly video conference check-ins.' },
  { standardNumber: 15, title: 'Support on Grievances (Case Intake)', category: 'EXPERIENCE', isMandatoryOnsite: true, isApplicableRemote: true, adaptationGuidance: '24/7 digital intake via ERP portal.' },
  { standardNumber: 16, title: 'Departure Support', category: 'POST_EXPERIENCE', isMandatoryOnsite: true, isApplicableRemote: false, adaptationGuidance: 'EXEMPTED for fully remote. Required at end of onsite phase.' },
  { standardNumber: 17, title: 'Host Debrief', category: 'POST_EXPERIENCE', isMandatoryOnsite: true, isApplicableRemote: true, adaptationGuidance: 'Virtual exit review and Net Promoter Score survey.' },
  { standardNumber: 18, title: 'Home Debrief', category: 'POST_EXPERIENCE', isMandatoryOnsite: true, isApplicableRemote: true, adaptationGuidance: 'Virtual integration session with home committee.' },
];

/**
 * REQ-038 & TEST-036: Validates Partly Remote Opportunity.
 * Invariants: Min 13 weeks duration, Remote share <= 50%, Mandatory ICB Audit Reference.
 */
export function validatePartlyRemoteOpportunity(
  schedule: PartlyRemoteSchedule
): RemoteOpportunityValidationResult {
  const violations: string[] = [];

  // 1. Duration check (min 13 weeks)
  if (schedule.totalDurationWeeks < PARTLY_REMOTE_MIN_TOTAL_WEEKS) {
    violations.push(
      `Invalid Duration REQ-038 (TEST-036): Partly remote exchange total duration must be at least ${PARTLY_REMOTE_MIN_TOTAL_WEEKS} weeks. Provided: ${schedule.totalDurationWeeks} weeks.`
    );
  }

  // 2. Remote share calculation
  const calculatedRemotePercent = Number(
    ((schedule.remoteWeeks / schedule.totalDurationWeeks) * 100).toFixed(1)
  );

  if (calculatedRemotePercent > PARTLY_REMOTE_MAX_REMOTE_SHARE_PERCENT) {
    violations.push(
      `Excessive Remote Share REQ-038 (TEST-036): Remote share (${calculatedRemotePercent}%) exceeds the statutory ceiling of ${PARTLY_REMOTE_MAX_REMOTE_SHARE_PERCENT}%. At least 50% must be onsite in Morocco.`
    );
  }

  // 3. Mandatory ICB Audit Reference
  const isIcbValid = Boolean(
    schedule.icbAuditReference && schedule.icbAuditReference.trim().length >= 5
  );

  if (!isIcbValid) {
    violations.push(
      'Missing ICB Reference REQ-038 (TEST-036): Partly remote opportunities strictly require an official International Control Board (ICB) audit approval reference.'
    );
  }

  return {
    isValid: violations.length === 0,
    modality: 'PARTLY_REMOTE',
    totalWeeks: schedule.totalDurationWeeks,
    remotePercentage: calculatedRemotePercent,
    violations,
    applicableStandardsCount: 18, // All 18 apply across onsite and remote phases
    physicalStandardsExempted: 0,
    icbApprovalValid: isIcbValid,
  };
}

/**
 * REQ-039 & TEST-037: Validates Fully Remote Opportunity.
 * Invariants: Duration 6 to 26 weeks, automatically filters out physical standards.
 */
export function validateFullyRemoteOpportunity(
  schedule: FullyRemoteSchedule
): RemoteOpportunityValidationResult {
  const violations: string[] = [];

  // 1. Duration check (6 to 26 weeks)
  if (
    schedule.totalDurationWeeks < FULLY_REMOTE_MIN_WEEKS ||
    schedule.totalDurationWeeks > FULLY_REMOTE_MAX_WEEKS
  ) {
    violations.push(
      `Invalid Duration REQ-039 (TEST-037): Fully remote exchange duration must be between ${FULLY_REMOTE_MIN_WEEKS} and ${FULLY_REMOTE_MAX_WEEKS} weeks. Provided: ${schedule.totalDurationWeeks} weeks.`
    );
  }

  // 2. Virtual workspace check
  if (!schedule.virtualWorkspaceUrl || schedule.virtualWorkspaceUrl.trim().length === 0) {
    violations.push('Virtual workspace or corporate communication platform URL must be provisioned.');
  }

  const applicableStandards = REMOTE_STANDARDS_CATALOG.filter((s) => s.isApplicableRemote);
  const physicalExempted = REMOTE_STANDARDS_CATALOG.filter((s) => !s.isApplicableRemote);

  return {
    isValid: violations.length === 0,
    modality: 'FULLY_REMOTE',
    totalWeeks: schedule.totalDurationWeeks,
    remotePercentage: 100,
    violations,
    applicableStandardsCount: applicableStandards.length,
    physicalStandardsExempted: physicalExempted.length,
    icbApprovalValid: true, // Fully remote under standard catalog does not require custom ICB waiver
  };
}

/**
 * Returns filtered standards catalog adapted for the target modality.
 */
export function getApplicableStandards(modality: ExchangeModality): RemoteStandardApplicability[] {
  if (modality === 'FULLY_REMOTE') {
    return REMOTE_STANDARDS_CATALOG.filter((s) => s.isApplicableRemote);
  }
  return REMOTE_STANDARDS_CATALOG;
}
