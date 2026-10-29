'use client';

import React, { useState, useEffect } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import clsx from 'clsx';
import { ProjectCapacityItem } from '@/lib/types/dashboard-spec';

interface NivoProjectCapacityBarProps {
  capacities: ProjectCapacityItem[];
  height?: number;
  className?: string;
  onProjectClick?: (projectCode: string) => void;
}

export const NivoProjectCapacityBar: React.FC<NivoProjectCapacityBarProps> = ({
  capacities,
  height = 200,
  className,
  onProjectClick,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Format data for Nivo ResponsiveBar (Horizontal Stacked Bar)
  const barData = capacities.map((p) => ({
    projectShort: p.projectName.replace(' Rabat', '').replace(' Clean Oceans', '').replace(' Leadership', '').replace(' Community Care', ''),
    projectCode: p.projectCode,
    projectName: p.projectName,
    sdgNumber: p.sdgNumber,
    filledSlots: p.filledSlots,
    openSlots: p.openSlots,
    totalValidSlots: p.totalValidSlots,
    fillRatePct: p.fillRatePct,
    fillRateFraction: p.fillRateFraction,
    status: p.status,
  }));

  if (!mounted) {
    return (
      <div
        className={clsx('w-full rounded-xl bg-slate-50 flex items-center justify-center animate-pulse', className)}
        style={{ height }}
      >
        <span className="text-xs text-slate-400 font-medium">Loading Nivo Capacity Chart...</span>
      </div>
    );
  }

  return (
    <div className={clsx('w-full relative', className)} style={{ height }}>
      <ResponsiveBar
        data={barData}
        keys={['filledSlots', 'openSlots']}
        indexBy="projectShort"
        layout="horizontal"
        margin={{ top: 10, right: 30, bottom: 25, left: 110 }}
        padding={0.35}
        valueScale={{ type: 'linear' }}
        indexScale={{ type: 'band', round: true }}
        colors={({ id }) => (id === 'filledSlots' ? '#10b981' : '#e2e8f0')}
        borderColor={{ from: 'color', modifiers: [['darker', 0.6]] }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 4,
          tickPadding: 4,
          tickRotation: 0,
          legend: 'Total Valid Opportunity Slots',
          legendPosition: 'middle',
          legendOffset: 20,
        }}
        axisLeft={{
          tickSize: 0,
          tickPadding: 8,
          tickRotation: 0,
        }}
        enableLabel={true}
        label={({ id, value }) => (id === 'filledSlots' ? `${value}` : '')}
        labelTextColor="#ffffff"
        motionConfig="gentle"
        onClick={(node) => {
          const raw = node.data as any;
          onProjectClick?.(raw.projectCode);
        }}
        tooltip={({ id, value, data }) => {
          const raw = data as any;
          return (
            <div className="bg-slate-900/95 text-white backdrop-blur-md rounded-xl p-3 shadow-xl border border-slate-700 text-xs space-y-1.5 min-w-[200px] text-left">
              <div className="flex items-center justify-between border-b border-slate-700/80 pb-1">
                <span className="font-bold text-white text-xs">
                  SDG {raw.sdgNumber} · {raw.projectName}
                </span>
                <span
                  className={clsx(
                    'px-1.5 py-0.5 rounded-sm text-[10px] font-bold uppercase',
                    raw.status === 'OPTIMAL'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : raw.status === 'AT_RISK'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-rose-500/20 text-rose-300'
                  )}
                >
                  {raw.status}
                </span>
              </div>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Filled Slots:</span>
                  <strong className="text-emerald-400 font-mono">{raw.filledSlots}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Open Available Slots:</span>
                  <strong className="text-slate-200 font-mono">{raw.openSlots}</strong>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-800">
                  <span className="text-slate-400">Slot Fill Rate:</span>
                  <strong className="text-white font-mono">
                    {raw.fillRatePct.toFixed(1)}% ({raw.fillRateFraction})
                  </strong>
                </div>
              </div>
            </div>
          );
        }}
      />
    </div>
  );
};
