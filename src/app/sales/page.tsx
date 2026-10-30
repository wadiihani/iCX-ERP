'use client';

import React, { useState, useEffect } from 'react';
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
  Columns3,
  Table as TableIcon,
  LayoutGrid,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Calendar,
  Layers,
} from 'lucide-react';
import { DataTable, type ColumnDef } from '@/components/ui/data-table';
import { TouchpointModal } from '@/components/crm/touchpoint-modal';
import { PartnerEditDrawer } from '@/components/crm/partner-edit-drawer';
import { PartnerStandardsModal } from '@/components/crm/partner-standards-modal';
import { DealStageStepper } from '@/components/sales/deal-stage-stepper';
import {
  INITIAL_B2B_ORGANIZATIONS,
  INITIAL_B2B_CONTACTS,
  INITIAL_B2B_TOUCHPOINTS,
  type B2BOrganization,
  type B2BContact,
  type B2BTouchpoint,
  type PartnerStandardCheckpoint,
} from '@/lib/crm/organizations-data';
import {
  INITIAL_B2B_DEALS,
  B2bDealRecord,
  PipelineStage,
  PIPELINE_STAGE_CONFIG,
} from '@/lib/sales/deals-data';
import { ErpRepository } from '@/lib/storage/erp-repository';

export default function SalesCRMPage() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<B2BOrganization[]>(INITIAL_B2B_ORGANIZATIONS);
  const [contacts, setContacts] = useState<B2BContact[]>(INITIAL_B2B_CONTACTS);
  const [touchpoints, setTouchpoints] = useState<B2BTouchpoint[]>(INITIAL_B2B_TOUCHPOINTS);
  const [deals, setDeals] = useState<B2bDealRecord[]>(INITIAL_B2B_DEALS);

  // Synchronize with ErpRepository on client mount
  useEffect(() => {
    const loadedOrgs = ErpRepository.getOrganizations();
    if (loadedOrgs && loadedOrgs.length > 0) setOrganizations(loadedOrgs);
    const loadedDeals = ErpRepository.getDeals();
    if (loadedDeals && loadedDeals.length > 0) setDeals(loadedDeals);

    const handleRepoUpdate = () => {
      setOrganizations(ErpRepository.getOrganizations());
      setDeals(ErpRepository.getDeals());
    };

    window.addEventListener('icx_repo_update', handleRepoUpdate);
    return () => window.removeEventListener('icx_repo_update', handleRepoUpdate);
  }, []);

  // 3-way View Switcher on /sales (Plan 13-03)
  const [viewMode, setViewMode] = useState<'KANBAN' | 'TABLE' | 'CARDS'>('TABLE');
  const [activeTab, setActiveTab] = useState<'organizations' | 'contacts' | 'touchpoints' | 'deals'>('organizations');

  // Modals & Drawers state
  const [isTouchpointModalOpen, setIsTouchpointModalOpen] = useState(false);
  const [selectedPartnerForEdit, setSelectedPartnerForEdit] = useState<B2BOrganization | null>(null);
  const [selectedPartnerForStandards, setSelectedPartnerForStandards] = useState<B2BOrganization | null>(null);
  const [selectedDealForStepper, setSelectedDealForStepper] = useState<B2bDealRecord | null>(null);

  // Compute live KPIs
  const totalValueMad = deals.reduce((acc, d) => acc + d.revenueMad, 0);
  const totalDeals = deals.length;
  const activePartnersCount = organizations.filter((o) => o.status === 'ACTIVE_PARTNER' && !o.isArchived).length;
  const wonDealsCount = deals.filter((d) => d.stage === 'ACTIVE_DELIVERY' || d.stage === 'AGREEMENT_SIGNED').length;

  // Handlers
  const handleSaveTouchpoint = (newTp: Omit<B2BTouchpoint, 'id' | 'created_at'>) => {
    const created: B2BTouchpoint = {
      ...newTp,
      id: `tp_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setTouchpoints([created, ...touchpoints]);
  };

  const handleSavePartner = (updated: B2BOrganization) => {
    setOrganizations((prev) => {
      const next = prev.map((org) => (org.id === updated.id ? updated : org));
      ErpRepository.saveOrganizations(next);
      return next;
    });
  };

  const handleCreateDeal = (newDeal: B2bDealRecord) => {
    setDeals((prev) => {
      const next = [newDeal, ...prev];
      ErpRepository.saveDeals(next);
      return next;
    });
    // update partner active_deals_count
    setOrganizations((prev) => {
      const next = prev.map((org) =>
        org.id === newDeal.orgId
          ? {
              ...org,
              active_deals_count: org.active_deals_count + 1,
              total_deal_value_mad: org.total_deal_value_mad + newDeal.revenueMad,
            }
          : org
      );
      ErpRepository.saveOrganizations(next);
      return next;
    });
  };

  const handleAddContact = (newContact: B2BContact) => {
    setContacts((prev) => [newContact, ...prev]);
  };

  const handleTransitionDealStage = (targetStage: PipelineStage, reason?: string) => {
    if (!selectedDealForStepper) return;

    setDeals((prev) => {
      const next = prev.map((d) => {
        if (d.id === selectedDealForStepper.id) {
          const updated: B2bDealRecord = {
            ...d,
            stage: targetStage,
            lossReason: reason || d.lossReason,
            history: [
              ...d.history,
              {
                fromStage: d.stage,
                toStage: targetStage,
                timestamp: new Date().toISOString().split('T')[0],
                actorName: 'Current User',
                reason,
              },
            ],
            updatedAt: new Date().toISOString(),
          };
          setSelectedDealForStepper(updated);
          return updated;
        }
        return d;
      });
      ErpRepository.saveDeals(next);
      return next;
    });
  };

  // OP Candidate Rejection Counter badge (AEPP 4.2.2.1.7)
  const getRejectionBadge = (count: number) => {
    if (count <= 1) {
      return {
        label: `${count}/3 Rejections`,
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300',
      };
    }
    if (count === 2) {
      return {
        label: '2/3 Rejections (Warning)',
        className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 animate-pulse',
      };
    }
    return {
      label: `${count}/3 Suspended (LCVP Review)`,
      className: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 font-bold',
    };
  };

  // Organization table columns
  const orgColumns: ColumnDef<B2BOrganization>[] = [
    {
      id: 'name',
      header: 'Organization & Legal Profile',
      accessorKey: 'name',
      sortable: true,
      cell: (row) => (
        <div>
          <button
            onClick={() => setSelectedPartnerForEdit(row)}
            className="font-bold text-slate-900 dark:text-white block hover:text-aiesec-blue text-left"
          >
            {row.name}
          </button>
          <span className="text-[10px] text-slate-400 font-mono">
            {row.city} • ICE: {row.ice || row.tax_id || 'No ICE'}
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
      cell: (row) => <span className="text-slate-600 dark:text-slate-300">{row.sector}</span>,
    },
    {
      id: 'status',
      header: 'Status & Rejections',
      accessorKey: 'status',
      sortable: true,
      cell: (row) => {
        const rejBadge = getRejectionBadge(row.unjustifiedRejectionsCount);
        return (
          <div className="flex flex-col gap-1 items-start">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {row.status.replace('_', ' ')}
            </span>
            <span className={`px-1.5 py-0.2 rounded border text-[9px] font-bold ${rejBadge.className}`}>
              {rejBadge.label}
            </span>
          </div>
        );
      },
    },
    {
      id: 'standards',
      header: 'Partner Standards',
      cell: (row) => (
        <button
          onClick={() => setSelectedPartnerForStandards(row)}
          className="flex items-center gap-1.5 rounded-md border border-teal-200 bg-teal-50 px-2 py-1 text-[10px] font-semibold text-teal-700 hover:bg-teal-100 dark:border-teal-800 dark:bg-teal-950 dark:text-teal-300"
        >
          <ShieldCheck className="h-3 w-3" />
          <span>{row.partnerStandardsScore || 90}% Verified</span>
        </button>
      ),
    },
    {
      id: 'deals',
      header: 'Deals & Value',
      accessorKey: 'total_deal_value_mad',
      sortable: true,
      cell: (row) => (
        <div>
          <span className="font-bold text-slate-900 dark:text-white">
            {row.total_deal_value_mad.toLocaleString()} MAD
          </span>
          <span className="block text-[10px] text-slate-400">
            {row.active_deals_count} deal{row.active_deals_count !== 1 ? 's' : ''}
          </span>
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSelectedPartnerForEdit(row)}
            className="rounded border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            Edit Drawer
          </button>
          <button
            onClick={() => {
              setSelectedPartnerForEdit(row);
            }}
            className="rounded bg-aiesec-blue px-2 py-1 text-[10px] font-semibold text-white hover:bg-blue-600"
          >
            + Deal
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-aiesec-blue/10 text-aiesec-blue">
              <Building2 className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              B2B Partner CRM, Deals & Pipeline Architecture
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            AIESEC in Rabat · External Engine · Relational Organizations, Multi-Deals, 8-Stage Stepper & Partner Standards.
          </p>
        </div>

        {/* 3-Way View Switcher (Plan 13-03) & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-800 dark:bg-slate-800">
            <button
              onClick={() => setViewMode('KANBAN')}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                viewMode === 'KANBAN'
                  ? 'bg-white text-aiesec-blue shadow-2xs dark:bg-slate-900 dark:text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              <Columns3 className="h-3.5 w-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('TABLE')}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                viewMode === 'TABLE'
                  ? 'bg-white text-aiesec-blue shadow-2xs dark:bg-slate-900 dark:text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              <TableIcon className="h-3.5 w-3.5" />
              <span>Master Table</span>
            </button>
            <button
              onClick={() => setViewMode('CARDS')}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                viewMode === 'CARDS'
                  ? 'bg-white text-aiesec-blue shadow-2xs dark:bg-slate-900 dark:text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Cards</span>
            </button>
          </div>

          <button
            onClick={() => setIsTouchpointModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Log Touchpoint</span>
          </button>
        </div>
      </div>

      {/* Headline KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Pipeline Value</div>
          <div className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">
            {totalValueMad.toLocaleString()} MAD
          </div>
          <div className="mt-0.5 text-[10px] text-slate-500">{totalDeals} active B2B deals</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Partners</div>
          <div className="mt-1 text-2xl font-extrabold text-aiesec-blue dark:text-blue-400">
            {activePartnersCount}
          </div>
          <div className="mt-0.5 text-[10px] text-slate-500">Verified Organizations</div>
        </div>

        <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/30 p-3.5 shadow-xs dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Signed & Active Deals
          </div>
          <div className="mt-1 text-2xl font-extrabold text-emerald-700 dark:text-emerald-300">
            {wonDealsCount}
          </div>
          <div className="mt-0.5 text-[10px] text-emerald-600/80">Contracts or delivery</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Directory Contacts</div>
          <div className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">
            {contacts.length}
          </div>
          <div className="mt-0.5 text-[10px] text-slate-500">{touchpoints.length} logged interactions</div>
        </div>
      </div>

      {/* Selected Deal Stepper (If opened) */}
      {selectedDealForStepper && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <span>Inspecting Deal: {selectedDealForStepper.title} ({selectedDealForStepper.orgName})</span>
            <button
              onClick={() => setSelectedDealForStepper(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              Close Stepper ✕
            </button>
          </div>
          <DealStageStepper
            deal={selectedDealForStepper}
            onTransitionStage={handleTransitionDealStage}
          />
        </div>
      )}

      {/* VIEW 1: KANBAN BOARD */}
      {viewMode === 'KANBAN' && (
        <div className="space-y-4">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Sales Pipeline Kanban Board · 8 Verified Stages
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-3 overflow-x-auto pb-4">
            {(
              [
                'PROSPECT',
                'QUALIFIED',
                'DISCOVERY',
                'PROPOSAL',
                'NEGOTIATION',
                'AGREEMENT_SIGNED',
                'OPP_SETUP',
                'ACTIVE_DELIVERY',
              ] as PipelineStage[]
            ).map((stage) => {
              const stageDeals = deals.filter((d) => d.stage === stage);
              const stageValue = stageDeals.reduce((acc, d) => acc + d.revenueMad, 0);
              const config = PIPELINE_STAGE_CONFIG[stage];

              return (
                <div
                  key={stage}
                  className="flex flex-col rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 dark:border-slate-800 dark:bg-slate-900/60 min-w-[200px]"
                >
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2 dark:border-slate-800">
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white">
                        {config.label.split('. ')[1] || config.label}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {stageValue.toLocaleString()} MAD
                      </div>
                    </div>
                    <span className="rounded-full bg-slate-200 px-1.5 py-0.2 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {stageDeals.length}
                    </span>
                  </div>

                  {/* Deals in stage */}
                  <div className="mt-2.5 space-y-2 flex-1">
                    {stageDeals.map((deal) => {
                      const isStale =
                        new Date().getTime() - new Date(deal.lastActivityDate).getTime() >
                        7 * 86400000;
                      return (
                        <div
                          key={deal.id}
                          onClick={() => setSelectedDealForStepper(deal)}
                          className={`cursor-pointer rounded-lg border bg-white p-2.5 shadow-2xs hover:shadow-xs transition dark:bg-slate-800 ${
                            isStale
                              ? 'border-amber-300 dark:border-amber-700'
                              : 'border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="rounded px-1 py-0.2 text-[9px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                              {deal.product}
                            </span>
                            {isStale && (
                              <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-0.5" title="No activity for >7 days">
                                <Clock className="h-2.5 w-2.5" /> Stale
                              </span>
                            )}
                          </div>
                          <div className="mt-1 font-bold text-xs text-slate-900 dark:text-white line-clamp-2">
                            {deal.title}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">{deal.orgName}</div>
                          <div className="mt-2 flex items-center justify-between text-[10px] border-t border-slate-100 pt-1.5 dark:border-slate-700/60">
                            <span className="font-extrabold text-slate-800 dark:text-slate-200">
                              {deal.revenueMad.toLocaleString()} MAD
                            </span>
                            <span className="text-slate-400">{deal.assignedOwnerName.split(' ')[0]}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: MASTER TABLE */}
      {viewMode === 'TABLE' && (
        <div className="space-y-4">
          <DataTable<B2BOrganization>
            data={organizations}
            columns={orgColumns}
            keyExtractor={(org) => org.id}
            searchPlaceholder="Search partner organizations by name, city, tax ID..."
            exportFileName="aiesec-rabat-b2b-partners.csv"
          />
        </div>
      )}

      {/* VIEW 3: CARDS */}
      {viewMode === 'CARDS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {organizations.map((org) => {
            const orgDeals = deals.filter((d) => d.orgId === org.id);
            const rejBadge = getRejectionBadge(org.unjustifiedRejectionsCount);

            return (
              <div
                key={org.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">{org.name}</h3>
                      <p className="text-[11px] text-slate-400">
                        {org.sector} · {org.city}
                      </p>
                    </div>
                    <span className={`rounded border px-1.5 py-0.5 text-[9px] font-bold ${rejBadge.className}`}>
                      {rejBadge.label}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg dark:bg-slate-800/50">
                    <div>
                      <span className="text-slate-400 text-[10px]">Total Value:</span>
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {org.total_deal_value_mad.toLocaleString()} MAD
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">Deals:</span>
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {orgDeals.length} active
                      </div>
                    </div>
                  </div>

                  <div className="mt-2.5 space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 text-[11px]">
                      <Mail className="h-3 w-3 text-slate-400" />
                      <span>{org.primary_contact_name} ({org.primary_contact_email})</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                  <button
                    onClick={() => setSelectedPartnerForStandards(org)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-teal-600 hover:text-teal-700"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Standards</span>
                  </button>
                  <button
                    onClick={() => setSelectedPartnerForEdit(org)}
                    className="rounded-lg bg-aiesec-blue px-3 py-1 text-xs font-semibold text-white hover:bg-blue-600"
                  >
                    Manage Partner
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PARTNER EDIT DRAWER */}
      <PartnerEditDrawer
        isOpen={Boolean(selectedPartnerForEdit)}
        onClose={() => setSelectedPartnerForEdit(null)}
        partner={selectedPartnerForEdit}
        deals={deals}
        contacts={contacts}
        onSavePartner={handleSavePartner}
        onCreateDeal={handleCreateDeal}
        onAddContact={handleAddContact}
      />

      {/* PARTNER STANDARDS MODAL */}
      <PartnerStandardsModal
        isOpen={Boolean(selectedPartnerForStandards)}
        onClose={() => setSelectedPartnerForStandards(null)}
        partner={selectedPartnerForStandards}
      />

      {/* TOUCHPOINT MODAL */}
      <TouchpointModal
        isOpen={isTouchpointModalOpen}
        onClose={() => setIsTouchpointModalOpen(false)}
        organizations={organizations}
        onSaveTouchpoint={handleSaveTouchpoint}
      />
    </div>
  );
}
