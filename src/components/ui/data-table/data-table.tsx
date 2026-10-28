'use client';

import React from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  FolderOpen,
} from 'lucide-react';
import { DataTableProps, ColumnDef } from './data-table-types';
import { DataTableProvider, useDataTable } from './data-table-context';
import { DataTableToolbar } from './data-table-toolbar';

function TableContent<T>({
  onRowClick,
  enableSelection,
  isLoading,
  error,
  emptyMessage = 'No records found in this operational view.',
  emptySubtext = 'Try adjusting your search criteria, clearing active filters, or creating a new record.',
}: {
  onRowClick?: (item: T) => void;
  enableSelection?: boolean;
  isLoading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  emptySubtext?: string;
}) {
  const {
    columns,
    visibleColumns,
    paginatedData,
    sortColumn,
    sortDirection,
    setSort,
    selectedIds,
    toggleSelectRow,
    toggleSelectAll,
    isAllSelected,
    keyExtractor,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    totalFilteredCount,
    clearFilters,
  } = useDataTable<T>();

  const activeColumns = columns.filter((col) => visibleColumns.has(col.id));

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-rose-50/50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900">
        <AlertCircle className="h-8 w-8 text-rose-500 mb-2" />
        <h3 className="text-sm font-bold text-rose-800 dark:text-rose-300">
          Failed to Load Operational Table
        </h3>
        <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 max-w-sm">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Scrollable Table Container */}
      <div className="tracker-table-container">
        <table className="tracker-table">
          <thead>
            <tr>
              {/* Optional Selection Checkbox Header */}
              {enableSelection && (
                <th className="w-8 px-3 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    aria-label="Select all rows on current page"
                    className="h-3.5 w-3.5 rounded border-slate-300 text-aiesec-blue focus:ring-aiesec-blue"
                  />
                </th>
              )}

              {/* Dynamic Headers */}
              {activeColumns.map((col) => {
                const isSorted = sortColumn === col.id;
                return (
                  <th
                    key={col.id}
                    style={{ width: col.width }}
                    className={`${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${
                      col.sortable ? 'cursor-pointer select-none hover:bg-slate-100/70 dark:hover:bg-slate-700/50' : ''
                    }`}
                    onClick={() => col.sortable && setSort(col.id)}
                  >
                    <div
                      className={`inline-flex items-center gap-1.5 ${
                        col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start'
                      }`}
                    >
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className="text-slate-400">
                          {isSorted && sortDirection === 'asc' ? (
                            <ChevronUp className="h-3.5 w-3.5 text-aiesec-blue" />
                          ) : isSorted && sortDirection === 'desc' ? (
                            <ChevronDown className="h-3.5 w-3.5 text-aiesec-blue" />
                          ) : (
                            <ChevronsUpDown className="h-3 w-3 opacity-40 hover:opacity-100" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              // Loading Skeleton Rows
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={`loading-${rIdx}`} className="animate-pulse">
                  {enableSelection && (
                    <td className="w-8 text-center">
                      <div className="h-3.5 w-3.5 bg-slate-200 rounded dark:bg-slate-700 mx-auto" />
                    </td>
                  )}
                  {activeColumns.map((col) => (
                    <td key={col.id}>
                      <div className="h-4 bg-slate-200 rounded dark:bg-slate-700 w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              // Empty State
              <tr>
                <td
                  colSpan={activeColumns.length + (enableSelection ? 1 : 0)}
                  className="py-12 text-center text-slate-500 dark:text-slate-400"
                >
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <FolderOpen className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {emptyMessage}
                    </p>
                    <p className="text-[11px] text-slate-400 max-w-md">
                      {emptySubtext}
                    </p>
                    <button
                      onClick={clearFilters}
                      className="mt-2 text-xs font-semibold text-aiesec-blue hover:underline"
                    >
                      Clear active filters
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              // Real Data Rows
              paginatedData.map((item) => {
                const id = keyExtractor(item);
                const isSelected = selectedIds.has(id);

                return (
                  <tr
                    key={id}
                    onClick={() => onRowClick && onRowClick(item)}
                    className={`${onRowClick ? 'cursor-pointer' : ''} ${
                      isSelected ? 'bg-blue-50/60 dark:bg-blue-950/30' : ''
                    }`}
                  >
                    {/* Row Checkbox */}
                    {enableSelection && (
                      <td
                        className="w-8 text-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelectRow(id);
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          aria-label={`Select row ${id}`}
                          className="h-3.5 w-3.5 rounded border-slate-300 text-aiesec-blue focus:ring-aiesec-blue"
                        />
                      </td>
                    )}

                    {/* Columns */}
                    {activeColumns.map((col) => {
                      return (
                        <td
                          key={col.id}
                          className={
                            col.align === 'right'
                              ? 'text-right'
                              : col.align === 'center'
                              ? 'text-center'
                              : 'text-left'
                          }
                        >
                          {col.cell
                            ? col.cell(item)
                            : col.accessorKey
                            ? String(item[col.accessorKey] ?? '—')
                            : '—'}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!isLoading && totalFilteredCount > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 px-1 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>
              Showing{' '}
              <strong className="font-semibold text-slate-700 dark:text-slate-200">
                {Math.min(totalFilteredCount, (page - 1) * pageSize + 1)}
              </strong>{' '}
              to{' '}
              <strong className="font-semibold text-slate-700 dark:text-slate-200">
                {Math.min(totalFilteredCount, page * pageSize)}
              </strong>{' '}
              of{' '}
              <strong className="font-semibold text-slate-700 dark:text-slate-200">
                {totalFilteredCount}
              </strong>{' '}
              records
            </span>

            <span className="text-slate-300 dark:text-slate-700">|</span>

            <div className="flex items-center gap-1.5">
              <span>Per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="rounded border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-700 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <span className="mr-2">
              Page <strong>{page}</strong> of <strong>{totalPages}</strong>
            </span>

            <button
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
              aria-label="Previous page"
              className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 bg-white text-slate-600 shadow-subtle hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
              aria-label="Next page"
              className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 bg-white text-slate-600 shadow-subtle hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  title,
  description,
  searchPlaceholder,
  pageSize = 25,
  enableSelection = false,
  onBulkAction,
  bulkActions,
  exportFileName,
  entityType,
  isLoading = false,
  error = null,
  emptyMessage,
  emptySubtext,
}: DataTableProps<T>) {
  return (
    <DataTableProvider
      data={data}
      columns={columns}
      keyExtractor={keyExtractor}
      defaultPageSize={pageSize}
    >
      <div className="w-full space-y-3">
        {/* Optional Title & Description */}
        {(title || description) && (
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {description}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Toolbar */}
        <DataTableToolbar
          searchPlaceholder={searchPlaceholder}
          exportFileName={exportFileName}
          entityType={entityType}
          bulkActions={bulkActions}
          onBulkAction={onBulkAction}
        />

        {/* Table Body & Pagination */}
        <TableContent<T>
          onRowClick={onRowClick}
          enableSelection={enableSelection}
          isLoading={isLoading}
          error={error}
          emptyMessage={emptyMessage}
          emptySubtext={emptySubtext}
        />
      </div>
    </DataTableProvider>
  );
}
