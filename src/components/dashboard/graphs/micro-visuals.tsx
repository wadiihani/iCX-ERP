'use client';

import React from 'react';
import clsx from 'clsx';
import { DomainCardSummary } from '@/lib/dashboard/dashboard-types';

interface MicroVisualProps {
  card: DomainCardSummary;
}

export const DomainCardMicroVisual: React.FC<MicroVisualProps> = ({ card }) => {
  const mv = card.microVisual;

  switch (card.id) {
    case 'funnel': {
      // Mini Horizontal Funnel Bar
      const steps = [
        { label: 'APP', val: 138, pct: 100, color: 'bg-blue-600' },
        { label: 'APD', val: 31, pct: 35, color: 'bg-indigo-600' },
        { label: 'RE', val: 24, pct: 26, color: 'bg-emerald-600' },
      ];
      return (
        <div className="w-full space-y-1 mt-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
            <span>Funnel Flow</span>
            <span className="font-bold text-emerald-600">CR: 17.4%</span>
          </div>
          <div className="flex items-center gap-1.5 h-3">
            {steps.map((st) => (
              <div
                key={st.label}
                className={clsx('h-full rounded-sm flex items-center justify-center text-[8px] font-bold text-white', st.color)}
                style={{ width: `${st.pct}%` }}
                title={`${st.label}: ${st.val}`}
              >
                {st.label}
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'b2b': {
      // Mini Pipeline Stacked Bar
      return (
        <div className="w-full space-y-1 mt-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
            <span>Sales Stages</span>
            <span className="font-bold text-slate-700">14 Signed / 84k MAD</span>
          </div>
          <div className="flex h-3 rounded-sm overflow-hidden bg-slate-100">
            <div className="bg-emerald-600 h-full" style={{ width: '48%' }} title="Signed: 14" />
            <div className="bg-blue-500 h-full" style={{ width: '22%' }} title="Proposal: 6" />
            <div className="bg-amber-400 h-full" style={{ width: '18%' }} title="Meeting: 5" />
            <div className="bg-slate-400 h-full" style={{ width: '12%' }} title="Lead: 4" />
          </div>
        </div>
      );
    }

    case 'opps': {
      // Mini Capacity Bar
      return (
        <div className="w-full space-y-1 mt-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
            <span>Slot Fill Rate</span>
            <span className="font-bold text-slate-800">78% (32/41 Filled)</span>
          </div>
          <div className="h-3 w-full bg-slate-100 rounded-sm overflow-hidden flex">
            <div className="bg-emerald-600 h-full" style={{ width: '78%' }} />
            <div className="bg-slate-300 h-full" style={{ width: '22%' }} />
          </div>
        </div>
      );
    }

    case 'ir': {
      // Top 5 Supply Countries Bar
      const countries = [
        { c: 'FR', v: 35 },
        { c: 'EG', v: 25 },
        { c: 'TN', v: 20 },
        { c: 'DZ', v: 12 },
        { c: 'TR', v: 8 },
      ];
      return (
        <div className="w-full space-y-1 mt-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
            <span>Top IR Supply</span>
            <span className="font-bold text-blue-600">74% from IR</span>
          </div>
          <div className="flex items-center gap-1 h-3">
            {countries.map((c, i) => (
              <div
                key={c.c}
                className={clsx(
                  'h-full rounded-xs flex items-center justify-center text-[8px] font-bold text-white',
                  i === 0 ? 'bg-blue-600' : i === 1 ? 'bg-blue-500' : 'bg-slate-400'
                )}
                style={{ width: `${c.v}%` }}
                title={`${c.c}: ${c.v}%`}
              >
                {c.c}
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'visa': {
      // 14-Day Lock Readiness Strip
      return (
        <div className="w-full space-y-1 mt-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
            <span>14-Day Lock Gate</span>
            <span className="font-bold text-emerald-600">92% Ready (1 Breach)</span>
          </div>
          <div className="flex h-3 gap-0.5">
            <div className="bg-emerald-500 flex-1 rounded-xs" title="Pack sent ≤14d: 100%" />
            <div className="bg-emerald-500 flex-1 rounded-xs" title="Flight confirmed: 96%" />
            <div className="bg-emerald-500 flex-1 rounded-xs" title="Host vetted: 100%" />
            <div className="bg-emerald-500 flex-1 rounded-xs" title="Buddy assigned: 100%" />
            <div className="bg-rose-500 w-4 rounded-xs flex items-center justify-center text-white text-[8px] font-bold" title="1 EP Visa pending <14d">
              !
            </div>
          </div>
        </div>
      );
    }

    case 'cxp': {
      // 18-Block Mini Standards Strip
      return (
        <div className="w-full space-y-1 mt-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
            <span>18 Exchange Standards</span>
            <span className="font-bold text-emerald-600">17/18 Met (96%)</span>
          </div>
          <div className="grid grid-cols-9 gap-0.5">
            {Array.from({ length: 18 }).map((_, idx) => (
              <div
                key={idx}
                className={clsx(
                  'h-2 rounded-2xs',
                  idx === 6 ? 'bg-amber-400' : 'bg-emerald-500'
                )}
                title={`Std #${idx + 1}: ${idx === 6 ? 'Warning (S7 Acc)' : 'Passed'}`}
              />
            ))}
          </div>
        </div>
      );
    }

    case 'housing': {
      // Bed Occupancy Bullet Bar
      return (
        <div className="w-full space-y-1 mt-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
            <span>Bed Occupancy</span>
            <span className="font-bold text-slate-800">88% (Target 85%)</span>
          </div>
          <div className="relative h-3 bg-slate-100 rounded-sm overflow-hidden">
            <div className="h-full bg-blue-600 rounded-r-xs" style={{ width: '88%' }} />
            <div className="absolute top-0 bottom-0 w-0.5 bg-slate-900 z-10" style={{ left: '85%' }} title="Target: 85%" />
          </div>
        </div>
      );
    }

    case 'finance': {
      // AFPM Sustainability Ratio Bar
      return (
        <div className="w-full space-y-1 mt-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
            <span>AFPM Sustainability Ratio</span>
            <span className="font-bold text-emerald-600">1.32x (Pass &gt;1.0)</span>
          </div>
          <div className="relative h-3 bg-slate-100 rounded-sm overflow-hidden">
            <div className="h-full bg-emerald-600 rounded-r-xs" style={{ width: '82%' }} />
            <div className="absolute top-0 bottom-0 w-0.5 bg-rose-600 z-10" style={{ left: '60%' }} title="Break-even: 1.0x" />
          </div>
        </div>
      );
    }

    case 'members': {
      // 4-Tier Engagement Bar
      return (
        <div className="w-full space-y-1 mt-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
            <span>4-Tier Engagement</span>
            <span className="font-bold text-emerald-600">83% Active (T1+T2)</span>
          </div>
          <div className="flex h-3 rounded-sm overflow-hidden bg-slate-100">
            <div className="bg-emerald-500 h-full" style={{ width: '54%' }} title="Tier 1 Core (90-100%): 54%" />
            <div className="bg-blue-500 h-full" style={{ width: '29%' }} title="Tier 2 Strong (70-89%): 29%" />
            <div className="bg-amber-400 h-full" style={{ width: '12%' }} title="Tier 3 Moderate (20-69%): 12%" />
            <div className="bg-rose-500 h-full" style={{ width: '5%' }} title="Tier 4 Drop-off (<20%): 5%" />
          </div>
        </div>
      );
    }

    default:
      return null;
  }
};
