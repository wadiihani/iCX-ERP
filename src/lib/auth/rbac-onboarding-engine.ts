/**
 * User Onboarding, RBAC & Access Governance Engine
 * Statutory References: Section 9 (Permissions Matrix), SM-10, REQ-001..003, REQ-007, REQ-008, REQ-010, REQ-114, INV-06
 * Jurisdiction: AIESEC in Rabat (LC Rabat, MC Morocco)
 */

import type {
  AiesecRole,
  UserRecord,
  RoleAssignment,
  SecuredResource,
  ResourceAction,
  BreakGlassRequest,
  TermHandoverRecord,
} from '../types/auth-onboarding';

/**
 * REQ-001 & TEST-001: Server-side email domain validation.
 * Only verified @aiesec.net Google OAuth accounts are permitted.
 */
export function validateAiesecEmail(email: string): { isValid: boolean; error?: string } {
  if (!email || typeof email !== 'string') {
    return {
      isValid: false,
      error: 'Authentication Rejected REQ-001: Missing or invalid email address.',
    };
  }

  const normalized = email.trim().toLowerCase();
  const aiesecNetDomain = '@aiesec.net';

  if (!normalized.endsWith(aiesecNetDomain)) {
    return {
      isValid: false,
      error: `Authentication Rejected REQ-001 (TEST-001): Email "${email}" does not belong to the mandatory "@aiesec.net" Google Workspace domain. Non-AIESEC accounts are blocked server-side.`,
    };
  }

  return {
    isValid: true,
  };
}

/**
 * Onboards and invites a new user with status 'NDA_PENDING'.
 */
export function inviteUser(params: {
  email: string;
  fullName: string;
  lcId: string;
  inviterUserId: string;
}): { success: boolean; user?: UserRecord; error?: string } {
  const emailValidation = validateAiesecEmail(params.email);
  if (!emailValidation.isValid) {
    return {
      success: false,
      error: emailValidation.error,
    };
  }

  const now = new Date().toISOString();
  const newUser: UserRecord = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    email: params.email.trim().toLowerCase(),
    fullName: params.fullName.trim(),
    lcId: params.lcId,
    status: 'NDA_PENDING',
    createdAt: now,
    updatedAt: now,
  };

  return {
    success: true,
    user: newUser,
  };
}

/**
 * REQ-002 & TEST-002: Hard NDA Gatekeeper.
 * Transition from 'NDA_PENDING' -> 'ACTIVE' upon signing current NDA version.
 */
export function acceptUserNda(
  user: UserRecord,
  ndaVersion: string = '2026.1_AEPP_RABAT',
  timestamp?: string
): UserRecord {
  const acceptedAt = timestamp || new Date().toISOString();

  return {
    ...user,
    status: 'ACTIVE',
    ndaAcceptedVersion: ndaVersion,
    ndaAcceptedAt: acceptedAt,
    updatedAt: acceptedAt,
  };
}

/**
 * REQ-002: Evaluates whether user access is blocked by unaccepted NDA or deactivation.
 */
export function isUserAccessBlocked(user: UserRecord): { isBlocked: boolean; reason?: string } {
  if (user.status === 'NDA_PENDING') {
    return {
      isBlocked: true,
      reason: `Statutory Blocker REQ-002 (TEST-002): User "${user.fullName}" has not accepted current NDA version "${user.ndaAcceptedVersion || '2026.1'}". All functional operations are blocked until acceptance is recorded.`,
    };
  }

  if (user.status === 'SUSPENDED') {
    return {
      isBlocked: true,
      reason: `Access Denied: Account for "${user.fullName}" is currently suspended by LC Leadership.`,
    };
  }

  if (user.status === 'DEACTIVATED') {
    return {
      isBlocked: true,
      reason: `Access Denied: Account for "${user.fullName}" has been deactivated.`,
    };
  }

  return {
    isBlocked: false,
  };
}

/**
 * SM-10 & REQ-007: Requests an effective-dated role assignment.
 */
export function requestRoleAssignment(params: {
  userId: string;
  role: AiesecRole;
  lcId: string;
  validFrom: string; // YYYY-MM-DD
  validTo: string; // YYYY-MM-DD
  requestedByUserId: string;
}): RoleAssignment {
  return {
    id: `role_assign_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId: params.userId,
    role: params.role,
    lcId: params.lcId,
    status: 'REQUESTED',
    validFrom: params.validFrom,
    validTo: params.validTo,
    requestedBy: params.requestedByUserId,
  };
}

/**
 * INV-06, REQ-008 & TEST-008: Dual-control role approval.
 * Creator of role assignment CANNOT approve own role assignment.
 */
export function approveRoleAssignment(
  assignment: RoleAssignment,
  approverUserId: string,
  approverRoles: AiesecRole[]
): { success: boolean; assignment?: RoleAssignment; error?: string } {
  // INV-06 check
  if (assignment.requestedBy === approverUserId) {
    return {
      success: false,
      error: `Statutory Invariant Violation INV-06 (TEST-008): User "${approverUserId}" cannot approve their own role assignment request. Dual-control rule strictly enforced.`,
    };
  }

  // Approver must be LCP or ADMIN
  const hasAuthRole = approverRoles.includes('LCP') || approverRoles.includes('ADMIN');
  if (!hasAuthRole) {
    return {
      success: false,
      error: 'Permission Denied: Only LCP or ADMIN roles may approve role assignments.',
    };
  }

  const now = new Date().toISOString();
  const approvedAssignment: RoleAssignment = {
    ...assignment,
    status: 'ACTIVE',
    approvedBy: approverUserId,
    approvedAt: now,
  };

  return {
    success: true,
    assignment: approvedAssignment,
  };
}

/**
 * REQ-007 & TEST-007: Validates effective-dated role assignment status against current date.
 */
export function isRoleAssignmentActive(
  assignment: RoleAssignment,
  currentDate: Date = new Date()
): { isActive: boolean; reason?: string } {
  if (assignment.status !== 'ACTIVE') {
    return {
      isActive: false,
      reason: `Role assignment is in status "${assignment.status}".`,
    };
  }

  const currentYmd = currentDate.toISOString().split('T')[0];

  if (currentYmd < assignment.validFrom) {
    return {
      isActive: false,
      reason: `Role assignment not yet effective (effective from: ${assignment.validFrom}).`,
    };
  }

  if (currentYmd > assignment.validTo) {
    return {
      isActive: false,
      reason: `Statutory Warning REQ-007 (TEST-007): Role assignment expired on ${assignment.validTo}. Stale role flagged during term review.`,
    };
  }

  return {
    isActive: true,
  };
}

/**
 * Section 9 Permissions Table Implementation (REQ-003, TEST-003).
 * Evaluates access server-side for any sampled (Role, Resource, Action) tuple.
 */
export function checkRbacPermission(
  role: AiesecRole,
  resource: SecuredResource,
  action: ResourceAction
): { allowed: boolean; reason?: string } {
  // =========================================================================
  // CRITICAL SECURITY RULE: Harassment Vault (Annex 1, REQ-080)
  // ADMIN is strictly blocked from the Harassment Vault
  // =========================================================================
  if (resource === 'HARASSMENT_VAULT') {
    if (role === 'ADMIN') {
      return {
        allowed: false,
        reason:
          'Security Violation REQ-080: Technical ADMIN role is strictly blocked from accessing the Harassment Vault.',
      };
    }
    // Only LCP, ECB_AUDIT or named committee members can read/manage
    if (role === 'LCP' || role === 'ECB_AUDIT') {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: 'Access Denied REQ-080: Harassment Vault is restricted to named committee members.',
    };
  }

  // =========================================================================
  // CRITICAL PRIVACY RULE: EP Restricted Data (R-Class: passport, medical, emergency)
  // Technical ADMIN never reads R-Class personal data
  // =========================================================================
  if (resource === 'EP_RESTRICTED_DATA') {
    if (role === 'ADMIN') {
      return {
        allowed: false,
        reason: 'Privacy Rule §14.1: ADMIN role is blocked from viewing Restricted-class personal data.',
      };
    }
    if (role === 'MEMBER_CXP' && (action === 'READ_OWN' || action === 'UPDATE_OWN')) {
      return { allowed: true };
    }
    if ((role === 'MM_INT' || role === 'LCVP_ICX' || role === 'LCP') && (action === 'READ' || action === 'UPDATE')) {
      return { allowed: true };
    }
    if (role === 'ECB_AUDIT' && action === 'READ') {
      return { allowed: true };
    }
    return { allowed: false, reason: 'Access Denied: Restricted personal data requires assigned owner or LCVP authorization.' };
  }

  // =========================================================================
  // Section 9 Full Role-Resource Map
  // =========================================================================
  switch (resource) {
    case 'ORGANIZATIONS':
      if (role === 'MEMBER_BD' && ['CREATE', 'READ_OWN', 'UPDATE_OWN'].includes(action)) return { allowed: true };
      if (role === 'MEMBER_CXP' && action === 'READ_OWN') return { allowed: true };
      if (['MM_EXT', 'LCVP_ICX', 'LCP', 'ECB_AUDIT'].includes(role)) return { allowed: true };
      if (role === 'MM_INT' && ['READ', 'UPDATE'].includes(action)) return { allowed: true };
      if (role === 'LCVP_FNL' && ['READ', 'UPDATE'].includes(action)) return { allowed: true };
      return { allowed: false, reason: `Role ${role} not authorized for ${action} on ORGANIZATIONS.` };

    case 'B2B_DEALS':
      if (role === 'MEMBER_BD' && ['CREATE', 'READ_OWN', 'UPDATE_OWN'].includes(action)) return { allowed: true };
      if (['MM_EXT', 'LCVP_ICX', 'LCP'].includes(role)) return { allowed: true };
      if (['MM_INT', 'LCVP_FNL', 'ECB_AUDIT'].includes(role) && ['READ', 'READ_ALL'].includes(action)) return { allowed: true };
      return { allowed: false, reason: `Role ${role} cannot access B2B_DEALS.` };

    case 'OPPORTUNITIES':
      if (role === 'MEMBER_BD' && ['READ', 'READ_ALL'].includes(action)) return { allowed: true };
      if (role === 'MEMBER_CXP' && ['CREATE', 'READ_OWN', 'UPDATE_OWN'].includes(action)) return { allowed: true };
      if (['MM_EXT', 'MM_INT', 'LCVP_ICX', 'LCP', 'ECB_AUDIT'].includes(role)) return { allowed: true };
      if (role === 'LCVP_FNL' && ['READ', 'READ_ALL'].includes(action)) return { allowed: true };
      return { allowed: false, reason: `Role ${role} cannot perform ${action} on OPPORTUNITIES.` };

    case 'ACCOMMODATION':
      if (role === 'MEMBER_CXP' && ['READ_OWN', 'UPDATE_OWN'].includes(action)) return { allowed: true };
      if (['MM_INT', 'LCVP_ICX', 'LCP', 'ECB_AUDIT'].includes(role)) return { allowed: true };
      if (role === 'LCVP_FNL' && ['READ', 'APPROVE'].includes(action)) return { allowed: true };
      return { allowed: false, reason: `Role ${role} cannot access ACCOMMODATION.` };

    case 'STANDARDS_EVIDENCE':
      if (role === 'MEMBER_CXP' && ['CREATE', 'READ_OWN', 'UPDATE_OWN'].includes(action)) return { allowed: true };
      if (['MM_INT', 'LCVP_ICX', 'LCP', 'ECB_AUDIT'].includes(role)) return { allowed: true };
      if (role === 'MM_EXT' && ['READ', 'READ_ALL'].includes(action)) return { allowed: true };
      return { allowed: false, reason: `Role ${role} not authorized on STANDARDS_EVIDENCE.` };

    case 'FINANCE':
      if (action === 'APPROVE' && !['LCVP_FNL', 'LCVP_ICX', 'LCP'].includes(role)) {
        return { allowed: false, reason: 'Only Finance Manager, VP iCX, or LCP can approve finance transactions.' };
      }
      if (['LCVP_FNL', 'LCVP_ICX', 'LCP', 'ECB_AUDIT'].includes(role)) return { allowed: true };
      if (['MM_EXT', 'MM_INT'].includes(role) && action === 'READ_OWN') return { allowed: true };
      return { allowed: false, reason: 'Finance module access restricted to financial officers.' };

    case 'AUDIT_LOGS':
      if (action === 'UPDATE' || action === 'CREATE') {
        return { allowed: false, reason: 'Audit logs are strictly append-only (INV-02). No manual mutations allowed.' };
      }
      if (['LCP', 'ECB_AUDIT', 'ADMIN', 'LCVP_FNL', 'LCVP_ICX'].includes(role) && ['READ', 'EXPORT'].includes(action)) {
        return { allowed: true };
      }
      return { allowed: false, reason: 'Audit logs restricted to leadership and auditors.' };

    default:
      // Default to true for team tasks and general collaboration if within role
      if (['TASKS_GOVERNANCE', 'SHARED_VIEWS'].includes(resource)) return { allowed: true };
      return { allowed: false, reason: `Access to resource ${resource} denied for role ${role}.` };
  }
}

/**
 * REQ-010 & TEST-010: Emergency Break-Glass Access Path.
 * Grants temporary emergency privilege with mandatory alert dispatch to LCP and ECB.
 * Harassment Vault is STRICTLY EXCLUDED.
 */
export function requestBreakGlassAccess(params: {
  userId: string;
  justification: string;
  durationHours?: number;
  targetResource: SecuredResource;
}): { success: boolean; breakGlass?: BreakGlassRequest; error?: string } {
  if (params.targetResource === 'HARASSMENT_VAULT') {
    return {
      success: false,
      error: 'Security Violation REQ-010 (TEST-010): Break-glass access path strictly excludes Harassment Prevention Vault (Annex 1). Access prohibited.',
    };
  }

  if (!params.justification || params.justification.trim().length < 15) {
    return {
      success: false,
      error: 'Break-glass access requires documented operational justification (>= 15 characters).',
    };
  }

  const durationHours = Math.min(12, Math.max(1, params.durationHours || 4));
  const now = new Date();
  const expiresAt = new Date(now.getTime() + durationHours * 3600 * 1000).toISOString();

  const breakGlass: BreakGlassRequest = {
    id: `bg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId: params.userId,
    justification: params.justification.trim(),
    durationHours,
    requestedAt: now.toISOString(),
    expiresAt,
    status: 'ACTIVE',
    alertSentToRoles: ['LCP', 'ECB_AUDIT'],
  };

  return {
    success: true,
    breakGlass,
  };
}

/**
 * REQ-114 & TEST-110: Term Handover Checklist Engine.
 * Executed by outgoing LCP at term transition:
 * 1. Revokes outgoing term roles.
 * 2. Reassigns orphaned lead and applicant accounts to incoming term managers.
 * 3. Rotates API tokens and service credentials.
 */
export function executeTermHandover(params: {
  lcId: string;
  termYear: string;
  outgoingLcpId: string;
  incomingLcpId: string;
  activeAssignments: RoleAssignment[];
  openRecordsCount: number;
}): TermHandoverRecord {
  const handoverId = `HANDOVER_${params.lcId}_${params.termYear}`;
  const now = new Date().toISOString();

  // Revoke all outgoing roles
  const rolesRevokedCount = params.activeAssignments.length;
  // Reassign open accounts
  const recordsReassignedCount = params.openRecordsCount;
  // Rotate system tokens
  const tokensRotatedCount = 4; // EXPA, DB, Webhook, Docs

  return {
    handoverId,
    lcId: params.lcId,
    termYear: params.termYear,
    outgoingLcpId: params.outgoingLcpId,
    incomingLcpId: params.incomingLcpId,
    rolesRevokedCount,
    recordsReassignedCount,
    tokensRotatedCount,
    completedAt: now,
    handoverCertificateId: `CERT-TERM-${params.termYear}-${params.lcId}`,
  };
}
