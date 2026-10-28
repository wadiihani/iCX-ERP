/**
 * Quality Case Management, Statutory Stage Clocks & Evidence Dossier Engine
 * Statutory References: AEPP Annex 2 (Dispute Resolution), Annex 9 (Appeals), REQ-076..079, REQ-082, AUTO-029, TEST-072..074
 * Jurisdiction: AIESEC in Rabat (LC Rabat, MC Morocco)
 */

import { createHash } from 'node:crypto';
import type {
  CaseClassification,
  CaseStage,
  CaseStatus,
  PauseReason,
  CasePauseInterval,
  CaseResolution,
  QualityCaseRecord,
  StageClockEvaluation,
  TimelineEvent,
  CaseDossier,
} from '../types/quality-cases';

export const STAGE_LIMITS_HOURS: Record<CaseStage, number> = {
  STAGE_1_LC_DIRECT: 72, // 72 hours (3 days)
  STAGE_2_ECB_MEDIATION: 336, // 14 days
  STAGE_3_ICB_ARBITRATION: 720, // 30 days
};

/**
 * Creates a new statutory quality case record (SM-06).
 */
export function createQualityCase(params: {
  lcId: string;
  applicationId: string;
  epId: string;
  epName: string;
  homeLc: string;
  classification: CaseClassification;
  description: string;
  disputedStandards?: number[];
  timestamp?: string;
}): QualityCaseRecord {
  const now = params.timestamp || new Date().toISOString();
  const caseId = `case_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const caseNumber = `CASE-${new Date(now).getFullYear()}-RABAT-${Math.floor(100 + Math.random() * 900)}`;

  return {
    id: caseId,
    caseNumber,
    lcId: params.lcId,
    applicationId: params.applicationId,
    epId: params.epId,
    epName: params.epName,
    homeLc: params.homeLc,
    classification: params.classification,
    stage: 'STAGE_1_LC_DIRECT',
    status: 'SUBMITTED',
    openedAt: now,
    stageStartedAt: now,
    isClockPaused: false,
    pauseIntervals: [],
    disputedStandards: params.disputedStandards || [],
    description: params.description,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * REQ-077, AUTO-029 & TEST-072: Evaluates 3-Stage Statutory Escalation Clock.
 * Correctly accounts for accumulated paused time so that legal holds do not penalize the clock.
 */
export function evaluateStageClock(
  caseRecord: QualityCaseRecord,
  currentTime: Date = new Date()
): StageClockEvaluation {
  const clockLimitHours = STAGE_LIMITS_HOURS[caseRecord.stage];
  const stageStartMs = new Date(caseRecord.stageStartedAt).getTime();
  const currentMs = currentTime.getTime();

  // Gross elapsed hours since stage started
  const grossElapsedHours = Math.max(0, (currentMs - stageStartMs) / (1000 * 3600));

  // Compute total accumulated paused hours
  let accumulatedPausedHours = 0;
  for (const interval of caseRecord.pauseIntervals) {
    const pauseStartMs = new Date(interval.pausedAt).getTime();
    if (interval.resumedAt) {
      const resumeMs = new Date(interval.resumedAt).getTime();
      accumulatedPausedHours += Math.max(0, (resumeMs - pauseStartMs) / (1000 * 3600));
    } else {
      // Currently paused
      accumulatedPausedHours += Math.max(0, (currentMs - pauseStartMs) / (1000 * 3600));
    }
  }

  // Effective elapsed time deducting statutory pause intervals
  const effectiveElapsedHours = Math.max(0, grossElapsedHours - accumulatedPausedHours);
  const remainingHours = Math.max(0, clockLimitHours - effectiveElapsedHours);
  const isBreached = effectiveElapsedHours > clockLimitHours;

  // Urgency threshold: 12h for Stage 1, 48h for Stages 2/3
  const warningThreshold = caseRecord.stage === 'STAGE_1_LC_DIRECT' ? 12 : 48;
  let urgencyStatus: StageClockEvaluation['urgencyStatus'] = 'NORMAL';
  if (isBreached) {
    urgencyStatus = 'BREACHED';
  } else if (remainingHours <= warningThreshold) {
    urgencyStatus = 'APPROACHING_DEADLINE';
  }

  return {
    caseId: caseRecord.id,
    stage: caseRecord.stage,
    clockLimitHours,
    grossElapsedHours: Number(grossElapsedHours.toFixed(2)),
    accumulatedPausedHours: Number(accumulatedPausedHours.toFixed(2)),
    effectiveElapsedHours: Number(effectiveElapsedHours.toFixed(2)),
    remainingHours: Number(remainingHours.toFixed(2)),
    isBreached,
    isPaused: caseRecord.isClockPaused,
    urgencyStatus,
  };
}

/**
 * REQ-078 & TEST-073: Pauses the active statutory case clock.
 * Requires documented reason and operational notes. Emits audit trail.
 */
export function pauseCaseClock(
  caseRecord: QualityCaseRecord,
  params: {
    reason: PauseReason;
    notes: string;
    userId: string;
    timestamp?: string;
  }
): QualityCaseRecord {
  if (caseRecord.isClockPaused) {
    throw new Error(`Clock for case ${caseRecord.caseNumber} is already paused.`);
  }

  if (!params.notes || params.notes.trim().length < 5) {
    throw new Error('Statutory requirement REQ-078: Pausing case clock requires documented notes.');
  }

  const now = params.timestamp || new Date().toISOString();
  const newInterval: CasePauseInterval = {
    id: `pause_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    pausedAt: now,
    reason: params.reason,
    notes: params.notes.trim(),
    pausedByUserId: params.userId,
  };

  return {
    ...caseRecord,
    isClockPaused: true,
    pauseIntervals: [...caseRecord.pauseIntervals, newInterval],
    updatedAt: now,
  };
}

/**
 * REQ-078 & TEST-073: Resumes the paused statutory case clock.
 */
export function resumeCaseClock(
  caseRecord: QualityCaseRecord,
  params: {
    userId: string;
    timestamp?: string;
  }
): QualityCaseRecord {
  if (!caseRecord.isClockPaused) {
    throw new Error(`Clock for case ${caseRecord.caseNumber} is not paused.`);
  }

  const now = params.timestamp || new Date().toISOString();
  const updatedIntervals = caseRecord.pauseIntervals.map((interval, idx) => {
    if (idx === caseRecord.pauseIntervals.length - 1 && !interval.resumedAt) {
      return {
        ...interval,
        resumedAt: now,
        resumedByUserId: params.userId,
      };
    }
    return interval;
  });

  return {
    ...caseRecord,
    isClockPaused: false,
    pauseIntervals: updatedIntervals,
    updatedAt: now,
  };
}

/**
 * Transitions case lifecycle state (SM-06).
 */
export function transitionCaseStatus(
  caseRecord: QualityCaseRecord,
  newStatus: CaseStatus,
  timestamp?: string
): QualityCaseRecord {
  const now = timestamp || new Date().toISOString();
  return {
    ...caseRecord,
    status: newStatus,
    updatedAt: now,
  };
}

/**
 * Escalate case to next statutory stage (e.g. Stage 1 -> Stage 2 ECB).
 * Resets the active stage clock for the new jurisdiction.
 */
export function escalateCase(
  caseRecord: QualityCaseRecord,
  targetStage: CaseStage,
  escalatorUserId: string,
  timestamp?: string
): QualityCaseRecord {
  const now = timestamp || new Date().toISOString();

  // If clock was paused, close current pause interval upon escalation
  let intervals = caseRecord.pauseIntervals;
  if (caseRecord.isClockPaused && intervals.length > 0) {
    intervals = intervals.map((inv, idx) =>
      idx === intervals.length - 1 && !inv.resumedAt
        ? { ...inv, resumedAt: now, resumedByUserId: escalatorUserId }
        : inv
    );
  }

  return {
    ...caseRecord,
    stage: targetStage,
    status: 'ESCALATED',
    stageStartedAt: now,
    isClockPaused: false,
    pauseIntervals: intervals,
    updatedAt: now,
  };
}

/**
 * REQ-079 & TEST-074: Compiles an exportable, tamper-evident Case Evidence Dossier.
 * Produces cryptographic SHA-256 digest over the dossier content.
 */
export function compileCaseDossier(
  caseRecord: QualityCaseRecord,
  compiledBy: string,
  timelineEvents: TimelineEvent[] = [],
  currentTime?: Date
): CaseDossier {
  const now = currentTime ? currentTime.toISOString() : new Date().toISOString();
  const dossierId = `DOSSIER_${caseRecord.caseNumber}_${Date.now()}`;
  const clockEvaluation = evaluateStageClock(caseRecord, currentTime);

  const payload = JSON.stringify({
    dossierId,
    caseId: caseRecord.id,
    caseNumber: caseRecord.caseNumber,
    classification: caseRecord.classification,
    stage: caseRecord.stage,
    status: caseRecord.status,
    description: caseRecord.description,
    clockEvaluation,
    pauseIntervals: caseRecord.pauseIntervals,
    timelineEvents,
    compiledAt: now,
    compiledBy,
  });

  const dossierHash = createHash('sha256').update(payload).digest('hex');

  return {
    dossierId,
    caseId: caseRecord.id,
    compiledAt: now,
    compiledBy,
    caseRecord,
    clockEvaluation,
    timelineEvents,
    dossierHash,
  };
}
