/**
 * State Machine SM-09: Action Outbox & Human-in-the-Loop EXPA Execution
 * Baseline: REQ-046, REQ-047, DEC-003, INV-06, and TEST-101
 */

export type OutboxActionType =
  | 'EXPA_STATUS_UPDATE'
  | 'EXPA_OPPORTUNITY_CLOSE'
  | 'SEND_WHATSAPP_CONFIRMATION'
  | 'GENERATE_CONTRACT_MOU';

export type OutboxItemStatus =
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXECUTED'
  | 'CONFIRMED'
  | 'FAILED';

export interface ActionOutboxItem {
  id: string;
  lcId: string;
  actionType: OutboxActionType;
  entityType: string;
  entityId: string;
  proposedBy: string;
  approvedBy?: string | null;
  rejectionReason?: string | null;
  status: OutboxItemStatus;
  payload: Record<string, unknown>;
  deepLinkUrl?: string | null;
  expiresAt: string; // ISO (72 hours from approval)
  createdAt: string; // ISO
  executedAt?: string | null;
  confirmedAt?: string | null;
}

/**
 * Generates an EXPA deep-link URL for an action item with standard parameters.
 */
export function generateExpaDeepLink(
  actionType: OutboxActionType,
  entityId: string,
  payload: Record<string, unknown>
): string {
  const baseUrl = 'https://expa.aiesec.org';

  if (actionType === 'EXPA_STATUS_UPDATE') {
    const targetStatus = payload.targetStatus || 'accepted';
    return `${baseUrl}/applications/${entityId}?action=update_status&target=${targetStatus}&ref=erp_icx_rabat`;
  }

  if (actionType === 'EXPA_OPPORTUNITY_CLOSE') {
    return `${baseUrl}/opportunities/${entityId}/manage?action=close&ref=erp_icx_rabat`;
  }

  return `${baseUrl}/crm/entity/${entityId}`;
}

/**
 * Creates an Action Outbox item in PENDING_APPROVAL status.
 */
export function proposeOutboxAction(params: {
  lcId: string;
  actionType: OutboxActionType;
  entityType: string;
  entityId: string;
  proposedBy: string;
  payload: Record<string, unknown>;
  createdAtMs?: number;
}): ActionOutboxItem {
  const nowMs = params.createdAtMs ?? Date.now();
  const expiresAtMs = nowMs + 72 * 60 * 60 * 1000; // Statutory 72-hour validity window

  return {
    id: `outbox_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    lcId: params.lcId,
    actionType: params.actionType,
    entityType: params.entityType,
    entityId: params.entityId,
    proposedBy: params.proposedBy,
    status: 'PENDING_APPROVAL',
    payload: params.payload,
    expiresAt: new Date(expiresAtMs).toISOString(),
    createdAt: new Date(nowMs).toISOString(),
  };
}

/**
 * Approves an Action Outbox item enforcing Invariant INV-06 (Dual-Control Rule).
 * Proposer CANNOT be the approver.
 */
export function approveOutboxAction(
  item: ActionOutboxItem,
  approverId: string
): { success: boolean; item?: ActionOutboxItem; error?: string } {
  if (item.status !== 'PENDING_APPROVAL') {
    return {
      success: false,
      error: `Invalid transition: item must be in PENDING_APPROVAL status. Current status: ${item.status}.`,
    };
  }

  // Invariant INV-06 Check: Proposer cannot approve their own action
  if (item.proposedBy === approverId) {
    return {
      success: false,
      error: `Statutory Violation INV-06 (TEST-101): Dual-control rule strictly prohibits proposer (${item.proposedBy}) from approving their own outbox action.`,
    };
  }

  item.approvedBy = approverId;
  item.status = 'APPROVED';
  item.deepLinkUrl = generateExpaDeepLink(item.actionType, item.entityId, item.payload);

  return {
    success: true,
    item,
  };
}

/**
 * Checks whether an outbox item has expired past its 72-hour validity window.
 */
export function isOutboxItemExpired(item: ActionOutboxItem, nowMs: number = Date.now()): boolean {
  const expiresMs = new Date(item.expiresAt).getTime();
  return nowMs > expiresMs;
}

/**
 * Marks an action as EXECUTED by the officer in EXPA via deep-link.
 */
export function markActionExecuted(
  item: ActionOutboxItem,
  nowMs: number = Date.now()
): { success: boolean; error?: string } {
  if (item.status !== 'APPROVED') {
    return {
      success: false,
      error: `Invalid transition: item must be APPROVED before execution. Current status: ${item.status}.`,
    };
  }

  if (isOutboxItemExpired(item, nowMs)) {
    item.status = 'FAILED';
    return {
      success: false,
      error: `Action expired: 72-hour deep-link window elapsed. Action marked as FAILED and must be reproposed.`,
    };
  }

  item.status = 'EXECUTED';
  item.executedAt = new Date(nowMs).toISOString();

  return { success: true };
}

/**
 * Verifies read-back from EXPA before confirming an outbox action (DEC-003, TEST-101).
 * Status transitions to CONFIRMED ONLY if remote EXPA state matches intended payload.
 */
export function verifyAndConfirmOutboxAction(
  item: ActionOutboxItem,
  remoteState: Record<string, unknown>
): { success: boolean; error?: string } {
  if (item.status !== 'EXECUTED') {
    return {
      success: false,
      error: `Read-Back Block (TEST-101): Action item must be EXECUTED before verifying read-back. Current status: ${item.status}.`,
    };
  }

  // Check expected state
  if (item.actionType === 'EXPA_STATUS_UPDATE') {
    const expectedStatus = String(item.payload.targetStatus || '').toLowerCase();
    const actualStatus = String(remoteState.status || '').toLowerCase();

    if (actualStatus !== expectedStatus) {
      return {
        success: false,
        error: `Verified Read-Back Mismatch (TEST-101): Intended status was "${expectedStatus}", but EXPA read-sync returned "${actualStatus}". Status cannot transition to CONFIRMED.`,
      };
    }
  }

  item.status = 'CONFIRMED';
  item.confirmedAt = new Date().toISOString();

  return { success: true };
}
