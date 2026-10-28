/**
 * Statutory Partner Discovery Questionnaire Model
 * Baseline: REQ-015, TEST-021, and TEST-022
 */

export interface DiscoveryQuestionnaireAnswers {
  sdgGoal: number; // 1 to 17
  weeklyWorkingHours: number; // 25 to 40
  durationWeeks: number; // 6 to 8 weeks for iGV
  hasSupervisorAssigned: boolean;
  supervisorName?: string;
  supervisorEmail?: string;
  supervisorPhone?: string;
  accommodationConfirmed: boolean;
  fundingCommitmentPercentage: number; // >= 70%
  discoveryNotes?: string;
  completedAt: string;
  completedBy: string;
}

export interface DiscoveryValidationResult {
  isComplete: boolean;
  missingFields: string[];
  statutoryViolations: string[];
}

/**
 * Validates whether the discovery questionnaire answers satisfy all statutory iGV gates.
 */
export function validateDiscoveryAnswers(
  answers?: Partial<DiscoveryQuestionnaireAnswers> | null
): DiscoveryValidationResult {
  if (!answers) {
    return {
      isComplete: false,
      missingFields: ['All discovery questionnaire answers are missing.'],
      statutoryViolations: ['Discovery questionnaire must be executed before sending proposal.'],
    };
  }

  const missingFields: string[] = [];
  const statutoryViolations: string[] = [];

  // 1. SDG Target Check (1-17)
  if (!answers.sdgGoal || answers.sdgGoal < 1 || answers.sdgGoal > 17) {
    missingFields.push('sdgGoal');
    statutoryViolations.push('A valid UN Sustainable Development Goal (1-17) must be targeted.');
  }

  // 2. Working Hours (Statutory: 25h to 40h per week for iGV per Exchange Standards 2024)
  if (answers.weeklyWorkingHours === undefined || answers.weeklyWorkingHours === null) {
    missingFields.push('weeklyWorkingHours');
  } else if (answers.weeklyWorkingHours < 25 || answers.weeklyWorkingHours > 40) {
    statutoryViolations.push(
      `Weekly working hours must be between 25 and 40 hours per AIESEC Exchange Standards. Provided: ${answers.weeklyWorkingHours}h.`
    );
  }

  // 3. Duration Weeks (6 to 8 weeks for iGV)
  if (answers.durationWeeks === undefined || answers.durationWeeks === null) {
    missingFields.push('durationWeeks');
  } else if (answers.durationWeeks < 6 || answers.durationWeeks > 8) {
    statutoryViolations.push(
      `iGV project duration must be between 6 and 8 weeks. Provided: ${answers.durationWeeks} weeks.`
    );
  }

  // 4. Dedicated Supervisor
  if (!answers.hasSupervisorAssigned || !answers.supervisorName?.trim()) {
    missingFields.push('supervisorName');
    statutoryViolations.push('Partner must confirm a dedicated project supervisor / mentor.');
  }

  // 5. Accommodation Confirmation
  if (answers.accommodationConfirmed !== true) {
    missingFields.push('accommodationConfirmed');
    statutoryViolations.push('Partner must confirm accommodation arrangement or provide EP housing support.');
  }

  // 6. Funding / Fee Commitment (>= 70%)
  if (
    answers.fundingCommitmentPercentage === undefined ||
    answers.fundingCommitmentPercentage === null
  ) {
    missingFields.push('fundingCommitmentPercentage');
  } else if (answers.fundingCommitmentPercentage < 70) {
    statutoryViolations.push(
      `Partner funding commitment must be at least 70% of the project budget. Provided: ${answers.fundingCommitmentPercentage}%.`
    );
  }

  const isComplete = missingFields.length === 0 && statutoryViolations.length === 0;

  return {
    isComplete,
    missingFields,
    statutoryViolations,
  };
}
