/**
 * AIESEC iCX ERP — Accountable Ownership & RACI Synergy Service
 * Author: Wadii Hani <wadii.hani.pro@gmail.com>
 * Specification: iCX_Data_Integrity_Tracking_Spec.md v1.0 (§12.1, §13.2, §16 T-06)
 * Milestone: M8 (Plan 08-01)
 * Enforces: INV-03 (Mandatory Accountable Owner), DQ-010 (Missing Owner), DQ-011 (Inactive Owner)
 */

import type {
  Member,
  RaciMatrix,
  SynergyTag,
  DqIssue,
  HandoffTask,
} from '../types/data-integrity';
import { getMasterTrackerDb } from './master-tracker';
import { getQualityCasesDb } from './quality-cases';
import { getIrEcosystemDb } from './ir-ecosystem';
import { getComplianceDb } from './compliance-calendar';
import { statusGovernanceService } from './status-governance';
import { dataQualityService } from './data-quality';

export interface OwnershipValidationResult {
  valid: boolean;
  errors: string[];
}

export interface InactiveOwnerScanResult {
  issues: DqIssue[];
  handoffTasks: HandoffTask[];
}

export class OwnershipService {
  /**
   * Validates that a record has exactly one valid, accountable owner (INV-03).
   */
  public validateAccountableOwner(
    ownerId: string | null | undefined,
    members?: Member[] | Map<string, Member>
  ): OwnershipValidationResult {
    const errors: string[] = [];

    if (!ownerId || ownerId.trim() === '') {
      errors.push('Mandatory accountable owner_id is missing (INV-03, DQ-010).');
      return { valid: false, errors };
    }

    if (members) {
      const memberMap =
        members instanceof Map
          ? members
          : new Map(members.map((m) => [m.id, m]));
      const owner = memberMap.get(ownerId);

      if (!owner) {
        errors.push(`Accountable owner '${ownerId}' does not exist in member registry.`);
      } else if (!owner.active || owner.deleted_at) {
        errors.push(`Accountable owner '${owner.name || ownerId}' is deactivated (DQ-011).`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validates a RACI Matrix (S8: "never decide without understanding your RACI").
   * Enforces: Exactly one Accountable owner; Responsible, Consulted, Informed optional arrays.
   */
  public validateRaciMatrix(
    raci: RaciMatrix | null | undefined,
    members?: Member[] | Map<string, Member>
  ): OwnershipValidationResult {
    const errors: string[] = [];

    if (!raci) {
      return { valid: true, errors: [] }; // RACI is optional, but if present must be valid
    }

    if (!raci.accountable || raci.accountable.trim() === '') {
      errors.push('RACI matrix must specify an Accountable owner (S8, INV-03).');
    }

    if (members && raci.accountable) {
      const memberMap =
        members instanceof Map
          ? members
          : new Map(members.map((m) => [m.id, m]));
      const owner = memberMap.get(raci.accountable);

      if (!owner) {
        errors.push(`Accountable member '${raci.accountable}' does not exist in registry.`);
      } else if (!owner.active || owner.deleted_at) {
        errors.push(`Accountable member '${owner.name || raci.accountable}' is deactivated.`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Adds a functional synergy tag to a record.
   */
  public addSynergyTag<T extends { synergy_tags?: SynergyTag[] }>(
    record: T,
    tag: SynergyTag
  ): T {
    if (!record.synergy_tags) {
      record.synergy_tags = [];
    }
    if (!record.synergy_tags.includes(tag)) {
      record.synergy_tags.push(tag);
    }
    return record;
  }

  /**
   * Removes a functional synergy tag from a record.
   */
  public removeSynergyTag<T extends { synergy_tags?: SynergyTag[] }>(
    record: T,
    tag: SynergyTag
  ): T {
    if (record.synergy_tags) {
      record.synergy_tags = record.synergy_tags.filter((t) => t !== tag);
    }
    return record;
  }

  /**
   * Filters records matching a specific functional synergy tag.
   */
  public filterBySynergyTag<T extends { synergy_tags?: SynergyTag[] }>(
    records: T[],
    tag: SynergyTag
  ): T[] {
    return records.filter((r) => r.synergy_tags && r.synergy_tags.includes(tag));
  }

  /**
   * Scans all business records for orphan (DQ-010) or deactivated (DQ-011) owners.
   * Auto-generates handoff / reassignment tasks assigned to the member's manager or LCVP.
   * Acceptance Test T-06 implementation.
   */
  public scanOrphanAndInactiveOwners(
    members: Member[] | Map<string, Member>,
    customRecords?: { id: string; owner_id?: string | null; type: string; manager_id?: string }[]
  ): InactiveOwnerScanResult {
    const memberMap =
      members instanceof Map
        ? members
        : new Map(members.map((m) => [m.id, m]));

    const recordsToScan: { id: string; owner_id?: string | null; type: string; manager_id?: string }[] = [];

    if (customRecords) {
      recordsToScan.push(...customRecords);
    } else {
      // Gather all live business records from in-memory stores
      const masterDb = getMasterTrackerDb();
      const qualityDb = getQualityCasesDb();
      const irDb = getIrEcosystemDb();
      const compDb = getComplianceDb();

      for (const p of Array.from(masterDb.partners.values())) {
        if (!p.deleted_at) recordsToScan.push({ id: p.id, owner_id: p.owner_id, type: 'op_partner' });
      }
      for (const opp of Array.from(masterDb.opportunities.values())) {
        if (!opp.deleted_at) recordsToScan.push({ id: opp.id, owner_id: (opp as any).owner_id, type: 'opportunity' });
      }
      for (const ex of Array.from(masterDb.exchanges.values())) {
        if (!ex.deleted_at) recordsToScan.push({ id: ex.id, owner_id: ex.owner_id, type: 'exchange' });
      }
      for (const c of Array.from(qualityDb.cases.values())) {
        if (!c.deleted_at) recordsToScan.push({ id: c.id, owner_id: c.owner_id, type: 'case_quality' });
      }
      for (const r of statusGovernanceService.listStatusRequests()) {
        if (!r.deleted_at) recordsToScan.push({ id: r.id, owner_id: r.owner_id, type: 'status_request' });
      }
      for (const ir of Array.from(irDb.irPartners.values())) {
        if (!ir.deleted_at) recordsToScan.push({ id: ir.id, owner_id: ir.owner_id, type: 'ir_partner' });
      }
      for (const ci of Array.from(compDb.items.values())) {
        if (!ci.deleted_at) recordsToScan.push({ id: ci.id, owner_id: ci.owner_id, type: 'compliance_item' });
      }
    }

    const issues: DqIssue[] = [];
    const handoffTasks: HandoffTask[] = [];
    const now = new Date().toISOString();

    for (const rec of recordsToScan) {
      // 1. Missing Owner -> DQ-010
      if (!rec.owner_id || rec.owner_id.trim() === '') {
        const issue = dataQualityService.raiseIssue(
          'DQ-010',
          `Record ${rec.id} (${rec.type}) has no accountable owner assigned`,
          'Blocker',
          {
            tableName: rec.type,
            recordId: rec.id,
            ownerId: null,
            details: { record_id: rec.id, record_type: rec.type },
          }
        );
        issues.push(issue);

        handoffTasks.push({
          id: `task_orphan_${rec.id}_${Date.now()}`,
          rule_id: 'DQ-010',
          record_id: rec.id,
          record_type: rec.type,
          previous_owner_id: undefined,
          assigned_manager_id: 'mem-lcvp-001', // Fallback to LCVP
          status: 'pending',
          created_at: now,
        });
        continue;
      }

      // 2. Inactive Owner -> DQ-011 (Acceptance Test T-06)
      const owner = memberMap.get(rec.owner_id);
      if (!owner || !owner.active || owner.deleted_at) {
        const issue = dataQualityService.raiseIssue(
          'DQ-011',
          `Record ${rec.id} (${rec.type}) owned by deactivated member ${owner?.name ?? rec.owner_id}`,
          'Blocker',
          {
            tableName: rec.type,
            recordId: rec.id,
            ownerId: rec.owner_id,
            details: {
              record_id: rec.id,
              record_type: rec.type,
              owner_id: rec.owner_id,
              owner_name: owner?.name,
              handoff_required: true,
            },
          }
        );
        issues.push(issue);

        // Assign to manager or LCVP
        const managerId = rec.manager_id || (owner as any)?.manager_id || 'mem-lcvp-001';

        handoffTasks.push({
          id: `task_handoff_${rec.id}_${Date.now()}`,
          rule_id: 'DQ-011',
          record_id: rec.id,
          record_type: rec.type,
          previous_owner_id: rec.owner_id,
          assigned_manager_id: managerId,
          status: 'pending',
          created_at: now,
        });
      }
    }

    return {
      issues,
      handoffTasks,
    };
  }
}

export const ownershipService = new OwnershipService();
