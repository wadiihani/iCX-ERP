'use client';

import React, { useState } from 'react';
import {
  B2bDealRecord,
  PipelineStage,
  PIPELINE_STAGE_CONFIG,
  validateDealTransition,
} from '@/lib/sales/deals-data';
import {
  CheckCircle2,
  Circle,
  AlertTriangle,
  X,
  FileCheck,
  ShieldAlert,
} from 'lucide-react';

interface DealStageStepperProps {
  deal: B2bDealRecord;
  onTransitionStage: (targetStage: PipelineStage, reason?: string) => void;
}

const ORDERED_STAGES: PipelineStage[] = [
  'PROSPECT',
  'QUALIFIED',
  'DISCOVERY',
  'PROPOSAL',
  'NEGOTIATION',
  'AGREEMENT_SIGNED',
  'OPP_SETUP',
  'ACTIVE_DELIVERY',
];

export function DealStageStepper({ deal, onTransitionStage }: DealStageStepperProps) {
  const [lossModalOpen, setLossModalOpen] = useState(false);
  const [lossTargetStage, setLossTargetStage] = useState<'CLOSED_LOST' | 'DISQUALIFIED'>('CLOSED_LOST');
  const [lossReason, setLossReason] = useState('');
  const [gateError, setGateError] = useState<string | null>(null);

  const currentStepNumber = PIPELINE_STAGE_CONFIG[deal.stage]?.stepNumber || 0;

  const handleStepClick = (targetStage: PipelineStage) => {
    setGateError(null);

    // Validate transition
    const validation = validateDealTransition(deal, targetStage);
    if (!validation.isValid) {
      setGateError(validation.error || 'Transition not permitted');
      return;
    }

    onTransitionStage(targetStage);
  };

  const handleTriggerLoss = (stage: 'CLOSED_LOST' | 'DISQUALIFIED') => {
    setLossTargetStage(stage);
    setLossReason('');
    setLossModalOpen(true);
  };

  const handleConfirmLoss = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lossReason.trim()) return;

    onTransitionStage(lossTargetStage, lossReason);
    setLossModalOpen(false);
  };

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            8-Stage Deal Progression Stepper
          </span>
          <span className="ml-2 rounded-sm bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            Current: {PIPELINE_STAGE_CONFIG[deal.stage]?.label}
          </span>
        </div>

        {/* Closed Lost / Disqualified buttons */}
        <div className="flex items-center gap-2">
          {deal.stage !== 'CLOSED_LOST' && (
            <button
              onClick={() => handleTriggerLoss('CLOSED_LOST')}
              className="rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300 transition"
            >
              Mark Closed Lost
            </button>
          )}
          {deal.stage !== 'DISQUALIFIED' && (
            <button
              onClick={() => handleTriggerLoss('DISQUALIFIED')}
              className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition"
            >
              Disqualify
            </button>
          )}
        </div>
      </div>

      {/* Gate Error Alert */}
      {gateError && (
        <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-2.5 text-xs font-semibold text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900">
          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{gateError}</span>
        </div>
      )}

      {/* Visual Stepper */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        {ORDERED_STAGES.map((stage, idx) => {
          const config = PIPELINE_STAGE_CONFIG[stage];
          const isCurrent = deal.stage === stage;
          const isPassed = currentStepNumber > config.stepNumber && !PIPELINE_STAGE_CONFIG[deal.stage]?.isTerminal;

          return (
            <button
              key={stage}
              onClick={() => handleStepClick(stage)}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                isCurrent
                  ? 'bg-aiesec-blue text-white shadow-xs'
                  : isPassed
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
              }`}
            >
              {isPassed ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : isCurrent ? (
                <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-aiesec-blue">
                  {idx + 1}
                </span>
              ) : (
                <Circle className="h-3.5 w-3.5 text-slate-400" />
              )}
              <span>{config.label.split('. ')[1] || config.label}</span>
            </button>
          );
        })}
      </div>

      {/* Mandatory Loss Reason Modal */}
      {lossModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-50">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                <ShieldAlert className="h-4 w-4" />
                <span>Mark {lossTargetStage.replace('_', ' ')}</span>
              </div>
              <button
                onClick={() => setLossModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmLoss} className="mt-3 space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                AIESEC Hub Operating Model §5.2 requires an explicit loss reason to populate executive loss analytics.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Loss / Disqualification Reason *
                </label>
                <select
                  onChange={(e) => setLossReason(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  <option value="">Select a structured root cause...</option>
                  <option value="Budget Freeze / Lack of Corporate Funding">Budget Freeze / Lack of Corporate Funding</option>
                  <option value="Timeline Mismatch / Project Cancelled">Timeline Mismatch / Project Cancelled</option>
                  <option value="No Profile Match for Required Technical Skills">No Profile Match for Required Technical Skills</option>
                  <option value="Partner Selected Local Internship Competitor">Partner Selected Local Internship Competitor</option>
                  <option value="Unethical Partner Operations / Values Conflict">Unethical Partner Operations / Values Conflict</option>
                  <option value="Other / Documented in Notes">Other / Documented in Notes</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Detailed Notes / Feedback
                </label>
                <textarea
                  rows={2}
                  value={lossReason}
                  onChange={(e) => setLossReason(e.target.value)}
                  placeholder="Elaborate on partner feedback..."
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setLossModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!lossReason.trim()}
                  className="rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50"
                >
                  Confirm Loss
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
