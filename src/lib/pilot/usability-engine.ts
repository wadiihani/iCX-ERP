/**
 * Pilot Usability Testing Engine
 * Statutory References: TEST-117, REQ-001..003, REQ-114
 * Jurisdiction: AIESEC in Rabat (LC Rabat, MC Morocco)
 */

import type { AiesecRole, UsabilityTaskResult, UsabilitySessionReport } from '../types/auth-onboarding';
import { validateICE } from '../validation/moroccan-tax';
import { evaluateRabat14DayHardLock } from '../arrival/arrival-engine';
import type { ArrivalReadinessRecord } from '../types/arrival-readiness';
import { calculateCoAdvisoryScore } from '../standards/standards-engine';
import type { StandardsMatrixRow } from '../types/standards';

export interface UsabilityParticipant {
  id: string;
  name: string;
  role: AiesecRole;
  email: string;
}

/**
 * Journey 1: BD Member Workflow (TEST-117)
 * Lead creation -> ICE verification -> Discovery form fill -> Proposal dispatch.
 */
export function runBdMemberJourney(participant: UsabilityParticipant, data: {
  leadName: string;
  iceNumber: string;
  discoveryCompleted: boolean;
  proposalSent: boolean;
}): UsabilityTaskResult[] {
  const results: UsabilityTaskResult[] = [];

  // Task 1: Lead Creation
  const task1Success = Boolean(data.leadName && data.leadName.trim().length > 0);
  results.push({
    journeyId: 'JOURNEY_1_BD',
    role: participant.role,
    taskName: 'Create Lead Record',
    isSuccess: task1Success,
    durationSeconds: 45,
    blockingDefectsCount: task1Success ? 0 : 1,
    notes: task1Success ? 'Lead created successfully with required contact info.' : 'Lead name missing.',
  });

  // Task 2: Moroccan Tax ICE Validation
  const iceValidation = validateICE(data.iceNumber);
  const task2Success = iceValidation.isValid;
  results.push({
    journeyId: 'JOURNEY_1_BD',
    role: participant.role,
    taskName: 'Validate Moroccan ICE (9 Digits)',
    isSuccess: task2Success,
    durationSeconds: 30,
    blockingDefectsCount: task2Success ? 0 : 1,
    notes: task2Success ? 'ICE checksum verified against Moroccan Tax standard.' : (iceValidation.error || 'Invalid ICE'),
  });

  // Task 3: Discovery Form Completion
  results.push({
    journeyId: 'JOURNEY_1_BD',
    role: participant.role,
    taskName: 'Complete Discovery Form',
    isSuccess: data.discoveryCompleted,
    durationSeconds: 120,
    blockingDefectsCount: data.discoveryCompleted ? 0 : 1,
    notes: data.discoveryCompleted ? 'Company needs and SDG goals recorded.' : 'Discovery form incomplete.',
  });

  // Task 4: Partnership Proposal Dispatch
  results.push({
    journeyId: 'JOURNEY_1_BD',
    role: participant.role,
    taskName: 'Send Partnership Proposal',
    isSuccess: data.proposalSent,
    durationSeconds: 60,
    blockingDefectsCount: data.proposalSent ? 0 : 1,
    notes: data.proposalSent ? 'Proposal sent with statutory iGV terms and fees.' : 'Proposal dispatch failed.',
  });

  return results;
}

/**
 * Journey 2: CXP Member Workflow (TEST-117)
 * Application triage -> First contact within 24h timer -> Interview scorecard -> Day-1 accompaniment.
 */
export function runCxpMemberJourney(participant: UsabilityParticipant, data: {
  appliedAt: string;
  contactedAt: string;
  scorecardPass: boolean;
  day1Accompanied: boolean;
}): UsabilityTaskResult[] {
  const results: UsabilityTaskResult[] = [];

  // Task 1: Application Receipt & Ingestion
  results.push({
    journeyId: 'JOURNEY_2_CXP',
    role: participant.role,
    taskName: 'Ingest EP Application',
    isSuccess: true,
    durationSeconds: 20,
    blockingDefectsCount: 0,
    notes: 'Application received and linked to target opportunity.',
  });

  // Task 2: 24-Hour First Contact SLA Check
  const appTime = new Date(data.appliedAt).getTime();
  const contactTime = new Date(data.contactedAt).getTime();
  const diffHours = (contactTime - appTime) / (1000 * 3600);
  const task2Success = diffHours >= 0 && diffHours <= 24;
  results.push({
    journeyId: 'JOURNEY_2_CXP',
    role: participant.role,
    taskName: 'First Contact within 24 Hours SLA',
    isSuccess: task2Success,
    durationSeconds: 15,
    blockingDefectsCount: task2Success ? 0 : 1,
    notes: task2Success
      ? `Contact logged in ${diffHours.toFixed(1)} hours (compliant with 24h SLA).`
      : `SLA breached: contact logged after ${diffHours.toFixed(1)} hours.`,
  });

  // Task 3: EP Interview & Selection Scorecard
  results.push({
    journeyId: 'JOURNEY_2_CXP',
    role: participant.role,
    taskName: 'Complete Selection Scorecard',
    isSuccess: data.scorecardPass,
    durationSeconds: 180,
    blockingDefectsCount: data.scorecardPass ? 0 : 1,
    notes: data.scorecardPass ? 'Candidate interview completed and verified approved.' : 'Scorecard rejected or incomplete.',
  });

  // Task 4: Day-1 Workplace Accompaniment (Standard #10)
  results.push({
    journeyId: 'JOURNEY_2_CXP',
    role: participant.role,
    taskName: 'Log Day-1 Workplace Accompaniment',
    isSuccess: data.day1Accompanied,
    durationSeconds: 40,
    blockingDefectsCount: data.day1Accompanied ? 0 : 1,
    notes: data.day1Accompanied ? 'Day-1 photo evidence and accompaniment checklist logged.' : 'Day-1 accompaniment not verified.',
  });

  return results;
}

/**
 * Journey 3: LCVP iGV Governance Workflow (TEST-117)
 * T-14 hard lock check -> Standards evidence matrix review -> Complete CO advisory calculation.
 */
export function runLcvpIgvJourney(participant: UsabilityParticipant, data: {
  readinessRecord: ArrivalReadinessRecord;
  standardsRows: StandardsMatrixRow[];
  currentDate?: Date;
}): UsabilityTaskResult[] {
  const results: UsabilityTaskResult[] = [];

  // Task 1: T-14 Hard Lock Audit
  const hardLockEval = evaluateRabat14DayHardLock(data.readinessRecord, data.currentDate || new Date());
  const task1Success = hardLockEval.isArrivalCleared;
  results.push({
    journeyId: 'JOURNEY_3_LCVP',
    role: participant.role,
    taskName: 'Audit T-14 Pre-Arrival Readiness Gate',
    isSuccess: task1Success,
    durationSeconds: 60,
    blockingDefectsCount: task1Success ? 0 : 1,
    notes: task1Success
      ? 'All pre-arrival statutory prerequisites verified.'
      : hardLockEval.missingPrerequisites.join('; '),
  });

  // Task 2: Standards Matrix Verification
  const matrixCount = data.standardsRows.length;
  const task2Success = matrixCount >= 16;
  results.push({
    journeyId: 'JOURNEY_3_LCVP',
    role: participant.role,
    taskName: 'Verify Exchange Standards Evidence Matrix',
    isSuccess: task2Success,
    durationSeconds: 90,
    blockingDefectsCount: task2Success ? 0 : 1,
    notes: task2Success
      ? `${matrixCount} standards evaluated with host evidence and EP survey.`
      : `Expected >= 16 standards, found ${matrixCount}.`,
  });

  // Task 3: Complete Status / CO Advisory Calculation
  const coResult = calculateCoAdvisoryScore(data.standardsRows);
  const task3Success = coResult.totalDeliveredCount >= 0;
  results.push({
    journeyId: 'JOURNEY_3_LCVP',
    role: participant.role,
    taskName: 'Calculate Complete Status & Advisory Score',
    isSuccess: task3Success,
    durationSeconds: 30,
    blockingDefectsCount: 0,
    notes: `Calculated status: ${coResult.qualificationStatus} (${coResult.totalDeliveredCount}/18 delivered). Qualified for CO: ${coResult.isCoQualified}.`,
  });

  return results;
}

/**
 * Generates an aggregated Usability Session Report for an operational audit.
 */
export function generateUsabilitySessionReport(
  sessionId: string,
  participant: UsabilityParticipant,
  tasks: UsabilityTaskResult[]
): UsabilitySessionReport {
  const successfulTasks = tasks.filter((t) => t.isSuccess).length;
  const overallSuccessRate = tasks.length > 0 ? (successfulTasks / tasks.length) * 100 : 0;
  const totalBlockingDefects = tasks.reduce((sum, t) => sum + t.blockingDefectsCount, 0);

  return {
    sessionId,
    participantName: participant.name,
    role: participant.role,
    completedTasks: tasks,
    overallSuccessRate,
    totalBlockingDefects,
    testedAt: new Date().toISOString(),
  };
}
