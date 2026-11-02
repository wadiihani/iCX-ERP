/**
 * AIESEC iCX ERP — Role-Based Access Control & Confidentiality (RBAC)
 * Author: Wadii Hani <wadii.hani.pro@gmail.com>
 * Specification: iCX_Data_Integrity_Tracking_Spec.md v1.0 (§12.4, §16 T-18, T-19)
 * Milestone: M0 (Plan 00-03)
 * Enforces: INV-10 (Confidentiality & PII Minimisation), INV-09 (Attribution)
 */

import type { Ep, AuditLogEntry } from '../types/data-integrity';

export interface ActorContext {
  id: string; // Member UUID
  role:
    | 'LCVP_ICX'
    | 'LCVP_IGV'
    | 'ECB'
    | 'ECB_AUDITOR'
    | 'ADMIN'
    | 'MM'
    | 'TL'
    | 'MEMBER'
    | 'FINANCE'
    | 'AUDITOR';
  team_id?: string | null;
}

/**
 * Checks whether an actor has permission to view unmasked EP contact details (INV-10, §12.4).
 * Contact data is restricted to:
 * - LCVP_ICX / LCVP_IGV / ADMIN
 * - ECB / ECB_AUDITOR
 * - The EP's direct owner (actor.id === ep.owner_id)
 * - Middle Manager (MM) overseeing the same team
 */
export function canViewEpContact(
  ep: Ep,
  actor: ActorContext,
  epTeamId?: string | null
): boolean {
  // Global supervisory roles
  if (
    actor.role === 'LCVP_ICX' ||
    actor.role === 'LCVP_IGV' ||
    actor.role === 'ADMIN' ||
    actor.role === 'ECB' ||
    actor.role === 'ECB_AUDITOR'
  ) {
    return true;
  }

  // Direct owner
  if (actor.id && actor.id === ep.owner_id) {
    return true;
  }

  // Middle Manager (MM) of the same team
  if (actor.role === 'MM' && actor.team_id && epTeamId && actor.team_id === epTeamId) {
    return true;
  }

  return false;
}

/**
 * Redacts EP contact fields for unauthorized or general member roles (T-18).
 */
export function sanitizeEpForViewer(
  ep: Ep,
  actor: ActorContext,
  epTeamId?: string | null
): Ep {
  const allowed = canViewEpContact(ep, actor, epTeamId);

  if (allowed) {
    return ep;
  }

  // Redact contact data completely for unauthorized viewers
  return {
    ...ep,
    contact: {
      email: '[REDACTED]',
      phone: '[REDACTED]',
      whatsapp: '[REDACTED]',
    },
  };
}

/**
 * Creates an audit log entry for CSV or full data export events (INV-09, T-19).
 */
export function logExportAudit(
  actorId: string,
  scope: string,
  rowCount: number,
  format: 'CSV' | 'ZIP' | 'XLSX' = 'CSV'
): Omit<AuditLogEntry, 'id'> {
  return {
    ts: new Date().toISOString(),
    actor: actorId,
    action: 'EXPORT',
    table_name: scope,
    record_id: `export_${scope.toLowerCase()}_${Date.now()}`,
    before: null,
    after: {
      format,
      row_count: rowCount,
      exported_at: new Date().toISOString(),
    },
    request_id: `req_exp_${Math.random().toString(36).slice(2, 10)}`,
  };
}
