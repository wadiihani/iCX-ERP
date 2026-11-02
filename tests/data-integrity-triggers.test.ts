import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import {
  assertNoHardDelete,
  createDq081Issue,
  assertAppendOnly,
  assertEpReportedImmutable,
  prepareStatusTransition,
  createSoftDeletePayload,
  InvariantViolationError,
} from '../src/lib/data-integrity/invariants';
import type { Exchange, ExStatus } from '../src/lib/types/data-integrity';

// =============================================================================
// AIESEC iCX ERP — Data Integrity Triggers & Append-Only Verification (Plan 00-02)
// Author: Wadii Hani <wadii.hani.pro@gmail.com>
// Specification: iCX_Data_Integrity_Tracking_Spec.md v1.0 (§2, §3.3, §16 T-01..T-03)
// =============================================================================

describe('Plan 00-02: Database Integrity Triggers & Invariants', () => {
  const migrationPath = path.resolve(
    process.cwd(),
    'supabase/migrations/20261102000002_icx_data_integrity_triggers_v1.sql'
  );
  const migrationSql = fs.readFileSync(migrationPath, 'utf8');

  describe('1. DDL Migration Triggers Definition Verification', () => {
    it('should create dq_issue table with proper columns and severity checks', () => {
      expect(migrationSql).toMatch(/CREATE TABLE IF NOT EXISTS dq_issue/i);
      expect(migrationSql).toMatch(/severity IN \('Urgent', 'Blocker', 'Warn', 'Review'\)/i);
    });

    it('should define fn_icx_prevent_hard_delete trigger function for INV-01', () => {
      expect(migrationSql).toMatch(/CREATE OR REPLACE FUNCTION fn_icx_prevent_hard_delete\(\)/i);
      expect(migrationSql).toMatch(/INV-01: Hard deletes are strictly forbidden/i);
      expect(migrationSql).toMatch(/Rule DQ-081/i);
    });

    it('should attach BEFORE DELETE trigger to all business tables', () => {
      const businessTables = [
        'member',
        'entity_org',
        'op_partner',
        'opportunity',
        'contract',
        'ep',
        'exchange',
        'standard_def',
        'rule_registry',
        'dq_issue',
      ];
      for (const table of businessTables) {
        expect(migrationSql).toContain(`'${table}'`);
      }
      expect(migrationSql).toMatch(/BEFORE DELETE ON/i);
    });

    it('should define fn_icx_enforce_append_only and attach to status_history and audit_log (INV-02)', () => {
      expect(migrationSql).toMatch(/CREATE OR REPLACE FUNCTION fn_icx_enforce_append_only\(\)/i);
      expect(migrationSql).toMatch(/INV-02: Table .* is an immutable append-only ledger/i);
      expect(migrationSql).toMatch(/trg_append_only_status_history/i);
      expect(migrationSql).toMatch(/BEFORE UPDATE OR DELETE ON status_history/i);
      expect(migrationSql).toMatch(/trg_append_only_audit_log/i);
      expect(migrationSql).toMatch(/BEFORE UPDATE OR DELETE ON audit_log/i);
    });

    it('should define fn_icx_prevent_ep_reported_mutation and attach to standard_check (INV-05)', () => {
      expect(migrationSql).toMatch(/CREATE OR REPLACE FUNCTION fn_icx_prevent_ep_reported_mutation\(\)/i);
      expect(migrationSql).toMatch(/INV-05: ep_reported_answer and ep_reported_at are write-once immutable fields/i);
      expect(migrationSql).toMatch(/trg_immutability_standard_check_ep/i);
      expect(migrationSql).toMatch(/BEFORE UPDATE ON standard_check/i);
    });

    it('should define fn_icx_universal_audit_log and attach to domain tables (INV-09)', () => {
      expect(migrationSql).toMatch(/CREATE OR REPLACE FUNCTION fn_icx_universal_audit_log\(\)/i);
      expect(migrationSql).toMatch(/INSERT INTO audit_log/i);
      expect(migrationSql).toMatch(/AFTER INSERT OR UPDATE ON/i);
    });

    it('should define fn_icx_sync_status_history and attach AFTER UPDATE OF status ON exchange (DQ-080)', () => {
      expect(migrationSql).toMatch(/CREATE OR REPLACE FUNCTION fn_icx_sync_status_history\(\)/i);
      expect(migrationSql).toMatch(/trg_exchange_status_sync/i);
      expect(migrationSql).toMatch(/AFTER UPDATE OF status ON exchange/i);
    });
  });

  describe('2. Acceptance Test T-01: INV-01 Hard-Delete Block & DQ-081 Logging', () => {
    it('Given any business row, when DELETE is attempted, then it fails with INV-01 exception', () => {
      expect(() => {
        assertNoHardDelete('exchange', '11111111-1111-4111-8111-111111111111', 'actor-user-1');
      }).toThrowError(InvariantViolationError);

      try {
        assertNoHardDelete('ep', '22222222-2222-4222-8222-222222222222', 'actor-user-1');
      } catch (err) {
        const invErr = err as InvariantViolationError;
        expect(invErr.code).toBe('INV-01');
        expect(invErr.ruleId).toBe('DQ-081');
        expect(invErr.message).toContain('Hard deletes are strictly forbidden on table "ep"');
      }
    });

    it('when DELETE is attempted, a structured DQ-081 issue is generated for the audit trail', () => {
      const issue = createDq081Issue('opportunity', 'opp-uuid-999', 'actor-user-2');
      expect(issue.rule_id).toBe('DQ-081');
      expect(issue.severity).toBe('Blocker');
      expect(issue.subject).toContain('Attempted hard-delete on table opportunity');
      expect(issue.owner_id).toBe('actor-user-2');
      expect(issue.details).toEqual(
        expect.objectContaining({
          table_name: 'opportunity',
          record_id: 'opp-uuid-999',
          action: 'DELETE',
        })
      );
    });

    it('supports legitimate soft deletion with timestamp and actor attribution', () => {
      const payload = createSoftDeletePayload('actor-123', 'EP withdrew application voluntarily');
      expect(payload.deleted_at).toBeDefined();
      expect(payload.deleted_reason).toBe('[actor-123] EP withdrew application voluntarily');

      expect(() => {
        createSoftDeletePayload('actor-123', '   ');
      }).toThrow('Soft delete requires an explicit deleted_reason');
    });
  });

  describe('3. Acceptance Test T-02: INV-02 Append-Only Ledger Immutability', () => {
    it('manual UPDATE or DELETE on status_history must fail unconditionally', () => {
      expect(() => {
        assertAppendOnly('status_history', 'UPDATE');
      }).toThrowError(InvariantViolationError);

      try {
        assertAppendOnly('status_history', 'DELETE');
      } catch (err) {
        const invErr = err as InvariantViolationError;
        expect(invErr.code).toBe('INV-02');
        expect(invErr.message).toContain('immutable append-only ledger');
      }
    });

    it('manual UPDATE or DELETE on audit_log must fail unconditionally', () => {
      expect(() => {
        assertAppendOnly('audit_log', 'UPDATE');
      }).toThrowError(InvariantViolationError);

      expect(() => {
        assertAppendOnly('audit_log', 'DELETE');
      }).toThrowError(InvariantViolationError);
    });

    it('does not reject normal tables from standard updates', () => {
      expect(() => {
        assertAppendOnly('exchange', 'UPDATE');
      }).not.toThrow();
    });
  });

  describe('4. Acceptance Test T-03: INV-05 EP Voice Immutability (Write-Once)', () => {
    it('Given ep_reported_answer is unpopulated, when initially imported, it is allowed', () => {
      expect(() => {
        assertEpReportedImmutable(null, 'Yes, completely fulfilled', null, '2026-11-02T10:00:00Z');
      }).not.toThrow();

      expect(() => {
        assertEpReportedImmutable(undefined, 'No, not provided', undefined, '2026-11-02T10:00:00Z');
      }).not.toThrow();
    });

    it('Given ep_reported_answer is already populated, when any update is attempted, then it is strictly rejected', () => {
      expect(() => {
        assertEpReportedImmutable(
          'No, not provided',
          'Yes, completely fulfilled', // alteration attempt
          '2026-11-02T10:00:00Z',
          '2026-11-02T12:00:00Z'
        );
      }).toThrowError(InvariantViolationError);

      try {
        assertEpReportedImmutable(
          'Yes, completely fulfilled',
          'Modified by LC',
          '2026-11-02T10:00:00Z',
          '2026-11-02T10:00:00Z'
        );
      } catch (err) {
        const invErr = err as InvariantViolationError;
        expect(invErr.code).toBe('INV-05');
        expect(invErr.message).toContain('write-once immutable fields');
      }
    });

    it('re-saving identical existing answer does not violate immutability', () => {
      expect(() => {
        assertEpReportedImmutable(
          'Yes, completely fulfilled',
          'Yes, completely fulfilled',
          '2026-11-02T10:00:00Z',
          '2026-11-02T10:00:00Z'
        );
      }).not.toThrow();
    });
  });

  describe('5. Status Transition Synchronization (DQ-080)', () => {
    it('Given an exchange status transition, automatically creates a synchronized status_history row', () => {
      const exchange: Exchange = {
        id: 'ex-1234',
        ep_id: 'ep-5678',
        opportunity_id: 'opp-9012',
        programme: 'GV',
        status: 'ACP',
        owner_id: 'member-001',
        created_at: '2026-10-01T00:00:00Z',
      };

      const result = prepareStatusTransition(exchange, 'APD', {
        actorId: 'member-001',
        source: 'manual',
        reason: 'Signed contract approved',
      });

      expect(result.updatedExchange.status).toBe('APD');
      expect(result.historyEntry.exchange_id).toBe('ex-1234');
      expect(result.historyEntry.from_status).toBe('ACP');
      expect(result.historyEntry.to_status).toBe('APD');
      expect(result.historyEntry.by_member).toBe('member-001');
      expect(result.historyEntry.source).toBe('manual');
      expect(result.historyEntry.reason).toBe('Signed contract approved');
    });

    it('correctly handles break_type transitions', () => {
      const exchange: Exchange = {
        id: 'ex-9999',
        ep_id: 'ep-5678',
        opportunity_id: 'opp-9012',
        programme: 'GV',
        status: 'RE',
        owner_id: 'member-001',
        created_at: '2026-10-01T00:00:00Z',
      };

      const result = prepareStatusTransition(exchange, 'RE', {
        breakType: 'RE',
        actorId: 'member-001',
        source: 'system',
        reason: 'Realization broken due to emergency departure',
      });

      expect(result.updatedExchange.break_type).toBe('RE');
      expect(result.historyEntry.break_type).toBe('RE');
      expect(result.historyEntry.source).toBe('system');
    });
  });
});
