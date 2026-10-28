import { createHash } from 'crypto';

export interface AuditRecordPayload {
  prev_hash?: string | null;
  table_name: string;
  record_id: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE' | 'EXECUTE' | 'AUTH';
  created_at: string;
  new_state?: Record<string, unknown> | null;
}

/**
 * Computes the SHA-256 audit hash matching the database trigger:
 * encode(sha256((coalesce(prev_hash, '') || table_name || record_id || action || created_at::text || coalesce(new_state::text, ''))::bytea), 'hex')
 */
export function computeAuditHash(payload: AuditRecordPayload): string {
  const prevHash = payload.prev_hash || '';
  const newStateStr = payload.new_state ? JSON.stringify(payload.new_state) : '';
  const payloadString = `${prevHash}${payload.table_name}${payload.record_id}${payload.action}${payload.created_at}${newStateStr}`;

  return createHash('sha256').update(payloadString, 'utf8').digest('hex');
}

/**
 * Validates integrity of an audit chain of records.
 * Returns true if each record's prev_hash matches the prior hash and
 * each hash matches the SHA-256 signature of its content.
 */
export function verifyAuditChain(
  records: Array<{
    hash: string;
    prev_hash?: string | null;
    table_name: string;
    record_id: string;
    action: 'INSERT' | 'UPDATE' | 'DELETE' | 'EXECUTE' | 'AUTH';
    created_at: string;
    new_state?: Record<string, unknown> | null;
  }>
): { valid: boolean; brokenAtIndex?: number; error?: string } {
  for (let i = 0; i < records.length; i++) {
    const current = records[i];

    if (i > 0) {
      const prev = records[i - 1];
      if (current.prev_hash !== prev.hash) {
        return {
          valid: false,
          brokenAtIndex: i,
          error: `Chain broken at index ${i}: prev_hash does not match previous record hash.`,
        };
      }
    }

    // Verify cryptographic integrity
    const expectedHash = computeAuditHash(current);
    if (expectedHash !== current.hash) {
      return {
        valid: false,
        brokenAtIndex: i,
        error: `Integrity violation at index ${i}: hash mismatch. Record may have been tampered with.`,
      };
    }
  }

  return { valid: true };
}
