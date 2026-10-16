/**
 * authgate.ts — the pure guards of the entry flow (root logic, side-effect-
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
 * Resolves the post-session redirect of the retired auth entry pass. The
 * default lands on the creation panel; a ?next= override is honored ONLY
 * for same-origin absolute paths (a single leading slash, no
 * protocol-relative form, no backslash or whitespace trickery) — anything
 * else falls back, so a crafted link can never bounce the visitor off the
 * site.
 *
 * @param search the raw query string the auth page booted with.
 * @returns the internal route to navigate to after a successful session.
 */
export function afterAuthTarget(search: string): string {
  const next = new URLSearchParams(search).get("next");
  if (!next) return "/panel";
  const safe =
    next.startsWith("/") && !next.startsWith("//") && !next.includes("\\") && !/\s/.test(next) && !next.includes("://");
  return safe ? next : "/panel";
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
