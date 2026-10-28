'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Users,
  Briefcase,
  DollarSign,
  Plus,
  MessageSquare,
  Phone,
  Mail,
  ExternalLink,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { DataTable, type ColumnDef } from '@/components/ui/data-table';
import { TouchpointModal } from '@/components/crm/touchpoint-modal';
import {
  INITIAL_B2B_ORGANIZATIONS,
  INITIAL_B2B_CONTACTS,
  INITIAL_B2B_TOUCHPOINTS,
  type B2BOrganization,
  type B2BContact,
  type B2BTouchpoint,
} from '@/lib/crm/organizations-data';

export default function SalesCRMPage() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<B2BOrganization[]>(INITIAL_B2B_ORGANIZATIONS);
  const [contacts, setContacts] = useState<B2BContact[]>(INITIAL_B2B_CONTACTS);
  const [touchpoints, setTouchpoints] = useState<B2BTouchpoint[]>(INITIAL_B2B_TOUCHPOINTS);
  const [activeTab, setActiveTab] = useState<'organizations' | 'contacts' | 'touchpoints'>('organizations');
  const [isTouchpointModalOpen, setIsTouchpointModalOpen] = useState(false);

  // Compute live KPIs
  const totalValueMad = organizations.reduce((acc, org) => acc + org.total_deal_value_mad, 0);
  const totalDeals = organizations.reduce((acc, org) => acc + org.active_deals_count, 0);
  const activePartnersCount = organizations.filter((o) => o.status === 'ACTIVE_PARTNER').length;

  const handleSaveTouchpoint = (newTp: Omit<B2BTouchpoint, 'id' | 'created_at'>) => {
    const created: B2BTouchpoint = {
      ...newTp,
      id: `tp_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setTouchpoints([created, ...touchpoints]);
  };

  // Organization table columns
  const orgColumns: ColumnDef<B2BOrganization>[] = [
    {
      id: 'name',
      header: 'Organization Name',
      accessorKey: 'name',
      sortable: true,
      cell: (row) => (
        <div>
          <span className="font-semibold text-slate-900 dark:text-white block hover:text-aiesec-blue">
            {row.name}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {row.city} • {row.tax_id || 'No Tax ID'}
          </span>
        </div>
      ),
    },
    {
      id: 'tier',
      header: 'Tier',
      accessorKey: 'tier',
      sortable: true,
      filterable: true,
      filterOptions: [
        { label: 'Tier 1 (Strategic)', value: 'TIER_1' },
        { label: 'Tier 2 (Core)', value: 'TIER_2' },
        { label: 'Tier 3 (Local)', value: 'TIER_3' },
      ],
      cell: (row) => {
        const colors = {
          TIER_1: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300',
          TIER_2: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300',
          TIER_3: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300',
        };
        return (
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${colors[row.tier]}`}>
            {row.tier.replace('_', ' ')}
          </span>
        );
      },
    },
    {
      id: 'sector',
      header: 'Sector',
      accessorKey: 'sector',
      sortable: true,
      filterable: true,
      filterOptions: [
        { label: 'Technology', value: 'TECHNOLOGY' },
        { label: 'Education', value: 'EDUCATION' },
        { label: 'Finance', value: 'FINANCE' },
        { label: 'NGO', value: 'NGO' },
        { label: 'Consulting', value: 'CONSULTING' },
      ],
      cell: (row) => (
        <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
          {row.sector}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Relationship Status',
      accessorKey: 'status',
      sortable: true,
      filterable: true,
      filterOptions: [
        { label: 'Active Partner', value: 'ACTIVE_PARTNER' },
        { label: 'Qualified', value: 'QUALIFIED' },
        { label: 'Prospect', value: 'PROSPECT' },
      ],
      cell: (row) => {
        const styles = {
          ACTIVE_PARTNER: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300',
          QUALIFIED: 'bg-sky-50 text-sky-800 border-sky-300 dark:bg-sky-950/40 dark:text-sky-300',
          PROSPECT: 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300',
          CHURNED: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300',
          BLOCKED: 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300',
        };
        return (
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${styles[row.status]}`}>
            {row.status.replace('_', ' ')}
          </span>
        );
      },
    },
    {
      id: 'primary_contact',
      header: 'Key Contact',
      cell: (row) => (
        <div>
          <span className="text-xs font-semibold text-slate-900 dark:text-white block">
            {row.primary_contact_name}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {row.primary_contact_email}
          </span>
        </div>
      ),
    },
    {
      id: 'deals',
      header: 'Deals & Value',
      accessorKey: 'total_deal_value_mad',
      sortable: true,
      cell: (row) => (
        <div className="text-right">
          <span className="text-xs font-bold text-slate-900 dark:text-white block font-mono">
            {row.total_deal_value_mad.toLocaleString()} MAD
          </span>
          <span className="text-[10px] text-slate-400">
            {row.active_deals_count} active deal{row.active_deals_count !== 1 ? 's' : ''}
          </span>
        </div>
      ),
      align: 'right',
    },
    {
      id: 'account_owner_name',
      header: 'Owner',
      accessorKey: 'account_owner_name',
      sortable: true,
      cell: (row) => (
        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
          {row.account_owner_name}
        </span>
      ),
    },
  ];

  // Contacts table columns
  const contactColumns: ColumnDef<B2BContact>[] = [
    {
      id: 'name',
      header: 'Contact Name',
      accessorKey: 'name',
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-2">
          {row.is_primary && (
            <span className="text-amber-500 font-bold" title="Primary Organization Contact">
              ★
            </span>
          )}
          <div>
            <span className="font-semibold text-slate-900 dark:text-white block">
              {row.name}
            </span>
            <span className="text-[10px] text-slate-400">
              {row.job_title}
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 'organization_name',
      header: 'Organization',
      accessorKey: 'organization_name',
      sortable: true,
      cell: (row) => (
        <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
          {row.organization_name}
        </span>
      ),
    },
    {
      id: 'email',
      header: 'Email Address',
      accessorKey: 'email',
      cell: (row) => (
        <a
          href={`mailto:${row.email}`}
          className="text-xs font-mono text-aiesec-blue hover:underline flex items-center gap-1"
        >
          <Mail className="h-3 w-3" />
          <span>{row.email}</span>
        </a>
      ),
    },
    {
      id: 'phone',
      header: 'Phone',
      accessorKey: 'phone',
      cell: (row) => (
        <a
          href={`tel:${row.phone}`}
          className="text-xs font-mono text-slate-600 dark:text-slate-300 hover:text-slate-900 flex items-center gap-1"
        >
          <Phone className="h-3 w-3" />
          <span>{row.phone}</span>
        </a>
      ),
    },
    {
      id: 'notes',
      header: 'Operational Notes',
      accessorKey: 'notes',
      cell: (row) => (
        <span className="text-xs text-slate-500 line-clamp-1 italic">
          {row.notes || '—'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Stat Cards */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            B2B Partner CRM & Accounts
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Reconciled organizational accounts, contact rosters, and meeting action logs for LC Rabat.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/sales/pipeline')}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-subtle hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <Briefcase className="h-3.5 w-3.5 text-aiesec-blue" />
            <span>View Deal Pipeline Board</span>
          </button>
          <button
            onClick={() => setIsTouchpointModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-aiesec-blue px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-aiesec-blue/90 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Log Interaction</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Partner Orgs</span>
            <Building2 className="h-4 w-4 text-aiesec-blue" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {activePartnersCount} / {organizations.length}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {((activePartnersCount / organizations.length) * 100).toFixed(0)}% account retention rate
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Deals</span>
            <Briefcase className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {totalDeals} In-Flight
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Across iGV, iGTa, and iGTe products
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Value (MAD)</span>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white font-mono">
            {totalValueMad.toLocaleString()} MAD
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            Reconciled pipeline volume
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending SLA Actions</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {touchpoints.length} Enqueued
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Generated from logged meetings
          </div>
        </div>
      </div>

      {/* Workspace Tabs Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-4">
        <button
          onClick={() => setActiveTab('organizations')}
          className={`pb-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'organizations'
              ? 'border-aiesec-blue text-aiesec-blue dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>Organizations Directory ({organizations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('contacts')}
          className={`pb-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'contacts'
              ? 'border-aiesec-blue text-aiesec-blue dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Contacts Roster ({contacts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('touchpoints')}
          className={`pb-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'touchpoints'
              ? 'border-aiesec-blue text-aiesec-blue dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Interaction Feed ({touchpoints.length})</span>
        </button>
      </div>

      {/* Tab 1: Organizations Table */}
      {activeTab === 'organizations' && (
        <DataTable
          data={organizations}
          columns={orgColumns}
          keyExtractor={(org) => org.id}
          entityType="ORGANIZATION"
          searchPlaceholder="Search by organization name, city, tax ID, or owner..."
          exportFileName="aiesec-rabat-b2b-organizations.csv"
          onRowClick={(org) => router.push(`/sales/${org.id}`)}
        />
      )}

      {/* Tab 2: Contacts Table */}
      {activeTab === 'contacts' && (
        <DataTable
          data={contacts}
          columns={contactColumns}
          keyExtractor={(contact) => contact.id}
          searchPlaceholder="Search contacts by name, organization, job title, email..."
          exportFileName="aiesec-rabat-b2b-contacts.csv"
        />
      )}

      {/* Tab 3: Touchpoint Feed */}
      {activeTab === 'touchpoints' && (
        <div className="space-y-4">
          {touchpoints.map((tp) => (
            <div
              key={tp.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-subtle dark:border-slate-800 dark:bg-slate-900 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-aiesec-soft px-2 py-0.5 text-[10px] font-bold text-aiesec-blue dark:bg-blue-950/40 dark:text-blue-300">
                    {tp.touchpoint_type}
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {tp.organization_name}
                  </span>
                  {tp.contact_name && (
                    <span className="text-xs text-slate-400">with {tp.contact_name}</span>
                  )}
                </div>
                <time className="text-[11px] font-mono text-slate-400">
                  {new Date(tp.meeting_date).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </time>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {tp.minutes}
              </p>

              <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Mandatory Next Action Deliverable
                  </div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">
                    {tp.next_action}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="font-medium text-slate-500">
                    Assigned: <span className="text-slate-800 dark:text-slate-200 font-semibold">{tp.next_action_owner}</span>
                  </span>
                  <span className="rounded bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200 dark:bg-rose-950/30 dark:text-rose-300">
                    Due {new Date(tp.next_action_due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Touchpoint Modal */}
      <TouchpointModal
        isOpen={isTouchpointModalOpen}
        onClose={() => setIsTouchpointModalOpen(false)}
        organizations={organizations}
        onSaveTouchpoint={handleSaveTouchpoint}
      />
    </div>
  );
}
