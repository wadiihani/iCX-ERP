/**
 * AIESEC iCX ERP — Versioned Rule Registry & Evaluation Engine
 * Author: Wadii Hani <wadii.hani.pro@gmail.com>
 * Specification: iCX_Data_Integrity_Tracking_Spec.md v1.0 (§3.4, §16 T-16)
 * Milestone: M0 (Plan 00-03)
 * Enforces: INV-08 (Versioned Rules — never hard-code rule parameters)
 */

import type { Programme, RuleRegistryEntry } from '../types/data-integrity';

export type MinMaxRule = {
  min: number;
  max: number;
};

export type DurationRuleValue = MinMaxRule | number[];

/**
 * Seed rule entries reflecting the statutory rules table (§3.4)
 * Updated per iCX Data Integrity Build Plan v2.0 (Q8: GV duration allowed values [4, 6, 8], single rule, no legacy row in production)
 */
export const STATUTORY_RULE_SEEDS: RuleRegistryEntry[] = [
  // GV Duration: allowed values [4, 6, 8] weeks per v2.0 Q8 (no legacy row in production; 5 and 7 are invalid)
  {
    key: 'gv.duration_weeks',
    value: [4, 6, 8],
    effective_from: '2020-01-01',
    effective_to: null,
    source: 'S9, Q8',
    note: 'v2.0 Q8: GV duration options are 4, 6 or 8 weeks only',
  },

  // GTe Short Experience Weeks
  {
    key: 'gte.short_experience_weeks',
    value: { min: 6, max: 12 },
    effective_from: '2026-01-01',
    effective_to: null,
    source: 'S9',
    note: 'Previously 9-12 weeks',
  },

  // Hours per week
  {
    key: 'hours.gv_per_week',
    value: { min: 25, max: 45 },
    effective_from: '2020-01-01',
    effective_to: null,
    source: 'S1, S5',
    note: 'Mandatory weekly volunteer hours for GV',
  },
  {
    key: 'hours.gta_gte_per_week',
    value: { min: 35, max: 45 },
    effective_from: '2020-01-01',
    effective_to: null,
    source: 'S1, S5',
    note: 'Mandatory weekly internship hours for GTa/GTe',
  },

  // Visa & Logistics Timelines
  {
    key: 'visa.docs_due_days_after_approval',
    value: 14,
    effective_from: '2020-01-01',
    effective_to: null,
    source: 'S9',
    note: 'Host entity must deliver visa documentation within 14 days of approval',
  },
  {
    key: 'departure_support.days_before_fi',
    value: 14,
    effective_from: '2020-01-01',
    effective_to: null,
    source: 'S1',
    note: 'Written legal and logistic departure procedure sent >= 14 days before FI',
  },
  {
    key: 'early_fi.request_min_days_before_new_finish',
    value: 7,
    effective_from: '2020-01-01',
    effective_to: null,
    source: 'S2',
    note: 'Early finish request must be submitted >= 7 days before desired finish date',
  },
  {
    key: 'extension_fi.request_min_days_before_finish',
    value: 14,
    effective_from: '2020-01-01',
    effective_to: null,
    source: 'S2',
    note: 'Extension request must be submitted >= 14 days before current finish date',
  },

  // APD / RE Status Breaches
  {
    key: 'apd_re_passed.gv_direct_break_after_days',
    value: 20,
    effective_from: '2020-01-01',
    effective_to: null,
    source: 'S2',
    note: 'GV: RE date passed > 20 days allows direct extraordinary break',
  },
  {
    key: 'apd_re_passed.auto_violation_level',
    value: 5,
    effective_from: '2020-01-01',
    effective_to: null,
    source: 'S2',
    note: 'APD left after RE date constitutes fake status -> Level 5 violation',
  },

  // Partner Management SLAs
  {
    key: 'partner.closing_meeting_max_days_after_fi',
    value: 30,
    effective_from: '2020-01-01',
    effective_to: null,
    source: 'S5',
    note: 'Closing meeting must be held within 30 days of FI',
  },
  {
    key: 'partner.nps_reminder_months_after_start',
    value: 1,
    effective_from: '2020-01-01',
    effective_to: null,
    source: 'S5',
    note: 'Monthly partner NPS reminder',
  },
  {
    key: 'partner.touchpoint_max_gap_days',
    value: 35,
    effective_from: '2020-01-01',
    effective_to: null,
    source: 'S5',
    note: 'Monthly partner check-in SLA',
  },

  // Compliance & Reporting
  {
    key: 'ecb.report_deadlines',
    value: { Q1: '04-28', Q2: '07-28', Q3: '10-28', Q4: '01-28' },
    effective_from: '2026-01-01',
    effective_to: null,
    source: 'S9',
    note: 'Quarterly ECB report deadlines',
  },
  {
    key: 'icb.audit_check_months',
    value: [3, 9],
    effective_from: '2020-01-01',
    effective_to: null,
    source: 'S3',
    note: 'ICB audit check months',
  },

  // Import & Sync Guards
  {
    key: 'sync.max_age_hours',
    value: 24,
    effective_from: '2020-01-01',
    effective_to: null,
    source: 'CONFIG',
    note: 'Maximum allowed age of EXPA sync',
  },
  {
    key: 'import.max_row_drop_pct',
    value: 5,
    effective_from: '2020-01-01',
    effective_to: null,
    source: 'CONFIG',
    note: 'Maximum allowed percentage drop in imported rows',
  },
];

/**
 * Resolves the effective rule entry for a given key as of a specific date.
 */
export function getEffectiveRule<T = unknown>(
  key: string,
  evaluationDate: string | Date = new Date(),
  customRules: RuleRegistryEntry[] = STATUTORY_RULE_SEEDS
): RuleRegistryEntry<T> | null {
  const targetDateStr =
    typeof evaluationDate === 'string'
      ? evaluationDate.slice(0, 10)
      : evaluationDate.toISOString().slice(0, 10);

  const matches = customRules.filter((r) => {
    if (r.key !== key) return false;
    if (r.effective_from > targetDateStr) return false;
    if (r.effective_to && r.effective_to < targetDateStr) return false;
    return true;
  });

  if (matches.length === 0) return null;

  // Return the one with the latest effective_from
  matches.sort((a, b) => b.effective_from.localeCompare(a.effective_from));
  return matches[0] as RuleRegistryEntry<T>;
}

/**
 * Validates project duration against the versioned rule (INV-08, T-16).
 */
export function validateDurationWeeks(
  programme: Programme,
  weeks: number,
  evaluationDate: string | Date = new Date(),
  customRules: RuleRegistryEntry[] = STATUTORY_RULE_SEEDS
): {
  valid: boolean;
  min: number;
  max: number;
  allowedValues?: number[];
  ruleVersion: string;
} {
  if (programme === 'GV') {
    const rule = getEffectiveRule<DurationRuleValue>('gv.duration_weeks', evaluationDate, customRules);
    if (!rule || !rule.value) {
      throw new Error('Missing rule definition for gv.duration_weeks');
    }

    if (Array.isArray(rule.value)) {
      const allowed = rule.value;
      const valid = allowed.includes(weeks);
      return {
        valid,
        min: Math.min(...allowed),
        max: Math.max(...allowed),
        allowedValues: allowed,
        ruleVersion: `${rule.source} (Effective from: ${rule.effective_from}${rule.effective_to ? ' to ' + rule.effective_to : ''})`,
      };
    }

    const { min, max } = rule.value;
    const valid = weeks >= min && weeks <= max;
    return {
      valid,
      min,
      max,
      ruleVersion: `${rule.source} (Effective from: ${rule.effective_from}${rule.effective_to ? ' to ' + rule.effective_to : ''})`,
    };
  }

  if (programme === 'GTe') {
    const rule = getEffectiveRule<MinMaxRule>('gte.short_experience_weeks', evaluationDate, customRules);
    if (!rule || !rule.value) {
      return { valid: true, min: 6, max: 12, ruleVersion: 'default' };
    }
    const { min, max } = rule.value;
    return {
      valid: weeks >= min && weeks <= max,
      min,
      max,
      ruleVersion: rule.source,
    };
  }

  // GTa: currently unconstrained
  return { valid: true, min: 6, max: 78, ruleVersion: 'unconstrained' };
}

/**
 * Validates working hours per week against statutory rules.
 */
export function validateHoursPerWeek(
  programme: Programme,
  hours: number,
  evaluationDate: string | Date = new Date(),
  customRules: RuleRegistryEntry[] = STATUTORY_RULE_SEEDS
): {
  valid: boolean;
  min: number;
  max: number;
} {
  const ruleKey = programme === 'GV' ? 'hours.gv_per_week' : 'hours.gta_gte_per_week';
  const rule = getEffectiveRule<MinMaxRule>(ruleKey, evaluationDate, customRules);
  if (!rule || !rule.value) {
    throw new Error(`Missing rule definition for ${ruleKey}`);
  }
  const { min, max } = rule.value;
  return {
    valid: hours >= min && hours <= max,
    min,
    max,
  };
}
