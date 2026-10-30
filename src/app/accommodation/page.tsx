'use client';

import React, { useState, useEffect } from 'react';
import {
  Home,
  Plane,
  ShieldCheck,
  AlertOctagon,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  ExternalLink,
  MessageSquare,
  HelpCircle,
  FileCheck,
  Plus,
  MapPin,
} from 'lucide-react';
import {
  BedAllocationBoard,
  INITIAL_BEDS_CATALOG,
  INITIAL_PROVIDERS_CATALOG,
  INITIAL_ALLOCATIONS_CATALOG,
} from '@/components/accommodation/bed-allocation-board';
import {
  PickupLogisticsTracker,
  INITIAL_ENHANCED_PICKUPS,
} from '@/components/accommodation/pickup-logistics-tracker';
import { MobileFieldTools } from '@/components/accommodation/mobile-field-tools';
import {
  CaseSolvingVault,
  INITIAL_EXTENDED_CASES,
} from '@/components/cases/case-solving-vault';
import {
  REFRESHED_STANDARDS_CATALOG,
  calculateRefreshedFulfillment,
  generateCorrectiveTaskFromTouchpoint,
  type EpStandardDeliveryItem,
  type CustomerTouchpointRecord,
  type CorrectiveActionTask,
} from '@/lib/delivery/refreshed-standards';
import {
  AccommodationAllocation,
} from '@/lib/types/accommodation';

interface MockParticipantStandards {
  epId: string;
  epName: string;
  product: 'iGV' | 'iGTa' | 'iGTe';
  homeLc: string;
  hostOpportunity: string;
  standards: Record<string, EpStandardDeliveryItem>;
  touchpoints: CustomerTouchpointRecord[];
}

const INITIAL_EP_STANDARDS_RECORDS: MockParticipantStandards[] = [
  {
    epId: 'ep_2026_081',
    epName: 'Sofia Martinez',
    product: 'iGV',
    homeLc: 'AIESEC in Bogota UniAndes',
    hostOpportunity: 'Youth Digital Literacy & Coding Coach',
    standards: {
      '1': { standardId: '1', internalDelivered: true, deliveryDate: '2026-10-22', evidenceUrl: 'https://lda.aiesec.org/sofia', expaSurveyAnswer: 'YES', isDiscrepancy: false },
      '2': { standardId: '2', internalDelivered: true, deliveryDate: '2026-10-23', evidenceUrl: 'https://drive.google.com/ops-cert', expaSurveyAnswer: 'YES', isDiscrepancy: false },
      '3': { standardId: '3', internalDelivered: true, deliveryDate: '2026-10-24', evidenceUrl: 'https://allianz.com/policy/99823', expaSurveyAnswer: 'YES', isDiscrepancy: false },
      '4': { standardId: '4', internalDelivered: true, deliveryDate: '2026-10-25', evidenceUrl: 'https://drive.google.com/expectations', expaSurveyAnswer: 'YES', isDiscrepancy: false },
      '5': { standardId: '5', internalDelivered: true, deliveryDate: '2026-10-24', evidenceUrl: 'https://acces-maroc.ma/visa/081', expaSurveyAnswer: 'YES', isDiscrepancy: false },
      '6': { standardId: '6', internalDelivered: true, deliveryDate: '2026-10-26', evidenceUrl: 'https://drive.google.com/pickup-guide', expaSurveyAnswer: 'PENDING', isDiscrepancy: false },
      '7': { standardId: '7', internalDelivered: true, deliveryDate: '2026-10-26', evidenceUrl: 'https://drive.google.com/housing-dar-zellige', expaSurveyAnswer: 'YES', isDiscrepancy: false },
      '8': { standardId: '8', internalDelivered: true, deliveryDate: '2026-10-27', evidenceUrl: 'https://drive.google.com/ips-rabat', expaSurveyAnswer: 'PENDING', isDiscrepancy: false },
      '9': { standardId: '9', internalDelivered: true, deliveryDate: '2026-10-28', evidenceUrl: 'https://drive.google.com/first-day-photo', expaSurveyAnswer: 'YES', isDiscrepancy: false },
      '10a': { standardId: '10a', internalDelivered: true, deliveryDate: '2026-10-29', evidenceUrl: 'https://drive.google.com/week1-alignment', expaSurveyAnswer: 'NO', isDiscrepancy: true, notes: 'EP noted supervisor arrived 2 hours late. Internal marked delivered.' },
      '10b': { standardId: '10b', internalDelivered: false, expaSurveyAnswer: 'PENDING', isDiscrepancy: false },
      '11': { standardId: '11', internalDelivered: false, expaSurveyAnswer: 'PENDING', isDiscrepancy: false },
      '12': { standardId: '12', internalDelivered: false, expaSurveyAnswer: 'PENDING', isDiscrepancy: false },
      '13': { standardId: '13', internalDelivered: false, expaSurveyAnswer: 'PENDING', isDiscrepancy: false },
      '14': { standardId: '14', internalDelivered: false, expaSurveyAnswer: 'PENDING', isDiscrepancy: false },
      '15': { standardId: '15', internalDelivered: false, expaSurveyAnswer: 'PENDING', isDiscrepancy: false },
      '16': { standardId: '16', internalDelivered: false, expaSurveyAnswer: 'PENDING', isDiscrepancy: false },
      '17': { standardId: '17', internalDelivered: true, deliveryDate: '2026-10-28', evidenceUrl: 'https://drive.google.com/touchpoint-1', expaSurveyAnswer: 'YES', isDiscrepancy: false },
      '18': { standardId: '18', internalDelivered: false, expaSurveyAnswer: 'PENDING', isDiscrepancy: false },
    },
    touchpoints: [
      {
        id: 'tp_01',
        epId: 'ep_2026_081',
        epName: 'Sofia Martinez',
        touchpointDate: '2026-10-28',
        officerName: 'Amina Benali (VP CXP)',
        overallMood: 4,
        workingHoursSatisfied: true,
        housingSatisfied: true,
        deliverablesOnTrack: true,
        notes: 'Sofia is enjoying Rabat and her host family. Started coding curriculum at NGO.',
        requiresAction: false,
      },
    ],
  },
  {
    epId: 'ep_2026_077',
    epName: 'Amara Diop',
    product: 'iGV',
    homeLc: 'AIESEC in Dakar',
    hostOpportunity: 'Climate Action & Green Rabat',
    standards: {
      '1': { standardId: '1', internalDelivered: true, deliveryDate: '2026-10-20', expaSurveyAnswer: 'YES', isDiscrepancy: false },
      '2': { standardId: '2', internalDelivered: true, deliveryDate: '2026-10-21', expaSurveyAnswer: 'YES', isDiscrepancy: false },
      '3': { standardId: '3', internalDelivered: true, deliveryDate: '2026-10-22', expaSurveyAnswer: 'YES', isDiscrepancy: false },
      '4': { standardId: '4', internalDelivered: true, deliveryDate: '2026-10-23', expaSurveyAnswer: 'YES', isDiscrepancy: false },
      '5': { standardId: '5', internalDelivered: true, deliveryDate: '2026-10-24', expaSurveyAnswer: 'YES', isDiscrepancy: false },
      '6': { standardId: '6', internalDelivered: true, deliveryDate: '2026-10-25', expaSurveyAnswer: 'YES', isDiscrepancy: false },
      '7': { standardId: '7', internalDelivered: true, deliveryDate: '2026-10-26', expaSurveyAnswer: 'NO', isDiscrepancy: true, notes: 'Hot water plumbing breakdown.' },
      '8': { standardId: '8', internalDelivered: true, deliveryDate: '2026-10-27', expaSurveyAnswer: 'YES', isDiscrepancy: false },
      '9': { standardId: '9', internalDelivered: false, expaSurveyAnswer: 'PENDING', isDiscrepancy: false },
      '10a': { standardId: '10a', internalDelivered: false, expaSurveyAnswer: 'PENDING', isDiscrepancy: false },
      '10b': { standardId: '10b', internalDelivered: false, expaSurveyAnswer: 'PENDING', isDiscrepancy: false },
      '11': { standardId: '11', internalDelivered: false, expaSurveyAnswer: 'PENDING', isDiscrepancy: false },
      '12': { standardId: '12', internalDelivered: false, expaSurveyAnswer: 'PENDING', isDiscrepancy: false },
      '13': { standardId: '13', internalDelivered: false, expaSurveyAnswer: 'PENDING', isDiscrepancy: false },
      '14': { standardId: '14', internalDelivered: false, expaSurveyAnswer: 'PENDING', isDiscrepancy: false },
      '15': { standardId: '15', internalDelivered: false, expaSurveyAnswer: 'PENDING', isDiscrepancy: false },
      '16': { standardId: '16', internalDelivered: false, expaSurveyAnswer: 'PENDING', isDiscrepancy: false },
      '17': { standardId: '17', internalDelivered: false, expaSurveyAnswer: 'PENDING', isDiscrepancy: false },
      '18': { standardId: '18', internalDelivered: false, expaSurveyAnswer: 'PENDING', isDiscrepancy: false },
    },
    touchpoints: [
      {
        id: 'tp_02',
        epId: 'ep_2026_077',
        epName: 'Amara Diop',
        touchpointDate: '2026-10-26',
        officerName: 'Yassine Alami (VP iGV)',
        overallMood: 2,
        workingHoursSatisfied: true,
        housingSatisfied: false,
        deliverablesOnTrack: true,
        notes: 'Water heater malfunction in apartment. Needs immediate landlord or plumber intervention.',
        requiresAction: true,
      },
    ],
  },
];

export default function AccommodationAndDeliveryHubPage() {
  const [activeTab, setActiveTab] = useState<'housing' | 'pickups' | 'standards' | 'cases' | 'field-tools'>('housing');
  const [allocations, setAllocations] = useState<AccommodationAllocation[]>(INITIAL_ALLOCATIONS_CATALOG);
  const [participantStandards, setParticipantStandards] = useState<MockParticipantStandards[]>(INITIAL_EP_STANDARDS_RECORDS);
  const [selectedAuditParticipant, setSelectedAuditParticipant] = useState<MockParticipantStandards | null>(null);
  const [correctiveTasks, setCorrectiveTasks] = useState<CorrectiveActionTask[]>([]);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Sync hash routing on client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('standard')) setActiveTab('standards');
      else if (hash.includes('case')) setActiveTab('cases');
      else if (hash.includes('pickup') || hash.includes('logistics')) setActiveTab('pickups');
      else if (hash.includes('housing') || hash.includes('accommodation')) setActiveTab('housing');
    }
  }, []);

  const handleAddAllocation = (alloc: AccommodationAllocation) => {
    setAllocations([alloc, ...allocations]);
    setNotificationMsg(`Bed ${alloc.bedId} successfully reserved for ${alloc.epName || 'EP'}.`);
    setTimeout(() => setNotificationMsg(null), 3500);
  };

  const handleToggleStandard = (epId: string, stdId: string) => {
    setParticipantStandards(
      participantStandards.map((p) => {
        if (p.epId === epId) {
          const current = p.standards[stdId] || { standardId: stdId, internalDelivered: false, expaSurveyAnswer: 'PENDING', isDiscrepancy: false };
          const nextDelivered = !current.internalDelivered;
          const isDisc = (nextDelivered && current.expaSurveyAnswer === 'NO') || (!nextDelivered && current.expaSurveyAnswer === 'YES');
          
          const updatedStandards = {
            ...p.standards,
            [stdId]: {
              ...current,
              internalDelivered: nextDelivered,
              deliveryDate: nextDelivered ? new Date().toISOString().slice(0, 10) : undefined,
              isDiscrepancy: isDisc,
            },
          };

          return { ...p, standards: updatedStandards };
        }
        return p;
      })
    );

    if (selectedAuditParticipant && selectedAuditParticipant.epId === epId) {
      const updated = participantStandards.find((p) => p.epId === epId);
      if (updated) setSelectedAuditParticipant({ ...updated });
    }
  };

  const handleGenerateCorrectiveTask = (touchpoint: CustomerTouchpointRecord) => {
    const task = generateCorrectiveTaskFromTouchpoint(touchpoint);
    setCorrectiveTasks([task, ...correctiveTasks]);
    setNotificationMsg(`Corrective action task generated: "${task.title}". Dispatched to VP CXP.`);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Exchange Delivery Operations & Quality Vault
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Grounded in the AIESEC Exchange Hub: Accommodation (#7), Airport Pickups (#6), Refreshed 18 Standards (#10a/#10b), and Confidential Legal Case Vault.
          </p>
        </div>
      </div>

      {/* Global Operational Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Vetted Beds Active</span>
            <Home className="h-4 w-4 text-purple-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {INITIAL_BEDS_CATALOG.length} Beds
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 font-semibold">
            {INITIAL_PROVIDERS_CATALOG.length} host providers (100% physically vetted)
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Scheduled Pickups</span>
            <Plane className="h-4 w-4 text-aiesec-blue" />
          </div>
          <div className="mt-2 text-2xl font-bold text-aiesec-blue">
            {INITIAL_ENHANCED_PICKUPS.length} Missions
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            CMN, RBA & ONCF train stations
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Refreshed 18 Standards</span>
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            19 Items
          </div>
          <div className="mt-1 text-[11px] text-slate-400 font-mono">
            With #10a (Mid) & #10b (Final) split
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Legal Cases</span>
            <AlertOctagon className="h-4 w-4 text-rose-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-600">
            {INITIAL_EXTENDED_CASES.length} Cases
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Strict 3-tier escalation clocks
          </div>
        </div>
      </div>

      {notificationMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-4">
        <button
          onClick={() => setActiveTab('housing')}
          className={`pb-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'housing'
              ? 'border-aiesec-blue text-aiesec-blue dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Home className="h-4 w-4" />
          <span>Housing & Bed Inventory (#7)</span>
        </button>

        <button
          onClick={() => setActiveTab('pickups')}
          className={`pb-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'pickups'
              ? 'border-aiesec-blue text-aiesec-blue dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Plane className="h-4 w-4" />
          <span>Arrival Pickups (#6)</span>
        </button>

        <button
          onClick={() => setActiveTab('standards')}
          className={`pb-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'standards'
              ? 'border-aiesec-blue text-aiesec-blue dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>18 Refreshed Standards & CXP</span>
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
          <span>Case Solving Vault & Visas</span>
        </button>

        <button
          onClick={() => setActiveTab('field-tools')}
          className={`pb-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'field-tools'
              ? 'border-aiesec-blue text-aiesec-blue dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <MapPin className="h-4 w-4" />
          <span>Mobile Field Tools (#6 & #7)</span>
        </button>
      </div>

      {/* Tab 1: Housing & Bed Inventory */}
      {activeTab === 'housing' && (
        <BedAllocationBoard
          providers={INITIAL_PROVIDERS_CATALOG}
          beds={INITIAL_BEDS_CATALOG}
          allocations={allocations}
          onAddAllocation={handleAddAllocation}
        />
      )}

      {/* Tab 2: Arrival Pickups */}
      {activeTab === 'pickups' && <PickupLogisticsTracker />}

      {/* Tab 3: 18 Refreshed Standards & CXP Matrix */}
      {activeTab === 'standards' && (
        <div className="space-y-6">
          {/* Customer Feedback Alerts if any low mood */}
          {participantStandards.some((p) => p.touchpoints.some((t) => t.requiresAction)) && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 text-xs font-bold">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Customer Experience Feedback Alerts Requiring Action</span>
              </div>

              {participantStandards.map((p) =>
                p.touchpoints
                  .filter((t) => t.requiresAction)
                  .map((t) => (
                    <div
                      key={t.id}
                      className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-amber-200 dark:border-amber-800/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {p.epName} ({p.product}) • Mood Score: {t.overallMood}/5
                        </span>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                          {t.notes}
                        </p>
                      </div>

                      <button
                        onClick={() => handleGenerateCorrectiveTask(t)}
                        className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shadow-sm shrink-0"
                      >
                        Generate Corrective Action Task
                      </button>
                    </div>
                  ))
              )}
            </div>
          )}

          {/* Participant Delivery Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {participantStandards.map((p) => {
              const metrics = calculateRefreshedFulfillment(p.standards);

              return (
                <div
                  key={p.epId}
                  className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle space-y-4"
                >
                  <div className="flex items-start justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{p.epName}</h3>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {p.homeLc} • {p.product}
                      </p>
                      <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 font-medium">
                        {p.hostOpportunity}
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedAuditParticipant(p)}
                      className="px-3 py-1.5 rounded-lg bg-aiesec-blue hover:bg-blue-700 text-white font-semibold text-xs shadow-sm"
                    >
                      Audit Matrix
                    </button>
                  </div>

                  {/* Progress & Discrepancy Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {metrics.fulfillmentPercentage}% Delivered
                      </span>
                      <span className="text-slate-500">
                        {metrics.deliveredCount} / {metrics.total} Standards
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${metrics.fulfillmentPercentage}%` }}
                        className={`h-full rounded-full transition-all ${
                          metrics.fulfillmentPercentage >= 80
                            ? 'bg-emerald-500'
                            : metrics.fulfillmentPercentage >= 50
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                      />
                    </div>

                    {metrics.discrepancyCount > 0 && (
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-600 pt-1">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>{metrics.discrepancyCount} Survey Discrepancy Alert! (Internal delivered vs EXPA response mismatch)</span>
                      </div>
                    )}
                  </div>

                  {/* Standard #10 Split Status Badge */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                    <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400 block text-[10px]">#10a Initial OP Alignment</span>
                      <strong className={p.standards['10a']?.internalDelivered ? 'text-emerald-600' : 'text-slate-500'}>
                        {p.standards['10a']?.internalDelivered ? '✓ Delivered Week 1' : 'Pending Week 1'}
                      </strong>
                    </div>

                    <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400 block text-[10px]">#10b Closing OP Alignment</span>
                      <strong className={p.standards['10b']?.internalDelivered ? 'text-emerald-600' : 'text-slate-500'}>
                        {p.standards['10b']?.internalDelivered ? '✓ Final Sign-off' : 'Pending Final Week'}
                      </strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Case Vault & Legal Readiness */}
      {activeTab === 'cases' && <CaseSolvingVault />}

      {/* Tab 5: Mobile Field Tools */}
      {activeTab === 'field-tools' && <MobileFieldTools />}

      {/* Audit Matrix Modal */}
      {selectedAuditParticipant && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in"
        >
          <div className="w-full max-w-3xl max-h-[90vh] rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Refreshed 18 Standards Matrix: {selectedAuditParticipant.epName}
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedAuditParticipant.hostOpportunity} • {selectedAuditParticipant.product}
                </p>
              </div>
              <button
                onClick={() => setSelectedAuditParticipant(null)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
              {REFRESHED_STANDARDS_CATALOG.map((def) => {
                const item = selectedAuditParticipant.standards[def.id] || {
                  standardId: def.id,
                  internalDelivered: false,
                  expaSurveyAnswer: 'PENDING',
                  isDiscrepancy: false,
                };

                return (
                  <div
                    key={def.id}
                    className={`p-3 rounded-lg border transition ${
                      item.isDiscrepancy
                        ? 'border-rose-300 bg-rose-50/50 dark:bg-rose-950/20'
                        : item.internalDelivered
                        ? 'border-emerald-200 bg-emerald-50/30 dark:bg-emerald-950/10'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          checked={item.internalDelivered}
                          onChange={() => handleToggleStandard(selectedAuditParticipant.epId, def.id)}
                          className="mt-1 rounded border-slate-300 text-aiesec-blue focus:ring-aiesec-blue cursor-pointer"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900 dark:text-white">
                              {def.code}: {def.name}
                            </span>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600">
                              {def.stage} • {def.surveyPhase}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">{def.guidanceText}</p>
                          {item.evidenceUrl && (
                            <a
                              href={item.evidenceUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-aiesec-blue hover:underline inline-flex items-center gap-1 mt-1 font-mono"
                            >
                              <ExternalLink className="h-2.5 w-2.5" />
                              <span>Evidence Document</span>
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-1 justify-end">
                          <span className="text-[10px] text-slate-400">EXPA Survey:</span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            item.expaSurveyAnswer === 'YES'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.expaSurveyAnswer === 'NO'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {item.expaSurveyAnswer}
                          </span>
                        </div>

                        {item.isDiscrepancy && (
                          <span className="text-[10px] text-rose-600 font-bold block mt-1">
                            Discrepancy Alert!
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedAuditParticipant(null)}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold dark:bg-white dark:text-slate-900"
              >
                Close Audit Matrix
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
