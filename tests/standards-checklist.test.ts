import { describe, it, expect, beforeEach } from 'vitest';
import {
  STATUTORY_CHECKLIST_DEFS,
  standardsChecklistService,
  resetChecklistDb,
  StandardChecklistValidationError,
} from '../src/lib/data-integrity/standards-checklist';
import {
  getMasterTrackerDb,
  resetMasterTrackerDb,
  partnerService,
  opportunityService,
  epService,
  exchangeService,
} from '../src/lib/data-integrity/master-tracker';

describe('Plan 02-02: Standards Checklist Validation Engine (M2)', () => {
  const actorId = 'mem-wadii-001';
  let exchangeId: string;

  beforeEach(() => {
    resetMasterTrackerDb();
    resetChecklistDb();

    partnerService.createPartner(
      {
        id: 'ptn-test-01',
        name: 'Casablanca Foundation',
        tier: 'Tier 1',
        status: 'Active',
        owner_id: actorId,
      },
      actorId
    );

    opportunityService.createOpportunity(
      {
        id: 'opp-test-01',
        partner_id: 'ptn-test-01',
        title: 'Community Lead iGV',
        programme: 'iGV',
        standard_duration_weeks: 6,
        open_slots: 3,
        status: 'Open',
        owner_id: actorId,
      },
      actorId
    );

    epService.createEp(
      {
        id: 'ep-test-01',
        expa_person_id: 'expa-p-888',
        full_name: 'Elena Rostova',
        email: 'elena.rostova@example.com',
        home_mc: 'Poland',
        home_lc: 'AIESEC in Warsaw',
        status: 'Open',
        owner_id: actorId,
      },
      actorId
    );

    const exchange = exchangeService.createExchange(
      {
        id: 'exc-chk-test-01',
        ep_id: 'ep-test-01',
        opportunity_id: 'opp-test-01',
        programme: 'iGV',
        status: 'approved',
        flow_stage: 'preparation',
        owner_id: actorId,
      },
      actorId
    );
    exchangeId = exchange.id;
  });

  describe('1. Statutory Checklist Item Definitions (§6.2)', () => {
    it('defines checklists for all 12 host entity standards (#4–#15)', () => {
      expect(STATUTORY_CHECKLIST_DEFS).toHaveLength(12);

      const stdNos = STATUTORY_CHECKLIST_DEFS.map((d) => d.std_no);
      expect(stdNos).toEqual([4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);

      // Standard #4 Expectations Setting has 5 items
      const std4 = standardsChecklistService.getDefinition(4);
      expect(std4?.items).toHaveLength(5);
      expect(std4?.items.map((i) => i.key)).toEqual([
        'culture',
        'political_situation',
        'living_standards',
        'contacts',
        'accommodation_conditions',
      ]);

      // Standard #7 Accommodation has 5 items
      const std7 = standardsChecklistService.getDefinition(7);
      expect(std7?.items).toHaveLength(5);
      expect(std7?.items.map((i) => i.key)).toEqual([
        'matches_conditions',
        'single_bed',
        'clean_water',
        'bathroom',
        'electricity',
      ]);
    });
  });

  describe('2. Checklist Completion & Verification Logic', () => {
    it('retrieves initial uncompleted status for an exchange', () => {
      const status = standardsChecklistService.getStandardChecklist(exchangeId, 4);

      expect(status.std_no).toBe(4);
      expect(status.total_items).toBe(5);
      expect(status.completed_items).toBe(0);
      expect(status.completion_pct).toBe(0);
      expect(status.is_complete).toBe(false);
      expect(status.missing_required_keys).toEqual([
        'culture',
        'political_situation',
        'living_standards',
        'contacts',
        'accommodation_conditions',
      ]);
    });

    it('updates individual checklist item with attribution and audit log (INV-09)', () => {
      const updated = standardsChecklistService.updateChecklistItem(
        exchangeId,
        4,
        'culture',
        true,
        actorId,
        'Shared culture booklet PDF'
      );

      expect(updated.key).toBe('culture');
      expect(updated.completed).toBe(true);
      expect(updated.completed_by).toBe(actorId);
      expect(updated.notes).toBe('Shared culture booklet PDF');

      const status = standardsChecklistService.getStandardChecklist(exchangeId, 4);
      expect(status.completed_items).toBe(1);
      expect(status.completion_pct).toBe(20.0);
      expect(status.missing_required_keys).not.toContain('culture');

      // Verify audit log
      const db = getMasterTrackerDb();
      const lastAudit = db.auditLogs[db.auditLogs.length - 1];
      expect(lastAudit.action).toBe('UPDATE_STANDARD_CHECKLIST_ITEM');
      expect(lastAudit.record_id).toBe(`${exchangeId}:4:culture`);
    });

    it('rejects delivery transition when checklist items are incomplete (§6.2)', () => {
      // Only mark culture complete, others missing
      standardsChecklistService.updateChecklistItem(exchangeId, 4, 'culture', true, actorId);

      expect(() => {
        standardsChecklistService.validateChecklistCompleteness(exchangeId, 4);
      }).toThrowError(StandardChecklistValidationError);

      try {
        standardsChecklistService.deliverStandardWithChecklistVerification(
          exchangeId,
          4,
          actorId,
          'proof-doc-4'
        );
        expect.unreachable('Should have thrown StandardChecklistValidationError');
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(StandardChecklistValidationError);
        const valErr = err as StandardChecklistValidationError;
        expect(valErr.stdNo).toBe(4);
        expect(valErr.missingKeys).toContain('political_situation');
        expect(valErr.missingKeys).toContain('contacts');
      }
    });

    it('allows delivery transition when all statutory checklist items are checked', () => {
      // Complete all items for Standard 4
      standardsChecklistService.completeAllItems(
        exchangeId,
        4,
        actorId,
        'Verified in prep space'
      );

      const status = standardsChecklistService.getStandardChecklist(exchangeId, 4);
      expect(status.is_complete).toBe(true);
      expect(status.completion_pct).toBe(100);
      expect(status.missing_required_keys).toHaveLength(0);

      // Now delivery succeeds
      const check = standardsChecklistService.deliverStandardWithChecklistVerification(
        exchangeId,
        4,
        actorId,
        'proof-doc-4'
      );

      expect(check.tracked_status).toBe('delivered');
      expect(check.proof_id).toBe('proof-doc-4');
    });
  });

  describe('3. Exchange-wide Host Standards Checklist Summary', () => {
    it('summarizes checklist progress across all 12 host standards', () => {
      let summary = standardsChecklistService.getExchangeChecklistSummary(exchangeId);

      expect(summary.host_standards).toHaveLength(12);
      expect(summary.total_checklist_items).toBeGreaterThan(20);
      expect(summary.completed_checklist_items).toBe(0);
      expect(summary.overall_checklist_pct).toBe(0);
      expect(summary.all_host_standards_checklist_complete).toBe(false);

      // Complete Standard 9 (First day of work, 1 item)
      standardsChecklistService.completeAllItems(exchangeId, 9, actorId);

      summary = standardsChecklistService.getExchangeChecklistSummary(exchangeId);
      expect(summary.completed_checklist_items).toBe(1);
      expect(summary.overall_checklist_pct).toBeGreaterThan(0);
    });
  });

  describe('4. Home Entity Co-Delivery Alignment (§6.4)', () => {
    const homeEntityId = 'ent-poland-warsaw';

    it('records co-delivery alignment for home entity standards (#1, #2, #3, #16)', () => {
      const alignment = standardsChecklistService.recordCoDeliveryAlignment({
        home_entity_id: homeEntityId,
        std_no: 1, // Personal goal setting
        delivery_method: 'Pre-departure coaching session by oGX mentor',
        tracking_method: 'oGX LDA form submission in Podio',
        audit_evidence: 'Signed Goal Setting Sheet PDF',
        reporting_routine: 'Bi-weekly IR check-in call on WhatsApp',
        aligned_by: actorId,
        post_peak_review_notes: 'Strong alignment, 95% response rate in summer peak',
      });

      expect(alignment.id).toBe(`cd-${homeEntityId}-std-1`);
      expect(alignment.std_no).toBe(1);
      expect(alignment.standard_name).toBe('Personal goal setting');
      expect(alignment.delivery_method).toContain('Pre-departure coaching');

      const list = standardsChecklistService.getCoDeliveryAlignments(homeEntityId);
      expect(list).toHaveLength(1);
      expect(list[0].std_no).toBe(1);
    });

    it('rejects co-delivery alignment for host standards', () => {
      expect(() => {
        standardsChecklistService.recordCoDeliveryAlignment({
          home_entity_id: homeEntityId,
          std_no: 7, // Accommodation (Host standard!)
          delivery_method: 'test',
          tracking_method: 'test',
          audit_evidence: 'test',
          reporting_routine: 'test',
          aligned_by: actorId,
        });
      }).toThrow(/Standard #7 is a host standard/i);
    });
  });
});
