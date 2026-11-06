/**
 * providers — consolidated providers engine logics of the getry family.
 * @module providers
 * @family wave/logicfold2
 * One keyed file per family: the former variant arms (providercli)
 * retired into this seat with every export preserved under the same name.
 */

import { getDefaultAccountManager } from "./accounts.js";
import { ANTIGRAVITY_VERSION_FALLBACK, ANTIGRAVITY_VERSION_MIN_SUPPORTED, CLIENT_METADATA_STRING, CLOUDCODE_BASE_URL, CLOUDCODE_DAILY_BASE, CODE_ASSIST_PATH_MAP, ENDPOINTS, FALLBACK_PROJECT_ID, FILE_PATHS, GEMINI_CLI_OAUTH_CLIENT_ID, GEMINI_CLI_OAUTH_CLIENT_SECRET, GEMINI_CLI_SCOPES, GEMINI_CLI_USER_AGENT, OAUTH_REVOKE_URL, OAUTH_TOKEN_URL, PLUGIN_VERSION, PROJECT_FALLBACK } from "./constants.js";
import { X_GOOG_API_CLIENT_GEMINI_CLI } from "./fingerprint.js";
import { ENDPOINT_ORDER, MODELS_2026_CATALOG, DEFAULT_MODEL_ID, MODEL_BY_ID, ModelCatalogEntry, SEARCH_MODEL_PREVIEW, buildGoogleProviderModelConfigs, buildOpenCodeModelDefinitions, detectTargetProvider } from "./models.js";
import { ANTIGRAVITY_CLI_CLIENT_ID, ANTIGRAVITY_CLI_CLIENT_SECRET, ANTIGRAVITY_CLI_GRPC_VERSION, ANTIGRAVITY_CLI_OAUTH_SCOPES, ANTIGRAVITY_CLI_REDIRECT_OFFICIAL, ANTIGRAVITY_CLI_VERSION_LATEST, GEMINI_OAUTH_CLIENT_ID, GEMINI_OAUTH_CLIENT_SECRET } from "./oauth.js";
import { ChatEvent, parseEventStream } from "./streaming.js";
import { DevThinkConfig, DevThinkPaths, VERSION_FALLBACK, atomicWrite, cfgDir, fetchVersionChain, loadConfigRaw, resolveCredential, saveConfigRaw, validateEmail, validateModelId, validateModelIdCharset, validateProjectId, validateSemver } from "@wenathlan/devthink/config";
import { FETCH_TIMEOUT_MS } from "@wenathlan/devthink/constants";
import { debugLogger, logsDir, redactSecrets } from "@wenathlan/devthink/core";
import { osStringRows } from "@wenathlan/devthink/os";

/* ===== block: providers ===== */
/**
 * providers.ts — the chat provider transport of the workbench (root layer).
 *
 * One responsibility: turn a ChatRequest into a provider-specific streaming
 * HTTP call and turn provider answers into a common ChatEvent stream. the
 * PROVIDERS table carries the eleven known provider ids with their base
 * urls, wire protocols (openai / anthropic / google) and the environment
 * variable that feeds their credential — never a literal key. every wire
 * family gets its own header and body builder; errors come back through
 * cleanError which redacts anything credential-shaped before it surfaces.
 * transport retries ride retryDelay backoff (3 attempts, 5xx only).
 */

/* the ownership seam of the wave/ownership.getry split: the provider
 * protocol surface and the retry/redact helpers are gateway-domain
 * concerns this owner carries beside the provider transport (they moved
 * with the wave — never duplicated inside the os gateway client), while
 * the os config credential resolver stays the devthink seam the adapter
 * imports through the published specifier. */



/** Identifies the public wire formats normalized by the gateway. */
export type ProviderProtocol = "openai" | "anthropic" | "google";

/** Returns bounded exponential retry timing for a transient request failure. */
export function retryDelay(attempt: number, baseMs = 250, maximumMs = 4_000): number {
  return Math.min(maximumMs, baseMs * 2 ** Math.max(0, attempt));
}

/** Removes a bearer value from an error message before it reaches a terminal or browser surface. */
export function redactProviderError(message: string): string {
  return message.replace(/bearer\s+[^\s]+/gi, "bearer [redacted]").slice(0, 500);
}

export type ChatRole = "system" | "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type ChatRequest = {
  provider: string;
  model: string;
  messages: ChatMessage[];
  temperature?: number | undefined;
  maxTokens?: number | undefined;
  signal?: AbortSignal | undefined;
};

export type ModelInfo = {
  id: string;
  provider: string;
  contextWindow?: number | undefined;
  supportsStreaming: boolean;
};

type ProviderDefinition = {
  id: string;
  baseUrl?: string;
  protocol: ProviderProtocol;
  env: string;
};

/** The known provider table: id → base url, wire protocol and credential env var. */
export const PROVIDERS: ProviderDefinition[] = [
  { id: "openai", baseUrl: "https://api.openai.com/v1", protocol: "openai", env: "OPENAI_API_KEY" },
  { id: "zai", baseUrl: "https://api.z.ai/api/paas/v4", protocol: "openai", env: "ZAI_API_KEY" },
  { id: "openrouter", baseUrl: "https://openrouter.ai/api/v1", protocol: "openai", env: "OPENROUTER_API_KEY" },
  { id: "anthropic", baseUrl: "https://api.anthropic.com", protocol: "anthropic", env: "ANTHROPIC_API_KEY" },
  {
    id: "google",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    protocol: "google",
    env: "GEMINI_API_KEY",
  },
  {
    id: "qwen",
    baseUrl: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
    protocol: "openai",
    env: "QWEN_API_KEY",
  },
  { id: "deepseek", baseUrl: "https://api.deepseek.com", protocol: "openai", env: "DEEPSEEK_API_KEY" },
  { id: "groq", baseUrl: "https://api.groq.com/openai/v1", protocol: "openai", env: "GROQ_API_KEY" },
  { id: "mistral", baseUrl: "https://api.mistral.ai/v1", protocol: "openai", env: "MISTRAL_API_KEY" },
  { id: "xai", baseUrl: "https://api.x.ai/v1", protocol: "openai", env: "XAI_API_KEY" },
  { id: "ollama", protocol: "openai", env: "OLLAMA_API_KEY" },
  { id: "mimo", baseUrl: "https://api.xiaomimimo.com/v1", protocol: "openai", env: "MIMO_API_KEY" },
];

/** Finds one provider definition by id (case-insensitive).
 * @throws when the provider id is unknown. */
function findProvider(provider: string): ProviderDefinition {
  const definition = PROVIDERS.find((item) => item.id === provider.toLowerCase());
  if (!definition) throw new Error(`Unknown provider: ${provider}. Use devthink providers.`);
  return definition;
}

/** Joins a base url and a path with exactly one slash between them. */
function joinUrl(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

/** Converts one provider error body into a redacted, single-line Error.
 * @throws never — always returns the Error to throw at the call site. */
function cleanError(body: string, status: number): Error {
  let detail = body.trim();
  try {
    const parsed = JSON.parse(body) as Record<string, unknown>;
    const error = (parsed.error || parsed.message || parsed.detail) as unknown;
    if (typeof error === "string") detail = error;
    if (error && typeof error === "object") detail = JSON.stringify(error);
  } catch {
    detail = body.trim();
  }
  const safe = redactProviderError(detail);
  return new Error(`${status} ${safe || "Provider request failed."}`);
}

/**
 * Fetches with bounded retry: transparent on 5xx and network faults, immediate otherwise.
 *
 * @param input the absolute request url.
 * @param init the fetch initializer (headers, body, signal ride through untouched).
 * @param attempts total attempts (default 3); waits ride `retryDelay` backoff.
 * @returns the last response — caller decides ok/error handling.
 */
async function fetchWithRetry(input: string, init: RequestInit, attempts = 3): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(input, init);
      if (response.ok || response.status < 500 || attempt === attempts) return response;
      await new Promise((resolve) => setTimeout(resolve, retryDelay(attempt - 1)));
    } catch (error) {
      lastError = error;
      if (attempt === attempts) throw error;
      await new Promise((resolve) => setTimeout(resolve, retryDelay(attempt - 1)));
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Provider request failed.");
}

/** Bearer-token header set of the openai wire family (accept stays sse for streaming). */
function buildOpenAiHeaders(credential: string): HeadersInit {
  return { accept: "text/event-stream", "content-type": "application/json", authorization: `Bearer ${credential}` };
}

/** x-api-key header set of the anthropic wire family, pinned to the 2023-06-01 version. */
function buildAnthropicHeaders(credential: string): HeadersInit {
  return {
    accept: "text/event-stream",
    "content-type": "application/json",
    "x-api-key": credential,
    "anthropic-version": "2023-06-01",
  };
}

/** Maps the common ChatRequest onto the google generateContent body (systemInstruction + contents + generationConfig). */
function buildGoogleBody(request: ChatRequest): Record<string, unknown> {
  const system = request.messages
    .filter((message) => message.role === "system")
    .map((message) => ({ text: message.content }));
  const contents = request.messages
    .filter((message) => message.role !== "system")
    .map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }],
    }));
  return {
    ...(system.length ? { systemInstruction: { parts: system } } : {}),
    contents,
    generationConfig: {
      ...(request.temperature === undefined ? {} : { temperature: request.temperature }),
      ...(request.maxTokens === undefined ? {} : { maxOutputTokens: request.maxTokens }),
    },
  };
}

/** Maps the common ChatRequest onto the anthropic messages body (system folded into its own field). */
function buildAnthropicBody(request: ChatRequest): Record<string, unknown> {
  const system = request.messages
    .filter((message) => message.role === "system")
    .map((message) => message.content)
    .join("\n\n");
  return {
    model: request.model,
    messages: request.messages.filter((message) => message.role !== "system"),
    max_tokens: request.maxTokens ?? 4096,
    stream: true,
    ...(system ? { system } : {}),
    ...(request.temperature === undefined ? {} : { temperature: request.temperature }),
  };
}

/** Maps the common ChatRequest onto the openai chat/completions body. */
function buildOpenAiBody(request: ChatRequest): Record<string, unknown> {
  return {
    model: request.model,
    messages: request.messages,
    stream: true,
    ...(request.temperature === undefined ? {} : { temperature: request.temperature }),
    ...(request.maxTokens === undefined ? {} : { max_tokens: request.maxTokens }),
  };
}

/**
 * Lists the known providers with their base urls, protocols and credential env names.
 *
 * @returns defensive copies — callers cannot mutate the table.
 */
export function listProviders(): ProviderDefinition[] {
  return PROVIDERS.map((provider) => ({ ...provider }));
}

/**
 * Resolves one provider to its concrete endpoint and credential.
 *
 * the base url precedence is config `providers.<id>.baseUrl` → active-provider
 * `config.baseUrl` → the table default; the credential comes from
 * `resolveCredential` (config first, then the provider's env var).
 *
 * @returns the definition plus the resolved baseUrl and credential.
 * @throws when no base url can be derived or no credential is present.
 */
export function resolveProvider(
  provider: string,
  config: DevThinkConfig,
  paths?: DevThinkPaths,
): ProviderDefinition & { baseUrl: string; credential: string } {
  const definition = findProvider(provider);
  const isActive = provider === (config.activeProvider || config.provider);
  const baseUrl =
    config.providers?.[provider]?.baseUrl || (isActive ? config.baseUrl : undefined) || definition.baseUrl;
  if (!baseUrl) throw new Error(`Provider ${provider} requires baseUrl in config or --base-url.`);
  const credential = resolveCredential(provider, config, paths);
  if (!credential)
    throw new Error(`No credential found for ${provider}. Set ${definition.env} or configure it explicitly.`);
  return { ...definition, baseUrl, credential };
}

/**
 * Streams one chat completion through the provider's native wire protocol.
 *
 * @param request the chat request (provider id, model, messages, sampling knobs, optional abort signal).
 * @param config the resolved DevThink config (active provider, base urls, credentials).
 * @param paths the resolved DevThink paths (credential file lookup).
 * @returns an async generator of normalized ChatEvents (deltas, usage, done).
 * @throws a redacted provider Error on non-ok responses after the retry budget.
 */
export async function streamChat(
  request: ChatRequest,
  config: DevThinkConfig,
  paths?: DevThinkPaths,
): Promise<AsyncGenerator<ChatEvent>> {
  const provider = resolveProvider(request.provider, config, paths);
  const url =
    provider.protocol === "google"
      ? `${joinUrl(provider.baseUrl, `models/${encodeURIComponent(request.model)}:streamGenerateContent`)}?alt=sse`
      : joinUrl(provider.baseUrl, provider.protocol === "anthropic" ? "/v1/messages" : "/chat/completions");
  const headers =
    provider.protocol === "google"
      ? { accept: "text/event-stream", "content-type": "application/json", "x-goog-api-key": provider.credential }
      : provider.protocol === "anthropic"
        ? buildAnthropicHeaders(provider.credential)
        : buildOpenAiHeaders(provider.credential);
  const body =
    provider.protocol === "google"
      ? buildGoogleBody(request)
      : provider.protocol === "anthropic"
        ? buildAnthropicBody(request)
        : buildOpenAiBody(request);
  const response = await fetchWithRetry(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    ...(request.signal ? { signal: request.signal } : {}),
  });
  if (!response.ok) throw cleanError(await response.text(), response.status);
  return parseEventStream(response, { provider: provider.id, model: request.model, signal: request.signal });
}

/**
 * Lists the models the provider currently exposes for the resolved credential.
 *
 * @param providerName the provider id from the PROVIDERS table.
 * @param config the resolved DevThink config.
 * @param paths the resolved DevThink paths (credential file lookup).
 * @returns model descriptors (id, provider, context window, streaming support); google reads inputTokenLimit, the openai family reads context_length.
 * @throws a redacted provider Error on non-ok responses after the retry budget.
 */
export async function listModels(
  providerName: string,
  config: DevThinkConfig,
  paths?: DevThinkPaths,
): Promise<ModelInfo[]> {
  const provider = resolveProvider(providerName, config, paths);
  if (provider.protocol === "google") {
    const response = await fetchWithRetry(joinUrl(provider.baseUrl, "models"), {
      headers: { "x-goog-api-key": provider.credential },
    });
    if (!response.ok) throw cleanError(await response.text(), response.status);
    const payload = (await response.json()) as { models?: Array<{ name?: string; inputTokenLimit?: number }> };
    return (payload.models || []).map((model) => ({
      id: (model.name || "").replace(/^models\//, ""),
      provider: provider.id,
      contextWindow: model.inputTokenLimit,
      supportsStreaming: true,
    }));
  }
  const path = provider.protocol === "anthropic" ? "/v1/models" : "/models";
  const headers =
    provider.protocol === "anthropic"
      ? buildAnthropicHeaders(provider.credential)
      : buildOpenAiHeaders(provider.credential);
  const response = await fetchWithRetry(joinUrl(provider.baseUrl, path), { headers });
  if (!response.ok) throw cleanError(await response.text(), response.status);
  const payload = (await response.json()) as { data?: Array<{ id?: string; context_length?: number }> };
  return (payload.data || [])
    .filter((model) => model.id)
    .map((model) => ({
      id: model.id as string,
      provider: provider.id,
      contextWindow: model["context_length"],
      supportsStreaming: true,
    }));
}

/* ===== block: providercli ===== */
/**
 * @file providercli.ts
 * @module gateway/providercli
 * @description
 *  The provider account console of the ownership wave (wave/ownership.gateway,
 *  step 5 — the final double move): moved verbatim from devthink/server.ts
 *  (the grand-merge interned provider account console cli, its library
 *  barrel and the opencode server plugin entries), so the gateway owns its
 *  provider console family — one owner, the family consumes, and devthink
 *  re-exports the public faces for the compat consumers.
 *
 *  Unified merge of all duplicate CLI generations into a single modular entry
 *  point. Zero external dependencies (only node:* builtins + global fetch).
 *
 *  Merge provenance (every unique feature preserved):
 *   - BASE  cli.ts (=cli(1).ts): modular command CLI with commands
 *           login / accounts / quota / config / models / status / doctor /
 *           version / interactive menu. Secure atomic writes (chmod 600),
 *           multi-account management, quota thresholds via config.ts.
 *   - FROM  cli(2).ts (=cli(3).ts):
 *           logoutFlow + top-level logout command (OAuth token revocation +
 *           account removal, --all support, interactive picker);
 *           enableAccountFlow / disableAccountFlow as top-level commands;
 *           MODELS_2026_CATALOG (2026 antigravity model catalog);
 *           buildOpenCodeModelDefinitions() (rich provider model defs with
 *           bypass metadata); configureModelsFlow() writing
 *           provider.google.models (+ provider.antigravity.models and
 *           top-level model shortcuts) into opencode.json with --global /
 *           --path resolution; locateOpenCodeJson() +
 *           resolveOpenCodeJsonCandidates(); atomicWriteFileAtomic()
 *           (fs/promises); resolveAntigravityJsonPath();
 *           helpers confirm / redactEmail / fmtDuration / printHeader.
 *           v2.1.16: the MODELS_2026_CATALOG data moved to models.ts (single
 *           owner); the dead sync atomic writer twin was deleted.
 *   - FROM  cli(4).ts: richest account listing (store version, activeIndex,
 *           activeIndexByFamily, addedAt/createdAt/expiry/projectId,
 *           remaining/limit, rateLimitResetTimes per account); quota results
 *           persisted back into the accounts file; diagnostics dumping the
 *           first 1000 chars of the raw accounts file.
 *   - FROM  cli(5).ts: manage command (interactive per-account enable/disable
 *           toggle via auth.js accountManager.enable(email,bool)); login mode
 *           selection "1 add accounts / 2 fresh start (wipe all)";
 *           claude-sonnet low/high thinkingLevel variants in configure
 *           output; soft-quota (softQuotaUntil) display in account listing;
 *           debugLogger audit log on login; diagnostics reporting the logs
 *           dir and the default model.
 *   - cli(6).ts contained nothing unique (strict subset) - deleted.
 *
 *  Sibling modules are consumed from their one owner only:
 *  ./oauth.js (the provider oauth family) ./accounts.js ./quota.js ./models.js
 *  ./versionregistry.js (in-package relatives since the ownership move — the
 *  cross-package hop died with it)
 *  @wenathlan/devthink/config (v2.1.14: validate.ts + system.ts consolidated
 *  into it) @wenathlan/devthink/constants @wenathlan/devthink/core — the
 *  os-local families stay at the os root behind the published specifiers
 *
 *  The move's sanctioned changes (the step 5 list):
 *   - the getry faces the console consumed through the published specifiers
 *     (@wenathlan/getry/oauth and siblings) answer from in-package relatives
 *     now (./oauth.js, ./quota.js, ./models.js, ...) — the cross-package hop
 *     died with the move
 *   - the os-local families (config, core, constants, oslabels) answer from
 *     the published devthink specifiers (@wenathlan/devthink/config and
 *     siblings) — the same resolution they always had
 *   - the getAccountManager() fallback twin was DELETED (~160 lines): every
 *     call site answers getDefaultAccountManager({ disableBackgroundTimer:
 *     true }) from ./accounts.js — the twin raced the real manager on the
 *     same antigravity-accounts.json file
 *   - maskToken (the provider one, slice(0,6)) renamed maskProviderToken —
 *     the shadow-kill (the getry auth family owns masktoken; behavior kept)
 *   - buildGoogleProviderModelConfigs + buildOpenCodeModelDefinitions +
 *     detectTargetProvider moved to the models owner (models.ts, the
 *     "the opencode model definitions" section); this console imports them
 *     from ./models.js
 *   - providerServer/googleAuth/antigravityAuth merged into the antigravity
 *     owner (antigravity.ts) and re-exported here for compat
 *   - the oauth client pair mirror died: GEMINI_OAUTH_CLIENT_ID/SECRET
 *     import from ./oauth.js (the owner's CLIENT_ID/CLIENT_SECRET) under
 *     the historical call-site names
 *   - the dead invokedAsMain autorun block stayed dead in the merged file
 *     (its basename test never matched server.ts and its main() reference
 *     rode the composed boot) — it was dropped with the move instead of
 *     carrying a binding that no longer exists here
 *
 *  Bypass constants (documented):
 *   client_id=681255809395-oo8f…b135j (.apps.googleusercontent.com)
 *   secret=GOCSPX-4uHgMPm…lXFsxl
 *   UA=GeminiCLI/0.57.0 (linux; x64; GitHub) google-api-nodejs-client/9.15.1
 *   X-Goog-Api-Client=gl-node/22.19.0
 *   Client-Metadata=ideType=IDE_UNSPECIFIED,platform=PLATFORM_UNSPECIFIED,pluginType=GEMINI
 *   project fallback=rising-fact-p41fc
 *   isolated dir=~/.config/opencode (override with OPENCODE_CONFIG_DIR)
 *
 * @author ONDA 5 - Finalization (merge pass)
 * @license MIT
 * @version 6.0.0
 */

import * as crypto from "node:crypto";
import * as fs from "node:fs";
import * as fsp from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";

import * as readline from "node:readline/promises";
import * as accountsMod from "./accounts.js";
import * as configMod from "@wenathlan/devthink/config";
import * as constantsMod from "@wenathlan/devthink/constants";
// v2.1.16 single-owner fix: raw values come from constants.js, identity
// snapshots from fingerprint.js and model identification from models.js via
// static named imports (the namespace interop wrappers below stay for the
// historical CJS/ESM fallback chains — the local literal copies are gone).


import * as systemMod from "@wenathlan/devthink/core";


import * as modelsMod from "./models.js";

// ---------------------------------------------------------------------------
// Local module imports (ESM .js extension for Node resolver, source is .ts).
// Import from deduplicated base modules ONLY - never from "(N)" copies.
// (the ownership move: the getry faces answer from in-package relatives)
// ---------------------------------------------------------------------------
import * as oauthMod from "./oauth.js";
import * as authMod from "./oauth.js";
import * as quotaMod from "./quota.js";
import * as versionMod from "./versionregistry.js";
// (the twin deletion) the accounts owner's real manager answers every call
// site the fallback twin used to race

// (the model transforms) the opencode model definitions moved to the models
// owner — the configure flow and the export barrel speak them from there

// (the oauth mirror kill) the client pair imports from the oauth owner under
// the historical call-site names


// Resolve interop (CJS/ESM dual): pick default if exists or namespace
const oauth: any = (oauthMod as any).default ?? oauthMod;
const accountsPkg: any = (accountsMod as any).default ?? accountsMod;
const configPkg: any = (configMod as any).default ?? configMod;
const constantsPkg: any = (constantsMod as any).default ?? constantsMod;
const quotaPkg: any = (quotaMod as any).default ?? quotaMod;
const versionPkg: any = (versionMod as any).default ?? versionMod;
const authPkg: any = (authMod as any).default ?? authMod;
const modelsPkg: any = (modelsMod as any).default ?? modelsMod;
const systemPkg: any = (systemMod as any).default ?? systemMod;

// Destructure needed APIs with fallback to namespace exports
const authenticate = oauth.authenticate as typeof import("./oauth.js").authenticate;
// v2.1.15 Phase A: ALL_MODELS_2026 lives in models.ts (model identification
// is owned by models.ts alone).
// v2.1.16 single-owner fix: the last-resort fallback entry is derived from
// models.js — a MODEL_BY_ID lookup keyed by the models.js DEFAULT_MODEL_ID
// ("antigravity-gemini-3-pro", whose catalog record carries the very same
// name/context/output/api/quotaGroup the former local literal spelled out).
const MODELS_FALLBACK_ENTRY = MODEL_BY_ID[DEFAULT_MODEL_ID];
const ALL_MODELS_FALLBACK: ReadonlyArray<any> =
  (modelsMod.ALL_MODELS_2026 as any) ??
  (modelsPkg.ALL_MODELS_2026 as any) ??
  (MODELS_FALLBACK_ENTRY ? [MODELS_FALLBACK_ENTRY] : []);

const loadConfig = (configMod.loadConfig as any) ?? (configPkg.loadConfig as any);
// grand-merge rename: the provider saveConfig collided with devthink's root
// saveConfig in merged config.ts and was renamed agsaveConfig — reference the
// renamed export (the provider config writer), not devthink's saveConfig.
const providerSaveConfig = (configMod.agsaveConfig as any) ?? (configPkg.agsaveConfig as any);
const updateConfig = (configMod.updateConfig as any) ?? (configPkg.updateConfig as any);
const DEFAULT_CONFIG = (configMod.DEFAULT_CONFIG as any) ?? (configPkg.DEFAULT_CONFIG as any);
const parseAndValidateConfig = (configMod.parseAndValidateConfig as any) ?? (configPkg.parseAndValidateConfig as any);
const getConfigPath = (configMod.getConfigPath as any) ?? (() => path.join(resolveBaseDir(), "antigravity.json"));

const AccountManagerClass = (accountsMod.AccountManager as any) ?? (accountsPkg as any);
// constants
const ALL_MODELS_2026: ReadonlyArray<any> = (modelsMod.ALL_MODELS_2026 as any) ?? ALL_MODELS_FALLBACK;
// the FILE_PATHS import is the real constants export (the fold alias retired)
// v2.1.16 single-owner fix: the fallback literal comes from constants.js
// (PROJECT_FALLBACK owner) instead of a local copy.
// the FALLBACK_PROJECT_ID import is the real constants export (the fold alias retired)
const PLUGIN_VERSION_FALLBACK = PLUGIN_VERSION;
// Ported from cli(2).ts: antigravity UA/version fallbacks (constants first, models.ts backup)
// v2.1.16 single-owner fix: the "1.19.2" literal comes from constants.js
// (ANTIGRAVITY_VERSION_FALLBACK owner) instead of a local copy.
const ANTIGRAVITY_VER_FB: string = (constantsMod as any).ANTIGRAVITY_VERSION_FALLBACK ?? ANTIGRAVITY_VERSION_FALLBACK;
const ANTIGRAVITY_UA_FB: string =
  (constantsMod as any).ANTIGRAVITY_USER_AGENT_FALLBACK ?? `antigravity/${ANTIGRAVITY_VER_FB}`;

// quota
const QuotaManager = (quotaMod.QuotaManager as any) ?? (quotaPkg.QuotaManager as any);
const getDefaultQuotaManager = (quotaMod.getDefaultQuotaManager as any) ?? null;
const checkQuotaFn = (quotaMod.checkQuota as any) ?? null;
const getQuotaGroupsFn = (quotaMod.getQuotaGroups as any) ?? null;

// version
const getVersion = (versionMod.getVersion as any) ?? (async () => FALLBACK_PROJECT_ID);
// v2.1.16 single-owner fix: the "1.15.8" hardcode comes from constants.js
// (ANTIGRAVITY_VERSION_MIN_SUPPORTED owner) instead of a local literal.
const getVersionInfo =
  (versionMod.getVersionInfo as any) ??
  (async () => ({ version: ANTIGRAVITY_VERSION_MIN_SUPPORTED, source: "hardcoded" }));

// auth.js (v3 robin-hood account manager + direct retrieveQuota) - consumers ported from cli(4)/cli(5)
const AuthAccountManager = (authMod.accountManager as any) ?? (authPkg.accountManager as any) ?? null;
const authRetrieveQuota = (authMod.retrieveQuota as any) ?? (authPkg.retrieveQuota as any) ?? null;

// models.js (flat 2026-08-25 catalog driving provider.google.models config)
const FLAT_MODELS_2026: any[] = (modelsMod.MODELS_2026_08_25 as any) ?? (modelsPkg.MODELS_2026_08_25 as any) ?? [];
// v2.1.16 single-owner fix: the endpoint URLs of the defensive fallback
// object come from constants.js (ENDPOINTS raw host-map owner).
const CODE_ASSIST = (modelsMod.CODE_ASSIST_ENDPOINTS as any) ??
  (modelsPkg.CODE_ASSIST_ENDPOINTS as any) ?? {
    PROD: ENDPOINTS.PROD,
    DAILY: ENDPOINTS.DAILY,
    SANDBOX: ENDPOINTS.SANDBOX,
  };
// v2.1.16 single-owner fix: DEFAULT_MODEL_ID answers only from models.js
// (the owner of the name) — the former local literal retired into the import.

// system.js (debug logger singleton + logs dir) - audit trail on login (cli(5) feature)
const debugLoggerImpl: any = (systemMod.debugLogger as any) ?? (systemPkg.debugLogger as any) ?? null;
const logsDirImpl: any = (systemMod.logsDir as any) ?? (systemPkg.logsDir as any) ?? null;

/** Append a redacted line to the rotating debug audit log (best-effort). */
function auditLog(msg: string): void {
  try {
    debugLoggerImpl?.get?.().log(msg);
  } catch {
    /* the guarded best-effort operation falls through: the outer flow owns the failure */
  }
}

/** Resolve the antigravity logs directory (system.js logsDir with local fallback). */
function resolveLogsDir(): string {
  try {
    if (typeof logsDirImpl === "function") return logsDirImpl();
  } catch {
    /* the guarded best-effort operation falls through: the outer flow owns the failure */
  }
  return path.join(resolveBaseDir(), "antigravity-logs");
}

// oauth.js extras used by the ported model-definition builder (cli(2))
const OAUTH_SUPPORTED_MODELS: readonly string[] = (oauthMod.SUPPORTED_MODELS_2026 as any) ?? [];

// ===========================================================================
// 00. ANSI COLORS - zero dep
// ===========================================================================
const ANSI = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  italic: "\x1b[3m",
  underline: "\x1b[4m",
  inverse: "\x1b[7m",
  hidden: "\x1b[8m",
  // foreground
  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
  brightRed: "\x1b[91m",
  brightGreen: "\x1b[92m",
  brightYellow: "\x1b[93m",
  brightBlue: "\x1b[94m",
  brightMagenta: "\x1b[95m",
  brightCyan: "\x1b[96m",
  brightWhite: "\x1b[97m",
  // background
  bgBlack: "\x1b[40m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
};

function colorize(s: string, ...codes: string[]): string {
  if (!s) return s;
  // disable colors if NO_COLOR is set
  if (process.env.NO_COLOR) return s;
  return `${codes.join("")}${s}${ANSI.reset}`;
}
const C = {
  bold: (s: string) => colorize(s, ANSI.bold),
  dim: (s: string) => colorize(s, ANSI.dim),
  red: (s: string) => colorize(s, ANSI.red),
  green: (s: string) => colorize(s, ANSI.green),
  yellow: (s: string) => colorize(s, ANSI.yellow),
  cyan: (s: string) => colorize(s, ANSI.cyan),
  magenta: (s: string) => colorize(s, ANSI.magenta),
  blue: (s: string) => colorize(s, ANSI.blue),
  gray: (s: string) => colorize(s, ANSI.gray),
  white: (s: string) => colorize(s, ANSI.white),
  b: (s: string) => colorize(s, ANSI.bold),
  bgGreen: (s: string) => colorize(s, ANSI.bgGreen, ANSI.black),
  bgRed: (s: string) => colorize(s, ANSI.bgRed, ANSI.white),
};

// Unified logger (plain-text markers instead of emoji glyphs)
function logInfo(msg: string) {
  console.log(`${C.cyan("[i]")} ${msg}`);
}
function logOk(msg: string) {
  console.log(`${C.green("[ok]")} ${msg}`);
}
function logWarn(msg: string) {
  console.log(`${C.yellow("[!]")} ${msg}`);
}
function logErr(msg: string) {
  console.error(`${C.red("[x]")} ${msg}`);
}
function logDim(msg: string) {
  console.log(C.dim(msg));
}

// ===========================================================================
// 00B. SHARED INTERACTION + FORMAT HELPERS (ported from cli(2).ts)
// ===========================================================================

/**
 * Ask one question on a promises-style readline interface and return the
 * trimmed answer.
 */
async function askQuestion(rl: readline.Interface, prompt: string): Promise<string> {
  const ans = await rl.question(prompt);
  return String(ans ?? "").trim();
}

/**
 * Yes/no confirmation prompt (ported from cli(2).ts).
 * Empty input returns {@link defaultYes}.
 */
async function confirm(rl: readline.Interface, prompt: string, defaultYes = false): Promise<boolean> {
  const suffix = defaultYes ? " [Y/n] " : " [y/N] ";
  const ans = await askQuestion(rl, `${prompt}${suffix}`);
  if (!ans) return defaultYes;
  return /^(y|yes)$/i.test(ans);
}

/**
 * Human friendly duration formatter (ported from cli(2).ts).
 * Examples: "now", "42s", "3m 12s", "5h 03m", "2d 7h".
 */
function fmtDuration(ms: number): string {
  if (ms <= 0) return "now";
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${s % 60}s`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ${m % 60}m`;
  const d = Math.floor(h / 24);
  return `${d}d ${h % 24}h`;
}

/**
 * Email redaction hook for logs/table output (ported from cli(2).ts).
 * The operator-facing CLI intentionally shows the full address for UX;
 * swap the implementation here to redact the local part when needed.
 */
function redactEmail(email: string): string {
  return email;
}

/**
 * Boxed CLI banner printed by the ported flows (login/logout/configure/
 * diagnostics style headers from cli(2).ts).
 */
function printHeader(): void {
  console.log(
    C.bold(C.cyan("\n+---------------------------------------------------------+")) +
      `\n${C.bold(C.cyan("|"))}  ${C.bold("devthink")} ${C.dim(`v${CLI_VERSION}`)} - unified CLI  ${C.bold(C.cyan("|"))}` +
      `\n${C.bold(C.cyan("|"))}  ${C.dim("direct cloudcode-pa.googleapis.com, no localhost v1 proxy")}  ${C.bold(C.cyan("|"))}` +
      `\n${C.bold(C.cyan("+---------------------------------------------------------+"))}\n`,
  );
}

// ===========================================================================
// 01. PATHS & SECURE FILE UTILS - atomic + 600
// ===========================================================================
function resolveBaseDir(): string {
  const env = process.env.OPENCODE_CONFIG_DIR?.trim();
  if (env && env.length > 0) return path.resolve(env);
  return path.join(os.homedir(), ".config", "opencode");
}
function resolveAccountsPath(): string {
  try {
    const fp = (FILE_PATHS as any).authDir ? path.join((FILE_PATHS as any).baseDir, "antigravity-accounts.json") : null;
    if (fp) return fp;
  } catch {
    /* the guarded best-effort operation falls through: the outer flow owns the failure */
  }
  return path.join(resolveBaseDir(), "antigravity-accounts.json");
}
function resolveConfigPath(): string {
  try {
    if (typeof getConfigPath === "function") return getConfigPath();
  } catch {
    /* the guarded best-effort operation falls through: the outer flow owns the failure */
  }
  return path.join(resolveBaseDir(), "antigravity.json");
}
function ensureDirExists(dir: string) {
  try {
    fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  } catch {
    /* the guarded best-effort operation falls through: the outer flow owns the failure */
  }
  try {
    fs.chmodSync(dir, 0o700);
  } catch {
    /* the guarded best-effort operation falls through: the outer flow owns the failure */
  }
}
function atomicWriteFileSecure(filePath: string, content: string, mode = 0o600): void {
  const dir = path.dirname(filePath);
  ensureDirExists(dir);
  const tmp = `${filePath}.tmp.${crypto.randomBytes(6).toString("hex")}.${process.pid}`;
  try {
    fs.writeFileSync(tmp, content, { encoding: "utf8", mode });
    try {
      fs.chmodSync(tmp, mode);
    } catch {
      /* the guarded best-effort operation falls through: the outer flow owns the failure */
    }
    fs.renameSync(tmp, filePath);
    try {
      fs.chmodSync(filePath, mode);
    } catch {
      /* the guarded best-effort operation falls through: the outer flow owns the failure */
    }
  } catch (e) {
    try {
      fs.unlinkSync(tmp);
    } catch {
      /* the guarded best-effort operation falls through: the outer flow owns the failure */
    }
    throw e;
  }
}
function readJsonSafe<T>(filePath: string, fallback: T): T {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    try {
      fs.chmodSync(filePath, 0o600);
    } catch {
      /* the guarded best-effort operation falls through: the outer flow owns the failure */
    }
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
function maskProviderToken(t: string): string {
  if (!t) return "***";
  if (t.length <= 12) return "***";
  return `${t.slice(0, 6)}...${t.slice(-4)}`;
}
function formatDate(ms?: number): string {
  if (!ms) return "-";
  try {
    return new Date(ms).toISOString().replace("T", " ").slice(0, 19);
  } catch {
    return String(ms);
  }
}

// ---------------------------------------------------------------------------
// 01B. ASYNC ATOMIC WRITERS (ported from cli(2).ts)
// ---------------------------------------------------------------------------

/** mkdir recursive + chmod, promise flavored (never throws). */
async function ensureDirAsync(dir: string): Promise<void> {
  try {
    await fsp.mkdir(dir, { recursive: true, mode: 0o700 });
  } catch {
    /* the guarded best-effort operation falls through: the outer flow owns the failure */
  }
  try {
    await fsp.chmod(dir, 0o700);
  } catch {
    /* the guarded best-effort operation falls through: the outer flow owns the failure */
  }
}

/**
 * Atomic write using node:fs/promises (ported from cli(2).ts):
 * temp file in the same directory with random suffix, chmod 600, rename.
 */
async function atomicWriteFileAtomic(filePath: string, content: string, mode = 0o600): Promise<void> {
  const dir = path.dirname(filePath);
  await ensureDirAsync(dir);
  const rand = crypto.randomBytes(6).toString("hex");
  const tmp = path.join(dir, `.${path.basename(filePath)}.${process.pid}.${rand}.tmp`);
  try {
    await fsp.writeFile(tmp, content, { encoding: "utf8", mode });
    try {
      await fsp.chmod(tmp, mode);
    } catch {
      /* the guarded best-effort operation falls through: the outer flow owns the failure */
    }
    await fsp.rename(tmp, filePath);
    try {
      await fsp.chmod(filePath, mode);
    } catch {
      /* the guarded best-effort operation falls through: the outer flow owns the failure */
    }
  } finally {
    try {
      await fsp.unlink(tmp);
    } catch {
      /* the guarded best-effort operation falls through: the outer flow owns the failure */
    }
  }
}

/**
 * Sibling of {@link atomicWriteFileAtomic} on the sync fs API
 * (ported from cli(2).ts): tmp + chmod 600 + rename.
 * v2.1.16 single-owner fix: DELETED — a dead twin of the live
 * {@link atomicWriteFileSecure} above with zero callers anywhere in the repo
 * (audit 16-B); the export barrel entry was removed with it.
 */

/** Async JSON reader returning null for missing/invalid files, {} for empty. */
async function readJsonFileSafe(filePath: string): Promise<any | null> {
  try {
    const txt = await fsp.readFile(filePath, "utf8");
    if (!txt.trim()) return {};
    return JSON.parse(txt);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// 01C. OPENCODE.JSON LOCATION (ported from cli(2).ts)
// ---------------------------------------------------------------------------

/** Where opencode.json was found (or where it would be created). */
interface OpenCodeJsonLocation {
  path: string;
  exists: boolean;
  source: "cwd" | "global" | "env" | "custom";
}

/** Deterministic candidate list for opencode.json discovery (env wins first). */
function resolveOpenCodeJsonCandidates(): string[] {
  const candidates: string[] = [];
  // OPENCODE_CONFIG (opencode >= 1.18) points at the exact config FILE - the
  // strongest signal there is, so it goes first (plus its dir's canonical
  // name, in case the file itself is named differently).
  const envFile = process.env.OPENCODE_CONFIG?.trim();
  if (envFile) {
    const absFile = path.resolve(envFile);
    candidates.push(absFile, path.join(path.dirname(absFile), "opencode.json"));
  }
  const envDir = process.env.OPENCODE_CONFIG_DIR?.trim();
  if (envDir) {
    candidates.push(path.join(path.resolve(envDir), "opencode.json"));
  }
  candidates.push(path.join(process.cwd(), "opencode.json"));
  candidates.push(path.join(process.cwd(), ".opencode", "opencode.json"));
  candidates.push(path.join(os.homedir(), ".config", "opencode", "opencode.json"));
  candidates.push(path.join(os.homedir(), ".opencode", "opencode.json"));
  // dedup preserving order
  return Array.from(new Set(candidates));
}

/** Best-effort classification of where a located opencode.json came from. */
function classifyOpenCodeJsonSource(cand: string): OpenCodeJsonLocation["source"] {
  const envFile = process.env.OPENCODE_CONFIG?.trim();
  if (envFile && cand === path.resolve(envFile)) return "env";
  const envDir = process.env.OPENCODE_CONFIG_DIR?.trim();
  if (envDir && cand === path.join(path.resolve(envDir), "opencode.json")) return "env";
  if (cand.includes(process.cwd())) return "cwd";
  return "global";
}

/**
 * Locate opencode.json honoring --path overrides and --global preference
 * (ported from cli(2).ts).
 */
async function locateOpenCodeJson(customPath?: string, preferGlobal = false): Promise<OpenCodeJsonLocation> {
  if (customPath) {
    const abs = path.resolve(customPath);
    let exists = false;
    try {
      await fsp.access(abs, fs.constants.F_OK);
      exists = true;
    } catch {
      /* the guarded best-effort operation falls through: the outer flow owns the failure */
    }
    return { path: abs, exists, source: "custom" };
  }

  const candidates = resolveOpenCodeJsonCandidates();
  const ordered = preferGlobal ? [...candidates].reverse() : candidates;

  for (const cand of ordered) {
    try {
      await fsp.access(cand, fs.constants.F_OK);
      return { path: cand, exists: true, source: classifyOpenCodeJsonSource(cand) };
    } catch {
      /* the guarded best-effort operation falls through: the outer flow owns the failure */
    }
  }

  // nothing exists - pick the creation target based on the preference flag
  if (preferGlobal) {
    return { path: path.join(resolveBaseDir(), "opencode.json"), exists: false, source: "global" };
  }
  return { path: path.join(process.cwd(), "opencode.json"), exists: false, source: "cwd" };
}

/**
 * Path of the plugin config file antigravity.json (ported from cli(2).ts).
 * Honors an explicit custom path, otherwise delegates to config.getConfigPath.
 */
function resolveAntigravityJsonPath(custom?: string): string {
  if (custom) return path.resolve(custom);
  try {
    if (typeof getConfigPath === "function") {
      const p = getConfigPath();
      if (p) return p;
    }
  } catch {
    /* the guarded best-effort operation falls through: the outer flow owns the failure */
  }
  return path.join(resolveBaseDir(), "antigravity.json");
}

// ===========================================================================
// 02. ACCOUNT MANAGER FACTORY (singleton aware)
// (the twin deletion of the ownership move, step 5: the ~160-line
//  getAccountManager fallback twin — the in-memory manager that raced the
//  real one on the same antigravity-accounts.json file — was DELETED; every
//  call site answers getDefaultAccountManager({ disableBackgroundTimer:
//  true }) from ./accounts.js, the accounts owner's real manager.)
// ===========================================================================

// ===========================================================================
// 03. CONFIG HELPERS
// ===========================================================================
function loadAntigravityConfig(): any {
  try {
    if (typeof loadConfig === "function") return loadConfig();
  } catch {
    /* the guarded best-effort operation falls through: the outer flow owns the failure */
  }
  return readJsonSafe<any>(
    resolveConfigPath(),
    DEFAULT_CONFIG ?? {
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
    },
  );
}
function saveAntigravityConfigAtomic(cfg: any): any {
  try {
    if (typeof providerSaveConfig === "function") return providerSaveConfig(cfg);
  } catch {
    /* the guarded best-effort operation falls through: the outer flow owns the failure */
  }
  // manual atomic
  const validated = (() => {
    try {
      if (typeof parseAndValidateConfig === "function") return parseAndValidateConfig(cfg, { strict: false });
    } catch {
      /* the guarded best-effort operation falls through: the outer flow owns the failure */
    }
    return cfg;
  })();
  atomicWriteFileSecure(resolveConfigPath(), JSON.stringify(validated, null, 2) + "\n", 0o600);
  return validated;
}

// ===========================================================================
// 04. QUOTA HELPERS
// ===========================================================================
async function fetchQuotaForAccount(email: string | undefined, mgr: any, qManager: any): Promise<any> {
  const targetEmail = email ?? mgr.getActiveAccount()?.email ?? mgr.listAccounts()?.[0]?.email;
  if (!targetEmail) throw new Error("No account configured. Run `login` first.");
  const token = await mgr.getValidAccessToken(targetEmail);
  const projectId = mgr.findAccount?.(targetEmail)?.projectId ?? FALLBACK_PROJECT_ID;
  // Prefer quota.ts checkQuota if available
  if (checkQuotaFn && qManager) {
    // qManager already bound to token? use checkQuota directly
    try {
      if (typeof getQuotaGroupsFn === "function") {
        const groups = await getQuotaGroupsFn(token, projectId, { source: "antigravity" });
        return { email: targetEmail, groups, token, projectId };
      }
    } catch {
      /* the guarded best-effort operation falls through: the outer flow owns the failure */
    }
  }
  // fallback: direct call to retrieveUserQuotaSummary using bypass headers
  // v2.1.16 single-owner fix: identity headers from constants.js /
  // fingerprint.js; base URLs and the v1internal method path from
  // constants.js (CLOUDCODE_*_BASE + CODE_ASSIST_PATH_MAP) — byte-identical
  // URLs and header values as the former local literals.
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "User-Agent": GEMINI_CLI_USER_AGENT,
    "X-Goog-Api-Client": X_GOOG_API_CLIENT_GEMINI_CLI,
    "Client-Metadata": CLIENT_METADATA_STRING,
    "Content-Type": "application/json",
  };
  const endpoints = [
    `${CLOUDCODE_DAILY_BASE}${CODE_ASSIST_PATH_MAP.RETRIEVE_USER_QUOTA_SUMMARY}`,
    `${CLOUDCODE_BASE_URL}${CODE_ASSIST_PATH_MAP.RETRIEVE_USER_QUOTA_SUMMARY}`,
  ];
  let lastErr: any = null;
  for (const url of endpoints) {
    try {
      const controller = new AbortController();
      // v2.1.16 single-owner fix: raw 10s timeout literal replaced by the
      // constants.js FETCH_TIMEOUT_MS owner (same 10_000 value).
      const t = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({ project: projectId }),
        signal: controller.signal,
      });
      clearTimeout(t);
      if (!res.ok) {
        lastErr = new Error(`${url} -> ${res.status}`);
        continue;
      }
      const j: any = await res.json();
      return { email: targetEmail, raw: j, token, projectId, endpoint: url };
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr ?? new Error("Failed to fetch quota");
}

/**
 * Persist fetched quota numbers back into the accounts file
 * (ported from cli(4).ts: quota writes remaining/limit/lastUsed per account).
 * Pure best-effort: never throws, preserves every other field atomically.
 */
async function persistQuotaResultToAccountsFile(
  email: string,
  data: { remaining?: number | undefined; limit?: number | undefined },
): Promise<void> {
  try {
    const p = resolveAccountsPath();
    const store = readJsonSafe<any>(p, { version: 3, accounts: [] });
    const arr: any[] = store.accounts ?? [];
    const idx = arr.findIndex((a: any) => String(a.email).toLowerCase() === email.toLowerCase());
    if (idx < 0) return;
    const acc = arr[idx];
    if (!acc) return;
    if (typeof data.remaining === "number" && Number.isFinite(data.remaining)) acc.remaining = data.remaining;
    if (typeof data.limit === "number" && Number.isFinite(data.limit)) acc.limit = data.limit;
    acc.lastUsed = Date.now();
    store.updatedAt = Date.now();
    atomicWriteFileSecure(p, JSON.stringify(store, null, 2) + "\n", 0o600);
  } catch {
    /* the guarded best-effort operation falls through: the outer flow owns the failure */
  }
}

// ===========================================================================
// 05. COMMAND IMPLEMENTATIONS
// ===========================================================================

async function cmdLogin(args: string[], loginRl?: readline.Interface): Promise<void> {
  const noBrowser = args.includes("--no-browser") || args.includes("--noBrowser");
  const timeoutIdx = args.indexOf("--timeout");
  let timeoutMs = 300000;
  if (timeoutIdx >= 0 && args[timeoutIdx + 1]) {
    const v = Number(args[timeoutIdx + 1]);
    if (!Number.isNaN(v) && v > 0) timeoutMs = v;
  }
  // --email option only for hint, real email comes from OAuth userinfo
  const emailOptIdx = args.findIndex((a) => a === "--email" || a.startsWith("--email="));
  let hintEmail: string | undefined;
  if (emailOptIdx >= 0) {
    const a = args[emailOptIdx]!;
    if (a.includes("=")) hintEmail = a.split("=")[1];
    else hintEmail = args[emailOptIdx + 1];
  }

  // Login mode selection (ported from cli(5).ts):
  //   1 = add accounts (merge into store) | 2 = fresh start (wipe all first)
  let freshStart = args.includes("--fresh") || args.includes("--fresh-start") || args.includes("--wipe-all");
  if (!freshStart && (Boolean(loginRl) || process.stdin.isTTY === true)) {
    console.log("[login] mode selection: 1 = add accounts (merge) | 2 = fresh start (wipe all accounts)");
    const ans = loginRl ? await askQuestion(loginRl, "mode 1/2 [1]: ") : await promptLoginModeChoice();
    freshStart = ans.trim() === "2";
  }

  console.log(C.bold("\nAntigravity OAuth Login - Gemini CLI Bypass"));
  console.log(
    C.dim(
      `Client: ${GEMINI_OAUTH_CLIENT_ID.includes("681255809395") ? "gemini-cli default" : "custom override"} (id redacted in logs)`,
    ),
  );
  console.log(C.dim(`Project fallback: ${FALLBACK_PROJECT_ID}`));
  console.log(C.dim(`Headers: GeminiCLI/0.57.0 gl-node/22.19.0 ideType=IDE_UNSPECIFIED`));
  console.log("");

  if (!authenticate) {
    logErr("oauth.ts did not expose authenticate. Check the imports.");
    process.exit(1);
  }

  const mgr = getDefaultAccountManager({ disableBackgroundTimer: true });

  try {
    const result = await authenticate({
      noBrowser,
      callbackTimeoutMs: timeoutMs,
      onLog: (lvl: string, msg: string) => {
        if (lvl === "info") logDim(`[oauth] ${msg}`);
        else if (lvl === "warn") logWarn(`[oauth] ${msg}`);
        else logErr(`[oauth] ${msg}`);
      },
    });

    const { tokens, userInfo } = result as any;
    const email = (userInfo?.email ?? hintEmail ?? "").toLowerCase();
    if (!email) throw new Error("Could not determine the user email.");

    logOk(`Authenticated as ${C.bold(userInfo?.name ?? email)} <${email}>`);

    // Fresh-start wipe (cli(5) "mode 2"): remove every stored account first
    if (freshStart) {
      const previous: any[] = mgr.listAccounts?.() ?? [];
      for (const oldAcc of previous) {
        try {
          await mgr.removeAccount(oldAcc.email);
        } catch {
          /* the guarded best-effort operation falls through: the outer flow owns the failure */
        }
      }
      logWarn(`Fresh start: removed ${previous.length} previous account(s) before adding.`);
    }

    // Defensive: Google may not return a refresh_token if the prior consent is still
    // active on the user's Google account. Pre-empt with prompt=consent in oauth.ts
    // (auth.ts:265) and revokeGoogleToken() on logout, but still guard here.
    // Hint: if login keeps failing with a stale consent, review/revoke granted apps at
    // https://myaccount.google.com/permissions and retry.
    const refreshToken = tokens.refresh_token ?? tokens.refreshToken ?? result.tokens?.refresh_token;
    if (!refreshToken) {
      logErr(
        "Google did not return a refresh_token. Re-run login, or visit https://myaccount.google.com/permissions to remove the prior consent and try again.",
      );
      process.exitCode = 1;
      return;
    }

    // Add to store
    const account = mgr.addAccount({
      email,
      refreshToken,
      accessToken: tokens.access_token ?? tokens.accessToken,
      expiryDate: tokens.expires_at ?? Date.now() + (tokens.expires_in ?? 3600) * 1000,
      projectId: FALLBACK_PROJECT_ID,
      enabled: true,
      oauthClientKey: "gemini-cli",
      oauthClientConfig: {
        clientId: GEMINI_OAUTH_CLIENT_ID,
        clientSecret: GEMINI_OAUTH_CLIENT_SECRET,
      },
      scopes: [...GEMINI_CLI_SCOPES],
    });

    console.log("");
    logOk(`Account ${C.b(`${email}`)} added/saved successfully.`);
    console.log(C.dim(`  Store: ${resolveAccountsPath()} (chmod 600)`));
    console.log(
      C.dim(
        `  AccessToken: ${maskProviderToken(account.accessToken ?? tokens.access_token)} expires ${formatDate(account.expiryDate)}`,
      ),
    );
    console.log(C.dim(`  RefreshToken: ${maskProviderToken(account.refreshToken)}`));
    console.log("");

    // Audit trail on successful login (ported from cli(5).ts)
    auditLog(`login ${email}`);

    // Auto set active if first or none active
    try {
      const active = mgr.getActiveAccount?.();
      if (!active || active.email.toLowerCase() !== email) {
        mgr.setActive?.(email, { sticky: false });
        console.log(C.gray(`-> Set as active (use set-active to switch)`));
      }
    } catch {
      /* the guarded best-effort operation falls through: the outer flow owns the failure */
    }

    // Verify quota quickly
    try {
      logInfo("Checking initial quota...");
      const q = await fetchQuotaForAccount(email, mgr, null);
      if (q.raw?.quotaGroups || q.groups) logOk("Quota reachable via bypass headers.");
      else logWarn("Quota returned empty, but the account is valid.");
    } catch (e) {
      logWarn(`Could not verify quota right now: ${(e as Error).message}`);
    }
  } catch (e) {
    logErr(`Login failed: ${(e as Error).message}`);
    console.error(C.dim((e as Error).stack ?? ""));
    process.exit(1);
  }
}

/** Temp readline used when the login mode question runs outside the menu. */
async function promptLoginModeChoice(): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    return await askQuestion(rl, "mode 1/2 [1]: ");
  } finally {
    rl.close();
  }
}

async function cmdAccounts(args: string[]): Promise<void> {
  const sub = (args[0] ?? "list").toLowerCase();
  const mgr = getDefaultAccountManager({ disableBackgroundTimer: true });

  switch (sub) {
    case "list":
    case "ls": {
      const jsonFlag = args.includes("--json");
      /* the richest listing reads the legacy flat-file fields the v3 store
       * carries beside its typed face (addedAt, softQuotaUntil, remaining,
       * rateLimitResetTimes, ...): the deleted getAccountManager twin typed
       * them loosely, so the listing keeps that loose view of the same rows
       * (one cast at the binding — every read below stays verbatim). */
      const accounts = (mgr.listAccounts?.() ?? []) as any[];
      const activeEmail = (() => {
        try {
          return mgr.getActiveAccount?.()?.email ?? null;
        } catch {
          return null;
        }
      })();
      if (jsonFlag) {
        console.log(
          JSON.stringify(
            {
              activeEmail,
              accounts: accounts.map((a: any) => ({ ...a, refreshToken: maskProviderToken(a.refreshToken) })),
              count: accounts.length,
            },
            null,
            2,
          ),
        );
        return;
      }
      console.log(C.bold(`\nAntigravity Accounts (${accounts.length}) - ${resolveAccountsPath()}`));
      if (accounts.length === 0) {
        logWarn("No accounts configured. Run: cli.ts login");
        return;
      }
      console.log(
        C.dim(`Active: ${activeEmail ?? "none"} | Strategy: ${(mgr as any).store?.rotationStrategy ?? "round-robin"}`),
      );
      // Richest listing (ported from cli(4).ts): store version + family indexes
      const storeMeta = readJsonSafe<any>(resolveAccountsPath(), { version: 3 } as any);
      console.log(
        C.dim(
          `Store: version=${storeMeta.version ?? "?"} activeIndex=${storeMeta.activeIndex ?? "?"} activeIndexByFamily=${JSON.stringify(storeMeta.activeIndexByFamily ?? {})}`,
        ),
      );
      console.log("");
      const nowMs = Date.now();
      for (const acc of accounts) {
        const isActive = activeEmail && acc.email.toLowerCase() === activeEmail.toLowerCase();
        const enabled =
          acc.enabled !== false && acc.disabled !== true && !(acc.disabledUntil && acc.disabledUntil > nowMs);
        const statusIcon = enabled ? C.green("*") : C.red("o");
        const activeMark = isActive ? C.bold(C.bgGreen(" ACTIVE ")) + " " : "         ";
        const fail = acc.failureCount ? C.yellow(` fail=${acc.failureCount}`) : "";
        const disabledReason = acc.disabledReason ? C.dim(` (${acc.disabledReason})`) : "";
        // Soft-quota marker (ported from cli(5).ts)
        const softLeft =
          acc.softQuotaUntil && acc.softQuotaUntil > nowMs
            ? C.yellow(` soft-quota=${fmtDuration(acc.softQuotaUntil - nowMs)} left`)
            : "";
        const exhLeft =
          acc.quotaExhaustedUntil && acc.quotaExhaustedUntil > nowMs
            ? C.yellow(` quota-cooldown=${fmtDuration(acc.quotaExhaustedUntil - nowMs)} left`)
            : "";
        // remaining/limit + rate-limit windows (ported from cli(4).ts)
        const remain =
          acc.remaining !== undefined && acc.limit !== undefined
            ? C.dim(` remaining=${acc.remaining}/${acc.limit}`)
            : "";
        const rateLimits =
          acc.rateLimitResetTimes && Object.keys(acc.rateLimitResetTimes).length
            ? C.dim(` rateLimits=${JSON.stringify(acc.rateLimitResetTimes)}`)
            : "";
        console.log(
          `${statusIcon} ${activeMark}${C.bold(redactEmail(String(acc.email)))} ${enabled ? C.green("enabled") : C.red("disabled")} ${C.dim(`project=${acc.projectId ?? FALLBACK_PROJECT_ID}`)}${fail}${disabledReason}${softLeft}${exhLeft}${remain}${rateLimits}`,
        );
        console.log(
          `   ${C.dim(`addedAt=${formatDate(acc.addedAt)} created=${formatDate(acc.createdAt)} lastUsed=${formatDate(acc.lastUsedAt)} expiry=${formatDate(acc.expiryDate ?? acc.expiry)} token=${maskProviderToken(acc.accessToken ?? "")} refresh=${maskProviderToken(acc.refreshToken)}`)}`,
        );
      }
      console.log("");
      break;
    }
    case "add": {
      // manual add via flags --email --refresh-token
      const emailIdx = args.findIndex((a) => a === "--email" || a.startsWith("--email="));
      const refreshIdx = args.findIndex(
        (a) =>
          a === "--refresh-token" ||
          a.startsWith("--refresh-token=") ||
          a === "--refresh" ||
          a.startsWith("--refresh="),
      );
      let email = "";
      let refresh = "";
      if (emailIdx >= 0) {
        const v = args[emailIdx]!;
        email = v.includes("=") ? v.split("=").slice(1).join("=") : (args[emailIdx + 1] ?? "");
      }
      if (refreshIdx >= 0) {
        const v = args[refreshIdx]!;
        refresh = v.includes("=") ? v.split("=").slice(1).join("=") : (args[refreshIdx + 1] ?? "");
      }
      if (!email || !refresh) {
        console.log(C.bold("Usage: accounts add --email <email> --refresh-token <token> [--project <id>]"));
        process.exit(1);
      }
      const projIdx = args.findIndex((a) => a === "--project" || a.startsWith("--project="));
      let project: string = FALLBACK_PROJECT_ID;
      if (projIdx >= 0) {
        const v = args[projIdx]!;
        project = v.includes("=") ? v.split("=").slice(1).join("=") : (args[projIdx + 1] ?? FALLBACK_PROJECT_ID);
      }
      const acc = mgr.addAccount({
        email,
        refreshToken: refresh,
        projectId: project,
        enabled: true,
        oauthClientKey: "gemini-cli",
      });
      logOk(`Account ${email} added. Total: ${mgr.listAccounts().length}`);
      console.log(C.dim(`  ${JSON.stringify({ email: acc.email, projectId: acc.projectId, enabled: acc.enabled })}`));
      break;
    }
    case "remove":
    case "rm":
    case "delete":
    case "del": {
      const email = args[1];
      if (!email) {
        console.log("Usage: accounts remove <email>");
        process.exit(1);
      }
      const ok = mgr.removeAccount(email);
      if (ok) logOk(`Removed ${email}`);
      else logErr(`Not found ${email}`);
      break;
    }
    case "enable": {
      const email = args[1];
      if (!email) {
        console.log("Usage: accounts enable <email>");
        process.exit(1);
      }
      try {
        await enableAccountFlow(email);
      } catch (e) {
        logErr((e as Error).message);
      }
      break;
    }
    case "disable": {
      const email = args[1];
      if (!email) {
        console.log("Usage: accounts disable <email> [--reason <txt>]");
        process.exit(1);
      }
      const reasonIdx = args.indexOf("--reason");
      const reason = reasonIdx >= 0 ? args[reasonIdx + 1] : "manually disabled via CLI";
      try {
        await disableAccountFlow(email, reason ?? "manually disabled via CLI");
      } catch (e) {
        logErr((e as Error).message);
      }
      break;
    }
    case "set-active":
    case "active":
    case "use": {
      const email = args[1];
      if (!email) {
        console.log("Usage: accounts set-active <email> [--sticky]");
        process.exit(1);
      }
      const sticky = args.includes("--sticky");
      try {
        mgr.setActive(email, { sticky });
        logOk(`Active now: ${email} ${sticky ? "(sticky)" : "(round-robin)"}`);
      } catch (e) {
        logErr((e as Error).message);
        process.exit(1);
      }
      break;
    }
    case "import": {
      const importPathIdx = args.findIndex((a) => a === "--path" || a.startsWith("--path="));
      let customPath: string | undefined;
      if (importPathIdx >= 0) {
        const v = args[importPathIdx]!;
        customPath = v.includes("=") ? v.split("=").slice(1).join("=") : args[importPathIdx + 1];
      }
      try {
        if (typeof (mgr as any).importFromAntigravityManager === "function") {
          const res = await (mgr as any).importFromAntigravityManager(customPath ? [customPath] : undefined);
          console.log(
            C.bold(
              `\nImport result: imported=${(res as any).imported} updated=${(res as any).updated} skipped=${(res as any).skipped}`,
            ),
          );
          if ((res as any).errors?.length) console.log(C.yellow(`Errors: ${(res as any).errors.join("; ")}`));
          if ((res as any).sources?.length) console.log(C.dim(`Sources: ${(res as any).sources.join(", ")}`));
        } else if (typeof (mgr as any).importFromAntigravity === "function") {
          const res = await (mgr as any).importFromAntigravity();
          console.log(JSON.stringify(res, null, 2));
        } else {
          logWarn(
            "importFromAntigravityManager is not available in this AccountManager version. Trying manual import...",
          );
          // manual fallback: scan known paths
          const candidates = customPath
            ? [customPath]
            : [
                path.join(os.homedir(), ".config", "antigravity", "accounts.json"),
                path.join(os.homedir(), ".antigravity", "accounts.json"),
                path.join(os.homedir(), ".config", "opencode", "antigravity-manager.json"),
              ];
          let count = 0;
          for (const p of candidates) {
            if (!fs.existsSync(p)) continue;
            try {
              const data = JSON.parse(fs.readFileSync(p, "utf8"));
              const arr = Array.isArray(data) ? data : (data.accounts ?? []);
              for (const raw of arr) {
                const email = (raw.email ?? raw.user_email)?.toLowerCase();
                const rt = raw.refreshToken ?? raw.refresh_token;
                if (email && rt) {
                  mgr.addAccount({ email, refreshToken: rt, projectId: raw.projectId ?? FALLBACK_PROJECT_ID });
                  count++;
                }
              }
              logOk(`Imported ${arr.length} from ${p}`);
            } catch (e) {
              logWarn(`Failed ${p}: ${(e as Error).message}`);
            }
          }
          console.log(C.dim(`Manual import total: ${count}`));
        }
      } catch (e) {
        logErr(`Import failed: ${(e as Error).message}`);
      }
      break;
    }
    default:
      console.log(C.bold("\naccounts subcommands:"));
      console.log("  list [--json]                 List accounts");
      console.log("  add --email --refresh-token  Add manually");
      console.log("  remove <email>               Remove account");
      console.log("  enable <email>               Enable account");
      console.log("  disable <email>              Disable account");
      console.log("  set-active <email> [--sticky] Set active + strategy");
      console.log("  import [--path <file>]       Import from antigravity-manager");
      break;
  }
}

function formatQuotaBar(remaining: number, limit: number): string {
  const cfg = loadAntigravityConfig();
  const softPct = cfg.soft_quota_threshold_percent ?? 90;
  const used = limit - remaining;
  const pctUsed = limit > 0 ? (used / limit) * 100 : 0;
  const barLen = 20;
  const filled = Math.round((pctUsed / 100) * barLen);
  const bar = "#".repeat(filled) + ".".repeat(barLen - filled);
  let col = C.green;
  if (pctUsed >= softPct) col = C.yellow;
  if (pctUsed >= 98) col = C.red;
  return `${col(bar)} ${pctUsed.toFixed(1)}% used (${remaining}/${limit} remaining)`;
}

async function cmdQuota(args: string[]): Promise<void> {
  const jsonFlag = args.includes("--json");
  const allFlag = args.includes("--all");
  let emailArg: string | undefined;
  // positional email unless flag
  for (const a of args) {
    if (!a.startsWith("-") && a.includes("@")) {
      emailArg = a;
      break;
    }
  }
  const emailIdx = args.findIndex((a) => a === "--email" || a.startsWith("--email="));
  if (emailIdx >= 0) {
    const v = args[emailIdx]!;
    emailArg = v.includes("=") ? v.split("=").slice(1).join("=") : args[emailIdx + 1];
  }

  const mgr = getDefaultAccountManager({ disableBackgroundTimer: true });
  const stores = mgr.listAccounts?.() ?? [];
  if (stores.length === 0) {
    logWarn("No accounts. Run login first.");
    return;
  }

  const targets = allFlag ? stores.map((s: any) => s.email) : [emailArg ?? stores[0]?.email];
  const cfg = loadAntigravityConfig();
  const softThresh = (cfg.soft_quota_threshold_percent ?? 90) / 100;

  console.log(
    C.bold(
      `\nQuota Check - soft threshold ${cfg.soft_quota_threshold_percent}% | refresh ${cfg.quota_refresh_interval_minutes}min`,
    ),
  );
  console.log(C.dim(`Bypass: GeminiCLI/0.57.0 gl-node/22.19.0 Client-Metadata=IDE_UNSPECIFIED`));
  console.log("");

  let qManagerInst: any = null;
  try {
    if (QuotaManager)
      qManagerInst = new QuotaManager({ projectFallback: FALLBACK_PROJECT_ID, softThreshold: softThresh });
    else if (getDefaultQuotaManager) qManagerInst = getDefaultQuotaManager({ softThreshold: softThresh });
  } catch {
    /* the guarded best-effort operation falls through: the outer flow owns the failure */
  }

  for (const email of targets) {
    if (!email) continue;
    console.log(C.bold(`- ${email} -`));
    try {
      const token = await mgr.getValidAccessToken(email);
      const quotaResult = await fetchQuotaForAccount(email, mgr, qManagerInst);
      const raw = (quotaResult as any).raw ?? {};
      const groups = (quotaResult as any).groups ?? [];

      // Persist results back to the accounts file (ported from cli(4).ts):
      // sum numeric bucket values, otherwise fall back to auth.js retrieveQuota.
      let persistedRemaining: number | undefined;
      let persistedLimit: number | undefined;
      const bucketArr: any[] = Array.isArray(raw?.quotaBuckets)
        ? raw.quotaBuckets
        : Array.isArray(raw?.buckets)
          ? raw.buckets
          : [];
      if (bucketArr.length > 0) {
        let rSum = 0;
        let lSum = 0;
        let numeric = true;
        for (const b of bucketArr) {
          const r = Number(b?.remaining ?? b?.remainingQuota);
          const l = Number(b?.limit ?? b?.quotaLimit ?? b?.max);
          if (!Number.isFinite(r) || !Number.isFinite(l)) {
            numeric = false;
            break;
          }
          rSum += r;
          lSum += l;
        }
        if (numeric) {
          persistedRemaining = rSum;
          persistedLimit = lSum;
        }
      }
      if (
        (persistedRemaining === undefined || persistedLimit === undefined) &&
        typeof authRetrieveQuota === "function"
      ) {
        try {
          const qq = await authRetrieveQuota(token, (quotaResult as any).projectId ?? FALLBACK_PROJECT_ID);
          if (qq) {
            persistedRemaining = Number(qq.remaining);
            persistedLimit = Number(qq.limit);
          }
        } catch {
          /* the guarded best-effort operation falls through: the outer flow owns the failure */
        }
      }
      if (persistedRemaining !== undefined || persistedLimit !== undefined) {
        await persistQuotaResultToAccountsFile(email, { remaining: persistedRemaining, limit: persistedLimit });
      }

      if (jsonFlag) {
        console.log(
          JSON.stringify(
            {
              email,
              raw,
              groups,
              endpoint: (quotaResult as any).endpoint,
              projectId: (quotaResult as any).projectId,
              remaining: persistedRemaining,
              limit: persistedLimit,
            },
            null,
            2,
          ),
        );
        continue;
      }

      // Parse raw if coming from API
      if (raw && typeof raw === "object") {
        // raw may have structure with quotaBuckets or similar
        const buckets = raw.quotaBuckets ?? raw.buckets ?? raw.quota ?? [];
        if (Array.isArray(buckets) && buckets.length) {
          for (const b of buckets) {
            const name = b.displayName ?? b.group ?? b.name ?? b.id ?? "unknown";
            const remaining = b.remaining ?? b.remainingQuota ?? 0;
            const limit = b.limit ?? b.quotaLimit ?? b.max ?? remaining + (b.used ?? 0);
            const reset = b.resetTime ?? b.reset_at ?? b.resetAt;
            console.log(
              `  ${C.cyan(name)}: ${formatQuotaBar(remaining, limit)} ${reset ? C.dim(`reset=${formatDate(new Date(reset).getTime())}`) : ""}`,
            );
            if (b.models?.length)
              console.log(
                `    ${C.dim(`models: ${b.models.slice(0, 5).join(", ")}${b.models.length > 5 ? "..." : ""}`)}`,
              );
          }
        } else if (Object.keys(raw).length) {
          // pretty print all top-level keys
          console.log(C.dim(`  raw keys: ${Object.keys(raw).join(", ")}`));
          // try to interpret known fields
          for (const k of Object.keys(raw)) {
            const v = (raw as any)[k];
            if (v && typeof v === "object" && "remaining" in v) {
              console.log(`  ${C.cyan(k)}: ${formatQuotaBar((v as any).remaining ?? 0, (v as any).limit ?? 1000)}`);
            }
          }
          if (Array.isArray((raw as any).quotaGroups)) {
            for (const g of (raw as any).quotaGroups) {
              console.log(`  ${C.cyan(g.displayName ?? g.id)} remaining=${g.remaining ?? "?"} limit=${g.limit ?? "?"}`);
            }
          } else {
            console.log(`  ${C.dim(JSON.stringify(raw).slice(0, 800))}`);
          }
        }
      }

      if (groups.length) {
        for (const g of groups) {
          console.log(
            `  ${C.cyan(g.id ?? g.group)}: remaining=${(g as any).remaining ?? "?"} used=${(g as any).used ?? "?"} limit=${(g as any).limit ?? "?"}`,
          );
          if ((g as any).models) console.log(`    ${C.dim(`models: ${(g as any).models.join(", ")}`)}`);
        }
      }

      if (!raw || (Object.keys(raw).length === 0 && (!groups || groups.length === 0))) {
        logWarn("  Empty quota - endpoint may have returned 1.0 (expected for gemini-cli), trying daily endpoint...");
      }

      if (persistedRemaining !== undefined && persistedLimit !== undefined) {
        console.log(
          `  ${C.green("[saved]")} remaining=${persistedRemaining}/${persistedLimit} -> ${path.basename(resolveAccountsPath())}`,
        );
      }

      // Evaluate threshold warnings
      const thresholdPct = cfg.soft_quota_threshold_percent ?? 90;
      console.log(
        C.dim(
          `  soft_threshold=${thresholdPct}% | project=${(quotaResult as any).projectId ?? FALLBACK_PROJECT_ID} | endpoint=${(quotaResult as any).endpoint ?? "quota_manager"}`,
        ),
      );
    } catch (e) {
      logErr(`  ${email}: ${(e as Error).message}`);
      if (jsonFlag) console.log(JSON.stringify({ email, error: (e as Error).message }, null, 2));
    }
    console.log("");
  }
}

async function cmdConfig(args: string[]): Promise<void> {
  const sub = (args[0] ?? "list").toLowerCase();
  const cfg = loadAntigravityConfig();

  switch (sub) {
    case "list":
    case "ls":
    case "show": {
      const jsonFlag = args.includes("--json");
      if (jsonFlag) {
        console.log(JSON.stringify(cfg, null, 2));
        return;
      }
      console.log(C.bold(`\nAntigravity Config - ${resolveConfigPath()} (chmod 600)`));
      console.log("");
      for (const [k, v] of Object.entries(cfg)) {
        console.log(
          `  ${C.cyan(k)}: ${C.bold(String(v))} ${C.dim(`(default: ${String((DEFAULT_CONFIG as any)?.[k] ?? "-")})`)}`,
        );
      }
      console.log("");
      console.log(C.dim("Tunable keys:"));
      console.log(
        C.dim("  cli_first (bool), toast_scope (all|project|minimal|none), soft_quota_threshold_percent (0-100)"),
      );
      console.log(C.dim("  quota_fallback (true|false|auto|<model>), quota_refresh_interval_minutes (1-1440)"));
      console.log(
        C.dim(
          "  soft_quota_cache_ttl_minutes, pid_offset_enabled (bool), google_search_enabled (bool), debug (bool), version_cache_ttl",
        ),
      );
      break;
    }
    case "get": {
      const key = args[1];
      if (!key) {
        console.log("Usage: config get <key>");
        process.exit(1);
      }
      const val = (cfg as any)[key];
      if (val === undefined) {
        logWarn(`Key ${key} not found`);
        process.exit(1);
      }
      console.log(`${key}=${JSON.stringify(val)}`);
      break;
    }
    case "set": {
      const key = args[1];
      const rawVal = args[2];
      if (!key || rawVal === undefined) {
        console.log(
          "Usage: config set <key> <value>\nExample: config set soft_quota_threshold_percent 85\n         config set cli_first false",
        );
        process.exit(1);
      }
      // parse value smartly
      let parsed: any = rawVal;
      if (rawVal === "true") parsed = true;
      else if (rawVal === "false") parsed = false;
      else if (!Number.isNaN(Number(rawVal)) && rawVal.trim() !== "") {
        const n = Number(rawVal);
        if (Number.isFinite(n)) parsed = n;
      } else {
        // strip quotes
        parsed = rawVal.replace(/^['"]|['"]$/g, "");
      }

      // Special handling: model catalog validation for quota_fallback when a non-auto/non-bool string
      if (key === "quota_fallback" && typeof parsed === "string" && !["true", "false", "auto"].includes(parsed)) {
        // allow model ids
        const isModel = ALL_MODELS_2026.some((m: any) => m.id === parsed);
        if (!isModel) {
          logWarn(
            `Value ${parsed} is not a known model. Allowed: ${ALL_MODELS_2026.map((m: any) => m.id).join(", ")} or auto/true/false`,
          );
          // continue anyway
        }
      }

      const partial: any = { [key]: parsed };
      try {
        const updated = (() => {
          try {
            if (typeof updateConfig === "function") return updateConfig(partial);
          } catch {
            /* the guarded best-effort operation falls through: the outer flow owns the failure */
          }
          // manual merge atomic
          const current = loadAntigravityConfig();
          const mergedCfg = { ...current, ...partial };
          // validate
          let validated = mergedCfg;
          try {
            if (typeof parseAndValidateConfig === "function")
              validated = parseAndValidateConfig(mergedCfg, { strict: false });
          } catch {
            /* the guarded best-effort operation falls through: the outer flow owns the failure */
          }
          saveAntigravityConfigAtomic(validated);
          return validated;
        })();
        logOk(`Config ${C.bold(key)}=${C.bold(String(parsed))} saved.`);
        console.log(C.dim(JSON.stringify(updated, null, 2)));
      } catch (e) {
        logErr(`Failed to save config: ${(e as Error).message}`);
        process.exit(1);
      }
      break;
    }
    case "reset":
    case "defaults": {
      try {
        saveAntigravityConfigAtomic(DEFAULT_CONFIG ?? cfg);
        logOk("Config reset to defaults.");
        console.log(C.dim(JSON.stringify(DEFAULT_CONFIG, null, 2)));
      } catch (e) {
        logErr((e as Error).message);
      }
      break;
    }
    default:
      console.log(C.bold("config subcommands: list [--json], get <key>, set <key> <value>, reset"));
      console.log(C.dim("Examples:"));
      console.log(C.dim("  config set soft_quota_threshold_percent 85"));
      console.log(C.dim("  config set quota_refresh_interval_minutes 30"));
      console.log(C.dim("  config set toast_scope minimal"));
      break;
  }
}

async function cmdModels(args: string[]): Promise<void> {
  const sub = (args[0] ?? "list").toLowerCase();
  const jsonFlag = args.includes("--json");
  const apiFilter = (() => {
    const idx = args.indexOf("--api");
    if (idx >= 0) return args[idx + 1];
    const apiEq = args.find((a) => a.startsWith("--api="));
    if (apiEq) return apiEq.split("=")[1];
    return undefined;
  })();

  if (sub === "info" || sub === "show") {
    const id = args[1];
    if (!id) {
      console.log("Usage: models info <model-id>");
      process.exit(1);
    }
    const model = (ALL_MODELS_2026 as any[]).find((m: any) => m.id === id);
    if (!model) {
      logErr(`Model ${id} not found. Use models list`);
      process.exit(1);
    }
    if (jsonFlag) {
      console.log(JSON.stringify(model, null, 2));
      return;
    }
    console.log(C.bold(`\n${model.name} (${model.id})`));
    console.log(`  ${C.cyan("API")}: ${model.api} | ${C.cyan("Provider")}: ${model.provider ?? "google"}`);
    console.log(`  ${C.cyan("Context")}: ${model.context} | Output: ${model.output}`);
    console.log(`  ${C.cyan("Family")}: ${model.family} | QuotaGroup: ${model.quotaGroup}`);
    if (model.preview) console.log(`  ${C.yellow("preview=true")}`);
    if (model.thinking) console.log(`  ${C.magenta("thinking=true")}`);
    if (model.customTools) console.log(`  ${C.blue("customTools=true")}`);
    // routing info if available
    try {
      // v2.1.15 Phase A: MODEL_ROUTING lives in models.ts (model identification
      // is owned by models.ts alone).
      const routing = (modelsMod.MODEL_ROUTING as any)?.[id] ?? (modelsPkg.MODEL_ROUTING as any)?.[id];
      if (routing) {
        console.log(
          `  ${C.cyan("Routing")}: endpoint=${routing.endpoint} cloudModelId=${routing.cloudModelId} stream=${routing.stream}`,
        );
      }
    } catch {
      /* the guarded best-effort operation falls through: the outer flow owns the failure */
    }
    console.log("");
    return;
  }

  // list
  let list = ALL_MODELS_2026 as any[];
  if (apiFilter) list = list.filter((m) => m.api === apiFilter);
  if (jsonFlag) {
    console.log(JSON.stringify(list, null, 2));
    return;
  }

  console.log(C.bold(`\nCatalog ALL_MODELS_2026 (${list.length} models)`));
  console.log(C.dim(`Fallback project: ${FALLBACK_PROJECT_ID} | Client: GeminiCLI/0.57.0`));
  console.log("");
  console.log(C.dim(`  ${"ID".padEnd(38)} ${"API".padEnd(14)} ${"CTX".padEnd(8)} QUOTA-GROUP`));
  console.log(C.dim("  " + "-".repeat(80)));
  for (const m of list) {
    const idPad = String(m.id).padEnd(38);
    const apiPad = String(m.api ?? "").padEnd(14);
    const ctx = String(m.context).padEnd(8);
    const color = m.api === "antigravity" ? C.cyan : C.green;
    const preview = m.preview ? C.yellow(" preview") : "";
    const think = m.thinking ? C.magenta(" thinking") : "";
    console.log(`  ${color(idPad)} ${apiPad} ${ctx} ${m.quotaGroup}${preview}${think}`);
  }
  console.log("");
  console.log(C.dim("Use: models info <id> for details"));
  console.log(C.dim("Filter: --api antigravity | --api gemini-cli"));
}

async function cmdStatus(_args: string[]): Promise<void> {
  const mgr = getDefaultAccountManager({ disableBackgroundTimer: true });
  const cfg = loadAntigravityConfig();
  const accounts = mgr.listAccounts?.() ?? [];
  const active = (() => {
    try {
      return mgr.getActiveAccount?.();
    } catch {
      return null;
    }
  })();
  console.log(C.bold("\nAntigravity Status"));
  console.log(
    C.dim(`BaseDir: ${resolveBaseDir()} | AccountsFile: ${resolveAccountsPath()} | ConfigFile: ${resolveConfigPath()}`),
  );
  console.log("");
  console.log(
    `  ${C.cyan("Accounts")}: ${accounts.length} total, ${accounts.filter((a: any) => a.enabled !== false).length} enabled`,
  );
  if (active)
    console.log(`  ${C.cyan("Active")}: ${C.bold(active.email)} (project=${active.projectId ?? FALLBACK_PROJECT_ID})`);
  else console.log(`  ${C.cyan("Active")}: ${C.yellow("none")}`);
  console.log(
    `  ${C.cyan("Config")}: cli_first=${cfg.cli_first} toast_scope=${cfg.toast_scope} soft_quota=${cfg.soft_quota_threshold_percent}% refresh=${cfg.quota_refresh_interval_minutes}min fallback=${cfg.quota_fallback}`,
  );
  // file perms
  for (const p of [resolveAccountsPath(), resolveConfigPath()]) {
    try {
      if (!fs.existsSync(p)) {
        console.log(`  ${C.dim(p)}: ${C.yellow("does not exist")}`);
        continue;
      }
      const stat = fs.statSync(p);
      const mode = (stat.mode & 0o777).toString(8);
      const ok = mode === "600" || mode === "700";
      console.log(
        `  ${C.dim(p)}: mode=${ok ? C.green(mode) : C.red(mode)} size=${stat.size}b mtime=${formatDate(stat.mtimeMs)}`,
      );
    } catch (e) {
      console.log(`  ${C.dim(p)}: ${C.red((e as Error).message)}`);
    }
  }
  // version cache
  try {
    const vInfo = await getVersionInfo();
    console.log(`  ${C.cyan("Antigravity Version")}: ${vInfo.version} (source=${vInfo.source})`);
  } catch {
    console.log(`  ${C.cyan("Antigravity Version")}: ${C.yellow("failed to fetch - using fallback")}`);
  }
  console.log("");
  // quick quota summary for active
  if (active) {
    try {
      console.log(C.dim("Checking quick quota for the active account..."));
      const q = await fetchQuotaForAccount(active.email, mgr, null);
      const buckets = (q.raw?.quotaBuckets ?? q.raw?.buckets ?? []) as any[];
      if (buckets.length) {
        for (const b of buckets.slice(0, 5)) {
          const name = b.displayName ?? b.group ?? "quota";
          console.log(`  ${C.cyan(name)} remaining=${b.remaining ?? "?"} limit=${b.limit ?? "?"}`);
        }
      } else {
        console.log(C.dim("  Raw quota available, but without detailed buckets (daily endpoint vs base)"));
      }
    } catch (e) {
      logWarn(`  Quota check failed: ${(e as Error).message}`);
    }
  }
  console.log("");
}

async function cmdDoctor(_args: string[]): Promise<void> {
  console.log(C.bold("\nDoctor - Antigravity Diagnostics"));
  console.log("");
  const checks: Array<{ name: string; ok: boolean; msg: string }> = [];
  // dir
  try {
    const base = resolveBaseDir();
    ensureDirExists(base);
    const stat = fs.statSync(base);
    checks.push({ name: "baseDir exists", ok: true, msg: `${base} mode=${(stat.mode & 0o777).toString(8)}` });
  } catch (e) {
    checks.push({ name: "baseDir exists", ok: false, msg: (e as Error).message });
  }
  // accounts file
  try {
    const p = resolveAccountsPath();
    if (fs.existsSync(p)) {
      const st = fs.statSync(p);
      const mode = (st.mode & 0o777).toString(8);
      checks.push({
        name: "accounts file",
        ok: mode === "600",
        msg: `${p} mode=${mode} ${mode !== "600" ? "(must be 600)" : ""}`,
      });
      // try to chmod fix
      if (mode !== "600") {
        try {
          fs.chmodSync(p, 0o600);
          checks.push({ name: "chmod fix accounts", ok: true, msg: "fixed to 600" });
        } catch {
          /* the guarded best-effort operation falls through: the outer flow owns the failure */
        }
      }
      const data = readJsonSafe<any>(p, { accounts: [] });
      checks.push({ name: "accounts valid JSON", ok: true, msg: `${data.accounts?.length ?? 0} accounts` });
      // check tokens expiring
      const now = Date.now();
      const expiring = (data.accounts ?? []).filter((a: any) => a.expiryDate && a.expiryDate < now + 600000);
      checks.push({
        name: "token expiry",
        ok: expiring.length === 0,
        msg: expiring.length ? `${expiring.length} token(s) expiring <10min` : "all valid",
      });
    } else {
      checks.push({ name: "accounts file", ok: false, msg: `${p} does not exist - run login` });
    }
  } catch (e) {
    checks.push({ name: "accounts file", ok: false, msg: (e as Error).message });
  }
  // config file
  try {
    const p = resolveConfigPath();
    if (fs.existsSync(p)) {
      const st = fs.statSync(p);
      checks.push({ name: "config file", ok: true, msg: `${p} mode=${(st.mode & 0o777).toString(8)}` });
      const cfgRaw = readJsonSafe<any>(p, {});
      checks.push({
        name: "config valid",
        ok: Object.keys(cfgRaw).length > 0,
        msg: `${Object.keys(cfgRaw).length} keys`,
      });
    } else {
      checks.push({ name: "config file", ok: false, msg: `${p} does not exist - defaults will be created` });
      saveAntigravityConfigAtomic(DEFAULT_CONFIG ?? { cli_first: true });
      checks.push({ name: "config created", ok: true, msg: "defaults created" });
    }
  } catch (e) {
    checks.push({ name: "config file", ok: false, msg: (e as Error).message });
  }
  // bypass headers constants
  checks.push({
    name: "bypass constants",
    ok: GEMINI_OAUTH_CLIENT_ID.includes("681255809395"),
    msg: `client_id=${GEMINI_OAUTH_CLIENT_ID.includes("681255809395") ? "gemini-cli-default" : "custom"} UA=GeminiCLI/0.57.0 X-Goog=gl-node/22.19.0`,
  });
  // fetch project?
  checks.push({ name: "fallback project", ok: !!FALLBACK_PROJECT_ID, msg: FALLBACK_PROJECT_ID });

  // Logs dir reporting (ported from cli(5).ts diagnostics)
  try {
    const ld = resolveLogsDir();
    checks.push({
      name: "logs dir",
      ok: fs.existsSync(ld),
      msg: `${ld}${fs.existsSync(ld) ? "" : " (not created yet)"}`,
    });
  } catch (e) {
    checks.push({ name: "logs dir", ok: false, msg: (e as Error).message });
  }

  // Default model reporting (ported from cli(5).ts diagnostics)
  try {
    const def = FLAT_MODELS_2026.find((m: any) => m.id === DEFAULT_MODEL_ID);
    checks.push({
      name: "default model",
      ok: Boolean(def),
      msg: def ? `${def.id} (${def.name}) release=${def.release ?? "?"}` : DEFAULT_MODEL_ID,
    });
  } catch (e) {
    checks.push({ name: "default model", ok: false, msg: (e as Error).message });
  }

  // opencode.json location (via the ported locateOpenCodeJson resolver)
  try {
    const loc = await locateOpenCodeJson();
    checks.push({
      name: "opencode.json",
      ok: loc.exists,
      msg: `${loc.path}${loc.exists ? ` (found via ${loc.source})` : ` (missing, would create via ${loc.source})`}`,
    });
  } catch (e) {
    checks.push({ name: "opencode.json", ok: false, msg: (e as Error).message });
  }

  for (const ch of checks) {
    console.log(`  ${ch.ok ? C.green("[ok]") : C.red("[x]")} ${C.bold(ch.name)}: ${ch.msg}`);
  }
  console.log("");
  // Raw accounts file dump - first 1000 chars (ported from cli(4).ts diagnostics)
  try {
    const ap = resolveAccountsPath();
    if (fs.existsSync(ap)) {
      const rawAcc = fs.readFileSync(ap, "utf8");
      console.log(C.dim("Accounts file raw (first 1000 chars):"));
      console.log(C.dim(rawAcc.slice(0, 1000)));
      console.log("");
    }
  } catch {
    /* the guarded best-effort operation falls through: the outer flow owns the failure */
  }
  // suggestions
  console.log(C.dim("Suggestions:"));
  console.log(C.dim("  - If a token is expiring: AccountManager auto-refreshes on use, or run `login` again"));
  console.log(C.dim("  - If mode != 600: the CLI fixes permissions automatically on the next write"));
  console.log(C.dim("  - To force bypass headers: always use gl-node/22.19.0 and Client-Metadata IDE_UNSPECIFIED"));
  console.log("");
}

async function cmdVersion(_args: string[]): Promise<void> {
  const jsonFlag = _args.includes("--json");
  try {
    const info = await getVersionInfo();
    if (jsonFlag) {
      console.log(
        JSON.stringify(
          {
            plugin: PLUGIN_VERSION_FALLBACK,
            antigravity: info.version,
            full: info,
            client_id: GEMINI_OAUTH_CLIENT_ID.includes("681255809395") ? "gemini-cli-default" : "custom",
            project: FALLBACK_PROJECT_ID,
            models: ALL_MODELS_2026.length,
          },
          null,
          2,
        ),
      );
      return;
    }
    console.log(C.bold("\nVersions"));
    console.log(`  Plugin devthink: ${C.bold(PLUGIN_VERSION_FALLBACK)}`);
    console.log(
      `  Antigravity: ${C.bold(info.version)} full=${(info as any).fullVersion ?? "-"} source=${info.source}`,
    );
    console.log(
      `  ClientID: ${C.dim(GEMINI_OAUTH_CLIENT_ID.includes("681255809395") ? "gemini-cli-default (redacted)" : "custom (redacted)")} (Gemini CLI 0.57.0)`,
    );
    console.log(`  Project fallback: ${FALLBACK_PROJECT_ID}`);
    console.log(`  Models catalog: ${ALL_MODELS_2026.length} (antigravity-first)`);
    console.log(`  BaseDir: ${resolveBaseDir()}`);
  } catch (e) {
    console.log(C.bold(`\nFallback version: ${PLUGIN_VERSION_FALLBACK}`));
    console.log(C.dim(`Error fetching remote version: ${(e as Error).message}`));
  }
}

// ===========================================================================
// 05B. LOGOUT / ENABLE / DISABLE / MANAGE (ported from cli(2).ts + cli(5).ts)
// ===========================================================================

/**
 * Best-effort OAuth token revocation against Google's revoke endpoint.
 * A 400 response means the token was already invalid/revoked - counted as OK.
 */
async function revokeGoogleToken(token?: string | null): Promise<boolean> {
  if (!token) return false;
  try {
    // v2.1.16 single-owner fix: revoke endpoint from constants.js
    // (OAUTH_REVOKE_URL owner) instead of a local literal.
    const res = await fetch(OAUTH_REVOKE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ token }).toString(),
    });
    return res.ok || res.status === 400;
  } catch {
    return false;
  }
}

/**
 * Logout flow (ported from cli(2).ts, extended with token revocation):
 * revokes the Google refresh/access token and removes the account from the
 * store. Supports a single email, --all, and an interactive picker when no
 * email is given. Pass {@link sharedRl} when called from the interactive menu.
 */
async function logoutFlow(emailArg?: string, all = false, sharedRl?: readline.Interface): Promise<void> {
  printHeader();
  const rl = sharedRl ?? readline.createInterface({ input: process.stdin, output: process.stdout });
  const ownedRl = !sharedRl;
  try {
    const mgr: any = getDefaultAccountManager({ disableBackgroundTimer: true });
    const accounts: any[] = mgr.listAccounts?.() ?? [];

    if (accounts.length === 0) {
      logWarn("No accounts registered.");
      return;
    }

    if (all) {
      console.log(C.bold(`Logout --all: removing ${accounts.length} account(s)`));
      const okAll = await confirm(
        rl,
        C.red(`Confirm removal of ALL ${accounts.length} accounts (tokens will be revoked)?`),
        false,
      );
      if (!okAll) {
        console.log(C.dim("Cancelled."));
        return;
      }
      let removedCount = 0;
      for (const acc of accounts) {
        await revokeGoogleToken(acc.refreshToken ?? acc.refresh_token ?? acc.accessToken);
        try {
          await mgr.removeAccount(acc.email);
          removedCount++;
          console.log(C.dim(`  removed ${acc.email}`));
        } catch (e) {
          console.log(C.red(`  failed ${acc.email}: ${(e as Error).message}`));
        }
      }
      logOk(`All accounts removed (${removedCount}). Store: ${resolveAccountsPath()}`);
      auditLog(`logout --all removed=${removedCount}`);
      return;
    }

    let targetEmail = emailArg?.toLowerCase().trim();

    if (!targetEmail) {
      if (accounts.length === 1) {
        targetEmail = String(accounts[0]?.email ?? "").toLowerCase();
      } else {
        // interactive choose
        console.log(C.bold("Logout - choose an account to remove:\n"));
        accounts.forEach((acc, i) => {
          const mark = acc.disabled === true || acc.enabled === false ? C.red("[disabled]") : C.green("[active]");
          console.log(
            `  ${C.cyan(String(i + 1))}. ${redactEmail(String(acc.email))} ${mark} project=${acc.projectId ?? FALLBACK_PROJECT_ID}`,
          );
        });
        const ans = await askQuestion(rl, `\nEnter number (1-${accounts.length}) or email: `);
        const num = Number(ans);
        if (Number.isFinite(num) && num >= 1 && num <= accounts.length) {
          targetEmail = String(accounts[num - 1]?.email ?? "").toLowerCase();
        } else if (ans.includes("@")) {
          targetEmail = ans.toLowerCase();
        } else {
          logWarn("Invalid input, cancelled.");
          return;
        }
      }
    }

    if (!targetEmail) {
      logWarn("No email provided, cancelled.");
      return;
    }

    const chosen: string = targetEmail;
    const existing = mgr.findAccount?.(chosen) ?? accounts.find((a) => String(a.email).toLowerCase() === chosen);
    if (!existing) {
      logErr(`Account not found: ${chosen}`);
      console.log(C.dim(`Existing accounts: ${accounts.map((a) => a.email).join(", ")}`));
      process.exitCode = 1;
      return;
    }

    const okOne = await confirm(
      rl,
      `Remove account ${C.bold(existing.email)} (its refresh token will be revoked)?`,
      false,
    );
    if (!okOne) {
      console.log(C.dim("Cancelled."));
      return;
    }

    const revoked = await revokeGoogleToken(existing.refreshToken ?? existing.refresh_token ?? existing.accessToken);
    console.log(
      revoked
        ? C.dim("  token revoked via oauth2.googleapis.com/revoke")
        : C.dim("  token revocation skipped/failed (removing the account locally anyway)"),
    );

    const removed = await mgr.removeAccount(existing.email);
    if (removed) {
      logOk(`Account removed: ${existing.email}`);
    } else {
      logErr(`Failed to remove: ${existing.email}`);
      process.exitCode = 1;
    }
    auditLog(`logout ${existing.email} revoked=${revoked}`);
  } finally {
    if (ownedRl) rl.close();
  }
}

/** Top-level enable command (ported from cli(2).ts enableAccountFlow). */
async function enableAccountFlow(email: string): Promise<void> {
  printHeader();
  const mgr: any = getDefaultAccountManager({ disableBackgroundTimer: true });
  try {
    if (typeof mgr.enableAccount === "function") mgr.enableAccount(email);
    else if (typeof mgr.enable === "function") await mgr.enable(email);
    else throw new Error("account manager does not support enable");
    logOk(`Account enabled: ${email}`);
  } catch (e) {
    logErr(`Account not found or enable failed: ${email} (${(e as Error).message})`);
    process.exitCode = 1;
  }
}

/** Top-level disable command (ported from cli(2).ts disableAccountFlow). */
async function disableAccountFlow(email: string, reason = "manually disabled via CLI"): Promise<void> {
  printHeader();
  const mgr: any = getDefaultAccountManager({ disableBackgroundTimer: true });
  try {
    if (typeof mgr.disableAccount === "function") mgr.disableAccount(email, reason);
    else if (typeof mgr.disable === "function") await mgr.disable(email);
    else throw new Error("account manager does not support disable");
    logOk(`Account disabled: ${email} (skipped in rotation)`);
  } catch (e) {
    logErr(`Account not found or disable failed: ${email} (${(e as Error).message})`);
    process.exitCode = 1;
  }
}

/**
 * Interactive per-account enable/disable toggle
 * (ported from cli(5).ts manage command, backed by auth.js accountManager).
 * Pass {@link sharedRl} when invoked from the interactive menu.
 */
async function cmdManage(_args: string[], sharedRl?: readline.Interface): Promise<void> {
  const rl = sharedRl ?? readline.createInterface({ input: process.stdin, output: process.stdout });
  const ownedRl = !sharedRl;
  try {
    await cmdAccounts(["list"]);
    const email = await askQuestion(rl, "Email to toggle enable/disable: ");
    if (!email) {
      logWarn("Cancelled.");
      return;
    }
    const enStr = await askQuestion(rl, "Enable true/false [true]: ");
    const en = enStr.trim().toLowerCase() !== "false";

    let applied = false;
    // Preferred path: auth.js accountManager.enable(email, bool) on the v3 store
    if (typeof AuthAccountManager === "function") {
      try {
        const m = new AuthAccountManager();
        if (typeof m.load === "function") {
          try {
            await m.load();
          } catch {
            /* the guarded best-effort operation falls through: the outer flow owns the failure */
          }
        }
        if (typeof m.enable === "function") {
          await m.enable(email, en);
          applied = true;
        }
      } catch (e) {
        logWarn(`auth.js manager toggle failed: ${(e as Error).message}`);
      }
    }
    if (!applied) {
      const mgr: any = getDefaultAccountManager({ disableBackgroundTimer: true });
      if (en) mgr.enableAccount(email);
      else mgr.disableAccount(email, "disabled via manage command");
    }
    auditLog(`manage ${en ? "enable" : "disable"} ${email}`);
    console.log(`${en ? "enabled" : "disabled"} ${email}`);
  } finally {
    if (ownedRl) rl.close();
  }
}

// ===========================================================================
// 05C. MODELS 2026 CATALOG + OPENCODE.JSON CONFIGURE (ported from cli(2)/(4)/(5))
// (the model transforms of the ownership move: buildGoogleProviderModelConfigs
//  + buildOpenCodeModelDefinitions + detectTargetProvider moved to the models
//  owner — the imports at the top answer them)
// ===========================================================================

const CLI_VERSION = "6.0.0" as const;

/**
 * Configure models flow (merge of cli(2).ts configureModelsFlow with the
 * cli(4)/cli(5) provider.google.models writer):
 *  - locates opencode.json via locateOpenCodeJson (--global / --path aware);
 *  - backs up an existing file with invalid JSON before overwriting;
 *  - detects the TARGET provider by MODEL IDS ONLY (any user-chosen provider
 *    name carrying antigravity-* / gemini-* models, e.g. "casas-bahia"),
 *    falling back to "google" when none exists yet;
 *  - ADD-ONLY merge: user model entries are NEVER overwritten (custom name /
 *    limit / options / thinking variants are preserved verbatim), catalog
 *    models are appended only when the id is missing;
 *  - user provider options/npm/name are never touched (no forced baseUrl,
 *    no __comment pollution); minimal block fields are set only when
 *    creating a brand-new provider;
 *  - preserves the file's existing indentation and trailing newline, and
 *    skips the write entirely when nothing changed;
 *  - writes everything with atomicWriteFileAtomic (tmp + chmod 600 + rename).
 */
async function configureModelsFlow(
  opts: { global?: boolean | undefined; customPath?: string | undefined } = {},
): Promise<void> {
  printHeader();
  console.log(C.bold("Configure models - writing plugin model definitions into opencode.json\n"));

  const loc = await locateOpenCodeJson(opts.customPath, opts.global === true);
  console.log(C.dim(`Target candidate: ${loc.path} (exists=${loc.exists}, source=${loc.source})`));
  console.log(C.dim(`Global config dir: ${resolveBaseDir()}`));
  console.log("");

  let existing: any = {};
  let rawOriginal = "";
  if (loc.exists) {
    rawOriginal = await fsp.readFile(loc.path, "utf8").catch(() => "");
    const parsed = await readJsonFileSafe(loc.path);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      existing = parsed;
      logOk(`Existing opencode.json loaded (${Object.keys(parsed).length} top-level keys)`);
    } else {
      logWarn("Existing opencode.json contains invalid JSON - backing it up and starting fresh");
      try {
        const backupPath = `${loc.path}.backup-${Date.now()}.json`;
        await fsp.copyFile(loc.path, backupPath);
        console.log(C.dim(`  backup -> ${backupPath}`));
      } catch {
        /* the guarded best-effort operation falls through: the outer flow owns the failure */
      }
      existing = {};
      rawOriginal = "";
    }
  } else {
    console.log(C.dim("opencode.json does not exist yet - a new one will be created"));
  }

  const target = detectTargetProvider(existing);
  const defs = buildOpenCodeModelDefinitions();
  const googleModels = buildGoogleProviderModelConfigs();

  // Merge strategy - ADD-ONLY, user wins:
  //  - plugin: unique array merge; never duplicates devthink when a variant
  //    (@wenathlan/devthink, devthink@latest, ...) is already listed
  //  - provider.<target>.models: catalog ids appended ONLY when missing;
  //    existing user entries (custom limits/options/variants) untouched
  //  - provider npm/name/options: set only when creating a brand-new block
  //  - top-level models: additive merge keeping user overrides
  const merged: any = { ...existing };

  if (!merged.$schema) merged.$schema = "https://opencode.ai/config.json";

  const existingPlugins: any[] = Array.isArray(merged.plugin)
    ? merged.plugin
    : Array.isArray(merged.plugins)
      ? merged.plugins
      : [];
  const pluginsSet = new Set<string>(existingPlugins.map((p: any) => String(p)));
  // v2.1.21 — the plugin reference is name-agnostic: any variant already
  // listed counts ("@wenathlan/devthink", "devthink@npm:@wenathlan/devthink@latest"
  // — the scope-free npm alias —, "file:.../devthink", ...) and is never
  // duplicated. When nothing exists we add the canonical npm name.
  // (A package literally named "devthink" outside the @wenathlan scope cannot exist on npmjs.org — the
  // registry blocks the name with 403 "too similar to madge/panene/sane" —
  // so the bare spelling is the npm ALIAS, documented in the README.)
  const hasdevthinkvariant = [...pluginsSet].some((p) => /(^|[/@])devthink([@/]|$)/.test(p));
  if (!hasdevthinkvariant) {
    pluginsSet.add("@wenathlan/devthink");
  }
  merged.plugin = Array.from(pluginsSet);

  if (!merged.provider || typeof merged.provider !== "object") merged.provider = {};
  if (!merged.provider[target.id] || typeof merged.provider[target.id] !== "object") merged.provider[target.id] = {};
  const targetBlock = merged.provider[target.id];
  const existingModels = targetBlock.models && typeof targetBlock.models === "object" ? targetBlock.models : {};
  const addedModels: Record<string, any> = {};
  for (const [id, def] of Object.entries(googleModels)) {
    if (!existingModels[id]) addedModels[id] = def;
  }
  targetBlock.models = { ...existingModels, ...addedModels };
  if (!target.existed) {
    // brand-new provider: minimal fields only; options the user later adds
    // (or loader-injected credentials) always win - nothing is forced
    if (!targetBlock.name) targetBlock.name = target.id;
    if (!targetBlock.npm) targetBlock.npm = "@ai-sdk/openai-compatible";
    if (targetBlock.options === undefined) targetBlock.options = {};
  }

  if (!merged.models || typeof merged.models !== "object") merged.models = {};
  const topModels = merged.models;
  for (const k of Object.keys(defs.topLevelModels)) {
    const v = defs.topLevelModels[k];
    if (!topModels[k]) {
      topModels[k] = v;
    } else {
      topModels[k] = {
        ...(v as any),
        ...topModels[k],
        provider: topModels[k].provider ?? target.id,
        model: topModels[k].model ?? (v as any).model,
      };
    }
  }
  merged.models = topModels;

  // Preserve the user's formatting: detect indentation + trailing newline
  const detectIndent = (raw: string): { indent: string; trailingNewline: boolean } => {
    let indent = "  ";
    const m = raw.match(/\n([ \t]+)"/);
    if (m?.[1]) indent = m[1];
    return { indent, trailingNewline: raw === "" ? true : raw.endsWith("\n") };
  };
  const fmt = detectIndent(rawOriginal);
  const indentArg: number | "\t" = fmt.indent.includes("\t") ? "\t" : Math.min(Math.max(fmt.indent.length, 1), 8);
  const content = JSON.stringify(merged, null, indentArg) + (fmt.trailingNewline ? "\n" : "");

  if (rawOriginal !== "" && content === rawOriginal) {
    logOk(`opencode.json already up to date - nothing to add (target provider "${target.id}")`);
    console.log(
      C.dim(
        `  provider.${target.id}.models: ${Object.keys(targetBlock.models).length} definitions (all present, user entries preserved)`,
      ),
    );
    return;
  }

  try {
    await atomicWriteFileAtomic(loc.path, content, 0o600);
    logOk(`opencode.json written atomically (chmod 600) -> ${loc.path}`);
    console.log(
      C.dim(
        `  target provider: ${target.id} (${target.existed ? "detected by model ids, user block preserved" : "created (nothing existed yet)"})`,
      ),
    );
    console.log(C.dim(`  plugin: ${JSON.stringify(merged.plugin)}`));
    console.log(
      C.dim(
        `  provider.${target.id}.models: +${Object.keys(addedModels).length} added, ${Object.keys(existingModels).length} existing preserved (user customizations untouched)`,
      ),
    );
    console.log(C.dim(`  top-level models: ${Object.keys(topModels).length} entries (additive)`));
    console.log(C.dim(`  indentation preserved: ${JSON.stringify(fmt.indent)}`));
    console.log(`\n${C.bold("Verify:")} ${C.cyan(`cat ${loc.path}`)}`);
  } catch (e) {
    logErr(`Failed to write opencode.json: ${(e as Error).message}`);
    process.exitCode = 1;
  }
}

// ===========================================================================
// 06. INTERACTIVE MENU
// ===========================================================================
async function interactiveMenu(): Promise<void> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  let exit = false;
  const mgr = getDefaultAccountManager({ disableBackgroundTimer: true });

  const menu = `
${C.bold("============================================================")}
${C.bold("   Opencode Antigravity Auth - Interactive CLI (unified)    ")}
${C.bold("============================================================")}
${C.dim(`Dir: ${resolveBaseDir()} | Client: GeminiCLI/0.57.0 | gl-node/22.19.0 | project=${FALLBACK_PROJECT_ID}`)}

${C.cyan("1")}   Login OAuth (PKCE + browser) - add or fresh start
${C.cyan("2")}   List accounts (rich v3 format)
${C.cyan("3")}   Add account manually
${C.cyan("4")}   Set active account / rotation strategy
${C.cyan("5")}   Enable / Disable account
${C.cyan("6")}   Remove account
${C.cyan("7")}   Check quotas (active or all) - persists results
${C.cyan("8")}   Configure thresholds / catalog
${C.cyan("9")}   Models (catalog ALL_MODELS_2026)
${C.cyan("10")}  Status + Doctor/Diagnostics
${C.cyan("11")}  Version
${C.cyan("12")}  Logout (revoke token + remove account)
${C.cyan("13")}  Manage accounts (toggle enable/disable)
${C.cyan("14")}  Configure models -> opencode.json (--global/custom)
${C.cyan("0")}   Exit
`;

  while (!exit) {
    console.log(menu);
    const choice = (await rl.question(`${C.bold("Choose [0-14]: ")}`)).trim();
    switch (choice) {
      case "1": {
        const noB = (await askQuestion(rl, "No-browser? (y/N): ")).toLowerCase();
        await cmdLogin(noB ? ["--no-browser"] : [], rl);
        break;
      }
      case "2": {
        await cmdAccounts(["list"]);
        break;
      }
      case "3": {
        const email = await askQuestion(rl, "Email: ");
        const rt = await askQuestion(rl, "Refresh token: ");
        if (!email || !rt) {
          logWarn("Cancelled");
          break;
        }
        const proj = (await askQuestion(rl, `Project ID [${FALLBACK_PROJECT_ID}]: `)) || FALLBACK_PROJECT_ID;
        try {
          mgr.addAccount({ email, refreshToken: rt, projectId: proj, enabled: true });
          logOk(`Added ${email}`);
        } catch (e) {
          logErr((e as Error).message);
        }
        break;
      }
      case "4": {
        await cmdAccounts(["list"]);
        const email = await askQuestion(rl, "Email to activate: ");
        if (!email) break;
        const sticky = (await askQuestion(rl, "Sticky mode? (y/N): ")).toLowerCase();
        const stickyOn = /^(y|yes)$/.test(sticky);
        try {
          mgr.setActive(email, { sticky: stickyOn });
          logOk(`Active ${email} sticky=${stickyOn}`);
        } catch (e) {
          logErr((e as Error).message);
        }
        break;
      }
      case "5": {
        await cmdAccounts(["list"]);
        const email = await askQuestion(rl, "Email to toggle enable/disable: ");
        if (!email) break;
        const act = (await askQuestion(rl, "Enable (e) / Disable (d)? [e/d]: ")).toLowerCase();
        try {
          if (act === "d") {
            mgr.disableAccount(email, "manual interactive");
            logOk(`Disabled ${email}`);
          } else {
            mgr.enableAccount(email);
            logOk(`Enabled ${email}`);
          }
        } catch (e) {
          logErr((e as Error).message);
        }
        break;
      }
      case "6": {
        await cmdAccounts(["list"]);
        const email = await askQuestion(rl, "Email to remove: ");
        if (!email) break;
        const conf = await askQuestion(rl, `Confirm removal of ${email}? Type YES: `);
        if (conf !== "YES") {
          logWarn("Cancelled");
          break;
        }
        const ok = mgr.removeAccount(email);
        if (ok) logOk(`Removed ${email}`);
        else logErr("Not found");
        break;
      }
      case "7": {
        const all = (await askQuestion(rl, "All accounts? (y/N): ")).toLowerCase();
        const json = (await askQuestion(rl, "JSON output? (y/N): ")).toLowerCase();
        const args: string[] = [];
        if (/^(y|yes)$/.test(all)) args.push("--all");
        if (/^(y|yes)$/.test(json)) args.push("--json");
        await cmdQuota(args);
        break;
      }
      case "8": {
        await cmdConfig(["list"]);
        const k = await askQuestion(rl, "Key to change (or enter to go back): ");
        if (!k) break;
        const v = await askQuestion(rl, `New value for ${k}: `);
        if (!v) break;
        await cmdConfig(["set", k, v]);
        break;
      }
      case "9": {
        const api = await askQuestion(rl, "Filter API (antigravity/gemini-cli/enter for all): ");
        if (api) await cmdModels(["list", "--api", api]);
        else await cmdModels(["list"]);
        const mid = await askQuestion(rl, "Show model info (id) or enter to go back: ");
        if (mid) await cmdModels(["info", mid]);
        break;
      }
      case "10": {
        await cmdStatus([]);
        await cmdDoctor([]);
        break;
      }
      case "11": {
        await cmdVersion([]);
        break;
      }
      case "12": {
        const allAns = (await askQuestion(rl, "Logout ALL accounts? (y/N): ")).toLowerCase();
        await logoutFlow(undefined, /^(y|yes)$/.test(allAns), rl);
        break;
      }
      case "13": {
        await cmdManage([], rl);
        break;
      }
      case "14": {
        const gAns = (
          await askQuestion(rl, "Use global ~/.config/opencode/opencode.json instead of cwd/opencode.json? (y/N): ")
        ).toLowerCase();
        await configureModelsFlow({ global: /^(y|yes)$/.test(gAns) });
        break;
      }
      case "0":
      case "q":
      case "quit":
      case "exit": {
        exit = true;
        break;
      }
      default:
        logWarn("Invalid option");
        break;
    }
    if (!exit) {
      await askQuestion(rl, C.dim("\n[press enter to continue]"));
    }
  }
  rl.close();
  console.log(C.green("\nGoodbye!"));
}

// ===========================================================================
// 07. HELP & MAIN ROUTER
// ===========================================================================
function printHelp(): void {
  console.log(
    C.bold(`
devthink provider CLI (unified merge) - production-ready
Writes to ~/.config/opencode/ (600) atomically | honors OPENCODE_CONFIG_DIR
Bypass: client_id 681255809395-oo8f…b135j / UA GeminiCLI/0.57.0 / gl-node/22.19.0 / Client-Metadata IDE_UNSPECIFIED / project rising-fact-p41fc

Usage:
  cli.ts <command> [subcommand] [flags]

Commands:
  login [--no-browser] [--timeout <ms>] [--email <email>] [--fresh]
      OAuth PKCE Antigravity via oauth.ts (local browser callback on 127.0.0.1).
      Interactive mode selection: 1 = add accounts, 2 = fresh start (wipe all).
      Writes a debugLogger audit line on success.

  logout [<email>] [--all]
      Revoke the Google refresh token (oauth2.googleapis.com/revoke) and remove
      the account. Without an email: single-account auto pick or interactive
      chooser. --all removes every account after confirmation.

  accounts list [--json]
  accounts add --email <email> --refresh-token <token> [--project <id>]
  accounts remove <email>
  accounts enable <email>
  accounts disable <email> [--reason <text>]
  accounts set-active <email> [--sticky]
  accounts import [--path <file>]
      Rich listing: store version, activeIndexByFamily, addedAt/created/expiry,
      remaining/limit, rateLimits, soft-quota cooldowns.

  enable <email>
  disable <email>
      Top-level single-account toggles.

  manage
      Interactive per-account enable/disable toggle (robin-hood v3 store).

  quota [email] [--all] [--json] [--email <email>]
      Checks quotas via quota.ts (daily-cloudcode-pa + prod) with config
      thresholds; persists remaining/limit back into the accounts file.

  config list [--json]
  config get <key>
  config set <key> <value>
  config reset
      Tunables: soft_quota_threshold_percent (0-100), quota_refresh_interval_minutes
      (1-1440), toast_scope, cli_first, quota_fallback, etc. Model catalog
      ALL_MODELS_2026 from constants.ts.

  models list [--api antigravity|gemini-cli] [--json]
  models info <model-id>

  configure [--global] [--path <file>]
      Writes model definitions into opencode.json: provider.google.models
      (2026-08-25 catalog with thinkingLevel variants incl claude-sonnet
      low/high and claude-opus budgets), provider.antigravity.models (rich
      bypass metadata) and top-level model shortcuts. Atomic chmod 600 write.

  status
      Accounts summary + config + permissions + quick quota

  doctor | diagnostics
      File/permission/token-expiry diagnostics, logs dir, default model,
      opencode.json location, raw accounts file head (first 1000 chars)

  version [--json]
      Plugin + remote antigravity manifest versions

  menu | interactive
  help | --help | -h

Env:
  OPENCODE_CONFIG_DIR     Override ~/.config/opencode
  ANTIGRAVITY_DEBUG       Debug logging (1/true/debug)
  ANTIGRAVITY_CLI_AUTORUN Set to 0 to disable auto-run when executed directly
  NO_COLOR                Disable ANSI colors

No args => interactive menu (readline/promises), zero deps.

Examples:
  npx tsx cli.ts login --no-browser
  npx tsx cli.ts logout --all
  npx tsx cli.ts accounts list
  npx tsx cli.ts enable user@example.com
  npx tsx cli.ts quota --all
  npx tsx cli.ts config set soft_quota_threshold_percent 85
  npx tsx cli.ts configure --global
  npx tsx cli.ts models list --api antigravity
  npx tsx cli.ts status
`),
  );
}

/**
 * Family entry of the grand merge: the single devthink binary routes the
 * extension command family here (`devthink ext <command>`); the argv is
 * spliced into the process position the original entry reading expects,
 * the family main runs untouched and the caller argv is restored.
 *
 * @param argv the family arguments (without the family prefix).
 */
export async function runproviderfamily(argv: string[]): Promise<void> {
  const saved = process.argv.slice();
  process.argv = [saved[0], saved[1], ...argv];
  try {
    await providerconsolemain();
  } finally {
    process.argv = saved;
  }
}

async function providerconsolemain(): Promise<void> {
  const argv = process.argv.slice(2);
  const cmd = (argv[0] ?? "").toLowerCase();

  /** Read the value of a "--name value" / "--name=value" style flag. */
  const getFlagValue = (name: string): string | undefined => {
    const idx = argv.findIndex((a) => a === `--${name}` || a.startsWith(`--${name}=`));
    if (idx === -1) return undefined;
    const a = argv[idx];
    if (a && a.includes("=")) return a.split("=").slice(1).join("=").trim();
    return argv[idx + 1]?.trim();
  };

  // If no command, interactive
  if (!cmd || cmd === "menu" || cmd === "interactive" || cmd === "i") {
    if (argv.includes("--help") || argv.includes("-h")) {
      printHelp();
      return;
    }
    // check if TTY; if not TTY and no args, show help
    if (!process.stdout.isTTY && !argv.length) {
      printHelp();
      return;
    }
    if (!argv.length) {
      await interactiveMenu();
      return;
    }
  }

  switch (cmd) {
    case "help":
    case "--help":
    case "-h":
      printHelp();
      break;
    case "login":
    case "auth":
    case "signin":
      await cmdLogin(argv.slice(1));
      break;
    case "logout":
    case "signout": {
      const restArgs = argv.slice(1);
      const emailArg = restArgs.find((a) => !a.startsWith("-") && a.includes("@"));
      const allFlag = restArgs.some((a) => a === "--all" || a === "-a");
      await logoutFlow(emailArg, allFlag);
      break;
    }
    case "accounts":
    case "account":
    case "acc":
      await cmdAccounts(argv.slice(1));
      break;
    case "enable": {
      const email = argv.slice(1).find((a) => !a.startsWith("-") && a.includes("@")) ?? getFlagValue("email");
      if (!email) {
        logErr("enable requires an email: enable <email> [--email <email>]");
        process.exitCode = 2;
        break;
      }
      await enableAccountFlow(email);
      break;
    }
    case "disable": {
      const email = argv.slice(1).find((a) => !a.startsWith("-") && a.includes("@")) ?? getFlagValue("email");
      if (!email) {
        logErr("disable requires an email: disable <email> [--email <email>]");
        process.exitCode = 2;
        break;
      }
      await disableAccountFlow(email);
      break;
    }
    case "manage":
    case "accounts-manage":
      await cmdManage(argv.slice(1));
      break;
    case "quota":
    case "quotas":
    case "q":
      await cmdQuota(argv.slice(1));
      break;
    case "config":
    case "cfg":
    case "settings":
      await cmdConfig(argv.slice(1));
      break;
    case "configure":
    case "configure-models":
    case "config-models":
    case "setup": {
      const globalFlag = argv.includes("--global") || argv.includes("-g");
      const customPath = getFlagValue("path") ?? getFlagValue("file") ?? argv.slice(1).find((a) => a.endsWith(".json"));
      await configureModelsFlow({ global: globalFlag, customPath });
      break;
    }
    case "models":
    case "model":
    case "m":
      await cmdModels(argv.slice(1));
      break;
    case "status":
    case "st":
      await cmdStatus(argv.slice(1));
      break;
    case "doctor":
    case "doc":
    case "check":
    case "diagnostics":
      await cmdDoctor(argv.slice(1));
      break;
    case "version":
    case "ver":
    case "v":
      await cmdVersion(argv.slice(1));
      break;
    default:
      logErr(`Unknown command: ${cmd}`);
      printHelp();
      process.exit(1);
  }
}

export type { ModelCatalogEntry, OpenCodeJsonLocation };
// ---------------------------------------------------------------------------
// Public API (~30 exports incl runCLI + default { runCLI, interactiveMenu })
// ---------------------------------------------------------------------------
export {
  ANSI,
  atomicWriteFileAtomic,
  atomicWriteFileSecure,
  buildOpenCodeModelDefinitions,
  C,
  CLI_VERSION,
  cmdAccounts,
  cmdConfig,
  cmdDoctor,
  cmdLogin,
  cmdManage,
  cmdModels,
  cmdQuota,
  cmdStatus,
  cmdVersion,
  configureModelsFlow,
  confirm,
  disableAccountFlow,
  enableAccountFlow,
  fetchQuotaForAccount,
  fmtDuration,
  getDefaultAccountManager as getAccountManager,
  interactiveMenu,
  locateOpenCodeJson,
  logoutFlow,
  printHeader,
  printHelp,
  providerconsolemain as runCLI,
  redactEmail,
  resolveAccountsPath,
  resolveAntigravityJsonPath,
  resolveBaseDir,
  resolveConfigPath,
  resolveOpenCodeJsonCandidates,
};

export const providercli = {
  runCLI: providerconsolemain,
  interactiveMenu,
};

/* ── Merged: the grand merge section ── the correlated provider family library barrel logics of the merged repository interned here, one surface without duplicate variations ── */
/**
 * @file providercli.ts — the barrel section of the provider family.
 * @description The library barrel of the merged provider family —
 * library-first, root-first. The provider family modules of the merged
 * repository live as the flat root modules (constants, config, models,
 * accounts, fingerprint, project, quota, recovery, search, core, request,
 * streaming, oauth, antigravity, devthink, server) and every import path
 * of the provider surface resolves through this barrel.
 *
 * The namespace re-exports keep the historical surface: several siblings
 * (constants/config/oauth/accounts/fingerprint/search) intentionally share
 * exported names such as PROJECT_FALLBACK, MODELS_2026 or OAUTH_SCOPES —
 * every feature stays reachable through its module namespace below. The
 * consolidation history rides the mapping: the provider oauth family lives
 * in oauth.ts, request-helpers merged into request.ts, system merged into
 * config.ts (with the debug utilities in debug.ts) — the OAuth,
 * RequestHelpers and System namespaces below alias the consolidated modules
 * so every historical import path keeps resolving.
 */

export * as Accounts from "./accounts.js";
export * as Constants from "@wenathlan/devthink/constants";
export * as Core from "@wenathlan/devthink/core";
export * as Fingerprint from "./fingerprint.js";
// the provider oauth family answers the OAuth namespace (the grand merge
// consolidation interned the family in oauth.ts — node surface).
export * as OAuth from "./oauth.js";
// the provider oauth family answers the AntigravityCli compat namespace.
export * as AntigravityCli from "./oauth.js";
// merged group additions: auth/core/system/models namespaces
export * as Auth from "./oauth.js";

/** System — the v2.1.14 system utilities surface: config.ts absorbed the
 * system module (cfgDir, the version fallback chain, atomic writes, the
 * legacy validator aliases and the raw JSON IO helpers) while the debug
 * utilities (logsDir, redactSecrets, the debugLogger singleton) live in
 * debug.ts, so the namespace carries exactly the exports the system
 * shim used to publish. */



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
export * as PluginModule from "./antigravity.js";
// default plugin export for opencode compatibility (the antigravity plugin family)
export { default as opencodePluginModule, getPlugin, plugin } from "./antigravity.js";
export * as Config from "@wenathlan/devthink/config";
export * as Debug from "@wenathlan/devthink/core";
export * as Models from "./models.js";
export * as Models2026 from "./models.js";
export * as Project from "./project.js";
export * as Quota from "./quota.js";
export * as Recovery from "./recovery.js";
// v2.1.14: request-helpers.ts was consolidated into request.ts; namespace kept for compat.
export * as RequestHelpers from "./request.js";
export * as Request from "./request.js";
export * as Search from "./search.js";
// the CLI namespace left the providers barrel (the browser purity law):
// cli.js value-imports node:process (stdin, stdout) and ./server.js, so the
// namespace re-export dragged the whole hono server stack into every
// browser consumer of this barrel — the dev boot died on the externalized
// node:process stub and the serve-static module. The CLI keeps its own
// published face (@wenathlan/getry/cli) and the os server re-exports it
// directly from the owner; nothing in the tree consumed providers.CLI.
export * as Streaming from "./streaming.js";
export * as Version from "./versionregistry.js";

// v2.1.16 single-owner doctrine: VERSION derives from constants.js
// PLUGIN_VERSION (raw value owner) and the two bypass aggregates assemble
// every value from its owner module instead of locally-reassembled literals.


/* the identity snapshot import rides the account console cli section above — one declaration per binding */

// version / identity
export const VERSION: string = PLUGIN_VERSION;
export const PLUGIN_ID = "devthink" as const;

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
 * The client the plugin presents for NEW logins since 2.1.8: the client pair,
 * scopes, official redirect URI and version parts come from oauth.js
 * (the authentication owner — CLIENT_ID/CLIENT_SECRET are env-overridable
 * there, so the aggregate tracks the same override); the UA and
 * X-Goog-Api-Client keep their static linux/amd64 snapshot shape, composed
 * from the oauth.js version constants.
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

/* ── Merged: the grand merge section ── the correlated opencode server plugin entry logics of the merged repository interned here, one surface without duplicate variations ── */
/**
 * @file providercli.ts — the opencode `./server` package entry (v2.1.20).
 *
 * opencode >= 1.18 resolves package.json exports["./server"] FIRST when
 * loading a server plugin. This entry uses the multi-export plugin shape so
 * that a SINGLE plugin reference registers THREE auth entries in
 * `opencode auth login` (and in the TUI "Connect a provider" dialog):
 *
 *   - provider "google"      → the standard Google entry, OAuth method
 *   - provider "antigravity" → the standard Antigravity entry, OAuth method
 *   - the CUSTOM provider detected by MODEL IDS in opencode.json
 *     ("casasbahia", "my-google", ... — whatever the user named it)
 *
 * opencode's loader treats every exported FUNCTION as a plugin instance and
 * merges the returned hooks, which is exactly what we need: one instance
 * returns the main hooks (identification headers, config injection, the
 * custom-provider auth) and two more instances return the standard google /
 * antigravity auth hooks.
 *
 * IMPORTANT CONTRACT: every export in this file MUST be a function —
 * opencode's legacy loader throws "Plugin export is not a function" for any
 * other export shape. Never re-export constants, objects or types from here;
 * library consumers keep importing from the package root (plugin.ts).
 *
 * (the ownership move of the gateway ownership wave, step 5: the three
 * entries merged into the antigravity owner — providerServer/googleAuth/
 * antigravityAuth live in antigravity.ts beside opencodeServer and
 * buildOpencodeAuthHook — and re-exported here for compat.)
 */

export { providerServer, googleAuth, antigravityAuth } from "./antigravity.js";
