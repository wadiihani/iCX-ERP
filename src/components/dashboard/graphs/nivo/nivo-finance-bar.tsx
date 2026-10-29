'use client';

import React, { useState, useEffect } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import clsx from 'clsx';

export interface FinanceFlowItem {
  category: string;
  amount: number;
  type: 'inflow' | 'outflow' | 'surplus';
}

const DEFAULT_FINANCE_DATA: FinanceFlowItem[] = [
  { category: 'B2B Contracts', amount: 54, type: 'inflow' },
  { category: 'EP Fees', amount: 24, type: 'inflow' },
  { category: 'CSR Grants', amount: 6, type: 'inflow' },
  { category: 'Housing Rent', amount: -27.6, type: 'outflow' },
  { category: 'Transit/Pickup', amount: -6.5, type: 'outflow' },
  { category: 'Partner Costs', amount: -8.2, type: 'outflow' },
  { category: 'MC Royalties', amount: -12.5, type: 'outflow' },
  { category: 'Net Surplus', amount: 29.2, type: 'surplus' },
];

interface NivoFinanceBarProps {
  data?: FinanceFlowItem[];
  height?: number;
  className?: string;
}

export const NivoFinanceBar: React.FC<NivoFinanceBarProps> = ({
  data = DEFAULT_FINANCE_DATA,
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
        <span className="text-xs text-slate-400 font-medium">Loading Nivo Finance Flow...</span>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    category: d.category,
    amount: d.amount,
    type: d.type,
  }));

  return (
    <div className={clsx('w-full relative', className)} style={{ height }}>
      <ResponsiveBar
        data={chartData as any}
        keys={['amount']}
        indexBy="category"
        margin={{ top: 12, right: 16, bottom: 35, left: 45 }}
        padding={0.3}
        colors={({ data }) => {
          if (data.type === 'inflow') return '#10b981';
          if (data.type === 'outflow') return '#f43f5e';
          return '#059669';
        }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 4,
          tickPadding: 4,
          tickRotation: -20,
        }}
        axisLeft={{
          tickSize: 4,
          tickPadding: 4,
          tickRotation: 0,
          legend: 'k MAD',
          legendPosition: 'middle',
          legendOffset: -38,
        }}
        enableGridX={false}
        enableGridY={true}
        label={({ value }) => (value != null ? `${Number(value) > 0 ? '+' : ''}${value}k` : '')}
        labelTextColor="#ffffff"
        motionConfig="gentle"
        tooltip={({ data }: any) => (
          <div className="bg-slate-900 text-white rounded-lg p-2.5 shadow-xl border border-slate-700 text-xs space-y-1">
            <span className="font-bold text-white block">{data.category}</span>
            <div className="text-[11px] text-slate-300">
              Amount: <strong className={Number(data.amount) >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {Number(data.amount) >= 0 ? `+${data.amount}` : data.amount}k MAD
              </strong> ({String(data.type).toUpperCase()})
            </div>
          </div>
        )}
      />
    </div>
  );
};
