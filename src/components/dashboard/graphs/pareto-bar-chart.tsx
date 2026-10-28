'use client';

import React from 'react';
import clsx from 'clsx';

export interface ParetoItem {
  reason: string;
  count: number;
}

interface ParetoBarChartProps {
  title?: string;
  subtitle?: string;
  items?: ParetoItem[];
  data?: ParetoItem[];
  onSelectReason?: (reason: string) => void;
  className?: string;
}

export const ParetoBarChart: React.FC<ParetoBarChartProps> = ({
  title = 'Why do EPs leave?',
  subtitle = 'Top drop-off reasons ranked desc with cumulative % impact',
  items,
  data,
  onSelectReason,
  className,
}) => {
  const sourceItems = items || data || [];
  if (sourceItems.length === 0) {
    return (
      <div className="p-4 rounded-xl border border-slate-200 bg-white text-center text-xs text-slate-400">
        No drop-off reasons recorded for this term.
      </div>
    );
  }

  // Sort desc and take top 5 + Other
  const sorted = [...sourceItems].sort((a, b) => b.count - a.count);
  const top5 = sorted.slice(0, 5);
  const others = sorted.slice(5);
  const otherCount = others.reduce((acc, curr) => acc + curr.count, 0);

  const displayItems = [...top5];
  if (otherCount > 0) {
    displayItems.push({ reason: 'Other Reasons', count: otherCount });
  }

  const total = displayItems.reduce((acc, curr) => acc + curr.count, 0) || 1;
  const maxCount = Math.max(...displayItems.map((i) => i.count), 1);

  // Calculate cumulative percentages
  let runningSum = 0;
  const dataWithCumulative = displayItems.map((item) => {
    runningSum += item.count;
    const cumPct = Math.round((runningSum / total) * 100);
    return {
      ...item,
      pct: Math.round((item.count / total) * 100),
      cumPct,
    };
  });

  return (
    <div className={clsx('bg-white rounded-xl border border-slate-200 p-4 sm:p-5 text-left', className)}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        <span className="text-[11px] font-semibold text-slate-500">
          Total Lost: <strong className="text-slate-800">{total} EPs</strong>
        </span>
      </div>

      <div className="space-y-3">
        {dataWithCumulative.map((d) => {
          const barWidthPct = Math.round((d.count / maxCount) * 100);
          return (
            <div
              key={d.reason}
              onClick={() => onSelectReason?.(d.reason)}
              className="group cursor-pointer space-y-1"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700 group-hover:text-blue-600 transition-colors truncate max-w-[65%]">
                  {d.reason}
                </span>
                <div className="flex items-center gap-2 text-[11px] font-mono shrink-0">
                  <span className="font-bold text-slate-900">{d.count} EPs</span>
                  <span className="text-slate-400">({d.pct}%)</span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-bold text-[10px]">
                    Σ {d.cumPct}%
                  </span>
                </div>
              </div>

              {/* Bar track */}
              <div className="h-4 w-full bg-slate-100 rounded-sm overflow-hidden flex relative">
                <div
                  className="h-full bg-blue-600 rounded-sm transition-all duration-300 group-hover:bg-blue-500 flex items-center justify-end pr-1.5 text-[9px] font-bold text-white"
                  style={{ width: `${barWidthPct}%` }}
                >
                  {barWidthPct > 20 && `${d.count}`}
                </div>
                {/* 80% Pareto threshold marker */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-rose-400/80 z-10"
                  style={{ left: '80%' }}
                  title="80% Vital Few Line"
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Click any reason to filter lost EP dossier</span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-0.5 bg-rose-400 inline-block" />
          <span>80% Pareto reference line</span>
        </span>
      </div>
    </div>
  );
};
