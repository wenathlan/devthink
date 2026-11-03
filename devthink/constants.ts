/**
 * @file constants.ts
 * @description
 *  The os leaf constants of the devthink ownership split
 *  (wave/ownership.getry): every provider-domain constant family
 *  (antigravity, gemini-cli, cloudcode-pa, opencode, oauth, quota,
 *  fingerprint pools, version chains) moved to the gateway owner as
 *  getry/constants.ts. this module keeps only the generic leaf constants
 *  the os utility module core.ts consumes — the fetch timeout, the jitter
 *  window and the debug-ring limits — so core.ts stays a pure leaf of the
 *  dependency dag (constants.js plus node:* builtins) with no cross-app
 *  import. the gateway imports these six through the published specifier
 *  @wenathlan/devthink/constants; nothing is ever duplicated on either
 *  side.
 */

// ---------------------------------------------------------------------------
// Timeouts and jitter — the generic leaf window of core.ts
// ---------------------------------------------------------------------------

/**
 * Default control-plane fetch timeout (models.ts lineage — canonical of the
 * FETCH_TIMEOUT_MS family; search.ts's 60s content semantic stays local as
 * SEARCH_TIMEOUT_MS and version.ts passes VERSION_FETCH_TIMEOUT_MS (5s)
 * explicitly at its call sites).
 */
export const FETCH_TIMEOUT_MS = 10_000 as const;

export const JITTER_MIN_MS = 0 as const;
export const JITTER_MAX_MS = 80 as const;

// v2.1.15 Phase B: getJitter moved to core.js (generic utility owner);
// streaming/quota/plugin import it from there.

// ---------------------------------------------------------------------------
// Debug ring limits — the DebugLogger bounds of core.ts
// ---------------------------------------------------------------------------

export const DEBUG_LOG_MAX_BYTES = 10 * 1024 * 1024;
export const DEBUG_LOG_RETENTION_DAYS = 7 as const;
export const DEBUG_BUFFER_TUI_LINES = 1000 as const;
