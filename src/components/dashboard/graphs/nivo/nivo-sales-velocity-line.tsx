'use client';

import React, { useState, useEffect } from 'react';
import { ResponsiveLine } from '@nivo/line';
import clsx from 'clsx';

interface SalesSeries {
  id: string;
  color: string;
  data: Array<{ x: string; y: number }>;
}

interface NivoSalesVelocityLineProps {
  height?: number;
  className?: string;
}

export const NivoSalesVelocityLine: React.FC<NivoSalesVelocityLineProps> = ({
  height = 180,
  className,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const lineData: SalesSeries[] = [
    {
      id: 'Meetings Held',
      color: '#037ef3',
      data: [
        { x: 'W1', y: 3 },
        { x: 'W2', y: 5 },
        { x: 'W3', y: 8 },
        { x: 'W4', y: 9 },
        { x: 'W5', y: 11 },
        { x: 'W6', y: 12 },
        { x: 'W7', y: 14 },
      ],
    },
    {
      id: 'Proposals Sent',
      color: '#8b5cf6',
      data: [
        { x: 'W1', y: 1 },
        { x: 'W2', y: 2 },
        { x: 'W3', y: 4 },
        { x: 'W4', y: 5 },
        { x: 'W5', y: 6 },
        { x: 'W6', y: 7 },
        { x: 'W7', y: 8 },
      ],
    },
    {
      id: 'Signed Agreements',
      color: '#10b981',
      data: [
        { x: 'W1', y: 0 },
        { x: 'W2', y: 1 },
        { x: 'W3', y: 2 },
        { x: 'W4', y: 3 },
        { x: 'W5', y: 4 },
        { x: 'W6', y: 5 },
        { x: 'W7', y: 6 },
      ],
    },
  ];

  if (!mounted) {
    return (
      <div
        className={clsx('w-full rounded-xl bg-slate-50 flex items-center justify-center animate-pulse', className)}
        style={{ height }}
      >
        <span className="text-xs text-slate-400 font-medium">Loading Nivo Sales Velocity...</span>
      </div>
    );
  }

  return (
    <div className={clsx('w-full relative', className)} style={{ height }}>
      <ResponsiveLine
        data={lineData}
        margin={{ top: 12, right: 20, bottom: 25, left: 35 }}
        xScale={{ type: 'point' }}
        yScale={{ type: 'linear', min: 0, max: 'auto', stacked: false }}
        curve="monotoneX"
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 4,
          tickPadding: 4,
          tickRotation: 0,
        }}
        axisLeft={{
          tickSize: 4,
          tickPadding: 4,
          tickRotation: 0,
        }}
        colors={['#037ef3', '#8b5cf6', '#10b981']}
        pointSize={6}
        pointColor={{ theme: 'background' }}
        pointBorderWidth={2}
        pointBorderColor={{ from: 'color' }}
        pointLabelYOffset={-12}
        enableArea={true}
        areaOpacity={0.12}
        useMesh={true}
        motionConfig="gentle"
        tooltip={({ point }: { point: any }) => (
          <div className="bg-slate-900 text-white rounded-lg p-2.5 shadow-xl border border-slate-700 text-xs space-y-1">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: point.seriesColor || point.color }}
              />
              <span className="font-bold text-white">{point.seriesId || point.id}</span>
            </div>
            <div className="text-[11px] text-slate-300">
              Week: <strong className="text-white">{point.data.xFormatted}</strong> · Cumulative:{' '}
              <strong className="text-white">{point.data.yFormatted} deals</strong>
            </div>
          </div>
        )}
      />
    </div>
  );
};
