'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  CheckCircle,
  Clock,
  ShieldCheck,
  Plane,
  AlertTriangle,
  Download,
  Filter,
  Sparkles,
  HeartHandshake,
  FileCheck,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { DataTable, type ColumnDef } from '@/components/ui/data-table';
import { INITIAL_EPS, type EPRecord, type EpStandardDeliveryState, type EpTouchpointEntry } from '@/lib/ep/ep-data';
import { EpEditDrawer } from '@/components/funnel/ep-edit-drawer';
import { EpWorkflowStepper } from '@/components/funnel/ep-workflow-stepper';
import { StandardsModal } from '@/components/delivery/standards-modal';
import { EpExceptionModal, type ExceptionSubmissionPayload } from '@/components/ep/ep-exception-modal';
import { calculateMatchmakerScore } from '@/lib/funnel/ep-funnel-machine';
import { evaluateEpAllSla } from '@/lib/sla/sla-engine';

export default function EPMasterTrackerPage() {
  const router = useRouter();
  const [eps, setEps] = useState<EPRecord[]>(INITIAL_EPS);
  const [selectedEpForEdit, setSelectedEpForEdit] = useState<EPRecord | null>(null);
  const [selectedEpForStepper, setSelectedEpForStepper] = useState<EPRecord | null>(INITIAL_EPS[0] || null);
  const [selectedEpForStandards, setSelectedEpForStandards] = useState<EPRecord | null>(null);
  const [selectedEpForException, setSelectedEpForException] = useState<EPRecord | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Computed KPIs
  const totalApproved = eps.filter((e) => e.status === 'APPROVED').length;
  const totalRealized = eps.filter((e) => e.status === 'REALIZED').length;
  const totalFinished = eps.filter((e) => e.status === 'FINISHED' || e.status === 'COMPLETED').length;
  const pendingVisas = eps.filter((e) => e.visa_status === 'SUBMITTED').length;

  const handleSaveEp = (updatedEp: EPRecord) => {
    setEps((prev) => prev.map((e) => (e.id === updatedEp.id ? updatedEp : e)));
    setNotification(`EP Dossier for "${updatedEp.full_name}" updated successfully.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSaveStandards = (
    epId: string,
    standards: Record<string, EpStandardDeliveryState>,
    touchpoints: EpTouchpointEntry[]
  ) => {
    setEps((prev) =>
      prev.map((e) =>
        e.id === epId
          ? {
              ...e,
              standardsDelivery: standards,
              touchpoints,
              updated_at: new Date().toISOString(),
            }
          : e
      )
    );
    setNotification(`Exchange Standards and Checkpoints updated for EP.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSubmitException = (payload: ExceptionSubmissionPayload) => {
    setEps((prev) =>
      prev.map((e) => {
        if (e.id === payload.epId) {
          return {
            ...e,
            status: payload.exceptionType as any,
            unjustifiedRejection: payload.unjustifiedOpRejection,
            rejectionReason: payload.detailedReason,
            breakReason: payload.exceptionType.includes('BROKEN') ? payload.detailedReason : undefined,
            withdrawalReason: payload.exceptionType === 'WITHDRAWN' ? payload.detailedReason : undefined,
            updated_at: new Date().toISOString(),
          };
        }
        return e;
      })
    );
    setNotification(`AEPP Exception logged: Stage changed to ${payload.exceptionType}.`);
    setTimeout(() => setNotification(null), 5000);
  };

  const tableColumns: ColumnDef<EPRecord>[] = [
    {
      id: 'full_name',
      header: 'Exchange Participant',
      accessorKey: 'full_name',
      sortable: true,
      cell: (ep) => {
        const match = calculateMatchmakerScore({
          nationalityCountry: ep.nationality,
          residenceCountry: ep.residenceCountry,
          hasSchengenPermit: ep.hasSchengenOrUkOrUsPermit,
          slotStartDate: ep.start_date,
        });

        return (
          <div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedEpForEdit(ep)}
                className="font-bold text-slate-900 dark:text-white block hover:text-aiesec-blue text-left"
              >
                {ep.full_name}
              </button>
              <span
                className={`rounded px-1.5 py-0.2 text-[9px] font-bold border ${
                  match.tier === 'HIGH'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                    : match.tier === 'MEDIUM'
                    ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300'
                    : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300'
                }`}
                title={`Matchmaker Score: ${match.matchScore}%`}
              >
                Match: {match.matchScore}%
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {ep.expa_ep_id} • {ep.nationality} {ep.passportNumber ? `(${ep.passportNumber})` : ''}
            </span>
          </div>
        );
      },
    },
    {
      id: 'product',
      header: 'Product',
      accessorKey: 'product',
      sortable: true,
      filterable: true,
      filterOptions: [
        { label: 'iGV (Global Volunteer)', value: 'iGV' },
        { label: 'iGTa (Global Talent)', value: 'iGTa' },
        { label: 'iGTe (Global Teacher)', value: 'iGTe' },
      ],
      cell: (ep) => {
        const colors = {
          iGV: 'bg-[#F85A40]/10 text-[#F85A40] border-[#F85A40]/30',
          iGTa: 'bg-[#0CB9C1]/10 text-[#0CB9C1] border-[#0CB9C1]/30',
          iGTe: 'bg-[#F48924]/10 text-[#F48924] border-[#F48924]/30',
        };
        return (
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${colors[ep.product]}`}>
            {ep.product}
          </span>
        );
      },
    },
    {
      id: 'home_entity',
      header: 'Home LC / MC',
      cell: (ep) => (
        <div>
          <span className="text-xs text-slate-800 dark:text-slate-200 font-medium block">
            {ep.home_lc}
          </span>
          <span className="text-[10px] text-slate-400">
            {ep.home_mc}
          </span>
        </div>
      ),
    },
    {
      id: 'opportunity',
      header: 'Matched Opportunity & Partner',
      cell: (ep) => (
        <div>
          <span className="text-xs font-semibold text-slate-900 dark:text-white block line-clamp-1">
            {ep.opportunity_title}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            {ep.partner_organization_name}
          </span>
        </div>
      ),
    },
    {
      id: 'status',
      header: 'EXPA Stage',
      accessorKey: 'status',
      sortable: true,
      filterable: true,
      filterOptions: [
        { label: 'Approved', value: 'APPROVED' },
        { label: 'Realized', value: 'REALIZED' },
        { label: 'Accepted', value: 'ACCEPTED' },
        { label: 'Finished', value: 'FINISHED' },
        { label: 'Completed', value: 'COMPLETED' },
      ],
      cell: (ep) => {
        const styles = {
          APPROVED: 'bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300',
          REALIZED: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300',
          ACCEPTED: 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300',
          FINISHED: 'bg-purple-50 text-purple-800 border-purple-300 dark:bg-purple-950/40 dark:text-purple-300',
          COMPLETED: 'bg-teal-50 text-teal-800 border-teal-300 dark:bg-teal-950/40 dark:text-teal-300',
          APPLIED: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300',
          REJECTED: 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300',
          WITHDRAWN: 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400',
          APPROVAL_BROKEN: 'bg-rose-100 text-rose-900 border-rose-400 dark:bg-rose-950 dark:text-rose-200',
          REALIZATION_BROKEN: 'bg-rose-100 text-rose-900 border-rose-400 dark:bg-rose-950 dark:text-rose-200',
        };
        return (
          <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${styles[ep.status] || 'bg-slate-100'}`}>
            {ep.status.replace(/_/g, ' ')}
          </span>
        );
      },
    },
    {
      id: 'sla_timers',
      header: 'Statutory SLA Timers',
      cell: (ep) => {
        const sla = evaluateEpAllSla(ep);
        return (
          <div className="space-y-1 text-[10px] font-mono">
            {ep.status === 'APPROVED' && (
              <span
                className={`inline-block px-1.5 py-0.5 rounded font-bold border ${
                  sla.visaPackSla.isBreached
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : sla.visaPackSla.status === 'COMPLETED'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}
              >
                {sla.visaPackSla.badgeLabel}
              </span>
            )}
            {ep.arrivalDate && ep.status !== 'REALIZED' && (
              <span
                className={`inline-block ml-1 px-1.5 py-0.5 rounded font-bold border ${
                  sla.pickupSla.isBreached
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : sla.pickupSla.status === 'COMPLETED'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {sla.pickupSla.badgeLabel}
              </span>
            )}
            {sla.safetySla.isCrisisEscalated && (
              <span className="block px-1.5 py-0.5 rounded font-bold bg-rose-600 text-white animate-pulse">
                48h Safety Alert!
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: 'compliance',
      header: 'Visa & Logistics',
      cell: (ep) => (
        <div className="flex items-center gap-1.5 text-xs">
          <span
            className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
              ep.visa_status === 'APPROVED'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : ep.visa_status === 'SUBMITTED'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
            title={`Visa status: ${ep.visa_status}`}
          >
            VISA: {ep.visa_status.slice(0, 3)}
          </span>

          {ep.insurance_verified && (
            <span
              className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-teal-50 text-teal-700 border border-teal-200"
              title="Health insurance policy verified"
            >
              INS ✓
            </span>
          )}

          {ep.pickup_confirmed && (
            <span
              className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200"
              title="Arrival airport pickup confirmed"
            >
              <Plane className="h-2.5 w-2.5 inline" />
            </span>
          )}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (ep) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSelectedEpForStepper(ep)}
            className="rounded border border-blue-200 bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300 cursor-pointer"
            title="Inspect & advance 6-stage lifecycle progression"
          >
            Lifecycle
          </button>
          <button
            onClick={() => setSelectedEpForEdit(ep)}
            className="rounded border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
          >
            Dossier & Visas
          </button>
          <button
            onClick={() => setSelectedEpForStandards(ep)}
            className="rounded bg-aiesec-blue px-2 py-1 text-[10px] font-semibold text-white hover:bg-blue-600"
          >
            18 Standards
          </button>
          <button
            onClick={() => setSelectedEpForException(ep)}
            className="rounded border border-rose-200 bg-rose-50 px-2 py-1 text-[10px] font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
          >
            Exception
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <span>Exchange Participant (EP) Master Tracker</span>
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-aiesec-blue border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300">
              AEPP & EXPA Aligned
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time operational dossier tracking from application approval to in-country realization, 18 standards, and SLA countdowns.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Approved (Pending Arrival)</span>
            <Users className="h-4 w-4 text-aiesec-blue" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {totalApproved} EPs
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Arriving next 30-60 days
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">In-Country Realized</span>
            <Plane className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600">
            {totalRealized} Active
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Currently in project delivery
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Visa Files</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-600">
            {pendingVisas} Files
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Under consulate processing
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Finished & Completed</span>
            <CheckCircle className="h-4 w-4 text-purple-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-purple-600">
            {totalFinished} Alumni
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            100% 18 Standards fulfilled
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

      {/* EP Lifecycle Workflow Stepper (6-Stage Progression) */}
      {selectedEpForStepper && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span>Active EP Lifecycle: {selectedEpForStepper.full_name} ({selectedEpForStepper.nationality})</span>
            </span>
            <button
              onClick={() => setSelectedEpForStepper(null)}
              className="text-xs font-medium text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
            >
              Hide Stepper ✕
            </button>
          </div>
          <EpWorkflowStepper
            ep={selectedEpForStepper}
            onTransitionStage={(targetStage) => {
              setEps((prev) =>
                prev.map((e) =>
                  e.id === selectedEpForStepper.id
                    ? { ...e, status: targetStage, updated_at: new Date().toISOString() }
                    : e
                )
              );
              setSelectedEpForStepper((prev) =>
                prev ? { ...prev, status: targetStage, updated_at: new Date().toISOString() } : null
              );
              setNotification(`EP "${selectedEpForStepper.full_name}" advanced to stage "${targetStage}".`);
              setTimeout(() => setNotification(null), 4000);
            }}
          />
        </div>
      )}

      {/* Main EP DataTable */}
      <DataTable
        data={eps}
        columns={tableColumns}
        keyExtractor={(ep) => ep.id}
        entityType="EP"
        searchPlaceholder="Search EPs by name, EXPA ID, home LC, opportunity, host manager..."
        exportFileName="aiesec-rabat-ep-master-tracker.csv"
      />

      {/* EP EDIT DRAWER */}
      <EpEditDrawer
        isOpen={Boolean(selectedEpForEdit)}
        onClose={() => setSelectedEpForEdit(null)}
        ep={selectedEpForEdit}
        onSaveEp={handleSaveEp}
      />

      {/* 18 STANDARDS MODAL */}
      <StandardsModal
        isOpen={Boolean(selectedEpForStandards)}
        onClose={() => setSelectedEpForStandards(null)}
        ep={selectedEpForStandards}
        onSaveStandards={handleSaveStandards}
      />

      {/* AEPP EXCEPTION MODAL */}
      <EpExceptionModal
        isOpen={Boolean(selectedEpForException)}
        onClose={() => setSelectedEpForException(null)}
        ep={selectedEpForException}
        onSubmitException={handleSubmitException}
      />
    </div>
  );
}
