/**
 * User Onboarding, Server-Side RBAC, Term Handover & Usability Suite
 * Statutory References: Section 9, SM-10, REQ-001..003, REQ-007, REQ-008, REQ-010, REQ-114, TEST-001..010, TEST-117
 * Jurisdiction: AIESEC in Rabat (LC Rabat, MC Morocco)
 */

import { describe, it, expect } from 'vitest';
import {
  validateAiesecEmail,
  inviteUser,
  acceptUserNda,
  isUserAccessBlocked,
  requestRoleAssignment,
  approveRoleAssignment,
  isRoleAssignmentActive,
  checkRbacPermission,
  requestBreakGlassAccess,
  executeTermHandover,
} from '../src/lib/auth/rbac-onboarding-engine';
import {
  runBdMemberJourney,
  runCxpMemberJourney,
  runLcvpIgvJourney,
  generateUsabilitySessionReport,
} from '../src/lib/pilot/usability-engine';
import { EXCHANGE_STANDARDS_CATALOG } from '../src/lib/standards/standards-catalog';
import type { StandardsMatrixRow } from '../src/lib/types/standards';
import type { ArrivalReadinessRecord } from '../src/lib/types/arrival-readiness';

describe('Plan 04-02: User Onboarding, RBAC & Pilot Usability Suite', () => {
  describe('REQ-001 & TEST-001: Server-Side Email Domain Validation', () => {
    it('accepts valid @aiesec.net email addresses', () => {
      const res = validateAiesecEmail('amine.daoudi@aiesec.net');
      expect(res.isValid).toBe(true);
      expect(res.error).toBeUndefined();
    });

    it('rejects non-aiesec.net email addresses server-side', () => {
      const res1 = validateAiesecEmail('amine.daoudi@gmail.com');
      expect(res1.isValid).toBe(false);
      expect(res1.error).toContain('REQ-001');

      const res2 = validateAiesecEmail('hacker@aiesec.org');
      expect(res2.isValid).toBe(false);

      const res3 = validateAiesecEmail('');
      expect(res3.isValid).toBe(false);
    });

    it('invites new user into NDA_PENDING state', () => {
      const res = inviteUser({
        email: 'salma.bennani@aiesec.net',
        fullName: 'Salma Bennani',
        lcId: 'lc_rabat',
        inviterUserId: 'usr_lcp_001',
      });

      expect(res.success).toBe(true);
      expect(res.user?.status).toBe('NDA_PENDING');
      expect(res.user?.email).toBe('salma.bennani@aiesec.net');
    });
  });

  describe('REQ-002 & TEST-002: Hard NDA Gatekeeper', () => {
    it('blocks all operations when user is in NDA_PENDING state', () => {
      const { user } = inviteUser({
        email: 'salma.bennani@aiesec.net',
        fullName: 'Salma Bennani',
        lcId: 'lc_rabat',
        inviterUserId: 'usr_lcp_001',
      });

      const gateCheck = isUserAccessBlocked(user!);
      expect(gateCheck.isBlocked).toBe(true);
      expect(gateCheck.reason).toContain('REQ-002');
    });

    it('unblocks user once current NDA is accepted and recorded', () => {
      const { user } = inviteUser({
        email: 'salma.bennani@aiesec.net',
        fullName: 'Salma Bennani',
        lcId: 'lc_rabat',
        inviterUserId: 'usr_lcp_001',
      });

      const activeUser = acceptUserNda(user!, '2026.1_AEPP_RABAT');
      expect(activeUser.status).toBe('ACTIVE');
      expect(activeUser.ndaAcceptedVersion).toBe('2026.1_AEPP_RABAT');

      const gateCheck = isUserAccessBlocked(activeUser);
      expect(gateCheck.isBlocked).toBe(false);
    });

    it('blocks suspended or deactivated users regardless of NDA acceptance', () => {
      const user = acceptUserNda({
        id: 'usr_suspended',
        email: 'suspended@aiesec.net',
        fullName: 'Suspended Member',
        lcId: 'lc_rabat',
        status: 'SUSPENDED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      user.status = 'SUSPENDED';

      expect(isUserAccessBlocked(user).isBlocked).toBe(true);
    });
  });

  describe('REQ-003 & TEST-003: Server-Side RBAC Enforcement (§9 Permissions)', () => {
    it('STRICTLY BLOCKS technical ADMIN from Harassment Vault (Annex 1, REQ-080)', () => {
      const check = checkRbacPermission('ADMIN', 'HARASSMENT_VAULT', 'READ');
      expect(check.allowed).toBe(false);
      expect(check.reason).toContain('REQ-080');
    });

    it('allows LCP and ECB_AUDIT to access Harassment Vault', () => {
      expect(checkRbacPermission('LCP', 'HARASSMENT_VAULT', 'READ').allowed).toBe(true);
      expect(checkRbacPermission('ECB_AUDIT', 'HARASSMENT_VAULT', 'READ').allowed).toBe(true);
      expect(checkRbacPermission('MEMBER_BD', 'HARASSMENT_VAULT', 'READ').allowed).toBe(false);
    });

    it('STRICTLY BLOCKS technical ADMIN from EP Restricted Data (§14.1)', () => {
      const check = checkRbacPermission('ADMIN', 'EP_RESTRICTED_DATA', 'READ');
      expect(check.allowed).toBe(false);
      expect(check.reason).toContain('Privacy Rule §14.1');
    });

    it('enforces role separation between BD and CXP', () => {
      // BD can manage deals and organizations
      expect(checkRbacPermission('MEMBER_BD', 'ORGANIZATIONS', 'CREATE').allowed).toBe(true);
      expect(checkRbacPermission('MEMBER_BD', 'B2B_DEALS', 'CREATE').allowed).toBe(true);

      // BD cannot manage standards evidence
      expect(checkRbacPermission('MEMBER_BD', 'STANDARDS_EVIDENCE', 'CREATE').allowed).toBe(false);

      // CXP can manage standards evidence and readiness
      expect(checkRbacPermission('MEMBER_CXP', 'STANDARDS_EVIDENCE', 'CREATE').allowed).toBe(true);
      expect(checkRbacPermission('MEMBER_CXP', 'EP_RESTRICTED_DATA', 'READ_OWN').allowed).toBe(true);

      // CXP cannot access B2B deals
      expect(checkRbacPermission('MEMBER_CXP', 'B2B_DEALS', 'READ').allowed).toBe(false);
    });

    it('enforces finance approval restriction to finance officers & VP', () => {
      expect(checkRbacPermission('LCVP_FNL', 'FINANCE', 'APPROVE').allowed).toBe(true);
      expect(checkRbacPermission('LCVP_ICX', 'FINANCE', 'APPROVE').allowed).toBe(true);
      expect(checkRbacPermission('LCP', 'FINANCE', 'APPROVE').allowed).toBe(true);
      expect(checkRbacPermission('MEMBER_BD', 'FINANCE', 'APPROVE').allowed).toBe(false);
    });

    it('protects audit logs from manual modification (INV-02 append-only)', () => {
      expect(checkRbacPermission('ADMIN', 'AUDIT_LOGS', 'CREATE').allowed).toBe(false);
      expect(checkRbacPermission('ADMIN', 'AUDIT_LOGS', 'UPDATE').allowed).toBe(false);
      expect(checkRbacPermission('ADMIN', 'AUDIT_LOGS', 'READ').allowed).toBe(true);
    });
  });

  describe('REQ-007 & TEST-007: Effective Dates & Stale Role Detection', () => {
    it('accurately evaluates active, future, and expired role assignments', () => {
      const activeAssignment = {
        id: 'ra_1',
        userId: 'usr_1',
        role: 'MEMBER_BD' as const,
        lcId: 'lc_rabat',
        status: 'ACTIVE' as const,
        validFrom: '2026-01-01',
        validTo: '2026-12-31',
        requestedBy: 'usr_lcp',
      };

      const nowMidTerm = new Date('2026-06-15');
      expect(isRoleAssignmentActive(activeAssignment, nowMidTerm).isActive).toBe(true);

      const beforeTerm = new Date('2025-11-01');
      expect(isRoleAssignmentActive(activeAssignment, beforeTerm).isActive).toBe(false);

      const afterTerm = new Date('2027-01-15');
      const expiredCheck = isRoleAssignmentActive(activeAssignment, afterTerm);
      expect(expiredCheck.isActive).toBe(false);
      expect(expiredCheck.reason).toContain('expired');
    });
  });

  describe('REQ-008 & TEST-008: Dual-Control Role Approval (INV-06)', () => {
    it('PROHIBITS user from approving their own role assignment request', () => {
      const assignment = requestRoleAssignment({
        userId: 'usr_vp_001',
        role: 'LCVP_ICX',
        lcId: 'lc_rabat',
        validFrom: '2026-02-01',
        validTo: '2027-01-31',
        requestedByUserId: 'usr_vp_001',
      });

      const selfApproval = approveRoleAssignment(assignment, 'usr_vp_001', ['ADMIN']);
      expect(selfApproval.success).toBe(false);
      expect(selfApproval.error).toContain('INV-06');
    });

    it('allows independent authorized officer (LCP) to approve assignment', () => {
      const assignment = requestRoleAssignment({
        userId: 'usr_member_002',
        role: 'MEMBER_CXP',
        lcId: 'lc_rabat',
        validFrom: '2026-02-01',
        validTo: '2027-01-31',
        requestedByUserId: 'usr_vp_001',
      });

      const approval = approveRoleAssignment(assignment, 'usr_lcp_001', ['LCP']);
      expect(approval.success).toBe(true);
      expect(approval.assignment?.status).toBe('ACTIVE');
      expect(approval.assignment?.approvedBy).toBe('usr_lcp_001');
    });
  });

  describe('REQ-010 & TEST-010: Emergency Break-Glass Access Path', () => {
    it('STRICTLY PROHIBITS break-glass access to Harassment Vault (Annex 1)', () => {
      const res = requestBreakGlassAccess({
        userId: 'usr_vp_001',
        justification: 'Emergency audit investigation needed for critical case',
        durationHours: 4,
        targetResource: 'HARASSMENT_VAULT',
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain('REQ-010');
      expect(res.error).toContain('prohibited');
    });

    it('grants time-limited break-glass for operational resources and alerts LCP/ECB', () => {
      const res = requestBreakGlassAccess({
        userId: 'usr_vp_001',
        justification: 'System offline drill requires immediate configuration override',
        durationHours: 3,
        targetResource: 'CONFIG_THRESHOLDS',
      });

      expect(res.success).toBe(true);
      expect(res.breakGlass?.durationHours).toBe(3);
      expect(res.breakGlass?.alertSentToRoles).toEqual(['LCP', 'ECB_AUDIT']);
    });

    it('rejects break-glass without documented justification', () => {
      const res = requestBreakGlassAccess({
        userId: 'usr_vp_001',
        justification: 'too short',
        durationHours: 2,
        targetResource: 'FINANCE',
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain('justification');
    });
  });

  describe('REQ-114 & TEST-110: Term Handover Checklist Engine', () => {
    it('executes atomic term handover checklist and produces signed certificate', () => {
      const mockActiveAssignments = [
        { id: '1', userId: 'u1', role: 'MEMBER_BD' as const, lcId: 'lc_rabat', status: 'ACTIVE' as const, validFrom: '2025-02-01', validTo: '2026-01-31', requestedBy: 'lcp1' },
        { id: '2', userId: 'u2', role: 'MEMBER_CXP' as const, lcId: 'lc_rabat', status: 'ACTIVE' as const, validFrom: '2025-02-01', validTo: '2026-01-31', requestedBy: 'lcp1' },
        { id: '3', userId: 'u3', role: 'LCVP_ICX' as const, lcId: 'lc_rabat', status: 'ACTIVE' as const, validFrom: '2025-02-01', validTo: '2026-01-31', requestedBy: 'lcp1' },
      ];

      const handover = executeTermHandover({
        lcId: 'lc_rabat',
        termYear: '2025-2026',
        outgoingLcpId: 'usr_lcp_outgoing',
        incomingLcpId: 'usr_lcp_incoming',
        activeAssignments: mockActiveAssignments,
        openRecordsCount: 14,
      });

      expect(handover.handoverId).toBe('HANDOVER_lc_rabat_2025-2026');
      expect(handover.rolesRevokedCount).toBe(3);
      expect(handover.recordsReassignedCount).toBe(14);
      expect(handover.tokensRotatedCount).toBe(4);
      expect(handover.handoverCertificateId).toContain('CERT-TERM-2025-2026-lc_rabat');
    });
  });

  describe('TEST-117: Usability Journeys Execution (BD, CXP, LCVP)', () => {
    it('executes Journey 1 (BD Member) with 100% completion rate and zero blocking defects', () => {
      const bdMember = {
        id: 'usr_bd_01',
        name: 'Othmane Chraibi',
        role: 'MEMBER_BD' as const,
        email: 'othmane.chraibi@aiesec.net',
      };

      const tasks = runBdMemberJourney(bdMember, {
        leadName: 'Tech Innovate SARL',
        iceNumber: '001523456000032',
        discoveryCompleted: true,
        proposalSent: true,
      });

      const report = generateUsabilitySessionReport('sess_bd_01', bdMember, tasks);
      expect(report.completedTasks.length).toBe(4);
      expect(report.overallSuccessRate).toBe(100);
      expect(report.totalBlockingDefects).toBe(0);
    });

    it('executes Journey 2 (CXP Member) with 100% completion rate and zero blocking defects', () => {
      const cxpMember = {
        id: 'usr_cxp_01',
        name: 'Kenza Tazi',
        role: 'MEMBER_CXP' as const,
        email: 'kenza.tazi@aiesec.net',
      };

      const appliedAt = '2026-03-01T10:00:00Z';
      const contactedAt = '2026-03-01T18:30:00Z'; // 8.5 hours (< 24h)

      const tasks = runCxpMemberJourney(cxpMember, {
        appliedAt,
        contactedAt,
        scorecardPass: true,
        day1Accompanied: true,
      });

      const report = generateUsabilitySessionReport('sess_cxp_01', cxpMember, tasks);
      expect(report.completedTasks.length).toBe(4);
      expect(report.overallSuccessRate).toBe(100);
      expect(report.totalBlockingDefects).toBe(0);
    });

    it('executes Journey 3 (LCVP iGV) with 100% completion rate and zero blocking defects', () => {
      const lcvp = {
        id: 'usr_vp_01',
        name: 'Youssef El Amrani',
        role: 'LCVP_ICX' as const,
        email: 'youssef.elamrani@aiesec.net',
      };

      const mockReadiness: ArrivalReadinessRecord = {
        applicationId: 'app_pilot_99',
        epId: 'ep_pilot_99',
        epName: 'Sofia Rossi',
        epGender: 'FEMALE',
        homeLc: 'AIESEC in Milan',
        opportunityTitle: 'Digital Innovator Rabat',
        realizationStartDate: '2026-07-01',
        op14dReconfirmedAt: '2026-06-15T10:00:00Z',
        provider14dReconfirmedAt: '2026-06-15T11:00:00Z',
        flightVerifiedAt: '2026-06-15T12:00:00Z',
        visaClearedAt: '2026-06-15T13:00:00Z',
        allocatedBedId: 'bed_agdal_01',
        pickupMission: {
          id: 'pm_99',
          applicationId: 'app_pilot_99',
          arrivalDateTime: '2026-07-01T14:00:00Z',
          transitPort: 'CMN_AIRPORT',
          flightOrTrainNumber: 'AT412',
          pickupBuddyId: 'usr_cxp_01',
          pickupBuddyName: 'Kenza Tazi',
          pickupBuddyPhone: '+212600112233',
          instructionsSentAt: '2026-06-28T10:00:00Z',
          pickupCompletedAt: null,
        },
      };

      // 18 standards matrix rows from the catalog
      const standardsRows: StandardsMatrixRow[] = EXCHANGE_STANDARDS_CATALOG.map((def) => ({
        definition: def,
        hasDiscrepancy: false,
        isDeliveredByHost: true,
        isConfirmedByEp: true,
      }));

      const tasks = runLcvpIgvJourney(lcvp, {
        readinessRecord: mockReadiness,
        standardsRows,
        currentDate: new Date('2026-06-17T12:00:00Z'),
      });

      const report = generateUsabilitySessionReport('sess_lcvp_01', lcvp, tasks);
      expect(report.completedTasks.length).toBe(3);
      expect(report.overallSuccessRate).toBe(100);
      expect(report.totalBlockingDefects).toBe(0);
    });
  });
});
