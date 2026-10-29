'use client';

import React, { useState } from 'react';
import { TeamStandardItem } from '@/lib/members/member-engagement-types';
import { MASTER_TEAM_STANDARDS } from '@/lib/members/member-data';
import {
  ShieldCheck,
  CheckCircle2,
  Circle,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Award,
  Layers,
} from 'lucide-react';

interface TeamStandardsScorecardProps {
  initialStandards?: TeamStandardItem[];
  onUpdateStandards?: (updated: TeamStandardItem[]) => void;
}

export function TeamStandardsScorecard({
  initialStandards = MASTER_TEAM_STANDARDS,
  onUpdateStandards,
}: TeamStandardsScorecardProps) {
  const [standards, setStandards] = useState<TeamStandardItem[]>(initialStandards);
  const [activeStage, setActiveStage] = useState<'ALL' | 'BUILDING' | 'PERFORMING' | 'CLOSING'>('ALL');

  const toggleStandard = (id: string) => {
    const updated = standards.map((item) => {
      if (item.id === id) {
        const nextState = !item.isCompleted;
        return {
          ...item,
          isCompleted: nextState,
          completedAt: nextState ? new Date().toISOString().split('T')[0] : undefined,
        };
      }
      return item;
    });

    setStandards(updated);
    if (onUpdateStandards) onUpdateStandards(updated);
  };

  const totalCount = standards.length;
  const completedCount = standards.filter((s) => s.isCompleted).length;
  const overallPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const buildingItems = standards.filter((s) => s.stage === 'BUILDING');
  const performingItems = standards.filter((s) => s.stage === 'PERFORMING');
  const closingItems = standards.filter((s) => s.stage === 'CLOSING');

  const buildingPct = Math.round((buildingItems.filter((i) => i.isCompleted).length / buildingItems.length) * 100);
  const performingPct = Math.round((performingItems.filter((i) => i.isCompleted).length / performingItems.length) * 100);
  const closingPct = Math.round((closingItems.filter((i) => i.isCompleted).length / closingItems.length) * 100);

  const displayedItems =
    activeStage === 'ALL'
      ? standards
      : standards.filter((s) => s.stage === activeStage);

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      {/* Title & Progress Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-aiesec-blue" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              AIESEC Global Team Standards (TeSt) Scorecard
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Mandate 26.2 operational implementation across Building, Performing, and Closing deliverables.
          </p>
        </div>

        {/* Global Fulfillment Badge */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Overall TeSt Completion</div>
            <div className="text-lg font-extrabold text-aiesec-blue dark:text-blue-400">
              {overallPercentage}% ({completedCount}/{totalCount})
            </div>
          </div>
          <div className="h-10 w-10 rounded-full border-2 border-aiesec-blue/30 p-0.5 flex items-center justify-center">
            <div className="h-full w-full rounded-full bg-aiesec-blue/10 flex items-center justify-center font-bold text-xs text-aiesec-blue">
              {overallPercentage}%
            </div>
          </div>
        </div>
      </div>

      {/* 3 Stage Progress Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Building */}
        <div
          onClick={() => setActiveStage(activeStage === 'BUILDING' ? 'ALL' : 'BUILDING')}
          className={`cursor-pointer rounded-lg border p-3 transition ${
            activeStage === 'BUILDING'
              ? 'border-aiesec-blue bg-blue-50/50 dark:border-blue-700 dark:bg-blue-950/30'
              : 'border-slate-200 bg-slate-50 hover:bg-slate-100/80 dark:border-slate-800 dark:bg-slate-800/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">1. Building Phase</span>
            <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">{buildingPct}%</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Rules, Quotas, PDP & Team Plan</p>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${buildingPct}%` }} />
          </div>
        </div>

        {/* Performing */}
        <div
          onClick={() => setActiveStage(activeStage === 'PERFORMING' ? 'ALL' : 'PERFORMING')}
          className={`cursor-pointer rounded-lg border p-3 transition ${
            activeStage === 'PERFORMING'
              ? 'border-aiesec-blue bg-blue-50/50 dark:border-blue-700 dark:bg-blue-950/30'
              : 'border-slate-200 bg-slate-50 hover:bg-slate-100/80 dark:border-slate-800 dark:bg-slate-800/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">2. Performing Phase</span>
            <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400">{performingPct}%</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Meetings, KPI Tracking & O2Os</p>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${performingPct}%` }} />
          </div>
        </div>

        {/* Closing */}
        <div
          onClick={() => setActiveStage(activeStage === 'CLOSING' ? 'ALL' : 'CLOSING')}
          className={`cursor-pointer rounded-lg border p-3 transition ${
            activeStage === 'CLOSING'
              ? 'border-aiesec-blue bg-blue-50/50 dark:border-blue-700 dark:bg-blue-950/30'
              : 'border-slate-200 bg-slate-50 hover:bg-slate-100/80 dark:border-slate-800 dark:bg-slate-800/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">3. Closing Phase</span>
            <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400">{closingPct}%</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Debriefs, LDM & 100% Handover</p>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${closingPct}%` }} />
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-1.5 pt-1">
        {(['ALL', 'BUILDING', 'PERFORMING', 'CLOSING'] as const).map((stage) => (
          <button
            key={stage}
            onClick={() => setActiveStage(stage)}
            className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
              activeStage === stage
                ? 'bg-aiesec-blue text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {stage === 'ALL' ? 'All Deliverables' : stage.charAt(0) + stage.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Standards Item List */}
      <div className="space-y-2 pt-1">
        {displayedItems.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleStandard(item.id)}
            className={`group flex items-start gap-3 rounded-lg border p-3 transition cursor-pointer ${
              item.isCompleted
                ? 'border-emerald-200/80 bg-emerald-50/20 dark:border-emerald-900/40 dark:bg-emerald-950/20'
                : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900'
            }`}
          >
            <div className="mt-0.5">
              {item.isCompleted ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Circle className="h-4 w-4 text-slate-300 group-hover:text-slate-400 dark:text-slate-600" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold text-slate-400">{item.id}</span>
                <span
                  className={`text-xs font-bold ${
                    item.isCompleted
                      ? 'text-slate-900 line-through opacity-85 dark:text-white'
                      : 'text-slate-900 dark:text-white'
                  }`}
                >
                  {item.title}
                </span>
                <span
                  className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase ${
                    item.stage === 'BUILDING'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : item.stage === 'PERFORMING'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {item.stage}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{item.description}</p>

              {item.isCompleted && item.completedAt && (
                <div className="mt-1.5 flex items-center gap-3 text-[10px] text-slate-400">
                  <span>Completed on {item.completedAt}</span>
                  {item.evidenceUrl && (
                    <a
                      href={item.evidenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 text-aiesec-blue hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View Deliverable Folder
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
