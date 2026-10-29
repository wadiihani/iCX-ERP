import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  INITIAL_B2B_ORGANIZATIONS,
  INITIAL_B2B_CONTACTS,
  MASTER_PARTNER_STANDARDS,
} from '../src/lib/crm/organizations-data';
import {
  INITIAL_B2B_DEALS,
  validateDealTransition,
  PIPELINE_STAGE_CONFIG,
} from '../src/lib/sales/deals-data';
import { PartnerEditDrawer } from '../src/components/crm/partner-edit-drawer';
import { DealStageStepper } from '../src/components/sales/deal-stage-stepper';
import { PartnerStandardsModal } from '../src/components/crm/partner-standards-modal';

describe('B2B Partner CRM, Multi-Deals & Partner Standards (Phase 13 / HUB-CRM-01..04, HUB-STD-01)', () => {
  it('enforces relational separation where 1 organization has multiple deals and contacts', () => {
    const bmce = INITIAL_B2B_ORGANIZATIONS.find((o) => o.id === 'org_rabat_001');
    expect(bmce).toBeDefined();

    // Check multiple contacts
    const bmceContacts = INITIAL_B2B_CONTACTS.filter((c) => c.organization_id === bmce?.id);
    expect(bmceContacts.length).toBeGreaterThanOrEqual(2);

    // Check multiple deals
    const bmceDeals = INITIAL_B2B_DEALS.filter((d) => d.orgId === bmce?.id);
    expect(bmceDeals.length).toBeGreaterThanOrEqual(1);
    expect(bmceDeals[0].orgName).toBe('BMCE Bank Foundation');
  });

  it('validates OP candidate rejection counter thresholds per AEPP 4.2.2.1.7', () => {
    // 0-1 Rejections: Compliant
    const compliantOrg = INITIAL_B2B_ORGANIZATIONS.find((o) => o.unjustifiedRejectionsCount === 0);
    expect(compliantOrg).toBeDefined();

    // 2 Rejections: Warning
    const warningOrg = INITIAL_B2B_ORGANIZATIONS.find((o) => o.unjustifiedRejectionsCount === 2);
    expect(warningOrg).toBeDefined();

    // 3+ Rejections: Suspended
    const suspendedOrg = INITIAL_B2B_ORGANIZATIONS.find((o) => o.unjustifiedRejectionsCount >= 3);
    expect(suspendedOrg).toBeDefined();
    expect(suspendedOrg?.name).toBe('Atlas Hospitality Group');
  });

  it('enforces mandatory loss reason when marking Closed Lost or Disqualified', () => {
    const deal = INITIAL_B2B_DEALS[0];

    // Attempt Closed Lost without reason
    const failRes = validateDealTransition(deal, 'CLOSED_LOST');
    expect(failRes.isValid).toBe(false);
    expect(failRes.error).toContain('Mandatory Loss / Disqualification reason');

    // With explicit reason
    const okRes = validateDealTransition(deal, 'CLOSED_LOST', 'Budget freeze in Q4');
    expect(okRes.isValid).toBe(true);
  });

  it('enforces BANT Discovery Gate before advancing to Proposal', () => {
    const dealWithoutBant = {
      ...INITIAL_B2B_DEALS[0],
      bantAnswers: null,
    };

    const blockRes = validateDealTransition(dealWithoutBant, 'PROPOSAL');
    expect(blockRes.isValid).toBe(false);
    expect(blockRes.error).toContain('BANT Discovery Gate Block');

    // Valid deal with BANT
    const validRes = validateDealTransition(INITIAL_B2B_DEALS[0], 'PROPOSAL');
    expect(validRes.isValid).toBe(true);
  });

  it('enforces Contract Gate before advancing to Opportunity Setup', () => {
    const dealWithoutContract = {
      ...INITIAL_B2B_DEALS[0],
      contractId: undefined,
      contractUrl: undefined,
    };

    const blockRes = validateDealTransition(dealWithoutContract, 'OPP_SETUP');
    expect(blockRes.isValid).toBe(false);
    expect(blockRes.error).toContain('Contract Gate Block');

    // Valid deal with contract
    const validRes = validateDealTransition(INITIAL_B2B_DEALS[0], 'OPP_SETUP');
    expect(validRes.isValid).toBe(true);
  });

  it('validates canonical structure of Partner Standards Register (6 checkpoints)', () => {
    expect(MASTER_PARTNER_STANDARDS).toHaveLength(6);
    expect(MASTER_PARTNER_STANDARDS[0].standardId).toBe('LEGAL_REGISTRATION');
    expect(MASTER_PARTNER_STANDARDS[1].standardId).toBe('VALUES_ETHICS_FIT');
    expect(MASTER_PARTNER_STANDARDS[2].standardId).toBe('SUPERVISION_MENTORSHIP');
    expect(MASTER_PARTNER_STANDARDS[3].standardId).toBe('WORKPLACE_SAFETY');
    expect(MASTER_PARTNER_STANDARDS[4].standardId).toBe('CONTRACT_FINANCE_AGREEMENT');
    expect(MASTER_PARTNER_STANDARDS[5].standardId).toBe('PERIODIC_REVIEW_RENEWAL');
  });

  it('renders DealStageStepper with all 8 stages and status indicators', () => {
    const html = renderToStaticMarkup(
      <DealStageStepper deal={INITIAL_B2B_DEALS[0]} onTransitionStage={() => {}} />
    );

    expect(html).toContain('8-Stage Deal Progression Stepper');
    expect(html).toContain('Prospect');
    expect(html).toContain('Qualified');
    expect(html).toContain('Discovery');
    expect(html).toContain('Proposal');
    expect(html).toContain('Negotiation');
    expect(html).toContain('Agreement Signed');
    expect(html).toContain('Opportunity Setup');
    expect(html).toContain('Active Delivery');
  });

  it('renders PartnerStandardsModal with readiness score bar and checkpoints', () => {
    const html = renderToStaticMarkup(
      <PartnerStandardsModal
        isOpen={true}
        onClose={() => {}}
        partner={INITIAL_B2B_ORGANIZATIONS[0]}
      />
    );

    expect(html).toContain('Partner Standards Register');
    expect(html).toContain('Partner Standards Readiness');
    expect(html).toContain('Legal Entity &amp; Registration Verification');
    expect(html).toContain('Signed Agreement &amp; Financial Terms Clarity');
  });
});
