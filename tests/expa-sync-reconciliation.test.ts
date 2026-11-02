import { describe, it, expect, beforeEach } from 'vitest';
import {
  computeFileSha256,
  validateExpaSchema,
  checkRowDropQuarantine,
  syncExpaBatch,
  scanInactiveOwners,
  resetImportBatches,
  getImportBatches,
  ExpaSyncRow,
} from '../src/lib/data-integrity/expa-sync';
import {
  entityService,
  partnerService,
  opportunityService,
  epService,
  exchangeService,
  resetMasterTrackerDb,
  getMasterTrackerDb,
} from '../src/lib/data-integrity/master-tracker';
import type { Member } from '../src/lib/types/data-integrity';

// =============================================================================
// AIESEC iCX ERP — EXPA Sync & Reconciliation Test Suite (Plan 01-03)
// Author: Wadii Hani <wadii.hani.pro@gmail.com>
// Specification: iCX_Data_Integrity_Tracking_Spec.md v1.0 (§13.1, §13.2, §16 T-04, T-05, T-06)
// =============================================================================

describe('Plan 01-03: EXPA Sync & Reconciliation Engine', () => {
  const actorAdmin = 'admin-user-01';
  const actorMember = 'member-user-02';

  beforeEach(() => {
    resetMasterTrackerDb();
    resetImportBatches();
  });

  describe('1. Schema Drift & Checksum Hashing', () => {
    it('computes deterministic SHA-256 for file payloads', () => {
      const content = 'expa_ep_id,full_name,status\n101,John Doe,APD';
      const hash1 = computeFileSha256(content);
      const hash2 = computeFileSha256(content);
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64);
    });

    it('validates canonical EXPA export headers and detects schema drift', () => {
      const valid = validateExpaSchema(['expa_ep_id', 'full_name', 'status', 're_date']);
      expect(valid.valid).toBe(true);

      const invalid = validateExpaSchema(['unrelated_col_a', 'unrelated_col_b']);
      expect(invalid.valid).toBe(false);
      expect(invalid.missingHeaders).toContain('expa_ep_id');
      expect(invalid.missingHeaders).toContain('full_name');
      expect(invalid.missingHeaders).toContain('status');
    });
  });

  // Acceptance Test T-04: >5% Row-Drop Quarantine Guard (DQ-082)
  describe('2. Acceptance Test T-04: Row-Drop Quarantine Guard (DQ-082)', () => {
    it('quarantines batch when row count drops >5% vs previous batch', () => {
      const check10Pct = checkRowDropQuarantine(90, 100, 5); // 10% drop vs 5% threshold
      expect(check10Pct.quarantined).toBe(true);
      expect(check10Pct.dropPct).toBe(10);
      expect(check10Pct.reason).toContain('exceeding max allowed drop of 5%');

      // Drop within threshold (< 5%) is allowed
      const check3Pct = checkRowDropQuarantine(98, 100, 5); // 2% drop
      expect(check3Pct.quarantined).toBe(false);
    });

    it('Given EXPA import with 10% fewer rows than previous batch, then batch is quarantined, nothing applied, DQ-082 raised', () => {
      // Step 1: Initial successful batch with 10 rows
      const initialRows: ExpaSyncRow[] = Array.from({ length: 10 }, (_, i) => ({
        expa_ep_id: 1000 + i,
        full_name: `EP ${i}`,
        status: 'APL',
      }));

      const res1 = syncExpaBatch({
        rawContent: 'initial-batch-data',
        rows: initialRows,
        actorId: actorAdmin,
      });
      expect(res1.status).toBe('applied');
      expect(res1.quarantined).toBe(false);
      expect(res1.rowsIn).toBe(10);

      // Step 2: Second batch with 9 rows (10% drop vs 10 rows, exceeding 5% threshold)
      const droppedRows: ExpaSyncRow[] = Array.from({ length: 9 }, (_, i) => ({
        expa_ep_id: 1000 + i,
        full_name: `EP ${i}`,
        status: 'APD',
      }));

      const res2 = syncExpaBatch({
        rawContent: 'dropped-batch-data',
        rows: droppedRows,
        actorId: actorAdmin,
        customThresholdPct: 5, // 5% rule
      });

      expect(res2.quarantined).toBe(true);
      expect(res2.status).toBe('quarantined');
      expect(res2.rowsOk).toBe(0);
      expect(res2.reconciledCount).toBe(0);

      // Verify DQ-082 Blocker issue is logged
      const dq082 = res2.dqIssues.find((i) => i.rule_id === 'DQ-082');
      expect(dq082).toBeDefined();
      expect(dq082?.severity).toBe('Blocker');
      expect(dq082?.details?.drop_pct).toBe(10);
    });
  });

  // Acceptance Test T-05: Status Reconciliation & EXPA Authority (INV-04 / DQ-040)
  describe('3. Acceptance Test T-05: Status Reconciliation & EXPA Authority', () => {
    it('Given EXPA says RE and tracker says APD, when sync runs, then tracker adopts RE, history logged expa_sync, DQ-040 raised then auto-resolved', () => {
      // Setup: Create Opportunity, EP, Exchange in tracker with status APD
      const partner = partnerService.createPartner(
        { name: 'Partner Rec', type: 'NGO', city: 'Rabat', owner_id: actorMember, stage: 'agreement', preferred_channel: 'call', expa_org_id: 1234 },
        actorAdmin
      );
      const opp = opportunityService.createOpportunity(
        { op_id: partner.id, programme: 'GV', title: 'Opp Rec', slots: 5, duration_weeks: 6, hours_per_week: 30, benefits: ['acc'], accommodation_provided: true },
        actorAdmin,
        '2026-06-01'
      );
      const ep = epService.createEp(
        { expa_ep_id: 887711, full_name: 'Camilla Brown', home_entity_id: 'lc-london', contact: { email: 'camilla@test.com' }, owner_id: actorMember },
        actorAdmin
      );

      const { exchange } = exchangeService.createExchange(
        { ep_id: ep.id, opportunity_id: opp.id, programme: 'GV', status: 'APD', owner_id: actorMember },
        actorMember
      );
      expect(exchange.status).toBe('APD');

      // EXPA Sync incoming row with status 'RE'
      const expaRow: ExpaSyncRow = {
        expa_ep_id: 887711,
        full_name: 'Camilla Brown',
        status: 'RE',
        re_date: '2026-06-15',
      };

      const syncResult = syncExpaBatch({
        rawContent: 'sync-reconcile-data',
        rows: [expaRow],
        actorId: actorAdmin,
      });

      expect(syncResult.status).toBe('applied');
      expect(syncResult.reconciledCount).toBe(1);

      // 1. Tracker adopted RE (EXPA wins)
      const updatedExchange = exchangeService.getExchange(exchange.id);
      expect(updatedExchange?.status).toBe('RE');

      // 2. History entry recorded with source = 'expa_sync'
      const db = getMasterTrackerDb();
      const lastHistory = db.statusHistories[db.statusHistories.length - 1];
      expect(lastHistory.to_status).toBe('RE');
      expect(lastHistory.source).toBe('expa_sync');
      expect(updatedExchange?.re_date).toBe('2026-06-15');

      // 3. DQ-040 raised and auto-resolved
      const dq040 = syncResult.dqIssues.find((i) => i.rule_id === 'DQ-040');
      expect(dq040).toBeDefined();
      expect(dq040?.severity).toBe('Blocker');
      expect(dq040?.resolved_at).toBeDefined(); // Auto-resolved
      expect(dq040?.details?.resolution_note).toContain('EXPA is source of truth');
    });

    it('flags DQ-042 when EP in tracker is missing from EXPA, preserving the record per INV-01', () => {
      const partner = partnerService.createPartner(
        { name: 'Partner Preserved', type: 'NGO', city: 'Rabat', owner_id: actorMember, stage: 'agreement', preferred_channel: 'call', expa_org_id: 4567 },
        actorAdmin
      );
      const opp = opportunityService.createOpportunity(
        { op_id: partner.id, programme: 'GV', title: 'Opp P', slots: 5, duration_weeks: 6, hours_per_week: 30, benefits: ['acc'], accommodation_provided: true },
        actorAdmin,
        '2026-06-01'
      );
      const ep = epService.createEp(
        { expa_ep_id: 999111, full_name: 'Preserved EP', home_entity_id: 'lc-paris', contact: { email: 'p@test.com' }, owner_id: actorMember },
        actorAdmin
      );

      // Ingest EXPA batch containing a DIFFERENT EP
      const syncResult = syncExpaBatch({
        rawContent: 'different-ep-batch',
        rows: [
          {
            expa_ep_id: 111999, // not in tracker
            full_name: 'Other EP',
            status: 'APL',
          },
        ],
        actorId: actorAdmin,
      });

      // DQ-042 flagged for missing EP
      const dq042 = syncResult.dqIssues.find((i) => i.rule_id === 'DQ-042' && i.details?.ep_id === ep.id);
      expect(dq042).toBeDefined();

      // Record in tracker is NOT deleted (INV-01)
      expect(epService.getEp(ep.id)).not.toBeNull();
    });
  });

  // Acceptance Test T-06: Deactivated Owner Detection (DQ-011)
  describe('4. Acceptance Test T-06: Inactive Owner Detection (DQ-011)', () => {
    it('Given a record owner is deactivated, then DQ-011 fires and handoff is flagged', () => {
      const activeMember: Member = {
        id: 'member-active-1',
        name: 'Sara Active',
        role: 'MEMBER_CXP',
        active: true,
        created_at: new Date().toISOString(),
      };

      const deactivatedMember: Member = {
        id: 'member-inactive-2',
        name: 'Omar Inactive',
        role: 'MEMBER_BD',
        active: false, // Deactivated member
        created_at: new Date().toISOString(),
      };

      const records = [
        { id: 'partner-10', owner_id: activeMember.id, type: 'partner' },
        { id: 'partner-20', owner_id: deactivatedMember.id, type: 'partner' },
        { id: 'exchange-30', owner_id: deactivatedMember.id, type: 'exchange' },
      ];

      const issues = scanInactiveOwners([activeMember, deactivatedMember], records);

      expect(issues).toHaveLength(2);
      expect(issues[0].rule_id).toBe('DQ-011');
      expect(issues[0].severity).toBe('Blocker');
      expect(issues[0].details?.handoff_required).toBe(true);
      expect(issues[0].details?.owner_name).toBe('Omar Inactive');
    });
  });
});
