import { describe, it, expect, beforeEach } from 'vitest';
import {
  proofVaultService,
  resetProofVaultDb,
  computeSha256,
  isValidDriveUrl,
} from '../src/lib/data-integrity/proof-vault';
import {
  getMasterTrackerDb,
  resetMasterTrackerDb,
  partnerService,
  opportunityService,
  epService,
  exchangeService,
} from '../src/lib/data-integrity/master-tracker';
import {
  standardsService,
  getExchangeStandardsWithDefs,
} from '../src/lib/data-integrity/standards-service';
import { InvariantViolationError } from '../src/lib/data-integrity/invariants';

describe('Plan 02-03: Proof Document Vault & Dead Link Detection (M2)', () => {
  const actorId = 'mem-wadii-001';
  let exchangeId: string;

  beforeEach(() => {
    resetMasterTrackerDb();
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
        title: 'Community Lead iGV',
        programme: 'iGV',
        standard_duration_weeks: 6,
        open_slots: 3,
        status: 'Open',
        owner_id: actorId,
      },
      actorId
    );

    epService.createEp(
      {
        id: 'ep-test-01',
        expa_person_id: 'expa-p-888',
        full_name: 'Elena Rostova',
        email: 'elena.rostova@example.com',
        home_mc: 'Poland',
        home_lc: 'AIESEC in Warsaw',
        status: 'Open',
        owner_id: actorId,
      },
      actorId
    );

    const exchange = exchangeService.createExchange(
      {
        id: 'exc-proof-test-01',
        ep_id: 'ep-test-01',
        opportunity_id: 'opp-test-01',
        programme: 'iGV',
        status: 'approved',
        flow_stage: 'preparation',
        owner_id: actorId,
      },
      actorId
    );
    exchangeId = exchange.id;
  });

  describe('1. Registration and Hash Hashing', () => {
    it('validates Google Drive URLs accurately', () => {
      expect(isValidDriveUrl('https://drive.google.com/file/d/12345/view')).toBe(true);
      expect(isValidDriveUrl('https://docs.google.com/document/d/67890/edit')).toBe(true);
      expect(isValidDriveUrl('https://sheets.google.com/spreadsheets/d/abcde/edit')).toBe(true);
      expect(isValidDriveUrl('https://malicious-site.com/file.pdf')).toBe(false);
      expect(isValidDriveUrl('invalid-url')).toBe(false);
    });

    it('registers a proof document with SHA-256 digest and audit trail (INV-09)', () => {
      const samplePdfContent = 'AIESEC iCX Expectations Setting Official Document';
      const hash = computeSha256(samplePdfContent);

      const doc = proofVaultService.registerProofDocument(
        {
          id: 'proof-doc-001',
          file_name: 'expectations_setting_signed.pdf',
          mime_type: 'application/pdf',
          file_size_bytes: 1048576,
          drive_url: 'https://drive.google.com/file/d/1a2b3c4d/view',
          sha256_hash: hash,
          uploaded_by: actorId,
        },
        actorId
      );

      expect(doc.id).toBe('proof-doc-001');
      expect(doc.sha256_hash).toBe(hash);
      expect(doc.verification_status).toBe('verified');

      const retrieved = proofVaultService.getProofDocument('proof-doc-001');
      expect(retrieved).toBeDefined();
      expect(retrieved?.file_name).toBe('expectations_setting_signed.pdf');

      // Verify audit log
      const db = getMasterTrackerDb();
      const lastAudit = db.auditLogs[db.auditLogs.length - 1];
      expect(lastAudit.action).toBe('REGISTER_PROOF_DOCUMENT');
      expect(lastAudit.record_id).toBe('proof-doc-001');
    });

    it('rejects registration with invalid drive url or invalid sha256', () => {
      expect(() => {
        proofVaultService.registerProofDocument(
          {
            file_name: 'doc.pdf',
            mime_type: 'application/pdf',
            file_size_bytes: 100,
            drive_url: 'https://dropbox.com/file.pdf',
            sha256_hash: 'abc', // invalid length
            uploaded_by: actorId,
          },
          actorId
        );
      }).toThrow(/sha256_hash must be a valid 64-character/i);

      const validHash = computeSha256('test');
      expect(() => {
        proofVaultService.registerProofDocument(
          {
            file_name: 'doc.pdf',
            mime_type: 'application/pdf',
            file_size_bytes: 100,
            drive_url: 'https://dropbox.com/file.pdf',
            sha256_hash: validHash,
            uploaded_by: actorId,
          },
          actorId
        );
      }).toThrow(/Invalid Google Drive proof URL/i);
    });
  });

  describe('2. Attachment to Standards & Amber Unproven Clearance (§6.4)', () => {
    it('clears unproven amber status when valid proof document is attached', () => {
      // Mark Standard 4 as delivered without proof
      standardsService.updateTrackedStatus(exchangeId, 4, 'delivered', actorId);

      let standards = getExchangeStandardsWithDefs(exchangeId);
      let std4 = standards.find((s) => s.std_no === 4);
      expect(std4?.tracked_status).toBe('delivered');
      expect(std4?.is_unproven).toBe(true);

      // Register proof document
      const hash = computeSha256('Expectations setting proof');
      const doc = proofVaultService.registerProofDocument(
        {
          id: 'proof-doc-std4',
          file_name: 'expectations_doc.pdf',
          mime_type: 'application/pdf',
          file_size_bytes: 2048,
          drive_url: 'https://drive.google.com/file/d/std4-evidence/view',
          sha256_hash: hash,
          uploaded_by: actorId,
        },
        actorId
      );

      // Attach proof to standard check
      proofVaultService.attachProofToStandard(exchangeId, 4, doc.id, actorId);

      standards = getExchangeStandardsWithDefs(exchangeId);
      std4 = standards.find((s) => s.std_no === 4);
      expect(std4?.proof_id).toBe(doc.id);
      expect(std4?.is_unproven).toBe(false); // Amber status cleared!
    });
  });

  describe('3. Soft Deletion & INV-01 Hard Delete Protection', () => {
    it('soft deletes a proof document and prevents hard delete', () => {
      const hash = computeSha256('file-content');
      const doc = proofVaultService.registerProofDocument(
        {
          id: 'proof-delete-01',
          file_name: 'temp.pdf',
          mime_type: 'application/pdf',
          file_size_bytes: 1024,
          drive_url: 'https://drive.google.com/file/d/temp/view',
          sha256_hash: hash,
          uploaded_by: actorId,
        },
        actorId
      );

      // Soft delete succeeds
      const deleted = proofVaultService.deleteProofDocument(
        doc.id,
        'Uploaded wrong version',
        actorId
      );
      expect(deleted.deleted_at).not.toBeNull();
      expect(deleted.deleted_reason).toContain('Uploaded wrong version');
      expect(proofVaultService.getProofDocument(doc.id)).toBeUndefined();

      // Attempting hard delete must throw INV-01
      expect(() => {
        proofVaultService.hardDeleteProofDocument(doc.id, actorId);
      }).toThrowError(InvariantViolationError);
    });
  });

  describe('4. Acceptance Test T-20 & Checksum Drift Detection (DQ-083)', () => {
    it('Acceptance Test T-20: flags 404 dead link with DQ-083 within nightly run', async () => {
      const hash = computeSha256('original valid document');
      const doc = proofVaultService.registerProofDocument(
        {
          id: 'proof-t20-doc',
          file_name: 'visa_invitation_letter.pdf',
          mime_type: 'application/pdf',
          file_size_bytes: 4096,
          drive_url: 'https://drive.google.com/file/d/missing-doc-404/view',
          sha256_hash: hash,
          uploaded_by: actorId,
        },
        actorId
      );

      // Simulate nightly run where drive link returns 404
      const scanResult = await proofVaultService.runNightlyDeadLinkScan((url) => {
        if (url.includes('missing-doc-404')) {
          return { status: 404 };
        }
        return { status: 200, contentSha256: hash };
      });

      expect(scanResult.deadLinksCount).toBe(1);
      expect(scanResult.dqIssues).toHaveLength(1);

      const issue = scanResult.dqIssues[0];
      expect(issue.rule_id).toBe('DQ-083');
      expect(issue.severity).toBe('Warn');
      expect(issue.owner_id).toBe(actorId);
      expect(issue.subject).toContain('Proof link dead (HTTP 404)');
      expect(issue.details?.proof_id).toBe(doc.id);
      expect(issue.details?.status_code).toBe(404);

      // Document verification status updated
      const updated = proofVaultService.getProofDocument(doc.id);
      expect(updated?.verification_status).toBe('dead_link');
    });

    it('detects checksum drift / payload mutation with DQ-083', async () => {
      const initialHash = computeSha256('original un-tampered document');
      const doc = proofVaultService.registerProofDocument(
        {
          id: 'proof-tamper-doc',
          file_name: 'contract_agreement.pdf',
          mime_type: 'application/pdf',
          file_size_bytes: 8192,
          drive_url: 'https://drive.google.com/file/d/tampered-doc/view',
          sha256_hash: initialHash,
          uploaded_by: actorId,
        },
        actorId
      );

      // Simulate nightly run where the remote file has been swapped / edited
      const mutatedHash = computeSha256('mutated tampered document');
      const scanResult = await proofVaultService.runNightlyDeadLinkScan(() => ({
        status: 200,
        contentSha256: mutatedHash,
      }));

      expect(scanResult.checksumMismatchCount).toBe(1);
      expect(scanResult.dqIssues).toHaveLength(1);

      const issue = scanResult.dqIssues[0];
      expect(issue.rule_id).toBe('DQ-083');
      expect(issue.severity).toBe('Warn');
      expect(issue.subject).toContain('Proof checksum drift detected');
      expect(issue.details?.expected_sha256).toBe(initialHash);
      expect(issue.details?.actual_sha256).toBe(mutatedHash);

      const updated = proofVaultService.getProofDocument(doc.id);
      expect(updated?.verification_status).toBe('checksum_mismatch');
    });

    it('leaves document verified when URL returns 200 and hash matches', async () => {
      const validHash = computeSha256('perfectly valid document');
      const doc = proofVaultService.registerProofDocument(
        {
          id: 'proof-healthy-doc',
          file_name: 'clean_receipt.pdf',
          mime_type: 'application/pdf',
          file_size_bytes: 512,
          drive_url: 'https://drive.google.com/file/d/healthy-receipt/view',
          sha256_hash: validHash,
          uploaded_by: actorId,
        },
        actorId
      );

      const scanResult = await proofVaultService.runNightlyDeadLinkScan(() => ({
        status: 200,
        contentSha256: validHash,
      }));

      expect(scanResult.deadLinksCount).toBe(0);
      expect(scanResult.checksumMismatchCount).toBe(0);
      expect(scanResult.dqIssues).toHaveLength(0);

      const updated = proofVaultService.getProofDocument(doc.id);
      expect(updated?.verification_status).toBe('verified');
    });
  });
});
