/**
 * Quality Case Management, Statutory Stage Clocks & Evidence Dossier Test Suite
 * Statutory References: AEPP Annex 2 (Dispute Resolution), Annex 9 (Appeals), REQ-076..079, REQ-082, AUTO-029, TEST-072..074
 * Jurisdiction: AIESEC in Rabat (LC Rabat, MC Morocco)
 */

import { describe, it, expect } from 'vitest';
import {
  createQualityCase,
  evaluateStageClock,
  pauseCaseClock,
  resumeCaseClock,
  transitionCaseStatus,
  escalateCase,
  compileCaseDossier,
  STAGE_LIMITS_HOURS,
} from '../src/lib/cases/quality-case-engine';

describe('Plan 05-01: Quality Cases, Stage Clocks & Dossier Compiler Suite', () => {
  describe('REQ-076 & SM-06: Case Creation & Lifecycle Transitions', () => {
    it('initializes a quality case in STAGE_1_LC_DIRECT with SUBMITTED status', () => {
      const qCase = createQualityCase({
        lcId: 'lc_rabat',
        applicationId: 'app_sofia_01',
        epId: 'ep_sofia',
        epName: 'Sofia Rossi',
        homeLc: 'AIESEC in Milan',
        classification: 'STANDARDS_BREACH',
        description: 'Opportunity job description differs from delivered workplace tasks.',
        disputedStandards: [9, 10], // Standards #9 and #10
        timestamp: '2026-03-01T10:00:00Z',
      });

      expect(qCase.caseNumber).toContain('CASE-2026-RABAT-');
      expect(qCase.stage).toBe('STAGE_1_LC_DIRECT');
      expect(qCase.status).toBe('SUBMITTED');
      expect(qCase.isClockPaused).toBe(false);
      expect(qCase.disputedStandards).toEqual([9, 10]);
    });

    it('transitions through investigation and resolution states', () => {
      let qCase = createQualityCase({
        lcId: 'lc_rabat',
        applicationId: 'app_lucas_01',
        epId: 'ep_lucas',
        epName: 'Lucas Silva',
        homeLc: 'AIESEC in Curitiba',
        classification: 'ACCOMMODATION_SAFETY',
        description: 'Hot water failure in Agdal apartment.',
      });

      qCase = transitionCaseStatus(qCase, 'UNDER_INVESTIGATION');
      expect(qCase.status).toBe('UNDER_INVESTIGATION');

      qCase = transitionCaseStatus(qCase, 'RESOLUTION_PROPOSED');
      expect(qCase.status).toBe('RESOLUTION_PROPOSED');

      qCase = transitionCaseStatus(qCase, 'RESOLVED');
      expect(qCase.status).toBe('RESOLVED');
    });
  });

  describe('REQ-077, AUTO-029 & TEST-072: 3-Stage Statutory Escalation Clocks', () => {
    it('accurately evaluates Stage 1 clock with 72 hours limit', () => {
      const startTime = new Date('2026-03-01T10:00:00Z');
      const qCase = createQualityCase({
        lcId: 'lc_rabat',
        applicationId: 'app_01',
        epId: 'ep_01',
        epName: 'Test EP',
        homeLc: 'AIESEC in Milan',
        classification: 'PROJECT_MISMATCH',
        description: 'Scope discrepancy',
        timestamp: startTime.toISOString(),
      });

      // After 24 hours
      const eval24h = evaluateStageClock(qCase, new Date('2026-03-02T10:00:00Z'));
      expect(eval24h.clockLimitHours).toBe(72);
      expect(eval24h.grossElapsedHours).toBe(24);
      expect(eval24h.remainingHours).toBe(48);
      expect(eval24h.isBreached).toBe(false);
      expect(eval24h.urgencyStatus).toBe('NORMAL');

      // After 65 hours (remaining = 7h <= 12h threshold)
      const eval65h = evaluateStageClock(qCase, new Date('2026-03-04T03:00:00Z'));
      expect(eval65h.remainingHours).toBe(7);
      expect(eval65h.isBreached).toBe(false);
      expect(eval65h.urgencyStatus).toBe('APPROACHING_DEADLINE');

      // After 75 hours (breached limit)
      const eval75h = evaluateStageClock(qCase, new Date('2026-03-04T13:00:00Z'));
      expect(eval75h.isBreached).toBe(true);
      expect(eval75h.remainingHours).toBe(0);
      expect(eval75h.urgencyStatus).toBe('BREACHED');
    });

    it('escalates to Stage 2 (ECB Mediation) and resets clock to 14 days (336 hours)', () => {
      const startTime = new Date('2026-03-01T10:00:00Z');
      let qCase = createQualityCase({
        lcId: 'lc_rabat',
        applicationId: 'app_01',
        epId: 'ep_01',
        epName: 'Test EP',
        homeLc: 'AIESEC in Milan',
        classification: 'PROJECT_MISMATCH',
        description: 'LC-to-LC direct negotiations stalled.',
        timestamp: startTime.toISOString(),
      });

      // Escalate to Stage 2 at 70 hours
      const escalationTime = new Date('2026-03-04T08:00:00Z');
      qCase = escalateCase(qCase, 'STAGE_2_ECB_MEDIATION', 'usr_lcvp_01', escalationTime.toISOString());

      expect(qCase.stage).toBe('STAGE_2_ECB_MEDIATION');
      expect(qCase.status).toBe('ESCALATED');

      // Evaluate Stage 2 clock 48 hours into Stage 2
      const checkStage2 = evaluateStageClock(qCase, new Date('2026-03-06T08:00:00Z'));
      expect(checkStage2.clockLimitHours).toBe(336); // 14 days
      expect(checkStage2.grossElapsedHours).toBe(48);
      expect(checkStage2.remainingHours).toBe(288);
      expect(checkStage2.isBreached).toBe(false);
    });
  });

  describe('REQ-078 & TEST-073: Audited Case Clock Pause & Resume', () => {
    it('correctly deducts accumulated pause hours from effective elapsed time', () => {
      const startTime = new Date('2026-03-01T10:00:00Z');
      let qCase = createQualityCase({
        lcId: 'lc_rabat',
        applicationId: 'app_01',
        epId: 'ep_01',
        epName: 'Test EP',
        homeLc: 'AIESEC in Milan',
        classification: 'EMERGENCY_HEALTH',
        description: 'EP hospitalized, awaiting medical certificate.',
        timestamp: startTime.toISOString(),
      });

      // Pause clock at T+20h for 30 hours
      const pauseTime = new Date('2026-03-02T06:00:00Z'); // 20h gross
      qCase = pauseCaseClock(qCase, {
        reason: 'MEDICAL_HOLD',
        notes: 'EP admitted to Cheikh Zayd Hospital Rabat for acute evaluation.',
        userId: 'usr_cxp_01',
        timestamp: pauseTime.toISOString(),
      });
      expect(qCase.isClockPaused).toBe(true);

      // Resume clock at T+50h (paused for 30h)
      const resumeTime = new Date('2026-03-03T12:00:00Z'); // 50h gross, 30h pause
      qCase = resumeCaseClock(qCase, {
        userId: 'usr_cxp_01',
        timestamp: resumeTime.toISOString(),
      });
      expect(qCase.isClockPaused).toBe(false);

      // Evaluate clock at T+80h gross
      // Gross = 80h. Paused = 30h. Effective = 50h.
      // Clock limit = 72h. Remaining = 22h. Not breached!
      const currentEvalTime = new Date('2026-03-04T18:00:00Z');
      const evalResult = evaluateStageClock(qCase, currentEvalTime);

      expect(evalResult.grossElapsedHours).toBe(80);
      expect(evalResult.accumulatedPausedHours).toBe(30);
      expect(evalResult.effectiveElapsedHours).toBe(50);
      expect(evalResult.remainingHours).toBe(22);
      expect(evalResult.isBreached).toBe(false); // Saved from false breach by pause tracking
    });

    it('rejects pause without documented notes', () => {
      const qCase = createQualityCase({
        lcId: 'lc_rabat',
        applicationId: 'app_01',
        epId: 'ep_01',
        epName: 'Test EP',
        homeLc: 'AIESEC in Milan',
        classification: 'STANDARDS_BREACH',
        description: 'Test case',
      });

      expect(() =>
        pauseCaseClock(qCase, {
          reason: 'EP_COMMUNICATION_DELAY',
          notes: '', // Empty notes
          userId: 'usr_01',
        })
      ).toThrow('REQ-078');
    });

    it('prevents pausing an already paused clock', () => {
      let qCase = createQualityCase({
        lcId: 'lc_rabat',
        applicationId: 'app_01',
        epId: 'ep_01',
        epName: 'Test EP',
        homeLc: 'AIESEC in Milan',
        classification: 'STANDARDS_BREACH',
        description: 'Test case',
      });

      qCase = pauseCaseClock(qCase, {
        reason: 'DISPUTE_COMMITTEE_REVIEW',
        notes: 'Committee review scheduled.',
        userId: 'usr_01',
      });

      expect(() =>
        pauseCaseClock(qCase, {
          reason: 'DOCUMENT_SUBMISSION_WINDOW',
          notes: 'Another hold.',
          userId: 'usr_01',
        })
      ).toThrow('already paused');
    });
  });

  describe('REQ-079 & TEST-074: Exportable Evidence Dossier Compiler', () => {
    it('compiles a complete evidence dossier with cryptographic SHA-256 digest', () => {
      const qCase = createQualityCase({
        lcId: 'lc_rabat',
        applicationId: 'app_sofia_01',
        epId: 'ep_sofia',
        epName: 'Sofia Rossi',
        homeLc: 'AIESEC in Milan',
        classification: 'STANDARDS_BREACH',
        description: 'Standard #9 (Host Opportunity Mentor) not reconfirmed prior to arrival.',
        disputedStandards: [9],
      });

      const timelineEvents = [
        {
          timestamp: '2026-03-01T10:00:00Z',
          title: 'Case Lodged',
          actor: 'Sofia Rossi (EP)',
          details: 'Official complaint lodged via EP Portal.',
        },
        {
          timestamp: '2026-03-01T14:00:00Z',
          title: 'Direct Negotiation Initiated',
          actor: 'Youssef El Amrani (LCVP iCX Rabat)',
          details: 'Dispatched notification to AIESEC in Milan VP iGV.',
        },
      ];

      const dossier = compileCaseDossier(qCase, 'Youssef El Amrani', timelineEvents);

      expect(dossier.dossierId).toContain('DOSSIER_CASE-');
      expect(dossier.caseId).toBe(qCase.id);
      expect(dossier.compiledBy).toBe('Youssef El Amrani');
      expect(dossier.timelineEvents.length).toBe(2);
      expect(dossier.dossierHash).toHaveLength(64); // Valid SHA-256 hex string
      expect(dossier.clockEvaluation.clockLimitHours).toBe(72);
    });
  });
});
