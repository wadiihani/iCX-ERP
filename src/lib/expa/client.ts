/**
 * Resilient EXPA GraphQL Fetcher with Exponential Backoff
 * Baseline: REQ-042 and TEST-040
 */

import { ExpaRateLimiter } from './rate-limiter';
import type { ExpaApplicationsQueryResponse, ExpaErrorCode } from './types';

export interface ExpaClientConfig {
  endpoint: string;
  token?: string;
  rateLimiter?: ExpaRateLimiter;
  maxRetries?: number;
  initialBackoffMs?: number;
}

export class ExpaClient {
  private endpoint: string;
  private token?: string;
  private rateLimiter: ExpaRateLimiter;
  private maxRetries: number;
  private initialBackoffMs: number;

  constructor(config: ExpaClientConfig) {
    this.endpoint = config.endpoint;
    this.token = config.token;
    this.rateLimiter = config.rateLimiter || new ExpaRateLimiter(40);
    this.maxRetries = config.maxRetries ?? 3;
    this.initialBackoffMs = config.initialBackoffMs ?? 200;
  }

  /**
   * Classifies an HTTP status or GraphQL error response.
   */
  public classifyError(status: number, errorBody?: string): ExpaErrorCode {
    if (status === 401 || status === 403) return 'AUTH_EXPIRED';
    if (status === 429) return 'RATE_LIMITED';
    if (status >= 500) return 'NETWORK_FAILURE';
    if (errorBody && errorBody.includes('Cannot query field')) return 'SCHEMA_MISMATCH';
    return 'UNKNOWN';
  }

  /**
   * Computes jittered exponential backoff delay in milliseconds.
   */
  public calculateBackoffDelay(attempt: number): number {
    const exponential = this.initialBackoffMs * Math.pow(2, attempt);
    const jitter = Math.random() * 0.3 * exponential; // 0-30% jitter
    return Math.round(exponential + jitter);
  }

  /**
   * Executes a GraphQL query against EXPA with rate-limit acquisition and retry logic.
   */
  public async executeQuery<T = ExpaApplicationsQueryResponse>(
    query: string,
    variables: Record<string, unknown> = {},
    fetchImpl: typeof fetch = fetch
  ): Promise<{ data?: T; error?: { code: ExpaErrorCode; message: string; status?: number } }> {
    // 1. Rate limiter check
    if (!this.rateLimiter.tryAcquire()) {
      const waitMs = this.rateLimiter.getWaitTimeMs();
      return {
        error: {
          code: 'RATE_LIMITED',
          message: `EXPA Rate Limit Throttled (THR-039). Retry permitted in ${waitMs}ms.`,
          status: 429,
        },
      };
    }

    let attempt = 0;
    while (attempt <= this.maxRetries) {
      try {
        const response = await fetchImpl(this.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
          },
          body: JSON.stringify({ query, variables }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          const classified = this.classifyError(response.status, errorText);

          // Retry on 429 or 5xx if retries remain
          if ((response.status === 429 || response.status >= 500) && attempt < this.maxRetries) {
            const delay = this.calculateBackoffDelay(attempt);
            await new Promise((resolve) => setTimeout(resolve, delay));
            attempt++;
            continue;
          }

          return {
            error: {
              code: classified,
              message: `EXPA API Error: HTTP ${response.status} - ${errorText}`,
              status: response.status,
            },
          };
        }

        const json = (await response.json()) as T;
        return { data: json };
      } catch (err: unknown) {
        if (attempt < this.maxRetries) {
          const delay = this.calculateBackoffDelay(attempt);
          await new Promise((resolve) => setTimeout(resolve, delay));
          attempt++;
          continue;
        }

        return {
          error: {
            code: 'NETWORK_FAILURE',
            message: err instanceof Error ? err.message : 'Unknown network failure connecting to EXPA',
          },
        };
      }
    }

    return {
      error: {
        code: 'NETWORK_FAILURE',
        message: `Exceeded maximum retries (${this.maxRetries}) connecting to EXPA.`,
      },
    };
  }
}
