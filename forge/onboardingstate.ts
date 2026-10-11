// # onboardingstate — the first-run state of one visitor (the flow contract of
// the reform): the ONLY writer of the intro/onboarding seen flags. The DB is
// the source of truth — the platform gateway serves GET/POST /api/v1/onboarding
// over HTTPS when a base is configured (the same self-hosted pattern api.ts
// rides, with the host validated: localhost, loopback, private, CGNAT and
// reserved ranges are refused, mapped IPv6 hosts normalize to their IPv4
// form). Without a platform the module answers from the offline layer alone:
// in-memory module state covers client-side re-navigation and the localStorage
// key `forge.onboarding.seen` is a pure CACHE MIRROR of the DB (it avoids
// replaying the flow offline; it never decides alone). The home entry gate
// reads the state here, the intro marks the intro stage and the onboarding
// marks the final stage — no other module touches the flags.

/** the seen flags of one visitor: the intro splash and the first-run onboarding. */
export type OnboardingSnapshot = {
  /** the animated intro already played for this visitor */
  introseen: boolean;
  /** the first-run onboarding already finished (or was skipped) for this visitor */
  onboardingseen: boolean;
};

/** localStorage cache mirror of the DB state (offline layer, never the truth) */
const CACHE_KEY = "forge.onboarding.seen";
/** stable per-browser visitor id sent to the platform gateway */
const VISITOR_KEY = "forge.visitor.id";
/** the platform gateway route (no server route in this app — the gateway serves it) */
const API_PATH = "/api/v1/onboarding";
/** the gateway base url (self-hosted over HTTPS); empty answers from the offline layer */
const base = (import.meta.env.VITE_ONBOARDING_URL as string | undefined)?.trim().replace(/\/$/, "") ?? "";

/** the module state: client-side re-navigation never refetches */
let memory: OnboardingSnapshot | null = null;

/**
 * Normalizes a URL host for the range checks: IPv6 brackets come off and a
 * mapped IPv6 address (::ffff:a.b.c.d) collapses to its IPv4 form.
 *
 * @param host the raw hostname of the configured base.
 * @returns the comparable host form.
 */
function normalizeHost(host: string): string {
  const bare = host.toLowerCase().replace(/^\[|\]$/g, "");
  const mapped = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/.exec(bare);
  return mapped ? mapped[1] : bare;
}

/**
 * Validates a base url against the self-hosted contract: HTTPS only, the host
 * must be public (localhost, loopback, private, CGNAT and reserved ranges
 * refused).
 *
 * @param candidate the configured gateway base url.
 * @returns true when the base may be called from the browser.
 */
function isPublicHttps(candidate: string): boolean {
  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return false;
  }
  if (url.protocol !== "https:") return false;
  const host = normalizeHost(url.hostname);
  if (host === "" || host === "localhost" || host.endsWith(".localhost")) return false;
  if (host.endsWith(".local") || host.endsWith(".internal") || host.endsWith(".home.arpa")) return false;
  if (host.includes(":")) {
    // IPv6: loopback, unspecified, unique-local fc00::/7 and link-local fe80::/10
    return !(host === "::1" || host === "::" || /^(f[cd]|fe[89ab])/.test(host));
  }
  const v4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host);
  if (v4) {
    const a = Number(v4[1]);
    const b = Number(v4[2]);
    if (a === 0 || a === 10 || a === 127) return false; // this-network, private, loopback
    if (a === 172 && b >= 16 && b <= 31) return false; // private
    if (a === 192 && b === 168) return false; // private
    if (a === 169 && b === 254) return false; // link-local
    if (a === 100 && b >= 64 && b <= 127) return false; // carrier-grade nat
    if (a === 198 && (b === 18 || b === 19)) return false; // benchmarking
    if (a === 192 && b === 0) return false; // IETF protocol assignments
    if (a >= 224) return false; // multicast + reserved
  }
  return true;
}

/** the resolved api endpoint: empty when no public HTTPS base is configured */
const endpoint = base !== "" && isPublicHttps(base) ? `${base}${API_PATH}` : "";

/**
 * Reads the cache mirror from localStorage (never throws; corrupt entries die).
 *
 * @returns the cached snapshot or null when nothing trustworthy is cached.
 */
function readCache(): OnboardingSnapshot | null {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<OnboardingSnapshot>;
    return { introseen: parsed.introseen === true, onboardingseen: parsed.onboardingseen === true };
  } catch {
    return null;
  }
}

/**
 * Writes the cache mirror to localStorage (best effort; storage may be unavailable).
 *
 * @param state the snapshot to mirror.
 */
function writeCache(state: OnboardingSnapshot): void {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable: the in-memory state still covers the session */
  }
}

/**
 * Merges two snapshots with seen-monotonic semantics: a stage seen anywhere
 * stays seen (the flow never replays).
 *
 * @param a the first snapshot.
 * @param b the second snapshot.
 * @returns the merged snapshot.
 */
function mergeStates(a: OnboardingSnapshot, b: OnboardingSnapshot): OnboardingSnapshot {
  return { introseen: a.introseen || b.introseen, onboardingseen: a.onboardingseen || b.onboardingseen };
}

/**
 * The stable per-browser visitor id (generated once, cached in localStorage).
 *
 * @returns the visitor string sent to the platform gateway.
 */
function visitor(): string {
  try {
    const existing = window.localStorage.getItem(VISITOR_KEY);
    if (existing) return existing;
    const fresh = crypto.randomUUID();
    window.localStorage.setItem(VISITOR_KEY, fresh);
    return fresh;
  } catch {
    return "anonymous";
  }
}

/**
 * Synchronous read of the seen state (memory first, then the cache mirror).
 * The entry gate uses this for the flash-free fast path; a null means the
 * state is still unknown and the caller must await loadOnboardingState.
 *
 * @returns the known snapshot or null when nothing is known yet.
 */
export function readOnboardingState(): OnboardingSnapshot | null {
  if (memory) return memory;
  const cached = readCache();
  if (cached) {
    memory = cached;
    return cached;
  }
  return null;
}

/**
 * Full resolve of the seen state: memory/cache first, then the platform
 * gateway GET (merged with seen-monotonic semantics). A failed call keeps
 * the offline answer — the next call retries.
 *
 * @returns the resolved snapshot.
 */
export async function loadOnboardingState(): Promise<OnboardingSnapshot> {
  const local = readOnboardingState() ?? { introseen: false, onboardingseen: false };
  if (!endpoint || (local.introseen && local.onboardingseen)) return local;
  try {
    const response = await fetch(`${endpoint}?visitor=${encodeURIComponent(visitor())}`, {
      headers: { accept: "application/json" },
    });
    if (!response.ok) throw new Error(`onboarding answered ${response.status}`);
    const remote = (await response.json()) as Partial<OnboardingSnapshot>;
    const merged = mergeStates(local, {
      introseen: remote.introseen === true,
      onboardingseen: remote.onboardingseen === true,
    });
    memory = merged;
    writeCache(merged);
    return merged;
  } catch {
    return local;
  }
}

/**
 * Writes the stage locally (memory + cache) and reports it to the platform
 * gateway fire-and-forget — the ONLY writer of the seen flags.
 *
 * @param stage the snapshot stage to mark seen.
 */
function writeStage(stage: OnboardingSnapshot): void {
  memory = mergeStates(memory ?? readCache() ?? { introseen: false, onboardingseen: false }, stage);
  writeCache(memory);
  if (!endpoint) return;
  const payload = JSON.stringify({ visitor: visitor(), ...memory });
  void fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => {
    /* the cache already mirrors the stage; the gateway reconciles on the next GET */
  });
}

/**
 * Marks the intro stage seen (the splash played or was skipped).
 */
export function markIntroSeen(): void {
  writeStage({ introseen: true, onboardingseen: false });
}

/**
 * Marks the onboarding stage seen (finish or skip — both imply the intro).
 */
export function markOnboardingSeen(): void {
  writeStage({ introseen: true, onboardingseen: true });
}
