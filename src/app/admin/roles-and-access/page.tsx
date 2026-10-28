'use client';

import React, { useState } from 'react';
import {
  Shield,
  UserCheck,
  KeyRound,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Lock,
  RefreshCw,
  Users,
  Award,
  ArrowRight,
  Send,
  Zap,
} from 'lucide-react';
import type {
  AiesecRole,
  UserRecord,
  RoleAssignment,
  BreakGlassRequest,
  TermHandoverRecord,
  UsabilitySessionReport,
} from '@/lib/types/auth-onboarding';
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
} from '@/lib/auth/rbac-onboarding-engine';
import {
  runBdMemberJourney,
  runCxpMemberJourney,
  runLcvpIgvJourney,
  generateUsabilitySessionReport,
} from '@/lib/pilot/usability-engine';

export default function RolesAndAccessPage() {
  const [activeTab, setActiveTab] = useState<'rbac' | 'onboarding' | 'breakglass' | 'handover' | 'usability'>('rbac');

  // Initial Seed Users
  const [users, setUsers] = useState<UserRecord[]>([
    {
      id: 'usr_lcp_001',
      email: 'lcp.rabat@aiesec.net',
      fullName: 'Youssef El Amrani',
      lcId: 'lc_rabat',
      status: 'ACTIVE',
      ndaAcceptedVersion: '2026.1_AEPP_RABAT',
      ndaAcceptedAt: '2026-01-15T09:00:00Z',
      createdAt: '2026-01-15T09:00:00Z',
      updatedAt: '2026-01-15T09:00:00Z',
    },
    {
      id: 'usr_bd_001',
      email: 'othmane.chraibi@aiesec.net',
      fullName: 'Othmane Chraibi',
      lcId: 'lc_rabat',
      status: 'ACTIVE',
      ndaAcceptedVersion: '2026.1_AEPP_RABAT',
      ndaAcceptedAt: '2026-01-20T11:00:00Z',
      createdAt: '2026-01-20T10:00:00Z',
      updatedAt: '2026-01-20T11:00:00Z',
    },
    {
      id: 'usr_cxp_001',
      email: 'kenza.tazi@aiesec.net',
      fullName: 'Kenza Tazi',
      lcId: 'lc_rabat',
      status: 'NDA_PENDING',
      createdAt: '2026-02-01T14:00:00Z',
      updatedAt: '2026-02-01T14:00:00Z',
    },
  ]);

  // Initial Seed Role Assignments
  const [assignments, setAssignments] = useState<RoleAssignment[]>([
    {
      id: 'ra_001',
      userId: 'usr_lcp_001',
      role: 'LCP',
      lcId: 'lc_rabat',
      status: 'ACTIVE',
      validFrom: '2026-02-01',
      validTo: '2027-01-31',
      requestedBy: 'usr_lcp_001',
      approvedBy: 'usr_ecb_audit',
      approvedAt: '2026-02-01T10:00:00Z',
    },
    {
      id: 'ra_002',
      userId: 'usr_bd_001',
      role: 'MEMBER_BD',
      lcId: 'lc_rabat',
      status: 'ACTIVE',
      validFrom: '2026-02-01',
      validTo: '2026-08-31',
      requestedBy: 'usr_lcp_001',
      approvedBy: 'usr_lcp_001',
      approvedAt: '2026-02-02T12:00:00Z',
    },
    {
      id: 'ra_003',
      userId: 'usr_cxp_001',
      role: 'MEMBER_CXP',
      lcId: 'lc_rabat',
      status: 'REQUESTED',
      validFrom: '2026-03-01',
      validTo: '2027-01-31',
      requestedBy: 'usr_bd_001',
    },
  ]);

  // Onboarding Form State
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [onboardMessage, setOnboardMessage] = useState<string | null>(null);

  // Break-Glass State
  const [bgResource, setBgResource] = useState<'CONFIG_THRESHOLDS' | 'FINANCE' | 'HARASSMENT_VAULT'>('CONFIG_THRESHOLDS');
  const [bgJustification, setBgJustification] = useState('');
  const [bgResult, setBgResult] = useState<string | null>(null);

  // Term Handover State
  const [handoverRecord, setHandoverRecord] = useState<TermHandoverRecord | null>(null);

  // Usability Testing State
  const [usabilityReports, setUsabilityReports] = useState<UsabilitySessionReport[]>([]);

  // Handlers
  const handleInviteUser = (e: React.FormEvent) => {
    e.preventDefault();
    const result = inviteUser({
      email: newEmail,
      fullName: newName,
      lcId: 'lc_rabat',
      inviterUserId: 'usr_lcp_001',
    });

    if (result.success && result.user) {
      setUsers((prev) => [...prev, result.user!]);
      setOnboardMessage(`User ${result.user.fullName} invited successfully (Status: NDA_PENDING).`);
      setNewEmail('');
      setNewName('');
    } else {
      setOnboardMessage(`Error: ${result.error}`);
    }
  };

  const handleAcceptNda = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? acceptUserNda(u, '2026.1_AEPP_RABAT') : u))
    );
  };

  const handleApproveRole = (assignment: RoleAssignment) => {
    // Current user acting as LCP
    const approverUserId = 'usr_lcp_001';
    const approverRoles: AiesecRole[] = ['LCP'];

    const res = approveRoleAssignment(assignment, approverUserId, approverRoles);
    if (res.success && res.assignment) {
      setAssignments((prev) =>
        prev.map((a) => (a.id === assignment.id ? res.assignment! : a))
      );
    } else {
      alert(res.error);
    }
  };

  const handleRequestBreakGlass = (e: React.FormEvent) => {
    e.preventDefault();
    const res = requestBreakGlassAccess({
      userId: 'usr_lcp_001',
      justification: bgJustification,
      durationHours: 4,
      targetResource: bgResource as any,
    });

    if (res.success && res.breakGlass) {
      setBgResult(`Break-glass active! ID: ${res.breakGlass.id}. Alert dispatched to: ${res.breakGlass.alertSentToRoles.join(', ')}`);
      setBgJustification('');
    } else {
      setBgResult(`BLOCKED: ${res.error}`);
    }
  };

  const handleExecuteHandover = () => {
    const record = executeTermHandover({
      lcId: 'lc_rabat',
      termYear: '2025-2026',
      outgoingLcpId: 'usr_lcp_001',
      incomingLcpId: 'usr_lcp_incoming',
      activeAssignments: assignments.filter((a) => a.status === 'ACTIVE'),
      openRecordsCount: 18,
    });
    setHandoverRecord(record);
  };

  const handleRunAllUsabilityJourneys = () => {
    const reports: UsabilitySessionReport[] = [];

    // 1. BD Journey
    const bdParticipant = { id: 'usr_bd_001', name: 'Othmane Chraibi', role: 'MEMBER_BD' as const, email: 'othmane.chraibi@aiesec.net' };
    const bdTasks = runBdMemberJourney(bdParticipant, {
      leadName: 'Maroc Telecom Innovation Lab',
      iceNumber: '001523456000032',
      discoveryCompleted: true,
      proposalSent: true,
    });
    reports.push(generateUsabilitySessionReport('SESS_BD_RABAT_01', bdParticipant, bdTasks));

    // 2. CXP Journey
    const cxpParticipant = { id: 'usr_cxp_001', name: 'Kenza Tazi', role: 'MEMBER_CXP' as const, email: 'kenza.tazi@aiesec.net' };
    const cxpTasks = runCxpMemberJourney(cxpParticipant, {
      appliedAt: '2026-03-01T08:00:00Z',
      contactedAt: '2026-03-01T15:30:00Z',
      scorecardPass: true,
      day1Accompanied: true,
    });
    reports.push(generateUsabilitySessionReport('SESS_CXP_RABAT_01', cxpParticipant, cxpTasks));

    // 3. LCVP Journey
    const lcvpParticipant = { id: 'usr_lcp_001', name: 'Youssef El Amrani', role: 'LCVP_ICX' as const, email: 'youssef.elamrani@aiesec.net' };
    const lcvpTasks = runLcvpIgvJourney(lcvpParticipant, {
      readinessRecord: {
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
        bedAllocationId: 'bed_agdal_01',
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
      },
      standardsRows: [
        {
          definition: {
            standardNumber: 1,
            standardName: 'Personal Goal Setting',
            stage: 'PREPARATION',
            isMandatory: true,
            description: 'Goal setting before departure',
            responsibleParty: 'SENDING_ENTITY',
            surveyStage: 'MIDDLE',
            appliesToPhysical: true,
            appliesToPartlyRemote: true,
            appliesToFullyRemote: true,
          } as any,
          hasDiscrepancy: false,
          isDeliveredByHost: true,
          isConfirmedByEp: true,
        },
        ...Array.from({ length: 17 }, (_, i) => ({
          definition: {
            standardNumber: (i + 2) as any,
            standardName: `Exchange Standard #${i + 2}`,
            stage: 'EXPERIENCE' as const,
            isMandatory: i < 12,
            description: `Statutory standard #${i + 2}`,
            responsibleParty: 'HOST_ENTITY',
            surveyStage: 'FINAL',
            appliesToPhysical: true,
            appliesToPartlyRemote: true,
            appliesToFullyRemote: true,
          } as any,
          hasDiscrepancy: false,
          isDeliveredByHost: true,
          isConfirmedByEp: true,
        })),
      ],
      currentDate: new Date('2026-06-17T12:00:00Z'),
    });
    reports.push(generateUsabilitySessionReport('SESS_LCVP_RABAT_01', lcvpParticipant, lcvpTasks));

    setUsabilityReports(reports);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              SCR-13 / SCR-37
            </span>
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              LC Rabat · MC Morocco
            </span>
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
              Section 9 & SM-10
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Roles, Access Governance & Usability Console
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Server-side RBAC, hard NDA gatekeeping, dual-control approval, and usability testing suite.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-slate-400">Jurisdiction Invariant</p>
            <p className="text-sm font-semibold text-emerald-400">INV-06 Dual Control Active</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
            <Shield className="w-5 h-5 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mt-6 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('rbac')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === 'rbac'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Lock className="w-4 h-4" />
          Role Governance & Approvals
        </button>
        <button
          onClick={() => setActiveTab('onboarding')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === 'onboarding'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          User Onboarding & NDA Gate
        </button>
        <button
          onClick={() => setActiveTab('breakglass')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === 'breakglass'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          Break-Glass Emergency
        </button>
        <button
          onClick={() => setActiveTab('handover')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === 'handover'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          Term Handover (REQ-114)
        </button>
        <button
          onClick={() => setActiveTab('usability')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === 'usability'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Award className="w-4 h-4" />
          Pilot Usability Testing (TEST-117)
        </button>
      </div>

      {/* Tab 1: RBAC Table */}
      {activeTab === 'rbac' && (
        <div className="mt-6 space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-100">
              <Shield className="w-5 h-5 text-blue-400" />
              Effective Role Assignments (SM-10 / Section 9)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Active assignments evaluated with effective dates. Pending roles require dual-control sign-off (INV-06).
            </p>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Assigned Role</th>
                    <th className="py-3 px-4">Effective Window</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Dual Control</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {assignments.map((a) => {
                    const user = users.find((u) => u.id === a.userId);
                    const activeCheck = isRoleAssignmentActive(a);
                    return (
                      <tr key={a.id} className="hover:bg-slate-800/30">
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-200">{user?.fullName || a.userId}</div>
                          <div className="text-xs text-slate-400">{user?.email}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-xs font-mono font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            {a.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs font-mono text-slate-300">
                          {a.validFrom} &rarr; {a.validTo}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${
                              a.status === 'ACTIVE'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : a.status === 'REQUESTED'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}
                          >
                            {a.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-400">
                          {a.approvedBy ? (
                            <span className="flex items-center gap-1 text-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Approved by {a.approvedBy}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-amber-400">
                              <AlertTriangle className="w-3.5 h-3.5" /> Pending approval
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {a.status === 'REQUESTED' && (
                            <button
                              onClick={() => handleApproveRole(a)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium transition"
                            >
                              Approve (LCP)
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-slate-200">Statutory RBAC Invariant Guarantees</h3>
              <ul className="mt-3 space-y-2 text-xs text-slate-400">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Harassment Vault (REQ-080):</strong> Technical ADMIN is strictly blocked server-side. Accessible only to LCP/ECB.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Restricted Personal Data (§14.1):</strong> Technical ADMIN blocked from passport and medical data.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Dual-Control (INV-06):</strong> Requesters cannot approve their own role assignments.</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-slate-200">Audit Log Append-Only Rule (INV-02)</h3>
              <p className="mt-2 text-xs text-slate-400">
                All role assignment updates, approvals, and revocations are dispatched to the SHA-256 hash-chained audit ledger.
                Direct mutations or deletions on <code>audit_events</code> are rejected server-side for all roles including ADMIN.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Onboarding & NDA Gate */}
      {activeTab === 'onboarding' && (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
              <h2 className="text-md font-semibold text-slate-100 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-400" />
                Invite Member (REQ-001)
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Only verified <code>@aiesec.net</code> Google Workspace addresses are permitted.
              </p>

              <form onSubmit={handleInviteUser} className="mt-4 space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Salma Bennani"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">AIESEC Net Email</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="salma.bennani@aiesec.net"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded py-2 text-xs font-medium flex items-center justify-center gap-2 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  Dispatch Invitation
                </button>
              </form>

              {onboardMessage && (
                <div className="mt-3 p-2.5 rounded bg-slate-800 text-xs border border-slate-700 text-slate-300">
                  {onboardMessage}
                </div>
              )}
            </div>

            <div className="md:col-span-2 bg-slate-900/60 border border-slate-800 rounded-xl p-5">
              <h2 className="text-md font-semibold text-slate-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                Member Registry & Hard NDA Gate (REQ-002)
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Members in <code>NDA_PENDING</code> are hard-blocked from accessing any operational modules.
              </p>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase">
                      <th className="py-2.5 px-3">Member</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">NDA Version</th>
                      <th className="py-2.5 px-3 text-right">Gate Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {users.map((u) => {
                      const blocked = isUserAccessBlocked(u);
                      return (
                        <tr key={u.id} className="hover:bg-slate-800/30">
                          <td className="py-2.5 px-3">
                            <div className="font-medium text-slate-200">{u.fullName}</div>
                            <div className="text-xs text-slate-400">{u.email}</div>
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium ${
                                u.status === 'ACTIVE'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}
                            >
                              {u.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-xs text-slate-300 font-mono">
                            {u.ndaAcceptedVersion || 'None'}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            {blocked.isBlocked ? (
                              <button
                                onClick={() => handleAcceptNda(u.id)}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium transition"
                              >
                                Record NDA Signature
                              </button>
                            ) : (
                              <span className="text-xs text-emerald-400 flex items-center justify-end gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Gate Passed
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Break-Glass Emergency */}
      {activeTab === 'breakglass' && (
        <div className="mt-6 max-w-2xl bg-slate-900/60 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-slate-100">Emergency Break-Glass Console (REQ-010)</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Grants time-limited access with mandatory automated alerting to LCP and ECB Audit.
          </p>

          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-300">
            <strong>CRITICAL RESTRICTION:</strong> The Harassment Vault is strictly excluded from break-glass privilege. Any break-glass request targeting the Harassment Vault will be rejected server-side.
          </div>

          <form onSubmit={handleRequestBreakGlass} className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Target Resource</label>
              <select
                value={bgResource}
                onChange={(e) => setBgResource(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              >
                <option value="CONFIG_THRESHOLDS">CONFIG_THRESHOLDS (Emergency Parameter Override)</option>
                <option value="FINANCE">FINANCE (Urgent Disbursement Override)</option>
                <option value="HARASSMENT_VAULT">HARASSMENT_VAULT (Restricted - Prohibited)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Documented Justification (&ge; 15 characters)
              </label>
              <textarea
                required
                rows={3}
                value={bgJustification}
                onChange={(e) => setBgJustification(e.target.value)}
                placeholder="Document operational emergency justification for statutory ECB audit review..."
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded text-sm font-medium transition flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Request Emergency Elevation
            </button>
          </form>

          {bgResult && (
            <div className={`mt-4 p-3 rounded-lg text-xs font-mono border ${
              bgResult.startsWith('BLOCKED')
                ? 'bg-red-500/10 border-red-500/20 text-red-300'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
            }`}>
              {bgResult}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Term Handover */}
      {activeTab === 'handover' && (
        <div className="mt-6 max-w-2xl bg-slate-900/60 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-slate-100">Annual Term Handover Engine (REQ-114 / TEST-110)</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Executed by outgoing LCP at term transition to revoke term roles, reassign open accounts, and rotate system credentials.
          </p>

          <div className="mt-5 space-y-3">
            <div className="p-3 bg-slate-950 rounded border border-slate-800 text-xs space-y-1">
              <div><strong>LC:</strong> LC Rabat (Morocco)</div>
              <div><strong>Term Transition:</strong> 2025-2026 &rarr; 2026-2027</div>
              <div><strong>Active Role Assignments:</strong> {assignments.filter((a) => a.status === 'ACTIVE').length}</div>
              <div><strong>Open CRM & CXP Records:</strong> 18</div>
            </div>

            <button
              onClick={handleExecuteHandover}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded text-sm font-medium transition flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Execute Atomic Term Handover
            </button>

            {handoverRecord && (
              <div className="mt-4 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs space-y-2">
                <div className="flex items-center gap-2 text-purple-300 font-semibold text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  Handover Completed Successfully
                </div>
                <div className="font-mono text-slate-300">
                  <p>Handover ID: {handoverRecord.handoverId}</p>
                  <p>Roles Revoked: {handoverRecord.rolesRevokedCount}</p>
                  <p>Records Reassigned: {handoverRecord.recordsReassignedCount}</p>
                  <p>Tokens Rotated: {handoverRecord.tokensRotatedCount}</p>
                  <p className="text-emerald-400 font-semibold mt-1">
                    Certificate: {handoverRecord.handoverCertificateId}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Usability Testing Suite */}
      {activeTab === 'usability' && (
        <div className="mt-6 space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-lg font-semibold text-slate-100">
                    Live Pilot Usability Testing Suite (TEST-117)
                  </h2>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Validates end-to-end task completion and defect counts across BD, CXP, and LCVP operational journeys.
                </p>
              </div>

              <button
                onClick={handleRunAllUsabilityJourneys}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold transition flex items-center gap-2 shadow-lg shadow-emerald-500/20 shrink-0"
              >
                <Zap className="w-4 h-4" />
                Run All Pilot Usability Sessions
              </button>
            </div>

            {usabilityReports.length > 0 && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
                {usabilityReports.map((report) => (
                  <div
                    key={report.sessionId}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {report.role}
                        </span>
                        <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {report.overallSuccessRate}% Pass
                        </span>
                      </div>
                      <h3 className="font-semibold text-sm text-slate-200 mt-2">
                        {report.participantName}
                      </h3>
                      <p className="text-xs text-slate-400 font-mono">Session: {report.sessionId}</p>

                      <div className="mt-4 space-y-2">
                        {report.completedTasks.map((t, idx) => (
                          <div
                            key={idx}
                            className="p-2 rounded bg-slate-900 border border-slate-800/80 text-xs flex items-center justify-between"
                          >
                            <span className="text-slate-300 truncate max-w-[180px]">{t.taskName}</span>
                            <span className="text-emerald-400 font-mono shrink-0">{t.durationSeconds}s</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                      <span>Blocking Defects:</span>
                      <span className="font-bold text-emerald-400">{report.totalBlockingDefects} (Target: 0)</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
