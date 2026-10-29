'use client';

import React from 'react';
import clsx from 'clsx';
import {
  SteppedFunnelStage,
  ProjectCapacityItem,
} from '@/lib/types/dashboard-spec';
import {
  Filter,
  ArrowRight,
  Clock,
  AlertCircle,
  Briefcase,
  Layers,
  CheckCircle2,
} from 'lucide-react';

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
  return (
    <section className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
            Row 3 — Conversion Trends &amp; Project Capacity
          </h2>
        </div>
        <span className="text-[11px] text-slate-500 font-medium">
          Core Question: &quot;Where exactly are we losing people, partners, or time?&quot;
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column (7 cols): Stepped Cohort Funnel */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                  Cohort Conversion Funnel (APD &rarr; REA &rarr; COM)
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                Application Cohort 2026-Q2
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Tracks sequential progression through canonical EXPA stages with stage drop-off and median duration.
            </p>

            {/* Stepped Funnel Horizontal Bars */}
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

                    {/* Progress Fill Bar */}
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
                      <div
                        className={clsx(
                          'h-full transition-all duration-500 rounded-full',
                          idx === 0
                            ? 'bg-blue-600'
                            : idx === 1
                            ? 'bg-blue-500'
                            : idx === 2
                            ? 'bg-indigo-500'
                            : idx === 3
                            ? 'bg-emerald-500'
                            : 'bg-emerald-600'
                        )}
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>

                    {/* Drop-off Note if any */}
                    {stage.dropOffCount > 0 && (
                      <div className="flex items-center justify-between text-[10px] text-slate-600 px-1">
                        <span>Drop-off: &minus;{stage.dropOffCount} EPs</span>
                        <span className="italic truncate max-w-[280px]">
                          Primary reason: {stage.primaryDropOffReason}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
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

        {/* Right Column (5 cols): Sales Velocity & Capacity By Project */}
        <div className="lg:col-span-5 space-y-4">
          {/* Top Card: Weekly Sales Activity */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                  B2B Sales Velocity &amp; Closing Cycle
                </h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                14.2 Days Cycle
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-3 text-center">
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Meetings</span>
                <span className="text-base font-bold text-slate-900">14 held</span>
                <span className="text-[10px] text-emerald-600 block">+3 this week</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Proposals</span>
                <span className="text-base font-bold text-slate-900">8 sent</span>
                <span className="text-[10px] text-blue-600 block">57% conv</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">SLA Followup</span>
                <span className="text-base font-bold text-slate-900">96.2%</span>
                <span className="text-[10px] text-emerald-600 block">&lt; 48h SLA</span>
              </div>
            </div>
          </div>

          {/* Bottom Card: Project Capacity Stacked Bars (16 GV Projects) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-600" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                  Capacity Utilization by Project / SDG
                </h3>
              </div>
              <span className="text-[10px] font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                48/60 Total Slots
              </span>
            </div>

            <div className="space-y-2.5 mt-3">
              {projectCapacities.map((proj) => (
                <div key={proj.projectCode} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-800 truncate max-w-[190px]">
                      SDG {proj.sdgNumber} · {proj.projectName}
                    </span>
                    <span className="font-mono text-slate-600">
                      {proj.filledSlots}/{proj.totalValidSlots} ({proj.fillRatePct.toFixed(0)}%)
                    </span>
                  </div>
                  {/* Bullet capacity bar */}
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                    <div
                      className={clsx(
                        'h-full rounded-full transition-all duration-300',
                        proj.status === 'OPTIMAL'
                          ? 'bg-emerald-500'
                          : proj.status === 'AT_RISK'
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      )}
                      style={{ width: `${proj.fillRatePct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
              <span className="text-slate-500">Target fill rate: &gt;= 85%</span>
              <button
                onClick={() => onInspectKpi('KPI-CONT-03')}
                className="text-purple-600 hover:text-purple-700 font-semibold cursor-pointer"
              >
                Inspect slot allocations &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
