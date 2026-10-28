'use client';

import React, { createContext, useContext, useState, useMemo } from 'react';

export type UserRole =
  | 'LC_PRESIDENT'
  | 'VP_BD'
  | 'VP_CXP'
  | 'VP_TM'
  | 'VP_FNL'
  | 'TEAM_LEADER'
  | 'MEMBER';

export interface RoleConfig {
  role: UserRole;
  label: string;
  department: string;
  description: string;
  badgeColor: string;
}

export const AVAILABLE_ROLES: Record<UserRole, RoleConfig> = {
  LC_PRESIDENT: {
    role: 'LC_PRESIDENT',
    label: 'LC President',
    department: 'Governance & EB',
    description: 'Full LC governance, statutory approvals & escalation oversight',
    badgeColor: 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-300',
  },
  VP_BD: {
    role: 'VP_BD',
    label: 'VP Business Development',
    department: 'Sales & Partners',
    description: 'Partner CRM, B2B deal pipeline & organization accounts',
    badgeColor: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300',
  },
  VP_CXP: {
    role: 'VP_CXP',
    label: 'VP Customer Experience',
    department: 'Operations & CXP',
    description: 'EP lifecycle, 18 standards, airport pickups & accommodation',
    badgeColor: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
  },
  VP_TM: {
    role: 'VP_TM',
    label: 'VP Talent Management',
    department: 'People & Culture',
    description: 'User onboarding, team assignments & workload handoffs',
    badgeColor: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
  },
  VP_FNL: {
    role: 'VP_FNL',
    label: 'VP Finance & Legal',
    department: 'Finance & Legal',
    description: 'Dual-approval disbursements, invoices & reserve funds',
    badgeColor: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300',
  },
  TEAM_LEADER: {
    role: 'TEAM_LEADER',
    label: 'Team Leader',
    department: 'Operations / Sales',
    description: 'Team task queues, matching validation & EP touchpoints',
    badgeColor: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-300',
  },
  MEMBER: {
    role: 'MEMBER',
    label: 'General Member',
    department: 'Operations / Sales',
    description: 'Daily EP outreach, interview logs & pickup missions',
    badgeColor: 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
  },
};

interface WorkspaceContextValue {
  currentRole: UserRole;
  roleConfig: RoleConfig;
  setRole: (role: UserRole) => void;
  currentLc: string;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>('VP_CXP');
  const [currentLc] = useState<string>('LC Rabat');
  const [isSidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);

  const roleConfig = useMemo(() => AVAILABLE_ROLES[currentRole], [currentRole]);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      currentRole,
      roleConfig,
      setRole: setCurrentRole,
      currentLc,
      isSidebarOpen,
      toggleSidebar,
      setSidebarOpen,
      isCommandPaletteOpen,
      setCommandPaletteOpen,
    }),
    [currentRole, roleConfig, currentLc, isSidebarOpen, isCommandPaletteOpen]
  );

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
