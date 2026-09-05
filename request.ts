/**
 * @file request.ts
 * @module maene/request
 * @description
 *  THE single request-building module of the maene library. v2.1.14
 *  consolidation: request.ts absorbed request-helpers.ts in full, so the
 *  entire request-building category — schema cleaning, tool validation,
 *  thinking budgets, fingerprint headers, session/prompt id builders, model
 *  classification, request transforms/builders and cascade fetch — lives in
 *  this one file.
 *
 *  Third-person observer view: the library watches how OpenCode transforms
 *  user messages (OpenAI and Anthropic shapes) into Gemini/Claude payloads
 *  and how Antigravity Manager forwards them to cloudcode-pa.googleapis.com
 *  without using localhost v1 proxy.
 *
 *  Responsibilities:
 *  - transformRequest: OpenCode -> Gemini normalized request (contents, system, tools, genConfig)
 *  - buildAntigravityRequest / buildGeminiCLIRequest: wraps normalized request into
 *    cloudcode-pa envelope with deterministic session_id / user_prompt_id (FNV-1a),
 *    endpoint cascade, fingerprint headers, and x-goog-user-project stripping
 *  - schema cleaning: tolerant Gemini-shaping cleanJsonSchema plus the strict
 *    allowlist cleanJsonSchemaStrict / cleanToolSchemaTolerant family
 *  - tool name validation, sanitization and deduplication (two parallel
 *    families: validateToolNames and validateToolNamesDetailed)
 *  - message normalization: normalizeMessages and normalizeIncomingMessages
 *  - thinking level parsing, budget maps, family-aware budgets and variant hints
 *  - deterministic id builders over FNV-1a 32/64-bit digests
 *  - model classification (isGeminiCLIOnlyModel, isLikelyAntigravityOnlyModel,
 *    variant extraction) and the Gemini CLI bypass constants
 *  - google_search injection when enabled; cascade fetch with retry
 *
 *  Architecture governance:
 *  - Date: 25/08/2026 — Canto do Buriti, Piauí, Brasil
 *  - Library-first, root-first: file lives beside its siblings (no src/ nesting)
 *  - Only node:* builtins + global fetch (Node >=18) — zero external deps
 *  - Direct cloudcode-pa usage: https://cloudcode-pa.googleapis.com,
 *    https://daily-cloudcode-pa.googleapis.com,
 *    https://daily-cloudcode-pa.sandbox.googleapis.com
 *  - No localhost v1 base-url proxy (requisito explícito)
 *  - Deterministic IDs via FNV-1a (32/64-bit) — reproducible per conversation
 *  - Strip x-goog-user-project header to avoid 403 IAM (issue pi-mono #1830)
 *  - Skip sandbox for gemini-cli models to avoid 404/403 cascade (#233)
 *
 *  v2.1.14 merge notes (request.ts + request-helpers.ts -> request.ts):
 *  - Identical duplicated symbols collapsed to a single definition.
 *  - Divergent duplicates resolved toward the more defensive variant; the
 *    losing variant survives under a parallel export whenever its behavior
 *    was not equivalent:
 *      cleanJsonSchemaStrict            <- request-helpers cleanJsonSchema (strict allowlist)
 *      cleanToolSchemaTolerant          <- request-helpers cleanToolSchema (tolerant normalizer)
 *      validateToolNamesDetailed        <- request-helpers validateToolNames (rich validator)
 *      buildGenerationConfigFromRequest <- request.ts buildGenerationConfig (request-shaped)
 *  - Canonical fnv1a32 hashes UTF-16 code units (charCodeAt), matching the
 *    repo-wide implementation in core.ts; the UTF-8 byte variant that lived
 *    only in request-helpers.ts was dropped as the outlier.
 *  - Canonical TOOL_NAME_REGEX is the letter-start + 64-cap pattern shared
 *    with core.ts (TOOL_REGEX); the underscore-start variant was dropped.
 *  - Canonical generateSessionId/generateUserPromptId are the validating
 *    versions (throw RequestHelpersError on empty seed).
 *  - The RequestHelpers barrel is re-exported from this module; the default
 *    export remains RequestPipeline.
 *
 * @author maene
 * @license MIT
 * @version 2.1.16
 */

import * as os from "node:os";
const osPlatform = os.platform;
const osArch = os.arch;
import { randomBytes, randomInt } from "node:crypto";
// v2.1.15 Phase B: raw shared values (identity UA, client metadata family,
// project fallback, forbidden header lists, FNV constants, cloudcode bases,
// antigravity version fallback) come from constants.js; generic utilities
// (fnv hash family, retry predicate) from core.js; identity masquerade
// (gl-node api-client snapshot, client-metadata builder) from fingerprint.js.
import {
  ANTIGRAVITY_VERSION_FALLBACK,
  CLIENT_METADATA,
  CLIENT_METADATA_RAW,
  CLIENT_METADATA_STRING,
  CLOUDCODE_DAILY_BASE,
  CLOUDCODE_PA_BASE,
  FALLBACK_PROJECT_ID,
  FORBIDDEN_HEADERS,
  FNV_OFFSET_BASIS,
  FNV_PRIME,
  GEMINI_CLI_OAUTH_CLIENT_ID,
  GEMINI_CLI_OAUTH_CLIENT_SECRET,
  CODE_ASSIST_BASE_URL,
  CODE_ASSIST_PATH_MAP,
  CONTENT_TIMEOUT_MS,
  GEMINI_CLI_USER_AGENT,
  HEADERS_TO_STRIP,
  PLUGIN_VERSION,
  PROJECT_FALLBACK,
} from "./constants.js";
import { fnv1a32, fnv1a32Hex, getJitter, isRetryableStatus } from "./core.js";
const MODELS_2026_SET = new Set<string>(FETCH_AVAILABLE_MODELS_2026 as readonly string[]);
export const TOOL_NAME_MAX_LENGTH = 64 as const;

export const TOOL_NAME_MIN_LENGTH = 1 as const;

export const THINKING_LEVEL_TO_BUDGET_GEMINI: Record<string, number> = {
  none: 0,
  minimal: 0, // 0 desativa thinking em Gemini nativo
  low: 1024,
  medium: 4096,
  high: 8192,
  ultra: 16384,
};

export const THINKING_LEVEL_TO_BUDGET_CLAUDE: Record<string, number> = {
  none: 0,
  minimal: 1024,
  low: 2048,
  medium: 8192,
  high: 16384,
  ultra: 32768,
};

/**
 * Thinking budget ceiling shared by the clamp paths. v2.1.16: the value
 * (64000) is byte-identical to models.ts THINKING_BUDGET_MAX_CLAUDE — the
 * thinking-table owner — so this export now aliases that import instead of
 * repeating the literal.
 */
export const THINKING_BUDGET_MAX = THINKING_BUDGET_MAX_CLAUDE;

// candidate for models.js ownership (THINKING_BUDGET_MIN): models.ts exports
// no minimum-thinking-budget constant yet, so the 1024 floor stays local.
export const THINKING_BUDGET_MIN = 1024 as const;

// v2.1.15 Phase C: historical alias names for the gemini-cli client pair.
export { GEMINI_CLI_OAUTH_CLIENT_ID as GEMINI_CLI_CLIENT_ID } from "./constants.js";
export { GEMINI_CLI_OAUTH_CLIENT_SECRET as GEMINI_CLI_CLIENT_SECRET } from "./constants.js";
import {
  buildClientMetadata,
  getDynamicUserAgent,
  getFingerprintHeaders,
  normalizeArch,
  normalizePlatform,
  X_GOOG_API_CLIENT_GEMINI_CLI as X_GOOG_API_CLIENT,
} from "./fingerprint.js";
// v2.1.15 Phase A: model-identification families (the observed 2026-08-25
// fetchAvailableModels list, the Gemini-CLI-only routing list, search model
// ids, thinking tables and the endpoint routing orders/classifiers) are
// imported from models.ts — THE single owner. The historical local names are
// re-exported below so this module's public surface stays unchanged.
import {
  CODE_ASSIST_ENDPOINTS,
  ENDPOINT_ORDER_ANTIGRAVITY,
  ENDPOINT_ORDER_GEMINI_CLI,
  FETCH_AVAILABLE_MODELS_2026,
  GEMINI_CLI_ONLY_MODELS,
  SEARCH_MODEL,
  SEARCH_MODEL_PREVIEW,
  THINKING_BUDGET_MAP,
  THINKING_BUDGET_MAX_CLAUDE,
  THINKING_BUDGET_MAX_GEMINI,
  THINKING_LEVELS,
  getEndpointsForModel,
  isGeminiCLIOnlyModel,
} from "./models.js";
import type { FetchAvailableModel2026, ThinkingLevel } from "./models.js";

export {
  ENDPOINT_ORDER_ANTIGRAVITY,
  ENDPOINT_ORDER_GEMINI_CLI,
  GEMINI_CLI_ONLY_MODELS,
  SEARCH_MODEL,
  SEARCH_MODEL_PREVIEW,
  THINKING_BUDGET_MAP,
  THINKING_BUDGET_MAX_CLAUDE,
  THINKING_BUDGET_MAX_GEMINI,
  THINKING_LEVELS,
  getEndpointsForModel,
  isGeminiCLIOnlyModel,
} from "./models.js";
export type { ThinkingLevel } from "./models.js";
/** Historical request-module alias of the models.ts owner list. */
export { FETCH_AVAILABLE_MODELS_2026 as MODELS_2026 } from "./models.js";
// v2.1.15 Phase A: the ModelId2026 alias re-export was deleted — the name
// is owned by models.ts (import it from there when needed).

/**
 * Linear-time trailing-slash strip (regex-free; safe on uncontrolled input —
 * the former /\/+$/.replace was polynomial and flagged as ReDoS-prone).
 */
function stripTrailingSlashes(value: string): string {
  let end = value.length;
  while (end > 0 && value.charCodeAt(end - 1) === 47) end--;
  return end === value.length ? value : value.slice(0, end);
}

// ---------------------------------------------------------------------------
// Private utilities merged from request-helpers.ts
// ---------------------------------------------------------------------------

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return (
    typeof v === "object" && v !== null && !Array.isArray(v) && Object.prototype.toString.call(v) === "[object Object]"
  );
}

// ---------------------------------------------------------------------------
// Constants — endpoint cascade, models 2026, budgets, headers
// ---------------------------------------------------------------------------

/**
 * Official cloudcode-pa endpoints — prod is authoritative in 2026,
 * daily and sandbox are rollout / canary fallbacks.
 * Third-person: observer copies order from Antigravity Manager binary.
 */
// v2.1.15 Phase D: the host map ENDPOINTS lives in constants.js (raw value owner).

/** Default cascade order for Antigravity pool (re-exported from models.ts above). */

/** Stream endpoint suffix used by Antigravity */

/** Antigravity version fallback — governance requires 1.19.2 (bypass ban <1.15.8) */

/** Fallback project id */

// v2.1.15 Phase A: MODELS_2026 (the 22-id observed fetchAvailableModels
// list), GEMINI_CLI_ONLY_MODELS, SEARCH_MODEL, SEARCH_MODEL_PREVIEW,
// THINKING_LEVELS/ThinkingLevel and THINKING_BUDGET_MAP moved to models.ts
// and are imported + re-exported at the top of this file.

/** FNV-1a constants — 32-bit */

/** Forbidden headers stripped case-insensitively — observer notes AM never sends them on content */

/**
 * OpenCode function tool — accepts OpenAI, Anthropic, or Gemini pre-shaped.
 */
export type OpenCodeTool =
  | { type: "function"; function: { name: string; description?: string; parameters?: any } }
  | { name: string; description?: string; input_schema?: any; inputSchema?: any; parameters?: any; [k: string]: any }
  | { functionDeclarations: Array<{ name: string; description?: string; parameters?: any }> };

export interface TransformRequestInput {
  /** Model id, e.g. gemini-3-flash-preview or claude-opus-4-6-thinking-low */
  model: string;
  /** Message history in OpenCode format */
  messages: OpenCodeMessage[];
  /** Optional tools — OpenAI / Anthropic / Gemini shapes tolerated */
  tools?: OpenCodeTool[] | any[];
  /** Optional system instruction as string or array of texts */
  system?: string | string[] | null;
  /** Optional thinking level minimal|low|medium|high|max — maps to budget */
  thinkingLevel?: ThinkingLevel | string;
  /** Optional explicit thinking budget — overrides level map */
  thinkingBudget?: number;
  /** Whether to inject google_search grounding tool */
  googleSearchEnabled?: boolean;
  /** Optional generationConfig passthrough (temperature, maxTokens, etc) */
  generationConfig?: Record<string, any>;
  /** Optional seed for deterministic session_id — defaults to hash of messages+model */
  sessionSeed?: string;
  /** Optional seed for user_prompt_id — defaults to last user message */
  userPromptSeed?: string;
  /** Optional projectId — not used in transformRequest but kept for symmetry */
  projectId?: string;
}

/**
 * Gemini content part.
 * v2.1.14 merge: unions the request.ts declaration (thought/thoughtSignature)
 * with the request-helpers.ts declaration (fileData plus the explicit
 * GeminiFunctionCall/GeminiFunctionResponse sub-shapes).
 */
export interface GeminiPart {
  text?: string;
  thought?: boolean;
  thoughtSignature?: string;
  inlineData?: { mimeType: string; data: string };
  fileData?: { mimeType: string; fileUri: string };
  functionCall?: GeminiFunctionCall;
  functionResponse?: GeminiFunctionResponse;
  [k: string]: unknown;
}

/**
 * Gemini content turn.
 * v2.1.14 merge: keeps the "system" role from request.ts alongside the
 * user/model pair used by both halves.
 */
export interface OpenCodeMessage {
  role: "system" | "user" | "assistant" | "tool" | "model" | string;
  content?: string | any[] | null;
  tool_calls?: Array<{ id: string; type?: string; function: { name: string; arguments: string | object } }>;
  tool_call_id?: string;
  name?: string;
  // Anthropic extras
  thinking?: string;
  signature?: string;
  [k: string]: any;
}

export interface GeminiContent {
  role: "user" | "model" | "system";
  parts: GeminiPart[];
}

/** System instruction content shape (live pipeline lineage). */
export type GeminiSystem = { parts: GeminiPart[] } | undefined;

export interface GeminiTool {
  functionDeclarations?: Array<{ name: string; description?: string; parameters?: any }>;
}

export interface TransformedRequest {
  /** Normalized model id stripped of antigravity- prefix for routing but original preserved */
  model: string;
  /** Original model string exactly as user provided */
  originalModel: string;
  /** Gemini contents array ready for cloudcode-pa */
  contents: GeminiContent[];
  /** System instruction aggregated */
  systemInstruction?: { role: "system"; parts: GeminiPart[] } | null;
  /** Tools normalized to Gemini functionDeclarations */
  tools?: GeminiTool[] | null;
  /** Generation config with thinking budget mapped if provided */
  generationConfig?: Record<string, any> | null;
  /** Deterministic session_id via FNV-1a */
  sessionId: string;
  /** Deterministic user_prompt_id via FNV-1a */
  userPromptId: string;
  /** Thinking budget resolved */
  thinkingBudget?: number;
  /** Thinking level resolved */
  thinkingLevel?: ThinkingLevel;
}

export const ALLOWED_SCHEMA_KEYS = new Set([
  "type",
  "properties",
  "required",
  "description",
  "enum",
  "items",
  "anyOf",
  "oneOf",
  "format",
  "minimum",
  "maximum",
  "minLength",
  "maxLength",
  "pattern",
  "title",
  "nullable",
  "propertyOrdering",
]);

/**
 * Keys kept by the tolerant cleaner {@link cleanJsonSchema}: the module
 * allowlist minus propertyOrdering (the cloudcode-pa tool-schema validator
 * rejects that key on parameters). Derived — never re-listed — from
 * {@link ALLOWED_SCHEMA_KEYS} so the two policies cannot drift apart.
 */
const CLEAN_SCHEMA_KEYS: ReadonlySet<string> = new Set(
  [...ALLOWED_SCHEMA_KEYS].filter((k) => k !== "propertyOrdering"),
);

export const MAX_TOOLS_PER_REQUEST = 128 as const;

/** Allowed top-level keys of a tool definition after cleaning. */
export const ALLOWED_TOOL_TOP_KEYS = ["name", "description", "parameters"] as const;

/** Direct production cloudcode-pa endpoint — bypasses any localhost proxy. */
export const DIRECT_ENDPOINT = "https://cloudcode-pa.googleapis.com" as const;
/** Daily (canary) cloudcode-pa endpoint. */
export const DAILY_ENDPOINT = "https://daily-cloudcode-pa.googleapis.com" as const;
/** Autopush sandbox endpoint. */
export const AUTOPUSH_ENDPOINT = "https://autopush-cloudcode-pa.sandbox.googleapis.com" as const;

/** Cascade order used by the observer when retrying endpoints. */
export const ENDPOINT_CASCADE = [DAILY_ENDPOINT, AUTOPUSH_ENDPOINT, DIRECT_ENDPOINT] as const;

/**
 * Headers stripped before sending to avoid 403 IAM (pi-mono #1830); Antigravity
 * Manager never sends these on content requests.
 */

// v2.1.16: GEMINI_CLI_ONLY_EXACT (10-id exact list) was deleted — zero
// consumers repo-wide (only the RequestHelpers bundle listed it). Routing
// consults models.isGeminiCLIOnlyModel / getEndpointsForModel instead.

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

/**
 * Thrown when transformRequest cannot normalize input.
 */
export class RequestTransformationError extends Error {
  public readonly code: string;
  constructor(message: string, code = "REQUEST_TRANSFORM_ERROR") {
    super(message);
    this.name = "RequestTransformationError";
    this.code = code;
  }
}

// ============================================================================
// 11. MERGED OBSERVER HELPERS (from request-helpers v2 — third-person module)
// ============================================================================

/**
 * Domain error for the merged observer helpers. Thrown instead of generic Error
 * so callers can distinguish cleaning/normalization failures from transport.
 */
export class RequestHelpersError extends Error {
  public readonly code: string;

  constructor(message: string, code = "REQUEST_HELPERS_ERROR", cause?: unknown) {
    super(message);
    this.name = "RequestHelpersError";
    this.code = code;
    if (cause) {
      (this as { cause?: unknown }).cause = cause;
    }
    // Maintain proper prototype chain for instanceof
    Object.setPrototypeOf(this, RequestHelpersError.prototype);
  }
}

// ---------------------------------------------------------------------------
// FNV-1a — deterministic hashing for session_id / user_prompt_id
// ---------------------------------------------------------------------------

/**
 * Computes FNV-1a 32-bit hash.
 * Third-person: observer notes this hash is fast, no crypto deps, deterministic.
 *
 * @param input - string to hash
 * @returns unsigned 32-bit integer
 */

/**
 * Generates hex string padded to 8 chars from FNV-1a.
 *
 * @param input - seed
 * @returns 8-char hex
 */

// ---------------------------------------------------------------------------
// Merged: deterministic ids over FNV-1a hex digests
// ---------------------------------------------------------------------------

/**
 * Returns the FNV-1a 32-bit digest of input padded to 8 hex chars.
 *
 * @param input - seed string
 */
export function fnv1aHex(input: string): string {
  const h = fnv1a32(input);
  return h.toString(16).padStart(8, "0");
}

/**
 * Returns a 16-char hex digest from two independent FNV-1a rounds, used when
 * longer session ids are needed without reaching for crypto randomness.
 *
 * @param input - seed string
 */
export function fnv1aHex16(input: string): string {
  const low = fnv1a32(input);
  const high = fnv1a32(`__high__:${input}`);
  return `${high.toString(16).padStart(8, "0")}${low.toString(16).padStart(8, "0")}`;
}

// ---------------------------------------------------------------------------
// Merged from request-helpers.ts — validating id generators (canonical).
// v2.1.14 merge: these replace request.ts's non-validating wrappers; the ids
// stay deterministic via the canonical generateDeterministicId above.
// ---------------------------------------------------------------------------

/**
 * Alias kept for fingerprint.ts compatibility.
 */
export const fnv1aHash = fnv1a32;

// ---------------------------------------------------------------------------
// Model helpers — 2026 support, variant extraction, cli-only detection
// ---------------------------------------------------------------------------

/**
 * Normalizes model id — trims, lowercases for detection, preserves original case for request.
 * Also strips antigravity- prefix for internal detection but keeps original model field elsewhere.
 *
 * @param modelId - raw model string
 * @returns object with base, original, normalized
 */
export function parseModelId(modelId: string): {
  original: string;
  normalized: string;
  base: string;
  variantSuffixes: string[];
} {
  if (!modelId || typeof modelId !== "string") {
    throw new RequestTransformationError("model id must be non-empty string", "INVALID_MODEL");
  }
  const original = modelId.trim();
  if (!original) throw new RequestTransformationError("model id empty after trim", "INVALID_MODEL");
  const lower = original.toLowerCase();
  // Extract antigravity- prefix if present
  const withoutAntigravity = lower.startsWith("antigravity-") ? lower.slice("antigravity-".length) : lower;
  // Variant suffixes like -customtools, -thinking-low, -thinking-max
  const variantSuffixes: string[] = [];
  let base = withoutAntigravity;

  // Known suffixes to peel
  const peelSuffixes = [
    "-customtools",
    "-search",
    "-grounding",
    "-thinking-max",
    "-thinking-low",
    "-thinking-medium",
    "-thinking-high",
    "-thinking-minimal",
    "-thinking",
  ];
  // Peel iteratively from end
  let peeled = true;
  while (peeled) {
    peeled = false;
    for (const sfx of peelSuffixes) {
      if (base.endsWith(sfx)) {
        variantSuffixes.unshift(sfx.replace(/^-/, ""));
        base = base.slice(0, -sfx.length);
        peeled = true;
        break;
      }
    }
  }

  return { original, normalized: withoutAntigravity, base, variantSuffixes };
}

// v2.1.15 Phase A: isGeminiCLIOnlyModel moved to models.ts (this exact
// implementation is the canonical one) — imported + re-exported at the top
// of this file.

// ============================================================================
// 03. isLikelyAntigravityOnlyModel()
// ============================================================================

const ANTIGRAVITY_ONLY_EXACT = new Set<string>([
  "antigravity-gemini-3-pro",
  "antigravity-gemini-3.1-pro",
  "antigravity-gemini-3-flash",
  "antigravity-claude-sonnet-4-6",
  "antigravity-claude-opus-4-6-thinking",
  "gemini-3.1-pro-preview-customtools",
  "gemini-3.1-pro-preview-customtools-thinking",
  "antigravity-gemini-3-pro-thinking",
  "antigravity-gemini-3.1-pro-thinking",
]);

/**
 * Detecta se modelo só funciona via endpoint Antigravity (cloudcode-pa v1internal)
 * e não via genai público. Heurística baseada em prefixos e sufixos.
 *
 * @param modelId - ID do modelo (ex: "antigravity-claude-opus-4-6-thinking")
 * @returns true se provavelmente só funciona em Antigravity
 *
 * Regras:
 * - qualquer modelo começando com antigravity- => true
 * - contém "claude" => true (Claude só via bypass Antigravity)
 * - contém "customtools" => true (customtools é feature Antigravity 2026)
 * - está no set ANTIGRAVITY_ONLY_EXACT
 * - contém "rising-fact" ou "unwritten-orb" etc? Não, esses são projects, não modelos
 */
export function isLikelyAntigravityOnlyModel(modelId: string): boolean {
  if (!modelId || typeof modelId !== "string") return false;
  const id = modelId.trim().toLowerCase();
  if (!id) return false;

  if (id.startsWith("antigravity-")) return true;
  if (ANTIGRAVITY_ONLY_EXACT.has(id)) return true;
  if (id.includes("claude")) return true;
  if (id.includes("customtools")) return true;
  if (id.includes("antigravity")) return true;
  // modelos 3.1 preview com sufixo custom são Antigravity-only na prática
  if (id.includes("3.1") && id.includes("custom")) return true;
  // modelos com thinking + antigravity family
  if (id.includes("-thinking") && id.includes("gemini-3")) {
    // gemini-3 pro nativo não tem thinking nativo, só via antigravity
    // mas mantém simples: se for preview thinking também é antigravity-only
    if (id.startsWith("antigravity-") || id.includes("preview")) {
      // evita falso positivo para gemini-3-pro-preview que é nativo, então só true se tem thinking
      if (id.includes("thinking")) return true;
    }
  }
  return false;
}

// v2.1.15 Phase A: getEndpointsForModel moved to models.ts (this exact
// implementation is the canonical one) — imported + re-exported at the top
// of this file.

// ============================================================================
// 10. extractVariants()
// ============================================================================

export interface ExtractVariantsResult {
  input: string;
  base: string;
  isAntigravity: boolean;
  isThinking: boolean;
  isCustomTools: boolean;
  isPreview: boolean;
  family: string;
  variants: string[]; // todas variantes geradas
  candidatesInCatalog: string[]; // filtradas que existem em MODELS_2026
  relatedModels: Array<{ id: string; inCatalog: boolean }>;
}

/**
 * Extrai variantes de um modelId, removendo prefixos/sufixos e gerando candidatos.
 *
 * Ex: "antigravity-claude-opus-4-6-thinking" =>
 *   base: "claude-opus-4-6"
 *   variants: ["antigravity-claude-opus-4-6-thinking", "antigravity-claude-opus-4-6", "claude-opus-4-6-thinking", "claude-opus-4-6", ...]
 */
export function extractVariants(modelId: string): ExtractVariantsResult {
  if (!modelId || typeof modelId !== "string") {
    return {
      input: String(modelId),
      base: String(modelId),
      isAntigravity: false,
      isThinking: false,
      isCustomTools: false,
      isPreview: false,
      family: String(modelId),
      variants: [],
      candidatesInCatalog: [],
      relatedModels: [],
    };
  }

  const original = modelId.trim();
  const lower = original.toLowerCase();

  const isAntigravity = lower.startsWith("antigravity-") || lower.includes("antigravity");
  const isThinking = lower.includes("thinking");
  const isCustomTools =
    lower.includes("customtools") || lower.includes("custom_tools") || lower.includes("custom-tools");
  const isPreview = lower.includes("preview");

  // Remove prefixo antigravity-
  let base = lower;
  if (base.startsWith("antigravity-")) base = base.slice("antigravity-".length);

  // Remove sufixos iterativamente: -thinking, -customtools, -preview-customtools, -preview, -custom
  const suffixes = [
    "-thinking",
    "-customtools",
    "-custom_tools",
    "-custom-tools",
    "-preview-customtools",
    "-preview",
    "-custom",
  ];
  let changed = true;
  while (changed) {
    changed = false;
    for (const suf of suffixes) {
      if (base.endsWith(suf)) {
        base = base.slice(0, -suf.length);
        changed = true;
        break;
      }
    }
  }

  // base limpo ainda pode ter -preview no meio? Remove novamente
  // family é base + heurística de família (ex: gemini-3-pro)
  const family = base;

  // Gera variantes combinatórias
  const variantSet = new Set<string>();

  const prefixes = ["", "antigravity-"];
  const suffixCombos = ["", "-preview", "-preview-customtools", "-customtools", "-thinking", "-preview-thinking"];

  // Gera todas combinações prefixo + base + sufixo
  for (const pre of prefixes) {
    for (const suf of suffixCombos) {
      variantSet.add(`${pre}${base}${suf}`);
    }
  }

  // Adiciona também variações com base original + antigravity
  variantSet.add(original.toLowerCase());
  variantSet.add(`antigravity-${base}`);
  if (isThinking) {
    variantSet.add(`${base}-thinking`);
    variantSet.add(`antigravity-${base}-thinking`);
  }
  if (isCustomTools) {
    variantSet.add(`${base}-preview-customtools`);
    variantSet.add(`antigravity-${base}-preview-customtools`);
    variantSet.add(`${base}-customtools`);
  }

  // Variantes específicas Claude
  if (base.includes("claude")) {
    variantSet.add(`antigravity-${base}`);
    variantSet.add(`antigravity-${base}-thinking`);
    variantSet.add(`${base}-thinking`);
  }

  // Variantes gemini 2.5/3.x
  if (base.startsWith("gemini-")) {
    variantSet.add(base);
    variantSet.add(`${base}-preview`);
    variantSet.add(`antigravity-${base}`);
    // gemini-3-pro => gemini-3-pro-preview
    if (!base.includes("preview") && base.match(/^gemini-\d/)) {
      variantSet.add(`${base}-preview`);
      variantSet.add(`antigravity-${base}`);
    }
  }

  // Normaliza e deduplica, remove vazios
  const variants = Array.from(variantSet)
    .filter((v) => v && v.length > 2)
    .sort();

  const candidatesInCatalog = variants.filter((v) => MODELS_2026_SET.has(v));
  const relatedModels = variants.map((id) => ({ id, inCatalog: MODELS_2026_SET.has(id) }));

  return {
    input: original,
    base,
    isAntigravity,
    isThinking,
    isCustomTools,
    isPreview,
    family,
    variants,
    candidatesInCatalog,
    relatedModels,
  };
}

/**
 * Helper que extrai variantes de lista ou objeto
 */
export function extractVariantsFromAny(input: unknown): ExtractVariantsResult[] {
  if (typeof input === "string") return [extractVariants(input)];
  if (Array.isArray(input)) {
    const out: ExtractVariantsResult[] = [];
    for (const item of input) {
      if (typeof item === "string") out.push(extractVariants(item));
      else if (isPlainObject(item) && typeof (item as any).id === "string") out.push(extractVariants((item as any).id));
      else if (isPlainObject(item) && typeof (item as any).model === "string")
        out.push(extractVariants((item as any).model));
    }
    return out;
  }
  if (isPlainObject(input)) {
    const keys = Object.keys(input as object);
    // se chaves parecem model ids
    if (keys.every((k) => k.includes("gemini") || k.includes("claude") || k.includes("antigravity"))) {
      return keys.map((k) => extractVariants(k));
    }
  }
  return [];
}

// ---------------------------------------------------------------------------
// Merged: model detection and variant extraction
// ---------------------------------------------------------------------------

/**
 * Detailed model variant extraction result used for routing and budgets.
 */
export interface ModelVariantInfo {
  original: string;
  normalized: string;
  base: string;
  family: "gemini" | "claude" | "unknown";
  isPreview: boolean;
  isThinking: boolean;
  thinkingVariant: "low" | "max" | null;
  isCustomTools: boolean;
  isClaude: boolean;
  isGemini: boolean;
  isAntigravityWrapper: boolean;
  budgetHint?: number | undefined;
  group: "antigravity" | "gemini-cli";
}

/**
 * Extracts routing/budget metadata from a model id: family detection, preview
 * and customtools flags, thinking-low/max variant, antigravity wrapper and the
 * suggested quota group.
 *
 * @param modelId - raw model id
 * @throws {RequestHelpersError} when modelId is empty
 */
export function extractModelVariant(modelId: string): ModelVariantInfo {
  if (typeof modelId !== "string" || modelId.trim() === "") {
    throw new RequestHelpersError("extractModelVariant requires non-empty modelId", "INVALID_MODEL");
  }
  const original = modelId.trim();
  const normalized = original.toLowerCase();

  const isPreview = normalized.includes("preview");
  const isThinking = normalized.includes("thinking");
  const isCustomTools = normalized.includes("customtools");
  const isClaude = normalized.includes("claude");
  const isGemini = normalized.includes("gemini");
  const isAntigravityWrapper = normalized.startsWith("antigravity-");

  let thinkingVariant: "low" | "max" | null = null;
  if (normalized.includes("-low") || normalized.endsWith("low")) {
    if (normalized.includes("thinking-low") || normalized.match(/-low$/)) {
      thinkingVariant = "low";
    }
  }
  if (normalized.includes("-max") || normalized.endsWith("max")) {
    if (normalized.includes("thinking-max") || normalized.match(/-max$/)) {
      thinkingVariant = "max";
    }
  }
  if (normalized.includes("max") && thinkingVariant !== "low") {
    if (isThinking) thinkingVariant = normalized.includes("max") ? "max" : thinkingVariant;
  }

  let family: ModelVariantInfo["family"] = "unknown";
  if (isClaude) family = "claude";
  else if (isGemini) family = "gemini";

  let base = normalized;
  base = base.replace(/^antigravity-/, "");
  base = base.replace(/-preview/g, "");
  base = base.replace(/-customtools/g, "");
  base = base.replace(/-thinking-max/g, "");
  base = base.replace(/-thinking-low/g, "");
  base = base.replace(/-thinking/g, "");
  if (isClaude) {
    base = base.replace(/-low$/g, "");
    base = base.replace(/-max$/g, "");
  }
  base = base.replace(/--+/g, "-").replace(/^-|-$/g, "");

  const group: ModelVariantInfo["group"] = isGeminiCLIOnlyModel(original) ? "gemini-cli" : "antigravity";

  const budgetHint = isThinking
    ? getThinkingBudgetForVariant(thinkingVariant)
    : isGemini
      ? THINKING_BUDGET_MAP.medium
      : undefined;

  return {
    original,
    normalized,
    base,
    family,
    isPreview,
    isThinking,
    thinkingVariant,
    isCustomTools,
    isClaude,
    isGemini,
    isAntigravityWrapper,
    budgetHint,
    group,
  };
}

/**
 * Checklist alias of {@link extractModelVariant}.
 */
export const parseModelVariant = extractModelVariant;

// ---------------------------------------------------------------------------
// Headers — fingerprint, User-Agent dynamic, strip forbidden
// ---------------------------------------------------------------------------

/**
 * Builds dynamic User-Agent antigravity/{version} {os}/{arch}.
 * Third-person observer copies AM behavior to bypass ban on 1.11.5.
 *
 * @param version - optional semver
 */
export function buildDynamicUserAgent(version?: string): string {
  const ver = version && /^\d+\.\d+\.\d+/.test(version) ? version.trim() : ANTIGRAVITY_VERSION_FALLBACK;
  try {
    const plat = normalizePlatform(os.platform());
    const arch = normalizeArch(os.arch());
    return `antigravity/${ver} ${plat}/${arch}`;
  } catch {
    return `antigravity/${ver}`;
  }
}

/**
 * Builds Client-Metadata header.
 *
 * @param version - optional version
 */

/**
 * Builds X-Goog-Api-Client header — only for gemini-cli mode.
 *
 * @param version - optional
 */
export function buildApiClient(version?: string): string {
  const ver = version && /^\d+\.\d+\.\d+/.test(version) ? version.trim() : ANTIGRAVITY_VERSION_FALLBACK;
  try {
    const nodeVer = process.versions.node ?? "20.0.0";
    return `antigravity/${ver} gl-node/${nodeVer} gax/4.9.0 grpc/1.14.0`;
  } catch {
    return `antigravity/${ver}`;
  }
}

/**
 * Generates fingerprint headers for given style.
 * Observer knows:
 * - AM only sends User-Agent on content requests (not on onboard/load)
 * - Never sends X-Goog-QuotaUser nor X-Client-Device-Id
 * - Gemini CLI includes X-Goog-Api-Client
 *
 * @param style - 'antigravity' or 'gemini-cli'
 * @param version - optional antigravity version
 * @returns headers record
 */
// v2.1.15 Phase B: getFingerprintHeaders moved to fingerprint.js (identity owner).

/**
 * Alias required by checklist naming: strip x-goog-user-project header explicit.
 *
 * @param headers - headers map
 * @returns cleaned map
 */
export function stripXGoogUserProjectHeader(headers: Record<string, string>): Record<string, string> {
  return stripForbiddenHeaders(headers);
}

// ---------------------------------------------------------------------------
// Merged: transport helpers — retry classification and header stripping
// ---------------------------------------------------------------------------

/**
 * Checks whether an HTTP status should trigger cascade retry:
 * 429, 403, 404 and the whole 5xx range.
 *
 * @param status - HTTP status code
 */

// ---------------------------------------------------------------------------
// Tool name sanitization & validation
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// JSON Schema cleaning — fixes Invalid JSON payload Unknown name 'parameters'
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Merged: strict JSON schema cleaning for tool definitions
// ---------------------------------------------------------------------------

/**
 * Recursively cleans a JSON Schema node down to only the keys listed in
 * {@link ALLOWED_SCHEMA_KEYS}. This removes $schema/$ref/title/
 * additionalProperties/default/examples and similar unknown names that trigger
 * "Invalid JSON payload Unknown name" errors upstream.
 *
 * v2.1.14 merge note: renamed from cleanJsonSchema (request-helpers.ts) to
 * cleanJsonSchemaStrict; the tolerant Gemini-shaping normalizer from
 * request.ts owns the cleanJsonSchema name. ALLOWED_SCHEMA_KEYS is now the
 * full allowlist Set from request.ts; the switch below still only emits the
 * six core keys, so the observable behavior of this strict cleaner is
 * unchanged by the merge.
 *
 * @param schema - raw schema node
 * @param depth - recursion guard, throws past depth 12
 * @returns cleaned schema object or undefined when not salvageable
 * @throws {RequestHelpersError} when depth exceeds 12 (possible circular schema)
 */
export function cleanJsonSchemaStrict(schema: unknown, depth = 0): Record<string, unknown> | undefined {
  if (depth > 12) {
    throw new RequestHelpersError("JSON schema depth >12 — possible circular", "SCHEMA_TOO_DEEP");
  }
  if (!isPlainObject(schema)) {
    return undefined;
  }

  const out: Record<string, unknown> = {};

  for (const key of Object.keys(schema)) {
    if (!ALLOWED_SCHEMA_KEYS.has(key)) {
      continue;
    }

    const val = (schema as Record<string, unknown>)[key];

    switch (key) {
      case "type": {
        if (typeof val === "string" && ["object", "string", "number", "integer", "boolean", "array"].includes(val)) {
          out.type = val;
        }
        break;
      }
      case "description": {
        if (typeof val === "string") out.description = val.slice(0, 1024);
        break;
      }
      case "enum": {
        if (Array.isArray(val)) {
          const filtered = val
            .filter((e) => typeof e === "string" || typeof e === "number" || typeof e === "boolean")
            .slice(0, 100);
          if (filtered.length > 0) out.enum = filtered;
        }
        break;
      }
      case "required": {
        if (Array.isArray(val)) {
          const req = val.filter((r) => typeof r === "string").slice(0, 100);
          if (req.length > 0) out.required = req;
        }
        break;
      }
      case "properties": {
        if (isPlainObject(val)) {
          const props: Record<string, unknown> = {};
          for (const propName of Object.keys(val)) {
            const propSchema = (val as Record<string, unknown>)[propName];
            const cleaned = cleanJsonSchemaStrict(propSchema, depth + 1);
            if (cleaned) {
              props[propName] = cleaned;
            }
          }
          out.properties = props;
        }
        break;
      }
      case "items": {
        const cleaned = cleanJsonSchemaStrict(val, depth + 1);
        if (cleaned) out.items = cleaned;
        break;
      }
      default:
        break;
    }
  }

  return out;
}

/**
 * Cleaned tool definition compatible with Gemini functionDeclarations.
 */
export interface CleanedTool {
  name: string;
  description?: string | undefined;
  parameters: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[] | undefined;
    description?: string | undefined;
  };
}

/**
 * Cleans a single raw tool definition (OpenAI wrapper, Anthropic input_schema
 * or plain parameters) into a {@link CleanedTool} with a sanitized name and a
 * root-object schema enforced.
 *
 * v2.1.14 merge note: keeps its name; it now builds on
 * cleanJsonSchemaStrict (the strict cleaner formerly exported as the
 * request-helpers cleanJsonSchema).
 *
 * @param raw - raw tool definition
 * @throws {RequestHelpersError} on missing/invalid objects or names
 */
export function cleanRawToolSchema(raw: unknown): CleanedTool {
  if (!isPlainObject(raw) && !(raw as any)?.function) {
    throw new RequestHelpersError(`cleanToolSchema expects object, got ${typeof raw}`, "INVALID_TOOL_SCHEMA");
  }

  // Unwrap OpenAI style { type:"function", function:{...} }
  let src: Record<string, unknown> = raw as Record<string, unknown>;
  if (isPlainObject((src as any).function)) {
    src = (src as any).function as Record<string, unknown>;
  }

  const potentialSchemas = [
    (src as any).parameters,
    (src as any).input_schema,
    (src as any).schema,
    (src as any).parameters_json,
  ];

  let parametersRaw: unknown = undefined;
  for (const cand of potentialSchemas) {
    if (cand && isPlainObject(cand)) {
      parametersRaw = cand;
      break;
    }
  }

  if (!parametersRaw) {
    parametersRaw = { type: "object", properties: {} };
  }

  const cleanedParams = cleanJsonSchemaStrict(parametersRaw, 0) ?? { type: "object", properties: {} };

  // Enforce root object type required by Gemini functionDeclarations
  if ((cleanedParams as any).type !== "object") {
    (cleanedParams as any).type = "object";
  }
  if (!(cleanedParams as any).properties) {
    (cleanedParams as any).properties = {};
  }

  const rawName = (src as any).name;
  if (typeof rawName !== "string" || rawName.trim() === "") {
    throw new RequestHelpersError("tool schema missing name", "INVALID_TOOL_NAME");
  }
  const sanitized = sanitizeToolName(rawName);

  const descriptionRaw = (src as any).description;
  const description = typeof descriptionRaw === "string" ? descriptionRaw.slice(0, 4096) : undefined;

  return {
    name: sanitized,
    description,
    parameters: cleanedParams as unknown as CleanedTool["parameters"],
  };
}

/**
 * Cleans an array of raw tools into deduplicated {@link CleanedTool} entries
 * (last wins per sanitized name), capped at {@link MAX_TOOLS_PER_REQUEST}.
 * Invalid tools are skipped rather than failing the request.
 *
 * @param tools - array of raw tool definitions
 * @throws {RequestHelpersError} when input is not an array
 */
export function cleanToolsArray(tools: unknown): CleanedTool[] {
  if (!Array.isArray(tools)) {
    throw new RequestHelpersError("cleanToolsArray expects array", "INVALID_TOOLS");
  }
  const map = new Map<string, CleanedTool>();
  for (const t of tools) {
    try {
      const cleaned = cleanRawToolSchema(t);
      map.set(cleaned.name, cleaned);
      if (map.size >= MAX_TOOLS_PER_REQUEST) break;
    } catch {
      continue;
    }
  }
  return Array.from(map.values());
}

// ---------------------------------------------------------------------------
// Thinking blocks mapping
// ---------------------------------------------------------------------------

/**
 * Maps a thinking block to Gemini thought part.
 * For Gemini 3 and Claude via Antigravity, thought parts must have thought: true.
 * Optionally includes thoughtSignature for multi-turn preservation.
 *
 * @param text - thinking text
 * @param signature - optional signature for LRU cache in streaming.ts
 * @returns GeminiPart
 */
export function mapThinkingBlock(text: string, signature?: string): GeminiPart {
  if (!text || typeof text !== "string") text = String(text ?? "");
  const part: GeminiPart = {
    text,
    thought: true,
  };
  if (signature && typeof signature === "string" && signature.length > 0) {
    part.thoughtSignature = signature.slice(0, 10000);
  }
  return part;
}

/**
 * Sorts parts so that thought parts come first, then text, then function calls.
 * Required because Gemini/Claude require thinking block order validation.
 *
 * @param parts - parts array
 * @returns sorted parts
 */
export function sortThoughtFirst(parts: GeminiPart[]): GeminiPart[] {
  if (!Array.isArray(parts)) return [];
  const thoughts = parts.filter((p) => p.thought === true);
  const others = parts.filter((p) => p.thought !== true);
  // Preserve relative order within groups, thoughts first
  return [...thoughts, ...others];
}

/**
 * Filters and normalizes thinking content — removes empty thinking and ensures
 * signature preservation.
 *
 * @param parts - incoming parts
 * @returns filtered parts
 */
export function filterAndMapThinkingParts(parts: any[]): GeminiPart[] {
  const out: GeminiPart[] = [];
  for (const p of parts) {
    if (!p) continue;
    // Already Gemini thought
    if (p.thought === true && p.text) {
      out.push(mapThinkingBlock(String(p.text), p.thoughtSignature));
      continue;
    }
    // Anthropic thinking type
    if (p.type === "thinking" || p.type === "reasoning") {
      const txt = p.thinking ?? p.text ?? p.reasoning ?? "";
      const sig = p.signature ?? p.thoughtSignature;
      if (txt) out.push(mapThinkingBlock(String(txt), sig ? String(sig) : undefined));
      continue;
    }
    // Direct string thinking marker
    if (typeof p === "object" && "thinking" in p && typeof p.thinking === "string") {
      out.push(mapThinkingBlock(p.thinking, p.signature));
      continue;
    }
    // Keep other parts as-is for later mapping (text, etc)
    out.push(p);
  }
  return sortThoughtFirst(out);
}

/**
 * Detects thinking blocks that must be filtered before dispatch: thought flags,
 * type discriminators, reasoning_content/reasoning fields.
 *
 * @param block - any part-like object
 */
export function isThinkingBlock(block: unknown): boolean {
  if (!block || typeof block !== "object") return false;
  const b = block as Record<string, unknown>;

  if ((b as any).thought === true) return true;
  if ((b as any).thinking === true) return true;

  const t = (b as any).type;
  if (typeof t === "string") {
    const lt = t.toLowerCase();
    if (lt === "thinking" || lt === "reasoning" || lt === "thought" || lt === "internal_reasoning") return true;
  }

  if ("thinking" in b && typeof b.thinking === "string" && (b as any).type === "thinking") return true;
  if ("reasoning_content" in b) return true;
  if ("reasoning" in b && typeof b.reasoning === "string") return true;

  return false;
}

// ---------------------------------------------------------------------------
// Merged: standalone thinking-block filters
// ---------------------------------------------------------------------------

/**
 * Filters thinking blocks from a parts array.
 *
 * @param parts - array of parts in any shape
 * @throws {RequestHelpersError} when input is not an array
 */
export function filterThinkingBlocksFromParts(parts: unknown): GeminiPart[] {
  if (!Array.isArray(parts)) {
    throw new RequestHelpersError("filterThinkingBlocksFromParts expects array", "INVALID_PARTS");
  }
  const filtered: GeminiPart[] = [];
  for (const p of parts) {
    if (isThinkingBlock(p)) continue;
    if (isPlainObject(p)) {
      const obj = p as Record<string, unknown>;
      if ((obj as any).thought === true) continue;
    }
    filtered.push(p as GeminiPart);
  }
  return filtered;
}

/**
 * Filters thinking parts inside each Gemini message, dropping messages that
 * become empty (including system).
 *
 * @param messages - Gemini-shaped messages
 * @throws {RequestHelpersError} when input is not an array
 */
export function filterThinkingBlocksFromMessages(messages: unknown): GeminiMessage[] {
  if (!Array.isArray(messages)) {
    throw new RequestHelpersError("filterThinkingBlocksFromMessages expects array", "INVALID_MESSAGES");
  }
  const out: GeminiMessage[] = [];
  for (const raw of messages) {
    if (!isPlainObject(raw)) continue;
    const msg = raw as { role?: string; parts?: unknown[] };
    const role = msg.role;
    const partsRaw = msg.parts;
    if (!Array.isArray(partsRaw)) continue;
    const filteredParts = filterThinkingBlocksFromParts(partsRaw);
    if (filteredParts.length === 0) {
      if (role === "system") continue;
      continue;
    }
    out.push({
      role: (role as GeminiMessage["role"]) ?? "user",
      parts: filteredParts,
      _rawRole: (raw as any)._rawRole,
    });
  }
  return out;
}

/**
 * Auto-detecting filter: routes message arrays (role+parts items) to
 * {@link filterThinkingBlocksFromMessages} and everything else to
 * {@link filterThinkingBlocksFromParts}.
 *
 * Named `filterThinkingBlocksAuto` because the historical overloaded
 * `filterThinkingBlocks` keeps its original tag-stripping/string semantics.
 *
 * @param input - parts array or messages array
 * @throws {RequestHelpersError} when input is not an array
 */
export function filterThinkingBlocksAuto(input: unknown): unknown[] {
  if (!Array.isArray(input)) {
    throw new RequestHelpersError("filterThinkingBlocks expects array", "INVALID_INPUT");
  }
  if (input.length === 0) return [];

  const first = input[0] as any;
  if (isPlainObject(first) && "role" in first && "parts" in first) {
    return filterThinkingBlocksFromMessages(input);
  }
  return filterThinkingBlocksFromParts(input);
}

// ============================================================================
// 06. filterThinkingBlocks()
// ============================================================================

export interface ThoughtLikePart {
  thought?: boolean;
  thinking?: boolean;
  type?: string;
  text?: string;
  content?: string;
  reasoning?: string;
  [k: string]: unknown;
}

/**
 * Remove blocos de thinking/reasoning de conteúdo.
 * Suporta:
 * - string: remove tags <thinking>...</thinking>, <thought>...</thought>, <think>...</think>
 * - array de parts Gemini (com thought:true) => filtra
 * - array de blocks OpenCode-like
 */

const THINKING_TAG_REGEX = /<(thinking|thought|think|reasoning|Thought|Thinking)[^>]*>[\s\S]*?<\/\1\s*>/gi;
const THINKING_SELF_CLOSED_REGEX = /<(thinking|thought|think)[^>]*\/>/gi;
const THINKING_INLINE_PREFIX = /^(?:Thought:|Thinking:|Reasoning:)\s*/i;

export function filterThinkingBlocks(input: string): string;
export function filterThinkingBlocks<T extends ThoughtLikePart>(input: T[]): T[];
export function filterThinkingBlocks(input: unknown): unknown;
export function filterThinkingBlocks(input: unknown): unknown {
  if (typeof input === "string") {
    let out = input;
    // remove blocos com tags
    out = out.replace(THINKING_TAG_REGEX, "");
    out = out.replace(THINKING_SELF_CLOSED_REGEX, "");
    // remove múltiplas linhas que são só prefixo Thinking:
    // também limpa artefactos "<thinking>" soltos
    out = out.replace(/<\/?thinking[^>]*>/gi, "");
    out = out.replace(/<\/?thought[^>]*>/gi, "");
    out = out.replace(/<\/?think[^>]*>/gi, "");
    out = out.replace(/<\/?reasoning[^>]*>/gi, "");
    // remove linhas que começam com Thought:
    out = out
      .split("\n")
      .filter((line) => {
        const trimmed = line.trim();
        if (!trimmed) return true;
        // se linha inteira é marcador de thinking, remove
        if (/^(Thought|Thinking|Reasoning):\s*$/i.test(trimmed)) return false;
        return true;
      })
      .join("\n");
    // trim excesso de espaços em branco deixados
    out = out.replace(/\n{3,}/g, "\n\n").trim();
    return out;
  }

  if (Array.isArray(input)) {
    return (input as ThoughtLikePart[]).filter((part) => {
      if (!part || typeof part !== "object") return true;
      // Gemini: { thought: true }
      if ((part as any).thought === true) return false;
      if ((part as any).thinking === true) return false;
      const t = (part as any).type?.toLowerCase?.();
      if (t === "thinking" || t === "thought" || t === "reasoning") return false;
      // conteúdo textual que é apenas thinking tag
      const text = (part as any).text ?? (part as any).content ?? (part as any).reasoning;
      if (typeof text === "string") {
        const trimmed = text.trim();
        if (!trimmed) return true;
        // se conteúdo inteiro está envolto em thinking tags, filtra bloco inteiro
        if (/^<(thinking|thought|think|reasoning)[\s\S]*<\/(thinking|thought|think|reasoning)>$/i.test(trimmed))
          return false;
        // se contém apenas tag, filtra
        if (/^<\/?(thinking|thought|think|reasoning)[^>]*>$/i.test(trimmed)) return false;
      }
      return true;
    });
  }

  // se objeto único com parts
  if (isPlainObject(input)) {
    const obj = input as Record<string, unknown>;
    if (Array.isArray(obj["parts"])) {
      return {
        ...obj,
        parts: filterThinkingBlocks(obj["parts"] as unknown[]),
      };
    }
    if (Array.isArray(obj["content"])) {
      return {
        ...obj,
        content: filterThinkingBlocks(obj["content"] as unknown[]),
      };
    }
  }

  return input;
}

// ---------------------------------------------------------------------------
// Google Search tool injection
// ---------------------------------------------------------------------------

/**
 * Definition for google_search built-in grounding tool wrapped as function declaration
 * for compatibility with OpenCode → Gemini flow.
 * Observer notes: original plugin shekohex uses wrapper to call separate search API.
 */
export const GOOGLE_SEARCH_FUNCTION_DECLARATION = {
  name: "google_search",
  description:
    "Search the web for real-time information, factual grounding, current events, documentation, and recent knowledge. Use when user asks for latest information, news, or requires browsing to answer.",
  parameters: {
    type: "OBJECT",
    properties: {
      query: {
        type: "STRING",
        description: "Search query string, 3-10 words focused keywords",
      },
    },
    required: ["query"],
  },
} as const;

export const URL_CONTEXT_FUNCTION_DECLARATION = {
  name: "url_context",
  description: "Fetch and provide context from a URL for grounding.",
  parameters: {
    type: "OBJECT",
    properties: {
      url: {
        type: "STRING",
        description: "HTTP(S) URL to fetch",
      },
    },
    required: ["url"],
  },
} as const;

/**
 * Injects google_search tool into declarations if enabled and not already present.
 *
 * @param declarations - existing declarations array
 * @param enabled - whether injection enabled
 * @param includeUrlContext - whether to also inject url_context
 * @returns new declarations array with injection
 */
export function injectGoogleSearchTool(
  declarations: Array<{ name: string; description?: string; parameters?: any; originalName: string }>,
  enabled?: boolean,
  includeUrlContext = false,
): Array<{ name: string; description?: string; parameters?: any; originalName: string }> {
  if (!enabled) return declarations;
  const existingNames = new Set(declarations.map((d) => d.name.toLowerCase()));
  const result = [...declarations];

  if (!existingNames.has("google_search")) {
    result.push({
      name: "google_search",
      description: GOOGLE_SEARCH_FUNCTION_DECLARATION.description,
      parameters: GOOGLE_SEARCH_FUNCTION_DECLARATION.parameters,
      originalName: "google_search",
    });
  }

  if (includeUrlContext && !existingNames.has("url_context")) {
    result.push({
      name: "url_context",
      description: URL_CONTEXT_FUNCTION_DECLARATION.description,
      parameters: URL_CONTEXT_FUNCTION_DECLARATION.parameters,
      originalName: "url_context",
    });
  }

  return result;
}

// ---------------------------------------------------------------------------
// Content helpers — inlineData, data URI, function args parsing
// ---------------------------------------------------------------------------

/**
 * Parses OpenAI tool arguments which may be stringified JSON.
 *
 * @param args - args string or object
 * @returns parsed object
 */
export function parseFunctionArgs(args: string | object | any): Record<string, any> {
  if (!args) return {};
  if (typeof args === "object" && !Array.isArray(args)) return args as Record<string, any>;
  if (typeof args === "string") {
    const trimmed = args.trim();
    if (!trimmed) return {};
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === "object") return parsed;
      return { value: parsed };
    } catch {
      // If not JSON, treat as single string value if schema expects string, else wrap
      return { query: trimmed, input: trimmed };
    }
  }
  return { value: args };
}

// v2.1.16: dead parseDataUri was deleted — zero callers repo-wide. The live
// data-URI parser is the private parseDataUrl below (near-twin that also
// guards against non-string input), used by contentPartsToGeminiParts.

/**
 * Attempts to extract last user prompt text for deterministic user_prompt_id.
 *
 * @param messages - messages array
 * @returns last user text or fallback
 */
export function extractLastUserPrompt(messages: OpenCodeMessage[]): string {
  if (!Array.isArray(messages) || messages.length === 0) return "empty-prompt";
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (!m) continue;
    if (String(m.role).toLowerCase() !== "user") continue;
    const c = m.content;
    if (typeof c === "string" && c.trim()) return c.trim().slice(0, 2000);
    if (Array.isArray(c)) {
      for (const part of c) {
        if (!part) continue;
        if (part.type === "text" && part.text && String(part.text).trim()) {
          return String(part.text).trim().slice(0, 2000);
        }
        if (typeof part === "object" && "text" in part && typeof (part as any).text === "string") {
          const t = String((part as any).text).trim();
          if (t) return t.slice(0, 2000);
        }
      }
    }
  }
  // Fallback: stringify whole
  try {
    return JSON.stringify(messages).slice(0, 2000);
  } catch {
    return "fallback-prompt";
  }
}

// ============================================================================
// 07. normalizeMessages() - OpenCode -> Gemini
// ============================================================================

export interface OpenCodeContentPart {
  type?: string; // "text" | "image_url" | "tool_call" etc
  text?: string;
  image_url?: { url: string; detail?: string };
  // tool
  id?: string;
  tool_call_id?: string;
  name?: string;
  // para compat
  function?: { name: string; arguments: string | object };
  [k: string]: unknown;
}

export interface OpenCodeToolCall {
  id: string;
  type: "function";
  function: { name: string; arguments: string | object };
}

export interface GeminiFunctionCall {
  name: string;
  args: Record<string, unknown>;
}

export interface GeminiFunctionResponse {
  name: string;
  response: Record<string, unknown>;
}

export interface NormalizedMessagesResult {
  systemInstruction?: GeminiSystemInstruction;
  contents: GeminiContent[];
  /** mensagens originais ignoradas por serem vazias */
  droppedCount: number;
}

/**
 * Converte data URL para mime + base64
 */
function parseDataUrl(url: string): { mimeType: string; data: string } | null {
  const m = url.match(/^data:([^;]+);base64,(.*)$/);
  if (!m) return null;
  return { mimeType: m[1]!, data: m[2]! };
}

function safeJsonParse(str: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(str);
    if (isPlainObject(parsed)) return parsed as Record<string, unknown>;
    // se não for objeto, encapsula
    return { result: parsed } as Record<string, unknown>;
  } catch {
    return null;
  }
}

function contentPartsToGeminiParts(content: string | OpenCodeContentPart[] | null | undefined): GeminiPart[] {
  if (content == null) return [];
  if (typeof content === "string") {
    if (!content.trim()) return [];
    return [{ text: content }];
  }
  if (Array.isArray(content)) {
    const parts: GeminiPart[] = [];
    for (const part of content) {
      if (!part) continue;
      if (typeof part === "string") {
        // fallback caso array contenha string
        if ((part as unknown as string).trim()) parts.push({ text: part as unknown as string });
        continue;
      }
      const p = part as OpenCodeContentPart;
      if (p.type === "text" && p.text) {
        parts.push({ text: p.text });
      } else if (p.type === "image_url" && p.image_url?.url) {
        const url = p.image_url.url;
        const data = parseDataUrl(url);
        if (data) {
          parts.push({ inlineData: data });
        } else {
          // se for https, Gemini prefere fileData, mas mantemos texto referência para evitar falha
          // poderia baixar, mas zero-dep: mantém como fileUri
          // detecta mime via extensão simples
          parts.push({ fileData: { mimeType: "image/jpeg", fileUri: url } });
        }
      } else if ((p.type === "image" || (p as any).inlineData) && (p as any).inlineData) {
        parts.push({ inlineData: (p as any).inlineData });
      } else if (p.text) {
        // fallback generico com text
        parts.push({ text: p.text });
      } else if ((p as any).content && typeof (p as any).content === "string") {
        parts.push({ text: (p as any).content });
      }
    }
    return parts;
  }
  return [];
}

/**
 * Normaliza lista de mensagens OpenCode (OpenAI-like) para formato Gemini
 * Cloud Code Assist v1internal.
 *
 * - system => systemInstruction (combinado)
 * - user => role user
 * - assistant => role model, com functionCall se tiver tool_calls
 * - tool => role user com functionResponse
 * - filtra thinking blocks automaticamente
 * - merge mensagens consecutivas de mesmo role
 *
 * @param messages - mensagens OpenCode
 * @param opts - includeSystemAsUser? Se true, system vai como user prefixado
 */
export function normalizeMessages(
  messages: OpenCodeMessage[],
  opts?: { mergeConsecutive?: boolean; includeSystemAsUser?: boolean; filterThinking?: boolean },
): NormalizedMessagesResult {
  const mergeConsecutive = opts?.mergeConsecutive ?? true;
  const includeSystemAsUser = opts?.includeSystemAsUser ?? false;
  const filterThinking = opts?.filterThinking ?? true;

  if (!Array.isArray(messages)) {
    return { contents: [], droppedCount: 0 };
  }

  const systemParts: GeminiPart[] = [];
  const contents: GeminiContent[] = [];
  let dropped = 0;

  for (const msg of messages) {
    if (!msg || typeof msg !== "object") {
      dropped++;
      continue;
    }
    const roleRaw = (msg.role ?? "user").toLowerCase();

    // SYSTEM
    if (roleRaw === "system") {
      const parts = contentPartsToGeminiParts(msg.content as any);
      if (parts.length === 0) {
        dropped++;
        continue;
      }
      const filtered = filterThinking ? (filterThinkingBlocks(parts) as GeminiPart[]) : parts;
      if (includeSystemAsUser) {
        // quando solicitado, system vira user com prefixo
        if (filtered.length > 0) {
          contents.push({ role: "user", parts: filtered.map((p) => (p.text ? { text: `[System] ${p.text}` } : p)) });
        }
      } else {
        systemParts.push(...filtered);
      }
      continue;
    }

    // TOOL -> functionResponse
    if (roleRaw === "tool") {
      const toolName = msg.name ?? (msg as any).tool_name ?? msg.tool_call_id ?? "unknown_tool";
      let responseContent: string;
      if (typeof msg.content === "string") responseContent = msg.content;
      else if (Array.isArray(msg.content)) {
        responseContent = (msg.content as OpenCodeContentPart[]).map((p) => p.text ?? "").join("\n");
      } else responseContent = String(msg.content ?? "");

      const parsed = safeJsonParse(responseContent);
      const response: Record<string, unknown> = parsed ?? { content: responseContent };

      const part: GeminiPart = {
        functionResponse: {
          name: toolName,
          response,
        },
      };
      // Gemini exige que functionResponse venha em role user
      contents.push({ role: "user", parts: [part] });
      continue;
    }

    // ASSISTANT -> model
    if (roleRaw === "assistant" || roleRaw === "model" || roleRaw === "bot") {
      const parts: GeminiPart[] = [];

      // text content
      const textParts = contentPartsToGeminiParts(msg.content as any);
      parts.push(...textParts);

      // tool_calls -> functionCall
      if (Array.isArray(msg.tool_calls)) {
        for (const tc of msg.tool_calls) {
          if (!tc || !tc.function?.name) continue;
          let args: Record<string, unknown> = {};
          const rawArgs = tc.function.arguments;
          if (typeof rawArgs === "string") {
            const parsed = safeJsonParse(rawArgs);
            args = parsed ?? { _raw: rawArgs };
            // se raw era string pura, tenta manter objeto
            if (!parsed) {
              // tenta parse novamente como objeto genérico
              try {
                args = JSON.parse(rawArgs) as Record<string, unknown>;
              } catch {
                args = { input: rawArgs };
              }
            }
          } else if (isPlainObject(rawArgs)) {
            args = rawArgs as Record<string, unknown>;
          }
          // sanitize function name via nossa validação
          const cleanName = sanitizeToolName(tc.function.name);
          parts.push({ functionCall: { name: cleanName, args } });
        }
      }

      if (parts.length === 0) {
        dropped++;
        continue;
      }
      const filtered = filterThinking ? (filterThinkingBlocks(parts) as GeminiPart[]) : parts;
      if (filtered.length === 0) {
        dropped++;
        continue;
      }
      contents.push({ role: "model", parts: filtered });
      continue;
    }

    // USER (default)
    {
      const parts = contentPartsToGeminiParts(msg.content as any);
      if (parts.length === 0) {
        dropped++;
        continue;
      }
      const filtered = filterThinking ? (filterThinkingBlocks(parts) as GeminiPart[]) : parts;
      if (filtered.length === 0) {
        dropped++;
        continue;
      }
      contents.push({ role: "user", parts: filtered });
    }
  }

  // Merge consecutivo mesmo role
  let finalContents = contents;
  if (mergeConsecutive && contents.length > 1) {
    const merged: GeminiContent[] = [];
    let cur: GeminiContent | null = null;
    for (const c of contents) {
      if (cur && cur.role === c.role) {
        cur.parts.push(...c.parts);
      } else {
        if (cur) merged.push(cur);
        cur = { role: c.role, parts: [...c.parts] };
      }
    }
    if (cur) merged.push(cur);
    finalContents = merged;
  }

  const result: NormalizedMessagesResult = {
    contents: finalContents,
    droppedCount: dropped,
  };

  if (systemParts.length > 0) {
    result.systemInstruction = { role: "system", parts: systemParts };
  }

  return result;
}

// ---------------------------------------------------------------------------
// Merged: message normalization (incoming shapes to Gemini messages)
// ---------------------------------------------------------------------------

/**
 * Normalizes any role spelling onto the Gemini system/user/model triad.
 * Tool-ish roles map to user because Cloud Code Assist expects
 * functionResponse parts inside a user turn.
 *
 * @param rawRole - incoming role string
 */
export function normalizeRole(rawRole: string): "system" | "user" | "model" {
  if (typeof rawRole !== "string") return "user";
  const l = rawRole.trim().toLowerCase();
  switch (l) {
    case "system":
    case "developer":
    case "system_instruction":
    case "instruction":
    case "sys":
      return "system";
    case "assistant":
    case "model":
    case "ai":
    case "bot":
    case "agent":
    case "assistant_model":
      return "model";
    case "user":
    case "human":
    case "end_user":
      return "user";
    case "tool":
    case "function":
    case "tool_result":
    case "tool_response":
    case "function_response":
    case "function_result":
    case "tool_result_content":
      return "user";
    default:
      return "user";
  }
}

/**
 * Normalizes one content element (string, block array or object) into Gemini
 * parts. Skips thinking blocks, degrades images to markers and converts
 * tool_use/tool_result blocks into functionCall/functionResponse parts.
 *
 * @param content - incoming content of any shape
 */
export function normalizeContentToParts(content: unknown): GeminiPart[] {
  const parts: GeminiPart[] = [];

  if (content == null) return parts;

  if (typeof content === "string") {
    if (content.trim() !== "") parts.push({ text: content });
    return parts;
  }

  if (Array.isArray(content)) {
    for (const blk of content) {
      if (Array.isArray(blk)) {
        parts.push(...normalizeContentToParts(blk));
        continue;
      }
      if (typeof blk === "string") {
        if (blk.trim() !== "") parts.push({ text: blk });
        continue;
      }
      if (!isPlainObject(blk)) continue;
      const b = blk as Record<string, unknown>;

      if (isThinkingBlock(b)) continue;

      if (b.type === "text" && typeof b.text === "string") {
        parts.push({ text: b.text as string });
        continue;
      }
      if (typeof b.text === "string" && (b.type === undefined || (b as any).type === "text")) {
        if (!(b as any).thought) parts.push({ text: b.text as string });
        continue;
      }
      if (b.type === "image_url" || b.type === "image") {
        parts.push({ text: "[image]" });
        continue;
      }
      if (b.type === "tool_use") {
        const nameRaw = (b as any).name ?? (b as any).tool_name ?? "unknown_tool";
        try {
          const name = sanitizeToolName(String(nameRaw));
          const input = (b as any).input ?? (b as any).arguments ?? {};
          parts.push({
            functionCall: {
              name,
              args: isPlainObject(input) ? (input as Record<string, unknown>) : {},
            },
          });
        } catch {
          // Skip invalid tool_use blocks
        }
        continue;
      }
      if (b.type === "tool_result" || b.type === "tool_response" || b.type === "function_response") {
        const nameRaw = (b as any).name ?? (b as any).tool_name ?? (b as any).tool_use_id ?? "tool";
        try {
          const name = sanitizeToolName(String(nameRaw));
          let respContent = (b as any).content;
          if (Array.isArray(respContent)) {
            respContent = respContent
              .map((c: any) => (typeof c === "string" ? c : (c.text ?? JSON.stringify(c))))
              .join("\n");
          } else if (typeof respContent !== "string") {
            respContent = JSON.stringify(respContent ?? {});
          }
          parts.push({
            functionResponse: {
              name,
              response: { result: String(respContent).slice(0, 20000) },
            },
          });
        } catch {
          // Skip invalid tool_result blocks
        }
        continue;
      }
      if ((b as any).functionCall) {
        parts.push(b as unknown as GeminiPart);
        continue;
      }
      if ((b as any).functionResponse) {
        parts.push(b as unknown as GeminiPart);
        continue;
      }
      if (typeof b.text === "string") {
        parts.push({ text: b.text });
      }
    }
    return parts;
  }

  if (isPlainObject(content)) {
    const c = content as Record<string, unknown>;
    if (typeof c.text === "string" && c.text.trim() !== "") {
      parts.push({ text: c.text });
    }
    return parts;
  }

  return parts;
}

/**
 * Gemini message with normalized role plus raw-role provenance.
 */
export interface GeminiMessage {
  role: "system" | "user" | "model";
  parts: GeminiPart[];
  _rawRole?: string;
}

/**
 * Generic incoming OpenCode / OpenAI / Anthropic message shape.
 */
export interface IncomingMessage {
  role: string;
  content?: string | unknown[] | Record<string, unknown> | null;
  name?: string;
  tool_calls?: Array<{
    id?: string;
    type?: string;
    function?: { name: string; arguments?: string | Record<string, unknown> };
  }>;
  tool_call_id?: string;
  tool_use_id?: string;
  [k: string]: unknown;
}

/**
 * Normalizes incoming OpenCode / OpenAI / Anthropic messages into Gemini
 * messages: role mapping via normalizeRole, content via normalizeContentToParts,
 * OpenAI tool_calls converted to functionCall parts, thinking blocks filtered,
 * consecutive same-role messages merged (except system).
 *
 * Named `normalizeIncomingMessages` because the historical `normalizeMessages`
 * keeps its original signature in this module.
 *
 * @param messages - array of incoming messages of any shape
 * @throws {RequestHelpersError} when input is not an array
 */
export function normalizeIncomingMessages(messages: unknown): GeminiMessage[] {
  if (!Array.isArray(messages)) {
    throw new RequestHelpersError(`normalizeMessages expects array, got ${typeof messages}`, "INVALID_MESSAGES");
  }

  const out: GeminiMessage[] = [];

  for (const raw of messages) {
    if (!isPlainObject(raw)) continue;
    const msg = raw as IncomingMessage;
    const roleRaw = typeof msg.role === "string" ? msg.role : "user";
    const normRole = normalizeRole(roleRaw);

    let parts = normalizeContentToParts(msg.content as unknown);

    if (Array.isArray(msg.tool_calls) && msg.tool_calls.length > 0) {
      for (const tc of msg.tool_calls) {
        try {
          const fn = tc.function ?? (tc as any);
          const nameRaw = (fn as any).name ?? tc.id ?? "tool";
          const name = sanitizeToolName(String(nameRaw));
          let args: Record<string, unknown> = {};
          const argsRaw = (fn as any).arguments;
          if (typeof argsRaw === "string") {
            try {
              const parsed = JSON.parse(argsRaw);
              if (isPlainObject(parsed)) args = parsed as Record<string, unknown>;
            } catch {
              // Leave empty args when not JSON
            }
          } else if (isPlainObject(argsRaw)) {
            args = argsRaw as Record<string, unknown>;
          }
          parts.push({ functionCall: { name, args } });
        } catch {
          continue;
        }
      }
    }

    if (parts.length === 0) {
      if (normRole === "system") continue;
      continue;
    }

    parts = parts.filter((p) => !isThinkingBlock(p));

    if (parts.length === 0) continue;

    out.push({
      role: normRole,
      parts,
      _rawRole: roleRaw,
    });
  }

  const merged: GeminiMessage[] = [];
  for (const cur of out) {
    const last = merged[merged.length - 1];
    if (last && last.role === cur.role && cur.role !== "system") {
      last.parts.push(...cur.parts);
    } else {
      merged.push(cur);
    }
  }

  return merged;
}

// ============================================================================
// 09. enhanceAgySdkErrorResponse()
// ============================================================================

export interface EnhancedAgyError {
  message: string;
  code?: string | undefined;
  status?: number | undefined;
  statusText?: string | undefined;
  details?: unknown | undefined;
  isRetryable: boolean;
  isAuthError: boolean;
  isQuotaError: boolean;
  isModelError: boolean;
  isThinkingBudgetError: boolean;
  original: unknown;
  suggestion?: string | undefined;
  requestId?: string | undefined;
  modelId?: string | undefined;
}

function extractJsonFromText(text: string): Record<string, unknown> | null {
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    // tenta extrair json embebido
    const m = text.match(/\{[\s\S]*\}/);
    if (m) {
      try {
        return JSON.parse(m[0]) as Record<string, unknown>;
      } catch {
        return null;
      }
    }
    return null;
  }
}

/**
 * Enriquece erro vindo do Agentic SDK / Cloud Code Assist.
 * Detecta auth, quota, model not found, thinking budget etc e sugere correção.
 *
 * @param error - erro bruto (Error, Response, objeto, string)
 * @param context - contexto opcional com modelId, requestId etc
 */
export function enhanceAgySdkErrorResponse(
  error: unknown,
  context?: { modelId?: string; requestId?: string },
): EnhancedAgyError {
  let message = "Unknown Agentic SDK error";
  let code: string | undefined;
  let status: number | undefined;
  let statusText: string | undefined;
  let details: unknown = undefined;
  let requestId = context?.requestId;
  let modelId = context?.modelId;

  // Normaliza entrada
  if (typeof error === "string") {
    message = error;
    const parsed = extractJsonFromText(error);
    if (parsed) {
      details = parsed;
      if (typeof (parsed as any).message === "string") message = (parsed as any).message;
      if (typeof (parsed as any).error === "string") message = (parsed as any).error;
      if (typeof (parsed as any).code === "string") code = (parsed as any).code;
      // @ts-ignore
      if ((parsed as any).error?.message) message = (parsed as any).error.message;
      // @ts-ignore
      if ((parsed as any).error?.code) code = (parsed as any).error.code;
      // @ts-ignore
      if ((parsed as any).error?.status) code = (parsed as any).error.status;
    }
  } else if (error instanceof Error) {
    message = error.message || message;
    details = { name: error.name, stack: error.stack?.split("\n").slice(0, 5).join("\n") };
    // tenta extrair status de propriedades comuns
    const anyErr = error as any;
    if (typeof anyErr.status === "number") status = anyErr.status;
    if (typeof anyErr.statusCode === "number") status = anyErr.statusCode;
    if (typeof anyErr.code === "string") code = anyErr.code;
    if (typeof anyErr.requestId === "string") requestId = anyErr.requestId;
  } else if (isPlainObject(error)) {
    const obj = error as Record<string, unknown>;
    if (typeof obj["message"] === "string") message = obj["message"] as string;
    else if (typeof (obj["error"] as any)?.message === "string") message = (obj["error"] as any).message;
    else if (typeof obj["error"] === "string") message = obj["error"] as string;

    if (typeof obj["code"] === "string") code = obj["code"] as string;
    else if (typeof (obj["error"] as any)?.code === "string") code = (obj["error"] as any).code;
    else if (typeof obj["status"] === "string") code = obj["status"] as string;

    if (typeof obj["status"] === "number") status = obj["status"] as number;
    if (typeof obj["statusCode"] === "number") status = obj["statusCode"] as number;
    if (typeof obj["httpStatus"] === "number") status = obj["httpStatus"] as number;

    if (typeof obj["statusText"] === "string") statusText = obj["statusText"] as string;
    if (typeof obj["requestId"] === "string") requestId = obj["requestId"] as string;
    if (typeof obj["modelId"] === "string") modelId = obj["modelId"] as string;

    details = obj;
  } else {
    details = error;
    try {
      message = String(error);
    } catch {
      // keep default
    }
  }

  const lowerMsg = message.toLowerCase();
  const lowerCode = (code ?? "").toLowerCase();

  const isAuthError =
    status === 401 ||
    status === 403 ||
    lowerCode.includes("unauthenticated") ||
    lowerCode.includes("permission_denied") ||
    lowerCode.includes("forbidden") ||
    lowerMsg.includes("unauthenticated") ||
    lowerMsg.includes("permission denied") ||
    lowerMsg.includes("unauthorized") ||
    lowerMsg.includes("invalid authentication") ||
    lowerMsg.includes("requires authentication") ||
    (lowerMsg.includes("auth") && lowerMsg.includes("failed"));

  const isQuotaError =
    status === 429 ||
    lowerCode.includes("resource_exhausted") ||
    lowerCode.includes("quota") ||
    lowerCode.includes("rate_limit") ||
    lowerMsg.includes("quota") ||
    lowerMsg.includes("rate limit") ||
    lowerMsg.includes("too many requests") ||
    lowerMsg.includes("resource exhausted") ||
    lowerMsg.includes("exceeded");

  const isModelError =
    status === 404 ||
    lowerCode.includes("model_not_found") ||
    (lowerCode.includes("not_found") && lowerMsg.includes("model")) ||
    lowerMsg.includes("model not found") ||
    lowerMsg.includes("unknown model") ||
    lowerMsg.includes("model not supported") ||
    lowerMsg.includes("invalid model");

  const isThinkingBudgetError =
    (lowerMsg.includes("thinking") && (lowerMsg.includes("budget") || lowerMsg.includes("token"))) ||
    lowerCode.includes("thinking_budget") ||
    lowerMsg.includes("thinkingBudget");

  const isRetryable =
    status === 408 ||
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504 ||
    lowerCode.includes("unavailable") ||
    lowerCode.includes("deadline_exceeded") ||
    lowerCode.includes("aborted") ||
    lowerCode.includes("internal") ||
    (isQuotaError && status === 429); // quota 429 retryable com backoff

  let suggestion: string | undefined;
  if (isAuthError) {
    suggestion = `Reautentique com OAuth: client ${GEMINI_CLI_OAUTH_CLIENT_ID}. Verifique token expirou, escopos ${"https://www.googleapis.com/auth/cloud-platform"}. Tente limpar cache em ~/.config/opencode/auth/ e rodar auth flow novamente. Headers: User-Agent=${GEMINI_CLI_USER_AGENT}, X-Goog-Api-Client=${X_GOOG_API_CLIENT}`;
  } else if (isQuotaError) {
    suggestion = `Quota excedida. Verifique retrieveUserQuotaSummary em ${CLOUDCODE_PA_BASE}/v1internal:retrieveUserQuotaSummary. Troque para modelo fallback ${PROJECT_FALLBACK} ou aguarde reset. Considere modelo alternativo: ${FETCH_AVAILABLE_MODELS_2026.filter((m) => !m.includes("claude")).join(", ")}`;
  } else if (isModelError) {
    suggestion = `Modelo ${modelId ?? "desconhecido"} não encontrado. Modelos válidos 2026: ${FETCH_AVAILABLE_MODELS_2026.join(", ")}. Verifique se precisa de prefixo antigravity- e endpoint ${CLOUDCODE_PA_BASE}/v1internal. Para Claude use isLikelyAntigravityOnlyModel() para decidir roteamento.`;
  } else if (isThinkingBudgetError) {
    suggestion = `Thinking budget inválido. Use buildGenerationConfig() com thinkingLevel minimal/low/medium/high. Para Gemini: minimal=0, low=1024, medium=4096, high=8192. Para Claude: minimal=1024, low=2048, medium=8192, high=16384. Verifique modelo suporta thinking (claude-opus thinking ou gemini-3 com thinkingConfig).`;
  } else if (isRetryable) {
    suggestion = `Erro transitório (${status ?? code}). Tente novamente com backoff exponencial (500ms base, jitter). Endpoint: ${CLOUDCODE_PA_BASE}/v1internal. Project fallback: ${PROJECT_FALLBACK}.`;
  }

  // Anonimiza secret em mensagem
  const safeMessage = message.replace(/GOCSPX-[A-Za-z0-9\-_]+/g, "[REDACTED_SECRET]");

  return {
    message: safeMessage,
    code,
    status,
    statusText,
    details,
    isRetryable,
    isAuthError,
    isQuotaError,
    isModelError,
    isThinkingBudgetError,
    original: error,
    suggestion,
    requestId,
    modelId,
  };
}

// ---------------------------------------------------------------------------
// Core: transformRequest — OpenCode → Gemini normalized
// ---------------------------------------------------------------------------

/**
 * Transforms OpenCode request (OpenAI/Anthropic mixed) into Gemini/Antigravity
 * normalized request ready for cloudcode-pa envelope.
 *
 * Steps performed by third-person observer:
 * - Validates model, messages
 * - Parses model variant to extract thinkingLevel/budget
 * - Aggregates system instructions
 * - Normalizes contents: user ↔ model, maps thinking blocks first,
 *   handles tool_use/tool_result pairing, handles OpenAI tool_calls
 * - Cleans tool schemas, sanitizes tool names, ensures uniqueness
 * - Injects google_search tool when enabled
 * - Generates deterministic session_id and user_prompt_id via FNV-1a
 * - Builds generationConfig with thinking budget if applicable
 * - Supports 2026 models aliasing
 *
 * @param input - transform input
 * @returns transformed request
 * @throws RequestTransformationError on invalid input
 */

// ---------------------------------------------------------------------------
// Build envelope for cloudcode-pa — endpoint cascade, headers, body
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Convenience: fetch with cascade (optional helper for plugin.ts integration)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Merged: Gemini CLI bypass constants (canonical values from legacy module)
// ---------------------------------------------------------------------------

// v2.1.15 Phase C: the local GEMINI_CLI_OAUTH_CLIENT_ID/SECRET assembled
// pair was byte-identical to constants.js — deleted; constants.js is the
// single owner of the gemini-cli client pair.

// v2.1.16: two orphaned bare literals (the full GeminiCLI UA string and the
// IDE_UNSPECIFIED Client-Metadata string) were deleted — unbound top-level
// expression statements left behind by the v2.1.15 merge, dead residue with
// no runtime effect. The live values are the constants.js imports above
// (GEMINI_CLI_USER_AGENT / CLIENT_METADATA_STRING).

/** X-Goog-Api-Client value observed on real Gemini CLI traffic. */

/** Client metadata object injected by Gemini CLI for bypass requests. */

/** Fallback project id when no cloud project is resolved. */

/** Production Cloud Code Assist base endpoint. */

/** Daily (canary) Cloud Code Assist base endpoint — default for pure Gemini CLI bypass. */

/** v1internal method suffixes observed on Cloud Code Assist traffic.
 * v2.1.15 Phase A: renamed from the historical local name
 * CODE_ASSIST_ENDPOINTS (a method-path map) so the host-map semantic of that
 * name resolves to the models.ts owner; re-exported below for surface
 * continuity. */
export const CODE_ASSIST_METHOD_PATHS = {
  GENERATE: "/v1internal:generateContent",
  STREAM_GENERATE: "/v1internal:streamGenerateContent",
  LOAD: "/v1internal:loadCodeAssist",
} as const;

/** Cloud Code Assist HOST map (canonical owner: models.ts).
 * @deprecated legacy alias kept for the historical request-module surface. */
export { CODE_ASSIST_ENDPOINTS } from "./models.js";

/**
 * Union of model ids listed in {@link FETCH_AVAILABLE_MODELS_2026}.
 */
// v2.1.15 Phase A: the local Model2026 alias was deleted — models.ts owns
// the Model2026 family name.

// ---------------------------------------------------------------------------
// Merged: FNV-1a 64-bit — longer deterministic digests
// ---------------------------------------------------------------------------

const FNV64_OFFSET_BASIS = BigInt("14695981039346656037");
const FNV64_PRIME = BigInt("1099511628211");
const FNV64_MASK = BigInt("0xffffffffffffffff");

/**
 * Computes FNV-1a 64-bit hash over UTF-8 bytes.
 * Complements the 32-bit variant when longer deterministic digests are needed.
 *
 * @param input - string to hash
 * @returns unsigned 64-bit integer as bigint
 */
export function fnv1a64BigInt(input: string): bigint {
  let hash: bigint = FNV64_OFFSET_BASIS;
  const buf = Buffer.from(input, "utf8");
  for (let i = 0; i < buf.length; i++) {
    hash ^= BigInt(buf[i]!);
    hash = (hash * FNV64_PRIME) & FNV64_MASK;
  }
  return hash;
}

function toHex8(n: number): string {
  return (n >>> 0).toString(16).padStart(8, "0");
}

function toHex16(n: bigint): string {
  return n.toString(16).padStart(16, "0");
}

// ---------------------------------------------------------------------------
// Merged: deterministic session / prompt ids keyed by directory
// ---------------------------------------------------------------------------

/**
 * Options controlling {@link buildUserPromptId} output shape.
 */
export interface BuildPromptIdOptions {
  /** Custom prefix, defaults to "agyp_". */
  prefix?: string;
  /** Extra seed for disambiguation, e.g. projectId or sessionId. */
  seed?: string;
  /** Include timestamp? Breaks determinism, discouraged but supported. */
  includeTimestamp?: boolean;
  /** Hash length: "short" yields 8 hex chars, "long" adds a 12-char 64-bit suffix. */
  length?: "short" | "long";
}

/**
 * Generates a deterministic session_id via FNV-1a over the working directory.
 * Same directory implies same session_id, which keeps fingerprints stable.
 *
 * @param directory - optional directory; falls back to cwd, then home dir
 * @returns session id like `sess_1a2b3c4d5e6f7a8b9c0d`
 */
export function buildSessionIdFromDir(directory?: string | null): string {
  let dir = directory?.trim();
  if (!dir) {
    try {
      dir = process.cwd();
    } catch {
      dir = os.homedir() || FALLBACK_PROJECT_ID;
    }
  }
  // Normalize separators so Windows and POSIX paths hash identically
  dir = stripTrailingSlashes(dir.replace(/\\/g, "/"));
  const h = fnv1a32(dir);
  return `sess_${toHex8(h)}${toHex8(fnv1a32(dir.split("").reverse().join("")))}`.slice(0, 20);
}

/**
 * Generates a deterministic user_prompt_id via FNV-1a.
 * Used by the Cloud Code backend for deduplication.
 *
 * @param input - prompt content; objects are JSON.stringify-ed; omitted input
 *                falls back to hostname|cwd|pid for per-workspace stability
 * @param opts - options object or bare seed string
 * @returns id like `agyp_1a2b3c4d` or `agyp_1a2b3c4d-9f8e7d6c5b4a`
 */
export function buildUserPromptId(
  input?: string | object | null | undefined,
  opts?: BuildPromptIdOptions | string,
): string {
  let options: BuildPromptIdOptions = {};
  if (typeof opts === "string") options = { seed: opts };
  else if (opts && typeof opts === "object") options = opts;

  const prefix = options.prefix ?? "agyp_";
  const length = options.length ?? "short";

  let baseStr: string;
  if (input == null) {
    try {
      baseStr = `${os.hostname()}|${process.cwd()}|${process.pid}`;
    } catch {
      baseStr = `fallback|${FALLBACK_PROJECT_ID}`;
    }
  } else if (typeof input === "string") baseStr = input;
  else {
    try {
      baseStr = JSON.stringify(input);
    } catch {
      baseStr = String(input);
    }
  }

  if (options.seed) baseStr = `${baseStr}|${options.seed}`;
  if (options.includeTimestamp) baseStr = `${baseStr}|${Date.now()}`;

  const h32 = fnv1a32(baseStr);
  if (length === "short") return `${prefix}${toHex8(h32)}`;

  const h64 = fnv1a64BigInt(baseStr);
  return `${prefix}${toHex8(h32)}-${toHex16(h64).slice(0, 12)}`;
}

/**
 * Compatibility alias for fingerprint.ts: derives the session id from a directory.
 * Kept alongside {@link generateSessionId}, which hashes an arbitrary seed instead.
 *
 * @param directory - optional directory path
 * @returns deterministic session id
 */
export function buildSessionId(directory?: string): string {
  return buildSessionIdFromDir(directory);
}

// ---------------------------------------------------------------------------
// Merged: thinking level normalization and budget mapping
// ---------------------------------------------------------------------------

// v2.1.14 merge: request.ts's duplicate short THINKING_LEVEL_TO_BUDGET_* maps
// (see constants above) and its normalizeThinkingLevel-based
// mapThinkingLevelToBudget were dropped in favor of the richer
// request-helpers.ts versions merged below.

/**
 * Normalizes free-form thinking input (string, options object, or message field)
 * into a canonical level. Unknown values collapse to "medium"; explicit
 * none/off inputs yield "none".
 *
 * @param input - raw thinking spec
 * @returns canonical level including "none"
 */
export function normalizeThinkingLevel(input: unknown): ThinkingLevel | "none" {
  if (!input) return "medium";
  let level: string;

  if (typeof input === "string") level = input;
  else if (typeof input === "object" && input !== null) {
    const obj = input as any;
    if (typeof obj.level === "string") level = obj.level;
    else if (typeof obj.thinkingLevel === "string") level = obj.thinkingLevel;
    else if (typeof obj.thinking_level === "string") level = obj.thinking_level;
    else level = "medium";
  } else level = "medium";

  level = level.toLowerCase().trim();
  if (level === "low" || level === "minimal" || level === "none") return level;
  if (level === "high" || level === "medium") return level;
  // Map common variations onto canonical levels
  if (["1", "small", "light"].includes(level)) return "low";
  if (["2", "default", "balanced"].includes(level)) return "medium";
  if (["3", "large", "deep", "max"].includes(level)) return "high";
  return "medium";
}

// ---------------------------------------------------------------------------
// Merged: thinking level parsing and budget mapping
// ---------------------------------------------------------------------------

/**
 * Parses free-form input into a canonical thinking level. Also maps
 * none/off onto minimal for compatibility.
 *
 * @param input - level-like value
 * @returns canonical level or undefined when not parseable
 */
export function parseThinkingLevel(input: unknown): ThinkingLevel | undefined {
  if (typeof input !== "string") return undefined;
  const l = input.trim().toLowerCase();
  if ((THINKING_LEVELS as readonly string[]).includes(l)) {
    return l as ThinkingLevel;
  }
  if (l === "none" || l === "off") return "minimal";
  return undefined;
}

/**
 * Maps a thinking level (or numeric budget) onto its token budget, clamping
 * numbers into [THINKING_BUDGET_MIN, THINKING_BUDGET_MAX]. Unknown named levels
 * safely fall back to medium.
 *
 * @param level - level name, numeric budget or numeric string
 * @throws {RequestHelpersError} on non-finite numbers or empty strings
 */
export function mapThinkingLevelToBudget(level: string | number): number {
  if (typeof level === "number") {
    if (!Number.isFinite(level)) {
      throw new RequestHelpersError(`thinking budget number not finite: ${level}`, "INVALID_THINKING_BUDGET");
    }
    return Math.max(THINKING_BUDGET_MIN, Math.min(THINKING_BUDGET_MAX, Math.floor(level)));
  }

  if (typeof level !== "string") {
    throw new RequestHelpersError(
      `thinking level must be string|number, got ${typeof level}`,
      "INVALID_THINKING_LEVEL",
    );
  }

  const trimmed = level.trim().toLowerCase();

  // Numeric strings act as direct budgets
  const asNum = Number(trimmed);
  if (trimmed !== "" && Number.isFinite(asNum) && /^\d+$/.test(trimmed)) {
    return Math.max(THINKING_BUDGET_MIN, Math.min(THINKING_BUDGET_MAX, Math.floor(asNum)));
  }

  const parsed = parseThinkingLevel(trimmed);
  if (parsed === "minimal" || parsed === "low" || parsed === "medium" || parsed === "high" || parsed === "max") {
    return THINKING_BUDGET_MAP[parsed];
  }

  if (trimmed === "") {
    throw new RequestHelpersError("empty thinking level", "INVALID_THINKING_LEVEL");
  }

  return THINKING_BUDGET_MAP.medium;
}

/**
 * Spec-required alias of {@link mapThinkingLevelToBudget}.
 */
export const thinkingLevelToBudget = mapThinkingLevelToBudget;

/**
 * Budget hint for a parsed variant suffix.
 *
 * @param variant - "low", "max" or null
 */
export function getThinkingBudgetForVariant(variant: "low" | "max" | null): number {
  if (variant === "low") return THINKING_BUDGET_MAP.low;
  if (variant === "max") return THINKING_BUDGET_MAP.max;
  return THINKING_BUDGET_MAP.medium;
}

// ---------------------------------------------------------------------------
// Merged: OpenCode request shapes and Cloud Code Assist payload types
// ---------------------------------------------------------------------------

/**
 * Anthropic/OpenAI-style content block tolerated inside OpenCode messages.
 */
export interface OpenCodeContentBlock {
  type?: string;
  text?: string;
  thinking?: string;
  level?: ThinkingLevel | string;
  thought?: string;
  id?: string;
  name?: string;
  input?: unknown;
  args?: unknown;
  tool_use_id?: string;
  tool_call_id?: string;
  content?: unknown;
  source?: { type?: string; media_type?: string; data?: string };
  [key: string]: unknown;
}

/**
 * Full OpenCode request envelope with thinking/search/session passthrough fields.
 */
export interface OpenCodeRequest {
  model?: string;
  messages?: OpenCodeMessage[];
  tools?: OpenCodeTool[];
  tool_choice?: unknown;
  thinking?:
    | ThinkingLevel
    | string
    | { level?: ThinkingLevel | string; budget?: number; type?: string; budget_tokens?: number };
  thinkingLevel?: ThinkingLevel | string;
  thinking_level?: ThinkingLevel | string;
  directory?: string;
  cwd?: string;
  project?: string;
  projectId?: string;
  temperature?: number;
  top_p?: number;
  topP?: number;
  top_k?: number;
  topK?: number;
  max_tokens?: number;
  maxTokens?: number;
  google_search?: boolean;
  enable_google_search?: boolean;
  enableGoogleSearch?: boolean;
  session_id?: string;
  user_prompt_id?: string;
  [key: string]: unknown;
}

/**
 * System instruction shape accepted by Cloud Code Assist.
 */
export interface GeminiSystemInstruction {
  role?: "system";
  parts: GeminiPart[];
}

/**
 * Function declaration shape used in Gemini tools payloads.
 */
export interface GeminiFunctionDeclaration {
  name: string;
  description?: string;
  parameters?: any;
}

/**
 * Generation config including thinkingConfig with level/budget mapping.
 * v2.1.14 merge: unions the request.ts declaration (top-level thinking
 * compat fields) with the request-helpers.ts declaration (penalties,
 * responseMimeType and the index signature).
 */
export interface GeminiGenerationConfig {
  temperature?: number;
  topP?: number;
  topK?: number;
  maxOutputTokens?: number;
  stopSequences?: string[];
  candidateCount?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
  thinkingConfig?: {
    thinkingLevel?: string;
    thinkingBudget?: number;
    includeThoughts?: boolean;
  };
  responseMimeType?: string;
  // Compat: some backend versions expect these at the top level too
  thinkingLevel?: string;
  thinkingBudget?: number;
  [k: string]: unknown;
}

/**
 * Inner `request` field of the Cloud Code Assist v1internal envelope.
 */
export interface CloudCodeAssistInnerRequest {
  contents: GeminiContent[];
  systemInstruction?: GeminiSystemInstruction;
  tools?: any[];
  toolConfig?: { functionCallingConfig?: { mode: string; allowedFunctionNames?: string[] } };
  generationConfig?: GeminiGenerationConfig;
}

/**
 * Options bag accepted by the merged transform helpers.
 */
export interface TransformOptions {
  projectId?: string;
  directory?: string;
  enableGoogleSearch?: boolean;
  thinkingLevel?: ThinkingLevel | string;
  model?: string;
  sessionId?: string;
  userPromptId?: string;
  temperature?: number;
  topP?: number;
  topK?: number;
  maxTokens?: number;
}

/**
 * Result of {@link transformTools}: ready-made tools payload plus tool config.
 */
export interface TransformToolsResult {
  tools: any[] | undefined;
  toolConfig?: { functionCallingConfig: { mode: string; allowedFunctionNames?: string[] } } | undefined;
  sanitizedMap: Record<string, string>;
}

/**
 * Complete fetch payload for Antigravity / Cloud Code Assist endpoints.
 */
export interface AntigravityFetchPayload {
  url: string;
  method: "POST";
  headers: Record<string, string>;
  body: {
    model: string;
    project: string;
    request: CloudCodeAssistInnerRequest;
    user_prompt_id: string;
    session_id: string;
    requestId?: string;
  };
  rawBody: string;
  model: string;
  project: string;
  user_prompt_id: string;
  session_id: string;
  isGeminiCLIOnly: boolean;
}

// ---------------------------------------------------------------------------
// Merged: generation config builder and bypass headers
// ---------------------------------------------------------------------------

/**
 * Builds a GeminiGenerationConfig from an OpenCode request plus overrides.
 *
 * v2.1.14 merge note: renamed from buildGenerationConfig so the richer
 * options-object builder merged from request-helpers.ts can own that name.
 * Resolves the thinking level (override > opts > request > default) and maps
 * it onto the canonical budget map.
 *
 * @param req - OpenCode request with optional sampling/thinking fields
 * @param opts - transform-level overrides
 * @param thinkingLevelOverride - explicit level that wins over everything else
 * @returns generation config ready for CloudCodeAssistInnerRequest
 */
export function buildGenerationConfigFromRequest(
  req: OpenCodeRequest,
  opts?: TransformOptions,
  thinkingLevelOverride?: ThinkingLevel,
): GeminiGenerationConfig {
  const thinkingLevel =
    thinkingLevelOverride ||
    normalizeThinkingLevel(
      opts?.thinkingLevel ??
        req.thinkingLevel ??
        req.thinking_level ??
        (req as any).thinking?.level ??
        req.thinking ??
        "medium",
    );

  const thinkingBudget = mapThinkingLevelToBudget(thinkingLevel);

  const temperature = opts?.temperature ?? req.temperature;
  const topP = opts?.topP ?? req.topP ?? req.top_p;
  const topK = opts?.topK ?? req.topK ?? req.top_k;
  const maxTokens = opts?.maxTokens ?? req.max_tokens ?? req.maxTokens;

  const cfg: GeminiGenerationConfig = {};

  if (typeof temperature === "number") cfg.temperature = temperature;
  if (typeof topP === "number") cfg.topP = topP;
  if (typeof topK === "number") cfg.topK = topK;
  if (typeof maxTokens === "number") cfg.maxOutputTokens = maxTokens;

  cfg.thinkingConfig = {
    thinkingLevel,
    thinkingBudget,
    includeThoughts: true,
  };
  // Compat: some backend versions expect these fields at the top level too
  cfg.thinkingLevel = thinkingLevel;
  cfg.thinkingBudget = thinkingBudget;

  return cfg;
}

// ---------------------------------------------------------------------------
// Merged from request-helpers.ts — canonical buildGenerationConfig (options
// object with clamping, NaN guards and family-aware budget maps)
// ---------------------------------------------------------------------------

export interface BuildGenerationConfigOptions {
  temperature?: number;
  topP?: number;
  topK?: number;
  maxTokens?: number; // alias para maxOutputTokens
  maxOutputTokens?: number;
  thinkingLevel?: ThinkingLevel;
  thinkingBudget?: number; // override direto
  includeThoughts?: boolean;
  modelId?: string;
  stopSequences?: string[];
  candidateCount?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
  // extras Gemini
  responseMimeType?: string;
}

/**
 * Constrói GenerationConfig para cloudcode-pa v1internal.
 * Mapeia thinkingLevel (minimal/low/medium/high) para thinkingBudget.
 *
 * - Para modelos Gemini: minimal=0 (desativa), low=1024, medium=4096, high=8192
 * - Para modelos Claude (via Antigravity): budgets maiores
 * - Se thinkingBudget direto fornecido, usa direto
 * - Se thinkingLevel=none/minimal com includeThoughts=false, omite includeThoughts para economia
 *
 * @param opts - opções de geração
 * @returns config compatível com v1internal:generateContent
 */
export function buildGenerationConfig(opts: BuildGenerationConfigOptions = {}): GeminiGenerationConfig {
  const config: GeminiGenerationConfig = {};

  if (typeof opts.temperature === "number" && !Number.isNaN(opts.temperature)) {
    config.temperature = Math.max(0, Math.min(2, opts.temperature));
  }
  if (typeof opts.topP === "number" && !Number.isNaN(opts.topP)) {
    config.topP = Math.max(0, Math.min(1, opts.topP));
  }
  if (typeof opts.topK === "number" && !Number.isNaN(opts.topK)) {
    config.topK = Math.max(1, Math.floor(opts.topK));
  }

  const maxT = opts.maxOutputTokens ?? opts.maxTokens;
  if (typeof maxT === "number" && !Number.isNaN(maxT)) {
    config.maxOutputTokens = Math.max(1, Math.floor(maxT));
  }

  if (Array.isArray(opts.stopSequences) && opts.stopSequences.length > 0) {
    config.stopSequences = opts.stopSequences.filter((s) => typeof s === "string" && s.length > 0).slice(0, 5);
  }

  if (typeof opts.candidateCount === "number") {
    config.candidateCount = Math.max(1, Math.min(8, Math.floor(opts.candidateCount)));
  }

  if (opts.responseMimeType) config.responseMimeType = opts.responseMimeType;

  // Pensamento / thinking
  const modelId = (opts.modelId ?? "").toLowerCase();
  const isClaude = modelId.includes("claude") || modelId.includes("opus") || modelId.includes("sonnet");
  const budgetMap = isClaude ? THINKING_LEVEL_TO_BUDGET_CLAUDE : THINKING_LEVEL_TO_BUDGET_GEMINI;

  let budget: number | undefined;
  let levelNorm: string | undefined;

  if (typeof opts.thinkingBudget === "number" && !Number.isNaN(opts.thinkingBudget)) {
    budget = Math.max(0, Math.floor(opts.thinkingBudget));
    levelNorm = opts.thinkingLevel?.toLowerCase?.() ?? (budget === 0 ? "none" : "custom");
  } else if (opts.thinkingLevel) {
    levelNorm = opts.thinkingLevel.toLowerCase().trim();
    if (levelNorm in budgetMap) {
      budget = budgetMap[levelNorm];
    } else {
      // fallback heurístico: tenta mapear sinônimos
      if (["off", "disable", "disabled", "zero"].includes(levelNorm)) {
        budget = 0;
        levelNorm = "none";
      } else if (["min", "minimum"].includes(levelNorm)) {
        budget = budgetMap["minimal"];
        levelNorm = "minimal";
      } else {
        // default medium se desconhecido
        budget = budgetMap["medium"];
      }
    }
  }

  if (budget !== undefined) {
    config.thinkingConfig = {};
    if (levelNorm) config.thinkingConfig.thinkingLevel = levelNorm;
    config.thinkingConfig.thinkingBudget = budget;

    // includeThoughts: só true se budget >0 ou explicitamente pedido
    // Para minimal/none com budget 0, força false para economizar
    let includeThoughts = opts.includeThoughts;
    if (includeThoughts === undefined) {
      includeThoughts = budget > 0;
    }
    config.thinkingConfig.includeThoughts = includeThoughts;

    // Se for Gemini e budget 0 e includeThoughts false, podemos omitir thinkingConfig
    // mas mantemos para clareza, exceto se for none
    if (budget === 0 && !includeThoughts && (levelNorm === "none" || levelNorm === "minimal")) {
      // Para Gemini nativo, remover thinkingConfig quando desativa é válido, mas para Claude mantém 0
      if (!isClaude) {
        // mantém mesmo assim com budget 0 para explicitar desativação
        // não remove
      }
    }
  }

  // presence/frequency - não são nativas Gemini, mas alguns proxies aceitam; mantemos se vierem
  if (typeof opts.presencePenalty === "number") config.presencePenalty = opts.presencePenalty;
  if (typeof opts.frequencyPenalty === "number") config.frequencyPenalty = opts.frequencyPenalty;

  return config;
}

/**
 * Builds the exact header set used by Gemini CLI bypass traffic:
 * User-Agent, X-Goog-Api-Client, Client-Metadata (header and mirrored
 * X-Goog-Client-Metadata), JSON content type, gzip accept-encoding, and an
 * optional Bearer authorization merged last so extras can override.
 *
 * @param token - optional OAuth token; "Bearer " prefix added when missing
 * @param extra - additional headers merged after the defaults
 * @returns headers record ready for fetch
 */
export function buildBypassHeaders(token?: string, extra?: Record<string, string>): Record<string, string> {
  const h: Record<string, string> = {
    "User-Agent": GEMINI_CLI_USER_AGENT,
    "X-Goog-Api-Client": X_GOOG_API_CLIENT,
    "Client-Metadata": CLIENT_METADATA_STRING,
    "X-Goog-Client-Metadata": CLIENT_METADATA_STRING,
    "Content-Type": "application/json",
    Accept: "application/json",
    "Accept-Encoding": "gzip",
  };
  if (token && token.trim()) {
    const t = token.trim();
    h["Authorization"] = t.startsWith("Bearer ") ? t : `Bearer ${t}`;
  }
  if (extra) {
    for (const [k, v] of Object.entries(extra)) if (v) h[k] = v;
  }
  return h;
}

// ---------------------------------------------------------------------------
// Merged: tool schema cleaning (strict allowed-keys variant)
// ---------------------------------------------------------------------------

/**
 * Cleans one JSON Schema for Gemini function declarations: drops every key not
 * present in {@link ALLOWED_SCHEMA_KEYS} (recursively), normalizes oneOf to
 * anyOf, filters required/enum arrays, and defaults type to object when
 * properties exist.
 *
 * @param schema - raw schema node of any shape
 * @returns cleaned schema (same reference type semantics as input primitives)
 */
export function cleanToolSchema(schema: unknown): any {
  if (schema == null) return schema;
  if (typeof schema !== "object") return schema;
  if (Array.isArray(schema)) return schema.map(cleanToolSchema);

  const src = schema as Record<string, unknown>;
  const out: Record<string, unknown> = {};

  for (const [k, v] of Object.entries(src)) {
    if (!ALLOWED_SCHEMA_KEYS.has(k)) {
      // Allow recursion through anyOf/oneOf while dropping $schema/$ref/additionalProperties etc.
      if (k === "anyOf" || k === "oneOf") {
        // Normalize oneOf to anyOf for compatibility
        out["anyOf"] = Array.isArray(v) ? (v as unknown[]).map(cleanToolSchema) : cleanToolSchema(v);
      }
      continue;
    }

    if (k === "properties" && v && typeof v === "object" && !Array.isArray(v)) {
      const props = v as Record<string, unknown>;
      const cleanedProps: Record<string, unknown> = {};
      for (const [propName, propSchema] of Object.entries(props)) {
        cleanedProps[propName] = cleanToolSchema(propSchema);
      }
      out[k] = cleanedProps;
    } else if (k === "items" && v && typeof v === "object") {
      out[k] = cleanToolSchema(v);
    } else if (k === "anyOf" && Array.isArray(v)) {
      out[k] = (v as unknown[]).map(cleanToolSchema);
    } else if (k === "required" && Array.isArray(v)) {
      out[k] = (v as string[]).filter((s) => typeof s === "string");
    } else if (k === "enum" && Array.isArray(v)) {
      out[k] = v;
    } else {
      out[k] = v;
    }
  }

  // Default type to object when properties exist without a type
  if (out.properties && !out.type) out.type = "object";

  return out;
}

// ============================================================================
// 04. cleanToolSchema() - limpeza de JSON Schema para Gemini
// ============================================================================

const DROP_KEYS = new Set<string>([
  "$schema",
  "$id",
  "$comment",
  "$anchor",
  "$defs",
  "definitions",
  "examples",
  "example",
  "deprecated",
  "const", // Gemini não curte const em alguns ver, convertemos para enum
  "format", // mantém? Gemini aceita alguns formatos, mas por segurança remove se for json-specific
]);

const VALID_JSON_TYPES = new Set<string>(["string", "number", "integer", "boolean", "object", "array", "null"]);

/**
 * Normaliza campo `type`: se for array com null, mantém tipo principal
 * Se for array com múltiplos tipos, escolhe primeiro não-null
 */
function normalizeTypeField(typeVal: unknown): string | undefined {
  if (typeof typeVal === "string") {
    const low = typeVal.toLowerCase();
    return VALID_JSON_TYPES.has(low) ? low : undefined;
  }
  if (Array.isArray(typeVal)) {
    const filtered = (typeVal as unknown[])
      .map((t) => (typeof t === "string" ? t.toLowerCase() : ""))
      .filter((t) => t && t !== "null" && VALID_JSON_TYPES.has(t));
    if (filtered.length > 0) return filtered[0];
    // fallback
    if ((typeVal as string[]).includes("string")) return "string";
    return undefined;
  }
  return undefined;
}

export interface CleanToolSchemaOptions {
  maxDepth?: number;
  keepFormat?: boolean;
  keepDescription?: boolean;
}

/**
 * Limpa e normaliza JSON Schema de tool para formato aceito por Gemini / Cloud Code Assist.
 *
 * O que faz:
 * - remove $schema, $id, examples, etc
 * - remove chaves undefined / null vazias
 * - normaliza type para lowercase e singular
 * - converte `const: X` para `enum: [X]`
 * - limpa recursivamente properties, items, anyOf/oneOf/allOf
 * - garante que object com properties tenha type=object
 * - remove propriedades vazias
 * - impede profundidade infinita (>20)
 *
 * v2.1.14 merge note: renamed from cleanToolSchema (request-helpers.ts) to
 * cleanToolSchemaTolerant; the strict allowlist cleaner from request.ts owns
 * the cleanToolSchema name.
 *
 * @param schema - schema bruto (any)
 * @param opts - opções
 * @returns schema limpo
 */
export function cleanToolSchemaTolerant(schema: unknown, opts?: CleanToolSchemaOptions, _depth = 0): unknown {
  const maxDepth = opts?.maxDepth ?? 20;
  const depth = _depth;

  if (depth > maxDepth) return schema;
  if (schema == null) return schema;
  if (typeof schema === "boolean") return schema;

  if (Array.isArray(schema)) {
    return (schema as unknown[])
      .map((item) => cleanToolSchemaTolerant(item, opts, depth + 1))
      .filter((v) => v !== undefined);
  }

  if (!isPlainObject(schema)) {
    return schema;
  }

  const out: Record<string, unknown> = {};

  for (const [rawKey, rawVal] of Object.entries(schema as Record<string, unknown>)) {
    if (rawVal === undefined) continue;
    if (DROP_KEYS.has(rawKey)) {
      // exceção: se keepFormat e key é format, mantém
      if (rawKey === "format" && opts?.keepFormat) {
        // mantém apenas formatos seguros para Gemini
        const fmt = String(rawVal).toLowerCase();
        if (["date-time", "date", "enum", "int32", "int64", "double", "float"].includes(fmt)) {
          out[rawKey] = fmt;
        }
        continue;
      }
      // exceção: description sempre mantém por padrão
      continue;
    }

    if (rawKey === "type") {
      const normalized = normalizeTypeField(rawVal);
      if (normalized) out[rawKey] = normalized;
      // se type array incluía null, Gemini usa nullable via `nullable:true`? No Gemini mais novo usa type sem null, mas aceita null em array?
      // Vamos omitir null e não setar nullable para compat. Se precisar, poderia setar out['nullable']=true.
      continue;
    }

    if (rawKey === "const") {
      // const => enum
      out["enum"] = [rawVal];
      continue;
    }

    if (rawKey === "properties" && isPlainObject(rawVal)) {
      const cleanedProps: Record<string, unknown> = {};
      for (const [propKey, propVal] of Object.entries(rawVal as Record<string, unknown>)) {
        const cleaned = cleanToolSchemaTolerant(propVal, opts, depth + 1);
        if (cleaned !== undefined) cleanedProps[propKey] = cleaned;
      }
      if (Object.keys(cleanedProps).length > 0) out[rawKey] = cleanedProps;
      continue;
    }

    if (rawKey === "items") {
      out[rawKey] = cleanToolSchemaTolerant(rawVal, opts, depth + 1);
      continue;
    }

    if (rawKey === "additionalProperties") {
      if (typeof rawVal === "boolean") {
        out[rawKey] = rawVal;
      } else if (isPlainObject(rawVal)) {
        out[rawKey] = cleanToolSchemaTolerant(rawVal, opts, depth + 1);
      }
      continue;
    }

    if (["anyOf", "oneOf", "allOf"].includes(rawKey) && Array.isArray(rawVal)) {
      const cleanedArr = (rawVal as unknown[])
        .map((v) => cleanToolSchemaTolerant(v, opts, depth + 1))
        .filter((v) => v !== undefined && v !== null) as unknown[];
      if (cleanedArr.length > 0) out[rawKey] = cleanedArr;
      continue;
    }

    if (rawKey === "enum" && Array.isArray(rawVal)) {
      // filtra enums válidos, remove duplicados
      const uniq = Array.from(new Set((rawVal as unknown[]).filter((x) => x != null)));
      if (uniq.length > 0) out[rawKey] = uniq;
      continue;
    }

    if (rawKey === "required" && Array.isArray(rawVal)) {
      const uniq = Array.from(
        new Set((rawVal as unknown[]).filter((x) => typeof x === "string" && (x as string).length > 0)),
      ) as string[];
      if (uniq.length > 0) out[rawKey] = uniq;
      continue;
    }

    // Recursivo genérico para objetos
    if (isPlainObject(rawVal)) {
      const cleaned = cleanToolSchemaTolerant(rawVal, opts, depth + 1);
      if (
        cleaned !== undefined &&
        (typeof cleaned !== "object" || Object.keys(cleaned as object).length > 0 || Array.isArray(cleaned))
      ) {
        out[rawKey] = cleaned;
      }
      continue;
    }

    if (Array.isArray(rawVal)) {
      // para arrays genéricos (ex: enum já tratado, mas outros)
      out[rawKey] = rawVal
        .map((v) => (isPlainObject(v) ? cleanToolSchemaTolerant(v, opts, depth + 1) : v))
        .filter((v) => v !== undefined);
      continue;
    }

    // primitivos: string, number, boolean
    out[rawKey] = rawVal;
  }

  // heurística: se tem properties mas não type, assume object
  if (out["properties"] && !out["type"]) {
    out["type"] = "object";
  }
  // se é object mas properties vazio e não tem additionalProperties, remove properties para evitar schema vazio que Gemini rejeita
  if (
    out["type"] === "object" &&
    out["properties"] &&
    isPlainObject(out["properties"]) &&
    Object.keys(out["properties"] as object).length === 0
  ) {
    delete out["properties"];
  }

  return out;
}

/**
 * Versão plural que limpa mapa de tools ou array de function declarations
 *
 * v2.1.14 merge note: canonical plural (superset of request.ts's array-only
 * variant; strict-array cleaning stays available via schemas.map(cleanToolSchema)).
 */
export function cleanToolSchemas(tools: unknown, opts?: CleanToolSchemaOptions): unknown {
  if (Array.isArray(tools)) {
    return tools.map((t) => cleanToolSchemaTolerant(t, opts)).filter(Boolean);
  }
  if (isPlainObject(tools)) {
    // pode ser { functions: [...] } ou { name: { parameters: schema } }
    const obj = tools as Record<string, unknown>;
    if (obj["parameters"] || obj["properties"] || obj["type"]) {
      return cleanToolSchemaTolerant(obj, opts);
    }
    const cleaned: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      cleaned[k] = cleanToolSchemaTolerant(v, opts);
    }
    return cleaned;
  }
  return cleanToolSchemaTolerant(tools, opts);
}

// ---------------------------------------------------------------------------
// Merged: tool name validation
// ---------------------------------------------------------------------------

/**
 * Checks whether a tool name already satisfies the Gemini naming rules.
 *
 * @param name - candidate name
 * @returns true when valid without sanitization
 */
export function isValidToolName(name: string): boolean {
  return TOOL_NAME_REGEX.test(name);
}

/**
 * Detailed result of {@link validateToolNames}.
 */
export interface ValidateToolNamesResult {
  valid: string[];
  invalid: string[];
  sanitized: Record<string, string>;
  duplicates: string[];
}

/**
 * Validates a list of tool names, reporting duplicates and computing sanitized
 * replacements for invalid entries.
 *
 * @param names - raw tool names
 * @returns valid/invalid partitions plus sanitized mapping
 */
export function validateToolNames(names: string[]): ValidateToolNamesResult {
  const valid: string[] = [];
  const invalid: string[] = [];
  const sanitized: Record<string, string> = {};
  const seen = new Set<string>();
  const duplicates: string[] = [];

  for (const raw of names) {
    if (!raw || typeof raw !== "string") {
      invalid.push(String(raw));
      continue;
    }
    if (seen.has(raw)) duplicates.push(raw);
    seen.add(raw);

    if (isValidToolName(raw)) valid.push(raw);
    else {
      invalid.push(raw);
      sanitized[raw] = sanitizeToolName(raw);
    }
  }
  return { valid, invalid, sanitized, duplicates };
}

// v2.1.14 merge: request.ts's delegating isLikelyAntigravityOnlyModel alias
// (formerly directly below) was dropped; the richer standalone heuristic from
// request-helpers.ts (see the model helpers section above) is canonical.

// ---------------------------------------------------------------------------
// Merged: tool name validation
// ---------------------------------------------------------------------------

/**
 * Validates one tool name against the Gemini naming rules.
 *
 * @param name - candidate name of any type
 */
export function validateToolName(name: unknown): boolean {
  if (typeof name !== "string") return false;
  const t = name.trim();
  if (t.length < TOOL_NAME_MIN_LENGTH || t.length > TOOL_NAME_MAX_LENGTH) return false;
  return TOOL_NAME_REGEX.test(t);
}

// ============================================================================
// 05. validateToolNames()
// ============================================================================

// Tool name validation constants (TOOL_NAME_REGEX, TOOL_NAME_MAX_LENGTH)
// are module-wide exports defined in the constants section above.

export interface InvalidToolName {
  name: string;
  reason: string;
}

export interface SanitizedToolName {
  original: string;
  sanitized: string;
}

export interface ValidateToolNamesDetailedResult {
  valid: boolean;
  validNames: string[];
  invalid: InvalidToolName[];
  sanitized: SanitizedToolName[];
  allSanitizedValid: boolean;
}

/**
 * Valida lista de nomes de tools. Gemini exige ^[A-Za-z_][A-Za-z0-9_]*$ e max 64.
 *
 * v2.1.14 merge note: renamed from validateToolNames (request-helpers.ts);
 * the canonical TOOL_NAME_REGEX (letter start + 64 cap, from request.ts)
 * now backs this validator.
 *
 * @param tools - array de string, array de {name}, ou Record<string,any>
 * @returns resultado com valid/invalid/sanitized
 */
export function validateToolNamesDetailed(
  tools: Array<string | { name: string; [k: string]: unknown }> | Record<string, unknown>,
): ValidateToolNamesDetailedResult {
  let names: string[] = [];

  if (Array.isArray(tools)) {
    for (const item of tools) {
      if (typeof item === "string") names.push(item);
      else if (isPlainObject(item) && typeof (item as any).name === "string") names.push((item as any).name);
    }
  } else if (isPlainObject(tools)) {
    // se for Record de toolName -> schema, chaves são nomes
    names = Object.keys(tools as Record<string, unknown>);
  }

  // deduplica mantendo ordem para validação, mas mantém duplicatas para report? Vamos dedup para validNames
  const seen = new Set<string>();
  const uniqueNames: string[] = [];
  for (const n of names) {
    if (!seen.has(n)) {
      seen.add(n);
      uniqueNames.push(n);
    }
  }

  const invalid: InvalidToolName[] = [];
  const validNames: string[] = [];
  const sanitized: SanitizedToolName[] = [];

  for (const name of uniqueNames) {
    if (!name || typeof name !== "string") {
      invalid.push({ name: String(name), reason: "empty or not string" });
      sanitized.push({ original: String(name), sanitized: "_tool" });
      continue;
    }
    if (name.length > TOOL_NAME_MAX_LENGTH) {
      invalid.push({ name, reason: `exceeds ${TOOL_NAME_MAX_LENGTH} chars` });
    } else if (!TOOL_NAME_REGEX.test(name)) {
      let reason = "must start with letter or underscore and contain only alphanum + underscore";
      if (/^[0-9]/.test(name)) reason = "must not start with digit";
      else if (/[^A-Za-z0-9_]/.test(name)) reason = "contains invalid characters (only A-Za-z0-9_ allowed)";
      else if (!name.length) reason = "empty";
      invalid.push({ name, reason });
    } else {
      validNames.push(name);
    }

    const s = sanitizeToolName(name);
    // se original inválido, adiciona sanitizado
    if (!TOOL_NAME_REGEX.test(name) || name.length > TOOL_NAME_MAX_LENGTH) {
      sanitized.push({ original: name, sanitized: s });
    }
  }

  const allSanitized = sanitized.map((s) => s.sanitized).concat(validNames);
  const allSanitizedValid = allSanitized.every((n) => TOOL_NAME_REGEX.test(n) && n.length <= TOOL_NAME_MAX_LENGTH);

  return {
    valid: invalid.length === 0,
    validNames,
    invalid,
    sanitized,
    allSanitizedValid,
  };
}

// ---------------------------------------------------------------------------
// Merged: transformTools — clean + validate + google_search injection
// ---------------------------------------------------------------------------

/**
 * Converts OpenCode tool definitions into the Cloud Code Assist tools payload:
 * validates names, sanitizes invalid ones, cleans each schema, deduplicates by
 * final name, optionally injects `{ google_search: {} }`, and emits the
 * matching AUTO function-calling toolConfig.
 *
 * Kept alongside {@link validateAndSanitizeTools}, which returns flat
 * declarations instead of a wrapped payload.
 *
 * @param openTools - raw tools in OpenAI/Anthropic/Gemini shapes
 * @param enableGoogleSearch - inject the google_search built-in tool
 * @returns tools payload, tool config and sanitized-name map
 */
export function transformTools(
  openTools: OpenCodeTool[] | undefined,
  enableGoogleSearch?: boolean,
): TransformToolsResult {
  const sanitizedMap: Record<string, string> = {};
  const functionDeclarations: GeminiFunctionDeclaration[] = [];

  if (openTools && Array.isArray(openTools) && openTools.length > 0) {
    const names: string[] = (openTools as Array<{ name?: string }>).map((t) => t.name).filter(Boolean) as string[];
    const validation = validateToolNames(names);

    for (const inv of validation.invalid) {
      sanitizedMap[inv] = validation.sanitized[inv] || sanitizeToolName(inv);
    }

    for (const entry of openTools as any[]) {
      if (!entry || !entry.name) continue;
      const originalName: string = entry.name;
      const name = isValidToolName(originalName)
        ? originalName
        : sanitizedMap[originalName] || sanitizeToolName(originalName);

      // Accept the schema from any known alias key
      const rawSchema = entry.input_schema ??
        entry.inputSchema ??
        entry.parameters ??
        entry.schema ?? { type: "object", properties: {} };

      const cleaned = cleanToolSchema(rawSchema);

      functionDeclarations.push({
        name,
        description: entry.description || `Function ${name}`,
        parameters: cleaned,
      });
    }
  }

  const toolsPayload: any[] = [];

  if (functionDeclarations.length > 0) {
    // Deduplicate by name — last declaration wins
    const dedup = new Map<string, GeminiFunctionDeclaration>();
    for (const fd of functionDeclarations) dedup.set(fd.name, fd);
    toolsPayload.push({ functionDeclarations: Array.from(dedup.values()) });
  }

  if (enableGoogleSearch) {
    // Gemini 3+ uses { google_search: {} }, legacy uses { google_search_retrieval: {} }
    toolsPayload.push({ google_search: {} });
  }

  const tools = toolsPayload.length > 0 ? toolsPayload : undefined;

  let toolConfig: TransformToolsResult["toolConfig"];
  if (functionDeclarations.length > 0) {
    toolConfig = {
      functionCallingConfig: {
        mode: "AUTO",
        allowedFunctionNames: Array.from(new Set(functionDeclarations.map((f) => f.name))),
      },
    };
  }

  return { tools, toolConfig, sanitizedMap };
}

// ---------------------------------------------------------------------------
// Merged: RequestTransformer barrel
// ---------------------------------------------------------------------------

/**
 * Named bundle mirroring the legacy ONDA 4 module surface. The default export
 * remains {@link RequestPipeline}; both barrels stay available.
 */
export const RequestTransformer = {
  // bypass constants
  GEMINI_CLI_OAUTH_CLIENT_ID,
  GEMINI_CLI_OAUTH_CLIENT_SECRET,
  GEMINI_CLI_USER_AGENT,
  X_GOOG_API_CLIENT,
  CLIENT_METADATA,
  CLIENT_METADATA_STRING,
  FALLBACK_PROJECT_ID,
  CLOUDCODE_PA_BASE,
  CLOUDCODE_DAILY_BASE,
  // legacy member keeps its historical method-path value (v2.1.15 Phase A
  // renamed the local map to CODE_ASSIST_METHOD_PATHS; the module-level
  // CODE_ASSIST_ENDPOINTS export now resolves to the models.ts host map)
  CODE_ASSIST_ENDPOINTS: CODE_ASSIST_METHOD_PATHS,
  CODE_ASSIST_METHOD_PATHS,
  MODELS_2026: FETCH_AVAILABLE_MODELS_2026,
  THINKING_BUDGET_MAP,

  // core FNV
  fnv1a32,
  fnv1a64BigInt,
  buildSessionIdFromDir,
  buildSessionId,
  buildUserPromptId,

  // tools
  sanitizeToolName,
  isValidToolName,
  validateToolNames,
  cleanToolSchema,
  cleanToolSchemas,
  transformTools,

  // thinking
  normalizeThinkingLevel,
  mapThinkingLevelToBudget,

  // models
  isGeminiCLIOnlyModel,
  isLikelyAntigravityOnlyModel,

  // generation
  buildGenerationConfigFromRequest,
  buildBypassHeaders,

  // main
  transformRequest,
  buildAntigravityRequest,
  buildGeminiCLIRequest,
} as const;

// ---------------------------------------------------------------------------
// Barrel exports — library-first
// ---------------------------------------------------------------------------

export const RequestPipeline = {
  transformRequest,
  buildAntigravityRequest,
  buildGeminiCLIRequest,
  isGeminiCLIOnlyModel,
  getEndpointsForModel,
  fnv1a32,
  fnv1a32Hex,
  generateDeterministicId,
  generateSessionId,
  generateUserPromptId,
  sanitizeToolName,
  ensureUniqueToolNames,
  validateAndSanitizeTools,
  cleanJsonSchema,
  mapThinkingBlock,
  sortThoughtFirst,
  filterAndMapThinkingParts,
  injectGoogleSearchTool,
  stripForbiddenHeaders,
  stripXGoogUserProjectHeader,
  getFingerprintHeaders,
  buildDynamicUserAgent,
  fetchWithCascade,
  parseModelId,
  extractThinkingLevel,
};

// ============================================================================
// 12. DEFAULT EXPORT + NAMED EXPORTS BUNDLE
// ============================================================================

export function stripForbiddenHeaders(headers: Record<string, string>): Record<string, string> {
  if (!headers || typeof headers !== "object") return {};
  const forbidden = new Set(FORBIDDEN_HEADERS.map((h) => h.toLowerCase()));
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(headers)) {
    if (!k) continue;
    const low = k.toLowerCase().trim();
    if (forbidden.has(low)) continue;
    if (low === "x-goog-user-project") continue;
    out[k] = v;
  }
  return out;
}
// ===========================================================================
/** Cloud Code streaming method path (family owner — former plugin.ts local). */
export const STREAM_METHOD = "/v1internal:streamGenerateContent?alt=sse" as const;
/** Cloud Code non-streaming method path. */
export const GENERATE_METHOD = "/v1internal:generateContent" as const;
/** Cloud Code loadCodeAssist method path (project discovery). */
export const LOAD_METHOD = "/v1internal:loadCodeAssist" as const;
/** Cloud Code onboardUser method path (project discovery). */
export const ONBOARD_METHOD = "/v1internal:onboardUser" as const;

// v2.1.15 Phase D: LIVE request pipeline moved from plugin.ts — request
// building lives ONLY in request.ts. This is the opencode-validated chain
// (transformRequest + buildCloudCodeBody + buildAntigravityRequest +
// buildGeminiCLIRequest + fetchWithCascade with their helper cluster).
// The former RequestHelpers-lineage implementations of these families were
// deleted; the live shapes are now the canonical public API.
// ===========================================================================

export const TOOL_NAME_REGEX = /^[a-zA-Z][a-zA-Z0-9_]{0,63}$/;

function sanitizeToolName(name: string): string {
  if (typeof name !== "string") return `tool_${fnv1a32Hex(String(name ?? "")).slice(0, 8)}`;
  let t = name.trim();
  if (!t) return `tool_${fnv1a32Hex(name).slice(0, 8)}`;
  t = t.replace(/[^a-zA-Z0-9_]/g, "_").replace(/__+/g, "_");
  if (!/^[a-zA-Z]/.test(t)) t = `tool_${t.replace(/^[^a-zA-Z]+/, "")}`;
  t = t.slice(0, 64);
  if (!TOOL_NAME_REGEX.test(t)) t = `a${t.slice(0, 63)}`;
  return t;
}
function ensureUniqueToolNames(names: string[]): string[] {
  const seen = new Map<string, number>();
  const out: string[] = [];
  for (let raw of names) {
    let cand = raw;
    let cnt = seen.get(raw) ?? 0;
    if (cnt > 0 || out.includes(cand)) {
      let idx = 1;
      while (out.includes(`${raw}_${idx}`)) idx++;
      cand = `${raw}_${idx}`.slice(0, 64);
    }
    seen.set(raw, (seen.get(raw) ?? 0) + 1);
    out.push(cand);
  }
  return out;
}
function cleanJsonSchema(input: any, seen = new WeakSet()): any {
  if (input == null) return { type: "OBJECT", properties: {} };
  if (typeof input === "boolean")
    return input ? { type: "OBJECT", properties: {} } : { type: "OBJECT", properties: {}, description: "disallowed" };
  if (Array.isArray(input)) return input.map((i) => cleanJsonSchema(i, seen));
  if (typeof input !== "object") return { type: "STRING" };
  if (seen.has(input)) return { type: "OBJECT", properties: {} };
  seen.add(input);
  const out: any = {};
  if (input.type) {
    let rt = Array.isArray(input.type) ? (input.type.find((t: any) => t !== "null") ?? input.type[0]) : input.type;
    if (typeof rt === "string") out.type = rt.toUpperCase();
  }
  for (const k of Object.keys(input)) {
    if (!CLEAN_SCHEMA_KEYS.has(k)) continue;
    const v = (input as any)[k];
    if (k === "properties" && typeof v === "object" && v !== null) {
      out.properties = {};
      for (const [pk, pv] of Object.entries(v)) out.properties[pk] = cleanJsonSchema(pv, seen);
    } else if ((k === "items" || k === "anyOf" || k === "oneOf") && v) {
      out[k] = cleanJsonSchema(v, seen);
    } else if (v !== undefined) {
      out[k] = v;
    }
  }
  if (!out.type && out.properties) out.type = "OBJECT";
  if (!out.type) out.type = "OBJECT";
  return out;
}
function validateAndSanitizeTools(rawTools?: any[]): { declarations: any[] } {
  if (!rawTools || !Array.isArray(rawTools) || rawTools.length === 0) return { declarations: [] };
  const decls: any[] = [];
  for (const entry of rawTools) {
    if (!entry) continue;
    if (entry.functionDeclarations && Array.isArray(entry.functionDeclarations)) {
      for (const fd of entry.functionDeclarations) {
        if (!fd?.name) continue;
        decls.push({
          name: sanitizeToolName(String(fd.name)),
          description: fd.description ? String(fd.description).slice(0, 1024) : undefined,
          parameters: fd.parameters ? cleanJsonSchema(fd.parameters) : { type: "OBJECT", properties: {} },
          originalName: String(fd.name),
        });
      }
      continue;
    }
    if (entry.type === "function" && entry.function) {
      const fn = entry.function;
      if (!fn.name) continue;
      decls.push({
        name: sanitizeToolName(String(fn.name)),
        description: fn.description ? String(fn.description).slice(0, 1024) : undefined,
        parameters: fn.parameters ? cleanJsonSchema(fn.parameters) : { type: "OBJECT", properties: {} },
        originalName: String(fn.name),
      });
      continue;
    }
    if (entry.name) {
      const schemaRaw = entry.input_schema ?? entry.inputSchema ?? entry.parameters ?? entry.schema;
      decls.push({
        name: sanitizeToolName(String(entry.name)),
        description: entry.description ? String(entry.description).slice(0, 1024) : undefined,
        parameters: schemaRaw ? cleanJsonSchema(schemaRaw) : { type: "OBJECT", properties: {} },
        originalName: String(entry.name),
      });
      continue;
    }
  }
  const names = decls.map((d) => d.name);
  const unique = ensureUniqueToolNames(names);
  for (let i = 0; i < decls.length; i++) decls[i].name = unique[i];
  return { declarations: decls };
}

// v2.1.15 Phase A: isGeminiCLIOnlyModel moved to models.ts (canonical
// request-lineage implementation — classification superset of this local
// variant) — imported and re-exported at the top of this file.

// v2.1.15 Phase D: shouldSkipSandbox lives in models.js (classifier owner) — imported.

// v2.1.15 Phase A: getEndpointsForModel moved to models.ts (canonical
// request-lineage implementation; the former local shouldSkipSandbox
// consultation is subsumed by the canonical classifier) — imported and
// re-exported at the top of this file.

function buildDynamicUserAgentFromPlatform(version?: string): string {
  return getDynamicUserAgent(version);
}

function buildCommonHeaders(
  opts: { accessToken: string; userAgent?: string | undefined; version?: string | undefined },
  style: "antigravity" | "gemini-cli" = "antigravity",
): Record<string, string> {
  const ua = opts.userAgent ?? buildDynamicUserAgentFromPlatform(opts.version);
  const headers: Record<string, string> = {
    Authorization: `Bearer ${opts.accessToken}`,
    "Content-Type": "application/json",
    "User-Agent": ua,
  };
  // gemini-cli adds X-Goog-Api-Client but AM does not — observer includes only for gemini-cli pool when cli_first
  if (style === "gemini-cli") {
    try {
      const nodeVer = (process as any)?.versions?.node ?? "20.0.0";
      headers["X-Goog-Api-Client"] =
        `antigravity/${opts.version ?? ANTIGRAVITY_VERSION_FALLBACK} gl-node/${nodeVer} gax/4.9.0 grpc/1.14.0`;
      headers["Client-Metadata"] =
        `ideType=ANTIGRAVITY,platform=${normalizePlatform(osPlatform()).toUpperCase()},ideVersion=${opts.version ?? ANTIGRAVITY_VERSION_FALLBACK},pluginVersion=${PLUGIN_VERSION}`;
    } catch {}
  }
  return stripForbiddenHeaders(headers);
}

// v2.1.15 Phase B: buildAntigravityClientMetadata was dead (zero callers) — deleted;
// fingerprint.js buildClientMetadata is the canonical metadata builder.

// v2.1.15 Phase A: mapModelToGroup moved to models.ts (canonical merged
// implementation) — imported and re-exported at the top of this file.

// deterministic ids
export function generateDeterministicId(seed: string): string {
  return fnv1a32Hex(seed);
}
export function generateSessionId(seed?: string, offsetEnabled?: boolean): string {
  const base = seed ?? `${Date.now()}-${randomBytes(4).toString("hex")}`;
  const offset = offsetEnabled ? randomInt(0, 1001) : 0;
  return fnv1a32Hex(`${base}-${offset}-session`);
}
export function generateUserPromptId(seed?: string, offsetEnabled?: boolean): string {
  const base = seed ?? `${Date.now()}-${randomBytes(4).toString("hex")}`;
  const offset = offsetEnabled ? randomInt(0, 1001) : 0;
  // 9router pid_offset trick 0-1000 added to user_prompt_id for anti-fingerprint jitter
  return fnv1a32Hex(`${base}-${offset}-user-prompt-${offsetEnabled ? offset : 0}`);
}

// ---------------------------------------------------------------------------
// Transform OpenAI/Anthropic messages → Gemini contents
// ---------------------------------------------------------------------------

// v2.1.15 Phase D: the live pipeline uses the exported superset interfaces
// GeminiPart/GeminiContent/GeminiSystem above (one type family, one owner).

interface TransformRequestOptions {
  model: string;
  messages?: any[] | undefined;
  tools?: any[] | undefined;
  system?: string | any | undefined;
  thinkingLevel?: string | undefined;
  thinkingBudget?: number | undefined;
  googleSearchEnabled?: boolean | undefined;
  generationConfig?: any | undefined;
  sessionSeed?: string | undefined;
  userPromptSeed?: string | undefined;
  projectId?: string | undefined;
  pidOffsetEnabled?: boolean | undefined;
  claudeToolHardening?: boolean | undefined;
  keepThinking?: boolean | undefined;
}

interface TransformResult {
  contents: GeminiContent[];
  systemInstruction?: GeminiSystem | undefined;
  tools?: any[] | undefined;
  toolConfig?: any | undefined;
  generationConfig?: any | undefined;
  sessionId: string;
  userPromptId: string;
  thinkingBudget?: number | undefined;
  thinkingLevel?: ThinkingLevel | undefined;
}

function extractThinkingLevel(modelId: string, explicit?: string): { level?: ThinkingLevel; budget?: number } {
  const exp = (explicit ?? "").toLowerCase().trim();
  if (exp && (THINKING_LEVELS as readonly string[]).includes(exp))
    return { level: exp as ThinkingLevel, budget: THINKING_BUDGET_MAP[exp as ThinkingLevel] };
  const lower = (modelId ?? "").toLowerCase();
  for (const lvl of THINKING_LEVELS)
    if (lower.includes(`-${lvl}`))
      return { level: lvl as ThinkingLevel, budget: THINKING_BUDGET_MAP[lvl as ThinkingLevel] };
  if (lower.includes("thinking"))
    return {
      level: lower.includes("claude") ? "medium" : "low",
      budget: THINKING_BUDGET_MAP[lower.includes("claude") ? "medium" : "low"],
    };
  return {};
}

function openAIContentToParts(content: any): GeminiPart[] {
  if (content == null) return [{ text: "" }];
  if (typeof content === "string") return [{ text: content }];
  if (Array.isArray(content)) {
    const parts: GeminiPart[] = [];
    for (const c of content) {
      if (!c) continue;
      if (typeof c === "string") parts.push({ text: c });
      else if (c.type === "text" && c.text) parts.push({ text: c.text });
      else if (c.type === "image_url" && c.image_url?.url) {
        // data url handling (linear parse, no capture-group regex on uncontrolled input)
        const url = c.image_url.url;
        const sep = url.lastIndexOf(";base64,");
        if (url.startsWith("data:") && sep > 5 && sep + 8 < url.length) {
          parts.push({ inlineData: { mimeType: url.slice(5, sep), data: url.slice(sep + 8) } });
        } else parts.push({ text: `[image: ${url.slice(0, 200)}]` });
      } else if (c.text) parts.push({ text: String(c.text) });
    }
    return parts.length ? parts : [{ text: "" }];
  }
  if (typeof content === "object" && (content as any).text) return [{ text: String((content as any).text) }];
  return [{ text: String(content) }];
}

export function transformRequest(opts: TransformRequestOptions): TransformResult {
  const {
    model,
    messages = [],
    tools,
    system,
    thinkingLevel: explicitThinkingLevel,
    thinkingBudget: explicitBudget,
    googleSearchEnabled,
    generationConfig,
    sessionSeed,
    userPromptSeed,
    pidOffsetEnabled,
    claudeToolHardening,
    keepThinking,
  } = opts;

  const { level: inferredLevel, budget: inferredBudget } = extractThinkingLevel(model, explicitThinkingLevel);
  const finalLevel = inferredLevel ?? (explicitThinkingLevel as ThinkingLevel | undefined);
  const finalBudget = explicitBudget ?? inferredBudget ?? (finalLevel ? THINKING_BUDGET_MAP[finalLevel] : undefined);

  // system instruction extraction
  let sysText = "";
  if (typeof system === "string") sysText = system;
  else if (Array.isArray(system)) sysText = system.map((s) => (typeof s === "string" ? s : (s.text ?? ""))).join("\n");
  else if (system && typeof system === "object" && (system as any).text) sysText = String((system as any).text);

  // also extract system role from messages
  const filteredMessages: any[] = [];
  for (const m of messages) {
    if (!m) continue;
    if (m.role === "system") {
      const t =
        typeof m.content === "string"
          ? m.content
          : Array.isArray(m.content)
            ? m.content.map((c: any) => c.text ?? "").join("\n")
            : String(m.content ?? "");
      sysText = sysText ? `${sysText}\n${t}` : t;
    } else {
      filteredMessages.push(m);
    }
  }

  const systemInstruction: GeminiSystem = sysText ? { parts: [{ text: sysText }] } : undefined;

  const contents: GeminiContent[] = [];
  for (const m of filteredMessages) {
    if (!m) continue;
    const roleRaw = String(m.role ?? "user").toLowerCase();
    const role: "user" | "model" = roleRaw === "assistant" || roleRaw === "model" ? "model" : "user";

    // tool messages
    if (roleRaw === "tool" || roleRaw === "function") {
      const toolName = m.tool_call_id ?? m.name ?? m.toolName ?? "tool";
      const sanitizedName = sanitizeToolName(String(toolName));
      const contentStr = typeof m.content === "string" ? m.content : JSON.stringify(m.content ?? {});
      let parsed: any;
      try {
        parsed = JSON.parse(contentStr);
      } catch {
        parsed = { result: contentStr };
      }
      contents.push({
        role: "user",
        parts: [{ functionResponse: { name: sanitizedName, response: parsed } }],
      });
      continue;
    }

    // assistant with tool_calls
    if (role === "model" && Array.isArray(m.tool_calls) && m.tool_calls.length > 0) {
      const parts: GeminiPart[] = [];
      const textParts = openAIContentToParts(m.content);
      for (const tp of textParts) if (tp.text) parts.push(tp);
      for (const tc of m.tool_calls) {
        const fn = tc.function ?? tc;
        const name = sanitizeToolName(String(fn.name ?? tc.name ?? "tool"));
        let args: any = fn.arguments ?? fn.args ?? {};
        if (typeof args === "string") {
          try {
            args = JSON.parse(args);
          } catch {
            args = { raw: args };
          }
        }
        parts.push({ functionCall: { name, args } });
      }
      if (parts.length > 0) contents.push({ role, parts });
      continue;
    }

    // Anthropic tool_use
    if (Array.isArray(m.content) && m.content.some((c: any) => c?.type === "tool_use")) {
      const parts: GeminiPart[] = [];
      for (const c of m.content) {
        if (c.type === "text") parts.push({ text: c.text });
        else if (c.type === "tool_use")
          parts.push({ functionCall: { name: sanitizeToolName(c.name), args: c.input ?? {} } });
      }
      contents.push({ role, parts: parts.length ? parts : [{ text: "" }] });
      continue;
    }

    // regular
    const parts = openAIContentToParts(m.content ?? "");
    // thinking blocks mapping when model is thinking variant: if parts contain thinking tag? skip for now
    contents.push({ role, parts: parts.length ? parts : [{ text: "" }] });
  }

  // tools sanitization + google_search injection
  let geminiTools: any[] | undefined;
  if (tools && tools.length > 0) {
    const { declarations } = validateAndSanitizeTools(tools);
    if (declarations.length > 0) {
      // claude_tool_hardening: prefix descriptions so Claude models respect schema constraints
      const harden = !!claudeToolHardening && model.toLowerCase().includes("claude");
      geminiTools = [
        {
          functionDeclarations: declarations.map((d) => ({
            name: d.name,
            description: harden ? `[tool_hardening] ${d.description ?? ""}`.trim() : d.description,
            parameters: d.parameters,
          })),
        },
      ];
    }
  }

  if (googleSearchEnabled) {
    const modelLower = model.toLowerCase();
    const isGemini = modelLower.includes("gemini");
    if (isGemini) {
      // inject google_search grounding tool as per Gemini spec
      if (!geminiTools) geminiTools = [];
      // avoid duplicate
      const hasSearch = geminiTools.some((t: any) => t.googleSearch || t.google_search);
      if (!hasSearch) geminiTools.push({ googleSearch: {} });
    }
  }

  // generationConfig
  const genConfig: any = { ...(generationConfig ?? {}) };
  if (finalBudget) {
    // Gemini 3 thinking budget
    genConfig.thinkingConfig = { thinkingBudget: finalBudget, ...(finalLevel ? { thinkingLevel: finalLevel } : {}) };
  }
  if (keepThinking) {
    // keep_thinking: request reasoning back and preserve signatures end-to-end
    genConfig.thinkingConfig = { ...(genConfig.thinkingConfig ?? {}), includeThoughts: true, keepThinking: true };
  }
  // normalize temperature etc
  if (genConfig.temperature === undefined) genConfig.temperature = 1.0;

  const sessionId = generateSessionId(sessionSeed ?? `${model}-${contents.length}-${Date.now()}`, pidOffsetEnabled);
  const userPromptId = generateUserPromptId(
    userPromptSeed ?? `${model}-${sysText.slice(0, 50)}-${Date.now()}`,
    pidOffsetEnabled,
  );

  return {
    contents,
    systemInstruction,
    tools: geminiTools,
    generationConfig: genConfig,
    sessionId,
    userPromptId,
    thinkingBudget: finalBudget,
    thinkingLevel: finalLevel,
  };
}

export function buildCloudCodeBody(projectId: string, inner: TransformResult): Record<string, any> {
  // Gemini CLI exact wrapping: {model, project, request: {contents, systemInstruction, tools, generationConfig, toolConfig?}}
  // NOTE: session_id / user_prompt_id are metadata ONLY (logs/fingerprint) — the live
  // cloudcode-pa v1internal:streamGenerateContent schema rejects unknown root fields
  // (verified live 2026-08-26: "Unknown name \"session_id\": Cannot find field" -> 400).
  const request: any = {
    contents: inner.contents,
  };
  if (inner.systemInstruction) request.systemInstruction = inner.systemInstruction;
  if (inner.tools && inner.tools.length > 0) request.tools = inner.tools;
  if (inner.toolConfig) request.toolConfig = inner.toolConfig;
  if (inner.generationConfig) request.generationConfig = inner.generationConfig;

  return {
    model: undefined, // filled by caller wrapper
    project: projectId,
    request,
  };
}

export interface BuildOptions {
  model: string;
  messages?: any[] | undefined;
  tools?: any[] | undefined;
  system?: any | undefined;
  thinkingLevel?: string | undefined;
  thinkingBudget?: number | undefined;
  googleSearchEnabled?: boolean | undefined;
  generationConfig?: any | undefined;
  accessToken: string;
  projectId: string;
  endpointOverrides?: string[] | undefined;
  userAgent?: string | undefined;
  antigravityVersion?: string | undefined;
  methodSuffix?: string | undefined;
  sessionSeed?: string | undefined;
  userPromptSeed?: string | undefined;
  pidOffsetEnabled?: boolean | undefined;
  claudeToolHardening?: boolean | undefined;
  keepThinking?: boolean | undefined;
}

export interface BuildResult {
  url: string;
  endpoints: string[];
  baseEndpoints: string[];
  headers: Record<string, string>;
  body: Record<string, any>;
  sessionId: string;
  userPromptId: string;
  isGeminiCLIOnly: boolean;
  method: string;
  innerRequest: TransformResult;
}

/**
 * Shared prologue of {@link buildAntigravityRequest} and
 * {@link buildGeminiCLIRequest}: validates the common build options, resolves
 * the fallback project id and runs the 16-field {@link transformRequest}
 * call. v2.1.16 pure refactor — the two builders previously carried a
 * byte-identical 25-line copy of this block; wire bytes and thrown error
 * messages are unchanged.
 *
 * @param options - shared build options (model, messages, tools, seeds, ...)
 * @param label - error-message suffix ("" for the antigravity variant,
 *                " for Gemini CLI" for the gemini-cli variant)
 */
function prepareBuildOptions(
  options: BuildOptions,
  label = "",
): { projectId: string; token: string; model: string; inner: TransformResult } {
  if (!options) throw new Error(`build options required${label}`);
  const projectId = String(options.projectId ?? "").trim() || FALLBACK_PROJECT_ID;
  const token = String(options.accessToken ?? "").trim();
  if (!token) throw new Error("accessToken required");
  const model = String(options.model ?? "").trim();
  if (!model) throw new Error(`model required${label}`);

  const inner = transformRequest({
    model: options.model,
    messages: options.messages,
    tools: options.tools,
    system: options.system,
    thinkingLevel: options.thinkingLevel,
    thinkingBudget: options.thinkingBudget,
    googleSearchEnabled: options.googleSearchEnabled,
    generationConfig: options.generationConfig,
    sessionSeed: options.sessionSeed,
    userPromptSeed: options.userPromptSeed,
    projectId,
    pidOffsetEnabled: options.pidOffsetEnabled,
    claudeToolHardening: options.claudeToolHardening,
    keepThinking: options.keepThinking,
  });

  return { projectId, token, model, inner };
}

export function buildAntigravityRequest(options: BuildOptions): BuildResult {
  const { projectId, token, model, inner } = prepareBuildOptions(options);

  const bases = getEndpointsForModel(model, options.endpointOverrides);
  const fullEndpoints = bases.map((b) => `${stripTrailingSlashes(b)}${options.methodSuffix ?? STREAM_METHOD}`);

  const version = options.antigravityVersion ?? ANTIGRAVITY_VERSION_FALLBACK;
  const headers = buildCommonHeaders({ accessToken: token, userAgent: options.userAgent, version }, "antigravity");

  const bodyWrapper = buildCloudCodeBody(projectId, inner);
  // bodyWrapper.model set here
  bodyWrapper.model = model;
  // keep request key as spec requires {model, project, request}
  // session_id / user_prompt_id stay OUT of the wire body (schema-verified) —
  // they remain available as BuildResult.sessionId / .userPromptId metadata.
  const body = {
    model: bodyWrapper.model,
    project: bodyWrapper.project,
    request: bodyWrapper.request,
  };

  return {
    url: fullEndpoints[0]!,
    endpoints: fullEndpoints,
    baseEndpoints: bases,
    headers,
    body,
    sessionId: inner.sessionId,
    userPromptId: inner.userPromptId,
    isGeminiCLIOnly: isGeminiCLIOnlyModel(model),
    method: "POST",
    innerRequest: inner,
  };
}

export function buildGeminiCLIRequest(options: BuildOptions): BuildResult {
  const { projectId, token, model, inner } = prepareBuildOptions(options, " for Gemini CLI");

  const rawBases = getEndpointsForModel(model, options.endpointOverrides);
  const filteredBases = rawBases.filter((b) => !b.toLowerCase().includes("sandbox"));
  const bases = filteredBases.length > 0 ? filteredBases : [CODE_ASSIST_ENDPOINTS.PROD];
  const fullEndpoints = bases.map((b) => `${stripTrailingSlashes(b)}${options.methodSuffix ?? STREAM_METHOD}`);

  const version = options.antigravityVersion ?? ANTIGRAVITY_VERSION_FALLBACK;
  const headers = buildCommonHeaders({ accessToken: token, userAgent: options.userAgent, version }, "gemini-cli");

  const bodyWrapper = buildCloudCodeBody(projectId, inner);
  // session_id / user_prompt_id stay OUT of the wire body (schema-verified live:
  // cloudcode-pa rejects unknown root fields with 400 INVALID_ARGUMENT) —
  // they remain as BuildResult metadata for logging/fingerprinting.
  const body = {
    model,
    project: projectId,
    request: bodyWrapper.request,
  };

  return {
    url: fullEndpoints[0]!,
    endpoints: fullEndpoints,
    baseEndpoints: bases,
    headers,
    body,
    sessionId: inner.sessionId,
    userPromptId: inner.userPromptId,
    isGeminiCLIOnly: true,
    method: "POST",
    innerRequest: inner,
  };
}

export async function fetchWithCascade(
  buildResult: BuildResult,
  fetchOptions?: { signal?: AbortSignal; timeoutMs?: number },
): Promise<Response> {
  if (!buildResult || !Array.isArray(buildResult.endpoints) || buildResult.endpoints.length === 0)
    throw new Error("buildResult with endpoints required");
  let lastError: Error | null = null;

  for (const endpointUrl of buildResult.endpoints) {
    const controller = new AbortController();
    const timeoutMs = fetchOptions?.timeoutMs ?? CONTENT_TIMEOUT_MS;
    const to = setTimeout(() => controller.abort(), timeoutMs);

    const signal = fetchOptions?.signal
      ? (() => {
          const combined = new AbortController();
          const onExt = () => combined.abort();
          fetchOptions.signal!.addEventListener("abort", onExt, { once: true });
          controller.signal.addEventListener("abort", () => combined.abort());
          return combined.signal;
        })()
      : controller.signal;

    try {
      const jitter = getJitter();
      if (jitter > 0) await new Promise((r) => setTimeout(r, jitter));

      const headers = stripForbiddenHeaders(buildResult.headers);

      const res = await fetch(endpointUrl, {
        method: buildResult.method,
        headers,
        body: JSON.stringify(buildResult.body),
        signal,
      });

      if (res.status === 403 || res.status === 404 || res.status >= 500) {
        // Permanent entitlement/region denials must surface immediately with
        // Google's own message — retrying other endpoints/accounts only burns
        // minutes and hides the real cause (verified live: UNSUPPORTED_LOCATION).
        if (res.status === 403) {
          const probe = res.clone();
          const bodyTxt = await probe.text().catch(() => "");
          const low = bodyTxt.toLowerCase();
          if (low.includes("location") || low.includes("not eligible") || low.includes("unsupported_location")) {
            clearTimeout(to);
            return res;
          }
        }
        lastError = new Error(`cascade retryable status ${res.status} at ${endpointUrl}`);
        continue;
      }
      clearTimeout(to);
      return res;
    } catch (e: any) {
      clearTimeout(to);
      lastError = e instanceof Error ? e : new Error(String(e));
      if (fetchOptions?.signal?.aborted) throw lastError;
      continue;
    } finally {
      clearTimeout(to);
    }
  }
  throw lastError ?? new Error("all endpoints failed in cascade");
}

export const BYPASS_CONSTANTS = {
  directEndpoint: DIRECT_ENDPOINT,
  dailyEndpoint: DAILY_ENDPOINT,
  sandboxEndpoint: AUTOPUSH_ENDPOINT,
  endpointCascade: ENDPOINT_CASCADE,
  headersToStrip: HEADERS_TO_STRIP,
  toolNamePattern: TOOL_NAME_REGEX.source,
  maxToolNameLength: TOOL_NAME_MAX_LENGTH,
  maxToolsPerRequest: MAX_TOOLS_PER_REQUEST,
  thinkingBudgetMap: THINKING_BUDGET_MAP,
  fnvOffsetBasis: FNV_OFFSET_BASIS,
  fnvPrime: FNV_PRIME,
} as const;

// ===========================================================================
// v2.1.15 Phase D: Cloud Code method-path maps moved from fingerprint.ts and
// quota.ts — the API surface lives only in request.ts. (The bare ENDPOINTS
// name is the constants.js host map; these method maps are API_PATHS.)
// ===========================================================================

/** Full Cloud Code v1internal method URLs on the production base. */
export const API_PATHS = {
  loadCodeAssist: `${CODE_ASSIST_BASE_URL}${CODE_ASSIST_PATH_MAP.LOAD_CODE_ASSIST}`,
  onboardUser: `${CODE_ASSIST_BASE_URL}${CODE_ASSIST_PATH_MAP.ONBOARD_USER}`,
  fetchAvailableModels: `${CODE_ASSIST_BASE_URL}${CODE_ASSIST_PATH_MAP.FETCH_AVAILABLE_MODELS}`,
  generateContent: `${CODE_ASSIST_BASE_URL}${CODE_ASSIST_PATH_MAP.GENERATE_CONTENT}`,
  streamGenerateContent: `${CODE_ASSIST_BASE_URL}${CODE_ASSIST_PATH_MAP.STREAM_GENERATE_CONTENT}`,
  retrieveUserQuotaSummary: `${CODE_ASSIST_BASE_URL}${CODE_ASSIST_PATH_MAP.RETRIEVE_USER_QUOTA_SUMMARY}`,
} as const;

/** Daily-build method URLs (quota lineage: antigravity quota reads the daily base). */
export const API_PATHS_DAILY = {
  loadCodeAssist: `${CLOUDCODE_DAILY_BASE}${CODE_ASSIST_PATH_MAP.LOAD_CODE_ASSIST}`,
  retrieveUserQuotaSummary: `${CLOUDCODE_DAILY_BASE}${CODE_ASSIST_PATH_MAP.RETRIEVE_USER_QUOTA_SUMMARY}`,
} as const;

export const RequestHelpers = {
  // constants
  GEMINI_CLI_OAUTH_CLIENT_ID,
  GEMINI_CLI_OAUTH_CLIENT_SECRET,
  GEMINI_CLI_USER_AGENT,
  X_GOOG_API_CLIENT,
  CLIENT_METADATA_RAW,
  CLOUDCODE_PA_BASE,
  PROJECT_FALLBACK,
  MODELS_2026: FETCH_AVAILABLE_MODELS_2026,

  // core
  fnv1a32,
  fnv1a64BigInt,
  buildUserPromptId,
  buildSessionIdFromDir,
  isLikelyAntigravityOnlyModel,
  cleanToolSchemaTolerant,
  cleanToolSchemas,
  validateToolNamesDetailed,
  sanitizeToolName,
  filterThinkingBlocks,
  normalizeMessages,
  buildGenerationConfig,
  enhanceAgySdkErrorResponse,
  extractVariants,
  extractVariantsFromAny,

  // mappings
  THINKING_LEVEL_TO_BUDGET_GEMINI,
  THINKING_LEVEL_TO_BUDGET_CLAUDE,

  // merged: FNV + deterministic ids
  FNV_OFFSET_BASIS,
  FNV_PRIME,
  fnv1aHex,
  fnv1aHex16,
  fnv1aHash,
  generateDeterministicId,
  generateSessionId,
  generateUserPromptId,

  // merged: thinking budgets
  THINKING_BUDGET_MAP,
  THINKING_LEVELS,
  THINKING_BUDGET_MIN,
  THINKING_BUDGET_MAX,
  THINKING_BUDGET_MAX_GEMINI,
  THINKING_BUDGET_MAX_CLAUDE,
  parseThinkingLevel,
  mapThinkingLevelToBudget,
  thinkingLevelToBudget,
  getThinkingBudgetForVariant,

  // merged: model detection
  isGeminiCLIOnlyModel,
  extractModelVariant,
  parseModelVariant,

  // merged: tool names and schema cleaning
  TOOL_NAME_REGEX,
  TOOL_NAME_MIN_LENGTH,
  TOOL_NAME_MAX_LENGTH,
  MAX_TOOLS_PER_REQUEST,
  ALLOWED_SCHEMA_KEYS,
  ALLOWED_TOOL_TOP_KEYS,
  validateToolName,
  cleanJsonSchemaStrict,
  cleanRawToolSchema,
  cleanToolsArray,

  // merged: message normalization and thinking filters
  normalizeRole,
  normalizeContentToParts,
  normalizeIncomingMessages,
  isThinkingBlock,
  filterThinkingBlocksAuto,
  filterThinkingBlocksFromParts,
  filterThinkingBlocksFromMessages,

  // merged: transport helpers
  DIRECT_ENDPOINT,
  DAILY_ENDPOINT,
  AUTOPUSH_ENDPOINT,
  ENDPOINT_CASCADE,
  HEADERS_TO_STRIP,
  BYPASS_CONSTANTS,
  isRetryableStatus,
  stripForbiddenHeaders,

  // merged: error type
  RequestHelpersError,
} as const;

export default RequestPipeline;
