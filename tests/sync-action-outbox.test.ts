import { describe, it, expect } from 'vitest';
import {
  INITIAL_SYNC_CURSOR,
  INITIAL_DISCREPANCIES,
  INITIAL_OUTBOX_ACTIONS,
  ExpaSyncEngine,
  type DiscrepancyRecord,
} from '../src/lib/sync/expa-sync-engine';

describe('Phase 7: Integrations & Action Outbox Engine (SM-09)', () => {
  it('tracks EXPA cursor checkpoint and sync health (Plan 07-01)', () => {
    expect(INITIAL_SYNC_CURSOR.lcId).toBe('lc_rabat');
    expect(INITIAL_SYNC_CURSOR.cursorToken).toBeTruthy();
    expect(INITIAL_SYNC_CURSOR.syncHealth).toBe('HEALTHY');
    expect(INITIAL_SYNC_CURSOR.totalRecordsIngested).toBeGreaterThan(0);
  });

  it('enforces justification requirement when preserving local state over remote EXPA', () => {
    const disc: DiscrepancyRecord = {
      id: 'disc_test_1',
      entityType: 'EP',
      entityId: 'ep_100',
      entityTitle: 'Test Participant',
      field: 'status',
      localValue: 'APPROVED',
      remoteValue: 'ACCEPTED',
      detectedAt: '2026-10-28T10:00:00Z',
      resolutionStatus: 'PENDING_REVIEW',
    };

    // Without justification -> blocked
    const resFail = ExpaSyncEngine.reconcileDiscrepancy(disc, 'PRESERVE_LOCAL', '');
    expect(resFail.success).toBe(false);
    expect(resFail.error).toContain('justification note');

    // With valid justification -> succeeds
    const resSuccess = ExpaSyncEngine.reconcileDiscrepancy(disc, 'PRESERVE_LOCAL', 'Visa delay approved by MC');
    expect(resSuccess.success).toBe(true);
    expect(disc.resolutionStatus).toBe('RESOLVED_PRESERVED_LOCAL');
    expect(disc.justification).toBe('Visa delay approved by MC');
  });

  it('generates Action Outbox card when queueing reconciliation to EXPA (Plan 07-02)', () => {
    const disc: DiscrepancyRecord = {
      id: 'disc_test_2',
      entityType: 'EP',
      entityId: 'ep_200',
      entityTitle: 'Sofia Martinez',
      field: 'status',
      localValue: 'REALIZED',
      remoteValue: 'APPROVED',
      detectedAt: '2026-10-28T10:00:00Z',
      resolutionStatus: 'PENDING_REVIEW',
    };

    const res = ExpaSyncEngine.reconcileDiscrepancy(disc, 'QUEUE_OUTBOX');
    expect(res.success).toBe(true);
    expect(res.outboxCard).toBeDefined();
    expect(res.outboxCard?.actionType).toBe('STATUS_TRANSITION');
    expect(res.outboxCard?.expaDeepLinkUrl).toContain('experience.aiesec.org');
    expect(res.outboxCard?.status).toBe('PENDING');
  });

  it('validates initial Action Outbox cards adhering to DEC-003', () => {
    expect(INITIAL_OUTBOX_ACTIONS.length).toBeGreaterThanOrEqual(2);
    INITIAL_OUTBOX_ACTIONS.forEach((card) => {
      expect(card.expaDeepLinkUrl).toContain('https://');
      expect(card.assignedOfficerName).toBeTruthy();
      expect(card.guidanceText).toBeTruthy();
    });
  });
});
