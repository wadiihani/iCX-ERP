import { describe, it, expect, beforeEach } from 'vitest';
import {
  partnerStandardsService,
  resetPartnerStandardsDb,
  STATUTORY_PARTNER_STANDARDS,
} from '../src/lib/data-integrity/partner-standards';
import {
  getMasterTrackerDb,
  resetMasterTrackerDb,
  partnerService,
  opportunityService,
} from '../src/lib/data-integrity/master-tracker';
import { InvariantViolationError } from '../src/lib/data-integrity/invariants';

describe('Plan 04-01: Partner Standards per Opportunity & Account Management (M4)', () => {
  const actorId = 'mem-wadii-001';
  let partnerId: string;
  let opportunityId: string;

  beforeEach(() => {
    resetMasterTrackerDb();
    resetPartnerStandardsDb();

    const partner = partnerService.createPartner(
      {
        id: 'ptn-test-01',
        name: 'Atlas Green Foundation',
        tier: 'Tier 1',
        status: 'Active',
        expa_org_id: 8842,
        owner_id: actorId,
      },
      actorId
    );
    partnerId = partner.id;

    const opp = opportunityService.createOpportunity(
      {
        id: 'opp-partner-std-01',
        partner_id: partnerId,
        title: 'Environmental Educator iGV',
        programme: 'GV',
        standard_duration_weeks: 6,
        open_slots: 4,
        status: 'Open',
        owner_id: actorId,
      },
      actorId
    );
    opportunityId = opp.id;
  });

  describe('1. Statutory Partner Standards Definitions (§9.1)', () => {
    it('defines all 8 statutory partner standards accurately', () => {
      expect(STATUTORY_PARTNER_STANDARDS).toHaveLength(8);

      const stdNos = STATUTORY_PARTNER_STANDARDS.map((s) => s.std_no);
      expect(stdNos).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);

      expect(partnerStandardsService.getDefinition(1)?.name).toBe('Expectations setting');
      expect(partnerStandardsService.getDefinition(2)?.name).toBe('Selection process');
      expect(partnerStandardsService.getDefinition(3)?.name).toBe('Job description');
      expect(partnerStandardsService.getDefinition(4)?.name).toBe('Working hours');
      expect(partnerStandardsService.getDefinition(5)?.name).toBe('Partner preparation meeting');
      expect(partnerStandardsService.getDefinition(6)?.name).toBe('Visa & work-permit support');
      expect(partnerStandardsService.getDefinition(7)?.name).toBe('Experience evaluation');
      expect(partnerStandardsService.getDefinition(8)?.name).toBe('Partner closing meeting');
    });

    it('initializes all 8 standards per opportunity', () => {
      const standards = partnerStandardsService.getOpportunityStandards(opportunityId);
      expect(standards).toHaveLength(8);
      expect(standards.every((s) => s.opportunity_id === opportunityId)).toBe(true);
      expect(standards.every((s) => s.delivered === false)).toBe(true);

      expect(partnerStandardsService.computePartnerStandardsDeliveryPct(opportunityId)).toBe(0);
    });
  });

  describe('2. Account Management Routines & Delivery Validation (§9.1)', () => {
    it('Standard 1 (Expectations setting): requires logged meeting to mark delivered', () => {
      expect(() => {
        partnerStandardsService.updateDeliveryStatus(opportunityId, 1, true, actorId);
      }).toThrow(/requires a logged meeting/i);

      // Log meeting covering statutory items
      partnerStandardsService.logStandardMeeting(
        opportunityId,
        1,
        {
          meeting_notes: 'Reviewed LDM, contract clauses, timeline, and JD minimums with HR manager',
          criteria_met: {
            ldm_covered: true,
            contract_clauses: true,
            timeline: true,
            jd_minimums: true,
          },
          meeting_date: '2026-11-01T10:00:00Z',
        },
        actorId
      );

      const updated = partnerStandardsService.updateDeliveryStatus(opportunityId, 1, true, actorId);
      expect(updated.delivered).toBe(true);
      expect(updated.delivered_by).toBe(actorId);
    });

    it('Standard 2 (Selection process): requires selection mode recorded', () => {
      expect(() => {
        partnerStandardsService.updateDeliveryStatus(opportunityId, 2, true, actorId);
      }).toThrow(/requires recording selection_mode/i);

      const updated = partnerStandardsService.updateDeliveryStatus(opportunityId, 2, true, actorId, {
        criteria_met: { selection_mode: 'partner_selects_on_portal', timeline_agreed: true },
      });
      expect(updated.delivered).toBe(true);
    });

    it('Standard 7 (Experience evaluation): requires both mid_review and final_review logged', () => {
      // Missing final_review_date
      expect(() => {
        partnerStandardsService.updateDeliveryStatus(opportunityId, 7, true, actorId, {
          criteria_met: { mid_review_date: '2026-11-20' },
        });
      }).toThrow(/requires both mid_review_date and final_review_date/i);

      // Both dates provided -> succeeds
      const updated = partnerStandardsService.updateDeliveryStatus(opportunityId, 7, true, actorId, {
        criteria_met: {
          mid_review_date: '2026-11-20',
          final_review_date: '2026-12-10',
          nps_reminder_sent: true,
        },
      });
      expect(updated.delivered).toBe(true);
    });

    it('Standard 8 (Partner closing meeting): enforces separation from final review and ≤ 1 month timing', () => {
      const fiDate = '2026-12-15';
      const finalReviewDate = '2026-12-10';

      // 1. Missing closing meeting date
      expect(() => {
        partnerStandardsService.updateDeliveryStatus(opportunityId, 8, true, actorId, {
          fi_date: fiDate,
          final_review_date: finalReviewDate,
        });
      }).toThrow(/requires closing_meeting_date/i);

      // 2. Coinciding with final review date -> blocked
      expect(() => {
        partnerStandardsService.updateDeliveryStatus(opportunityId, 8, true, actorId, {
          fi_date: fiDate,
          final_review_date: finalReviewDate,
          criteria_met: { closing_meeting_date: finalReviewDate },
        });
      }).toThrow(/cannot coincide with the final review date/i);

      // 3. Held > 30 days after FI -> blocked
      const lateDate = '2027-01-25'; // 41 days after FI
      expect(() => {
        partnerStandardsService.updateDeliveryStatus(opportunityId, 8, true, actorId, {
          fi_date: fiDate,
          final_review_date: finalReviewDate,
          criteria_met: { closing_meeting_date: lateDate },
        });
      }).toThrow(/must be held within 1 month/i);

      // 4. Valid closing meeting (15 days after FI, separate from final review)
      const validClosingDate = '2026-12-30';
      const updated = partnerStandardsService.updateDeliveryStatus(opportunityId, 8, true, actorId, {
        fi_date: fiDate,
        final_review_date: finalReviewDate,
        criteria_met: {
          closing_meeting_date: validClosingDate,
          extension_renewal_offered: true,
        },
      });
      expect(updated.delivered).toBe(true);
    });

    it('computes partner standards delivery percentage correctly', () => {
      // Deliver standards 3, 4, 5, 6
      [3, 4, 5, 6].forEach((stdNo) => {
        partnerStandardsService.updateDeliveryStatus(opportunityId, stdNo, true, actorId);
      });

      const pct = partnerStandardsService.computePartnerStandardsDeliveryPct(opportunityId);
      expect(pct).toBe(50.0); // 4 out of 8 delivered
    });
  });

  describe('3. Partner NPS Prerequisites & DQ-062 Detection (§9.1, §13.2)', () => {
    it('raises DQ-062 warning when partner has no linked employees or portal signup', () => {
      // Simulate unlinked partner
      partnerStandardsService.setPartnerNpsData(partnerId, {
        has_linked_employees: false,
        partner_portal_signup: false,
      });

      const { prerequisites, dqIssue } = partnerStandardsService.checkPartnerNpsPrerequisites(partnerId);

      expect(prerequisites.is_eligible_for_nps).toBe(false);
      expect(dqIssue).toBeDefined();
      expect(dqIssue?.rule_id).toBe('DQ-062');
      expect(dqIssue?.severity).toBe('Warn');
      expect(dqIssue?.owner_id).toBe(actorId);
      expect(dqIssue?.subject).toContain('not linked for NPS');
    });

    it('satisfies NPS prerequisites when EXPA organisation has linked employees', () => {
      partnerStandardsService.setPartnerNpsData(partnerId, {
        has_linked_employees: true,
        partner_portal_signup: false,
      });

      const { prerequisites, dqIssue } = partnerStandardsService.checkPartnerNpsPrerequisites(partnerId);

      expect(prerequisites.is_eligible_for_nps).toBe(true);
      expect(dqIssue).toBeUndefined();
    });

    it('satisfies NPS prerequisites when partner is registered on partners portal', () => {
      partnerStandardsService.setPartnerNpsData(partnerId, {
        has_linked_employees: false,
        partner_portal_signup: true,
      });

      const { prerequisites, dqIssue } = partnerStandardsService.checkPartnerNpsPrerequisites(partnerId);

      expect(prerequisites.is_eligible_for_nps).toBe(true);
      expect(dqIssue).toBeUndefined();
    });
  });

  describe('4. Invariants Enforcement (INV-01, INV-09)', () => {
    it('soft deletes partner standard check with attribution and prevents hard delete', () => {
      const soft = partnerStandardsService.softDeletePartnerStandardCheck(
        opportunityId,
        1,
        'Duplicate entry created in test',
        actorId
      );

      expect(soft.deleted_at).not.toBeNull();
      expect(soft.deleted_reason).toContain('Duplicate entry created in test');

      // Attempt hard delete -> throws INV-01
      expect(() => {
        partnerStandardsService.hardDeletePartnerStandardCheck(
          `${opportunityId}:1`,
          actorId
        );
      }).toThrowError(InvariantViolationError);
    });

    it('records universal audit log row upon partner standard delivery update (INV-09)', () => {
      partnerStandardsService.updateDeliveryStatus(opportunityId, 3, true, actorId);

      const db = getMasterTrackerDb();
      const lastAudit = db.auditLogs[db.auditLogs.length - 1];
      expect(lastAudit.action).toBe('UPDATE_PARTNER_STANDARD_DELIVERY');
      expect(lastAudit.record_id).toBe(`${opportunityId}:3`);
      expect(lastAudit.actor).toBe(actorId);
    });
  });
});
