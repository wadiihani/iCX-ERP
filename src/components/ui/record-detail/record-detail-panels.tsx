'use client';

import React from 'react';
import Link from 'next/link';
import { useRecordDetail } from './record-detail-context';
import type { RecordActionItem } from './record-detail-types';

export function RecordIdentityBanner() {
  const { record, openAuditDrawer } = useRecordDetail();

  const productBadgeColors = {
    iGV: 'bg-[#F85A40]/10 text-[#F85A40] border-[#F85A40]/30',
    iGTa: 'bg-[#0CB9C1]/10 text-[#0CB9C1] border-[#0CB9C1]/30',
    iGTe: 'bg-[#F48924]/10 text-[#F48924] border-[#F48924]/30',
  };

  const statusVariantStyles = {
    success: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    warning: 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    critical: 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
    info: 'bg-sky-50 text-sky-800 border-sky-300 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800',
    neutral: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
      {record.backHref && (
        <div className="mb-2">
          <Link
            href={record.backHref}
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            ← {record.backLabel || 'Back to tracker'}
          </Link>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {record.stableId}
            </span>
            <span className="text-xs font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
              {record.recordType}
            </span>
            {record.product && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded border ${productBadgeColors[record.product]}`}>
                {record.product}
              </span>
            )}
            <span className="text-xs px-2 py-0.5 rounded bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              LC: {record.currentLc}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {record.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-slate-700 dark:text-slate-300">Owner:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{record.owner.name}</span>
              <span className="text-slate-400">({record.owner.team})</span>
            </div>
            <span>•</span>
            <div>
              <span>Updated: </span>
              <time dateTime={record.lastUpdatedAt} className="font-medium text-slate-700 dark:text-slate-300">
                {new Date(record.lastUpdatedAt).toLocaleString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </time>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border tracking-wide uppercase ${statusVariantStyles[record.status.variant]}`}>
              {record.status.label}
            </span>
            {record.status.expaStatus && (
              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono" title="EXPA Synchronized Status">
                EXPA: {record.status.expaStatus}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => openAuditDrawer()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
            title="Inspect cryptographic hash audit chain"
          >
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Audit Trail
          </button>
        </div>
      </div>

      {record.actions && record.actions.length > 0 && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
          {record.actions.map((act) => (
            <ActionButton key={act.id} action={act} />
          ))}
        </div>
      )}
    </div>
  );
}

function ActionButton({ action }: { action: RecordActionItem }) {
  const variantStyles = {
    primary: 'bg-primary text-white hover:bg-primary/90 focus:ring-primary/40',
    secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 focus:ring-slate-400',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-400',
  };

  const currentVariant = action.variant || 'secondary';

  if (!action.isPermitted) {
    return (
      <button
        type="button"
        disabled
        title={action.blockerReason || 'Action locked by RBAC governance or pending prerequisite'}
        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-400 dark:bg-slate-800/50 dark:text-slate-600 border border-slate-200 dark:border-slate-800 cursor-not-allowed opacity-60"
      >
        {action.label} (Locked)
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={action.onClick}
      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 ${variantStyles[currentVariant]}`}
    >
      {action.label}
    </button>
  );
}

export function RecordStateAndRiskPanel() {
  const { record } = useRecordDetail();
  const risk = record.priorityRisk;

  const riskColors = {
    LOW: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800',
    MEDIUM: 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800',
    HIGH: 'text-orange-700 bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800',
    CRITICAL: 'text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800',
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
      <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Operational State & Risk Guard
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Lifecycle Status</div>
          <div className="mt-1 text-base font-bold text-slate-900 dark:text-white">
            {record.status.label}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Reconciles with EXPA status
          </div>
        </div>

        <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Risk Assessment</div>
          <div className="mt-1">
            {risk ? (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold border ${riskColors[risk.level]}`}>
                {risk.level} RISK
              </span>
            ) : (
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                Low / Clear
              </span>
            )}
          </div>
          {risk?.reason && (
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
              {risk.reason}
            </p>
          )}
        </div>

        <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Open Tasks & Next Actions</div>
          <div className="mt-1 text-base font-bold text-slate-900 dark:text-white">
            {record.nextActions.length} Pending
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {record.nextActions.filter(a => a.isOverdue).length} overdue SLA milestones
          </div>
        </div>
      </div>
    </div>
  );
}

export function RecordKeyDetailsPanel() {
  const { record } = useRecordDetail();

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Specification Details
        </h2>
        <span className="text-xs font-mono text-slate-400">
          {record.keyDetails.length} fields
        </span>
      </div>

      <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 text-xs">
        {record.keyDetails.map((field, idx) => (
          <div key={idx} className="space-y-1">
            <dt className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
              <span>{field.label}</span>
              {field.isRequired && <span className="text-rose-500 font-bold" title="Required">*</span>}
            </dt>
            <dd className="font-semibold text-slate-900 dark:text-slate-100 break-words">
              {field.value ?? <span className="text-slate-400 font-normal italic">None</span>}
            </dd>
            {field.helperText && (
              <p className="text-[10px] text-slate-400">{field.helperText}</p>
            )}
          </div>
        ))}
      </dl>
    </div>
  );
}

export function RecordRelationshipsPanel() {
  const { record } = useRecordDetail();

  const typeBadges = {
    EP: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300',
    ORGANIZATION: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300',
    CONTACT: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300',
    OPPORTUNITY: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300',
    SLOT: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300',
    DEAL: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300',
    INVOICE: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-300',
    CASE: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300',
    TASK: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300',
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Connected Relationships
        </h2>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
          {record.relationships.length}
        </span>
      </div>

      {record.relationships.length === 0 ? (
        <div className="text-center py-6 text-xs text-slate-400 italic">
          No linked records connected to this entity yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {record.relationships.map((rel) => (
            <Link
              key={rel.id}
              href={rel.href}
              className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-primary/50 dark:hover:border-primary/50 transition-colors bg-white dark:bg-slate-900 flex items-start justify-between group"
            >
              <div className="space-y-1">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${typeBadges[rel.recordType] || 'bg-slate-100'}`}>
                  {rel.recordType}
                </span>
                <div className="font-semibold text-xs text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                  {rel.title}
                </div>
                {rel.subtitle && (
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {rel.subtitle}
                  </div>
                )}
              </div>
              {rel.statusText && (
                <span className="text-[10px] font-medium text-slate-500 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded">
                  {rel.statusText}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function RecordNextActionsPanel() {
  const { record } = useRecordDetail();

  const priorityColors = {
    LOW: 'text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300',
    MEDIUM: 'text-blue-700 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-300',
    HIGH: 'text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300',
    CRITICAL: 'text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300',
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Next Actions & SLA Milestones
        </h2>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
          {record.nextActions.length} Actions
        </span>
      </div>

      {record.nextActions.length === 0 ? (
        <div className="text-center py-6 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
          ✓ All SLA actions completed. Zero pending blockers.
        </div>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {record.nextActions.map((action) => (
            <li key={action.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${priorityColors[action.priority]}`}>
                    {action.priority}
                  </span>
                  <span className="text-xs font-semibold text-slate-900 dark:text-white">
                    {action.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Assigned to: {action.ownerName}</span>
                  {action.blockerDescription && (
                    <span className="text-rose-600 font-medium">
                      • Blocker: {action.blockerDescription}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className={`text-xs font-medium ${action.isOverdue ? 'text-rose-600 font-bold' : 'text-slate-600 dark:text-slate-300'}`}>
                    Due {new Date(action.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                  </div>
                  {action.slaCountdown && (
                    <div className="text-[10px] font-mono text-slate-400">
                      SLA: {action.slaCountdown}
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function RecordEvidencePanel() {
  const { record } = useRecordDetail();

  const statusStyles = {
    VERIFIED: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300',
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300',
    REJECTED: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300',
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Evidence & Compliance Vault
        </h2>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
          {record.evidenceDocuments.length} Documents
        </span>
      </div>

      {record.evidenceDocuments.length === 0 ? (
        <div className="text-center py-6 text-xs text-slate-400 italic">
          No mandatory documents or proof uploaded yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {record.evidenceDocuments.map((doc) => (
            <div
              key={doc.id}
              className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between gap-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                    {doc.docType}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${statusStyles[doc.verificationStatus]}`}>
                    {doc.verificationStatus}
                  </span>
                </div>
                <div className="font-semibold text-xs text-slate-900 dark:text-white mt-1">
                  {doc.title}
                </div>
                {doc.verifiedBy && (
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Verified by {doc.verifiedBy} on {new Date(doc.verifiedAt || '').toLocaleDateString('en-GB')}
                  </div>
                )}
                {doc.sha256Digest && (
                  <div className="text-[10px] font-mono text-slate-400 truncate mt-1" title={doc.sha256Digest}>
                    SHA-256: {doc.sha256Digest.slice(0, 16)}...
                  </div>
                )}
              </div>

              {doc.downloadUrl && (
                <a
                  href={doc.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1 text-xs font-semibold rounded bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
                >
                  View Document
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
