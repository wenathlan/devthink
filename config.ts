import { copyFileSync, existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { homedir, platform } from "node:os";
import { join } from "node:path";

export type DevThinkConfig = {
  activeProvider?: string | undefined;
  activeModel?: string | undefined;
  provider?: string;
  model?: string;
  mode?: string;
  baseUrl?: string;
  apiKey?: string;
  anthropicApiKey?: string;
  googleApiKey?: string;
  zaiApiKey?: string;
  temperature?: number;
  maxTokens?: number;
  projectMemory?: boolean;
  externalMemory?: boolean;
  fallbackProviders?: string[];
  providers?: Record<
    string,
    {
      baseUrl?: string;
      apiKey?: string;
      model?: string;
      transport?: "official" | "openai-compatible" | "local-gateway";
      auth?: { kind: "api-key" | "bearer" | "oauth"; value?: string; expiresAt?: number };
    }
  >;
  gateway?: { mode?: "embedded"; stream?: boolean; host?: string };
  web?: {
    enabled?: boolean;
    pagesUrl?: string;
    gatewayUrl?: string;
    allowedOrigins?: string[];
    remoteSync?: { enabled?: boolean; endpoint?: string };
  };
};

export type AuthKind = "api-key" | "bearer" | "oauth";
export type AuthCredential = {
  kind: AuthKind;
  value?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number | undefined;
  resourceUrl?: string;
  updatedAt: string;
};
export type DevThinkAuth = { version: 1; providers: Record<string, AuthCredential> };

export type DevThinkPaths = {
  home: string;
  config: string;
  auth: string;
  identity: string;
  pairings: string;
  legacyConfig: string;
  sessions: string;
  workspaces: string;
  database: string;
  legacyDatabase: string;
  memory: string;
  logs: string;
};

function resolveHome(): string {
  const override = process.env.DEVTHINK_HOME?.trim();
  if (override) return override;
  if (platform() === "win32") return join(process.env.APPDATA || homedir(), "devthink");
  if (platform() === "darwin") return join(homedir(), "Library", "Application Support", "devthink");
  return join(process.env.XDG_CONFIG_HOME || join(homedir(), ".config"), "devthink");
}

export function resolvePaths(root = resolveHome()): DevThinkPaths {
  return {
    home: root,
    config: join(root, "devthink.json"),
    auth: join(root, "auth.json"),
    identity: join(root, "identity.json"),
    pairings: join(root, "pairings.json"),
    legacyConfig: join(root, "config.json"),
    sessions: join(root, "sessions"),
    workspaces: join(root, "workspaces"),
    database: join(root, "devthink.db"),
    legacyDatabase: join(root, "devthink.sqlite"),
    memory: join(root, "memory"),
    logs: join(root, "logs"),
  };
}

export function ensurePaths(paths = resolvePaths()): DevThinkPaths {
  for (const path of [paths.home, paths.sessions, paths.workspaces, paths.memory, paths.logs])
    mkdirSync(path, { recursive: true });
  if (!existsSync(paths.database) && existsSync(paths.legacyDatabase)) {
    try {
      copyFileSync(paths.legacyDatabase, paths.database);
    } catch {
      /* The JSON session records remain the safe compatibility fallback. */
    }
  }
  return paths;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function writeJson(path: string, value: unknown, mode?: number): void {
  const temporary = `${path}.${process.pid}.${Date.now()}.tmp`;
  writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, mode ? { encoding: "utf8", mode } : "utf8");
  renameSync(temporary, path);
}

export function readConfig(paths = resolvePaths()): DevThinkConfig {
  try {
    const candidate = existsSync(paths.config) ? paths.config : paths.legacyConfig;
    if (!existsSync(candidate)) return {};
    const parsed: unknown = JSON.parse(readFileSync(candidate, "utf8"));
    if (!isRecord(parsed)) return {};
    const config = parsed as DevThinkConfig;
    return {
      ...config,
      activeProvider: config.activeProvider || config.provider,
      activeModel: config.activeModel || config.model,
    };
  } catch {
    return {};
  }
}

export function saveConfig(config: DevThinkConfig, paths = resolvePaths()): void {
  ensurePaths(paths);
  writeJson(paths.config, {
    ...config,
    activeProvider: config.activeProvider || config.provider,
    activeModel: config.activeModel || config.model,
    gateway: { mode: "embedded" as const, stream: true, ...config.gateway },
  });
}

const forbiddenAuthFields = new Set([
  "cookie",
  "cookies",
  "fingerprint",
  "useragent",
  "sessiontoken",
  "captcha",
  "browserprofile",
]);

function validCredential(value: unknown): AuthCredential | undefined {
  if (!isRecord(value) || Object.keys(value).some((key) => forbiddenAuthFields.has(key.toLowerCase())))
    return undefined;
  const kind = String(value.kind) as AuthKind;
  if (!["api-key", "bearer", "oauth"].includes(kind)) return undefined;
  const token = typeof value.value === "string" ? value.value : undefined;
  const accessToken = typeof value.accessToken === "string" ? value.accessToken : undefined;
  const refreshToken = typeof value.refreshToken === "string" ? value.refreshToken : undefined;
  if ((kind === "oauth" && !accessToken) || (kind !== "oauth" && !token)) return undefined;
  return {
    kind,
    ...(token ? { value: token } : {}),
    ...(accessToken ? { accessToken } : {}),
    ...(refreshToken ? { refreshToken } : {}),
    ...(typeof value.expiresAt === "number" ? { expiresAt: value.expiresAt } : {}),
    ...(typeof value.resourceUrl === "string" ? { resourceUrl: value.resourceUrl } : {}),
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : new Date().toISOString(),
  };
}

export function readAuth(paths = resolvePaths()): DevThinkAuth {
  try {
    if (!existsSync(paths.auth)) return { version: 1, providers: {} };
    const parsed: unknown = JSON.parse(readFileSync(paths.auth, "utf8"));
    if (!isRecord(parsed) || !isRecord(parsed.providers)) return { version: 1, providers: {} };
    const providers: Record<string, AuthCredential> = {};
    for (const [provider, raw] of Object.entries(parsed.providers)) {
      const credential = validCredential(raw);
      if (credential) providers[provider.toLowerCase()] = credential;
    }
    return { version: 1, providers };
  } catch {
    return { version: 1, providers: {} };
  }
}

export function saveAuth(auth: DevThinkAuth, paths = resolvePaths()): void {
  ensurePaths(paths);
  const providers: Record<string, AuthCredential> = {};
  for (const [provider, raw] of Object.entries(auth.providers)) {
    const credential = validCredential(raw);
    if (credential) providers[provider.toLowerCase()] = credential;
  }
  writeJson(paths.auth, { version: 1, providers }, 0o600);
}

export function setAuthCredential(
  provider: string,
  credential: Omit<AuthCredential, "updatedAt">,
  paths = resolvePaths(),
): DevThinkAuth {
  const next = { ...credential, updatedAt: new Date().toISOString() };
  if (!validCredential(next))
    throw new Error("Credential must use an official api-key, bearer, or OAuth shape without browser-session fields.");
  const current = readAuth(paths);
  const auth = { version: 1 as const, providers: { ...current.providers, [provider.toLowerCase()]: next } };
  saveAuth(auth, paths);
  return auth;
}

export function clearAuthCredential(provider: string, paths = resolvePaths()): DevThinkAuth {
  const current = readAuth(paths);
  const providers = { ...current.providers };
  delete providers[provider.toLowerCase()];
  const auth = { version: 1 as const, providers };
  saveAuth(auth, paths);
  return auth;
}

export function migrateLegacyCredentials(
  config: DevThinkConfig,
  paths = resolvePaths(),
): { config: DevThinkConfig; migrated: string[] } {
  const current = readAuth(paths);
  const providers = { ...current.providers };
  const nextConfig: DevThinkConfig = { ...config, providers: { ...config.providers } };
  const migrated: string[] = [];
  for (const [provider, settings] of Object.entries(config.providers || {})) {
    const legacy = settings.auth?.value || settings.apiKey;
    if (!legacy || providers[provider]) continue;
    const kind = settings.auth?.kind || "api-key";
    providers[provider] =
      kind === "oauth"
        ? { kind, accessToken: legacy, expiresAt: settings.auth?.expiresAt, updatedAt: new Date().toISOString() }
        : { kind, value: legacy, expiresAt: settings.auth?.expiresAt, updatedAt: new Date().toISOString() };
    const { auth: _auth, apiKey: _apiKey, ...rest } = settings;
    nextConfig.providers![provider] = rest;
    migrated.push(provider);
  }
  for (const [provider, property] of Object.entries({
    openai: "apiKey",
    anthropic: "anthropicApiKey",
    google: "googleApiKey",
    zai: "zaiApiKey",
  })) {
    const value = nextConfig[property as keyof DevThinkConfig];
    if (typeof value === "string" && value && !providers[provider]) {
      providers[provider] = { kind: "api-key", value, updatedAt: new Date().toISOString() };
      delete (nextConfig as Record<string, unknown>)[property];
      migrated.push(provider);
    }
  }
  saveAuth({ version: 1, providers }, paths);
  saveConfig(nextConfig, paths);
  return { config: nextConfig, migrated };
}

export function getConfigValue(config: DevThinkConfig, key: string): unknown {
  return (config as Record<string, unknown>)[key];
}

export function setConfigValue(config: DevThinkConfig, key: string, value: unknown): DevThinkConfig {
  return { ...config, [key]: value };
}

export function resolveCredential(
  provider: string,
  config: DevThinkConfig,
  paths = resolvePaths(),
): string | undefined {
  const auth = readAuth(paths).providers[provider.toLowerCase()];
  if (auth) {
    if (auth.kind === "oauth" && auth.expiresAt && auth.expiresAt <= Date.now())
      throw new Error(
        `Official OAuth credential for ${provider} has expired. Reauthenticate with the provider-owned flow.`,
      );
    return auth.kind === "oauth" ? auth.accessToken : auth.value;
  }
  const envNames: Record<string, string[]> = {
    openai: ["OPENAI_API_KEY"],
    anthropic: ["ANTHROPIC_API_KEY"],
    google: ["GOOGLE_API_KEY", "GEMINI_API_KEY"],
    zai: ["ZAI_API_KEY"],
    qwen: ["QWEN_API_KEY"],
    openrouter: ["OPENROUTER_API_KEY"],
    deepseek: ["DEEPSEEK_API_KEY"],
    groq: ["GROQ_API_KEY"],
    mistral: ["MISTRAL_API_KEY"],
    xai: ["XAI_API_KEY"],
    ollama: ["OLLAMA_API_KEY"],
    mimo: ["MIMO_API_KEY"],
  };
  for (const name of envNames[provider.toLowerCase()] || []) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }
  const property = `${provider}ApiKey` as keyof DevThinkConfig;
  const nested = config.providers?.[provider];
  const legacy = config[property];
  const legacyValue = typeof legacy === "string" ? legacy : undefined;
  return (
    nested?.auth?.value ||
    nested?.apiKey ||
    legacyValue ||
    (provider === (config.activeProvider || config.provider) ? config.apiKey : undefined) ||
    process.env.DEVTHINK_API_KEY?.trim()
  );
}

export function redactValue(value: unknown): unknown {
  if (typeof value !== "string") return value;
  if (value.length < 8) return "[redacted]";
  return `${value.slice(0, 3)}...${value.slice(-3)}`;
}

export function redactAuth(auth: DevThinkAuth): Record<string, unknown> {
  return {
    version: auth.version,
    providers: Object.fromEntries(
      Object.entries(auth.providers).map(([provider, credential]) => [
        provider,
        {
          kind: credential.kind,
          ...(credential.value ? { value: redactValue(credential.value) } : {}),
          ...(credential.accessToken ? { accessToken: redactValue(credential.accessToken) } : {}),
          ...(credential.refreshToken ? { refreshToken: redactValue(credential.refreshToken) } : {}),
          ...(credential.expiresAt ? { expiresAt: credential.expiresAt } : {}),
          ...(credential.resourceUrl ? { resourceUrl: credential.resourceUrl } : {}),
          updatedAt: credential.updatedAt,
        },
      ]),
    ),
  };
}

export function redactConfig(config: DevThinkConfig): Record<string, unknown> {
  const sensitive = new Set(["apiKey", "anthropicApiKey", "googleApiKey", "zaiApiKey"]);
  return Object.fromEntries(
    Object.entries(config).map(([key, value]) => {
      if (key === "providers" && value && typeof value === "object") {
        const providers = Object.fromEntries(
          Object.entries(value as Record<string, Record<string, unknown>>).map(([id, settings]) => [
            id,
            Object.fromEntries(
              Object.entries(settings).map(([setting, item]) => {
                if (setting === "apiKey") return [setting, redactValue(item)];
                if (setting === "auth" && item && typeof item === "object") {
                  const auth = item as Record<string, unknown>;
                  return [setting, { ...auth, value: redactValue(auth.value) }];
                }
                return [setting, item];
              }),
            ),
          ]),
        );
        return [key, providers];
      }
      return [key, sensitive.has(key) || key.toLowerCase().endsWith("apikey") ? redactValue(value) : value];
    }),
  );
}

export function parseConfigValue(raw: string): unknown {
  if (raw === "true") return true;
  if (raw === "false") return false;
  if (/^-?\d+$/.test(raw)) return Number.parseInt(raw, 10);
  if (/^-?\d+\.\d+$/.test(raw)) return Number.parseFloat(raw);
  if (raw.startsWith("[") || raw.startsWith("{")) {
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  }
  return raw;
}

/* ════════════════════════════════════════════════════════════════════
   Section: the provider antigravity configuration (the 2.1.16 config owner
   absorbed by the grand merge — validators, atomic writes, the embedded
   JSON schema and the antigravity runtime defaults ride as ordinal
   sections of the merged configuration domain; zero symbol overlap).
   ════════════════════════════════════════════════════════════════════ */
/**
 * @file config.ts
 * @module provider/config
 * @description
 *  THE single configuration-management module of the merged provider lineage — v2.1.14
 *  consolidation of config.ts + validate.ts + system.ts into one file
 *  (one file per correlated context, per the governance skill).
 *  Merged configuration module — v2 schema-driven base with the complete
 *  v1 surface ported on top. Nothing from either version was dropped.
 *
 *  Third-person observer: the library watches how Antigravity Manager
 *  and Gemini CLI persist user preferences and reproduces that contract
 *  without depending on their runtime. The observer never leaks secrets,
 *  validates production inputs strictly, and enforces chmod 600 on disk.
 *
 *  Layout: library-first, root-first.
 *  Runtime: only node:* builtins + global fetch (Node >=18). Zero external deps.
 *
 *  Merge notes (conflict resolutions):
 *  - v2.1.14 consolidation             : the validation helpers (former
 *    validate.ts, deleted) and the system utilities (former system.ts, now a
 *    pure compatibility re-export shim for the published ./system subpath)
 *    live in the trailing sections of this file. Canonical names resolve to
 *    the hardened implementations; legacy names survive as documented
 *    aliases or renames.
 *  - loadConfig / agsaveConfig          : v1 synchronous cached API keeps the
 *    original names because existing modules import them synchronously.
 *    The minimal raw JSON IO helpers of the former system.ts survive under
 *    the renamed loadConfigRaw / saveConfigRaw.
 *  - loadConfigAsync / saveConfigAsync: v2 asynchronous implementations are
 *    exposed under these names (the names already existed in v1 as thin
 *    wrappers; the v2 implementations absorb that contract).
 *  - AntigravityConfig                : single interface covering both the
 *    v1 field set and the v2 field set.
 *  - ConfigValidationError            : single class accepting both the v1
 *    constructor (string error list) and the v2 constructor
 *    (message + structured ValidationError list).
 *  - isValidEmail / isValidSemver /
 *    isValidProjectId / validateAccount / validateModelId: canonical hardened
 *    validators from the former validate.ts (ReDoS-safe, documented).
 *  - validateEmail / validateSemver /
 *    validateProjectId                 : legacy system.ts names kept as
 *    one-line aliases of the canonical validators above.
 *  - validateModelIdCharset           : former system.ts validateModelId
 *    charset regex variant, renamed because the canonical validateModelId
 *    is the semantic gemini/claude/antigravity check.
 *
 *  Contract:
 *  - Path: ~/.config/opencode/antigravity.json (honors OPENCODE_CONFIG_DIR
 *    and XDG_CONFIG_HOME)
 *  - Schema: JSON Schema Draft-07 compatible
 *  - Persistence: atomic write (tmp + chmod 600 + rename), dir 0755/0700
 *  - Defaults: cli_first, rotation round-robin, quota_refresh 15min,
 *    google_search enabled, debug off
 *
 *  Bypass metadata documented in schema description:
 *  Antigravity bypass relies on mimicking antigravity/{ver} {os}/{arch} UA
 *  and bypassing x-goog-user-project stripping, endpoint cascade 403/404/5xx.
 *
 * @author devthink
 * @license MIT
 * @version 2.1.16
 */

import * as fs from "node:fs";
import * as fsp from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";
import * as crypto from "node:crypto";

// ---------------------------------------------------------------------------
// Gemini CLI bypass identity constants (v1) — OAuth client, headers, models
// ---------------------------------------------------------------------------

/**
 * OAuth2 Client ID of the Gemini CLI (Google Cloud Code).
 * @readonly
 */
// v2.1.15 Phase C: OAUTH_CLIENT_ID (gemini-cli pair) moved to constants.js
// as GEMINI_CLI_OAUTH_CLIENT_ID — imported and re-exported below.

/**
 * OAuth2 Client Secret of the Gemini CLI.
 * @readonly
 * @security This secret is public inside the Gemini CLI binary; it is not a private secret.
 */

/**
 * OAuth scopes required for Cloud Code + identity.
 * @readonly
 */
// v2.1.15 Phase C: OAUTH_SCOPES (3-scope Gemini CLI set) is constants.js
// GEMINI_CLI_SCOPES — imported from the owner.

/**
 * OAuth scopes as a space-separated string, ready for token requests.
 */
export const OAUTH_SCOPE_STRING = OAUTH_SCOPES.join(" ");

/**
 * Canonical Gemini CLI User-Agent.
 * Format: GeminiCLI/<version>/<default-model> (<platform>; <arch>; GitHub) google-api-nodejs-client/<gaxios-ver>
 * Note: platform varies to avoid static fingerprinting.
 * @readonly
 */
// v2.1.15 Phase C: GEMINI_CLI_USER_AGENT (full UA value) was
// byte-identical to constants.GEMINI_CLI_USER_AGENT — imported from the owner.

/** Fingerprinted google-api-nodejs-client version. */
export const GOOGLE_API_CLIENT_VERSION = "9.15.1" as const;

/** Fingerprinted GeminiCLI version. */
export const GEMINI_CLI_VERSION = "0.57.0" as const;

/** Default model announced in the User-Agent. */
export const GEMINI_CLI_DEFAULT_MODEL = "gemini-3-pro-preview" as const;

/**
 * X-Goog-Api-Client header value (Node.js runtime fingerprint).
 * @readonly
 */

/**
 * Client metadata used for bypass (IDE_UNSPECIFIED = pure CLI).
 * @readonly
 */

/**
 * Client-Metadata serialized as an `X-Goog-Client-Metadata` header string / payload.
 */

/**
 * Project fallback when the cloud project cannot be resolved via loadCodeAssist.
 * @readonly
 */

/** Cloud Code Assist PA (Playground API) base endpoints. */

// v2.1.15 Phase A: MODELS_2026 (the 11-id legacy bypass list) and the
// Model2026 union moved to models.ts (MODELS_2026_LEGACY / Model2026) —
// imported under the historical name and re-exported so the public surface
// is unchanged.
import { MODELS_2026_LEGACY as MODELS_2026 } from "./models.js";
import type { RotationStrategy } from "./accounts.js";
export type { RotationStrategy };
// v2.1.15 Phase B: identity masquerade (gemini UA builder, gl-node api-client
// snapshot) comes from fingerprint.js; raw shared values (client metadata,
// project fallback, cloudcode endpoints) come from constants.js.
import { buildGeminiUserAgent, X_GOOG_API_CLIENT_GEMINI_CLI as X_GOOG_API_CLIENT } from "./fingerprint.js";
import {
  CLIENT_METADATA,
  CLIENT_METADATA_STRING,
  CLOUDCODE_BASE_URL,
  CLOUDCODE_ENDPOINTS,
  GEMINI_CLI_OAUTH_CLIENT_ID as OAUTH_CLIENT_ID,
  GEMINI_CLI_OAUTH_CLIENT_SECRET as OAUTH_CLIENT_SECRET,
  GEMINI_CLI_SCOPES as OAUTH_SCOPES,
  GEMINI_CLI_USER_AGENT,
  PROJECT_FALLBACK,
} from "./constants.js";
import type { Model2026 } from "./models.js";
export { MODELS_2026 };
export type { Model2026 };

// ---------------------------------------------------------------------------
// Dynamic user-agent helpers (v1) — platform variation anti-fingerprinting
// ---------------------------------------------------------------------------

/**
 * Normalized platform tuple used for UA fingerprinting.
 * Converts Node os.platform()/arch() into the strings Google expects.
 */
export type PlatformTuple = {
  platform: string;
  arch: string;
};

/**
 * Returns the platform/arch tuple in the format used by the official UA.
 * Example: linux -> linux, darwin -> darwin, win32 -> win32
 * @returns {PlatformTuple}
 */
export function getPlatformTuple(): PlatformTuple {
  const p = os.platform(); // linux, darwin, win32
  const a = os.arch(); // x64, arm64, etc.

  // Normalize arch to what the Gemini CLI announces
  let archNormalized = a;
  if (a === "x64") archNormalized = "x64";
  else if (a === "arm64") archNormalized = "arm64";
  else if (a === "arm") archNormalized = "arm";
  // keep other values unchanged

  // Platform is already normalized; just enforce lower-case
  const platformNormalized = p.toLowerCase();

  return { platform: platformNormalized, arch: archNormalized };
}

/**
 * Builds the GeminiCLI User-Agent dynamically, varying the platform.
 * Avoids static fingerprinting at the WAF level.
 *
 * Template: GeminiCLI/<cliVersion>/<model> (<platform>; <arch>; GitHub) google-api-nodejs-client/<gclientVersion>
 *
 * @param overrides - optional override of platform / cliVersion / model
 * @returns User-Agent string ready for the `User-Agent` header
 */

/**
 * Builds a dynamic X-Goog-Api-Client header based on the current Node version,
 * falling back to the static constant when process.versions is unavailable.
 */
export function buildXGoogApiClient(): string {
  try {
    const nodeVer = typeof process !== "undefined" && process.versions?.node ? process.versions.node : "22.19.0";
    return `gl-node/${nodeVer}`;
  } catch {
    return X_GOOG_API_CLIENT;
  }
}

/** Complete identification headers for bypass. */
export function getBypassHeaders(): Record<string, string> {
  return {
    "User-Agent": buildGeminiUserAgent(),
    "X-Goog-Api-Client": buildXGoogApiClient(),
    "Client-Metadata": CLIENT_METADATA_STRING,
    "X-Goog-Client-Metadata": CLIENT_METADATA_STRING,
  };
}

// ---------------------------------------------------------------------------
// File system constants — observer enforces secure perms
// ---------------------------------------------------------------------------

const CONFIG_FILE_NAME = "antigravity.json" as const;
/* The literal rides the constant instead of the top-level path.join the devthink lineage computed at import time: the grand merge folded this module into the shared core graph the platform-portable bundles ship, and a stubbed browser bundle must never call a node builtin at module evaluation. */
const CONFIG_DIR_TAIL = ".config/opencode";
const FILE_MODE = 0o600 as const;
const DIR_MODE = 0o755 as const;
const CONFIG_DIR_NAME = "opencode" as const;

// ---------------------------------------------------------------------------
// Rotation strategy — requirement: round-robin / sticky
// ---------------------------------------------------------------------------

// v2.1.15 Phase C: RotationStrategy moved to accounts.js (rotation owner) —
// imported type-only (erased at runtime; no cycle with accounts.js).

export const ROTATION_STRATEGIES = ["round-robin", "sticky"] as const;

// ---------------------------------------------------------------------------
// Toast scope and quota fallback modes (v1)
// ---------------------------------------------------------------------------

/** Notification/toast display scope for opencode. */
export type ToastScope = "all" | "project" | "minimal" | "none";

/**
 * Quota fallback mode.
 * - true: enables automatic fallback to a reserve model
 * - false: disables fallback, hard failure on 429
 * - "auto": system picks the best model with remaining quota
 * - string: specific model name to fall back to
 */
export type QuotaFallback = boolean | "auto" | string;

// ---------------------------------------------------------------------------
// Debug — boolean or object shape, production tolerant
// ---------------------------------------------------------------------------

export type DebugLevel = "debug" | "info" | "warn" | "error" | "silent";

export interface DebugObjectConfig {
  /** enable debug logging */
  enabled?: boolean;
  /** log level */
  level?: DebugLevel;
  /** custom log file path */
  log_file?: string | null;
  /** retention days */
  retain_days?: number;
  /** max bytes before rotation, e.g. 10MB */
  max_bytes?: number;
  /** TUI circular buffer lines */
  tui_buffer_lines?: number;
  /** redact secrets in logs */
  redact_secrets?: boolean;
}

export type DebugConfig = boolean | DebugObjectConfig;

// ---------------------------------------------------------------------------
// Google Search grounding — requirement google_search enabled
// ---------------------------------------------------------------------------

export interface GoogleSearchConfig {
  /** enable google_search tool injection */
  enabled?: boolean;
  /** model used for search grounding, defaults to gemini-3-flash */
  model?: string;
  /** enable url_context companion tool */
  url_context?: boolean;
  /** include groundingMetadata in response */
  include_grounding_metadata?: boolean;
}

// ---------------------------------------------------------------------------
// Endpoint overrides — observer knows prod/daily/sandbox cascade
// ---------------------------------------------------------------------------

export interface EndpointOverrides {
  /** prod: https://cloudcode-pa.googleapis.com */
  prod?: string;
  /** daily: https://daily-cloudcode-pa.googleapis.com */
  daily?: string;
  /** sandbox: https://daily-cloudcode-pa.sandbox.googleapis.com */
  sandbox?: string;
  /** autopush: https://autopush-cloudcode-pa.sandbox.googleapis.com */
  autopush?: string;
  /** quota endpoint override */
  quota?: string;
  /** models endpoint override */
  models?: string;
  /** gemini cli companion endpoint */
  gemini_cli?: string;
  /** cloudaicompanion.googleapis.com */
  cloud_companion?: string;
  /** generateContent base */
  generate?: string;
  /** streamGenerateContent base */
  stream_generate?: string;
}

// ---------------------------------------------------------------------------
// Quota sub-config
// ---------------------------------------------------------------------------

/**
 * Quota settings block of antigravity.json (v2.1.15 Phase D: renamed from
 * QuotaSettings — quota.js owns that name with the runtime quota shape; this
 * is the user-facing config-file schema).
 */
export interface QuotaSettings {
  refresh_interval_minutes?: number;
  cache_ttl_minutes?: number;
  soft_threshold?: number;
  hard_threshold?: number;
  dual_pool?: boolean;
  [k: string]: unknown;
}

// ---------------------------------------------------------------------------
// Bypass metadata — documents how UA / fingerprint bypasses ban
// ---------------------------------------------------------------------------

export interface BypassMetadata {
  /** fallback version when dynamic fetch fails */
  version_fallback?: string;
  /** min supported version */
  min_supported?: string;
  /** custom user agent override — observer warns to keep antigravity/{semver} {os}/{arch} pattern */
  user_agent?: string;
  /** strip x-goog-user-project header to avoid 403 */
  strip_user_project_header?: boolean;
  /** enable fingerprint jitter 0-80ms */
  fingerprint_jitter?: boolean;
  /** pid offset trick for Gemini CLI bypass */
  pid_offset?: boolean;
}

// ---------------------------------------------------------------------------
// Root config — single union interface covering both field sets (v1 + v2)
//
// Reconciliation: the v1 interface required ten flat fields; the v2 interface
// declared an overlapping but optional superset with nested sub-objects.
// This merged interface exposes every field from both versions. Fields shared
// by both versions keep the v2 (superset) type; v1-only fields are optional
// so both default objects remain assignable.
// ---------------------------------------------------------------------------

export interface AntigravityConfig {
  /** json schema pointer, optional */
  $schema?: string;
  /** config version, integer */
  version?: number;

  // — core flags shared by v1 and v2 —
  /** try Gemini CLI pool first (v2 default false / v1 default true) */
  cli_first?: boolean;
  /** apply PID offset to avoid automation detection */
  pid_offset_enabled?: boolean;
  /** quota refresh interval in minutes */
  quota_refresh_interval_minutes?: number;
  /** enable Google grounded search (google_search tool) */
  google_search_enabled?: boolean;
  /** debug flag or object (boolean in v1, boolean|object in v2) */
  debug?: DebugConfig;

  // — extended production fields (v2) —
  /** account rotation strategy */
  rotation_strategy?: RotationStrategy;
  /** alias kept for backward compat with older schema */
  account_rotation?: RotationStrategy;
  /** boolean debug shortcut */
  debug_enabled?: boolean;
  /** full google search object */
  google_search?: GoogleSearchConfig;
  /** endpoint overrides */
  endpoints?: EndpointOverrides;
  /** quota sub-config */
  quota?: QuotaSettings;
  /** bypass metadata */
  bypass?: BypassMetadata;
  /** fallback project id blinded */
  fallback_project_id?: string;
  /** default chat model 2026 */
  default_model?: string;
  /** search/grounding model */
  search_model?: string;
  /** client id override — public client, do not commit secret */
  client_id?: string | null;
  /** client secret override — optional, blinded in logs */
  client_secret?: string | null;
  /** accounts file path override */
  accounts_file?: string | null;
  /** model allowlist custom */
  models_allowlist?: string[];
  /** enable fetch interceptor stripping */
  strip_user_project?: boolean;

  // — v1-only fields —
  /** toast/notification display scope (v1, default "all") */
  toast_scope?: ToastScope;
  /** quota percentage where soft warning/fallback starts (v1, default 90, range 0-100) */
  soft_quota_threshold_percent?: number;
  /** fallback strategy when quota hits threshold (v1, default "auto") */
  quota_fallback?: QuotaFallback;
  /** soft quota cache TTL in minutes (v1, default 5, range 1-1440) */
  soft_quota_cache_ttl_minutes?: number;
  /** version/update check cache TTL in minutes (v1, default 60, range 1-10080) */
  version_cache_ttl?: number;

  /** extra */
  [k: string]: unknown;
}

// ---------------------------------------------------------------------------
// Defaults — library-first deterministic
// ---------------------------------------------------------------------------

export const DEFAULT_ENDPOINTS: Readonly<Required<Pick<EndpointOverrides, "prod" | "daily" | "sandbox" | "autopush">>> =
  {
    prod: "https://cloudcode-pa.googleapis.com",
    daily: "https://daily-cloudcode-pa.googleapis.com",
    sandbox: "https://daily-cloudcode-pa.sandbox.googleapis.com",
    autopush: "https://autopush-cloudcode-pa.sandbox.googleapis.com",
  } as const;

export const DEFAULT_QUOTA: Required<QuotaSettings> = {
  refresh_interval_minutes: 15,
  cache_ttl_minutes: 15,
  soft_threshold: 0.9,
  hard_threshold: 1.0,
  dual_pool: true,
};

export const DEFAULT_BYPASS: Required<BypassMetadata> = {
  version_fallback: "1.19.2",
  min_supported: "1.15.8",
  user_agent: "antigravity/1.19.2",
  strip_user_project_header: true,
  fingerprint_jitter: true,
  pid_offset: false,
};

export const DEFAULT_DEBUG_OBJECT: Required<DebugObjectConfig> = {
  enabled: false,
  level: "warn",
  log_file: null,
  retain_days: 7,
  max_bytes: 10 * 1024 * 1024,
  tui_buffer_lines: 1000,
  redact_secrets: true,
};

export const DEFAULT_GOOGLE_SEARCH: Required<GoogleSearchConfig> = {
  enabled: true,
  model: "gemini-3-flash",
  url_context: true,
  include_grounding_metadata: true,
};

export function getDefaultConfig(): AntigravityConfig {
  // observer returns deep clone to avoid mutation between callers
  return {
    $schema: "https://json-schema.org/draft-07/schema#",
    version: 2,
    cli_first: false,
    pid_offset_enabled: false,
    quota_refresh_interval_minutes: 15,
    rotation_strategy: "round-robin",
    account_rotation: "round-robin",
    debug: false,
    debug_enabled: false,
    google_search_enabled: true,
    google_search: { ...DEFAULT_GOOGLE_SEARCH },
    endpoints: { ...DEFAULT_ENDPOINTS },
    quota: { ...DEFAULT_QUOTA },
    bypass: { ...DEFAULT_BYPASS },
    fallback_project_id: "rising-fact-p41fc",
    default_model: "antigravity-gemini-3-flash",
    search_model: "gemini-3-flash",
    client_id: null,
    client_secret: null,
    accounts_file: null,
    models_allowlist: [],
    strip_user_project: true,
  };
}

export const CONFIG_DEFAULTS = getDefaultConfig();

/**
 * Immutable v1 default configuration.
 */
export const DEFAULT_CONFIG: Readonly<AntigravityConfig> = {
  cli_first: true,
  toast_scope: "all",
  soft_quota_threshold_percent: 90,
  quota_fallback: "auto",
  quota_refresh_interval_minutes: 15,
  soft_quota_cache_ttl_minutes: 5,
  pid_offset_enabled: true,
  google_search_enabled: false,
  debug: false,
  version_cache_ttl: 60,
} as const;

// ---------------------------------------------------------------------------
// JSON Schema Draft-07 — production validations
// ---------------------------------------------------------------------------

/**
 * Schema for ~/.config/opencode/antigravity.json
 * The observer documents this file with third-person view and bilingual help.
 */
export const ANTIGRAVITY_CONFIG_JSON_SCHEMA = {
  $schema: "http://json-schema.org/draft-07/schema#",
  $id: "https://opencode.ai/schemas/antigravity.json",
  title: "devthink provider config — antigravity.json",
  description:
    "Configuration for the devthink provider plugin. Bypass metadata: mimics antigravity/{ver} {os}/{arch} User-Agent, strips x-goog-user-project, endpoint cascade 403/404/5xx, supports Gemini CLI dual quota pool, round-robin/sticky rotation, google_search grounding.",
  type: "object",
  additionalProperties: false,
  properties: {
    $schema: {
      type: "string",
      format: "uri",
      description: "JSON schema pointer",
      default: "https://json-schema.org/draft-07/schema#",
      examples: ["https://json-schema.org/draft-07/schema#", "./antigravity.schema.json"],
    },
    version: {
      type: "integer",
      minimum: 1,
      maximum: 10,
      default: 2,
      description: "config version",
      examples: [2],
    },
    cli_first: {
      type: "boolean",
      default: false,
      description:
        "When true, tries Gemini CLI quota pool first before Antigravity pool. Useful when Antigravity quota is exhausted but CLI pool still has tokens.",
      examples: [false, true],
    },
    pid_offset_enabled: {
      type: "boolean",
      default: false,
      description:
        "Enables PID offset trick to bypass per-PID rate limiting observed in Gemini CLI gateway. When enabled, adds pid % 1000 to jitter.",
      examples: [false, true],
    },
    quota_refresh_interval_minutes: {
      type: "integer",
      minimum: 1,
      maximum: 120,
      default: 15,
      description:
        "Interval in minutes for background quota refresh. Adaptive TTL 2-10min when near soft threshold 90%.",
      examples: [5, 15, 30],
    },
    rotation_strategy: {
      type: "string",
      enum: ROTATION_STRATEGIES as unknown as string[],
      default: "round-robin",
      description:
        "Multi-account rotation strategy — round-robin distributes evenly, sticky keeps same account until quota exhausted.",
      examples: ["round-robin", "sticky"],
    },
    account_rotation: {
      type: "string",
      enum: ROTATION_STRATEGIES as unknown as string[],
      default: "round-robin",
      description: "Alias for rotation_strategy (backward compat)",
      examples: ["round-robin", "sticky"],
    },
    debug: {
      oneOf: [
        { type: "boolean" },
        {
          type: "object",
          additionalProperties: false,
          properties: {
            enabled: {
              type: "boolean",
              default: false,
              description: "enable debug",
              examples: [false, true],
            },
            level: {
              type: "string",
              enum: ["debug", "info", "warn", "error", "silent"],
              default: "warn",
              description: "log level",
              examples: ["debug", "warn"],
            },
            log_file: {
              type: ["string", "null"],
              default: null,
              description: "custom log file path",
              examples: [null, "~/.config/opencode/antigravity-debug.log"],
            },
            retain_days: {
              type: "integer",
              minimum: 1,
              maximum: 90,
              default: 7,
              description: "log retention days",
              examples: [7],
            },
            max_bytes: {
              type: "integer",
              minimum: 1024,
              maximum: 100 * 1024 * 1024,
              default: 10485760,
              description: "max bytes before rotation, 10MB default",
              examples: [10485760],
            },
            tui_buffer_lines: {
              type: "integer",
              minimum: 10,
              maximum: 10000,
              default: 1000,
              description: "circular TUI buffer lines",
              examples: [1000],
            },
            redact_secrets: {
              type: "boolean",
              default: true,
              description: "redact secrets in logs",
              examples: [true],
            },
          },
        },
      ],
      default: false,
      description: "Debug mode — boolean or object with rotation, retention, redaction.",
      examples: [false, true, { enabled: true, level: "debug" }],
    },
    debug_enabled: {
      type: "boolean",
      default: false,
      description: "shortcut for debug.enabled",
      examples: [false, true],
    },
    google_search_enabled: {
      type: "boolean",
      default: true,
      description: "Enable native google_search grounding tool (Gemini) injection.",
      examples: [true, false],
    },
    google_search: {
      type: "object",
      additionalProperties: false,
      default: { ...DEFAULT_GOOGLE_SEARCH },
      description: "Google search grounding full config",
      properties: {
        enabled: {
          type: "boolean",
          default: true,
          description: "enable google_search tool",
          examples: [true, false],
        },
        model: {
          type: "string",
          default: "gemini-3-flash",
          description: "model used for search grounding",
          examples: ["gemini-3-flash", "gemini-3-flash-preview"],
        },
        url_context: {
          type: "boolean",
          default: true,
          description: "enable url_context companion tool",
          examples: [true, false],
        },
        include_grounding_metadata: {
          type: "boolean",
          default: true,
          description: "include groundingMetadata in response",
          examples: [true],
        },
      },
    },
    endpoints: {
      type: "object",
      additionalProperties: false,
      description: "Override Antigravity endpoints. Observer warns: must use https and googleapis.com for bypass.",
      properties: {
        prod: {
          type: "string",
          format: "uri",
          default: "https://cloudcode-pa.googleapis.com",
          description: "PROD endpoint",
          examples: ["https://cloudcode-pa.googleapis.com"],
        },
        daily: {
          type: "string",
          format: "uri",
          default: "https://daily-cloudcode-pa.googleapis.com",
          description: "DAILY endpoint",
          examples: ["https://daily-cloudcode-pa.googleapis.com"],
        },
        sandbox: {
          type: "string",
          format: "uri",
          default: "https://daily-cloudcode-pa.sandbox.googleapis.com",
          description: "SANDBOX endpoint",
          examples: ["https://daily-cloudcode-pa.sandbox.googleapis.com"],
        },
        autopush: {
          type: "string",
          format: "uri",
          default: "https://autopush-cloudcode-pa.sandbox.googleapis.com",
          description: "AUTOPUSH optional",
          examples: ["https://autopush-cloudcode-pa.sandbox.googleapis.com"],
        },
        quota: {
          type: "string",
          format: "uri",
          description: "quota endpoint override",
          examples: ["https://cloudcode-pa.googleapis.com"],
        },
        models: {
          type: "string",
          format: "uri",
          description: "models endpoint override",
          examples: ["https://cloudcode-pa.googleapis.com"],
        },
        gemini_cli: {
          type: "string",
          format: "uri",
          description: "Gemini CLI companion endpoint",
          examples: ["https://cloudaicompanion.googleapis.com"],
        },
        cloud_companion: {
          type: "string",
          format: "uri",
          description: "cloudaicompanion.googleapis.com",
          examples: ["https://cloudaicompanion.googleapis.com"],
        },
        generate: {
          type: "string",
          format: "uri",
          description: "generateContent base",
          examples: ["https://cloudcode-pa.googleapis.com"],
        },
        stream_generate: {
          type: "string",
          format: "uri",
          description: "streamGenerateContent base",
          examples: ["https://cloudcode-pa.googleapis.com"],
        },
      },
    },
    quota: {
      type: "object",
      additionalProperties: false,
      description: "Quota config",
      properties: {
        refresh_interval_minutes: {
          type: "integer",
          minimum: 1,
          maximum: 120,
          default: 15,
          examples: [15],
        },
        cache_ttl_minutes: {
          type: "integer",
          minimum: 1,
          maximum: 60,
          default: 15,
          examples: [15],
        },
        soft_threshold: {
          type: "number",
          minimum: 0.1,
          maximum: 1.0,
          default: 0.9,
          examples: [0.9],
        },
        hard_threshold: {
          type: "number",
          minimum: 0.5,
          maximum: 1.0,
          default: 1.0,
          examples: [1.0],
        },
        dual_pool: {
          type: "boolean",
          default: true,
          description: "enable dual pool Antigravity + Gemini CLI",
          examples: [true],
        },
      },
    },
    bypass: {
      type: "object",
      additionalProperties: false,
      description:
        "Bypass metadata — documents how library imitates Antigravity traffic. UA must match antigravity/{semver} {os}/{arch}.",
      properties: {
        version_fallback: {
          type: "string",
          pattern: "^\\d+\\.\\d+\\.\\d+",
          default: "1.19.2",
          examples: ["1.19.2"],
        },
        min_supported: {
          type: "string",
          pattern: "^\\d+\\.\\d+\\.\\d+",
          default: "1.15.8",
          examples: ["1.15.8"],
        },
        user_agent: {
          type: "string",
          default: "antigravity/1.19.2",
          description: "full UA, should contain antigravity/ prefix",
          examples: ["antigravity/1.19.2 darwin/arm64", "antigravity/1.19.2 linux/x64"],
        },
        strip_user_project_header: {
          type: "boolean",
          default: true,
          description: "strip x-goog-user-project to avoid 403",
          examples: [true],
        },
        fingerprint_jitter: {
          type: "boolean",
          default: true,
          examples: [true],
        },
        pid_offset: {
          type: "boolean",
          default: false,
          examples: [false, true],
        },
      },
    },
    fallback_project_id: {
      type: "string",
      minLength: 3,
      default: "rising-fact-p41fc",
      description: "fallback project id blinded",
      examples: ["rising-fact-p41fc"],
    },
    default_model: {
      type: "string",
      default: "antigravity-gemini-3-flash",
      description: "default chat model 2026",
      examples: ["antigravity-gemini-3-flash", "gemini-3-pro-preview"],
    },
    search_model: {
      type: "string",
      default: "gemini-3-flash",
      description: "search grounding model",
      examples: ["gemini-3-flash", "gemini-3-flash-preview"],
    },
    client_id: {
      type: ["string", "null"],
      default: null,
      description: "OAuth client_id override (public)",
      examples: [null, "1071006060591-...apps.googleusercontent.com"],
    },
    client_secret: {
      type: ["string", "null"],
      default: null,
      description: "OAuth client_secret override — do not commit",
      examples: [null],
    },
    accounts_file: {
      type: ["string", "null"],
      default: null,
      format: "uri-reference",
      description: "custom accounts file path",
      examples: [null, "~/.config/opencode/antigravity-accounts.json"],
    },
    models_allowlist: {
      type: "array",
      items: { type: "string" },
      default: [],
      description: "optional model allowlist",
      examples: [[], ["antigravity-gemini-3-flash", "claude-opus-4-6-thinking"]],
    },
    strip_user_project: {
      type: "boolean",
      default: true,
      description: "legacy alias for bypass.strip_user_project_header",
      examples: [true],
    },
    toast_scope: {
      type: "string",
      enum: ["all", "project", "minimal", "none"],
      default: "all",
      description: "toast/notification display scope (v1 field)",
      examples: ["all", "project", "minimal", "none"],
    },
    soft_quota_threshold_percent: {
      type: "number",
      minimum: 0,
      maximum: 100,
      default: 90,
      description: "quota percentage where soft warning/fallback starts (v1 field)",
      examples: [90],
    },
    quota_fallback: {
      oneOf: [{ type: "boolean" }, { type: "string" }],
      default: "auto",
      description: 'fallback strategy on quota exhaustion: boolean | "auto" | modelName (v1 field)',
      examples: ["auto", true, false],
    },
    soft_quota_cache_ttl_minutes: {
      type: "integer",
      minimum: 1,
      maximum: 1440,
      default: 5,
      description: "soft quota cache TTL in minutes (v1 field)",
      examples: [5],
    },
    version_cache_ttl: {
      type: "integer",
      minimum: 1,
      maximum: 10080,
      default: 60,
      description: "version/update check cache TTL in minutes (v1 field)",
      examples: [60],
    },
  },
  required: [],
} as const;

// ---------------------------------------------------------------------------
// Path resolution — third-person, no side effects here
// ---------------------------------------------------------------------------

/**
 * The observer resolves config directory honoring OPENCODE_CONFIG_DIR.
 */
export function resolveConfigDir(): string {
  const env = process.env.OPENCODE_CONFIG_DIR?.trim();
  if (env && env.length > 0) return path.resolve(env);
  return path.join(os.homedir(), ".config", "opencode");
}

/**
 * Resolves full antigravity.json path.
 * @param customPath - optional explicit path from caller
 */
export function resolveConfigPath(customPath?: string): string {
  if (customPath && customPath.trim().length > 0) {
    return path.resolve(customPath.trim());
  }
  return path.join(resolveConfigDir(), CONFIG_FILE_NAME);
}

/**
 * Returns the absolute config file path for the current OS:
 * ~/.config/opencode/antigravity.json.
 * Honors XDG_CONFIG_HOME on Linux when defined.
 *
 * @returns absolute path
 */
export function getConfigPath(): string {
  // XDG override (Linux standard)
  const xdg = process.env.XDG_CONFIG_HOME;
  if (xdg && xdg.trim().length > 0) {
    return path.join(xdg, CONFIG_DIR_NAME, CONFIG_FILE_NAME);
  }

  const home = os.homedir();

  // Robust fallback if homedir fails (rare)
  if (!home || home.trim().length === 0) {
    // try HOME env
    const envHome = process.env.HOME || process.env.USERPROFILE || "";
    if (envHome) {
      return path.join(envHome, ".config", CONFIG_DIR_NAME, CONFIG_FILE_NAME);
    }
    // last-resort relative fallback (not ideal but avoids throwing)
    return path.join(process.cwd(), ".config", CONFIG_DIR_NAME, CONFIG_FILE_NAME);
  }

  return path.join(home, ".config", CONFIG_DIR_NAME, CONFIG_FILE_NAME);
}

/**
 * Ensures directory exists, idempotent, 0755.
 */
async function ensureDir(dir: string): Promise<void> {
  try {
    await fsp.mkdir(dir, { recursive: true, mode: DIR_MODE });
    // chmod best-effort to 0755 even if existed
    try {
      await fsp.chmod(dir, DIR_MODE);
    } catch {
      /* the guarded best-effort operation falls through: the outer flow owns the failure */
    }
  } catch (err: any) {
    // if mkdir fails because exists as file, throw production error
    if (err?.code !== "EEXIST") throw err;
  }
}

/** Ensures the config directory exists (mkdir -p). */
function ensureConfigDirExists(configPath: string): void {
  const dir = path.dirname(configPath);
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
}

// ---------------------------------------------------------------------------
// Atomic write — tmp + chmod 600 + rename (async v2 / sync v1)
// ---------------------------------------------------------------------------

/**
 * Atomic write helper (async).
 * The observer writes to a temp sibling file then renames, to avoid partial reads.
 * @param targetPath - final destination
 * @param content - string content to write
 */
async function atomicWriteFileAtomic(targetPath: string, content: string): Promise<void> {
  const dir = path.dirname(targetPath);
  await ensureDir(dir);
  const random = crypto.randomBytes(6).toString("hex");
  const tmp = path.join(dir, `.${path.basename(targetPath)}.${process.pid}.${random}.tmp`);

  try {
    await fsp.writeFile(tmp, content, { encoding: "utf8", mode: FILE_MODE });
    try {
      await fsp.chmod(tmp, FILE_MODE);
    } catch {
      /* the guarded best-effort operation falls through: the outer flow owns the failure */
    }
    // fsync dir? best-effort not critical for this config — production tolerant
    await fsp.rename(tmp, targetPath);
    // final chmod on target for existing file overwrite case
    try {
      await fsp.chmod(targetPath, FILE_MODE);
    } catch {
      /* the guarded best-effort operation falls through: the outer flow owns the failure */
    }
  } finally {
    // cleanup tmp if rename failed
    try {
      await fsp.unlink(tmp);
    } catch {
      /* the guarded best-effort operation falls through: the outer flow owns the failure */
    }
  }
}

/**
 * Atomic sync write with chmod 0o600.
 * - Writes to a temp file in the same dir
 * - chmod 0o600
 * - atomic rename
 *
 * @param filePath final destination
 * @param data JSON string
 */
function atomicWriteFile(filePath: string, data: string): void {
  ensureConfigDirExists(filePath);

  const dir = path.dirname(filePath);
  const tmpName = `${path.basename(filePath)}.tmp.${process.pid}.${Date.now()}.${Math.random()
    .toString(36)
    .slice(2, 8)}`;
  const tmpPath = path.join(dir, tmpName);

  try {
    // write temp
    fs.writeFileSync(tmpPath, data, { encoding: "utf8", mode: 0o600 });

    // guarantee 0o600 even if umask interfered
    try {
      fs.chmodSync(tmpPath, 0o600);
    } catch {
      // chmod may fail on Windows; ignore but continue
    }

    // fsync the file for durability (best-effort)
    try {
      const fd = fs.openSync(tmpPath, "r");
      try {
        fs.fsyncSync(fd);
      } finally {
        fs.closeSync(fd);
      }
    } catch {
      // fsync optional
    }

    // atomic rename
    fs.renameSync(tmpPath, filePath);

    // guarantee 0o600 on the final destination too
    try {
      fs.chmodSync(filePath, 0o600);
    } catch {
      // ignore on Windows
    }
  } finally {
    // cleanup temp if still present
    try {
      if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
    } catch {
      // ignore
    }
  }
}

// ---------------------------------------------------------------------------
// Shared helpers — url validation, deep merge, redaction, primitive guards
// ---------------------------------------------------------------------------

function isValidUri(u: string): boolean {
  try {
    const url = new URL(u);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isBoolean(v: unknown): v is boolean {
  return typeof v === "boolean";
}

function isNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function isString(v: unknown): v is string {
  return typeof v === "string";
}

function isValidToastScope(v: unknown): v is ToastScope {
  return v === "all" || v === "project" || v === "minimal" || v === "none";
}

function isValidQuotaFallback(v: unknown): v is QuotaFallback {
  if (isBoolean(v)) return true;
  if (v === "auto") return true;
  if (isString(v)) {
    // accepts any non-empty string (model name) or known model
    return v.trim().length > 0;
  }
  return false;
}

/**
 * Deep merge defaults <- override; observer keeps primitives from override when defined.
 */
function deepMerge<T extends Record<string, any>>(defaults: T, override: Partial<T>): T {
  const out: any = { ...defaults };
  for (const k of Object.keys(override)) {
    const ov = (override as any)[k];
    if (ov === undefined) continue;
    const dv = (defaults as any)[k];
    if (isObject(dv) && isObject(ov) && !Array.isArray(dv) && !Array.isArray(ov)) {
      out[k] = deepMerge(dv as any, ov as any);
    } else {
      out[k] = ov;
    }
  }
  return out as T;
}

function redactedCopy(cfg: AntigravityConfig): AntigravityConfig {
  const c: any = { ...cfg };
  if (c.client_secret) c.client_secret = "***REDACTED***";
  return c;
}

// ---------------------------------------------------------------------------
// Validation errors — unified class accepting both constructor signatures
// ---------------------------------------------------------------------------

export interface ValidationError {
  path: string;
  message: string;
  value?: unknown;
}

/**
 * Unified config validation error.
 * - v2 signature: new ConfigValidationError(message, structuredErrors[])
 * - v1 signature: new ConfigValidationError(stringErrorList)
 */
export class ConfigValidationError extends Error {
  public readonly errors: ReadonlyArray<ValidationError | string>;
  constructor(messageOrErrors: string | ReadonlyArray<string>, errors?: ReadonlyArray<ValidationError>) {
    if (Array.isArray(messageOrErrors)) {
      // v1 style: array of message strings
      super(`Invalid antigravity config: ${(messageOrErrors as ReadonlyArray<string>).join("; ")}`);
      this.name = "ConfigValidationError";
      this.errors = messageOrErrors as ReadonlyArray<ValidationError | string>;
    } else {
      // v2 style: message + structured errors
      super(messageOrErrors as string);
      this.name = "ConfigValidationError";
      this.errors = (errors ?? []) as ReadonlyArray<ValidationError | string>;
    }
  }
}

// ---------------------------------------------------------------------------
// Validation — production-ready, no placeholders (v2 strict validator)
// ---------------------------------------------------------------------------

/**
 * Validates config strictly for production.
 * The observer collects all errors before throwing, to give full feedback.
 *
 * @param input - raw parsed json
 * @returns sanitized AntigravityConfig
 * @throws ConfigValidationError when invalid
 */
export function validate(input: unknown): AntigravityConfig {
  const result = validateInternal(input);
  if (!result.valid) {
    throw new ConfigValidationError(
      `config validation failed: ${result.errors.map((e) => `${e.path}: ${e.message}`).join("; ")}`,
      result.errors,
    );
  }
  return result.config!;
}

export function validateConfig(input: unknown): {
  valid: boolean;
  errors: ValidationError[];
  config?: AntigravityConfig | undefined;
} {
  return validateInternal(input);
}

function validateInternal(input: unknown): {
  valid: boolean;
  errors: ValidationError[];
  config?: AntigravityConfig | undefined;
} {
  const errors: ValidationError[] = [];
  const defaults = getDefaultConfig();

  if (!isObject(input)) {
    errors.push({ path: "$", message: "must be object", value: input });
    return { valid: false, errors };
  }

  const raw = input as Record<string, unknown>;
  const out: AntigravityConfig = { ...defaults } as any;

  // helper to push error
  const err = (p: string, msg: string, v?: unknown) => errors.push({ path: p, message: msg, value: v });

  // version
  if (raw.version !== undefined) {
    if (!Number.isInteger(raw.version) || (raw.version as number) < 1 || (raw.version as number) > 10) {
      err("version", "must be integer 1-10", raw.version);
    } else {
      out.version = raw.version as number;
    }
  }

  // cli_first boolean — required by prompt
  if (raw.cli_first !== undefined) {
    if (typeof raw.cli_first !== "boolean") err("cli_first", "must be boolean", raw.cli_first);
    else out.cli_first = raw.cli_first;
  }

  // pid_offset_enabled boolean — required
  if (raw.pid_offset_enabled !== undefined) {
    if (typeof raw.pid_offset_enabled !== "boolean")
      err("pid_offset_enabled", "must be boolean", raw.pid_offset_enabled);
    else out.pid_offset_enabled = raw.pid_offset_enabled as boolean;
  }

  // quota_refresh_interval_minutes integer 1-120
  if (raw.quota_refresh_interval_minutes !== undefined) {
    if (
      !Number.isInteger(raw.quota_refresh_interval_minutes) ||
      (raw.quota_refresh_interval_minutes as number) < 1 ||
      (raw.quota_refresh_interval_minutes as number) > 120
    ) {
      err("quota_refresh_interval_minutes", "must be integer 1-120", raw.quota_refresh_interval_minutes);
    } else {
      out.quota_refresh_interval_minutes = raw.quota_refresh_interval_minutes as number;
    }
  }

  // rotation_strategy enum
  const checkRotation = (val: unknown, p: string): RotationStrategy | null => {
    if (val === undefined) return null;
    if (typeof val !== "string" || !(ROTATION_STRATEGIES as readonly string[]).includes(val)) {
      err(p, `must be one of ${ROTATION_STRATEGIES.join(", ")}`, val);
      return null;
    }
    return val as RotationStrategy;
  };
  const rs = checkRotation(raw.rotation_strategy, "rotation_strategy");
  if (rs) {
    out.rotation_strategy = rs;
    out.account_rotation = rs; // keep alias in sync
  }
  const ar = checkRotation(raw.account_rotation, "account_rotation");
  if (ar) {
    out.account_rotation = ar;
    // if rotation_strategy not set, mirror
    if (raw.rotation_strategy === undefined) out.rotation_strategy = ar;
  }

  // debug boolean | object
  if (raw.debug !== undefined) {
    const d = raw.debug;
    if (typeof d === "boolean") {
      out.debug = d;
    } else if (isObject(d)) {
      const obj: DebugObjectConfig = {};
      const dRec = d as Record<string, unknown>;
      if (dRec.enabled !== undefined) {
        if (typeof dRec.enabled !== "boolean") err("debug.enabled", "must be boolean", dRec.enabled);
        else obj.enabled = dRec.enabled;
      }
      if (dRec.level !== undefined) {
        const levels = ["debug", "info", "warn", "error", "silent"];
        if (typeof dRec.level !== "string" || !levels.includes(dRec.level))
          err("debug.level", `must be ${levels.join("|")}`, dRec.level);
        else obj.level = dRec.level as DebugLevel;
      }
      if (dRec.log_file !== undefined) {
        if (dRec.log_file !== null && typeof dRec.log_file !== "string")
          err("debug.log_file", "must be string|null", dRec.log_file);
        else obj.log_file = dRec.log_file as string | null;
      }
      if (dRec.retain_days !== undefined) {
        if (
          !Number.isInteger(dRec.retain_days) ||
          (dRec.retain_days as number) < 1 ||
          (dRec.retain_days as number) > 90
        )
          err("debug.retain_days", "must be integer 1-90", dRec.retain_days);
        else obj.retain_days = dRec.retain_days as number;
      }
      if (dRec.max_bytes !== undefined) {
        if (
          !Number.isInteger(dRec.max_bytes) ||
          (dRec.max_bytes as number) < 1024 ||
          (dRec.max_bytes as number) > 100 * 1024 * 1024
        )
          err("debug.max_bytes", "must be 1024-104857600", dRec.max_bytes);
        else obj.max_bytes = dRec.max_bytes as number;
      }
      if (dRec.tui_buffer_lines !== undefined) {
        if (
          !Number.isInteger(dRec.tui_buffer_lines) ||
          (dRec.tui_buffer_lines as number) < 10 ||
          (dRec.tui_buffer_lines as number) > 10000
        )
          err("debug.tui_buffer_lines", "must be 10-10000", dRec.tui_buffer_lines);
        else obj.tui_buffer_lines = dRec.tui_buffer_lines as number;
      }
      if (dRec.redact_secrets !== undefined) {
        if (typeof dRec.redact_secrets !== "boolean")
          err("debug.redact_secrets", "must be boolean", dRec.redact_secrets);
        else obj.redact_secrets = dRec.redact_secrets;
      }
      // check unknown keys inside debug
      const allowedDebugKeys = [
        "enabled",
        "level",
        "log_file",
        "retain_days",
        "max_bytes",
        "tui_buffer_lines",
        "redact_secrets",
      ];
      for (const k of Object.keys(dRec)) {
        if (!allowedDebugKeys.includes(k)) err(`debug.${k}`, "unknown property", dRec[k]);
      }
      out.debug = deepMerge(DEFAULT_DEBUG_OBJECT as any, obj as any);
    } else {
      err("debug", "must be boolean or object", d);
    }
  }

  if (raw.debug_enabled !== undefined) {
    if (typeof raw.debug_enabled !== "boolean") err("debug_enabled", "must be boolean", raw.debug_enabled);
    else out.debug_enabled = raw.debug_enabled;
  }

  // google_search_enabled boolean
  if (raw.google_search_enabled !== undefined) {
    if (typeof raw.google_search_enabled !== "boolean")
      err("google_search_enabled", "must be boolean", raw.google_search_enabled);
    else out.google_search_enabled = raw.google_search_enabled;
  }

  if (raw.google_search !== undefined) {
    if (!isObject(raw.google_search)) {
      err("google_search", "must be object", raw.google_search);
    } else {
      const gsRaw = raw.google_search as Record<string, unknown>;
      const gs: GoogleSearchConfig = {};
      if (gsRaw.enabled !== undefined) {
        if (typeof gsRaw.enabled !== "boolean") err("google_search.enabled", "must be boolean", gsRaw.enabled);
        else gs.enabled = gsRaw.enabled;
      }
      if (gsRaw.model !== undefined) {
        if (typeof gsRaw.model !== "string" || (gsRaw.model as string).length < 2)
          err("google_search.model", "must be non-empty string", gsRaw.model);
        else gs.model = gsRaw.model;
      }
      if (gsRaw.url_context !== undefined) {
        if (typeof gsRaw.url_context !== "boolean")
          err("google_search.url_context", "must be boolean", gsRaw.url_context);
        else gs.url_context = gsRaw.url_context;
      }
      if (gsRaw.include_grounding_metadata !== undefined) {
        if (typeof gsRaw.include_grounding_metadata !== "boolean")
          err("google_search.include_grounding_metadata", "must be boolean", gsRaw.include_grounding_metadata);
        else gs.include_grounding_metadata = gsRaw.include_grounding_metadata;
      }
      for (const k of Object.keys(gsRaw)) {
        if (!["enabled", "model", "url_context", "include_grounding_metadata"].includes(k))
          err(`google_search.${k}`, "unknown property", gsRaw[k]);
      }
      out.google_search = deepMerge(DEFAULT_GOOGLE_SEARCH as any, gs as any);
    }
  }

  // sync shortcut booleans with objects
  if (out.google_search_enabled !== undefined && out.google_search) {
    // if shortcut false, enforce object disabled
    if (out.google_search_enabled === false) {
      out.google_search.enabled = false;
    }
    if (out.google_search.enabled === false && out.google_search_enabled === true) {
      // object takes precedence, but mirror to shortcut for consistency
      out.google_search_enabled = false;
    }
  }
  if (out.debug !== undefined) {
    if (typeof out.debug === "boolean") {
      out.debug_enabled = out.debug;
    } else if (isObject(out.debug)) {
      out.debug_enabled = (out.debug as DebugObjectConfig).enabled ?? false;
    }
  }

  // endpoints overrides uri validation
  if (raw.endpoints !== undefined) {
    if (!isObject(raw.endpoints)) {
      err("endpoints", "must be object", raw.endpoints);
    } else {
      const epRaw = raw.endpoints as Record<string, unknown>;
      const ep: EndpointOverrides = {};
      const allowedEp = [
        "prod",
        "daily",
        "sandbox",
        "autopush",
        "quota",
        "models",
        "gemini_cli",
        "cloud_companion",
        "generate",
        "stream_generate",
      ];
      for (const k of Object.keys(epRaw)) {
        if (!allowedEp.includes(k)) {
          err(`endpoints.${k}`, "unknown endpoint key", epRaw[k]);
          continue;
        }
        const v = epRaw[k];
        if (v === undefined) continue;
        if (typeof v !== "string" || !isValidUri(v)) {
          err(`endpoints.${k}`, "must be valid https uri", v);
        } else {
          (ep as any)[k] = v;
        }
      }
      out.endpoints = deepMerge(DEFAULT_ENDPOINTS as any, ep as any);
    }
  }

  // quota sub-config
  if (raw.quota !== undefined) {
    if (!isObject(raw.quota)) {
      err("quota", "must be object", raw.quota);
    } else {
      const qRaw = raw.quota as Record<string, unknown>;
      const q: QuotaSettings = {};
      if (qRaw.refresh_interval_minutes !== undefined) {
        if (
          !Number.isInteger(qRaw.refresh_interval_minutes) ||
          (qRaw.refresh_interval_minutes as number) < 1 ||
          (qRaw.refresh_interval_minutes as number) > 120
        )
          err("quota.refresh_interval_minutes", "must be 1-120", qRaw.refresh_interval_minutes);
        else q.refresh_interval_minutes = qRaw.refresh_interval_minutes as number;
      }
      if (qRaw.cache_ttl_minutes !== undefined) {
        if (
          !Number.isInteger(qRaw.cache_ttl_minutes) ||
          (qRaw.cache_ttl_minutes as number) < 1 ||
          (qRaw.cache_ttl_minutes as number) > 60
        )
          err("quota.cache_ttl_minutes", "must be 1-60", qRaw.cache_ttl_minutes);
        else q.cache_ttl_minutes = qRaw.cache_ttl_minutes as number;
      }
      if (qRaw.soft_threshold !== undefined) {
        if (
          typeof qRaw.soft_threshold !== "number" ||
          (qRaw.soft_threshold as number) < 0.1 ||
          (qRaw.soft_threshold as number) > 1
        )
          err("quota.soft_threshold", "must be 0.1-1.0", qRaw.soft_threshold);
        else q.soft_threshold = qRaw.soft_threshold as number;
      }
      if (qRaw.hard_threshold !== undefined) {
        if (
          typeof qRaw.hard_threshold !== "number" ||
          (qRaw.hard_threshold as number) < 0.5 ||
          (qRaw.hard_threshold as number) > 1
        )
          err("quota.hard_threshold", "must be 0.5-1.0", qRaw.hard_threshold);
        else q.hard_threshold = qRaw.hard_threshold as number;
      }
      if (qRaw.dual_pool !== undefined) {
        if (typeof qRaw.dual_pool !== "boolean") err("quota.dual_pool", "must be boolean", qRaw.dual_pool);
        else q.dual_pool = qRaw.dual_pool;
      }
      for (const k of Object.keys(qRaw)) {
        if (
          !["refresh_interval_minutes", "cache_ttl_minutes", "soft_threshold", "hard_threshold", "dual_pool"].includes(
            k,
          )
        )
          err(`quota.${k}`, "unknown property", qRaw[k]);
      }
      out.quota = deepMerge(DEFAULT_QUOTA as any, q as any);
      // sync top-level interval
      if (q.refresh_interval_minutes !== undefined) out.quota_refresh_interval_minutes = q.refresh_interval_minutes;
    }
  }

  // keep top-level interval synced to quota object if defined oppositely
  if (out.quota_refresh_interval_minutes !== undefined) {
    if (!out.quota) out.quota = { ...DEFAULT_QUOTA };
    out.quota.refresh_interval_minutes = out.quota_refresh_interval_minutes;
  }

  // bypass
  if (raw.bypass !== undefined) {
    if (!isObject(raw.bypass)) {
      err("bypass", "must be object", raw.bypass);
    } else {
      const bRaw = raw.bypass as Record<string, unknown>;
      const b: BypassMetadata = {};
      const semverRe = /^\d+\.\d+\.\d+/;
      if (bRaw.version_fallback !== undefined) {
        if (typeof bRaw.version_fallback !== "string" || !semverRe.test(bRaw.version_fallback))
          err("bypass.version_fallback", "must be semver x.y.z", bRaw.version_fallback);
        else b.version_fallback = bRaw.version_fallback;
      }
      if (bRaw.min_supported !== undefined) {
        if (typeof bRaw.min_supported !== "string" || !semverRe.test(bRaw.min_supported))
          err("bypass.min_supported", "must be semver", bRaw.min_supported);
        else b.min_supported = bRaw.min_supported;
      }
      if (bRaw.user_agent !== undefined) {
        if (typeof bRaw.user_agent !== "string" || !bRaw.user_agent.startsWith("antigravity/"))
          err("bypass.user_agent", "must start with antigravity/", bRaw.user_agent);
        else b.user_agent = bRaw.user_agent;
      }
      if (bRaw.strip_user_project_header !== undefined) {
        if (typeof bRaw.strip_user_project_header !== "boolean")
          err("bypass.strip_user_project_header", "must be boolean", bRaw.strip_user_project_header);
        else b.strip_user_project_header = bRaw.strip_user_project_header;
      }
      if (bRaw.fingerprint_jitter !== undefined) {
        if (typeof bRaw.fingerprint_jitter !== "boolean")
          err("bypass.fingerprint_jitter", "must be boolean", bRaw.fingerprint_jitter);
        else b.fingerprint_jitter = bRaw.fingerprint_jitter;
      }
      if (bRaw.pid_offset !== undefined) {
        if (typeof bRaw.pid_offset !== "boolean") err("bypass.pid_offset", "must be boolean", bRaw.pid_offset);
        else b.pid_offset = bRaw.pid_offset;
      }
      for (const k of Object.keys(bRaw)) {
        if (
          ![
            "version_fallback",
            "min_supported",
            "user_agent",
            "strip_user_project_header",
            "fingerprint_jitter",
            "pid_offset",
          ].includes(k)
        )
          err(`bypass.${k}`, "unknown property", bRaw[k]);
      }
      out.bypass = deepMerge(DEFAULT_BYPASS as any, b as any);
      // sync pid_offset_enabled
      if (b.pid_offset !== undefined) out.pid_offset_enabled = b.pid_offset;
    }
  }
  if (out.pid_offset_enabled !== undefined) {
    if (!out.bypass) out.bypass = { ...DEFAULT_BYPASS };
    out.bypass.pid_offset = out.pid_offset_enabled;
  }

  // fallback_project_id
  if (raw.fallback_project_id !== undefined) {
    if (typeof raw.fallback_project_id !== "string" || (raw.fallback_project_id as string).length < 3)
      err("fallback_project_id", "must be string length >=3", raw.fallback_project_id);
    else out.fallback_project_id = raw.fallback_project_id;
  }

  // default_model / search_model
  if (raw.default_model !== undefined) {
    if (typeof raw.default_model !== "string" || (raw.default_model as string).length < 3)
      err("default_model", "must be string", raw.default_model);
    else out.default_model = raw.default_model;
  }
  if (raw.search_model !== undefined) {
    if (typeof raw.search_model !== "string" || (raw.search_model as string).length < 3)
      err("search_model", "must be string", raw.search_model);
    else out.search_model = raw.search_model;
  }

  // client_id / secret
  if (raw.client_id !== undefined) {
    if (raw.client_id !== null && typeof raw.client_id !== "string")
      err("client_id", "must be string|null", raw.client_id);
    else out.client_id = raw.client_id as string | null;
  }
  if (raw.client_secret !== undefined) {
    if (raw.client_secret !== null && typeof raw.client_secret !== "string")
      err("client_secret", "must be string|null", raw.client_secret);
    else out.client_secret = raw.client_secret as string | null;
  }

  if (raw.accounts_file !== undefined) {
    if (raw.accounts_file !== null && typeof raw.accounts_file !== "string")
      err("accounts_file", "must be string|null", raw.accounts_file);
    else out.accounts_file = raw.accounts_file as string | null;
  }

  if (raw.models_allowlist !== undefined) {
    if (
      !Array.isArray(raw.models_allowlist) ||
      !(raw.models_allowlist as unknown[]).every((v) => typeof v === "string")
    )
      err("models_allowlist", "must be string[]", raw.models_allowlist);
    else out.models_allowlist = raw.models_allowlist as string[];
  }

  if (raw.strip_user_project !== undefined) {
    if (typeof raw.strip_user_project !== "boolean")
      err("strip_user_project", "must be boolean", raw.strip_user_project);
    else out.strip_user_project = raw.strip_user_project;
  }

  // $schema field optional uri
  if (raw.$schema !== undefined) {
    if (typeof raw.$schema !== "string") err("$schema", "must be string uri", raw.$schema);
    else out.$schema = raw.$schema;
  }

  // top-level unknown keys detection — strict production.
  // Note: v1-only fields are accepted so legacy configs pass strict validation.
  const allowedTop = [
    "$schema",
    "version",
    "cli_first",
    "pid_offset_enabled",
    "quota_refresh_interval_minutes",
    "rotation_strategy",
    "account_rotation",
    "debug",
    "debug_enabled",
    "google_search_enabled",
    "google_search",
    "endpoints",
    "quota",
    "bypass",
    "fallback_project_id",
    "default_model",
    "search_model",
    "client_id",
    "client_secret",
    "accounts_file",
    "models_allowlist",
    "strip_user_project",
    // v1-only fields accepted by the union interface
    "toast_scope",
    "soft_quota_threshold_percent",
    "quota_fallback",
    "soft_quota_cache_ttl_minutes",
    "version_cache_ttl",
  ];
  for (const k of Object.keys(raw)) {
    if (!allowedTop.includes(k)) err(k, "unknown property — strict schema", raw[k]);
  }

  const valid = errors.length === 0;
  return { valid, errors, config: valid ? (out as AntigravityConfig) : undefined };
}

// ---------------------------------------------------------------------------
// Validation — manual validators without zod (v1)
// ---------------------------------------------------------------------------

/**
 * Validates a numeric field within range; returns value or error entry.
 */
function validateNumberInRange(
  key: string,
  value: unknown,
  min: number,
  max: number,
  defaultValue: number,
  errors: string[],
): number {
  if (value === undefined) return defaultValue;
  if (!isNumber(value)) {
    errors.push(`${key} must be a number`);
    return defaultValue;
  }
  if (value < min || value > max) {
    errors.push(`${key} must be between ${min} and ${max} (got ${value})`);
    // clamp instead of hard-fail for robustness
    return Math.min(Math.max(value, min), max);
  }
  return value;
}

/**
 * Validates and normalizes a partial config object, merging with defaults.
 * No zod — manual validation for zero deps.
 *
 * @param raw - raw object read from JSON
 * @param opts.strict - when true, throws ConfigValidationError on errors; otherwise uses defaults and accumulates warnings
 * @returns sanitized config
 */
export function parseAndValidateConfig(raw: unknown, opts?: { strict?: boolean }): AntigravityConfig {
  const strict = opts?.strict ?? false;
  const errors: string[] = [];

  if (!isObject(raw)) {
    if (raw === null || raw === undefined) {
      // empty file/null => use defaults
      return { ...DEFAULT_CONFIG };
    }
    errors.push("config root must be an object");
    if (strict) throw new ConfigValidationError(errors);
    return { ...DEFAULT_CONFIG };
  }

  // Start from defaults as base
  const result: AntigravityConfig = { ...DEFAULT_CONFIG };

  // cli_first
  if ("cli_first" in raw) {
    if (!isBoolean(raw.cli_first)) {
      errors.push("cli_first must be boolean");
    } else {
      result.cli_first = raw.cli_first;
    }
  }

  // toast_scope
  if ("toast_scope" in raw) {
    if (!isValidToastScope(raw.toast_scope)) {
      errors.push(`toast_scope must be one of all|project|minimal|none (got ${String(raw.toast_scope)})`);
    } else {
      result.toast_scope = raw.toast_scope;
    }
  }

  // soft_quota_threshold_percent (default 90)
  result.soft_quota_threshold_percent = validateNumberInRange(
    "soft_quota_threshold_percent",
    (raw as Record<string, unknown>).soft_quota_threshold_percent,
    0,
    100,
    DEFAULT_CONFIG.soft_quota_threshold_percent!,
    errors,
  );

  // quota_fallback
  if ("quota_fallback" in raw) {
    if (!isValidQuotaFallback(raw.quota_fallback)) {
      errors.push(`quota_fallback must be boolean | "auto" | modelName (got ${String(raw.quota_fallback)})`);
    } else {
      result.quota_fallback = raw.quota_fallback as QuotaFallback;
    }
  }

  // quota_refresh_interval_minutes (default 15)
  result.quota_refresh_interval_minutes = validateNumberInRange(
    "quota_refresh_interval_minutes",
    (raw as Record<string, unknown>).quota_refresh_interval_minutes,
    1,
    1440,
    DEFAULT_CONFIG.quota_refresh_interval_minutes!,
    errors,
  );

  // soft_quota_cache_ttl_minutes
  result.soft_quota_cache_ttl_minutes = validateNumberInRange(
    "soft_quota_cache_ttl_minutes",
    (raw as Record<string, unknown>).soft_quota_cache_ttl_minutes,
    1,
    1440,
    DEFAULT_CONFIG.soft_quota_cache_ttl_minutes!,
    errors,
  );

  // pid_offset_enabled
  if ("pid_offset_enabled" in raw) {
    if (!isBoolean(raw.pid_offset_enabled)) {
      errors.push("pid_offset_enabled must be boolean");
    } else {
      result.pid_offset_enabled = raw.pid_offset_enabled;
    }
  }

  // google_search_enabled
  if ("google_search_enabled" in raw) {
    if (!isBoolean(raw.google_search_enabled)) {
      errors.push("google_search_enabled must be boolean");
    } else {
      result.google_search_enabled = raw.google_search_enabled;
    }
  }

  // debug
  if ("debug" in raw) {
    if (!isBoolean(raw.debug)) {
      errors.push("debug must be boolean");
    } else {
      result.debug = raw.debug;
    }
  }

  // version_cache_ttl
  result.version_cache_ttl = validateNumberInRange(
    "version_cache_ttl",
    (raw as Record<string, unknown>).version_cache_ttl,
    1,
    10080,
    DEFAULT_CONFIG.version_cache_ttl!,
    errors,
  );

  if (strict && errors.length > 0) {
    throw new ConfigValidationError(errors);
  }

  // In non-strict mode the consumer can inspect errors via validateConfigRaw.

  return result;
}

/**
 * Lightweight validation returning the error list without throwing;
 * useful for diagnostics.
 */
export function validateConfigRaw(raw: unknown): {
  valid: boolean;
  errors: string[];
  config: AntigravityConfig;
} {
  const errors: string[] = [];
  let config: AntigravityConfig;
  try {
    // non-strict to sanitize
    config = parseAndValidateConfig(raw, { strict: false });
    // re-validate manually to collect every error
    if (!isObject(raw) && raw != null) {
      errors.push("config root must be an object");
    } else if (isObject(raw)) {
      if ("cli_first" in raw && !isBoolean(raw.cli_first)) errors.push("cli_first must be boolean");
      if ("toast_scope" in raw && !isValidToastScope(raw.toast_scope)) errors.push("toast_scope invalid");
      if ("quota_fallback" in raw && !isValidQuotaFallback(raw.quota_fallback)) errors.push("quota_fallback invalid");
      if ("pid_offset_enabled" in raw && !isBoolean(raw.pid_offset_enabled))
        errors.push("pid_offset_enabled must be boolean");
      if ("google_search_enabled" in raw && !isBoolean(raw.google_search_enabled))
        errors.push("google_search_enabled must be boolean");
      if ("debug" in raw && !isBoolean(raw.debug)) errors.push("debug must be boolean");

      const numFields: Array<[string, number, number]> = [
        ["soft_quota_threshold_percent", 0, 100],
        ["quota_refresh_interval_minutes", 1, 1440],
        ["soft_quota_cache_ttl_minutes", 1, 1440],
        ["version_cache_ttl", 1, 10080],
      ];
      for (const [k, min, max] of numFields) {
        const v = (raw as Record<string, unknown>)[k];
        if (v !== undefined) {
          if (!isNumber(v)) errors.push(`${k} must be a number`);
          else if (v < min || v > max) errors.push(`${k} must be between ${min} and ${max}`);
        }
      }
    }
  } catch (e) {
    if (e instanceof ConfigValidationError) {
      const flat = e.errors.map((er) => (typeof er === "string" ? er : `${er.path}: ${er.message}`));
      return { valid: false, errors: flat.length ? flat : [(e as Error).message], config: { ...DEFAULT_CONFIG } };
    }
    errors.push((e as Error).message);
    config = { ...DEFAULT_CONFIG };
  }

  return { valid: errors.length === 0, errors, config: config! };
}

// ---------------------------------------------------------------------------
// Defaults export
// ---------------------------------------------------------------------------

/**
 * The observer returns fresh defaults without leaking references.
 */
export function defaults(): AntigravityConfig {
  return getDefaultConfig();
}

// ---------------------------------------------------------------------------
// In-memory cache (v1) — mtime-based synchronous cache
// ---------------------------------------------------------------------------

type MemoryCacheEntry = {
  config: AntigravityConfig;
  mtimeMs: number;
  path: string;
  loadedAtMs: number;
};

let _memoryCache: MemoryCacheEntry | null = null;

// ---------------------------------------------------------------------------
// Public API: load / save / update + memory cache (v1 synchronous cached)
// ---------------------------------------------------------------------------

/**
 * Clears the in-memory cache (useful for tests or when the file changed externally).
 */
export function clearConfigCache(): void {
  _memoryCache = null;
}

/**
 * Loads configuration from disk with an mtime-based in-memory cache.
 * - If the file does not exist, returns defaults.
 * - If JSON is invalid, returns defaults (+ logs a warning when debug).
 * - Refreshes the in-memory cache.
 *
 * This is the preserved v1 synchronous cached API; other modules import it
 * by this exact name.
 *
 * @param opts - force: when true ignores the in-memory cache
 * @returns sanitized AntigravityConfig
 */
export function loadConfig(opts?: { force?: boolean }): AntigravityConfig {
  const configPath = getConfigPath();
  const force = opts?.force ?? false;

  // check in-memory cache while mtime is still valid
  if (!force && _memoryCache && _memoryCache.path === configPath) {
    try {
      const stat = fs.statSync(configPath);
      if (stat.mtimeMs === _memoryCache.mtimeMs) {
        return { ..._memoryCache.config };
      }
    } catch {
      // file may have been deleted
      if (!fs.existsSync(configPath)) {
        // file vanished: clear cache and return defaults
        clearConfigCache();
        return { ...DEFAULT_CONFIG };
      }
      // stat errored but file exists: return cached value as fallback
      return { ..._memoryCache.config };
    }
  }

  // read disk
  let rawContent: string | null = null;
  let mtimeMs = 0;

  try {
    const stat = fs.statSync(configPath);
    mtimeMs = stat.mtimeMs;
    rawContent = fs.readFileSync(configPath, { encoding: "utf8" });
  } catch (err) {
    // file does not exist => defaults
    if ((err as NodeJS.ErrnoException).code === "ENOENT" || !fs.existsSync(configPath)) {
      const cfg = { ...DEFAULT_CONFIG };
      _memoryCache = {
        config: cfg,
        mtimeMs: 0,
        path: configPath,
        loadedAtMs: Date.now(),
      };
      return { ...cfg };
    }
    // other read errors => defaults and clear cache
    clearConfigCache();
    return { ...DEFAULT_CONFIG };
  }

  let parsed: unknown;
  try {
    parsed = rawContent ? JSON.parse(rawContent) : null;
  } catch {
    // invalid JSON => defaults
    const cfg = { ...DEFAULT_CONFIG };
    _memoryCache = {
      config: cfg,
      mtimeMs,
      path: configPath,
      loadedAtMs: Date.now(),
    };
    return { ...cfg };
  }

  const cfg = parseAndValidateConfig(parsed, { strict: false });

  _memoryCache = {
    config: cfg,
    mtimeMs,
    path: configPath,
    loadedAtMs: Date.now(),
  };

  return { ...cfg };
}

/**
 * Saves the full configuration atomically with chmod 0o600.
 * Refreshes the in-memory cache.
 *
 * Preserved v1 synchronous cached API.
 *
 * @param config - full (validated) config object
 * @returns saved config (clone)
 */
export function agsaveConfig(config: AntigravityConfig): AntigravityConfig {
  // validate before saving (non-strict to sanitize)
  const sanitized = parseAndValidateConfig(config, { strict: false });

  const configPath = getConfigPath();
  const json = JSON.stringify(sanitized, null, 2) + "\n";

  atomicWriteFile(configPath, json);

  // update cache with new mtime
  let mtimeMs = Date.now();
  try {
    const stat = fs.statSync(configPath);
    mtimeMs = stat.mtimeMs;
  } catch {
    // ignore
  }

  _memoryCache = {
    config: sanitized,
    mtimeMs,
    path: configPath,
    loadedAtMs: Date.now(),
  };

  return { ...sanitized };
}

/**
 * Partially updates the config: shallow merge + atomic save.
 * Safe enough for single-process use; multi-process safety relies on atomic rename.
 *
 * @param partial - fields to update
 * @returns full updated config
 *
 * @example
 * updateConfig({ debug: true, toast_scope: "minimal" })
 */
export function updateConfig(partial: Partial<AntigravityConfig>): AntigravityConfig {
  if (!isObject(partial)) {
    throw new TypeError("updateConfig: partial must be an object");
  }

  // current state (uses cache when valid)
  const current = loadConfig();

  // shallow merge: only known keys are accepted
  const mergedRaw: Record<string, unknown> = { ...current };

  for (const key of Object.keys(partial) as Array<keyof AntigravityConfig>) {
    if (key in DEFAULT_CONFIG) {
      (mergedRaw as Record<string, unknown>)[key] = (partial as Record<string, unknown>)[key];
    }
  }

  // validate merged
  const validated = parseAndValidateConfig(mergedRaw, { strict: false });

  return agsaveConfig(validated);
}

// ---------------------------------------------------------------------------
// Async variants — v2 async implementations under the async names
// ---------------------------------------------------------------------------

/**
 * Async loader (v2 implementation).
 *
 * - Passing a string `customPath` performs the v2 flow: read the given path,
 *   merge defaults, strictly validate, throw ConfigValidationError on
 *   corruption, return defaults silently when the file is missing.
 * - Passing `{ force }` or nothing delegates to the v1 synchronous cached
 *   loader wrapped in a Promise (preserves the original v1 wrapper contract).
 *
 * @param customPathOrOpts - explicit config path (v2) or cache options (v1)
 */
export async function loadConfigAsync(customPathOrOpts?: string | { force?: boolean }): Promise<AntigravityConfig> {
  if (typeof customPathOrOpts === "string") {
    return loadConfigFromPath(customPathOrOpts);
  }
  return loadConfig(customPathOrOpts);
}

/**
 * v2 async path-based loader.
 * If the file is missing, returns defaults silently.
 * If corrupted, throws ConfigValidationError with path context.
 *
 * @param customPath - explicit config path
 */
async function loadConfigFromPath(customPath?: string): Promise<AntigravityConfig> {
  const fp = resolveConfigPath(customPath);
  try {
    await fsp.access(fp, fs.constants.F_OK);
  } catch {
    // file does not exist — return defaults
    return getDefaultConfig();
  }

  let rawText: string;
  try {
    rawText = await fsp.readFile(fp, "utf8");
  } catch (e: any) {
    throw new Error(`cannot read config ${fp}: ${e?.message ?? String(e)}`);
  }

  if (!rawText.trim()) {
    return getDefaultConfig();
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch (e: any) {
    throw new ConfigValidationError(`invalid JSON in ${fp}: ${e?.message ?? String(e)}`, [
      { path: "$", message: `json parse error: ${e?.message}` },
    ]);
  }

  // merge defaults <- parsed before validation to allow partial files
  const merged = deepMerge(getDefaultConfig() as any, parsed as any);
  const checked = validateInternal(merged);
  if (!checked.valid) {
    throw new ConfigValidationError(
      `config validation failed for ${fp}: ${checked.errors.map((er) => `${er.path} ${er.message}`).join(", ")}`,
      checked.errors,
    );
  }
  return checked.config!;
}

/**
 * Async saver (v2 implementation): merges with defaults, validates, then
 * writes atomically (tmp + chmod 600 + rename).
 *
 * Note: returns the written file path (v2 semantics). Callers that need the
 * saved config clone can use the synchronous agsaveConfig.
 *
 * @param cfg - partial or full config, merged with defaults then validated
 * @param customPath - optional explicit path override
 * @returns written file path
 */
export async function saveConfigAsync(
  cfg: Partial<AntigravityConfig> | AntigravityConfig,
  customPath?: string,
): Promise<string> {
  const fp = resolveConfigPath(customPath);
  // merge defaults + incoming, then validate
  const base = getDefaultConfig();
  const toSave = deepMerge(base as any, (cfg ?? {}) as any) as AntigravityConfig;

  const checked = validateInternal(toSave);
  if (!checked.valid) {
    throw new ConfigValidationError(
      `cannot save invalid config: ${checked.errors.map((er) => `${er.path} ${er.message}`).join(", ")}`,
      checked.errors,
    );
  }

  const finalCfg = checked.config!;

  // JSON.stringify drops undefined values
  const content = JSON.stringify(finalCfg, null, 2) + "\n";

  await atomicWriteFileAtomic(fp, content);

  // for observability, log redacted version if debug enabled
  try {
    if (
      finalCfg.debug_enabled ||
      (typeof finalCfg.debug === "object" && (finalCfg.debug as DebugObjectConfig).enabled)
    ) {
      const redacted = redactedCopy(finalCfg);
      // observer does not throw on console failure
      if (typeof console !== "undefined" && console.debug) {
        console.debug(`[m[devthink] config saved ${fp}`, redacted);
      }
    }
  } catch {
    /* the guarded best-effort operation falls through: the outer flow owns the failure */
  }

  return fp;
}

/**
 * Async version of updateConfig (v1 wrapper over the sync implementation).
 */
export async function updateConfigAsync(partial: Partial<AntigravityConfig>): Promise<AntigravityConfig> {
  return updateConfig(partial);
}

// ---------------------------------------------------------------------------
// Sync bootstrap variants (v2) — direct sync IO without the mtime cache
// ---------------------------------------------------------------------------

/**
 * Sync load — for CLI bootstrap where async is not convenient.
 * Same semantics as the v2 async loader but synchronous and uncached.
 */
export function loadConfigSync(customPath?: string): AntigravityConfig {
  const fp = resolveConfigPath(customPath);
  try {
    fs.accessSync(fp, fs.constants.F_OK);
  } catch {
    return getDefaultConfig();
  }
  try {
    const txt = fs.readFileSync(fp, "utf8");
    if (!txt.trim()) return getDefaultConfig();
    const parsed = JSON.parse(txt);
    const merged = deepMerge(getDefaultConfig() as any, parsed as any);
    const checked = validateInternal(merged);
    if (!checked.valid) {
      throw new ConfigValidationError(`config validation failed for ${fp}`, checked.errors);
    }
    return checked.config!;
  } catch (e: any) {
    if (e instanceof ConfigValidationError) throw e;
    throw new Error(`cannot read config ${fp}: ${e?.message ?? String(e)}`);
  }
}

/**
 * Sync save atomic — writes tmp, chmod, rename.
 */
export function saveConfigSync(cfg: Partial<AntigravityConfig> | AntigravityConfig, customPath?: string): string {
  const fp = resolveConfigPath(customPath);
  const base = getDefaultConfig();
  const toSave = deepMerge(base as any, (cfg ?? {}) as any) as AntigravityConfig;
  const checked = validateInternal(toSave);
  if (!checked.valid) {
    throw new ConfigValidationError(
      `cannot save invalid config: ${checked.errors.map((er) => er.path).join(",")}`,
      checked.errors,
    );
  }
  const finalCfg = checked.config!;
  const content = JSON.stringify(finalCfg, null, 2) + "\n";
  const dir = path.dirname(fp);
  try {
    fs.mkdirSync(dir, { recursive: true, mode: DIR_MODE });
  } catch {
    /* the guarded best-effort operation falls through: the outer flow owns the failure */
  }
  try {
    fs.chmodSync(dir, DIR_MODE);
  } catch {
    /* the guarded best-effort operation falls through: the outer flow owns the failure */
  }
  const random = crypto.randomBytes(6).toString("hex");
  const tmp = path.join(dir, `.${path.basename(fp)}.${process.pid}.${random}.tmp`);
  try {
    fs.writeFileSync(tmp, content, { encoding: "utf8", mode: FILE_MODE });
    try {
      fs.chmodSync(tmp, FILE_MODE);
    } catch {
      /* the guarded best-effort operation falls through: the outer flow owns the failure */
    }
    fs.renameSync(tmp, fp);
    try {
      fs.chmodSync(fp, FILE_MODE);
    } catch {
      /* the guarded best-effort operation falls through: the outer flow owns the failure */
    }
  } finally {
    try {
      fs.unlinkSync(tmp);
    } catch {
      /* the guarded best-effort operation falls through: the outer flow owns the failure */
    }
  }
  return fp;
}

// ---------------------------------------------------------------------------
// Safe debug info bundle (v1) — never logs secrets
// ---------------------------------------------------------------------------

/**
 * Safe debug info (no secret). Intended for logging with debug enabled.
 */
export function getSafeDebugInfo() {
  const cfgPath = getConfigPath();
  const tuple = getPlatformTuple();
  return {
    configPath: cfgPath,
    clientId: OAUTH_CLIENT_ID,
    projectFallback: PROJECT_FALLBACK,
    endpoints: CLOUDCODE_ENDPOINTS,
    modelsCount: MODELS_2026.length,
    platform: tuple.platform,
    arch: tuple.arch,
    userAgent: buildGeminiUserAgent(),
    xGoog: buildXGoogApiClient(),
    clientMetadata: CLIENT_METADATA_STRING,
  } as const;
}

// ---------------------------------------------------------------------------
// Exports barrel
// ---------------------------------------------------------------------------

export const Config = {
  resolveConfigDir,
  resolveConfigPath,
  getConfigPath,
  getDefaultConfig,
  defaults,
  DEFAULT_CONFIG,
  validate,
  validateConfig,
  validateConfigRaw,
  parseAndValidateConfig,
  loadConfig,
  agsaveConfig,
  updateConfig,
  clearConfigCache,
  loadConfigAsync,
  saveConfigAsync,
  updateConfigAsync,
  loadConfigSync,
  saveConfigSync,
  getSafeDebugInfo,
  schema: ANTIGRAVITY_CONFIG_JSON_SCHEMA,
  defaultsRaw: CONFIG_DEFAULTS,
};

export default Config;

// Compatibility alias for older imports
export const SCHEMA = ANTIGRAVITY_CONFIG_JSON_SCHEMA;

// ---------------------------------------------------------------------------
// Validation helpers — merged from validate.ts (v2.1.14 consolidation)
// Canonical hardened validators: ReDoS-safe linear-time implementations,
// documented, node:* only. The former validate.ts was deleted; its entire
// surface lives below unchanged.
// ---------------------------------------------------------------------------

/**
 * Validates an email address.
 * @param email - candidate email (nullish / non-string inputs coerce to "")
 * @returns true when the address has exactly one "@" and a dotted domain
 */
export function isValidEmail(email: string): boolean {
  // Linear-time validation (regex-free; the former /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  // had nested quantifiers and was flagged as ReDoS-prone on uncontrolled input).
  const value = String(email ?? "").trim();
  if (value.length === 0 || /\s/.test(value)) return false;
  const at = value.indexOf("@");
  if (at <= 0 || value.indexOf("@", at + 1) !== -1) return false;
  const domain = value.slice(at + 1);
  const dot = domain.lastIndexOf(".");
  return dot > 0 && dot < domain.length - 1;
}

/**
 * Validates a semantic-version string (optional prerelease / build suffix).
 * @param v - candidate version
 */
export function isValidSemver(v: string): boolean {
  return /^\d+\.\d+\.\d+(-[a-z0-9.-]+)?(\+[a-z0-9.-]+)?$/i.test(String(v ?? "").trim());
}

/**
 * Validates a Google-style project id (lowercase, 6..30 chars) or the
 * documented fallback project id.
 * @param id - candidate project id
 */
export function isValidProjectId(id: string): boolean {
  return /^[a-z][a-z0-9-]{4,29}[a-z0-9]$/.test(String(id ?? "").trim()) || id === "rising-fact-p41fc";
}

/**
 * Validates a persisted account shape (email + refresh token).
 * @param a - candidate account object
 * @returns valid flag plus a human-readable error list
 */
export function validateAccount(a: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!a) errors.push("account is null");
  else {
    if (!a.email || !isValidEmail(a.email)) errors.push("invalid email");
    if (!a.refreshToken || typeof a.refreshToken !== "string" || a.refreshToken.length < 10)
      errors.push("invalid refreshToken");
  }
  return { valid: errors.length === 0, errors };
}

/**
 * Validates a model id semantically: the lowercased id must contain one of
 * the substrings gemini / claude / antigravity.
 * @param model - candidate model id
 */
export function validateModelId(model: string): boolean {
  const lower = String(model ?? "").toLowerCase();
  return lower.includes("gemini") || lower.includes("claude") || lower.includes("antigravity");
}

// ---------------------------------------------------------------------------
// System utilities — merged from system.ts (v2.1.14 consolidation)
// Survivors of the collision resolution, kept verbatim from the former
// system.ts (dense style) except for the documented renames below; node:*
// references are qualified through the fs / path / os / crypto namespaces
// imported at the top of this file.
//  - validateEmail / validateSemver / validateProjectId: legacy system.ts
//    names, now one-line aliases of the canonical validators above (the old
//    regex implementations were the same-purpose, weaker duplicates).
//  - validateModelIdCharset: former system.ts validateModelId (charset
//    regex), renamed to free the canonical semantic validateModelId.
//  - loadConfigRaw / saveConfigRaw: former system.ts minimal raw JSON IO
//    helpers, renamed because the validated loadConfig / agsaveConfig earlier
//    in this file keep the canonical names.
//  - redactSecrets / VERSION_FALLBACK / fetchVersionChain stay config-local
//    this round; cross-file dedupe (debug.ts, version.ts, auth.ts) is a
//    follow-up orchestrator concern.
// ---------------------------------------------------------------------------

/** Config directory (honors OPENCODE_CONFIG_DIR, defaults to ~/.config/opencode). */
export const cfgDir = (): string =>
  process.env.OPENCODE_CONFIG_DIR?.trim() || path.join(os.homedir(), ".config", "opencode");

// v2.1.15 Phase B: the logging trio (logsDir, redactSecrets with the
// Bearer [REDACTED] semantics, and the debugLogger ring-buffer singleton)
// moved to debug.ts — THE logging owner. debug.ts imports cfgDir from here
// (one-directional; config never imports debug).
/** Governed fallback version when every version-chain source fails. */
export const VERSION_FALLBACK = "1.19.2" as const;

/** Fetches the latest Antigravity version across the known update sources. */
export const fetchVersionChain = async (): Promise<string> => {
  const urls = [
    "https://autoupdater.antigravity.google.com/version",
    "https://registry.npmjs.org/antigravity/latest",
    "https://api.github.com/repos/antigravity/antigravity/releases/latest",
  ];
  for (const u of urls) {
    try {
      const r = await fetch(u, { headers: { "User-Agent": "antigravity/1.19.2" } });
      if (!r.ok) continue;
      const j: any = await r.json().catch(async () => ({ text: await r.text() }));
      const v = j.version || j.tag_name || j.text || "";
      if (v) return String(v).replace(/^v/, "");
    } catch {
      continue;
    }
  }
  return VERSION_FALLBACK;
};

// Legacy system.ts validator names — thin aliases of the canonical hardened
// validators in the validation-helpers section (kept for the published
// ./system subpath surface).
export const validateEmail = isValidEmail;
export const validateSemver = isValidSemver;
export const validateProjectId = isValidProjectId;

/** Charset regex variant of model-id validation (former system.ts validateModelId). */
export const validateModelIdCharset = (id: string): boolean => /^[a-z0-9-_.]+$/.test(id.toLowerCase());

/** Minimal raw JSON read of antigravity.json (no schema validation, never throws). */
export const loadConfigRaw = (): any => {
  try {
    const p = path.join(cfgDir(), "antigravity.json");
    if (!fs.existsSync(p)) return {};
    const raw = fs.readFileSync(p, "utf8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

/** Minimal raw JSON write of antigravity.json (atomic tmp+rename, chmod 600, never throws). */
export const saveConfigRaw = (c: any): void => {
  try {
    fs.mkdirSync(cfgDir(), { recursive: true, mode: 0o700 });
    const p = path.join(cfgDir(), "antigravity.json");
    const tmp = `${p}.tmp-${process.pid}-${crypto.randomInt(1000000)}`;
    fs.writeFileSync(tmp, JSON.stringify(c, null, 2), { encoding: "utf8", mode: 0o600 });
    try {
      fs.chmodSync(tmp, 0o600);
    } catch {
      /* the guarded best-effort operation falls through: the outer flow owns the failure */
    }
    try {
      fs.renameSync(tmp, p);
    } catch {
      fs.writeFileSync(p, JSON.stringify(c, null, 2), { encoding: "utf8", mode: 0o600 });
    }
    try {
      fs.chmodSync(p, 0o600);
    } catch {
      /* the guarded best-effort operation falls through: the outer flow owns the failure */
    }
  } catch {
    /* the guarded best-effort operation falls through: the outer flow owns the failure */
  }
};

/** Atomic file write (tmp + chmod 600 + rename) used for plain-file persistence. */
export const atomicWrite = (p: string, c: string): void => {
  try {
    fs.mkdirSync(cfgDir(), { recursive: true });
  } catch {
    /* the guarded best-effort operation falls through: the outer flow owns the failure */
  }
  const tmp = `${p}.tmp-${crypto.randomInt(1000000)}`;
  fs.writeFileSync(tmp, c, { encoding: "utf8", mode: 0o600 });
  try {
    fs.renameSync(tmp, p);
  } catch {
    fs.writeFileSync(p, c, { encoding: "utf8" });
  }
};

/* ════════════════════════════════════════════════════════════════════
   Section: the gateway configuration loader (the 1.1.13 embedded-gateway
   definition loader absorbed by the grand merge — the .mjs-first probe
   chain, the version registry and the validator).
   ════════════════════════════════════════════════════════════════════ */
/**
 * configloader — loads the gateway definition from the user customization layer
 * one file one responsibility — only config loading lives here
 *
 * the library is universal and dry — all logic lives at root
 * the user customization lives in web/config.ts — the hardcoded v1 v5
 * definitions that ship as the default example
 *
 * resolution order:
 *   1 gateway.config.ts in cwd — user placed config at project root
 *   2 web/config.ts — the standard location per architecture skill
 *   3 builtin default — the shipped v1 v5 example configs
 *
 * the cli scaffolds a fresh web/config.ts for new users
 * users may create as many versions as they want — v1 through v9 and beyond
 */

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { gatewayconfig, gatewaydefinition } from "./types";

/** loaded definition cache */
let loaded: gatewaydefinition | null = null;

/** builtin default — empty definition when no user config exists
 * the library is dry — user customization lives in web/config.ts
 * the cli scaffolds a fresh web/config.ts for new users */
async function builtindefault(): Promise<gatewaydefinition> {
  return { versions: {} };
}

/** try import from a path — returns null when not found */
async function tryimport(path: string): Promise<gatewaydefinition | null> {
  try {
    const mod = await import(/* @vite-ignore */ path);
    const candidate = mod.default ?? mod.config ?? mod.gatewaydefinition ?? mod;
    if (candidate && typeof candidate === "object" && "versions" in candidate) {
      return candidate as gatewaydefinition;
    }
    return null;
  } catch {
    return null;
  }
}

/** config search bases — cwd, module dir (source root) and module parent (dist)
 * relative dynamic imports resolve against the importing module url not
 * the process cwd, so the built dist/configloader.js must also probe the
 * parent directory where web/config.ts lives in a packaged install */
function searchbases(): string[] {
  const moduledir = dirname(fileURLToPath(import.meta.url));
  const bases = [resolve(process.cwd()), moduledir, resolve(moduledir, "..")];
  return [...new Set(bases)];
}

/** loadconfig — resolve the gateway definition from the standard locations
 * caches the result for the process lifetime — call reloadconfig to refresh */
export async function loadconfig(): Promise<gatewaydefinition> {
  if (loaded) return loaded;
  // .mjs variants come first in each pair: the extension carries the module
  // type (immune to the nearest package.json type field), so a config
  // scaffolded by the cli loads under plain node in every consumer project
  const names = [
    "web/config.mjs",
    "web/config.ts",
    "web/config.js",
    "gateway.config.mjs",
    "gateway.config.ts",
    "gateway.config.js",
  ];
  for (const base of searchbases()) {
    for (const name of names) {
      const found = await tryimport(`${base}/${name}`);
      if (found) {
        loaded = found;
        return found;
      }
    }
  }
  // builtin fallback
  loaded = await builtindefault();
  return loaded;
}

/** reloadconfig — clear the cache and reload from disk */
export async function reloadconfig(): Promise<gatewaydefinition> {
  loaded = null;
  return loadconfig();
}

/** getversion — get one version config by id */
export async function getversion(id: string): Promise<gatewayconfig | null> {
  const def = await loadconfig();
  return def.versions[id] ?? null;
}

/** listversions — get all version ids */
export async function listversions(): Promise<string[]> {
  const def = await loadconfig();
  return Object.keys(def.versions);
}

/** validateconfig — check a gateway definition for common errors
 * returns a list of human readable problems — empty when valid */
export function validateconfig(def: gatewaydefinition): string[] {
  const problems: string[] = [];
  if (!def.versions || Object.keys(def.versions).length === 0) {
    problems.push("no versions defined — add at least one version to versions map");
    return problems;
  }
  for (const [id, cfg] of Object.entries(def.versions)) {
    const prefix = `version ${id}:`;
    if (!cfg.id) problems.push(`${prefix} missing id`);
    if (cfg.id !== id) problems.push(`${prefix} id mismatch — map key is ${id} but id is ${cfg.id}`);
    if (!cfg.providername) problems.push(`${prefix} missing providername`);
    if (!cfg.upstreams || cfg.upstreams.length === 0) problems.push(`${prefix} no upstreams configured`);
    if (!cfg.auth) problems.push(`${prefix} missing auth config`);
    if (!cfg.models || cfg.models.length === 0) problems.push(`${prefix} no models configured`);
    if (!cfg.metamodel?.id) problems.push(`${prefix} missing metamodel id`);
    // rotation models must exist in the catalog — the catalog may itself be
    // missing (already reported above) so the lookup guards against it
    if (cfg.rotation?.models) {
      const ids = new Set((cfg.models ?? []).map((m) => m.id));
      for (const rm of cfg.rotation.models) {
        if (!ids.has(rm)) problems.push(`${prefix} rotation model ${rm} not in models catalog`);
      }
    }
    // defaultmodel must exist
    if (
      cfg.defaultmodel &&
      !(cfg.models ?? []).find((m) => m.id === cfg.defaultmodel) &&
      cfg.defaultmodel !== cfg.metamodel?.id
    ) {
      problems.push(`${prefix} defaultmodel ${cfg.defaultmodel} not in models catalog`);
    }
    // auth env var must be set when required from env — a version with a
    // missing auth block already carries its problem above; the dereference
    // below used to crash the whole validation with a type error instead of
    // reporting the remaining problems
    if (cfg.auth?.required && cfg.auth?.keysources?.includes("env") && !cfg.auth?.envvar) {
      problems.push(`${prefix} auth requires env keys but envvar is not set`);
    }
  }
  return problems;
}
