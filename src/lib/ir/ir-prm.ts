/**
 * International Relations (IR) Partner Relationship Management (PRM)
 * Baseline: REQ-017
 */

import { getMoroccanVisaRegime, type MoroccanVisaRegime } from './moroccan-visa-matrix';

export type IrPartnershipTier = 'TIER_1_STRATEGIC' | 'TIER_2_ACTIVE' | 'TIER_3_EXPLORATORY';

export interface IrPartnerEntity {
  id: string;
  lcId: string; // Hosting LC (LC Rabat)
  entityName: string; // e.g. "AIESEC in France (LC Paris)"
  countryCode: string;
  tier: IrPartnershipTier;
  primaryContactName: string;
  primaryContactRole: string;
  primaryContactEmail: string;
  primaryContactPhone?: string;
  whatsappGroupUrl?: string;
  historicalRealizationsCount: number;
  averageSlaResponseHours: number;
  visaRegime: MoroccanVisaRegime;
  isActive: boolean;
  notes?: string;
}

/**
 * Creates or updates an IR partner entity with statutory visa regime lookup.
 */
export function createIrPartner(params: {
  id: string;
  lcId: string;
  entityName: string;
  countryCode: string;
  tier: IrPartnershipTier;
  primaryContactName: string;
  primaryContactRole: string;
  primaryContactEmail: string;
  primaryContactPhone?: string;
  historicalRealizationsCount?: number;
}): IrPartnerEntity {
  const visaInfo = getMoroccanVisaRegime(params.countryCode);

  return {
    id: params.id,
    lcId: params.lcId,
    entityName: params.entityName,
    countryCode: params.countryCode.toUpperCase(),
    tier: params.tier,
    primaryContactName: params.primaryContactName,
    primaryContactRole: params.primaryContactRole,
    primaryContactEmail: params.primaryContactEmail,
    primaryContactPhone: params.primaryContactPhone,
    historicalRealizationsCount: params.historicalRealizationsCount ?? 0,
    averageSlaResponseHours: 12,
    visaRegime: visaInfo.regime,
    isActive: true,
  };
}
