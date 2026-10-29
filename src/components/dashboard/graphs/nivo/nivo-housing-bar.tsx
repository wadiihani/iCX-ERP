'use client';

import React, { useState, useEffect } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import clsx from 'clsx';

export interface PropertyOccupancyItem {
  property: string;
  occupiedBeds: number;
  vacantBeds: number;
  ratePct: number;
  costMad: number;
}

const DEFAULT_HOUSING_DATA: PropertyOccupancyItem[] = [
  { property: 'Villa Agdal A', occupiedBeds: 8, vacantBeds: 0, ratePct: 100, costMad: 1150 },
  { property: 'Apt Hassan B', occupiedBeds: 7, vacantBeds: 1, ratePct: 87.5, costMad: 1050 },
  { property: 'Salé Marina', occupiedBeds: 5, vacantBeds: 3, ratePct: 62.5, costMad: 1450 },
  { property: 'Hay Riad Villa', occupiedBeds: 8, vacantBeds: 0, ratePct: 100, costMad: 1200 },
];

interface NivoHousingBarProps {
  data?: PropertyOccupancyItem[];
  height?: number;
  className?: string;
}

export const NivoHousingBar: React.FC<NivoHousingBarProps> = ({
  data = DEFAULT_HOUSING_DATA,
  height = 190,
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
        <span className="text-xs text-slate-400 font-medium">Loading Nivo Housing Bar...</span>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    property: d.property,
    occupiedBeds: d.occupiedBeds,
    vacantBeds: d.vacantBeds,
    ratePct: d.ratePct,
    costMad: d.costMad,
  }));

  return (
    <div className={clsx('w-full relative', className)} style={{ height }}>
      <ResponsiveBar
        data={chartData as any}
        keys={['occupiedBeds', 'vacantBeds']}
        indexBy="property"
        margin={{ top: 12, right: 20, bottom: 25, left: 100 }}
        padding={0.3}
        layout="horizontal"
        colors={['#0284c7', '#cbd5e1']}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 4,
          tickPadding: 4,
          tickRotation: 0,
          legend: 'Total Bed Count',
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
        labelTextColor={(bar: any) => (bar.id === 'vacantBeds' ? '#475569' : '#ffffff')}
        motionConfig="gentle"
        tooltip={({ id, value, color, data }) => (
          <div className="bg-slate-900 text-white rounded-lg p-2.5 shadow-xl border border-slate-700 text-xs space-y-1">
            <span className="font-bold text-white block">{data.property}</span>
            <div className="text-[11px] text-slate-300">
              <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: color }} />
              {id === 'occupiedBeds' ? 'Occupied' : 'Vacant'}: <strong>{value} beds</strong>
            </div>
            <div className="text-[10px] text-slate-400 border-t border-slate-800 pt-1">
              Fill Rate: <strong>{data.ratePct}%</strong> · Cost/Bed: <strong>{data.costMad} MAD/mo</strong>
            </div>
          </div>
        )}
      />
    </div>
  );
};
