/**
 * AIESEC iCX ERP — Stage Required-Field Validator Gates & Transition Guards
 * Author: Wadii Hani <wadii.hani.pro@gmail.com>
 * Specification: iCX_Data_Integrity_Tracking_Spec.md v1.0 (§4.1, §4.2, §5.1, §13.2 DQ-020)
 * Milestone: M1 (Plan 01-02)
 * Enforces: INV-04 (EXPA Authority), INV-07 (ICB Freeze Gate), DQ-020 (Missing Stage Fields)
 */

import type {
  FlowStage,
  ExStatus,
  Exchange,
  OpPartner,
  Opportunity,
  Contract,
  Ep,
  EntityOrg,
  StandardCheck,
  DqIssue,
  StatusHistorySource,
} from '../types/data-integrity';
import { InvariantViolationError } from './invariants';

export interface StageValidationContext {
  exchange: Exchange;
  partner?: OpPartner | null;
  opportunity?: Opportunity | null;
  contract?: Contract | null;
  ep?: Ep | null;
  homeEntity?: EntityOrg | null;
  standardChecks?: StandardCheck[];
  source?: StatusHistorySource;
  hasEpSurveyConfirmation?: boolean;
}

export interface StageValidationResult {
  passed: boolean;
  stage: FlowStage;
  missingFields: string[];
  warnings: string[];
  blockers: string[];
}

/**
 * Maps EXPA lifecycle status to Customer Flow stage (§4.1).
 */
export function statusToFlowStage(status: ExStatus): FlowStage {
  switch (status) {
    case 'APL':
    case 'ACP':
      return 'consideration';
    case 'APD':
      return 'preparation';
    case 'RE':
      return 'experience';
    case 'FI':
    case 'CO':
      return 'post_experience';
    case 'REJECTED':
    case 'WITHDRAWN':
      return 'post_experience';
    default:
      return 'attraction';
  }
}

/**
 * Validates the §5.1 "No Empty Records" matrix for a given flow stage.
 */
export function validateStageRequiredFields(
  stage: FlowStage,
  context: StageValidationContext
): StageValidationResult {
  const missingFields: string[] = [];
  const warnings: string[] = [];
  const blockers: string[] = [];

  const { exchange, partner, opportunity, contract, ep, standardChecks } = context;

  // 1. Attraction Requirements (Base for all stages)
  if (!exchange.owner_id) {
    missingFields.push('exchange.owner_id');
  }

  if (!partner) {
    missingFields.push('partner');
  } else {
    if (!partner.name) missingFields.push('partner.name');
    if (!partner.type) missingFields.push('partner.type');
    if (!partner.city) missingFields.push('partner.city');
    if (!partner.contact_person && !partner.preferred_channel) {
      missingFields.push('partner.contact_person');
    }
    if (partner.expa_org_id === null || partner.expa_org_id === undefined) {
      missingFields.push('partner.expa_org_id');
    }
  }

  // 2. Consideration Requirements (APL, ACP)
  if (
    stage === 'consideration' ||
    stage === 'preparation' ||
    stage === 'experience' ||
    stage === 'post_experience'
  ) {
    if (!opportunity) {
      missingFields.push('opportunity');
    } else {
      if (!opportunity.title) missingFields.push('opportunity.title');
      if (!opportunity.programme) missingFields.push('opportunity.programme');
      if (!opportunity.slots || opportunity.slots <= 0) missingFields.push('opportunity.slots');
      if (!opportunity.duration_weeks) missingFields.push('opportunity.duration_weeks');
      if (!opportunity.hours_per_week) missingFields.push('opportunity.hours_per_week');
      if (!opportunity.benefits || opportunity.benefits.length === 0) {
        missingFields.push('opportunity.benefits');
      }
      if (opportunity.accommodation_provided === undefined) {
        missingFields.push('opportunity.accommodation_provided');
      }
    }

    if (!ep) {
      missingFields.push('ep');
    } else {
      if (!ep.expa_ep_id) missingFields.push('ep.expa_ep_id');
      if (!ep.full_name) missingFields.push('ep.full_name');
      if (!ep.home_entity_id) missingFields.push('ep.home_entity_id');
      if (!ep.contact || Object.keys(ep.contact).length === 0) {
        missingFields.push('ep.contact');
      }
    }
  }

  // 3. Preparation Requirements (APD)
  if (stage === 'preparation' || stage === 'experience' || stage === 'post_experience') {
    if (!contract) {
      missingFields.push('contract');
    } else {
      if (!contract.signed_at) missingFields.push('contract.signed_at');
      if (!contract.payment_terms) missingFields.push('contract.payment_terms');
      if (!contract.key_deadlines || Object.keys(contract.key_deadlines).length === 0) {
        missingFields.push('contract.key_deadlines');
      }
      if (!contract.document_id) missingFields.push('contract.document_id');
    }

    if (!exchange.approved_at) missingFields.push('exchange.approved_at');
    if (!exchange.re_date) missingFields.push('exchange.re_date');

    if (!standardChecks || standardChecks.length < 16) {
      missingFields.push('standard_checks.16_rows_created');
    }
  }

  // 4. Experience Requirements (RE)
  if (stage === 'experience' || stage === 'post_experience') {
    if (!exchange.fi_date) missingFields.push('exchange.fi_date');
  }

  // 5. Post-Experience Requirements (CO)
  if (stage === 'post_experience' && exchange.status === 'CO') {
    if (!context.hasEpSurveyConfirmation) {
      missingFields.push('exchange.ep_survey_confirmation');
    }
  }

  if (missingFields.length > 0) {
    blockers.push(`Missing mandatory fields for stage "${stage}": ${missingFields.join(', ')}`);
  }

  return {
    passed: missingFields.length === 0,
    stage,
    missingFields,
    warnings,
    blockers,
  };
}

/**
 * Validates transition guards before moving an exchange to a new status (§4.2).
 */
export function assertTransitionGuards(
  targetStatus: ExStatus,
  context: StageValidationContext
): void {
  // INV-04: EXPA sync always accepted without local blockers
  if (context.source === 'expa_sync') {
    return;
  }

  // Target flow stage
  const targetStage = statusToFlowStage(targetStatus);

  // Hard Guard: INV-07 (ICB Freeze Gate / T-11)
  // Clause 8.4.3.3.3.5.3: Frozen entities cannot process exchange approvals or realizations
  if (targetStatus === 'APD' || targetStatus === 'RE') {
    if (context.homeEntity?.is_frozen) {
      throw new InvariantViolationError(
        'INV-07',
        `Home entity "${context.homeEntity.name}" is FROZEN by ICB (frozen since: ${context.homeEntity.frozen_since ?? 'N/A'}). Approvals and realizations are prohibited (S9 clause 8.4.3.3.3.5.3).`,
        'INV-07',
        { homeEntityId: context.homeEntity.id, isFrozen: true }
      );
    }
  }

  // Hard Guard: FI -> CO requires EP Survey Confirmation (S1)
  if (targetStatus === 'CO') {
    if (!context.hasEpSurveyConfirmation) {
      throw new InvariantViolationError(
        'GUARD-CO',
        "Status CO (Completed) requires EP's confirmation via Exchange Survey import. Completion is never set manually by AIESEC (S1).",
        'DQ-080'
      );
    }
  }

  // Hard Guard: Required Fields for Target Stage (DQ-020)
  const validation = validateStageRequiredFields(targetStage, context);
  if (!validation.passed) {
    throw new InvariantViolationError(
      'DQ-020',
      `Cannot advance to ${targetStatus} (${targetStage}): mandatory fields are missing: ${validation.missingFields.join(', ')}`,
      'DQ-020',
      { missingFields: validation.missingFields, stage: targetStage }
    );
  }
}

/**
 * Creates a structured DQ-020 data quality issue record.
 */
export function createDq020Issue(
  exchangeId: string,
  stage: FlowStage,
  missingFields: string[],
  ownerId?: string | null,
  isTransitionBlocker = false
): Omit<DqIssue, 'id'> {
  return {
    rule_id: 'DQ-020',
    subject: `Missing required fields for stage ${stage} on exchange ${exchangeId}`,
    severity: isTransitionBlocker ? 'Blocker' : 'Warn',
    detected_at: new Date().toISOString(),
    owner_id: ownerId ?? null,
    details: {
      exchange_id: exchangeId,
      stage,
      missing_fields: missingFields,
      is_transition_blocker: isTransitionBlocker,
    },
  };
}
