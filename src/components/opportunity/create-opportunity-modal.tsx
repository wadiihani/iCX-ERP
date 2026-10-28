'use client';

import React, { useState } from 'react';
import { validateOpportunity, type OpportunityInput } from '@/lib/opportunity/opportunity-validator';

interface CreateOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (input: OpportunityInput) => void;
}

export function CreateOpportunityModal({
  isOpen,
  onClose,
  onCreated,
}: CreateOpportunityModalProps) {
  const [title, setTitle] = useState('');
  const [sdgTarget, setSdgTarget] = useState<number>(4);
  const [durationWeeks, setDurationWeeks] = useState<number>(6);
  const [weeklyWorkingHours, setWeeklyWorkingHours] = useState<number>(30);
  const [fundingPercentage, setFundingPercentage] = useState<number>(100);
  const [totalOpenings, setTotalOpenings] = useState<number>(5);
  const [startDate, setStartDate] = useState('2026-11-01');
  const [endDate, setEndDate] = useState('2026-12-15');
  const [errors, setErrors] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const input: OpportunityInput = {
      title,
      product: 'igv',
      sdgTarget,
      durationWeeks,
      weeklyWorkingHours,
      fundingPercentage,
      totalOpenings,
      startDate,
      endDate,
    };

    const res = validateOpportunity(input);
    if (!res.isValid) {
      setErrors(res.errors);
      return;
    }

    onCreated(input);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="max-w-xl w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Create iGV Opportunity
            </h3>
            <p className="text-xs text-slate-500">Statutory iGV Criteria Validation (REQ-022 / TEST-025)</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        {errors.length > 0 && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs space-y-1">
            {errors.map((err, i) => (
              <div key={i}>• {err}</div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Opportunity Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Youth Digital Literacy & Coding Coach"
              className="mt-1 w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Target UN Sustainable Development Goal
            </label>
            <select
              value={sdgTarget}
              onChange={(e) => setSdgTarget(Number(e.target.value))}
              className="mt-1 w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
            >
              <option value={4}>ODD 4: Éducation de Qualité (Global Classroom)</option>
              <option value={8}>ODD 8: Travail Décent et Croissance Économique (Youth Biz)</option>
              <option value={10}>ODD 10: Inégalités Réduites (Empower Communities)</option>
              <option value={13}>ODD 13: Action Climat (Green Leaders)</option>
              <option value={3}>ODD 3: Santé et Bien-être</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Duration (Weeks: 6–8)
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
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Weekly Hours (25h–40h)
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
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Total Openings (Spots)
              </label>
              <input
                type="number"
                min={1}
                required
                value={totalOpenings}
                onChange={(e) => setTotalOpenings(Number(e.target.value))}
                className="mt-1 w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Partner Fee Coverage (%: min 70%)
              </label>
              <input
                type="number"
                min={70}
                max={100}
                required
                value={fundingPercentage}
                onChange={(e) => setFundingPercentage(Number(e.target.value))}
                className="mt-1 w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">Start Date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">End Date</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-sm"
            >
              Save & Submit Opportunity
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
