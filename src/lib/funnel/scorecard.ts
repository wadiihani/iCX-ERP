/**
 * Screening & OP Interview Scorecard Rubric Engine
 * Baseline: REQ-045, THR-042, and TEST-042
 */

export interface InterviewScorecardMetrics {
  languageProficiency: number; // 0 to 100 (Weight: 30%)
  sdgMotivationAndAlignment: number; // 0 to 100 (Weight: 30%)
  availabilityAndCommitment: number; // 0 to 100 (Weight: 20%)
  culturalAdaptability: number; // 0 to 100 (Weight: 20%)
  interviewerId: string;
  interviewDate: string; // ISO
  notes?: string;
}

export interface ScorecardEvaluationResult {
  compositeScore: number; // 0 to 100
  passed: boolean; // Must be >= 70 per THR-042
  breakdown: {
    languageContribution: number;
    sdgContribution: number;
    availabilityContribution: number;
    culturalContribution: number;
  };
  recommendation: 'STRONG_ACCEPT' | 'ACCEPT' | 'REJECT';
}

/**
 * Computes composite score for Host LC Screening or OP Interview.
 * Weights:
 * - Language: 30%
 * - SDG Motivation: 30%
 * - Availability: 20%
 * - Cultural Adaptability: 20%
 */
export function evaluateScorecard(metrics: InterviewScorecardMetrics): ScorecardEvaluationResult {
  const languageContrib = Number((metrics.languageProficiency * 0.3).toFixed(1));
  const sdgContrib = Number((metrics.sdgMotivationAndAlignment * 0.3).toFixed(1));
  const availContrib = Number((metrics.availabilityAndCommitment * 0.2).toFixed(1));
  const culturalContrib = Number((metrics.culturalAdaptability * 0.2).toFixed(1));

  const compositeScore = Number(
    (languageContrib + sdgContrib + availContrib + culturalContrib).toFixed(1)
  );

  // Passing threshold: 70% per THR-042
  const passed = compositeScore >= 70;

  let recommendation: 'STRONG_ACCEPT' | 'ACCEPT' | 'REJECT' = 'REJECT';
  if (compositeScore >= 85) {
    recommendation = 'STRONG_ACCEPT';
  } else if (compositeScore >= 70) {
    recommendation = 'ACCEPT';
  }

  return {
    compositeScore,
    passed,
    breakdown: {
      languageContribution: languageContrib,
      sdgContribution: sdgContrib,
      availabilityContribution: availContrib,
      culturalContribution: culturalContrib,
    },
    recommendation,
  };
}
