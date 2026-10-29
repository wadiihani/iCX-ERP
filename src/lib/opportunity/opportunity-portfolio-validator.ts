/**
 * Comprehensive Opportunity Portfolio & Statutory Product Validator
 * Implements AIESEC Hub Requirements:
 * - HUB-OPP-01: Relational Contract -> Opp -> Multi-Slot Waves
 * - HUB-OPP-02: 16 Official iGV Projects & SDG Evidence
 * - HUB-OPP-03: iGTa 6 Functional Fields & iGTe Teaching Requirements
 * - HUB-OPP-04: Modality & ICB Audit Gate + Post-Approval Benefit Locking (AEPP 4.2.1.4)
 */

export interface OpportunityPortfolioInput {
  title: string;
  product: 'igv' | 'igt' | 'igte';
  organizationId: string;
  contractId?: string;
  durationWeeks: number;
  weeklyWorkingHours: number;
  totalOpenings: number;
  modality: 'PHYSICAL' | 'PARTLY_REMOTE' | 'FULLY_REMOTE';
  remoteWeeks?: number;
  icbAuditUrl?: string;

  // iGV Specifics
  portfolioProject?: string;
  primarySdg?: number;
  secondarySdgs?: number[];
  targetBeneficiaries?: string;
  plannedActivities?: string[];
  expectedOutputs?: string;
  fundingPercentage?: number;

  // iGTa / iGTe Specifics
  monthlySalaryMad?: number;
  epFeeMad?: number;
  professionalField?: string;
  teachingSubject?: string;
  teachingLevel?: string;
  curriculumOutline?: string;
  supervisorContactId?: string;
  supervisorName?: string;
  supervisorTitle?: string;

  // Benefit locking check
  approvedCount?: number;
  isBenefitsLocked?: boolean;
  variationAddendumUrl?: string;
}

export interface OpportunityValidationOutput {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  benefitsLockedNotice?: string;
}

export const STATUTORY_MOROCCAN_MIN_SALARY_MAD = 3500;

export function validateOpportunityPortfolio(
  input: OpportunityPortfolioInput
): OpportunityValidationOutput {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. General validations
  if (!input.title || input.title.trim().length < 5) {
    errors.push('Title must be at least 5 characters.');
  }

  if (!input.organizationId) {
    errors.push('Host Partner Organization is required.');
  }

  if (!input.totalOpenings || input.totalOpenings < 1) {
    errors.push('Total openings must be at least 1.');
  }

  // 2. Modality Gate
  if (input.modality === 'PARTLY_REMOTE') {
    if (input.durationWeeks < 13) {
      errors.push(
        `Partly-remote exchanges must be at least 13 weeks total per APIP. Current: ${input.durationWeeks} weeks.`
      );
    }
    const remote = input.remoteWeeks || 0;
    if (remote <= 0) {
      errors.push('Partly-remote opportunity must specify at least 1 remote week.');
    } else if (remote > input.durationWeeks * 0.5) {
      errors.push(
        `Partly-remote exchange remote duration (${remote} weeks) cannot exceed 50% of total duration (${input.durationWeeks} weeks).`
      );
    }
    if (!input.icbAuditUrl || !input.icbAuditUrl.trim()) {
      errors.push('Partly-remote opportunity requires an approved ICB Audit Form URL or reference code.');
    }
  }

  // 3. Product Specific Statutory Rules
  if (input.product === 'igv') {
    // Duration: 6 to 8 weeks
    if (input.durationWeeks < 6 || input.durationWeeks > 8) {
      errors.push(`iGV duration must be strictly 6 to 8 weeks per AEPP. Provided: ${input.durationWeeks} weeks.`);
    }

    // Working hours: 25 to 40 hours
    if (input.weeklyWorkingHours < 25 || input.weeklyWorkingHours > 40) {
      errors.push(
        `iGV working hours must be between 25 and 40 hours/week. Provided: ${input.weeklyWorkingHours} hours.`
      );
    }

    // Salary: STRICTLY 0 MAD
    if (input.monthlySalaryMad !== undefined && input.monthlySalaryMad > 0) {
      errors.push('iGV opportunities cannot offer a monetary salary (must be 0 MAD). Volunteering is unpaid.');
    }

    // Primary SDG
    if (!input.primarySdg || input.primarySdg < 1 || input.primarySdg > 17) {
      errors.push('iGV opportunity must have a designated UN Primary SDG (1 to 17).');
    }

    // Project Name & Beneficiaries
    if (!input.portfolioProject || !input.portfolioProject.trim()) {
      errors.push('iGV opportunity must be linked to an official portfolio project.');
    }

    if (!input.targetBeneficiaries || !input.targetBeneficiaries.trim()) {
      errors.push('Target beneficiaries must be specified for iGV impact tracking.');
    }

    if (!input.expectedOutputs || !input.expectedOutputs.trim()) {
      errors.push('Intended project outputs and deliverable indicators must be documented.');
    }
  } else if (input.product === 'igt') {
    // iGTa (Global Talent)
    // Duration: 6 to 78 weeks
    if (input.durationWeeks < 6 || input.durationWeeks > 78) {
      errors.push(`iGTa duration must be between 6 and 78 weeks. Provided: ${input.durationWeeks} weeks.`);
    }

    // Working hours: 35 to 45 hours
    if (input.weeklyWorkingHours < 35 || input.weeklyWorkingHours > 45) {
      errors.push(`iGTa working hours must be between 35 and 45 hours/week. Provided: ${input.weeklyWorkingHours}h.`);
    }

    // Salary: >= 3500 MAD
    const salary = input.monthlySalaryMad ?? 0;
    if (salary < STATUTORY_MOROCCAN_MIN_SALARY_MAD) {
      errors.push(
        `Statutory Floor Violation: iGTa monthly salary (${salary} MAD) must be at least ${STATUTORY_MOROCCAN_MIN_SALARY_MAD} MAD.`
      );
    }

    // EP Fee: STRICTLY 0 MAD per APIP 5.2.3.1.4
    if (input.epFeeMad !== undefined && input.epFeeMad > 0) {
      errors.push('Zero EP Fee Policy Violation (APIP 5.2.3.1.4): Host cannot charge any fee to the EP.');
    }

    // Functional field
    if (!input.professionalField) {
      errors.push('iGTa must designate one of the 6 official functional fields.');
    }

    // Supervisor check
    if (!input.supervisorTitle && !input.supervisorName && !input.supervisorContactId) {
      errors.push('iGTa opportunity must designate a workplace technical supervisor.');
    }
  } else if (input.product === 'igte') {
    // iGTe (Global Teacher)
    // Duration: 9 to 78 weeks
    if (input.durationWeeks < 9 || input.durationWeeks > 78) {
      errors.push(`iGTe teaching duration must be between 9 and 78 weeks. Provided: ${input.durationWeeks} weeks.`);
    }

    // Working hours: 35 to 45 hours
    if (input.weeklyWorkingHours < 35 || input.weeklyWorkingHours > 45) {
      errors.push(`iGTe working hours must be between 35 and 45 hours/week. Provided: ${input.weeklyWorkingHours}h.`);
    }

    // Salary: >= 3500 MAD
    const salary = input.monthlySalaryMad ?? 0;
    if (salary < STATUTORY_MOROCCAN_MIN_SALARY_MAD) {
      errors.push(
        `Statutory Floor Violation: iGTe monthly salary (${salary} MAD) must be at least ${STATUTORY_MOROCCAN_MIN_SALARY_MAD} MAD.`
      );
    }

    // EP Fee: STRICTLY 0 MAD
    if (input.epFeeMad !== undefined && input.epFeeMad > 0) {
      errors.push('Zero EP Fee Policy Violation (APIP 5.2.3.1.4): Educational institution cannot charge fees to EP.');
    }

    // Teaching deliverables & level
    if (!input.teachingSubject) {
      errors.push('iGTe opportunity must specify an academic subject.');
    }

    if (!input.teachingLevel) {
      errors.push('iGTe opportunity must specify the target student learner level.');
    }

    if (!input.curriculumOutline || input.curriculumOutline.trim().length < 10) {
      errors.push('iGTe requires a curriculum outline (at least 10 characters).');
    }

    // Supervisor
    if (!input.supervisorTitle && !input.supervisorName && !input.supervisorContactId) {
      errors.push('iGTe opportunity requires a designated pedagogical supervisor / department head.');
    }
  }

  // 4. Post-Approval Benefit Locking (AEPP 4.2.1.4)
  let benefitsLockedNotice: string | undefined;
  if ((input.approvedCount && input.approvedCount >= 1) || input.isBenefitsLocked) {
    benefitsLockedNotice =
      'AEPP 4.2.1.4 Benefit Lock Active: This opportunity has approved EPs. Salary, working hours, and benefits cannot be altered without a mutual Variation Addendum.';
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    benefitsLockedNotice,
  };
}
