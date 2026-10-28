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
} from 'lucide-react';
import { DataTable, type ColumnDef } from '@/components/ui/data-table';
import { INITIAL_EPS, type EPRecord } from '@/lib/ep/ep-data';

export default function EPMasterTrackerPage() {
  const router = useRouter();
  const [eps, setEps] = useState<EPRecord[]>(INITIAL_EPS);

  // Computed KPIs
  const totalApproved = eps.filter((e) => e.status === 'APPROVED').length;
  const totalRealized = eps.filter((e) => e.status === 'REALIZED').length;
  const totalFinished = eps.filter((e) => e.status === 'FINISHED' || e.status === 'COMPLETED').length;
  const pendingVisas = eps.filter((e) => e.visa_status === 'SUBMITTED').length;

  const tableColumns: ColumnDef<EPRecord>[] = [
    {
      id: 'full_name',
      header: 'Exchange Participant',
      accessorKey: 'full_name',
      sortable: true,
      cell: (ep) => (
        <div>
          <span className="font-semibold text-slate-900 dark:text-white block hover:text-aiesec-blue">
            {ep.full_name}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {ep.expa_ep_id} • {ep.nationality}
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
        };
        return (
          <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${styles[ep.status]}`}>
            {ep.status}
          </span>
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
      id: 'dates',
      header: 'Realization Window',
      sortable: true,
      cell: (ep) => (
        <div className="text-xs font-mono text-slate-600 dark:text-slate-400">
          <div>{ep.start_date}</div>
          <div className="text-[10px] text-slate-400">to {ep.end_date}</div>
        </div>
      ),
    },
    {
      id: 'host_manager_name',
      header: 'Host Manager',
      accessorKey: 'host_manager_name',
      sortable: true,
      cell: (ep) => (
        <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
          {ep.host_manager_name}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Exchange Participant (EP) Master Tracker
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time operational dossier tracking from application approval to in-country realization and standard fulfillment.
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

      {/* Main EP DataTable */}
      <DataTable
        data={eps}
        columns={tableColumns}
        keyExtractor={(ep) => ep.id}
        entityType="EP"
        searchPlaceholder="Search EPs by name, EXPA ID, home LC, opportunity, host manager..."
        exportFileName="aiesec-rabat-ep-master-tracker.csv"
        onRowClick={(ep) => router.push(`/crm/${ep.id}`)}
      />
    </div>
  );
}
