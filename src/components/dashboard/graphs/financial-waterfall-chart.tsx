'use client';

import React from 'react';
import clsx from 'clsx';
import { DollarSign, ShieldCheck, AlertCircle } from 'lucide-react';

export interface WaterfallStep {
  id: string;
  label: string;
  amount: number; // positive for inflows/totals, negative for costs
  type: 'inflow' | 'outflow' | 'subtotal' | 'total';
  note?: string;
}

interface FinancialWaterfallChartProps {
  steps: WaterfallStep[];
  sustainabilityRatio?: number;
  currency?: string;
  title?: string;
  subtitle?: string;
  className?: string;
}

export const FinancialWaterfallChart: React.FC<FinancialWaterfallChartProps> = ({
  steps,
  sustainabilityRatio = 1.32,
  currency = 'MAD',
  title = 'AFPM Financial Waterfall & Exchange Sustainability',
  subtitle = 'Cash inflows, direct operational deductions, and net retained surplus',
  className,
}) => {
  if (!steps || steps.length === 0) return null;

  // Calculate cumulative heights for waterfall
  let runningTotal = 0;
  const computedSteps = steps.map((s) => {
    const prev = runningTotal;
    if (s.type === 'total' || s.type === 'subtotal') {
      runningTotal = s.amount;
      return {
        ...s,
        start: 0,
        end: s.amount,
        isTotal: true,
      };
    } else {
      runningTotal += s.amount;
      return {
        ...s,
        start: s.amount >= 0 ? prev : runningTotal,
        end: s.amount >= 0 ? runningTotal : prev,
        isTotal: false,
      };
    }
  });

  const maxVal = Math.max(
    ...computedSteps.map((s) => Math.max(s.start, s.end, Math.abs(s.amount))),
    1000
  );

  const isSustainable = sustainabilityRatio >= 1.0;

  return (
    <div className={clsx('rounded-xl border border-slate-200 bg-white p-5 shadow-sm', className)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>

        {sustainabilityRatio !== undefined && (
          <div
            className={clsx(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold shadow-xs',
              isSustainable
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-rose-50 text-rose-800 border-rose-300'
            )}
          >
            {isSustainable ? (
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>AFPM Sustainability: {sustainabilityRatio.toFixed(2)}x</span>
            <span className="text-[10px] font-normal opacity-85">
              ({isSustainable ? '≥ 1.0 Break-Even Pass' : 'Deficit Risk'})
            </span>
          </div>
        )}
      </div>

      {/* Waterfall Graphic Bars Container */}
      <div className="min-w-[550px] overflow-x-auto pt-4 pb-2">
        <div className="h-56 flex items-end gap-3 px-4 border-b border-slate-200 relative">
          {/* Zero baseline */}
          <div className="absolute left-0 right-0 bottom-0 border-b border-slate-300" />

          {computedSteps.map((step) => {
            const barHeightPct = Math.max(
              8,
              (Math.abs(step.end - step.start) / maxVal) * 100
            );
            const bottomOffsetPct = (Math.max(0, step.start) / maxVal) * 100;

            const isPositive = step.amount >= 0;
            const bgClass = step.isTotal
              ? 'bg-blue-600 text-white'
              : isPositive
              ? 'bg-emerald-600 text-white'
              : 'bg-rose-600 text-white';

            return (
              <div
                key={step.id}
                className="flex-1 flex flex-col items-center h-full justify-end relative group"
              >
                {/* Floating waterfall bar */}
                <div
                  className="w-full relative flex items-center justify-center transition-all duration-300"
                  style={{
                    height: `${barHeightPct}%`,
                    marginBottom: `${bottomOffsetPct * 1.5}px`,
                  }}
                >
                  <div
                    className={clsx(
                      'w-full h-full rounded-md shadow-sm flex flex-col items-center justify-center p-1 text-center font-bold text-xs',
                      bgClass
                    )}
                  >
                    <span>
                      {step.amount > 0 && !step.isTotal ? '+' : ''}
                      {step.amount.toLocaleString()}
                    </span>
                    <span className="text-[9px] font-normal opacity-80">{currency}</span>
                  </div>
                </div>

                {/* Column Label */}
                <div className="text-center mt-2 w-full">
                  <span
                    className="text-[11px] font-semibold text-slate-800 block truncate"
                    title={step.label}
                  >
                    {step.label}
                  </span>
                  {step.note && (
                    <span className="text-[9px] text-slate-400 block truncate">{step.note}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 mt-3 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-600 inline-block" />
            <span className="text-[11px]">Gross Inflows (+)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-rose-600 inline-block" />
            <span className="text-[11px]">Direct Expenses (-)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-blue-600 inline-block" />
            <span className="text-[11px]">Net Retained Balance (=)</span>
          </div>
        </div>
        <span className="text-[11px] font-medium text-slate-400">
          *Target AFPM Ratio is &gt;1.0 (Morocco National Finance Standard)
        </span>
      </div>
    </div>
  );
};
