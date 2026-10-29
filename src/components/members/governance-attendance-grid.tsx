'use client';

import React, { useState } from 'react';
import {
  MemberRecord,
  AttendanceStatus,
  RoutineAttendanceRecord,
} from '@/lib/members/member-engagement-types';
import {
  RABAT_GOVERNANCE_ROUTINES,
  generateMemberAttendance,
} from '@/lib/members/member-data';
import { Calendar, CheckCircle2, Clock, XCircle, HelpCircle, Star, Sparkles } from 'lucide-react';

interface GovernanceAttendanceGridProps {
  members: MemberRecord[];
  selectedMemberId?: string;
  onSelectMember?: (memberId: string) => void;
}

export function GovernanceAttendanceGrid({
  members,
  selectedMemberId,
  onSelectMember,
}: GovernanceAttendanceGridProps) {
  const [activeMemberId, setActiveMemberId] = useState<string>(
    selectedMemberId || members[0]?.id || ''
  );
  const [activeRoutine, setActiveRoutine] = useState<string>('ALL');

  const currentMember = members.find((m) => m.id === activeMemberId) || members[0];
  const attendanceHistory: RoutineAttendanceRecord[] = currentMember
    ? generateMemberAttendance(currentMember.id)
    : [];

  const handleMemberChange = (id: string) => {
    setActiveMemberId(id);
    if (onSelectMember) onSelectMember(id);
  };

  // Compute summary stats
  const totalWeeks = attendanceHistory.length;
  const onTimeCount = attendanceHistory.filter((r) => r.status === 'ON_TIME').length;
  const lateCount = attendanceHistory.filter((r) => r.status === 'LATE').length;
  const absentCount = attendanceHistory.filter((r) => r.status === 'ABSENT').length;
  const o2oCount = attendanceHistory.filter((r) => r.hasO2o).length;
  const attendanceRate = totalWeeks > 0 ? Math.round(((onTimeCount + lateCount) / totalWeeks) * 100) : 0;
  const punctualityRate = totalWeeks > 0 ? Math.round((onTimeCount / totalWeeks) * 100) : 0;

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case 'ON_TIME':
        return 'bg-emerald-500 hover:bg-emerald-600 text-white';
      case 'LATE':
        return 'bg-amber-400 hover:bg-amber-500 text-white';
      case 'ABSENT':
        return 'bg-rose-500 hover:bg-rose-600 text-white';
      case 'EXCUSED':
        return 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300';
    }
  };

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="h-4 w-4 text-aiesec-blue" />
            Rabat 6 Mandatory Governance Routines · Attendance Heatmap
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Weekly meeting attendance, punctuality, and O2O completion tracking across Mandate 26.2 (Weeks 1–16).
          </p>
        </div>

        {/* Member Selector Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="memberSelect" className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Member:
          </label>
          <select
            id="memberSelect"
            value={activeMemberId}
            onChange={(e) => handleMemberChange(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 shadow-xs focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.fullName} ({m.role}) — {m.compositeMes}% MES
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick KPI Strip for Active Member */}
      {currentMember && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg dark:bg-slate-800/50">
          <div>
            <div className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Attendance Rate</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{attendanceRate}%</span>
              <span className="text-[10px] font-normal text-slate-400">({onTimeCount + lateCount}/{totalWeeks} wks)</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Punctuality (≤5m)</div>
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {punctualityRate}%
            </div>
          </div>
          <div>
            <div className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Unexcused Absences</div>
            <div className={`text-lg font-bold ${absentCount > 2 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-200'}`}>
              {absentCount}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Completed O2Os</div>
            <div className="text-lg font-bold text-amber-500 flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span>{o2oCount} spaces</span>
            </div>
          </div>
        </div>
      )}

      {/* Routine Tabs */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        <button
          onClick={() => setActiveRoutine('ALL')}
          className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
            activeRoutine === 'ALL'
              ? 'bg-aiesec-blue text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          All Routines Overview
        </button>
        {RABAT_GOVERNANCE_ROUTINES.map((r) => (
          <button
            key={r.id}
            onClick={() => setActiveRoutine(r.id)}
            className={`rounded-md px-2 py-1 text-xs font-medium transition ${
              activeRoutine === r.id
                ? 'bg-aiesec-blue text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {r.title}
          </button>
        ))}
      </div>

      {/* GitHub-style Weekly Attendance Heatmap */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Weekly Cadence Matrix (W1 – W16)
          </span>
          {/* Legend */}
          <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-xs bg-emerald-500" /> On Time
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-xs bg-amber-400" /> Late
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-xs bg-rose-500" /> Absent
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-xs bg-slate-300 dark:bg-slate-700" /> Excused
            </span>
            <span className="flex items-center gap-1 text-amber-500">
              <Star className="h-3 w-3 fill-amber-400" /> O2O Done
            </span>
          </div>
        </div>

        {/* Weeks Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-16 gap-1.5 p-3 rounded-lg border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50">
          {attendanceHistory.map((item) => (
            <div
              key={item.week}
              className="flex flex-col items-center gap-1.5 rounded-md p-2 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-2xs hover:border-slate-400 transition"
              title={`${item.week} (${item.date}): ${item.status}${item.hasO2o ? ' | O2O Completed' : ''}`}
            >
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                {item.week}
              </span>
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-md font-bold text-[10px] transition-transform hover:scale-110 ${getStatusColor(
                  item.status
                )}`}
              >
                {item.status === 'ON_TIME' && <CheckCircle2 className="h-3.5 w-3.5" />}
                {item.status === 'LATE' && <Clock className="h-3.5 w-3.5" />}
                {item.status === 'ABSENT' && <XCircle className="h-3.5 w-3.5" />}
                {item.status === 'EXCUSED' && <HelpCircle className="h-3.5 w-3.5" />}
              </div>
              <div className="h-3 flex items-center justify-center">
                {item.hasO2o && (
                  <span title="O2O Logged">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-500 animate-pulse" />
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
