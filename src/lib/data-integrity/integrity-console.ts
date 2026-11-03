/**
 * AIESEC iCX ERP — Integrity Console Aggregator Engine
 * Author: Wadii Hani <wadii.hani.pro@gmail.com>
 * Specification: iCX_Data_Integrity_Tracking_Spec.md v1.0 (§14 Dashboards & Console)
 * Milestone: M7 (Plan 07-03)
 * Powers: 15 Operational Integrity Views & Drill-Down Reports
 */

import type {
  IntegrityConsoleSummary,
  FlowStage,
  DqSeverity,
  IrCluster,
} from '../types/data-integrity';
import { getMasterTrackerDb } from './master-tracker';
import { dataQualityService } from './data-quality';
import { dataHealthScoreService } from './health-score';
import { statusToFlowStage, validateStageRequiredFields } from './stage-gates';
import { qualityCaseService } from './quality-cases';
import { getIrEcosystemDb } from './ir-ecosystem';
import { statusGovernanceService } from './status-governance';

export interface ConsoleFilterOptions {
  programme?: string;
  stage?: FlowStage;
  ownerId?: string;
  partnerId?: string;
  irPartnerId?: string;
  now?: Date | string;
}

export const integrityConsoleService = {
  /**
   * Generates complete executive overview across all 15 operational console views.
   */
  getConsoleSummary(filters?: ConsoleFilterOptions): IntegrityConsoleSummary {
    const evalTime = filters?.now ? new Date(filters.now).getTime() : Date.now();
    const masterDb = getMasterTrackerDb();
    const irDb = getIrEcosystemDb();

    // 1. Data Health Score
    const healthScore = dataHealthScoreService.computeHealthScore({ now: new Date(evalTime) });

    // 2. Open DQ Issues
    const openIssues = dataQualityService.listIssues({ status: 'open' });
    const openIssuesBySeverity: Record<DqSeverity, number> = {
      Urgent: 0,
      Blocker: 0,
      Warn: 0,
      Review: 0,
    };
    const openIssuesByOwner: Record<string, number> = {};

    for (const issue of openIssues) {
      openIssuesBySeverity[issue.severity] = (openIssuesBySeverity[issue.severity] || 0) + 1;
      const owner = issue.owner_id || 'unassigned';
      openIssuesByOwner[owner] = (openIssuesByOwner[owner] || 0) + 1;
    }

    // 3. Staleness Radar by Stage
    const stages: FlowStage[] = [
      'attraction',
      'consideration',
      'preparation',
      'experience',
      'post_experience',
    ];
    const stalenessByStage: Record<
      FlowStage,
      { total: number; stale: number; stalePct: number }
    > = {
      attraction: { total: 0, stale: 0, stalePct: 0 },
      consideration: { total: 0, stale: 0, stalePct: 0 },
      preparation: { total: 0, stale: 0, stalePct: 0 },
      experience: { total: 0, stale: 0, stalePct: 0 },
      post_experience: { total: 0, stale: 0, stalePct: 0 },
    };

    for (const ex of Array.from(masterDb.exchanges.values())) {
      if (ex.deleted_at) continue;
      const stg = statusToFlowStage(ex.status);
      stalenessByStage[stg].total++;

      const lastUpdated = new Date(ex.expa_synced_at || ex.created_at).getTime();
      const idleDays = Math.floor((evalTime - lastUpdated) / (1000 * 60 * 60 * 24));
      if (idleDays > 14 && ['APL', 'ACP', 'APD', 'RE'].includes(ex.status)) {
        stalenessByStage[stg].stale++;
      }
    }

    for (const stg of stages) {
      const { total, stale } = stalenessByStage[stg];
      stalenessByStage[stg].stalePct = total > 0 ? Number(((stale / total) * 100).toFixed(1)) : 0;
    }

    // 4. Completeness by Stage
    const completenessByStage: Record<
      FlowStage,
      { requiredCount: number; filledCount: number; completenessPct: number }
    > = {
      attraction: { requiredCount: 0, filledCount: 0, completenessPct: 100 },
      consideration: { requiredCount: 0, filledCount: 0, completenessPct: 100 },
      preparation: { requiredCount: 0, filledCount: 0, completenessPct: 100 },
      experience: { requiredCount: 0, filledCount: 0, completenessPct: 100 },
      post_experience: { requiredCount: 0, filledCount: 0, completenessPct: 100 },
    };

    for (const ex of Array.from(masterDb.exchanges.values())) {
      if (ex.deleted_at) continue;
      const stg = statusToFlowStage(ex.status);
      const val = validateStageRequiredFields(stg, {
        exchange: ex,
        opportunity: masterDb.opportunities.get(ex.opportunity_id),
        contract: Array.from(masterDb.contracts.values()).find(
          (c) => c.opportunity_id === ex.opportunity_id
        ),
      });

      const totalFieldsForStage = val.missingFields.length + (val.passed ? 5 : 2);
      const filledFields = totalFieldsForStage - val.missingFields.length;

      completenessByStage[stg].requiredCount += totalFieldsForStage;
      completenessByStage[stg].filledCount += filledFields;
    }

    for (const stg of stages) {
      const { requiredCount, filledCount } = completenessByStage[stg];
      completenessByStage[stg].completenessPct =
        requiredCount > 0 ? Number(((filledCount / requiredCount) * 100).toFixed(1)) : 100;
    }

    // 5. Reconciliation Mismatches
    const reconciliationMismatchCount = openIssues.filter((i) =>
      ['DQ-040', 'DQ-041', 'DQ-042', 'DQ-082'].includes(i.rule_id)
    ).length;

    // 6. Orphans
    const orphanedRecordsCount = openIssues.filter((i) =>
      ['DQ-010', 'DQ-011'].includes(i.rule_id)
    ).length;

    // 7. Deadline Radar (next 14 days)
    let deadlinesNext14DaysCount = 0;
    for (const ex of Array.from(masterDb.exchanges.values())) {
      if (ex.deleted_at) continue;
      const checkDate = (dateStr?: string | null) => {
        if (!dateStr) return;
        const diffDays = (new Date(dateStr).getTime() - evalTime) / (1000 * 60 * 60 * 24);
        if (diffDays >= 0 && diffDays <= 14) deadlinesNext14DaysCount++;
      };
      checkDate(ex.re_date);
      checkDate(ex.fi_date);
      checkDate(ex.co_date);
    }

    // 8. Request Queue
    const openRequestsCount = statusGovernanceService.listStatusRequests().filter(
      (r) => r.current_status !== 'applied_in_expa' && r.current_status !== 'rejected'
    ).length;

    // 9. Standards Delivery & 10. Mismatches
    let totalHostChecks = 0;
    let deliveredHostChecks = 0;
    let standardsMismatchCount = 0;

    for (const check of Array.from(masterDb.standardChecks.values())) {
      if (check.std_no >= 4 && check.std_no <= 15) {
        totalHostChecks++;
        if (check.tracked_status === 'delivered') deliveredHostChecks++;
      }
      if (
        check.tracked_status === 'delivered' &&
        check.ep_reported_answer &&
        ['no', 'not agreed'].some((s) => check.ep_reported_answer?.toLowerCase().includes(s))
      ) {
        standardsMismatchCount++;
      }
    }

    const overallStandardsDeliveryPct =
      totalHostChecks > 0
        ? Number(((deliveredHostChecks / totalHostChecks) * 100).toFixed(1))
        : 100;

    // 11. Partner Health
    const allPartners = Array.from(masterDb.partners.values()).filter((p) => !p.deleted_at);
    let partnersWithOverdueTouchpoint = 0;

    for (const p of allPartners) {
      const lastTouch = p.last_touchpoint_at ? new Date(p.last_touchpoint_at).getTime() : 0;
      const gapDays = lastTouch > 0 ? Math.floor((evalTime - lastTouch) / (1000 * 60 * 60 * 24)) : 999;
      if (gapDays > 35) partnersWithOverdueTouchpoint++;
    }

    // 12. IR Clusters
    const irClustersCount: Record<IrCluster, number> = {
      upscale: 0,
      grow: 0,
      understand: 0,
      invest: 0,
    };
    for (const ir of Array.from(irDb.irPartners.values())) {
      if (!ir.deleted_at) {
        irClustersCount[ir.cluster] = (irClustersCount[ir.cluster] || 0) + 1;
      }
    }

    // 14. Quality Cases KPIs
    const csKpis = qualityCaseService.computeCsKpis({
      month: new Date(evalTime).toISOString().slice(0, 7),
    });

    return {
      healthScore,
      openIssuesBySeverity,
      openIssuesByOwner,
      stalenessByStage,
      completenessByStage,
      reconciliationMismatchCount,
      orphanedRecordsCount,
      deadlinesNext14DaysCount,
      openRequestsCount,
      overallStandardsDeliveryPct,
      standardsMismatchCount,
      totalPartners: allPartners.length,
      partnersWithOverdueTouchpoint,
      irClustersCount,
      openCasesCount: csKpis.openCasesCount,
      totalCompensationMAD: csKpis.totalCompensationAmount,
    };
  },
};
