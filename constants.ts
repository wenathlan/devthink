/**
 * @file constants.ts
 * @module maene/constants
 * @description
 *  Merged constants module — v2.1.2 base (strict superset) with every unique
 *  export from the v1.0.0 constants module ported on top. Nothing dropped.
 *
 *  Third-person observer view: the library observes real traffic from the
 *  Antigravity IDE, Gemini CLI, OmniRoute, 9router and pi-antigravity-auth
 *  and reproduces its fingerprint without executing Antigravity.
 *
 *  The V2 correction addresses the opencode.txt timeline gap: models released
 *  up to 25/08/2026 were missing and Project ID bypass was not fully
 *  Gemini CLI-like.
 *
 *  - Plugin: maene 2.1.2 (ONDA 5 V2)
 *  - Replaces maene which failed due to an outdated UA
 *    (1.11.5 -> "This version of Antigravity is no longer supported")
 *    and missing 2026 models.
 *  - Must work WITHOUT the localhost v1 base-url proxy, straight to
 *    cloudcode-pa.googleapis.com via endpoint cascade with retry 403/404/5xx.
 *  - Project ID bypass behaves EXACTLY like Gemini CLI would:
 *      1) try loadCodeAssist without projectId -> server returns the existing
 *         cloudaicompanionProject
 *      2) if null -> onboardUser FREE tier -> long-running operation polling
 *      3) loadCodeAssist again -> provisioned projectId
 *      4) fetchAvailableModels as best-effort validation
 *      5) blinded rising-fact-p41fc fallback only if every endpoint fails
 *    Implemented references: pi-antigravity-auth (loadCodeAssist parsing),
 *    OmniRoute/9router (header stripping, prod-first cascade).
 *
 *  Model timeline complete up to 25/08/2026:
 *  - Gemini 3.6 Flash family (high/medium/low/tiered/base)
 *  - Gemini 3.5 Flash family (high/medium/base/lite/lite-preview)
 *  - Gemini 3.1 Pro family (high/low/base + flash-image + flash-lite)
 *  - Gemini 3 family (flash, pro, deep-think)
 *  - Gemini 2.5 family (pro, flash, flash-lite)
 *  - Claude 4.6 thinking (opus + sonnet), Claude 4.5 legacy
 *  - gpt-oss-120b medium/high
 *  - Preview models: gemini-3-pro-preview, flash-preview, 3.1-pro-preview, customtools
 *
 *  Merge notes (conflict resolutions):
 *  - ANTIGRAVITY_ENDPOINTS   : kept from v2 (cascade URL array); the v1
 *    versioned-base object is exported as ANTIGRAVITY_ENDPOINT_SET.
 *  - CODE_ASSIST_ENDPOINTS   : kept from v2 (PROD/DAILY/SANDBOX/AUTOPUSH URL
 *    map); the v1 v1internal path map is exported as CODE_ASSIST_PATH_MAP.
 *  - CONSTANTS               : kept from v2; the v1 compatibility barrel is
 *    exported as CONSTANTS_V1 (also provided as the module default export).
 *  - FALLBACK_PROJECT_ID     : identical value in both versions; single v2
 *    definition retained.
 *
 *  Runtime constraint: only node:* builtins + global fetch (Node >=18).
 *  Library-first, root-first: no /src, no folder inside folder.
 *
 *  @author maene
 *  @license MIT
 *  @version 2.1.2 — ONDA 5 CORRECTION V2 26/08/2026
 */

import { arch as osArch, platform as osPlatform, homedir } from "node:os";
import * as nodePath from "node:path";
// v2.1.15 Phase B: every FUNCTION that used to live here moved to its domain
// owner (core.ts for generic utilities, fingerprint.ts for identity
// masquerade). constants.ts is now raw values only.
// v2.1.15 Phase A: the model-domain families (model catalogs, thinking
// tables, search/default model ids, routing helpers) moved to models.ts.
// Type-only edge (erased at runtime) so the raw sub-lists below stay typed.

// ---------------------------------------------------------------------------
// Version — dynamic fallback chain (AM ban <1.15.8, latest stable 1.19.2)
// ---------------------------------------------------------------------------

export const ANTIGRAVITY_VERSION_FALLBACK = "1.19.2" as const;
export const ANTIGRAVITY_VERSION_MIN_SUPPORTED = "1.15.8" as const;
export const ANTIGRAVITY_BLOCKED_VERSIONS = ["1.11.5", "1.12.0", "1.12.3", "1.13.2"] as const;

export const ANTIGRAVITY_VERSION_REMOTE_URLS = [
  "https://registry.npmjs.org/antigravity/latest",
  "https://api.github.com/repos/google/antigravity/releases/latest",
  "https://storage.googleapis.com/antigravity-version/version.json",
] as const;

export const VERSION_FETCH_TIMEOUT_MS = 5_000 as const;

// ---------------------------------------------------------------------------
// User-Agent — core fix
// ---------------------------------------------------------------------------

export const ANTIGRAVITY_USER_AGENT_FALLBACK = `antigravity/${ANTIGRAVITY_VERSION_FALLBACK}`;
export const ANTIGRAVITY_USER_AGENT: string = ANTIGRAVITY_USER_AGENT_FALLBACK;
/* The grand merge folded this constants module into the shared core graph the platform-portable bundles ship: the user agent fallback reads the live os identifiers under node and bun while a stubbed browser bundle answers the neutral fallback, so the top-level evaluation never throws at import time. */
const osidentifiers = (): string => {
  try { return `${osPlatform()}/${osArch()}`; } catch { return "unknown/unknown"; }
};
export const GEMINI_CLI_USER_AGENT_FALLBACK: string = `gemini-cli/0.57.0 ${osidentifiers()}`;

/**
 * The maene 2.0.0 GPN:GeminiCLI User-Agent (auth.ts / oauth(2).ts lineage).
 * Distinct from ANTIGRAVITY_USER_AGENT (the antigravity/{version} identity):
 * this is the legacy maene-branded presentation string, exported for callers
 * that need to present it; it is not part of the live bypass chains.
 */
export const ANTIGRAVITY_USER_AGENT_MAENE =
  "maene/2.0.0 (GPN:GeminiCLI) Node.js/22 (+https://github.com/maene)" as const;

/**
 * Exact User-Agent sent by Gemini CLI 0.57.0 against gemini-3-pro-preview —
 * the live-validated request.ts/streaming.ts variant and the canonical of
 * the GEMINI_CLI_USER_AGENT family (v2.1.15 Phase B).
 */
export const GEMINI_CLI_USER_AGENT =
  "GeminiCLI/0.57.0/gemini-3-pro-preview (linux; x64; GitHub) google-api-nodejs-client/9.15.1" as const;

/**
 * Minimal Gemini CLI UA snapshot (former project.ts local variant; consumed
 * by accounts.ts). Distinct value from GEMINI_CLI_USER_AGENT (no model,
 * platform or client suffix) — one name, one meaning.
 */
export const GEMINI_CLI_USER_AGENT_MINIMAL = "GeminiCLI/0.57.0" as const;

/**
 * Gemini CLI UA WITHOUT the model segment (recovery.ts lineage). Distinct
 * value from {@link GEMINI_CLI_USER_AGENT}: recovery presents the plain
 * platform UA, so the accurate split keeps both historical strings.
 */
export const GEMINI_CLI_USER_AGENT_PLAIN =
  "GeminiCLI/0.57.0 (linux; x64; GitHub) google-api-nodejs-client/9.15.1" as const;

// v2.1.15 Phase C: GEMINI_CLI_USER_AGENT_BASE (minimal UA alias) deleted —
// GEMINI_CLI_USER_AGENT_MINIMAL is the accurate name for that value.

// ---------------------------------------------------------------------------
// OAuth — blinded
// ---------------------------------------------------------------------------

export const ANTIGRAVITY_CLIENT_ID = [
  "1071006060591",
  "-8q4j2k9l0m3n5b7v2c4x6",
  "z8a1s3d5f7g9h2j4k6",
  ".apps.",
  "googleusercontent",
  ".com",
].join("");
export const ANTIGRAVITY_CLIENT_SECRET = ["GOCSPX", "-1a2b3c4d5e6f7g8h9i0j", "1k2l3m4n5o"].join("");
export const ANTIGRAVITY_CLIENT_ID_IS_BLINDED = true as const;
export const ANTIGRAVITY_CLIENT_SECRET_IS_BLINDED = true as const;

/**
 * Secondary Antigravity client id fallback (former quota.ts local; assembled
 * at runtime from segments). Raw value owner.
 */
export const ANTIGRAVITY_CLIENT_ID_FALLBACK_SECONDARY = [
  "681255809395",
  "-oo8ft2oq6bda7b6t5a2prl1",
  "saaq1hhs",
  ".apps.",
  "googleusercontent",
  ".com",
].join("");

// ---------------------------------------------------------------------------
// Headers — fingerprint
// ---------------------------------------------------------------------------

export const HEADER_X_GOOG_API_CLIENT = "X-Goog-Api-Client" as const;
export const HEADER_CLIENT_METADATA = "Client-Metadata" as const;
export const HEADER_USER_AGENT = "User-Agent" as const;
export const HEADER_X_GOOG_USER_PROJECT = "x-goog-user-project" as const;
export const HEADER_X_GOOG_QUOTA_USER = "X-Goog-QuotaUser" as const;
export const HEADER_X_CLIENT_DEVICE_ID = "X-Client-Device-Id" as const;

export const HEADERS_TO_STRIP = [
  HEADER_X_GOOG_USER_PROJECT,
  HEADER_X_GOOG_QUOTA_USER,
  HEADER_X_CLIENT_DEVICE_ID,
] as const;

/**
 * Base forbidden-header list (5 entries) stripped case-insensitively on
 * content requests — the live-validated request.ts variant. Canonical of
 * the FORBIDDEN_HEADERS family (v2.1.15 Phase B: plugin.ts's identical copy
 * deleted; models.ts's 6-entry strict variant lives below under its own
 * accurate name).
 */
export const FORBIDDEN_HEADERS = [
  "x-goog-user-project",
  "x-goog-quotatuser",
  "x-goog-quota-user",
  "x-client-device-id",
  "x-goog-request-reason",
] as const;

/**
 * Strict forbidden-header list (6 entries) — the base list plus
 * "x-goog-api-client". This is the models.ts lineage used by the strict
 * stripper (strip functions themselves are owned by request.ts in Phase D).
 */
export const FORBIDDEN_HEADERS_STRICT = [...FORBIDDEN_HEADERS, "x-goog-api-client"] as const;

/**
 * Antigravity Client-Metadata raw template (quota.ts lineage — the 4-key
 * superset; the former 2-key constants.ts variant is subsumed). The
 * buildClientMetadata FUNCTION lives in fingerprint.ts and imports this.
 */
export const ANTIGRAVITY_CLIENT_METADATA_TEMPLATE = {
  ideType: "ANTIGRAVITY",
  platform: "PLATFORM_UNSPECIFIED",
  pluginType: "GEMINI",
  pluginVersion: "2.1.14",
} as const;

/**
 * Client-Metadata raw object — the Gemini CLI bypass metadata triple
 * (config.ts / project.ts / request.ts lineage). The dynamic ANTIGRAVITY-style
 * metadata string is built by fingerprint.ts's buildClientMetadata.
 */
export const CLIENT_METADATA = {
  ideType: "IDE_UNSPECIFIED",
  platform: "PLATFORM_UNSPECIFIED",
  pluginType: "GEMINI",
} as const;

/**
 * Client-Metadata serialized as the header string / payload used by the
 * Gemini CLI bypass (config.ts / project.ts / quota.ts / request.ts lineage).
 */
export const CLIENT_METADATA_STRING =
  "ideType=IDE_UNSPECIFIED,platform=PLATFORM_UNSPECIFIED,pluginType=GEMINI" as const;

/** Historical alias of {@link CLIENT_METADATA_STRING} (request.ts/streaming.ts lineage). */
export const CLIENT_METADATA_RAW = CLIENT_METADATA_STRING;

// ---------------------------------------------------------------------------
// Endpoints — direct cloudcode-pa, NO localhost v1 proxy
// ---------------------------------------------------------------------------

export const ANTIGRAVITY_ENDPOINTS = [
  "https://cloudcode-pa.googleapis.com",
  "https://daily-cloudcode-pa.googleapis.com",
  "https://autopush-cloudcode-pa.sandbox.googleapis.com",
] as const;

export const ANTIGRAVITY_ENDPOINT_FALLBACKS = [
  "https://cloudcode-pa.googleapis.com",
  "https://daily-cloudcode-pa.googleapis.com",
  "https://autopush-cloudcode-pa.sandbox.googleapis.com",
] as const;

/**
 * Raw Cloud Code Assist host map (layer-0 raw values, v2.1.15 Phase A).
 * The family names CODE_ASSIST_ENDPOINTS (host-map semantic) and
 * ENDPOINT_ORDER / ENDPOINT_ORDER_GEMINI_CLI / ENDPOINT_ORDER_ANTIGRAVITY
 * (per-family routing orders) are owned by models.ts, which derives them
 * from this map. The former local DAILY_SANDBOX key (value identical to
 * SANDBOX) had zero consumers and was dropped in the merge.
 */
export const ENDPOINTS = {
  PROD: "https://cloudcode-pa.googleapis.com",
  DAILY: "https://daily-cloudcode-pa.googleapis.com",
  SANDBOX: "https://daily-cloudcode-pa.sandbox.googleapis.com",
  AUTOPUSH: "https://autopush-cloudcode-pa.sandbox.googleapis.com",
} as const;

/**
 * Cloud Code Assist PA base URL — canonical of the CLOUDCODE_BASE_URL family
 * (v2.1.15 Phase B: accounts.ts, config.ts and fingerprint.ts locals
 * deleted). The alias names below keep every historical surface resolvable
 * while the string itself has exactly one definition.
 */
export const CLOUDCODE_BASE_URL = "https://cloudcode-pa.googleapis.com" as const;

/** Alias of {@link CLOUDCODE_BASE_URL} (auth.ts / quota.ts lineage). */
export const CLOUDCODE_BASE = CLOUDCODE_BASE_URL;

/** Alias of {@link CLOUDCODE_BASE_URL} (request.ts / streaming.ts lineage). */
export const CLOUDCODE_PA_BASE = CLOUDCODE_BASE_URL;

/** Daily (canary) Cloud Code Assist base URL (quota.ts / request.ts lineage). */
export const CLOUDCODE_DAILY_BASE = "https://daily-cloudcode-pa.googleapis.com" as const;

/**
 * Base URL for the Cloud Code Assist PaaS API (v1internal — undocumented).
 * v2.1.16: relocated above its dependents so every v1internal method-path
 * constant below derives from {@link CODE_ASSIST_PATH_MAP} (zero duplicated
 * path strings in this module).
 */
export const CODE_ASSIST_BASE_URL = "https://cloudcode-pa.googleapis.com" as const;

/**
 * Canonical v1internal method-path map — the single owner of every
 * "/v1internal:*" path literal in this module (v2.1.16 internal-dedup: the
 * standalone *_ENDPOINT constants, the CLOUDCODE_ENDPOINTS URL joins and the
 * versioned daily-v1internal block all derive from these entries).
 */
export const CODE_ASSIST_PATH_MAP = {
  /** Loads project and onboarding status */
  LOAD_CODE_ASSIST: "/v1internal:loadCodeAssist",
  /** Onboards a user into a Cloud project */
  ONBOARD_USER: "/v1internal:onboardUser",
  /** Lists models available to the account */
  FETCH_AVAILABLE_MODELS: "/v1internal:fetchAvailableModels",
  /** Synchronous generation */
  GENERATE_CONTENT: "/v1internal:generateContent",
  /** Streaming SSE generation */
  STREAM_GENERATE_CONTENT: "/v1internal:streamGenerateContent",
  /** Quota / limits per model */
  RETRIEVE_USER_QUOTA: "/v1internal:retrieveUserQuotaSummary",
  /** Compat alias: quota summary */
  RETRIEVE_USER_QUOTA_SUMMARY: "/v1internal:retrieveUserQuotaSummary",
} as const;

// NOTE (v2.1.15 Phase A): request.ts exports a method-path map under the
// historical name CODE_ASSIST_ENDPOINTS; that name is now owned by models.ts
// (the Cloud Code Assist HOST map), so the request-local method map was
// renamed CODE_ASSIST_METHOD_PATHS there.

/** Union type of the v1 paths. */
export type CodeAssistEndpointPath = (typeof CODE_ASSIST_PATH_MAP)[keyof typeof CODE_ASSIST_PATH_MAP];

/**
 * Helper to build a full Code Assist URL.
 * @param endpoint - path from CODE_ASSIST_PATH_MAP
 */
export function buildCodeAssistUrl(endpoint: CodeAssistEndpointPath): string {
  return `${CODE_ASSIST_BASE_URL}${endpoint}`;
}

/**
 * Cloud Code Assist full endpoint map — canonical of the CLOUDCODE_ENDPOINTS
 * family (v2.1.15 Phase B: accounts.ts, auth.ts and config.ts locals
 * deleted). The config.ts lineage shape (base + the six v1internal method
 * URLs) is the most complete superset; every consumer reads the method keys.
 * v2.1.16: method URLs derive from {@link CODE_ASSIST_PATH_MAP}.
 */
export const CLOUDCODE_ENDPOINTS = {
  base: CLOUDCODE_BASE_URL,
  /** Loads the Cloud Code project and binds the license */
  loadCodeAssist: `${CLOUDCODE_BASE_URL}${CODE_ASSIST_PATH_MAP.LOAD_CODE_ASSIST}`,
  /** Initial user onboarding */
  onboardUser: `${CLOUDCODE_BASE_URL}${CODE_ASSIST_PATH_MAP.ONBOARD_USER}`,
  /** Lists models available to the user */
  fetchAvailableModels: `${CLOUDCODE_BASE_URL}${CODE_ASSIST_PATH_MAP.FETCH_AVAILABLE_MODELS}`,
  /** Non-streaming generation */
  generateContent: `${CLOUDCODE_BASE_URL}${CODE_ASSIST_PATH_MAP.GENERATE_CONTENT}`,
  /** Streaming SSE generation */
  streamGenerateContent: `${CLOUDCODE_BASE_URL}${CODE_ASSIST_PATH_MAP.STREAM_GENERATE_CONTENT}`,
  /** Per-model quota summary */
  retrieveUserQuotaSummary: `${CLOUDCODE_BASE_URL}${CODE_ASSIST_PATH_MAP.RETRIEVE_USER_QUOTA_SUMMARY}`,
} as const;

export const GEMINI_CLI_ENDPOINT = CLOUDCODE_BASE_URL;
export const CLOUDAI_COMPANION_ENDPOINT = "https://cloudaicompanion.googleapis.com" as const;
export const CLOUDAI_COMPANION = CLOUDAI_COMPANION_ENDPOINT;
export const CLOUDAICOMPANION_ENDPOINT = CLOUDAI_COMPANION_ENDPOINT;

// v2.1.16 internal-dedup: the standalone legacy method-path constants now
// derive from CODE_ASSIST_PATH_MAP above — zero duplicated path strings.
export const QUOTA_ENDPOINT = CODE_ASSIST_PATH_MAP.RETRIEVE_USER_QUOTA_SUMMARY;
export const QUOTA_ENDPOINT_V1 = QUOTA_ENDPOINT;
export const MODELS_ENDPOINT = CODE_ASSIST_PATH_MAP.FETCH_AVAILABLE_MODELS;
export const MODELS_ENDPOINT_FULL = MODELS_ENDPOINT;

export const ONBOARD_USER_ENDPOINT = CODE_ASSIST_PATH_MAP.ONBOARD_USER;
export const LOAD_CODE_ASSIST_ENDPOINT = CODE_ASSIST_PATH_MAP.LOAD_CODE_ASSIST;
export const STREAM_GENERATE_ENDPOINT = CODE_ASSIST_PATH_MAP.STREAM_GENERATE_CONTENT;
export const GENERATE_CONTENT_ENDPOINT = CODE_ASSIST_PATH_MAP.GENERATE_CONTENT;
/** No CODE_ASSIST_PATH_MAP entry exists for this legacy path (zero consumers) — kept as its single literal definition. */
export const RESOLVE_PROJECT_ENDPOINT = "/v1internal:resolveProjectId" as const;
export const FETCH_AVAILABLE_MODELS_METHOD = "fetchAvailableModels" as const;

/**
 * Linear-time trailing-slash strip (regex-free; safe on uncontrolled input —
 * the former /\/+$/.replace was polynomial and flagged as ReDoS-prone).
 */
export function stripTrailingSlashes(value: string): string {
  let end = value.length;
  while (end > 0 && value.charCodeAt(end - 1) === 47 /* "/" */) end--;
  return end === value.length ? value : value.slice(0, end);
}

export function buildCloudCodeUrl(base: string, path: string): string {
  const b = stripTrailingSlashes(base);
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

// ---------------------------------------------------------------------------
// Project fallback + Gemini CLI bypass
// ---------------------------------------------------------------------------

export const PROJECT_FALLBACK = "rising-fact-p41fc" as const;
export const PROJECT_ID_FALLBACK = PROJECT_FALLBACK;
export const PROJECT_NAME_FALLBACK = `projects/${PROJECT_FALLBACK}`;
export const PROJECT_NUMBER_FALLBACK = "1071006060591" as const;
export const FALLBACK_PROJECT_ID = PROJECT_FALLBACK;

export const GEMINI_CLI_PROJECT_RESOLUTION = {
  metadata: { ideType: "ANTIGRAVITY", platform: "PLATFORM_UNSPECIFIED", pluginType: "GEMINI" },
  tierId: "FREE",
  retryableStatuses: [403, 404, 408, 429, 500, 502, 503, 504],
  nonRetryableStatuses: [400, 401],
  fallbackProjectId: PROJECT_FALLBACK,
  loadCodeAssistBodyWithoutProject: {
    metadata: { ideType: "ANTIGRAVITY", platform: "PLATFORM_UNSPECIFIED", pluginType: "GEMINI" },
  },
  onboardUserBody: {
    tierId: "FREE",
    metadata: { ideType: "ANTIGRAVITY", platform: "PLATFORM_UNSPECIFIED", pluginType: "GEMINI" },
  },
} as const;

export const PROJECT_RESOLUTION_STRATEGY = GEMINI_CLI_PROJECT_RESOLUTION;

export type QuotaGroup = "antigravity" | "gemini-cli" | "cloudaicompanion";

// v2.1.15 Phase A: every raw model substrate (flat id lists, rich definition
// lists, model aliases, default model ids and the family-checker helpers)
// moved to models.ts — model identification lives ONLY in models.ts.
// QuotaGroup stays: it types the quota-groups section below and is
// type-imported by models.ts (type-only edge, erased at runtime).

// OAuth
export const OAUTH_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth" as const;
export const OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token" as const;
export const OAUTH_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo" as const;

/**
 * v3 userinfo endpoint (former accounts.ts local variant; the v2 URL above
 * is the canonical gemini-cli lineage). Distinct value — one name, one meaning.
 */
export const OAUTH_USERINFO_URL_V3 = "https://www.googleapis.com/oauth2/v3/userinfo" as const;
export const OAUTH_REVOKE_URL = "https://oauth2.googleapis.com/revoke" as const;

export const OAUTH_SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/cloud-platform",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/cclog",
  "https://www.googleapis.com/auth/experimentsandconfigs",
] as const;

export const OAUTH_SCOPES_STRING = OAUTH_SCOPES.join(" ");

export const PKCE_VERIFIER_LENGTH = 128 as const;
export const PKCE_CODE_CHALLENGE_METHOD = "S256" as const;

export const OAUTH_CALLBACK_HOST = "127.0.0.1" as const;
export const OAUTH_CALLBACK_PATH = "/callback" as const;
export const OAUTH_STATE_LENGTH = 32 as const;
export const OAUTH_PORT_RANGE = { min: 10000, max: 60000 } as const;

// Timeouts, jitter, backoff
export const DEFAULT_TIMEOUT_MS = 10_000 as const;
export const CONTENT_TIMEOUT_MS = 60_000 as const;
export const PROJECT_RESOLVE_TIMEOUT_MS = 10_000 as const;
export const QUOTA_TIMEOUT_MS = 15_000 as const;
export const TOKEN_REFRESH_TIMEOUT_MS = 10_000 as const;
export const ONBOARD_TIMEOUT_MS = 15_000 as const;

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

export const BACKOFF_BASE_MS = 250 as const;
export const BACKOFF_MAX_MS = 10_000 as const;
export const BACKOFF_FACTOR = 2 as const;
export const MAX_RETRIES = 3 as const;
export const RETRYABLE_STATUS_CODES = [403, 404, 408, 429, 500, 502, 503, 504] as const;
export const RETRYABLE_ERROR_CODES = ["403", "404", "5xx"] as const;

export const QUOTA_CACHE_TTL_MS = 15 * 60 * 1000;
export const QUOTA_CACHE_TTL_MIN_MS = 2 * 60 * 1000;

/**
 * Quota cache TTL ceiling — canonical is the quota.ts lineage value (30 min;
 * the former 10 min constants.ts variant had zero consumers). quota.ts's
 * resilient-layer 10 min max stays local there under its own accurate name.
 */
export const QUOTA_CACHE_TTL_MAX_MS = 30 * 60 * 1000;
export const QUOTA_SOFT_THRESHOLD = 0.9 as const;

/**
 * Quota hard-exhaustion threshold — canonical is the quota.ts lineage value
 * (98% used => 2% remaining => hard exhausted; the former 1.0 constants.ts
 * variant had zero consumers and was not exercised by the live chain).
 */
export const QUOTA_HARD_THRESHOLD = 0.98 as const;

export const ACCOUNTS_FILE_NAME = "antigravity-accounts.json" as const;
export const ACCOUNTS_CONFIG_DIR = ".config/opencode" as const;
export const ACCOUNTS_FILE_MODE = 0o600 as const;

// v2.1.15 Phase A: THINKING_LEVELS, ThinkingLevel, THINKING_BUDGET_MAP,
// THINKING_BUDGET_MAX_CLAUDE and THINKING_BUDGET_MAX_GEMINI moved to models.ts
// (canonical 6-level superset including "tiered").
export const LRU_THINKING_CACHE_SIZE = 100 as const;

export const DEBUG_LOG_MAX_BYTES = 10 * 1024 * 1024;
export const DEBUG_LOG_RETENTION_DAYS = 7 as const;
export const DEBUG_BUFFER_TUI_LINES = 1000 as const;

export const MODALITIES_INPUT = ["text", "image", "pdf"] as const;
export const GOOGLE_SEARCH_TOOL_NAME = "google_search" as const;
export const URL_CONTEXT_TOOL_NAME = "url_context" as const;

export const CONTEXT_WINDOW_ANTIGRAVITY = 1_048_576 as const;
export const OUTPUT_LIMIT_ANTIGRAVITY = 65_535 as const;
// v2.1.15 Phase A: CONTEXT_WINDOW_CLAUDE, OUTPUT_LIMIT_CLAUDE,
// CONTEXT_WINDOW_GPT_OSS and OUTPUT_LIMIT_GPT_OSS moved to models.ts (the
// GPT-OSS canonicals there are 200_000 / 64_000; the divergent local
// 131_072 / 32_768 values had zero consumers and were dropped).

/**
 * FNV-1a 32-bit constants (models.ts and request.ts locals deleted in
 * v2.1.15 Phase B; core.ts's fnv implementations keep their own inline
 * literals so core stays free of cross-module value coupling at the hash
 * primitive level).
 */
export const FNV_OFFSET_BASIS = 2_166_136_261 as const;
export const FNV_PRIME = 16_777_619 as const;

export const CONSTANTS = {
  versionFallback: ANTIGRAVITY_VERSION_FALLBACK,
  versionMinSupported: ANTIGRAVITY_VERSION_MIN_SUPPORTED,
  userAgentFallback: ANTIGRAVITY_USER_AGENT_FALLBACK,
  clientId: ANTIGRAVITY_CLIENT_ID,
  clientSecret: ANTIGRAVITY_CLIENT_SECRET,
  endpoints: ANTIGRAVITY_ENDPOINTS,
  endpointFallbacks: ANTIGRAVITY_ENDPOINT_FALLBACKS,
  codeAssistEndpoints: ENDPOINTS,
  endpointOrder: [ENDPOINTS.PROD, ENDPOINTS.DAILY, ENDPOINTS.SANDBOX] as const,
  geminiCliEndpoint: GEMINI_CLI_ENDPOINT,
  cloudaicompanion: CLOUDAI_COMPANION_ENDPOINT,
  quota: QUOTA_ENDPOINT,
  modelsEndpoint: MODELS_ENDPOINT,
  projectFallback: PROJECT_FALLBACK,
  projectResolution: PROJECT_RESOLUTION_STRATEGY,
  scopes: OAUTH_SCOPES,
} as const;

// ===========================================================================
// Ported v1.0.0 surface (auth/constants) — every unique export preserved
// ===========================================================================

// ---------------------------------------------------------------------------
// V1-01. OAuth client — Gemini CLI official identification
// ---------------------------------------------------------------------------

/**
 * Official Gemini CLI OAuth Client ID (Google Cloud SDK — public client used by the CLI).
 * @constant
 */
export const GEMINI_CLI_OAUTH_CLIENT_ID = [
  "681255809395",
  "-oo8ft2oprdrnp9e3aqf6av3",
  "hmdib135j",
  ".apps.",
  "googleusercontent",
  ".com",
].join("");

/**
 * Official Gemini CLI OAuth Client Secret.
 * @constant
 */
export const GEMINI_CLI_OAUTH_CLIENT_SECRET = ["GOCSPX", "-4uHgMPm", "-1o7Sk-geV6", "Cu5clXFsxl"].join("");

/** Scopes required by Gemini CLI / Cloud Code Assist. */
export const GEMINI_CLI_SCOPES = [
  "https://www.googleapis.com/auth/cloud-platform",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
] as const;

/** Scopes as a query string ready for OAuth. */
export const GEMINI_CLI_SCOPES_JOINED = GEMINI_CLI_SCOPES.join(" ");

// ---------------------------------------------------------------------------
// V1-02. Endpoints — OAuth + versioned bases
// (v2.1.16: CODE_ASSIST_BASE_URL / CODE_ASSIST_PATH_MAP /
// CodeAssistEndpointPath / buildCodeAssistUrl moved up into the main
// endpoints section so every method-path derivation sits below the map.)
// ---------------------------------------------------------------------------

/** Google OAuth endpoints. */
export const OAUTH_ENDPOINTS = {
  /** Authorization code URL */
  AUTH: "https://accounts.google.com/o/oauth2/v2/auth",
  /** Token exchange */
  TOKEN: "https://oauth2.googleapis.com/token",
  /** Userinfo OpenID Connect */
  USERINFO: "https://www.googleapis.com/oauth2/v3/userinfo",
  /** Token info / introspect */
  TOKENINFO: "https://oauth2.googleapis.com/tokeninfo",
  /** Revoke */
  REVOKE: "https://oauth2.googleapis.com/revoke",
} as const;

/**
 * Antigravity versioned endpoint bases (renamed from v1 ANTIGRAVITY_ENDPOINTS
 * to avoid collision with the v2 cascade URL array above).
 * Antigravity routes via cloudcode-pa but with different prefixes per version.
 */
export const ANTIGRAVITY_ENDPOINT_SET = {
  /** v1 — legacy */
  V1_BASE: "https://daily-cloudcode-pa.googleapis.com",
  /** v1internal current */
  V1INTERNAL_BASE: "https://cloudcode-pa.googleapis.com",
  /** v1internal daily (canary) */
  DAILY_V1INTERNAL_BASE: "https://daily-cloudcode-pa.googleapis.com",
  /** autodetect endpoint (resolves cloudcode client) */
  AUTO_BASE: "https://cloudcode-pa.googleapis.com",
} as const;

export const ANTIGRAVITY_VERSION_ENDPOINTS = {
  v1: {
    base: ANTIGRAVITY_ENDPOINT_SET.V1_BASE,
    load: "/v1:loadCodeAssist",
    onboard: "/v1:onboardUser",
  },
  v1internal: {
    base: ANTIGRAVITY_ENDPOINT_SET.V1INTERNAL_BASE,
    load: CODE_ASSIST_PATH_MAP.LOAD_CODE_ASSIST,
    onboard: CODE_ASSIST_PATH_MAP.ONBOARD_USER,
    fetchModels: CODE_ASSIST_PATH_MAP.FETCH_AVAILABLE_MODELS,
    generate: CODE_ASSIST_PATH_MAP.GENERATE_CONTENT,
    streamGenerate: CODE_ASSIST_PATH_MAP.STREAM_GENERATE_CONTENT,
    quota: CODE_ASSIST_PATH_MAP.RETRIEVE_USER_QUOTA,
  },
  "daily-v1internal": {
    base: ANTIGRAVITY_ENDPOINT_SET.DAILY_V1INTERNAL_BASE,
    // v2.1.16: method paths derive from CODE_ASSIST_PATH_MAP (identical values).
    load: CODE_ASSIST_PATH_MAP.LOAD_CODE_ASSIST,
    onboard: CODE_ASSIST_PATH_MAP.ONBOARD_USER,
    fetchModels: CODE_ASSIST_PATH_MAP.FETCH_AVAILABLE_MODELS,
    generate: CODE_ASSIST_PATH_MAP.GENERATE_CONTENT,
    streamGenerate: CODE_ASSIST_PATH_MAP.STREAM_GENERATE_CONTENT,
    quota: CODE_ASSIST_PATH_MAP.RETRIEVE_USER_QUOTA,
  },
} as const;

export type AntigravityVersion = keyof typeof ANTIGRAVITY_VERSION_ENDPOINTS;

// ---------------------------------------------------------------------------
// V1-03. Project ID fallback list
// ---------------------------------------------------------------------------

/** Public fallback Project ID list (seed candidates without billing). */
export const PROJECT_ID_FALLBACKS = [
  "rising-fact-p41fc",
  "rising-fact-p41fc-1",
  "unwritten-orb-463209-q6",
  "cloud-code-123456",
] as const;

// ---------------------------------------------------------------------------
// V1-04. Version pools — simulated real releases
// ---------------------------------------------------------------------------

/**
 * Gemini CLI version pool — date-aware, consulted 2026-08-26 (npm
 * @google/gemini-cli latest = 0.57.0). Canonical of the pool family
 * (v2.1.15 Phase B): the fingerprint.ts 8-entry telemetry superset —
 * strictly grows the former 6-entry constants variant.
 */
export const GEMINI_CLI_VERSION_POOL = [
  "0.57.0",
  "0.56.0",
  "0.55.1",
  "0.54.0",
  "0.53.0",
  "0.52.0",
  "0.51.2",
  "0.50.0",
] as const;

export const CURRENT_GEMINI_CLI_VERSION = "0.57.0" as const;

/** google-api-nodejs-client version pool. */
export const GAPI_CLIENT_VERSION_POOL = ["9.15.1", "9.14.0", "9.15.0", "9.13.0"] as const;

export const CURRENT_GAPI_CLIENT_VERSION = "9.15.1" as const;

/**
 * Node.js gl-node version pool for X-Goog-Api-Client anti-ban rotation —
 * canonical of the pool family (v2.1.15 Phase B): the fingerprint.ts
 * telemetry lineage (real Node LTS values); fingerprint.ts imports this.
 */
export const GL_NODE_VERSION_POOL = [
  "22.19.0",
  "22.16.0",
  "22.14.0",
  "20.19.3",
  "20.18.1",
  "20.17.0",
  "20.11.0",
  "18.20.4",
] as const;

export const CURRENT_GL_NODE_VERSION = "22.19.0" as const;

/**
 * Antigravity CLI (`agy`) version pool from the official update manifest
 * (2026-08-26) — canonical of the pool family (v2.1.15 Phase B: identical
 * 5-entry values merged from auth.ts and fingerprint.ts).
 */
export const ANTIGRAVITY_CLI_VERSION_POOL = ["1.1.21", "1.1.20", "1.1.19", "1.1.18", "1.1.17"] as const;

// v2.1.15 Phase A: the V1-05 raw routing catalog (V1_CATALOG_MODELS +
// ModelVendor + ApiProvider types) and the DEFAULT_MODEL_ID /
// DEFAULT_FALLBACK_MODEL_IDS family moved to models.ts; MODEL_BY_ID and
// MODEL_ROUTING already live there.

// ---------------------------------------------------------------------------
// V1-07. Fingerprint pools — anti-ban randomization
// ---------------------------------------------------------------------------

export type SupportedPlatform = "linux" | "darwin" | "win32";
export type SupportedArch = "x64" | "arm64" | "arm";

export const PLATFORM_POOL: readonly SupportedPlatform[] = ["linux", "darwin", "win32"] as const;

export const ARCH_POOL: readonly SupportedArch[] = ["x64", "arm64"] as const;

export const OS_VERSION_POOL = {
  linux: ["6.8.0-52-generic", "6.5.0-44-generic", "6.11.0-8-generic"] as const,
  darwin: ["24.3.0", "24.2.0", "23.6.0", "24.4.0"] as const,
  win32: ["10.0.26100", "10.0.22631", "10.0.19045"] as const,
} as const;

export const FINGERPRINT_IDE_TYPES = ["IDE_UNSPECIFIED", "VSCODE", "INTELLIJ"] as const;

export const FINGERPRINT_PLATFORMS = ["PLATFORM_UNSPECIFIED", "LINUX", "DARWIN", "WINDOWS"] as const;

export const FINGERPRINT_PLUGIN_TYPES = ["GEMINI", "GEMINI_CLI"] as const;

export const FINGERPRINT_USER_AGENT_SOURCES = ["GitHub", "npm"] as const;

// v2.1.15 Phase B: getRandomPlatformString, pickRandom, getGeminiCLIHeaders,
// getGeminiCLIHeadersWithOptions, getAntigravityHeaders,
// getAntigravityHeadersWithOptions and the GeminiCliHeaderOptions /
// AntigravityHeaderOptions types moved to fingerprint.ts — THE identity
// masquerade owner (pickRandom itself lives in core.js). The raw pools above
// stay here; fingerprint.ts imports them.

// ---------------------------------------------------------------------------
// V1-09. System prompts
// ---------------------------------------------------------------------------

export const SYSTEM_PROMPTS = {
  /** base prompt for code assist */
  CODE_ASSIST_BASE:
    "You are Gemini, a highly capable AI coding assistant integrated into opencode via Antigravity auth.",

  /** prompt for user onboarding */
  ONBOARDING: "Initialize Cloud Code Assist project onboarding for development workflow.",

  /** minimal prompt for quota queries */
  QUOTA_QUERY: "quota_retrieve",

  /** safety prompt — preserves IDE behavior */
  IDE_PRESERVE: "Respond as the integrated IDE code assistance. Maintain context awareness and file system access.",
} as const;

// ---------------------------------------------------------------------------
// V1-10. File paths — resolvers honoring OPENCODE_CONFIG_DIR with fallback
// ---------------------------------------------------------------------------

/** Resolves the config base dir: process.env.OPENCODE_CONFIG_DIR or ~/.config/opencode/. */
export function resolveOpenCodeBaseDir(): string {
  const envDir = process.env.OPENCODE_CONFIG_DIR?.trim();
  if (envDir && envDir.length > 0) {
    return nodePath.resolve(envDir);
  }
  return nodePath.join(homedir(), ".config", "opencode");
}

/** Resolves critical plugin file paths. */
export const FILE_PATHS = {
  /** dynamic getter — avoids caching in tests */
  get baseDir(): string {
    return resolveOpenCodeBaseDir();
  },

  get authDir(): string {
    return nodePath.join(resolveOpenCodeBaseDir(), "auth");
  },

  get tokenFile(): string {
    return nodePath.join(resolveOpenCodeBaseDir(), "auth", "gemini-cli-tokens.json");
  },

  get credentialsFile(): string {
    return nodePath.join(resolveOpenCodeBaseDir(), "auth", "antigravity-credentials.json");
  },

  get projectFile(): string {
    return nodePath.join(resolveOpenCodeBaseDir(), "auth", "project-id.json");
  },

  get configFile(): string {
    return nodePath.join(resolveOpenCodeBaseDir(), "opencode.json");
  },

  get cacheDir(): string {
    return nodePath.join(resolveOpenCodeBaseDir(), "cache", "antigravity");
  },

  get quotaCacheFile(): string {
    return nodePath.join(resolveOpenCodeBaseDir(), "cache", "antigravity", "quota.json");
  },

  get modelsCacheFile(): string {
    return nodePath.join(resolveOpenCodeBaseDir(), "cache", "antigravity", "models.json");
  },

  /** resolves a custom sub-path inside baseDir */
  resolve(...segments: string[]): string {
    return nodePath.join(resolveOpenCodeBaseDir(), ...segments);
  },

  /**
   * Isolated credential directory — platform-agnostic and user-overridable.
   * Resolution order (NO hardcoded machine paths):
   *   1. MAENE_ISOLATED_DIR env (explicit user override)
   *   2. <baseDir>/auth (beside the rest of the maene state)
   */
  get isolatedDir(): string {
    const override = process.env.MAENE_ISOLATED_DIR?.trim();
    if (override) return nodePath.resolve(override);
    return nodePath.join(resolveOpenCodeBaseDir(), "auth");
  },
} as const;

// ---------------------------------------------------------------------------
// V1-11. Quota groups & limits
// ---------------------------------------------------------------------------

// v2.1.16 dead-code cleanup: QUOTA_GROUPS, QUOTA_GROUP_MAP and the
// QuotaGroupDef interface had zero consumers repo-wide (the live quota-group
// routing lives in quota.ts QUOTA_GROUP_DEFS) and were deleted.

// ---------------------------------------------------------------------------
// V1-12. Retry / timeout / version-fallback policies
// ---------------------------------------------------------------------------

export const VERSION_FALLBACK_CHAIN: readonly AntigravityVersion[] = ["v1internal", "daily-v1internal", "v1"] as const;

export const RETRY_POLICY = {
  maxRetries: 3,
  baseDelayMs: 500,
  maxDelayMs: 5000,
  jitter: true,
  retryOn: [429, 500, 502, 503, 504] as const,
} as const;

export const TIMEOUTS = {
  OAUTH_MS: 15_000,
  LOAD_CODE_ASSIST_MS: 20_000,
  GENERATE_MS: 120_000,
  STREAM_MS: 300_000,
  QUOTA_MS: 10_000,
} as const;

export const PLUGIN_VERSION = "2.0.0" as const;

// ---------------------------------------------------------------------------
// V1-13. Complete fingerprint & anti-ban pools
// ---------------------------------------------------------------------------

export const FINGERPRINT_POOLS = {
  cliVersions: GEMINI_CLI_VERSION_POOL,
  gapiVersions: GAPI_CLIENT_VERSION_POOL,
  nodeVersions: GL_NODE_VERSION_POOL,
  platforms: PLATFORM_POOL,
  archs: ARCH_POOL,
  osVersions: OS_VERSION_POOL,
  ideTypes: FINGERPRINT_IDE_TYPES,
  platformMetas: FINGERPRINT_PLATFORMS,
  pluginTypes: FINGERPRINT_PLUGIN_TYPES,
  /** random delay between requests to avoid rate-ban fingerprinting (ms) */
  antiBanDelayMs: {
    min: 80,
    max: 350,
  },
} as const;

/** Generates a randomized anti-ban delay. */
export function getAntiBanDelayMs(): number {
  const { min, max } = FINGERPRINT_POOLS.antiBanDelayMs;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ---------------------------------------------------------------------------
// V1-14. Compatibility barrel
// ---------------------------------------------------------------------------

// v2.1.16 dead-code cleanup: the CONSTANTS_V1 barrel had zero consumers
// repo-wide and was deleted together with its QUOTA_GROUPS member (the live
// v1 compatibility surface is the named exports above plus the CONSTANTS
// namespace object and the default export below).

export default CONSTANTS;
