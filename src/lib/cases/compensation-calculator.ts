/**
 * Annex 2 Draft Compensation Calculator & Annex 9 Appeal Window Tracker Engine
 * Statutory References: AEPP Annex 2 (Compensation Schedules), Annex 9 (Appeals), AFPM, REQ-081..083, TEST-075, TEST-077
 * Jurisdiction: AIESEC in Rabat (LC Rabat, MC Morocco)
 */

import type {
  CompensationCategory,
  CompensationLineItem,
  DraftCompensationReport,
  CaseAppealRecord,
  AppealWindowStatus,
} from '../types/compensation-appeals';

export interface Annex2CalculationInput {
  caseId: string;
  epName: string;
  homeLc: string;
  totalFeePaidMad: number;
  exchangeDurationDays: number;
  completedDays: number;
  unfulfilledStandardsCount: number;
  totalStandardsCount?: number;
  monthlyStipendMad?: number;
  stipendDelayDaysAfterDay30?: number; // Days delayed past day 30
  emergencyAccommodationNights?: number;
  emergencyNightRateMad?: number;
  transportExpenseMad?: number;
  notes?: string;
}

/**
 * REQ-081 & TEST-075: Calculates Annex 2 draft compensation estimate.
 * Mandatory rules:
 * 1. Outputs DRAFT figures requiring explicit human sign-off (never automated).
 * 2. 2% daily fine on unpaid stipend after Day 30 of realization.
 * 3. 70% Completion Rule: If > 70% of exchange completed without prior dispute, fee refund is capped.
 */
export function calculateAnnex2DraftCompensation(
  input: Annex2CalculationInput,
  calculationDate: Date = new Date()
): DraftCompensationReport {
  const lineItems: CompensationLineItem[] = [];
  const totalStandards = input.totalStandardsCount || 18;

  const completionPercentage = Math.round(
    (Math.min(input.completedDays, input.exchangeDurationDays) / input.exchangeDurationDays) * 100
  );
  const isPast70PercentDismissalThreshold = completionPercentage > 70;

  // 1. Fee Refund calculation
  if (input.unfulfilledStandardsCount > 0 && input.totalFeePaidMad > 0) {
    const rawRefund = (input.unfulfilledStandardsCount / totalStandards) * input.totalFeePaidMad;

    // Apply 70% statutory dismissal threshold if applicable
    let finalRefundAmount = rawRefund;
    let description = `Prorated fee refund for ${input.unfulfilledStandardsCount}/${totalStandards} unfulfilled exchange standards.`;

    if (isPast70PercentDismissalThreshold) {
      // 70% threshold reduces refund entitlement by 50% under Annex 2 late dispute limitation
      finalRefundAmount = Math.round(rawRefund * 0.5);
      description += ' (Reduced by 50% under Annex 2 statutory >70% duration threshold).';
    } else {
      finalRefundAmount = Math.round(rawRefund);
    }

    lineItems.push({
      category: 'PRORATED_FEE_REFUND',
      amountMad: finalRefundAmount,
      description,
      statutoryReference: 'AEPP Annex 2 §3.1 (Prorated Standards Refund)',
    });
  }

  // 2. Stipend / Salary Late Fine (2% per day after Day 30)
  const delayDays = input.stipendDelayDaysAfterDay30 || 0;
  const stipend = input.monthlyStipendMad || 0;
  if (delayDays > 0 && stipend > 0) {
    // 2% per day fine
    const dailyFine = stipend * 0.02;
    const totalFineMad = Math.round(dailyFine * delayDays);

    lineItems.push({
      category: 'SALARY_DELAY_FINE',
      amountMad: totalFineMad,
      description: `Late stipend penalty: 2% daily fine on ${stipend} MAD monthly stipend for ${delayDays} days delay past Day 30.`,
      statutoryReference: 'AEPP Annex 2 §4.2 (2% Daily Stipend Delay Fine)',
    });
  }

  // 3. Emergency Housing Relocation Allowance
  const nights = input.emergencyAccommodationNights || 0;
  const nightRate = input.emergencyNightRateMad || 250;
  if (nights > 0) {
    const accommodationAmount = Math.min(2500, Math.round(nights * nightRate)); // Capped at 2500 MAD
    lineItems.push({
      category: 'EMERGENCY_ACCOMMODATION',
      amountMad: accommodationAmount,
      description: `Emergency temporary relocation housing allowance: ${nights} nights at ${nightRate} MAD/night.`,
      statutoryReference: 'AEPP Annex 2 §5.1 (Emergency Housing Relocation)',
    });
  }

  // 4. Out-of-pocket Local Transport
  if (input.transportExpenseMad && input.transportExpenseMad > 0) {
    lineItems.push({
      category: 'TRANSPORT_REIMBURSEMENT',
      amountMad: Math.round(input.transportExpenseMad),
      description: 'Reimbursement for documented emergency transport expenses incurred by EP.',
      statutoryReference: 'AEPP Annex 2 §5.3 (Direct Transport Reimbursement)',
    });
  }

  const totalDraftCompensationMad = lineItems.reduce((sum, item) => sum + item.amountMad, 0);

  return {
    draftId: `DRAFT_COMP_${input.caseId}_${Date.now()}`,
    caseId: input.caseId,
    epName: input.epName,
    homeLc: input.homeLc,
    totalFeePaidMad: input.totalFeePaidMad,
    exchangeDurationDays: input.exchangeDurationDays,
    completedDays: input.completedDays,
    completionPercentage,
    isPast70PercentDismissalThreshold,
    lineItems,
    totalDraftCompensationMad,
    requiresHumanApproval: true,
    status: 'DRAFT_ESTIMATE',
    notes: input.notes || 'Draft calculation generated based on statutory Annex 2 schedules. Awaiting LCVP FnL review.',
    calculatedAt: calculationDate.toISOString(),
  };
}

/**
 * REQ-082 & TEST-077: Tracks Annex 9 statutory 10-day appeal window.
 * Computes remaining hours and determines legal stay of execution.
 */
export function trackAnnex9AppealWindow(params: {
  caseId: string;
  caseNumber: string;
  rulingDate: string; // ISO 8601
  appealFiledAt?: string;
  appellantRole?: 'HOME_LC' | 'HOST_LC' | 'EP';
  appellantName?: string;
  appealGrounds?: string;
  currentDate?: Date;
}): CaseAppealRecord {
  const current = params.currentDate || new Date();
  const rulingMs = new Date(params.rulingDate).getTime();
  const TEN_DAYS_MS = 10 * 24 * 3600 * 1000;
  const deadlineMs = rulingMs + TEN_DAYS_MS;
  const appealDeadline = new Date(deadlineMs).toISOString();

  const currentMs = current.getTime();
  const remainingHours = Math.max(0, Number(((deadlineMs - currentMs) / (1000 * 3600)).toFixed(1)));
  const isWindowExpired = currentMs > deadlineMs;

  let status: AppealWindowStatus;
  let isStayOfExecutionActive = false;

  if (params.appealFiledAt) {
    const filedMs = new Date(params.appealFiledAt).getTime();
    if (filedMs <= deadlineMs) {
      status = 'APPEAL_FILED';
      isStayOfExecutionActive = true; // Formal stay of execution granted
    } else {
      status = 'FINAL_AND_BINDING'; // Appeal filed after window elapsed
      isStayOfExecutionActive = false;
    }
  } else if (isWindowExpired) {
    status = 'FINAL_AND_BINDING';
    isStayOfExecutionActive = false;
  } else {
    status = 'WINDOW_ACTIVE';
    isStayOfExecutionActive = false;
  }

  return {
    appealId: `APP_${params.caseId}_${Date.now()}`,
    caseId: params.caseId,
    caseNumber: params.caseNumber,
    rulingDate: params.rulingDate,
    appealDeadline,
    status,
    remainingHours,
    isWindowExpired,
    isStayOfExecutionActive,
    appellantRole: params.appellantRole,
    appellantName: params.appellantName,
    appealGrounds: params.appealGrounds,
    filedAt: params.appealFiledAt,
  };
}
