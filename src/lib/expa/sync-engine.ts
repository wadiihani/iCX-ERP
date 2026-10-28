/**
 * EXPA Read-Sync Engine: Cursor Pagination, Staging & Conflict Detection
 * Baseline: REQ-042, REQ-043, DEC-003, and TEST-040
 */

import type {
  ExpaApplicationNode,
  ExpaPageInfo,
  ExpaSyncResult,
  ConflictRecord,
} from './types';

export interface LocalApplicationSummary {
  id: string;
  expaApplicationId?: string | null;
  status: string;
  epName: string;
  notes?: string | null;
  updatedAt: string;
}

export interface RawPayloadStagingEntry {
  id: string;
  syncBatchId: string;
  lcId: string;
  entityType: 'APPLICATION';
  remoteId: string;
  rawJson: Record<string, unknown>;
  fetchedAt: string;
}

/**
 * Builds raw forensic staging entries from an EXPA GraphQL batch before schema transformation.
 * Preserves raw JSON untouched per DEC-003.
 */
export function buildRawStagingEntries(
  batchId: string,
  lcId: string,
  nodes: ExpaApplicationNode[]
): RawPayloadStagingEntry[] {
  const fetchedAt = new Date().toISOString();

  return nodes.map((node) => ({
    id: `raw_${batchId}_${node.id}`,
    syncBatchId: batchId,
    lcId,
    entityType: 'APPLICATION',
    remoteId: node.id,
    rawJson: node as unknown as Record<string, unknown>,
    fetchedAt,
  }));
}

/**
 * Detects conflicts between remote EXPA application state and local ERP application state.
 * Never silently overwrites local planning data (DEC-003).
 */
export function detectExpaConflicts(
  remoteNode: ExpaApplicationNode,
  localApp?: LocalApplicationSummary | null
): ConflictRecord[] {
  if (!localApp) return [];

  const conflicts: ConflictRecord[] = [];
  const detectedAt = new Date().toISOString();

  // 1. Status Discrepancy
  const normalizedRemoteStatus = remoteNode.status.toLowerCase();
  const normalizedLocalStatus = localApp.status.toLowerCase();

  if (normalizedRemoteStatus !== normalizedLocalStatus) {
    conflicts.push({
      expaId: remoteNode.id,
      localApplicationId: localApp.id,
      field: 'status',
      localValue: localApp.status,
      remoteValue: remoteNode.status,
      detectedAt,
      resolutionStatus: 'PENDING_REVIEW',
    });
  }

  // 2. EP Name Discrepancy (if updated on EXPA)
  if (
    remoteNode.person?.full_name &&
    remoteNode.person.full_name.trim().toLowerCase() !== localApp.epName.trim().toLowerCase()
  ) {
    conflicts.push({
      expaId: remoteNode.id,
      localApplicationId: localApp.id,
      field: 'ep_name',
      localValue: localApp.epName,
      remoteValue: remoteNode.person.full_name,
      detectedAt,
      resolutionStatus: 'PENDING_REVIEW',
    });
  }

  return conflicts;
}

/**
 * Simulates pagination offset/cursor management for batch fetch.
 */
export function paginateNodes(
  allNodes: ExpaApplicationNode[],
  pageSize: number = 2,
  afterCursor?: string | null
): { nodes: ExpaApplicationNode[]; pageInfo: ExpaPageInfo } {
  const startIndex = afterCursor ? parseInt(afterCursor, 10) + 1 : 0;
  const endIndex = Math.min(startIndex + pageSize, allNodes.length);
  const nodes = allNodes.slice(startIndex, endIndex);

  const hasNextPage = endIndex < allNodes.length;
  const endCursor = hasNextPage ? (endIndex - 1).toString() : null;

  return {
    nodes,
    pageInfo: {
      has_next_page: hasNextPage,
      end_cursor: endCursor,
      total_count: allNodes.length,
    },
  };
}
