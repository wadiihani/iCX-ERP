/**
 * Harassment Prevention Vault (Annex 1) Engine
 * Statutory References: AEPP Annex 1, APIP, REQ-080, REQ-084, AUTO-030, TEST-076, Moroccan Law 09-08
 * Jurisdiction: AIESEC in Rabat (LC Rabat, MC Morocco)
 */

import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import type { AiesecRole } from '../types/auth-onboarding';
import type {
  HarassmentIncidentType,
  SafetyMeasureStatus,
  EncryptedDataEnvelope,
  HarassmentCaseRecord,
  DecryptedHarassmentDetails,
  VaultAccessCheckResult,
  VaultDualClockEvaluation,
} from '../types/harassment-vault';

// Standard fallback test key (32 bytes = 256 bits)
export const DEFAULT_VAULT_KEY_HEX = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

/**
 * REQ-080 & TEST-076: Committee-Only RBAC Gatekeeper.
 * High-confidentiality rule: Technical ADMIN is strictly blocked from accessing the Harassment Vault.
 */
export function checkVaultAccess(
  userRole: AiesecRole,
  userId: string,
  designatedCommitteeUserIds: string[] = []
): VaultAccessCheckResult {
  // CRITICAL STATUTORY INVARIANT: Admin is blocked
  if (userRole === 'ADMIN') {
    return {
      isAuthorized: false,
      error: 'Security Violation REQ-080 (TEST-076): Technical ADMIN role is strictly blocked from accessing Harassment Vault (Annex 1). Access denied.',
    };
  }

  // Only LCP, ECB_AUDIT or designated committee officers permitted
  if (userRole === 'LCP' || userRole === 'ECB_AUDIT' || designatedCommitteeUserIds.includes(userId)) {
    return {
      isAuthorized: true,
      officerRole: userRole,
    };
  }

  return {
    isAuthorized: false,
    error: `Access Denied REQ-080: Role ${userRole} is not authorized for Harassment Prevention Vault. Restricted to LCP, ECB and designated committee members.`,
  };
}

/**
 * AES-256-GCM Envelope Encryption for Sensitive Vault Narratives.
 */
export function encryptVaultData(
  plaintext: string,
  keyHex: string = DEFAULT_VAULT_KEY_HEX
): EncryptedDataEnvelope {
  const key = Buffer.from(keyHex, 'hex');
  const iv = randomBytes(12); // 12 bytes IV recommended for GCM

  const cipher = createCipheriv('aes-256-gcm', key, iv);
  let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
  ciphertext += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');

  return {
    ciphertext,
    iv: iv.toString('hex'),
    authTag,
    keyId: 'VAULT_KEY_2026_ANNEX1',
    algorithm: 'aes-256-gcm',
  };
}

/**
 * AES-256-GCM Envelope Decryption for Authorized Officers.
 */
export function decryptVaultData(
  envelope: EncryptedDataEnvelope,
  keyHex: string = DEFAULT_VAULT_KEY_HEX
): string {
  const key = Buffer.from(keyHex, 'hex');
  const iv = Buffer.from(envelope.iv, 'hex');
  const authTag = Buffer.from(envelope.authTag, 'hex');

  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(envelope.ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Creates and securely stores a new Harassment Case (Annex 1).
 */
export function createHarassmentCase(params: {
  lcId: string;
  incidentType: HarassmentIncidentType;
  victimName: string;
  accusedName: string;
  narrative: string;
  reportedBy: string;
  reportingOfficerUserId: string;
  reportingOfficerRole: AiesecRole;
  keyHex?: string;
  timestamp?: string;
}): { success: boolean; caseRecord?: HarassmentCaseRecord; error?: string } {
  // Validate caller authorization
  const accessCheck = checkVaultAccess(params.reportingOfficerRole, params.reportingOfficerUserId);
  if (!accessCheck.isAuthorized) {
    return {
      success: false,
      error: accessCheck.error,
    };
  }

  const now = params.timestamp || new Date().toISOString();
  const caseId = `hv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const caseNumber = `HV-${new Date(now).getFullYear()}-RABAT-${Math.floor(100 + Math.random() * 900)}`;

  // 7 days (168 hours) formal disposition deadline
  const dispositionMs = new Date(now).getTime() + 7 * 24 * 3600 * 1000;
  const formalDispositionDeadline = new Date(dispositionMs).toISOString();

  // Encrypt parties information
  const partiesPayload = JSON.stringify({
    victimName: params.victimName,
    accusedName: params.accusedName,
    reportedBy: params.reportedBy,
  });
  const encryptedParties = encryptVaultData(partiesPayload, params.keyHex);

  // Encrypt narrative
  const encryptedNarrative = encryptVaultData(params.narrative, params.keyHex);

  const caseRecord: HarassmentCaseRecord = {
    id: caseId,
    caseNumber,
    lcId: params.lcId,
    reportedAt: now,
    incidentType: params.incidentType,
    encryptedNarrative,
    encryptedParties,
    safetyMeasuresTaken: [],
    status: 'EMERGENCY_TRIAGE',
    formalDispositionDeadline,
    createdAt: now,
    updatedAt: now,
  };

  return {
    success: true,
    caseRecord,
  };
}

/**
 * Decrypts confidential harassment case details for authorized officers.
 */
export function readHarassmentCaseDetails(
  caseRecord: HarassmentCaseRecord,
  officerRole: AiesecRole,
  officerUserId: string,
  keyHex: string = DEFAULT_VAULT_KEY_HEX
): { success: boolean; details?: DecryptedHarassmentDetails; error?: string } {
  const accessCheck = checkVaultAccess(officerRole, officerUserId);
  if (!accessCheck.isAuthorized) {
    return {
      success: false,
      error: accessCheck.error,
    };
  }

  try {
    const partiesStr = decryptVaultData(caseRecord.encryptedParties, keyHex);
    const parties = JSON.parse(partiesStr);
    const narrative = decryptVaultData(caseRecord.encryptedNarrative, keyHex);

    return {
      success: true,
      details: {
        caseNumber: caseRecord.caseNumber,
        victimName: parties.victimName,
        accusedName: parties.accusedName,
        reportedBy: parties.reportedBy,
        narrative,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      error: `Decryption failed: ${err.message}`,
    };
  }
}

/**
 * REQ-084 & AUTO-030: Evaluates dual statutory escalation clocks:
 * 1. Immediate Safety Clock (24 hours).
 * 2. Formal Investigation Clock (7 days / 168 hours).
 */
export function evaluateVaultDualClocks(
  caseRecord: HarassmentCaseRecord,
  currentDate: Date = new Date()
): VaultDualClockEvaluation {
  const reportedMs = new Date(caseRecord.reportedAt).getTime();
  const currentMs = currentDate.getTime();
  const elapsedHours = Math.max(0, (currentMs - reportedMs) / (1000 * 3600));

  // 1. Safety Clock (24h)
  const safetyActionComplete = Boolean(caseRecord.safetyAction24hCompletedAt);
  let safetyClock24hRemainingHours = 0;
  let safetyClock24hBreached = false;

  if (!safetyActionComplete) {
    safetyClock24hRemainingHours = Math.max(0, Number((24 - elapsedHours).toFixed(1)));
    safetyClock24hBreached = elapsedHours > 24;
  }

  // 2. Formal Investigation Clock (7 days = 168 hours)
  const investigationComplete = caseRecord.status === 'CLOSED';
  let investigationClock7dRemainingHours = 0;
  let investigationClock7dBreached = false;

  if (!investigationComplete) {
    investigationClock7dRemainingHours = Math.max(0, Number((168 - elapsedHours).toFixed(1)));
    investigationClock7dBreached = elapsedHours > 168;
  }

  return {
    caseId: caseRecord.id,
    reportedAt: caseRecord.reportedAt,
    safetyClock24hRemainingHours,
    safetyClock24hBreached,
    safetyActionComplete,
    investigationClock7dRemainingHours,
    investigationClock7dBreached,
    investigationComplete,
  };
}

/**
 * Records immediate 24h safety measures and halts the emergency safety clock.
 */
export function recordEmergencySafetyMeasures(
  caseRecord: HarassmentCaseRecord,
  measures: SafetyMeasureStatus[],
  officerRole: AiesecRole,
  officerUserId: string,
  timestamp?: string
): HarassmentCaseRecord {
  const accessCheck = checkVaultAccess(officerRole, officerUserId);
  if (!accessCheck.isAuthorized) {
    throw new Error(accessCheck.error);
  }

  const now = timestamp || new Date().toISOString();

  return {
    ...caseRecord,
    safetyAction24hCompletedAt: now,
    safetyMeasuresTaken: Array.from(new Set([...caseRecord.safetyMeasuresTaken, ...measures])),
    status: 'COMMITTEE_INVESTIGATION',
    updatedAt: now,
  };
}

/**
 * Concludes the harassment investigation with formal disposition summary.
 */
export function closeHarassmentInvestigation(
  caseRecord: HarassmentCaseRecord,
  dispositionSummary: string,
  officerRole: AiesecRole,
  officerUserId: string,
  timestamp?: string
): HarassmentCaseRecord {
  const accessCheck = checkVaultAccess(officerRole, officerUserId);
  if (!accessCheck.isAuthorized) {
    throw new Error(accessCheck.error);
  }

  const now = timestamp || new Date().toISOString();

  return {
    ...caseRecord,
    status: 'CLOSED',
    resolvedAt: now,
    dispositionSummary,
    updatedAt: now,
  };
}
