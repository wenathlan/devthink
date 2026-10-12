/**
 * gatewaybase.ts — the ONE gateway opt-in contract of the Sol theme, shared
 * by the chat session panel and the settings page. The owner's order is
 * explicit: registering a gateway is opt-in. The natural chat state is
 * disconnected, the endpoint is never inferred, auto-detected or pre-filled,
 * and the saved browser preference (PREF_GATEWAYBASE) IS the persisted
 * opt-in — replaying a stored registration is allowed because the person
 * opted in before. Every registration runs a real, lightweight reachability
 * probe (GET /v1/models) so "registered" always means "answered".
 *
 * Zero fetch logic for chat rounds lives here — conversations keep going
 * through gatewayChat (osgateway.ts); this module only owns the endpoint
 * contract: normalization, validation, probe and the registration hook.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { readBrowserPreferences, saveBrowserPreference } from "../../db";

/* ------------------------------ contract ------------------------------ */

/** The preference key of the registered gateway base (empty = not registered). */
export const PREF_GATEWAYBASE = "chat.gatewaybase";

/** The honest disconnected line — the default copy of the opt-in surfaces. */
export const GATEWAY_REQUIRED_COPY = "No gateway registered. The assistant answers only after you register one.";

/** The direct one-line notice the composer shows while disconnected. */
export const GATEWAY_SEND_NOTICE = "No gateway registered — register one in the session panel to start.";

/**
 * normalizeGatewayBase — trims the stored endpoint and strips trailing
 * slashes; accepts only http(s) absolute origins. Anything else falls back
 * to "" (not registered). Kept compatible with previously stored values.
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

/* -------------------------------- probe ------------------------------- */

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

/* --------------------------------- hook ------------------------------- */

/** The four visible states of the opt-in machine. */
export type GatewayStatus = "disconnected" | "connecting" | "connected" | "error";

/**
 * gatewayStatusLabel — the pill label of each state, shared by the session
 * panel and the settings card so both surfaces read the same.
 */
export function gatewayStatusLabel(status: GatewayStatus): string {
  switch (status) {
    case "connected":
      return "registered";
    case "connecting":
      return "testing";
    case "error":
      return "unreachable";
    default:
      return "not registered";
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
