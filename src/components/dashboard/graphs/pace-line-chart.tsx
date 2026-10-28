'use client';

import React from 'react';
import clsx from 'clsx';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface PacePoint {
  week: string; // 'W1', 'W2', etc.
  actual?: number;
  target: number;
}

interface PaceLineChartProps {
  data: PacePoint[];
  metricName?: string;
  unit?: string;
  title?: string;
  subtitle?: string;
  className?: string;
}

export const PaceLineChart: React.FC<PaceLineChartProps> = ({
  data,
  metricName = 'Realizations (RE)',
  unit = '',
  title = 'Cumulative Semester Pace S-Curve',
  subtitle = 'Actual progress trajectory (solid) vs Planned Target pace (dashed)',
  className,
}) => {
  if (!data || data.length === 0) return null;

  const actualPoints = data.filter((d) => d.actual !== undefined);
  const latestActual = actualPoints[actualPoints.length - 1];
  const maxVal = Math.max(
    ...data.map((d) => Math.max(d.target, d.actual ?? 0)),
    10
  );

  const delta = latestActual ? (latestActual.actual ?? 0) - latestActual.target : 0;
  const isAhead = delta > 0;
  const isBehind = delta < 0;

  // SVG dimensions
  const width = 640;
  const height = 220;
  const paddingX = 40;
  const paddingY = 30;

  const getX = (idx: number) =>
    paddingX + (idx / (data.length - 1 || 1)) * (width - paddingX * 2);
  const getY = (val: number) =>
    height - paddingY - (val / maxVal) * (height - paddingY * 2);

  // Generate path string for Target
  const targetPath = data.reduce(
    (acc, d, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.target)}`,
    ''
  );

  // Generate path string for Actual
  const actualPath = actualPoints.reduce(
    (acc, d, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.actual!)}`,
    ''
  );

  // Area under actual path
  const areaPath =
    actualPoints.length > 0
      ? `${actualPath} L ${getX(actualPoints.length - 1)} ${height - paddingY} L ${getX(0)} ${
          height - paddingY
        } Z`
      : '';

  return (
    <div className={clsx('rounded-xl border border-slate-200 bg-white p-5 shadow-sm', className)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>

        {latestActual && (
          <div className="flex items-center gap-2">
            <span
              className={clsx(
                'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border',
                isAhead
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : isBehind
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              )}
            >
              {isAhead ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : isBehind ? (
                <TrendingDown className="w-3.5 h-3.5" />
              ) : (
                <Minus className="w-3.5 h-3.5" />
              )}
              {isAhead ? `+${delta}` : delta} {unit} ({latestActual.week} Pace)
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Actual: <strong className="text-slate-900">{latestActual.actual}</strong> / Target: {latestActual.target}
            </span>
          </div>
        )}
      </div>

      {/* SVG Container */}
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[500px]"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#037EF3" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#037EF3" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
            const yVal = Math.round(maxVal * pct);
            const yPos = getY(yVal);
            return (
              <g key={pct}>
                <line
                  x1={paddingX}
                  y1={yPos}
                  x2={width - paddingX}
                  y2={yPos}
                  stroke="#E2E8F0"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX - 8}
                  y={yPos + 4}
                  textAnchor="end"
                  fontSize="10"
                  fill="#94A3B8"
                  fontWeight="500"
                >
                  {yVal}
                </text>
              </g>
            );
          })}

          {/* Area fill under Actual curve */}
          {areaPath && <path d={areaPath} fill="url(#actualGradient)" />}

          {/* Target Pace line (Dashed Slate) */}
          <path
            d={targetPath}
            fill="none"
            stroke="#94A3B8"
            strokeWidth="2.5"
            strokeDasharray="6 6"
          />

          {/* Actual Pace line (Solid Blue) */}
          <path
            d={actualPath}
            fill="none"
            stroke="#037EF3"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Actual Data Points */}
          {actualPoints.map((pt, i) => (
            <g key={pt.week}>
              <circle
                cx={getX(i)}
                cy={getY(pt.actual!)}
                r="4.5"
                fill="#FFFFFF"
                stroke="#037EF3"
                strokeWidth="2.5"
              />
              <text
                x={getX(i)}
                y={getY(pt.actual!) - 9}
                textAnchor="middle"
                fontSize="10"
                fontWeight="700"
                fill="#0F172A"
              >
                {pt.actual}
              </text>
            </g>
          ))}

          {/* Target Final Point Badge */}
          {data.length > 0 && (
            <text
              x={getX(data.length - 1)}
              y={getY(data[data.length - 1].target) - 8}
              textAnchor="middle"
              fontSize="10"
              fontWeight="600"
              fill="#64748B"
            >
              Goal: {data[data.length - 1].target}
            </text>
          )}

          {/* Week X-Axis Labels */}
          {data.map((pt, i) => {
            // Show every other label if many points
            if (data.length > 12 && i % 2 !== 0 && i !== data.length - 1) return null;
            return (
              <text
                key={pt.week}
                x={getX(i)}
                y={height - 8}
                textAnchor="middle"
                fontSize="10"
                fill="#64748B"
                fontWeight="500"
              >
                {pt.week}
              </text>
            );
          })}
        </svg>
      </div>

      <div className="flex items-center justify-center gap-6 mt-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="w-4 h-1 bg-blue-600 rounded-full inline-block" />
          <span className="font-semibold text-slate-800">Actual {metricName}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-0.5 border-t-2 border-dashed border-slate-400 inline-block" />
          <span className="font-medium text-slate-600">Planned Pace Target</span>
        </div>
      </div>
    </div>
  );
};
