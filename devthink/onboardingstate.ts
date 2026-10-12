/**
 * onboardingstate.ts — the catalogued visitor state of the entry flow (root
 * layer). The reform of the wave: the seen flags of the opening ride the
 * DATABASE, not a bare browser flag. The visitor state is the pair
 * { introseen, onboardingseen }; the accessor of this module is the ONLY
 * writer of those flags in the whole interface.
 *
 * Layers, in reading order:
 *  1. in-memory module state — covers the client-side re-navigations of one
 *     page load (the router never refetches what the module already knows);
 *  2. GET/POST /api/v1/onboarding over the configured base — the database is
 *     the source of truth. The base is only accepted when it is a public
 *     https origin: localhost, loopback, private, link-local and reserved
 *     hosts are refused before any request leaves the tab;
 *  3. localStorage `dt.onboarding.seen` — purely the offline CACHE of the
 *     database (it avoids a replay when the platform is unreachable), never
 *     the authority.
 *
 * Every storage/network touch is guarded: the module never throws, and a
 * failed layer falls back to the next one.
 */

/** The seen flags of the entry flow, exactly the columns of the DB table. */
export type onboardingstateview = {
  /** the animated intro already played for this visitor. */
  introseen: boolean;
  /** the frame-a-frame onboarding tour already finished (or was skipped). */
  onboardingseen: boolean;
};

/** The stages one visitor walks: the intro hands over to the onboarding. */
export type onboardingstage = "intro" | "onboarding";

/** The localStorage cache of the DB state (offline mirror, never the truth). */
export const ONBOARDING_CACHE_KEY = "dt.onboarding.seen";

/** The localStorage slot of the anonymous visitor id the DB row keys on. */
export const VISITOR_KEY = "dt.visitor.id";

/** The environment variable the build can declare the onboarding API with. */
export const ONBOARDING_BASE_ENV = "VITE_DT_ONBOARDING_URL";

/** The in-memory state of this page load (covers client-side re-navigation). */
let memorystate: onboardingstateview | null = null;

/**
 * Validates one candidate API base: https only, on a public host —
 * localhost, loopback, private, shared-address, link-local, multicast,
 * reserved and bare/empty hosts are refused.
 *
 * @param raw the raw base url string (undefined/empty answers false).
 * @returns true when the base may carry the onboarding traffic.
 */
export function ispublichttpsbase(raw: string | undefined | null): boolean {
  if (!raw) return false;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }
  if (url.protocol !== "https:") return false;
  const host = url.hostname.toLowerCase().replace(/\.$/, "");
  if (!host || host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) return false;
  if (host === "::1" || host === "[::1]" || host === "0.0.0.0" || host.endsWith(".zone")) return false;
  const v4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (v4) {
    const octets = v4.slice(1).map(Number);
    const [a, b] = octets as [number, number, number, number];
    if (octets.some((value) => value > 255)) return false;
    if (a === 0 || a === 10 || a === 127) return false; // this-network, private, loopback
    if (a === 169 && b === 254) return false; // link-local
    if (a === 172 && b >= 16 && b <= 31) return false; // private
    if (a === 192 && b === 168) return false; // private
    if (a === 100 && b >= 64 && b <= 127) return false; // cgnat shared space
    if (a === 192 && b === 0 && octets[2] === 0) return false; // protocol assignments (192.0.0/24)
    if (a === 192 && b === 0 && octets[2] === 2) return false; // test-net-1 documentation
    if (a === 198 && b === 18) return false; // benchmark
    if (a === 198 && b === 51 && octets[2] === 100) return false; // test-net-2
    if (a === 203 && b === 0 && octets[2] === 113) return false; // test-net-3
    if (a >= 224) return false; // multicast + reserved
  }
  const v6 = host.startsWith("[") && host.endsWith("]");
  if (v6) {
    const bare = host.slice(1, -1);
    if (bare === "::" || bare === "::1") return false;
    if (/^f[cd]/i.test(bare)) return false; // unique-local
    if (/^fe[89ab]/i.test(bare)) return false; // link-local
  }
  return true;
}

/**
 * Resolves the onboarding API base of this build: the VITE_DT_ONBOARDING_URL
 * environment variable, accepted only when it names a public https origin.
 *
 * @param raw the raw env value (defaults to import.meta.env when omitted, so
 * node tests can pass a literal).
 * @returns the validated base origin, or null when no base is configured —
 * the accessor then rides the local cache only.
 */
export function onboardingapibase(raw?: string): URL | null {
  const declared =
    raw ??
    (typeof import.meta.env !== "undefined" ? (import.meta.env[ONBOARDING_BASE_ENV] as string | undefined) : undefined);
  if (!ispublichttpsbase(declared)) return null;
  try {
    return new URL(declared as string);
  } catch {
    return null;
  }
}

/**
 * Reads the persisted visitor id, minting one on the first visit. The id is
 * a random local token — it keys the DB row, it carries no identity.
 *
 * @returns the stable visitor token of this browser.
 */
export function visitorid(): string {
  try {
    const existing = window.localStorage.getItem(VISITOR_KEY);
    if (existing && /^[a-z0-9]{10,40}$/i.test(existing)) return existing;
    const minted = `v${minttoken(15)}`;
    window.localStorage.setItem(VISITOR_KEY, minted);
    return minted;
  } catch {
    /* storage unavailable: the visitor id stays per-page-load */
    return `v${minttoken(15)}`;
  }
}

/** Mints one lowercase random token (crypto when present, clock fallback). */
function minttoken(length: number): string {
  const alphabet = "0123456789abcdefghjkmnpqrstvwxyz";
  const bytes = new Uint8Array(length);
  globalThis.crypto?.getRandomValues?.(bytes);
  return Array.from(bytes, (value, index) => alphabet[value ? value & 31 : (Date.now() + index) & 31]).join("");
}

/**
 * Parses one persisted cache payload into the strict view (anything that is
 * not a well-formed flag pair answers null — the cache never lies).
 */
function parsecache(payload: string | null): onboardingstateview | null {
  if (!payload) return null;
  try {
    const parsed = JSON.parse(payload) as Partial<onboardingstateview> | null;
    if (typeof parsed !== "object" || parsed === null) return null;
    if (typeof parsed.introseen !== "boolean" || typeof parsed.onboardingseen !== "boolean") return null;
    return { introseen: parsed.introseen, onboardingseen: parsed.onboardingseen };
  } catch {
    return null;
  }
}

/** Writes one view into the localStorage cache (best effort). */
function writecache(view: onboardingstateview): void {
  try {
    window.localStorage.setItem(ONBOARDING_CACHE_KEY, JSON.stringify(view));
  } catch {
    /* the cache is best effort; the memory keeps the session honest */
  }
}

/** Merges two views: a seen flag only ever moves upward. */
function mergeviews(left: onboardingstateview, right: onboardingstateview): onboardingstateview {
  return {
    introseen: left.introseen || right.introseen,
    onboardingseen: left.onboardingseen || right.onboardingseen,
  };
}

/**
 * Synchronous peek of the visitor state: the in-memory state when this page
 * load already consulted it, otherwise the localStorage cache. The async
 * `readonboardingstate` is the honest read; this peek exists for the mounts
 * that cannot wait (the desktop boot guard).
 *
 * @returns the best locally-known state (defaults both flags false).
 */
export function peekonboardingstate(): onboardingstateview {
  if (memorystate) return memorystate;
  try {
    const cached = parsecache(window.localStorage.getItem(ONBOARDING_CACHE_KEY));
    if (cached) return cached;
  } catch {
    /* storage unavailable */
  }
  return { introseen: false, onboardingseen: false };
}

/**
 * Reads the catalogued visitor state: memory first, then the database
 * through GET /api/v1/onboarding when a base is configured, falling back to
 * the localStorage cache. The answer is remembered in memory for the rest
 * of the page load.
 *
 * @returns the merged visitor state (the flags only ever move upward).
 */
export async function readonboardingstate(): Promise<onboardingstateview> {
  if (memorystate) return memorystate;
  const local = peekonboardingstate();
  const base = onboardingapibase();
  if (base) {
    try {
      const url = new URL("/api/v1/onboarding", base);
      url.searchParams.set("visitor", visitorid());
      const response = await fetch(url, { method: "GET" });
      if (response.ok) {
        const payload = (await response.json()) as Partial<onboardingstateview> | null;
        const remote: onboardingstateview = {
          introseen: payload?.introseen === true,
          onboardingseen: payload?.onboardingseen === true,
        };
        const merged = mergeviews(local, remote);
        memorystate = merged;
        writecache(merged);
        return merged;
      }
    } catch {
      /* the platform is unreachable: the cache answers */
    }
  }
  memorystate = local;
  return local;
}

/**
 * Raises one stage of the entry flow — the ONLY writer of the seen flags in
 * the interface. Writes the memory, mirrors the localStorage cache and, when
 * a base is configured, POSTs the stage to /api/v1/onboarding so the
 * database stays the source of truth.
 *
 * @param stage the stage the visitor just saw ("intro" or "onboarding").
 * @returns the resulting visitor state (optimistic when the API is absent).
 */
export async function writeonboardingstage(stage: onboardingstage): Promise<onboardingstateview> {
  const current = await readonboardingstate();
  const next: onboardingstateview = {
    introseen: current.introseen || stage === "intro" || stage === "onboarding",
    onboardingseen: current.onboardingseen || stage === "onboarding",
  };
  memorystate = next;
  writecache(next);
  const base = onboardingapibase();
  if (base) {
    try {
      const response = await fetch(new URL("/api/v1/onboarding", base), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ visitor: visitorid(), stage }),
      });
      if (response.ok) {
        const payload = (await response.json()) as Partial<onboardingstateview> | null;
        const remote: onboardingstateview = {
          introseen: payload?.introseen === true,
          onboardingseen: payload?.onboardingseen === true,
        };
        const merged = mergeviews(next, remote);
        memorystate = merged;
        writecache(merged);
        return merged;
      }
    } catch {
      /* the write retries on the next stage; the cache holds the session */
    }
  }
  return next;
}
