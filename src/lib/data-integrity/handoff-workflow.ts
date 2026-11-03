/**
 * AIESEC iCX ERP — Ownership Handoff Workflow Engine
 * Author: Wadii Hani <wadii.hani.pro@gmail.com>
 * Specification: iCX_Data_Integrity_Tracking_Spec.md v1.0 (§12, §16 T-15)
 * Milestone: M8 (Plan 08-01, Plan 08-02)
 * Enforces: INV-01 (No Hard Deletes), INV-03 (Active Owner), INV-09 (Attribution), T-15 (Ack Gate)
 */

import type {
  HandoffRecord,
  HandoffStatus,
  HandoffScope,
  HandoffPacket,
  FlowStage,
  Exchange,
  StatusRequest,
  CaseQuality,
  OpPartner,
  IrPartner,
  DqIssue,
  ProofDocument,
  AuditLogEntry,
  MemberRole,
} from '../types/data-integrity';
import {
  assertNoHardDelete,
  createSoftDeletePayload,
  InvariantViolationError,
} from './invariants';
import { getMasterTrackerDb } from './master-tracker';
import { getQualityCasesDb } from './quality-cases';
import { getIrEcosystemDb } from './ir-ecosystem';
import { getComplianceDb } from './compliance-calendar';
import { statusGovernanceService } from './status-governance';
import { dataQualityService } from './data-quality';
import { proofVaultService } from './proof-vault';
import { statusToFlowStage } from './stage-gates';

export interface InMemoryHandoffDbState {
  handoffs: Map<string, HandoffRecord>;
}

let handoffDbInstance: InMemoryHandoffDbState = {
  handoffs: new Map(),
};

export function getHandoffDb(): InMemoryHandoffDbState {
  return handoffDbInstance;
}

export function resetHandoffDb(): void {
  handoffDbInstance = {
    handoffs: new Map(),
  };
}

export const handoffWorkflowService = {
  // ---------------------------------------------------------------------------
  // 1. 10-SECTION HANDOFF PACKET GENERATOR (§12.2)
  // ---------------------------------------------------------------------------

  generateHandoffPacket(
    outgoingOwnerId: string,
    incomingOwnerId: string,
    scope: HandoffScope = 'individual',
    actorId: string
  ): HandoffPacket {
    const masterDb = getMasterTrackerDb();
    const qualityDb = getQualityCasesDb();
    const irDb = getIrEcosystemDb();

    // 1. Open exchanges grouped by stage
    const openExchangesByStage: Record<FlowStage, Exchange[]> = {
      attraction: [],
      consideration: [],
      preparation: [],
      experience: [],
      post_experience: [],
    };

    for (const ex of Array.from(masterDb.exchanges.values())) {
      if (ex.deleted_at) continue;
      if (scope === 'individual' && ex.owner_id !== outgoingOwnerId) continue;
      const stage = statusToFlowStage(ex.status);
      openExchangesByStage[stage].push(ex);
    }

    // 2. Overdue deadlines (next 14 days)
    const overdueDeadlines: Record<string, unknown>[] = [];
    const now = Date.now();
    for (const ex of Array.from(masterDb.exchanges.values())) {
      if (ex.deleted_at) continue;
      if (scope === 'individual' && ex.owner_id !== outgoingOwnerId) continue;
      if (ex.re_date) {
        const reTime = new Date(ex.re_date).getTime();
        const diffDays = Math.floor((reTime - now) / (1000 * 60 * 60 * 24));
        if (diffDays <= 14) {
          overdueDeadlines.push({ exchange_id: ex.id, type: 'realization', diff_days: diffDays });
        }
      }
    }

    // 3. Open requests
    const openRequests: StatusRequest[] = statusGovernanceService
      .listStatusRequests()
      .filter((r) => {
        if (scope === 'individual' && r.owner_id !== outgoingOwnerId) return false;
        return r.current_status !== 'applied_in_expa' && r.current_status !== 'rejected';
      });

    // 4. Open cases
    const openCases: CaseQuality[] = Array.from(qualityDb.cases.values()).filter((c) => {
      if (c.deleted_at || c.closed_at) return false;
      if (scope === 'individual' && c.owner_id !== outgoingOwnerId) return false;
      return true;
    });

    // 5. Partners
    const partners: OpPartner[] = Array.from(masterDb.partners.values()).filter((p) => {
      if (p.deleted_at) return false;
      if (scope === 'individual' && p.owner_id !== outgoingOwnerId) return false;
      return true;
    });

    // 6. IR partners
    const irPartners: IrPartner[] = Array.from(irDb.irPartners.values()).filter((ir) => {
      if (ir.deleted_at) return false;
      if (scope === 'individual' && ir.owner_id !== outgoingOwnerId) return false;
      return true;
    });

    // 7. Open DQ issues
    const openDqIssues: DqIssue[] = dataQualityService.listIssues({ status: 'open' }).filter((i) => {
      if (scope === 'individual' && i.owner_id && i.owner_id !== outgoingOwnerId) return false;
      return true;
    });

    // 8. Proof index
    const proofIndex: ProofDocument[] = proofVaultService.listProofs();

    // 9. Change log (last 30 days)
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
    const changeLog30d: AuditLogEntry[] = masterDb.auditLogs.filter(
      (l) => l.ts >= thirtyDaysAgo
    );

    // 10. Access list
    const accessList: { member_id: string; role: MemberRole }[] = [
      { member_id: 'mem-wadii-001', role: 'admin' },
      { member_id: 'mem-lcvp-001', role: 'lcvp' },
      { member_id: incomingOwnerId, role: 'member' },
    ];

    return {
      generated_at: new Date().toISOString(),
      outgoing_owner_id: outgoingOwnerId,
      incoming_owner_id: incomingOwnerId,
      scope,
      openExchangesByStage,
      overdueDeadlines,
      openRequests,
      openCases,
      partners,
      irPartners,
      openDqIssues,
      proofIndex,
      changeLog30d,
      accessList,
    };
  },

  // ---------------------------------------------------------------------------
  // 2. HANDOFF FSM WORKFLOW (§12.3, T-15)
  // ---------------------------------------------------------------------------

  initiateHandoff(
    outgoingOwnerId: string,
    incomingOwnerId: string,
    scope: HandoffScope = 'individual',
    actorId: string
  ): HandoffRecord {
    if (!outgoingOwnerId || outgoingOwnerId.trim() === '') {
      throw new Error('Outgoing owner ID is required');
    }
    if (!incomingOwnerId || incomingOwnerId.trim() === '') {
      throw new Error('Incoming owner ID is required');
    }

    const id = `handoff_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();

    const packet = this.generateHandoffPacket(outgoingOwnerId, incomingOwnerId, scope, actorId);

    const record: HandoffRecord = {
      id,
      scope,
      outgoing_owner_id: outgoingOwnerId,
      incoming_owner_id: incomingOwnerId,
      status: 'packet_generated',
      packet,
      outgoing_reviewed_at: null,
      incoming_acknowledged_at: null,
      transferred_at: null,
      transferred_counts: {},
      watch_period_ends_at: null,
      created_at: now,
      deleted_at: null,
      deleted_reason: null,
    };

    handoffDbInstance.handoffs.set(id, record);

    const masterDb = getMasterTrackerDb();
    masterDb.auditLogs.push({
      id: masterDb.auditLogs.length + 1,
      ts: now,
      actor: actorId,
      action: 'INITIATE_HANDOFF',
      table_name: 'handoff_record',
      record_id: id,
      before: null,
      after: record as unknown as Record<string, unknown>,
    });

    return record;
  },

  getHandoff(id: string): HandoffRecord | null {
    const h = handoffDbInstance.handoffs.get(id);
    if (!h || h.deleted_at) return null;
    return h;
  },

  reviewByOutgoing(handoffId: string, actorId: string): HandoffRecord {
    const h = this.getHandoff(handoffId);
    if (!h) throw new Error(`Handoff record '${handoffId}' not found.`);

    h.status = 'reviewed_by_outgoing';
    h.outgoing_reviewed_at = new Date().toISOString();

    const masterDb = getMasterTrackerDb();
    masterDb.auditLogs.push({
      id: masterDb.auditLogs.length + 1,
      ts: h.outgoing_reviewed_at,
      actor: actorId,
      action: 'REVIEW_HANDOFF_OUTGOING',
      table_name: 'handoff_record',
      record_id: handoffId,
      before: undefined,
      after: h as unknown as Record<string, unknown>,
    });

    return h;
  },

  acknowledgeByIncoming(handoffId: string, actorId: string): HandoffRecord {
    const h = this.getHandoff(handoffId);
    if (!h) throw new Error(`Handoff record '${handoffId}' not found.`);

    h.status = 'acknowledged_by_incoming';
    h.incoming_acknowledged_at = new Date().toISOString();

    const masterDb = getMasterTrackerDb();
    masterDb.auditLogs.push({
      id: masterDb.auditLogs.length + 1,
      ts: h.incoming_acknowledged_at,
      actor: actorId,
      action: 'ACKNOWLEDGE_HANDOFF_INCOMING',
      table_name: 'handoff_record',
      record_id: handoffId,
      before: undefined,
      after: h as unknown as Record<string, unknown>,
    });

    return h;
  },

  /**
   * Acceptance Test T-15 Enforcement Gate:
   * "Given a handoff, when incoming owner hasn't acknowledged, then ownership does not transfer."
   */
  executeTransfer(handoffId: string, actorId: string): {
    handoff: HandoffRecord;
    transferredCounts: Record<string, number>;
  } {
    const h = this.getHandoff(handoffId);
    if (!h) throw new Error(`Handoff record '${handoffId}' not found.`);

    // Acceptance Test T-15 Gate
    if (h.status !== 'acknowledged_by_incoming' && !h.incoming_acknowledged_at) {
      throw new InvariantViolationError(
        'T-15',
        'Cannot transfer ownership: incoming owner has not acknowledged the handoff packet (Rule §12.3, Acceptance Test T-15).',
        'T-15',
        { handoffId, currentStatus: h.status }
      );
    }

    const masterDb = getMasterTrackerDb();
    const qualityDb = getQualityCasesDb();
    const irDb = getIrEcosystemDb();
    const compDb = getComplianceDb();

    let partnersTransferred = 0;
    let opportunitiesTransferred = 0;
    let exchangesTransferred = 0;
    let casesTransferred = 0;
    let irPartnersTransferred = 0;
    let complianceTransferred = 0;

    const outId = h.outgoing_owner_id;
    const inId = h.incoming_owner_id;

    // 1. Partners
    for (const p of Array.from(masterDb.partners.values())) {
      if (!p.deleted_at && p.owner_id === outId) {
        p.owner_id = inId;
        partnersTransferred++;
      }
    }

    // 2. Opportunities
    for (const opp of Array.from(masterDb.opportunities.values())) {
      if (!opp.deleted_at && (opp as any).owner_id === outId) {
        (opp as any).owner_id = inId;
        opportunitiesTransferred++;
      }
    }

    // 3. Exchanges
    for (const ex of Array.from(masterDb.exchanges.values())) {
      if (!ex.deleted_at && ex.owner_id === outId) {
        ex.owner_id = inId;
        exchangesTransferred++;
      }
    }

    // 4. Quality Cases
    for (const c of Array.from(qualityDb.cases.values())) {
      if (!c.deleted_at && c.owner_id === outId) {
        c.owner_id = inId;
        casesTransferred++;
      }
    }

    // 5. IR Partners
    for (const ir of Array.from(irDb.irPartners.values())) {
      if (!ir.deleted_at && ir.owner_id === outId) {
        ir.owner_id = inId;
        irPartnersTransferred++;
      }
    }

    // 6. Compliance Items
    for (const ci of Array.from(compDb.items.values())) {
      if (!ci.deleted_at && ci.owner_id === outId) {
        ci.owner_id = inId;
        complianceTransferred++;
      }
    }

    const now = new Date().toISOString();
    const watchEnds = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const counts = {
      partners: partnersTransferred,
      opportunities: opportunitiesTransferred,
      exchanges: exchangesTransferred,
      cases: casesTransferred,
      irPartners: irPartnersTransferred,
      complianceItems: complianceTransferred,
    };

    h.status = 'transferred';
    h.transferred_at = now;
    h.transferred_counts = counts;
    h.watch_period_ends_at = watchEnds;

    // Universal audit log (INV-09)
    masterDb.auditLogs.push({
      id: masterDb.auditLogs.length + 1,
      ts: now,
      actor: actorId,
      action: 'BULK_OWNERSHIP_TRANSFER',
      table_name: 'handoff_record',
      record_id: handoffId,
      before: undefined,
      after: {
        handoffId,
        from_owner: outId,
        to_owner: inId,
        counts,
      } as unknown as Record<string, unknown>,
    });

    return {
      handoff: h,
      transferredCounts: counts,
    };
  },

  softDeleteHandoff(id: string, actorId: string, reason: string): HandoffRecord {
    const h = this.getHandoff(id);
    if (!h) throw new Error(`Handoff record '${id}' not found.`);

    const soft = createSoftDeletePayload(actorId, reason);
    h.deleted_at = soft.deleted_at;
    h.deleted_reason = soft.deleted_reason;

    const masterDb = getMasterTrackerDb();
    masterDb.auditLogs.push({
      id: masterDb.auditLogs.length + 1,
      ts: soft.deleted_at,
      actor: actorId,
      action: 'SOFT_DELETE',
      table_name: 'handoff_record',
      record_id: id,
      before: undefined,
      after: h as unknown as Record<string, unknown>,
    });

    return h;
  },

  hardDeleteAttempt(id: string, actorId: string): never {
    return assertNoHardDelete('handoff_record', id, actorId);
  },
};
