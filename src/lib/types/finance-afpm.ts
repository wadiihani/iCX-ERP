/**
 * AFPM Operational Finance Ledger, Invoices & Sustainability Domain Types
 * Statutory References: AFPM, Section 7.2 (SM-08), Moroccan Tax Code (CGI), REQ-086..090, INV-06, TEST-078..082
 * Jurisdiction: AIESEC in Rabat (LC Rabat, MC Morocco)
 */

import type { AiesecRole } from './auth-onboarding';

export type InvoiceStatus =
  | 'DRAFT'
  | 'ISSUED'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'OVERDUE'
  | 'VOIDED';

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPriceMad: number;
  totalMad: number;
}

export interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  lcId: string;
  partnerOrganizationId: string;
  partnerName: string;
  partnerIce: string; // 15 digits
  partnerIf?: string; // 7-8 digits
  issueDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  lineItems: InvoiceLineItem[];
  subtotalMad: number;
  vatRatePercent: number; // e.g. 0% for non-profit/exempt, 20% standard
  vatAmountMad: number;
  totalAmountMad: number;
  paidAmountMad: number;
  status: InvoiceStatus;
  createdAt: string;
  updatedAt: string;
}

export type DisbursementCategory =
  | 'HOUSING_RENT'
  | 'PICKUP_TRANSPORT'
  | 'EVENT_LOGISTICS'
  | 'CASE_COMPENSATION'
  | 'EMERGENCY_SUPPORT'
  | 'GENERAL_OPERATION';

export type DisbursementStatus =
  | 'REQUESTED'
  | 'FIRST_APPROVAL_GRANTED'
  | 'APPROVED_FOR_PAYMENT'
  | 'PAID'
  | 'REJECTED';

export interface DisbursementRecord {
  id: string;
  disbursementNumber: string;
  lcId: string;
  category: DisbursementCategory;
  amountMad: number;
  beneficiaryName: string;
  purpose: string;
  receiptDocumentId?: string;
  requestedByUserId: string;
  requestedAt: string;
  firstApprovedByUserId?: string;
  firstApprovedByRole?: AiesecRole;
  firstApprovedAt?: string;
  secondApprovedByUserId?: string;
  secondApprovedByRole?: AiesecRole;
  secondApprovedAt?: string;
  status: DisbursementStatus;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OpportunityFinancialSlice {
  opportunityId: string;
  opportunityTitle: string;
  realizedEpsCount: number;
  revenueMad: number;
  directCostMad: number;
  netMarginMad: number;
  sustainabilityRatio: number;
  isSustainable: boolean;
}

export interface ExchangeSustainabilityReport {
  lcId: string;
  reportingPeriod: string;
  totalRevenueMad: number;
  totalDirectCostsMad: number;
  netMarginMad: number;
  overallSustainabilityRatio: number; // Revenue / Costs
  isSustainable: boolean; // Must be > 1.0 per AFPM
  opportunityBreakdown: OpportunityFinancialSlice[];
  generatedAt: string;
}
