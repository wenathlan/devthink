/**
 * authgate.ts — the pure guards of the authentication flow (root-free, side-
 * effect-free, unit-tested in tests/auth.flow.test.ts). The page-app itself
 * (auth.tsx) mounts its forms on the session mechanisms that ALREADY exist:
 * the browser-local identity (IndexedDB through db.ts — display name only,
 * no remote authentication) and the opt-in local CLI pairing
 * (POST /pairings/consume — the same gateway contract the panel uses).
 */

/**
 * Resolves the post-session redirect of the auth page. The default lands on
 * the creation panel; a ?next= override is honored ONLY for same-origin
 * absolute paths (a single leading slash, no protocol-relative form, no
 * backslash or whitespace trickery) — anything else falls back, so a crafted
 * link can never bounce the visitor off the site.
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

export type PairingReadiness = {
  /** true when every field of the local pairing is filled correctly */
  ready: boolean;
  /** the fields still missing or malformed ("gateway", "pairing", "code") */
  missing: string[];
};

/**
 * Validates the fields of the local CLI pairing before the page ever calls
 * the gateway: the gateway URL must be non-empty, the pairing id non-empty
 * and the invitation code exactly 8 characters.
 *
 * @param input the raw form fields.
 * @returns the readiness verdict plus the missing field names.
 */
export function pairingReadiness(input: { gatewayUrl: string; pairingId: string; code: string }): PairingReadiness {
  const missing: string[] = [];
  if (!normalizeGateway(input.gatewayUrl)) missing.push("gateway");
  if (!input.pairingId.trim()) missing.push("pairing");
  if (input.code.trim().length !== 8) missing.push("code");
  return { ready: missing.length === 0, missing };
}
