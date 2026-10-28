'use client';

import React, { useState } from 'react';
import { computeStatutoryKpis, RawOperationRecord } from '@/lib/analytics/kpi-engine';

type RoleViewType = 'LCP' | 'VP_IGV' | 'TEAM_LEADER' | 'MEMBER' | 'FINANCE_MANAGER';

const mockDataset: RawOperationRecord[] = [
  {
    applicationId: 'APP-RABAT-101',
    epName: 'Fatima Zahra Mansouri',
    lcId: 'LC_RABAT',
    appliedAt: '2026-10-10T10:00:00Z',
    firstContactedAt: '2026-10-10T18:00:00Z', // 8h
    acceptedAt: '2026-10-15T12:00:00Z',
    approvedAt: '2026-10-20T14:00:00Z',
    realizedAt: '2026-10-25T09:00:00Z',
    completedAt: null,
    scorecardScore: 88,
    hasBedAllocated: true,
    hasFlightVerified: true,
    isVisaCleared: true,
    daysToArrival: 0,
    isUnreachableCrisis: false,
    contractValueMad: 4500,
    contractStatus: 'DEPOSIT_PAID',
    outboxResolvedInHours: 6,
    standardsDeliveredCount: 16,
  },
  {
    applicationId: 'APP-RABAT-102',
    epName: 'Matteo Rossi',
    lcId: 'LC_RABAT',
    appliedAt: '2026-10-18T08:00:00Z',
    firstContactedAt: '2026-10-18T22:00:00Z', // 14h
    acceptedAt: '2026-10-22T10:00:00Z',
    approvedAt: null,
    realizedAt: null,
    completedAt: null,
    scorecardScore: 75,
    hasBedAllocated: false,
    hasFlightVerified: true,
    isVisaCleared: false,
    daysToArrival: 12,
    isUnreachableCrisis: false,
    contractValueMad: 4500,
    contractStatus: 'SIGNED',
    outboxResolvedInHours: 18,
    standardsDeliveredCount: 8,
  },
  {
    applicationId: 'APP-RABAT-103',
    epName: 'Elena Rostova',
    lcId: 'LC_RABAT',
    appliedAt: '2026-10-01T09:00:00Z',
    firstContactedAt: '2026-10-01T15:00:00Z',
    acceptedAt: '2026-10-05T12:00:00Z',
    approvedAt: '2026-10-09T14:00:00Z',
    realizedAt: '2026-10-24T09:00:00Z',
    completedAt: null,
    scorecardScore: 92,
    hasBedAllocated: true,
    hasFlightVerified: true,
    isVisaCleared: true,
    daysToArrival: 0,
    isUnreachableCrisis: false,
    contractValueMad: 5000,
    contractStatus: 'FULFILLED',
    outboxResolvedInHours: 4,
    standardsDeliveredCount: 17,
  },
];

export default function RoleDashboardsPage() {
  const [activeRole, setActiveRole] = useState<RoleViewType>('VP_IGV');
  const kpis = computeStatutoryKpis(mockDataset);

  const roleMeta: Record<RoleViewType, { title: string; subtitle: string; badge: string }> = {
    LCP: {
      title: 'Local Committee President (LCP) Governance Console',
      subtitle: 'Executive bird’s-eye view, statutory risk radar, cross-functional SLA breaches & AFPM ratio',
      badge: 'Executive Oversight',
    },
    VP_IGV: {
      title: 'VP iGV Operations Command Center',
      subtitle: 'Funnel conversion velocity, OP slot capacity vs incoming EPs, IR tier delivery & 24h SLAs',
      badge: 'Department Head',
    },
    TEAM_LEADER: {
      title: 'iGV Team Leader Operations Hub',
      subtitle: 'Member workload distribution, 80%/100% SLA escalation alerts & interview rubrics',
      badge: 'Mid-Management',
    },
    MEMBER: {
      title: 'Exchange Participant Manager (Member) Workspace',
      subtitle: 'Daily action outbox items, assigned EP pipeline, 24h first-contact countdown & interview tasks',
      badge: 'Front-Line Execution',
    },
    FINANCE_MANAGER: {
      title: 'VP Finance & Legal (FnL) Receivables Ledger',
      subtitle: 'B2B opportunity contract receivables, EP deposit receipts, invoice auditing & refund reserves',
      badge: 'Fiduciary Control',
    },
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header & Role Navigation Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
                {roleMeta[activeRole].title}
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md">
                {roleMeta[activeRole].badge}
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">{roleMeta[activeRole].subtitle}</p>
          </div>

          {/* Role Switcher Pills */}
          <div className="inline-flex p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-medium">
            {(['LCP', 'VP_IGV', 'TEAM_LEADER', 'MEMBER', 'FINANCE_MANAGER'] as RoleViewType[]).map(
              (role) => (
                <button
                  key={role}
                  onClick={() => setActiveRole(role)}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    activeRole === role
                      ? 'bg-sky-500 text-white font-semibold shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {role.replace('_', ' ')}
                </button>
              )
            )}
          </div>
        </div>

        {/* 1. LCP EXECUTIVE VIEW */}
        {activeRole === 'LCP' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="text-xs text-slate-400">Statutory Governance Health</div>
                <div className="text-2xl font-bold text-emerald-400 mt-2 font-mono">100% Grade A</div>
                <div className="text-xs text-slate-500 mt-1">Zero unhandled breaches</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="text-xs text-slate-400">AFPM Exchange Sustainability</div>
                <div className="text-2xl font-bold text-sky-400 mt-2 font-mono">1.34 Ratio</div>
                <div className="text-xs text-slate-500 mt-1">Statutory target &gt; 1.0</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="text-xs text-slate-400">Total Contract Revenue</div>
                <div className="text-2xl font-bold text-amber-400 mt-2 font-mono">
                  {kpis.contractRevenueRealizedMad + kpis.contractReceivablesPendingMad} MAD
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {kpis.contractRevenueRealizedMad} MAD collected
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="text-xs text-slate-400">Safety & Crisis Escalations</div>
                <div className="text-2xl font-bold text-emerald-400 mt-2 font-mono">
                  {kpis.unreachableEpIncidentCount} Active
                </div>
                <div className="text-xs text-slate-500 mt-1">All participants checked-in</div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Executive Risk Radar (LC Rabat)
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-300">14-Day Pre-Arrival Gatekeeper Compliance</span>
                  <span className="font-mono text-emerald-400 font-semibold">
                    {kpis.t14ArrivalReadinessRatePct}% (1 Blocked on bed)
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-300">Overall Process Velocity (APL &rarr; APD)</span>
                  <span className="font-mono text-sky-400 font-semibold">
                    {kpis.avgProcessTimeAplToApdDays} days (SLA &le; 15 days)
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-300">Audit Trail Cryptographic Integrity</span>
                  <span className="font-mono text-emerald-400 font-semibold">
                    {kpis.auditIntegrityVerificationRatePct}% Verified (0 broken links)
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. VP IGV VIEW */}
        {activeRole === 'VP_IGV' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="text-xs text-slate-400">First-Contact SLA (24h)</div>
                <div className="text-2xl font-bold text-emerald-400 mt-2 font-mono">
                  {kpis.firstContactSlaAdherencePct}%
                </div>
                <div className="text-xs text-slate-500 mt-1">Statutory benchmark &ge; 90%</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="text-xs text-slate-400">Process Time (APL &rarr; APD)</div>
                <div className="text-2xl font-bold text-sky-400 mt-2 font-mono">
                  {kpis.avgProcessTimeAplToApdDays} Days
                </div>
                <div className="text-xs text-slate-500 mt-1">THR-003 ceiling &le; 15 days</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="text-xs text-slate-400">18 Standards Score</div>
                <div className="text-2xl font-bold text-indigo-400 mt-2 font-mono">
                  {kpis.standardsFulfillmentAvg} / 18
                </div>
                <div className="text-xs text-slate-500 mt-1">Complete delivery target &ge; 16</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="text-xs text-slate-400">Screening Scorecard Avg</div>
                <div className="text-2xl font-bold text-emerald-400 mt-2 font-mono">
                  {kpis.avgScreeningScorecard}%
                </div>
                <div className="text-xs text-slate-500 mt-1">Statutory cut-off &ge; 70%</div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                iGV Opportunity Capacity & Funnel Pipeline
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-1">
                  <div className="text-slate-400">Open Slot Capacity</div>
                  <div className="text-lg text-white font-bold">12 Slots / 3 Opportunities</div>
                  <div className="text-slate-500">EcoRabat & YouthSpeak Projects</div>
                </div>
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-1">
                  <div className="text-slate-400">Application Velocity</div>
                  <div className="text-lg text-white font-bold">3 Active EPs</div>
                  <div className="text-slate-500">
                    {kpis.epFunnelAcceptanceRatePct}% Acceptance Rate
                  </div>
                </div>
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-1">
                  <div className="text-slate-400">Action Outbox Avg Res.</div>
                  <div className="text-lg text-white font-bold">
                    {kpis.actionOutboxResolutionAvgHours} Hours
                  </div>
                  <div className="text-slate-500">72h deep-links verified</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. TEAM LEADER VIEW */}
        {activeRole === 'TEAM_LEADER' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="text-xs text-slate-400">Active Member Load</div>
                <div className="text-2xl font-bold text-sky-400 mt-2 font-mono">4 Members</div>
                <div className="text-xs text-slate-500 mt-1">Balanced 1:3 EP load ratio</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="text-xs text-slate-400">80% SLA Warning Alerts</div>
                <div className="text-2xl font-bold text-amber-400 mt-2 font-mono">1 Pending</div>
                <div className="text-xs text-slate-500 mt-1">Requires member follow-up</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="text-xs text-slate-400">Interviews Scheduled</div>
                <div className="text-2xl font-bold text-indigo-400 mt-2 font-mono">2 Today</div>
                <div className="text-xs text-slate-500 mt-1">Rubric scorecards prepared</div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Member Assignment & Operational Queue
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Member</th>
                      <th className="px-4 py-3">Assigned EPs</th>
                      <th className="px-4 py-3">Avg First Contact</th>
                      <th className="px-4 py-3">Pending Tasks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono">
                    <tr>
                      <td className="px-4 py-3 text-white font-medium">Youssef Tazi</td>
                      <td className="px-4 py-3">Fatima Zahra Mansouri</td>
                      <td className="px-4 py-3 text-emerald-400">8.0h</td>
                      <td className="px-4 py-3 text-slate-400">0</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-white font-medium">Salma Idrissi</td>
                      <td className="px-4 py-3">Matteo Rossi</td>
                      <td className="px-4 py-3 text-amber-400">14.0h</td>
                      <td className="px-4 py-3 text-amber-300">1 Outbox item</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 4. MEMBER VIEW */}
        {activeRole === 'MEMBER' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="text-xs text-slate-400">My Assigned EPs</div>
                <div className="text-2xl font-bold text-sky-400 mt-2 font-mono">1 Active</div>
                <div className="text-xs text-slate-500 mt-1">Fatima Zahra Mansouri</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="text-xs text-slate-400">Pending Action Outbox Items</div>
                <div className="text-2xl font-bold text-emerald-400 mt-2 font-mono">0 Items</div>
                <div className="text-xs text-slate-500 mt-1">All mutations synced to EXPA</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="text-xs text-slate-400">First-Contact SLA Compliance</div>
                <div className="text-2xl font-bold text-emerald-400 mt-2 font-mono">100%</div>
                <div className="text-xs text-slate-500 mt-1">8h contact response time</div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Assigned Exchange Participant Workflow
              </h3>
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-white">Fatima Zahra Mansouri (APP-RABAT-101)</div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    REALIZED
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] font-mono text-slate-400">
                  <div>Bed: Confirmed (Villa 4)</div>
                  <div>Flight: Verified (RAM-782)</div>
                  <div>Visa: Cleared (Exempt)</div>
                  <div>Scorecard: 88/100</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. FINANCE MANAGER VIEW */}
        {activeRole === 'FINANCE_MANAGER' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="text-xs text-slate-400">Collected Contract Revenue</div>
                <div className="text-2xl font-bold text-emerald-400 mt-2 font-mono">
                  {kpis.contractRevenueRealizedMad} MAD
                </div>
                <div className="text-xs text-slate-500 mt-1">Deposits verified in bank ledger</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="text-xs text-slate-400">Pending Receivables (Signed B2B)</div>
                <div className="text-2xl font-bold text-amber-400 mt-2 font-mono">
                  {kpis.contractReceivablesPendingMad} MAD
                </div>
                <div className="text-xs text-slate-500 mt-1">Invoices issued, awaiting transfer</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="text-xs text-slate-400">Dual-Control Audit Gate (INV-06)</div>
                <div className="text-2xl font-bold text-sky-400 mt-2 font-mono">Enforced</div>
                <div className="text-xs text-slate-500 mt-1">VP FnL + LCP counter-signatures</div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                B2B Contracts & Fiduciary Audit Ledger
              </h3>
              <div className="space-y-3 text-xs font-mono">
                <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <div>
                    <span className="text-white font-semibold">Fondation Mohammed V pour la Solidarité</span>
                    <span className="text-slate-500 ml-2">(CTR-RABAT-2026-001)</span>
                  </div>
                  <span className="text-emerald-400 font-bold">5,000 MAD · PAID</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <div>
                    <span className="text-white font-semibold">Association Marocaine de l'Environnement</span>
                    <span className="text-slate-500 ml-2">(CTR-RABAT-2026-002)</span>
                  </div>
                  <span className="text-amber-400 font-bold">4,500 MAD · PENDING</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
