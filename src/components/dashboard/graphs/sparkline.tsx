'use client';

import React from 'react';
import clsx from 'clsx';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  showLastDot?: boolean;
  className?: string;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  width = 80,
  height = 24,
  color = '#037EF3',
  showLastDot = true,
  className,
}) => {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 2;
  const plotWidth = width - padding * 2;
  const plotHeight = height - padding * 2;

  const points = data.map((val, idx) => {
    const x = padding + (idx / (data.length - 1)) * plotWidth;
    const y = height - padding - ((val - min) / range) * plotHeight;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const lastPoint = points[points.length - 1].split(',');
  const lastX = parseFloat(lastPoint[0]);
  const lastY = parseFloat(lastPoint[1]);

  return (
    <svg
      width={width}
      height={height}
      className={clsx('overflow-visible shrink-0', className)}
    >
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {showLastDot && (
        <circle
          cx={lastX}
          cy={lastY}
          r="2.5"
          fill={color}
          className="animate-pulse"
        />
      )}
    </svg>
  );
};
