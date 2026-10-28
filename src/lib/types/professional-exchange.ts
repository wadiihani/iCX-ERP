/**
 * Professional Exchange Domain Types (iGTa, iGTe, Salary Tracking & Zero EP Fee Invariant)
 * Statutory References: AEPP Section 4, Moroccan Labor Code (SMIG), AFPM, REQ-036, REQ-037, REQ-085, TEST-034, TEST-035, TEST-081
 * Jurisdiction: AIESEC in Rabat (LC Rabat, MC Morocco)
 */

export type ProductTrack = 'iGV' | 'iGTa' | 'iGTe';

export type IGTaProfessionalField =
  | 'SOFTWARE_ENGINEERING'
  | 'DATA_ANALYTICS'
  | 'BUSINESS_DEVELOPMENT'
  | 'MARKETING_AND_COMMUNICATION'
  | 'FINANCE_ACCOUNTING'
  | 'ENGINEERING'
  | 'HUMAN_RESOURCES'
  | 'GRAPHIC_DESIGN';

export type IGTeAcademicSubject =
  | 'ENGLISH_LANGUAGE'
  | 'FRENCH_LANGUAGE'
  | 'SPANISH_LANGUAGE'
  | 'STEM_EDUCATION'
  | 'PRIMARY_EDUCATION'
  | 'SECONDARY_EDUCATION'
  | 'SPECIAL_EDUCATION';

export type EducationalInstitutionTier =
  | 'ACCREDITED_PRIVATE_SCHOOL'
  | 'INTERNATIONAL_BILINGUAL_SCHOOL'
  | 'UNIVERSITY_OR_FACULTY'
  | 'ACCREDITED_LANGUAGE_INSTITUTE';

export interface IGTaOpportunityPayload {
  id: string;
  lcId: string;
  title: string;
  partnerOrganizationId: string;
  partnerName: string;
  professionalField: IGTaProfessionalField;
  durationWeeks: number; // Must be 6 to 78 weeks
  weeklyHours: number; // Must be 35 to 45 hours/week
  monthlySalaryMad: number; // Must meet statutory salary floor (e.g. 3,500 MAD)
  feesChargedToEpMad: number; // MUST BE 0 (REQ-085, TEST-081)
  supervisorTitle: string;
  jobDescription: string;
  remoteModality?: 'ONSITE' | 'PARTLY_REMOTE' | 'FULLY_REMOTE';
}

export interface IGTeOpportunityPayload {
  id: string;
  lcId: string;
  title: string;
  educationalInstitutionId: string;
  institutionName: string;
  institutionTier: EducationalInstitutionTier;
  isInstitutionVetted: boolean;
  academicSubject: IGTeAcademicSubject;
  durationWeeks: number; // Must be 9 to 78 weeks
  weeklyHours: number; // Must be 35 to 45 hours/week
  monthlySalaryMad: number; // Must meet statutory salary floor (e.g. 3,500 MAD)
  feesChargedToEpMad: number; // MUST BE 0 (REQ-085, TEST-081)
  curriculumOutline: string;
  supervisorTitle: string;
}

export interface ProfessionalValidationResult {
  isValid: boolean;
  product: ProductTrack;
  violations: string[];
  warnings: string[];
  minimumSalaryMadRequired: number;
  actualSalaryMad: number;
  zeroEpFeeCompliant: boolean;
}
