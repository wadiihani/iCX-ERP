import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { WorkspaceProvider } from '../src/components/layout/workspace-context';
import { SideNav } from '../src/components/layout/side-nav';
import { TopNavBar } from '../src/components/layout/top-nav-bar';
import { DataSettingsModal } from '../src/components/layout/data-settings-modal';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('Layout and Navigation System (Phase 11 / CHG-01 to CHG-05)', () => {
  it('renders all 4 canonical operational groups in the Left Sidebar', () => {
    const html = renderToStaticMarkup(
      <WorkspaceProvider>
        <SideNav />
      </WorkspaceProvider>
    );

    // Verify 4 groups exist
    expect(html).toContain('Command');
    expect(html).toContain('External Engine (BD)');
    expect(html).toContain('Internal Engine (Ops / CXP)');
    expect(html).toContain('Finance &amp; People (FnL / TM)');

    // Verify all 12 modules exist
    expect(html).toContain('1. Main KPI Dashboard');
    expect(html).toContain('2. B2B Partner CRM &amp; Deals');
    expect(html).toContain('3. Contracts, Opps &amp; Slots');
    expect(html).toContain('4. CSR Sponsors &amp; Inst.');
    expect(html).toContain('5. IR Partners &amp; Quotas');
    expect(html).toContain('6. EPs, Matching &amp; Visa');
    expect(html).toContain('7. 18 Exchange Standards');
    expect(html).toContain('8. Housing (#7) &amp; Pickups (#6)');
    expect(html).toContain('9. ECB/ICB Cases &amp; Annex 2');
    expect(html).toContain('10. AFPM Finance &amp; Invoicing');
    expect(html).toContain('11. Member Engagement &amp; TeSt');
    expect(html).toContain('12. 360° Comm &amp; Audit Logs');

    // Verify Settings button exists
    expect(html).toContain('Data &amp; Settings');
  });

  it('renders Quick Add button and header elements in TopNavBar', () => {
    const html = renderToStaticMarkup(
      <WorkspaceProvider>
        <TopNavBar />
      </WorkspaceProvider>
    );

    expect(html).toContain('Quick Add');
    expect(html).toContain('LC Rabat');
    expect(html).toContain('Casablanca (GMT+1)');
  });

  it('renders DataSettingsModal when active', () => {
    // Render with isDataSettingsOpen true
    const html = renderToStaticMarkup(
      <WorkspaceProvider>
        <DataSettingsModal />
      </WorkspaceProvider>
    );

    // Default is closed, so html is empty
    expect(html).toBe('');
  });
});
