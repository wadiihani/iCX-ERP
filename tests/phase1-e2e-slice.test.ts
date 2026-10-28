import { describe, it, expect } from 'vitest';
import { validateICE } from '../src/lib/validation/moroccan-tax';
import { detectDuplicate, normalizeOrgName, calculateLevenshteinSimilarity } from '../src/lib/crm/deduplication';
import { transitionDealStage, type DealRecord } from '../src/lib/sales/pipeline-machine';
import { validateDiscoveryAnswers, type DiscoveryQuestionnaireAnswers } from '../src/lib/sales/discovery-questionnaire';
import { composeOutreachMessage } from '../src/lib/sales/outreach-composer';
import { counterSignContractByLCP, type ContractRecord } from '../src/lib/sales/contract-machine';
import { validateOpportunity } from '../src/lib/opportunity/opportunity-validator';
import { transitionOpportunityStatus, checkOpportunityReviewSLA, type OpportunityLifecycleRecord } from '../src/lib/opportunity/opportunity-machine';
import { reserveSlot, confirmSlot, type OpportunitySlot } from '../src/lib/opportunity/slot-machine';
import { computeAuditHash, verifyAuditChain, type AuditRecordPayload } from '../src/lib/audit/hash-chain';

describe('Phase 1 Vertical Slice 1: Partner-to-Opportunity E2E Integration Suite', () => {
  it('executes the complete unbroken Phase 1 lifecycle with zero invariant violations', () => {
    const lcId = 'lc_rabat_morocco';
    const auditChain: Array<AuditRecordPayload & { hash: string }> = [];

    const recordAudit = (table: string, id: string, action: 'INSERT' | 'UPDATE' | 'DELETE' | 'EXECUTE' | 'AUTH', state: any) => {
      const prevHash = auditChain.length > 0 ? auditChain[auditChain.length - 1].hash : null;
      const payload: AuditRecordPayload = {
        prev_hash: prevHash,
        table_name: table,
        record_id: id,
        action,
        created_at: new Date().toISOString(),
        new_state: state,
      };
      const hash = computeAuditHash(payload);
      auditChain.push({ ...payload, hash });
    };

    // -------------------------------------------------------------
    // Step 1: Partner Organization Intake & Statutory ICE Validation (REQ-011)
    // -------------------------------------------------------------
    const partnerCandidate = {
      name: 'Association Orient-Occident Rabat',
      ice: '001524316000045',
      city: 'Rabat',
    };

    const iceCheck = validateICE(partnerCandidate.ice);
    expect(iceCheck.isValid).toBe(true);
    expect(iceCheck.formatted).toBe('001 524 316 0000 45');

    // Deduplication check against empty/initial registry (REQ-012)
    const dupCheck = detectDuplicate(
      { name: partnerCandidate.name, ice_number: partnerCandidate.ice, city: partnerCandidate.city },
      []
    );
    expect(dupCheck.isDuplicate).toBe(false);

    const organizationId = 'org_rabat_orient_001';
    recordAudit('organizations', organizationId, 'INSERT', {
      id: organizationId,
      name: partnerCandidate.name,
      ice_number: partnerCandidate.ice,
      lc_id: lcId,
    });

    // -------------------------------------------------------------
    // Step 2: B2B Sales Deal Creation in Pipeline SM-01 (REQ-014)
    // -------------------------------------------------------------
    const deal: DealRecord = {
      id: 'deal_2026_01',
      lcId,
      organizationId,
      stage: 'LEAD',
      dealValue: 20000,
      product: 'igv',
      assignedTo: 'user_sales_rabat',
      history: [],
    };
    recordAudit('deals', deal.id, 'INSERT', { stage: 'LEAD', dealValue: 20000 });

    // Progress through CONTACTED and MEETING_SCHEDULED
    expect(transitionDealStage(deal, 'CONTACTED', 'user_sales_rabat').success).toBe(true);
    expect(transitionDealStage(deal, 'MEETING_SCHEDULED', 'user_sales_rabat').success).toBe(true);
    recordAudit('deals', deal.id, 'UPDATE', { stage: 'MEETING_SCHEDULED' });

    // -------------------------------------------------------------
    // Step 3: Discovery Questionnaire Gate Enforcement (REQ-015, TEST-022)
    // -------------------------------------------------------------
    // Attempting to skip stages from MEETING_SCHEDULED to PROPOSAL_SENT is blocked
    const skipStageAttempt = transitionDealStage(deal, 'PROPOSAL_SENT', 'user_sales_rabat');
    expect(skipStageAttempt.success).toBe(false);
    expect(skipStageAttempt.error).toContain('Invalid transition');

    // Advance to DISCOVERY_COMPLETED without answers
    expect(transitionDealStage(deal, 'DISCOVERY_COMPLETED', 'user_sales_rabat').success).toBe(true);

    // Attempting to advance from DISCOVERY_COMPLETED to PROPOSAL_SENT without discovery must be BLOCKED
    const prematureProposal = transitionDealStage(deal, 'PROPOSAL_SENT', 'user_sales_rabat');
    expect(prematureProposal.success).toBe(false);
    expect(prematureProposal.error).toContain('Discovery Gate Block');

    // Complete valid statutory discovery
    const discoveryData: DiscoveryQuestionnaireAnswers = {
      sdgGoal: 4,
      weeklyWorkingHours: 32,
      durationWeeks: 6,
      hasSupervisorAssigned: true,
      supervisorName: 'Fatima Zahra Mansouri',
      accommodationConfirmed: true,
      fundingCommitmentPercentage: 100,
      completedAt: new Date().toISOString(),
      completedBy: 'user_sales_rabat',
    };
    const discoveryCheck = validateDiscoveryAnswers(discoveryData);
    expect(discoveryCheck.isComplete).toBe(true);

    deal.discoveryAnswers = discoveryData;
    expect(transitionDealStage(deal, 'PROPOSAL_SENT', 'user_sales_rabat').success).toBe(true);
    recordAudit('deals', deal.id, 'UPDATE', { stage: 'PROPOSAL_SENT', discoveryAnswers: discoveryData });

    // -------------------------------------------------------------
    // Step 4: Multi-Lingual Outreach Generation (REQ-016, TEST-023)
    // -------------------------------------------------------------
    const outreachContext = {
      partnerName: partnerCandidate.name,
      contactName: discoveryData.supervisorName || 'Directeur',
      sdgTarget: 'ODD 4: Éducation de Qualité',
      city: 'Rabat',
      senderName: 'Mehdi Benjelloun',
      senderRole: 'VP iGV Partnerships',
      lcName: 'AIESEC in Rabat',
    };

    const frenchOutreach = composeOutreachMessage('fr', outreachContext);
    expect(frenchOutreach.missingTags.length).toBe(0);
    expect(frenchOutreach.body).toContain('Fatima Zahra Mansouri');
    expect(frenchOutreach.body).toContain('AIESEC in Rabat');

    // -------------------------------------------------------------
    // Step 5: Contract Vault & Dual-Control Counter-Signature (REQ-021, INV-06, TEST-024)
    // -------------------------------------------------------------
    const contract: ContractRecord = {
      id: 'contract_igv_orient_001',
      lcId,
      organizationId,
      dealId: deal.id,
      title: 'MoU Partenariat iGV 2026 - Association Orient-Occident',
      contractType: 'MOU_IGV',
      status: 'PARTNER_SIGNED',
      createdBy: 'user_sales_rabat', // Creator is VP Sales
      startDate: '2026-11-01',
      endDate: '2026-12-15',
      totalOpenings: 5,
      totalFeeAmount: 20000,
      currency: 'MAD',
      rowVersion: 1,
    };
    recordAudit('contracts', contract.id, 'INSERT', { status: 'PARTNER_SIGNED', createdBy: contract.createdBy });

    // Invariant INV-06: Creator (user_sales_rabat) CANNOT counter-sign as LCP
    const selfSignAttempt = counterSignContractByLCP(contract, 'user_sales_rabat');
    expect(selfSignAttempt.success).toBe(false);
    expect(selfSignAttempt.error).toContain('Statutory Violation INV-06 (TEST-024)');

    // Independent officer (user_lcp_rabat) counter-signs
    const validSign = counterSignContractByLCP(contract, 'user_lcp_rabat');
    expect(validSign.success).toBe(true);
    expect(contract.status).toBe('ACTIVE');
    recordAudit('contracts', contract.id, 'UPDATE', { status: 'ACTIVE', lcpSignerId: 'user_lcp_rabat' });

    // -------------------------------------------------------------
    // Step 6: Opportunity Creation & Statutory Criteria (REQ-022, TEST-025)
    // -------------------------------------------------------------
    const oppInput = {
      title: 'Youth Coding & Digital Literacy Coach',
      product: 'igv' as const,
      sdgTarget: 4,
      durationWeeks: 6,
      weeklyWorkingHours: 30,
      fundingPercentage: 100,
      totalOpenings: 5,
      startDate: '2026-11-01',
      endDate: '2026-12-15',
    };
    const oppValidation = validateOpportunity(oppInput);
    expect(oppValidation.isValid).toBe(true);

    const opportunity: OpportunityLifecycleRecord = {
      id: 'opp_rabat_coding_001',
      lcId,
      organizationId,
      title: oppInput.title,
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      totalOpenings: 5,
      availableOpenings: 5,
      history: [],
    };
    recordAudit('opportunities', opportunity.id, 'INSERT', { title: opportunity.title, status: 'DRAFT' });

    // -------------------------------------------------------------
    // Step 7: Opportunity Lifecycle SM-02 & Review Timer (REQ-023, THR-012)
    // -------------------------------------------------------------
    expect(transitionOpportunityStatus(opportunity, 'UNDER_REVIEW', 'user_sales_rabat').success).toBe(true);
    expect(checkOpportunityReviewSLA(opportunity).isBreached).toBe(false);

    expect(transitionOpportunityStatus(opportunity, 'OPEN', 'user_lcp_rabat').success).toBe(true);
    expect(transitionOpportunityStatus(opportunity, 'APPLICATIONS_OPEN', 'user_lcp_rabat').success).toBe(true);
    recordAudit('opportunities', opportunity.id, 'UPDATE', { status: 'APPLICATIONS_OPEN' });

    // -------------------------------------------------------------
    // Step 8: Slot Allocation SM-03 & 180-Day Horizon Guard (REQ-024, THR-048)
    // -------------------------------------------------------------
    const slot: OpportunitySlot = {
      id: 'slot_opp_001_s1',
      opportunityId: opportunity.id,
      slotNumber: 1,
      startDate: '2026-11-01',
      endDate: '2026-12-15',
      status: 'UNALLOCATED',
    };

    const reserveRes = reserveSlot({
      slot,
      applicationId: 'ep_app_991',
      currentDateMs: new Date('2026-10-26').getTime(),
    });
    expect(reserveRes.success).toBe(true);
    expect(slot.status).toBe('RESERVED');

    const confirmRes = confirmSlot(slot);
    expect(confirmRes.success).toBe(true);
    expect(slot.status).toBe('CONFIRMED');
    recordAudit('opportunity_slots', slot.id, 'UPDATE', { status: 'CONFIRMED', reservedApplicationId: 'ep_app_991' });

    // -------------------------------------------------------------
    // Step 9: Forensic Audit Trail Cryptographic Validation (INV-02)
    // -------------------------------------------------------------
    expect(auditChain.length).toBe(9);
    const chainVerification = verifyAuditChain(auditChain);
    expect(chainVerification.valid).toBe(true);

    // Tampering test: altering past audit record must invalidate whole ledger
    const tamperedRecord = { ...auditChain[0], new_state: { name: 'Hacked Organization' } };
    const tamperedChain = [tamperedRecord, ...auditChain.slice(1)];
    const tamperedVerification = verifyAuditChain(tamperedChain);
    expect(tamperedVerification.valid).toBe(false);
  });
});
