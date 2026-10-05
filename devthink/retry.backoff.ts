/**
 * retry.backoff.ts — the retry discipline of the house: exponential backoff
 * with jitter, a `Retry-After` fast path and a retryable-error classification.
 * The shape is lifted from goose's provider retry (goose-provider-types
 * retry.rs + http_status.rs): max 3 attempts, 1s doubling to a 30s cap, ±20%
 * jitter to avoid the thundering herd, and the server's `Retry-After` hint
 * always wins over the computed delay. Pure TypeScript, node + browser.
 *
 * Consumers: os.gateway.ts wraps its fetch round with `retryWithBackoff`; any
 * other house fetch may do the same. By default unknown errors are NOT
 * retried — only explicitly classified failures are, so a bug never turns
 * into a storm.
 */

/** Retry policy knobs. */
export type RetryConfig = {
  /** Retry attempts AFTER the first try (3 = up to 4 total executions). */
  maxRetries: number;
  /** Delay before the first retry, in milliseconds. */
  initialIntervalMs: number;
  /** Multiplier applied per attempt (exponential). */
  backoffMultiplier: number;
  /** Upper bound for any computed delay, before jitter, in milliseconds. */
  maxIntervalMs: number;
  /** ± ratio applied to the computed delay (0.2 = delay between 80% and 120%). */
  jitterRatio: number;
};

/** goose's defaults: 3 retries, 1s × 2.0 capped at 30s, ±20% jitter. */
export const RETRY_DEFAULTS: RetryConfig = {
  maxRetries: 3,
  initialIntervalMs: 1_000,
  backoffMultiplier: 2,
  maxIntervalMs: 30_000,
  jitterRatio: 0.2,
};

/**
 * RetryableError — a failure that carries its HTTP classification so the
 * retry loop can decide. Status 0 means "no HTTP answer at all" (network
 * failure, connection reset) and is always retryable.
 */
export class RetryableError extends Error {
  constructor(
    message: string,
    /** The HTTP status, or 0 for a transport-level failure. */
    readonly status: number,
    /** Server hint from `Retry-After`, in milliseconds, when advertised. */
    readonly retryAfterMs?: number,
  ) {
    super(message);
    this.name = "RetryableError";
  }
}

/**
 * isAbortError — whether the error came from an aborted fetch/signal.
 *
 * @param err the thrown value.
 */
export function isAbortError(err: unknown): boolean {
  return err instanceof Error && err.name === "AbortError";
}

/**
 * isRetryableStatus — the transient set: transport failure, request timeout
 * (408), too early (425), rate limit (429) and every 5xx. Any other 4xx is a
 * deterministic client error: retrying it can never succeed.
 *
 * @param status the HTTP status, 0 for transport failures.
 */
export function isRetryableStatus(status: number): boolean {
  if (status === 0) return true;
  return status === 408 || status === 425 || status === 429 || (status >= 500 && status <= 599);
}

/**
 * parseRetryAfterMs — the `Retry-After` header per RFC 7231 §7.1.3: either a
 * non-negative integer of seconds or an HTTP-date. A date already in the past
 * answers 0 ("retry now") rather than falling back to backoff — clock skew
 * plus network latency commonly lands a near-now date a second behind.
 *
 * @param value the raw header value (null/undefined when absent).
 * @param now the reference clock, overridable for tests.
 * @param maxDelayMs the clamp applied to the parsed delay (2 minutes default).
 * @returns the delay in milliseconds, or undefined when the header is absent
 *   or unparseable.
 */
export function parseRetryAfterMs(value: string | null | undefined, now = Date.now(), maxDelayMs = 120_000): number | undefined {
  const raw = value?.trim();
  if (!raw) return undefined;
  if (/^\d+$/.test(raw)) return clampDelay(Number.parseInt(raw, 10) * 1_000, maxDelayMs);
  const target = Date.parse(raw);
  if (!Number.isFinite(target)) return undefined;
  return clampDelay(target - now, maxDelayMs);
}

function clampDelay(ms: number, maxDelayMs: number): number {
  return Math.min(Math.max(Math.round(ms), 0), maxDelayMs);
}

/**
 * delayForAttempt — the backoff curve. Attempt 0 answers 0 (the first try
 * runs immediately); attempt n answers `initialIntervalMs × multiplier^(n-1)`
 * capped at `maxIntervalMs`, then jittered ±`jitterRatio`.
 *
 * @param config the retry policy.
 * @param attempt the zero-based attempt number the delay precedes.
 * @returns the delay in milliseconds (never negative).
 */
export function delayForAttempt(config: RetryConfig, attempt: number): number {
  if (attempt <= 0) return 0;
  const base = Math.min(config.initialIntervalMs * config.backoffMultiplier ** (attempt - 1), config.maxIntervalMs);
  const jitter = 1 + (2 * Math.random() - 1) * Math.min(Math.max(config.jitterRatio, 0), 1);
  return Math.max(0, Math.round(base * jitter));
}

/**
 * sleepMs — an abortable timer that works on node and in the browser.
 *
 * @param ms how long to wait.
 * @param signal an optional external abort signal — aborting rejects with the
 *   signal's reason instead of waiting.
 */
export function sleepMs(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason instanceof Error ? signal.reason : new Error("aborted"));
      return;
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(signal?.reason instanceof Error ? signal.reason : new Error("aborted"));
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

export type RetryOptions = {
  /** Partial override over {@link RETRY_DEFAULTS}. */
  config?: Partial<RetryConfig>;
  /** External abort — honored between attempts and during the backoff sleep. */
  signal?: AbortSignal;
  /**
   * Custom verdict: return true to retry the failure, false to rethrow it.
   * When absent, only {@link RetryableError} with a retryable status retries.
   */
  shouldRetry?: (err: unknown, status: number) => boolean;
  /** Progress hook fired before every wait (attempt starts at 1). */
  onRetry?: (info: { attempt: number; delayMs: number; error: unknown }) => void;
};

/**
 * retryWithBackoff — runs `attempt`, retrying classified transient failures
 * with exponential backoff and jitter. When the failure advertises
 * `Retry-After` (via {@link RetryableError.retryAfterMs}) that delay wins over
 * the computed curve. Abort errors always propagate immediately.
 *
 * @typeParam T the attempt result.
 * @param attempt the operation; called again from scratch on every retry.
 * @param opts the optional policy, abort signal, verdict and progress hooks.
 * @returns the first successful result.
 * @throws the last error when retries are exhausted or the failure is not
 *   retryable.
 */
export async function retryWithBackoff<T>(attempt: () => Promise<T>, opts: RetryOptions = {}): Promise<T> {
  const config: RetryConfig = { ...RETRY_DEFAULTS, ...opts.config };
  let lastError: unknown;
  for (let attemptNo = 0; attemptNo <= config.maxRetries; attemptNo++) {
    try {
      return await attempt();
    } catch (err) {
      lastError = err;
      if (isAbortError(err)) throw err;
      const status = err instanceof RetryableError ? err.status : -1;
      const retry = opts.shouldRetry ? opts.shouldRetry(err, status) : err instanceof RetryableError && isRetryableStatus(status);
      if (!retry || attemptNo >= config.maxRetries) throw err;
      const hint = err instanceof RetryableError && err.retryAfterMs !== undefined ? err.retryAfterMs : undefined;
      const delayMs = hint ?? delayForAttempt(config, attemptNo + 1);
      opts.onRetry?.({ attempt: attemptNo + 1, delayMs, error: err });
      await sleepMs(delayMs, opts.signal);
    }
  }
  throw lastError;
}
