'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Search,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Filter,
  ArrowRight,
  Database,
  Layers,
  HelpCircle,
  X,
} from 'lucide-react';
import {
  MASTER_KPI_DICTIONARY,
  type MasterKPIDefinition,
} from '@/lib/kpi/kpi-dictionary';

export interface KpiDictionaryProps {
  isOpen?: boolean;
  onClose?: () => void;
  isInlineView?: boolean;
}

export function KpiDictionaryModal({
  isOpen = true,
  onClose,
  isInlineView = false,
}: KpiDictionaryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedKpi, setSelectedKpi] = useState<MasterKPIDefinition | null>(null);

  const filteredKpis = MASTER_KPI_DICTIONARY.filter((kpi) => {
    if (selectedCategory !== 'ALL' && kpi.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        kpi.kpiId.toLowerCase().includes(q) ||
        kpi.name.toLowerCase().includes(q) ||
        kpi.officialFormula.toLowerCase().includes(q) ||
        kpi.responsibleRole.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const content = (
    <div className="space-y-4 text-xs">
      {/* Top Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search KPIs by ID, title, formula, or VP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-aiesec-blue"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-aiesec-blue"
          >
            <option value="ALL">All Categories ({MASTER_KPI_DICTIONARY.length})</option>
            <option value="SALES">Sales & BD</option>
            <option value="OPPORTUNITY_SUPPLY">Opportunity Supply</option>
            <option value="IR_SUPPLY">IR Supply</option>
            <option value="EP_FUNNEL">EP Funnel & Matching</option>
            <option value="EXPERIENCE_QUALITY">Experience Quality</option>
            <option value="LOGISTICS_SAFETY">Logistics & Safety</option>
            <option value="FINANCE">Finance & AFPM</option>
            <option value="TEAM_EXECUTION">Team Execution (MES)</option>
          </select>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredKpis.map((kpi) => (
          <div
            key={kpi.kpiId}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition"
          >
            <div className="flex items-start justify-between border-b pb-2.5 border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-aiesec-blue dark:text-blue-400">
                    {kpi.kpiId}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {kpi.category.replace(/_/g, ' ')}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  {kpi.name}
                </h4>
              </div>

              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                kpi.confidenceStatus === 'VERIFIED_OFFICIAL'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : 'bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300'
              }`}>
                {kpi.confidenceStatus.replace('_', ' ')}
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              {kpi.description}
            </p>

            {/* Official Formula Box */}
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 font-mono text-[11px] text-slate-800 dark:text-slate-200">
              <span className="text-[9px] uppercase font-bold text-slate-400 block font-sans">
                Official Mathematical Formula
              </span>
              <code className="text-aiesec-blue dark:text-blue-300 font-semibold">{kpi.officialFormula}</code>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 pt-1">
              <div>
                <span className="font-semibold block text-slate-700 dark:text-slate-300">Source Tables:</span>
                <span className="font-mono">{kpi.sourceTables.join(', ')}</span>
              </div>
              <div>
                <span className="font-semibold block text-slate-700 dark:text-slate-300">Freshness SLA:</span>
                <span>{kpi.freshnessSla}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-[10px] text-slate-400">
                Accountable: <strong className="text-slate-700 dark:text-slate-300">{kpi.responsibleRole}</strong>
              </span>

              <Link
                href={kpi.drillDownUrl}
                className="text-xs font-bold text-aiesec-blue hover:underline inline-flex items-center gap-1"
              >
                <span>Drill Down to Source Records</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (isInlineView) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Master Operational KPI Dictionary & Drill-Down Catalog
            </h3>
            <p className="text-xs text-slate-500">
              Non-fictional metric specifications grounded in official AIESEC Hub architecture and verified local governance.
            </p>
          </div>
        </div>
        {content}
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in"
    >
      <div className="w-full max-w-4xl max-h-[85vh] rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 flex flex-col space-y-4">
        <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <BookOpen className="h-5 w-5 text-aiesec-blue" />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Master KPI Dictionary (HUB-KPI-00)
              </h3>
              <p className="text-xs text-slate-400">
                100% transparent formula definitions, grain specifications, and drill-down routes
              </p>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-1 rounded text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto pr-1">{content}</div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold dark:bg-white dark:text-slate-900"
          >
            Close Dictionary
          </button>
        </div>
      </div>
    </div>
  );
}
