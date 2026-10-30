'use client';

import React from 'react';
import Link from 'next/link';
import {
  Users,
  CheckCircle2,
  TrendingUp,
  Briefcase,
  Building2,
  DollarSign,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import clsx from 'clsx';
import { ExecutiveOutcomeCards, ExecutiveSupplyCards } from '@/lib/types/dashboard-spec';

interface ExecutivePriorityKpiBarProps {
  outcomes: ExecutiveOutcomeCards;
  supply: ExecutiveSupplyCards;
  onInspectKpi?: (key: string) => void;
  className?: string;
}

export const ExecutivePriorityKpiBar: React.FC<ExecutivePriorityKpiBarProps> = ({
  outcomes,
  supply,
  onInspectKpi,
  className,
}) => {
  const kpis = [
    {
      id: 'applications',
      kpiKey: 'KPI-FUNNEL-01',
      title: 'EP Applications',
      value: '112',
      denominator: '/ 130 target',
      achievementPct: 86.2,
      delta: '+14 vs last period',
      deltaDirection: 'up' as const,
      statusLabel: 'Optimal',
      statusVariant: 'success' as const,
      icon: Users,
      formula: 'Count of unique EXPA applied profiles',
      moduleHref: '/crm',
      moduleLabel: 'EP Tracker',
    },
    {
      id: 'approvals',
      kpiKey: 'KPI-FUNNEL-03',
      title: 'EP Approvals',
      value: '31',
      denominator: '/ 40 target',
      achievementPct: 77.5,
      delta: '+6 vs last period',
      deltaDirection: 'up' as const,
      statusLabel: 'On Track',
      statusVariant: 'success' as const,
      icon: CheckCircle2,
      formula: 'Signed Acceptance Note + Fee Paid',
      moduleHref: '/crm',
      moduleLabel: 'Approvals',
    },
    {
      id: 'realizations',
      kpiKey: 'KPI-FUNNEL-02',
      title: 'EP Realizations',
      value: `${outcomes.realized.current}`,
      denominator: `/ ${outcomes.realized.target} target`,
      achievementPct: Math.round((outcomes.realized.current / outcomes.realized.target) * 100),
      delta: outcomes.realized.deltaText || '+4 on track',
      deltaDirection: outcomes.realized.trend === 'DOWN' ? ('down' as const) : ('up' as const),
      statusLabel: outcomes.realized.isGood ? 'Optimal' : 'Active',
      statusVariant: 'success' as const,
      icon: TrendingUp,
      formula: 'Physical arrival & Day-1 on-site onboarding',
      moduleHref: '/crm',
      moduleLabel: 'Realizations',
    },
    {
      id: 'slot-capacity',
      kpiKey: 'KPI-CAP-01',
      title: 'Active Opportunity Slots',
      value: `${supply.slotFillRate.fractionText}`,
      denominator: 'slots filled',
      achievementPct: 80.0,
      delta: '+8 slots filled',
      deltaDirection: 'up' as const,
      statusLabel: '80.0% filled',
      statusVariant: 'success' as const,
      icon: Briefcase,
      formula: 'Filled slots ÷ total verified capacity',
      moduleHref: '/opportunities',
      moduleLabel: 'Slot Capacity',
    },
    {
      id: 'b2b-pipeline',
      kpiKey: 'KPI-CRM-01',
      title: 'Partner B2B Pipeline',
      value: '245k MAD',
      denominator: '14 active deals',
      achievementPct: 98.0,
      delta: '+35k MAD vs target',
      deltaDirection: 'up' as const,
      statusLabel: 'Healthy',
      statusVariant: 'success' as const,
      icon: Building2,
      formula: 'Weighted value of discovery to agreement deals',
      moduleHref: '/sales',
      moduleLabel: 'Deal Pipeline',
    },
    {
      id: 'sustainability',
      kpiKey: 'KPI-FIN-01',
      title: 'Financial Sustainability',
      value: '1.32x',
      denominator: '+29.2k MAD reserve',
      achievementPct: 132.0,
      delta: '+0.12x vs floor',
      deltaDirection: 'up' as const,
      statusLabel: 'Surplus',
      statusVariant: 'success' as const,
      icon: DollarSign,
      formula: 'Total inflows ÷ operational delivery costs',
      moduleHref: '/dashboards',
      moduleLabel: 'AFPM Reserve',
    },
  ];

  return (
    <section className={clsx('space-y-2.5', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Executive KPI Overview — Priority Signals
          </h2>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            6 core operational drivers with verified targets, formulas, and direct module links.
          </p>
        </div>
        <span className="text-[10px] font-semibold text-slate-400">
          Click any card to inspect or drill down
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.id}
              className="group relative flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs hover:border-blue-400 hover:shadow-xs transition-all duration-150 text-left dark:border-slate-800 dark:bg-slate-900"
            >
              <div>
                {/* Header: Title & Icon */}
                <div className="flex items-center justify-between gap-1.5 mb-1.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
                    {kpi.title}
                  </span>
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-50 dark:bg-slate-800 text-slate-500 group-hover:text-blue-600 transition-colors shrink-0">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                </div>

                {/* Primary Number */}
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white tabular-nums">
                    {kpi.value}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-400 truncate">
                  {kpi.denominator}
                </div>
              </div>

              {/* Status & Subtitle info */}
              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span
                    className={clsx(
                      'rounded px-1.5 py-0.2 font-bold border',
                      kpi.statusVariant === 'success'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300'
                    )}
                  >
                    {kpi.statusLabel}
                  </span>
                  <span className="font-semibold text-slate-600 dark:text-slate-300 tabular-nums">
                    {kpi.achievementPct}%
                  </span>
                </div>

                <div className="flex items-center justify-between pt-0.5">
                  <button
                    onClick={() => onInspectKpi?.(kpi.kpiKey)}
                    className="text-[10px] font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400 flex items-center gap-0.5 cursor-pointer"
                  >
                    Inspect
                    <ArrowUpRight className="h-2.5 w-2.5" />
                  </button>

                  <Link
                    href={kpi.moduleHref}
                    className="text-[10px] font-medium text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                  >
                    {kpi.moduleLabel} →
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
