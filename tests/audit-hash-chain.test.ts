import { describe, it, expect } from 'vitest';
import { computeAuditHash, verifyAuditChain } from '../src/lib/audit/hash-chain';

describe('INV-02: Cryptographic Audit Hash Chaining', () => {
  it('computes deterministic SHA-256 hashes for audit events', () => {
    const event1 = {
      prev_hash: null,
      table_name: 'organizations',
      record_id: 'org-101',
      action: 'INSERT' as const,
      created_at: '2026-10-26T12:00:00Z',
      new_state: { name: 'Fondation Orient-Occident' },
    };

    const hash1 = computeAuditHash(event1);
    expect(hash1).toBeDefined();
    expect(hash1.length).toBe(64); // SHA-256 hex string length

    // Same payload yields identical hash
    const hash1Duplicate = computeAuditHash(event1);
    expect(hash1Duplicate).toBe(hash1);
  });

  it('validates a continuous, un-tampered audit chain', () => {
    const event1 = {
      prev_hash: null,
      table_name: 'organizations',
      record_id: 'org-101',
      action: 'INSERT' as const,
      created_at: '2026-10-26T12:00:00Z',
      new_state: { name: 'Fondation Orient-Occident' },
    };
    const hash1 = computeAuditHash(event1);

    const event2 = {
      prev_hash: hash1,
      table_name: 'opportunities',
      record_id: 'opp-202',
      action: 'INSERT' as const,
      created_at: '2026-10-26T12:05:00Z',
      new_state: { title: 'Youth Climate Initiative' },
    };
    const hash2 = computeAuditHash(event2);

    const chain = [
      { ...event1, hash: hash1 },
      { ...event2, hash: hash2 },
    ];

    const result = verifyAuditChain(chain);
    expect(result.valid).toBe(true);
  });

  it('detects tampering when an audit record payload is altered', () => {
    const event1 = {
      prev_hash: null,
      table_name: 'organizations',
      record_id: 'org-101',
      action: 'INSERT' as const,
      created_at: '2026-10-26T12:00:00Z',
      new_state: { name: 'Fondation Orient-Occident' },
    };
    const hash1 = computeAuditHash(event1);

    // Tampered: someone changed the record_id or state
    const tamperedEvent1 = {
      ...event1,
      hash: hash1,
      new_state: { name: 'Tampered Hacker Org' },
    };

    const result = verifyAuditChain([tamperedEvent1]);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Integrity violation');
  });

  it('detects a broken chain link when prev_hash is mismatched', () => {
    const event1 = {
      prev_hash: null,
      table_name: 'organizations',
      record_id: 'org-101',
      action: 'INSERT' as const,
      created_at: '2026-10-26T12:00:00Z',
      new_state: { name: 'Org 1' },
    };
    const hash1 = computeAuditHash(event1);

    const event2 = {
      prev_hash: 'bogus-hash-value-0000',
      table_name: 'organizations',
      record_id: 'org-101',
      action: 'UPDATE' as const,
      created_at: '2026-10-26T12:10:00Z',
      new_state: { name: 'Org 1 Updated' },
    };
    const hash2 = computeAuditHash(event2);

    const chain = [
      { ...event1, hash: hash1 },
      { ...event2, hash: hash2 },
    ];

    const result = verifyAuditChain(chain);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Chain broken at index 1');
  });
});
