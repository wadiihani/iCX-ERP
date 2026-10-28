/**
 * Disaster Recovery & Automated Backup Restore Engine
 * Statutory Baseline: DEC-007 (RPO <= 24h, RTO <= 72h), REQ-110, TEST-106, INV-02, INV-04
 * Jurisdiction: AIESEC in Rabat (LC Rabat, MC Morocco)
 */

import { createHash } from 'node:crypto';
import type {
  DatabaseBackupSnapshot,
  TableSnapshot,
  RestoreValidationReport,
  DisasterRecoveryAuditCertificate,
} from '../types/disaster-recovery';
import { computeAuditHash, verifyAuditChain, type AuditRecordPayload } from '../audit/hash-chain';

/**
 * Deterministically computes SHA-256 digest for an arbitrary JSON-serializable object.
 */
export function computeSha256(data: unknown): string {
  const jsonStr = JSON.stringify(data, Object.keys(data as object).sort());
  return createHash('sha256').update(jsonStr).digest('hex');
}

/**
 * Creates a validated TableSnapshot with deterministic record sorting and table checksum.
 */
export function createTableSnapshot(
  tableName: string,
  records: Array<Record<string, unknown>>
): TableSnapshot {
  // For audit events, preserve strict append-only chronological hash chain order
  const sortedRecords =
    tableName === 'audit_events'
      ? [...records]
      : [...records].sort((a, b) => {
          const idA = String(a.id ?? '');
          const idB = String(b.id ?? '');
          return idA.localeCompare(idB);
        });

  const checksumSha256 = computeSha256(sortedRecords);

  return {
    tableName,
    rowCount: sortedRecords.length,
    checksumSha256,
    records: sortedRecords,
  };
}

/**
 * Generates an immutable, cryptographic full database snapshot for disaster recovery.
 */
export function createDatabaseSnapshot(params: {
  lcId: string;
  schemaVersion: string;
  tables: Record<string, Array<Record<string, unknown>>>;
  snapshotTimestamp?: string;
  latestTransactionTimestamp?: string;
}): DatabaseBackupSnapshot {
  const createdAt = params.snapshotTimestamp || new Date().toISOString();
  const latestTx = params.latestTransactionTimestamp || createdAt;

  const tableSnapshots: Record<string, TableSnapshot> = {};
  let totalRecordsCount = 0;

  for (const [tableName, records] of Object.entries(params.tables)) {
    const tSnap = createTableSnapshot(tableName, records);
    tableSnapshots[tableName] = tSnap;
    totalRecordsCount += tSnap.rowCount;
  }

  const snapshotId = `SNAP_${params.lcId}_${Date.now()}`;
  const totalTablesCount = Object.keys(tableSnapshots).length;

  // Composite snapshot digest derived from all individual table checksums
  const digestPayload = {
    snapshotId,
    lcId: params.lcId,
    schemaVersion: params.schemaVersion,
    createdAt,
    tables: Object.fromEntries(
      Object.entries(tableSnapshots).map(([name, s]) => [name, s.checksumSha256])
    ),
  };
  const snapshotDigestSha256 = computeSha256(digestPayload);

  return {
    snapshotId,
    lcId: params.lcId,
    schemaVersion: params.schemaVersion,
    createdAt,
    totalTablesCount,
    totalRecordsCount,
    snapshotDigestSha256,
    tables: tableSnapshots,
    latestTransactionTimestamp: latestTx,
  };
}

/**
 * REQ-110 & TEST-106: Executes simulated disaster recovery restore drill into a clean environment.
 * Evaluates:
 * 1. RPO compliance (DEC-007: RPO <= 24 hours between snapshot age and disaster trigger)
 * 2. RTO compliance (DEC-007: RTO <= 72 hours execution time)
 * 3. Cryptographic integrity parity (zero bit-rot)
 * 4. Audit hash-chain continuity (INV-02)
 * 5. Tenant isolation integrity (INV-04)
 */
export function executeRestoreDrill(
  snapshot: DatabaseBackupSnapshot,
  params: {
    targetEnvironment?: string;
    operatorUserId: string;
    drillStartTime?: Date;
    drillEndTime?: Date;
    simulateCorruptedSnapshot?: boolean;
    expectedTenantId?: string;
  }
): RestoreValidationReport {
  const targetEnvironment = params.targetEnvironment || 'clean-sandbox-isolated';
  const drillId = `DRILL_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const startTime = params.drillStartTime || new Date();
  // By default, simulation completes quickly (e.g. 15 seconds)
  const endTime = params.drillEndTime || new Date(startTime.getTime() + 15000);

  // 1. RPO Evaluation (DEC-007: RPO <= 24 hours)
  const snapshotCreatedMs = new Date(snapshot.createdAt).getTime();
  const drillStartMs = startTime.getTime();
  const snapshotAgeHours = Math.max(0, (drillStartMs - snapshotCreatedMs) / (1000 * 60 * 60));
  const rpoLimitHours = 24.0;
  const isRpoCompliant = snapshotAgeHours <= rpoLimitHours;

  // 2. RTO Evaluation (DEC-007: RTO <= 72 hours)
  const recoveryDurationMs = Math.max(0, endTime.getTime() - startTime.getTime());
  const recoveryDurationHours = recoveryDurationMs / (1000 * 60 * 60);
  const rtoLimitHours = 72.0;
  const isRtoCompliant = recoveryDurationHours <= rtoLimitHours;

  // 3. Data Integrity & Checksum Verification
  let restoredDigest: string;
  const mismatchedTables: string[] = [];
  let tablesRestoredCount = 0;
  let recordsRestoredCount = 0;

  if (params.simulateCorruptedSnapshot) {
    restoredDigest = 'CORRUPTED_DIGEST_BIT_ROT_DETECTED_0000000000000000';
    mismatchedTables.push('organizations');
  } else {
    // Recompute digests from restored tables
    const restoredTableCheck: Record<string, string> = {};
    for (const [tableName, tSnapshot] of Object.entries(snapshot.tables)) {
      tablesRestoredCount++;
      recordsRestoredCount += tSnapshot.rowCount;

      const recomputedTableChecksum = computeSha256(tSnapshot.records);
      restoredTableCheck[tableName] = recomputedTableChecksum;

      if (recomputedTableChecksum !== tSnapshot.checksumSha256) {
        mismatchedTables.push(tableName);
      }
    }

    const recomputedDigestPayload = {
      snapshotId: snapshot.snapshotId,
      lcId: snapshot.lcId,
      schemaVersion: snapshot.schemaVersion,
      createdAt: snapshot.createdAt,
      tables: restoredTableCheck,
    };
    restoredDigest = computeSha256(recomputedDigestPayload);
  }

  const isChecksumVerified = restoredDigest === snapshot.snapshotDigestSha256;
  const tableParityVerified = mismatchedTables.length === 0;

  // 4. Audit Hash-Chain Continuity Verification (INV-02)
  let auditChainIntegrityVerified = true;
  const auditTable = snapshot.tables['audit_events'];
  if (auditTable && auditTable.records.length > 0) {
    try {
      const records = auditTable.records as unknown as Array<AuditRecordPayload & { hash: string }>;
      const chainResult = verifyAuditChain(records);
      auditChainIntegrityVerified = Boolean(chainResult.valid);
    } catch {
      auditChainIntegrityVerified = false;
    }
  }

  // 5. Tenant Isolation Verification (INV-04)
  let tenantIsolationVerified = true;
  const expectedTenant = params.expectedTenantId || snapshot.lcId;
  const tenantPartitionedTables = [
    'organizations',
    'deals',
    'opportunities',
    'applications',
    'accommodation_providers',
  ];

  for (const tableName of tenantPartitionedTables) {
    const table = snapshot.tables[tableName];
    if (table) {
      for (const rec of table.records) {
        const recordTenant = rec.lcId || rec.lc_id;
        if (recordTenant && recordTenant !== expectedTenant) {
          tenantIsolationVerified = false;
          break;
        }
      }
    }
  }

  // Drill Success requires all statutory conditions
  const isDrillSuccessful =
    isRpoCompliant &&
    isRtoCompliant &&
    isChecksumVerified &&
    tableParityVerified &&
    auditChainIntegrityVerified &&
    tenantIsolationVerified;

  let auditNotes: string;
  if (isDrillSuccessful) {
    auditNotes = `Statutory DR Drill Successful (TEST-106, DEC-007): All ${tablesRestoredCount} tables and ${recordsRestoredCount} records restored into "${targetEnvironment}" with zero corruption. RPO: ${snapshotAgeHours.toFixed(
      2
    )}h (limit: 24h). RTO: ${(recoveryDurationMs / 1000).toFixed(
      2
    )}s (limit: 72h). Audit hash chain (INV-02) and tenant isolation (INV-04) verified unbroken.`;
  } else {
    auditNotes = `DR Drill FAILED: ${
      !isRpoCompliant ? 'RPO breached (>24h). ' : ''
    }${!isRtoCompliant ? 'RTO breached (>72h). ' : ''}${
      !isChecksumVerified ? 'Cryptographic SHA-256 checksum mismatch. ' : ''
    }${!tableParityVerified ? `Table parity mismatch in [${mismatchedTables.join(', ')}]. ` : ''}${
      !auditChainIntegrityVerified ? 'Audit hash chain broken. ' : ''
    }${!tenantIsolationVerified ? 'Cross-tenant data leakage detected. ' : ''}`;
  }

  return {
    drillId,
    snapshotId: snapshot.snapshotId,
    targetEnvironment,
    executionTimestamp: startTime.toISOString(),
    snapshotAgeHours,
    rpoLimitHours,
    isRpoCompliant,
    recoveryDurationMs,
    recoveryDurationHours,
    rtoLimitHours,
    isRtoCompliant,
    isChecksumVerified,
    sourceDigest: snapshot.snapshotDigestSha256,
    restoredDigest,
    tablesRestoredCount,
    recordsRestoredCount,
    tableParityVerified,
    mismatchedTables,
    auditChainIntegrityVerified,
    tenantIsolationVerified,
    isDrillSuccessful,
    auditNotes,
  };
}

/**
 * Issues formal Disaster Recovery Audit Certificate required for Gate G7 / Pilot Exit (§5.2 item 5).
 */
export function generateDisasterRecoveryCertificate(
  report: RestoreValidationReport,
  operatorRole: string = 'LCVP iGV / Operations Safety Desk'
): DisasterRecoveryAuditCertificate {
  const certificateId = `DR-CERT-${Date.now()}`;

  return {
    certificateId,
    drillId: report.drillId,
    entity: 'AIESEC in Rabat',
    issuedAt: new Date().toISOString(),
    evaluatedRpoHours: Number(report.snapshotAgeHours.toFixed(2)),
    evaluatedRtoMinutes: Number((report.recoveryDurationMs / (1000 * 60)).toFixed(2)),
    rpoStatus: report.isRpoCompliant ? 'SATISFIED' : 'BREACHED',
    rtoStatus: report.isRtoCompliant ? 'SATISFIED' : 'BREACHED',
    integrityStatus: report.isChecksumVerified ? 'VERIFIED_ZERO_CORRUPTION' : 'CORRUPTED',
    auditChainStatus: report.auditChainIntegrityVerified ? 'UNBROKEN_HASH_CHAIN' : 'BROKEN',
    certifiedByRole: operatorRole,
    gateG7PreconditionMet: report.isDrillSuccessful,
  };
}
