/**
 * Governance, Cadence Meetings, Term Snapshot & Open Data Export Types
 * Statutory Baselines: AIESEC International Constitution, AIESEC Morocco Compendium, AFPM, Law 09-08 (CNDP)
 * Requirements: REQ-082, REQ-086, REQ-088, REQ-091, REQ-100, REQ-116
 */

export type GovernanceMeetingType = 'LCM' | 'EB' | 'CORE_COMMITTEE' | 'COMMISSION';

export interface AttendanceRecord {
  memberId: string;
  memberName: string;
  email: string;
  role: string;
  attended: boolean;
  excuseReason?: string;
}

export interface ActionItem {
  id: string;
  description: string;
  assigneeId: string;
  assigneeName: string;
  dueDate: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
}

export interface CadenceMeeting {
  id: string;
  lcId: string;
  meetingType: GovernanceMeetingType;
  title: string;
  scheduledAt: string;
  conductedAt?: string;
  location: string;
  quorumReached: boolean;
  quorumRatio: number; // e.g. 0.67 for 2/3 quorum
  attendees: AttendanceRecord[];
  actionItems: ActionItem[];
  minutesText: string;
  minutesSha256Hash: string;
  recordedByUserId: string;
  createdAt: string;
}

export interface TermCloseSnapshot {
  snapshotId: string;
  termCode: string; // e.g. '2025/2026'
  lcId: string;
  generatedAt: string;
  generatedByUserId: string;
  isFrozenReadOnly: boolean;
  checksumSha256: string;
  operationalMetrics: {
    totalApproved: number;
    totalRealized: number;
    totalFinished: number;
    totalCompleted: number;
    exchangeStandardsCompletionRate: number;
    totalQualityCases: number;
    resolvedQualityCases: number;
    harassmentCasesReported: number;
  };
  financialSummary: {
    totalInvoicedMAD: number;
    totalCollectedMAD: number;
    totalDisbursedMAD: number;
    netOperatingSurplusMAD: number;
    exchangeSustainabilityRatio: number;
  };
  activeRosterCount: number;
  signedBy: {
    lcpUserId: string;
    lcvpFnLUserId: string;
    signedAt: string;
  };
}

export interface OpenExportManifest {
  exportId: string;
  generatedAt: string;
  lcId: string;
  schemaVersion: string;
  entitiesIncluded: string[];
  formats: Array<'JSON' | 'CSV'>;
  totalRecordCount: number;
  checksums: Record<string, string>;
  downloadPayloads: {
    jsonPayload: string;
    csvManifest: string;
  };
}

export interface ExternalFundingAssessment {
  opportunityId: string;
  totalBudgetMAD: number;
  externalFundingMAD: number;
  internalFundingMAD: number;
  externalCoveragePercentage: number;
  meetsSeventyPercentThreshold: boolean;
  status: 'COMPLIANT' | 'DEFICIT_WARNING';
}

export type AgingBucket = 'CURRENT' | '14_DAY_ALERT' | '30_DAY_ESCALATION' | 'SEVERELY_OVERDUE';

export interface AccountsReceivableAging {
  invoiceId: string;
  partnerName: string;
  amountMAD: number;
  dueDate: string;
  daysOverdue: number;
  agingBucket: AgingBucket;
  escalationTarget: 'ACCOUNT_MANAGER' | 'LCVP_FNL' | 'LCP_AND_LEGAL';
  alertMessage: string;
}
