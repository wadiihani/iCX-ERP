'use client';

import React, { useState, useEffect } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import clsx from 'clsx';

interface CountryYieldRecord {
  country: string;
  quota: number;
  delivered: number;
  pct: number;
}

interface NivoCountryYieldBarProps {
  data?: CountryYieldRecord[];
  height?: number;
  className?: string;
}

const DEFAULT_IR_DATA: CountryYieldRecord[] = [
  { country: 'AIESEC in France', quota: 16, delivered: 14, pct: 87.5 },
  { country: 'AIESEC in Italy', quota: 14, delivered: 12, pct: 85.7 },
  { country: 'AIESEC in Germany', quota: 12, delivered: 9, pct: 75.0 },
  { country: 'AIESEC in Brazil', quota: 10, delivered: 8, pct: 80.0 },
  { country: 'AIESEC in Japan', quota: 8, delivered: 5, pct: 62.5 },
];

export const NivoCountryYieldBar: React.FC<NivoCountryYieldBarProps> = ({
  data = DEFAULT_IR_DATA,
  height = 240,
  className,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = data.map((d) => ({
    countryShort: d.country.replace('AIESEC in ', ''),
    country: d.country,
    delivered: d.delivered,
    quota: d.quota,
    pct: d.pct,
  }));

  if (!mounted) {
    return (
      <div
        className={clsx('w-full rounded-xl bg-slate-50 flex items-center justify-center animate-pulse', className)}
        style={{ height }}
      >
        <span className="text-xs text-slate-400 font-medium">Loading Nivo Country Yields...</span>
      </div>
    );
  }

  return (
    <div className={clsx('w-full relative', className)} style={{ height }}>
      <ResponsiveBar
        data={chartData}
        keys={['delivered', 'quota']}
        indexBy="countryShort"
        groupMode="grouped"
        layout="horizontal"
        margin={{ top: 10, right: 30, bottom: 25, left: 80 }}
        padding={0.3}
        valueScale={{ type: 'linear' }}
        indexScale={{ type: 'band', round: true }}
        colors={({ id }) => (id === 'delivered' ? '#10b981' : '#6366f1')}
        borderColor={{ from: 'color', modifiers: [['darker', 0.6]] }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 4,
          tickPadding: 4,
          tickRotation: 0,
          legend: 'EPs (Delivered vs Quota)',
          legendPosition: 'middle',
          legendOffset: 20,
        }}
        axisLeft={{
          tickSize: 0,
          tickPadding: 8,
          tickRotation: 0,
        }}
        enableLabel={true}
        labelTextColor="#ffffff"
        motionConfig="gentle"
        tooltip={({ id, value, data }) => {
          const raw = data as any;
          return (
            <div className="bg-slate-900 text-white rounded-xl p-2.5 shadow-xl border border-slate-700 text-xs space-y-1 text-left min-w-[170px]">
              <span className="font-bold text-white block border-b border-slate-800 pb-1">
                {raw.country}
              </span>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Delivered EPs:</span>
                <strong className="text-emerald-400 font-mono">{raw.delivered}</strong>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Bilateral Quota:</span>
                <strong className="text-indigo-300 font-mono">{raw.quota}</strong>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-800 text-[11px]">
                <span className="text-slate-400">Fulfillment Yield:</span>
                <strong className="text-white font-mono">{raw.pct.toFixed(1)}%</strong>
              </div>
            </div>
          );
        }}
      />
    </div>
  );
};
