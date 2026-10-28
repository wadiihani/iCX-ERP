'use client';

import React from 'react';
import clsx from 'clsx';

export interface DotMatrixElement {
  id: string;
  name: string;
  stage: 'Building' | 'Performing' | 'Closing';
  scores: {
    mmExternal: number; // 0..100%
    mmInternal: number;
    tlIr: number;
    tlBd: number;
  };
}

interface TeamStandardsDotMatrixProps {
  title?: string;
  subtitle?: string;
  elements: DotMatrixElement[];
  className?: string;
}

export const TeamStandardsDotMatrix: React.FC<TeamStandardsDotMatrixProps> = ({
  title = 'Which team skips which standard?',
  subtitle = 'Dot matrix compliance across 9 Team Standards (replaces unreadable radar charts)',
  elements = [],
  className,
}) => {
  const teams = [
    { key: 'mmExternal' as const, label: 'MM External' },
    { key: 'mmInternal' as const, label: 'MM Internal' },
    { key: 'tlIr' as const, label: 'TL IR' },
    { key: 'tlBd' as const, label: 'TL BD' },
  ];

  const getRagBadge = (val: number) => {
    if (val >= 90) return 'bg-emerald-500 text-white';
    if (val >= 75) return 'bg-amber-400 text-slate-950 font-bold';
    return 'bg-rose-500 text-white font-bold';
  };

  return (
    <div className={clsx('bg-white rounded-xl border border-slate-200 p-4 sm:p-5 text-left', className)}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-semibold">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>&ge;90%</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>75–89%</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>&lt;75%</span>
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              <th className="py-2 px-3 text-left w-64">AIESEC Team Standard (TeSt)</th>
              <th className="py-2 px-2 text-left w-24">Stage</th>
              {teams.map((t) => (
                <th key={t.key} className="py-2 px-2 text-center font-bold text-slate-700">
                  {t.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {elements.map((el) => (
              <tr key={el.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-2.5 px-3 font-medium text-slate-800">
                  {el.name}
                </td>
                <td className="py-2.5 px-2">
                  <span
                    className={clsx(
                      'text-[9px] font-bold px-1.5 py-0.5 rounded uppercase',
                      el.stage === 'Building'
                        ? 'bg-blue-100 text-blue-700'
                        : el.stage === 'Performing'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-purple-100 text-purple-700'
                    )}
                  >
                    {el.stage}
                  </span>
                </td>
                {teams.map((t) => {
                  const score = el.scores[t.key];
                  return (
                    <td key={t.key} className="py-2.5 px-2 text-center">
                      <span
                        className={clsx(
                          'inline-flex items-center justify-center w-11 h-6 rounded-md text-[11px] font-mono tracking-tight shadow-2xs',
                          getRagBadge(score)
                        )}
                        title={`${t.label} - ${el.name}: ${score}%`}
                      >
                        {score}%
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>No misleading polygon distortion · Exact numeric percentage inside each team cell</span>
        <span className="font-semibold text-slate-600">Building / Performing / Closing stages</span>
      </div>
    </div>
  );
};
