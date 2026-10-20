// # planstate — the ONE writer of the visitor's plan, the visual gate of
// the DevThink os (root layer). The engines carry no limits: the saddle
// sandbox and the storage technology are infinite and free — the block is
// VISUAL and lives here, in the os, tied to the account the person creates
// and the plan they select (free, pro, enterprise; enterprise defines the
// megabytes of disk and ram it wants). The state rides the platform
// database over GET/POST /api/v1/plan, https only, the base url arrives
// through VITE_DT_ONBOARDING_URL and every candidate host passes the same
// public law onboardingstate carries (localhost, loopback, private and
// reserved refused). The localStorage key devthink.plan is purely the
// offline cache of the database (never the source of truth) and module
// memory covers the session; the payment step stays a placeholder until
// the gateway wave wires the processor — the choice stamps the badge now,
// the charge lands when the processor exists.

import { ispublichttpsbase, onboardingapibase, visitorid } from "./onboardingstate.ts";

/** The tiers the os sells. */
export type Tier = "free" | "pro" | "enterprise";

/** The badge one tier stamps on the identity (the craved badge the owner
 * names: the plan the person selected, visible wherever the identity shows). */
export interface TierBadge {
  /** The badge label (lowercase, short). */
  label: string;
  /** The badge detail line. */
  detail: string;
}

/** The badge table: every tier answers its badge. */
export const TIER_BADGES: Readonly<Record<Tier, TierBadge>> = Object.freeze({
  free: { label: "free", detail: "the open platform, the base plan" },
  pro: { label: "pro", detail: "the expanded plan for daily creators" },
  enterprise: { label: "enterprise", detail: "defines own disk and ram, the technology follows" },
});

/** The capability badges the platform stamps beside the tier badge (the
 * robot, the android, the audio and the media lanes the apps carry). */
export const CAPABILITY_BADGES: readonly string[] = Object.freeze([
  "sandbox",
  "robot",
  "android",
  "audio",
  "video",
  "image",
  "gateway",
]);

/** The custom definition the enterprise tier writes (megabytes). */
export interface PlanCustom {
  /** The disk the account defines, in mb. */
  storagemb?: number;
  /** The ram the account defines, in mb. */
  rammib?: number;
}

/** The plan view the os reads (the badge source). */
export interface PlanView {
  /** The tier the visitor selected. */
  tier: Tier;
  /** The enterprise custom disk (mb) when defined. */
  storagemb?: number;
  /** The enterprise custom ram (mb) when defined. */
  rammib?: number;
  /** The iso instant the plan was stamped. */
  since: string;
}

/** The localStorage cache key (the db mirror, never the source of truth). */
const CACHE_KEY = "devthink.plan";

/** The platform route the plan rides (the gateway serves /api/v1/*). */
const API_PATH = "/api/v1/plan";

/** The abort window of the platform call (ms) — the page never hangs. */
const TIMEOUT_MS = 4000;

/** module memory: the plan of the session, consulted before any i/o. */
let memory: PlanView | null = null;

/** Parses one payload into the strict view (the cache never lies). */
function parseplan(payload: unknown): PlanView | null {
  if (typeof payload !== "object" || payload === null) return null;
  const row = payload as Partial<PlanView>;
  if (row.tier !== "free" && row.tier !== "pro" && row.tier !== "enterprise") return null;
  if (typeof row.since !== "string" || row.since.length === 0) return null;
  const view: PlanView = { tier: row.tier, since: row.since };
  if (typeof row.storagemb === "number" && row.storagemb > 0) view.storagemb = row.storagemb;
  if (typeof row.rammib === "number" && row.rammib > 0) view.rammib = row.rammib;
  return view;
}

/** Reads the cache best effort. */
function readcache(): PlanView | null {
  if (memory) return memory;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    memory = parseplan(JSON.parse(raw));
    return memory;
  } catch {
    return null;
  }
}

/** Writes the cache best effort (the memory keeps the session honest). */
function writecache(view: PlanView): void {
  memory = view;
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(view));
  } catch {
    /* the cache is best effort */
  }
}

/** One platform call: https, validated host, hard timeout, json in/out. */
async function call(method: string, path: string, body?: unknown): Promise<unknown | null> {
  const base = onboardingapibase();
  if (!base || !ispublichttpsbase(base.toString())) return null;
  try {
    const res = await fetch(new URL(path, base).toString(), {
      method,
      credentials: "include",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: body ? { "content-type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) return null;
    return (await res.json()) as unknown;
  } catch {
    return null;
  }
}

/**
 * Synchronous peek of the plan: the cache and the memory only (the badge
 * renders before any network answers).
 *
 * @returns the cached plan, or null when this device never stamped one.
 */
export function peekplan(): PlanView | null {
  return readcache();
}

/**
 * Loads the plan from the platform database, the cache reconciling after
 * the answer (the db wins).
 *
 * @returns the plan, or null when the platform is away and the cache is
 * empty.
 */
export async function loadplan(): Promise<PlanView | null> {
  const answer = (await call("GET", `${API_PATH}?visitor=${encodeURIComponent(visitorid())}`)) as {
    plan?: unknown;
  } | null;
  const remote = answer?.plan ? parseplan(answer.plan) : null;
  if (remote) writecache(remote);
  return remote ?? readcache();
}

/**
 * Stamps the plan: the selection the person made (and the enterprise
 * custom megabytes) rides the platform database and the cache.
 *
 * @param tier the selected tier.
 * @param custom the enterprise custom values (ignored on the other tiers).
 * @returns the stamped view, or null when the platform refused and the
 * caller asked for a durable write (the cache still shows the choice).
 */
export async function saveplan(tier: Tier, custom?: PlanCustom): Promise<PlanView> {
  const view: PlanView = {
    tier,
    since: new Date().toISOString(),
  };
  if (tier === "enterprise") {
    if (custom?.storagemb !== undefined && custom.storagemb > 0) view.storagemb = custom.storagemb;
    if (custom?.rammib !== undefined && custom.rammib > 0) view.rammib = custom.rammib;
  }
  writecache(view);
  await call("POST", API_PATH, { visitor: visitorid(), plan: view });
  return view;
}

/** The badge of the current plan (the identity surface reads this). */
export function planbadge(view: PlanView | null): TierBadge {
  return TIER_BADGES[view?.tier ?? "free"];
}
