/**
 * AIESEC iCX ERP — Partner Touchpoints & Buyer Personas Service
 * Author: Wadii Hani <wadii.hani.pro@gmail.com>
 * Specification: iCX_Data_Integrity_Tracking_Spec.md v1.0 (§5.2, §5.3, §9.2)
 * Milestone: M4 (Plan 04-02)
 * Enforces: INV-01 (Soft Deletes), INV-09 (Attribution), Touchpoint Gap SLAs & Funnel Conversion Analytics
 */

import type {
  PartnerTouchpoint,
  TouchpointType,
  PartnerPersona,
  PreferredChannel,
  ObjectionTag,
  PartnerFunnelStage,
  OpPartner,
} from '../types/data-integrity';
import { assertNoHardDelete, createSoftDeletePayload, InvariantViolationError } from './invariants';
import { getMasterTrackerDb } from './master-tracker';

/**
 * In-memory store for partner touchpoints
 */
interface PartnerTouchpointsDbStore {
  touchpoints: Map<string, PartnerTouchpoint>;
}

const touchpointDb: PartnerTouchpointsDbStore = {
  touchpoints: new Map(),
};

export function resetPartnerTouchpointsDb(): void {
  touchpointDb.touchpoints.clear();
}

export interface LogTouchpointParams {
  id?: string;
  partner_id: string;
  type: TouchpointType;
  occurred_at?: string;
  notes: string;
  next_action?: string | null;
  next_action_due_at?: string | null;
  metadata?: Record<string, unknown>;
}

export interface FunnelMetrics {
  totalPartners: number;
  byFunnelStage: Record<PartnerFunnelStage, number>;
  callToOpenConversionPct: number;
  openToAplConversionPct: number;
  aplToApdConversionPct: number;
}

export const partnerTouchpointService = {
  /**
   * Logs a touchpoint and automatically updates partner.last_touchpoint_at (§9.2).
   */
  logTouchpoint(params: LogTouchpointParams, actorId: string): PartnerTouchpoint {
    const masterDb = getMasterTrackerDb();
    const partner = masterDb.partners.get(params.partner_id);
    if (!partner || partner.deleted_at) {
      throw new Error(`Partner '${params.partner_id}' not found or has been soft-deleted.`);
    }

    const validTypes: TouchpointType[] = [
      'monthly_call',
      'site_visit',
      'lc_touchpoint',
      'newsletter',
      'quarterly_review',
    ];

    if (!validTypes.includes(params.type)) {
      throw new Error(
        `Invalid touchpoint type '${params.type}'. Allowed types: [${validTypes.join(', ')}].`
      );
    }

    if (!params.notes || params.notes.trim().length === 0) {
      throw new Error('Touchpoint notes are required.');
    }

    const id = params.id ?? `tp-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const now = params.occurred_at ?? new Date().toISOString();

    const touchpoint: PartnerTouchpoint = {
      id,
      partner_id: params.partner_id,
      type: params.type,
      occurred_at: now,
      actor_id: actorId,
      notes: params.notes,
      next_action: params.next_action ?? null,
      next_action_due_at: params.next_action_due_at ?? null,
      metadata: params.metadata ?? {},
      created_at: new Date().toISOString(),
      deleted_at: null,
      deleted_reason: null,
    };

    touchpointDb.touchpoints.set(id, touchpoint);

    // Automatically update partner.last_touchpoint_at (resets DQ-060 timer)
    const updatedPartner: OpPartner = {
      ...partner,
      last_touchpoint_at: now,
      next_action: params.next_action ?? partner.next_action,
      next_action_due_at: params.next_action_due_at ?? partner.next_action_due_at,
    };
    masterDb.partners.set(params.partner_id, updatedPartner);

    // Audit log (INV-09)
    masterDb.auditLogs.push({
      id: masterDb.auditLogs.length + 1,
      ts: now,
      actor: actorId,
      action: 'LOG_PARTNER_TOUCHPOINT',
      table_name: 'partner_touchpoint',
      record_id: id,
      before: undefined,
      after: touchpoint as unknown as Record<string, unknown>,
    });

    return touchpoint;
  },

  /**
   * Updates buyer persona tags, preferred channels, objection tags, and funnel stage (§5.2).
   */
  updatePartnerPersona(
    partnerId: string,
    data: {
      persona?: PartnerPersona | null;
      preferred_channel?: PreferredChannel | null;
      objection_tags?: ObjectionTag[];
      funnel_stage?: PartnerFunnelStage | null;
    },
    actorId: string
  ): OpPartner {
    const masterDb = getMasterTrackerDb();
    const partner = masterDb.partners.get(partnerId);
    if (!partner || partner.deleted_at) {
      throw new Error(`Partner '${partnerId}' not found or soft-deleted.`);
    }

    const before = { ...partner };
    const updated: OpPartner = {
      ...partner,
      persona: data.persona !== undefined ? data.persona : partner.persona,
      preferred_channel:
        data.preferred_channel !== undefined ? data.preferred_channel : partner.preferred_channel,
      objection_tags:
        data.objection_tags !== undefined ? data.objection_tags : partner.objection_tags,
      funnel_stage:
        data.funnel_stage !== undefined ? data.funnel_stage : partner.funnel_stage ?? 'lead',
    };

    masterDb.partners.set(partnerId, updated);

    // Audit log (INV-09)
    masterDb.auditLogs.push({
      id: masterDb.auditLogs.length + 1,
      ts: new Date().toISOString(),
      actor: actorId,
      action: 'UPDATE_PARTNER_PERSONA',
      table_name: 'op_partner',
      record_id: partnerId,
      before: before as unknown as Record<string, unknown>,
      after: updated as unknown as Record<string, unknown>,
    });

    return updated;
  },

  /**
   * Retrieves all touchpoints for a partner.
   */
  listTouchpoints(partnerId?: string): PartnerTouchpoint[] {
    const all = Array.from(touchpointDb.touchpoints.values()).filter((t) => !t.deleted_at);
    if (!partnerId) return all;
    return all.filter((t) => t.partner_id === partnerId);
  },

  /**
   * Computes B2B pipeline conversion metrics (§5.3).
   */
  computeFunnelMetrics(): FunnelMetrics {
    const masterDb = getMasterTrackerDb();
    const partners = Array.from(masterDb.partners.values()).filter((p) => !p.deleted_at);
    const opportunities = Array.from(masterDb.opportunities.values()).filter((o) => !o.deleted_at);
    const exchanges = Array.from(masterDb.exchanges.values()).filter((e) => !e.deleted_at);

    const byFunnelStage: Record<PartnerFunnelStage, number> = {
      lead: 0,
      called: 0,
      meeting: 0,
      'open created': 0,
      'contract signed': 0,
      hosting: 0,
      retained: 0,
      lost: 0,
    };

    for (const p of partners) {
      const stage = p.funnel_stage ?? 'lead';
      byFunnelStage[stage] = (byFunnelStage[stage] || 0) + 1;
    }

    // Call -> Open: called partners that have opportunities opened
    const calledPartners = partners.filter((p) =>
      ['called', 'meeting', 'open created', 'contract signed', 'hosting', 'retained'].includes(
        p.funnel_stage ?? 'lead'
      )
    );
    const partnersWithOpen = calledPartners.filter((p) =>
      opportunities.some(
        (o) => o.op_id === p.id || (o as { partner_id?: string }).partner_id === p.id
      )
    );
    const callToOpen =
      calledPartners.length > 0 ? (partnersWithOpen.length / calledPartners.length) * 100 : 0;

    // Open -> APL: opportunities that received at least one applicant/exchange
    const oppsWithApplicants = opportunities.filter((o) =>
      exchanges.some((e) => e.opportunity_id === o.id)
    );
    const openToApl =
      opportunities.length > 0 ? (oppsWithApplicants.length / opportunities.length) * 100 : 0;

    // APL -> APD: applications converted to approval
    const totalApplicants = exchanges.length;
    const approvedExchanges = exchanges.filter((e) =>
      ['APD', 'RE', 'FI', 'CO'].includes(e.status)
    );
    const aplToApd =
      totalApplicants > 0 ? (approvedExchanges.length / totalApplicants) * 100 : 0;

    return {
      totalPartners: partners.length,
      byFunnelStage,
      callToOpenConversionPct: Number(callToOpen.toFixed(1)),
      openToAplConversionPct: Number(openToApl.toFixed(1)),
      aplToApdConversionPct: Number(aplToApd.toFixed(1)),
    };
  },

  /**
   * Soft deletes a partner touchpoint (INV-01).
   */
  softDeleteTouchpoint(id: string, reason: string, actorId: string): PartnerTouchpoint {
    const existing = touchpointDb.touchpoints.get(id);
    if (!existing || existing.deleted_at) {
      throw new Error(`Touchpoint '${id}' not found or already deleted.`);
    }

    const payload = createSoftDeletePayload(actorId, reason);
    const updated: PartnerTouchpoint = {
      ...existing,
      ...payload,
    };

    touchpointDb.touchpoints.set(id, updated);

    // Audit log (INV-09)
    const masterDb = getMasterTrackerDb();
    masterDb.auditLogs.push({
      id: masterDb.auditLogs.length + 1,
      ts: payload.deleted_at,
      actor: actorId,
      action: 'SOFT_DELETE_TOUCHPOINT',
      table_name: 'partner_touchpoint',
      record_id: id,
      before: existing as unknown as Record<string, unknown>,
      after: updated as unknown as Record<string, unknown>,
    });

    return updated;
  },

  /**
   * Hard delete prohibition check (INV-01, DQ-081).
   */
  hardDeleteTouchpoint(id: string, actorId?: string | null): never {
    assertNoHardDelete('partner_touchpoint', id, actorId);
  },
};
