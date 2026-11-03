/**
 * AIESEC iCX ERP — Statutory Deadline Engine & Radar Escalation System
 * Author: Wadii Hani <wadii.hani.pro@gmail.com>
 * Specification: iCX_Data_Integrity_Tracking_Spec.md v1.0 (§8, §13.2, §16 T-12, T-17)
 * Milestone: M3 (Plan 03-03)
 * Enforces: Alert Ladder Escalations (T-7 notice, T-2 warning, T-0 urgent, overdue) & Operational SLAs
 */

import type {
  DeadlineItem,
  DeadlineStatus,
  EscalationLevel,
  DqIssue,
  Exchange,
  OpPartner,
} from '../types/data-integrity';
import { getMasterTrackerDb } from './master-tracker';
import { getStandardDef } from './standards-service';
import { evaluateApdPastReDate } from './status-validators';

export interface DeadlineRadarSummary {
  total: number;
  byStatus: Record<DeadlineStatus, number>;
  byEscalation: Record<EscalationLevel, number>;
  urgentCount: number;
  overdueCount: number;
}

/**
 * Calculates days remaining: targetDate - currentDate (in integer days).
 */
export function getDaysRemaining(targetDateStr: string, currentDateStr: string): number {
  const target = new Date(targetDateStr);
  const current = new Date(currentDateStr);
  const diffMs = target.getTime() - current.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Adds integer days to an ISO date string (YYYY-MM-DD).
 */
export function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

/**
 * Derives Alert Ladder status and Escalation Level from days remaining (§8).
 * Ladder: T-7 d notice -> T-2 d warning (LCVP) -> T-0 urgent (LCVP) -> overdue (LCP).
 */
export function evaluateAlertLadder(daysRemaining: number): {
  status: DeadlineStatus;
  escalation: EscalationLevel;
} {
  if (daysRemaining > 7) {
    return { status: 'upcoming', escalation: 'owner' };
  }
  if (daysRemaining > 2) {
    return { status: 'notice', escalation: 'owner' };
  }
  if (daysRemaining > 0) {
    return { status: 'warning', escalation: 'lcvp' };
  }
  if (daysRemaining === 0) {
    return { status: 'urgent', escalation: 'lcvp' };
  }
  return { status: 'overdue', escalation: 'lcp' };
}

export const deadlineEngine = {
  /**
   * Computes exchange deadlines and raises DQ-053 (T-12), DQ-056, DQ-052, DQ-030.
   */
  evaluateExchangeDeadlines(
    exchange: Exchange,
    currentDateStr?: string
  ): { items: DeadlineItem[]; dqIssues: Omit<DqIssue, 'id'>[] } {
    const today = currentDateStr ?? new Date().toISOString().split('T')[0];
    const items: DeadlineItem[] = [];
    const dqIssues: Omit<DqIssue, 'id'>[] = [];
    const masterDb = getMasterTrackerDb();

    // 1. Visa document delivery (§8, §16 T-12, DQ-053)
    // Formula: approved_at + 14 days (if visa required)
    if (exchange.approved_at && (exchange.status === 'APD' || exchange.status === 'RE')) {
      const dueDate = addDays(exchange.approved_at, 14);
      const daysRemaining = getDaysRemaining(dueDate, today);
      const ladder = evaluateAlertLadder(daysRemaining);

      const std5Check = masterDb.standardChecks.get(`${exchange.id}:5`);
      const isDelivered = std5Check?.tracked_status === 'delivered' && Boolean(std5Check?.proof_id);

      if (!isDelivered) {
        items.push({
          id: `dl-visa-${exchange.id}`,
          category: 'exchange',
          subject: `Visa documents delivery for exchange ${exchange.id}`,
          due_at: `${dueDate}T23:59:59Z`,
          rule_key: 'visa.docs_due_days_after_approval',
          owner_id: exchange.owner_id,
          source: 'S9',
          status: ladder.status,
          escalation_level: ladder.escalation,
          entity_id: exchange.id,
          created_at: new Date().toISOString(),
        });

        // Acceptance Test T-12: approval on day 0 with visa required and no visa docs on day 15 -> DQ-053 urgent
        const daysSinceApproval = -getDaysRemaining(exchange.approved_at, today);
        if (daysSinceApproval >= 15) {
          dqIssues.push({
            rule_id: 'DQ-053',
            subject: `Urgent: Visa docs not delivered within 14 d of approval for exchange ${exchange.id} (Day ${daysSinceApproval})`,
            severity: 'Urgent',
            detected_at: new Date().toISOString(),
            owner_id: exchange.owner_id,
            details: {
              exchange_id: exchange.id,
              ep_id: exchange.ep_id,
              approved_at: exchange.approved_at,
              days_since_approval: daysSinceApproval,
              due_date: dueDate,
            },
          });
        }
      }
    }

    // 2. Departure support sent (§8, DQ-056)
    // Formula: fi_date - 14 days
    if (exchange.fi_date && exchange.status === 'RE') {
      const departureCutoff = addDays(exchange.fi_date, -14);
      const daysRemaining = getDaysRemaining(departureCutoff, today);
      const ladder = evaluateAlertLadder(daysRemaining);

      const std15Check = masterDb.standardChecks.get(`${exchange.id}:15`);
      const isDelivered = std15Check?.tracked_status === 'delivered';

      if (!isDelivered) {
        items.push({
          id: `dl-dep-${exchange.id}`,
          category: 'exchange',
          subject: `Departure support procedure for exchange ${exchange.id}`,
          due_at: `${departureCutoff}T23:59:59Z`,
          rule_key: 'departure_support.days_before_fi',
          owner_id: exchange.owner_id,
          source: 'S1',
          status: ladder.status,
          escalation_level: ladder.escalation,
          entity_id: exchange.id,
          created_at: new Date().toISOString(),
        });

        // DQ-056: Departure support not sent by fi_date - 14 d
        if (daysRemaining <= 0) {
          dqIssues.push({
            rule_id: 'DQ-056',
            subject: `Departure support not sent by fi_date - 14 d for exchange ${exchange.id}`,
            severity: 'Warn',
            detected_at: new Date().toISOString(),
            owner_id: exchange.owner_id,
            details: {
              exchange_id: exchange.id,
              ep_id: exchange.ep_id,
              fi_date: exchange.fi_date,
              departure_cutoff: departureCutoff,
            },
          });
        }
      }
    }

    // 3. APD past RE date (§7.4, DQ-052)
    const apdCheck = evaluateApdPastReDate(exchange, today);
    if (apdCheck.isApdPastRe && apdCheck.dqIssue) {
      dqIssues.push(apdCheck.dqIssue);
    }

    // 4. Stage staleness SLA (§13.2, DQ-030)
    // 14 days maximum idle time in active operational stages
    if (exchange.created_at) {
      const daysIdle = -getDaysRemaining(exchange.created_at.split('T')[0], today);
      if (daysIdle > 14 && exchange.status !== 'FI' && exchange.status !== 'CO') {
        dqIssues.push({
          rule_id: 'DQ-030',
          subject: `Exchange ${exchange.id} in stage '${exchange.status}' not updated within SLA (${daysIdle} days idle)`,
          severity: 'Warn',
          detected_at: new Date().toISOString(),
          owner_id: exchange.owner_id,
          details: {
            exchange_id: exchange.id,
            days_idle: daysIdle,
            sla_days: 14,
          },
        });
      }
    }

    return { items, dqIssues };
  },

  /**
   * Computes partner deadlines and raises DQ-060 (T-17), DQ-061.
   */
  evaluatePartnerDeadlines(
    partner: OpPartner,
    currentDateStr?: string
  ): { items: DeadlineItem[]; dqIssues: Omit<DqIssue, 'id'>[] } {
    const today = currentDateStr ?? new Date().toISOString().split('T')[0];
    const items: DeadlineItem[] = [];
    const dqIssues: Omit<DqIssue, 'id'>[] = [];

    // Partner monthly touchpoint gap (§8, §16 T-17, DQ-060)
    // Rule: partner.touchpoint_max_gap_days = 35
    const lastContact = partner.last_touchpoint_at
      ? partner.last_touchpoint_at.split('T')[0]
      : partner.created_at.split('T')[0];

    const dueDate = addDays(lastContact, 35);
    const daysRemaining = getDaysRemaining(dueDate, today);
    const ladder = evaluateAlertLadder(daysRemaining);

    items.push({
      id: `dl-ptn-touchpoint-${partner.id}`,
      category: 'partner',
      subject: `Routine partner touchpoint for ${partner.name}`,
      due_at: `${dueDate}T23:59:59Z`,
      rule_key: 'partner.touchpoint_max_gap_days',
      owner_id: partner.owner_id,
      source: 'S5',
      status: ladder.status,
      escalation_level: ladder.escalation,
      entity_id: partner.id,
      created_at: new Date().toISOString(),
    });

    // Acceptance Test T-17: Partner with no touchpoint for 36 days -> DQ-060 warns
    const daysSinceContact = -getDaysRemaining(lastContact, today);
    if (daysSinceContact >= 36) {
      dqIssues.push({
        rule_id: 'DQ-060',
        subject: `Partner ${partner.name} without touchpoint within 35 days (${daysSinceContact} days since last contact)`,
        severity: 'Warn',
        detected_at: new Date().toISOString(),
        owner_id: partner.owner_id,
        details: {
          partner_id: partner.id,
          partner_name: partner.name,
          days_since_touchpoint: daysSinceContact,
          allowed_gap_days: 35,
        },
      });
    }

    return { items, dqIssues };
  },

  /**
   * Computes national compliance radar deadlines (§8, §11).
   */
  computeComplianceRadar(
    year: number = new Date().getFullYear(),
    currentDateStr?: string,
    defaultOwnerId: string = 'mem-lcvp-001'
  ): DeadlineItem[] {
    const today = currentDateStr ?? new Date().toISOString().split('T')[0];
    const items: DeadlineItem[] = [];

    // ECB Quarterly Audit Reports (§8, S9: Apr 28, Jul 28, Oct 28, Jan 28)
    const ecbQuarters = [
      { q: 'Q1', date: `${year}-04-28` },
      { q: 'Q2', date: `${year}-07-28` },
      { q: 'Q3', date: `${year}-10-28` },
      { q: 'Q4', date: `${year + 1}-01-28` },
    ];

    for (const eq of ecbQuarters) {
      const days = getDaysRemaining(eq.date, today);
      const ladder = evaluateAlertLadder(days);
      items.push({
        id: `dl-ecb-${eq.q}-${year}`,
        category: 'compliance',
        subject: `ECB ${eq.q} Quarterly Audit Report Submission`,
        due_at: `${eq.date}T23:59:59Z`,
        rule_key: 'ecb.report_deadlines',
        owner_id: defaultOwnerId,
        source: 'S9',
        status: ladder.status,
        escalation_level: ladder.escalation,
        entity_id: `ecb-${eq.q}-${year}`,
        created_at: new Date().toISOString(),
      });
    }

    // ICB Audit Checks (§8, S3: March 31, September 30)
    const icbAudits = [
      { term: 'Spring', date: `${year}-03-31` },
      { term: 'Autumn', date: `${year}-09-30` },
    ];

    for (const ia of icbAudits) {
      const days = getDaysRemaining(ia.date, today);
      const ladder = evaluateAlertLadder(days);
      items.push({
        id: `dl-icb-${ia.term}-${year}`,
        category: 'compliance',
        subject: `ICB ${ia.term} National Audit Check (13 Documents)`,
        due_at: `${ia.date}T23:59:59Z`,
        rule_key: 'icb.audit_check_months',
        owner_id: defaultOwnerId,
        source: 'S3',
        status: ladder.status,
        escalation_level: ladder.escalation,
        entity_id: `icb-${ia.term}-${year}`,
        created_at: new Date().toISOString(),
      });
    }

    return items;
  },

  /**
   * Runs complete nightly scan across all exchanges, partners, and national radar (§8).
   */
  runNightlyDeadlineScan(currentDateStr?: string): {
    items: DeadlineItem[];
    dqIssues: Omit<DqIssue, 'id'>[];
    summary: DeadlineRadarSummary;
  } {
    const masterDb = getMasterTrackerDb();
    const allItems: DeadlineItem[] = [];
    const allIssues: Omit<DqIssue, 'id'>[] = [];

    // Exchanges
    for (const exchange of Array.from(masterDb.exchanges.values())) {
      if (exchange.deleted_at) continue;
      const { items, dqIssues } = this.evaluateExchangeDeadlines(exchange, currentDateStr);
      allItems.push(...items);
      allIssues.push(...dqIssues);
    }

    // Partners
    for (const partner of Array.from(masterDb.partners.values())) {
      if (partner.deleted_at) continue;
      const { items, dqIssues } = this.evaluatePartnerDeadlines(partner, currentDateStr);
      allItems.push(...items);
      allIssues.push(...dqIssues);
    }

    // Compliance
    const complianceItems = this.computeComplianceRadar(
      currentDateStr ? new Date(currentDateStr).getFullYear() : undefined,
      currentDateStr
    );
    allItems.push(...complianceItems);

    // Compute summary
    const byStatus: Record<DeadlineStatus, number> = {
      upcoming: 0,
      notice: 0,
      warning: 0,
      urgent: 0,
      overdue: 0,
      resolved: 0,
    };

    const byEscalation: Record<EscalationLevel, number> = {
      owner: 0,
      lcvp: 0,
      lcp: 0,
    };

    for (const item of allItems) {
      byStatus[item.status]++;
      byEscalation[item.escalation_level]++;
    }

    return {
      items: allItems,
      dqIssues: allIssues,
      summary: {
        total: allItems.length,
        byStatus,
        byEscalation,
        urgentCount: byStatus.urgent,
        overdueCount: byStatus.overdue,
      },
    };
  },
};
