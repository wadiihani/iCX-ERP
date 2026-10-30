'use client';

import React, { useState, useMemo } from 'react';
import { useWorkspace } from '@/components/layout/workspace-context';
import {
  ProgramType,
  CohortPeriod,
  TermMandate,
  KpiDetailViewData,
} from '@/lib/types/dashboard-spec';
import {
  generateExecutiveOutcomeCards,
  generateExecutiveSupplyCards,
  generateCohortFunnelStages,
  generateProjectCapacities,
  generateActionQueueItems,
} from '@/lib/analytics/cohort-analytics-engine';
import { buildKpiDiagnosticDetail } from '@/lib/dashboard/diagnostic-engine';
import {
  ExecutiveFilterBar,
  ExecutiveFilterState,
} from '@/components/dashboard/executive/executive-filter-bar';
import { ExecutiveRowOutcomes } from '@/components/dashboard/executive/executive-row-outcomes';
import { ExecutiveRowSupply } from '@/components/dashboard/executive/executive-row-supply';
import { ExecutiveRowTrends } from '@/components/dashboard/executive/executive-row-trends';
import { ExecutiveRowActionQueue } from '@/components/dashboard/executive/executive-row-action-queue';
import { KpiInspectDrawer } from '@/components/dashboard/kpi-inspect-drawer';
import { FunctionalWorkflowHub } from '@/components/dashboard/functional-views/functional-workflow-hub';

// Legacy 3x3 Grid imports preserved for backward compatibility in DOMAIN_GRID mode
import { DomainCardsGrid } from '@/components/dashboard/domain-cards-grid';
import { ExpandedAnalyticsPanel } from '@/components/dashboard/expanded-analytics-panel';
import { generateDashboardData } from '@/lib/dashboard/dashboard-data-engine';
import { DomainId } from '@/lib/dashboard/dashboard-types';
import {
  Building,
  ShieldCheck,
  Cpu,
} from 'lucide-react';

export default function CommandDashboardPage() {
  const { roleConfig, currentLc } = useWorkspace();

  // Primary Executive Filter State
  const [filters, setFilters] = useState<ExecutiveFilterState>({
    term: '26.2',
    program: 'iGV',
    cohort: '2026-Q2',
    project: 'ALL',
    viewMode: 'EXECUTIVE_4ROW',
  });

  // KPI Inspect Drawer State
  const [inspectKpiKey, setInspectKpiKey] = useState<string | null>(null);

  // Legacy Domain Grid Active Card State
  const [selectedCardId, setSelectedCardId] = useState<DomainId | null>('members');

  // Compute reactive cohort analytics models
  const outcomeCards = useMemo(() => {
    return generateExecutiveOutcomeCards(filters);
  }, [filters]);

  const supplyCards = useMemo(() => {
    return generateExecutiveSupplyCards(filters);
  }, [filters]);

  const funnelStages = useMemo(() => {
    return generateCohortFunnelStages(filters);
  }, [filters]);

  const projectCapacities = useMemo(() => {
    return generateProjectCapacities(filters);
  }, [filters]);

  const actionQueueItems = useMemo(() => {
    return generateActionQueueItems(filters);
  }, [filters]);

  // Compute active 10-point KPI detail data for inspect drawer
  const inspectData: KpiDetailViewData | null = useMemo(() => {
    if (!inspectKpiKey) return null;
    return buildKpiDiagnosticDetail(inspectKpiKey);
  }, [inspectKpiKey]);

  // Legacy 3x3 Grid data
  const legacyData = useMemo(() => {
    return generateDashboardData({
      term: filters.term,
      product: filters.program,
      engine: 'All',
      role: 'All',
    });
  }, [filters.term, filters.program]);

  const selectedLegacyCard = useMemo(() => {
    if (!selectedCardId) return null;
    return legacyData.cards.find((c) => c.id === selectedCardId) || null;
  }, [legacyData, selectedCardId]);

  const handleFilterChange = (updated: Partial<ExecutiveFilterState>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleResetFilters = () => {
    setFilters({
      term: '26.2',
      program: 'iGV',
      cohort: '2026-Q2',
      project: 'ALL',
      viewMode: 'EXECUTIVE_4ROW',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20">
      {/* Level 1: Reactive Sticky Filter Bar with View Mode Switcher */}
      <ExecutiveFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        lastRefreshedText="Live Database"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Executive Command Header */}
        <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                AIESEC in {currentLc} — Executive &amp; Operational Command Dashboard
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Real-time exchange metrics, pipeline velocity, and standards tracking · Term {filters.term}
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
              <span>Program: {filters.program}</span>
            </div>
          </div>
        </section>

        {/* VIEW MODE 1: EXECUTIVE 4-ROW ARCHITECTURE (SPEC SECTION 9) */}
        {filters.viewMode === 'EXECUTIVE_4ROW' && (
          <div className="space-y-6">
            {/* Row 1: Exchange Outcomes & Quality */}
            <ExecutiveRowOutcomes
              outcomes={outcomeCards}
              onInspectKpi={(key) => setInspectKpiKey(key)}
            />

            {/* Row 2: Growth & Supply */}
            <ExecutiveRowSupply
              supply={supplyCards}
              onInspectKpi={(key) => setInspectKpiKey(key)}
            />

            {/* Row 3: Conversion Trends & Project Capacity */}
            <ExecutiveRowTrends
              funnelStages={funnelStages}
              projectCapacities={projectCapacities}
              onInspectKpi={(key) => setInspectKpiKey(key)}
            />

            {/* Row 4: Real-Time Risk & Action Queue */}
            <ExecutiveRowActionQueue
              queueItems={actionQueueItems}
            />
          </div>
        )}

        {/* VIEW MODE 2: FUNCTIONAL WORKFLOW HUBS (6 DEEP-DIVE VIEWS) */}
        {filters.viewMode === 'FUNCTIONAL_HUBS' && (
          <FunctionalWorkflowHub
            onInspectKpi={(key) => setInspectKpiKey(key)}
          />
        )}

        {/* VIEW MODE 3: 3x3 DOMAIN CARDS GRID (LEGACY COMPATIBILITY) */}
        {filters.viewMode === 'DOMAIN_GRID' && (
          <div className="space-y-6">
            <DomainCardsGrid
              cards={legacyData.cards}
              selectedId={selectedCardId}
              onSelectCard={(id) => setSelectedCardId((prev) => (prev === id ? null : id))}
            />

            {selectedLegacyCard && (
              <section id="analytics-workspace" className="pt-2">
                <ExpandedAnalyticsPanel
                  card={selectedLegacyCard}
                  allMembers={legacyData.members}
                  onClose={() => setSelectedCardId(null)}
                />
              </section>
            )}
          </div>
        )}
      </main>

      {/* Universal KPI Inspect Drawer (10 Actionable Dimensions) */}
      <KpiInspectDrawer
        data={inspectData}
        isOpen={Boolean(inspectKpiKey)}
        onClose={() => setInspectKpiKey(null)}
      />
    </div>
  );
}
