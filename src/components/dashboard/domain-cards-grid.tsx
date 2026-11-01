'use client';

import React from 'react';
import clsx from 'clsx';
import { DomainCardSummary, DomainId } from '@/lib/dashboard/dashboard-types';
import { DomainKpiCard } from './domain-kpi-card';
import { LayoutGrid } from 'lucide-react';

interface DomainCardsGridProps {
  cards: DomainCardSummary[];
  selectedId: DomainId | null;
  onSelectCard: (id: DomainId) => void;
  className?: string;
}

export const DomainCardsGrid: React.FC<DomainCardsGridProps> = ({
  cards,
  selectedId,
  onSelectCard,
  className,
}) => {
  return (
    <section className={clsx('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LayoutGrid className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            3×3 Domain Overview
          </h2>
          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-semibold border border-blue-200 uppercase tracking-wider dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800">
            Nivo Micro-Charts
          </span>
        </div>
        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          Select a domain to inspect charts and operational details.
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <DomainKpiCard
            key={card.id}
            card={card}
            isSelected={selectedId === card.id}
            onSelect={onSelectCard}
          />
        ))}
      </div>
    </section>
  );
};
