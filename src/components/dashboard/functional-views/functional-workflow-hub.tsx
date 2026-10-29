'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import {
  Briefcase,
  Globe2,
  Users,
  ShieldCheck,
  Coins,
  Award,
  ArrowRight,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Filter,
  BarChart3,
  Layers,
  FileText,
} from 'lucide-react';
import { KpiCardMetric } from '../executive/kpi-card-metric';
import dynamic from 'next/dynamic';

const NivoCountryYieldBar = dynamic(
  () => import('../graphs/nivo/nivo-country-yield-bar').then((m) => m.NivoCountryYieldBar),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-52 bg-slate-50 rounded-xl flex items-center justify-center animate-pulse">
        <span className="text-xs text-slate-400 font-medium">Loading Nivo Country Yields...</span>
      </div>
    ),
  }
);

export type FunctionalTabId =
  | 'SALES'
  | 'IR_SUPPLY'
  | 'EP_FUNNEL'
  | 'CXP_STANDARDS'
  | 'FINANCE'
  | 'EXECUTION';

interface FunctionalWorkflowHubProps {
  onInspectKpi: (kpiKey: string) => void;
}

export const FunctionalWorkflowHub: React.FC<FunctionalWorkflowHubProps> = ({
  onInspectKpi,
}) => {
  const [activeTab, setActiveTab] = useState<FunctionalTabId>('SALES');

  const tabs = [
    { id: 'SALES' as const, label: 'Sales & B2B CRM', icon: Briefcase, color: 'text-blue-600' },
    { id: 'IR_SUPPLY' as const, label: 'IR & Supply Quotas', icon: Globe2, color: 'text-indigo-600' },
    { id: 'EP_FUNNEL' as const, label: 'EP Funnel & Matching', icon: Users, color: 'text-emerald-600' },
    { id: 'CXP_STANDARDS' as const, label: 'CXP & 18 Standards', icon: ShieldCheck, color: 'text-purple-600' },
    { id: 'FINANCE' as const, label: 'Finance & AFPM', icon: Coins, color: 'text-amber-600' },
    { id: 'EXECUTION' as const, label: 'Team Execution (MES)', icon: Award, color: 'text-rose-600' },
  ];

  return (
    <div className="space-y-6 text-left">
      {/* Functional Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer',
                isActive
                  ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              )}
            >
              <Icon className={clsx('w-4 h-4', tab.color)} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* View 1: Sales & Partner CRM */}
      {activeTab === 'SALES' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCardMetric
              kpiKey="KPI-SALES-01"
              title="Meetings Booked & Held"
              value={14}
              unitLabel="meetings"
              targetText="Target: 12 meetings"
              attainmentPct={116}
              deltaText="+3 this week"
              trend="UP"
              confidence="CONFIRMED_LOCAL"
              authorityName="Partners Hub"
              onClick={() => onInspectKpi('KPI-SALES-01')}
              drillDownUrl="/sales"
            />
            <KpiCardMetric
              kpiKey="KPI-SALES-02"
              title="Qualified Pipeline MAD"
              value="245,000"
              unitLabel="MAD"
              fractionText="14 active deals"
              targetText="Target: 200,000 MAD"
              attainmentPct={122}
              deltaText="+22.5% vs Q1"
              trend="UP"
              confidence="CONFIRMED_LOCAL"
              authorityName="Partners Hub"
              onClick={() => onInspectKpi('KPI-SALES-02')}
              drillDownUrl="/sales"
            />
            <KpiCardMetric
              kpiKey="KPI-SALES-03"
              title="Sales Win Rate"
              value="42.8%"
              fractionText="6/14 closed"
              targetText="Target: >= 40.0%"
              attainmentPct={107}
              deltaText="+4.8% MoM"
              trend="UP"
              confidence="CONFIRMED_LOCAL"
              authorityName="Partners Hub"
              onClick={() => onInspectKpi('KPI-SALES-03')}
              drillDownUrl="/sales"
            />
            <KpiCardMetric
              kpiKey="KPI-SALES-04"
              title="Follow-up SLA Compliance"
              value="96.2%"
              fractionText="25/26"
              targetText="Target: >= 95.0%"
              attainmentPct={101}
              deltaText="On Track"
              trend="STABLE"
              confidence="CONFIRMED_LOCAL"
              authorityName="Partners Hub"
              onClick={() => onInspectKpi('KPI-SALES-04')}
              drillDownUrl="/sales"
            />
          </div>

          {/* Breakdown & Priority Table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Sales Pipeline Stage Conversion
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold text-slate-700">1. Researched Leads &rarr; Contacted</span>
                    <span className="font-mono text-slate-600">32/40 (80%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: '80%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold text-slate-700">2. Contacted &rarr; Meeting Held</span>
                    <span className="font-mono text-slate-600">14/32 (43.8%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: '43.8%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold text-slate-700">3. Meeting &rarr; Qualified Proposal Sent</span>
                    <span className="font-mono text-slate-600">8/14 (57.1%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: '57.1%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold text-slate-700">4. Proposal &rarr; Signed Agreement</span>
                    <span className="font-mono text-slate-600">6/8 (75.0%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '75%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Stale Deal Action Queue (&gt; 14 Days Idle)
              </h3>
              <div className="divide-y divide-slate-100 text-xs">
                <div className="py-2.5 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900">Fondation OCP (CSR EcoRabat)</h4>
                    <p className="text-[11px] text-slate-500">Proposal stage · 18 days idle · 45,000 MAD</p>
                  </div>
                  <Link
                    href="/sales"
                    className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-bold text-xs"
                  >
                    Follow up &rarr;
                  </Link>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900">Groupe Scolaire Al Madina</h4>
                    <p className="text-[11px] text-slate-500">Discovery stage · 15 days idle · 20,000 MAD</p>
                  </div>
                  <Link
                    href="/sales"
                    className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-bold text-xs"
                  >
                    Follow up &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View 2: IR & Opportunity Supply */}
      {activeTab === 'IR_SUPPLY' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCardMetric
              kpiKey="KPI-IR-01"
              title="Active IR Partners"
              value={6}
              unitLabel="entities"
              targetText="Target: 6 entities"
              attainmentPct={100}
              deltaText="Optimal"
              trend="STABLE"
              confidence="VERIFIED_OFFICIAL"
              authorityName="Exchange Hub"
              onClick={() => onInspectKpi('KPI-IR-01')}
              drillDownUrl="/opportunities/irm"
            />
            <KpiCardMetric
              kpiKey="KPI-IR-02"
              title="IR Response SLA (<48h)"
              value="28.4"
              unitLabel="hours"
              targetText="Target: <= 48h"
              attainmentPct={140}
              deltaText="Fast"
              trend="UP"
              confidence="CONFIRMED_LOCAL"
              authorityName="Local SOP"
              onClick={() => onInspectKpi('KPI-IR-02')}
              drillDownUrl="/opportunities/irm"
            />
            <KpiCardMetric
              kpiKey="KPI-CONT-02"
              title="Available Valid Slots"
              value={12}
              unitLabel="slots"
              fractionText="of 60 total"
              targetText="Across 4 projects"
              attainmentPct={80}
              deltaText="Sufficient"
              trend="STABLE"
              confidence="VERIFIED_OFFICIAL"
              authorityName="Exchange Hub"
              onClick={() => onInspectKpi('KPI-CONT-02')}
              drillDownUrl="/opportunities"
            />
            <KpiCardMetric
              kpiKey="KPI-CONT-03"
              title="Slot Fill Rate"
              value="80.0%"
              fractionText="48/60"
              targetText="Target: >= 80.0%"
              attainmentPct={100}
              deltaText="+5.0% MoM"
              trend="UP"
              confidence="VERIFIED_OFFICIAL"
              authorityName="Exchange Hub"
              onClick={() => onInspectKpi('KPI-CONT-03')}
              drillDownUrl="/opportunities"
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                IR Partner Sourcing Yield (Nivo Grouped Bars: Delivered vs Quota)
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">
                Green = Delivered · Indigo = Bilateral Quota
              </span>
            </div>
            <NivoCountryYieldBar height={220} />
          </div>
        </div>
      )}

      {/* View 3: EP Funnel & Matching */}
      {activeTab === 'EP_FUNNEL' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCardMetric
              kpiKey="KPI-FUNNEL-01"
              title="Total Applications (APD)"
              value={112}
              unitLabel="applicants"
              targetText="Target: 100"
              attainmentPct={112}
              deltaText="+12% MoM"
              trend="UP"
              confidence="VERIFIED_OFFICIAL"
              authorityName="IM Hub"
              onClick={() => onInspectKpi('KPI-FUNNEL-01')}
              drillDownUrl="/crm"
            />
            <KpiCardMetric
              kpiKey="KPI-FUNNEL-02"
              title="Cohort Realization Rate"
              value="21.4%"
              fractionText="24/112"
              targetText="Target: >= 20.0%"
              attainmentPct={107}
              deltaText="+3.2% vs Q1"
              trend="UP"
              confidence="VERIFIED_OFFICIAL"
              authorityName="Exchange Hub"
              onClick={() => onInspectKpi('KPI-FUNNEL-02')}
              drillDownUrl="/crm"
            />
            <KpiCardMetric
              kpiKey="KPI-MATCH-01"
              title="Unmatched EPs Beyond SLA (>7d)"
              value={2}
              unitLabel="EPs"
              targetText="Target: 0 EPs"
              attainmentPct={0}
              deltaText="At Risk"
              trend="DOWN"
              isGood={false}
              confidence="CONFIRMED_LOCAL"
              authorityName="Local SOP"
              onClick={() => onInspectKpi('KPI-MATCH-01')}
              drillDownUrl="/crm?status=UNMATCHED"
            />
            <KpiCardMetric
              kpiKey="KPI-MATCH-02"
              title="Overbooking Count (INV-01)"
              value={0}
              unitLabel="violations"
              targetText="Target: 0 (Strict Invariant)"
              attainmentPct={100}
              deltaText="Clean"
              trend="STABLE"
              isGood={true}
              confidence="VERIFIED_OFFICIAL"
              authorityName="Exchange Hub"
              onClick={() => onInspectKpi('KPI-MATCH-02')}
              drillDownUrl="/opportunities"
            />
          </div>

          {/* Unmatched Queue */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Unmatched Eligible EP Queue (&gt; 7 Days Idle)
            </h3>
            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900">Lucas Dubois (EP-2026-FR-15)</h4>
                  <p className="text-[11px] text-slate-500">11 days waiting · Blocked by EcoRabat Wave 1 slot capacity</p>
                </div>
                <Link
                  href="/crm?id=EP-2026-FR-15"
                  className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 font-bold text-xs"
                >
                  Allocate Slot &rarr;
                </Link>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900">Sophie Meier (EP-2026-DE-22)</h4>
                  <p className="text-[11px] text-slate-500">8 days waiting · German bilateral IR confirmation document missing</p>
                </div>
                <Link
                  href="/opportunities/irm?id=EP-2026-DE-22"
                  className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 font-bold text-xs"
                >
                  Clear IR &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View 4: CXP & 18 Standards */}
      {activeTab === 'CXP_STANDARDS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCardMetric
              kpiKey="KPI-STD-01"
              title="18 Standards Fulfillment Rate"
              value="90.0%"
              fractionText="389/432"
              targetText="Target: >= 88.8% (16/18)"
              attainmentPct={101}
              deltaText="+3.6% MoM"
              trend="UP"
              confidence="VERIFIED_OFFICIAL"
              authorityName="ICB Hub"
              onClick={() => onInspectKpi('KPI-STD-01')}
              drillDownUrl="/accommodation#standards"
            />
            <KpiCardMetric
              kpiKey="KPI-VISA-01"
              title="Pre-Arrival Readiness Rate"
              value="95.8%"
              fractionText="23/24"
              targetText="Target: 100%"
              attainmentPct={96}
              deltaText="1 pending"
              trend="STABLE"
              confidence="VERIFIED_OFFICIAL"
              authorityName="Exchange Hub"
              onClick={() => onInspectKpi('KPI-VISA-01')}
              drillDownUrl="/accommodation#pickups"
            />
            <KpiCardMetric
              kpiKey="KPI-OPS-01"
              title="Pickup Coverage (Std #6)"
              value="100%"
              fractionText="24/24"
              targetText="Target: 100%"
              attainmentPct={100}
              deltaText="Optimal"
              trend="STABLE"
              confidence="VERIFIED_OFFICIAL"
              authorityName="Exchange Hub"
              onClick={() => onInspectKpi('KPI-OPS-01')}
              drillDownUrl="/accommodation#pickups"
            />
            <KpiCardMetric
              kpiKey="KPI-STD-03"
              title="High-Severity Issues (Mood <= 2)"
              value={1}
              unitLabel="cases"
              targetText="Target: 0 cases"
              attainmentPct={0}
              deltaText="Countdown Active"
              trend="DOWN"
              isGood={false}
              confidence="VERIFIED_OFFICIAL"
              authorityName="ICB Hub"
              onClick={() => onInspectKpi('KPI-STD-03')}
              drillDownUrl="/accommodation#cases"
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              18 Refreshed Standards Fulfillment Heatmap
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {[
                { num: '#1', name: 'Personal Goal Setting', status: 'delivered' },
                { num: '#2', name: 'Outgoing Prep (OPS)', status: 'delivered' },
                { num: '#3', name: 'Expectation Setting', status: 'delivered' },
                { num: '#4', name: 'Visa & Legal Support', status: 'delivered' },
                { num: '#5', name: 'Arrival Info (3d Guide)', status: 'delivered' },
                { num: '#6', name: 'Pickup at Port', status: 'delivered' },
                { num: '#7', name: 'Departure Support', status: 'warning' },
                { num: '#8', name: 'Safe Accommodation', status: 'delivered' },
                { num: '#9', name: 'Basic Living Costs', status: 'delivered' },
                { num: '#10a', name: 'Mid-OP Alignment', status: 'warning' },
                { num: '#10b', name: 'Closing Alignment', status: 'delivered' },
                { num: '#11', name: 'Job Description (JD)', status: 'delivered' },
                { num: '#12', name: 'Working Hours', status: 'delivered' },
                { num: '#13', name: 'First Day of Work', status: 'delivered' },
                { num: '#14', name: 'Individual Dev Plan', status: 'delivered' },
                { num: '#15', name: 'Debrief / Closing', status: 'delivered' },
                { num: '#16', name: 'LDA Assessment', status: 'delivered' },
                { num: '#17', name: 'Standards Survey', status: 'delivered' },
              ].map((s) => (
                <div
                  key={s.num}
                  className={clsx(
                    'p-2.5 rounded-xl border text-center space-y-1',
                    s.status === 'delivered'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  )}
                >
                  <span className="font-mono font-bold text-xs block">{s.num}</span>
                  <span className="text-[10px] font-medium block truncate" title={s.name}>
                    {s.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* View 5: Finance & AFPM */}
      {activeTab === 'FINANCE' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCardMetric
              kpiKey="KPI-FIN-01"
              title="Overdue Receivables >14d"
              value="12,000"
              unitLabel="MAD"
              targetText="Target: 0 MAD (Freeze Active)"
              attainmentPct={0}
              deltaText="Breached"
              trend="DOWN"
              isGood={false}
              confidence="VERIFIED_OFFICIAL"
              authorityName="Finance Academy"
              onClick={() => onInspectKpi('KPI-FIN-01')}
              drillDownUrl="/dashboards#invoices"
            />
            <KpiCardMetric
              kpiKey="KPI-FIN-02"
              title="iGV Cost Coverage Ratio"
              value="113.6%"
              fractionText="25,000 / 22,000 MAD"
              targetText="Target: >= 70% to 100%"
              attainmentPct={114}
              deltaText="Self-funding"
              trend="UP"
              confidence="CONFIRMED_LOCAL"
              authorityName="Finance Academy"
              onClick={() => onInspectKpi('KPI-FIN-02')}
              drillDownUrl="/dashboards"
            />
            <KpiCardMetric
              kpiKey="KPI-FIN-03"
              title="AFPM Reserve Solvency Ratio"
              value="142.0%"
              fractionText="71,000 / 50,000 MAD"
              targetText="Target: >= 120%"
              attainmentPct={118}
              deltaText="Solvent"
              trend="UP"
              confidence="VERIFIED_OFFICIAL"
              authorityName="Finance Academy"
              onClick={() => onInspectKpi('KPI-FIN-03')}
              drillDownUrl="/dashboards"
            />
            <KpiCardMetric
              kpiKey="KPI-SALES-02"
              title="Total B2B Cash Collected"
              value="85,000"
              unitLabel="MAD"
              targetText="Budget: 80,000 MAD"
              attainmentPct={106}
              deltaText="+6.25% vs Budget"
              trend="UP"
              confidence="VERIFIED_OFFICIAL"
              authorityName="Finance Academy"
              onClick={() => onInspectKpi('KPI-SALES-02')}
              drillDownUrl="/dashboards#invoices"
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              AFPM Accounts Receivable Aging Breakdown
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">Current (0 - 7 Days)</span>
                <span className="text-base font-bold text-emerald-950 mt-1 block">45,000 MAD</span>
                <span className="text-[10px] text-emerald-700">3 corporate invoices</span>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <span className="text-[10px] font-bold text-amber-800 uppercase block">Warning (8 - 14 Days)</span>
                <span className="text-base font-bold text-amber-950 mt-1 block">28,000 MAD</span>
                <span className="text-[10px] text-amber-700">2 invoices under reminder SLA</span>
              </div>
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                <span className="text-[10px] font-bold text-rose-800 uppercase block">Overdue &gt; 14 Days (Penalty + Freeze)</span>
                <span className="text-base font-bold text-rose-950 mt-1 block">12,000 MAD</span>
                <span className="text-[10px] text-rose-700">Invoice #INV-2026-003 (+600 MAD penalty)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View 6: Team Execution & MES */}
      {activeTab === 'EXECUTION' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCardMetric
              kpiKey="KPI-TM-01"
              title="Average LC Member Score (MES)"
              value="82.4%"
              fractionText="28 active members"
              targetText="Target: >= 75.0%"
              attainmentPct={110}
              deltaText="+4.1% MoM"
              trend="UP"
              confidence="CONFIRMED_LOCAL"
              authorityName="MX Hub"
              onClick={() => onInspectKpi('KPI-TM-01')}
              drillDownUrl="/members"
            />
            <KpiCardMetric
              kpiKey="KPI-TM-02"
              title="On-Time Task Completion"
              value="94.2%"
              fractionText="65/69 tasks"
              targetText="Target: >= 90.0%"
              attainmentPct={105}
              deltaText="Disciplined"
              trend="UP"
              confidence="CONFIRMED_LOCAL"
              authorityName="Local SOP"
              onClick={() => onInspectKpi('KPI-TM-02')}
              drillDownUrl="/dashboards#tasks"
            />
            <KpiCardMetric
              kpiKey="KPI-TM-01"
              title="Tier 1 Core Members Share"
              value="64.3%"
              fractionText="18/28 members"
              targetText="Target: >= 60.0%"
              attainmentPct={107}
              deltaText="High Morale"
              trend="UP"
              confidence="CONFIRMED_LOCAL"
              authorityName="MX Hub"
              onClick={() => onInspectKpi('KPI-TM-01')}
              drillDownUrl="/members"
            />
            <KpiCardMetric
              kpiKey="KPI-TM-02"
              title="Overdue Tasks Count"
              value={4}
              unitLabel="tasks"
              targetText="Target: 0 tasks"
              attainmentPct={0}
              deltaText="Manageable"
              trend="STABLE"
              isGood={true}
              confidence="CONFIRMED_LOCAL"
              authorityName="Local SOP"
              onClick={() => onInspectKpi('KPI-TM-02')}
              drillDownUrl="/dashboards#tasks"
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Member Leadership Tier Breakdown (AIESEC in Rabat)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="font-bold text-emerald-800 block">Tier 1: Core Leadership</span>
                <span className="text-lg font-bold text-emerald-950 mt-1 block">18 members</span>
                <span className="text-[10px] text-emerald-700">MES 90% - 100%</span>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                <span className="font-bold text-blue-800 block">Tier 2: Strong Contributors</span>
                <span className="text-lg font-bold text-blue-950 mt-1 block">6 members</span>
                <span className="text-[10px] text-blue-700">MES 80% - 89%</span>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <span className="font-bold text-amber-800 block">Tier 3: Moderate Activity</span>
                <span className="text-lg font-bold text-amber-950 mt-1 block">3 members</span>
                <span className="text-[10px] text-amber-700">MES 70% - 79%</span>
              </div>
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                <span className="font-bold text-rose-800 block">Tier 4: At Risk / Support</span>
                <span className="text-lg font-bold text-rose-950 mt-1 block">1 member</span>
                <span className="text-[10px] text-rose-700">MES &lt; 70%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
