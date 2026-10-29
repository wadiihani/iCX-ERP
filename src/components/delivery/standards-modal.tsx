'use client';

import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  Plus,
  MessageSquare,
  Smile,
  Frown,
  Meh,
  FileCheck,
} from 'lucide-react';
import type { EPRecord, EpStandardDeliveryState, EpTouchpointEntry } from '@/lib/ep/ep-data';

interface StandardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  ep: EPRecord | null;
  onSaveStandards: (
    epId: string,
    standards: Record<string, EpStandardDeliveryState>,
    touchpoints: EpTouchpointEntry[]
  ) => void;
}

export const STANDARDS_WITH_10_SPLIT = [
  { id: '1', number: '1', name: 'Personal Goal Setting', responsible: 'SENDING_ENTITY', mandatory: true, stage: 'Middle' },
  { id: '2', number: '2', name: 'Outgoing Preparation', responsible: 'SENDING_ENTITY', mandatory: true, stage: 'Middle' },
  { id: '3', number: '3', name: 'Insurance', responsible: 'SENDING_ENTITY', mandatory: false, stage: 'Middle' },
  { id: '4', number: '4', name: 'Expectation Setting', responsible: 'HOST_ENTITY', mandatory: true, stage: 'Middle' },
  { id: '5', number: '5', name: 'Visa & Work Validity', responsible: 'HOST_ENTITY', mandatory: true, stage: 'Middle' },
  { id: '6', number: '6', name: 'Arrival Pickup', responsible: 'HOST_ENTITY', mandatory: true, stage: 'Middle' },
  { id: '7', number: '7', name: 'Accommodation', responsible: 'HOST_ENTITY', mandatory: true, stage: 'Middle' },
  { id: '8', number: '8', name: 'Incoming Preparation Seminar (IPS)', responsible: 'HOST_ENTITY', mandatory: true, stage: 'Middle' },
  { id: '9', number: '9', name: 'First Day of Work Accompaniment', responsible: 'HOST_ENTITY', mandatory: true, stage: 'Middle' },
  { id: '10a', number: '10a', name: 'Initial Alignment with OP (Week 1)', responsible: 'HOST_ENTITY', mandatory: true, stage: 'Middle Survey' },
  { id: '10b', number: '10b', name: 'Closing Alignment with OP (Final Week)', responsible: 'HOST_ENTITY', mandatory: true, stage: 'Final Survey' },
  { id: '11', number: '11', name: 'Job Description Compliance', responsible: 'HOST_ENTITY', mandatory: true, stage: 'Final' },
  { id: '12', number: '12', name: 'Working Hours Compliance', responsible: 'HOST_ENTITY', mandatory: false, stage: 'Final' },
  { id: '13', number: '13', name: 'Duration Compliance', responsible: 'HOST_ENTITY', mandatory: true, stage: 'Final' },
  { id: '14', number: '14', name: 'Opportunity Provider Minimum Benefits', responsible: 'HOST_ENTITY', mandatory: true, stage: 'Final' },
  { id: '15', number: '15', name: 'Departure Support', responsible: 'HOST_ENTITY', mandatory: true, stage: 'Final' },
  { id: '16', number: '16', name: 'Debrief with Host LC', responsible: 'HOST_ENTITY', mandatory: true, stage: 'Final' },
  { id: '17', number: '17', name: 'Regular Touchpoints (Bi-weekly/Monthly)', responsible: 'HOST_ENTITY', mandatory: true, stage: 'Throughout' },
  { id: '18', number: '18', name: 'Re-integration Seminar (RIS)', responsible: 'SENDING_ENTITY', mandatory: true, stage: 'Post-Exchange' },
];

export function StandardsModal({ isOpen, onClose, ep, onSaveStandards }: StandardsModalProps) {
  const [activeTab, setActiveTab] = useState<'standards' | 'touchpoints'>('standards');
  const [standardsState, setStandardsState] = useState<Record<string, EpStandardDeliveryState>>(
    ep?.standardsDelivery || {}
  );
  const [touchpoints, setTouchpoints] = useState<EpTouchpointEntry[]>(ep?.touchpoints || []);

  // Form for new touchpoint
  const [isAddingTouchpoint, setIsAddingTouchpoint] = useState(false);
  const [tpDate, setTpDate] = useState(new Date().toISOString().slice(0, 10));
  const [tpMood, setTpMood] = useState<number>(5);
  const [tpHoursOk, setTpHoursOk] = useState(true);
  const [tpHousingOk, setTpHousingOk] = useState(true);
  const [tpMoo, setTpMoo] = useState('');
  const [tpNotes, setTpNotes] = useState('');

  if (!isOpen || !ep) return null;

  // Toggle delivery
  const handleToggleDelivered = (stdId: string) => {
    const cur = standardsState[stdId] || { internalDelivered: false, expaSurveyAnswer: 'PENDING' };
    const nextDelivered = !cur.internalDelivered;
    setStandardsState({
      ...standardsState,
      [stdId]: {
        ...cur,
        internalDelivered: nextDelivered,
        deliveryDate: nextDelivered ? new Date().toISOString().slice(0, 10) : undefined,
      },
    });
  };

  // Change evidence URL
  const handleEvidenceChange = (stdId: string, url: string) => {
    const cur = standardsState[stdId] || { internalDelivered: false, expaSurveyAnswer: 'PENDING' };
    setStandardsState({
      ...standardsState,
      [stdId]: {
        ...cur,
        evidenceUrl: url,
        internalDelivered: Boolean(url.trim()),
      },
    });
  };

  // Change EXPA survey response
  const handleSurveyChange = (stdId: string, val: 'PENDING' | 'YES' | 'NO') => {
    const cur = standardsState[stdId] || { internalDelivered: false, expaSurveyAnswer: 'PENDING' };
    setStandardsState({
      ...standardsState,
      [stdId]: {
        ...cur,
        expaSurveyAnswer: val,
      },
    });
  };

  // Add Touchpoint
  const handleAddTouchpoint = (e: React.FormEvent) => {
    e.preventDefault();
    const newTp: EpTouchpointEntry = {
      id: `tp-${Date.now()}`,
      date: tpDate,
      moodScore: tpMood,
      hoursOk: tpHoursOk,
      housingOk: tpHousingOk,
      mooMetrics: tpMoo || 'Bi-weekly routine check-in completed.',
      notes: tpNotes,
      loggedBy: ep.host_manager_name || 'CXP Lead',
    };
    setTouchpoints([newTp, ...touchpoints]);
    setIsAddingTouchpoint(false);
    setTpMoo('');
    setTpNotes('');
  };

  const handleSaveAll = () => {
    onSaveStandards(ep.id, standardsState, touchpoints);
    onClose();
  };

  // Compute stats
  const totalStandards = STANDARDS_WITH_10_SPLIT.length;
  const deliveredCount = Object.values(standardsState).filter((s) => s.internalDelivered).length;
  const discrepancyCount = STANDARDS_WITH_10_SPLIT.filter((std) => {
    const s = standardsState[std.id];
    return s && s.internalDelivered && s.expaSurveyAnswer === 'NO';
  }).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="max-w-4xl w-full my-6 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-aiesec-blue" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                18 Exchange Standards Console & Survey Discrepancy Auditor
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              EP: <strong>{ep.full_name}</strong> ({ep.expa_ep_id}) • Host: {ep.partner_organization_name} • Delivered: <strong>{deliveredCount}/{totalStandards}</strong>
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Top Badges / Discrepancy Alert */}
        {discrepancyCount > 0 && (
          <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3 text-xs text-rose-800 flex items-center gap-2.5 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
            <div>
              <span className="font-bold">
                Critical Survey Discrepancy Detected ({discrepancyCount} Standard{discrepancyCount !== 1 ? 's' : ''}):
              </span>
              <span className="block text-[11px] mt-0.5">
                Internal team marked the standard as Delivered, but the EP answered "No" on the official EXPA survey. Immediate follow-up with EP is required before completion.
              </span>
            </div>
          </div>
        )}

        {/* Tab switch */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('standards')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'standards'
                  ? 'bg-aiesec-blue text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              All 18 Standards (with #10a & #10b OP Split)
            </button>
            <button
              onClick={() => setActiveTab('touchpoints')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'touchpoints'
                  ? 'bg-aiesec-blue text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Standard #17: Regular Touchpoints Log ({touchpoints.length})
            </button>
          </div>
        </div>

        {/* TAB 1: STANDARDS TABLE */}
        {activeTab === 'standards' && (
          <div className="max-h-[500px] overflow-y-auto space-y-2 pr-1 text-xs">
            {STANDARDS_WITH_10_SPLIT.map((std) => {
              const cur = standardsState[std.id] || { internalDelivered: false, expaSurveyAnswer: 'PENDING' };
              const isDiscrepant = cur.internalDelivered && cur.expaSurveyAnswer === 'NO';

              return (
                <div
                  key={std.id}
                  className={`rounded-lg border p-3 transition ${
                    isDiscrepant
                      ? 'border-rose-300 bg-rose-50/40 dark:border-rose-900 dark:bg-rose-950/20'
                      : cur.internalDelivered
                      ? 'border-emerald-200 bg-emerald-50/30 dark:border-emerald-950 dark:bg-emerald-950/10'
                      : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleToggleDelivered(std.id)}
                        className={`h-5 w-5 rounded mt-0.5 flex items-center justify-center font-bold text-xs transition ${
                          cur.internalDelivered
                            ? 'bg-emerald-600 text-white'
                            : 'border border-slate-300 bg-slate-50 text-transparent hover:border-emerald-400'
                        }`}
                      >
                        ✓
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">
                            #{std.number} {std.name}
                          </span>
                          {std.mandatory && (
                            <span className="rounded bg-rose-100 px-1.5 py-0.2 text-[9px] font-bold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                              Mandatory
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 font-mono">
                            {std.responsible === 'HOST_ENTITY' ? 'Host LC' : 'Sending LC'} • {std.stage}
                          </span>
                        </div>

                        {/* Drive URL input */}
                        <div className="mt-1 flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Evidence URL (e.g. Google Drive link)..."
                            value={cur.evidenceUrl || ''}
                            onChange={(e) => handleEvidenceChange(std.id, e.target.value)}
                            className="rounded border border-slate-200 bg-white px-2 py-0.5 text-[11px] text-slate-900 w-64 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                          {cur.evidenceUrl && (
                            <a
                              href={cur.evidenceUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-aiesec-blue hover:text-blue-600"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Dual EXPA Survey answer selector */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-medium">EXPA Survey:</span>
                      <select
                        value={cur.expaSurveyAnswer || 'PENDING'}
                        onChange={(e) => handleSurveyChange(std.id, e.target.value as any)}
                        className={`rounded border px-2 py-1 text-[11px] font-semibold ${
                          cur.expaSurveyAnswer === 'YES'
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : cur.expaSurveyAnswer === 'NO'
                            ? 'border-rose-300 bg-rose-50 text-rose-800 font-bold dark:bg-rose-950/40 dark:text-rose-300'
                            : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        <option value="PENDING">Pending Response</option>
                        <option value="YES">Yes (Fulfilled)</option>
                        <option value="NO">No (Unfulfilled)</option>
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: STANDARD #17 TOUCHPOINTS LOG */}
        {activeTab === 'touchpoints' && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">
                  Standard #17 Checkpoint Register
                </h4>
                <p className="text-[11px] text-slate-500">
                  Bi-weekly (iGV) or monthly (iGTa/e) wellbeing, hours compliance, and housing checks.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddingTouchpoint(!isAddingTouchpoint)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-aiesec-blue px-3 py-1.5 font-semibold text-white shadow hover:bg-blue-600"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>+ Log Touchpoint</span>
              </button>
            </div>

            {/* Add Touchpoint Form */}
            {isAddingTouchpoint && (
              <form
                onSubmit={handleAddTouchpoint}
                className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 space-y-3 dark:border-blue-900 dark:bg-blue-950/20"
              >
                <span className="font-bold text-blue-900 dark:text-blue-300 block">
                  Record Checkpoint Meeting
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={tpDate}
                      onChange={(e) => setTpDate(e.target.value)}
                      className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      EP Mood (1-5)
                    </label>
                    <select
                      value={tpMood}
                      onChange={(e) => setTpMood(Number(e.target.value))}
                      className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-medium"
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ 5 - Highly Thriving</option>
                      <option value={4}>⭐⭐⭐⭐ 4 - Positive & Engaged</option>
                      <option value={3}>⭐⭐⭐ 3 - Neutral / Settling In</option>
                      <option value={2}>⭐⭐ 2 - Stressed / Friction</option>
                      <option value={1}>⭐ 1 - Critical Distress</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 pt-5">
                    <input
                      type="checkbox"
                      id="hoursOk"
                      checked={tpHoursOk}
                      onChange={(e) => setTpHoursOk(e.target.checked)}
                      className="rounded text-aiesec-blue"
                    />
                    <label htmlFor="hoursOk" className="font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                      Hours Compliant
                    </label>
                  </div>

                  <div className="flex items-center gap-2 pt-5">
                    <input
                      type="checkbox"
                      id="housingOk"
                      checked={tpHousingOk}
                      onChange={(e) => setTpHousingOk(e.target.checked)}
                      className="rounded text-aiesec-blue"
                    />
                    <label htmlFor="housingOk" className="font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                      Housing OK
                    </label>
                  </div>
                </div>

                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Measure of Outcome (MoO) Key Activities Delivered
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Conducted 4 English speaking clubs; 30 students attended."
                    value={tpMoo}
                    onChange={(e) => setTpMoo(e.target.value)}
                    className="w-full rounded border border-slate-300 bg-white px-2.5 py-1 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Meeting Discussion Notes & Next Actions
                  </label>
                  <textarea
                    rows={2}
                    value={tpNotes}
                    onChange={(e) => setTpNotes(e.target.value)}
                    placeholder="Observations, cultural adaptation, supervisor feedback..."
                    className="w-full rounded border border-slate-300 bg-white px-2.5 py-1 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingTouchpoint(false)}
                    className="rounded border border-slate-300 px-3 py-1 text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded bg-aiesec-blue px-3 py-1 font-semibold text-white hover:bg-blue-600"
                  >
                    Save Touchpoint Log
                  </button>
                </div>
              </form>
            )}

            {/* Touchpoints History Table */}
            {touchpoints.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400 dark:border-slate-800">
                No checkpoints logged yet. Click "+ Log Touchpoint" to document bi-weekly meetings.
              </div>
            ) : (
              <div className="space-y-2.5">
                {touchpoints.map((tp) => (
                  <div
                    key={tp.id}
                    className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                      <div className="flex items-center gap-2 font-mono">
                        <span className="font-bold text-slate-900 dark:text-white">{tp.date}</span>
                        <span>•</span>
                        <span className="text-amber-600 font-bold">Mood: {tp.moodScore}/5</span>
                        <span>•</span>
                        <span className={tp.hoursOk ? 'text-emerald-600' : 'text-rose-600'}>
                          Hours: {tp.hoursOk ? 'OK' : 'Overtime/Issue'}
                        </span>
                        <span>•</span>
                        <span className={tp.housingOk ? 'text-emerald-600' : 'text-rose-600'}>
                          Housing: {tp.housingOk ? 'OK' : 'Defect'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">Logged by: {tp.loggedBy}</span>
                    </div>

                    <div className="pt-2 text-[11px] text-slate-600 dark:text-slate-300">
                      <div><strong>Deliverable:</strong> {tp.mooMetrics}</div>
                      {tp.notes && <div className="text-slate-500 mt-0.5"><strong>Notes:</strong> {tp.notes}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs text-slate-400 font-mono">
            Standard #17 fulfilled when $\ge$ 2 checkpoints logged per month.
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              className="rounded-lg bg-aiesec-blue px-5 py-2 text-xs font-bold text-white shadow hover:bg-blue-600 transition"
            >
              Save Standards & Checkpoints
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
