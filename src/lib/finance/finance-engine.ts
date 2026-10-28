/**
 * AFPM Operational Finance Ledger, Invoices & Sustainability Engine
 * Statutory References: AFPM, Section 7.2 (SM-08), Moroccan Tax Code (CGI), REQ-086..090, INV-06, TEST-078..082
 * Jurisdiction: AIESEC in Rabat (LC Rabat, MC Morocco)
 */

import type { AiesecRole } from '../types/auth-onboarding';
import type {
  InvoiceRecord,
  InvoiceStatus,
  InvoiceLineItem,
  DisbursementCategory,
  DisbursementStatus,
  DisbursementRecord,
  OpportunityFinancialSlice,
  ExchangeSustainabilityReport,
} from '../types/finance-afpm';
import { validateICE } from '../validation/moroccan-tax';

/**
 * REQ-086 & TEST-078: Creates a statutory B2B Partner Invoice (SM-08).
 * Validates Moroccan ICE (15 digits) and calculates VAT.
 */
export function createPartnerInvoice(params: {
  lcId: string;
  partnerOrganizationId: string;
  partnerName: string;
  partnerIce: string;
  partnerIf?: string;
  issueDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  lineItems: InvoiceLineItem[];
  vatRatePercent?: number; // 0 for exempt, 20 standard
  timestamp?: string;
}): { success: boolean; invoice?: InvoiceRecord; error?: string } {
  // Validate Moroccan ICE
  const iceValidation = validateICE(params.partnerIce);
  if (!iceValidation.isValid) {
    return {
      success: false,
      error: `Moroccan Tax Compliance Error: ${iceValidation.error}`,
    };
  }

  if (params.lineItems.length === 0) {
    return {
      success: false,
      error: 'Invoice must contain at least one billable line item.',
    };
  }

  const now = params.timestamp || new Date().toISOString();
  const subtotalMad = params.lineItems.reduce((sum, item) => sum + item.totalMad, 0);
  const vatRate = params.vatRatePercent !== undefined ? params.vatRatePercent : 0; // Default exempt for youth non-profit
  const vatAmountMad = Math.round((subtotalMad * vatRate) / 100);
  const totalAmountMad = subtotalMad + vatAmountMad;

  const invoiceNumber = `INV-${params.issueDate.slice(0, 4)}-RABAT-${Math.floor(100 + Math.random() * 900)}`;

  const invoice: InvoiceRecord = {
    id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    invoiceNumber,
    lcId: params.lcId,
    partnerOrganizationId: params.partnerOrganizationId,
    partnerName: params.partnerName,
    partnerIce: params.partnerIce,
    partnerIf: params.partnerIf,
    issueDate: params.issueDate,
    dueDate: params.dueDate,
    lineItems: params.lineItems,
    subtotalMad,
    vatRatePercent: vatRate,
    vatAmountMad,
    totalAmountMad,
    paidAmountMad: 0,
    status: 'DRAFT',
    createdAt: now,
    updatedAt: now,
  };

  return {
    success: true,
    invoice,
  };
}

/**
 * Transitions invoice from DRAFT to ISSUED.
 */
export function issueInvoice(invoice: InvoiceRecord, timestamp?: string): InvoiceRecord {
  if (invoice.status !== 'DRAFT') {
    throw new Error(`Cannot issue invoice in status ${invoice.status}. Must be DRAFT.`);
  }

  const now = timestamp || new Date().toISOString();
  return {
    ...invoice,
    status: 'ISSUED',
    updatedAt: now,
  };
}

/**
 * Records payment against an invoice and updates lifecycle status.
 */
export function recordInvoicePayment(
  invoice: InvoiceRecord,
  paymentAmountMad: number,
  timestamp?: string
): InvoiceRecord {
  if (invoice.status === 'VOIDED' || invoice.status === 'PAID') {
    throw new Error(`Cannot record payment on invoice with status ${invoice.status}.`);
  }

  const now = timestamp || new Date().toISOString();
  const newPaidAmount = invoice.paidAmountMad + paymentAmountMad;

  let newStatus: InvoiceStatus = invoice.status;
  if (newPaidAmount >= invoice.totalAmountMad) {
    newStatus = 'PAID';
  } else if (newPaidAmount > 0) {
    newStatus = 'PARTIALLY_PAID';
  }

  return {
    ...invoice,
    paidAmountMad: newPaidAmount,
    status: newStatus,
    updatedAt: now,
  };
}

/**
 * Evaluates whether an issued/partially paid invoice is overdue.
 */
export function evaluateInvoiceOverdue(
  invoice: InvoiceRecord,
  currentDate: Date = new Date()
): InvoiceRecord {
  if (invoice.status === 'PAID' || invoice.status === 'VOIDED') {
    return invoice;
  }

  const currentYmd = currentDate.toISOString().split('T')[0];
  if (currentYmd > invoice.dueDate && invoice.status !== 'OVERDUE') {
    return {
      ...invoice,
      status: 'OVERDUE',
      updatedAt: currentDate.toISOString(),
    };
  }

  return invoice;
}

/**
 * REQ-087 & TEST-079: Requests an operational disbursement.
 * Enforces receipt documentation for amounts > 1000 MAD.
 */
export function requestDisbursement(params: {
  lcId: string;
  category: DisbursementCategory;
  amountMad: number;
  beneficiaryName: string;
  purpose: string;
  requestedByUserId: string;
  receiptDocumentId?: string;
  timestamp?: string;
}): { success: boolean; disbursement?: DisbursementRecord; error?: string } {
  if (params.amountMad <= 0) {
    return {
      success: false,
      error: 'Disbursement amount must be greater than zero.',
    };
  }

  // AFPM Documentation requirement: amounts > 1000 MAD require receipt attachment
  if (params.amountMad > 1000 && !params.receiptDocumentId) {
    return {
      success: false,
      error: 'Statutory AFPM Policy: Disbursements exceeding 1,000 MAD strictly require an attached receipt or bill of lading.',
    };
  }

  const now = params.timestamp || new Date().toISOString();
  const disbursementNumber = `DISB-${new Date(now).getFullYear()}-RABAT-${Math.floor(100 + Math.random() * 900)}`;

  const disbursement: DisbursementRecord = {
    id: `disb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    disbursementNumber,
    lcId: params.lcId,
    category: params.category,
    amountMad: params.amountMad,
    beneficiaryName: params.beneficiaryName,
    purpose: params.purpose,
    receiptDocumentId: params.receiptDocumentId,
    requestedByUserId: params.requestedByUserId,
    requestedAt: now,
    status: 'REQUESTED',
    createdAt: now,
    updatedAt: now,
  };

  return {
    success: true,
    disbursement,
  };
}

/**
 * INV-06, REQ-088 & TEST-079: First Approval for Disbursement (Operational Validation).
 * Prohibits requester from approving their own disbursement.
 */
export function firstApproveDisbursement(
  disbursement: DisbursementRecord,
  approverUserId: string,
  approverRole: AiesecRole,
  timestamp?: string
): { success: boolean; disbursement?: DisbursementRecord; error?: string } {
  // Invariant INV-06 check
  if (disbursement.requestedByUserId === approverUserId) {
    return {
      success: false,
      error: `Statutory Invariant Violation INV-06 (TEST-079): User "${approverUserId}" cannot approve their own disbursement request. Dual control strictly enforced.`,
    };
  }

  const validFirstRoles: AiesecRole[] = ['LCVP_ICX', 'LCVP_FNL', 'LCP'];
  if (!validFirstRoles.includes(approverRole)) {
    return {
      success: false,
      error: `Permission Denied: Role ${approverRole} is not authorized for first disbursement sign-off.`,
    };
  }

  const now = timestamp || new Date().toISOString();

  return {
    success: true,
    disbursement: {
      ...disbursement,
      status: 'FIRST_APPROVAL_GRANTED',
      firstApprovedByUserId: approverUserId,
      firstApprovedByRole: approverRole,
      firstApprovedAt: now,
      updatedAt: now,
    },
  };
}

/**
 * INV-06, REQ-088 & TEST-079: Second Approval for Disbursement (Presidential Sign-Off).
 * Requires distinct second approver and LCP role.
 */
export function secondApproveDisbursement(
  disbursement: DisbursementRecord,
  approverUserId: string,
  approverRole: AiesecRole,
  timestamp?: string
): { success: boolean; disbursement?: DisbursementRecord; error?: string } {
  if (disbursement.status !== 'FIRST_APPROVAL_GRANTED') {
    return {
      success: false,
      error: `Cannot give second approval: Disbursement is in status ${disbursement.status}. Must be FIRST_APPROVAL_GRANTED.`,
    };
  }

  // Dual control: second approver must NOT be the requester OR the first approver
  if (disbursement.requestedByUserId === approverUserId) {
    return {
      success: false,
      error: `Statutory Invariant Violation INV-06: Requester "${approverUserId}" cannot provide presidential sign-off on own disbursement.`,
    };
  }

  if (disbursement.firstApprovedByUserId === approverUserId) {
    return {
      success: false,
      error: `Statutory Invariant Violation INV-06: First approver "${approverUserId}" cannot also be the second approver. Two distinct officers required.`,
    };
  }

  if (approverRole !== 'LCP') {
    return {
      success: false,
      error: `Permission Denied: Final disbursement authorization requires LCP role, got ${approverRole}.`,
    };
  }

  const now = timestamp || new Date().toISOString();

  return {
    success: true,
    disbursement: {
      ...disbursement,
      status: 'APPROVED_FOR_PAYMENT',
      secondApprovedByUserId: approverUserId,
      secondApprovedByRole: approverRole,
      secondApprovedAt: now,
      updatedAt: now,
    },
  };
}

/**
 * REQ-089 & TEST-080: AFPM Exchange Sustainability Ratio Dashboard Engine.
 * Formula: Sustainability Ratio = Total Revenue / Total Direct Costs.
 * Statutory requirement: Must strictly exceed 1.0.
 */
export function calculateExchangeSustainabilityRatio(
  lcId: string,
  reportingPeriod: string,
  opportunities: OpportunityFinancialSlice[]
): ExchangeSustainabilityReport {
  const totalRevenueMad = opportunities.reduce((sum, opp) => sum + opp.revenueMad, 0);
  const totalDirectCostsMad = opportunities.reduce((sum, opp) => sum + opp.directCostMad, 0);
  const netMarginMad = totalRevenueMad - totalDirectCostsMad;

  const overallRatio =
    totalDirectCostsMad > 0
      ? Number((totalRevenueMad / totalDirectCostsMad).toFixed(2))
      : totalRevenueMad > 0
      ? 99.99
      : 0;

  const isSustainable = overallRatio > 1.0;

  return {
    lcId,
    reportingPeriod,
    totalRevenueMad,
    totalDirectCostsMad,
    netMarginMad,
    overallSustainabilityRatio: overallRatio,
    isSustainable,
    opportunityBreakdown: opportunities,
    generatedAt: new Date().toISOString(),
  };
}
