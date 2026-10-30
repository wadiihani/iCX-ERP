'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CheckSquare,
  Bell,
  Building2,
  TrendingUp,
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
  Shield,
} from 'lucide-react';
import { useWorkspace } from './workspace-context';

interface NavItem {
  id: string;
  title: string;
  href?: string;
  onClick?: () => void;
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
      title: 'Command Center',
      items: [
        {
          id: 'dashboard',
          title: '1. Main KPI Dashboard',
          href: '/',
          icon: LayoutDashboard,
          badge: 'Live',
          badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300',
        },
        {
          id: 'my-tasks',
          title: 'My Tasks & Handoffs',
          href: '/admin',
          icon: CheckSquare,
          badge: 'Queue',
          badgeColor: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300',
        },
        {
          id: 'action-alerts',
          title: 'Action Alerts',
          href: '/admin#alerts',
          icon: Bell,
          badge: 'Alerts',
          badgeColor: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300',
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
          id: 'sales-pipeline',
          title: 'Sales Pipeline Board',
          href: '/sales/pipeline',
          icon: TrendingUp,
          badge: 'Kanban',
          badgeColor: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300',
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
          id: 'eps',
          title: '6. EPs, Matching & Visa',
          href: '/crm',
          icon: Users,
          badge: '42 EPs',
          badgeColor: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300',
        },
        {
          id: 'ir-partners',
          title: '5. IR Partners & Quotas',
          href: '/opportunities/irm',
          icon: Globe2,
          badge: '12 IR',
          badgeColor: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300',
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
    {
      id: 'admin',
      title: 'Administration',
      items: [
        {
          id: 'settings-modal',
          title: 'Data & Settings',
          onClick: () => setDataSettingsOpen(true),
          icon: Settings,
          badge: 'System',
          badgeColor: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300',
        },
        {
          id: 'roles-access',
          title: 'Access Permissions (RBAC)',
          href: '/admin/roles-and-access',
          icon: Shield,
          badge: 'RBAC',
          badgeColor: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300',
        },
      ],
    },
  ];

  return (
    <aside
      className={`flex flex-col border-r border-slate-200 bg-white transition-all duration-200 ease-in-out dark:border-slate-800 dark:bg-slate-900 z-40 ${
        isSidebarOpen
          ? 'fixed inset-y-0 left-0 w-64 lg:static lg:w-64 shadow-xl lg:shadow-none'
          : 'hidden lg:flex lg:w-16'
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
          className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          {isSidebarOpen ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* 5-Group Enterprise Navigation List */}
      <nav className="flex-1 space-y-3.5 p-2 overflow-y-auto">
        {navigationGroups.map((group) => (
          <div key={group.id} className="space-y-0.5">
            {isSidebarOpen && (
              <div className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {group.title}
              </div>
            )}

            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = item.href
                ? item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href.split('#')[0])
                : false;

              if (item.onClick) {
                return (
                  <button
                    key={item.id}
                    onClick={item.onClick}
                    title={!isSidebarOpen ? item.title : undefined}
                    className={`group flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white transition-colors cursor-pointer ${
                      !isSidebarOpen ? 'justify-center' : ''
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors" />
                    {isSidebarOpen && (
                      <div className="flex flex-1 items-center justify-between truncate text-left">
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
                  </button>
                );
              }

              return (
                <Link
                  key={item.id}
                  href={item.href || '#'}
                  title={!isSidebarOpen ? item.title : undefined}
                  className={`group flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50/80 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 font-semibold shadow-2xs border-l-2 border-blue-600'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-colors ${
                      isActive
                        ? 'text-blue-600 dark:text-blue-400'
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

      {/* Footer Area: Active Role Card */}
      <div className="border-t border-slate-200 p-2.5 dark:border-slate-800 space-y-2 shrink-0">
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
