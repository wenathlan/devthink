/**
 * onboardingstate.ts — the ONE writer of the visitor's seen flags, the state
 * of the entry-flow contract (intro → onboarding → the platform). The state
 * is { introseen, onboardingseen } and it is catalogued, not just browser:
 * the accessor consults the platform database over GET /api/v1/onboarding and
 * writes it over POST /api/v1/onboarding, both HTTPS only — the base url
 * arrives through VITE_ONBOARDING_URL and every candidate host is validated
 * first (localhost, loopback, private, link-local, CGNAT and reserved ranges
 * are refused, mapped IPv6 literals are normalized back to their IPv4 form
 * before the check, so the flags never ride a dev or internal endpoint). The
 * localStorage key vault.onboarding.seen is purely the offline cache of the
 * database (the DB is the source of truth; the cache avoids replaying the
 * flow while offline) and module memory covers the client-side
 * re-navigation between the gates. Reads reconcile with a seen-wins merge —
 * a stage seen anywhere stays seen, the flow is never forced twice. The page
 * anchors never touch the flags directly: the intro marks introseen, the
 * onboarding marks onboardingseen, the home entry gate only reads. The host
 * gate (hostallowed) and the stage merge (mergeStage) answer from the owner
 * engine seat of the storage lane module (onboardingstore.ts — the wave 14
 * consolidation the six family seats ride) and are re-exported here so the
 * published ./onboardingstate subpath keeps its surface whole.
 */

/* the engine the entry flow rides answers from the owner seat — the vault
 * storage lane module owns the host gate and the stage merge once for the
 * family (the wave 14 onboarding consolidation, the audit ranking four);
 * this app module keeps only its stateful glue (the cache mirror, the
 * platform read and write, the memoized accessors) and re-exports the
 * engine so every importer of this door keeps resolving the same names. */
import { hostallowed } from "./onboardingstore.ts";

export { hostallowed, mergeStage } from "./onboardingstore.ts";

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
const CACHE_KEY = "vault.onboarding.seen";

/** the anonymous visitor of this surface (the platform gateway may key its own). */
const VISITOR = "web";

/** the configured platform base (HTTPS self-hosted gateway); empty answers cache-only. */
const BASE = readEnvBase();

/** the platform route the accessor rides (the gateway serves /api/v1/*). */
const API_PATH = "/api/v1/onboarding";

/** the abort window of the platform read (ms) — the flow never blocks on a slow gateway. */
const READ_TIMEOUT_MS = 2500;

/** module memory: the flags of the session, consulted before any i/o. */
let memory: VisitorOnboarding | null = null;

/**
 * Linear-time trailing-slash strip (regex-free; safe on uncontrolled input —
 * the former /\/+$/.replace was polynomial and flagged as ReDoS-prone).
 */
function stripTrailingSlashes(value: string): string {
  let end = value.length;
  while (end > 0 && value.charCodeAt(end - 1) === 47 /* "/" */) end--;
  return end === value.length ? value : value.slice(0, end);
}

/** Reads the platform base off the vite env without leaning on the vite client types. */
function readEnvBase(): string {
  try {
    const env = (import.meta as ImportMeta & { env?: { VITE_ONBOARDING_URL?: string } }).env;
    return stripTrailingSlashes((typeof env?.VITE_ONBOARDING_URL === "string" ? env.VITE_ONBOARDING_URL : "").trim());
  } catch {
    return "";
  }
}

/**
 * Reads the validated platform base the platform lanes ride: the
 * VITE_ONBOARDING_URL declaration when the host passes the public-https
 * discipline (hostallowed), an empty string otherwise — the caller answers
 * from its own store (the offline build law). Exported for the same-origin
 * lanes that consult the gateway beside the flags (the ui copy store).
 *
 * @returns the validated base url, or an empty string when none answers.
 */
export function onboardingbase(): string {
  return BASE !== "" && hostallowed(BASE) ? BASE : "";
}

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

/** Reads the flags off the platform database; unreachable or unconfigured answers null. */
async function readRemote(): Promise<VisitorOnboarding | null> {
  if (!BASE || !hostallowed(BASE) || typeof fetch === "undefined") return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), READ_TIMEOUT_MS);
  try {
    const response = await fetch(`${BASE}${API_PATH}?visitor=${encodeURIComponent(VISITOR)}`, {
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
      body: JSON.stringify({ visitor: VISITOR, ...state }),
    });
  } catch {
    // the cache mirrors the flags until the platform answers again
  }
}

/**
 * Reads the visitor state: module memory first, then the platform database
 * over GET /api/v1/onboarding, then the localStorage cache — reconciled with
 * the seen-wins merge so a stage seen anywhere stays seen. The session
 * answer is memoized; re-navigation never refetches.
 *
 * @returns the visitor onboarding flags.
 */
export async function readOnboardingState(): Promise<VisitorOnboarding> {
  if (memory) return memory;
  const cache = readCache();
  const remote = await readRemote();
  const state: VisitorOnboarding = {
    introseen: (cache?.introseen ?? false) || (remote?.introseen ?? false),
    onboardingseen: (cache?.onboardingseen ?? false) || (remote?.onboardingseen ?? false),
  };
  memory = state;
  if (remote) writeCache(state);
  return state;
}

/**
 * Marks one stage seen and persists it everywhere: module memory, the
 * localStorage cache and — when a platform base is configured — the
 * database over POST /api/v1/onboarding. The ONLY writer of the flags.
 *
 * @param stage the stage the visitor just saw (or deliberately skipped).
 * @returns the flags after the write.
 */
export async function markOnboardingStage(stage: OnboardingStage): Promise<VisitorOnboarding> {
  const previous = memory ?? (await readOnboardingState());
  memory = mergeStage(previous, stage);
  writeCache(memory);
  await writeRemote(memory);
  return memory;
}

/** Test seam: clears the module memory (the cache and the platform are untouched). */
export function resetOnboardingMemory(): void {
  memory = null;
}
