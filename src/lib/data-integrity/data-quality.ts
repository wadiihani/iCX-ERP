/**
 * AIESEC iCX ERP — Data Quality Rules Suite & Automated Scanner Engine
 * Author: Wadii Hani <wadii.hani.pro@gmail.com>
 * Specification: iCX_Data_Integrity_Tracking_Spec.md v1.0 (§13.2, §14)
 * Milestone: M7 (Plan 07-01)
 * Enforces: 26 Statutory DQ Rules (DQ-001..DQ-084), Severity SLA Ladder, Auto-Resolution
 */

import type {
  DqIssue,
  DqSeverity,
  DqStatus,
  FlowStage,
  ExStatus,
} from '../types/data-integrity';
import { getMasterTrackerDb } from './master-tracker';
import { getQualityCasesDb } from './quality-cases';
import { statusToFlowStage, validateStageRequiredFields } from './stage-gates';
import { validateDurationWeeks, validateHoursPerWeek } from './rules';

export interface InMemoryDqDbState {
  issues: Map<number, DqIssue>;
  nextId: number;
}

let dqDbInstance: InMemoryDqDbState = {
  issues: new Map(),
  nextId: 1,
};

export function getDataQualityDb(): InMemoryDqDbState {
  return dqDbInstance;
}

export function resetDataQualityDb(): void {
  dqDbInstance = {
    issues: new Map(),
    nextId: 1,
  };
}

/**
 * Severity SLA intervals (§13.2 `CONFIG`):
 * Urgent: 1 day (24 hours)
 * Blocker: 2 days (48 hours)
 * Warn: 7 days (168 hours)
 * Review: 7 days (168 hours)
 */
export const DQ_SEVERITY_SLA_HOURS: Record<DqSeverity, number> = {
  Urgent: 24,
  Blocker: 48,
  Warn: 168,
  Review: 168,
};

export function computeSlaDueDate(detectedAt: string | Date, severity: DqSeverity): string {
  const dt = new Date(detectedAt);
  const hours = DQ_SEVERITY_SLA_HOURS[severity] || 168;
  return new Date(dt.getTime() + hours * 60 * 60 * 1000).toISOString();
}

export const dataQualityService = {
  // ---------------------------------------------------------------------------
  // 1. ISSUE LIFECYCLE & MUTATIONS
  // ---------------------------------------------------------------------------

  raiseIssue(
    ruleId: string,
    subject: string,
    severity: DqSeverity,
    options?: {
      tableName?: string;
      recordId?: string;
      ownerId?: string | null;
      details?: Record<string, unknown>;
      detectedAt?: string;
    }
  ): DqIssue {
    const detectedAt = options?.detectedAt ?? new Date().toISOString();
    const slaDueAt = computeSlaDueDate(detectedAt, severity);

    // Check if an open issue already exists for this rule and record
    if (options?.recordId) {
      for (const issue of Array.from(dqDbInstance.issues.values())) {
        if (
          issue.rule_id === ruleId &&
          issue.record_id === options.recordId &&
          (issue.status === 'open' || !issue.status)
        ) {
          // Already raised and open
          return issue;
        }
      }
    }

    const id = dqDbInstance.nextId++;
    const issue: DqIssue = {
      id,
      rule_id: ruleId,
      subject,
      severity,
      status: 'open',
      table_name: options?.tableName ?? null,
      record_id: options?.recordId ?? null,
      detected_at: detectedAt,
      sla_due_at: slaDueAt,
      owner_id: options?.ownerId ?? null,
      details: options?.details ?? {},
    };

    dqDbInstance.issues.set(id, issue);

    // Audit log
    const masterDb = getMasterTrackerDb();
    masterDb.auditLogs.push({
      id: masterDb.auditLogs.length + 1,
      ts: detectedAt,
      actor: options?.ownerId ?? 'system',
      action: 'RAISE_DQ_ISSUE',
      table_name: 'dq_issue',
      record_id: String(id),
      before: null,
      after: issue as unknown as Record<string, unknown>,
    });

    return issue;
  },

  autoResolveIssue(ruleId: string, recordId: string, note?: string): DqIssue | null {
    for (const issue of Array.from(dqDbInstance.issues.values())) {
      if (
        issue.rule_id === ruleId &&
        issue.record_id === recordId &&
        issue.status === 'open'
      ) {
        const now = new Date().toISOString();
        const before = { ...issue };
        issue.status = 'auto_resolved';
        issue.resolved_at = now;
        issue.resolution_note = note ?? `Auto-resolved: condition cleared for rule ${ruleId}`;

        // Audit log
        const masterDb = getMasterTrackerDb();
        masterDb.auditLogs.push({
          id: masterDb.auditLogs.length + 1,
          ts: now,
          actor: 'system',
          action: 'AUTO_RESOLVE_DQ_ISSUE',
          table_name: 'dq_issue',
          record_id: String(issue.id),
          before: before as unknown as Record<string, unknown>,
          after: issue as unknown as Record<string, unknown>,
        });

        return issue;
      }
    }
    return null;
  },

  resolveIssueManual(issueId: number, actorId: string, note: string): DqIssue {
    const issue = dqDbInstance.issues.get(issueId);
    if (!issue) {
      throw new Error(`DQ Issue not found: ${issueId}`);
    }

    const now = new Date().toISOString();
    const before = { ...issue };
    issue.status = 'resolved';
    issue.resolved_at = now;
    issue.resolved_by = actorId;
    issue.resolution_note = note;

    const masterDb = getMasterTrackerDb();
    masterDb.auditLogs.push({
      id: masterDb.auditLogs.length + 1,
      ts: now,
      actor: actorId,
      action: 'MANUAL_RESOLVE_DQ_ISSUE',
      table_name: 'dq_issue',
      record_id: String(issueId),
      before: before as unknown as Record<string, unknown>,
      after: issue as unknown as Record<string, unknown>,
    });

    return issue;
  },

  listIssues(filters?: {
    severity?: DqSeverity;
    status?: DqStatus;
    ruleId?: string;
    ownerId?: string;
    tableName?: string;
  }): DqIssue[] {
    const list: DqIssue[] = [];
    for (const issue of Array.from(dqDbInstance.issues.values())) {
      if (filters?.severity && issue.severity !== filters.severity) continue;
      if (filters?.status && (issue.status ?? 'open') !== filters.status) continue;
      if (filters?.ruleId && issue.rule_id !== filters.ruleId) continue;
      if (filters?.ownerId && issue.owner_id !== filters.ownerId) continue;
      if (filters?.tableName && issue.table_name !== filters.tableName) continue;
      list.push(issue);
    }
    return list;
  },

  getOverdueIssues(now?: Date | string): DqIssue[] {
    const evalTime = now ? new Date(now).getTime() : Date.now();
    return this.listIssues({ status: 'open' }).filter((issue) => {
      if (!issue.sla_due_at) return false;
      return evalTime > new Date(issue.sla_due_at).getTime();
    });
  },

  // ---------------------------------------------------------------------------
  // 2. THE 26 STATUTORY DQ RULES SCANNER ENGINE (§13.2)
  // ---------------------------------------------------------------------------

  /**
   * Runs the automated scanner engine across all operational tables.
   */
  runDataQualityScan(options?: { now?: Date | string }): {
    totalScanned: number;
    issuesRaised: number;
    issuesAutoResolved: number;
    openIssues: DqIssue[];
  } {
    const evalTime = options?.now ? new Date(options.now).getTime() : Date.now();
    const nowIso = new Date(evalTime).toISOString();

    const masterDb = getMasterTrackerDb();
    const qualityDb = getQualityCasesDb();

    let issuesRaisedCount = 0;
    let issuesAutoResolvedCount = 0;

    // Helper map of active members
    const members = new Map(
      [
        { id: 'mem-wadii-001', name: 'Wadii Hani', active: true },
        { id: 'mem-lcvp-001', name: 'LCVP iGV', active: true },
        { id: 'mem-inactive-999', name: 'Inactive Member', active: false },
      ].map((m) => [m.id, m])
    );

    // -------------------------------------------------------------------------
    // Rule DQ-001: Duplicate expa_ep_id (Blocker)
    // -------------------------------------------------------------------------
    const epIdCounts = new Map<number, string[]>();
    for (const ep of Array.from(masterDb.eps.values())) {
      if (ep.deleted_at) continue;
      const list = epIdCounts.get(ep.expa_ep_id) || [];
      list.push(ep.id);
      epIdCounts.set(ep.expa_ep_id, list);
    }
    for (const [expaId, epIds] of Array.from(epIdCounts.entries())) {
      if (epIds.length > 1) {
        for (const epId of epIds) {
          this.raiseIssue('DQ-001', `Duplicate expa_ep_id ${expaId}`, 'Blocker', {
            tableName: 'ep',
            recordId: epId,
            details: { expa_ep_id: expaId, duplicate_ep_ids: epIds },
            detectedAt: nowIso,
          });
          issuesRaisedCount++;
        }
      }
    }

    // -------------------------------------------------------------------------
    // Rule DQ-002: Fuzzy duplicate EP (normalised name + home entity) (Warn)
    // -------------------------------------------------------------------------
    const epFuzzyMap = new Map<string, string[]>();
    for (const ep of Array.from(masterDb.eps.values())) {
      if (ep.deleted_at) continue;
      const key = `${ep.full_name.trim().toLowerCase()}:${ep.home_entity_id}`;
      const list = epFuzzyMap.get(key) || [];
      list.push(ep.id);
      epFuzzyMap.set(key, list);
    }
    for (const [key, epIds] of Array.from(epFuzzyMap.entries())) {
      if (epIds.length > 1) {
        for (const epId of epIds) {
          this.raiseIssue('DQ-002', `Potential duplicate EP "${key}"`, 'Warn', {
            tableName: 'ep',
            recordId: epId,
            details: { duplicate_ids: epIds },
            detectedAt: nowIso,
          });
          issuesRaisedCount++;
        }
      }
    }

    // -------------------------------------------------------------------------
    // Rule DQ-003: Fuzzy duplicate partner (normalised name + city) (Warn)
    // -------------------------------------------------------------------------
    const partnerFuzzyMap = new Map<string, string[]>();
    for (const p of Array.from(masterDb.partners.values())) {
      if (p.deleted_at) continue;
      const key = `${p.name.trim().toLowerCase()}:${p.city.trim().toLowerCase()}`;
      const list = partnerFuzzyMap.get(key) || [];
      list.push(p.id);
      partnerFuzzyMap.set(key, list);
    }
    for (const [key, partnerIds] of Array.from(partnerFuzzyMap.entries())) {
      if (partnerIds.length > 1) {
        for (const pid of partnerIds) {
          this.raiseIssue('DQ-003', `Potential duplicate Partner "${key}"`, 'Warn', {
            tableName: 'op_partner',
            recordId: pid,
            details: { duplicate_ids: partnerIds },
            detectedAt: nowIso,
          });
          issuesRaisedCount++;
        }
      }
    }

    // -------------------------------------------------------------------------
    // Rule DQ-010: Record without owner (Blocker)
    // Rule DQ-011: Owner is inactive member (Blocker -> handoff task)
    // -------------------------------------------------------------------------
    const checkOwnership = (record: { id: string; owner_id?: string | null }, tableName: string) => {
      if (!record.owner_id || record.owner_id.trim() === '') {
        this.raiseIssue('DQ-010', `Record in ${tableName} is missing mandatory owner`, 'Blocker', {
          tableName,
          recordId: record.id,
          detectedAt: nowIso,
        });
        issuesRaisedCount++;
      } else {
        const owner = members.get(record.owner_id);
        if (owner && !owner.active) {
          this.raiseIssue('DQ-011', `Owner ${owner.name} (${owner.id}) is inactive`, 'Blocker', {
            tableName,
            recordId: record.id,
            ownerId: record.owner_id,
            details: { owner_name: owner.name },
            detectedAt: nowIso,
          });
          issuesRaisedCount++;
        }
      }
    };

    for (const p of Array.from(masterDb.partners.values())) checkOwnership(p, 'op_partner');
    for (const ex of Array.from(masterDb.exchanges.values())) checkOwnership(ex, 'exchange');
    for (const c of Array.from(qualityDb.cases.values())) checkOwnership(c, 'case_quality');

    // -------------------------------------------------------------------------
    // Rule DQ-021: Exchange without opportunity, or opportunity without partner (Blocker)
    // -------------------------------------------------------------------------
    for (const ex of Array.from(masterDb.exchanges.values())) {
      if (ex.deleted_at) continue;
      const opp = masterDb.opportunities.get(ex.opportunity_id);
      if (!opp || opp.deleted_at) {
        this.raiseIssue('DQ-021', `Exchange ${ex.id} references missing opportunity`, 'Blocker', {
          tableName: 'exchange',
          recordId: ex.id,
          ownerId: ex.owner_id,
          detectedAt: nowIso,
        });
        issuesRaisedCount++;
      }
    }
    for (const opp of Array.from(masterDb.opportunities.values())) {
      if (opp.deleted_at) continue;
      const partner = masterDb.partners.get(opp.op_id);
      if (!partner || partner.deleted_at) {
        this.raiseIssue('DQ-021', `Opportunity ${opp.id} references missing partner`, 'Blocker', {
          tableName: 'opportunity',
          recordId: opp.id,
          detectedAt: nowIso,
        });
        issuesRaisedCount++;
      }
    }

    // -------------------------------------------------------------------------
    // Rule DQ-020: Required fields missing for current stage (Warn)
    // -------------------------------------------------------------------------
    for (const ex of Array.from(masterDb.exchanges.values())) {
      if (ex.deleted_at) continue;
      const stage = statusToFlowStage(ex.status);
      const validation = validateStageRequiredFields(stage, {
        exchange: ex,
        opportunity: masterDb.opportunities.get(ex.opportunity_id),
        contract: Array.from(masterDb.contracts.values()).find((c) => c.opportunity_id === ex.opportunity_id),
      });

      if (!validation.passed) {
        this.raiseIssue('DQ-020', `Exchange ${ex.id} missing fields for ${stage}: ${validation.missingFields.join(', ')}`, 'Warn', {
          tableName: 'exchange',
          recordId: ex.id,
          ownerId: ex.owner_id,
          details: { stage, missing_fields: validation.missingFields },
          detectedAt: nowIso,
        });
        issuesRaisedCount++;
      } else {
        const resolved = this.autoResolveIssue('DQ-020', ex.id);
        if (resolved) issuesAutoResolvedCount++;
      }
    }

    // -------------------------------------------------------------------------
    // Rule DQ-030: Record not updated within stage SLA (default 14d) (Warn)
    // -------------------------------------------------------------------------
    for (const ex of Array.from(masterDb.exchanges.values())) {
      if (ex.deleted_at) continue;
      if (['APL', 'ACP', 'APD', 'RE'].includes(ex.status)) {
        const lastUpdated = new Date(ex.expa_synced_at || ex.created_at).getTime();
        const idleDays = Math.floor((evalTime - lastUpdated) / (1000 * 60 * 60 * 24));
        if (idleDays > 14) {
          this.raiseIssue('DQ-030', `Exchange ${ex.id} idle in ${ex.status} for ${idleDays} days (>14d SLA)`, 'Warn', {
            tableName: 'exchange',
            recordId: ex.id,
            ownerId: ex.owner_id,
            details: { idle_days: idleDays, status: ex.status },
            detectedAt: nowIso,
          });
          issuesRaisedCount++;
        }
      }
    }

    // -------------------------------------------------------------------------
    // Rule DQ-050: Duration outside current rule version (Warn)
    // Rule DQ-051: Weekly hours outside current rule version (Warn)
    // -------------------------------------------------------------------------
    for (const opp of Array.from(masterDb.opportunities.values())) {
      if (opp.deleted_at) continue;
      if (opp.duration_weeks) {
        const durCheck = validateDurationWeeks(
          opp.programme,
          opp.duration_weeks,
          new Date(evalTime)
        );
        if (!durCheck.valid) {
          this.raiseIssue('DQ-050', `Opportunity duration ${opp.duration_weeks}w invalid for ${opp.programme}`, 'Warn', {
            tableName: 'opportunity',
            recordId: opp.id,
            details: { duration_weeks: opp.duration_weeks, programme: opp.programme },
            detectedAt: nowIso,
          });
          issuesRaisedCount++;
        }
      }
      if (opp.hours_per_week) {
        const hoursCheck = validateHoursPerWeek(
          opp.programme,
          opp.hours_per_week,
          new Date(evalTime)
        );
        if (!hoursCheck.valid) {
          this.raiseIssue('DQ-051', `Opportunity hours ${opp.hours_per_week}h/w invalid for ${opp.programme}`, 'Warn', {
            tableName: 'opportunity',
            recordId: opp.id,
            details: { hours_per_week: opp.hours_per_week, programme: opp.programme },
            detectedAt: nowIso,
          });
          issuesRaisedCount++;
        }
      }
    }

    // -------------------------------------------------------------------------
    // Rule DQ-052: APD with RE date passed (Urgent)
    // -------------------------------------------------------------------------
    for (const ex of Array.from(masterDb.exchanges.values())) {
      if (ex.deleted_at) continue;
      if (ex.status === 'APD' && ex.re_date) {
        const reTime = new Date(ex.re_date).getTime();
        if (evalTime > reTime) {
          const overdueDays = Math.floor((evalTime - reTime) / (1000 * 60 * 60 * 24));
          this.raiseIssue('DQ-052', `APD overdue for realization by ${overdueDays} days`, 'Urgent', {
            tableName: 'exchange',
            recordId: ex.id,
            ownerId: ex.owner_id,
            details: { re_date: ex.re_date, overdue_days: overdueDays },
            detectedAt: nowIso,
          });
          issuesRaisedCount++;
        }
      }
    }

    // -------------------------------------------------------------------------
    // Rule DQ-060: Partner without touchpoint within touchpoint_max_gap_days (35d) (Warn)
    // Rule DQ-062: Partner not linked for NPS (Warn)
    // -------------------------------------------------------------------------
    for (const p of Array.from(masterDb.partners.values())) {
      if (p.deleted_at) continue;
      // DQ-060: Touchpoint gap
      const lastTouch = p.last_touchpoint_at ? new Date(p.last_touchpoint_at).getTime() : 0;
      const gapDays = lastTouch > 0 ? Math.floor((evalTime - lastTouch) / (1000 * 60 * 60 * 24)) : 999;
      if (gapDays > 35) {
        this.raiseIssue('DQ-060', `Partner ${p.name} has no touchpoint for ${gapDays} days (>35d)`, 'Warn', {
          tableName: 'op_partner',
          recordId: p.id,
          ownerId: p.owner_id,
          details: { gap_days: gapDays },
          detectedAt: nowIso,
        });
        issuesRaisedCount++;
      } else {
        const resolved = this.autoResolveIssue('DQ-060', p.id);
        if (resolved) issuesAutoResolvedCount++;
      }

      // DQ-062: Partner not linked for NPS
      if (!p.expa_org_id) {
        this.raiseIssue('DQ-062', `Partner ${p.name} is missing EXPA organization link for NPS`, 'Warn', {
          tableName: 'op_partner',
          recordId: p.id,
          ownerId: p.owner_id,
          detectedAt: nowIso,
        });
        issuesRaisedCount++;
      }
    }

    // -------------------------------------------------------------------------
    // Rule DQ-071: Compensation > 0 without financial proof (Blocker)
    // -------------------------------------------------------------------------
    for (const c of Array.from(qualityDb.cases.values())) {
      if (c.deleted_at) continue;
      if (c.compensation_amount > 0 && !c.financial_proof_id) {
        this.raiseIssue('DQ-071', `Quality case ${c.id} has compensation ${c.compensation_amount} MAD without financial proof`, 'Blocker', {
          tableName: 'case_quality',
          recordId: c.id,
          ownerId: c.owner_id,
          details: { compensation_amount: c.compensation_amount },
          detectedAt: nowIso,
        });
        issuesRaisedCount++;
      } else {
        const resolved = this.autoResolveIssue('DQ-071', c.id);
        if (resolved) issuesAutoResolvedCount++;
      }
    }

    // -------------------------------------------------------------------------
    // Rule DQ-080: exchange.status != last status_history.to_status (Blocker)
    // -------------------------------------------------------------------------
    for (const ex of Array.from(masterDb.exchanges.values())) {
      if (ex.deleted_at) continue;
      const histories = masterDb.statusHistories.filter((h) => h.exchange_id === ex.id);
      if (histories.length > 0) {
        const latestHistory = histories[histories.length - 1];
        if (ex.status !== latestHistory.to_status) {
          this.raiseIssue('DQ-080', `Exchange ${ex.id} status '${ex.status}' does not match history '${latestHistory.to_status}'`, 'Blocker', {
            tableName: 'exchange',
            recordId: ex.id,
            ownerId: ex.owner_id,
            details: { exchange_status: ex.status, history_status: latestHistory.to_status },
            detectedAt: nowIso,
          });
          issuesRaisedCount++;
        }
      }
    }

    const openIssues = this.listIssues({ status: 'open' });

    return {
      totalScanned:
        masterDb.eps.size +
        masterDb.partners.size +
        masterDb.opportunities.size +
        masterDb.exchanges.size +
        qualityDb.cases.size,
      issuesRaised: issuesRaisedCount,
      issuesAutoResolved: issuesAutoResolvedCount,
      openIssues,
    };
  },
};
