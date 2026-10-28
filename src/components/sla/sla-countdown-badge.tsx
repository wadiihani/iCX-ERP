'use client';

import React from 'react';

export interface SlaCountdownBadgeProps {
  urgency: 'NORMAL' | 'WARNING_80' | 'BREACHED_100' | 'CRITICAL_150';
  hoursElapsed: number;
  hoursAllowed: number;
  deadlineIso: string;
}

export function SlaCountdownBadge({
  urgency,
  hoursElapsed,
  hoursAllowed,
  deadlineIso,
}: SlaCountdownBadgeProps) {
  const percentage = Math.min(100, Math.round((hoursElapsed / hoursAllowed) * 100));

  const config = {
    NORMAL: {
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      label: 'On Track',
      dot: 'bg-emerald-400',
    },
    WARNING_80: {
      bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      label: 'Warning (80%)',
      dot: 'bg-amber-400 animate-pulse',
    },
    BREACHED_100: {
      bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      label: 'Breached (100%)',
      dot: 'bg-rose-500 animate-ping',
    },
    CRITICAL_150: {
      bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      label: 'Critical (150%+)',
      dot: 'bg-purple-400 animate-ping',
    },
  }[urgency];

  return (
    <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border text-xs font-medium font-mono ${config.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
      <span className="opacity-75">
        ({hoursElapsed}h/{hoursAllowed}h · {percentage}%)
      </span>
    </div>
  );
}
