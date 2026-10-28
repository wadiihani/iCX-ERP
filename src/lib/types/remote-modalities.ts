/**
 * Remote & Hybrid Exchange Modalities Domain Types
 * Statutory References: AEPP Section 4.4, ICB Remote Exchange Framework, REQ-038, REQ-039, TEST-036, TEST-037
 * Jurisdiction: AIESEC in Rabat (LC Rabat, MC Morocco)
 */

export type ExchangeModality = 'ONSITE' | 'PARTLY_REMOTE' | 'FULLY_REMOTE';

export interface PartlyRemoteSchedule {
  totalDurationWeeks: number; // Min 13 weeks (REQ-038)
  remoteWeeks: number;
  onsiteWeeks: number;
  remoteSharePercentage: number; // Max 50% (REQ-038)
  icbAuditReference: string; // Mandatory (REQ-038, TEST-036)
  icbApprovedAt?: string;
}

export interface FullyRemoteSchedule {
  totalDurationWeeks: number; // 6 to 26 weeks (REQ-039)
  virtualWorkspaceUrl: string;
  timeZoneOffset: string;
}

export interface RemoteStandardApplicability {
  standardNumber: number;
  title: string;
  category: 'PREPARATION' | 'DEVELOPMENT' | 'EXPERIENCE' | 'POST_EXPERIENCE';
  isMandatoryOnsite: boolean;
  isApplicableRemote: boolean;
  adaptationGuidance: string;
}

export interface RemoteOpportunityValidationResult {
  isValid: boolean;
  modality: ExchangeModality;
  totalWeeks: number;
  remotePercentage: number;
  violations: string[];
  applicableStandardsCount: number;
  physicalStandardsExempted: number;
  icbApprovalValid: boolean;
}
