'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Layers,
  Table as TableIcon,
  Columns3,
  Plus,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Globe2,
} from 'lucide-react';
import { CreateOpportunityModal } from '@/components/opportunity/create-opportunity-modal';
import { transitionOpportunityStatus, checkOpportunityReviewSLA, type OpportunityLifecycleRecord } from '@/lib/opportunity/opportunity-machine';
import { reserveSlot, type OpportunitySlot } from '@/lib/opportunity/slot-machine';
import type { OpportunityInput } from '@/lib/opportunity/opportunity-validator';
import { DataTable, type ColumnDef } from '@/components/ui/data-table';

export interface ExtendedOpportunity extends OpportunityLifecycleRecord {
  product: 'igv' | 'igt' | 'igte';
  organizationName: string;
  sdgTarget: number;
  durationWeeks: number;
  weeklyWorkingHours: number;
  fundingPercentage: number;
  slots: OpportunitySlot[];
}

const INITIAL_OPPORTUNITIES: ExtendedOpportunity[] = [
  {
    id: 'opp-1',
    lcId: 'lc_rabat_001',
    organizationId: 'org_rabat_001',
    organizationName: 'BMCE Bank Foundation',
    title: 'Youth Digital Literacy & Coding Coach',
    product: 'igv',
    sdgTarget: 4,
    status: 'APPLICATIONS_OPEN',
    createdAt: '2026-10-20T10:00:00Z',
    submittedForReviewAt: '2026-10-21T10:00:00Z',
    approvedAt: '2026-10-22T14:00:00Z',
    totalOpenings: 5,
    availableOpenings: 3,
    durationWeeks: 6,
    weeklyWorkingHours: 30,
    fundingPercentage: 100,
    history: [],
    slots: [
      { id: 's1', opportunityId: 'opp-1', slotNumber: 1, startDate: '2026-11-01', endDate: '2026-12-15', status: 'CONFIRMED' },
      { id: 's2', opportunityId: 'opp-1', slotNumber: 2, startDate: '2026-11-01', endDate: '2026-12-15', status: 'RESERVED' },
      { id: 's3', opportunityId: 'opp-1', slotNumber: 3, startDate: '2026-11-01', endDate: '2026-12-15', status: 'UNALLOCATED' },
      { id: 's4', opportunityId: 'opp-1', slotNumber: 4, startDate: '2026-11-01', endDate: '2026-12-15', status: 'UNALLOCATED' },
      { id: 's5', opportunityId: 'opp-1', slotNumber: 5, startDate: '2026-11-01', endDate: '2026-12-15', status: 'UNALLOCATED' },
    ],
  },
  {
    id: 'opp-2',
    lcId: 'lc_rabat_001',
    organizationId: 'org_rabat_002',
    organizationName: 'Rabat American School',
    title: 'STEM & Robotics Teaching Assistant',
    product: 'igt',
    sdgTarget: 4,
    status: 'APPLICATIONS_OPEN',
    createdAt: '2026-09-20T09:00:00Z',
    submittedForReviewAt: '2026-09-21T09:30:00Z',
    approvedAt: '2026-09-23T10:00:00Z',
    totalOpenings: 3,
    availableOpenings: 1,
    durationWeeks: 12,
    weeklyWorkingHours: 35,
    fundingPercentage: 100,
    history: [],
    slots: [
      { id: 's6', opportunityId: 'opp-2', slotNumber: 1, startDate: '2026-11-15', endDate: '2027-02-15', status: 'CONFIRMED' },
      { id: 's7', opportunityId: 'opp-2', slotNumber: 2, startDate: '2026-11-15', endDate: '2027-02-15', status: 'CONFIRMED' },
      { id: 's8', opportunityId: 'opp-2', slotNumber: 3, startDate: '2026-11-15', endDate: '2027-02-15', status: 'UNALLOCATED' },
    ],
  },
  {
    id: 'opp-3',
    lcId: 'lc_rabat_001',
    organizationId: 'org_rabat_003',
    organizationName: 'Casatech Innovation Labs',
    title: 'Fullstack React & Node.js Software Engineer',
    product: 'igt',
    sdgTarget: 8,
    status: 'OPEN',
    createdAt: '2026-10-10T14:00:00Z',
    submittedForReviewAt: '2026-10-11T10:00:00Z',
    approvedAt: '2026-10-12T16:00:00Z',
    totalOpenings: 2,
    availableOpenings: 2,
    durationWeeks: 26,
    weeklyWorkingHours: 40,
    fundingPercentage: 100,
    history: [],
    slots: [
      { id: 's9', opportunityId: 'opp-3', slotNumber: 1, startDate: '2027-01-05', endDate: '2027-07-05', status: 'UNALLOCATED' },
      { id: 's10', opportunityId: 'opp-3', slotNumber: 2, startDate: '2027-01-05', endDate: '2027-07-05', status: 'UNALLOCATED' },
    ],
  },
];

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<ExtendedOpportunity[]>(INITIAL_OPPORTUNITIES);
  const [viewMode, setViewMode] = useState<'table' | 'capacity'>('table');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Computed counters
  const totalOpenings = opportunities.reduce((acc, o) => acc + o.totalOpenings, 0);
  const confirmedSlots = opportunities.flatMap(o => o.slots).filter(s => s.status === 'CONFIRMED').length;
  const reservedSlots = opportunities.flatMap(o => o.slots).filter(s => s.status === 'RESERVED').length;
  const unallocatedSlots = opportunities.flatMap(o => o.slots).filter(s => s.status === 'UNALLOCATED').length;

  const handleCreated = (input: OpportunityInput) => {
    const newOpp: ExtendedOpportunity = {
      id: `opp-${Date.now()}`,
      lcId: 'lc_rabat_001',
      organizationId: 'org_rabat_001',
      organizationName: 'Corporate Partner',
      title: input.title,
      product: input.product,
      sdgTarget: input.sdgTarget || 4,
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      totalOpenings: input.totalOpenings,
      availableOpenings: input.totalOpenings,
      durationWeeks: input.durationWeeks,
      weeklyWorkingHours: input.weeklyWorkingHours,
      fundingPercentage: input.fundingPercentage,
      history: [],
      slots: Array.from({ length: input.totalOpenings }, (_, i) => ({
        id: `s-${Date.now()}-${i + 1}`,
        opportunityId: `opp-${Date.now()}`,
        slotNumber: i + 1,
        startDate: input.startDate,
        endDate: input.endDate,
        status: 'UNALLOCATED',
      })),
    };

    setOpportunities([newOpp, ...opportunities]);
    setNotification(`Opportunity "${newOpp.title}" created with verified statutory parameters.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const tableColumns: ColumnDef<ExtendedOpportunity>[] = [
    {
      id: 'title',
      header: 'Opportunity & Partner',
      sortable: true,
      cell: (opp) => (
        <div>
          <span className="font-semibold text-slate-900 dark:text-white block hover:text-aiesec-blue">
            {opp.title}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {opp.organizationName} • ODD {opp.sdgTarget}
          </span>
        </div>
      ),
    },
    {
      id: 'product',
      header: 'Product',
      accessorKey: 'product',
      sortable: true,
      filterable: true,
      filterOptions: [
        { label: 'iGV (Global Volunteer)', value: 'igv' },
        { label: 'iGTa (Global Talent)', value: 'igt' },
        { label: 'iGTe (Global Teacher)', value: 'igte' },
      ],
      cell: (opp) => {
        const colors = {
          igv: 'bg-[#F85A40]/10 text-[#F85A40] border-[#F85A40]/30',
          igt: 'bg-[#0CB9C1]/10 text-[#0CB9C1] border-[#0CB9C1]/30',
          igte: 'bg-[#F48924]/10 text-[#F48924] border-[#F48924]/30',
        };
        return (
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${colors[opp.product]}`}>
            {opp.product === 'igt' ? 'iGTa' : opp.product.toUpperCase()}
          </span>
        );
      },
    },
    {
      id: 'status',
      header: 'Review Lifecycle',
      accessorKey: 'status',
      sortable: true,
      filterable: true,
      filterOptions: [
        { label: 'Applications Open', value: 'APPLICATIONS_OPEN' },
        { label: 'Open', value: 'OPEN' },
        { label: 'Under Review', value: 'UNDER_REVIEW' },
        { label: 'Draft', value: 'DRAFT' },
      ],
      cell: (opp) => {
        const styles: Record<string, string> = {
          APPLICATIONS_OPEN: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300',
          OPEN: 'bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300',
          UNDER_REVIEW: 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300',
          DRAFT: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300',
        };
        return (
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${styles[opp.status] || 'bg-slate-100'}`}>
            {opp.status.replace('_', ' ')}
          </span>
        );
      },
    },
    {
      id: 'statutory',
      header: 'Duration & Hours',
      cell: (opp) => (
        <span className="text-xs text-slate-700 dark:text-slate-300 font-mono">
          {opp.durationWeeks} wks • {opp.weeklyWorkingHours}h/wk
        </span>
      ),
    },
    {
      id: 'slots_progress',
      header: 'Slot Allocation Matrix',
      cell: (opp) => {
        const conf = opp.slots.filter(s => s.status === 'CONFIRMED').length;
        const res = opp.slots.filter(s => s.status === 'RESERVED').length;
        const unalloc = opp.slots.filter(s => s.status === 'UNALLOCATED').length;
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-mono">
              <span className="text-emerald-600 font-bold">{conf} Confirmed</span>
              <span>•</span>
              <span className="text-amber-600 font-bold">{res} Reserved</span>
              <span>•</span>
              <span className="text-slate-400">{unalloc} Free</span>
            </div>
            <div className="w-36 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden flex">
              <div style={{ width: `${(conf / opp.totalOpenings) * 100}%` }} className="bg-emerald-500 h-full" />
              <div style={{ width: `${(res / opp.totalOpenings) * 100}%` }} className="bg-amber-500 h-full" />
              <div style={{ width: `${(unalloc / opp.totalOpenings) * 100}%` }} className="bg-slate-300 dark:bg-slate-700 h-full" />
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/" className="hover:text-slate-900 dark:hover:text-white">
              Operations Cockpit
            </Link>
            <span>/</span>
            <span className="text-aiesec-blue font-semibold">Opportunity Registry</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Opportunities & Slot Capacity Board
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Governed by State Machines `SM-02` (Review Lifecycle) & `SM-03` (Slot Reservation with Accommodation Lock).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/opportunities/irm"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-subtle hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <Globe2 className="h-3.5 w-3.5 text-aiesec-blue" />
            <span>IR Partners & Supply Directory</span>
          </Link>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-aiesec-blue px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-aiesec-blue/90 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Opportunity</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Slots Quota</span>
            <Briefcase className="h-4 w-4 text-aiesec-blue" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {totalOpenings} Openings
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Across {opportunities.length} active projects
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Confirmed EPs</span>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600">
            {confirmedSlots} Confirmed
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Matched & approved on EXPA
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Reserved In-Flight</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-600">
            {reservedSlots} In-Flight
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Pending interview & MoU signoff
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Free Unallocated</span>
            <Layers className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-700 dark:text-slate-300">
            {unallocatedSlots} Free Slots
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Available for IR partner matching
          </div>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900">
          {notification}
        </div>
      )}

      {/* View Toggle */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              viewMode === 'table'
                ? 'bg-aiesec-blue text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            <TableIcon className="h-3.5 w-3.5" />
            <span>Opportunities Table ({opportunities.length})</span>
          </button>

          <button
            onClick={() => setViewMode('capacity')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              viewMode === 'capacity'
                ? 'bg-aiesec-blue text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            <Columns3 className="h-3.5 w-3.5" />
            <span>Individual Slot Capacity Board ({totalOpenings} Slots)</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Table View */}
      {viewMode === 'table' && (
        <DataTable
          data={opportunities}
          columns={tableColumns}
          keyExtractor={(opp) => opp.id}
          entityType="OPPORTUNITY"
          searchPlaceholder="Search opportunities by title, partner, product, SDG..."
          exportFileName="aiesec-rabat-opportunities.csv"
        />
      )}

      {/* Tab 2: Individual Slot Capacity Board */}
      {viewMode === 'capacity' && (
        <div className="space-y-6">
          {opportunities.map((opp) => (
            <div
              key={opp.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-subtle dark:border-slate-800 dark:bg-slate-900 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {opp.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span>Partner: <strong className="text-slate-700 dark:text-slate-300">{opp.organizationName}</strong></span>
                    <span>•</span>
                    <span>Product: <strong className="uppercase text-blue-600">{opp.product}</strong></span>
                  </div>
                </div>

                <span className="text-xs font-mono font-semibold text-slate-500">
                  {opp.slots.length} Slots Total
                </span>
              </div>

              {/* Slot Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {opp.slots.map((slot) => {
                  const statusColors: Record<string, string> = {
                    CONFIRMED: 'border-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300',
                    RESERVED: 'border-amber-300 bg-amber-50/60 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300',
                    UNALLOCATED: 'border-slate-200 bg-slate-50/60 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300',
                  };
                  return (
                    <div
                      key={slot.id}
                      className={`p-3 rounded-lg border flex flex-col justify-between gap-2 ${statusColors[slot.status] || 'border-slate-200 bg-slate-50'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold">Slot #{slot.slotNumber}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase border bg-white dark:bg-slate-900">
                          {slot.status}
                        </span>
                      </div>

                      <div className="text-[11px] font-mono">
                        <div>From: {slot.startDate}</div>
                        <div>To: {slot.endDate}</div>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[10px]">
                        {slot.status === 'UNALLOCATED' ? (
                          <span className="text-slate-500 font-medium">Ready for IR Matching</span>
                        ) : slot.status === 'RESERVED' ? (
                          <span className="text-amber-700 dark:text-amber-400 font-bold">EP Dossier Matched</span>
                        ) : (
                          <span className="text-emerald-700 dark:text-emerald-400 font-bold">Locked & Ready</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Creating Opportunity */}
      <CreateOpportunityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}
