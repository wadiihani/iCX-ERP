'use client';

import React, { useState } from 'react';
import {
  MemberRecord,
  EngagementTier,
  MemberDepartment,
  O2OSessionRecord,
  TeamStandardItem,
} from '@/lib/members/member-engagement-types';
import {
  INITIAL_MEMBERS,
  INITIAL_O2O_SESSIONS,
  MASTER_TEAM_STANDARDS,
  calculateCompositeMes,
  deriveEngagementTier,
  getTierMeta,
} from '@/lib/members/member-data';
import { GovernanceAttendanceGrid } from '@/components/members/governance-attendance-grid';
import { O2OCoachingModal } from '@/components/members/o2o-coaching-modal';
import { TeamStandardsScorecard } from '@/components/members/team-standards-scorecard';
import { MandateHandoverModal } from '@/components/members/mandate-handover-modal';
import {
  Users,
  Search,
  Filter,
  Star,
  Layers,
  Award,
  ChevronDown,
  Calendar,
  Mail,
  Phone,
  ArrowUpDown,
  UserCheck,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

export default function MembersPage() {
  const [members, setMembers] = useState<MemberRecord[]>(INITIAL_MEMBERS);
  const [o2oSessions, setO2oSessions] = useState<O2OSessionRecord[]>(INITIAL_O2O_SESSIONS);
  const [teamStandards, setTeamStandards] = useState<TeamStandardItem[]>(MASTER_TEAM_STANDARDS);

  // Active view tab
  const [activeTab, setActiveTab] = useState<'ROSTER' | 'GOVERNANCE' | 'STANDARDS'>('ROSTER');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<'ALL' | MemberDepartment>('ALL');
  const [tierFilter, setTierFilter] = useState<'ALL' | EngagementTier>('ALL');
  const [sortBy, setSortBy] = useState<'MES_DESC' | 'MES_ASC' | 'NAME_ASC'>('MES_DESC');

  // Modals state
  const [isO2oModalOpen, setO2oModalOpen] = useState(false);
  const [isHandoverModalOpen, setHandoverModalOpen] = useState(false);
  const [coachingTargetMember, setCoachingTargetMember] = useState<MemberRecord | undefined>(undefined);
  const [selectedMemberForDetails, setSelectedMemberForDetails] = useState<MemberRecord | null>(null);

  // Handlers
  const handleOpenCoachingModal = (member?: MemberRecord) => {
    setCoachingTargetMember(member);
    setO2oModalOpen(true);
  };

  const handleSaveO2oSession = (newSession: O2OSessionRecord) => {
    setO2oSessions((prev) => [newSession, ...prev]);

    // Recalculate member's O2O score & composite MES
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === newSession.memberId) {
          const updatedO2o = Math.min(100, m.o2oScore + 10);
          const newMes = calculateCompositeMes({
            attendance: m.attendanceScore,
            quotaAttainment: m.quotaScore,
            slaOnTime: m.slaScore,
            o2oParticipation: updatedO2o,
          });
          return {
            ...m,
            o2oScore: updatedO2o,
            compositeMes: newMes,
            tier: deriveEngagementTier(newMes),
          };
        }
        return m;
      })
    );
  };

  // KPI Calculations
  const totalMembers = members.length;
  const tier1Count = members.filter((m) => m.tier === 'TIER_1_CORE').length;
  const tier4Count = members.filter((m) => m.tier === 'TIER_4_RISK').length;
  const avgMes =
    totalMembers > 0
      ? Math.round(members.reduce((acc, m) => acc + m.compositeMes, 0) / totalMembers)
      : 0;
  const o2oTargetCount = members.filter((m) => m.o2oScore >= 80).length;
  const o2oCompletionPct = totalMembers > 0 ? Math.round((o2oTargetCount / totalMembers) * 100) : 0;

  // Filter & Sort
  const filteredMembers = members
    .filter((m) => {
      const matchesSearch =
        m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.roleTitle.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = departmentFilter === 'ALL' || m.department === departmentFilter;
      const matchesTier = tierFilter === 'ALL' || m.tier === tierFilter;
      return matchesSearch && matchesDept && matchesTier;
    })
    .sort((a, b) => {
      if (sortBy === 'MES_DESC') return b.compositeMes - a.compositeMes;
      if (sortBy === 'MES_ASC') return a.compositeMes - b.compositeMes;
      return a.fullName.localeCompare(b.fullName);
    });

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-aiesec-blue/10 text-aiesec-blue">
              <Users className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Member Engagement, Attendance Tiers & Team Standards (`TeSt`)
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            AIESEC in Rabat · LC Mandate 26.2 · 4-Tier Engagement Engine, Governance Heatmaps & Mandate Handovers.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleOpenCoachingModal()}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-aiesec-blue to-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:from-blue-600 hover:to-aiesec-darkblue transition"
          >
            <Star className="h-3.5 w-3.5 fill-white" />
            <span>+ Log O2O Session</span>
          </button>
          <button
            onClick={() => setHandoverModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700 shadow-2xs hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-300 transition"
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Mandate Handover Pack</span>
          </button>
        </div>
      </div>

      {/* Top Headline Scorecard */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {/* Total Members */}
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Roster</div>
          <div className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">{totalMembers}</div>
          <div className="mt-0.5 text-[10px] text-slate-500">LC Rabat Mandate 26.2</div>
        </div>

        {/* Avg LC MES */}
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">LC Avg Engagement</div>
          <div className="mt-1 text-2xl font-extrabold text-aiesec-blue dark:text-blue-400">{avgMes}%</div>
          <div className="mt-0.5 text-[10px] text-slate-500">Composite MES Formula</div>
        </div>

        {/* Tier 1 Core */}
        <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/30 p-3.5 shadow-xs dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            🟢 Tier 1 Core
          </div>
          <div className="mt-1 text-2xl font-extrabold text-emerald-700 dark:text-emerald-300">
            {tier1Count} <span className="text-xs font-normal">({Math.round((tier1Count / totalMembers) * 100)}%)</span>
          </div>
          <div className="mt-0.5 text-[10px] text-emerald-600/80 dark:text-emerald-400">90%–100% Core Performers</div>
        </div>

        {/* Tier 4 Risk */}
        <div className="rounded-xl border border-rose-200/80 bg-rose-50/30 p-3.5 shadow-xs dark:border-rose-900/40 dark:bg-rose-950/20">
          <div className="text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
            🔴 Tier 4 Drop-Off Risk
          </div>
          <div className="mt-1 text-2xl font-extrabold text-rose-700 dark:text-rose-300">
            {tier4Count} <span className="text-xs font-normal">({Math.round((tier4Count / totalMembers) * 100)}%)</span>
          </div>
          <div className="mt-0.5 text-[10px] text-rose-600/80 dark:text-rose-400">&lt;20% Urgent Intervention</div>
        </div>

        {/* O2O Spaces */}
        <div className="rounded-xl border border-amber-200/80 bg-amber-50/30 p-3.5 shadow-xs dark:border-amber-900/40 dark:bg-amber-950/20 col-span-2 sm:col-span-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            O2O Coaching Pace
          </div>
          <div className="mt-1 text-2xl font-extrabold text-amber-600 dark:text-amber-300">
            {o2oCompletionPct}%
          </div>
          <div className="mt-0.5 text-[10px] text-amber-600/80 dark:text-amber-400">
            {o2oSessions.length} logged sessions
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('ROSTER')}
          className={`flex items-center gap-2 border-b-2 px-3.5 py-2 text-xs font-semibold transition ${
            activeTab === 'ROSTER'
              ? 'border-aiesec-blue text-aiesec-blue font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Member Roster & 4 Tiers ({filteredMembers.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('GOVERNANCE')}
          className={`flex items-center gap-2 border-b-2 px-3.5 py-2 text-xs font-semibold transition ${
            activeTab === 'GOVERNANCE'
              ? 'border-aiesec-blue text-aiesec-blue font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>Rabat 6 Routines & Attendance Heatmap</span>
        </button>
        <button
          onClick={() => setActiveTab('STANDARDS')}
          className={`flex items-center gap-2 border-b-2 px-3.5 py-2 text-xs font-semibold transition ${
            activeTab === 'STANDARDS'
              ? 'border-aiesec-blue text-aiesec-blue font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Award className="h-4 w-4" />
          <span>Global Team Standards (TeSt)</span>
        </button>
      </div>

      {/* TAB 1: MEMBER ROSTER */}
      {activeTab === 'ROSTER' && (
        <div className="space-y-4">
          {/* Table Filters & Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs dark:bg-slate-900 dark:border-slate-800">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search member by name, role, email..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:border-aiesec-blue focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Department Filter */}
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value as any)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="ALL">All Departments</option>
                <option value="EXTERNAL_BD">External Engine (BD)</option>
                <option value="INTERNAL_OPS">Internal Engine (Ops)</option>
                <option value="CXP_QUALITY">CXP / Quality</option>
                <option value="FINANCE">Finance & Legal</option>
              </select>

              {/* Tier Filter */}
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value as any)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="ALL">All Tiers</option>
                <option value="TIER_1_CORE">🟢 Tier 1 Core (90–100%)</option>
                <option value="TIER_2_STRONG">🔵 Tier 2 Strong (70–89%)</option>
                <option value="TIER_3_MODERATE">🟡 Tier 3 Moderate (20–69%)</option>
                <option value="TIER_4_RISK">🔴 Tier 4 Risk (&lt;20%)</option>
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="MES_DESC">Highest MES Score</option>
                <option value="MES_ASC">Lowest MES Score</option>
                <option value="NAME_ASC">Name (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Members Table */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 font-bold text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
                    <th className="px-4 py-3">Member & Role</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Composite MES</th>
                    <th className="px-4 py-3">Engagement Tier</th>
                    <th className="px-4 py-3">Sub-Scores (Att / Quota / SLA / O2O)</th>
                    <th className="px-4 py-3">Workload (EPs / Deals)</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredMembers.map((member) => {
                    const tierMeta = getTierMeta(member.tier);
                    return (
                      <tr
                        key={member.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        {/* Member & Role */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-aiesec-blue/10 font-bold text-aiesec-blue text-xs">
                              {member.avatar || member.fullName.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 dark:text-white truncate">
                                {member.fullName}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate">
                                {member.roleTitle}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Department */}
                        <td className="px-4 py-3">
                          <span className="font-medium text-slate-600 dark:text-slate-300">
                            {member.department === 'EXTERNAL_BD' && 'External Engine (BD)'}
                            {member.department === 'INTERNAL_OPS' && 'Internal Engine (Ops)'}
                            {member.department === 'CXP_QUALITY' && 'CXP / Quality'}
                            {member.department === 'FINANCE' && 'Finance & Legal'}
                          </span>
                        </td>

                        {/* Composite MES */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-12 text-sm font-extrabold text-slate-900 dark:text-white">
                              {member.compositeMes}%
                            </div>
                            <div className="w-20 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                              <div
                                className={`h-full ${tierMeta.progressClass}`}
                                style={{ width: `${member.compositeMes}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Engagement Tier Badge */}
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold ${tierMeta.colorClass}`}
                          >
                            {tierMeta.badge}
                          </span>
                        </td>

                        {/* Sub-Scores */}
                        <td className="px-4 py-3 font-mono text-[10px] text-slate-500 dark:text-slate-400">
                          <span title="Attendance (35%)">{member.attendanceScore}%</span> /{' '}
                          <span title="Quota Attainment (30%)">{member.quotaScore}%</span> /{' '}
                          <span title="SLA Punctuality (20%)">{member.slaScore}%</span> /{' '}
                          <span title="O2O Coaching (15%)">{member.o2oScore}%</span>
                        </td>

                        {/* Workload */}
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                          {member.assignedEpsCount > 0 && (
                            <span className="inline-block mr-1.5 rounded bg-sky-50 px-1.5 py-0.5 text-[10px] font-semibold text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                              {member.assignedEpsCount} EPs
                            </span>
                          )}
                          {member.assignedDealsCount > 0 && (
                            <span className="inline-block rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                              {member.assignedDealsCount} Deals
                            </span>
                          )}
                          {member.assignedEpsCount === 0 && member.assignedDealsCount === 0 && (
                            <span className="text-slate-400 text-[10px]">—</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenCoachingModal(member)}
                              className="rounded border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-700 hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300"
                              title="Log 1:1 O2O Coaching"
                            >
                              Log O2O
                            </button>
                            <button
                              onClick={() => setSelectedMemberForDetails(member)}
                              className="rounded border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                            >
                              Inspect
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GOVERNANCE ROUTINES */}
      {activeTab === 'GOVERNANCE' && (
        <GovernanceAttendanceGrid
          members={members}
          selectedMemberId={coachingTargetMember?.id}
        />
      )}

      {/* TAB 3: TEAM STANDARDS */}
      {activeTab === 'STANDARDS' && (
        <TeamStandardsScorecard
          initialStandards={teamStandards}
          onUpdateStandards={(updated) => setTeamStandards(updated)}
        />
      )}

      {/* MEMBER DETAILS DRAWER */}
      {selectedMemberForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-50">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-aiesec-blue font-bold text-white text-sm">
                  {selectedMemberForDetails.avatar || selectedMemberForDetails.fullName.slice(0, 2)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {selectedMemberForDetails.fullName}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedMemberForDetails.roleTitle} · Mandate {selectedMemberForDetails.mandate}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMemberForDetails(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {/* Engagement Status Card */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Composite MES Score</span>
                  <span
                    className={`rounded-md border px-2 py-0.5 text-xs font-bold ${
                      getTierMeta(selectedMemberForDetails.tier).colorClass
                    }`}
                  >
                    {getTierMeta(selectedMemberForDetails.tier).badge}
                  </span>
                </div>
                <div className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
                  {selectedMemberForDetails.compositeMes}%
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {getTierMeta(selectedMemberForDetails.tier).description}
                </p>

                {/* Weighted Breakdown */}
                <div className="mt-3 grid grid-cols-2 gap-2 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
                  <div>
                    <span className="text-slate-400">Attendance (35%):</span>{' '}
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {selectedMemberForDetails.attendanceScore}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Quota Attainment (30%):</span>{' '}
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {selectedMemberForDetails.quotaScore}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">SLA Punctuality (20%):</span>{' '}
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {selectedMemberForDetails.slaScore}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">O2O Coaching (15%):</span>{' '}
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {selectedMemberForDetails.o2oScore}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact & Communication */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span>{selectedMemberForDetails.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <span>{selectedMemberForDetails.whatsappPhone}</span>
                </div>
              </div>

              {selectedMemberForDetails.notes && (
                <div className="rounded-lg bg-amber-50/50 p-3 text-xs text-amber-900 border border-amber-200/60 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-900/40">
                  <span className="font-bold">Coaching Note:</span> {selectedMemberForDetails.notes}
                </div>
              )}
            </div>

            <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
              <button
                onClick={() => {
                  const m = selectedMemberForDetails;
                  setSelectedMemberForDetails(null);
                  handleOpenCoachingModal(m);
                }}
                className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-amber-600 transition"
              >
                Log O2O Space
              </button>
              <button
                onClick={() => setSelectedMemberForDetails(null)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* O2O COACHING MODAL */}
      <O2OCoachingModal
        isOpen={isO2oModalOpen}
        onClose={() => setO2oModalOpen(false)}
        members={members}
        initialMember={coachingTargetMember}
        onSaveSession={handleSaveO2oSession}
      />

      {/* MANDATE HANDOVER MODAL */}
      <MandateHandoverModal
        isOpen={isHandoverModalOpen}
        onClose={() => setHandoverModalOpen(false)}
        members={members}
      />
    </div>
  );
}
