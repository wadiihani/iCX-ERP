/**
 * User Onboarding, RBAC & Usability Domain Types
 * Statutory Reference: Section 9, SM-10, REQ-001..003, REQ-007, REQ-008, REQ-010, REQ-114, TEST-001..010, TEST-117
 * Jurisdiction: AIESEC in Rabat (LC Rabat, MC Morocco)
 */

export type AiesecRole =
  | 'MEMBER_BD'
  | 'MEMBER_CXP'
  | 'MM_EXT'
  | 'MM_INT'
  | 'LCVP_ICX'
  | 'LCVP_FNL'
  | 'LCP'
  | 'ECB_AUDIT'
  | 'ADMIN';

export type UserStatus = 'INVITED' | 'NDA_PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';

export type RoleAssignmentStatus = 'REQUESTED' | 'APPROVED' | 'ACTIVE' | 'EXPIRED' | 'REVOKED';

export type SecuredResource =
  | 'ORGANIZATIONS'
  | 'B2B_DEALS'
  | 'AGREEMENTS'
  | 'OPPORTUNITIES'
  | 'IR_DIRECTORY'
  | 'EP_APPLICATIONS'
  | 'EP_READINESS'
  | 'EP_RESTRICTED_DATA'
  | 'ACCOMMODATION'
  | 'STANDARDS_EVIDENCE'
  | 'QUALITY_CASES'
  | 'HARASSMENT_VAULT'
  | 'FINANCE'
  | 'TASKS_GOVERNANCE'
  | 'CONFIG_THRESHOLDS'
  | 'AUDIT_LOGS'
  | 'SHARED_VIEWS';

export type ResourceAction =
  | 'CREATE'
  | 'READ'
  | 'READ_OWN'
  | 'READ_ALL'
  | 'UPDATE'
  | 'UPDATE_OWN'
  | 'APPROVE'
  | 'EXPORT';

export interface UserRecord {
  id: string;
  email: string;
  fullName: string;
  lcId: string;
  status: UserStatus;
  ndaAcceptedVersion?: string;
  ndaAcceptedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoleAssignment {
  id: string;
  userId: string;
  role: AiesecRole;
  lcId: string;
  status: RoleAssignmentStatus;
  validFrom: string; // YYYY-MM-DD
  validTo: string; // YYYY-MM-DD
  requestedBy: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface BreakGlassRequest {
  id: string;
  userId: string;
  justification: string;
  durationHours: number;
  requestedAt: string;
  expiresAt: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  alertSentToRoles: string[];
}

export interface TermHandoverRecord {
  handoverId: string;
  lcId: string;
  termYear: string;
  outgoingLcpId: string;
  incomingLcpId: string;
  rolesRevokedCount: number;
  recordsReassignedCount: number;
  tokensRotatedCount: number;
  completedAt: string;
  handoverCertificateId: string;
}

export interface UsabilityTaskResult {
  journeyId: string;
  role: AiesecRole;
  taskName: string;
  isSuccess: boolean;
  durationSeconds: number;
  blockingDefectsCount: number;
  notes: string;
}

export interface UsabilitySessionReport {
  sessionId: string;
  participantName: string;
  role: AiesecRole;
  completedTasks: UsabilityTaskResult[];
  overallSuccessRate: number;
  totalBlockingDefects: number;
  testedAt: string;
}
