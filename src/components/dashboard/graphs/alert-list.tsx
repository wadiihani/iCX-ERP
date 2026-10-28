'use client';

import React from 'react';
import clsx from 'clsx';
import { AlertCircle, AlertTriangle, ArrowRight, ShieldAlert } from 'lucide-react';

export interface AlertItem {
  id: string;
  item: string;
  owner: string;
  metric?: string;
  value?: string | number;
  threshold?: string | number;
  ageDays?: number;
  actionText?: string;
  severity: 'critical' | 'warning' | 'info';
  onAction?: () => void;
}

interface AlertListProps {
  alerts: AlertItem[];
  title?: string;
  onOpenDrawer?: () => void;
  className?: string;
}

export const AlertList: React.FC<AlertListProps> = ({
  alerts,
  title = 'Action Required Now',
  onOpenDrawer,
  className,
}) => {
  if (!alerts || alerts.length === 0) return null;

  // Max 5 visible alerts, sorted critical first
  const sorted = [...alerts].sort((a, b) => {
    if (a.severity === 'critical' && b.severity !== 'critical') return -1;
    if (b.severity === 'critical' && a.severity !== 'critical') return 1;
    return (b.ageDays || 0) - (a.ageDays || 0);
  });
  const visibleAlerts = sorted.slice(0, 5);
  const remainingCount = sorted.length - visibleAlerts.length;

  return (
    <div
      className={clsx(
        'rounded-xl border border-rose-200/80 bg-rose-50/50 p-4 mb-5 text-left',
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          <h4 className="text-xs font-bold text-rose-950 uppercase tracking-wider">
            {title} ({alerts.length} {alerts.length === 1 ? 'item' : 'items'})
          </h4>
        </div>
        {remainingCount > 0 && onOpenDrawer && (
          <button
            onClick={onOpenDrawer}
            className="text-[11px] font-bold text-rose-700 hover:text-rose-900 underline underline-offset-2 transition-colors"
          >
            +{remainingCount} more in drawer
          </button>
        )}
      </div>

      <div className="space-y-2">
        {visibleAlerts.map((al) => {
          const isCritical = al.severity === 'critical';
          return (
            <div
              key={al.id}
              className={clsx(
                'flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg border text-xs transition-colors',
                isCritical
                  ? 'bg-white border-rose-200 text-rose-950 shadow-2xs'
                  : 'bg-white/80 border-amber-200 text-amber-950'
              )}
            >
              <div className="flex items-start sm:items-center gap-2.5 min-w-0">
                {isCritical ? (
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5 sm:mt-0" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
                )}
                <div className="min-w-0">
                  <span className="font-semibold text-slate-900 mr-2">{al.item}</span>
                  {al.value !== undefined && (
                    <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 mr-2">
                      {al.value}
                    </span>
                  )}
                  <span className="text-[11px] text-slate-500">
                    Owner: <strong className="text-slate-700">{al.owner}</strong>
                  </span>
                  {al.ageDays !== undefined && (
                    <span className="text-[11px] text-rose-600 font-medium ml-2">
                      ({al.ageDays}d idle)
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                <button
                  onClick={al.onAction || onOpenDrawer}
                  className={clsx(
                    'flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer',
                    isCritical
                      ? 'bg-rose-600 text-white hover:bg-rose-700'
                      : 'bg-amber-500 text-white hover:bg-amber-600'
                  )}
                >
                  <span>{al.actionText || 'Take Action'}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
