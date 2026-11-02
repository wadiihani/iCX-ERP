import { describe, it, expect, beforeEach } from 'vitest';
import {
  partnerService,
  opportunityService,
  contractService,
  epService,
  exchangeService,
  resetMasterTrackerDb,
  getMasterTrackerDb,
} from '../src/lib/data-integrity/master-tracker';
import { InvariantViolationError } from '../src/lib/data-integrity/invariants';
import type { ActorContext } from '../src/lib/data-integrity/rbac';

// =============================================================================
// AIESEC iCX ERP — Master Tracker CRUD & Relational Services Test Suite (Plan 01-01)
// Author: Wadii Hani <wadii.hani.pro@gmail.com>
// Specification: iCX_Data_Integrity_Tracking_Spec.md v1.0 (§5 Module A)
// =============================================================================

describe('Plan 01-01: Master Tracker Relational CRUD Data Services', () => {
  const actorAdmin = 'admin-user-01';
  const actorMember = 'member-user-02';

  beforeEach(() => {
    resetMasterTrackerDb();
  });

  describe('1. OpPartner Service', () => {
    it('creates partner with owner and initial touchpoint', () => {
      const partner = partnerService.createPartner(
        {
          name: 'Fondation Zakoura',
          type: 'NGO',
          city: 'Casablanca',
          owner_id: actorMember,
          stage: 'contacted',
          persona: 'NGO Project Manager',
          preferred_channel: 'meeting',
          objection_tags: ['no budget'],
        },
        actorAdmin
      );

      expect(partner.id).toBeDefined();
      expect(partner.name).toBe('Fondation Zakoura');
      expect(partner.last_touchpoint_at).toBeDefined();

      const fetched = partnerService.getPartner(partner.id);
      expect(fetched?.name).toBe('Fondation Zakoura');
    });

    it('rejects partner creation without mandatory owner_id (INV-03)', () => {
      expect(() => {
        partnerService.createPartner(
          {
            name: 'Anonymous Partner',
            type: 'Company',
            city: 'Rabat',
            owner_id: '',
            stage: 'lead',
          },
          actorAdmin
        );
      }).toThrowError(InvariantViolationError);
    });

    it('records touchpoint updating last_touchpoint_at', () => {
      const partner = partnerService.createPartner(
        {
          name: 'MCISE Rabat',
          type: 'Incubator',
          city: 'Rabat',
          owner_id: actorMember,
          stage: 'meeting',
        },
        actorAdmin
      );

      const updated = partnerService.recordTouchpoint(partner.id, actorMember, 'Discussed summer slots');
      expect(updated.last_touchpoint_at).toBeDefined();
    });

    it('enforces soft-delete with mandatory reason and blocks physical hard delete (INV-01)', () => {
      const partner = partnerService.createPartner(
        {
          name: 'Stale Partner',
          type: 'NGO',
          city: 'Rabat',
          owner_id: actorMember,
          stage: 'closed_lost',
        },
        actorAdmin
      );

      // Soft delete
      const deleted = partnerService.softDeletePartner(partner.id, actorAdmin, 'Partner dissolved');
      expect(deleted.deleted_at).toBeDefined();
      expect(deleted.deleted_reason).toContain('Partner dissolved');
      expect(partnerService.getPartner(partner.id)).toBeNull();

      // Physical delete attempt raises exception
      expect(() => {
        partnerService.hardDeleteAttempt(partner.id, actorAdmin);
      }).toThrowError(InvariantViolationError);
    });
  });

  describe('2. Opportunity Service', () => {
    it('creates opportunity with valid duration and working hours (INV-08)', () => {
      const partner = partnerService.createPartner(
        {
          name: 'Green Future NGO',
          type: 'NGO',
          city: 'Rabat',
          owner_id: actorMember,
          stage: 'agreement',
        },
        actorAdmin
      );

      const opp = opportunityService.createOpportunity(
        {
          op_id: partner.id,
          programme: 'GV',
          title: 'Eco-Rabat Summer 2026',
          slots: 10,
          duration_weeks: 6,
          hours_per_week: 30,
          benefits: ['accommodation', 'certificate'],
          accommodation_provided: true,
        },
        actorAdmin,
        '2026-06-01'
      );

      expect(opp.id).toBeDefined();
      expect(opp.slots).toBe(10);
    });

    it('rejects opportunity when duration violates versioned statutory rules (INV-08)', () => {
      const partner = partnerService.createPartner(
        {
          name: 'Partner X',
          type: 'NGO',
          city: 'Rabat',
          owner_id: actorMember,
          stage: 'agreement',
        },
        actorAdmin
      );

      // GV: 2 weeks is below minimum 4 weeks
      expect(() => {
        opportunityService.createOpportunity(
          {
            op_id: partner.id,
            programme: 'GV',
            title: 'Too Short GV',
            slots: 5,
            duration_weeks: 2,
            hours_per_week: 30,
            benefits: [],
            accommodation_provided: true,
          },
          actorAdmin,
          '2026-06-01'
        );
      }).toThrowError(InvariantViolationError);
    });

    it('computes slot capacity correctly', () => {
      const partner = partnerService.createPartner(
        {
          name: 'Partner Slots',
          type: 'NGO',
          city: 'Rabat',
          owner_id: actorMember,
          stage: 'agreement',
        },
        actorAdmin
      );

      const opp = opportunityService.createOpportunity(
        {
          op_id: partner.id,
          programme: 'GV',
          title: 'Slots Test',
          slots: 3,
          duration_weeks: 6,
          hours_per_week: 25,
          benefits: [],
          accommodation_provided: true,
        },
        actorAdmin,
        '2026-06-01'
      );

      const cap0 = opportunityService.getSlotCapacity(opp.id);
      expect(cap0.totalSlots).toBe(3);
      expect(cap0.filledSlots).toBe(0);
      expect(cap0.availableSlots).toBe(3);
    });
  });

  describe('3. Contract Service', () => {
    it('links contract to opportunity with deadlines and payment terms', () => {
      const partner = partnerService.createPartner(
        {
          name: 'Contract Partner',
          type: 'Company',
          city: 'Rabat',
          owner_id: actorMember,
          stage: 'agreement',
        },
        actorAdmin
      );

      const opp = opportunityService.createOpportunity(
        {
          op_id: partner.id,
          programme: 'GV',
          title: 'Contract Opp',
          slots: 2,
          duration_weeks: 6,
          hours_per_week: 25,
          benefits: [],
          accommodation_provided: true,
        },
        actorAdmin,
        '2026-06-01'
      );

      const contract = contractService.createContract(
        {
          opportunity_id: opp.id,
          signed_at: '2026-05-15',
          payment_terms: '50% upon signature, 50% upon EP arrival',
          key_deadlines: { arrival_date: '2026-07-01' },
          document_id: 'doc-drive-uuid-1234',
        },
        actorAdmin
      );

      expect(contract.id).toBeDefined();
      const byOpp = contractService.getContractByOpportunity(opp.id);
      expect(byOpp?.id).toBe(contract.id);
    });
  });

  describe('4. EP Service', () => {
    it('creates EP and enforces unique EXPA EP ID (DQ-001)', () => {
      const ep1 = epService.createEp(
        {
          expa_ep_id: 11223344,
          full_name: 'Marco Rossi',
          home_entity_id: 'lc-milan',
          contact: {
            email: 'marco.rossi@aiesec.net',
            phone: '+39 340 1234567',
          },
          owner_id: actorMember,
        },
        actorAdmin
      );

      expect(ep1.id).toBeDefined();

      // Duplicate EXPA ID must throw DQ-001
      expect(() => {
        epService.createEp(
          {
            expa_ep_id: 11223344, // duplicate
            full_name: 'Marco Imposter',
            home_entity_id: 'lc-rome',
            contact: { email: 'fake@example.com' },
            owner_id: actorMember,
          },
          actorAdmin
        );
      }).toThrowError(InvariantViolationError);
    });

    it('masks contact fields for non-owner viewer roles (INV-10, T-18)', () => {
      const ep = epService.createEp(
        {
          expa_ep_id: 55667788,
          full_name: 'Elena Gilbert',
          home_entity_id: 'lc-athens',
          contact: {
            email: 'elena@gmail.com',
            phone: '+30 690 1234567',
          },
          owner_id: actorMember,
        },
        actorAdmin
      );

      const viewerUnauthorized: ActorContext = {
        id: 'other-member',
        role: 'MEMBER',
      };

      const viewerOwner: ActorContext = {
        id: actorMember,
        role: 'MEMBER',
      };

      const viewerLcvp: ActorContext = {
        id: 'vp-user',
        role: 'LCVP_IGV',
      };

      // Masked for unrelated member
      const sanitized = epService.getEp(ep.id, viewerUnauthorized);
      expect(sanitized?.contact.email).toBe('[REDACTED]');
      expect(sanitized?.contact.phone).toBe('[REDACTED]');
      expect(sanitized?.full_name).toBe('Elena Gilbert');

      // Visible to owner
      const ownerView = epService.getEp(ep.id, viewerOwner);
      expect(ownerView?.contact.email).toBe('elena@gmail.com');

      // Visible to LCVP
      const lcvpView = epService.getEp(ep.id, viewerLcvp);
      expect(lcvpView?.contact.email).toBe('elena@gmail.com');
    });
  });

  describe('5. Exchange Service (Central Record)', () => {
    it('creates exchange, automatically instantiates 16 standard checks, and writes initial status history', () => {
      const partner = partnerService.createPartner(
        {
          name: 'Partner Ex',
          type: 'NGO',
          city: 'Rabat',
          owner_id: actorMember,
          stage: 'agreement',
        },
        actorAdmin
      );

      const opp = opportunityService.createOpportunity(
        {
          op_id: partner.id,
          programme: 'GV',
          title: 'Exchange Opp',
          slots: 2,
          duration_weeks: 6,
          hours_per_week: 25,
          benefits: [],
          accommodation_provided: true,
        },
        actorAdmin,
        '2026-06-01'
      );

      const ep = epService.createEp(
        {
          expa_ep_id: 99887766,
          full_name: 'Lucas Silva',
          home_entity_id: 'lc-lisbon',
          contact: { email: 'lucas@gmail.com' },
          owner_id: actorMember,
        },
        actorAdmin
      );

      const { exchange, standardChecks, initialHistory } = exchangeService.createExchange(
        {
          ep_id: ep.id,
          opportunity_id: opp.id,
          programme: 'GV',
          status: 'APL',
          owner_id: actorMember,
        },
        actorMember
      );

      expect(exchange.id).toBeDefined();
      expect(exchange.status).toBe('APL');

      // Exactly 16 standard checks created (§5.1 line 246)
      expect(standardChecks).toHaveLength(16);
      expect(standardChecks.every((c) => c.tracked_status === 'not_started')).toBe(true);

      // Initial status history synchronized (DQ-080)
      expect(initialHistory.to_status).toBe('APL');
      expect(initialHistory.exchange_id).toBe(exchange.id);

      // Capacity now reflects 1 filled slot
      const cap = opportunityService.getSlotCapacity(opp.id);
      expect(cap.filledSlots).toBe(1);
      expect(cap.availableSlots).toBe(1);
    });

    it('enforces 1 EP x 1 Opportunity unique constraint (INV-06)', () => {
      const partner = partnerService.createPartner(
        { name: 'P1', type: 'NGO', city: 'Rabat', owner_id: actorMember, stage: 'agreement' },
        actorAdmin
      );
      const opp = opportunityService.createOpportunity(
        { op_id: partner.id, programme: 'GV', title: 'O1', slots: 5, duration_weeks: 6, hours_per_week: 30, benefits: [], accommodation_provided: true },
        actorAdmin,
        '2026-06-01'
      );
      const ep = epService.createEp(
        { expa_ep_id: 121212, full_name: 'EP One', home_entity_id: 'lc-1', contact: {}, owner_id: actorMember },
        actorAdmin
      );

      exchangeService.createExchange(
        { ep_id: ep.id, opportunity_id: opp.id, programme: 'GV', status: 'APL', owner_id: actorMember },
        actorMember
      );

      // Duplicate match must throw INV-06
      expect(() => {
        exchangeService.createExchange(
          { ep_id: ep.id, opportunity_id: opp.id, programme: 'GV', status: 'APL', owner_id: actorMember },
          actorMember
        );
      }).toThrowError(InvariantViolationError);
    });

    it('transitions status atomically with synchronized status_history entry (DQ-080)', () => {
      const partner = partnerService.createPartner(
        { name: 'P2', type: 'NGO', city: 'Rabat', owner_id: actorMember, stage: 'agreement' },
        actorAdmin
      );
      const opp = opportunityService.createOpportunity(
        { op_id: partner.id, programme: 'GV', title: 'O2', slots: 5, duration_weeks: 6, hours_per_week: 30, benefits: [], accommodation_provided: true },
        actorAdmin,
        '2026-06-01'
      );
      const ep = epService.createEp(
        { expa_ep_id: 343434, full_name: 'EP Two', home_entity_id: 'lc-2', contact: {}, owner_id: actorMember },
        actorAdmin
      );

      const { exchange } = exchangeService.createExchange(
        { ep_id: ep.id, opportunity_id: opp.id, programme: 'GV', status: 'APL', owner_id: actorMember },
        actorMember
      );

      // Transition to ACP
      const resAcp = exchangeService.transitionStatus(exchange.id, 'ACP', {
        actorId: actorMember,
        reason: 'EP interviewed and accepted',
        skipGuards: true,
      });
      expect(resAcp.updatedExchange.status).toBe('ACP');
      expect(resAcp.historyEntry.from_status).toBe('APL');
      expect(resAcp.historyEntry.to_status).toBe('ACP');

      // Transition to APD
      const resApd = exchangeService.transitionStatus(exchange.id, 'APD', {
        actorId: actorMember,
        reason: 'Contract signed',
        skipGuards: true,
      });
      expect(resApd.updatedExchange.status).toBe('APD');
      expect(resApd.historyEntry.from_status).toBe('ACP');
      expect(resApd.historyEntry.to_status).toBe('APD');

      // Verify db history ledger has both entries
      const db = getMasterTrackerDb();
      const exHistories = db.statusHistories.filter((h) => h.exchange_id === exchange.id);
      expect(exHistories).toHaveLength(3); // Initial APL + ACP + APD
    });
  });
});
