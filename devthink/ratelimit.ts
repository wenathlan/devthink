/**
 * ratelimit.ts — the rate limit law of the os boundary, seated by the
 * wave/csp-ratelaw: the checklist mandates 0803 (the ceiling of 1200
 * requests a minute seated) and 0838 (the ceiling configurable into the
 * thousands of requests a minute a heavier deploy may lawfully draw)
 * ride one sliding window, and mandate 1224 rides the same law (the
 * visitor report rate-limited and session-keyed, never keyed by the ip —
 * the cgnat law).
 *
 * Sections:
 *  @section 1 ceiling — the env seat (DEVTHINK_RATE_LIMIT, default 1200)
 *  @section 2 key — the session key derivation and the cgnat law
 *  @section 3 window — the sliding window of admitted timestamps
 *  @section 4 sweep — the periodic sweep of the idle buckets
 *  @section 5 seat — the hono middleware the composed server registers
 *
 * Architectural constraints:
 *  - the key never reads the ip. carrier grade nat folds whole
 *    households behind one address, so an ip keyed ceiling would punish
 *    every member of the building for one member's pace, and the visitor
 *    report lanes the mandate guards are exactly the lanes anonymous
 *    populations ride. the honest key is the credential the request
 *    itself carries: the account session bearer of the authorization
 *    header, or the family cookie the account lane mints at every session
 *    door; a request that carries no credential rides one shared
 *    anonymous bucket, because the only alternative key an anonymous
 *    request offers is a token the client mints itself and can remint at
 *    will — a fresh bucket per forgery, no law at all. the anonymous
 *    bucket is the honest floor: a flood gets cut at the same ceiling,
 *    while honest credential-less traffic (an intro read, a plan badge)
 *    never approaches it.
 *  - the token never becomes a Map label: the key carries only the first
 *    half of its sha-256 digest, the same law the account store keeps
 *    (the session bearer lives as its digest), so the rate state never
 *    holds raw credential material.
 *  - the window is a sliding sixty second log over a plain Map of
 *    timestamps, zero dependencies beyond node:crypto; only admitted
 *    requests stamp the window (a refused request extends nothing), so a
 *    bucket never grows past the ceiling and the window unblocks exactly
 *    when its oldest admission ages out.
 *  - a refused request answers 429 with a Retry-After header that names
 *    the seconds until the oldest admission of the window ages out, the
 *    honest hint the queue family already parses on the client side.
 *  - the law seats at the composed hono boundary (server.ts createserver)
 *    before the os lanes register, so every visitor report lane
 *    (onboarding, plan) and every future /api lane rides the same law the
 *    day it lands; the loopback workbench server of startserver stays
 *    outside it by design — one person's single-user 127.0.0.1 workbench
 *    never rides the cgnat population the law exists for, and its lanes
 *    are the pairing and preference polls of exactly one browser.
 *
 * Version: 1.0.0 — the wave/csp-ratelaw rate limit seat
 *
 * Related modules:
 *  - server.ts — the composed createserver that registers the middleware
 *    before the os lanes
 *  - account.ts — the session bearers and the family cookie the key
 *    derives from (the account lane mints them, this law only reads)
 *  - queue.ts — the retry discipline that honors a Retry-After hint on
 *    the client side
 *
 * @author devthink
 * @license MIT
 */

import { createHash } from "node:crypto";
import type { Context } from "hono";

/** the next handler of the hono middleware chain — the same zero argument
 * promise shape hono's own Next declares, declared locally because the hono
 * face the app pins (hono.ts) re exports the Context type without the Next
 * one, and the law module imports only what the face answers. */
type hononext = () => Promise<void>;

/* ============================================================================
 * @section 1 — ceiling: the env seat of the law.
 * ========================================================================== */

/** the ceiling the checklist mandate 0803 seats: 1200 requests a minute. */
const ratelimitdefaultceiling = 1200;

/** the sliding window of the law, in milliseconds: one minute. */
const ratelimitwindowms = 60_000;

/** the sweep cadence of the law, in milliseconds: one window per pass. */
const ratelimitsweepms = 60_000;

/** the env variable the deploy seats the ceiling with, so the thousands
 * of requests a minute the mandate 0838 names stay reachable by
 * configuration alone, never by a code change. */
const ratelimitenvar = "DEVTHINK_RATE_LIMIT";

/** the effective ceiling of this process: the env seat when it declares a
 * finite ceiling of at least one request, the mandated default otherwise
 * (an unparsable or non-positive seat refuses honestly to the default
 * rather than sealing the whole lane with a zero). */
export const ratelimitceiling: number = (() => {
  const declared = process.env[ratelimitenvar];
  const parsed = declared === undefined ? Number.NaN : Number(declared);
  return Number.isFinite(parsed) && parsed >= 1 ? Math.floor(parsed) : ratelimitdefaultceiling;
})();

/* ============================================================================
 * @section 2 — key: the session key derivation and the cgnat law.
 * ========================================================================== */

/** the family session cookie the account lane mints (the same
 * "devthinkfamily" name createoslanes stamps its HttpOnly cookie with —
 * one name, two seats: the account lane mints the cookie, this law only
 * reads it to key the window). */
const familysessioncookie = "devthinkfamily";

/** the lane a request keys on: the account session bearer, the family
 * cookie, or the shared anonymous bucket. */
export type ratelimitlane = "session" | "family" | "anonymous";

/** the identity one request derives its rate key from: the bucket label
 * (a digest, never a raw credential) and the lane the label came from. */
export type ratelimitidentity = { key: string; lane: ratelimitlane };

/** the header shape both seats of the law read from (the fetch Headers of
 * the hono request and the plain header map of a raw node request both
 * answer it, so the derivation stays one function wherever the law seats). */
export type headerlike = { get(name: string): string | null | undefined };

/** digests one credential into its bucket label: the first half of the
 * sha-256 hex digest, the same discipline the account store keeps for its
 * session bearers — the rate state never holds the raw token. */
function digestlabel(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex").slice(0, 32);
}

/**
 * derives the rate key of one request — never from the ip, the cgnat law:
 * carrier grade nat folds many visitors behind one address and the
 * visitor report lanes are exactly the lanes anonymous populations ride,
 * so the honest key is the credential the request itself carries. the
 * authorization bearer answers first (the account session bearer, or any
 * pairing bearer the workbench lanes ride), the family cookie second (the
 * HttpOnly session the account lane mints), and a request that carries
 * neither rides the one shared anonymous bucket.
 *
 * @param headers the headers of the request (the fetch Headers or a plain
 * header map — both answer the get seam).
 * @returns the bucket label with the lane it derived from.
 */
export function ratelimitkey(headers: headerlike): ratelimitidentity {
  const authorization = headers.get("authorization");
  if (typeof authorization === "string" && /^bearer\s+/i.test(authorization)) {
    const token = authorization.replace(/^bearer\s+/i, "").trim();
    if (token) return { key: `session ${digestlabel(token)}`, lane: "session" };
  }
  const cookie = headers.get("cookie");
  if (typeof cookie === "string" && cookie.includes(`${familysessioncookie}=`)) {
    for (const piece of cookie.split(";")) {
      const parts = piece.trim().split("=");
      const candidate = parts[0] === familysessioncookie && parts.length >= 2 ? parts[1] || "" : "";
      if (candidate) return { key: `family ${digestlabel(candidate)}`, lane: "family" };
    }
  }
  return { key: "anonymous", lane: "anonymous" };
}

/* ============================================================================
 * @section 3 — window: the sliding window of admitted timestamps.
 * ========================================================================== */

/** the verdict of one window check: whether the request rides, the honest
 * retry hint when it does not, and the remaining headroom of the window. */
export type ratelimitverdict = {
  /** false answers 429 — the ceiling of this bucket is spent for now. */
  allowed: boolean;
  /** the seconds until the oldest admission of the window ages out (at
   * least one second when refused; the Retry-After value). */
  retryafter: number;
  /** the admissions still left in this window when the request rides. */
  remaining: number;
  /** the seconds until the window starts releasing (the reset hint). */
  resetin: number;
  /** the lane the request keyed on — the honest refusal names it. */
  lane: ratelimitlane;
};

/** the sliding window state: one bucket of admitted timestamps per key.
 * only admitted requests stamp the bucket (a refusal extends nothing), so
 * every array stays bounded by the ceiling and the bucket unblocks exactly
 * when its oldest admission ages out. */
const buckets = new Map<string, number[]>();

/**
 * checks one identity against the sliding window and admits it when the
 * ceiling of the minute still has room: the timestamps older than the
 * window fall away first, a full window refuses with the honest retry
 * hint (the seconds until the oldest admission ages out), and an
 * admitted request stamps the window it just consumed.
 *
 * @param identity the derived identity of the request.
 * @param now the clock the window reads (the wall clock by default, so a
 * battery can drive the window with a frozen clock).
 * @returns the verdict the middleware answers from.
 */
export function ratelimitcheck(identity: ratelimitidentity, now: number = Date.now()): ratelimitverdict {
  startsweep();
  const admitted = (buckets.get(identity.key) ?? []).filter((stamp) => stamp > now - ratelimitwindowms);
  if (admitted.length >= ratelimitceiling) {
    buckets.set(identity.key, admitted);
    const retryafter = Math.max(1, Math.ceil((admitted[0] + ratelimitwindowms - now) / 1000));
    return { allowed: false, retryafter, remaining: 0, resetin: retryafter, lane: identity.lane };
  }
  admitted.push(now);
  buckets.set(identity.key, admitted);
  return {
    allowed: true,
    retryafter: 0,
    remaining: ratelimitceiling - admitted.length,
    resetin: Math.max(1, Math.ceil((admitted[0] + ratelimitwindowms - now) / 1000)),
    lane: identity.lane,
  };
}

/** clears every bucket of the window state — the battery seat, so a test
 * lane can drive the law from a clean slate without a process restart. */
export function ratelimitreset(): void {
  buckets.clear();
}

/* ============================================================================
 * @section 4 — sweep: the periodic sweep of the idle buckets.
 * ========================================================================== */

/** the sweeper handle of the law: the interval starts lazily with the
 * first window check (an importing process that never checks never starts
 * it) and stays unref'd so the process never waits on the sweeper to
 * exit — the sweep is housekeeping, never a lifetime holder. */
let sweeper: ReturnType<typeof setInterval> | null = null;

/** starts the periodic sweep once, on the first window check: every
 * window span, the sweep walks the buckets and releases the keys whose
 * last admission aged out of the window, so a passing population of
 * session keys never accumulates state. */
function startsweep(): void {
  if (sweeper !== null) return;
  sweeper = setInterval(() => {
    ratelimitsweep();
  }, ratelimitsweepms);
  sweeper.unref();
}

/**
 * sweeps the window state once: every bucket drops its aged-out
 * timestamps, and a bucket nothing lived in deletes — the idle sessions
 * of a passing population release their state, so the Map answers the
 * live population only.
 *
 * @param now the clock the sweep reads (the wall clock by default, so a
 * battery can drive it with a frozen clock).
 * @returns the number of live buckets after the sweep.
 */
export function ratelimitsweep(now: number = Date.now()): number {
  for (const [key, admitted] of buckets) {
    const live = admitted.filter((stamp) => stamp > now - ratelimitwindowms);
    if (live.length === 0) buckets.delete(key);
    else if (live.length !== admitted.length) buckets.set(key, live);
  }
  return buckets.size;
}

/* ============================================================================
 * @section 5 — seat: the hono middleware the composed server registers.
 * ========================================================================== */

/**
 * the hono middleware that seats the law at the composed boundary: one
 * check per request (the identity derives from the request headers, the
 * window admits or refuses), a refusal answers 429 with the Retry-After
 * header naming the seconds until the oldest admission of the window
 * ages out, and an admitted request falls through to the lane it rode.
 * the loopback workbench server of startserver registers nothing of this
 * law — its lanes are one person's own pairing and preference polls, and
 * the cgnat population the law exists for never rides a 127.0.0.1
 * workbench.
 *
 * @returns the middleware the composed createserver registers before the
 * os lanes, so every visitor report lane and every future /api lane
 * rides the same law the day it lands.
 */
export function ratelimitmiddleware() {
  return async (c: Context, next: hononext): Promise<Response | undefined> => {
    const verdict = ratelimitcheck(ratelimitkey(c.req.raw.headers));
    if (!verdict.allowed) {
      const ceiling = `the rate ceiling of ${ratelimitceiling} a minute answered this ${verdict.lane} lane`;
      return c.json(
        { error: `${ceiling}; retry after ${verdict.retryafter} seconds.` },
        429,
        { "Retry-After": String(verdict.retryafter) },
      );
    }
    await next();
    return undefined;
  };
}
