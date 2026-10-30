'use client';

import React, { useState } from 'react';
import {
  X,
  User,
  ShieldCheck,
  Calendar,
  Globe2,
  Plane,
  Home,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import type { EPRecord } from '@/lib/ep/ep-data';
import {
  SEARCHABLE_COUNTRIES_CATALOG,
  resolveMoroccanVisaRegime,
} from '@/lib/ir/moroccan-visa-matrix';
import { INITIAL_IR_PARTNERS } from '@/lib/irm/irm-data';
import { CommunicationCopilotMenu } from './communication-copilot-menu';

interface EpEditDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  ep: EPRecord | null;
  onSaveEp: (updatedEp: EPRecord) => void;
}

export function EpEditDrawer({ isOpen, onClose, ep, onSaveEp }: EpEditDrawerProps) {
  const [fullName, setFullName] = useState(ep?.full_name || '');
  const [expaPersonId, setExpaPersonId] = useState(ep?.expaPersonId || 892100);
  const [dob, setDob] = useState(ep?.dob || '2001-05-15');
  const [email, setEmail] = useState(ep?.email || '');
  const [phone, setPhone] = useState(ep?.phone || '');
  const [nationality, setNationality] = useState(ep?.nationality || 'Colombia');
  const [residenceCountry, setResidenceCountry] = useState(ep?.residenceCountry || 'CO');
  const [hasSchengenPermit, setHasSchengenPermit] = useState(ep?.hasSchengenOrUkOrUsPermit || false);
  const [passportNumber, setPassportNumber] = useState(ep?.passportNumber || 'CO-9921844');
  const [passportExpiryDate, setPassportExpiryDate] = useState(ep?.passportExpiryDate || '2028-10-15');
  const [sendingIrId, setSendingIrId] = useState(ep?.sendingIrId || INITIAL_IR_PARTNERS[0]?.id);
  const [sePocName, setSePocName] = useState(ep?.sePocName || 'Camila Rodriguez');
  const [sePocPhone, setSePocPhone] = useState(ep?.sePocPhone || '+57 310 882 1904');
  const [arrivalDate, setArrivalDate] = useState(ep?.arrivalDate || '2026-10-31');
  const [arrivalTime, setArrivalTime] = useState(ep?.arrivalTime || '14:20');
  const [arrivalPort, setArrivalPort] = useState<EPRecord['arrivalPort']>(ep?.arrivalPort || 'CMN');
  const [flightNumber, setFlightNumber] = useState(ep?.flightNumber || 'AT 781');
  const [bedId, setBedId] = useState(ep?.bedId || 'bed_agdal_03');
  const [pickupBuddyUserId, setPickupBuddyUserId] = useState(ep?.pickupBuddyUserId || 'mem_004');
  const [epManagerUserId, setEpManagerUserId] = useState(ep?.epManagerUserId || 'usr_cxp_01');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !ep) return null;

  // Real-time Moroccan Visa Regime Resolution
  const visaResolution = resolveMoroccanVisaRegime({
    nationalityCountry: nationality,
    residenceCountry,
    hasSchengenOrUkOrUsPermit: hasSchengenPermit,
  });

  // Calculate age
  const calculateAge = (birthDateString: string) => {
    const today = new Date();
    const birthDate = new Date(birthDateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate Age (18..30)
    const age = calculateAge(dob);
    if (age < 18 || age > 30) {
      setError(`Age Statutory Violation: EP must be between 18 and 30 years old per AEPP. Current calculated age: ${age} years.`);
      return;
    }

    // Validate Passport Expiry (>= slotEnd + 180 days)
    const slotEndMs = new Date(ep.end_date).getTime();
    const passportExpMs = new Date(passportExpiryDate).getTime();
    const minPassportValidityMs = slotEndMs + 180 * 24 * 60 * 60 * 1000;

    if (passportExpMs < minPassportValidityMs) {
      setError('Passport Expiry Violation (TEST-029): Passport must be valid for at least 180 days beyond the scheduled exchange end date.');
      return;
    }

    const updated: EPRecord = {
      ...ep,
      full_name: fullName,
      fullName,
      expaPersonId,
      dob,
      email,
      phone,
      whatsappPhone: phone,
      nationality,
      residenceCountry,
      hasSchengenOrUkOrUsPermit: hasSchengenPermit,
      passportNumber,
      passportExpiryDate,
      sendingIrId,
      sePocName,
      sePocPhone,
      arrivalDate,
      arrivalTime,
      arrivalPort,
      flightNumber,
      bedId,
      pickupBuddyUserId,
      epManagerUserId,
      updated_at: new Date().toISOString(),
    };

    onSaveEp(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 h-full overflow-y-auto p-6 space-y-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Exchange Participant Dossier Console
            </h3>
            <p className="text-xs text-slate-500">
              {ep.full_name} • {ep.expa_ep_id} • Product: <strong className="uppercase">{ep.product}</strong>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <CommunicationCopilotMenu ep={ep} variant="compact" />
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200 flex items-center gap-2 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* SECTION 1: IDENTITY & CONTACT */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-800/40">
            <span className="font-bold text-slate-900 dark:text-white block text-xs">
              1. Identity, Nationality & Age
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Full Legal Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  EXPA Person ID (Numeric) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  value={expaPersonId}
                  onChange={(e) => setExpaPersonId(Number(e.target.value))}
                  className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Date of Birth <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono"
                />
                <span className="text-[10px] text-slate-400">
                  Age: {calculateAge(dob)} years (Req: 18-30).
                </span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Direct Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  WhatsApp Phone <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: SEARCHABLE NATIONALITY & VISA REGIME */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-800/40">
            <span className="font-bold text-slate-900 dark:text-white block text-xs">
              2. Nationality & Moroccan Statutory Visa Regime
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Passport Nationality <span className="text-rose-500">*</span>
                </label>
                <select
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {SEARCHABLE_COUNTRIES_CATALOG.map((c) => (
                    <option key={c.code} value={c.name}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Country of Residence
                </label>
                <select
                  value={residenceCountry}
                  onChange={(e) => setResidenceCountry(e.target.value)}
                  className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {SEARCHABLE_COUNTRIES_CATALOG.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="schengenPermit"
                checked={hasSchengenPermit}
                onChange={(e) => setHasSchengenPermit(e.target.checked)}
                className="rounded border-slate-300 text-aiesec-blue"
              />
              <label htmlFor="schengenPermit" className="text-slate-700 dark:text-slate-300 cursor-pointer">
                Holds valid Schengen, US, UK, or Canada Residence Permit (Enables AEVM eVisa)
              </label>
            </div>

            {/* Resolved Visa Pill */}
            <div className="rounded-lg border border-blue-200 bg-blue-50/70 p-3 dark:border-blue-900 dark:bg-blue-950/30 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-aiesec-blue" />
                  <span>Resolved Regime: {visaResolution.regime.replace(/_/g, ' ')}</span>
                </span>
                <span className="rounded bg-blue-200/60 px-2 py-0.5 text-[10px] font-bold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Lead Time: {visaResolution.leadTimeDaysRequired} Days Minimum
                </span>
              </div>
              <p className="text-[11px] text-blue-800 dark:text-blue-300">
                {visaResolution.officialInstructions}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Passport Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={passportNumber}
                  onChange={(e) => setPassportNumber(e.target.value)}
                  className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Passport Expiry Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={passportExpiryDate}
                  onChange={(e) => setPassportExpiryDate(e.target.value)}
                  className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono"
                />
                <span className="text-[10px] text-slate-400">
                  Must be $\ge$ {ep.end_date} + 180 days.
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 3: SENDING ENTITY & FLIGHT LOGISTICS */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-800/40">
            <span className="font-bold text-slate-900 dark:text-white block text-xs">
              3. Sending Entity & Inbound Arrival Protocol
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Sending IR Partner
                </label>
                <select
                  value={sendingIrId}
                  onChange={(e) => setSendingIrId(e.target.value)}
                  className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {INITIAL_IR_PARTNERS.map((ir) => (
                    <option key={ir.id} value={ir.id}>
                      {ir.lc_name} ({ir.country})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  SE Contact Person
                </label>
                <input
                  type="text"
                  value={sePocName}
                  onChange={(e) => setSePocName(e.target.value)}
                  className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  SE Contact Phone
                </label>
                <input
                  type="tel"
                  value={sePocPhone}
                  onChange={(e) => setSePocPhone(e.target.value)}
                  className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Arrival Date
                </label>
                <input
                  type="date"
                  value={arrivalDate}
                  onChange={(e) => setArrivalDate(e.target.value)}
                  className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Arrival Time
                </label>
                <input
                  type="time"
                  value={arrivalTime}
                  onChange={(e) => setArrivalTime(e.target.value)}
                  className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Arrival Port
                </label>
                <select
                  value={arrivalPort}
                  onChange={(e) => setArrivalPort(e.target.value as any)}
                  className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white font-medium"
                >
                  <option value="CMN">Casablanca (CMN Airport)</option>
                  <option value="RBA">Rabat-Salé (RBA Airport)</option>
                  <option value="RABAT_AGDAL">Rabat Agdal Train Station</option>
                  <option value="RABAT_VILLE">Rabat Ville Train Station</option>
                  <option value="TANGIER">Tangier Port / Station</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Flight / Train #
                </label>
                <input
                  type="text"
                  placeholder="e.g. AT 781"
                  value={flightNumber}
                  onChange={(e) => setFlightNumber(e.target.value)}
                  className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono uppercase"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: BED ALLOCATION & TEAM OWNERSHIP */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-800/40">
            <span className="font-bold text-slate-900 dark:text-white block text-xs">
              4. Accommodation Bed Allocation & CXP Ownership
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Allocated Bed ID
                </label>
                <input
                  type="text"
                  value={bedId}
                  onChange={(e) => setBedId(e.target.value)}
                  placeholder="e.g. bed_agdal_03"
                  className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Assigned Pickup Buddy
                </label>
                <input
                  type="text"
                  value={pickupBuddyUserId}
                  onChange={(e) => setPickupBuddyUserId(e.target.value)}
                  className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  EP Manager (CXP Lead)
                </label>
                <input
                  type="text"
                  value={epManagerUserId}
                  onChange={(e) => setEpManagerUserId(e.target.value)}
                  className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-aiesec-blue px-5 py-2 font-bold text-white shadow hover:bg-blue-600 transition"
            >
              Save EP Dossier
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
