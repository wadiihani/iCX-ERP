'use client';

import React, { useState } from 'react';
import { evaluateScorecard, type InterviewScorecardMetrics } from '@/lib/funnel/scorecard';

interface ScorecardModalProps {
  isOpen: boolean;
  onClose: () => void;
  epName: string;
  type: 'SCREENING' | 'OP_INTERVIEW';
  onSaved: (metrics: InterviewScorecardMetrics) => void;
}

export function ScorecardModal({
  isOpen,
  onClose,
  epName,
  type,
  onSaved,
}: ScorecardModalProps) {
  const [language, setLanguage] = useState(80);
  const [sdgMotivation, setSdgMotivation] = useState(85);
  const [availability, setAvailability] = useState(90);
  const [culturalAdaptability, setCulturalAdaptability] = useState(80);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const currentMetrics: InterviewScorecardMetrics = {
    languageProficiency: language,
    sdgMotivationAndAlignment: sdgMotivation,
    availabilityAndCommitment: availability,
    culturalAdaptability,
    interviewerId: 'current_evaluator',
    interviewDate: new Date().toISOString(),
    notes,
  };

  const evaluation = evaluateScorecard(currentMetrics);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaved(currentMetrics);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="max-w-lg w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {type === 'SCREENING' ? 'Host LC Screening Scorecard' : 'Opportunity Provider (OP) Interview'}
            </h3>
            <p className="text-xs text-slate-500">Applicant: {epName} · Passing Threshold: 70% (THR-042)</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        {/* Live Score Banner */}
        <div
          className={`p-4 rounded-xl border flex items-center justify-between ${
            evaluation.passed
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div>
            <div className="text-xs font-semibold">Composite Evaluation Score</div>
            <div className="text-2xl font-black">{evaluation.compositeScore}%</div>
          </div>
          <div className="text-right">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                evaluation.passed ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'
              }`}
            >
              {evaluation.passed ? 'PASSED (Eligible)' : 'FAILED (< 70%)'}
            </span>
            <div className="text-[10px] text-slate-500 mt-1">Recommendation: {evaluation.recommendation}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Language Slider */}
          <div>
            <div className="flex justify-between font-semibold">
              <label>1. Language Proficiency (FR / EN / AR) — 30% Weight</label>
              <span className="font-mono text-blue-600 font-bold">{language}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={language}
              onChange={(e) => setLanguage(Number(e.target.value))}
              className="w-full mt-1.5"
            />
          </div>

          {/* SDG Motivation Slider */}
          <div>
            <div className="flex justify-between font-semibold">
              <label>2. SDG Project Motivation & Alignment — 30% Weight</label>
              <span className="font-mono text-blue-600 font-bold">{sdgMotivation}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={sdgMotivation}
              onChange={(e) => setSdgMotivation(Number(e.target.value))}
              className="w-full mt-1.5"
            />
          </div>

          {/* Availability Slider */}
          <div>
            <div className="flex justify-between font-semibold">
              <label>3. Availability & Date Commitment — 20% Weight</label>
              <span className="font-mono text-blue-600 font-bold">{availability}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={availability}
              onChange={(e) => setAvailability(Number(e.target.value))}
              className="w-full mt-1.5"
            />
          </div>

          {/* Cultural Adaptability Slider */}
          <div>
            <div className="flex justify-between font-semibold">
              <label>4. Cultural Adaptability (Moroccan Context) — 20% Weight</label>
              <span className="font-mono text-blue-600 font-bold">{culturalAdaptability}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={culturalAdaptability}
              onChange={(e) => setCulturalAdaptability(Number(e.target.value))}
              className="w-full mt-1.5"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300">Interviewer Evaluation Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Candidate demonstrated strong passion for SDG 4 and conversational French fluency."
              className="mt-1 w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
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
              Submit Scorecard
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
