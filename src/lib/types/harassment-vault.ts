/**
 * Harassment Prevention Vault (Annex 1) Domain Types
 * Statutory References: AEPP Annex 1 (Harassment Policy), APIP, REQ-080, REQ-084, AUTO-030, TEST-076
 * Jurisdiction: AIESEC in Rabat (LC Rabat, MC Morocco)
 */

import type { AiesecRole } from './auth-onboarding';

export type HarassmentIncidentType =
  | 'VERBAL_HARASSMENT'
  | 'PHYSICAL_HARASSMENT'
  | 'SEXUAL_HARASSMENT'
  | 'INTIMIDATION'
  | 'DISCRIMINATION';

export type SafetyMeasureStatus =
  | 'IMMEDIATE_PHYSICAL_SEPARATION'
  | 'SAFE_HOUSING_REASSIGNED'
  | 'POLICE_REPORTED'
  | 'EMBASSY_NOTIFIED'
  | 'PSYCHOLOGICAL_SUPPORT_OFFERED';

export interface EncryptedDataEnvelope {
  ciphertext: string;
  iv: string; // 12-byte hex IV for GCM
  authTag: string; // 16-byte hex authentication tag
  keyId: string;
  algorithm: 'aes-256-gcm';
}

export interface HarassmentCaseRecord {
  id: string;
  caseNumber: string;
  lcId: string;
  reportedAt: string; // ISO 8601
  incidentType: HarassmentIncidentType;
  // Encrypted sensitive narratives & parties to prevent technical/DB snooping
  encryptedNarrative: EncryptedDataEnvelope;
  encryptedParties: EncryptedDataEnvelope;
  safetyAction24hCompletedAt?: string;
  safetyMeasuresTaken: SafetyMeasureStatus[];
  status: 'EMERGENCY_TRIAGE' | 'COMMITTEE_INVESTIGATION' | 'FORMAL_DISPOSITION' | 'CLOSED';
  formalDispositionDeadline: string; // 7 days (168 hours) from reportedAt
  resolvedAt?: string;
  dispositionSummary?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DecryptedHarassmentDetails {
  caseNumber: string;
  victimName: string;
  accusedName: string;
  narrative: string;
  reportedBy: string;
}

export interface VaultAccessCheckResult {
  isAuthorized: boolean;
  officerRole?: AiesecRole;
  error?: string;
}

export interface VaultDualClockEvaluation {
  caseId: string;
  reportedAt: string;
  safetyClock24hRemainingHours: number;
  safetyClock24hBreached: boolean;
  safetyActionComplete: boolean;
  investigationClock7dRemainingHours: number;
  investigationClock7dBreached: boolean;
  investigationComplete: boolean;
}
