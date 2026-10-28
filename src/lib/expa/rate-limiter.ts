/**
 * Token Bucket Rate Limiter for EXPA API
 * Baseline: THR-039 (Max 40 requests/minute)
 */

export class ExpaRateLimiter {
  private capacity: number;
  private tokens: number;
  private refillRatePerMs: number;
  private lastRefillTimestamp: number;

  /**
   * @param maxRequestsPerMinute - Maximum allowed requests per 60 seconds (default: 40 per THR-039)
   * @param initialTimestamp - Optional starting epoch timestamp for simulation
   */
  constructor(maxRequestsPerMinute: number = 40, initialTimestamp: number = Date.now()) {
    this.capacity = maxRequestsPerMinute;
    this.tokens = maxRequestsPerMinute;
    this.refillRatePerMs = maxRequestsPerMinute / 60000;
    this.lastRefillTimestamp = initialTimestamp;
  }

  /**
   * Refills available tokens based on elapsed time.
   */
  private refill(now: number = Date.now()): void {
    const elapsed = Math.max(0, now - this.lastRefillTimestamp);
    const tokensToAdd = elapsed * this.refillRatePerMs;
    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefillTimestamp = Math.max(now, this.lastRefillTimestamp);
  }

  /**
   * Checks if a request can be executed immediately.
   */
  public canAcquire(): boolean {
    this.refill();
    return this.tokens >= 1;
  }

  /**
   * Attempts to consume 1 token. Returns true if acquired, false if rate limited.
   */
  public tryAcquire(now: number = Date.now()): boolean {
    this.refill(now);
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true;
    }
    return false;
  }

  /**
   * Computes millisecond delay needed before the next token becomes available.
   */
  public getWaitTimeMs(now: number = Date.now()): number {
    this.refill(now);
    if (this.tokens >= 1) return 0;
    const needed = 1 - this.tokens;
    return Math.ceil(needed / this.refillRatePerMs);
  }

  /**
   * Returns current token count.
   */
  public getAvailableTokens(): number {
    this.refill();
    return this.tokens;
  }
}
