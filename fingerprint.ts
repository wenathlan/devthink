/**
 * @file fingerprint.ts
 * @module maene/fingerprint
 * @description
 * Anti-detection fingerprint generator mimicking Gemini CLI / Antigravity
 * traffic against cloudcode-pa.googleapis.com (merged superset of the two
 * prior variants).
 *
 * v2.1.15 Phase B: this module is THE single owner of identity masquerade —
 * it absorbed getDynamicUserAgent (+Async), fetchRemoteAntigravityVersion,
 * normalizePlatform/normalizeArch, getXGoogApiClient + X_GOOG_API_CLIENT (+
 * the accurately split X_GOOG_API_CLIENT_GEMINI_CLI snapshot),
 * buildClientMetadata, buildGeminiUserAgent, ua/apiClient (auth lineage),
 * getRandomPlatformString, getGeminiCLIHeaders(WithOptions),
 * getAntigravityHeaders(WithOptions), buildAntagravityHeaders (canonical of
 * the five plugin/project/quota/search/models variants) and the hex/limit
 * utility re-exports from core.js. Raw values stay in constants.ts; generic
 * utilities live in core.js.
 *
 * Merged responsibilities:
 * - OAuth constants, endpoints, 2026 model list
 * - Weighted coherent platform pools (win32/x64, linux/x64, darwin/arm64)
 *   plus a keyed PLATFORM_POOLS record with Go-style amd64 naming
 * - Deterministic FNV-1a hashing for session_id / user_prompt_id
 * - Jitter 0-80ms anti-rate-limit (sync value + async sleep + instance API)
 * - Gemini CLI style User-Agent with google-api-nodejs-client pairing
 * - Antigravity style User-Agent (`antigravity/{version} {os}/{arch}`)
 * - X-Goog-Api-Client generation (simplified and full chains)
 * - Client-Metadata (fixed IDE_UNSPECIFIED form and structured JSON form)
 * - Unified FingerprintGenerator constructor accepting BOTH option shapes:
 *     new FingerprintGenerator({ directory, allowExtendedPlatforms, ... })
 *     new FingerprintGenerator("1.19.2" | "antigravity/1.19.2 darwin/arm64")
 * - defaultFingerprintGenerator singleton + getFingerprintHeaders() wrapper
 *
 * Runtime constraint: only node:* builtins + global fetch/Headers.
 *
 * @license MIT
 */

import * as os from "node:os";
import * as path from "node:path";
import * as crypto from "node:crypto";

// ============================================================================
// Section: Mandatory constants (OAuth bypass context) — identical values are
// imported from the frozen owner constants.ts; divergent local variants are
// kept below with an explicit marker
// ============================================================================

import {
  ANTIGRAVITY_CLI_VERSION_POOL,
  ANTIGRAVITY_CLIENT_METADATA_TEMPLATE,
  ANTIGRAVITY_USER_AGENT_FALLBACK,
  ANTIGRAVITY_VERSION_FALLBACK,
  ANTIGRAVITY_VERSION_REMOTE_URLS,
  ARCH_POOL,
  CLOUDCODE_BASE_URL,
  CURRENT_GAPI_CLIENT_VERSION,
  CURRENT_GEMINI_CLI_VERSION,
  CURRENT_GL_NODE_VERSION,
  FINGERPRINT_IDE_TYPES,
  FINGERPRINT_PLATFORMS,
  FINGERPRINT_PLUGIN_TYPES,
  FINGERPRINT_USER_AGENT_SOURCES,
  GAPI_CLIENT_VERSION_POOL,
  GEMINI_CLI_OAUTH_CLIENT_ID as OAUTH_CLIENT_ID,
  GEMINI_CLI_OAUTH_CLIENT_SECRET as OAUTH_CLIENT_SECRET,
  GEMINI_CLI_SCOPES,
  GEMINI_CLI_VERSION_POOL,
  GL_NODE_VERSION_POOL,
  PLATFORM_POOL,
  PROJECT_FALLBACK,
  VERSION_FETCH_TIMEOUT_MS,
} from "./constants.js";
import type { AntigravityVersion, SupportedArch, SupportedPlatform } from "./constants.js";
export { ANTIGRAVITY_VERSION_FALLBACK, OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET, PROJECT_FALLBACK };

// local variant: diverges from constants (constants.GEMINI_CLI_SCOPES is the 9-scope antigravity set with openid/email/profile/cclog; this is the 3-scope Gemini CLI set — value equals constants.GEMINI_CLI_SCOPES)
/** Scopes required by the Gemini CLI auth flow. */
// v2.1.15 Phase C: GEMINI_CLI_SCOPES (3-scope Gemini CLI set) is constants.js
// GEMINI_CLI_SCOPES — imported from the owner.

/** Base URL for the Cloud Code API (imported from constants.js — canonical owner since v2.1.15 Phase B). */
export { CLOUDCODE_BASE_URL };
export type { AntigravityVersion, SupportedArch, SupportedPlatform };

// local variant: diverges from core (core.ENDPOINTS is the {PROD,DAILY,SANDBOX} base-URL map; this is the full v1internal URL map keyed by RPC name)
/**
 * v1internal endpoints used by Gemini CLI.
 * All POST, requiring OAuth2 auth plus fingerprint headers.
 */
// v2.1.15 Phase D: the method-path map moved to request.ts as API_PATHS;
// this module derives its private copy from the constants.js parts (layer
// rules forbid importing request.js from here).
const FINGERPRINT_API_PATHS = {
  loadCodeAssist: `${CLOUDCODE_BASE_URL}/v1internal:loadCodeAssist`,
} as const;

// v2.1.15 Phase A: MODELS_2026 (the 11-id legacy bypass list) and the
// ModelId2026 union moved to models.ts (MODELS_2026_LEGACY / ModelId2026) —
// imported under the historical name and re-exported so the public surface
// is unchanged.
import { MODELS_2026_LEGACY as MODELS_2026, UA_DEFAULT_MODEL } from "./models.js";
import type { ModelId2026 } from "./models.js";
export { MODELS_2026 };
export type { ModelId2026 };

// ============================================================================
// Section: Platform types - coherent anti-ban pools
// ============================================================================

export type PlatformOS = "win32" | "linux" | "darwin";
export type PlatformArch = "x64" | "arm64";
export type FingerprintType = "gemini-cli" | "antigravity";

/**
 * Supported header generation styles (observer naming for FingerprintType).
 * - antigravity: emulates Antigravity Manager content requests
 * - gemini-cli: emulates Gemini CLI quota pool (includes X-Goog-Api-Client)
 */
export type HeaderStyle = "antigravity" | "gemini-cli";

/** OS name normalized for keyed fingerprint pools. */
export type OsName = "windows" | "darwin" | "linux";

/** Architecture name normalized for keyed fingerprint pools. */
export type ArchName = "amd64" | "arm64" | "x64";

/**
 * Coherent platform profile for the weighted UA pools.
 * Guarantees win32 never pairs with arm64 and that darwin prefers arm64.
 */
export interface PlatformProfile {
  /** Node.js OS identifier, exact `process.platform` value */
  os: PlatformOS;
  /** Node.js architecture identifier */
  arch: PlatformArch;
  /** Formatted string inside the UA parenthesis: "win32; x64" */
  uaSegment: string;
  /** Distribution source - GitHub dominant for coherence */
  source: string;
  /** Randomization weight - darwin arm64 more common among developers */
  weight: number;
}

/**
 * Keyed coherent platform pool entry (Go-style amd64 naming on Windows,
 * matching observed AM traffic).
 */
export interface PlatformPool {
  /** Logical key e.g. "windows/amd64" */
  readonly key: string;
  /** Normalized OS name used in User-Agent */
  readonly os: OsName;
  /** Normalized arch name used in User-Agent */
  readonly arch: ArchName;
  /** Node.js platform identifier */
  readonly nodePlatform: NodeJS.Platform;
  /** Node.js arch identifier */
  readonly nodeArch: string;
  /** Electron/Chrome OS display fragment */
  readonly displayOs: string;
}

/** Map of all known keyed pools. */
export type PoolMap = Record<string, PlatformPool>;

/**
 * Keyed pool record. Windows uses Go-convention amd64 naming to match AM
 * traffic; darwin uses arm64 (Apple Silicon primary for 2026); linux x64.
 */
// local variant: diverges from constants (constants.FINGERPRINT_POOLS is the flat cli/gapi/node/platform pool record; this is the keyed Go-style platform map)
export const PLATFORM_POOLS: PoolMap = {
  "windows/amd64": {
    key: "windows/amd64",
    os: "windows",
    arch: "amd64",
    nodePlatform: "win32",
    nodeArch: "x64",
    displayOs: "Windows_NT",
  },
  "darwin/arm64": {
    key: "darwin/arm64",
    os: "darwin",
    arch: "arm64",
    nodePlatform: "darwin",
    nodeArch: "arm64",
    displayOs: "Darwin",
  },
  "linux/x64": {
    key: "linux/x64",
    os: "linux",
    arch: "x64",
    nodePlatform: "linux",
    nodeArch: "x64",
    displayOs: "Linux",
  },
} as const;

// v2.1.15 Phase B: the weighted PlatformProfile pool renamed from the
// historical name PLATFORM_POOL (which now resolves to the constants.ts raw
// string list ["linux","darwin","win32"] re-exported below). The two
// same-named values had different shapes, so the accurate split keeps each
// semantic under an honest name.
/** Weighted pool of real-world valid combinations. */
export const PLATFORM_PROFILE_POOL: readonly PlatformProfile[] = [
  { os: "linux", arch: "x64", uaSegment: "linux; x64", source: "GitHub", weight: 35 },
  { os: "darwin", arch: "arm64", uaSegment: "darwin; arm64", source: "GitHub", weight: 40 },
  { os: "win32", arch: "x64", uaSegment: "win32; x64", source: "GitHub", weight: 25 },
] as const;

export { PLATFORM_POOL };

export const PLATFORM_POOL_EXTENDED: readonly PlatformProfile[] = [
  { os: "linux", arch: "x64", uaSegment: "linux; x64", source: "GitHub", weight: 30 },
  { os: "darwin", arch: "arm64", uaSegment: "darwin; arm64", source: "GitHub", weight: 35 },
  { os: "darwin", arch: "x64", uaSegment: "darwin; x64", source: "Homebrew", weight: 10 },
  { os: "win32", arch: "x64", uaSegment: "win32; x64", source: "GitHub", weight: 20 },
  { os: "linux", arch: "arm64", uaSegment: "linux; arm64", source: "GitHub", weight: 5 },
] as const;

// ============================================================================
// Section: Version governance fallbacks
// ============================================================================

// ANTIGRAVITY_VERSION_FALLBACK ('1.19.2') is imported from constants.js
// (identical value) and re-exported above.

/** Preferred plugin version for new installs / Client-Metadata payloads. */
export const PLUGIN_VERSION_FALLBACK = "2.1.16";

// ============================================================================
// Section: Version pools - anti-ban randomized OS/version pairs
// (v2.1.15 Phase B: GEMINI_CLI_VERSION_POOL, GL_NODE_VERSION_POOL and
// ANTIGRAVITY_CLI_VERSION_POOL are imported from constants.js — the raw-value
// owner; the former local telemetry copies merged there.)
// ============================================================================

export { ANTIGRAVITY_CLI_VERSION_POOL, GEMINI_CLI_VERSION_POOL, GL_NODE_VERSION_POOL };

export const ANTIGRAVITY_VERSION_POOL = ["1.12.8", "1.12.7", "1.12.5", "1.11.9", "1.11.4"] as const;

// local variant: diverges from constants (constants.GAPI_CLIENT_VERSION_POOL is [9.15.1,9.14.0,9.15.0,9.13.0]; this pool adds 9.14.1 and orders 9.15.0 before 9.14.0)
/** google-api-nodejs-client versions - lockstep with GeminiCLI releases. */
export const GOOGLE_API_CLIENT_VERSION_POOL = ["9.15.1", "9.15.0", "9.14.1", "9.14.0", "9.13.0"] as const;

/** Complementary gax version pool. */
export const GAX_VERSION_POOL = ["5.0.4", "5.0.3", "4.3.6"] as const;

// ============================================================================
// Section: Crypto utilities - FNV-1a + secure random
// (v2.1.15 Phase B: fnv1a32/fnv1a32Hex/fnv1a64/pickRandom/getJitterMs are
// owned by core.js — the former local hex-string fnv1a32 was exactly core's
// fnv1a32Hex under the legacy name, so this module now imports and
// re-exports the canonical bindings.)
// ============================================================================

import { fnv1a32, fnv1a32Hex, fnv1a64, getJitterMs, pickRandom } from "./core.js";

export { fnv1a32, fnv1a32Hex, fnv1a64, getJitterMs, pickRandom };

// v2.1.16: the private fnv1a32Num was deleted — its output was verified
// byte-identical to core.fnv1a32 over ascii/non-ascii/empty/long inputs (same
// UTF-16 code-unit FNV-1a); the instance helpers below now delegate to the
// core import directly.

/**
 * Raw numeric 64-bit FNV-1a over UTF-16 code units.
 * Divergence from core.fnv1a64 (kept deliberately): the core export computes
 * the same digest but returns it as a 16-char zero-padded hex string, while
 * this private returns the bigint form because the instance helpers format
 * and slice it themselves.
 */
function fnv1a64Big(input: string): bigint {
  let hash = 14695981039346656037n;
  const prime = 1099511628211n;
  for (let i = 0; i < input.length; i++) {
    hash ^= BigInt(input.charCodeAt(i));
    hash = (hash * prime) & 0xffffffffffffffffn;
  }
  return hash;
}

/**
 * Generates a deterministic session_id based on the current directory.
 * Same folder => same session_id => avoids device-hopping flags.
 *
 * @param directory - base path (defaults to process.cwd())
 */
export function generateSessionUuid(directory?: string): string {
  const dir = directory ?? process.cwd() ?? os.homedir();
  const normalized = path.resolve(dir).toLowerCase();
  const shortHash = fnv1a32Hex(normalized);
  const longHash = fnv1a64(normalized + "|antigravity");
  // Pseudo-UUID deterministic format, not reversible.
  return `${shortHash.slice(0, 8)}-${longHash.slice(0, 4)}-${longHash.slice(4, 8)}-${longHash.slice(8, 12)}-${longHash.slice(12, 16)}${shortHash.slice(0, 4)}`;
}

/**
 * Secure random float in [0,1) using crypto.randomInt with Math.random fallback.
 */
export function secureRandom(): number {
  try {
    return crypto.randomInt(0, 1_000_000) / 1_000_000;
  } catch {
    return Math.random();
  }
}

/** Picks a random element honoring optional weights. */
export function pickRandomWeighted<T extends { weight: number }>(pool: readonly T[]): T {
  const total = pool.reduce((s, p) => s + p.weight, 0);
  let r = secureRandom() * total;
  for (const item of pool) {
    if (r < item.weight) return item;
    r -= item.weight;
  }
  return pool[pool.length - 1] as T;
}

/**
 * Async jitter SLEEP in [minMs, maxMs] for anti-rate-limit / anti-ban delays
 * (renamed from `jitter` in v2.1.15 Phase B: core.js owns the sync `jitter`
 * number draw, so this async sleep variant carries an accurate distinct name).
 */
export async function jitterSleep(minMs = 0, maxMs = 80): Promise<void> {
  const delta = maxMs - minMs;
  const wait = minMs + Math.floor(secureRandom() * (delta + 1));
  if (wait <= 0) return;
  await new Promise<void>((res) => setTimeout(res, wait));
}

// ============================================================================
// Section: Identity masquerade families (v2.1.15 Phase B absorption)
// — getDynamicUserAgent (constants/models/plugin/quota), buildGeminiUserAgent
// (auth/config), buildClientMetadata (constants/quota/request/search),
// getXGoogApiClient + X_GOOG_API_CLIENT (constants), ua/apiClient (auth),
// getGeminiCLIHeaders/getAntigravityHeaders (constants/plugin),
// buildAntagravityHeaders (models/plugin/project/quota/search) and
// getRandomPlatformString (constants) all live HERE now — the single home of
// identity/UA/header masquerade logic. Raw values stay in constants.ts.
// ============================================================================

/**
 * Normalizes a Node platform identifier for UA emission (identity-form
 * canonical: darwin/win32/linux pass through; exotic values pass through
 * unchanged as well — this is a stable lowercase identity map, not a filter).
 */
export function normalizePlatform(p: string): string {
  switch (p) {
    case "darwin":
      return "darwin";
    case "win32":
      return "win32";
    case "linux":
      return "linux";
    default:
      return p;
  }
}

/**
 * Normalizes a Node arch identifier for UA emission
 * (arm64/x64/ia32 identity; exotic values pass through unchanged).
 */
export function normalizeArch(a: string): string {
  switch (a) {
    case "arm64":
      return "arm64";
    case "x64":
      return "x64";
    case "ia32":
      return "ia32";
    default:
      return a;
  }
}

/**
 * Dynamic Antigravity User-Agent: `antigravity/{version} {os}/{arch}`.
 * Invalid/absent versions fall back to ANTIGRAVITY_VERSION_FALLBACK.
 * Canonical of the getDynamicUserAgent family (v2.1.15 Phase B: the
 * constants.ts, models.ts, plugin.ts and quota.ts locals deleted; the
 * async version.ts GeminiCLI-template variant stays in version.ts under its
 * own accurate name because it is a semantically distinct async builder).
 */
export function getDynamicUserAgent(version?: string, opts?: { os?: string; arch?: string }): string {
  const ver = (version && /^\d+\.\d+\.\d+/.test(version) ? version : ANTIGRAVITY_VERSION_FALLBACK).trim();
  const plat = normalizePlatform(opts?.os ?? os.platform());
  const arc = normalizeArch(opts?.arch ?? os.arch());
  return `antigravity/${ver} ${plat}/${arc}`;
}

/**
 * Async dynamic Antigravity User-Agent — resolves the remote Antigravity
 * version when no cached version qualifies, then builds the UA via
 * {@link getDynamicUserAgent}. (Absorbed from constants.ts in v2.1.15
 * Phase B; version.ts's own remote chain remains the version-detection
 * owner and may dedupe with {@link fetchRemoteAntigravityVersion} later.)
 */
export async function getDynamicUserAgentAsync(cachedVersion?: string): Promise<string> {
  if (cachedVersion && /^\d+\.\d+\.\d+/.test(cachedVersion)) {
    return getDynamicUserAgent(cachedVersion);
  }
  try {
    const latest = await fetchRemoteAntigravityVersion();
    if (latest) return getDynamicUserAgent(latest);
  } catch { /* the guarded best-effort operation falls through: the outer flow owns the failure */ }
  return getDynamicUserAgent();
}

/**
 * Fetches the latest Antigravity version across the known update sources
 * (absorbed from constants.ts in v2.1.15 Phase B). Returns null when every
 * source fails; never throws.
 */
export async function fetchRemoteAntigravityVersion(): Promise<string | null> {
  const controller = new AbortController();
  const to = setTimeout(() => controller.abort(), VERSION_FETCH_TIMEOUT_MS);
  try {
    for (const url of ANTIGRAVITY_VERSION_REMOTE_URLS) {
      try {
        const res = await fetch(url, {
          signal: controller.signal,
          headers: { Accept: "application/json", "User-Agent": ANTIGRAVITY_USER_AGENT_FALLBACK },
        });
        if (!res.ok) continue;
        const json = (await res.json()) as any;
        if (json?.version && /^\d+\.\d+\.\d+/.test(json.version)) return json.version;
        if (json?.tag_name) {
          const m = String(json.tag_name).match(/(\d+\.\d+\.\d+)/);
          if (m) return m[1] ?? null;
        }
        if (json?.latest && /^\d+\.\d+\.\d+/.test(json.latest)) return json.latest;
      } catch {
        continue;
      }
    }
    return null;
  } finally {
    clearTimeout(to);
  }
}

/**
 * Builds the antigravity-style X-Goog-Api-Client chain:
 * `antigravity/{version} gl-node/{node} gax/4.9.0 grpc/1.14.0`.
 * Canonical of the getXGoogApiClient family (constants.ts lineage — the same
 * chain request.ts's buildApiClient and plugin.ts's buildCommonHeaders
 * compose inline; the bare `gl-node/22.19.0` snapshot has its own accurate
 * name below).
 */
export function getXGoogApiClient(version?: string): string {
  const ver = version ?? ANTIGRAVITY_VERSION_FALLBACK;
  const nodeVer = process.versions.node;
  return `antigravity/${ver} gl-node/${nodeVer} gax/4.9.0 grpc/1.14.0`;
}

/**
 * Canonical X_GOOG_API_CLIENT computed value — the dynamic
 * {@link getXGoogApiClient} result (v2.1.15 Phase B: the constants.ts
 * computed export moved here; the static "gl-node/22.19.0" copies in
 * config/project/recovery/request/streaming were NOT the same value and
 * keep their exact wire behavior through the accurately named
 * {@link X_GOOG_API_CLIENT_GEMINI_CLI}).
 */
export const X_GOOG_API_CLIENT: string = getXGoogApiClient();

/**
 * Bare gl-node X-Goog-Api-Client snapshot observed on real Gemini CLI
 * traffic (`gl-node/22.19.0`). Distinct value from {@link X_GOOG_API_CLIENT}
 * — the former static "stale" copies in project.ts, quota.ts, request.ts,
 * streaming.ts, recovery.ts, accounts.ts and config.ts resolve HERE so every
 * live chain keeps sending exactly the bytes it sent before the merge.
 */
export const X_GOOG_API_CLIENT_GEMINI_CLI = `gl-node/${CURRENT_GL_NODE_VERSION ?? "22.19.0"}` as const;

/**
 * Builds the Antigravity Client-Metadata header string — the quota.ts
 * lineage (live-validated quota chain): uppercase platform/arch,
 * pluginVersion taken from the constants template, osVersion before arch.
 * Canonical of the buildClientMetadata family (v2.1.15 Phase B: the
 * constants.ts, quota.ts, request.ts and search.ts locals deleted).
 */
export function buildClientMetadata(version?: string): string {
  const ver = version ?? ANTIGRAVITY_VERSION_FALLBACK;
  const plat = normalizePlatform(os.platform()).toUpperCase();
  const arch = normalizeArch(os.arch()).toUpperCase();
  const parts = [
    `ideType=${ANTIGRAVITY_CLIENT_METADATA_TEMPLATE.ideType}`,
    `platform=${plat}`,
    `ideVersion=${ver}`,
    `pluginVersion=${ANTIGRAVITY_CLIENT_METADATA_TEMPLATE.pluginVersion}`,
    `osVersion=${os.release()}`,
    `arch=${arch}`,
  ];
  return parts.join(",");
}

/**
 * Builds the GeminiCLI User-Agent dynamically, varying the platform:
 * `GeminiCLI/<cliVersion>/<model> (<platform>; <arch>; GitHub)
 * google-api-nodejs-client/<gclientVersion>`. Canonical of the
 * buildGeminiUserAgent family (v2.1.15 Phase B: config.ts lineage body —
 * overrides accepted; the auth.ts win32->"windows" mapping is expressed by
 * auth.ts passing the pre-mapped platform, so one implementation serves
 * both historical call shapes).
 */
export function buildGeminiUserAgent(overrides?: {
  cliVersion?: string;
  model?: string;
  platform?: string;
  arch?: string;
  gclientVersion?: string;
}): string {
  const cliVersion = overrides?.cliVersion ?? CURRENT_GEMINI_CLI_VERSION;
  const model = overrides?.model ?? UA_DEFAULT_MODEL;
  const platform = overrides?.platform ?? normalizePlatform(os.platform());
  const arch = overrides?.arch ?? normalizeArch(os.arch());
  const gclientVersion = overrides?.gclientVersion ?? CURRENT_GAPI_CLIENT_VERSION;

  // Exact format of the real Gemini CLI
  return `GeminiCLI/${cliVersion}/${model} (${platform}; ${arch}; GitHub) google-api-nodejs-client/${gclientVersion}`;
}

/**
 * Antigravity User-Agent short form (auth.ts lineage):
 * `antigravity/{version} {platform}/{arch}`. Thin alias of
 * {@link getDynamicUserAgent} kept under its historical auth surface name;
 * the auth call sites always invoke it without arguments, where the two
 * implementations are byte-identical.
 */
export const ua = (v?: string): string => getDynamicUserAgent(v ?? ANTIGRAVITY_VERSION_FALLBACK);

/**
 * Antigravity X-Goog-Api-Client short form (auth.ts lineage):
 * `antigravity/{version} gl-node/{node} gccl/1.0.0 gax/1.0.0`. Distinct
 * segment chain from {@link getXGoogApiClient} (gccl/gax-1.0.0 vs
 * gax-4.9.0/grpc) — the live auth retrieveQuota path sends exactly this
 * form, so it keeps its own accurate implementation here.
 */
export const apiClient = (v = "1.19.2"): string =>
  `antigravity/${v} gl-node/${process.versions.node} gccl/1.0.0 gax/1.0.0`;

/**
 * Builds a platform string in the format expected by the Gemini CLI
 * User-Agent, e.g. "linux; x64; GitHub" (absorbed from constants.ts in
 * v2.1.15 Phase B).
 */
export function getRandomPlatformString(platformOverride?: SupportedPlatform, archOverride?: SupportedArch): string {
  const plat: SupportedPlatform = platformOverride ?? pickRandom(PLATFORM_POOL);
  const arch: SupportedArch = archOverride ?? pickRandom(ARCH_POOL);

  const source = pickRandom(FINGERPRINT_USER_AGENT_SOURCES);

  // win32 maps to win in the gemini-cli UA
  const uaPlatform = plat === "win32" ? "win32" : plat;
  return `${uaPlatform}; ${arch}; ${source}`;
}

// ---------------------------------------------------------------------------
// Gemini CLI header generators (absorbed from constants.ts)
// ---------------------------------------------------------------------------

export interface GeminiCliHeaderOptions {
  /** model to include in the User-Agent (e.g. gemini-3-pro-preview) */
  model?: string | undefined;
  /** platform override (randomizes / uses process.platform when absent) */
  platform?: SupportedPlatform | undefined;
  /** arch override */
  arch?: SupportedArch;
  /** specific Gemini CLI version to spoof */
  cliVersion?: string;
  /** specific gapi client version */
  gapiVersion?: string;
  /** specific gl-node version */
  glNodeVersion?: string;
  /** access token for Authorization */
  accessToken?: string;
  /** custom ideType */
  ideType?: (typeof FINGERPRINT_IDE_TYPES)[number];
  /** custom platform metadata */
  platformMeta?: (typeof FINGERPRINT_PLATFORMS)[number];
  /** custom pluginType */
  pluginType?: (typeof FINGERPRINT_PLUGIN_TYPES)[number];
}

/**
 * Generates headers identical to the official Gemini CLI for detection
 * bypass (canonical of the family: the richer constants.ts WithOptions
 * lineage; plugin.ts's legacy terminal-platform variant had zero callers
 * and was deleted in v2.1.15 Phase B).
 *
 * @param model - optional, defaults to gemini-3-pro-preview
 * @param platform - optional, randomized with linux bias by default
 */
export function getGeminiCLIHeaders(model?: string, platform?: SupportedPlatform): Record<string, string> {
  // opts-object overload also supported for compat
  return getGeminiCLIHeadersWithOptions({
    model,
    platform,
  });
}

/** Object-style variant, more robust for internal plugin usage. */
export function getGeminiCLIHeadersWithOptions(opts: GeminiCliHeaderOptions = {}): Record<string, string> {
  const {
    model = UA_DEFAULT_MODEL,
    platform,
    arch,
    cliVersion = pickRandom(GEMINI_CLI_VERSION_POOL),
    gapiVersion = pickRandom(GAPI_CLIENT_VERSION_POOL),
    glNodeVersion = pickRandom(GL_NODE_VERSION_POOL),
    accessToken,
    ideType = "IDE_UNSPECIFIED",
    platformMeta = "PLATFORM_UNSPECIFIED",
    pluginType = "GEMINI",
  } = opts;

  const platformString = getRandomPlatformString(platform, arch);

  const userAgent = `GeminiCLI/${cliVersion}/${model} (${platformString}) google-api-nodejs-client/${gapiVersion}`;

  const headers: Record<string, string> = {
    "User-Agent": userAgent,
    "X-Goog-Api-Client": `gl-node/${glNodeVersion}`,
    "Client-Metadata": `ideType=${ideType},platform=${platformMeta},pluginType=${pluginType}`,
    "Content-Type": "application/json",
    Accept: "application/json",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "en-US,en;q=0.9",
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  return headers;
}

/** Headers specialized for Antigravity versioning. */
export interface AntigravityHeaderOptions {
  version?: AntigravityVersion;
  accessToken?: string;
  cliVersion?: string;
  model?: string;
  platform?: SupportedPlatform;
}

export function getAntigravityHeaders(version?: AntigravityVersion | string): Record<string, string> {
  return getAntigravityHeadersWithOptions({ version: version as AntigravityVersion });
}

export function getAntigravityHeadersWithOptions(opts: AntigravityHeaderOptions = {}): Record<string, string> {
  const {
    version = "v1internal" as AntigravityVersion,
    accessToken,
    cliVersion = CURRENT_GEMINI_CLI_VERSION,
    model = UA_DEFAULT_MODEL,
    platform,
  } = opts;

  // Base Gemini CLI headers + antigravity overrides
  const base = getGeminiCLIHeadersWithOptions({
    model,
    platform,
    cliVersion,
  });

  const versionMeta = version === "daily-v1internal" ? "daily" : version === "v1" ? "v1" : "v1internal";

  return {
    ...base,
    "X-Goog-Api-Client": base["X-Goog-Api-Client"] ?? `gl-node/${pickRandom(GL_NODE_VERSION_POOL)}`,
    "X-Antigravity-Version": versionMeta,
    "X-Antigravity-Client": `antigravity-gemini-cli/${cliVersion}`,
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
}

// ---------------------------------------------------------------------------
// Antigravity content header builder (canonical of the five-variant family)
// ---------------------------------------------------------------------------

/**
 * Options for {@link buildAntagravityHeaders} — the canonical of the
 * buildAntagravityHeaders family (v2.1.15 Phase B). The flags preserve each
 * historical variant's exact effective header set:
 * - plugin.ts / project.ts lineage (default): Authorization, Content-Type,
 *   User-Agent + extras;
 * - quota.ts lineage: `accept: true` adds Accept: application/json;
 * - search.ts lineage: `identityHeaders: true` adds X-Goog-Api-Client
 *   (dynamic getXGoogApiClient) and Client-Metadata (buildClientMetadata);
 * - the models.ts strip-variant had zero consumers and was deleted.
 */
export interface AntigravityHeadersOptions {
  userAgent?: string | undefined;
  extra?: Record<string, string>;
  /** Include Accept: application/json (quota/search lineage). Default false. */
  accept?: boolean;
  /** Include X-Goog-Api-Client + Client-Metadata (search lineage). Default false. */
  identityHeaders?: boolean;
}

/**
 * Builds the Antigravity content-request header map (Authorization bearer,
 * JSON content type, dynamic Antigravity UA, optional Accept and bypass
 * identity headers, extras merged last with x-goog-user-project always
 * filtered per the observer requirement).
 */
export function buildAntagravityHeaders(
  accessToken: string,
  opts: AntigravityHeadersOptions = {},
): Record<string, string> {
  const userAgent = opts.userAgent ?? getDynamicUserAgent();
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    "User-Agent": userAgent,
  };
  if (opts.accept) {
    headers["Accept"] = "application/json";
  }
  if (opts.identityHeaders) {
    headers["X-Goog-Api-Client"] = getXGoogApiClient();
    headers["Client-Metadata"] = buildClientMetadata();
  }
  if (opts.extra) {
    for (const [k, v] of Object.entries(opts.extra)) {
      if (!k) continue;
      if (k.toLowerCase() === "x-goog-user-project") continue; // observer strips this header per spec
      headers[k] = v;
    }
  }
  return headers;
}

// ============================================================================
// Section: Main class - unified FingerprintGenerator
// ============================================================================

export interface FingerprintOptions {
  /** Directory for deterministic seed (defaults to cwd) */
  directory?: string;
  /** Allow rare extended platform combos (default false) */
  allowExtendedPlatforms?: boolean;
  /** Pin a specific platform (for tests) */
  fixedPlatform?: PlatformProfile | undefined;
  /** Pin the Gemini CLI version */
  fixedCliVersion?: string | undefined;
  /** Pin the google-api-client version */
  fixedGoogleApiVersion?: string | undefined;
  /** Pin the gl-node version */
  fixedNodeVersion?: string | undefined;
  /**
   * Antigravity app version embedded in observer-style UAs.
   * Accepts bare semver ("1.19.2") or full UA strings
   * ("antigravity/1.19.2 darwin/arm64"); invalid values fall back to
   * ANTIGRAVITY_VERSION_FALLBACK.
   */
  antigravityVersion?: string;
}

export interface FullHeadersResult {
  /** Exact Gemini CLI User-Agent */
  "User-Agent": string;
  /** X-Goog-Api-Client fingerprint */
  "X-Goog-Api-Client": string;
  /** Hardened Client-Metadata */
  "Client-Metadata": string;
  /** Standard Content-Type */
  "Content-Type": string;
  /** Accept */
  Accept: string;
  /** Optional for some endpoints */
  "X-Client-Details"?: string;
  /** Extra metadata for internal debug/tracing */
  __meta: {
    platform: PlatformProfile;
    cliVersion: string;
    googleApiVersion: string;
    glNodeVersion: string;
    gaxVersion: string;
    sessionId: string;
    model: string;
    type: FingerprintType;
    jitterMs: number;
  };
}

/**
 * Anti-detection generator that mimics Gemini CLI exactly while also exposing
 * the observer-style Antigravity header set.
 *
 * Coherence guarantees:
 * - Chosen platform drives the UA segment consistently
 * - Node / gax / google-api-client versions pair like a real release
 * - session_id is deterministic per directory (avoids device hopping)
 * - Observer mode never mutates global state
 *
 * Usage:
 * ```ts
 * const fp = new FingerprintGenerator({ directory: process.cwd() });
 * const headers = fp.getFullHeaders('gemini-3-pro-preview', 'gemini-cli');
 * // or observer style:
 * const fp2 = new FingerprintGenerator('1.19.2');
 * const h2 = fp2.getFingerprintHeaders('gemini-cli');
 * ```
 */
export class FingerprintGenerator {
  // Legacy weighted-pool state
  private readonly directory: string;
  private readonly allowExtended: boolean;
  private readonly fixedPlatform?: PlatformProfile | undefined;
  private readonly fixedCliVersion?: string | undefined;
  private readonly fixedGoogleApiVersion?: string | undefined;
  private readonly fixedNodeVersion?: string | undefined;
  private readonly sessionId: string;
  private cachedPlatform: PlatformProfile | null = null;

  // Observer-style state
  /** Antigravity app version used in observer User-Agents. */
  private readonly version: string;
  private poolCache: PlatformPool | null = null;

  /**
   * Unified constructor accepting BOTH historical option shapes:
   *
   * @param opts - either an options object ({@link FingerprintOptions}) or a
   *               plain version string ("1.19.2", "antigravity/1.19.2 ...",
   *               falls back to ANTIGRAVITY_VERSION_FALLBACK when invalid).
   */
  constructor(opts?: FingerprintOptions | string) {
    const o: FingerprintOptions = typeof opts === "string" ? { antigravityVersion: opts } : (opts ?? {});

    this.directory = o.directory ? path.resolve(o.directory) : process.cwd();
    this.allowExtended = o.allowExtendedPlatforms ?? false;
    this.fixedPlatform = o.fixedPlatform;
    this.fixedCliVersion = o.fixedCliVersion;
    this.fixedGoogleApiVersion = o.fixedGoogleApiVersion;
    this.fixedNodeVersion = o.fixedNodeVersion;
    this.sessionId = generateSessionUuid(this.directory);
    this.version = this.normalizeAntigravityVersion(o.antigravityVersion);
  }

  /** Validates / extracts the Antigravity version from raw input. */
  private normalizeAntigravityVersion(raw?: string): string {
    const v = (raw ?? "").trim();
    if (!v) return ANTIGRAVITY_VERSION_FALLBACK;
    if (/^\d+\.\d+\.\d+/.test(v)) return v;
    if (/^antigravity\//i.test(v)) {
      // Allow passing a full UA string - extract the version part.
      const m = v.match(/antigravity\/([0-9]+\.[0-9]+\.[0-9]+[^\s]*)/i);
      return m && m[1] ? m[1] : ANTIGRAVITY_VERSION_FALLBACK;
    }
    return ANTIGRAVITY_VERSION_FALLBACK;
  }

  // --------------------------------------------------------------------------
  // Hashing helpers (instance level)
  // --------------------------------------------------------------------------

  /** Numeric 32-bit FNV-1a (deterministic, fast, no crypto overhead). */
  private fnv1a32m(input: string): number {
    if (typeof input !== "string") throw new TypeError("fnv1a32 input must be string");
    return fnv1a32(input);
  }

  /** Numeric 64-bit FNV-1a for longer session identifiers. */
  private fnv1a64b(input: string): bigint {
    if (typeof input !== "string") throw new TypeError("fnv1a64 input must be string");
    return fnv1a64Big(input);
  }

  /** Hex representation (8 chars) of the 32-bit FNV-1a hash. */
  public fnv1aHex(input: string): string {
    return this.fnv1a32m(input).toString(16).padStart(8, "0");
  }

  /**
   * Deterministic session id from a seed (sess_ prefixed, FNV-based). When no
   * seed is supplied, falls back to randomUUID + hostname + timestamp hashed
   * into the same format. Never throws.
   *
   * v2.1.16 divergence note: {@link generateUserPromptId} below is the
   * structural twin of this method, kept separate (not parametrized into one
   * prefix+salt helper) because the outputs intentionally differ in four
   * places: the prefix (sess_ vs up_), the secondary hash salt (`:sess` vs
   * `:up`), the unseeded base (Date.now() vs process.pid) and the catch-path
   * fallback shape (sess_ appends a base36 timestamp, up_ does not).
   */
  public generateSessionId(seed?: string): string {
    try {
      if (seed && typeof seed === "string" && seed.length > 0) {
        const h = this.fnv1a64b(seed);
        const hex = h.toString(16).padStart(16, "0");
        const h2 = this.fnv1a32m(`${seed}:sess`);
        const suffix = h2.toString(16).padStart(8, "0");
        return `sess_${hex}${suffix}`;
      }
      const randomBase = `${crypto.randomUUID()}:${os.hostname()}:${Date.now()}`;
      const h = this.fnv1a64b(randomBase);
      const timeFrag = Date.now().toString(36);
      return `sess_${h.toString(16).padStart(16, "0")}_${timeFrag}`;
    } catch {
      const fallback = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      return `sess_${this.fnv1aHex(fallback)}_${Date.now().toString(36)}`;
    }
  }

  /**
   * Deterministic user_prompt_id mirroring Antigravity Manager behavior where
   * prompt IDs stay stable per request content. Never throws.
   */
  public generateUserPromptId(seed?: string): string {
    try {
      if (seed && typeof seed === "string" && seed.length > 0) {
        const h = this.fnv1a64b(seed);
        const hex = h.toString(16).padStart(16, "0");
        const h2 = this.fnv1a32m(`${seed}:up`);
        return `up_${hex}${h2.toString(16).padStart(8, "0")}`;
      }
      const randomBase = `${crypto.randomUUID()}:${os.hostname()}:${process.pid}`;
      const h = this.fnv1a64b(randomBase);
      return `up_${h.toString(16).padStart(16, "0")}_${Date.now().toString(36)}`;
    } catch {
      const fallback = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      return `up_${this.fnv1aHex(fallback)}`;
    }
  }

  // --------------------------------------------------------------------------
  // Platform selection - coherent + weighted
  // --------------------------------------------------------------------------

  /**
   * Returns a coherent platform with per-instance caching for stability.
   * A fixedPlatform always wins (deterministic tests); an explicit override
   * bypasses the cache entirely.
   */
  getPlatform(override?: PlatformProfile): PlatformProfile {
    if (override) return override;
    if (this.fixedPlatform) return this.fixedPlatform;
    if (this.cachedPlatform) return this.cachedPlatform;

    const pool = this.allowExtended ? PLATFORM_POOL_EXTENDED : PLATFORM_PROFILE_POOL;
    const chosen = pickRandomWeighted(pool);
    this.cachedPlatform = chosen;
    return chosen;
  }

  /** Forces a platform rotation (useful for anti-ban testing). */
  rotatePlatform(): PlatformProfile {
    const pool = this.allowExtended ? PLATFORM_POOL_EXTENDED : PLATFORM_PROFILE_POOL;
    const chosen = pickRandomWeighted(pool);
    this.cachedPlatform = chosen;
    return chosen;
  }

  /**
   * Runtime-detected keyed pool (cached):
   * win32 -> windows/amd64, darwin -> darwin/arm64 (even under Rosetta),
   * everything else -> linux/x64.
   */
  public getPlatformPool(): PlatformPool {
    if (this.poolCache) return this.poolCache;

    const plat = os.platform();
    let key: string;
    if (plat === "win32") key = "windows/amd64";
    else if (plat === "darwin") key = "darwin/arm64";
    else key = "linux/x64";

    const pool = PLATFORM_POOLS[key];
    const fallbackPool = PLATFORM_POOLS["linux/x64"];
    // Defensive: both entries are static constants, so at least one exists.
    this.poolCache = (pool ?? fallbackPool) as PlatformPool;
    return this.poolCache;
  }

  /** Static accessor for all keyed pools (testing / CLI listing). */
  public static getPlatformPools(): PoolMap {
    return { ...PLATFORM_POOLS };
  }

  /** Current keyed pool key, e.g. "darwin/arm64". */
  public getCurrentPoolKey(): string {
    return this.getPlatformPool().key;
  }

  // --------------------------------------------------------------------------
  // Jitter (instance API)
  // --------------------------------------------------------------------------

  /** Cryptographically strong jitter in the inclusive 0..80ms range. */
  public getJitterMs(): number {
    try {
      const v = crypto.randomInt(0, 81);
      if (typeof v === "number" && Number.isFinite(v)) return v;
    } catch {
      // fall through to Math.random
    }
    return Math.floor(Math.random() * 81);
  }

  /** Applies jitter asynchronously - awaits 0..80ms. */
  public async applyJitter(): Promise<void> {
    const ms = this.getJitterMs();
    if (ms <= 0) return;
    await new Promise<void>((resolve) => setTimeout(resolve, ms));
  }

  // --------------------------------------------------------------------------
  // Version pairs - anti-ban randomized
  // --------------------------------------------------------------------------

  /**
   * Produces a coherent version set that actually shipped together.
   * 70% recent-user slice, 30% long-tail for realistic distribution.
   */
  private getCoherentVersionPair(): {
    cliVersion: string;
    googleApiVersion: string;
    glNodeVersion: string;
    gaxVersion: string;
  } {
    if (this.fixedCliVersion || this.fixedGoogleApiVersion || this.fixedNodeVersion) {
      return {
        cliVersion: this.fixedCliVersion ?? pickRandom(GEMINI_CLI_VERSION_POOL),
        googleApiVersion: this.fixedGoogleApiVersion ?? pickRandom(GOOGLE_API_CLIENT_VERSION_POOL),
        glNodeVersion: this.fixedNodeVersion ?? pickRandom(GL_NODE_VERSION_POOL),
        gaxVersion: pickRandom(GAX_VERSION_POOL),
      };
    }

    const isRecentUser = secureRandom() < 0.7;

    if (isRecentUser) {
      return {
        cliVersion: pickRandom(GEMINI_CLI_VERSION_POOL.slice(0, 3)),
        googleApiVersion: pickRandom(GOOGLE_API_CLIENT_VERSION_POOL.slice(0, 2)),
        glNodeVersion: pickRandom(GL_NODE_VERSION_POOL.slice(0, 3)),
        gaxVersion: GAX_VERSION_POOL[0],
      };
    }
    return {
      cliVersion: pickRandom(GEMINI_CLI_VERSION_POOL.slice(2)),
      googleApiVersion: pickRandom(GOOGLE_API_CLIENT_VERSION_POOL.slice(2)),
      glNodeVersion: pickRandom(GL_NODE_VERSION_POOL.slice(2)),
      gaxVersion: pickRandom(GAX_VERSION_POOL.slice(1)),
    };
  }

  // --------------------------------------------------------------------------
  // User-Agent generators
  // --------------------------------------------------------------------------

  /**
   * User-Agent identical to the official Gemini CLI:
   * `GeminiCLI/0.57.0/gemini-3-pro-preview (win32; x64; GitHub) google-api-nodejs-client/9.15.1`
   */
  getGeminiCLIUserAgent(model: string = UA_DEFAULT_MODEL, platform?: PlatformProfile): string {
    const plat = this.getPlatform(platform);
    const { cliVersion, googleApiVersion } = this.getCoherentVersionPair();

    // antigravity-* models are kept whole; the backend accepts them.
    const modelSegment = model.trim();
    return `GeminiCLI/${cliVersion}/${modelSegment} (${plat.uaSegment}; ${plat.source}) google-api-nodejs-client/${googleApiVersion}`;
  }

  /**
   * Antigravity-flavored User-Agent observed in fetchAvailableModels traces:
   * `Antigravity/1.12.8 (linux; x64) CodeAssist/0.9.2 google-api-nodejs-client/9.15.1 gl-node/22.19.0`
   */
  getAntigravityUserAgent(version?: string, platform?: PlatformProfile): string {
    const plat = this.getPlatform(platform);
    const coherent = this.getCoherentVersionPair();
    const agVersion = version ?? pickRandom(ANTIGRAVITY_VERSION_POOL);
    const googleVer = coherent.googleApiVersion;
    const glNode = coherent.glNodeVersion;

    // Real traces include a CodeAssist sub-version.
    const codeAssistVersions = ["0.9.2", "0.9.1", "0.8.7"];
    const caVer = pickRandom(codeAssistVersions);

    return `Antigravity/${agVersion} (${plat.uaSegment}) CodeAssist/${caVer} google-api-nodejs-client/${googleVer} gl-node/${glNode}`;
  }

  // --------------------------------------------------------------------------
  // X-Goog-Api-Client + Client-Metadata
  // --------------------------------------------------------------------------

  /**
   * X-Goog-Api-Client identical to the Node.js Google client. 80% simplified
   * (`gl-node/22.19.0`), 20% full chain with gccl/gax/grpc segments.
   */
  getXGoogApiClient(): string {
    const { glNodeVersion, gaxVersion } = this.getCoherentVersionPair();

    const useFull = secureRandom() < 0.2;
    if (!useFull) {
      return `gl-node/${glNodeVersion}`;
    }

    const gcclPool = ["0.2.0", "0.2.1"];
    const grpcPool = ["1.13.4", "1.13.3", "1.10.8"];
    const gccl = pickRandom(gcclPool);
    const grpc = pickRandom(grpcPool);

    return `gl-node/${glNodeVersion} gccl/${gccl} gax/${gaxVersion} grpc/${grpc}`;
  }

  /**
   * Hardened fixed Client-Metadata validated by onboarding/loadCodeAssist:
   * `ideType=IDE_UNSPECIFIED,platform=PLATFORM_UNSPECIFIED,pluginType=GEMINI`
   */
  getClientMetadata(): string {
    return "ideType=IDE_UNSPECIFIED,platform=PLATFORM_UNSPECIFIED,pluginType=GEMINI";
  }

  /**
   * Structured JSON Client-Metadata used by observer-style requests
   * (ideType ANTIGRAVITY + plugin/arch/node details). Falls back to a compact
   * key=value form and never throws.
   */
  private buildClientMetadata(pool?: PlatformPool): string {
    const p = pool ?? this.getPlatformPool();
    try {
      const nodeVer = process.version;
      const payload = {
        ideType: "ANTIGRAVITY",
        ideVersion: this.version,
        platform: p.os.toUpperCase(),
        arch: p.arch.toUpperCase(),
        pluginVersion: PLUGIN_VERSION_FALLBACK,
        nodeVersion: nodeVer,
        osDisplay: p.displayOs,
      };
      return JSON.stringify(payload);
    } catch {
      return `ideType=antigravity,platform=${p.os},arch=${p.arch},version=${this.version}`;
    }
  }

  /**
   * Observer-style X-Goog-Api-Client:
   * `gl-node/<node> antigravity/<version> gccl/1.0.0`. Never throws.
   */
  private buildApiClient(): string {
    try {
      const nodeVer = process.version.replace(/^v/, "");
      return `gl-node/${nodeVer} antigravity/${this.version} gccl/1.0.0`;
    } catch {
      return `antigravity/${this.version}`;
    }
  }

  // --------------------------------------------------------------------------
  // Full headers - legacy Gemini CLI shape
  // --------------------------------------------------------------------------

  /**
   * Complete Gemini CLI-compatible header set including coherent UA,
   * X-Goog-Api-Client jitter, hardened Client-Metadata and Content-Type.
   */
  getFullHeaders(
    model: string = UA_DEFAULT_MODEL,
    type: FingerprintType = "gemini-cli",
    platformOverride?: PlatformProfile,
  ): FullHeadersResult {
    const plat = this.getPlatform(platformOverride);
    const versions = this.getCoherentVersionPair();
    const jitterMs = getJitterMs(0, 80);

    const userAgent =
      type === "gemini-cli"
        ? this.getGeminiCLIUserAgent(model, plat)
        : this.getAntigravityUserAgent(versions.cliVersion, plat);

    const xGoogClient = this.getXGoogApiClient();
    const clientMetadata = this.getClientMetadata();
    const xClientDetails = `session_id=${this.sessionId},platform=${plat.os}`;

    return {
      "User-Agent": userAgent,
      "X-Goog-Api-Client": xGoogClient,
      "Client-Metadata": clientMetadata,
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Client-Details": xClientDetails,
      __meta: {
        platform: plat,
        cliVersion: versions.cliVersion,
        googleApiVersion: versions.googleApiVersion,
        glNodeVersion: versions.glNodeVersion,
        gaxVersion: versions.gaxVersion,
        sessionId: this.sessionId,
        model,
        type,
        jitterMs,
      },
    };
  }

  /** Native Fetch API Headers instance ready for direct fetch() usage. */
  toFetchHeaders(model?: string, type?: FingerprintType): Headers {
    const full = this.getFullHeaders(model, type);
    const h = new Headers();
    h.set("User-Agent", full["User-Agent"]);
    h.set("X-Goog-Api-Client", full["X-Goog-Api-Client"]);
    h.set("Client-Metadata", full["Client-Metadata"]);
    h.set("Content-Type", full["Content-Type"]);
    h.set("Accept", full["Accept"]);
    if (full["X-Client-Details"]) h.set("X-Client-Details", full["X-Client-Details"]);
    return h;
  }

  // --------------------------------------------------------------------------
  // Observer-style fingerprint headers
  // --------------------------------------------------------------------------

  /**
   * Generates observer-style fingerprint headers.
   *
   * Enforced requirements:
   * - User-Agent: `antigravity/{version} {os}/{arch}` (coherent keyed pool)
   * - Client-Metadata: always included (structured JSON, AM observed)
   * - X-Goog-Api-Client ONLY when headerStyle === 'gemini-cli'
   * - Never includes X-Goog-QuotaUser nor X-Client-Device-Id
   *
   * @param headerStyle - 'antigravity' (default content path) or 'gemini-cli'
   */
  public getFingerprintHeaders(headerStyle: HeaderStyle = "antigravity"): Record<string, string> {
    if (headerStyle !== "antigravity" && headerStyle !== "gemini-cli") {
      throw new TypeError(`headerStyle must be 'antigravity' or 'gemini-cli', got ${String(headerStyle)}`);
    }

    const pool = this.getPlatformPool();

    // Coherence-critical: outdated versions triggered backend bans.
    const userAgent = `antigravity/${this.version} ${pool.os}/${pool.arch}`;

    const headers: Record<string, string> = {
      "User-Agent": userAgent,
      "Content-Type": "application/json",
      "Client-Metadata": this.buildClientMetadata(pool),
      Accept: "application/json",
    };

    if (headerStyle === "gemini-cli") {
      headers["X-Goog-Api-Client"] = this.buildApiClient();
    }

    return headers;
  }

  /** Antigravity version currently embedded in observer fingerprints. */
  public getVersion(): string {
    return this.version;
  }

  // --------------------------------------------------------------------------
  // Accessors
  // --------------------------------------------------------------------------

  /** Deterministic session_id of this instance. */
  getSessionId(): string {
    return this.sessionId;
  }

  /** Full OAuth config for the auth flow. */
  getOAuthConfig(): {
    clientId: string;
    clientSecret: string;
    scopes: readonly string[];
    projectFallback: string;
  } {
    return {
      clientId: OAUTH_CLIENT_ID,
      clientSecret: OAUTH_CLIENT_SECRET,
      scopes: GEMINI_CLI_SCOPES,
      projectFallback: PROJECT_FALLBACK,
    };
  }

  /** Endpoint map (v2.1.15 Phase D: derives from the constants.js parts). */
  getEndpoints(): typeof FINGERPRINT_API_PATHS {
    return FINGERPRINT_API_PATHS;
  }
}

// ============================================================================
// Section: Standalone exported API (short blind helpers)
// ============================================================================

/** Lazy singleton bound to the current cwd; stable session_id per process. */
let cachedgenerator: FingerprintGenerator | null = null;

function getDefaultInstance(): FingerprintGenerator {
  if (!cachedgenerator) {
    cachedgenerator = new FingerprintGenerator();
  }
  return cachedgenerator;
}

/**
 * Default shared generator using ANTIGRAVITY_VERSION_FALLBACK until
 * version.ts resolves the remote version. Consumers may create their own
 * instances with a dynamic version. The grand merge folded this module into
 * the shared core graph the platform-portable bundles ship, so the singleton
 * constructs on first use (the constructor resolves the cwd through the node
 * path builtin): under node and bun the behavior is identical while a stubbed
 * browser bundle never instantiates the generator at import time.
 */
export const defaultFingerprintGenerator: FingerprintGenerator = new Proxy({} as FingerprintGenerator, {
  get(_target: FingerprintGenerator, property: string | symbol): unknown {
    if (!cachedgenerator) {
      cachedgenerator = new FingerprintGenerator(ANTIGRAVITY_VERSION_FALLBACK);
    }
    const value = Reflect.get(cachedgenerator, property, cachedgenerator) as unknown;
    return typeof value === "function" ? (value as (...args: unknown[]) => unknown).bind(cachedgenerator) : value;
  },
});

/**
 * Convenience wrapper matching the original plugin export names. Uses the
 * default singleton, or a temporary generator when a version is supplied.
 *
 * @param style - 'antigravity' (default) or 'gemini-cli'
 * @param version - optional Antigravity version override
 */
export function getFingerprintHeaders(style: HeaderStyle = "antigravity", version?: string): Record<string, string> {
  if (version) {
    return new FingerprintGenerator(version).getFingerprintHeaders(style);
  }
  return defaultFingerprintGenerator.getFingerprintHeaders(style);
}

/**
 * Short helper generating Gemini CLI compatible headers for project bypass.
 *
 * @param model - model id (default gemini-3-pro-preview)
 * @param type - 'gemini-cli' or 'antigravity'
 * @param platform - profile object, "win32 x64" string, or plain OS string
 */
export function generateHeaders(
  model: string = UA_DEFAULT_MODEL,
  type: FingerprintType = "gemini-cli",
  platform?: PlatformProfile | `${PlatformOS} ${PlatformArch}` | PlatformOS,
): Record<string, string> {
  const fp = getDefaultInstance();

  let platformProfile: PlatformProfile | undefined;
  if (platform) {
    if (typeof platform === "object") {
      platformProfile = platform;
    } else if (typeof platform === "string") {
      // Short parser: "win32 x64" or "win32".
      const parts = platform.toLowerCase().split(/\s+/);
      const osPart = parts[0] as PlatformOS;
      const archPart = (parts[1] as PlatformArch) ?? (osPart === "darwin" ? "arm64" : "x64");
      const found = PLATFORM_PROFILE_POOL.find((p) => p.os === osPart && p.arch === archPart);
      if (found) platformProfile = found;
    }
  }

  const full = fp.getFullHeaders(model, type, platformProfile);
  // Strip the internal __meta block - only real HTTP headers are returned.
  const { __meta, ...httpHeaders } = full;
  return httpHeaders as Record<string, string>;
}

/** Variant returning a native Fetch API Headers instance (Node 20+). */
export function generateFetchHeaders(
  model?: string,
  type?: FingerprintType,
  platform?: PlatformProfile | `${PlatformOS} ${PlatformArch}`,
): Headers {
  const record = generateHeaders(model, type, platform);
  const h = new Headers();
  for (const [k, v] of Object.entries(record)) {
    if (v) h.set(k, v);
  }
  return h;
}

/**
 * Full fingerprint with metadata for debugging/tracing; validates bypasses
 * during development.
 */
export function generateFullFingerprint(model?: string, type?: FingerprintType, directory?: string): FullHeadersResult {
  const fp = directory ? new FingerprintGenerator({ directory }) : getDefaultInstance();
  return fp.getFullHeaders(model, type);
}

/**
 * Creates an instance bound to a specific directory (deterministic
 * session_id). Essential for multi-workspace setups.
 */
export function createFingerprintForDirectory(directory: string): FingerprintGenerator {
  return new FingerprintGenerator({ directory });
}

/**
 * Bypass helper producing headers plus the base body for loadCodeAssist,
 * including the blinded project fallback.
 */
export function buildLoadCodeAssistRequest(
  projectId: string = PROJECT_FALLBACK,
  model: string = UA_DEFAULT_MODEL,
): { url: string; method: "POST"; headers: Record<string, string>; body: string; sessionId: string } {
  const fp = getDefaultInstance();
  const headersRec = generateHeaders(model, "gemini-cli");
  const sessionId = fp.getSessionId();

  return {
    url: FINGERPRINT_API_PATHS.loadCodeAssist,
    method: "POST",
    headers: headersRec,
    body: JSON.stringify({
      cloudaicompanionProject: projectId,
      metadata: {
        ideType: "IDE_UNSPECIFIED",
        platform: "PLATFORM_UNSPECIFIED",
        pluginType: "GEMINI",
      },
      session_id: sessionId,
    }),
    sessionId,
  };
}

// ============================================================================
// Section: Re-export barrel for plugin consumption
// ============================================================================

export const FingerprintConstants = {
  OAUTH_CLIENT_ID,
  OAUTH_CLIENT_SECRET,
  GEMINI_CLI_SCOPES,
  PROJECT_FALLBACK,
  CLOUDCODE_BASE_URL,
  MODELS_2026,
  PLATFORM_PROFILE_POOL,
  PLATFORM_POOLS,
  GEMINI_CLI_VERSION_POOL,
  GOOGLE_API_CLIENT_VERSION_POOL,
  GL_NODE_VERSION_POOL,
  ANTIGRAVITY_VERSION_FALLBACK,
  PLUGIN_VERSION_FALLBACK,
} as const;

export default FingerprintGenerator;
