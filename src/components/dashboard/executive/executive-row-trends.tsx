'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import clsx from 'clsx';
import {
  SteppedFunnelStage,
  ProjectCapacityItem,
} from '@/lib/types/dashboard-spec';
import {
  Filter,
  ArrowRight,
  Clock,
  Briefcase,
  Layers,
} from 'lucide-react';

// Dynamic client-side Nivo imports for SSR safety and instant compilation
const NivoCohortFunnel = dynamic(
  () => import('../graphs/nivo/nivo-cohort-funnel').then((m) => m.NivoCohortFunnel),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-64 bg-slate-50 rounded-xl flex items-center justify-center animate-pulse">
        <span className="text-xs text-slate-400 font-medium">Loading Nivo Cohort Funnel...</span>
      </div>
    ),
  }
);

const NivoProjectCapacityBar = dynamic(
  () => import('../graphs/nivo/nivo-project-capacity-bar').then((m) => m.NivoProjectCapacityBar),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-40 bg-slate-50 rounded-xl flex items-center justify-center animate-pulse">
        <span className="text-xs text-slate-400 font-medium">Loading Nivo Capacity Chart...</span>
      </div>
    ),
  }
);

const NivoSalesVelocityLine = dynamic(
  () => import('../graphs/nivo/nivo-sales-velocity-line').then((m) => m.NivoSalesVelocityLine),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-36 bg-slate-50 rounded-xl flex items-center justify-center animate-pulse">
        <span className="text-xs text-slate-400 font-medium">Loading Nivo Sales Curve...</span>
      </div>
    ),
  }
);

interface ExecutiveRowTrendsProps {
  funnelStages: SteppedFunnelStage[];
  projectCapacities: ProjectCapacityItem[];
  onInspectKpi: (kpiKey: string) => void;
}

export const ExecutiveRowTrends: React.FC<ExecutiveRowTrendsProps> = ({
  funnelStages,
  projectCapacities,
  onInspectKpi,
}) => {
  const [funnelViewMode, setFunnelViewMode] = useState<'NIVO' | 'TABLE'>('NIVO');

  return (
    <section className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
            Row 3 — Conversion Trends &amp; Project Capacity (Nivo Powered)
          </h2>
        </div>
        <span className="text-[11px] text-slate-500 font-medium">
          Core Question: &quot;Where exactly are we losing people, partners, or time?&quot;
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column (7 cols): Nivo Stepped Cohort Funnel */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                  Cohort Conversion Funnel (APD &rarr; REA &rarr; COM)
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md hidden sm:inline">
                  Cohort 2026-Q2
                </span>
                {/* View Switcher Toggle */}
                <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
                  <button
                    onClick={() => setFunnelViewMode('NIVO')}
                    className={clsx(
                      'px-2 py-0.5 rounded-md transition-colors cursor-pointer',
                      funnelViewMode === 'NIVO'
                        ? 'bg-white text-blue-700 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    )}
                  >
                    Nivo Visual
                  </button>
                  <button
                    onClick={() => setFunnelViewMode('TABLE')}
                    className={clsx(
                      'px-2 py-0.5 rounded-md transition-colors cursor-pointer',
                      funnelViewMode === 'TABLE'
                        ? 'bg-white text-blue-700 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    )}
                  >
                    Stage Rows
                  </button>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-500 mt-2">
              Sequential EXPA cohort progression with animated D3 geometry, drop-off curves, and duration metrics.
            </p>

            {/* NIVO FUNNEL VISUAL */}
            {funnelViewMode === 'NIVO' && (
              <div className="mt-3">
                <NivoCohortFunnel
                  stages={funnelStages}
                  height={260}
                  onStageClick={() => onInspectKpi('KPI-FUNNEL-02')}
                />
              </div>
            )}

            {/* STAGE ROWS TABLE VIEW */}
            {funnelViewMode === 'TABLE' && (
              <div className="space-y-3 mt-4">
                {funnelStages.map((stage, idx) => {
                  const maxCount = funnelStages[0].cohortCount || 1;
                  const widthPct = Math.max(12, Math.round((stage.cohortCount / maxCount) * 100));

                  return (
                    <div key={stage.stageId} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-blue-50 text-blue-700 font-bold text-[11px] flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-slate-800">{stage.stageName}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-slate-900 text-sm">
                            {stage.cohortCount} EPs
                          </span>
                          {idx > 0 && (
                            <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-sm">
                              {stage.conversionFromPriorPct}% ({stage.conversionFraction})
                            </span>
                          )}
                          <span className="text-[11px] text-slate-600 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {stage.medianDaysInStage}d
                          </span>
                        </div>
                      </div>

                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                        <div
                          className="h-full rounded-full bg-blue-600 transition-all duration-500"
                          style={{ width: `${widthPct}%` }}
                        />
                      </div>

                      {stage.dropOffCount > 0 && (
                        <div className="flex items-center justify-between text-[10px] text-slate-600 px-1">
                          <span>Drop-off: &minus;{stage.dropOffCount} EPs</span>
                          <span className="italic truncate max-w-[280px]">
                            {stage.primaryDropOffReason}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">
              End-to-End Cohort Conversion: <strong className="text-slate-800">21.4% (24/112)</strong>
            </span>
            <button
              onClick={() => onInspectKpi('KPI-FUNNEL-02')}
              className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              Inspect stage transition records &rarr;
            </button>
          </div>
        </div>

        {/* Right Column (5 cols): Nivo Sales Velocity & Capacity By Project */}
        <div className="lg:col-span-5 space-y-4">
          {/* Top Card: Nivo Sales Velocity Line */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                  B2B Sales Velocity &amp; Closing Curve
                </h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                14.2 Days Cycle
              </span>
            </div>

            <div className="mt-2">
              <NivoSalesVelocityLine height={150} />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-500">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500" /> Meetings
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-purple-500" /> Proposals
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Signed
                </span>
              </div>
              <button
                onClick={() => onInspectKpi('KPI-SALES-03')}
                className="text-blue-600 font-semibold hover:underline cursor-pointer"
              >
                Inspect CRM &rarr;
              </button>
            </div>
          </div>

          {/* Bottom Card: Nivo Project Capacity Stacked Bars */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-600" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                  Capacity Stack by Project / SDG
                </h3>
              </div>
              <span className="text-[10px] font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                48/60 Total Slots
              </span>
            </div>

            <div className="mt-2">
              <NivoProjectCapacityBar
                capacities={projectCapacities}
                height={160}
                onProjectClick={() => onInspectKpi('KPI-CONT-03')}
              />
            </div>

            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
              <span className="text-slate-500">Green = Filled · Gray = Open</span>
              <button
                onClick={() => onInspectKpi('KPI-CONT-03')}
                className="text-purple-600 hover:text-purple-700 font-semibold cursor-pointer"
              >
                Inspect allocations &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
