/**
 * State Machine SM-01: B2B Partner Sales Pipeline
 * Baseline: REQ-014, REQ-015, TEST-021, and TEST-022
 */

import { validateDiscoveryAnswers, type DiscoveryQuestionnaireAnswers } from './discovery-questionnaire';

export type PipelineStage =
  | 'LEAD'
  | 'CONTACTED'
  | 'MEETING_SCHEDULED'
  | 'DISCOVERY_COMPLETED'
  | 'PROPOSAL_SENT'
  | 'NEGOTIATION'
  | 'CONTRACT_SIGNED'
  | 'CLOSED_LOST';

export interface DealRecord {
  id: string;
  lcId: string;
  organizationId: string;
  stage: PipelineStage;
  dealValue: number;
  product: 'igv' | 'igt' | 'igte';
  assignedTo: string;
  discoveryAnswers?: DiscoveryQuestionnaireAnswers | null;
  history: Array<{
    fromStage: PipelineStage;
    toStage: PipelineStage;
    timestamp: string;
    actorId: string;
    reason?: string;
  }>;
}

export interface TransitionResult {
  success: boolean;
  newStage?: PipelineStage;
  error?: string;
}

// Allowed state transitions graph
const ALLOWED_TRANSITIONS: Record<PipelineStage, PipelineStage[]> = {
  LEAD: ['CONTACTED', 'CLOSED_LOST'],
  CONTACTED: ['MEETING_SCHEDULED', 'CLOSED_LOST'],
  MEETING_SCHEDULED: ['DISCOVERY_COMPLETED', 'CLOSED_LOST'],
  DISCOVERY_COMPLETED: ['PROPOSAL_SENT', 'MEETING_SCHEDULED', 'CLOSED_LOST'],
  PROPOSAL_SENT: ['NEGOTIATION', 'CLOSED_LOST'],
  NEGOTIATION: ['CONTRACT_SIGNED', 'PROPOSAL_SENT', 'CLOSED_LOST'],
  CONTRACT_SIGNED: [], // Terminal won
  CLOSED_LOST: ['LEAD'], // Can reopen lead
};

/**
 * Transitions a deal from its current stage to target stage according to SM-01 rules.
 */
export function transitionDealStage(
  deal: DealRecord,
  targetStage: PipelineStage,
  actorId: string,
  reason?: string
): TransitionResult {
  const currentStage = deal.stage;

  // 1. Check if direct transition exists in graph
  const allowed = ALLOWED_TRANSITIONS[currentStage] || [];
  if (!allowed.includes(targetStage)) {
    return {
      success: false,
      error: `Invalid transition: cannot advance from ${currentStage} directly to ${targetStage}. Stage sequence must be respected.`,
    };
  }

  // 2. Strict Invariant Gate: Transitioning to PROPOSAL_SENT requires complete discovery questionnaire (TEST-022)
  if (targetStage === 'PROPOSAL_SENT') {
    const discoveryCheck = validateDiscoveryAnswers(deal.discoveryAnswers);
    if (!discoveryCheck.isComplete) {
      return {
        success: false,
        error: `Discovery Gate Block (TEST-022): Cannot advance to PROPOSAL_SENT without completing the statutory discovery questionnaire. Violations: ${discoveryCheck.statutoryViolations.join(' ')}`,
      };
    }
  }

  // Record transition
  deal.stage = targetStage;
  deal.history.push({
    fromStage: currentStage,
    toStage: targetStage,
    timestamp: new Date().toISOString(),
    actorId,
    reason,
  });

  return {
    success: true,
    newStage: targetStage,
  };
}
