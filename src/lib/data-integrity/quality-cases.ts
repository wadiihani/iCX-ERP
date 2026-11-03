/**
 * AIESEC iCX ERP — Quality Cases & Customer Support (CS) Minimums Engine
 * Author: Wadii Hani <wadii.hani.pro@gmail.com>
 * Specification: iCX_Data_Integrity_Tracking_Spec.md v1.0 (§10 Module E, S4, S9)
 * Milestone: M5 (Plan 05-01, Plan 05-02, Plan 05-03)
 * Enforces: INV-01 (No Hard Deletes), INV-03 (Active Owner), INV-09 (Attribution), CS Minimums 1–4, DQ-071 (T-13)
 */

import type {
  CaseQuality,
  CaseClassification,
  CompensationType,
  ResolutionStep,
  ExchangeCaseDossier,
  CsKpiReport,
} from '../types/data-integrity';
import {
  assertNoHardDelete,
  createSoftDeletePayload,
  InvariantViolationError,
} from './invariants';
import { getMasterTrackerDb } from './master-tracker';
import { statusGovernanceService } from './status-governance';

export interface InMemoryQualityDbState {
  cases: Map<string, CaseQuality>;
}

let qualityDbInstance: InMemoryQualityDbState = {
  cases: new Map(),
};

export function getQualityCasesDb(): InMemoryQualityDbState {
  return qualityDbInstance;
}

export function resetQualityCasesDb(): void {
  qualityDbInstance = {
    cases: new Map(),
  };
}

export interface CreateCaseParams {
  id?: string;
  exchange_id: string;
  title: string;
  description: string;
  classification: CaseClassification;
  owner_id: string;
  opened_at?: string;
  first_response_at?: string | null;
  compensation_amount?: number;
  currency?: string;
  compensation_type?: CompensationType | null;
  financial_proof_id?: string | null;
  final_agreement_id?: string | null;
  recurrence_of?: string | null;
  resolution_steps?: ResolutionStep[];
}

export interface CloseCaseParams {
  final_agreement_id: string;
  financial_proof_id?: string | null;
  compensation_amount?: number;
  compensation_type?: CompensationType | null;
  closure_notes?: string;
  closed_at?: string;
}

export const qualityCaseService = {
  // ---------------------------------------------------------------------------
  // 1. QUALITY CASE CRUD (INV-01, INV-03, INV-09)
  // ---------------------------------------------------------------------------

  createCase(params: CreateCaseParams, actorId: string): CaseQuality {
    // INV-03: Mandatory active owner
    if (!params.owner_id || params.owner_id.trim() === '') {
      throw new InvariantViolationError(
        'INV-03',
        'Quality case must have a mandatory active owner_id (§12.1)'
      );
    }

    if (!params.exchange_id || params.exchange_id.trim() === '') {
      throw new Error('Quality case must reference an exchange_id');
    }

    if (!params.title || params.title.trim() === '') {
      throw new Error('Quality case must have a non-empty title');
    }

    if (!params.description || params.description.trim() === '') {
      throw new Error('Quality case must have a non-empty description');
    }

    // Verify exchange exists
    const masterDb = getMasterTrackerDb();
    const ex = masterDb.exchanges.get(params.exchange_id);
    if (!ex || ex.deleted_at) {
      throw new Error(`Referenced exchange '${params.exchange_id}' not found or deleted.`);
    }

    const id = params.id ?? `case_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const now = params.opened_at ?? new Date().toISOString();

    const qualityCase: CaseQuality = {
      id,
      exchange_id: params.exchange_id,
      title: params.title.trim(),
      description: params.description.trim(),
      classification: params.classification,
      opened_at: now,
      first_response_at: params.first_response_at ?? null,
      closed_at: null,
      resolution_steps: params.resolution_steps ? [...params.resolution_steps] : [],
      compensation_amount: params.compensation_amount ?? 0,
      currency: params.currency ?? 'MAD',
      compensation_type: params.compensation_type ?? null,
      financial_proof_id: params.financial_proof_id ?? null,
      final_agreement_id: params.final_agreement_id ?? null,
      recurrence_of: params.recurrence_of ?? null,
      owner_id: params.owner_id,
      created_at: now,
      deleted_at: null,
      deleted_reason: null,
    };

    qualityDbInstance.cases.set(id, qualityCase);

    // INV-09: Universal audit logging
    masterDb.auditLogs.push({
      id: masterDb.auditLogs.length + 1,
      ts: new Date().toISOString(),
      actor: actorId,
      action: 'INSERT',
      table_name: 'case_quality',
      record_id: id,
      before: null,
      after: qualityCase as unknown as Record<string, unknown>,
    });

    return qualityCase;
  },

  getCase(id: string): CaseQuality | null {
    const c = qualityDbInstance.cases.get(id);
    if (!c || c.deleted_at) return null;
    return c;
  },

  listCases(filters?: {
    exchange_id?: string;
    classification?: CaseClassification;
    status?: 'open' | 'closed';
    owner_id?: string;
  }): CaseQuality[] {
    const list: CaseQuality[] = [];
    for (const c of Array.from(qualityDbInstance.cases.values())) {
      if (c.deleted_at) continue;
      if (filters?.exchange_id && c.exchange_id !== filters.exchange_id) continue;
      if (filters?.classification && c.classification !== filters.classification) continue;
      if (filters?.owner_id && c.owner_id !== filters.owner_id) continue;
      if (filters?.status === 'open' && c.closed_at !== null) continue;
      if (filters?.status === 'closed' && c.closed_at === null) continue;
      list.push(c);
    }
    return list;
  },

  updateCase(
    id: string,
    updates: Partial<Omit<CaseQuality, 'id' | 'exchange_id' | 'created_at' | 'deleted_at' | 'deleted_reason'>>,
    actorId: string
  ): CaseQuality {
    const existing = qualityDbInstance.cases.get(id);
    if (!existing || existing.deleted_at) {
      throw new Error(`Quality case not found: ${id}`);
    }

    if (existing.closed_at) {
      throw new Error(`Cannot modify closed quality case: ${id}`);
    }

    // INV-03: If owner is changed, ensure not empty
    if (updates.owner_id !== undefined && (!updates.owner_id || updates.owner_id.trim() === '')) {
      throw new InvariantViolationError(
        'INV-03',
        'Quality case must have a mandatory active owner_id (§12.1)'
      );
    }

    const before = { ...existing };
    const updated: CaseQuality = {
      ...existing,
      ...updates,
    };

    qualityDbInstance.cases.set(id, updated);

    // INV-09: Universal audit logging
    const masterDb = getMasterTrackerDb();
    masterDb.auditLogs.push({
      id: masterDb.auditLogs.length + 1,
      ts: new Date().toISOString(),
      actor: actorId,
      action: 'UPDATE',
      table_name: 'case_quality',
      record_id: id,
      before: before as unknown as Record<string, unknown>,
      after: updated as unknown as Record<string, unknown>,
    });

    return updated;
  },

  softDeleteCase(id: string, actorId: string, reason: string): CaseQuality {
    const existing = qualityDbInstance.cases.get(id);
    if (!existing || existing.deleted_at) {
      throw new Error(`Quality case not found: ${id}`);
    }

    const soft = createSoftDeletePayload(actorId, reason);
    const before = { ...existing };
    const updated: CaseQuality = {
      ...existing,
      deleted_at: soft.deleted_at,
      deleted_reason: soft.deleted_reason,
    };

    qualityDbInstance.cases.set(id, updated);

    // INV-09: Universal audit logging
    const masterDb = getMasterTrackerDb();
    masterDb.auditLogs.push({
      id: masterDb.auditLogs.length + 1,
      ts: new Date().toISOString(),
      actor: actorId,
      action: 'SOFT_DELETE',
      table_name: 'case_quality',
      record_id: id,
      before: before as unknown as Record<string, unknown>,
      after: updated as unknown as Record<string, unknown>,
    });

    return updated;
  },

  hardDeleteAttempt(id: string, actorId: string): never {
    return assertNoHardDelete('case_quality', id, actorId);
  },

  // ---------------------------------------------------------------------------
  // 2. CS MINIMUM 1: FIRST RESPONSE & TIMING TRACKER (§10 Module E)
  // ---------------------------------------------------------------------------

  /**
   * Records initial response to the support case and logs the communication.
   */
  recordFirstResponse(
    caseId: string,
    actorId: string,
    responseNote: string,
    respondedAt?: string
  ): {
    qualityCase: CaseQuality;
    responseHours: number;
  } {
    const c = this.getCase(caseId);
    if (!c) {
      throw new Error(`Quality case not found: ${caseId}`);
    }

    const responseTimestamp = respondedAt ?? new Date().toISOString();
    const openedTime = new Date(c.opened_at).getTime();
    const respTime = new Date(responseTimestamp).getTime();

    const responseHours = Math.max(
      0,
      Number(((respTime - openedTime) / (1000 * 60 * 60)).toFixed(2))
    );

    const step: ResolutionStep = {
      step_no: c.resolution_steps.length + 1,
      action_taken: 'first_response',
      description: responseNote.trim(),
      timestamp: responseTimestamp,
      actor_id: actorId,
    };

    const updated = this.updateCase(
      caseId,
      {
        first_response_at: c.first_response_at ?? responseTimestamp,
        resolution_steps: [...c.resolution_steps, step],
      },
      actorId
    );

    return {
      qualityCase: updated,
      responseHours,
    };
  },

  /**
   * Appends a timestamped resolution step to the case.
   */
  addResolutionStep(
    caseId: string,
    stepData: { action_taken: string; description: string; timestamp?: string },
    actorId: string
  ): CaseQuality {
    const c = this.getCase(caseId);
    if (!c) {
      throw new Error(`Quality case not found: ${caseId}`);
    }

    const step: ResolutionStep = {
      step_no: c.resolution_steps.length + 1,
      action_taken: stepData.action_taken.trim(),
      description: stepData.description.trim(),
      timestamp: stepData.timestamp ?? new Date().toISOString(),
      actor_id: actorId,
    };

    return this.updateCase(
      caseId,
      {
        resolution_steps: [...c.resolution_steps, step],
      },
      actorId
    );
  },

  // ---------------------------------------------------------------------------
  // 3. CS MINIMUM 2: EP & EXCHANGE CASE DOSSIER (§10 Module E)
  // ---------------------------------------------------------------------------

  /**
   * Builds an aggregated customer support dossier for an exchange.
   */
  getExchangeCaseDossier(exchangeId: string): ExchangeCaseDossier {
    const masterDb = getMasterTrackerDb();
    const exchange = masterDb.exchanges.get(exchangeId);
    if (!exchange || exchange.deleted_at) {
      throw new Error(`Exchange not found: ${exchangeId}`);
    }

    const ep = masterDb.eps.get(exchange.ep_id);
    if (!ep || ep.deleted_at) {
      throw new Error(`EP not found for exchange: ${exchangeId}`);
    }

    const opportunity = masterDb.opportunities.get(exchange.opportunity_id);
    if (!opportunity || opportunity.deleted_at) {
      throw new Error(`Opportunity not found for exchange: ${exchangeId}`);
    }

    // Related quality cases
    const cases = this.listCases({ exchange_id: exchangeId });

    // Related status requests
    const statusRequests = statusGovernanceService.listStatusRequests({
      exchange_id: exchangeId,
    });

    const totalCompensationMAD = cases.reduce(
      (sum, c) => sum + (c.compensation_amount || 0),
      0
    );

    const hasOpenCases = cases.some((c) => c.closed_at === null);
    const hasPolicyBreach = cases.some((c) => c.classification === 'policy_breach');

    return {
      exchange,
      ep,
      opportunity,
      cases,
      statusRequests,
      totalCompensationMAD,
      hasOpenCases,
      hasPolicyBreach,
    };
  },

  // ---------------------------------------------------------------------------
  // 4. MANDATORY CLOSURE GATES (§10.1, T-13, DQ-071)
  // ---------------------------------------------------------------------------

  /**
   * Verifies the 5 mandatory closure fields (§10.1) and closes the case.
   * Gates:
   * 1. description must not be empty
   * 2. classification must be valid
   * 3. resolution_steps must have at least one timestamped step
   * 4. final_agreement_id must be provided
   * 5. financial_proof_id required if compensation_amount > 0 (Acceptance Test T-13, DQ-071)
   */
  closeCase(caseId: string, params: CloseCaseParams, actorId: string): CaseQuality {
    const c = this.getCase(caseId);
    if (!c) {
      throw new Error(`Quality case not found: ${caseId}`);
    }

    if (c.closed_at) {
      throw new Error(`Quality case '${caseId}' is already closed.`);
    }

    // Gate 1: Description
    if (!c.description || c.description.trim() === '') {
      throw new InvariantViolationError(
        'CS-MANDATORY',
        'Cannot close quality case without description (§10.1)'
      );
    }

    // Gate 2: Classification
    if (!c.classification) {
      throw new InvariantViolationError(
        'CS-MANDATORY',
        'Cannot close quality case without classification (§10.1)'
      );
    }

    // Determine final compensation amount & proof
    const finalCompAmount =
      params.compensation_amount !== undefined
        ? params.compensation_amount
        : c.compensation_amount;

    const finalFinancialProofId =
      params.financial_proof_id !== undefined
        ? params.financial_proof_id
        : c.financial_proof_id;

    // Gate 4: Final agreement ID
    const finalAgreementId = params.final_agreement_id ?? c.final_agreement_id;
    if (!finalAgreementId || finalAgreementId.trim() === '') {
      throw new InvariantViolationError(
        'CS-MANDATORY',
        'Cannot close quality case without final_agreement_id signed/confirmed agreement (§10.1)'
      );
    }

    // Gate 5: Financial proof required if compensation > 0 (T-13, DQ-071)
    if (finalCompAmount > 0 && (!finalFinancialProofId || finalFinancialProofId.trim() === '')) {
      throw new InvariantViolationError(
        'DQ-071',
        'Quality case with compensation > 0 cannot be closed without financial_proof_id (Rule DQ-071, Acceptance Test T-13)',
        'DQ-071',
        { caseId, compensationAmount: finalCompAmount }
      );
    }

    // Gate 3: Resolution steps must not be empty
    const updatedSteps = [...c.resolution_steps];
    if (params.closure_notes) {
      updatedSteps.push({
        step_no: updatedSteps.length + 1,
        action_taken: 'case_closed',
        description: params.closure_notes.trim(),
        timestamp: params.closed_at ?? new Date().toISOString(),
        actor_id: actorId,
      });
    }

    if (updatedSteps.length === 0) {
      throw new InvariantViolationError(
        'CS-MANDATORY',
        'Cannot close quality case without at least one timestamped resolution step (§10.1)'
      );
    }

    const closedAt = params.closed_at ?? new Date().toISOString();

    const before = { ...c };
    const updated: CaseQuality = {
      ...c,
      closed_at: closedAt,
      final_agreement_id: finalAgreementId.trim(),
      financial_proof_id: finalFinancialProofId ?? null,
      compensation_amount: finalCompAmount,
      compensation_type: params.compensation_type ?? c.compensation_type,
      resolution_steps: updatedSteps,
    };

    qualityDbInstance.cases.set(caseId, updated);

    // INV-09: Universal audit logging
    const masterDb = getMasterTrackerDb();
    masterDb.auditLogs.push({
      id: masterDb.auditLogs.length + 1,
      ts: new Date().toISOString(),
      actor: actorId,
      action: 'CLOSE_CASE',
      table_name: 'case_quality',
      record_id: caseId,
      before: before as unknown as Record<string, unknown>,
      after: updated as unknown as Record<string, unknown>,
    });

    return updated;
  },

  // ---------------------------------------------------------------------------
  // 5. CS MINIMUM 3: MONTHLY KPI REPORTING (§10.2)
  // ---------------------------------------------------------------------------

  /**
   * Computes monthly CS KPIs across all cases:
   * - Avg resolution time: mean(closed_at - opened_at)
   * - Open cases count
   * - Total compensation amount (by classification and type)
   * - Case recurrence rate: share of cases with recurrence_of set
   */
  computeCsKpis(options?: { month?: string }): CsKpiReport {
    const allCases = Array.from(qualityDbInstance.cases.values()).filter(
      (c) => !c.deleted_at
    );

    const targetMonth = options?.month ?? new Date().toISOString().slice(0, 7);

    // Filter by target month (opened_at or closed_at in month)
    const monthCases = allCases.filter((c) => c.opened_at.startsWith(targetMonth));

    const totalCases = monthCases.length;
    let openCasesCount = 0;
    let closedCasesCount = 0;
    let totalResolutionDays = 0;
    let closedWithDurationCount = 0;

    let totalResponseHours = 0;
    let casesWithResponseCount = 0;

    let totalCompensationAmount = 0;
    const compensationByClassification: Record<CaseClassification, number> = {
      policy_breach: 0,
      expectation_gap: 0,
      other: 0,
    };
    const compensationByType: Record<string, number> = {};

    let recurringCasesCount = 0;

    for (const c of monthCases) {
      if (c.closed_at) {
        closedCasesCount++;
        const openTime = new Date(c.opened_at).getTime();
        const closeTime = new Date(c.closed_at).getTime();
        if (closeTime >= openTime) {
          totalResolutionDays += (closeTime - openTime) / (1000 * 60 * 60 * 24);
          closedWithDurationCount++;
        }
      } else {
        openCasesCount++;
      }

      if (c.first_response_at) {
        const openTime = new Date(c.opened_at).getTime();
        const respTime = new Date(c.first_response_at).getTime();
        if (respTime >= openTime) {
          totalResponseHours += (respTime - openTime) / (1000 * 60 * 60);
          casesWithResponseCount++;
        }
      }

      if (c.compensation_amount > 0) {
        totalCompensationAmount += c.compensation_amount;
        compensationByClassification[c.classification] =
          (compensationByClassification[c.classification] || 0) + c.compensation_amount;

        const cType = c.compensation_type ?? 'other';
        compensationByType[cType] = (compensationByType[cType] || 0) + c.compensation_amount;
      }

      if (c.recurrence_of) {
        recurringCasesCount++;
      }
    }

    const avgResolutionTimeDays =
      closedWithDurationCount > 0
        ? Number((totalResolutionDays / closedWithDurationCount).toFixed(1))
        : null;

    const avgFirstResponseHours =
      casesWithResponseCount > 0
        ? Number((totalResponseHours / casesWithResponseCount).toFixed(1))
        : null;

    const recurrenceRatePct =
      totalCases > 0 ? Number(((recurringCasesCount / totalCases) * 100).toFixed(1)) : 0;

    return {
      month: targetMonth,
      totalCases,
      openCasesCount,
      closedCasesCount,
      avgResolutionTimeDays,
      avgFirstResponseHours,
      totalCompensationAmount,
      compensationByClassification,
      compensationByType,
      recurrenceRatePct,
    };
  },
};
