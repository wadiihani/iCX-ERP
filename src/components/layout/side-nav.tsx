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
      id: 'icx-integrity',
      title: 'iCX Data Integrity System',
      items: [
        {
          id: 'console',
          title: 'Integrity Console & Health',
          href: '/',
          icon: ShieldCheck,
          badge: 'Console',
          badgeColor: 'border-lime-500/30 text-lime-400 bg-lime-950/20',
        },
        {
          id: 'tracker-stages',
          title: 'Master Tracker & Stages',
          href: '/tracker',
          icon: LayoutDashboard,
          badge: 'Flow',
          badgeColor: 'border-slate-700 text-slate-300 bg-slate-800/40',
        },
        {
          id: 'standards-vault',
          title: 'Standards & Proof Vault',
          href: '/standards',
          icon: ShieldCheck,
          badge: '16 Stds',
          badgeColor: 'border-slate-700 text-slate-300 bg-slate-800/40',
        },
        {
          id: 'status-radar',
          title: 'Status & Deadline Radar',
          href: '/status-governance',
          icon: Bell,
          badge: 'SLA',
          badgeColor: 'border-slate-700 text-slate-300 bg-slate-800/40',
        },
        {
          id: 'partners-ir',
          title: 'Partners & IR Ecosystem',
          href: '/partners',
          icon: Globe2,
          badge: 'PRM',
          badgeColor: 'border-slate-700 text-slate-300 bg-slate-800/40',
        },
        {
          id: 'quality-cs',
          title: 'Quality Cases & CS Mins',
          href: '/quality-cases',
          icon: AlertTriangle,
          badge: 'Cases',
          badgeColor: 'border-slate-700 text-slate-300 bg-slate-800/40',
        },
        {
          id: 'compliance-gate',
          title: 'Compliance & Freeze Gate',
          href: '/compliance',
          icon: Database,
          badge: 'ICB',
          badgeColor: 'border-slate-700 text-slate-300 bg-slate-800/40',
        },
        {
          id: 'handoff-dr',
          title: 'Ownership RACI & DR',
          href: '/handoff',
          icon: CheckSquare,
          badge: 'Handoff',
          badgeColor: 'border-slate-700 text-slate-300 bg-slate-800/40',
        },
      ],
    },
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
          badgeColor: 'border-slate-700 text-slate-300 bg-slate-800/40',
        },
        {
          id: 'my-tasks',
          title: 'My Tasks & Handoffs',
          href: '/handoff',
          icon: CheckSquare,
          badge: 'Queue',
          badgeColor: 'border-slate-700 text-slate-300 bg-slate-800/40',
        },
        {
          id: 'action-alerts',
          title: 'Action Alerts',
          href: '/status-governance',
          icon: Bell,
          badge: 'Alerts',
          badgeColor: 'border-slate-700 text-slate-300 bg-slate-800/40',
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
          href: '/partners',
          icon: Building2,
          badge: 'Partners',
          badgeColor: 'border-slate-700 text-slate-300 bg-slate-800/40',
        },
        {
          id: 'sales-pipeline',
          title: 'Sales Pipeline Board',
          href: '/partners',
          icon: TrendingUp,
          badge: 'PRM',
          badgeColor: 'border-slate-700 text-slate-300 bg-slate-800/40',
        },
        {
          id: 'opportunities',
          title: '3. Contracts, Opps & Slots',
          href: '/tracker',
          icon: Briefcase,
          badge: 'Opps',
          badgeColor: 'border-slate-700 text-slate-300 bg-slate-800/40',
        },
        {
          id: 'sponsors',
          title: '4. CSR Sponsors & Inst.',
          href: '/partners',
          icon: Handshake,
          badge: 'CSR',
          badgeColor: 'border-slate-700 text-slate-300 bg-slate-800/40',
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
          href: '/tracker',
          icon: Users,
          badge: 'EPs',
          badgeColor: 'border-slate-700 text-slate-300 bg-slate-800/40',
        },
        {
          id: 'ir-partners',
          title: '5. IR Partners & Quotas',
          href: '/partners',
          icon: Globe2,
          badge: 'IR',
          badgeColor: 'border-slate-700 text-slate-300 bg-slate-800/40',
        },
        {
          id: 'standards',
          title: '7. 18 Exchange Standards',
          href: '/standards',
          icon: ShieldCheck,
          badge: '16 Stds',
          badgeColor: 'border-slate-700 text-slate-300 bg-slate-800/40',
        },
        {
          id: 'housing-pickups',
          title: '8. Housing (#7) & Pickups (#6)',
          href: '/standards',
          icon: Home,
          badge: 'Host',
          badgeColor: 'border-slate-700 text-slate-300 bg-slate-800/40',
        },
        {
          id: 'cases',
          title: '9. ECB/ICB Cases & Annex 2',
          href: '/quality-cases',
          icon: AlertTriangle,
          badge: 'Cases',
          badgeColor: 'border-slate-700 text-slate-300 bg-slate-800/40',
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
          href: '/compliance',
          icon: DollarSign,
          badge: 'AFPM',
          badgeColor: 'border-slate-700 text-slate-300 bg-slate-800/40',
        },
        {
          id: 'members',
          title: '11. Member Engagement & TeSt',
          href: '/handoff',
          icon: GraduationCap,
          badge: 'RACI',
          badgeColor: 'border-slate-700 text-slate-300 bg-slate-800/40',
        },
        {
          id: 'audit-outbox',
          title: '12. 360° Comm & Audit Logs',
          href: '/status-governance',
          icon: Database,
          badge: 'Audit',
          badgeColor: 'border-slate-700 text-slate-300 bg-slate-800/40',
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
          badgeColor: 'border-slate-700 text-slate-300 bg-slate-800/40',
        },
        {
          id: 'roles-access',
          title: 'Access Permissions (RBAC)',
          href: '/admin/roles-and-access',
          icon: Shield,
          badge: 'RBAC',
          badgeColor: 'border-slate-700 text-slate-300 bg-slate-800/40',
        },
      ],
    },
  ];

  return (
    <aside
      className={`flex flex-col border-r border-slate-200 bg-white transition-all duration-200 ease-in-out dark:border-slate-800 dark:bg-slate-900 z-40 ${
        isSidebarOpen
          ? 'fixed inset-y-0 left-0 w-64 lg:static lg:w-64'
          : 'hidden lg:flex lg:w-16'
      }`}
    >
      {/* Brand Header */}
      <div className="flex h-14 items-center justify-between border-b border-slate-200 px-3.5 dark:border-slate-800 shrink-0">
        <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-lime-500/40 bg-lime-950/30 text-lime-400 font-normal text-xs tracking-tight">
            iCX
          </div>
          {isSidebarOpen && (
            <div className="flex flex-col truncate">
              <span className="font-normal text-xs tracking-tight text-slate-900 dark:text-white">
                iCX Data Integrity ERP
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
              <div className="px-2.5 py-1 text-[9px] font-normal uppercase tracking-wider text-slate-400 dark:text-slate-500">
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
                    className={`group flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs font-normal text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white transition-colors cursor-pointer ${
                      !isSidebarOpen ? 'justify-center' : ''
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors" />
                    {isSidebarOpen && (
                      <div className="flex flex-1 items-center justify-between truncate text-left">
                        <span className="truncate">{item.title}</span>
                        {item.badge && (
                          <span
                            className={`ml-auto rounded border px-1.5 py-0.2 text-[9px] font-normal ${item.badgeColor}`}
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
                  className={`group flex items-center gap-2.5 rounded px-2.5 py-1.5 text-xs font-normal transition-colors border ${
                    isActive
                      ? 'bg-lime-950/20 text-lime-400 border-lime-500/30'
                      : 'text-slate-700 border-transparent hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-colors ${
                      isActive
                        ? 'text-lime-400'
                        : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                    }`}
                  />

                  {isSidebarOpen && (
                    <div className="flex flex-1 items-center justify-between truncate">
                      <span className="truncate">{item.title}</span>
                      {item.badge && (
                        <span
                          className={`ml-auto rounded border px-1.5 py-0.2 text-[9px] font-normal ${item.badgeColor}`}
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
              <span className="text-[9px] font-normal uppercase tracking-wider text-slate-400">
                Persona (RBAC)
              </span>
              <span
                className={`rounded border px-1.5 py-0.2 text-[9px] font-normal ${roleConfig.badgeColor}`}
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
              className="flex h-6 w-6 items-center justify-center rounded bg-slate-100 text-slate-600 text-[9px] font-normal dark:bg-slate-800 dark:text-slate-300"
            >
              {roleConfig.role.slice(0, 2)}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
