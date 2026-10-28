/**
 * Accommodation Inventory & Bed Allocation Engine
 * Invariant INV-01: Zero Overbooking via Temporal Exclusion
 * Statutory Baseline: REQ-059, REQ-060, REQ-061, TEST-056, TEST-057, TEST-058
 */

import {
  AccommodationProvider,
  AccommodationBed,
  AccommodationAllocation,
  BedGenderRestriction,
  EpGender,
} from '../types/accommodation';

export interface VettingValidationResult {
  isValid: boolean;
  error?: string;
  daysUntilExpiry?: number;
}

export interface GenderValidationResult {
  isCompatible: boolean;
  error?: string;
}

export interface TemporalCollisionResult {
  hasCollision: boolean;
  conflictingAllocation?: AccommodationAllocation;
  error?: string;
}

export interface BedAllocationRequest {
  id?: string;
  applicationId: string;
  bed: AccommodationBed;
  provider: AccommodationProvider;
  epGender: EpGender;
  epName: string;
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  existingBedAllocations: AccommodationAllocation[];
  currentDate?: Date;
}

export interface BedAllocationResult {
  success: boolean;
  allocation?: AccommodationAllocation;
  errors: string[];
}

/**
 * REQ-059 & TEST-056: Validates provider vetting status and annual validity window (365 days).
 * Unvetted, suspended, blacklisted, or expired providers cannot accept bed bookings.
 */
export function validateProviderVettingForBooking(
  provider: AccommodationProvider,
  currentDate: Date = new Date()
): VettingValidationResult {
  if (!provider.isActive) {
    return {
      isValid: false,
      error: `Statutory Violation REQ-059 (TEST-056): Provider "${provider.providerName}" is deactivated.`,
    };
  }

  if (provider.vettingStatus !== 'APPROVED_VETTED') {
    return {
      isValid: false,
      error: `Statutory Violation REQ-059 (TEST-056): Accommodation provider "${provider.providerName}" cannot accept bed bookings because vetting status is ${provider.vettingStatus}. Physical vetting inspection is mandatory.`,
    };
  }

  if (!provider.lastVettedDate) {
    return {
      isValid: false,
      error: `Statutory Violation REQ-059 (TEST-056): Accommodation provider "${provider.providerName}" has no recorded physical vetting date.`,
    };
  }

  const lastVettedMs = new Date(provider.lastVettedDate).getTime();
  const currentMs = currentDate.getTime();
  const daysElapsed = Math.floor((currentMs - lastVettedMs) / (1000 * 60 * 60 * 24));

  if (daysElapsed > 365) {
    return {
      isValid: false,
      error: `Statutory Violation REQ-059 (TEST-056): Accommodation provider "${provider.providerName}" vetting expired ${daysElapsed} days ago (>365 days). Annual re-inspection is mandatory before assigning exchange participants.`,
      daysUntilExpiry: 365 - daysElapsed,
    };
  }

  return {
    isValid: true,
    daysUntilExpiry: 365 - daysElapsed,
  };
}

/**
 * REQ-061 & TEST-058: Enforces gender restriction compatibility.
 * FEMALE_ONLY rooms reject non-female EPs.
 * MALE_ONLY rooms reject non-male EPs.
 */
export function validateGenderCompatibility(
  bedRestriction: BedGenderRestriction,
  epGender: EpGender
): GenderValidationResult {
  if (bedRestriction === 'FEMALE_ONLY' && epGender !== 'FEMALE') {
    return {
      isCompatible: false,
      error: `Statutory Violation REQ-061 (TEST-058): Cannot allocate ${epGender} participant to FEMALE_ONLY room/bed.`,
    };
  }

  if (bedRestriction === 'MALE_ONLY' && epGender !== 'MALE') {
    return {
      isCompatible: false,
      error: `Statutory Violation REQ-061 (TEST-058): Cannot allocate ${epGender} participant to MALE_ONLY room/bed.`,
    };
  }

  return {
    isCompatible: true,
  };
}

/**
 * INV-01, REQ-060 & TEST-057: Temporal Exclusion Constraint Validator.
 * Prevents overlapping date ranges [check_in, check_out) on the same bed.
 * Half-open interval semantic [start, end) allows adjacent bookings where
 * previous check-out date equals incoming check-in date.
 */
export function checkTemporalBedCollision(
  bedId: string,
  newCheckInDate: string,
  newCheckOutDate: string,
  existingAllocations: AccommodationAllocation[]
): TemporalCollisionResult {
  const incomingStart = new Date(newCheckInDate).getTime();
  const incomingEnd = new Date(newCheckOutDate).getTime();

  if (incomingEnd <= incomingStart) {
    return {
      hasCollision: true,
      error: 'Invalid date range: check-out date must be strictly after check-in date.',
    };
  }

  const activeAllocations = existingAllocations.filter(
    (alloc) =>
      alloc.bedId === bedId &&
      !alloc.isArchived &&
      alloc.allocStatus !== 'CANCELLED'
  );

  for (const alloc of activeAllocations) {
    const existingStart = new Date(alloc.checkInDate).getTime();
    const existingEnd = new Date(alloc.checkOutDate).getTime();

    // Overlap condition for half-open intervals [start, end):
    // incomingStart < existingEnd && incomingEnd > existingStart
    const isOverlapping = incomingStart < existingEnd && incomingEnd > existingStart;

    if (isOverlapping) {
      return {
        hasCollision: true,
        conflictingAllocation: alloc,
        error: `Statutory Violation INV-01 (TEST-057): Temporal collision on Bed "${bedId}". Proposed stay [${newCheckInDate} to ${newCheckOutDate}) overlaps with active reservation [${alloc.checkInDate} to ${alloc.checkOutDate}) in status "${alloc.allocStatus}". Zero overbooking constraint enforced.`,
      };
    }
  }

  return {
    hasCollision: false,
  };
}

/**
 * Composite Bed Allocation Function: executes complete statutory validation pipeline.
 */
export function allocateBedToEp(request: BedAllocationRequest): BedAllocationResult {
  const errors: string[] = [];

  // 1. Provider vetting check (REQ-059, TEST-056)
  const vetting = validateProviderVettingForBooking(request.provider, request.currentDate);
  if (!vetting.isValid && vetting.error) {
    errors.push(vetting.error);
  }

  // 2. Gender restriction check (REQ-061, TEST-058)
  const gender = validateGenderCompatibility(request.bed.genderRestriction, request.epGender);
  if (!gender.isCompatible && gender.error) {
    errors.push(gender.error);
  }

  // 3. Temporal collision check (INV-01, REQ-060, TEST-057)
  const collision = checkTemporalBedCollision(
    request.bed.id,
    request.checkInDate,
    request.checkOutDate,
    request.existingBedAllocations
  );
  if (collision.hasCollision && collision.error) {
    errors.push(collision.error);
  }

  if (errors.length > 0) {
    return {
      success: false,
      errors,
    };
  }

  const newAllocation: AccommodationAllocation = {
    id: request.id || `alloc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    applicationId: request.applicationId,
    bedId: request.bed.id,
    epName: request.epName,
    epGender: request.epGender,
    checkInDate: request.checkInDate,
    checkOutDate: request.checkOutDate,
    allocStatus: 'RESERVED_LOCKED',
    provider14dReconfirmedAt: null,
    op14dReconfirmedAt: null,
    depositPaidMad: request.bed.depositMad,
    depositRefundedMad: 0,
    isArchived: false,
  };

  return {
    success: true,
    allocation: newAllocation,
    errors: [],
  };
}
