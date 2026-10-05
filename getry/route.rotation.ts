/**
 * route.rotation.ts — the weighted rotation of the model pool (root layer).
 *
 * the pool-level rotation the gateway resolves before a request leaves: model
 * routes carry relative weights, failures buy cooldowns and only healthy
 * routes compete. the knobs follow the router discipline of litellm (3
 * allowed fails, 5s cooldown, escalation capped) — lifted here as pure,
 * dependency-free math over a plain ledger so node and browser answer the
 * same. complements sessions.ts: the session store owns the per-session
 * rotation index (the devthink meta model rotates every ROTATIONEVERY turns);
 * this module owns where in the model pool that index lands.
 */

/** one candidate route of the rotation pool. */
export type ModelRoute = {
  id: string;
  provider: string;
  model: string;
  /** relative weight against the pool: 1 = plain, 2 = twice the traffic, 0 = out */
  weight: number;
};

/** the cooldown ledger entry of one route. */
export type CooldownEntry = {
  /** epoch ms until which the route is skipped */
  until: number;
  /** consecutive failures counted since the last success */
  failures: number;
};

/** the rotation ledger: route id → cooldown entry (a plain map, no storage). */
export type RotationLedger = Map<string, CooldownEntry>;

/** the rotation knobs, lifted from litellm's router defaults. */
export type RotationOptions = {
  /** consecutive failures a route tolerates before it cools down */
  allowedFails: number;
  /** the cooldown window in ms applied when the failure budget runs out */
  cooldownMs: number;
  /** extra cooldown ms per further failure (the escalation step) */
  cooldownStepMs: number;
  /** the ceiling any cooldown is clamped to */
  maxCooldownMs: number;
};

/** the house defaults: 3 allowed fails, 5s cooldown, 5s escalation, 60s ceiling. */
export const ROTATIONDEFAULTS: RotationOptions = {
  allowedFails: 3,
  cooldownMs: 5000,
  cooldownStepMs: 5000,
  maxCooldownMs: 60000,
};

/**
 * builds a fresh empty ledger.
 *
 * @returns the ledger to pass through the rotation calls.
 */
export function newledger(): RotationLedger {
  return new Map<string, CooldownEntry>();
}

/**
 * lists the healthy routes: weight above zero and not cooling down right now.
 *
 * @param routes the full pool, healthy or not.
 * @param ledger the cooldown ledger.
 * @param now the reference clock in epoch ms (defaults to the real clock).
 * @returns the routes that may take traffic.
 */
export function healthyroutes(routes: readonly ModelRoute[], ledger: RotationLedger, now = Date.now()): ModelRoute[] {
  return routes.filter((route) => {
    if (route.weight <= 0) return false;
    const entry = ledger.get(route.id);
    return !entry || entry.until <= now;
  });
}

/**
 * picks one healthy route by weight. the draw runs through `rand` so tests
 * stay deterministic; production answers Math.random. Weight 0 routes never
 * win; an empty healthy pool answers null (the caller falls back).
 *
 * @param routes the full pool.
 * @param ledger the cooldown ledger.
 * @param rand the uniform draw in [0, 1) (defaults to Math.random).
 * @param now the reference clock in epoch ms (defaults to the real clock).
 * @returns the winning route, or null when nothing is healthy.
 */
export function pickroute(
  routes: readonly ModelRoute[],
  ledger: RotationLedger,
  rand: () => number = Math.random,
  now = Date.now(),
): ModelRoute | null {
  const healthy = healthyroutes(routes, ledger, now);
  if (healthy.length === 0) return null;
  const total = healthy.reduce((sum, route) => sum + route.weight, 0);
  let draw = rand() * total;
  for (const route of healthy) {
    draw -= route.weight;
    if (draw < 0) return route;
  }
  return healthy[healthy.length - 1];
}

/**
 * notes one failure against a route: the failure budget counts up and, once
 * past `allowedFails`, the route cools down for `cooldownMs` plus one
 * `cooldownStepMs` per further failure, clamped to `maxCooldownMs`. The
 * ledger is updated in place and the entry answered back.
 *
 * @param ledger the cooldown ledger to update.
 * @param routeId the route that failed.
 * @param options the rotation knobs (defaults apply).
 * @param now the reference clock in epoch ms (defaults to the real clock).
 * @returns the updated ledger entry.
 */
export function notefailure(
  ledger: RotationLedger,
  routeId: string,
  options: Partial<RotationOptions> = {},
  now = Date.now(),
): CooldownEntry {
  const config = { ...ROTATIONDEFAULTS, ...options };
  const entry = ledger.get(routeId) ?? { until: 0, failures: 0 };
  entry.failures += 1;
  if (entry.failures > config.allowedFails) {
    const overshoot = entry.failures - config.allowedFails - 1;
    const window = Math.min(config.cooldownMs + overshoot * config.cooldownStepMs, config.maxCooldownMs);
    entry.until = Math.max(entry.until, now + window);
  }
  ledger.set(routeId, entry);
  return entry;
}

/**
 * notes a success: the route leaves the ledger (failure budget and cooldown
 * cleared) — litellm's cooldown clears the moment a deployment answers.
 *
 * @param ledger the cooldown ledger to update.
 * @param routeId the route that answered.
 */
export function notesuccess(ledger: RotationLedger, routeId: string): void {
  ledger.delete(routeId);
}

/**
 * reads the cooldown still owed by a route.
 *
 * @param entry the ledger entry (or null when the route is clean).
 * @param now the reference clock in epoch ms (defaults to the real clock).
 * @returns the ms left in cooldown (0 when the route is healthy).
 */
export function remainingcooldown(entry: CooldownEntry | null, now = Date.now()): number {
  if (!entry) return 0;
  return Math.max(0, entry.until - now);
}
