import { describe, it, expect } from 'vitest';
import {
  getMoroccanVisaRegime,
  checkVisaLeadTime,
} from '../src/lib/ir/moroccan-visa-matrix';
import { createIrPartner } from '../src/lib/ir/ir-prm';
import {
  generateSharedOpportunityToken,
  isSharedTokenValid,
  revokeSharedToken,
  sanitiseOpportunityForSharedView,
} from '../src/lib/ir/shared-view-token';

describe('Plan 02-04: IR PRM, Moroccan Visa Matrix & Revocable Shared Views', () => {
  describe('TEST-041: Moroccan Visa Regime Classification & Lead Time (REQ-032, THR-047)', () => {
    it('classifies France, Germany, and Brazil as VISA_EXEMPT (90 days)', () => {
      const fr = getMoroccanVisaRegime('FR');
      expect(fr.regime).toBe('VISA_EXEMPT');
      expect(fr.requiresInvitationPack).toBe(false);

      const de = getMoroccanVisaRegime('DE');
      expect(de.regime).toBe('VISA_EXEMPT');

      const br = getMoroccanVisaRegime('BR');
      expect(br.regime).toBe('VISA_EXEMPT');
    });

    it('classifies India and Egypt as AEVM_EVISA', () => {
      const inRegime = getMoroccanVisaRegime('IN');
      expect(inRegime.regime).toBe('AEVM_EVISA');
      expect(inRegime.estimatedProcessingDays).toBe(3);

      const egRegime = getMoroccanVisaRegime('EG');
      expect(egRegime.regime).toBe('AEVM_EVISA');
    });

    it('classifies Cameroon and Nigeria as CONSULAR_VISA requiring official Invitation Pack', () => {
      const cm = getMoroccanVisaRegime('CM');
      expect(cm.regime).toBe('CONSULAR_VISA');
      expect(cm.requiresInvitationPack).toBe(true);

      const ng = getMoroccanVisaRegime('NG');
      expect(ng.regime).toBe('CONSULAR_VISA');
      expect(ng.requiresInvitationPack).toBe(true);
    });

    it('enforces statutory 30-day lead time for consular visas (THR-047)', () => {
      // 40 days lead time -> Compliant
      const compliantCheck = checkVisaLeadTime('CM', '2026-10-01', '2026-11-10');
      expect(compliantCheck.isCompliant).toBe(true);
      expect(compliantCheck.warning).toBeUndefined();

      // 15 days lead time -> Warning / Violation
      const shortCheck = checkVisaLeadTime('CM', '2026-10-01', '2026-10-16');
      expect(shortCheck.isCompliant).toBe(false);
      expect(shortCheck.daysDifference).toBe(15);
      expect(shortCheck.warning).toContain('Statutory Lead Time Warning THR-047 (TEST-041)');

      // Visa-exempt country does not trigger lead time restriction
      const exemptCheck = checkVisaLeadTime('FR', '2026-10-01', '2026-10-05');
      expect(exemptCheck.isCompliant).toBe(true);
    });
  });

  describe('IR Partner Relationship Management (REQ-017)', () => {
    it('creates an IR partner entity with statutory visa regime lookup', () => {
      const partner = createIrPartner({
        id: 'ir-paris',
        lcId: 'lc_rabat_001',
        entityName: 'AIESEC in France (LC Paris)',
        countryCode: 'FR',
        tier: 'TIER_1_STRATEGIC',
        primaryContactName: 'Julien Moreau',
        primaryContactRole: 'VP oGV',
        primaryContactEmail: 'julien.moreau@aiesec.net',
        historicalRealizationsCount: 14,
      });

      expect(partner.tier).toBe('TIER_1_STRATEGIC');
      expect(partner.visaRegime).toBe('VISA_EXEMPT');
      expect(partner.isActive).toBe(true);
      expect(partner.historicalRealizationsCount).toBe(14);
    });
  });

  describe('TEST-043: Revocable Expiring Shared Opportunity Views (REQ-046)', () => {
    it('generates an unguessable 64-character token with 14-day validity', () => {
      const now = 1700000000000;
      const token = generateSharedOpportunityToken({
        opportunityId: 'opp-101',
        lcId: 'lc_rabat_001',
        createdBy: 'user_ir_manager',
        validityDays: 14,
        nowMs: now,
      });

      expect(token.token.length).toBe(64);
      expect(token.isRevoked).toBe(false);

      const expectedExpiryMs = now + 14 * 24 * 60 * 60 * 1000;
      expect(new Date(token.expiresAt).getTime()).toBe(expectedExpiryMs);

      // Verify active
      const validCheck = isSharedTokenValid(token, now);
      expect(validCheck.isValid).toBe(true);

      // Verify expired past 14 days
      const expiredCheck = isSharedTokenValid(token, now + 15 * 24 * 60 * 60 * 1000);
      expect(expiredCheck.isValid).toBe(false);
      expect(expiredCheck.error).toContain('token has expired');
    });

    it('allows immediate manual token revocation', () => {
      const token = generateSharedOpportunityToken({
        opportunityId: 'opp-101',
        lcId: 'lc_rabat_001',
        createdBy: 'user_ir_manager',
      });

      expect(isSharedTokenValid(token).isValid).toBe(true);

      revokeSharedToken(token, 'user_vp_ir');
      expect(token.isRevoked).toBe(true);
      expect(token.revokedBy).toBe('user_vp_ir');
      expect(token.revokedAt).toBeDefined();

      const revokedCheck = isSharedTokenValid(token);
      expect(revokedCheck.isValid).toBe(false);
      expect(revokedCheck.error).toContain('manually revoked');
    });

    it('sanitises opportunity data, stripping confidential fees and internal notes (TEST-043)', () => {
      const rawOpp = {
        id: 'opp-101',
        title: 'Youth Coding & Digital Coach',
        product: 'igv',
        sdgTarget: 4,
        durationWeeks: 6,
        weeklyWorkingHours: 30,
        totalOpenings: 5,
        availableOpenings: 3,
        startDate: '2026-11-01',
        endDate: '2026-12-15',
        city: 'Rabat',
        // Confidential fields:
        commercialPartnerFee: 25000,
        lcProfitMargin: 4000,
        internalNotes: 'Partner requested French speakers only; do not accept unvetted applicants.',
      };

      const sanitised = sanitiseOpportunityForSharedView(rawOpp);

      expect(sanitised.title).toBe('Youth Coding & Digital Coach');
      expect(sanitised.totalOpenings).toBe(5);
      expect(sanitised.city).toBe('Rabat');

      // Check strictly that confidential fields are NOT in sanitised object
      expect((sanitised as any).commercialPartnerFee).toBeUndefined();
      expect((sanitised as any).lcProfitMargin).toBeUndefined();
      expect((sanitised as any).internalNotes).toBeUndefined();
    });
  });
});
