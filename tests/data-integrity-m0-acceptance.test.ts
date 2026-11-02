import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import {
  assertNoHardDelete,
  createDq081Issue,
  assertAppendOnly,
  assertEpReportedImmutable,
  prepareStatusTransition,
  InvariantViolationError,
} from '../src/lib/data-integrity/invariants';
import {
  STATUTORY_RULE_SEEDS,
  getEffectiveRule,
  validateDurationWeeks,
  validateHoursPerWeek,
} from '../src/lib/data-integrity/rules';
import {
  canViewEpContact,
  sanitizeEpForViewer,
  logExportAudit,
  ActorContext,
} from '../src/lib/data-integrity/rbac';
import type { Ep, Exchange } from '../src/lib/types/data-integrity';

// =============================================================================
// AIESEC iCX ERP — Milestone M0 Acceptance Test Suite (Plan 00-03)
// Author: Wadii Hani <wadii.hani.pro@gmail.com>
// Specification: iCX_Data_Integrity_Tracking_Spec.md v1.0 (§16 T-01, T-02, T-03, T-16, T-18, T-19)
// =============================================================================

describe('Milestone M0: Full Acceptance Test Harness', () => {
  const seedMigrationPath = path.resolve(
    process.cwd(),
    'supabase/migrations/20261102000003_icx_rule_registry_seed_and_rbac_v1.sql'
  );
  const seedMigrationSql = fs.readFileSync(seedMigrationPath, 'utf8');

  describe('1. Rule Registry Seed Integrity (§3.4)', () => {
    it('should seed gv.duration_weeks with both legacy and ECBA 2026 update rows', () => {
      expect(seedMigrationSql).toContain("'gv.duration_weeks'");
      expect(seedMigrationSql).toContain('{"min": 6, "max": 8}');
      expect(seedMigrationSql).toContain('{"min": 4, "max": 8}');
    });

    it('should seed standard_def with all 16 statutory exchange standards', () => {
      for (let i = 1; i <= 16; i++) {
        expect(seedMigrationSql).toMatch(new RegExp(`\\(${i},\\s*'`));
      }
    });

    it('should define helper functions for RBAC confidentiality and export logging', () => {
      expect(seedMigrationSql).toMatch(/CREATE OR REPLACE FUNCTION fn_icx_can_view_ep_contact/i);
      expect(seedMigrationSql).toMatch(/CREATE OR REPLACE FUNCTION fn_icx_log_export/i);
    });
  });

  // Acceptance Test T-01: Hard Delete Prohibition (INV-01, Rule DQ-081)
  describe('T-01: Hard-Delete Attempt Block & Logging', () => {
    it('Given any business row, when DELETE is attempted, then it fails and DQ-081 is logged', () => {
      const actorId = 'member-101';
      const recordId = 'exchange-row-555';

      expect(() => {
        assertNoHardDelete('exchange', recordId, actorId);
      }).toThrowError(InvariantViolationError);

      try {
        assertNoHardDelete('exchange', recordId, actorId);
      } catch (err) {
        const invError = err as InvariantViolationError;
        expect(invError.code).toBe('INV-01');
        expect(invError.ruleId).toBe('DQ-081');

        const loggedIssue = createDq081Issue('exchange', recordId, actorId);
        expect(loggedIssue.rule_id).toBe('DQ-081');
        expect(loggedIssue.severity).toBe('Blocker');
        expect(loggedIssue.owner_id).toBe(actorId);
        expect(loggedIssue.details?.action).toBe('DELETE');
      }
    });
  });

  // Acceptance Test T-02: Status Change History Recording & Immutability (INV-02, DQ-080)
  describe('T-02: Status Change History & Append-Only Ledger', () => {
    it('Given a status change, when saved, then status_history has a matching row', () => {
      const exchange: Exchange = {
        id: 'ex-001',
        ep_id: 'ep-001',
        opportunity_id: 'opp-001',
        programme: 'GV',
        status: 'ACP',
        owner_id: 'member-001',
        created_at: '2026-06-01T00:00:00Z',
      };

      const { updatedExchange, historyEntry } = prepareStatusTransition(exchange, 'APD', {
        actorId: 'member-001',
        source: 'manual',
        reason: 'Signed EP contract verified',
      });

      expect(updatedExchange.status).toBe('APD');
      expect(historyEntry.exchange_id).toBe('ex-001');
      expect(historyEntry.from_status).toBe('ACP');
      expect(historyEntry.to_status).toBe('APD');
      expect(historyEntry.by_member).toBe('member-001');
      expect(historyEntry.source).toBe('manual');
    });

    it('manual UPDATE of status_history fails unconditionally', () => {
      expect(() => {
        assertAppendOnly('status_history', 'UPDATE');
      }).toThrowError(InvariantViolationError);

      expect(() => {
        assertAppendOnly('status_history', 'DELETE');
      }).toThrowError(InvariantViolationError);
    });
  });

  // Acceptance Test T-03: EP Survey Response Immutability (INV-05)
  describe('T-03: EP Survey Response Immutability', () => {
    it('Given ep_reported_answer set, when anyone updates it, then rejected', () => {
      const initialAnswer = 'Yes, basic necessities delivered';
      const initialReportedAt = '2026-07-01T10:00:00Z';

      // Modifying answer
      expect(() => {
        assertEpReportedImmutable(
          initialAnswer,
          'No, substandard accommodation',
          initialReportedAt,
          initialReportedAt
        );
      }).toThrowError(InvariantViolationError);

      // Modifying timestamp
      expect(() => {
        assertEpReportedImmutable(
          initialAnswer,
          initialAnswer,
          initialReportedAt,
          '2026-07-02T10:00:00Z'
        );
      }).toThrowError(InvariantViolationError);
    });
  });

  // Acceptance Test T-16: Versioned Rules Evaluation (INV-08)
  describe('T-16: Versioned Rule Evaluation (GV 4-8 vs 6-8 weeks)', () => {
    it('Given GV opportunity of 5 weeks, passes under the 2026+ rule (4–8 weeks)', () => {
      const result2026 = validateDurationWeeks('GV', 5, '2026-07-01');
      expect(result2026.valid).toBe(true);
      expect(result2026.min).toBe(4);
      expect(result2026.max).toBe(8);
    });

    it('Given GV opportunity of 5 weeks, fails under the legacy rule (6–8 weeks) for historical date', () => {
      const resultHistorical = validateDurationWeeks('GV', 5, '2024-07-01');
      expect(resultHistorical.valid).toBe(false);
      expect(resultHistorical.min).toBe(6);
      expect(resultHistorical.max).toBe(8);
    });

    it('correctly resolves working hours rule per programme', () => {
      const gvValid = validateHoursPerWeek('GV', 30);
      expect(gvValid.valid).toBe(true);
      expect(gvValid.min).toBe(25);
      expect(gvValid.max).toBe(45);

      const gvInvalid = validateHoursPerWeek('GV', 15);
      expect(gvInvalid.valid).toBe(false);

      const gtaValid = validateHoursPerWeek('GTa', 40);
      expect(gtaValid.valid).toBe(true);
      expect(gtaValid.min).toBe(35);
      expect(gtaValid.max).toBe(45);
    });
  });

  // Acceptance Test T-18: Member Role Contact Data Redaction (INV-10)
  describe('T-18: Member Role EP Contact Data Redaction', () => {
    const rawEp: Ep = {
      id: 'ep-999',
      expa_ep_id: 887766,
      full_name: 'Sofia Martinez',
      home_entity_id: 'entity-valencia',
      contact: {
        email: 'sofia.martinez@gmail.com',
        phone: '+34 600 112 233',
        whatsapp: '+34 600 112 233',
      },
      owner_id: 'member-alice',
      created_at: '2026-05-01T00:00:00Z',
    };

    it('Given viewer with role member (not owner), EP contact fields are redacted', () => {
      const genericMember: ActorContext = {
        id: 'member-bob',
        role: 'MEMBER',
        team_id: 'team-finance',
      };

      const sanitized = sanitizeEpForViewer(rawEp, genericMember, 'team-igv');
      expect(sanitized.contact.email).toBe('[REDACTED]');
      expect(sanitized.contact.phone).toBe('[REDACTED]');
      expect(sanitized.contact.whatsapp).toBe('[REDACTED]');
      expect(sanitized.full_name).toBe('Sofia Martinez'); // Non-contact info preserved
    });

    it('Given viewer is the direct owner, contact data is visible', () => {
      const directOwner: ActorContext = {
        id: 'member-alice',
        role: 'MEMBER',
        team_id: 'team-igv',
      };

      const result = sanitizeEpForViewer(rawEp, directOwner, 'team-igv');
      expect(result.contact.email).toBe('sofia.martinez@gmail.com');
      expect(result.contact.phone).toBe('+34 600 112 233');
    });

    it('Given viewer has LCVP or ECB supervisory role, contact data is visible', () => {
      const lcvp: ActorContext = {
        id: 'member-vp',
        role: 'LCVP_IGV',
      };
      const ecb: ActorContext = {
        id: 'member-ecb',
        role: 'ECB',
      };

      expect(canViewEpContact(rawEp, lcvp)).toBe(true);
      expect(canViewEpContact(rawEp, ecb)).toBe(true);
      expect(sanitizeEpForViewer(rawEp, lcvp).contact.email).toBe('sofia.martinez@gmail.com');
    });
  });

  // Acceptance Test T-19: CSV Export Audit Logging (INV-09)
  describe('T-19: CSV Export Audit Logging', () => {
    it('Given any CSV export, then an audit_log entry records actor, scope, row count', () => {
      const actorId = 'member-compliance-officer';
      const scope = 'EXCHANGE_TRACKER';
      const rowCount = 142;

      const logEntry = logExportAudit(actorId, scope, rowCount, 'CSV');

      expect(logEntry.action).toBe('EXPORT');
      expect(logEntry.table_name).toBe('EXCHANGE_TRACKER');
      expect(logEntry.actor).toBe(actorId);
      expect(logEntry.after).toEqual(
        expect.objectContaining({
          format: 'CSV',
          row_count: 142,
        })
      );
      expect(logEntry.request_id).toBeDefined();
    });
  });
});
