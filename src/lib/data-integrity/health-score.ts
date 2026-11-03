/**
 * AIESEC iCX ERP — Data Health Score Algorithm
 * Author: Wadii Hani <wadii.hani.pro@gmail.com>
 * Specification: iCX_Data_Integrity_Tracking_Spec.md v1.0 (§14 Data Health Score)
 * Milestone: M7 (Plan 07-02)
 * Formula: Weighted Score 0–100 (Completeness 35% · Freshness 25% · EXPA Consistency 25% · Ownership 15%)
 */

import type {
  DataHealthScoreResult,
  HealthGrade,
  FlowStage,
} from '../types/data-integrity';
import { getMasterTrackerDb } from './master-tracker';
import { dataQualityService } from './data-quality';
import { statusToFlowStage, validateStageRequiredFields } from './stage-gates';

export interface HealthScoreWeights {
  completeness: number; // default 0.35
  freshness: number; // default 0.25
  expaConsistency: number; // default 0.25
  ownership: number; // default 0.15
}

export const DEFAULT_HEALTH_WEIGHTS: HealthScoreWeights = {
  completeness: 0.35,
  freshness: 0.25,
  expaConsistency: 0.25,
  ownership: 0.15,
};

export function scoreToGrade(score: number): HealthGrade {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

export const dataHealthScoreService = {
  computeHealthScore(options?: {
    now?: Date | string;
    weights?: Partial<HealthScoreWeights>;
  }): DataHealthScoreResult {
    const evalTime = options?.now ? new Date(options.now).getTime() : Date.now();
    const weights: HealthScoreWeights = {
      ...DEFAULT_HEALTH_WEIGHTS,
      ...options?.weights,
    };

    const masterDb = getMasterTrackerDb();

    // 1. COMPLETENESS DIMENSION (35%)
    // Evaluate required fields per stage (§5.1) across active exchanges
    const activeExchanges = Array.from(masterDb.exchanges.values()).filter(
      (ex) => !ex.deleted_at
    );

    let totalStageChecks = 0;
    let failedStageChecks = 0;

    for (const ex of activeExchanges) {
      const stage = statusToFlowStage(ex.status);
      const opp = masterDb.opportunities.get(ex.opportunity_id);
      const contract = Array.from(masterDb.contracts.values()).find(
        (c) => c.opportunity_id === ex.opportunity_id
      );

      const val = validateStageRequiredFields(stage, {
        exchange: ex,
        opportunity: opp,
        contract,
      });

      totalStageChecks++;
      if (!val.passed) {
        failedStageChecks++;
      }
    }

    const completenessPct =
      totalStageChecks > 0
        ? Math.max(0, 100 - (failedStageChecks / totalStageChecks) * 100)
        : 100;
    const completenessScore = Number(completenessPct.toFixed(1));

    // 2. FRESHNESS / TIMELINESS DIMENSION (25%)
    // Check SLA idle time (<= 14d) on exchanges and partner touchpoints (<= 35d)
    let totalMonitoredRecords = 0;
    let staleRecordsCount = 0;

    for (const ex of activeExchanges) {
      if (['APL', 'ACP', 'APD', 'RE'].includes(ex.status)) {
        totalMonitoredRecords++;
        const lastUpdated = new Date(ex.expa_synced_at || ex.created_at).getTime();
        const idleDays = Math.floor((evalTime - lastUpdated) / (1000 * 60 * 60 * 24));
        if (idleDays > 14) {
          staleRecordsCount++;
        }
      }
    }

    for (const p of Array.from(masterDb.partners.values())) {
      if (p.deleted_at) continue;
      totalMonitoredRecords++;
      const lastTouch = p.last_touchpoint_at ? new Date(p.last_touchpoint_at).getTime() : 0;
      const gapDays = lastTouch > 0 ? Math.floor((evalTime - lastTouch) / (1000 * 60 * 60 * 24)) : 999;
      if (gapDays > 35) {
        staleRecordsCount++;
      }
    }

    const freshnessPct =
      totalMonitoredRecords > 0
        ? Math.max(0, 100 - (staleRecordsCount / totalMonitoredRecords) * 100)
        : 100;
    const freshnessScore = Number(freshnessPct.toFixed(1));

    // 3. EXPA CONSISTENCY DIMENSION (25%)
    // Open issues related to reconciliation: DQ-040, DQ-041, DQ-042, DQ-082
    const expaIssues = dataQualityService.listIssues({ status: 'open' }).filter((i) =>
      ['DQ-040', 'DQ-041', 'DQ-042', 'DQ-082'].includes(i.rule_id)
    );
    const expaConsistencyScore = Math.max(0, 100 - expaIssues.length * 20);

    // 4. OWNERSHIP & ACCOUNTABILITY DIMENSION (15%)
    // Unowned records or inactive owners: DQ-010, DQ-011
    const ownershipIssues = dataQualityService.listIssues({ status: 'open' }).filter((i) =>
      ['DQ-010', 'DQ-011'].includes(i.rule_id)
    );
    const ownershipScore = Math.max(0, 100 - ownershipIssues.length * 25);

    // 5. COMPUTE WEIGHTED OVERALL SCORE
    const weightedCompleteness = completenessScore * weights.completeness;
    const weightedFreshness = freshnessScore * weights.freshness;
    const weightedConsistency = expaConsistencyScore * weights.expaConsistency;
    const weightedOwnership = ownershipScore * weights.ownership;

    const overallScore = Math.min(
      100,
      Math.max(
        0,
        Math.round(
          weightedCompleteness +
            weightedFreshness +
            weightedConsistency +
            weightedOwnership
        )
      )
    );

    const grade = scoreToGrade(overallScore);

    // Issue counters
    const openIssues = dataQualityService.listIssues({ status: 'open' });
    const blockerCount = openIssues.filter((i) => i.severity === 'Blocker').length;
    const urgentCount = openIssues.filter((i) => i.severity === 'Urgent').length;
    const warnCount = openIssues.filter((i) => i.severity === 'Warn').length;
    const reviewCount = openIssues.filter((i) => i.severity === 'Review').length;

    return {
      overallScore,
      grade,
      calculatedAt: new Date(evalTime).toISOString(),
      dimensions: {
        completeness: {
          score: completenessScore,
          weight: weights.completeness,
          weightedScore: Number(weightedCompleteness.toFixed(1)),
          details: {
            totalStageChecks,
            failedStageChecks,
            completenessPct,
          },
        },
        freshness: {
          score: freshnessScore,
          weight: weights.freshness,
          weightedScore: Number(weightedFreshness.toFixed(1)),
          details: {
            totalMonitoredRecords,
            staleRecordsCount,
            freshnessPct,
          },
        },
        expaConsistency: {
          score: expaConsistencyScore,
          weight: weights.expaConsistency,
          weightedScore: Number(weightedConsistency.toFixed(1)),
          details: {
            openExpaIssuesCount: expaIssues.length,
          },
        },
        ownership: {
          score: ownershipScore,
          weight: weights.ownership,
          weightedScore: Number(weightedOwnership.toFixed(1)),
          details: {
            ownershipIssuesCount: ownershipIssues.length,
          },
        },
      },
      blockerCount,
      urgentCount,
      warnCount,
      reviewCount,
    };
  },
};
