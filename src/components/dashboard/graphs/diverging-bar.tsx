'use client';

import React from 'react';
import clsx from 'clsx';

interface DivergingNpsBarProps {
  title?: string;
  subtitle?: string;
  npsScore: number; // e.g. +62 (-100 to +100)
  target?: number; // e.g. +50
  promotersPct: number; // e.g. 74%
  passivesPct: number; // e.g. 14%
  detractorsPct: number; // e.g. 12%
  totalResponses?: number;
  className?: string;
}

export const DivergingNpsBar: React.FC<DivergingNpsBarProps> = ({
  title = 'How satisfied are participants? (NPS)',
  subtitle = 'EP Net Promoter Score (% Promoters − % Detractors)',
  npsScore,
  target = 50,
  promotersPct,
  passivesPct,
  detractorsPct,
  totalResponses,
  className,
}) => {
  const isTargetMet = npsScore >= target;

  return (
    <div className={clsx('bg-white rounded-xl border border-slate-200 p-4 sm:p-5 text-left', className)}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className="text-right">
          <div className="flex items-baseline gap-1.5 justify-end">
            <span
              className={clsx(
                'text-2xl font-bold font-mono tracking-tight',
                isTargetMet ? 'text-emerald-600' : 'text-amber-600'
              )}
            >
              {npsScore > 0 ? `+${npsScore}` : npsScore}
            </span>
            <span className="text-xs text-slate-400 font-semibold">/ target +{target}</span>
          </div>
          {totalResponses !== undefined && (
            <span className="text-[10px] text-slate-400">{totalResponses} survey responses</span>
          )}
        </div>
      </div>

      {/* Segmented horizontal diverging bar */}
      <div className="space-y-1.5 my-3">
        <div className="h-4 w-full bg-slate-100 rounded-sm overflow-hidden flex shadow-2xs">
          {/* Detractors (Rose) */}
          <div
            className="bg-rose-500 h-full flex items-center justify-center text-[9px] font-bold text-white transition-all"
            style={{ width: `${detractorsPct}%` }}
            title={`Detractors (0–6): ${detractorsPct}%`}
          >
            {detractorsPct >= 10 && `${detractorsPct}%`}
          </div>
          {/* Passives (Slate/Amber) */}
          <div
            className="bg-slate-300 h-full flex items-center justify-center text-[9px] font-bold text-slate-700 transition-all"
            style={{ width: `${passivesPct}%` }}
            title={`Passives (7–8): ${passivesPct}%`}
          >
            {passivesPct >= 10 && `${passivesPct}%`}
          </div>
          {/* Promoters (Emerald) */}
          <div
            className="bg-emerald-500 h-full flex items-center justify-center text-[9px] font-bold text-white transition-all"
            style={{ width: `${promotersPct}%` }}
            title={`Promoters (9–10): ${promotersPct}%`}
          >
            {promotersPct >= 10 && `${promotersPct}%`}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-rose-500" />
            <span>Detractors (0–6): <strong className="text-slate-800">{detractorsPct}%</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-slate-300" />
            <span>Passives (7–8): <strong className="text-slate-800">{passivesPct}%</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
            <span>Promoters (9–10): <strong className="text-slate-800">{promotersPct}%</strong></span>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Formula: % Promoters − % Detractors</span>
        <span className={clsx('font-bold', isTargetMet ? 'text-emerald-600' : 'text-amber-600')}>
          {isTargetMet ? '✓ Above Target (+50)' : '⚠️ Below Target (+50)'}
        </span>
      </div>
    </div>
  );
};
