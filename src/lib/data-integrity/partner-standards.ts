/**
 * AIESEC iCX ERP — Partner Standards per Opportunity Service
 * Author: Wadii Hani <wadii.hani.pro@gmail.com>
 * Specification: iCX_Data_Integrity_Tracking_Spec.md v1.0 (§9.1 Standards #1–#8, §13.2 DQ-062)
 * Milestone: M4 (Plan 04-01)
 * Enforces: INV-01 (Soft Deletes), INV-09 (Attribution), Account-Management Routines & DQ-062 NPS Prerequisites
 */

import type {
  PartnerStandardDef,
  PartnerStandardCheck,
  PartnerNpsPrerequisites,
  DqIssue,
  OpPartner,
  Opportunity,
} from '../types/data-integrity';
import { assertNoHardDelete, createSoftDeletePayload, InvariantViolationError } from './invariants';
import { getMasterTrackerDb } from './master-tracker';

/**
 * Statutory definitions of the 8 Partner Standards (§9.1)
 */
export const STATUTORY_PARTNER_STANDARDS: PartnerStandardDef[] = [
  {
    std_no: 1,
    name: 'Expectations setting',
    stage: 'consideration',
    rule_description:
      'Meeting logged covering: LDM, exchange elements, contract & payment, deadlines, timeline, required profile, JD minimums, EP types, comms channel/frequency, visa timeline',
  },
  {
    std_no: 2,
    name: 'Selection process',
    stage: 'consideration',
    rule_description:
      'Selection mode recorded (partner selects on partners portal or AIESEC shortlists), timeline, comms agreement',
  },
  {
    std_no: 3,
    name: 'Job description',
    stage: 'consideration',
    rule_description: 'Duration, activities/KPIs/objectives, skills, working conditions',
  },
  {
    std_no: 4,
    name: 'Working hours',
    stage: 'consideration',
    rule_description: 'Within hours.* rule (25–45 hrs/week for GV)',
  },
  {
    std_no: 5,
    name: 'Partner preparation meeting',
    stage: 'preparation',
    rule_description: 'Goal-setting meeting with EP logged; KPIs/targets; review date',
  },
  {
    std_no: 6,
    name: 'Visa & work-permit support',
    stage: 'preparation',
    rule_description: 'Doc list, deadline agreed, update frequency',
  },
  {
    std_no: 7,
    name: 'Experience evaluation',
    stage: 'experience',
    rule_description: 'Mid review + final review logged; NPS reminder sent',
  },
  {
    std_no: 8,
    name: 'Partner closing meeting',
    stage: 'post_experience',
    rule_description:
      '≤ 1 month after FI; separate from final review; includes renewal/extension offer',
  },
];

export interface PartnerStandardCheckWithDef extends PartnerStandardCheck {
  name: string;
  stage: string;
  rule_description: string;
}

/**
 * In-memory store for partner standards
 */
interface PartnerStandardsDbStore {
  // Key: `${opportunityId}:${stdNo}`
  checks: Map<string, PartnerStandardCheck>;
  // Key: partnerId
  partnerNpsData: Map<string, { has_linked_employees: boolean; partner_portal_signup: boolean }>;
}

const partnerStandardsDb: PartnerStandardsDbStore = {
  checks: new Map(),
  partnerNpsData: new Map(),
};

export function resetPartnerStandardsDb(): void {
  partnerStandardsDb.checks.clear();
  partnerStandardsDb.partnerNpsData.clear();
}

export const partnerStandardsService = {
  /**
   * Retrieves definition of a partner standard by number (1 to 8).
   */
  getDefinition(stdNo: number): PartnerStandardDef | undefined {
    return STATUTORY_PARTNER_STANDARDS.find((d) => d.std_no === stdNo);
  },

  /**
   * Returns all 8 partner standards for an opportunity, initializing defaults if needed.
   */
  getOpportunityStandards(opportunityId: string): PartnerStandardCheckWithDef[] {
    const results: PartnerStandardCheckWithDef[] = [];

    for (const def of STATUTORY_PARTNER_STANDARDS) {
      const key = `${opportunityId}:${def.std_no}`;
      let check = partnerStandardsDb.checks.get(key);

      if (!check) {
        check = {
          opportunity_id: opportunityId,
          std_no: def.std_no,
          delivered: false,
          delivered_at: null,
          delivered_by: null,
          meeting_logged_at: null,
          meeting_notes: null,
          criteria_met: {},
          proof_id: null,
          metadata: {},
          created_at: new Date().toISOString(),
          deleted_at: null,
          deleted_reason: null,
        };
        partnerStandardsDb.checks.set(key, check);
      }

      results.push({
        ...check,
        name: def.name,
        stage: def.stage,
        rule_description: def.rule_description,
      });
    }

    return results;
  },

  /**
   * Logs a partner meeting against an opportunity standard (§9.1).
   */
  logStandardMeeting(
    opportunityId: string,
    stdNo: number,
    params: {
      meeting_notes: string;
      criteria_met?: Record<string, unknown>;
      proof_id?: string | null;
      meeting_date?: string;
    },
    actorId: string
  ): PartnerStandardCheck {
    const key = `${opportunityId}:${stdNo}`;
    const existing = this.getOpportunityStandards(opportunityId).find((s) => s.std_no === stdNo)!;
    const now = params.meeting_date ?? new Date().toISOString();

    const updated: PartnerStandardCheck = {
      ...existing,
      meeting_logged_at: now,
      meeting_notes: params.meeting_notes,
      criteria_met: { ...existing.criteria_met, ...(params.criteria_met ?? {}) },
      proof_id: params.proof_id !== undefined ? params.proof_id : existing.proof_id,
    };

    partnerStandardsDb.checks.set(key, updated);

    // Audit log (INV-09)
    const masterDb = getMasterTrackerDb();
    masterDb.auditLogs.push({
      id: masterDb.auditLogs.length + 1,
      ts: now,
      actor: actorId,
      action: 'LOG_PARTNER_STANDARD_MEETING',
      table_name: 'partner_standard_check',
      record_id: key,
      before: existing as unknown as Record<string, unknown>,
      after: updated as unknown as Record<string, unknown>,
    });

    return updated;
  },

  /**
   * Updates standard delivery status with statutory business rules validation (§9.1).
   */
  updateDeliveryStatus(
    opportunityId: string,
    stdNo: number,
    delivered: boolean,
    actorId: string,
    options?: {
      proof_id?: string | null;
      criteria_met?: Record<string, unknown>;
      final_review_date?: string;
      fi_date?: string;
    }
  ): PartnerStandardCheck {
    const key = `${opportunityId}:${stdNo}`;
    const standards = this.getOpportunityStandards(opportunityId);
    const existing = standards.find((s) => s.std_no === stdNo);
    if (!existing) {
      throw new Error(`Partner Standard #${stdNo} not found.`);
    }

    const now = new Date().toISOString();
    const criteria = { ...existing.criteria_met, ...(options?.criteria_met ?? {}) };

    if (delivered) {
      // Validate statutory rules per standard
      if (stdNo === 1) {
        // Expectations setting requires meeting logged
        if (!existing.meeting_logged_at && !criteria.meeting_logged) {
          throw new Error(
            'Partner Standard #1 (Expectations setting) requires a logged meeting covering LDM, contracts, deadlines, and JD minimums.'
          );
        }
      } else if (stdNo === 2) {
        // Selection process requires selection mode recorded
        if (!criteria.selection_mode) {
          throw new Error(
            'Partner Standard #2 (Selection process) requires recording selection_mode (e.g. portal or shortlist).'
          );
        }
      } else if (stdNo === 7) {
        // Experience evaluation requires both mid_review and final_review logged
        if (!criteria.mid_review_date || !criteria.final_review_date) {
          throw new Error(
            'Partner Standard #7 (Experience evaluation) requires both mid_review_date and final_review_date to be logged.'
          );
        }
      } else if (stdNo === 8) {
        // Partner closing meeting requires date <= 1 month after FI, and separate from final review
        if (!criteria.closing_meeting_date) {
          throw new Error('Partner Standard #8 requires closing_meeting_date.');
        }

        const closingDate = String(criteria.closing_meeting_date);
        const finalReview = options?.final_review_date ?? criteria.final_review_date;

        if (finalReview && closingDate === String(finalReview)) {
          throw new Error(
            'Partner Standard #8 (Partner closing meeting) cannot coincide with the final review date. Must be held as a separate meeting.'
          );
        }

        if (options?.fi_date) {
          const fiDate = new Date(options.fi_date);
          const closeDate = new Date(closingDate);
          const diffDays = Math.floor((closeDate.getTime() - fiDate.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays > 30) {
            throw new Error(
              `Partner Standard #8 (Partner closing meeting) must be held within 1 month (≤ 30 days) of exchange finish date. Meeting was held ${diffDays} days after FI.`
            );
          }
        }
      }
    }

    const updated: PartnerStandardCheck = {
      ...existing,
      delivered,
      delivered_at: delivered ? now : null,
      delivered_by: delivered ? actorId : null,
      proof_id: options?.proof_id !== undefined ? options.proof_id : existing.proof_id,
      criteria_met: criteria,
    };

    partnerStandardsDb.checks.set(key, updated);

    // Audit log (INV-09)
    const masterDb = getMasterTrackerDb();
    masterDb.auditLogs.push({
      id: masterDb.auditLogs.length + 1,
      ts: now,
      actor: actorId,
      action: 'UPDATE_PARTNER_STANDARD_DELIVERY',
      table_name: 'partner_standard_check',
      record_id: key,
      before: existing as unknown as Record<string, unknown>,
      after: updated as unknown as Record<string, unknown>,
    });

    return updated;
  },

  /**
   * Sets NPS prerequisite data for a partner (simulating EXPA integration).
   */
  setPartnerNpsData(
    partnerId: string,
    data: { has_linked_employees: boolean; partner_portal_signup: boolean }
  ): void {
    partnerStandardsDb.partnerNpsData.set(partnerId, data);
  },

  /**
   * Checks Partner NPS Prerequisites (§9.1, §13.2 DQ-062).
   * Organisation exists in EXPA with linked employees OR signed up on partners portal.
   */
  checkPartnerNpsPrerequisites(partnerId: string): {
    prerequisites: PartnerNpsPrerequisites;
    dqIssue?: Omit<DqIssue, 'id'>;
  } {
    const masterDb = getMasterTrackerDb();
    const partner = masterDb.partners.get(partnerId);
    if (!partner) {
      throw new Error(`Partner '${partnerId}' not found.`);
    }

    const npsData = partnerStandardsDb.partnerNpsData.get(partnerId) ?? {
      has_linked_employees: false,
      partner_portal_signup: false,
    };

    const hasExpaLinked = Boolean(partner.expa_org_id && npsData.has_linked_employees);
    const hasPortal = npsData.partner_portal_signup;
    const isEligible = hasExpaLinked || hasPortal;

    const missing: string[] = [];
    if (!hasExpaLinked && !hasPortal) {
      missing.push('Partner has neither an EXPA organisation with linked employees nor a registered portal account.');
    }

    const prerequisites: PartnerNpsPrerequisites = {
      partner_id: partnerId,
      expa_org_id: partner.expa_org_id ?? null,
      has_linked_employees: npsData.has_linked_employees,
      partner_portal_signup: hasPortal,
      is_eligible_for_nps: isEligible,
      missing_prerequisites: missing,
    };

    let dqIssue: Omit<DqIssue, 'id'> | undefined;
    if (!isEligible) {
      dqIssue = {
        rule_id: 'DQ-062',
        subject: `Partner ${partner.name} not linked for NPS (no EXPA org with linked employees or portal signup)`,
        severity: 'Warn',
        detected_at: new Date().toISOString(),
        owner_id: partner.owner_id,
        details: {
          partner_id: partner.id,
          partner_name: partner.name,
          expa_org_id: partner.expa_org_id,
          missing: missing[0],
        },
      };
    }

    return { prerequisites, dqIssue };
  },

  /**
   * Computes percentage of partner standards delivered out of 8 (§9.1).
   */
  computePartnerStandardsDeliveryPct(opportunityId: string): number {
    const standards = this.getOpportunityStandards(opportunityId);
    const deliveredCount = standards.filter((s) => s.delivered).length;
    return Number(((deliveredCount / 8) * 100).toFixed(1));
  },

  /**
   * Soft deletes a partner standard record (INV-01).
   */
  softDeletePartnerStandardCheck(
    opportunityId: string,
    stdNo: number,
    reason: string,
    actorId: string
  ): PartnerStandardCheck {
    // Ensure standards are initialized for the opportunity
    this.getOpportunityStandards(opportunityId);

    const key = `${opportunityId}:${stdNo}`;
    const existing = partnerStandardsDb.checks.get(key);
    if (!existing || existing.deleted_at) {
      throw new Error(`Partner standard check '${key}' not found or already deleted.`);
    }

    const payload = createSoftDeletePayload(actorId, reason);
    const updated: PartnerStandardCheck = {
      ...existing,
      ...payload,
    };

    partnerStandardsDb.checks.set(key, updated);

    // Audit log (INV-09)
    const masterDb = getMasterTrackerDb();
    masterDb.auditLogs.push({
      id: masterDb.auditLogs.length + 1,
      ts: payload.deleted_at,
      actor: actorId,
      action: 'SOFT_DELETE_PARTNER_STANDARD',
      table_name: 'partner_standard_check',
      record_id: key,
      before: existing as unknown as Record<string, unknown>,
      after: updated as unknown as Record<string, unknown>,
    });

    return updated;
  },

  /**
   * Hard delete prohibition check (INV-01, DQ-081).
   */
  hardDeletePartnerStandardCheck(recordId: string, actorId?: string | null): never {
    assertNoHardDelete('partner_standard_check', recordId, actorId);
  },
};
