'use client';

import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  ShieldAlert,
  FileText,
  Clock,
  UserX,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import type { EPRecord } from '@/lib/ep/ep-data';

export type ExceptionType =
  | 'REJECTED'
  | 'WITHDRAWN'
  | 'APPROVAL_BROKEN'
  | 'REALIZATION_BROKEN'
  | 'REMOTE_BROKEN'
  | 'FINISHED_EARLIER';

export interface ExceptionSubmissionPayload {
  epId: string;
  exceptionType: ExceptionType;
  reasonCategory: string;
  detailedReason: string;
  isEpQualified100Percent?: boolean; // For OP Rejection
  unjustifiedOpRejection?: boolean;
  annex2ReplacementDueDays?: number; // 14 for APD break, 7 for RE break
}

interface EpExceptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  ep: EPRecord | null;
  onSubmitException: (payload: ExceptionSubmissionPayload) => void;
}

export function EpExceptionModal({
  isOpen,
  onClose,
  ep,
  onSubmitException,
}: EpExceptionModalProps) {
  const [exceptionType, setExceptionType] = useState<ExceptionType>('REJECTED');
  const [reasonCategory, setReasonCategory] = useState('CRITERIA_MISMATCH');
  const [detailedReason, setDetailedReason] = useState('');
  const [isEpQualified100Percent, setIsEpQualified100Percent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !ep) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!detailedReason.trim() || detailedReason.trim().length < 15) {
      setError('Statutory requirement (AEPP 4.2.3.5): You must provide detailed written feedback (at least 15 characters) explaining the root cause.');
      return;
    }

    const unjustifiedOpRejection =
      exceptionType === 'REJECTED' &&
      isEpQualified100Percent &&
      reasonCategory === 'OP_UNJUSTIFIED_REJECTION';

    const annex2ReplacementDueDays =
      exceptionType === 'APPROVAL_BROKEN'
        ? 14
        : exceptionType === 'REALIZATION_BROKEN'
        ? 7
        : undefined;

    onSubmitException({
      epId: ep.id,
      exceptionType,
      reasonCategory,
      detailedReason,
      isEpQualified100Percent,
      unjustifiedOpRejection,
      annex2ReplacementDueDays,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="max-w-lg w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-rose-600" />
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Log AEPP Exception or Contract Break
              </h3>
              <p className="text-xs text-slate-500">
                EP: <strong>{ep.full_name}</strong> ({ep.expa_ep_id})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200 flex items-center gap-2 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Exception Type Selector */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Statutory Exception Stage
            </label>
            <select
              value={exceptionType}
              onChange={(e) => {
                const nextType = e.target.value as ExceptionType;
                setExceptionType(nextType);
                if (nextType === 'REJECTED') setReasonCategory('CRITERIA_MISMATCH');
                else if (nextType === 'WITHDRAWN') setReasonCategory('PERSONAL_ACADEMIC');
                else if (nextType === 'APPROVAL_BROKEN') setReasonCategory('VISA_REFUSAL_AEPP_4_4');
                else setReasonCategory('HEALTH_EMERGENCY_AEPP_4_5');
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white font-medium"
            >
              <option value="REJECTED">Applicant Rejection (Pre-APD — AEPP 4.2.3.5)</option>
              <option value="WITHDRAWN">Applicant Self-Withdrawal (Pre-APD)</option>
              <option value="APPROVAL_BROKEN">Approval Break (APD Broken — AEPP 4.4 / Annex 2)</option>
              <option value="REALIZATION_BROKEN">Realization Break (RE Broken — AEPP 4.5 / Annex 2)</option>
              <option value="REMOTE_BROKEN">Remote Modality Break (APIP 5.2.3)</option>
              <option value="FINISHED_EARLIER">Finished Earlier (Mutual Variation Agreement)</option>
            </select>
          </div>

          {/* Reason Category */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Primary Statutory Cause
            </label>
            {exceptionType === 'REJECTED' ? (
              <select
                value={reasonCategory}
                onChange={(e) => setReasonCategory(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="CRITERIA_MISMATCH">Profile does not match posted JD language or technical requirements</option>
                <option value="INTERVIEW_FAILED">Unsatisfactory technical interview or language assessment</option>
                <option value="OP_UNJUSTIFIED_REJECTION">Opportunity Partner rejected qualified candidate without valid grounds</option>
                <option value="HORIZON_MISMATCH">EP available dates conflict with Opportunity Slot intake wave</option>
              </select>
            ) : exceptionType === 'WITHDRAWN' ? (
              <select
                value={reasonCategory}
                onChange={(e) => setReasonCategory(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="PERSONAL_ACADEMIC">University exams, graduation, or academic schedule changes</option>
                <option value="FINANCIAL_CONSTRAINTS">EP unable to cover international airfare or living deposit</option>
                <option value="ACCEPTED_OTHER_OFFER">EP matched with competing opportunity in another country</option>
                <option value="FAMILY_OBJECTION">Family, parental, or travel objection</option>
              </select>
            ) : (
              <select
                value={reasonCategory}
                onChange={(e) => setReasonCategory(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="VISA_REFUSAL_AEPP_4_4">Visa Denied by Moroccan Consulate (Timely application proved)</option>
                <option value="HEALTH_EMERGENCY_AEPP_4_5">Medical emergency or sudden illness with certified proof</option>
                <option value="OP_CANCELLED_PROJECT">Opportunity Partner closed department or cancelled project</option>
                <option value="STANDARDS_BREACH_AEPP_4_5">Host Entity failed to deliver Mandatory Standard #4–#9</option>
                <option value="NATURAL_DISASTER_FORCE_MAJEURE">Force Majeure, flight restrictions, or embassy closure</option>
              </select>
            )}
          </div>

          {/* Conditional AEPP 4.2.2.1.7 Question for Rejections */}
          {exceptionType === 'REJECTED' && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 space-y-2 dark:border-amber-900 dark:bg-amber-950/20">
              <div className="flex items-start gap-2 text-amber-800 dark:text-amber-300">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">
                    AEPP 4.2.2.1.7 OP Candidate Rejection Audit:
                  </span>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                    Did this candidate meet 100% of the opportunity qualifications published on EXPA at the time of application?
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 pl-6 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="isQualified"
                    checked={isEpQualified100Percent}
                    onChange={() => setIsEpQualified100Percent(true)}
                    className="text-amber-600"
                  />
                  <span className="font-medium">Yes — Candidate met all criteria</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="isQualified"
                    checked={!isEpQualified100Percent}
                    onChange={() => setIsEpQualified100Percent(false)}
                    className="text-amber-600"
                  />
                  <span>No — Candidate lacked posted criteria</span>
                </label>
              </div>

              {isEpQualified100Percent && (
                <div className="text-[10px] text-rose-700 bg-rose-50 border border-rose-200 p-2 rounded dark:bg-rose-950/40 dark:text-rose-300">
                  ⚠️ Marking an unjustified OP rejection will increment the partner's rejection counter ({ep.partner_organization_name}). Reaching 3/3 requires LCVP review per AEPP 4.2.2.1.7.
                </div>
              )}
            </div>
          )}

          {/* Annex 2 Replacement Clock Notice */}
          {(exceptionType === 'APPROVAL_BROKEN' || exceptionType === 'REALIZATION_BROKEN') && (
            <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3 flex items-center gap-2 text-blue-900 dark:border-blue-900 dark:bg-blue-950/20 dark:text-blue-300">
              <Clock className="h-4 w-4 shrink-0 text-aiesec-blue" />
              <div>
                <span className="font-bold">Annex 2 Replacement Clock:</span>
                <span className="block text-[11px]">
                  {exceptionType === 'APPROVAL_BROKEN'
                    ? '14-Day statutory APD replacement timer initiated. If no replacement matched, refund/dispute applies.'
                    : '7-Day statutory RE replacement timer initiated. If unresolved, ICB Case Vault is notified.'}
                </span>
              </div>
            </div>
          )}

          {/* Detailed Justification */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Statutory Justification & Feedback Notes <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Explain the specific facts, dates, communications, and evidence..."
              value={detailedReason}
              onChange={(e) => setDetailedReason(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <span className="text-[10px] text-slate-400">
              Transmitted to Sending LC ({ep.home_lc}) and archived in audit trail.
            </span>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-rose-600 px-5 py-2 font-bold text-white shadow hover:bg-rose-700 transition"
            >
              Submit & Enforce AEPP Outcome
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
