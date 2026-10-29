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
  Plus,
  Share2,
  FileText,
  Calendar,
  Layers,
  Sparkles,
  TrendingUp,
  X,
  Copy,
  Check,
} from 'lucide-react';
import { DataTable, type ColumnDef } from '@/components/ui/data-table';
import {
  INITIAL_IR_PARTNERS,
  type IRPartner,
  type IrSyncCall,
  generateRabatOpportunityPackText,
} from '@/lib/irm/irm-data';

export default function IRPartnersPage() {
  const [partners, setPartners] = useState<IRPartner[]>(INITIAL_IR_PARTNERS);
  const [selectedPartnerForSync, setSelectedPartnerForSync] = useState<IRPartner | null>(null);
  const [selectedPartnerForEdit, setSelectedPartnerForEdit] = useState<IRPartner | null>(null);
  const [selectedPartnerForPack, setSelectedPartnerForPack] = useState<IRPartner | null>(null);
  const [packCopied, setPackCopied] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Sync Call Modal Form State
  const [syncDate, setSyncDate] = useState(new Date().toISOString().slice(0, 10));
  const [attendees, setAttendees] = useState('Maximilian Weber, Wadii Hani');
  const [pipelineBlockers, setPipelineBlockers] = useState('');
  const [agreedActions, setAgreedActions] = useState('');
  const [nextCallDate, setNextCallDate] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );

  // Computed metrics
  const activeAgreementsCount = partners.filter((p) => p.status === 'ACTIVE_AGREEMENT').length;
  const totalSupplyDelivered = partners.reduce((acc, p) => acc + p.actualRe, 0);
  const totalTargetQuota = partners.reduce((acc, p) => acc + p.targetRe, 0);
  const avgResponseTime = (
    partners.reduce((acc, p) => acc + p.avg_response_time_hours, 0) / (partners.length || 1)
  ).toFixed(1);

  const handleSaveSyncCall = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartnerForSync) return;

    const newCall: IrSyncCall = {
      id: `sync_${Date.now()}`,
      irId: selectedPartnerForSync.id,
      date: syncDate,
      attendees: attendees.split(',').map((s) => s.trim()),
      pipelineBlockers: pipelineBlockers || 'No critical blockers reported.',
      agreedActions: agreedActions || 'Maintain standard weekly candidate screening.',
      nextCallDate,
      loggedBy: 'Current User',
    };

    setPartners((prev) =>
      prev.map((p) =>
        p.id === selectedPartnerForSync.id
          ? {
              ...p,
              last_touchpoint_date: new Date().toISOString(),
              syncCalls: [newCall, ...(p.syncCalls || [])],
            }
          : p
      )
    );

    setNotification(`Bi-weekly IR Sync Call logged with ${selectedPartnerForSync.lc_name}.`);
    setSelectedPartnerForSync(null);
    setPipelineBlockers('');
    setAgreedActions('');
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCopyPack = (partner: IRPartner) => {
    const text = generateRabatOpportunityPackText(partner);
    navigator.clipboard.writeText(text);
    setPackCopied(true);
    setTimeout(() => setPackCopied(false), 3000);
  };

  const tableColumns: ColumnDef<IRPartner>[] = [
    {
      id: 'lc_name',
      header: 'Partner LC & Country',
      accessorKey: 'lc_name',
      sortable: true,
      cell: (partner) => (
        <div>
          <button
            onClick={() => setSelectedPartnerForSync(partner)}
            className="font-bold text-slate-900 dark:text-white block hover:text-aiesec-blue text-left"
          >
            {partner.lc_name}
          </button>
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
              className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 uppercase"
            >
              {prod}
            </span>
          ))}
        </div>
      ),
    },
    {
      id: 'quota_progress',
      header: 'Delivered vs Target Quota',
      cell: (partner) => {
        const attainment = Math.min(100, Math.round((partner.actualRe / partner.targetRe) * 100));
        return (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {partner.actualRe} / {partner.targetRe} RE
              </span>
              <span className="text-[10px] text-slate-400 font-bold">{attainment}%</span>
            </div>
            <div className="w-28 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                style={{ width: `${attainment}%` }}
                className={`h-full rounded-full transition-all ${
                  attainment >= 70 ? 'bg-emerald-500' : 'bg-aiesec-blue'
                }`}
              />
            </div>
          </div>
        );
      },
    },
    {
      id: 'cr_quality',
      header: 'CR% & Quality',
      cell: (partner) => (
        <div className="text-xs font-mono">
          <div className="text-emerald-600 font-bold">
            {partner.conversionRatePercent}% E2E CR
          </div>
          <div className="text-[10px] text-slate-400">
            SE Standards: {partner.seStandardsFulfillmentPercent}%
          </div>
        </div>
      ),
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
      id: 'actions',
      header: 'IR Actions',
      cell: (partner) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSelectedPartnerForSync(partner)}
            className="rounded border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            Sync Call
          </button>
          <button
            onClick={() => {
              setSelectedPartnerForPack(partner);
              handleCopyPack(partner);
            }}
            className="rounded bg-aiesec-blue px-2 py-1 text-[10px] font-semibold text-white hover:bg-blue-600 flex items-center gap-1"
          >
            <Share2 className="h-2.5 w-2.5" />
            <span>Pack</span>
          </button>
          <a
            href={`https://wa.me/${partner.primary_contact_whatsapp.replace(/\D/g, '')}`}
            target="_blank"
            rel="noreferrer"
            className="rounded bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
          >
            <MessageCircle className="h-3 w-3 inline" />
          </a>
        </div>
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <span>IR Partners & Supply Directory</span>
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-aiesec-blue border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300">
              PRM Framework
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Bilateral LC-to-LC supply partnerships, parsed numeric quotas, live conversion rollups, and sync call governance.
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
            <span className="text-xs font-semibold uppercase tracking-wider">Delivered Realizations</span>
            <Users className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600">
            {totalSupplyDelivered} EPs
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Out of {totalTargetQuota} annual target ({((totalSupplyDelivered / totalTargetQuota) * 100).toFixed(0)}%)
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
            <span className="text-xs font-semibold uppercase tracking-wider">Average Conversion Rate</span>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-purple-600">
            41.2% E2E
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Application to Realization yield
          </div>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {/* Directory Table */}
      <DataTable
        data={partners}
        columns={tableColumns}
        keyExtractor={(p) => p.id}
        searchPlaceholder="Search IR partners by LC name, country, entity code, contact..."
        exportFileName="aiesec-rabat-ir-partners.csv"
      />

      {/* SYNC CALL MODAL */}
      {selectedPartnerForSync && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="max-w-lg w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Log Bi-Weekly IR Sync Call
                </h3>
                <p className="text-xs text-slate-500">
                  Partner: <strong>{selectedPartnerForSync.lc_name}</strong> ({selectedPartnerForSync.country})
                </p>
              </div>
              <button
                onClick={() => setSelectedPartnerForSync(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSyncCall} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Call Date
                  </label>
                  <input
                    type="date"
                    value={syncDate}
                    onChange={(e) => setSyncDate(e.target.value)}
                    className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Next Sync Date
                  </label>
                  <input
                    type="date"
                    value={nextCallDate}
                    onChange={(e) => setNextCallDate(e.target.value)}
                    className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Call Attendees
                </label>
                <input
                  type="text"
                  value={attendees}
                  onChange={(e) => setAttendees(e.target.value)}
                  className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Pipeline Blockers & Visa Status
                </label>
                <textarea
                  rows={2}
                  value={pipelineBlockers}
                  onChange={(e) => setPipelineBlockers(e.target.value)}
                  placeholder="e.g. Flight price surges, visa appointments delay..."
                  className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Agreed Action Items & Supply Commitments
                </label>
                <textarea
                  rows={2}
                  value={agreedActions}
                  onChange={(e) => setAgreedActions(e.target.value)}
                  placeholder="e.g. Sending LC will screen 5 applicants by Friday..."
                  className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedPartnerForSync(null)}
                  className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-aiesec-blue px-5 py-2 font-bold text-white shadow hover:bg-blue-600"
                >
                  Save Sync Call Notes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OPPORTUNITY PACK MODAL */}
      {selectedPartnerForPack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="max-w-xl w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Rabat IR Opportunity Pack
                </h3>
                <p className="text-xs text-slate-500">
                  Formatted for WhatsApp / Email outreach to {selectedPartnerForPack.lc_name}
                </p>
              </div>
              <button
                onClick={() => setSelectedPartnerForPack(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 dark:border-slate-800 dark:bg-slate-800/40 font-mono text-xs whitespace-pre-line text-slate-800 dark:text-slate-200 max-h-80 overflow-y-auto">
              {generateRabatOpportunityPackText(selectedPartnerForPack)}
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-emerald-600 font-semibold">
                {packCopied ? '✓ Copied to clipboard!' : ''}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedPartnerForPack(null)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Close
                </button>
                <button
                  onClick={() => handleCopyPack(selectedPartnerForPack)}
                  className="rounded-lg bg-aiesec-blue px-4 py-2 text-xs font-bold text-white shadow flex items-center gap-1.5 hover:bg-blue-600"
                >
                  {packCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>Copy Opportunity Pack Text</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
