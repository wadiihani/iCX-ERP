'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  Bell,
  Clock,
  Shield,
  ChevronDown,
  Check,
  Building,
  Menu,
} from 'lucide-react';
import { useWorkspace, AVAILABLE_ROLES, UserRole } from './workspace-context';

export function TopNavBar() {
  const pathname = usePathname();
  const {
    currentRole,
    setRole,
    currentLc,
    toggleSidebar,
    setCommandPaletteOpen,
  } = useWorkspace();

  const [isRoleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setRoleDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute breadcrumbs from pathname
  const pathSegments = pathname.split('/').filter(Boolean);
  const getBreadcrumbTitle = (seg: string) => {
    const titles: Record<string, string> = {
      crm: 'EP Master Tracker',
      sales: 'B2B Partner CRM',
      opportunities: 'Opportunities & Slots',
      accommodation: 'Exchange Delivery & Standards',
      dashboards: 'Operational Finance',
      admin: 'Workload & Handoffs',
    };
    return titles[seg] || seg.charAt(0).toUpperCase() + seg.slice(1);
  };

  return (
    <header className="sticky top-0 z-20 flex h-14 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          aria-label="Toggle navigation menu"
          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs">
          <Link
            href="/"
            className="font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
          >
            Workspace
          </Link>

          {pathSegments.map((seg, idx) => {
            const isLast = idx === pathSegments.length - 1;
            const href = `/${pathSegments.slice(0, idx + 1).join('/')}`;
            return (
              <React.Fragment key={seg}>
                <span className="text-slate-400">/</span>
                {isLast ? (
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {getBreadcrumbTitle(seg)}
                  </span>
                ) : (
                  <Link
                    href={href}
                    className="font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    {getBreadcrumbTitle(seg)}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Right: Quick Search, Role Switcher, Tenant & Notifications */}
      <div className="flex items-center gap-2.5">
        {/* Quick Search Trigger */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-500 shadow-sm transition hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <Search className="h-3.5 w-3.5 text-slate-400" />
          <span className="hidden sm:inline">Search records, EPs, deals...</span>
          <kbd className="hidden rounded bg-slate-200/80 px-1 py-0.5 text-[10px] font-mono text-slate-600 dark:bg-slate-700 dark:text-slate-300 md:inline-block">
            ⌘K
          </kbd>
        </button>

        {/* Tenant Pill */}
        <div className="hidden lg:flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-850 dark:text-slate-300">
          <Building className="h-3.5 w-3.5 text-aiesec-blue" />
          <span>{currentLc}</span>
        </div>

        {/* Casablanca Timezone Badge */}
        <div className="hidden xl:flex items-center gap-1 text-[11px] text-slate-400">
          <Clock className="h-3 w-3" />
          <span>Casablanca (GMT+1)</span>
        </div>

        {/* Role Switcher Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setRoleDropdownOpen((prev) => !prev)}
            aria-expanded={isRoleDropdownOpen}
            className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-subtle hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <Shield className="h-3.5 w-3.5 text-aiesec-blue" />
            <span className="hidden sm:inline">{AVAILABLE_ROLES[currentRole].label}</span>
            <span className="sm:hidden">{currentRole.slice(0, 3)}</span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {isRoleDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-64 rounded-lg border border-slate-200 bg-white p-1.5 shadow-elevated dark:border-slate-700 dark:bg-slate-800 z-50">
              <div className="px-2 py-1 border-b border-slate-100 dark:border-slate-700/60 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Switch Role Persona (RBAC Simulator)
                </span>
              </div>

              {(Object.keys(AVAILABLE_ROLES) as UserRole[]).map((r) => {
                const config = AVAILABLE_ROLES[r];
                const isSelected = currentRole === r;
                return (
                  <button
                    key={r}
                    onClick={() => {
                      setRole(r);
                      setRoleDropdownOpen(false);
                    }}
                    className={`flex w-full items-start justify-between rounded-md px-2 py-1.5 text-left text-xs transition-colors ${
                      isSelected
                        ? 'bg-aiesec-soft text-aiesec-blue dark:bg-blue-950/60 dark:text-blue-300 font-semibold'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span>{config.label}</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          · {config.department}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-1">
                        {config.description}
                      </p>
                    </div>
                    {isSelected && (
                      <Check className="h-3.5 w-3.5 text-aiesec-blue shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Notifications Alert */}
        <Link
          href="/admin"
          title="3 Overdue Tasks / Handoffs"
          className="relative flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 shadow-subtle hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[9px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
            3
          </span>
        </Link>
      </div>
    </header>
  );
}
