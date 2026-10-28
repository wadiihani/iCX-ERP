/**
 * State Machine SM-02: Opportunity Lifecycle Machine
 * Baseline: REQ-023, THR-012, and TEST-026, TEST-028
 */

export type OpportunityStatus =
  | 'DRAFT'
  | 'UNDER_REVIEW'
  | 'OPEN'
  | 'APPLICATIONS_OPEN'
  | 'MATCHED'
  | 'REALIZED'
  | 'COMPLETED'
  | 'CLOSED';

export interface OpportunityLifecycleRecord {
  id: string;
  lcId: string;
  organizationId: string;
  title: string;
  status: OpportunityStatus;
  createdAt: string; // ISO
  submittedForReviewAt?: string | null; // ISO
  approvedAt?: string | null;
  assignedManagerId?: string | null;
  totalOpenings: number;
  availableOpenings: number;
  history: Array<{
    fromStatus: OpportunityStatus;
    toStatus: OpportunityStatus;
    timestamp: string;
    actorId: string;
    reason?: string;
  }>;
}

const ALLOWED_OPPORTUNITY_TRANSITIONS: Record<OpportunityStatus, OpportunityStatus[]> = {
  DRAFT: ['UNDER_REVIEW', 'CLOSED'],
  UNDER_REVIEW: ['OPEN', 'DRAFT', 'CLOSED'],
  OPEN: ['APPLICATIONS_OPEN', 'CLOSED'],
  APPLICATIONS_OPEN: ['MATCHED', 'CLOSED'],
  MATCHED: ['REALIZED', 'APPLICATIONS_OPEN', 'CLOSED'],
  REALIZED: ['COMPLETED'],
  COMPLETED: ['CLOSED'],
  CLOSED: ['DRAFT'], // Can reopen as draft
};

/**
 * Transitions an opportunity through SM-02 stages.
 */
export function transitionOpportunityStatus(
  opportunity: OpportunityLifecycleRecord,
  targetStatus: OpportunityStatus,
  actorId: string,
  reason?: string
): { success: boolean; newStatus?: OpportunityStatus; error?: string } {
  const currentStatus = opportunity.status;
  const allowed = ALLOWED_OPPORTUNITY_TRANSITIONS[currentStatus] || [];

  if (!allowed.includes(targetStatus)) {
    return {
      success: false,
      error: `Invalid transition: cannot change opportunity status from ${currentStatus} directly to ${targetStatus}.`,
    };
  }

  // Update timestamps
  if (targetStatus === 'UNDER_REVIEW') {
    opportunity.submittedForReviewAt = new Date().toISOString();
  } else if (targetStatus === 'OPEN') {
    opportunity.approvedAt = new Date().toISOString();
  }

  opportunity.status = targetStatus;
  opportunity.history.push({
    fromStatus: currentStatus,
    toStatus: targetStatus,
    timestamp: new Date().toISOString(),
    actorId,
    reason,
  });

  return {
    success: true,
    newStatus: targetStatus,
  };
}

/**
 * Checks the 7-Day Account Manager Review SLA (THR-012 & TEST-028).
 * An opportunity in UNDER_REVIEW status for more than 7 days triggers an SLA warning & escalation.
 */
export function checkOpportunityReviewSLA(
  opportunity: OpportunityLifecycleRecord,
  currentTimestampMs: number = Date.now()
): { isBreached: boolean; daysPending: number; warning?: string } {
  if (opportunity.status !== 'UNDER_REVIEW' || !opportunity.submittedForReviewAt) {
    return { isBreached: false, daysPending: 0 };
  }

  const submittedMs = new Date(opportunity.submittedForReviewAt).getTime();
  const diffMs = currentTimestampMs - submittedMs;
  const daysPending = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const isBreached = daysPending >= 7;

  return {
    isBreached,
    daysPending,
    warning: isBreached
      ? `SLA Breach THR-012 (TEST-028): Opportunity "${opportunity.title}" has been pending review for ${daysPending} days (threshold: 7 days). Escalation task generated for VP iGV.`
      : undefined,
  };
}
