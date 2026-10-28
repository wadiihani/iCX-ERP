/**
 * Release Gate G9 National Certification Engine
 * Statutory References: Section 12 (Release Gates), National Compendium, AFPM, Law 09-08
 * Jurisdiction: AIESEC in Morocco (MC Morocco)
 */

import { createHash } from 'node:crypto';
import type {
  GateG9Certification,
  GateG9Criterion,
  NationalSigner,
  NationalSignerRole,
} from '../types/national-gate';

export function computeSha256(content: string | object): string {
  const text = typeof content === 'string' ? content : JSON.stringify(content);
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

export interface GateG9AuditInput {
  crossLcDataLeaksCount: number;
  hashChainContinuityVerified: boolean;
  rpoHours: number;
  rtoHours: number;
  adminLockedOutOfHarassmentVault: boolean;
  dualControlDisbursementsEnforced: boolean;
  openDataPortabilityVerified: boolean;
  testSuitesPassedPercent: number;
}

/**
 * Evaluates all 7 statutory criteria for Gate G9 National Scale Certification.
 */
export function evaluateGateG9Readiness(
  input: GateG9AuditInput,
  termCode: string = '2025/2026'
): GateG9Certification {
  const criteria: GateG9Criterion[] = [
    {
      key: 'RLS_TENANT_ISOLATION',
      title: 'Multi-Tenant RLS Partition Isolation (INV-04)',
      statutoryReference: 'INV-04, TEST-108',
      isPassed: input.crossLcDataLeaksCount === 0,
      metricValue: `${input.crossLcDataLeaksCount} Cross-LC Leaks`,
      details: 'Strict Row-Level Security isolation across all 6 Moroccan Local Committees.',
    },
    {
      key: 'AUDIT_HASH_CHAIN',
      title: 'Cryptographic Audit Hash-Chain Continuity (INV-02)',
      statutoryReference: 'INV-02, TEST-004',
      isPassed: input.hashChainContinuityVerified,
      metricValue: input.hashChainContinuityVerified ? '100% Chain Valid' : 'Broken Chain',
      details: 'Unbroken SHA-256 hash-chain verified across all operational audit records.',
    },
    {
      key: 'DISASTER_RECOVERY',
      title: 'Disaster Recovery RPO & RTO SLA Compliance (DEC-007)',
      statutoryReference: 'DEC-007, TEST-106',
      isPassed: input.rpoHours <= 24 && input.rtoHours <= 72,
      metricValue: `RPO: ${input.rpoHours}h (<=24h) · RTO: ${input.rtoHours}h (<=72h)`,
      details: 'Clean sandbox restoration drill verified meeting recovery point and time objectives.',
    },
    {
      key: 'HARASSMENT_VAULT_ISOLATION',
      title: 'Harassment Prevention Vault RBAC Lockout (REQ-080)',
      statutoryReference: 'REQ-080, TEST-076',
      isPassed: input.adminLockedOutOfHarassmentVault,
      metricValue: input.adminLockedOutOfHarassmentVault ? 'ADMIN Strictly Blocked' : 'Vulnerable',
      details: 'AES-256-GCM envelope encryption with technical ADMIN server-side access block.',
    },
    {
      key: 'AFPM_DUAL_APPROVALS',
      title: 'AFPM Dual-Approval Financial Disbursements (INV-06)',
      statutoryReference: 'INV-06, REQ-086, TEST-078',
      isPassed: input.dualControlDisbursementsEnforced,
      metricValue: input.dualControlDisbursementsEnforced ? 'Dual Control Active' : 'Self-Approval Risk',
      details: 'Two distinct officer sign-offs mandated; self-approval strictly prevented.',
    },
    {
      key: 'OPEN_DATA_PORTABILITY',
      title: 'Full Open Data Export Portability (REQ-116)',
      statutoryReference: 'REQ-116, TEST-112',
      isPassed: input.openDataPortabilityVerified,
      metricValue: input.openDataPortabilityVerified ? 'Zero Lock-in Portability' : 'Unverified Export',
      details: 'Comprehensive JSON payload and CSV manifest export for complete tenant autonomy.',
    },
    {
      key: 'TEST_SUITE_PASS_RATE',
      title: 'Automated Test Suite Pass Rate (100% Pass)',
      statutoryReference: 'Section 12, CI/CD Gate',
      isPassed: input.testSuitesPassedPercent === 100,
      metricValue: `${input.testSuitesPassedPercent}% Pass Rate`,
      details: 'All automated unit, integration, and E2E test suites executing with zero failures.',
    },
  ];

  const allPassed = criteria.every((c) => c.isPassed);

  const certData = {
    certificateId: `GATE-G9-MOROCCO-${termCode.replace(/\//g, '-')}`,
    entity: 'AIESEC in Morocco (MC Morocco)' as const,
    termCode,
    status: (allPassed ? 'AWAITING_SIGNATURES' : 'AUDIT_IN_PROGRESS') as GateG9Certification['status'],
    criteria,
    signers: {},
    isFullySigned: false,
  };

  const masterChecksumSha256 = computeSha256(certData);

  return {
    ...certData,
    masterChecksumSha256,
  };
}

/**
 * Signs the Gate G9 Certification by one of the 4 designated national executives.
 */
export function signGateG9Certification(
  cert: GateG9Certification,
  signerInfo: {
    userId: string;
    fullName: string;
    role: NationalSignerRole;
    email: string;
  }
): { success: boolean; certificate?: GateG9Certification; error?: string } {
  // Validate email domain
  if (!signerInfo.email.endsWith('@aiesec.net')) {
    return {
      success: false,
      error: `Signatory Authorization Error: Email ${signerInfo.email} must belong to @aiesec.net domain.`,
    };
  }

  // Validate criteria status
  const unpassed = cert.criteria.filter((c) => !c.isPassed);
  if (unpassed.length > 0) {
    return {
      success: false,
      error: `Cannot sign Gate G9: ${unpassed.length} mandatory criteria are unfulfilled.`,
    };
  }

  const now = new Date().toISOString();
  const signatureSha256 = computeSha256(
    `${signerInfo.userId}:${signerInfo.role}:${cert.certificateId}:${now}`
  );

  const nationalSigner: NationalSigner = {
    userId: signerInfo.userId,
    fullName: signerInfo.fullName,
    role: signerInfo.role,
    email: signerInfo.email,
    signedAt: now,
    signatureSha256,
  };

  const updatedSigners = { ...cert.signers };

  switch (signerInfo.role) {
    case 'MCP':
      updatedSigners.mcp = nationalSigner;
      break;
    case 'MCVP_ICX':
      updatedSigners.mcvpIcx = nationalSigner;
      break;
    case 'MCVP_FNL':
      updatedSigners.mcvpFnL = nationalSigner;
      break;
    case 'ECB_CHAIR':
      updatedSigners.ecbChair = nationalSigner;
      break;
  }

  const isFullySigned = Boolean(
    updatedSigners.mcp &&
    updatedSigners.mcvpIcx &&
    updatedSigners.mcvpFnL &&
    updatedSigners.ecbChair
  );

  const updatedCert: GateG9Certification = {
    ...cert,
    signers: updatedSigners,
    isFullySigned,
    status: isFullySigned ? 'OFFICIALLY_CERTIFIED' : 'AWAITING_SIGNATURES',
    certifiedAt: isFullySigned ? now : undefined,
  };

  updatedCert.masterChecksumSha256 = computeSha256({
    certificateId: updatedCert.certificateId,
    entity: updatedCert.entity,
    termCode: updatedCert.termCode,
    status: updatedCert.status,
    criteria: updatedCert.criteria,
    signers: updatedCert.signers,
    isFullySigned: updatedCert.isFullySigned,
    certifiedAt: updatedCert.certifiedAt,
  });

  return {
    success: true,
    certificate: updatedCert,
  };
}

/**
 * Verifies certificate integrity and proves zero tampering.
 */
export function verifyCertificateIntegrity(cert: GateG9Certification): boolean {
  if (!cert.isFullySigned) {
    return false;
  }

  const expectedChecksum = computeSha256({
    certificateId: cert.certificateId,
    entity: cert.entity,
    termCode: cert.termCode,
    status: cert.status,
    criteria: cert.criteria,
    signers: cert.signers,
    isFullySigned: cert.isFullySigned,
    certifiedAt: cert.certifiedAt,
  });

  return cert.masterChecksumSha256 === expectedChecksum;
}
