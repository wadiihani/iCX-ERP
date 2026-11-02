import { describe, it, expect, beforeEach } from 'vitest';
import {
  validateStageRequiredFields,
  assertTransitionGuards,
  statusToFlowStage,
  createDq020Issue,
} from '../src/lib/data-integrity/stage-gates';
import {
  entityService,
  partnerService,
  opportunityService,
  contractService,
  epService,
  exchangeService,
  resetMasterTrackerDb,
} from '../src/lib/data-integrity/master-tracker';
import { InvariantViolationError } from '../src/lib/data-integrity/invariants';
import type { Exchange, EntityOrg, OpPartner, Opportunity, Contract, Ep } from '../src/lib/types/data-integrity';

// =============================================================================
// AIESEC iCX ERP — Stage Required-Field Validator Gates Test Suite (Plan 01-02)
// Author: Wadii Hani <wadii.hani.pro@gmail.com>
// Specification: iCX_Data_Integrity_Tracking_Spec.md v1.0 (§4.1, §4.2, §5.1, §16 T-11)
// =============================================================================

describe('Plan 01-02: Stage Required-Field Validator Gates', () => {
  const actorMember = 'member-001';
  const actorAdmin = 'admin-001';

  beforeEach(() => {
    resetMasterTrackerDb();
  });

  describe('1. Stage Status Mapping (§4.1)', () => {
    it('correctly maps EXPA statuses to customer flow stages', () => {
      expect(statusToFlowStage('APL')).toBe('consideration');
      expect(statusToFlowStage('ACP')).toBe('consideration');
      expect(statusToFlowStage('APD')).toBe('preparation');
      expect(statusToFlowStage('RE')).toBe('experience');
      expect(statusToFlowStage('FI')).toBe('post_experience');
      expect(statusToFlowStage('CO')).toBe('post_experience');
    });
  });

  describe('2. Stage Required Fields Matrix (§5.1)', () => {
    it('validates attraction stage requirements', () => {
      const exchange: Exchange = {
        id: 'ex-attraction',
        ep_id: 'ep-placeholder',
        opportunity_id: 'opp-placeholder',
        programme: 'GV',
        status: 'APL',
        owner_id: actorMember,
        created_at: new Date().toISOString(),
      };

      const partner: OpPartner = {
        id: 'p-1',
        name: 'NGO Hope',
        type: 'NGO',
        city: 'Rabat',
        expa_org_id: 12345,
        owner_id: actorMember,
        stage: 'lead',
        preferred_channel: 'call',
        created_at: new Date().toISOString(),
      };

      const result = validateStageRequiredFields('attraction', {
        exchange,
        partner,
      });

      expect(result.passed).toBe(true);
      expect(result.missingFields).toHaveLength(0);
    });

    it('detects missing consideration fields when opportunity or EP details are absent', () => {
      const exchange: Exchange = {
        id: 'ex-incomplete',
        ep_id: 'ep-placeholder',
        opportunity_id: 'opp-placeholder',
        programme: 'GV',
        status: 'APL',
        owner_id: actorMember,
        created_at: new Date().toISOString(),
      };

      const result = validateStageRequiredFields('consideration', {
        exchange,
        partner: null,
        opportunity: null,
        ep: null,
      });

      expect(result.passed).toBe(false);
      expect(result.missingFields).toContain('partner');
      expect(result.missingFields).toContain('opportunity');
      expect(result.missingFields).toContain('ep');
    });

    it('detects missing preparation fields when contract or approved dates are missing', () => {
      const exchange: Exchange = {
        id: 'ex-prep',
        ep_id: 'ep-placeholder',
        opportunity_id: 'opp-placeholder',
        programme: 'GV',
        status: 'APD',
        owner_id: actorMember,
        approved_at: null, // missing approved date
        re_date: null, // missing RE date
        created_at: new Date().toISOString(),
      };

      const result = validateStageRequiredFields('preparation', {
        exchange,
        partner: {
          id: 'p-1',
          name: 'P',
          type: 'NGO',
          city: 'Rabat',
          expa_org_id: 111,
          owner_id: actorMember,
          stage: 'agreement',
          preferred_channel: 'meeting',
          created_at: new Date().toISOString(),
        },
        opportunity: {
          id: 'o-1',
          op_id: 'p-1',
          programme: 'GV',
          title: 'Opp',
          slots: 1,
          duration_weeks: 6,
          hours_per_week: 30,
          benefits: ['accommodation'],
          accommodation_provided: true,
          created_at: new Date().toISOString(),
        },
        ep: {
          id: 'e-1',
          expa_ep_id: 222,
          full_name: 'EP',
          home_entity_id: 'entity-1',
          contact: { email: 'ep@test.com' },
          owner_id: actorMember,
          created_at: new Date().toISOString(),
        },
        contract: null, // missing contract
        standardChecks: [], // missing 16 standard checks
      });

      expect(result.passed).toBe(false);
      expect(result.missingFields).toContain('contract');
      expect(result.missingFields).toContain('exchange.approved_at');
      expect(result.missingFields).toContain('exchange.re_date');
      expect(result.missingFields).toContain('standard_checks.16_rows_created');
    });
  });

  describe('3. Transition Guards & Acceptance Tests (§4.2, T-11)', () => {
    it('Acceptance Test T-11 (INV-07): blocks approval and realization when home entity is frozen', () => {
      const frozenEntity = entityService.createEntity(
        {
          name: 'AIESEC in Athens',
          kind: 'LC',
          country: 'Greece',
          is_frozen: true,
          frozen_since: '2026-04-01T00:00:00Z',
        },
        actorAdmin
      );

      const partner = partnerService.createPartner(
        { name: 'P Frozen', type: 'NGO', city: 'Rabat', owner_id: actorMember, stage: 'agreement', preferred_channel: 'call', expa_org_id: 9911 },
        actorAdmin
      );
      const opp = opportunityService.createOpportunity(
        { op_id: partner.id, programme: 'GV', title: 'Opp Frozen', slots: 5, duration_weeks: 6, hours_per_week: 30, benefits: ['acc'], accommodation_provided: true },
        actorAdmin,
        '2026-06-01'
      );
      const ep = epService.createEp(
        { expa_ep_id: 777111, full_name: 'Kostas P', home_entity_id: frozenEntity.id, contact: { email: 'kostas@test.com' }, owner_id: actorMember },
        actorAdmin
      );

      const { exchange } = exchangeService.createExchange(
        { ep_id: ep.id, opportunity_id: opp.id, programme: 'GV', status: 'APL', owner_id: actorMember },
        actorMember
      );

      // Attempting approval (APD) on a frozen entity must be blocked with ICB reference
      expect(() => {
        exchangeService.transitionStatus(exchange.id, 'APD', {
          actorId: actorMember,
          reason: 'Attempting approval',
        });
      }).toThrowError(InvariantViolationError);

      try {
        exchangeService.transitionStatus(exchange.id, 'APD', {
          actorId: actorMember,
          reason: 'Attempting approval',
        });
      } catch (err) {
        const invErr = err as InvariantViolationError;
        expect(invErr.code).toBe('INV-07');
        expect(invErr.message).toContain('is FROZEN by ICB');
        expect(invErr.message).toContain('clause 8.4.3.3.3.5.3');
      }
    });

    it('blocks manual transition to CO without EP survey confirmation (S1)', () => {
      const entity = entityService.createEntity(
        { name: 'AIESEC in Madrid', kind: 'LC', country: 'Spain', is_frozen: false },
        actorAdmin
      );
      const partner = partnerService.createPartner(
        { name: 'P Complete', type: 'NGO', city: 'Rabat', owner_id: actorMember, stage: 'agreement', preferred_channel: 'meeting', expa_org_id: 8822 },
        actorAdmin
      );
      const opp = opportunityService.createOpportunity(
        { op_id: partner.id, programme: 'GV', title: 'Opp Complete', slots: 5, duration_weeks: 6, hours_per_week: 30, benefits: ['acc'], accommodation_provided: true },
        actorAdmin,
        '2026-06-01'
      );
      const contract = contractService.createContract(
        { opportunity_id: opp.id, signed_at: '2026-05-01', payment_terms: 'Full', key_deadlines: { arrival: '2026-06-01' }, document_id: 'doc-1' },
        actorAdmin
      );
      const ep = epService.createEp(
        { expa_ep_id: 555333, full_name: 'Alejandro G', home_entity_id: entity.id, contact: { email: 'al@test.com' }, owner_id: actorMember },
        actorAdmin
      );

      const { exchange } = exchangeService.createExchange(
        {
          ep_id: ep.id,
          opportunity_id: opp.id,
          programme: 'GV',
          status: 'FI',
          owner_id: actorMember,
          approved_at: '2026-05-10',
          re_date: '2026-06-01',
          fi_date: '2026-07-15',
        },
        actorMember
      );

      // Attempting to manually set CO without EP survey confirmation is blocked
      expect(() => {
        exchangeService.transitionStatus(exchange.id, 'CO', {
          actorId: actorMember,
          source: 'manual',
          hasEpSurveyConfirmation: false,
        });
      }).toThrowError(/requires EP's confirmation via Exchange Survey/);

      // With EP survey confirmation, transition succeeds
      const result = exchangeService.transitionStatus(exchange.id, 'CO', {
        actorId: actorMember,
        source: 'manual',
        hasEpSurveyConfirmation: true,
      });
      expect(result.updatedExchange.status).toBe('CO');
    });

    it('bypasses transition guards when source is expa_sync (INV-04 EXPA Authority)', () => {
      const frozenEntity = entityService.createEntity(
        { name: 'AIESEC in Rome', kind: 'LC', country: 'Italy', is_frozen: true },
        actorAdmin
      );
      const partner = partnerService.createPartner(
        { name: 'P EXPA', type: 'NGO', city: 'Rabat', owner_id: actorMember, stage: 'agreement', preferred_channel: 'call', expa_org_id: 1200 },
        actorAdmin
      );
      const opp = opportunityService.createOpportunity(
        { op_id: partner.id, programme: 'GV', title: 'Opp EXPA', slots: 5, duration_weeks: 6, hours_per_week: 30, benefits: ['acc'], accommodation_provided: true },
        actorAdmin,
        '2026-06-01'
      );
      const ep = epService.createEp(
        { expa_ep_id: 888444, full_name: 'Gianluigi B', home_entity_id: frozenEntity.id, contact: { email: 'gb@test.com' }, owner_id: actorMember },
        actorAdmin
      );

      const { exchange } = exchangeService.createExchange(
        { ep_id: ep.id, opportunity_id: opp.id, programme: 'GV', status: 'APL', owner_id: actorMember },
        actorMember
      );

      // When sync comes from EXPA, it is recorded unconditionally per INV-04
      const syncResult = exchangeService.transitionStatus(exchange.id, 'APD', {
        actorId: actorAdmin,
        source: 'expa_sync',
        reason: 'EXPA sync status update',
      });

      expect(syncResult.updatedExchange.status).toBe('APD');
      expect(syncResult.historyEntry.source).toBe('expa_sync');
    });

    it('generates structured DQ-020 data quality issues when mandatory stage fields are missing', () => {
      const dqIssue = createDq020Issue(
        'ex-test-uuid',
        'preparation',
        ['contract', 'exchange.approved_at'],
        actorMember,
        true
      );

      expect(dqIssue.rule_id).toBe('DQ-020');
      expect(dqIssue.severity).toBe('Blocker');
      expect(dqIssue.details?.missing_fields).toEqual(['contract', 'exchange.approved_at']);
    });
  });
});
