/**
 * Quality Case Management, Statutory Stage Clocks & Evidence Dossier Types
 * Statutory References: AEPP Annex 2 (Dispute Resolution), Annex 9 (Appeals), REQ-076..079, REQ-082, AUTO-029, TEST-072..074
 * Jurisdiction: AIESEC in Rabat (LC Rabat, MC Morocco)
 */

export type CaseClassification =
  | 'STANDARDS_BREACH'
  | 'ACCOMMODATION_SAFETY'
  | 'PROJECT_MISMATCH'
  | 'EMERGENCY_HEALTH'
  | 'FINANCIAL_DISPUTE'
  | 'MISCONDUCT';

export type CaseStage =
  | 'STAGE_1_LC_DIRECT' // 72 hours statutory limit
  | 'STAGE_2_ECB_MEDIATION' // 14 days (336 hours) statutory limit
  | 'STAGE_3_ICB_ARBITRATION'; // 30 days (720 hours) statutory limit

export type CaseStatus =
  | 'SUBMITTED'
  | 'UNDER_INVESTIGATION'
  | 'RESOLUTION_PROPOSED'
  | 'RESOLVED'
  | 'ESCALATED'
  | 'CLOSED';

export type PauseReason =
  | 'EP_COMMUNICATION_DELAY'
  | 'MEDICAL_HOLD'
  | 'POLICE_LEGAL_INVESTIGATION'
  | 'DISPUTE_COMMITTEE_REVIEW'
  | 'DOCUMENT_SUBMISSION_WINDOW';

export interface CasePauseInterval {
  id: string;
  pausedAt: string; // ISO 8601
  resumedAt?: string; // ISO 8601
  reason: PauseReason;
  notes: string;
  pausedByUserId: string;
  resumedByUserId?: string;
}

export interface CaseResolution {
  resolutionId: string;
  proposedByUserId: string;
  proposedAt: string;
  approvedByUserId?: string;
  approvedAt?: string;
  terms: string;
  compensationMad?: number;
  status: 'PROPOSED' | 'ACCEPTED_BY_EP' | 'REJECTED_BY_EP';
}

export interface QualityCaseRecord {
  id: string;
  caseNumber: string;
  lcId: string;
  applicationId: string;
  epId: string;
  epName: string;
  homeLc: string;
  classification: CaseClassification;
  stage: CaseStage;
  status: CaseStatus;
  openedAt: string; // ISO 8601
  stageStartedAt: string; // ISO 8601
  isClockPaused: boolean;
  pauseIntervals: CasePauseInterval[];
  resolution?: CaseResolution;
  disputedStandards?: number[];
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface StageClockEvaluation {
  caseId: string;
  stage: CaseStage;
  clockLimitHours: number;
  grossElapsedHours: number;
  accumulatedPausedHours: number;
  effectiveElapsedHours: number;
  remainingHours: number;
  isBreached: boolean;
  isPaused: boolean;
  urgencyStatus: 'NORMAL' | 'APPROACHING_DEADLINE' | 'BREACHED';
}

export interface TimelineEvent {
  timestamp: string;
  title: string;
  actor: string;
  details: string;
}

export interface CaseDossier {
  dossierId: string;
  caseId: string;
  compiledAt: string;
  compiledBy: string;
  caseRecord: QualityCaseRecord;
  clockEvaluation: StageClockEvaluation;
  timelineEvents: TimelineEvent[];
  dossierHash: string;
}
