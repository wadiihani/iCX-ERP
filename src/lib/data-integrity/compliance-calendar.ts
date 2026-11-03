/**
 * AIESEC iCX ERP — Compliance Calendar & ICB Freeze Gate Engine
 * Author: Wadii Hani <wadii.hani.pro@gmail.com>
 * Specification: iCX_Data_Integrity_Tracking_Spec.md v1.0 (§11 Module F, S3, S9, D10, §16 T-11)
 * Milestone: M6 (Plan 06-01, Plan 06-02)
 * Enforces: INV-01 (No Hard Deletes), INV-03 (Active Owner), INV-07 (Freeze Gate), INV-09 (Attribution), D10 (Authority)
 */

import type {
  ComplianceItem,
  ComplianceKind,
  ComplianceResult,
  IcbAuditDocDef,
  FreezeEntityPayload,
  MemberRole,
} from '../types/data-integrity';
import {
  assertNoHardDelete,
  createSoftDeletePayload,
  InvariantViolationError,
} from './invariants';
import { getMasterTrackerDb } from './master-tracker';

/**
 * Statutory 13 ICB Audit Documents Catalogue (§11.2, APIP Annex 4)
 */
export const STATUTORY_ICB_DOCS: IcbAuditDocDef[] = [
  {
    doc_number: 1,
    title: 'Programmes statement',
    section: 'General',
    description: 'National and LC operational programmes scope statement.',
  },
  {
    doc_number: 2,
    title: 'Lawyer / PR establishment letter',
    section: '3.1.1 Legal Support',
    description: 'Formal establishment letter from designated legal counsel or public relations authority.',
  },
  {
    doc_number: 3,
    title: 'Contract explanation',
    section: '3.1.1 Legal Support',
    description: 'Legal memorandum explaining contract terms, liabilities, and local legal enforceability.',
  },
  {
    doc_number: 4,
    title: 'PHAVC establishment letter',
    section: '3.1.2 Risk Management',
    description: 'Physical Health and Anti-Violence Committee formal establishment and active roster.',
  },
  {
    doc_number: 5,
    title: 'ECB establishment letter',
    section: '3.1.2 Risk Management',
    description: 'Entity Control Board charter, mandate, and member appointment confirmation.',
  },
  {
    doc_number: 6,
    title: 'Contacts updated in ECB global contact list',
    section: '3.1.2 Risk Management',
    description: 'Verification of up-to-date emergency contacts in the global international directory.',
  },
  {
    doc_number: 7,
    title: 'ESC establishment letter',
    section: '3.1.2 Risk Management',
    description: 'Ethics and Safety Committee establishment credentials.',
  },
  {
    doc_number: 8,
    title: 'Risk management plan',
    section: '3.1.2 Risk Management',
    description: 'Comprehensive local risk register, contingency protocols, and mitigation mechanisms.',
  },
  {
    doc_number: 9,
    title: 'Email template of health & safety measures',
    section: '3.1.2 Risk Management',
    description: 'Standardized safety orientation briefing template dispatched to all incoming EPs.',
  },
  {
    doc_number: 10,
    title: 'Education plan (L4 + L3)',
    section: '3.1.3 Educational',
    description: 'Detailed member and leader capability development track (Leadership levels 4 and 3).',
  },
  {
    doc_number: 11,
    title: 'SOPs updated to external national context',
    section: '3.1.3 Educational',
    description: 'Standard operating procedures adapted to national legal, visa, and university regulations.',
  },
  {
    doc_number: 12,
    title: 'Management tool for quality cases',
    section: '3.1.4 Quality Management',
    description: 'Audited case management system guaranteeing zero off-platform cases and response SLA tracking.',
  },
  {
    doc_number: 13,
    title: 'ECB audit system',
    section: '3.1.4 Quality Management',
    description: 'Formal internal entity audit framework and quarterly compliance review cycle.',
  },
];

export interface InMemoryComplianceDbState {
  items: Map<string, ComplianceItem>;
}

let complianceDbInstance: InMemoryComplianceDbState = {
  items: new Map(),
};

export function getComplianceDb(): InMemoryComplianceDbState {
  return complianceDbInstance;
}

export function resetComplianceDb(): void {
  complianceDbInstance = {
    items: new Map(),
  };
}

export interface CreateComplianceItemParams {
  id?: string;
  entity_id: string;
  kind: ComplianceKind;
  doc_number?: number | null;
  title: string;
  section: string;
  due_at: string;
  submitted_at?: string | null;
  result?: ComplianceResult;
  pass_pct?: number | null;
  evidence_ids?: string[];
  violation_level?: number | null;
  notes?: string | null;
  source_link?: string | null;
  owner_id: string;
}

export const complianceService = {
  // ---------------------------------------------------------------------------
  // 1. STATUTORY ICB CATALOGUE SEEDING (§11.2)
  // ---------------------------------------------------------------------------

  /**
   * Seeds the 13 statutory ICB audit documents for an entity.
   */
  seedIcbAuditCatalogue(
    entityId: string,
    ownerId: string,
    actorId: string,
    dueAt: string
  ): ComplianceItem[] {
    const seededItems: ComplianceItem[] = [];

    for (const doc of STATUTORY_ICB_DOCS) {
      // Check if document already seeded for this entity
      const existing = Array.from(complianceDbInstance.items.values()).find(
        (it) =>
          !it.deleted_at &&
          it.entity_id === entityId &&
          it.kind === 'icb_audit_doc' &&
          it.doc_number === doc.doc_number
      );

      if (!existing) {
        const item = this.createComplianceItem(
          {
            entity_id: entityId,
            kind: 'icb_audit_doc',
            doc_number: doc.doc_number,
            title: doc.title,
            section: doc.section,
            due_at: dueAt,
            result: 'pending',
            evidence_ids: [],
            owner_id: ownerId,
            notes: doc.description,
          },
          actorId
        );
        seededItems.push(item);
      } else {
        seededItems.push(existing);
      }
    }

    return seededItems;
  },

  // ---------------------------------------------------------------------------
  // 2. COMPLIANCE ITEM CRUD (INV-01, INV-03, INV-09)
  // ---------------------------------------------------------------------------

  createComplianceItem(params: CreateComplianceItemParams, actorId: string): ComplianceItem {
    // INV-03: Mandatory active owner
    if (!params.owner_id || params.owner_id.trim() === '') {
      throw new InvariantViolationError(
        'INV-03',
        'Compliance item must have a mandatory active owner_id (§12.1)'
      );
    }

    if (!params.entity_id || params.entity_id.trim() === '') {
      throw new Error('Compliance item must reference a valid entity_id');
    }

    const masterDb = getMasterTrackerDb();
    const entity = masterDb.entities.get(params.entity_id);
    if (!entity || entity.deleted_at) {
      throw new Error(`Referenced entity '${params.entity_id}' not found or deleted.`);
    }

    const id = params.id ?? `comp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();

    const item: ComplianceItem = {
      id,
      entity_id: params.entity_id,
      kind: params.kind,
      doc_number: params.doc_number ?? null,
      title: params.title.trim(),
      section: params.section.trim(),
      due_at: params.due_at,
      submitted_at: params.submitted_at ?? null,
      result: params.result ?? 'pending',
      pass_pct: params.pass_pct ?? null,
      evidence_ids: params.evidence_ids ? [...params.evidence_ids] : [],
      violation_level: params.violation_level ?? null,
      notes: params.notes ?? null,
      source_link: params.source_link ?? null,
      owner_id: params.owner_id,
      created_at: now,
      deleted_at: null,
      deleted_reason: null,
    };

    complianceDbInstance.items.set(id, item);

    // INV-09: Universal audit logging
    masterDb.auditLogs.push({
      id: masterDb.auditLogs.length + 1,
      ts: now,
      actor: actorId,
      action: 'INSERT',
      table_name: 'compliance_item',
      record_id: id,
      before: null,
      after: item as unknown as Record<string, unknown>,
    });

    return item;
  },

  getComplianceItem(id: string): ComplianceItem | null {
    const item = complianceDbInstance.items.get(id);
    if (!item || item.deleted_at) return null;
    return item;
  },

  listComplianceItems(filters?: {
    entity_id?: string;
    kind?: ComplianceKind;
    result?: ComplianceResult;
    section?: string;
    owner_id?: string;
  }): ComplianceItem[] {
    const list: ComplianceItem[] = [];
    for (const item of Array.from(complianceDbInstance.items.values())) {
      if (item.deleted_at) continue;
      if (filters?.entity_id && item.entity_id !== filters.entity_id) continue;
      if (filters?.kind && item.kind !== filters.kind) continue;
      if (filters?.result && item.result !== filters.result) continue;
      if (filters?.section && item.section !== filters.section) continue;
      if (filters?.owner_id && item.owner_id !== filters.owner_id) continue;
      list.push(item);
    }
    return list;
  },

  updateComplianceItem(
    id: string,
    updates: Partial<Omit<ComplianceItem, 'id' | 'entity_id' | 'created_at' | 'deleted_at' | 'deleted_reason'>>,
    actorId: string
  ): ComplianceItem {
    const existing = complianceDbInstance.items.get(id);
    if (!existing || existing.deleted_at) {
      throw new Error(`Compliance item not found: ${id}`);
    }

    // INV-03: If owner is changed, ensure not empty
    if (updates.owner_id !== undefined && (!updates.owner_id || updates.owner_id.trim() === '')) {
      throw new InvariantViolationError(
        'INV-03',
        'Compliance item must have a mandatory active owner_id (§12.1)'
      );
    }

    const before = { ...existing };
    const updated: ComplianceItem = {
      ...existing,
      ...updates,
    };

    complianceDbInstance.items.set(id, updated);

    // INV-09: Universal audit logging
    const masterDb = getMasterTrackerDb();
    masterDb.auditLogs.push({
      id: masterDb.auditLogs.length + 1,
      ts: new Date().toISOString(),
      actor: actorId,
      action: 'UPDATE',
      table_name: 'compliance_item',
      record_id: id,
      before: before as unknown as Record<string, unknown>,
      after: updated as unknown as Record<string, unknown>,
    });

    return updated;
  },

  /**
   * Submits proof evidence for a compliance document.
   */
  submitEvidence(
    id: string,
    evidenceIds: string[],
    actorId: string,
    notes?: string
  ): ComplianceItem {
    const existing = this.getComplianceItem(id);
    if (!existing) {
      throw new Error(`Compliance item not found: ${id}`);
    }

    const mergedEvidence = Array.from(new Set([...existing.evidence_ids, ...evidenceIds]));
    return this.updateComplianceItem(
      id,
      {
        evidence_ids: mergedEvidence,
        submitted_at: new Date().toISOString(),
        notes: notes ?? existing.notes,
      },
      actorId
    );
  },

  /**
   * Records audit review result for a compliance item.
   */
  recordAuditResult(
    id: string,
    result: ComplianceResult,
    passPct: number,
    actorId: string,
    violationLevel?: number,
    notes?: string
  ): ComplianceItem {
    return this.updateComplianceItem(
      id,
      {
        result,
        pass_pct: passPct,
        violation_level: violationLevel ?? null,
        notes: notes !== undefined ? notes : undefined,
      },
      actorId
    );
  },

  softDeleteComplianceItem(id: string, actorId: string, reason: string): ComplianceItem {
    const existing = complianceDbInstance.items.get(id);
    if (!existing || existing.deleted_at) {
      throw new Error(`Compliance item not found: ${id}`);
    }

    const soft = createSoftDeletePayload(actorId, reason);
    const before = { ...existing };
    const updated: ComplianceItem = {
      ...existing,
      deleted_at: soft.deleted_at,
      deleted_reason: soft.deleted_reason,
    };

    complianceDbInstance.items.set(id, updated);

    // INV-09: Universal audit logging
    const masterDb = getMasterTrackerDb();
    masterDb.auditLogs.push({
      id: masterDb.auditLogs.length + 1,
      ts: new Date().toISOString(),
      actor: actorId,
      action: 'SOFT_DELETE',
      table_name: 'compliance_item',
      record_id: id,
      before: before as unknown as Record<string, unknown>,
      after: updated as unknown as Record<string, unknown>,
    });

    return updated;
  },

  hardDeleteAttempt(id: string, actorId: string): never {
    return assertNoHardDelete('compliance_item', id, actorId);
  },

  // ---------------------------------------------------------------------------
  // 3. ICB FREEZE GATE AUTHORITY & UNFREEZING WORKFLOW (INV-07, D10, T-11)
  // ---------------------------------------------------------------------------

  /**
   * Sets the freeze status of an entity (§11.2, D10, INV-07).
   * Enforces:
   * 1. Decision D10: Authority restricted to LCVP iGV (or ECB / admin)
   * 2. Mandatory ICB audit source link when setting to frozen
   */
  setEntityFreezeStatus(payload: FreezeEntityPayload): {
    entity_id: string;
    is_frozen: boolean;
    frozen_since: string | null;
  } {
    // 1. Enforce Freeze Authority (Decision D10)
    // Only LCVP iGV (or ECB / Admin) can toggle freeze flag
    const allowedRoles = ['lcvp', 'lcvp_igv', 'lcvp_icx', 'admin', 'ecb', 'ecb_auditor'];
    if (payload.actor_role && !allowedRoles.includes(payload.actor_role.toLowerCase())) {
      throw new InvariantViolationError(
        'D10',
        `Unauthorized: Only LCVP iGV, ECB, or Admin have the authority to toggle entity freeze flag. Role '${payload.actor_role}' was rejected (Decision D10).`,
        'D10',
        { actorId: payload.actor_id, actorRole: payload.actor_role }
      );
    }

    // 2. Mandatory ICB audit reference link when setting is_frozen = true
    if (payload.is_frozen) {
      if (!payload.icb_audit_reference_link || payload.icb_audit_reference_link.trim() === '') {
        throw new InvariantViolationError(
          'INV-07',
          'Setting an entity to FROZEN requires a mandatory ICB audit reference link (Decision D10, Rule INV-07).',
          'INV-07',
          { entityId: payload.entity_id }
        );
      }
    }

    const masterDb = getMasterTrackerDb();
    const entity = masterDb.entities.get(payload.entity_id);
    if (!entity || entity.deleted_at) {
      throw new Error(`Entity '${payload.entity_id}' not found or deleted.`);
    }

    const now = new Date().toISOString();
    const updatedEntity = {
      ...entity,
      is_frozen: payload.is_frozen,
      frozen_since: payload.is_frozen ? (entity.frozen_since ?? now) : null,
    };

    masterDb.entities.set(payload.entity_id, updatedEntity);

    // INV-09: Universal audit logging
    masterDb.auditLogs.push({
      id: masterDb.auditLogs.length + 1,
      ts: now,
      actor: payload.actor_id,
      action: 'UPDATE_FREEZE_FLAG',
      table_name: 'entity_org',
      record_id: payload.entity_id,
      before: entity as unknown as Record<string, unknown>,
      after: {
        ...updatedEntity,
        icb_audit_reference_link: payload.icb_audit_reference_link,
        reason: payload.reason,
      } as unknown as Record<string, unknown>,
    });

    return {
      entity_id: payload.entity_id,
      is_frozen: updatedEntity.is_frozen,
      frozen_since: updatedEntity.frozen_since,
    };
  },

  /**
   * Acceptance Test T-11 Gate:
   * Given entity is_frozen, when a user tries to process an approval, then blocked with ICB reference.
   */
  assertApprovalAllowed(homeEntityId: string): void {
    const masterDb = getMasterTrackerDb();
    const entity = masterDb.entities.get(homeEntityId);

    if (entity?.is_frozen) {
      throw new InvariantViolationError(
        'INV-07',
        `Entity "${entity.name}" is FROZEN by ICB audit (frozen since: ${entity.frozen_since ?? 'N/A'}). Approvals and realizations are strictly prohibited per S9 clause 8.4.3.3.3.5.3 (Rule INV-07, Acceptance Test T-11).`,
        'INV-07',
        { homeEntityId, isFrozen: true, entityName: entity.name }
      );
    }
  },

  /**
   * Submits unfreezing submission request (§11.1).
   */
  submitUnfreezingRequest(
    entityId: string,
    title: string,
    correctiveActionPlan: string,
    evidenceIds: string[],
    ownerId: string,
    actorId: string,
    sourceLink?: string
  ): ComplianceItem {
    return this.createComplianceItem(
      {
        entity_id: entityId,
        kind: 'unfreezing_submission',
        title,
        section: 'Unfreezing & Corrective Action',
        due_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        submitted_at: new Date().toISOString(),
        result: 'pending',
        evidence_ids: evidenceIds,
        notes: correctiveActionPlan,
        source_link: sourceLink ?? null,
        owner_id: ownerId,
      },
      actorId
    );
  },

  /**
   * Computes compliance scorecard for the 13 ICB audit docs of an entity.
   */
  getComplianceAuditScorecard(entityId: string): {
    totalDocs: number;
    passedDocs: number;
    failedDocs: number;
    pendingDocs: number;
    overallPassPct: number;
    isCompliant: boolean;
    violationCount: number;
    items: ComplianceItem[];
  } {
    const items = this.listComplianceItems({
      entity_id: entityId,
      kind: 'icb_audit_doc',
    });

    const totalDocs = items.length;
    let passedDocs = 0;
    let failedDocs = 0;
    let pendingDocs = 0;
    let totalScore = 0;
    let violationCount = 0;

    for (const it of items) {
      if (it.result === 'passed') {
        passedDocs++;
        totalScore += it.pass_pct ?? 100;
      } else if (it.result === 'failed') {
        failedDocs++;
        totalScore += it.pass_pct ?? 0;
      } else {
        pendingDocs++;
      }

      if (it.violation_level && it.violation_level > 0) {
        violationCount++;
      }
    }

    const overallPassPct =
      totalDocs > 0 ? Number((totalScore / (totalDocs * 100) * 100).toFixed(1)) : 0;

    return {
      totalDocs,
      passedDocs,
      failedDocs,
      pendingDocs,
      overallPassPct,
      isCompliant: totalDocs === 13 && passedDocs === 13 && violationCount === 0,
      violationCount,
      items,
    };
  },
};
