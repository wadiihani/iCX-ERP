/**
 * AIESEC iCX ERP — v2.0 Acceptance Test Harness
 * Author: Wadii Hani <wadii.hani.pro@gmail.com>
 * Plan: iCX_Data_Integrity_Build_Plan_v2.md (v2.0 Governing Plan)
 * Enforces:
 *   - T-21: Empty Database "Empty is Not Green" (Rule R2)
 *   - T-22: No Forbidden Literal Claims in UI Code (Rule R3, R4, R5)
 *   - T-23: STATUTORY_STANDARD_DEFS Matches Section 2 (16 Standards, Mandatory Flags)
 *   - T-24: Compliance Calendar 0/13 Empty State (0% Audited)
 *   - Q8: GV Duration Allowed Values [4, 6, 8] Weeks Only
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  STATUTORY_STANDARD_DEFS,
  getExchangeStandardsWithDefs,
} from '../src/lib/data-integrity/standards-service';
import {
  complianceService,
  resetComplianceDb,
  ICB_COMPLIANCE_ITEMS_SEED,
} from '../src/lib/data-integrity/compliance-calendar';
import {
  validateDurationWeeks,
  STATUTORY_RULE_SEEDS,
} from '../src/lib/data-integrity/rules';
import {
  resetMasterTrackerDb,
  getMasterTrackerDb,
  entityService,
} from '../src/lib/data-integrity/master-tracker';
import { resetQualityCasesDb } from '../src/lib/data-integrity/quality-cases';
import { resetDataQualityDb } from '../src/lib/data-integrity/data-quality';

describe('iCX Build Plan v2.0 Acceptance Suite', () => {
  beforeEach(() => {
    resetMasterTrackerDb();
    resetComplianceDb();
    resetQualityCasesDb();
    resetDataQualityDb();
  });

  // ===========================================================================
  // T-23: Section 2 Standards Table Fidelity
  // ===========================================================================
  describe('T-23: STATUTORY_STANDARD_DEFS equals Section 2 Table Exactly', () => {
    it('contains exactly 16 standards with correct delivery and mandatory flags', () => {
      expect(STATUTORY_STANDARD_DEFS).toHaveLength(16);

      const expectedDefs = [
        { std_no: 1, name: 'Personal goal setting', phase: 'preparation', delivered_by: 'Home entity (tracked by LC Rabat)', mandatory: true },
        { std_no: 2, name: 'Outgoing preparation', phase: 'preparation', delivered_by: 'Home entity (tracked by LC Rabat)', mandatory: true },
        { std_no: 3, name: 'Insurance', phase: 'preparation', delivered_by: 'Home entity (tracked by LC Rabat)', mandatory: true },
        { std_no: 4, name: 'Expectations setting', phase: 'preparation', delivered_by: 'Host', mandatory: true },
        { std_no: 5, name: 'Visa and work permit', phase: 'preparation', delivered_by: 'Host', mandatory: true },
        { std_no: 6, name: 'Arrival pickup', phase: 'preparation', delivered_by: 'Host', mandatory: false },
        { std_no: 7, name: 'Accommodation', phase: 'preparation', delivered_by: 'Host', mandatory: true },
        { std_no: 8, name: 'Incoming preparation', phase: 'preparation', delivered_by: 'Host', mandatory: true },
        { std_no: 9, name: 'First day of work', phase: 'experience', delivered_by: 'Host', mandatory: false },
        { std_no: 10, name: 'Alignment spaces with opportunity provider', phase: 'experience', delivered_by: 'Host', mandatory: true },
        { std_no: 11, name: 'Job description', phase: 'experience', delivered_by: 'Host', mandatory: true },
        { std_no: 12, name: 'Working hours', phase: 'experience', delivered_by: 'Host', mandatory: false },
        { std_no: 13, name: 'Duration', phase: 'experience', delivered_by: 'Host', mandatory: true },
        { std_no: 14, name: 'Opportunity benefits', phase: 'experience', delivered_by: 'Host', mandatory: true },
        { std_no: 15, name: 'Departure support', phase: 'experience', delivered_by: 'Host', mandatory: false },
        { std_no: 16, name: 'Debrief with AIESEC', phase: 'post_experience', delivered_by: 'Home entity (tracked by LC Rabat)', mandatory: true },
      ];

      for (const exp of expectedDefs) {
        const found = STATUTORY_STANDARD_DEFS.find((d) => d.std_no === exp.std_no);
        expect(found, `Missing standard #${exp.std_no}`).toBeDefined();
        expect(found?.name).toBe(exp.name);
        expect(found?.phase).toBe(exp.phase);
        expect(found?.delivered_by).toBe(exp.delivered_by);
        expect(found?.mandatory).toBe(exp.mandatory);
      }
    });

    it('ensures Home-entity standards #1, #2, #3, #16 are mandatory for Complete per Q7', () => {
      const homeStandards = STATUTORY_STANDARD_DEFS.filter((s) => s.delivered_by.startsWith('Home'));
      expect(homeStandards).toHaveLength(4);
      expect(homeStandards.map((s) => s.std_no).sort((a, b) => a - b)).toEqual([1, 2, 3, 16]);
      for (const hs of homeStandards) {
        expect(hs.mandatory).toBe(true);
      }
    });
  });

  // ===========================================================================
  // T-21 & T-24: Empty Is Not Green (Rule R2)
  // ===========================================================================
  describe('T-21 & T-24: Empty Database Produces No Green / Compliant Badges (Rule R2)', () => {
    it('T-24: Compliance scorecard shows 0% with 0/13 docs verified on clean state', () => {
      // Create LC Rabat entity
      const entity = entityService.createEntity(
        {
          id: 'ent-morocco-rabat',
          expa_id: 154,
          name: 'AIESEC in Rabat',
          type: 'LC',
          country: 'Morocco',
        },
        'usr-admin'
      );

      // Seed the 13 ICB audit docs in pending/unsubmitted state
      complianceService.seedIcbAuditCatalogue(entity.id, 'usr-admin');
      const scorecard = complianceService.getComplianceAuditScorecard(entity.id);
      expect(scorecard.totalDocs).toBe(13);
      expect(scorecard.passedDocs).toBe(0);
      expect(scorecard.overallPassPct).toBe(0);
      expect(scorecard.isCompliant).toBe(false);
    });

    it('returns empty standards list with 0% delivery for unseeded exchange', () => {
      const standards = getExchangeStandardsWithDefs('non-existent-ex');
      expect(standards).toHaveLength(16);
      const deliveredCount = standards.filter((s) => s.tracked_status === 'delivered').length;
      expect(deliveredCount).toBe(0);
    });
  });

  // ===========================================================================
  // T-22: No Forbidden Literal Claims in UI Code (Static Ast / Content Scan)
  // ===========================================================================
  describe('T-22: Zero Forbidden Claims in Production UI Code', () => {
    const forbiddenPhrases = [
      'cryptographically recorded under Moroccan statutory law',
      '100% On-Time',
      '4.2 hours',
      'APPROVAL-TO-RE TIMER (48H)',
      'All 3 B2B partners contacted',
      'All EPs on Track',
      'Annex 4 Fully Audited',
    ];

    const appDir = path.resolve(process.cwd(), 'src/app');

    function scanFiles(dir: string): string[] {
      let results: string[] = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          results = results.concat(scanFiles(fullPath));
        } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
          results.push(fullPath);
        }
      }
      return results;
    }

    it('ensures no UI files contain banned marketing or fake statutory claims', () => {
      const sourceFiles = scanFiles(appDir);
      for (const file of sourceFiles) {
        const content = fs.readFileSync(file, 'utf8');
        for (const phrase of forbiddenPhrases) {
          expect(
            content.includes(phrase),
            `Forbidden phrase "${phrase}" found in ${path.relative(process.cwd(), file)}`
          ).toBe(false);
        }
      }
    });
  });

  // ===========================================================================
  // Q8: GV Duration Allowed Values [4, 6, 8] Weeks Only
  // ===========================================================================
  describe('Q8: GV Duration Allowed Values [4, 6, 8]', () => {
    it('accepts 4, 6, 8 weeks as valid GV durations', () => {
      expect(validateDurationWeeks('GV', 4).valid).toBe(true);
      expect(validateDurationWeeks('GV', 6).valid).toBe(true);
      expect(validateDurationWeeks('GV', 8).valid).toBe(true);
    });

    it('rejects 5 and 7 weeks as invalid GV durations', () => {
      expect(validateDurationWeeks('GV', 5).valid).toBe(false);
      expect(validateDurationWeeks('GV', 7).valid).toBe(false);
    });

    it('rejects below 4 and above 8 weeks', () => {
      expect(validateDurationWeeks('GV', 2).valid).toBe(false);
      expect(validateDurationWeeks('GV', 3).valid).toBe(false);
      expect(validateDurationWeeks('GV', 9).valid).toBe(false);
      expect(validateDurationWeeks('GV', 12).valid).toBe(false);
    });
  });
});
