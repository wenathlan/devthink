/**
 * @file maene-index.ts
 * @description Barrel ESM re-exporting the maene lineage of the grand merge —
 * library-first, root-first. The maene family modules landed in devthink with
 * their merge renames (auth became maene-auth, cli became maene-cli, debug
 * became maene-debug, version became maene-version, plugin became antigravity)
 * while the same-named modules (constants, config, models, accounts,
 * fingerprint, project, quota, recovery, search, core, request, streaming)
 * kept their names, so every historical import path of the maene surface
 * resolves through this barrel again.
 *
 * The 22 namespace re-exports keep the historical surface: several siblings
 * (constants/config/auth/accounts/fingerprint/search) intentionally share
 * exported names such as PROJECT_FALLBACK, MODELS_2026 or OAUTH_SCOPES —
 * every feature stays reachable through its module namespace below. The
 * v2.1.14 consolidation history rides the mapping: oauth.ts merged into
 * maene-auth.ts, request-helpers merged into request.ts, system merged into
 * config.ts (with the debug utilities in maene-debug.ts) — the OAuth,
 * RequestHelpers and System namespaces below alias the consolidated modules
 * so every historical import path keeps resolving.
 */

export * as Constants from "./constants.js";
export * as Fingerprint from "./fingerprint.js";
// v2.1.14: oauth.ts was consolidated into auth.ts; namespace kept for compat.
export * as OAuth from "./maene-auth.js";
export * as Accounts from "./accounts.js";
// v2.1.14: antigravity-cli.ts is a compatibility shim over auth.ts.
export * as AntigravityCli from "./antigravity-cli.js";

// merged group additions: auth/core/system/models namespaces
export * as Auth from "./maene-auth.js";
export * as Core from "./core.js";
/** System — the v2.1.14 system utilities surface: config.ts absorbed the
 * system module (cfgDir, the version fallback chain, atomic writes, the
 * legacy validator aliases and the raw JSON IO helpers) while the debug
 * utilities (logsDir, redactSecrets, the debugLogger singleton) live in
 * maene-debug.ts, so the namespace carries exactly the exports the system
 * shim used to publish. */
import {
  atomicWrite,
  cfgDir,
  fetchVersionChain,
  loadConfigRaw,
  saveConfigRaw,
  validateEmail,
  validateModelId,
  validateModelIdCharset,
  validateProjectId,
  validateSemver,
  VERSION_FALLBACK,
} from "./config.js";
import { debugLogger, logsDir, redactSecrets } from "./maene-debug.js";
export const System = {
  atomicWrite,
  cfgDir,
  fetchVersionChain,
  loadConfigRaw,
  saveConfigRaw,
  validateEmail,
  validateModelId,
  validateModelIdCharset,
  validateProjectId,
  validateSemver,
  VERSION_FALLBACK,
  debugLogger,
  logsDir,
  redactSecrets,
};
export * as Models from "./models.js";
export * as Models2026 from "./models.js";

export * as Project from "./project.js";
export * as Quota from "./quota.js";
export * as Config from "./config.js";
export * as Debug from "./maene-debug.js";
export * as Version from "./maene-version.js";
// v2.1.14: request-helpers.ts was consolidated into request.ts; namespace kept for compat.
export * as RequestHelpers from "./request.js";
export * as Request from "./request.js";
export * as Streaming from "./streaming.js";
export * as Recovery from "./recovery.js";
export * as Search from "./search.js";
export * as CLI from "./maene-cli.js";
export * as PluginModule from "./antigravity.js";

// default plugin export for opencode compatibility (the merged antigravity.ts)
export { default, default as plugin, getPlugin } from "./antigravity.js";

// v2.1.16 single-owner doctrine: VERSION derives from constants.js
// PLUGIN_VERSION (raw value owner) and the two bypass aggregates assemble
// every value from its owner module instead of locally-reassembled literals.
import {
  CLOUDCODE_BASE_URL,
  CLIENT_METADATA_STRING,
  CODE_ASSIST_PATH_MAP,
  GEMINI_CLI_OAUTH_CLIENT_ID,
  GEMINI_CLI_OAUTH_CLIENT_SECRET,
  GEMINI_CLI_USER_AGENT,
  PLUGIN_VERSION,
  PROJECT_FALLBACK,
} from "./constants.js";
import {
  ANTIGRAVITY_CLI_GRPC_VERSION,
  ANTIGRAVITY_CLI_OAUTH_SCOPES,
  ANTIGRAVITY_CLI_REDIRECT_OFFICIAL,
  ANTIGRAVITY_CLI_VERSION_LATEST,
  CLIENT_ID as ANTIGRAVITY_CLI_CLIENT_ID,
  CLIENT_SECRET as ANTIGRAVITY_CLI_CLIENT_SECRET,
} from "./maene-auth.js";
import { X_GOOG_API_CLIENT_GEMINI_CLI } from "./fingerprint.js";

// version / identity
export const VERSION: string = PLUGIN_VERSION;
export const PLUGIN_ID = "maene" as const;

// headline model catalog re-exports
export { ALL_MODELS_2026, MODEL_BY_ID, MODEL_ROUTING } from "./models.js";

/**
 * Gemini CLI bypass aggregate: exact identification the official Gemini CLI
 * sends when talking to cloudcode-pa. Consumed by bypass flows that must not
 * require a user project id. Every value is imported from its owner — the
 * OAuth pair, UA, Client-Metadata string, project fallback and base URL from
 * constants.js, the gl-node snapshot from fingerprint.js and the v1internal
 * method paths via constants.js CODE_ASSIST_PATH_MAP.
 */
export const GEMINI_CLI_BYPASS = {
  clientId: GEMINI_CLI_OAUTH_CLIENT_ID,
  clientSecret: GEMINI_CLI_OAUTH_CLIENT_SECRET,
  userAgent: GEMINI_CLI_USER_AGENT,
  xGoogApiClient: X_GOOG_API_CLIENT_GEMINI_CLI,
  clientMetadata: CLIENT_METADATA_STRING,
  fallbackProject: PROJECT_FALLBACK,
  endpoints: {
    loadCodeAssist: `${CLOUDCODE_BASE_URL}${CODE_ASSIST_PATH_MAP.LOAD_CODE_ASSIST}`,
    generateContent: `${CLOUDCODE_BASE_URL}${CODE_ASSIST_PATH_MAP.GENERATE_CONTENT}`,
    streamGenerateContent: `${CLOUDCODE_BASE_URL}${CODE_ASSIST_PATH_MAP.STREAM_GENERATE_CONTENT}`,
  },
  /** Isolated credential dir — resolved per-OS at runtime, never hardcoded. */
  isolatedDir: "MAENE_ISOLATED_DIR | <opencode-base>/auth",
} as const;

/**
 * Antigravity CLI bypass aggregate: identification of the official `agy`
 * binary (extracted from the distributed CLI and live-validated 2026-08-26).
 * The client maene presents for NEW logins since 2.1.8: the client pair,
 * scopes, official redirect URI and version parts come from maene-auth.js
 * (the authentication owner — CLIENT_ID/CLIENT_SECRET are env-overridable
 * there, so the aggregate tracks the same override); the UA and
 * X-Goog-Api-Client keep their static linux/amd64 snapshot shape, composed
 * from the maene-auth.js version constants.
 */
export const ANTIGRAVITY_CLI_BYPASS = {
  clientId: ANTIGRAVITY_CLI_CLIENT_ID,
  clientSecret: ANTIGRAVITY_CLI_CLIENT_SECRET,
  userAgent: `antigravity-cli/${ANTIGRAVITY_CLI_VERSION_LATEST} (linux; amd64)`,
  xGoogApiClient: `antigravity-cli/${ANTIGRAVITY_CLI_VERSION_LATEST} grpc-go/${ANTIGRAVITY_CLI_GRPC_VERSION}`,
  redirectUriOfficial: ANTIGRAVITY_CLI_REDIRECT_OFFICIAL,
  scopes: ANTIGRAVITY_CLI_OAUTH_SCOPES,
  usesPKCE: true,
  appLabel: "Google Antigravity",
} as const;
