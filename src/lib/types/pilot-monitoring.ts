/**
 * Pilot Operational Monitoring, Daily Reconciliation & Gate G7/G8 Types
 * Statutory References: Section 5.2 (Pilot Exit Criteria), Section 12 (Release Gates G7/G8), REQ-106..108, TEST-107..108
 * Jurisdiction: AIESEC in Rabat (LC Rabat, MC Morocco)
 */

export interface SyncDiscrepancy {
  entityType: 'EP_APPLICATION' | 'OPPORTUNITY' | 'ORGANIZATION';
  entityId: string;
  field: string;
  localValue: string;
  expaValue: string;
  detectedAt: string;
  isResolved: boolean;
  resolutionStrategy?: 'LOCAL_OVERWRITE' | 'EXPA_OVERWRITE' | 'HUMAN_INTERVENTION';
}

export interface ReconciliationAuditResult {
  auditId: string;
  lcId: string;
  auditedAt: string;
  localRecordsEvaluated: number;
  expaRecordsEvaluated: number;
  matchedCount: number;
  discrepanciesCount: number;
  discrepancies: SyncDiscrepancy[];
  isClean: boolean;
}

export interface TenantIsolationAuditResult {
  auditId: string;
  primaryLcId: string;
  otherLcsSampled: string[];
  totalRecordsScanned: number;
  leakCount: number;
  leaks: Array<{
    recordId: string;
    expectedLcId: string;
    actualLcId: string;
    violationType: string;
  }>;
  isIsolated: boolean;
}

export interface GateG7HealthReport {
  gateId: 'GATE_G7_MID_PILOT';
  lcId: string;
  evaluatedAt: string;
  uptimePercent: number; // Target >= 99.5%
  slaFirstContactPercent: number; // Target >= 95% within 24h
  t14ReadinessClearancePercent: number; // Target 100%
  unresolvedDiscrepanciesCount: number; // Target 0
  criticalDefectsCount: number; // Target 0
  status: 'PASSED' | 'WARNING' | 'ACTION_REQUIRED';
  recommendations: string[];
}

export interface PilotExitSignoff {
  role: 'LCVP_ICX' | 'LCVP_FNL' | 'LCP';
  officerName: string;
  officerEmail: string;
  signedAt: string;
  statement: string;
}

export interface PilotExitCertificate {
  certificateId: string;
  lcId: string;
  cohort: string;
  completedAt: string;
  criteria: {
    drRestorePassed: boolean;
    tenantIsolationPassed: boolean;
    syncDiscrepanciesZero: boolean;
    usabilityJourneysPassed: boolean;
  };
  signoffs: PilotExitSignoff[];
  verificationHash: string;
  status: 'APPROVED' | 'INCOMPLETE';
}
