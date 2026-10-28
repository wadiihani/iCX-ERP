/**
 * Annex 2 Draft Compensation Calculator & Annex 9 Appeal Window Tracker Types
 * Statutory References: AEPP Annex 2 (Compensation Schedules), Annex 9 (Appeals), AFPM, REQ-081..083, TEST-075, TEST-077
 * Jurisdiction: AIESEC in Rabat (LC Rabat, MC Morocco)
 */

export type CompensationCategory =
  | 'PRORATED_FEE_REFUND'
  | 'SALARY_DELAY_FINE'
  | 'EMERGENCY_ACCOMMODATION'
  | 'TRANSPORT_REIMBURSEMENT'
  | 'DAMAGE_RECOVERY';

export interface CompensationLineItem {
  category: CompensationCategory;
  amountMad: number;
  description: string;
  statutoryReference: string;
}

export interface DraftCompensationReport {
  draftId: string;
  caseId: string;
  epName: string;
  homeLc: string;
  totalFeePaidMad: number;
  exchangeDurationDays: number;
  completedDays: number;
  completionPercentage: number;
  isPast70PercentDismissalThreshold: boolean;
  lineItems: CompensationLineItem[];
  totalDraftCompensationMad: number;
  requiresHumanApproval: true; // Hard invariant: never automated disbursement
  status: 'DRAFT_ESTIMATE' | 'OFFICER_REVIEWED' | 'APPROVED_FOR_DISBURSEMENT' | 'DISBURSED';
  reviewedByUserId?: string;
  reviewedAt?: string;
  notes: string;
  calculatedAt: string;
}

export type AppealWindowStatus = 'WINDOW_ACTIVE' | 'APPEAL_FILED' | 'FINAL_AND_BINDING';

export interface CaseAppealRecord {
  appealId: string;
  caseId: string;
  caseNumber: string;
  rulingDate: string; // ISO 8601
  appealDeadline: string; // ISO 8601 (rulingDate + 10 days)
  status: AppealWindowStatus;
  remainingHours: number;
  isWindowExpired: boolean;
  isStayOfExecutionActive: boolean;
  appellantRole?: 'HOME_LC' | 'HOST_LC' | 'EP';
  appellantName?: string;
  appealGrounds?: string;
  filedAt?: string;
}
