import { describe, it, expect } from 'vitest';
import {
  recordCadenceMeeting,
  generateTermCloseSnapshot,
  verifySnapshotIntegrity,
  exportFullDataArchive,
  evaluatePartnerScoreGate,
  calculateExternalFundingCoverage,
  evaluateAccountsReceivableAging,
  computeSha256,
} from '../src/lib/governance/governance-engine';
import {
  createQualityCase,
  calculateStageClocks,
} from '../src/lib/cases/quality-case-engine';
import {
  calculateAnnex2DraftCompensation,
} from '../src/lib/cases/compensation-calculator';
import {
  createHarassmentCase,
  decryptVaultData,
  checkVaultAccess,
} from '../src/lib/cases/harassment-vault-engine';
import {
  requestDisbursement,
  firstApproveDisbursement,
  secondApproveDisbursement,
  calculateExchangeSustainabilityRatio,
} from '../src/lib/finance/finance-engine';

describe('Phase 5 Capstone: Governance, Portability & E2E Integration Suite', () => {
  // Test 1: REQ-091 / TEST-087: Cadence Meetings & Quorum Calculation
  it('records cadence meetings with correct quorum threshold and minute SHA-256 digest (REQ-091, TEST-087)', () => {
    // LCM requires 66% quorum
    const lcmMeeting = recordCadenceMeeting({
      id: 'mtg_lcm_test',
      lcId: 'lc_rabat',
      meetingType: 'LCM',
      title: 'Local Committee Meeting Rabat Q1',
      scheduledAt: '2026-03-01T18:00:00Z',
      location: 'Rabat Campus',
      attendees: [
        { memberId: 'm1', memberName: 'A', email: 'a@aiesec.net', role: 'LCP', attended: true },
        { memberId: 'm2', memberName: 'B', email: 'b@aiesec.net', role: 'LCVP', attended: true },
        { memberId: 'm3', memberName: 'C', email: 'c@aiesec.net', role: 'MEMBER', attended: false },
      ],
      actionItems: [],
      minutesText: 'Approved 2026 iGV Summer Operations Budget.',
      recordedByUserId: 'usr_lcp_01',
    });

    expect(lcmMeeting.quorumRatio).toBe(0.67);
    expect(lcmMeeting.quorumReached).toBe(true);
    expect(lcmMeeting.minutesSha256Hash).toBe(computeSha256('Approved 2026 iGV Summer Operations Budget.'));

    // Failed LCM Quorum (only 1 of 3 = 33% < 66%)
    const failedLcm = recordCadenceMeeting({
      id: 'mtg_lcm_fail',
      lcId: 'lc_rabat',
      meetingType: 'LCM',
      title: 'Failed Quorum LCM',
      scheduledAt: '2026-03-01T18:00:00Z',
      location: 'Rabat Campus',
      attendees: [
        { memberId: 'm1', memberName: 'A', email: 'a@aiesec.net', role: 'LCP', attended: true },
        { memberId: 'm2', memberName: 'B', email: 'b@aiesec.net', role: 'LCVP', attended: false },
        { memberId: 'm3', memberName: 'C', email: 'c@aiesec.net', role: 'MEMBER', attended: false },
      ],
      actionItems: [],
      minutesText: 'Adjourned due to lack of quorum.',
      recordedByUserId: 'usr_lcp_01',
    });

    expect(failedLcm.quorumReached).toBe(false);
  });

  // Test 2: REQ-100 / TEST-096: Term-Close Historical Snapshot Generation & Immutability
  it('generates immutable term-close snapshot and verifies tamper detection (REQ-100, TEST-096)', () => {
    const snapshot = generateTermCloseSnapshot({
      snapshotId: 'SNAP-RABAT-2025-2026',
      termCode: '2025/2026',
      lcId: 'lc_rabat',
      generatedByUserId: 'usr_lcp_01',
      operationalMetrics: {
        totalApproved: 50,
        totalRealized: 45,
        totalFinished: 45,
        totalCompleted: 44,
        exchangeStandardsCompletionRate: 0.96,
        totalQualityCases: 2,
        resolvedQualityCases: 2,
        harassmentCasesReported: 0,
      },
      financialSummary: {
        totalInvoicedMAD: 160000,
        totalCollectedMAD: 160000,
        totalDisbursedMAD: 110000,
        netOperatingSurplusMAD: 50000,
        exchangeSustainabilityRatio: 1.45,
      },
      activeRosterCount: 30,
      signedBy: {
        lcpUserId: 'usr_lcp_01',
        lcvpFnLUserId: 'usr_fnl_01',
        signedAt: '2026-06-30T23:59:59Z',
      },
    });

    expect(snapshot.isFrozenReadOnly).toBe(true);
    expect(verifySnapshotIntegrity(snapshot)).toBe(true);

    // Tamper detection test
    const tamperedSnapshot = {
      ...snapshot,
      financialSummary: {
        ...snapshot.financialSummary,
        netOperatingSurplusMAD: 999999, // Unauthorized edit
      },
    };

    expect(verifySnapshotIntegrity(tamperedSnapshot)).toBe(false);
  });

  // Test 3: REQ-116 / TEST-112: Full Open Data Export Portability (Zero Lock-in)
  it('exports complete open data archive with JSON and CSV manifests (REQ-116, TEST-112)', () => {
    const mockDatasets = {
      opportunities: [{ id: 'opp_1', title: 'Summer Teach', slots: 5 }],
      leads: [{ id: 'lead_1', company: 'Inwi Telecom' }],
      exchangeParticipants: [{ id: 'ep_1', name: 'John Doe', status: 'REALIZED' }],
      qualityCases: [{ id: 'case_1', status: 'CLOSED' }],
      invoices: [{ id: 'inv_1', amountMAD: 7000 }],
      disbursements: [{ id: 'disb_1', amountMAD: 3500 }],
      auditLogEntries: [{ id: 'aud_1', hash: 'abc123' }],
    };

    const manifest = exportFullDataArchive('lc_rabat', mockDatasets);

    expect(manifest.lcId).toBe('lc_rabat');
    expect(manifest.schemaVersion).toBe('2.0.0');
    expect(manifest.totalRecordCount).toBe(7);
    expect(manifest.formats).toContain('JSON');
    expect(manifest.formats).toContain('CSV');
    expect(manifest.checksums.opportunities).toBeDefined();
    expect(manifest.downloadPayloads.csvManifest).toContain('Entity,RecordCount,ChecksumSha256');
    expect(manifest.downloadPayloads.csvManifest).toContain('opportunities,1,');
  });

  // Test 4: REQ-082 / TEST-078: Partner Score Gating on Open Quality Cases
  it('freezes partner score recalculation when quality cases are unresolved (REQ-082, TEST-078)', () => {
    // Unresolved case in STAGE_1_LC -> Score must be frozen
    const frozenResult = evaluatePartnerScoreGate({
      partnerId: 'partner_agdal',
      currentScore: 8.0,
      newCalculatedScore: 9.5,
      linkedCaseStatuses: ['STAGE_1_LC'],
    });

    expect(frozenResult.scoreFrozen).toBe(true);
    expect(frozenResult.effectiveScore).toBe(8.0);
    expect(frozenResult.reason).toContain('Partner score update frozen');

    // Resolved cases only -> Score can update
    const unfrozenResult = evaluatePartnerScoreGate({
      partnerId: 'partner_agdal',
      currentScore: 8.0,
      newCalculatedScore: 9.5,
      linkedCaseStatuses: ['RESOLVED_COMPENSATED', 'CLOSED'],
    });

    expect(unfrozenResult.scoreFrozen).toBe(false);
    expect(unfrozenResult.effectiveScore).toBe(9.5);
    expect(unfrozenResult.reason).toContain('Partner score successfully updated');
  });

  // Test 5: REQ-086 / TEST-081: 70% External Funding Threshold
  it('validates iGV project funding against 70% external coverage threshold (REQ-086, TEST-081)', () => {
    // 80% coverage -> Compliant
    const compliant = calculateExternalFundingCoverage('opp_1', 10000, 8000);
    expect(compliant.externalCoveragePercentage).toBe(80);
    expect(compliant.meetsSeventyPercentThreshold).toBe(true);
    expect(compliant.status).toBe('COMPLIANT');

    // 50% coverage -> Warning
    const deficit = calculateExternalFundingCoverage('opp_2', 10000, 5000);
    expect(deficit.externalCoveragePercentage).toBe(50);
    expect(deficit.meetsSeventyPercentThreshold).toBe(false);
    expect(deficit.status).toBe('DEFICIT_WARNING');
  });

  // Test 6: REQ-088 / TEST-084 / AUTO-031: Accounts Receivable Aging & Escalations
  it('evaluates AR aging and issues 14-day alert and 30-day legal escalation (REQ-088, TEST-084, AUTO-031)', () => {
    // Current invoice
    const currentInvoice = evaluateAccountsReceivableAging({
      invoiceId: 'inv_1',
      partnerName: 'Partner A',
      amountMAD: 5000,
      dueDate: '2026-04-01',
      currentDate: '2026-04-01',
    });
    expect(currentInvoice.agingBucket).toBe('CURRENT');
    expect(currentInvoice.daysOverdue).toBe(0);

    // 16 days overdue -> 14_DAY_ALERT to LCVP_FNL
    const alert14 = evaluateAccountsReceivableAging({
      invoiceId: 'inv_2',
      partnerName: 'Partner B',
      amountMAD: 8000,
      dueDate: '2026-03-15',
      currentDate: '2026-03-31',
    });
    expect(alert14.agingBucket).toBe('14_DAY_ALERT');
    expect(alert14.escalationTarget).toBe('LCVP_FNL');

    // 35 days overdue -> 30_DAY_ESCALATION to LCP_AND_LEGAL
    const escalation30 = evaluateAccountsReceivableAging({
      invoiceId: 'inv_3',
      partnerName: 'Partner C',
      amountMAD: 12000,
      dueDate: '2026-02-15',
      currentDate: '2026-03-25',
    });
    expect(escalation30.agingBucket).toBe('30_DAY_ESCALATION');
    expect(escalation30.escalationTarget).toBe('LCP_AND_LEGAL');
  });

  // Test 7: Phase 5 End-to-End Operational Lifecycle Synthesis
  it('executes full Phase 5 operational lifecycle across Cases, Compensation, Harassment Vault, Finance and Governance', () => {
    // 1. Create a quality case
    const qCase = createQualityCase({
      id: 'case_e2e_01',
      caseNumber: 'QC-2026-RABAT-009',
      lcId: 'lc_rabat',
      exchangeParticipantId: 'ep_e2e_01',
      opportunityId: 'opp_e2e_01',
      category: 'JOB_DESCRIPTION_MISALIGNMENT',
      severity: 'MAJOR',
      title: 'Role tasks diverged significantly from contract',
      descriptionText: 'EP was assigned administrative clerical duties instead of project coordination.',
      openedByUserId: 'usr_ep_01',
      leadRespondentId: 'usr_lcvp_icx',
    });
    expect(qCase.status).toBe('SUBMITTED');

    // 2. Compute Annex 2 compensation
    const compensation = calculateAnnex2DraftCompensation({
      caseId: 'case_e2e_01',
      epName: 'Lucas Rossi',
      homeLc: 'AIESEC in Bologna',
      totalFeePaidMad: 4000,
      exchangeDurationDays: 42,
      completedDays: 14,
      unfulfilledStandardsCount: 2,
      monthlyStipendMad: 2500,
      stipendDelayDaysAfterDay30: 10,
    });
    expect(compensation.requiresHumanApproval).toBe(true);
    expect(compensation.isPast70PercentDismissalThreshold).toBe(false); // 14/42 = 33% <= 70%
    expect(compensation.totalDraftCompensationMad).toBeGreaterThan(0);

    // 3. Register a confidential Harassment case in vault
    const harassmentRes = createHarassmentCase({
      lcId: 'lc_rabat',
      incidentType: 'VERBAL_HARASSMENT',
      victimName: 'Participant Sunflower',
      accusedName: 'Accused Party',
      narrative: 'Private testimony requiring immediate safe room reassignment.',
      reportedBy: 'Participant Sunflower',
      reportingOfficerUserId: 'usr_lcp_yassine',
      reportingOfficerRole: 'LCP',
    });
    expect(harassmentRes.success).toBe(true);
    const caseRecord = harassmentRes.caseRecord!;
    expect(caseRecord.encryptedNarrative.ciphertext).not.toContain('Private testimony');

    // 4. Verify committee can decrypt, ADMIN cannot
    const adminCheck = checkVaultAccess('ADMIN', 'usr_admin');
    expect(adminCheck.isAuthorized).toBe(false);
    expect(adminCheck.error).toContain('ADMIN');

    const lcpCheck = checkVaultAccess('LCP', 'usr_lcp_yassine');
    expect(lcpCheck.isAuthorized).toBe(true);
    const decryptedNarrative = decryptVaultData(caseRecord.encryptedNarrative);
    expect(decryptedNarrative).toBe('Private testimony requiring immediate safe room reassignment.');

    // 5. Dual approval disbursement for emergency relocation
    const disbReq = requestDisbursement({
      lcId: 'lc_rabat',
      category: 'EMERGENCY_SUPPORT',
      amountMad: 1500,
      beneficiaryName: 'Hotel Rabat Agdal',
      purpose: 'Emergency temporary hotel accommodation for EP',
      receiptDocumentId: 'doc_receipt_hotel_01',
      requestedByUserId: 'usr_cxp_kenza',
    });
    expect(disbReq.success).toBe(true);
    const firstApproved = firstApproveDisbursement(disbReq.disbursement!, 'usr_fnl_amine', 'LCVP_FNL');
    expect(firstApproved.success).toBe(true);
    const fullyApproved = secondApproveDisbursement(firstApproved.disbursement!, 'usr_lcp_yassine', 'LCP');
    expect(fullyApproved.success).toBe(true);
    expect(fullyApproved.disbursement!.status).toBe('APPROVED_FOR_PAYMENT');

    // 6. Calculate Exchange Sustainability Ratio
    const sustainability = calculateExchangeSustainabilityRatio(
      'lc_rabat',
      '2025/2026',
      [
        {
          opportunityId: 'opp_e2e_01',
          opportunityTitle: 'Eco Morocco Volunteer',
          realizedEpsCount: 10,
          revenueMad: 50000,
          directCostMad: 32000,
          netMarginMad: 18000,
          sustainabilityRatio: 1.56,
          isSustainable: true,
        },
      ]
    );
    expect(sustainability.overallSustainabilityRatio).toBe(1.56);
    expect(sustainability.isSustainable).toBe(true);

    // 7. Freeze term-close snapshot & generate open export archive
    const termSnapshot = generateTermCloseSnapshot({
      snapshotId: 'SNAP-E2E-2025-2026',
      termCode: '2025/2026',
      lcId: 'lc_rabat',
      generatedByUserId: 'usr_lcp_yassine',
      operationalMetrics: {
        totalApproved: 10,
        totalRealized: 10,
        totalFinished: 10,
        totalCompleted: 10,
        exchangeStandardsCompletionRate: 1.0,
        totalQualityCases: 1,
        resolvedQualityCases: 1,
        harassmentCasesReported: 1,
      },
      financialSummary: {
        totalInvoicedMAD: 50000,
        totalCollectedMAD: 50000,
        totalDisbursedMAD: 32000,
        netOperatingSurplusMAD: 18000,
        exchangeSustainabilityRatio: 1.56,
      },
      activeRosterCount: 15,
      signedBy: {
        lcpUserId: 'usr_lcp_yassine',
        lcvpFnLUserId: 'usr_fnl_amine',
        signedAt: '2026-06-30T23:59:59Z',
      },
    });
    expect(verifySnapshotIntegrity(termSnapshot)).toBe(true);
  });
});
