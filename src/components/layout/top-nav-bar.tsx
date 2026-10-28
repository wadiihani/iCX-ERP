'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  Plus,
  Bell,
  Clock,
  Shield,
  ChevronDown,
  Check,
  Building,
  Menu,
  Building2,
  Users,
  Briefcase,
  Globe2,
  Home,
  AlertTriangle,
  UserPlus,
  FileText,
} from 'lucide-react';
import { useWorkspace, AVAILABLE_ROLES, UserRole } from './workspace-context';

export function TopNavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    currentRole,
    setRole,
    currentLc,
    toggleSidebar,
    setCommandPaletteOpen,
    openQuickIntake,
  } = useWorkspace();

  const [isRoleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [isQuickAddOpen, setQuickAddOpen] = useState(false);
  const roleDropdownRef = useRef<HTMLDivElement>(null);
  const quickAddDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        roleDropdownRef.current &&
        !roleDropdownRef.current.contains(event.target as Node)
      ) {
        setRoleDropdownOpen(false);
      }
      if (
        quickAddDropdownRef.current &&
        !quickAddDropdownRef.current.contains(event.target as Node)
      ) {
        setQuickAddOpen(false);
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
      irm: 'IR Partners & Quotas',
      accommodation: 'Exchange Delivery & Standards',
      dashboards: 'Operational Finance',
      admin: 'Workload & Handoffs',
      members: 'Member Engagement & TeSt',
      outbox: 'Action Outbox & Sync',
    };
    return titles[seg] || seg.charAt(0).toUpperCase() + seg.slice(1);
  };

  const quickAddActions = [
    {
      id: 'partner',
      label: 'New B2B Partner Lead',
      category: 'External BD',
      icon: Building2,
      targetHref: '/sales',
      intakeType: 'partner',
    },
    {
      id: 'contact',
      label: 'New B2B Contact',
      category: 'External BD',
      icon: UserPlus,
      targetHref: '/sales',
      intakeType: 'contact',
    },
    {
      id: 'contract_opp',
      label: 'New Contract & Opportunity',
      category: 'External BD',
      icon: FileText,
      targetHref: '/opportunities',
      intakeType: 'contract_opp',
    },
    {
      id: 'ep',
      label: 'New EP Profile / Applicant',
      category: 'Internal Ops',
      icon: Users,
      targetHref: '/crm',
      intakeType: 'ep',
    },
    {
      id: 'ir',
      label: 'New IR Partner Agreement',
      category: 'Internal Ops',
      icon: Globe2,
      targetHref: '/opportunities/irm',
      intakeType: 'ir',
    },
    {
      id: 'accomm',
      label: 'New Housing Bed / Provider',
      category: 'Internal Ops',
      icon: Home,
      targetHref: '/accommodation',
      intakeType: 'accomm',
    },
    {
      id: 'case',
      label: 'New Quality Case / Incident',
      category: 'Governance & ECB',
      icon: AlertTriangle,
      targetHref: '/admin#cases',
      intakeType: 'case',
    },
  ];

  const handleTriggerQuickAdd = (action: typeof quickAddActions[0]) => {
    setQuickAddOpen(false);
    openQuickIntake(action.intakeType);
    if (!pathname.startsWith(action.targetHref.split('#')[0])) {
      router.push(action.targetHref);
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-14 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 shrink-0">
      {/* Left: Mobile Toggle & Breadcrumbs (No horizontal tab clutter - CHG-01) */}
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

      {/* Right: Quick Add Dropdown, Search, Role Switcher, Tenant & Notifications */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* + Quick Add Dropdown (CHG-02 / CHG-03) */}
        <div className="relative" ref={quickAddDropdownRef}>
          <button
            onClick={() => setQuickAddOpen((prev) => !prev)}
            aria-expanded={isQuickAddOpen}
            className="flex items-center gap-1.5 rounded-md bg-aiesec-blue px-2.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-600 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Quick Add</span>
            <ChevronDown className="h-3 w-3 opacity-80" />
          </button>

          {isQuickAddOpen && (
            <div className="absolute right-0 mt-1.5 w-64 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50 animate-in fade-in-50 zoom-in-95">
              <div className="px-2.5 py-1 border-b border-slate-100 dark:border-slate-800 mb-1 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Universal Stakeholder Intake
                </span>
                <span className="text-[9px] text-slate-400">8 Types</span>
              </div>

              <div className="space-y-0.5 max-h-72 overflow-y-auto">
                {quickAddActions.map((act) => {
                  const Icon = act.icon;
                  return (
                    <button
                      key={act.id}
                      onClick={() => handleTriggerQuickAdd(act)}
                      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 transition"
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800 text-aiesec-blue shrink-0">
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="truncate">
                        <div className="font-semibold text-slate-900 dark:text-white truncate">
                          {act.label}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {act.category}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Quick Search Trigger (⌘K) */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-500 shadow-xs transition hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <Search className="h-3.5 w-3.5 text-slate-400" />
          <span className="hidden md:inline">Search...</span>
          <kbd className="hidden rounded bg-slate-200/80 px-1 py-0.5 text-[10px] font-mono text-slate-600 dark:bg-slate-700 dark:text-slate-300 sm:inline-block">
            ⌘K
          </kbd>
        </button>

        {/* Tenant Pill */}
        <div className="hidden lg:flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300">
          <Building className="h-3.5 w-3.5 text-aiesec-blue" />
          <span>{currentLc}</span>
        </div>

        {/* Casablanca Timezone Badge */}
        <div className="hidden xl:flex items-center gap-1 text-[11px] text-slate-400">
          <Clock className="h-3 w-3" />
          <span>Casablanca (GMT+1)</span>
        </div>

        {/* Role Switcher Dropdown */}
        <div className="relative" ref={roleDropdownRef}>
          <button
            onClick={() => setRoleDropdownOpen((prev) => !prev)}
            aria-expanded={isRoleDropdownOpen}
            className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <Shield className="h-3.5 w-3.5 text-aiesec-blue" />
            <span className="hidden sm:inline">{AVAILABLE_ROLES[currentRole].label}</span>
            <span className="sm:hidden">{currentRole.slice(0, 3)}</span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {isRoleDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-64 rounded-lg border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-700 dark:bg-slate-800 z-50">
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
          className="relative flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
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
