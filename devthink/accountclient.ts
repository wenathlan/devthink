/**
 * accountclient.ts — the browser client of the server-side account lane.
 *
 * The entry faces stop pretending when a devthink server answers: this
 * module is the one seam between the entry surfaces and the real account
 * routes of server.ts — the account creation, the sign in, the oauth
 * exchange the callback page completes, the session summary and the
 * revoke. Every call resolves the server base through the same gateway
 * machinery the sandbox client rides: the paired gateway context first
 * (the guarded ?gateway= base with its ephemeral bearer), then the chat's
 * registered gateway preference. The verdict union keeps the three honest
 * outcomes apart — the lane answered and signed in, the lane answered and
 * refused, the lane never answered (offline) — so the faces declare the
 * fallback instead of pretending. The module keeps no state of its own
 * beyond the family session the pages save: the bearer rides sessionStorage (the disposable cache of the server session, never the canonical store)
 * under devthink.account.token, the owner under devthink.account.owner.
 * No secret is ever stored — the family session token is a server-minted
 * bearer, the account secret never leaves the password field but as the
 * request body the lane digests.
 */

import { readBrowserPreferences } from "./db.ts";
import { PREF_GATEWAYBASE, normalizeGatewayBase } from "./gatewaybase.ts";
import { gatewayContext } from "./gateway.ts";

/**
 * @section shapes — the wire contracts of the account routes and the
 * verdict union every surface reads.
 */

/** One family session as the lane issues it (the token answers once). */
export type ServerSession = { owner: string; token: string; expiresAt: number; createdAt?: string };

/** The honest verdict of one account call: ok, refused, or the lane absent. */
export type AccountVerdict =
  | { verdict: "ok"; session: ServerSession }
  | { verdict: "refused"; error: string }
  | { verdict: "offline" };

/** One live session as the summary route answers it. */
export type AccountSessionState = { owner: string; createdAt: string; expiresAt: number };

/** The sessionStorage slot of the family session bearer. */
export const ACCOUNT_TOKEN_KEY = "devthink.account.token";

/** The sessionStorage slot of the account owner handle. */
export const ACCOUNT_OWNER_KEY = "devthink.account.owner";

/** TIMEOUTMS — the call bound: a lane that has not answered within ten
 * seconds answers offline (the caller falls back, the face never hangs). */
const TIMEOUTMS = 10_000;

/** ACCOUNTPATTERN — the owner shape the lane enforces; the client refuses
 * a malformed handle before any wire bytes leave. */
const ACCOUNTPATTERN = /^[a-z0-9][a-z0-9-]{2,63}$/i;

/** BEARERPATTERN — the bearer shape the lane mints. */
const BEARERPATTERN = /^[a-f0-9]{64}$/i;

/**
 * @section lane — the base resolution and the one bounded fetch every
 * surface rides.
 */

/** accountlane — resolve one lane call site: the paired gateway context
 * first, else the chat's registered gateway preference. Neither present
 * answers an empty base and the call falls back without touching the wire. */
async function accountlane(): Promise<{ base: string; token?: string }> {
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

/** accountfetch — one bounded json call against the resolved lane base:
 * the bearer rides when the pairing context carries one, the abort
 * controller bounds the wait at TIMEOUTMS, and every failure mode — no
 * base, network error, timeout, unreadable body — answers null so the
 * caller declares the offline verdict honestly. */
async function accountfetch(path: string, init?: RequestInit): Promise<{ status: number; payload: unknown } | null> {
  const lane = await accountlane();
  if (!lane.base) return null;
  const headers = new Headers(init?.headers);
  if (lane.token) headers.set("authorization", ["Bearer ", lane.token].join(""));
  if (init?.body && !headers.has("content-type")) headers.set("content-type", "application/json");
  const ctrl = new AbortController();
  const timer = window.setTimeout(() => ctrl.abort(), TIMEOUTMS);
  try {
    const response = await fetch([lane.base, path].join(""), { ...init, headers, signal: ctrl.signal });
    const payload: unknown = await response.json().catch(() => null);
    return { status: response.status, payload };
  } catch {
    return null;
  } finally {
    window.clearTimeout(timer);
  }
}

/** errorof — the honest refusal message of a lane error body. */
function errorof(payload: unknown): string {
  if (payload && typeof payload === "object") {
    const message = (payload as { error?: unknown }).error;
    if (typeof message === "string" && message) return message;
  }
  return "the lane refused the request";
}

/** sessionof — the honest shape check of a session answer body. */
function sessionof(payload: unknown): ServerSession | null {
  if (!payload || typeof payload !== "object") return null;
  const body = payload as { owner?: unknown; token?: unknown; expiresAt?: unknown; createdAt?: unknown };
  if (typeof body.owner !== "string" || !body.owner) return null;
  if (typeof body.token !== "string" || !body.token) return null;
  if (typeof body.expiresAt !== "number") return null;
  const session: ServerSession = { owner: body.owner, token: body.token, expiresAt: body.expiresAt };
  if (typeof body.createdAt === "string") session.createdAt = body.createdAt;
  return session;
}

/**
 * @section surface — the five calls the entry surfaces ride, one per
 * account route. Every call answers the verdict union; the offline branch
 * is the lane-absent branch, never a disguised refusal.
 */

/** normalizeaccountowner — the client twin of the lane normalization: the
 * display handle becomes the owner shape or the empty answer refuses. */
export function normalizeaccountowner(value: string): string {
  const cleaned = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return ACCOUNTPATTERN.test(cleaned) ? cleaned : "";
}

/** createserveraccount — POST /api/v1/accounts: the real account creation
 * with the family session issued in the same answer. */
export async function createserveraccount(owner: string, secret: string): Promise<AccountVerdict> {
  const answer = await accountfetch("/api/v1/accounts", {
    method: "POST",
    body: JSON.stringify({ owner, secret }),
  });
  if (!answer) return { verdict: "offline" };
  const session = answer.status === 201 ? sessionof(answer.payload) : null;
  if (session) return { verdict: "ok", session };
  return { verdict: "refused", error: errorof(answer.payload) };
}

/** signinserveraccount — POST /api/v1/accounts/session: the password
 * entry against the lane. */
export async function signinserveraccount(owner: string, secret: string): Promise<AccountVerdict> {
  const answer = await accountfetch("/api/v1/accounts/session", {
    method: "POST",
    body: JSON.stringify({ owner, secret }),
  });
  if (!answer) return { verdict: "offline" };
  const session = answer.status === 200 ? sessionof(answer.payload) : null;
  if (session) return { verdict: "ok", session };
  return { verdict: "refused", error: errorof(answer.payload) };
}

/** exchangeoauthcode — POST /api/v1/auth/exchange: the callback page
 * redeems the provider code through the gateway wave. */
export async function exchangeoauthcode(
  provider: string,
  code: string,
  verifier: string,
  redirectUri: string,
): Promise<AccountVerdict> {
  const answer = await accountfetch("/api/v1/auth/exchange", {
    method: "POST",
    body: JSON.stringify({ provider, code, verifier, redirectUri }),
  });
  if (!answer) return { verdict: "offline" };
  const session = answer.status === 201 ? sessionof(answer.payload) : null;
  if (session) return { verdict: "ok", session };
  return { verdict: "refused", error: errorof(answer.payload) };
}

/** accountsessionstate — GET /api/v1/accounts/session with the stored
 * bearer: the live family session of this browser, or null. */
export async function accountsessionstate(): Promise<AccountSessionState | null> {
  const bearer = accountbearer();
  if (!bearer) return null;
  const answer = await accountfetch("/api/v1/accounts/session", {
    headers: { authorization: ["Bearer ", bearer].join("") },
  });
  if (!answer || answer.status !== 200 || !answer.payload || typeof answer.payload !== "object") return null;
  const body = answer.payload as { owner?: unknown; createdAt?: unknown; expiresAt?: unknown };
  if (typeof body.owner !== "string" || typeof body.createdAt !== "string" || typeof body.expiresAt !== "number") {
    return null;
  }
  return { owner: body.owner, createdAt: body.createdAt, expiresAt: body.expiresAt };
}

/** revokeaccountsessionbearer — DELETE /api/v1/accounts/session with the
 * stored bearer: the sign out of the family for this browser. */
export async function revokeaccountsessionbearer(): Promise<boolean> {
  const bearer = accountbearer();
  if (!bearer) return false;
  const answer = await accountfetch("/api/v1/accounts/session", {
    method: "DELETE",
    headers: { authorization: ["Bearer ", bearer].join("") },
  });
  return answer !== null && answer.status === 200;
}

/**
 * @section storage — the family session slots the pages read and clear.
 */

/** saveaccountsession — park the family session the lane issued. */
export function saveaccountsession(token: string, owner: string): void {
  try {
    window.sessionStorage.setItem(ACCOUNT_TOKEN_KEY, token);
    window.sessionStorage.setItem(ACCOUNT_OWNER_KEY, owner);
  } catch {
    /* storage unavailable: the session lives for this page load only */
  }
}

/** clearaccountsession — drop the parked family session (after a revoke). */
export function clearaccountsession(): void {
  try {
    window.sessionStorage.removeItem(ACCOUNT_TOKEN_KEY);
    window.sessionStorage.removeItem(ACCOUNT_OWNER_KEY);
  } catch {
    /* storage unavailable */
  }
}

/** accountbearer — the stored bearer, or the empty answer when absent. */
export function accountbearer(): string {
  try {
    const token = window.sessionStorage.getItem(ACCOUNT_TOKEN_KEY) || "";
    return BEARERPATTERN.test(token) ? token : "";
  } catch {
    return "";
  }
}

/** storedaccountowner — the owner handle of the last family session. */
export function storedaccountowner(): string {
  try {
    return window.sessionStorage.getItem(ACCOUNT_OWNER_KEY) || "";
  } catch {
    return "";
  }
}
