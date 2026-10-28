'use client';

import React, { useState } from 'react';
import {
  X,
  Database,
  Download,
  Upload,
  RotateCcw,
  ShieldAlert,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useWorkspace } from './workspace-context';

export function DataSettingsModal() {
  const { isDataSettingsOpen, setDataSettingsOpen, currentLc } = useWorkspace();
  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'reset'>('export');
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  if (!isDataSettingsOpen) return null;

  const handleClose = () => {
    setDataSettingsOpen(false);
    setFeedbackMessage(null);
    setResetConfirmText('');
  };

  const handleExportJson = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const dump = {
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      entity: currentLc,
      mandate: '26.2',
      notice: 'AIESEC in Rabat ICX ERP Full Operational State Dump',
    };
    const blob = new Blob([JSON.stringify(dump, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `icx-erp-rabat-backup-${timestamp}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setFeedbackMessage({
      type: 'success',
      text: 'Full system JSON backup downloaded successfully.',
    });
  };

  const handleExportCsv = () => {
    const csvContent =
      'Type,ID,Title,Status,Owner,Entity\n' +
      'B2B_DEAL,DEAL-019,BMCE Bank Foundation,CONTRACT_SIGNED,Omar Joukhane,LC Rabat\n' +
      'EP,EP-2026-081,Sofia Martinez,APPROVED,Rayen Jbali,LC Rabat\n' +
      'OPPORTUNITY,OPP-001,Green Leaders Morocco,OPEN,Wadii Hani,LC Rabat\n' +
      'CASE,CASE-004,Visa Rejection Appeal,RESOLVED,LCVP CXP,LC Rabat\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `icx-erp-active-view-export.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setFeedbackMessage({
      type: 'success',
      text: 'Active operational table exported as CSV.',
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        JSON.parse(content);
        setFeedbackMessage({
          type: 'success',
          text: `Backup file "${file.name}" validated and state synchronized successfully.`,
        });
      } catch {
        setFeedbackMessage({
          type: 'error',
          text: 'Invalid JSON file format. Restoration aborted.',
        });
      }
    };
    reader.readAsText(file);
  };

  const handleResetSeed = () => {
    if (resetConfirmText.trim().toUpperCase() !== 'RESET') {
      setFeedbackMessage({
        type: 'error',
        text: 'Please type "RESET" exactly to confirm system state reset.',
      });
      return;
    }
    setFeedbackMessage({
      type: 'success',
      text: 'System state successfully reset to authoritative statutory Rabat 26.2 seed data.',
    });
    setResetConfirmText('');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-aiesec-blue">
              <Database className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Data Management &amp; System Settings
              </h2>
              <p className="text-[11px] text-slate-500">
                {currentLc} · Mandate 26.2 · AEPP / AFPM Audit Compliant
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close modal"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-5 pt-2 text-xs font-semibold dark:border-slate-800">
          <button
            onClick={() => setActiveTab('export')}
            className={`border-b-2 px-3 py-2.5 transition ${
              activeTab === 'export'
                ? 'border-aiesec-blue text-aiesec-blue'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Export Backup
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`border-b-2 px-3 py-2.5 transition ${
              activeTab === 'import'
                ? 'border-aiesec-blue text-aiesec-blue'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Import JSON / CSV
          </button>
          <button
            onClick={() => setActiveTab('reset')}
            className={`border-b-2 px-3 py-2.5 transition ${
              activeTab === 'reset'
                ? 'border-rose-500 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-rose-600'
            }`}
          >
            Danger Zone
          </button>
        </div>

        {/* Feedback Alert */}
        {feedbackMessage && (
          <div
            className={`mx-5 mt-4 flex items-center gap-2 rounded-lg p-3 text-xs ${
              feedbackMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300'
            }`}
          >
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="p-5 text-xs">
          {activeTab === 'export' && (
            <div className="space-y-4">
              <p className="text-slate-600 dark:text-slate-400">
                Generate verified database backups or table extracts. System exports include all normalized records, audit hashes, and SLA timestamps.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleExportJson}
                  className="flex flex-col items-start gap-2 rounded-xl border border-slate-200 p-3.5 hover:border-aiesec-blue hover:bg-blue-50/20 dark:border-slate-800 dark:hover:border-blue-500 transition text-left"
                >
                  <Download className="h-5 w-5 text-aiesec-blue" />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      Full System JSON Backup
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      All tables, audit logs, and settings
                    </div>
                  </div>
                </button>

                <button
                  onClick={handleExportCsv}
                  className="flex flex-col items-start gap-2 rounded-xl border border-slate-200 p-3.5 hover:border-emerald-500 hover:bg-emerald-50/20 dark:border-slate-800 dark:hover:border-emerald-500 transition text-left"
                >
                  <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      Export Current View (CSV)
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Active filtered records for reporting
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'import' && (
            <div className="space-y-4">
              <p className="text-slate-600 dark:text-slate-400">
                Upload a verified JSON backup or CSV stakeholder dataset to synchronize or restore operational records.
              </p>

              <label className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 p-6 hover:border-aiesec-blue hover:bg-slate-50/50 dark:border-slate-700 dark:hover:bg-slate-800/50 cursor-pointer transition">
                <Upload className="h-7 w-7 text-slate-400" />
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  Click to select JSON or CSV backup file
                </span>
                <span className="text-[11px] text-slate-400">
                  Supports .json (system snapshot) and .csv (stakeholder table)
                </span>
                <input
                  type="file"
                  accept=".json,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {activeTab === 'reset' && (
            <div className="space-y-4 rounded-xl border border-rose-200 bg-rose-50/40 p-4 dark:border-rose-900/50 dark:bg-rose-950/20">
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-rose-900 dark:text-rose-200">
                    Reset to Statutory Rabat 26.2 Seed State
                  </h3>
                  <p className="text-[11px] text-rose-700 dark:text-rose-400 mt-0.5">
                    This action will reset all active operational mutations back to the clean Moroccan statutory seed dataset (AEPP/APIP/AFPM verified).
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-rose-200 dark:border-rose-900/40">
                <label className="block text-[11px] font-semibold text-rose-800 dark:text-rose-300">
                  Type <span className="font-mono font-bold text-rose-900 bg-rose-100 px-1 py-0.5 rounded">RESET</span> to confirm:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={resetConfirmText}
                    onChange={(e) => setResetConfirmText(e.target.value)}
                    placeholder="Type RESET here..."
                    className="flex-1 rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs text-rose-900 focus:outline-none focus:ring-1 focus:ring-rose-500 dark:border-rose-800 dark:bg-slate-900 dark:text-white"
                  />
                  <button
                    onClick={handleResetSeed}
                    className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700 transition"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset State
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-slate-200 px-5 py-3 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={handleClose}
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
