/**
 * AFPM Operational Finance, Invoices & Sustainability Test Suite
 * Statutory References: AFPM, Section 7.2 (SM-08), Moroccan Tax Code (CGI), REQ-086..090, INV-06, TEST-078..082
 * Jurisdiction: AIESEC in Rabat (LC Rabat, MC Morocco)
 */

import { describe, it, expect } from 'vitest';
import {
  createPartnerInvoice,
  issueInvoice,
  recordInvoicePayment,
  evaluateInvoiceOverdue,
  requestDisbursement,
  firstApproveDisbursement,
  secondApproveDisbursement,
  calculateExchangeSustainabilityRatio,
} from '../src/lib/finance/finance-engine';
import type { OpportunityFinancialSlice } from '../src/lib/types/finance-afpm';

describe('Plan 05-04: AFPM Operational Finance & Sustainability Suite', () => {
  describe('REQ-086 & TEST-078: B2B Partner Invoice State Machine (SM-08)', () => {
    it('creates an invoice in DRAFT state with validated Moroccan 15-digit ICE', () => {
      const res = createPartnerInvoice({
        lcId: 'lc_rabat',
        partnerOrganizationId: 'org_inwi_01',
        partnerName: 'Inwi Telecom Maroc',
        partnerIce: '001523456000032', // Valid 15 digits
        partnerIf: '12345678',
        issueDate: '2026-03-01',
        dueDate: '2026-03-31',
        lineItems: [
          { description: 'iGV Project Partner Slot #1', quantity: 2, unitPriceMad: 3500, totalMad: 7000 },
        ],
        vatRatePercent: 0, // Youth educational NGO exemption
      });

      expect(res.success).toBe(true);
      const inv = res.invoice!;
      expect(inv.invoiceNumber).toContain('INV-2026-RABAT-');
      expect(inv.status).toBe('DRAFT');
      expect(inv.subtotalMad).toBe(7000);
      expect(inv.totalAmountMad).toBe(7000);
      expect(inv.paidAmountMad).toBe(0);
    });

    it('rejects invoice creation with invalid Moroccan ICE', () => {
      const res = createPartnerInvoice({
        lcId: 'lc_rabat',
        partnerOrganizationId: 'org_fake',
        partnerName: 'Invalid Org',
        partnerIce: '123', // Invalid length
        issueDate: '2026-03-01',
        dueDate: '2026-03-31',
        lineItems: [{ description: 'Test', quantity: 1, unitPriceMad: 1000, totalMad: 1000 }],
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain('Moroccan Tax Compliance Error');
    });

    it('transitions invoice through ISSUED, PARTIALLY_PAID, and PAID', () => {
      const { invoice } = createPartnerInvoice({
        lcId: 'lc_rabat',
        partnerOrganizationId: 'org_01',
        partnerName: 'Partner SARL',
        partnerIce: '001523456000032',
        issueDate: '2026-03-01',
        dueDate: '2026-03-31',
        lineItems: [{ description: 'iGV Slot', quantity: 1, unitPriceMad: 5000, totalMad: 5000 }],
      });

      let inv = issueInvoice(invoice!);
      expect(inv.status).toBe('ISSUED');

      inv = recordInvoicePayment(inv, 2000);
      expect(inv.status).toBe('PARTIALLY_PAID');
      expect(inv.paidAmountMad).toBe(2000);

      inv = recordInvoicePayment(inv, 3000);
      expect(inv.status).toBe('PAID');
      expect(inv.paidAmountMad).toBe(5000);
    });

    it('flags invoice as OVERDUE when current date exceeds due date', () => {
      const { invoice } = createPartnerInvoice({
        lcId: 'lc_rabat',
        partnerOrganizationId: 'org_01',
        partnerName: 'Partner SARL',
        partnerIce: '001523456000032',
        issueDate: '2026-03-01',
        dueDate: '2026-03-15',
        lineItems: [{ description: 'iGV Slot', quantity: 1, unitPriceMad: 5000, totalMad: 5000 }],
      });
      let inv = issueInvoice(invoice!);

      // Evaluated after due date
      const afterDueDate = new Date('2026-03-20');
      inv = evaluateInvoiceOverdue(inv, afterDueDate);
      expect(inv.status).toBe('OVERDUE');
    });
  });

  describe('INV-06, REQ-087, REQ-088 & TEST-079: Disbursement Ledger & Dual-Control Approvals', () => {
    it('enforces receipt documentation for disbursements exceeding 1,000 MAD', () => {
      const resWithoutReceipt = requestDisbursement({
        lcId: 'lc_rabat',
        category: 'HOUSING_RENT',
        amountMad: 3500, // > 1000 MAD
        beneficiaryName: 'Bennani Properties Agdal',
        purpose: 'Monthly lease for EP flat',
        requestedByUserId: 'usr_cxp_01',
      });

      expect(resWithoutReceipt.success).toBe(false);
      expect(resWithoutReceipt.error).toContain('Statutory AFPM Policy');

      const resWithReceipt = requestDisbursement({
        lcId: 'lc_rabat',
        category: 'HOUSING_RENT',
        amountMad: 3500,
        beneficiaryName: 'Bennani Properties Agdal',
        purpose: 'Monthly lease for EP flat',
        requestedByUserId: 'usr_cxp_01',
        receiptDocumentId: 'doc_receipt_lease_01',
      });

      expect(resWithReceipt.success).toBe(true);
      expect(resWithReceipt.disbursement?.status).toBe('REQUESTED');
    });

    it('STRICTLY PROHIBITS requester from approving their own disbursement (INV-06)', () => {
      const { disbursement } = requestDisbursement({
        lcId: 'lc_rabat',
        category: 'EVENT_LOGISTICS',
        amountMad: 800,
        beneficiaryName: 'Stationery Supplier Rabat',
        purpose: 'IPS Welcome Packs',
        requestedByUserId: 'usr_vp_fnl',
      });

      const selfApproval = firstApproveDisbursement(
        disbursement!,
        'usr_vp_fnl', // Requester attempts to approve!
        'LCVP_FNL'
      );

      expect(selfApproval.success).toBe(false);
      expect(selfApproval.error).toContain('INV-06');
    });

    it('enforces two distinct officers across first and second approval gates', () => {
      const { disbursement } = requestDisbursement({
        lcId: 'lc_rabat',
        category: 'HOUSING_RENT',
        amountMad: 3500,
        beneficiaryName: 'Bennani Properties Agdal',
        purpose: 'Monthly lease',
        requestedByUserId: 'usr_cxp_01',
        receiptDocumentId: 'doc_receipt_01',
      });

      // 1. First approval by LCVP FnL
      const firstRes = firstApproveDisbursement(
        disbursement!,
        'usr_lcvp_fnl',
        'LCVP_FNL'
      );
      expect(firstRes.success).toBe(true);
      expect(firstRes.disbursement?.status).toBe('FIRST_APPROVAL_GRANTED');

      // 2. First approver cannot also be second approver!
      const duplicateSecond = secondApproveDisbursement(
        firstRes.disbursement!,
        'usr_lcvp_fnl', // Same officer
        'LCP'
      );
      expect(duplicateSecond.success).toBe(false);
      expect(duplicateSecond.error).toContain('INV-06');

      // 3. Second approval by distinct LCP officer
      const secondRes = secondApproveDisbursement(
        firstRes.disbursement!,
        'usr_lcp_001',
        'LCP'
      );
      expect(secondRes.success).toBe(true);
      expect(secondRes.disbursement?.status).toBe('APPROVED_FOR_PAYMENT');
      expect(secondRes.disbursement?.secondApprovedByRole).toBe('LCP');
    });
  });

  describe('REQ-089 & TEST-080: AFPM Exchange Sustainability Ratio Dashboard', () => {
    it('calculates sustainable ratio (> 1.0) when direct revenue exceeds operational costs', () => {
      const mockOpportunities: OpportunityFinancialSlice[] = [
        {
          opportunityId: 'opp_01',
          opportunityTitle: 'Digital Innovator Rabat',
          realizedEpsCount: 4,
          revenueMad: 14000,
          directCostMad: 9000,
          netMarginMad: 5000,
          sustainabilityRatio: 1.56,
          isSustainable: true,
        },
        {
          opportunityId: 'opp_02',
          opportunityTitle: 'Clean Energy Rabat',
          realizedEpsCount: 2,
          revenueMad: 7000,
          directCostMad: 5000,
          netMarginMad: 2000,
          sustainabilityRatio: 1.40,
          isSustainable: true,
        },
      ];

      const report = calculateExchangeSustainabilityRatio(
        'lc_rabat',
        '2026-Q1',
        mockOpportunities
      );

      // Total Revenue = 21,000 MAD
      // Total Direct Costs = 14,000 MAD
      // Net Margin = 7,000 MAD
      // Sustainability Ratio = 21,000 / 14,000 = 1.50 (> 1.0)
      expect(report.totalRevenueMad).toBe(21000);
      expect(report.totalDirectCostsMad).toBe(14000);
      expect(report.netMarginMad).toBe(7000);
      expect(report.overallSustainabilityRatio).toBe(1.5);
      expect(report.isSustainable).toBe(true);
    });

    it('flags non-sustainable status when operational costs exceed revenue (ratio <= 1.0)', () => {
      const deficitOpportunities: OpportunityFinancialSlice[] = [
        {
          opportunityId: 'opp_deficit',
          opportunityTitle: 'Loss Making Project',
          realizedEpsCount: 1,
          revenueMad: 3000,
          directCostMad: 4500, // Cost > Revenue
          netMarginMad: -1500,
          sustainabilityRatio: 0.67,
          isSustainable: false,
        },
      ];

      const report = calculateExchangeSustainabilityRatio(
        'lc_rabat',
        '2026-Q1',
        deficitOpportunities
      );

      expect(report.overallSustainabilityRatio).toBe(0.67);
      expect(report.isSustainable).toBe(false);
      expect(report.netMarginMad).toBe(-1500);
    });
  });
});
