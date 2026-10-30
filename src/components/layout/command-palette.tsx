'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Users,
  Building2,
  Briefcase,
  ShieldCheck,
  DollarSign,
  CheckSquare,
  ArrowRight,
  X,
  PlusCircle,
  Database,
  RotateCcw,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { useWorkspace, type UserRole } from './workspace-context';
import { ErpRepository } from '@/lib/storage/erp-repository';

interface CommandItem {
  title: string;
  category: 'Module' | 'EP Record' | 'Partner Account' | 'Quick Action' | 'System' | 'Role Switch';
  href?: string;
  action?: () => void;
  icon: React.ComponentType<{ className?: string }>;
  code: string;
}

export function CommandPalette() {
  const router = useRouter();
  const {
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    setDataSettingsOpen,
    setRole,
    currentRole,
  } = useWorkspace();
  const [query, setQuery] = useState('');

  // Keyboard shortcut listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  const commandItems: CommandItem[] = useMemo(
    () => [
      // Quick Actions
      {
        title: '+ New B2B Lead / Organization',
        category: 'Quick Action',
        href: '/sales',
        icon: PlusCircle,
        code: 'ACT-01',
      },
      {
        title: '+ New EP Application Dossier',
        category: 'Quick Action',
        href: '/crm',
        icon: PlusCircle,
        code: 'ACT-02',
      },
      {
        title: '+ New Opportunity & Slot Wave',
        category: 'Quick Action',
        href: '/opportunities',
        icon: PlusCircle,
        code: 'ACT-03',
      },

      // Modules
      { title: 'EP Master Tracker', category: 'Module', href: '/crm', icon: Users, code: 'TRK-01' },
      { title: 'B2B Partner CRM & Deals', category: 'Module', href: '/sales', icon: Building2, code: 'TRK-02' },
      { title: 'Opportunities & Slots', category: 'Module', href: '/opportunities', icon: Briefcase, code: 'TRK-03' },
      { title: 'Delivery & 18 Standards', category: 'Module', href: '/accommodation', icon: ShieldCheck, code: 'TRK-04' },
      { title: 'Operational Finance Ledger', category: 'Module', href: '/dashboards', icon: DollarSign, code: 'TRK-05' },
      { title: 'Workload & Handoffs Queue', category: 'Module', href: '/admin', icon: CheckSquare, code: 'TRK-06' },
      { title: 'Action Outbox & EXPA Sync', category: 'Module', href: '/outbox', icon: Briefcase, code: 'TRK-07' },

      // Stakeholder Records
      { title: 'Sofia Martinez (EP-2026-081)', category: 'EP Record', href: '/crm', icon: Users, code: 'iGV' },
      { title: 'Lukas Schneider (EP-2026-077)', category: 'EP Record', href: '/crm', icon: Users, code: 'iGTe' },
      { title: 'BMCE Bank Foundation', category: 'Partner Account', href: '/sales', icon: Building2, code: 'DEAL-019' },
      { title: 'Rabat American School', category: 'Partner Account', href: '/sales', icon: Building2, code: 'DEAL-022' },

      // System Controls
      {
        title: 'Open Data Management & Settings',
        category: 'System',
        action: () => setDataSettingsOpen(true),
        icon: Database,
        code: 'SYS-01',
      },
      {
        title: 'Reset Local Database to Statutory Seed',
        category: 'System',
        action: () => ErpRepository.resetToStatutoryDefaults(),
        icon: RotateCcw,
        code: 'SYS-02',
      },

      // Role Switcher
      {
        title: 'Switch Role to VP CXP (Operations)',
        category: 'Role Switch',
        action: () => setRole('VP_CXP'),
        icon: UserCheck,
        code: 'ROLE-CXP',
      },
      {
        title: 'Switch Role to VP BD (Sales & CRM)',
        category: 'Role Switch',
        action: () => setRole('VP_BD'),
        icon: UserCheck,
        code: 'ROLE-BD',
      },
      {
        title: 'Switch Role to VP FNL (Finance & Legal)',
        category: 'Role Switch',
        action: () => setRole('VP_FNL'),
        icon: UserCheck,
        code: 'ROLE-FNL',
      },
      {
        title: 'Switch Role to LC President (Governance)',
        category: 'Role Switch',
        action: () => setRole('LC_PRESIDENT'),
        icon: UserCheck,
        code: 'ROLE-LCP',
      },
    ],
    [setDataSettingsOpen, setRole]
  );

  const filteredItems = useMemo(() => {
    if (!query.trim()) return commandItems;
    const lower = query.toLowerCase();
    return commandItems.filter(
      (item) =>
        item.title.toLowerCase().includes(lower) ||
        item.category.toLowerCase().includes(lower) ||
        item.code.toLowerCase().includes(lower)
    );
  }, [commandItems, query]);

  if (!isCommandPaletteOpen) return null;

  const handleExecute = (item: CommandItem) => {
    setCommandPaletteOpen(false);
    setQuery('');
    if (item.action) {
      item.action();
    } else if (item.href) {
      router.push(item.href);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 p-4 pt-20 backdrop-blur-sm sm:p-6 sm:pt-24"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Search Input Bar */}
        <div className="flex items-center border-b border-slate-200 px-3.5 py-3 dark:border-slate-800">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search records, execute commands, switch roles (e.g. 'EP', 'Reset', 'VP')..."
            autoFocus
            className="w-full bg-transparent px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white"
          />
          <button
            onClick={() => setCommandPaletteOpen(false)}
            aria-label="Close command palette"
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              No operational actions found matching &ldquo;{query}&rdquo;
            </div>
          ) : (
            filteredItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.title}
                  onClick={() => handleExecute(item)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-500 group-hover:bg-aiesec-soft group-hover:text-aiesec-blue dark:bg-slate-800 dark:group-hover:bg-blue-950/50 dark:group-hover:text-blue-300">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white block">
                        {item.title}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      {item.code}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-3.5 py-2 text-[10px] text-slate-400 dark:border-slate-800 dark:bg-slate-850">
          <div className="flex items-center gap-2">
            <span>Navigation: <kbd className="rounded bg-white px-1 border dark:bg-slate-800">↑</kbd> <kbd className="rounded bg-white px-1 border dark:bg-slate-800">↓</kbd></span>
            <span>Execute: <kbd className="rounded bg-white px-1 border dark:bg-slate-800">Enter</kbd></span>
          </div>
          <span>Close: <kbd className="rounded bg-white px-1 border dark:bg-slate-800">Esc</kbd></span>
        </div>
      </div>
    </div>
  );
}
