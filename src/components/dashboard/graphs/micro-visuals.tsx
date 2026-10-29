'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { DomainCardSummary } from '@/lib/dashboard/dashboard-types';

const NivoDomainMicroChart = dynamic(
  () => import('./nivo/nivo-domain-micro-chart').then((m) => m.NivoDomainMicroChart),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-9 bg-slate-50 rounded animate-pulse mt-2 pt-2 border-t border-slate-100" />
    ),
  }
);

interface MicroVisualProps {
  card: DomainCardSummary;
}

export const DomainCardMicroVisual: React.FC<MicroVisualProps> = ({ card }) => {
  return <NivoDomainMicroChart card={card} height={36} />;
};
