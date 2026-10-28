import { describe, it, expect } from 'vitest';
import {
  validateIGTaOpportunity,
  validateIGTeOpportunity,
  enforceZeroEPFeePolicy,
  STATUTORY_MOROCCAN_MIN_SALARY_MAD,
} from '../src/lib/professional/professional-exchange-engine';
import type {
  IGTaOpportunityPayload,
  IGTeOpportunityPayload,
} from '../src/lib/types/professional-exchange';

describe('Phase 6 Plan 01: iGTa & iGTe Opportunity Validation & Zero EP Fee Invariant', () => {
  // Test 1: REQ-036 / TEST-034: iGTa Opportunity Criteria
  describe('iGTa Opportunity Criteria (REQ-036, TEST-034)', () => {
    const validIGTa: IGTaOpportunityPayload = {
      id: 'opp_igta_01',
      lcId: 'lc_rabat',
      title: 'Cloud DevOps Engineer',
      partnerOrganizationId: 'org_inwi_01',
      partnerName: 'Inwi Telecom Maroc',
      professionalField: 'SOFTWARE_ENGINEERING',
      durationWeeks: 24, // 6 to 78 weeks
      weeklyHours: 40, // 35 to 45 h/wk
      monthlySalaryMad: 6000, // >= 3500 MAD
      feesChargedToEpMad: 0, // MUST BE 0
      supervisorTitle: 'Lead Cloud Architect',
      jobDescription: 'Design CI/CD pipelines and Kubernetes infrastructure.',
    };

    it('passes valid iGTa opportunity fulfilling all statutory criteria', () => {
      const result = validateIGTaOpportunity(validIGTa);
      expect(result.isValid).toBe(true);
      expect(result.violations.length).toBe(0);
      expect(result.zeroEpFeeCompliant).toBe(true);
      expect(result.actualSalaryMad).toBe(6000);
    });

    it('rejects iGTa opportunity with duration outside 6 to 78 weeks', () => {
      const tooShort = validateIGTaOpportunity({ ...validIGTa, durationWeeks: 4 });
      expect(tooShort.isValid).toBe(false);
      expect(tooShort.violations.some((v) => v.includes('Invalid Duration'))).toBe(true);

      const tooLong = validateIGTaOpportunity({ ...validIGTa, durationWeeks: 82 });
      expect(tooLong.isValid).toBe(false);
      expect(tooLong.violations.some((v) => v.includes('Invalid Duration'))).toBe(true);
    });

    it('rejects iGTa opportunity with working hours outside 35 to 45 hours/week', () => {
      const partTime = validateIGTaOpportunity({ ...validIGTa, weeklyHours: 25 });
      expect(partTime.isValid).toBe(false);
      expect(partTime.violations.some((v) => v.includes('Invalid Working Hours'))).toBe(true);

      const excessiveHours = validateIGTaOpportunity({ ...validIGTa, weeklyHours: 55 });
      expect(excessiveHours.isValid).toBe(false);
      expect(excessiveHours.violations.some((v) => v.includes('Invalid Working Hours'))).toBe(true);
    });

    it('rejects iGTa opportunity offering salary below the statutory Moroccan floor', () => {
      const belowFloor = validateIGTaOpportunity({
        ...validIGTa,
        monthlySalaryMad: 2500, // < 3500 MAD
      });
      expect(belowFloor.isValid).toBe(false);
      expect(belowFloor.violations.some((v) => v.includes('Statutory Salary Violation'))).toBe(true);
    });

    it('rejects iGTa opportunity missing designated workplace supervisor', () => {
      const noSupervisor = validateIGTaOpportunity({
        ...validIGTa,
        supervisorTitle: '',
      });
      expect(noSupervisor.isValid).toBe(false);
      expect(noSupervisor.violations.some((v) => v.includes('Supervisor role/title'))).toBe(true);
    });
  });

  // Test 2: REQ-037 / TEST-035: iGTe Opportunity Criteria
  describe('iGTe Opportunity Criteria (REQ-037, TEST-035)', () => {
    const validIGTe: IGTeOpportunityPayload = {
      id: 'opp_igte_01',
      lcId: 'lc_rabat',
      title: 'Secondary STEM & Physics Teacher',
      educationalInstitutionId: 'inst_rabat_lycee',
      institutionName: 'Lycée Descartes Rabat',
      institutionTier: 'INTERNATIONAL_BILINGUAL_SCHOOL',
      isInstitutionVetted: true,
      academicSubject: 'STEM_EDUCATION',
      durationWeeks: 36, // 9 to 78 weeks
      weeklyHours: 35, // 35 to 45 h/wk
      monthlySalaryMad: 5500, // >= 3500 MAD
      feesChargedToEpMad: 0, // MUST BE 0
      curriculumOutline: 'IB Physics and Advanced Mathematics for Grades 10-12.',
      supervisorTitle: 'Dean of Academic Affairs',
    };

    it('passes valid iGTe opportunity meeting educational criteria', () => {
      const result = validateIGTeOpportunity(validIGTe);
      expect(result.isValid).toBe(true);
      expect(result.violations.length).toBe(0);
      expect(result.zeroEpFeeCompliant).toBe(true);
    });

    it('rejects iGTe opportunity with duration shorter than 9 weeks', () => {
      const shortTeaching = validateIGTeOpportunity({ ...validIGTe, durationWeeks: 6 });
      expect(shortTeaching.isValid).toBe(false);
      expect(shortTeaching.violations.some((v) => v.includes('Invalid Duration'))).toBe(true);
    });

    it('rejects iGTe opportunity with an unvetted educational institution', () => {
      const unvettedSchool = validateIGTeOpportunity({
        ...validIGTe,
        isInstitutionVetted: false,
      });
      expect(unvettedSchool.isValid).toBe(false);
      expect(unvettedSchool.violations.some((v) => v.includes('Unvetted Institution'))).toBe(true);
    });

    it('rejects iGTe opportunity offering salary below the statutory Moroccan floor', () => {
      const lowTeacherStipend = validateIGTeOpportunity({
        ...validIGTe,
        monthlySalaryMad: 2000,
      });
      expect(lowTeacherStipend.isValid).toBe(false);
      expect(lowTeacherStipend.violations.some((v) => v.includes('Statutory Salary Violation'))).toBe(true);
    });
  });

  // Test 3: REQ-085 / TEST-081: Strict Zero EP Fee Enforcement
  describe('Strict Zero EP Fee Enforcement (REQ-085, TEST-081)', () => {
    it('strictly forbids charging any fee to an iGTa participant', () => {
      const feePolicy = enforceZeroEPFeePolicy('iGTa', 2500);
      expect(feePolicy.isCompliant).toBe(false);
      expect(feePolicy.error).toContain('Statutory Policy Violation REQ-085');
      expect(feePolicy.error).toContain('strictly prohibited');

      // Zero fee is compliant
      expect(enforceZeroEPFeePolicy('iGTa', 0).isCompliant).toBe(true);
    });

    it('strictly forbids charging any fee to an iGTe participant', () => {
      const feePolicy = enforceZeroEPFeePolicy('iGTe', 1500);
      expect(feePolicy.isCompliant).toBe(false);
      expect(feePolicy.error).toContain('Statutory Policy Violation REQ-085');

      // Zero fee is compliant
      expect(enforceZeroEPFeePolicy('iGTe', 0).isCompliant).toBe(true);
    });

    it('permits legitimate voluntary exchange fee for iGV', () => {
      const igvFee = enforceZeroEPFeePolicy('iGV', 3000);
      expect(igvFee.isCompliant).toBe(true);
    });
  });
});
