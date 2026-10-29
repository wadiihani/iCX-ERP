'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import {
  ActionQueueItem,
  ActionQueueCategory,
} from '@/lib/types/dashboard-spec';
import {
  AlertTriangle,
  AlertCircle,
  Clock,
  User,
  ArrowRight,
  ShieldAlert,
  Filter,
  CheckCircle2,
} from 'lucide-react';

interface ExecutiveRowActionQueueProps {
  queueItems: ActionQueueItem[];
  onOpenDrawer?: (item: ActionQueueItem) => void;
}

export const ExecutiveRowActionQueue: React.FC<ExecutiveRowActionQueueProps> = ({
  queueItems,
  onOpenDrawer,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: queueItems.length,
      OVERDUE_STANDARDS: 0,
      UNMATCHED_EPS: 0,
      STALE_DEALS: 0,
      ARRIVALS_READINESS: 0,
      HIGH_SEVERITY_CASES: 0,
      OVERDUE_INVOICES: 0,
    };

    queueItems.forEach((item) => {
      if (counts[item.category] !== undefined) {
        counts[item.category] += 1;
      }
    });

    return [
      { id: 'ALL', label: 'All Action Items', count: counts.ALL },
      { id: 'OVERDUE_STANDARDS', label: 'Standards Overdue', count: counts.OVERDUE_STANDARDS },
      { id: 'UNMATCHED_EPS', label: 'Unmatched EPs >7d', count: counts.UNMATCHED_EPS },
      { id: 'STALE_DEALS', label: 'Stale B2B Deals', count: counts.STALE_DEALS },
      { id: 'ARRIVALS_READINESS', label: 'Arrival Gaps', count: counts.ARRIVALS_READINESS },
      { id: 'HIGH_SEVERITY_CASES', label: 'Escalations / Mood', count: counts.HIGH_SEVERITY_CASES },
      { id: 'OVERDUE_INVOICES', label: 'Overdue Invoices', count: counts.OVERDUE_INVOICES },
    ];
  }, [queueItems]);

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'ALL') return queueItems;
    return queueItems.filter((i) => i.category === selectedCategory);
  }, [queueItems, selectedCategory]);

  return (
    <section className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" />
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
            Row 4 — Real-Time Risk &amp; Action Queue
          </h2>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            {queueItems.length} Immediate Actionable Signals
          </span>
        </div>
        <span className="text-[11px] text-slate-500 font-medium">
          Core Question: &quot;Who needs to do what, by when?&quot;
        </span>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer',
              selectedCategory === cat.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            )}
          >
            <span>{cat.label}</span>
            <span
              className={clsx(
                'px-1.5 py-0.2 rounded-full text-[10px] font-mono',
                selectedCategory === cat.id
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 text-slate-600'
              )}
            >
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      {/* Main Prioritized Action Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Severity &amp; Risk Domain</th>
                <th className="py-3 px-4">Action Item &amp; Root Cause Signal</th>
                <th className="py-3 px-4">Affected Entity</th>
                <th className="py-3 px-4">Accountable Owner</th>
                <th className="py-3 px-4 text-center">Idle / Overdue</th>
                <th className="py-3 px-4 text-right">Prescribed Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* Severity & Domain */}
                  <td className="py-3.5 px-4 align-top">
                    <div className="space-y-1">
                      <span
                        className={clsx(
                          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border',
                          item.severity === 'critical'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        )}
                      >
                        {item.severity === 'critical' ? (
                          <AlertCircle className="w-3 h-3 text-rose-600" />
                        ) : (
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                        )}
                        <span>{item.severity}</span>
                      </span>
                      <span className="block text-[11px] font-medium text-slate-600">
                        {item.categoryLabel}
                      </span>
                    </div>
                  </td>

                  {/* Action Item & Root Cause Signal */}
                  <td className="py-3.5 px-4 align-top max-w-sm">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                        <strong className="text-slate-700 font-semibold">Signal:</strong>{' '}
                        {item.rootCauseSignal}
                      </p>
                    </div>
                  </td>

                  {/* Affected Entity */}
                  <td className="py-3.5 px-4 align-top">
                    <div>
                      <span className="font-semibold text-slate-900 block truncate max-w-[160px]">
                        {item.entityName}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500">
                        {item.entityId}
                      </span>
                    </div>
                  </td>

                  {/* Owner & Role */}
                  <td className="py-3.5 px-4 align-top">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                        {item.assignedOwner.charAt(0)}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900 block truncate max-w-[120px]">
                          {item.assignedOwner}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {item.ownerRole}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Idle Days */}
                  <td className="py-3.5 px-4 align-top text-center">
                    <span
                      className={clsx(
                        'inline-flex items-center gap-1 font-mono font-bold text-xs px-2 py-0.5 rounded-sm',
                        item.daysIdleOrOverdue >= 14
                          ? 'bg-rose-100 text-rose-800'
                          : item.daysIdleOrOverdue >= 7
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      )}
                    >
                      <Clock className="w-3 h-3 text-slate-400" />
                      {item.daysIdleOrOverdue}d
                    </span>
                  </td>

                  {/* Prescribed Action Button */}
                  <td className="py-3.5 px-4 align-top text-right">
                    <div className="space-y-1">
                      <Link
                        href={item.drillDownUrl}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-2xs transition-colors cursor-pointer"
                      >
                        <span>Fix Now</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                      <p className="text-[10px] text-slate-600 truncate max-w-[180px] text-right">
                        {item.recommendedAction}
                      </p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
