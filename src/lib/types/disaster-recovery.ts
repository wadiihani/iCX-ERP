/**
 * Disaster Recovery & Restore Domain Types
 * Statutory Reference: DEC-007 (RPO <= 24h, RTO <= 72h), REQ-110, TEST-106, TEST-116
 * Jurisdiction: AIESEC in Rabat (LC Rabat, MC Morocco)
 */

export interface TableSnapshot {
  tableName: string;
  rowCount: number;
  checksumSha256: string;
  records: Array<Record<string, unknown>>;
}

export interface DatabaseBackupSnapshot {
  snapshotId: string;
  lcId: string;
  schemaVersion: string;
  createdAt: string; // ISO 8601
  totalTablesCount: number;
  totalRecordsCount: number;
  snapshotDigestSha256: string;
  tables: Record<string, TableSnapshot>;
  latestTransactionTimestamp: string; // ISO 8601
}

export type RestoreStatus = 'IN_PROGRESS' | 'COMPLETED_SUCCESS' | 'FAILED_INTEGRITY' | 'FAILED_RPO_BREACH' | 'FAILED_RTO_BREACH';

export interface RestoreDrillExecution {
  drillId: string;
  snapshotId: string;
  targetEnvironment: string; // e.g. 'clean-sandbox-isolated'
  initiatedAt: string; // ISO 8601
  completedAt?: string; // ISO 8601
  status: RestoreStatus;
  operatorUserId: string;
}

export interface RestoreValidationReport {
  drillId: string;
  snapshotId: string;
  targetEnvironment: string;
  executionTimestamp: string;
  // RPO metrics (DEC-007: RPO <= 24 hours)
  snapshotAgeHours: number;
  rpoLimitHours: number;
  isRpoCompliant: boolean;
  // RTO metrics (DEC-007: RTO <= 72 hours)
  recoveryDurationMs: number;
  recoveryDurationHours: number;
  rtoLimitHours: number;
  isRtoCompliant: boolean;
  // Data Integrity Verification
  isChecksumVerified: boolean;
  sourceDigest: string;
  restoredDigest: string;
  // Parity Metrics
  tablesRestoredCount: number;
  recordsRestoredCount: number;
  tableParityVerified: boolean;
  mismatchedTables: string[];
  // Statutory Invariants
  auditChainIntegrityVerified: boolean; // INV-02
  tenantIsolationVerified: boolean; // INV-04
  isDrillSuccessful: boolean;
  auditNotes: string;
}

export interface MigrationRollbackStep {
  migrationId: string;
  name: string;
  appliedAt: string;
  rolledBackAt?: string;
  status: 'PENDING' | 'APPLIED' | 'ROLLED_BACK' | 'FAILED';
  upChecksum: string;
  downChecksum: string;
}

export interface MigrationRollbackReport {
  drillId: string;
  initialSchemaVersion: string;
  targetSchemaVersion: string;
  rolledBackSchemaVersion: string;
  isRollbackSuccessful: boolean;
  tablesCreated: string[];
  tablesCleaned: string[];
  danglingConstraintsCount: number;
  orphanedRecordsCount: number;
  verifiedAt: string;
}

export interface DisasterRecoveryAuditCertificate {
  certificateId: string;
  drillId: string;
  entity: string; // 'AIESEC in Rabat'
  issuedAt: string;
  evaluatedRpoHours: number;
  evaluatedRtoMinutes: number;
  rpoStatus: 'SATISFIED' | 'BREACHED';
  rtoStatus: 'SATISFIED' | 'BREACHED';
  integrityStatus: 'VERIFIED_ZERO_CORRUPTION' | 'CORRUPTED';
  auditChainStatus: 'UNBROKEN_HASH_CHAIN' | 'BROKEN';
  certifiedByRole: string; // 'LCVP iGV / Operational Safety Desk'
  gateG7PreconditionMet: boolean;
}
