/**
 * AIESEC iCX ERP — Status-Change Governance & Request Lifecycle Machine
 * Author: Wadii Hani <wadii.hani.pro@gmail.com>
 * Specification: iCX_Data_Integrity_Tracking_Spec.md v1.0 (§7 Module C)
 * Milestone: M3 (Plan 03-01)
 * Enforces: INV-01 (Soft Deletes), INV-03 (Owner Required), INV-06 (Single EP), INV-09 (Attribution)
 */

import type {
  StatusRequest,
  StatusRequestKind,
  StatusRequestLifecycle,
} from '../types/data-integrity';
import {
  assertNoHardDelete,
  createSoftDeletePayload,
  InvariantViolationError,
} from './invariants';
import { getMasterTrackerDb } from './master-tracker';

/**
 * Storage for status requests in memory
 */
interface StatusRequestDbStore {
  requests: Map<string, StatusRequest>;
}

const statusRequestDb: StatusRequestDbStore = {
  requests: new Map(),
};

export function resetStatusRequestDb(): void {
  statusRequestDb.requests.clear();
}

/**
 * Valid state transitions for the finite state machine (§7.5)
 */
const VALID_TRANSITIONS: Record<StatusRequestLifecycle, StatusRequestLifecycle[]> = {
  draft: ['ready'],
  ready: ['draft', 'submitted'],
  submitted: ['approved', 'rejected'],
  approved: ['applied_in_expa'],
  rejected: [],
  applied_in_expa: [],
};

export interface CreateStatusRequestParams {
  id?: string;
  exchange_id: string;
  ep_id: string;
  kind: StatusRequestKind;
  desired_date?: string | null;
  reason: string;
  apip_clause_ref?: string | null;
  ticket_ref?: string | null;
  checklist_state?: Record<string, boolean>;
  evidence_proof_ids?: string[];
  owner_id: string;
}

export interface TransitionLifecycleOptions {
  ticket_ref?: string;
  rejection_reason?: string;
  timestamp?: string;
}

export const statusGovernanceService = {
  /**
   * Creates a new status request in 'draft' state.
   * Strictly enforces INV-03 (owner required) and INV-06 (single EP isolation).
   */
  createStatusRequest(params: CreateStatusRequestParams, actorId: string): StatusRequest {
    if (!params.owner_id) {
      throw new InvariantViolationError(
        'INV-03',
        'Status request must have an active owner_id (INV-03).'
      );
    }

    if (!params.exchange_id) {
      throw new Error('exchange_id is required.');
    }

    if (!params.ep_id) {
      throw new Error('ep_id is required.');
    }

    if (!params.reason || params.reason.trim().length === 0) {
      throw new Error('reason is required.');
    }

    const masterDb = getMasterTrackerDb();
    const exchange = masterDb.exchanges.get(params.exchange_id);
    if (!exchange || exchange.deleted_at) {
      throw new Error(`Exchange '${params.exchange_id}' not found or has been soft-deleted.`);
    }

    // Enforce INV-06: Ticket & request covers exactly one EP and must match exchange EP
    if (exchange.ep_id !== params.ep_id) {
      throw new InvariantViolationError(
        'INV-06',
        `INV-06 Violation: Request ep_id '${params.ep_id}' does not match exchange ep_id '${exchange.ep_id}'. Single EP per request enforced.`
      );
    }

    const id = params.id ?? `req-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const now = new Date().toISOString();

    const request: StatusRequest = {
      id,
      exchange_id: params.exchange_id,
      ep_id: params.ep_id,
      kind: params.kind,
      current_status: 'draft',
      desired_date: params.desired_date ?? null,
      reason: params.reason,
      apip_clause_ref: params.apip_clause_ref ?? null,
      ticket_ref: params.ticket_ref ?? null,
      checklist_state: params.checklist_state ?? {},
      evidence_proof_ids: params.evidence_proof_ids ?? [],
      owner_id: params.owner_id,
      created_at: now,
      submitted_at: null,
      decided_at: null,
      applied_at: null,
      rejection_reason: null,
      deleted_at: null,
      deleted_reason: null,
    };

    statusRequestDb.requests.set(id, request);

    // Audit log (INV-09)
    masterDb.auditLogs.push({
      id: masterDb.auditLogs.length + 1,
      ts: now,
      actor: actorId,
      action: 'CREATE_STATUS_REQUEST',
      table_name: 'status_request',
      record_id: id,
      before: undefined,
      after: request as unknown as Record<string, unknown>,
    });

    return request;
  },

  /**
   * Retrieves a status request by ID.
   */
  getStatusRequest(id: string): StatusRequest | undefined {
    const req = statusRequestDb.requests.get(id);
    if (!req || req.deleted_at) return undefined;
    return req;
  },

  /**
   * Updates an existing draft status request.
   */
  updateStatusRequest(
    id: string,
    updates: Partial<Omit<StatusRequest, 'id' | 'exchange_id' | 'ep_id' | 'created_at' | 'deleted_at' | 'deleted_reason'>>,
    actorId: string
  ): StatusRequest {
    const existing = statusRequestDb.requests.get(id);
    if (!existing || existing.deleted_at) {
      throw new Error(`Status request '${id}' not found or has been soft-deleted.`);
    }

    if (existing.current_status !== 'draft' && existing.current_status !== 'ready') {
      throw new Error(`Cannot modify request in '${existing.current_status}' state. Only 'draft' and 'ready' requests can be edited.`);
    }

    const before = { ...existing };
    const updated: StatusRequest = {
      ...existing,
      ...updates,
      checklist_state: updates.checklist_state
        ? { ...existing.checklist_state, ...updates.checklist_state }
        : existing.checklist_state,
      evidence_proof_ids: updates.evidence_proof_ids ?? existing.evidence_proof_ids,
    };

    statusRequestDb.requests.set(id, updated);

    // Audit log (INV-09)
    const masterDb = getMasterTrackerDb();
    masterDb.auditLogs.push({
      id: masterDb.auditLogs.length + 1,
      ts: new Date().toISOString(),
      actor: actorId,
      action: 'UPDATE_STATUS_REQUEST',
      table_name: 'status_request',
      record_id: id,
      before: before as unknown as Record<string, unknown>,
      after: updated as unknown as Record<string, unknown>,
    });

    return updated;
  },

  /**
   * Transitions the status request through its statutory lifecycle (§7.5).
   * Paths: draft -> ready -> submitted -> approved | rejected -> applied_in_expa
   */
  transitionLifecycle(
    id: string,
    targetStatus: StatusRequestLifecycle,
    actorId: string,
    options: TransitionLifecycleOptions = {}
  ): StatusRequest {
    const existing = statusRequestDb.requests.get(id);
    if (!existing || existing.deleted_at) {
      throw new Error(`Status request '${id}' not found or has been soft-deleted.`);
    }

    const current = existing.current_status;
    const allowed = VALID_TRANSITIONS[current] ?? [];

    if (!allowed.includes(targetStatus)) {
      throw new Error(
        `Invalid lifecycle transition from '${current}' to '${targetStatus}'. Allowed transitions: [${allowed.join(', ')}].`
      );
    }

    const now = options.timestamp ?? new Date().toISOString();
    const updated: StatusRequest = { ...existing, current_status: targetStatus };

    if (targetStatus === 'submitted') {
      const ticketRef = options.ticket_ref ?? existing.ticket_ref;
      if (!ticketRef || ticketRef.trim().length === 0) {
        throw new Error("Transition to 'submitted' requires a non-empty 'ticket_ref' (e.g. Zendesk ticket ID).");
      }
      updated.ticket_ref = ticketRef;
      updated.submitted_at = now;
    } else if (targetStatus === 'approved') {
      updated.decided_at = now;
      updated.rejection_reason = null;
    } else if (targetStatus === 'rejected') {
      if (!options.rejection_reason || options.rejection_reason.trim().length === 0) {
        throw new Error("Transition to 'rejected' requires a non-empty 'rejection_reason'.");
      }
      updated.decided_at = now;
      updated.rejection_reason = options.rejection_reason;
    } else if (targetStatus === 'applied_in_expa') {
      updated.applied_at = now;
    }

    statusRequestDb.requests.set(id, updated);

    // Audit log (INV-09)
    const masterDb = getMasterTrackerDb();
    masterDb.auditLogs.push({
      id: masterDb.auditLogs.length + 1,
      ts: now,
      actor: actorId,
      action: `TRANSITION_STATUS_REQUEST_${targetStatus.toUpperCase()}`,
      table_name: 'status_request',
      record_id: id,
      before: existing as unknown as Record<string, unknown>,
      after: updated as unknown as Record<string, unknown>,
    });

    return updated;
  },

  /**
   * Soft deletes a status request (INV-01).
   */
  softDeleteStatusRequest(id: string, reason: string, actorId: string): StatusRequest {
    const existing = statusRequestDb.requests.get(id);
    if (!existing || existing.deleted_at) {
      throw new Error(`Status request '${id}' not found or already deleted.`);
    }

    const payload = createSoftDeletePayload(actorId, reason);
    const updated: StatusRequest = {
      ...existing,
      ...payload,
    };

    statusRequestDb.requests.set(id, updated);

    // Audit log (INV-09)
    const masterDb = getMasterTrackerDb();
    masterDb.auditLogs.push({
      id: masterDb.auditLogs.length + 1,
      ts: payload.deleted_at,
      actor: actorId,
      action: 'SOFT_DELETE_STATUS_REQUEST',
      table_name: 'status_request',
      record_id: id,
      before: existing as unknown as Record<string, unknown>,
      after: updated as unknown as Record<string, unknown>,
    });

    return updated;
  },

  /**
   * Hard delete prohibition check (INV-01, DQ-081).
   */
  hardDeleteStatusRequest(id: string, actorId?: string | null): never {
    assertNoHardDelete('status_request', id, actorId);
  },

  /**
   * Lists status requests with optional filtering.
   */
  listStatusRequests(filters?: {
    exchange_id?: string;
    ep_id?: string;
    kind?: StatusRequestKind;
    current_status?: StatusRequestLifecycle;
  }): StatusRequest[] {
    const all = Array.from(statusRequestDb.requests.values()).filter((r) => !r.deleted_at);

    if (!filters) return all;

    return all.filter((r) => {
      if (filters.exchange_id && r.exchange_id !== filters.exchange_id) return false;
      if (filters.ep_id && r.ep_id !== filters.ep_id) return false;
      if (filters.kind && r.kind !== filters.kind) return false;
      if (filters.current_status && r.current_status !== filters.current_status) return false;
      return true;
    });
  },
};
