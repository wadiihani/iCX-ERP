import { createHash } from 'node:crypto';
import type {
  CadenceMeeting,
  GovernanceMeetingType,
  AttendanceRecord,
  ActionItem,
  TermCloseSnapshot,
  OpenExportManifest,
  ExternalFundingAssessment,
  AccountsReceivableAging,
  AgingBucket,
} from '../types/governance-export';
import type { CaseStatus } from '../types/quality-cases';

/**
 * Computes a SHA-256 hex digest for any string or object.
 */
export function computeSha256(content: string | object): string {
  const text = typeof content === 'string' ? content : JSON.stringify(content);
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

/**
 * Records a cadence meeting with quorum calculation and tamper-evident SHA-256 minute hash.
 * Statutory reference: REQ-091, TEST-087.
 */
export function recordCadenceMeeting(params: {
  id: string;
  lcId: string;
  meetingType: GovernanceMeetingType;
  title: string;
  scheduledAt: string;
  conductedAt?: string;
  location: string;
  attendees: AttendanceRecord[];
  actionItems: ActionItem[];
  minutesText: string;
  recordedByUserId: string;
}): CadenceMeeting {
  const totalInvited = params.attendees.length;
  const attendedCount = params.attendees.filter((a) => a.attended).length;
  const quorumRatio = totalInvited > 0 ? Number((attendedCount / totalInvited).toFixed(2)) : 0;
  
  // Quorum threshold: 50% for standard meetings, 66% (2/3) for LCM
  const quorumThreshold = params.meetingType === 'LCM' ? 0.66 : 0.50;
  const quorumReached = quorumRatio >= quorumThreshold;

  const minutesSha256Hash = computeSha256(params.minutesText.trim());

  return {
    id: params.id,
    lcId: params.lcId,
    meetingType: params.meetingType,
    title: params.title,
    scheduledAt: params.scheduledAt,
    conductedAt: params.conductedAt || new Date().toISOString(),
    location: params.location,
    quorumReached,
    quorumRatio,
    attendees: params.attendees,
    actionItems: params.actionItems,
    minutesText: params.minutesText,
    minutesSha256Hash,
    recordedByUserId: params.recordedByUserId,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Generates an immutable, read-only Term-Close snapshot with cryptographic verification.
 * Statutory reference: REQ-100, TEST-096.
 */
export function generateTermCloseSnapshot(params: {
  snapshotId: string;
  termCode: string;
  lcId: string;
  generatedByUserId: string;
  operationalMetrics: TermCloseSnapshot['operationalMetrics'];
  financialSummary: TermCloseSnapshot['financialSummary'];
  activeRosterCount: number;
  signedBy: {
    lcpUserId: string;
    lcvpFnLUserId: string;
    signedAt: string;
  };
}): TermCloseSnapshot {
  const snapshotDataWithoutChecksum = {
    snapshotId: params.snapshotId,
    termCode: params.termCode,
    lcId: params.lcId,
    generatedAt: new Date().toISOString(),
    generatedByUserId: params.generatedByUserId,
    isFrozenReadOnly: true,
    operationalMetrics: params.operationalMetrics,
    financialSummary: params.financialSummary,
    activeRosterCount: params.activeRosterCount,
    signedBy: params.signedBy,
  };

  const checksumSha256 = computeSha256(snapshotDataWithoutChecksum);

  return {
    ...snapshotDataWithoutChecksum,
    checksumSha256,
  };
}

/**
 * Verifies that a historical snapshot has not been altered or tampered with.
 */
export function verifySnapshotIntegrity(snapshot: TermCloseSnapshot): boolean {
  const { checksumSha256, ...data } = snapshot;
  const expectedChecksum = computeSha256(data);
  return checksumSha256 === expectedChecksum;
}

/**
 * Exports complete ERP operational data in open formats (JSON & CSV) ensuring zero vendor lock-in.
 * Statutory reference: REQ-116, TEST-112.
 */
export function exportFullDataArchive(
  lcId: string,
  datasets: {
    opportunities: Array<Record<string, unknown>>;
    leads: Array<Record<string, unknown>>;
    exchangeParticipants: Array<Record<string, unknown>>;
    qualityCases: Array<Record<string, unknown>>;
    invoices: Array<Record<string, unknown>>;
    disbursements: Array<Record<string, unknown>>;
    auditLogEntries: Array<Record<string, unknown>>;
  }
): OpenExportManifest {
  const exportId = `EXPORT-${lcId}-${Date.now()}`;
  const generatedAt = new Date().toISOString();
  const entitiesIncluded = Object.keys(datasets);
  
  let totalRecordCount = 0;
  const checksums: Record<string, string> = {};

  for (const [entityName, records] of Object.entries(datasets)) {
    totalRecordCount += records.length;
    checksums[entityName] = computeSha256(records);
  }

  const jsonPayload = JSON.stringify(
    {
      metadata: {
        exportId,
        lcId,
        generatedAt,
        schemaVersion: '2.0.0',
        standardsBaseline: 'AIESEC 2024 Refresh',
        compliance: 'Moroccan Law 09-08 (CNDP) & AFPM',
      },
      datasets,
    },
    null,
    2
  );

  // Generate CSV manifest of entity summary counts & checksums
  const csvRows = [
    'Entity,RecordCount,ChecksumSha256',
    ...Object.entries(datasets).map(
      ([entity, records]) => `${entity},${records.length},${checksums[entity]}`
    ),
  ];
  const csvManifest = csvRows.join('\n');

  return {
    exportId,
    generatedAt,
    lcId,
    schemaVersion: '2.0.0',
    entitiesIncluded,
    formats: ['JSON', 'CSV'],
    totalRecordCount,
    checksums,
    downloadPayloads: {
      jsonPayload,
      csvManifest,
    },
  };
}

/**
 * Evaluates whether partner score updates are frozen due to unresolved quality cases.
 * Statutory reference: REQ-082, TEST-078.
 */
export function evaluatePartnerScoreGate(params: {
  partnerId: string;
  currentScore: number;
  newCalculatedScore: number;
  linkedCaseStatuses: CaseStatus[];
}): {
  scoreFrozen: boolean;
  effectiveScore: number;
  reason: string;
} {
  const unresolvedStatuses: CaseStatus[] = [
    'SUBMITTED',
    'UNDER_INVESTIGATION',
    'RESOLUTION_PROPOSED',
    'ESCALATED',
    'STAGE_1_LC' as any,
    'STAGE_2_ECB' as any,
    'STAGE_3_ICB' as any,
  ];

  const hasUnresolvedCase = params.linkedCaseStatuses.some((status) =>
    unresolvedStatuses.includes(status)
  );

  if (hasUnresolvedCase) {
    return {
      scoreFrozen: true,
      effectiveScore: params.currentScore,
      reason: 'Partner score update frozen: active unresolved quality case pending formal closure (REQ-082)',
    };
  }

  return {
    scoreFrozen: false,
    effectiveScore: params.newCalculatedScore,
    reason: 'Partner score successfully updated: all quality cases closed or resolved (REQ-082)',
  };
}

/**
 * Calculates iGV project external funding coverage against the 70% threshold.
 * Statutory reference: REQ-086, TEST-081.
 */
export function calculateExternalFundingCoverage(
  opportunityId: string,
  totalBudgetMAD: number,
  externalFundingMAD: number
): ExternalFundingAssessment {
  if (totalBudgetMAD <= 0) {
    throw new Error('Total project budget must be greater than zero');
  }

  const internalFundingMAD = Math.max(0, totalBudgetMAD - externalFundingMAD);
  const externalCoveragePercentage = Number(
    ((externalFundingMAD / totalBudgetMAD) * 100).toFixed(2)
  );
  const meetsSeventyPercentThreshold = externalCoveragePercentage >= 70;

  return {
    opportunityId,
    totalBudgetMAD,
    externalFundingMAD,
    internalFundingMAD,
    externalCoveragePercentage,
    meetsSeventyPercentThreshold,
    status: meetsSeventyPercentThreshold ? 'COMPLIANT' : 'DEFICIT_WARNING',
  };
}

/**
 * Evaluates Accounts Receivable (AR) aging and triggers alerts per AUTO-031.
 * Statutory reference: AUTO-031, REQ-088, TEST-084.
 */
export function evaluateAccountsReceivableAging(params: {
  invoiceId: string;
  partnerName: string;
  amountMAD: number;
  dueDate: string;
  currentDate?: string;
}): AccountsReceivableAging {
  const due = new Date(params.dueDate).getTime();
  const current = params.currentDate ? new Date(params.currentDate).getTime() : Date.now();
  
  const diffDays = Math.floor((current - due) / (1000 * 60 * 60 * 24));
  const daysOverdue = Math.max(0, diffDays);

  let agingBucket: AgingBucket = 'CURRENT';
  let escalationTarget: AccountsReceivableAging['escalationTarget'] = 'ACCOUNT_MANAGER';
  let alertMessage = 'Invoice is within standard payment terms.';

  if (daysOverdue >= 30) {
    agingBucket = '30_DAY_ESCALATION';
    escalationTarget = 'LCP_AND_LEGAL';
    alertMessage = `CRITICAL ESCALATION (AUTO-031): Invoice overdue by ${daysOverdue} days (>= 30 days). Formal legal escalation to LCP and ECB required.`;
  } else if (daysOverdue >= 14) {
    agingBucket = '14_DAY_ALERT';
    escalationTarget = 'LCVP_FNL';
    alertMessage = `WARNING ALERT (AUTO-031): Invoice overdue by ${daysOverdue} days (>= 14 days). Automated reminder sent to LCVP Finance.`;
  } else if (daysOverdue > 0) {
    agingBucket = 'CURRENT';
    escalationTarget = 'ACCOUNT_MANAGER';
    alertMessage = `Grace period notice: Invoice overdue by ${daysOverdue} days. Contact partner account manager.`;
  }

  return {
    invoiceId: params.invoiceId,
    partnerName: params.partnerName,
    amountMAD: params.amountMAD,
    dueDate: params.dueDate,
    daysOverdue,
    agingBucket,
    escalationTarget,
    alertMessage,
  };
}
