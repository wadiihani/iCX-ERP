'use client';

import React, { useState } from 'react';
import clsx from 'clsx';
import {
  DomainCardSummary,
  DomainId,
} from '@/lib/dashboard/dashboard-types';
import {
  Table,
  BarChart3,
  ChevronDown,
  ChevronUp,
  X,
  FileSpreadsheet,
  FileText,
  Sparkles,
  HelpCircle,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import {
  SteppedFunnelChart,
  BulletBarChart,
  HeatmapMatrix,
  QuadrantScatterPlot,
  StackedHorizontalBar,
  PaceLineChart,
  FinancialWaterfallChart,
  ParetoBarChart,
  PreArrivalCountdownTimeline,
  BedOccupancyGantt,
  TeamStandardsDotMatrix,
  DivergingNpsBar,
  AlertList,
  AlertItem,
} from './graphs';

interface ExpandedAnalyticsPanelProps {
  card: DomainCardSummary;
  allMembers?: any[];
  onClose?: () => void;
  className?: string;
}

export const ExpandedAnalyticsPanel: React.FC<ExpandedAnalyticsPanelProps> = ({
  card,
  allMembers = [],
  onClose,
  className,
}) => {
  const [showFullScorecardTable, setShowFullScorecardTable] = useState(false);
  const [inspectedDrawerItem, setInspectedDrawerItem] = useState<{
    title: string;
    subtitle?: string;
    meta?: Record<string, any>;
    action?: string;
  } | null>(null);

  // Export report as Markdown/CSV
  const handleExport = (type: 'csv' | 'md') => {
    let content = '';
    const filename = `${card.id}-scorecard-report.${type}`;

    if (type === 'csv') {
      content = 'Code,Name,Formula,Current,Target,Achieved%,RAG,Responsible\n';
      (card.scorecard || []).forEach((item) => {
        content += `"${item.code}","${item.name}","${item.formula}","${item.current}","${item.target}","${item.achievedPct}%","${item.rag}","${item.responsibleRole}"\n`;
      });
    } else {
      content = `# AIESEC in Rabat — Domain Report: ${card.title}\n\n`;
      content += `**Primary MoS**: ${card.primaryMos.value} / ${card.primaryMos.target} (${card.primaryMos.attainmentPct}%)\n`;
      content += `**Status**: ${card.healthLabel} (${card.healthStatus})\n\n`;
      content += `| Code | Metric | Formula | Current | Target | % Achieved | Status | Owner |\n`;
      content += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;
      (card.scorecard || []).forEach((item) => {
        content += `| ${item.code} | ${item.name} | \`${item.formula}\` | ${item.current} | ${item.target} | ${item.achievedPct}% | ${item.rag.toUpperCase()} | ${item.responsibleRole} |\n`;
      });
    }

    const blob = new Blob([content], { type: type === 'csv' ? 'text/csv' : 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Convert card exceptions to AlertList items (AL instrument)
  const alertItems: AlertItem[] = (card.exceptions || []).map((ex) => ({
    id: ex.id,
    item: ex.title,
    owner: ex.owner,
    ageDays: ex.agingDays || ex.daysOverdue,
    actionText: 'Inspect & Fix',
    severity: ex.severity === 'critical' ? 'critical' : 'warning',
    onAction: () => {
      setInspectedDrawerItem({
        title: ex.title,
        subtitle: ex.description,
        meta: {
          Reference: ex.referenceCode,
          Owner: ex.owner,
          'Age Days': `${ex.agingDays || ex.daysOverdue || 0}d idle`,
          Severity: ex.severity.toUpperCase(),
        },
        action: ex.recommendedAction || 'Follow up immediately with responsible owner.',
      });
    },
  }));

  return (
    <div
      className={clsx(
        'rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden transition-all duration-300 text-left',
        className
      )}
    >
      {/* SECTION 5 HEADER: ACTIVE CARD TITLE [Term][Export CSV/Report][Close] */}
      <div className="bg-slate-900 text-white p-5 sm:p-6 border-b border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
              {card.number || card.cardIndex}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase font-bold text-blue-400 tracking-wider">
                  Operational Command Panel
                </span>
                <span
                  className={clsx(
                    'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border',
                    card.healthStatus === 'green'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : card.healthStatus === 'amber'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  )}
                >
                  {card.healthLabel}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/10 text-slate-300">
                  Term: 26.2
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-white mt-1">
                {card.title}
              </h1>
            </div>
          </div>

          {/* Action CTAs: Export & Close */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExport('csv')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs transition-colors border border-white/10 cursor-pointer"
              title="Export complete scorecard as CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => handleExport('md')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs transition-colors border border-white/10 cursor-pointer"
              title="Export complete scorecard as Markdown"
            >
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>Export Report</span>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Collapse analytics workspace"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6 bg-slate-50/50 space-y-6">
        {/* SECTION 5 ORDER 1: ALERTS (AL, max 5, only if any warning/breach exists) */}
        {alertItems.length > 0 && (
          <AlertList
            alerts={alertItems}
            title={`${card.title} Alerts & Bottlenecks`}
            onOpenDrawer={() => {
              if (alertItems[0]) alertItems[0].onAction?.();
            }}
          />
        )}

        {/* SECTION 5 ORDER 2: SCORECARD NT/BU STRIP (All KPIs with Formula Tooltip & Table Toggle) */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Domain Scorecard Overview
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-xl sm:text-2xl font-semibold text-slate-900 tabular-nums">
                  {card.primaryMos.label}: {card.primaryMos.value}
                </span>
                {card.primaryMos.target && (
                  <span className="text-xs text-slate-500 font-normal">
                    / target {card.primaryMos.target}
                  </span>
                )}
                {card.primaryMos.attainmentPct !== undefined && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-sm bg-blue-50 text-blue-700 border border-blue-200">
                    {card.primaryMos.attainmentPct}% Attainment
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowFullScorecardTable((prev) => !prev)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors self-start sm:self-auto cursor-pointer"
            >
              <Table className="w-3.5 h-3.5 text-blue-600" />
              <span>{showFullScorecardTable ? 'Hide Raw Math Table' : 'Show Full KPI Math Table'}</span>
              {showFullScorecardTable ? (
                <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>
          </div>

          {/* Core KPI Headline Tiles (NT) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3">
            {card.headlineKpis.map((kpi, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                  <span className="truncate" title={kpi.label}>{kpi.label}</span>
                  <span title={`Benchmark metric for ${kpi.label}`} className="inline-flex shrink-0">
                    <HelpCircle className="w-3 h-3 text-slate-300" />
                  </span>
                </div>
                <div className="flex items-baseline justify-between gap-1">
                  <span className="text-lg font-semibold text-slate-900 tabular-nums">
                    {kpi.value}
                  </span>
                  {kpi.delta && (
                    <span
                      className={clsx(
                        'text-[10px] font-bold px-1.5 py-0.2 rounded-sm',
                        kpi.delta.direction === 'up'
                          ? 'bg-emerald-50 text-emerald-700'
                          : kpi.delta.direction === 'down'
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-slate-100 text-slate-600'
                      )}
                    >
                      {kpi.delta.direction === 'up' ? '▲' : kpi.delta.direction === 'down' ? '▼' : '—'} {kpi.delta.value}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Expandable Raw Mathematical Table */}
          {showFullScorecardTable && (
            <div className="mt-4 pt-4 border-t border-slate-100 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Code</th>
                    <th className="py-2.5 px-3">Metric Name</th>
                    <th className="py-2.5 px-3">Mathematical Formula</th>
                    <th className="py-2.5 px-2 text-right">Actual</th>
                    <th className="py-2.5 px-2 text-right">Target</th>
                    <th className="py-2.5 px-2 text-right">% Achieved</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {(card.scorecard || []).map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-blue-600">{item.code}</td>
                      <td className="py-2.5 px-3 font-sans font-medium text-slate-900">{item.name}</td>
                      <td className="py-2.5 px-3 text-slate-600 bg-slate-50/60 rounded">{item.formula}</td>
                      <td className="py-2.5 px-2 text-right font-bold text-slate-800">{item.current}</td>
                      <td className="py-2.5 px-2 text-right text-slate-500">{item.target}</td>
                      <td className="py-2.5 px-2 text-right font-bold">
                        <span
                          className={clsx(
                            'px-1.5 py-0.5 rounded text-[10px]',
                            item.rag === 'green'
                              ? 'bg-emerald-50 text-emerald-700'
                              : item.rag === 'amber'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-rose-50 text-rose-700'
                          )}
                        >
                          {item.achievedPct}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={clsx(
                            'inline-block w-2.5 h-2.5 rounded-full',
                            item.rag === 'green' ? 'bg-emerald-500' : item.rag === 'amber' ? 'bg-amber-400' : 'bg-rose-500'
                          )}
                        />
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-600">{item.responsibleRole}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* SECTION 5 ORDER 3: EXPANDED 2X2 GRAPHS (Minimalist, Question-Titled, Max 4) */}
        <div>
          {renderDomainGraphs(card, allMembers, (item) => setInspectedDrawerItem(item))}
        </div>
      </div>

      {/* Actionable Exceptions / Drill-down Modal Drawer */}
      {inspectedDrawerItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150 text-left">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Record Drill-Down
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {inspectedDrawerItem.title}
                </h3>
                {inspectedDrawerItem.subtitle && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    {inspectedDrawerItem.subtitle}
                  </p>
                )}
              </div>
              <button
                onClick={() => setInspectedDrawerItem(null)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {inspectedDrawerItem.meta && (
              <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                {Object.entries(inspectedDrawerItem.meta).map(([key, val]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-slate-400">{key}:</span>
                    <span className="font-semibold text-slate-800">{String(val)}</span>
                  </div>
                ))}
              </div>
            )}

            {inspectedDrawerItem.action && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900">
                <h5 className="font-bold flex items-center gap-1.5 text-blue-950">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Recommended Action
                </h5>
                <p className="mt-1 text-blue-800">{inspectedDrawerItem.action}</p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setInspectedDrawerItem(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// =========================================================================
// RENDER DOMAIN GRAPHS (Exactly 2 to 4 question-titled instruments per card)
// =========================================================================
function renderDomainGraphs(
  card: DomainCardSummary,
  members: any[],
  onOpenDrawer: (item: any) => void
) {
  switch (card.id) {
    case 'funnel': {
      // CARD 1: Core ICX Exchange Funnel & Process Velocity
      const funnelStages = [
        { id: 'app', label: 'APP (Applied)', count: 138, target: 150, color: 'bg-blue-600', slaDays: 1.2 },
        { id: 'shortlisted', label: 'Shortlisted', count: 62, target: 70, color: 'bg-blue-600', slaDays: 2.1 },
        { id: 'acc', label: 'ACC (Accepted)', count: 48, target: 55, color: 'bg-blue-600', slaDays: 4.2 },
        { id: 'apd', label: 'APD (Approved)', count: 31, target: 40, color: 'bg-blue-600', slaDays: 6.8 },
        { id: 're', label: 'RE (Realized)', count: 24, target: 35, color: 'bg-emerald-600', slaDays: 14.0 },
        { id: 'fin', label: 'FIN (Finished)', count: 22, target: 30, color: 'bg-emerald-600', slaDays: 42.0 },
        { id: 'co', label: 'CO (Complete)', count: 21, target: 28, color: 'bg-emerald-600', slaDays: 45.0 },
      ];

      const bulletSlas = [
        { id: 'sla_contact', label: 'APP → Contact (SLA: ≤24h)', actual: 18.0, target: 24.0, unit: 'h', higherIsBetter: false },
        { id: 'sla_acc', label: 'Contact → ACC (SLA: ≤3d)', actual: 2.6, target: 3.0, unit: 'd', higherIsBetter: false },
        { id: 'sla_apd', label: 'ACC → APD (SLA: ≤2d)', actual: 1.8, target: 2.0, unit: 'd', higherIsBetter: false },
        { id: 'sla_total', label: 'Total APP → APD (SLA: ≤5d)', actual: 4.2, target: 5.0, unit: 'd', higherIsBetter: false },
      ];

      const paceData = [
        { week: 'W1', actual: 1, target: 2 },
        { week: 'W2', actual: 3, target: 4 },
        { week: 'W4', actual: 7, target: 8 },
        { week: 'W6', actual: 12, target: 14 },
        { week: 'W8', actual: 18, target: 20 },
        { week: 'W10', actual: 24, target: 26 },
        { week: 'W12', actual: undefined, target: 31 },
        { week: 'W16', actual: undefined, target: 35 },
      ];

      const lostReasons = [
        { reason: 'Unresponsive to initial contact (>48h)', count: 34 },
        { reason: 'Financial / flight cost objection', count: 22 },
        { reason: 'Parental refusal / security hesitation', count: 14 },
        { reason: 'Visa timeline / embassy document delay', count: 9 },
        { reason: 'Language requirement mismatch (French/English)', count: 6 },
        { reason: 'Found alternative internship elsewhere', count: 4 },
      ];

      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Graph 1.1: FU */}
          <SteppedFunnelChart
            stages={funnelStages}
            title="Where do we lose EPs?"
            subtitle="7-stage funnel with CR% bridges; lowest badge indicates primary leakage"
          />
          {/* Graph 1.2: BU */}
          <BulletBarChart
            metrics={bulletSlas}
            title="Are we within SLA?"
            subtitle="Average days vs SLA threshold tick; bar turning red signals a slow handoff"
          />
          {/* Graph 1.3: SC */}
          <PaceLineChart
            data={paceData}
            title="Ahead or behind pace?"
            subtitle="Cumulative realizations (solid) vs semester plan (dashed); gap labeled at current week"
            unit="RE"
          />
          {/* Graph 1.4: PA */}
          <ParetoBarChart
            items={lostReasons}
            title="Why do EPs leave?"
            subtitle="Root causes ranked desc; 80% reference line reveals the vital few"
            onSelectReason={(reason) =>
              onOpenDrawer({
                title: `Drop-off Root Cause: ${reason}`,
                subtitle: 'Filtered EP dossier list',
                action: 'Refine interview communication and pre-screening scripts.',
              })
            }
          />
        </div>
      );
    }

    case 'b2b': {
      // CARD 2: B2B CRM & Sales Pipeline
      const pipelineFunnel = [
        { id: 'leads', label: 'Sourced (MQLs)', count: 68, target: 80, color: 'bg-blue-600' },
        { id: 'contacted', label: 'Contacted', count: 42, target: 50, color: 'bg-blue-600' },
        { id: 'meeting', label: 'Discovery Held', count: 26, target: 30, color: 'bg-blue-600' },
        { id: 'proposal', label: 'Proposal Sent', count: 18, target: 22, color: 'bg-blue-600' },
        { id: 'negotiation', label: 'In Negotiation', count: 16, target: 20, color: 'bg-blue-600' },
        { id: 'signed', label: 'Signed Contracts', count: 14, target: 18, color: 'bg-emerald-600' },
      ];

      const sectorBreakdown = [
        {
          id: 'sectors',
          title: 'Partner Concentration by Sector',
          subtitle: 'Share of signed enterprise and NGO partners in Rabat',
          segments: [
            { id: 'ngo', label: 'NGOs & Non-Profits', value: 7, color: 'bg-blue-600' },
            { id: 'edu', label: 'Private Schools & Academies', value: 4, color: 'bg-blue-500' },
            { id: 'tech', label: 'Startups & Scaleups', value: 2, color: 'bg-emerald-500' },
            { id: 'corp', label: 'Corporates', value: 1, color: 'bg-slate-400' },
          ],
        },
      ];

      const repPoints = [
        { id: '1', name: 'Rayen J.', x: 88, y: 84, tooltipText: 'Role Model (High activity, high signed)' },
        { id: '2', name: 'Firdawsse J.', x: 82, y: 80, tooltipText: 'Role Model (High activity, high signed)' },
        { id: '3', name: 'Salma S.', x: 74, y: 35, tooltipText: 'Needs Skill Coaching (High outreach, low closing)' },
        { id: '4', name: 'Youssef B.', x: 30, y: 65, tooltipText: 'Lone Wolf (Low outreach, good closing)' },
        { id: '5', name: 'Kenza A.', x: 22, y: 15, tooltipText: 'Low Activity & Low Conversion (Intervention needed)' },
      ];

      const agingCols = [
        { id: 'b1', label: '0–7 Days (Active)', shortLabel: '0–7d' },
        { id: 'b2', label: '8–14 Days (Aging)', shortLabel: '8–14d' },
        { id: 'b3', label: '>14 Days (Stale)', shortLabel: '>14d' },
      ];

      const agingRows = [
        {
          id: 'prop',
          label: 'Proposal Sent Stage',
          cells: [
            { colId: 'b1', value: 8, label: '8 Deals' },
            { colId: 'b2', value: 3, label: '3 Deals', hasWarning: true },
            { colId: 'b3', value: 2, label: '2 Deals', hasWarning: true },
          ],
        },
        {
          id: 'nego',
          label: 'Contract Negotiation',
          cells: [
            { colId: 'b1', value: 10, label: '10 Deals' },
            { colId: 'b2', value: 2, label: '2 Deals' },
            { colId: 'b3', value: 1, label: '1 Deal', hasWarning: true },
          ],
        },
      ];

      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Graph 2.1: FU */}
          <SteppedFunnelChart
            stages={pipelineFunnel}
            title="Where do deals die?"
            subtitle="7 CRM pipeline stages; secondary text highlights weighted MAD at each step"
          />
          {/* Graph 2.2: SB */}
          <StackedHorizontalBar
            rows={sectorBreakdown}
            title="Are we over-reliant on one sector?"
            subtitle="NGOs vs Schools vs Startups vs Corporates; ensures diversification"
          />
          {/* Graph 2.3: QD */}
          <QuadrantScatterPlot
            points={repPoints}
            xAxisLabel="Outreach Logged (Calls + Emails + Visits)"
            yAxisLabel="Discovery Meetings & Contracts Closed"
            title="Activity or skill problem?"
            subtitle="Low X = activity problem; High X + Low Y = skill/coaching problem"
            quadrantLabels={{
              topRight: '🟢 Role Models (Scale)',
              topLeft: '🟡 Lone Wolves (Increase Outreach)',
              bottomRight: '🔵 Coach Skills (High Effort)',
              bottomLeft: '🔴 Intervene (Low Activity & Results)',
            }}
          />
          {/* Graph 2.4: HM */}
          <HeatmapMatrix
            columns={agingCols}
            rows={agingRows}
            title="Where are deals stuck?"
            subtitle="Deal aging across stages; red cells mark stale deals exceeding 14 days"
          />
        </div>
      );
    }

    case 'opps': {
      // CARD 3: Opportunity Capacity & Slot Portfolio
      const slotRows = [
        {
          id: 'gc',
          title: 'Global Classroom — Smart Kids Rabat (SDG 4)',
          subtitle: 'Starts in 18 days (2026-11-15)',
          segments: [
            { id: 'filled', label: 'Approved (APD/RE)', value: 8, color: 'bg-emerald-600' },
            { id: 'acc', label: 'Accepted (Pending)', value: 2, color: 'bg-blue-500' },
            { id: 'int', label: 'In Interview', value: 1, color: 'bg-amber-400' },
            { id: 'empty', label: 'Empty Slots', value: 3, color: 'bg-slate-300' },
          ],
        },
        {
          id: 'su',
          title: 'Skill Up! — Youth Center Salé (SDG 8)',
          subtitle: 'Starts in 25 days (2026-11-22)',
          segments: [
            { id: 'filled', label: 'Approved (APD/RE)', value: 6, color: 'bg-emerald-600' },
            { id: 'acc', label: 'Accepted (Pending)', value: 1, color: 'bg-blue-500' },
            { id: 'int', label: 'In Interview', value: 1, color: 'bg-amber-400' },
            { id: 'empty', label: 'Empty Slots', value: 2, color: 'bg-slate-300' },
          ],
        },
        {
          id: 'gl',
          title: 'Green Leaders — Eco Rabat (SDG 13)',
          subtitle: 'Starts in 32 days (2026-11-29)',
          segments: [
            { id: 'filled', label: 'Approved (APD/RE)', value: 5, color: 'bg-emerald-600' },
            { id: 'acc', label: 'Accepted (Pending)', value: 2, color: 'bg-blue-500' },
            { id: 'int', label: 'In Interview', value: 0, color: 'bg-amber-400' },
            { id: 'empty', label: 'Empty Slots', value: 1, color: 'bg-slate-300' },
          ],
        },
      ];

      const portfolioItems = [
        { reason: 'SDG 4: Quality Education (Global Classroom / Skill Up!)', count: 18 },
        { reason: 'SDG 8: Decent Work & Economic Growth (Scale Up!)', count: 12 },
        { reason: 'SDG 13: Climate Action (Green Leaders)', count: 8 },
        { reason: 'iGTa Corporate Short (6–12 weeks)', count: 6 },
        { reason: 'iGTe Teaching Long (6–18 months)', count: 4 },
      ];

      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Graph 3.1: SB */}
          <StackedHorizontalBar
            rows={slotRows}
            title="Which project has empty slots?"
            subtitle="Rows sorted by start date asc; empty gray segment on a near date needs urgent promotion"
          />
          {/* Graph 3.2: Sorted horizontal bar / PA */}
          <ParetoBarChart
            items={portfolioItems}
            title="Is the portfolio balanced?"
            subtitle="Slot volume across official SDG projects and talent exchange durations"
          />
        </div>
      );
    }

    case 'ir': {
      // CARD 4: IR Supply & Country Partnerships
      const partnerPoints = [
        { id: '1', name: 'AIESEC Bardo/Carthage (TN)', x: 92, y: 88, tooltipText: 'Stars (Tier 1 Strategic): 90d Visa-Free, High APP + High CR%' },
        { id: '2', name: 'AIESEC Cairo (EG)', x: 86, y: 78, tooltipText: 'Stars (Tier 1 Strategic): High Volume, High CR%' },
        { id: '3', name: 'AIESEC Istanbul (TR)', x: 74, y: 42, tooltipText: 'Filter Needed: High APP volume but low CR% (Tighten screening)' },
        { id: '4', name: 'AIESEC Madrid (ES)', x: 35, y: 85, tooltipText: 'Hidden Gems: Low APP volume but very high CR% (Joint info-sessions)' },
        { id: '5', name: 'AIESEC Berlin (DE)', x: 28, y: 32, tooltipText: 'Review MOU: Low volume and low conversion' },
      ];

      const partnerQuotaBullets = [
        { id: 'tn', label: 'AIESEC Tunisia (Quota: 12 APD)', actual: 11, target: 12, unit: ' APD' },
        { id: 'eg', label: 'AIESEC Egypt (Quota: 10 APD)', actual: 8, target: 10, unit: ' APD' },
        { id: 'tr', label: 'AIESEC Turkey (Quota: 8 APD)', actual: 4, target: 8, unit: ' APD' },
        { id: 'es', label: 'AIESEC Spain (Quota: 5 APD)', actual: 5, target: 5, unit: ' APD' },
      ];

      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Graph 4.1: QD */}
          <QuadrantScatterPlot
            points={partnerPoints}
            xAxisLabel="Applications Sent (APP Volume)"
            yAxisLabel="APP → APD Conversion Rate (%)"
            title="Which partners do we scale or filter?"
            subtitle="Top-right = Scale slots; Bottom-right = Tighten pre-screening; Top-left = Run info-sessions"
            quadrantLabels={{
              topRight: '🟢 Stars / Tier 1 (Scale Slots)',
              topLeft: '🟡 Hidden Gems (Run Info-Sessions)',
              bottomRight: '🔵 Tighten Screening (Low Conversion)',
              bottomLeft: '🔴 Review Partnership MOU',
            }}
          />
          {/* Graph 4.2: BU grouped */}
          <BulletBarChart
            metrics={partnerQuotaBullets}
            title="Did partners deliver what they promised?"
            subtitle="Committed joint APD quota tick vs actual delivered approvals per partner LC"
          />
        </div>
      );
    }

    case 'visa': {
      // CARD 5: Pre-Arrival, Visa Regimes & Rabat 14-Day Lock
      const countdownRows = [
        {
          epId: 'ep_1',
          epName: 'Omar Benali',
          country: 'Tunisia',
          daysToArrival: 4,
          lockChecklist: {
            visaIssued: true,
            bedAssigned: true,
            ticketUploaded: true,
            pickupAssigned: true,
            opConfirmed: true,
          },
        },
        {
          epId: 'ep_2',
          epName: 'Amina Mansour',
          country: 'Egypt',
          daysToArrival: 11,
          lockChecklist: {
            visaIssued: true,
            bedAssigned: false, // Breach
            ticketUploaded: true,
            pickupAssigned: true,
            opConfirmed: true,
          },
        },
        {
          epId: 'ep_3',
          epName: 'Zeynep Kaya',
          country: 'Turkey',
          daysToArrival: 22,
          lockChecklist: {
            visaIssued: false,
            bedAssigned: true,
            ticketUploaded: false,
            pickupAssigned: false,
            opConfirmed: true,
          },
        },
        {
          epId: 'ep_4',
          epName: 'Carlos Silva',
          country: 'Spain',
          daysToArrival: 28,
          lockChecklist: {
            visaIssued: true,
            bedAssigned: true,
            ticketUploaded: true,
            pickupAssigned: false,
            opConfirmed: true,
          },
        },
      ];

      const visaRegimes = [
        {
          id: 'v_free',
          title: 'Regime 1: 90-Day Visa-Free (Tunisia, Turkey, Senegal)',
          subtitle: 'No consular visa required; passport verification only',
          segments: [
            { id: 'appr', label: 'Verified & Approved', value: 16, color: 'bg-emerald-600' },
            { id: 'sub', label: 'Docs In Review', value: 2, color: 'bg-blue-500' },
            { id: 'pend', label: 'Docs Pending', value: 1, color: 'bg-slate-300' },
          ],
        },
        {
          id: 'v_evisa',
          title: 'Regime 2: AEVM 24–72h e-Visa (Egypt, India, Jordan)',
          subtitle: 'Online portal application; 14-day host invitation SLA',
          segments: [
            { id: 'appr', label: 'Issued / Approved', value: 9, color: 'bg-emerald-600' },
            { id: 'sub', label: 'Portal Submitted', value: 3, color: 'bg-blue-500' },
            { id: 'pend', label: 'Host Pack Pending', value: 1, color: 'bg-amber-400' },
          ],
        },
        {
          id: 'v_consular',
          title: 'Regime 3: Consular Embassy Visa',
          subtitle: 'Physical consular appointment required',
          segments: [
            { id: 'appr', label: 'Sticker Granted', value: 4, color: 'bg-emerald-600' },
            { id: 'sub', label: 'Interview Scheduled', value: 2, color: 'bg-blue-500' },
            { id: 'rej', label: 'Denied / Incomplete', value: 1, color: 'bg-rose-500' },
          ],
        },
      ];

      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Graph 5.1: GT countdown */}
          <PreArrivalCountdownTimeline
            rows={countdownRows}
            title="Who is at risk before arrival?"
            subtitle="Rows sorted by arrival date; red alert triggered if arrival ≤14d and any lock item missing"
            onSelectEp={(id) =>
              onOpenDrawer({
                title: `EP Arrival Readiness Dossier: ${id}`,
                subtitle: '5-point lock checklist inspection',
                action: 'Contact host accommodation lead or EP to fulfill remaining lock items.',
              })
            }
          />
          {/* Graph 5.2: SB */}
          <StackedHorizontalBar
            rows={visaRegimes}
            title="Where is each visa stuck?"
            subtitle="Distribution of approved EPs across Morocco's 3 visa regimes"
          />
        </div>
      );
    }

    case 'cxp': {
      // CARD 6: CXP, 18 Standards & Case Solving
      const standardsCols = Array.from({ length: 18 }).map((_, i) => ({
        id: `s${i + 1}`,
        label: i < 13 ? `Mandatory #${i + 1}` : `Non-Mandatory #${i + 1}`,
        shortLabel: `#${i + 1}${i < 13 ? '*' : ''}`,
      }));

      const standardsRows = [
        {
          id: 'igv',
          label: 'iGV Global Volunteer (16 EPs)',
          sublabel: 'Rabat Sem 2 Peak',
          summaryValue: '94%',
          summaryLabel: 'Standards Pass',
          cells: Array.from({ length: 18 }).map((_, i) => ({
            colId: `s${i + 1}`,
            value: i === 6 ? 68 : i === 9 ? 84 : 100, // S7 accommodation warning, S10a JD alignment
            label: i === 6 ? '68%' : i === 9 ? '84%' : '100%',
            hasWarning: i === 6 || i === 9,
          })),
        },
        {
          id: 'igt',
          label: 'iGTa / iGTe Talent (8 EPs)',
          sublabel: 'Internship Cohort',
          summaryValue: '100%',
          summaryLabel: 'Standards Pass',
          cells: Array.from({ length: 18 }).map((_, i) => ({
            colId: `s${i + 1}`,
            value: 100,
            label: '100%',
          })),
        },
      ];

      const surveyFunnel = [
        { id: 're', label: 'Realized EPs', count: 24, target: 24, color: 'bg-blue-600' },
        { id: 'mid', label: 'Middle Survey Completed (#1–#10a)', count: 23, target: 24, color: 'bg-blue-600' },
        { id: 'res', label: 'Middle Issues Resolved', count: 23, target: 23, color: 'bg-blue-600' },
        { id: 'fin', label: 'Finished EPs (FIN)', count: 22, target: 24, color: 'bg-emerald-600' },
        { id: 'fsurv', label: 'Final Survey Completed (#10b–#18)', count: 22, target: 22, color: 'bg-emerald-600' },
        { id: 'co', label: 'Qualified Complete (CO)', count: 21, target: 22, color: 'bg-emerald-600' },
      ];

      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Graph 6.1: HM */}
            <HeatmapMatrix
              columns={standardsCols}
              rows={standardsRows}
              title="Which standard is failing?"
              subtitle="18 Exchange Standards (* indicates 13 Mandatory); single failing cell shows exact bottleneck"
            />
            {/* Graph 6.2: FU */}
            <SteppedFunnelChart
              stages={surveyFunnel}
              title="Where do EPs fall out of the survey chain?"
              subtitle="Progression from Realization to Middle Survey, Final Survey, and Qualified Completion"
            />
          </div>
          {/* Graph 6.3: Diverging Bar */}
          <DivergingNpsBar
            title="How satisfied are participants? (EP NPS)"
            subtitle="EP Net Promoter Score calculated directly from EXPA survey responses"
            npsScore={62}
            target={50}
            promotersPct={74}
            passivesPct={14}
            detractorsPct={12}
            totalResponses={22}
          />
        </div>
      );
    }

    case 'housing': {
      // CARD 7: Accommodation & Arrival Pickup
      const bedRows = [
        {
          bedId: 'b_1',
          flat: 'Villa Agdal — Flat A',
          room: 'Master Bedroom (Bed 1)',
          neighborhood: 'Agdal',
          weeks: [
            { weekNumber: 1, isOccupied: true, epInitials: 'OB' },
            { weekNumber: 2, isOccupied: true, epInitials: 'OB' },
            { weekNumber: 3, isOccupied: true, epInitials: 'OB' },
            { weekNumber: 4, isOccupied: true, epInitials: 'OB' },
            { weekNumber: 5, isOccupied: true, epInitials: 'OB' },
            { weekNumber: 6, isOccupied: true, epInitials: 'OB' },
            { weekNumber: 7, isOccupied: false },
            { weekNumber: 8, isOccupied: false },
          ],
        },
        {
          bedId: 'b_2',
          flat: 'Villa Agdal — Flat A',
          room: 'Twin Room (Bed 2)',
          neighborhood: 'Agdal',
          weeks: [
            { weekNumber: 1, isOccupied: true, epInitials: 'AM' },
            { weekNumber: 2, isOccupied: true, epInitials: 'AM' },
            { weekNumber: 3, isOccupied: true, epInitials: 'AM' },
            { weekNumber: 4, isOccupied: true, epInitials: 'AM' },
            { weekNumber: 5, isOccupied: true, epInitials: 'AM' },
            { weekNumber: 6, isOccupied: true, epInitials: 'AM' },
            { weekNumber: 7, isOccupied: true, epInitials: 'ZK' },
            { weekNumber: 8, isOccupied: true, epInitials: 'ZK' },
          ],
        },
        {
          bedId: 'b_3',
          flat: 'Apartment Hassan — Flat B',
          room: 'Room 1 (Bed 1)',
          neighborhood: 'Hassan',
          weeks: [
            { weekNumber: 1, isOccupied: false },
            { weekNumber: 2, isOccupied: false },
            { weekNumber: 3, isOccupied: true, epInitials: 'CS' },
            { weekNumber: 4, isOccupied: true, epInitials: 'CS' },
            { weekNumber: 5, isOccupied: true, epInitials: 'CS' },
            { weekNumber: 6, isOccupied: true, epInitials: 'CS' },
            { weekNumber: 7, isOccupied: true, epInitials: 'CS' },
            { weekNumber: 8, isOccupied: true, epInitials: 'CS' },
          ],
        },
      ];

      const propertyScatter = [
        { id: '1', name: 'Villa Agdal Flat A', x: 1150, y: 92, tooltipText: 'Great Value: 1,150 MAD / Bed, 92% EP Satisfaction' },
        { id: '2', name: 'Apartment Hassan B', x: 1050, y: 88, tooltipText: 'Good Value: 1,050 MAD / Bed, 88% EP Satisfaction' },
        { id: '3', name: 'Residence Salé Marina', x: 1450, y: 64, tooltipText: 'Drop Next Peak: Expensive (1,450 MAD) & Low Rating (64%)' },
        { id: '4', name: 'Hay Riad Villa C', x: 1200, y: 96, tooltipText: 'Top Performer: 1,200 MAD / Bed, 96% EP Satisfaction' },
      ];

      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Graph 7.1: GT */}
          <BedOccupancyGantt
            beds={bedRows}
            title="Where are beds empty or overlapping?"
            subtitle="Bed occupancy timeline across semester weeks; hatched gaps show unutilized lease cost"
            onSelectBed={(id) =>
              onOpenDrawer({
                title: `Accommodation Flat Lease: ${id}`,
                subtitle: 'Vetted readiness & lease inventory inspection',
                action: 'Audit Standard #7 physical 4-point verification before check-in.',
              })
            }
          />
          {/* Graph 7.2: QD / Scatter */}
          <QuadrantScatterPlot
            points={propertyScatter}
            xAxisLabel="Cost per Bed / Month (MAD)"
            yAxisLabel="EP Accommodation Satisfaction Score (%)"
            title="Which property costs too much for its rating?"
            subtitle="Top-left expensive & low-rated properties should be renegotiated or terminated"
            quadrantLabels={{
              topRight: '🟢 High Quality (Fair Price)',
              topLeft: '🔴 Expensive & Low Rating (Drop Landlord)',
              bottomRight: '🟡 Budget Options (Upgrade)',
              bottomLeft: '🔵 High Value / Cost-Effective',
            }}
          />
        </div>
      );
    }

    case 'finance': {
      // CARD 8: AFPM Finance & Exchange Sustainability
      const waterfallSteps = [
        { id: 'partner_fees', label: '+ B2B Partner Contracts', amount: 54000, type: 'inflow' as const },
        { id: 'ep_fees', label: '+ EP Housing & Welcome Fees', amount: 24000, type: 'inflow' as const },
        { id: 'csr_grants', label: '+ NGO / CSR Grants', amount: 6000, type: 'inflow' as const },
        { id: 'bed_rent', label: '- Landlord Rent & Utilities', amount: -27600, type: 'outflow' as const, note: 'Vetted villas lease' },
        { id: 'pickup_exp', label: '- Airport Pickup & Welcome Packs', amount: -6500, type: 'outflow' as const, note: 'Standard #6 transit' },
        { id: 'b2b_costs', label: '- Partner Servicing & Sales', amount: -8200, type: 'outflow' as const },
        { id: 'mc_dues', label: '- MC Morocco Royalties & Affiliation', amount: -12500, type: 'outflow' as const },
        { id: 'net_surplus', label: '= Net Exchange Surplus (MAD)', amount: 29200, type: 'total' as const, note: 'Retained Reserve' },
      ];

      const arAgingRows = [
        {
          id: 'ar_aging',
          title: 'Accounts Receivable Aging Distribution',
          subtitle: 'Collection status across active partner invoices',
          segments: [
            { id: 'current', label: 'Current (≤ Due Date)', value: 48000, color: 'bg-emerald-600' },
            { id: 'w1', label: '1–7 Days Overdue', value: 12000, color: 'bg-blue-500' },
            { id: 'w2', label: '8–14 Days Overdue', value: 6500, color: 'bg-amber-400' },
            { id: 'w3', label: '>14 Days (Penalty & Freeze)', value: 4500, color: 'bg-rose-500' },
          ],
        },
      ];

      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Graph 8.1: WF */}
          <FinancialWaterfallChart
            steps={waterfallSteps}
            sustainabilityRatio={1.32}
            title="Where does money come in and go out?"
            subtitle="Direct exchange inflows down through operational costs to net operating surplus (MAD)"
          />
          {/* Graph 8.2: SB */}
          <StackedHorizontalBar
            rows={arAgingRows}
            title="Who owes us money and for how long?"
            subtitle="AR aging buckets in MAD; red segment (>14d) triggers delivery freeze"
          />
        </div>
      );
    }

    case 'members': {
      // CARD 9: Member Engagement, TeSt & People Analytics
      const tierRows = [
        {
          id: 'ext_eng',
          title: 'External Rabat Engine (BD, Sales & Partner PRM)',
          subtitle: '9 active team members',
          segments: [
            { id: 't1', label: 'Tier 1 Core (90–100%)', value: 5, color: 'bg-emerald-600' },
            { id: 't2', label: 'Tier 2 Strong (70–89%)', value: 2, color: 'bg-blue-600' },
            { id: 't3', label: 'Tier 3 Moderate (20–69%)', value: 1, color: 'bg-amber-400' },
            { id: 't4', label: 'Tier 4 Drop-Off (<20%)', value: 1, color: 'bg-rose-500' },
          ],
        },
        {
          id: 'int_eng',
          title: 'Internal Rabat Engine (Ops, IR, Quality, Visa/Logistics)',
          subtitle: '13 active team members',
          segments: [
            { id: 't1', label: 'Tier 1 Core (90–100%)', value: 8, color: 'bg-emerald-600' },
            { id: 't2', label: 'Tier 2 Strong (70–89%)', value: 3, color: 'bg-blue-600' },
            { id: 't3', label: 'Tier 3 Moderate (20–69%)', value: 2, color: 'bg-amber-400' },
            { id: 't4', label: 'Tier 4 Drop-Off (<20%)', value: 0, color: 'bg-rose-500' },
          ],
        },
      ];

      // Privacy note: use initials per spec section 3
      const memberPoints = [
        { id: '1', name: 'R.J.', x: 96, y: 92, tooltipText: 'Rayen J. (Tier 1 Core): Promoted / Role Model' },
        { id: '2', name: 'F.J.', x: 94, y: 90, tooltipText: 'Firdawsse J. (Tier 1 Core): Role Model' },
        { id: '3', name: 'A.M.', x: 88, y: 85, tooltipText: 'Abdenasser M. (Tier 2 Strong): Consistent' },
        { id: '4', name: 'N.E.', x: 82, y: 88, tooltipText: 'Nourdine E. (Tier 2 Strong): Consistent' },
        { id: '5', name: 'M.E.', x: 74, y: 72, tooltipText: 'Mohamed E. (Tier 2 Strong): Ready for stretch' },
        { id: '6', name: 'S.S.', x: 86, y: 45, tooltipText: 'Salma S. (High effort, low sales results): Coach Skills' },
        { id: '7', name: 'Y.B.', x: 42, y: 82, tooltipText: 'Youssef B. (Lone Wolf: Low attendance, good results): Motivate' },
        { id: '8', name: 'K.A.', x: 18, y: 15, tooltipText: 'Kenza A. (Tier 4 Drop-off): Schedule O2O this week' },
      ];

      const dotMatrixElements = [
        { id: '1', name: '1.1 Team Plan & Goal Quotas', stage: 'Building' as const, scores: { mmExternal: 100, mmInternal: 100, tlIr: 100, tlBd: 100 } },
        { id: '2', name: '1.2 Signed JD & PDP Creation', stage: 'Building' as const, scores: { mmExternal: 100, mmInternal: 95, tlIr: 95, tlBd: 100 } },
        { id: '3', name: '2.1 Weekly Team Meetings', stage: 'Performing' as const, scores: { mmExternal: 100, mmInternal: 100, tlIr: 90, tlBd: 92 } },
        { id: '4', name: '2.2 Individual KPI Tracking', stage: 'Performing' as const, scores: { mmExternal: 95, mmInternal: 90, tlIr: 85, tlBd: 88 } },
        { id: '5', name: '2.3 Monthly One-to-Ones (O2O)', stage: 'Performing' as const, scores: { mmExternal: 92, mmInternal: 94, tlIr: 88, tlBd: 90 } },
        { id: '6', name: '2.4 Recognition & Rewards', stage: 'Performing' as const, scores: { mmExternal: 90, mmInternal: 85, tlIr: 80, tlBd: 82 } },
        { id: '7', name: '2.5 Team Feedback Spaces', stage: 'Performing' as const, scores: { mmExternal: 85, mmInternal: 80, tlIr: 75, tlBd: 78 } },
        { id: '8', name: '3.1 Team Debrief & Performance', stage: 'Closing' as const, scores: { mmExternal: 85, mmInternal: 82, tlIr: 80, tlBd: 80 } },
        { id: '9', name: '3.2 ERP Relationship Handover', stage: 'Closing' as const, scores: { mmExternal: 95, mmInternal: 92, tlIr: 90, tlBd: 90 } },
      ];

      const weekCols = Array.from({ length: 16 }).map((_, i) => ({
        id: `w${i + 1}`,
        label: `Week ${i + 1}`,
        shortLabel: `W${i + 1}`,
      }));

      // Sorted with lowest engagement first per spec rule
      const attendanceGridRows = [
        {
          id: 'kenza',
          label: 'K.A. (At-Risk Drop-off)',
          sublabel: 'TM Logistics — Tier 4',
          summaryValue: '18%',
          summaryLabel: 'Critical',
          cells: Array.from({ length: 16 }).map((_, i) => ({
            colId: `w${i + 1}`,
            value: i < 3 ? 40 : 0,
            hasWarning: i >= 3,
          })),
        },
        {
          id: 'salma',
          label: 'S.S. (Partial Engagement)',
          sublabel: 'TM Sales — Tier 3',
          summaryValue: '58%',
          summaryLabel: 'Moderate',
          cells: Array.from({ length: 16 }).map((_, i) => ({
            colId: `w${i + 1}`,
            value: i % 3 === 0 ? 30 : 75,
            hasStar: i === 3 || i === 7,
          })),
        },
        {
          id: 'abdenasser',
          label: 'A.M. (Consistent Contributor)',
          sublabel: 'TL IR — Tier 2 Strong',
          summaryValue: '88%',
          summaryLabel: 'Strong',
          cells: Array.from({ length: 16 }).map((_, i) => ({
            colId: `w${i + 1}`,
            value: i === 4 ? 70 : 100,
            hasStar: i === 3 || i === 7 || i === 11,
          })),
        },
        {
          id: 'firdawsse',
          label: 'F.J. (MM Internal Ops)',
          sublabel: 'Tier 1 Core',
          summaryValue: '96%',
          summaryLabel: 'Core',
          cells: Array.from({ length: 16 }).map((_, i) => ({
            colId: `w${i + 1}`,
            value: 100,
            hasStar: i === 3 || i === 7 || i === 11 || i === 15,
          })),
        },
        {
          id: 'rayen',
          label: 'R.J. (MM External BD)',
          sublabel: 'Tier 1 Core',
          summaryValue: '100%',
          summaryLabel: 'Core',
          cells: Array.from({ length: 16 }).map((_, i) => ({
            colId: `w${i + 1}`,
            value: 100,
            hasStar: i === 3 || i === 7 || i === 11 || i === 15,
          })),
        },
      ];

      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Graph 9.1: SB */}
            <StackedHorizontalBar
              rows={tierRows}
              title="How engaged is each team and why do people drop?"
              subtitle="4 Engagement Tiers; late joiners (>15m) account for 82% of Tier 4 drop-offs"
            />
            {/* Graph 9.2: QD */}
            <QuadrantScatterPlot
              points={memberPoints}
              xAxisLabel="Attendance & Routine Engagement Rate (%)"
              yAxisLabel="Personal KPI Attainment (%)"
              title="Who do we coach, recognize, or re-engage?"
              subtitle="Bottom-left needs O2O this week; Bottom-right needs skills training; Top-right recognize"
              quadrantLabels={{
                topRight: '🟢 Role Models (Recognize & Stretch)',
                topLeft: '🟡 Lone Wolves (Re-engage Culture)',
                bottomRight: '🔵 Coach Skills (High Effort)',
                bottomLeft: '🔴 O2O Intervention This Week',
              }}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Graph 9.3: Dot matrix (replaces radar!) */}
            <TeamStandardsDotMatrix
              elements={dotMatrixElements}
              title="Which team skips which standard?"
              subtitle="Dot matrix replaces radar polygons; exact numeric compliance per team leader"
            />
            {/* Graph 9.4: HM */}
            <HeatmapMatrix
              columns={weekCols}
              rows={attendanceGridRows}
              title="Who is attending, who is fading?"
              subtitle="Sorted lowest engagement first; red streaks trigger proactive retention outreach"
            />
          </div>
        </div>
      );
    }

    default:
      return null;
  }
}
