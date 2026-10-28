'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  ShieldCheck,
  DollarSign,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Database,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useWorkspace } from './workspace-context';

export function SideNav() {
  const pathname = usePathname();
  const { isSidebarOpen, toggleSidebar, roleConfig } = useWorkspace();

  const navigationItems = [
    {
      title: 'Executive Dashboard',
      href: '/',
      icon: LayoutDashboard,
      badge: 'Live',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300',
    },
    {
      title: 'EP Master Tracker',
      href: '/crm',
      icon: Users,
      badge: '42',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300',
    },
    {
      title: 'B2B Partner CRM',
      href: '/sales',
      icon: Building2,
      badge: '18 Deals',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300',
    },
    {
      title: 'Opportunities & Slots',
      href: '/opportunities',
      icon: Briefcase,
      badge: '64 Slots',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300',
    },
    {
      title: 'Delivery & Standards',
      href: '/accommodation',
      icon: ShieldCheck,
      badge: '18 Stds',
      badgeColor: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300',
    },
    {
      title: 'Operational Finance',
      href: '/dashboards',
      icon: DollarSign,
      badge: 'AFPM',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300',
    },
    {
      title: 'Workload & Handoffs',
      href: '/admin',
      icon: CheckSquare,
      badge: '3 Due',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300',
    },
    {
      title: 'Action Outbox & Sync',
      href: '/outbox',
      icon: Database,
      badge: 'GIS Sync',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300',
    },
  ];

  return (
    <aside
      className={`relative flex flex-col border-r border-slate-200 bg-white transition-all duration-200 ease-in-out dark:border-slate-800 dark:bg-slate-900 ${
        isSidebarOpen ? 'w-64' : 'w-16'
      }`}
    >
      {/* Brand Header */}
      <div className="flex h-14 items-center justify-between border-b border-slate-200 px-3.5 dark:border-slate-800">
        <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-aiesec-blue text-white shadow-sm font-bold text-xs tracking-tight">
            AI
          </div>
          {isSidebarOpen && (
            <div className="flex flex-col truncate">
              <span className="font-bold text-xs tracking-tight text-slate-900 dark:text-white">
                iCX ERP Workspace
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                AIESEC in Rabat
              </span>
            </div>
          )}
        </Link>
        <button
          onClick={toggleSidebar}
          aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          {isSidebarOpen ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
        <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {isSidebarOpen ? 'Operational Trackers' : '•••'}
        </div>

        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              title={!isSidebarOpen ? item.title : undefined}
              className={`group flex items-center gap-3 rounded-md px-2.5 py-2 text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-aiesec-soft text-aiesec-blue dark:bg-blue-950/50 dark:text-blue-300 font-semibold'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
              }`}
            >
              <Icon
                className={`h-4 w-4 shrink-0 transition-colors ${
                  isActive
                    ? 'text-aiesec-blue dark:text-blue-400'
                    : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                }`}
              />

              {isSidebarOpen && (
                <div className="flex flex-1 items-center justify-between truncate">
                  <span className="truncate">{item.title}</span>
                  {item.badge && (
                    <span
                      className={`ml-auto rounded border px-1.5 py-0.2 text-[9px] font-semibold ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Active Role Card at bottom */}
      {isSidebarOpen ? (
        <div className="border-t border-slate-200 p-3 dark:border-slate-800">
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-2.5 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Active Role
              </span>
              <span
                className={`rounded border px-1.5 py-0.5 text-[9px] font-bold ${roleConfig.badgeColor}`}
              >
                {roleConfig.label}
              </span>
            </div>
            <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2">
              {roleConfig.description}
            </p>
          </div>
        </div>
      ) : (
        <div className="border-t border-slate-200 p-2 flex justify-center dark:border-slate-800">
          <div
            title={`Role: ${roleConfig.label}`}
            className="flex h-7 w-7 items-center justify-center rounded bg-slate-100 text-slate-600 text-[10px] font-bold dark:bg-slate-800 dark:text-slate-300"
          >
            {roleConfig.role.slice(0, 2)}
          </div>
        </div>
      )}
    </aside>
  );
}
