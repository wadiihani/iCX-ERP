'use client';

import React from 'react';
import clsx from 'clsx';
import { Filter, RotateCcw, Calendar, Layers, Cpu, Users, ChevronDown } from 'lucide-react';
import { GlobalDashboardFilters } from '@/lib/dashboard/dashboard-types';

interface DashboardFilterBarProps {
  filters: GlobalDashboardFilters;
  onFilterChange: (updated: Partial<GlobalDashboardFilters>) => void;
  onReset: () => void;
  className?: string;
}

export const DashboardFilterBar: React.FC<DashboardFilterBarProps> = ({
  filters,
  onFilterChange,
  onReset,
  className,
}) => {
  const isFiltered =
    filters.term !== '26.2' ||
    filters.product !== 'All' ||
    filters.engine !== 'All' ||
    filters.role !== 'All' ||
    Boolean(filters.memberId);

  return (
    <div
      className={clsx(
        'sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 py-3 px-4 sm:px-6 shadow-xs transition-all',
        className
      )}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Title & Filter Label */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Level 1 Command Filter
              </span>
              {isFiltered && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700">
                  Filtered
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              Reactive slice across Mandate, Portfolio, Rabat Engine &amp; Leadership Roles
            </p>
          </div>
        </div>

        {/* Right: Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Term Filter */}
          <div className="relative">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-slate-300 text-xs text-slate-700 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <label htmlFor="term-select" className="sr-only">Term</label>
              <select
                id="term-select"
                aria-label="Term"
                value={filters.term}
                onChange={(e) => onFilterChange({ term: e.target.value as any })}
                className="bg-transparent font-medium text-slate-800 focus:outline-hidden cursor-pointer pr-4"
              >
                <option value="26.2">Term: 26.2 (Current)</option>
                <option value="26.1">Term: 26.1 (Preceding)</option>
                <option value="Peak: Summer">Peak: Summer 26</option>
                <option value="Peak: Winter">Peak: Winter 26</option>
                <option value="Custom">Custom Date Range</option>
              </select>
            </div>
          </div>

          {/* Product Filter */}
          <div className="relative">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-slate-300 text-xs text-slate-700 shadow-2xs">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <label htmlFor="product-select" className="sr-only">Product</label>
              <select
                id="product-select"
                aria-label="Product"
                value={filters.product}
                onChange={(e) => onFilterChange({ product: e.target.value as any })}
                className="bg-transparent font-medium text-slate-800 focus:outline-hidden cursor-pointer pr-4"
              >
                <option value="All">Product: All ICX</option>
                <option value="iGV">iGV (Global Volunteer)</option>
                <option value="iGTa">iGTa (Global Talent)</option>
                <option value="iGTe">iGTe (Global Teacher)</option>
              </select>
            </div>
          </div>

          {/* Engine Filter */}
          <div className="relative">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-slate-300 text-xs text-slate-700 shadow-2xs">
              <Cpu className="w-3.5 h-3.5 text-slate-400" />
              <label htmlFor="engine-select" className="sr-only">Engine</label>
              <select
                id="engine-select"
                aria-label="Engine"
                value={filters.engine}
                onChange={(e) => onFilterChange({ engine: e.target.value as any })}
                className="bg-transparent font-medium text-slate-800 focus:outline-hidden cursor-pointer pr-4"
              >
                <option value="All">Engine: All Engines</option>
                <option value="External">External (BD, Sales, Partner)</option>
                <option value="Internal">Internal (Ops, IR, Quality, Visa)</option>
              </select>
            </div>
          </div>

          {/* Role Filter */}
          <div className="relative">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-slate-300 text-xs text-slate-700 shadow-2xs">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <label htmlFor="role-select" className="sr-only">Role</label>
              <select
                id="role-select"
                aria-label="Role"
                value={filters.role}
                onChange={(e) => onFilterChange({ role: e.target.value as any })}
                className="bg-transparent font-medium text-slate-800 focus:outline-hidden cursor-pointer pr-4"
              >
                <option value="All">Role: All Members</option>
                <option value="LCVP">LCVP ICX</option>
                <option value="MM_TL">Team Leader / MM</option>
                <option value="TM">Team Member (TM)</option>
              </select>
            </div>
          </div>

          {/* Reset button */}
          {isFiltered && (
            <button
              onClick={onReset}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-600 transition-colors shadow-2xs"
              title="Reset all filters to default"
            >
              <RotateCcw className="w-3 h-3 text-slate-500" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
