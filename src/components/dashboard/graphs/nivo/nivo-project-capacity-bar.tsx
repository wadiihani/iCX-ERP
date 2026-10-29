'use client';

import React, { useState, useEffect } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import clsx from 'clsx';
import { ProjectCapacityItem } from '@/lib/types/dashboard-spec';

const DEFAULT_CAPACITIES: ProjectCapacityItem[] = [
  { projectCode: 'SDG-13-ECO', projectName: 'EcoRabat', sdgNumber: 13, sdgName: 'Climate Action', filledSlots: 28, openSlots: 7, totalValidSlots: 35, fillRatePct: 80, fillRateFraction: '28/35', status: 'OPTIMAL' },
  { projectCode: 'SDG-04-EDU', projectName: 'Global Classroom', sdgNumber: 4, sdgName: 'Quality Education', filledSlots: 22, openSlots: 3, totalValidSlots: 25, fillRatePct: 88, fillRateFraction: '22/25', status: 'OPTIMAL' },
  { projectCode: 'SDG-08-YTH', projectName: 'Youth 4 Impact', sdgNumber: 8, sdgName: 'Decent Work & Economic Growth', filledSlots: 15, openSlots: 5, totalValidSlots: 20, fillRatePct: 75, fillRateFraction: '15/20', status: 'AT_RISK' },
  { projectCode: 'SDG-03-HLT', projectName: 'Health First', sdgNumber: 3, sdgName: 'Good Health & Well-being', filledSlots: 18, openSlots: 2, totalValidSlots: 20, fillRatePct: 90, fillRateFraction: '18/20', status: 'OPTIMAL' },
];

interface NivoProjectCapacityBarProps {
  capacities?: ProjectCapacityItem[];
  height?: number;
  className?: string;
  onProjectClick?: (projectCode: string) => void;
}

export const NivoProjectCapacityBar: React.FC<NivoProjectCapacityBarProps> = ({
  capacities = DEFAULT_CAPACITIES,
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
        data={barData as any}
        keys={['filledSlots', 'openSlots']}
        indexBy="projectShort"
        margin={{ top: 10, right: 20, bottom: 25, left: 110 }}
        padding={0.25}
        layout="horizontal"
        valueScale={{ type: 'linear' }}
        indexScale={{ type: 'band', round: true }}
        colors={({ id }) => (id === 'filledSlots' ? '#10b981' : '#cbd5e1')}
        borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 4,
          tickPadding: 4,
          tickRotation: 0,
          legend: 'Total Valid Slots',
          legendPosition: 'middle',
          legendOffset: 20,
        }}
        axisLeft={{
          tickSize: 4,
          tickPadding: 6,
          tickRotation: 0,
        }}
        enableGridY={false}
        enableGridX={true}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={(bar: any) => (bar.id === 'openSlots' ? '#475569' : '#ffffff')}
        motionConfig="gentle"
        onClick={(node) => {
          const raw = node.data as any;
          if (raw.projectCode) {
            onProjectClick?.(raw.projectCode);
          }
        }}
        tooltip={({ id, value, color, data }) => {
          const raw = data as any;
          return (
            <div className="bg-slate-900 text-white rounded-lg p-2.5 shadow-xl border border-slate-700 text-xs space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">{raw.projectName}</span>
                <span className="px-1.5 py-0.2 rounded-xs bg-indigo-500/30 text-indigo-300 font-mono text-[10px]">
                  SDG {raw.sdgNumber}
                </span>
              </div>
              <div className="text-[11px] text-slate-300">
                <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: color }} />
                {id === 'filledSlots' ? 'Matched / Filled' : 'Open Slots'}: <strong>{value} slots</strong>
              </div>
              <div className="text-[10px] text-slate-400 border-t border-slate-800 pt-1 flex justify-between gap-4">
                <span>Fill Rate: <strong className="text-emerald-400">{raw.fillRatePct}%</strong> ({raw.fillRateFraction})</span>
                <span className="text-amber-400 uppercase font-semibold">{raw.status}</span>
              </div>
            </div>
          );
        }}
      />
    </div>
  );
};
