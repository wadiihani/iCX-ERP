'use client';

import React, { useState } from 'react';
import {
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
  Layers,
  X,
} from 'lucide-react';
import {
  INITIAL_SYNC_CURSOR,
  INITIAL_DISCREPANCIES,
  INITIAL_OUTBOX_ACTIONS,
  ExpaSyncEngine,
  type SyncCursor,
  type DiscrepancyRecord,
  type OutboxActionCard,
} from '@/lib/sync/expa-sync-engine';

export function ActionOutboxWorkbench() {
  const [cursor, setCursor] = useState<SyncCursor>(INITIAL_SYNC_CURSOR);
  const [discrepancies, setDiscrepancies] = useState<DiscrepancyRecord[]>(INITIAL_DISCREPANCIES);
  const [outboxCards, setOutboxCards] = useState<OutboxActionCard[]>(INITIAL_OUTBOX_ACTIONS);
  const [activeTab, setActiveTab] = useState<'outbox' | 'discrepancies'>('outbox');
  const [selectedDiscrepancy, setSelectedDiscrepancy] = useState<DiscrepancyRecord | null>(null);
  const [justification, setJustification] = useState('');
  const [notification, setNotification] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const pendingOutboxCount = outboxCards.filter((c) => c.status === 'PENDING').length;
  const pendingDiscrepanciesCount = discrepancies.filter((d) => d.resolutionStatus === 'PENDING_REVIEW').length;

  const handleSimulateSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setCursor({
        ...cursor,
        lastSyncedAt: new Date().toISOString(),
        totalRecordsIngested: cursor.totalRecordsIngested + 3,
        syncHealth: 'HEALTHY',
      });
      setIsSyncing(false);
      setNotification('EXPA GIS Cursor updated. Pulled 3 incremental events without schema deviations.');
      setTimeout(() => setNotification(null), 3500);
    }, 1000);
  };

  const handleConfirmOutboxExecuted = (cardId: string) => {
    setOutboxCards(
      outboxCards.map((c) => (c.id === cardId ? { ...c, status: 'EXECUTED_CONFIRMED' } : c))
    );
    setNotification('Outbox action marked confirmed. Local audit log updated with execution timestamp.');
    setTimeout(() => setNotification(null), 3500);
  };

  const handleResolveDiscrepancy = (action: 'ACCEPT_REMOTE' | 'PRESERVE_LOCAL' | 'QUEUE_OUTBOX') => {
    if (!selectedDiscrepancy) return;
    const res = ExpaSyncEngine.reconcileDiscrepancy(selectedDiscrepancy, action, justification);
    if (!res.success) {
      alert(res.error);
      return;
    }

    if (res.outboxCard) {
      setOutboxCards([res.outboxCard, ...outboxCards]);
    }

    setDiscrepancies([...discrepancies]);
    setSelectedDiscrepancy(null);
    setJustification('');
    setNotification(
      action === 'QUEUE_OUTBOX'
        ? 'Outbound mutation queued in Action Outbox for human-in-the-loop verification.'
        : `Discrepancy marked resolved (${action.replace(/_/g, ' ')}).`
    );
    setTimeout(() => setNotification(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Sync Engine Status */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-subtle dark:border-slate-800 dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              EXPA / GIS Read Sync Engine & Action Outbox
            </h2>
            <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300">
              {cursor.syncHealth}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Cursor: <span className="font-mono">{cursor.cursorToken}</span> • Last pull: {new Date(cursor.lastSyncedAt).toLocaleTimeString('en-GB')} ({cursor.totalRecordsIngested} records synced)
          </p>
        </div>

        <button
          onClick={handleSimulateSync}
          disabled={isSyncing}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-aiesec-blue ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Pulling Cursor...' : 'Trigger Cursor Sync'}</span>
        </button>
      </div>

      {/* Notification Alert */}
      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900">
          {notification}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-4">
        <button
          onClick={() => setActiveTab('outbox')}
          className={`pb-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'outbox'
              ? 'border-aiesec-blue text-aiesec-blue dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>Action Outbox Queue ({pendingOutboxCount} Pending)</span>
        </button>

        <button
          onClick={() => setActiveTab('discrepancies')}
          className={`pb-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'discrepancies'
              ? 'border-aiesec-blue text-aiesec-blue dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <AlertTriangle className="h-4 w-4" />
          <span>Reconciliation Discrepancies ({pendingDiscrepanciesCount} Unresolved)</span>
        </button>
      </div>

      {/* Tab 1: Action Outbox Queue */}
      {activeTab === 'outbox' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-aiesec-blue/30 bg-aiesec-soft/40 p-4 dark:border-blue-900/40 dark:bg-blue-950/20 text-xs text-aiesec-darkblue dark:text-blue-200">
            <strong>DEC-003 Human-in-the-Loop Protocol:</strong> To protect EXPA data integrity from API drift, all outbound status writes are queued here as actionable cards with direct deep-links. Click &ldquo;Open in EXPA&rdquo;, perform the action, and confirm below.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {outboxCards.map((card) => (
              <div
                key={card.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-subtle dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {card.actionType.replace('_', ' ')}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                      card.status === 'EXECUTED_CONFIRMED'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-amber-50 text-amber-800 border-amber-300'
                    }`}>
                      {card.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {card.entityTitle}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Target EXPA Status: <strong className="text-aiesec-blue">{card.targetStatus}</strong>
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800 leading-relaxed">
                    {card.guidanceText}
                  </p>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Assigned: {card.assignedOfficerName}</span>
                    <span className="font-mono font-semibold text-rose-600">{card.expiryCountdown}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 gap-2">
                  <a
                    href={card.expaDeepLinkUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <span>Open in EXPA</span>
                    <ExternalLink className="h-3.5 w-3.5 text-aiesec-blue" />
                  </a>

                  {card.status === 'PENDING' && (
                    <button
                      onClick={() => handleConfirmOutboxExecuted(card.id)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Confirm Executed</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Reconciliation Discrepancies */}
      {activeTab === 'discrepancies' && (
        <div className="space-y-4">
          <div className="space-y-3">
            {discrepancies.map((disc) => (
              <div
                key={disc.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-subtle dark:border-slate-800 dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                      MISMATCH
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                      {disc.entityTitle} ({disc.entityType})
                    </h3>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <span className="text-slate-500">Field: <strong>{disc.field}</strong></span>
                    <span>•</span>
                    <span>Local Value: <strong className="text-blue-600">{String(disc.localValue)}</strong></span>
                    <span>•</span>
                    <span>Remote EXPA: <strong className="text-amber-600">{String(disc.remoteValue)}</strong></span>
                  </div>

                  {disc.justification && (
                    <p className="text-[11px] text-slate-500 italic">
                      Justification: {disc.justification}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {disc.resolutionStatus === 'PENDING_REVIEW' ? (
                    <button
                      onClick={() => setSelectedDiscrepancy(disc)}
                      className="px-3 py-1.5 rounded-lg bg-aiesec-blue text-xs font-semibold text-white hover:bg-aiesec-blue/90 shadow-sm"
                    >
                      Reconcile Discrepancy
                    </button>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-1 rounded bg-slate-100 text-slate-600 font-mono">
                      {disc.resolutionStatus.replace(/_/g, ' ')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Discrepancy Reconciliation Modal */}
      {selectedDiscrepancy && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in"
        >
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Reconcile Field Discrepancy
              </h3>
              <button onClick={() => setSelectedDiscrepancy(null)} className="rounded p-1 text-slate-400">
                ✕
              </button>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs space-y-1.5 dark:border-slate-800 dark:bg-slate-800/40">
              <div className="font-bold text-slate-800 dark:text-slate-200">
                {selectedDiscrepancy.entityTitle}
              </div>
              <div className="grid grid-cols-2 gap-2 font-mono pt-1">
                <div>
                  <span className="text-[10px] text-slate-400 block">LOCAL ERP PLANNING</span>
                  <span className="font-bold text-blue-600">{String(selectedDiscrepancy.localValue)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">REMOTE EXPA GIS</span>
                  <span className="font-bold text-amber-600">{String(selectedDiscrepancy.remoteValue)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block font-semibold text-slate-700 dark:text-slate-300">
                Justification Note (Required if preserving local state)
              </label>
              <textarea
                rows={2}
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Explain reason for discrepancy (e.g. visa delays, contractual amendment)..."
                className="w-full rounded-md border border-slate-200 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => handleResolveDiscrepancy('ACCEPT_REMOTE')}
                className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
              >
                Accept Remote
              </button>
              <button
                onClick={() => handleResolveDiscrepancy('PRESERVE_LOCAL')}
                className="px-3 py-2 rounded-lg border border-amber-300 bg-amber-50 text-xs font-semibold text-amber-800 hover:bg-amber-100"
              >
                Preserve Local
              </button>
              <button
                onClick={() => handleResolveDiscrepancy('QUEUE_OUTBOX')}
                className="px-3 py-2 rounded-lg bg-aiesec-blue text-xs font-semibold text-white hover:bg-aiesec-blue/90"
              >
                Queue Outbox
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
