/**
 * Release Gate G9 National Scale Certification Domain Types
 * Statutory References: Section 12 (Release Gates), National Compendium, AFPM, Law 09-08
 * Signatories: MCP Morocco, MCVP iCX Morocco, MCVP FnL Morocco, ECB Morocco Chair
 */

export type GateG9CriterionKey =
  | 'RLS_TENANT_ISOLATION'
  | 'AUDIT_HASH_CHAIN'
  | 'DISASTER_RECOVERY'
  | 'HARASSMENT_VAULT_ISOLATION'
  | 'AFPM_DUAL_APPROVALS'
  | 'OPEN_DATA_PORTABILITY'
  | 'TEST_SUITE_PASS_RATE';

export interface GateG9Criterion {
  key: GateG9CriterionKey;
  title: string;
  statutoryReference: string;
  isPassed: boolean;
  metricValue: string;
  details: string;
}

export type NationalSignerRole = 'MCP' | 'MCVP_ICX' | 'MCVP_FNL' | 'ECB_CHAIR';

export interface NationalSigner {
  userId: string;
  fullName: string;
  role: NationalSignerRole;
  email: string;
  signedAt: string;
  signatureSha256: string;
}

export interface GateG9Certification {
  certificateId: string;
  entity: 'AIESEC in Morocco (MC Morocco)';
  termCode: string;
  status: 'AUDIT_IN_PROGRESS' | 'AWAITING_SIGNATURES' | 'OFFICIALLY_CERTIFIED';
  criteria: GateG9Criterion[];
  signers: {
    mcp?: NationalSigner;
    mcvpIcx?: NationalSigner;
    mcvpFnL?: NationalSigner;
    ecbChair?: NationalSigner;
  };
  isFullySigned: boolean;
  masterChecksumSha256: string;
  certifiedAt?: string;
}
