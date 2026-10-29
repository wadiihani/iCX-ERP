import { describe, it, expect } from 'vitest';
import {
  OFFICIAL_GV_PROJECTS,
  IGTA_FUNCTIONAL_FIELDS,
  IGTE_SUBJECTS,
  IGTE_TEACHING_LEVELS,
  SDG_CATALOG,
  type OpportunitySlotWave,
} from '../src/lib/opportunity/opportunity-portfolio-data';
import {
  validateOpportunityPortfolio,
  STATUTORY_MOROCCAN_MIN_SALARY_MAD,
  type OpportunityPortfolioInput,
} from '../src/lib/opportunity/opportunity-portfolio-validator';

describe('Phase 14: Project Portfolio (iGV/iGTa/iGTe), Opportunities & Capacity Waves', () => {
  // Section 1: Official 16 Global Volunteer Projects
  describe('HUB-OPP-02: 16 Official Global Volunteer Projects & UN SDG Alignment', () => {
    it('contains exactly 16 official Global Volunteer projects', () => {
      expect(OFFICIAL_GV_PROJECTS.length).toBe(16);
    });

    it('verifies every project maps to a valid Primary UN SDG with valid activities and outputs', () => {
      OFFICIAL_GV_PROJECTS.forEach((proj) => {
        expect(proj.primarySdg).toBeGreaterThanOrEqual(1);
        expect(proj.primarySdg).toBeLessThanOrEqual(17);
        expect(SDG_CATALOG[proj.primarySdg]).toBeDefined();
        expect(proj.typicalActivities.length).toBeGreaterThan(0);
        expect(proj.expectedOutputs.length).toBeGreaterThan(5);
        expect(proj.targetBeneficiaries.length).toBeGreaterThan(3);
      });
    });

    it('validates a compliant iGV opportunity with project linkage and unpaid volunteer status', () => {
      const gvOpp: OpportunityPortfolioInput = {
        title: 'Global Classroom: Primary School Digital Coach',
        product: 'igv',
        organizationId: 'org_rabat_001',
        portfolioProject: 'Global Classroom',
        primarySdg: 4,
        secondarySdgs: [1, 8],
        targetBeneficiaries: 'Public school students in Rabat-Sale',
        plannedActivities: ['Scratch programming workshops', 'Interactive French/English clubs'],
        expectedOutputs: '100+ students completing 24h digital training.',
        durationWeeks: 6,
        weeklyWorkingHours: 30,
        fundingPercentage: 100,
        monthlySalaryMad: 0, // Volunteer must be 0
        totalOpenings: 5,
        modality: 'PHYSICAL',
      };

      const res = validateOpportunityPortfolio(gvOpp);
      expect(res.isValid).toBe(true);
      expect(res.errors.length).toBe(0);
    });

    it('strictly rejects an iGV opportunity with salary > 0 MAD (AEPP cash wage prohibition)', () => {
      const paidGv: OpportunityPortfolioInput = {
        title: 'Paid Volunteer',
        product: 'igv',
        organizationId: 'org_rabat_001',
        portfolioProject: 'Green Leaders',
        primarySdg: 13,
        targetBeneficiaries: 'Coastal community',
        plannedActivities: ['Beach cleanups'],
        expectedOutputs: '500kg plastic collected',
        durationWeeks: 6,
        weeklyWorkingHours: 30,
        monthlySalaryMad: 2000, // VIOLATION: volunteering is unpaid
        totalOpenings: 2,
        modality: 'PHYSICAL',
      };

      const res = validateOpportunityPortfolio(paidGv);
      expect(res.isValid).toBe(false);
      expect(res.errors.some((e) => e.includes('monetary salary'))).toBe(true);
    });

    it('rejects an iGV opportunity with duration outside 6 to 8 weeks', () => {
      const longGv: OpportunityPortfolioInput = {
        title: 'Long Camp',
        product: 'igv',
        organizationId: 'org_rabat_001',
        portfolioProject: 'Heartbeat',
        primarySdg: 3,
        targetBeneficiaries: 'Community health clinics',
        plannedActivities: ['Preventive health clinics'],
        expectedOutputs: '100 screenings',
        durationWeeks: 12, // VIOLATION: max 8 weeks for iGV
        weeklyWorkingHours: 30,
        totalOpenings: 3,
        modality: 'PHYSICAL',
      };

      const res = validateOpportunityPortfolio(longGv);
      expect(res.isValid).toBe(false);
      expect(res.errors.some((e) => e.includes('duration must be strictly 6 to 8 weeks'))).toBe(true);
    });
  });

  // Section 2: iGTa Professional Exchange Rules
  describe('HUB-OPP-03: iGTa 6 Functional Fields, Floor Salary & Zero EP Fee', () => {
    it('defines 6 official functional fields for iGTa', () => {
      expect(IGTA_FUNCTIONAL_FIELDS.length).toBe(6);
      const fieldIds = IGTA_FUNCTIONAL_FIELDS.map((f) => f.id);
      expect(fieldIds).toContain('INFORMATION_TECHNOLOGY');
      expect(fieldIds).toContain('MARKETING');
      expect(fieldIds).toContain('FINANCE');
      expect(fieldIds).toContain('BUSINESS_ADMINISTRATION');
      expect(fieldIds).toContain('BUSINESS_DEVELOPMENT');
      expect(fieldIds).toContain('ENGINEERING');
    });

    it('passes compliant iGTa opportunity meeting salary floor and zero EP fee', () => {
      const validIgta: OpportunityPortfolioInput = {
        title: 'Junior DevOps Engineer',
        product: 'igt',
        organizationId: 'org_casatech',
        professionalField: 'INFORMATION_TECHNOLOGY',
        durationWeeks: 24,
        weeklyWorkingHours: 40,
        monthlySalaryMad: 5000, // >= 3500 MAD floor
        epFeeMad: 0,
        supervisorName: 'Mehdi Alami',
        supervisorTitle: 'VP Technology',
        totalOpenings: 2,
        modality: 'PHYSICAL',
      };

      const res = validateOpportunityPortfolio(validIgta);
      expect(res.isValid).toBe(true);
      expect(res.errors.length).toBe(0);
    });

    it('rejects iGTa with salary below Moroccan statutory floor of 3,500 MAD', () => {
      const lowSalaryIgta: OpportunityPortfolioInput = {
        title: 'Underpaid Intern',
        product: 'igt',
        organizationId: 'org_casatech',
        professionalField: 'MARKETING',
        durationWeeks: 16,
        weeklyWorkingHours: 35,
        monthlySalaryMad: 2800, // < 3500 MAD
        epFeeMad: 0,
        supervisorName: 'Sarah B.',
        totalOpenings: 1,
        modality: 'PHYSICAL',
      };

      const res = validateOpportunityPortfolio(lowSalaryIgta);
      expect(res.isValid).toBe(false);
      expect(res.errors.some((e) => e.includes('Statutory Floor Violation'))).toBe(true);
    });

    it('rejects iGTa opportunity charging fee to EP (APIP 5.2.3.1.4)', () => {
      const feeChargedIgta: OpportunityPortfolioInput = {
        title: 'Finance Analyst',
        product: 'igt',
        organizationId: 'org_bmce',
        professionalField: 'FINANCE',
        durationWeeks: 24,
        weeklyWorkingHours: 40,
        monthlySalaryMad: 4500,
        epFeeMad: 1200, // VIOLATION: Zero fee policy
        supervisorName: 'Yassine K.',
        totalOpenings: 1,
        modality: 'PHYSICAL',
      };

      const res = validateOpportunityPortfolio(feeChargedIgta);
      expect(res.isValid).toBe(false);
      expect(res.errors.some((e) => e.includes('Zero EP Fee Policy Violation'))).toBe(true);
    });

    it('rejects iGTa opportunity missing workplace supervisor', () => {
      const noSupervisor: OpportunityPortfolioInput = {
        title: 'Unsupervised Software Engineer',
        product: 'igt',
        organizationId: 'org_casatech',
        professionalField: 'INFORMATION_TECHNOLOGY',
        durationWeeks: 24,
        weeklyWorkingHours: 40,
        monthlySalaryMad: 6000,
        epFeeMad: 0,
        totalOpenings: 2,
        modality: 'PHYSICAL',
      };

      const res = validateOpportunityPortfolio(noSupervisor);
      expect(res.isValid).toBe(false);
      expect(res.errors.some((e) => e.includes('technical supervisor'))).toBe(true);
    });
  });

  // Section 3: iGTe Teacher Exchange Rules
  describe('HUB-OPP-03: iGTe Teaching Requirements & Minimum 9-Week Duration', () => {
    it('approves a compliant iGTe opportunity with curriculum outline and teacher supervision', () => {
      const validIgte: OpportunityPortfolioInput = {
        title: 'Middle School STEM & Robotics Teacher',
        product: 'igte',
        organizationId: 'org_rabat_americanschool',
        teachingSubject: 'STEM_EDUCATION',
        teachingLevel: 'MIDDLE_SCHOOL',
        curriculumOutline: 'Hands-on LEGO robotics curriculum for grades 6-8.',
        durationWeeks: 16, // >= 9 weeks
        weeklyWorkingHours: 35,
        monthlySalaryMad: 5500,
        epFeeMad: 0,
        supervisorName: 'Dr. Sarah Jenkins',
        supervisorTitle: 'Dean of Academic Affairs',
        totalOpenings: 2,
        modality: 'PHYSICAL',
      };

      const res = validateOpportunityPortfolio(validIgte);
      expect(res.isValid).toBe(true);
      expect(res.errors.length).toBe(0);
    });

    it('rejects iGTe opportunity with duration under 9 weeks', () => {
      const shortTeaching: OpportunityPortfolioInput = {
        title: 'Short Teaching Assignment',
        product: 'igte',
        organizationId: 'org_rabat_americanschool',
        teachingSubject: 'ENGLISH_LANGUAGE',
        teachingLevel: 'PRIMARY',
        curriculumOutline: 'Phonics and early vocabulary.',
        durationWeeks: 6, // VIOLATION: iGTe minimum is 9 weeks
        weeklyWorkingHours: 35,
        monthlySalaryMad: 4000,
        epFeeMad: 0,
        supervisorName: 'Principal M.',
        totalOpenings: 1,
        modality: 'PHYSICAL',
      };

      const res = validateOpportunityPortfolio(shortTeaching);
      expect(res.isValid).toBe(false);
      expect(res.errors.some((e) => e.includes('duration must be between 9 and 78 weeks'))).toBe(true);
    });
  });

  // Section 4: Modality & Partly-Remote ICB Gate
  describe('HUB-OPP-04: Modality & Partly-Remote ICB Audit Gate (APIP 5.2)', () => {
    it('approves partly-remote opportunity within 50% remote share and valid ICB reference', () => {
      const validPartlyRemote: OpportunityPortfolioInput = {
        title: 'Partly Remote Fullstack Engineer',
        product: 'igt',
        organizationId: 'org_casatech',
        professionalField: 'INFORMATION_TECHNOLOGY',
        durationWeeks: 20, // >= 13 weeks
        weeklyWorkingHours: 40,
        monthlySalaryMad: 6000,
        epFeeMad: 0,
        supervisorName: 'Mehdi A.',
        totalOpenings: 2,
        modality: 'PARTLY_REMOTE',
        remoteWeeks: 6, // 6/20 = 30% <= 50%
        icbAuditUrl: 'https://aies.ec/icb-audit-casatech-009',
      };

      const res = validateOpportunityPortfolio(validPartlyRemote);
      expect(res.isValid).toBe(true);
      expect(res.errors.length).toBe(0);
    });

    it('rejects partly-remote opportunity where remote weeks exceed 50%', () => {
      const excessiveRemote: OpportunityPortfolioInput = {
        title: 'Excessive Remote Engineer',
        product: 'igt',
        organizationId: 'org_casatech',
        professionalField: 'INFORMATION_TECHNOLOGY',
        durationWeeks: 16,
        weeklyWorkingHours: 40,
        monthlySalaryMad: 6000,
        totalOpenings: 2,
        modality: 'PARTLY_REMOTE',
        remoteWeeks: 10, // 10 / 16 = 62.5% > 50%
        icbAuditUrl: 'https://aies.ec/audit-001',
        supervisorName: 'Mehdi A.',
      };

      const res = validateOpportunityPortfolio(excessiveRemote);
      expect(res.isValid).toBe(false);
      expect(res.errors.some((e) => e.includes('cannot exceed 50%'))).toBe(true);
    });

    it('rejects partly-remote opportunity missing mandatory ICB audit URL', () => {
      const missingAudit: OpportunityPortfolioInput = {
        title: 'Missing ICB Audit Form',
        product: 'igt',
        organizationId: 'org_casatech',
        professionalField: 'INFORMATION_TECHNOLOGY',
        durationWeeks: 16,
        weeklyWorkingHours: 40,
        monthlySalaryMad: 6000,
        totalOpenings: 2,
        modality: 'PARTLY_REMOTE',
        remoteWeeks: 4,
        icbAuditUrl: '', // Missing
        supervisorName: 'Mehdi A.',
      };

      const res = validateOpportunityPortfolio(missingAudit);
      expect(res.isValid).toBe(false);
      expect(res.errors.some((e) => e.includes('requires an approved ICB Audit Form URL'))).toBe(true);
    });
  });

  // Section 5: Post-Approval Benefit Locking (AEPP 4.2.1.4)
  describe('AEPP 4.2.1.4: Post-Approval Benefit Locking', () => {
    it('activates benefit locking notice when approvedCount >= 1', () => {
      const lockedOpp: OpportunityPortfolioInput = {
        title: 'Established Project with Approved EPs',
        product: 'igv',
        organizationId: 'org_rabat_001',
        portfolioProject: 'Global Classroom',
        primarySdg: 4,
        targetBeneficiaries: 'School children',
        plannedActivities: ['Tutoring'],
        expectedOutputs: '50 students coached',
        durationWeeks: 6,
        weeklyWorkingHours: 30,
        totalOpenings: 5,
        modality: 'PHYSICAL',
        approvedCount: 2, // >= 1 candidate approved
      };

      const res = validateOpportunityPortfolio(lockedOpp);
      expect(res.isValid).toBe(true);
      expect(res.benefitsLockedNotice).toBeDefined();
      expect(res.benefitsLockedNotice).toContain('Benefit Lock Active');
      expect(res.benefitsLockedNotice).toContain('AEPP 4.2.1.4');
    });
  });

  // Section 6: Multi-Slot Wave Capacity Math
  describe('HUB-OPP-01: Multi-Slot Wave Capacity Math & Aggregations', () => {
    it('calculates open available slots as capacity minus approved count', () => {
      const wave: OpportunitySlotWave = {
        id: 'wave-winter',
        opportunityId: 'opp-1',
        waveLabel: 'Winter Wave 26',
        startDate: '2026-11-01',
        endDate: '2026-12-15',
        capacity: 5,
        appliedCount: 12,
        acceptedCount: 6,
        approvedCount: 3,
        realizedCount: 1,
        completedCount: 0,
      };

      const available = wave.capacity - wave.approvedCount;
      expect(available).toBe(2);

      const fillRate = Math.round((wave.approvedCount / wave.capacity) * 100);
      expect(fillRate).toBe(60);
    });
  });
});
