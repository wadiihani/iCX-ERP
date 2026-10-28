/**
 * Reconciliation Queue & Conflict Resolution Subsystem
 * Baseline: REQ-105, DEC-003, TEST-097, and TEST-098
 */

import { proposeOutboxAction, type ActionOutboxItem } from './outbox-machine';

export interface DiscrepancyItem {
  id: string;
  lcId: string;
  entityType: 'APPLICATION' | 'OPPORTUNITY';
  entityId: string;
  expaId: string;
  field: string;
  localValue: unknown;
  remoteValue: unknown;
  detectedAt: string;
  status: 'PENDING_REVIEW' | 'RESOLVED_ACCEPT_REMOTE' | 'RESOLVED_PRESERVE_LOCAL' | 'RESOLVED_QUEUE_CORRECTION';
  resolvedBy?: string | null;
  resolvedAt?: string | null;
  resolutionNote?: string | null;
}

export interface SideBySideDiff {
  entityId: string;
  entityType: string;
  fields: Array<{
    name: string;
    local: unknown;
    remote: unknown;
    isDifferent: boolean;
  }>;
}

/**
 * Builds a side-by-side comparison between local record and remote EXPA payload.
 */
export function buildSideBySideDiff(
  entityId: string,
  entityType: string,
  localRecord: Record<string, unknown>,
  remoteRecord: Record<string, unknown>
): SideBySideDiff {
  const allKeys = Array.from(new Set([...Object.keys(localRecord), ...Object.keys(remoteRecord)]));
  const fields = allKeys.map((key) => {
    const local = localRecord[key];
    const remote = remoteRecord[key];
    const isDifferent = JSON.stringify(local) !== JSON.stringify(remote);

    return {
      name: key,
      local,
      remote,
      isDifferent,
    };
  });

  return {
    entityId,
    entityType,
    fields: fields.filter((f) => f.isDifferent),
  };
}

/**
 * Resolves a discrepancy by accepting remote EXPA state.
 */
export function resolveAcceptRemote(
  item: DiscrepancyItem,
  resolvedBy: string,
  note?: string
): { success: boolean; item: DiscrepancyItem; updatedLocalValue: unknown } {
  item.status = 'RESOLVED_ACCEPT_REMOTE';
  item.resolvedBy = resolvedBy;
  item.resolvedAt = new Date().toISOString();
  item.resolutionNote = note || 'Accepted EXPA remote authority.';

  return {
    success: true,
    item,
    updatedLocalValue: item.remoteValue,
  };
}

/**
 * Resolves a discrepancy by preserving local planning state (with justification note).
 */
export function resolvePreserveLocal(
  item: DiscrepancyItem,
  resolvedBy: string,
  justification: string
): { success: boolean; item: DiscrepancyItem } {
  if (!justification || justification.trim().length < 5) {
    throw new Error('A valid justification note (minimum 5 chars) is mandatory when overriding remote EXPA state.');
  }

  item.status = 'RESOLVED_PRESERVE_LOCAL';
  item.resolvedBy = resolvedBy;
  item.resolvedAt = new Date().toISOString();
  item.resolutionNote = justification;

  return {
    success: true,
    item,
  };
}

/**
 * Resolves a discrepancy by queuing a correction in the Action Outbox.
 */
export function resolveQueueCorrection(
  item: DiscrepancyItem,
  resolvedBy: string
): { success: boolean; item: DiscrepancyItem; outboxItem: ActionOutboxItem } {
  item.status = 'RESOLVED_QUEUE_CORRECTION';
  item.resolvedBy = resolvedBy;
  item.resolvedAt = new Date().toISOString();
  item.resolutionNote = 'Queued outbound correction in Action Outbox.';

  const outboxItem = proposeOutboxAction({
    lcId: item.lcId,
    actionType: 'EXPA_STATUS_UPDATE',
    entityType: item.entityType,
    entityId: item.expaId,
    proposedBy: resolvedBy,
    payload: {
      targetStatus: item.localValue,
      correctionReason: 'Align EXPA state with verified Local Committee operational record',
    },
  });

  return {
    success: true,
    item,
    outboxItem,
  };
}
