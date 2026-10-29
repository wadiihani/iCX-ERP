'use client';

import React from 'react';
import clsx from 'clsx';
import { TrendingUp, TrendingDown, Minus, Info, ArrowUpRight } from 'lucide-react';
import { MetricConfidenceLevel } from '@/lib/types/dashboard-spec';

export interface KpiCardMetricProps {
  kpiKey: string;
  title: string;
  value: string | number;
  fractionText?: string; // e.g. "24/112"
  targetText?: string;   // e.g. "target 30" or "target 20%"
  attainmentPct?: number; // e.g. 80%
  deltaText?: string;    // e.g. "+14% MoM"
  trend?: 'UP' | 'DOWN' | 'STABLE';
  isGood?: boolean;
  confidence?: MetricConfidenceLevel;
  authorityName?: string;
  unitLabel?: string;
  onClick?: () => void;
  drillDownUrl?: string;
  className?: string;
}

export const KpiCardMetric: React.FC<KpiCardMetricProps> = ({
  kpiKey,
  title,
  value,
  fractionText,
  targetText,
  attainmentPct,
  deltaText,
  trend = 'STABLE',
  isGood = true,
  confidence = 'VERIFIED_OFFICIAL',
  authorityName,
  unitLabel,
  onClick,
  drillDownUrl,
  className,
}) => {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={clsx(
        'group relative bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs hover:shadow-md hover:border-blue-400 transition-all duration-200 cursor-pointer text-left focus:outline-hidden focus:ring-2 focus:ring-blue-500',
        className
      )}
    >
      {/* Top Header: Title, Authority Badge, Inspect Arrow */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={clsx(
                'inline-flex items-center px-1.5 py-0.5 rounded-sm text-[10px] font-bold tracking-wider uppercase',
                confidence === 'VERIFIED_OFFICIAL'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-purple-50 text-purple-700 border border-purple-200'
              )}
            >
              {confidence === 'VERIFIED_OFFICIAL' ? 'Official AIESEC' : 'Local Metric'}
            </span>
            {authorityName && (
              <span className="text-[10px] text-slate-600 hidden sm:inline truncate">
                · {authorityName}
              </span>
            )}
          </div>
          <h3 className="text-xs sm:text-sm font-semibold text-slate-800 mt-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
        </div>

        <button
          type="button"
          className="shrink-0 p-1 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          title="Inspect metric formula and source records"
          aria-label="Inspect metric"
        >
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main KPI Value & Fraction (X/Y) */}
      <div className="flex items-baseline justify-between gap-2 my-2">
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
            {value}
          </span>
          {unitLabel && (
            <span className="text-xs font-semibold text-slate-500">{unitLabel}</span>
          )}
          {fractionText && (
            <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-sm">
              ({fractionText})
            </span>
          )}
        </div>

        {/* Trend Indicator */}
        {deltaText && (
          <div
            className={clsx(
              'flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full shrink-0',
              isGood
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            )}
          >
            {trend === 'UP' && <TrendingUp className="w-3 h-3" />}
            {trend === 'DOWN' && <TrendingDown className="w-3 h-3" />}
            {trend === 'STABLE' && <Minus className="w-3 h-3" />}
            <span>{deltaText}</span>
          </div>
        )}
      </div>

      {/* Target & Attainment Progress Bar */}
      {(targetText || attainmentPct !== undefined) && (
        <div className="pt-2 border-t border-slate-100 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>{targetText || 'Benchmark'}</span>
            {attainmentPct !== undefined && (
              <span className="font-semibold text-slate-700">{attainmentPct}% achieved</span>
            )}
          </div>
          {attainmentPct !== undefined && (
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className={clsx(
                  'h-full rounded-full transition-all duration-500',
                  attainmentPct >= 100
                    ? 'bg-emerald-500'
                    : attainmentPct >= 75
                    ? 'bg-blue-600'
                    : 'bg-amber-500'
                )}
                style={{ width: `${Math.min(attainmentPct, 100)}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Subtext info footer */}
      <div className="mt-2 pt-1 flex items-center justify-between text-[10px] text-slate-500">
        <span className="font-mono">{kpiKey}</span>
        <span className="group-hover:underline">Click to drill down &rarr;</span>
      </div>
    </div>
  );
};
