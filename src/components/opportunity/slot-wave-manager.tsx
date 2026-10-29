'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  Plus,
  AlertCircle,
  TrendingUp,
  Layers,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import type { OpportunitySlotWave } from '@/lib/opportunity/opportunity-portfolio-data';
import type { ExtendedOpportunity } from '@/lib/opportunity/opportunity-data';

interface SlotWaveManagerProps {
  opportunity: ExtendedOpportunity;
  onAddWave: (opportunityId: string, newWave: OpportunitySlotWave) => void;
}

export function SlotWaveManager({ opportunity, onAddWave }: SlotWaveManagerProps) {
  const [isAddingWave, setIsAddingWave] = useState(false);
  const [waveLabel, setWaveLabel] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [capacity, setCapacity] = useState<number>(2);
  const [error, setError] = useState<string | null>(null);

  const totalWavesCapacity = (opportunity.slotWaves || []).reduce((acc, w) => acc + w.capacity, 0);
  const totalApproved = (opportunity.slotWaves || []).reduce((acc, w) => acc + w.approvedCount, 0);
  const totalApplied = (opportunity.slotWaves || []).reduce((acc, w) => acc + w.appliedCount, 0);
  const totalRealized = (opportunity.slotWaves || []).reduce((acc, w) => acc + w.realizedCount, 0);

  const handleCreateWave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!waveLabel.trim()) {
      setError('Please provide a descriptive wave label (e.g. Wave 3 — Summer 27).');
      return;
    }
    if (!startDate || !endDate) {
      setError('Start and end dates are required.');
      return;
    }

    const startMs = new Date(startDate).getTime();
    const endMs = new Date(endDate).getTime();
    const nowMs = Date.now();

    if (endMs <= startMs) {
      setError('Wave end date must be strictly after the start date.');
      return;
    }

    // Horizon Check (THR-048 / 365 days)
    const maxAdvanceMs = 365 * 24 * 60 * 60 * 1000;
    if (startMs - nowMs > maxAdvanceMs) {
      setError('Horizon Breach: Slot wave start date cannot exceed 365 days into the future.');
      return;
    }

    if (capacity < 1) {
      setError('Capacity must be at least 1 opening.');
      return;
    }

    const newWave: OpportunitySlotWave = {
      id: `wave-${Date.now()}`,
      opportunityId: opportunity.id,
      waveLabel,
      startDate,
      endDate,
      capacity,
      appliedCount: 0,
      acceptedCount: 0,
      approvedCount: 0,
      realizedCount: 0,
      completedCount: 0,
    };

    onAddWave(opportunity.id, newWave);
    setIsAddingWave(false);
    setWaveLabel('');
    setStartDate('');
    setEndDate('');
    setCapacity(2);
  };

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-aiesec-blue" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Intake Waves & Slot Capacity Matrix
            </h4>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-aiesec-blue dark:bg-blue-950/40 dark:text-blue-300">
              {opportunity.slotWaves?.length || 0} Wave{opportunity.slotWaves?.length !== 1 ? 's' : ''}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Dynamic aggregation from linked EP applications. Total Capacity: {totalWavesCapacity} | Approved: {totalApproved} | Realized: {totalRealized}
          </p>
        </div>

        <button
          onClick={() => setIsAddingWave(!isAddingWave)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-aiesec-blue px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-blue-600 transition"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>+ Add Slot Wave</span>
        </button>
      </div>

      {/* Add Wave Form */}
      {isAddingWave && (
        <form
          onSubmit={handleCreateWave}
          className="rounded-lg border border-blue-200 bg-blue-50/40 p-4 space-y-3 dark:border-blue-900 dark:bg-blue-950/20"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-900 dark:text-blue-300">
              Configure New Intake Wave
            </span>
            <button
              type="button"
              onClick={() => setIsAddingWave(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded bg-rose-50 p-2 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Wave Label
              </label>
              <input
                type="text"
                placeholder="e.g. Wave 3 — Summer 27"
                value={waveLabel}
                onChange={(e) => setWaveLabel(e.target.value)}
                className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Intake Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Intake End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Openings (Capacity)
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="submit"
              className="rounded bg-aiesec-blue px-3 py-1 text-xs font-semibold text-white hover:bg-blue-600"
            >
              Confirm Wave Creation
            </button>
          </div>
        </form>
      )}

      {/* Wave Bands */}
      <div className="space-y-3">
        {(!opportunity.slotWaves || opportunity.slotWaves.length === 0) ? (
          <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400 dark:border-slate-800">
            No slot waves configured yet. Click "+ Add Slot Wave" to open intake cohorts.
          </div>
        ) : (
          opportunity.slotWaves.map((wave) => {
            const availableSlots = Math.max(0, wave.capacity - wave.approvedCount);
            const fillRatePercent = Math.min(100, Math.round((wave.approvedCount / wave.capacity) * 100));

            return (
              <div
                key={wave.id}
                className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/40"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-xs">
                        {wave.waveLabel}
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                          availableSlots === 0
                            ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                        }`}
                      >
                        {availableSlots === 0 ? 'Full' : `${availableSlots} Open Slot${availableSlots !== 1 ? 's' : ''}`}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <Calendar className="h-3 w-3 text-slate-400" />
                      <span>
                        {wave.startDate} → {wave.endDate}
                      </span>
                      <span>•</span>
                      <span>Total Capacity: <strong>{wave.capacity}</strong></span>
                    </div>
                  </div>

                  {/* Funnel breakdown metrics */}
                  <div className="flex items-center gap-3 text-center text-[10px] font-mono">
                    <div className="rounded border border-slate-200 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-900">
                      <span className="block font-bold text-slate-900 dark:text-white">{wave.appliedCount}</span>
                      <span className="text-slate-400">Applied</span>
                    </div>
                    <ChevronRight className="h-3 w-3 text-slate-300" />
                    <div className="rounded border border-slate-200 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-900">
                      <span className="block font-bold text-amber-600">{wave.acceptedCount}</span>
                      <span className="text-slate-400">Accepted</span>
                    </div>
                    <ChevronRight className="h-3 w-3 text-slate-300" />
                    <div className="rounded border border-slate-200 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-900">
                      <span className="block font-bold text-emerald-600">{wave.approvedCount}</span>
                      <span className="text-slate-400">Approved</span>
                    </div>
                    <ChevronRight className="h-3 w-3 text-slate-300" />
                    <div className="rounded border border-slate-200 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-900">
                      <span className="block font-bold text-blue-600">{wave.realizedCount}</span>
                      <span className="text-slate-400">Realized</span>
                    </div>
                  </div>
                </div>

                {/* Progress Meter */}
                <div className="mt-3">
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>Wave Fill Rate</span>
                    <span>{fillRatePercent}% ({wave.approvedCount}/{wave.capacity} Approved)</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div
                      style={{ width: `${fillRatePercent}%` }}
                      className={`h-full transition-all duration-300 ${
                        fillRatePercent >= 100
                          ? 'bg-rose-500'
                          : fillRatePercent >= 60
                          ? 'bg-emerald-500'
                          : 'bg-aiesec-blue'
                      }`}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
