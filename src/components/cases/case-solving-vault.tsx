'use client';

import React, { useState } from 'react';
import {
  AlertOctagon,
  ShieldAlert,
  Clock,
  ShieldCheck,
  Pause,
  Play,
  ArrowUpRight,
  Eye,
  EyeOff,
  Calculator,
  Lock,
  Unlock,
  AlertTriangle,
  FileText,
  DollarSign,
  X,
  CheckCircle2,
  ExternalLink,
  UserCheck,
} from 'lucide-react';
import {
  evaluateStageClock,
  pauseCaseClock,
  resumeCaseClock,
  escalateCase,
} from '@/lib/cases/quality-case-engine';
import {
  type QualityCaseRecord,
  type CaseClassification,
  type PauseReason,
} from '@/lib/types/quality-cases';
import {
  calculateAnnex2DraftCompensation,
  type Annex2CalculationInput,
} from '@/lib/cases/compensation-calculator';
import {
  type DraftCompensationReport,
} from '@/lib/types/compensation-appeals';
import {
  INITIAL_VISA_RECORDS,
  executeHumanVisaVerification,
  type HumanVerifiedVisaRecord,
} from '@/lib/visa/visa-registry';

export interface CaseVaultProps {
  cases?: QualityCaseRecord[];
  visaRecords?: HumanVerifiedVisaRecord[];
}

export const INITIAL_EXTENDED_CASES: QualityCaseRecord[] = [
  {
    id: 'case_001',
    caseNumber: 'CASE-2026-RABAT-104',
    lcId: 'lc_rabat',
    applicationId: 'app_2026_081',
    epId: 'ep_2026_081',
    epName: 'Sofia Martinez',
    homeLc: 'AIESEC in Bogota UniAndes',
    classification: 'STANDARDS_BREACH',
    stage: 'STAGE_1_LC_DIRECT',
    status: 'UNDER_INVESTIGATION',
    openedAt: '2026-10-27T10:00:00Z',
    stageStartedAt: '2026-10-27T10:00:00Z',
    isClockPaused: false,
    pauseIntervals: [],
    disputedStandards: [9, 10],
    description: 'Opportunity Provider requested 45 working hours/week instead of contracted 30 hours. Mediation in progress with OP supervisor.',
    createdAt: '2026-10-27T10:00:00Z',
    updatedAt: '2026-10-28T09:00:00Z',
  },
  {
    id: 'case_002',
    caseNumber: 'CASE-2026-RABAT-209',
    lcId: 'lc_rabat',
    applicationId: 'app_2026_077',
    epId: 'ep_2026_077',
    epName: 'Amara Diop',
    homeLc: 'AIESEC in Dakar',
    classification: 'ACCOMMODATION_SAFETY',
    stage: 'STAGE_1_LC_DIRECT',
    status: 'RESOLUTION_PROPOSED',
    openedAt: '2026-10-26T14:00:00Z',
    stageStartedAt: '2026-10-26T14:00:00Z',
    isClockPaused: true,
    pauseIntervals: [
      {
        id: 'p1',
        pausedAt: '2026-10-27T12:00:00Z',
        reason: 'DOCUMENT_SUBMISSION_WINDOW',
        notes: 'Plumber inspection report pending from landlord.',
        pausedByUserId: 'user-vp-cxp',
      },
    ],
    disputedStandards: [7],
    description: 'Hot water plumbing issue in host apartment. Emergency maintenance scheduled and temporary hotel voucher issued.',
    createdAt: '2026-10-26T14:00:00Z',
    updatedAt: '2026-10-27T12:00:00Z',
  },
  {
    id: 'case_003',
    caseNumber: 'CASE-2026-RABAT-312',
    lcId: 'lc_rabat',
    applicationId: 'app_2026_confidential',
    epId: 'ep_confidential_99',
    epName: 'Karolina Novak',
    homeLc: 'AIESEC in Warsaw SGH',
    classification: 'MISCONDUCT',
    stage: 'STAGE_2_ECB_MEDIATION',
    status: 'UNDER_INVESTIGATION',
    openedAt: '2026-10-22T08:00:00Z',
    stageStartedAt: '2026-10-25T08:00:00Z',
    isClockPaused: false,
    pauseIntervals: [],
    disputedStandards: [14],
    description: 'Sensitive complaint regarding OP supervisor inappropriate conduct outside working hours. Escalated directly to ECB Morocco & ICB.',
    createdAt: '2026-10-22T08:00:00Z',
    updatedAt: '2026-10-25T08:00:00Z',
  },
];

export function CaseSolvingVault({
  cases = INITIAL_EXTENDED_CASES,
  visaRecords = INITIAL_VISA_RECORDS,
}: CaseVaultProps) {
  const [activeTab, setActiveTab] = useState<'cases' | 'visas'>('cases');
  const [caseList, setCaseList] = useState<QualityCaseRecord[]>(cases);
  const [visas, setVisas] = useState<HumanVerifiedVisaRecord[]>(visaRecords);
  const [isLcpAuthorized, setIsLcpAuthorized] = useState(false);
  const [selectedCaseForCalc, setSelectedCaseForCalc] = useState<QualityCaseRecord | null>(null);
  const [calcReport, setCalcReport] = useState<DraftCompensationReport | null>(null);
  
  // Pause dialog state
  const [pauseCaseId, setPauseCaseId] = useState<string | null>(null);
  const [pauseReason, setPauseReason] = useState<PauseReason>('DOCUMENT_SUBMISSION_WINDOW');
  const [pauseNotes, setPauseNotes] = useState('');

  // Human Visa Verification Modal State
  const [verifyingVisa, setVerifyingVisa] = useState<HumanVerifiedVisaRecord | null>(null);
  const [verifierName, setVerifierName] = useState('Amina Benali');
  const [verifierRole, setVerifierRole] = useState('VP CXP');
  const [verificationNotes, setVerificationNotes] = useState('');

  // Toggle Clock Pause
  const handleTogglePause = (c: QualityCaseRecord) => {
    if (c.isClockPaused) {
      const resumed = resumeCaseClock(c, { userId: 'current-user-vp' });
      setCaseList(caseList.map((item) => (item.id === c.id ? resumed : item)));
    } else {
      setPauseCaseId(c.id);
      setPauseNotes('');
    }
  };

  const handleConfirmPause = () => {
    if (!pauseCaseId || !pauseNotes.trim()) return;
    const target = caseList.find((c) => c.id === pauseCaseId);
    if (!target) return;

    const paused = pauseCaseClock(target, {
      reason: pauseReason,
      notes: pauseNotes,
      userId: 'current-user-vp',
    });
    setCaseList(caseList.map((item) => (item.id === pauseCaseId ? paused : item)));
    setPauseCaseId(null);
  };

  const handleEscalate = (c: QualityCaseRecord) => {
    const nextStage = c.stage === 'STAGE_1_LC_DIRECT' ? 'STAGE_2_ECB_MEDIATION' : 'STAGE_3_ICB_ARBITRATION';
    const escalated = escalateCase(c, nextStage, 'user-vp-cxp');
    setCaseList(caseList.map((item) => (item.id === c.id ? escalated : item)));
  };

  const handleOpenCalculator = (c: QualityCaseRecord) => {
    setSelectedCaseForCalc(c);
    const report = calculateAnnex2DraftCompensation({
      caseId: c.id,
      epName: c.epName,
      homeLc: c.homeLc,
      totalFeePaidMad: 3000,
      exchangeDurationDays: 42,
      completedDays: 14,
      unfulfilledStandardsCount: c.disputedStandards?.length || 2,
      emergencyAccommodationNights: 3,
      emergencyNightRateMad: 250,
      transportExpenseMad: 150,
    });
    setCalcReport(report);
  };

  const handleVerifyVisaSubmit = (status: 'VERIFIED_HUMAN' | 'BLOCKED') => {
    if (!verifyingVisa) return;
    const updated = executeHumanVisaVerification(verifyingVisa, {
      verifierName,
      verifierRole,
      newStatus: status,
      notes: verificationNotes,
    });
    setVisas(visas.map((v) => (v.id === updated.id ? updated : v)));
    setVerifyingVisa(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Security Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-subtle">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('cases')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'cases'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <AlertOctagon className="h-3.5 w-3.5" />
            <span>ECB/ICB Case Vault ({caseList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('visas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'visas'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Human-Verified Visa Registry ({visas.length})</span>
          </button>
        </div>

        {/* Confidentiality Privacy Mask Toggle */}
        <button
          onClick={() => setIsLcpAuthorized(!isLcpAuthorized)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
            isLcpAuthorized
              ? 'bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
              : 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          {isLcpAuthorized ? <Unlock className="h-3.5 w-3.5 text-amber-600" /> : <Lock className="h-3.5 w-3.5" />}
          <span>{isLcpAuthorized ? 'LCP / CXP Clearance Unlocked' : 'Confidentiality Mask Active'}</span>
        </button>
      </div>

      {activeTab === 'cases' ? (
        /* Case Solving Vault */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Stage 1 SLA</span>
              <div className="text-base font-bold text-slate-900 dark:text-white mt-1">72 Hours Local</div>
              <p className="text-[10px] text-slate-500 mt-0.5">24h Ack • 48h Reply • 72h Escalate</p>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Stage 2 SLA</span>
              <div className="text-base font-bold text-slate-900 dark:text-white mt-1">14 Days ECB Mediation</div>
              <p className="text-[10px] text-slate-500 mt-0.5">48h Ack • 96h National Ruling</p>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Stage 3 SLA</span>
              <div className="text-base font-bold text-slate-900 dark:text-white mt-1">30 Days ICB Global</div>
              <p className="text-[10px] text-slate-500 mt-0.5">Final binding arbitration ruling</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {caseList.map((c) => {
              const clock = evaluateStageClock(c);
              const isHarassmentCase = c.classification === 'MISCONDUCT';
              const isMasked = isHarassmentCase && !isLcpAuthorized;

              return (
                <div
                  key={c.id}
                  className={`p-5 rounded-xl border bg-white dark:bg-slate-900 shadow-subtle space-y-3.5 ${
                    isHarassmentCase
                      ? 'border-rose-300 dark:border-rose-900/60'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between border-b pb-2.5 border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                        {c.caseNumber}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        c.stage === 'STAGE_1_LC_DIRECT'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : c.stage === 'STAGE_2_ECB_MEDIATION'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}>
                        {c.stage.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                      c.classification === 'MISCONDUCT'
                        ? 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300'
                        : 'bg-slate-100 text-slate-700 border-slate-300'
                    }`}>
                      {c.classification.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Participant:</span>
                      <strong className={`font-semibold ${isMasked ? 'text-rose-600 font-mono italic' : 'text-slate-900 dark:text-white'}`}>
                        {isMasked ? 'CONFIDENTIAL (PROTECTED WITNESS)' : c.epName}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span className="text-slate-400">Home Entity:</span>
                      <span className="text-slate-600 dark:text-slate-300">{c.homeLc}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                    {isMasked ? 'Details restricted to Level-1 LCP clearance under AEPP Anti-Harassment Safeguarding protocols.' : c.description}
                  </p>

                  {/* Stage Clock Display */}
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Clock className={`h-4 w-4 ${c.isClockPaused ? 'text-amber-500' : 'text-rose-500'}`} />
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px]">
                          {c.isClockPaused ? 'Clock Paused (Legal Hold)' : `${clock.remainingHours}h Remaining in Stage`}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Limit: {clock.clockLimitHours}h • Effective Elapsed: {clock.effectiveElapsedHours}h
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleTogglePause(c)}
                        className={`p-1.5 rounded text-xs font-semibold border flex items-center gap-1 ${
                          c.isClockPaused
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                        }`}
                        title={c.isClockPaused ? 'Resume Clock' : 'Pause Clock (REQ-078)'}
                      >
                        {c.isClockPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
                        <span>{c.isClockPaused ? 'Resume' : 'Pause'}</span>
                      </button>

                      {c.stage !== 'STAGE_3_ICB_ARBITRATION' && (
                        <button
                          onClick={() => handleEscalate(c)}
                          className="p-1.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 flex items-center gap-1"
                          title="Escalate to next statutory tier"
                        >
                          <ArrowUpRight className="h-3.5 w-3.5" />
                          <span>Escalate</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Annex 2 Liability Calculator Button */}
                  <div className="pt-1 flex items-center justify-between text-xs border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => handleOpenCalculator(c)}
                      className="text-xs font-bold text-aiesec-blue hover:underline flex items-center gap-1"
                    >
                      <Calculator className="h-3.5 w-3.5" />
                      <span>Compute Annex 2 Liability (MAD)</span>
                    </button>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Status: {c.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Human-Verified Visa Registry */
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-300 flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold">Human Verification Statutory Policy (HUB-VISA-01)</h4>
              <p className="text-[11px] text-blue-700 dark:text-blue-300 mt-0.5">
                Automated or AI travel clearance is strictly prohibited by AEPP/APIP. Every exchange participant must be audited by a human officer against the Moroccan Ministry of Foreign Affairs (MAE) portal with recorded timestamps and verifier identity.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-500">
                <tr>
                  <th className="p-3.5">Participant & Passport</th>
                  <th className="p-3.5">Nationality & Route</th>
                  <th className="p-3.5">Moroccan Regime</th>
                  <th className="p-3.5">Intended Travel</th>
                  <th className="p-3.5">Passport Expiry</th>
                  <th className="p-3.5">Human Verification</th>
                  <th className="p-3.5 text-right">Clearance Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {visas.map((v) => {
                  return (
                    <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3.5">
                        <span className="font-bold text-slate-900 dark:text-white block">{v.epName}</span>
                        <span className="text-[10px] font-mono text-slate-400">{v.passportNumber}</span>
                      </td>

                      <td className="p-3.5">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block">{v.nationalityCountry}</span>
                        <span className="text-[10px] text-slate-400">Residing: {v.residenceCountry}</span>
                      </td>

                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          v.moroccanRegime === 'VISA_FREE_90D'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : v.moroccanRegime === 'AEVM_EVISA'
                            ? 'bg-purple-50 text-purple-800 border-purple-300'
                            : 'bg-amber-50 text-amber-800 border-amber-300'
                        }`}>
                          {v.moroccanRegime.replace(/_/g, ' ')}
                        </span>
                        <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                          Lead: {v.leadTimeDays}d
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className="font-mono text-slate-700 dark:text-slate-300 block">{v.arrivalDate}</span>
                        <span className="text-[10px] text-slate-400">→ {v.departureDate}</span>
                      </td>

                      <td className="p-3.5">
                        <span className="font-mono text-slate-700 dark:text-slate-300 block">{v.passportExpiryDate}</span>
                        {v.isPassportValid180DaysPostDeparture ? (
                          <span className="text-[10px] font-bold text-emerald-600">✓ &gt;180d Post-Stay</span>
                        ) : (
                          <span className="text-[10px] font-bold text-rose-600">⚠ &lt;180d Post-Stay</span>
                        )}
                      </td>

                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          v.verificationStatus === 'VERIFIED_HUMAN'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : v.verificationStatus === 'NOT_REQUIRED'
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : v.verificationStatus === 'BLOCKED'
                            ? 'bg-rose-50 text-rose-800 border-rose-300'
                            : 'bg-amber-50 text-amber-800 border-amber-300'
                        }`}>
                          {v.verificationStatus.replace(/_/g, ' ')}
                        </span>
                        {v.humanVerifierName && (
                          <span className="block text-[10px] text-slate-400 mt-0.5">
                            By {v.humanVerifierName} ({v.humanVerifierRole})
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => {
                            setVerifyingVisa(v);
                            setVerificationNotes(v.verificationNotes || '');
                          }}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-[10px]"
                        >
                          Audit Sign-off
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Clock Pause Modal */}
      {pauseCaseId && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in"
        >
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Statutory Pause on Case Clock (REQ-078)
            </h3>
            <p className="text-xs text-slate-500">
              Pausing the clock requires a formal documented justification. Paused time is subtracted from statutory escalation deadlines.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Pause Reason</label>
                <select
                  value={pauseReason}
                  onChange={(e) => setPauseReason(e.target.value as PauseReason)}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="DOCUMENT_SUBMISSION_WINDOW">Waiting on External Evidence / Document Submission</option>
                  <option value="DISPUTE_COMMITTEE_REVIEW">Dispute Committee Review (Local / ECB)</option>
                  <option value="EP_COMMUNICATION_DELAY">EP Communication Delay</option>
                  <option value="MEDICAL_HOLD">Medical Hold</option>
                  <option value="POLICE_LEGAL_INVESTIGATION">Police / Legal Investigation</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Detailed Operational Notes *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain why this pause is required..."
                  value={pauseNotes}
                  onChange={(e) => setPauseNotes(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPauseCaseId(null)}
                  className="px-3 py-1.5 rounded-lg border text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPause}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-600 text-white font-bold hover:bg-amber-700"
                >
                  Confirm Clock Pause
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Annex 2 Liability Calculator Modal */}
      {selectedCaseForCalc && calcReport && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in"
        >
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Annex 2 Financial Compensation Estimate
                </h3>
                <p className="text-xs text-slate-400">
                  {calcReport.caseId} • {calcReport.epName}
                </p>
              </div>
              <button onClick={() => setSelectedCaseForCalc(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Exchange Duration:</span>
                  <span className="font-semibold">{calcReport.completedDays} / {calcReport.exchangeDurationDays} days ({calcReport.completionPercentage}%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">&gt;70% Dismissal Threshold:</span>
                  <span className={`font-semibold ${calcReport.isPast70PercentDismissalThreshold ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {calcReport.isPast70PercentDismissalThreshold ? 'Yes (50% reduction applies)' : 'No (Full entitlement)'}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Line Items</span>
                {calcReport.lineItems.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 flex items-start justify-between">
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block text-[11px]">{item.description}</span>
                      <span className="text-[10px] font-mono text-slate-400">{item.statutoryReference}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900 dark:text-white shrink-0 ml-2">
                      {item.amountMad} MAD
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg flex items-center justify-between text-xs">
                <span className="font-bold text-rose-900 dark:text-rose-200">Total Draft Liability:</span>
                <span className="text-base font-mono font-bold text-rose-600">
                  {calcReport.totalDraftCompensationMad} MAD
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedCaseForCalc(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  alert(`Annex 2 draft liability of ${calcReport.totalDraftCompensationMad} MAD recorded in case dossier and forwarded to AFPM finance ledger.`);
                  setSelectedCaseForCalc(null);
                }}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white shadow-sm"
              >
                File into Dossier & Ledger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Human Visa Audit Sign-off Modal */}
      {verifyingVisa && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in"
        >
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Human Visa Travel Clearance Sign-off
                </h3>
                <p className="text-xs text-slate-400">
                  {verifyingVisa.epName} • {verifyingVisa.nationalityCountry} ({verifyingVisa.moroccanRegime})
                </p>
              </div>
              <button onClick={() => setVerifyingVisa(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Verifier Name *</label>
                <input
                  type="text"
                  required
                  value={verifierName}
                  onChange={(e) => setVerifierName(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Verifier Role *</label>
                <input
                  type="text"
                  required
                  value={verifierRole}
                  onChange={(e) => setVerifierRole(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Audit Verification Notes *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Record consular verification receipt, eVisa confirmation number, or exemption details..."
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-[11px] text-blue-800 dark:text-blue-300">
                Official Source: <a href={verifyingVisa.officialSourceUrl} target="_blank" rel="noreferrer" className="underline font-bold">{verifyingVisa.officialSourceUrl}</a>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => handleVerifyVisaSubmit('BLOCKED')}
                  className="px-3 py-1.5 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50"
                >
                  Block Travel
                </button>
                <button
                  type="button"
                  onClick={() => handleVerifyVisaSubmit('VERIFIED_HUMAN')}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Confirm & Clear for Travel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
