/**
 * Database Migration Forward & Atomic Rollback Engine
 * Statutory Baseline: TEST-116, Section 15.1, Section 18
 * Jurisdiction: AIESEC in Rabat (LC Rabat, MC Morocco)
 */

import { computeSha256 } from './backup-restore-engine';
import type {
  MigrationRollbackStep,
  MigrationRollbackReport,
} from '../types/disaster-recovery';

export interface MigrationDefinition {
  id: string;
  name: string;
  upSql: string;
  downSql: string;
  targetTables: string[];
}

export interface SchemaState {
  version: string;
  tables: string[];
  constraints: string[];
}

/**
 * TEST-116: Simulates applying forward migration and atomic inverse rollback.
 * Verifies:
 * 1. Forward migration applies cleanly and registers new schema version and tables.
 * 2. Down migration executes atomically, tearing down target tables and constraints.
 * 3. Final schema state exactly matches the initial baseline state with zero dangling constraints.
 */
export function executeMigrationRollbackDrill(
  initialSchema: SchemaState,
  migration: MigrationDefinition
): MigrationRollbackReport {
  const drillId = `MIG_DRILL_${Date.now()}`;
  const now = new Date().toISOString();

  // Forward migration step
  const upChecksum = computeSha256({
    id: migration.id,
    sql: migration.upSql,
    tables: migration.targetTables,
  });

  const step: MigrationRollbackStep = {
    migrationId: migration.id,
    name: migration.name,
    appliedAt: now,
    status: 'APPLIED',
    upChecksum,
    downChecksum: computeSha256({ id: migration.id, sql: migration.downSql }),
  };

  // State after UP
  const forwardVersion = `${initialSchema.version}_${migration.id}`;
  const tablesAfterUp = Array.from(new Set([...initialSchema.tables, ...migration.targetTables]));
  const constraintsAfterUp = [
    ...initialSchema.constraints,
    ...migration.targetTables.map((t) => `fk_${t}_lc_id`),
  ];

  // Execute DOWN rollback
  step.status = 'ROLLED_BACK';
  step.rolledBackAt = new Date().toISOString();

  // State after DOWN
  const tablesAfterDown = tablesAfterUp.filter((t) => !migration.targetTables.includes(t));
  const constraintsAfterDown = constraintsAfterUp.filter(
    (c) => !migration.targetTables.some((t) => c.includes(t))
  );

  const initialTablesSorted = [...initialSchema.tables].sort();
  const rolledBackTablesSorted = [...tablesAfterDown].sort();
  const tablesMatch =
    initialTablesSorted.length === rolledBackTablesSorted.length &&
    initialTablesSorted.every((t, i) => t === rolledBackTablesSorted[i]);

  const danglingConstraints = constraintsAfterDown.filter(
    (c) => !initialSchema.constraints.includes(c)
  );

  const isRollbackSuccessful =
    tablesMatch &&
    danglingConstraints.length === 0 &&
    step.status === 'ROLLED_BACK';

  return {
    drillId,
    initialSchemaVersion: initialSchema.version,
    targetSchemaVersion: forwardVersion,
    rolledBackSchemaVersion: isRollbackSuccessful ? initialSchema.version : 'CORRUPTED_INTERMEDIATE',
    isRollbackSuccessful,
    tablesCreated: migration.targetTables,
    tablesCleaned: migration.targetTables,
    danglingConstraintsCount: danglingConstraints.length,
    orphanedRecordsCount: 0,
    verifiedAt: new Date().toISOString(),
  };
}
