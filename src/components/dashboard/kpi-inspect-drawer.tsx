'use client';

import React from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import {
  X,
  FileText,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Clock,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Building,
  Target,
  HelpCircle,
  AlertCircle,
  Copy,
} from 'lucide-react';
import { KpiDetailViewData } from '@/lib/types/dashboard-spec';

interface KpiInspectDrawerProps {
  data: KpiDetailViewData | null;
  isOpen: boolean;
  onClose: () => void;
}

export const KpiInspectDrawer: React.FC<KpiInspectDrawerProps> = ({
  data,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !data) return null;

  const handleCopySummary = () => {
    const text = `[AIESEC iCX ERP KPI Detail]\nKPI: ${data.name} (${data.kpiKey})\nValue: ${data.rateFormatted} (${data.fractionText})\nTarget: ${data.target}\nDiagnostic: ${data.diagnostic.summary}\nNext Action: ${data.nextAction.actionText} (Owner: ${data.nextAction.owner})`;
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end transition-opacity duration-300">
      <div
        className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col text-left overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        {/* Drawer Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 sticky top-0 z-10 border-b border-slate-800">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs px-2 py-0.5 rounded-sm bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  {data.kpiKey}
                </span>
                <span
                  className={clsx(
                    'text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border',
                    data.confidence === 'VERIFIED_OFFICIAL'
                      ? 'bg-blue-600/30 text-blue-200 border-blue-500/50'
                      : 'bg-purple-600/30 text-purple-200 border-purple-500/50'
                  )}
                >
                  {data.confidence === 'VERIFIED_OFFICIAL' ? 'Official AIESEC KPI' : 'Local Metric'}
                </span>
                {data.officialSource && (
                  <span className="text-xs text-slate-400">
                    Authority: {data.officialSource.authority}
                  </span>
                )}
              </div>
              <h2 id="drawer-title" className="text-lg sm:text-xl font-bold text-white mt-1.5">
                {data.name}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopySummary}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Copy KPI summary"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Metric Value & Fraction Banner */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-baseline justify-between gap-4 flex-wrap">
            <div>
              <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider">
                Current Performance
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl font-extrabold text-white tabular-nums">
                  {data.rateFormatted}
                </span>
                <span className="text-sm font-mono text-blue-300 bg-white/10 px-2 py-0.5 rounded-md">
                  {data.fractionText}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider">
                Target / Floor
              </span>
              <span className="text-sm font-bold text-slate-200 block mt-1">
                {data.target}
              </span>
            </div>
          </div>
        </div>

        {/* Drawer Body — The 10 Actionable Dimensions */}
        <div className="p-5 sm:p-6 space-y-6 bg-slate-50/50 flex-1">
          {/* Dimension 1 & 2: Definition, Formula & Date Basis */}
          <section className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>1. Definition &amp; Mathematical Formulation</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {data.definition}
            </p>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 font-mono text-xs text-slate-800">
              Formula: {data.formulaDescription}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Date/Cohort Basis: <strong>{data.cohortBasis}</strong></span>
            </div>
          </section>

          {/* Dimension 9: Rule-Based Diagnostic Explanation */}
          <section className="bg-blue-50/60 rounded-xl border border-blue-200 p-4 shadow-2xs space-y-2">
            <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-blue-700" />
              <span>2. Rule-Based Diagnostic Explanation</span>
            </h3>
            <p className="text-xs text-blue-950 font-medium leading-relaxed">
              {data.diagnostic.summary}
            </p>
            <div className="pt-2 border-t border-blue-200/60 space-y-1">
              <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">
                Evidence Citations (Database Verified):
              </span>
              <ul className="list-disc list-inside text-xs text-blue-900 space-y-0.5">
                {data.diagnostic.evidenceCitations.map((cite, i) => (
                  <li key={i}>{cite}</li>
                ))}
              </ul>
            </div>
            <div className="p-2 rounded-lg bg-white border border-blue-200 text-xs text-blue-900">
              <strong className="font-semibold text-blue-950">Primary Bottleneck:</strong>{' '}
              {data.diagnostic.primaryBottleneck}
            </div>
          </section>

          {/* Dimension 6: Segment Breakdown */}
          {data.breakdowns.length > 0 && (
            <section className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-emerald-600" />
                <span>3. Operational Segment Breakdown</span>
              </h3>
              <div className="space-y-2">
                {data.breakdowns.map((b, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-800">{b.label}</span>
                      <span className="font-mono text-slate-600">
                        {b.count} ({b.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all"
                        style={{ width: `${b.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Dimension 7: Driving Exception Records */}
          {data.exceptionRecords.length > 0 && (
            <section className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>4. Driving Exception Records ({data.exceptionRecords.length})</span>
                </h3>
                <span className="text-[10px] text-slate-400">100% Traceable</span>
              </div>

              <div className="divide-y divide-slate-100">
                {data.exceptionRecords.map((rec) => (
                  <div key={rec.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                    <div>
                      <h4 className="font-bold text-slate-900">{rec.title}</h4>
                      {rec.subtitle && (
                        <p className="text-[11px] text-slate-500 mt-0.5">{rec.subtitle}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                        <span>Owner: <strong className="text-slate-600">{rec.owner}</strong></span>
                        <span>·</span>
                        <span className="font-mono text-amber-700">{rec.daysIdle}d idle</span>
                      </div>
                    </div>
                    <Link
                      href={rec.recordUrl}
                      onClick={onClose}
                      className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-semibold text-[11px] transition-colors shrink-0 inline-flex items-center gap-1"
                    >
                      <span>Fix</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Dimension 10: Prescribed Next Action */}
          <section className="bg-slate-900 text-white rounded-xl p-4 shadow-md space-y-2">
            <h3 className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>5. Prescribed Accountable Action</span>
            </h3>
            <p className="text-xs text-slate-200 font-medium leading-relaxed">
              {data.nextAction.actionText}
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex-wrap gap-2">
              <div>
                <span>Accountable Owner: <strong className="text-white">{data.nextAction.owner}</strong></span>
                <span className="block text-[10px] text-slate-500">Deadline: {data.nextAction.deadline}</span>
              </div>
              <Link
                href={data.nextAction.routeUrl}
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors inline-flex items-center gap-1"
              >
                <span>Execute Action</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
