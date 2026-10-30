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
        'group relative rounded-xl border p-4 sm:p-5 text-left transition-all duration-200 cursor-pointer select-none outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500',
        isSelected
          ? 'bg-blue-50/30 border-blue-500 shadow-md ring-2 ring-blue-500/30'
          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm',
        className
      )}
    >
      {/* Active Indicator Top Edge Bar */}
      {isSelected && (
        <div className="absolute top-0 left-4 right-4 h-1 bg-blue-600 rounded-b-md" />
      )}

      {/* Header: Domain Number, Title & Health Badge */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span
            className={clsx(
              'w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0 transition-colors',
              isSelected
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
            )}
          >
            {card.number}
          </span>
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
            {card.title}
          </h2>
        </div>

        {/* Health status badge */}
        <span
          className={clsx(
            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 border uppercase tracking-wider',
            isHealthy
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : isWarning
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          )}
        >
          {isHealthy ? (
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          ) : isWarning ? (
            <AlertTriangle className="w-3 h-3 text-amber-600" />
          ) : (
            <XCircle className="w-3 h-3 text-rose-600" />
          )}
          {card.healthLabel || (isHealthy ? 'On Track' : isWarning ? 'At Risk' : 'Breach')}
        </span>
      </div>

      {/* Primary Measure of Success (MoS) */}
      <div className="mb-3.5 bg-slate-50/80 rounded-lg p-3 border border-slate-100">
        <div className="text-[11px] font-medium text-slate-500 mb-1">
          {card.primaryMos.label}
        </div>
        <div className="flex items-baseline justify-between gap-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-[28px] font-semibold text-slate-900 tracking-tight tabular-nums">
              {card.primaryMos.value}
            </span>
            {card.primaryMos.target && (
              <span className="text-xs text-slate-500 font-normal">
                / {card.primaryMos.target}
              </span>
            )}
          </div>
          {card.primaryMos.attainmentPct !== undefined && (
            <span
              className={clsx(
                'text-xs font-semibold px-2 py-0.5 rounded-sm tabular-nums',
                card.primaryMos.attainmentPct >= 80
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : card.primaryMos.attainmentPct >= 50
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              )}
            >
              {card.primaryMos.attainmentPct}%
            </span>
          )}
        </div>
      </div>

      {/* 3 Headline KPIs (NT style) */}
      <div className="grid grid-cols-3 gap-2.5 mb-2.5 text-left">
        {card.headlineKpis.map((kpi, idx) => {
          // Check if metric is inverted (lower is better: time, days, hours, stale, breach)
          const lowerIsBetter = /speed|time|days|hours|stale|breach|reject|overdue/i.test(kpi.label);
          const isUpGood = lowerIsBetter ? false : true;
          const isUp = kpi.delta?.direction === 'up';
          const isDown = kpi.delta?.direction === 'down';

          const deltaColor = isUp
            ? isUpGood
              ? 'text-emerald-600'
              : 'text-rose-600'
            : isDown
            ? isUpGood
              ? 'text-rose-600'
              : 'text-emerald-600'
            : 'text-slate-400';

          return (
            <div key={idx} className="space-y-0.5">
              <span className="text-[11px] text-slate-500 font-normal block truncate" title={kpi.label}>
                {kpi.label}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-sm sm:text-base font-semibold text-slate-900 truncate tabular-nums">
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

      {/* Embedded Micro-Visual Preview */}
      <DomainCardMicroVisual card={card} />

      {/* Expanded status hint */}
      <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-slate-600 pt-1 border-t border-slate-100/80">
        <span className={clsx(isSelected ? 'text-blue-600 font-bold' : 'group-hover:text-slate-800')}>
          {isSelected ? 'Workspace Active' : 'Inspect details'}
        </span>
        <ChevronDown
          className={clsx(
            'w-3.5 h-3.5 transition-transform duration-200',
            isSelected ? 'rotate-180 text-blue-600' : 'text-slate-400 group-hover:translate-y-0.5'
          )}
        />
      </div>
    </div>
  );
};
