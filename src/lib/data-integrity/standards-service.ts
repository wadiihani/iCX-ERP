/**
 * AIESEC iCX ERP — Exchange Standards Parallel-Truth Service
 * Author: Wadii Hani <wadii.hani.pro@gmail.com>
 * Specification: iCX_Data_Integrity_Tracking_Spec.md v1.0 (§6 Module B)
 * Milestone: M2 (Plan 02-01)
 * Enforces: INV-05 (EP Voice Immutability), DQ-055 (Parallel-Truth Mismatch Detection)
 */

import type {
  FlowStage,
  StandardDef,
  StandardCheck,
  StandardTrackedStatus,
  DqIssue,
} from '../types/data-integrity';
import { assertEpReportedImmutable } from './invariants';
import { getMasterTrackerDb } from './master-tracker';

/**
 * Statutory 16 Exchange Standards Definitions (§6.1)
 */
export const STATUTORY_STANDARD_DEFS: StandardDef[] = [
  {
    std_no: 1,
    name: 'Personal goal setting',
    phase: 'preparation',
    delivered_by: 'Home entity (oGX)',
    mandatory: false,
    yop_question: 'Did your home entity support you in setting personal goals?',
    answer_options: ['Yes', 'No'],
  },
  {
    std_no: 2,
    name: 'Outgoing preparation',
    phase: 'preparation',
    delivered_by: 'Home entity (oGX)',
    mandatory: false,
    yop_question: 'Did you receive preparation from your home entity before departure?',
    answer_options: ['Yes', 'No'],
  },
  {
    std_no: 3,
    name: 'Insurance',
    phase: 'preparation',
    delivered_by: 'Home entity (oGX)',
    mandatory: false,
    yop_question: 'Did you have insurance coverage during your exchange?',
    answer_options: ['Yes', 'No'],
  },
  {
    std_no: 4,
    name: 'Expectations setting',
    phase: 'preparation',
    delivered_by: 'Host entity (iCX)',
    mandatory: true,
    yop_question: 'Did the host entity provide written preparation on culture, safety, and living conditions?',
    answer_options: ['Yes', 'No'],
  },
  {
    std_no: 5,
    name: 'Visa and work permit',
    phase: 'preparation',
    delivered_by: 'Host entity (iCX)',
    mandatory: true,
    yop_question: 'Did the host entity support you with necessary visa invitation letters and permits?',
    answer_options: ['Yes', 'No', 'Visa not required', 'Work permit not required'],
  },
  {
    std_no: 6,
    name: 'Arrival pick-up',
    phase: 'preparation',
    delivered_by: 'Host entity (iCX)',
    mandatory: false,
    yop_question: 'Were you picked up by an AIESEC representative upon arrival?',
    answer_options: ['Yes', 'No'],
  },
  {
    std_no: 7,
    name: 'Accommodation',
    phase: 'preparation',
    delivered_by: 'Host entity (iCX)',
    mandatory: true,
    yop_question: 'Did the accommodation match conditions promised and provide basic necessities?',
    answer_options: ['Yes', 'No'],
  },
  {
    std_no: 8,
    name: 'Incoming preparation',
    phase: 'preparation',
    delivered_by: 'Host entity (iCX)',
    mandatory: true,
    yop_question: 'Did you attend an incoming preparation seminar (IPS)?',
    answer_options: ['Yes & attended', 'Yes & did not attend', 'No'],
  },
  {
    std_no: 9,
    name: 'First day of work',
    phase: 'experience',
    delivered_by: 'Host entity (iCX)',
    mandatory: false,
    yop_question: 'Did an AIESEC representative accompany you to your workplace on day 1?',
    answer_options: ['Yes', 'No'],
  },
  {
    std_no: 10,
    name: 'Alignment spaces with opportunity provider',
    phase: 'experience',
    delivered_by: 'Host entity (iCX)',
    mandatory: true,
    yop_question: 'Did you have structured alignment spaces with your project host?',
    answer_options: ['Yes', 'No'],
  },
  {
    std_no: 11,
    name: 'Job description',
    phase: 'experience',
    delivered_by: 'Host entity (iCX)',
    mandatory: true,
    yop_question: 'Did your daily tasks match the job description agreed upon?',
    answer_options: ['Same JD', 'Changed but agreed', 'Changed, not agreed'],
  },
  {
    std_no: 12,
    name: 'Working hours',
    phase: 'experience',
    delivered_by: 'Host entity (iCX)',
    mandatory: false,
    yop_question: 'Did your weekly hours match what was specified on EXPA?',
    answer_options: ['Yes', 'No'],
  },
  {
    std_no: 13,
    name: 'Duration',
    phase: 'experience',
    delivered_by: 'Host entity (iCX)',
    mandatory: true,
    yop_question: 'Did the duration of your project match the approved timeline?',
    answer_options: ['Same', 'Changed but agreed', 'Changed, not agreed'],
  },
  {
    std_no: 14,
    name: 'Opportunity benefits',
    phase: 'experience',
    delivered_by: 'Host entity (iCX)',
    mandatory: true,
    yop_question: 'Were all promised project benefits delivered?',
    answer_options: ['Yes', 'No', 'No benefits specified'],
  },
  {
    std_no: 15,
    name: 'Departure support',
    phase: 'experience',
    delivered_by: 'Host entity (iCX)',
    mandatory: false,
    yop_question: 'Did you receive written departure support at least 14 days before finishing?',
    answer_options: ['Yes', 'No'],
  },
  {
    std_no: 16,
    name: 'Debrief with AIESEC',
    phase: 'post_experience',
    delivered_by: 'Home entity (oGX)',
    mandatory: false,
    yop_question: 'Did you participate in a debriefing space upon returning home?',
    answer_options: ['Yes', 'No'],
  },
];

export interface StandardCheckWithDef extends StandardCheck {
  name: string;
  phase: FlowStage;
  delivered_by: string;
  mandatory: boolean;
  yop_question?: string | null;
  is_host_standard: boolean;
  is_unproven: boolean;
  is_mismatch: boolean;
}

export interface StandardsSummaryMetrics {
  totalStandards: number;
  hostStandardsTotal: number;
  mandatoryHostTotal: number;
  mandatoryHostDelivered: number;
  mandatoryHostProven: number;
  stdDeliveryPct: number; // Delivered mandatory host ÷ Total mandatory host
  completionReadiness: boolean; // true if all mandatory host standards are delivered AND proofs attached
  unprovenCount: number;
  mismatchCount: number;
  dqIssues: Omit<DqIssue, 'id'>[];
}

export function getStandardDef(stdNo: number): StandardDef | undefined {
  return STATUTORY_STANDARD_DEFS.find((d) => d.std_no === stdNo);
}

/**
 * Checks whether an EP's survey answer is negative (§6.3, DQ-055).
 */
export function isNegativeEpAnswer(stdNo: number, answer?: string | null): boolean {
  if (!answer) return false;
  const clean = answer.trim().toLowerCase();

  if (clean === 'no') return true;
  if (clean.includes('not agreed')) return true;
  if (clean.includes("didn't attend") || clean.includes('did not attend')) return true;

  return false;
}

/**
 * Returns all 16 standards for an exchange merged with statutory metadata.
 */
export function getExchangeStandardsWithDefs(exchangeId: string): StandardCheckWithDef[] {
  const db = getMasterTrackerDb();
  const results: StandardCheckWithDef[] = [];

  for (const def of STATUTORY_STANDARD_DEFS) {
    const rawCheck = db.standardChecks.get(`${exchangeId}:${def.std_no}`);
    const check: StandardCheck = rawCheck ?? {
      exchange_id: exchangeId,
      std_no: def.std_no,
      tracked_status: 'not_started',
      tracked_at: null,
      tracked_by: null,
      proof_id: null,
      ep_reported_answer: null,
      ep_reported_at: null,
    };

    const isHost = def.delivered_by.includes('Host');
    const isUnproven = check.tracked_status === 'delivered' && !check.proof_id;

    // DQ-055 Mismatch detection
    const hasAnswer = check.ep_reported_answer !== null && check.ep_reported_answer !== undefined;
    const isNegative = isNegativeEpAnswer(def.std_no, check.ep_reported_answer);
    const isMismatch =
      (check.tracked_status === 'delivered' && isNegative) ||
      (check.tracked_status === 'not_delivered' && hasAnswer && !isNegative);

    results.push({
      ...check,
      name: def.name,
      phase: def.phase,
      delivered_by: def.delivered_by,
      mandatory: def.mandatory,
      yop_question: def.yop_question,
      is_host_standard: isHost,
      is_unproven: isUnproven,
      is_mismatch: isMismatch,
    });
  }

  return results;
}

export const standardsService = {
  /**
   * Updates AIESEC operational tracking side for a standard (§6.1).
   * Note: Never modifies ep_reported_answer (INV-05).
   */
  updateTrackedStatus(
    exchangeId: string,
    stdNo: number,
    status: StandardTrackedStatus,
    actorId: string,
    proofId?: string | null
  ): StandardCheck {
    const db = getMasterTrackerDb();
    const key = `${exchangeId}:${stdNo}`;
    const existing = db.standardChecks.get(key) ?? {
      exchange_id: exchangeId,
      std_no: stdNo,
      tracked_status: 'not_started',
      tracked_at: null,
      tracked_by: null,
      proof_id: null,
      ep_reported_answer: null,
      ep_reported_at: null,
    };

    const now = new Date().toISOString();
    const updated: StandardCheck = {
      ...existing,
      tracked_status: status,
      tracked_at: now,
      tracked_by: actorId,
      proof_id: proofId !== undefined ? proofId : existing.proof_id,
    };

    db.standardChecks.set(key, updated);

    // Audit log (INV-09)
    db.auditLogs.push({
      id: db.auditLogs.length + 1,
      ts: now,
      actor: actorId,
      action: 'UPDATE_STANDARD_TRACKING',
      table_name: 'standard_check',
      record_id: key,
      before: existing as unknown as Record<string, unknown>,
      after: updated as unknown as Record<string, unknown>,
    });

    return updated;
  },

  /**
   * Imports or records EP's independent Exchange Survey response (§6.1, INV-05).
   * Strictly write-once: cannot be overwritten once set.
   */
  recordEpSurveyResponse(
    exchangeId: string,
    stdNo: number,
    answer: string,
    reportedAt?: string | null
  ): StandardCheck {
    const db = getMasterTrackerDb();
    const key = `${exchangeId}:${stdNo}`;
    const existing = db.standardChecks.get(key) ?? {
      exchange_id: exchangeId,
      std_no: stdNo,
      tracked_status: 'not_started',
      tracked_at: null,
      tracked_by: null,
      proof_id: null,
      ep_reported_answer: null,
      ep_reported_at: null,
    };

    const targetReportedAt = reportedAt ?? new Date().toISOString();

    // Enforce INV-05 Write-Once immutability
    assertEpReportedImmutable(
      existing.ep_reported_answer,
      answer,
      existing.ep_reported_at,
      targetReportedAt
    );

    const updated: StandardCheck = {
      ...existing,
      ep_reported_answer: answer,
      ep_reported_at: targetReportedAt,
    };

    db.standardChecks.set(key, updated);

    // Audit log (INV-09)
    db.auditLogs.push({
      id: db.auditLogs.length + 1,
      ts: targetReportedAt,
      actor: null, // External EP voice
      action: 'IMPORT_EP_SURVEY_RESPONSE',
      table_name: 'standard_check',
      record_id: key,
      before: existing as unknown as Record<string, unknown>,
      after: updated as unknown as Record<string, unknown>,
    });

    return updated;
  },

  /**
   * Computes statutory quality delivery metrics for an exchange (§6.3).
   */
  computeMetrics(exchangeId: string): StandardsSummaryMetrics {
    const standards = getExchangeStandardsWithDefs(exchangeId);
    const hostStandards = standards.filter((s) => s.is_host_standard);
    const mandatoryHost = hostStandards.filter((s) => s.mandatory);

    const mandatoryDelivered = mandatoryHost.filter((s) => s.tracked_status === 'delivered');
    const mandatoryProven = mandatoryDelivered.filter((s) => s.proof_id !== null && s.proof_id !== undefined);

    const unprovenCount = standards.filter((s) => s.is_unproven).length;
    const mismatches = standards.filter((s) => s.is_mismatch);

    const stdDeliveryPct =
      mandatoryHost.length > 0 ? (mandatoryDelivered.length / mandatoryHost.length) * 100 : 0;

    // Completion readiness: all 8 mandatory host standards delivered AND proven
    const completionReadiness = mandatoryHost.length > 0 && mandatoryProven.length === mandatoryHost.length;

    // Generate DQ-055 issues for mismatches
    const dqIssues: Omit<DqIssue, 'id'>[] = mismatches.map((m) => ({
      rule_id: 'DQ-055',
      subject: `Tracked vs EP-reported mismatch on Standard #${m.std_no} (${m.name}) for exchange ${exchangeId}`,
      severity: 'Review',
      detected_at: new Date().toISOString(),
      owner_id: null,
      details: {
        exchange_id: exchangeId,
        std_no: m.std_no,
        standard_name: m.name,
        tracked_status: m.tracked_status,
        ep_reported_answer: m.ep_reported_answer,
        note: 'Review only; EP answer is immutable per INV-05 and must not be altered.',
      },
    }));

    return {
      totalStandards: standards.length,
      hostStandardsTotal: hostStandards.length,
      mandatoryHostTotal: mandatoryHost.length,
      mandatoryHostDelivered: mandatoryDelivered.length,
      mandatoryHostProven: mandatoryProven.length,
      stdDeliveryPct: Number(stdDeliveryPct.toFixed(1)),
      completionReadiness,
      unprovenCount,
      mismatchCount: mismatches.length,
      dqIssues,
    };
  },
};
