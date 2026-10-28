import { describe, it, expect } from 'vitest';
import {
  evaluateGateG9Readiness,
  signGateG9Certification,
  verifyCertificateIntegrity,
  computeSha256,
} from '../src/lib/national/national-gate-engine';

describe('Phase 7 Plan 02: Release Gate G9 National Readiness Review & Quadruple Scale Sign-Off', () => {
  const perfectAuditInput = {
    crossLcDataLeaksCount: 0,
    hashChainContinuityVerified: true,
    rpoHours: 0.5,
    rtoHours: 1.5,
    adminLockedOutOfHarassmentVault: true,
    dualControlDisbursementsEnforced: true,
    openDataPortabilityVerified: true,
    testSuitesPassedPercent: 100,
  };

  // Test 1: Gate G9 Criteria Evaluation
  describe('Gate G9 Criteria Evaluation', () => {
    it('passes all 7 mandatory criteria and sets status to AWAITING_SIGNATURES', () => {
      const cert = evaluateGateG9Readiness(perfectAuditInput, '2025/2026');
      expect(cert.criteria.length).toBe(7);
      expect(cert.criteria.every((c) => c.isPassed)).toBe(true);
      expect(cert.status).toBe('AWAITING_SIGNATURES');
      expect(cert.isFullySigned).toBe(false);
      expect(cert.masterChecksumSha256).toBeDefined();
    });

    it('flags AUDIT_IN_PROGRESS if any criterion fails', () => {
      // 1. Cross-LC data leaks > 0
      const leakingCert = evaluateGateG9Readiness({
        ...perfectAuditInput,
        crossLcDataLeaksCount: 2,
      });
      expect(leakingCert.status).toBe('AUDIT_IN_PROGRESS');
      const rlsCrit = leakingCert.criteria.find((c) => c.key === 'RLS_TENANT_ISOLATION');
      expect(rlsCrit?.isPassed).toBe(false);

      // 2. Disaster recovery RPO exceeds 24h
      const slowDrCert = evaluateGateG9Readiness({
        ...perfectAuditInput,
        rpoHours: 36, // > 24h
      });
      expect(slowDrCert.status).toBe('AUDIT_IN_PROGRESS');
      const drCrit = slowDrCert.criteria.find((c) => c.key === 'DISASTER_RECOVERY');
      expect(drCrit?.isPassed).toBe(false);

      // 3. Automated test suite pass rate below 100%
      const failedTestCert = evaluateGateG9Readiness({
        ...perfectAuditInput,
        testSuitesPassedPercent: 98,
      });
      expect(failedTestCert.status).toBe('AUDIT_IN_PROGRESS');
    });
  });

  // Test 2: Quadruple National Executive Sign-Off Workflow
  describe('Quadruple National Executive Sign-Off Workflow', () => {
    it('requires @aiesec.net email domain for all signatories', () => {
      const cert = evaluateGateG9Readiness(perfectAuditInput);
      const invalidSign = signGateG9Certification(cert, {
        userId: 'usr_mcp',
        fullName: 'Anas Berrada',
        role: 'MCP',
        email: 'anas.berrada@gmail.com', // Not @aiesec.net
      });

      expect(invalidSign.success).toBe(false);
      expect(invalidSign.error).toContain('must belong to @aiesec.net domain');
    });

    it('strictly forbids signing if audit criteria are unfulfilled', () => {
      const failingCert = evaluateGateG9Readiness({
        ...perfectAuditInput,
        crossLcDataLeaksCount: 1,
      });

      const attemptSign = signGateG9Certification(failingCert, {
        userId: 'usr_mcp',
        fullName: 'Anas Berrada',
        role: 'MCP',
        email: 'anas.berrada@aiesec.net',
      });

      expect(attemptSign.success).toBe(false);
      expect(attemptSign.error).toContain('mandatory criteria are unfulfilled');
    });

    it('collects all 4 national signatures and transitions to OFFICIALLY_CERTIFIED with tamper-evident seal', () => {
      let cert = evaluateGateG9Readiness(perfectAuditInput, '2025/2026');

      // 1. Sign as MCP Morocco
      const signMcp = signGateG9Certification(cert, {
        userId: 'usr_mcp_01',
        fullName: 'Anas Berrada',
        role: 'MCP',
        email: 'anas.berrada@aiesec.net',
      });
      expect(signMcp.success).toBe(true);
      cert = signMcp.certificate!;
      expect(cert.signers.mcp).toBeDefined();
      expect(cert.isFullySigned).toBe(false);

      // 2. Sign as MCVP iCX
      const signIcx = signGateG9Certification(cert, {
        userId: 'usr_mcvp_icx_01',
        fullName: 'Hiba Kabbaj',
        role: 'MCVP_ICX',
        email: 'hiba.kabbaj@aiesec.net',
      });
      expect(signIcx.success).toBe(true);
      cert = signIcx.certificate!;
      expect(cert.signers.mcvpIcx).toBeDefined();
      expect(cert.isFullySigned).toBe(false);

      // 3. Sign as MCVP FnL
      const signFnL = signGateG9Certification(cert, {
        userId: 'usr_mcvp_fnl_01',
        fullName: 'Mehdi Chraibi',
        role: 'MCVP_FNL',
        email: 'mehdi.chraibi@aiesec.net',
      });
      expect(signFnL.success).toBe(true);
      cert = signFnL.certificate!;
      expect(cert.signers.mcvpFnL).toBeDefined();
      expect(cert.isFullySigned).toBe(false);

      // 4. Sign as ECB Chair
      const signEcb = signGateG9Certification(cert, {
        userId: 'usr_ecb_chair_01',
        fullName: 'Zineb El Fassi',
        role: 'ECB_CHAIR',
        email: 'zineb.elfassi@aiesec.net',
      });
      expect(signEcb.success).toBe(true);
      cert = signEcb.certificate!;
      expect(cert.signers.ecbChair).toBeDefined();

      // Certificate is now FULLY SIGNED and OFFICIALLY CERTIFIED
      expect(cert.isFullySigned).toBe(true);
      expect(cert.status).toBe('OFFICIALLY_CERTIFIED');
      expect(cert.certifiedAt).toBeDefined();

      // Verify cryptographic seal and integrity
      expect(verifyCertificateIntegrity(cert)).toBe(true);

      // Verify tamper detection
      const tamperedCert = {
        ...cert,
        termCode: '2026/2027', // Unauthorized alteration
      };
      expect(verifyCertificateIntegrity(tamperedCert)).toBe(false);
    });
  });
});
