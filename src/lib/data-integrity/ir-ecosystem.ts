/**
 * AIESEC iCX ERP — International Relations (IR) Ecosystem & 2×2 Clustering Engine
 * Author: Wadii Hani <wadii.hani.pro@gmail.com>
 * Specification: iCX_Data_Integrity_Tracking_Spec.md v1.0 (§9.3, §12.1)
 * Milestone: M4 (Plan 04-03)
 * Enforces: INV-01 (No Hard Deletes), INV-03 (Active Owner), INV-09 (Attribution), D6 (Clustering), D7 (Stage SLA)
 */

import type {
  IrPartner,
  IrCluster,
  IrTrackerStatus,
  IrReviewFrequency,
  IrClusterAnalysis,
  IrCustomerFlowAnalytics,
  IrStandardsDeliveryAnalytics,
  StuckEp,
  FlowStage,
} from '../types/data-integrity';
import {
  assertNoHardDelete,
  createSoftDeletePayload,
  InvariantViolationError,
} from './invariants';
import { getMasterTrackerDb } from './master-tracker';
import { STATUTORY_STANDARD_DEFS } from './standards-service';

export interface InMemoryIrDbState {
  irPartners: Map<string, IrPartner>;
}

let irDbInstance: InMemoryIrDbState = {
  irPartners: new Map(),
};

export function getIrEcosystemDb(): InMemoryIrDbState {
  return irDbInstance;
}

export function resetIrEcosystemDb(): void {
  irDbInstance = {
    irPartners: new Map(),
  };
}

export interface ClusteringOptions {
  supplyThreshold?: number;
  readinessThreshold?: number;
}

export const irEcosystemService = {
  // ---------------------------------------------------------------------------
  // 1. IR PARTNER CRUD (INV-01, INV-03, INV-09)
  // ---------------------------------------------------------------------------

  createIrPartner(
    data: Omit<IrPartner, 'id' | 'created_at' | 'deleted_at' | 'deleted_reason' | 'cluster'> & {
      cluster?: IrCluster;
    },
    actorId: string
  ): IrPartner {
    // INV-03: Mandatory active owner
    if (!data.owner_id || data.owner_id.trim() === '') {
      throw new InvariantViolationError(
        'INV-03',
        'IR Partner record must have a mandatory active owner_id (§12.1)'
      );
    }

    if (!data.home_entity_id || data.home_entity_id.trim() === '') {
      throw new Error('IR Partner must reference a valid home_entity_id');
    }

    // Check duplicate active partnership for home_entity_id
    for (const p of Array.from(irDbInstance.irPartners.values())) {
      if (!p.deleted_at && p.home_entity_id === data.home_entity_id) {
        throw new Error(
          `An active IR partnership already exists for entity ${data.home_entity_id}`
        );
      }
    }

    const id = `irp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();

    const irPartner: IrPartner = {
      ...data,
      id,
      cluster: data.cluster ?? 'understand',
      created_at: now,
      deleted_at: null,
      deleted_reason: null,
    };

    irDbInstance.irPartners.set(id, irPartner);

    // INV-09: Universal audit logging
    const masterDb = getMasterTrackerDb();
    masterDb.auditLogs.push({
      id: masterDb.auditLogs.length + 1,
      ts: now,
      actor: actorId,
      action: 'INSERT',
      table_name: 'ir_partner',
      record_id: id,
      before: null,
      after: irPartner as unknown as Record<string, unknown>,
    });

    return irPartner;
  },

  getIrPartner(id: string): IrPartner | null {
    const p = irDbInstance.irPartners.get(id);
    if (!p || p.deleted_at) return null;
    return p;
  },

  getIrPartnerByEntity(homeEntityId: string): IrPartner | null {
    for (const p of Array.from(irDbInstance.irPartners.values())) {
      if (!p.deleted_at && p.home_entity_id === homeEntityId) {
        return p;
      }
    }
    return null;
  },

  listIrPartners(filter?: {
    cluster?: IrCluster;
    tracker_status?: IrTrackerStatus;
    owner_id?: string;
  }): IrPartner[] {
    const list: IrPartner[] = [];
    for (const p of Array.from(irDbInstance.irPartners.values())) {
      if (p.deleted_at) continue;
      if (filter?.cluster && p.cluster !== filter.cluster) continue;
      if (filter?.tracker_status && p.tracker_status !== filter.tracker_status) continue;
      if (filter?.owner_id && p.owner_id !== filter.owner_id) continue;
      list.push(p);
    }
    return list;
  },

  updateIrPartner(
    id: string,
    updates: Partial<Omit<IrPartner, 'id' | 'created_at' | 'deleted_at' | 'deleted_reason'>>,
    actorId: string
  ): IrPartner {
    const existing = irDbInstance.irPartners.get(id);
    if (!existing || existing.deleted_at) {
      throw new Error(`IR Partner not found: ${id}`);
    }

    // INV-03: If owner is changed, ensure not empty
    if (updates.owner_id !== undefined && (!updates.owner_id || updates.owner_id.trim() === '')) {
      throw new InvariantViolationError(
        'INV-03',
        'IR Partner record must have a mandatory active owner_id (§12.1)'
      );
    }

    const before = { ...existing };
    const updated: IrPartner = {
      ...existing,
      ...updates,
    };

    irDbInstance.irPartners.set(id, updated);

    // INV-09: Universal audit logging
    const masterDb = getMasterTrackerDb();
    masterDb.auditLogs.push({
      id: masterDb.auditLogs.length + 1,
      ts: new Date().toISOString(),
      actor: actorId,
      action: 'UPDATE',
      table_name: 'ir_partner',
      record_id: id,
      before: before as unknown as Record<string, unknown>,
      after: updated as unknown as Record<string, unknown>,
    });

    return updated;
  },

  softDeleteIrPartner(id: string, actorId: string, reason: string): IrPartner {
    const existing = irDbInstance.irPartners.get(id);
    if (!existing || existing.deleted_at) {
      throw new Error(`IR Partner not found: ${id}`);
    }

    const soft = createSoftDeletePayload(actorId, reason);
    const before = { ...existing };
    const updated: IrPartner = {
      ...existing,
      deleted_at: soft.deleted_at,
      deleted_reason: soft.deleted_reason,
    };

    irDbInstance.irPartners.set(id, updated);

    // INV-09: Universal audit logging
    const masterDb = getMasterTrackerDb();
    masterDb.auditLogs.push({
      id: masterDb.auditLogs.length + 1,
      ts: new Date().toISOString(),
      actor: actorId,
      action: 'SOFT_DELETE',
      table_name: 'ir_partner',
      record_id: id,
      before: before as unknown as Record<string, unknown>,
      after: updated as unknown as Record<string, unknown>,
    });

    return updated;
  },

  hardDeleteAttempt(id: string, actorId: string): never {
    return assertNoHardDelete('ir_partner', id, actorId);
  },

  // ---------------------------------------------------------------------------
  // 2. 2×2 CLUSTERING ALGORITHM (§9.3, S6, D6)
  // ---------------------------------------------------------------------------

  /**
   * Analyzes an IR partner's position on the 2×2 matrix:
   * Supply (applicants received from them) × Market Readiness (our opportunities available)
   */
  analyzeCluster(id: string, options?: ClusteringOptions): IrClusterAnalysis {
    const partner = this.getIrPartner(id);
    if (!partner) {
      throw new Error(`IR Partner not found: ${id}`);
    }

    const masterDb = getMasterTrackerDb();

    // 1. Calculate Supply: applicants received from them (iCX)
    // EPs belonging to partner.home_entity_id with registered exchanges
    const partnerEps = Array.from(masterDb.eps.values()).filter(
      (ep) => !ep.deleted_at && ep.home_entity_id === partner.home_entity_id
    );
    const epIds = new Set(partnerEps.map((ep) => ep.id));

    const receivedExchanges = Array.from(masterDb.exchanges.values()).filter(
      (ex) => !ex.deleted_at && epIds.has(ex.ep_id)
    );
    const supply = receivedExchanges.length;

    // 2. Calculate Market Readiness: our opportunities available (iCX)
    const availableOpportunities = Array.from(masterDb.opportunities.values()).filter(
      (opp) => !opp.deleted_at
    );
    const marketReadiness = availableOpportunities.reduce(
      (acc, opp) => acc + (opp.slots || 1),
      0
    );

    // 3. Resolve Thresholds (options take precedence over partner custom overrides, which take precedence over defaults)
    const defaultSupplyThreshold = 5;
    const defaultReadinessThreshold = 10;

    const supplyThreshold =
      options?.supplyThreshold ?? partner.custom_supply_threshold ?? defaultSupplyThreshold;
    const readinessThreshold =
      options?.readinessThreshold ?? partner.custom_readiness_threshold ?? defaultReadinessThreshold;

    const isHighSupply = supply >= supplyThreshold;
    const isHighReadiness = marketReadiness >= readinessThreshold;

    let cluster: IrCluster;
    let meaning: string;

    if (isHighSupply && isHighReadiness) {
      cluster = 'upscale';
      meaning = 'High Supply, High Market Readiness — Innovate together';
    } else if (!isHighSupply && isHighReadiness) {
      cluster = 'grow';
      meaning = 'Low Supply, High Market Readiness — Potential to grow';
    } else if (!isHighSupply && !isHighReadiness) {
      cluster = 'understand';
      meaning = 'Low Supply, Low Market Readiness — New cooperation, explore';
    } else {
      cluster = 'invest';
      meaning = 'High Supply, Low Market Readiness — Fix bottlenecks / attraction';
    }

    return {
      cluster,
      supply,
      marketReadiness,
      supplyThreshold,
      readinessThreshold,
      isHighSupply,
      isHighReadiness,
      meaning,
    };
  },

  /**
   * Recomputes cluster on the 2×2 matrix and updates the partner record.
   */
  recomputeCluster(id: string, actorId: string, options?: ClusteringOptions): IrPartner {
    const analysis = this.analyzeCluster(id, options);
    return this.updateIrPartner(
      id,
      {
        cluster: analysis.cluster,
      },
      actorId
    );
  },

  /**
   * Recomputes clusters for all active IR partnerships.
   */
  recomputeAllClusters(actorId: string, options?: ClusteringOptions): IrPartner[] {
    const partners = this.listIrPartners();
    return partners.map((p) => this.recomputeCluster(p.id, actorId, options));
  },

  // ---------------------------------------------------------------------------
  // 3. E2E CUSTOMER FLOW ANALYTICS (§9.3, S6)
  // ---------------------------------------------------------------------------

  getE2EAnalytics(irPartnerId: string): IrCustomerFlowAnalytics {
    const partner = this.getIrPartner(irPartnerId);
    if (!partner) {
      throw new Error(`IR Partner not found: ${irPartnerId}`);
    }

    const masterDb = getMasterTrackerDb();

    // Find all EPs from this entity
    const partnerEps = Array.from(masterDb.eps.values()).filter(
      (ep) => !ep.deleted_at && ep.home_entity_id === partner.home_entity_id
    );
    const epIds = new Set(partnerEps.map((ep) => ep.id));

    // Find exchanges
    const exchanges = Array.from(masterDb.exchanges.values()).filter(
      (ex) => !ex.deleted_at && epIds.has(ex.ep_id)
    );

    // Stage counts
    const attraction = partnerEps.length;
    let consideration = 0; // APL, ACP
    let preparation = 0; // APD
    let experience = 0; // RE
    let postExperience = 0; // FI, CO

    let countApl = 0;
    let countAcp = 0;
    let countApd = 0;
    let countRe = 0;
    let countCo = 0;

    let totalAplToApdDays = 0;
    let countAplToApd = 0;

    let totalApdToReDays = 0;
    let countApdToRe = 0;

    for (const ex of exchanges) {
      if (ex.status === 'APL') {
        consideration++;
        countApl++;
      } else if (ex.status === 'ACP') {
        consideration++;
        countAcp++;
      } else if (ex.status === 'APD') {
        preparation++;
        countApd++;
      } else if (ex.status === 'RE') {
        experience++;
        countRe++;
      } else if (ex.status === 'FI' || ex.status === 'CO') {
        postExperience++;
        if (ex.status === 'CO') countCo++;
      }

      // Check dates for process speed (calendar days)
      if (ex.approved_at && ex.created_at) {
        const aplDate = new Date(ex.created_at.slice(0, 10)).getTime();
        const apdDate = new Date(ex.approved_at.slice(0, 10)).getTime();
        if (apdDate >= aplDate) {
          totalAplToApdDays += (apdDate - aplDate) / (1000 * 60 * 60 * 24);
          countAplToApd++;
        }
      }

      if (ex.re_date && ex.approved_at) {
        const apdDate = new Date(ex.approved_at.slice(0, 10)).getTime();
        const reDate = new Date(ex.re_date.slice(0, 10)).getTime();
        if (reDate >= apdDate) {
          totalApdToReDays += (reDate - apdDate) / (1000 * 60 * 60 * 24);
          countApdToRe++;
        }
      }
    }

    const totalExchanges = exchanges.length;

    // Conversion formulas
    // APL -> ACP: proportion reaching at least ACP
    const progressedPastApl = exchanges.filter((e) =>
      ['ACP', 'APD', 'RE', 'FI', 'CO'].includes(e.status)
    ).length;
    const aplToAcpConversionPct =
      totalExchanges > 0 ? (progressedPastApl / totalExchanges) * 100 : 0;

    // ACP -> APD: proportion reaching at least APD from consideration
    const reachedApd = exchanges.filter((e) =>
      ['APD', 'RE', 'FI', 'CO'].includes(e.status)
    ).length;
    const acpToApdConversionPct =
      progressedPastApl > 0 ? (reachedApd / progressedPastApl) * 100 : 0;

    // APD -> RE: proportion reaching at least RE
    const reachedRe = exchanges.filter((e) =>
      ['RE', 'FI', 'CO'].includes(e.status)
    ).length;
    const apdToReConversionPct = reachedApd > 0 ? (reachedRe / reachedApd) * 100 : 0;

    // RE -> CO: proportion reaching Completed
    const completed = exchanges.filter((e) => e.status === 'CO').length;
    const reToCoConversionPct = reachedRe > 0 ? (completed / reachedRe) * 100 : 0;

    return {
      attraction,
      consideration,
      preparation,
      experience,
      postExperience,
      total: totalExchanges,
      aplToAcpConversionPct: Number(aplToAcpConversionPct.toFixed(1)),
      acpToApdConversionPct: Number(acpToApdConversionPct.toFixed(1)),
      apdToReConversionPct: Number(apdToReConversionPct.toFixed(1)),
      reToCoConversionPct: Number(reToCoConversionPct.toFixed(1)),
      avgProcessTimeDays: {
        aplToApd: countAplToApd > 0 ? Number((totalAplToApdDays / countAplToApd).toFixed(1)) : null,
        apdToRe: countApdToRe > 0 ? Number((totalApdToReDays / countApdToRe).toFixed(1)) : null,
      },
    };
  },

  // ---------------------------------------------------------------------------
  // 4. E2E STANDARDS DELIVERY ANALYTICS (§9.3, S6)
  // ---------------------------------------------------------------------------

  getE2EStandardsDelivery(irPartnerId: string): IrStandardsDeliveryAnalytics {
    const partner = this.getIrPartner(irPartnerId);
    if (!partner) {
      throw new Error(`IR Partner not found: ${irPartnerId}`);
    }

    const masterDb = getMasterTrackerDb();

    // Find EPs from this entity
    const partnerEps = Array.from(masterDb.eps.values()).filter(
      (ep) => !ep.deleted_at && ep.home_entity_id === partner.home_entity_id
    );
    const epIds = new Set(partnerEps.map((ep) => ep.id));

    // Find exchanges
    const exchanges = Array.from(masterDb.exchanges.values()).filter(
      (ex) => !ex.deleted_at && epIds.has(ex.ep_id)
    );

    if (exchanges.length === 0) {
      return {
        totalExchanges: 0,
        hostStandardsDeliveredPct: 0,
        homeStandardsDeliveredPct: 0,
        overallDeliveryPct: 0,
        byStandard: {},
      };
    }

    // Host standards: 4 to 15 (12 standards)
    // Home standards: 1 to 3, 16 (4 standards)
    const hostStdNos = new Set([4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    const homeStdNos = new Set([1, 2, 3, 16]);

    let totalHostChecks = 0;
    let deliveredHostChecks = 0;

    let totalHomeChecks = 0;
    let deliveredHomeChecks = 0;

    const byStandard: Record<
      number,
      { name: string; deliveredCount: number; totalCount: number; deliveredBy: string }
    > = {};

    for (const def of STATUTORY_STANDARD_DEFS) {
      byStandard[def.std_no] = {
        name: def.name,
        deliveredCount: 0,
        totalCount: 0,
        deliveredBy: def.delivered_by,
      };
    }

    for (const ex of exchanges) {
      for (const def of STATUTORY_STANDARD_DEFS) {
        const checkKey = `${ex.id}:${def.std_no}`;
        const check = masterDb.standardChecks.get(checkKey);
        const isDelivered = check?.tracked_status === 'delivered';

        byStandard[def.std_no].totalCount++;
        if (isDelivered) {
          byStandard[def.std_no].deliveredCount++;
        }

        if (hostStdNos.has(def.std_no)) {
          totalHostChecks++;
          if (isDelivered) deliveredHostChecks++;
        } else if (homeStdNos.has(def.std_no)) {
          totalHomeChecks++;
          if (isDelivered) deliveredHomeChecks++;
        }
      }
    }

    const hostStandardsDeliveredPct =
      totalHostChecks > 0 ? (deliveredHostChecks / totalHostChecks) * 100 : 0;
    const homeStandardsDeliveredPct =
      totalHomeChecks > 0 ? (deliveredHomeChecks / totalHomeChecks) * 100 : 0;
    const overallTotal = totalHostChecks + totalHomeChecks;
    const overallDelivered = deliveredHostChecks + deliveredHomeChecks;
    const overallDeliveryPct =
      overallTotal > 0 ? (overallDelivered / overallTotal) * 100 : 0;

    const formattedByStandard: Record<
      number,
      { name: string; deliveredPct: number; deliveredBy: string }
    > = {};

    for (const [noStr, val] of Object.entries(byStandard)) {
      const stdNo = Number(noStr);
      formattedByStandard[stdNo] = {
        name: val.name,
        deliveredBy: val.deliveredBy,
        deliveredPct:
          val.totalCount > 0
            ? Number(((val.deliveredCount / val.totalCount) * 100).toFixed(1))
            : 0,
      };
    }

    return {
      totalExchanges: exchanges.length,
      hostStandardsDeliveredPct: Number(hostStandardsDeliveredPct.toFixed(1)),
      homeStandardsDeliveredPct: Number(homeStandardsDeliveredPct.toFixed(1)),
      overallDeliveryPct: Number(overallDeliveryPct.toFixed(1)),
      byStandard: formattedByStandard,
    };
  },

  // ---------------------------------------------------------------------------
  // 5. STUCK EPS IN FUNNEL RADAR (§9.3, S6, D7)
  // ---------------------------------------------------------------------------

  /**
   * Identifies EPs from this IR partner that are stuck in the funnel (> maxIdleDays, default 14 days per D7)
   */
  getStuckEps(
    irPartnerId: string,
    options?: { maxIdleDays?: number; now?: Date | string }
  ): StuckEp[] {
    const partner = this.getIrPartner(irPartnerId);
    if (!partner) {
      throw new Error(`IR Partner not found: ${irPartnerId}`);
    }

    const maxIdleDays = options?.maxIdleDays ?? 14; // D7: 14 days maximum idle time
    const evalTime = options?.now ? new Date(options.now).getTime() : Date.now();

    const masterDb = getMasterTrackerDb();

    // Find EPs from this entity
    const partnerEps = Array.from(masterDb.eps.values()).filter(
      (ep) => !ep.deleted_at && ep.home_entity_id === partner.home_entity_id
    );
    const epMap = new Map(partnerEps.map((ep) => [ep.id, ep]));

    // Find active exchanges: APL, ACP, APD, RE
    const activeExchanges = Array.from(masterDb.exchanges.values()).filter(
      (ex) =>
        !ex.deleted_at &&
        epMap.has(ex.ep_id) &&
        ['APL', 'ACP', 'APD', 'RE'].includes(ex.status)
    );

    const stuckList: StuckEp[] = [];

    for (const ex of activeExchanges) {
      const ep = epMap.get(ex.ep_id)!;

      // Determine reference date: most recent timestamp on exchange
      const dateCandidates: number[] = [new Date(ex.created_at).getTime()];
      if (ex.approved_at) dateCandidates.push(new Date(ex.approved_at).getTime());
      if (ex.re_date) dateCandidates.push(new Date(ex.re_date).getTime());

      // Look at status histories for this exchange
      const histories = masterDb.statusHistories.filter((h) => h.exchange_id === ex.id);
      for (const h of histories) {
        dateCandidates.push(new Date(h.at).getTime());
      }

      const mostRecentDate = Math.max(...dateCandidates);
      const idleMs = evalTime - mostRecentDate;
      const idleDays = Math.floor(idleMs / (1000 * 60 * 60 * 24));

      if (idleDays > maxIdleDays) {
        let currentStage: FlowStage = 'consideration';
        let stuckReason = '';

        if (ex.status === 'APL' || ex.status === 'ACP') {
          currentStage = 'consideration';
          stuckReason = `EP waiting in Consideration without Approval for ${idleDays} days (SLA: ${maxIdleDays}d)`;
        } else if (ex.status === 'APD') {
          currentStage = 'preparation';
          stuckReason = `EP in Preparation without Realization for ${idleDays} days (SLA: ${maxIdleDays}d)`;
        } else if (ex.status === 'RE') {
          currentStage = 'experience';
          stuckReason = `EP in Experience without progression for ${idleDays} days (SLA: ${maxIdleDays}d)`;
        }

        stuckList.push({
          epId: ep.id,
          fullName: ep.full_name,
          exchangeId: ex.id,
          status: ex.status,
          currentStage,
          idleDays,
          ownerId: ex.owner_id,
          stuckReason,
        });
      }
    }

    return stuckList;
  },
};
