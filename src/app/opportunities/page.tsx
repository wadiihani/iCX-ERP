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
  Sparkles,
  Lock,
  ChevronRight,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { CreateOpportunityModal } from '@/components/opportunity/create-opportunity-modal';
import { SlotWaveManager } from '@/components/opportunity/slot-wave-manager';
import {
  transitionOpportunityStatus,
  checkOpportunityReviewSLA,
  type OpportunityLifecycleRecord,
} from '@/lib/opportunity/opportunity-machine';
import { reserveSlot, type OpportunitySlot } from '@/lib/opportunity/slot-machine';
import type { OpportunityInput } from '@/lib/opportunity/opportunity-validator';
import type { OpportunitySlotWave } from '@/lib/opportunity/opportunity-portfolio-data';
import { SDG_CATALOG } from '@/lib/opportunity/opportunity-portfolio-data';
import { DataTable, type ColumnDef } from '@/components/ui/data-table';
import {
  INITIAL_OPPORTUNITIES,
  type ExtendedOpportunity,
} from '@/lib/opportunity/opportunity-data';

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<ExtendedOpportunity[]>(INITIAL_OPPORTUNITIES);
  const [viewMode, setViewMode] = useState<'table' | 'waves' | 'capacity'>('table');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOppForDetail, setSelectedOppForDetail] = useState<ExtendedOpportunity | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Computed counters
  const totalOpenings = opportunities.reduce((acc, o) => acc + o.totalOpenings, 0);
  const totalWavesCount = opportunities.reduce((acc, o) => acc + (o.slotWaves?.length || 0), 0);
  const confirmedSlots = opportunities.flatMap((o) => o.slots).filter((s) => s.status === 'CONFIRMED').length;
  const reservedSlots = opportunities.flatMap((o) => o.slots).filter((s) => s.status === 'RESERVED').length;
  const unallocatedSlots = opportunities.flatMap((o) => o.slots).filter((s) => s.status === 'UNALLOCATED').length;

  const handleCreated = (input: OpportunityInput) => {
    const oppId = `opp-${Date.now()}`;
    const initialWave: OpportunitySlotWave = {
      id: `wave-${Date.now()}-1`,
      opportunityId: oppId,
      waveLabel: `Wave 1 — Initial Intake`,
      startDate: input.startDate,
      endDate: input.endDate,
      capacity: input.totalOpenings,
      appliedCount: 0,
      acceptedCount: 0,
      approvedCount: 0,
      realizedCount: 0,
      completedCount: 0,
    };

    const newOpp: ExtendedOpportunity = {
      id: oppId,
      lcId: 'lc_rabat_001',
      organizationId: input.organizationId || 'org_rabat_001',
      organizationName: input.organizationName || 'Corporate Partner',
      contractId: input.contractId || 'ct_001',
      title: input.title,
      product: input.product,
      portfolioProject: input.portfolioProject,
      primarySdg: input.primarySdg || input.sdgTarget || 4,
      secondarySdgs: input.secondarySdgs || [],
      targetBeneficiaries: input.targetBeneficiaries,
      plannedActivities: input.plannedActivities || [],
      expectedOutputs: input.expectedOutputs,
      sdgTarget: input.primarySdg || input.sdgTarget || 4,
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      totalOpenings: input.totalOpenings,
      availableOpenings: input.totalOpenings,
      durationWeeks: input.durationWeeks,
      weeklyWorkingHours: input.weeklyWorkingHours,
      fundingPercentage: input.fundingPercentage,
      modality: input.modality || 'PHYSICAL',
      remoteWeeks: input.remoteWeeks || 0,
      icbAuditUrl: input.icbAuditUrl,
      monthlySalaryMad: input.monthlySalaryMad || 0,
      epFeeMad: 0,
      professionalField: input.professionalField,
      teachingSubject: input.teachingSubject,
      teachingLevel: input.teachingLevel,
      curriculumOutline: input.curriculumOutline,
      supervisorName: input.supervisorName,
      supervisorTitle: input.supervisorTitle,
      isBenefitsLocked: false,
      history: [],
      slots: Array.from({ length: input.totalOpenings }, (_, i) => ({
        id: `s-${Date.now()}-${i + 1}`,
        opportunityId: oppId,
        slotNumber: i + 1,
        startDate: input.startDate,
        endDate: input.endDate,
        status: 'UNALLOCATED',
      })),
      slotWaves: [initialWave],
    };

    setOpportunities([newOpp, ...opportunities]);
    setNotification(`Opportunity "${newOpp.title}" created with verified statutory portfolio parameters.`);
    setTimeout(() => setNotification(null), 5000);
  };

  const handleAddWave = (opportunityId: string, newWave: OpportunitySlotWave) => {
    setOpportunities((prev) =>
      prev.map((opp) => {
        if (opp.id === opportunityId) {
          const currentSlotsCount = opp.slots.length;
          const newSlots: OpportunitySlot[] = Array.from({ length: newWave.capacity }, (_, i) => ({
            id: `s-${Date.now()}-${i + 1}`,
            opportunityId: opp.id,
            slotNumber: currentSlotsCount + i + 1,
            startDate: newWave.startDate,
            endDate: newWave.endDate,
            status: 'UNALLOCATED',
          }));

          return {
            ...opp,
            totalOpenings: opp.totalOpenings + newWave.capacity,
            availableOpenings: opp.availableOpenings + newWave.capacity,
            slotWaves: [...(opp.slotWaves || []), newWave],
            slots: [...opp.slots, ...newSlots],
          };
        }
        return opp;
      })
    );
    setNotification(`New slot wave "${newWave.waveLabel}" added with ${newWave.capacity} open slots.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const tableColumns: ColumnDef<ExtendedOpportunity>[] = [
    {
      id: 'title',
      header: 'Opportunity & Project Portfolio',
      sortable: true,
      cell: (opp) => (
        <div>
          <button
            onClick={() => setSelectedOppForDetail(opp)}
            className="font-bold text-slate-900 dark:text-white block hover:text-aiesec-blue text-left"
          >
            {opp.title}
          </button>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono mt-0.5">
            <span>{opp.organizationName}</span>
            <span>•</span>
            {opp.portfolioProject ? (
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                Proj: {opp.portfolioProject} (SDG {opp.primarySdg || opp.sdgTarget})
              </span>
            ) : opp.professionalField ? (
              <span className="font-semibold text-teal-600 dark:text-teal-400">
                {opp.professionalField.replace('_', ' ')}
              </span>
            ) : opp.teachingSubject ? (
              <span className="font-semibold text-orange-600 dark:text-orange-400">
                {opp.teachingSubject.replace('_', ' ')}
              </span>
            ) : (
              <span>ODD {opp.sdgTarget}</span>
            )}
          </div>
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
      id: 'modality',
      header: 'Modality & Governance',
      cell: (opp) => (
        <div>
          <span
            className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
              opp.modality === 'PARTLY_REMOTE'
                ? 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {opp.modality === 'PARTLY_REMOTE' ? `Partly Remote (${opp.remoteWeeks}w)` : 'Onsite (Physical)'}
          </span>
          {opp.isBenefitsLocked && (
            <span
              title="AEPP 4.2.1.4: Benefit Lock Active (Approved EPs)"
              className="ml-1.5 inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-semibold"
            >
              <Lock className="h-3 w-3" />
              <span>Locked</span>
            </span>
          )}
        </div>
      ),
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
      header: 'Terms & Compensation',
      cell: (opp) => (
        <div className="text-xs font-mono">
          <div className="text-slate-700 dark:text-slate-300">
            {opp.durationWeeks} wks • {opp.weeklyWorkingHours}h/wk
          </div>
          <div className="text-[10px] text-slate-400">
            {opp.product === 'igv' ? (
              <span className="text-emerald-600 font-semibold">0 MAD (Unpaid Volunteer)</span>
            ) : (
              <span className="font-semibold text-slate-900 dark:text-white">
                {opp.monthlySalaryMad?.toLocaleString()} MAD/mo
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      id: 'waves_progress',
      header: 'Wave Allocation',
      cell: (opp) => {
        const wavesCount = opp.slotWaves?.length || 0;
        const totalCap = (opp.slotWaves || []).reduce((acc, w) => acc + w.capacity, 0);
        const approvedCap = (opp.slotWaves || []).reduce((acc, w) => acc + w.approvedCount, 0);
        return (
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono">
              <span className="font-bold text-slate-900 dark:text-white">
                {wavesCount} Wave{wavesCount !== 1 ? 's' : ''}
              </span>
              <span>•</span>
              <span className="text-emerald-600 font-bold">{approvedCap} Approved</span>
              <span>/</span>
              <span className="text-slate-500">{totalCap || opp.totalOpenings} Cap</span>
            </div>
            <div className="w-28 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden flex mt-1">
              <div
                style={{ width: `${totalCap ? (approvedCap / totalCap) * 100 : 0}%` }}
                className="bg-emerald-500 h-full"
              />
            </div>
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (opp) => (
        <button
          onClick={() => setSelectedOppForDetail(opp)}
          className="rounded border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          Manage Waves
        </button>
      ),
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <span>Project Portfolio & Capacity Waves</span>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300">
              16 Official GV Projects
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Governed by Contract → Opportunity → Multi-Slot Waves (`1:N:N`), AEPP 4.2.1.4 Benefit Lock, and APIP 5.2 ICB Audit Gate.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/opportunities/irm"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-subtle hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <Globe2 className="h-3.5 w-3.5 text-aiesec-blue" />
            <span>IR Partners Directory</span>
          </Link>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-aiesec-blue px-3.5 py-1.5 text-xs font-semibold text-white shadow hover:bg-blue-600 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>+ Create Opportunity</span>
          </button>
        </div>
      </div>

      {/* Headline Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Wave Capacity</span>
            <Briefcase className="h-4 w-4 text-aiesec-blue" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {totalOpenings} Openings
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Across {totalWavesCount} active intake waves
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Approved Candidates</span>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600">
            {confirmedSlots} Confirmed
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Matched & verified on EXPA
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
            Pending interview & contract signoff
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Available Capacity</span>
            <Layers className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-700 dark:text-slate-300">
            {unallocatedSlots} Free Slots
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Open for IR supply matching
          </div>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {/* 3-way View Toggle */}
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
            onClick={() => setViewMode('waves')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              viewMode === 'waves'
                ? 'bg-aiesec-blue text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Multi-Slot Wave Manager ({totalWavesCount} Waves)</span>
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
            <span>Slot Registry Grid ({totalOpenings} Slots)</span>
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

      {/* Tab 2: Wave Manager View */}
      {viewMode === 'waves' && (
        <div className="space-y-6">
          {opportunities.map((opp) => (
            <div key={opp.id} className="space-y-3">
              {/* Opportunity Summary Card */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {opp.title}
                      </span>
                      <span className="rounded px-2 py-0.5 text-[10px] font-bold border uppercase text-blue-600 bg-blue-50 border-blue-200">
                        {opp.product === 'igt' ? 'iGTa' : opp.product.toUpperCase()}
                      </span>
                      {opp.isBenefitsLocked && (
                        <span className="rounded bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200 flex items-center gap-1">
                          <Lock className="h-3 w-3" />
                          <span>AEPP 4.2.1.4 Benefit Lock Active</span>
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-mono">
                      <span>Partner: <strong>{opp.organizationName}</strong></span>
                      <span>•</span>
                      <span>Duration: {opp.durationWeeks} weeks ({opp.weeklyWorkingHours}h/wk)</span>
                      <span>•</span>
                      <span>Modality: {opp.modality}</span>
                    </div>

                    {/* iGV Activity Evidence Showcase */}
                    {opp.product === 'igv' && opp.plannedActivities && opp.plannedActivities.length > 0 && (
                      <div className="mt-3 rounded-lg bg-red-50/30 p-2.5 border border-red-100 text-xs text-slate-700 dark:border-red-950/40 dark:bg-red-950/10 dark:text-slate-300">
                        <div className="font-semibold text-[#F85A40] text-[11px] mb-1 flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>Project: {opp.portfolioProject} (Primary SDG {opp.primarySdg}) — Beneficiaries: {opp.targetBeneficiaries}</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          <strong>Planned Deliverables:</strong> {opp.plannedActivities.join(' • ')}
                        </div>
                        {opp.expectedOutputs && (
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            <strong>Expected Output:</strong> {opp.expectedOutputs}
                          </div>
                        )}
                      </div>
                    )}

                    {/* iGTa / iGTe Supervisor Showcase */}
                    {opp.supervisorName && (
                      <div className="mt-2 text-xs text-slate-500 font-mono">
                        Designated Supervisor: <strong>{opp.supervisorName}</strong> ({opp.supervisorTitle || 'Technical Lead'}) • Monthly Salary: <strong>{opp.monthlySalaryMad?.toLocaleString()} MAD</strong>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Slot Wave Manager for this opportunity */}
              <SlotWaveManager opportunity={opp} onAddWave={handleAddWave} />
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Individual Slot Capacity Board */}
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

      {/* Slide-over or Modal for Opportunity Detail & Wave Management */}
      {selectedOppForDetail && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 h-full overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Opportunity & Wave Console
                </h3>
                <p className="text-xs text-slate-500">{selectedOppForDetail.title}</p>
              </div>
              <button
                onClick={() => setSelectedOppForDetail(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {selectedOppForDetail.isBenefitsLocked && (
              <div className="rounded-lg bg-amber-50 p-3 border border-amber-200 text-amber-800 text-xs flex items-center gap-2 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-300">
                <Lock className="h-4 w-4 shrink-0 text-amber-600" />
                <span>
                  <strong>AEPP 4.2.1.4 Benefit Lock Active:</strong> Candidates are approved on this opportunity. Compensation, duration, and accommodation are legally locked.
                </span>
              </div>
            )}

            {/* Wave Manager */}
            <SlotWaveManager
              opportunity={selectedOppForDetail}
              onAddWave={(id, newWave) => {
                handleAddWave(id, newWave);
                setSelectedOppForDetail((prev) =>
                  prev
                    ? {
                        ...prev,
                        totalOpenings: prev.totalOpenings + newWave.capacity,
                        slotWaves: [...(prev.slotWaves || []), newWave],
                      }
                    : null
                );
              }}
            />

            {/* Statutory Specs Breakdown */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2.5 text-xs dark:border-slate-800 dark:bg-slate-800/40">
              <span className="font-bold text-slate-900 dark:text-white block">
                Statutory Specification Audit
              </span>
              <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300 font-mono">
                <div>Product: <strong className="uppercase">{selectedOppForDetail.product}</strong></div>
                <div>Modality: <strong>{selectedOppForDetail.modality}</strong></div>
                <div>Duration: <strong>{selectedOppForDetail.durationWeeks} Weeks</strong></div>
                <div>Hours: <strong>{selectedOppForDetail.weeklyWorkingHours} h/wk</strong></div>
                <div>
                  Salary:{' '}
                  <strong>
                    {selectedOppForDetail.monthlySalaryMad
                      ? `${selectedOppForDetail.monthlySalaryMad.toLocaleString()} MAD`
                      : '0 MAD (Unpaid Volunteer)'}
                  </strong>
                </div>
                <div>EP Fee Charged: <strong>0 MAD (Locked)</strong></div>
              </div>
              {selectedOppForDetail.icbAuditUrl && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px]">
                  <span>ICB Audit Reference: </span>
                  <a
                    href={selectedOppForDetail.icbAuditUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-aiesec-blue underline font-mono"
                  >
                    {selectedOppForDetail.icbAuditUrl}
                  </a>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3">
              <button
                onClick={() => setSelectedOppForDetail(null)}
                className="rounded-lg bg-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200"
              >
                Close Console
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
