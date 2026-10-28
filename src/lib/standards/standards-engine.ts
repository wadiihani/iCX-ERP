/**
 * 18 Exchange Standards Dual-Source Evidence Vault & Survey Chasing Engine
 * Baseline: REQ-066, REQ-067, REQ-068, REQ-072, TEST-063, TEST-064, TEST-065, TEST-069
 */

import { EXCHANGE_STANDARDS_CATALOG } from './standards-catalog';
import {
  HostStandardEvidence,
  EpSurveyResponse,
  StandardsMatrixRow,
  CoCalculationResult,
  CoQualificationStatus,
  SurveyChasingEvaluation,
} from '../types/standards';

/**
 * REQ-067 & TEST-064: Builds the 18-standard dual-source comparison matrix.
 * Strictly separates Host Internal Evidence from EP Survey Answers.
 * Flags discrepancies where Host claims delivered but EP claims unfulfilled.
 */
export function buildStandardsMatrix(
  applicationId: string,
  hostEvidenceList: HostStandardEvidence[],
  epResponsesList: EpSurveyResponse[]
): StandardsMatrixRow[] {
  return EXCHANGE_STANDARDS_CATALOG.map((definition) => {
    const hostEvidence = hostEvidenceList.find(
      (h) => h.applicationId === applicationId && h.standardNumber === definition.standardNumber
    );

    const epResponse = epResponsesList.find(
      (e) => e.applicationId === applicationId && e.standardNumber === definition.standardNumber
    );

    const isDeliveredByHost = hostEvidence?.internalStatus === 'DELIVERED_VERIFIED';
    const isConfirmedByEp = epResponse?.epResponse === 'YES_FULFILLED';

    // Discrepancy detection: Host claims delivered but EP claims unfulfilled (or vice versa)
    const hasDiscrepancy =
      Boolean(hostEvidence && epResponse) &&
      ((hostEvidence?.internalStatus === 'DELIVERED_VERIFIED' && epResponse?.epResponse === 'NO_UNFULFILLED') ||
        (hostEvidence?.internalStatus === 'BREACHED' && epResponse?.epResponse === 'YES_FULFILLED'));

    return {
      definition,
      hostEvidence,
      epResponse,
      hasDiscrepancy,
      isDeliveredByHost,
      isConfirmedByEp,
    };
  });
}

/**
 * REQ-068 & TEST-065: Advisory Complete Status (CO) Calculation Formula.
 * Statutory rule:
 * - 13 of 13 Mandatory standards must be delivered (100%).
 * - At least 3 of 5 Non-Mandatory standards must be delivered.
 * - Total score >= 16 / 18 delivered standards.
 */
export function calculateCoAdvisoryScore(matrix: StandardsMatrixRow[]): CoCalculationResult {
  let mandatoryDeliveredCount = 0;
  let nonMandatoryDeliveredCount = 0;
  const missingMandatoryStandards: number[] = [];
  const discrepantStandards: number[] = [];

  for (const row of matrix) {
    if (row.hasDiscrepancy) {
      discrepantStandards.push(row.definition.standardNumber);
    }

    // Delivery evaluated primarily on verified host evidence, supported by EP response
    const isDelivered = row.isDeliveredByHost;

    if (row.definition.isMandatory) {
      if (isDelivered) {
        mandatoryDeliveredCount++;
      } else {
        missingMandatoryStandards.push(row.definition.standardNumber);
      }
    } else {
      if (isDelivered) {
        nonMandatoryDeliveredCount++;
      }
    }
  }

  const totalDeliveredCount = mandatoryDeliveredCount + nonMandatoryDeliveredCount;
  const isCoQualified = mandatoryDeliveredCount === 13 && nonMandatoryDeliveredCount >= 3;

  let qualificationStatus: CoQualificationStatus;
  if (mandatoryDeliveredCount < 13) {
    qualificationStatus = 'DEFICIENT_MANDATORY_FAIL';
  } else if (nonMandatoryDeliveredCount < 3) {
    qualificationStatus = 'DEFICIENT_NON_MANDATORY_FAIL';
  } else {
    qualificationStatus = 'QUALIFIED_COMPLETE';
  }

  return {
    mandatoryDeliveredCount,
    mandatoryTotalCount: 13,
    nonMandatoryDeliveredCount,
    nonMandatoryTotalCount: 5,
    totalDeliveredCount,
    isCoQualified,
    qualificationStatus,
    missingMandatoryStandards,
    discrepantStandards,
    deliveryPercentage: Math.round((totalDeliveredCount / 18) * 100),
  };
}

/**
 * REQ-072, AUTO-021, AUTO-026 & TEST-069: Automated Middle & Final Survey Chaser.
 * Evaluates exchange timeline and schedules chasing actions:
 * - Middle Survey Chaser (AUTO-021): at midpoint of realization if unanswered.
 * - Final Survey Chaser (AUTO-026): at T-7, T-3, and T-0 departure day if unanswered.
 */
export function evaluateSurveyChasing(params: {
  applicationId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  middleSurveyAnswered: boolean;
  finalSurveyAnswered: boolean;
  currentDate?: Date;
}): SurveyChasingEvaluation {
  const current = params.currentDate ?? new Date();
  const startMs = new Date(params.startDate).getTime();
  const endMs = new Date(params.endDate).getTime();
  const currentMs = current.getTime();

  const totalDurationDays = Math.ceil((endMs - startMs) / (1000 * 60 * 60 * 24));
  const daysElapsed = Math.floor((currentMs - startMs) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.ceil((endMs - currentMs) / (1000 * 60 * 60 * 24));

  const midpointMs = startMs + (endMs - startMs) / 2;
  const isMidpointReached = currentMs >= midpointMs;

  const actionsDue: Array<
    | 'MIDDLE_SURVEY_CHASE'
    | 'FINAL_SURVEY_CHASE_T7'
    | 'FINAL_SURVEY_CHASE_T3'
    | 'FINAL_SURVEY_CHASE_T0'
  > = [];

  // AUTO-021: Middle Survey Chaser (at midpoint if unanswered)
  const isMiddleSurveyDue = isMidpointReached && !params.middleSurveyAnswered;
  if (isMiddleSurveyDue) {
    actionsDue.push('MIDDLE_SURVEY_CHASE');
  }

  // AUTO-026: Final Survey Chaser (T-7, T-3, T-0 if unanswered)
  const isFinalSurveyDue = daysRemaining <= 7 && !params.finalSurveyAnswered;
  if (isFinalSurveyDue) {
    if (daysRemaining <= 0) {
      actionsDue.push('FINAL_SURVEY_CHASE_T0');
    } else if (daysRemaining <= 3) {
      actionsDue.push('FINAL_SURVEY_CHASE_T3');
    } else if (daysRemaining <= 7) {
      actionsDue.push('FINAL_SURVEY_CHASE_T7');
    }
  }

  let alertMessage: string | undefined;
  if (actionsDue.length > 0) {
    alertMessage = `Survey Chasing Active (${actionsDue.join(', ')}): EP survey reminders scheduled for Application ${params.applicationId}.`;
  }

  return {
    applicationId: params.applicationId,
    totalDurationDays,
    daysElapsed,
    daysRemaining,
    isMidpointReached,
    isMiddleSurveyDue,
    isFinalSurveyDue,
    actionsDue,
    alertMessage,
  };
}
