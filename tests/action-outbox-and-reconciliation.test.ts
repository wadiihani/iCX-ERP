import { describe, it, expect } from 'vitest';
import {
  proposeOutboxAction,
  approveOutboxAction,
  markActionExecuted,
  verifyAndConfirmOutboxAction,
  isOutboxItemExpired,
  generateExpaDeepLink,
  type ActionOutboxItem,
} from '../src/lib/outbox/outbox-machine';
import {
  buildSideBySideDiff,
  resolveAcceptRemote,
  resolvePreserveLocal,
  resolveQueueCorrection,
  type DiscrepancyItem,
} from '../src/lib/outbox/reconciliation';

describe('Plan 02-02: Action Outbox & Reconciliation Queue', () => {
  describe('TEST-101: Action Outbox SM-09 Lifecycle & Dual-Control Rule (INV-06)', () => {
    it('proposes an action with 72-hour validity and blocks self-approval', () => {
      const now = 1700000000000;
      const item = proposeOutboxAction({
        lcId: 'lc_rabat_001',
        actionType: 'EXPA_STATUS_UPDATE',
        entityType: 'APPLICATION',
        entityId: 'app-991',
        proposedBy: 'user_vp_igv',
        payload: { targetStatus: 'accepted' },
        createdAtMs: now,
      });

      expect(item.status).toBe('PENDING_APPROVAL');
      expect(item.proposedBy).toBe('user_vp_igv');

      // Check 72h expiry
      const expectedExpiryMs = now + 72 * 60 * 60 * 1000;
      expect(new Date(item.expiresAt).getTime()).toBe(expectedExpiryMs);
      expect(isOutboxItemExpired(item, now)).toBe(false);
      expect(isOutboxItemExpired(item, now + 73 * 60 * 60 * 1000)).toBe(true);

      // Invariant INV-06: Proposer cannot approve
      const selfApprove = approveOutboxAction(item, 'user_vp_igv');
      expect(selfApprove.success).toBe(false);
      expect(selfApprove.error).toContain('Statutory Violation INV-06 (TEST-101)');
      expect(item.status).toBe('PENDING_APPROVAL');
    });

    it('approves action by independent officer and generates verified deep-link', () => {
      const item = proposeOutboxAction({
        lcId: 'lc_rabat_001',
        actionType: 'EXPA_STATUS_UPDATE',
        entityType: 'APPLICATION',
        entityId: 'app-991',
        proposedBy: 'user_vp_igv',
        payload: { targetStatus: 'accepted' },
      });

      // LCP approves
      const approved = approveOutboxAction(item, 'user_lcp_rabat');
      expect(approved.success).toBe(true);
      expect(item.status).toBe('APPROVED');
      expect(item.approvedBy).toBe('user_lcp_rabat');
      expect(item.deepLinkUrl).toContain('https://expa.aiesec.org/applications/app-991');
      expect(item.deepLinkUrl).toContain('target=accepted');
    });

    it('enforces verified read-back before transitioning to CONFIRMED (DEC-003, TEST-101)', () => {
      const item = proposeOutboxAction({
        lcId: 'lc_rabat_001',
        actionType: 'EXPA_STATUS_UPDATE',
        entityType: 'APPLICATION',
        entityId: 'app-991',
        proposedBy: 'user_vp_igv',
        payload: { targetStatus: 'accepted' },
      });
      approveOutboxAction(item, 'user_lcp_rabat');
      markActionExecuted(item);
      expect(item.status).toBe('EXECUTED');

      // Attempt confirm with mismatched remote state
      const mismatchedReadBack = verifyAndConfirmOutboxAction(item, { status: 'applied' });
      expect(mismatchedReadBack.success).toBe(false);
      expect(mismatchedReadBack.error).toContain('Verified Read-Back Mismatch (TEST-101)');
      expect(item.status).toBe('EXECUTED');

      // Confirm with matching remote state
      const matchingReadBack = verifyAndConfirmOutboxAction(item, { status: 'accepted' });
      expect(matchingReadBack.success).toBe(true);
      expect(item.status).toBe('CONFIRMED');
      expect(item.confirmedAt).toBeDefined();
    });
  });

  describe('TEST-097 & TEST-098: Reconciliation Queue & Conflict Resolution', () => {
    it('builds a side-by-side property diff between local and remote states', () => {
      const local = { status: 'approved', ep_name: 'Sara Benali', notes: 'Host assigned' };
      const remote = { status: 'withdrawn', ep_name: 'Sara Benali' };

      const diff = buildSideBySideDiff('app-501', 'APPLICATION', local, remote);
      expect(diff.fields.length).toBe(2);

      const statusField = diff.fields.find((f) => f.name === 'status');
      expect(statusField?.local).toBe('approved');
      expect(statusField?.remote).toBe('withdrawn');
    });

    it('resolves discrepancy by accepting remote EXPA state', () => {
      const item: DiscrepancyItem = {
        id: 'disc-1',
        lcId: 'lc_rabat_001',
        entityType: 'APPLICATION',
        entityId: 'local-app-1',
        expaId: 'app-991',
        field: 'status',
        localValue: 'approved',
        remoteValue: 'withdrawn',
        detectedAt: new Date().toISOString(),
        status: 'PENDING_REVIEW',
      };

      const res = resolveAcceptRemote(item, 'user_officer', 'EP confirmed direct withdrawal');
      expect(res.success).toBe(true);
      expect(res.item.status).toBe('RESOLVED_ACCEPT_REMOTE');
      expect(res.updatedLocalValue).toBe('withdrawn');
    });

    it('resolves discrepancy by preserving local state with mandatory justification', () => {
      const item: DiscrepancyItem = {
        id: 'disc-2',
        lcId: 'lc_rabat_001',
        entityType: 'APPLICATION',
        entityId: 'local-app-2',
        expaId: 'app-992',
        field: 'status',
        localValue: 'approved',
        remoteValue: 'applied',
        detectedAt: new Date().toISOString(),
        status: 'PENDING_REVIEW',
      };

      // Empty justification rejected
      expect(() => resolvePreserveLocal(item, 'user_officer', '')).toThrow();

      // Valid justification accepted
      const res = resolvePreserveLocal(item, 'user_officer', 'OP interview passed, awaiting partner manual stamp');
      expect(res.success).toBe(true);
      expect(res.item.status).toBe('RESOLVED_PRESERVE_LOCAL');
      expect(res.item.resolutionNote).toContain('OP interview passed');
    });

    it('resolves discrepancy by queuing an Action Outbox correction item', () => {
      const item: DiscrepancyItem = {
        id: 'disc-3',
        lcId: 'lc_rabat_001',
        entityType: 'APPLICATION',
        entityId: 'local-app-3',
        expaId: 'app-993',
        field: 'status',
        localValue: 'accepted',
        remoteValue: 'applied',
        detectedAt: new Date().toISOString(),
        status: 'PENDING_REVIEW',
      };

      const res = resolveQueueCorrection(item, 'user_officer');
      expect(res.success).toBe(true);
      expect(res.item.status).toBe('RESOLVED_QUEUE_CORRECTION');
      expect(res.outboxItem).toBeDefined();
      expect(res.outboxItem.actionType).toBe('EXPA_STATUS_UPDATE');
      expect(res.outboxItem.payload.targetStatus).toBe('accepted');
    });
  });
});
