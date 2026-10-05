import { describe, expect, it } from "vitest";
import {
  delayForAttempt,
  isAbortError,
  isRetryableStatus,
  parseRetryAfterMs,
  RetryableError,
  retryWithBackoff,
  RETRY_DEFAULTS,
  sleepMs,
} from "../retry.backoff.js";

const noJitter: typeof RETRY_DEFAULTS = { ...RETRY_DEFAULTS, jitterRatio: 0, initialIntervalMs: 1_000 };

describe("retry.backoff classification", () => {
  it("retries transport failures, 408/425/429 and 5xx; never other 4xx", () => {
    expect(isRetryableStatus(0)).toBe(true);
    expect(isRetryableStatus(408)).toBe(true);
    expect(isRetryableStatus(425)).toBe(true);
    expect(isRetryableStatus(429)).toBe(true);
    expect(isRetryableStatus(500)).toBe(true);
    expect(isRetryableStatus(503)).toBe(true);
    expect(isRetryableStatus(400)).toBe(false);
    expect(isRetryableStatus(404)).toBe(false);
  });

  it("detects abort errors", () => {
    const err = new Error("aborted");
    err.name = "AbortError";
    expect(isAbortError(err)).toBe(true);
    expect(isAbortError(new Error("boom"))).toBe(false);
    expect(isAbortError("abort")).toBe(false);
  });
});

describe("retry.backoff Retry-After parsing", () => {
  const now = Date.parse("2026-10-05T12:00:00Z");

  it("parses delay-seconds", () => {
    expect(parseRetryAfterMs("2", now)).toBe(2_000);
    expect(parseRetryAfterMs("0", now)).toBe(0);
  });

  it("parses an HTTP-date and honors a past date as retry-now", () => {
    const future = parseRetryAfterMs("Sun, 05 Oct 2026 12:00:30 GMT", now);
    expect(future).toBe(30_000);
    expect(parseRetryAfterMs("Sun, 05 Oct 2026 11:59:00 GMT", now)).toBe(0);
  });

  it("answers undefined for absent or unparseable values and clamps absurd hints", () => {
    expect(parseRetryAfterMs(null, now)).toBeUndefined();
    expect(parseRetryAfterMs(undefined, now)).toBeUndefined();
    expect(parseRetryAfterMs("soon", now)).toBeUndefined();
    expect(parseRetryAfterMs("1000", now, 120_000)).toBe(120_000);
  });
});

describe("retry.backoff exponential curve", () => {
  it("runs attempt 0 immediately and doubles from the initial interval", () => {
    const config = { ...noJitter, maxIntervalMs: 60_000 };
    expect(delayForAttempt(config, 0)).toBe(0);
    expect(delayForAttempt(config, 1)).toBe(1_000);
    expect(delayForAttempt(config, 2)).toBe(2_000);
    expect(delayForAttempt(config, 3)).toBe(4_000);
  });

  it("caps the computed delay before jitter", () => {
    const config = { ...noJitter, maxIntervalMs: 30_000 };
    expect(delayForAttempt(config, 7)).toBe(30_000);
  });

  it("jitters within ±jitterRatio", () => {
    const config = { ...noJitter, jitterRatio: 0.2 };
    for (let i = 0; i < 50; i++) {
      const delay = delayForAttempt(config, 2);
      expect(delay).toBeGreaterThanOrEqual(1_600);
      expect(delay).toBeLessThanOrEqual(2_400);
    }
  });
});

describe("retry.backoff retryWithBackoff", () => {
  it("resolves on the first success without retrying", async () => {
    let calls = 0;
    const result = await retryWithBackoff(async () => {
      calls++;
      return "ok";
    });
    expect(result).toBe("ok");
    expect(calls).toBe(1);
  });

  it("retries a transient 500 and recovers", async () => {
    let calls = 0;
    const result = await retryWithBackoff(
      async () => {
        calls++;
        if (calls < 3) throw new RetryableError("gateway 500", 500);
        return "recovered";
      },
      { config: { maxRetries: 3, initialIntervalMs: 1 } },
    );
    expect(result).toBe("recovered");
    expect(calls).toBe(3);
  });

  it("never retries a deterministic 400", async () => {
    let calls = 0;
    await expect(
      retryWithBackoff(
        async () => {
          calls++;
          throw new RetryableError("gateway 400 — model not found", 400);
        },
        { config: { maxRetries: 5, initialIntervalMs: 1 } },
      ),
    ).rejects.toThrow("gateway 400");
    expect(calls).toBe(1);
  });

  it("respects Retry-After over the computed backoff curve", async () => {
    const seen: number[] = [];
    await expect(
      retryWithBackoff(
        async () => {
          throw new RetryableError("gateway 429", 429, 5);
        },
        { config: { maxRetries: 1, initialIntervalMs: 10_000 }, onRetry: (info) => seen.push(info.delayMs) },
      ),
    ).rejects.toThrow("gateway 429");
    expect(seen).toEqual([5]); // the server hint wins over the 10s curve
  });

  it("gives up after maxRetries attempts with the last error", async () => {
    let calls = 0;
    await expect(
      retryWithBackoff(
        async () => {
          calls++;
          throw new RetryableError(`still failing on ${calls}`, 503);
        },
        { config: { maxRetries: 2, initialIntervalMs: 1 } },
      ),
    ).rejects.toThrow("still failing on 3");
    expect(calls).toBe(3);
  });

  it("rethrows unknown errors untouched (a bug never becomes a storm)", async () => {
    let calls = 0;
    await expect(
      retryWithBackoff(async () => {
        calls++;
        throw new Error("programmer mistake");
      }),
    ).rejects.toThrow("programmer mistake");
    expect(calls).toBe(1);
  });

  it("honors a shouldRetry verdict for unknown errors", async () => {
    let calls = 0;
    const result = await retryWithBackoff(
      async () => {
        calls++;
        if (calls < 2) throw new Error("flaky transport");
        return "ok";
      },
      { config: { initialIntervalMs: 1 }, shouldRetry: () => true },
    );
    expect(result).toBe("ok");
    expect(calls).toBe(2);
  });

  it("aborts during the backoff sleep", async () => {
    const signal = new AbortController();
    const pending = retryWithBackoff(
      async () => {
        throw new RetryableError("gateway 503", 503);
      },
      { config: { maxRetries: 3, initialIntervalMs: 60_000 }, signal: signal.signal },
    );
    signal.abort();
    await expect(pending).rejects.toThrow();
  });
});

describe("retry.backoff sleepMs", () => {
  it("resolves after the wait and rejects early on abort", async () => {
    const started = Date.now();
    await sleepMs(5);
    expect(Date.now() - started).toBeGreaterThanOrEqual(4);
    const signal = new AbortController();
    const pending = sleepMs(60_000, signal.signal);
    signal.abort();
    await expect(pending).rejects.toThrow();
  });
});
