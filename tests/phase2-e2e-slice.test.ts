import { describe, it, expect } from 'vitest';
import { buildRawStagingEntries } from '../src/lib/expa/sync-engine';
import { ExpaRateLimiter } from '../src/lib/expa/rate-limiter';
import {
  proposeOutboxAction,
  approveOutboxAction,
  markActionExecuted,
  verifyAndConfirmOutboxAction,
} from '../src/lib/outbox/outbox-machine';
import { transitionEpStage, type EpFunnelApplication } from '../src/lib/funnel/ep-funnel-machine';
import { validatePassportForMorocco } from '../src/lib/funnel/passport-validator';
import { evaluateScorecard } from '../src/lib/funnel/scorecard';
import { getMoroccanVisaRegime, checkVisaLeadTime } from '../src/lib/ir/moroccan-visa-matrix';
import {
  generateSharedOpportunityToken,
  isSharedTokenValid,
} from '../src/lib/ir/shared-view-token';
import {
  evaluateFirstContactSla,
  evaluatePreArrivalHardLock,
  evaluateUnreachableEpSafetyProtocol,
} from '../src/lib/sla/sla-engine';
import { dispatchSlaEscalation } from '../src/lib/sla/escalation-dispatcher';
import { computeStatutoryKpis } from '../src/lib/analytics/kpi-engine';

describe('Phase 2: EXPA Read-Sync, EP Funnel & SLA Engine E2E Vertical Slice', () => {
  it('executes the complete unbroken Phase 2 operational lifecycle from EXPA sync to KPI aggregation', () => {
    // =========================================================================
    // STEP 1: EXPA Read-Sync Ingestion into Untouched Staging (DEC-003, REQ-042..043)
    // =========================================================================
    const limiter = new ExpaRateLimiter(40);
    expect(limiter.tryAcquire()).toBe(true);

    const mockExpaNode = {
      id: 'EXPA-APP-998822',
      status: 'applied',
      created_at: '2026-10-26T08:00:00Z',
      person: {
        id: 'EXPA-PER-7766',
        full_name: 'Camilla Valenti',
        email: 'camilla.valenti@aiesec.net',
        home_lc: { name: 'AIESEC in Rome', country: 'Italy' },
      },
      opportunity: {
        id: 'OPP-RABAT-001',
        title: 'EcoRabat Sustainability Champion',
      },
    };

    const staged = buildRawStagingEntries('BATCH-2026-001', 'LC_RABAT', [mockExpaNode]);

    expect(staged).toHaveLength(1);
    expect(staged[0].remoteId).toBe('EXPA-APP-998822');
    expect(staged[0].rawJson).toEqual(mockExpaNode);
    expect(staged[0].entityType).toBe('APPLICATION');

    // =========================================================================
    // STEP 2: First-Contact SLA Timer Inception (AUTO-010, THR-002, REQ-048)
    // =========================================================================
    const firstContactSla = evaluateFirstContactSla(
      mockExpaNode.created_at,
      null, // not yet contacted
      new Date('2026-10-26T12:00:00Z') // 4 business hours elapsed
    );

    expect(firstContactSla.isBreached).toBe(false);
    expect(firstContactSla.urgency).toBe('NORMAL');
    expect(firstContactSla.hoursElapsed).toBe(4);
    expect(firstContactSla.hoursAllowed).toBe(24);

    // =========================================================================
    // STEP 3: Passport PII Minimisation & Moroccan Invariants (DEC-010, REQ-044)
    // =========================================================================
    const passportValidation = validatePassportForMorocco({
      rawPassportNumber: 'IT987654321',
      issuingCountryCode: 'IT',
      expirationDate: '2027-06-30', // > 6 months after Nov 2026
      projectEndDate: '2026-11-15',
    });

    expect(passportValidation.isValidForEntry).toBe(true);
    expect(passportValidation.maskedNumber).toBe('IT*******21');
    expect(passportValidation.monthsValidBeyondProject).toBeGreaterThanOrEqual(6);

    // =========================================================================
    // STEP 4: IR Partner Visa Regime Check (THR-047, REQ-032, TEST-041)
    // =========================================================================
    const visaRegime = getMoroccanVisaRegime('IT');
    expect(visaRegime.regime).toBe('VISA_EXEMPT');
    expect(visaRegime.requiresInvitationPack).toBe(false);

    const leadTimeValidation = checkVisaLeadTime('IT', '2026-10-26', '2026-11-15');
    expect(leadTimeValidation.isCompliant).toBe(true);

    // =========================================================================
    // STEP 5: Revocable Shared Opportunity View for Sending LC (REQ-046, TEST-043)
    // =========================================================================
    const tokenRecord = generateSharedOpportunityToken({
      opportunityId: 'OPP-RABAT-001',
      lcId: 'LC_RABAT',
      createdBy: 'vp-igv-rabat',
      targetPartnerId: 'LC-ROME-ITALY',
      validityDays: 14,
    });
    expect(tokenRecord.token).toHaveLength(64);
    expect(isSharedTokenValid(tokenRecord).isValid).toBe(true);

    // =========================================================================
    // STEP 6: EP Funnel Matching & Scorecard Interview Gate (SM-04, REQ-045, THR-042)
    // =========================================================================
    const scorecardMetrics = {
      languageProficiency: 90,
      sdgMotivationAndAlignment: 90,
      availabilityAndCommitment: 85,
      culturalAdaptability: 95,
      interviewerId: 'INT-01',
      interviewDate: '2026-10-26T14:00:00Z',
    };

    const scorecard = evaluateScorecard(scorecardMetrics);
    expect(scorecard.compositeScore).toBe(90.0); // >= 70% threshold
    expect(scorecard.passed).toBe(true);

    const app: EpFunnelApplication = {
      id: 'APP-RABAT-2026-001',
      lcId: 'LC_RABAT',
      opportunityId: 'OPP-RABAT-001',
      epName: 'Camilla Valenti',
      epEmail: 'camilla.valenti@aiesec.net',
      homeCountry: 'IT',
      stage: 'APPLIED',
      screeningScorecard: scorecardMetrics,
      opInterviewScorecard: scorecardMetrics,
      passportRecord: passportValidation,
      history: [],
    };

    // Progress through screening and interview stages
    expect(transitionEpStage(app, 'SCREENED', 'user-lead').success).toBe(true);
    expect(transitionEpStage(app, 'OP_INTERVIEW_SCHEDULED', 'user-lead').success).toBe(true);
    expect(transitionEpStage(app, 'OP_INTERVIEWED', 'user-lead').success).toBe(true);
    expect(transitionEpStage(app, 'ACCEPTED', 'user-lead').success).toBe(true);
    expect(app.stage).toBe('ACCEPTED');

    // =========================================================================
    // STEP 7: Action Outbox Generation & Read-Back Verification (SM-09, REQ-046/105)
    // =========================================================================
    const outboxItem = proposeOutboxAction({
      lcId: 'LC_RABAT',
      actionType: 'EXPA_STATUS_UPDATE',
      entityType: 'Application',
      entityId: 'APP-RABAT-2026-001',
      proposedBy: 'user-member-rabat',
      payload: { targetStatus: 'accepted' },
    });
    expect(outboxItem.status).toBe('PENDING_APPROVAL');

    // Dual-control approval (INV-06)
    const approvalRes = approveOutboxAction(outboxItem, 'user-vp-rabat');
    expect(approvalRes.success).toBe(true);
    expect(outboxItem.status).toBe('APPROVED');
    expect(outboxItem.deepLinkUrl).toContain('https://expa.aiesec.org');

    // Execution via human-in-the-loop deep-link
    const execRes = markActionExecuted(outboxItem);
    expect(execRes.success).toBe(true);
    expect(outboxItem.status).toBe('EXECUTED');

    // Verified read-back before status confirmation (DEC-003, TEST-101)
    const confirmRes = verifyAndConfirmOutboxAction(outboxItem, { status: 'accepted' });
    expect(confirmRes.success).toBe(true);
    expect(outboxItem.status).toBe('CONFIRMED');

    // =========================================================================
    // STEP 8: Approval & T-14 Day Pre-Arrival Hard Lock (AUTO-018, THR-010)
    // =========================================================================
    expect(transitionEpStage(app, 'APPROVED', 'user-vp').success).toBe(true);
    expect(app.stage).toBe('APPROVED');

    // Evaluate T-14 Lock when Bed Allocation is still missing
    const hardLockEvaluation = evaluatePreArrivalHardLock({
      realizationStartDate: '2026-11-05T00:00:00Z', // 10 days away (<= 14)
      currentDateMs: new Date('2026-10-26T00:00:00Z').getTime(),
      hasBedAllocated: false,
      hasFlightTicketVerified: true,
      isVisaCleared: true,
    });

    expect(hardLockEvaluation.isHardLockActive).toBe(true);
    expect(hardLockEvaluation.isArrivalCleared).toBe(false);
    expect(hardLockEvaluation.missingItems).toContain('Confirmed Bed Allocation (Standard #8)');

    // Allocate bed and re-evaluate clearance
    const clearedEvaluation = evaluatePreArrivalHardLock({
      realizationStartDate: '2026-11-05T00:00:00Z',
      currentDateMs: new Date('2026-10-26T00:00:00Z').getTime(),
      hasBedAllocated: true,
      hasFlightTicketVerified: true,
      isVisaCleared: true,
    });
    expect(clearedEvaluation.isArrivalCleared).toBe(true);

    // =========================================================================
    // STEP 9: Unreachable EP Protocol & Escalation Dispatcher (AUTO-022, REQ-052)
    // =========================================================================
    const safetyCheck = evaluateUnreachableEpSafetyProtocol({
      lastContactTimestamp: '2026-10-23T10:00:00Z',
      currentTimestampMs: new Date('2026-10-26T10:00:00Z').getTime(), // 72 hours idle
    });
    expect(safetyCheck.isCrisisEscalated).toBe(true);

    const dispatch = dispatchSlaEscalation({
      applicationId: 'APP-RABAT-2026-001',
      epName: 'Camilla Valenti',
      slaName: '48h Unreachable Safety Protocol',
      urgency: 'CRITICAL_150',
      hoursElapsed: 72,
      hoursAllowed: 48,
      isCrisis: true,
    });

    expect(dispatch.highestTier).toBe('LCP');
    expect(dispatch.dispatchedTiers).toEqual(['MEMBER', 'TEAM_LEADER', 'VP_IGV', 'LCP']);
    expect(dispatch.recipients.find((r) => r.role === 'LCP')?.channel).toBe('WHATSAPP_CRISIS');

    // =========================================================================
    // STEP 10: Sub-100ms KPI Engine Aggregation Across Tenant (REQ-090..098)
    // =========================================================================
    const startTimeMs = performance.now();
    const kpiMetrics = computeStatutoryKpis([
      {
        applicationId: 'APP-RABAT-2026-001',
        epName: 'Camilla Valenti',
        lcId: 'LC_RABAT',
        appliedAt: '2026-10-26T08:00:00Z',
        firstContactedAt: '2026-10-26T12:00:00Z',
        acceptedAt: '2026-10-27T10:00:00Z',
        approvedAt: '2026-10-28T14:00:00Z',
        realizedAt: '2026-11-05T09:00:00Z',
        completedAt: null,
        scorecardScore: 90,
        hasBedAllocated: true,
        hasFlightVerified: true,
        isVisaCleared: true,
        daysToArrival: 10,
        isUnreachableCrisis: false,
        contractValueMad: 5000,
        contractStatus: 'DEPOSIT_PAID',
        outboxResolvedInHours: 2,
        standardsDeliveredCount: 16,
      },
    ]);
    const durationMs = performance.now() - startTimeMs;

    expect(durationMs).toBeLessThan(100); // Sub-100ms requirement
    expect(kpiMetrics.firstContactSlaAdherencePct).toBe(100);
    expect(kpiMetrics.avgScreeningScorecard).toBe(90);
    expect(kpiMetrics.t14ArrivalReadinessRatePct).toBe(100);
    expect(kpiMetrics.actionOutboxResolutionAvgHours).toBe(2);
    expect(kpiMetrics.contractRevenueRealizedMad).toBe(5000);
  });
});
