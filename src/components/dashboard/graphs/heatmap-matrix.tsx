'use client';

import React from 'react';
import clsx from 'clsx';
import { Star, AlertTriangle } from 'lucide-react';

export interface HeatmapCell {
  colId: string;
  value: number; // 0 - 100 or 0 / 1
  label?: string;
  hasStar?: boolean;
  hasWarning?: boolean;
  subtext?: string;
}

export interface HeatmapRow {
  id: string;
  label: string;
  sublabel?: string;
  cells: HeatmapCell[];
  summaryValue?: string | number;
  summaryLabel?: string;
}

interface HeatmapMatrixProps {
  columns: { id: string; label: string; shortLabel?: string }[];
  rows: HeatmapRow[];
  title?: string;
  subtitle?: string;
  colorScaleType?: 'attendance' | 'standards' | 'percent';
  className?: string;
}

export const HeatmapMatrix: React.FC<HeatmapMatrixProps> = ({
  columns,
  rows,
  title = 'Weekly Routine Attendance & O2O Heatmap Matrix',
  subtitle = 'Green (90-100% on-time), Blue (70-89%), Amber (20-69%), Red (<20% absent). ⭐ indicates Monthly O2O completed.',
  className,
}) => {
  const getCellColor = (val: number) => {
    if (val >= 90) return 'bg-emerald-500 text-white';
    if (val >= 70) return 'bg-blue-500 text-white';
    if (val >= 20) return 'bg-amber-400 text-slate-900';
    return 'bg-rose-500 text-white';
  };

  return (
    <div className={clsx('rounded-xl border border-slate-200 bg-white p-5 shadow-sm overflow-x-auto', className)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
            <span className="text-[11px]">90-100%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" />
            <span className="text-[11px]">70-89%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-amber-400 inline-block" />
            <span className="text-[11px]">20-69%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-rose-500 inline-block" />
            <span className="text-[11px]">&lt;20%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            <span className="text-[11px]">O2O Done</span>
          </div>
        </div>
      </div>

      <div className="min-w-[640px]">
        {/* Header row */}
        <div className="flex items-center border-b border-slate-200 pb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          <div className="w-44 shrink-0 pl-2">Entity / Member</div>
          <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>
            {columns.map((c) => (
              <div key={c.id} className="text-center truncate px-0.5" title={c.label}>
                {c.shortLabel || c.label}
              </div>
            ))}
          </div>
          <div className="w-20 shrink-0 text-right pr-2">Overall</div>
        </div>

        {/* Matrix Rows */}
        <div className="divide-y divide-slate-100 mt-1">
          {rows.map((row) => (
            <div key={row.id} className="flex items-center py-2 hover:bg-slate-50/80 transition-colors">
              <div className="w-44 shrink-0 pl-2">
                <span className="text-xs font-semibold text-slate-900 block truncate" title={row.label}>
                  {row.label}
                </span>
                {row.sublabel && (
                  <span className="text-[10px] text-slate-400 block truncate">{row.sublabel}</span>
                )}
              </div>

              <div
                className="flex-1 grid gap-1 px-1"
                style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
              >
                {row.cells.map((cell) => (
                  <div
                    key={cell.colId}
                    className={clsx(
                      'h-7 rounded flex items-center justify-center font-medium text-[11px] relative transition-transform hover:scale-105 shadow-xs cursor-default select-none',
                      getCellColor(cell.value)
                    )}
                    title={`${row.label} - ${cell.colId}: ${cell.value}% ${cell.hasStar ? '(O2O Done)' : ''}`}
                  >
                    {cell.hasStar && (
                      <Star className="w-3 h-3 absolute top-0.5 right-0.5 text-amber-200 fill-amber-300 drop-shadow-sm" />
                    )}
                    {cell.hasWarning && (
                      <AlertTriangle className="w-3 h-3 absolute top-0.5 right-0.5 text-white fill-rose-600" />
                    )}
                    <span className="text-[10px] font-bold">{cell.label || `${cell.value}%`}</span>
                  </div>
                ))}
              </div>

              <div className="w-20 shrink-0 text-right pr-2">
                <span className="text-xs font-bold text-slate-900 block">
                  {row.summaryValue ?? '-'}
                </span>
                {row.summaryLabel && (
                  <span className="text-[10px] text-slate-400 block">{row.summaryLabel}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
