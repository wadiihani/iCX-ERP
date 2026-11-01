'use client';

import React, { useState, useEffect } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import clsx from 'clsx';
import { DomainCardSummary } from '@/lib/dashboard/dashboard-types';

interface NivoDomainMicroChartProps {
  card: DomainCardSummary;
  height?: number;
  className?: string;
}

const nivoTheme = {
  labels: {
    text: {
      fontSize: 8.5,
      fontWeight: 600,
      fontFamily: 'inherit',
    },
  },
};

const renderTooltip = (label: string, value: string | number, color: string, unit: string) => (
  <div className="bg-slate-900 text-white text-[11px] rounded-md px-2.5 py-1 border border-slate-700 flex items-center gap-1.5 font-medium">
    <span style={{ backgroundColor: color }} className="w-2 h-2 rounded-full inline-block shrink-0" />
    <span>{label}:</span>
    <strong className="tabular-nums font-mono text-white">{value} {unit}</strong>
  </div>
);

export const NivoDomainMicroChart: React.FC<NivoDomainMicroChartProps> = ({
  card,
  height = 42,
  className,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={clsx('w-full rounded bg-slate-50 dark:bg-slate-800/50 animate-pulse mt-2 pt-2 border-t border-slate-100 dark:border-slate-800', className)}
        style={{ height }}
      />
    );
  }

  switch (card.id) {
    case 'funnel': {
      const data = [
        {
          stage: 'Funnel',
          APP: 138,
          APD: 31,
          RE: 24,
        },
      ];
      return (
        <div className="w-full mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-medium mb-1">
            <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block" />
              EP Conversion
            </span>
            <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
              24 realized · 17.4%
            </span>
          </div>
          <div style={{ height }}>
            <ResponsiveBar
              data={data}
              keys={['APP', 'APD', 'RE']}
              indexBy="stage"
              layout="horizontal"
              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
              padding={0.12}
              borderRadius={2}
              colors={['#2563eb', '#6366f1', '#059669']}
              enableGridX={false}
              enableGridY={false}
              axisTop={null}
              axisRight={null}
              axisBottom={null}
              axisLeft={null}
              enableLabel={true}
              label={({ id, value }) => `${id}: ${value}`}
              labelTextColor="#ffffff"
              motionConfig="gentle"
              theme={nivoTheme}
              tooltip={({ id, value, color }) => renderTooltip(String(id), Number(value), color, 'EPs')}
            />
          </div>
        </div>
      );
    }

    case 'b2b': {
      const data = [
        {
          stage: 'Pipeline',
          Signed: 14,
          Proposal: 6,
          Meeting: 5,
          Lead: 4,
        },
      ];
      return (
        <div className="w-full mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-medium mb-1">
            <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />
              Sales Deals
            </span>
            <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
              14 signed · 84k MAD
            </span>
          </div>
          <div style={{ height }}>
            <ResponsiveBar
              data={data}
              keys={['Signed', 'Proposal', 'Meeting', 'Lead']}
              indexBy="stage"
              layout="horizontal"
              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
              padding={0.12}
              borderRadius={2}
              colors={['#059669', '#2563eb', '#d97706', '#94a3b8']}
              enableGridX={false}
              enableGridY={false}
              axisTop={null}
              axisRight={null}
              axisBottom={null}
              axisLeft={null}
              enableLabel={true}
              label={({ id, value }) => `${id}: ${value}`}
              labelTextColor="#ffffff"
              motionConfig="gentle"
              theme={nivoTheme}
              tooltip={({ id, value, color }) => renderTooltip(String(id), Number(value), color, 'Deals')}
            />
          </div>
        </div>
      );
    }

    case 'opps': {
      const data = [
        {
          status: 'Slots',
          Filled: 32,
          Open: 9,
        },
      ];
      return (
        <div className="w-full mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-medium mb-1">
            <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 inline-block" />
              Opportunity Slots
            </span>
            <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
              32 of 41 slots · 78%
            </span>
          </div>
          <div style={{ height }}>
            <ResponsiveBar
              data={data}
              keys={['Filled', 'Open']}
              indexBy="status"
              layout="horizontal"
              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
              padding={0.12}
              borderRadius={2}
              colors={['#059669', '#cbd5e1']}
              enableGridX={false}
              enableGridY={false}
              axisTop={null}
              axisRight={null}
              axisBottom={null}
              axisLeft={null}
              enableLabel={true}
              label={({ id, value }) => `${id}: ${value}`}
              labelTextColor={(bar: any) => (bar.id === 'Open' ? '#475569' : '#ffffff')}
              motionConfig="gentle"
              theme={nivoTheme}
              tooltip={({ id, value, color }) => renderTooltip(String(id), Number(value), color, 'Slots')}
            />
          </div>
        </div>
      );
    }

    case 'ir': {
      const data = [
        {
          region: 'Supply',
          France: 35,
          Egypt: 25,
          Tunisia: 20,
          Algeria: 12,
          Turkey: 8,
        },
      ];
      return (
        <div className="w-full mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-medium mb-1">
            <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block" />
              IR Sourcing
            </span>
            <span className="font-mono font-semibold text-blue-600 dark:text-blue-400 tabular-nums">
              74% direct · France leads
            </span>
          </div>
          <div style={{ height }}>
            <ResponsiveBar
              data={data}
              keys={['France', 'Egypt', 'Tunisia', 'Algeria', 'Turkey']}
              indexBy="region"
              layout="horizontal"
              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
              padding={0.12}
              borderRadius={2}
              colors={['#2563eb', '#0284c7', '#6366f1', '#9333ea', '#64748b']}
              enableGridX={false}
              enableGridY={false}
              axisTop={null}
              axisRight={null}
              axisBottom={null}
              axisLeft={null}
              enableLabel={true}
              label={({ id, value }) => `${id.toString().slice(0, 2).toUpperCase()}: ${value}%`}
              labelTextColor="#ffffff"
              motionConfig="gentle"
              theme={nivoTheme}
              tooltip={({ id, value, color }) => renderTooltip(String(id), Number(value), color, '% EPs')}
            />
          </div>
        </div>
      );
    }

    case 'visa': {
      const data = [
        {
          gate: 'Readiness',
          Ready: 92,
          AtRisk: 8,
        },
      ];
      return (
        <div className="w-full mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-medium mb-1">
            <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />
              Visa &amp; 14-Day Lock
            </span>
            <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
              92% ready · 1 pending
            </span>
          </div>
          <div style={{ height }}>
            <ResponsiveBar
              data={data}
              keys={['Ready', 'AtRisk']}
              indexBy="gate"
              layout="horizontal"
              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
              padding={0.12}
              borderRadius={2}
              colors={['#059669', '#dc2626']}
              enableGridX={false}
              enableGridY={false}
              axisTop={null}
              axisRight={null}
              axisBottom={null}
              axisLeft={null}
              enableLabel={true}
              label={({ id, value }) => `${id}: ${value}%`}
              labelTextColor="#ffffff"
              motionConfig="gentle"
              theme={nivoTheme}
              tooltip={({ id, value, color }) => renderTooltip(String(id), Number(value), color, '%')}
            />
          </div>
        </div>
      );
    }

    case 'cxp': {
      const data = [
        {
          name: '18 Standards',
          Delivered: 17,
          Pending: 1,
        },
      ];
      return (
        <div className="w-full mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-medium mb-1">
            <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600 inline-block" />
              18 Standards
            </span>
            <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
              17 of 18 met · 94.4%
            </span>
          </div>
          <div style={{ height }}>
            <ResponsiveBar
              data={data}
              keys={['Delivered', 'Pending']}
              indexBy="name"
              layout="horizontal"
              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
              padding={0.12}
              borderRadius={2}
              colors={['#059669', '#d97706']}
              enableGridX={false}
              enableGridY={false}
              axisTop={null}
              axisRight={null}
              axisBottom={null}
              axisLeft={null}
              enableLabel={true}
              label={({ id, value }) => `${id}: ${value}`}
              labelTextColor="#ffffff"
              motionConfig="gentle"
              theme={nivoTheme}
              tooltip={({ id, value, color }) => renderTooltip(String(id), Number(value), color, 'Standards')}
            />
          </div>
        </div>
      );
    }

    case 'housing': {
      const data = [
        {
          status: 'Beds',
          Occupied: 88,
          Vacant: 12,
        },
      ];
      return (
        <div className="w-full mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-medium mb-1">
            <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-600 inline-block" />
              Bed Occupancy
            </span>
            <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
              88% booked · Target 85%
            </span>
          </div>
          <div style={{ height }}>
            <ResponsiveBar
              data={data}
              keys={['Occupied', 'Vacant']}
              indexBy="status"
              layout="horizontal"
              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
              padding={0.12}
              borderRadius={2}
              colors={['#0284c7', '#cbd5e1']}
              enableGridX={false}
              enableGridY={false}
              axisTop={null}
              axisRight={null}
              axisBottom={null}
              axisLeft={null}
              enableLabel={true}
              label={({ id, value }) => `${id}: ${value}%`}
              labelTextColor={(bar: any) => (bar.id === 'Vacant' ? '#475569' : '#ffffff')}
              motionConfig="gentle"
              theme={nivoTheme}
              tooltip={({ id, value, color }) => renderTooltip(String(id), Number(value), color, '% Beds')}
            />
          </div>
        </div>
      );
    }

    case 'finance': {
      const data = [
        {
          cat: 'Ratio',
          Covered: 76,
          Surplus: 24,
        },
      ];
      return (
        <div className="w-full mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-medium mb-1">
            <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />
              Sustainability
            </span>
            <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
              1.32x ratio · +29.2k MAD
            </span>
          </div>
          <div style={{ height }}>
            <ResponsiveBar
              data={data}
              keys={['Covered', 'Surplus']}
              indexBy="cat"
              layout="horizontal"
              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
              padding={0.12}
              borderRadius={2}
              colors={['#047857', '#10b981']}
              enableGridX={false}
              enableGridY={false}
              axisTop={null}
              axisRight={null}
              axisBottom={null}
              axisLeft={null}
              enableLabel={true}
              label={({ id, value }) => `${id}: ${value}%`}
              labelTextColor="#ffffff"
              motionConfig="gentle"
              theme={nivoTheme}
              tooltip={({ id, value, color }) => renderTooltip(String(id), Number(value), color, '% Ratio')}
            />
          </div>
        </div>
      );
    }

    case 'members': {
      const data = [
        {
          tier: 'Engagement',
          T1_Core: 54,
          T2_Strong: 29,
          T3_Mod: 12,
          T4_Low: 5,
        },
      ];
      return (
        <div className="w-full mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-medium mb-1">
            <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block" />
              Team Engagement
            </span>
            <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
              83% active · 42 of 51
            </span>
          </div>
          <div style={{ height }}>
            <ResponsiveBar
              data={data}
              keys={['T1_Core', 'T2_Strong', 'T3_Mod', 'T4_Low']}
              indexBy="tier"
              layout="horizontal"
              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
              padding={0.12}
              borderRadius={2}
              colors={['#059669', '#2563eb', '#d97706', '#dc2626']}
              enableGridX={false}
              enableGridY={false}
              axisTop={null}
              axisRight={null}
              axisBottom={null}
              axisLeft={null}
              enableLabel={true}
              label={({ id, value }) => `${id.toString().split('_')[0]}: ${value}%`}
              labelTextColor="#ffffff"
              motionConfig="gentle"
              theme={nivoTheme}
              tooltip={({ id, value, color }) => renderTooltip(String(id), Number(value), color, '% Team')}
            />
          </div>
        </div>
      );
    }

    default:
      return null;
  }
};
