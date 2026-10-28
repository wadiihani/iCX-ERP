'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Columns3,
  Table as TableIcon,
  Plus,
  AlertTriangle,
  FileCheck,
  CheckCircle2,
  XCircle,
  Filter,
} from 'lucide-react';
import { transitionDealStage, type DealRecord, type PipelineStage } from '@/lib/sales/pipeline-machine';
import { DiscoveryModal } from '@/components/sales/discovery-modal';
import { OutreachModal } from '@/components/sales/outreach-modal';
import { DataTable, type ColumnDef } from '@/components/ui/data-table';
import type { DiscoveryQuestionnaireAnswers } from '@/lib/sales/discovery-questionnaire';

const STAGES: Array<{ id: PipelineStage; label: string; color: string; badge: string }> = [
  { id: 'LEAD', label: '1. New Leads', color: 'border-slate-300', badge: 'bg-slate-100 text-slate-700' },
  { id: 'CONTACTED', label: '2. Contacted', color: 'border-blue-300', badge: 'bg-blue-50 text-blue-700' },
  { id: 'MEETING_SCHEDULED', label: '3. Meeting Done', color: 'border-amber-300', badge: 'bg-amber-50 text-amber-700' },
  { id: 'DISCOVERY_COMPLETED', label: '4. Discovery Done', color: 'border-indigo-300', badge: 'bg-indigo-50 text-indigo-700' },
  { id: 'PROPOSAL_SENT', label: '5. Proposal Sent', color: 'border-purple-300', badge: 'bg-purple-50 text-purple-700' },
  { id: 'NEGOTIATION', label: '6. Negotiation', color: 'border-sky-300', badge: 'bg-sky-50 text-sky-700' },
  { id: 'CONTRACT_SIGNED', label: '7. Contract Signed', color: 'border-emerald-300', badge: 'bg-emerald-50 text-emerald-700' },
  { id: 'CLOSED_LOST', label: 'Closed Lost', color: 'border-rose-300', badge: 'bg-rose-50 text-rose-700' },
];

const INITIAL_DEALS: DealRecord[] = [
  {
    id: 'deal-1',
    lcId: 'lc_rabat_001',
    organizationId: 'org_rabat_001',
    stage: 'NEGOTIATION',
    dealValue: 45000,
    product: 'igv',
    assignedTo: 'Youssef Mansouri',
    discoveryAnswers: {
      sdgGoal: 4,
      weeklyWorkingHours: 30,
      durationWeeks: 6,
      hasSupervisorAssigned: true,
      supervisorName: 'Dr. Leila Benhayoun',
      accommodationConfirmed: true,
      fundingCommitmentPercentage: 100,
      completedAt: '2026-10-20T10:00:00Z',
      completedBy: 'Youssef Mansouri',
    },
    history: [],
  },
  {
    id: 'deal-2',
    lcId: 'lc_rabat_001',
    organizationId: 'org_rabat_002',
    stage: 'CONTRACT_SIGNED',
    dealValue: 72000,
    product: 'igt',
    assignedTo: 'Mehdi Benjelloun',
    discoveryAnswers: {
      sdgGoal: 4,
      weeklyWorkingHours: 35,
      durationWeeks: 12,
      hasSupervisorAssigned: true,
      supervisorName: 'Sarah Williams',
      accommodationConfirmed: true,
      fundingCommitmentPercentage: 100,
      completedAt: '2026-09-15T14:00:00Z',
      completedBy: 'Mehdi Benjelloun',
    },
    history: [],
  },
  {
    id: 'deal-3',
    lcId: 'lc_rabat_001',
    organizationId: 'org_rabat_003',
    stage: 'MEETING_SCHEDULED',
    dealValue: 28000,
    product: 'igt',
    assignedTo: 'Sara Kabbaj',
    history: [],
  },
  {
    id: 'deal-4',
    lcId: 'lc_rabat_001',
    organizationId: 'org_rabat_004',
    stage: 'LEAD',
    dealValue: 12000,
    product: 'igv',
    assignedTo: 'Mehdi Benjelloun',
    history: [],
  },
];

export default function PipelinePage() {
  const [deals, setDeals] = useState<DealRecord[]>(INITIAL_DEALS);
  const [viewMode, setViewMode] = useState<'board' | 'table'>('board');
  const [activeDiscoveryDeal, setActiveDiscoveryDeal] = useState<DealRecord | null>(null);
  const [activeOutreachDeal, setActiveOutreachDeal] = useState<DealRecord | null>(null);
  const [closedLostDeal, setClosedLostDeal] = useState<DealRecord | null>(null);
  const [closedLostReason, setClosedLostReason] = useState('BUDGET_CANCELLED');
  const [closedLostNotes, setClosedLostNotes] = useState('');
  const [alertMsg, setAlertMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const getOrgName = (orgId: string) => {
    switch (orgId) {
      case 'org_rabat_001':
        return 'BMCE Bank Foundation';
      case 'org_rabat_002':
        return 'Rabat American School';
      case 'org_rabat_003':
        return 'Casatech Innovation Labs';
      case 'org_rabat_004':
        return 'Medina Green Initiative (NGO)';
      default:
        return 'Corporate Partner';
    }
  };

  const handleStageAdvance = (deal: DealRecord, targetStage: PipelineStage) => {
    if (targetStage === 'CLOSED_LOST') {
      setClosedLostDeal(deal);
      return;
    }

    const res = transitionDealStage(deal, targetStage, 'current_user');
    if (!res.success) {
      setAlertMsg({ type: 'error', text: res.error || 'Failed to advance stage' });
      return;
    }

    setDeals([...deals]);
    setAlertMsg({
      type: 'success',
      text: `Deal successfully moved to ${targetStage.replace('_', ' ')}.`,
    });
    setTimeout(() => setAlertMsg(null), 4000);
  };

  const handleConfirmClosedLost = () => {
    if (!closedLostDeal) return;
    const reasonText = `${closedLostReason}: ${closedLostNotes}`.trim();
    const res = transitionDealStage(closedLostDeal, 'CLOSED_LOST', 'current_user', reasonText);
    if (!res.success) {
      setAlertMsg({ type: 'error', text: res.error || 'Failed to close lost' });
      return;
    }

    setDeals([...deals]);
    setClosedLostDeal(null);
    setClosedLostNotes('');
    setAlertMsg({
      type: 'success',
      text: `Deal marked Closed Lost. Reason preserved for audit and conversion analytics.`,
    });
    setTimeout(() => setAlertMsg(null), 4000);
  };

  const handleDiscoverySaved = (answers: DiscoveryQuestionnaireAnswers) => {
    if (!activeDiscoveryDeal) return;
    activeDiscoveryDeal.discoveryAnswers = answers;
    activeDiscoveryDeal.stage = 'DISCOVERY_COMPLETED';
    setDeals([...deals]);
    setAlertMsg({
      type: 'success',
      text: 'Statutory Discovery Questionnaire verified! Deal unlocked for Proposal submission.',
    });
    setTimeout(() => setAlertMsg(null), 4000);
  };

  const tableColumns: ColumnDef<DealRecord>[] = [
    {
      id: 'organization',
      header: 'Partner Organization',
      cell: (deal) => (
        <div>
          <span className="font-semibold text-slate-900 dark:text-white block">
            {getOrgName(deal.organizationId)}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {deal.id.toUpperCase()} • LC Rabat
          </span>
        </div>
      ),
      sortable: true,
    },
    {
      id: 'product',
      header: 'Product',
      accessorKey: 'product',
      sortable: true,
      cell: (deal) => {
        const productPills = {
          igv: 'bg-[#F85A40]/10 text-[#F85A40] border-[#F85A40]/30',
          igt: 'bg-[#0CB9C1]/10 text-[#0CB9C1] border-[#0CB9C1]/30',
          igte: 'bg-[#F48924]/10 text-[#F48924] border-[#F48924]/30',
        };
        return (
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${productPills[deal.product]}`}>
            {deal.product === 'igt' ? 'iGTa' : deal.product.toUpperCase()}
          </span>
        );
      },
    },
    {
      id: 'stage',
      header: 'Pipeline Stage',
      accessorKey: 'stage',
      sortable: true,
      cell: (deal) => {
        const stageObj = STAGES.find((s) => s.id === deal.stage);
        return (
          <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${stageObj?.badge || 'bg-slate-100'}`}>
            {stageObj?.label || deal.stage}
          </span>
        );
      },
    },
    {
      id: 'dealValue',
      header: 'Contract Value',
      accessorKey: 'dealValue',
      sortable: true,
      cell: (deal) => (
        <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
          {deal.dealValue.toLocaleString()} MAD
        </span>
      ),
      align: 'right',
    },
    {
      id: 'assignedTo',
      header: 'Account Owner',
      accessorKey: 'assignedTo',
      sortable: true,
      cell: (deal) => (
        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
          {deal.assignedTo}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/sales" className="hover:text-slate-900 dark:hover:text-white">
              B2B CRM Directory
            </Link>
            <span>/</span>
            <span className="text-aiesec-blue font-semibold">Deal Pipeline (SM-01)</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            B2B Partner Sales Pipeline & Deals
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            State machine governed pipeline (`SM-01`) enforcing mandatory Discovery before Proposal submission.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900 shadow-subtle">
            <button
              onClick={() => setViewMode('board')}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                viewMode === 'board'
                  ? 'bg-aiesec-blue text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              <Columns3 className="h-3.5 w-3.5" />
              <span>Pipeline Board</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                viewMode === 'table'
                  ? 'bg-aiesec-blue text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              <TableIcon className="h-3.5 w-3.5" />
              <span>Deal Table</span>
            </button>
          </div>
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

      {/* Kanban Board View */}
      {viewMode === 'board' && (
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-3 overflow-x-auto pb-4">
          {STAGES.map((col) => {
            const colDeals = deals.filter((d) => d.stage === col.id);

            return (
              <div
                key={col.id}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-3 flex flex-col min-h-[480px] min-w-[200px]"
              >
                <div className={`border-t-2 ${col.color} pt-2 pb-2.5 mb-2 flex justify-between items-center`}>
                  <span className="font-bold text-[11px] text-slate-800 dark:text-slate-200">
                    {col.label}
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-mono font-bold text-slate-500">
                    {colDeals.length}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1 overflow-y-auto">
                  {colDeals.map((deal) => (
                    <div
                      key={deal.id}
                      className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-2 text-xs"
                    >
                      <div className="font-bold text-slate-900 dark:text-white line-clamp-1">
                        {getOrgName(deal.organizationId)}
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-slate-500">
                        <span className="font-mono font-semibold">{deal.dealValue.toLocaleString()} MAD</span>
                        <span className="font-bold uppercase text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                          {deal.product}
                        </span>
                      </div>

                      {deal.discoveryAnswers && (
                        <div className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 text-[10px] font-semibold border border-emerald-200">
                          ✓ Discovery Gate Cleared
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1">
                        <button
                          onClick={() => setActiveOutreachDeal(deal)}
                          className="w-full py-1 text-[10px] font-bold text-aiesec-blue hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded"
                        >
                          ✉ Send Outreach Packet
                        </button>

                        {deal.stage === 'MEETING_SCHEDULED' && (
                          <button
                            onClick={() => setActiveDiscoveryDeal(deal)}
                            className="w-full py-1 text-[10px] font-bold bg-amber-500 hover:bg-amber-600 text-white rounded shadow-sm"
                          >
                            + Fill Discovery Form
                          </button>
                        )}

                        {deal.stage === 'LEAD' && (
                          <button
                            onClick={() => handleStageAdvance(deal, 'CONTACTED')}
                            className="w-full py-1 text-[10px] font-semibold bg-aiesec-blue text-white rounded"
                          >
                            → Mark Contacted
                          </button>
                        )}

                        {deal.stage === 'CONTACTED' && (
                          <button
                            onClick={() => handleStageAdvance(deal, 'MEETING_SCHEDULED')}
                            className="w-full py-1 text-[10px] font-semibold bg-aiesec-blue text-white rounded"
                          >
                            → Schedule Meeting
                          </button>
                        )}

                        {deal.stage === 'DISCOVERY_COMPLETED' && (
                          <button
                            onClick={() => handleStageAdvance(deal, 'PROPOSAL_SENT')}
                            className="w-full py-1 text-[10px] font-semibold bg-purple-600 text-white rounded shadow-sm"
                          >
                            → Send Proposal
                          </button>
                        )}

                        {deal.stage === 'PROPOSAL_SENT' && (
                          <button
                            onClick={() => handleStageAdvance(deal, 'NEGOTIATION')}
                            className="w-full py-1 text-[10px] font-semibold bg-sky-600 text-white rounded"
                          >
                            → Enter Negotiation
                          </button>
                        )}

                        {deal.stage === 'NEGOTIATION' && (
                          <button
                            onClick={() => handleStageAdvance(deal, 'CONTRACT_SIGNED')}
                            className="w-full py-1 text-[10px] font-semibold bg-emerald-600 text-white rounded"
                          >
                            ✓ Mark Contract Signed
                          </button>
                        )}

                        {deal.stage !== 'CONTRACT_SIGNED' && deal.stage !== 'CLOSED_LOST' && (
                          <button
                            onClick={() => handleStageAdvance(deal, 'CLOSED_LOST')}
                            className="w-full py-0.5 text-[9px] font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded"
                          >
                            ✕ Mark Closed Lost
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <DataTable
          data={deals}
          columns={tableColumns}
          keyExtractor={(d) => d.id}
          entityType="DEAL"
          searchPlaceholder="Search deals by organization, product, owner..."
          exportFileName="aiesec-rabat-b2b-deals.csv"
        />
      )}

      {/* Closed Lost Reason Modal */}
      {closedLostDeal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in"
        >
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Record Closed Lost Reason
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Capturing the verified loss reason for {getOrgName(closedLostDeal.organizationId)} is required for partnership analytics.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Loss Reason *
                </label>
                <select
                  value={closedLostReason}
                  onChange={(e) => setClosedLostReason(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="BUDGET_CANCELLED">Budget Cancelled / Frozen</option>
                  <option value="CHOSE_COMPETITOR">Chose Competitor / Direct Hiring</option>
                  <option value="UNRESPONSIVE">Unresponsive to Follow-ups (&gt; 30 days)</option>
                  <option value="VISA_PROJECT_REJECTED">Visa / Feasibility Rejected</option>
                  <option value="TIMING_MISMATCH">Timing Mismatch for Current Quarter</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Additional Context / Feedback
                </label>
                <textarea
                  rows={3}
                  value={closedLostNotes}
                  onChange={(e) => setClosedLostNotes(e.target.value)}
                  placeholder="Detail partner feedback, future re-engagement dates, or key learnings..."
                  className="w-full rounded-md border border-slate-200 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setClosedLostDeal(null)}
                className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmClosedLost}
                className="rounded-md bg-rose-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow hover:bg-rose-700"
              >
                Confirm Closed Lost
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discovery Modal */}
      <DiscoveryModal
        isOpen={Boolean(activeDiscoveryDeal)}
        onClose={() => setActiveDiscoveryDeal(null)}
        dealId={activeDiscoveryDeal?.id || ''}
        partnerName={getOrgName(activeDiscoveryDeal?.organizationId || '')}
        onSaved={handleDiscoverySaved}
      />

      {/* Outreach Modal */}
      <OutreachModal
        isOpen={Boolean(activeOutreachDeal)}
        onClose={() => setActiveOutreachDeal(null)}
        partnerName={getOrgName(activeOutreachDeal?.organizationId || '')}
        contactName="Partner Representative"
        city="Rabat"
      />
    </div>
  );
}
