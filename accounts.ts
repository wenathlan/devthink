/**
 * @fileoverview accounts.ts - Account Manager Core for maene
 * @module auth/accounts
 * @description
 *  Production-ready multi-account management for plugin maene.
 *  MERGED FILE - superset of every previous duplicate:
 *  - Multiple Google accounts with refresh token support
 *  - Storage at ~/.config/opencode/antigravity-accounts.json (chmod 600, atomic write)
 *  - Round-robin + sticky active account rotation
 *  - Double-checked locking for access token refresh
 *  - Quota/429 detection with automatic rotation
 *  - Background refresh of tokens close to expiry
 *  - Import from antigravity-manager (multiple legacy formats)
 *  - Official Gemini CLI bypass headers
 *  - Ported from the flat-file variant: legacy flat-file reader (Account[] format,
 *    type Account, AccountsFileV3 wrapper), QuotaInfo reporting type,
 *    QuotaExhaustedOptions, RefreshResult, ensureAccountsFile/loadAccountsSnapshot
 *    helpers and resolveAccountsPath/resolveConfigDir/
 *    resolveAntagravityManagerCandidates path resolvers.
 *
 *  Zero external dependencies: only node:* builtins + global fetch (Node 18+).
 *
 * @author ONDA 3 - Core Modules
 * @license MIT
 * @version 3.1.0
 */

import * as fs from "node:fs";
import * as fsp from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";
import * as crypto from "node:crypto";

// Deduplicated against the frozen owner (constants.ts) and the canonical
// in-set file (project.ts): symbols whose local definitions were value-identical
// are imported and re-exported below, so each has exactly one definition
// (library dedupe task 2-d1).
import {
  GEMINI_CLI_OAUTH_CLIENT_ID,
  GEMINI_CLI_OAUTH_CLIENT_SECRET,
  OAUTH_TOKEN_URL,
  PROJECT_FALLBACK,
  resolveOpenCodeBaseDir,
} from "./constants.js";
// v2.1.15 Phase B: the minimal Gemini CLI UA and the gl-node api-client
// snapshot come from the owners (constants.js / fingerprint.js).
import {
  GEMINI_CLI_USER_AGENT_MINIMAL as GEMINI_CLI_USER_AGENT,
  GEMINI_CLI_USER_AGENT as GEMINI_CLI_USER_AGENT_FULL,
} from "./constants.js";
import { X_GOOG_API_CLIENT_GEMINI_CLI as X_GOOG_API_CLIENT } from "./fingerprint.js";
import { resolveConfigDir as configResolveConfigDir } from "./config.js";
// v2.1.16 single-owner fix: the real antigravity-cli client pair is imported
// from auth.js (THE authentication owner — env-overridable, live-validated);
// the former local segment-assembled copies were byte-identical duplicates.
import { CLIENT_ID as AGCLI_CLIENT_ID_OWNER, CLIENT_SECRET as AGCLI_CLIENT_SECRET_OWNER } from "./maene-auth.js";
import {
  CLOUDCODE_BASE_URL,
  CLOUDCODE_ENDPOINTS,
  CLIENT_METADATA_STRING as CLIENT_METADATA,
  GEMINI_CLI_SCOPES,
  OAUTH_USERINFO_URL_V3,
} from "./constants.js";
import { GEMINI_CLI_SCOPES as OAUTH_SCOPES } from "./constants.js";

// Re-exports preserve this module's public surface after the dedupe.
export {
  GEMINI_CLI_OAUTH_CLIENT_ID,
  GEMINI_CLI_OAUTH_CLIENT_SECRET,
  OAUTH_TOKEN_URL,
  PROJECT_FALLBACK,
  GEMINI_CLI_USER_AGENT,
  GEMINI_CLI_USER_AGENT_FULL,
  X_GOOG_API_CLIENT,
};

// ============================================================================
// SECTION 00. HARDENED CONSTANTS - GEMINI CLI BYPASS
// ============================================================================

/** Official Gemini CLI OAuth2 Client ID - raw without suffix */
export const GEMINI_CLI_CLIENT_ID_RAW = "681255809395-oo8f…b135j" as const;

// GEMINI_CLI_OAUTH_CLIENT_ID / GEMINI_CLI_OAUTH_CLIENT_SECRET: identical to the
// constants.ts owner definitions — imported and re-exported above.

/**
 * Antigravity CLI OAuth client (`agy` binary) — the client maene presents for
 * NEW logins since 2.1.8. v2.1.16 single-owner fix: imported from auth.js
 * (THE authentication owner — env-overridable through
 * ANTIGRAVITY_CLIENT_ID / ANTIGRAVITY_CLIENT_SECRET); the former local
 * segment-assembled copy was a byte-identical duplicate.
 */
export const ANTIGRAVITY_CLI_OAUTH_CLIENT_ID: string = AGCLI_CLIENT_ID_OWNER;

/** Antigravity CLI client secret — alias of the auth.js owner (v2.1.16). */
export const ANTIGRAVITY_CLI_OAUTH_CLIENT_SECRET: string = AGCLI_CLIENT_SECRET_OWNER;

// local variant: diverges from constants (3-scope list vs constants' 8-scope GEMINI_CLI_SCOPES; the value matches constants' GEMINI_CLI_SCOPES under a different name)
// v2.1.15 Phase C: GEMINI_CLI_SCOPES (3-scope Gemini CLI set) is constants.js
// GEMINI_CLI_SCOPES — imported from the owner.

// v2.1.15 Phase C: the v3 userinfo URL moved to constants.js as
// OAUTH_USERINFO_URL_V3 (the v2 URL stays the canonical OAUTH_USERINFO_URL_V3).

/** Bypass headers - canonical values required by WAVE 3.
 * v2.1.16 single-owner fix: alias of constants.GEMINI_CLI_USER_AGENT (the
 * full live-validated UA string — byte-identical to the former local copy). */
// GEMINI_CLI_USER_AGENT / X_GOOG_API_CLIENT: static values identical to the
// canonical project.ts definitions — imported and re-exported above
// (constants.ts's same-named symbols are dynamic and therefore divergent).

// local variant: diverges from constants (static GEMINI plugin metadata string vs the dynamic buildClientMetadata() value)

// local variant: no same-named owner export (constants owns the individual endpoint paths and CODE_ASSIST_ENDPOINTS under other names)

// PROJECT_FALLBACK: identical "rising-fact-p41fc" — imported and re-exported above.

// v2.1.15 Phase A: MODELS_2026 (the 11-id legacy bypass list) and the
// Model2026 union moved to models.ts (MODELS_2026_LEGACY / Model2026) —
// imported under the historical name and re-exported so the public surface
// is unchanged.
import { MODELS_2026_LEGACY as MODELS_2026 } from "./models.js";
import type { Model2026 } from "./models.js";
export { MODELS_2026 };
export type { Model2026 };

// ============================================================================
// SECTION 01. CORE TYPES
// ============================================================================

export interface OAuthClientConfig {
  clientId: string;
  clientSecret: string;
}

export type OAuthClientKey = "gemini-cli" | "antigravity-manager" | "antigravity" | "custom" | string;

export interface AccountMetadataV3 {
  /** Normalized lower-case email */
  email: string;
  /** OAuth2 refresh token (long-lived) */
  refreshToken: string;
  /** Current access token (short-lived, 1h) */
  accessToken?: string | undefined;
  /** Epoch ms when accessToken expires */
  expiryDate?: number | undefined;
  /** Linked Cloud Project ID (or fallback) */
  projectId?: string | undefined;
  /** Whether the account is enabled for use */
  enabled: boolean;
  /** Identifying key of the OAuth client used */
  oauthClientKey: OAuthClientKey;
  /** Custom OAuth config, if oauthClientKey=custom */
  oauthClientConfig?: OAuthClientConfig | undefined;
  /** Epoch ms of last successful refresh */
  lastRefresh?: number | undefined;
  /** Epoch ms of record creation */
  createdAt: number;
  /** Epoch ms of last use (for LRU / rotation) */
  lastUsedAt?: number | undefined;
  /** Consecutive failure counter (quota, 401, etc) */
  failureCount?: number | undefined;
  /** Reason for temporary disablement */
  disabledReason?: string | undefined;
  /** Epoch ms until which the account stays disabled (cooldown) */
  disabledUntil?: number | undefined;
  /** Scopes this account holds (optional, for audit) */
  scopes?: string[] | undefined;
}

export interface AccountStore {
  /** Schema version - always 3 */
  version: 3;
  /** Account list */
  accounts: AccountMetadataV3[];
  /** Active email in sticky mode */
  activeEmail?: string | null;
  /** Round-robin rotation index */
  rotationIndex?: number;
  /** Selection strategy: round-robin (default) or sticky */
  rotationStrategy?: "round-robin" | "sticky";
  /** When the store was created */
  createdAt?: number | undefined;
  /** Last update */
  updatedAt?: number | undefined;
  /** Last error-driven rotation */
  lastRotationAt?: number | undefined;
  /** Email that caused the last rotation (for debug) */
  lastRotatedFrom?: string | undefined;
}

export type RotationStrategy = "round-robin" | "sticky";

export interface AddAccountInput {
  email: string;
  refreshToken: string;
  accessToken?: string;
  expiryDate?: number;
  projectId?: string;
  enabled?: boolean;
  oauthClientKey?: OAuthClientKey;
  oauthClientConfig?: OAuthClientConfig;
  scopes?: string[];
}

export interface ImportResult {
  imported: number;
  skipped: number;
  updated: number;
  errors: string[];
  sources: string[];
  accounts: AccountMetadataV3[];
}

export interface TokenRefreshResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope?: string;
  id_token?: string;
}

// ============================================================================
// SECTION 02. LEGACY FLAT-FILE COMPAT TYPES (ported from flat variant)
// ============================================================================

/**
 * Quota snapshot per account, mirrors v1internal:retrieveUserQuotaSummary
 * but kept lightweight in storage. Reporting-only type.
 */
export interface QuotaInfo {
  /** Remaining percentage or tokens, optional */
  remaining?: number;
  /** Limit */
  limit?: number;
  /** Reset timestamp ms */
  resetAt?: number;
  /** True when exhausted */
  exhausted?: boolean;
  /** Raw group mapped from model to group, e.g. antigravity, gemini-cli */
  group?: string;
  /** Last check ms */
  lastChecked?: number;
  /** Per-model counters when dual pool */
  pools?: Record<string, { remaining?: number; resetAt?: number }>;
}

/**
 * V3 legacy Account - flat storage format compatible with the
 * antigravity-manager flat export {email, refresh_token}.
 */
export interface Account {
  /** Unique email, lowercased */
  email: string;
  /** Google OAuth refresh token (1//...) */
  refreshToken: string;
  /** Cached bearer access token */
  accessToken?: string | undefined;
  /** Expiry epoch ms (Date.now() + expires_in*1000) */
  expiry?: number | undefined;
  /** Cloud project id resolved via loadCodeAssist / onboardUser */
  projectId?: string | undefined;
  /** Soft disabled flag - user can toggle */
  disabled?: boolean | undefined;
  /** Quota exhausted until epoch ms - skip in rotation */
  quotaExhaustedUntil?: number | undefined;
  /** Last usage epoch ms */
  lastUsed?: number | undefined;
  /** Creation epoch ms */
  createdAt?: number | undefined;
  /** Update epoch ms */
  updatedAt?: number | undefined;
  /** Cached quota snapshot */
  quota?: QuotaInfo | undefined;
  /** Optional stable id (uuid) */
  id?: string | undefined;
  /** Account pool type */
  type?: "antigravity" | "gemini-cli" | "auto" | string | undefined;
  /** Display name from userinfo */
  displayName?: string | undefined;
  /** Optional metadata - not persisted critically */
  metadata?: Record<string, unknown> | undefined;
}

/** Flat file wrapper - versioned for forward migration */
export interface AccountsFileV3 {
  version: 3;
  accounts: Account[];
  lastRotationIndex?: number;
  lastStickyEmail?: string | null;
  updatedAt?: number;
  /** Optional fallback project cache */
  fallbackProjectId?: string;
}

/** Result of a token refresh in flat shape */
export interface RefreshResult {
  accessToken: string;
  /** Expiry epoch ms */
  expiry: number;
  projectId?: string;
  raw?: Record<string, unknown>;
}

/** Options for marking quota exhaustion */
export interface QuotaExhaustedOptions {
  durationMs?: number;
  reason?: string;
  group?: string;
  model?: string;
}

// ============================================================================
// SECTION 03. PATH & FS HELPERS - PRODUCTION-READY
// ============================================================================

// resolveOpenCodeBaseDir: identical to the constants.ts owner definition — imported above.

/**
 * Resolves the config directory honoring OPENCODE_CONFIG_DIR env fallback.
 * Pure resolver - no side effects here.
 */
// v2.1.15 Phase C: resolveConfigDir moved to config.js (configuration
// management owner) — re-exported below for the module surface.
import { resolveConfigDir } from "./config.js";
export { resolveConfigDir };

export function resolveAccountsFilePath(customDir?: string): string {
  if (customDir) {
    return path.join(path.resolve(customDir), "antigravity-accounts.json");
  }
  const base = resolveOpenCodeBaseDir();
  return path.join(base, "antigravity-accounts.json");
}

/**
 * Resolves the full accounts file path.
 * When custom is provided it is treated as a complete file path override;
 * otherwise resolves to <configDir>/antigravity-accounts.json.
 */
export function resolveAccountsPath(custom?: string): string {
  if (custom && custom.trim().length > 0) return path.resolve(custom);
  const dir = resolveConfigDir();
  return path.join(dir, "antigravity-accounts.json");
}

/**
 * Candidate paths for antigravity-manager import.
 * Honors ANTIGRAVITY_MANAGER_ACCOUNTS_PATH env override and Windows AppData.
 */
export function resolveAntagravityManagerCandidates(): string[] {
  const home = os.homedir();
  const custom = process.env.ANTIGRAVITY_MANAGER_ACCOUNTS_PATH?.trim();
  const list: string[] = [];
  if (custom) list.push(path.resolve(custom));
  list.push(
    path.join(home, ".config", "antigravity-manager", "accounts.json"),
    path.join(home, ".config", "antigravity-manager", "credentials.json"),
    path.join(home, ".antigravity-manager", "accounts.json"),
    path.join(home, ".antigravity-manager", "credentials.json"),
    path.join(home, "Library", "Application Support", "antigravity-manager", "accounts.json"),
    path.join(home, ".config", "zerogravity", "accounts.json"),
    path.join(home, ".config", "opencode", "antigravity-accounts.json.bak"),
  );
  // Windows AppData
  if (process.env.APPDATA) {
    list.push(
      path.join(process.env.APPDATA, "antigravity-manager", "accounts.json"),
      path.join(process.env.APPDATA, "antigravity-manager", "credentials.json"),
    );
  }
  return list;
}

function ensureDirExists(dir: string): void {
  try {
    fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  } catch {
    // best effort - ignore if it already exists
  }
  // Guarantee permission 0700 even if it already existed
  try {
    fs.chmodSync(dir, 0o700);
  } catch {
    // may fail on some filesystems / containers
  }
}

/**
 * Ensures dir exists asynchronously, tolerant to races.
 */
async function ensureDirExistsAsync(dir: string): Promise<void> {
  try {
    await fsp.mkdir(dir, { recursive: true });
  } catch {
    // best effort chmod even if it exists
    try {
      await fsp.chmod(dir, 0o755);
    } catch {
      // ignore
    }
  }
}

/**
 * Atomic write with chmod 600
 * - Writes to a temp file in the same directory
 * - chmod 600
 * - Atomic rename
 */
function atomicWriteFileJson(filePath: string, data: string): void {
  const dir = path.dirname(filePath);
  ensureDirExists(dir);

  const tmpSuffix = crypto.randomBytes(6).toString("hex");
  const tmpPath = `${filePath}.tmp.${process.pid}.${tmpSuffix}`;

  try {
    // Write temp with restrictive mode
    fs.writeFileSync(tmpPath, data, { encoding: "utf8", mode: 0o600 });
    try {
      fs.chmodSync(tmpPath, 0o600);
    } catch {
      // ignore
    }
    // Atomic rename (same filesystem)
    fs.renameSync(tmpPath, filePath);
    try {
      fs.chmodSync(filePath, 0o600);
    } catch {
      // ignore
    }
  } finally {
    // Best-effort cleanup of temp if it failed before rename
    try {
      if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
    } catch {
      // ignore
    }
  }
}

/**
 * Async atomic write: temp + rename + chmod 600.
 * Observer-safe - no partial file exposure.
 */
async function atomicWriteFileJsonAsync(targetPath: string, data: string): Promise<void> {
  const dir = path.dirname(targetPath);
  await ensureDirExistsAsync(dir);

  const rand = crypto.randomBytes(6).toString("hex");
  const tmpName = `.antigravity-accounts.tmp-${process.pid}-${rand}.json`;
  const tmpPath = path.join(dir, tmpName);

  // Write temp
  await fsp.writeFile(tmpPath, data, { encoding: "utf8", mode: 0o600 });
  try {
    await fsp.chmod(tmpPath, 0o600);
  } catch {
    // ignore on windows
  }
  // Atomic rename
  await fsp.rename(tmpPath, targetPath);
  try {
    await fsp.chmod(targetPath, 0o600);
  } catch {
    // windows may not support chmod 600
  }
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string): boolean {
  // Linear-time validation (regex-free; the former /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  // had nested quantifiers and was flagged as ReDoS-prone on uncontrolled input).
  if (email.length === 0 || /\s/.test(email)) return false;
  const at = email.indexOf("@");
  if (at <= 0 || email.indexOf("@", at + 1) !== -1) return false;
  const domain = email.slice(at + 1);
  const dot = domain.lastIndexOf(".");
  return dot > 0 && dot < domain.length - 1;
}

function nowMs(): number {
  return Date.now();
}

function buildDefaultStore(): AccountStore {
  const t = nowMs();
  return {
    version: 3,
    accounts: [],
    activeEmail: null,
    rotationIndex: 0,
    rotationStrategy: "round-robin",
    createdAt: t,
    updatedAt: t,
  };
}

function sanitizeStore(raw: unknown): AccountStore {
  const def = buildDefaultStore();

  if (!raw || typeof raw !== "object") return def;

  const obj = raw as Record<string, unknown>;

  // Supports old versions without version field or with version 1/2
  const accountsRaw = Array.isArray(obj.accounts) ? obj.accounts : [];
  const accounts: AccountMetadataV3[] = [];

  for (const a of accountsRaw) {
    const normalized = normalizeAccountRaw(a);
    if (normalized) accounts.push(normalized);
  }

  // Also supports legacy format where root is an array
  if (accounts.length === 0 && Array.isArray(raw)) {
    for (const a of raw as unknown[]) {
      const n = normalizeAccountRaw(a);
      if (n) accounts.push(n);
    }
  }

  const activeEmail = typeof obj.activeEmail === "string" ? normalizeEmail(obj.activeEmail) : null;

  const rotIdx =
    typeof obj.rotationIndex === "number" && Number.isFinite(obj.rotationIndex)
      ? Math.max(0, Math.floor(obj.rotationIndex))
      : 0;

  const rotationStrategy =
    obj.rotationStrategy === "sticky" || obj.rotationStrategy === "round-robin" ? obj.rotationStrategy : "round-robin";

  return {
    version: 3,
    accounts,
    activeEmail,
    rotationIndex: rotIdx % Math.max(1, accounts.length || 1),
    rotationStrategy,
    createdAt: typeof obj.createdAt === "number" ? obj.createdAt : def.createdAt,
    updatedAt: nowMs(),
    lastRotationAt: typeof obj.lastRotationAt === "number" ? obj.lastRotationAt : undefined,
    lastRotatedFrom: typeof obj.lastRotatedFrom === "string" ? obj.lastRotatedFrom : undefined,
  };
}

function normalizeAccountRaw(raw: unknown): AccountMetadataV3 | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;

  const emailRaw =
    (r.email as string) ?? (r.user_email as string) ?? (r.userEmail as string) ?? (r.account as string) ?? "";

  if (typeof emailRaw !== "string" || !isValidEmail(emailRaw)) return null;
  const email = normalizeEmail(emailRaw);

  const refreshTokenRaw =
    (r.refreshToken as string) ??
    (r.refresh_token as string) ??
    (r.refresh as string) ??
    (r.token as any)?.refresh_token ??
    (r.tokens as any)?.refresh_token ??
    "";

  if (typeof refreshTokenRaw !== "string" || refreshTokenRaw.length < 10) return null;

  const accessToken =
    typeof r.accessToken === "string"
      ? (r.accessToken as string)
      : typeof r.access_token === "string"
        ? (r.access_token as string)
        : ((r.token as any)?.access_token ?? undefined);

  let expiryDate: number | undefined;
  if (typeof r.expiryDate === "number") expiryDate = r.expiryDate;
  else if (typeof r.expiry_date === "number") expiryDate = r.expiry_date;
  else if (typeof r.expiryDate === "string") {
    const n = Number(r.expiryDate);
    if (Number.isFinite(n)) expiryDate = n;
  } else if (typeof r.expires_at === "number") {
    // May be seconds or ms - heuristic
    expiryDate = r.expires_at > 1e12 ? r.expires_at : r.expires_at * 1000;
  } else if ((r.token as any)?.expiry_date) {
    expiryDate = (r.token as any).expiry_date;
  } else if (typeof r.expires_in === "number") {
    // If expires_in exists but no expiry, compute from lastRefresh or now
    const base = typeof r.lastRefresh === "number" ? r.lastRefresh : nowMs();
    expiryDate = base + r.expires_in * 1000;
  }

  const projectId =
    (r.projectId as string) ??
    (r.project_id as string) ??
    (r.cloudaicompanionProject as string) ??
    (r.project as string) ??
    PROJECT_FALLBACK;

  const enabled = typeof r.enabled === "boolean" ? r.enabled : true;

  const oauthClientKey: OAuthClientKey =
    typeof r.oauthClientKey === "string"
      ? (r.oauthClientKey as string)
      : typeof r.oauth_client_key === "string"
        ? (r.oauth_client_key as string)
        : "gemini-cli";

  let oauthClientConfig: OAuthClientConfig | undefined;
  if (r.oauthClientConfig && typeof r.oauthClientConfig === "object") {
    const cfg = r.oauthClientConfig as Record<string, unknown>;
    if (typeof cfg.clientId === "string" && typeof cfg.clientSecret === "string") {
      oauthClientConfig = {
        clientId: cfg.clientId,
        clientSecret: cfg.clientSecret,
      };
    }
  }

  const lastRefresh =
    typeof r.lastRefresh === "number" ? r.lastRefresh : typeof r.last_refresh === "number" ? r.last_refresh : undefined;

  const createdAt =
    typeof r.createdAt === "number" ? r.createdAt : typeof r.created_at === "number" ? r.created_at : nowMs();

  const lastUsedAt = typeof r.lastUsedAt === "number" ? r.lastUsedAt : undefined;

  const failureCount = typeof r.failureCount === "number" ? Math.max(0, r.failureCount) : 0;

  const disabledReason = typeof r.disabledReason === "string" ? r.disabledReason : undefined;

  const disabledUntil = typeof r.disabledUntil === "number" ? r.disabledUntil : undefined;

  const scopes = Array.isArray(r.scopes) ? (r.scopes as string[]).filter((s) => typeof s === "string") : undefined;

  return {
    email,
    refreshToken: refreshTokenRaw,
    accessToken: typeof accessToken === "string" ? accessToken : undefined,
    expiryDate,
    projectId: typeof projectId === "string" ? projectId : PROJECT_FALLBACK,
    enabled,
    oauthClientKey,
    oauthClientConfig,
    lastRefresh,
    createdAt,
    lastUsedAt,
    failureCount,
    disabledReason,
    disabledUntil,
    scopes,
  };
}

// ============================================================================
// SECTION 04. LEGACY FLAT-FILE READER (Account[] format)
// Parses legacy file shapes into normalized Account arrays.
// ============================================================================

/** Legacy shapes tolerated by the flat-file reader */
type LegacyFlatFile =
  | AccountsFileV3
  | { accounts: Account[] }
  | { accounts: Record<string, Account> }
  | Account[]
  | { version?: number; [k: string]: unknown };

/**
 * Sanitizes a flat-format account for persistence -
 * strips undefined, normalizes email.
 */
function sanitizeLegacyAccount(acc: Account): Account {
  const now = Date.now();
  const email = acc.email.toLowerCase().trim();
  return {
    email,
    refreshToken: acc.refreshToken.trim(),
    accessToken: acc.accessToken?.trim() || undefined,
    expiry: acc.expiry,
    projectId: acc.projectId?.trim() || PROJECT_FALLBACK,
    disabled: !!acc.disabled,
    quotaExhaustedUntil: acc.quotaExhaustedUntil,
    lastUsed: acc.lastUsed,
    createdAt: acc.createdAt ?? now,
    updatedAt: now,
    quota: acc.quota,
    id: acc.id ?? crypto.randomUUID?.() ?? `${email}-${now}`,
    type: acc.type ?? "antigravity",
    displayName: acc.displayName,
    metadata: acc.metadata,
  };
}

/**
 * Legacy flat-file reader.
 * Tolerates: flat array (antigravity-manager export), AccountsFileV3 wrapper,
 * {accounts: [...]} array, {accounts: {email: {...}}} map and
 * single-account object forms. Returns normalized Account[] plus
 * rotation metadata when present.
 */
function parseLegacyAccounts(raw: unknown): { accounts: Account[]; rotationIndex: number; stickyEmail: string | null } {
  const now = Date.now();
  let accounts: Account[] = [];
  let rotationIndex = 0;
  let stickyEmail: string | null = null;

  if (!raw) return { accounts, rotationIndex, stickyEmail };

  // Flat array - antigravity-manager export
  if (Array.isArray(raw)) {
    accounts = raw
      .map((item: any) => {
        if (!item) return null;
        const email = (item.email ?? item.email_address ?? item.id ?? "").toString().toLowerCase().trim();
        const rt = (item.refresh_token ?? item.refreshToken ?? item.refreshTokenEncrypted ?? "").toString().trim();
        if (!email || !rt) return null;
        const acc: Account = {
          email,
          refreshToken: rt,
          accessToken: item.access_token ?? item.accessToken,
          expiry: item.expiry ?? item.expires_at ?? undefined,
          projectId: item.projectId ?? item.project_id ?? PROJECT_FALLBACK,
          disabled: !!item.disabled,
          createdAt: item.createdAt ?? now,
          updatedAt: now,
          id: item.id ?? crypto.randomUUID?.() ?? `${email}-${now}`,
          type: item.type ?? "antigravity",
        };
        // Normalize expiry if seconds
        if (acc.expiry && acc.expiry < 1e12) {
          // seconds -> ms if it looks like seconds
          if (acc.expiry > 1e9 && acc.expiry < 1e12) acc.expiry = acc.expiry * 1000;
        }
        return acc;
      })
      .filter(Boolean) as Account[];
    return { accounts, rotationIndex, stickyEmail };
  }

  if (typeof raw === "object") {
    const obj = raw as any;
    // AccountsFileV3 / {accounts: [...]}
    if (Array.isArray(obj.accounts)) {
      accounts = obj.accounts
        .map((a: any) => {
          if (!a?.email || (!a?.refreshToken && !a?.refresh_token)) return null;
          const email = a.email.toString().toLowerCase().trim();
          const rt = (a.refreshToken ?? a.refresh_token ?? "").toString().trim();
          if (!email || !rt) return null;
          return {
            ...a,
            email,
            refreshToken: rt,
            id: a.id ?? crypto.randomUUID?.() ?? `${email}-${now}`,
            createdAt: a.createdAt ?? now,
            updatedAt: a.updatedAt ?? now,
          } as Account;
        })
        .filter(Boolean) as Account[];
      rotationIndex = Number.isFinite(obj.lastRotationIndex) ? obj.lastRotationIndex : 0;
      stickyEmail = obj.lastStickyEmail ?? null;
      return { accounts, rotationIndex, stickyEmail };
    }
    // Map form {accounts: {email: {...}}}
    if (obj.accounts && typeof obj.accounts === "object" && !Array.isArray(obj.accounts)) {
      const map = obj.accounts as Record<string, any>;
      accounts = Object.entries(map)
        .map(([emailKey, val]: [string, any]) => {
          const email = (val?.email ?? emailKey).toString().toLowerCase().trim();
          const rt = (val?.refreshToken ?? val?.refresh_token ?? "").toString().trim();
          if (!email || !rt) return null;
          return {
            email,
            refreshToken: rt,
            accessToken: val.accessToken ?? val.access_token,
            expiry: val.expiry,
            projectId: val.projectId ?? PROJECT_FALLBACK,
            disabled: !!val.disabled,
            createdAt: val.createdAt ?? now,
            updatedAt: now,
            id: val.id ?? crypto.randomUUID?.() ?? `${email}-${now}`,
            type: val.type ?? "antigravity",
          } as Account;
        })
        .filter(Boolean) as Account[];
      return { accounts, rotationIndex, stickyEmail };
    }
    // Single account object?
    if (obj.email && (obj.refreshToken || obj.refresh_token)) {
      const email = obj.email.toString().toLowerCase().trim();
      const rt = (obj.refreshToken ?? obj.refresh_token).toString().trim();
      if (email && rt) {
        accounts = [
          {
            email,
            refreshToken: rt,
            accessToken: obj.accessToken,
            expiry: obj.expiry,
            projectId: obj.projectId,
            createdAt: now,
            updatedAt: now,
            id: crypto.randomUUID?.() ?? `${email}-${now}`,
          },
        ];
      }
    }
  }

  return { accounts, rotationIndex, stickyEmail };
}

/**
 * Helper to ensure the accounts file exists with safe perms, idempotent.
 * Creates an empty AccountsFileV3 payload when missing.
 *
 * @param filePath optional full file path override
 * @returns resolved file path
 */
export async function ensureAccountsFile(filePath?: string): Promise<string> {
  const fp = resolveAccountsPath(filePath);
  await ensureDirExistsAsync(path.dirname(fp));
  try {
    await fsp.access(fp, fs.constants.F_OK);
    try {
      await fsp.chmod(fp, 0o600);
    } catch { /* the guarded best-effort operation falls through: the outer flow owns the failure */ }
  } catch {
    // Create empty v3 file
    const empty: AccountsFileV3 = {
      version: 3,
      accounts: [],
      lastRotationIndex: 0,
      lastStickyEmail: null,
      updatedAt: Date.now(),
      fallbackProjectId: PROJECT_FALLBACK,
    };
    await atomicWriteFileJsonAsync(fp, JSON.stringify(empty, null, 2));
  }
  return fp;
}

/**
 * Quick utility - reads accounts without a manager instance.
 * Uses the legacy flat-file reader, tolerant to every historical shape.
 *
 * @param filePath optional full file path override
 * @returns sanitized Account[] snapshot (empty on missing/corrupt file)
 */
export async function loadAccountsSnapshot(filePath?: string): Promise<Account[]> {
  const fp = resolveAccountsPath(filePath);
  try {
    const content = await fsp.readFile(fp, "utf8");
    const { accounts } = parseLegacyAccounts(JSON.parse(content));
    return accounts.map(sanitizeLegacyAccount);
  } catch {
    return [];
  }
}

// ============================================================================
// SECTION 05. OAUTH REFRESH - BARE FETCH WITH BYPASS HEADERS
// ============================================================================

const REFRESH_BUFFER_MS = 5 * 60 * 1000; // 5 min
const BACKGROUND_REFRESH_BUFFER_MS = 10 * 60 * 1000; // 10 min

function buildTokenRefreshHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/x-www-form-urlencoded",
    "User-Agent": GEMINI_CLI_USER_AGENT_FULL,
    "X-Goog-Api-Client": X_GOOG_API_CLIENT,
    "Client-Metadata": CLIENT_METADATA,
    Accept: "application/json",
  };
}

function resolveOAuthClientForAccount(acct: AccountMetadataV3): OAuthClientConfig {
  if (acct.oauthClientConfig?.clientId && acct.oauthClientConfig?.clientSecret) {
    return acct.oauthClientConfig;
  }
  // Antigravity CLI client (default for logins since 2.1.8)
  if (acct.oauthClientKey === "antigravity-cli") {
    return {
      clientId: ANTIGRAVITY_CLI_OAUTH_CLIENT_ID,
      clientSecret: ANTIGRAVITY_CLI_OAUTH_CLIENT_SECRET,
    };
  }
  // Hardened default Gemini CLI
  return {
    clientId: GEMINI_CLI_OAUTH_CLIENT_ID,
    clientSecret: GEMINI_CLI_OAUTH_CLIENT_SECRET,
  };
}

async function performTokenRefresh(acct: AccountMetadataV3): Promise<TokenRefreshResponse> {
  const client = resolveOAuthClientForAccount(acct);

  const body = new URLSearchParams({
    client_id: client.clientId,
    client_secret: client.clientSecret,
    refresh_token: acct.refreshToken,
    grant_type: "refresh_token",
  });

  const headers = buildTokenRefreshHeaders();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const res = await fetch(OAUTH_TOKEN_URL, {
      method: "POST",
      headers,
      body: body.toString(),
      signal: controller.signal,
    });

    const text = await res.text();
    let json: any;
    try {
      json = JSON.parse(text);
    } catch {
      json = { raw: text };
    }

    if (!res.ok) {
      const err: any = new Error(
        `Token refresh failed for ${acct.email}: ${res.status} ${json.error_description || json.error || text.slice(0, 500)}`,
      );
      err.status = res.status;
      err.code = json.error;
      err.response = json;
      err.email = acct.email;
      throw err;
    }

    if (!json.access_token || typeof json.expires_in !== "number") {
      throw new Error(`Invalid token response for ${acct.email}: missing access_token/expires_in`);
    }

    return json as TokenRefreshResponse;
  } finally {
    clearTimeout(timeout);
  }
}

function isTokenExpired(acct: AccountMetadataV3, bufferMs = REFRESH_BUFFER_MS): boolean {
  if (!acct.accessToken) return true;
  if (!acct.expiryDate) return true;
  return acct.expiryDate <= nowMs() + bufferMs;
}

// ============================================================================
// SECTION 06. QUOTA / 429 DETECTION
// ============================================================================

const QUOTA_ERROR_PATTERNS = [
  /quota/i,
  /rate limit/i,
  /rate_limit/i,
  /too many requests/i,
  /429/,
  /resource_exhausted/i,
  /RESOURCE_EXHAUSTED/,
  /quota_exceeded/i,
  /QUOTA_EXCEEDED/,
  /user_rate_limit/i,
  /Request throttled/i,
  /billing/i, // sometimes quota comes with billing
];

export function isQuotaError(err: unknown): boolean {
  if (!err) return false;

  // Direct number
  if (typeof err === "number") return err === 429;

  const asAny = err as any;

  // status / code fields
  const status =
    asAny.status ??
    asAny.statusCode ??
    asAny.code ??
    (asAny.response && (asAny.response.status || asAny.response.statusCode));

  if (status === 429) return true;
  if (status === 403 || status === "403") {
    // 403 may be quota, check message
    const msg = (
      asAny.message ||
      asAny.error_description ||
      asAny.error ||
      JSON.stringify(asAny.response || asAny) ||
      ""
    ).toString();
    if (QUOTA_ERROR_PATTERNS.some((re) => re.test(msg))) return true;
    // For generic 403 on Code Assist we treat it as quota only when endpoint is generate*
    // Conservative: only if it mentions quota
    return false;
  }

  const message = (
    asAny.message ||
    asAny.error ||
    asAny.error_description ||
    (typeof err === "string" ? err : "") ||
    JSON.stringify(asAny).slice(0, 2000)
  )
    .toString()
    .toLowerCase();

  return QUOTA_ERROR_PATTERNS.some((re) => re.test(message));
}

function parseErrorStatus(err: unknown): number | undefined {
  if (!err) return undefined;
  const a = err as any;
  return (
    a.status ?? a.statusCode ?? a.code ?? (a.response && (a.response.status || a.response.statusCode)) ?? undefined
  );
}

// ============================================================================
// SECTION 07. AccountManager CLASS
// ============================================================================

export interface AccountManagerOptions {
  /** Override of the base directory (default ~/.config/opencode) */
  configDir?: string;
  /** File name (default antigravity-accounts.json) */
  fileName?: string;
  /** Default strategy if store does not have one */
  rotationStrategy?: RotationStrategy;
  /** Custom full path (takes precedence over configDir+fileName) */
  filePath?: string;
  /** Optional logger */
  logger?: {
    info?: (msg: string, ...args: any[]) => void;
    warn?: (msg: string, ...args: any[]) => void;
    error?: (msg: string, ...args: any[]) => void;
    debug?: (msg: string, ...args: any[]) => void;
  };
  /** Disables background auto-refresh timer */
  disableBackgroundTimer?: boolean;
}

export class AccountManager {
  private readonly storePath: string;
  private store: AccountStore;
  private rotationIdx: number;
  private readonly refreshLocks = new Map<string, Promise<AccountMetadataV3>>();
  private backgroundTimer?: NodeJS.Timeout | undefined;
  private readonly logger: AccountManagerOptions["logger"];
  private readonly options: AccountManagerOptions;

  constructor(opts: AccountManagerOptions = {}) {
    this.options = opts;
    this.logger = opts.logger ?? {};

    if (opts.filePath) {
      this.storePath = path.resolve(opts.filePath);
    } else {
      const baseDir = opts.configDir ? path.resolve(opts.configDir) : resolveOpenCodeBaseDir();
      const fileName = opts.fileName ?? "antigravity-accounts.json";
      this.storePath = path.join(baseDir, fileName);
    }

    this.store = this.loadAccounts();
    this.rotationIdx = this.store.rotationIndex ?? 0;

    // Auto background timer if enabled (every 5 min)
    if (!opts.disableBackgroundTimer) {
      // unref so it does not block exit
      this.backgroundTimer = setInterval(
        () => {
          this.backgroundRefresh().catch((e) => {
            this.logger?.warn?.(`[accounts] backgroundRefresh failed: ${(e as Error).message}`);
          });
        },
        5 * 60 * 1000,
      );
      if (this.backgroundTimer && typeof (this.backgroundTimer as any).unref === "function") {
        (this.backgroundTimer as any).unref();
      }
    }
  }

  // --------------------------------------------------------------------------
  // STORAGE - loadAccounts / saveAccounts (atomic chmod 600)
  // --------------------------------------------------------------------------

  /**
   * Loads accounts from ~/.config/opencode/antigravity-accounts.json
   * - Creates the file if missing with default store
   * - chmod 600 on every read/write
   * - Sanitizes schema V3
   */
  loadAccounts(): AccountStore {
    let rawContent: string | null = null;

    try {
      // Ensure dir exists before trying to read
      ensureDirExists(path.dirname(this.storePath));

      if (!fs.existsSync(this.storePath)) {
        const def = buildDefaultStore();
        if (this.options.rotationStrategy) {
          def.rotationStrategy = this.options.rotationStrategy;
        }
        this.store = def;
        this.saveAccounts(); // creates initial file with 600
        this.logger?.info?.(`[accounts] created new store at ${this.storePath}`);
        return { ...def };
      }

      // chmod 600 even on read (hardening)
      try {
        fs.chmodSync(this.storePath, 0o600);
      } catch {
        // ignore
      }

      rawContent = fs.readFileSync(this.storePath, { encoding: "utf8" });
    } catch (err) {
      this.logger?.warn?.(
        `[accounts] failed to read store at ${this.storePath}: ${(err as Error).message}, using default`,
      );
      const def = buildDefaultStore();
      this.store = def;
      return { ...def };
    }

    try {
      const parsed = rawContent ? JSON.parse(rawContent) : null;
      const sanitized = sanitizeStore(parsed);
      if (this.options.rotationStrategy && !parsed?.rotationStrategy) {
        sanitized.rotationStrategy = this.options.rotationStrategy;
      }
      // Normalize rotation index against current size
      const len = Math.max(1, sanitized.accounts.length);
      sanitized.rotationIndex = (sanitized.rotationIndex ?? 0) % len;

      this.store = sanitized;
      this.rotationIdx = sanitized.rotationIndex ?? 0;
      return { ...sanitized, accounts: [...sanitized.accounts] };
    } catch (err) {
      this.logger?.warn?.(`[accounts] invalid JSON at ${this.storePath}: ${(err as Error).message}, returning default`);
      const def = buildDefaultStore();
      this.store = def;
      return { ...def };
    }
  }

  /**
   * Saves store to disk atomically with chmod 600
   */
  saveAccounts(): void {
    const toSave: AccountStore = {
      ...this.store,
      version: 3,
      rotationIndex: this.rotationIdx,
      updatedAt: nowMs(),
    };

    // Sanitize again before saving (removes undefined extras)
    const cleanAccounts = toSave.accounts.map((a) => {
      // Remove undefined fields for clean JSON
      const copy: Record<string, unknown> = { ...a };
      Object.keys(copy).forEach((k) => {
        if (copy[k] === undefined) delete copy[k];
      });
      return copy as unknown as AccountMetadataV3;
    });

    const payload: AccountStore = {
      ...toSave,
      accounts: cleanAccounts,
    };

    const json = JSON.stringify(payload, null, 2) + "\n";

    try {
      atomicWriteFileJson(this.storePath, json);
      this.logger?.debug?.(`[accounts] saved ${cleanAccounts.length} accounts to ${this.storePath}`);
    } catch (err) {
      this.logger?.error?.(`[accounts] failed to save store: ${(err as Error).message}`);
      throw err;
    }
  }

  /**
   * Saves a custom store atomically - used for tests / import
   */
  saveAccountsAtomic(store: AccountStore): void {
    this.store = sanitizeStore(store);
    this.rotationIdx = this.store.rotationIndex ?? 0;
    this.saveAccounts();
  }

  // --------------------------------------------------------------------------
  // QUERY - counters and listings
  // --------------------------------------------------------------------------

  getAccountCount(): number {
    return this.store.accounts.length;
  }

  getEnabledAccounts(): AccountMetadataV3[] {
    const t = nowMs();
    return this.store.accounts.filter((a) => {
      if (!a.enabled) return false;
      // Respect disabledUntil cooldown
      if (a.disabledUntil && a.disabledUntil > t) return false;
      // If disabledUntil expired but still enabled=false for a temporary reason, lazily re-enable?
      // Do not auto re-enable here, only filter; expiry logic is handled in backgroundRefresh
      return true;
    });
  }

  listAccounts(): AccountMetadataV3[] {
    return [...this.store.accounts];
  }

  /** List with refreshToken masked (safe for log/UI) */
  listAccountsMasked(): Array<Omit<AccountMetadataV3, "refreshToken"> & { refreshTokenMasked: string }> {
    return this.store.accounts.map((a) => {
      const masked = a.refreshToken.length > 12 ? `${a.refreshToken.slice(0, 6)}...${a.refreshToken.slice(-4)}` : "***";
      const { refreshToken: _rt, ...rest } = a;
      return {
        ...rest,
        refreshTokenMasked: masked,
      };
    });
  }

  findAccount(email: string): AccountMetadataV3 | undefined {
    const norm = normalizeEmail(email);
    return this.store.accounts.find((a) => normalizeEmail(a.email) === norm);
  }

  private findAccountIndex(email: string): number {
    const norm = normalizeEmail(email);
    return this.store.accounts.findIndex((a) => normalizeEmail(a.email) === norm);
  }

  // --------------------------------------------------------------------------
  // MUTATIONS - add / remove / enable / disable / setActive
  // --------------------------------------------------------------------------

  /**
   * Adds a new account. If email already exists, updates refreshToken and other data.
   * Returns the added/updated account.
   */
  addAccount(input: AddAccountInput): AccountMetadataV3 {
    if (!input.email || !isValidEmail(input.email)) {
      throw new Error(`addAccount: invalid email ${input.email}`);
    }
    if (!input.refreshToken || input.refreshToken.length < 10) {
      throw new Error(`addAccount: invalid refreshToken for ${input.email}`);
    }

    const email = normalizeEmail(input.email);
    const now = nowMs();

    const existingIdx = this.findAccountIndex(email);

    const base: AccountMetadataV3 = {
      email,
      refreshToken: input.refreshToken,
      accessToken: input.accessToken,
      expiryDate: input.expiryDate,
      projectId: input.projectId ?? PROJECT_FALLBACK,
      enabled: input.enabled ?? true,
      oauthClientKey: input.oauthClientKey ?? "gemini-cli",
      oauthClientConfig: input.oauthClientConfig,
      lastRefresh: undefined,
      createdAt: now,
      lastUsedAt: undefined,
      failureCount: 0,
      scopes: input.scopes,
    };

    if (existingIdx >= 0) {
      // Update preserving createdAt and enabled if not specified
      const prev = this.store.accounts[existingIdx];
      const merged: AccountMetadataV3 = {
        ...(prev as AccountMetadataV3),
        ...base,
        createdAt: (prev as AccountMetadataV3).createdAt,
        enabled: input.enabled ?? (prev as AccountMetadataV3).enabled,
        failureCount: 0, // reset on re-add
        disabledReason: undefined,
        disabledUntil: undefined,
      };
      // If a new refreshToken came in, update it; input always carries refreshToken in our case
      this.store.accounts[existingIdx] = merged;
      this.logger?.info?.(`[accounts] updated existing account ${email}`);
      this.saveAccounts();
      return merged;
    } else {
      this.store.accounts.push(base);
      // First account becomes active
      if (!this.store.activeEmail) {
        this.store.activeEmail = email;
      }
      this.logger?.info?.(`[accounts] added account ${email}`);
      this.saveAccounts();
      return base;
    }
  }

  /**
   * Removes account by email. Returns true if removed.
   */
  removeAccount(email: string): boolean {
    const idx = this.findAccountIndex(email);
    if (idx < 0) return false;

    const removed = this.store.accounts.splice(idx, 1)[0];
    this.logger?.info?.(`[accounts] removed account ${(removed as AccountMetadataV3).email}`);

    // Adjust activeEmail if it was the removed one
    if (this.store.activeEmail && normalizeEmail(this.store.activeEmail) === normalizeEmail(email)) {
      this.store.activeEmail = this.store.accounts.length > 0 ? this.store.accounts[0]!.email : null;
    }

    // Adjust rotationIndex
    if (this.rotationIdx >= this.store.accounts.length) {
      this.rotationIdx = 0;
    }

    this.saveAccounts();
    return true;
  }

  getActiveAccount(): AccountMetadataV3 | null {
    const enabled = this.getEnabledAccounts();
    if (enabled.length === 0) {
      // Fallback: do not return an account in cooldown; return null if really empty
      // If accounts exist but all are in cooldown, return the one with oldest disabledUntil (next to be released)
      const all = this.store.accounts.filter((a) => a.enabled);
      if (all.length === 0) return null;
      const sorted = [...all].sort((a, b) => (a.disabledUntil ?? 0) - (b.disabledUntil ?? 0));
      return sorted[0] ?? null;
    }

    const strategy = this.store.rotationStrategy ?? "round-robin";

    if (strategy === "sticky" && this.store.activeEmail) {
      const sticky = enabled.find((a) => normalizeEmail(a.email) === normalizeEmail(this.store.activeEmail!));
      if (sticky) {
        // Lazy update of lastUsedAt
        sticky.lastUsedAt = nowMs();
        return sticky;
      }
      // Sticky points to a disabled account - fall back to round-robin
    }

    // Round-robin
    if (this.rotationIdx >= enabled.length || this.rotationIdx < 0) {
      this.rotationIdx = 0;
    }

    const account = enabled[this.rotationIdx]!;
    // Advance pointer for next call (in-memory; persisted below)
    this.rotationIdx = (this.rotationIdx + 1) % enabled.length;
    this.store.rotationIndex = this.rotationIdx;
    this.store.activeEmail = account.email;
    account.lastUsedAt = nowMs();

    // Lazy non-blocking save? To persist rotation, save but do not fail on error
    try {
      this.saveAccounts();
    } catch {
      // ignore save error in getActiveAccount to keep hot path
    }

    return account;
  }

  /** Sets the active account (sticky-mode override). Optionally sets strategy to sticky. */
  setActive(email: string, opts?: { sticky?: boolean }): AccountMetadataV3 {
    const acct = this.findAccount(email);
    if (!acct) throw new Error(`setActive: account not found ${email}`);

    // If account is disabled and not in expired cooldown, still allow but warn
    if (!acct.enabled) {
      this.logger?.warn?.(`[accounts] setActive called for disabled account ${email}, enabling temporarily`);
    }

    this.store.activeEmail = acct.email;
    if (opts?.sticky) {
      this.store.rotationStrategy = "sticky";
    }
    // Align rotationIdx so round-robin continues from here if strategy changes
    const enabled = this.getEnabledAccounts();
    const idx = enabled.findIndex((a) => normalizeEmail(a.email) === normalizeEmail(email));
    if (idx >= 0) this.rotationIdx = idx;

    acct.lastUsedAt = nowMs();
    this.saveAccounts();
    return acct;
  }

  enableAccount(email: string): AccountMetadataV3 {
    const acct = this.findAccount(email);
    if (!acct) throw new Error(`enableAccount: not found ${email}`);
    acct.enabled = true;
    acct.failureCount = 0;
    acct.disabledReason = undefined;
    acct.disabledUntil = undefined;
    this.saveAccounts();
    return acct;
  }

  disableAccount(email: string, reason?: string, cooldownMs?: number): AccountMetadataV3 {
    const acct = this.findAccount(email);
    if (!acct) throw new Error(`disableAccount: not found ${email}`);
    acct.enabled = false;
    acct.disabledReason = reason ?? "manually disabled";
    if (cooldownMs && cooldownMs > 0) {
      acct.disabledUntil = nowMs() + cooldownMs;
      // With cooldown, keep enabled=false until expiry; background will re-enable
    }
    this.saveAccounts();
    return acct;
  }

  // Compat aliases required by consumers
  enable(email: string): AccountMetadataV3 {
    return this.enableAccount(email);
  }

  disable(email: string, reason?: string, cooldownMs?: number): AccountMetadataV3 {
    return this.disableAccount(email, reason, cooldownMs);
  }

  // --------------------------------------------------------------------------
  // ROTATION ON ERROR - 429/quota detection
  // --------------------------------------------------------------------------

  /**
   * Detects quota/429 errors and rotates to the next enabled account.
   * Accepts flexible signatures:
   * - rotateOnError(error)
   * - rotateOnError(email, error)
   * - rotateOnError(error, email)
   */
  rotateOnError(errorOrEmail: unknown, maybeErrorOrEmail?: unknown): AccountMetadataV3 | null {
    let currentEmail: string | undefined;
    let error: unknown;

    // Signature parsing heuristic
    if (typeof errorOrEmail === "string" && isValidEmail(errorOrEmail)) {
      currentEmail = errorOrEmail;
      error = maybeErrorOrEmail;
    } else if (typeof maybeErrorOrEmail === "string" && isValidEmail(maybeErrorOrEmail as string)) {
      currentEmail = maybeErrorOrEmail as string;
      error = errorOrEmail;
    } else {
      // First arg is the error
      error = errorOrEmail;
      if (typeof maybeErrorOrEmail === "string" && isValidEmail(maybeErrorOrEmail as string)) {
        currentEmail = maybeErrorOrEmail as string;
      }
    }

    if (!isQuotaError(error)) {
      // Not quota - no rotation
      this.logger?.debug?.(
        `[accounts] rotateOnError called but not quota error: ${String((error as any)?.message ?? error).slice(0, 200)}`,
      );
      return null;
    }

    // Resolve current account
    let currentAcct: AccountMetadataV3 | undefined;
    if (currentEmail) {
      currentAcct = this.findAccount(currentEmail);
    } else {
      // Try using store activeEmail
      const active = this.getActiveAccount();
      if (active) {
        currentAcct = active;
        currentEmail = active.email;
      }
    }

    if (currentAcct) {
      currentAcct.failureCount = (currentAcct.failureCount ?? 0) + 1;
      // On consecutive failure >= 3 apply 30min cooldown
      const cooldown =
        (currentAcct.failureCount ?? 0) >= 3
          ? 30 * 60 * 1000
          : (currentAcct.failureCount ?? 0) >= 2
            ? 10 * 60 * 1000
            : 5 * 60 * 1000;

      currentAcct.disabledUntil = nowMs() + cooldown;
      currentAcct.disabledReason = `quota/429 detected (${parseErrorStatus(error) ?? "quota"}) failureCount=${currentAcct.failureCount}`;

      // If failureCount >= 5, hard-disable until import/manual enable
      if ((currentAcct.failureCount ?? 0) >= 5) {
        currentAcct.enabled = false;
        this.logger?.warn?.(
          `[accounts] account ${currentAcct.email} disabled after ${currentAcct.failureCount} quota failures`,
        );
      }

      this.store.lastRotationAt = nowMs();
      this.store.lastRotatedFrom = currentAcct.email;
    }

    const enabled = this.getEnabledAccounts().filter((a) => {
      // Exclude the current account that caused the error
      if (currentEmail && normalizeEmail(a.email) === normalizeEmail(currentEmail)) return false;
      return true;
    });

    if (enabled.length === 0) {
      // Nothing else available - try all, including current if not hard-disabled
      const allEnabled = this.getEnabledAccounts();
      if (allEnabled.length === 0) {
        this.logger?.warn?.(`[accounts] rotateOnError: no enabled accounts left`);
        try {
          this.saveAccounts();
        } catch { /* the guarded best-effort operation falls through: the outer flow owns the failure */ }
        return null;
      }
      // If only the current one was available and it is now in cooldown, nowhere to rotate
      // Return null and caller must back off
      this.logger?.warn?.(
        `[accounts] rotateOnError: only current account ${currentEmail} was enabled, now in cooldown`,
      );
      try {
        this.saveAccounts();
      } catch { /* the guarded best-effort operation falls through: the outer flow owns the failure */ }
      return null;
    }

    // Round-robin to next
    if (this.rotationIdx >= enabled.length) this.rotationIdx = 0;
    const next = enabled[this.rotationIdx]!;
    this.rotationIdx = (this.rotationIdx + 1) % enabled.length;
    this.store.rotationIndex = this.rotationIdx;
    this.store.activeEmail = next.email;
    next.lastUsedAt = nowMs();

    this.logger?.info?.(`[accounts] rotated from ${currentEmail ?? "unknown"} to ${next.email} due to quota error`);

    try {
      this.saveAccounts();
    } catch { /* the guarded best-effort operation falls through: the outer flow owns the failure */ }

    return next;
  }

  // --------------------------------------------------------------------------
  // TOKEN REFRESH - double-checked locking
  // --------------------------------------------------------------------------

  /**
   * Refresh with double-checked locking
   * - Checks expiry before lock
   * - If a lock exists, waits for it and re-checks
   * - Only then performs the refresh
   */
  async refreshAccessTokenIfNeeded(email: string, force = false): Promise<AccountMetadataV3> {
    const acct = this.findAccount(email);
    if (!acct) throw new Error(`refreshAccessTokenIfNeeded: account not found ${email}`);

    // Fast path - token still valid and not forced
    if (!force && !isTokenExpired(acct)) {
      return acct;
    }

    const key = normalizeEmail(acct.email);

    // If a lock already exists, wait and re-check (double-checked)
    const existingLock = this.refreshLocks.get(key);
    if (existingLock) {
      this.logger?.debug?.(`[accounts] waiting existing refresh lock for ${acct.email}`);
      const waited = await existingLock;
      // Second check after lock release
      if (!force && !isTokenExpired(waited)) {
        return waited;
      }
      // If still expired (refresh failed and kept old token?), continue to new refresh below
    }

    // Create new lock
    const refreshPromise = (async (): Promise<AccountMetadataV3> => {
      // Double-checked locking - second check inside the lock
      const fresh = this.findAccount(email);
      if (!fresh) throw new Error(`Account disappeared during refresh ${email}`);

      if (!force && !isTokenExpired(fresh)) {
        return fresh;
      }

      this.logger?.info?.(`[accounts] refreshing access token for ${fresh.email}`);

      try {
        const tokenRes = await performTokenRefresh(fresh);

        // Update account in memory (fetch latest reference again)
        const targetIdx = this.findAccountIndex(email);
        if (targetIdx < 0) throw new Error(`Account vanished after refresh ${email}`);
        const target = this.store.accounts[targetIdx]!;

        target.accessToken = tokenRes.access_token;
        target.expiryDate = nowMs() + tokenRes.expires_in * 1000;
        target.lastRefresh = nowMs();
        target.failureCount = 0;
        target.disabledReason = undefined;
        target.disabledUntil = undefined;
        // Re-enable if disabled due to auth error
        const prevDisabledReason = target.disabledReason as string | undefined;
        if (!target.enabled && prevDisabledReason?.includes("auth")) {
          target.enabled = true;
        }

        // Project update? not during token step

        this.saveAccounts();
        this.logger?.info?.(`[accounts] refresh OK for ${target.email}, expires in ${tokenRes.expires_in}s`);
        return target;
      } catch (err) {
        const status = parseErrorStatus(err);
        const errMsg = (err as Error).message || String(err);

        this.logger?.warn?.(`[accounts] refresh failed for ${acct.email}: ${status ?? ""} ${errMsg.slice(0, 300)}`);

        // If refresh failed with invalid_grant / 400 / 401 -> refresh token invalid, disable
        if (
          status === 400 ||
          status === 401 ||
          errMsg.includes("invalid_grant") ||
          errMsg.includes("expired") ||
          errMsg.includes("revoked")
        ) {
          const idx = this.findAccountIndex(email);
          if (idx >= 0) {
            const t = this.store.accounts[idx]!;
            t.failureCount = (t.failureCount ?? 0) + 1;
            if ((t.failureCount ?? 0) >= 2) {
              t.enabled = false;
              t.disabledReason = `refresh failed: ${errMsg.slice(0, 200)}`;
            }
            try {
              this.saveAccounts();
            } catch { /* the guarded best-effort operation falls through: the outer flow owns the failure */ }
          }
        }

        throw err;
      }
    })();

    this.refreshLocks.set(key, refreshPromise);

    try {
      const result = await refreshPromise;
      return result;
    } finally {
      // Always clear lock
      if (this.refreshLocks.get(key) === refreshPromise) {
        this.refreshLocks.delete(key);
      }
    }
  }

  /**
   * Returns a valid access token, refreshing if needed.
   * If email is omitted, uses the active account (round-robin/sticky).
   */
  async getValidAccessToken(email?: string): Promise<string> {
    let acct: AccountMetadataV3 | null | undefined;

    if (email) {
      acct = this.findAccount(email);
      if (!acct) throw new Error(`getValidAccessToken: account not found ${email}`);
    } else {
      acct = this.getActiveAccount();
      if (!acct) throw new Error(`getValidAccessToken: no active account available`);
    }

    if (!acct.enabled) {
      // If in cooldown but expired, lazily re-enable
      if (acct.disabledUntil && acct.disabledUntil <= nowMs()) {
        acct.enabled = true;
        acct.disabledUntil = undefined;
        acct.disabledReason = undefined;
        acct.failureCount = 0;
        try {
          this.saveAccounts();
        } catch { /* the guarded best-effort operation falls through: the outer flow owns the failure */ }
      } else {
        throw new Error(`Account ${acct.email} is disabled: ${acct.disabledReason ?? "unknown"}`);
      }
    }

    const refreshed = await this.refreshAccessTokenIfNeeded(acct.email);
    if (!refreshed.accessToken) {
      throw new Error(`Failed to obtain access token for ${refreshed.email}`);
    }
    return refreshed.accessToken;
  }

  // --------------------------------------------------------------------------
  // BACKGROUND REFRESH
  // --------------------------------------------------------------------------

  /**
   * Background refresh of all enabled accounts close to expiry
   * - Does not block callers
   * - Uses allSettled so the batch never fails as a whole
   */
  async backgroundRefresh(): Promise<void> {
    // Reload from disk first to pick up external changes
    try {
      this.loadAccounts();
    } catch {
      // ignore
    }

    const enabled = this.getEnabledAccounts();
    if (enabled.length === 0) return;

    const toRefresh = enabled.filter((a) => {
      // Skip if future disabledUntil set
      if (a.disabledUntil && a.disabledUntil > nowMs()) return false;
      // If token missing or expiring within BACKGROUND buffer, refresh
      return isTokenExpired(a, BACKGROUND_REFRESH_BUFFER_MS);
    });

    if (toRefresh.length === 0) {
      this.logger?.debug?.(`[accounts] backgroundRefresh: no accounts need refresh`);
      return;
    }

    this.logger?.info?.(`[accounts] backgroundRefresh: refreshing ${toRefresh.length}/${enabled.length} accounts`);

    const results = await Promise.allSettled(
      toRefresh.map((a) =>
        this.refreshAccessTokenIfNeeded(a.email).catch((e) => {
          // Do not break allSettled with an extra throw
          throw e;
        }),
      ),
    );

    const fails = results.filter((r) => r.status === "rejected").length;
    if (fails > 0) {
      this.logger?.warn?.(`[accounts] backgroundRefresh: ${fails} failures`);
    }
  }

  /**
   * Starts background refresh without awaiting (fire-and-forget)
   */
  triggerBackgroundRefresh(): void {
    this.backgroundRefresh().catch(() => {});
  }

  // --------------------------------------------------------------------------
  // IMPORT FROM antigravity-manager
  // --------------------------------------------------------------------------

  private static getAntigravityManagerCandidatePaths(): string[] {
    const home = os.homedir();
    return [
      path.join(home, ".config", "antigravity-manager", "accounts.json"),
      path.join(home, ".antigravity-manager", "accounts.json"),
      path.join(home, ".config", "antigravity-manager", "credentials.json"),
      path.join(home, ".config", "antigravity", "accounts.json"),
      path.join(home, ".antigravity", "accounts.json"),
      path.join(home, ".antigravity", "auth.json"),
      path.join(home, ".config", "antigravity", "auth.json"),
      path.join(home, ".gemini", "antigravity", "accounts.json"),
      path.join(home, ".config", "opencode", "auth", "antigravity-accounts.json"),
      path.join(home, ".config", "opencode", "auth", "gemini-cli-tokens.json"),
      path.join(home, ".config", "opencode", "antigravity.json"),
      // Legacy antigravity-manager sqlite? No, json only.
    ];
  }

  private static extractAccountsFromRaw(raw: unknown): unknown[] {
    if (!raw) return [];

    // Case 1: direct array
    if (Array.isArray(raw)) return raw;

    if (typeof raw !== "object") return [];

    const obj = raw as Record<string, unknown>;

    // Case 2: { accounts: [...] }
    if (Array.isArray(obj.accounts)) return obj.accounts as unknown[];

    // Case 3: { credentials: [...] } or { tokens: [...] }
    if (Array.isArray(obj.credentials)) return obj.credentials as unknown[];
    if (Array.isArray(obj.tokens)) return obj.tokens as unknown[];

    // Case 4: { <email>: { refresh_token, ... } } map
    const keys = Object.keys(obj);
    const looksLikeEmailMap = keys.some((k) => k.includes("@"));
    if (looksLikeEmailMap) {
      return keys.map((k) => {
        const v = obj[k];
        if (typeof v === "object" && v !== null) {
          return { email: k, ...(v as object) };
        }
        return { email: k, refreshToken: v };
      });
    }

    // Case 5: { version: ..., data: [...] } wrapper
    if (Array.isArray(obj.data)) return obj.data as unknown[];
    if (obj.data && typeof obj.data === "object") {
      const inner = obj.data as Record<string, unknown>;
      if (Array.isArray(inner.accounts)) return inner.accounts as unknown[];
    }

    // Case 6: single account object
    if ((obj.email as string) || (obj.refresh_token as string) || (obj.refreshToken as string)) {
      return [raw];
    }

    return [];
  }

  /**
   * Imports accounts from existing antigravity-manager installations.
   * Tries multiple paths and legacy formats (including the flat Account[]
   * reader), merging into the current store without duplicates.
   */
  async importFromAntigravityManager(): Promise<ImportResult> {
    // Union of classic candidates and the portable resolver
    // (adds ANTIGRAVITY_MANAGER_ACCOUNTS_PATH env + macOS/Windows AppData locations)
    const merged = new Set<string>(AccountManager.getAntigravityManagerCandidatePaths());
    for (const c of resolveAntagravityManagerCandidates()) merged.add(c);
    const candidates = Array.from(merged);

    const result: ImportResult = {
      imported: 0,
      skipped: 0,
      updated: 0,
      errors: [],
      sources: [],
      accounts: [],
    };

    // Reload current state for safe merge
    try {
      this.loadAccounts();
    } catch { /* the guarded best-effort operation falls through: the outer flow owns the failure */ }

    const existingEmails = new Set(this.store.accounts.map((a) => normalizeEmail(a.email)));

    for (const p of candidates) {
      // Skip our own target file to avoid re-importing itself
      if (path.resolve(p) === path.resolve(this.storePath)) continue;

      if (!fs.existsSync(p)) continue;

      try {
        const content = fs.readFileSync(p, { encoding: "utf8" });
        const parsed = JSON.parse(content);
        const rawAccounts = AccountManager.extractAccountsFromRaw(parsed);

        if (rawAccounts.length === 0) {
          // Fall back to the strict flat-file reader for exotic shapes
          const legacy = parseLegacyAccounts(parsed);
          if (legacy.accounts.length > 0) {
            rawAccounts.push(...legacy.accounts);
          }
        }

        if (rawAccounts.length === 0) {
          result.errors.push(`${p}: no accounts extracted`);
          continue;
        }

        result.sources.push(p);
        this.logger?.info?.(`[accounts] import candidate ${p} -> ${rawAccounts.length} raw`);

        for (const raw of rawAccounts) {
          const normalized = normalizeAccountRaw(raw);
          if (!normalized) {
            result.skipped++;
            continue;
          }

          const normEmail = normalizeEmail(normalized.email);
          if (existingEmails.has(normEmail)) {
            // Exists already: update if new one has newer accessToken or old had failures
            const existing = this.findAccount(normEmail);
            if (existing) {
              const shouldUpdate =
                (normalized.accessToken &&
                  normalized.expiryDate &&
                  (!existing.expiryDate || normalized.expiryDate > existing.expiryDate)) ||
                (existing.failureCount ?? 0) > 0;

              if (shouldUpdate) {
                existing.refreshToken = normalized.refreshToken;
                if (normalized.accessToken) existing.accessToken = normalized.accessToken;
                if (normalized.expiryDate) existing.expiryDate = normalized.expiryDate;
                if (normalized.projectId) existing.projectId = normalized.projectId;
                existing.failureCount = 0;
                existing.disabledReason = undefined;
                existing.disabledUntil = undefined;
                existing.enabled = true;
                result.updated++;
              } else {
                result.skipped++;
              }
            } else {
              result.skipped++;
            }
            continue;
          }

          // Force antigravity-manager client key for tracking
          if (!normalized.oauthClientKey || normalized.oauthClientKey === "gemini-cli") {
            normalized.oauthClientKey = "antigravity-manager";
          }
          // Guarantee default oauth config when missing
          if (!normalized.oauthClientConfig) {
            normalized.oauthClientConfig = {
              clientId: GEMINI_CLI_OAUTH_CLIENT_ID,
              clientSecret: GEMINI_CLI_OAUTH_CLIENT_SECRET,
            };
          }

          this.store.accounts.push(normalized);
          existingEmails.add(normEmail);
          result.imported++;
          result.accounts.push(normalized);
        }
      } catch (e) {
        result.errors.push(`${p}: ${(e as Error).message}`);
      }
    }

    if (result.imported > 0 || result.updated > 0) {
      try {
        this.saveAccounts();
      } catch (e) {
        result.errors.push(`save after import failed: ${(e as Error).message}`);
      }
    }

    this.logger?.info?.(
      `[accounts] import finished: imported=${result.imported} updated=${result.updated} skipped=${result.skipped} sources=${result.sources.length}`,
    );

    return result;
  }

  /** Alias compat requested by consumers */
  async importFromAntigravity(): Promise<ImportResult> {
    return this.importFromAntigravityManager();
  }

  /** Additional alias for backwards compatibility */
  async importAccounts(): Promise<ImportResult> {
    return this.importFromAntigravityManager();
  }

  // --------------------------------------------------------------------------
  // LIFECYCLE / UTIL
  // --------------------------------------------------------------------------

  /** Clears the background timer (useful in tests) */
  destroy(): void {
    if (this.backgroundTimer) {
      clearInterval(this.backgroundTimer);
      this.backgroundTimer = undefined;
    }
    this.refreshLocks.clear();
  }

  /** File path */
  getStorePath(): string {
    return this.storePath;
  }

  /** Raw store (clone) */
  getStore(): AccountStore {
    return {
      ...this.store,
      accounts: [...this.store.accounts],
    };
  }

  /** Sets the rotation strategy */
  setRotationStrategy(strategy: RotationStrategy): void {
    this.store.rotationStrategy = strategy;
    this.saveAccounts();
  }
}

// ============================================================================
// SECTION 08. SINGLETON DEFAULT + EXPORT HELPERS
// ============================================================================

let _defaultManager: AccountManager | null = null;

/** Returns the default lazy singleton instance */
export function getDefaultAccountManager(opts?: AccountManagerOptions): AccountManager {
  if (!_defaultManager) {
    _defaultManager = new AccountManager(opts);
  }
  return _defaultManager;
}

/** Resets the singleton (tests) */
export function resetDefaultAccountManager(): void {
  if (_defaultManager) {
    _defaultManager.destroy();
    _defaultManager = null;
  }
}

/** Quick helper to obtain a valid token using the singleton */
export async function getValidAccessToken(email?: string, opts?: AccountManagerOptions): Promise<string> {
  const mgr = getDefaultAccountManager(opts);
  return mgr.getValidAccessToken(email);
}

/** Quick helper to obtain the active account */
export function getActiveAccount(opts?: AccountManagerOptions): AccountMetadataV3 | null {
  const mgr = getDefaultAccountManager(opts);
  return mgr.getActiveAccount();
}

// ============================================================================
// SECTION 09. DEFAULT EXPORT - CJS/ESM compat
// ============================================================================

export default AccountManager;

export const ACCOUNTS_FILE_PATH = resolveAccountsFilePath();

// local variant: diverges from constants (different barrel shape — accounts-specific fields)
export const ACCOUNTS_INFO = {
  CLIENT_ID_RAW: GEMINI_CLI_CLIENT_ID_RAW,
  CLIENT_ID: GEMINI_CLI_OAUTH_CLIENT_ID,
  CLIENT_SECRET: GEMINI_CLI_OAUTH_CLIENT_SECRET,
  SCOPES: GEMINI_CLI_SCOPES,
  TOKEN_URL: OAUTH_TOKEN_URL,
  USER_AGENT: GEMINI_CLI_USER_AGENT,
  USER_AGENT_FULL: GEMINI_CLI_USER_AGENT_FULL,
  X_GOOG_API_CLIENT,
  CLIENT_METADATA,
  CLOUDCODE_BASE_URL,
  CLOUDCODE_ENDPOINTS,
  PROJECT_FALLBACK,
  MODELS_2026,
  ACCOUNTS_FILE_PATH,
} as const;
