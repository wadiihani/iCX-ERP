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
          <LayoutGrid className="w-4 h-4 text-indigo-600" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Level 2 Command Grid (3×3 Domain Executive Cards)
          </h2>
          <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold border border-indigo-200 uppercase tracking-wider">
            Nivo Powered
          </span>
        </div>
        <span className="text-[11px] text-slate-400">
          Click any card to load its specialized scorecards, Nivo graphs &amp; exceptions below
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
