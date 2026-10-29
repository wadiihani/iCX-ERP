'use client';

import React from 'react';
import clsx from 'clsx';
import {
  Filter,
  RotateCcw,
  RefreshCw,
  Layers,
  Calendar,
  Building,
  Target,
  ChevronDown,
} from 'lucide-react';
import {
  ProgramType,
  CohortPeriod,
  TermMandate,
} from '@/lib/types/dashboard-spec';

export interface ExecutiveFilterState {
  term: TermMandate;
  program: ProgramType;
  cohort: CohortPeriod;
  project: string;
  viewMode: 'EXECUTIVE_4ROW' | 'FUNCTIONAL_HUBS' | 'DOMAIN_GRID';
}

interface ExecutiveFilterBarProps {
  filters: ExecutiveFilterState;
  onFilterChange: (updated: Partial<ExecutiveFilterState>) => void;
  onReset: () => void;
  lastRefreshedText?: string;
}

export const ExecutiveFilterBar: React.FC<ExecutiveFilterBarProps> = ({
  filters,
  onFilterChange,
  onReset,
  lastRefreshedText = 'Just now',
}) => {
  return (
    <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-2.5 shadow-2xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: View Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => onFilterChange({ viewMode: 'EXECUTIVE_4ROW' })}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5',
              filters.viewMode === 'EXECUTIVE_4ROW'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span>Executive 4-Row</span>
          </button>

          <button
            onClick={() => onFilterChange({ viewMode: 'FUNCTIONAL_HUBS' })}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5',
              filters.viewMode === 'FUNCTIONAL_HUBS'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>Workflow Hubs (6)</span>
          </button>

          <button
            onClick={() => onFilterChange({ viewMode: 'DOMAIN_GRID' })}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5',
              filters.viewMode === 'DOMAIN_GRID'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <span className="w-2 h-2 rounded-full bg-purple-600" />
            <span>3x3 Domain Grid</span>
          </button>
        </div>

        {/* Center: Global Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Term Mandate */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700">
            <span className="text-[10px] uppercase font-bold text-slate-400 mr-1.5">Term</span>
            <select
              value={filters.term}
              onChange={(e) => onFilterChange({ term: e.target.value as TermMandate })}
              className="bg-transparent font-semibold text-slate-900 focus:outline-hidden cursor-pointer"
            >
              <option value="26.2">Mandate 26.2</option>
              <option value="26.1">Mandate 26.1</option>
              <option value="CUSTOM">Custom Range</option>
            </select>
          </div>

          {/* Program: iGV vs iGT */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700">
            <span className="text-[10px] uppercase font-bold text-slate-400 mr-1.5">Program</span>
            <select
              value={filters.program}
              onChange={(e) => onFilterChange({ program: e.target.value as ProgramType })}
              className="bg-transparent font-semibold text-slate-900 focus:outline-hidden cursor-pointer"
            >
              <option value="iGV">iGV (Global Volunteer)</option>
              <option value="iGTa">iGTa (Talent Global)</option>
              <option value="iGTe">iGTe (Teacher Global)</option>
              <option value="ALL">All Programs</option>
            </select>
          </div>

          {/* Cohort Window */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700">
            <span className="text-[10px] uppercase font-bold text-slate-400 mr-1.5">Cohort</span>
            <select
              value={filters.cohort}
              onChange={(e) => onFilterChange({ cohort: e.target.value as CohortPeriod })}
              className="bg-transparent font-semibold text-slate-900 focus:outline-hidden cursor-pointer"
            >
              <option value="2026-Q2">Cohort 2026-Q2 (Active)</option>
              <option value="2026-Q1">Cohort 2026-Q1</option>
              <option value="PEAK_SUMMER">Peak Summer 26.2</option>
              <option value="PEAK_WINTER">Peak Winter 26.1</option>
              <option value="ALL">All Cohorts</option>
            </select>
          </div>

          {/* Reset button */}
          <button
            onClick={onReset}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            title="Reset to default filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Data Freshness Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span>Live DB · {lastRefreshedText}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
