'use client';

import React from 'react';
import clsx from 'clsx';

export interface StackedSegment {
  id: string;
  label: string;
  value: number;
  color: string;
  badgeText?: string;
}

export interface StackedRow {
  id: string;
  title: string;
  subtitle?: string;
  total?: number;
  segments: StackedSegment[];
}

interface StackedHorizontalBarProps {
  rows: StackedRow[];
  title?: string;
  subtitle?: string;
  showPercent?: boolean;
  className?: string;
}

export const StackedHorizontalBar: React.FC<StackedHorizontalBarProps> = ({
  rows,
  title = 'Distribution & Composition Breakdown',
  subtitle = '100% aligned horizontal distribution with direct volume & share labels',
  showPercent = true,
  className,
}) => {
  return (
    <div className={clsx('rounded-xl border border-slate-200 bg-white p-5 shadow-sm', className)}>
      {(title || subtitle) && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      )}

      <div className="space-y-4">
        {rows.map((row) => {
          const rowTotal = row.total ?? row.segments.reduce((acc, s) => acc + s.value, 0);
          const safeTotal = rowTotal > 0 ? rowTotal : 1;

          return (
            <div key={row.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-800">{row.title}</span>
                  {row.subtitle && <span className="text-[11px] text-slate-400 ml-1.5">({row.subtitle})</span>}
                </div>
                <span className="font-bold text-slate-900">
                  Total: {rowTotal.toLocaleString()}
                </span>
              </div>

              {/* 100% Stacked bar */}
              <div className="h-8 w-full bg-slate-100 rounded-lg overflow-hidden flex shadow-inner border border-slate-200">
                {row.segments.map((seg) => {
                  const pct = Math.round((seg.value / safeTotal) * 100);
                  if (seg.value === 0 && pct === 0) return null;

                  return (
                    <div
                      key={seg.id}
                      className={clsx(
                        'h-full transition-all duration-500 flex items-center justify-center text-white text-[11px] font-bold px-1 relative group truncate',
                        seg.color
                      )}
                      style={{ width: `${(seg.value / safeTotal) * 100}%` }}
                      title={`${seg.label}: ${seg.value} (${pct}%)`}
                    >
                      {pct >= 10 && (
                        <span className="drop-shadow-sm truncate">
                          {seg.value} {showPercent && <span className="text-[9px] font-normal opacity-90">({pct}%)</span>}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Segment Legend with direct counts */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 pt-0.5">
                {row.segments.map((seg) => {
                  const pct = Math.round((seg.value / safeTotal) * 100);
                  return (
                    <div key={seg.id} className="flex items-center gap-1.5">
                      <span className={clsx('w-2.5 h-2.5 rounded-sm shrink-0', seg.color)} />
                      <span className="text-[11px] font-medium text-slate-700">{seg.label}:</span>
                      <span className="text-[11px] font-bold text-slate-900">
                        {seg.value} <span className="text-slate-400 font-normal">({pct}%)</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
