/**
 * AIESEC iCX ERP — Tamper-Evident Proof Document Vault
 * Author: Wadii Hani <wadii.hani.pro@gmail.com>
 * Specification: iCX_Data_Integrity_Tracking_Spec.md v1.0 (§6.4, §13.1, §13.2 DQ-083, §16 T-20)
 * Milestone: M2 (Plan 02-03)
 * Enforces: INV-01 (Soft Deletes), INV-09 (Attribution), DQ-083 (Dead Link & Hash Drift Detection)
 */

import { createHash } from 'crypto';
import type {
  ProofDocument,
  ProofVerificationStatus,
  DqIssue,
  StandardCheck,
} from '../types/data-integrity';
import { assertNoHardDelete, createSoftDeletePayload, InvariantViolationError } from './invariants';
import { getMasterTrackerDb } from './master-tracker';
import { standardsService } from './standards-service';

/**
 * Storage for proof documents in memory
 */
interface ProofVaultDbStore {
  documents: Map<string, ProofDocument>;
  dqIssues: DqIssue[];
}

const proofVaultDb: ProofVaultDbStore = {
  documents: new Map(),
  dqIssues: [],
};

export function resetProofVaultDb(): void {
  proofVaultDb.documents.clear();
  proofVaultDb.dqIssues = [];
}

export function getProofVaultDb(): ProofVaultDbStore {
  return proofVaultDb;
}

export function computeSha256(content: string | Buffer): string {
  return createHash('sha256').update(content).digest('hex');
}

export function isValidDriveUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    const validHosts = [
      'drive.google.com',
      'docs.google.com',
      'sheets.google.com',
      'forms.google.com',
    ];
    return validHosts.some((h) => parsed.hostname === h || parsed.hostname.endsWith(`.${h}`));
  } catch {
    return false;
  }
}

export interface RegisterProofParams {
  id?: string;
  file_name: string;
  mime_type: string;
  file_size_bytes: number;
  drive_url: string;
  sha256_hash: string;
  uploaded_by: string;
  metadata?: Record<string, unknown>;
}

export interface LinkCheckResult {
  status: number;
  contentSha256?: string;
}

export type LinkPingHandler = (url: string) => LinkCheckResult | Promise<LinkCheckResult>;

export const proofVaultService = {
  /**
   * Registers a proof document in the vault with SHA-256 tamper-evident digest.
   */
  registerProofDocument(params: RegisterProofParams, actorId: string): ProofDocument {
    if (!params.uploaded_by) {
      throw new InvariantViolationError('INV-03', 'Proof document must have an active uploader/owner.');
    }

    if (!params.sha256_hash || params.sha256_hash.length !== 64) {
      throw new Error('sha256_hash must be a valid 64-character hexadecimal SHA-256 digest.');
    }

    if (!isValidDriveUrl(params.drive_url)) {
      throw new Error(`Invalid Google Drive proof URL: '${params.drive_url}'. URL must point to drive.google.com or docs.google.com.`);
    }

    if (params.file_size_bytes <= 0) {
      throw new Error('file_size_bytes must be greater than 0.');
    }

    const id = params.id ?? `proof-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const now = new Date().toISOString();

    const doc: ProofDocument = {
      id,
      file_name: params.file_name,
      mime_type: params.mime_type,
      file_size_bytes: params.file_size_bytes,
      drive_url: params.drive_url,
      sha256_hash: params.sha256_hash.toLowerCase(),
      uploaded_by: params.uploaded_by,
      uploaded_at: now,
      last_verified_at: now,
      verification_status: 'verified',
      metadata: params.metadata ?? {},
      deleted_at: null,
      deleted_reason: null,
    };

    proofVaultDb.documents.set(id, doc);

    // Audit log (INV-09)
    const masterDb = getMasterTrackerDb();
    masterDb.auditLogs.push({
      id: masterDb.auditLogs.length + 1,
      ts: now,
      actor: actorId,
      action: 'REGISTER_PROOF_DOCUMENT',
      table_name: 'proof_document',
      record_id: id,
      before: undefined,
      after: doc as unknown as Record<string, unknown>,
    });

    return doc;
  },

  /**
   * Retrieves a proof document by ID.
   */
  getProofDocument(id: string): ProofDocument | undefined {
    const doc = proofVaultDb.documents.get(id);
    if (!doc || doc.deleted_at) return undefined;
    return doc;
  },

  /**
   * Lists all active proof documents in the vault.
   */
  listProofs(): ProofDocument[] {
    return Array.from(proofVaultDb.documents.values()).filter((d) => !d.deleted_at);
  },

  /**
   * Soft deletes a proof document (INV-01).
   */
  deleteProofDocument(id: string, reason: string, actorId: string): ProofDocument {
    const doc = proofVaultDb.documents.get(id);
    if (!doc || doc.deleted_at) {
      throw new Error(`Proof document '${id}' not found or already deleted.`);
    }

    const payload = createSoftDeletePayload(actorId, reason);
    const updated: ProofDocument = {
      ...doc,
      ...payload,
    };

    proofVaultDb.documents.set(id, updated);

    // Audit log (INV-09)
    const masterDb = getMasterTrackerDb();
    masterDb.auditLogs.push({
      id: masterDb.auditLogs.length + 1,
      ts: payload.deleted_at,
      actor: actorId,
      action: 'SOFT_DELETE_PROOF_DOCUMENT',
      table_name: 'proof_document',
      record_id: id,
      before: doc as unknown as Record<string, unknown>,
      after: updated as unknown as Record<string, unknown>,
    });

    return updated;
  },

  /**
   * Prohibits hard delete on proof documents (INV-01, DQ-081).
   */
  hardDeleteProofDocument(id: string, actorId?: string | null): never {
    assertNoHardDelete('proof_document', id, actorId);
  },

  /**
   * Attaches a registered proof document to an exchange standard check.
   */
  attachProofToStandard(
    exchangeId: string,
    stdNo: number,
    proofId: string,
    actorId: string
  ): StandardCheck {
    const doc = this.getProofDocument(proofId);
    if (!doc) {
      throw new Error(`Cannot attach proof '${proofId}': document does not exist or has been deleted.`);
    }

    const masterDb = getMasterTrackerDb();
    const key = `${exchangeId}:${stdNo}`;
    const check = masterDb.standardChecks.get(key);

    const currentStatus = check?.tracked_status ?? 'not_started';
    return standardsService.updateTrackedStatus(
      exchangeId,
      stdNo,
      currentStatus,
      actorId,
      proofId
    );
  },

  /**
   * Performs an integrity check on a specific proof document.
   */
  verifyDocument(
    id: string,
    pingResult: LinkCheckResult,
    actorId?: string
  ): { doc: ProofDocument; issue?: DqIssue } {
    const doc = proofVaultDb.documents.get(id);
    if (!doc || doc.deleted_at) {
      throw new Error(`Document '${id}' not found.`);
    }

    const now = new Date().toISOString();
    let newStatus: ProofVerificationStatus = 'verified';
    let issue: DqIssue | undefined;

    if (pingResult.status === 404 || pingResult.status >= 400) {
      newStatus = 'dead_link';
      issue = {
        id: proofVaultDb.dqIssues.length + 1,
        rule_id: 'DQ-083',
        subject: `Proof link dead (HTTP ${pingResult.status}) for document ${doc.file_name} (${doc.id})`,
        severity: 'Warn',
        detected_at: now,
        owner_id: doc.uploaded_by,
        details: {
          proof_id: doc.id,
          file_name: doc.file_name,
          drive_url: doc.drive_url,
          status_code: pingResult.status,
          error: 'Dead link / Not found',
        },
      };
    } else if (
      pingResult.contentSha256 &&
      pingResult.contentSha256.toLowerCase() !== doc.sha256_hash.toLowerCase()
    ) {
      newStatus = 'checksum_mismatch';
      issue = {
        id: proofVaultDb.dqIssues.length + 1,
        rule_id: 'DQ-083',
        subject: `Proof checksum drift detected for document ${doc.file_name} (${doc.id})`,
        severity: 'Warn',
        detected_at: now,
        owner_id: doc.uploaded_by,
        details: {
          proof_id: doc.id,
          file_name: doc.file_name,
          drive_url: doc.drive_url,
          expected_sha256: doc.sha256_hash,
          actual_sha256: pingResult.contentSha256,
          error: 'Checksum changed / File content mutated',
        },
      };
    }

    const updated: ProofDocument = {
      ...doc,
      verification_status: newStatus,
      last_verified_at: now,
    };

    proofVaultDb.documents.set(id, updated);

    if (issue) {
      proofVaultDb.dqIssues.push(issue);
    }

    if (newStatus !== doc.verification_status && actorId) {
      const masterDb = getMasterTrackerDb();
      masterDb.auditLogs.push({
        id: masterDb.auditLogs.length + 1,
        ts: now,
        actor: actorId,
        action: 'VERIFY_PROOF_INTEGRITY',
        table_name: 'proof_document',
        record_id: id,
        before: doc as unknown as Record<string, unknown>,
        after: updated as unknown as Record<string, unknown>,
      });
    }

    return { doc: updated, issue };
  },

  /**
   * Automated Nightly Dead Link & Checksum Scanner (§13.1, §13.2, §16 T-20).
   * Flags 404 links and modified files with DQ-083 within one nightly run.
   */
  async runNightlyDeadLinkScan(
    pingHandler: LinkPingHandler = () => ({ status: 200 })
  ): Promise<{
    scannedCount: number;
    deadLinksCount: number;
    checksumMismatchCount: number;
    dqIssues: DqIssue[];
  }> {
    const docs = Array.from(proofVaultDb.documents.values()).filter((d) => !d.deleted_at);
    let deadLinks = 0;
    let mismatches = 0;
    const newIssues: DqIssue[] = [];

    for (const doc of docs) {
      const pingRes = await Promise.resolve(pingHandler(doc.drive_url));
      const { doc: updatedDoc, issue } = this.verifyDocument(doc.id, pingRes);

      if (updatedDoc.verification_status === 'dead_link') {
        deadLinks++;
      } else if (updatedDoc.verification_status === 'checksum_mismatch') {
        mismatches++;
      }

      if (issue) {
        newIssues.push(issue);
      }
    }

    return {
      scannedCount: docs.length,
      deadLinksCount: deadLinks,
      checksumMismatchCount: mismatches,
      dqIssues: newIssues,
    };
  },

  /**
   * Returns all active DQ issues raised by proof integrity scanner.
   */
  getDqIssues(): DqIssue[] {
    return [...proofVaultDb.dqIssues];
  },
};
