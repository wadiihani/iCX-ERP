/**
 * CSV / Excel Lead Import Wizard & Batch Commit Engine
 * Baseline: REQ-011, REQ-012, DEC-001, TEST-019, and TEST-020
 */

import { validateICE } from '../validation/moroccan-tax';
import { detectDuplicate, normalizeOrgName, type OrganizationRecord } from './deduplication';

export interface RawLeadRow {
  name: string;
  ice_number?: string;
  tax_id?: string;
  phone?: string;
  email?: string;
  contact_name?: string;
  contact_role?: string;
  city?: string;
  industry?: string;
  lead_status?: string;
}

export interface ProcessedLeadItem {
  rowIndex: number;
  data: RawLeadRow;
  normalizedName: string;
  validationErrors: string[];
  isDuplicate: boolean;
  duplicateDetails?: {
    confidenceScore: number;
    matchReason?: string;
    matchedId?: string;
    matchedName?: string;
  };
  resolutionAction: 'INSERT' | 'SKIP' | 'UPDATE_EXISTING';
}

export interface DryRunImportResult {
  totalRows: number;
  validRowsCount: number;
  errorRowsCount: number;
  duplicateRowsCount: number;
  netNewRowsCount: number;
  items: ProcessedLeadItem[];
}

export interface BatchCommitPayload {
  batchId: string;
  lcId: string;
  committedBy: string;
  createdAt: string;
  insertedOrgIds: string[];
  skippedCount: number;
}

/**
 * Parses raw lead rows and runs dry-run duplicate and statutory validation.
 */
export function dryRunLeadImport(
  rawRows: RawLeadRow[],
  existingRecords: OrganizationRecord[]
): DryRunImportResult {
  const items: ProcessedLeadItem[] = [];
  let validRowsCount = 0;
  let errorRowsCount = 0;
  let duplicateRowsCount = 0;
  let netNewRowsCount = 0;

  for (let index = 0; index < rawRows.length; index++) {
    const row = rawRows[index];
    const validationErrors: string[] = [];

    // 1. Mandatory Name Check
    if (!row.name || row.name.trim().length < 2) {
      validationErrors.push('Organization name is required and must have at least 2 characters.');
    }

    // 2. ICE Validation if provided
    if (row.ice_number) {
      const iceResult = validateICE(row.ice_number);
      if (!iceResult.isValid && iceResult.error) {
        validationErrors.push(iceResult.error);
      }
    }

    const normName = normalizeOrgName(row.name);

    // 3. Duplicate Detection
    const dupCheck = detectDuplicate(row, existingRecords);

    let resolutionAction: 'INSERT' | 'SKIP' | 'UPDATE_EXISTING' = 'INSERT';
    if (validationErrors.length > 0) {
      resolutionAction = 'SKIP';
      errorRowsCount++;
    } else if (dupCheck.isDuplicate) {
      resolutionAction = 'SKIP'; // Default to skip duplicate in safe mode
      duplicateRowsCount++;
    } else {
      validRowsCount++;
      netNewRowsCount++;
    }

    items.push({
      rowIndex: index + 1,
      data: row,
      normalizedName: normName,
      validationErrors,
      isDuplicate: dupCheck.isDuplicate,
      duplicateDetails: dupCheck.isDuplicate
        ? {
            confidenceScore: dupCheck.confidenceScore,
            matchReason: dupCheck.matchReason,
            matchedId: dupCheck.matchedRecord?.id,
            matchedName: dupCheck.matchedRecord?.name,
          }
        : undefined,
      resolutionAction,
    });
  }

  return {
    totalRows: rawRows.length,
    validRowsCount,
    errorRowsCount,
    duplicateRowsCount,
    netNewRowsCount,
    items,
  };
}

/**
 * Generates reversible batch commit metadata.
 */
export function createBatchCommit(
  lcId: string,
  committedBy: string,
  itemsToInsert: ProcessedLeadItem[]
): BatchCommitPayload {
  const batchId = `batch_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const insertedOrgIds = itemsToInsert
    .filter((item) => item.resolutionAction === 'INSERT' && item.validationErrors.length === 0)
    .map((item, idx) => `org_${batchId}_${idx}`);

  const skippedCount = itemsToInsert.filter((item) => item.resolutionAction === 'SKIP').length;

  return {
    batchId,
    lcId,
    committedBy,
    createdAt: new Date().toISOString(),
    insertedOrgIds,
    skippedCount,
  };
}
