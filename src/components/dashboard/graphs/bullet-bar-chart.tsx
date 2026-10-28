'use client';

import React from 'react';
import clsx from 'clsx';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

export interface BulletMetric {
  id: string;
  label: string;
  actual: number;
  target: number;
  unit?: string;
  higherIsBetter?: boolean;
  ranges?: {
    poor: number;
    warning: number;
    good: number;
  };
  subtitle?: string;
}

interface BulletBarChartProps {
  metrics: BulletMetric[];
  title?: string;
  subtitle?: string;
  className?: string;
}

export const BulletBarChart: React.FC<BulletBarChartProps> = ({
  metrics,
  title = 'SLA Process Velocity & Performance Bullets',
  subtitle = 'Actual vs Target with standard qualitative achievement bands',
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
        {metrics.map((m) => {
          const higherIsBetter = m.higherIsBetter ?? true;
          // Scale to max value (e.g. 1.25x the highest of actual, target, or good range)
          const maxVal = Math.max(
            m.actual * 1.15,
            m.target * 1.15,
            m.ranges ? m.ranges.good * 1.1 : 100,
            10
          );

          const actualPct = Math.min(100, Math.max(0, (m.actual / maxVal) * 100));
          const targetPct = Math.min(100, Math.max(0, (m.target / maxVal) * 100));

          const isAchieved = higherIsBetter ? m.actual >= m.target : m.actual <= m.target;
          const isWarning = higherIsBetter
            ? m.actual < m.target && m.actual >= m.target * 0.8
            : m.actual > m.target && m.actual <= m.target * 1.2;

          return (
            <div key={m.id} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  {isAchieved ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : isWarning ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-rose-500" />
                  )}
                  <span className="font-semibold text-slate-800">{m.label}</span>
                  {m.subtitle && <span className="text-[11px] text-slate-400">({m.subtitle})</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">
                    {m.actual}
                    {m.unit}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Target: <strong className="text-slate-600">{m.target}{m.unit}</strong>
                  </span>
                  <span
                    className={clsx(
                      'px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wide',
                      isAchieved
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : isWarning
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    )}
                  >
                    {isAchieved ? 'ACHIEVED' : isWarning ? 'WARNING' : 'BREACH'}
                  </span>
                </div>
              </div>

              {/* Bullet graphic bar */}
              <div className="relative h-6 bg-slate-100 rounded-md overflow-hidden border border-slate-200">
                {/* Background qualitative bands */}
                <div className="absolute inset-0 flex opacity-60">
                  <div className="h-full bg-slate-200 w-1/3" />
                  <div className="h-full bg-slate-150 w-1/3" />
                  <div className="h-full bg-slate-100 w-1/3" />
                </div>

                {/* Actual measure bar */}
                <div
                  className={clsx(
                    'absolute top-1.5 bottom-1.5 left-0 rounded-r transition-all duration-500 shadow-sm',
                    isAchieved
                      ? 'bg-emerald-600'
                      : isWarning
                      ? 'bg-amber-500'
                      : 'bg-rose-600'
                  )}
                  style={{ width: `${actualPct}%` }}
                />

                {/* Target marker line */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-slate-900 z-10 -ml-0.5 rounded-full shadow"
                  style={{ left: `${targetPct}%` }}
                  title={`Target: ${m.target}${m.unit || ''}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
