'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Globe2,
  Briefcase,
  Users,
  Clock,
  CheckCircle2,
  Phone,
  Mail,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';
import { DataTable, type ColumnDef } from '@/components/ui/data-table';
import { INITIAL_IR_PARTNERS, type IRPartner } from '@/lib/irm/irm-data';

export default function IRPartnersPage() {
  const [partners, setPartners] = useState<IRPartner[]>(INITIAL_IR_PARTNERS);

  // Computed metrics
  const activeAgreementsCount = partners.filter((p) => p.status === 'ACTIVE_AGREEMENT').length;
  const totalSupplyDelivered = partners.reduce((acc, p) => acc + p.current_supply_count, 0);
  const totalAgreedQuota = partners.reduce((acc, p) => acc + p.agreed_annual_quota, 0);
  const avgResponseTime = (
    partners.reduce((acc, p) => acc + p.avg_response_time_hours, 0) / (partners.length || 1)
  ).toFixed(1);

  const tableColumns: ColumnDef<IRPartner>[] = [
    {
      id: 'lc_name',
      header: 'Partner LC & Country',
      accessorKey: 'lc_name',
      sortable: true,
      cell: (partner) => (
        <div>
          <span className="font-semibold text-slate-900 dark:text-white block">
            {partner.lc_name}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {partner.country} • {partner.entity_code}
          </span>
        </div>
      ),
    },
    {
      id: 'tier',
      header: 'Strategic Tier',
      accessorKey: 'tier',
      sortable: true,
      filterable: true,
      filterOptions: [
        { label: 'Strategic IR', value: 'STRATEGIC_IR' },
        { label: 'Core IR', value: 'CORE_IR' },
        { label: 'Opportunistic', value: 'OPPORTUNISTIC' },
      ],
      cell: (partner) => {
        const styles = {
          STRATEGIC_IR: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300',
          CORE_IR: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300',
          OPPORTUNISTIC: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300',
        };
        return (
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${styles[partner.tier]}`}>
            {partner.tier.replace('_', ' ')}
          </span>
        );
      },
    },
    {
      id: 'products_supplied',
      header: 'Products',
      cell: (partner) => (
        <div className="flex items-center gap-1">
          {partner.products_supplied.map((prod) => (
            <span
              key={prod}
              className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              {prod}
            </span>
          ))}
        </div>
      ),
    },
    {
      id: 'quota_progress',
      header: 'Delivered Supply / Quota',
      cell: (partner) => {
        const percent = Math.min(100, Math.round((partner.current_supply_count / partner.agreed_annual_quota) * 100));
        return (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {partner.current_supply_count} / {partner.agreed_annual_quota} EPs
              </span>
              <span className="text-[10px] text-slate-400">{percent}%</span>
            </div>
            <div className="w-28 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div style={{ width: `${percent}%` }} className="bg-aiesec-blue h-full rounded-full" />
            </div>
          </div>
        );
      },
    },
    {
      id: 'contact',
      header: 'IR Lead Contact',
      cell: (partner) => (
        <div>
          <span className="text-xs font-semibold text-slate-900 dark:text-white block">
            {partner.primary_contact_name}
          </span>
          <span className="text-[10px] text-slate-400">
            {partner.primary_contact_role}
          </span>
        </div>
      ),
    },
    {
      id: 'response_sla',
      header: 'Response SLA',
      accessorKey: 'avg_response_time_hours',
      sortable: true,
      cell: (partner) => (
        <span className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300">
          ~{partner.avg_response_time_hours}h
        </span>
      ),
      align: 'right',
    },
    {
      id: 'whatsapp',
      header: 'Direct Chat',
      cell: (partner) => (
        <a
          href={`https://wa.me/${partner.primary_contact_whatsapp.replace(/\D/g, '')}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200"
        >
          <MessageCircle className="h-3 w-3" />
          <span>WhatsApp</span>
        </a>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/opportunities" className="hover:text-slate-900 dark:hover:text-white">
              Opportunity & Slot Registry
            </Link>
            <span>/</span>
            <span className="text-aiesec-blue font-semibold">International Relations (IRM)</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            International Relations & Supply Directory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Bilateral LC-to-LC supply partnerships, response time agreements, and agreed talent pipelines for Rabat.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Active IR Partnerships</span>
            <Globe2 className="h-4 w-4 text-aiesec-blue" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {activeAgreementsCount} LCs
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Across Europe, LATAM & MENA
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Supply Delivered</span>
            <Users className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600">
            {totalSupplyDelivered} EPs
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Out of {totalAgreedQuota} agreed annual quota ({((totalSupplyDelivered / totalAgreedQuota) * 100).toFixed(0)}%)
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Response Time</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white font-mono">
            ~{avgResponseTime}h
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Sub-12h SLA adherence
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Quota Realization</span>
            <CheckCircle2 className="h-4 w-4 text-purple-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-purple-600">
            62% Target
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            On track for Winter 2026/27 cycle
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <DataTable
        data={partners}
        columns={tableColumns}
        keyExtractor={(p) => p.id}
        searchPlaceholder="Search IR partners by LC name, country, entity code, contact..."
        exportFileName="aiesec-rabat-ir-partners.csv"
      />
    </div>
  );
}
