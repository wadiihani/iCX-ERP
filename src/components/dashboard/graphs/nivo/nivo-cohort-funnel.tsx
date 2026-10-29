'use client';

import React, { useState, useEffect } from 'react';
import { ResponsiveFunnel } from '@nivo/funnel';
import clsx from 'clsx';
import { SteppedFunnelStage } from '@/lib/types/dashboard-spec';

interface NivoCohortFunnelProps {
  stages: SteppedFunnelStage[];
  height?: number;
  className?: string;
  onStageClick?: (stageId: string) => void;
}

export const NivoCohortFunnel: React.FC<NivoCohortFunnelProps> = ({
  stages,
  height = 280,
  className,
  onStageClick,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Format data for Nivo ResponsiveFunnel
  const funnelData = stages.map((stage) => ({
    id: stage.stageId,
    value: stage.cohortCount,
    label: `${stage.stageName} (${stage.cohortCount})`,
    conversionFromPriorPct: stage.conversionFromPriorPct,
    conversionFraction: stage.conversionFraction,
    dropOffCount: stage.dropOffCount,
    medianDaysInStage: stage.medianDaysInStage,
    primaryDropOffReason: stage.primaryDropOffReason || 'None',
  }));

  // Palette aligned with AIESEC Brand & Lifecycle progression
  const stageColors: Record<string, string> = {
    APD: '#037ef3',     // AIESEC Blue
    ACC: '#00a5d9',     // Cyan Accent
    APD_FEE: '#6366f1', // Indigo Approval
    REA: '#10b981',     // Emerald Realization
    COM: '#059669',     // Forest Green Completion
  };

  if (!mounted) {
    // SSR skeleton placeholder with exact height
    return (
      <div
        className={clsx('w-full rounded-xl bg-slate-50 flex items-center justify-center animate-pulse', className)}
        style={{ height }}
      >
        <span className="text-xs text-slate-400 font-medium">Loading Nivo Cohort Funnel...</span>
      </div>
    );
  }

  return (
    <div className={clsx('w-full relative', className)} style={{ height }}>
      <ResponsiveFunnel
        data={funnelData}
        margin={{ top: 16, right: 24, bottom: 20, left: 24 }}
        direction="horizontal"
        interpolation="smooth"
        spacing={2}
        shapeBlending={0.65}
        valueFormat=">-.0f"
        colors={({ id }) => stageColors[id as string] || '#3b82f6'}
        fillOpacity={0.92}
        borderWidth={14}
        borderColor="white"
        enableLabel={true}
        labelColor={{ from: 'color', modifiers: [['darker', 3.0]] }}
        enableBeforeSeparators={true}
        enableAfterSeparators={true}
        beforeSeparatorLength={8}
        afterSeparatorLength={8}
        beforeSeparatorOffset={14}
        afterSeparatorOffset={14}
        currentPartSizeExtension={8}
        currentBorderWidth={18}
        motionConfig="gentle"
        onClick={(part) => {
          onStageClick?.(String(part.data.id));
        }}
        tooltip={({ part }) => {
          const raw = part.data as any;
          return (
            <div className="bg-slate-900/95 text-white backdrop-blur-md rounded-xl p-3 shadow-xl border border-slate-700 text-xs space-y-1.5 max-w-xs text-left">
              <div className="flex items-center justify-between gap-3 border-b border-slate-700/80 pb-1.5">
                <span className="font-bold text-white text-sm">
                  {raw.label}
                </span>
                <span className="px-1.5 py-0.5 rounded-sm bg-blue-500/30 text-blue-300 font-mono text-[10px] font-bold">
                  Stage {raw.id}
                </span>
              </div>
              <div className="space-y-1 pt-0.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Cohort Volume:</span>
                  <strong className="text-white font-mono">{raw.value} EPs</strong>
                </div>
                {raw.conversionFraction && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Conversion from Prior:</span>
                    <strong className="text-emerald-400 font-mono">
                      {raw.conversionFromPriorPct}% ({raw.conversionFraction})
                    </strong>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Median Duration:</span>
                  <span className="text-slate-300 font-mono">{raw.medianDaysInStage} days</span>
                </div>
                {raw.dropOffCount > 0 && (
                  <div className="pt-1 border-t border-slate-800 text-[11px] text-rose-300">
                    <span className="font-semibold">Drop-off: &minus;{raw.dropOffCount} EPs</span>
                    <p className="text-[10px] text-slate-400 mt-0.5 italic">
                      Reason: {raw.primaryDropOffReason}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        }}
      />
    </div>
  );
};
