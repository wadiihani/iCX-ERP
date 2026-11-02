/**
 * AIESEC iCX ERP — Master Tracker Relational CRUD Data Services
 * Author: Wadii Hani <wadii.hani.pro@gmail.com>
 * Specification: iCX_Data_Integrity_Tracking_Spec.md v1.0 (§5 Module A)
 * Milestone: M1 (Plan 01-01)
 * Enforces: INV-01 (Soft deletes), INV-03 (Owner required), INV-08 (Versioned rules),
 *           INV-09 (Attribution), INV-10 (Confidentiality), DQ-001 (Unique EXPA EP ID),
 *           DQ-080 (Status sync)
 */

import type {
  EntityOrg,
  OpPartner,
  Opportunity,
  Contract,
  Ep,
  Exchange,
  StatusHistory,
  StandardCheck,
  AuditLogEntry,
  ExStatus,
  BreakType,
  StatusHistorySource,
} from '../types/data-integrity';
import {
  assertNoHardDelete,
  assertAppendOnly,
  createSoftDeletePayload,
  prepareStatusTransition,
  InvariantViolationError,
} from './invariants';
import { validateDurationWeeks, validateHoursPerWeek } from './rules';
import { sanitizeEpForViewer, ActorContext } from './rbac';
import { assertTransitionGuards } from './stage-gates';

export interface InMemoryDbState {
  entities: Map<string, EntityOrg>;
  partners: Map<string, OpPartner>;
  opportunities: Map<string, Opportunity>;
  contracts: Map<string, Contract>;
  eps: Map<string, Ep>;
  exchanges: Map<string, Exchange>;
  statusHistories: StatusHistory[];
  standardChecks: Map<string, StandardCheck>; // key: `${exchangeId}:${stdNo}`
  auditLogs: AuditLogEntry[];
}

export function createInMemoryMasterTrackerDb(): InMemoryDbState {
  return {
    entities: new Map(),
    partners: new Map(),
    opportunities: new Map(),
    contracts: new Map(),
    eps: new Map(),
    exchanges: new Map(),
    statusHistories: [],
    standardChecks: new Map(),
    auditLogs: [],
  };
}

let dbInstance: InMemoryDbState = createInMemoryMasterTrackerDb();

export function getMasterTrackerDb(): InMemoryDbState {
  return dbInstance;
}

export function resetMasterTrackerDb(): void {
  dbInstance = createInMemoryMasterTrackerDb();
}

// -----------------------------------------------------------------------------
// 0. ENTITY_ORG SERVICE
// -----------------------------------------------------------------------------

export const entityService = {
  createEntity(
    data: Omit<EntityOrg, 'id' | 'created_at' | 'deleted_at' | 'deleted_reason'>,
    actorId: string
  ): EntityOrg {
    const id = `entity_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();

    const entity: EntityOrg = {
      ...data,
      id,
      created_at: now,
    };

    dbInstance.entities.set(id, entity);

    dbInstance.auditLogs.push({
      id: dbInstance.auditLogs.length + 1,
      ts: now,
      actor: actorId,
      action: 'INSERT',
      table_name: 'entity_org',
      record_id: id,
      before: null,
      after: entity as unknown as Record<string, unknown>,
    });

    return entity;
  },

  getEntity(id: string): EntityOrg | null {
    const e = dbInstance.entities.get(id);
    if (!e || e.deleted_at) return null;
    return e;
  },

  setFreezeFlag(id: string, isFrozen: boolean, actorId: string, frozenSince?: string | null): EntityOrg {
    const existing = dbInstance.entities.get(id);
    if (!existing || existing.deleted_at) {
      throw new Error(`Entity not found: ${id}`);
    }

    const before = { ...existing };
    const updated: EntityOrg = {
      ...existing,
      is_frozen: isFrozen,
      frozen_since: isFrozen ? (frozenSince ?? new Date().toISOString()) : null,
    };

    dbInstance.entities.set(id, updated);

    dbInstance.auditLogs.push({
      id: dbInstance.auditLogs.length + 1,
      ts: new Date().toISOString(),
      actor: actorId,
      action: 'UPDATE_FREEZE_FLAG',
      table_name: 'entity_org',
      record_id: id,
      before: before as unknown as Record<string, unknown>,
      after: updated as unknown as Record<string, unknown>,
    });

    return updated;
  },
};

// -----------------------------------------------------------------------------
// 1. OP_PARTNER SERVICE
// -----------------------------------------------------------------------------

export const partnerService = {
  createPartner(
    data: Omit<OpPartner, 'id' | 'created_at' | 'deleted_at' | 'deleted_reason'>,
    actorId: string
  ): OpPartner {
    if (!data.owner_id) {
      throw new InvariantViolationError('INV-03', 'Partner must have an active owner_id');
    }

    const id = `partner_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();

    const partner: OpPartner = {
      ...data,
      id,
      created_at: now,
      last_touchpoint_at: data.last_touchpoint_at ?? now,
    };

    dbInstance.partners.set(id, partner);

    dbInstance.auditLogs.push({
      id: dbInstance.auditLogs.length + 1,
      ts: now,
      actor: actorId,
      action: 'INSERT',
      table_name: 'op_partner',
      record_id: id,
      before: null,
      after: partner as unknown as Record<string, unknown>,
    });

    return partner;
  },

  getPartner(id: string): OpPartner | null {
    const p = dbInstance.partners.get(id);
    if (!p || p.deleted_at) return null;
    return p;
  },

  listPartners(filter?: { stage?: string; ownerId?: string }): OpPartner[] {
    const results: OpPartner[] = [];
    for (const p of Array.from(dbInstance.partners.values())) {
      if (p.deleted_at) continue;
      if (filter?.stage && p.stage !== filter.stage) continue;
      if (filter?.ownerId && p.owner_id !== filter.ownerId) continue;
      results.push(p);
    }
    return results;
  },

  updatePartner(
    id: string,
    updates: Partial<Omit<OpPartner, 'id' | 'created_at' | 'deleted_at' | 'deleted_reason'>>,
    actorId: string
  ): OpPartner {
    const existing = dbInstance.partners.get(id);
    if (!existing || existing.deleted_at) {
      throw new Error(`Partner not found: ${id}`);
    }

    const before = { ...existing };
    const updated: OpPartner = {
      ...existing,
      ...updates,
    };

    dbInstance.partners.set(id, updated);

    dbInstance.auditLogs.push({
      id: dbInstance.auditLogs.length + 1,
      ts: new Date().toISOString(),
      actor: actorId,
      action: 'UPDATE',
      table_name: 'op_partner',
      record_id: id,
      before: before as unknown as Record<string, unknown>,
      after: updated as unknown as Record<string, unknown>,
    });

    return updated;
  },

  recordTouchpoint(id: string, actorId: string, notes?: string): OpPartner {
    const now = new Date().toISOString();
    return this.updatePartner(
      id,
      {
        last_touchpoint_at: now,
      },
      actorId
    );
  },

  softDeletePartner(id: string, actorId: string, reason: string): OpPartner {
    const existing = dbInstance.partners.get(id);
    if (!existing || existing.deleted_at) {
      throw new Error(`Partner not found: ${id}`);
    }

    const soft = createSoftDeletePayload(actorId, reason);
    const updated: OpPartner = {
      ...existing,
      deleted_at: soft.deleted_at,
      deleted_reason: soft.deleted_reason,
    };

    dbInstance.partners.set(id, updated);

    dbInstance.auditLogs.push({
      id: dbInstance.auditLogs.length + 1,
      ts: soft.deleted_at,
      actor: actorId,
      action: 'SOFT_DELETE',
      table_name: 'op_partner',
      record_id: id,
      before: existing as unknown as Record<string, unknown>,
      after: updated as unknown as Record<string, unknown>,
    });

    return updated;
  },

  hardDeleteAttempt(id: string, actorId: string): never {
    return assertNoHardDelete('op_partner', id, actorId);
  },
};

// -----------------------------------------------------------------------------
// 2. OPPORTUNITY SERVICE
// -----------------------------------------------------------------------------

export const opportunityService = {
  createOpportunity(
    data: Omit<Opportunity, 'id' | 'created_at' | 'deleted_at' | 'deleted_reason'>,
    actorId: string,
    evaluationDate?: string | Date
  ): Opportunity {
    // Validate Duration Weeks via versioned rule registry (INV-08)
    if (data.duration_weeks) {
      const durCheck = validateDurationWeeks(
        data.programme,
        data.duration_weeks,
        evaluationDate ?? new Date()
      );
      if (!durCheck.valid) {
        throw new InvariantViolationError(
          'INV-08',
          `Duration of ${data.duration_weeks} weeks is invalid for ${data.programme} (allowed: ${durCheck.min}-${durCheck.max} weeks, rule version: ${durCheck.ruleVersion})`
        );
      }
    }

    // Validate Hours per Week via versioned rule registry (INV-08)
    if (data.hours_per_week) {
      const hoursCheck = validateHoursPerWeek(
        data.programme,
        data.hours_per_week,
        evaluationDate ?? new Date()
      );
      if (!hoursCheck.valid) {
        throw new InvariantViolationError(
          'INV-08',
          `Working hours of ${data.hours_per_week}h/week is invalid for ${data.programme} (allowed: ${hoursCheck.min}-${hoursCheck.max}h/week)`
        );
      }
    }

    const id = `opp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();

    const opportunity: Opportunity = {
      ...data,
      id,
      created_at: now,
    };

    dbInstance.opportunities.set(id, opportunity);

    dbInstance.auditLogs.push({
      id: dbInstance.auditLogs.length + 1,
      ts: now,
      actor: actorId,
      action: 'INSERT',
      table_name: 'opportunity',
      record_id: id,
      before: null,
      after: opportunity as unknown as Record<string, unknown>,
    });

    return opportunity;
  },

  getOpportunity(id: string): Opportunity | null {
    const opp = dbInstance.opportunities.get(id);
    if (!opp || opp.deleted_at) return null;
    return opp;
  },

  listOpportunities(filter?: { opId?: string; programme?: string }): Opportunity[] {
    const results: Opportunity[] = [];
    for (const opp of Array.from(dbInstance.opportunities.values())) {
      if (opp.deleted_at) continue;
      if (filter?.opId && opp.op_id !== filter.opId) continue;
      if (filter?.programme && opp.programme !== filter.programme) continue;
      results.push(opp);
    }
    return results;
  },

  getSlotCapacity(id: string): { totalSlots: number; filledSlots: number; availableSlots: number } {
    const opp = this.getOpportunity(id);
    if (!opp) throw new Error(`Opportunity not found: ${id}`);

    let filledCount = 0;
    for (const ex of Array.from(dbInstance.exchanges.values())) {
      if (ex.deleted_at) continue;
      if (ex.opportunity_id === id && ex.status !== 'REJECTED' && ex.status !== 'WITHDRAWN') {
        filledCount++;
      }
    }

    return {
      totalSlots: opp.slots,
      filledSlots: filledCount,
      availableSlots: Math.max(0, opp.slots - filledCount),
    };
  },

  softDeleteOpportunity(id: string, actorId: string, reason: string): Opportunity {
    const existing = dbInstance.opportunities.get(id);
    if (!existing || existing.deleted_at) {
      throw new Error(`Opportunity not found: ${id}`);
    }

    const soft = createSoftDeletePayload(actorId, reason);
    const updated: Opportunity = {
      ...existing,
      deleted_at: soft.deleted_at,
      deleted_reason: soft.deleted_reason,
    };

    dbInstance.opportunities.set(id, updated);

    dbInstance.auditLogs.push({
      id: dbInstance.auditLogs.length + 1,
      ts: soft.deleted_at,
      actor: actorId,
      action: 'SOFT_DELETE',
      table_name: 'opportunity',
      record_id: id,
      before: existing as unknown as Record<string, unknown>,
      after: updated as unknown as Record<string, unknown>,
    });

    return updated;
  },

  hardDeleteAttempt(id: string, actorId: string): never {
    return assertNoHardDelete('opportunity', id, actorId);
  },
};

// -----------------------------------------------------------------------------
// 3. CONTRACT SERVICE
// -----------------------------------------------------------------------------

export const contractService = {
  createContract(
    data: Omit<Contract, 'id' | 'created_at' | 'deleted_at' | 'deleted_reason'>,
    actorId: string
  ): Contract {
    const opp = dbInstance.opportunities.get(data.opportunity_id);
    if (!opp || opp.deleted_at) {
      throw new Error(`Opportunity not found for contract: ${data.opportunity_id}`);
    }

    const id = `contract_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();

    const contract: Contract = {
      ...data,
      id,
      created_at: now,
    };

    dbInstance.contracts.set(id, contract);

    dbInstance.auditLogs.push({
      id: dbInstance.auditLogs.length + 1,
      ts: now,
      actor: actorId,
      action: 'INSERT',
      table_name: 'contract',
      record_id: id,
      before: null,
      after: contract as unknown as Record<string, unknown>,
    });

    return contract;
  },

  getContract(id: string): Contract | null {
    const c = dbInstance.contracts.get(id);
    if (!c || c.deleted_at) return null;
    return c;
  },

  getContractByOpportunity(opportunityId: string): Contract | null {
    for (const c of Array.from(dbInstance.contracts.values())) {
      if (!c.deleted_at && c.opportunity_id === opportunityId) {
        return c;
      }
    }
    return null;
  },

  softDeleteContract(id: string, actorId: string, reason: string): Contract {
    const existing = dbInstance.contracts.get(id);
    if (!existing || existing.deleted_at) {
      throw new Error(`Contract not found: ${id}`);
    }

    const soft = createSoftDeletePayload(actorId, reason);
    const updated: Contract = {
      ...existing,
      deleted_at: soft.deleted_at,
      deleted_reason: soft.deleted_reason,
    };

    dbInstance.contracts.set(id, updated);

    dbInstance.auditLogs.push({
      id: dbInstance.auditLogs.length + 1,
      ts: soft.deleted_at,
      actor: actorId,
      action: 'SOFT_DELETE',
      table_name: 'contract',
      record_id: id,
      before: existing as unknown as Record<string, unknown>,
      after: updated as unknown as Record<string, unknown>,
    });

    return updated;
  },

  hardDeleteAttempt(id: string, actorId: string): never {
    return assertNoHardDelete('contract', id, actorId);
  },
};

// -----------------------------------------------------------------------------
// 4. EP SERVICE
// -----------------------------------------------------------------------------

export const epService = {
  createEp(
    data: Omit<Ep, 'id' | 'created_at' | 'deleted_at' | 'deleted_reason'>,
    actorId: string
  ): Ep {
    if (!data.owner_id) {
      throw new InvariantViolationError('INV-03', 'EP must have an active owner_id');
    }

    // DQ-001: Duplicate EXPA EP ID check
    for (const existingEp of Array.from(dbInstance.eps.values())) {
      if (!existingEp.deleted_at && existingEp.expa_ep_id === data.expa_ep_id) {
        throw new InvariantViolationError(
          'DQ-001',
          `Duplicate expa_ep_id detected: ${data.expa_ep_id} is already registered`
        );
      }
    }

    const id = `ep_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();

    const ep: Ep = {
      ...data,
      id,
      created_at: now,
    };

    dbInstance.eps.set(id, ep);

    dbInstance.auditLogs.push({
      id: dbInstance.auditLogs.length + 1,
      ts: now,
      actor: actorId,
      action: 'INSERT',
      table_name: 'ep',
      record_id: id,
      before: null,
      after: ep as unknown as Record<string, unknown>,
    });

    return ep;
  },

  getEp(id: string, viewerActor?: ActorContext, epTeamId?: string | null): Ep | null {
    const ep = dbInstance.eps.get(id);
    if (!ep || ep.deleted_at) return null;

    if (!viewerActor) return ep;
    return sanitizeEpForViewer(ep, viewerActor, epTeamId);
  },

  listEps(filter?: { homeEntityId?: string; ownerId?: string }, viewerActor?: ActorContext): Ep[] {
    const results: Ep[] = [];
    for (const ep of Array.from(dbInstance.eps.values())) {
      if (ep.deleted_at) continue;
      if (filter?.homeEntityId && ep.home_entity_id !== filter.homeEntityId) continue;
      if (filter?.ownerId && ep.owner_id !== filter.ownerId) continue;

      results.push(viewerActor ? sanitizeEpForViewer(ep, viewerActor) : ep);
    }
    return results;
  },

  softDeleteEp(id: string, actorId: string, reason: string): Ep {
    const existing = dbInstance.eps.get(id);
    if (!existing || existing.deleted_at) {
      throw new Error(`EP not found: ${id}`);
    }

    const soft = createSoftDeletePayload(actorId, reason);
    const updated: Ep = {
      ...existing,
      deleted_at: soft.deleted_at,
      deleted_reason: soft.deleted_reason,
    };

    dbInstance.eps.set(id, updated);

    dbInstance.auditLogs.push({
      id: dbInstance.auditLogs.length + 1,
      ts: soft.deleted_at,
      actor: actorId,
      action: 'SOFT_DELETE',
      table_name: 'ep',
      record_id: id,
      before: existing as unknown as Record<string, unknown>,
      after: updated as unknown as Record<string, unknown>,
    });

    return updated;
  },

  hardDeleteAttempt(id: string, actorId: string): never {
    return assertNoHardDelete('ep', id, actorId);
  },
};

// -----------------------------------------------------------------------------
// 5. EXCHANGE SERVICE (CENTRAL RECORD)
// -----------------------------------------------------------------------------

export const exchangeService = {
  createExchange(
    data: Omit<Exchange, 'id' | 'created_at' | 'deleted_at' | 'deleted_reason'>,
    actorId: string
  ): {
    exchange: Exchange;
    standardChecks: StandardCheck[];
    initialHistory: StatusHistory;
  } {
    if (!data.owner_id) {
      throw new InvariantViolationError('INV-03', 'Exchange record must have an active owner_id');
    }

    // Verify 1 EP x 1 Opportunity unique constraint
    for (const existingEx of Array.from(dbInstance.exchanges.values())) {
      if (
        !existingEx.deleted_at &&
        existingEx.ep_id === data.ep_id &&
        existingEx.opportunity_id === data.opportunity_id
      ) {
        throw new InvariantViolationError(
          'INV-06',
          `Exchange already exists for ep_id ${data.ep_id} and opportunity_id ${data.opportunity_id}`
        );
      }
    }

    const id = `ex_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();

    const exchange: Exchange = {
      ...data,
      id,
      created_at: now,
    };

    dbInstance.exchanges.set(id, exchange);

    // Synchronize initial status history (DQ-080)
    const initialHistory: StatusHistory = {
      id: dbInstance.statusHistories.length + 1,
      exchange_id: id,
      from_status: null,
      to_status: data.status,
      break_type: data.break_type ?? null,
      at: now,
      by_member: actorId,
      source: 'manual',
      reason: 'Exchange intake created',
    };
    dbInstance.statusHistories.push(initialHistory);

    // Initialize 16 Exchange Standards rows (#1–#16) in 'not_started' (§5.1 line 246)
    const standardChecks: StandardCheck[] = [];
    for (let stdNo = 1; stdNo <= 16; stdNo++) {
      const check: StandardCheck = {
        exchange_id: id,
        std_no: stdNo,
        tracked_status: 'not_started',
        tracked_at: null,
        tracked_by: null,
        proof_id: null,
        ep_reported_answer: null,
        ep_reported_at: null,
      };
      dbInstance.standardChecks.set(`${id}:${stdNo}`, check);
      standardChecks.push(check);
    }

    // Write audit log entry (INV-09)
    dbInstance.auditLogs.push({
      id: dbInstance.auditLogs.length + 1,
      ts: now,
      actor: actorId,
      action: 'INSERT',
      table_name: 'exchange',
      record_id: id,
      before: null,
      after: exchange as unknown as Record<string, unknown>,
    });

    return {
      exchange,
      standardChecks,
      initialHistory,
    };
  },

  getExchange(id: string): Exchange | null {
    const ex = dbInstance.exchanges.get(id);
    if (!ex || ex.deleted_at) return null;
    return ex;
  },

  listExchanges(filter?: { epId?: string; opportunityId?: string; status?: ExStatus }): Exchange[] {
    const results: Exchange[] = [];
    for (const ex of Array.from(dbInstance.exchanges.values())) {
      if (ex.deleted_at) continue;
      if (filter?.epId && ex.ep_id !== filter.epId) continue;
      if (filter?.opportunityId && ex.opportunity_id !== filter.opportunityId) continue;
      if (filter?.status && ex.status !== filter.status) continue;
      results.push(ex);
    }
    return results;
  },

  transitionStatus(
    exchangeId: string,
    toStatus: ExStatus,
    options: {
      actorId: string;
      source?: StatusHistorySource;
      reason?: string;
      proofId?: string;
      breakType?: BreakType | null;
      skipGuards?: boolean;
      hasEpSurveyConfirmation?: boolean;
    }
  ): {
    updatedExchange: Exchange;
    historyEntry: StatusHistory;
  } {
    const current = dbInstance.exchanges.get(exchangeId);
    if (!current || current.deleted_at) {
      throw new Error(`Exchange not found: ${exchangeId}`);
    }

    // Evaluate Transition Guards (§4.2) unless explicitly bypassed or EXPA sync (INV-04)
    if (!options.skipGuards && options.source !== 'expa_sync') {
      const opp = dbInstance.opportunities.get(current.opportunity_id);
      const partner = opp ? dbInstance.partners.get(opp.op_id) : null;
      const contract = opp ? contractService.getContractByOpportunity(opp.id) : null;
      const ep = dbInstance.eps.get(current.ep_id);
      const homeEntity = ep ? dbInstance.entities.get(ep.home_entity_id) : null;
      const checks = this.getStandardChecks(exchangeId);

      assertTransitionGuards(toStatus, {
        exchange: current,
        partner,
        opportunity: opp,
        contract,
        ep,
        homeEntity,
        standardChecks: checks,
        source: options.source,
        hasEpSurveyConfirmation: options.hasEpSurveyConfirmation,
      });
    }

    const { updatedExchange, historyEntry } = prepareStatusTransition(current, toStatus, {
      actorId: options.actorId,
      source: options.source ?? 'manual',
      reason: options.reason,
      proofId: options.proofId,
      breakType: options.breakType,
    });

    // Save updated exchange
    dbInstance.exchanges.set(exchangeId, updatedExchange);

    // Save append-only history entry (DQ-080)
    const persistedHistory: StatusHistory = {
      ...historyEntry,
      id: dbInstance.statusHistories.length + 1,
    };
    dbInstance.statusHistories.push(persistedHistory);

    // Save audit log (INV-09)
    dbInstance.auditLogs.push({
      id: dbInstance.auditLogs.length + 1,
      ts: new Date().toISOString(),
      actor: options.actorId,
      action: 'STATUS_TRANSITION',
      table_name: 'exchange',
      record_id: exchangeId,
      before: current as unknown as Record<string, unknown>,
      after: updatedExchange as unknown as Record<string, unknown>,
    });

    return {
      updatedExchange,
      historyEntry: persistedHistory,
    };
  },

  getStandardChecks(exchangeId: string): StandardCheck[] {
    const checks: StandardCheck[] = [];
    for (let stdNo = 1; stdNo <= 16; stdNo++) {
      const c = dbInstance.standardChecks.get(`${exchangeId}:${stdNo}`);
      if (c) checks.push(c);
    }
    return checks;
  },

  softDeleteExchange(id: string, actorId: string, reason: string): Exchange {
    const existing = dbInstance.exchanges.get(id);
    if (!existing || existing.deleted_at) {
      throw new Error(`Exchange not found: ${id}`);
    }

    const soft = createSoftDeletePayload(actorId, reason);
    const updated: Exchange = {
      ...existing,
      deleted_at: soft.deleted_at,
      deleted_reason: soft.deleted_reason,
    };

    dbInstance.exchanges.set(id, updated);

    dbInstance.auditLogs.push({
      id: dbInstance.auditLogs.length + 1,
      ts: soft.deleted_at,
      actor: actorId,
      action: 'SOFT_DELETE',
      table_name: 'exchange',
      record_id: id,
      before: existing as unknown as Record<string, unknown>,
      after: updated as unknown as Record<string, unknown>,
    });

    return updated;
  },

  hardDeleteAttempt(id: string, actorId: string): never {
    return assertNoHardDelete('exchange', id, actorId);
  },
};
