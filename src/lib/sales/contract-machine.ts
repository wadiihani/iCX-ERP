/**
 * State Machine SM-07: Contract Vault & Lifecycle Machine
 * Baseline: REQ-021, INV-06, and TEST-024
 */

export type ContractStatus =
  | 'DRAFT'
  | 'UNDER_INTERNAL_REVIEW'
  | 'SENT_TO_PARTNER'
  | 'PARTNER_SIGNED'
  | 'LCP_COUNTER_SIGNED'
  | 'ACTIVE'
  | 'EXPIRED'
  | 'TERMINATED';

export interface ContractRecord {
  id: string;
  lcId: string;
  organizationId: string;
  dealId?: string;
  title: string;
  contractType: 'MOU_IGV' | 'MOU_IGT' | 'SERVICE_AGREEMENT';
  status: ContractStatus;
  createdBy: string;
  partnerSignerName?: string;
  partnerSignedAt?: string;
  lcpSignerId?: string;
  lcpSignedAt?: string;
  startDate: string;
  endDate: string;
  totalOpenings: number;
  totalFeeAmount: number;
  currency: string;
  rowVersion: number;
}

export interface ContractSignResult {
  success: boolean;
  contract?: ContractRecord;
  error?: string;
}

/**
 * Executes LCP counter-signature enforcing Invariant INV-06 (Dual-Control Rule).
 * Creator of the contract CANNOT be the LCP counter-signer.
 */
export function counterSignContractByLCP(
  contract: ContractRecord,
  lcpUserId: string
): ContractSignResult {
  // 1. Status check: contract must be in PARTNER_SIGNED status
  if (contract.status !== 'PARTNER_SIGNED') {
    return {
      success: false,
      error: `Invalid lifecycle state: contract must be in PARTNER_SIGNED stage before LCP counter-signature. Current state: ${contract.status}.`,
    };
  }

  // 2. Invariant INV-06 Check: Creator cannot be the approver / counter-signer
  if (contract.createdBy === lcpUserId) {
    return {
      success: false,
      error: `Statutory Violation INV-06 (TEST-024): Dual-control approval rule strictly prohibits the contract creator (${contract.createdBy}) from counter-signing as LCP. Counter-signature must be performed by an independent executive officer.`,
    };
  }

  // Record signature and advance status to ACTIVE
  contract.lcpSignerId = lcpUserId;
  contract.lcpSignedAt = new Date().toISOString();
  contract.status = 'ACTIVE';
  contract.rowVersion += 1;

  return {
    success: true,
    contract,
  };
}
