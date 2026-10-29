/**
 * AFPM Finance Aging, Overdue Penalty & Realization Freeze Engine
 * Statutory Baseline: AFPM Section 6, APIP 3.2.5, AEPP Finance Guidance
 * Jurisdiction: AIESEC in Rabat (LC Rabat, MC Morocco)
 * 
 * Rules:
 * 1. An invoice is CURRENT if today <= due_date.
 * 2. If today > due_date and <= due_date + 14d, status is OVERDUE_GRACE_PERIOD (1-14 days).
 * 3. If today > due_date + 14d, status is OVERDUE_OVER_14D:
 *    - Triggers prominent statutory warning: 5% Late Payment Penalty.
 *    - Flags Opportunity Realization Freeze warning (APIP 3.2.5).
 * 4. iGV Cost Coverage Ratio:
 *    - Ratio = Total Confirmed Inflows (CSR/Partner grants) / Total Participant Delivery Direct Costs.
 *    - Target: >= 70% to 100% sustainable coverage.
 */

export type InvoiceAgingCategory =
  | 'CURRENT'
  | 'OVERDUE_1_14_GRACE'
  | 'OVERDUE_OVER_14D';

export interface EvaluatedInvoice {
  id: string;
  invoiceNumber: string;
  partnerName: string;
  dealTitle: string;
  amountMad: number;
  paidAmountMad: number;
  balanceDueMad: number;
  issuedDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  status: 'PAID' | 'ISSUED' | 'CANCELLED';
  paidDate?: string;
  
  // Computed Aging
  daysOverdue: number;
  agingCategory: InvoiceAgingCategory;
  isOverdue14Days: boolean;
  statutoryPenaltyMad: number; // 5% penalty if > 14 days overdue
  isRealizationFrozen: boolean;
}

export function evaluateInvoiceAging(
  inv: {
    id: string;
    invoice_number: string;
    partner_organization_name: string;
    deal_title: string;
    amount_mad: number;
    issued_date: string;
    due_date: string;
    status: 'PAID' | 'ISSUED' | 'DRAFT' | 'CANCELLED';
    paid_date?: string;
    paid_amount_mad?: number;
  },
  currentDate: Date = new Date()
): EvaluatedInvoice {
  const currentMs = currentDate.getTime();
  const dueMs = new Date(inv.due_date).getTime();
  const diffDays = Math.floor((currentMs - dueMs) / (1000 * 60 * 60 * 24));
  const daysOverdue = Math.max(0, diffDays);

  const isPaid = inv.status === 'PAID';
  const paidMad = isPaid ? inv.amount_mad : inv.paid_amount_mad || 0;
  const balanceDue = Math.max(0, inv.amount_mad - paidMad);

  let agingCategory: InvoiceAgingCategory = 'CURRENT';
  let isOverdue14 = false;
  let penaltyMad = 0;
  let isFrozen = false;

  if (!isPaid && inv.status === 'ISSUED') {
    if (diffDays > 14) {
      agingCategory = 'OVERDUE_OVER_14D';
      isOverdue14 = true;
      penaltyMad = Math.round(balanceDue * 0.05); // 5% statutory penalty
      isFrozen = true;
    } else if (diffDays > 0) {
      agingCategory = 'OVERDUE_1_14_GRACE';
    }
  }

  return {
    id: inv.id,
    invoiceNumber: inv.invoice_number,
    partnerName: inv.partner_organization_name,
    dealTitle: inv.deal_title,
    amountMad: inv.amount_mad,
    paidAmountMad: paidMad,
    balanceDueMad: balanceDue,
    issuedDate: inv.issued_date,
    dueDate: inv.due_date,
    status: inv.status === 'DRAFT' ? 'ISSUED' : inv.status,
    paidDate: inv.paid_date,
    daysOverdue: isPaid ? 0 : daysOverdue,
    agingCategory: isPaid ? 'CURRENT' : agingCategory,
    isOverdue14Days: isOverdue14,
    statutoryPenaltyMad: penaltyMad,
    isRealizationFrozen: isFrozen,
  };
}

/**
 * Calculates iGV Cost Coverage Ratio.
 */
export function calculateIgvCostCoverage(params: {
  confirmedSponsorshipInflowsMad: number;
  totalDirectDeliveryCostsMad: number;
}): {
  coverageRatioPercentage: number;
  status: 'OPTIMAL' | 'ACCEPTABLE' | 'DEFICIT';
  netPositionMad: number;
} {
  const { confirmedSponsorshipInflowsMad, totalDirectDeliveryCostsMad } = params;
  if (totalDirectDeliveryCostsMad <= 0) {
    return {
      coverageRatioPercentage: 100,
      status: 'OPTIMAL',
      netPositionMad: confirmedSponsorshipInflowsMad,
    };
  }

  const ratio = Math.round((confirmedSponsorshipInflowsMad / totalDirectDeliveryCostsMad) * 100);
  const net = confirmedSponsorshipInflowsMad - totalDirectDeliveryCostsMad;

  return {
    coverageRatioPercentage: ratio,
    status: ratio >= 100 ? 'OPTIMAL' : ratio >= 70 ? 'ACCEPTABLE' : 'DEFICIT',
    netPositionMad: net,
  };
}
