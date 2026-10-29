'use client';

import React, { useState, useEffect } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import clsx from 'clsx';

export interface StandardClusterData {
  cluster: string;
  mandatoryPass: number;
  mandatoryWarn: number;
  electivePass: number;
  totalStandards: number;
}

const DEFAULT_STANDARDS_DATA: StandardClusterData[] = [
  {
    cluster: 'Preparation (S1–S5)',
    mandatoryPass: 4,
    mandatoryWarn: 1,
    electivePass: 0,
    totalStandards: 5,
  },
  {
    cluster: 'Experience & JD (S6–S13)',
    mandatoryPass: 7,
    mandatoryWarn: 1,
    electivePass: 0,
    totalStandards: 8,
  },
  {
    cluster: 'Post-Experience (S14–S18)',
    mandatoryPass: 3,
    mandatoryWarn: 0,
    electivePass: 2,
    totalStandards: 5,
  },
];

interface NivoStandardsBarProps {
  data?: StandardClusterData[];
  height?: number;
  className?: string;
}

export const NivoStandardsBar: React.FC<NivoStandardsBarProps> = ({
  data = DEFAULT_STANDARDS_DATA,
  height = 200,
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
        <span className="text-xs text-slate-400 font-medium">Loading Nivo Standards Matrix...</span>
      </div>
    );
  }

  return (
    <div className={clsx('w-full relative', className)} style={{ height }}>
      <ResponsiveBar
        data={data as any}
        keys={['mandatoryPass', 'mandatoryWarn', 'electivePass']}
        indexBy="cluster"
        margin={{ top: 12, right: 24, bottom: 28, left: 140 }}
        padding={0.3}
        layout="horizontal"
        valueScale={{ type: 'linear' }}
        indexScale={{ type: 'band', round: true }}
        colors={({ id }) => {
          if (id === 'mandatoryPass') return '#10b981';
          if (id === 'mandatoryWarn') return '#f59e0b';
          return '#3b82f6';
        }}
        borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 4,
          tickPadding: 4,
          tickRotation: 0,
          legend: 'Standards Count',
          legendPosition: 'middle',
          legendOffset: 24,
        }}
        axisLeft={{
          tickSize: 4,
          tickPadding: 6,
          tickRotation: 0,
        }}
        enableGridY={false}
        enableGridX={true}
        labelTextColor="#ffffff"
        motionConfig="gentle"
        tooltip={({ id, value, color, data }) => (
          <div className="bg-slate-900 text-white rounded-lg p-2.5 shadow-xl border border-slate-700 text-xs space-y-1">
            <div className="font-bold border-b border-slate-800 pb-1">
              {data.cluster}
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              <span className="capitalize">{id === 'mandatoryPass' ? 'Mandatory Passed' : id === 'mandatoryWarn' ? 'Under Review / Warning' : 'Elective Fulfilled'}:</span>
              <strong>{value} of {data.totalStandards}</strong>
            </div>
          </div>
        )}
      />
    </div>
  );
};
