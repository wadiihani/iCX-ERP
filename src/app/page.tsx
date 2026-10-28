'use client';

import React, { useState, useMemo } from 'react';
import { useWorkspace } from '@/components/layout/workspace-context';
import {
  GlobalDashboardFilters,
  DomainId,
} from '@/lib/dashboard/dashboard-types';
import { generateDashboardData } from '@/lib/dashboard/dashboard-data-engine';
import { DashboardFilterBar } from '@/components/dashboard/dashboard-filter-bar';
import { DomainCardsGrid } from '@/components/dashboard/domain-cards-grid';
import { ExpandedAnalyticsPanel } from '@/components/dashboard/expanded-analytics-panel';
import {
  Sparkles,
  ShieldCheck,
  Building,
  TrendingUp,
  Cpu,
  Layers,
} from 'lucide-react';

export default function CommandDashboardPage() {
  const { roleConfig, currentLc } = useWorkspace();

  // Level 1: Global Filters State
  const [filters, setFilters] = useState<GlobalDashboardFilters>({
    term: '26.2',
    product: 'All',
    engine: 'All',
    role: 'All',
  });

  // Level 2 & 3: Active Card State (Default to Card 9: Member Engagement)
  const [selectedCardId, setSelectedCardId] = useState<DomainId | null>('members');

  // Compute reactive data model across all 9 domains
  const dashboardData = useMemo(() => {
    return generateDashboardData(filters);
  }, [filters]);

  const selectedCard = useMemo(() => {
    if (!selectedCardId) return null;
    return dashboardData.cards.find((c) => c.id === selectedCardId) || null;
  }, [dashboardData, selectedCardId]);

  const handleFilterChange = (updated: Partial<GlobalDashboardFilters>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleResetFilters = () => {
    setFilters({
      term: '26.2',
      product: 'All',
      engine: 'All',
      role: 'All',
    });
  };

  const handleSelectCard = (id: DomainId) => {
    setSelectedCardId((prev: DomainId | null) => (prev === id ? null : id));
  };


  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      {/* Level 1: Reactive Sticky Filter Bar */}
      <DashboardFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Executive Command Header */}
        <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                AIESEC in {currentLc} — ICX Executive &amp; Operational Command Dashboard
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              AEPP, APIP &amp; AFPM Compliant · Mandate {filters.term} · Zero-CTA In-Place Analytical Workspace
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
              <Building className="w-3.5 h-3.5 text-slate-500" />
              <span>{currentLc} Entity</span>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${roleConfig.badgeColor}`}>
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Role: {roleConfig.label}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
              <Cpu className="w-3.5 h-3.5 text-blue-600" />
              <span>Engine: {filters.engine}</span>
            </div>
          </div>
        </section>

        {/* Level 2: 3x3 Clickable Domain Cards Grid */}
        <DomainCardsGrid
          cards={dashboardData.cards}
          selectedId={selectedCardId}
          onSelectCard={handleSelectCard}
        />

        {/* Level 3: In-Place Expanded Analytics Workspace */}
        {selectedCard && (
          <section id="analytics-workspace" className="pt-2">
            <ExpandedAnalyticsPanel
              card={selectedCard}
              allMembers={dashboardData.members}
              onClose={() => setSelectedCardId(null)}
            />
          </section>
        )}
      </main>
    </div>
  );
}
