'use client';

import React, { useState } from 'react';
import {
  Plane,
  Train,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  Phone,
  FileText,
  Smartphone,
  Coins,
  Send,
  ExternalLink,
  Copy,
  Check,
  SmartphoneNfc,
  Eye,
  Filter,
} from 'lucide-react';
import type { TransitPort, PickupMission } from '@/lib/types/arrival-readiness';
import { generatePickupInstructionsPack } from '@/lib/arrival/arrival-engine';

export interface EnhancedPickupRecord {
  id: string;
  epId: string;
  epName: string;
  epPhoneWhatsapp: string;
  product: 'iGV' | 'iGTa' | 'iGTe';
  transitPort: TransitPort;
  flightOrTrainNumber: string;
  carrierName: string;
  arrivalDateTime: string; // ISO 8601
  greeterBuddyName: string;
  greeterBuddyPhone: string;
  cxpOfficerName: string;
  housingAddress: string;
  status: 'FLIGHT_PENDING' | 'PICKUP_SCHEDULED' | 'EP_COLLECTED' | 'CHECKED_IN';
  
  // Standard #6 Written Guide
  guideDispatchedAt: string | null;
  
  // Welcome Pack Logistics
  simCardProvided: boolean;
  madExchangeAssisted: boolean;
  
  // Handover
  handoverCompletedAt: string | null;
  handoverNotes?: string;
}

export const INITIAL_ENHANCED_PICKUPS: EnhancedPickupRecord[] = [
  {
    id: 'pick_001',
    epId: 'ep_2026_081',
    epName: 'Sofia Martinez',
    epPhoneWhatsapp: '+573001234567',
    product: 'iGV',
    transitPort: 'CMN_AIRPORT',
    flightOrTrainNumber: 'AT-801',
    carrierName: 'Royal Air Maroc',
    arrivalDateTime: '2026-11-15T16:30:00Z',
    greeterBuddyName: 'Mehdi Benkaddour',
    greeterBuddyPhone: '+212661889900',
    cxpOfficerName: 'Amina Benali',
    housingAddress: '14 Rue Oukaimeden, Agdal, Rabat (Dar Zellige)',
    status: 'PICKUP_SCHEDULED',
    guideDispatchedAt: '2026-11-12T10:00:00Z', // Dispatched 3 days prior
    simCardProvided: false,
    madExchangeAssisted: false,
    handoverCompletedAt: null,
  },
  {
    id: 'pick_002',
    epId: 'ep_2026_077',
    epName: 'Amara Diop',
    epPhoneWhatsapp: '+221776543210',
    product: 'iGV',
    transitPort: 'CMN_AIRPORT',
    flightOrTrainNumber: 'AT-560',
    carrierName: 'Royal Air Maroc',
    arrivalDateTime: '2026-11-20T14:15:00Z',
    greeterBuddyName: 'Yassine Alami',
    greeterBuddyPhone: '+212662334455',
    cxpOfficerName: 'Amina Benali',
    housingAddress: 'Residence Al Manzah, Hassan, Rabat',
    status: 'PICKUP_SCHEDULED',
    guideDispatchedAt: '2026-11-17T09:00:00Z',
    simCardProvided: false,
    madExchangeAssisted: false,
    handoverCompletedAt: null,
  },
  {
    id: 'pick_003',
    epId: 'ep_2026_065',
    epName: 'Elif Demir',
    epPhoneWhatsapp: '+905321112233',
    product: 'iGTe',
    transitPort: 'RABAT_AGDAL_TRAIN',
    flightOrTrainNumber: 'Al Boraq Train 12',
    carrierName: 'ONCF Al Boraq',
    arrivalDateTime: '2026-11-25T11:45:00Z',
    greeterBuddyName: 'Mehdi Benkaddour',
    greeterBuddyPhone: '+212661889900',
    cxpOfficerName: 'Amina Benali',
    housingAddress: 'Dar Zellige Apt 1, Agdal, Rabat',
    status: 'FLIGHT_PENDING',
    guideDispatchedAt: null,
    simCardProvided: false,
    madExchangeAssisted: false,
    handoverCompletedAt: null,
  },
  {
    id: 'pick_004',
    epId: 'ep_2026_090',
    epName: 'Lucas Silva',
    epPhoneWhatsapp: '+554198765432',
    product: 'iGTa',
    transitPort: 'RBA_AIRPORT',
    flightOrTrainNumber: 'AF-1430',
    carrierName: 'Air France',
    arrivalDateTime: '2026-12-01T18:20:00Z',
    greeterBuddyName: 'Salma Tazi',
    greeterBuddyPhone: '+212664556677',
    cxpOfficerName: 'Amina Benali',
    housingAddress: 'Residence Al Manzah, Hassan, Rabat',
    status: 'FLIGHT_PENDING',
    guideDispatchedAt: null,
    simCardProvided: false,
    madExchangeAssisted: false,
    handoverCompletedAt: null,
  },
];

export function PickupLogisticsTracker() {
  const [pickups, setPickups] = useState<EnhancedPickupRecord[]>(INITIAL_ENHANCED_PICKUPS);
  const [selectedPort, setSelectedPort] = useState<'ALL' | TransitPort>('ALL');
  const [isMobileView, setIsMobileView] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedGuidePack, setSelectedGuidePack] = useState<EnhancedPickupRecord | null>(null);

  const filteredPickups = pickups.filter((p) => {
    if (selectedPort !== 'ALL' && p.transitPort !== selectedPort) return false;
    return true;
  });

  const handleUpdateStatus = (id: string, nextStatus: EnhancedPickupRecord['status']) => {
    setPickups(
      pickups.map((p) => {
        if (p.id === id) {
          const isDone = nextStatus === 'CHECKED_IN';
          return {
            ...p,
            status: nextStatus,
            handoverCompletedAt: isDone ? new Date().toISOString() : p.handoverCompletedAt,
          };
        }
        return p;
      })
    );
  };

  const handleToggleSim = (id: string) => {
    setPickups(
      pickups.map((p) => (p.id === id ? { ...p, simCardProvided: !p.simCardProvided } : p))
    );
  };

  const handleToggleMad = (id: string) => {
    setPickups(
      pickups.map((p) => (p.id === id ? { ...p, madExchangeAssisted: !p.madExchangeAssisted } : p))
    );
  };

  const handleDispatchGuide = (id: string) => {
    setPickups(
      pickups.map((p) =>
        p.id === id ? { ...p, guideDispatchedAt: new Date().toISOString() } : p
      )
    );
  };

  const handleCopyGuideText = (p: EnhancedPickupRecord) => {
    const text = `🇲🇦 AIESEC IN RABAT - WELCOME & ARRIVAL PICKUP GUIDE (Standard #6)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Dear ${p.epName},
Welcome to Morocco! Here are your official arrival and pickup details:

✈️ TRANSPORT DETAILS:
Port: ${p.transitPort.replace(/_/g, ' ')}
Flight/Train: ${p.flightOrTrainNumber} (${p.carrierName})
Scheduled Arrival: ${new Date(p.arrivalDateTime).toUTCString()}

🙋‍♂️ ASSIGNED VOLUNTEER BUDDY:
Name: ${p.greeterBuddyName}
WhatsApp: ${p.greeterBuddyPhone}
Meeting Point: Main arrivals exit gate holding the blue "AIESEC IN RABAT" placard.

📱 LOGISTICS ON ARRIVAL:
• Moroccan SIM Card: Your buddy will assist you in acquiring and registering a Maroc Telecom / Orange SIM card immediately at the terminal.
• Currency Exchange: Official exchange bureaux are located before the terminal exit. MAD rate is ~10.8 MAD per EUR.
• Housing Address: ${p.housingAddress}

🚨 24/7 LC CRISIS LINE:
Amina Benali (VP CXP): +212661009988
LCP Hotline: +212661223344

Have a safe flight! We look forward to welcoming you to the Kingdom of Morocco!`;

    navigator.clipboard.writeText(text);
    setCopiedId(p.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-subtle">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-500">Transit Port:</span>
          <select
            value={selectedPort}
            onChange={(e) => setSelectedPort(e.target.value as any)}
            className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-aiesec-blue"
          >
            <option value="ALL">All Arrival Ports ({pickups.length})</option>
            <option value="CMN_AIRPORT">Casablanca Mohammed V (CMN)</option>
            <option value="RBA_AIRPORT">Rabat-Salé Airport (RBA)</option>
            <option value="RABAT_AGDAL_TRAIN">Rabat-Agdal Train Station</option>
            <option value="RABAT_VILLE_TRAIN">Rabat-Ville Train Station</option>
          </select>
        </div>

        <button
          onClick={() => setIsMobileView(!isMobileView)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
            isMobileView
              ? 'bg-aiesec-blue text-white border-aiesec-blue shadow-sm'
              : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
          }`}
        >
          <Smartphone className="h-3.5 w-3.5" />
          <span>{isMobileView ? 'Exit Mobile Greeter View' : 'Mobile Greeter View'}</span>
        </button>
      </div>

      {/* Main Pickups Display */}
      {isMobileView ? (
        /* Mobile-Friendly Streamlined Terminal Cards */
        <div className="max-w-md mx-auto space-y-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl text-xs text-blue-800 dark:text-blue-300">
            📱 <strong>Arrival Greeter Mode:</strong> Streamlined for volunteers meeting EPs at the arrivals terminal gate.
          </div>

          {filteredPickups.map((p) => (
            <div
              key={p.id}
              className="p-5 rounded-2xl border-2 border-aiesec-blue/30 bg-white dark:bg-slate-900 shadow-md space-y-4"
            >
              <div className="flex items-start justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{p.epName}</h3>
                  <span className="text-xs font-mono font-semibold text-aiesec-blue">
                    {p.flightOrTrainNumber} • {p.carrierName}
                  </span>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                  p.status === 'CHECKED_IN'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : p.status === 'EP_COLLECTED'
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                }`}>
                  {p.status.replace('_', ' ')}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Arrival Time:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {new Date(p.arrivalDateTime).toLocaleString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Port:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {p.transitPort.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">EP WhatsApp:</span>
                  <a
                    href={`https://wa.me/${p.epPhoneWhatsapp.replace(/\+/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-emerald-600 hover:underline flex items-center gap-1"
                  >
                    <Phone className="h-3 w-3" />
                    <span>{p.epPhoneWhatsapp}</span>
                  </a>
                </div>
              </div>

              {/* On-Arrival Welcome Checklist */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Arrival Tasks
                </span>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={p.simCardProvided}
                    onChange={() => handleToggleSim(p.id)}
                    className="rounded border-slate-300 text-aiesec-blue focus:ring-aiesec-blue"
                  />
                  <span>Moroccan SIM Card Acquired</span>
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={p.madExchangeAssisted}
                    onChange={() => handleToggleMad(p.id)}
                    className="rounded border-slate-300 text-aiesec-blue focus:ring-aiesec-blue"
                  />
                  <span>MAD Currency Exchange Assisted</span>
                </label>
              </div>

              {/* One-Tap Big Status Action Button */}
              <div className="pt-2">
                {p.status === 'PICKUP_SCHEDULED' && (
                  <button
                    onClick={() => handleUpdateStatus(p.id, 'EP_COLLECTED')}
                    className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Mark EP Met & Collected</span>
                  </button>
                )}
                {p.status === 'EP_COLLECTED' && (
                  <button
                    onClick={() => handleUpdateStatus(p.id, 'CHECKED_IN')}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Confirm Housing Check-in & Handover</span>
                  </button>
                )}
                {p.status === 'CHECKED_IN' && (
                  <div className="text-center py-2 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl">
                    ✓ Handover Complete to {p.cxpOfficerName}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Full Desktop Ops Board */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPickups.map((p) => {
            const isGuideSent = Boolean(p.guideDispatchedAt);
            const isFlightSoon = new Date(p.arrivalDateTime).getTime() - Date.now() < 3 * 24 * 3600 * 1000;

            return (
              <div
                key={p.id}
                className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle space-y-4"
              >
                <div className="flex items-start justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{p.epName}</h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {p.product}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      {p.transitPort.includes('AIRPORT') ? (
                        <Plane className="h-3.5 w-3.5 text-aiesec-blue" />
                      ) : (
                        <Train className="h-3.5 w-3.5 text-purple-600" />
                      )}
                      <span>{p.transitPort.replace(/_/g, ' ')}</span>
                      <span>•</span>
                      <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                        {p.flightOrTrainNumber} ({p.carrierName})
                      </span>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase ${
                    p.status === 'CHECKED_IN'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : p.status === 'EP_COLLECTED'
                      ? 'bg-purple-50 text-purple-800 border-purple-300 dark:bg-purple-950/40 dark:text-purple-300'
                      : p.status === 'PICKUP_SCHEDULED'
                      ? 'bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300'
                      : 'bg-slate-100 text-slate-700 border-slate-300'
                  }`}>
                    {p.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Logistics Details */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Arrival Date & Time</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {new Date(p.arrivalDateTime).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block">Assigned Greeter Buddy</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {p.greeterBuddyName}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 block">
                      {p.greeterBuddyPhone}
                    </span>
                  </div>
                </div>

                {/* Standard #6 Written Guide Section */}
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-aiesec-blue" />
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px]">
                        Standard #6 Written Pickup Guide
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {isGuideSent
                          ? `Dispatched on ${new Date(p.guideDispatchedAt!).toLocaleDateString('en-GB')}`
                          : 'Must be dispatched at least 3 days prior (T-3)'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopyGuideText(p)}
                      className="px-2.5 py-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 text-[10px] font-semibold flex items-center gap-1"
                    >
                      {copiedId === p.id ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedId === p.id ? 'Copied' : 'Copy Guide'}</span>
                    </button>
                    {!isGuideSent && (
                      <button
                        onClick={() => handleDispatchGuide(p.id)}
                        className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold"
                      >
                        Mark Dispatched
                      </button>
                    )}
                  </div>
                </div>

                {/* Welcome Pack & Handover Progress */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={p.simCardProvided}
                      onChange={() => handleToggleSim(p.id)}
                      className="rounded border-slate-300 text-aiesec-blue focus:ring-aiesec-blue"
                    />
                    <span className="text-[11px]">SIM Card Provided</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={p.madExchangeAssisted}
                      onChange={() => handleToggleMad(p.id)}
                      className="rounded border-slate-300 text-aiesec-blue focus:ring-aiesec-blue"
                    />
                    <span className="text-[11px]">MAD Exchange Done</span>
                  </label>
                </div>

                {/* Handover & Status Controls */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="text-[10px] text-slate-400">
                    Housing: <strong className="text-slate-700 dark:text-slate-300">{p.housingAddress}</strong>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {p.status === 'PICKUP_SCHEDULED' && (
                      <button
                        onClick={() => handleUpdateStatus(p.id, 'EP_COLLECTED')}
                        className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-semibold shadow-sm"
                      >
                        Mark Collected
                      </button>
                    )}
                    {p.status === 'EP_COLLECTED' && (
                      <button
                        onClick={() => handleUpdateStatus(p.id, 'CHECKED_IN')}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold shadow-sm"
                      >
                        Acknowledge Handover
                      </button>
                    )}
                    {p.status === 'CHECKED_IN' && (
                      <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Handed to {p.cxpOfficerName}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
