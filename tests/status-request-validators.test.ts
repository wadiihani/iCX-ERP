import { describe, it, expect, beforeEach } from 'vitest';
import {
  statusValidatorService,
  evaluateApdPastReDate,
  StatusRequestChecklistError,
} from '../src/lib/data-integrity/status-validators';
import {
  statusGovernanceService,
  resetStatusRequestDb,
} from '../src/lib/data-integrity/status-governance';
import {
  getMasterTrackerDb,
  resetMasterTrackerDb,
  partnerService,
  opportunityService,
  epService,
  exchangeService,
} from '../src/lib/data-integrity/master-tracker';
import {
  proofVaultService,
  resetProofVaultDb,
  computeSha256,
} from '../src/lib/data-integrity/proof-vault';

describe('Plan 03-02: Statutory Request Checklist Validators & Timing Engine (M3)', () => {
  const actorId = 'mem-wadii-001';
  let exchangeId: string;
  let epId: string;

  beforeEach(() => {
    resetMasterTrackerDb();
    resetStatusRequestDb();
    resetProofVaultDb();

    partnerService.createPartner(
      {
        id: 'ptn-test-01',
        name: 'Casablanca Foundation',
        tier: 'Tier 1',
        status: 'Active',
        owner_id: actorId,
      },
      actorId
    );

    opportunityService.createOpportunity(
      {
        id: 'opp-test-01',
        partner_id: 'ptn-test-01',
        title: 'Education Project iGV',
        programme: 'GV',
        standard_duration_weeks: 6,
        open_slots: 2,
        status: 'Open',
        owner_id: actorId,
      },
      actorId
    );

    const ep = epService.createEp(
      {
        id: 'ep-test-01',
        expa_ep_id: 555,
        full_name: 'Mateo Rossi',
        email: 'mateo.rossi@example.com',
        home_mc: 'Italy',
        home_lc: 'AIESEC in Milan',
        status: 'Open',
        owner_id: actorId,
      },
      actorId
    );
    epId = ep.id;

    const created = exchangeService.createExchange(
      {
        ep_id: epId,
        opportunity_id: 'opp-test-01',
        programme: 'GV',
        status: 'RE',
        re_date: '2026-11-01',
        fi_date: '2026-12-15',
        owner_id: actorId,
      },
      actorId
    );
    exchangeId = created.exchange.id;
  });

  describe('1. Acceptance Test T-07: Missing Required Proof Blocking', () => {
    it('T-07: Given early-FI request missing the LC2LC PDF, when moved to submitted, then blocked with the missing item named', () => {
      // Create early_fi request without proofs
      const req = statusGovernanceService.createStatusRequest(
        {
          id: 'req-early-fi-t07',
          exchange_id: exchangeId,
          ep_id: epId,
          kind: 'early_fi',
          desired_date: '2026-12-01',
          reason: 'Emergency return home',
          apip_clause_ref: 'APIP 4.1.2',
          owner_id: actorId,
        },
        actorId
      );

      // Attempting submission without LC2LC PDF must throw StatusRequestChecklistError naming the missing item
      try {
        statusGovernanceService.submitRequestWithChecklistValidation(
          req.id,
          actorId,
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
  });

  describe('2. Acceptance Test T-08: Early FI Timing Rule Cutoff', () => {
    it('T-08: Given early-FI desired finish in 5 days, then timing_ok = false (needs >= 7 days)', () => {
      const submitDate = '2026-11-20T10:00:00Z';
      const finishIn5Days = '2026-11-25'; // Exactly 5 days later

      // Register LC2LC and EP-OP agreements
      const hash1 = computeSha256('lc2lc');
      const hash2 = computeSha256('agreement');
      const doc1 = proofVaultService.registerProofDocument(
        {
          file_name: 'lc2lc_email.pdf',
          mime_type: 'application/pdf',
          file_size_bytes: 1024,
          drive_url: 'https://drive.google.com/file/d/lc2lc/view',
          sha256_hash: hash1,
          uploaded_by: actorId,
          metadata: { type: 'lc2lc_email' },
        },
        actorId
      );
      const doc2 = proofVaultService.registerProofDocument(
        {
          file_name: 'ep_opp_agreement.pdf',
          mime_type: 'application/pdf',
          file_size_bytes: 1024,
          drive_url: 'https://drive.google.com/file/d/agreement/view',
          sha256_hash: hash2,
          uploaded_by: actorId,
          metadata: { type: 'ep_opp_agreement' },
        },
        actorId
      );

      const req = statusGovernanceService.createStatusRequest(
        {
          id: 'req-early-fi-t08',
          exchange_id: exchangeId,
          ep_id: epId,
          kind: 'early_fi',
          desired_date: finishIn5Days,
          reason: 'Early exam timetable',
          apip_clause_ref: 'APIP 4.3',
          evidence_proof_ids: [doc1.id, doc2.id],
          owner_id: actorId,
        },
        actorId
      );

      const masterDb = getMasterTrackerDb();
      const exchange = masterDb.exchanges.get(exchangeId)!;
      const validation = statusValidatorService.validateEarlyFi(req, exchange, submitDate);

      expect(validation.evaluatedChecklist['timing_ok']).toBe(false);
      expect(validation.missingItems.some((i) => i.includes('timing_ok'))).toBe(true);

      // Now set finish in 10 days (>= 7 days) -> timing_ok passes
      const finishIn10Days = '2026-11-30';
      const reqUpdated = statusGovernanceService.updateStatusRequest(
        req.id,
        { desired_date: finishIn10Days },
        actorId
      );
      const validationPassed = statusValidatorService.validateEarlyFi(reqUpdated, exchange, submitDate);
      expect(validationPassed.evaluatedChecklist['timing_ok']).toBe(true);
    });
  });

  describe('3. Acceptance Test T-09: Extension Timing Rule Cutoff', () => {
    it('T-09: Given extension with finish in 10 days, then timing_ok = false (needs >= 14 days)', () => {
      // Original finish is 2026-12-15
      // Submitting on 2026-12-05 means only 10 days remain before original finish
      const submitDate = '2026-12-05T10:00:00Z';

      const hash1 = computeSha256('lc2lc');
      const hash2 = computeSha256('agreement');
      const doc1 = proofVaultService.registerProofDocument(
        {
          file_name: 'lc2lc_email.pdf',
          mime_type: 'application/pdf',
          file_size_bytes: 1024,
          drive_url: 'https://drive.google.com/file/d/lc2lc/view',
          sha256_hash: hash1,
          uploaded_by: actorId,
          metadata: { type: 'lc2lc_email' },
        },
        actorId
      );
      const doc2 = proofVaultService.registerProofDocument(
        {
          file_name: 'ep_opp_agreement.pdf',
          mime_type: 'application/pdf',
          file_size_bytes: 1024,
          drive_url: 'https://drive.google.com/file/d/agreement/view',
          sha256_hash: hash2,
          uploaded_by: actorId,
          metadata: { type: 'ep_opp_agreement' },
        },
        actorId
      );

      const req = statusGovernanceService.createStatusRequest(
        {
          id: 'req-ext-t09',
          exchange_id: exchangeId,
          ep_id: epId,
          kind: 'extension_fi',
          desired_date: '2026-12-25', // Extension by 10 days
          reason: 'Project prolonged by NGO',
          apip_clause_ref: 'APIP 5.1',
          evidence_proof_ids: [doc1.id, doc2.id],
          owner_id: actorId,
        },
        actorId
      );

      const masterDb = getMasterTrackerDb();
      const exchange = masterDb.exchanges.get(exchangeId)!;
      const validation = statusValidatorService.validateExtensionFi(req, exchange, submitDate);

      expect(validation.evaluatedChecklist['timing_ok']).toBe(false);
      expect(validation.missingItems.some((i) => i.includes('timing_ok'))).toBe(true);

      // If submitted on 2026-11-25 (20 days before original finish >= 14 days) -> timing_ok = true
      const earlySubmitDate = '2026-11-25T10:00:00Z';
      const validationPassed = statusValidatorService.validateExtensionFi(req, exchange, earlySubmitDate);
      expect(validationPassed.evaluatedChecklist['timing_ok']).toBe(true);
    });
  });

  describe('4. Acceptance Test T-10: APD Aged Overdue & Direct Break Exception (§7.4)', () => {
    it('T-10: Given an APD whose re_date passed 21 days ago (GV), then DQ-052 is urgent and direct-break path is offered', () => {
      const epT10 = epService.createEp(
        {
          id: 'ep-t10-01',
          expa_ep_id: 556,
          full_name: 'Sara Lind',
          email: 'sara.lind@example.com',
          home_mc: 'Sweden',
          home_lc: 'AIESEC in Stockholm',
          status: 'Open',
          owner_id: actorId,
        },
        actorId
      );

      // Set exchange to approved with re_date 21 days ago
      const apdExchange = exchangeService.createExchange(
        {
          ep_id: epT10.id,
          opportunity_id: 'opp-test-01',
          programme: 'GV',
          status: 'APD',
          re_date: '2026-10-10',
          owner_id: actorId,
        },
        actorId
      );

      // Current evaluation date: 2026-10-31 (exactly 21 days after re_date)
      const evaluation = evaluateApdPastReDate(apdExchange.exchange, '2026-10-31');

      expect(evaluation.isApdPastRe).toBe(true);
      expect(evaluation.daysPassed).toBe(21);
      expect(evaluation.violationLevel).toBe(5);
      expect(evaluation.isUrgentDq052).toBe(true);
      expect(evaluation.directBreakEligible).toBe(true);
      expect(evaluation.dqIssue).toBeDefined();
      expect(evaluation.dqIssue?.rule_id).toBe('DQ-052');
      expect(evaluation.dqIssue?.severity).toBe('Urgent');

      // Now create break_apd request: should validate without requiring PDF proofs
      const breakReq = statusGovernanceService.createStatusRequest(
        {
          id: 'req-break-t10',
          exchange_id: apdExchange.exchange.id,
          ep_id: epT10.id,
          kind: 'break_apd',
          reason: 'EP never arrived, 21 days past RE',
          owner_id: actorId,
        },
        actorId
      );

      const val = statusValidatorService.validateBreakRequest(
        breakReq,
        apdExchange.exchange,
        evaluation.directBreakEligible
      );

      expect(val.isValid).toBe(true);
      expect(val.evaluatedChecklist['proof_lc2lc_email_pdf_en']).toBe(true); // Exempted
      expect(val.evaluatedChecklist['proof_ecb2ecb_email_pdf_en']).toBe(true); // Exempted
    });
  });

  describe('5. Break Requests English Proof Enforcement (§7.3)', () => {
    it('requires English LC2LC and ECB2ECB PDFs for non-exempt break requests', () => {
      const breakReq = statusGovernanceService.createStatusRequest(
        {
          id: 'req-break-en',
          exchange_id: exchangeId,
          ep_id: epId,
          kind: 'break_re',
          reason: 'Host organization closed down',
          apip_clause_ref: 'APIP 7.2',
          owner_id: actorId,
        },
        actorId
      );

      const masterDb = getMasterTrackerDb();
      const exchange = masterDb.exchanges.get(exchangeId)!;

      // Without proofs, fails both English proof items
      let val = statusValidatorService.validateBreakRequest(breakReq, exchange, false);
      expect(val.isValid).toBe(false);
      expect(val.missingItems).toContain('proof_lc2lc_email_pdf_en (Attached LC2LC email PDF in English)');
      expect(val.missingItems).toContain('proof_ecb2ecb_email_pdf_en (Attached ECB2ECB email PDF in English)');

      // Register non-English proof -> should still fail
      const hash = computeSha256('french_lc2lc');
      const frDoc = proofVaultService.registerProofDocument(
        {
          file_name: 'lc2lc_french.pdf',
          mime_type: 'application/pdf',
          file_size_bytes: 1024,
          drive_url: 'https://drive.google.com/file/d/fr-lc2lc/view',
          sha256_hash: hash,
          uploaded_by: actorId,
          metadata: { type: 'lc2lc_email', language: 'fr' },
        },
        actorId
      );

      breakReq.evidence_proof_ids = [frDoc.id];
      val = statusValidatorService.validateBreakRequest(breakReq, exchange, false);
      expect(val.evaluatedChecklist['proof_lc2lc_email_pdf_en']).toBe(false);

      // Register English proof -> passes
      const enHash1 = computeSha256('en_lc2lc');
      const enHash2 = computeSha256('en_ecb');
      const enDoc1 = proofVaultService.registerProofDocument(
        {
          file_name: 'lc2lc_official_en.pdf',
          mime_type: 'application/pdf',
          file_size_bytes: 1024,
          drive_url: 'https://drive.google.com/file/d/en-lc2lc/view',
          sha256_hash: enHash1,
          uploaded_by: actorId,
          metadata: { type: 'lc2lc_email', language: 'en' },
        },
        actorId
      );
      const enDoc2 = proofVaultService.registerProofDocument(
        {
          file_name: 'ecb_official_en.pdf',
          mime_type: 'application/pdf',
          file_size_bytes: 1024,
          drive_url: 'https://drive.google.com/file/d/en-ecb/view',
          sha256_hash: enHash2,
          uploaded_by: actorId,
          metadata: { type: 'ecb2ecb_email', language: 'en' },
        },
        actorId
      );

      breakReq.evidence_proof_ids = [enDoc1.id, enDoc2.id];
      val = statusValidatorService.validateBreakRequest(breakReq, exchange, false);
      expect(val.isValid).toBe(true);
      expect(val.evaluatedChecklist['proof_lc2lc_email_pdf_en']).toBe(true);
      expect(val.evaluatedChecklist['proof_ecb2ecb_email_pdf_en']).toBe(true);
    });
  });
});
