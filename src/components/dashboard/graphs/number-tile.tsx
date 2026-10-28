'use client';

import React from 'react';
import clsx from 'clsx';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface NumberTileProps {
  title: string;
  value: string | number;
  target?: string | number;
  wowDelta?: string;
  isLowerBetter?: boolean;
  ragStatus?: 'green' | 'amber' | 'rose' | 'gray';
  formula?: string;
  className?: string;
}

export const NumberTile: React.FC<NumberTileProps> = ({
  title,
  value,
  target,
  wowDelta,
  isLowerBetter = false,
  ragStatus = 'green',
  formula,
  className,
}) => {
  const isPositive = wowDelta?.startsWith('+');
  const isNegative = wowDelta?.startsWith('-');

  let deltaColor = 'text-slate-500 bg-slate-100';
  if (wowDelta) {
    if (isLowerBetter) {
      deltaColor = isNegative
        ? 'text-emerald-700 bg-emerald-50'
        : isPositive
        ? 'text-rose-700 bg-rose-50'
        : 'text-slate-600 bg-slate-100';
    } else {
      deltaColor = isPositive
        ? 'text-emerald-700 bg-emerald-50'
        : isNegative
        ? 'text-rose-700 bg-rose-50'
        : 'text-slate-600 bg-slate-100';
    }
  }

  const ragAccent = {
    green: 'border-l-emerald-500',
    amber: 'border-l-amber-500',
    rose: 'border-l-rose-500',
    gray: 'border-l-slate-300',
  }[ragStatus];

  return (
    <div
      className={clsx(
        'p-3.5 rounded-xl border border-slate-200 bg-white border-l-4 shadow-2xs text-left transition-all hover:border-slate-300',
        ragAccent,
        className
      )}
      title={formula ? `Formula: ${formula}` : undefined}
    >
      <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1.5">
        <span className="truncate">{title}</span>
        {wowDelta && (
          <span
            className={clsx(
              'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-bold tabular-nums',
              deltaColor
            )}
          >
            {isPositive && <TrendingUp className="w-3 h-3" />}
            {isNegative && <TrendingDown className="w-3 h-3" />}
            {!isPositive && !isNegative && <Minus className="w-3 h-3" />}
            {wowDelta}
          </span>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
          {value}
        </span>
        {target !== undefined && (
          <span className="text-xs text-slate-400 font-medium tabular-nums">
            / {target} target
          </span>
        )}
      </div>
    </div>
  );
};
