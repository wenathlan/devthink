/**
 * storageusageclient.ts — the browser client of the server storage usage
 * route (GET /api/v1/storage/usage?owner=).
 *
 * The My Files capacity bar stops guessing when a devthink server answers:
 * this module is the one seam between the explorer and the storage lane of
 * server.ts — the real usage and the plan quota of one owner. Every call
 * resolves the server base through the gateway machinery the page already
 * carries (the exact pattern of sandboxclient.ts): the paired gateway
 * context first (the guarded ?gateway= base with its ephemeral bearer),
 * then the chat's registered gateway preference (the explicit opt-in the
 * settings page and the session panel persist). No base, a failed fetch,
 * an aborted timeout, a non-ok status or a wrong-shaped body answers null,
 * so the caller falls back to the browser storage estimate and declares the
 * fallback instead of pretending. The module keeps no state of its own —
 * no storage, no new dependency, no hardcoded origin.
 */

import { readBrowserPreferences } from "./db.ts";
import { PREF_GATEWAYBASE, normalizeGatewayBase } from "./gatewaybase.ts";
import { gatewayContext } from "./gateway.ts";

/**
 * @section call — the base resolution and the one bounded fetch the
 * capacity bar rides. The timeout bounds the wait, the bearer rides the
 * pairing token when the page carries one, and every failure mode answers
 * null.
 */

/** TIMEOUTMS — the call bound: a lane that has not answered within ten
 * seconds answers null (the caller falls back, the bar never hangs). */
const TIMEOUTMS = 10_000;

/** OWNERPATTERN — the owner gate the server route enforces; the client
 * refuses a malformed owner before any wire bytes leave. */
const OWNERPATTERN = /^[a-z0-9][a-z0-9-]{5,63}$/i;

/** the honest usage answer of one owner: the bytes the lane stores, the
 * object count and the plan quota composed to bytes (the wire carries
 * quotamb — the client keeps the wire shape out of the surfaces). */
export type StorageLaneUsage = { bytes: number; objects: number; quotabytes: number };

/** usagelane — resolve one call site: the paired gateway context first
 * (the guarded ?gateway= base of the pairing link plus its bearer), else
 * the chat's registered gateway preference. Neither present answers an
 * empty base and the call falls back without touching the wire. */
async function usagelane(): Promise<{ base: string; token?: string }> {
  const context = gatewayContext();
  if (context.url) return { base: context.url, token: context.token };
  let registered = "";
  try {
    const prefs = await readBrowserPreferences();
    registered = normalizeGatewayBase(prefs[PREF_GATEWAYBASE] ?? "");
  } catch {
    registered = "";
  }
  return { base: registered };
}

/**
 * storageusage — the real usage of one owner against the plan quota: get
 * /api/v1/storage/usage and answer the shape the capacity bar reads. The
 * AbortController bounds the wait at TIMEOUTMS and every failure mode —
 * no base, network error, abort, non-ok status, unreadable body — answers
 * null so the caller falls back to the browser estimate honestly.
 */
export async function storageusage(owner: string): Promise<StorageLaneUsage | null> {
  if (!OWNERPATTERN.test(owner)) return null;
  const lane = await usagelane();
  if (!lane.base) return null;
  const headers = new Headers();
  if (lane.token) headers.set("authorization", `Bearer ${lane.token}`);
  const ctrl = new AbortController();
  const timer = window.setTimeout(() => ctrl.abort(), TIMEOUTMS);
  try {
    const response = await fetch(
      `${lane.base}/api/v1/storage/usage?owner=${encodeURIComponent(owner)}`,
      { headers, signal: ctrl.signal },
    );
    if (!response.ok) return null;
    return usageshape(await response.json());
  } catch {
    return null;
  } finally {
    window.clearTimeout(timer);
  }
}

/** usageshape — the honest check of the { usage } body: bytes, objects and
 * quotamb as finite numbers with a positive quota, anything else is not a
 * lane answer. */
function usageshape(parsed: unknown): StorageLaneUsage | null {
  if (typeof parsed !== "object" || parsed === null) return null;
  const usage = (parsed as { usage?: unknown }).usage;
  if (typeof usage !== "object" || usage === null) return null;
  const bytes = (usage as { bytes?: unknown }).bytes;
  const objects = (usage as { objects?: unknown }).objects;
  const quotamb = (usage as { quotamb?: unknown }).quotamb;
  if (typeof bytes !== "number" || !Number.isFinite(bytes) || bytes < 0) return null;
  if (typeof objects !== "number" || !Number.isFinite(objects) || objects < 0) return null;
  if (typeof quotamb !== "number" || !Number.isFinite(quotamb) || quotamb <= 0) return null;
  return { bytes, objects, quotabytes: quotamb * 1024 * 1024 };
}
