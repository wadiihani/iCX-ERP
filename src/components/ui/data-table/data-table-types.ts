import type React from 'react';

export type SortDirection = 'asc' | 'desc' | null;

export interface ColumnDef<T> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: 'text' | 'select' | 'date';
  filterOptions?: Array<{ label: string; value: string }>;
  defaultVisible?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

export interface FilterValue {
  columnId: string;
  value: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  title?: string;
  description?: string;
  searchPlaceholder?: string;
  pageSize?: number;
  enableSelection?: boolean;
  onBulkAction?: (action: string, selectedIds: string[]) => void;
  bulkActions?: Array<{ id: string; label: string; variant?: 'default' | 'destructive' }>;
  exportFileName?: string;
  isLoading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  emptySubtext?: string;
  entityType?: string;
}
