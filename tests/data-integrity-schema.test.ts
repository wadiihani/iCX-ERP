import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import type {
  Programme,
  FlowStage,
  ExStatus,
  BreakType,
  Member,
  EntityOrg,
  OpPartner,
  Opportunity,
  Contract,
  Ep,
  Exchange,
  StatusHistory,
  StandardDef,
  StandardCheck,
  RuleRegistryEntry,
  AuditLogEntry,
} from '../src/lib/types/data-integrity';

// =============================================================================
// AIESEC iCX ERP — Data Integrity & Tracking Schema Invariants (Plan 00-01)
// Author: Wadii Hani <wadii.hani.pro@gmail.com>
// Specification: iCX_Data_Integrity_Tracking_Spec.md v1.0 (§3 Data Model)
// =============================================================================

describe('Plan 00-01: Core Schema DDL, Enums & Relational Tables', () => {
  const migrationPath = path.resolve(
    process.cwd(),
    'supabase/migrations/20261102000001_icx_data_integrity_tracking_v1.sql'
  );
  const migrationSql = fs.readFileSync(migrationPath, 'utf8');

  describe('1. Enumerated Types (§3.3)', () => {
    it('should define programme enum with GV, GTa, GTe', () => {
      const match = migrationSql.match(/CREATE TYPE programme AS ENUM \(([^)]+)\)/);
      expect(match).not.toBeNull();
      const values = match![1].replace(/'|\s/g, '').split(',');
      expect(values).toEqual(['GV', 'GTa', 'GTe']);
      const sample: Programme = 'GV';
      expect(['GV', 'GTa', 'GTe']).toContain(sample);
    });

    it('should define flow_stage enum matching customer flow stages', () => {
      const match = migrationSql.match(/CREATE TYPE flow_stage AS ENUM \(([^)]+)\)/);
      expect(match).not.toBeNull();
      const values = match![1].replace(/'|\s/g, '').split(',');
      expect(values).toEqual([
        'attraction',
        'consideration',
        'preparation',
        'experience',
        'post_experience',
      ]);
      const sample: FlowStage = 'attraction';
      expect(values).toContain(sample);
    });

    it('should define ex_status enum matching EXPA lifecycle statuses', () => {
      const match = migrationSql.match(/CREATE TYPE ex_status AS ENUM \(([^)]+)\)/);
      expect(match).not.toBeNull();
      const values = match![1].replace(/'|\s/g, '').split(',');
      expect(values).toEqual([
        'APL',
        'ACP',
        'APD',
        'RE',
        'FI',
        'CO',
        'REJECTED',
        'WITHDRAWN',
      ]);
      const sample: ExStatus = 'APD';
      expect(values).toContain(sample);
    });

    it('should define break_type enum for APD, RE, FI, CO breaks (S2)', () => {
      const match = migrationSql.match(/CREATE TYPE break_type AS ENUM \(([^)]+)\)/);
      expect(match).not.toBeNull();
      const values = match![1].replace(/'|\s/g, '').split(',');
      expect(values).toEqual(['APD', 'RE', 'FI', 'CO']);
      const sample: BreakType = 'RE';
      expect(values).toContain(sample);
    });
  });

  describe('2. Core Relational Tables & Constraints (§3.2, §3.3)', () => {
    const requiredTables = [
      'member',
      'entity_org',
      'op_partner',
      'opportunity',
      'contract',
      'ep',
      'exchange',
      'status_history',
      'standard_def',
      'standard_check',
      'rule_registry',
      'audit_log',
    ];

    it.each(requiredTables)('should create table %s with proper DDL', (tableName) => {
      const regex = new RegExp(`CREATE TABLE IF NOT EXISTS ${tableName}\\s*\\(`, 'i');
      expect(regex.test(migrationSql)).toBe(true);
    });

    it('should enforce ON DELETE RESTRICT on all foreign keys to prevent hard cascading deletes (INV-01)', () => {
      // Find all REFERENCES statements
      const referencesMatches = migrationSql.match(/REFERENCES\s+([a-z_]+)\s*\([^)]+\)(\s+ON DELETE\s+([A-Z]+))?/gi);
      expect(referencesMatches).not.toBeNull();

      for (const ref of referencesMatches!) {
        // Must contain ON DELETE RESTRICT (never CASCADE)
        expect(ref.toUpperCase()).toContain('ON DELETE RESTRICT');
        expect(ref.toUpperCase()).not.toContain('ON DELETE CASCADE');
      }
    });

    it('should enforce UNIQUE (ep_id, opportunity_id) on exchange table', () => {
      expect(migrationSql).toMatch(
        /CONSTRAINT\s+uq_exchange_ep_opportunity\s+UNIQUE\s*\(ep_id,\s*opportunity_id\)/i
      );
    });

    it('should enforce composite primary key (key, effective_from) on rule_registry table (INV-08)', () => {
      expect(migrationSql).toMatch(/PRIMARY KEY\s*\(key,\s*effective_from\)/i);
    });

    it('should enforce composite primary key (exchange_id, std_no) on standard_check table', () => {
      expect(migrationSql).toMatch(/PRIMARY KEY\s*\(exchange_id,\s*std_no\)/i);
    });
  });

  describe('3. Foreign Key Index Coverage (Supabase Postgres Best Practices)', () => {
    const requiredIndexes = [
      'idx_op_partner_owner_id',
      'idx_opportunity_op_id',
      'idx_contract_opportunity_id',
      'idx_ep_home_entity_id',
      'idx_ep_owner_id',
      'idx_exchange_ep_id',
      'idx_exchange_opportunity_id',
      'idx_exchange_owner_id',
      'idx_status_history_exchange_id',
      'idx_status_history_by_member',
      'idx_standard_check_exchange_id',
      'idx_standard_check_std_no',
      'idx_standard_check_tracked_by',
    ];

    it.each(requiredIndexes)('should define B-tree index %s', (indexName) => {
      const regex = new RegExp(`CREATE INDEX IF NOT EXISTS ${indexName}\\s+ON`, 'i');
      expect(regex.test(migrationSql)).toBe(true);
    });
  });

  describe('4. Type Integrity Runtime Contracts', () => {
    it('should allow constructing valid strongly typed records', () => {
      const member: Member = {
        id: '11111111-1111-4111-8111-111111111111',
        name: 'Wadii Hani',
        role: 'LCVP_IGV',
        active: true,
        created_at: new Date().toISOString(),
      };
      expect(member.name).toBe('Wadii Hani');

      const entity: EntityOrg = {
        id: '22222222-2222-4222-8222-222222222222',
        name: 'AIESEC in Rabat',
        kind: 'LC',
        country: 'Morocco',
        is_frozen: false,
        created_at: new Date().toISOString(),
      };
      expect(entity.is_frozen).toBe(false);

      const op: OpPartner = {
        id: '33333333-3333-4333-8333-333333333333',
        name: 'MCISE',
        type: 'NGO',
        city: 'Rabat',
        owner_id: member.id,
        stage: 'negotiation',
        created_at: new Date().toISOString(),
      };
      expect(op.stage).toBe('negotiation');

      const opp: Opportunity = {
        id: '44444444-4444-4444-8444-444444444444',
        op_id: op.id,
        programme: 'GV',
        title: 'Global Volunteer Rabat Social Impact',
        slots: 5,
        duration_weeks: 6,
        hours_per_week: 30,
        benefits: ['accommodation', 'certificate'],
        accommodation_provided: true,
        created_at: new Date().toISOString(),
      };
      expect(opp.programme).toBe('GV');

      const contract: Contract = {
        id: '55555555-5555-4555-8555-555555555555',
        opportunity_id: opp.id,
        signed_at: '2026-11-01',
        key_deadlines: { first_arrival: '2026-12-01' },
        created_at: new Date().toISOString(),
      };
      expect(contract.signed_at).toBe('2026-11-01');

      const ep: Ep = {
        id: '66666666-6666-4666-8666-666666666666',
        expa_ep_id: 1234567,
        full_name: 'Jane Doe',
        home_entity_id: entity.id,
        contact: { email: 'jane@example.com' },
        owner_id: member.id,
        created_at: new Date().toISOString(),
      };
      expect(ep.expa_ep_id).toBe(1234567);

      const exchange: Exchange = {
        id: '77777777-7777-4777-8777-777777777777',
        ep_id: ep.id,
        opportunity_id: opp.id,
        programme: 'GV',
        status: 'APD',
        owner_id: member.id,
        created_at: new Date().toISOString(),
      };
      expect(exchange.status).toBe('APD');

      const statusHist: StatusHistory = {
        id: 1,
        exchange_id: exchange.id,
        from_status: 'ACP',
        to_status: 'APD',
        at: new Date().toISOString(),
        by_member: member.id,
        source: 'manual',
        reason: 'Approval approved with signed contract',
      };
      expect(statusHist.to_status).toBe('APD');

      const rule: RuleRegistryEntry<{ min: number; max: number }> = {
        key: 'gv.duration_weeks',
        value: { min: 4, max: 8 },
        effective_from: '2026-01-01',
        source: 'S9',
        note: 'ECBA update',
      };
      expect(rule.value.min).toBe(4);

      const audit: AuditLogEntry = {
        id: 1,
        ts: new Date().toISOString(),
        actor: member.id,
        action: 'UPDATE',
        table_name: 'exchange',
        record_id: exchange.id,
        before: { status: 'ACP' },
        after: { status: 'APD' },
      };
      expect(audit.action).toBe('UPDATE');
    });
  });
});
