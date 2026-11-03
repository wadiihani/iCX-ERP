/**
 * AIESEC iCX ERP — Disaster Recovery, Snapshot Manifest & Restore Verifier
 * Author: Wadii Hani <wadii.hani.pro@gmail.com>
 * Specification: iCX_Data_Integrity_Tracking_Spec.md v1.0 (§13.3, §16 T-14)
 * Milestone: M8 (Plan 08-03)
 * Enforces: G1 (No Record is Ever Lost), INV-01, Acceptance Test T-14
 */

import crypto from 'crypto';
import type { SnapshotManifest } from '../types/data-integrity';
import { getMasterTrackerDb } from './master-tracker';
import { getQualityCasesDb } from './quality-cases';
import { getIrEcosystemDb } from './ir-ecosystem';
import { getComplianceDb } from './compliance-calendar';
import { getHandoffDb } from './handoff-workflow';
import { statusGovernanceService } from './status-governance';
import { STATUTORY_RULE_SEEDS } from './rules';

export interface SnapshotPayload {
  manifest: SnapshotManifest;
  tableData: Record<string, string>; // CSV or serialized JSON representation per table
}

export interface RestoreVerificationResult {
  success: boolean;
  totalTablesChecked: number;
  matchedTables: string[];
  discrepancies: string[];
  totalRestoredRows: number;
}

export interface ScratchDatabaseState {
  tables: Map<string, unknown[]>;
}

export class DisasterRecoveryService {
  private snapshotArchive: Map<string, SnapshotPayload> = new Map();

  /**
   * Computes a deterministic SHA-256 hash for any content string.
   */
  public computeSha256(content: string): string {
    return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
  }

  /**
   * Serializes a table's records into a canonical JSON string for hashing and CSV export.
   */
  public serializeTable(records: unknown[]): string {
    // Sort array by id if present to ensure deterministic hashing
    const sorted = [...records].sort((a: any, b: any) => {
      const idA = a?.id ?? '';
      const idB = b?.id ?? '';
      return String(idA).localeCompare(String(idB));
    });
    return JSON.stringify(sorted);
  }

  /**
   * Gathers live operational datasets across all business tables.
   */
  public gatherOperationalTables(): Record<string, unknown[]> {
    const masterDb = getMasterTrackerDb();
    const qualityDb = getQualityCasesDb();
    const irDb = getIrEcosystemDb();
    const compDb = getComplianceDb();
    const handoffDb = getHandoffDb();

    return {
      op_partner: Array.from(masterDb.partners.values()),
      opportunity: Array.from(masterDb.opportunities.values()),
      exchange: Array.from(masterDb.exchanges.values()),
      case_quality: Array.from(qualityDb.cases.values()),
      status_request: statusGovernanceService.listStatusRequests(),
      ir_partner: Array.from(irDb.irPartners.values()),
      compliance_item: Array.from(compDb.items.values()),
      handoff_record: Array.from(handoffDb.handoffs.values()),
      rule_registry: [...STATUTORY_RULE_SEEDS],
      audit_log: [...masterDb.auditLogs],
    };
  }

  /**
   * Generates a complete nightly snapshot with manifest and per-table checksums (§13.3).
   */
  public createNightlySnapshot(
    customTables?: Record<string, unknown[]>,
    environment = 'production'
  ): SnapshotPayload {
    const tables = customTables ?? this.gatherOperationalTables();
    const timestamp = new Date().toISOString();

    const manifestTables: Record<string, { rowCount: number; sha256: string }> = {};
    const tableData: Record<string, string> = {};
    let totalRows = 0;

    const tableNames = Object.keys(tables).sort();
    const checksumConcat: string[] = [];

    for (const tableName of tableNames) {
      const records = tables[tableName] ?? [];
      const serialized = this.serializeTable(records);
      const sha256 = this.computeSha256(serialized);
      const rowCount = records.length;

      manifestTables[tableName] = { rowCount, sha256 };
      tableData[tableName] = serialized;
      totalRows += rowCount;
      checksumConcat.push(`${tableName}:${sha256}:${rowCount}`);
    }

    const manifestChecksum = this.computeSha256(
      `${timestamp}:${environment}:${checksumConcat.join('|')}`
    );

    const manifest: SnapshotManifest = {
      timestamp,
      environment,
      tables: manifestTables,
      totalRows,
      manifestChecksum,
    };

    const payload: SnapshotPayload = {
      manifest,
      tableData,
    };

    // Store in snapshot archive
    this.snapshotArchive.set(timestamp, payload);
    this.enforceRetentionSchedule();

    return payload;
  }

  /**
   * Enforces retention policy: 30 daily snapshots + 12 weekly snapshots (§13.3).
   */
  public enforceRetentionSchedule(): void {
    const maxEntries = 42; // 30 daily + 12 weekly
    if (this.snapshotArchive.size > maxEntries) {
      const sortedKeys = Array.from(this.snapshotArchive.keys()).sort();
      const toDelete = sortedKeys.slice(0, sortedKeys.length - maxEntries);
      for (const k of toDelete) {
        this.snapshotArchive.delete(k);
      }
    }
  }

  public getSnapshotArchive(): Map<string, SnapshotPayload> {
    return this.snapshotArchive;
  }

  public clearSnapshotArchive(): void {
    this.snapshotArchive.clear();
  }

  /**
   * Acceptance Test T-14: Scripted Restore & Verification.
   * "Given last night's snapshot, when restored to a scratch DB, then row counts and checksums match the manifest."
   */
  public restoreToScratchDb(
    snapshot: SnapshotPayload,
    targetScratchDb?: ScratchDatabaseState
  ): {
    scratchDb: ScratchDatabaseState;
    verification: RestoreVerificationResult;
  } {
    const scratchDb: ScratchDatabaseState = targetScratchDb ?? {
      tables: new Map(),
    };

    const matchedTables: string[] = [];
    const discrepancies: string[] = [];
    let totalRestoredRows = 0;

    const manifestTables = snapshot.manifest.tables;
    const tableNames = Object.keys(manifestTables);

    for (const tableName of tableNames) {
      const expectedMeta = manifestTables[tableName];
      const serializedData = snapshot.tableData[tableName];

      if (!serializedData) {
        discrepancies.push(`Missing serialized data for table '${tableName}'`);
        continue;
      }

      // Restore data to scratch DB
      let restoredRecords: unknown[];
      try {
        restoredRecords = JSON.parse(serializedData);
      } catch (err: any) {
        discrepancies.push(`Failed to parse data for table '${tableName}': ${err.message}`);
        continue;
      }

      scratchDb.tables.set(tableName, restoredRecords);
      totalRestoredRows += restoredRecords.length;

      // Recompute row count and checksum on restored table
      const restoredSerialized = this.serializeTable(restoredRecords);
      const computedSha256 = this.computeSha256(restoredSerialized);
      const computedRowCount = restoredRecords.length;

      // Verify row count matches manifest exactly
      if (computedRowCount !== expectedMeta.rowCount) {
        discrepancies.push(
          `Row count mismatch on '${tableName}': expected ${expectedMeta.rowCount}, restored ${computedRowCount}`
        );
      }

      // Verify sha256 checksum matches manifest exactly
      if (computedSha256 !== expectedMeta.sha256) {
        discrepancies.push(
          `SHA-256 checksum mismatch on '${tableName}': expected ${expectedMeta.sha256}, restored ${computedSha256}`
        );
      }

      if (computedRowCount === expectedMeta.rowCount && computedSha256 === expectedMeta.sha256) {
        matchedTables.push(tableName);
      }
    }

    // Verify total row count
    if (totalRestoredRows !== snapshot.manifest.totalRows) {
      discrepancies.push(
        `Total rows mismatch: expected ${snapshot.manifest.totalRows}, restored ${totalRestoredRows}`
      );
    }

    const verification: RestoreVerificationResult = {
      success: discrepancies.length === 0,
      totalTablesChecked: tableNames.length,
      matchedTables,
      discrepancies,
      totalRestoredRows,
    };

    return {
      scratchDb,
      verification,
    };
  }
}

export const disasterRecoveryService = new DisasterRecoveryService();
