'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Briefcase,
  Handshake,
  Globe2,
  Users,
  ShieldCheck,
  Home,
  AlertTriangle,
  DollarSign,
  GraduationCap,
  Database,
  ChevronLeft,
  ChevronRight,
  Settings,
  Sparkles,
} from 'lucide-react';
import { useWorkspace } from './workspace-context';

interface NavItem {
  id: string;
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
}

interface NavGroup {
  id: string;
  title: string;
  items: NavItem[];
}

export function SideNav() {
  const pathname = usePathname();
  const {
    isSidebarOpen,
    toggleSidebar,
    roleConfig,
    currentLc,
    setDataSettingsOpen,
  } = useWorkspace();

  const navigationGroups: NavGroup[] = [
    {
      id: 'command',
      title: 'Command',
      items: [
        {
          id: 'dashboard',
          title: '1. Main KPI Dashboard',
          href: '/',
          icon: LayoutDashboard,
          badge: 'Live',
          badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300',
        },
      ],
    },
    {
      id: 'external-bd',
      title: 'External Engine (BD)',
      items: [
        {
          id: 'partners',
          title: '2. B2B Partner CRM & Deals',
          href: '/sales',
          icon: Building2,
          badge: '18 Deals',
          badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300',
        },
        {
          id: 'opportunities',
          title: '3. Contracts, Opps & Slots',
          href: '/opportunities',
          icon: Briefcase,
          badge: '64 Slots',
          badgeColor: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300',
        },
        {
          id: 'sponsors',
          title: '4. CSR Sponsors & Inst.',
          href: '/sales#sponsors',
          icon: Handshake,
          badge: 'CSR',
          badgeColor: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300',
        },
      ],
    },
    {
      id: 'internal-ops',
      title: 'Internal Engine (Ops / CXP)',
      items: [
        {
          id: 'ir-partners',
          title: '5. IR Partners & Quotas',
          href: '/opportunities/irm',
          icon: Globe2,
          badge: '12 IR',
          badgeColor: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300',
        },
        {
          id: 'eps',
          title: '6. EPs, Matching & Visa',
          href: '/crm',
          icon: Users,
          badge: '42 EPs',
          badgeColor: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300',
        },
        {
          id: 'standards',
          title: '7. 18 Exchange Standards',
          href: '/accommodation#standards',
          icon: ShieldCheck,
          badge: '18 Stds',
          badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300',
        },
        {
          id: 'housing-pickups',
          title: '8. Housing (#7) & Pickups (#6)',
          href: '/accommodation',
          icon: Home,
          badge: 'Beds',
          badgeColor: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300',
        },
        {
          id: 'cases',
          title: '9. ECB/ICB Cases & Annex 2',
          href: '/admin#cases',
          icon: AlertTriangle,
          badge: 'ECB',
          badgeColor: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300',
        },
      ],
    },
    {
      id: 'finance-people',
      title: 'Finance & People (FnL / TM)',
      items: [
        {
          id: 'finance',
          title: '10. AFPM Finance & Invoicing',
          href: '/dashboards',
          icon: DollarSign,
          badge: 'AFPM',
          badgeColor: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300',
        },
        {
          id: 'members',
          title: '11. Member Engagement & TeSt',
          href: '/members',
          icon: GraduationCap,
          badge: 'TeSt',
          badgeColor: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300',
        },
        {
          id: 'audit-outbox',
          title: '12. 360° Comm & Audit Logs',
          href: '/outbox',
          icon: Database,
          badge: 'Audit',
          badgeColor: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300',
        },
      ],
    },
  ];

  return (
    <aside
      className={`relative flex flex-col border-r border-slate-200 bg-white transition-all duration-200 ease-in-out dark:border-slate-800 dark:bg-slate-900 ${
        isSidebarOpen ? 'w-64' : 'w-16'
      }`}
    >
      {/* Brand Header */}
      <div className="flex h-14 items-center justify-between border-b border-slate-200 px-3.5 dark:border-slate-800 shrink-0">
        <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-aiesec-darkblue via-aiesec-blue to-sky-400 text-white shadow-md shadow-blue-500/25 font-extrabold text-xs tracking-tight ring-1 ring-white/20">
            AI
          </div>
          {isSidebarOpen && (
            <div className="flex flex-col truncate">
              <span className="font-bold text-xs tracking-tight text-slate-900 dark:text-white">
                iCX ERP Workspace
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {currentLc} · Mandate 26.2
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

      {/* 4-Group Navigation List */}
      <nav className="flex-1 space-y-4 p-2 overflow-y-auto">
        {navigationGroups.map((group) => (
          <div key={group.id} className="space-y-1">
            {isSidebarOpen && (
              <div className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                {group.title}
              </div>
            )}

            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href.split('#')[0]);

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  title={!isSidebarOpen ? item.title : undefined}
                  className={`group flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-aiesec-soft text-aiesec-blue dark:bg-blue-950/50 dark:text-blue-300 font-semibold shadow-xs'
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
          </div>
        ))}
      </nav>

      {/* Footer Area: Data & Settings + Active Role Card */}
      <div className="border-t border-slate-200 p-2.5 dark:border-slate-800 space-y-2 shrink-0">
        {/* Data & Settings Button (CHG-05) */}
        <button
          onClick={() => setDataSettingsOpen(true)}
          className={`flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 ${
            !isSidebarOpen ? 'justify-center' : ''
          }`}
          title="Data Management & System Settings"
        >
          <Settings className="h-4 w-4 text-slate-500 shrink-0" />
          {isSidebarOpen && <span>⚙️ Data &amp; Settings</span>}
        </button>

        {/* Active Role Card */}
        {isSidebarOpen ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-2 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Persona (RBAC)
              </span>
              <span
                className={`rounded border px-1.5 py-0.2 text-[9px] font-bold ${roleConfig.badgeColor}`}
              >
                {roleConfig.label}
              </span>
            </div>
            <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400 truncate">
              {roleConfig.department}
            </p>
          </div>
        ) : (
          <div className="flex justify-center">
            <div
              title={`Role: ${roleConfig.label}`}
              className="flex h-6 w-6 items-center justify-center rounded bg-slate-100 text-slate-600 text-[9px] font-bold dark:bg-slate-800 dark:text-slate-300"
            >
              {roleConfig.role.slice(0, 2)}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
