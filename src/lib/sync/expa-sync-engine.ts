export interface SyncCursor {
  lcId: string;
  lastSyncedAt: string;
  cursorToken: string;
  totalRecordsIngested: number;
  syncHealth: 'HEALTHY' | 'DEGRADED' | 'FAILED';
  lastError?: string;
}

export interface DiscrepancyRecord {
  id: string;
  entityType: 'EP' | 'OPPORTUNITY' | 'APPLICATION';
  entityId: string;
  entityTitle: string;
  field: string;
  localValue: string | number;
  remoteValue: string | number;
  detectedAt: string;
  resolutionStatus: 'PENDING_REVIEW' | 'RESOLVED_ACCEPTED_REMOTE' | 'RESOLVED_PRESERVED_LOCAL' | 'QUEUED_TO_OUTBOX';
  justification?: string;
}

export interface OutboxActionCard {
  id: string;
  actionType: 'STATUS_TRANSITION' | 'SLOT_CREATION' | 'ACCEPTANCE_NOTE_UPLOAD' | 'REJECTION_LOG';
  entityType: 'EP' | 'OPPORTUNITY';
  entityId: string;
  entityTitle: string;
  targetStatus: string;
  expaDeepLinkUrl: string;
  status: 'PENDING' | 'EXECUTED_CONFIRMED' | 'DISMISSED';
  queuedAt: string;
  expiryCountdown: string;
  assignedOfficerName: string;
  guidanceText: string;
}

export const INITIAL_SYNC_CURSOR: SyncCursor = {
  lcId: 'lc_rabat',
  lastSyncedAt: '2026-10-27T22:30:00Z',
  cursorToken: 'cursor_expa_v2_9921448',
  totalRecordsIngested: 142,
  syncHealth: 'HEALTHY',
};

export const INITIAL_DISCREPANCIES: DiscrepancyRecord[] = [
  {
    id: 'disc_001',
    entityType: 'EP',
    entityId: 'ep_2026_090',
    entityTitle: 'Lucas Silva (iGTa Software Intern)',
    field: 'status',
    localValue: 'ACCEPTED',
    remoteValue: 'APPROVED',
    detectedAt: '2026-10-27T22:30:00Z',
    resolutionStatus: 'PENDING_REVIEW',
  },
  {
    id: 'disc_002',
    entityType: 'OPPORTUNITY',
    entityId: 'opp-1',
    entityTitle: 'Youth Digital Literacy & Coding Coach',
    field: 'availableOpenings',
    localValue: 3,
    remoteValue: 2,
    detectedAt: '2026-10-27T22:30:00Z',
    resolutionStatus: 'PENDING_REVIEW',
  },
];

export const INITIAL_OUTBOX_ACTIONS: OutboxActionCard[] = [
  {
    id: 'outbox_001',
    actionType: 'STATUS_TRANSITION',
    entityType: 'EP',
    entityId: 'ep_2026_081',
    entityTitle: 'Sofia Martinez',
    targetStatus: 'REALIZED',
    expaDeepLinkUrl: 'https://experience.aiesec.org/#/applications/892144',
    status: 'PENDING',
    queuedAt: '2026-10-27T16:00:00Z',
    expiryCountdown: '48h SLA',
    assignedOfficerName: 'Amina Benali (VP CXP)',
    guidanceText: 'Click deep-link to open EP profile in EXPA. Click "Realize" button and confirm Day-1 arrival timestamp.',
  },
  {
    id: 'outbox_002',
    actionType: 'STATUS_TRANSITION',
    entityType: 'EP',
    entityId: 'ep_2026_077',
    entityTitle: 'Lukas Schneider',
    targetStatus: 'APPROVED',
    expaDeepLinkUrl: 'https://experience.aiesec.org/#/applications/884210',
    status: 'PENDING',
    queuedAt: '2026-10-25T14:30:00Z',
    expiryCountdown: '24h SLA',
    assignedOfficerName: 'Sara Kabbaj (BD Host)',
    guidanceText: 'Partner contract and visa note verified locally. Confirm approval on EXPA to lock opportunity slot.',
  },
];

export class ExpaSyncEngine {
  public static reconcileDiscrepancy(
    discrepancy: DiscrepancyRecord,
    action: 'ACCEPT_REMOTE' | 'PRESERVE_LOCAL' | 'QUEUE_OUTBOX',
    justification?: string
  ): { success: boolean; outboxCard?: OutboxActionCard; error?: string } {
    if (action === 'PRESERVE_LOCAL') {
      if (!justification || justification.trim().length < 5) {
        return {
          success: false,
          error: 'Statutory rule: A valid justification note (minimum 5 characters) is required to preserve local state against remote EXPA data.',
        };
      }
      discrepancy.resolutionStatus = 'RESOLVED_PRESERVED_LOCAL';
      discrepancy.justification = justification.trim();
      return { success: true };
    }

    if (action === 'ACCEPT_REMOTE') {
      discrepancy.resolutionStatus = 'RESOLVED_ACCEPTED_REMOTE';
      discrepancy.localValue = discrepancy.remoteValue;
      return { success: true };
    }

    if (action === 'QUEUE_OUTBOX') {
      discrepancy.resolutionStatus = 'QUEUED_TO_OUTBOX';
      const outboxCard: OutboxActionCard = {
        id: `outbox_${Date.now()}`,
        actionType: 'STATUS_TRANSITION',
        entityType: discrepancy.entityType as 'EP' | 'OPPORTUNITY',
        entityId: discrepancy.entityId,
        entityTitle: discrepancy.entityTitle,
        targetStatus: String(discrepancy.localValue),
        expaDeepLinkUrl: `https://experience.aiesec.org/#/${discrepancy.entityType.toLowerCase()}s/${discrepancy.entityId}`,
        status: 'PENDING',
        queuedAt: new Date().toISOString(),
        expiryCountdown: '48h SLA',
        assignedOfficerName: 'Current Officer',
        guidanceText: `Execute reconciliation update on EXPA to align remote ${discrepancy.field} with verified local state.`,
      };
      return { success: true, outboxCard };
    }

    return { success: false, error: 'Unknown reconciliation action' };
  }
}
