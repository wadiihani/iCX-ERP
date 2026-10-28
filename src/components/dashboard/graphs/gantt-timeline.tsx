'use client';

import React from 'react';
import clsx from 'clsx';
import { Bed, UserCheck, ShieldCheck, Ticket, Plane } from 'lucide-react';

export interface PreArrivalRiskRow {
  epId: string;
  epName: string;
  country: string;
  daysToArrival: number; // e.g. 12 (critical < 14), 25, 4
  lockChecklist: {
    visaIssued: boolean;
    bedAssigned: boolean;
    ticketUploaded: boolean;
    pickupAssigned: boolean;
    opConfirmed: boolean;
  };
}

export interface BedOccupancyRow {
  bedId: string;
  flat: string;
  room: string;
  neighborhood: string;
  weeks: Array<{
    weekNumber: number;
    isOccupied: boolean;
    epInitials?: string;
  }>;
}

interface PreArrivalCountdownProps {
  title?: string;
  subtitle?: string;
  rows: PreArrivalRiskRow[];
  onSelectEp?: (epId: string) => void;
  className?: string;
}

export const PreArrivalCountdownTimeline: React.FC<PreArrivalCountdownProps> = ({
  title = 'Who is at risk before arrival?',
  subtitle = 'Countdown to touchdown (60d → 0d) with 14-day lock & 3-day pickup gates',
  rows = [],
  onSelectEp,
  className,
}) => {
  // Sort by days to arrival asc (most urgent first)
  const sorted = [...rows].sort((a, b) => a.daysToArrival - b.daysToArrival);

  return (
    <div className={clsx('bg-white rounded-xl border border-slate-200 p-4 sm:p-5 text-left', className)}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>&lt;14d Lock Breach</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>100% Ready</span>
          </span>
        </div>
      </div>

      <div className="space-y-2.5">
        {sorted.map((r) => {
          const checks = r.lockChecklist;
          const passedCount = [
            checks.visaIssued,
            checks.bedAssigned,
            checks.ticketUploaded,
            checks.pickupAssigned,
            checks.opConfirmed,
          ].filter(Boolean).length;
          const isComplete = passedCount === 5;
          const isBreach = r.daysToArrival <= 14 && !isComplete;
          const isImminentPickup = r.daysToArrival <= 3;

          return (
            <div
              key={r.epId}
              onClick={() => onSelectEp?.(r.epId)}
              className={clsx(
                'p-3 rounded-lg border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3',
                isBreach
                  ? 'bg-rose-50/40 border-rose-200 hover:bg-rose-50/70'
                  : 'bg-slate-50/50 border-slate-200 hover:bg-slate-50'
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={clsx(
                    'w-9 h-9 rounded-lg flex flex-col items-center justify-center text-[10px] font-bold shrink-0',
                    isBreach
                      ? 'bg-rose-600 text-white'
                      : isComplete
                      ? 'bg-emerald-600 text-white'
                      : 'bg-blue-600 text-white'
                  )}
                >
                  <span className="text-xs">{r.daysToArrival}</span>
                  <span className="text-[8px] uppercase">days</span>
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 truncate">{r.epName}</span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                      {r.country}
                    </span>
                    {isBreach && (
                      <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 border border-rose-200">
                        14-DAY LOCK BREACH
                      </span>
                    )}
                    {isImminentPickup && (
                      <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-amber-100 text-amber-700 border border-amber-200">
                        &lt;3D PICKUP GATE
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Readiness: {passedCount}/5 Lock Items Verified ({Math.round((passedCount / 5) * 100)}%)
                  </div>
                </div>
              </div>

              {/* 5 Lock Item Chips */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span
                  title={`Visa Issued: ${checks.visaIssued ? 'Yes' : 'Missing'}`}
                  className={clsx(
                    'px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1',
                    checks.visaIssued ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-700'
                  )}
                >
                  <ShieldCheck className="w-3 h-3" />
                  <span>Visa</span>
                </span>
                <span
                  title={`Bed Assigned: ${checks.bedAssigned ? 'Yes' : 'Missing'}`}
                  className={clsx(
                    'px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1',
                    checks.bedAssigned ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-700'
                  )}
                >
                  <Bed className="w-3 h-3" />
                  <span>Bed</span>
                </span>
                <span
                  title={`Ticket Uploaded: ${checks.ticketUploaded ? 'Yes' : 'Missing'}`}
                  className={clsx(
                    'px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1',
                    checks.ticketUploaded ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-700'
                  )}
                >
                  <Ticket className="w-3 h-3" />
                  <span>Flight</span>
                </span>
                <span
                  title={`Arrival Pickup Greeter: ${checks.pickupAssigned ? 'Yes' : 'Missing'}`}
                  className={clsx(
                    'px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1',
                    checks.pickupAssigned ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-700'
                  )}
                >
                  <Plane className="w-3 h-3" />
                  <span>Pickup</span>
                </span>
                <span
                  title={`OP Confirmation: ${checks.opConfirmed ? 'Yes' : 'Missing'}`}
                  className={clsx(
                    'px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1',
                    checks.opConfirmed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-700'
                  )}
                >
                  <UserCheck className="w-3 h-3" />
                  <span>OP</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Click any EP row to inspect dossier &amp; trigger pre-arrival reminder</span>
        <span>Gates: 14d Lock &amp; 3d Pickup Instructions</span>
      </div>
    </div>
  );
};

interface BedOccupancyGanttProps {
  title?: string;
  subtitle?: string;
  beds: BedOccupancyRow[];
  onSelectBed?: (bedId: string) => void;
  className?: string;
}

export const BedOccupancyGantt: React.FC<BedOccupancyGanttProps> = ({
  title = 'Where are beds empty or overlapping?',
  subtitle = 'Occupancy timeline across weeks (Agdal, Hassan, Hay Riad, Salé)',
  beds = [],
  onSelectBed,
  className,
}) => {
  return (
    <div className={clsx('bg-white rounded-xl border border-slate-200 p-4 sm:p-5 text-left', className)}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
            <span>Occupied</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-200 border border-dashed border-slate-400" />
            <span>Empty Gap</span>
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              <th className="py-2 px-3 text-left w-36">Flat / Bed</th>
              <th className="py-2 px-2 text-left w-20">Area</th>
              {Array.from({ length: 8 }).map((_, i) => (
                <th key={i} className="py-2 px-1 text-center font-mono">
                  W{i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {beds.map((b) => (
              <tr
                key={b.bedId}
                onClick={() => onSelectBed?.(b.bedId)}
                className="hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <td className="py-2.5 px-3 font-semibold text-slate-800 whitespace-nowrap">
                  {b.flat} — <span className="font-normal text-slate-500">{b.room}</span>
                </td>
                <td className="py-2.5 px-2 text-slate-500 text-[11px] whitespace-nowrap">
                  {b.neighborhood}
                </td>
                {b.weeks.slice(0, 8).map((w) => (
                  <td key={w.weekNumber} className="py-2.5 px-1 text-center">
                    {w.isOccupied ? (
                      <span
                        className="inline-flex w-7 h-6 rounded-xs bg-emerald-600 text-white text-[9px] font-bold items-center justify-center shadow-2xs"
                        title={`Week ${w.weekNumber}: Occupied by ${w.epInitials || 'EP'}`}
                      >
                        {w.epInitials || 'OCC'}
                      </span>
                    ) : (
                      <span
                        className="inline-flex w-7 h-6 rounded-xs bg-slate-100 border border-dashed border-slate-300 text-slate-400 text-[8px] items-center justify-center"
                        title={`Week ${w.weekNumber}: Empty (Unutilized)`}
                      >
                        —
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Click a flat row to inspect lease contract &amp; bed allocations</span>
        <span>Hatched/dash = empty unutilized bed nights</span>
      </div>
    </div>
  );
};
