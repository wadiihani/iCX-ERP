'use client';

import React, { useState, useEffect } from 'react';
import { Bookmark, Plus, Trash2, Check } from 'lucide-react';
import { SavedViewsManager, type SavedViewDefinition } from '@/lib/saved-views-manager';
import { useDataTable } from './data-table-context';

export function DataTableSavedViews({ entityType }: { entityType: string }) {
  const { filters, setFilter, clearFilters, sortColumn, sortDirection, setSort } = useDataTable();
  const [views, setViews] = useState<SavedViewDefinition[]>([]);
  const [activeViewId, setActiveViewId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newViewName, setNewViewName] = useState('');

  useEffect(() => {
    const loaded = SavedViewsManager.getViews(entityType);
    setViews(loaded);
    const defaultView = loaded.find(v => v.isDefault);
    if (defaultView) {
      setActiveViewId(defaultView.id);
    }
  }, [entityType]);

  const handleSelectView = (view: SavedViewDefinition) => {
    setActiveViewId(view.id);
    clearFilters();
    if (view.filters) {
      Object.entries(view.filters).forEach(([key, val]) => {
        if (typeof val === 'string') {
          setFilter(key, val);
        }
      });
    }
    if (view.sorting) {
      setSort(view.sorting.columnId);
    }
    setIsOpen(false);
  };

  const handleSaveCurrent = () => {
    if (!newViewName.trim()) return;
    const created = SavedViewsManager.saveView({
      name: newViewName.trim(),
      entityType: entityType as SavedViewDefinition['entityType'],
      filters,
      sorting: sortColumn && sortDirection ? { columnId: sortColumn, direction: sortDirection } : undefined,
    });
    setViews([...views, created]);
    setActiveViewId(created.id);
    setNewViewName('');
    setIsSaving(false);
    setIsOpen(false);
  };

  const handleDeleteView = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    SavedViewsManager.deleteView(id, entityType);
    const remaining = views.filter(v => v.id !== id);
    setViews(remaining);
    if (activeViewId === id) {
      setActiveViewId(remaining[0]?.id || '');
    }
  };

  const activeView = views.find(v => v.id === activeViewId);

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-subtle hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
      >
        <Bookmark className="h-3.5 w-3.5 text-aiesec-blue" />
        <span className="max-w-[140px] truncate">{activeView ? activeView.name : 'Saved Views'}</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-72 origin-top-left rounded-lg border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-900 z-50 animate-in fade-in zoom-in-95">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-2 py-1">
            Preset & Custom Views
          </div>

          <div className="max-h-56 overflow-y-auto space-y-1 my-1">
            {views.map((v) => (
              <div
                key={v.id}
                onClick={() => handleSelectView(v)}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded text-xs cursor-pointer transition ${
                  activeViewId === v.id
                    ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {activeViewId === v.id && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                  <span className="truncate">{v.name}</span>
                </div>
                {!v.isDefault && (
                  <button
                    type="button"
                    onClick={(e) => handleDeleteView(e, v.id)}
                    className="p-1 text-slate-400 hover:text-rose-500 rounded"
                    title="Delete custom view"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-2 mt-1">
            {!isSaving ? (
              <button
                type="button"
                onClick={() => setIsSaving(true)}
                className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition"
              >
                <Plus className="h-3.5 w-3.5 text-primary" />
                <span>Save current filters as view</span>
              </button>
            ) : (
              <div className="space-y-2 p-1">
                <input
                  type="text"
                  placeholder="View name (e.g. Q4 Priority EPs)"
                  value={newViewName}
                  onChange={(e) => setNewViewName(e.target.value)}
                  className="w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-xs text-slate-900 dark:text-white"
                  autoFocus
                />
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsSaving(false)}
                    className="px-2 py-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveCurrent}
                    disabled={!newViewName.trim()}
                    className="px-2.5 py-1 text-xs font-semibold rounded bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
