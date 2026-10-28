import { describe, it, expect, vi } from 'vitest';
import { ExpaRateLimiter } from '../src/lib/expa/rate-limiter';
import { ExpaClient } from '../src/lib/expa/client';
import {
  buildRawStagingEntries,
  detectExpaConflicts,
  paginateNodes,
  type LocalApplicationSummary,
} from '../src/lib/expa/sync-engine';
import type { ExpaApplicationNode } from '../src/lib/expa/types';

describe('Plan 02-01: EXPA GraphQL Read-Sync Engine', () => {
  describe('THR-039: Token Bucket Rate Limiter', () => {
    it('allows requests up to the capacity and throttles when exhausted', () => {
      const now = 1000000;
      const limiter = new ExpaRateLimiter(5, now); // 5 requests per minute for testing

      // First 5 requests must succeed
      for (let i = 0; i < 5; i++) {
        expect(limiter.tryAcquire(now)).toBe(true);
      }

      // 6th request must be throttled
      expect(limiter.tryAcquire(now)).toBe(false);
      expect(limiter.getWaitTimeMs(now)).toBeGreaterThan(0);

      // Advance time by 12 seconds (12,000ms = 1 token at 5/min)
      const later = now + 12000;
      expect(limiter.tryAcquire(later)).toBe(true);
    });
  });

  describe('Error Classification & Backoff Delay (REQ-042)', () => {
    const client = new ExpaClient({
      endpoint: 'https://gis.aiesec.org/graphql',
      initialBackoffMs: 100,
    });

    it('classifies HTTP errors accurately', () => {
      expect(client.classifyError(401)).toBe('AUTH_EXPIRED');
      expect(client.classifyError(403)).toBe('AUTH_EXPIRED');
      expect(client.classifyError(429)).toBe('RATE_LIMITED');
      expect(client.classifyError(500)).toBe('NETWORK_FAILURE');
      expect(client.classifyError(503)).toBe('NETWORK_FAILURE');
      expect(client.classifyError(200, 'Cannot query field "bogus"')).toBe('SCHEMA_MISMATCH');
    });

    it('calculates exponential backoff delay with jitter', () => {
      const delay0 = client.calculateBackoffDelay(0);
      const delay1 = client.calculateBackoffDelay(1);
      const delay2 = client.calculateBackoffDelay(2);

      expect(delay0).toBeGreaterThanOrEqual(100);
      expect(delay1).toBeGreaterThanOrEqual(200);
      expect(delay2).toBeGreaterThanOrEqual(400);
    });
  });

  describe('TEST-040: Resilient Execution & Retry Logic', () => {
    it('retries on HTTP 500 network errors and succeeds upon recovery', async () => {
      let callCount = 0;
      const mockFetch = vi.fn().mockImplementation(async () => {
        callCount++;
        if (callCount < 2) {
          return {
            ok: false,
            status: 502,
            text: async () => 'Bad Gateway',
          };
        }
        return {
          ok: true,
          status: 200,
          json: async () => ({
            data: {
              allOpportunityApplication: {
                nodes: [{ id: 'app-101', status: 'applied' }],
                page_info: { has_next_page: false, total_count: 1 },
              },
            },
          }),
        };
      });

      const resilientClient = new ExpaClient({
        endpoint: 'https://gis.aiesec.org/graphql',
        initialBackoffMs: 10,
        maxRetries: 2,
      });

      const res = await resilientClient.executeQuery('{ allOpportunityApplication { nodes { id } } }', {}, mockFetch as any);
      expect(res.data).toBeDefined();
      expect(callCount).toBe(2);
    });
  });

  describe('Forensic Staging & Immutability (REQ-043, DEC-003)', () => {
    it('creates raw JSON staging entries untouched before transformation', () => {
      const mockNodes: ExpaApplicationNode[] = [
        {
          id: 'app-991',
          status: 'applied',
          created_at: '2026-10-26T12:00:00Z',
          updated_at: '2026-10-26T12:00:00Z',
          person: {
            id: 'per-1',
            full_name: 'Elena Rostova',
            email: 'elena.rostova@aiesec.net',
          },
          opportunity: {
            id: 'opp-101',
            title: 'Youth Digital Literacy Coach',
          },
        },
      ];

      const staging = buildRawStagingEntries('batch_sync_001', 'lc_rabat_001', mockNodes);
      expect(staging.length).toBe(1);
      expect(staging[0].remoteId).toBe('app-991');
      expect(staging[0].syncBatchId).toBe('batch_sync_001');
      expect(staging[0].rawJson).toEqual(mockNodes[0]);
    });
  });

  describe('Non-Destructive Conflict Detection (DEC-003)', () => {
    it('flags status conflicts between EXPA remote and local planning state without overwriting', () => {
      const remoteNode: ExpaApplicationNode = {
        id: 'app-991',
        status: 'withdrawn', // Remote says withdrawn
        created_at: '2026-10-26T12:00:00Z',
        updated_at: '2026-10-26T14:00:00Z',
        person: {
          id: 'per-1',
          full_name: 'Elena Rostova',
          email: 'elena.rostova@aiesec.net',
        },
        opportunity: {
          id: 'opp-101',
          title: 'Youth Digital Literacy Coach',
        },
      };

      const localApp: LocalApplicationSummary = {
        id: 'local-app-001',
        expaApplicationId: 'app-991',
        status: 'approved', // Local planning state is approved
        epName: 'Elena Rostova',
        notes: 'Visa pack issued',
        updatedAt: '2026-10-26T13:00:00Z',
      };

      const conflicts = detectExpaConflicts(remoteNode, localApp);
      expect(conflicts.length).toBe(1);
      expect(conflicts[0].field).toBe('status');
      expect(conflicts[0].localValue).toBe('approved');
      expect(conflicts[0].remoteValue).toBe('withdrawn');
      expect(conflicts[0].resolutionStatus).toBe('PENDING_REVIEW');
    });

    it('returns empty conflicts when local and remote match', () => {
      const remoteNode: ExpaApplicationNode = {
        id: 'app-992',
        status: 'applied',
        created_at: '2026-10-26T12:00:00Z',
        updated_at: '2026-10-26T12:00:00Z',
        person: { id: 'per-2', full_name: 'Carlos Silva', email: 'carlos@aiesec.net' },
        opportunity: { id: 'opp-101', title: 'Youth Digital Literacy Coach' },
      };

      const localApp: LocalApplicationSummary = {
        id: 'local-app-002',
        expaApplicationId: 'app-992',
        status: 'applied',
        epName: 'Carlos Silva',
        updatedAt: '2026-10-26T12:00:00Z',
      };

      const conflicts = detectExpaConflicts(remoteNode, localApp);
      expect(conflicts.length).toBe(0);
    });
  });

  describe('Cursor Pagination Engine', () => {
    it('paginates nodes with accurate page info and cursors', () => {
      const allNodes: ExpaApplicationNode[] = [
        { id: '1', status: 'applied', created_at: '', updated_at: '', person: { id: '1', full_name: '', email: '' }, opportunity: { id: '1', title: '' } },
        { id: '2', status: 'applied', created_at: '', updated_at: '', person: { id: '2', full_name: '', email: '' }, opportunity: { id: '1', title: '' } },
        { id: '3', status: 'applied', created_at: '', updated_at: '', person: { id: '3', full_name: '', email: '' }, opportunity: { id: '1', title: '' } },
      ];

      // Page 1: fetch 2 items
      const page1 = paginateNodes(allNodes, 2, null);
      expect(page1.nodes.length).toBe(2);
      expect(page1.pageInfo.has_next_page).toBe(true);
      expect(page1.pageInfo.end_cursor).toBe('1');

      // Page 2: fetch remaining using cursor '1'
      const page2 = paginateNodes(allNodes, 2, '1');
      expect(page2.nodes.length).toBe(1);
      expect(page2.nodes[0].id).toBe('3');
      expect(page2.pageInfo.has_next_page).toBe(false);
    });
  });
});
