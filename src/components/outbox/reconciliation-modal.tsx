'use client';

import React, { useState } from 'react';
import type { DiscrepancyItem } from '@/lib/outbox/reconciliation';

interface ReconciliationModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: DiscrepancyItem;
  onResolve: (action: 'ACCEPT_REMOTE' | 'PRESERVE_LOCAL' | 'QUEUE_OUTBOX_CORRECTION', justification?: string) => void;
}

export function ReconciliationModal({
  isOpen,
  onClose,
  item,
  onResolve,
}: ReconciliationModalProps) {
  const [justification, setJustification] = useState('');
  const [mode, setMode] = useState<'VIEW' | 'PRESERVE_JUSTIFY'>('VIEW');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePreserveSubmit = () => {
    if (!justification || justification.trim().length < 5) {
      setError('Statutory requirement: You must provide a valid justification note (minimum 5 chars) to override remote EXPA state.');
      return;
    }
    onResolve('PRESERVE_LOCAL', justification);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="max-w-xl w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              EXPA vs Local Reconciliation (REQ-105)
            </h3>
            <p className="text-xs text-slate-500">Conflict Detected for {item.entityType} #{item.entityId}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        {/* Side-by-side inspection */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 space-y-1">
            <div className="text-[10px] font-bold uppercase text-blue-600">Local ERP Planning State</div>
            <div className="font-semibold text-slate-700">Field: {item.field}</div>
            <div className="text-base font-bold text-blue-900 font-mono">
              {String(item.localValue)}
            </div>
            <div className="text-[10px] text-slate-500">LC Rabat operational baseline</div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 space-y-1">
            <div className="text-[10px] font-bold uppercase text-amber-600">Remote EXPA API Value</div>
            <div className="font-semibold text-slate-700">Field: {item.field}</div>
            <div className="text-base font-bold text-amber-900 font-mono">
              {String(item.remoteValue)}
            </div>
            <div className="text-[10px] text-slate-500">Received via Read-Sync (gis.aiesec.org)</div>
          </div>
        </div>

        {mode === 'PRESERVE_JUSTIFY' ? (
          <div className="space-y-3 pt-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Mandatory Justification for Overriding EXPA Authority <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="e.g. OP interview passed with host NGO; official paper endorsement attached in contract vault."
              className="w-full p-2.5 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setMode('VIEW')}
                className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handlePreserveSubmit}
                className="px-3 py-1.5 text-xs font-bold bg-amber-600 text-white rounded-lg hover:bg-amber-700"
              >
                Confirm Local Override
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Resolution Strategy:</div>
            
            <button
              onClick={() => {
                onResolve('ACCEPT_REMOTE');
                onClose();
              }}
              className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-left transition flex items-center justify-between"
            >
              <div>
                <div className="font-bold text-slate-900 dark:text-white">1. Accept Remote EXPA Authority</div>
                <div className="text-[11px] text-slate-500">Update local record to match EXPA ({String(item.remoteValue)}) and dismiss alert.</div>
              </div>
              <span className="text-blue-600 font-bold">→</span>
            </button>

            <button
              onClick={() => setMode('PRESERVE_JUSTIFY')}
              className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 text-left transition flex items-center justify-between"
            >
              <div>
                <div className="font-bold text-slate-900 dark:text-white">2. Preserve Local Planning State</div>
                <div className="text-[11px] text-slate-500">Retain local value ({String(item.localValue)}) and record statutory audit justification.</div>
              </div>
              <span className="text-amber-600 font-bold">→</span>
            </button>

            <button
              onClick={() => {
                onResolve('QUEUE_OUTBOX_CORRECTION');
                onClose();
              }}
              className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-purple-400 hover:bg-purple-50/50 text-left transition flex items-center justify-between"
            >
              <div>
                <div className="font-bold text-slate-900 dark:text-white">3. Queue Correction in Action Outbox (SM-09)</div>
                <div className="text-[11px] text-slate-500">Generate deep-link for VP/LCP to update EXPA to match local state.</div>
              </div>
              <span className="text-purple-600 font-bold">→</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
