/**
 * Phase 17 Test Suite: AFPM Finance Controls, Unified Task Engine & Master KPI Dictionary
 * Statutory References: HUB-FIN-01, HUB-FIN-02, HUB-TASK-01, HUB-TASK-02, HUB-KPI-00, HUB-KPI-01
 */

import { describe, it, expect } from 'vitest';
import {
  evaluateInvoiceAging,
  calculateIgvCostCoverage,
} from '../src/lib/finance/finance-aging-engine';
import {
  formatCasablancaDate,
  isTaskOverdue,
  createIdempotentTask,
  INITIAL_UNIFIED_TASKS,
  type UnifiedTask,
} from '../src/lib/tasks/unified-task-engine';
import {
  MASTER_KPI_DICTIONARY,
} from '../src/lib/kpi/kpi-dictionary';
import {
  INITIAL_INVOICES,
  transitionPayoutStatus,
  type PayoutRequest,
} from '../src/lib/finance/finance-types';

describe('Phase 17: AFPM Finance Controls, Unified Task Engine & Master KPI Dictionary', () => {
  // =========================================================================
  // 1. Plan 17-01: AFPM Finance Aging, Overdue Penalty & Realization Freeze
  // =========================================================================
  describe('Plan 17-01: AFPM Finance Aging & Invoices Ledger', () => {
    const fixedNow = new Date('2026-10-29T12:00:00Z');

    it('classifies unexpired invoice as CURRENT with 0 penalty', () => {
      const currentInvoice = {
        id: 'inv_01',
        invoice_number: 'INV-2026-088',
        partner_organization_name: 'BMCE Bank Foundation',
        deal_title: 'Q4 CSR Trainee Grant Tranche 1',
        amount_mad: 25000,
        issued_date: '2026-10-15',
        due_date: '2026-11-15', // Due in 17 days
        status: 'ISSUED' as const,
      };

      const result = evaluateInvoiceAging(currentInvoice, fixedNow);
      expect(result.agingCategory).toBe('CURRENT');
      expect(result.isOverdue14Days).toBe(false);
      expect(result.statutoryPenaltyMad).toBe(0);
      expect(result.isRealizationFrozen).toBe(false);
    });

    it('classifies invoice >14 days past due with 5% statutory penalty and realization freeze flag', () => {
      // Due 2026-10-01, tested on 2026-10-29 (28 days overdue > 14 days)
      const overdueInvoice = {
        id: 'inv_02',
        invoice_number: 'INV-2026-071',
        partner_organization_name: 'Rabat American School',
        deal_title: 'Fall STEM Teaching Assistants Realization Fee',
        amount_mad: 36000,
        issued_date: '2026-09-01',
        due_date: '2026-10-01',
        status: 'ISSUED' as const,
      };

      const result = evaluateInvoiceAging(overdueInvoice, fixedNow);
      expect(result.agingCategory).toBe('OVERDUE_OVER_14D');
      expect(result.isOverdue14Days).toBe(true);
      expect(result.daysOverdue).toBe(28);
      expect(result.statutoryPenaltyMad).toBe(1800); // 5% of 36,000 = 1,800 MAD
      expect(result.isRealizationFrozen).toBe(true); // Statutory freeze per APIP 3.2.5
    });

    it('calculates iGV Cost Coverage Ratio against direct delivery costs', () => {
      const coverage = calculateIgvCostCoverage({
        confirmedSponsorshipInflowsMad: 25000,
        totalDirectDeliveryCostsMad: 22000,
      });

      expect(coverage.coverageRatioPercentage).toBe(114); // > 100%
      expect(coverage.status).toBe('OPTIMAL');
      expect(coverage.netPositionMad).toBe(3000);
    });

    it('enforces SM-08 dual approval protocol on payout requests', () => {
      const request: PayoutRequest = {
        id: 'pay_test',
        title: 'Emergency Relocation Housing',
        category: 'EP_ACCOMMODATION',
        amount_mad: 2000,
        submitted_by_id: 'usr_01',
        submitted_by_name: 'Amina Benali',
        beneficiary: 'Host Family Dar Zellige',
        proof_receipt_url: 'https://drive.google.com/receipt',
        status: 'SUBMITTED',
        created_at: '2026-10-29T10:00:00Z',
      };

      // Member cannot execute Level-1
      const failL1 = transitionPayoutStatus(request, 'APPROVE_VP_FNL', 'MEMBER');
      expect(failL1.success).toBe(false);

      // VP Finance executes Level-1
      const okL1 = transitionPayoutStatus(request, 'APPROVE_VP_FNL', 'VP_FNL');
      expect(okL1.success).toBe(true);
      expect(request.status).toBe('APPROVED_VP_FNL');

      // VP Finance cannot execute Level-2 (LCP only)
      const failL2 = transitionPayoutStatus(request, 'APPROVE_LCP', 'VP_FNL');
      expect(failL2.success).toBe(false);

      // LCP executes Level-2 counter-signature
      const okL2 = transitionPayoutStatus(request, 'APPROVE_LCP', 'LCP');
      expect(okL2.success).toBe(true);
      expect(request.status).toBe('RELEASED');
    });
  });

  // =========================================================================
  // 2. Plan 17-02: Cross-Module Unified Task Engine & Idempotency
  // =========================================================================
  describe('Plan 17-02: Unified Task Engine & Africa/Casablanca Idempotency', () => {
    it('formats date strings accurately in Africa/Casablanca timezone', () => {
      // 2026-10-30T10:00:00Z is 11:00 in Africa/Casablanca (+01:00)
      const formatted = formatCasablancaDate('2026-10-30T10:00:00Z');
      expect(formatted).toContain('30 Oct 2026');
      expect(formatted).toContain('11:00');
    });

    it('prevents duplicate task generation via idempotency keys', () => {
      const existingList: UnifiedTask[] = [...INITIAL_UNIFIED_TASKS];
      const initialCount = existingList.length;

      // Attempt to re-generate task for inv_002 with identical actionKey
      const duplicateResult = createIdempotentTask(
        {
          sourceType: 'FINANCE_INVOICE',
          actionKey: 'OVERDUE_FREEZE',
          title: 'Duplicate invoice freeze task',
          relatedRecordType: 'INVOICE',
          relatedRecordId: 'inv_002',
          relatedRecordTitle: 'Invoice INV-2026-071',
          department: 'FNL',
          assignedRole: 'VP Finance',
          assignedMemberName: 'Salma Tazi',
        },
        existingList
      );

      expect(duplicateResult.isNew).toBe(false);
      expect(duplicateResult.task.id).toBe('task_001');

      // Create distinct task for another invoice
      const newResult = createIdempotentTask(
        {
          sourceType: 'FINANCE_INVOICE',
          actionKey: 'DISPATCH_RECEIPT',
          title: 'Dispatch Receipt for BMCE',
          relatedRecordType: 'INVOICE',
          relatedRecordId: 'inv_001',
          relatedRecordTitle: 'Invoice INV-2026-088',
          department: 'FNL',
          assignedRole: 'VP Finance',
          assignedMemberName: 'Salma Tazi',
        },
        existingList
      );

      expect(newResult.isNew).toBe(true);
      expect(newResult.task.idempotencyKey).toBe('FINANCE_INVOICE_inv_001_DISPATCH_RECEIPT');
    });
  });

  // =========================================================================
  // 3. Plan 17-03: Master KPI Dictionary & 100% Drill-Down
  // =========================================================================
  describe('Plan 17-03: Master KPI Dictionary Non-Fictional Specifications', () => {
    it('contains comprehensive metrics covering all 8 operational areas', () => {
      expect(MASTER_KPI_DICTIONARY.length).toBeGreaterThanOrEqual(10);

      const categories = new Set(MASTER_KPI_DICTIONARY.map((k) => k.category));
      expect(categories.has('SALES')).toBe(true);
      expect(categories.has('OPPORTUNITY_SUPPLY')).toBe(true);
      expect(categories.has('IR_SUPPLY')).toBe(true);
      expect(categories.has('EP_FUNNEL')).toBe(true);
      expect(categories.has('EXPERIENCE_QUALITY')).toBe(true);
      expect(categories.has('LOGISTICS_SAFETY')).toBe(true);
      expect(categories.has('FINANCE')).toBe(true);
      expect(categories.has('TEAM_EXECUTION')).toBe(true);
    });

    it('guarantees transparent formulas, sources, grain, and drill-down links for every KPI', () => {
      for (const kpi of MASTER_KPI_DICTIONARY) {
        expect(kpi.kpiId).toBeTruthy();
        expect(kpi.officialFormula).toBeTruthy();
        expect(kpi.sourceTables.length).toBeGreaterThan(0);
        expect(kpi.grain).toBeTruthy();
        expect(kpi.exclusions).toBeTruthy();
        expect(kpi.freshnessSla).toBeTruthy();
        expect(kpi.drillDownUrl.startsWith('/')).toBe(true);
        expect(['VERIFIED_OFFICIAL', 'CONFIRMED_LOCAL']).toContain(kpi.confidenceStatus);
      }
    });
  });
});
