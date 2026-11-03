/**
 * streamfallback.ts — the model fallback of the streaming routes (root layer).
 *
 * the error catalog the gateway matches every upstream failure against and the
 * fallback runner that walks the route chain when one model dies. The verdict
 * vocabulary follows the declarative chains of omniroute (priority order,
 * already-tried routes excluded) and stays local to this file; the retry curve
 * is the house retry.backoff discipline the request queue family owns,
 * consumed through the published @wenathlan/devthink/queue export — the
 * doubling curve, the ±20% jitter, the abortable sleep and the Retry-After
 * parsing answer from the owner (the manifest debt of the ownership law is
 * paid; the local backoff copy retired). Wire: the streaming routes (the
 * PARSERSTEPS pattern of gateway.ts) wrap their upstream call with
 * `runwithfallback`; failures land on the ApiKeyRow counters of db.ts through
 * `applyerrortokey` and the trail feeds the chat log rows.
 */

import { delayForAttempt, parseRetryAfterMs, sleepMs, type RetryConfig } from "@wenathlan/devthink/queue";
import type { ApiKeyRow } from "./db.ts";

/** the error catalog of the house: every upstream failure answers exactly one code. */
export type StreamErrorCode =
  | "transport"
  | "timeout"
  | "unauthorized"
  | "forbidden"
  | "notfound"
  | "gone"
  | "unprocessable"
  | "ratelimited"
  | "overloaded"
  | "server"
  | "unknown";

/** what the runner does with a classified failure. */
export type FallbackVerdict = "retry" | "fallback" | "abort";

/** one classified upstream failure (throw it from the attempt callback). */
export class StreamError extends Error {
  /** the http status, or 0 for a transport-level failure */
  status: number;
  /** the catalog code the failure classified to */
  code: StreamErrorCode;
  /** server hint from `Retry-After`, in ms, when advertised */
  retryAfterMs?: number;

  constructor(message: string, status: number, code: StreamErrorCode, retryAfterMs?: number) {
    super(message);
    this.name = "StreamError";
    this.status = status;
    this.code = code;
    this.retryAfterMs = retryAfterMs;
  }
}

/** thrown when every route of the chain is exhausted; carries the full trail. */
export class StreamFallbackError extends StreamError {
  /** every try the runner made, in order */
  trail: FallbackStep[];

  constructor(message: string, status: number, code: StreamErrorCode, trail: FallbackStep[]) {
    super(message, status, code);
    this.name = "StreamFallbackError";
    this.trail = trail;
  }
}

/** one recorded try of the runner (the traceability the chat log renders). */
export type FallbackStep = {
  routeId: string;
  /** the 1-based attempt within the route */
  attempt: number;
  /** the http status (0 for transport failures) */
  status: number;
  /** the catalog code, or null when the try answered */
  code: StreamErrorCode | null;
  /** the backoff waited before the next try (0 on success and exhaustion) */
  delayMs: number;
};

/** one route of the fallback chain (the minimal shape the runner needs). */
export type FallbackRoute = {
  id: string;
  /** lower walks first in the chain */
  priority: number;
  enabled: boolean;
};

/** the runner knobs. */
export type FallbackOptions = {
  /** retries of the SAME route for retry-verdict failures (default 1) */
  retriesPerRoute: number;
  /** the first backoff delay in ms (default 250) */
  initialDelayMs: number;
  /** the backoff ceiling in ms (default 4000) */
  maxDelayMs: number;
  /** ± ratio applied to the computed delay (default 0.2) */
  jitterRatio: number;
  /** progress hook fired after every try */
  onstep?: (step: FallbackStep) => void;
};

/**
 * the house knobs for the streaming routes: the timing values the runner hands
 * to the queue family's backoff curve — 250ms initial doubling (×2), capped at
 * 4s, ±20% jitter — the discipline itself lives in @wenathlan/devthink/queue.
 */
export const FALLBACKDEFAULTS: FallbackOptions = {
  retriesPerRoute: 1,
  initialDelayMs: 250,
  maxDelayMs: 4000,
  jitterRatio: 0.2,
};

/**
 * classifystatus — the catalog: 0 transport, 408/404-timeout semantics via
 * timeout, 401 unauthorized, 403 forbidden, 404 notfound, 410 gone, 422
 * unprocessable, 429 ratelimited, 529 overloaded, other 5xx server, the rest
 * unknown.
 *
 * @param status the http status, 0 for transport failures.
 * @returns the catalog code.
 */
export function classifystatus(status: number): StreamErrorCode {
  if (status === 0) return "transport";
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "notfound";
  if (status === 408) return "timeout";
  if (status === 410) return "gone";
  if (status === 422) return "unprocessable";
  if (status === 429) return "ratelimited";
  if (status === 529) return "overloaded";
  if (status >= 500 && status <= 599) return "server";
  return "unknown";
}

/**
 * verdictfor — what the runner does per catalog code. timeout, transport and
 * server failures retry the same route first (transient); unauthorized,
 * forbidden, notfound, gone, unprocessable, ratelimited and overloaded fall
 * back to the next route (retrying can never succeed on the same model);
 * unknown failures abort the chain (a bug must not turn into a storm).
 *
 * @param code the catalog code.
 * @returns the verdict.
 */
export function verdictfor(code: StreamErrorCode): FallbackVerdict {
  if (code === "timeout" || code === "transport" || code === "server") return "retry";
  if (code === "unknown") return "abort";
  return "fallback";
}

/**
 * errorfromresponse — builds the classified failure from a fetch `Response`,
 * reading the `Retry-After` hint into the error so the runner honors it over
 * the computed backoff (the hint parsing is the queue family's
 * `parseRetryAfterMs`, clamped to the house cap). Non-StreamError throws
 * inside the attempt callback classify as `unknown` and abort the chain (a bug
 * must not turn into a storm).
 *
 * @param response the failed fetch response (consumed or not, body untouched).
 * @param now the reference clock for http-date hints (defaults to the real clock).
 * @param maxDelayMs the clamp applied to the parsed hint (defaults to the house cap).
 * @returns the StreamError to throw from the attempt callback.
 */
export function errorfromresponse(
  response: Response,
  now = Date.now(),
  maxDelayMs = FALLBACKDEFAULTS.maxDelayMs,
): StreamError {
  const code = classifystatus(response.status);
  return new StreamError(
    `upstream answered ${response.status}`,
    response.status,
    code,
    parseRetryAfterMs(response.headers.get("retry-after"), now, maxDelayMs),
  );
}

/**
 * retryconfigof — translates the runner knobs into the owner's retry policy:
 * the queue family's `delayForAttempt` curve reads a {@link RetryConfig}, and
 * the gateway knobs map onto it one to one — `initialDelayMs` rides
 * `initialIntervalMs`, `maxDelayMs` rides `maxIntervalMs`, `jitterRatio`
 * rides verbatim, and the doubling the retired local copy hardcoded rides as
 * `backoffMultiplier` 2 (the same curve, owned by the queue family). The
 * `retriesPerRoute` budget rides `maxRetries` so the translation stays one
 * honest policy object.
 *
 * @param options the runner knobs (the merged {@link FALLBACKDEFAULTS}).
 * @returns the owner's retry policy for the same curve.
 */
function retryconfigof(options: FallbackOptions): RetryConfig {
  return {
    maxRetries: options.retriesPerRoute,
    initialIntervalMs: options.initialDelayMs,
    backoffMultiplier: 2,
    maxIntervalMs: options.maxDelayMs,
    jitterRatio: options.jitterRatio,
  };
}

/**
 * orders the chain the way the runner walks it: enabled routes only, priority
 * ascending, stable within ties (the omniroute registration discipline).
 *
 * @param routes the registered chain.
 * @returns the ordered routes.
 */
export function orderchain(routes: readonly FallbackRoute[]): FallbackRoute[] {
  return routes
    .filter((route) => route.enabled)
    .map((route, index) => ({ route, index }))
    .sort((left, right) => left.route.priority - right.route.priority || left.index - right.index)
    .map((entry) => entry.route);
}

/**
 * runwithfallback — runs `attempt(route)` over the chain: retry-verdict
 * failures retry the same route up to `retriesPerRoute`, fallback-verdict
 * failures move to the next route, abort-verdict failures stop the chain.
 * The `Retry-After` hint of a thrown StreamError wins over the computed
 * backoff, and the computed backoff itself is the queue family's
 * `delayForAttempt` curve over the runner knobs (the discipline answers from
 * @wenathlan/devthink/queue, never from a local copy). Answers the first
 * success; throws the last failure (a StreamFallbackError carrying the full
 * trail) when the chain is exhausted.
 *
 * @typeParam T the attempt result.
 * @param routes the registered chain (any order; {@link orderchain} sorts).
 * @param attempt the operation for one route; called again from scratch per try.
 * @param opts the optional knobs and progress hook.
 * @returns the first successful result.
 */
export async function runwithfallback<T>(
  routes: readonly FallbackRoute[],
  attempt: (route: FallbackRoute) => Promise<T>,
  opts: Partial<FallbackOptions> = {},
): Promise<T> {
  const options: FallbackOptions = { ...FALLBACKDEFAULTS, ...opts };
  const chain = orderchain(routes);
  const trail: FallbackStep[] = [];
  for (const route of chain) {
    for (let attemptNo = 1; attemptNo <= options.retriesPerRoute + 1; attemptNo++) {
      try {
        const value = await attempt(route);
        trail.push({ routeId: route.id, attempt: attemptNo, status: 0, code: null, delayMs: 0 });
        options.onstep?.(trail[trail.length - 1]);
        return value;
      } catch (error) {
        const streamError = error instanceof StreamError ? error : new StreamError(String(error), 0, "unknown");
        const code = streamError.code;
        const verdict = verdictfor(code);
        const hint = streamError.retryAfterMs;
        const delayMs =
          verdict === "fallback" || attemptNo > options.retriesPerRoute
            ? 0
            : (hint ?? delayForAttempt(retryconfigof(options), attemptNo));
        trail.push({ routeId: route.id, attempt: attemptNo, status: streamError.status, code, delayMs });
        options.onstep?.(trail[trail.length - 1]);
        if (verdict === "abort") throw new StreamFallbackError(streamError.message, streamError.status, code, trail);
        if (verdict === "fallback" || attemptNo > options.retriesPerRoute) break;
        await sleepMs(delayMs);
      }
    }
  }
  const last = trail[trail.length - 1];
  const code = last?.code ?? "unknown";
  throw new StreamFallbackError(
    `streamfallback: every route failed (${trail.length} tries)`,
    last?.status ?? 0,
    code,
    trail,
  );
}

/**
 * applyerrortokey — lands one upstream failure on the key row of db.ts: the
 * error count goes up and a 429 flips the rate-limit flag. Revocation stays
 * the operator's call; the runner never retires a key on its own.
 *
 * @param key the key row the failure hit.
 * @param status the http status of the failure.
 * @returns the updated row (a new object — the input row is never mutated).
 */
export function applyerrortokey(key: ApiKeyRow, status: number): ApiKeyRow {
  return { ...key, errorCount: key.errorCount + 1, rateLimitHit: status === 429 ? true : key.rateLimitHit };
}
