/**
 * Statutory Opportunity Validation Engine
 * Baseline: REQ-022, Section 4.2 Opportunity Schema, and TEST-025
 */

export interface OpportunityInput {
  title: string;
  product: 'igv' | 'igt' | 'igte';
  subProduct?: string | null;
  sdgTarget?: number | null;
  durationWeeks: number;
  weeklyWorkingHours: number;
  fundingPercentage: number;
  totalOpenings: number;
  startDate: string; // ISO date
  endDate: string; // ISO date
}

export interface OpportunityValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validates an iGV opportunity against statutory requirements:
 * - Duration: strictly 6 to 8 weeks
 * - Weekly working hours: strictly 25 to 40 hours
 * - Funding coverage: at least 70%
 * - SDG target: 1 to 17
 * - Openings: at least 1 opening
 */
export function validateOpportunity(input: OpportunityInput): OpportunityValidationResult {
  const errors: string[] = [];

  // Title check
  if (!input.title || input.title.trim().length < 5) {
    errors.push('Opportunity title is required and must be at least 5 characters.');
  }

  // Duration check (iGV statutory: 6 to 8 weeks)
  if (input.product === 'igv') {
    if (input.durationWeeks < 6 || input.durationWeeks > 8) {
      errors.push(
        `Statutory Violation (TEST-025): iGV opportunity duration must be between 6 and 8 weeks. Provided: ${input.durationWeeks} weeks.`
      );
    }

    // Weekly working hours (statutory: 25h to 40h)
    if (input.weeklyWorkingHours < 25 || input.weeklyWorkingHours > 40) {
      errors.push(
        `Statutory Violation (TEST-025): iGV weekly working hours must be between 25 and 40 hours per Exchange Standards. Provided: ${input.weeklyWorkingHours}h.`
      );
    }

    // Funding / Partner fee commitment (statutory: >= 70%)
    if (input.fundingPercentage < 70) {
      errors.push(
        `Statutory Violation (TEST-025): Partner funding commitment must be at least 70% of project budget. Provided: ${input.fundingPercentage}%.`
      );
    }

    // SDG Target check
    if (!input.sdgTarget || input.sdgTarget < 1 || input.sdgTarget > 17) {
      errors.push('iGV opportunities must specify a valid UN Sustainable Development Goal (1 to 17).');
    }
  }

  // Openings check
  if (!input.totalOpenings || input.totalOpenings < 1) {
    errors.push('Total openings must be at least 1.');
  }

  // Dates check
  if (input.startDate && input.endDate) {
    const start = new Date(input.startDate).getTime();
    const end = new Date(input.endDate).getTime();
    if (end <= start) {
      errors.push('End date must be strictly after start date.');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
