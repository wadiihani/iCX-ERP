'use client';

import React, { useState } from 'react';
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

export default function DashboardsFinancePage() {
  const { currentRole } = useWorkspace();
  const [payouts, setPayouts] = useState<PayoutRequest[]>(INITIAL_PAYOUT_REQUESTS);
  const [invoices, setInvoices] = useState<B2BInvoice[]>(INITIAL_INVOICES);
  const [afpm, setAfpm] = useState<AFPMReserveStatus>(INITIAL_AFPM_STATUS);
  const [activeTab, setActiveTab] = useState<'payouts' | 'invoices' | 'scorecards'>('payouts');
  const [alertMsg, setAlertMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Compute live KPIs
  const totalReceivablesMad = invoices
    .filter((inv) => inv.status === 'ISSUED')
    .reduce((acc, inv) => acc + inv.amount_mad, 0);

  const pendingPayoutsCount = payouts.filter((p) => p.status === 'SUBMITTED' || p.status === 'APPROVED_VP_FNL').length;

  const handleAuthorizePayout = (request: PayoutRequest, action: 'APPROVE_VP_FNL' | 'APPROVE_LCP') => {
    const res = transitionPayoutStatus(request, action, currentRole);
    if (!res.success) {
      setAlertMsg({ type: 'error', text: res.error || 'Authorization failed' });
      return;
    }

    setPayouts([...payouts]);
    setAlertMsg({
      type: 'success',
      text: action === 'APPROVE_LCP'
        ? `Level-2 LCP authorization complete! Funds released to ${request.beneficiary}.`
        : `Level-1 VP Finance authorization recorded. Waiting for LCP counter-signature.`,
    });
    setTimeout(() => setAlertMsg(null), 4000);
  };

  const invoiceColumns: ColumnDef<B2BInvoice>[] = [
    {
      id: 'invoice_number',
      header: 'Invoice #',
      accessorKey: 'invoice_number',
      sortable: true,
      cell: (inv) => (
        <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
          {inv.invoice_number}
        </span>
      ),
    },
    {
      id: 'partner_organization_name',
      header: 'Partner & Deal Title',
      sortable: true,
      cell: (inv) => (
        <div>
          <span className="font-semibold text-xs text-slate-900 dark:text-white block">
            {inv.partner_organization_name}
          </span>
          <span className="text-[10px] text-slate-400">
            {inv.deal_title}
          </span>
        </div>
      ),
    },
    {
      id: 'amount_mad',
      header: 'Amount (MAD)',
      accessorKey: 'amount_mad',
      sortable: true,
      cell: (inv) => (
        <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
          {inv.amount_mad.toLocaleString()} MAD
        </span>
      ),
      align: 'right',
    },
    {
      id: 'aging_bucket',
      header: 'Aging Status',
      accessorKey: 'aging_bucket',
      sortable: true,
      filterable: true,
      filterOptions: [
        { label: 'Current (< 30d)', value: 'CURRENT' },
        { label: 'Overdue (1-30d)', value: 'OVERDUE_1_30' },
        { label: 'Overdue (31-60d)', value: 'OVERDUE_31_60' },
      ],
      cell: (inv) => {
        const agingPills = {
          CURRENT: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300',
          OVERDUE_1_30: 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300',
          OVERDUE_31_60: 'bg-orange-50 text-orange-800 border-orange-300 dark:bg-orange-950/40 dark:text-orange-300',
          OVERDUE_60_PLUS: 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300',
        };
        return (
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${agingPills[inv.aging_bucket]}`}>
            {inv.aging_bucket.replace('_', ' ')}
          </span>
        );
      },
    },
    {
      id: 'due_date',
      header: 'Payment Deadline',
      accessorKey: 'due_date',
      sortable: true,
      cell: (inv) => (
        <span className="font-mono text-xs text-slate-600 dark:text-slate-400">
          Due {inv.due_date}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Payment Status',
      accessorKey: 'status',
      sortable: true,
      cell: (inv) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
          inv.status === 'PAID'
            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
            : 'bg-slate-100 text-slate-700 border-slate-300'
        }`}>
          {inv.status}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-aiesec-blue mb-1">
            <ShieldCheck className="h-4 w-4" />
            <span>FIN-01 Dual Approval & AFPM Statutory Governance</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Operational Finance Ledger & KPI Dashboards
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Strict two-key dual approvals (`SM-08`), AFPM reserve solvency monitoring, and 100% reconciled KPI scorecards.
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
            <span className="text-xs font-semibold uppercase tracking-wider">Liquid Bank Balance</span>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white font-mono">
            {afpm.current_liquid_balance_mad.toLocaleString()} MAD
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            Reconciled bank ledger
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">AFPM Solvency Ratio</span>
            <ShieldCheck className="h-4 w-4 text-aiesec-blue" />
          </div>
          <div className="mt-2 text-2xl font-bold text-aiesec-blue font-mono">
            {afpm.solvency_ratio_percentage}%
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Min requirement: 50,000 MAD (Compliant)
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Accounts Receivable</span>
            <Receipt className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white font-mono">
            {totalReceivablesMad.toLocaleString()} MAD
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Invoiced partner realization grants
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
            Require VP Finance / LCP authorization
          </div>
        </div>
      </div>

      {/* Tabs */}
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
          <span>Dual-Approval Payout Queue ({payouts.length})</span>
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
          <span>B2B Invoices & Aging ({invoices.length})</span>
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
          <span>Reconciled Department Scorecards</span>
        </button>
      </div>

      {/* Tab 1: Dual-Approval Payout Authorization Queue */}
      {activeTab === 'payouts' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900/60 dark:bg-blue-950/20 text-xs text-blue-800 dark:text-blue-300">
            <strong>SM-08 Strict Governance:</strong> All expense payouts require Level-1 authorization by VP Finance, followed by Level-2 counter-signature by the Local Committee President (LCP). No single executive can disburse funds unilaterally.
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

      {/* Tab 2: Invoices Ledger Table */}
      {activeTab === 'invoices' && (
        <DataTable
          data={invoices}
          columns={invoiceColumns}
          keyExtractor={(inv) => inv.id}
          entityType="INVOICE"
          searchPlaceholder="Search invoices by number, partner, deal title..."
          exportFileName="aiesec-rabat-b2b-invoices.csv"
        />
      )}

      {/* Tab 3: Reconciled Department Scorecards */}
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
                <span className="text-slate-600 dark:text-slate-400">Uncollected &gt; 30d Invoices:</span>
                <span className="font-mono font-bold text-amber-600">36,000 MAD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Dual Authorization SLA:</span>
                <span className="font-mono font-bold text-emerald-600">&lt; 24h Average</span>
              </div>
            </div>
            <Link href="/dashboards" className="block text-xs font-semibold text-aiesec-blue hover:underline">
              → Drill down to Finance ledger
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
