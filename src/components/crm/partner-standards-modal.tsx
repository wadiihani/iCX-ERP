'use client';

import React, { useState } from 'react';
import { B2BOrganization, PartnerStandardCheckpoint, MASTER_PARTNER_STANDARDS } from '@/lib/crm/organizations-data';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Clock,
  HelpCircle,
  ExternalLink,
  Award,
  AlertCircle,
} from 'lucide-react';

interface PartnerStandardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  partner: B2BOrganization | null;
  onSaveCheckpoints?: (partnerId: string, updated: PartnerStandardCheckpoint[]) => void;
}

export function PartnerStandardsModal({
  isOpen,
  onClose,
  partner,
  onSaveCheckpoints,
}: PartnerStandardsModalProps) {
  if (!isOpen || !partner) return null;

  const [checkpoints, setCheckpoints] = useState<PartnerStandardCheckpoint[]>(
    MASTER_PARTNER_STANDARDS.map((cp) => ({
      ...cp,
      partnerId: partner.id,
    }))
  );

  const toggleStatus = (id: string) => {
    setCheckpoints((prev) =>
      prev.map((cp) => {
        if (cp.id === id) {
          const nextStatus = cp.status === 'FULFILLED' ? 'PENDING' : 'FULFILLED';
          return {
            ...cp,
            status: nextStatus,
            reviewedAt: nextStatus === 'FULFILLED' ? new Date().toISOString().split('T')[0] : cp.reviewedAt,
          };
        }
        return cp;
      })
    );
  };

  const fulfilledCount = checkpoints.filter((cp) => cp.status === 'FULFILLED').length;
  const totalCount = checkpoints.length;
  const readinessPct = totalCount > 0 ? Math.round((fulfilledCount / totalCount) * 100) : 0;

  const handleSave = () => {
    if (onSaveCheckpoints) {
      onSaveCheckpoints(partner.id, checkpoints);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-50">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Partner Standards Register · {partner.name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                AIESEC Hub Exchange SnD Quality Checkpoints & Workplace Safeguards.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Readiness Score Bar */}
        <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Partner Standards Readiness
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{readinessPct}%</span>
              <span className="text-xs font-normal text-slate-500">
                ({fulfilledCount} of {totalCount} checkpoints verified)
              </span>
            </div>
          </div>
          <span
            className={`rounded-lg border px-3 py-1 text-xs font-bold ${
              readinessPct >= 80
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : readinessPct >= 50
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
          >
            {readinessPct >= 80 ? 'Verified Partner' : readinessPct >= 50 ? 'Pending Documents' : 'Non-Compliant'}
          </span>
        </div>

        {/* Checkpoints Checklist */}
        <div className="mt-4 space-y-2.5">
          {checkpoints.map((cp) => (
            <div
              key={cp.id}
              onClick={() => toggleStatus(cp.id)}
              className={`flex items-start gap-3 rounded-lg border p-3 transition cursor-pointer ${
                cp.status === 'FULFILLED'
                  ? 'border-emerald-200/80 bg-emerald-50/20 dark:border-emerald-900/30'
                  : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900'
              }`}
            >
              <div className="mt-0.5">
                {cp.status === 'FULFILLED' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Clock className="h-4 w-4 text-amber-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {cp.title}
                  </span>
                  <span
                    className={`rounded px-1.5 py-0.2 text-[9px] font-bold ${
                      cp.status === 'FULFILLED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {cp.status}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {cp.requirement}
                </p>
                <div className="mt-1 flex items-center gap-3 text-[10px] text-slate-400">
                  <span>Applicability: {cp.applicability}</span>
                  {cp.reviewedAt && <span>Reviewed: {cp.reviewedAt}</span>}
                  {cp.reviewerName && <span>By: {cp.reviewerName}</span>}
                  {cp.evidenceUrl && (
                    <a
                      href={cp.evidenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 text-aiesec-blue hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" /> Proof
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-end gap-2.5 border-t border-slate-100 pt-3 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-lg bg-aiesec-blue px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-600 transition"
          >
            Save Partner Standards
          </button>
        </div>
      </div>
    </div>
  );
}
