/**
 * Domain Types for Module J: 18 Exchange Standards & Survey Chasing
 * Baseline: REQ-066, REQ-067, REQ-068, REQ-072, TEST-063..065, TEST-069
 */

export type ResponsibleParty = 'SENDING_ENTITY' | 'HOST_ENTITY' | 'BOTH_ENTITIES';

export type SurveyStage = 'MIDDLE' | 'FINAL' | 'MIDDLE_AND_FINAL';

export type StandardDeliveryStatus =
  | 'PENDING'
  | 'DELIVERED_VERIFIED'
  | 'BREACHED'
  | 'NOT_APPLICABLE_REMOTE';

export type SurveyResponseType = 'UNANSWERED' | 'YES_FULFILLED' | 'NO_UNFULFILLED';

export type CoQualificationStatus =
  | 'QUALIFIED_COMPLETE'
  | 'DEFICIENT_MANDATORY_FAIL'
  | 'DEFICIENT_NON_MANDATORY_FAIL';

export interface ExchangeStandardDefinition {
  standardNumber: number; // 1..18
  standardName: string;
  isMandatory: boolean;
  responsibleParty: ResponsibleParty;
  surveyStage: SurveyStage;
  appliesToPhysical: boolean;
  appliesToPartlyRemote: boolean;
  appliesToFullyRemote: boolean;
  description?: string;
}

export interface HostStandardEvidence {
  id?: string;
  applicationId: string;
  standardNumber: number;
  internalStatus: StandardDeliveryStatus;
  deliveredAt: string | null; // ISO 8601
  verifiedByUserId: string | null;
  evidenceDocumentId: string | null;
  notes?: string;
}

export interface EpSurveyResponse {
  id?: string;
  applicationId: string;
  standardNumber: number;
  surveyStage: SurveyStage;
  epResponse: SurveyResponseType;
  syncedFromExpaAt: string; // ISO 8601
}

export interface StandardsMatrixRow {
  definition: ExchangeStandardDefinition;
  hostEvidence?: HostStandardEvidence;
  epResponse?: EpSurveyResponse;
  hasDiscrepancy: boolean;
  isDeliveredByHost: boolean;
  isConfirmedByEp: boolean;
}

export interface CoCalculationResult {
  mandatoryDeliveredCount: number; // Max 13
  mandatoryTotalCount: number; // 13
  nonMandatoryDeliveredCount: number; // Max 5
  nonMandatoryTotalCount: number; // 5
  totalDeliveredCount: number; // Max 18
  isCoQualified: boolean; // 13 Mandatory + >= 3 Non-Mandatory
  qualificationStatus: CoQualificationStatus;
  missingMandatoryStandards: number[];
  discrepantStandards: number[];
  deliveryPercentage: number;
}

export interface SurveyChasingEvaluation {
  applicationId: string;
  totalDurationDays: number;
  daysElapsed: number;
  daysRemaining: number;
  isMidpointReached: boolean;
  isMiddleSurveyDue: boolean;
  isFinalSurveyDue: boolean;
  actionsDue: Array<
    | 'MIDDLE_SURVEY_CHASE'
    | 'FINAL_SURVEY_CHASE_T7'
    | 'FINAL_SURVEY_CHASE_T3'
    | 'FINAL_SURVEY_CHASE_T0'
  >;
  alertMessage?: string;
}
