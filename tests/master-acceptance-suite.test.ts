/**
 * AIESEC iCX ERP — Master Acceptance Test Suite (T-01 through T-20)
 * Author: Wadii Hani <wadii.hani.pro@gmail.com>
 * Specification: iCX_Data_Integrity_Tracking_Spec.md v1.0 (§16 Acceptance Tests, §18 DoD)
 * Milestone: M8 (Plan 08-04)
 * Covers: 100% of the 20 Statutory Acceptance Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import type {
  Member,
  Ep,
  ActorContext,
} from '../src/lib/types/data-integrity';
import {
  assertNoHardDelete,
  assertEpReportedImmutable,
  assertAppendOnly,
  InvariantViolationError,
} from '../src/lib/data-integrity/invariants';
import {
  partnerService,
  exchangeService,
  epService,
  entityService,
  opportunityService,
  getMasterTrackerDb,
  resetMasterTrackerDb,
} from '../src/lib/data-integrity/master-tracker';
import {
  syncExpaBatch,
  resetImportBatches,
} from '../src/lib/data-integrity/expa-sync';
import {
  standardsService,
} from '../src/lib/data-integrity/standards-service';
import {
  statusGovernanceService,
  resetStatusRequestDb,
} from '../src/lib/data-integrity/status-governance';
import {
  statusValidatorService,
  evaluateApdPastReDate,
  StatusRequestChecklistError,
} from '../src/lib/data-integrity/status-validators';
import {
  deadlineEngine,
} from '../src/lib/data-integrity/deadline-engine';
import {
  qualityCaseService,
  resetQualityCasesDb,
} from '../src/lib/data-integrity/quality-cases';
import {
  complianceService,
  resetComplianceDb,
} from '../src/lib/data-integrity/compliance-calendar';
import {
  disasterRecoveryService,
  ScratchDatabaseState,
} from '../src/lib/data-integrity/disaster-recovery';
import {
  handoffWorkflowService,
  resetHandoffDb,
} from '../src/lib/data-integrity/handoff-workflow';
import {
  ownershipService,
} from '../src/lib/data-integrity/ownership-service';
import {
  fullExportService,
} from '../src/lib/data-integrity/full-export';
import {
  proofVaultService,
  resetProofVaultDb,
} from '../src/lib/data-integrity/proof-vault';
import {
  validateDurationWeeks,
} from '../src/lib/data-integrity/rules';
import {
  sanitizeEpForViewer,
} from '../src/lib/data-integrity/rbac';
import {
  dataQualityService,
  resetDataQualityDb,
} from '../src/lib/data-integrity/data-quality';

describe('AIESEC iCX ERP — Master Acceptance Test Suite (§16 T-01..T-20)', () => {
  const actorAdmin = 'mem-wadii-001';
  const actorMember = 'mem-sara-002';
  const incomingOwner = 'mem-omar-003';

  beforeEach(() => {
    resetMasterTrackerDb();
    resetQualityCasesDb();
    resetComplianceDb();
    resetHandoffDb();
    resetDataQualityDb();
    resetProofVaultDb();
    resetStatusRequestDb();
    resetImportBatches();
    disasterRecoveryService.clearSnapshotArchive();
  });

  // ===========================================================================
  // T-01: Prohibit Hard Delete (INV-01, DQ-081)
  // ===========================================================================
  it('T-01: Given any business row, when DELETE is attempted, then fails and DQ-081 is logged', () => {
    expect(() => {
      assertNoHardDelete('exchange', 'ex-101', actorMember);
    }).toThrowError(InvariantViolationError);

    try {
      assertNoHardDelete('exchange', 'ex-101', actorMember);
    } catch (err: any) {
      expect(err.code).toBe('INV-01');
      expect(err.ruleId).toBe('DQ-081');
      expect(err.message).toContain('Hard deletes are strictly forbidden');
    }
  });

  // ===========================================================================
  // T-02: Status History Append-Only (INV-02)
  // ===========================================================================
  it('T-02: Given status change, status_history has matching row; manual UPDATE of history fails', () => {
    const partner = partnerService.createPartner(
      {
        name: 'Casablanca Tech Academy',
        type: 'company',
        city: 'Casablanca',
        contact_person: 'Mehdi',
        channel: 'email',
        owner_id: actorMember,
        expa_org_id: 12345,
      },
      actorAdmin
    );

    const opp = opportunityService.createOpportunity(
      {
        op_id: partner.id,
        programme: 'GV',
        title: 'Project Lead',
        slots: 5,
        duration_weeks: 6,
        hours_per_week: 30,
        benefits: ['acc'],
        accommodation_provided: true,
      },
      actorAdmin,
      '2026-06-01'
    );

    const ep = epService.createEp(
      {
        expa_ep_id: 112233,
        full_name: 'Alex Johnson',
        home_entity_id: 'lc-athens',
        contact: { email: 'alex@example.com' },
        owner_id: actorMember,
      },
      actorAdmin
    );

    const { exchange } = exchangeService.createExchange(
      {
        ep_id: ep.id,
        opportunity_id: opp.id,
        programme: 'GV',
        owner_id: actorMember,
        status: 'applied',
      },
      actorAdmin
    );

    // Transition status to approved
    const { historyEntry } = exchangeService.transitionStatus(
      exchange.id,
      'approved',
      {
        actorId: actorAdmin,
        reason: 'Manual approval test',
      }
    );

    expect(historyEntry.to_status).toBe('approved');
    expect(historyEntry.by_member).toBe(actorAdmin);

    const masterDb = getMasterTrackerDb();
    const history = masterDb.statusHistories.filter((h) => h.exchange_id === exchange.id);
    expect(history.length).toBeGreaterThanOrEqual(1);

    // Manual UPDATE of status_history must be rejected (INV-02)
    expect(() => {
      assertAppendOnly('status_history', 'UPDATE');
    }).toThrowError(InvariantViolationError);
  });

  // ===========================================================================
  // T-03: EP-Reported Survey Answers Immutable (INV-05)
  // ===========================================================================
  it('T-03: Given ep_reported_answer set, when anyone updates it, then rejected (INV-05)', () => {
    const partner = partnerService.createPartner(
      { name: 'P T03', type: 'NGO', city: 'Rabat', owner_id: actorMember, stage: 'agreement', preferred_channel: 'call', expa_org_id: 4321 },
      actorAdmin
    );
    const opp = opportunityService.createOpportunity(
      { op_id: partner.id, programme: 'GV', title: 'Opp T03', slots: 5, duration_weeks: 6, hours_per_week: 30, benefits: ['acc'], accommodation_provided: true },
      actorAdmin
    );
    const ep = epService.createEp(
      { expa_ep_id: 888999, full_name: 'Elena Gilbert', home_entity_id: 'lc-athens', contact: { email: 'elena@test.com' }, owner_id: actorMember },
      actorAdmin
    );
    const { exchange } = exchangeService.createExchange(
      { ep_id: ep.id, opportunity_id: opp.id, programme: 'GV', status: 'APD', owner_id: actorMember },
      actorMember
    );

    // Record EP survey response
    standardsService.recordEpSurveyResponse(exchange.id, 4, 'Yes', '2026-11-03T10:00:00Z');

    // Overwrite attempt by anyone must throw InvariantViolationError (INV-05)
    expect(() => {
      standardsService.recordEpSurveyResponse(exchange.id, 4, 'No', '2026-11-03T11:00:00Z');
    }).toThrowError(/INV-05.*write-once immutable/i);
  });

  // ===========================================================================
  // T-04: EXPA Import Row-Drop Quarantine Guard (DQ-082)
  // ===========================================================================
  it('T-04: Given EXPA import with 10% fewer rows than previous batch, then batch is quarantined and DQ-082 raised', () => {
    // 1. Initial successful batch with 20 rows
    const rowsInitial = Array.from({ length: 20 }, (_, i) => ({
      expa_ep_id: 1000 + i,
      full_name: `EP ${i}`,
      status: 'APD' as const,
    }));
    const res1 = syncExpaBatch({
      rawContent: 'initial-batch-data',
      rows: rowsInitial,
      actorId: actorAdmin,
    });
    expect(res1.status).toBe('applied');

    // 2. Incoming batch with 15 rows (25% drop > 5% threshold)
    const rowsDropped = rowsInitial.slice(0, 15);
    const res2 = syncExpaBatch({
      rawContent: 'dropped-batch-data',
      rows: rowsDropped,
      actorId: actorAdmin,
      customThresholdPct: 5,
    });

    expect(res2.quarantined).toBe(true);
    expect(res2.status).toBe('quarantined');
    expect(res2.dqIssues.some((i) => i.rule_id === 'DQ-082')).toBe(true);
  });

  // ===========================================================================
  // T-05: EXPA Status Reconciliation (INV-04, DQ-040)
  // ===========================================================================
  it('T-05: Given EXPA says RE and tracker says APD, when sync runs, tracker adopts RE with history logged and DQ-040 auto-resolved', () => {
    const partner = partnerService.createPartner(
      { name: 'Partner Rec', type: 'NGO', city: 'Rabat', owner_id: actorMember, stage: 'agreement', preferred_channel: 'call', expa_org_id: 1234 },
      actorAdmin
    );
    const opp = opportunityService.createOpportunity(
      { op_id: partner.id, programme: 'GV', title: 'Opp Rec', slots: 5, duration_weeks: 6, hours_per_week: 30, benefits: ['acc'], accommodation_provided: true },
      actorAdmin,
      '2026-06-01'
    );
    const ep = epService.createEp(
      { expa_ep_id: 887711, full_name: 'Camilla Brown', home_entity_id: 'lc-london', contact: { email: 'camilla@test.com' }, owner_id: actorMember },
      actorAdmin
    );

    const { exchange } = exchangeService.createExchange(
      { ep_id: ep.id, opportunity_id: opp.id, programme: 'GV', status: 'APD', owner_id: actorMember },
      actorMember
    );
    expect(exchange.status).toBe('APD');

    // EXPA Sync incoming row with status 'RE'
    const syncRes = syncExpaBatch({
      rawContent: 'reconciliation-test',
      rows: [
        {
          expa_ep_id: 887711,
          full_name: 'Camilla Brown',
          status: 'RE',
        },
      ],
      actorId: actorAdmin,
    });

    expect(syncRes.reconciledCount).toBe(1);

    // Tracker adopts RE
    const updated = exchangeService.getExchange(exchange.id);
    expect(updated?.status).toBe('RE');

    // History logged with source 'expa_sync'
    const masterDb = getMasterTrackerDb();
    const history = masterDb.statusHistories.filter((h) => h.exchange_id === exchange.id);
    const syncHistory = history.find((h) => h.source === 'expa_sync');
    expect(syncHistory).toBeDefined();
    expect(syncHistory?.to_status).toBe('RE');

    // DQ-040 auto-resolved
    const dq40 = syncRes.dqIssues.find((i) => i.rule_id === 'DQ-040');
    expect(dq40).toBeDefined();
    expect(dq40?.resolved_at).toBeDefined();
  });

  // ===========================================================================
  // T-06: Deactivated Owner Detection (DQ-011)
  // ===========================================================================
  it('T-06: Given a record owner is deactivated, then DQ-011 fires and a handoff task is created for their manager', () => {
    const activeMember: Member = {
      id: 'mem-act-01',
      name: 'Active Sarah',
      role: 'member',
      active: true,
      created_at: new Date().toISOString(),
    };
    const deactivatedMember: Member = {
      id: 'mem-deact-02',
      name: 'Deactivated Yassine',
      role: 'member',
      active: false, // Inactive
      created_at: new Date().toISOString(),
    };

    const records = [
      {
        id: 'partner-deact-test',
        owner_id: deactivatedMember.id,
        type: 'op_partner',
        manager_id: 'mem-manager-99',
      },
    ];

    const scan = ownershipService.scanOrphanAndInactiveOwners(
      [activeMember, deactivatedMember],
      records
    );

    expect(scan.issues.some((i) => i.rule_id === 'DQ-011')).toBe(true);
    expect(scan.handoffTasks).toHaveLength(1);
    expect(scan.handoffTasks[0].assigned_manager_id).toBe('mem-manager-99');
    expect(scan.handoffTasks[0].status).toBe('pending');
  });

  // ===========================================================================
  // T-07: Early-FI Missing LC2LC PDF Blocked
  // ===========================================================================
  it('T-07: Given early-FI request missing the LC2LC PDF, when moved to submitted, then blocked naming missing item', () => {
    const { exchange } = exchangeService.createExchange(
      {
        ep_id: 'EP-T07',
        opportunity_id: 'OP-T07',
        programme: 'GV',
        owner_id: actorMember,
        status: 'RE',
      },
      actorAdmin
    );

    const req = statusGovernanceService.createStatusRequest(
      {
        id: 'req-early-fi-t07',
        exchange_id: exchange.id,
        ep_id: 'EP-T07',
        kind: 'early_fi',
        desired_date: '2026-12-01',
        reason: 'University semester begins earlier than anticipated',
        apip_clause_ref: 'APIP 4.1.2',
        owner_id: actorMember,
      },
      actorMember
    );

    // Attempting submission without LC2LC PDF must throw StatusRequestChecklistError
    try {
      statusGovernanceService.submitRequestWithChecklistValidation(
        req.id,
        actorMember,
        'ZD-T07-001',
        { submittedAt: '2026-11-10T10:00:00Z' }
      );
      expect.unreachable('Should have failed due to missing LC2LC PDF');
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(StatusRequestChecklistError);
      const chkErr = err as StatusRequestChecklistError;
      expect(chkErr.missingItems.some((i) => i.includes('proof_lc2lc_email_pdf'))).toBe(true);
    }
  });

  // ===========================================================================
  // T-08: Early-FI Desired Finish < 7 Days Timing Gate
  // ===========================================================================
  it('T-08: Given early-FI desired finish in 5 days, then timing_ok = false (needs >= 7 days)', () => {
    const submitDate = '2026-11-20T10:00:00Z';
    const finishIn5Days = '2026-11-25';

    const { exchange } = exchangeService.createExchange(
      {
        ep_id: 'EP-T08',
        opportunity_id: 'OP-T08',
        programme: 'GV',
        owner_id: actorMember,
        status: 'RE',
        fi_date: '2026-12-15',
      },
      actorAdmin
    );

    const req = statusGovernanceService.createStatusRequest(
      {
        id: 'req-early-fi-t08',
        exchange_id: exchange.id,
        ep_id: 'EP-T08',
        kind: 'early_fi',
        desired_date: finishIn5Days,
        reason: 'Early exams',
        apip_clause_ref: 'APIP 4.3',
        owner_id: actorMember,
      },
      actorMember
    );

    const validation = statusValidatorService.validateEarlyFi(req, exchange, submitDate);
    expect(validation.evaluatedChecklist['timing_ok']).toBe(false);
    expect(validation.missingItems.some((i) => i.includes('timing_ok'))).toBe(true);
  });

  // ===========================================================================
  // T-09: Extension Finish < 14 Days Timing Gate
  // ===========================================================================
  it('T-09: Given extension with finish in 10 days, then timing_ok = false (needs >= 14 days)', () => {
    const submitDate = '2026-12-05T10:00:00Z';
    const originalFinish = '2026-12-15'; // Only 10 days left

    const { exchange } = exchangeService.createExchange(
      {
        ep_id: 'EP-T09',
        opportunity_id: 'OP-T09',
        programme: 'GV',
        owner_id: actorMember,
        status: 'RE',
        fi_date: originalFinish,
      },
      actorAdmin
    );

    const req = statusGovernanceService.createStatusRequest(
      {
        id: 'req-ext-t09',
        exchange_id: exchange.id,
        ep_id: 'EP-T09',
        kind: 'extension_fi',
        desired_date: '2026-12-30',
        reason: 'Project continuation',
        apip_clause_ref: 'APIP 5.1',
        owner_id: actorMember,
      },
      actorMember
    );

    const validation = statusValidatorService.validateExtensionFi(req, exchange, submitDate);
    expect(validation.evaluatedChecklist['timing_ok']).toBe(false);
    expect(validation.missingItems.some((i) => i.includes('timing_ok'))).toBe(true);
  });

  // ===========================================================================
  // T-10: APD with RE Date Passed > 21 Days (GV) Direct Break
  // ===========================================================================
  it('T-10: Given an APD whose re_date passed 21 days ago (GV), then DQ-052 is urgent and direct break is offered', () => {
    const { exchange } = exchangeService.createExchange(
      {
        ep_id: 'EP-T10',
        opportunity_id: 'opp-t10',
        programme: 'GV',
        status: 'APD',
        re_date: '2026-10-10',
        owner_id: actorMember,
      },
      actorAdmin
    );

    // Evaluate on 2026-10-31 (21 days past re_date)
    const evaluation = evaluateApdPastReDate(exchange, '2026-10-31');

    expect(evaluation.isApdPastRe).toBe(true);
    expect(evaluation.daysPassed).toBe(21);
    expect(evaluation.isUrgentDq052).toBe(true);
    expect(evaluation.directBreakEligible).toBe(true);
    expect(evaluation.dqIssue?.rule_id).toBe('DQ-052');
    expect(evaluation.dqIssue?.severity).toBe('Urgent');

    // Create break request: validates without requiring PDF proofs
    const breakReq = statusGovernanceService.createStatusRequest(
      {
        id: 'req-break-t10',
        exchange_id: exchange.id,
        ep_id: 'EP-T10',
        kind: 'break_apd',
        reason: 'EP never arrived, 21 days past RE',
        owner_id: actorMember,
      },
      actorMember
    );

    const val = statusValidatorService.validateBreakRequest(
      breakReq,
      exchange,
      evaluation.directBreakEligible
    );

    expect(val.isValid).toBe(true);
  });

  // ===========================================================================
  // T-11: Frozen Entity Blocks Approvals (INV-07)
  // ===========================================================================
  it('T-11: Given entity is_frozen, when user tries to process an approval, then blocked with ICB reference', () => {
    const frozenEntity = entityService.createEntity(
      {
        name: 'AIESEC in Athens',
        kind: 'LC',
        country: 'Greece',
        is_frozen: true,
        frozen_since: '2026-04-01T00:00:00Z',
      },
      actorAdmin
    );

    const partner = partnerService.createPartner(
      {
        name: 'P Frozen',
        type: 'NGO',
        city: 'Rabat',
        owner_id: actorMember,
        stage: 'agreement',
        preferred_channel: 'call',
        expa_org_id: 9911,
      },
      actorAdmin
    );

    const opp = opportunityService.createOpportunity(
      {
        op_id: partner.id,
        programme: 'GV',
        title: 'Opp Frozen',
        slots: 5,
        duration_weeks: 6,
        hours_per_week: 30,
        benefits: ['acc'],
        accommodation_provided: true,
      },
      actorAdmin,
      '2026-06-01'
    );

    const ep = epService.createEp(
      {
        expa_ep_id: 777111,
        full_name: 'Kostas P',
        home_entity_id: frozenEntity.id,
        contact: { email: 'kostas@test.com' },
        owner_id: actorMember,
      },
      actorAdmin
    );

    const { exchange } = exchangeService.createExchange(
      {
        ep_id: ep.id,
        opportunity_id: opp.id,
        programme: 'GV',
        status: 'APL',
        owner_id: actorMember,
      },
      actorMember
    );

    // Attempting approval (APD) on a frozen entity must throw InvariantViolationError (INV-07)
    expect(() => {
      exchangeService.transitionStatus(exchange.id, 'APD', {
        actorId: actorMember,
        reason: 'Attempting approval',
      });
    }).toThrowError(InvariantViolationError);

    try {
      exchangeService.transitionStatus(exchange.id, 'APD', {
        actorId: actorMember,
        reason: 'Attempting approval',
      });
    } catch (err: any) {
      expect(err.code).toBe('INV-07');
      expect(err.message).toContain('is FROZEN by ICB');
    }
  });

  // ===========================================================================
  // T-12: Approval Day 0 with Visa Required and No Visa Docs on Day 15
  // ===========================================================================
  it('T-12: Given approval on day 0 with visa required and no visa docs on day 15, then DQ-053 urgent', () => {
    const partner = partnerService.createPartner(
      { name: 'P T12', type: 'NGO', city: 'Rabat', owner_id: actorMember, stage: 'agreement', preferred_channel: 'call', expa_org_id: 8822 },
      actorAdmin
    );
    const opp = opportunityService.createOpportunity(
      { op_id: partner.id, programme: 'GV', title: 'Opp T12', slots: 5, duration_weeks: 6, hours_per_week: 30, benefits: ['acc'], accommodation_provided: true },
      actorAdmin
    );
    const ep = epService.createEp(
      { expa_ep_id: 121212, full_name: 'Carlos Visa', home_entity_id: 'lc-bogota', contact: { email: 'carlos@test.com' }, owner_id: actorMember },
      actorAdmin
    );

    const { exchange } = exchangeService.createExchange(
      {
        ep_id: ep.id,
        opportunity_id: opp.id,
        programme: 'GV',
        owner_id: actorMember,
        status: 'APD',
        approved_at: '2026-11-01', // Day 0
        re_date: '2026-12-01',
        fi_date: '2027-01-15',
      },
      actorAdmin
    );

    // Day 14 check: due date, not breached yet
    const day14 = deadlineEngine.evaluateExchangeDeadlines(exchange, '2026-11-15');
    expect(day14.dqIssues.some((i) => i.rule_id === 'DQ-053')).toBe(false);

    // Day 15 check: breached, DQ-053 Urgent!
    const day15 = deadlineEngine.evaluateExchangeDeadlines(exchange, '2026-11-16');
    const dq53 = day15.dqIssues.find((i) => i.rule_id === 'DQ-053');
    expect(dq53).toBeDefined();
    expect(dq53?.severity).toBe('Urgent');
  });

  // ===========================================================================
  // T-13: Case with Compensation > 0 Missing Financial Proof Blocked (DQ-071)
  // ===========================================================================
  it('T-13: Given case with compensation > 0 and no financial proof, when closing, then blocked (DQ-071)', () => {
    const { exchange } = exchangeService.createExchange(
      {
        ep_id: 'ep-t13',
        opportunity_id: 'opp-t13',
        programme: 'GV',
        status: 'RE',
        owner_id: actorMember,
      },
      actorAdmin
    );

    const qCase = qualityCaseService.createCase(
      {
        exchange_id: exchange.id,
        title: 'Damaged luggage reimbursement',
        description: 'Luggage damaged during official project airport pickup.',
        classification: 'expectation_gap',
        compensation_amount: 800,
        compensation_type: 'reimbursement',
        owner_id: actorMember,
      },
      actorAdmin
    );

    // Attempting close without financial proof must be blocked with DQ-071
    expect(() => {
      qualityCaseService.closeCase(
        qCase.id,
        {
          final_agreement_id: 'doc-agreement-ep-001',
          financial_proof_id: '', // MISSING
          closure_notes: 'Reimbursement agreed and signed',
        },
        actorAdmin
      );
    }).toThrowError(/DQ-071.*cannot be closed without financial_proof_id/i);
  });

  // ===========================================================================
  // T-14: Last Night's Snapshot Restores to Scratch DB with Matching Checksums
  // ===========================================================================
  it('T-14: Given last nights snapshot, when restored to a scratch DB, then row counts and checksums match manifest', () => {
    partnerService.createPartner(
      {
        name: 'Dar America Rabat',
        type: 'ngo',
        city: 'Rabat',
        contact_person: 'Leila',
        channel: 'meeting',
        owner_id: actorMember,
      },
      actorAdmin
    );

    const snapshot = disasterRecoveryService.createNightlySnapshot();
    const scratchDb: ScratchDatabaseState = { tables: new Map() };

    const { verification } = disasterRecoveryService.restoreToScratchDb(snapshot, scratchDb);

    expect(verification.success).toBe(true);
    expect(verification.discrepancies).toHaveLength(0);
    expect(verification.totalRestoredRows).toBe(snapshot.manifest.totalRows);
  });

  // ===========================================================================
  // T-15: Handoff Ownership Transfer Ack Gate
  // ===========================================================================
  it('T-15: Given a handoff, when incoming owner has not acknowledged, then ownership does not transfer', () => {
    partnerService.createPartner(
      {
        name: 'Handoff Ack Test Partner',
        type: 'school',
        city: 'Rabat',
        contact_person: 'Fatima',
        channel: 'call',
        owner_id: actorMember,
      },
      actorAdmin
    );

    const handoff = handoffWorkflowService.initiateHandoff(
      actorMember,
      incomingOwner,
      'individual',
      actorAdmin
    );

    // Attempting bulk transfer before incoming owner acknowledgment must throw T-15 error
    expect(() => {
      handoffWorkflowService.executeTransfer(handoff.id, actorAdmin);
    }).toThrowError(InvariantViolationError);

    // Acknowledge by incoming owner
    handoffWorkflowService.acknowledgeByIncoming(handoff.id, incomingOwner);

    // Now succeeds
    const res = handoffWorkflowService.executeTransfer(handoff.id, actorAdmin);
    expect(res.handoff.status).toBe('transferred');
    expect(res.transferredCounts.partners).toBe(1);
  });

  // ===========================================================================
  // T-16: Versioned Rules Evaluation (INV-08 & v2.0 Q8)
  // ===========================================================================
  it('T-16: Given GV opportunity, validates [4, 6, 8] allowed values; evaluates legacy 6-8 rule with fixture (INV-08, Q8)', () => {
    // Under 2026 rule (v2.0 Q8): allowed values [4, 6, 8] weeks; 5 and 7 are invalid
    expect(validateDurationWeeks('GV', 4, '2026-06-01').valid).toBe(true);
    expect(validateDurationWeeks('GV', 6, '2026-06-01').valid).toBe(true);
    expect(validateDurationWeeks('GV', 8, '2026-06-01').valid).toBe(true);
    expect(validateDurationWeeks('GV', 5, '2026-06-01').valid).toBe(false);
    expect(validateDurationWeeks('GV', 7, '2026-06-01').valid).toBe(false);

    // Under legacy fixture rule: 6-8 weeks min/max -> 5 weeks FAILS
    const legacyFixture: RuleRegistryEntry[] = [
      {
        key: 'gv.duration_weeks',
        value: { min: 6, max: 8 },
        effective_from: '2020-01-01',
        effective_to: '2025-12-31',
        source: 'S1, S7 (Legacy fixture)',
        note: 'Legacy GV duration rule (6-8 weeks)',
      },
    ];
    const rule2025 = validateDurationWeeks('GV', 5, '2025-06-01', legacyFixture);
    expect(rule2025.valid).toBe(false);
    expect(rule2025.min).toBe(6);
    expect(rule2025.max).toBe(8);
  });

  // ===========================================================================
  // T-17: Partner Without Touchpoint for 36 Days Warns (DQ-060)
  // ===========================================================================
  it('T-17: Given partner with no touchpoint for 36 days, then DQ-060 warns', () => {
    const touchpoint36DaysAgo = new Date('2026-10-15T12:00:00Z').toISOString();

    const partner = partnerService.createPartner(
      {
        name: 'Stale Partner Association',
        type: 'association',
        city: 'Rabat',
        contact_person: 'Brahim',
        channel: 'meeting',
        owner_id: actorMember,
        last_touchpoint_at: touchpoint36DaysAgo,
      },
      actorAdmin
    );

    const scanResult = dataQualityService.runDataQualityScan({
      now: new Date('2026-11-20T12:00:00Z'),
    });
    const dq60 = scanResult.openIssues.find((i) => i.rule_id === 'DQ-060' && i.record_id === partner.id);

    expect(dq60).toBeDefined();
    expect(dq60?.severity).toBe('Warn');
    expect(dq60?.subject).toContain('>35d');
  });

  // ===========================================================================
  // T-18: Member Role EP Contact Data Redaction (INV-10)
  // ===========================================================================
  it('T-18: Given a viewer with role member, then EP contact fields of others records are redacted', () => {
    const rawEp: Ep = {
      id: 'ep-confidential-01',
      expa_ep_id: 998877,
      full_name: 'Jessica Alba',
      home_entity_id: 'lc-lisbon',
      contact: {
        email: 'jessica@example.com',
        phone: '+351 912 345 678',
        whatsapp: '+351 912 345 678',
      },
      owner_id: 'mem-other-99',
      created_at: new Date().toISOString(),
    };

    const viewerMember: ActorContext = {
      id: 'mem-viewer-01',
      role: 'member',
      team_id: 'team-sales',
    };

    const sanitized = sanitizeEpForViewer(rawEp, viewerMember);
    expect(sanitized.contact.email).toBe('[REDACTED]');
    expect(sanitized.contact.phone).toBe('[REDACTED]');
    expect(sanitized.contact.whatsapp).toBe('[REDACTED]');
    expect(sanitized.full_name).toBe('Jessica Alba'); // Name preserved
  });

  // ===========================================================================
  // T-19: CSV Export Writes Audit Log (INV-09, T-19)
  // ===========================================================================
  it('T-19: Given any CSV export, then an audit_log row records actor, scope, row count', () => {
    const initialLogCount = getMasterTrackerDb().auditLogs.length;

    const res = fullExportService.exportTableCsv('op_partner', actorAdmin, 'audit_compliance');

    expect(res.rowCount).toBeDefined();
    const logs = getMasterTrackerDb().auditLogs;
    expect(logs.length).toBe(initialLogCount + 1);

    const logEntry = logs[logs.length - 1];
    expect(logEntry.action).toBe('CSV_EXPORT');
    expect(logEntry.actor).toBe(actorAdmin);
    expect(logEntry.after?.scope).toBe('audit_compliance');
    expect(logEntry.after?.row_count).toBe(res.rowCount);
  });

  // ===========================================================================
  // T-20: Drive Proof Link 404 Flagged by Nightly Scanner (DQ-083)
  // ===========================================================================
  it('T-20: Given a Drive proof link that returns 404, then DQ-083 flags it within one nightly run', async () => {
    const doc = proofVaultService.registerProofDocument(
      {
        file_name: 'passport_scan.pdf',
        mime_type: 'application/pdf',
        file_size_bytes: 102400,
        drive_url: 'https://drive.google.com/file/d/test-doc-404/view',
        sha256_hash: 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        uploaded_by: actorMember,
      },
      actorAdmin
    );

    // Mock ping handler returning 404 (dead link)
    const scan = await proofVaultService.runNightlyDeadLinkScan((url) => {
      if (url.includes('test-doc-404')) {
        return { status: 404 };
      }
      return { status: 200 };
    });

    expect(scan.deadLinksCount).toBe(1);
    expect(scan.dqIssues).toHaveLength(1);
    expect(scan.dqIssues[0].rule_id).toBe('DQ-083');
    expect(scan.dqIssues[0].severity).toBe('Warn');

    const updatedDoc = proofVaultService.getProofDocument(doc.id);
    expect(updatedDoc?.verification_status).toBe('dead_link');
  });
});
