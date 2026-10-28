/**
 * Types & Domain Interfaces for Module H: Accommodation Inventory & Bed Allocation
 * Baseline: REQ-059, REQ-060, REQ-061, INV-01, and TEST-056..058
 */

export type AccommodationProviderType =
  | 'GLOBAL_HOST_FAMILY'
  | 'PARTNER_HOSTEL'
  | 'RENTED_APARTMENT'
  | 'OP_DORMITORY';

export type VettingStatusType =
  | 'PENDING_INSPECTION'
  | 'APPROVED_VETTED'
  | 'SUSPENDED'
  | 'BLACKLISTED';

export type BedGenderRestriction =
  | 'FEMALE_ONLY'
  | 'MALE_ONLY'
  | 'COED_PRIVATE';

export type AllocStatusType =
  | 'RESERVED_LOCKED'
  | 'CHECKED_IN'
  | 'CHECKED_OUT'
  | 'CANCELLED';

export type EpGender = 'MALE' | 'FEMALE' | 'OTHER';

export interface VettingChecklist {
  inspectionDate: string; // ISO date
  inspectorUserId: string;
  sanitaryStandardScore: number; // 0..100 (Threshold >= 70%)
  hasRunningWater: boolean;
  hasHotWater: boolean;
  hasCleanBathroom: boolean;
  hasSecureLocking: boolean;
  hasFireSafetyEmergencyExit: boolean;
  hasWifiAccess: boolean;
  singleBedPerEp: boolean;
  contractMoUSigned: boolean;
  notes?: string;
}

export interface AccommodationProvider {
  id: string;
  lcId: string;
  providerName: string;
  providerType: AccommodationProviderType;
  neighborhood: string; // e.g. Agdal, Hassan, Ocean, Souissi, Hay Riad
  fullAddress: string;
  contactPerson: string;
  phoneWhatsapp: string;
  vettingStatus: VettingStatusType;
  lastVettedDate: string | null; // ISO date (valid for 365 days)
  vettedByUserId: string | null;
  checklist?: VettingChecklist;
  isActive: boolean;
}

export interface AccommodationUnit {
  id: string;
  providerId: string;
  unitName: string;
  hasSingleBeds: boolean;
  hasCleanWater: boolean;
  hasCleanBathroom: boolean;
  hasElectricity: boolean;
  isActive: boolean;
}

export interface AccommodationBed {
  id: string;
  unitId: string;
  unitName?: string;
  providerName?: string;
  bedCode: string; // e.g. "BED-A1", "BED-B2"
  genderRestriction: BedGenderRestriction;
  monthlyCostMad: number;
  depositMad: number;
  isActive: boolean;
}

export interface AccommodationAllocation {
  id: string;
  applicationId: string;
  bedId: string;
  epName?: string;
  epGender?: EpGender;
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  allocStatus: AllocStatusType;
  provider14dReconfirmedAt?: string | null;
  op14dReconfirmedAt?: string | null;
  depositPaidMad?: number;
  depositRefundedMad?: number;
  isArchived: boolean;
}
