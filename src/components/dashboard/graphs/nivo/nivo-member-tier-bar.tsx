'use client';

import React, { useState, useEffect } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import clsx from 'clsx';

export interface DepartmentTierItem {
  department: string;
  tier1Core: number;
  tier2Strong: number;
  tier3Moderate: number;
  tier4DropOff: number;
  totalMembers: number;
}

const DEFAULT_MEMBER_DATA: DepartmentTierItem[] = [
  {
    department: 'External (Sales/PRM)',
    tier1Core: 5,
    tier2Strong: 2,
    tier3Moderate: 1,
    tier4DropOff: 1,
    totalMembers: 9,
  },
  {
    department: 'Internal (Ops/IR/CXP)',
    tier1Core: 8,
    tier2Strong: 3,
    tier3Moderate: 2,
    tier4DropOff: 0,
    totalMembers: 13,
  },
];

interface NivoMemberTierBarProps {
  data?: DepartmentTierItem[];
  height?: number;
  className?: string;
}

export const NivoMemberTierBar: React.FC<NivoMemberTierBarProps> = ({
  data = DEFAULT_MEMBER_DATA,
  height = 180,
  className,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={clsx('w-full rounded-xl bg-slate-50 flex items-center justify-center animate-pulse', className)}
        style={{ height }}
      >
        <span className="text-xs text-slate-400 font-medium">Loading Nivo Member Tiers...</span>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    department: d.department,
    'T1 Core': d.tier1Core,
    'T2 Strong': d.tier2Strong,
    'T3 Mod': d.tier3Moderate,
    'T4 Low': d.tier4DropOff,
    totalMembers: d.totalMembers,
  }));

  return (
    <div className={clsx('w-full relative', className)} style={{ height }}>
      <ResponsiveBar
        data={chartData as any}
        keys={['T1 Core', 'T2 Strong', 'T3 Mod', 'T4 Low']}
        indexBy="department"
        margin={{ top: 12, right: 20, bottom: 25, left: 140 }}
        padding={0.3}
        layout="horizontal"
        colors={['#10b981', '#3b82f6', '#f59e0b', '#f43f5e']}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 4,
          tickPadding: 4,
          tickRotation: 0,
          legend: 'Members by Engagement Tier',
          legendPosition: 'middle',
          legendOffset: 20,
        }}
        axisLeft={{
          tickSize: 4,
          tickPadding: 6,
          tickRotation: 0,
        }}
        enableGridX={true}
        enableGridY={false}
        labelTextColor="#ffffff"
        motionConfig="gentle"
        tooltip={({ id, value, color, data }) => (
          <div className="bg-slate-900 text-white rounded-lg p-2.5 shadow-xl border border-slate-700 text-xs space-y-1">
            <span className="font-bold text-white block">{data.department}</span>
            <div className="text-[11px] text-slate-300">
              <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: color }} />
              {id}: <strong>{value} members</strong> ({Math.round(((value as number) / (data.totalMembers as number)) * 100)}%)
            </div>
          </div>
        )}
      />
    </div>
  );
};
