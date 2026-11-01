'use client';

import React from 'react';
import clsx from 'clsx';
import { ArrowUpRight, ArrowDownRight, Minus, ChevronDown, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { DomainCardSummary, DomainId } from '@/lib/dashboard/dashboard-types';
import { DomainCardMicroVisual } from './graphs/micro-visuals';

interface DomainKpiCardProps {
  card: DomainCardSummary;
  isSelected: boolean;
  onSelect: (id: DomainId) => void;
  className?: string;
}

export const DomainKpiCard: React.FC<DomainKpiCardProps> = ({
  card,
  isSelected,
  onSelect,
  className,
}) => {
  const isHealthy = card.healthStatus === 'green';
  const isWarning = card.healthStatus === 'amber';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(card.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(card.id);
        }
      }}
      className={clsx(
        'group relative rounded-xl border p-4 sm:p-5 text-left transition-colors duration-150 cursor-pointer select-none outline-hidden focus-visible:ring-1 focus-visible:ring-blue-500',
        isSelected
          ? 'bg-blue-50/40 border-blue-600 ring-1 ring-blue-600 dark:bg-blue-950/20 dark:border-blue-500'
          : 'bg-white border-slate-200 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800 dark:hover:border-slate-700',
        className
      )}
    >
      {/* Active Indicator Top Edge Bar */}
      {isSelected && (
        <div className="absolute top-0 left-4 right-4 h-0.5 bg-blue-600 rounded-b-sm" />
      )}

      {/* Header: Domain Number, Title & Health Badge */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span
            className={clsx(
              'w-6 h-6 rounded-md flex items-center justify-center text-xs font-semibold shrink-0 transition-colors',
              isSelected
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 group-hover:bg-slate-200'
            )}
          >
            {card.number}
          </span>
          <h2 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors line-clamp-1">
            {card.title}
          </h2>
        </div>

        {/* Health status badge */}
        <span
          className={clsx(
            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 border uppercase tracking-wider',
            isHealthy
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
              : isWarning
              ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
              : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
          )}
        >
          {isHealthy ? (
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          ) : isWarning ? (
            <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
          ) : (
            <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
          )}
          {card.healthLabel || (isHealthy ? 'On Track' : isWarning ? 'At Risk' : 'Breach')}
        </span>
      </div>

      {/* Primary Measure of Success (MoS) */}
      <div className="mb-3.5 bg-slate-50 dark:bg-slate-850 rounded-lg p-3 border border-slate-100 dark:border-slate-800">
        <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
          {card.primaryMos.label}
        </div>
        <div className="flex items-baseline justify-between gap-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-[28px] font-semibold text-slate-900 dark:text-white tracking-tight tabular-nums">
              {card.primaryMos.value}
            </span>
            {card.primaryMos.target && (
              <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                / {card.primaryMos.target}
              </span>
            )}
          </div>
          {card.primaryMos.attainmentPct !== undefined && (
            <span
              className={clsx(
                'text-xs font-semibold px-2 py-0.5 rounded-sm tabular-nums border',
                card.primaryMos.attainmentPct >= 80
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                  : card.primaryMos.attainmentPct >= 50
                  ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
                  : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
              )}
            >
              {card.primaryMos.attainmentPct}%
            </span>
          )}
        </div>
      </div>

      {/* 3 Headline KPIs */}
      <div className="grid grid-cols-3 gap-2.5 mb-2.5 text-left">
        {card.headlineKpis.map((kpi, idx) => {
          const lowerIsBetter = /speed|time|days|hours|stale|breach|reject|overdue/i.test(kpi.label);
          const isUpGood = !lowerIsBetter;
          const isUp = kpi.delta?.direction === 'up';
          const isDown = kpi.delta?.direction === 'down';

          const deltaColor = isUp
            ? isUpGood
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-rose-600 dark:text-rose-400'
            : isDown
            ? isUpGood
              ? 'text-rose-600 dark:text-rose-400'
              : 'text-emerald-600 dark:text-emerald-400'
            : 'text-slate-400';

          return (
            <div key={idx} className="space-y-0.5">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal block truncate" title={kpi.label}>
                {kpi.label}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 truncate tabular-nums">
                  {kpi.value}
                </span>
                {kpi.delta && (
                  <span className={clsx('text-[10px] font-semibold flex items-center shrink-0', deltaColor)}>
                    {isUp ? (
                      <ArrowUpRight className="w-2.5 h-2.5" />
                    ) : isDown ? (
                      <ArrowDownRight className="w-2.5 h-2.5" />
                    ) : (
                      <Minus className="w-2.5 h-2.5" />
                    )}
                    {kpi.delta.value}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Embedded Nivo Micro-Visual */}
      <DomainCardMicroVisual card={card} />

      {/* Expanded status hint */}
      <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
        <span className={clsx(isSelected ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'group-hover:text-slate-800 dark:group-hover:text-slate-200')}>
          {isSelected ? 'Workspace Active' : 'Inspect details'}
        </span>
        <ChevronDown
          className={clsx(
            'w-3.5 h-3.5 transition-transform duration-150',
            isSelected ? 'rotate-180 text-blue-600 dark:text-blue-400' : 'text-slate-400 group-hover:translate-y-0.5'
          )}
        />
      </div>
    </div>
  );
};
