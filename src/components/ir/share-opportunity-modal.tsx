'use client';

import React, { useState } from 'react';
import { generateSharedOpportunityToken, type SharedOpportunityToken } from '@/lib/ir/shared-view-token';

interface ShareOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunityId: string;
  opportunityTitle: string;
}

export function ShareOpportunityModal({
  isOpen,
  onClose,
  opportunityId,
  opportunityTitle,
}: ShareOpportunityModalProps) {
  const [validityDays, setValidityDays] = useState(14);
  const [activeToken, setActiveToken] = useState<SharedOpportunityToken | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = () => {
    const token = generateSharedOpportunityToken({
      opportunityId,
      lcId: 'lc_rabat_001',
      createdBy: 'current_user',
      validityDays,
    });
    setActiveToken(token);
  };

  const getShareUrl = () => {
    if (!activeToken) return '';
    return `${window.location.origin}/shared/opportunity/${activeToken.token}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getShareUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="max-w-lg w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Share Opportunity with IR Partner (REQ-046)
            </h3>
            <p className="text-xs text-slate-500">Project: {opportunityTitle}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        <div className="space-y-4 text-xs">
          <p className="text-slate-600 dark:text-slate-400">
            Generates a revocable, expiring shared link for sending entities abroad. Commercial fees and internal notes are automatically stripped for data privacy (TEST-043).
          </p>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Link Validity Duration (1–30 Days)
            </label>
            <div className="flex items-center space-x-3 mt-1.5">
              <input
                type="range"
                min={1}
                max={30}
                value={validityDays}
                onChange={(e) => setValidityDays(Number(e.target.value))}
                className="flex-1"
              />
              <span className="font-bold text-blue-600 text-sm font-mono">{validityDays} days</span>
            </div>
          </div>

          {!activeToken ? (
            <button
              onClick={handleGenerate}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition"
            >
              Generate Revocable Token Link
            </button>
          ) : (
            <div className="space-y-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center">
                <span className="font-bold text-emerald-600">✓ Active Token Generated</span>
                <span className="font-mono text-slate-400 text-[10px]">
                  Expires: {new Date(activeToken.expiresAt).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={getShareUrl()}
                  className="flex-1 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-slate-700 dark:text-slate-300"
                />
                <button
                  onClick={handleCopy}
                  className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition whitespace-nowrap"
                >
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
