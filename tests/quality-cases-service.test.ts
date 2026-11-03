import { describe, it, expect, beforeEach } from 'vitest';
import {
  qualityCaseService,
  resetQualityCasesDb,
} from '../src/lib/data-integrity/quality-cases';
import {
  getMasterTrackerDb,
  resetMasterTrackerDb,
  opportunityService,
  epService,
  exchangeService,
} from '../src/lib/data-integrity/master-tracker';
import {
  statusGovernanceService,
  resetStatusRequestDb,
} from '../src/lib/data-integrity/status-governance';
import { InvariantViolationError } from '../src/lib/data-integrity/invariants';

describe('Plan 05-01 / 05-02 / 05-03: Quality Cases & CS Minimums (M5)', () => {
  const actorId = 'mem-wadii-001';
  let exchangeId: string;
  let epId: string;
  let oppId: string;

  beforeEach(() => {
    resetMasterTrackerDb();
    resetQualityCasesDb();
    resetStatusRequestDb();

    // Create Opportunity
    const opp = opportunityService.createOpportunity(
      {
        op_id: 'ptn-test-cases-01',
        title: 'Education Project Rabat',
        programme: 'GV',
        slots: 4,
        duration_weeks: 6,
        benefits: [],
        accommodation_provided: true,
      },
      actorId
    );
    oppId = opp.id;

    // Create EP
    const ep = epService.createEp(
      {
        id: 'ep-case-001',
        expa_ep_id: 5001,
        full_name: 'Lucas Dupont',
        home_entity_id: 'ent-aiesec-france',
        contact: { email: 'lucas@example.fr' },
        owner_id: actorId,
      },
      actorId
    );
    epId = ep.id;

    // Create Exchange
    const { exchange } = exchangeService.createExchange(
      {
        ep_id: ep.id,
        opportunity_id: opp.id,
        programme: 'GV',
        status: 'RE',
        owner_id: actorId,
      },
      actorId
    );
    exchangeId = exchange.id;
  });

  describe('1. Quality Cases Lifecycle & Invariants (INV-01, INV-03, INV-09)', () => {
    it('creates a quality case with mandatory fields and logs audit entry (INV-09)', () => {
      const qCase = qualityCaseService.createCase(
        {
          exchange_id: exchangeId,
          title: 'Host family change request due to distance',
          description: 'EP commute to project site is 2 hours instead of promised 30 minutes.',
          classification: 'expectation_gap',
          owner_id: actorId,
        },
        actorId
      );

      expect(qCase.id).toBeDefined();
      expect(qCase.exchange_id).toBe(exchangeId);
      expect(qCase.classification).toBe('expectation_gap');
      expect(qCase.opened_at).toBeDefined();
      expect(qCase.closed_at).toBeNull();
      expect(qCase.compensation_amount).toBe(0);

      // Verify universal audit log entry (INV-09)
      const audit = getMasterTrackerDb().auditLogs.find(
        (l) => l.table_name === 'case_quality' && l.record_id === qCase.id && l.action === 'INSERT'
      );
      expect(audit).toBeDefined();
      expect(audit?.actor).toBe(actorId);
    });

    it('enforces INV-03: rejects case creation without mandatory active owner_id', () => {
      expect(() => {
        qualityCaseService.createCase(
          {
            exchange_id: exchangeId,
            title: 'No owner case',
            description: 'Something happened',
            classification: 'other',
            owner_id: '',
          },
          actorId
        );
      }).toThrowError(/INV-03.*mandatory active owner_id/i);
    });

    it('enforces INV-01: soft deletes case with reason and audit, hard delete is blocked', () => {
      const qCase = qualityCaseService.createCase(
        {
          exchange_id: exchangeId,
          title: 'Duplicate logged case',
          description: 'Logged twice by mistake',
          classification: 'other',
          owner_id: actorId,
        },
        actorId
      );

      const softDeleted = qualityCaseService.softDeleteCase(
        qCase.id,
        actorId,
        'Duplicate case entry'
      );
      expect(softDeleted.deleted_at).toBeDefined();
      expect(softDeleted.deleted_reason).toContain('Duplicate case entry');

      // Cannot retrieve via getCase
      expect(qualityCaseService.getCase(qCase.id)).toBeNull();

      // Hard delete attempt throws INV-01
      expect(() => {
        qualityCaseService.hardDeleteAttempt(qCase.id, actorId);
      }).toThrowError(/INV-01.*Hard deletes are strictly forbidden/i);
    });
  });

  describe('2. CS Minimum 1: Centralised Support & Response-Time Tracking (§10 Module E)', () => {
    it('records first response, computes elapsed response hours, and logs resolution step', () => {
      // Case opened 4 hours ago
      const openedAt = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();
      const qCase = qualityCaseService.createCase(
        {
          exchange_id: exchangeId,
          title: 'JD task mismatch',
          description: 'EP was asked to do fundraising instead of teaching.',
          classification: 'policy_breach',
          owner_id: actorId,
          opened_at: openedAt,
        },
        actorId
      );

      const { qualityCase: updated, responseHours } = qualityCaseService.recordFirstResponse(
        qCase.id,
        actorId,
        'Contacted EP and scheduled urgent mediation call with NGO Director.'
      );

      expect(updated.first_response_at).toBeDefined();
      expect(responseHours).toBeCloseTo(4.0, 1);
      expect(updated.resolution_steps.length).toBe(1);
      expect(updated.resolution_steps[0].action_taken).toBe('first_response');
      expect(updated.resolution_steps[0].description).toContain('mediation call');
    });

    it('appends ordered resolution steps with actor attribution and timestamps', () => {
      const qCase = qualityCaseService.createCase(
        {
          exchange_id: exchangeId,
          title: 'Stipend delayed',
          description: 'NGO delayed weekly stipend payment.',
          classification: 'expectation_gap',
          owner_id: actorId,
        },
        actorId
      );

      qualityCaseService.addResolutionStep(
        qCase.id,
        {
          action_taken: 'call_partner',
          description: 'Spoke with NGO Finance Director to clarify transfer status.',
        },
        actorId
      );

      const step2 = qualityCaseService.addResolutionStep(
        qCase.id,
        {
          action_taken: 'disburse_emergency_fund',
          description: 'Disbursed 300 MAD emergency advance to EP.',
        },
        actorId
      );

      expect(step2.resolution_steps.length).toBe(2);
      expect(step2.resolution_steps[0].step_no).toBe(1);
      expect(step2.resolution_steps[1].step_no).toBe(2);
      expect(step2.resolution_steps[1].action_taken).toBe('disburse_emergency_fund');
    });
  });

  describe('3. CS Minimum 2: EP & Exchange Tracking Dossier (§10 Module E)', () => {
    it('joins exchange, EP, opportunity, cases, and status requests into a complete dossier', () => {
      // 1. Create a quality case
      qualityCaseService.createCase(
        {
          exchange_id: exchangeId,
          title: 'Living conditions dispute',
          description: 'Broken heating in winter.',
          classification: 'policy_breach',
          owner_id: actorId,
          compensation_amount: 500,
          currency: 'MAD',
          compensation_type: 'reimbursement',
        },
        actorId
      );

      // 2. Create a status request for the exchange
      statusGovernanceService.createStatusRequest(
        {
          exchange_id: exchangeId,
          ep_id: epId,
          kind: 'break_realize',
          reason: 'Emergency health issue',
          owner_id: actorId,
        },
        actorId
      );

      const dossier = qualityCaseService.getExchangeCaseDossier(exchangeId);

      expect(dossier.exchange.id).toBe(exchangeId);
      expect(dossier.ep.full_name).toBe('Lucas Dupont');
      expect(dossier.opportunity.title).toBe('Education Project Rabat');
      expect(dossier.cases.length).toBe(1);
      expect(dossier.statusRequests.length).toBe(1);
      expect(dossier.totalCompensationMAD).toBe(500);
      expect(dossier.hasOpenCases).toBe(true);
      expect(dossier.hasPolicyBreach).toBe(true);
    });
  });

  describe('4. Mandatory Closure Gates (§10.1, Acceptance Test T-13, Rule DQ-071)', () => {
    it('T-13 / DQ-071: blocks closing when compensation > 0 and financial proof is missing', () => {
      const qCase = qualityCaseService.createCase(
        {
          exchange_id: exchangeId,
          title: 'Damaged luggage reimbursement',
          description: 'Luggage damaged during official project airport pickup.',
          classification: 'expectation_gap',
          owner_id: actorId,
          compensation_amount: 800,
          compensation_type: 'reimbursement',
        },
        actorId
      );

      // Attempt to close without financial_proof_id -> BLOCKED
      expect(() => {
        qualityCaseService.closeCase(
          qCase.id,
          {
            final_agreement_id: 'doc-agreement-ep-001',
            financial_proof_id: '', // MISSING
            closure_notes: 'Reimbursement agreed and signed',
          },
          actorId
        );
      }).toThrowError(/DQ-071.*cannot be closed without financial_proof_id/i);
    });

    it('enforces all 5 mandatory closure fields and closes case successfully with proof', () => {
      const qCase = qualityCaseService.createCase(
        {
          exchange_id: exchangeId,
          title: 'Visa extension migration fine',
          description: 'Migration fine paid due to administrative delay per S9.',
          classification: 'policy_breach',
          owner_id: actorId,
          compensation_amount: 1200,
          compensation_type: 'migration_fine',
        },
        actorId
      );

      // 1. Missing final_agreement_id -> BLOCKED
      expect(() => {
        qualityCaseService.closeCase(
          qCase.id,
          {
            final_agreement_id: '',
            financial_proof_id: 'proof-bank-transfer-001',
          },
          actorId
        );
      }).toThrowError(/CS-MANDATORY.*final_agreement_id/i);

      // 2. Complete closure payload with financial proof and signed agreement -> SUCCESS
      const closed = qualityCaseService.closeCase(
        qCase.id,
        {
          final_agreement_id: 'doc-signed-agreement-1200mad',
          financial_proof_id: 'proof-bank-receipt-1200mad',
          closure_notes: 'Paid bank transfer receipt attached. EP signed release agreement.',
        },
        actorId
      );

      expect(closed.closed_at).toBeDefined();
      expect(closed.final_agreement_id).toBe('doc-signed-agreement-1200mad');
      expect(closed.financial_proof_id).toBe('proof-bank-receipt-1200mad');
      expect(closed.compensation_type).toBe('migration_fine');

      // Universal audit log (INV-09)
      const audit = getMasterTrackerDb().auditLogs.find(
        (l) => l.table_name === 'case_quality' && l.record_id === qCase.id && l.action === 'CLOSE_CASE'
      );
      expect(audit).toBeDefined();
    });

    it('successfully closes case with compensation = 0 without needing financial proof', () => {
      const qCase = qualityCaseService.createCase(
        {
          exchange_id: exchangeId,
          title: 'Schedule adjustment',
          description: 'EP requested schedule shifted from mornings to afternoons.',
          classification: 'expectation_gap',
          owner_id: actorId,
          compensation_amount: 0,
        },
        actorId
      );

      const closed = qualityCaseService.closeCase(
        qCase.id,
        {
          final_agreement_id: 'doc-schedule-amendment-signed',
          closure_notes: 'New schedule signed by NGO and EP.',
        },
        actorId
      );

      expect(closed.closed_at).toBeDefined();
      expect(closed.final_agreement_id).toBe('doc-schedule-amendment-signed');
      expect(closed.financial_proof_id).toBeNull();
    });
  });

  describe('5. CS Minimum 3: Monthly KPI Reporting (§10.2)', () => {
    it('computes average resolution time, open cases count, total compensation, and recurrence rate', () => {
      const now = new Date('2026-11-20T12:00:00Z');
      const currentMonth = '2026-11';

      // Case 1: Closed in 2 days (48 hours), compensation 500 MAD (policy_breach)
      const c1 = qualityCaseService.createCase(
        {
          exchange_id: exchangeId,
          title: 'Case 1',
          description: 'First case',
          classification: 'policy_breach',
          owner_id: actorId,
          opened_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          compensation_amount: 500,
          compensation_type: 'refund',
        },
        actorId
      );
      qualityCaseService.closeCase(
        c1.id,
        {
          final_agreement_id: 'agr-1',
          financial_proof_id: 'prf-1',
          closed_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 2 days resolution
          closure_notes: 'Resolved',
        },
        actorId
      );

      // Case 2: Closed in 4 days (96 hours), compensation 300 MAD (expectation_gap), recurring of Case 1
      const c2 = qualityCaseService.createCase(
        {
          exchange_id: exchangeId,
          title: 'Case 2',
          description: 'Second case',
          classification: 'expectation_gap',
          owner_id: actorId,
          opened_at: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          compensation_amount: 300,
          compensation_type: 'reimbursement',
          recurrence_of: c1.id,
        },
        actorId
      );
      qualityCaseService.closeCase(
        c2.id,
        {
          final_agreement_id: 'agr-2',
          financial_proof_id: 'prf-2',
          closed_at: now.toISOString(), // 4 days resolution
          closure_notes: 'Resolved',
        },
        actorId
      );

      // Case 3: Still open
      qualityCaseService.createCase(
        {
          exchange_id: exchangeId,
          title: 'Case 3',
          description: 'Third case still open',
          classification: 'other',
          owner_id: actorId,
          opened_at: now.toISOString(),
        },
        actorId
      );

      const kpis = qualityCaseService.computeCsKpis({ month: currentMonth });

      expect(kpis.totalCases).toBe(3);
      expect(kpis.openCasesCount).toBe(1);
      expect(kpis.closedCasesCount).toBe(2);

      // Avg resolution time: (2 days + 4 days) / 2 = 3.0 days
      expect(kpis.avgResolutionTimeDays).toBe(3.0);

      // Total compensation: 500 + 300 = 800 MAD
      expect(kpis.totalCompensationAmount).toBe(800);
      expect(kpis.compensationByClassification.policy_breach).toBe(500);
      expect(kpis.compensationByClassification.expectation_gap).toBe(300);
      expect(kpis.compensationByType['refund']).toBe(500);
      expect(kpis.compensationByType['reimbursement']).toBe(300);

      // Recurrence rate: 1 recurring case out of 3 = 33.3%
      expect(kpis.recurrenceRatePct).toBe(33.3);
    });
  });
});
