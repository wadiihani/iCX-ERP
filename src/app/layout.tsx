import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { WorkspaceShell } from '@/components/layout/workspace-shell';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

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
    <html lang="en" className={inter.variable}>
      <body className="h-screen overflow-hidden bg-slate-50 font-sans text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900 dark:bg-slate-950 dark:text-slate-100">
        <WorkspaceShell>
          {children}
        </WorkspaceShell>
      </body>
    </html>
  );
}
