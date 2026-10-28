/**
 * Pilot Operational Monitoring, Daily Reconciliation & Gate G7/G8 Test Suite
 * Statutory References: Section 5.2 (Pilot Exit Criteria), Section 12 (Release Gates G7/G8), REQ-106..108, TEST-107..108, INV-04
 * Jurisdiction: AIESEC in Rabat (LC Rabat, MC Morocco)
 */

import { describe, it, expect } from 'vitest';
import {
  runDailyReconciliationAudit,
  auditTenantIsolation,
  evaluateGateG7Health,
  evaluateGateG8PilotExit,
} from '../src/lib/pilot/pilot-monitoring-engine';
import type { PilotExitSignoff } from '../src/lib/types/pilot-monitoring';

describe('Plan 04-03: Pilot Operational Monitoring & Gate G7/G8 Suite', () => {
  describe('REQ-106 & TEST-107: Daily Reconciliation Audit Engine', () => {
    it('verifies clean reconciliation when local and EXPA records perfectly match', () => {
      const localRecords = [
        { id: 'app_001', entityType: 'EP_APPLICATION' as const, status: 'APPROVED', updatedAt: '2026-03-01T10:00:00Z' },
        { id: 'app_002', entityType: 'EP_APPLICATION' as const, status: 'REALIZED', updatedAt: '2026-03-02T11:00:00Z' },
        { id: 'opp_001', entityType: 'OPPORTUNITY' as const, status: 'OPEN', updatedAt: '2026-03-01T09:00:00Z' },
      ];

      const expaRecords = [
        { id: 'app_001', status: 'APPROVED', updatedAt: '2026-03-01T10:00:00Z' },
        { id: 'app_002', status: 'REALIZED', updatedAt: '2026-03-02T11:00:00Z' },
        { id: 'opp_001', status: 'OPEN', updatedAt: '2026-03-01T09:00:00Z' },
      ];

      const audit = runDailyReconciliationAudit('lc_rabat', localRecords, expaRecords);
      expect(audit.isClean).toBe(true);
      expect(audit.discrepanciesCount).toBe(0);
      expect(audit.matchedCount).toBe(3);
    });

    it('detects and flags status drift between local DB and EXPA read-sync', () => {
      const localRecords = [
        { id: 'app_001', entityType: 'EP_APPLICATION' as const, status: 'ACCEPTED', updatedAt: '2026-03-01T10:00:00Z' },
        { id: 'app_002', entityType: 'EP_APPLICATION' as const, status: 'APPROVED', updatedAt: '2026-03-02T11:00:00Z' },
      ];

      // EXPA has transitioned app_001 to APPROVED remotely
      const expaRecords = [
        { id: 'app_001', status: 'APPROVED', updatedAt: '2026-03-01T12:00:00Z' },
        { id: 'app_002', status: 'APPROVED', updatedAt: '2026-03-02T11:00:00Z' },
      ];

      const audit = runDailyReconciliationAudit('lc_rabat', localRecords, expaRecords);
      expect(audit.isClean).toBe(false);
      expect(audit.discrepanciesCount).toBe(1);
      expect(audit.discrepancies[0].entityId).toBe('app_001');
      expect(audit.discrepancies[0].field).toBe('STATUS');
      expect(audit.discrepancies[0].localValue).toBe('ACCEPTED');
      expect(audit.discrepancies[0].expaValue).toBe('APPROVED');
    });

    it('detects unmapped local records missing in EXPA snapshot', () => {
      const localRecords = [
        { id: 'app_ghost', entityType: 'EP_APPLICATION' as const, status: 'APPLIED', updatedAt: '2026-03-01T10:00:00Z' },
      ];
      const expaRecords: any[] = [];

      const audit = runDailyReconciliationAudit('lc_rabat', localRecords, expaRecords);
      expect(audit.isClean).toBe(false);
      expect(audit.discrepancies[0].field).toBe('RECORD_PRESENCE');
    });
  });

  describe('INV-04, REQ-107 & TEST-108: Multi-Tenant Partition Isolation Audit', () => {
    it('confirms 100% tenant isolation when all queried records belong to primary LC', () => {
      const records = [
        { id: 'rec_01', lcId: 'lc_rabat' },
        { id: 'rec_02', lcId: 'lc_rabat' },
        { id: 'rec_03', lcId: 'lc_rabat' },
      ];

      const result = auditTenantIsolation('lc_rabat', records);
      expect(result.isIsolated).toBe(true);
      expect(result.leakCount).toBe(0);
      expect(result.leaks).toEqual([]);
    });

    it('flags statutory violation when cross-LC record leaks into LC Rabat partition', () => {
      const records = [
        { id: 'rec_01', lcId: 'lc_rabat' },
        { id: 'rec_leak_casa', lcId: 'lc_casablanca' }, // LEAK!
      ];

      const result = auditTenantIsolation('lc_rabat', records);
      expect(result.isIsolated).toBe(false);
      expect(result.leakCount).toBe(1);
      expect(result.leaks[0].recordId).toBe('rec_leak_casa');
      expect(result.leaks[0].violationType).toContain('INV-04 Breach');
    });
  });

  describe('Release Gate G7: Mid-Term Operational Health Audit', () => {
    it('passes Gate G7 when all operational thresholds are met', () => {
      const health = evaluateGateG7Health({
        lcId: 'lc_rabat',
        uptimePercent: 99.8,
        contactDurationsHours: [4, 6, 12, 18, 22], // 100% <= 24h
        totalArrivalsCount: 3,
        clearedArrivalsCount: 3, // 100% cleared
        unresolvedDiscrepancies: 0,
        criticalDefects: 0,
      });

      expect(health.status).toBe('PASSED');
      expect(health.slaFirstContactPercent).toBe(100);
      expect(health.t14ReadinessClearancePercent).toBe(100);
      expect(health.recommendations[0]).toContain('compliant');
    });

    it('requires action if first-contact SLA falls below 95%', () => {
      const health = evaluateGateG7Health({
        lcId: 'lc_rabat',
        uptimePercent: 99.9,
        contactDurationsHours: [2, 48, 52, 70], // 25% <= 24h (breached)
        totalArrivalsCount: 2,
        clearedArrivalsCount: 2,
        unresolvedDiscrepancies: 0,
        criticalDefects: 0,
      });

      expect(health.status).toBe('ACTION_REQUIRED');
      expect(health.recommendations.some((r) => r.includes('First contact SLA compliance'))).toBe(true);
    });

    it('sets WARNING status if sync discrepancies exist', () => {
      const health = evaluateGateG7Health({
        lcId: 'lc_rabat',
        uptimePercent: 99.7,
        contactDurationsHours: [10, 12],
        totalArrivalsCount: 1,
        clearedArrivalsCount: 1,
        unresolvedDiscrepancies: 2,
        criticalDefects: 0,
      });

      expect(health.status).toBe('WARNING');
      expect(health.recommendations.some((r) => r.includes('unhandled sync discrepancies'))).toBe(true);
    });
  });

  describe('Release Gate G8: Formal Pilot Exit & Production Readiness (§5.2)', () => {
    const validSignoffs: PilotExitSignoff[] = [
      {
        role: 'LCVP_ICX',
        officerName: 'Youssef El Amrani',
        officerEmail: 'youssef.elamrani@aiesec.net',
        signedAt: '2026-03-15T10:00:00Z',
        statement: 'Operational pilot executed flawlessly with 3 successful EPs.',
      },
      {
        role: 'LCVP_FNL',
        officerName: 'Oumaima Chraibi',
        officerEmail: 'oumaima.chraibi@aiesec.net',
        signedAt: '2026-03-15T11:00:00Z',
        statement: 'AFPM exchange sustainability verified. Dual control enforced.',
      },
      {
        role: 'LCP',
        officerName: 'Salma Bennani',
        officerEmail: 'salma.bennani@aiesec.net',
        signedAt: '2026-03-15T12:00:00Z',
        statement: 'AIESEC in Rabat formally certifies Gate G8 Pilot Exit.',
      },
    ];

    it('approves Gate G8 and generates SHA-256 certificate when all 4 criteria and triple sign-off are met', () => {
      const cert = evaluateGateG8PilotExit({
        lcId: 'lc_rabat',
        cohort: 'SPRING_2026_PILOT',
        drRestoreSuccess: true,
        tenantIsolationClean: true,
        reconciliationClean: true,
        usabilityDefectFree: true,
        signoffs: validSignoffs,
      });

      expect(cert.status).toBe('APPROVED');
      expect(cert.certificateId).toContain('CERT_GATE_G8_lc_rabat');
      expect(cert.verificationHash).toHaveLength(64); // SHA-256 hex string
      expect(cert.criteria.drRestorePassed).toBe(true);
      expect(cert.criteria.tenantIsolationPassed).toBe(true);
      expect(cert.criteria.syncDiscrepanciesZero).toBe(true);
      expect(cert.criteria.usabilityJourneysPassed).toBe(true);
    });

    it('rejects Gate G8 approval if any statutory criterion failed', () => {
      const cert = evaluateGateG8PilotExit({
        lcId: 'lc_rabat',
        cohort: 'SPRING_2026_PILOT',
        drRestoreSuccess: false, // FAILED DR restore
        tenantIsolationClean: true,
        reconciliationClean: true,
        usabilityDefectFree: true,
        signoffs: validSignoffs,
      });

      expect(cert.status).toBe('INCOMPLETE');
    });

    it('rejects Gate G8 approval if triple executive sign-off is incomplete (missing LCVP FnL)', () => {
      const incompleteSignoffs = validSignoffs.filter((s) => s.role !== 'LCVP_FNL');

      const cert = evaluateGateG8PilotExit({
        lcId: 'lc_rabat',
        cohort: 'SPRING_2026_PILOT',
        drRestoreSuccess: true,
        tenantIsolationClean: true,
        reconciliationClean: true,
        usabilityDefectFree: true,
        signoffs: incompleteSignoffs,
      });

      expect(cert.status).toBe('INCOMPLETE');
    });
  });
});
