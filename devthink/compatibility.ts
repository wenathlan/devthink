/**
 * Shared TypeScript compatibility primitives derived from the converted docs logic.
 * These helpers intentionally exclude browser automation, CAPTCHA handling and credential capture.
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
