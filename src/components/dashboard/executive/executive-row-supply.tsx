'use client';

import React from 'react';
import { ExecutiveSupplyCards } from '@/lib/types/dashboard-spec';
import { KpiCardMetric } from './kpi-card-metric';

interface ExecutiveRowSupplyProps {
  supply: ExecutiveSupplyCards;
  onInspectKpi: (kpiKey: string) => void;
}

export const ExecutiveRowSupply: React.FC<ExecutiveRowSupplyProps> = ({
  supply,
  onInspectKpi,
}) => {
  return (
    <section className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
            Row 2 — Growth &amp; Capacity Supply
          </h2>
        </div>
        <span className="text-[11px] text-slate-500 font-medium">
          Core Question: &quot;Where are we gaining or losing partner capacity?&quot;
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Qualified B2B Pipeline */}
        <KpiCardMetric
          kpiKey="KPI-SALES-02"
          title="Qualified B2B Pipeline"
          value={`${(supply.qualifiedPipelineMad.amountMad / 1000).toFixed(0)}k`}
          unitLabel="MAD"
          fractionText={`${supply.qualifiedPipelineMad.dealCount} deals`}
          targetText={`Target: ${(supply.qualifiedPipelineMad.targetMad / 1000).toFixed(0)}k MAD`}
          attainmentPct={supply.qualifiedPipelineMad.attainmentPct}
          deltaText={supply.qualifiedPipelineMad.deltaText}
          trend={supply.qualifiedPipelineMad.trend}
          isGood={supply.qualifiedPipelineMad.isGood}
          confidence="CONFIRMED_LOCAL"
          authorityName="Partners Hub"
          onClick={() => onInspectKpi('KPI-SALES-02')}
          drillDownUrl="/sales"
        />

        {/* Card 2: Signed Partners Count */}
        <KpiCardMetric
          kpiKey="KPI-CONT-01"
          title="Signed Partner Organizations"
          value={supply.signedPartnersCount.current}
          targetText={`Target: ${supply.signedPartnersCount.target} partners`}
          attainmentPct={supply.signedPartnersCount.attainmentPct}
          deltaText={supply.signedPartnersCount.deltaText}
          trend={supply.signedPartnersCount.trend}
          isGood={supply.signedPartnersCount.isGood}
          confidence="VERIFIED_OFFICIAL"
          authorityName="Partners Hub"
          unitLabel="organizations"
          onClick={() => onInspectKpi('KPI-CONT-01')}
          drillDownUrl="/sales#contracts"
        />

        {/* Card 3: Valid Available Slots */}
        <KpiCardMetric
          kpiKey="KPI-CONT-02"
          title="Valid Available Slots"
          value={supply.validAvailableSlots.openSlots}
          unitLabel="open slots"
          fractionText={`of ${supply.validAvailableSlots.totalSlots} total`}
          targetText={`Across ${supply.validAvailableSlots.projectCount} active projects`}
          attainmentPct={Math.round(
            ((supply.validAvailableSlots.totalSlots - supply.validAvailableSlots.openSlots) /
              supply.validAvailableSlots.totalSlots) *
              100
          )}
          deltaText="Sufficient"
          trend="STABLE"
          isGood={supply.validAvailableSlots.openSlots > 0}
          confidence="VERIFIED_OFFICIAL"
          authorityName="Exchange Hub / APIP"
          onClick={() => onInspectKpi('KPI-CONT-02')}
          drillDownUrl="/opportunities"
        />

        {/* Card 4: Slot Fill Rate */}
        <KpiCardMetric
          kpiKey="KPI-CONT-03"
          title="Slot Capacity Fill Rate"
          value={supply.slotFillRate.formattedRate}
          fractionText={supply.slotFillRate.fractionText}
          targetText={`Target: ${supply.slotFillRate.targetFormatted || '80.0%'}`}
          attainmentPct={Math.round(
            (supply.slotFillRate.value / (supply.slotFillRate.target || 80.0)) * 100
          )}
          deltaText={supply.slotFillRate.wowDelta}
          trend={supply.slotFillRate.trendDirection}
          isGood={supply.slotFillRate.isGood}
          confidence="VERIFIED_OFFICIAL"
          authorityName="Exchange Hub"
          onClick={() => onInspectKpi('KPI-CONT-03')}
          drillDownUrl="/opportunities"
        />
      </div>
    </section>
  );
};
