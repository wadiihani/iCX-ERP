/**
 * State Machine SM-04: EP Funnel & Readiness State Machine
 * Baseline: REQ-044, REQ-045, and TEST-042
 */

import { evaluateScorecard, type InterviewScorecardMetrics } from './scorecard';
import type { MinimisedPassportRecord } from './passport-validator';

export type FunnelStage =
  | 'APPLIED'
  | 'SCREENED'
  | 'OP_INTERVIEW_SCHEDULED'
  | 'OP_INTERVIEWED'
  | 'ACCEPTED'
  | 'APPROVED'
  | 'PRE_ARRIVAL_CLEAR'
  | 'REALIZED'
  | 'COMPLETED'
  | 'DROPPED';

export interface EpFunnelApplication {
  id: string;
  lcId: string;
  opportunityId: string;
  expaApplicationId?: string | null;
  epName: string;
  epEmail: string;
  homeCountry: string;
  stage: FunnelStage;
  screeningScorecard?: InterviewScorecardMetrics | null;
  opInterviewScorecard?: InterviewScorecardMetrics | null;
  passportRecord?: MinimisedPassportRecord | null;
  history: Array<{
    fromStage: FunnelStage;
    toStage: FunnelStage;
    timestamp: string;
    actorId: string;
    reason?: string;
  }>;
}

const ALLOWED_FUNNEL_TRANSITIONS: Record<FunnelStage, FunnelStage[]> = {
  APPLIED: ['SCREENED', 'DROPPED'],
  SCREENED: ['OP_INTERVIEW_SCHEDULED', 'DROPPED'],
  OP_INTERVIEW_SCHEDULED: ['OP_INTERVIEWED', 'DROPPED'],
  OP_INTERVIEWED: ['ACCEPTED', 'DROPPED'],
  ACCEPTED: ['APPROVED', 'DROPPED'],
  APPROVED: ['PRE_ARRIVAL_CLEAR', 'DROPPED'],
  PRE_ARRIVAL_CLEAR: ['REALIZED', 'DROPPED'],
  REALIZED: ['COMPLETED', 'DROPPED'],
  COMPLETED: [],
  DROPPED: ['APPLIED'], // Re-open dropped
};

/**
 * Transitions an EP through SM-04 stages enforcing interview scorecards gate.
 */
export function transitionEpStage(
  application: EpFunnelApplication,
  targetStage: FunnelStage,
  actorId: string,
  reason?: string
): { success: boolean; newStage?: FunnelStage; error?: string } {
  const currentStage = application.stage;
  const allowed = ALLOWED_FUNNEL_TRANSITIONS[currentStage] || [];

  // 1. Stage sequence check
  if (!allowed.includes(targetStage)) {
    return {
      success: false,
      error: `Invalid transition: cannot advance EP from ${currentStage} directly to ${targetStage}. Stage sequence must be respected.`,
    };
  }

  // 2. Gate Check: Advancing to ACCEPTED requires passing both Screening and OP Interview scorecards (TEST-042)
  if (targetStage === 'ACCEPTED') {
    if (!application.screeningScorecard) {
      return {
        success: false,
        error: `Screening Gate Block (TEST-042): Host LC Screening scorecard is missing. Applicant must be screened before acceptance.`,
      };
    }
    const screeningEval = evaluateScorecard(application.screeningScorecard);
    if (!screeningEval.passed) {
      return {
        success: false,
        error: `Screening Gate Block (TEST-042): Host LC Screening score (${screeningEval.compositeScore}%) did not meet the 70% statutory passing threshold.`,
      };
    }

    if (!application.opInterviewScorecard) {
      return {
        success: false,
        error: `OP Interview Gate Block (TEST-042): Opportunity Provider (OP) interview scorecard is missing. Partner must interview and endorse applicant.`,
      };
    }
    const opEval = evaluateScorecard(application.opInterviewScorecard);
    if (!opEval.passed) {
      return {
        success: false,
        error: `OP Interview Gate Block (TEST-042): Opportunity Provider interview score (${opEval.compositeScore}%) did not meet the 70% statutory passing threshold.`,
      };
    }
  }

  // 3. Gate Check: Advancing to APPROVED requires valid passport
  if (targetStage === 'APPROVED') {
    if (!application.passportRecord || !application.passportRecord.isValidForEntry) {
      return {
        success: false,
        error: `Passport Gate Block (DEC-010): Applicant does not possess a verified passport with at least 6 months validity beyond project completion.`,
      };
    }
  }

  application.stage = targetStage;
  application.history.push({
    fromStage: currentStage,
    toStage: targetStage,
    timestamp: new Date().toISOString(),
    actorId,
    reason,
  });

  return {
    success: true,
    newStage: targetStage,
  };
}
