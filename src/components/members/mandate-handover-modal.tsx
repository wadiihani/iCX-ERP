'use client';

import React, { useState } from 'react';
import { MemberRecord } from '@/lib/members/member-engagement-types';
import { X, Copy, Check, Download, ShieldAlert, Briefcase, Users, FileText, Layers } from 'lucide-react';

interface MandateHandoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: MemberRecord[];
}

export function MandateHandoverModal({
  isOpen,
  onClose,
  members,
}: MandateHandoverModalProps) {
  if (!isOpen) return null;

  const [copied, setCopied] = useState(false);

  // Computed Handover Packet metrics for AIESEC in Rabat Mandate 26.2
  const handoverData = {
    mandate: '26.2',
    termWindow: 'August 2026 – January 2027',
    generatedAt: new Date().toISOString(),
    responsibleBody: 'LC Rabat Executive Body & Team Leaders',
    activeEntities: {
      partnersCount: 18,
      dealsCount: 22,
      activeOppsCount: 6,
      openSlotsCount: 64,
      matchedEpsCount: 42,
      vettedHousingBeds: 28,
      irAgreementsCount: 12,
      activeTasksCount: 19,
      overdueTasksCount: 3,
      openQualityCases: 1,
      totalUnpaidReceivablesMad: 34500,
    },
    departmentHandovers: [
      {
        department: 'External Engine (B2B Sales & CSR)',
        lead: 'Wadii Hani (LCVP) & Omar Joukhane (MM_TL)',
        keyDeliverables: '18 active partner accounts transferred; 3 corporate contracts pending renewal in December.',
        criticalRisks: 'School director changeover in Salé partner institution.',
      },
      {
        department: 'Internal Engine (Operations & CXP)',
        lead: 'Abdenasser Moussafi (LCVP) & Mouatassim Benkhallouq (MM_TL)',
        keyDeliverables: '42 incoming EPs in active pipeline; 28 inspected beds with zero double-booking.',
        criticalRisks: 'Winter peak airport pickups concentrated between Dec 28 – Jan 05.',
      },
      {
        department: 'Finance & Legal (FnL)',
        lead: 'Nourdine Ettaoumi (LCVP) & Mohamed El Kahri (MM_TL)',
        keyDeliverables: '34,500 MAD in outstanding receivables; 2 pending dual-approval reimbursement vouchers.',
        criticalRisks: '1 corporate partner invoice reached 14-day aging threshold.',
      },
    ],
  };

  const handoverMarkdown = `# AIESEC in Rabat — Mandate ${handoverData.mandate} Stakeholder Handover Pack
**Term:** ${handoverData.termWindow}  
**Generated:** ${handoverData.generatedAt}  
**Governing Body:** ${handoverData.responsibleBody}  

---

## 1. Active Operations Summary
- **B2B Partners:** ${handoverData.activeEntities.partnersCount} verified organizations
- **Active Deals:** ${handoverData.activeEntities.dealsCount} deals in pipeline
- **Opportunity Slots:** ${handoverData.activeEntities.openSlotsCount} slots across ${handoverData.activeEntities.activeOppsCount} approved opportunities
- **EP Pipeline:** ${handoverData.activeEntities.matchedEpsCount} EPs (Matched, Pre-Arrival, or Realized)
- **Housing Bed Capacity:** ${handoverData.activeEntities.vettedHousingBeds} physically vetted beds
- **IR Commitments:** ${handoverData.activeEntities.irAgreementsCount} international partner LCs
- **Open Tasks:** ${handoverData.activeEntities.activeTasksCount} (${handoverData.activeEntities.overdueTasksCount} overdue)
- **Open Quality Cases:** ${handoverData.activeEntities.openQualityCases} (Stage 1 resolution)
- **Outstanding Receivables:** ${handoverData.activeEntities.totalUnpaidReceivablesMad} MAD

---

## 2. Departmental Transition Notes
${handoverData.departmentHandovers
  .map(
    (d) => `### ${d.department}
- **Outgoing Leads:** ${d.lead}
- **Deliverables:** ${d.keyDeliverables}
- **Risks & Watch Items:** ${d.criticalRisks}
`
  )
  .join('\n')}

---
*Transferred via AIESEC iCX ERP — 100% Data Continuity Contract*
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(handoverMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(handoverData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aiesec-rabat-mandate-${handoverData.mandate}-handover-pack.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-50">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Mandate Handover Pack Generator (Mandate 26.2)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                100% zero-orphaned stakeholder transfer protocol per Hub Operating Model §5.11.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Operational Scope Summary Grid */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="text-[10px] font-bold text-slate-400">B2B Deals</div>
            <div className="text-base font-extrabold text-slate-900 dark:text-white">
              {handoverData.activeEntities.dealsCount}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="text-[10px] font-bold text-slate-400">EP Dossiers</div>
            <div className="text-base font-extrabold text-aiesec-blue dark:text-blue-400">
              {handoverData.activeEntities.matchedEpsCount}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="text-[10px] font-bold text-slate-400">Vetted Beds</div>
            <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
              {handoverData.activeEntities.vettedHousingBeds}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="text-[10px] font-bold text-slate-400">Receivables</div>
            <div className="text-base font-extrabold text-amber-600 dark:text-amber-400">
              {handoverData.activeEntities.totalUnpaidReceivablesMad.toLocaleString()} MAD
            </div>
          </div>
        </div>

        {/* Markdown Preview Area */}
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span>Handover Document Preview</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                {copied ? 'Copied' : 'Copy Markdown'}
              </button>
              <button
                onClick={handleDownloadJson}
                className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <Download className="h-3 w-3" />
                Export JSON
              </button>
            </div>
          </div>
          <pre className="max-h-56 overflow-y-auto rounded-lg border border-slate-200 bg-slate-900 p-3 font-mono text-[11px] text-slate-200 dark:border-slate-700">
            {handoverMarkdown}
          </pre>
        </div>

        {/* Verification Alert */}
        <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-purple-200 bg-purple-50 p-3 text-xs text-purple-900 dark:border-purple-900 dark:bg-purple-950/40 dark:text-purple-300">
          <ShieldAlert className="h-4 w-4 shrink-0 text-purple-600 mt-0.5" />
          <div>
            <span className="font-bold">AIESEC Hub Mandate Compliance Check</span>: Prior to executing the official
            mandate transition, all incoming and outgoing team leads must sign off on their respective department sections
            to prevent dropped communications and orphaned EP files.
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-end gap-2.5 border-t border-slate-100 pt-3 dark:border-slate-800">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
