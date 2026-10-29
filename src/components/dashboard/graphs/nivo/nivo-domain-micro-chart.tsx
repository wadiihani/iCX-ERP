'use client';

import React, { useState, useEffect } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import clsx from 'clsx';
import { DomainCardSummary, DomainId } from '@/lib/dashboard/dashboard-types';

interface NivoDomainMicroChartProps {
  card: DomainCardSummary;
  height?: number;
  className?: string;
}

export const NivoDomainMicroChart: React.FC<NivoDomainMicroChartProps> = ({
  card,
  height = 36,
  className,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={clsx('w-full rounded bg-slate-50 animate-pulse mt-2 pt-2 border-t border-slate-100', className)}
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
        <div className="w-full mt-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium mb-1">
            <span className="flex items-center gap-1 font-semibold text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block" />
              Nivo Funnel Flow
            </span>
            <span className="font-bold text-emerald-600">CR: 17.4% (24/138)</span>
          </div>
          <div style={{ height }}>
            <ResponsiveBar
              data={data}
              keys={['APP', 'APD', 'RE']}
              indexBy="stage"
              layout="horizontal"
              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
              padding={0.1}
              colors={['#037ef3', '#6366f1', '#10b981']}
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
              theme={{
                labels: {
                  text: {
                    fontSize: 8,
                    fontWeight: 700,
                  },
                },
              }}
              tooltip={({ id, value, color }) => (
                <div className="bg-slate-900 text-white text-[10px] rounded px-2 py-1 shadow-md">
                  <span style={{ color }} className="font-bold mr-1">●</span>
                  {id}: <strong>{value} EPs</strong>
                </div>
              )}
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
        <div className="w-full mt-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium mb-1">
            <span className="flex items-center gap-1 font-semibold text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />
              Nivo Deal Velocity
            </span>
            <span className="font-bold text-slate-800">14 Signed / 84k MAD</span>
          </div>
          <div style={{ height }}>
            <ResponsiveBar
              data={data}
              keys={['Signed', 'Proposal', 'Meeting', 'Lead']}
              indexBy="stage"
              layout="horizontal"
              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
              padding={0.1}
              colors={['#10b981', '#3b82f6', '#f59e0b', '#94a3b8']}
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
              theme={{
                labels: {
                  text: {
                    fontSize: 8,
                    fontWeight: 700,
                  },
                },
              }}
              tooltip={({ id, value, color }) => (
                <div className="bg-slate-900 text-white text-[10px] rounded px-2 py-1 shadow-md">
                  <span style={{ color }} className="font-bold mr-1">●</span>
                  {id}: <strong>{value} Deals</strong>
                </div>
              )}
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
        <div className="w-full mt-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium mb-1">
            <span className="flex items-center gap-1 font-semibold text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 inline-block" />
              Nivo Slot Fill Rate
            </span>
            <span className="font-bold text-slate-800">78.0% (32/41 Filled)</span>
          </div>
          <div style={{ height }}>
            <ResponsiveBar
              data={data}
              keys={['Filled', 'Open']}
              indexBy="status"
              layout="horizontal"
              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
              padding={0.1}
              colors={['#10b981', '#cbd5e1']}
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
              theme={{
                labels: {
                  text: {
                    fontSize: 8,
                    fontWeight: 700,
                  },
                },
              }}
              tooltip={({ id, value, color }) => (
                <div className="bg-slate-900 text-white text-[10px] rounded px-2 py-1 shadow-md">
                  <span style={{ color }} className="font-bold mr-1">●</span>
                  {id}: <strong>{value} Slots</strong>
                </div>
              )}
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
        <div className="w-full mt-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium mb-1">
            <span className="flex items-center gap-1 font-semibold text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block" />
              Nivo IR Sourcing Share
            </span>
            <span className="font-bold text-blue-600">74% Direct IR Pipeline</span>
          </div>
          <div style={{ height }}>
            <ResponsiveBar
              data={data}
              keys={['France', 'Egypt', 'Tunisia', 'Algeria', 'Turkey']}
              indexBy="region"
              layout="horizontal"
              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
              padding={0.1}
              colors={['#037ef3', '#00a5d9', '#6366f1', '#a855f7', '#64748b']}
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
              theme={{
                labels: {
                  text: {
                    fontSize: 8,
                    fontWeight: 700,
                  },
                },
              }}
              tooltip={({ id, value, color }) => (
                <div className="bg-slate-900 text-white text-[10px] rounded px-2 py-1 shadow-md">
                  <span style={{ color }} className="font-bold mr-1">●</span>
                  {id}: <strong>{value}% of EPs</strong>
                </div>
              )}
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
        <div className="w-full mt-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium mb-1">
            <span className="flex items-center gap-1 font-semibold text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />
              Nivo 14-Day Lock Gate
            </span>
            <span className="font-bold text-emerald-600">92% Ready (1 Breach)</span>
          </div>
          <div style={{ height }}>
            <ResponsiveBar
              data={data}
              keys={['Ready', 'AtRisk']}
              indexBy="gate"
              layout="horizontal"
              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
              padding={0.1}
              colors={['#10b981', '#f43f5e']}
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
              theme={{
                labels: {
                  text: {
                    fontSize: 8,
                    fontWeight: 700,
                  },
                },
              }}
              tooltip={({ id, value, color }) => (
                <div className="bg-slate-900 text-white text-[10px] rounded px-2 py-1 shadow-md">
                  <span style={{ color }} className="font-bold mr-1">●</span>
                  {id}: <strong>{value}% EPs Compliant</strong>
                </div>
              )}
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
        <div className="w-full mt-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium mb-1">
            <span className="flex items-center gap-1 font-semibold text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600 inline-block" />
              Nivo 18 Standards
            </span>
            <span className="font-bold text-emerald-600">17/18 Met (94.4%)</span>
          </div>
          <div style={{ height }}>
            <ResponsiveBar
              data={data}
              keys={['Delivered', 'Pending']}
              indexBy="name"
              layout="horizontal"
              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
              padding={0.1}
              colors={['#10b981', '#f59e0b']}
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
              theme={{
                labels: {
                  text: {
                    fontSize: 8,
                    fontWeight: 700,
                  },
                },
              }}
              tooltip={({ id, value, color }) => (
                <div className="bg-slate-900 text-white text-[10px] rounded px-2 py-1 shadow-md">
                  <span style={{ color }} className="font-bold mr-1">●</span>
                  {id}: <strong>{value} of 18 Standards</strong>
                </div>
              )}
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
        <div className="w-full mt-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium mb-1">
            <span className="flex items-center gap-1 font-semibold text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-600 inline-block" />
              Nivo Bed Occupancy
            </span>
            <span className="font-bold text-slate-800">88.0% (Target 85%)</span>
          </div>
          <div style={{ height }}>
            <ResponsiveBar
              data={data}
              keys={['Occupied', 'Vacant']}
              indexBy="status"
              layout="horizontal"
              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
              padding={0.1}
              colors={['#0284c7', '#e2e8f0']}
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
              theme={{
                labels: {
                  text: {
                    fontSize: 8,
                    fontWeight: 700,
                  },
                },
              }}
              tooltip={({ id, value, color }) => (
                <div className="bg-slate-900 text-white text-[10px] rounded px-2 py-1 shadow-md">
                  <span style={{ color }} className="font-bold mr-1">●</span>
                  {id}: <strong>{value}% of Bed Capacity</strong>
                </div>
              )}
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
        <div className="w-full mt-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium mb-1">
            <span className="flex items-center gap-1 font-semibold text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />
              Nivo AFPM Sustainability
            </span>
            <span className="font-bold text-emerald-600">1.32x (Healthy &gt;1.0)</span>
          </div>
          <div style={{ height }}>
            <ResponsiveBar
              data={data}
              keys={['Covered', 'Surplus']}
              indexBy="cat"
              layout="horizontal"
              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
              padding={0.1}
              colors={['#059669', '#10b981']}
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
              theme={{
                labels: {
                  text: {
                    fontSize: 8,
                    fontWeight: 700,
                  },
                },
              }}
              tooltip={({ id, value, color }) => (
                <div className="bg-slate-900 text-white text-[10px] rounded px-2 py-1 shadow-md">
                  <span style={{ color }} className="font-bold mr-1">●</span>
                  {id}: <strong>{value}% AFPM Coverage</strong>
                </div>
              )}
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
        <div className="w-full mt-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium mb-1">
            <span className="flex items-center gap-1 font-semibold text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block" />
              Nivo 4-Tier Engagement
            </span>
            <span className="font-bold text-emerald-600">83% Active (T1+T2)</span>
          </div>
          <div style={{ height }}>
            <ResponsiveBar
              data={data}
              keys={['T1_Core', 'T2_Strong', 'T3_Mod', 'T4_Low']}
              indexBy="tier"
              layout="horizontal"
              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
              padding={0.1}
              colors={['#10b981', '#3b82f6', '#f59e0b', '#f43f5e']}
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
              theme={{
                labels: {
                  text: {
                    fontSize: 8,
                    fontWeight: 700,
                  },
                },
              }}
              tooltip={({ id, value, color }) => (
                <div className="bg-slate-900 text-white text-[10px] rounded px-2 py-1 shadow-md">
                  <span style={{ color }} className="font-bold mr-1">●</span>
                  {id}: <strong>{value}% of LCP/LCVP/Members</strong>
                </div>
              )}
            />
          </div>
        </div>
      );
    }

    default:
      return null;
  }
};
