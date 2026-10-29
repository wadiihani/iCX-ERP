'use client';

import React from 'react';
import { ExecutiveOutcomeCards } from '@/lib/types/dashboard-spec';
import { KpiCardMetric } from './kpi-card-metric';

interface ExecutiveRowOutcomesProps {
  outcomes: ExecutiveOutcomeCards;
  onInspectKpi: (kpiKey: string) => void;
}

export const ExecutiveRowOutcomes: React.FC<ExecutiveRowOutcomesProps> = ({
  outcomes,
  onInspectKpi,
}) => {
  return (
    <section className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
            Row 1 — Exchange Outcomes &amp; Quality
          </h2>
        </div>
        <span className="text-[11px] text-slate-500 font-medium">
          Core Question: &quot;Are we achieving intended exchange outcomes?&quot;
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Realized Exchanges */}
        <KpiCardMetric
          kpiKey="KPI-EP-02"
          title="Realized Exchanges"
          value={outcomes.realized.current}
          targetText={`Target: ${outcomes.realized.target}`}
          attainmentPct={outcomes.realized.attainmentPct}
          deltaText={outcomes.realized.deltaText}
          trend={outcomes.realized.trend}
          isGood={outcomes.realized.isGood}
          confidence="VERIFIED_OFFICIAL"
          authorityName="Exchange Hub"
          unitLabel="arrivals"
          onClick={() => onInspectKpi('KPI-EP-02')}
          drillDownUrl="/crm?stage=REALIZED"
        />

        {/* Card 2: Completed Exchanges */}
        <KpiCardMetric
          kpiKey="KPI-EP-03"
          title="Completed Exchanges"
          value={outcomes.completed.current}
          targetText={`Target: ${outcomes.completed.target}`}
          attainmentPct={outcomes.completed.attainmentPct}
          deltaText={outcomes.completed.deltaText}
          trend={outcomes.completed.trend}
          isGood={outcomes.completed.isGood}
          confidence="VERIFIED_OFFICIAL"
          authorityName="Exchange Hub"
          unitLabel="finished"
          onClick={() => onInspectKpi('KPI-EP-03')}
          drillDownUrl="/crm?stage=COMPLETED"
        />

        {/* Card 3: Cohort App-to-Realized Rate */}
        <KpiCardMetric
          kpiKey="KPI-FUNNEL-02"
          title="Cohort App-to-Realized Rate"
          value={outcomes.cohortAppToRealized.formattedRate}
          fractionText={outcomes.cohortAppToRealized.fractionText}
          targetText={`Benchmark: ${outcomes.cohortAppToRealized.targetFormatted}`}
          attainmentPct={Math.round(
            (outcomes.cohortAppToRealized.value / (outcomes.cohortAppToRealized.target || 20)) * 100
          )}
          deltaText={outcomes.cohortAppToRealized.wowDelta}
          trend={outcomes.cohortAppToRealized.trendDirection}
          isGood={outcomes.cohortAppToRealized.isGood}
          confidence="VERIFIED_OFFICIAL"
          authorityName="IM Hub / GV Dashboard"
          onClick={() => onInspectKpi('KPI-FUNNEL-02')}
          drillDownUrl="/crm"
        />

        {/* Card 4: Standards Compliance */}
        <KpiCardMetric
          kpiKey="KPI-STD-01"
          title="18 Standards Fulfillment Rate"
          value={outcomes.standardsCompliance.formattedRate}
          fractionText={outcomes.standardsCompliance.fractionText}
          targetText={`Statutory Floor: ${outcomes.standardsCompliance.targetFormatted} (16/18)`}
          attainmentPct={Math.round(
            (outcomes.standardsCompliance.value / (outcomes.standardsCompliance.target || 88.8)) * 100
          )}
          deltaText={outcomes.standardsCompliance.wowDelta}
          trend={outcomes.standardsCompliance.trendDirection}
          isGood={outcomes.standardsCompliance.isGood}
          confidence="VERIFIED_OFFICIAL"
          authorityName="ICB Hub"
          onClick={() => onInspectKpi('KPI-STD-01')}
          drillDownUrl="/accommodation#standards"
        />
      </div>
    </section>
  );
};
