/**
 * @file core.ts — generic pure utilities shared by every domain module.
 *
 * Third-person observer view — library-first, root-first, production-ready.
 *
 * v2.1.15 Phase A consolidation: this module is now a TRUE leaf of the
 * dependency DAG (imports only constants.js below it plus node:* builtins).
 * Every legacy compact duplicate that used to live here — the short-named
 * request builders (transformRequest, buildAntigravity, buildGeminiCLI,
 * fetchCascade), the SSE transformers (parseSSEChunk, normalizePayloads,
 * transformToOpenAI, transformToAnthropic), the model classifiers (isCLIOnly,
 * isImageModel, resolveModelId, parseVariant, BUDGET_MAP, mapBudget,
 * endpointsForModel), the identity helpers (ua, apiClient, fingerprint), the
 * schema cleaner (cleanSchema, ALLOWED), the header stripper (FORBIDDEN,
 * stripForbidden), the id generators (genId, sessId, upId), sanitizeToolName,
 * normalizeRole, TOOL_REGEX and withAutoRecovery — was a dead duplicate of the
 * canonical implementation in its domain owner and was deleted.
 *
 * v2.1.15 Phase B consolidation: this module absorbed the generic utility
 * families that used to be duplicated across the tree — fnv1a64 (fingerprint
 * hex-string lineage + the request bigint lineage, now accurately split into
 * fnv1a64 / fnv1a64Bytes), getJitter (constants, plugin), getJitterMs
 * (fingerprint, models), pickRandom (constants, fingerprint), isRetryable
 * (auth, plugin, project), isRetryableStatus (models, request, search) and
 * fetchWithTimeout (models, plugin, project, quota, search, version, auth's
 * fetchTimeout). Every other module imports these from core.js.
 */
import { randomInt } from "node:crypto";
import { FETCH_TIMEOUT_MS, JITTER_MAX_MS, JITTER_MIN_MS } from "./constants.js";

/**
 * FNV-1a 32-bit hash over a UTF-16 string (per code unit), unsigned.
 * Canonical implementation of the fnv1a32 family — every other module
 * imports this instead of redefining it.
 */
export const fnv1a32 = (s: string): number => {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
};

/**
 * Hex form of {@link fnv1a32}, zero-padded to 8 characters.
 */
export const fnv1a32Hex = (s: string): string => fnv1a32(s).toString(16).padStart(8, "0");

/**
 * FNV-1a 64-bit hash over UTF-16 code units, returned as a 16-char
 * zero-padded lowercase hex string (fingerprint lineage — canonical of the
 * fnv1a64 family). Uses the FNV-1a 64 offset basis 14695981039346656037 and
 * prime 1099511628211 as inline literals; the 32-bit FNV constants live in
 * constants.ts but the 64-bit pair is only used here, so it stays local and
 * documented rather than imported.
 */
export function fnv1a64(input: string): string {
  let hash = 14695981039346656037n;
  const prime = 1099511628211n;
  for (let i = 0; i < input.length; i++) {
    hash ^= BigInt(input.charCodeAt(i));
    hash = (hash * prime) & 0xffffffffffffffffn;
  }
  return hash.toString(16).padStart(16, "0");
}

/**
 * FNV-1a 64-bit hash over UTF-8 BYTES, returned as a bigint (request.ts
 * lineage — the long deterministic-id digest). Distinct from
 * {@link fnv1a64}: this variant hashes bytes (Buffer.from(input, "utf8"))
 * instead of UTF-16 code units, so the two produce different digests for
 * non-ASCII input and different return types; the accurate split keeps both
 * historical behaviors available under honest names.
 */
export function fnv1a64Bytes(input: string): bigint {
  let hash = 14695981039346656037n;
  const prime = 1099511628211n;
  const buf = Buffer.from(input, "utf8");
  for (let i = 0; i < buf.length; i++) {
    hash ^= BigInt(buf[i]!);
    hash = (hash * prime) & 0xffffffffffffffffn;
  }
  return hash;
}

/**
 * Uniform jitter in [JITTER_MIN_MS, JITTER_MAX_MS] (0-80 ms) for cascade
 * backoff randomization. Prefers the crypto-strong randomInt and falls back
 * to Math.random. Same value distribution as {@link getJitter}.
 */
export const jitter = (): number => {
  try {
    return randomInt(JITTER_MIN_MS, JITTER_MAX_MS + 1);
  } catch {
    return Math.floor(Math.random() * (JITTER_MAX_MS - JITTER_MIN_MS + 1)) + JITTER_MIN_MS;
  }
};

/**
 * Jitter draw in [JITTER_MIN_MS, JITTER_MAX_MS] (0-80 ms) — the historical
 * getJitter name used by the cascade/retry loops. Identical distribution to
 * {@link jitter}; both names are kept because both are published.
 */
export function getJitter(): number {
  return jitter();
}

/**
 * Bounded jitter value in the inclusive [minMs, maxMs] range (defaults
 * 0-80 ms). Crypto-strong randomInt with a Math.random fallback; used for
 * Retry-After throttling and anti-rate-limit delays.
 */
export function getJitterMs(minMs = 0, maxMs = 80): number {
  try {
    return randomInt(minMs, maxMs + 1);
  } catch {
    return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  }
}

/**
 * Picks a uniformly random element from a readonly pool. Crypto-strong
 * randomInt with a Math.random fallback (canonical of the pickRandom family;
 * the former constants.ts Math.random variant and the fingerprint.ts
 * secureRandom variant merge here — same distribution, stronger draw).
 */
export function pickRandom<T>(pool: readonly T[]): T {
  try {
    return pool[randomInt(0, pool.length)]!;
  } catch {
    return pool[Math.floor(Math.random() * pool.length)]!;
  }
}

/**
 * Retry classification for the auth/project-discovery flows:
 * 403, 404, 408, 429 and every 5xx are retryable. Canonical of the
 * isRetryable family (auth.ts and project.ts lineages; the plugin.ts
 * 3-condition variant had zero callers and was dropped).
 */
export function isRetryable(status: number): boolean {
  return status === 403 || status === 404 || status === 408 || status === 429 || status >= 500;
}

/**
 * Retry classification for the endpoint-cascade flows: 403 (project IAM
 * mismatch), 404 (rollout), 429 (rate limit) and the whole 5xx range.
 * Canonical of the isRetryableStatus family — the live-validated request.ts
 * cascade variant (408 is intentionally NOT retryable here; streaming.ts
 * keeps its own list-driven transient variant under an accurate name).
 */
export function isRetryableStatus(status: number): boolean {
  if (!Number.isFinite(status)) return false;
  return status === 429 || status === 403 || status === 404 || (status >= 500 && status <= 599);
}

/**
 * Fetch with an abort-controller timeout and external-signal merge. Canonical
 * of the fetchWithTimeout family (supersedes the auth.ts fetchTimeout alias:
 * same positional signature and same 10s default). Behavior notes:
 * - timeout default FETCH_TIMEOUT_MS (10s); pass the third argument to
 *   override (quota callers pass QUOTA_TIMEOUT_MS, version callers the 5s
 *   VERSION_FETCH_TIMEOUT_MS);
 * - an init.signal is merged with the timer: either aborting aborts the
 *   fetch (an already-aborted external signal aborts immediately);
 * - a `timeoutMs` property inside init (the models.ts lineage call style)
 *   takes precedence over the positional default;
 * - AbortError propagates unwrapped — consumers that historically mapped it
 *   to a domain error (ProjectDiscoveryError 408 in project.ts, the plain
 *   timeout Errors in plugin/quota) wrap THIS call at their call sites.
 */
export async function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
  timeoutMs: number = FETCH_TIMEOUT_MS,
): Promise<Response> {
  const timeout = (init as RequestInit & { timeoutMs?: number }).timeoutMs ?? timeoutMs;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  const external = init.signal as AbortSignal | undefined | null;
  if (external) {
    if (external.aborted) controller.abort();
    else external.addEventListener("abort", () => controller.abort(), { once: true });
  }

  try {
    const { timeoutMs: _t, signal: _s, ...rest } = init as Record<string, unknown>;
    return await fetch(url, { ...rest, signal: controller.signal } as RequestInit);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * LRU map with O(1) re-insertion refresh; evicts the least-recently-used
 * entry once the capacity is exceeded.
 */
class LRU<K, V> extends Map<K, V> {
  constructor(private max = 100) {
    super();
  }

  override set(k: K, v: V) {
    if (this.has(k)) this.delete(k);
    super.set(k, v);
    if (this.size > this.max) {
      const first = this.keys().next().value;
      if (first !== undefined) this.delete(first);
    }
    return this;
  }
}

/**
 * Shared LRU(100) cache keyed by session/model for thinking signatures.
 * The single shared instance consumed by streaming.ts.
 */
export const thinkingCache = new LRU<string, string>(100);
