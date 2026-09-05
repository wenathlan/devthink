/**
 * @fileoverview quota.ts - Full quota manager for maene (merged)
 * @module auth/quota
 * @description
 *  Merged module. Lineage A (dual-source Antigravity + Gemini CLI quota with
 *  adaptive TTL cache, soft 90% threshold, background refresh, resilient
 *  parsing of v1internal:retrieveUserQuotaSummary) is the canonical surface.
 *
 *  v2.1.16 dead-code cleanup: the unused resilient lineage-B quota engine
 *  (zero consumers) was deleted. It duplicated lineage A as a second complete
 *  engine under aliased names — resolveQuotaPoolGroup (+ resolveGroup /
 *  getQuotaGroupForModel / modelToGroup), parseQuotaResponseResilient,
 *  retrieveUserQuotaSummaryResilient, checkQuotaFromSummary,
 *  isQuotaExhaustedBySummary, shouldSkipAccountBySummary,
 *  QuotaManagerResilient (+ getQuotaManager / resetQuotaManager /
 *  fetchQuotaWithCache / refreshQuotaBackground), getAdaptiveTtlMs,
 *  resolveBaseTtlFromConfig, parseRateLimitHeaders, hashToken's engine
 *  cluster, QUOTA_INFO and the Quota facade — every one verified by grep to
 *  have zero consumers outside quota.ts before deletion.
 *
 *  Canonical (lineage A) surface: OAUTH_CLIENT_ID/OAUTH_CLIENT_SECRET/GEMINI_CLI_SCOPES,
 *  PROJECT_FALLBACK, ENDPOINTS/ENDPOINTS_DAILY/QUOTA_ENDPOINTS + QuotaSource,
 *  QUOTA_GROUP_DEFS/QuotaGroupId/ResilientQuotaGroupDef, QUOTA_METHOD,
 *  QuotaWindow, QuotaBucketRaw/Parsed,
 *  QuotaGroupRaw/Parsed, QuotaSummaryRaw/Parsed, computeAdaptiveTtlMs,
 *  getQuotaRefreshIntervalMs, listQuotaGroups/getQuotaGroup, buildQuotaHeaders(token,source),
 *  parseQuotaBucket/parseQuotaGroup, QuotaFetchError, retrieveUserQuotaSummary,
 *  retrieveDualQuota, QuotaCacheManager + getQuotaCacheManager, QuotaManager +
 *  getDefaultQuotaManager, canProceedWithRequest, QuotaConfig/DEFAULT_QUOTA_CONFIG/
 *  resolveQuotaConfig, QUOTA_CACHE_FILE, hashToken.
 *
 *  Production-ready, only node:* builtins + global fetch. Zero external deps.
 *
 * @author ONDA 3 - Core Modules (A) + maene (B)
 * @license MIT
 * @since 2026
 */

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import * as crypto from "node:crypto";
import { createHash } from "node:crypto";

// Deduplicated against the frozen owners (constants.ts / models.ts) and the
// canonical in-set file (project.ts): symbols whose local definitions were
// value-identical are imported and re-exported below, so each has exactly one
// definition (library dedupe task 2-d1).
import {
  PROJECT_FALLBACK,
  QUOTA_SOFT_THRESHOLD,
  QUOTA_CACHE_TTL_MIN_MS,
  QUOTA_CACHE_TTL_MS,
  QUOTA_TIMEOUT_MS,
  JITTER_MIN_MS,
  JITTER_MAX_MS,
  ANTIGRAVITY_VERSION_FALLBACK,
  ANTIGRAVITY_USER_AGENT_FALLBACK,
  ANTIGRAVITY_CLIENT_ID_IS_BLINDED,
  ANTIGRAVITY_CLIENT_SECRET_IS_BLINDED,
  ANTIGRAVITY_ENDPOINT_FALLBACKS,
  GEMINI_CLI_ENDPOINT,
  QUOTA_ENDPOINT,
  PROJECT_ID_FALLBACK,
  PROJECT_NAME_FALLBACK,
} from "./constants.js";
import { fnv1a32, isRetryableStatus } from "./core.js";
import { getXGoogApiClient } from "./fingerprint.js";
import type { QuotaGroup } from "./constants.js";
import { ANTIGRAVITY_VERSION_MIN, isGeminiCLIOnlyModel, MODELS_2026_LEGACY, UA_DEFAULT_MODEL } from "./models.js";
import { API_PATHS, API_PATHS_DAILY } from "./request.js";
import {
  QUOTA_CACHE_TTL_MAX_MS,
  QUOTA_HARD_THRESHOLD,
  CLIENT_METADATA_STRING,
  GEMINI_CLI_OAUTH_CLIENT_ID,
  GEMINI_CLI_OAUTH_CLIENT_SECRET,
  GEMINI_CLI_USER_AGENT,
} from "./constants.js";
import { X_GOOG_API_CLIENT_GEMINI_CLI as X_GOOG_API_CLIENT } from "./fingerprint.js";

// Re-exports preserve this module's public surface after the dedupe.
export {
  PROJECT_FALLBACK,
  QUOTA_SOFT_THRESHOLD,
  QUOTA_CACHE_TTL_MIN_MS,
  QUOTA_CACHE_TTL_MS,
  QUOTA_TIMEOUT_MS,
  JITTER_MIN_MS,
  JITTER_MAX_MS,
  ANTIGRAVITY_VERSION_FALLBACK,
  ANTIGRAVITY_USER_AGENT_FALLBACK,
  ANTIGRAVITY_CLIENT_ID_IS_BLINDED,
  ANTIGRAVITY_CLIENT_SECRET_IS_BLINDED,
  ANTIGRAVITY_ENDPOINT_FALLBACKS,
  GEMINI_CLI_ENDPOINT,
  QUOTA_ENDPOINT,
  PROJECT_ID_FALLBACK,
  PROJECT_NAME_FALLBACK,
  getXGoogApiClient,
  ANTIGRAVITY_VERSION_MIN,
  isRetryableStatus,
  X_GOOG_API_CLIENT,
  CLIENT_METADATA_STRING,
};
// v2.1.15 Phase C: the historical OAUTH_CLIENT_ID/OAUTH_CLIENT_SECRET names
// (gemini-cli pair) are re-exported from the constants.js owner.
export {
  GEMINI_CLI_OAUTH_CLIENT_ID as OAUTH_CLIENT_ID,
  GEMINI_CLI_OAUTH_CLIENT_SECRET as OAUTH_CLIENT_SECRET,
} from "./constants.js";
export type { QuotaGroup };

// =============================================================================
// BLINDED CONSTANTS - GEMINI CLI BYPASS
// =============================================================================

// OAUTH_CLIENT_ID / OAUTH_CLIENT_SECRET: static Gemini CLI client values
// identical to the canonical project.ts definitions — imported and re-exported
// above (constants.ts exports the same values under the
// GEMINI_CLI_OAUTH_CLIENT_ID / GEMINI_CLI_OAUTH_CLIENT_SECRET names).

// v2.1.15 Phase C: GEMINI_CLI_SCOPES is owned by constants.js
// (GEMINI_CLI_SCOPES); quota.ts no longer imports it (the v2.1.16 cleanup
// removed its last dead local reference).

// PROJECT_FALLBACK: identical "rising-fact-p41fc" — imported and re-exported above.

// local variant: no same-named owner export (constants owns CODE_ASSIST_ENDPOINTS / GEMINI_CLI_ENDPOINT under other names)

// v2.1.15 Phase D: the method-path maps moved to request.ts as API_PATHS / API_PATHS_DAILY.

/**
 * Dual quota mapping: Antigravity uses the daily endpoint (real quota),
 * Gemini CLI uses the base endpoint (historically returns 1.0 but still queried).
 */
export const QUOTA_ENDPOINTS = {
  antigravity: API_PATHS_DAILY.retrieveUserQuotaSummary,
  "gemini-cli": API_PATHS.retrieveUserQuotaSummary,
} as const;

export type QuotaSource = keyof typeof QUOTA_ENDPOINTS; // 'antigravity' | 'gemini-cli'

// local variant: diverges from constants (static full GeminiCLI UA vs the dynamic GEMINI_CLI_USER_AGENT_FALLBACK "gemini-cli/0.57.0 os/arch")

export const GEMINI_CLI_USER_AGENT_ANTIGRAVITY =
  "antigravity/1.12.8 (linux; x64; VSCode/1.90.0; Antigravity) google-api-nodejs-client/9.15.1" as const;

// X_GOOG_API_CLIENT: static "gl-node/22.19.0" identical to the canonical
// project.ts definition — imported and re-exported above (constants.ts's
// same-named symbol is dynamic and therefore divergent).

// local variant: no same-named owner export (Antigravity IDE metadata string)
export const CLIENT_METADATA_ANTIGRAVITY =
  "ideType=IDE_VSCODE,platform=PLATFORM_UNSPECIFIED,pluginType=ANTIGRAVITY" as const;

// CLIENT_METADATA_STRING: identical to the canonical project.ts definition —
// imported and re-exported above.

// v2.1.15 Phase A: the local MODELS_2026 (11 legacy ids) and Model2026 type
// were byte-identical to models.ts MODELS_2026_LEGACY and were deleted — the
// canonical family names live only in models.ts.

// =============================================================================
// QUOTA GROUPS & TTL CONSTANTS
// =============================================================================

/**
 * Default interval for quota refresh (minutes).
 * Can be overridden via config or env QUOTA_REFRESH_INTERVAL_MINUTES.
 */
export const QUOTA_REFRESH_INTERVAL_MINUTES_DEFAULT = 15 as const;
export const QUOTA_REFRESH_INTERVAL_MS_DEFAULT = QUOTA_REFRESH_INTERVAL_MINUTES_DEFAULT * 60 * 1000;

// QUOTA_SOFT_THRESHOLD: identical 0.9 — imported and re-exported above.
export const QUOTA_SOFT_REMAINING = 1 - QUOTA_SOFT_THRESHOLD; // 0.1

// v2.1.15 Phase D: QUOTA_HARD_THRESHOLD (0.98 lineage A) is the canonical
// value in constants.js — imported from the owner.
export const QUOTA_CACHE_TTL_MS_DEFAULT = 15 * 60 * 1000; // 15min default
// QUOTA_CACHE_TTL_MIN_MS: identical 2min — imported and re-exported above.
// v2.1.15 Phase D: QUOTA_CACHE_TTL_MAX_MS (30min lineage A) is the canonical
// value in constants.js — imported from the owner.
export const QUOTA_CACHE_FILE = path.join(os.homedir(), ".config", "opencode", "cache", "antigravity", "quota.json");

export const QUOTA_REQUEST_TIMEOUT_MS = 10_000 as const;

// Canonical definition of the internal logical groups (used by resolveQuotaGroup)
export type QuotaGroupId =
  | "gemini-3-pro"
  | "gemini-3.1-pro"
  | "gemini-3-flash"
  | "gemini-2.5-pro"
  | "gemini-2.5-flash"
  | "claude-sonnet"
  | "claude-opus"
  | "gemini" // generic grouping returned by the API (Gemini Models)
  | "claude-3p" // generic Claude+GPT grouping (3p)
  | "unknown";

// v2.1.15 Phase C: renamed from QuotaGroupDef (the former constants.js
// group/models[] shape was deleted in v2.1.16 as dead code) — this is the
// live quota-group definition used by resolveQuotaGroup/getQuotaGroup.
export interface ResilientQuotaGroupDef {
  id: QuotaGroupId;
  displayNamePattern: RegExp; // regex para casar displayName da API
  models: readonly string[];
  dailyLimit: number;
  rpm: number;
  tpm: number;
}

/**
 * Quota-group routing table. models.ts owns ALL model identification
 * (catalog, rosters, aliases); this table is quota-group routing derived
 * from the models.ts catalog (v2.1.16 dedup note): the ids below are the
 * quota-specific routing keys, and the antigravity-prefixed claude ids are
 * quota-route spellings with no single-id export in models.ts — kept local
 * so quota routing stays byte-identical (no behavior change).
 */
export const QUOTA_GROUP_DEFS: readonly ResilientQuotaGroupDef[] = [
  {
    id: "gemini-3-pro",
    displayNamePattern: /gemini.*3.*pro/i,
    models: ["antigravity-gemini-3-pro", "gemini-3-pro-preview"] as const,
    dailyLimit: 1000,
    rpm: 60,
    tpm: 1_000_000,
  },
  {
    id: "gemini-3.1-pro",
    displayNamePattern: /gemini.*3\.1.*pro/i,
    models: ["antigravity-gemini-3.1-pro", "gemini-3.1-pro-preview", "gemini-3.1-pro-preview-customtools"] as const,
    dailyLimit: 500,
    rpm: 30,
    tpm: 2_000_000,
  },
  {
    id: "gemini-3-flash",
    displayNamePattern: /gemini.*3.*flash|flash/i,
    models: ["antigravity-gemini-3-flash", "gemini-3-flash-preview"] as const,
    dailyLimit: 2000,
    rpm: 120,
    tpm: 1_000_000,
  },
  {
    id: "gemini-2.5-pro",
    displayNamePattern: /gemini.*2\.5.*pro/i,
    models: ["gemini-2.5-pro"] as const,
    dailyLimit: 1500,
    rpm: 60,
    tpm: 1_000_000,
  },
  {
    id: "gemini-2.5-flash",
    displayNamePattern: /gemini.*2\.5.*flash/i,
    models: ["gemini-2.5-flash"] as const,
    dailyLimit: 3000,
    rpm: 240,
    tpm: 1_000_000,
  },
  {
    id: "claude-sonnet",
    displayNamePattern: /claude.*sonnet|3p|third.party/i,
    models: ["antigravity-claude-sonnet-4-6"] as const,
    dailyLimit: 500,
    rpm: 30,
    tpm: 200_000,
  },
  {
    id: "claude-opus",
    displayNamePattern: /claude.*opus/i,
    models: ["antigravity-claude-opus-4-6-thinking"] as const,
    dailyLimit: 250,
    rpm: 15,
    tpm: 200_000,
  },
] as const;

// =============================================================================
// TYPES - QUOTA API RESPONSE
// =============================================================================

export type QuotaWindow = "weekly" | "5h" | "daily" | "hourly" | "monthly" | string;

export interface QuotaBucketRaw {
  bucketId: string; // ex: "gemini-weekly", "gemini-5h", "3p-weekly"
  displayName?: string; // "Weekly Limit", "Five Hour Limit"
  window?: QuotaWindow;
  resetTime?: string; // ISO "2026-07-25T01:43:09Z"
  description?: string;
  remainingFraction?: number; // 0.0 - 1.0
  remaining?: number; // numeric alternative
  limit?: number;
  used?: number;
}

export interface QuotaGroupRaw {
  displayName?: string; // "Gemini Models", "Claude and GPT models"
  description?: string; // "Models within this group: Gemini Flash, Gemini Pro"
  buckets?: QuotaBucketRaw[];
  quotaGroup?: string; // backend sometimes returns an id here
}

export interface QuotaSummaryRaw {
  groups?: QuotaGroupRaw[];
  quotaGroup?: QuotaGroupRaw[]; // fallback variante
  // Alguns payloads retornam diretamente buckets no root
  buckets?: QuotaBucketRaw[];
}

export interface QuotaBucketParsed {
  bucketId: string;
  displayName: string;
  window: QuotaWindow;
  resetTime: string | null; // ISO persistido
  resetTimeMs: number | null; // epoch ms for calculations
  remainingFraction: number; // normalizado 0..1
  remainingPercent: number; // 0..100
  isExhausted: boolean; // remaining <= 0.02
  isSoftExhausted: boolean; // remaining <= 0.1 (90% threshold)
  description: string;
}

export interface QuotaGroupParsed {
  id: QuotaGroupId; // resolvido via mapping ou unknown
  displayName: string;
  description: string;
  rawDisplayName: string;
  source: QuotaSource;
  buckets: QuotaBucketParsed[];
  // Helpers agregados
  weeklyRemaining: number | null;
  fiveHourRemaining: number | null;
  minRemainingFraction: number; // menor remaining entre buckets (pior caso)
  minBucket: QuotaBucketParsed | null;
  isExhausted: boolean;
  isSoftExhausted: boolean;
}

export interface QuotaSummaryParsed {
  groups: QuotaGroupParsed[];
  fetchedAt: number;
  expiresAt: number;
  ttlMs: number;
  source: QuotaSource;
  projectId: string;
  // agregados globais
  globalMinRemaining: number;
  isAnyExhausted: boolean;
  isAnySoftExhausted: boolean;
}

export interface QuotaCacheEntry {
  summary: QuotaSummaryParsed;
  raw: QuotaSummaryRaw;
  tokenHash: string; // token hash used for invalidation
  cachedAt: number;
  expiresAt: number;
  ttlMs: number;
}

export interface CheckQuotaResult {
  allowed: boolean;
  groupId: QuotaGroupId | null;
  bucketId: string | null;
  remainingFraction: number | null;
  remainingPercent: number | null;
  resetTime: string | null;
  resetTimeMs: number | null;
  reason: string;
  isSoftThreshold: boolean;
  isHardExhausted: boolean;
  shouldSkipAccount: boolean;
  source: QuotaSource;
  group?: QuotaGroupParsed | undefined;
  bucket?: QuotaBucketParsed | undefined;
}

// =============================================================================
// UTILS
// =============================================================================

// hashToken (SHA-256 truncated to 32 hex chars with FNV-1a fallback) is
// defined below next to the cache layer and keys both cache levels.

function parseIsoToMs(iso?: string | null): number | null {
  if (!iso) return null;
  const ms = Date.parse(iso);
  return Number.isNaN(ms) ? null : ms;
}

function clampFraction(n: unknown): number {
  if (typeof n !== "number" || Number.isNaN(n)) return 1.0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

function nowMs(): number {
  return Date.now();
}

/**
 * Adaptive TTL: the lower the remaining fraction, the shorter the TTL so
 * refresh happen sooner.
 * - <10% => 2min
 * - <20% => 5min
 * - <50% => 10min
 * - >=50% => 15min default, still honoring a nearby resetTime
 */
export function computeAdaptiveTtlMs(
  summary: QuotaSummaryRaw | QuotaSummaryParsed,
  baseTtlMs: number = QUOTA_CACHE_TTL_MS_DEFAULT,
): number {
  let minRemaining = 1.0;

  // Extract the lowest remainingFraction
  if ("groups" in summary && Array.isArray((summary as any).groups)) {
    const groups = (summary as QuotaGroupParsed[] | QuotaGroupRaw[]).flatMap((g: any) =>
      Array.isArray(g.buckets) ? g.buckets : [],
    );
    for (const b of groups) {
      const f = clampFraction((b as any).remainingFraction ?? (b as any).remaining ?? 1);
      if (f < minRemaining) minRemaining = f;
    }
  }

  // When Parsed already carries globalMin
  if ("globalMinRemaining" in summary) {
    minRemaining = (summary as QuotaSummaryParsed).globalMinRemaining;
  }

  let ttl = baseTtlMs;

  if (minRemaining <= QUOTA_SOFT_REMAINING) {
    ttl = QUOTA_CACHE_TTL_MIN_MS; // 2min
  } else if (minRemaining <= 0.2) {
    ttl = 5 * 60 * 1000;
  } else if (minRemaining <= 0.5) {
    ttl = 10 * 60 * 1000;
  } else {
    ttl = baseTtlMs;
  }

  // Adjust when a resetTime is very close (e.g. < ttl)
  let nearestResetMs: number | null = null;
  if ("groups" in summary) {
    for (const g of (summary as any).groups as QuotaGroupParsed[]) {
      for (const b of g.buckets ?? []) {
        const rt = (b as QuotaBucketParsed).resetTimeMs ?? parseIsoToMs((b as any).resetTime);
        if (rt != null) {
          if (nearestResetMs == null || rt < nearestResetMs) nearestResetMs = rt;
        }
      }
    }
  }

  if (nearestResetMs != null) {
    const msUntilReset = nearestResetMs - nowMs();
    if (msUntilReset > 0 && msUntilReset < ttl) {
      // If reset precedes the TTL, schedule refresh right after reset + 30s jitter
      ttl = Math.max(QUOTA_CACHE_TTL_MIN_MS, msUntilReset + 30_000);
    }
  }

  return Math.max(QUOTA_CACHE_TTL_MIN_MS, Math.min(ttl, QUOTA_CACHE_TTL_MAX_MS));
}

export function getQuotaRefreshIntervalMs(configMinutes?: number): number {
  const envVal = process.env.QUOTA_REFRESH_INTERVAL_MINUTES ?? process.env.ANTIGRAVITY_QUOTA_REFRESH_MINUTES;
  let minutes = configMinutes ?? QUOTA_REFRESH_INTERVAL_MINUTES_DEFAULT;

  if (envVal != null) {
    const parsed = Number.parseInt(envVal, 10);
    if (!Number.isNaN(parsed) && parsed > 0 && parsed <= 120) {
      minutes = parsed;
    }
  }

  if (minutes <= 0) minutes = QUOTA_REFRESH_INTERVAL_MINUTES_DEFAULT;
  if (minutes > 120) minutes = 120;

  return minutes * 60 * 1000;
}

// =============================================================================
// MODEL -> GROUP RESOLUTION
// =============================================================================

/**
 * Maps a model string onto the internal QuotaGroupId.
 * Supports both antigravity-* models and native gemini-* models.
 * models.ts owns ALL model identification; this map is quota-group routing
 * derived from the models.ts catalog (v2.1.16 dedup note — values kept
 * byte-identical, no behavior change).
 */
const MODEL_TO_GROUP_EXACT: Record<string, QuotaGroupId> = {
  "antigravity-gemini-3-pro": "gemini-3-pro",
  "gemini-3-pro-preview": "gemini-3-pro",
  "antigravity-gemini-3.1-pro": "gemini-3.1-pro",
  "gemini-3.1-pro-preview": "gemini-3.1-pro",
  "gemini-3.1-pro-preview-customtools": "gemini-3.1-pro",
  "antigravity-gemini-3-flash": "gemini-3-flash",
  "gemini-3-flash-preview": "gemini-3-flash",
  "gemini-2.5-pro": "gemini-2.5-pro",
  "gemini-2.5-flash": "gemini-2.5-flash",
  "antigravity-claude-sonnet-4-6": "claude-sonnet",
  "antigravity-claude-opus-4-6-thinking": "claude-opus",

  // Generic API group aliases
  gemini: "gemini",
  claude: "claude-3p",
  gpt: "claude-3p",
  "3p": "claude-3p",
  "claude-3p": "claude-3p",
};

export function resolveQuotaGroup(model: string): QuotaGroupId {
  if (!model || typeof model !== "string") return "unknown";

  const lower = model.trim().toLowerCase();

  // Exact
  if (MODEL_TO_GROUP_EXACT[lower]) return MODEL_TO_GROUP_EXACT[lower];
  if (MODEL_TO_GROUP_EXACT[model]) return MODEL_TO_GROUP_EXACT[model];

  // Heuristics
  if (lower.includes("opus")) return "claude-opus";
  if (lower.includes("sonnet") || lower.includes("claude") || lower.includes("3p") || lower.includes("gpt")) {
    // distinguish opus (handled above)
    if (lower.includes("sonnet")) return "claude-sonnet";
    return "claude-3p";
  }
  if (lower.includes("3.1") && lower.includes("pro")) return "gemini-3.1-pro";
  if (lower.includes("3") && lower.includes("pro")) return "gemini-3-pro";
  if (lower.includes("2.5") && lower.includes("flash")) return "gemini-2.5-flash";
  if (lower.includes("2.5") && lower.includes("pro")) return "gemini-2.5-pro";
  if (lower.includes("flash")) return "gemini-3-flash";

  // API display names
  if (lower.includes("gemini models") || lower === "gemini") return "gemini";
  if (lower.includes("claude and gpt") || lower.includes("claude")) return "claude-3p";

  return "unknown";
}

/**
 * Returns the group definition for a model or groupId.
 * Returns null when the groupId is unknown.
 */
export function getQuotaGroup(input: string): ResilientQuotaGroupDef | null {
  if (!input) return null;
  const gid = resolveQuotaGroup(input);
  if (gid === "unknown") {
    // try matching by displayName pattern
    for (const def of QUOTA_GROUP_DEFS) {
      if (def.displayNamePattern.test(input)) return def;
    }
    return null;
  }
  // generic groupId -> return the closest equivalent def
  if (gid === "gemini") {
    return QUOTA_GROUP_DEFS.find((d) => d.id === "gemini-3-pro") ?? null;
  }
  if (gid === "claude-3p") {
    return QUOTA_GROUP_DEFS.find((d) => d.id === "claude-sonnet") ?? null;
  }
  return QUOTA_GROUP_DEFS.find((d) => d.id === gid) ?? null;
}

/**
 * Lists every available group definition.
 */
export function listQuotaGroups(): readonly ResilientQuotaGroupDef[] {
  return QUOTA_GROUP_DEFS;
}

// =============================================================================
// BUILD HEADERS - GEMINI CLI BYPASS
// =============================================================================

function buildDynamicUserAgent(source: QuotaSource): string {
  const platform = os.platform(); // darwin, linux, win32
  const arch = os.arch(); // x64, arm64

  // Keeps coherence with the local real platform, but allows env override
  const envUA = process.env.GEMINI_CLI_USER_AGENT ?? process.env.ANTIGRAVITY_USER_AGENT;
  if (envUA && envUA.length > 10) return envUA;

  if (source === "antigravity") {
    // Usa template antigravity para daily endpoint. Local variants of the
    // GEMINI_CLI_USER_AGENT_ANTIGRAVITY family: the per-platform templates
    // carry the models.js UA default model segment (v2.1.16 dedup).
    if (platform === "darwin" && arch === "arm64") {
      return `antigravity/1.12.8/${UA_DEFAULT_MODEL} (darwin; arm64; VSCode/1.90.0) google-api-nodejs-client/9.15.1`;
    }
    if (platform === "win32") {
      return `antigravity/1.12.8/${UA_DEFAULT_MODEL} (win32; x64; VSCode/1.90.0) google-api-nodejs-client/9.15.1`;
    }
    return GEMINI_CLI_USER_AGENT_ANTIGRAVITY;
  }

  // gemini-cli source: varia por plataforma real. v2.1.16 dedup: the
  // darwin/win32 templates derive from the constants.js GEMINI_CLI_USER_AGENT
  // owner by platform-segment substitution (byte-identical results).
  if (platform === "darwin" && arch === "arm64") {
    return GEMINI_CLI_USER_AGENT.replace("(linux; x64; GitHub)", "(darwin; arm64; GitHub)");
  }
  if (platform === "darwin") {
    return GEMINI_CLI_USER_AGENT.replace("(linux; x64; GitHub)", "(darwin; x64; GitHub)");
  }
  if (platform === "win32") {
    return GEMINI_CLI_USER_AGENT.replace("(linux; x64; GitHub)", "(win32; x64; GitHub)");
  }
  return GEMINI_CLI_USER_AGENT;
}

export function buildQuotaHeaders(token: string, source: QuotaSource = "antigravity"): Record<string, string> {
  const ua = buildDynamicUserAgent(source);
  const xGoog = process.env.X_GOOG_API_CLIENT ?? X_GOOG_API_CLIENT;
  const clientMeta = source === "antigravity" ? CLIENT_METADATA_ANTIGRAVITY : CLIENT_METADATA_STRING;

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "User-Agent": ua,
    "X-Goog-Api-Client": xGoog,
    "Client-Metadata": clientMeta,
    Accept: "application/json",
    "Accept-Encoding": "gzip, deflate, br",
  };
}

function getEndpointForSource(source: QuotaSource): string {
  return QUOTA_ENDPOINTS[source] ?? QUOTA_ENDPOINTS.antigravity;
}

// =============================================================================
// PARSE QUOTA RESPONSE - ROBUST
// =============================================================================

export function parseQuotaBucket(raw: QuotaBucketRaw, source: QuotaSource): QuotaBucketParsed {
  const bucketId = String(raw.bucketId ?? raw.displayName ?? "unknown").toLowerCase();
  const displayName = String(raw.displayName ?? raw.bucketId ?? "Unknown").trim() || "Unknown";
  const window = (raw.window ??
    (bucketId.includes("weekly") ? "weekly" : bucketId.includes("5h") ? "5h" : "unknown")) as QuotaWindow;
  const resetIso = raw.resetTime ?? null;
  const resetMs = parseIsoToMs(resetIso);

  let remainingFraction: number;
  if (typeof raw.remainingFraction === "number") {
    remainingFraction = clampFraction(raw.remainingFraction);
  } else if (typeof raw.remaining === "number" && typeof raw.limit === "number" && raw.limit > 0) {
    remainingFraction = clampFraction(raw.remaining / raw.limit);
  } else if (typeof raw.remaining === "number") {
    // Already a fraction?
    remainingFraction = raw.remaining > 1 ? clampFraction(raw.remaining / 100) : clampFraction(raw.remaining);
  } else if (typeof raw.used === "number" && typeof raw.limit === "number" && raw.limit > 0) {
    remainingFraction = clampFraction(1 - raw.used / raw.limit);
  } else {
    // Fallback: cloudcode-pa always returns 1.0 (known bug) -> treat as 1.0 but flag warning
    remainingFraction = 1.0;
  }

  const remainingPercent = Math.round(remainingFraction * 10000) / 100; // 2 decimais
  const isExhausted = remainingFraction <= 1 - QUOTA_HARD_THRESHOLD || remainingFraction <= 0.02;
  const isSoftExhausted = remainingFraction <= QUOTA_SOFT_REMAINING;

  return {
    bucketId,
    displayName,
    window,
    resetTime: resetIso,
    resetTimeMs: resetMs,
    remainingFraction,
    remainingPercent,
    isExhausted,
    isSoftExhausted,
    description: String(raw.description ?? "").trim(),
  };
}

export function parseQuotaGroup(raw: QuotaGroupRaw, source: QuotaSource): QuotaGroupParsed {
  const displayNameRaw = String(raw.displayName ?? raw.quotaGroup ?? "Unknown").trim();
  // Resolve id heuristically
  let id: QuotaGroupId = resolveQuotaGroup(displayNameRaw);

  // displayName containing "Gemini Models" => generic gemini
  if (/gemini models/i.test(displayNameRaw)) id = "gemini";
  if (/claude.*gpt|3p/i.test(displayNameRaw)) id = "claude-3p";

  const description = String(raw.description ?? "").trim();
  const bucketsRaw = Array.isArray(raw.buckets) ? raw.buckets : [];

  const buckets = bucketsRaw
    .map((b) => parseQuotaBucket(b, source))
    .sort((a, b) => {
      // Ordena: 5h primeiro, depois weekly
      if (a.window === "5h" && b.window !== "5h") return -1;
      if (b.window === "5h" && a.window !== "5h") return 1;
      return 0;
    });

  let weeklyRemaining: number | null = null;
  let fiveHourRemaining: number | null = null;
  let minRemaining = 1.0;
  let minBucket: QuotaBucketParsed | null = null;

  for (const bucket of buckets) {
    if (bucket.window === "weekly" || bucket.bucketId.includes("weekly")) {
      if (weeklyRemaining == null || bucket.remainingFraction < weeklyRemaining)
        weeklyRemaining = bucket.remainingFraction;
    }
    if (bucket.window === "5h" || bucket.bucketId.includes("5h")) {
      if (fiveHourRemaining == null || bucket.remainingFraction < fiveHourRemaining)
        fiveHourRemaining = bucket.remainingFraction;
    }
    if (bucket.remainingFraction < minRemaining) {
      minRemaining = bucket.remainingFraction;
      minBucket = bucket;
    }
  }

  if (buckets.length === 0) {
    minRemaining = 1.0;
  }

  const isExhausted = buckets.some((b) => b.isExhausted) || minRemaining <= 0.02;
  const isSoftExhausted = buckets.some((b) => b.isSoftExhausted) || minRemaining <= QUOTA_SOFT_REMAINING;

  return {
    id,
    displayName: displayNameRaw,
    description,
    rawDisplayName: displayNameRaw,
    source,
    buckets,
    weeklyRemaining,
    fiveHourRemaining,
    minRemainingFraction: minRemaining,
    minBucket,
    isExhausted,
    isSoftExhausted,
  };
}

/**
 * Parse principal do payload v1internal:retrieveUserQuotaSummary
 */
export function parseQuotaResponse(
  raw: QuotaSummaryRaw,
  opts?: { source?: QuotaSource; projectId?: string; fetchedAt?: number; baseTtlMs?: number },
): QuotaSummaryParsed {
  const source = opts?.source ?? "antigravity";
  const projectId = opts?.projectId ?? PROJECT_FALLBACK;
  const fetchedAt = opts?.fetchedAt ?? nowMs();
  const baseTtl = opts?.baseTtlMs ?? QUOTA_CACHE_TTL_MS_DEFAULT;

  // Normaliza grupos: pode vir em groups, quotaGroup, ou root buckets
  let rawGroups: QuotaGroupRaw[] = [];
  if (Array.isArray(raw.groups)) rawGroups = raw.groups;
  else if (Array.isArray((raw as any).quotaGroup)) rawGroups = (raw as any).quotaGroup;
  else if (Array.isArray(raw.buckets)) {
    // Wrap isolated buckets into one generic Gemini group
    rawGroups = [
      {
        displayName: "Gemini Models",
        description: "Fallback grouped from root buckets",
        buckets: raw.buckets,
      },
    ];
  }

  const groups = rawGroups
    .map((g) => parseQuotaGroup(g, source))
    .filter((g) => g.buckets.length > 0 || g.displayName !== "Unknown");

  // When the API returned empty (cloudcode-pa bug), build a healthy fallback group so requests are not blocked
  if (groups.length === 0) {
    // silent, but builds a structure that keeps allowed=true
    const fallbackGroup: QuotaGroupParsed = {
      id: "gemini",
      displayName: "Gemini Models",
      description: "Fallback empty response - assuming full quota (cloudcode-pa returns 1.0)",
      rawDisplayName: "Gemini Models",
      source,
      buckets: [
        {
          bucketId: "gemini-weekly",
          displayName: "Weekly Limit",
          window: "weekly",
          resetTime: null,
          resetTimeMs: null,
          remainingFraction: 1.0,
          remainingPercent: 100,
          isExhausted: false,
          isSoftExhausted: false,
          description: "Fallback - API returned empty",
        },
      ],
      weeklyRemaining: 1.0,
      fiveHourRemaining: 1.0,
      minRemainingFraction: 1.0,
      minBucket: null,
      isExhausted: false,
      isSoftExhausted: false,
    };
    // Point minBucket at the single bucket
    fallbackGroup.minBucket = fallbackGroup.buckets[0] ?? null;

    const ttl = computeAdaptiveTtlMs({ groups: [fallbackGroup] } as any, baseTtl);

    return {
      groups: [fallbackGroup],
      fetchedAt,
      expiresAt: fetchedAt + ttl,
      ttlMs: ttl,
      source,
      projectId,
      globalMinRemaining: 1.0,
      isAnyExhausted: false,
      isAnySoftExhausted: false,
    };
  }

  let globalMin = 1.0;
  let anyExhausted = false;
  let anySoft = false;

  for (const g of groups) {
    if (g.minRemainingFraction < globalMin) globalMin = g.minRemainingFraction;
    if (g.isExhausted) anyExhausted = true;
    if (g.isSoftExhausted) anySoft = true;
  }

  const ttl = computeAdaptiveTtlMs({ groups } as any, baseTtl);

  return {
    groups,
    fetchedAt,
    expiresAt: fetchedAt + ttl,
    ttlMs: ttl,
    source,
    projectId,
    globalMinRemaining: globalMin,
    isAnyExhausted: anyExhausted,
    isAnySoftExhausted: anySoft,
  };
}

// =============================================================================
// FETCH QUOTA - retrieveUserQuotaSummary
// =============================================================================

export interface RetrieveQuotaOptions {
  source?: QuotaSource; // default antigravity (daily endpoint = quota real)
  timeoutMs?: number;
  retries?: number;
  baseTtlMs?: number;
  signal?: AbortSignal;
}

export class QuotaFetchError extends Error {
  public status?: number | undefined;
  public body?: string | undefined;
  public source: QuotaSource;
  constructor(message: string, source: QuotaSource, status?: number, body?: string) {
    super(message);
    this.name = "QuotaFetchError";
    this.status = status;
    this.body = body;
    this.source = source;
  }
}

/**
 * Direct call to the v1internal:retrieveUserQuotaSummary endpoint.
 * POST {"project": "<projectId>"}
 *
 * @param token - OAuth Bearer access_token
 * @param projectId - cloudaicompanionProject id, fallback rising-fact-p41fc
 * @param opts - source antigravity|gemini-cli, timeout, retries
 */
export async function retrieveUserQuotaSummary(
  token: string,
  projectId: string = PROJECT_FALLBACK,
  opts?: RetrieveQuotaOptions,
): Promise<QuotaSummaryParsed> {
  if (!token || typeof token !== "string" || token.trim().length < 10) {
    throw new TypeError("retrieveUserQuotaSummary: invalid token");
  }

  const source = opts?.source ?? "antigravity";
  const timeoutMs = opts?.timeoutMs ?? QUOTA_REQUEST_TIMEOUT_MS;
  const retries = opts?.retries ?? 1;
  const baseTtlMs = opts?.baseTtlMs ?? QUOTA_CACHE_TTL_MS_DEFAULT;

  const endpoint = getEndpointForSource(source);
  const sanitizedProject = (projectId ?? PROJECT_FALLBACK).trim() || PROJECT_FALLBACK;

  const headers = buildQuotaHeaders(token, source);
  const body = JSON.stringify({ project: sanitizedProject });

  let lastError: unknown = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    // If the caller passed an external signal, propagate its abort
    let externalAbortListener: (() => void) | null = null;
    if (opts?.signal) {
      if (opts.signal.aborted) {
        clearTimeout(timer);
        throw new QuotaFetchError("AbortError: external signal aborted", source, 0);
      }
      externalAbortListener = () => controller.abort();
      opts.signal.addEventListener("abort", externalAbortListener, { once: true });
    }

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers,
        body,
        signal: controller.signal,
      } as RequestInit);

      clearTimeout(timer);
      if (externalAbortListener && opts?.signal) {
        opts.signal.removeEventListener("abort", externalAbortListener);
      }

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        // A 403 on cloudcode-pa is expected for retrieveUserQuotaSummary under local-only OAuth.
        // Try fallback? If antigravity fails, try gemini-cli? No - keep the error for the caller to decide.
        throw new QuotaFetchError(
          `Quota fetch failed ${res.status} ${res.statusText} on ${source}: ${text.slice(0, 500)}`,
          source,
          res.status,
          text,
        );
      }

      const json = (await res.json().catch(async () => {
        const txt = await res.text().catch(() => "");
        if (txt) {
          try {
            return JSON.parse(txt);
          } catch {
            // ignored
          }
        }
        return {} as QuotaSummaryRaw;
      })) as QuotaSummaryRaw;

      const parsed = parseQuotaResponse(json, {
        source,
        projectId: sanitizedProject,
        fetchedAt: nowMs(),
        baseTtlMs,
      });

      return parsed;
    } catch (err) {
      clearTimeout(timer);
      if (externalAbortListener && opts?.signal) {
        opts.signal.removeEventListener("abort", externalAbortListener);
      }

      lastError = err;

      // No retry on 401/403/400
      if (err instanceof QuotaFetchError) {
        if (err.status === 401 || err.status === 403 || err.status === 400) {
          throw err;
        }
      }

      // Timeout / network - retry while attempts remain
      if (attempt < retries) {
        const backoff = 200 * Math.pow(2, attempt) + Math.random() * 200;
        await new Promise((r) => setTimeout(r, backoff));
        continue;
      }

      // Attempts exhausted
      if (err instanceof QuotaFetchError) throw err;
      throw new QuotaFetchError(`Quota fetch network error on ${source}: ${(err as Error).message}`, source, 0);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new QuotaFetchError(`Unknown quota fetch error on ${source}`, source, 0);
}

/**
 * Dual fetch: tries antigravity (daily) first, then gemini-cli as fallback.
 * Returns the merged parsed summary with the primary source.
 */
export async function retrieveDualQuota(
  token: string,
  projectId: string = PROJECT_FALLBACK,
  opts?: RetrieveQuotaOptions,
): Promise<{
  antigravity: QuotaSummaryParsed | null;
  geminiCli: QuotaSummaryParsed | null;
  primary: QuotaSummaryParsed;
}> {
  // antigravity deve ser primary (quota real)
  let antigravity: QuotaSummaryParsed | null = null;
  let geminiCli: QuotaSummaryParsed | null = null;

  // tenta ambos em paralelo, mas antigravity tem prioridade
  const results = await Promise.allSettled([
    retrieveUserQuotaSummary(token, projectId, { ...opts, source: "antigravity" }),
    retrieveUserQuotaSummary(token, projectId, { ...opts, source: "gemini-cli" }),
  ]);

  if (results[0].status === "fulfilled") antigravity = results[0].value;
  if (results[1].status === "fulfilled") geminiCli = results[1].value;

  const primary = antigravity ?? geminiCli;

  if (!primary) {
    // both failed - rethrow the antigravity error when available
    const err0 = results[0].status === "rejected" ? results[0].reason : null;
    const err1 = results[1].status === "rejected" ? results[1].reason : null;
    throw err0 ?? err1 ?? new QuotaFetchError("Both quota sources failed", "antigravity", 0);
  }

  return { antigravity, geminiCli, primary };
}

// =============================================================================
// CACHE MANAGER - ADAPTIVE TTL + FILE PERSISTENCE
// =============================================================================

interface FileCachePayload {
  version: 1;
  entries: Record<string, QuotaCacheEntry>; // key = tokenHash+project+source
  savedAt: number;
}

function makeCacheKey(token: string, projectId: string, source: QuotaSource): string {
  const h = hashToken(token);
  const proj = projectId || PROJECT_FALLBACK;
  return `${h}:${proj}:${source}`;
}

function loadFileCacheSync(): Record<string, QuotaCacheEntry> {
  try {
    if (!fs.existsSync(QUOTA_CACHE_FILE)) return {};
    const raw = fs.readFileSync(QUOTA_CACHE_FILE, "utf8");
    const parsed = JSON.parse(raw) as FileCachePayload;
    if (parsed.version !== 1 || !parsed.entries) return {};
    // Drop entries expired long ago (> 24h)
    const now = nowMs();
    const out: Record<string, QuotaCacheEntry> = {};
    for (const [k, v] of Object.entries(parsed.entries)) {
      if (v.expiresAt && v.expiresAt > now - 24 * 60 * 60 * 1000) {
        out[k] = v;
      }
    }
    return out;
  } catch {
    return {};
  }
}

function saveFileCacheSync(entries: Record<string, QuotaCacheEntry>): void {
  try {
    const dir = path.dirname(QUOTA_CACHE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
    const payload: FileCachePayload = {
      version: 1,
      entries,
      savedAt: nowMs(),
    };
    const tmp = QUOTA_CACHE_FILE + ".tmp." + crypto.randomBytes(4).toString("hex");
    fs.writeFileSync(tmp, JSON.stringify(payload, null, 2), { encoding: "utf8", mode: 0o600 });
    try {
      fs.chmodSync(tmp, 0o600);
    } catch {}
    fs.renameSync(tmp, QUOTA_CACHE_FILE);
  } catch {
    // silence cache errors
  }
}

let _memoryFileCache: Record<string, QuotaCacheEntry> | null = null;
let _inflightFetches: Map<string, Promise<QuotaSummaryParsed>> = new Map();

function getFileCache(): Record<string, QuotaCacheEntry> {
  if (_memoryFileCache) return _memoryFileCache;
  _memoryFileCache = loadFileCacheSync();
  return _memoryFileCache;
}

export class QuotaCacheManager {
  private memory: Map<string, QuotaCacheEntry> = new Map();
  private requestCount: number = 0;
  private lastRefreshAt: number = 0;
  private refreshIntervalMs: number;
  public softThreshold: number; // remaining threshold

  constructor(opts?: { refreshIntervalMinutes?: number; softThreshold?: number }) {
    this.refreshIntervalMs = getQuotaRefreshIntervalMs(opts?.refreshIntervalMinutes);
    this.softThreshold = opts?.softThreshold ?? QUOTA_SOFT_REMAINING; // 0.1 remaining = 90% usado
    // preload file cache into memory
    const file = getFileCache();
    for (const [k, v] of Object.entries(file)) {
      this.memory.set(k, v);
    }
  }

  private getKey(token: string, projectId: string, source: QuotaSource): string {
    return makeCacheKey(token, projectId, source);
  }

  getCached(token: string, projectId: string, source: QuotaSource = "antigravity"): QuotaSummaryParsed | null {
    const key = this.getKey(token, projectId, source);
    const entry = this.memory.get(key);
    if (!entry) return null;

    if (nowMs() > entry.expiresAt) {
      // expired, but still serve stale within a grace window (50% ttl)
      const grace = entry.ttlMs * 0.5;
      if (nowMs() > entry.expiresAt + grace) {
        this.memory.delete(key);
        return null;
      }
      // stale-while-revalidate
      return entry.summary;
    }

    return entry.summary;
  }

  isCacheExpired(token: string, projectId: string, source: QuotaSource = "antigravity"): boolean {
    const key = this.getKey(token, projectId, source);
    const entry = this.memory.get(key);
    if (!entry) return true;
    return nowMs() > entry.expiresAt;
  }

  setCached(
    token: string,
    projectId: string,
    source: QuotaSource,
    raw: QuotaSummaryRaw,
    parsed: QuotaSummaryParsed,
  ): void {
    const key = this.getKey(token, projectId, source);
    const ttl = parsed.ttlMs ?? computeAdaptiveTtlMs(parsed, QUOTA_CACHE_TTL_MS_DEFAULT);

    const entry: QuotaCacheEntry = {
      summary: { ...parsed, ttlMs: ttl, expiresAt: nowMs() + ttl },
      raw,
      tokenHash: hashToken(token),
      cachedAt: nowMs(),
      expiresAt: nowMs() + ttl,
      ttlMs: ttl,
    };

    this.memory.set(key, entry);

    // persist
    const fileCache = getFileCache();
    fileCache[key] = entry;
    // cap size (max 50 entries)
    const keys = Object.keys(fileCache);
    if (keys.length > 50) {
      // drop oldest
      const sorted = keys.sort((a, b) => (fileCache[a]?.cachedAt ?? 0) - (fileCache[b]?.cachedAt ?? 0));
      for (let i = 0; i < sorted.length - 50; i++) delete fileCache[sorted[i]!];
    }
    saveFileCacheSync(fileCache);
    _memoryFileCache = fileCache;
  }

  /**
   * Clears the cache for a token/project or everything.
   */
  clear(token?: string, projectId?: string, source?: QuotaSource): void {
    if (!token) {
      this.memory.clear();
      try {
        fs.unlinkSync(QUOTA_CACHE_FILE);
      } catch {}
      _memoryFileCache = {};
      return;
    }
    const targetProject = projectId ?? PROJECT_FALLBACK;
    if (source) {
      const key = this.getKey(token, targetProject, source);
      this.memory.delete(key);
      const fc = getFileCache();
      delete fc[key];
      saveFileCacheSync(fc);
    } else {
      // clear both sources
      for (const src of ["antigravity", "gemini-cli"] as QuotaSource[]) {
        const key = this.getKey(token, targetProject, src);
        this.memory.delete(key);
        const fc = getFileCache();
        delete fc[key];
        saveFileCacheSync(fc);
      }
    }
  }

  /**
   * Background refresh without blocking the caller.
   * Deduplicates in-flight requests per key.
   */
  refreshInBackground(token: string, projectId: string, source: QuotaSource = "antigravity"): void {
    const key = this.getKey(token, projectId, source);

    if (_inflightFetches.has(key)) return; // already in progress

    const p = retrieveUserQuotaSummary(token, projectId, { source })
      .then((parsed) => {
        // empty raw fallback because background has no original raw
        this.setCached(token, projectId, source, { groups: [] }, parsed);
        this.lastRefreshAt = nowMs();
        return parsed;
      })
      .catch(() => {
        // silencia erro background
        return null as any;
      })
      .finally(() => {
        _inflightFetches.delete(key);
      });

    _inflightFetches.set(key, p);

    // Non-blocking: fire-and-forget, but avoids unhandled rejections
    p.catch(() => {});
  }

  /**
   * Called after each successful request to decide whether to schedule a refresh.
   */
  trackRequestAndMaybeRefresh(token: string, projectId: string, source: QuotaSource = "antigravity"): void {
    this.requestCount++;
    const now = nowMs();
    const sinceLast = now - this.lastRefreshAt;

    // Refresh interval elapsed -> schedule background refresh
    if (sinceLast > this.refreshIntervalMs) {
      this.refreshInBackground(token, projectId, source);
      return;
    }

    // Heuristic: low remaining requires more frequent refreshes
    const cached = this.getCached(token, projectId, source);
    if (cached && cached.globalMinRemaining < 0.3) {
      // Remaining <30% and 2min elapsed -> refresh
      if (sinceLast > QUOTA_CACHE_TTL_MIN_MS) {
        this.refreshInBackground(token, projectId, source);
      }
    }
  }

  getStats(): { size: number; requestCount: number; lastRefreshAt: number; refreshIntervalMs: number } {
    return {
      size: this.memory.size,
      requestCount: this.requestCount,
      lastRefreshAt: this.lastRefreshAt,
      refreshIntervalMs: this.refreshIntervalMs,
    };
  }
}

// Singleton default
let _defaultCacheManager: QuotaCacheManager | null = null;

export function getQuotaCacheManager(opts?: { refreshIntervalMinutes?: number | undefined }): QuotaCacheManager {
  if (!_defaultCacheManager) {
    _defaultCacheManager = new QuotaCacheManager({
      refreshIntervalMinutes: opts?.refreshIntervalMinutes ?? getQuotaRefreshIntervalMs() / 60000,
    });
  }
  return _defaultCacheManager;
}

// =============================================================================
// CORE QUOTA CHECK APIs
// =============================================================================

/**
 * Checks quota for a specific group.
 * Returns an allowed boolean plus metadata.
 *
 * @param token - access token
 * @param projectId - project id
 * @param group - group id ou model string (ex: "gemini-3-pro" ou "antigravity-gemini-3-pro")
 * @param opts - source, softThreshold override, useCache
 */
export async function checkQuota(
  token: string,
  projectId: string = PROJECT_FALLBACK,
  group?: string | null,
  opts?: {
    source?: QuotaSource;
    softThreshold?: number; // remaining threshold (default 0.1)
    useCache?: boolean;
    refreshIntervalMinutes?: number | undefined;
  },
): Promise<CheckQuotaResult> {
  const source = opts?.source ?? "antigravity";
  const softRemaining = opts?.softThreshold ?? QUOTA_SOFT_REMAINING;
  const useCache = opts?.useCache ?? true;

  const cacheMgr = getQuotaCacheManager({ refreshIntervalMinutes: opts?.refreshIntervalMinutes });

  let summary: QuotaSummaryParsed | null = null;

  if (useCache) {
    summary = cacheMgr.getCached(token, projectId, source);
  }

  if (!summary) {
    try {
      summary = await retrieveUserQuotaSummary(token, projectId, { source });
      cacheMgr.setCached(token, projectId, source, { groups: [] }, summary);
    } catch (e) {
      // Se falha fetch mas tem cache expirado stale, usa stale como fallback permissivo
      const staleKey = makeCacheKey(token, projectId, source);
      const staleEntry = (getFileCache()[staleKey] ?? null) as QuotaCacheEntry | null;
      if (staleEntry?.summary) {
        summary = staleEntry.summary;
      } else {
        throw e;
      }
    }
  } else {
    // Expired cache -> trigger a non-blocking background refresh
    if (cacheMgr.isCacheExpired(token, projectId, source)) {
      cacheMgr.refreshInBackground(token, projectId, source);
    }
    // track request for a potential refresh
    cacheMgr.trackRequestAndMaybeRefresh(token, projectId, source);
  }

  if (!summary) {
    // fallback final: allow
    return {
      allowed: true,
      groupId: null,
      bucketId: null,
      remainingFraction: 1,
      remainingPercent: 100,
      resetTime: null,
      resetTimeMs: null,
      reason: "no quota data, assuming allowed",
      isSoftThreshold: false,
      isHardExhausted: false,
      shouldSkipAccount: false,
      source,
    };
  }

  // Resolve target group
  let targetGroups: QuotaGroupParsed[] = summary.groups;

  if (group) {
    const gid = resolveQuotaGroup(group);
    if (gid !== "unknown") {
      // With a specific group, filter by exact id or generic mapping
      if (gid === "gemini") {
        // generic gemini => pick the Gemini Models group when present, else every gemini-*
        const geminiModelsGroup = summary.groups.find((g) => g.id === "gemini" || /gemini models/i.test(g.displayName));
        if (geminiModelsGroup) targetGroups = [geminiModelsGroup];
        else targetGroups = summary.groups.filter((g) => g.id.startsWith("gemini"));
      } else if (gid === "claude-3p") {
        const claudeGroup = summary.groups.find((g) => g.id === "claude-3p" || /claude.*gpt|3p/i.test(g.displayName));
        if (claudeGroup) targetGroups = [claudeGroup];
        else targetGroups = summary.groups.filter((g) => g.id.startsWith("claude"));
      } else {
        // try exact match
        const exact = summary.groups.filter((g) => g.id === gid);
        if (exact.length > 0) targetGroups = exact;
        else {
          // Without an exact API mapping (the API returns generic groups), use the global minRemaining but keep gid in the result
          // target stays as all groups since the API does not split sub-models
          targetGroups = summary.groups;
        }
      }
    } else {
      // unknown group -> use all groups
      targetGroups = summary.groups;
    }
  }

  // Worst case across the target groups
  let minRemaining = 1.0;
  let minBucket: QuotaBucketParsed | null = null;
  let minGroup: QuotaGroupParsed | null = null;

  for (const g of targetGroups) {
    if (g.minRemainingFraction < minRemaining) {
      minRemaining = g.minRemainingFraction;
      minBucket = g.minBucket ?? g.buckets[0] ?? null;
      minGroup = g;
    }
  }

  if (targetGroups.length === 0) {
    // No target groups - fall back to allow
    return {
      allowed: true,
      groupId: group ? resolveQuotaGroup(group) : null,
      bucketId: null,
      remainingFraction: 1,
      remainingPercent: 100,
      resetTime: null,
      resetTimeMs: null,
      reason: "no matching groups, assuming allowed",
      isSoftThreshold: false,
      isHardExhausted: false,
      shouldSkipAccount: false,
      source,
    };
  }

  const isHardExhausted = minRemaining <= 0.02 || minRemaining <= 1 - QUOTA_HARD_THRESHOLD;
  const isSoftThreshold = minRemaining <= softRemaining;

  const shouldSkip = isHardExhausted || (isSoftThreshold && minRemaining <= softRemaining);

  // allowed=false only on hard exhaustion; soft allows but flags shouldSkip for the load balancer
  const allowed = !isHardExhausted;

  const gidResult = group ? resolveQuotaGroup(group) : (minGroup?.id ?? null);

  return {
    allowed,
    groupId: gidResult,
    bucketId: minBucket?.bucketId ?? null,
    remainingFraction: minRemaining,
    remainingPercent: Math.round(minRemaining * 10000) / 100,
    resetTime: minBucket?.resetTime ?? null,
    resetTimeMs: minBucket?.resetTimeMs ?? null,
    reason: isHardExhausted
      ? `quota exhausted (${(minRemaining * 100).toFixed(2)}% remaining, bucket ${minBucket?.bucketId})`
      : isSoftThreshold
        ? `soft threshold breached (90% used, ${Math.round(minRemaining * 100)}% remaining)`
        : `quota ok (${Math.round(minRemaining * 100)}% remaining)`,
    isSoftThreshold,
    isHardExhausted,
    shouldSkipAccount: shouldSkip,
    source,
    group: minGroup ?? undefined,
    bucket: minBucket ?? undefined,
  };
}

/**
 * Reports whether quota is exhausted (hard threshold).
 * Thin wrapper over checkQuota kept for compatibility.
 */
export async function isQuotaExhausted(
  token: string,
  projectId: string = PROJECT_FALLBACK,
  group?: string | null,
  opts?: { source?: QuotaSource; useCache?: boolean },
): Promise<boolean> {
  const result = await checkQuota(token, projectId, group, opts);
  return result.isHardExhausted;
}

/**
 * Decides whether the account should be skipped (soft 90% threshold).
 * Used during multi-account rotation.
 */
export async function shouldSkipAccount(
  token: string,
  projectId: string = PROJECT_FALLBACK,
  group?: string | null,
  opts?: { source?: QuotaSource; softThreshold?: number; useCache?: boolean },
): Promise<boolean> {
  const result = await checkQuota(token, projectId, group, opts);
  return result.shouldSkipAccount;
}

/**
 * Lists the current parsed groups (cache first, otherwise fetch).
 */
export async function getQuotaGroups(
  token: string,
  projectId: string = PROJECT_FALLBACK,
  opts?: { source?: QuotaSource; useCache?: boolean },
): Promise<QuotaGroupParsed[]> {
  const source = opts?.source ?? "antigravity";
  const useCache = opts?.useCache ?? true;

  const cacheMgr = getQuotaCacheManager();

  if (useCache) {
    const cached = cacheMgr.getCached(token, projectId, source);
    if (cached) return cached.groups;
  }

  const summary = await retrieveUserQuotaSummary(token, projectId, { source });
  cacheMgr.setCached(token, projectId, source, { groups: [] }, summary);
  return summary.groups;
}

// =============================================================================
// QUOTA MANAGER CLASS - DUAL QUOTA + BACKGROUND REFRESH
// =============================================================================

export interface QuotaManagerOptions {
  refreshIntervalMinutes?: number;
  softThreshold?: number; // remaining fraction (default 0.1)
  hardThreshold?: number; // remaining fraction (default 0.02)
  projectId?: string;
  source?: QuotaSource; // default antigravity
  enableDual?: boolean; // se true, busca ambos antigravity+gemini-cli e mescla
}

export class QuotaManager {
  public readonly projectId: string;
  public readonly source: QuotaSource;
  public readonly refreshIntervalMinutes: number;
  public readonly softThreshold: number; // remaining
  public readonly hardThreshold: number;
  public readonly enableDual: boolean;

  private cacheMgr: QuotaCacheManager;
  private token: string | null = null;
  private lastGroups: QuotaGroupParsed[] = [];

  constructor(opts?: QuotaManagerOptions) {
    this.projectId = opts?.projectId ?? PROJECT_FALLBACK;
    this.source = opts?.source ?? "antigravity";
    this.refreshIntervalMinutes = opts?.refreshIntervalMinutes ?? QUOTA_REFRESH_INTERVAL_MINUTES_DEFAULT;
    this.softThreshold = opts?.softThreshold ?? QUOTA_SOFT_REMAINING;
    this.hardThreshold = opts?.hardThreshold ?? 0.02;
    this.enableDual = opts?.enableDual ?? true;

    this.cacheMgr = getQuotaCacheManager({ refreshIntervalMinutes: this.refreshIntervalMinutes });
  }

  setToken(token: string): void {
    if (!token || token.length < 10) throw new TypeError("QuotaManager.setToken: invalid token");
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  /**
   * Forces an immediate refresh (primary + secondary when dual).
   */
  async refresh(token?: string, projectId?: string): Promise<QuotaSummaryParsed> {
    const t = token ?? this.token;
    if (!t) throw new Error("QuotaManager.refresh: token not set. Call setToken() or pass a token.");

    const pid = projectId ?? this.projectId;

    if (this.enableDual) {
      const dual = await retrieveDualQuota(t, pid, {
        source: this.source,
        baseTtlMs: getQuotaRefreshIntervalMs(this.refreshIntervalMinutes),
      });
      // Cache both sources when available
      if (dual.antigravity) {
        this.cacheMgr.setCached(t, pid, "antigravity", { groups: [] }, dual.antigravity);
      }
      if (dual.geminiCli) {
        this.cacheMgr.setCached(t, pid, "gemini-cli", { groups: [] }, dual.geminiCli);
      }
      this.lastGroups = dual.primary.groups;
      return dual.primary;
    } else {
      const summary = await retrieveUserQuotaSummary(t, pid, {
        source: this.source,
        baseTtlMs: getQuotaRefreshIntervalMs(this.refreshIntervalMinutes),
      });
      this.cacheMgr.setCached(t, pid, this.source, { groups: [] }, summary);
      this.lastGroups = summary.groups;
      return summary;
    }
  }

  /**
   * Non-blocking background refresh.
   */
  refreshInBackground(token?: string, projectId?: string, source?: QuotaSource): void {
    const t = token ?? this.token;
    if (!t) return;
    const pid = projectId ?? this.projectId;
    const src = source ?? this.source;
    this.cacheMgr.refreshInBackground(t, pid, src);

    if (this.enableDual) {
      const other: QuotaSource = src === "antigravity" ? "gemini-cli" : "antigravity";
      this.cacheMgr.refreshInBackground(t, pid, other);
    }
  }

  /**
   * Called after each successful generateContent request.
   */
  notifyRequestSuccess(token?: string, projectId?: string): void {
    const t = token ?? this.token;
    if (!t) return;
    this.cacheMgr.trackRequestAndMaybeRefresh(t, projectId ?? this.projectId, this.source);
  }

  async checkQuota(group?: string | null, token?: string): Promise<CheckQuotaResult> {
    const t = token ?? this.token;
    if (!t) throw new Error("QuotaManager.checkQuota: token not set");

    return checkQuota(t, this.projectId, group, {
      source: this.source,
      softThreshold: this.softThreshold,
      refreshIntervalMinutes: this.refreshIntervalMinutes,
    });
  }

  async isQuotaExhausted(group?: string | null, token?: string): Promise<boolean> {
    const t = token ?? this.token;
    if (!t) throw new Error("QuotaManager.isQuotaExhausted: token not set");
    return isQuotaExhausted(t, this.projectId, group, { source: this.source });
  }

  async shouldSkipAccount(group?: string | null, token?: string): Promise<boolean> {
    const t = token ?? this.token;
    if (!t) throw new Error("QuotaManager.shouldSkipAccount: token not set");
    return shouldSkipAccount(t, this.projectId, group, {
      source: this.source,
      softThreshold: this.softThreshold,
    });
  }

  async getQuotaGroups(token?: string): Promise<QuotaGroupParsed[]> {
    const t = token ?? this.token;
    if (!t) throw new Error("QuotaManager.getQuotaGroups: token not set");
    return getQuotaGroups(t, this.projectId, { source: this.source });
  }

  resolveQuotaGroup(model: string): QuotaGroupId {
    return resolveQuotaGroup(model);
  }

  getQuotaGroup(input: string): ResilientQuotaGroupDef | null {
    return getQuotaGroup(input);
  }

  getCacheStats() {
    return this.cacheMgr.getStats();
  }

  clearCache(token?: string, source?: QuotaSource): void {
    if (token) {
      this.cacheMgr.clear(token, this.projectId, source);
    } else if (this.token) {
      this.cacheMgr.clear(this.token, this.projectId, source);
    } else {
      this.cacheMgr.clear();
    }
  }
}

// =============================================================================
// SINGLETON HELPERS + COMPATIBILITY EXPORTS
// =============================================================================

let _defaultQuotaManager: QuotaManager | null = null;

export function getDefaultQuotaManager(opts?: QuotaManagerOptions): QuotaManager {
  if (!_defaultQuotaManager) {
    _defaultQuotaManager = new QuotaManager(opts);
  }
  return _defaultQuotaManager;
}

/**
 * Helper for the opencode plugin: verifies quota before routing a request.
 * Returns true when the request may proceed.
 */
export async function canProceedWithRequest(
  token: string,
  model: string,
  projectId: string = PROJECT_FALLBACK,
  opts?: { source?: QuotaSource | undefined; refreshIntervalMinutes?: number | undefined },
): Promise<{ allowed: boolean; check: CheckQuotaResult }> {
  const group = resolveQuotaGroup(model);
  const check = await checkQuota(token, projectId, group, {
    source: opts?.source ?? "antigravity",
    refreshIntervalMinutes: opts?.refreshIntervalMinutes,
  });
  return { allowed: check.allowed, check };
}

// =============================================================================
// CONFIG RESOLUTION - quota_refresh_interval_minutes
// =============================================================================

export interface QuotaConfig {
  quota_refresh_interval_minutes: number;
  quota_soft_threshold_percent: number; // 90 default
  quota_hard_threshold_percent: number; // 98 default
  quota_source: QuotaSource;
  quota_dual_enabled: boolean;
  quota_cache_ttl_ms_default: number;
  project_fallback: string;
}

export const DEFAULT_QUOTA_CONFIG: QuotaConfig = {
  quota_refresh_interval_minutes: QUOTA_REFRESH_INTERVAL_MINUTES_DEFAULT,
  quota_soft_threshold_percent: 90,
  quota_hard_threshold_percent: 98,
  quota_source: "antigravity",
  quota_dual_enabled: true,
  quota_cache_ttl_ms_default: QUOTA_CACHE_TTL_MS_DEFAULT,
  project_fallback: PROJECT_FALLBACK,
};

export function resolveQuotaConfig(partial?: Partial<QuotaConfig>): QuotaConfig {
  const envMinutes = process.env.QUOTA_REFRESH_INTERVAL_MINUTES ?? process.env.ANTIGRAVITY_QUOTA_REFRESH_MINUTES;
  let minutes = partial?.quota_refresh_interval_minutes ?? DEFAULT_QUOTA_CONFIG.quota_refresh_interval_minutes;
  if (envMinutes) {
    const p = Number.parseInt(envMinutes, 10);
    if (!Number.isNaN(p) && p > 0) minutes = p;
  }

  return {
    quota_refresh_interval_minutes: Math.max(1, Math.min(minutes, 120)),
    quota_soft_threshold_percent:
      partial?.quota_soft_threshold_percent ?? DEFAULT_QUOTA_CONFIG.quota_soft_threshold_percent,
    quota_hard_threshold_percent:
      partial?.quota_hard_threshold_percent ?? DEFAULT_QUOTA_CONFIG.quota_hard_threshold_percent,
    quota_source: partial?.quota_source ?? DEFAULT_QUOTA_CONFIG.quota_source,
    quota_dual_enabled: partial?.quota_dual_enabled ?? DEFAULT_QUOTA_CONFIG.quota_dual_enabled,
    quota_cache_ttl_ms_default: partial?.quota_cache_ttl_ms_default ?? DEFAULT_QUOTA_CONFIG.quota_cache_ttl_ms_default,
    project_fallback: partial?.project_fallback ?? DEFAULT_QUOTA_CONFIG.project_fallback,
  };
}

// =============================================================================
// PROVENANCE NOTES - BLINDED CONSTANTS (lineage-B history; the values
// themselves are owned by constants.ts / auth.ts / models.ts and re-exported
// at the top of this module)
// =============================================================================

/**
 * Three public OAuth client IDs circulate in public binaries:
 * - 1071006060591-tmhssin2h21lcre235vtolojh4g403ep... (Antigravity primary, accounts.ts)
 * - 681255809395-oo8ft2oq6bda7b6t5a2prl1saaq1hhs... (Gemini CLI secondary)
 * - 681255809395-oo8f…b135j... (Gemini CLI official)
 * These are public client IDs (not confidential). The client secrets below are
 * likewise public in those binaries but flagged as blinded for log redaction.
 */
// v2.1.15 Phase C: the REAL env-overridable antigravity-cli client pair is
// owned by auth.js (CLIENT_ID/CLIENT_SECRET — same env chain incl. the
// GOOGLE_CLIENT_ID fallback). constants.js keeps only the blinded decoy.

// v2.1.15 Phase C: ANTIGRAVITY_CLIENT_ID_FALLBACK_SECONDARY moved to constants.js.

// v2.1.15 Phase C: the local env-overridable gemini-cli pair (with the
// stale typo'd secret tail Cu5cWa_kRl) was deleted in favor of the
// constants.js GEMINI_CLI_OAUTH_CLIENT_ID/SECRET owner (live-validated
// secret tail Cu5clXFsxl).

// ANTIGRAVITY_CLIENT_ID_IS_BLINDED / ANTIGRAVITY_CLIENT_SECRET_IS_BLINDED:
// identical `true` flags — imported and re-exported above.

/** Version fallback (governance keeps 1.19.2 as last known to bypass ban) + floor. */
// ANTIGRAVITY_VERSION_FALLBACK / ANTIGRAVITY_USER_AGENT_FALLBACK: identical
// values — imported and re-exported above (from constants.ts).
// ANTIGRAVITY_VERSION_MIN: identical "1.15.8" — imported and re-exported above (from models.ts).

// =============================================================================
// v2.1.16 dead-code cleanup: the unused resilient lineage-B quota engine
// (zero consumers) was deleted — resolveQuotaPoolGroup + its aliases
// (resolveGroup, getQuotaGroupForModel, modelToGroup),
// parseQuotaResponseResilient, retrieveUserQuotaSummaryResilient,
// checkQuotaFromSummary, isQuotaExhaustedBySummary, shouldSkipAccountBySummary,
// getAdaptiveTtlMs, resolveBaseTtlFromConfig, parseRateLimitHeaders +
// RateLimitInfo, QuotaManagerResilient + getQuotaManager /
// resetQuotaManager / fetchQuotaWithCache / refreshQuotaBackground,
// resolveCachePath, QUOTA_INFO, the Quota facade, the resilient types
// (QuotaPoolStats, QuotaSummary, CheckQuotaResultResilient,
// QuotaFileCacheEntry, FileCacheData, QuotaManagerResilientOptions,
// RetrieveQuotaOptionsResilient) and the private helpers used only by that
// engine (normalizePlatform, normalizeArch, RESILIENT_CASCADE_HOSTS,
// RESILIENT_QUOTA_CACHE_TTL_MIN/MAX_MS, FILE_MODE, DIR_MODE,
// CACHE_FILE_NAME, ensureDir, ensureDirSync, atomicWriteFileAtomic,
// atomicWriteFileSync, buildCacheKey, MODEL_GROUP_MAP, normalizeGroupName,
// tryParseNumber, parseDateToMs, tryParseBool, extractPoolStats). Every symbol
// was grep-verified to have zero consumers outside quota.ts before deletion.
// The live lineage-A engine above is untouched.
// =============================================================================

/**
 * Cloud Code Assist quota method path — the historical QUOTA_METHOD name
 * consumed by plugin.ts. v2.1.16 dedup: derived from the constants.js
 * QUOTA_ENDPOINT owner (itself derived from CODE_ASSIST_PATH_MAP
 * .RETRIEVE_USER_QUOTA_SUMMARY) instead of a duplicated path literal.
 */
export const QUOTA_METHOD = QUOTA_ENDPOINT;

/**
 * SHA-256 token hash truncated to 32 hex chars (FNV-1a fallback) — the cache
 * key primitive of the live lineage-A file cache (makeCacheKey / setCached).
 */
export function hashToken(token: string): string {
  try {
    return createHash("sha256").update(token).digest("hex").slice(0, 32);
  } catch {
    return String(fnv1a32(token)).padStart(8, "0");
  }
}

// =============================================================================
// EXPORT DEFAULT
// =============================================================================

const quotaModule = {
  // canonical constants
  OAUTH_CLIENT_ID: GEMINI_CLI_OAUTH_CLIENT_ID,
  OAUTH_CLIENT_SECRET: GEMINI_CLI_OAUTH_CLIENT_SECRET,
  PROJECT_FALLBACK,
  ENDPOINTS: API_PATHS,
  ENDPOINTS_DAILY: API_PATHS_DAILY,
  QUOTA_ENDPOINTS,
  QUOTA_METHOD,
  MODELS_2026: MODELS_2026_LEGACY,
  QUOTA_GROUP_DEFS,
  QUOTA_REFRESH_INTERVAL_MINUTES_DEFAULT,
  QUOTA_SOFT_THRESHOLD,
  QUOTA_HARD_THRESHOLD,

  // core functions
  retrieveUserQuotaSummary,
  retrieveDualQuota,
  parseQuotaResponse,
  parseQuotaBucket,
  parseQuotaGroup,
  computeAdaptiveTtlMs,
  getQuotaRefreshIntervalMs,

  // resolution
  resolveQuotaGroup,
  getQuotaGroup,
  listQuotaGroups,
  isGeminiCLIOnlyModel,

  // checks
  checkQuota,
  isQuotaExhausted,
  shouldSkipAccount,
  getQuotaGroups,
  canProceedWithRequest,

  // cache + managers
  QuotaCacheManager,
  getQuotaCacheManager,
  QuotaManager,
  getDefaultQuotaManager,

  // config
  DEFAULT_QUOTA_CONFIG,
  resolveQuotaConfig,

  // headers
  buildQuotaHeaders,

  // extras
  hashToken,
};

export default quotaModule;
