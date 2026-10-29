'use client';

import React, { useState } from 'react';
import { MemberRecord, O2OSessionRecord } from '@/lib/members/member-engagement-types';
import { X, Star, Heart, CheckCircle, Calendar, User, FileText, AlertCircle } from 'lucide-react';

interface O2OCoachingModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: MemberRecord[];
  initialMember?: MemberRecord;
  onSaveSession: (session: O2OSessionRecord) => void;
}

export function O2OCoachingModal({
  isOpen,
  onClose,
  members,
  initialMember,
  onSaveSession,
}: O2OCoachingModalProps) {
  if (!isOpen) return null;

  const [memberId, setMemberId] = useState(initialMember?.id || members[0]?.id || '');
  const [coachId, setCoachId] = useState('mbr-01'); // Default coach: Wadii Hani (LCVP) or Omar Joukhane
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [wellbeingScore, setWellbeingScore] = useState<number>(4);
  const [kpiReviewNotes, setKpiReviewNotes] = useState('');
  const [blockers, setBlockers] = useState('');
  const [actionItems, setActionItems] = useState('');
  const [followUpDate, setFollowUpDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );
  const [error, setError] = useState<string | null>(null);

  const selectedMember = members.find((m) => m.id === memberId) || members[0];
  const selectedCoach = members.find((m) => m.id === coachId) || members[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kpiReviewNotes.trim()) {
      setError('Please provide KPI review notes from the conversation.');
      return;
    }
    if (!actionItems.trim()) {
      setError('Please document at least one agreed action item.');
      return;
    }

    const session: O2OSessionRecord = {
      id: `o2o-${Date.now()}`,
      memberId: selectedMember.id,
      memberName: selectedMember.fullName,
      coachId: selectedCoach.id,
      coachName: selectedCoach.fullName,
      date,
      wellbeingScore,
      kpiReviewNotes,
      blockers,
      actionItems,
      followUpDate,
    };

    onSaveSession(session);
    onClose();
  };

  const getWellbeingLabel = (score: number) => {
    switch (score) {
      case 5:
        return '🤩 Excellent & Highly Energized';
      case 4:
        return '😊 Good & Positive Motivation';
      case 3:
        return '😐 Neutral / Managing Pressure';
      case 2:
        return '😟 Low Energy / Needs Support';
      case 1:
        return '🚨 Burnout Risk / Urgent Intervention';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-50">
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Star className="h-5 w-5 fill-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Log One-to-One (O2O) Coaching Space
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official AIESEC in Rabat 1:1 performance & wellbeing calibration.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-rose-50 p-2.5 text-xs font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Members Selector Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Coachee (Member)
              </label>
              <select
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 shadow-2xs focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fullName} ({m.roleTitle})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Coach (Team Leader / LCVP)
              </label>
              <select
                value={coachId}
                onChange={(e) => setCoachId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 shadow-2xs focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                {members
                  .filter((m) => m.role === 'LCVP' || m.role === 'MM_TL')
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.role})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Session Date & Wellbeing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Session Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 shadow-2xs focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Wellbeing & Motivation (1–5)
              </label>
              <div className="flex items-center gap-1.5 pt-1">
                {[1, 2, 3, 4, 5].map((score) => (
                  <button
                    key={score}
                    type="button"
                    onClick={() => setWellbeingScore(score)}
                    className={`flex h-8 flex-1 items-center justify-center rounded-lg border text-xs font-bold transition ${
                      wellbeingScore === score
                        ? 'border-amber-500 bg-amber-500 text-white shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {score}★
                  </button>
                ))}
              </div>
              <p className="mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {getWellbeingLabel(wellbeingScore)}
              </p>
            </div>
          </div>

          {/* KPI Review & Discussion Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Personal KPI Review & Goal Progress *
            </label>
            <textarea
              rows={2}
              value={kpiReviewNotes}
              onChange={(e) => setKpiReviewNotes(e.target.value)}
              placeholder="E.g., Review of B2B cold-call target (15/20 reached), EP follow-up turnaround, CRM update compliance..."
              className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-900 shadow-2xs focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Blockers */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Identified Blockers & Personal Challenges
            </label>
            <textarea
              rows={2}
              value={blockers}
              onChange={(e) => setBlockers(e.target.value)}
              placeholder="E.g., Exam period schedule conflicts, delayed responses from host schools, need pitch coaching..."
              className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-900 shadow-2xs focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Action Items & Follow-up */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Agreed Action Items *
              </label>
              <input
                type="text"
                value={actionItems}
                onChange={(e) => setActionItems(e.target.value)}
                placeholder="E.g., Shadow 2 live calls with LCVP, submit 5 validated EP dossiers by Friday"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 shadow-2xs focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Next Check-in Date
              </label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 shadow-2xs focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-gradient-to-r from-aiesec-blue to-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:from-blue-600 hover:to-aiesec-darkblue transition"
            >
              Save O2O Session & Recalculate MES
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
