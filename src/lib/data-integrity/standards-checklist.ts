/**
 * AIESEC iCX ERP — Exchange Standards Statutory Checklist Validation Engine
 * Author: Wadii Hani <wadii.hani.pro@gmail.com>
 * Specification: iCX_Data_Integrity_Tracking_Spec.md v1.0 (§6.2, §6.4)
 * Milestone: M2 (Plan 02-02)
 * Enforces: Statutory Delivery Definitions (#4–#15) & Home Entity Co-Delivery Logging (#1–#3, #16)
 */

import { getMasterTrackerDb } from './master-tracker';
import { standardsService } from './standards-service';
import type { StandardCheck } from '../types/data-integrity';

/**
 * Statutory delivery definition checklist item (§6.2)
 */
export interface StatutoryChecklistItemDef {
  key: string;
  label: string;
  description: string;
  required: boolean;
}

export interface StandardChecklistDef {
  std_no: number;
  name: string;
  items: StatutoryChecklistItemDef[];
}

/**
 * Statutory 12 Host Entity Standards Checklist Item Definitions (§6.2)
 */
export const STATUTORY_CHECKLIST_DEFS: StandardChecklistDef[] = [
  {
    std_no: 4,
    name: 'Expectations setting',
    items: [
      {
        key: 'culture',
        label: 'Culture Overview',
        description: 'Written information explaining host cultural context and norms',
        required: true,
      },
      {
        key: 'political_situation',
        label: 'Political Situation & Safety',
        description: 'Context on local political climate and safety guidelines',
        required: true,
      },
      {
        key: 'living_standards',
        label: 'Living Standards & Cost of Living',
        description: 'General cost of living and local daily expenditure expectations',
        required: true,
      },
      {
        key: 'contacts',
        label: 'Emergency Contacts',
        description: 'Home and host emergency contact details provided',
        required: true,
      },
      {
        key: 'accommodation_conditions',
        label: 'Accommodation Conditions',
        description: 'Detailed accommodation rules and expectations communicated',
        required: true,
      },
    ],
  },
  {
    std_no: 5,
    name: 'Visa and work permit',
    items: [
      {
        key: 'invitation_letter',
        label: 'Invitation Letter Issued',
        description: 'Official AIESEC invitation letter issued to participant',
        required: true,
      },
      {
        key: 'supporting_documents',
        label: 'Supporting Visa Documents',
        description: 'All required entity and institutional visa support documents provided',
        required: true,
      },
    ],
  },
  {
    std_no: 6,
    name: 'Arrival pick-up',
    items: [
      {
        key: 'pickup_point_agreed',
        label: 'Pickup Location & Time Agreed',
        description: 'Pickup point and travel itinerary agreed prior to EP departure',
        required: true,
      },
      {
        key: 'domestic_transport_info',
        label: 'Domestic Transport Information',
        description: 'Written guidance provided on domestic travel and meeting arrangements',
        required: true,
      },
      {
        key: 'rep_pickup_done',
        label: 'Representative In-Person Pickup',
        description: 'EP met at airport or terminal by an authorized AIESEC representative',
        required: true,
      },
    ],
  },
  {
    std_no: 7,
    name: 'Accommodation',
    items: [
      {
        key: 'matches_conditions',
        label: 'Opportunity Conditions Matched',
        description: 'Accommodation adheres to agreed costs and parameters stated on EXPA',
        required: true,
      },
      {
        key: 'single_bed',
        label: 'Single Bed Provided',
        description: 'Individual single bed provided for the exchange participant',
        required: true,
      },
      {
        key: 'clean_water',
        label: 'Clean Running Water',
        description: 'Reliable access to potable and clean running water',
        required: true,
      },
      {
        key: 'bathroom',
        label: 'Sanitary Facilities',
        description: 'Clean, working, private bathroom facilities accessible',
        required: true,
      },
      {
        key: 'electricity',
        label: 'Electricity Supply',
        description: 'Continuous, reliable electricity connection available',
        required: true,
      },
    ],
  },
  {
    std_no: 8,
    name: 'Incoming preparation',
    items: [
      {
        key: 'seminar_before_work',
        label: 'Arrival Seminar Held',
        description: 'Incoming Preparation Seminar (IPS) conducted before first day of work',
        required: true,
      },
      {
        key: 'personal_goals_followup',
        label: 'Personal Goals Follow-up',
        description: 'Personal goal-setting review connecting home expectations with project',
        required: true,
      },
      {
        key: 'culture_adaptation',
        label: 'Culture Adaptation Space',
        description: 'Preparation session on cross-cultural adaptation and shock management',
        required: true,
      },
      {
        key: 'living_standards_clarified',
        label: 'Living Standards Clarified',
        description: 'Local living logistics and practical daily routines fully clarified',
        required: true,
      },
    ],
  },
  {
    std_no: 9,
    name: 'First day of work',
    items: [
      {
        key: 'workplace_accompaniment',
        label: 'Physical Workplace Accompaniment',
        description: 'AIESEC representative physically accompanies EP to project location on day 1',
        required: true,
      },
    ],
  },
  {
    std_no: 10,
    name: 'Alignment spaces with opportunity provider',
    items: [
      {
        key: 'initial_alignment_space',
        label: 'Initial Alignment Space (JD ↔ Goals)',
        description: 'Formal alignment meeting between EP and opportunity provider at the start',
        required: true,
      },
      {
        key: 'final_debrief_space',
        label: 'Final Debrief Space',
        description: 'Formal debrief and feedback evaluation session with opportunity provider at end',
        required: true,
      },
    ],
  },
  {
    std_no: 11,
    name: 'Job description',
    items: [
      {
        key: 'jd_matches_posted',
        label: 'Executed JD Matches Posted JD',
        description: 'Daily responsibilities and tasks match the job description agreed on EXPA',
        required: true,
      },
      {
        key: 'changes_agreed',
        label: 'Any Changes Mutually Agreed',
        description: 'Any necessary JD shifts officially communicated and signed off by EP and host',
        required: true,
      },
    ],
  },
  {
    std_no: 12,
    name: 'Working hours',
    items: [
      {
        key: 'hours_match_posted',
        label: 'Hours Match EXPA Specs',
        description: 'Daily and weekly working hours match the contract terms published on EXPA',
        required: true,
      },
      {
        key: 'hours_within_rule',
        label: 'Within Programme Hours Limit',
        description: 'Working hours adhere to statutory weekly limits (25–40 hrs/wk)',
        required: true,
      },
    ],
  },
  {
    std_no: 13,
    name: 'Duration',
    items: [
      {
        key: 'duration_matches_posted',
        label: 'Duration Matches Timeline',
        description: 'First working day to last working day matches approved project schedule',
        required: true,
      },
      {
        key: 'duration_within_rule',
        label: 'Complies With Duration Rules',
        description: 'Duration satisfies programme duration policy (e.g. 4–8 weeks for iGV)',
        required: true,
      },
    ],
  },
  {
    std_no: 14,
    name: 'Opportunity benefits',
    items: [
      {
        key: 'benefits_delivered',
        label: 'Promised Benefits Delivered',
        description: 'All financial stipends, accommodation, food, or transport benefits provided as listed',
        required: true,
      },
    ],
  },
  {
    std_no: 15,
    name: 'Departure support',
    items: [
      {
        key: 'departure_procedure_sent',
        label: 'Written Departure Procedures Sent',
        description: 'Legal, administrative, and logistic departure guidelines sent ≥14 days before end',
        required: true,
      },
    ],
  },
];

/**
 * Checklist item completion state
 */
export interface ChecklistItemRecord {
  key: string;
  label: string;
  description: string;
  required: boolean;
  completed: boolean;
  completed_at?: string | null;
  completed_by?: string | null;
  notes?: string | null;
}

export interface StandardChecklistStatus {
  exchange_id: string;
  std_no: number;
  standard_name: string;
  items: ChecklistItemRecord[];
  total_items: number;
  completed_items: number;
  completion_pct: number;
  is_complete: boolean;
  missing_required_keys: string[];
}

export interface ExchangeChecklistSummary {
  exchange_id: string;
  host_standards: StandardChecklistStatus[];
  total_checklist_items: number;
  completed_checklist_items: number;
  overall_checklist_pct: number;
  all_host_standards_checklist_complete: boolean;
}

/**
 * Co-delivery Alignment Record for Home Entity standards (#1, #2, #3, #16 per §6.4)
 */
export interface CoDeliveryAlignment {
  id: string;
  home_entity_id: string;
  std_no: number; // 1, 2, 3, or 16
  standard_name: string;
  delivery_method: string;
  tracking_method: string;
  audit_evidence: string;
  reporting_routine: string;
  aligned_by: string;
  last_aligned_at: string;
  post_peak_review_notes?: string | null;
}

export class StandardChecklistValidationError extends Error {
  public readonly missingKeys: string[];
  public readonly stdNo: number;

  constructor(stdNo: number, missingKeys: string[]) {
    super(
      `Standard #${stdNo} cannot be marked 'delivered' until all required checklist items are fulfilled. Missing items: [${missingKeys.join(', ')}].`
    );
    this.name = 'StandardChecklistValidationError';
    this.missingKeys = missingKeys;
    this.stdNo = stdNo;
  }
}

/**
 * In-memory checklist and co-delivery state store
 */
interface ChecklistDbStore {
  // Key: `${exchangeId}:${stdNo}:${itemKey}`
  items: Map<string, { completed: boolean; completed_at?: string | null; completed_by?: string | null; notes?: string | null }>;
  // Co-delivery alignments: Map<id, CoDeliveryAlignment>
  coDelivery: Map<string, CoDeliveryAlignment>;
}

const checklistDb: ChecklistDbStore = {
  items: new Map(),
  coDelivery: new Map(),
};

export function resetChecklistDb(): void {
  checklistDb.items.clear();
  checklistDb.coDelivery.clear();
}

export const standardsChecklistService = {
  /**
   * Retrieves definition for a host standard's statutory checklist.
   */
  getDefinition(stdNo: number): StandardChecklistDef | undefined {
    return STATUTORY_CHECKLIST_DEFS.find((d) => d.std_no === stdNo);
  },

  /**
   * Retrieves checklist status and all items for an exchange standard.
   */
  getStandardChecklist(exchangeId: string, stdNo: number): StandardChecklistStatus {
    const def = this.getDefinition(stdNo);
    if (!def) {
      return {
        exchange_id: exchangeId,
        std_no: stdNo,
        standard_name: `Standard #${stdNo}`,
        items: [],
        total_items: 0,
        completed_items: 0,
        completion_pct: 100,
        is_complete: true,
        missing_required_keys: [],
      };
    }

    const items: ChecklistItemRecord[] = def.items.map((itemDef) => {
      const key = `${exchangeId}:${stdNo}:${itemDef.key}`;
      const record = checklistDb.items.get(key);
      return {
        key: itemDef.key,
        label: itemDef.label,
        description: itemDef.description,
        required: itemDef.required,
        completed: record?.completed ?? false,
        completed_at: record?.completed_at ?? null,
        completed_by: record?.completed_by ?? null,
        notes: record?.notes ?? null,
      };
    });

    const total = items.length;
    const completed = items.filter((i) => i.completed).length;
    const missing = items.filter((i) => i.required && !i.completed).map((i) => i.key);

    return {
      exchange_id: exchangeId,
      std_no: stdNo,
      standard_name: def.name,
      items,
      total_items: total,
      completed_items: completed,
      completion_pct: total > 0 ? Number(((completed / total) * 100).toFixed(1)) : 100,
      is_complete: missing.length === 0,
      missing_required_keys: missing,
    };
  },

  /**
   * Updates an individual checklist item completion state with attribution.
   */
  updateChecklistItem(
    exchangeId: string,
    stdNo: number,
    itemKey: string,
    completed: boolean,
    actorId: string,
    notes?: string | null
  ): ChecklistItemRecord {
    const def = this.getDefinition(stdNo);
    if (!def) {
      throw new Error(`Standard #${stdNo} is not a host standard with statutory checklist items.`);
    }

    const itemDef = def.items.find((i) => i.key === itemKey);
    if (!itemDef) {
      throw new Error(`Item key '${itemKey}' is not valid for Standard #${stdNo} (${def.name}).`);
    }

    const now = new Date().toISOString();
    const storeKey = `${exchangeId}:${stdNo}:${itemKey}`;
    const before = checklistDb.items.get(storeKey);

    const record = {
      completed,
      completed_at: completed ? now : null,
      completed_by: completed ? actorId : null,
      notes: notes !== undefined ? notes : before?.notes ?? null,
    };

    checklistDb.items.set(storeKey, record);

    // Audit log (INV-09)
    const masterDb = getMasterTrackerDb();
    masterDb.auditLogs.push({
      id: masterDb.auditLogs.length + 1,
      ts: now,
      actor: actorId,
      action: 'UPDATE_STANDARD_CHECKLIST_ITEM',
      table_name: 'standard_checklist_item',
      record_id: storeKey,
      before: before as unknown as Record<string, unknown>,
      after: record as unknown as Record<string, unknown>,
    });

    return {
      key: itemDef.key,
      label: itemDef.label,
      description: itemDef.description,
      required: itemDef.required,
      ...record,
    };
  },

  /**
   * Bulk completes all checklist items for a standard.
   */
  completeAllItems(exchangeId: string, stdNo: number, actorId: string, notes?: string): void {
    const def = this.getDefinition(stdNo);
    if (!def) return;

    for (const item of def.items) {
      this.updateChecklistItem(exchangeId, stdNo, item.key, true, actorId, notes);
    }
  },

  /**
   * Validates that all statutory checklist items are met before marking 'delivered'.
   * Throws StandardChecklistValidationError if any required item is not checked.
   */
  validateChecklistCompleteness(exchangeId: string, stdNo: number): void {
    const status = this.getStandardChecklist(exchangeId, stdNo);
    if (!status.is_complete) {
      throw new StandardChecklistValidationError(stdNo, status.missing_required_keys);
    }
  },

  /**
   * Delivers standard with checklist verification (§6.2).
   */
  deliverStandardWithChecklistVerification(
    exchangeId: string,
    stdNo: number,
    actorId: string,
    proofId?: string | null
  ): StandardCheck {
    this.validateChecklistCompleteness(exchangeId, stdNo);
    return standardsService.updateTrackedStatus(exchangeId, stdNo, 'delivered', actorId, proofId);
  },

  /**
   * Computes exchange-wide checklist progress across all 12 host standards.
   */
  getExchangeChecklistSummary(exchangeId: string): ExchangeChecklistSummary {
    const hostStatuses: StandardChecklistStatus[] = STATUTORY_CHECKLIST_DEFS.map((def) =>
      this.getStandardChecklist(exchangeId, def.std_no)
    );

    const totalItems = hostStatuses.reduce((acc, s) => acc + s.total_items, 0);
    const completedItems = hostStatuses.reduce((acc, s) => acc + s.completed_items, 0);
    const allComplete = hostStatuses.every((s) => s.is_complete);

    return {
      exchange_id: exchangeId,
      host_standards: hostStatuses,
      total_checklist_items: totalItems,
      completed_checklist_items: completedItems,
      overall_checklist_pct:
        totalItems > 0 ? Number(((completedItems / totalItems) * 100).toFixed(1)) : 100,
      all_host_standards_checklist_complete: allComplete,
    };
  },

  /**
   * Records or updates a Co-Delivery Alignment for a Home Entity standard (#1, #2, #3, #16 per §6.4).
   */
  recordCoDeliveryAlignment(params: {
    home_entity_id: string;
    std_no: number;
    delivery_method: string;
    tracking_method: string;
    audit_evidence: string;
    reporting_routine: string;
    aligned_by: string;
    post_peak_review_notes?: string | null;
  }): CoDeliveryAlignment {
    const allowedHomeStandards = [1, 2, 3, 16];
    if (!allowedHomeStandards.includes(params.std_no)) {
      throw new Error(
        `Standard #${params.std_no} is a host standard. Co-delivery alignment only applies to home entity standards (#1, #2, #3, #16).`
      );
    }

    const id = `cd-${params.home_entity_id}-std-${params.std_no}`;
    const now = new Date().toISOString();

    const standardNames: Record<number, string> = {
      1: 'Personal goal setting',
      2: 'Outgoing preparation',
      3: 'Insurance',
      16: 'Debrief with AIESEC',
    };

    const record: CoDeliveryAlignment = {
      id,
      home_entity_id: params.home_entity_id,
      std_no: params.std_no,
      standard_name: standardNames[params.std_no] ?? `Standard #${params.std_no}`,
      delivery_method: params.delivery_method,
      tracking_method: params.tracking_method,
      audit_evidence: params.audit_evidence,
      reporting_routine: params.reporting_routine,
      aligned_by: params.aligned_by,
      last_aligned_at: now,
      post_peak_review_notes: params.post_peak_review_notes ?? null,
    };

    checklistDb.coDelivery.set(id, record);

    // Audit log (INV-09)
    const masterDb = getMasterTrackerDb();
    masterDb.auditLogs.push({
      id: masterDb.auditLogs.length + 1,
      ts: now,
      actor: params.aligned_by,
      action: 'RECORD_CO_DELIVERY_ALIGNMENT',
      table_name: 'co_delivery_alignment',
      record_id: id,
      before: undefined,
      after: record as unknown as Record<string, unknown>,
    });

    return record;
  },

  /**
   * Retrieves all co-delivery alignments for a given home entity.
   */
  getCoDeliveryAlignments(homeEntityId: string): CoDeliveryAlignment[] {
    const results: CoDeliveryAlignment[] = [];
    const entries = Array.from(checklistDb.coDelivery.values());
    for (const record of entries) {
      if (record.home_entity_id === homeEntityId) {
        results.push(record);
      }
    }
    return results;
  },
};
