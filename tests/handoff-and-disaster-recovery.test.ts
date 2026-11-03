/**
 * AIESEC iCX ERP — Ownership Handoff & Disaster Recovery Test Suite
 * Author: Wadii Hani <wadii.hani.pro@gmail.com>
 * Specification: iCX_Data_Integrity_Tracking_Spec.md v1.0 (§12, §13.3, §16 T-14, T-15, T-19)
 * Milestone: M8 (Plan 08-01, Plan 08-02, Plan 08-03, Plan 08-04)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import type { Member, RaciMatrix, SynergyTag } from '../src/lib/types/data-integrity';
import { ownershipService } from '../src/lib/data-integrity/ownership-service';
import {
  handoffWorkflowService,
  resetHandoffDb,
} from '../src/lib/data-integrity/handoff-workflow';
import {
  disasterRecoveryService,
  ScratchDatabaseState,
} from '../src/lib/data-integrity/disaster-recovery';
import { fullExportService } from '../src/lib/data-integrity/full-export';
import {
  getMasterTrackerDb,
  resetMasterTrackerDb,
  partnerService,
  exchangeService,
} from '../src/lib/data-integrity/master-tracker';
import {
  getQualityCasesDb,
  resetQualityCasesDb,
} from '../src/lib/data-integrity/quality-cases';
import {
  getIrEcosystemDb,
  resetIrEcosystemDb,
} from '../src/lib/data-integrity/ir-ecosystem';
import {
  getComplianceDb,
  resetComplianceDb,
} from '../src/lib/data-integrity/compliance-calendar';
import {
  dataQualityService,
  resetDataQualityDb,
} from '../src/lib/data-integrity/data-quality';
import {
  proofVaultService,
  resetProofVaultDb,
} from '../src/lib/data-integrity/proof-vault';
import { InvariantViolationError } from '../src/lib/data-integrity/invariants';

describe('Milestone M8: Ownership Handoff & Disaster Recovery', () => {
  const outgoingOwner = 'mem-outgoing-01';
  const incomingOwner = 'mem-incoming-02';
  const managerUser = 'mem-manager-03';
  const actorAdmin = 'mem-wadii-001';

  beforeEach(() => {
    resetMasterTrackerDb();
    resetQualityCasesDb();
    resetIrEcosystemDb();
    resetComplianceDb();
    resetHandoffDb();
    resetDataQualityDb();
    resetProofVaultDb();
    disasterRecoveryService.clearSnapshotArchive();
  });

  // ===========================================================================
  // Plan 08-01: Accountable Ownership & RACI Synergy Interfaces
  // ===========================================================================
  describe('Plan 08-01: Accountable Ownership & RACI', () => {
    it('validates mandatory accountable owner (INV-03, DQ-010)', () => {
      const missingOwner = ownershipService.validateAccountableOwner('');
      expect(missingOwner.valid).toBe(false);
      expect(missingOwner.errors[0]).toContain('INV-03');

      const validOwner = ownershipService.validateAccountableOwner('mem-valid-01');
      expect(validOwner.valid).toBe(true);
      expect(validOwner.errors).toHaveLength(0);
    });

    it('validates RACI matrix structure and active status (S8)', () => {
      const members: Member[] = [
        {
          id: 'mem-active-1',
          name: 'Active Member',
          role: 'member',
          active: true,
          created_at: new Date().toISOString(),
        },
        {
          id: 'mem-inactive-2',
          name: 'Inactive Member',
          role: 'member',
          active: false,
          created_at: new Date().toISOString(),
        },
      ];

      const validRaci: RaciMatrix = {
        accountable: 'mem-active-1',
        responsible: ['mem-active-1'],
        consulted: [],
        informed: [],
      };
      const resValid = ownershipService.validateRaciMatrix(validRaci, members);
      expect(resValid.valid).toBe(true);

      const invalidRaci: RaciMatrix = {
        accountable: 'mem-inactive-2',
      };
      const resInvalid = ownershipService.validateRaciMatrix(invalidRaci, members);
      expect(resInvalid.valid).toBe(false);
      expect(resInvalid.errors[0]).toContain('deactivated');
    });

    it('manages and filters functional synergy tags', () => {
      interface MockRecord {
        id: string;
        synergy_tags?: SynergyTag[];
      }

      const rec: MockRecord = { id: 'rec-1' };
      ownershipService.addSynergyTag(rec, 'b2b');
      ownershipService.addSynergyTag(rec, 'marketing');
      expect(rec.synergy_tags).toEqual(['b2b', 'marketing']);

      ownershipService.removeSynergyTag(rec, 'marketing');
      expect(rec.synergy_tags).toEqual(['b2b']);

      const rec2: MockRecord = { id: 'rec-2', synergy_tags: ['tm_mxp'] };
      const filtered = ownershipService.filterBySynergyTag([rec, rec2], 'b2b');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('rec-1');
    });

    it('detects inactive owners and creates handoff tasks for their manager (Acceptance Test T-06)', () => {
      const activeMember: Member = {
        id: 'mem-active',
        name: 'Active Sarah',
        role: 'member',
        active: true,
        created_at: new Date().toISOString(),
      };
      const inactiveMember: Member = {
        id: 'mem-inactive',
        name: 'Inactive Omar',
        role: 'member',
        active: false,
        created_at: new Date().toISOString(),
      };

      const records = [
        { id: 'partner-1', owner_id: 'mem-active', type: 'op_partner' },
        {
          id: 'partner-2',
          owner_id: 'mem-inactive',
          type: 'op_partner',
          manager_id: 'mem-manager-99',
        },
      ];

      const scanResult = ownershipService.scanOrphanAndInactiveOwners(
        [activeMember, inactiveMember],
        records
      );

      expect(scanResult.issues).toHaveLength(1);
      expect(scanResult.issues[0].rule_id).toBe('DQ-011');
      expect(scanResult.issues[0].severity).toBe('Blocker');

      expect(scanResult.handoffTasks).toHaveLength(1);
      expect(scanResult.handoffTasks[0].rule_id).toBe('DQ-011');
      expect(scanResult.handoffTasks[0].assigned_manager_id).toBe('mem-manager-99');
      expect(scanResult.handoffTasks[0].status).toBe('pending');
    });
  });

  // ===========================================================================
  // Plan 08-02: Handoff Workflow & Packet Generator (Acceptance Test T-15)
  // ===========================================================================
  describe('Plan 08-02: Handoff Workflow & Packet Generator', () => {
    it('generates 10-section handoff packet correctly (§12.2)', () => {
      const packet = handoffWorkflowService.generateHandoffPacket(
        outgoingOwner,
        incomingOwner,
        'individual',
        actorAdmin
      );

      expect(packet.outgoing_owner_id).toBe(outgoingOwner);
      expect(packet.incoming_owner_id).toBe(incomingOwner);
      expect(packet.openExchangesByStage).toBeDefined();
      expect(packet.overdueDeadlines).toBeDefined();
      expect(packet.openRequests).toBeDefined();
      expect(packet.openCases).toBeDefined();
      expect(packet.partners).toBeDefined();
      expect(packet.irPartners).toBeDefined();
      expect(packet.openDqIssues).toBeDefined();
      expect(packet.proofIndex).toBeDefined();
      expect(packet.changeLog30d).toBeDefined();
      expect(packet.accessList).toBeDefined();
    });

    it('Acceptance Test T-15: ownership does NOT transfer before incoming owner acknowledgment', () => {
      // 1. Create a partner and an exchange owned by outgoingOwner
      const partner = partnerService.createPartner(
        {
          name: 'Fondation Orient-Occident',
          type: 'ngo',
          city: 'Rabat',
          contact_person: 'Amina',
          channel: 'call',
          owner_id: outgoingOwner,
        },
        actorAdmin
      );

      const { exchange } = exchangeService.createExchange(
        {
          ep_id: 'EP-M8-001',
          ep_name: 'Lucas Test',
          ep_email: 'lucas@example.com',
          op_id: 'OP-001',
          programme: 'GV',
          owner_id: outgoingOwner,
        },
        actorAdmin
      );

      expect(partner.owner_id).toBe(outgoingOwner);
      expect(exchange.owner_id).toBe(outgoingOwner);

      // 2. Initiate handoff
      const handoff = handoffWorkflowService.initiateHandoff(
        outgoingOwner,
        incomingOwner,
        'individual',
        actorAdmin
      );
      expect(handoff.status).toBe('packet_generated');

      // 3. Review by outgoing owner
      handoffWorkflowService.reviewByOutgoing(handoff.id, outgoingOwner);
      expect(handoff.status).toBe('reviewed_by_outgoing');

      // 4. ATTEMPT TRANSFER WITHOUT INCOMING ACKNOWLEDGMENT -> MUST THROW T-15 ERROR
      expect(() => {
        handoffWorkflowService.executeTransfer(handoff.id, actorAdmin);
      }).toThrowError(InvariantViolationError);

      try {
        handoffWorkflowService.executeTransfer(handoff.id, actorAdmin);
      } catch (err: any) {
        expect(err.code).toBe('T-15');
        expect(err.message).toContain('incoming owner has not acknowledged');
      }

      // Partner and exchange still owned by outgoingOwner
      expect(partnerService.getPartner(partner.id)?.owner_id).toBe(outgoingOwner);
      expect(exchangeService.getExchange(exchange.id)?.owner_id).toBe(outgoingOwner);

      // 5. Incoming owner acknowledges
      handoffWorkflowService.acknowledgeByIncoming(handoff.id, incomingOwner);
      expect(handoff.status).toBe('acknowledged_by_incoming');

      // 6. Transfer now succeeds
      const transferResult = handoffWorkflowService.executeTransfer(handoff.id, actorAdmin);
      expect(transferResult.handoff.status).toBe('transferred');
      expect(transferResult.transferredCounts.partners).toBe(1);
      expect(transferResult.transferredCounts.exchanges).toBe(1);

      // Records are now assigned to incomingOwner
      expect(partnerService.getPartner(partner.id)?.owner_id).toBe(incomingOwner);
      expect(exchangeService.getExchange(exchange.id)?.owner_id).toBe(incomingOwner);

      // Universal audit log was recorded (INV-09)
      const logs = getMasterTrackerDb().auditLogs;
      const transferLog = logs.find((l) => l.action === 'BULK_OWNERSHIP_TRANSFER');
      expect(transferLog).toBeDefined();
      expect(transferLog?.actor).toBe(actorAdmin);
    });

    it('enforces INV-01: prohibiting hard delete on handoff record', () => {
      const handoff = handoffWorkflowService.initiateHandoff(
        outgoingOwner,
        incomingOwner,
        'individual',
        actorAdmin
      );

      expect(() => {
        handoffWorkflowService.hardDeleteAttempt(handoff.id, actorAdmin);
      }).toThrowError(InvariantViolationError);

      // Soft delete works
      const deleted = handoffWorkflowService.softDeleteHandoff(
        handoff.id,
        actorAdmin,
        'Created by mistake'
      );
      expect(deleted.deleted_at).toBeDefined();
      expect(deleted.deleted_reason).toContain('Created by mistake');
      expect(handoffWorkflowService.getHandoff(handoff.id)).toBeNull();
    });
  });

  // ===========================================================================
  // Plan 08-03: Disaster Recovery, Snapshot Manifest & Restore Verifier (T-14)
  // ===========================================================================
  describe('Plan 08-03: Disaster Recovery & Restore Verifier', () => {
    it('creates nightly snapshot with sha256 checksums per table (§13.3)', () => {
      // Seed some data
      partnerService.createPartner(
        {
          name: 'Partner Snapshot Test',
          type: 'company',
          city: 'Casablanca',
          contact_person: 'Yassine',
          channel: 'email',
          owner_id: outgoingOwner,
        },
        actorAdmin
      );

      const snapshot = disasterRecoveryService.createNightlySnapshot();
      expect(snapshot.manifest).toBeDefined();
      expect(snapshot.manifest.totalRows).toBeGreaterThan(0);
      expect(snapshot.manifest.manifestChecksum).toBeDefined();
      expect(snapshot.manifest.tables['op_partner']).toBeDefined();
      expect(snapshot.manifest.tables['op_partner'].rowCount).toBe(1);
      expect(snapshot.manifest.tables['op_partner'].sha256).toHaveLength(64);
    });

    it('Acceptance Test T-14: restores snapshot to scratch DB with exact matching checksums', () => {
      // 1. Create a rich operational state
      const p1 = partnerService.createPartner(
        {
          name: 'Partner Restore Test 1',
          type: 'school',
          city: 'Rabat',
          contact_person: 'Nadia',
          channel: 'meeting',
          owner_id: outgoingOwner,
        },
        actorAdmin
      );

      const { exchange: ex1 } = exchangeService.createExchange(
        {
          ep_id: 'EP-RESTORE-001',
          ep_name: 'Sophie Müller',
          ep_email: 'sophie@example.de',
          op_id: 'OP-RES-1',
          programme: 'GV',
          owner_id: outgoingOwner,
        },
        actorAdmin
      );

      // 2. Generate nightly snapshot
      const snapshot = disasterRecoveryService.createNightlySnapshot();

      // 3. Restore snapshot into scratch DB
      const scratchDb: ScratchDatabaseState = { tables: new Map() };
      const { verification } = disasterRecoveryService.restoreToScratchDb(snapshot, scratchDb);

      // 4. Assert Acceptance Test T-14 guarantees
      expect(verification.success).toBe(true);
      expect(verification.discrepancies).toHaveLength(0);
      expect(verification.totalRestoredRows).toBe(snapshot.manifest.totalRows);
      expect(verification.matchedTables).toContain('op_partner');
      expect(verification.matchedTables).toContain('exchange');

      // Verify scratch DB contents
      const restoredPartners = scratchDb.tables.get('op_partner') as any[];
      expect(restoredPartners).toBeDefined();
      expect(restoredPartners.some((p) => p.name === 'Partner Restore Test 1')).toBe(true);
    });

    it('detects tampering and flags discrepancies during restore', () => {
      const snapshot = disasterRecoveryService.createNightlySnapshot();

      // Tamper table data in transit
      snapshot.tableData['op_partner'] = JSON.stringify([
        { id: 'tampered-partner', name: 'Tampered Hack' },
      ]);

      const scratchDb: ScratchDatabaseState = { tables: new Map() };
      const { verification } = disasterRecoveryService.restoreToScratchDb(snapshot, scratchDb);

      expect(verification.success).toBe(false);
      expect(verification.discrepancies.length).toBeGreaterThan(0);
      expect(verification.discrepancies.some((d) => d.includes('checksum mismatch'))).toBe(true);
    });
  });

  // ===========================================================================
  // Plan 08-04: Full System Export & Audit Trail (T-19)
  // ===========================================================================
  describe('Plan 08-04: Full Export Engine & Audit Logger', () => {
    it('Acceptance Test T-19: CSV export writes an audit_log row with actor, scope, and row count', () => {
      partnerService.createPartner(
        {
          name: 'Partner CSV Test',
          type: 'ngo',
          city: 'Salé',
          contact_person: 'Karim',
          channel: 'call',
          owner_id: outgoingOwner,
        },
        actorAdmin
      );

      const initialLogCount = getMasterTrackerDb().auditLogs.length;

      // Execute CSV export
      const exportResult = fullExportService.exportTableCsv('op_partner', actorAdmin, 'q4_review');

      expect(exportResult.csv).toContain('Partner CSV Test');
      expect(exportResult.rowCount).toBeGreaterThanOrEqual(1);

      // Verify audit log row (Acceptance Test T-19)
      const logs = getMasterTrackerDb().auditLogs;
      expect(logs.length).toBe(initialLogCount + 1);

      const exportLog = logs[logs.length - 1];
      expect(exportLog.action).toBe('CSV_EXPORT');
      expect(exportLog.actor).toBe(actorAdmin);
      expect(exportLog.table_name).toBe('op_partner');
      expect(exportLog.after?.actor).toBe(actorAdmin);
      expect(exportLog.after?.scope).toBe('q4_review');
      expect(exportLog.after?.row_count).toBe(exportResult.rowCount);
    });

    it('generates full export bundle with snapshot manifest and proof index', () => {
      const bundle = fullExportService.generateFullExportBundle(actorAdmin, 'term_handover');

      expect(bundle.actor_id).toBe(actorAdmin);
      expect(bundle.scope).toBe('term_handover');
      expect(bundle.manifest).toBeDefined();
      expect(bundle.tables).toBeDefined();
      expect(bundle.proofIndex).toBeDefined();
      expect(bundle.ruleRegistryState).toBeDefined();

      // Universal audit log row was recorded
      const logs = getMasterTrackerDb().auditLogs;
      const bundleLog = logs.find((l) => l.action === 'FULL_EXPORT_BUNDLE');
      expect(bundleLog).toBeDefined();
      expect(bundleLog?.actor).toBe(actorAdmin);
      expect(bundleLog?.after?.scope).toBe('term_handover');
    });
  });
});
