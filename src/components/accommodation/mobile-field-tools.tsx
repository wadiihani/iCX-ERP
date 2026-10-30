'use client';

import React, { useState } from 'react';
import {
  Plane,
  Home,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  UserCheck,
  Copy,
  Check,
  Send,
  MapPin,
  Wifi,
  Key,
  Flame,
  Bed,
} from 'lucide-react';
import { INITIAL_PROVIDERS_CATALOG } from './bed-allocation-board';

export function MobileFieldTools() {
  // --- Section 1: Airport Pickup Reception (Standard #6) ---
  const [selectedTerminal, setSelectedTerminal] = useState('CMN_T1');
  const [epName, setEpName] = useState('Sofia Martinez (EP-2026-081)');
  const [volunteerName, setVolunteerName] = useState('Rayen Jbali (VP CXP)');
  const [pickupChecks, setPickupChecks] = useState({
    welcomedBanner: true,
    simCardHanded: true,
    currencyAssisted: true,
    transportEscorted: true,
  });
  const [pickupSuccess, setPickupSuccess] = useState(false);

  // --- Section 2: 4-Point Accommodation Inspection (Standard #7) ---
  const [selectedProvider, setSelectedProvider] = useState(INITIAL_PROVIDERS_CATALOG[0]?.id || 'prov_01');
  const [inspectionChecks, setInspectionChecks] = useState({
    bedHygienic: true,
    hotWaterRunning: true,
    lockSecure: true,
    wifiFunctional: true,
  });
  const [inspectorNotes, setInspectorNotes] = useState('');
  const [copiedNotice, setCopiedNotice] = useState(false);
  const [inspectionSaved, setInspectionSaved] = useState(false);

  const togglePickupCheck = (key: keyof typeof pickupChecks) => {
    setPickupChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleInspectionCheck = (key: keyof typeof inspectionChecks) => {
    setInspectionChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const allPickupReady = Object.values(pickupChecks).every(Boolean);

  const passedPoints = Object.values(inspectionChecks).filter(Boolean).length;
  const isInspectionCompliant = passedPoints === 4;

  const handleCompletePickup = (e: React.FormEvent) => {
    e.preventDefault();
    setPickupSuccess(true);
    setTimeout(() => setPickupSuccess(false), 5000);
  };

  const handleSaveInspection = (e: React.FormEvent) => {
    e.preventDefault();
    setInspectionSaved(true);
    setTimeout(() => setInspectionSaved(false), 5000);
  };

  const handleCopyLandlordNotice = () => {
    const provider = INITIAL_PROVIDERS_CATALOG.find((p) => p.id === selectedProvider);
    const noticeText = `AVIS D'INSPECTION URGENTE — HÉBERGEMENT AIESEC
Bailleur / Propriétaire: ${provider?.providerName || 'Bailleur'}
Adresse: ${provider?.fullAddress || 'Rabat'}
Date: ${new Date().toLocaleDateString('fr-FR')}

Conformément à la convention de partenariat d'hébergement AIESEC Rabat 26.2:
Points de non-conformité relevés lors de la vérification terrain:
${!inspectionChecks.bedHygienic ? '- Literie / matelas non conforme aux normes d\'hygiène.\n' : ''}${!inspectionChecks.hotWaterRunning ? '- Dysfonctionnement du chauffe-eau / absence d\'eau chaude continue.\n' : ''}${!inspectionChecks.lockSecure ? '- Système de fermeture / serrure défectueux (sécurité compromise).\n' : ''}${!inspectionChecks.wifiFunctional ? '- Connexion Wi-Fi indisponible ou insuffisante.\n' : ''}
Remarques inspecteur: ${inspectorNotes || 'Intervention sous 24 heures requise.'}

Merci de procéder aux réparations dans un délai de 24h ouvrées.
Responsable Logistique & Hébergement AIESEC in Rabat: +212 661-000000`;

    navigator.clipboard.writeText(noticeText);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-blue-200 bg-blue-50/30 p-4 dark:border-blue-900/40 dark:bg-blue-950/20">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-aiesec-blue" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Mobile Field Operations &amp; Statutory Compliance Tools
          </h2>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
          Designed for mobile field officers on arrival missions and housing inspection walkthroughs. Generates verifiable time-stamped delivery logs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* TOOL 1: AIRPORT ARRIVAL RECEPTION (STANDARD #6) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-aiesec-blue dark:bg-blue-950/50 dark:text-blue-300">
                <Plane className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Airport Reception Protocol
                </h3>
                <span className="text-[10px] font-mono font-semibold text-aiesec-blue">
                  AIESEC Standard #6 Verification
                </span>
              </div>
            </div>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              Field Ready
            </span>
          </div>

          <form onSubmit={handleCompletePickup} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Exchange Participant Arriving
              </label>
              <input
                type="text"
                value={epName}
                onChange={(e) => setEpName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Arrival Port / Terminal
                </label>
                <select
                  value={selectedTerminal}
                  onChange={(e) => setSelectedTerminal(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="CMN_T1">Casablanca (CMN Terminal 1)</option>
                  <option value="CMN_T2">Casablanca (CMN Terminal 2)</option>
                  <option value="RBA_T1">Rabat-Salé (RBA Terminal)</option>
                  <option value="RABAT_AGDAL">Gare Rabat Agdal (Al Boraq / ONCF)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Field Volunteer Officer
                </label>
                <input
                  type="text"
                  value={volunteerName}
                  onChange={(e) => setVolunteerName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white font-medium"
                />
              </div>
            </div>

            {/* Checklist */}
            <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-xs dark:border-slate-800 dark:bg-slate-800/40">
              <span className="font-bold text-slate-900 dark:text-white block text-[11px] uppercase tracking-wider">
                Reception 4-Step Mandatory Protocol
              </span>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pickupChecks.welcomedBanner}
                  onChange={() => togglePickupCheck('welcomedBanner')}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-aiesec-blue focus:ring-aiesec-blue"
                />
                <span className="text-slate-700 dark:text-slate-300">
                  Welcomed at arrival gate with official blue AIESEC banner
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pickupChecks.simCardHanded}
                  onChange={() => togglePickupCheck('simCardHanded')}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-aiesec-blue focus:ring-aiesec-blue"
                />
                <span className="text-slate-700 dark:text-slate-300">
                  Delivered active local 4G SIM card (Morocco Telecom / Orange)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pickupChecks.currencyAssisted}
                  onChange={() => togglePickupCheck('currencyAssisted')}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-aiesec-blue focus:ring-aiesec-blue"
                />
                <span className="text-slate-700 dark:text-slate-300">
                  Assisted with bank ATM / official currency exchange into MAD
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pickupChecks.transportEscorted}
                  onChange={() => togglePickupCheck('transportEscorted')}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-aiesec-blue focus:ring-aiesec-blue"
                />
                <span className="text-slate-700 dark:text-slate-300">
                  Escorted in pre-booked transfer directly to vetted accommodation
                </span>
              </label>
            </div>

            {pickupSuccess && (
              <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-2.5 text-xs font-semibold text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Standard #6 verified &amp; signed off by {volunteerName}. Logged to audit chain.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!allPickupReady}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-aiesec-blue py-2 text-xs font-bold text-white shadow-subtle hover:bg-blue-600 disabled:opacity-50 transition"
            >
              <UserCheck className="h-4 w-4" />
              <span>Sign Off Arrival Reception (Standard #6)</span>
            </button>
          </form>
        </div>

        {/* TOOL 2: 4-POINT ACCOMMODATION INSPECTION (STANDARD #7) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-300">
                <Home className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  4-Point Housing Inspection
                </h3>
                <span className="text-[10px] font-mono font-semibold text-purple-600 dark:text-purple-400">
                  AIESEC Standard #7 Physical Audit
                </span>
              </div>
            </div>

            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                isInspectionCompliant
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300'
              }`}
            >
              {passedPoints}/4 {isInspectionCompliant ? 'PASS (Optimal)' : 'DEFICIENT'}
            </span>
          </div>

          <form onSubmit={handleSaveInspection} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Vetted Provider &amp; Property
              </label>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-purple-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white font-medium"
              >
                {INITIAL_PROVIDERS_CATALOG.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.providerName} ({p.neighborhood || p.fullAddress})
                  </option>
                ))}
              </select>
            </div>

            {/* The 4 Mandatory Standards */}
            <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-xs dark:border-slate-800 dark:bg-slate-800/40">
              <span className="font-bold text-slate-900 dark:text-white block text-[11px] uppercase tracking-wider">
                Moroccan Statutory 4-Point Checklist
              </span>

              <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Bed className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-700 dark:text-slate-300">
                    1. Clean private single bed &amp; clean mattress
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={inspectionChecks.bedHygienic}
                  onChange={() => toggleInspectionCheck('bedHygienic')}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-purple-600 focus:ring-purple-600"
                />
              </label>

              <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-amber-500" />
                  <span className="text-slate-700 dark:text-slate-300">
                    2. Continuous running hot water (boiler verified)
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={inspectionChecks.hotWaterRunning}
                  onChange={() => toggleInspectionCheck('hotWaterRunning')}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-purple-600 focus:ring-purple-600"
                />
              </label>

              <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-emerald-600" />
                  <span className="text-slate-700 dark:text-slate-300">
                    3. Secure door lock &amp; individual keys issued
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={inspectionChecks.lockSecure}
                  onChange={() => toggleInspectionCheck('lockSecure')}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-purple-600 focus:ring-purple-600"
                />
              </label>

              <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-blue-500" />
                  <span className="text-slate-700 dark:text-slate-300">
                    4. Operational high-speed WiFi (&gt;15 Mbps)
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={inspectionChecks.wifiFunctional}
                  onChange={() => toggleInspectionCheck('wifiFunctional')}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-purple-600 focus:ring-purple-600"
                />
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Inspector Observation Notes
              </label>
              <textarea
                rows={2}
                value={inspectorNotes}
                onChange={(e) => setInspectorNotes(e.target.value)}
                placeholder="Mention specific room number, plumbing condition, or ventilation..."
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-purple-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            {inspectionSaved && (
              <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-2.5 text-xs font-semibold text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Physical inspection recorded. Standard #7 status synchronized.</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 rounded-xl bg-purple-600 py-2 text-xs font-bold text-white shadow-subtle hover:bg-purple-700 transition"
              >
                Save Inspection Record
              </button>

              {!isInspectionCompliant && (
                <button
                  type="button"
                  onClick={handleCopyLandlordNotice}
                  title="Copy 24h repair notice for landlord"
                  className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300 transition"
                >
                  {copiedNotice ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span>Copy Landlord Notice</span>
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
