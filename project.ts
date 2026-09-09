/**
 * @fileoverview project.ts - Cloud Code Assist Project ID discovery (merged v2.1.0 + v1 uniques)
 * @module auth/project
 * @description
 *  Merged module. Merge base is project(2).ts (v2.1.0, "bypass total" style Gemini CLI).
 *  The v1 lineage (project.ts / project(1).ts) contributed constants and
 *  utility ports; its parallel V1-suffixed flow was dead and is gone (see the
 *  v2.1.16 note below).
 *
 *  v2.1.0 base (kept canonical):
 *  - loadCodeAssist(opts) / onboardUser(opts) / fetchAvailableModels(opts) / resolveProjectId(opts)
 *  - IdeType ("ANTIGRAVITY" / "IDE_UNSPECIFIED"), defaultMetadata(ideType?)
 *  - MODELS_2026_BASE / MODELS_2026 / MODELS_2026_ANTIGRAVITY / MODELS_2026_ALL split
 *  - buildDefaultUserAgent(version?), buildAntagravityHeaders, ProjectDiscoveryError
 *  - SHA-256 token-hash cache (getCachedProjectId/setCachedProjectId/getCacheStats)
 *
 *  Ported v1 uniques (still live):
 *  - OAUTH_CLIENT_ID / OAUTH_CLIENT_SECRET / GEMINI_CLI_USER_AGENT / GOOGLE_API_NODE_VERSION
 *  - X_GOOG_API_CLIENT / CLIENT_METADATA_STRING / CLIENT_METADATA
 *  - ENDPOINT_BASES (incl. staging) / EndpointName / EndpointDef / CODE_ASSIST_PATHS
 *  - Account / FetchModelsResponse / ResolvedProject types
 *  - isLikelyExpiredToken(), getPlatformInfo()
 *
 *  v2.1.16 dead-code cleanup: the dead v1 legacy flow (loadCodeAssistV1,
 *  onboardUserV1, fetchAvailableModelsV1, resolveProjectIdV1, the legacy
 *  projectCache cluster and buildGeminiHeaders) had zero consumers and was
 *  deleted; the v2 flow above is the single project-discovery surface.
 *
 *  Architecture: library-first, root-first, direct cloudcode-pa (no localhost proxy),
 *  only node:* builtins + global fetch (Node >= 18). Timeouts 10s per call,
 *  retry on 403/404/408/429/5xx. In-memory caches keyed by truncated token hashes.
 *
 *  v2.1.15 Phase A: this module is THE single owner of project discovery.
 *  The project-resolution block that used to live in models.ts
 *  (ProjectDiscoveryError 4-arg form, resolveProjectIdAsGeminiCliBypass +
 *  its option/result types, fetchAvailableModelsDirect) was absorbed here;
 *  every model-identification family it consumed is imported from models.ts.
 *  Canonical-value decisions for the shared near-copy symbols:
 *  - ProjectDiscoveryError: merged 4-arg constructor — the optional fourth
 *    argument overrides the status-derived default, so both lineages keep
 *    their exact historical retryable semantics.
 *  - loadCodeAssist / onboardUser / resolveProjectId / caches: the project.ts
 *    v2.1.0-lineage implementations stay canonical (most complete supersets —
 *    ideType plumbing with the ANTIGRAVITY→GEMINI retry, tier-id guard, LRO
 *    pollOperation, richer extractors); the former models.ts variants (fixed
 *    IDE_UNSPECIFIED metadata + jitter, no retry) had zero external consumers
 *    and were not carried — documented in the Phase A worklog.
 *  - resolveProjectIdAsGeminiCliBypass / fetchAvailableModelsDirect: absorbed
 *    from the models.ts block, rewired onto the canonical local primitives
 *    (positional-arg headers/fetch helpers) with their flows unchanged.
 *
 * @version 2.1.2
 * @license MIT
 */

import * as crypto from "node:crypto";
import * as os from "node:os";

// Deduplicated against the frozen owners: symbols whose local definitions were
// value-identical to constants.ts / models.ts are imported here and re-exported
// below, so each has exactly one definition (library dedupe task 2-d1).
import {
  stripTrailingSlashes,
  ANTIGRAVITY_VERSION_FALLBACK,
  ANTIGRAVITY_USER_AGENT_FALLBACK,
  CLIENT_METADATA,
  CLIENT_METADATA_STRING,
  CLOUDCODE_BASE_URL,
  CLOUDCODE_DAILY_BASE,
  CODE_ASSIST_PATH_MAP,
  FALLBACK_PROJECT_ID,
  FETCH_TIMEOUT_MS,
  GEMINI_CLI_OAUTH_CLIENT_ID as OAUTH_CLIENT_ID,
  GEMINI_CLI_OAUTH_CLIENT_SECRET as OAUTH_CLIENT_SECRET,
  GEMINI_CLI_USER_AGENT_MINIMAL as GEMINI_CLI_USER_AGENT,
} from "./constants.js";
// v2.1.15 Phase B: generic utilities (fnv hash, fetch timeout wrapper, retry
// predicate) come from core.js; identity masquerade (gl-node api-client
// snapshot, antigravity header builder) comes from fingerprint.js.
import { fetchWithTimeout, fnv1a32, isRetryable } from "./core.js";
import { buildAntagravityHeaders, X_GOOG_API_CLIENT_GEMINI_CLI as X_GOOG_API_CLIENT } from "./fingerprint.js";
import type { AntigravityHeadersOptions } from "./fingerprint.js";
// v2.1.15 Phase A: project.ts is THE single owner of project discovery. All
// model-identification families it consumes (endpoint routing orders + the
// flat catalog lists) are imported from models.ts (layer 1, legal direction);
// the project-discovery block that used to live in models.ts was absorbed
// here (see the v2.1.15 Phase A notes in the file header below).
import {
  CODE_ASSIST_ENDPOINTS,
  ENDPOINT_ORDER,
  ENDPOINT_ORDER_ANTIGRAVITY,
  ENDPOINT_ORDER_GEMINI_CLI,
  MODELS_2026_ALL,
  MODELS_2026_ANTIGRAVITY,
  MODELS_2026_BASE,
  MODELS_2026_LEGACY,
} from "./models.js";
import type { Model2026 } from "./models.js";
import type { Account } from "./accounts.js";
export type { Account };

// ---------------------------------------------------------------------------
// 01. CORE CONSTANTS (v2.1.0 base) — identical values owned by the frozen
//     constants.ts / models.ts modules; re-exported for surface compatibility
// ---------------------------------------------------------------------------

export {
  ENDPOINT_ORDER,
  FALLBACK_PROJECT_ID,
  ANTIGRAVITY_VERSION_FALLBACK,
  ANTIGRAVITY_USER_AGENT_FALLBACK,
  CODE_ASSIST_ENDPOINTS,
  FETCH_TIMEOUT_MS,
};

/** Builds the dynamic Antigravity User-Agent: antigravity/{ver} {os}/{arch}. */
function buildDefaultUserAgent(version?: string): string {
  try {
    const ver = version && /^\d+\.\d+\.\d+/.test(version) ? version : ANTIGRAVITY_VERSION_FALLBACK;
    const plat = os.platform();
    const cpu = os.arch();
    const mappedOs = plat === "darwin" ? "darwin" : plat === "win32" ? "win32" : "linux";
    const mappedArch = cpu === "arm64" ? "arm64" : "x64";
    return `antigravity/${ver} ${mappedOs}/${mappedArch}`;
  } catch {
    return ANTIGRAVITY_USER_AGENT_FALLBACK;
  }
}

// ---------------------------------------------------------------------------
// 02. BYPASS IDENTIFICATION CONSTANTS (ported from v1 lineage)
// ---------------------------------------------------------------------------

// v2.1.15 Phase C: OAUTH_CLIENT_ID (gemini-cli pair) moved to constants.js
// as GEMINI_CLI_OAUTH_CLIENT_ID — imported from the owner.

// local variant: diverges from constants (static "GeminiCLI/0.57.0" vs the dynamic GEMINI_CLI_USER_AGENT_FALLBACK "gemini-cli/0.57.0 os/arch"); canonical static source for accounts.ts

export const GOOGLE_API_NODE_VERSION = "22.19.0" as const;

// local variant: diverges from constants (static "gl-node/22.19.0" vs the dynamic "antigravity/<ver> gl-node/<node> gax/..."); canonical static source for accounts.ts/quota.ts

// local variant: diverges from constants (structured object vs the dynamic buildClientMetadata() string)

// v2.1.16 dead-code cleanup: REQUEST_TIMEOUT_MS (10s, used only by the deleted
// v1 legacy flow below) was deleted — FETCH_TIMEOUT_MS from constants.js is
// the live timeout of the v2 flow.

// ---------------------------------------------------------------------------
// 03. LEGACY ENDPOINT TABLE (ported from v1 lineage, includes staging host)
// ---------------------------------------------------------------------------

/**
 * v1 ordered endpoint chain. PROD/DAILY derive from the constants.js owner
 * values; SANDBOX maps to the staging host and PREPROD is an extra hardening
 * entry observed in telemetry — both genuinely distinct values with no
 * constants.js equivalent, kept local (v2.1.16 dedup note).
 */
export const ENDPOINT_BASES = [
  {
    name: "PROD" as const,
    base: CLOUDCODE_BASE_URL,
  },
  {
    name: "DAILY" as const,
    base: CLOUDCODE_DAILY_BASE,
  },
  {
    name: "SANDBOX" as const,
    base: "https://staging-cloudcode-pa.googleapis.com",
  },
  // Extra hardening - preprod observed in telemetry
  {
    name: "PREPROD" as const,
    base: "https://preprod-cloudcode-pa.googleapis.com",
  },
] as const;

export type EndpointName = (typeof ENDPOINT_BASES)[number]["name"];

export interface EndpointDef {
  name: EndpointName;
  base: string;
}

/**
 * v1 method-path table. v2.1.16 dedup: every path derives from the
 * constants.js CODE_ASSIST_PATH_MAP owner (identical values).
 */
export const CODE_ASSIST_PATHS = {
  LOAD: CODE_ASSIST_PATH_MAP.LOAD_CODE_ASSIST,
  ONBOARD: CODE_ASSIST_PATH_MAP.ONBOARD_USER,
  FETCH_MODELS: CODE_ASSIST_PATH_MAP.FETCH_AVAILABLE_MODELS,
} as const;

// ---------------------------------------------------------------------------
// 04. MODELS 2026 - BASE / ANTIGRAVITY / ALL split (v2.1.0) + LEGACY list (v1)
// v2.1.15 Phase A: every list below is now imported from models.ts (THE owner
// of model identification) and re-exported under this module's historical
// names; the values are byte-identical to the former local copies.
// ---------------------------------------------------------------------------

/**
 * Canonical model list up to 2026-08-25. Best-effort validated via
 * fetchAvailableModels without failing when rollout has not reached
 * DAILY/SANDBOX yet.
 */
export { MODELS_2026_BASE, MODELS_2026_ANTIGRAVITY, MODELS_2026_ALL, MODELS_2026_LEGACY };

/**
 * Historical project-module alias of {@link MODELS_2026_BASE} (the former
 * local `MODELS_2026 = MODELS_2026_BASE` binding).
 */
export { MODELS_2026_BASE as MODELS_2026 };

/** Union type of the v1 static fallback list ids. */
export type { Model2026 };

// ---------------------------------------------------------------------------
// 05. TYPES - CLOUD CODE CONTRACTS
// ---------------------------------------------------------------------------

export type IdeType = "ANTIGRAVITY" | "IDE_UNSPECIFIED";

export interface CodeAssistMetadata {
  ideType: IdeType;
  platform: "PLATFORM_UNSPECIFIED";
  pluginType: "GEMINI";
}

function defaultMetadata(ideType: IdeType = "ANTIGRAVITY"): CodeAssistMetadata {
  return {
    ideType,
    platform: "PLATFORM_UNSPECIFIED",
    pluginType: "GEMINI",
  };
}

export interface LoadCodeAssistResponse {
  cloudaicompanionProject?: unknown;
  cloudaicompanionProjectId?: unknown;
  projectId?: unknown;
  currentTier?: unknown;
  [k: string]: unknown;
}

export interface OnboardUserResponse {
  done?: boolean;
  name?: string;
  response?: { cloudaicompanionProject?: unknown; projectId?: unknown };
  cloudaicompanionProject?: unknown;
  [k: string]: unknown;
}

export interface AvailableModel {
  name: string;
  displayName?: string;
  supportedMethods?: string[];
}

export interface FetchAvailableModelsResponse {
  models?: AvailableModel[];
  availableModels?: AvailableModel[];
  [k: string]: unknown;
}

// ---------------------------------------------------------------------------
// 06. LEGACY TYPES (ported from v1 lineage)
// ---------------------------------------------------------------------------

/** v1 Account shape with mutable metadata persisted by callers. */
// v2.1.15 Phase C: the Account interface moved to accounts.js (account
// store owner) — imported type-only (erased at runtime).

// v2.1.16 dead-code cleanup: LoadCodeAssistResponseV1, OnboardUserResponseV1
// and LegacyProjectCacheEntry (used only by the deleted v1 legacy flow below)
// were deleted; the response types of the live v2 flow are above.

export interface FetchModelsResponse {
  models?: Array<string | { name: string; displayName?: string; id?: string }>;
  availableModels?: Array<string | { name: string }>;
  // Fallbacks
  modelList?: string[];
  _raw?: unknown;
}

export interface ResolvedProject {
  projectId: string;
  source: EndpointName | "cache" | "metadata" | "fallback";
  fromCache: boolean;
  endpointBase?: string;
  models?: string[];
}

// ---------------------------------------------------------------------------
// 07. IN-MEMORY CACHES
// ---------------------------------------------------------------------------

interface CacheEntry {
  projectId: string;
  timestamp: number;
  email?: string | undefined;
}

const CACHE_TTL_MS = 60 * 60 * 1000; // 1h
const projectIdCache = new Map<string, CacheEntry>();

// local variant: diverges from core (the float multiply step rounds above 2^51 while core uses Math.imul, producing different hash values for the same input)

function hashToken(token: string): string {
  try {
    return crypto.createHash("sha256").update(token).digest("hex").slice(0, 32);
  } catch {
    return fnv1a32(token).toString(16);
  }
}

// local variant: diverges from models (operates on the module-private cache exposed via projectIdCacheForTesting; unpadded fnv fallback key)
export function getCachedProjectId(accessToken: string): string | null {
  const key = hashToken(accessToken);
  const entry = projectIdCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    projectIdCache.delete(key);
    return null;
  }
  return entry.projectId;
}

// local variant: diverges from models (writes the module-private cache exposed via projectIdCacheForTesting)
export function setCachedProjectId(accessToken: string, projectId: string, email?: string): void {
  const key = hashToken(accessToken);
  projectIdCache.set(key, { projectId, timestamp: Date.now(), email });
}

export function clearProjectIdCache(): void {
  projectIdCache.clear();
}

export function getCacheStats(): { size: number; entries: Array<{ email?: string | undefined; ageMs: number }> } {
  const now = Date.now();
  return {
    size: projectIdCache.size,
    entries: Array.from(projectIdCache.values()).map((e) => ({
      email: e.email,
      ageMs: now - e.timestamp,
    })),
  };
}

// v2.1.16 dead-code cleanup: the legacy v1 projectCache cluster —
// projectCache, getCacheKey, clearProjectCache, getProjectCacheSnapshot,
// pruneExpiredCache, isCacheValid and PROJECT_CACHE_TTL_MS — was used only by
// the deleted v1 legacy flow (resolveProjectIdV1) and had zero external
// consumers; it was deleted. The live v2 cache above (projectIdCache +
// getCachedProjectId/setCachedProjectId/clearProjectIdCache/getCacheStats)
// is untouched.

// ---------------------------------------------------------------------------
// 08. HELPERS - TIMEOUT, RETRY, HEADERS
// ---------------------------------------------------------------------------

// v2.1.15 Phase B: AntigravityHeadersOptions moved to fingerprint.js (identity owner).

// local variant: diverges from models (opts-object signature; no Accept header; no forbidden-header stripping)

/**
 * Error thrown by every project-discovery call. v2.1.15 Phase A merge of the
 * project.ts lineage (3-arg constructor, retryable derived from the status
 * via isRetryable) and the models.ts lineage (4-arg constructor, explicit
 * retryable): the optional fourth argument overrides the status-derived
 * default, so both historical call styles keep their exact semantics.
 */
export class ProjectDiscoveryError extends Error {
  public status?: number | undefined;
  public endpoint?: string | undefined;
  public retryable: boolean;
  constructor(message: string, status?: number, endpoint?: string, retryable?: boolean) {
    super(message);
    this.name = "ProjectDiscoveryError";
    this.status = status;
    this.endpoint = endpoint;
    this.retryable = retryable ?? (status !== undefined ? isRetryable(status) : true);
  }
}

/**
 * Fetch with 10s timeout through AbortController. Merges an external signal
 * so caller aborts propagate. Throws ProjectDiscoveryError (status 408) on
 * timeout so the cascade can retry.
 */
// local variant: diverges from models (3-arg signature with 10s default; wraps AbortError into ProjectDiscoveryError 408)

// v2.1.16 dead-code cleanup: buildGeminiHeaders (v1 masquerade-header
// builder whose only callers were the deleted v1 legacy flow; zero external
// consumers) was deleted — the live v2 flow builds headers via
// fingerprint.js buildAntagravityHeaders.

/**
 * Local heuristic only: reports whether a token looks expired
 * (does not replace real validation via tokeninfo).
 */
export function isLikelyExpiredToken(token: string): boolean {
  if (!token) return true;
  return token.length < 20;
}

/** Platform tuple helper for logging/debug - uses only node:os. */
export function getPlatformInfo(): { platform: string; arch: string; release: string; hostname: string } {
  return {
    platform: os.platform(),
    arch: os.arch(),
    release: os.release(),
    hostname: os.hostname(),
  };
}

// ---------------------------------------------------------------------------
// 09. PAYLOAD EXTRACTION
// ---------------------------------------------------------------------------

/** v2 extractor: normalizes strings, resource names and nested objects. */
function extractProjectId(raw: unknown): string | null {
  if (!raw) return null;
  if (typeof raw === "string") {
    const s = raw.trim();
    if (!s) return null;
    if (s.includes("projects/")) {
      const parts = s.split("/");
      const idx = parts.indexOf("projects");
      const id = parts[idx + 1];
      return id || s.split("/").pop() || s;
    }
    return s;
  }
  if (typeof raw === "object") {
    const obj = raw as any;
    if (typeof obj.id === "string" && obj.id) return extractProjectId(obj.id);
    if (typeof obj.name === "string" && obj.name) {
      const n = obj.name as string;
      return n.includes("/") ? (n.split("/").pop() ?? n) : n;
    }
    if (typeof obj.projectId === "string") return extractProjectId(obj.projectId);
    if (typeof obj.project_id === "string") return extractProjectId(obj.project_id);
  }
  return null;
}

// v2.1.16 dead-code cleanup: extractProjectIdV1 (the v1 extractor whose only
// callers were the deleted v1 legacy flow) was deleted; the v2 extractor
// above is the canonical payload normalizer.

// ---------------------------------------------------------------------------
// 10. loadCodeAssist / onboardUser / pollOperation (v2 canonical)
// ---------------------------------------------------------------------------

// local variant: diverges from models (extra ideType option)
export interface LoadCodeAssistOptions {
  accessToken: string;
  endpoint: string;
  projectId?: string | undefined;
  userAgent?: string | undefined;
  ideType?: IdeType;
}

/**
 * loadCodeAssist implemented exactly like Gemini CLI:
 * - POST {endpoint}/v1internal:loadCodeAssist
 * - Header: Authorization Bearer + User-Agent antigravity/{ver} {os}/{arch}
 * - Body: {metadata {ideType ANTIGRAVITY|GEMINI, platform PLATFORM_UNSPECIFIED, pluginType GEMINI}}
 * - No project ID required: when projectId is absent only metadata is sent (bypass)
 * - When provided and valid, sends cloudaicompanionProject for validation (cache compat)
 * - On 403/404 with ideType ANTIGRAVITY, retries automatically as GEMINI
 *   (bypass observed in pi-antigravity-auth)
 * - Returns the projectId string or null indicating onboarding is required
 */
// local variant: diverges from models (ANTIGRAVITY->GEMINI retry bypass, extractProjectId normalization, tier-id guard, no jitter)
export async function loadCodeAssist(opts: LoadCodeAssistOptions): Promise<string | null> {
  const { accessToken, endpoint, projectId, userAgent, ideType = "ANTIGRAVITY" } = opts;
  const base = stripTrailingSlashes(endpoint);
  const url = `${base}${CODE_ASSIST_PATHS.LOAD}`;
  const headers = buildAntagravityHeaders(accessToken, { userAgent });

  const attemptLoad = async (currentIde: IdeType): Promise<string | null> => {
    const body: Record<string, unknown> = {
      metadata: defaultMetadata(currentIde),
    };
    if (projectId && projectId !== FALLBACK_PROJECT_ID) {
      body.cloudaicompanionProject = projectId;
    }

    let res: Response;
    try {
      res = await fetchWithTimeout(url, { method: "POST", headers, body: JSON.stringify(body) }, FETCH_TIMEOUT_MS);
    } catch (e: any) {
      throw new ProjectDiscoveryError(
        `loadCodeAssist network failed at ${endpoint} ide=${currentIde}: ${e.message}`,
        e.status ?? 0,
        endpoint,
      );
    }

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new ProjectDiscoveryError(
        `loadCodeAssist failed ${res.status} at ${endpoint} ide=${currentIde}: ${text.slice(0, 600)}`,
        res.status,
        endpoint,
      );
    }

    let data: LoadCodeAssistResponse;
    try {
      data = (await res.json()) as LoadCodeAssistResponse;
    } catch {
      throw new ProjectDiscoveryError(`loadCodeAssist invalid JSON at ${endpoint}`, 500, endpoint);
    }

    const raw =
      (data as any).cloudaicompanionProject ??
      (data as any).cloudaicompanionProjectId ??
      (data as any).projectId ??
      (data as any).currentTier?.id;

    if (!raw) return null;

    // Guard: currentTier.id values ("free-tier"/"standard-tier") are TIER ids,
    // not project ids — a body without cloudaicompanionProject means the
    // account still needs onboarding (null = onboarding required).
    if (typeof raw === "string" && raw.endsWith("-tier")) return null;

    return extractProjectId(raw);
  };

  try {
    return await attemptLoad(ideType);
  } catch (err: any) {
    if (err instanceof ProjectDiscoveryError && isRetryable(err.status ?? 0) && ideType === "ANTIGRAVITY") {
      // GEMINI retry bypass - what Gemini CLI does when Antigravity is blocked
      try {
        return await attemptLoad("IDE_UNSPECIFIED");
      } catch (retryErr: any) {
        if (retryErr instanceof ProjectDiscoveryError) throw retryErr;
        throw err;
      }
    }
    throw err;
  }
}

// local variant: diverges from models (tierId union + ideType option)
export interface OnboardUserOptions {
  accessToken: string;
  endpoint: string;
  tierId?: "free-tier" | "standard-tier" | "FREE" | "TRIAL" | "STANDARD";
  userAgent?: string | undefined;
  ideType?: IdeType;
}

/** onboardUser - FREE tier with LRO pollOperation backoff 500ms-8s, 5 attempts. */
// local variant: diverges from models (free-tier default, LRO pollOperation backoff, 409 handling, ideType option)
export async function onboardUser(opts: OnboardUserOptions): Promise<string | null> {
  const { accessToken, endpoint, tierId = "free-tier", userAgent, ideType = "ANTIGRAVITY" } = opts;
  const base = stripTrailingSlashes(endpoint);
  const url = `${base}${CODE_ASSIST_PATHS.ONBOARD}`;
  const headers = buildAntagravityHeaders(accessToken, { userAgent });

  const body = {
    tierId,
    metadata: defaultMetadata(ideType),
  };

  let res: Response;
  try {
    res = await fetchWithTimeout(url, { method: "POST", headers, body: JSON.stringify(body) }, FETCH_TIMEOUT_MS);
  } catch (e: any) {
    throw new ProjectDiscoveryError(`onboardUser network failed at ${endpoint}: ${e.message}`, e.status ?? 0, endpoint);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    // Already-onboarded accounts may return 409 - treat as "run load again"
    if (res.status === 409) return null;
    throw new ProjectDiscoveryError(
      `onboardUser failed ${res.status} at ${endpoint}: ${text.slice(0, 600)}`,
      res.status,
      endpoint,
    );
  }

  let data: OnboardUserResponse;
  try {
    data = (await res.json()) as OnboardUserResponse;
  } catch {
    throw new ProjectDiscoveryError(`onboardUser invalid JSON at ${endpoint}`, 500, endpoint);
  }

  const direct =
    (data as any).cloudaicompanionProject ??
    (data as any).response?.cloudaicompanionProject ??
    (data as any).response?.projectId;

  if (direct) {
    const extracted = extractProjectId(direct);
    if (extracted) return extracted;
  }

  // LRO: a fresh onboard returns {name} without done — poll until the
  // operation completes (verified live: first call enqueues the operation,
  // immediate re-calls return done:true with cloudaicompanionProject).
  if (data.name && data.done !== true) {
    const polled = await pollOperation({
      accessToken,
      endpoint,
      operationName: data.name,
      userAgent,
      maxAttempts: 5,
    });
    if (polled) return polled;
  }

  if (data.done && data.response) {
    const proj = (data.response as any).cloudaicompanionProject ?? (data.response as any).projectId;
    const extracted = extractProjectId(proj);
    if (extracted) return extracted;
  }

  // Pattern observed in gemini-cli: empty onboard reply, next load succeeds
  return null;
}

interface PollOperationOptions {
  accessToken: string;
  endpoint: string;
  operationName: string;
  userAgent?: string | undefined;
  maxAttempts?: number;
}

/**
 * Replicates Gemini CLI LRO polling with 500ms-8s backoff, 5 attempts,
 * tolerant to several operationName formats.
 */
async function pollOperation(opts: PollOperationOptions): Promise<string | null> {
  const { accessToken, endpoint, operationName, userAgent, maxAttempts = 5 } = opts;
  const base = stripTrailingSlashes(endpoint);
  const headers = buildAntagravityHeaders(accessToken, { userAgent });

  // Normalize operationName shapes seen in the wild:
  // - "v1internal/operations/xxx"
  // - "operations/xxx"
  // - bare "xxx"
  const buildOpUrl = (name: string): string => {
    if (name.includes("/operations/")) {
      if (name.startsWith("v1internal/")) return `${base}/${name}`;
      return `${base}/v1internal/${name}`;
    }
    if (name.startsWith("operations/")) return `${base}/v1internal/${name}`;
    return `${base}/v1internal/operations/${name}`;
  };

  const initialUrl = buildOpUrl(operationName);

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (attempt > 0) {
      const delayMs = Math.min(500 * Math.pow(2, attempt - 1), 8000);
      await new Promise((r) => setTimeout(r, delayMs));
    }
    try {
      const res = await fetchWithTimeout(
        attempt === 0 ? initialUrl : buildOpUrl(operationName),
        { method: "GET", headers },
        FETCH_TIMEOUT_MS,
      );
      if (!res.ok) continue;
      const data = (await res.json()) as OnboardUserResponse;
      if (data.done) {
        const proj =
          (data as any).response?.cloudaicompanionProject ??
          (data as any).response?.projectId ??
          (data as any).cloudaicompanionProject;
        const extracted = extractProjectId(proj);
        if (extracted) return extracted;
        return null;
      }
    } catch {
      continue;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// 11. fetchAvailableModels (v2 canonical)
// ---------------------------------------------------------------------------

export interface FetchModelsOptions {
  accessToken: string;
  endpoint: string;
  projectId: string;
  userAgent?: string;
}

export async function fetchAvailableModels(opts: FetchModelsOptions): Promise<AvailableModel[]> {
  const { accessToken, endpoint, projectId, userAgent } = opts;
  if (!projectId) throw new ProjectDiscoveryError("fetchAvailableModels requires projectId", 400, endpoint);

  const url = `${stripTrailingSlashes(endpoint)}${CODE_ASSIST_PATHS.FETCH_MODELS}`;
  const headers = buildAntagravityHeaders(accessToken, { userAgent });
  // 2026-08 schema: the endpoint rejects the legacy {cloudaicompanionProject,
  // metadata} body with 400 "Unknown name ... Cannot find field" — the models
  // list is now resolved server-side from the bearer token. Send an empty body.
  const body: Record<string, unknown> = {};

  let res: Response;
  try {
    res = await fetchWithTimeout(url, { method: "POST", headers, body: JSON.stringify(body) }, FETCH_TIMEOUT_MS);
  } catch (e: any) {
    throw new ProjectDiscoveryError(
      `fetchAvailableModels network failed at ${endpoint}: ${e.message}`,
      e.status ?? 0,
      endpoint,
    );
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new ProjectDiscoveryError(
      `fetchAvailableModels failed ${res.status} at ${endpoint}: ${text.slice(0, 500)}`,
      res.status,
      endpoint,
    );
  }

  let data: FetchAvailableModelsResponse;
  try {
    data = (await res.json()) as FetchAvailableModelsResponse;
  } catch {
    throw new ProjectDiscoveryError(`fetchAvailableModels invalid JSON at ${endpoint}`, 500, endpoint);
  }

  const rawModels = (data as any).models ?? (data as any).availableModels ?? [];
  const models: AvailableModel[] = Array.isArray(rawModels) ? rawModels : [];
  return models;
}

// ---------------------------------------------------------------------------
// 12. LEGACY v1 FLOW — DELETED (v2.1.16 dead-code cleanup)
// ---------------------------------------------------------------------------
// v2.1.16 dead-code cleanup: the dead v1 legacy flow (loadCodeAssistV1,
// onboardUserV1, fetchAvailableModelsV1, resolveProjectIdV1 and the private
// buildUrl helper) had zero external consumers and zero internal callers
// outside itself and was deleted (~455 lines). The live v2 flow above
// (loadCodeAssist / onboardUser / fetchAvailableModels / resolveProjectId +
// projectIdCache) is untouched.

// ---------------------------------------------------------------------------
// 13. resolveProjectId ORCHESTRATOR (v2 canonical)
// ---------------------------------------------------------------------------

export interface AccountMetadataSaver {
  (projectId: string): Promise<void> | void;
}

export interface ResolveProjectIdOptions {
  accessToken: string;
  cachedProjectId?: string | undefined;
  email?: string | undefined;
  metadataSaver?: AccountMetadataSaver | undefined;
  userAgent?: string | undefined;
  endpoints?: readonly string[];
  includeAutopush?: boolean;
  /** When true (default), tries the discovered project before the blinded fallback */
  bypass?: boolean;
  /** Preferred ideType - ANTIGRAVITY first with automatic GEMINI fallback */
  ideType?: IdeType;
}

export interface ResolveResult {
  projectId: string;
  fromCache: boolean;
  endpointUsed?: string | undefined;
  isFallback: boolean;
  modelsChecked?: number | undefined;
  ideTypeUsed?: IdeType;
}

/**
 * Resolves the project id with full Gemini CLI-style bypass.
 * Observer flow:
 * 1. In-memory Map cache (token hash) - avoids multi-account round-trips
 * 2. When cachedProjectId is persisted on disk, validates it via loadCodeAssist
 *    on each endpoint (compat with AccountManager V3 ~/.config/opencode/
 *    antigravity-accounts.json chmod 600)
 * 3. Pure bypass: loadCodeAssist WITHOUT projectId -> {metadata {ANTIGRAVITY|GEMINI,
 *    PLATFORM_UNSPECIFIED, GEMINI}} -> returns discovered cloudaicompanionProject
 *    without requiring a user project
 * 4. When load returns null or 403/404 -> onboardUser {tierId FREE, metadata} ->
 *    LRO pollOperation backoff 500ms-8s 5 attempts -> load again
 * 5. Best-effort validation via fetchAvailableModels (does not fail on 403)
 * 6. Saves cache + metadataSaver for persistence
 * 7. If every endpoint fails with retryable errors, falls back to
 *    rising-fact-p41fc with a warning; bypass prefers the discovered project.
 */
export async function resolveProjectId(opts: ResolveProjectIdOptions): Promise<ResolveResult> {
  const {
    accessToken,
    cachedProjectId,
    email,
    metadataSaver,
    userAgent = buildDefaultUserAgent(),
    endpoints = ENDPOINT_ORDER,
    includeAutopush = false,
    bypass = true,
    ideType = "ANTIGRAVITY",
  } = opts;

  if (!accessToken) throw new ProjectDiscoveryError("resolveProjectId requires accessToken");

  // 1. Fast Map cache
  const memCached = getCachedProjectId(accessToken);
  if (memCached) {
    return {
      projectId: memCached,
      fromCache: true,
      isFallback: memCached === FALLBACK_PROJECT_ID,
      ideTypeUsed: ideType,
    };
  }

  const allEndpoints = includeAutopush ? [...endpoints, CODE_ASSIST_ENDPOINTS.AUTOPUSH] : endpoints;

  let lastError: ProjectDiscoveryError | null = null;
  let attemptedEndpoints = 0;

  for (const endpoint of allEndpoints) {
    attemptedEndpoints++;
    try {
      let discoveredProjectId: string | null = null;

      // 2a. With a disk-cached projectId, validate it first (compat)
      if (cachedProjectId && cachedProjectId !== FALLBACK_PROJECT_ID) {
        try {
          const validated = await loadCodeAssist({
            accessToken,
            endpoint,
            projectId: cachedProjectId,
            userAgent,
            ideType,
          });
          if (validated) discoveredProjectId = validated;
        } catch (e: any) {
          if (e instanceof ProjectDiscoveryError && !e.retryable) throw e;
          // Retryable - fall through to pure bypass on the same endpoint
          lastError = e instanceof ProjectDiscoveryError ? e : null;
        }
      }

      // 2b. Pure bypass - load without projectId, exactly like Gemini CLI
      if (!discoveredProjectId && bypass) {
        try {
          discoveredProjectId = await loadCodeAssist({ accessToken, endpoint, userAgent, ideType });
        } catch (e: any) {
          if (e instanceof ProjectDiscoveryError) {
            lastError = e;
            if (e.status === 403 || e.status === 404) {
              // 403/404 means no provisioned project yet -> onboarding required;
              // do not skip the endpoint yet, try onboard + load
            } else if (!isRetryable(e.status ?? 0)) {
              throw e;
            } else {
              // Retryable 5xx/408/429 -> next endpoint after onboard attempt
            }
          } else {
            lastError = new ProjectDiscoveryError(
              `unexpected load error at ${endpoint}: ${e?.message ?? String(e)}`,
              500,
              endpoint,
            );
          }
        }
      }

      // 2c. When load returned null or failed with 403/404: onboardUser + load again
      if (!discoveredProjectId) {
        try {
          const onboarded = await onboardUser({ accessToken, endpoint, tierId: "free-tier", userAgent, ideType });
          if (onboarded) {
            discoveredProjectId = onboarded;
          } else {
            // gemini-cli pattern: onboard without immediate project, next load works
            try {
              discoveredProjectId = await loadCodeAssist({ accessToken, endpoint, userAgent, ideType });
            } catch (loadAfterOnboardErr: any) {
              if (loadAfterOnboardErr instanceof ProjectDiscoveryError) {
                lastError = loadAfterOnboardErr;
                if (!isRetryable(loadAfterOnboardErr.status ?? 0)) throw loadAfterOnboardErr;
                continue;
              }
              lastError = loadAfterOnboardErr;
              continue;
            }
          }
        } catch (onboardErr: any) {
          if (onboardErr instanceof ProjectDiscoveryError) {
            lastError = onboardErr;
            if (!isRetryable(onboardErr.status ?? 0)) throw onboardErr;
            continue;
          }
          lastError = onboardErr;
          continue;
        }
      }

      if (!discoveredProjectId) {
        lastError = new ProjectDiscoveryError(`no project id from ${endpoint}`, 404, endpoint);
        continue;
      }

      // 2d. Best-effort validation via fetchAvailableModels - NEVER fatal:
      // a 403 (region/entitlement) or any schema drift in this auxiliary call
      // must not discard a successfully discovered projectId.
      let modelsCount: number | undefined;
      try {
        const models = await fetchAvailableModels({
          accessToken,
          endpoint,
          projectId: discoveredProjectId,
          userAgent,
        });
        modelsCount = models.length;
      } catch {
        // swallow — the projectId is already validated by loadCodeAssist
      }

      // 2e. Success - save cache and metadata
      setCachedProjectId(accessToken, discoveredProjectId, email);

      if (metadataSaver) {
        try {
          await metadataSaver(discoveredProjectId);
        } catch (saveErr) {
          console.warn(
            `[m[devthink] failed to save projectId metadata for ${email ?? "unknown"}: ${(saveErr as Error).message}`,
          );
        }
      }

      return {
        projectId: discoveredProjectId,
        fromCache: false,
        endpointUsed: endpoint,
        isFallback: false,
        modelsChecked: modelsCount,
        ideTypeUsed: ideType,
      };
    } catch (err: any) {
      if (err instanceof ProjectDiscoveryError) {
        lastError = err;
        if (!err.retryable) throw err;
        continue;
      }
      lastError = new ProjectDiscoveryError(
        `unexpected error at ${endpoint}: ${err?.message ?? String(err)}`,
        500,
        endpoint,
      );
      continue;
    }
  }

  // 3. Every endpoint failed - blinded fallback with warning.
  console.warn(
    `[m[devthink] WARNING: all ${attemptedEndpoints} endpoints failed` +
      `${lastError ? ` (last: ${lastError.status} ${lastError.message.slice(0, 250)})` : ""}.` +
      ` Falling back to blinded project ${FALLBACK_PROJECT_ID}.` +
      ` This works for Antigravity but will 403 for Gemini CLI models.` +
      ` Bypass attempted to discover project via loadCodeAssist/onboardUser like Gemini CLI does.` +
      ` Check SECURITY.md of the merged repository for the 403 permission guidance`,
  );

  setCachedProjectId(accessToken, FALLBACK_PROJECT_ID, email);

  if (metadataSaver) {
    try {
      await metadataSaver(FALLBACK_PROJECT_ID);
    } catch {
      /* the guarded best-effort operation falls through: the outer flow owns the failure */
    }
  }

  return {
    projectId: FALLBACK_PROJECT_ID,
    fromCache: false,
    endpointUsed: undefined,
    isFallback: true,
    ideTypeUsed: ideType,
  };
}

/** Convenience wrapper resolving and saving in one shot. */
export async function resolveAndSaveProjectId(
  accessToken: string,
  account: { email?: string; projectId?: string; save?: AccountMetadataSaver },
  opts: Omit<ResolveProjectIdOptions, "accessToken" | "cachedProjectId" | "email" | "metadataSaver"> = {},
): Promise<ResolveResult> {
  return resolveProjectId({
    accessToken,
    cachedProjectId: account.projectId,
    email: account.email,
    metadataSaver: account.save,
    ...opts,
  });
}

// ---------------------------------------------------------------------------
// 13b. ABSORBED FROM models.ts (v2.1.15 Phase A) — the Gemini CLI bypass
//      resolver and the direct fetchAvailableModels call that used to live in
//      the models.ts project block. Flows kept verbatim; the primitives they
//      call are this module's canonical implementations above.
// ---------------------------------------------------------------------------

export type ResolveProjectIdBypassOptions = {
  accessToken: string;
  cachedProjectId?: string;
  email?: string;
  userAgent?: string;
  endpointOverrides?: string[];
  isGeminiCliModel?: boolean; // when true, skip SANDBOX
  metadataSaver?: (projectId: string) => Promise<void> | void;
};

export type ResolveProjectIdBypassResult = {
  projectId: string;
  fromCache: boolean;
  endpointUsed?: string | undefined;
  isFallback: boolean;
  attempts: string[];
};

/**
 * Resolves the project id with the pure Gemini CLI bypass flow (the former
 * models.ts orchestrator): cache validation first, then a cachedProjectId
 * direct-load sweep, then the discovery cascade (load without project ->
 * onboard -> load again) over the pool-appropriate endpoint order, with the
 * rising-fact-p41fc blinded fallback last.
 */
export async function resolveProjectIdAsGeminiCliBypass(
  opts: ResolveProjectIdBypassOptions,
): Promise<ResolveProjectIdBypassResult> {
  const { accessToken, cachedProjectId, email, userAgent, endpointOverrides, isGeminiCliModel, metadataSaver } = opts;
  if (!accessToken?.trim()) throw new ProjectDiscoveryError("accessToken required", 400, undefined, false);

  // 1. Cache hit
  const cached = getCachedProjectId(accessToken);
  if (cached) {
    // best-effort validate with loadCodeAssist using cached id
    try {
      const ep = endpointOverrides?.[0] ?? CODE_ASSIST_ENDPOINTS.PROD;
      const validated = await loadCodeAssist({ accessToken, endpoint: ep, projectId: cached, userAgent });
      if (validated) {
        setCachedProjectId(accessToken, validated, email);
        return { projectId: validated, fromCache: true, endpointUsed: ep, isFallback: false, attempts: [ep] };
      }
    } catch {
      // ignore, proceed to discovery
    }
    // even if validation skipped, return cached if explicit override present
    if (cachedProjectId && cachedProjectId === cached) {
      return { projectId: cached, fromCache: true, isFallback: false, attempts: [] };
    }
  }

  if (cachedProjectId?.trim()) {
    // Caller provided cached value (from accounts.json chmod 600) - try direct load with it
    const epList =
      endpointOverrides ?? (isGeminiCliModel ? [...ENDPOINT_ORDER_GEMINI_CLI] : [...ENDPOINT_ORDER_ANTIGRAVITY]);
    for (const ep of epList) {
      try {
        const pid = await loadCodeAssist({ accessToken, endpoint: ep, projectId: cachedProjectId.trim(), userAgent });
        if (pid) {
          setCachedProjectId(accessToken, pid, email);
          if (metadataSaver) await Promise.resolve(metadataSaver(pid)).catch(() => {});
          return {
            projectId: pid,
            fromCache: false,
            endpointUsed: ep,
            isFallback: false,
            attempts: epList as string[],
          };
        }
      } catch (e: any) {
        if (e instanceof ProjectDiscoveryError && !isRetryable(e.status ?? 0) && e.status !== 0) throw e;
        continue;
      }
    }
  }

  // 2. Discovery cascade - PROD first, DAILY second, SANDBOX only if antigravity group
  const endpoints = endpointOverrides
    ? [...endpointOverrides]
    : isGeminiCliModel
      ? [...ENDPOINT_ORDER_GEMINI_CLI]
      : [...ENDPOINT_ORDER_ANTIGRAVITY];

  let lastError: ProjectDiscoveryError | null = null;
  const attempts: string[] = [];

  for (const ep of endpoints) {
    attempts.push(ep);
    try {
      // a) load without project id - Gemini CLI behavior
      let pid: string | null = null;
      try {
        pid = await loadCodeAssist({ accessToken, endpoint: ep, userAgent });
      } catch (e: any) {
        if (e instanceof ProjectDiscoveryError) {
          lastError = e;
          if (!e.retryable) throw e;
          continue;
        }
        lastError = new ProjectDiscoveryError(String(e?.message ?? e), 500, ep, true);
        continue;
      }

      // b) if null, onboard then load again
      if (!pid) {
        try {
          const onboarded = await onboardUser({ accessToken, endpoint: ep, userAgent });
          if (onboarded) pid = onboarded;
          else pid = await loadCodeAssist({ accessToken, endpoint: ep, userAgent });
        } catch (e: any) {
          if (e instanceof ProjectDiscoveryError) {
            lastError = e;
            if (!isRetryable(e.status ?? 0) && e.status !== 0) throw e;
            continue;
          }
          lastError = new ProjectDiscoveryError(String(e?.message ?? e), 500, ep, true);
          continue;
        }
      }

      if (!pid) {
        lastError = new ProjectDiscoveryError(`no project id from ${ep}`, 404, ep, true);
        continue;
      }

      // success
      setCachedProjectId(accessToken, pid, email);
      if (metadataSaver) {
        try {
          await metadataSaver(pid);
        } catch {
          /* the guarded best-effort operation falls through: the outer flow owns the failure */
        }
      }
      return { projectId: pid, fromCache: false, endpointUsed: ep, isFallback: false, attempts };
    } catch (e: any) {
      if (e instanceof ProjectDiscoveryError) {
        lastError = e;
        if (!e.retryable) throw e;
        continue;
      }
      lastError = new ProjectDiscoveryError(`unexpected at ${ep}: ${String(e?.message ?? e)}`, 500, ep, true);
      continue;
    }
  }

  // 3. All endpoints failed - hardened fallback (works for Antigravity, 403 for Gemini CLI models per README)
  // Observer notes: pi-antigravity-auth warns that fallback rising-fact-p41fc fails for gemini-cli group with 403
  // We return fallback only if caller allows antigravity group; for gemini-cli we still return fallback with isFallback true for caller to decide
  setCachedProjectId(accessToken, FALLBACK_PROJECT_ID, email);
  if (metadataSaver) {
    try {
      await metadataSaver(FALLBACK_PROJECT_ID);
    } catch {
      /* the guarded best-effort operation falls through: the outer flow owns the failure */
    }
  }
  return {
    projectId: FALLBACK_PROJECT_ID,
    fromCache: false,
    endpointUsed: undefined,
    isFallback: true,
    attempts,
  };
}

/**
 * fetchAvailableModels direct on cloudcode-pa without localhost v1 proxy
 * (the former models.ts implementation): POSTs
 * /v1internal:fetchAvailableModels with the resolved project and normalizes
 * the varied response shapes into a plain id/name string list.
 */
export async function fetchAvailableModelsDirect(opts: {
  accessToken: string;
  endpoint: string;
  projectId: string;
  userAgent?: string;
}): Promise<string[]> {
  const { accessToken, endpoint, projectId, userAgent } = opts;
  const base = stripTrailingSlashes(endpoint);
  const url = `${base}${CODE_ASSIST_PATHS.FETCH_MODELS}`;
  const headers = buildAntagravityHeaders(accessToken, { userAgent });
  const body = JSON.stringify({ cloudaicompanionProject: projectId });

  const res = await fetchWithTimeout(url, { method: "POST", headers, body }, FETCH_TIMEOUT_MS).catch((e: any) => {
    throw new ProjectDiscoveryError(
      `fetchAvailableModels network error ${endpoint}: ${e?.message ?? String(e)}`,
      0,
      endpoint,
      true,
    );
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new ProjectDiscoveryError(
      `fetchAvailableModels failed ${res.status} at ${endpoint}: ${txt.slice(0, 500)}`,
      res.status,
      endpoint,
      isRetryable(res.status),
    );
  }

  try {
    const json = (await res.json()) as any;
    // Shapes: { models: [{ name, ... }] } or { availableModels: [...] }
    const arr = json?.models ?? json?.availableModels ?? json?.modelsList ?? [];
    if (Array.isArray(arr)) {
      return arr.map((m: any) => (typeof m === "string" ? m : (m?.name ?? m?.id ?? ""))).filter(Boolean);
    }
    if (Array.isArray(json)) return json.map((m: any) => (typeof m === "string" ? m : (m?.name ?? ""))).filter(Boolean);
    return [];
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// 14. COMPAT EXPORTS + DEFAULT BUNDLE
// ---------------------------------------------------------------------------

export const projectIdCacheForTesting = projectIdCache;

const projectModule = {
  // v2 constants
  CODE_ASSIST_ENDPOINTS,
  ENDPOINT_ORDER,
  FETCH_TIMEOUT_MS,
  FALLBACK_PROJECT_ID,
  MODELS_2026: MODELS_2026_BASE,
  MODELS_2026_BASE,
  MODELS_2026_ANTIGRAVITY,
  MODELS_2026_ALL,
  MODELS_2026_LEGACY,
  isRetryable,
  buildAntagravityHeaders,
  fetchWithTimeout,
  loadCodeAssist,
  onboardUser,
  fetchAvailableModels,
  resolveProjectId,
  resolveAndSaveProjectId,
  resolveProjectIdAsGeminiCliBypass,
  fetchAvailableModelsDirect,
  getCachedProjectId,
  setCachedProjectId,
  clearProjectIdCache,
  getCacheStats,
  fnv1a32,
  ProjectDiscoveryError,
  buildDefaultUserAgent,
  // v1 ported constants (v2.1.16: REQUEST_TIMEOUT_MS / PROJECT_CACHE_TTL_MS /
  // the legacy projectCache cluster / buildGeminiHeaders and the V1-suffixed
  // flow entries were deleted with the dead v1 flow)
  OAUTH_CLIENT_ID,
  OAUTH_CLIENT_SECRET,
  GEMINI_CLI_USER_AGENT,
  GOOGLE_API_NODE_VERSION,
  X_GOOG_API_CLIENT,
  CLIENT_METADATA,
  CLIENT_METADATA_STRING,
  ENDPOINT_BASES,
  CODE_ASSIST_PATHS,
  // v1 utils
  isLikelyExpiredToken,
  getPlatformInfo,
};

export default projectModule;
