'use client';

import React, { useEffect } from 'react';
import { useRecordDetail } from './record-detail-context';

export function RecordAuditDrawer() {
  const { isAuditDrawerOpen, closeAuditDrawer, record, selectedAuditItem } = useRecordDetail();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAuditDrawerOpen) {
        closeAuditDrawer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuditDrawerOpen, closeAuditDrawer]);

  if (!isAuditDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  Cryptographic Audit Chain
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                  SHA-256 Intact
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Immutable ledger history for {record.stableId} ({record.title})
              </p>
            </div>
            <button
              type="button"
              onClick={closeAuditDrawer}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {record.auditHistory.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-400 italic">
                No audit log mutations recorded for this entity yet.
              </div>
            ) : (
              record.auditHistory.map((item, idx) => {
                const isSelected = selectedAuditItem?.id === item.id;
                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-primary ring-2 ring-primary/20 bg-primary/5 dark:bg-primary/10'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {item.action}
                        </span>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          by <span className="font-semibold text-slate-700 dark:text-slate-300">{item.actor_name}</span>
                        </div>
                      </div>
                      <time className="text-[11px] font-mono text-slate-400" dateTime={item.occurred_at}>
                        {new Date(item.occurred_at).toLocaleString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </time>
                    </div>

                    {item.reason && (
                      <div className="mt-2 text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800">
                        <span className="font-semibold text-slate-500">Reason: </span>
                        {item.reason}
                      </div>
                    )}

                    {item.changed_fields && Object.keys(item.changed_fields).length > 0 && (
                      <div className="mt-3 space-y-2">
                        <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                          Field Diffs
                        </div>
                        <div className="space-y-1.5 font-mono text-[11px]">
                          {Object.entries(item.changed_fields).map(([field, delta]) => (
                            <div key={field} className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                              <span className="font-bold text-slate-700 dark:text-slate-300">{field}:</span>
                              <div className="flex items-center gap-2 text-xs">
                                <span className="line-through text-rose-600 dark:text-rose-400">
                                  {String(delta.from ?? 'null')}
                                </span>
                                <span className="text-slate-400">→</span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                  {String(delta.to ?? 'null')}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 font-mono text-[10px] text-slate-400 space-y-1">
                      <div className="truncate">
                        <span className="font-semibold text-slate-500">Hash: </span>
                        {item.hash}
                      </div>
                      <div className="truncate">
                        <span className="font-semibold text-slate-500">Prev Hash: </span>
                        {item.prev_hash}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Verified by PostgreSQL PL/pgSQL audit engine
            </span>
            <button
              type="button"
              onClick={closeAuditDrawer}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
