/**
 * AIESEC iCX ERP — Data Integrity Invariants & Enforcement
 * Author: Wadii Hani <wadii.hani.pro@gmail.com>
 * Specification: iCX_Data_Integrity_Tracking_Spec.md v1.0 (§2, §3.3)
 * Milestone: M0 (Plan 00-02)
 */

import type {
  ExStatus,
  BreakType,
  Exchange,
  StatusHistory,
  StatusHistorySource,
  DqIssue,
} from '../types/data-integrity';

export class InvariantViolationError extends Error {
  public readonly code: string;
  public readonly ruleId?: string;
  public readonly details?: Record<string, unknown>;

  constructor(
    code: string,
    message: string,
    ruleId?: string,
    details?: Record<string, unknown>
  ) {
    super(`[${code}] ${message}`);
    this.name = 'InvariantViolationError';
    this.code = code;
    this.ruleId = ruleId;
    this.details = details;
  }
}

/**
 * INV-01: Prohibit physical deletion on business records.
 * Raises InvariantViolationError and creates a DQ-081 blocker issue payload.
 */
export function assertNoHardDelete(
  tableName: string,
  recordId: string,
  actorId?: string | null
): never {
  const error = new InvariantViolationError(
    'INV-01',
    `Hard deletes are strictly forbidden on table "${tableName}". Soft delete by setting deleted_at and deleted_reason instead (Rule DQ-081).`,
    'DQ-081',
    { tableName, recordId, actorId }
  );
  throw error;
}

/**
 * Creates a structured DQ-081 issue record when a hard-delete attempt is intercepted.
 */
export function createDq081Issue(
  tableName: string,
  recordId: string,
  actorId?: string | null
): Omit<DqIssue, 'id'> {
  return {
    rule_id: 'DQ-081',
    subject: `Attempted hard-delete on table ${tableName} (record: ${recordId})`,
    severity: 'Blocker',
    detected_at: new Date().toISOString(),
    owner_id: actorId ?? null,
    details: {
      table_name: tableName,
      record_id: recordId,
      attempted_at: new Date().toISOString(),
      action: 'DELETE',
    },
  };
}

/**
 * INV-02: Enforce append-only ledger immutability on audit_log and status_history.
 */
export function assertAppendOnly(
  tableName: string,
  operation: 'UPDATE' | 'DELETE'
): void {
  if (tableName === 'status_history' || tableName === 'audit_log') {
    throw new InvariantViolationError(
      'INV-02',
      `Table "${tableName}" is an immutable append-only ledger. ${operation} operations are strictly forbidden.`,
      'INV-02',
      { tableName, operation }
    );
  }
}

/**
 * INV-05: Enforce immutability of EP-reported answers (write-once).
 */
export function assertEpReportedImmutable(
  existingAnswer: string | null | undefined,
  newAnswer: string | null | undefined,
  existingReportedAt?: string | null,
  newReportedAt?: string | null
): void {
  if (existingAnswer !== null && existingAnswer !== undefined && existingAnswer !== '') {
    if (newAnswer !== existingAnswer || (existingReportedAt && newReportedAt !== existingReportedAt)) {
      throw new InvariantViolationError(
        'INV-05',
        'ep_reported_answer and ep_reported_at are write-once immutable fields. Once recorded, EP survey answers cannot be modified or influenced.',
        'INV-05',
        { existingAnswer, newAnswer, existingReportedAt, newReportedAt }
      );
    }
  }
}

/**
 * Creates soft-delete fields payload for legitimate deletions.
 */
export function createSoftDeletePayload(
  actorId: string,
  reason: string
): { deleted_at: string; deleted_reason: string } {
  if (!reason || reason.trim() === '') {
    throw new Error('Soft delete requires an explicit deleted_reason');
  }
  return {
    deleted_at: new Date().toISOString(),
    deleted_reason: `[${actorId}] ${reason.trim()}`,
  };
}

/**
 * DQ-080: Status Transition Synchronizer
 * Prepares an atomic exchange update along with the required matching status_history row.
 */
export function prepareStatusTransition(
  currentExchange: Exchange,
  toStatus: ExStatus,
  options?: {
    actorId?: string | null;
    source?: StatusHistorySource;
    reason?: string | null;
    proofId?: string | null;
    breakType?: BreakType | null;
  }
): {
  updatedExchange: Exchange;
  historyEntry: Omit<StatusHistory, 'id'>;
} {
  const fromStatus = currentExchange.status;
  const breakType = options?.breakType ?? currentExchange.break_type ?? null;
  const now = new Date().toISOString();

  const updatedExchange: Exchange = {
    ...currentExchange,
    status: toStatus,
    break_type: breakType,
  };

  const historyEntry: Omit<StatusHistory, 'id'> = {
    exchange_id: currentExchange.id,
    from_status: fromStatus,
    to_status: toStatus,
    break_type: breakType,
    at: now,
    by_member: options?.actorId ?? currentExchange.owner_id,
    source: options?.source ?? 'manual',
    reason: options?.reason ?? `Transitioned from ${fromStatus} to ${toStatus}`,
    proof_id: options?.proofId ?? null,
  };

  return {
    updatedExchange,
    historyEntry,
  };
}
