import { describe, it, expect } from 'vitest';
import { transitionDealStage, type DealRecord } from '../src/lib/sales/pipeline-machine';
import { validateDiscoveryAnswers } from '../src/lib/sales/discovery-questionnaire';
import { composeOutreachMessage, OUTREACH_TEMPLATES } from '../src/lib/sales/outreach-composer';
import { counterSignContractByLCP, type ContractRecord } from '../src/lib/sales/contract-machine';

describe('Plan 01-03: B2B Sales Pipeline & Contract Vault', () => {
  describe('SM-01: B2B Sales Pipeline State Machine (REQ-014, TEST-021)', () => {
    it('advances a deal progressively through valid stages', () => {
      const deal: DealRecord = {
        id: 'deal-001',
        lcId: 'lc_rabat_001',
        organizationId: 'org-101',
        stage: 'LEAD',
        dealValue: 15000,
        product: 'igv',
        assignedTo: 'user_sales_rabat',
        history: [],
      };

      // 1. Advance to CONTACTED
      const res1 = transitionDealStage(deal, 'CONTACTED', 'user_sales_rabat');
      expect(res1.success).toBe(true);
      expect(deal.stage).toBe('CONTACTED');

      // 2. Advance to MEETING_SCHEDULED
      const res2 = transitionDealStage(deal, 'MEETING_SCHEDULED', 'user_sales_rabat');
      expect(res2.success).toBe(true);
      expect(deal.stage).toBe('MEETING_SCHEDULED');

      // 3. Advance to DISCOVERY_COMPLETED
      const res3 = transitionDealStage(deal, 'DISCOVERY_COMPLETED', 'user_sales_rabat');
      expect(res3.success).toBe(true);
      expect(deal.stage).toBe('DISCOVERY_COMPLETED');
    });

    it('rejects an invalid skip-level transition (e.g. LEAD directly to NEGOTIATION)', () => {
      const deal: DealRecord = {
        id: 'deal-002',
        lcId: 'lc_rabat_001',
        organizationId: 'org-102',
        stage: 'LEAD',
        dealValue: 20000,
        product: 'igv',
        assignedTo: 'user_sales_rabat',
        history: [],
      };

      const res = transitionDealStage(deal, 'NEGOTIATION', 'user_sales_rabat');
      expect(res.success).toBe(false);
      expect(res.error).toContain('Invalid transition');
      expect(deal.stage).toBe('LEAD');
    });
  });

  describe('TEST-022: Discovery Questionnaire Gate Enforcement', () => {
    it('blocks transition to PROPOSAL_SENT if discovery answers are missing or incomplete', () => {
      const deal: DealRecord = {
        id: 'deal-003',
        lcId: 'lc_rabat_001',
        organizationId: 'org-103',
        stage: 'DISCOVERY_COMPLETED',
        dealValue: 12000,
        product: 'igv',
        assignedTo: 'user_sales_rabat',
        discoveryAnswers: null, // No answers provided
        history: [],
      };

      const res = transitionDealStage(deal, 'PROPOSAL_SENT', 'user_sales_rabat');
      expect(res.success).toBe(false);
      expect(res.error).toContain('Discovery Gate Block (TEST-022)');
      expect(deal.stage).toBe('DISCOVERY_COMPLETED');
    });

    it('blocks proposal if working hours or duration violates statutory limits', () => {
      const invalidDiscovery = validateDiscoveryAnswers({
        sdgGoal: 4,
        weeklyWorkingHours: 15, // Violation: minimum is 25h
        durationWeeks: 4, // Violation: minimum is 6 weeks
        hasSupervisorAssigned: true,
        supervisorName: 'Karim Tazi',
        accommodationConfirmed: true,
        fundingCommitmentPercentage: 80,
      });

      expect(invalidDiscovery.isComplete).toBe(false);
      expect(invalidDiscovery.statutoryViolations.length).toBe(2);
    });

    it('allows transition to PROPOSAL_SENT when statutory discovery is fully satisfied', () => {
      const deal: DealRecord = {
        id: 'deal-004',
        lcId: 'lc_rabat_001',
        organizationId: 'org-104',
        stage: 'DISCOVERY_COMPLETED',
        dealValue: 18000,
        product: 'igv',
        assignedTo: 'user_sales_rabat',
        discoveryAnswers: {
          sdgGoal: 4,
          weeklyWorkingHours: 30,
          durationWeeks: 6,
          hasSupervisorAssigned: true,
          supervisorName: 'Fatima Zohra',
          accommodationConfirmed: true,
          fundingCommitmentPercentage: 100,
          completedAt: '2026-10-26T14:00:00Z',
          completedBy: 'user_sales_rabat',
        },
        history: [],
      };

      const res = transitionDealStage(deal, 'PROPOSAL_SENT', 'user_sales_rabat');
      expect(res.success).toBe(true);
      expect(deal.stage).toBe('PROPOSAL_SENT');
    });
  });

  describe('TEST-023: Multi-Lingual Outreach Composer (FR/EN/AR)', () => {
    const context = {
      partnerName: 'Fondation Orient-Occident',
      contactName: 'Mme El Fassi',
      sdgTarget: 'ODD 4 (Éducation de Qualité)',
      city: 'Rabat',
      senderName: 'Mehdi Benjelloun',
      senderRole: 'Vice-Président Partenariats iGV',
      lcName: 'AIESEC à Rabat',
    };

    it('interpolates French template cleanly without missing tags', () => {
      const res = composeOutreachMessage('fr', context);
      expect(res.missingTags.length).toBe(0);
      expect(res.subject).toContain('Rabat');
      expect(res.subject).toContain('Fondation Orient-Occident');
      expect(res.body).toContain('Mehdi Benjelloun');
      expect(res.body).toContain('ODD 4');
    });

    it('interpolates English and Arabic templates cleanly', () => {
      const resEn = composeOutreachMessage('en', context);
      expect(resEn.missingTags.length).toBe(0);
      expect(resEn.body).toContain('Dear Mme El Fassi');

      const resAr = composeOutreachMessage('ar', context);
      expect(resAr.missingTags.length).toBe(0);
      expect(resAr.body).toContain('السلام عليكم');
      expect(resAr.body).toContain('Rabat');
    });

    it('identifies un-substituted tags if context field is missing', () => {
      const incompleteContext = { ...context, partnerName: '' };
      const res = composeOutreachMessage('fr', incompleteContext);
      expect(res.missingTags).toContain('partnerName');
    });
  });

  describe('TEST-024: Contract Vault SM-07 & Dual-Control Rule (INV-06)', () => {
    it('rejects LCP counter-signature if the LCP is the contract creator (INV-06)', () => {
      const contract: ContractRecord = {
        id: 'ctr-001',
        lcId: 'lc_rabat_001',
        organizationId: 'org-101',
        title: 'MoU iGV 2026 - Orient Occident',
        contractType: 'MOU_IGV',
        status: 'PARTNER_SIGNED',
        createdBy: 'user_lcp_samir', // Creator is Samir
        startDate: '2026-11-01',
        endDate: '2026-12-15',
        totalOpenings: 5,
        totalFeeAmount: 15000,
        currency: 'MAD',
        rowVersion: 1,
      };

      // Attempting to sign as user_lcp_samir must be rejected by dual-control rule
      const res = counterSignContractByLCP(contract, 'user_lcp_samir');
      expect(res.success).toBe(false);
      expect(res.error).toContain('Statutory Violation INV-06 (TEST-024)');
      expect(contract.status).toBe('PARTNER_SIGNED');
    });

    it('approves counter-signature and activates contract when signed by independent officer', () => {
      const contract: ContractRecord = {
        id: 'ctr-002',
        lcId: 'lc_rabat_001',
        organizationId: 'org-101',
        title: 'MoU iGV 2026 - Orient Occident',
        contractType: 'MOU_IGV',
        status: 'PARTNER_SIGNED',
        createdBy: 'user_vp_sales', // Creator is VP
        startDate: '2026-11-01',
        endDate: '2026-12-15',
        totalOpenings: 5,
        totalFeeAmount: 15000,
        currency: 'MAD',
        rowVersion: 1,
      };

      // Samir (LCP, distinct from creator) counter-signs
      const res = counterSignContractByLCP(contract, 'user_lcp_samir');
      expect(res.success).toBe(true);
      expect(contract.status).toBe('ACTIVE');
      expect(contract.lcpSignerId).toBe('user_lcp_samir');
      expect(contract.lcpSignedAt).toBeDefined();
    });
  });
});
