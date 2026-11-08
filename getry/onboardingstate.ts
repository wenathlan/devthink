/**
 * onboardingstate.ts — the ONE writer of the visitor's first-run flags, the
 * state of the entry-flow contract (intro → onboarding → the platform). The
 * state is { introseen, onboardingseen } and it is catalogued, not just
 * browser: the accessor consults the platform database over GET
 * /api/v1/onboarding and writes it over POST /api/v1/onboarding, both HTTPS
 * only — the base url arrives through VITE_ONBOARDING_URL and every
 * candidate host is validated first (localhost, loopback, private,
 * link-local, CGNAT and the reserved documentation ranges are refused, so
 * the flags never ride a dev or internal endpoint; mapped IPv6 literals are
 * normalized back to their embedded IPv4 before the public check). The
 * localStorage key getry.onboarding.seen is purely the offline cache of the
 * database (the DB is the source of truth; the cache avoids replaying the
 * flow offline) and module memory covers client-side re-navigation. Reads
 * reconcile with a seen-wins merge — a stage seen anywhere stays seen, the
 * flow is never forced twice. The page anchors never touch the flags
 * directly: the intro marks introseen, the onboarding marks onboardingseen,
 * the home entry gate only reads. The host gate (hostallowed) and the stage
 * merge (mergeStage) answer from the owner engine seat of the vault storage
 * lane module (@wenathlan/vault/onboardingstore — the wave 14 consolidation
 * the six family seats ride) under the strict law this app's battery pins
 * (the mapped ipv6 normalization, the flow order that lets the later stage
 * imply the earlier), re-exported here under the plain names its pages,
 * lanes and tests already cite; the cache key, the visitor seat, the
 * platform read and write and the accessors stay this app's own stateful
 * glue.
 */

/* the engine the entry flow rides answers from the owner seat — the vault
 * storage lane module owns the host gate and the stage merge once for the
 * family (the wave 14 onboarding consolidation, the audit ranking four);
 * this app module keeps only its stateful glue (the getry cache mirror,
 * the per-browser visitor, the platform read and write, the accessors) and
 * re-exports the strict engine under the plain names its importers already
 * cite — the names answer byte-identical, the law they enforce never
 * moved. */
import { hostallowedstrict as hostallowed, mergeStageordered as mergeStage } from "@wenathlan/vault/onboardingstore";

export { hostallowed, mergeStage };

/** the visitor state the entry flow consults (the two gates of the app). */
export type VisitorOnboarding = {
  /** the animated intro was seen — the splash never replays */
  introseen: boolean;
  /** the first-run onboarding was seen (finish or skip) — never forced again */
  onboardingseen: boolean;
};

/** the stages one call can mark seen. */
export type OnboardingStage = "intro" | "onboarding";

/** the localStorage cache key (the DB mirror, never the source of truth). */
const CACHE_KEY = "getry.onboarding.seen";

/** the localStorage key of the stable per-browser visitor id. */
const VISITOR_KEY = "getry.visitor.id";

/** the configured platform base (HTTPS self-hosted gateway); empty answers cache-only. */
const BASE =
  (typeof import.meta !== "undefined" ? (import.meta.env?.VITE_ONBOARDING_URL as string | undefined) : undefined)
    ?.trim()
    .replace(/\/+$/, "") ?? "";

/** the platform route the accessor rides (the gateway serves /api/v1/*). */
const API_PATH = "/api/v1/onboarding";

/** the abort window of the platform read (ms) — the flow never blocks on a slow gateway. */
const READ_TIMEOUT_MS = 2500;

/** module memory: the flags of the session, consulted before any i/o. */
let memory: VisitorOnboarding | null = null;

/** Reads the localStorage cache; any corruption answers null (the cache is best effort). */
function readCache(): VisitorOnboarding | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<VisitorOnboarding>;
    return { introseen: parsed.introseen === true, onboardingseen: parsed.onboardingseen === true };
  } catch {
    return null;
  }
}

/** Mirrors the flags into the localStorage cache (silently skipped when storage is sealed). */
function writeCache(state: VisitorOnboarding): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(state));
  } catch {
    // the cache is best effort: the DB and the memory stay authoritative
  }
}

/**
 * The stable per-browser visitor id (generated once, cached beside the
 * flags); storage unavailable answers the shared web key.
 *
 * @returns the visitor string the gateway rows are keyed by.
 */
function visitor(): string {
  if (typeof window === "undefined") return "web";
  try {
    const existing = window.localStorage.getItem(VISITOR_KEY);
    if (existing) return existing;
    const fresh = crypto.randomUUID();
    window.localStorage.setItem(VISITOR_KEY, fresh);
    return fresh;
  } catch {
    return "web";
  }
}

/** Reads the flags off the platform database; unreachable or unconfigured answers null. */
async function readRemote(): Promise<VisitorOnboarding | null> {
  if (!BASE || !hostallowed(BASE) || typeof fetch === "undefined") return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), READ_TIMEOUT_MS);
  try {
    const response = await fetch(`${BASE}${API_PATH}?visitor=${encodeURIComponent(visitor())}`, {
      headers: { accept: "application/json" },
      signal: controller.signal,
    });
    if (!response.ok) return null;
    const answer = (await response.json()) as Partial<VisitorOnboarding>;
    return { introseen: answer.introseen === true, onboardingseen: answer.onboardingseen === true };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Writes the flags to the platform database over POST; failures leave the cache holding them. */
async function writeRemote(state: VisitorOnboarding): Promise<void> {
  if (!BASE || !hostallowed(BASE) || typeof fetch === "undefined") return;
  try {
    await fetch(`${BASE}${API_PATH}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ visitor: visitor(), ...state }),
    });
  } catch {
    // the cache mirrors the flags until the platform answers again
  }
}

/**
 * Synchronous read of the known state: module memory first, then the
 * localStorage cache. The entry gate uses this for the flash-free fast
 * path; null means the state is still unknown and the caller must await
 * loadOnboardingState.
 *
 * @returns the known flags, or null when nothing is known yet.
 */
export function readOnboardingState(): VisitorOnboarding | null {
  if (memory) return memory;
  const cached = readCache();
  if (cached) {
    memory = cached;
    return cached;
  }
  return null;
}

/**
 * Full resolve of the flags: memory/cache first, then the platform database
 * over GET /api/v1/onboarding — reconciled with the seen-wins merge so a
 * stage seen anywhere stays seen. The session answer is memoized;
 * re-navigation never refetches.
 *
 * @returns the resolved visitor onboarding flags.
 */
export async function loadOnboardingState(): Promise<VisitorOnboarding> {
  const local = readOnboardingState() ?? { introseen: false, onboardingseen: false };
  if (!BASE || !hostallowed(BASE) || (local.introseen && local.onboardingseen)) return local;
  const remote = await readRemote();
  if (!remote) return local;
  const merged: VisitorOnboarding = {
    introseen: local.introseen || remote.introseen,
    onboardingseen: local.onboardingseen || remote.onboardingseen,
  };
  memory = merged;
  writeCache(merged);
  return merged;
}

/**
 * Marks the intro stage seen and persists it everywhere: module memory, the
 * localStorage cache and — when a platform base is configured — the
 * database over POST /api/v1/onboarding. The ONLY writer of the intro flag.
 */
export function markIntroSeen(): void {
  memory = mergeStage(memory ?? readCache() ?? { introseen: false, onboardingseen: false }, "intro");
  writeCache(memory);
  void writeRemote(memory);
}

/**
 * Marks the onboarding stage seen (finish or skip — both imply the intro)
 * and persists it everywhere. The ONLY writer of the onboarding flag.
 */
export function markOnboardingSeen(): void {
  memory = mergeStage(memory ?? readCache() ?? { introseen: false, onboardingseen: false }, "onboarding");
  writeCache(memory);
  void writeRemote(memory);
}

/** Test seam: clears the module memory (the cache and the platform are untouched). */
export function resetOnboardingMemory(): void {
  memory = null;
}
