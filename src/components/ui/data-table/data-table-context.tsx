'use client';

import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { ColumnDef, SortDirection, FilterValue } from './data-table-types';

interface DataTableContextValue<T> {
  columns: ColumnDef<T>[];
  visibleColumns: Set<string>;
  toggleColumnVisibility: (columnId: string) => void;
  resetColumnVisibility: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: Record<string, string>;
  setFilter: (columnId: string, value: string) => void;
  clearFilters: () => void;
  sortColumn: string | null;
  sortDirection: SortDirection;
  setSort: (columnId: string) => void;
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  totalPages: number;
  totalFilteredCount: number;
  paginatedData: T[];
  allFilteredData: T[];
  selectedIds: Set<string>;
  toggleSelectRow: (id: string) => void;
  toggleSelectAll: () => void;
  isAllSelected: boolean;
  clearSelection: () => void;
  keyExtractor: (item: T) => string;
}

const DataTableContext = createContext<DataTableContextValue<any> | null>(null);

export function DataTableProvider<T>({
  data,
  columns,
  keyExtractor,
  defaultPageSize = 25,
  children,
}: {
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor: (item: T) => string;
  defaultPageSize?: number;
  children: React.ReactNode;
}) {
  // Column Visibility
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    columns.forEach((col) => {
      if (col.defaultVisible !== false) {
        initial.add(col.id);
      }
    });
    return initial;
  });

  const toggleColumnVisibility = (columnId: string) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(columnId)) {
        if (next.size > 1) next.delete(columnId); // Keep at least one column visible
      } else {
        next.add(columnId);
      }
      return next;
    });
  };

  const resetColumnVisibility = () => {
    const reset = new Set<string>();
    columns.forEach((col) => {
      if (col.defaultVisible !== false) reset.add(col.id);
    });
    setVisibleColumns(reset);
  };

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});

  const setFilter = (columnId: string, value: string) => {
    setFilters((prev) => {
      const next = { ...prev };
      if (!value) {
        delete next[columnId];
      } else {
        next[columnId] = value;
      }
      return next;
    });
    setPage(1); // Reset to page 1 on filter
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
    setPage(1);
  };

  // Sorting
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const setSort = (columnId: string) => {
    if (sortColumn !== columnId) {
      setSortColumn(columnId);
      setSortDirection('asc');
    } else if (sortDirection === 'asc') {
      setSortDirection('desc');
    } else {
      setSortColumn(null);
      setSortDirection(null);
    }
  };

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filtered & Sorted Data Calculation
  const filteredData = useMemo(() => {
    let result = [...data];

    // Global text search across all columns
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((item) => {
        return columns.some((col) => {
          let val = col.accessorKey ? item[col.accessorKey] : undefined;
          if (val === undefined || val === null) return false;
          return String(val).toLowerCase().includes(q);
        });
      });
    }

    // Column-specific filters
    Object.entries(filters).forEach(([colId, filterVal]) => {
      if (!filterVal) return;
      const targetCol = columns.find((c) => c.id === colId);
      if (!targetCol || !targetCol.accessorKey) return;

      const fLower = filterVal.toLowerCase();
      result = result.filter((item) => {
        const itemVal = item[targetCol.accessorKey!];
        if (itemVal === undefined || itemVal === null) return false;
        return String(itemVal).toLowerCase() === fLower || String(itemVal).toLowerCase().includes(fLower);
      });
    });

    // Sorting
    if (sortColumn && sortDirection) {
      const targetCol = columns.find((c) => c.id === sortColumn);
      if (targetCol && targetCol.accessorKey) {
        const key = targetCol.accessorKey;
        result.sort((a, b) => {
          const valA = a[key];
          const valB = b[key];

          if (valA === valB) return 0;
          if (valA === null || valA === undefined) return 1;
          if (valB === null || valB === undefined) return -1;

          let comp = 0;
          if (typeof valA === 'number' && typeof valB === 'number') {
            comp = valA - valB;
          } else {
            comp = String(valA).localeCompare(String(valB));
          }

          return sortDirection === 'asc' ? comp : -comp;
        });
      }
    }

    return result;
  }, [data, columns, searchQuery, filters, sortColumn, sortDirection]);

  // Paginated Data slice
  const totalFilteredCount = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalFilteredCount / pageSize));

  // Ensure page is valid
  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page, pageSize]);

  // Selection handlers
  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const isAllSelected = useMemo(() => {
    if (paginatedData.length === 0) return false;
    return paginatedData.every((item) => selectedIds.has(keyExtractor(item)));
  }, [paginatedData, selectedIds, keyExtractor]);

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      const next = new Set(selectedIds);
      paginatedData.forEach((item) => next.add(keyExtractor(item)));
      setSelectedIds(next);
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  const value: DataTableContextValue<T> = {
    columns,
    visibleColumns,
    toggleColumnVisibility,
    resetColumnVisibility,
    searchQuery,
    setSearchQuery,
    filters,
    setFilter,
    clearFilters,
    sortColumn,
    sortDirection,
    setSort,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    totalFilteredCount,
    paginatedData,
    allFilteredData: filteredData,
    selectedIds,
    toggleSelectRow,
    toggleSelectAll,
    isAllSelected,
    clearSelection,
    keyExtractor,
  };

  return <DataTableContext.Provider value={value}>{children}</DataTableContext.Provider>;
}

export function useDataTable<T>() {
  const context = useContext(DataTableContext);
  if (!context) {
    throw new Error('useDataTable must be used within a DataTableProvider');
  }
  return context as DataTableContextValue<T>;
}
