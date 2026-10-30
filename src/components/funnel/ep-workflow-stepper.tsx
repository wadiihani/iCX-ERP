'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  AlertTriangle,
  ArrowRight,
  Clock,
  ShieldCheck,
  User,
  Sparkles,
  Info,
} from 'lucide-react';
import clsx from 'clsx';
import { EPRecord } from '@/lib/ep/ep-data';

export type EpWorkflowStage =
  | 'APPLIED'
  | 'ACCEPTED'
  | 'CONTACTED'
  | 'ARRIVED'
  | 'PROJECT'
  | 'COMPLETED';

interface EpWorkflowStepperProps {
  ep: EPRecord;
  onTransitionStage: (targetStage: EPRecord['status'], reason?: string) => void;
  className?: string;
}

const STAGES: {
  id: EpWorkflowStage;
  canonicalStatus: EPRecord['status'];
  label: string;
  stepNumber: number;
  description: string;
  requiredAction: string;
}[] = [
  {
    id: 'APPLIED',
    canonicalStatus: 'APPLIED',
    label: 'Applied',
    stepNumber: 1,
    description: 'Initial EXPA profile submitted',
    requiredAction: 'Review CV & schedule discovery interview (SLA ≤ 24h)',
  },
  {
    id: 'ACCEPTED',
    canonicalStatus: 'ACCEPTED',
    label: 'Accepted',
    stepNumber: 2,
    description: 'Candidate passed interview screening',
    requiredAction: 'Issue Acceptance Note & collect sign-off (SLA ≤ 3d)',
  },
  {
    id: 'CONTACTED',
    canonicalStatus: 'APPROVED',
    label: 'Contacted',
    stepNumber: 3,
    description: 'Candidate approved & formal prep initiated',
    requiredAction: 'Deliver Pre-Departure Briefing & verify visa submission',
  },
  {
    id: 'ARRIVED',
    canonicalStatus: 'REALIZED',
    label: 'Arrived',
    stepNumber: 4,
    description: '14-Day lock verified & airport pickup executed',
    requiredAction: 'Complete airport reception (#6) & Flat check-in (#7)',
  },
  {
    id: 'PROJECT',
    canonicalStatus: 'FINISHED',
    label: 'Project',
    stepNumber: 5,
    description: 'Day-1 accompaniment & project execution underway',
    requiredAction: 'Align JD alignment (#10a) & middle touchpoint survey',
  },
  {
    id: 'COMPLETED',
    canonicalStatus: 'COMPLETED',
    label: 'Completed',
    stepNumber: 6,
    description: 'Exchange debrief & final survey fulfilled',
    requiredAction: 'Verify 16/18 standards & issue Certificate of Leadership',
  },
];

export const EpWorkflowStepper: React.FC<EpWorkflowStepperProps> = ({
  ep,
  onTransitionStage,
  className,
}) => {
  const [gateWarning, setGateWarning] = useState<string | null>(null);

  // Map EP status to canonical stepper stage
  const getStageIndex = (status: EPRecord['status']) => {
    switch (status) {
      case 'APPLIED':
        return 0;
      case 'ACCEPTED':
        return 1;
      case 'APPROVED':
        return 2;
      case 'REALIZED':
        return 3;
      case 'FINISHED':
        return 4;
      case 'COMPLETED':
        return 5;
      default:
        return 0;
    }
  };

  const currentIndex = getStageIndex(ep.status);
  const currentStageMeta = STAGES[currentIndex] || STAGES[0];
  const nextStageMeta = STAGES[currentIndex + 1] || null;

  const handleAdvance = () => {
    setGateWarning(null);

    // Guardrail: Cannot advance to Arrived without verified visa status
    if (currentStageMeta.id === 'CONTACTED') {
      if (ep.visa_status === 'REJECTED') {
        setGateWarning('Cannot mark Arrived: Visa status is currently marked REJECTED.');
        return;
      }
    }

    if (nextStageMeta) {
      onTransitionStage(nextStageMeta.canonicalStatus);
    }
  };

  const handleStepClick = (idx: number) => {
    setGateWarning(null);
    const target = STAGES[idx];
    if (!target) return;

    if (idx > currentIndex + 1) {
      setGateWarning(`Cannot skip intermediate stages. Next permitted stage is ${STAGES[currentIndex + 1]?.label}.`);
      return;
    }

    onTransitionStage(target.canonicalStatus);
  };

  return (
    <div
      className={clsx(
        'rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3 dark:border-slate-800 dark:bg-slate-900 text-left',
        className
      )}
    >
      {/* Top Meta Bar: Stage, Responsible Member & Date */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div>
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            EP Operational Lifecycle Workflow
          </span>
          <span className="ml-2 rounded-sm bg-blue-50 text-blue-700 px-2 py-0.5 text-[10px] font-bold border border-blue-200">
            Current Stage: {currentStageMeta.label}
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <strong className="text-slate-700 dark:text-slate-300">
              {ep.host_manager_name || 'Host Manager'}
            </strong>
          </span>
          <span className="flex items-center gap-1 font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {ep.updated_at ? ep.updated_at.split('T')[0] : 'Today'}
          </span>
        </div>
      </div>

      {/* Gate Warning Alert */}
      {gateWarning && (
        <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-2.5 text-xs font-semibold text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900">
          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{gateWarning}</span>
        </div>
      )}

      {/* Horizontal Stepper Progress Bar */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        {STAGES.map((st, idx) => {
          const isPassed = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isNext = idx === currentIndex + 1;

          return (
            <button
              key={st.id}
              onClick={() => handleStepClick(idx)}
              className={clsx(
                'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer',
                isCurrent &&
                  'bg-blue-600 text-white shadow-xs',
                isPassed &&
                  'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300',
                !isPassed &&
                  !isCurrent &&
                  'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
              )}
            >
              {isPassed ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : isCurrent ? (
                <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-blue-600">
                  {idx + 1}
                </span>
              ) : (
                <Circle className="h-3.5 w-3.5 text-slate-400" />
              )}
              <span>{st.label}</span>
            </button>
          );
        })}
      </div>

      {/* Next Required Action Box */}
      <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs dark:bg-slate-800/60 dark:border-slate-800">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
            Next Action Required
          </span>
          <p className="font-semibold text-slate-800 dark:text-slate-200">
            {currentStageMeta.requiredAction}
          </p>
        </div>

        {nextStageMeta && (
          <button
            onClick={handleAdvance}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors cursor-pointer shrink-0 shadow-xs self-start sm:self-auto"
          >
            <span>Advance to {nextStageMeta.label}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
