import { describe, it, expect } from 'vitest';
import {
  generateTouchpointSchedule,
  logTouchpointCompletion,
  validateDay1AccompanimentProof,
  evaluateUnreachableEpProtocol,
  createComplaintIntake,
  acknowledgeComplaint,
} from '../src/lib/care/touchpoints-and-care-engine';
import { Day1AccompanimentProof } from '../src/lib/types/touchpoints-and-care';

describe('Plan 03-04: Standard #17 Touchpoints, Day-1 Accompaniment, Unreachable EP & Complaints', () => {
  // =========================================================================
  // TEST-066: Standard #17 Regular Touchpoint Cadence & Mood Radar (REQ-069)
  // =========================================================================
  describe('TEST-066: Standard #17 Regular Touchpoints (REQ-069, AUTO-022)', () => {
    it('generates bi-weekly touchpoint schedule for 6-week iGV projects (Days 14, 28, 42)', () => {
      const schedule = generateTouchpointSchedule('APP-GV-001', 'iGV', '2026-10-01', 6);
      expect(schedule).toHaveLength(3);

      expect(schedule[0].touchpointNumber).toBe(1);
      expect(schedule[0].scheduledDate).toBe('2026-10-15'); // Day 14
      expect(schedule[0].touchpointType).toBe('BIWEEKLY_TOUCHPOINT');

      expect(schedule[1].touchpointNumber).toBe(2);
      expect(schedule[1].scheduledDate).toBe('2026-10-29'); // Day 28

      expect(schedule[2].touchpointNumber).toBe(3);
      expect(schedule[2].scheduledDate).toBe('2026-11-12'); // Day 42
    });

    it('generates monthly touchpoint schedule for iGTa/iGTe professional internships', () => {
      const schedule = generateTouchpointSchedule('APP-GT-001', 'iGTa', '2026-10-01', 24); // 6 months (~168 days)
      expect(schedule).toHaveLength(5); // Days 30, 60, 90, 120, 150
      expect(schedule[0].scheduledDate).toBe('2026-10-31'); // Day 30
      expect(schedule[0].touchpointType).toBe('MONTHLY_TOUCHPOINT');
    });

    it('logs touchpoint with normal mood score (4/5) and compliant working hours', () => {
      const schedule = generateTouchpointSchedule('APP-GV-001', 'iGV', '2026-10-01', 6);
      const tp1 = schedule[0];

      const completed = logTouchpointCompletion(tp1, {
        conductedByUserId: 'user-manager-youssef',
        epMoodScore: 4,
        hoursCompliance: true,
        notes: 'Volunteer is very happy with project team and host family in Agdal.',
      });

      expect(completed.completedAt).toBeDefined();
      expect(completed.epMoodScore).toBe(4);
      expect(completed.hoursCompliance).toBe(true);
      expect(completed.escalatedToCase).toBe(false);
    });

    it('automatically escalates touchpoint to case review when mood score is <= 2', () => {
      const schedule = generateTouchpointSchedule('APP-GV-001', 'iGV', '2026-10-01', 6);
      const tp2 = schedule[1];

      const distressed = logTouchpointCompletion(tp2, {
        conductedByUserId: 'user-manager-youssef',
        epMoodScore: 2, // Low mood!
        hoursCompliance: true,
        notes: 'Volunteer feels isolated and reported language barrier at NGO site.',
      });

      expect(distressed.epMoodScore).toBe(2);
      expect(distressed.escalatedToCase).toBe(true);
    });

    it('automatically escalates touchpoint when working hours are non-compliant (>40h or <25h)', () => {
      const schedule = generateTouchpointSchedule('APP-GV-001', 'iGV', '2026-10-01', 6);
      const tp1 = schedule[0];

      const nonCompliant = logTouchpointCompletion(tp1, {
        conductedByUserId: 'user-manager-youssef',
        epMoodScore: 4,
        hoursCompliance: false, // Hours breach!
        notes: 'Host asked volunteer to work over 48 hours this week.',
      });

      expect(nonCompliant.hoursCompliance).toBe(false);
      expect(nonCompliant.escalatedToCase).toBe(true);
    });
  });

  // =========================================================================
  // TEST-068: Day-1 Work Accompaniment Gatekeeper (REQ-071, Standard #9)
  // =========================================================================
  describe('TEST-068: Day-1 Work Accompaniment Gatekeeper (REQ-071, Standard #9)', () => {
    const validProof: Day1AccompanimentProof = {
      applicationId: 'APP-RABAT-2026-501',
      accompaniedByUserId: 'user-buddy-mehdi',
      accompaniedByUserName: 'Mehdi Benkaddour',
      opportunityPartnerName: 'Fondation Mohammed V pour la Solidarité',
      workplaceAddress: 'Avenue Annakhil, Hay Riad, Rabat',
      accompaniedAt: '2026-10-26T09:00:00Z',
      proofDocumentId: 'doc-day1-photo-checkin-001',
      supervisorSignatureName: 'Mme. Nadia El Amrani (Directrice)',
      notes: 'Volunteer introduced to project team and desk allocated.',
    };

    it('grants DAY1_DONE status when all mandatory accompaniment proofs are verified', () => {
      const validation = validateDay1AccompanimentProof(validProof);
      expect(validation.isValid).toBe(true);
      expect(validation.verifiedStatus).toBe('DAY1_DONE');
      expect(validation.error).toBeUndefined();
    });

    it('strictly blocks DAY1_DONE if workplace check-in proof document is missing', () => {
      const missingDoc = { ...validProof, proofDocumentId: '' };
      const validation = validateDay1AccompanimentProof(missingDoc);

      expect(validation.isValid).toBe(false);
      expect(validation.error).toContain('Statutory Violation REQ-071 (TEST-068)');
      expect(validation.error).toContain('workplace check-in evidence document');
    });

    it('strictly blocks DAY1_DONE if supervisor signature is missing', () => {
      const missingSig = { ...validProof, supervisorSignatureName: '' };
      const validation = validateDay1AccompanimentProof(missingSig);

      expect(validation.isValid).toBe(false);
      expect(validation.error).toContain('supervisor signature');
    });

    it('strictly blocks DAY1_DONE if host representative ID is missing', () => {
      const missingBuddy = { ...validProof, accompaniedByUserId: '' };
      const validation = validateDay1AccompanimentProof(missingBuddy);

      expect(validation.isValid).toBe(false);
      expect(validation.error).toContain('host representative ID');
    });
  });

  // =========================================================================
  // TEST-067: 2-Working-Day Unreachable EP Safety Protocol (REQ-070, AUTO-023)
  // =========================================================================
  describe('TEST-067: 2-Working-Day Unreachable EP Protocol (REQ-070, AUTO-023)', () => {
    it('remains calm when EP was contacted within last 24 business hours', () => {
      // Last contact: Monday 2026-10-26 at 09:00. Now: Monday at 17:00 (8 business hours)
      const lastContact = '2026-10-26T09:00:00Z';
      const now = new Date('2026-10-26T17:00:00Z');

      const status = evaluateUnreachableEpProtocol({
        applicationId: 'APP-RABAT-901',
        epName: 'Elena Rostova',
        lastContactAt: lastContact,
        currentDate: now,
      });

      expect(status.isCrisisAlertActive).toBe(false);
      expect(status.businessHoursElapsed).toBe(8);
      expect(status.alertNotice).toBeUndefined();
    });

    it('engages Critical Safety Alert AUTO-023 when EP is idle for >= 48 business hours', () => {
      // Last contact: Monday 2026-10-26 at 09:00.
      // 48 business hours later = Wednesday 2026-10-28 at 09:00
      const lastContact = '2026-10-26T09:00:00Z';
      const now = new Date('2026-10-28T09:00:00Z');

      const status = evaluateUnreachableEpProtocol({
        applicationId: 'APP-RABAT-901',
        epName: 'Elena Rostova',
        lastContactAt: lastContact,
        currentDate: now,
      });

      expect(status.isCrisisAlertActive).toBe(true);
      expect(status.businessHoursElapsed).toBe(48);
      expect(status.alertNotice).toContain('CRITICAL SAFETY ALERT AUTO-023 (TEST-067)');
      expect(status.alertNotice).toContain('24h crisis report timer engaged');
      expect(status.isCrisisReportOverdue).toBe(false);
    });

    it('flags crisis report as OVERDUE when idle reaches >= 72 business hours (48h + 24h)', () => {
      // Last contact: Monday at 09:00. Now: Thursday at 09:00 (72 business hours)
      const lastContact = '2026-10-26T09:00:00Z';
      const now = new Date('2026-10-29T09:00:00Z');

      const status = evaluateUnreachableEpProtocol({
        applicationId: 'APP-RABAT-901',
        epName: 'Elena Rostova',
        lastContactAt: lastContact,
        currentDate: now,
      });

      expect(status.isCrisisAlertActive).toBe(true);
      expect(status.businessHoursElapsed).toBe(72);
      expect(status.isCrisisReportOverdue).toBe(true);
    });

    it('skips weekends when computing unreachable business hours', () => {
      // Friday 2026-10-30 at 12:00.
      // Saturday (31st) and Sunday (1st) are skipped!
      // Monday 2026-11-02 at 12:00 = 24 business hours elapsed (not 72 real hours)
      const fridayNoon = '2026-10-30T12:00:00Z';
      const mondayNoon = new Date('2026-11-02T12:00:00Z');

      const status = evaluateUnreachableEpProtocol({
        applicationId: 'APP-RABAT-901',
        epName: 'Elena Rostova',
        lastContactAt: fridayNoon,
        currentDate: mondayNoon,
      });

      expect(status.businessHoursElapsed).toBe(24);
      expect(status.isCrisisAlertActive).toBe(false); // Only 24h, not 48h!
    });
  });

  // =========================================================================
  // TEST-071: Documented EP Complaint Intake Channel (REQ-075)
  // =========================================================================
  describe('TEST-071: Documented EP Complaint Intake Channel (REQ-075)', () => {
    it('sets exactly 24 Moroccan business hours acknowledgment SLA deadline', () => {
      // Intake: Monday 2026-10-26 at 10:00
      const intakeDate = new Date('2026-10-26T10:00:00Z');
      const complaint = createComplaintIntake({
        applicationId: 'APP-RABAT-601',
        complainantName: 'Camilla Valenti',
        complainantRole: 'EP',
        category: 'ACCOMMODATION_SUBSTANDARD',
        description: 'Water heater in Agdal apartment stopped functioning.',
        intakeDate,
      });

      expect(complaint.status).toBe('RECEIVED_PENDING_ACK');
      // Tuesday 10:00 (24h later)
      expect(complaint.ackDeadlineIso).toBe('2026-10-27T10:00:00.000Z');
    });

    it('skips weekend when intake is received on Friday', () => {
      // Intake: Friday 2026-10-30 at 14:00.
      // Saturday & Sunday skipped -> deadline is Monday 2026-11-02 at 14:00
      const fridayIntake = new Date('2026-10-30T14:00:00Z');
      const complaint = createComplaintIntake({
        applicationId: 'APP-RABAT-602',
        complainantName: 'Lucas Dubois',
        complainantRole: 'EP',
        category: 'JD_HOURS_MISMATCH',
        description: 'Host requested 50 hours/week.',
        intakeDate: fridayIntake,
      });

      expect(complaint.ackDeadlineIso).toBe('2026-11-02T14:00:00.000Z');
    });

    it('acknowledges complaint within SLA deadline and assigns responsible officer', () => {
      const intakeDate = new Date('2026-10-26T10:00:00Z');
      const complaint = createComplaintIntake({
        applicationId: 'APP-RABAT-601',
        complainantName: 'Camilla Valenti',
        complainantRole: 'EP',
        category: 'ACCOMMODATION_SUBSTANDARD',
        description: 'Water heater issue',
        intakeDate,
      });

      // Acknowledged 4 hours later (within 24h deadline)
      const ackDate = new Date('2026-10-26T14:00:00Z');
      const result = acknowledgeComplaint(
        complaint,
        'user-officer-youssef',
        ackDate,
        'Plumber scheduled to visit tomorrow at 10:00.'
      );

      expect(result.isWithinSla).toBe(true);
      expect(result.complaint.status).toBe('ACKNOWLEDGED');
      expect(result.complaint.assignedOfficerUserId).toBe('user-officer-youssef');
      expect(result.complaint.resolutionNotes).toContain('Plumber scheduled');
    });

    it('flags acknowledgment as breached SLA if acknowledged past 24 business hours', () => {
      const intakeDate = new Date('2026-10-26T10:00:00Z');
      const complaint = createComplaintIntake({
        applicationId: 'APP-RABAT-601',
        complainantName: 'Camilla Valenti',
        complainantRole: 'EP',
        category: 'ACCOMMODATION_SUBSTANDARD',
        description: 'Water heater issue',
        intakeDate,
      });

      // Acknowledged 36 business hours later (BREACHED!)
      const ackDate = new Date('2026-10-27T22:00:00Z');
      const result = acknowledgeComplaint(complaint, 'user-officer-youssef', ackDate);

      expect(result.isWithinSla).toBe(false);
    });
  });
});
