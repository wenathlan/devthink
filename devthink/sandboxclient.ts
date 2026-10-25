/**
 * sandboxclient.ts — the browser client of the server-side sandbox lane.
 *
 * The chat sandbox pane stops pretending when a devthink server answers:
 * this module is the one seam between the pane and the real sandbox routes
 * of server.ts — the session boot, the run line, the session file tree and
 * the host modality report. Every call resolves the server base through
 * the gateway machinery the page already carries: the paired gateway
 * context first (the guarded ?gateway= base with its ephemeral bearer),
 * then the chat's registered gateway preference (the explicit opt-in the
 * settings page and the session panel persist). No base, a failed fetch,
 * an aborted timeout, a non-ok status or a wrong-shaped body answers null,
 * so the caller falls back to the browser-pure simulator and declares the
 * fallback instead of pretending. The module keeps no state of its own —
 * no storage, no new dependency, no hardcoded origin.
 */

import { readBrowserPreferences } from "./db.ts";
import { PREF_GATEWAYBASE, normalizeGatewayBase } from "./gatewaybase.ts";
import { gatewayContext } from "./gateway.ts";

/**
 * @section shapes — the wire contracts of the sandbox routes, mirrored
 * from the answers server.ts and sandboxlane.ts emit; the validators turn
 * any other body into the null answer the fallback law reads.
 */

/** one output row of a server sandbox answer (the sandboxlane wire row). */
export type SandboxServerRow = { line: string };

/** the wire answer of one sandbox run line: the rows, the exit code, the
 * duration and the tool that answered (the sandboxlane SandboxAnswer). */
export type SandboxServerAnswer = {
  rows: SandboxServerRow[];
  exitcode: number;
  durationms: number;
  tool: string;
};

/**
 * @section call — the base resolution and the one bounded fetch every
 * surface rides. The timeout bounds the wait, the bearer rides the pairing
 * token when the page carries one, and every failure mode answers null.
 */

/** TIMEOUTMS — the call bound: a lane that has not answered within ten
 * seconds answers null (the caller falls back, the pane never hangs). */
const TIMEOUTMS = 10_000;

/** SESSIONPATTERN — the session id gate the server routes enforce; the
 * client refuses a malformed id before any wire bytes leave. */
const SESSIONPATTERN = /^[a-z0-9][a-z0-9-]{3,63}$/i;

/** sandboxlane — resolve one lane call site: the paired gateway context
 * first (the guarded ?gateway= base of the pairing link plus its bearer),
 * else the chat's registered gateway preference. Neither present answers
 * an empty base and the call falls back without touching the wire. */
async function sandboxlane(): Promise<{ base: string; token?: string }> {
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

/** sandboxfetch — one bounded json call against the resolved lane base:
 * the bearer rides when the pairing context carries one, the abort
 * controller bounds the wait at TIMEOUTMS, and every failure mode — no
 * base, network error, timeout, non-ok status, unreadable body — answers
 * null so the caller falls back honestly. */
async function sandboxfetch(path: string, init?: RequestInit): Promise<unknown | null> {
  const lane = await sandboxlane();
  if (!lane.base) return null;
  const headers = new Headers(init?.headers);
  if (lane.token) headers.set("authorization", `Bearer ${lane.token}`);
  if (init?.body && !headers.has("content-type")) headers.set("content-type", "application/json");
  const ctrl = new AbortController();
  const timer = window.setTimeout(() => ctrl.abort(), TIMEOUTMS);
  try {
    const response = await fetch(`${lane.base}${path}`, { ...init, headers, signal: ctrl.signal });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  } finally {
    window.clearTimeout(timer);
  }
}

/** isstringrows — the honest shape check of a { rows } answer: an array
 * of strings, anything else is not a lane answer. */
function isstringrows(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((row) => typeof row === "string");
}

/** isserveranswer — the honest shape check of a run answer: the four
 * fields the wire contract carries, rows of {line} objects. */
function isserveranswer(value: unknown): value is SandboxServerAnswer {
  if (typeof value !== "object" || value === null) return false;
  const answer = value as Partial<SandboxServerAnswer>;
  if (typeof answer.exitcode !== "number") return false;
  if (typeof answer.durationms !== "number") return false;
  if (typeof answer.tool !== "string") return false;
  if (!Array.isArray(answer.rows)) return false;
  return answer.rows.every(
    (row) => typeof row === "object" && row !== null && typeof (row as SandboxServerRow).line === "string",
  );
}

/** rowsanswer — unwrap a { rows } body into its string rows, or null. */
function rowsanswer(parsed: unknown): string[] | null {
  if (parsed === null || typeof parsed !== "object") return null;
  const rows = (parsed as { rows?: unknown }).rows;
  return isstringrows(rows) ? rows : null;
}

/**
 * @section surface — the four calls the pane rides, one per sandbox
 * route. Every call answers null when no lane stands or the lane does
 * not answer within the bound; the caller owns the fallback.
 */

/** boot — open the server session: post /api/v1/sandbox/session and
 * answer the session rows (the welcome banner of the jail). */
export async function boot(sessionid: string): Promise<string[] | null> {
  if (!SESSIONPATTERN.test(sessionid)) return null;
  const parsed = await sandboxfetch("/api/v1/sandbox/session", {
    method: "POST",
    body: JSON.stringify({ sessionId: sessionid }),
  });
  return rowsanswer(parsed);
}

/** run — dispatch one command line inside the server jail: post
 * /api/v1/sandbox/run and answer the rows, the exit code, the duration
 * and the tool (the honest SandboxAnswer of the lane). */
export async function run(sessionid: string, line: string): Promise<SandboxServerAnswer | null> {
  if (!SESSIONPATTERN.test(sessionid)) return null;
  const parsed = await sandboxfetch("/api/v1/sandbox/run", {
    method: "POST",
    body: JSON.stringify({ sessionId: sessionid, line }),
  });
  return isserveranswer(parsed) ? parsed : null;
}

/** files — the session jail tree: get /api/v1/sandbox/files and answer
 * the tree rows the storage lane walked. */
export async function files(sessionid: string): Promise<string[] | null> {
  if (!SESSIONPATTERN.test(sessionid)) return null;
  const parsed = await sandboxfetch(`/api/v1/sandbox/files?sessionId=${encodeURIComponent(sessionid)}`);
  return rowsanswer(parsed);
}

/** modalities — the honest host report: get /api/v1/sandbox/modalities
 * and answer one row per runner modality of the server host. */
export async function modalities(): Promise<string[] | null> {
  const parsed = await sandboxfetch("/api/v1/sandbox/modalities");
  return rowsanswer(parsed);
}
