'use client';

import React, { useState } from 'react';
import clsx from 'clsx';

export interface QuadrantPoint {
  id: string;
  name: string;
  x: number; // 0 - 100
  y: number; // 0 - 100
  category?: string;
  size?: number;
  highlight?: boolean;
  tooltipText?: string;
}

interface QuadrantScatterPlotProps {
  points: QuadrantPoint[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  midX?: number;
  midY?: number;
  quadrantLabels?: {
    topRight: string;
    topLeft: string;
    bottomRight: string;
    bottomLeft: string;
  };
  title?: string;
  subtitle?: string;
  className?: string;
}

export const QuadrantScatterPlot: React.FC<QuadrantScatterPlotProps> = ({
  points,
  xAxisLabel = 'Engagement & Attendance Rate (%)',
  yAxisLabel = 'Operational Results / KPI Achievement (%)',
  midX = 70,
  midY = 70,
  quadrantLabels = {
    topRight: '🟢 Role Models (Scale & Promote)',
    topLeft: '🟡 Lone Wolves (Coach Culture & Routines)',
    bottomRight: '🔵 Culture Champions (Coach Skills & Conversion)',
    bottomLeft: '🔴 At-Risk / Drop-Off (Intervene or Reassign)',
  },
  title = '2×2 Strategic Decision Matrix',
  subtitle = 'Automatic grouping into 4 actionable management decisions',
  className,
}) => {
  const [activePoint, setActivePoint] = useState<QuadrantPoint | null>(null);

  return (
    <div className={clsx('rounded-xl border border-slate-200 bg-white p-5 shadow-sm', className)}>
      {(title || subtitle) && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      )}

      {/* Quadrant Canvas Container */}
      <div className="relative w-full aspect-[4/3] max-h-[360px] bg-slate-50/50 rounded-lg border border-slate-200 p-8 select-none">
        {/* Background Quadrant Labels */}
        <div className="absolute top-3 right-4 text-[11px] font-bold text-emerald-700/80 bg-emerald-50/70 px-2 py-0.5 rounded border border-emerald-200/50">
          {quadrantLabels.topRight}
        </div>
        <div className="absolute top-3 left-4 text-[11px] font-bold text-amber-700/80 bg-amber-50/70 px-2 py-0.5 rounded border border-amber-200/50">
          {quadrantLabels.topLeft}
        </div>
        <div className="absolute bottom-6 right-4 text-[11px] font-bold text-blue-700/80 bg-blue-50/70 px-2 py-0.5 rounded border border-blue-200/50">
          {quadrantLabels.bottomRight}
        </div>
        <div className="absolute bottom-6 left-4 text-[11px] font-bold text-rose-700/80 bg-rose-50/70 px-2 py-0.5 rounded border border-rose-200/50">
          {quadrantLabels.bottomLeft}
        </div>

        {/* Midpoint crosshair guide lines */}
        <div
          className="absolute top-0 bottom-0 border-l border-dashed border-slate-300 pointer-events-none"
          style={{ left: `${midX}%` }}
        >
          <span className="absolute bottom-1 -translate-x-1/2 text-[9px] font-bold text-slate-400 bg-white px-1 rounded">
            Target {midX}%
          </span>
        </div>
        <div
          className="absolute left-0 right-0 border-t border-dashed border-slate-300 pointer-events-none"
          style={{ top: `${100 - midY}%` }}
        >
          <span className="absolute left-1 -translate-y-1/2 text-[9px] font-bold text-slate-400 bg-white px-1 rounded">
            Target {midY}%
          </span>
        </div>

        {/* Scatter Points */}
        {points.map((pt) => {
          const isTopRight = pt.x >= midX && pt.y >= midY;
          const isTopLeft = pt.x < midX && pt.y >= midY;
          const isBottomRight = pt.x >= midX && pt.y < midY;

          const colorClass = isTopRight
            ? 'bg-emerald-600 ring-emerald-300'
            : isTopLeft
            ? 'bg-amber-500 ring-amber-300'
            : isBottomRight
            ? 'bg-blue-600 ring-blue-300'
            : 'bg-rose-600 ring-rose-300';

          return (
            <div
              key={pt.id}
              className={clsx(
                'absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer transition-all duration-200 group',
                pt.highlight ? 'z-30 scale-125' : 'z-20 hover:scale-125'
              )}
              style={{
                left: `${Math.min(95, Math.max(5, pt.x))}%`,
                top: `${Math.min(95, Math.max(5, 100 - pt.y))}%`,
              }}
              onMouseEnter={() => setActivePoint(pt)}
              onMouseLeave={() => setActivePoint(null)}
            >
              <div
                className={clsx(
                  'w-6 h-6 rounded-full text-white text-[10px] font-bold flex items-center justify-center shadow-md ring-2',
                  colorClass
                )}
              >
                {pt.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </div>

              {/* Point Name label beneath bubble */}
              <span className="absolute top-7 text-[10px] font-semibold text-slate-700 bg-white/90 px-1 rounded shadow-xs whitespace-nowrap pointer-events-none group-hover:font-bold">
                {pt.name.split(' ')[0]} ({pt.x}%, {pt.y}%)
              </span>
            </div>
          );
        })}

        {/* Hover / Active Detail Tooltip */}
        {activePoint && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-xl pointer-events-none flex items-center gap-2">
            <span className="font-bold">{activePoint.name}</span>
            <span className="text-slate-300">|</span>
            <span>X: {activePoint.x}%</span>
            <span>Y: {activePoint.y}%</span>
            {activePoint.tooltipText && (
              <>
                <span className="text-slate-300">|</span>
                <span className="text-emerald-300">{activePoint.tooltipText}</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Axis Titles */}
      <div className="flex items-center justify-between text-xs text-slate-500 mt-2 px-2 font-medium">
        <span>← Low</span>
        <span className="font-semibold text-slate-700">{xAxisLabel}</span>
        <span>High →</span>
      </div>
    </div>
  );
};
