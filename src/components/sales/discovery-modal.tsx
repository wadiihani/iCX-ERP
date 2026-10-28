'use client';

import React, { useState } from 'react';
import { validateDiscoveryAnswers, type DiscoveryQuestionnaireAnswers } from '@/lib/sales/discovery-questionnaire';

interface DiscoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  dealId: string;
  partnerName: string;
  onSaved: (answers: DiscoveryQuestionnaireAnswers) => void;
}

export function DiscoveryModal({
  isOpen,
  onClose,
  partnerName,
  onSaved,
}: DiscoveryModalProps) {
  const [sdgGoal, setSdgGoal] = useState<number>(4);
  const [weeklyWorkingHours, setWeeklyWorkingHours] = useState<number>(30);
  const [durationWeeks, setDurationWeeks] = useState<number>(6);
  const [supervisorName, setSupervisorName] = useState<string>('');
  const [accommodationConfirmed, setAccommodationConfirmed] = useState<boolean>(true);
  const [fundingPercentage, setFundingPercentage] = useState<number>(100);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const answers: DiscoveryQuestionnaireAnswers = {
      sdgGoal,
      weeklyWorkingHours,
      durationWeeks,
      hasSupervisorAssigned: Boolean(supervisorName.trim()),
      supervisorName,
      accommodationConfirmed,
      fundingCommitmentPercentage: fundingPercentage,
      completedAt: new Date().toISOString(),
      completedBy: 'current_user',
    };

    const validation = validateDiscoveryAnswers(answers);
    if (!validation.isComplete) {
      setErrorMsg(validation.statutoryViolations.join(' '));
      return;
    }

    onSaved(answers);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="max-w-xl w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Statutory Discovery Questionnaire
            </h3>
            <p className="text-xs text-slate-500">Partner: {partnerName} · Mandatory Gate for Proposal</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* SDG Goal */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Target UN Sustainable Development Goal (SDG 1–17)
            </label>
            <select
              value={sdgGoal}
              onChange={(e) => setSdgGoal(Number(e.target.value))}
              className="mt-1 w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
            >
              <option value={4}>ODD 4: Éducation de Qualité</option>
              <option value={8}>ODD 8: Travail Décent et Croissance Économique</option>
              <option value={10}>ODD 10: Inégalités Réduites</option>
              <option value={13}>ODD 13: Mesures Relatives aux Changements Climatiques</option>
              <option value={3}>ODD 3: Bonne Santé et Bien-être</option>
              <option value={5}>ODD 5: Égalité entre les Sexes</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Weekly Working Hours (25h–40h)
              </label>
              <input
                type="number"
                min={25}
                max={40}
                required
                value={weeklyWorkingHours}
                onChange={(e) => setWeeklyWorkingHours(Number(e.target.value))}
                className="mt-1 w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Duration (6–8 Weeks)
              </label>
              <input
                type="number"
                min={6}
                max={8}
                required
                value={durationWeeks}
                onChange={(e) => setDurationWeeks(Number(e.target.value))}
                className="mt-1 w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
          </div>

          {/* Supervisor */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Dedicated Partner Supervisor Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Fatima Zahra (Directrice Pédagogique)"
              value={supervisorName}
              onChange={(e) => setSupervisorName(e.target.value)}
              className="mt-1 w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>

          {/* Accommodation Checkbox */}
          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="acc-check"
              checked={accommodationConfirmed}
              onChange={(e) => setAccommodationConfirmed(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label htmlFor="acc-check" className="font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              Partner confirms EP accommodation provision or hosting arrangement (Standard #8)
            </label>
          </div>

          {/* Funding % */}
          <div>
            <div className="flex justify-between">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Partner Fee Commitment Percentage (Min 70%)
              </label>
              <span className="font-bold text-blue-600">{fundingPercentage}%</span>
            </div>
            <input
              type="range"
              min={50}
              max={100}
              step={5}
              value={fundingPercentage}
              onChange={(e) => setFundingPercentage(Number(e.target.value))}
              className="w-full mt-1.5"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition shadow-sm"
            >
              Confirm Discovery Gate Passed
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
