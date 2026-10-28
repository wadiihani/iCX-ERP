/**
 * State Machine SM-03: Slot Allocation Lifecycle Machine
 * Baseline: REQ-024, THR-048, INV-04, and TEST-027
 */

export type SlotStatus = 'UNALLOCATED' | 'RESERVED' | 'CONFIRMED' | 'CANCELLED';

export interface OpportunitySlot {
  id: string;
  opportunityId: string;
  slotNumber: number;
  startDate: string; // ISO
  endDate: string; // ISO
  status: SlotStatus;
  reservedApplicationId?: string | null;
  reservedAt?: string | null;
  confirmedAt?: string | null;
}

export interface SlotAllocationParams {
  slot: OpportunitySlot;
  applicationId: string;
  currentDateMs?: number;
  hasVpOverride?: boolean;
}

/**
 * Validates and allocates an opportunity slot according to SM-03 and THR-048.
 */
export function reserveSlot(
  params: SlotAllocationParams
): { success: boolean; slot?: OpportunitySlot; error?: string } {
  const { slot, applicationId, currentDateMs = Date.now(), hasVpOverride = false } = params;

  // 1. Status Check: Slot must be UNALLOCATED
  if (slot.status !== 'UNALLOCATED') {
    return {
      success: false,
      error: `Invalid slot transition: cannot reserve slot in ${slot.status} state. Slot must be UNALLOCATED.`,
    };
  }

  // 2. Horizon Check (THR-048 / TEST-027): Max 180 days advance slot opening
  const slotStartMs = new Date(slot.startDate).getTime();
  const maxAdvanceMs = 180 * 24 * 60 * 60 * 1000;

  if (slotStartMs - currentDateMs > maxAdvanceMs && !hasVpOverride) {
    const daysAhead = Math.round((slotStartMs - currentDateMs) / (1000 * 60 * 60 * 24));
    return {
      success: false,
      error: `Horizon Breach THR-048 (TEST-027): Slot start date is ${daysAhead} days in advance (exceeds statutory 180-day limit). Explicit VP override is required to open advance slots.`,
    };
  }

  // Transition to RESERVED
  slot.status = 'RESERVED';
  slot.reservedApplicationId = applicationId;
  slot.reservedAt = new Date().toISOString();

  return {
    success: true,
    slot,
  };
}

/**
 * Confirms a reserved slot (e.g. after EP acceptance and fee clearance).
 */
export function confirmSlot(slot: OpportunitySlot): { success: boolean; error?: string } {
  if (slot.status !== 'RESERVED') {
    return {
      success: false,
      error: `Invalid transition: only RESERVED slots can be CONFIRMED. Current status: ${slot.status}.`,
    };
  }

  slot.status = 'CONFIRMED';
  slot.confirmedAt = new Date().toISOString();

  return { success: true };
}

/**
 * Validates Invariant INV-04: total active slots cannot exceed opportunity capacity.
 */
export function validateSlotCapacity(
  totalOpportunityOpenings: number,
  activeSlotsCount: number
): { isValid: boolean; error?: string } {
  if (activeSlotsCount > totalOpportunityOpenings) {
    return {
      isValid: false,
      error: `Capacity Invariant Violation INV-04: active slots (${activeSlotsCount}) exceed total opportunity openings capacity (${totalOpportunityOpenings}).`,
    };
  }

  return { isValid: true };
}
