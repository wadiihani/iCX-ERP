/**
 * Revocable Expiring Shared Opportunity View Generator
 * Baseline: REQ-046, TEST-043
 */

import { randomBytes } from 'crypto';

export interface SharedOpportunityToken {
  token: string;
  opportunityId: string;
  lcId: string;
  targetPartnerId?: string | null;
  createdBy: string;
  createdAt: string; // ISO
  expiresAt: string; // ISO
  isRevoked: boolean;
  revokedAt?: string | null;
  revokedBy?: string | null;
  allowedFields: string[];
}

export interface SanitisedOpportunityView {
  id: string;
  title: string;
  product: string;
  sdgTarget?: number | null;
  durationWeeks: number;
  weeklyWorkingHours: number;
  totalOpenings: number;
  availableOpenings: number;
  startDate: string;
  endDate: string;
  city: string;
  country: string;
  // Note: Partner commercial fee amount and internal coordinator notes are strictly stripped per TEST-043
}

/**
 * Generates an unguessable 64-char hexadecimal token with configurable expiration (max 30 days).
 */
export function generateSharedOpportunityToken(params: {
  opportunityId: string;
  lcId: string;
  createdBy: string;
  targetPartnerId?: string | null;
  validityDays?: number; // Default: 14 days, max 30 days
  nowMs?: number;
}): SharedOpportunityToken {
  const validityDays = Math.min(30, Math.max(1, params.validityDays ?? 14));
  const nowMs = params.nowMs ?? Date.now();
  const expiresAtMs = nowMs + validityDays * 24 * 60 * 60 * 1000;
  const token = randomBytes(32).toString('hex'); // 64 hex characters

  return {
    token,
    opportunityId: params.opportunityId,
    lcId: params.lcId,
    targetPartnerId: params.targetPartnerId,
    createdBy: params.createdBy,
    createdAt: new Date(nowMs).toISOString(),
    expiresAt: new Date(expiresAtMs).toISOString(),
    isRevoked: false,
    allowedFields: ['title', 'product', 'sdgTarget', 'durationWeeks', 'weeklyWorkingHours', 'totalOpenings', 'availableOpenings', 'startDate', 'endDate', 'city', 'country'],
  };
}

/**
 * Checks whether a shared token is currently valid and unexpired.
 */
export function isSharedTokenValid(tokenRecord: SharedOpportunityToken, nowMs: number = Date.now()): {
  isValid: boolean;
  error?: string;
} {
  if (tokenRecord.isRevoked) {
    return {
      isValid: false,
      error: 'Token has been manually revoked by hosting Local Committee.',
    };
  }

  const expiresMs = new Date(tokenRecord.expiresAt).getTime();
  if (nowMs > expiresMs) {
    return {
      isValid: false,
      error: 'Shared opportunity token has expired.',
    };
  }

  return { isValid: true };
}

/**
 * Manually revokes a token immediately.
 */
export function revokeSharedToken(tokenRecord: SharedOpportunityToken, revokedBy: string): void {
  tokenRecord.isRevoked = true;
  tokenRecord.revokedAt = new Date().toISOString();
  tokenRecord.revokedBy = revokedBy;
}

/**
 * Sanitises an opportunity object for public/external partner view,
 * stripping internal commercial financial margins and confidential operational notes (TEST-043).
 */
export function sanitiseOpportunityForSharedView(
  rawOpportunity: Record<string, unknown>
): SanitisedOpportunityView {
  return {
    id: String(rawOpportunity.id || ''),
    title: String(rawOpportunity.title || ''),
    product: String(rawOpportunity.product || 'igv'),
    sdgTarget: (rawOpportunity.sdgTarget || rawOpportunity.sdg_target) as number | undefined,
    durationWeeks: Number(rawOpportunity.durationWeeks || rawOpportunity.duration_weeks || 6),
    weeklyWorkingHours: Number(rawOpportunity.weeklyWorkingHours || rawOpportunity.weekly_working_hours || 30),
    totalOpenings: Number(rawOpportunity.totalOpenings || rawOpportunity.total_openings || 0),
    availableOpenings: Number(rawOpportunity.availableOpenings || rawOpportunity.available_openings || 0),
    startDate: String(rawOpportunity.startDate || rawOpportunity.start_date || ''),
    endDate: String(rawOpportunity.endDate || rawOpportunity.end_date || ''),
    city: String(rawOpportunity.city || 'Rabat'),
    country: 'Morocco',
  };
}
