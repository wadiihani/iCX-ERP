/**
 * Professional Exchange Engine (iGTa, iGTe, Salary Floors & Zero EP Fee Invariant)
 * Statutory References: AEPP Section 4, Moroccan Labor Code (SMIG), AFPM, REQ-036, REQ-037, REQ-085, TEST-034, TEST-035, TEST-081
 * Jurisdiction: AIESEC in Rabat (LC Rabat, MC Morocco)
 */

import type {
  ProductTrack,
  IGTaOpportunityPayload,
  IGTeOpportunityPayload,
  ProfessionalValidationResult,
  IGTaProfessionalField,
  IGTeAcademicSubject,
} from '../types/professional-exchange';

export const STATUTORY_MOROCCAN_MIN_SALARY_MAD = 3500;
export const IGTA_MIN_WEEKS = 6;
export const IGTA_MAX_WEEKS = 78;
export const IGTE_MIN_WEEKS = 9;
export const IGTE_MAX_WEEKS = 78;
export const MIN_WEEKLY_HOURS = 35;
export const MAX_WEEKLY_HOURS = 45;

export const VALID_IGTA_FIELDS: IGTaProfessionalField[] = [
  'SOFTWARE_ENGINEERING',
  'DATA_ANALYTICS',
  'BUSINESS_DEVELOPMENT',
  'MARKETING_AND_COMMUNICATION',
  'FINANCE_ACCOUNTING',
  'ENGINEERING',
  'HUMAN_RESOURCES',
  'GRAPHIC_DESIGN',
];

export const VALID_IGTE_SUBJECTS: IGTeAcademicSubject[] = [
  'ENGLISH_LANGUAGE',
  'FRENCH_LANGUAGE',
  'SPANISH_LANGUAGE',
  'STEM_EDUCATION',
  'PRIMARY_EDUCATION',
  'SECONDARY_EDUCATION',
  'SPECIAL_EDUCATION',
];

/**
 * REQ-085 & TEST-081: Strict Zero EP Fee Policy Validator.
 * iGTa and iGTe participants cannot be charged any project or accommodation fees.
 */
export function enforceZeroEPFeePolicy(
  product: ProductTrack,
  feesChargedToEpMad: number
): { isCompliant: boolean; error?: string } {
  if ((product === 'iGTa' || product === 'iGTe') && feesChargedToEpMad > 0) {
    return {
      isCompliant: false,
      error: `Statutory Policy Violation REQ-085 (TEST-081): Charging ${feesChargedToEpMad} MAD to ${product} participant is strictly prohibited. Professional and teaching exchanges must be 100% partner-funded with 0 MAD charged to EPs.`,
    };
  }

  return { isCompliant: true };
}

/**
 * REQ-036 & TEST-034: Validates iGTa Opportunity against statutory requirements.
 */
export function validateIGTaOpportunity(
  opportunity: IGTaOpportunityPayload
): ProfessionalValidationResult {
  const violations: string[] = [];
  const warnings: string[] = [];

  // 1. Duration check (6 to 78 weeks)
  if (opportunity.durationWeeks < IGTA_MIN_WEEKS || opportunity.durationWeeks > IGTA_MAX_WEEKS) {
    violations.push(
      `Invalid Duration REQ-036 (TEST-034): iGTa duration must be between ${IGTA_MIN_WEEKS} and ${IGTA_MAX_WEEKS} weeks. Provided: ${opportunity.durationWeeks} weeks.`
    );
  }

  // 2. Weekly hours check (35 to 45 hours/week)
  if (opportunity.weeklyHours < MIN_WEEKLY_HOURS || opportunity.weeklyHours > MAX_WEEKLY_HOURS) {
    violations.push(
      `Invalid Working Hours REQ-036 (TEST-034): Professional working hours must be between ${MIN_WEEKLY_HOURS} and ${MAX_WEEKLY_HOURS} hours/week. Provided: ${opportunity.weeklyHours} hours.`
    );
  }

  // 3. Professional field validation
  if (!VALID_IGTA_FIELDS.includes(opportunity.professionalField)) {
    violations.push(
      `Invalid Professional Field REQ-036: "${opportunity.professionalField}" is not a recognized professional talent field.`
    );
  }

  // 4. Statutory Salary Floor check (>= 3,500 MAD)
  if (opportunity.monthlySalaryMad < STATUTORY_MOROCCAN_MIN_SALARY_MAD) {
    violations.push(
      `Statutory Salary Violation REQ-036 (TEST-034): Monthly stipend of ${opportunity.monthlySalaryMad} MAD is below the statutory Moroccan minimum floor of ${STATUTORY_MOROCCAN_MIN_SALARY_MAD} MAD.`
    );
  }

  // 5. Zero EP Fee Enforcement
  const feePolicy = enforceZeroEPFeePolicy('iGTa', opportunity.feesChargedToEpMad);
  if (!feePolicy.isCompliant && feePolicy.error) {
    violations.push(feePolicy.error);
  }

  // 6. Supervisor Title
  if (!opportunity.supervisorTitle || opportunity.supervisorTitle.trim().length === 0) {
    violations.push('Supervisor role/title must be specified for workplace mentorship and oversight.');
  }

  return {
    isValid: violations.length === 0,
    product: 'iGTa',
    violations,
    warnings,
    minimumSalaryMadRequired: STATUTORY_MOROCCAN_MIN_SALARY_MAD,
    actualSalaryMad: opportunity.monthlySalaryMad,
    zeroEpFeeCompliant: opportunity.feesChargedToEpMad === 0,
  };
}

/**
 * REQ-037 & TEST-035: Validates iGTe Opportunity against educational requirements.
 */
export function validateIGTeOpportunity(
  opportunity: IGTeOpportunityPayload
): ProfessionalValidationResult {
  const violations: string[] = [];
  const warnings: string[] = [];

  // 1. Duration check (9 to 78 weeks)
  if (opportunity.durationWeeks < IGTE_MIN_WEEKS || opportunity.durationWeeks > IGTE_MAX_WEEKS) {
    violations.push(
      `Invalid Duration REQ-037 (TEST-035): iGTe duration must be between ${IGTE_MIN_WEEKS} and ${IGTE_MAX_WEEKS} weeks. Provided: ${opportunity.durationWeeks} weeks.`
    );
  }

  // 2. Weekly hours check (35 to 45 hours/week)
  if (opportunity.weeklyHours < MIN_WEEKLY_HOURS || opportunity.weeklyHours > MAX_WEEKLY_HOURS) {
    violations.push(
      `Invalid Working Hours REQ-037 (TEST-035): Teaching hours must be between ${MIN_WEEKLY_HOURS} and ${MAX_WEEKLY_HOURS} hours/week. Provided: ${opportunity.weeklyHours} hours.`
    );
  }

  // 3. Academic subject validation
  if (!VALID_IGTE_SUBJECTS.includes(opportunity.academicSubject)) {
    violations.push(
      `Invalid Academic Subject REQ-037: "${opportunity.academicSubject}" is not a recognized curriculum teaching subject.`
    );
  }

  // 4. Educational Institution Vetting Check
  if (!opportunity.isInstitutionVetted) {
    violations.push(
      `Unvetted Institution REQ-037 (TEST-035): Educational partner "${opportunity.institutionName}" has not completed statutory LC Rabat vetting. Opportunities cannot be opened.`
    );
  }

  // 5. Statutory Salary Floor check (>= 3,500 MAD)
  if (opportunity.monthlySalaryMad < STATUTORY_MOROCCAN_MIN_SALARY_MAD) {
    violations.push(
      `Statutory Salary Violation REQ-037 (TEST-035): Monthly teacher stipend of ${opportunity.monthlySalaryMad} MAD is below the statutory Moroccan minimum floor of ${STATUTORY_MOROCCAN_MIN_SALARY_MAD} MAD.`
    );
  }

  // 6. Zero EP Fee Enforcement
  const feePolicy = enforceZeroEPFeePolicy('iGTe', opportunity.feesChargedToEpMad);
  if (!feePolicy.isCompliant && feePolicy.error) {
    violations.push(feePolicy.error);
  }

  return {
    isValid: violations.length === 0,
    product: 'iGTe',
    violations,
    warnings,
    minimumSalaryMadRequired: STATUTORY_MOROCCAN_MIN_SALARY_MAD,
    actualSalaryMad: opportunity.monthlySalaryMad,
    zeroEpFeeCompliant: opportunity.feesChargedToEpMad === 0,
  };
}
