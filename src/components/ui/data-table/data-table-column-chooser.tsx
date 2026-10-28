'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Columns3, Check, RotateCcw } from 'lucide-react';
import { useDataTable } from './data-table-context';

export function DataTableColumnChooser() {
  const { columns, visibleColumns, toggleColumnVisibility, resetColumnVisibility } = useDataTable();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        title="Choose visible table columns"
        className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-subtle hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
      >
        <Columns3 className="h-3.5 w-3.5 text-slate-400" />
        <span>Columns</span>
        <span className="rounded bg-slate-100 px-1 text-[10px] text-slate-500 dark:bg-slate-700 dark:text-slate-300">
          {visibleColumns.size}/{columns.length}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-30 mt-1.5 w-56 rounded-lg border border-slate-200 bg-white p-2 shadow-elevated dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 px-1 dark:border-slate-700/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Toggle Columns
            </span>
            <button
              onClick={resetColumnVisibility}
              title="Reset to default columns"
              className="flex items-center gap-1 text-[10px] text-aiesec-blue hover:underline"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          </div>

          <div className="mt-1.5 max-h-60 overflow-y-auto space-y-0.5">
            {columns.map((col) => {
              const isChecked = visibleColumns.has(col.id);
              return (
                <button
                  key={col.id}
                  onClick={() => toggleColumnVisibility(col.id)}
                  className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700/60"
                >
                  <span className="truncate">{col.header}</span>
                  <div
                    className={`flex h-4 w-4 items-center justify-center rounded border ${
                      isChecked
                        ? 'border-aiesec-blue bg-aiesec-blue text-white'
                        : 'border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800'
                    }`}
                  >
                    {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
