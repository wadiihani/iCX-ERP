/**
 * Pilot Operational Monitoring, Daily Reconciliation & Gate G7/G8 Engine
 * Statutory References: Section 5.2 (Pilot Exit Criteria), Section 12 (Release Gates G7/G8), REQ-106..108, TEST-107..108, INV-04
 * Jurisdiction: AIESEC in Rabat (LC Rabat, MC Morocco)
 */

import { createHash } from 'node:crypto';
import type {
  SyncDiscrepancy,
  ReconciliationAuditResult,
  TenantIsolationAuditResult,
  GateG7HealthReport,
  PilotExitSignoff,
  PilotExitCertificate,
} from '../types/pilot-monitoring';

export interface LocalRecordAuditEntry {
  id: string;
  entityType: 'EP_APPLICATION' | 'OPPORTUNITY' | 'ORGANIZATION';
  status: string;
  updatedAt: string;
}

export interface ExpaRecordAuditEntry {
  id: string;
  status: string;
  updatedAt: string;
}

/**
 * REQ-106 & TEST-107: Daily Reconciliation Audit between Local DB and EXPA read-sync snapshots.
 * Flags any state drift or unhandled sync discrepancies.
 */
export function runDailyReconciliationAudit(
  lcId: string,
  localRecords: LocalRecordAuditEntry[],
  expaRecords: ExpaRecordAuditEntry[],
  timestamp: string = new Date().toISOString()
): ReconciliationAuditResult {
  const auditId = `RECON_${lcId}_${Date.now()}`;
  const discrepancies: SyncDiscrepancy[] = [];
  let matchedCount = 0;

  for (const local of localRecords) {
    const expa = expaRecords.find((e) => e.id === local.id);
    if (!expa) {
      discrepancies.push({
        entityType: local.entityType,
        entityId: local.id,
        field: 'RECORD_PRESENCE',
        localValue: 'EXISTS',
        expaValue: 'MISSING_IN_EXPA',
        detectedAt: timestamp,
        isResolved: false,
        resolutionStrategy: 'HUMAN_INTERVENTION',
      });
      continue;
    }

    if (local.status !== expa.status) {
      discrepancies.push({
        entityType: local.entityType,
        entityId: local.id,
        field: 'STATUS',
        localValue: local.status,
        expaValue: expa.status,
        detectedAt: timestamp,
        isResolved: false,
        resolutionStrategy: 'EXPA_OVERWRITE',
      });
    } else {
      matchedCount++;
    }
  }

  const isClean = discrepancies.length === 0;

  return {
    auditId,
    lcId,
    auditedAt: timestamp,
    localRecordsEvaluated: localRecords.length,
    expaRecordsEvaluated: expaRecords.length,
    matchedCount,
    discrepanciesCount: discrepancies.length,
    discrepancies,
    isClean,
  };
}

/**
 * INV-04, REQ-107 & TEST-108: Multi-Tenant Partition Isolation Audit.
 * Validates that no cross-LC data leaks occur between LC Rabat and other entities.
 */
export function auditTenantIsolation(
  primaryLcId: string,
  queriedRecords: Array<{ id: string; lcId: string; description?: string }>,
  otherLcsSampled: string[] = ['lc_casablanca', 'lc_marrakech']
): TenantIsolationAuditResult {
  const auditId = `TENANT_AUDIT_${primaryLcId}_${Date.now()}`;
  const leaks: TenantIsolationAuditResult['leaks'] = [];

  for (const record of queriedRecords) {
    if (record.lcId !== primaryLcId) {
      leaks.push({
        recordId: record.id,
        expectedLcId: primaryLcId,
        actualLcId: record.lcId,
        violationType: `INV-04 Breach: Record belonging to ${record.lcId} was returned in ${primaryLcId} tenant scope.`,
      });
    }
  }

  return {
    auditId,
    primaryLcId,
    otherLcsSampled,
    totalRecordsScanned: queriedRecords.length,
    leakCount: leaks.length,
    leaks,
    isIsolated: leaks.length === 0,
  };
}

/**
 * Release Gate G7: Mid-Term Operational Health Audit.
 * Evaluates system uptime, SLA first-contact adherence, and T-14 readiness clearance.
 */
export function evaluateGateG7Health(params: {
  lcId: string;
  uptimePercent: number;
  contactDurationsHours: number[]; // First-contact durations
  totalArrivalsCount: number;
  clearedArrivalsCount: number;
  unresolvedDiscrepancies: number;
  criticalDefects: number;
}): GateG7HealthReport {
  const evaluatedAt = new Date().toISOString();
  const recommendations: string[] = [];

  // Compute SLA First-Contact % (<= 24h)
  const timelyContacts = params.contactDurationsHours.filter((h) => h <= 24).length;
  const slaFirstContactPercent =
    params.contactDurationsHours.length > 0
      ? (timelyContacts / params.contactDurationsHours.length) * 100
      : 100;

  // Compute T-14 Clearance %
  const t14ReadinessClearancePercent =
    params.totalArrivalsCount > 0
      ? (params.clearedArrivalsCount / params.totalArrivalsCount) * 100
      : 100;

  let status: GateG7HealthReport['status'] = 'PASSED';

  if (params.uptimePercent < 99.5) {
    status = 'ACTION_REQUIRED';
    recommendations.push(`Uptime (${params.uptimePercent}%) falls below 99.5% operational threshold.`);
  }

  if (slaFirstContactPercent < 95) {
    status = 'ACTION_REQUIRED';
    recommendations.push(
      `First contact SLA compliance (${slaFirstContactPercent.toFixed(1)}%) falls below 95% threshold.`
    );
  }

  if (t14ReadinessClearancePercent < 100) {
    status = 'ACTION_REQUIRED';
    recommendations.push('Pending arrivals have unfulfilled T-14 statutory locks.');
  }

  if (params.unresolvedDiscrepancies > 0) {
    status = 'WARNING';
    recommendations.push(
      `Detected ${params.unresolvedDiscrepancies} unhandled sync discrepancies requiring resolution.`
    );
  }

  if (params.criticalDefects > 0) {
    status = 'ACTION_REQUIRED';
    recommendations.push(`Detected ${params.criticalDefects} critical blocking defects in pilot workflow.`);
  }

  if (recommendations.length === 0) {
    recommendations.push('All operational health parameters strictly compliant with Gate G7 criteria.');
  }

  return {
    gateId: 'GATE_G7_MID_PILOT',
    lcId: params.lcId,
    evaluatedAt,
    uptimePercent: params.uptimePercent,
    slaFirstContactPercent,
    t14ReadinessClearancePercent,
    unresolvedDiscrepanciesCount: params.unresolvedDiscrepancies,
    criticalDefectsCount: params.criticalDefects,
    status,
    recommendations,
  };
}

/**
 * Release Gate G8: Formal Pilot Exit & Production Readiness Evaluation (§5.2).
 * Strictly requires all 4 statutory exit criteria:
 * 1. DR restore drill passed (RPO <= 24h, RTO <= 72h).
 * 2. Tenant isolation audit clean (0 leaks).
 * 3. Daily reconciliation audit clean (0 discrepancies).
 * 4. Usability testing passed with 0 blocking defects.
 * AND requires triple executive sign-off (LCVP ICX, LCVP FnL, LCP).
 */
export function evaluateGateG8PilotExit(params: {
  lcId: string;
  cohort: string;
  drRestoreSuccess: boolean;
  tenantIsolationClean: boolean;
  reconciliationClean: boolean;
  usabilityDefectFree: boolean;
  signoffs: PilotExitSignoff[];
}): PilotExitCertificate {
  const completedAt = new Date().toISOString();
  const certificateId = `CERT_GATE_G8_${params.lcId}_${Date.now()}`;

  const criteria = {
    drRestorePassed: params.drRestoreSuccess,
    tenantIsolationPassed: params.tenantIsolationClean,
    syncDiscrepanciesZero: params.reconciliationClean,
    usabilityJourneysPassed: params.usabilityDefectFree,
  };

  // Check triple executive sign-off
  const signedRoles = new Set(params.signoffs.map((s) => s.role));
  const hasTripleSignoff =
    signedRoles.has('LCVP_ICX') &&
    signedRoles.has('LCVP_FNL') &&
    signedRoles.has('LCP');

  const allCriteriaPassed =
    criteria.drRestorePassed &&
    criteria.tenantIsolationPassed &&
    criteria.syncDiscrepanciesZero &&
    criteria.usabilityJourneysPassed &&
    hasTripleSignoff;

  // Build canonical hash
  const payload = JSON.stringify({
    certificateId,
    lcId: params.lcId,
    cohort: params.cohort,
    criteria,
    signoffs: params.signoffs,
  });

  const verificationHash = createHash('sha256').update(payload).digest('hex');

  return {
    certificateId,
    lcId: params.lcId,
    cohort: params.cohort,
    completedAt,
    criteria,
    signoffs: params.signoffs,
    verificationHash,
    status: allCriteriaPassed ? 'APPROVED' : 'INCOMPLETE',
  };
}
