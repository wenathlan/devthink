/**
 * gateway.ts — the browser-side gateway pairing client (root layer).
 *
 * One responsibility: carry the ephemeral pairing context of the local
 * DevThink gateway into the web workbench and put an authorized bearer on
 * every call. the context comes from the `?gateway=` query parameter (the
 * pairing link) or the sessionStorage echo of it; the one-time pairing
 * token lives in sessionStorage under `devthink.pair.token` and never
 * persists to disk — no provider credential is ever stored or sent here.
 * every exported helper is a pure reader of that context except
 * `gatewayJson`, which adds the bearer and json content-type and unwraps
 * non-ok answers into typed Errors.
 */

/** The pairing context: gateway base url plus the ephemeral session token. */
export type GatewayContext = { url?: string; token?: string };

/**
 * Reads the pairing context from the query string and sessionStorage echoes.
 *
 * @returns the context with a trailing-slash-trimmed url and the ephemeral token; both fields stay absent (never explicit undefined) for exactOptionalPropertyTypes.
 */
export function gatewayContext(): GatewayContext {
  const query = new URLSearchParams(window.location.search);
  const url = query.get("gateway") || window.sessionStorage.getItem("devthink.gateway") || undefined;
  const token = window.sessionStorage.getItem("devthink.pair.token") || undefined;
  /** exactOptionalPropertyTypes: never assign an explicit undefined to an optional property */
  const context: GatewayContext = {};
  if (url !== undefined) context.url = url.replace(/\/$/, "");
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
