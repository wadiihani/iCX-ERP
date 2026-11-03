import { describe, it, expect, beforeEach } from 'vitest';
import {
  complianceService,
  resetComplianceDb,
  STATUTORY_ICB_DOCS,
} from '../src/lib/data-integrity/compliance-calendar';
import {
  getMasterTrackerDb,
  resetMasterTrackerDb,
  entityService,
  opportunityService,
  epService,
  exchangeService,
} from '../src/lib/data-integrity/master-tracker';
import { assertTransitionGuards } from '../src/lib/data-integrity/stage-gates';
import { InvariantViolationError } from '../src/lib/data-integrity/invariants';

describe('Plan 06-01 / 06-02: Compliance Calendar & ICB Freeze Gate (M6)', () => {
  const actorLcvp = 'mem-lcvp-001';
  const actorMember = 'mem-regular-002';
  let entityId: string;

  beforeEach(() => {
    resetMasterTrackerDb();
    resetComplianceDb();

    // Create an entity (e.g. AIESEC in Rabat / Morocco)
    const entity = entityService.createEntity(
      {
        id: 'ent-morocco-rabat',
        expa_id: 154,
        name: 'AIESEC in Rabat',
        type: 'LC',
        country: 'Morocco',
      },
      actorLcvp
    );
    entityId = entity.id;
  });

  describe('1. 13 Statutory ICB Documents Catalogue (§11.2, APIP Annex 4)', () => {
    it('contains all 13 required statutory documents across the 4 audited sections', () => {
      expect(STATUTORY_ICB_DOCS.length).toBe(13);

      const doc1 = STATUTORY_ICB_DOCS.find((d) => d.doc_number === 1);
      expect(doc1?.title).toBe('Programmes statement');
      expect(doc1?.section).toBe('General');

      const doc2 = STATUTORY_ICB_DOCS.find((d) => d.doc_number === 2);
      expect(doc2?.title).toContain('Lawyer / PR');
      expect(doc2?.section).toContain('3.1.1 Legal Support');

      const doc4 = STATUTORY_ICB_DOCS.find((d) => d.doc_number === 4);
      expect(doc4?.title).toContain('PHAVC');
      expect(doc4?.section).toContain('3.1.2 Risk Management');

      const doc10 = STATUTORY_ICB_DOCS.find((d) => d.doc_number === 10);
      expect(doc10?.title).toContain('Education plan');
      expect(doc10?.section).toContain('3.1.3 Educational');

      const doc12 = STATUTORY_ICB_DOCS.find((d) => d.doc_number === 12);
      expect(doc12?.title).toContain('Management tool for quality cases');
      expect(doc12?.section).toContain('3.1.4 Quality Management');
    });

    it('seeds the complete ICB catalogue for an entity and computes compliance scorecard', () => {
      const dueDate = '2026-12-31T23:59:59Z';
      const items = complianceService.seedIcbAuditCatalogue(
        entityId,
        actorLcvp,
        actorLcvp,
        dueDate
      );

      expect(items.length).toBe(13);
      expect(items.every((it) => it.entity_id === entityId)).toBe(true);
      expect(items.every((it) => it.result === 'pending')).toBe(true);

      // Submit evidence for document 1
      const item1 = items[0];
      const withEvidence = complianceService.submitEvidence(
        item1.id,
        ['proof-drive-prog-stmt-v1'],
        actorLcvp,
        'Programmes statement signed by LCP and LCVP'
      );
      expect(withEvidence.evidence_ids).toContain('proof-drive-prog-stmt-v1');
      expect(withEvidence.submitted_at).toBeDefined();

      // Record passed audit result for document 1
      complianceService.recordAuditResult(item1.id, 'passed', 100, actorLcvp);

      const scorecard = complianceService.getComplianceAuditScorecard(entityId);
      expect(scorecard.totalDocs).toBe(13);
      expect(scorecard.passedDocs).toBe(1);
      expect(scorecard.pendingDocs).toBe(12);
      expect(scorecard.isCompliant).toBe(false); // only 1 of 13 passed
    });
  });

  describe('2. Compliance Item Lifecycle & Invariants (INV-01, INV-03, INV-09)', () => {
    it('creates compliance item and logs universal audit trail (INV-09)', () => {
      const item = complianceService.createComplianceItem(
        {
          entity_id: entityId,
          kind: 'ecb_quarterly_report',
          title: 'Q1 2026 ECB Quarterly Audit Report',
          section: 'Governance',
          due_at: '2026-04-15T00:00:00Z',
          owner_id: actorLcvp,
        },
        actorLcvp
      );

      expect(item.id).toBeDefined();
      expect(item.kind).toBe('ecb_quarterly_report');

      // Verify audit log
      const audit = getMasterTrackerDb().auditLogs.find(
        (l) => l.table_name === 'compliance_item' && l.record_id === item.id && l.action === 'INSERT'
      );
      expect(audit).toBeDefined();
      expect(audit?.actor).toBe(actorLcvp);
    });

    it('enforces INV-03: rejects compliance item creation without owner_id', () => {
      expect(() => {
        complianceService.createComplianceItem(
          {
            entity_id: entityId,
            kind: 'internal_audit',
            title: 'Internal Audit',
            section: 'Internal',
            due_at: '2026-06-01T00:00:00Z',
            owner_id: '',
          },
          actorLcvp
        );
      }).toThrowError(/INV-03.*mandatory active owner_id/i);
    });

    it('enforces INV-01: soft delete sets reason, hard delete is blocked', () => {
      const item = complianceService.createComplianceItem(
        {
          entity_id: entityId,
          kind: 'internal_audit',
          title: 'Draft Audit',
          section: 'Internal',
          due_at: '2026-06-01T00:00:00Z',
          owner_id: actorLcvp,
        },
        actorLcvp
      );

      const deleted = complianceService.softDeleteComplianceItem(
        item.id,
        actorLcvp,
        'Superseded by quarterly report'
      );
      expect(deleted.deleted_at).toBeDefined();
      expect(deleted.deleted_reason).toContain('Superseded');

      expect(complianceService.getComplianceItem(item.id)).toBeNull();

      expect(() => {
        complianceService.hardDeleteAttempt(item.id, actorLcvp);
      }).toThrowError(/INV-01.*Hard deletes are strictly forbidden/i);
    });
  });

  describe('3. Freeze Authority & Link Enforcement (D10, INV-07)', () => {
    it('enforces Decision D10: only LCVP / ECB / Admin can toggle freeze status', () => {
      // Regular member attempt -> REJECTED
      expect(() => {
        complianceService.setEntityFreezeStatus({
          entity_id: entityId,
          is_frozen: true,
          icb_audit_reference_link: 'https://expa.aiesec.org/icb/audit/2026-morocco',
          reason: 'Severe compliance failure in safety standard',
          actor_id: actorMember,
          actor_role: 'member', // Regular member
        });
      }).toThrowError(/D10.*Only LCVP iGV, ECB, or Admin have the authority/i);

      // LCVP attempt with valid link -> SUCCESS
      const res = complianceService.setEntityFreezeStatus({
        entity_id: entityId,
        is_frozen: true,
        icb_audit_reference_link: 'https://expa.aiesec.org/icb/audit/2026-morocco',
        reason: 'PHAVC non-compliance flagged by ICB',
        actor_id: actorLcvp,
        actor_role: 'lcvp',
      });

      expect(res.is_frozen).toBe(true);
      expect(res.frozen_since).toBeDefined();
    });

    it('enforces mandatory ICB audit reference link when setting is_frozen = true', () => {
      expect(() => {
        complianceService.setEntityFreezeStatus({
          entity_id: entityId,
          is_frozen: true,
          icb_audit_reference_link: '', // MISSING LINK
          reason: 'Frozen without link',
          actor_id: actorLcvp,
          actor_role: 'lcvp',
        });
      }).toThrowError(/INV-07.*mandatory ICB audit reference link/i);
    });
  });

  describe('4. Acceptance Test T-11 / INV-07 Enforcement Gate', () => {
    it('T-11: Given entity is_frozen, when a user tries to process an approval, then blocked with ICB reference', () => {
      // 1. Freeze entity with ICB reference link
      complianceService.setEntityFreezeStatus({
        entity_id: entityId,
        is_frozen: true,
        icb_audit_reference_link: 'https://icb.aiesec.org/reports/audit-2026-morocco-rabat',
        reason: 'APIP Annex 4 audit failure in legal documentation',
        actor_id: actorLcvp,
        actor_role: 'lcvp',
      });

      // Direct service check for T-11
      expect(() => {
        complianceService.assertApprovalAllowed(entityId);
      }).toThrowError(/INV-07.*is FROZEN by ICB audit/i);

      // Verify stage-gates assertTransitionGuards blocks APD approval for this frozen entity
      const frozenEntity = getMasterTrackerDb().entities.get(entityId)!;
      const opp = opportunityService.createOpportunity(
        {
          op_id: 'ptn-test-01',
          title: 'Project Lead',
          programme: 'GV',
          slots: 2,
          duration_weeks: 6,
          benefits: [],
          accommodation_provided: true,
        },
        actorLcvp
      );

      const ep = epService.createEp(
        {
          id: 'ep-frozen-test',
          expa_ep_id: 6001,
          full_name: 'Sarah Connor',
          home_entity_id: entityId,
          contact: {},
          owner_id: actorLcvp,
        },
        actorLcvp
      );

      const { exchange } = exchangeService.createExchange(
        {
          ep_id: ep.id,
          opportunity_id: opp.id,
          programme: 'GV',
          status: 'APL',
          owner_id: actorLcvp,
        },
        actorLcvp
      );

      expect(() => {
        assertTransitionGuards('APD', {
          exchange,
          homeEntity: frozenEntity,
        });
      }).toThrowError(/INV-07.*Home entity "AIESEC in Rabat" is FROZEN by ICB/i);
    });

    it('unfreezing workflow: submittal of unfreezing request and subsequent unfreezing permits approvals', () => {
      // Entity starts frozen
      complianceService.setEntityFreezeStatus({
        entity_id: entityId,
        is_frozen: true,
        icb_audit_reference_link: 'https://icb.aiesec.org/audit/freeze-01',
        reason: 'Temporary audit hold',
        actor_id: actorLcvp,
        actor_role: 'lcvp',
      });

      // Submit unfreezing request with corrective action plan
      const unfreezeReq = complianceService.submitUnfreezingRequest(
        entityId,
        'Unfreezing submission for AIESEC in Rabat',
        'Submitted updated lawyer agreement, PHAVC roster, and SOPs.',
        ['proof-corrective-sops', 'proof-lawyer-letter'],
        actorLcvp,
        actorLcvp,
        'https://icb.aiesec.org/submissions/unfreeze-rabat'
      );

      expect(unfreezeReq.id).toBeDefined();
      expect(unfreezeReq.kind).toBe('unfreezing_submission');
      expect(unfreezeReq.evidence_ids.length).toBe(2);

      // ICB approves and LCVP unfreezes entity
      complianceService.setEntityFreezeStatus({
        entity_id: entityId,
        is_frozen: false,
        icb_audit_reference_link: 'https://icb.aiesec.org/submissions/unfreeze-rabat',
        reason: 'Unfreezing approved by ICB after corrective evidence review',
        actor_id: actorLcvp,
        actor_role: 'lcvp',
      });

      // Approvals now allowed without throwing INV-07
      expect(() => {
        complianceService.assertApprovalAllowed(entityId);
      }).not.toThrow();
    });
  });
});
