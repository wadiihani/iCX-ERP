/**
 * AIESEC iCX ERP — Full System Export Engine & Audit Logger
 * Author: Wadii Hani <wadii.hani.pro@gmail.com>
 * Specification: iCX_Data_Integrity_Tracking_Spec.md v1.0 (§13.3, §16 T-19)
 * Milestone: M8 (Plan 08-04)
 * Enforces: INV-09 (Universal Audit Trail), Acceptance Test T-19
 */

import type { FullExportBundle, HandoffPacket } from '../types/data-integrity';
import { getMasterTrackerDb } from './master-tracker';
import { disasterRecoveryService } from './disaster-recovery';
import { proofVaultService } from './proof-vault';
import { getHandoffDb } from './handoff-workflow';
import { STATUTORY_RULE_SEEDS } from './rules';

export class FullExportService {
  /**
   * Helper to convert an array of record objects into standard CSV text.
   */
  public convertRecordsToCsv(records: Record<string, unknown>[]): string {
    if (!records || records.length === 0) {
      return '';
    }

    const headers = Object.keys(records[0]);
    const escapeCsv = (val: unknown): string => {
      if (val === null || val === undefined) return '';
      if (typeof val === 'object') {
        const json = JSON.stringify(val);
        return `"${json.replace(/"/g, '""')}"`;
      }
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headerRow = headers.join(',');
    const rows = records.map((row) =>
      headers.map((h) => escapeCsv(row[h])).join(',')
    );

    return [headerRow, ...rows].join('\n');
  }

  /**
   * Acceptance Test T-19: CSV Export with Mandatory Audit Log.
   * "Given any CSV export, then an audit_log row records actor, scope, row count."
   */
  public exportTableCsv(
    tableName: string,
    actorId: string,
    scope = 'operational'
  ): { csv: string; rowCount: number; auditLogId: number } {
    if (!actorId || actorId.trim() === '') {
      throw new Error('Actor ID is required for CSV export audit trail (INV-09, T-19).');
    }

    const tables = disasterRecoveryService.gatherOperationalTables();
    const records = (tables[tableName] ?? []) as Record<string, unknown>[];
    const rowCount = records.length;
    const csv = this.convertRecordsToCsv(records);

    const now = new Date().toISOString();
    const masterDb = getMasterTrackerDb();
    const logId = masterDb.auditLogs.length + 1;

    // Enforce Acceptance Test T-19: Audit log row records actor, scope, row count
    masterDb.auditLogs.push({
      id: logId,
      ts: now,
      actor: actorId,
      action: 'CSV_EXPORT',
      table_name: tableName,
      record_id: `export_${tableName}_${Date.now()}`,
      before: undefined,
      after: {
        actor: actorId,
        scope,
        table_name: tableName,
        row_count: rowCount,
        format: 'csv',
      },
    });

    return {
      csv,
      rowCount,
      auditLogId: logId,
    };
  }

  /**
   * Generates a Full Export Bundle (§13.3):
   * Tables + Proof Index + Handoff Packet + Rule Registry State.
   * Emits audit_log entry capturing actor, scope, and total row count (INV-09, T-19).
   */
  public generateFullExportBundle(
    actorId: string,
    scope = 'full_system',
    handoffRecordId?: string
  ): FullExportBundle {
    if (!actorId || actorId.trim() === '') {
      throw new Error('Actor ID is required for full export bundle (INV-09).');
    }

    const now = new Date().toISOString();
    const tables = disasterRecoveryService.gatherOperationalTables();
    const snapshotPayload = disasterRecoveryService.createNightlySnapshot(tables);
    const proofIndex = proofVaultService.listProofs();

    let handoffPacket: HandoffPacket | null = null;
    if (handoffRecordId) {
      const handoffDb = getHandoffDb();
      const hRecord = handoffDb.handoffs.get(handoffRecordId);
      if (hRecord) {
        handoffPacket = hRecord.packet;
      }
    }

    const bundle: FullExportBundle = {
      exported_at: now,
      actor_id: actorId,
      scope,
      manifest: snapshotPayload.manifest,
      tables,
      proofIndex,
      handoffPacket,
      ruleRegistryState: {
        version: '1.0',
        active_rules_count: STATUTORY_RULE_SEEDS.length,
        rules: STATUTORY_RULE_SEEDS,
      },
    };

    // Universal audit log (INV-09, T-19)
    const masterDb = getMasterTrackerDb();
    const logId = masterDb.auditLogs.length + 1;
    masterDb.auditLogs.push({
      id: logId,
      ts: now,
      actor: actorId,
      action: 'FULL_EXPORT_BUNDLE',
      table_name: 'full_export_bundle',
      record_id: `bundle_${Date.now()}`,
      before: undefined,
      after: {
        actor: actorId,
        scope,
        total_rows: snapshotPayload.manifest.totalRows,
        table_count: Object.keys(snapshotPayload.manifest.tables).length,
        manifest_checksum: snapshotPayload.manifest.manifestChecksum,
      },
    });

    return bundle;
  }
}

export const fullExportService = new FullExportService();
