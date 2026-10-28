'use client';

import React, { useState } from 'react';
import { dryRunLeadImport, createBatchCommit, type RawLeadRow, type DryRunImportResult } from '@/lib/crm/lead-importer';

interface LeadImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (batchId: string, count: number) => void;
}

export function LeadImportModal({ isOpen, onClose, onSuccess }: LeadImportModalProps) {
  const [fileContent, setFileContent] = useState<string>('');
  const [preview, setPreview] = useState<DryRunImportResult | null>(null);
  const [isCommitting, setIsCommitting] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setFileContent(text);

      // Parse CSV rows
      const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
      if (lines.length <= 1) return;

      const rawRows: RawLeadRow[] = lines.slice(1).map((line) => {
        const parts = line.split(',').map((p) => p.trim().replace(/^"|"$/g, ''));
        return {
          name: parts[0] || '',
          ice_number: parts[1] || undefined,
          phone: parts[2] || undefined,
          city: parts[3] || 'Rabat',
          contact_name: parts[4] || undefined,
        };
      });

      // Run dry-run against dummy existing records (or passed props)
      const dryRun = dryRunLeadImport(rawRows, [
        { id: 'org-ex-1', name: 'Fondation Orient-Occident', ice_number: '001524316000045', city: 'Rabat' },
      ]);
      setPreview(dryRun);
    };
    reader.readAsText(file);
  };

  const handleCommit = async () => {
    if (!preview) return;
    setIsCommitting(true);

    try {
      const batch = createBatchCommit('lc_rabat_001', 'current_user', preview.items);
      onSuccess(batch.batchId, batch.insertedOrgIds.length);
      onClose();
    } finally {
      setIsCommitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="max-w-4xl w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Import Leads Spreadsheet</h3>
            <p className="text-xs text-slate-500">
              Moroccan Statutory Deduplication & Reversible Batch Importer (TEST-019 / TEST-020)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* File input */}
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="hidden"
              id="lead-file-upload"
            />
            <label htmlFor="lead-file-upload" className="cursor-pointer space-y-2 block">
              <div className="w-12 h-12 mx-auto rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center text-xl font-bold">
                ↑
              </div>
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Click to select Rabat CSV leads file
              </div>
              <div className="text-xs text-slate-400">
                Format: Organization Name, ICE Number, Phone, City, Contact Person
              </div>
            </label>
          </div>

          {/* Dry Run Preview Summary */}
          {preview && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="text-lg font-bold text-slate-900 dark:text-white">{preview.totalRows}</div>
                  <div className="text-[11px] text-slate-500">Total Rows</div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                  <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{preview.netNewRowsCount}</div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400">Net New Leads</div>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                  <div className="text-lg font-bold text-amber-600 dark:text-amber-400">{preview.duplicateRowsCount}</div>
                  <div className="text-[11px] text-amber-600 dark:text-amber-400">Duplicates Detected</div>
                </div>
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
                  <div className="text-lg font-bold text-rose-600 dark:text-rose-400">{preview.errorRowsCount}</div>
                  <div className="text-[11px] text-rose-600 dark:text-rose-400">Validation Errors</div>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                    <tr>
                      <th className="p-2.5">Row</th>
                      <th className="p-2.5">Organization</th>
                      <th className="p-2.5">ICE</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {preview.items.map((item) => (
                      <tr key={item.rowIndex} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-2.5 font-mono text-slate-400">{item.rowIndex}</td>
                        <td className="p-2.5 font-medium text-slate-900 dark:text-white">
                          {item.data.name}
                        </td>
                        <td className="p-2.5 font-mono text-slate-600 dark:text-slate-400">
                          {item.data.ice_number || '—'}
                        </td>
                        <td className="p-2.5">
                          {item.validationErrors.length > 0 ? (
                            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-semibold">
                              Error: {item.validationErrors[0]}
                            </span>
                          ) : item.isDuplicate ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-semibold">
                              Duplicate ({item.duplicateDetails?.matchReason})
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                              Ready to Insert
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 font-semibold text-slate-600 dark:text-slate-400">
                          {item.resolutionAction}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
          <div className="text-xs text-slate-400">
            {preview ? `${preview.netNewRowsCount} leads will be transactionally staged.` : 'Select a file to inspect.'}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={handleCommit}
              disabled={!preview || preview.netNewRowsCount === 0 || isCommitting}
              className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition shadow-sm"
            >
              {isCommitting ? 'Committing...' : `Commit Batch (${preview?.netNewRowsCount || 0} Leads)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
