import { describe, it, expect } from 'vitest';
import {
  INITIAL_PAYOUT_REQUESTS,
  INITIAL_INVOICES,
  INITIAL_AFPM_STATUS,
  transitionPayoutStatus,
  type PayoutRequest,
} from '../src/lib/finance/finance-types';

describe('Phase 6: Finance Controls & Reconciled KPI Dashboards', () => {
  const getSamplePayout = (): PayoutRequest => ({
    id: 'pay_test_1',
    title: 'Emergency Hostel Booking',
    category: 'EP_ACCOMMODATION',
    amount_mad: 2500,
    submitted_by_id: 'usr_cxp_01',
    submitted_by_name: 'Amina Benali',
    beneficiary: 'Hostel Medina Chellah',
    proof_receipt_url: '#',
    status: 'SUBMITTED',
    created_at: '2026-10-28T10:00:00Z',
  });

  it('enforces strict Dual Approval sequence (SM-08)', () => {
    const payout = getSamplePayout();

    // 1. Regular Member attempt to approve is blocked
    const resMember = transitionPayoutStatus(payout, 'APPROVE_VP_FNL', 'Member');
    expect(resMember.success).toBe(false);
    expect(resMember.error).toContain('Only VP Finance or LCP');

    // 2. LCP counter-signature before VP Finance approval is blocked
    const resPrematureLcp = transitionPayoutStatus(payout, 'APPROVE_LCP', 'LCP');
    expect(resPrematureLcp.success).toBe(false);
    expect(resPrematureLcp.error).toContain('Dual-Approval Invariant Violation');

    // 3. VP Finance executes Level-1
    const resVp = transitionPayoutStatus(payout, 'APPROVE_VP_FNL', 'VP_FNL');
    expect(resVp.success).toBe(true);
    expect(payout.status).toBe('APPROVED_VP_FNL');
    expect(payout.vp_fnl_approved_at).toBeDefined();

    // 4. Non-LCP cannot execute Level-2
    const resInvalidLcp = transitionPayoutStatus(payout, 'APPROVE_LCP', 'VP_BD');
    expect(resInvalidLcp.success).toBe(false);

    // 5. LCP executes Level-2 counter-signature -> RELEASED
    const resLcp = transitionPayoutStatus(payout, 'APPROVE_LCP', 'LCP');
    expect(resLcp.success).toBe(true);
    expect(payout.status).toBe('RELEASED');
    expect(payout.lcp_approved_at).toBeDefined();
    expect(payout.released_at).toBeDefined();
  });

  it('verifies AFPM Statutory Reserve Solvency computation', () => {
    expect(INITIAL_AFPM_STATUS.minimum_required_reserve_mad).toBe(50000);
    expect(INITIAL_AFPM_STATUS.current_liquid_balance_mad).toBeGreaterThanOrEqual(INITIAL_AFPM_STATUS.minimum_required_reserve_mad);
    expect(INITIAL_AFPM_STATUS.solvency_ratio_percentage).toBeGreaterThanOrEqual(100);
    expect(INITIAL_AFPM_STATUS.afpm_compliance_status).toBe('COMPLIANT');
  });

  it('categorizes invoices into aging buckets', () => {
    expect(INITIAL_INVOICES.length).toBeGreaterThanOrEqual(3);
    const buckets = new Set(INITIAL_INVOICES.map(i => i.aging_bucket));
    expect(buckets.has('CURRENT')).toBe(true);
    expect(buckets.has('OVERDUE_1_30')).toBe(true);
  });
});
