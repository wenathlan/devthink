/* ── Merged: the grand merge section ── the correlated antigravity version resolution logics of the merged repository interned here, one surface without duplicate variations ── */
/**
 * @module versions/registry
 * @description
 * Dynamic Antigravity version resolver of the merged repository
 * (merged superset of the two prior variants).
 *
 * Two complementary resolution chains are unified here:
 *
 * Legacy chain (4 tiers):
 *  1. Remote auto-updater manifests (linux_amd64.json / ide updater API)
 *  2. Changelog scrape (antigravity.google.com, cloud.google.com, updater)
 *  3. Stale disk cache (~/.config/opencode/antigravity-version.json)
 *  4. Hardcoded fallback 1.15.8 / 2.0.11
 *
 * Observer chain (replicating Antigravity Manager startup):
 *  1. Memory Map cache (6h TTL)
 *  2. Remote registries: npm registry, GitHub Releases, storage.googleapis
 *  3. Local cache file written atomically (tmp + rename, chmod 0600)
 *  4. Governed fallback 1.19.2 (>= min supported, not blocked)
 *
 * Governance constants: ANTIGRAVITY_BLOCKED_VERSIONS hard-ban list,
 * ANTIGRAVITY_VERSION_MIN_SUPPORTED ("1.15.8") and semver utilities
 * (cleanSemver / compareSemver / shouldUpdate / isValidSemver /
 * isBlockedVersion / isSupportedVersion).
 *
 * Reconciliation notes:
 * - getVersion()/getVersionSync() accept BOTH call shapes (no args or options
 *   object) and consult both chains plus both cache stores. The observer
 *   chain is gated by min-supported/blocked checks; legacy chain results are
 *   honored unless explicitly blocked. When everything fails offline, the
 *   governed fallback 1.19.2 is returned by the merged getters, while the
 *   dedicated legacy getters (getVersionInfo*, fetchAntigravityVersion) keep
 *   their original 1.15.8 fallback untouched.
 * - Cache persistence uses atomic tmp-file + rename with chmod 0600.
 *
 * Runtime: only node:* builtins + global fetch. Zero external deps. The
 * registry is server and cli surface — the neutral core barrel never
 * carries it, so the browser bundles stay free of node imports.
 *
 * @license MIT
 */

import * as fs from "node:fs";
import * as fsp from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";
import * as crypto from "node:crypto";

// Deduplicated against the frozen owner (constants.ts): symbols whose local
// definitions were value-identical are imported and re-exported below, so each
// has exactly one definition (library dedupe task 2-d1).
import {
  ANTIGRAVITY_VERSION_FALLBACK,
  ANTIGRAVITY_VERSION_MIN_SUPPORTED,
  ANTIGRAVITY_BLOCKED_VERSIONS,
  ANTIGRAVITY_VERSION_REMOTE_URLS,
  VERSION_FETCH_TIMEOUT_MS,
  FETCH_TIMEOUT_MS,
  GEMINI_CLI_OAUTH_CLIENT_ID,
  GEMINI_CLI_OAUTH_CLIENT_SECRET,
  GEMINI_CLI_SCOPES,
  GEMINI_CLI_USER_AGENT,
  CLIENT_METADATA_STRING,
  CLOUDCODE_BASE_URL,
  CODE_ASSIST_PATH_MAP,
  PROJECT_FALLBACK,
} from "./constants.js";
// v2.1.16 single-owner fix: the MODELS_2026 reference list comes from
// models.js (model identification owner — the 11-id legacy list).
import { MODELS_2026_LEGACY as MODELS_2026_REFERENCE } from "./models.js";
import { X_GOOG_API_CLIENT_GEMINI_CLI } from "./fingerprint.js";
import { fetchWithTimeout } from "./core.js";
import { isValidSemver } from "./config.js";
export { isValidSemver };

// Re-exports preserve this module's public surface after the dedupe.
export {
  ANTIGRAVITY_VERSION_FALLBACK,
  ANTIGRAVITY_VERSION_MIN_SUPPORTED,
  ANTIGRAVITY_BLOCKED_VERSIONS,
  ANTIGRAVITY_VERSION_REMOTE_URLS,
  VERSION_FETCH_TIMEOUT_MS,
};

// ---------------------------------------------------------------------------
// Section: Constants / fallbacks (legacy chain)
// ---------------------------------------------------------------------------

/**
 * Official Antigravity auto-updater endpoints (same infra as Gemini CLI /
 * Antigravity IDE). Both return JSON with `version` shaped "1.15.8-57246...".
 */
export const REMOTE_MANIFEST_URLS = [
  "https://antigravity-auto-updater-974169037036.us-central1.run.app/manifests/linux_amd64.json",
  "https://antigravity-ide-auto-updater-974169037036.us-central1.run.app/api/update/linux/x64/stable/0",
] as const;

/** Changelog URLs for secondary scrape when manifests fail. */
export const CHANGELOG_URLS = [
  "https://antigravity.google.com/docs/changelog",
  "https://antigravity.google.com/changelog",
  "https://cloud.google.com/antigravity/docs/release-notes",
  "https://antigravity-auto-updater-974169037036.us-central1.run.app/changelog",
] as const;

/** Hardened fallback - last known stable IDE version. */
export const FALLBACK_VERSION = "1.15.8" as const;
export const FALLBACK_FULL_VERSION = "1.15.8-5724687216017408" as const;

/** Alternative fallback - CLI/Antigravity v2 track compatibility. */
export const FALLBACK_ALTERNATIVE_VERSION = "2.0.11" as const;
export const FALLBACK_ALTERNATIVE_FULL = "2.0.11-0000000000000000" as const;

/** Legacy cache TTL: 6 hours in ms. */
export const VERSION_CACHE_TTL_MS = 6 * 60 * 60 * 1000;

/** Legacy cache file location - XDG style. */
export const VERSION_CACHE_FILE = path.join(os.homedir(), ".config", "opencode", "antigravity-version.json");

/** Default fetch timeout. */
// local variant: diverges from models (5s legacy-chain default vs models' 10s FETCH_TIMEOUT_MS)

// ---------------------------------------------------------------------------
// Section: Constants / governance (observer chain)
// ---------------------------------------------------------------------------

/**
 * Governed fallback version, verified safe on 2026-08-25:
 * versions below 1.15.8 are banned; 1.19.2 avoids the forced-update prompt.
 */
// ANTIGRAVITY_VERSION_FALLBACK / ANTIGRAVITY_VERSION_MIN_SUPPORTED /
// ANTIGRAVITY_BLOCKED_VERSIONS / ANTIGRAVITY_VERSION_REMOTE_URLS /
// VERSION_FETCH_TIMEOUT_MS: identical values — imported and re-exported above.

/** Observer memory cache TTL - 6h. */
export const VERSION_MEMORY_TTL_MS = 6 * 60 * 60 * 1000;

/** Observer file cache TTL - 24h before considered stale (still usable). */
export const VERSION_FILE_TTL_MS = 24 * 60 * 60 * 1000;

const OBSERVER_CACHE_FILE_NAME = "antigravity-version.json";
const OBSERVER_FILE_MODE = 0o600;
const OBSERVER_DIR_MODE = 0o755;
const MEMORY_CACHE_KEY = "latest";

const SEMVER_RE = /^(\d+)\.(\d+)\.(\d+)(?:-[\w.-]+)?(?:\+[\w.-]+)?$/;
const SEMVER_EXTRACT_RE = /(\d+\.\d+\.\d+(?:-[\w.-]+)?(?:\+[\w.-]+)?)/;

// ---------------------------------------------------------------------------
// Section: Auth constants (plugin integration reference, not used in fetch)
// v2.1.16 single-owner fix: every member is imported from its owner
// (constants.js raw values; models.js for the model-id list) — the former
// local literals were byte-identical duplicates.
// ---------------------------------------------------------------------------

export const ANTIGRAVITY_AUTH_CONSTANTS = {
  CLIENT_ID: GEMINI_CLI_OAUTH_CLIENT_ID,
  CLIENT_SECRET: GEMINI_CLI_OAUTH_CLIENT_SECRET,
  SCOPES: GEMINI_CLI_SCOPES,
  /** UA templates - production should vary platform dynamically.
   * v2.1.16: derived from the canonical full UA by platform substitution
   * (single owner: constants.GEMINI_CLI_USER_AGENT). */
  USER_AGENT_TEMPLATES: {
    darwin_arm64: GEMINI_CLI_USER_AGENT.replace("(linux; x64; GitHub)", "(darwin; arm64; GitHub)"),
    darwin_x64: GEMINI_CLI_USER_AGENT.replace("(linux; x64; GitHub)", "(darwin; x64; GitHub)"),
    linux_x64: GEMINI_CLI_USER_AGENT,
    win32_x64: GEMINI_CLI_USER_AGENT.replace("(linux; x64; GitHub)", "(win32; x64; GitHub)"),
  },
  X_GOOG_API_CLIENT: X_GOOG_API_CLIENT_GEMINI_CLI,
  CLIENT_METADATA: CLIENT_METADATA_STRING,
  ENDPOINT_BASE: CLOUDCODE_BASE_URL,
  ENDPOINTS: CODE_ASSIST_PATH_MAP,
  PROJECT_FALLBACK: PROJECT_FALLBACK,
  MODELS_2026: MODELS_2026_REFERENCE,
} as const;

// ---------------------------------------------------------------------------
// Section: Types
// ---------------------------------------------------------------------------

export type VersionSource =
  | "remote-manifest"
  | "ide-updater"
  | "changelog"
  | "cache-file"
  | "memory-cache"
  | "hardcoded-fallback";

export interface AntigravityVersionInfo {
  /** Normalized version without build metadata, e.g. "1.15.8" */
  version: string;
  /** Full original version, e.g. "1.15.8-5724687216017408" */
  fullVersion: string;
  /** Where this version came from */
  source: VersionSource;
  /** Epoch ms */
  fetchedAt: number;
  /** Computed expiration */
  expiresAt: number;
  /** Optional URL that produced the version */
  url?: string;
}

/** Observer memory-cache entry shape. */
export interface CacheEntry {
  version: string;
  fetchedAt: number; // epoch ms
  source: string; // url or "file" or "memory"
}

/** Observer on-disk cache file shape. */
export interface VersionCacheFile {
  version: string;
  fetchedAt: number;
  source: string;
  expiresAt: number;
}

/** Observer fetch overrides. */
export interface FetchOptions {
  /** Timeout per request ms - defaults to 5000 */
  timeoutMs?: number;
  /** Force remote fetch bypassing memory cache */
  force?: boolean;
  /** Custom remote URLs override (testing) */
  remoteUrls?: readonly string[];
  /** Custom cache path override */
  cachePath?: string;
  /** Extra User-Agent header value (GitHub rate-limit friendly) */
  userAgent?: string;
}

export interface GetVersionOptions extends FetchOptions {
  /** Allow returning stale file cache when remote fails - default true */
  allowStale?: boolean;
}

/** Shape persisted on disk for the legacy chain. */
interface CachedFilePayload extends AntigravityVersionInfo {}

// ---------------------------------------------------------------------------
// Section: Internal state (legacy memory cache + dedup, observer Map)
// ---------------------------------------------------------------------------

let memoryCache: AntigravityVersionInfo | null = null;
let inflightPromise: Promise<AntigravityVersionInfo> | null = null;

/**
 * Observer memory cache keyed by MEMORY_CACHE_KEY ("latest").
 * Exported for introspection/testing; treat as read-only in production.
 */
export const versionMemoryCache = new Map<string, CacheEntry>();

// ---------------------------------------------------------------------------
// Section: Semver utilities (observer chain, dependency-free)
// ---------------------------------------------------------------------------

/** Validates strict semver shape. */
// v2.1.15 Phase C: isValidSemver moved to config.js (validator owner) — re-exported below.

/**
 * Extracts the first semver token from dirty input such as "v1.19.2" or
 * "antigravity/1.19.2 darwin/arm64".
 * @returns cleaned semver or null
 */
export function cleanSemver(raw: unknown): string | null {
  if (!raw || typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (SEMVER_RE.test(trimmed)) return trimmed;
  const m = trimmed.match(SEMVER_EXTRACT_RE);
  if (m && m[1] && SEMVER_RE.test(m[1])) return m[1];
  return null;
}

/**
 * Compares two semver strings.
 * @returns -1 if a < b, 0 if equal, 1 if a > b (invalid sorts lowest)
 */
export function compareSemver(a: string, b: string): -1 | 0 | 1 {
  const ca = cleanSemver(a);
  const cb = cleanSemver(b);
  if (!ca && !cb) return 0;
  if (!ca) return -1;
  if (!cb) return 1;

  const pa = ca.split(/[.-]/);
  const pb = cb.split(/[.-]/);

  for (let i = 0; i < 3; i++) {
    const na = Number.parseInt(pa[i] ?? "0", 10);
    const nb = Number.parseInt(pb[i] ?? "0", 10);
    if (Number.isNaN(na) || Number.isNaN(nb)) continue;
    if (na < nb) return -1;
    if (na > nb) return 1;
  }
  // Prerelease suffix ordering: 1.19.2-preview < 1.19.2
  const hasPreA = ca.includes("-");
  const hasPreB = cb.includes("-");
  if (hasPreA && !hasPreB) return -1;
  if (!hasPreA && hasPreB) return 1;
  return 0;
}

/** True when latest > current - triggers an update notification. */
export function shouldUpdate(current: string, latest: string): boolean {
  const c = cleanSemver(current);
  const l = cleanSemver(latest);
  if (!c || !l) return false;
  return compareSemver(c, l) === -1;
}

/** Checks whether a version is on the hard block list. */
export function isBlockedVersion(v: string): boolean {
  const cleaned = cleanSemver(v);
  if (!cleaned) return false;
  return (ANTIGRAVITY_BLOCKED_VERSIONS as readonly string[]).includes(cleaned);
}

/** True when version >= min supported and not blocked. */
export function isSupportedVersion(v: string): boolean {
  const cleaned = cleanSemver(v);
  if (!cleaned) return false;
  if (isBlockedVersion(cleaned)) return false;
  return compareSemver(cleaned, ANTIGRAVITY_VERSION_MIN_SUPPORTED) >= 0;
}

// ---------------------------------------------------------------------------
// Section: Payload parsing - heterogeneous JSON shapes (npm/GitHub/GCS)
// ---------------------------------------------------------------------------

/**
 * Extracts a version from unknown JSON payload shapes:
 * npm `{version}`, GitHub `{tag_name}` / `{name}`, GCS `{version|latest|
 * latestVersion}`, nested `{data:{version}}`; falls back to regex over the
 * serialized payload.
 */
export function parseVersionFromPayload(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const obj = payload as Record<string, unknown>;

  const candidates: unknown[] = [
    obj["version"],
    obj["latestVersion"],
    obj["latest"],
    obj["tag_name"],
    obj["name"],
    (obj["data"] as Record<string, unknown> | undefined)?.["version"],
    (obj["data"] as Record<string, unknown> | undefined)?.["latestVersion"],
  ];

  for (const cand of candidates) {
    if (typeof cand === "string") {
      const cleaned = cleanSemver(cand);
      if (cleaned) return cleaned;
    }
  }

  try {
    const asString = JSON.stringify(payload);
    const m = asString.match(SEMVER_EXTRACT_RE);
    if (m && m[1]) {
      const cleaned = cleanSemver(m[1]);
      if (cleaned) return cleaned;
    }
  } catch {
    // ignore
  }
  return null;
}

// ---------------------------------------------------------------------------
// Section: Helpers (legacy chain)
// ---------------------------------------------------------------------------

/**
 * Parses "1.15.8-5724687216017408" into normalized + full forms,
 * keeping a safe fallback when the regex does not match.
 */
export function parseAntigravityVersion(raw: string): {
  normalized: string;
  full: string;
} {
  if (!raw || typeof raw !== "string") {
    return { normalized: FALLBACK_VERSION, full: FALLBACK_FULL_VERSION };
  }
  const trimmed = raw.trim();
  const m = trimmed.match(/(\d+\.\d+\.\d+(?:\.\d+)?)/);
  if (!m) {
    const cleaned = trimmed.replace(/[^0-9.\-]/g, "");
    return {
      normalized: cleaned.split("-")[0] || FALLBACK_VERSION,
      full: trimmed,
    };
  }
  return { normalized: m[1] || FALLBACK_VERSION, full: trimmed };
}

/**
 * Fetch with timeout via AbortController (global fetch, Node 18+).
 * Injects Gemini-CLI-like baseline headers; caller headers take precedence.
 */
// local variant: diverges from models (injects Gemini-CLI baseline headers; no external-signal merge; 5s default)

/** Ensures the legacy cache directory exists. */
function ensureCacheDirSync(): void {
  try {
    const dir = path.dirname(VERSION_CACHE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
    }
  } catch {
    // silent - disk may be read-only, memory cache still works
  }
}

/** Reads the legacy cache from disk synchronously when valid. */
export function readCacheFileSync(): AntigravityVersionInfo | null {
  try {
    if (!fs.existsSync(VERSION_CACHE_FILE)) return null;
    const raw = fs.readFileSync(VERSION_CACHE_FILE, "utf8");
    const parsed = JSON.parse(raw) as CachedFilePayload;
    if (!parsed.version || !parsed.fetchedAt) return null;
    if (Date.now() > parsed.expiresAt) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Reads the legacy cache from disk asynchronously. */
export async function readCacheFile(): Promise<AntigravityVersionInfo | null> {
  try {
    await fs.promises.access(VERSION_CACHE_FILE, fs.constants.R_OK);
    const raw = await fs.promises.readFile(VERSION_CACHE_FILE, "utf8");
    const parsed = JSON.parse(raw) as CachedFilePayload;
    if (!parsed.version || !parsed.fetchedAt) return null;
    if (Date.now() > parsed.expiresAt) return null;
    return { ...parsed, source: "cache-file" };
  } catch {
    return null;
  }
}

/**
 * Writes the legacy cache file atomically: content goes to a unique temp
 * file (chmod 0600), then rename over the destination. Best-effort, never
 * throws into the caller.
 */
export async function writeCacheFile(info: AntigravityVersionInfo): Promise<void> {
  const dir = path.dirname(VERSION_CACHE_FILE);
  try {
    ensureCacheDirSync();
    const payload: CachedFilePayload = { ...info };
    const content = JSON.stringify(payload, null, 2);
    const rand = crypto.randomBytes(6).toString("hex");
    const tmp = path.join(dir, `.${path.basename(VERSION_CACHE_FILE)}.${process.pid}.${rand}.tmp`);
    try {
      await fsp.writeFile(tmp, content, { encoding: "utf8", mode: 0o600 });
      try {
        await fsp.chmod(tmp, 0o600);
      } catch {
        /* best effort */
      }
      await fsp.rename(tmp, VERSION_CACHE_FILE);
      try {
        await fsp.chmod(VERSION_CACHE_FILE, 0o600);
      } catch {
        /* best effort */
      }
    } finally {
      try {
        await fsp.unlink(tmp);
      } catch {
        /* temp may not exist anymore */
      }
    }
  } catch {
    // ignore - memory cache still works
  }
}

// ---------------------------------------------------------------------------
// Section: Observer filesystem helpers
// ---------------------------------------------------------------------------

/**
 * Resolves the observer cache dir, honoring OPENCODE_CONFIG_DIR and
 * XDG_CONFIG_HOME (same contract as config.ts).
 */
function resolveConfigDir(): string {
  const envDir = process.env.OPENCODE_CONFIG_DIR?.trim();
  if (envDir) return envDir;
  const xdg = process.env.XDG_CONFIG_HOME?.trim();
  if (xdg) return path.join(xdg, "opencode");
  return path.join(os.homedir(), ".config", "opencode");
}

function resolveObserverCachePath(customPath?: string): string {
  if (customPath?.trim()) return path.resolve(customPath.trim());
  return path.join(resolveConfigDir(), OBSERVER_CACHE_FILE_NAME);
}

async function readObserverCacheFileAsync(cachePath: string): Promise<VersionCacheFile | null> {
  try {
    await fsp.access(cachePath, fs.constants.F_OK);
  } catch {
    return null;
  }
  try {
    const text = await fsp.readFile(cachePath, "utf8");
    if (!text.trim()) return null;
    const parsed = JSON.parse(text) as VersionCacheFile;
    const cleaned = cleanSemver(parsed?.version);
    if (!cleaned) return null;
    return {
      version: cleaned,
      fetchedAt: typeof parsed.fetchedAt === "number" ? parsed.fetchedAt : Date.now(),
      source: typeof parsed.source === "string" ? parsed.source : "file",
      expiresAt: typeof parsed.expiresAt === "number" ? parsed.expiresAt : Date.now() + VERSION_FILE_TTL_MS,
    };
  } catch {
    return null;
  }
}

function readObserverCacheFileSync(cachePath: string): VersionCacheFile | null {
  try {
    fs.accessSync(cachePath, fs.constants.F_OK);
  } catch {
    return null;
  }
  try {
    const text = fs.readFileSync(cachePath, "utf8");
    if (!text.trim()) return null;
    const parsed = JSON.parse(text) as VersionCacheFile;
    const cleaned = cleanSemver(parsed?.version);
    if (!cleaned) return null;
    return {
      version: cleaned,
      fetchedAt: typeof parsed.fetchedAt === "number" ? parsed.fetchedAt : Date.now(),
      source: typeof parsed.source === "string" ? parsed.source : "file",
      expiresAt: typeof parsed.expiresAt === "number" ? parsed.expiresAt : Date.now() + VERSION_FILE_TTL_MS,
    };
  } catch {
    return null;
  }
}

/**
 * Atomic observer cache write: mkdir dir, unique tmp file with mode 0600,
 * chmod hardening, rename over destination, tmp cleanup in finally.
 */
async function writeObserverCacheFileAtomic(cachePath: string, entry: VersionCacheFile): Promise<void> {
  const dir = path.dirname(cachePath);
  try {
    await fsp.mkdir(dir, { recursive: true, mode: OBSERVER_DIR_MODE });
  } catch {
    // best effort
  }
  try {
    await fsp.chmod(dir, OBSERVER_DIR_MODE);
  } catch {
    // ignore chmod failures on some filesystems
  }

  const content = JSON.stringify(entry, null, 2) + "\n";
  const rand = crypto.randomBytes(6).toString("hex");
  const tmp = path.join(dir, `.${path.basename(cachePath)}.${process.pid}.${rand}.tmp`);

  try {
    await fsp.writeFile(tmp, content, { encoding: "utf8", mode: OBSERVER_FILE_MODE });
    try {
      await fsp.chmod(tmp, OBSERVER_FILE_MODE);
    } catch {
      /* best effort */
    }
    await fsp.rename(tmp, cachePath);
    try {
      await fsp.chmod(cachePath, OBSERVER_FILE_MODE);
    } catch {
      /* best effort */
    }
  } finally {
    try {
      await fsp.unlink(tmp);
    } catch {
      /* temp already renamed */
    }
  }
}

// ---------------------------------------------------------------------------
// Section: Remote fetchers - legacy chain (manifests + changelog)
// ---------------------------------------------------------------------------

/** Chain tier 1a: auto-updater manifests (heterogeneous JSON shapes). */
async function fetchFromManifest(url: string): Promise<AntigravityVersionInfo | null> {
  try {
    const res = await fetchWithTimeout(url, { method: "GET" });
    if (!res.ok) return null;

    const text = await res.text();
    let json: any = null;
    try {
      json = JSON.parse(text);
    } catch {
      // Response may be plain text containing a version.
      const parsed = parseAntigravityVersion(text);
      if (parsed.normalized !== FALLBACK_VERSION || text.includes(".")) {
        const now = Date.now();
        return {
          version: parsed.normalized,
          fullVersion: parsed.full,
          source: url.includes("ide-auto-updater") ? "ide-updater" : "remote-manifest",
          fetchedAt: now,
          expiresAt: now + VERSION_CACHE_TTL_MS,
          url,
        };
      }
      return null;
    }

    const candidates: (string | undefined)[] = [
      json?.version,
      json?.latestVersion,
      json?.latest,
      json?.stable?.version,
      json?.manifest?.version,
      json?.manifests?.linux_amd64?.version,
      json?.manifests?.["linux/amd64"]?.version,
      json?.data?.version,
      json?.result?.version,
    ];

    if (Array.isArray(json?.manifests)) {
      for (const m of json.manifests) {
        if (m?.version) candidates.push(m.version);
      }
    }

    // Bounded deep scan looking for any version-looking string.
    if (candidates.every((c) => !c)) {
      const stack = [json];
      let depth = 0;
      while (stack.length && depth < 20) {
        const cur = stack.pop();
        depth++;
        if (cur && typeof cur === "object") {
          for (const v of Object.values(cur)) {
            if (typeof v === "string" && /^\d+\.\d+\.\d+-?\d*/.test(v)) {
              candidates.push(v);
              break;
            }
            if (v && typeof v === "object") stack.push(v);
          }
        }
        if (candidates.filter(Boolean).length) break;
      }
    }

    const rawVersion = candidates.find((c): c is string => !!c && typeof c === "string");
    if (!rawVersion) return null;

    const { normalized, full } = parseAntigravityVersion(rawVersion);
    if (!normalized) return null;

    const now = Date.now();
    return {
      version: normalized,
      fullVersion: full,
      source: url.includes("ide-auto-updater") ? "ide-updater" : "remote-manifest",
      fetchedAt: now,
      expiresAt: now + VERSION_CACHE_TTL_MS,
      url,
    };
  } catch {
    return null;
  }
}

/** Chain tier 2: changelog scrape (best-effort regex extraction). */
async function fetchFromChangelog(): Promise<AntigravityVersionInfo | null> {
  const versionRegex = /(?:antigravity[^0-9]{0,20}|version[^0-9]{0,10}|release[^0-9]{0,10})?(\d+\.\d+\.\d+(?:-\d+)?)/gi;
  const semverOnly = /(\d+\.\d+\.\d+)/g;

  for (const url of CHANGELOG_URLS) {
    try {
      const res = await fetchWithTimeout(url, { method: "GET" }, 5000);
      if (!res.ok) continue;
      const text = await res.text();
      if (!text || text.length < 10) continue;

      let match: RegExpExecArray | null;
      const found: string[] = [];
      while ((match = versionRegex.exec(text)) !== null) {
        if (match[1]) found.push(match[1]);
        if (found.length >= 10) break;
      }

      if (found.length === 0) {
        let m2: RegExpExecArray | null;
        while ((m2 = semverOnly.exec(text)) !== null) {
          if (m2 && m2[1]) {
            // Heuristic: skip tiny generic versions unless context matched.
            const parts = m2[1].split(".").map(Number);
            if ((parts[0] ?? 0) >= 1) found.push(m2[1]);
          }
          if (found.length >= 20) break;
        }
      }

      if (found.length === 0) continue;

      const raw = found[0] ?? "";
      const { normalized, full } = parseAntigravityVersion(raw);
      const now = Date.now();
      return {
        version: normalized,
        fullVersion: full.includes("-") ? full : `${normalized}-0000000000000000`,
        source: "changelog",
        fetchedAt: now,
        expiresAt: now + VERSION_CACHE_TTL_MS,
        url,
      };
    } catch {
      continue;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Section: Remote fetch - observer chain (npm / GitHub / GCS)
// ---------------------------------------------------------------------------

/** Independent timeout fetch used by the observer chain. */
async function fetchLatestWithTimeout(url: string, timeoutMs: number, userAgent: string): Promise<Response> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json, text/plain, */*",
        "User-Agent": userAgent,
      },
    });
    return res;
  } finally {
    clearTimeout(t);
  }
}

/**
 * Attempts to fetch the latest Antigravity version from the observer remote
 * chain. Each URL gets an independent AbortController timeout. Valid semver
 * results are stored in the memory Map and persisted atomically to disk.
 *
 * @param opts - optional overrides
 * @returns latest version string or null when every remote fails
 */
export async function fetchLatestVersion(opts: FetchOptions = {}): Promise<string | null> {
  const timeoutMs = opts.timeoutMs ?? VERSION_FETCH_TIMEOUT_MS;
  const remoteUrls = opts.remoteUrls ?? ANTIGRAVITY_VERSION_REMOTE_URLS;
  const cachePath = resolveObserverCachePath(opts.cachePath);
  const userAgent = opts.userAgent ?? `antigravity/${ANTIGRAVITY_VERSION_FALLBACK}`;

  // Memory fast path unless forced.
  if (!opts.force) {
    const mem = versionMemoryCache.get(MEMORY_CACHE_KEY);
    if (mem) {
      const cleaned = cleanSemver(mem.version);
      if (cleaned && Date.now() - mem.fetchedAt < VERSION_MEMORY_TTL_MS && isSupportedVersion(cleaned)) {
        return cleaned;
      }
    }
  }

  for (const url of remoteUrls) {
    try {
      const res = await fetchLatestWithTimeout(url, timeoutMs, userAgent);
      if (!res.ok) continue;

      let payload: unknown;
      const ct = res.headers.get("content-type") ?? "";
      if (ct.includes("application/json") || ct.includes("text/json")) {
        try {
          payload = await res.json();
        } catch {
          const txt = await res.text();
          try {
            payload = JSON.parse(txt);
          } catch {
            payload = { version: txt.trim() };
          }
        }
      } else {
        // Some GCS buckets serve text/plain versions.
        const txt = await res.text();
        const trimmed = txt.trim();
        try {
          payload = JSON.parse(trimmed);
        } catch {
          payload = { version: trimmed };
        }
      }

      const parsedVersion = parseVersionFromPayload(payload);
      if (!parsedVersion) continue;
      if (!isValidSemver(parsedVersion)) continue;
      if (isBlockedVersion(parsedVersion)) continue;

      // Success - populate both cache layers.
      const entry: CacheEntry = {
        version: parsedVersion,
        fetchedAt: Date.now(),
        source: url,
      };
      versionMemoryCache.set(MEMORY_CACHE_KEY, entry);

      const fileEntry: VersionCacheFile = {
        version: parsedVersion,
        fetchedAt: entry.fetchedAt,
        source: url,
        expiresAt: Date.now() + VERSION_FILE_TTL_MS,
      };
      // Fire-and-forget persistence; observer never throws on cache writes.
      try {
        await writeObserverCacheFileAtomic(cachePath, fileEntry);
      } catch {
        // swallow - memory cache already saved
      }

      return parsedVersion;
    } catch {
      // Per-URL failure swallowed - continue down the chain.
      continue;
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Section: Public API - legacy chain
// ---------------------------------------------------------------------------

/**
 * Legacy main fetcher - resilient chain:
 * 1. remote manifests (parallel, sequential consumption)
 * 2. changelog scrape
 * 3. expired disk cache as last resort before fallback
 * 4. hardcoded fallback 1.15.8
 *
 * Always resolves with an AntigravityVersionInfo (fallback guaranteed).
 */
export async function fetchAntigravityVersion(): Promise<AntigravityVersionInfo> {
  const manifestPromises = REMOTE_MANIFEST_URLS.map((url) => fetchFromManifest(url));

  for (const p of manifestPromises) {
    try {
      const result = await p;
      if (result && result.version) {
        memoryCache = result;
        await writeCacheFile(result);
        return result;
      }
    } catch {
      // continue chain
    }
  }

  try {
    const changelogResult = await fetchFromChangelog();
    if (changelogResult && changelogResult.version) {
      memoryCache = changelogResult;
      await writeCacheFile(changelogResult);
      return changelogResult;
    }
  } catch {
    // ignored
  }

  try {
    if (fs.existsSync(VERSION_CACHE_FILE)) {
      const raw = await fs.promises.readFile(VERSION_CACHE_FILE, "utf8");
      const parsed = JSON.parse(raw) as CachedFilePayload;
      if (parsed.version) {
        const now = Date.now();
        const reused: AntigravityVersionInfo = {
          ...parsed,
          fetchedAt: now,
          expiresAt: now + VERSION_CACHE_TTL_MS,
          source: "cache-file",
        };
        memoryCache = reused;
        return reused;
      }
    }
  } catch {
    // ignored
  }

  const now = Date.now();
  const fallback: AntigravityVersionInfo = {
    version: FALLBACK_VERSION,
    fullVersion: FALLBACK_FULL_VERSION,
    source: "hardcoded-fallback",
    fetchedAt: now,
    expiresAt: now + VERSION_CACHE_TTL_MS,
  };
  memoryCache = fallback;
  await writeCacheFile(fallback);
  return fallback;
}

/**
 * Legacy lazy getter - memory, then file, then fetch with promise dedup so
 * concurrent calls share one inflight request.
 */
export async function getVersionInfo(): Promise<AntigravityVersionInfo> {
  if (memoryCache && Date.now() < memoryCache.expiresAt) {
    return {
      ...memoryCache,
      source: memoryCache.source === "hardcoded-fallback" ? memoryCache.source : ("memory-cache" as VersionSource),
    };
  }

  if (inflightPromise) {
    return inflightPromise;
  }

  const fileCache = await readCacheFile();
  if (fileCache) {
    memoryCache = fileCache;
    return fileCache;
  }

  inflightPromise = fetchAntigravityVersion().finally(() => {
    inflightPromise = null;
  });

  return inflightPromise;
}

/**
 * Synchronous complete-info getter - cache when present, otherwise the
 * legacy fallback object (never touches the network).
 */
export function getVersionInfoSync(): AntigravityVersionInfo {
  if (memoryCache && Date.now() < memoryCache.expiresAt) {
    return memoryCache;
  }
  const file = readCacheFileSync();
  if (file) {
    memoryCache = file;
    return file;
  }
  const now = Date.now();
  return {
    version: FALLBACK_VERSION,
    fullVersion: FALLBACK_FULL_VERSION,
    source: "hardcoded-fallback",
    fetchedAt: now,
    expiresAt: now + VERSION_CACHE_TTL_MS,
  };
}

/** Invalidates both legacy caches (memory + disk). */
export async function invalidateVersionCache(): Promise<void> {
  memoryCache = null;
  inflightPromise = null;
  try {
    await fs.promises.unlink(VERSION_CACHE_FILE);
  } catch {
    // missing or no permission - ignored
  }
}

/** Invalidates only the legacy memory cache. */
export function invalidateMemoryCache(): void {
  memoryCache = null;
  inflightPromise = null;
}

// ---------------------------------------------------------------------------
// Section: Public API - merged getters (both behaviors preserved)
// ---------------------------------------------------------------------------

/**
 * Merged lazy getter supporting BOTH historical call shapes:
 *
 * - `getVersion()` - legacy behavior: resolves through manifests/changelog,
 *   caches 6h in memory + disk, never rejects.
 * - `getVersion({...})` - observer behavior: honors force/timeoutMs/
 *   remoteUrls/cachePath/userAgent/allowStale, gates results through
 *   isSupportedVersion/isBlockedVersion, persists atomically.
 *
 * Resolution order: observer memory Map -> legacy memory info ->
 * observer remote chain (npm/GitHub/GCS) -> legacy remote chain
 * (manifests/changelog, results rejected only when explicitly blocked or
 * merely the legacy hardcoded fallback) -> both file caches ->
 * governed fallback ANTIGRAVITY_VERSION_FALLBACK ("1.19.2").
 */
export async function getVersion(opts: GetVersionOptions = {}): Promise<string> {
  const force = opts.force === true;

  // 0a) observer memory cache
  if (!force) {
    const mem = versionMemoryCache.get(MEMORY_CACHE_KEY);
    if (mem) {
      const cleaned = cleanSemver(mem.version);
      if (cleaned && Date.now() - mem.fetchedAt < VERSION_MEMORY_TTL_MS && isSupportedVersion(cleaned)) {
        return cleaned;
      }
    }
    // 0b) legacy memory info cache
    if (memoryCache && Date.now() < memoryCache.expiresAt && !isBlockedVersion(memoryCache.version)) {
      return memoryCache.version;
    }
  }

  // 1) remote chains: observer first (gated), then legacy manifests/changelog.
  let resolved: string | null = null;
  try {
    const remote = await fetchLatestVersion(opts);
    if (remote && isSupportedVersion(remote)) {
      resolved = remote;
    }
  } catch {
    // swallowed - fall through
  }

  if (!resolved) {
    try {
      const legacy = await fetchAntigravityVersion();
      if (legacy && legacy.version && legacy.source !== "hardcoded-fallback" && !isBlockedVersion(legacy.version)) {
        resolved = legacy.version;
        versionMemoryCache.set(MEMORY_CACHE_KEY, {
          version: legacy.version,
          fetchedAt: legacy.fetchedAt,
          source: legacy.url ?? legacy.source,
        });
      }
    } catch {
      // swallowed - fall through
    }
  }

  if (resolved) return resolved;

  // 2) file caches: observer path (stale allowed by default) + legacy path.
  const allowStale = opts.allowStale ?? true;
  const observerPath = resolveObserverCachePath(opts.cachePath);

  try {
    const fileCache = await readObserverCacheFileAsync(observerPath);
    if (fileCache) {
      const fresh = Date.now() < fileCache.expiresAt;
      if (fresh || allowStale) {
        const cleaned = cleanSemver(fileCache.version);
        if (cleaned && isSupportedVersion(cleaned)) {
          versionMemoryCache.set(MEMORY_CACHE_KEY, {
            version: cleaned,
            fetchedAt: fileCache.fetchedAt,
            source: fileCache.source,
          });
          return cleaned;
        }
      }
    }
  } catch {
    // swallowed
  }

  try {
    const legacyFile = await readCacheFile();
    if (legacyFile && !isBlockedVersion(legacyFile.version)) {
      return legacyFile.version;
    }
  } catch {
    // swallowed
  }

  // 3) governed fallback - guaranteed valid semver.
  const fallback = ANTIGRAVITY_VERSION_FALLBACK;
  versionMemoryCache.set(MEMORY_CACHE_KEY, {
    version: fallback,
    fetchedAt: Date.now(),
    source: "fallback",
  });
  return fallback;
}

/**
 * Merged synchronous getter (no network). Supports both call shapes:
 * `getVersionSync()` (legacy) and `getVersionSync({cachePath,allowStale})`
 * (observer). Reads observer Map -> legacy memory -> observer file ->
 * legacy file -> governed fallback 1.19.2.
 */
export function getVersionSync(opts: { cachePath?: string; allowStale?: boolean } = {}): string {
  const allowStale = opts.allowStale ?? true;
  const observerPath = resolveObserverCachePath(opts.cachePath);

  const mem = versionMemoryCache.get(MEMORY_CACHE_KEY);
  if (mem) {
    const cleaned = cleanSemver(mem.version);
    if (cleaned && Date.now() - mem.fetchedAt < VERSION_MEMORY_TTL_MS && isSupportedVersion(cleaned)) {
      return cleaned;
    }
  }

  if (memoryCache && Date.now() < memoryCache.expiresAt && !isBlockedVersion(memoryCache.version)) {
    return memoryCache.version;
  }

  const fileCache = readObserverCacheFileSync(observerPath);
  if (fileCache) {
    const fresh = Date.now() < fileCache.expiresAt;
    if (fresh || allowStale) {
      const cleaned = cleanSemver(fileCache.version);
      if (cleaned && isSupportedVersion(cleaned)) {
        versionMemoryCache.set(MEMORY_CACHE_KEY, {
          version: cleaned,
          fetchedAt: fileCache.fetchedAt,
          source: fileCache.source,
        });
        return cleaned;
      }
    }
  }

  const legacyFile = readCacheFileSync();
  if (legacyFile && !isBlockedVersion(legacyFile.version)) {
    return legacyFile.version;
  }

  return ANTIGRAVITY_VERSION_FALLBACK;
}

// ---------------------------------------------------------------------------
// Section: Cache invalidation - observer chain
// ---------------------------------------------------------------------------

/**
 * Clears the observer memory entry and removes its cache file.
 * Use {@link invalidateVersionCache} for the legacy stores.
 */
export async function clearVersionCache(opts: { cachePath?: string } = {}): Promise<void> {
  versionMemoryCache.delete(MEMORY_CACHE_KEY);
  const cachePath = resolveObserverCachePath(opts.cachePath);
  try {
    await fsp.unlink(cachePath);
  } catch {
    // ignore missing
  }
}

/** Synchronous variant of {@link clearVersionCache}. */
export function clearVersionCacheSync(opts: { cachePath?: string } = {}): void {
  versionMemoryCache.delete(MEMORY_CACHE_KEY);
  const cachePath = resolveObserverCachePath(opts.cachePath);
  try {
    fs.unlinkSync(cachePath);
  } catch {
    // ignore missing
  }
}

// ---------------------------------------------------------------------------
// Section: User-Agent helpers
// ---------------------------------------------------------------------------

/**
 * Dynamic legacy UA varying platform (darwin/linux/win32) for coherent
 * bypass; embeds the fetched Antigravity version as a safe comment segment.
 */
// local variant: diverges from constants (async template-based GeminiCLI UA vs constants' sync antigravity/{ver} {os}/{arch} UA)
export async function getVersionedUserAgent(): Promise<string> {
  const platform = os.platform();
  const arch = os.arch();
  const key = `${platform}_${arch}` as keyof typeof ANTIGRAVITY_AUTH_CONSTANTS.USER_AGENT_TEMPLATES;
  const template =
    ANTIGRAVITY_AUTH_CONSTANTS.USER_AGENT_TEMPLATES[key] ||
    (platform === "darwin"
      ? ANTIGRAVITY_AUTH_CONSTANTS.USER_AGENT_TEMPLATES.darwin_arm64
      : ANTIGRAVITY_AUTH_CONSTANTS.USER_AGENT_TEMPLATES.linux_x64);

  const ver = await getVersion().catch(() => FALLBACK_VERSION);
  return template.replace("GitHub)", `GitHub; Antigravity/${ver})`);
}

/** Simple semver gt comparison retained from the legacy API. */
export function isNewerVersion(a: string, b: string): boolean {
  const toNums = (s: string) => (s.split("-")[0] ?? "").split(".").map((n) => parseInt(n, 10) || 0);
  const A = toNums(a);
  const B = toNums(b);
  for (let i = 0; i < Math.max(A.length, B.length); i++) {
    const av = A[i] || 0;
    const bv = B[i] || 0;
    if (av > bv) return true;
    if (av < bv) return false;
  }
  return false;
}

/**
 * Observer-style User-Agent for a given version:
 * `antigravity/{version} {platform}/{arch}` (coherent per host).
 * @param version - semver; falls back to ANTIGRAVITY_VERSION_FALLBACK
 */
export function getAntigravityUserAgent(version?: string): string {
  const ver = cleanSemver(version ?? "") ?? ANTIGRAVITY_VERSION_FALLBACK;
  const plat = os.platform();
  const arch = os.arch();
  return `antigravity/${ver} ${plat}/${arch}`;
}

/**
 * Async observer UA ensuring the latest version first. Pass cachedVersion to
 * avoid network round-trips.
 */
export async function getDynamicUserAgentVersioned(cachedVersion?: string, opts: FetchOptions = {}): Promise<string> {
  const ver = cachedVersion && isValidSemver(cachedVersion) ? cachedVersion : await getVersion(opts);
  return getAntigravityUserAgent(ver);
}

// ---------------------------------------------------------------------------
// Section: Barrels
// ---------------------------------------------------------------------------

/** Observer barrel export. */
export const Version = {
  fallback: ANTIGRAVITY_VERSION_FALLBACK,
  minSupported: ANTIGRAVITY_VERSION_MIN_SUPPORTED,
  blocked: ANTIGRAVITY_BLOCKED_VERSIONS,
  remoteUrls: ANTIGRAVITY_VERSION_REMOTE_URLS,
  timeoutMs: VERSION_FETCH_TIMEOUT_MS,
  memoryTtlMs: VERSION_MEMORY_TTL_MS,
  fileTtlMs: VERSION_FILE_TTL_MS,
  memoryCache: versionMemoryCache,
  isValidSemver,
  cleanSemver,
  compareSemver,
  shouldUpdate,
  isBlockedVersion,
  isSupportedVersion,
  parseVersionFromPayload,
  fetchLatestVersion,
  getVersion,
  getVersionSync,
  clearVersionCache,
  clearVersionCacheSync,
  getAntigravityUserAgent,
  getDynamicUserAgentVersioned,
} as const;

/** Default export - full merged module barrel (legacy + observer). */
const versionModule = {
  // Legacy surface
  REMOTE_MANIFEST_URLS,
  CHANGELOG_URLS,
  FALLBACK_VERSION,
  FALLBACK_FULL_VERSION,
  FALLBACK_ALTERNATIVE_VERSION,
  FALLBACK_ALTERNATIVE_FULL,
  VERSION_CACHE_FILE,
  VERSION_CACHE_TTL_MS,
  FETCH_TIMEOUT_MS,
  ANTIGRAVITY_AUTH_CONSTANTS,
  fetchAntigravityVersion,
  getVersion,
  getVersionInfo,
  getVersionSync,
  getVersionInfoSync,
  parseAntigravityVersion,
  fetchWithTimeout,
  readCacheFile,
  readCacheFileSync,
  writeCacheFile,
  invalidateVersionCache,
  invalidateMemoryCache,
  getVersionedUserAgent,
  isNewerVersion,
  // Observer surface
  ANTIGRAVITY_VERSION_FALLBACK,
  ANTIGRAVITY_VERSION_MIN_SUPPORTED,
  ANTIGRAVITY_BLOCKED_VERSIONS,
  ANTIGRAVITY_VERSION_REMOTE_URLS,
  VERSION_FETCH_TIMEOUT_MS,
  VERSION_MEMORY_TTL_MS,
  VERSION_FILE_TTL_MS,
  versionMemoryCache,
  isValidSemver,
  cleanSemver,
  compareSemver,
  shouldUpdate,
  isBlockedVersion,
  isSupportedVersion,
  parseVersionFromPayload,
  fetchLatestVersion,
  clearVersionCache,
  clearVersionCacheSync,
  getAntigravityUserAgent,
  getDynamicUserAgentVersioned,
  Version,
};

export default versionModule;
