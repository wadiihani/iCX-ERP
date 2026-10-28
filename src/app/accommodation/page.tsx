'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Plane,
  Home,
  AlertOctagon,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Upload,
  User,
  Calendar,
  FileText,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { DataTable, type ColumnDef } from '@/components/ui/data-table';
import {
  INITIAL_STANDARDS_DOSSIERS,
  INITIAL_PICKUPS,
  INITIAL_CASES,
  type EPStandardsDossier,
  type ArrivalPickupRecord,
  type CaseSolvingRecord,
  type StandardItem,
} from '@/lib/delivery/standards-types';
import {
  AccommodationProvider,
  AccommodationBed,
  AccommodationAllocation,
  EpGender,
} from '@/lib/types/accommodation';
import {
  validateProviderVettingForBooking,
  validateGenderCompatibility,
  checkTemporalBedCollision,
  allocateBedToEp,
} from '@/lib/accommodation/accommodation-engine';

export default function DeliveryOperationsPage() {
  const [activeTab, setActiveTab] = useState<'standards' | 'logistics' | 'accommodation' | 'cases'>('standards');
  const [standardsDossiers, setStandardsDossiers] = useState<EPStandardsDossier[]>(INITIAL_STANDARDS_DOSSIERS);
  const [pickups, setPickups] = useState<ArrivalPickupRecord[]>(INITIAL_PICKUPS);
  const [cases, setCases] = useState<CaseSolvingRecord[]>(INITIAL_CASES);
  const [selectedDossier, setSelectedDossier] = useState<EPStandardsDossier | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Compute live KPIs
  const totalFulfillmentAvg = Math.round(
    standardsDossiers.reduce((acc, d) => acc + d.fulfillmentRate, 0) / (standardsDossiers.length || 1)
  );
  const upcomingArrivalsCount = pickups.filter(p => p.status === 'PICKUP_SCHEDULED' || p.status === 'FLIGHT_PENDING').length;
  const openCasesCount = cases.filter(c => c.status === 'OPEN_INVESTIGATION').length;

  const handleToggleStandard = (dossierId: string, standardId: number) => {
    setStandardsDossiers(
      standardsDossiers.map((dossier) => {
        if (dossier.epId === dossierId) {
          const updatedStandards = dossier.standards.map((std) => {
            if (std.id === standardId) {
              const nextDelivered = !std.isDelivered;
              return {
                ...std,
                isDelivered: nextDelivered,
                deliveredAt: nextDelivered ? new Date().toISOString().slice(0, 10) : undefined,
              };
            }
            return std;
          });
          const deliveredCount = updatedStandards.filter((s) => s.isDelivered).length;
          const rate = Math.round((deliveredCount / updatedStandards.length) * 100);
          return {
            ...dossier,
            standards: updatedStandards,
            fulfillmentRate: rate,
            status: rate >= 100 ? 'COMPLETED' : rate < 50 ? 'AT_RISK' : 'IN_PROGRESS',
          };
        }
        return dossier;
      })
    );

    if (selectedDossier && selectedDossier.epId === dossierId) {
      const target = standardsDossiers.find(d => d.epId === dossierId);
      if (target) setSelectedDossier({ ...target });
    }
  };

  const handleUpdatePickupStatus = (pickupId: string, nextStatus: ArrivalPickupRecord['status']) => {
    setPickups(
      pickups.map((p) => (p.id === pickupId ? { ...p, status: nextStatus } : p))
    );
    setNotification(`Arrival status updated to ${nextStatus.replace('_', ' ')}.`);
    setTimeout(() => setNotification(null), 3500);
  };

  // Standards Table Columns
  const standardsColumns: ColumnDef<EPStandardsDossier>[] = [
    {
      id: 'epName',
      header: 'Exchange Participant',
      accessorKey: 'epName',
      sortable: true,
      cell: (row) => (
        <div>
          <span className="font-semibold text-slate-900 dark:text-white block hover:text-aiesec-blue">
            {row.epName}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {row.homeLc} • {row.product}
          </span>
        </div>
      ),
    },
    {
      id: 'hostOpportunity',
      header: 'Host Opportunity',
      accessorKey: 'hostOpportunity',
      sortable: true,
      cell: (row) => (
        <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
          {row.hostOpportunity}
        </span>
      ),
    },
    {
      id: 'fulfillmentRate',
      header: '18 Standards Fulfillment',
      accessorKey: 'fulfillmentRate',
      sortable: true,
      cell: (row) => (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-slate-900 dark:text-white">
              {row.fulfillmentRate}% Complete
            </span>
            <span className="text-[10px] text-slate-400">
              {row.standards.filter(s => s.isDelivered).length} / 18 Delivered
            </span>
          </div>
          <div className="w-36 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              style={{ width: `${row.fulfillmentRate}%` }}
              className={`h-full rounded-full transition-all ${
                row.fulfillmentRate >= 80 ? 'bg-emerald-500' : row.fulfillmentRate >= 50 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
            />
          </div>
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Delivery Status',
      accessorKey: 'status',
      sortable: true,
      cell: (row) => {
        const styles = {
          COMPLETED: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300',
          IN_PROGRESS: 'bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300',
          AT_RISK: 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300',
        };
        return (
          <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${styles[row.status]}`}>
            {row.status.replace('_', ' ')}
          </span>
        );
      },
    },
    {
      id: 'action',
      header: 'Audit & Checklist',
      cell: (row) => (
        <button
          onClick={() => setSelectedDossier(row)}
          className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
        >
          Inspect Matrix
        </button>
      ),
      align: 'right',
    },
  ];

  // Logistics Table Columns
  const pickupColumns: ColumnDef<ArrivalPickupRecord>[] = [
    {
      id: 'epName',
      header: 'Participant & Flight',
      sortable: true,
      cell: (row) => (
        <div>
          <span className="font-semibold text-slate-900 dark:text-white block">
            {row.epName}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {row.airline} ({row.flightNumber}) • {row.product}
          </span>
        </div>
      ),
    },
    {
      id: 'arrivalDateTime',
      header: 'Arrival Airport & Time',
      sortable: true,
      cell: (row) => (
        <div>
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
            {new Date(row.arrivalDateTime).toLocaleString('en-GB', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          <span className="text-[10px] text-slate-400">
            {row.arrivalAirport}
          </span>
        </div>
      ),
    },
    {
      id: 'greeter',
      header: 'Greeter & Driver',
      cell: (row) => (
        <div className="text-xs">
          <div className="font-medium text-slate-900 dark:text-white">Greeter: {row.greeterVolunteerName}</div>
          <div className="text-[10px] text-slate-400">Driver: {row.driverName}</div>
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Logistics Status',
      cell: (row) => {
        const styles = {
          CHECKED_IN: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          EP_COLLECTED: 'bg-purple-50 text-purple-800 border-purple-300',
          PICKUP_SCHEDULED: 'bg-blue-50 text-blue-800 border-blue-300',
          FLIGHT_PENDING: 'bg-slate-100 text-slate-700 border-slate-300',
        };
        return (
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${styles[row.status]}`}>
            {row.status.replace('_', ' ')}
          </span>
        );
      },
    },
    {
      id: 'action',
      header: 'Quick Action',
      cell: (row) => (
        <div className="flex items-center gap-1.5 justify-end">
          {row.status === 'PICKUP_SCHEDULED' && (
            <button
              onClick={() => handleUpdatePickupStatus(row.id, 'EP_COLLECTED')}
              className="px-2 py-1 rounded bg-blue-600 text-white text-[10px] font-semibold hover:bg-blue-700"
            >
              Mark Collected
            </button>
          )}
          {row.status === 'EP_COLLECTED' && (
            <button
              onClick={() => handleUpdatePickupStatus(row.id, 'CHECKED_IN')}
              className="px-2 py-1 rounded bg-emerald-600 text-white text-[10px] font-semibold hover:bg-emerald-700"
            >
              Confirm Check-in
            </button>
          )}
        </div>
      ),
      align: 'right',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Exchange Delivery Operations & Case Vault
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Reconciled 18 Exchange Standards fulfillment matrix, arrival flight logistics, and confidential Case Solving Vault.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg 18 Standards Fulfillment</span>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {totalFulfillmentAvg}% Delivered
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Across active in-country participants
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Arrival Pickups Scheduled</span>
            <Plane className="h-4 w-4 text-aiesec-blue" />
          </div>
          <div className="mt-2 text-2xl font-bold text-aiesec-blue">
            {upcomingArrivalsCount} Flights
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Next 7 days at CMN & RBA
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Vetted Beds Available</span>
            <Home className="h-4 w-4 text-purple-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            6 Beds Free
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            100% sanitary inspection certified
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Confidential Active Cases</span>
            <AlertOctagon className="h-4 w-4 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-600">
            {openCasesCount} Open
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Strict 72-hour escalation SLA
          </div>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900">
          {notification}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-4">
        <button
          onClick={() => setActiveTab('standards')}
          className={`pb-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'standards'
              ? 'border-aiesec-blue text-aiesec-blue dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>18 Standards Matrix ({standardsDossiers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('logistics')}
          className={`pb-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'logistics'
              ? 'border-aiesec-blue text-aiesec-blue dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Plane className="h-4 w-4" />
          <span>Arrival & Pickup Logistics ({pickups.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('cases')}
          className={`pb-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'cases'
              ? 'border-aiesec-blue text-aiesec-blue dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <AlertOctagon className="h-4 w-4" />
          <span>Case Solving Vault ({cases.length})</span>
        </button>
      </div>

      {/* Tab 1: Standards Matrix Table */}
      {activeTab === 'standards' && (
        <DataTable
          data={standardsDossiers}
          columns={standardsColumns}
          keyExtractor={(d) => d.epId}
          searchPlaceholder="Search EP standards dossiers by name, opportunity, LC..."
          exportFileName="aiesec-rabat-18-standards.csv"
        />
      )}

      {/* Tab 2: Arrival & Logistics Table */}
      {activeTab === 'logistics' && (
        <DataTable
          data={pickups}
          columns={pickupColumns}
          keyExtractor={(p) => p.id}
          searchPlaceholder="Search pickups by EP name, flight number, greeter..."
          exportFileName="aiesec-rabat-arrival-logistics.csv"
        />
      )}

      {/* Tab 3: Case Solving Vault */}
      {activeTab === 'cases' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 dark:border-rose-900/60 dark:bg-rose-950/20 flex items-start gap-3">
            <AlertOctagon className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-rose-900 dark:text-rose-200">
                Restricted Confidential Governance
              </h3>
              <p className="text-xs text-rose-700 dark:text-rose-300">
                Case dossiers are encrypted and access-restricted to LCP and VP CXP. Unresolved Tier-1 local issues automatically escalate to MC Morocco after 72 hours.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cases.map((c) => (
              <div
                key={c.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-subtle dark:border-slate-800 dark:bg-slate-900 space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                    {c.caseNumber}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                    {c.tier.replace(/_/g, ' ')}
                  </span>
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    EP: {c.epName}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Entity: {c.entityName}
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                  {c.summary}
                </p>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800 text-slate-500">
                  <span>Assigned: <strong className="text-slate-700 dark:text-slate-300">{c.assignedInvestigator}</strong></span>
                  <span className="text-rose-600 font-bold font-mono">
                    Escalation SLA: &lt; 48h
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Standards Checklist Drawer / Modal */}
      {selectedDossier && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in"
        >
          <div className="w-full max-w-2xl max-h-[85vh] rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  18 Standards Fulfillment Checklist: {selectedDossier.epName}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">
                  {selectedDossier.fulfillmentRate}% Delivered • {selectedDossier.product}
                </p>
              </div>
              <button
                onClick={() => setSelectedDossier(null)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-2 text-xs">
              {selectedDossier.standards.map((std) => (
                <div
                  key={std.id}
                  onClick={() => handleToggleStandard(selectedDossier.epId, std.id)}
                  className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition ${
                    std.isDelivered
                      ? 'border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 text-slate-900 dark:text-white'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={std.isDelivered}
                      onChange={() => {}} // handled by parent div click
                      className="rounded border-slate-300 text-aiesec-blue focus:ring-aiesec-blue"
                    />
                    <div>
                      <span className="font-semibold block">
                        {std.code}: {std.title}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Phase: {std.phase} • Responsible: {std.responsibleParty}
                      </span>
                    </div>
                  </div>

                  {std.isDelivered ? (
                    <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded">
                      ✓ Delivered {std.deliveredAt}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 italic">
                      Pending delivery
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedDossier(null)}
                className="px-4 py-1.5 rounded-md bg-slate-900 text-white text-xs font-semibold dark:bg-white dark:text-slate-900"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
