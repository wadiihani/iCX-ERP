'use client';

import React from 'react';
import { WorkspaceProvider, useWorkspace } from './workspace-context';
import { SideNav } from './side-nav';
import { TopNavBar } from './top-nav-bar';
import { CommandPalette } from './command-palette';
import { DataSettingsModal } from './data-settings-modal';

function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const { isSidebarOpen, toggleSidebar } = useWorkspace();

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-xs lg:hidden cursor-pointer"
          aria-hidden="true"
        />
      )}

      {/* Collapsible Operational Sidebar */}
      <SideNav />

      {/* Content Wrapper */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Top Operational Navigation Bar */}
        <TopNavBar />

        {/* Main Workspace Body */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Global Quick Command Palette (Cmd+K) */}
      <CommandPalette />

      {/* Global Data & System Settings Modal (CHG-05) */}
      <DataSettingsModal />
    </div>
  );
}

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceProvider>
      <WorkspaceLayout>{children}</WorkspaceLayout>
    </WorkspaceProvider>
  );
}
