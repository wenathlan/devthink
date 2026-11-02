/**
 * gateway.ts — the ONE keyed file of the gateway family (root layer).
 *
 * The owner's law: every family of correlated logic lives in one keyed file
 * with a name that says the family. This file carries the whole gateway
 * family of the platform — the opt-in gateway contract, the entry-guards of
 * the pairing input, the browser pairing client, the view-side structural
 * contract of the gateway catalog, the ONE lane-client seam every browser
 * lane client rides, the sandbox and storage-usage lane clients, the shared
 * compatibility primitives, the deployment base and the base-aware history
 * path — merged from nine root modules (gatewaybase.ts, authgate.ts,
 * gateway.ts, gatewayviewdefinition.ts, sandboxclient.ts,
 * storageusageclient.ts, compatibility.ts, deploybase.ts, routebase.ts)
 * with every export preserved under the same name and signature and the
 * duplicated helpers deduped to one survivor each:
 *
 *   - D7 (the gateway-url normalizer): `normalizeGatewayBase` (§1) is the
 *     ONE all-slashes + scheme-gated survivor the registered-preference
 *     reads ride. The entry-guards' `normalizeGateway` (§2) is a DELIBERATE
 *     twin kept verbatim, not a dedupe miss: it strips exactly ONE trailing
 *     slash and never judges the scheme, a behavior pinned line-for-line by
 *     tests/authflow.test.ts (`"http://127.0.0.1:8787//"` must answer
 *     `"http://127.0.0.1:8787/"` — normalizeGatewayBase would answer
 *     without the second slash), so delegating it to the survivor would
 *     change pinned behavior.
 *   - D8 (the lane-client seam): ONE seam section (§5) — `resolvelane()`
 *     (gatewayContext first, the registered preference second — the exact
 *     resolution order) and `lanefetch()` (bounded fetch with bearer and
 *     timeout, null answer on every failure mode). The three lane clients
 *     keep their thin typed wrappers so their verdict unions stay: the
 *     sandbox client (§6) and the storage-usage client (§7) live here, and
 *     the account client (account.ts §6) imports the same seam.
 *
 * The one deliberate exclusion: gatewayconfig.ts stays a file of its own.
 * It is not an imported module but a runtime-discovered CONFIG FILE — the
 * loadconfig() candidate chain (config.ts / server.ts) probes the literal
 * file name `gatewayconfig.ts` on disk, and tests/server/server.e2e.test.ts
 * writes its own fixture under that name — so merging or deleting it would
 * change runtime behavior, which the family law forbids.
 *
 * @section 1  gatewaybase — the ONE opt-in gateway contract of the chat
 * @section 2  authgate — the pure guards of the entry flow
 * @section 3  gateway — the browser-side gateway pairing client
 * @section 4  gatewayviewdefinition — the view-side gateway catalog contract
 * @section 5  laneclient — the ONE lane-client seam (resolvelane, lanefetch)
 * @section 6  sandboxclient — the browser client of the sandbox lane
 * @section 7  storageusageclient — the browser client of the storage usage route
 * @section 8  compatibility — the shared wire compatibility primitives
 * @section 9  deploybase — the deployment base of the running application
 * @section 10 routebase — the base-aware history path of the one interface
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { readBrowserPreferences, saveBrowserPreference } from "./storage.ts";
import { chatText } from "./chatlabels.ts";

/* ============================================================================
 * @section 1 — gatewaybase: the ONE opt-in gateway contract of the chat.
 * ========================================================================== */

/**
 * gatewaybase — the ONE gateway opt-in contract of the Sol theme, shared by
 * the chat session panel and the settings page. The owner's order is
 * explicit: registering a gateway is opt-in. The natural chat state is
 * disconnected, the endpoint is never inferred, auto-detected or pre-filled,
 * and the saved browser preference (PREF_GATEWAYBASE) IS the persisted
 * opt-in — replaying a stored registration is allowed because the person
 * opted in before. Every registration runs a real, lightweight reachability
 * probe (GET /v1/models) so "registered" always means "answered".
 *
 * Zero fetch logic for chat rounds lives here — conversations keep going
 * through gatewayChat (osgateway.ts); this section only owns the endpoint
 * contract: normalization, validation, probe and the registration hook.
 */

/** The preference key of the registered gateway base (empty = not registered). */
export const PREF_GATEWAYBASE = "chat.gatewaybase";

/** The honest disconnected line — the default copy of the opt-in surfaces. */
export const GATEWAY_REQUIRED_COPY = chatText("gw.notRegistered");

/** The direct one-line notice the composer shows while disconnected. */
export const GATEWAY_SEND_NOTICE = chatText("gw.notRegistered");

/**
 * normalizeGatewayBase — trims the stored endpoint and strips trailing
 * slashes; accepts only http(s) absolute origins. Anything else falls back
 * to "" (not registered). Kept compatible with previously stored values.
 * The ONE survivor of the gateway-url normalizer twins (D7): the registered
 * preference reads of the lane seam (§5) ride this one.
 */
export function normalizeGatewayBase(raw: string): string {
  const clean = raw.trim().replace(/\/+$/, "");
  if (clean === "") return "";
  return /^https?:\/\//.test(clean) ? clean : "";
}

/**
 * isLocalHttpHost — the hosts for which plain http:// is accepted at
 * registration: loopback, RFC1918/link-local addresses, .local / .localhost
 * names and single-label LAN hostnames. Remote gateways must use https.
 */
function isLocalHttpHost(host: string): boolean {
  const h = host.toLowerCase().replace(/\.$/, "");
  if (h === "localhost" || h.endsWith(".localhost") || h.endsWith(".local")) return true;
  if (h === "[::1]" || h === "::1" || h === "[::]") return true;
  if (!h.includes(".") && !h.includes(":") && h !== "") return true; // single-label LAN name
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(h)) {
    const [a, b] = h.split(".").map(Number);
    if (a === 127 || a === 10 || a === 0) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 169 && b === 254) return true;
  }
  return false;
}

export type GatewayEndpointCheck = { ok: true; base: string } | { ok: false; reason: string };

/**
 * validateGatewayEndpoint — the strict opt-in validator, shared by every
 * register form. It enforces the form of the endpoint: absolute http(s) url,
 * http only for local addresses, a host present and no doubled slash carried
 * into the registration. Returns the normalized base on success.
 */
export function validateGatewayEndpoint(raw: string): GatewayEndpointCheck {
  const clean = raw.trim().replace(/\/+$/, "");
  if (clean === "") return { ok: false, reason: "Enter the gateway base url you want to register." };
  let url: URL;
  try {
    url = new URL(clean);
  } catch {
    return { ok: false, reason: "Enter an absolute url — start with https:// (or http:// for a local gateway)." };
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return { ok: false, reason: "Only https:// (or http:// for a local gateway) is accepted." };
  }
  if (!url.hostname) return { ok: false, reason: "The url is missing a host." };
  if (url.protocol === "http:" && !isLocalHttpHost(url.hostname)) {
    return { ok: false, reason: "http:// is only accepted for local addresses — use https:// for a remote gateway." };
  }
  if (clean.replace(/^https?:\/\//, "").includes("//")) {
    return { ok: false, reason: "The url carries a doubled slash — fix it and register again." };
  }
  return { ok: true, base: clean };
}

/* --------------------------------- probe ------------------------------- */

export type GatewayProbe = { ok: true } | { ok: false; reason: string };

/**
 * probeGatewayBase — the lightweight real test behind every registration:
 * GET {base}/v1/models with a short AbortController timeout. It classifies
 * the endpoint honestly (answered / unreachable / timeout / http error) so
 * the UI never claims a connection it did not verify. It does not touch the
 * chat-completions fetch of osgateway.ts.
 */
export async function probeGatewayBase(base: string, timeoutMs = 6_000): Promise<GatewayProbe> {
  const target = normalizeGatewayBase(base);
  if (!target) return { ok: false, reason: "no gateway base is registered" };
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${target}/v1/models`, {
      signal: ctrl.signal,
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return {
        ok: false,
        reason: `the gateway answered ${res.status}${detail ? ` — ${detail.slice(0, 140)}` : ""}`,
      };
    }
    return { ok: true };
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return { ok: false, reason: `the gateway did not answer within ${Math.round(timeoutMs / 1000)}s` };
    }
    return { ok: false, reason: "could not reach the gateway (network error or CORS blocked)" };
  } finally {
    clearTimeout(timer);
  }
}

/* --------------------------------- hook -------------------------------- */

/** The four visible states of the opt-in machine. */
export type GatewayStatus = "disconnected" | "connecting" | "connected" | "error";

/**
 * gatewayStatusLabel — the pill label of each state, shared by the session
 * panel and the settings card so both surfaces read the same.
 */
export function gatewayStatusLabel(status: GatewayStatus): string {
  switch (status) {
    case "connected":
      return "connected";
    case "connecting":
      return "testing";
    case "error":
      return "unreachable";
    default:
      return "not connected";
  }
}

/**
 * useGatewayRegistration — the state machine of the opt-in contract:
 * - disconnected (default): no base, nothing is called.
 * - register(raw): validates, persists the preference (the opt-in) and
 *   probes the endpoint for real → connected | error.
 * - retryProbe: re-runs the probe against the registered base.
 * - disconnect: clears the preference and returns to disconnected.
 * A stored base loads as connected (replay of a previous opt-in).
 */
export function useGatewayRegistration() {
  const [base, setBase] = useState("");
  const [status, setStatus] = useState<GatewayStatus>("disconnected");
  const [formError, setFormError] = useState<string | null>(null);
  const [probeError, setProbeError] = useState<string | null>(null);
  /** ticket counter — stale probes never overwrite a newer user decision. */
  const run = useRef(0);

  useEffect(() => {
    let alive = true;
    readBrowserPreferences()
      .then((prefs) => {
        if (!alive) return;
        const stored = normalizeGatewayBase(prefs[PREF_GATEWAYBASE] ?? "");
        setBase(stored);
        setStatus(stored ? "connected" : "disconnected");
      })
      .catch(() => {
        /* the preference store is optional; the chat stays disconnected */
      });
    return () => {
      alive = false;
    };
  }, []);

  /** register — the opt-in itself: validate, persist, then classify by probe. */
  const register = useCallback(async (raw: string): Promise<boolean> => {
    const check = validateGatewayEndpoint(raw);
    if (!check.ok) {
      setFormError(check.reason);
      return false;
    }
    const ticket = ++run.current;
    setFormError(null);
    setProbeError(null);
    setStatus("connecting");
    try {
      await saveBrowserPreference(PREF_GATEWAYBASE, check.base);
    } catch {
      /* the preference store is optional; the registration holds for this visit */
    }
    if (ticket !== run.current) return true;
    setBase(check.base);
    const probe = await probeGatewayBase(check.base);
    if (ticket !== run.current) return true;
    if (probe.ok) setStatus("connected");
    else {
      setStatus("error");
      setProbeError(probe.reason);
    }
    return true;
  }, []);

  /** retryProbe — re-runs the reachability test for the registered base. */
  const retryProbe = useCallback(async () => {
    if (!base) return;
    const ticket = ++run.current;
    setProbeError(null);
    setStatus("connecting");
    const probe = await probeGatewayBase(base);
    if (ticket !== run.current) return;
    if (probe.ok) setStatus("connected");
    else {
      setStatus("error");
      setProbeError(probe.reason);
    }
  }, [base]);

  /** disconnect — the opt-out: clears the persisted registration. */
  const disconnect = useCallback(async () => {
    run.current += 1; // any probe in flight becomes stale
    setBase("");
    setFormError(null);
    setProbeError(null);
    setStatus("disconnected");
    try {
      await saveBrowserPreference(PREF_GATEWAYBASE, "");
    } catch {
      /* the preference store is optional; the disconnect still applies */
    }
  }, []);

  /** clearFormError — dismissed as soon as the visitor edits the field. */
  const clearFormError = useCallback(() => setFormError(null), []);

  return { base, status, formError, probeError, register, retryProbe, disconnect, clearFormError };
}

/** The public shape of the registration machine, for surface props. */
export type GatewayRegistration = ReturnType<typeof useGatewayRegistration>;

/* ============================================================================
 * @section 2 — authgate: the pure guards of the entry flow.
 * ========================================================================== */

/**
 * authgate — the pure guards of the entry flow (root logic, side-effect-
 * free, unit-tested in tests/authflow.test.ts). The authentication page-app
 * (Sol/auth/auth.tsx) rides these guards on the owner entry chain intro →
 * explore → auth → panel: afterAuthTarget resolves the post-session
 * destination (default /panel, a safe same-origin ?next= honored), the
 * opt-in local CLI pairing (POST /pairings/consume — the same gateway
 * contract the panel speaks) validates its fields with pairingReadiness
 * before the page ever calls the gateway, and normalizeGateway cleans the
 * URL the whole shell treats one way.
 */

/**
 * Strips the deploy base prefix a full path may carry so an address answers
 * the router route space the shell navigates. The wouter router of the
 * theme runs under the deploy base (the repository folder of the Pages
 * host, the root of a domain host), and its navigate() joins the base with
 * the route it receives — a full path stored or replayed as a route would
 * double the base segment and land on the not-found page, so every address
 * the guards pass to a navigation walks through this cleaner first.
 *
 * @param path the address to clean: a router route or a full pathname.
 * @param base the deploy base the build answers under, with or without the
 * trailing slash; the root and relative builds (/, ./) strip nothing.
 * @returns the base-relative router route the path always was.
 */
export function routeFromPathname(path: string, base: string = import.meta.env.BASE_URL ?? "/"): string {
  const prefix = base !== "/" && base !== "./" ? base.replace(/\/$/, "") : "";
  if (prefix && path === prefix) return "/";
  if (prefix && path.startsWith(`${prefix}/`)) return path.slice(prefix.length);
  return path;
}

/**
 * Resolves the post-session redirect of the retired auth entry pass. The
 * default lands on the creation panel; a ?next= override is honored ONLY
 * for same-origin absolute paths (a single leading slash, no
 * protocol-relative form, no backslash or whitespace trickery) — anything
 * else falls back, so a crafted link can never bounce the visitor off the
 * site. A safe override that carries the deploy base prefix (the arrival a
 * panel gate of a folder-hosted build once wrote from the full pathname)
 * answers the base-relative route, so the post-session navigation never
 * doubles the base segment the router joins itself.
 *
 * @param search the raw query string the auth page booted with.
 * @returns the internal route to navigate to after a successful session.
 */
export function afterAuthTarget(search: string): string {
  const next = new URLSearchParams(search).get("next");
  if (!next) return "/panel";
  const safe =
    next.startsWith("/") && !next.startsWith("//") && !next.includes("\\") && !/\s/.test(next) && !next.includes("://");
  return safe ? routeFromPathname(next) : "/panel";
}

/** The invitation fields the compat handover passes through to the panel —
 * the exact keys the panel reads on boot to consume a CLI pairing
 * invitation (gatewayFromSearch + the pair/code reader). */
const HANDOVER_QUERY_KEYS: readonly string[] = ["gateway", "pair", "code"];

/**
 * Resolves the silent handover path of the retired /auth entry pass: the
 * guarded post-session target (afterAuthTarget) with the pairing
 * invitation fields passed through untouched, so an invitation link that
 * lands on /auth is consumed by the panel exactly as it always was — no
 * login screen in between, no field rewritten.
 *
 * @param search the raw query string the auth surface booted with.
 * @returns the internal route (with the passthrough query when present).
 */
export function handoverPath(search: string): string {
  const target = afterAuthTarget(search);
  const incoming = new URLSearchParams(search);
  const passthrough = new URLSearchParams();
  for (const key of HANDOVER_QUERY_KEYS) {
    const value = incoming.get(key);
    if (value) passthrough.set(key, value);
  }
  const query = passthrough.toString();
  if (!query) return target;
  return `${target}${target.includes("?") ? "&" : "?"}${query}`;
}

/**
 * Normalizes a gateway URL the way the whole shell treats one: trimmed, with
 * a single trailing slash stripped.
 *
 * The DELIBERATE twin of the D7 survivor `normalizeGatewayBase` (§1), kept
 * verbatim on purpose: this cleaner strips exactly ONE trailing slash and
 * never judges the scheme, a behavior pinned line-for-line by
 * tests/authflow.test.ts (`"http://127.0.0.1:8787//"` answers
 * `"http://127.0.0.1:8787/"`), while the survivor strips every trailing
 * slash and gates the http(s) scheme for the stored preference.
 *
 * @param value the raw gateway input.
 * @returns the cleaned gateway URL (possibly empty).
 */
export function normalizeGateway(value: string): string {
  return value.trim().replace(/\/$/, "");
}

/**
 * Guards a gateway URL before any pairing fetch leaves the page: the value
 * must parse as an absolute http or https url free of embedded credentials,
 * and it answers stripped of its query and fragment — the gateway base is
 * all the contract ever needs. Loopback and private hosts are the product
 * (the pairing targets the visitor's OWN local gateway by design), so the
 * host is never a reason to refuse; the scheme is. A relative input, a
 * whitespace carrier or another scheme (file, ftp, javascript, data) answers
 * undefined, so a crafted link can never turn the pairing surface into an
 * exfiltration primitive.
 *
 * @param value the raw gateway input (a form field or the ?gateway= param).
 * @returns the guarded gateway base url, or undefined when the value is
 * empty or unsafe.
 */
export function safegatewayurl(value: string): string | undefined {
  const cleaned = normalizeGateway(value);
  if (!cleaned || /\s/.test(cleaned)) return undefined;
  let url: URL;
  try {
    url = new URL(cleaned);
  } catch {
    return undefined;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return undefined;
  if (url.username || url.password) return undefined;
  return normalizeGateway(`${url.origin}${url.pathname}`);
}

export type PairingReadiness = {
  /** true when every field of the local pairing is filled correctly */
  ready: boolean;
  /** the fields still missing or malformed ("gateway", "pairing", "code") */
  missing: string[];
};

/**
 * Validates the fields of the local CLI pairing before the page ever calls
 * the gateway: the gateway URL must guard through safegatewayurl (an
 * absolute http or https base, no credentials, no query), the pairing id
 * non-empty and the invitation code exactly 8 characters.
 *
 * @param input the raw form fields.
 * @returns the readiness verdict plus the missing field names.
 */
export function pairingReadiness(input: { gatewayUrl: string; pairingId: string; code: string }): PairingReadiness {
  const missing: string[] = [];
  if (!safegatewayurl(input.gatewayUrl)) missing.push("gateway");
  if (!input.pairingId.trim()) missing.push("pairing");
  if (input.code.trim().length !== 8) missing.push("code");
  return { ready: missing.length === 0, missing };
}

/* ============================================================================
 * @section 3 — gateway: the browser-side gateway pairing client.
 * ========================================================================== */

/**
 * gateway — the browser-side gateway pairing client (root layer).
 *
 * One responsibility: carry the ephemeral pairing context of the local
 * DevThink gateway into the web workbench and put an authorized bearer on
 * every call. the context comes from the `?gateway=` query parameter (the
 * pairing link) or the sessionStorage echo of it; the one-time pairing
 * token lives in sessionStorage under `devthink.pair.token` and never
 * persists to disk — no provider credential is ever stored or sent here.
 * every exported helper is a pure reader of that context except
 * `gatewayJson`, which adds the bearer and json content-type and unwraps
 * non-ok answers into typed errors. the url answers through the
 * safegatewayurl guard (§2 authgate): an absolute http or https base free
 * of credentials and query, so a crafted link can never aim the workbench
 * calls anywhere but a well-formed gateway.
 */

/** The pairing context: gateway base url plus the ephemeral session token. */
export type GatewayContext = { url?: string; token?: string };

/**
 * Reads the pairing context from the query string and sessionStorage echoes.
 *
 * @returns the context with the guarded gateway base url (safegatewayurl) and the ephemeral token; both fields stay absent (never explicit undefined) for exactOptionalPropertyTypes.
 */
export function gatewayContext(): GatewayContext {
  const query = new URLSearchParams(window.location.search);
  const raw = query.get("gateway") || window.sessionStorage.getItem("devthink.gateway") || "";
  const token = window.sessionStorage.getItem("devthink.pair.token") || undefined;
  /** exactOptionalPropertyTypes: never assign an explicit undefined to an optional property */
  const context: GatewayContext = {};
  const url = safegatewayurl(raw);
  if (url !== undefined) context.url = url;
  if (token !== undefined) context.token = token;
  return context;
}

/**
 * Reads just the paired gateway base url.
 *
 * @returns the trimmed base url, or undefined when the page is unpaired.
 */
export function gatewayUrl(): string | undefined {
  return gatewayContext().url;
}

/**
 * Performs one authorized JSON call against the paired local gateway.
 *
 * @param path the gateway path (relative to the paired base url).
 * @param init the optional fetch initializer; headers merge with the bearer and a default json content-type for bodied calls.
 * @returns the parsed JSON answer typed by the caller.
 * @throws when no gateway is paired, or when the gateway answers non-ok.
 */
export async function gatewayJson<T>(path: string, init?: RequestInit): Promise<T> {
  const context = gatewayContext();
  if (!context.url) throw new Error("A local DevThink gateway is not paired.");
  const headers = new Headers(init?.headers);
  if (context.token) headers.set("authorization", `Bearer ${context.token}`);
  if (init?.body && !headers.has("content-type")) headers.set("content-type", "application/json");
  const response = await fetch(`${context.url}${path}`, { ...init, headers });
  if (!response.ok) throw new Error(`Gateway returned ${response.status}.`);
  return response.json() as Promise<T>;
}

/**
 * Answers whether the pairing surface is complete (url + token both present).
 *
 * @returns true when the workbench may call the local gateway with authorization.
 */
export function gatewayReady(): boolean {
  const context = gatewayContext();
  return Boolean(context.url && context.token);
}

/* ============================================================================
 * @section 4 — gatewayviewdefinition: the view-side gateway catalog contract.
 * ========================================================================== */

/**
 * gatewayview definition — the view-side structural contract of the gateway
 * catalog the console page renders.
 *
 * the engine contract (the full gatewaydefinition family of types.ts at the
 * repository root) stays the property of the root library: importing it here
 * would pull the whole engine module graph into the web typecheck. this
 * section carries the projection the shipped v1–v5 catalog (the config.ts of
 * the Sol/gateway page folder) actually exercises, with the field names kept
 * identical to the engine so the two never drift in vocabulary: a field
 * renamed in the engine shows up here as a type error on the catalog the
 * page renders.
 */

/* ── the catalog shapes — field names mirror the root types.ts contract ── */

/** one upstream endpoint: multiple entries enable cross-provider fallback. */
export interface upstreamdef {
  name: string;
  baseurl: string;
  fallback?: string;
}

/** one auth block: the mode, the key sources and the resolution hints. */
export interface authconfig {
  mode: string;
  required: boolean;
  headername?: string;
  keysources?: string[];
  keyurl?: string;
  keyexpiryminutes?: number;
  ipbound?: boolean;
  dbmodel?: string;
  dbtake?: number;
  envvar?: string;
  envseparator?: string;
  keyrotation?: string;
  keylabelformat?: string;
  minkeylength?: number;
  signupurl?: string;
  extraheaders?: Record<string, string>;
}

/** one model catalog entry: identity, windows and the rank the intelligence uses. */
export interface modeldef {
  id: string;
  upstream?: string;
  context: number;
  maxoutput: number;
  vision?: boolean;
  reasoning?: boolean;
  free?: boolean;
  rank?: { score: number; tier: number };
  family?: string;
  chattemplatekwargs?: Record<string, boolean>;
  endpoint?: string;
  nvidiarouted?: boolean;
  exclusive?: boolean;
}

/** the meta model entry: the devthink-masked face a version answers. */
export interface metamodelconfig {
  id: string;
  contextoverride?: number;
  fallbackcontext?: number;
  maxoutput: number;
  maskupstreammodel: boolean;
  alwaysdisplay: boolean;
  pattern?: string;
}

/** the thinking configuration: the levels, the budgets and the 2-calls pattern. */
export interface thinkingconfig {
  defaultlevel: string;
  param?: string;
  budgets?: Record<string, number>;
  twocalls?: { threshold: number; freshresponseguarantee: boolean };
}

/** the model rotation strategy of a version. */
export interface rotationconfig {
  mode: string;
  models: string[];
  everynmessages?: number;
  maxmodelrotations?: number;
  rotateonstatus?: number[];
  rotateontimeout?: boolean;
  staggernewsessions?: boolean;
  sessionstore?: string;
}

/** the retry and backoff policy of a version. */
export interface retryconfig {
  maxretries?: number;
  backoffbasems?: number;
  backoffcapms?: number;
  jitter?: number;
  statuses?: number[];
  nonretryable?: number[];
  fallbackstatuses?: number[];
  fallback?: string;
}

/** the timeout windows of a version. */
export interface timeoutconfig {
  modelswitchintervalms?: number;
  requestms?: number;
  streamms?: number;
}

/** the context and session history policy of a version. */
export interface contextconfig {
  restoresessionhistory?: boolean;
  historylimit?: number;
  truncatemargin?: number;
  percallfallback?: number;
  markshared?: boolean;
  truncate?: boolean;
}

/** the request body building policy of a version. */
export interface bodybuildconfig {
  optionalparamspolicy?: string;
  clampmaxtokens?: boolean;
  maxtokenscap?: number;
}

/** the per-route configuration: the embeddings posture and the paused state. */
export interface routesconfig {
  embeddings?: string;
  embeddingsmessage?: string;
  pausedstatus?: number;
  pausedmessage?: string;
  fallbackroute?: string;
}

/** the user-agent and header configuration of a version. */
export interface headersconfig {
  useragent?: string;
}

/** the transport declaration of a version (the zai-sdk keyless transport and the rest). */
export interface transportconfig {
  type: string;
}

/** one gateway version: one route prefix with its own upstreams and models. */
export interface gatewayconfig {
  id: string;
  name?: string;
  providername: string;
  note?: string;
  paused?: boolean;
  transport?: transportconfig;
  upstreams: upstreamdef[];
  auth: authconfig;
  models: modeldef[];
  defaultmodel?: string;
  metamodel: metamodelconfig;
  thinking?: thinkingconfig;
  bodybuild?: bodybuildconfig;
  routes?: routesconfig;
  headers?: headersconfig;
  rotation?: rotationconfig;
  retry?: retryconfig;
  timeout?: timeoutconfig;
  context?: contextconfig;
}

/** the full gateway definition: a map of version id to version config. */
export interface gatewaydefinition {
  versions: Record<string, gatewayconfig>;
  name?: string;
  description?: string;
}

/* ============================================================================
 * @section 5 — laneclient: the ONE lane-client seam (D8).
 * ========================================================================== */

/**
 * laneclient — the ONE seam every browser lane client rides (D8's single
 * survivor). The former per-client twins — accountlane/accountfetch (the
 * account client of account.ts §6), sandboxlane/sandboxfetch (§6) and
 * usagelane (§7) — carried byte-identical base resolution and a bounded
 * fetch with bearer and timeout; both live here once now.
 *
 * The resolution order is the security seam and NEVER changes: the paired
 * gateway context first (the guarded ?gateway= base of the pairing link
 * plus its ephemeral bearer), then — only when no pairing stands — the
 * chat's registered gateway preference (the explicit opt-in the settings
 * page and the session panel persist through §1). Neither present answers
 * an empty base and the caller falls back without touching the wire.
 *
 * The seam answers the raw Response (or null); each lane client keeps its
 * thin typed wrapper around it so its verdict union stays honest — the
 * wrappers own the ok-check and the body unwrapping, never the transport.
 */

/** LANETIMEOUTMS — the one call bound of every lane client: a lane that has
 * not answered within ten seconds answers null (the caller falls back, the
 * surface never hangs). The former per-client TIMEOUTMS twins (10_000 in
 * sandboxclient, storageusageclient and the account client) ride this one. */
const LANETIMEOUTMS = 10_000;

/**
 * resolvelane — resolve one lane call site: the paired gateway context
 * first (the guarded ?gateway= base of the pairing link plus its bearer),
 * else the chat's registered gateway preference. Neither present answers
 * an empty base and the call falls back without touching the wire.
 */
export async function resolvelane(): Promise<{ base: string; token?: string }> {
  const context = gatewayContext();
  if (context.url) return { base: context.url, token: context.token };
  let registered = "";
  try {
    const prefs = await readBrowserPreferences();
    registered = normalizeGatewayBase(prefs[PREF_GATEWAYBASE] ?? "");
  } catch {
    registered = "";
  }
  /* the same-origin default: the dev server proxies /api to the gateway and
   * the deployed envelope serves the lane beside the app, so an unregistered
   * lane answers through the page's own origin instead of answering offline —
   * a registered base or a pairing context still wins, the empty base rides
   * the relative fetch the browser resolves against this host. */
  return { base: registered };
}

/**
 * lanefetch — one bounded json call against the resolved lane base: the
 * bearer rides when the pairing context carries one, the content-type
 * defaults for bodied calls, the abort controller bounds the wait at
 * LANETIMEOUTMS, and the transport failure modes — no base, network error,
 * timeout — answer null. The ok-check and the body unwrapping stay with the
 * caller's thin typed wrapper (every wrapper turns a non-ok answer into its
 * own null/refused verdict, as it always did).
 */
export async function lanefetch(path: string, init?: RequestInit): Promise<Response | null> {
  const lane = await resolvelane();
  /* the same-origin default rides the relative fetch: the empty base the
   * resolver answers when nothing is registered fetches against this host,
   * where the dev proxy and the deployed envelope both serve the lane —
   * only a registered base or a pairing context redirects elsewhere. */
  const base = lane.base ?? "";
  const headers = new Headers(init?.headers);
  if (lane.token) headers.set("authorization", `Bearer ${lane.token}`);
  if (init?.body && !headers.has("content-type")) headers.set("content-type", "application/json");
  const ctrl = new AbortController();
  const timer = window.setTimeout(() => ctrl.abort(), LANETIMEOUTMS);
  try {
    return await fetch(`${base}${path}`, { ...init, headers, signal: ctrl.signal });
  } catch {
    return null;
  } finally {
    window.clearTimeout(timer);
  }
}

/* ============================================================================
 * @section 6 — sandboxclient: the browser client of the sandbox lane.
 * ========================================================================== */

/**
 * sandboxclient — the browser client of the server-side sandbox lane.
 *
 * The chat sandbox pane stops pretending when a devthink server answers:
 * this section is the one seam between the pane and the real sandbox routes
 * of server.ts — the session boot, the run line, the session file tree and
 * the host modality report. Every call rides the ONE lane-client seam
 * (§5 resolvelane/lanefetch — the former sandboxlane/sandboxfetch twins are
 * deduped into it): the paired gateway context first (the guarded ?gateway=
 * base with its ephemeral bearer), then the chat's registered gateway
 * preference (the explicit opt-in the settings page and the session panel
 * persist). No base, a failed fetch, an aborted timeout, a non-ok status or
 * a wrong-shaped body answers null, so the caller falls back to the
 * browser-pure simulator and declares the fallback instead of pretending.
 * The section keeps no state of its own — no storage, no new dependency, no
 * hardcoded origin.
 */

/**
 * @subsection shapes — the wire contracts of the sandbox routes, mirrored
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

/** SESSIONPATTERN — the session id gate the server routes enforce; the
 * client refuses a malformed id before any wire bytes leave. */
const SESSIONPATTERN = /^[a-z0-9][a-z0-9-]{3,63}$/i;

/** sandboxbody — the thin typed wrapper over the §5 seam's raw response:
 * the json body of an ok answer, or null on every other lane answer (no
 * base, network error, timeout, non-ok status, unreadable body) — the exact
 * verdict the former sandboxfetch carried. */
async function sandboxbody(response: Response | null): Promise<unknown | null> {
  if (!response || !response.ok) return null;
  try {
    return await response.json();
  } catch {
    return null;
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
 * @subsection surface — the four calls the pane rides, one per sandbox
 * route. Every call answers null when no lane stands or the lane does
 * not answer within the bound; the caller owns the fallback.
 */

/** boot — open the server session: post /api/v1/sandbox/session and
 * answer the session rows (the welcome banner of the jail). */
export async function boot(sessionid: string): Promise<string[] | null> {
  if (!SESSIONPATTERN.test(sessionid)) return null;
  const parsed = await sandboxbody(
    await lanefetch("/api/v1/sandbox/session", {
      method: "POST",
      body: JSON.stringify({ sessionId: sessionid }),
    }),
  );
  return rowsanswer(parsed);
}

/** run — dispatch one command line inside the server jail: post
 * /api/v1/sandbox/run and answer the rows, the exit code, the duration
 * and the tool (the honest SandboxAnswer of the lane). */
export async function run(sessionid: string, line: string): Promise<SandboxServerAnswer | null> {
  if (!SESSIONPATTERN.test(sessionid)) return null;
  const parsed = await sandboxbody(
    await lanefetch("/api/v1/sandbox/run", {
      method: "POST",
      body: JSON.stringify({ sessionId: sessionid, line }),
    }),
  );
  return isserveranswer(parsed) ? parsed : null;
}

/** files — the session jail tree: get /api/v1/sandbox/files and answer
 * the tree rows the storage lane walked. */
export async function files(sessionid: string): Promise<string[] | null> {
  if (!SESSIONPATTERN.test(sessionid)) return null;
  const parsed = await sandboxbody(await lanefetch(`/api/v1/sandbox/files?sessionId=${encodeURIComponent(sessionid)}`));
  return rowsanswer(parsed);
}

/** modalities — the honest host report: get /api/v1/sandbox/modalities
 * and answer one row per runner modality of the server host. */
export async function modalities(): Promise<string[] | null> {
  const parsed = await sandboxbody(await lanefetch("/api/v1/sandbox/modalities"));
  return rowsanswer(parsed);
}

/* ============================================================================
 * @section 7 — storageusageclient: the browser client of the storage usage
 * route and the object read/write routes.
 * ========================================================================== */

/**
 * storageusageclient — the browser client of the server storage routes
 * (GET /api/v1/storage/usage?owner=, GET /api/v1/storage/objects?owner=&key=
 * and POST /api/v1/storage/objects).
 *
 * The My Files capacity bar stops guessing when a devthink server answers:
 * this section is the one seam between the explorer and the storage lane of
 * server.ts — the real usage and the plan quota of one owner, one stored
 * object of the owner, and the object write the user actions own. Every call
 * rides the ONE lane-client seam (§5 resolvelane/lanefetch — the former
 * usagelane twin is deduped into it): the paired gateway context first (the
 * guarded ?gateway= base with its ephemeral bearer), then the chat's
 * registered gateway preference (the explicit opt-in the settings page and
 * the session panel persist). No base, a failed fetch, an aborted timeout, a
 * non-ok status or a wrong-shaped body answers null, so the caller falls
 * back to the browser storage estimate and declares the fallback instead of
 * pretending. The object calls keep the three honest outcomes apart — the
 * lane answered, the lane refused, the lane never answered — the same
 * verdict union the account client carries (account.ts §6), because a
 * refused write must never wear the offline mask. The section keeps no
 * state of its own — no storage, no new dependency, no hardcoded origin.
 */

/** OWNERPATTERN — the owner gate the server route enforces; the client
 * refuses a malformed owner before any wire bytes leave. */
const OWNERPATTERN = /^[a-z0-9][a-z0-9-]{5,63}$/i;

/** STORAGEKEYPATTERN — the key gate the server route enforces (relative,
 * dot-free segments, bounded length); the client refuses a malformed key
 * before any wire bytes leave. */
const STORAGEKEYPATTERN = /^[a-z0-9][a-z0-9-]{0,63}(?:\/[a-z0-9][a-z0-9-]{0,63})*$/i;

/** the honest usage answer of one owner: the bytes the lane stores, the
 * object count and the plan quota composed to bytes (the wire carries
 * quotamb — the client keeps the wire shape out of the surfaces). */
export type StorageLaneUsage = { bytes: number; objects: number; quotabytes: number };

/**
 * storageusage — the real usage of one owner against the plan quota: get
 * /api/v1/storage/usage and answer the shape the capacity bar reads. The
 * §5 seam bounds the wait and every failure mode — no base, network error,
 * abort, non-ok status, unreadable body — answers null so the caller falls
 * back to the browser estimate honestly.
 */
export async function storageusage(owner: string): Promise<StorageLaneUsage | null> {
  if (!OWNERPATTERN.test(owner)) return null;
  const response = await lanefetch(`/api/v1/storage/usage?owner=${encodeURIComponent(owner)}`);
  if (!response || !response.ok) return null;
  try {
    return usageshape(await response.json());
  } catch {
    return null;
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

/**
 * @subsection objects — the read and the write of one stored object, the
 * two calls the My Files plan folders ride. The verdict unions keep the
 * honest outcomes apart so the explorer can answer each one with its own
 * line instead of a disguised fallback.
 */

/** one stored object as the read route answers it — the record the lane
 * holds for the owner, content included (the folder registry parses its
 * own body). */
export type StorageLaneRecord = { owner: string; key: string; content: string; bytes: number; updatedAt: string };

/** the honest verdict of one object read: the lane answered the record,
 * the lane answered that the key holds nothing (the absent branch, never
 * an invented record), the lane refused, or the lane never answered. */
export type StorageObjectVerdict =
  | { verdict: "ok"; object: StorageLaneRecord }
  | { verdict: "absent" }
  | { verdict: "refused"; error: string }
  | { verdict: "offline" };

/** the honest verdict of one object write: the lane stored the record (the
 * stored summary it answers), the lane refused (the refusal reason rides),
 * or the lane never answered. */
export type StorageWriteVerdict =
  | { verdict: "ok"; stored: { key: string; bytes: number; updatedAt: string } }
  | { verdict: "refused"; error: string }
  | { verdict: "offline" };

/** storagebody — one bounded json call against the resolved lane base with
 * the status kept beside the payload (the accountclient twist minus the
 * cookie: the storage routes own their visitor through the query and the
 * body, never a session). An answer without json is an absent lane (the
 * static 404 page a plain host answers) — offline, never a disguised
 * refusal. */
async function storagebody(response: Response | null): Promise<{ status: number; payload: unknown } | null> {
  if (!response) return null;
  const payload: unknown = await response.json().catch(() => null);
  if (payload === null) return null;
  return { status: response.status, payload };
}

/** storageerrorof — the honest refusal message of a lane error body. */
function storageerrorof(payload: unknown): string {
  if (payload && typeof payload === "object") {
    const message = (payload as { error?: unknown }).error;
    if (typeof message === "string" && message) return message;
  }
  return "the lane refused the request";
}

/** recordshape — the honest check of the { object } body: the five fields
 * the read route answers, anything else is not a lane answer. */
function recordshape(payload: unknown): StorageLaneRecord | null {
  if (typeof payload !== "object" || payload === null) return null;
  const object = (payload as { object?: unknown }).object;
  if (typeof object !== "object" || object === null) return null;
  const body = object as Record<string, unknown>;
  if (typeof body.owner !== "string" || !body.owner) return null;
  if (typeof body.key !== "string" || !body.key) return null;
  if (typeof body.content !== "string") return null;
  if (typeof body.bytes !== "number" || !Number.isFinite(body.bytes) || body.bytes < 0) return null;
  if (typeof body.updatedAt !== "string" || !body.updatedAt) return null;
  return { owner: body.owner, key: body.key, content: body.content, bytes: body.bytes, updatedAt: body.updatedAt };
}

/** storedshape — the honest check of the { stored } body: the three fields
 * the write route answers, anything else is not a lane answer. */
function storedshape(payload: unknown): { key: string; bytes: number; updatedAt: string } | null {
  if (typeof payload !== "object" || payload === null) return null;
  const stored = (payload as { stored?: unknown }).stored;
  if (typeof stored !== "object" || stored === null) return null;
  const body = stored as Record<string, unknown>;
  if (typeof body.key !== "string" || !body.key) return null;
  if (typeof body.bytes !== "number" || !Number.isFinite(body.bytes) || body.bytes < 0) return null;
  if (typeof body.updatedAt !== "string" || !body.updatedAt) return null;
  return { key: body.key, bytes: body.bytes, updatedAt: body.updatedAt };
}

/**
 * storageobject — one stored object of one owner: get
 * /api/v1/storage/objects with the owner and the key, answering the
 * verdict union the explorer reads. The 404 answer walks the absent branch
 * (the lane stands, the key holds nothing), every other non-ok answer
 * walks refused with the lane's own reason, and no lane at all walks
 * offline — the three outcomes never wear each other's masks.
 */
export async function storageobject(owner: string, key: string): Promise<StorageObjectVerdict> {
  if (!OWNERPATTERN.test(owner)) return { verdict: "refused", error: "invalid owner" };
  if (!STORAGEKEYPATTERN.test(key)) return { verdict: "refused", error: "invalid key" };
  const answer = await storagebody(
    await lanefetch(`/api/v1/storage/objects?owner=${encodeURIComponent(owner)}&key=${encodeURIComponent(key)}`),
  );
  if (!answer) return { verdict: "offline" };
  if (answer.status === 200) {
    const object = recordshape(answer.payload);
    return object ? { verdict: "ok", object } : { verdict: "refused", error: "the lane answered a wrong shape" };
  }
  if (answer.status === 404) return { verdict: "absent" };
  return { verdict: "refused", error: storageerrorof(answer.payload) };
}

/**
 * putstorageobject — the object write of one owner: post
 * /api/v1/storage/objects with the owner, the key and the content — the
 * exact JSON shape the route reads. The write answers the verdict union:
 * the stored summary on the ok branch, the lane's own refusal reason (the
 * quota bound included) on the refused branch, and the absent lane on the
 * offline branch, so the surface answers each one with its honest line.
 */
export async function putstorageobject(owner: string, key: string, content: string): Promise<StorageWriteVerdict> {
  if (!OWNERPATTERN.test(owner)) return { verdict: "refused", error: "invalid owner" };
  if (!STORAGEKEYPATTERN.test(key)) return { verdict: "refused", error: "invalid key" };
  const answer = await storagebody(
    await lanefetch("/api/v1/storage/objects", {
      method: "POST",
      body: JSON.stringify({ owner, key, content }),
    }),
  );
  if (!answer) return { verdict: "offline" };
  if (answer.status === 200) {
    const stored = storedshape(answer.payload);
    return stored ? { verdict: "ok", stored } : { verdict: "refused", error: "the lane answered a wrong shape" };
  }
  return { verdict: "refused", error: storageerrorof(answer.payload) };
}

/* ============================================================================
 * @section 8 — compatibility: the shared wire compatibility primitives.
 * ========================================================================== */

/**
 * compatibility — the shared TypeScript compatibility primitives derived
 * from the converted docs logic. These helpers intentionally exclude
 * browser automation, CAPTCHA handling and credential capture.
 */

/** Identifies the public wire formats normalized by DevThink. */
export type ProviderProtocol = "openai" | "anthropic" | "google";

/** Returns bounded exponential retry timing for a transient request failure. */
export function retryDelay(attempt: number, baseMs = 250, maximumMs = 4_000): number {
  return Math.min(maximumMs, baseMs * 2 ** Math.max(0, attempt));
}

/** Removes a bearer value from an error message before it reaches a terminal or browser surface. */
export function redactProviderError(message: string): string {
  return message.replace(/bearer\s+[^\s]+/gi, "bearer [redacted]").slice(0, 500);
}

/** Accepts a browser origin only when it exactly matches an explicit local configuration entry. */
export function isAllowedOrigin(origin: string | undefined, allowedOrigins: readonly string[] | undefined): boolean {
  return Boolean(origin && allowedOrigins?.includes(origin));
}

/** Verifies that a user-operated synchronization endpoint uses HTTPS. */
export function isSecureRemoteEndpoint(value: string | undefined): boolean {
  try {
    return Boolean(value && new URL(value).protocol === "https:");
  } catch {
    return false;
  }
}

/** Normalizes a static-site base path for repository-scoped GitHub Pages deployments. */
export function normalizeBasePath(value: string | undefined, repository: string): string {
  const candidate = value?.trim() || `/${repository}/`;
  return `/${candidate.replace(/^\/+|\/+$/g, "")}/`;
}

/* ============================================================================
 * @section 9 — deploybase: the deployment base of the running application.
 * ========================================================================== */

/**
 * deploybase — the deployment base of the running application (root
 * layer).
 *
 * the interface is served from many hosts with different mount points: the
 * project pages mount the site under a repository segment, the self-hosted
 * domains mount it at the root, and the other platforms pick their own
 * prefix. two helpers answer that reality:
 *
 * - `derivebase` derives the mount base of this application from a boot
 *   path (pure, node-safe) — the absolute form a host needs to address
 *   this app's own segments from outside.
 * - `familyurl` resolves a FAMILY deploy unit (argan, cadria, …, saddle —
 *   the sibling folders beside this one in the shared repository). the
 *   family contract is relative and identical in every member app: one
 *   "../" ride out of this app's mount segment followed by the sibling
 *   slug. the browser resolves it against the segment the page actually
 *   booted from, so the same call lands on the sibling on the dev server,
 *   on a GitHub Pages project subpath and on a self-hosted domain root —
 *   no build constant, no hardcoded "/<slug>" absolute path. pure and
 *   multi-mode: the same call runs in the browser (the shell navigations)
 *   and in node (the unit tests), with zero storage.
 */

/** derives the mount base of the application from a boot path.
 *
 * @param pathname the live window path (or any path to derive from).
 * @returns the base with no trailing slash; an empty string at the root.
 */
export function derivebase(pathname: string): string {
  let stripped = pathname.replace(/index\.html$/, "").replace(/\/+$/, "");
  /* a session restore boots through the workspace route (/w/...): the mount
   * base ends where that route begins, never inside it. */
  const workspace = stripped.indexOf("/w/");
  if (workspace >= 0) stripped = stripped.slice(0, workspace);
  return stripped;
}

/** the base frozen at module evaluation: the boot pathname is the only path
 * that reflects the mount point — by click time the router may already sit
 * on a restored workspace route. */
let bootbase: string | null = null;

/** reads the mount base of the live document (empty string in node).
 *
 * The build-time base wins when the deploy provides one (the pages build
 * sets VITE_BASE_PATH — it is the true mount point and the boot pathname
 * can never contradict it, because the spa routes it owns — /panel, /chat,
 * a family arrival — are segments of the app, not of the host). The boot
 * pathname answers only when no build base exists (self-hosted roots).
 *
 * @returns the base the application booted under (no trailing slash).
 */
export function deploybase(): string {
  if (typeof window === "undefined") return "";
  if (bootbase === null) {
    const buildbase = import.meta.env.BASE_URL;
    if (buildbase && buildbase !== "/" && buildbase !== "./") {
      bootbase = buildbase.replace(/\/+$/, "");
    } else {
      bootbase = derivebase(window.location.pathname);
    }
  }
  return bootbase;
}

/**
 * Resolves the url of a family deploy unit that shares this origin.
 *
 * The os sits at the family root of whatever site carries it and the family
 * applications ride one segment under that root: the project pages site
 * mounts the os at "/<repository>/" with every member app under
 * "/<repository>/<slug>/", while the dev server and the self hosted domain
 * roots flatten the same tree — the os at "/" and every member app at
 * "/<slug>/". The sibling therefore answers from the family root the
 * running build declares, never from the live route: the build base of
 * the os IS the family root (the pages lane nests the members under the same
 * repository segment the os mounts at), and a baseless build lives at the
 * site root where the members sit one segment deep. The answer is absolute
 * ("/<root>/<slug>/") so the document it rides in — the power clip iframe,
 * a new browser window, a jump entry — lands on the sibling from any route
 * of the os: a page at /panel, a family arrival at /saddle and a fresh
 * deep linked boot on that arrival all ask for the same url, because the
 * resolution never reads the boot pathname (the wall the relative form met
 * on the pages lane: "../<slug>/" rides one level up from the live route,
 * and on the nested pages tree that level is the repository segment's
 * parent — the site root — where no sibling lives, so the power clip asked
 * for "/saddle/" and answered the host's 404). The member apps themselves
 * keep their own verbatim relative recipe ("../<slug>/") — from their
 * nested mounts one level up IS the family root — and this section serves
 * only the os side of the contract. Leading and trailing slashes on the
 * slug are tolerated and never doubled.
 *
 * @param slug the deploy unit segment (the app folder name).
 * @returns the in-site url of the family application ("/<root>/<slug>/").
 */
export function familyurl(slug: string): string {
  const clean = slug.replace(/^\/+|\/+$/g, "");
  const buildbase = import.meta.env.BASE_URL;
  const root = buildbase && buildbase !== "/" && buildbase !== "./" ? buildbase.replace(/\/+$/, "") : "";
  return `${root}/${clean}/`;
}

/* ============================================================================
 * @section 10 — routebase: the base-aware history path of the interface.
 * ========================================================================== */

/**
 * routebase — the base-aware history path of the one interface. The app
 * answers under a project pages subpath on the static hosts, so every raw
 * history write rides the declared vite base: a root-absolute "/panel" break
 * would walk the browser out of the app on a repository host (the site not
 * found page). Pure module, no react, no dom writes.
 */

/** The base the router mounts under: the declared vite base when the build
 * answers under a subpath, empty on a site-root host. */
export function routerbase(): string {
  const declaredBase = import.meta.env.BASE_URL;
  if (declaredBase && declaredBase !== "/" && declaredBase !== "./") {
    return declaredBase.replace(/\/+$/, "");
  }
  if (typeof window === "undefined") return "";
  const bootPath = window.location.pathname.replace(/index\.html$/, "").replace(/\/+$/, "");
  return bootPath;
}

/** One history-safe path: the router path joined onto the base, never a
 * root-absolute url that leaves the app on a subpath host. */
export function historypath(path: string): string {
  const base = routerbase();
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
}
