/**
 * State Machine SM-04: EP Funnel & Readiness State Machine
 * Baseline: REQ-044, REQ-045, and TEST-042
 * Extended with APIP 5.3.5.1 (±20d realization gate), Standards #4-#9 delivery proof,
 * and Algorithmic Matchmaker Score.
 */

import { evaluateScorecard, type InterviewScorecardMetrics } from './scorecard';
import type { MinimisedPassportRecord } from './passport-validator';
import { resolveMoroccanVisaRegime } from '../ir/moroccan-visa-matrix';

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
  product?: 'iGV' | 'iGTa' | 'iGTe';
  slotStartDate?: string;
  stage: FunnelStage;
  screeningScorecard?: InterviewScorecardMetrics | null;
  opInterviewScorecard?: InterviewScorecardMetrics | null;
  passportRecord?: MinimisedPassportRecord | null;
  verifiedStandardsProofCount?: number; // Pre-arrival Standards #4-#9
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
  APPROVED: ['PRE_ARRIVAL_CLEAR', 'REALIZED', 'DROPPED'],
  PRE_ARRIVAL_CLEAR: ['REALIZED', 'DROPPED'],
  REALIZED: ['COMPLETED', 'DROPPED'],
  COMPLETED: [],
  DROPPED: ['APPLIED'], // Re-open dropped
};

/**
 * Validates the APIP 5.3.5.1 ±20 days rule for iGV realization start date.
 */
export function validateIgvRealizationDateWindow(
  realizedDateStr: string,
  slotStartDateStr: string
): { isValid: boolean; daysDifference: number; error?: string } {
  const realizedMs = new Date(realizedDateStr).getTime();
  const slotStartMs = new Date(slotStartDateStr).getTime();
  const diffDays = Math.round(Math.abs((realizedMs - slotStartMs) / (1000 * 60 * 60 * 24)));

  if (diffDays > 20) {
    return {
      isValid: false,
      daysDifference: diffDays,
      error: `APIP 5.3.5.1 Violation: For iGV, actual realization start date (${realizedDateStr}) differs by ${diffDays} days from slot start date (${slotStartDateStr}), exceeding the statutory ±20 days allowance.`,
    };
  }

  return { isValid: true, daysDifference: diffDays };
}

/**
 * Transitions an EP through SM-04 stages enforcing statutory gates.
 */
export function transitionEpStage(
  application: EpFunnelApplication,
  targetStage: FunnelStage,
  actorId: string,
  options?: {
    reason?: string;
    actualRealizedDate?: string;
    standardsDeliveredCount?: number;
  }
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

  // 4. Gate Check: Advancing to REALIZED requires:
  // - For iGV: ±20 days rule (APIP 5.3.5.1)
  // - Delivery of Pre-Arrival Standards #4 through #9
  if (targetStage === 'REALIZED') {
    if (application.product === 'iGV' && application.slotStartDate && options?.actualRealizedDate) {
      const windowCheck = validateIgvRealizationDateWindow(
        options.actualRealizedDate,
        application.slotStartDate
      );
      if (!windowCheck.isValid) {
        return {
          success: false,
          error: windowCheck.error,
        };
      }
    }

    const proofCount = options?.standardsDeliveredCount ?? application.verifiedStandardsProofCount ?? 0;
    // Standards #4, #5, #6, #7, #8, #9 = 6 statutory pre-arrival standards
    if (proofCount < 6) {
      return {
        success: false,
        error: `Realization Gate Block (CHG-29): Pre-arrival & Day-1 Exchange Standards (#4 Expectation, #5 Visa, #6 Pickup, #7 Housing, #8 IPS, #9 Day-1 OP Accompaniment) must be delivered and verified. Current delivered: ${proofCount}/6.`,
      };
    }
  }

  application.stage = targetStage;
  application.history.push({
    fromStage: currentStage,
    toStage: targetStage,
    timestamp: new Date().toISOString(),
    actorId,
    reason: options?.reason,
  });

  return {
    success: true,
    newStage: targetStage,
  };
}

/**
 * Algorithmic Matchmaker Score (CHG-31)
 * Computes:
 * - Visa Lead-Time Feasibility (30%)
 * - Language Match (25%)
 * - Field / SDG Match (25%)
 * - Date Overlap (20%)
 */
export function calculateMatchmakerScore(params: {
  nationalityCountry: string;
  residenceCountry?: string;
  hasSchengenPermit?: boolean;
  applicantLanguages?: string[];
  requiredLanguages?: string[];
  applicantFieldOrSkills?: string[];
  targetFieldOrSdg?: string;
  applicantAvailableFrom?: string;
  applicantAvailableTo?: string;
  slotStartDate?: string;
  slotEndDate?: string;
}): {
  matchScore: number; // 0..100
  tier: 'HIGH' | 'MEDIUM' | 'LOW';
  breakdown: {
    visaLeadScore: number;
    languageScore: number;
    skillMatchScore: number;
    dateOverlapScore: number;
  };
} {
  // 1. Visa Feasibility (30%)
  const visa = resolveMoroccanVisaRegime({
    nationalityCountry: params.nationalityCountry,
    residenceCountry: params.residenceCountry,
    hasSchengenOrUkOrUsPermit: params.hasSchengenPermit,
  });

  let visaScore = 100;
  if (params.slotStartDate) {
    const nowMs = Date.now();
    const slotStartMs = new Date(params.slotStartDate).getTime();
    const daysUntilStart = Math.max(0, Math.floor((slotStartMs - nowMs) / (1000 * 60 * 60 * 24)));

    if (daysUntilStart < visa.leadTimeDaysRequired) {
      visaScore = 20; // deficit
    } else if (daysUntilStart < visa.leadTimeDaysRequired + 10) {
      visaScore = 70;
    } else {
      visaScore = 100;
    }
  }

  // 2. Language Match (25%)
  let langScore = 80;
  if (params.requiredLanguages && params.requiredLanguages.length > 0) {
    const candidateLangs = (params.applicantLanguages || ['English']).map((l) => l.toLowerCase());
    const matched = params.requiredLanguages.filter((req) => candidateLangs.includes(req.toLowerCase()));
    langScore = Math.round((matched.length / params.requiredLanguages.length) * 100);
  }

  // 3. Skill / Field Match (25%)
  let skillScore = 75;
  if (params.applicantFieldOrSkills && params.targetFieldOrSdg) {
    const target = params.targetFieldOrSdg.toLowerCase();
    const hasMatch = params.applicantFieldOrSkills.some((s) => s.toLowerCase().includes(target) || target.includes(s.toLowerCase()));
    skillScore = hasMatch ? 95 : 60;
  }

  // 4. Date Overlap (20%)
  let dateScore = 85;
  if (params.applicantAvailableFrom && params.slotStartDate) {
    const availMs = new Date(params.applicantAvailableFrom).getTime();
    const startMs = new Date(params.slotStartDate).getTime();
    dateScore = availMs <= startMs ? 100 : 50;
  }

  // Composite Weighted Calculation
  const composite = Math.round(
    visaScore * 0.30 +
    langScore * 0.25 +
    skillScore * 0.25 +
    dateScore * 0.20
  );

  const tier = composite >= 80 ? 'HIGH' : composite >= 60 ? 'MEDIUM' : 'LOW';

  return {
    matchScore: composite,
    tier,
    breakdown: {
      visaLeadScore: visaScore,
      languageScore: langScore,
      skillMatchScore: skillScore,
      dateOverlapScore: dateScore,
    },
  };
}
