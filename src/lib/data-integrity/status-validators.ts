/**
 * AIESEC iCX ERP — Statutory Status Request Checklist Validators & Timing Engine
 * Author: Wadii Hani <wadii.hani.pro@gmail.com>
 * Specification: iCX_Data_Integrity_Tracking_Spec.md v1.0 (§7.1–§7.4, §16 T-07..T-10, DQ-052, DQ-057)
 * Milestone: M3 (Plan 03-02)
 * Enforces: APIP Clauses, PDF Proofs, Timing Cutoffs, and APD Aged Break Exceptions
 */

import type {
  StatusRequest,
  Exchange,
  DqIssue,
  ExStatus,
} from '../types/data-integrity';
import { getMasterTrackerDb } from './master-tracker';
import { proofVaultService } from './proof-vault';

export class StatusRequestChecklistError extends Error {
  public readonly missingItems: string[];
  public readonly requestId: string;

  constructor(requestId: string, missingItems: string[]) {
    super(
      `Status request '${requestId}' cannot be submitted because required statutory checklist items are missing: [${missingItems.join(', ')}]. (Rule DQ-057)`
    );
    this.name = 'StatusRequestChecklistError';
    this.missingItems = missingItems;
    this.requestId = requestId;
  }
}

export interface ValidationCheckResult {
  isValid: boolean;
  missingItems: string[];
  evaluatedChecklist: Record<string, boolean>;
  warnings: string[];
  dqIssues: Omit<DqIssue, 'id'>[];
}

export interface DirectBreakEvaluation {
  isApdPastRe: boolean;
  daysPassed: number;
  violationLevel: number;
  isUrgentDq052: boolean;
  directBreakEligible: boolean;
  explanation: string;
  dqIssue?: Omit<DqIssue, 'id'>;
}

/**
 * Calculates calendar day difference (targetDate - baseDate).
 */
export function getDaysDifference(baseDateStr: string, targetDateStr: string): number {
  const base = new Date(baseDateStr);
  const target = new Date(targetDateStr);
  const diffMs = target.getTime() - base.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Evaluates APD with RE date passed (§7.4, T-10, DQ-052).
 */
export function evaluateApdPastReDate(
  exchange: Exchange,
  currentDateStr?: string
): DirectBreakEvaluation {
  const today = currentDateStr ? new Date(currentDateStr) : new Date();
  const todayStr = today.toISOString().split('T')[0];

  if (exchange.status !== 'APD' || !exchange.re_date) {
    return {
      isApdPastRe: false,
      daysPassed: 0,
      violationLevel: 0,
      isUrgentDq052: false,
      directBreakEligible: false,
      explanation: 'Exchange is not in APD status with a set realization date.',
    };
  }

  const daysPassed = getDaysDifference(exchange.re_date, todayStr);

  if (daysPassed <= 0) {
    return {
      isApdPastRe: false,
      daysPassed: 0,
      violationLevel: 0,
      isUrgentDq052: false,
      directBreakEligible: false,
      explanation: 'Realization date is in the future.',
    };
  }

  // APD past re_date detected -> L5 Violation risk
  const isGv = exchange.programme === 'GV';
  const directBreakEligible = isGv ? daysPassed > 20 : daysPassed >= 1;

  const dqIssue: Omit<DqIssue, 'id'> = {
    rule_id: 'DQ-052',
    subject: `Urgent: APD with RE date passed by ${daysPassed} days for exchange ${exchange.id} (Fake status risk — Violation Level 5)`,
    severity: 'Urgent',
    detected_at: today.toISOString(),
    owner_id: exchange.owner_id,
    details: {
      exchange_id: exchange.id,
      ep_id: exchange.ep_id,
      programme: exchange.programme,
      re_date: exchange.re_date,
      days_passed: daysPassed,
      direct_break_eligible: directBreakEligible,
      violation_level: 5,
    },
  };

  return {
    isApdPastRe: true,
    daysPassed,
    violationLevel: 5,
    isUrgentDq052: true,
    directBreakEligible,
    explanation: directBreakEligible
      ? `APD past RE date by ${daysPassed} days (>20 d). Direct extraordinary break (APD) is enabled without proof.`
      : `APD past RE date by ${daysPassed} days. Urgent DQ-052 alert raised.`,
    dqIssue,
  };
}

export const statusValidatorService = {
  /**
   * Validates Early FI status request (§7.1, T-07, T-08).
   */
  validateEarlyFi(
    request: StatusRequest,
    exchange: Exchange,
    submittedAt?: string
  ): ValidationCheckResult {
    const missing: string[] = [];
    const evaluated: Record<string, boolean> = {};
    const submitDate = submittedAt ?? request.submitted_at ?? new Date().toISOString();

    // 1. ep_in_required_status: EP status = RE in EXPA
    const epInReqStatus = exchange.status === 'RE';
    evaluated['ep_in_required_status'] = epInReqStatus;
    if (!epInReqStatus) {
      missing.push('ep_in_required_status (EP must be in RE status)');
    }

    // 2. valid_reason_apip: Reason covered by APIP (free text + APIP clause ref)
    const validReason = Boolean(
      request.reason &&
      request.reason.trim().length > 0 &&
      request.apip_clause_ref &&
      request.apip_clause_ref.trim().length > 0
    );
    evaluated['valid_reason_apip'] = validReason;
    if (!validReason) {
      missing.push('valid_reason_apip (Valid APIP reason and clause reference required)');
    }

    // 3. proof_lc2lc_email_pdf: PDF attached (T-07)
    const hasLc2LcProof = request.evidence_proof_ids.some((id) => {
      const doc = proofVaultService.getProofDocument(id);
      return doc && (doc.file_name.toLowerCase().includes('lc2lc') || doc.metadata?.type === 'lc2lc_email');
    });
    evaluated['proof_lc2lc_email_pdf'] = hasLc2LcProof;
    if (!hasLc2LcProof) {
      missing.push('proof_lc2lc_email_pdf (Attached LC2LC email PDF proof)');
    }

    // 4. proof_ep_opp_agreement: EP-OP agreement attached
    const hasEpOppAgreement = request.evidence_proof_ids.some((id) => {
      const doc = proofVaultService.getProofDocument(id);
      return doc && (doc.file_name.toLowerCase().includes('agreement') || doc.metadata?.type === 'ep_opp_agreement');
    });
    evaluated['proof_ep_opp_agreement'] = hasEpOppAgreement;
    if (!hasEpOppAgreement) {
      missing.push('proof_ep_opp_agreement (Attached EP & Opportunity provider mutual agreement)');
    }

    // 5. timing_ok: submitted_at <= desired_new_finish - 7 days (T-08)
    let timingOk = false;
    if (request.desired_date) {
      const daysUntilFinish = getDaysDifference(submitDate.split('T')[0], request.desired_date);
      // Must be submitted at least 7 days before desired finish
      timingOk = daysUntilFinish >= 7;
    }
    evaluated['timing_ok'] = timingOk;
    if (!timingOk) {
      missing.push('timing_ok (Submission must be at least 7 days prior to new desired finish date)');
    }

    // 6. duration_min_ok: New duration >= programme minimum (4 weeks for iGV)
    let durationMinOk = false;
    if (exchange.re_date && request.desired_date) {
      const newDurationDays = getDaysDifference(exchange.re_date, request.desired_date);
      const newWeeks = newDurationDays / 7;
      durationMinOk = newWeeks >= 4;
    }
    evaluated['duration_min_ok'] = durationMinOk;
    if (!durationMinOk) {
      missing.push('duration_min_ok (New project duration must satisfy programme minimum of 4 weeks)');
    }

    // 7. single_ep: Single EP check (INV-06)
    const singleEp = exchange.ep_id === request.ep_id;
    evaluated['single_ep'] = singleEp;
    if (!singleEp) {
      missing.push('single_ep (Request must cover exactly one EP)');
    }

    // 8. email_min_info & zendesk_form_ok
    evaluated['email_min_info'] = true;
    evaluated['zendesk_form_ok'] = Boolean(request.ticket_ref && request.ticket_ref.trim().length > 0);
    if (!evaluated['zendesk_form_ok'] && request.current_status === 'submitted') {
      missing.push('zendesk_form_ok (Ticketing form reference required)');
    }

    return {
      isValid: missing.length === 0,
      missingItems: missing,
      evaluatedChecklist: evaluated,
      warnings: [],
      dqIssues: [],
    };
  },

  /**
   * Validates Extension FI status request (§7.2, T-09).
   */
  validateExtensionFi(
    request: StatusRequest,
    exchange: Exchange,
    submittedAt?: string
  ): ValidationCheckResult {
    const missing: string[] = [];
    const evaluated: Record<string, boolean> = {};
    const submitDate = submittedAt ?? request.submitted_at ?? new Date().toISOString();

    // 1. ep_in_required_status: EP status = RE
    const epInReqStatus = exchange.status === 'RE';
    evaluated['ep_in_required_status'] = epInReqStatus;
    if (!epInReqStatus) {
      missing.push('ep_in_required_status (EP must be in RE status)');
    }

    // 2. valid_reason_apip: Reason + APIP clause
    const validReason = Boolean(
      request.reason &&
      request.reason.trim().length > 0 &&
      request.apip_clause_ref &&
      request.apip_clause_ref.trim().length > 0
    );
    evaluated['valid_reason_apip'] = validReason;
    if (!validReason) {
      missing.push('valid_reason_apip (Valid APIP reason and clause reference required)');
    }

    // 3. proof_lc2lc_email_pdf & proof_ep_opp_agreement
    const hasLc2LcProof = request.evidence_proof_ids.some((id) => {
      const doc = proofVaultService.getProofDocument(id);
      return doc && (doc.file_name.toLowerCase().includes('lc2lc') || doc.metadata?.type === 'lc2lc_email');
    });
    evaluated['proof_lc2lc_email_pdf'] = hasLc2LcProof;
    if (!hasLc2LcProof) {
      missing.push('proof_lc2lc_email_pdf (Attached LC2LC email PDF proof)');
    }

    const hasEpOppAgreement = request.evidence_proof_ids.some((id) => {
      const doc = proofVaultService.getProofDocument(id);
      return doc && (doc.file_name.toLowerCase().includes('agreement') || doc.metadata?.type === 'ep_opp_agreement');
    });
    evaluated['proof_ep_opp_agreement'] = hasEpOppAgreement;
    if (!hasEpOppAgreement) {
      missing.push('proof_ep_opp_agreement (Attached EP & Opportunity provider mutual agreement)');
    }

    // 4. timing_ok: submitted_at <= opportunity_finish - 14 days (T-09)
    let timingOk = false;
    const oppFinish = exchange.fi_date;
    if (oppFinish) {
      const daysUntilFinish = getDaysDifference(submitDate.split('T')[0], oppFinish);
      timingOk = daysUntilFinish >= 14;
    }
    evaluated['timing_ok'] = timingOk;
    if (!timingOk) {
      missing.push('timing_ok (Extension request must be submitted at least 14 days prior to original finish date)');
    }

    // 5. single_ep
    const singleEp = exchange.ep_id === request.ep_id;
    evaluated['single_ep'] = singleEp;
    if (!singleEp) {
      missing.push('single_ep (Request must cover exactly one EP)');
    }

    return {
      isValid: missing.length === 0,
      missingItems: missing,
      evaluatedChecklist: evaluated,
      warnings: [],
      dqIssues: [],
    };
  },

  /**
   * Validates Break requests (break_apd, break_re, break_fi, break_co per §7.3, §7.4).
   */
  validateBreakRequest(
    request: StatusRequest,
    exchange: Exchange,
    directBreakEligible: boolean = false
  ): ValidationCheckResult {
    const missing: string[] = [];
    const evaluated: Record<string, boolean> = {};

    // 1. ep_same_status: EP status matches break kind
    const expectedStatusMap: Record<string, ExStatus> = {
      break_apd: 'APD',
      break_re: 'RE',
      break_fi: 'FI',
      break_co: 'CO',
    };
    const expected = expectedStatusMap[request.kind];
    const epSameStatus = exchange.status === expected;
    evaluated['ep_same_status'] = epSameStatus;
    if (!epSameStatus) {
      missing.push(`ep_same_status (EP status must be '${expected}' for ${request.kind})`);
    }

    // 2. valid_reason_apip
    const validReason = Boolean(
      request.reason &&
      request.reason.trim().length > 0 &&
      (request.apip_clause_ref?.trim() || directBreakEligible)
    );
    evaluated['valid_reason_apip'] = validReason;
    if (!validReason) {
      missing.push('valid_reason_apip (Valid APIP reason and clause reference required)');
    }

    // 3. Proofs: English LC2LC and English ECB2ECB PDF
    if (directBreakEligible) {
      // Direct break exempts proof requirement (§7.4, T-10)
      evaluated['proof_lc2lc_email_pdf_en'] = true;
      evaluated['proof_ecb2ecb_email_pdf_en'] = true;
    } else {
      const hasLc2LcEn = request.evidence_proof_ids.some((id) => {
        const doc = proofVaultService.getProofDocument(id);
        return (
          doc &&
          (doc.file_name.toLowerCase().includes('lc2lc') || doc.metadata?.type === 'lc2lc_email') &&
          doc.metadata?.language === 'en'
        );
      });
      evaluated['proof_lc2lc_email_pdf_en'] = hasLc2LcEn;
      if (!hasLc2LcEn) {
        missing.push('proof_lc2lc_email_pdf_en (Attached LC2LC email PDF in English)');
      }

      const hasEcb2EcbEn = request.evidence_proof_ids.some((id) => {
        const doc = proofVaultService.getProofDocument(id);
        return (
          doc &&
          (doc.file_name.toLowerCase().includes('ecb') || doc.metadata?.type === 'ecb2ecb_email') &&
          doc.metadata?.language === 'en'
        );
      });
      evaluated['proof_ecb2ecb_email_pdf_en'] = hasEcb2EcbEn;
      if (!hasEcb2EcbEn) {
        missing.push('proof_ecb2ecb_email_pdf_en (Attached ECB2ECB email PDF in English)');
      }
    }

    // 4. single_request_per_ep (INV-06)
    const singleEp = exchange.ep_id === request.ep_id;
    evaluated['single_request_per_ep'] = singleEp;
    if (!singleEp) {
      missing.push('single_request_per_ep (Request must cover exactly one EP)');
    }

    return {
      isValid: missing.length === 0,
      missingItems: missing,
      evaluatedChecklist: evaluated,
      warnings: [],
      dqIssues: [],
    };
  },

  /**
   * Asserts checklist completeness for submission.
   * Throws StatusRequestChecklistError if any statutory criterion fails (DQ-057).
   */
  assertRequestReadyForSubmission(
    request: StatusRequest,
    submittedAt?: string,
    currentDateStr?: string
  ): void {
    const masterDb = getMasterTrackerDb();
    const exchange = masterDb.exchanges.get(request.exchange_id);
    if (!exchange) {
      throw new Error(`Exchange '${request.exchange_id}' not found.`);
    }

    let result: ValidationCheckResult;

    if (request.kind === 'early_fi') {
      result = this.validateEarlyFi(request, exchange, submittedAt);
    } else if (request.kind === 'extension_fi') {
      result = this.validateExtensionFi(request, exchange, submittedAt);
    } else {
      // Break requests
      const apdCheck = evaluateApdPastReDate(exchange, currentDateStr);
      result = this.validateBreakRequest(request, exchange, apdCheck.directBreakEligible);
    }

    if (!result.isValid) {
      throw new StatusRequestChecklistError(request.id, result.missingItems);
    }
  },
};
