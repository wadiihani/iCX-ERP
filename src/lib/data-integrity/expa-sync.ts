/**
 * AIESEC iCX ERP — EXPA Synchronization & Reconciliation Engine
 * Author: Wadii Hani <wadii.hani.pro@gmail.com>
 * Specification: iCX_Data_Integrity_Tracking_Spec.md v1.0 (§13.1, §13.2, §16 T-04, T-05, T-06)
 * Milestone: M1 (Plan 01-03)
 * Enforces: INV-01 (Never delete missing rows), INV-04 (EXPA is authoritative for status/dates),
 *           DQ-082 (Row-drop quarantine guard), DQ-040..DQ-042 (Status/date reconciliation),
 *           DQ-011 (Inactive owner detection)
 */

import crypto from 'crypto';
import type {
  ExStatus,
  BreakType,
  Programme,
  ImportBatch,
  DqIssue,
  Member,
  Exchange,
} from '../types/data-integrity';
import { getEffectiveRule } from './rules';
import { getMasterTrackerDb, exchangeService } from './master-tracker';

export interface ExpaSyncRow {
  expa_ep_id: number;
  full_name: string;
  email?: string;
  phone?: string;
  home_entity_name?: string;
  home_entity_country?: string;
  opportunity_id?: string;
  programme?: Programme;
  status: ExStatus;
  break_type?: BreakType | null;
  approved_at?: string | null;
  re_date?: string | null;
  fi_date?: string | null;
  co_date?: string | null;
}

export interface ExpaSyncResult {
  batch: ImportBatch;
  quarantined: boolean;
  status: 'applied' | 'quarantined' | 'failed';
  rowsIn: number;
  rowsOk: number;
  rowsRejected: number;
  reconciledCount: number;
  dqIssues: Omit<DqIssue, 'id'>[];
}

/**
 * Computes SHA-256 hash of import payload for tamper-evidence.
 */
export function computeFileSha256(content: string | Buffer): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Validates canonical EXPA export CSV/JSON headers.
 */
export function validateExpaSchema(headers: string[]): {
  valid: boolean;
  missingHeaders: string[];
} {
  const mandatoryHeaders = ['expa_ep_id', 'full_name', 'status'];
  const normalized = headers.map((h) => h.trim().toLowerCase());
  const missingHeaders = mandatoryHeaders.filter((h) => !normalized.includes(h));

  return {
    valid: missingHeaders.length === 0,
    missingHeaders,
  };
}

/**
 * Guard: DQ-082 Row-drop quarantine check (§13.2, T-04)
 */
export function checkRowDropQuarantine(
  incomingRowCount: number,
  previousRowCount?: number | null,
  customThresholdPct?: number
): {
  quarantined: boolean;
  dropPct: number;
  reason?: string;
} {
  if (previousRowCount === undefined || previousRowCount === null || previousRowCount <= 0) {
    return { quarantined: false, dropPct: 0 };
  }

  // Get threshold from rule_registry or use default 5%
  const thresholdRule = getEffectiveRule<number>('import.max_row_drop_pct');
  const thresholdPct = customThresholdPct ?? thresholdRule?.value ?? 5;

  if (incomingRowCount < previousRowCount) {
    const dropCount = previousRowCount - incomingRowCount;
    const dropPct = (dropCount / previousRowCount) * 100;

    if (dropPct > thresholdPct) {
      return {
        quarantined: true,
        dropPct,
        reason: `Incoming batch row count (${incomingRowCount}) dropped by ${dropPct.toFixed(1)}% vs previous batch (${previousRowCount}), exceeding max allowed drop of ${thresholdPct}%. Batch quarantined under Rule DQ-082.`,
      };
    }
  }

  return { quarantined: false, dropPct: 0 };
}

/**
 * In-memory Import Batches Store
 */
const importBatches: ImportBatch[] = [];

export function getImportBatches(): ImportBatch[] {
  return importBatches;
}

export function resetImportBatches(): void {
  importBatches.length = 0;
}

export function getLatestSuccessfulBatch(): ImportBatch | null {
  for (let i = importBatches.length - 1; i >= 0; i--) {
    if (importBatches[i].status === 'applied') {
      return importBatches[i];
    }
  }
  return null;
}

/**
 * Authoritative EXPA Ingestion & Reconciliation Pipeline (§13.1, INV-04)
 */
export function syncExpaBatch(payload: {
  rawContent: string;
  rows: ExpaSyncRow[];
  actorId: string;
  source?: 'expa_csv' | 'expa_api' | 'manual_csv';
  customThresholdPct?: number;
}): ExpaSyncResult {
  const { rawContent, rows, actorId, source = 'expa_csv', customThresholdPct } = payload;
  const now = new Date().toISOString();
  const fileHash = computeFileSha256(rawContent);
  const db = getMasterTrackerDb();
  const dqIssues: Omit<DqIssue, 'id'>[] = [];

  // Check row-drop quarantine (DQ-082, T-04)
  const lastBatch = getLatestSuccessfulBatch();
  const quarantineCheck = checkRowDropQuarantine(rows.length, lastBatch?.rows_in, customThresholdPct);

  if (quarantineCheck.quarantined) {
    const batch: ImportBatch = {
      id: importBatches.length + 1,
      source,
      file_sha256: fileHash,
      rows_in: rows.length,
      rows_ok: 0,
      rows_rejected: rows.length,
      schema_version: 'v1',
      status: 'quarantined',
      quarantine_reason: quarantineCheck.reason,
      created_at: now,
    };
    importBatches.push(batch);

    // Create DQ-082 issue
    const dq082: Omit<DqIssue, 'id'> = {
      rule_id: 'DQ-082',
      subject: `EXPA Import Batch #${batch.id} quarantined due to ${quarantineCheck.dropPct.toFixed(1)}% row drop`,
      severity: 'Blocker',
      detected_at: now,
      owner_id: actorId,
      details: {
        batch_id: batch.id,
        file_sha256: fileHash,
        rows_in: rows.length,
        previous_rows: lastBatch?.rows_in,
        drop_pct: quarantineCheck.dropPct,
        reason: quarantineCheck.reason,
      },
    };
    dqIssues.push(dq082);

    return {
      batch,
      quarantined: true,
      status: 'quarantined',
      rowsIn: rows.length,
      rowsOk: 0,
      rowsRejected: rows.length,
      reconciledCount: 0,
      dqIssues,
    };
  }

  // Batch accepted: process reconciliation row by row
  let okCount = 0;
  let reconciledCount = 0;
  const incomingExpaEpIds = new Set<number>();

  for (const row of rows) {
    incomingExpaEpIds.add(row.expa_ep_id);

    // Find EP in tracker
    let matchingEp: ReturnType<typeof db.eps.get> = undefined;
    for (const ep of Array.from(db.eps.values())) {
      if (!ep.deleted_at && ep.expa_ep_id === row.expa_ep_id) {
        matchingEp = ep;
        break;
      }
    }

    if (!matchingEp) {
      // EP missing from tracker (DQ-042)
      dqIssues.push({
        rule_id: 'DQ-042',
        subject: `EP in EXPA missing from tracker (EXPA ID: ${row.expa_ep_id})`,
        severity: 'Blocker',
        detected_at: now,
        owner_id: actorId,
        details: { expa_ep_id: row.expa_ep_id, full_name: row.full_name },
      });
      continue;
    }

    // Find exchange
    let matchingExchange: Exchange | undefined = undefined;
    for (const ex of Array.from(db.exchanges.values())) {
      if (!ex.deleted_at && ex.ep_id === matchingEp.id) {
        matchingExchange = ex;
        break;
      }
    }

    if (!matchingExchange) {
      continue;
    }

    // Status conflict check (INV-04, T-05)
    if (matchingExchange.status !== row.status) {
      const trackerStatus = matchingExchange.status;
      const expaStatus = row.status;

      // Raise DQ-040 and auto-resolve because EXPA wins
      const dq040: Omit<DqIssue, 'id'> = {
        rule_id: 'DQ-040',
        subject: `Tracker status (${trackerStatus}) disagrees with EXPA status (${expaStatus}) for EP ${row.expa_ep_id}`,
        severity: 'Blocker',
        detected_at: now,
        resolved_at: now,
        owner_id: matchingExchange.owner_id,
        details: {
          exchange_id: matchingExchange.id,
          expa_ep_id: row.expa_ep_id,
          tracker_status: trackerStatus,
          expa_status: expaStatus,
          resolution_note: 'Auto-resolved: EXPA is source of truth for exchange status (INV-04)',
        },
      };
      dqIssues.push(dq040);

      // Overwrite tracker status with EXPA status and log source = expa_sync
      const transitionRes = exchangeService.transitionStatus(matchingExchange.id, expaStatus, {
        actorId,
        source: 'expa_sync',
        reason: `Reconciled from EXPA sync (${trackerStatus} -> ${expaStatus})`,
        breakType: row.break_type,
      });

      matchingExchange = transitionRes.updatedExchange;
      reconciledCount++;
    }

    // Date reconciliation (DQ-041)
    if (
      (row.approved_at && row.approved_at !== matchingExchange.approved_at) ||
      (row.re_date && row.re_date !== matchingExchange.re_date) ||
      (row.fi_date && row.fi_date !== matchingExchange.fi_date) ||
      (row.co_date && row.co_date !== matchingExchange.co_date)
    ) {
      dqIssues.push({
        rule_id: 'DQ-041',
        subject: `Date mismatch between tracker and EXPA for EP ${row.expa_ep_id}`,
        severity: 'Warn',
        detected_at: now,
        resolved_at: now,
        owner_id: matchingExchange.owner_id,
        details: {
          exchange_id: matchingExchange.id,
          tracker_dates: {
            approved_at: matchingExchange.approved_at,
            re_date: matchingExchange.re_date,
            fi_date: matchingExchange.fi_date,
            co_date: matchingExchange.co_date,
          },
          expa_dates: {
            approved_at: row.approved_at,
            re_date: row.re_date,
            fi_date: row.fi_date,
            co_date: row.co_date,
          },
        },
      });

      // Update dates to match EXPA
      matchingExchange.approved_at = row.approved_at ?? matchingExchange.approved_at;
      matchingExchange.re_date = row.re_date ?? matchingExchange.re_date;
      matchingExchange.fi_date = row.fi_date ?? matchingExchange.fi_date;
      matchingExchange.co_date = row.co_date ?? matchingExchange.co_date;
      db.exchanges.set(matchingExchange.id, matchingExchange);
    }

    okCount++;
  }

  // Check reverse: EPs present in tracker but missing from EXPA (DQ-042, keep records per INV-01)
  for (const ep of Array.from(db.eps.values())) {
    if (!ep.deleted_at && !incomingExpaEpIds.has(ep.expa_ep_id)) {
      dqIssues.push({
        rule_id: 'DQ-042',
        subject: `EP present in tracker but missing from EXPA export (EXPA ID: ${ep.expa_ep_id})`,
        severity: 'Warn',
        detected_at: now,
        owner_id: ep.owner_id,
        details: {
          ep_id: ep.id,
          expa_ep_id: ep.expa_ep_id,
          note: 'Record retained in tracker per INV-01 (no hard deletes)',
        },
      });
    }
  }

  const batch: ImportBatch = {
    id: importBatches.length + 1,
    source,
    file_sha256: fileHash,
    rows_in: rows.length,
    rows_ok: okCount,
    rows_rejected: rows.length - okCount,
    schema_version: 'v1',
    status: 'applied',
    quarantine_reason: null,
    created_at: now,
  };
  importBatches.push(batch);

  return {
    batch,
    quarantined: false,
    status: 'applied',
    rowsIn: rows.length,
    rowsOk: okCount,
    rowsRejected: rows.length - okCount,
    reconciledCount,
    dqIssues,
  };
}

/**
 * Inactive Owner Scanner (DQ-011, Acceptance Test T-06)
 * Detects records owned by deactivated members and generates DQ-011 handoff tasks.
 */
export function scanInactiveOwners(
  members: Member[],
  records: { id: string; owner_id: string; type: string }[]
): Omit<DqIssue, 'id'>[] {
  const memberMap = new Map<string, Member>();
  for (const m of members) {
    memberMap.set(m.id, m);
  }

  const issues: Omit<DqIssue, 'id'>[] = [];
  const now = new Date().toISOString();

  for (const record of records) {
    const owner = memberMap.get(record.owner_id);
    if (!owner || !owner.active) {
      issues.push({
        rule_id: 'DQ-011',
        subject: `Active ${record.type} record ${record.id} owned by inactive member ${owner?.name ?? record.owner_id}`,
        severity: 'Blocker',
        detected_at: now,
        owner_id: record.owner_id,
        details: {
          record_id: record.id,
          record_type: record.type,
          owner_id: record.owner_id,
          owner_name: owner?.name,
          handoff_required: true,
        },
      });
    }
  }

  return issues;
}
