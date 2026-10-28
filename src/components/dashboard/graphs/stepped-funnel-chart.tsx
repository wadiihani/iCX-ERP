'use client';

import React from 'react';
import clsx from 'clsx';
import { ArrowRight, AlertTriangle } from 'lucide-react';

export interface FunnelStage {
  id: string;
  label: string;
  count: number;
  target?: number;
  color?: string;
  slaDays?: number;
}

interface SteppedFunnelChartProps {
  stages: FunnelStage[];
  title?: string;
  subtitle?: string;
  className?: string;
}

export const SteppedFunnelChart: React.FC<SteppedFunnelChartProps> = ({
  stages,
  title = 'ICX Exchange Funnel Velocity & Conversion',
  subtitle = 'Stage-to-stage volume and conversion drop-off rates',
  className,
}) => {
  if (!stages || stages.length === 0) return null;

  const maxCount = Math.max(...stages.map((s) => s.count), 1);

  return (
    <div className={clsx('rounded-xl border border-slate-200 bg-white p-5 shadow-sm', className)}>
      {(title || subtitle) && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      )}

      <div className="space-y-3">
        {stages.map((stage, idx) => {
          const prev = idx > 0 ? stages[idx - 1] : null;
          const cr = prev && prev.count > 0 ? ((stage.count / prev.count) * 100).toFixed(1) : null;
          const widthPct = Math.max(12, Math.round((stage.count / maxCount) * 100));
          const isBottleneck = cr !== null && parseFloat(cr) < 30;

          return (
            <div key={stage.id} className="relative">
              {/* Conversion Bridge between stages */}
              {prev && (
                <div className="flex items-center gap-2 py-0.5 pl-6 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5 font-medium px-2 py-0.5 rounded-full bg-slate-100 text-[11px]">
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span>CR:</span>
                    <span
                      className={clsx(
                        'font-bold',
                        parseFloat(cr!) >= 60
                          ? 'text-emerald-700'
                          : parseFloat(cr!) >= 35
                          ? 'text-blue-700'
                          : parseFloat(cr!) >= 20
                          ? 'text-amber-700'
                          : 'text-rose-700'
                      )}
                    >
                      {cr}%
                    </span>
                    {isBottleneck && (
                      <span className="flex items-center text-rose-600 ml-1 text-[10px] font-semibold">
                        <AlertTriangle className="w-3 h-3 inline mr-0.5" /> Leakage
                      </span>
                    )}
                  </div>
                  {stage.slaDays !== undefined && (
                    <span className="text-[11px] text-slate-400">
                      Avg SLA: <strong className="text-slate-600">{stage.slaDays}d</strong>
                    </span>
                  )}
                </div>
              )}

              {/* Main Stepped Bar */}
              <div className="flex items-center gap-3">
                <div className="w-24 text-right">
                  <span className="text-xs font-semibold text-slate-700 block truncate" title={stage.label}>
                    {stage.label}
                  </span>
                </div>

                <div className="flex-1 bg-slate-50 h-9 rounded-lg overflow-hidden relative border border-slate-100 p-0.5">
                  <div
                    className={clsx(
                      'h-full rounded-md transition-all duration-500 flex items-center justify-between px-3 text-white font-medium text-xs shadow-inner',
                      stage.color ||
                        (idx === 0
                          ? 'bg-blue-600'
                          : idx === stages.length - 1
                          ? 'bg-emerald-600'
                          : 'bg-indigo-600')
                    )}
                    style={{ width: `${widthPct}%` }}
                  >
                    <span className="font-bold drop-shadow-sm">{stage.count.toLocaleString()}</span>
                    {widthPct > 25 && stage.target && (
                      <span className="text-[10px] text-white/80 font-normal">
                        Target: {stage.target}
                      </span>
                    )}
                  </div>
                </div>

                <div className="w-20 text-left">
                  <span className="text-xs font-bold text-slate-900 block">
                    {stage.count} <span className="text-[10px] font-normal text-slate-400">vol</span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
