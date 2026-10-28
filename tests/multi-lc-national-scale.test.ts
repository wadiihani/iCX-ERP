import { describe, it, expect } from 'vitest';
import {
  evaluateTenantAccess,
  aggregateNationalMetrics,
  auditTenantPartitionLeakage,
  isNationalRole,
  MOROCCAN_LCS_CATALOG,
} from '../src/lib/national/national-scale-engine';
import type {
  MoroccanLC,
  TenantRequestContext,
  LCOperationalMetric,
} from '../src/lib/types/national-scale';

describe('Phase 7 Plan 01: Multi-LC National Scale & Tenant Partition Isolation (INV-04)', () => {
  // Test 1: Moroccan LC Network Catalog
  it('catalogs all 6 Moroccan Local Committees with official codes and cities', () => {
    expect(MOROCCAN_LCS_CATALOG.length).toBe(6);
    const lcIds = MOROCCAN_LCS_CATALOG.map((lc) => lc.lcId);
    expect(lcIds).toContain('LC_RABAT');
    expect(lcIds).toContain('LC_CASABLANCA');
    expect(lcIds).toContain('LC_MARRAKECH');
    expect(lcIds).toContain('LC_FES');
    expect(lcIds).toContain('LC_TANGIER');
    expect(lcIds).toContain('LC_AGADIR');
  });

  // Test 2: Invariant INV-04: Row-Level Security Tenant Isolation
  describe('RLS Tenant Isolation (INV-04, TEST-108)', () => {
    const rabatOfficer: TenantRequestContext = {
      userId: 'usr_rabat_vp',
      userRole: 'LCVP_ICX',
      homeLcId: 'LC_RABAT',
      isNationalOfficer: false,
    };

    it('permits local officer to read and write records within their home LC', () => {
      const readAccess = evaluateTenantAccess(rabatOfficer, 'LC_RABAT', 'READ');
      expect(readAccess.isAuthorized).toBe(true);

      const writeAccess = evaluateTenantAccess(rabatOfficer, 'LC_RABAT', 'WRITE');
      expect(writeAccess.isAuthorized).toBe(true);
    });

    it('STRICTLY BLOCKS local officer from accessing records of a different LC (INV-04, TEST-108)', () => {
      const foreignAccess = evaluateTenantAccess(rabatOfficer, 'LC_CASABLANCA', 'READ');
      expect(foreignAccess.isAuthorized).toBe(false);
      expect(foreignAccess.error).toContain('Security Violation INV-04 (TEST-108)');
      expect(foreignAccess.error).toContain('Cross-tenant access strictly denied');

      const foreignWrite = evaluateTenantAccess(rabatOfficer, 'LC_MARRAKECH', 'WRITE');
      expect(foreignWrite.isAuthorized).toBe(false);
    });

    it('permits national officers (MCP, MCVP, ECB) read-only visibility across all Moroccan LCs', () => {
      const mcpContext: TenantRequestContext = {
        userId: 'usr_mcp_national',
        userRole: 'MCP',
        homeLcId: 'MC_MOROCCO',
        isNationalOfficer: true,
      };

      expect(isNationalRole('MCP')).toBe(true);
      expect(isNationalRole('MCVP_ICX')).toBe(true);
      expect(isNationalRole('ECB_AUDIT')).toBe(true);
      expect(isNationalRole('LCVP_ICX')).toBe(false);

      // National officer can read any LC
      expect(evaluateTenantAccess(mcpContext, 'LC_RABAT', 'READ').isAuthorized).toBe(true);
      expect(evaluateTenantAccess(mcpContext, 'LC_CASABLANCA', 'READ').isAuthorized).toBe(true);
      expect(evaluateTenantAccess(mcpContext, 'LC_AGADIR', 'READ').isAuthorized).toBe(true);
    });
  });

  // Test 3: National Metrics Aggregation
  describe('National Metrics Aggregation & Performance Health Ranking', () => {
    const mockLcMetrics: LCOperationalMetric[] = [
      { lcId: 'LC_RABAT', lcName: 'AIESEC in Rabat', totalApproved: 50, totalRealized: 45, totalCompleted: 42, standardsDeliveryRate: 0.95, activeQualityCases: 0, sustainabilityRatio: 1.50, healthStatus: 'EXCELLENT' },
      { lcId: 'LC_CASABLANCA', lcName: 'AIESEC in Casablanca', totalApproved: 60, totalRealized: 55, totalCompleted: 50, standardsDeliveryRate: 0.92, activeQualityCases: 0, sustainabilityRatio: 1.40, healthStatus: 'EXCELLENT' },
      { lcId: 'LC_AGADIR', lcName: 'AIESEC in Agadir', totalApproved: 15, totalRealized: 10, totalCompleted: 8, standardsDeliveryRate: 0.75, activeQualityCases: 3, sustainabilityRatio: 0.90, healthStatus: 'NEEDS_ATTENTION' },
    ];

    it('accurately rolls up national totals and weighted standards', () => {
      const dashboard = aggregateNationalMetrics('2025/2026', mockLcMetrics);

      // Total realizations = 45 + 55 + 10 = 110
      expect(dashboard.totalNationalRealizations).toBe(110);
      // Total completions = 42 + 50 + 8 = 100
      expect(dashboard.totalNationalCompletions).toBe(100);
      // Multi-LC feature flag active
      expect(dashboard.multiLcFeatureFlag).toBe(true);
      // Sustainability ratio > 1.0
      expect(dashboard.nationalExchangeSustainabilityRatio).toBeGreaterThan(1.0);
      // Average standards delivery rate
      expect(dashboard.averageStandardsDeliveryRate).toBeGreaterThan(0.85);

      // Agadir classified as NEEDS_ATTENTION due to low standards and deficit ratio
      const agadir = dashboard.lcBreakdown.find((lc) => lc.lcId === 'LC_AGADIR');
      expect(agadir?.healthStatus).toBe('NEEDS_ATTENTION');
    });
  });

  // Test 4: Partition Leakage Auditor (TEST-108)
  describe('Partition Leakage Auditor (TEST-108)', () => {
    it('verifies 0 cross-tenant leaks in clean partition', () => {
      const cleanPartition = [
        { id: 'ep_rabat_1', lcId: 'LC_RABAT' as MoroccanLC },
        { id: 'ep_rabat_2', lcId: 'LC_RABAT' as MoroccanLC },
        { id: 'ep_rabat_3', lcId: 'LC_RABAT' as MoroccanLC },
      ];

      const auditResult = auditTenantPartitionLeakage(cleanPartition, 'LC_RABAT');
      expect(auditResult.verified).toBe(true);
      expect(auditResult.leaksDetected).toBe(0);
      expect(auditResult.invalidRecordIds.length).toBe(0);
      expect(auditResult.message).toContain('0 cross-tenant data leaks detected');
    });

    it('detects and alerts on cross-tenant records leaking across partitions', () => {
      const contaminatedPartition = [
        { id: 'ep_rabat_1', lcId: 'LC_RABAT' as MoroccanLC },
        { id: 'ep_casa_leaked', lcId: 'LC_CASABLANCA' as MoroccanLC }, // Leaked!
      ];

      const auditResult = auditTenantPartitionLeakage(contaminatedPartition, 'LC_RABAT');
      expect(auditResult.verified).toBe(false);
      expect(auditResult.leaksDetected).toBe(1);
      expect(auditResult.invalidRecordIds).toContain('ep_casa_leaked');
      expect(auditResult.message).toContain('CRITICAL INTEGRITY FAILURE INV-04 (TEST-108)');
    });
  });
});
