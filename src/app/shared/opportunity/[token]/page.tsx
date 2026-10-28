'use client';

import React from 'react';
import Link from 'next/link';
import { sanitiseOpportunityForSharedView } from '@/lib/ir/shared-view-token';

export default function SharedOpportunityViewPage({
  params,
}: {
  params: { token: string };
}) {
  // Simulating fetching opportunity by token
  const rawOpportunity = {
    id: 'opp-rabat-01',
    title: 'Youth Digital Literacy & Coding Coach',
    product: 'igv',
    sdgTarget: 4,
    durationWeeks: 6,
    weeklyWorkingHours: 30,
    totalOpenings: 5,
    availableOpenings: 3,
    startDate: '2026-11-01',
    endDate: '2026-12-15',
    city: 'Rabat',
    commercialPartnerFee: 25000, // Should be stripped!
  };

  const opp = sanitiseOpportunityForSharedView(rawOpportunity);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-12">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Brand Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black flex items-center justify-center">
              A
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 dark:text-white">AIESEC in Rabat</div>
              <div className="text-[10px] text-slate-400">Incoming Global Volunteer (iGV) Portfolio</div>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            Verified Partner Shared View
          </span>
        </div>

        {/* Opportunity Card */}
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                ODD {opp.sdgTarget}: Éducation de Qualité
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                {opp.availableOpenings} Openings Available
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">{opp.title}</h1>
            <p className="text-xs text-slate-500">Location: {opp.city}, Morocco · Project Duration: {opp.durationWeeks} Weeks</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="text-lg font-bold text-slate-900 dark:text-white">{opp.durationWeeks} wks</div>
              <div className="text-[10px] text-slate-400">Duration</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="text-lg font-bold text-slate-900 dark:text-white">{opp.weeklyWorkingHours}h</div>
              <div className="text-[10px] text-slate-400">Weekly Hours</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="text-lg font-bold text-slate-900 dark:text-white">{opp.startDate}</div>
              <div className="text-[10px] text-slate-400">Start Date</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="text-lg font-bold text-slate-900 dark:text-white">{opp.endDate}</div>
              <div className="text-[10px] text-slate-400">End Date</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 leading-relaxed space-y-2">
            <div className="font-bold text-slate-900 dark:text-white">Exchange Standards Commitment</div>
            <p>
              AIESEC in Rabat delivers all 18 International Exchange Standards, including vetted accommodation, arrival pick-up, local orientation, and dedicated host project mentoring.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
            <span className="text-[11px] text-slate-400 font-mono">Token: {params.token.slice(0, 16)}...</span>
            <a
              href="https://aiesec.org"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition"
            >
              Apply via AIESEC Global Portal ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
