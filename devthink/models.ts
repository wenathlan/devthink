/**
 * @file models.ts
 * @module provider/models
 * @description
 *  Third-person observer view - library-first root-first, production-ready.
 *  Complete merged model catalog frozen at 25/08/2026.
 *
 *  v2.1.15 Phase A consolidation (models + project domain merge):
 *  this file is now THE single owner of every model-identification family —
 *  catalogs (MODELS_2026, MODELS_2026_BASE, MODELS_2026_08_25,
 *  ALL_MODELS_2026, ANTIGRAVITY_MODELS_2026, ANTIGRAVITY_MODELS,
 *  ANTIGRAVITY_MODEL_IDS_2026, GEMINI_CLI_ONLY_MODELS, BYPASS/SUPPORTED/
 *  LEGACY lists), types (ModelDefinition, LegacyModelDefinition,
 *  AntigravityModelDefinition, Model2026, ModelId2026, ThinkingLevel),
 *  classifiers (isGeminiCLIOnlyModel, isCLIOnly, isThinkingModel,
 *  isImageModel, isImageGenModel, normalizeModelId, mapModelToGroup),
 *  thinking tables (THINKING_LEVELS, THINKING_BUDGET_MAP, ceilings),
 *  search/default model ids (SEARCH_MODEL*, DEFAULT_MODEL), image-gen
 *  helpers (buildImageGenConfig) and endpoint routing constants
 *  (CODE_ASSIST_ENDPOINTS host map + ENDPOINT_ORDER* derived from the
 *  constants.ts ENDPOINTS raw map, getEndpointsForModel, endpointsForModel).
 *  The project-discovery block that used to live here (loadCodeAssist,
 *  onboardUser, project-id caches, resolveProjectId*) relocated to
 *  project.ts — this module is completely project-free.
 *
 *  v2.1.16 single-owner fix: absorbed the cli.ts MODELS_2026_CATALOG family
 *  (the 8-entry rich provider catalog + ModelCatalogEntry interface) — cli.ts
 *  imports and re-exports them under the historical names.
 *
 *  MERGED CATALOG - superset of every previous duplicate:
 *  - Base schema: rich ModelDefinition catalog (models-2026.ts lineage).
 *  - Added every missing id from the flat catalogs:
 *    whole gemini-3.7-flash family (GA Aug 13 2026): gemini-3.7-flash,
 *    -high, -low, -medium, -tiered, -preview, -minimal,
 *    antigravity-gemini-3.7-flash, antigravity-gemini-3.7-flash-high;
 *    antigravity-gemini-3.6-flash(-high), antigravity-gemini-3.5-flash,
 *    antigravity-claude-sonnet-4-6, antigravity-claude-opus-4-6-thinking,
 *    antigravity-gemini-3.1-flash-image, antigravity-gpt-oss-120b-medium/-high,
 *    claude-sonnet-4-6, claude-opus-4-6, claude-sonnet-4-6-thinking,
 *    gemini-2.5-pro-preview, gemini-3.5-flash-low/-preview,
 *    gemini-3.6-flash-minimal/-preview, gemini-3.7-flash-minimal, gpt-oss-120b.
 *  - Ported flat-catalog exports: MODELS_2026_08_25 (modelDef[]),
 *    ALL_MODELS_WITH_PREFIX, ANTIGRAVITY_MODELS, GEMINICLI_MODELS, isCLIOnly,
 *    DEFAULT_MODEL, SEARCH_MODEL, FALLBACKS, modelDef/thinkingVariant and
 *    ModelDef/ThinkingVariant types.
 *
 *  The observer watched:
 *  - opencode.txt timeline (original repo + 5 waves) showing ban of antagravity/1.11.5,
 *    dynamic version fallback to 1.19.2, and requirement of direct cloudcode-pa
 *    without localhost v1 proxy.
 *  - Gemini CLI binary behavior for Project ID bypass: it NEVER sets
 *    x-goog-user-project, calls v1internal:loadCodeAssist directly on
 *    https://cloudcode-pa.googleapis.com to obtain cloudaicompanionProject,
 *    falls back to onboardUser tier FREE, then loadCodeAssist again.
 *    For gemini-3+ / preview models it MUST skip SANDBOX to avoid 403/404 cascade
 *    (issue #233, pi-mono #1830).
 *  - pi-antigravity-auth: reference implementation of bypass via loadCodeAssist
 *    + stripped headers, compatible with 9router and OmniRoute routing layers.
 *  - 9router (github.com/9router): model routing table that maps logical ids like
 *    gemini-3.6-flash-high to physical cloudcode-pa endpoints.
 *  - OmniRoute: layer that decides group antigravity vs gemini-cli and endpoint order.
 *  - Wikipedia timeline:
 *      - Gemini 2.5 Pro - Dec 10 2025
 *      - Gemini 3 family - Feb 12 2026
 *      - Gemini 3.1 Pro - Feb 19 2026 [Wikipedia Gemini 3.1 Pro Feb 19 2026]
 *      - Gemini 3.6 Flash family - July 21 2026 [Wikipedia Gemini 3.6 Flash July 21 2026]
 *      - Gemini 3.7 Flash GA - Aug 13 2026
 *      - Catalog freeze - Aug 25 2026 - this file.
 *
 *  Constraints:
 *  - Only node:* builtins + global fetch (Node >=18). Zero external deps.
 *  - Direct cloudcode-pa: PROD https://cloudcode-pa.googleapis.com,
 *    DAILY https://daily-cloudcode-pa.googleapis.com,
 *    SANDBOX https://daily-cloudcode-pa.sandbox.googleapis.com,
 *    AUTOPUSH https://autopush-cloudcode-pa.sandbox.googleapis.com
 *  - No localhost v1 proxy (explicit WAVE 5 requirement).
 *  - Project ID bypass exactly as Gemini CLI would act.
 *
 *  Model metadata:
 *  - context window: Gemini 1048576, Claude/GPT-OSS 200000
 *  - output limit: Gemini 65535, Claude/GPT-OSS 64000
 *  - thinkingLevel variants: minimal/low/medium/high/tiered/max
 *  - group: antigravity vs gemini-cli
 *  - provider: google (routed via google cloudaicompanion), with originalProvider hint
 *  - modalities: input [text,image,pdf], output [text] or [text,image] for image models
 *  - bilingual pt/en description
 *  - isPreview flag for -preview / -lite-preview models
 *  - aliases for OmniRoute / 9router compatibility
 *
 * @author devthink
 * @license MIT
 * @version 3.0.0
 * @date 2026-08-25
 * @references pi-antigravity-auth, 9router, OmniRoute,
 *             Wikipedia Gemini 3.1 Pro Feb 19 2026,
 *             Wikipedia Gemini 3.6 Flash July 21 2026
 */

import { createHash, randomInt } from "node:crypto";
import { platform as osPlatform, arch as osArch } from "node:os";
// v2.1.15 Phase A: models.ts owns every model substrate locally (flat id
// lists, rich definition lists, the v1 routing catalog). Only generic
// non-model constants come from constants.ts (layer 0).
import { fnv1a32 } from "./core.js";
import {
  ANTIGRAVITY_USER_AGENT_FALLBACK,
  ANTIGRAVITY_VERSION_FALLBACK,
  CODE_ASSIST_PATH_MAP,
  ENDPOINTS,
  FNV_OFFSET_BASIS,
  FNV_PRIME,
  PROJECT_FALLBACK,
} from "./constants.js";
import type { AntigravityVersion, CodeAssistEndpointPath, QuotaGroup } from "./constants.js";

// ===========================================================================
// Raw model substrates (v2.1.15 Phase A — moved from constants.ts so that
// model identification lives ONLY in models.ts; values byte-identical)
// ===========================================================================

// ---------------------------------------------------------------------------
// Models 2026-08-25 — complete taxonomy
// ---------------------------------------------------------------------------
// Gemini 3.6 Flash
export const GEMINI_36_MODELS = [
  "gemini-3.6-flash-high",
  "gemini-3.6-flash-medium",
  "gemini-3.6-flash-low",
  "gemini-3.6-flash-tiered",
  "gemini-3.6-flash",
  "antigravity-gemini-3.6-flash-high",
  "antigravity-gemini-3.6-flash-medium",
  "antigravity-gemini-3.6-flash-low",
  "antigravity-gemini-3.6-flash-tiered",
  "antigravity-gemini-3.6-flash",
] as const;

export const GEMINI_36_MODEL_DEFINITIONS: readonly AntigravityModelDefinition[] = [
  {
    id: "gemini-3.6-flash-high",
    displayName: "Gemini 3.6 Flash High",
    group: "antigravity",
    contextWindow: 1_048_576,
    outputLimit: 65_535,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: false,
  },
  {
    id: "gemini-3.6-flash-medium",
    displayName: "Gemini 3.6 Flash Medium",
    group: "antigravity",
    contextWindow: 1_048_576,
    outputLimit: 65_535,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: false,
  },
  {
    id: "gemini-3.6-flash-low",
    displayName: "Gemini 3.6 Flash Low",
    group: "antigravity",
    contextWindow: 1_048_576,
    outputLimit: 65_535,
    supportsThinking: false,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: false,
  },
  {
    id: "gemini-3.6-flash-tiered",
    displayName: "Gemini 3.6 Flash Tiered",
    group: "antigravity",
    contextWindow: 1_048_576,
    outputLimit: 65_535,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: false,
  },
  {
    id: "gemini-3.6-flash",
    displayName: "Gemini 3.6 Flash",
    group: "antigravity",
    contextWindow: 1_048_576,
    outputLimit: 65_535,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: false,
  },
  {
    id: "antigravity-gemini-3.6-flash",
    displayName: "Gemini 3.6 Flash (Antigravity)",
    group: "antigravity",
    contextWindow: 1_048_576,
    outputLimit: 65_535,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: false,
  },
  {
    id: "antigravity-gemini-3.6-flash-high",
    displayName: "Gemini 3.6 Flash High (Antigravity)",
    group: "antigravity",
    contextWindow: 1_048_576,
    outputLimit: 65_535,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: false,
  },
] as const;

// Gemini 3.5 Flash
export const GEMINI_35_MODELS = [
  "gemini-3.5-flash-high",
  "gemini-3.5-flash-medium",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.5-flash-lite-preview",
  "antigravity-gemini-3.5-flash-high",
  "antigravity-gemini-3.5-flash-medium",
  "antigravity-gemini-3.5-flash",
  "antigravity-gemini-3.5-flash-lite",
  "antigravity-gemini-3.5-flash-lite-preview",
] as const;

export const GEMINI_35_MODEL_DEFINITIONS: readonly AntigravityModelDefinition[] = [
  {
    id: "gemini-3.5-flash-high",
    displayName: "Gemini 3.5 Flash High",
    group: "antigravity",
    contextWindow: 1_048_576,
    outputLimit: 65_535,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: false,
  },
  {
    id: "gemini-3.5-flash-medium",
    displayName: "Gemini 3.5 Flash Medium",
    group: "antigravity",
    contextWindow: 1_048_576,
    outputLimit: 65_535,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: false,
  },
  {
    id: "gemini-3.5-flash",
    displayName: "Gemini 3.5 Flash",
    group: "antigravity",
    contextWindow: 1_048_576,
    outputLimit: 65_535,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: false,
  },
  {
    id: "gemini-3.5-flash-lite",
    displayName: "Gemini 3.5 Flash Lite",
    group: "antigravity",
    contextWindow: 1_048_576,
    outputLimit: 32_768,
    supportsThinking: false,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: false,
  },
  {
    id: "gemini-3.5-flash-lite-preview",
    displayName: "Gemini 3.5 Flash Lite Preview",
    group: "gemini-cli",
    contextWindow: 1_048_576,
    outputLimit: 32_768,
    supportsThinking: false,
    supportsTools: true,
    supportsVision: true,
    isPreview: true,
    isClaude: false,
  },
  {
    id: "antigravity-gemini-3.5-flash",
    displayName: "Gemini 3.5 Flash (Antigravity)",
    group: "antigravity",
    contextWindow: 1_048_576,
    outputLimit: 65_535,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: false,
  },
] as const;

// Gemini 3.1
export const GEMINI_31_MODELS = [
  "gemini-3.1-pro-high",
  "gemini-3.1-pro-low",
  "gemini-3.1-pro",
  "gemini-3.1-flash-image",
  "gemini-3.1-flash-lite",
  "antigravity-gemini-3.1-pro-high",
  "antigravity-gemini-3.1-pro-low",
  "antigravity-gemini-3.1-pro",
  "antigravity-gemini-3.1-flash-image",
  "antigravity-gemini-3.1-flash-lite",
] as const;

export const GEMINI_31_MODEL_DEFINITIONS: readonly AntigravityModelDefinition[] = [
  {
    id: "gemini-3.1-pro-high",
    displayName: "Gemini 3.1 Pro High",
    group: "antigravity",
    contextWindow: 1_048_576,
    outputLimit: 65_535,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: false,
  },
  {
    id: "gemini-3.1-pro-low",
    displayName: "Gemini 3.1 Pro Low",
    group: "antigravity",
    contextWindow: 1_048_576,
    outputLimit: 65_535,
    supportsThinking: false,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: false,
  },
  {
    id: "gemini-3.1-pro",
    displayName: "Gemini 3.1 Pro",
    group: "antigravity",
    contextWindow: 1_048_576,
    outputLimit: 65_535,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: false,
  },
  {
    id: "gemini-3.1-flash-image",
    displayName: "Gemini 3.1 Flash Image",
    group: "antigravity",
    contextWindow: 1_048_576,
    outputLimit: 65_535,
    supportsThinking: false,
    supportsTools: false,
    supportsVision: true,
    isPreview: false,
    isClaude: false,
  },
  {
    id: "gemini-3.1-flash-lite",
    displayName: "Gemini 3.1 Flash Lite",
    group: "antigravity",
    contextWindow: 1_048_576,
    outputLimit: 32_768,
    supportsThinking: false,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: false,
  },
  {
    id: "antigravity-gemini-3.1-pro",
    displayName: "Gemini 3.1 Pro (Antigravity)",
    group: "antigravity",
    contextWindow: 1_048_576,
    outputLimit: 65_535,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: false,
  },
] as const;

// Gemini 3
export const GEMINI_3_MODELS = [
  "gemini-3-flash",
  "gemini-3-pro",
  "gemini-3-deep-think",
  "antigravity-gemini-3-flash",
  "antigravity-gemini-3-pro",
  "antigravity-gemini-3-deep-think",
] as const;

export const GEMINI_3_MODEL_DEFINITIONS: readonly AntigravityModelDefinition[] = [
  {
    id: "gemini-3-flash",
    displayName: "Gemini 3 Flash",
    group: "antigravity",
    contextWindow: 1_048_576,
    outputLimit: 65_535,
    supportsThinking: false,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: false,
  },
  {
    id: "gemini-3-pro",
    displayName: "Gemini 3 Pro",
    group: "antigravity",
    contextWindow: 1_048_576,
    outputLimit: 65_535,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: false,
  },
  {
    id: "gemini-3-deep-think",
    displayName: "Gemini 3 Deep Think",
    group: "antigravity",
    contextWindow: 1_048_576,
    outputLimit: 65_535,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: false,
  },
  {
    id: "antigravity-gemini-3-pro",
    displayName: "Gemini 3 Pro (Antigravity)",
    group: "antigravity",
    contextWindow: 1_048_576,
    outputLimit: 65_535,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: false,
  },
  {
    id: "antigravity-gemini-3-flash",
    displayName: "Gemini 3 Flash (Antigravity)",
    group: "antigravity",
    contextWindow: 1_048_576,
    outputLimit: 65_535,
    supportsThinking: false,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: false,
  },
] as const;

// Gemini 2.5
export const GEMINI_25_MODELS = [
  "gemini-2.5-pro",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "antigravity-gemini-2.5-pro",
  "antigravity-gemini-2.5-flash",
  "antigravity-gemini-2.5-flash-lite",
  "gemini-2.5",
] as const;

export const GEMINI_25_MODEL_DEFINITIONS: readonly AntigravityModelDefinition[] = [
  {
    id: "gemini-2.5-pro",
    displayName: "Gemini 2.5 Pro",
    group: "antigravity",
    contextWindow: 1_048_576,
    outputLimit: 65_535,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: false,
  },
  {
    id: "gemini-2.5-flash",
    displayName: "Gemini 2.5 Flash",
    group: "antigravity",
    contextWindow: 1_048_576,
    outputLimit: 65_535,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: false,
  },
  {
    id: "gemini-2.5-flash-lite",
    displayName: "Gemini 2.5 Flash Lite",
    group: "antigravity",
    contextWindow: 1_048_576,
    outputLimit: 32_768,
    supportsThinking: false,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: false,
  },
] as const;

// Claude 4.6
export const CLAUDE_46_MODELS = [
  "claude-sonnet-4-6-thinking",
  "claude-sonnet-4-6-thinking-low",
  "claude-sonnet-4-6-thinking-high",
  "claude-sonnet-4-6",
  "claude-opus-4-6-thinking",
  "claude-opus-4-6-thinking-low",
  "claude-opus-4-6-thinking-high",
  "claude-opus-4-6-thinking-max",
  "claude-opus-4-6",
  "antigravity-claude-sonnet-4-6",
  "antigravity-claude-sonnet-4-6-thinking",
  "antigravity-claude-opus-4-6-thinking",
  "antigravity-claude-opus-4-6-thinking-low",
  "antigravity-claude-opus-4-6-thinking-max",
] as const;

export const CLAUDE_46_MODEL_DEFINITIONS: readonly AntigravityModelDefinition[] = [
  {
    id: "claude-sonnet-4-6-thinking",
    displayName: "Claude Sonnet 4.6 Thinking",
    group: "antigravity",
    contextWindow: 200_000,
    outputLimit: 64_000,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: true,
  },
  {
    id: "claude-sonnet-4-6-thinking-low",
    displayName: "Claude Sonnet 4.6 Thinking Low",
    group: "antigravity",
    contextWindow: 200_000,
    outputLimit: 64_000,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: true,
  },
  {
    id: "claude-sonnet-4-6-thinking-high",
    displayName: "Claude Sonnet 4.6 Thinking High",
    group: "antigravity",
    contextWindow: 200_000,
    outputLimit: 64_000,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: true,
  },
  {
    id: "claude-sonnet-4-6",
    displayName: "Claude Sonnet 4.6",
    group: "antigravity",
    contextWindow: 200_000,
    outputLimit: 64_000,
    supportsThinking: false,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: true,
  },
  {
    id: "claude-opus-4-6-thinking",
    displayName: "Claude Opus 4.6 Thinking",
    group: "antigravity",
    contextWindow: 200_000,
    outputLimit: 64_000,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: true,
  },
  {
    id: "claude-opus-4-6-thinking-low",
    displayName: "Claude Opus 4.6 Thinking Low",
    group: "antigravity",
    contextWindow: 200_000,
    outputLimit: 64_000,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: true,
  },
  {
    id: "claude-opus-4-6-thinking-high",
    displayName: "Claude Opus 4.6 Thinking High",
    group: "antigravity",
    contextWindow: 200_000,
    outputLimit: 64_000,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: true,
  },
  {
    id: "claude-opus-4-6-thinking-max",
    displayName: "Claude Opus 4.6 Thinking Max",
    group: "antigravity",
    contextWindow: 200_000,
    outputLimit: 64_000,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: true,
  },
  {
    id: "antigravity-claude-sonnet-4-6",
    displayName: "Claude Sonnet 4.6 (Antigravity)",
    group: "antigravity",
    contextWindow: 200_000,
    outputLimit: 64_000,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: true,
  },
  {
    id: "antigravity-claude-opus-4-6-thinking",
    displayName: "Claude Opus 4.6 Thinking (Antigravity)",
    group: "antigravity",
    contextWindow: 200_000,
    outputLimit: 64_000,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: true,
  },
] as const;

// Claude 4.5 legacy
export const CLAUDE_45_MODELS = [
  "claude-sonnet-4-5",
  "claude-sonnet-4-5-thinking",
  "claude-opus-4-5-thinking",
  "claude-opus-4-5-thinking-low",
  "claude-opus-4-5",
] as const;

export const CLAUDE_45_MODEL_DEFINITIONS: readonly AntigravityModelDefinition[] = [
  {
    id: "claude-sonnet-4-5",
    displayName: "Claude Sonnet 4.5",
    group: "antigravity",
    contextWindow: 200_000,
    outputLimit: 64_000,
    supportsThinking: false,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: true,
  },
  {
    id: "claude-sonnet-4-5-thinking",
    displayName: "Claude Sonnet 4.5 Thinking",
    group: "antigravity",
    contextWindow: 200_000,
    outputLimit: 64_000,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: true,
  },
  {
    id: "claude-opus-4-5-thinking",
    displayName: "Claude Opus 4.5 Thinking (Legacy)",
    group: "antigravity",
    contextWindow: 200_000,
    outputLimit: 64_000,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: true,
  },
  {
    id: "claude-opus-4-5-thinking-low",
    displayName: "Claude Opus 4.5 Thinking Low",
    group: "antigravity",
    contextWindow: 200_000,
    outputLimit: 64_000,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: true,
  },
] as const;

// gpt-oss-120b
export const GPT_OSS_MODELS = [
  "gpt-oss-120b-medium",
  "gpt-oss-120b-high",
  "gpt-oss-120b",
  "antigravity-gpt-oss-120b-medium",
  "antigravity-gpt-oss-120b-high",
] as const;

export const GPT_OSS_MODEL_DEFINITIONS: readonly AntigravityModelDefinition[] = [
  {
    id: "gpt-oss-120b-medium",
    displayName: "GPT OSS 120B Medium",
    group: "antigravity",
    contextWindow: 131_072,
    outputLimit: 32_768,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: false,
    isPreview: false,
    isClaude: false,
    isGptOss: true,
  },
  {
    id: "gpt-oss-120b-high",
    displayName: "GPT OSS 120B High",
    group: "antigravity",
    contextWindow: 131_072,
    outputLimit: 32_768,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: false,
    isPreview: false,
    isClaude: false,
    isGptOss: true,
  },
  {
    id: "gpt-oss-120b",
    displayName: "GPT OSS 120B",
    group: "antigravity",
    contextWindow: 131_072,
    outputLimit: 32_768,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: false,
    isPreview: false,
    isClaude: false,
    isGptOss: true,
  },
] as const;

// Preview models
export const PREVIEW_MODELS_2026_08 = [
  "gemini-3-pro-preview",
  "gemini-3-flash-preview",
  "gemini-3.1-pro-preview",
  "gemini-3.1-pro-preview-customtools",
  "gemini-3.5-flash-lite-preview",
  "gemini-3.6-flash-preview",
  "antigravity-gemini-3-pro-preview",
  "antigravity-gemini-3-flash-preview",
  "antigravity-gemini-3.1-pro-preview",
] as const;

export const PREVIEW_MODEL_DEFINITIONS: readonly AntigravityModelDefinition[] = [
  {
    id: "gemini-3-pro-preview",
    displayName: "Gemini 3 Pro Preview",
    group: "gemini-cli",
    contextWindow: 1_048_576,
    outputLimit: 65_535,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: true,
    isClaude: false,
  },
  {
    id: "gemini-3-flash-preview",
    displayName: "Gemini 3 Flash Preview",
    group: "gemini-cli",
    contextWindow: 1_048_576,
    outputLimit: 65_535,
    supportsThinking: false,
    supportsTools: true,
    supportsVision: true,
    isPreview: true,
    isClaude: false,
  },
  {
    id: "gemini-3.1-pro-preview",
    displayName: "Gemini 3.1 Pro Preview",
    group: "gemini-cli",
    contextWindow: 1_048_576,
    outputLimit: 65_535,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: true,
    isClaude: false,
  },
  {
    id: "gemini-3.1-pro-preview-customtools",
    displayName: "Gemini 3.1 Pro Preview CustomTools",
    group: "gemini-cli",
    contextWindow: 1_048_576,
    outputLimit: 65_535,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: true,
    isClaude: false,
  },
  {
    id: "gemini-3.6-flash-preview",
    displayName: "Gemini 3.6 Flash Preview",
    group: "gemini-cli",
    contextWindow: 1_048_576,
    outputLimit: 65_535,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: true,
    isClaude: false,
  },
] as const;

// v2.1.15 Phase A: the exported family names MODELS_2026_08_25 (flat modelDef
// projection), ANTIGRAVITY_MODELS_2026, ANTIGRAVITY_MODELS,
// ANTIGRAVITY_MODEL_IDS_2026, GEMINI_CLI_ONLY_MODELS and
// isGeminiCLIOnlyModel moved to models.ts. The raw aggregates below keep
// their exact values as the layer-0 substrate models.ts derives from.

/** Raw flat string-id aggregate of the 2026-08-25 catalog (bare + antigravity aliases). */
const MODELS_2026_08_25_IDS = [
  ...GEMINI_36_MODELS,
  ...GEMINI_35_MODELS,
  ...GEMINI_31_MODELS,
  ...GEMINI_3_MODELS,
  ...GEMINI_25_MODELS,
  ...PREVIEW_MODELS_2026_08,
  ...CLAUDE_46_MODELS,
  ...CLAUDE_45_MODELS,
  ...GPT_OSS_MODELS,
] as const;

export const MODELS_2026_08_25_DEDUP = Array.from(
  new Set<string>(MODELS_2026_08_25_IDS),
) as unknown as readonly string[];

/** Raw rich-definition aggregate consumed by models.ts (ANTIGRAVITY_MODELS_2026 family). */
export const MODEL_DEFINITIONS_2026 = [
  ...GEMINI_36_MODEL_DEFINITIONS,
  ...GEMINI_35_MODEL_DEFINITIONS,
  ...GEMINI_31_MODEL_DEFINITIONS,
  ...GEMINI_3_MODEL_DEFINITIONS,
  ...GEMINI_25_MODEL_DEFINITIONS,
  ...PREVIEW_MODEL_DEFINITIONS,
  ...CLAUDE_46_MODEL_DEFINITIONS,
  ...CLAUDE_45_MODEL_DEFINITIONS,
  ...GPT_OSS_MODEL_DEFINITIONS,
] as const satisfies readonly AntigravityModelDefinition[];

export const ANTIGRAVITY_MODELS_2026_08 = MODEL_DEFINITIONS_2026;

export const MODEL_IDS_2026_08_25 = MODELS_2026_08_25_DEDUP;

/**
 * Quota module model roster (v2.1.15 Phase A move from quota.ts — model data
 * lives only in models.ts). Lineage B subset used by the quota grouping map;
 * values byte-identical to the former quota.ts ANTIGRAVITY_MODELS_2026.
 */
export const QUOTA_MODEL_ROSTER: readonly AntigravityModelDefinition[] = [
  {
    id: "antigravity-gemini-3-pro",
    displayName: "Gemini 3 Pro (Antigravity)",
    group: "antigravity",
    contextWindow: 1_048_576,
    outputLimit: 65_535,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: false,
  },
  {
    id: "antigravity-gemini-3-flash",
    displayName: "Gemini 3 Flash (Antigravity)",
    group: "antigravity",
    contextWindow: 1_048_576,
    outputLimit: 65_535,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: false,
  },
  {
    id: "antigravity-gemini-3.1-pro",
    displayName: "Gemini 3.1 Pro (Antigravity)",
    group: "antigravity",
    contextWindow: 1_048_576,
    outputLimit: 65_535,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: false,
  },
  {
    id: "gemini-2.5-flash",
    displayName: "Gemini 2.5 Flash",
    group: "antigravity",
    contextWindow: 1_048_576,
    outputLimit: 65_535,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: false,
  },
  {
    id: "gemini-2.5-pro",
    displayName: "Gemini 2.5 Pro",
    group: "antigravity",
    contextWindow: 1_048_576,
    outputLimit: 65_535,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: false,
  },
  {
    id: "gemini-3-flash-preview",
    displayName: "Gemini 3 Flash Preview",
    group: "gemini-cli",
    contextWindow: 1_048_576,
    outputLimit: 65_535,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: true,
    isClaude: false,
  },
  {
    id: "gemini-3-pro-preview",
    displayName: "Gemini 3 Pro Preview",
    group: "gemini-cli",
    contextWindow: 1_048_576,
    outputLimit: 65_535,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: true,
    isClaude: false,
  },
  {
    id: "gemini-3.1-pro-preview",
    displayName: "Gemini 3.1 Pro Preview",
    group: "gemini-cli",
    contextWindow: 1_048_576,
    outputLimit: 65_535,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: true,
    isClaude: false,
  },
  {
    id: "gemini-3.1-pro-preview-customtools",
    displayName: "Gemini 3.1 Pro Preview CustomTools",
    group: "gemini-cli",
    contextWindow: 1_048_576,
    outputLimit: 65_535,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: true,
    isClaude: false,
  },
  {
    id: "claude-opus-4-6-thinking",
    displayName: "Claude Opus 4.6 Thinking",
    group: "antigravity",
    contextWindow: 200_000,
    outputLimit: 64_000,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: true,
  },
  {
    id: "claude-opus-4-6-thinking-low",
    displayName: "Claude Opus 4.6 Thinking Low",
    group: "antigravity",
    contextWindow: 200_000,
    outputLimit: 64_000,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: true,
  },
  {
    id: "claude-opus-4-6-thinking-max",
    displayName: "Claude Opus 4.6 Thinking Max",
    group: "antigravity",
    contextWindow: 200_000,
    outputLimit: 64_000,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: true,
  },
  {
    id: "claude-sonnet-4-6",
    displayName: "Claude Sonnet 4.6",
    group: "antigravity",
    contextWindow: 200_000,
    outputLimit: 64_000,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: true,
  },
  {
    id: "claude-opus-4-5-thinking",
    displayName: "Claude Opus 4.5 Thinking (Legacy)",
    group: "antigravity",
    contextWindow: 200_000,
    outputLimit: 64_000,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: true,
  },
  // Aliases bare gemini-3-* without antigravity- prefix - server accepts both
  {
    id: "gemini-3-flash",
    displayName: "Gemini 3 Flash",
    group: "gemini-cli",
    contextWindow: 1_048_576,
    outputLimit: 65_535,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: false,
  },
  {
    id: "gemini-3-pro",
    displayName: "Gemini 3 Pro",
    group: "gemini-cli",
    contextWindow: 1_048_576,
    outputLimit: 65_535,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: false,
  },
  {
    id: "gemini-3.1-pro",
    displayName: "Gemini 3.1 Pro",
    group: "gemini-cli",
    contextWindow: 1_048_576,
    outputLimit: 65_535,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: false,
  },
];

// v2.1.15 Phase A: isThinkingModel and normalizeModelId moved to models.ts
// (single canonical implementations; these local variants had no consumers).

export function isGemini36Model(modelId: string): boolean {
  return modelId.toLowerCase().includes("gemini-3.6");
}
export function isGemini35Model(modelId: string): boolean {
  return modelId.toLowerCase().includes("gemini-3.5");
}
export function isGemini31Model(modelId: string): boolean {
  return modelId.toLowerCase().includes("gemini-3.1");
}
export function isClaude46Model(modelId: string): boolean {
  const l = modelId.toLowerCase();
  return l.includes("claude") && (l.includes("4-6") || l.includes("4.6"));
}
export function isClaude45Model(modelId: string): boolean {
  const l = modelId.toLowerCase();
  return l.includes("claude") && (l.includes("4-5") || l.includes("4.5"));
}
export function isGptOssModel(modelId: string): boolean {
  return modelId.toLowerCase().includes("gpt-oss");
}
export function isPreviewModel(modelId: string): boolean {
  return modelId.toLowerCase().includes("preview") || modelId.toLowerCase().includes("customtools");
}
export const MODEL_ALIASES_2026: Record<string, string> = {
  "gemini-3-pro": "antigravity-gemini-3-pro",
  "gemini-3-flash": "antigravity-gemini-3-flash",
  "gemini-3.1-pro": "antigravity-gemini-3.1-pro",
  "claude-opus-4-6": "claude-opus-4-6-thinking",
  "claude-sonnet-4-6": "antigravity-claude-sonnet-4-6",
  "claude-opus-4-5": "claude-opus-4-5-thinking",
  "gemini-3.6-flash-high": "antigravity-gemini-3.6-flash-high",
  "gemini-3.5-flash-high": "antigravity-gemini-3.5-flash-high",
  "gemini-3.1-pro-high": "antigravity-gemini-3.1-pro-high",
} as const;

// v2.1.15 Phase A: SEARCH_MODEL, SEARCH_MODEL_PREVIEW, SEARCH_MODEL_FALLBACKS
// and DEFAULT_MODEL moved to models.ts. The two unlisted fallback names below
// keep their historical values here.
export const DEFAULT_MODEL_FALLBACK = "gemini-3-flash-preview" as const;
export const DEFAULT_MODEL_2026_08 = "antigravity-gemini-3.6-flash" as const;

// ---------------------------------------------------------------------------
// V1-05. Model catalog 2026 — Antigravity + Gemini CLI routing definitions
// ---------------------------------------------------------------------------

export type ApiProvider = "antigravity" | "gemini-cli";
// v2.1.15 Phase A: this whole V1-05 block (ApiProvider, ModelVendor and the
// raw catalog) moved from constants.ts into models.ts — model data lives
// ONLY in models.ts. The legacy catalog shape is LegacyModelDefinition.
export type ModelVendor = "google" | "anthropic";

/**
 * Raw v1 routing catalog (11 rich entries). models.ts imports this list and
 * owns the family name ALL_MODELS_2026; the legacy shape is LegacyModelDefinition.
 */
export const V1_CATALOG_MODELS = [
  {
    id: "antigravity-gemini-3-pro",
    name: "Antigravity Gemini 3.0 Pro",
    context: 1_048_576,
    output: 65_536,
    provider: "google",
    api: "antigravity",
    family: "gemini-3-pro",
    quotaGroup: "gemini-3-pro",
  },
  {
    id: "antigravity-gemini-3.1-pro",
    name: "Antigravity Gemini 3.1 Pro",
    context: 2_097_152,
    output: 65_536,
    provider: "google",
    api: "antigravity",
    family: "gemini-3.1-pro",
    preview: true,
    quotaGroup: "gemini-3.1-pro",
  },
  {
    id: "antigravity-gemini-3-flash",
    name: "Antigravity Gemini 3.0 Flash",
    context: 1_048_576,
    output: 32_768,
    provider: "google",
    api: "antigravity",
    family: "gemini-3-flash",
    quotaGroup: "gemini-3-flash",
  },
  {
    id: "antigravity-claude-sonnet-4-6",
    name: "Antigravity Claude Sonnet 4.6",
    context: 200_000,
    output: 32_768,
    provider: "google",
    api: "antigravity",
    family: "claude-sonnet-4-6",
    quotaGroup: "claude-sonnet",
  },
  {
    id: "antigravity-claude-opus-4-6-thinking",
    name: "Antigravity Claude Opus 4.6 Thinking",
    context: 200_000,
    output: 65_536,
    provider: "google",
    api: "antigravity",
    family: "claude-opus-4-6",
    thinking: true,
    quotaGroup: "claude-opus",
  },
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    context: 1_048_576,
    output: 8_192,
    provider: "google",
    api: "gemini-cli",
    family: "gemini-2.5-flash",
    quotaGroup: "gemini-2.5-flash",
  },
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    context: 1_048_576,
    output: 32_768,
    provider: "google",
    api: "gemini-cli",
    family: "gemini-2.5-pro",
    quotaGroup: "gemini-2.5-pro",
  },
  {
    id: "gemini-3-flash-preview",
    name: "Gemini 3.0 Flash Preview",
    context: 1_048_576,
    output: 32_768,
    provider: "google",
    api: "gemini-cli",
    family: "gemini-3-flash",
    preview: true,
    quotaGroup: "gemini-3-flash",
  },
  {
    id: "gemini-3-pro-preview",
    name: "Gemini 3.0 Pro Preview",
    context: 1_048_576,
    output: 65_536,
    provider: "google",
    api: "gemini-cli",
    family: "gemini-3-pro",
    preview: true,
    quotaGroup: "gemini-3-pro",
  },
  {
    id: "gemini-3.1-pro-preview",
    name: "Gemini 3.1 Pro Preview",
    context: 2_097_152,
    output: 65_536,
    provider: "google",
    api: "gemini-cli",
    family: "gemini-3.1-pro",
    preview: true,
    quotaGroup: "gemini-3.1-pro",
  },
  {
    id: "gemini-3.1-pro-preview-customtools",
    name: "Gemini 3.1 Pro Preview Custom Tools",
    context: 2_097_152,
    output: 65_536,
    provider: "google",
    api: "gemini-cli",
    family: "gemini-3.1-pro",
    preview: true,
    customTools: true,
    quotaGroup: "gemini-3.1-pro",
  },
] as const satisfies readonly LegacyModelDefinition[];

// v2.1.15 Phase A: MODEL_BY_ID (fast catalog lookup) and the V1-06 model
// routing map (RoutingConfig + MODEL_ROUTING) moved to models.ts — model
// identification lives only in models.ts. The raw V1_CATALOG_MODELS list
// stays here as the layer-0 substrate models.ts indexes.

export const DEFAULT_MODEL_ID = "antigravity-gemini-3-pro" as const;
export const DEFAULT_FALLBACK_MODEL_IDS = [
  "gemini-3-pro-preview",
  "gemini-3-flash-preview",
  "gemini-2.5-pro",
  "gemini-2.5-flash",
] as const;

/**
 * Default model id embedded in the Gemini CLI User-Agent masquerade
 * (`GeminiCLI/0.57.0/<model> ...`). v2.1.16 single-owner fix: the
 * "gemini-3-pro-preview" literal used to be repeated as a default parameter
 * across fingerprint.ts, auth.ts and streaming.ts — those sites now import
 * this constant (model identification lives only in models.ts).
 */
export const UA_DEFAULT_MODEL = "gemini-3-pro-preview" as const;

/**
 * Linear-time trailing-slash strip (regex-free; safe on uncontrolled input —
 * the former /\/+$/.replace was polynomial and flagged as ReDoS-prone).
 */
function stripTrailingSlashes(value: string): string {
  let end = value.length;
  while (end > 0 && value.charCodeAt(end - 1) === 47 /* "/" */) end--;
  return end === value.length ? value : value.slice(0, end);
}

// ---------------------------------------------------------------------------
// Section 01. Governance dates & references
// ---------------------------------------------------------------------------

export const CATALOG_DATE_ISO = "2026-08-25" as const;
export const CATALOG_DATE_BR = "25/08/2026" as const;
export const CATALOG_VERSION = "3.0.0" as const;
export const WIKIPEDIA_GEMINI_3_1_PRO_DATE = "2026-02-19" as const;
export const WIKIPEDIA_GEMINI_3_6_FLASH_DATE = "2026-07-21" as const;

export const REFERENCES = [
  "pi-antigravity-auth - bypass Project ID via loadCodeAssist without x-goog-user-project",
  "9router - github.com/9router - routing table for logical -> physical model ids",
  "OmniRoute - routing layer for antigravity vs gemini-cli endpoint order",
  "Wikipedia Gemini 3.1 Pro - Feb 19 2026 release",
  "Wikipedia Gemini 3.6 Flash - July 21 2026 release",
  "Gemini CLI binary - loadCodeAssist + onboardUser, direct cloudcode-pa",
  "the upstream research lineage - 11k stars, original failure User-Agent 1.11.5",
  "cloudcode-pa.googleapis.com - PROD authoritative per 2026-08-25",
] as const;

export const OPENCODE_TXT_TIMELINE = [
  {
    date: "2024-11-10",
    event: { pt: "Lançamento inicial da linhagem provedora", en: "Initial provider lineage release" },
    detail: "Antigravity IDE auth via cloudcode-pa, User-Agent antigravity/1.11.5",
    source: "the upstream research repository",
    models: ["antigravity-gemini-2.0", "claude-3.5-sonnet"],
  },
  {
    date: "2025-01-15",
    event: { pt: "Ban em massa versoes <1.15.8", en: "Mass ban versions <1.15.8" },
    detail: "Google returned 'This version of Antigravity is no longer supported' - UA fix required",
    source: "GitHub Issues #233, #411",
    models: ["gemini-2.0-pro", "gemini-2.0-flash"],
  },
  {
    date: "2025-03-20",
    event: { pt: "Dual quota Antigravity + Gemini CLI", en: "Dual quota Antigravity + Gemini CLI pools" },
    detail: "cli_first routing, pid_offset_enabled, round-robin multi-account",
    source: "pi-antigravity-auth, RESEARCH.md",
    models: ["gemini-2.5-pro", "gemini-2.5-flash", "claude-opus-4-5-thinking"],
  },
  {
    date: "2026-02-19",
    event: { pt: "Gemini 3.1 Pro lancamento (Wikipedia)", en: "Gemini 3.1 Pro release (Wikipedia)" },
    detail: "Wikipedia registers Gemini 3.1 Pro on February 19 2026, context 1M, thinking high/low variants",
    source: "Wikipedia Gemini 3.1 Pro Feb 19 2026",
    models: ["gemini-3.1-pro-high", "gemini-3.1-pro-low", "gemini-3.1-pro", "gemini-3.1-pro-preview"],
  },
  {
    date: "2026-05-11",
    event: { pt: "Gemini 3 Pro/Flash e Deep Think", en: "Gemini 3 Pro/Flash and Deep Think" },
    detail: "Gemini 3 family GA, deep-think variant with mandatory thinkingLevel high",
    source: "Google Blog, Antigravity Manager binary",
    models: ["gemini-3-pro", "gemini-3-flash", "gemini-3-deep-think", "gemini-3-pro-preview", "gemini-3-flash-preview"],
  },
  {
    date: "2026-07-21",
    event: { pt: "Familia Gemini 3.6 Flash (Wikipedia)", en: "Gemini 3.6 Flash family (Wikipedia)" },
    detail: "Wikipedia registers Gemini 3.6 Flash on July 21 2026 - variants high/medium/low/tiered, 1M window",
    source: "Wikipedia Gemini 3.6 Flash July 21 2026",
    models: [
      "gemini-3.6-flash-high",
      "gemini-3.6-flash-medium",
      "gemini-3.6-flash-low",
      "gemini-3.6-flash-tiered",
      "gemini-3.6-flash",
    ],
  },
  {
    date: "2026-08-01",
    event: { pt: "Integracao 9router + OmniRoute", en: "9router + OmniRoute integration" },
    detail:
      "Routing table: antigravity- prefix forces Antigravity pool, preview forces Gemini CLI PROD-only, strip x-goog-user-project",
    source: "9router github, OmniRoute docs, pi-antigravity-auth",
    models: ["antigravity-gemini-3.6-flash", "antigravity-gemini-3-flash", "antigravity-claude-opus-4-6-thinking"],
  },
  {
    date: "2026-08-13",
    event: { pt: "Gemini 3.7 Flash GA", en: "Gemini 3.7 Flash GA" },
    detail:
      "Gemini 3.7 Flash general availability Aug 13 2026 - most intelligent workhorse, minimal/low/medium/high/tiered variants, intro pricing until Dec 31 2026",
    source: "Google Blog, Antigravity Manager binary, flat catalogs v3/v4/v5",
    models: [
      "gemini-3.7-flash",
      "gemini-3.7-flash-high",
      "gemini-3.7-flash-medium",
      "gemini-3.7-flash-low",
      "gemini-3.7-flash-tiered",
      "gemini-3.7-flash-minimal",
      "gemini-3.7-flash-preview",
      "antigravity-gemini-3.7-flash",
      "antigravity-gemini-3.7-flash-high",
    ],
  },
  {
    date: "2026-08-25",
    event: { pt: "Freeze catalogo v3 - ONDA 5 CORRECAO V3", en: "Catalog freeze v3 - WAVE 5 FIX V3" },
    detail:
      "Merged complete list at 25/08/2026: full 3.6/3.5/3.1/3/2.5 families + gemini-3.7-flash family + Claude 4.5/4.6 (+ non-thinking) + GPT-OSS 120B (+bare) + previews. Bypass Project ID as Gemini CLI via loadCodeAssist, direct cloudcode-pa without localhost v1.",
    source: "opencode.txt timeline, pi-antigravity-auth, 9router, OmniRoute, flat catalogs v3/v4/v5",
    models: [
      "gemini-3.7-flash",
      "gemini-3.7-flash-high",
      "gemini-3.7-flash-medium",
      "gemini-3.7-flash-low",
      "gemini-3.7-flash-minimal",
      "gemini-3.7-flash-preview",
      "gemini-3.6-flash-high",
      "gemini-3.6-flash-medium",
      "gemini-3.6-flash-low",
      "gemini-3.6-flash-tiered",
      "gemini-3.6-flash",
      "gemini-3.5-flash-high",
      "gemini-3.5-flash-medium",
      "gemini-3.5-flash-low",
      "gemini-3.5-flash",
      "gemini-3.5-flash-lite",
      "gemini-3.5-flash-lite-preview",
      "gemini-3.1-pro-high",
      "gemini-3.1-pro-low",
      "gemini-3.1-pro",
      "gemini-3.1-flash-image",
      "gemini-3.1-flash-lite",
      "gemini-3-flash",
      "gemini-3-pro",
      "gemini-3-deep-think",
      "gemini-2.5-pro",
      "gemini-2.5-flash",
      "gemini-2.5-flash-lite",
      "claude-sonnet-4-6",
      "claude-sonnet-4-6-thinking",
      "claude-opus-4-6",
      "claude-opus-4-6-thinking",
      "claude-sonnet-4-5",
      "claude-opus-4-5-thinking",
      "gpt-oss-120b",
      "gpt-oss-120b-medium",
      "gpt-oss-120b-high",
      "gemini-2.5-pro-preview",
      "gemini-3.5-flash-preview",
      "gemini-3.6-flash-preview",
      "gemini-3-pro-preview",
      "gemini-3-flash-preview",
      "gemini-3.1-pro-preview",
      "gemini-3.1-pro-preview-customtools",
    ],
  },
] as const;

// ---------------------------------------------------------------------------
// Section 02. Cloud Code Endpoints - direct, no localhost v1 proxy
// v2.1.15 Phase A: canonical host map (aliased to the constants.ts ENDPOINTS
// raw map) plus the three per-family routing orders owned by this module.
// ---------------------------------------------------------------------------

/**
 * Canonical Cloud Code Assist host map (PROD/DAILY/SANDBOX/AUTOPUSH).
 * Merged in v2.1.15 from the constants.ts (5-key with the dead
 * DAILY_SANDBOX alias), models.ts and request.ts variants — the raw value
 * lives in constants.ts as ENDPOINTS and this is the family-name alias.
 */
export const CODE_ASSIST_ENDPOINTS: typeof ENDPOINTS = ENDPOINTS;

/**
 * Default cascade for the Antigravity pool: PROD, DAILY then SANDBOX.
 * Merged from constants.ts/models.ts/plugin.ts/project.ts/request.ts
 * variants (all identical values).
 */
export const ENDPOINT_ORDER: readonly string[] = [ENDPOINTS.PROD, ENDPOINTS.DAILY, ENDPOINTS.SANDBOX] as const;

/** Cascade for the Antigravity pool: PROD, DAILY then SANDBOX (fallback project allowed). */
export const ENDPOINT_ORDER_ANTIGRAVITY: readonly string[] = [
  ENDPOINTS.PROD,
  ENDPOINTS.DAILY,
  ENDPOINTS.SANDBOX,
] as const;

/** Cascade for the Gemini CLI pool — sandbox is explicitly skipped for preview/gemini-3. */
export const ENDPOINT_ORDER_GEMINI_CLI: readonly string[] = [ENDPOINTS.PROD, ENDPOINTS.DAILY] as const;

// v2.1.15 Phase B: PROJECT_FALLBACK and ANTIGRAVITY_VERSION_FALLBACK moved
// to constants.js (raw value owner) — imported at the top of this file.
export const ANTIGRAVITY_VERSION_MIN = "1.15.8" as const;

// v2.1.15 Phase B: FETCH_TIMEOUT_MS and QUOTA_TIMEOUT_MS moved to
// constants.js (generic timeout values); the 6-entry strict FORBIDDEN_HEADERS
// variant lost its last consumer when the identity helpers left this module
// and was deleted — constants.js owns the header-strip lists.

// ---------------------------------------------------------------------------
// Section 03. Thinking levels & budgets - Gemini + Claude + GPT-OSS
// ---------------------------------------------------------------------------

export const THINKING_LEVELS = ["minimal", "low", "medium", "high", "tiered", "max"] as const;
export type ThinkingLevel = (typeof THINKING_LEVELS)[number];

export const THINKING_BUDGET_MAP: Record<ThinkingLevel, number> = {
  minimal: 1024,
  low: 8192,
  medium: 16384,
  high: 32768,
  tiered: 24576, // adaptive tiered - observer sees OmniRoute uses 24k as middle tier
  max: 64000, // Claude max + GPT-OSS high
} as const;

export const CONTEXT_WINDOW_GEMINI = 1_048_576 as const;
export const CONTEXT_WINDOW_CLAUDE = 200_000 as const;
export const CONTEXT_WINDOW_GPT_OSS = 200_000 as const;
export const OUTPUT_LIMIT_GEMINI = 65_535 as const;
export const OUTPUT_LIMIT_CLAUDE = 64_000 as const;
export const OUTPUT_LIMIT_GPT_OSS = 64_000 as const;

/**
 * Maximum thinking budget for Claude-family models (v2.1.15 Phase A merge
 * of the identical constants.ts and request.ts variants).
 */
export const THINKING_BUDGET_MAX_CLAUDE = 64_000 as const;

/**
 * Maximum thinking budget ceiling for Gemini-family models (v2.1.15 Phase A
 * merge of the identical constants.ts and request.ts variants).
 */
export const THINKING_BUDGET_MAX_GEMINI = 32_768 as const;

export type ModelGroup = "antigravity" | "gemini-cli";
export type Provider = "google";
export type OriginalProvider = "google" | "anthropic" | "openai-oss";
export type Modality = "text" | "image" | "pdf";

/**
 * Rich canonical model definition - single source of truth for the catalog.
 */
export interface ModelDefinition {
  /** Canonical id - ex: gemini-3.6-flash-high */
  id: string;
  /** Display name */
  displayName: string;
  /** Family: gemini-3.7, gemini-3.6, gemini-3.5, gemini-3.1, gemini-3, gemini-2.5, claude-4-6, gpt-oss-120b ... */
  family: string;
  /** Version / catalog date */
  catalogDate: typeof CATALOG_DATE_ISO;
  /** Release date ISO (Wikipedia dates for 3.1 Pro Feb 19 2026, 3.6 Flash July 21 2026) */
  releaseDate: string;
  /** Context window tokens */
  contextWindow: number;
  /** Output limit tokens */
  outputLimit: number;
  /** Provider routed via Google */
  provider: Provider;
  /** Original lab */
  originalProvider: OriginalProvider;
  /** Routing group */
  group: ModelGroup;
  /** Thinking level variant */
  thinkingLevel: ThinkingLevel;
  /** Budget in tokens */
  thinkingBudget: number;
  /** Is thinking required? */
  isThinking: boolean;
  /** Is preview? */
  isPreview: boolean;
  /** Is image output? ex: gemini-3.1-flash-image */
  isImage: boolean;
  /** Modalities */
  modalities: { input: Modality[]; output: Modality[] };
  /** Bilingual description */
  description: { pt: string; en: string };
  /** Aliases for 9router / OmniRoute */
  aliases: string[];
  /** Endpoint hints - third-person observer notes */
  endpointHints: {
    prodOnly: boolean; // gemini-3+ preview MUST be prod-only (+ daily), skip sandbox
    skipSandbox: boolean;
    fallbackProjectAllowed: boolean; // rising-fact-p41fc works for antigravity, fails 403 for gemini-cli
    allowedEndpoints: readonly string[];
    defaultEndpoint: string;
  };
  /** Tags for search */
  tags: string[];
  /** References */
  references: string[];
  /** Deprecated? */
  deprecated?: boolean | undefined;
}

/**
 * Rich per-model routing/quota definition used by the layered definition
 * substrate lists (GEMINI_36_MODEL_DEFINITIONS ... GPT_OSS_MODEL_DEFINITIONS
 * in constants.ts) and by the quota group routing table
 * (QUOTA_GROUP_MODEL_DEFINITIONS below). Absorbed from constants.ts and
 * quota.ts in v2.1.15 Phase A (identical field set in both lineages;
 * isGptOss stayed optional).
 */
export interface AntigravityModelDefinition {
  readonly id: string;
  readonly displayName: string;
  readonly group: QuotaGroup;
  readonly contextWindow: number;
  readonly outputLimit: number;
  readonly supportsThinking: boolean;
  readonly supportsTools: boolean;
  readonly supportsVision: boolean;
  readonly isPreview: boolean;
  readonly isClaude: boolean;
  readonly isGptOss?: boolean;
}

/**
 * v1 flat routing-catalog entry (historical name: ModelDefinition) used by
 * ALL_MODELS_2026 / V1_CATALOG_MODELS. Renamed LegacyModelDefinition in
 * v2.1.15 Phase A so the rich catalog ModelDefinition above keeps the bare
 * name (one name, one meaning).
 */
export interface LegacyModelDefinition {
  /** internal ID used for routing */
  id: string;
  /** display name */
  name: string;
  /** context window in tokens */
  context: number;
  /** max output tokens */
  output: number;
  /** billing provider — always google for bypass */
  provider: "google" | "anthropic";
  /** which API routes the call */
  api: "antigravity" | "gemini-cli";
  /** base family */
  family: string;
  /** preview / thinking flag */
  preview?: boolean;
  /** thinking / extended reasoning */
  thinking?: boolean;
  /** custom tools support */
  customTools?: boolean;
  /** label for quota group */
  quotaGroup: string;
}

// ---------------------------------------------------------------------------
// Section 04. Flat catalog compat types (ported from flat catalogs)
// ---------------------------------------------------------------------------

/** Flat thinking variant union - identical value set as ThinkingLevel */
export type thinkingVariant = "minimal" | "low" | "medium" | "high" | "max" | "tiered";

/** Flat model definition shape used by MODELS_2026_08_25 consumers */
export type modelDef = {
  id: string;
  name: string;
  context: number;
  output: number;
  group: ModelGroup;
  provider: Provider;
  thinking: thinkingVariant[];
  modalities: { input: string[]; output: string[] };
  preview: boolean;
  release: string;
  notes: string;
};

/**
 * Sandbox-skip classifier for the fetch cascade (v2.1.15 Phase D move from
 * plugin.ts — model classification lives only in models.ts). Distinct from
 * shouldSkipSandboxForModel: this variant also flags the deep-think and
 * flash-image families.
 */
export function shouldSkipSandbox(modelId: string): boolean {
  const lower = (modelId ?? "").toLowerCase();
  return (
    lower.includes("3.6") ||
    lower.includes("3.5") ||
    lower.includes("preview") ||
    lower.includes("gemini-3-flash") ||
    lower.includes("gemini-3-pro") ||
    lower.includes("gemini-3.1") ||
    lower.includes("deep-think") ||
    lower.includes("flash-image")
  );
}

/** PascalCase aliases kept for flat-catalog import compatibility */
export type ThinkingVariant = thinkingVariant;
export type ModelDef = modelDef;

// ---------------------------------------------------------------------------
// Section 05. Observer helpers - FNV-1a, hash, headers, jitter, UA
// ---------------------------------------------------------------------------

// v2.1.15 Phase B: FNV_OFFSET_BASIS and FNV_PRIME moved to constants.js
// (raw value owner).

function hashToken(token: string): string {
  try {
    return createHash("sha256").update(token).digest("hex").slice(0, 32);
  } catch {
    return fnv1a32(token).toString(16).padStart(8, "0");
  }
}

function normalizeArch(a: string): string {
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

// ---------------------------------------------------------------------------
// v2.1.15 Phase A: the entire project-discovery block (ProjectDiscoveryError,
// loadCodeAssist, onboardUser, the project-id cache, resolveProjectIdAsGeminiCliBypass
// and fetchAvailableModelsDirect) RELOCATED to project.ts — the single owner of
// project discovery. models.ts is completely project-free by design.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Section 08. Model helpers - normalize, thinking, context
// ---------------------------------------------------------------------------

export function normalizeModelId(id: string): string {
  return String(id ?? "")
    .trim()
    .toLowerCase()
    .replace(/^antigravity-/, "");
}

export function parseThinkingLevelFromId(id: string): ThinkingLevel {
  const lower = String(id).toLowerCase();
  if (lower.endsWith("-high")) return "high";
  if (lower.endsWith("-medium")) return "medium";
  if (lower.endsWith("-low")) return "low";
  if (lower.endsWith("-tiered")) return "tiered";
  if (lower.endsWith("-minimal")) return "minimal";
  if (lower.endsWith("-lite")) return "low";
  if (lower.includes("deep-think")) return "high";
  if (lower.includes("flash-image")) return "minimal";
  if (lower.includes("thinking")) return "high";
  if (lower.includes("lite")) return "low";
  if (lower.includes("preview") && lower.includes("flash")) return "medium";
  return "medium";
}

export function getThinkingBudgetForLevel(level: ThinkingLevel, originalProvider: OriginalProvider = "google"): number {
  if (originalProvider === "anthropic" && level === "high") return 32768; // Claude high observed 32k, max 64k optional
  if (originalProvider === "anthropic" && level === "max") return 64000;
  return THINKING_BUDGET_MAP[level] ?? THINKING_BUDGET_MAP.medium;
}

export function isGeminiCliOnlyId(id: string): boolean {
  const lower = String(id).toLowerCase();
  // Observer: preview, gemini-3, gemini-3.1, gemini-3.5, gemini-3.6, gemini-3.7 MUST be prod-only (+ daily) - skip sandbox
  return (
    lower.includes("preview") ||
    lower.startsWith("gemini-3.") ||
    lower.startsWith("gemini-3-") ||
    lower === "gemini-3-flash" ||
    lower === "gemini-3-pro" ||
    lower.includes("gemini-3.5") ||
    lower.includes("gemini-3.6") ||
    lower.includes("gemini-3.7") ||
    lower.includes("deep-think")
  );
}

// ---------------------------------------------------------------------------
// Section 09. Factory for ModelDefinition - bilingual pt/en
// ---------------------------------------------------------------------------

function makeDescription(
  id: string,
  family: string,
  thinking: ThinkingLevel,
  isPreview: boolean,
  isImage: boolean,
  group: ModelGroup,
  releaseDate: string,
): { pt: string; en: string } {
  const previewTagPt = isPreview ? " (preview - pode mudar, sem SLA)" : "";
  const previewTagEn = isPreview ? " (preview - may change, no SLA)" : "";
  const imageTagPt = isImage ? " Saida imagem + texto." : "";
  const imageTagEn = isImage ? " Image + text output." : "";
  const groupPt =
    group === "gemini-cli"
      ? "grupo gemini-cli (PROD-only, bypass Project ID via loadCodeAssist)"
      : "grupo antigravity (PROD/DAILY/SANDBOX, fallback rising-fact-p41fc)";
  const groupEn =
    group === "gemini-cli"
      ? "gemini-cli group (PROD-only, bypasses Project ID via loadCodeAssist)"
      : "antigravity group (PROD/DAILY/SANDBOX, fallback rising-fact-p41fc)";
  const windowPt = family.includes("claude") || family.includes("gpt-oss") ? "janela 200k" : "janela 1.048.576";
  const windowEn = family.includes("claude") || family.includes("gpt-oss") ? "200k window" : "1,048,576 window";
  const outPt = family.includes("claude") || family.includes("gpt-oss") ? "saida 64k" : "saida 65.535";
  const outEn = family.includes("claude") || family.includes("gpt-oss") ? "64k output" : "65,535 output";
  const thinkingPt = `thinking ${thinking}`;
  const thinkingEn = `thinking ${thinking}`;

  const pt = `${id} - ${family}${previewTagPt} - ${windowPt}, ${outPt}, ${thinkingPt}, ${groupPt}. Multimodal texto/imagem/PDF${imageTagPt}. Bypass Project ID direto cloudcode-pa.googleapis.com sem localhost v1 proxy. Ref: pi-antigravity-auth, 9router, OmniRoute. Release ${releaseDate}. Catalogo ${CATALOG_DATE_BR}.`;
  const en = `${id} - ${family}${previewTagEn} - ${windowEn}, ${outEn}, ${thinkingEn}, ${groupEn}. Multimodal text/image/PDF${imageTagEn}. Bypasses Project ID directly via cloudcode-pa.googleapis.com without localhost v1 proxy. Ref: pi-antigravity-auth, 9router, OmniRoute. Release ${releaseDate}. Catalog ${CATALOG_DATE_ISO}.`;
  return { pt, en };
}

function defineModel(
  id: string,
  family: string,
  originalProvider: OriginalProvider,
  group: ModelGroup,
  releaseDate: string,
  opts: {
    thinkingLevel?: ThinkingLevel | undefined;
    isPreview?: boolean | undefined;
    isImage?: boolean | undefined;
    isThinking?: boolean | undefined;
    contextWindow?: number | undefined;
    outputLimit?: number | undefined;
    aliases?: string[] | undefined;
    tags?: string[] | undefined;
    deprecated?: boolean | undefined;
  } = {},
): ModelDefinition {
  const thinkingLevel = opts.thinkingLevel ?? parseThinkingLevelFromId(id);
  const isPreview = opts.isPreview ?? id.toLowerCase().includes("preview");
  const isImage =
    opts.isImage ??
    (id.toLowerCase().includes("flash-image") ||
      (id.toLowerCase().includes("image") && !id.toLowerCase().includes("lite")));
  const isThinking =
    opts.isThinking ??
    (thinkingLevel !== "minimal" ||
      id.toLowerCase().includes("thinking") ||
      id.toLowerCase().includes("deep-think") ||
      id.toLowerCase().includes("high") ||
      id.toLowerCase().includes("low") ||
      id.toLowerCase().includes("medium") ||
      id.toLowerCase().includes("tiered"));
  const contextWindow =
    opts.contextWindow ??
    (originalProvider === "google"
      ? CONTEXT_WINDOW_GEMINI
      : originalProvider === "anthropic"
        ? CONTEXT_WINDOW_CLAUDE
        : CONTEXT_WINDOW_GPT_OSS);
  const outputLimit =
    opts.outputLimit ??
    (originalProvider === "google"
      ? OUTPUT_LIMIT_GEMINI
      : originalProvider === "anthropic"
        ? OUTPUT_LIMIT_CLAUDE
        : OUTPUT_LIMIT_GPT_OSS);
  const thinkingBudget = getThinkingBudgetForLevel(thinkingLevel, originalProvider);
  const prodOnly = group === "gemini-cli" || isGeminiCliOnlyId(id);
  const allowedEndpoints = prodOnly ? ENDPOINT_ORDER_GEMINI_CLI : ENDPOINT_ORDER_ANTIGRAVITY;
  const fallbackAllowed = group === "antigravity";

  const description = makeDescription(id, family, thinkingLevel, isPreview, isImage, group, releaseDate);

  const baseAliases = opts.aliases ?? [];
  // OmniRoute / 9router aliases
  const omniAliases = [
    normalizeModelId(id),
    id.toLowerCase(),
    `google/${normalizeModelId(id)}`,
    `antigravity/${normalizeModelId(id)}`,
    `9router/${normalizeModelId(id)}`,
  ];

  return {
    id,
    displayName: id,
    family,
    catalogDate: CATALOG_DATE_ISO,
    releaseDate,
    contextWindow,
    outputLimit,
    provider: "google",
    originalProvider,
    group,
    thinkingLevel,
    thinkingBudget,
    isThinking,
    isPreview,
    isImage,
    modalities: {
      input: ["text", "image", "pdf"],
      output: isImage ? ["text", "image"] : ["text"],
    },
    description,
    aliases: Array.from(new Set([...baseAliases, ...omniAliases, id])),
    endpointHints: {
      prodOnly,
      skipSandbox: prodOnly,
      fallbackProjectAllowed: fallbackAllowed,
      allowedEndpoints,
      defaultEndpoint: CODE_ASSIST_ENDPOINTS.PROD,
    },
    tags: [
      family,
      group,
      originalProvider,
      thinkingLevel,
      isPreview ? "preview" : "stable",
      isImage ? "image" : "text",
      isThinking ? "thinking" : "no-thinking",
      `release-${releaseDate}`,
      "direct-cloudcode-pa",
      "no-localhost-proxy",
      "bypass-project-id-loadCodeAssist",
      "pi-antigravity-auth",
      "9router",
      "OmniRoute",
      ...(opts.tags ?? []),
    ],
    references: [...REFERENCES],
    deprecated: opts.deprecated,
  };
}

// ---------------------------------------------------------------------------
// Section 10. COMPLETE CATALOG frozen at 25/08/2026 - WAVE 5 FIX V3
// Base list (incl. merged flat-catalog ids) + antigravity- variants
// ---------------------------------------------------------------------------

// Helper to create antigravity variant id
function antigravityId(baseId: string): string {
  return baseId.startsWith("antigravity-") ? baseId : `antigravity-${baseId}`;
}

// Release date mapping based on Wikipedia + timeline + flat catalogs
const RELEASE_DATES: Record<string, string> = {
  // Aug 13 2026 - Gemini 3.7 Flash family GA
  "gemini-3.7-flash": "2026-08-13",
  "gemini-3.7-flash-high": "2026-08-13",
  "gemini-3.7-flash-medium": "2026-08-13",
  "gemini-3.7-flash-low": "2026-08-13",
  "gemini-3.7-flash-tiered": "2026-08-13",
  "gemini-3.7-flash-minimal": "2026-08-13",
  "gemini-3.7-flash-preview": "2026-08-13",
  // July 21 2026 - Gemini 3.6 Flash family
  "gemini-3.6-flash-high": WIKIPEDIA_GEMINI_3_6_FLASH_DATE,
  "gemini-3.6-flash-medium": WIKIPEDIA_GEMINI_3_6_FLASH_DATE,
  "gemini-3.6-flash-low": WIKIPEDIA_GEMINI_3_6_FLASH_DATE,
  "gemini-3.6-flash-tiered": WIKIPEDIA_GEMINI_3_6_FLASH_DATE,
  "gemini-3.6-flash-minimal": WIKIPEDIA_GEMINI_3_6_FLASH_DATE,
  "gemini-3.6-flash-preview": WIKIPEDIA_GEMINI_3_6_FLASH_DATE,
  "gemini-3.6-flash": WIKIPEDIA_GEMINI_3_6_FLASH_DATE,
  // Gemini 3.5 - approx June 2026
  "gemini-3.5-flash-high": "2026-06-15",
  "gemini-3.5-flash-medium": "2026-06-15",
  "gemini-3.5-flash-low": "2026-06-15",
  "gemini-3.5-flash-preview": "2026-06-20",
  "gemini-3.5-flash": "2026-06-15",
  "gemini-3.5-flash-lite": "2026-06-15",
  "gemini-3.5-flash-lite-preview": "2026-06-20",
  // Gemini 3.1 Pro - Feb 19 2026 Wikipedia
  "gemini-3.1-pro-high": WIKIPEDIA_GEMINI_3_1_PRO_DATE,
  "gemini-3.1-pro-low": WIKIPEDIA_GEMINI_3_1_PRO_DATE,
  "gemini-3.1-pro": WIKIPEDIA_GEMINI_3_1_PRO_DATE,
  "gemini-3.1-flash-image": "2026-03-10",
  "gemini-3.1-flash-lite": "2026-03-10",
  // Gemini 3
  "gemini-3-flash": "2026-05-11",
  "gemini-3-pro": "2026-05-11",
  "gemini-3-deep-think": "2026-05-20",
  "gemini-3-pro-preview": "2026-04-20",
  "gemini-3-flash-preview": "2026-04-20",
  "gemini-3.1-pro-preview": "2026-02-19",
  "gemini-3.1-pro-preview-customtools": "2026-02-25",
  // Gemini 2.5
  "gemini-2.5-pro": "2025-12-10",
  "gemini-2.5-pro-preview": "2025-12-10",
  "gemini-2.5-flash": "2025-12-10",
  "gemini-2.5-flash-lite": "2025-12-15",
  // Claude 4.5 / 4.6 - 2026 Q2
  "claude-sonnet-4-6": "2026-04-15",
  "claude-sonnet-4-6-thinking": "2026-04-15",
  "claude-opus-4-6": "2026-04-15",
  "claude-opus-4-6-thinking": "2026-04-15",
  "claude-sonnet-4-5": "2026-02-10",
  "claude-opus-4-5-thinking": "2026-02-10",
  // GPT-OSS 120B - 2026
  "gpt-oss-120b": "2026-05-01",
  "gpt-oss-120b-medium": "2026-05-01",
  "gpt-oss-120b-high": "2026-05-01",
};

function releaseDateFor(id: string): string {
  const base = normalizeModelId(id);
  return RELEASE_DATES[base] ?? RELEASE_DATES[id] ?? "2026-08-25";
}

// Build base models list - includes every id merged from flat catalogs v3/v4/v5

const BASE_MODELS: Array<{
  id: string;
  family: string;
  originalProvider: OriginalProvider;
  group: ModelGroup;
  thinkingLevel?: ThinkingLevel;
  isPreview?: boolean;
  isImage?: boolean;
  isThinking?: boolean;
}> = [
  // Gemini 3.7 Flash - GA Aug 13 2026 - most intelligent workhorse
  {
    id: "gemini-3.7-flash",
    family: "gemini-3.7-flash",
    originalProvider: "google",
    group: "antigravity",
    thinkingLevel: "medium",
  },
  {
    id: "gemini-3.7-flash-high",
    family: "gemini-3.7-flash",
    originalProvider: "google",
    group: "antigravity",
    thinkingLevel: "high",
  },
  {
    id: "gemini-3.7-flash-medium",
    family: "gemini-3.7-flash",
    originalProvider: "google",
    group: "antigravity",
    thinkingLevel: "medium",
  },
  {
    id: "gemini-3.7-flash-low",
    family: "gemini-3.7-flash",
    originalProvider: "google",
    group: "antigravity",
    thinkingLevel: "low",
  },
  {
    id: "gemini-3.7-flash-tiered",
    family: "gemini-3.7-flash",
    originalProvider: "google",
    group: "antigravity",
    thinkingLevel: "tiered",
  },
  {
    id: "gemini-3.7-flash-minimal",
    family: "gemini-3.7-flash",
    originalProvider: "google",
    group: "antigravity",
    thinkingLevel: "minimal",
  },
  {
    id: "gemini-3.7-flash-preview",
    family: "gemini-3.7-flash",
    originalProvider: "google",
    group: "gemini-cli",
    thinkingLevel: "medium",
    isPreview: true,
  },

  // Gemini 3.6 Flash - 7 variants - Wikipedia July 21 2026
  {
    id: "gemini-3.6-flash-high",
    family: "gemini-3.6-flash",
    originalProvider: "google",
    group: "gemini-cli",
    thinkingLevel: "high",
  },
  {
    id: "gemini-3.6-flash-medium",
    family: "gemini-3.6-flash",
    originalProvider: "google",
    group: "gemini-cli",
    thinkingLevel: "medium",
  },
  {
    id: "gemini-3.6-flash-low",
    family: "gemini-3.6-flash",
    originalProvider: "google",
    group: "gemini-cli",
    thinkingLevel: "low",
  },
  {
    id: "gemini-3.6-flash-tiered",
    family: "gemini-3.6-flash",
    originalProvider: "google",
    group: "gemini-cli",
    thinkingLevel: "tiered",
  },
  {
    id: "gemini-3.6-flash-minimal",
    family: "gemini-3.6-flash",
    originalProvider: "google",
    group: "gemini-cli",
    thinkingLevel: "minimal",
  },
  {
    id: "gemini-3.6-flash-preview",
    family: "gemini-3.6-flash",
    originalProvider: "google",
    group: "gemini-cli",
    thinkingLevel: "medium",
    isPreview: true,
  },
  {
    id: "gemini-3.6-flash",
    family: "gemini-3.6-flash",
    originalProvider: "google",
    group: "gemini-cli",
    thinkingLevel: "medium",
  },

  // Gemini 3.5 Flash - 7 variants
  {
    id: "gemini-3.5-flash-high",
    family: "gemini-3.5-flash",
    originalProvider: "google",
    group: "gemini-cli",
    thinkingLevel: "high",
  },
  {
    id: "gemini-3.5-flash-medium",
    family: "gemini-3.5-flash",
    originalProvider: "google",
    group: "gemini-cli",
    thinkingLevel: "medium",
  },
  {
    id: "gemini-3.5-flash-low",
    family: "gemini-3.5-flash",
    originalProvider: "google",
    group: "gemini-cli",
    thinkingLevel: "low",
  },
  {
    id: "gemini-3.5-flash",
    family: "gemini-3.5-flash",
    originalProvider: "google",
    group: "gemini-cli",
    thinkingLevel: "medium",
  },
  {
    id: "gemini-3.5-flash-lite",
    family: "gemini-3.5-flash",
    originalProvider: "google",
    group: "gemini-cli",
    thinkingLevel: "low",
  },
  {
    id: "gemini-3.5-flash-lite-preview",
    family: "gemini-3.5-flash",
    originalProvider: "google",
    group: "gemini-cli",
    thinkingLevel: "low",
    isPreview: true,
  },
  {
    id: "gemini-3.5-flash-preview",
    family: "gemini-3.5-flash",
    originalProvider: "google",
    group: "gemini-cli",
    thinkingLevel: "medium",
    isPreview: true,
  },

  // Gemini 3.1 Pro / Flash - Feb 19 2026 Wikipedia
  {
    id: "gemini-3.1-pro-high",
    family: "gemini-3.1-pro",
    originalProvider: "google",
    group: "gemini-cli",
    thinkingLevel: "high",
  },
  {
    id: "gemini-3.1-pro-low",
    family: "gemini-3.1-pro",
    originalProvider: "google",
    group: "gemini-cli",
    thinkingLevel: "low",
  },
  {
    id: "gemini-3.1-pro",
    family: "gemini-3.1-pro",
    originalProvider: "google",
    group: "gemini-cli",
    thinkingLevel: "medium",
  },
  {
    id: "gemini-3.1-flash-image",
    family: "gemini-3.1-flash",
    originalProvider: "google",
    group: "gemini-cli",
    thinkingLevel: "minimal",
    isImage: true,
  },
  {
    id: "gemini-3.1-flash-lite",
    family: "gemini-3.1-flash",
    originalProvider: "google",
    group: "gemini-cli",
    thinkingLevel: "low",
  },

  // Gemini 3 family - May 2026
  {
    id: "gemini-3-flash",
    family: "gemini-3-flash",
    originalProvider: "google",
    group: "gemini-cli",
    thinkingLevel: "medium",
  },
  {
    id: "gemini-3-pro",
    family: "gemini-3-pro",
    originalProvider: "google",
    group: "gemini-cli",
    thinkingLevel: "medium",
  },
  {
    id: "gemini-3-deep-think",
    family: "gemini-3-deep-think",
    originalProvider: "google",
    group: "gemini-cli",
    thinkingLevel: "high",
  },

  // Gemini 2.5 - Dec 2025, routed via antigravity pool but also valid via gemini-cli
  {
    id: "gemini-2.5-pro",
    family: "gemini-2.5-pro",
    originalProvider: "google",
    group: "antigravity",
    thinkingLevel: "medium",
  },
  {
    id: "gemini-2.5-pro-preview",
    family: "gemini-2.5-pro",
    originalProvider: "google",
    group: "gemini-cli",
    thinkingLevel: "medium",
    isPreview: true,
  },
  {
    id: "gemini-2.5-flash",
    family: "gemini-2.5-flash",
    originalProvider: "google",
    group: "antigravity",
    thinkingLevel: "medium",
  },
  {
    id: "gemini-2.5-flash-lite",
    family: "gemini-2.5-flash",
    originalProvider: "google",
    group: "antigravity",
    thinkingLevel: "low",
  },

  // Claude Sonnet/Opus 4.6 (plain + thinking) / 4.5
  {
    id: "claude-sonnet-4-6",
    family: "claude-4-6-sonnet",
    originalProvider: "anthropic",
    group: "antigravity",
    thinkingLevel: "medium",
    isThinking: false,
  },
  {
    id: "claude-sonnet-4-6-thinking",
    family: "claude-4-6-sonnet",
    originalProvider: "anthropic",
    group: "antigravity",
    thinkingLevel: "high",
  },
  {
    id: "claude-opus-4-6",
    family: "claude-4-6-opus",
    originalProvider: "anthropic",
    group: "antigravity",
    thinkingLevel: "medium",
    isThinking: false,
  },
  {
    id: "claude-opus-4-6-thinking",
    family: "claude-4-6-opus",
    originalProvider: "anthropic",
    group: "antigravity",
    thinkingLevel: "high",
  },
  {
    id: "claude-sonnet-4-5",
    family: "claude-4-5-sonnet",
    originalProvider: "anthropic",
    group: "antigravity",
    thinkingLevel: "medium",
  },
  {
    id: "claude-opus-4-5-thinking",
    family: "claude-4-5-opus",
    originalProvider: "anthropic",
    group: "antigravity",
    thinkingLevel: "high",
  },

  // GPT-OSS 120B (bare + variants) - routed via Antigravity as gpt-oss
  {
    id: "gpt-oss-120b",
    family: "gpt-oss-120b",
    originalProvider: "openai-oss",
    group: "antigravity",
    thinkingLevel: "minimal",
    isThinking: false,
  },
  {
    id: "gpt-oss-120b-medium",
    family: "gpt-oss-120b",
    originalProvider: "openai-oss",
    group: "antigravity",
    thinkingLevel: "medium",
  },
  {
    id: "gpt-oss-120b-high",
    family: "gpt-oss-120b",
    originalProvider: "openai-oss",
    group: "antigravity",
    thinkingLevel: "high",
  },

  // Preview - April 2026 - prod-only
  {
    id: "gemini-3-pro-preview",
    family: "gemini-3-pro",
    originalProvider: "google",
    group: "gemini-cli",
    thinkingLevel: "medium",
    isPreview: true,
  },
  {
    id: "gemini-3-flash-preview",
    family: "gemini-3-flash",
    originalProvider: "google",
    group: "gemini-cli",
    thinkingLevel: "medium",
    isPreview: true,
  },
  {
    id: "gemini-3.1-pro-preview",
    family: "gemini-3.1-pro",
    originalProvider: "google",
    group: "gemini-cli",
    thinkingLevel: "medium",
    isPreview: true,
  },
  {
    id: "gemini-3.1-pro-preview-customtools",
    family: "gemini-3.1-pro",
    originalProvider: "google",
    group: "gemini-cli",
    thinkingLevel: "medium",
    isPreview: true,
  },
];

function buildCatalog(): ModelDefinition[] {
  const list: ModelDefinition[] = [];

  for (const b of BASE_MODELS) {
    const rd = releaseDateFor(b.id);
    list.push(
      defineModel(b.id, b.family, b.originalProvider, b.group, rd, {
        thinkingLevel: b.thinkingLevel,
        isPreview: b.isPreview,
        isImage: b.isImage,
        isThinking: b.isThinking,
      }),
    );
    // antigravity- variant - same metadata but forced antigravity group for compatibility with the older lineage
    // Observer: 9router maps antigravity-* to antigravity pool, skipping gemini-cli prod-only rule for fallback
    const agId = antigravityId(b.id);
    if (agId !== b.id) {
      // For antigravity- variants, group forced to antigravity, but keep prodOnly hint if original was prodOnly
      // This allows cli_first: false to still work with fallback project
      const agGroup: ModelGroup = "antigravity";
      list.push(
        defineModel(agId, b.family, b.originalProvider, agGroup, rd, {
          thinkingLevel: b.thinkingLevel,
          isPreview: b.isPreview,
          isImage: b.isImage,
          isThinking: b.isThinking,
          aliases: [b.id, normalizeModelId(b.id)],
        }),
      );
    }
  }

  // Add extra historical models that opencode.txt mentions as supported (to avoid missing timeline)
  const extraHistorical: Array<{
    id: string;
    family: string;
    originalProvider: OriginalProvider;
    group: ModelGroup;
    rd: string;
  }> = [
    { id: "gemini-2.5", family: "gemini-2.5", originalProvider: "google", group: "antigravity", rd: "2025-12-01" },
    {
      id: "antigravity-gemini-3-pro",
      family: "gemini-3-pro",
      originalProvider: "google",
      group: "antigravity",
      rd: "2026-05-11",
    },
    {
      id: "antigravity-gemini-3-flash",
      family: "gemini-3-flash",
      originalProvider: "google",
      group: "antigravity",
      rd: "2026-05-11",
    },
    {
      id: "antigravity-gemini-3.1-pro",
      family: "gemini-3.1-pro",
      originalProvider: "google",
      group: "antigravity",
      rd: "2026-02-19",
    },
  ];

  for (const h of extraHistorical) {
    if (!list.some((m) => m.id === h.id)) {
      list.push(defineModel(h.id, h.family, h.originalProvider, h.group, h.rd, { thinkingLevel: "medium" }));
    }
  }

  // Deduplicate by id (keep first)
  const seen = new Set<string>();
  const deduped: ModelDefinition[] = [];
  for (const m of list) {
    if (seen.has(m.id)) continue;
    seen.add(m.id);
    deduped.push(m);
  }

  // Sort by release date desc then id asc for deterministic catalog freeze
  deduped.sort((a, b) => {
    if (a.releaseDate !== b.releaseDate) return b.releaseDate.localeCompare(a.releaseDate);
    return a.id.localeCompare(b.id);
  });

  return deduped;
}

// Frozen catalog - single source of truth at 25/08/2026
export const MODEL_CATALOG_2026_08_25: readonly ModelDefinition[] = Object.freeze(
  buildCatalog(),
) as readonly ModelDefinition[];

// MAP - id lowercase + aliases -> definition
export const MODEL_MAP_2026_08_25: ReadonlyMap<string, ModelDefinition> = (() => {
  const map = new Map<string, ModelDefinition>();
  for (const m of MODEL_CATALOG_2026_08_25) {
    map.set(m.id.toLowerCase(), m);
    map.set(m.id, m);
    for (const alias of m.aliases) {
      if (!alias) continue;
      const low = alias.toLowerCase();
      if (!map.has(low)) map.set(low, m);
      // also bare normalized
      const norm = normalizeModelId(alias).toLowerCase();
      if (!map.has(norm)) map.set(norm, m);
    }
  }
  return map;
})();

// Aliases map for 9router / OmniRoute routing
export const MODEL_ALIASES_2026_08_25: ReadonlyMap<string, string> = (() => {
  const map = new Map<string, string>();
  for (const m of MODEL_CATALOG_2026_08_25) {
    for (const alias of m.aliases) {
      if (!alias) continue;
      map.set(alias.toLowerCase(), m.id);
    }
  }
  return map;
})();

// ---------------------------------------------------------------------------
// Section 11. Public getters - production-ready, library-first
// ---------------------------------------------------------------------------

export function getModel(id: string): ModelDefinition | undefined {
  if (!id) return undefined;
  const low = String(id).trim().toLowerCase();
  return MODEL_MAP_2026_08_25.get(low) ?? MODEL_MAP_2026_08_25.get(normalizeModelId(low));
}

export function hasModel(id: string): boolean {
  return !!getModel(id);
}

export function isPreview(id: string): boolean {
  const m = getModel(id);
  return m ? m.isPreview : String(id).toLowerCase().includes("preview");
}

export function isThinkingModel(id: string): boolean {
  const m = getModel(id);
  if (m) return m.isThinking;
  const lower = String(id).toLowerCase();
  return (
    lower.includes("thinking") ||
    lower.includes("high") ||
    lower.includes("medium") ||
    lower.includes("low") ||
    lower.includes("tiered") ||
    lower.includes("deep-think") ||
    lower.includes("claude") ||
    lower.includes("gpt-oss")
  );
}

export function isImageModel(id: string): boolean {
  const m = getModel(id);
  if (m) return m.isImage;
  return String(id).toLowerCase().includes("image") || String(id).toLowerCase().includes("flash-image");
}

export function isAntagravityGroup(id: string): boolean {
  const m = getModel(id);
  if (!m)
    return (
      String(id).toLowerCase().startsWith("antigravity-") ||
      String(id).toLowerCase().includes("claude") ||
      String(id).toLowerCase().includes("gpt-oss")
    );
  return m.group === "antigravity";
}

export function isGeminiCliGroup(id: string): boolean {
  const m = getModel(id);
  if (!m) return isGeminiCliOnlyId(id);
  return m.group === "gemini-cli";
}

export function getModelsByGroup(group: ModelGroup): readonly ModelDefinition[] {
  return MODEL_CATALOG_2026_08_25.filter((m) => m.group === group);
}

export function getModelsByThinkingLevel(level: ThinkingLevel): readonly ModelDefinition[] {
  return MODEL_CATALOG_2026_08_25.filter((m) => m.thinkingLevel === level);
}

export function getPreviewModels(): readonly ModelDefinition[] {
  return MODEL_CATALOG_2026_08_25.filter((m) => m.isPreview);
}

export function getStableModels(): readonly ModelDefinition[] {
  return MODEL_CATALOG_2026_08_25.filter((m) => !m.isPreview);
}

export function getAntagravityModels(): readonly ModelDefinition[] {
  return getModelsByGroup("antigravity");
}

export function getGeminiCliModels(): readonly ModelDefinition[] {
  return getModelsByGroup("gemini-cli");
}

export function getThinkingBudget(id: string): number {
  const m = getModel(id);
  if (m) return m.thinkingBudget;
  const lvl = parseThinkingLevelFromId(id);
  return THINKING_BUDGET_MAP[lvl] ?? THINKING_BUDGET_MAP.medium;
}

export function getContextWindow(id: string): number {
  const m = getModel(id);
  if (m) return m.contextWindow;
  const low = String(id).toLowerCase();
  if (low.includes("claude") || low.includes("gpt-oss")) return CONTEXT_WINDOW_CLAUDE;
  return CONTEXT_WINDOW_GEMINI;
}

export function getOutputLimit(id: string): number {
  const m = getModel(id);
  if (m) return m.outputLimit;
  const low = String(id).toLowerCase();
  if (low.includes("claude") || low.includes("gpt-oss")) return OUTPUT_LIMIT_CLAUDE;
  return OUTPUT_LIMIT_GEMINI;
}

export function getEndpointForModel(id: string, overrides?: string[]): readonly string[] {
  const m = getModel(id);
  if (overrides && overrides.length > 0) return overrides;
  if (m) return m.endpointHints.allowedEndpoints;
  // fallback logic: gemini-cli only -> prod+daily
  if (isGeminiCliOnlyId(id)) return ENDPOINT_ORDER_GEMINI_CLI;
  return ENDPOINT_ORDER_ANTIGRAVITY;
}

export function shouldSkipSandboxForModel(id: string): boolean {
  const m = getModel(id);
  if (m) return m.endpointHints.skipSandbox;
  return isGeminiCliOnlyId(id);
}

export function listModelIds(): readonly string[] {
  return MODEL_CATALOG_2026_08_25.map((m) => m.id);
}

export function listBareModelIds(): readonly string[] {
  // Without antigravity- prefix - for OmniRoute base routing
  return BASE_MODELS.map((b) => b.id);
}

export function searchModels(query: string): readonly ModelDefinition[] {
  if (!query) return MODEL_CATALOG_2026_08_25;
  const q = query.trim().toLowerCase();
  return MODEL_CATALOG_2026_08_25.filter((m) => {
    return (
      m.id.toLowerCase().includes(q) ||
      m.family.toLowerCase().includes(q) ||
      m.tags.some((t) => t.toLowerCase().includes(q)) ||
      m.aliases.some((a) => a.toLowerCase().includes(q)) ||
      m.description.en.toLowerCase().includes(q) ||
      m.description.pt.toLowerCase().includes(q)
    );
  });
}

// OmniRoute compatible routing: returns physical model id + endpoint hint
export function routeModelViaOmniRoute(logicalId: string): {
  physicalId: string;
  group: ModelGroup;
  endpoints: readonly string[];
  prodOnly: boolean;
  fallbackAllowed: boolean;
} {
  const m = getModel(logicalId);
  if (!m) {
    // unknown - fallback to the GA workhorse per OMNIROUTE_FALLBACK_MODEL
    return {
      physicalId: OMNIROUTE_FALLBACK_MODEL,
      group: "gemini-cli",
      endpoints: ENDPOINT_ORDER_GEMINI_CLI,
      prodOnly: true,
      fallbackAllowed: false,
    };
  }
  return {
    physicalId: m.id,
    group: m.group,
    endpoints: m.endpointHints.allowedEndpoints,
    prodOnly: m.endpointHints.prodOnly,
    fallbackAllowed: m.endpointHints.fallbackProjectAllowed,
  };
}

// 9router compatible mapper
export function mapModelFor9Router(id: string): { provider: string; model: string; group: ModelGroup } {
  const m = getModel(id);
  if (!m) return { provider: "google", model: normalizeModelId(id), group: "gemini-cli" };
  return { provider: m.provider, model: m.id, group: m.group };
}

// ---------------------------------------------------------------------------
// Section 12. Catalog grouped exports for convenience
// ---------------------------------------------------------------------------

export const MODEL_CATALOG_GROUPED = {
  antigravity: getAntagravityModels(),
  "gemini-cli": getGeminiCliModels(),
  preview: getPreviewModels(),
  stable: getStableModels(),
  high: getModelsByThinkingLevel("high"),
  medium: getModelsByThinkingLevel("medium"),
  low: getModelsByThinkingLevel("low"),
  tiered: getModelsByThinkingLevel("tiered"),
  minimal: getModelsByThinkingLevel("minimal"),
  max: getModelsByThinkingLevel("max"),
  image: MODEL_CATALOG_2026_08_25.filter((m) => m.isImage),
  thinking: MODEL_CATALOG_2026_08_25.filter((m) => m.isThinking),
} as const;

// ---------------------------------------------------------------------------
// Section 13. Flat-catalog compat exports (ported from flat catalogs v3/v4/v5)
// ---------------------------------------------------------------------------

/**
 * Default model - Antigravity wrapper of the GA workhorse (Aug 13 2026).
 */
export const DEFAULT_MODEL = "antigravity-gemini-3.7-flash" as const;

/**
 * Search-grounding default model. v2.1.15 Phase A merge: the constants.ts /
 * request.ts / search.ts variants (all "gemini-3-flash") win the family name
 * — the live-validated search-chain value; this module's former local
 * meaning (OmniRoute unknown-id fallback "gemini-3.7-flash") moved to
 * {@link OMNIROUTE_FALLBACK_MODEL} (same name, different semantics split).
 */
export const SEARCH_MODEL = "gemini-3-flash" as const;

/**
 * Preview variant of the search model (constants.ts + request.ts lineage —
 * identical value in both).
 */
export const SEARCH_MODEL_PREVIEW = "gemini-3-flash-preview" as const;

/**
 * Fallback chain tried when the primary search model is unavailable.
 * v2.1.15 Phase A merge: canonical is the search.ts live-iteration order
 * (preview first, dated -2026 tail); the constants.ts variant (led with
 * gemini-3.6-flash, no -2026 tail) had zero consumers and was dropped.
 */
export const SEARCH_MODEL_FALLBACKS = [
  "gemini-3-flash-preview",
  "gemini-3-flash",
  "antigravity-gemini-3-flash",
  "gemini-3-flash-preview-2026",
] as const;

/**
 * OmniRoute unknown-id fallback (the former local SEARCH_MODEL semantic of
 * this module): the bare GA workhorse id.
 */
export const OMNIROUTE_FALLBACK_MODEL = "gemini-3.7-flash" as const;

/**
 * Hardened fallbacks - project id, antigravity version and User-Agent.
 */
export const FALLBACKS = {
  project: PROJECT_FALLBACK,
  version: ANTIGRAVITY_VERSION_FALLBACK,
  ua: ANTIGRAVITY_USER_AGENT_FALLBACK,
} as const;

/**
 * Flat model list (modelDef[]) derived from the rich frozen catalog.
 * Single source of truth stays MODEL_CATALOG_2026_08_25; this is the
 * lightweight projection consumed by cli/plugin modules.
 */
export const MODELS_2026_08_25: modelDef[] = MODEL_CATALOG_2026_08_25.map((m) => ({
  id: m.id,
  name: m.displayName,
  context: m.contextWindow,
  output: m.outputLimit,
  group: m.group,
  provider: m.provider,
  thinking: [m.thinkingLevel],
  modalities: { input: [...m.modalities.input], output: [...m.modalities.output] },
  preview: m.isPreview,
  release: m.releaseDate,
  notes: m.description.en,
}));

/**
 * All antigravity-group ids normalized to antigravity- prefixed form.
 */
export const ANTIGRAVITY_MODELS: string[] = MODELS_2026_08_25.filter((m) => m.group === "antigravity").map(
  (m) => `antigravity-${m.id.replace(/^antigravity-/, "")}`,
);

/**
 * All gemini-cli-group ids (CLI-quota only).
 */
export const GEMINICLI_MODELS: string[] = MODELS_2026_08_25.filter((m) => m.group === "gemini-cli").map((m) => m.id);

/**
 * Every routable id: plain ids + antigravity-prefixed + google/ prefixed.
 */
export const ALL_MODELS_WITH_PREFIX: string[] = [
  ...MODELS_2026_08_25.map((m) => m.id),
  ...ANTIGRAVITY_MODELS,
  ...MODELS_2026_08_25.map((m) => `google/${m.id}`),
];

/**
 * True when an id is restricted to the Gemini CLI pool
 * (previews and gemini-3.x families are PROD/DAILY only - skip sandbox).
 */
export function isCLIOnly(id: string): boolean {
  const l = String(id ?? "").toLowerCase();
  return (
    l.includes("preview") ||
    l.startsWith("gemini-3.7") ||
    l.startsWith("gemini-3.6") ||
    l.startsWith("gemini-3.5") ||
    l.startsWith("gemini-3.1") ||
    l.startsWith("gemini-3") ||
    l.includes("customtools")
  );
}

// ---------------------------------------------------------------------------
// Section 14. Absorbed flat catalogs + legacy compat exports (v2.1.15 Phase A)
// Every flat model-id list that used to be duplicated under one name across
// plugin.ts, project.ts, accounts.ts, config.ts, fingerprint.ts, quota.ts,
// recovery.ts, streaming.ts, auth.ts, request.ts and constants.ts lives here
// exactly once, under an accurate name (one name, one meaning). Consumers
// import their exact list and re-export their historical alias.
// ---------------------------------------------------------------------------

/**
 * Canonical MODELS_2026 family value: the full catalog union — bare gemini
 * ids plus antigravity aliases — derived from the ModelDefinition catalog
 * (plan-mandated canonical). The former models.ts local value
 * (listBareModelIds(), bare ids only) moved to GEMINI_BARE_MODEL_IDS.
 */
export const MODELS_2026 = listModelIds() as unknown as readonly string[];

/**
 * Bare catalog ids without the antigravity- prefix (the pre-Phase-A local
 * MODELS_2026 semantic of this module; projection of listBareModelIds()).
 */
export const GEMINI_BARE_MODEL_IDS = listBareModelIds() as unknown as readonly string[];

/**
 * Bare base list up to 2026-08-25 (31 ids; best-effort validated via
 * fetchAvailableModels). Shared verbatim by the former plugin.ts and
 * project.ts MODELS_2026_BASE copies.
 */
export const MODELS_2026_BASE = [
  // gemini-3.6 family (new ONDA5)
  "gemini-3.6-flash-high",
  "gemini-3.6-flash-medium",
  "gemini-3.6-flash-low",
  "gemini-3.6-flash-tiered",
  "gemini-3.6-flash",
  // gemini-3.5 family
  "gemini-3.5-flash-high",
  "gemini-3.5-flash-medium",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.5-flash-lite-preview",
  // gemini-3.1 family
  "gemini-3.1-pro-high",
  "gemini-3.1-pro-low",
  "gemini-3.1-pro",
  "gemini-3.1-flash-image",
  "gemini-3.1-flash-lite",
  // gemini-3 family
  "gemini-3-flash",
  "gemini-3-pro",
  "gemini-3-deep-think",
  // gemini-2.5 family
  "gemini-2.5-pro",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  // claude 4.5 / 4.6 thinking
  "claude-sonnet-4-6-thinking",
  "claude-opus-4-6-thinking",
  "claude-sonnet-4-5",
  "claude-opus-4-5-thinking",
  // gpt-oss open models via Antigravity router
  "gpt-oss-120b-medium",
  "gpt-oss-120b-high",
  // preview
  "gemini-3-pro-preview",
  "gemini-3-flash-preview",
  "gemini-3.1-pro-preview",
  "gemini-3.1-pro-preview-customtools",
] as const;

/**
 * Antigravity alias list of the former plugin.ts copy (36 entries, kept
 * verbatim including the two historical duplicate ids; router convention
 * antigravity- prefix plus short legacy aliases).
 */
export const MODELS_2026_ANTIGRAVITY_ALIAS = [
  // antigravity- prefix for all gemini + claude (router convention)
  "antigravity-gemini-3.6-flash-high",
  "antigravity-gemini-3.6-flash-medium",
  "antigravity-gemini-3.6-flash-low",
  "antigravity-gemini-3.6-flash-tiered",
  "antigravity-gemini-3.6-flash",
  "antigravity-gemini-3.5-flash-high",
  "antigravity-gemini-3.5-flash-medium",
  "antigravity-gemini-3.5-flash",
  "antigravity-gemini-3.5-flash-lite",
  "antigravity-gemini-3.5-flash-lite-preview",
  "antigravity-gemini-3.1-pro-high",
  "antigravity-gemini-3.1-pro-low",
  "antigravity-gemini-3.1-pro",
  "antigravity-gemini-3.1-flash-image",
  "antigravity-gemini-3.1-flash-lite",
  "antigravity-gemini-3-flash",
  "antigravity-gemini-3-pro",
  "antigravity-gemini-3-deep-think",
  "antigravity-gemini-2.5-pro",
  "antigravity-gemini-2.5-flash",
  "antigravity-gemini-2.5-flash-lite",
  "antigravity-gemini-3-pro-preview",
  "antigravity-gemini-3-flash-preview",
  "antigravity-gemini-3.1-pro-preview",
  "antigravity-gemini-3.1-pro-preview-customtools",
  "antigravity-claude-sonnet-4-6-thinking",
  "antigravity-claude-opus-4-6-thinking",
  "antigravity-claude-sonnet-4-5",
  "antigravity-claude-opus-4-5-thinking",
  "antigravity-claude-sonnet-4-6",
  "antigravity-claude-opus-4-6",
  // short aliases legacy
  "antigravity-gemini-3-pro",
  "antigravity-gemini-3-flash",
  "antigravity-gemini-3.1-pro",
  "antigravity-claude-opus-4-6-thinking",
  "antigravity-claude-sonnet-4-6",
] as const;

/**
 * Provider injection union of the former plugin.ts MODELS_2026 (67 entries =
 * MODELS_2026_BASE + MODELS_2026_ANTIGRAVITY_ALIAS, duplicates preserved so
 * the opencode provider models list stays byte-identical).
 */
export const MODELS_2026_PROVIDER = [...MODELS_2026_BASE, ...MODELS_2026_ANTIGRAVITY_ALIAS] as const;

/**
 * Antigravity alias list of the former project.ts copy (31 prefixed base ids
 * plus 7 legacy variants still seen in 07/2026 traffic dumps).
 */
export const MODELS_2026_ANTIGRAVITY = [
  ...MODELS_2026_BASE.map((m) => `antigravity-${m}` as const),
  // Legacy variants still seen in traffic dumps 07/2026
  "antigravity-gemini-3-pro",
  "antigravity-gemini-3-flash",
  "antigravity-gemini-3.1-pro",
  "antigravity-claude-opus-4-6-thinking",
  "antigravity-claude-sonnet-4-6",
  "antigravity-claude-sonnet-4-5",
  "antigravity-claude-opus-4-5-thinking",
] as const;

/**
 * Full union of the former project.ts MODELS_2026_ALL (69 entries =
 * MODELS_2026_BASE + MODELS_2026_ANTIGRAVITY).
 */
export const MODELS_2026_ALL = [...MODELS_2026_BASE, ...MODELS_2026_ANTIGRAVITY] as const;

/**
 * v1 static fallback bypass list (11 ids — antigravity customs plus native
 * gemini/claude). Formerly duplicated as MODELS_2026 in accounts.ts,
 * config.ts, fingerprint.ts, quota.ts, recovery.ts and streaming.ts and as
 * MODELS_2026_LEGACY in project.ts (all byte-identical); also equals the id
 * projection of the V1_CATALOG_MODELS rich substrate.
 */
export const MODELS_2026_LEGACY = [
  // Antigravity custom - Gemini
  "antigravity-gemini-3-pro",
  "antigravity-gemini-3.1-pro",
  "antigravity-gemini-3-flash",
  // Antigravity custom - Claude via bypass
  "antigravity-claude-sonnet-4-6",
  "antigravity-claude-opus-4-6-thinking",
  // Google Native - 2.5
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  // Google Native - 3.x preview
  "gemini-3-flash-preview",
  "gemini-3-pro-preview",
  "gemini-3.1-pro-preview",
  "gemini-3.1-pro-preview-customtools",
] as const;

/**
 * Auth-module supported list (13 ids): the legacy bypass list plus the two
 * bare claude ids folded in from the former oauth(2).ts
 * SUPPORTED_MODELS_2026 (auth.ts v2.1.14 merge).
 */
export const SUPPORTED_MODELS_2026 = [...MODELS_2026_LEGACY, "claude-opus-4-6-thinking", "claude-sonnet-4-6"] as const;

/**
 * Models observed live through fetchAvailableModels on 2026-08-25 (22 ids;
 * the former request.ts MODELS_2026 — the live-validated E2E list, strict
 * superset of the 11-id legacy list).
 */
export const FETCH_AVAILABLE_MODELS_2026 = [
  "gemini-3-pro-preview",
  "gemini-3-flash-preview",
  "gemini-3.1-pro-preview",
  "gemini-3.1-pro-preview-customtools",
  "gemini-3-flash",
  "gemini-3-pro",
  "gemini-2.5-pro",
  "gemini-2.5-flash",
  "gemini-2.5",
  "claude-opus-4-6-thinking",
  "claude-opus-4-6-thinking-low",
  "claude-opus-4-6-thinking-max",
  "claude-sonnet-4-6",
  "claude-sonnet-4-6-thinking",
  "claude-opus-4-5-thinking",
  "antigravity-gemini-3-pro",
  "antigravity-gemini-3-flash",
  "antigravity-gemini-3.1-pro",
  "antigravity-gemini-3-pro-preview",
  "antigravity-gemini-3-flash-preview",
  "antigravity-claude-opus-4-6-thinking",
  "antigravity-claude-sonnet-4-6",
] as const;

/**
 * v1 rich routing catalog (constants.ts lineage, 11 entries with
 * context/output/provider/api/family/quotaGroup metadata). Owner value of
 * the ALL_MODELS_2026 family; ids equal MODELS_2026_LEGACY.
 */
export const ALL_MODELS_2026: readonly LegacyModelDefinition[] = V1_CATALOG_MODELS;

/**
 * Fast lookup by model id over the v1 routing catalog (v2.1.15 Phase A move
 * from constants.ts — model identification lives only in models.ts).
 */
export const MODEL_BY_ID: Readonly<Record<string, LegacyModelDefinition>> = Object.fromEntries(
  V1_CATALOG_MODELS.map((m) => [m.id, m]),
) as Record<string, LegacyModelDefinition>;

/**
 * Per-model routing configuration (v2.1.15 Phase A move from constants.ts
 * V1-06 block; values byte-identical). Endpoint paths come from the
 * constants.ts CODE_ASSIST_PATH_MAP raw substrate.
 */
export interface RoutingConfig {
  endpoint: CodeAssistEndpointPath;
  antigravityVersion: AntigravityVersion;
  requiresOnboard: boolean;
  stream: boolean;
  api: ApiProvider;
  /** internal model mapped to the Cloud API (some need aliasing) */
  cloudModelId: string;
}

export const MODEL_ROUTING: Readonly<Record<string, RoutingConfig>> = {
  "antigravity-gemini-3-pro": {
    endpoint: CODE_ASSIST_PATH_MAP.STREAM_GENERATE_CONTENT,
    antigravityVersion: "v1internal",
    requiresOnboard: true,
    stream: true,
    api: "antigravity",
    cloudModelId: "gemini-3-pro-preview",
  },
  "antigravity-gemini-3.1-pro": {
    endpoint: CODE_ASSIST_PATH_MAP.STREAM_GENERATE_CONTENT,
    antigravityVersion: "v1internal",
    requiresOnboard: true,
    stream: true,
    api: "antigravity",
    cloudModelId: "gemini-3.1-pro-preview",
  },
  "antigravity-gemini-3-flash": {
    endpoint: CODE_ASSIST_PATH_MAP.STREAM_GENERATE_CONTENT,
    antigravityVersion: "v1internal",
    requiresOnboard: true,
    stream: true,
    api: "antigravity",
    cloudModelId: "gemini-3-flash-preview",
  },
  "antigravity-claude-sonnet-4-6": {
    endpoint: CODE_ASSIST_PATH_MAP.STREAM_GENERATE_CONTENT,
    antigravityVersion: "daily-v1internal",
    requiresOnboard: true,
    stream: true,
    api: "antigravity",
    cloudModelId: "claude-sonnet-4-6",
  },
  "antigravity-claude-opus-4-6-thinking": {
    endpoint: CODE_ASSIST_PATH_MAP.STREAM_GENERATE_CONTENT,
    antigravityVersion: "daily-v1internal",
    requiresOnboard: true,
    stream: true,
    api: "antigravity",
    cloudModelId: "claude-opus-4-6-thinking",
  },
  "gemini-2.5-flash": {
    endpoint: CODE_ASSIST_PATH_MAP.GENERATE_CONTENT,
    antigravityVersion: "v1internal",
    requiresOnboard: true,
    stream: false,
    api: "gemini-cli",
    cloudModelId: "gemini-2.5-flash",
  },
  "gemini-2.5-pro": {
    endpoint: CODE_ASSIST_PATH_MAP.GENERATE_CONTENT,
    antigravityVersion: "v1internal",
    requiresOnboard: true,
    stream: false,
    api: "gemini-cli",
    cloudModelId: "gemini-2.5-pro",
  },
  "gemini-3-flash-preview": {
    endpoint: CODE_ASSIST_PATH_MAP.STREAM_GENERATE_CONTENT,
    antigravityVersion: "v1internal",
    requiresOnboard: true,
    stream: true,
    api: "gemini-cli",
    cloudModelId: "gemini-3-flash-preview",
  },
  "gemini-3-pro-preview": {
    endpoint: CODE_ASSIST_PATH_MAP.STREAM_GENERATE_CONTENT,
    antigravityVersion: "v1internal",
    requiresOnboard: true,
    stream: true,
    api: "gemini-cli",
    cloudModelId: "gemini-3-pro-preview",
  },
  "gemini-3.1-pro-preview": {
    endpoint: CODE_ASSIST_PATH_MAP.STREAM_GENERATE_CONTENT,
    antigravityVersion: "v1internal",
    requiresOnboard: true,
    stream: true,
    api: "gemini-cli",
    cloudModelId: "gemini-3.1-pro-preview",
  },
  "gemini-3.1-pro-preview-customtools": {
    endpoint: CODE_ASSIST_PATH_MAP.STREAM_GENERATE_CONTENT,
    antigravityVersion: "v1internal",
    requiresOnboard: true,
    stream: true,
    api: "gemini-cli",
    cloudModelId: "gemini-3.1-pro-preview-customtools",
  },
};

/**
 * One entry of the 2026 antigravity model catalog (rich provider metadata
 * consumed by the opencode.json configure flow).
 * v2.1.16 single-owner fix: moved from cli.ts — model identification lives
 * only in models.ts; cli.ts imports and re-exports it under the historical
 * name.
 */
export interface ModelCatalogEntry {
  id: string;
  name: string;
  provider: "antigravity";
  family: "gemini" | "claude";
  context: number;
  output: number;
  thinking: boolean;
  variants: string[];
  aliases: string[];
}

/**
 * 2026 awareness catalog (8 entries; former cli.ts MODELS_2026_CATALOG,
 * originally ported there from cli(2).ts).
 * v2.1.16 single-owner fix: moved from cli.ts to models.ts — model
 * identification lives only in models.ts; cli.ts keeps
 * buildOpenCodeModelDefinitions (entry orchestration) and re-exports this
 * catalog under the historical exported name. Data byte-identical to the
 * former cli.ts literal.
 */
export const MODELS_2026_CATALOG: readonly ModelCatalogEntry[] = [
  {
    id: "gemini-3-pro-preview",
    name: "Gemini 3 Pro Preview (Antigravity)",
    provider: "antigravity",
    family: "gemini",
    context: 1_048_576,
    output: 65_535,
    thinking: true,
    variants: ["antigravity-gemini-3-pro-preview", "antigravity-gemini-3-pro"],
    aliases: ["gemini-3-pro", "antigravity-gemini-3-pro"],
  },
  {
    id: "gemini-3-flash-preview",
    name: "Gemini 3 Flash Preview (Antigravity)",
    provider: "antigravity",
    family: "gemini",
    context: 1_048_576,
    output: 65_535,
    thinking: false,
    variants: ["antigravity-gemini-3-flash-preview", "antigravity-gemini-3-flash"],
    aliases: ["gemini-3-flash", "antigravity-gemini-3-flash"],
  },
  {
    id: "gemini-3.1-pro-preview",
    name: "Gemini 3.1 Pro Preview (Antigravity)",
    provider: "antigravity",
    family: "gemini",
    context: 1_048_576,
    output: 65_535,
    thinking: true,
    variants: ["antigravity-gemini-3.1-pro-preview", "antigravity-gemini-3.1-pro"],
    aliases: ["gemini-3.1-pro-preview", "gemini-3.1-pro", "antigravity-gemini-3.1-pro"],
  },
  {
    id: "gemini-3.1-pro-preview-customtools",
    name: "Gemini 3.1 Pro Preview CustomTools (Antigravity)",
    provider: "antigravity",
    family: "gemini",
    context: 1_048_576,
    output: 65_535,
    thinking: true,
    variants: [],
    aliases: [],
  },
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro (Antigravity)",
    provider: "antigravity",
    family: "gemini",
    context: 1_048_576,
    output: 65_535,
    thinking: true,
    variants: ["antigravity-gemini-2.5-pro"],
    aliases: ["gemini-2.5", "gemini-2.5-pro-preview"],
  },
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash (Antigravity)",
    provider: "antigravity",
    family: "gemini",
    context: 1_048_576,
    output: 65_535,
    thinking: false,
    variants: ["antigravity-gemini-2.5-flash"],
    aliases: ["gemini-2.5-flash-preview"],
  },
  {
    id: "claude-opus-4-6-thinking",
    name: "Claude Opus 4.6 Thinking (Antigravity)",
    provider: "antigravity",
    family: "claude",
    context: 200_000,
    output: 64_000,
    thinking: true,
    variants: ["antigravity-claude-opus-4-6-thinking", "claude-opus-4-6-thinking-low", "claude-opus-4-6-thinking-max"],
    aliases: ["claude-opus-4-6", "antigravity-claude-opus-4-6"],
  },
  {
    id: "claude-sonnet-4-6",
    name: "Claude Sonnet 4.6 (Antigravity)",
    provider: "antigravity",
    family: "claude",
    context: 200_000,
    output: 64_000,
    thinking: false,
    variants: ["antigravity-claude-sonnet-4-6", "claude-sonnet-4-6-thinking"],
    aliases: ["claude-sonnet-4-6", "antigravity-claude-sonnet-4-6"],
  },
];

/**
 * Id projection of the constants.ts rich definition substrate
 * (MODEL_DEFINITIONS_2026, 49 entries) — the former constants.ts
 * ANTIGRAVITY_MODEL_IDS_2026 semantic.
 */
export const ANTIGRAVITY_MODEL_IDS_2026 = MODEL_DEFINITIONS_2026.map((m) => m.id) as unknown as readonly string[];

/**
 * Explicit prod-only list of the former plugin.ts copy (43 ids — the most
 * complete explicit GEMINI_CLI_ONLY_MODELS variant; strict superset of the
 * request.ts 8-entry and quota.ts derived lists).
 */
export const GEMINI_CLI_ONLY_MODELS = [
  "gemini-3.6-flash-high",
  "gemini-3.6-flash-medium",
  "gemini-3.6-flash-low",
  "gemini-3.6-flash-tiered",
  "gemini-3.6-flash",
  "gemini-3.5-flash-high",
  "gemini-3.5-flash-medium",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.5-flash-lite-preview",
  "gemini-3.1-pro-high",
  "gemini-3.1-pro-low",
  "gemini-3.1-pro",
  "gemini-3.1-flash-image",
  "gemini-3.1-flash-lite",
  "gemini-3-flash",
  "gemini-3-pro",
  "gemini-3-deep-think",
  "gemini-3-pro-preview",
  "gemini-3-flash-preview",
  "gemini-3.1-pro-preview",
  "gemini-3.1-pro-preview-customtools",
  "antigravity-gemini-3.6-flash-high",
  "antigravity-gemini-3.6-flash-medium",
  "antigravity-gemini-3.6-flash-low",
  "antigravity-gemini-3.6-flash-tiered",
  "antigravity-gemini-3.6-flash",
  "antigravity-gemini-3.5-flash-high",
  "antigravity-gemini-3.5-flash-medium",
  "antigravity-gemini-3.5-flash",
  "antigravity-gemini-3.5-flash-lite",
  "antigravity-gemini-3.5-flash-lite-preview",
  "antigravity-gemini-3.1-pro-high",
  "antigravity-gemini-3.1-pro-low",
  "antigravity-gemini-3.1-pro",
  "antigravity-gemini-3.1-flash-image",
  "antigravity-gemini-3.1-flash-lite",
  "antigravity-gemini-3-flash",
  "antigravity-gemini-3-pro",
  "antigravity-gemini-3-deep-think",
  "antigravity-gemini-3-pro-preview",
  "antigravity-gemini-3-flash-preview",
  "antigravity-gemini-3.1-pro-preview",
] as const;

/**
 * Quota-group routing table (the former quota.ts ANTIGRAVITY_MODELS_2026 —
 * 17 rich entries with quota-pool group assignments that diverge from the
 * constants.ts catalog lineage, so it keeps its own accurate name). Drives
 * quota pool resolution; verbatim value merge.
 */
export const QUOTA_GROUP_MODEL_DEFINITIONS = [
  {
    id: "antigravity-gemini-3-pro",
    displayName: "Gemini 3 Pro (Antigravity)",
    group: "antigravity",
    contextWindow: 1_048_576,
    outputLimit: 65_535,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: false,
  },
  {
    id: "antigravity-gemini-3-flash",
    displayName: "Gemini 3 Flash (Antigravity)",
    group: "antigravity",
    contextWindow: 1_048_576,
    outputLimit: 65_535,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: false,
  },
  {
    id: "antigravity-gemini-3.1-pro",
    displayName: "Gemini 3.1 Pro (Antigravity)",
    group: "antigravity",
    contextWindow: 1_048_576,
    outputLimit: 65_535,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: false,
  },
  {
    id: "gemini-2.5-flash",
    displayName: "Gemini 2.5 Flash",
    group: "antigravity",
    contextWindow: 1_048_576,
    outputLimit: 65_535,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: false,
  },
  {
    id: "gemini-2.5-pro",
    displayName: "Gemini 2.5 Pro",
    group: "antigravity",
    contextWindow: 1_048_576,
    outputLimit: 65_535,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: false,
  },
  {
    id: "gemini-3-flash-preview",
    displayName: "Gemini 3 Flash Preview",
    group: "gemini-cli",
    contextWindow: 1_048_576,
    outputLimit: 65_535,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: true,
    isClaude: false,
  },
  {
    id: "gemini-3-pro-preview",
    displayName: "Gemini 3 Pro Preview",
    group: "gemini-cli",
    contextWindow: 1_048_576,
    outputLimit: 65_535,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: true,
    isClaude: false,
  },
  {
    id: "gemini-3.1-pro-preview",
    displayName: "Gemini 3.1 Pro Preview",
    group: "gemini-cli",
    contextWindow: 1_048_576,
    outputLimit: 65_535,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: true,
    isClaude: false,
  },
  {
    id: "gemini-3.1-pro-preview-customtools",
    displayName: "Gemini 3.1 Pro Preview CustomTools",
    group: "gemini-cli",
    contextWindow: 1_048_576,
    outputLimit: 65_535,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: true,
    isClaude: false,
  },
  {
    id: "claude-opus-4-6-thinking",
    displayName: "Claude Opus 4.6 Thinking",
    group: "antigravity",
    contextWindow: 200_000,
    outputLimit: 64_000,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: true,
  },
  {
    id: "claude-opus-4-6-thinking-low",
    displayName: "Claude Opus 4.6 Thinking Low",
    group: "antigravity",
    contextWindow: 200_000,
    outputLimit: 64_000,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: true,
  },
  {
    id: "claude-opus-4-6-thinking-max",
    displayName: "Claude Opus 4.6 Thinking Max",
    group: "antigravity",
    contextWindow: 200_000,
    outputLimit: 64_000,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: true,
  },
  {
    id: "claude-sonnet-4-6",
    displayName: "Claude Sonnet 4.6",
    group: "antigravity",
    contextWindow: 200_000,
    outputLimit: 64_000,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: true,
  },
  {
    id: "claude-opus-4-5-thinking",
    displayName: "Claude Opus 4.5 Thinking (Legacy)",
    group: "antigravity",
    contextWindow: 200_000,
    outputLimit: 64_000,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: true,
  },
  // Aliases bare gemini-3-* without antigravity- prefix - server accepts both
  {
    id: "gemini-3-flash",
    displayName: "Gemini 3 Flash",
    group: "gemini-cli",
    contextWindow: 1_048_576,
    outputLimit: 65_535,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: false,
  },
  {
    id: "gemini-3-pro",
    displayName: "Gemini 3 Pro",
    group: "gemini-cli",
    contextWindow: 1_048_576,
    outputLimit: 65_535,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: false,
  },
  {
    id: "gemini-3.1-pro",
    displayName: "Gemini 3.1 Pro",
    group: "gemini-cli",
    contextWindow: 1_048_576,
    outputLimit: 65_535,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true,
    isPreview: false,
    isClaude: false,
  },
] as const satisfies readonly AntigravityModelDefinition[];

/**
 * Id projection of the quota group routing table (the former quota.ts
 * ANTIGRAVITY_MODEL_IDS_2026).
 */
export const QUOTA_GROUP_MODEL_IDS_2026 = QUOTA_GROUP_MODEL_DEFINITIONS.map(
  (m) => m.id,
) as unknown as readonly string[];

/**
 * Gemini-CLI-pool subset of the quota group routing table (the former
 * quota.ts GEMINI_CLI_ONLY_MODELS).
 */
export const QUOTA_GROUP_GEMINI_CLI_ONLY_MODELS = QUOTA_GROUP_MODEL_DEFINITIONS.filter(
  (m) => m.group === "gemini-cli",
).map((m) => m.id) as unknown as readonly string[];

/**
 * Catalog id list (93 ids — bare + antigravity aliases of the frozen
 * catalog); the historical models.ts ANTIGRAVITY_MODELS_2026 semantic.
 */
export const ANTIGRAVITY_MODELS_2026 = MODEL_CATALOG_2026_08_25.map((m) => m.id) as unknown as readonly string[];

/**
 * Catalog prodOnly projection — the historical models.ts
 * GEMINI_CLI_ONLY_MODELS_2026 semantic (distinct name from the explicit
 * plugin-lineage GEMINI_CLI_ONLY_MODELS above).
 */
export const GEMINI_CLI_ONLY_MODELS_2026 = MODEL_CATALOG_2026_08_25.filter((m) => m.endpointHints.prodOnly).map(
  (m) => m.id,
) as unknown as readonly string[];

/**
 * Preview slice of the catalog (id projection).
 */
export const PREVIEW_MODELS_2026 = getPreviewModels().map((m) => m.id) as unknown as readonly string[];

/**
 * Union of the legacy bypass list ids (the former accounts.ts / config.ts /
 * project.ts / quota.ts Model2026 and fingerprint.ts / recovery.ts /
 * streaming.ts ModelId2026 semantics — 11 literals).
 */
export type Model2026 = (typeof MODELS_2026_LEGACY)[number];

/** Historical alias of {@link Model2026} (same union, parallel name). */
export type ModelId2026 = Model2026;

/** Union of {@link SUPPORTED_MODELS_2026} (auth lineage). */
export type SupportedModel2026 = (typeof SUPPORTED_MODELS_2026)[number];

/** Union of {@link FETCH_AVAILABLE_MODELS_2026} (request lineage). */
export type FetchAvailableModel2026 = (typeof FETCH_AVAILABLE_MODELS_2026)[number];

export const MODEL_CATALOG = MODEL_CATALOG_2026_08_25;
export const MODEL_MAP = MODEL_MAP_2026_08_25;

// ---------------------------------------------------------------------------
// Section 15. Absorbed classifiers (plugin.ts / request.ts / search.ts /
// auth.ts lineage — v2.1.15 Phase A)
// ---------------------------------------------------------------------------

/**
 * Determines whether a model must use the prod-only Gemini CLI pool (skip
 * sandbox). Canonical merge of the constants.ts, plugin.ts, quota.ts and
 * request.ts variants: the request.ts implementation wins (live-validated
 * v2.1.14 E2E chain and classification superset — it adds the customtools
 * policy and matches every gemini-3* form anywhere in the id). The explicit
 * GEMINI_CLI_ONLY_MODELS list is retained above for documentation/surface;
 * every entry of every historical variant is also covered by the policy
 * checks, so all consumers keep their exact classification behavior.
 *
 * Rule from RESEARCH:
 * - any model containing preview → cli only
 * - any gemini-3 or gemini-3.1 → cli only (2026 policy)
 * - explicit list GEMINI_CLI_ONLY_MODELS
 * Third-person observer: emulates behavior that fixed #233
 *
 * @param modelId - model id to test
 * @returns true if must skip sandbox
 */
export function isGeminiCLIOnlyModel(modelId: string): boolean {
  if (!modelId || typeof modelId !== "string") return false;
  const lower = modelId.trim().toLowerCase();
  if (!lower) return false;

  // explicit list match
  if ((GEMINI_CLI_ONLY_MODELS as readonly string[]).includes(lower as any)) return true;
  if ((GEMINI_CLI_ONLY_MODELS as readonly string[]).some((m) => lower.includes(m))) return true;

  // policy: preview → prod only
  if (lower.includes("preview")) return true;

  // policy: customtools variants are Antigravity 2026 features — prod only
  // (union merged from request-helpers.ts in v2.1.14)
  if (lower.includes("customtools")) return true;

  // policy: gemini-3+ only prod — covers gemini-3-pro-preview, gemini-3-flash, gemini-3.1-pro-preview, antigravity-gemini-3-*
  if (lower.includes("gemini-3") || lower.startsWith("antigravity-gemini-3")) return true;

  // also antigravity-gemini-3 aliases
  if (lower.includes("gemini-3.") || lower.includes("antigravity-gemini-3.")) return true;

  return false;
}

/**
 * Detects image-generation-capable models (image variants and flash-image /
 * imagen families). Merged from plugin.ts (image || imagen, null-safe) and
 * search.ts (image || 3.1-flash-image — the second clause is subsumed by
 * the first, so the union is behavior-identical for both consumers).
 */
export function isImageGenModel(modelId: string): boolean {
  const l = String(modelId ?? "").toLowerCase();
  return l.includes("image") || l.includes("imagen");
}

/**
 * Builds the Gemini image-generation request fragment: aspect ratio from
 * argument or OPENCODE_IMAGE_ASPECT_RATIO env (default 1:1), TEXT+IMAGE
 * modalities and permissive safety settings. Canonical is the plugin.ts
 * shape (top-level responseModalities — the live-used variant); the
 * search.ts variant wrapped them in generationConfig and had no in-repo
 * consumers.
 */
export function buildImageGenConfig(aspect?: string): any {
  const ar = aspect || process.env.OPENCODE_IMAGE_ASPECT_RATIO || "1:1";
  return {
    imageConfig: { aspectRatio: ar },
    responseModalities: ["TEXT", "IMAGE"],
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
    ],
  };
}

/**
 * Maps a model id to its routing group ("gemini-cli" when the model contains
 * "preview" or starts with a gemini-3.x prefix (3, 3.1, 3.5, 3.6, 3.7);
 * otherwise "antigravity" — claude and gpt-oss always antigravity).
 * Canonical merge of the auth.ts (gemini-3.7-aware) and plugin.ts
 * (claude/gpt-oss precedence) variants: equivalent on every real catalog id
 * and a classification superset of both on synthetic ids.
 */
export const mapModelToGroup = (m: string): "antigravity" | "gemini-cli" => {
  const l = String(m ?? "").toLowerCase();
  if (l.includes("claude") || l.includes("gpt-oss")) return "antigravity";
  if (l.includes("gemini")) {
    return l.includes("preview") ||
      l.includes("3-") ||
      l.startsWith("gemini-3.7") ||
      l.startsWith("gemini-3.6") ||
      l.startsWith("gemini-3.5") ||
      l.startsWith("gemini-3.1") ||
      l.startsWith("gemini-3")
      ? "gemini-cli"
      : "antigravity";
  }
  return "antigravity";
};

/**
 * Ordered endpoint cascade for a model: explicit overrides win; Gemini-CLI
 * -only models get the PROD+DAILY order; everything else gets the full
 * PROD/DAILY/SANDBOX order. Canonical is the request.ts variant
 * (live-validated E2E chain); the plugin.ts variant's extra shouldSkipSandbox
 * consultation is subsumed by the canonical isGeminiCLIOnlyModel classifier.
 */
export function getEndpointsForModel(modelId: string, overrides?: string[]): string[] {
  if (overrides && overrides.length > 0) {
    return overrides.map((e) => stripTrailingSlashes(e)).filter(Boolean);
  }
  if (isGeminiCLIOnlyModel(modelId)) {
    return [...ENDPOINT_ORDER_GEMINI_CLI];
  }
  return [...ENDPOINT_ORDER_ANTIGRAVITY];
}

// ---------------------------------------------------------------------------
// Section 16. Barrel export for library-first root-first usage
// ---------------------------------------------------------------------------

export const ModelsModule = {
  CATALOG_DATE_ISO,
  CATALOG_DATE_BR,
  CATALOG_VERSION,
  REFERENCES,
  TIMELINE: OPENCODE_TXT_TIMELINE,
  ENDPOINTS: CODE_ASSIST_ENDPOINTS,
  ENDPOINT_ORDER,
  ENDPOINT_ORDER_ANTIGRAVITY,
  ENDPOINT_ORDER_GEMINI_CLI,
  PROJECT_FALLBACK,
  ANTIGRAVITY_VERSION_FALLBACK,
  THINKING_LEVELS,
  THINKING_BUDGET_MAP,
  CONTEXT_WINDOW_GEMINI,
  CONTEXT_WINDOW_CLAUDE,
  OUTPUT_LIMIT_GEMINI,
  OUTPUT_LIMIT_CLAUDE,
  CATALOG: MODEL_CATALOG_2026_08_25,
  MAP: MODEL_MAP_2026_08_25,
  ALIASES: MODEL_ALIASES_2026_08_25,
  GROUPED: MODEL_CATALOG_GROUPED,
  FLAT: MODELS_2026_08_25,
  DEFAULT_MODEL,
  SEARCH_MODEL,
  SEARCH_MODEL_PREVIEW,
  SEARCH_MODEL_FALLBACKS,
  OMNIROUTE_FALLBACK_MODEL,
  FALLBACKS,
  MODELS_2026,
  GEMINI_BARE_MODEL_IDS,
  MODELS_2026_BASE,
  MODELS_2026_ANTIGRAVITY_ALIAS,
  MODELS_2026_PROVIDER,
  MODELS_2026_ANTIGRAVITY,
  MODELS_2026_ALL,
  MODELS_2026_LEGACY,
  SUPPORTED_MODELS_2026,
  FETCH_AVAILABLE_MODELS_2026,
  ALL_MODELS_2026,
  ANTIGRAVITY_MODEL_IDS_2026,
  ANTIGRAVITY_MODELS_2026,
  GEMINI_CLI_ONLY_MODELS,
  GEMINI_CLI_ONLY_MODELS_2026,
  PREVIEW_MODELS_2026,
  QUOTA_GROUP_MODEL_DEFINITIONS,
  QUOTA_GROUP_MODEL_IDS_2026,
  QUOTA_GROUP_GEMINI_CLI_ONLY_MODELS,
  // getters
  getModel,
  hasModel,
  isPreview,
  isThinkingModel,
  isImageModel,
  isAntagravityGroup,
  isGeminiCliGroup,
  isCLIOnly,
  getModelsByGroup,
  getModelsByThinkingLevel,
  getPreviewModels,
  getStableModels,
  getAntagravityModels,
  getGeminiCliModels,
  getThinkingBudget,
  getContextWindow,
  getOutputLimit,
  getEndpointForModel,
  shouldSkipSandboxForModel,
  listModelIds,
  listBareModelIds,
  searchModels,
  routeModelViaOmniRoute,
  mapModelFor9Router,
  normalizeModelId,
  parseThinkingLevelFromId,
  getThinkingBudgetForLevel,
  isGeminiCliOnlyId,
  isGeminiCLIOnlyModel,
  isImageGenModel,
  buildImageGenConfig,
  mapModelToGroup,
  getEndpointsForModel,
  fnv1a32,
};

/** Back-compat alias of ModelsModule (previous barrel name). */
export const Models2026Module = ModelsModule;

export default ModelsModule;

// v2.1.15 Phase B: the identity-masquerade helpers (getDynamicUserAgent,
// normalizePlatform, normalizeArch, buildAntagravityHeaders), the header
// stripper, isRetryableStatus, getJitterMs and fetchWithTimeout moved out —
// identity logic lives in fingerprint.ts, generic utilities in core.ts,
// request utilities in request.ts. models.ts contains model identification
// ONLY.
