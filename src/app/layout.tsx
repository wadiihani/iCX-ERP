import "@xenon-kit/web/styles.css";
import { XenonProvider } from "@xenon-kit/web";
import type { Metadata } from 'next';
import './globals.css';
import { WorkspaceShell } from '@/components/layout/workspace-shell';

export const metadata: Metadata = {
  title: 'AIESEC iCX ERP — Tracker Workspace',
  description: 'Table-First Operational Tracking & Enterprise Resource Planning for AIESEC in Rabat & Morocco',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-x-theme="dark" data-x-accent="lime" data-x-radius="5">
      <body className="h-screen overflow-hidden bg-slate-50 font-sans text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900 dark:bg-slate-950 dark:text-slate-100">
        <WorkspaceShell>
          <XenonProvider defaultTheme="dark" defaultAccent="lime">{children}</XenonProvider>
        </WorkspaceShell>
      </body>
    </html>
  );
}
