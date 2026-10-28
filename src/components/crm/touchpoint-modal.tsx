'use client';

import React, { useState } from 'react';
import { X, Calendar, User, FileText, CheckCircle2 } from 'lucide-react';
import type { B2BTouchpoint, B2BOrganization } from '@/lib/crm/organizations-data';

interface TouchpointModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizations: B2BOrganization[];
  defaultOrgId?: string;
  onSaveTouchpoint: (touchpoint: Omit<B2BTouchpoint, 'id' | 'created_at'>) => void;
}

export function TouchpointModal({
  isOpen,
  onClose,
  organizations,
  defaultOrgId,
  onSaveTouchpoint,
}: TouchpointModalProps) {
  const [orgId, setOrgId] = useState(defaultOrgId || (organizations[0]?.id ?? ''));
  const [touchpointType, setTouchpointType] = useState<B2BTouchpoint['touchpoint_type']>('MEETING');
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().slice(0, 10));
  const [minutes, setMinutes] = useState('');
  const [nextAction, setNextAction] = useState('');
  const [nextActionDueDate, setNextActionDueDate] = useState('');
  const [nextActionOwner, setNextActionOwner] = useState('Youssef Mansouri');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedOrg = organizations.find((o) => o.id === orgId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId) {
      setError('Please select an organization.');
      return;
    }
    if (!minutes.trim()) {
      setError('Please provide meeting minutes or discussion summary.');
      return;
    }
    if (!nextAction.trim()) {
      setError('Please specify the agreed next action.');
      return;
    }
    if (!nextActionDueDate) {
      setError('Please provide a deadline for the next action.');
      return;
    }

    onSaveTouchpoint({
      organization_id: orgId,
      organization_name: selectedOrg?.name || 'Organization',
      contact_name: selectedOrg?.primary_contact_name,
      touchpoint_type: touchpointType,
      meeting_date: new Date(meetingDate).toISOString(),
      minutes: minutes.trim(),
      next_action: nextAction.trim(),
      next_action_due_date: new Date(nextActionDueDate).toISOString(),
      next_action_owner: nextActionOwner,
      created_by: 'Current User',
    });

    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in"
    >
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Log Partner Interaction & Action
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Every B2B contact must produce an assigned next action with SLA deadline.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-md bg-rose-50 p-2.5 text-xs font-medium text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Organization *
            </label>
            <select
              value={orgId}
              onChange={(e) => setOrgId(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-white p-2 text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name} ({org.city}) — {org.status}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Touchpoint Type
              </label>
              <select
                value={touchpointType}
                onChange={(e) => setTouchpointType(e.target.value as B2BTouchpoint['touchpoint_type'])}
                className="w-full rounded-md border border-slate-200 bg-white p-2 text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="MEETING">Formal Meeting</option>
                <option value="PHONE_CALL">Phone Call</option>
                <option value="OFFICE_VISIT">Office Visit</option>
                <option value="EMAIL">Email Discussion</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Interaction Date
              </label>
              <input
                type="date"
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white p-2 text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Discussion Summary / Minutes *
            </label>
            <textarea
              rows={3}
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              placeholder="Key notes, pain points identified, candidate requirements, or contract status discussed..."
              className="w-full rounded-md border border-slate-200 bg-white p-2 text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="rounded-lg border border-aiesec-blue/30 bg-aiesec-soft/40 p-3.5 dark:border-blue-800 dark:bg-blue-950/20 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-aiesec-darkblue dark:text-blue-300">
              <CheckCircle2 className="h-4 w-4 text-aiesec-blue" />
              <span>Mandatory Operational Next Action</span>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Agreed Action Deliverable *
              </label>
              <input
                type="text"
                value={nextAction}
                onChange={(e) => setNextAction(e.target.value)}
                placeholder="e.g., Deliver customized job description and send candidate profile samples"
                className="w-full rounded-md border border-slate-200 bg-white p-2 text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Action Deadline *
                </label>
                <input
                  type="date"
                  value={nextActionDueDate}
                  onChange={(e) => setNextActionDueDate(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white p-2 text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Assignee Owner
                </label>
                <select
                  value={nextActionOwner}
                  onChange={(e) => setNextActionOwner(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white p-2 text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="Youssef Mansouri">Youssef Mansouri (BD)</option>
                  <option value="Sara Kabbaj">Sara Kabbaj (BD)</option>
                  <option value="Mehdi Benjelloun">Mehdi Benjelloun (VP BD)</option>
                  <option value="Hatim Berrada">Hatim Berrada (LCP)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-aiesec-blue px-4 py-1.5 text-xs font-semibold text-white shadow hover:bg-aiesec-blue/90"
            >
              Log Touchpoint & Enqueue Action
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
