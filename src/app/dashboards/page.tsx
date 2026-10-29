'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Receipt,
  Download,
  Check,
  X,
  FileCheck2,
  AlertOctagon,
  BookOpen,
  CheckSquare,
  Lock,
  Unlock,
  Coins,
} from 'lucide-react';
import { DataTable, type ColumnDef } from '@/components/ui/data-table';
import { useWorkspace } from '@/components/layout/workspace-context';
import {
  INITIAL_PAYOUT_REQUESTS,
  INITIAL_INVOICES,
  INITIAL_AFPM_STATUS,
  transitionPayoutStatus,
  type PayoutRequest,
  type B2BInvoice,
  type AFPMReserveStatus,
} from '@/lib/finance/finance-types';
import {
  evaluateInvoiceAging,
  calculateIgvCostCoverage,
  type EvaluatedInvoice,
} from '@/lib/finance/finance-aging-engine';
import { UnifiedTaskQueue } from '@/components/tasks/unified-task-queue';
import { KpiDictionaryModal } from '@/components/kpi/kpi-dictionary-modal';

export default function DashboardsFinancePage() {
  const { currentRole } = useWorkspace();
  const [payouts, setPayouts] = useState<PayoutRequest[]>(INITIAL_PAYOUT_REQUESTS);
  const [invoices, setInvoices] = useState<B2BInvoice[]>(INITIAL_INVOICES);
  const [afpm, setAfpm] = useState<AFPMReserveStatus>(INITIAL_AFPM_STATUS);
  const [activeTab, setActiveTab] = useState<'payouts' | 'invoices' | 'tasks' | 'kpis' | 'scorecards'>('payouts');
  const [alertMsg, setAlertMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Sync hash routing on client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('invoice')) setActiveTab('invoices');
      else if (hash.includes('task')) setActiveTab('tasks');
      else if (hash.includes('kpi') || hash.includes('dictionary')) setActiveTab('kpis');
      else if (hash.includes('scorecard')) setActiveTab('scorecards');
      else if (hash.includes('payout')) setActiveTab('payouts');
    }
  }, []);

  // Compute live KPIs
  const evaluatedInvoices = invoices.map((inv) => evaluateInvoiceAging(inv));

  const totalReceivablesMad = evaluatedInvoices
    .filter((inv) => inv.status === 'ISSUED')
    .reduce((acc, inv) => acc + inv.balanceDueMad, 0);

  const overdue14Count = evaluatedInvoices.filter((inv) => inv.isOverdue14Days).length;
  const pendingPayoutsCount = payouts.filter((p) => p.status === 'SUBMITTED' || p.status === 'APPROVED_VP_FNL').length;

  // iGV Cost Coverage calculation
  const igvCoverage = calculateIgvCostCoverage({
    confirmedSponsorshipInflowsMad: 25000, // BMCE Bank Foundation CSR tranche
    totalDirectDeliveryCostsMad: 22000, // Trainee accommodation, pickup, IPS costs
  });

  const handleAuthorizePayout = (request: PayoutRequest, action: 'APPROVE_VP_FNL' | 'APPROVE_LCP') => {
    const res = transitionPayoutStatus(request, action, currentRole);
    if (!res.success) {
      setAlertMsg({ type: 'error', text: res.error || 'Authorization failed' });
      return;
    }

    setPayouts([...payouts]);
    setAlertMsg({
      type: 'success',
      text:
        action === 'APPROVE_LCP'
          ? `Level-2 LCP authorization complete! Funds released to ${request.beneficiary}.`
          : `Level-1 VP Finance authorization recorded. Waiting for LCP counter-signature.`,
    });
    setTimeout(() => setAlertMsg(null), 4000);
  };

  const handleIssueOverdueNotice = (inv: EvaluatedInvoice) => {
    setAlertMsg({
      type: 'success',
      text: `Formal Overdue Freeze Notice & 5% Statutory Penalty Notice (+${inv.statutoryPenaltyMad} MAD) dispatched to ${inv.partnerName}. Opportunity realizations frozen per APIP 3.2.5.`,
    });
    setTimeout(() => setAlertMsg(null), 5000);
  };

  const invoiceColumns: ColumnDef<EvaluatedInvoice>[] = [
    {
      id: 'invoiceNumber',
      header: 'Invoice #',
      accessorKey: 'invoiceNumber',
      sortable: true,
      cell: (inv) => (
        <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
          {inv.invoiceNumber}
        </span>
      ),
    },
    {
      id: 'partnerName',
      header: 'Partner & Deal Title',
      sortable: true,
      cell: (inv) => (
        <div>
          <span className="font-semibold text-xs text-slate-900 dark:text-white block">
            {inv.partnerName}
          </span>
          <span className="text-[10px] text-slate-400">
            {inv.dealTitle}
          </span>
        </div>
      ),
    },
    {
      id: 'amountMad',
      header: 'Total TTC (MAD)',
      accessorKey: 'amountMad',
      sortable: true,
      cell: (inv) => (
        <div className="text-right font-mono">
          <span className="font-bold text-xs text-slate-900 dark:text-white block">
            {inv.amountMad.toLocaleString()} MAD
          </span>
          {inv.balanceDueMad > 0 && inv.balanceDueMad !== inv.amountMad && (
            <span className="text-[10px] text-amber-600 block">
              Due: {inv.balanceDueMad.toLocaleString()} MAD
            </span>
          )}
        </div>
      ),
      align: 'right',
    },
    {
      id: 'agingStatus',
      header: 'Aging & AFPM Status',
      sortable: true,
      cell: (inv) => {
        if (inv.status === 'PAID') {
          return (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
              PAID & RECONCILED
            </span>
          );
        }

        if (inv.isOverdue14Days) {
          return (
            <div className="space-y-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-300 flex items-center gap-1">
                <AlertOctagon className="h-3 w-3 shrink-0" />
                <span>OVERDUE &gt;14 DAYS (5% Penalty Warning)</span>
              </span>
              <span className="text-[10px] text-rose-600 font-mono font-bold block">
                Penalty: +{inv.statutoryPenaltyMad} MAD • Realization Freeze (APIP 3.2.5)
              </span>
            </div>
          );
        }

        if (inv.agingCategory === 'OVERDUE_1_14_GRACE') {
          return (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
              OVERDUE {inv.daysOverdue}D (Grace Period)
            </span>
          );
        }

        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            CURRENT (Due in {Math.abs(inv.daysOverdue)}d)
          </span>
        );
      },
    },
    {
      id: 'dueDate',
      header: 'Payment Deadline',
      accessorKey: 'dueDate',
      sortable: true,
      cell: (inv) => (
        <span className="font-mono text-xs text-slate-600 dark:text-slate-400">
          Due {inv.dueDate}
        </span>
      ),
    },
    {
      id: 'action',
      header: 'Statutory Action',
      cell: (inv) => (
        <div className="text-right">
          {inv.isOverdue14Days && (
            <button
              onClick={() => handleIssueOverdueNotice(inv)}
              className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold shadow-sm"
            >
              Issue Freeze Notice
            </button>
          )}
          {inv.status === 'PAID' && (
            <span className="text-[10px] text-emerald-600 font-mono">
              ✓ Receipt Signed
            </span>
          )}
        </div>
      ),
      align: 'right',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-aiesec-blue mb-1">
            <ShieldCheck className="h-4 w-4" />
            <span>AFPM Section 6 Governance & Dual Approval Protocol (SM-08)</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Financial Sustainability, Invoices & Master KPI Hub
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Reconciled bank reserve balance, strict invoice aging (&gt;14d realization freeze), unified cross-module task queue, and non-fictional KPI Dictionary.
          </p>
        </div>
      </div>

      {/* Alert Banner */}
      {alertMsg && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between shadow-sm animate-in fade-in ${
            alertMsg.type === 'error'
              ? 'bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900'
              : 'bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900'
          }`}
        >
          <span>{alertMsg.text}</span>
          <button onClick={() => setAlertMsg(null)} className="font-bold">✕</button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">AFPM Reserve Balance</span>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white font-mono">
            {afpm.current_liquid_balance_mad.toLocaleString()} MAD
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            {afpm.solvency_ratio_percentage}% Solvency Ratio (&gt;50,000 MAD Min)
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">iGV Cost Coverage</span>
            <Coins className="h-4 w-4 text-aiesec-blue" />
          </div>
          <div className="mt-2 text-2xl font-bold text-aiesec-blue font-mono">
            {igvCoverage.coverageRatioPercentage}% Covered
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Target &ge; 70-100% (+{igvCoverage.netPositionMad.toLocaleString()} MAD Net)
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Overdue &gt;14d Invoices</span>
            <Receipt className="h-4 w-4 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-600 font-mono">
            {overdue14Count} Alert
          </div>
          <div className="mt-1 text-[11px] text-rose-600 font-semibold">
            5% Penalty & Realization Freeze Warning
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Dual Approvals Pending</span>
            <Clock className="h-4 w-4 text-purple-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-purple-600">
            {pendingPayoutsCount} Requests
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Requires VP FNL & LCP countersignature
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-4">
        <button
          onClick={() => setActiveTab('payouts')}
          className={`pb-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'payouts'
              ? 'border-aiesec-blue text-aiesec-blue dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Dual-Approval Payouts ({payouts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('invoices')}
          className={`pb-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'invoices'
              ? 'border-aiesec-blue text-aiesec-blue dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Receipt className="h-4 w-4" />
          <span>Invoices & Aging Ledger ({invoices.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`pb-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'tasks'
              ? 'border-aiesec-blue text-aiesec-blue dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <CheckSquare className="h-4 w-4" />
          <span>Unified Cross-Module Tasks</span>
        </button>

        <button
          onClick={() => setActiveTab('kpis')}
          className={`pb-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'kpis'
              ? 'border-aiesec-blue text-aiesec-blue dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>Master KPI Dictionary</span>
        </button>

        <button
          onClick={() => setActiveTab('scorecards')}
          className={`pb-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'scorecards'
              ? 'border-aiesec-blue text-aiesec-blue dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          <span>Department Scorecards</span>
        </button>
      </div>

      {/* Tab 1: Dual-Approval Payouts */}
      {activeTab === 'payouts' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900/60 dark:bg-blue-950/20 text-xs text-blue-800 dark:text-blue-300">
            <strong>SM-08 Statutory Governance:</strong> In conformity with AFPM controls, all liquid disbursements require Level-1 authorization by VP Finance, followed by Level-2 counter-signature by the Local Committee President (LCP). Mandatory proof receipts must be filed.
          </div>

          <div className="space-y-3">
            {payouts.map((req) => (
              <div
                key={req.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-subtle dark:border-slate-800 dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                      req.status === 'RELEASED'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : req.status === 'APPROVED_VP_FNL'
                        ? 'bg-blue-50 text-blue-800 border-blue-300'
                        : req.status === 'SUBMITTED'
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : 'bg-rose-50 text-rose-800 border-rose-300'
                    }`}>
                      {req.status.replace(/_/g, ' ')}
                    </span>
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {req.title}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500">
                    Beneficiary: <strong className="text-slate-700 dark:text-slate-300">{req.beneficiary}</strong> • Submitted by {req.submitted_by_name}
                  </div>

                  <div className="text-[11px] font-mono text-slate-400">
                    {req.vp_fnl_approved_at && <span>✓ VP Finance Approved • </span>}
                    {req.lcp_approved_at && <span>✓ LCP Counter-Signed • </span>}
                    <span>Category: {req.category}</span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                  <div className="text-right">
                    <span className="font-mono text-base font-bold text-slate-900 dark:text-white block">
                      {req.amount_mad.toLocaleString()} MAD
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Liquid Payout
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {req.status === 'SUBMITTED' && (
                      <button
                        onClick={() => handleAuthorizePayout(req, 'APPROVE_VP_FNL')}
                        className="px-3 py-1 rounded bg-aiesec-blue text-white text-xs font-semibold hover:bg-aiesec-blue/90 shadow-sm"
                      >
                        Level-1: Sign (VP FNL)
                      </button>
                    )}

                    {req.status === 'APPROVED_VP_FNL' && (
                      <button
                        onClick={() => handleAuthorizePayout(req, 'APPROVE_LCP')}
                        className="px-3 py-1 rounded bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 shadow-sm"
                      >
                        Level-2: Counter-Sign (LCP)
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Invoices & Aging Ledger Table */}
      {activeTab === 'invoices' && (
        <DataTable
          data={evaluatedInvoices}
          columns={invoiceColumns}
          keyExtractor={(inv) => inv.id}
          entityType="INVOICE"
          searchPlaceholder="Search invoices by number, partner, deal title..."
          exportFileName="aiesec-rabat-afpm-invoices.csv"
        />
      )}

      {/* Tab 3: Unified Cross-Module Tasks */}
      {activeTab === 'tasks' && <UnifiedTaskQueue />}

      {/* Tab 4: Master KPI Dictionary */}
      {activeTab === 'kpis' && <KpiDictionaryModal isInlineView={true} />}

      {/* Tab 5: Reconciled Department Scorecards */}
      {activeTab === 'scorecards' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Business Development (BD) Scorecard
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Total B2B Pipeline Volume:</span>
                <span className="font-mono font-bold">192,000 MAD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">MoU Conversion Rate:</span>
                <span className="font-mono font-bold text-emerald-600">67% (4/6 Deals)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Overdue Touchpoint Actions:</span>
                <span className="font-mono font-bold text-rose-600">1 Overdue</span>
              </div>
            </div>
            <Link href="/sales" className="block text-xs font-semibold text-aiesec-blue hover:underline">
              → Drill down to CRM records
            </Link>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Customer Experience (CXP) Scorecard
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Active Realized Trainees:</span>
                <span className="font-mono font-bold">4 In-Country</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">18 Standards Compliance:</span>
                <span className="font-mono font-bold text-emerald-600">100% On-Track</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Day-1 Accompaniment Rate:</span>
                <span className="font-mono font-bold">100% Delivered</span>
              </div>
            </div>
            <Link href="/accommodation" className="block text-xs font-semibold text-aiesec-blue hover:underline">
              → Drill down to Delivery records
            </Link>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Finance & Legal (FNL) Scorecard
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">AFPM Solvency Ratio:</span>
                <span className="font-mono font-bold text-emerald-600">165% Compliant</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Uncollected &gt;14d Invoices:</span>
                <span className="font-mono font-bold text-rose-600">36,000 MAD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">iGV Cost Coverage Ratio:</span>
                <span className="font-mono font-bold text-emerald-600">{igvCoverage.coverageRatioPercentage}%</span>
              </div>
            </div>
            <Link href="/dashboards#invoices" className="block text-xs font-semibold text-aiesec-blue hover:underline">
              → Drill down to Aging Invoices
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
