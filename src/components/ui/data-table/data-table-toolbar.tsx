'use client';

import React from 'react';
import {
  Search,
  X,
  Download,
  Filter,
  CheckCircle,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import { useDataTable } from './data-table-context';
import { DataTableColumnChooser } from './data-table-column-chooser';
import { DataTableSavedViews } from './data-table-saved-views';

export function DataTableToolbar({
  searchPlaceholder = 'Quick search rows...',
  exportFileName = 'export-records.csv',
  entityType,
  bulkActions,
  onBulkAction,
}: {
  searchPlaceholder?: string;
  exportFileName?: string;
  entityType?: string;
  bulkActions?: Array<{ id: string; label: string; variant?: 'default' | 'destructive' }>;
  onBulkAction?: (action: string, selectedIds: string[]) => void;
}) {
  const {
    columns,
    searchQuery,
    setSearchQuery,
    filters,
    setFilter,
    clearFilters,
    totalFilteredCount,
    allFilteredData,
    selectedIds,
    clearSelection,
  } = useDataTable();

  // Export to CSV function
  const handleExportCsv = () => {
    if (allFilteredData.length === 0) return;

    const visibleCols = columns.filter((col) => col.accessorKey);
    const headers = visibleCols.map((c) => `"${c.header.replace(/"/g, '""')}"`).join(',');

    const rows = allFilteredData.map((item) =>
      visibleCols
        .map((c) => {
          const val = (item as Record<string, any>)[c.accessorKey!];
          if (val === null || val === undefined) return '""';
          return `"${String(val).replace(/"/g, '""')}"`;
        })
        .join(',')
    );

    const csvContent = [headers, ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', exportFileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filterableColumns = columns.filter((col) => col.filterable && col.filterOptions);
  const activeFilterCount = Object.keys(filters).length + (searchQuery ? 1 : 0);

  return (
    <div className="space-y-2.5 pb-3">
      {/* Top Search, Filters & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        {/* Search & Filter Dropdowns */}
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {entityType && <DataTableSavedViews entityType={entityType} />}

          {/* Quick Search Input */}
          <div className="relative min-w-[200px] max-w-sm flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-md border border-slate-200 bg-white pl-8 pr-7 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-aiesec-blue focus:outline-none focus:ring-1 focus:ring-aiesec-blue dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Quick Column Filter Dropdowns */}
          {filterableColumns.map((col) => (
            <select
              key={col.id}
              value={filters[col.id] || ''}
              onChange={(e) => setFilter(col.id, e.target.value)}
              className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 shadow-subtle hover:bg-slate-50 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="">All {col.header}</option>
              {col.filterOptions?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ))}

          {/* Reset all filters */}
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
            >
              <X className="h-3.5 w-3.5" />
              <span>Reset filters</span>
            </button>
          )}
        </div>

        {/* Right Buttons: Column Chooser & CSV Export */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <DataTableColumnChooser />

          <button
            onClick={handleExportCsv}
            disabled={totalFilteredCount === 0}
            title={`Export ${totalFilteredCount} records to CSV`}
            className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-subtle hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <Download className="h-3.5 w-3.5 text-slate-400" />
            <span>Export CSV</span>
            <span className="rounded bg-slate-100 px-1 text-[10px] text-slate-500 dark:bg-slate-700 dark:text-slate-300">
              {totalFilteredCount}
            </span>
          </button>
        </div>
      </div>

      {/* Bulk Actions Banner (appears when rows are checked) */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-aiesec-blue/30 bg-aiesec-soft px-3 py-2 text-xs text-aiesec-darkblue dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-200 animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-aiesec-blue" />
            <span className="font-semibold">
              {selectedIds.size} record{selectedIds.size > 1 ? 's' : ''} selected
            </span>
            <button
              onClick={clearSelection}
              className="text-xs text-slate-500 hover:underline dark:text-slate-400 ml-2"
            >
              Clear selection
            </button>
          </div>

          <div className="flex items-center gap-2">
            {bulkActions?.map((action) => (
              <button
                key={action.id}
                onClick={() => onBulkAction && onBulkAction(action.id, Array.from(selectedIds))}
                className={`rounded px-2.5 py-1 text-xs font-semibold shadow-sm transition ${
                  action.variant === 'destructive'
                    ? 'bg-rose-600 text-white hover:bg-rose-700'
                    : 'bg-white text-slate-800 border border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-white dark:border-slate-600'
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
