/**
 * Harassment Prevention Vault (Annex 1) Test Suite
 * Statutory References: AEPP Annex 1 (Harassment Policy), APIP, REQ-080, REQ-084, AUTO-030, TEST-076, Moroccan Law 09-08
 * Jurisdiction: AIESEC in Rabat (LC Rabat, MC Morocco)
 */

import { describe, it, expect } from 'vitest';
import {
  checkVaultAccess,
  encryptVaultData,
  decryptVaultData,
  createHarassmentCase,
  readHarassmentCaseDetails,
  evaluateVaultDualClocks,
  recordEmergencySafetyMeasures,
  closeHarassmentInvestigation,
} from '../src/lib/cases/harassment-vault-engine';

describe('Plan 05-03: Harassment Vault (Annex 1) & Dedicated Encryption Suite', () => {
  describe('REQ-080 & TEST-076: Committee-Only RBAC Gatekeeper', () => {
    it('STRICTLY BLOCKS technical ADMIN from accessing Harassment Vault', () => {
      const access = checkVaultAccess('ADMIN', 'usr_admin_01');
      expect(access.isAuthorized).toBe(false);
      expect(access.error).toContain('REQ-080');
      expect(access.error).toContain('strictly blocked');
    });

    it('blocks standard operational roles (BD, CXP, LCVP)', () => {
      expect(checkVaultAccess('MEMBER_BD', 'usr_bd').isAuthorized).toBe(false);
      expect(checkVaultAccess('MEMBER_CXP', 'usr_cxp').isAuthorized).toBe(false);
      expect(checkVaultAccess('LCVP_FNL', 'usr_fnl').isAuthorized).toBe(false);
      expect(checkVaultAccess('LCVP_ICX', 'usr_icx').isAuthorized).toBe(false);
    });

    it('permits authorized committee officers: LCP and ECB_AUDIT', () => {
      expect(checkVaultAccess('LCP', 'usr_lcp').isAuthorized).toBe(true);
      expect(checkVaultAccess('ECB_AUDIT', 'usr_ecb').isAuthorized).toBe(true);
    });

    it('permits designated committee members regardless of base role', () => {
      const access = checkVaultAccess('MM_INT', 'usr_designated_special', ['usr_designated_special']);
      expect(access.isAuthorized).toBe(true);
    });
  });

  describe('AES-256-GCM Envelope Encryption & Integrity', () => {
    it('encrypts sensitive narrative into tamper-evident ciphertext with IV and auth tag', () => {
      const plaintext = 'Sensitive testimony: EP reported inappropriate physical advances by host supervisor.';
      const envelope = encryptVaultData(plaintext);

      expect(envelope.algorithm).toBe('aes-256-gcm');
      expect(envelope.ciphertext).not.toContain('advances');
      expect(envelope.iv).toHaveLength(24); // 12 bytes = 24 hex chars
      expect(envelope.authTag).toHaveLength(32); // 16 bytes = 32 hex chars

      const decrypted = decryptVaultData(envelope);
      expect(decrypted).toBe(plaintext);
    });

    it('throws authentication error if ciphertext or auth tag is tampered with', () => {
      const envelope = encryptVaultData('Confidential content');
      // Tamper with first byte of ciphertext
      const tamperedCiphertext =
        envelope.ciphertext.startsWith('aa') ? 'bb' + envelope.ciphertext.slice(2) : 'aa' + envelope.ciphertext.slice(2);
      const tamperedEnvelope = { ...envelope, ciphertext: tamperedCiphertext };

      expect(() => decryptVaultData(tamperedEnvelope)).toThrow();
    });
  });

  describe('Case Creation & Decryption by Authorized Officers', () => {
    it('creates encrypted harassment case and prevents ADMIN from decrypting', () => {
      const createRes = createHarassmentCase({
        lcId: 'lc_rabat',
        incidentType: 'PHYSICAL_HARASSMENT',
        victimName: 'Elena Petrova',
        accusedName: 'Rachid B.',
        narrative: 'Supervisor attempted unwelcome physical contact during off-hours meeting.',
        reportedBy: 'Elena Petrova (Direct)',
        reportingOfficerUserId: 'usr_lcp_001',
        reportingOfficerRole: 'LCP',
        timestamp: '2026-03-01T10:00:00Z',
      });

      expect(createRes.success).toBe(true);
      const caseRecord = createRes.caseRecord!;
      expect(caseRecord.caseNumber).toContain('HV-2026-RABAT-');
      expect(caseRecord.status).toBe('EMERGENCY_TRIAGE');

      // Attempt decryption as ADMIN -> REJECTED
      const adminRead = readHarassmentCaseDetails(caseRecord, 'ADMIN', 'usr_admin');
      expect(adminRead.success).toBe(false);
      expect(adminRead.error).toContain('REQ-080');

      // Attempt decryption as LCP -> SUCCESS
      const lcpRead = readHarassmentCaseDetails(caseRecord, 'LCP', 'usr_lcp_001');
      expect(lcpRead.success).toBe(true);
      expect(lcpRead.details?.victimName).toBe('Elena Petrova');
      expect(lcpRead.details?.accusedName).toBe('Rachid B.');
      expect(lcpRead.details?.narrative).toContain('unwelcome physical contact');
    });
  });

  describe('REQ-084 & AUTO-030: Dual Statutory Escalation Clocks', () => {
    const reportedAt = '2026-03-01T10:00:00Z';

    it('tracks 24-hour emergency safety clock and detects breaches if unfulfilled', () => {
      const createRes = createHarassmentCase({
        lcId: 'lc_rabat',
        incidentType: 'SEXUAL_HARASSMENT',
        victimName: 'Anonymous EP',
        accusedName: 'Host Staff Member',
        narrative: 'Allegations of harassment at accommodation premises.',
        reportedBy: 'Buddy report',
        reportingOfficerUserId: 'usr_lcp_001',
        reportingOfficerRole: 'LCP',
        timestamp: reportedAt,
      });
      let qCase = createRes.caseRecord!;

      // 10 hours later: safety clock active with 14h remaining
      const check10h = evaluateVaultDualClocks(qCase, new Date('2026-03-01T20:00:00Z'));
      expect(check10h.safetyActionComplete).toBe(false);
      expect(check10h.safetyClock24hRemainingHours).toBe(14);
      expect(check10h.safetyClock24hBreached).toBe(false);

      // 26 hours later without action: safety clock breached!
      const check26h = evaluateVaultDualClocks(qCase, new Date('2026-03-02T12:00:00Z'));
      expect(check26h.safetyClock24hBreached).toBe(true);
      expect(check26h.safetyClock24hRemainingHours).toBe(0);

      // Record emergency safety action at T+12h
      qCase = recordEmergencySafetyMeasures(
        qCase,
        ['IMMEDIATE_PHYSICAL_SEPARATION', 'SAFE_HOUSING_REASSIGNED'],
        'LCP',
        'usr_lcp_001',
        '2026-03-01T22:00:00Z'
      );
      expect(qCase.status).toBe('COMMITTEE_INVESTIGATION');
      expect(qCase.safetyAction24hCompletedAt).toBeDefined();

      // Now evaluated at T+26h: safety action was completed, so no breach
      const checkAfterAction = evaluateVaultDualClocks(qCase, new Date('2026-03-02T12:00:00Z'));
      expect(checkAfterAction.safetyActionComplete).toBe(true);
      expect(checkAfterAction.safetyClock24hBreached).toBe(false);
    });

    it('tracks 7-day (168 hours) formal investigation disposition clock', () => {
      const createRes = createHarassmentCase({
        lcId: 'lc_rabat',
        incidentType: 'INTIMIDATION',
        victimName: 'Sofia Rossi',
        accusedName: 'Colleague',
        narrative: 'Repeated verbal intimidation.',
        reportedBy: 'Sofia Rossi',
        reportingOfficerUserId: 'usr_ecb_001',
        reportingOfficerRole: 'ECB_AUDIT',
        timestamp: reportedAt,
      });
      let qCase = createRes.caseRecord!;

      // 4 days (96 hours) later: 72h remain
      const check96h = evaluateVaultDualClocks(qCase, new Date('2026-03-05T10:00:00Z'));
      expect(check96h.investigationClock7dRemainingHours).toBe(72);
      expect(check96h.investigationClock7dBreached).toBe(false);

      // 8 days (192 hours) later without disposition: investigation clock breached!
      const check192h = evaluateVaultDualClocks(qCase, new Date('2026-03-09T10:00:00Z'));
      expect(check192h.investigationClock7dBreached).toBe(true);

      // Close investigation with formal disposition
      qCase = closeHarassmentInvestigation(
        qCase,
        'Accused dismissed from opportunity premises. Host company reassigned mentor.',
        'LCP',
        'usr_lcp_001',
        '2026-03-06T12:00:00Z'
      );
      expect(qCase.status).toBe('CLOSED');

      const checkClosed = evaluateVaultDualClocks(qCase, new Date('2026-03-09T10:00:00Z'));
      expect(checkClosed.investigationComplete).toBe(true);
      expect(checkClosed.investigationClock7dBreached).toBe(false);
    });
  });
});
