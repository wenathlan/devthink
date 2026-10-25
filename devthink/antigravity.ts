/* ── Merged: the grand merge section ── the correlated antigravity provider plugin logics of the merged repository interned here, one surface without duplicate variations ── */
/**
 * @file antigravity.ts — the antigravity provider plugin of the merged repository.
 * @description
 *  Third-person observer: the observer analyses how Gemini CLI, OmniRoute, 9router and
 *  pi-antigravity-auth bypass the Project ID and reproduces exactly the same behaviour
 *  in a library-first, root-first shape.
 *
 *  Responsabilidades (the merged plugin contract):
 *  - Total Project ID bypass acting exactly like the Gemini CLI: when
 *    account.projectId is absent the observer calls resolveProjectId which runs
 *    loadCodeAssist without a project (metadata only), onboardUser when needed
 *    (FREE tier), LRO polling, never demanding a project from the user. The
 *    in-memory cache carries a truncated SHA256 hash so a heap snapshot never
 *    leaks the token.
 *  - Endpoint wrapping {model, project, request} the Gemini CLI way
 *    (CodeAssistServer.createCodeAssistContentGenerator), straight to
 *    cloudcode-pa.googleapis.com, no localhost v1 proxy, no generativelanguage.
 *  - The complete model list through 25/08/2026: gemini-3.6, 3.5, 3.1, 3,
 *    2.5, claude 4.5/4.6 thinking, gpt-oss-120b, preview variants plus the
 *    antigravity-* aliases.
 *  - Dual quota (Antigravity + Gemini CLI), cli_first, pid_offset_enabled
 *    0-1000, google_search grounding.
 *  - Hooks: the fetch interceptor cascade 403/404/5xx with 0-80ms jitter,
 *    strip x-goog-user-project (fix #1830), skip sandbox for
 *    gemini-3.6/3.5/preview (fix #233), the third-person observer, node:*
 *    builtins + global fetch only.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync, chmodSync } from "node:fs";
import * as fsp from "node:fs/promises";
import { join, resolve, dirname } from "node:path";
import { homedir, platform as osPlatform, arch as osArch, release as osRelease } from "node:os";
import { randomInt, createHash, randomBytes } from "node:crypto";
// merged siblings (base names only)
import {
  getGlobalSignatureCache,
  getGlobalPreservationStore,
  isValidThinkingSignature,
  stripInvalidSignatures,
} from "./recovery.js";
import * as oauthMod from "./oauth.js";
import * as accountsMod from "./accounts.js";
import {
  resolveOAuthIdentity,
  identityFromAccountType,
  getAntigravityCliHeaders,
  ANTIGRAVITY_CLI_OAUTH_SCOPES,
} from "./oauth.js";
import { getVersion } from "./versionregistry.js";
// v2.1.14 dedupe: stateless constants imported from their single owners
// (constants.ts / models.ts) instead of local copies. Runtime functions and
// stateful caches stay local to this Layer-1 entry by design.
// v2.1.15 Phase A: every model-identification family (catalog lists, routing
// classifiers, thinking tables, endpoint orders, image-gen helpers) is
// imported from models.ts — THE single owner — and project discovery comes
// from project.ts — THE single project owner; the former local copies were
// deleted and re-exported under their historical names.
import {
  ANTIGRAVITY_VERSION_FALLBACK,
  CLIENT_METADATA_STRING,
  CLOUDCODE_BASE_URL,
  CONTENT_TIMEOUT_MS,
  FALLBACK_PROJECT_ID,
  GEMINI_CLI_USER_AGENT_PLAIN,
  PLUGIN_VERSION,
} from "./constants.js";
// v2.1.16 cleanup: FORBIDDEN_HEADERS / FETCH_TIMEOUT_MS / GEMINI_CLI_SCOPES
// were imported but never used in the file body — they stay reachable through
// the re-export block below, so the dead import bindings are gone.
export type PluginOptions = {
  cli_first?: boolean;
  pid_offset_enabled?: boolean;
  /** true/false forces grounding on/off; "auto" enables it for Gemini (non-Claude) models only. */
  google_search_enabled?: boolean | "auto";
  quota_refresh_interval_minutes?: number;
  rotation_strategy?: "round-robin" | "sticky";
  debug?: boolean;
  /** Prefix tool descriptions with hardening hints for Claude models. */
  claude_tool_hardening?: boolean;
  /** Keep thinking blocks/signatures in transformed output instead of dropping them. */
  keep_thinking?: boolean;
  /** Skip accounts whose used-percentage is at or above this threshold (0-100). */
  soft_quota_threshold_percent?: number;
  /** How long a soft-quota mark lasts, in minutes; "auto" resolves to 15. */
  soft_quota_cache_ttl_minutes?: number | "auto";
  /** Suppress toast() notifications. */
  quiet_mode?: boolean;
};

// v2.1.15 Phase C: the Account interface moved to accounts.js (account store
// owner) — imported type-only (erased at runtime).

// v2.1.15 Phase B: generic utilities (fnv hash family, jitter) come from
// core.js — THE owner; identity masquerade (dynamic UA, antigravity headers)
// comes from fingerprint.js — THE owner.
import { fnv1a32, fnv1a32Hex, getJitter } from "./core.js";
import { buildAntagravityHeaders, getDynamicUserAgent } from "./fingerprint.js";
import { X_GOOG_API_CLIENT_GEMINI_CLI } from "./fingerprint.js";
import {
  ALL_MODELS_2026,
  ANTIGRAVITY_VERSION_MIN,
  CODE_ASSIST_ENDPOINTS,
  CONTEXT_WINDOW_CLAUDE,
  CONTEXT_WINDOW_GEMINI,
  CONTEXT_WINDOW_GPT_OSS,
  ENDPOINT_ORDER_GEMINI_CLI,
  MODELS_2026_PROVIDER,
  OUTPUT_LIMIT_CLAUDE,
  OUTPUT_LIMIT_GEMINI,
  OUTPUT_LIMIT_GPT_OSS,
  THINKING_BUDGET_MAP,
  THINKING_LEVELS,
  buildImageGenConfig,
  getEndpointsForModel,
  isGeminiCLIOnlyModel,
  isImageGenModel,
  mapModelToGroup,
} from "./models.js";
import type { ThinkingLevel } from "./models.js";
import { resolveProjectId } from "./project.js";
// v2.1.15 Phase D: the live request pipeline (transformRequest, the Cloud Code
// builders, fetchWithCascade and the method paths) lives ONLY in request.ts;
// the fetch-cascade recovery helpers live ONLY in recovery.ts.
import {
  buildAntigravityRequest,
  buildGeminiCLIRequest,
  fetchWithCascade,
  transformRequest,
  STREAM_METHOD,
  GENERATE_METHOD,
  LOAD_METHOD,
  ONBOARD_METHOD,
} from "./request.js";
import type { BuildOptions, BuildResult } from "./request.js";
import { detectFetchErrorType, fetchSessionRecovery, preserveValidatedSignature } from "./recovery.js";
import { shouldSkipSandbox } from "./models.js";
import { QUOTA_METHOD } from "./quota.js";

import type { Account } from "./accounts.js";
export type { Account };
import type { ResolveProjectIdOptions, ResolveResult } from "./project.js";

// v2.1.14 dedupe: re-export the consolidated constants so this module's
// public surface is unchanged.
export {
  ANTIGRAVITY_VERSION_FALLBACK,
  CONTENT_TIMEOUT_MS,
  FALLBACK_PROJECT_ID,
  FORBIDDEN_HEADERS,
  FETCH_TIMEOUT_MS,
  GEMINI_CLI_SCOPES,
  PLUGIN_VERSION,
} from "./constants.js";
export { fnv1a32, fnv1a32Hex, getJitter } from "./core.js";
export { buildAntagravityHeaders, getDynamicUserAgent } from "./fingerprint.js";
export {
  ALL_MODELS_2026,
  ANTIGRAVITY_VERSION_MIN,
  CODE_ASSIST_ENDPOINTS,
  ENDPOINT_ORDER,
  ENDPOINT_ORDER_GEMINI_CLI,
  GEMINI_CLI_ONLY_MODELS,
  MODELS_2026_BASE,
  MODELS_2026_ANTIGRAVITY_ALIAS,
  THINKING_BUDGET_MAP,
  THINKING_LEVELS,
  buildImageGenConfig,
  getEndpointsForModel,
  isGeminiCLIOnlyModel,
  isImageGenModel,
  mapModelToGroup,
} from "./models.js";
export { MODELS_2026_PROVIDER as MODELS_2026 } from "./models.js";
export type { ModelId2026, ThinkingLevel } from "./models.js";
export { resolveProjectId } from "./project.js";
export type { ResolveProjectIdOptions, ResolveResult } from "./project.js";

// Node types (no DOM lib) do not expose the RequestInfo name globally; derive it from fetch itself.
type RequestInfo = Parameters<typeof fetch>[0];

/**
 * Linear-time trailing-slash strip (regex-free; safe on uncontrolled input —
 * the former /\/+$/.replace was polynomial and flagged as ReDoS-prone).
 */
function stripTrailingSlashes(value: string): string {
  let end = value.length;
  while (end > 0 && value.charCodeAt(end - 1) === 47 /* "/" */) end--;
  return end === value.length ? value : value.slice(0, end);
}

// --- optional internal modules (they themselves only use node:* + fetch) ---
// The observer tries to reuse them when present, but v2 is self-contained to guarantee bypass logic.
let __AccountManagerCtor: any = null;
try {
  // dynamic import via top-level await not allowed here, will lazy import in init
} catch {
  /* the guarded best-effort operation falls through: the outer flow owns the failure */
}

// ---------------------------------------------------------------------------
// Constants — frozen, deterministic
// ---------------------------------------------------------------------------

export const PLUGIN_ID = "devthink" as const;
// PLUGIN_VERSION is imported from constants.ts (single owner) and re-exported above.

/** Public alias kept for consumers that expect `VERSION` instead of `PLUGIN_VERSION`. */
export const VERSION: string = PLUGIN_VERSION;

/**
 * Gemini CLI identification fallback headers used when the auth module does
 * not expose getGeminiHeaders(). v2.1.16 single-owner fix: hoisted from the
 * two byte-identical inline copies (opencode auth loader + chat.headers
 * spoof) — every value comes from its owner: the plain UA (no model segment)
 * and the Client-Metadata string from constants.js, the gl-node snapshot
 * from fingerprint.js. The "gccl/0.9.2" composite segment is not exported
 * by any owner module, so the composite X-Goog-Api-Client is assembled
 * exactly once here (plugin.ts's single local definition, shared by both
 * sites — fixes the internal duplication found by audit 16-B).
 */
const FALLBACK_GEMINI_HEADERS: Record<string, string> = {
  "User-Agent": GEMINI_CLI_USER_AGENT_PLAIN,
  "X-Goog-Api-Client": `${X_GOOG_API_CLIENT_GEMINI_CLI} gccl/0.9.2 ${X_GOOG_API_CLIENT_GEMINI_CLI}`,
  "Client-Metadata": CLIENT_METADATA_STRING,
};

// ---------------------------------------------------------------------------
// Gemini CLI bypass credentials — exact identification used by the official CLI
// (merged from legacy plugin.ts / plugin(1).ts; v2.1.14: values deduped to the
// single owner constants.ts GEMINI_CLI_OAUTH_CLIENT_ID/SECRET)
// ---------------------------------------------------------------------------

// v2.1.15 Phase C: GEMINI_CLI_OAUTH_CLIENT_ID/SECRET were aliases of the
// constants.js GEMINI_CLI_OAUTH_CLIENT_ID/SECRET pair — the aliases are
// replaced by direct imports (single owner, single name).

/** Short aliases for the Gemini CLI bypass credentials. */
// v2.1.15 Phase C: the CLIENT_ID/CLIENT_SECRET aliases (gemini-cli pair)
// were deleted — auth.js CLIENT_ID/CLIENT_SECRET is the antigravity-cli
// client pair; the gemini-cli pair is GEMINI_CLI_OAUTH_CLIENT_ID/SECRET.

// v2.1.15 Phase A: ALL_MODELS_2026 (flat routing catalog), the ALL_MODELS
// alias, isImageGenModel and buildImageGenConfig moved to models.ts —
// imported and re-exported at the top of this file.

// v2.1.15 Phase D: the Cloud Code method paths (STREAM_METHOD, GENERATE_METHOD,
// LOAD_METHOD, ONBOARD_METHOD) moved to request.ts; QUOTA_METHOD moved to
// quota.ts — imported from the owners at the top of this file.

// ---------------------------------------------------------------------------
// Helpers — FNV, jitter, UA, headers, cache
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Legacy header builders (merged from plugin.ts / plugin(1).ts) — kept for
// consumers that import them directly; bypass flows above remain canonical.
// ---------------------------------------------------------------------------

/** Gemini CLI identification headers — THE bypass secret for CLI-pool models. */

/** Legacy Antigravity desktop identification headers variant. */

// ---------------------------------------------------------------------------
// Notifications + error classification + retry-once recovery + thinking
// signature preservation (merged from plugin(3)/plugin(4)/plugin(5) flows,
// backed by the recovery module caches).
// ---------------------------------------------------------------------------

/** Module-level quiet flag toggled from PluginOptions.quiet_mode. */
let __quietMode = false;

/**
 * User-facing notification glue (v2.1.15 Phase D: renamed from the former
 * toast() — recovery.js owns the toast name with its sink-based notifier).
 * No-op when quiet_mode is enabled.
 */
export function notifyUser(message: string): void {
  if (__quietMode) return;
  try {
    console.log(`[m[devthink] ${message}`);
  } catch {
    /* the guarded best-effort operation falls through: the outer flow owns the failure */
  }
}

// ---------------------------------------------------------------------------
// Account persistence — minimal inline implementation + reuse AccountManager if present
// ---------------------------------------------------------------------------

function resolveConfigDir(): string {
  const env = process.env.OPENCODE_CONFIG_DIR?.trim() ?? "";
  if (env) return resolve(env);
  return join(homedir(), ".config", "opencode");
}
function resolveAccountsPath(custom?: string): string {
  if (custom) return resolve(custom);
  return join(resolveConfigDir(), "antigravity-accounts.json");
}

async function loadAccountsInline(filePath?: string): Promise<Account[]> {
  const fp = resolveAccountsPath(filePath);
  try {
    const content = await fsp.readFile(fp, "utf8");
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) return parsed as Account[];
    if (Array.isArray(parsed.accounts)) return parsed.accounts as Account[];
    if (parsed.accounts && typeof parsed.accounts === "object") return Object.values(parsed.accounts) as Account[];
    return [];
  } catch {
    return [];
  }
}

async function saveAccountsInline(accounts: Account[], filePath?: string): Promise<void> {
  const fp = resolveAccountsPath(filePath);
  const dir = dirname(fp);
  try {
    await fsp.mkdir(dir, { recursive: true, mode: 0o755 });
  } catch {
    /* the guarded best-effort operation falls through: the outer flow owns the failure */
  }
  const wrapper = { version: 3, accounts, updatedAt: Date.now() };
  const tmp = `${fp}.tmp.${randomInt(100000, 999999)}`;
  try {
    await fsp.writeFile(tmp, JSON.stringify(wrapper, null, 2), { mode: 0o600 });
    await fsp.rename(tmp, fp);
    try {
      await fsp.chmod(fp, 0o600);
    } catch {
      /* the guarded best-effort operation falls through: the outer flow owns the failure */
    }
  } catch {
    /* the guarded best-effort operation falls through: the outer flow owns the failure */
  }
}

// Minimal AccountManager fallback that reuses inline loader + round-robin
class InlineAccountManager {
  private accounts: Account[] = [];
  private rotationIndex = 0;
  private loaded = false;
  private filePath: string;

  constructor(filePath?: string) {
    this.filePath = resolveAccountsPath(filePath);
  }

  async load(): Promise<void> {
    if (this.loaded) return;
    this.accounts = await loadAccountsInline(this.filePath);
    this.loaded = true;
  }
  async save(): Promise<void> {
    await saveAccountsInline(this.accounts, this.filePath);
  }

  list(): Account[] {
    return [...this.accounts];
  }

  async getNextAccount(strategy: "round-robin" | "sticky" = "round-robin"): Promise<Account | null> {
    await this.load();
    const healthy = this.accounts.filter(
      (a) => !a.disabled && (!a.quotaExhaustedUntil || Date.now() >= a.quotaExhaustedUntil),
    );
    if (healthy.length === 0) return this.accounts[0] ?? null;
    if (strategy === "sticky" && healthy.length > 0) return healthy[0]!;
    const idx = this.rotationIndex % healthy.length;
    const acc = healthy[idx]!;
    this.rotationIndex = (this.rotationIndex + 1) % healthy.length;
    return acc;
  }

  async addAccount(a: Account): Promise<void> {
    await this.load();
    const existingIdx = this.accounts.findIndex((x) => x.email.toLowerCase() === a.email.toLowerCase());
    if (existingIdx >= 0) this.accounts[existingIdx] = { ...this.accounts[existingIdx], ...a, updatedAt: Date.now() };
    else this.accounts.push({ ...a, createdAt: Date.now(), updatedAt: Date.now() });
    await this.save();
  }

  async markQuotaExhausted(email: string, durationMs = 20 * 60 * 1000): Promise<void> {
    const acc = this.accounts.find((a) => a.email.toLowerCase() === email.toLowerCase());
    if (acc) {
      acc.quotaExhaustedUntil = Date.now() + durationMs;
      await this.save();
    }
  }

  async refreshAccount(email: string): Promise<{ accessToken?: string } | null> {
    // try oauth module if present
    try {
      const acc = this.accounts.find((a) => a.email.toLowerCase() === email.toLowerCase());
      if (!acc?.refreshToken) return null;
      if (typeof oauthMod.refreshAccessToken === "function") {
        // refresh with the OAuth client the account authenticated with
        const identity = resolveOAuthIdentity(identityFromAccountType((acc as any).type));
        const tokens = await oauthMod.refreshAccessToken(acc.refreshToken, {
          clientId: identity.clientId,
          clientSecret: identity.clientSecret,
        });
        if (tokens?.access_token) {
          acc.accessToken = tokens.access_token;
          acc.expiry = Date.now() + (tokens.expires_in ?? 3600) * 1000;
          await this.save();
          return { accessToken: tokens.access_token };
        }
      }
    } catch {
      /* the guarded best-effort operation falls through: the outer flow owns the failure */
    }
    return null;
  }
}

// ---------------------------------------------------------------------------
// Quota — minimal dual pool + shouldSkipAccount
// ---------------------------------------------------------------------------

/**
 * Quota-pool classifier for the inline quota manager.
 * v2.1.16 single-owner audit: GENUINELY DIVERGENT from models.js
 * mapModelToGroup (the ROUTING classifier) and therefore kept local —
 * mapModelToGroup routes non-3.x gemini ids (e.g. gemini-2.5-*) to the
 * "antigravity" endpoint family, while this quota view bills EVERY gemini
 * model against the "gemini-cli" Cloud Code Assist quota pool. Merging the
 * two would change which pool a gemini-2.5 quota exhaustion marks, so the
 * divergence is documented instead of merged.
 */
function mapModelToQuotaGroup(model: string): string {
  const lower = (model ?? "").toLowerCase();
  if (lower.includes("claude") || lower.includes("gpt-oss")) return "antigravity";
  if (lower.includes("gemini")) return "gemini-cli";
  return "antigravity";
}

class InlineQuotaManager {
  private exhausted: Map<string, { until: number; group?: string }> = new Map();

  shouldSkipAccount(email: string, model: string): boolean {
    const key = `${email.toLowerCase()}:${mapModelToQuotaGroup(model)}`;
    const entry = this.exhausted.get(key) ?? this.exhausted.get(email.toLowerCase());
    if (!entry) return false;
    if (Date.now() >= entry.until) {
      this.exhausted.delete(key);
      this.exhausted.delete(email.toLowerCase());
      return false;
    }
    return true;
  }

  markExhausted(email: string, model: string, durationMs = 20 * 60 * 1000, group?: string): void {
    const g = group ?? mapModelToQuotaGroup(model);
    this.exhausted.set(`${email.toLowerCase()}:${g}`, { until: Date.now() + durationMs, group: g });
  }

  isQuotaError(status: number, bodyText?: string): boolean {
    if (status === 429) return true;
    if (!bodyText) return false;
    const lower = bodyText.toLowerCase();
    return (
      lower.includes("quota") ||
      lower.includes("exhausted") ||
      lower.includes("limit") ||
      lower.includes("resource_exhausted")
    );
  }
}

// ---------------------------------------------------------------------------
// Streaming helpers — SSE tolerant parser + OpenAI/Anthropic transformers minimal
// ---------------------------------------------------------------------------

const SSE_DONE = "[DONE]";

function createSSEParser() {
  let buffer = "";
  return {
    parseChunk(chunk: string): { data: string; event?: string | undefined }[] {
      buffer += chunk;
      const events: { data: string; event?: string | undefined }[] = [];
      let idx;
      while ((idx = buffer.indexOf("\n\n")) >= 0) {
        const block = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);
        const lines = block.split("\n");
        let data = "";
        let event = "";
        for (const line of lines) {
          if (line.startsWith("data:")) data += (data ? "\n" : "") + line.slice(5).trimStart();
          else if (line.startsWith("event:")) event = line.slice(6).trim();
          else if (line.trim() === "") continue;
          else data += (data ? "\n" : "") + line;
        }
        if (data) events.push({ data, event: event || undefined });
      }
      return events;
    },
    flush(): { data: string; event?: string | undefined }[] {
      if (!buffer.trim()) return [];
      const b = buffer;
      buffer = "";
      const lines = b.split("\n");
      let data = "";
      let event = "";
      for (const line of lines) {
        if (line.startsWith("data:")) data += (data ? "\n" : "") + line.slice(5).trimStart();
        else if (line.startsWith("event:")) event = line.slice(6).trim();
        else if (line.trim()) data += (data ? "\n" : "") + line;
      }
      return data ? [{ data, event: event || undefined }] : [];
    },
  };
}

function normalizeGeminiPayload(raw: string): any[] {
  const out: any[] = [];
  const trimmed = raw.trim();
  if (!trimmed || trimmed === SSE_DONE) return out;
  let parsed: any;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    // sometimes wrapped as "{"response":...}"? try tolerant
    return out;
  }
  // cloudcode-pa returns {response: {candidates:[{content:{parts:[...]}}]}} or direct
  const unwrap = (obj: any): any[] => {
    if (!obj) return [];
    if (obj.response) return unwrap(obj.response);
    if (Array.isArray(obj.candidates)) return obj.candidates;
    if (obj.candidates) return unwrap(obj.candidates);
    if (obj.content) return [obj];
    return [obj];
  };
  const candidates = unwrap(parsed);
  for (const cand of candidates) {
    const content = cand.content ?? cand;
    const parts = content.parts ?? content.content?.parts ?? [];
    if (!Array.isArray(parts)) continue;
    for (const part of parts) out.push(part);
  }
  // also handle case where parsed is already part
  if (candidates.length === 0 && (parsed.text || parsed.functionCall || parsed.thought)) out.push(parsed);
  return out;
}

function transformToOpenAIChunk(parts: any[], model: string, isFirst: boolean, isLast: boolean): any {
  // minimal OpenAI delta
  let text = "";
  const toolCalls: any[] = [];
  let thought = "";
  for (const p of parts) {
    if (p.text) text += p.text;
    if (p.functionCall)
      toolCalls.push({
        id: `call_${fnv1a32Hex(JSON.stringify(p.functionCall)).slice(0, 8)}`,
        type: "function",
        function: { name: p.functionCall.name, arguments: JSON.stringify(p.functionCall.args ?? {}) },
      });
    if (p.thought) thought += p.thought;
  }
  const delta: any = { role: isFirst ? "assistant" : undefined, content: text || undefined };
  if (toolCalls.length > 0) delta.tool_calls = toolCalls;
  const chunk: any = {
    id: `chatcmpl-${fnv1a32Hex(model + Date.now()).slice(0, 12)}`,
    object: "chat.completion.chunk",
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [{ index: 0, delta, finish_reason: isLast ? "stop" : null }],
  };
  return chunk;
}

// ---------------------------------------------------------------------------
// Main plugin class — bypass Project ID exactly as Gemini CLI
// ---------------------------------------------------------------------------

/**
 * Extracts the model id from a Gemini-style URL
 * (.../models/{model}:method?...) using a linear scan — no regex on
 * uncontrolled input. Returns undefined when the URL carries no model.
 */
function extractModelFromUrl(urlStr: string): string | undefined {
  const marker = "/models/";
  const i = urlStr.indexOf(marker);
  if (i < 0) return undefined;
  const rest = urlStr.slice(i + marker.length);
  const colon = rest.indexOf(":");
  const query = rest.indexOf("?");
  let end = colon >= 0 ? colon : query >= 0 ? query : rest.length;
  if (end < 0) end = rest.length;
  const m = rest.slice(0, end);
  if (!m) return undefined;
  try {
    return decodeURIComponent(m);
  } catch {
    return m;
  }
}

export class AntigravityPlugin {
  private accountManager: any;
  private quotaManager: InlineQuotaManager;
  private options: PluginOptions;
  private version: string = ANTIGRAVITY_VERSION_FALLBACK;
  private initialized = false;

  constructor(options: PluginOptions = {}) {
    this.options = { claude_tool_hardening: true, keep_thinking: false, soft_quota_threshold_percent: 90, ...options };
    __quietMode = !!this.options.quiet_mode;
    this.quotaManager = new InlineQuotaManager();
    // try load external AccountManager for advanced persistence, fallback inline
    try {
      // will be lazy initialized in init()
      this.accountManager = new InlineAccountManager();
    } catch {
      this.accountManager = new InlineAccountManager();
    }
  }

  async init(): Promise<void> {
    if (this.initialized) return;
    try {
      this.version = await getVersion().catch(() => ANTIGRAVITY_VERSION_FALLBACK);
    } catch {
      this.version = ANTIGRAVITY_VERSION_FALLBACK;
    }

    // attempt to use real AccountManager if exists (has richer refresh)
    try {
      const ExtMgr = (accountsMod as any).AccountManager;
      if (ExtMgr) {
        const mgr = new ExtMgr();
        await (mgr as any).load?.().catch(() => {});
        // prefer the richer auth module manager when it has accounts or robin-hood selection
        if (((mgr as any).accounts && (mgr as any).accounts.length > 0) || typeof (mgr as any).getNext === "function")
          this.accountManager = mgr;
        else {
          // keep inline but copy accounts if external has
          await this.accountManager.load().catch(() => {});
        }
      } else {
        await this.accountManager.load().catch(() => {});
      }
    } catch {
      await this.accountManager.load().catch(() => {});
    }

    this.initialized = true;
  }

  private getUserAgent(): string {
    try {
      return getDynamicUserAgent(this.version);
    } catch {
      return `antigravity/${this.version} linux/x64`;
    }
  }

  private shouldHandleModel(model: string): boolean {
    if (!model) return false;
    const lower = model.toLowerCase();
    return (
      lower.includes("antigravity") ||
      lower.includes("gemini") ||
      lower.includes("claude") ||
      lower.includes("gpt-oss") ||
      MODELS_2026_PROVIDER.some((m) => lower.includes(m.toLowerCase()))
    );
  }

  private async getAccountForModel(model: string): Promise<Account | null> {
    const preferCliFirst = this.options.cli_first ?? false;
    const strategy = this.options.rotation_strategy ?? "round-robin";
    // soft quota: pass threshold through to managers that support it (auth.js getNext)
    const softThreshold = this.options.soft_quota_threshold_percent ?? 90;
    const pickNext = async (strat: string): Promise<any | null> => {
      try {
        if (typeof (this.accountManager as any).getNext === "function")
          return await (this.accountManager as any).getNext(strat, softThreshold);
      } catch {
        /* the guarded best-effort operation falls through: the outer flow owns the failure */
      }
      try {
        return (await (this.accountManager as any).getNextAccount?.(strat)) ?? null;
      } catch {
        /* the guarded best-effort operation falls through: the outer flow owns the failure */
      }
      try {
        return (await (this.accountManager as any).getNextAccount(strat)) ?? null;
      } catch {
        /* the guarded best-effort operation falls through: the outer flow owns the failure */
      }
      return null;
    };
    // dual quota: if cli_first and gemini model, prefer gemini-cli pool first (preserve antigravity for claude)
    // observer implements as round-robin with skip
    let lastErr: any = null;
    for (let i = 0; i < 10; i++) {
      try {
        const candidate = await pickNext(strategy);
        if (!candidate) break;
        if (this.quotaManager.shouldSkipAccount(candidate.email, model)) continue;

        // cli_first: if gemini and candidate type is antigravity, try to find gemini-cli first? simple heuristic
        if (preferCliFirst && model.toLowerCase().includes("gemini")) {
          // if candidate is claude-only? we still allow but prefer gemini-cli: skip antigravity if another healthy exists
          const isAntigravityOnly = candidate.type === "antigravity" && isGeminiCLIOnlyModel(model);
          // If gemini-cli only model, we should not skip antigravity but note that fallback project would 403 — try next once
          if (isAntigravityOnly) {
            // look ahead one more account in case multi-account
            const nextCandidate = await pickNext("round-robin");
            if (nextCandidate && !this.quotaManager.shouldSkipAccount(nextCandidate.email, model)) {
              return nextCandidate as Account;
            }
          }
        }

        return candidate as Account;
      } catch (e) {
        lastErr = e;
        continue;
      }
    }
    // fallback any
    try {
      const anyAcc = await pickNext(strategy);
      return anyAcc as Account | null;
    } catch {
      return null;
    }
  }

  private async refreshIfNeeded(account: Account): Promise<string> {
    if (account.accessToken && account.expiry && Date.now() < account.expiry - 5 * 60 * 1000)
      return account.accessToken;
    try {
      const refreshed = (await (this.accountManager as any).refreshAccount?.(account.email).catch(() => null)) ?? null;
      if (refreshed?.accessToken) return refreshed.accessToken;
      if ((refreshed as any)?.access_token) return (refreshed as any).access_token;
    } catch {
      /* the guarded best-effort operation falls through: the outer flow owns the failure */
    }
    try {
      if (typeof oauthMod.refreshAccessToken === "function" && account.refreshToken) {
        // refresh with the OAuth client the account authenticated with
        const identity = resolveOAuthIdentity(
          identityFromAccountType((account as any).type ?? (account as any).oauthClientKey),
        );
        const tokens = await oauthMod.refreshAccessToken(account.refreshToken, {
          clientId: identity.clientId,
          clientSecret: identity.clientSecret,
        });
        if (tokens?.access_token) {
          account.accessToken = tokens.access_token;
          account.expiry = Date.now() + (tokens.expires_in ?? 3600) * 1000;
          await this.accountManager.save?.().catch(() => {});
          return tokens.access_token;
        }
      }
    } catch {
      /* the guarded best-effort operation falls through: the outer flow owns the failure */
    }
    if (account.accessToken) return account.accessToken;
    throw new Error(`no access token for ${account.email}`);
  }

  /**
   * handleFetch — intercepta fetch do opencode provider google.
   * Observer third-person: faz exatamente como Gemini CLI:
   * - se account.projectId ausente, chama resolveProjectId que faz loadCodeAssist SEM project, onboardUser se necessário, nunca exige project do usuário.
   * - wrapping {model, project, request} direto cloudcode-pa, sem localhost v1 proxy.
   * - cascade 403/404/5xx, strip x-goog-user-project, skip sandbox para gemini-3.6/3.5/preview.
   * - dual quota + cli_first + pid_offset.
   */
  async handleFetch(originalFetch: typeof fetch, input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    await this.init();

    const urlStr =
      typeof input === "string" ? input : input instanceof URL ? input.toString() : ((input as Request).url ?? "");
    const method = (
      init?.method ??
      (typeof input !== "string" && !(input instanceof URL) ? (input as Request).method : "POST") ??
      "POST"
    ).toUpperCase();
    const bodyStr = (init?.body as string) ?? "";

    // only intercept POST to google / generative or our own transformed calls
    // opencode typically calls fetch to provider endpoint; body contains model
    let parsedBody: any = null;
    let model: string | undefined;
    let messages: any[] | undefined;
    let tools: any[] | undefined;
    let system: any | undefined;
    let thinkingLevel: string | undefined;
    let generationConfig: any | undefined;
    let isAlreadyWrapped = false;

    try {
      if (bodyStr) {
        parsedBody = JSON.parse(bodyStr);
        model = parsedBody?.model ?? parsedBody?.request?.model ?? parsedBody?.modelId ?? "";
        // Gemini-NATIVE SDK body (@ai-sdk/google and friends): {contents, systemInstruction?,
        // tools?, toolConfig?, generationConfig?} at the ROOT with the model ONLY in the URL.
        // Normalize in place into the wrapped {model, project, request} shape so the
        // isAlreadyWrapped path below preserves the native request verbatim.
        if (
          !Array.isArray(parsedBody?.messages) &&
          Array.isArray(parsedBody?.contents) &&
          parsedBody?.request === undefined
        ) {
          const urlModel = extractModelFromUrl(urlStr);
          const native: any = parsedBody;
          parsedBody.request = {
            contents: native.contents,
            ...(native.systemInstruction !== undefined ? { systemInstruction: native.systemInstruction } : {}),
            ...(native.tools !== undefined ? { tools: native.tools } : {}),
            ...(native.toolConfig !== undefined ? { toolConfig: native.toolConfig } : {}),
            ...(native.generationConfig !== undefined ? { generationConfig: native.generationConfig } : {}),
          };
          parsedBody.project = "__devthink_native__"; // marker so the wrapped check below passes
          if (!parsedBody.model) parsedBody.model = urlModel ?? "";
          model = parsedBody.model;
        }
        // detect if already in cloudcode envelope {model, project, request}
        if (parsedBody?.project && parsedBody?.request && parsedBody?.model) {
          isAlreadyWrapped = true;
          model = parsedBody.model;
        } else {
          messages = parsedBody?.messages ?? parsedBody?.request?.contents ?? undefined;
          tools = parsedBody?.tools ?? parsedBody?.request?.tools ?? undefined;
          system =
            parsedBody?.system ?? parsedBody?.systemInstruction ?? parsedBody?.request?.systemInstruction ?? undefined;
          thinkingLevel =
            parsedBody?.thinkingLevel ?? parsedBody?.thinking_level ?? parsedBody?.request?.thinkingLevel ?? undefined;
          generationConfig = parsedBody?.generationConfig ?? parsedBody?.request?.generationConfig ?? undefined;
        }
      }
    } catch {
      // not json, skip intercept
    }

    // if not our model, passthrough
    if (!isAlreadyWrapped && (!model || !this.shouldHandleModel(model))) {
      return originalFetch(input, init);
    }

    const effectiveModel = String(model ?? "").trim();
    if (!effectiveModel) return originalFetch(input, init);

    // account selection dual quota
    const selectedAccount = await this.getAccountForModel(effectiveModel);
    if (!selectedAccount) {
      return new Response(
        JSON.stringify({
          error: `no antigravity accounts available for model ${effectiveModel} — run opencode auth login`,
        }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      );
    }
    let account: Account = selectedAccount;

    let accessToken: string;
    try {
      accessToken = await this.refreshIfNeeded(account);
    } catch (e: any) {
      return new Response(JSON.stringify({ error: `failed to refresh token for ${account.email}: ${e.message}` }), {
        status: 401,
      });
    }

    // bypass total Project ID — exactly Gemini CLI.
    // NOTE: the FALLBACK project id is treated as "not discovered": accounts
    // provisioned with the fallback never ran loadCodeAssist/onboardUser, so we
    // resolve here (loadCodeAssist -> onboardUser free-tier -> load) to discover
    // the account's REAL cloudaicompanionProject (verified live 2026-08-26: the
    // fallback project yields 403 PERMISSION_DENIED on streamGenerateContent).
    let projectId = (account as any).projectId?.trim() ?? "";
    if (!projectId || projectId === FALLBACK_PROJECT_ID) {
      try {
        const resolved = await resolveProjectId({
          accessToken,
          cachedProjectId: undefined,
          email: account.email,
          metadataSaver: async (pid: string) => {
            (account as any).projectId = pid;
            // save to manager
            try {
              await this.accountManager.save?.();
            } catch {
              /* the guarded best-effort operation falls through: the outer flow owns the failure */
            }
          },
          userAgent: this.getUserAgent(),
        });
        projectId = resolved.projectId;
      } catch (e: any) {
        // fallback still returns project id, but if throw -> use blinded fallback with warning
        projectId = FALLBACK_PROJECT_ID;
        console.warn(
          `[m[devthink] resolveProjectId failed for ${account.email}, using fallback ${FALLBACK_PROJECT_ID}: ${e.message}`,
        );
      }
    }

    // transform request if not already wrapped
    // google_search_enabled:"auto" → grounding only for Gemini (non-Claude) models
    const searchOpt = this.options.google_search_enabled ?? true;
    const searchEnabled =
      typeof searchOpt === "string"
        ? searchOpt === "auto"
          ? effectiveModel.toLowerCase().includes("gemini") && !effectiveModel.toLowerCase().includes("claude")
          : false
        : !!searchOpt;

    let buildOpts: BuildOptions;
    if (isAlreadyWrapped) {
      // already {model, project, request} — ensure project is our resolved one
      const existingRequest = parsedBody.request ?? {};
      buildOpts = {
        model: effectiveModel,
        messages: existingRequest.contents ? [{ role: "user", content: "" }] : messages, // dummy, will be overridden since we already have request
        tools,
        system,
        thinkingLevel,
        generationConfig,
        accessToken,
        projectId,
        userAgent: this.getUserAgent(),
        antigravityVersion: this.version,
        pidOffsetEnabled: this.options.pid_offset_enabled ?? false,
        googleSearchEnabled: searchEnabled,
        claudeToolHardening: this.options.claude_tool_hardening,
        keepThinking: this.options.keep_thinking,
      };
      // override inner via direct usage of parsedBody.request for preserving exact content if provided
      // but still rebuild to ensure deterministic ids
      buildOpts.messages = undefined; // we will inject directly below
    } else {
      buildOpts = {
        model: effectiveModel,
        messages,
        tools,
        system,
        thinkingLevel,
        generationConfig,
        accessToken,
        projectId,
        userAgent: this.getUserAgent(),
        antigravityVersion: this.version,
        pidOffsetEnabled: this.options.pid_offset_enabled ?? false,
        googleSearchEnabled: searchEnabled,
        claudeToolHardening: this.options.claude_tool_hardening,
        keepThinking: this.options.keep_thinking,
      };
    }

    // image generation: strip tools and merge image gen config into the request
    if (isImageGenModel(effectiveModel)) {
      buildOpts.tools = [];
    }

    // Decide whether to use gemini-cli builder (prod-only) or antigravity generic
    const isCliOnly = isGeminiCLIOnlyModel(effectiveModel) || shouldSkipSandbox(effectiveModel);
    const builder =
      (this.options.cli_first &&
        effectiveModel.toLowerCase().includes("gemini") &&
        !effectiveModel.toLowerCase().includes("claude")) ||
      isCliOnly
        ? buildGeminiCLIRequest
        : buildAntigravityRequest;

    let buildResult: BuildResult;
    try {
      buildResult = builder(buildOpts);

      if (isImageGenModel(effectiveModel)) {
        buildResult.body.request.generationConfig = {
          ...(buildResult.body.request?.generationConfig ?? {}),
          ...buildImageGenConfig(),
        };
      }

      // If original was already wrapped (or Gemini-native normalized above),
      // preserve its request content but use our project and ids.
      if (isAlreadyWrapped && parsedBody?.request) {
        // Keep original contents etc to avoid double transformation
        const originalReq = parsedBody.request;
        const builtReq = buildResult.body.request ?? {};
        // generationConfig: the USER's fields win (never force parameters) —
        // only the thinking config we synthesized is merged on top.
        const builtGen: Record<string, any> = builtReq.generationConfig ?? {};
        const origGen: Record<string, any> = originalReq.generationConfig ?? {};
        const mergedGen: Record<string, any> = { ...origGen };
        for (const [k, v] of Object.entries(builtGen)) {
          if (k === "thinkingConfig") {
            mergedGen.thinkingConfig = { ...((origGen.thinkingConfig as Record<string, any>) ?? {}), ...v };
          } else if (mergedGen[k] === undefined) {
            mergedGen[k] = v;
          }
        }
        // tools: keep the original declarations, add only what the builder
        // injected (googleSearch) when missing.
        const mergedTools: any[] = Array.isArray(originalReq.tools) ? [...originalReq.tools] : [];
        if (Array.isArray(builtReq.tools)) {
          for (const t of builtReq.tools) {
            if (t && t.googleSearch) {
              if (!mergedTools.some((x) => x && x.googleSearch)) mergedTools.push(t);
            } else if (t && Array.isArray(t.functionDeclarations) && t.functionDeclarations.length > 0) {
              if (!mergedTools.some((x) => x && x.functionDeclarations)) mergedTools.push(t);
            }
          }
        }
        buildResult.body.request = {
          ...originalReq,
          generationConfig: mergedGen,
          tools: mergedTools.length > 0 ? mergedTools : originalReq.tools,
        };
        // update model/project remains
        buildResult.body.model = effectiveModel;
        buildResult.body.project = projectId;
      }
    } catch (e: any) {
      return new Response(JSON.stringify({ error: `failed to build antigravity request: ${e.message}` }), {
        status: 500,
      });
    }

    // cascade fetch with retry 403/404/5xx + strip forbidden headers
    const exec = async (): Promise<Response> => {
      let lastRes: Response | null = null;
      let lastError: Error | null = null;

      // attempt up to 2 account rotations on 403/429
      for (let accountAttempt = 0; accountAttempt < 2; accountAttempt++) {
        try {
          const response = await fetchWithCascade(buildResult, { timeoutMs: CONTENT_TIMEOUT_MS });

          // handle quota exhausted
          if (response.status === 429 || (response.headers.get("content-type")?.includes("json") && false)) {
            // read body text for quota check but need clone
            const cloned = response.clone();
            const txt = await cloned.text().catch(() => "");
            if (this.quotaManager.isQuotaError(response.status, txt)) {
              this.quotaManager.markExhausted(account.email, effectiveModel, 60 * 60 * 1000);
              await (this.accountManager as any).markQuotaExhausted?.(account.email, 60 * 60 * 1000).catch(() => {});
              notifyUser(`account ${account.email} rate-limited, rotating`);
              // soft quota: percent-bearing bodies mark a shorter cooldown window
              const low = txt.toLowerCase();
              if (low.includes("percent") || low.includes("%")) {
                const ttlMinOpt = this.options.soft_quota_cache_ttl_minutes;
                const softMs = (ttlMinOpt === "auto" || ttlMinOpt === undefined ? 15 : ttlMinOpt) * 60 * 1000;
                (this.accountManager as any).markSoftQuota?.(account.email, softMs);
              }
              // rotate account
              const nextAcc = await this.getAccountForModel(effectiveModel);
              if (nextAcc && nextAcc.email !== account.email) {
                account = nextAcc;
                try {
                  accessToken = await this.refreshIfNeeded(account);
                } catch {
                  /* the guarded best-effort operation falls through: the outer flow owns the failure */
                }
                // re-resolve projectId if missing for new account
                let newPid = (account as any).projectId?.trim() ?? "";
                if (!newPid) {
                  try {
                    const resolved = await resolveProjectId({
                      accessToken,
                      email: account.email,
                      metadataSaver: async (pid: string) => {
                        (account as any).projectId = pid;
                        try {
                          await this.accountManager.save?.();
                        } catch {
                          /* the guarded best-effort operation falls through: the outer flow owns the failure */
                        }
                      },
                      userAgent: this.getUserAgent(),
                    });
                    newPid = resolved.projectId;
                  } catch {
                    newPid = FALLBACK_PROJECT_ID;
                  }
                }
                // rebuild with new token/project
                buildOpts.accessToken = accessToken;
                buildOpts.projectId = newPid;
                buildResult = builder(buildOpts);
                continue;
              }
            }
          }

          // success or non-retryable error — return response, but transform if needed
          lastRes = response;

          // if response is not ok and retryable, cascade already handled inside fetchWithCascade loop — but if final is 403/404 here, try next endpoint account rotation
          if (response.status === 403 || response.status === 404 || response.status >= 500) {
            lastError = new Error(`retryable status ${response.status}`);
            // try next account rotation once
            if (accountAttempt === 0) {
              const nextAcc = await this.getAccountForModel(effectiveModel);
              if (nextAcc && nextAcc.email !== account.email) {
                account = nextAcc;
                try {
                  accessToken = await this.refreshIfNeeded(account);
                } catch {
                  /* the guarded best-effort operation falls through: the outer flow owns the failure */
                }
                buildOpts.accessToken = accessToken;
                buildOpts.projectId = (account as any).projectId ?? projectId;
                buildResult = builder(buildOpts);
                continue;
              }
            }
          }

          return response;
        } catch (e: any) {
          lastError = e instanceof Error ? e : new Error(String(e));
          // try next account if error retryable
          if (accountAttempt === 0) {
            const nextAcc = await this.getAccountForModel(effectiveModel);
            if (nextAcc && nextAcc.email !== account.email) {
              account = nextAcc;
              try {
                accessToken = await this.refreshIfNeeded(account);
              } catch {
                /* the guarded best-effort operation falls through: the outer flow owns the failure */
              }
              buildOpts.accessToken = accessToken;
              buildOpts.projectId = (account as any).projectId ?? projectId;
              buildResult = builder(buildOpts);
              continue;
            }
          }
        }
      }

      if (lastRes) return lastRes;
      throw lastError ?? new Error("all account attempts failed");
    };

    let response: Response | null = null;
    try {
      response = await exec();
    } catch (e: any) {
      // session recovery: classify, notify, sanitize messages, retry once
      const errType = detectFetchErrorType(e);
      let retried = false;
      if (errType !== "unknown") {
        notifyUser(`recoverable ${errType} error, retrying once`);
        try {
          const recoveredMessages = fetchSessionRecovery(errType, messages);
          if (Array.isArray(recoveredMessages)) messages = recoveredMessages;
          if (!isAlreadyWrapped) {
            buildOpts.messages = messages;
            buildResult = builder(buildOpts);
          }
          response = await exec();
          retried = true;
        } catch {
          /* the guarded best-effort operation falls through: the outer flow owns the failure */
        }
      }
      if (!retried) {
        // try fallback to other pool if cli_first enabled
        if (this.options.cli_first && !isCliOnly) {
          try {
            const fallbackBuild = buildGeminiCLIRequest({
              ...buildOpts,
              endpointOverrides: [CODE_ASSIST_ENDPOINTS.PROD],
            });
            response = await fetchWithCascade(fallbackBuild);
          } catch {
            return new Response(JSON.stringify({ error: `antigravity request failed after retries: ${e.message}` }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }
        } else {
          return new Response(JSON.stringify({ error: `antigravity request failed after retries: ${e.message}` }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      }
    }

    if (!response) throw new Error("antigravity request failed: no response");

    // transform SSE to OpenAI-compatible if needed — detect client expects event-stream?
    const contentType = response.headers.get("content-type") ?? "";
    // Only transform SUCCESS responses as SSE — Google sends 4xx/5xx error JSON
    // with Content-Type text/event-stream too (verified live), so status alone
    // must gate the transform or the real error message gets swallowed into an
    // empty chunk and the user never sees "not available in your location".
    const isSSE =
      response.ok &&
      (contentType.includes("text/event-stream") ||
        response.url.includes("alt=sse") ||
        effectiveModel.includes("gemini") ||
        effectiveModel.includes("claude"));

    // If caller originally asked for OpenAI SSE (common in opencode), we transform cloudcode SSE → OpenAI SSE lines
    // Observer notes: return text/event-stream with data: {...}\n\n lines
    if (isSSE && response.body) {
      const isAnthropic = parsedBody?.anthropic_version !== undefined || urlStr.toLowerCase().includes("anthropic");

      const parser = createSSEParser();
      const decoder = new TextDecoder();
      const encoder = new TextEncoder();
      // keep_thinking: emit reasoning parts; otherwise drop thought-only parts
      const keepThinking = !!this.options.keep_thinking;
      const sessionIdForPreserve = buildResult.sessionId;

      const originalStream = response.body as ReadableStream<Uint8Array>;

      /** Emits one raw Gemini part: preserves thinking signatures, honors keepThinking. */
      const emitPart = (part: any): boolean => {
        if (!part) return false;
        if (part.thought === true || typeof part.thoughtSignature === "string") {
          const thinkingText =
            typeof part.thought === "string" ? part.thought : typeof part.text === "string" ? part.text : "";
          if (thinkingText && typeof part.thoughtSignature === "string") {
            preserveValidatedSignature(thinkingText, part.thoughtSignature, {
              sessionId: sessionIdForPreserve,
              modelId: effectiveModel,
            });
          }
          if (!keepThinking) return false; // drop reasoning-only part unless keep_thinking
        }
        return true;
      };

      const transformedStream = new ReadableStream({
        async start(controller) {
          const reader = originalStream.getReader();
          let first = true;
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              const text = decoder.decode(value, { stream: true });
              const events = parser.parseChunk(text);
              for (const ev of events) {
                const payloads = normalizeGeminiPayload(ev.data);
                for (const part of payloads) {
                  if (!emitPart(part)) continue;
                  const chunkObj = transformToOpenAIChunk([part], effectiveModel, first, false);
                  first = false;
                  const line = `data: ${JSON.stringify(chunkObj)}\n\n`;
                  controller.enqueue(encoder.encode(line));
                }
                // if event data is [DONE] close
                if (ev.data.trim() === SSE_DONE) {
                  controller.enqueue(encoder.encode(`data: ${SSE_DONE}\n\n`));
                }
              }
            }
            // flush
            const remaining = parser.flush();
            for (const ev of remaining) {
              const payloads = normalizeGeminiPayload(ev.data);
              for (const part of payloads) {
                if (!emitPart(part)) continue;
                const chunkObj = transformToOpenAIChunk([part], effectiveModel, first, false);
                first = false;
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunkObj)}\n\n`));
              }
            }
            // final chunk with stop
            const finalChunk = {
              id: `chatcmpl-${fnv1a32Hex(effectiveModel + Date.now()).slice(0, 12)}`,
              object: "chat.completion.chunk",
              created: Math.floor(Date.now() / 1000),
              model: effectiveModel,
              choices: [{ index: 0, delta: {}, finish_reason: "stop" }],
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(finalChunk)}\n\n`));
            controller.enqueue(encoder.encode(`data: ${SSE_DONE}\n\n`));
            controller.close();
          } catch (e) {
            controller.error(e);
          }
        },
      });

      return new Response(transformedStream, {
        status: response.status,
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          "X-Antigravity-Model": effectiveModel,
          "X-Antigravity-Project": projectId,
        },
      });
    }

    // non-streaming: try to transform JSON to OpenAI-compatible
    try {
      const text = await response.text();
      let json: any;
      try {
        json = JSON.parse(text);
      } catch {
        json = { text };
      }

      // if already OpenAI shape, just return
      if (json.choices || json.content) {
        return new Response(JSON.stringify(json), {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        });
      }

      // unwrap Gemini candidate to text
      const candidates = json.response?.candidates ?? json.candidates ?? [];
      let combinedText = "";
      for (const cand of candidates) {
        const parts = cand.content?.parts ?? [];
        for (const p of parts) if (p.text) combinedText += p.text;
      }
      // if we got text, wrap as OpenAI
      if (combinedText) {
        const openAI = {
          id: `chatcmpl-${fnv1a32Hex(effectiveModel + Date.now()).slice(0, 12)}`,
          object: "chat.completion",
          created: Math.floor(Date.now() / 1000),
          model: effectiveModel,
          choices: [{ index: 0, message: { role: "assistant", content: combinedText }, finish_reason: "stop" }],
        };
        return new Response(JSON.stringify(openAI), { status: 200, headers: { "Content-Type": "application/json" } });
      }

      return new Response(JSON.stringify(json), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      return response;
    }
  }

  getPluginDefinition() {
    const self = this;
    return {
      id: PLUGIN_ID,
      version: PLUGIN_VERSION,
      name: "Antigravity Auth Next",
      description:
        "Enable Opencode to authenticate against Antigravity via OAuth — supports models 25/08/2026 (gemini-3.6/3.5/3.1/3/2.5, claude-opus-4-6-thinking, gpt-oss-120b), dual quota, auto-recovery, direct cloudcode-pa (no localhost v1), bypass Project ID as Gemini CLI via loadCodeAssist+onboardUser",
      async onInit() {
        await self.init();
      },
      hooks: {
        "tool.execute.before": async (ctx: any) => ctx,
        "tool.execute.after": async (ctx: any) => ctx,
        fetch: async (input: RequestInfo | URL, init?: RequestInit, next: typeof fetch = fetch) => {
          return self.handleFetch(next, input, init);
        },
      },
      auth: {
        provider: "google",
        /**
         * opencode credential loader (merged from legacy plugin.ts): supplies the
         * active account OAuth credentials to opencode without re-running login.
         */
        async loader() {
          await self.init();
          try {
            const m = self.accountManager;
            const list = (m as any).list?.() ?? (m as any).accounts ?? [];
            const active = Array.isArray(list)
              ? (list.find((a: any) => a?.enabled !== false && a?.disabled !== true) ?? list[0] ?? null)
              : null;
            if (!active) return null;
            let token = active.accessToken ?? active.access_token;
            const expiry = active.expiry ?? active.expiryDate ?? 0;
            if (!token || Date.now() > expiry - 60000) {
              if (typeof (m as any).refreshIfNeeded === "function") {
                try {
                  token = await (m as any).refreshIfNeeded(active.email);
                } catch {
                  /* the guarded best-effort operation falls through: the outer flow owns the failure */
                }
              }
              if (!token && active.refreshToken) {
                try {
                  const t = await oauthMod.refreshToken(active.refreshToken);
                  token = t.access_token;
                } catch {
                  /* the guarded best-effort operation falls through: the outer flow owns the failure */
                }
              }
            }
            if (!token) return null;
            return {
              type: "oauth",
              accessToken: token,
              refreshToken: active.refreshToken,
              projectId: active.projectId || FALLBACK_PROJECT_ID,
              email: active.email,
            };
          } catch {
            return null;
          }
        },
        async login() {
          const identity = resolveOAuthIdentity(((self as any).options?.oauth_identity as string) ?? "auto");
          const result = await oauthMod.startOAuthFlow({
            clientId: identity.clientId,
            clientSecret: identity.clientSecret,
            scopes: identity.scopesStr,
          });
          if (!(result as any)?.tokens?.refresh_token && !(result as any)?.refresh_token)
            throw new Error("OAuth failed no refresh_token");
          const tokens = (result as any).tokens ?? result;
          const userInfo = (result as any).userInfo ?? {};
          const email = userInfo.email ?? `user-${Date.now()}@gmail.com`;
          const refresh = tokens.refresh_token ?? (result as any).refresh_token;
          const access = tokens.access_token ?? (result as any).access_token;
          // try add via AccountManager
          try {
            const ExtMgr = (accountsMod as any).AccountManager;
            if (ExtMgr) {
              const mgr = new ExtMgr();
              await mgr.load();
              (await (mgr as any).addAccount?.({
                email,
                refreshToken: refresh,
                accessToken: access,
                oauthClientKey: identity.identity,
                oauthClientConfig: { clientId: identity.clientId, clientSecret: identity.clientSecret },
                type: identity.identity,
              } as any)) ??
                (await (mgr as any)
                  .add?.({ email, refreshToken: refresh, accessToken: access } as any)
                  .catch(() => {}));
              await mgr.save();
            }
          } catch {
            // fallback inline
            const inline = new InlineAccountManager();
            await inline.load();
            await inline.addAccount({ email, refreshToken: refresh, accessToken: access, type: identity.identity });
          }
          return { email };
        },
        async list() {
          await self.init();
          try {
            const m = self.accountManager;
            return (m as any).list?.() ?? (m as any).accounts ?? [];
          } catch {
            return [];
          }
        },
        async logout(email?: string) {
          try {
            const ExtMgr = (accountsMod as any).AccountManager;
            if (ExtMgr) {
              const mgr = new ExtMgr();
              await mgr.load();
              if (email) await (mgr as any).remove?.(email);
              else await (mgr as any).clear?.();
              await mgr.save();
            }
          } catch {
            const inline = new InlineAccountManager();
            await inline.load();
            if (!email) {
              await saveAccountsInline([]);
            } else {
              const accs = await loadAccountsInline();
              await saveAccountsInline(accs.filter((a) => a.email.toLowerCase() !== email.toLowerCase()));
            }
          }
        },
        /**
         * Enable/disable toggle (merged from plugin(5)): disabled accounts are
         * skipped by rotation until re-enabled.
         */
        async enable(email: string, en = true) {
          await self.init();
          try {
            if (typeof (self.accountManager as any)?.enable === "function") {
              await (self.accountManager as any).enable(email, en);
              return;
            }
          } catch {
            /* the guarded best-effort operation falls through: the outer flow owns the failure */
          }
          try {
            const accs = await loadAccountsInline();
            for (const a of accs) {
              if (a.email.toLowerCase() === email.toLowerCase()) (a as any).disabled = !en;
            }
            await saveAccountsInline(accs);
          } catch {
            /* the guarded best-effort operation falls through: the outer flow owns the failure */
          }
        },
      },
      config: {
        schema: {
          oauth_identity: {
            type: "string",
            enum: ["auto", "antigravity-cli", "gemini-cli"],
            default: "auto",
            description:
              "OAuth client identity for NEW logins: 'auto'/'antigravity-cli' masquerades as the Antigravity CLI (recommended — its client onboards the current free tier), 'gemini-cli' keeps the legacy Gemini CLI client. Stored accounts always refresh with the client they authenticated with.",
          },
          cli_first: {
            type: "boolean",
            default: false,
            description:
              "Route Gemini models to Gemini CLI quota first (preserve Antigravity quota for Claude) — dual quota",
          },
          pid_offset_enabled: {
            type: "boolean",
            default: false,
            description: "Enable PID offset trick 0-1000 randomization for user_prompt_id (9router anti-fingerprint)",
          },
          google_search_enabled: {
            type: ["boolean", "string"],
            default: true,
            description: "Enable google_search grounding; true/false force, 'auto' enables for Gemini models only",
          },
          quota_refresh_interval_minutes: { type: "number", default: 15 },
          rotation_strategy: { type: "string", enum: ["round-robin", "sticky"], default: "round-robin" },
          claude_tool_hardening: {
            type: "boolean",
            default: true,
            description: "Prefix tool descriptions with hardening hints for Claude models",
          },
          keep_thinking: {
            type: "boolean",
            default: false,
            description: "Keep thinking blocks/signatures in output instead of dropping reasoning parts",
          },
          soft_quota_threshold_percent: {
            type: "number",
            default: 90,
            description: "Skip accounts at or above this used-percentage during rotation",
          },
          soft_quota_cache_ttl_minutes: {
            type: ["number", "string"],
            default: "auto",
            description: "Soft-quota mark duration in minutes; 'auto' resolves to 15",
          },
          quiet_mode: { type: "boolean", default: false, description: "Suppress toast() notifications" },
        },
        defaults: {
          cli_first: false,
          pid_offset_enabled: false,
          google_search_enabled: true,
          quota_refresh_interval_minutes: 15,
          rotation_strategy: "round-robin",
          claude_tool_hardening: true,
          keep_thinking: false,
          soft_quota_threshold_percent: 90,
          soft_quota_cache_ttl_minutes: "auto",
          quiet_mode: false,
        },
      },
      models: MODELS_2026_PROVIDER.map((id) => ({
        id,
        name: id,
        provider: "google",
        // v2.1.16 single-owner fix: context/output limits come from models.js
        // (THE owner). gpt-oss intentionally corrected 131072/32768 ->
        // 200000/64000 to match the models.ts catalog
        // (CONTEXT_WINDOW_GPT_OSS / OUTPUT_LIMIT_GPT_OSS); claude/gemini values
        // are byte-identical to the former inline numbers.
        context: id.toLowerCase().includes("claude")
          ? CONTEXT_WINDOW_CLAUDE
          : id.toLowerCase().includes("gpt-oss")
            ? CONTEXT_WINDOW_GPT_OSS
            : CONTEXT_WINDOW_GEMINI,
        output: id.toLowerCase().includes("claude")
          ? OUTPUT_LIMIT_CLAUDE
          : id.toLowerCase().includes("gpt-oss")
            ? OUTPUT_LIMIT_GPT_OSS
            : OUTPUT_LIMIT_GEMINI,
        // api pool routing metadata (from ALL_MODELS_2026 merge)
        api: mapModelToGroup(id),
        modalities: { input: ["text", "image", "pdf"], output: ["text"] },
      })),
    };
  }
}

// singleton for opencode
let pluginInstance: AntigravityPlugin | null = null;

export function getPlugin(options?: PluginOptions): AntigravityPlugin {
  if (!pluginInstance) pluginInstance = new AntigravityPlugin(options);
  return pluginInstance;
}

/** Legacy definition export (pre-1.18 shape) kept for library consumers. */
export const plugin = getPlugin().getPluginDefinition();

// =============================================================================
// OPENCODE PLUGIN MODULE BRIDGE (opencode >= 1.18 contract)
// =============================================================================
// opencode loads the plugin default export and requires the shape
// { id?: string, server: (input, options?) => Promise<Hooks> } - the loader
// rejects anything else with "must default export an object with server()".
// The bridge below adapts AntigravityPlugin to that contract:
//
//   auth hook     - provider "google" with one oauth method. authorize()
//                   starts the PKCE + local-callback flow (the very same
//                   Gemini CLI masquerade flow the CLI `login` command uses)
//                   and returns the Google consent URL; opencode renders it,
//                   and the returned callback() resolves with the exchanged
//                   tokens and persists the account in the robin-hood store.
//   auth.loader   - supplies the active account credentials without a login.
//   chat.headers  - injects the Gemini CLI identification (User-Agent,
//                   X-Goog-Api-Client, Client-Metadata) on every request:
//                   the dual-bypass second face.
//   tool hooks    - instrumentation passthrough kept from the legacy shape.
//
// The bridge reuses only node:* builtins plus the local modules - no new
// dependencies, no bundling requirements.

/**
 * Persists an OAuth account using the richest store available (the same
 * write path as the legacy auth.login hook).
 */
async function persistOAuthAccount(
  email: string,
  refresh: string,
  access: string,
  expiresIn: number,
  identity?: {
    identity: string;
    clientId: string;
    clientSecret: string;
    scopes?: readonly string[];
  },
): Promise<void> {
  const inst = getPlugin();
  try {
    await (inst as any).init?.();
  } catch {
    /* best effort */
  }
  try {
    const m = (inst as any).accountManager;
    if (m && typeof m.addAccount === "function") {
      await m.addAccount({
        email,
        refreshToken: refresh,
        accessToken: access,
        expiryDate: Date.now() + expiresIn * 1000,
        projectId: "", // left empty on purpose: the first request runs
        // resolveProjectId (loadCodeAssist + onboardUser
        // free-tier) and persists the account's REAL
        // cloudaicompanionProject — the hardcoded fallback
        // yields 403 PERMISSION_DENIED on generateContent.
        enabled: true,
        // identity the account authenticated with — refresh uses the same
        // OAuth client (v3 store: oauthClientKey; inline store: type)
        ...(identity
          ? {
              oauthClientKey: identity.identity,
              oauthClientConfig: { clientId: identity.clientId, clientSecret: identity.clientSecret },
              scopes: identity.scopes ? [...identity.scopes] : undefined,
              type: identity.identity,
            }
          : {}),
      });
      return;
    }
  } catch {
    /* fall through to the inline store */
  }
  const inline = new InlineAccountManager();
  await inline.load();
  await inline.addAccount({
    email,
    refreshToken: refresh,
    accessToken: access,
    ...(identity ? { type: identity.identity } : {}),
  } as any);
}

/**
 * Detects which opencode.json provider block belongs to the provider plugin by looking at
 * MODEL IDS ONLY (never the provider name): any provider whose models include
 * `antigravity-*` prefixed ids or Google `gemini-*` ids is a provider consumer,
 * whatever the user named it ("google", "antigravity", "casas-bahia", ...).
 * Deterministic priority: antigravity-* models > gemini-* models; exact ids
 * "google" / "antigravity" win ties; file order breaks remaining ties.
 * Returns null when no config/provider qualifies (caller falls back "google").
 */
export function detectOpencodeProviderId(configDir?: string): string | null {
  const candidates: string[] = [];
  // OPENCODE_CONFIG (opencode >= 1.18) points at the exact config FILE - the
  // strongest signal there is, so it goes first (plus its dir's canonical
  // names, in case the file itself is named differently).
  const envFile = process.env.OPENCODE_CONFIG?.trim();
  if (envFile) {
    const absFile = resolve(envFile);
    candidates.push(absFile, join(dirname(absFile), "opencode.json"), join(dirname(absFile), "config.json"));
  }
  const envDir = configDir ?? process.env.OPENCODE_CONFIG_DIR?.trim();
  if (envDir) candidates.push(join(resolve(envDir), "opencode.json"), join(resolve(envDir), "config.json"));
  candidates.push(
    join(process.cwd(), "opencode.json"),
    join(process.cwd(), ".opencode", "opencode.json"),
    join(homedir(), ".config", "opencode", "opencode.json"),
    join(homedir(), ".config", "opencode", "config.json"),
    join(homedir(), ".opencode", "opencode.json"),
  );
  let cfg: any = null;
  for (const p of candidates) {
    try {
      if (!existsSync(p)) continue;
      const parsed = JSON.parse(readFileSync(p, "utf8"));
      if (parsed && typeof parsed === "object") {
        cfg = parsed;
        break;
      }
    } catch {
      /* unreadable candidate - try next */
    }
  }
  const providers = cfg?.provider;
  if (!providers || typeof providers !== "object") return null;
  let best: { id: string; score: number } | null = null;
  for (const [id, block] of Object.entries(providers as Record<string, any>)) {
    if (!block || typeof block !== "object") continue;
    const models = block.models;
    let score = 0;
    if (models && typeof models === "object") {
      for (const modelId of Object.keys(models)) {
        const l = modelId.toLowerCase();
        if (l.startsWith("antigravity-")) {
          score = Math.max(score, 100);
          break;
        }
        if (l.startsWith("gemini-")) score = Math.max(score, 60);
      }
    }
    const lid = id.toLowerCase();
    if (score <= 0) {
      // v2.1.20 — two STANDARD provider ids are recognized even without
      // the provider model ids: "antigravity" (ours) and "google" (Google's).
      // They score below any provider that actually carries
      // antigravity-*/gemini-* models, so real model blocks always win.
      if (lid === "antigravity") score = 50;
      else if (lid === "google") score = 40;
      else continue;
    }
    if (lid === "google") score += 10;
    else if (lid === "antigravity") score += 5;
    if (!best || score > best.score) best = { id, score };
  }
  return best ? best.id : null;
}

// =============================================================================
// OPENCODE AUTH ENTRIES (opencode >= 1.18 contract)
// =============================================================================
// `opencode auth login` (and the TUI "Connect a provider" dialog) list one
// entry per plugin auth hook, keyed by auth.provider. the plugin registers THREE
// entries from a single plugin reference (see server.ts, the ./server
// package entry):
//   - provider "google"      — the standard Google entry
//   - provider "antigravity" — the standard Antigravity entry
//   - the CUSTOM provider detected by MODEL IDS in opencode.json
//     ("casasbahia", "my-google", ... — whatever the user named it)
// Every entry shares the same credential loader (SDK options with the live
// OAuth token + identification headers + the cloudcode-pa fetch translator)
// and the same OAuth method (Antigravity CLI masquerade, PKCE, automatic
// loopback callback — no code copy/paste). The exchanged credential is
// stored under the provider that actually carries the provider models, so
// streaming works no matter which entry the user picked.

/**
 * Builds the shared credential loader: opencode merges the return straight
 * into the provider SDK options (baseURL + apiKey = the live OAuth access
 * token + the identity identification headers + a fetch override wired to
 * the plugin handleFetch translator, which rewrites every chat request into
 * the Antigravity/Gemini-CLI cloudcode-pa envelope).
 */
function buildOpencodeAuthLoader(inst: AntigravityPlugin, legacyAuth: any) {
  return async (): Promise<Record<string, any> | null> => {
    try {
      const legacyInfo = (await legacyAuth.loader?.()) as any;
      if (!legacyInfo?.accessToken) return null;
      // request fingerprint of the active account's identity — the
      // antigravity-cli client presents its own UA/api-client pair, the
      // gemini-cli family keeps the GeminiCLI fingerprint
      const activeAccount = (() => {
        try {
          const list = (inst as any).accountManager?.list?.() ?? (inst as any).accountManager?.accounts ?? [];
          return Array.isArray(list) ? (list.find((a: any) => a?.email === legacyInfo.email) ?? list[0] ?? null) : null;
        } catch {
          return null;
        }
      })();
      const isAgCli =
        identityFromAccountType((activeAccount as any)?.type ?? (activeAccount as any)?.oauthClientKey) ===
        "antigravity-cli";
      const headers = isAgCli
        ? getAntigravityCliHeaders()
        : ((oauthMod as any).getGeminiHeaders?.() ?? FALLBACK_GEMINI_HEADERS);
      return {
        // v2.1.16 single-owner fix: cloudcode-pa base URL from constants.js
        // (CLOUDCODE_BASE_URL owner) instead of a local literal.
        baseURL: CLOUDCODE_BASE_URL,
        apiKey: legacyInfo.accessToken,
        headers,
        fetch: (input: any, init?: any) => (inst as any).handleFetch(fetch, input, init),
      };
    } catch {
      return null;
    }
  };
}

/**
 * Resolves the provider id the OAuth credential is stored under: the
 * detected provider (model ids first) — otherwise the entry's own provider,
 * except that "antigravity" is only kept when the provider will actually
 * exist (user config or the zero-config injection); with the injection
 * disabled and nothing configured the credential falls back to "google",
 * which always exists in opencode's models.dev database (a credential whose
 * provider exists nowhere crashes opencode's auth-loader merge).
 */
function resolveCredentialTarget(fallbackProvider: string): string {
  const detected = detectOpencodeProviderId();
  if (detected) return detected;
  if (fallbackProvider === "antigravity") {
    const injectionEnabled =
      ((getPlugin() as any)?.options?.inject_antigravity_provider as boolean | undefined) !== false;
    return injectionEnabled ? "antigravity" : "google";
  }
  return fallbackProvider;
}

/**
 * Builds the shared OAuth method list: authorize() starts the PKCE +
 * local-callback flow (the Antigravity CLI masquerade — the very same
 * identity the CLI `login` command uses) and returns the Google consent
 * URL; the returned callback() resolves with the exchanged tokens, persists
 * the account in the robin-hood store and reports the provider the
 * credential is stored under (model-id detection first, the entry's own
 * provider id as fallback — so a credential picked on the "google" entry
 * still lands on the custom provider that carries the provider models).
 */
function buildOpencodeAuthMethods(fallbackProvider: string) {
  return [
    {
      type: "oauth" as const,
      label: "Login with Google (Antigravity - Gemini CLI bypass)",

      /**
       * Starts the OAuth flow and returns the Google consent URL plus
       * the callback that resolves once the tokens are exchanged.
       * opencode renders the URL; after the user signs in and grants
       * the consent, Google redirects to the local 127.0.0.1 callback
       * server started here.
       */
      authorize: async (): Promise<{
        url: string;
        instructions: string;
        method: "auto";
        callback: () => Promise<
          | {
              type: "success";
              provider?: string | undefined;
              refresh: string;
              access: string;
              expires: number;
              accountId?: string | undefined;
            }
          | { type: "failed" }
        >;
      }> => {
        // OAuth identity for NEW logins: the Antigravity CLI client
        // (default since 2.1.8 — the gemini-cli individuals tier was
        // retired; the antigravity-cli client onboards the "Antigravity"
        // free tier and its loopback redirect is accepted by Google,
        // which keeps the whole flow automatic: no code copy/paste).
        const inst = getPlugin();
        const identity = resolveOAuthIdentity(((inst as any)?.options?.oauth_identity as string) ?? "auto");
        const state = randomBytes(32).toString("base64url");
        const pkce = identity.usesPKCE ? ((oauthMod as any).generatePKCE?.() ?? null) : null;
        const srv = await (oauthMod as any).createOAuthServerAsync({
          callbackPath: "/oauth2callback",
          expectedState: state,
        });
        const redirectUri: string = srv.callbackUrl;
        const authUrl: string = (oauthMod as any).buildAuthUrl(pkce, redirectUri, {
          state,
          accessType: "offline",
          scopes: identity.scopesStr,
          clientId: identity.clientId,
          ...(identity.usesPKCE ? { prompt: "consent" as const } : {}),
        });

        return {
          url: authUrl,
          instructions: `Sign in with your Google account and authorize ${identity.appLabel}. the plugin masquerades as the ${identity.identity} client and stores the tokens locally for the robin-hood rotation.`,
          method: "auto",
          callback: async () => {
            try {
              const { code } = await srv.waitForCallback();
              const tokens = await (oauthMod as any).exchangeCodeForTokens(
                code,
                pkce ? pkce.verifier : null,
                redirectUri,
                { clientId: identity.clientId, clientSecret: identity.clientSecret },
              );
              const refresh: string | undefined = tokens.refresh_token;
              const access: string | undefined = tokens.access_token;
              const expires: number = Date.now() + (tokens.expires_in ?? 3600) * 1000;
              if (!refresh || !access) {
                return { type: "failed" as const };
              }
              let email = "";
              try {
                const userInfo = await (oauthMod as any).getUserInfo(access);
                email = (userInfo?.email ?? "").toLowerCase();
              } catch {
                /* userinfo is optional for the credential */
              }
              await persistOAuthAccount(
                email || `user-${Date.now()}@gmail.com`,
                refresh,
                access,
                tokens.expires_in ?? 3600,
                identity,
              );
              return {
                type: "success" as const,
                provider: resolveCredentialTarget(fallbackProvider),
                refresh,
                access,
                expires,
                accountId: email || undefined,
              };
            } catch {
              return { type: "failed" as const };
            } finally {
              try {
                await srv.close();
              } catch {
                /* server already down */
              }
            }
          },
        };
      },
    },
  ];
}

/**
 * Builds a complete opencode AuthHook for one provider id (shared loader +
 * the OAuth methods). Used by the ./server entry for the standard "google"
 * and "antigravity" entries and for the custom provider detected by model
 * ids — all three surface in `opencode auth login` with an OAuth option.
 */
export function buildOpencodeAuthHook(providerId: string): Record<string, any> {
  const inst = getPlugin();
  const def = inst.getPluginDefinition();
  const legacyAuth: any = def.auth ?? {};
  return {
    // Recognition is by MODEL IDS in opencode.json, never by a fixed name:
    // the user may name the provider anything ("google", "casas-bahia", ...)
    // as long as it carries antigravity-* / gemini-* model ids. The
    // standard entries "google" and "antigravity" work with zero config.
    provider: providerId,
    loader: buildOpencodeAuthLoader(inst, legacyAuth),
    methods: buildOpencodeAuthMethods(providerId),
  };
}

/**
 * Standard-entry safety net: ensures a provider "antigravity" ALWAYS exists
 * in the config (npm @ai-sdk/google + the provider model catalog) unless the
 * user defined their own "antigravity" block or disabled the provider.
 * This is one of the TWO standard entries ("google" is the other — it always
 * exists in opencode's models.dev database): the "Antigravity" entry of
 * `opencode auth login` is immediately usable, and credentials stored under
 * "antigravity" (e.g. from a zero-config login on another project) always
 * find their provider — opencode crashes on auth-loader credentials whose
 * provider exists neither in models.dev nor in the config. ADD-ONLY and
 * in-memory: the user's file is never touched and an explicit
 * "antigravity" block always wins.
 */
export function injectAntigravityProvider(cfg: any, enabled = true): void {
  try {
    if (!enabled || !cfg || typeof cfg !== "object") return;
    let providers = cfg.provider;
    if (!providers || typeof providers !== "object" || Array.isArray(providers)) {
      providers = {};
      cfg.provider = providers;
    }
    if (providers.antigravity) return; // the user already defined it — never override
    const disabled = Array.isArray(cfg.disabled_providers) ? cfg.disabled_providers.map(String) : [];
    if (disabled.includes("antigravity")) return; // explicitly disabled
    const models: Record<string, any> = {};
    for (const m of ALL_MODELS_2026) models[m.id] = {};
    providers.antigravity = {
      npm: "@ai-sdk/google",
      name: "Antigravity",
      options: {},
      models,
    };
  } catch {
    /* never break the host config */
  }
}

/**
 * The opencode server entry: initializes the plugin singleton and returns
 * the hooks object implementing the 1.18.x contract — header injection,
 * the zero-config antigravity provider injection and the auth entry for
 * the CUSTOM provider detected by model ids. The standard "google" and
 * "antigravity" auth entries are registered by server.ts (the ./server
 * package entry) and are never duplicated here.
 */
export async function opencodeServer(_input?: unknown, options?: PluginOptions): Promise<Record<string, any>> {
  const inst = getPlugin(options ?? {});
  try {
    await (inst as any).init?.();
  } catch {
    /* plugin init is best-effort; the hooks degrade gracefully */
  }
  const def = inst.getPluginDefinition();
  const legacyAuth: any = def.auth ?? {};
  const legacyHooks: any = def.hooks ?? {};

  // v2.1.13 — provider scoping for the identification spoof: only requests
  // whose PROVIDER is a provider-family entry (the detected custom provider plus the
  // standard "google" / "antigravity" ids) may receive the Google
  // identification headers. Model-id substrings alone are NOT enough: real
  // configs carry e.g. "openai/gpt-oss-120b" under nvidia/openrouter, and
  // those third-party requests must never be polluted with the spoof.
  const devthinkProviderIds = new Set(
    ["google", "antigravity", detectOpencodeProviderId()]
      .filter((x): x is string => typeof x === "string" && x.length > 0)
      .map((x) => x.toLowerCase()),
  );

  const hooks: Record<string, any> = {
    // keep the valid legacy hooks (tool instrumentation); the legacy "fetch"
    // hook is not part of the 1.18 contract and is intentionally dropped
    // here - the identification spoof moves to chat.headers below.
    ...(legacyHooks["tool.execute.before"] ? { "tool.execute.before": legacyHooks["tool.execute.before"] } : {}),
    ...(legacyHooks["tool.execute.after"] ? { "tool.execute.after": legacyHooks["tool.execute.after"] } : {}),

    /**
     * Gemini CLI identification spoof on chat requests for provider-handled
     * models: gated to MAENE PROVIDER IDS (detected custom provider + the
     * standard "google"/"antigravity" entries — see devthinkProviderIds above)
     * AND a matching MODEL ID (antigravity-*, gemini-*, gpt-oss): User-Agent
     * GeminiCLI/0.57.0, X-Goog-Api-Client gl-node/..., Client-Metadata
     * ideType=IDE_UNSPECIFIED. Unrelated providers (nvidia/openrouter/...)
     * never receive the spoof even when their model ids contain the
     * substrings ("openai/gpt-oss-120b" etc.).
     */
    "chat.headers": async (
      _input: {
        sessionID: string;
        agent: string;
        model?: { providerID: string; modelID: string };
        provider?: { info?: { options?: Record<string, any> } };
      },
      output: { headers: Record<string, string> },
    ): Promise<void> => {
      try {
        const modelId = String(_input?.model?.modelID ?? "").toLowerCase();
        if (!modelId) return;
        const providerId = String(_input?.model?.providerID ?? "").toLowerCase();
        if (!devthinkProviderIds.has(providerId)) return; // never pollute unrelated providers with the spoof
        const handled = modelId.includes("antigravity") || modelId.includes("gemini") || modelId.includes("gpt-oss");
        if (!handled) return;
        const spoof = (oauthMod as any).getGeminiHeaders?.() ?? FALLBACK_GEMINI_HEADERS;
        Object.assign(output.headers, spoof);
      } catch {
        /* header injection never breaks the request */
      }
    },

    /**
     * config hook (opencode >= 1.18): runs before opencode reads
     * cfg.provider — the documented injection point. Used only for the
     * zero-config antigravity provider; the user's file is never touched
     * on disk and any real provider block (custom name included) takes
     * precedence. Disable with the plugin option
     * ["devthink", { "inject_antigravity_provider": false }].
     */
    config: async (input: any): Promise<void> => {
      injectAntigravityProvider(input, (options as any)?.inject_antigravity_provider !== false);
    },
  };

  // Auth for the CUSTOM provider detected by MODEL IDS in opencode.json
  // (any name the user chose). The standard "google" and "antigravity"
  // entries are registered by server.ts (the ./server package entry) —
  // never duplicated here.
  const detected = detectOpencodeProviderId();
  const customCandidate =
    detected ?? (typeof legacyAuth.provider === "string" && legacyAuth.provider ? legacyAuth.provider : null);
  if (customCandidate && customCandidate !== "google" && customCandidate !== "antigravity") {
    hooks.auth = buildOpencodeAuthHook(customCandidate);
  }
  return hooks;
}

/**
 * The opencode PluginModule (V1 shape): what loaders that read package.json
 * `main` directly get (library consumers, older opencode builds). It always
 * carries exactly one auth entry — the detected provider with the "google"
 * fallback — so single-hook loaders keep working.
 */
const opencodePluginModule = {
  id: "devthink",
  server: async (input?: unknown, options?: PluginOptions) => {
    const hooks = await opencodeServer(input, options);
    if (!hooks.auth) hooks.auth = buildOpencodeAuthHook(detectOpencodeProviderId() ?? "google");
    return hooks;
  },
} as const;

export default opencodePluginModule;
