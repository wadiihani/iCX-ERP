import { describe, it, expect, beforeEach } from 'vitest';
import {
  statusGovernanceService,
  resetStatusRequestDb,
} from '../src/lib/data-integrity/status-governance';
import {
  getMasterTrackerDb,
  resetMasterTrackerDb,
  partnerService,
  opportunityService,
  epService,
  exchangeService,
} from '../src/lib/data-integrity/master-tracker';
import { InvariantViolationError } from '../src/lib/data-integrity/invariants';

describe('Plan 03-01: Status Request Schema & Lifecycle State Machine (M3)', () => {
  const actorId = 'mem-wadii-001';
  let exchangeId: string;
  let epId: string;

  beforeEach(() => {
    resetMasterTrackerDb();
    resetStatusRequestDb();

    partnerService.createPartner(
      {
        id: 'ptn-test-01',
        name: 'Casablanca Tech Initiative',
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
        title: 'Full Stack Engineer iGV',
        programme: 'iGV',
        standard_duration_weeks: 6,
        open_slots: 2,
        status: 'Open',
        owner_id: actorId,
      },
      actorId
    );

    const ep = epService.createEp(
      {
        id: 'ep-test-01',
        expa_person_id: 'expa-p-777',
        full_name: 'Lucas Dupont',
        email: 'lucas.dupont@example.com',
        home_mc: 'France',
        home_lc: 'AIESEC in Paris',
        status: 'Open',
        owner_id: actorId,
      },
      actorId
    );
    epId = ep.id;

    const created = exchangeService.createExchange(
      {
        ep_id: epId,
        opportunity_id: 'opp-test-01',
        programme: 'iGV',
        status: 'realized',
        owner_id: actorId,
      },
      actorId
    );
    exchangeId = created.exchange.id;
  });

  describe('1. Creation and Invariant Enforcement', () => {
    it('creates requests across all 6 statutory kinds (§7)', () => {
      const kinds = [
        'early_fi',
        'extension_fi',
        'break_apd',
        'break_re',
        'break_fi',
        'break_co',
      ] as const;

      for (const kind of kinds) {
        const req = statusGovernanceService.createStatusRequest(
          {
            id: `req-${kind}-01`,
            exchange_id: exchangeId,
            ep_id: epId,
            kind,
            reason: `Statutory test for kind ${kind}`,
            owner_id: actorId,
          },
          actorId
        );

        expect(req.id).toBe(`req-${kind}-01`);
        expect(req.kind).toBe(kind);
        expect(req.current_status).toBe('draft');
      }

      const all = statusGovernanceService.listStatusRequests({ exchange_id: exchangeId });
      expect(all).toHaveLength(6);
    });

    it('enforces INV-03: rejects request without an active owner', () => {
      expect(() => {
        statusGovernanceService.createStatusRequest(
          {
            exchange_id: exchangeId,
            ep_id: epId,
            kind: 'early_fi',
            reason: 'Missing owner test',
            owner_id: '',
          },
          actorId
        );
      }).toThrowError(InvariantViolationError);
    });

    it('enforces INV-06: rejects request if ep_id does not match exchange ep_id', () => {
      expect(() => {
        statusGovernanceService.createStatusRequest(
          {
            exchange_id: exchangeId,
            ep_id: 'different-ep-999', // Mismatched EP
            kind: 'early_fi',
            reason: 'Mismatch EP test',
            owner_id: actorId,
          },
          actorId
        );
      }).toThrowError(/INV-06 Violation.*Single EP per request enforced/i);
    });

    it('records universal audit log upon creation (INV-09)', () => {
      const req = statusGovernanceService.createStatusRequest(
        {
          id: 'req-audit-test',
          exchange_id: exchangeId,
          ep_id: epId,
          kind: 'early_fi',
          reason: 'Medical early finish',
          owner_id: actorId,
        },
        actorId
      );

      const db = getMasterTrackerDb();
      const lastAudit = db.auditLogs[db.auditLogs.length - 1];
      expect(lastAudit.action).toBe('CREATE_STATUS_REQUEST');
      expect(lastAudit.record_id).toBe(req.id);
      expect(lastAudit.actor).toBe(actorId);
    });
  });

  describe('2. Lifecycle Finite State Machine (§7.5)', () => {
    it('executes successful lifecycle: draft -> ready -> submitted -> approved -> applied_in_expa', () => {
      const req = statusGovernanceService.createStatusRequest(
        {
          id: 'req-lifecycle-01',
          exchange_id: exchangeId,
          ep_id: epId,
          kind: 'early_fi',
          desired_date: '2026-11-20',
          reason: 'Academic obligation early finish',
          owner_id: actorId,
        },
        actorId
      );

      expect(req.current_status).toBe('draft');

      // 1. draft -> ready
      const ready = statusGovernanceService.transitionLifecycle(
        req.id,
        'ready',
        actorId
      );
      expect(ready.current_status).toBe('ready');

      // 2. ready -> submitted (requires ticket_ref)
      expect(() => {
        statusGovernanceService.transitionLifecycle(req.id, 'submitted', actorId);
      }).toThrow(/requires a non-empty 'ticket_ref'/i);

      const submitted = statusGovernanceService.transitionLifecycle(
        req.id,
        'submitted',
        actorId,
        { ticket_ref: 'ZD-884920' }
      );
      expect(submitted.current_status).toBe('submitted');
      expect(submitted.ticket_ref).toBe('ZD-884920');
      expect(submitted.submitted_at).not.toBeNull();

      // 3. submitted -> approved
      const approved = statusGovernanceService.transitionLifecycle(
        req.id,
        'approved',
        actorId
      );
      expect(approved.current_status).toBe('approved');
      expect(approved.decided_at).not.toBeNull();
      expect(approved.rejection_reason).toBeNull();

      // 4. approved -> applied_in_expa
      const applied = statusGovernanceService.transitionLifecycle(
        req.id,
        'applied_in_expa',
        actorId
      );
      expect(applied.current_status).toBe('applied_in_expa');
      expect(applied.applied_at).not.toBeNull();
    });

    it('executes rejection path: submitted -> rejected with mandatory rejection_reason', () => {
      const req = statusGovernanceService.createStatusRequest(
        {
          id: 'req-reject-01',
          exchange_id: exchangeId,
          ep_id: epId,
          kind: 'break_re',
          reason: 'Conflict with host',
          owner_id: actorId,
        },
        actorId
      );

      statusGovernanceService.transitionLifecycle(req.id, 'ready', actorId);
      statusGovernanceService.transitionLifecycle(req.id, 'submitted', actorId, {
        ticket_ref: 'ZD-12345',
      });

      // Attempting rejection without reason fails
      expect(() => {
        statusGovernanceService.transitionLifecycle(req.id, 'rejected', actorId);
      }).toThrow(/requires a non-empty 'rejection_reason'/i);

      const rejected = statusGovernanceService.transitionLifecycle(
        req.id,
        'rejected',
        actorId,
        { rejection_reason: 'APIP clause 4.2 not satisfied' }
      );

      expect(rejected.current_status).toBe('rejected');
      expect(rejected.rejection_reason).toBe('APIP clause 4.2 not satisfied');
      expect(rejected.decided_at).not.toBeNull();
    });

    it('blocks illegal state skips (e.g. draft directly to submitted or approved)', () => {
      const req = statusGovernanceService.createStatusRequest(
        {
          id: 'req-illegal-01',
          exchange_id: exchangeId,
          ep_id: epId,
          kind: 'break_apd',
          reason: 'Direct break test',
          owner_id: actorId,
        },
        actorId
      );

      expect(() => {
        statusGovernanceService.transitionLifecycle(req.id, 'submitted', actorId);
      }).toThrow(/Invalid lifecycle transition from 'draft' to 'submitted'/i);

      expect(() => {
        statusGovernanceService.transitionLifecycle(req.id, 'approved', actorId);
      }).toThrow(/Invalid lifecycle transition from 'draft' to 'approved'/i);
    });
  });

  describe('3. Soft Deletion & INV-01 Hard Delete Protection', () => {
    it('soft deletes status request with actor attribution and prohibits hard delete', () => {
      const req = statusGovernanceService.createStatusRequest(
        {
          id: 'req-delete-01',
          exchange_id: exchangeId,
          ep_id: epId,
          kind: 'break_fi',
          reason: 'Accidental submission',
          owner_id: actorId,
        },
        actorId
      );

      const deleted = statusGovernanceService.softDeleteStatusRequest(
        req.id,
        'Duplicate request created by mistake',
        actorId
      );

      expect(deleted.deleted_at).not.toBeNull();
      expect(deleted.deleted_reason).toContain('Duplicate request created by mistake');
      expect(statusGovernanceService.getStatusRequest(req.id)).toBeUndefined();

      // Hard delete attempt must throw INV-01
      expect(() => {
        statusGovernanceService.hardDeleteStatusRequest(req.id, actorId);
      }).toThrowError(InvariantViolationError);
    });
  });
});
