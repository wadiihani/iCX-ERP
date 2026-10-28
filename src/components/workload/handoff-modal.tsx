'use client';

import React, { useState } from 'react';
import { X, ArrowRight, ShieldCheck, AlertCircle, CheckCircle } from 'lucide-react';
import type { StakeholderHandoff } from '@/lib/workload/handoff-types';

interface HandoffModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType?: 'EP' | 'ORGANIZATION' | 'OPPORTUNITY' | 'DEAL';
  entityId?: string;
  entityTitle?: string;
  currentOwnerName?: string;
  currentOwnerId?: string;
  openTasksCount?: number;
  onInitiateHandoff: (handoff: Omit<StakeholderHandoff, 'id' | 'transferred_at'>) => void;
}

export function HandoffModal({
  isOpen,
  onClose,
  entityType = 'EP',
  entityId = 'ep_001',
  entityTitle = 'Exchange Participant / Account',
  currentOwnerName = 'Current User',
  currentOwnerId = 'usr_current',
  openTasksCount = 2,
  onInitiateHandoff,
}: HandoffModalProps) {
  const [targetOwner, setTargetOwner] = useState({
    id: 'usr_cxp_01',
    name: 'Amina Benali (VP CXP)',
  });
  const [handoffNotes, setHandoffNotes] = useState('');
  const [checklistConfirmed, setChecklistConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checklistConfirmed) {
      setError('You must confirm that all files, contracts, and EXPA statuses have been updated prior to handoff.');
      return;
    }
    if (!handoffNotes.trim()) {
      setError('Please provide handoff transfer notes with key context and pending deadlines.');
      return;
    }

    onInitiateHandoff({
      from_owner_id: currentOwnerId,
      from_owner_name: currentOwnerName,
      to_owner_id: targetOwner.id,
      to_owner_name: targetOwner.name,
      entity_type: entityType,
      entity_id: entityId,
      entity_title: entityTitle,
      status: 'PENDING',
      open_tasks_count: openTasksCount,
      handoff_notes: handoffNotes.trim(),
    });

    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in"
    >
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-aiesec-blue uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4" />
              <span>DEC-004 Non-Negotiable Contract</span>
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mt-1">
              Initiate Atomic Stakeholder Handoff
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-md bg-rose-50 p-2.5 text-xs font-medium text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Transfer Visual Badge */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/40 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Entity Under Transfer
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block text-sm">
                  {entityTitle}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {entityType} • {openTasksCount} active open task{openTasksCount !== 1 ? 's' : ''} transferred automatically
                </span>
              </div>
              <span className="rounded bg-aiesec-soft px-2 py-1 text-[10px] font-bold text-aiesec-blue">
                {entityType}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium">
              <span>{currentOwnerName}</span>
              <ArrowRight className="h-4 w-4 text-aiesec-blue" />
              <span className="font-bold text-slate-900 dark:text-white">{targetOwner.name}</span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Receiving Stakeholder *
            </label>
            <select
              value={targetOwner.id}
              onChange={(e) => {
                const id = e.target.value;
                const nameMap: Record<string, string> = {
                  usr_cxp_01: 'Amina Benali (VP CXP)',
                  usr_vp_bd: 'Mehdi Benjelloun (VP BD)',
                  usr_bd_02: 'Sara Kabbaj (BD Executive)',
                  usr_fnl_01: 'Salma Tazi (VP Finance)',
                  usr_lcp: 'Hatim Berrada (LCP)',
                };
                setTargetOwner({ id, name: nameMap[id] || 'Team Member' });
              }}
              className="w-full rounded-md border border-slate-200 bg-white p-2 text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="usr_cxp_01">Amina Benali (VP CXP) — Operations & Delivery</option>
              <option value="usr_vp_bd">Mehdi Benjelloun (VP BD) — Partnership & Sales</option>
              <option value="usr_bd_02">Sara Kabbaj (BD Executive) — Account Manager</option>
              <option value="usr_fnl_01">Salma Tazi (VP Finance) — Billing & Compliance</option>
              <option value="usr_lcp">Hatim Berrada (LCP) — Local Committee President</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Handoff Briefing & Operational Context *
            </label>
            <textarea
              rows={3}
              value={handoffNotes}
              onChange={(e) => setHandoffNotes(e.target.value)}
              placeholder="Detail arrival timing, special partner requests, invoice status, or urgent action items for the recipient..."
              className="w-full rounded-md border border-slate-200 bg-white p-2 text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 dark:border-emerald-900 dark:bg-emerald-950/20">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={checklistConfirmed}
                onChange={(e) => setChecklistConfirmed(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-aiesec-blue focus:ring-aiesec-blue"
              />
              <span className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                I certify that all required documentation is uploaded and verified. Transferred tasks will remain in the recipient’s queue until explicitly acknowledged.
              </span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-aiesec-blue px-4 py-1.5 text-xs font-semibold text-white shadow hover:bg-aiesec-blue/90"
            >
              Generate Transfer Packet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
