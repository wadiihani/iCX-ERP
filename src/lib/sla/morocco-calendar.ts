/**
 * Moroccan Statutory Working Calendar & Africa/Casablanca Timezone Engine
 * Baseline: REQ-048, TEST-045
 */

export const MOROCCO_TIMEZONE = 'Africa/Casablanca';

// Known Moroccan Statutory Holidays (YYYY-MM-DD fixed or representative astronomical dates)
const MOROCCAN_HOLIDAYS = new Set([
  '2026-01-01', // New Year's Day
  '2026-01-11', // Manifesto of Independence
  '2026-03-20', // Eid al-Fitr (approx)
  '2026-05-01', // Labour Day
  '2026-05-27', // Eid al-Adha (approx)
  '2026-06-16', // Islamic New Year / 1st Moharram
  '2026-07-30', // Throne Day
  '2026-08-14', // Oued Ed-Dahab Day
  '2026-08-20', // Revolution of the King and the People
  '2026-08-21', // Youth Day
  '2026-08-26', // Eid al-Mawlid
  '2026-11-06', // Green March Day
  '2026-11-18', // Independence Day
]);

/**
 * Checks if a given Date is a non-working day in Morocco (Saturday, Sunday, or Statutory Holiday).
 */
export function isMoroccoBusinessDay(date: Date): boolean {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return false;
  }

  // Check date string in YYYY-MM-DD
  const isoDate = date.toISOString().split('T')[0];
  if (MOROCCAN_HOLIDAYS.has(isoDate)) {
    return false;
  }

  return true;
}

/**
 * Adds business hours strictly within Africa/Casablanca working days (excluding weekends and holidays).
 */
export function addMoroccoBusinessHours(
  startDate: Date | string,
  businessHoursToAdd: number
): Date {
  const current = new Date(startDate);
  let remainingHours = businessHoursToAdd;

  while (remainingHours > 0) {
    // Advance by 1 hour
    current.setTime(current.getTime() + 60 * 60 * 1000);

    // Only count hour if the current day is a Moroccan business day
    if (isMoroccoBusinessDay(current)) {
      remainingHours -= 1;
    }
  }

  return current;
}

/**
 * Calculates remaining business hours between two timestamps.
 */
export function calculateBusinessHoursBetween(
  startDate: Date | string,
  endDate: Date | string
): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (end <= start) return 0;

  let businessHours = 0;
  const cursor = new Date(start);

  while (cursor < end) {
    cursor.setTime(cursor.getTime() + 60 * 60 * 1000);
    if (isMoroccoBusinessDay(cursor)) {
      businessHours += 1;
    }
  }

  return businessHours;
}
