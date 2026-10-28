export interface PayoutRequest {
  id: string;
  title: string;
  category: 'EP_ACCOMMODATION' | 'TRANSPORT_PICKUP' | 'MARKETING_IR' | 'OFFICE_SUPPLIES' | 'AFPM_RESERVE';
  amount_mad: number;
  submitted_by_id: string;
  submitted_by_name: string;
  beneficiary: string;
  proof_receipt_url: string;
  status: 'SUBMITTED' | 'APPROVED_VP_FNL' | 'APPROVED_LCP' | 'RELEASED' | 'REJECTED';
  vp_fnl_approved_at?: string;
  lcp_approved_at?: string;
  released_at?: string;
  rejection_reason?: string;
  created_at: string;
}

export interface B2BInvoice {
  id: string;
  invoice_number: string;
  partner_organization_name: string;
  deal_title: string;
  amount_mad: number;
  issued_date: string;
  due_date: string;
  aging_bucket: 'CURRENT' | 'OVERDUE_1_30' | 'OVERDUE_31_60' | 'OVERDUE_60_PLUS';
  status: 'PAID' | 'ISSUED' | 'DRAFT' | 'CANCELLED';
  paid_date?: string;
}

export interface AFPMReserveStatus {
  minimum_required_reserve_mad: number;
  current_liquid_balance_mad: number;
  solvency_ratio_percentage: number;
  afpm_compliance_status: 'COMPLIANT' | 'WARNING' | 'NON_COMPLIANT';
}

export const INITIAL_PAYOUT_REQUESTS: PayoutRequest[] = [
  {
    id: 'pay_001',
    title: 'Agdal Host Family Monthly Rent (Sofia Martinez)',
    category: 'EP_ACCOMMODATION',
    amount_mad: 1800,
    submitted_by_id: 'usr_cxp_01',
    submitted_by_name: 'Amina Benali (VP CXP)',
    beneficiary: 'Mme. Aicha Bennani (Dar Zellige)',
    proof_receipt_url: '#',
    status: 'APPROVED_VP_FNL',
    vp_fnl_approved_at: '2026-10-27T11:00:00Z',
    created_at: '2026-10-26T16:00:00Z',
  },
  {
    id: 'pay_002',
    title: 'Van Fuel & Airport Tolls (CMN Arrival Pickups)',
    category: 'TRANSPORT_PICKUP',
    amount_mad: 450,
    submitted_by_id: 'usr_cxp_01',
    submitted_by_name: 'Amina Benali (VP CXP)',
    beneficiary: 'Abdelkader Driver (AIESEC Van)',
    proof_receipt_url: '#',
    status: 'SUBMITTED',
    created_at: '2026-10-27T14:30:00Z',
  },
  {
    id: 'pay_003',
    title: 'Q3 AFPM Reserve Fund Allocation Deposit',
    category: 'AFPM_RESERVE',
    amount_mad: 10000,
    submitted_by_id: 'usr_fnl_01',
    submitted_by_name: 'Salma Tazi (VP Finance)',
    beneficiary: 'AIESEC Morocco National Treasury',
    proof_receipt_url: '#',
    status: 'RELEASED',
    vp_fnl_approved_at: '2026-10-20T10:00:00Z',
    lcp_approved_at: '2026-10-21T09:30:00Z',
    released_at: '2026-10-22T14:00:00Z',
    created_at: '2026-10-19T09:00:00Z',
  },
];

export const INITIAL_INVOICES: B2BInvoice[] = [
  {
    id: 'inv_001',
    invoice_number: 'INV-2026-088',
    partner_organization_name: 'BMCE Bank Foundation',
    deal_title: 'Q4 CSR Trainee Grant Tranche 1',
    amount_mad: 25000,
    issued_date: '2026-10-15',
    due_date: '2026-11-15',
    aging_bucket: 'CURRENT',
    status: 'ISSUED',
  },
  {
    id: 'inv_002',
    invoice_number: 'INV-2026-071',
    partner_organization_name: 'Rabat American School',
    deal_title: 'Fall STEM Teaching Assistants Realization Fee',
    amount_mad: 36000,
    issued_date: '2026-09-01',
    due_date: '2026-10-01',
    aging_bucket: 'OVERDUE_1_30',
    status: 'ISSUED',
  },
  {
    id: 'inv_003',
    invoice_number: 'INV-2026-060',
    partner_organization_name: 'Casatech Innovation Labs',
    deal_title: 'Software Developer Sourcing Deposit',
    amount_mad: 14000,
    issued_date: '2026-08-10',
    due_date: '2026-09-10',
    aging_bucket: 'CURRENT',
    status: 'PAID',
    paid_date: '2026-08-28',
  },
];

export const INITIAL_AFPM_STATUS: AFPMReserveStatus = {
  minimum_required_reserve_mad: 50000,
  current_liquid_balance_mad: 82500,
  solvency_ratio_percentage: 165,
  afpm_compliance_status: 'COMPLIANT',
};

/**
 * State Machine SM-08: Dual Approval Engine
 */
export function transitionPayoutStatus(
  request: PayoutRequest,
  action: 'APPROVE_VP_FNL' | 'APPROVE_LCP' | 'REJECT',
  actorRole: string,
  rejectionReason?: string
): { success: boolean; error?: string } {
  if (action === 'REJECT') {
    request.status = 'REJECTED';
    request.rejection_reason = rejectionReason || 'Rejected by finance authority';
    return { success: true };
  }

  if (action === 'APPROVE_VP_FNL') {
    if (actorRole !== 'VP_FNL' && actorRole !== 'LCP') {
      return { success: false, error: 'Only VP Finance or LCP can execute Level-1 authorization' };
    }
    if (request.status !== 'SUBMITTED') {
      return { success: false, error: 'Request is not in SUBMITTED state' };
    }
    request.status = 'APPROVED_VP_FNL';
    request.vp_fnl_approved_at = new Date().toISOString();
    return { success: true };
  }

  if (action === 'APPROVE_LCP') {
    if (actorRole !== 'LCP') {
      return { success: false, error: 'Strict Dual Approval Rule: Only the Local Committee President (LCP) can execute Level-2 counter-signature' };
    }
    if (request.status !== 'APPROVED_VP_FNL') {
      return { success: false, error: 'Dual-Approval Invariant Violation: Level-1 VP Finance approval is required before LCP counter-signature' };
    }
    request.status = 'RELEASED';
    request.lcp_approved_at = new Date().toISOString();
    request.released_at = new Date().toISOString();
    return { success: true };
  }

  return { success: false, error: 'Invalid payout authorization action' };
}
