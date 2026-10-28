'use client';

import React from 'react';
import { WorkspaceProvider } from './workspace-context';
import { SideNav } from './side-nav';
import { TopNavBar } from './top-nav-bar';
import { CommandPalette } from './command-palette';

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceProvider>
      <div className="flex h-screen w-full overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        {/* Collapsible Operational Sidebar */}
        <SideNav />

        {/* Content Wrapper */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top Operational Navigation Bar */}
          <TopNavBar />

          {/* Main Workspace Body */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>

        {/* Global Quick Command Palette (Cmd+K) */}
        <CommandPalette />
      </div>
    </WorkspaceProvider>
  );
}
