/**
 * @file debug.ts
 * @module maene/debug
 * @description
 * Production-ready logging system (merged superset of the two prior variants).
 *
 * Merged responsibilities:
 * - Singleton DebugLogger with scoped child loggers and functional helpers
 * - File logging to ~/.config/opencode/antigravity-logs/ with 10MB rotation
 *   and 7-day retention cleanup (boot, post-rotation, hourly throttle and
 *   additionally checked every 50 writes)
 * - Hardened permissions: directory chmod 0700 / file chmod 0600 (best-effort,
 *   silently ignored on platforms without POSIX permissions such as Windows)
 * - TUI circular buffer (1000 entries) with chronological rendering helpers
 * - Toast gating through quiet_mode
 * - Secret redaction: pattern list (GOCSPX, client IDs, Bearer, JWT, X-Goog),
 *   text redactor (key=value pairs, ya29 tokens, AIza API keys) and a
 *   circular-safe deep object redactor that never throws
 * - Environment control supporting BOTH variable families:
 *     OPENCODE_ANTIGRAVITY_DEBUG / OPENCODE_ANTIGRAVITY_DEBUG_TUI (primary)
 *     ANTIGRAVITY_DEBUG / ANTIGRAVITY_DEBUG_TUI (compat fallback)
 * - refreshFromEnv() for long-running processes that change env at runtime
 *
 * Runtime constraint: only node:* builtins. Never throws into the host app.
 *
 * @license MIT
 */

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

// ---------------------------------------------------------------------------
// Governance constants — identical values owned by constants.ts
// ---------------------------------------------------------------------------

import { DEBUG_BUFFER_TUI_LINES, DEBUG_LOG_MAX_BYTES, DEBUG_LOG_RETENTION_DAYS } from "./constants.js";
import { cfgDir } from "./config.js";
export { DEBUG_BUFFER_TUI_LINES, DEBUG_LOG_MAX_BYTES, DEBUG_LOG_RETENTION_DAYS };

// ---------------------------------------------------------------------------
// Section: Gemini CLI bypass context (documentation constant)
// ---------------------------------------------------------------------------

// v2.1.16 dead-code cleanup: the GEMINI_CLI_CONTEXT documentation aggregate
// had zero consumers repo-wide and was deleted. It carried a verbatim GOCSPX
// client-secret fragment and phantom model ids (gemini-2.0-flash-thinking-exp,
// gemini-antigravity-preview) that exist in no owner module; the real values
// live in constants.js (oauth pair, user agent, metadata, base url,
// PROJECT_FALLBACK) and models.js (model identification).

// ---------------------------------------------------------------------------
// Section: Governance constants (filesystem layout and limits)
// ---------------------------------------------------------------------------
// DEBUG_LOG_MAX_BYTES (10MB), DEBUG_LOG_RETENTION_DAYS (7) and
// DEBUG_BUFFER_TUI_LINES (1000) are imported from constants.js (identical
// values) and re-exported above.

/** Relative log dir from $HOME: ~/.config/opencode/antigravity-logs/ */
export const DEBUG_LOG_DIR_SUBPATH = ".config/opencode/antigravity-logs";

/** Active log filename */
export const DEBUG_LOG_FILE_NAME = "antigravity.log";

// Internal aliases kept from the legacy variant for readability below.
const PLUGIN_DIR_NAME = "opencode";
const LOG_SUBDIR = "antigravity-logs";
const LOG_FILE_NAME = DEBUG_LOG_FILE_NAME;
const MAX_FILE_SIZE_BYTES = DEBUG_LOG_MAX_BYTES;
const MAX_FILE_AGE_MS = DEBUG_LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000;
const TUI_BUFFER_CAPACITY = DEBUG_BUFFER_TUI_LINES;

/** Cleanup trigger: check for expired logs every N writes */
const CLEANUP_EVERY_WRITES = 50;

function getDefaultLogDir(): string {
  // Same result as path.join(home, ".config", "opencode", "antigravity-logs"),
  // derived from the exported governance constant.
  return path.join(os.homedir(), ...DEBUG_LOG_DIR_SUBPATH.split("/"));
}

function getLogFilePath(logDir: string): string {
  return path.join(logDir, LOG_FILE_NAME);
}

// ---------------------------------------------------------------------------
// Section: Log levels (reconciled enum)
// -----------------------------------------------------------------------------
/**
 * Reconciliation note: two numeric scales existed (0/1/2/3/99 legacy and
 * 10/20/30/40/100 observer). The legacy compact scale is canonical because it
 * is the merge base; environment parsing accepts BOTH numeric scales (see
 * {@link parseAntigravityDebugEnv}).
 */
export type LogLevelName = "debug" | "info" | "warn" | "error" | "silent";

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 99,
}

const LEVEL_NAME_TO_ENUM: Record<string, LogLevel> = {
  debug: LogLevel.DEBUG,
  info: LogLevel.INFO,
  warn: LogLevel.WARN,
  warning: LogLevel.WARN, // compat alias accepted from the observer variant
  error: LogLevel.ERROR,
  silent: LogLevel.SILENT,
};

const LEVEL_ENUM_TO_NAME: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: "DEBUG",
  [LogLevel.INFO]: "INFO",
  [LogLevel.WARN]: "WARN",
  [LogLevel.ERROR]: "ERROR",
  [LogLevel.SILENT]: "SILENT",
};

/** Returns the first defined value among the given env variable names. */
function readFirstEnv(env: NodeJS.ProcessEnv, names: readonly string[]): string | undefined {
  for (const name of names) {
    const value = env[name];
    if (value !== undefined) return value;
  }
  return undefined;
}

function parseBooleanEnv(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined) return defaultValue;
  const v = value.trim().toLowerCase();
  if (["1", "true", "yes", "on", "enabled"].includes(v)) return true;
  if (["0", "false", "no", "off", "disabled"].includes(v)) return false;
  return defaultValue;
}

// ---------------------------------------------------------------------------
// Section: Environment parsing (ANTIGRAVITY_DEBUG / OPENCODE_ANTIGRAVITY_DEBUG)
// ---------------------------------------------------------------------------

export interface EnvParseResult {
  /** true = logging active, false = completely silenced */
  enabled: boolean;
  /** Minimum level that will be emitted */
  level: LogLevel;
  /** Raw env string kept for debugging/introspection */
  raw: string | undefined;
}

/** Tokens meaning "logger fully off". Matched against trimmed lowercase input. */
const DISABLED_TOKENS = new Set(["0", "false", "off", "disabled", "no", "none", ""]);

/** Tokens meaning "full debug enable" (most verbose level). */
const DEBUG_ENABLE_TOKENS = new Set(["1", "true", "yes", "on", "*", "all", "debug", "verbose", "trace", "silly"]);

/**
 * Parses the debug env value (ANTIGRAVITY_DEBUG or
 * OPENCODE_ANTIGRAVITY_DEBUG) into an enabled flag plus minimum level.
 *
 * Rules (merged from both variants):
 * - undefined            => enabled true, level WARN (observer default)
 * - disabled tokens      => enabled false, SILENT (0/false/off/disabled/no/none/"")
 * - enable tokens        => DEBUG (1/true/yes/on/star/all/debug/verbose/trace/silly)
 * - numeric values       => legacy scale 0..3 maps directly onto LogLevel;
 *                           observer scale 10..40 maps DEBUG/INFO/WARN/ERROR;
 *                           values >= 99 map to SILENT (legacy sentinel);
 *                           anything else falls back to WARN
 * - comma/semicolon/space/pipe separated lists pick the most verbose level
 *   mentioned (substring matching included, wildcards force DEBUG)
 * - any other non-empty string defaults to DEBUG (user explicitly opted in)
 *
 * @param raw - raw env value
 */
export function parseAntigravityDebugEnv(raw: string | undefined): EnvParseResult {
  if (raw === undefined) {
    return { enabled: true, level: LogLevel.WARN, raw };
  }
  const trimmed = String(raw).trim();
  const lower = trimmed.toLowerCase();

  if (DISABLED_TOKENS.has(lower)) {
    // Explicit empty string counts as disabled when set; undefined stays default WARN.
    return { enabled: false, level: LogLevel.SILENT, raw: trimmed };
  }

  if (DEBUG_ENABLE_TOKENS.has(lower)) {
    return { enabled: true, level: LogLevel.DEBUG, raw: trimmed };
  }

  // Numeric quick path accepting both reconciled scales.
  if (/^\d+$/.test(lower)) {
    const n = Number(lower);
    if (n >= 99) return { enabled: false, level: LogLevel.SILENT, raw: trimmed };
    if (n <= 3) return { enabled: true, level: n as LogLevel, raw: trimmed }; // legacy direct cast
    if (n <= 10) return { enabled: true, level: LogLevel.DEBUG, raw: trimmed };
    if (n <= 20) return { enabled: true, level: LogLevel.INFO, raw: trimmed };
    if (n <= 30) return { enabled: true, level: LogLevel.WARN, raw: trimmed };
    if (n <= 40) return { enabled: true, level: LogLevel.ERROR, raw: trimmed };
    return { enabled: true, level: LogLevel.WARN, raw: trimmed };
  }

  // Multi-token list: choose the most verbose (lowest numeric) level mentioned.
  const tokens = lower
    .split(/[,;\s|]+/g)
    .map((s) => s.trim())
    .filter(Boolean);

  let minLevel: LogLevel | null = null;
  for (const tok of tokens) {
    if (tok in LEVEL_NAME_TO_ENUM) {
      const lvl = LEVEL_NAME_TO_ENUM[tok];
      if (lvl !== undefined && (minLevel === null || lvl < minLevel)) minLevel = lvl;
      continue;
    }
    for (const [name, lvl] of Object.entries(LEVEL_NAME_TO_ENUM)) {
      if (tok.includes(name)) {
        if (minLevel === null || lvl < minLevel) minLevel = lvl;
      }
    }
    if (tok.includes("*")) {
      if (minLevel === null || LogLevel.DEBUG < minLevel) minLevel = LogLevel.DEBUG;
    }
  }

  if (minLevel !== null) {
    return { enabled: true, level: minLevel, raw: trimmed };
  }

  // Non-empty unknown string => DEBUG (user explicitly wanted logging).
  if (trimmed.length > 0) {
    return { enabled: true, level: LogLevel.DEBUG, raw: trimmed };
  }

  return { enabled: true, level: LogLevel.WARN, raw: trimmed };
}

// ---------------------------------------------------------------------------
// Section: Secret redaction
// ---------------------------------------------------------------------------

/**
 * Legacy pattern list: covers GOCSPX client secrets, OAuth client IDs,
 * Bearer tokens, generic OAuth fields, query-string tokens, JWT-like
 * triples and X-Goog headers.
 */
const SECRET_PATTERNS: Array<{ regex: RegExp; replacement: string }> = [
  // Full GOCSPX client secret
  { regex: /GOCSPX-[A-Za-z0-9_\-]{20,}/g, replacement: "GOCSPX-***REDACTED***" },
  // Client ID patterns (avoid leaking the full identifier in logs)
  { regex: /681255809395-[a-z0-9]{20,}\.apps\.googleusercontent\.com/gi, replacement: "***CLIENT_ID_REDACTED***" },
  { regex: /\b681255809395-oo8f…b135j\b/g, replacement: "***CLIENT_ID_REDACTED***" },

  // Bearer tokens - header form or bare value
  { regex: /(Bearer\s+)[A-Za-z0-9\-_\.=]+/gi, replacement: "$1***REDACTED***" },
  { regex: /(Authorization['"]?\s*[:=]\s*['"]?)(Bearer\s+)?[A-Za-z0-9\-_\.]+/gi, replacement: "$1***REDACTED***" },

  // Generic OAuth fields
  {
    regex:
      /("?(?:access_token|refresh_token|id_token|client_secret|api_key|apikey|idToken|accessToken|refreshToken)"?\s*[:=]\s*["']?)([^"'\s,}\]]+)/gi,
    replacement: "$1***REDACTED***",
  },

  // access_token as query parameter
  { regex: /([?&](?:access_token|id_token|refresh_token|api_key|key)=)([^&\s]+)/gi, replacement: "$1***REDACTED***" },

  // JWT-like tokens (three base64 parts)
  { regex: /\beyJ[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}\b/g, replacement: "***JWT_REDACTED***" },

  // Google OAuth access tokens (ya29.*)
  { regex: /\b(ya29\.[A-Za-z0-9_\-]+)\b/g, replacement: "ya29.***REDACTED***" },

  // X-Goog headers carrying tokens
  { regex: /(X-Goog-[A-Za-z\-]+:\s*)(.+)/gi, replacement: "$1***REDACTED***" },
];

/**
 * Redacts known secrets inside free-form text using the legacy pattern list.
 * @param input - raw log line or message
 */
export function redactSecretsPatterns(input: string): string {
  let out = input;
  for (const { regex, replacement } of SECRET_PATTERNS) {
    // Reset lastIndex so globally reused regexes stay safe inside loops.
    regex.lastIndex = 0;
    out = out.replace(regex, replacement);
  }
  return out;
}

/**
 * Text redactor from the observer variant. Complements {@link redactSecretsPatterns}
 * with JSON/query key=value captures, long Bearer tokens, ya29.* Google OAuth
 * access tokens and AIza* Google API keys.
 * @param input - raw log line or message
 */
export function redactSecretsText(input: string): string {
  if (!input || typeof input !== "string") return input as unknown as string;
  let out = input;

  // 1. JSON / query style separators - capture key+separator, replace value.
  //    Value must be at least 8 chars to avoid false positives.
  out = out.replace(
    /(["']?(?:refresh_token|access_token|id_token|api_key|api[_-]?key|client_secret|client_id)["']?\s*[:=]\s*["']?)([^"'\s,;}\]&]{8,})/gi,
    (_m, p1: string) => `${p1}[REDACTED]`,
  );

  // 2. Bearer header with long token
  out = out.replace(/(Bearer\s+)[A-Za-z0-9\-_\.=]{20,}/gi, "$1[REDACTED]");

  // 3. Google OAuth access tokens ya29.*
  out = out.replace(/\bya29\.[A-Za-z0-9\-_]{20,}/g, "[REDACTED_GOOGLE_TOKEN]");

  // 4. Google API keys AIza*
  out = out.replace(/\bAIza[0-9A-Za-z\-_]{30,}/g, "[REDACTED_API_KEY]");

  // 5. Generic secret=/password=/token= assignments with long values (>=12 chars)
  out = out.replace(
    /((?:secret|password|token)\s*[:=]\s*["']?)([^"'\s]{12,})/gi,
    (_m, p1: string) => `${p1}[REDACTED]`,
  );

  return out;
}

/** Sensitive substrings for object-key based redaction (defense in depth). */
const SENSITIVE_KEY_SUBSTRINGS = [
  "refresh_token",
  "access_token",
  "id_token",
  "api_key",
  "apikey",
  "api-key",
  "client_secret",
  "client_secret_expires",
  "password",
] as const;

/** Legacy exact-key sensitive set used by {@link redactObject}. */
const LEGACY_SENSITIVE_KEYS = new Set([
  "access_token",
  "refresh_token",
  "id_token",
  "client_secret",
  "clientSecret",
  "accessToken",
  "refreshToken",
  "idToken",
  "api_key",
  "apikey",
  "token",
  "authorization",
  "cookie",
  "set-cookie",
  "x-goog-api-key",
]);

/** Checks whether an object key name is considered sensitive. */
function isSensitiveKey(key: string): boolean {
  const low = key.toLowerCase();
  return SENSITIVE_KEY_SUBSTRINGS.some((s) => low.includes(s));
}

/**
 * Legacy shallow-cloning redaction: redacts sensitive keys and string values
 * recursively (without circular-reference protection).
 */
export function redactObject<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "string") {
    return redactSecretsPatterns(obj) as unknown as T;
  }
  if (typeof obj !== "object") return obj;
  if (Array.isArray(obj)) {
    return (obj as unknown as Array<unknown>).map(redactObject) as unknown as T;
  }
  const copy: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (LEGACY_SENSITIVE_KEYS.has(k.toLowerCase()) || LEGACY_SENSITIVE_KEYS.has(k)) {
      copy[k] = "***REDACTED***";
    } else if (typeof v === "string") {
      copy[k] = redactSecretsPatterns(v);
    } else if (typeof v === "object" && v !== null) {
      copy[k] = redactObject(v);
    } else {
      copy[k] = v;
    }
  }
  return copy as unknown as T;
}

/**
 * Deep redaction that clones and redacts sensitive keys and string values.
 * Handles circular references (replaced with "[Circular]"), Error objects
 * (name/message/stack plus enumerable props) and arrays. Never throws.
 *
 * @param value - arbitrary value to clone/redact
 * @param seen - internal WeakSet tracking visited objects
 */
export function redactObjectDeep<T>(value: T, seen = new WeakSet<object>()): T {
  if (value === null || value === undefined) return value;
  const t = typeof value;
  if (t === "string") {
    return redactSecretsText(value as unknown as string) as unknown as T;
  }
  if (t !== "object") {
    // number, boolean, bigint, symbol, function - returned as-is
    return value;
  }

  // Circular reference guard
  if (seen.has(value as unknown as object)) {
    return "[Circular]" as unknown as T;
  }

  // Error special handling - capture name/message/stack redacted
  if (value instanceof Error) {
    seen.add(value as unknown as object);
    const errObj: Record<string, unknown> = {
      name: (value as Error).name,
      message: redactSecretsText((value as Error).message),
    };
    const stack = (value as Error).stack;
    if (stack) errObj.stack = redactSecretsText(stack);
    for (const k of Object.keys(value as unknown as object)) {
      if (k === "message" || k === "stack" || k === "name") continue;
      try {
        const v = (value as unknown as Record<string, unknown>)[k];
        if (isSensitiveKey(k)) {
          errObj[k] = "[REDACTED]";
        } else {
          errObj[k] = redactObjectDeep(v as unknown, seen);
        }
      } catch {
        errObj[k] = "[Unserializable]";
      }
    }
    return errObj as unknown as T;
  }

  // Arrays
  if (Array.isArray(value)) {
    seen.add(value as unknown as object);
    const arr = value as unknown as unknown[];
    const out: unknown[] = new Array(arr.length);
    for (let i = 0; i < arr.length; i++) {
      try {
        out[i] = redactObjectDeep(arr[i] as unknown, seen);
      } catch {
        out[i] = "[Unserializable]";
      }
    }
    return out as unknown as T;
  }

  // Plain objects / records
  const obj = value as unknown as Record<string, unknown>;
  seen.add(obj as unknown as object);
  const cloned: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    try {
      const v = obj[key];
      if (isSensitiveKey(key)) {
        cloned[key] = "[REDACTED]";
      } else {
        cloned[key] = redactObjectDeep(v as unknown, seen);
      }
    } catch {
      cloned[key] = "[Unserializable]";
    }
  }
  return cloned as unknown as T;
}

/**
 * Safe JSON stringify that never throws; runs the deep redaction layer first.
 */
function safeStringifyMeta(meta: unknown): string {
  if (meta === undefined) return "";
  if (meta === null) return "null";
  try {
    const redacted = redactObjectDeep(meta);
    return JSON.stringify(redacted);
  } catch {
    try {
      return String(meta);
    } catch {
      return "[Unserializable meta]";
    }
  }
}

// ---------------------------------------------------------------------------
// Section: TUI circular buffer
// ---------------------------------------------------------------------------

export interface LogEntry {
  timestamp: string; // ISO string
  level: LogLevel;
  levelName: string;
  message: string;
  data?: unknown | undefined;
  scope?: string | undefined;
}

export class CircularBuffer<T> {
  private buf: (T | undefined)[];
  private head = 0;
  private count = 0;

  constructor(public readonly capacity: number) {
    this.buf = new Array<T | undefined>(capacity);
  }

  push(item: T): void {
    this.buf[this.head] = item;
    this.head = (this.head + 1) % this.capacity;
    if (this.count < this.capacity) this.count++;
  }

  toArray(): T[] {
    const result: T[] = [];
    const start = this.count < this.capacity ? 0 : this.head;
    for (let i = 0; i < this.count; i++) {
      const idx = (start + i) % this.capacity;
      const val = this.buf[idx];
      if (val !== undefined) result.push(val);
    }
    return result;
  }

  clear(): void {
    this.buf = new Array<T | undefined>(this.capacity);
    this.head = 0;
    this.count = 0;
  }

  get size(): number {
    return this.count;
  }

  getRecent(n: number): T[] {
    const all = this.toArray();
    return all.slice(-n);
  }
}

// ---------------------------------------------------------------------------
// Section: Logger singleton (merged feature set)
// ---------------------------------------------------------------------------

export interface DebugLoggerOptions {
  logDir?: string;
  level?: LogLevel | LogLevelName;
  tuiEnabled?: boolean;
  tuiCapacity?: number;
  quietMode?: boolean;
  enableFileLogging?: boolean;
  /** Allows injecting env for tests */
  env?: NodeJS.ProcessEnv;
}

export class DebugLogger {
  private static _instance: DebugLogger | null = null;

  public readonly logDir: string;
  public readonly logFile: string;
  private level: LogLevel;
  /** Observer-style master switch: false means completely silenced. */
  private enabled: boolean;
  /** Raw debug env value last seen (for introspection). */
  private rawEnv: string | undefined;
  private tuiEnabled: boolean;
  private quietMode: boolean;
  private fileLoggingEnabled: boolean;
  private buffer: CircularBuffer<LogEntry>;
  private dirEnsured = false;
  private lastCleanup = 0;
  private readonly CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 1h throttle
  private writeCount = 0;

  // Guards against recursion if fs fails while logging the failure itself.
  private isWriting = false;

  private constructor(opts: DebugLoggerOptions = {}) {
    const env = opts.env ?? process.env;

    this.logDir = opts.logDir ?? getDefaultLogDir();
    this.logFile = getLogFilePath(this.logDir);

    // Level control: OPENCODE_ANTIGRAVITY_DEBUG first, ANTIGRAVITY_DEBUG compat.
    const envLevelRaw = readFirstEnv(env, ["OPENCODE_ANTIGRAVITY_DEBUG", "ANTIGRAVITY_DEBUG"]);
    this.rawEnv = envLevelRaw;

    if (opts.level !== undefined) {
      this.level = typeof opts.level === "string" ? this.parseLevelOption(opts.level, LogLevel.INFO) : opts.level;
      this.enabled = this.level !== LogLevel.SILENT;
    } else if (envLevelRaw !== undefined) {
      const parsed = parseAntigravityDebugEnv(envLevelRaw);
      this.level = parsed.level;
      this.enabled = parsed.enabled;
    } else {
      // Default INFO when neither option nor env is provided.
      this.level = LogLevel.INFO;
      this.enabled = true;
    }

    // TUI control: OPENCODE_ANTIGRAVITY_DEBUG_TUI first, ANTIGRAVITY_DEBUG_TUI compat.
    const envTuiRaw = readFirstEnv(env, ["OPENCODE_ANTIGRAVITY_DEBUG_TUI", "ANTIGRAVITY_DEBUG_TUI"]);
    if (opts.tuiEnabled !== undefined) {
      this.tuiEnabled = opts.tuiEnabled;
    } else if (envTuiRaw !== undefined) {
      this.tuiEnabled = parseBooleanEnv(envTuiRaw, true);
    } else {
      // Default: TUI active whenever logging is not silent.
      this.tuiEnabled = this.level !== LogLevel.SILENT;
    }

    // Quiet mode suppresses toast notifications.
    const envQuietRaw =
      env["OPENCODE_ANTIGRAVITY_QUIET_MODE"] ??
      env["OPENCODE_ANTIGRAVITY_QUIET"] ??
      env["OPENCODE_ANTIGRAVITY_SUPPRESS_TOAST"];
    if (opts.quietMode !== undefined) {
      this.quietMode = opts.quietMode;
    } else {
      this.quietMode = parseBooleanEnv(envQuietRaw, false);
    }

    this.fileLoggingEnabled = opts.enableFileLogging ?? true;

    const capacity = opts.tuiCapacity ?? TUI_BUFFER_CAPACITY;
    this.buffer = new CircularBuffer<LogEntry>(capacity);

    // Best-effort boot: create dir, secure permissions, clean old logs.
    try {
      this.ensureLogDir();
      this.cleanupOldLogs();
    } catch {
      // noop - never break the host app if fs fails at boot
    }

    // Bind for callback usage.
    this.debug = this.debug.bind(this);
    this.info = this.info.bind(this);
    this.warn = this.warn.bind(this);
    this.error = this.error.bind(this);
  }

  // -------------------------------------------------------------------------
  // Singleton access
  // -------------------------------------------------------------------------
  public static getInstance(opts?: DebugLoggerOptions): DebugLogger {
    if (!DebugLogger._instance) {
      DebugLogger._instance = new DebugLogger(opts);
    } else if (opts && Object.keys(opts).length > 0) {
      // Existing instance plus explicit overrides - apply them.
      DebugLogger._instance.applyOptions(opts);
    }
    return DebugLogger._instance;
  }

  /** For tests - resets the singleton. */
  public static _resetForTests(): void {
    DebugLogger._instance = null;
  }

  /**
   * For testing only - resets the singleton and returns a fresh instance that
   * reads current env. Production code should use getInstance().
   */
  public static resetInstanceForTests(): DebugLogger {
    DebugLogger._instance = null;
    return DebugLogger.getInstance();
  }

  private parseLevelOption(level: LogLevel | LogLevelName | string, fallback: LogLevel): LogLevel {
    if (typeof level === "number") return level;
    const low = String(level).trim().toLowerCase();
    const mapped = LEVEL_NAME_TO_ENUM[low];
    return mapped ?? fallback;
  }

  private applyOptions(opts: DebugLoggerOptions): void {
    if (opts.level !== undefined) {
      this.level = typeof opts.level === "string" ? this.parseLevelOption(opts.level, this.level) : opts.level;
      this.enabled = this.level !== LogLevel.SILENT;
    }
    if (opts.tuiEnabled !== undefined) this.tuiEnabled = opts.tuiEnabled;
    if (opts.quietMode !== undefined) this.quietMode = opts.quietMode;
    if (opts.enableFileLogging !== undefined) this.fileLoggingEnabled = opts.enableFileLogging;
  }

  // -------------------------------------------------------------------------
  // Getters / setters
  // -------------------------------------------------------------------------
  public getLevel(): LogLevel {
    return this.level;
  }

  public getLevelName(): LogLevelName {
    const name = LEVEL_ENUM_TO_NAME[this.level]?.toLowerCase();
    return (name as LogLevelName) ?? "info";
  }

  /**
   * Programmatic level setter - overrides env control for this process.
   * Accepts enum values, level names, or any string understood by
   * {@link parseAntigravityDebugEnv}.
   */
  public setLevel(level: LogLevel | LogLevelName | string): void {
    try {
      if (typeof level === "number") {
        if (Object.values(LogLevel).includes(level as LogLevel)) {
          this.level = level as LogLevel;
          this.enabled = this.level !== LogLevel.SILENT;
        }
        return;
      }
      const low = String(level).trim().toLowerCase();
      const mapped = LEVEL_NAME_TO_ENUM[low];
      if (mapped !== undefined) {
        this.level = mapped;
        this.enabled = this.level !== LogLevel.SILENT;
        return;
      }
      // Flexible parsing via the env parser (lists, wildcards, numbers).
      const parsed = parseAntigravityDebugEnv(String(level));
      this.level = parsed.level;
      this.enabled = parsed.enabled;
    } catch {
      // ignore - setter must never throw
    }
  }

  public isTuiEnabled(): boolean {
    return this.tuiEnabled;
  }

  public setTuiEnabled(enabledFlag: boolean): void {
    this.tuiEnabled = enabledFlag;
  }

  public isQuietMode(): boolean {
    return this.quietMode;
  }

  public setQuietMode(quiet: boolean): void {
    this.quietMode = quiet;
  }

  /**
   * Whether toast notifications should be shown (quiet_mode suppresses them).
   */
  public shouldShowToast(): boolean {
    return !this.quietMode;
  }

  public isDebugEnabled(): boolean {
    return this.enabled && this.level <= LogLevel.DEBUG;
  }

  /** Whether file logging is currently enabled (false after disable tokens). */
  public isEnabled(): boolean {
    return this.enabled && this.fileLoggingEnabled;
  }

  /** Whether a given level would be emitted right now. */
  public isLevelEnabled(lvl: LogLevel): boolean {
    if (!this.enabled || this.level === LogLevel.SILENT) return false;
    return lvl >= this.level;
  }

  /** Raw debug env value last observed. */
  public getRawEnv(): string | undefined {
    return this.rawEnv;
  }

  public getLogDir(): string {
    return this.logDir;
  }

  public getLogFilePath(): string {
    return this.logFile;
  }

  // -------------------------------------------------------------------------
  // Filesystem - dir creation with hardening, rotation, retention cleanup
  // -------------------------------------------------------------------------
  private ensureLogDir(): void {
    if (this.dirEnsured) return;
    try {
      if (!fs.existsSync(this.logDir)) {
        fs.mkdirSync(this.logDir, { recursive: true, mode: 0o700 });
      }
      // Best-effort chmod 0o700 - silently ignored on Windows / restricted FS.
      try {
        fs.chmodSync(this.logDir, 0o700);
      } catch {
        // ignore chmod errors
      }
      this.dirEnsured = true;
    } catch {
      // Never propagate - logging cannot break the app.
      this.dirEnsured = false;
    }
  }

  /** Best-effort chmod 0o600 on the active log file. */
  private ensureLogFilePermissions(): void {
    try {
      if (fs.existsSync(this.logFile)) {
        fs.chmodSync(this.logFile, 0o600);
      }
    } catch {
      // ignore
    }
  }

  private getFileSize(): number {
    try {
      const stat = fs.statSync(this.logFile);
      return stat.size;
    } catch {
      return 0;
    }
  }

  /**
   * Rotates the active file when it reaches DEBUG_LOG_MAX_BYTES. Renames to
   * antigravity-YYYY-MM-DD-HH-mm-ss-mmm.log, recreates an empty active file
   * with mode 0o600, and falls back to truncation if rename fails.
   */
  private rotateIfNeeded(): void {
    if (!this.fileLoggingEnabled) return;
    try {
      const size = this.getFileSize();
      if (size < MAX_FILE_SIZE_BYTES) return;

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-").replace("T", "_").replace("Z", "");
      const rotatedName = `antigravity-${timestamp}.log`;
      const rotatedPath = path.join(this.logDir, rotatedName);

      try {
        fs.renameSync(this.logFile, rotatedPath);
        // Recreate a fresh empty active file with secure mode.
        try {
          fs.writeFileSync(this.logFile, "", { encoding: "utf8", mode: 0o600 });
          this.ensureLogFilePermissions();
        } catch {
          // ignore - next append recreates it
        }
      } catch {
        // If rename fails (e.g. file open elsewhere), truncate instead.
        try {
          fs.truncateSync(this.logFile, 0);
        } catch {
          // ignore
        }
      }

      // After rotation, try retention cleanup immediately.
      this.cleanupOldLogs(true);
    } catch {
      // ignore rotation errors
    }
  }

  /**
   * Removes rotated logs older than DEBUG_LOG_RETENTION_DAYS days.
   * Called at boot, after rotation, and every CLEANUP_EVERY_WRITES writes;
   * throttled to run at most once per hour unless forced.
   */
  public cleanupOldLogs(force = false): void {
    const now = Date.now();
    if (!force && now - this.lastCleanup < this.CLEANUP_INTERVAL_MS) return;
    this.lastCleanup = now;

    if (!this.fileLoggingEnabled) return;
    try {
      this.ensureLogDir();
      const files = fs.readdirSync(this.logDir);
      for (const file of files) {
        // Only handle our own naming pattern.
        if (!file.startsWith("antigravity") || !file.endsWith(".log")) continue;
        // Preserve the active file.
        if (file === LOG_FILE_NAME) continue;

        const fullPath = path.join(this.logDir, file);
        try {
          const stat = fs.statSync(fullPath);
          const age = now - stat.mtimeMs;
          if (age > MAX_FILE_AGE_MS) {
            fs.unlinkSync(fullPath);
          }
        } catch {
          // Ignore individual file errors.
        }
      }
    } catch {
      // ignore
    }
  }

  // -------------------------------------------------------------------------
  // Core logging pipeline
  // -------------------------------------------------------------------------
  private shouldLog(incomingLevel: LogLevel): boolean {
    if (!this.enabled) return false;
    if (this.level === LogLevel.SILENT) return false;
    return incomingLevel >= this.level;
  }

  private formatEntry(entry: LogEntry): string {
    const redactedMessage = redactSecretsPatterns(entry.message);
    let line = `${entry.timestamp} [${entry.levelName}]`;
    if (entry.scope) {
      line += ` [${redactSecretsPatterns(entry.scope)}]`;
    }
    line += ` ${redactedMessage}`;
    if (entry.data !== undefined) {
      const json = safeStringifyMeta(entry.data);
      line += json ? ` ${json}` : ` [unserializable data]`;
    }
    return line + "\n";
  }

  private writeToFile(formatted: string): void {
    if (!this.fileLoggingEnabled) return;
    if (this.isWriting) return; // recursion guard
    this.isWriting = true;
    try {
      this.ensureLogDir();
      this.rotateIfNeeded();
      fs.appendFileSync(this.logFile, formatted, { encoding: "utf8", mode: 0o600 });
      this.ensureLogFilePermissions();

      // Retention check every CLEANUP_EVERY_WRITES writes (throttled internally).
      this.writeCount++;
      if (this.writeCount % CLEANUP_EVERY_WRITES === 0) {
        this.cleanupOldLogs();
      }
    } catch {
      // Logging failures never break the host app.
    } finally {
      this.isWriting = false;
    }
  }

  private pushToTui(entry: LogEntry): void {
    if (!this.tuiEnabled) return;
    try {
      this.buffer.push(entry);
    } catch {
      // ignore
    }
  }

  private log(level: LogLevel, message: string, data?: unknown, scope?: string): LogEntry | null {
    if (!this.shouldLog(level)) return null;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      levelName: LEVEL_ENUM_TO_NAME[level] ?? "INFO",
      message: String(message),
      data,
      scope,
    };

    // Store already-redacted copies in the TUI buffer for safety.
    const redactedForStorage: LogEntry = {
      ...entry,
      message: redactSecretsPatterns(entry.message),
      data: data !== undefined ? redactObject(data) : undefined,
      scope: scope ? redactSecretsPatterns(scope) : undefined,
    };

    this.pushToTui(redactedForStorage);

    const formatted = this.formatEntry(entry);
    this.writeToFile(formatted);

    // Stderr echo: only at DEBUG level, warn/error lines, never in quiet mode,
    // so the opencode TUI stdout stays untouched.
    if (this.level <= LogLevel.DEBUG) {
      try {
        if (typeof process !== "undefined" && process.stderr && !this.quietMode) {
          if (level >= LogLevel.WARN) {
            process.stderr.write(formatted);
          }
        }
      } catch {
        // ignore
      }
    }

    return redactedForStorage;
  }

  // -------------------------------------------------------------------------
  // Public level methods
  // -------------------------------------------------------------------------
  public debug(message: string, data?: unknown, scope?: string): LogEntry | null {
    return this.log(LogLevel.DEBUG, message, data, scope);
  }

  public info(message: string, data?: unknown, scope?: string): LogEntry | null {
    return this.log(LogLevel.INFO, message, data, scope);
  }

  public warn(message: string, data?: unknown, scope?: string): LogEntry | null {
    return this.log(LogLevel.WARN, message, data, scope);
  }

  public error(message: string, data?: unknown, scope?: string): LogEntry | null {
    return this.log(LogLevel.ERROR, message, data, scope);
  }

  /**
   * Log with custom scope (useful for child loggers).
   */
  public withScope(scope: string): ScopedLogger {
    return new ScopedLogger(this, scope);
  }

  // -------------------------------------------------------------------------
  // Env refresh - long-running processes may change env at runtime
  // -------------------------------------------------------------------------
  /**
   * Re-reads OPENCODE_ANTIGRAVITY_DEBUG (or ANTIGRAVITY_DEBUG) and updates
   * the enabled flag and level accordingly.
   *
   * @param env - optional env override (defaults to process.env)
   * @returns the fresh parse result
   */
  public refreshFromEnv(env: NodeJS.ProcessEnv = process.env): EnvParseResult {
    try {
      const raw = readFirstEnv(env, ["OPENCODE_ANTIGRAVITY_DEBUG", "ANTIGRAVITY_DEBUG"]);
      const parsed = parseAntigravityDebugEnv(raw);
      this.enabled = parsed.enabled;
      this.level = parsed.level;
      this.rawEnv = raw;
      return parsed;
    } catch {
      return { enabled: this.enabled, level: this.level, raw: this.rawEnv };
    }
  }

  // -------------------------------------------------------------------------
  // TUI API
  // -------------------------------------------------------------------------
  public getTuiBuffer(): LogEntry[] {
    return this.buffer.toArray();
  }

  public getRecentLogs(count: number): LogEntry[] {
    return this.buffer.getRecent(count);
  }

  public getTuiBufferAsString(maxLines?: number): string {
    const entries = maxLines ? this.buffer.getRecent(maxLines) : this.buffer.toArray();
    return entries
      .map((e) => {
        const scopePart = e.scope ? ` [${e.scope}]` : "";
        const dataPart = e.data !== undefined ? ` ${JSON.stringify(e.data)}` : "";
        return `${e.timestamp} [${e.levelName}]${scopePart} ${e.message}${dataPart}`;
      })
      .join("\n");
  }

  public clearTuiBuffer(): void {
    this.buffer.clear();
  }

  public getTuiBufferSize(): number {
    return this.buffer.size;
  }

  public getTuiCapacity(): number {
    return this.buffer.capacity;
  }
}

// ---------------------------------------------------------------------------
// Section: Scoped logger (per-module child loggers, e.g. auth:refresh)
// ---------------------------------------------------------------------------
export class ScopedLogger {
  constructor(
    private readonly parent: DebugLogger,
    private readonly scope: string,
  ) {}

  debug(message: string, data?: unknown): LogEntry | null {
    return this.parent.debug(message, data, this.scope);
  }
  info(message: string, data?: unknown): LogEntry | null {
    return this.parent.info(message, data, this.scope);
  }
  warn(message: string, data?: unknown): LogEntry | null {
    return this.parent.warn(message, data, this.scope);
  }
  error(message: string, data?: unknown): LogEntry | null {
    return this.parent.error(message, data, this.scope);
  }

  withScope(childScope: string): ScopedLogger {
    return new ScopedLogger(this.parent, `${this.scope}:${childScope}`);
  }

  get parentLogger(): DebugLogger {
    return this.parent;
  }
}

// ---------------------------------------------------------------------------
// Section: Default singleton and functional helpers
// ---------------------------------------------------------------------------
function getLogger(): DebugLogger {
  return DebugLogger.getInstance();
}

export const logger: DebugLogger = DebugLogger.getInstance();

/** Direct-import level helpers: import { debug, info } from "./debug" */
export function debug(message: string, data?: unknown, scope?: string): LogEntry | null {
  return getLogger().debug(message, data, scope);
}
export function info(message: string, data?: unknown, scope?: string): LogEntry | null {
  return getLogger().info(message, data, scope);
}
export function warn(message: string, data?: unknown, scope?: string): LogEntry | null {
  return getLogger().warn(message, data, scope);
}
export function error(message: string, data?: unknown, scope?: string): LogEntry | null {
  return getLogger().error(message, data, scope);
}

/** Creates a scoped logger (e.g. "auth:gemini", "plugin:load"). */
export function createScopedLogger(scope: string): ScopedLogger {
  return getLogger().withScope(scope);
}

/** Compatibility alias for createScopedLogger. */
export function createDebugLogger(scope: string): ScopedLogger {
  return createScopedLogger(scope);
}

/** State helpers controlled by env. */
export function isDebugEnabled(): boolean {
  return getLogger().isDebugEnabled();
}
export function isTuiEnabled(): boolean {
  return getLogger().isTuiEnabled();
}
export function isQuietMode(): boolean {
  return getLogger().isQuietMode();
}
export function shouldShowToast(): boolean {
  return getLogger().shouldShowToast();
}

/** TUI buffer access helpers. */
export function getTuiBuffer(): LogEntry[] {
  return getLogger().getTuiBuffer();
}
export function getRecentLogs(n: number): LogEntry[] {
  return getLogger().getRecentLogs(n);
}
export function getTuiBufferAsString(maxLines?: number): string {
  return getLogger().getTuiBufferAsString(maxLines);
}
export function clearTuiBuffer(): void {
  return getLogger().clearTuiBuffer();
}

/** Log filesystem info helpers. */
export function getLogDir(): string {
  return getLogger().getLogDir();
}
export function getLogFilePathExport(): string {
  return getLogger().getLogFilePath();
}

/** Dynamic adjustment helpers (useful for TUI commanders). */
export function setLogLevel(level: LogLevel | LogLevelName): void {
  getLogger().setLevel(level);
}
export function setQuietMode(enabledFlag: boolean): void {
  getLogger().setQuietMode(enabledFlag);
}
export function setTuiEnabled(enabledFlag: boolean): void {
  getLogger().setTuiEnabled(enabledFlag);
}

/**
 * Functional wrapper around {@link DebugLogger.refreshFromEnv}: re-reads the
 * debug env variables and applies them to the singleton logger.
 */
export function refreshFromEnv(env?: NodeJS.ProcessEnv): EnvParseResult {
  return env ? getLogger().refreshFromEnv(env) : getLogger().refreshFromEnv();
}

// ---------------------------------------------------------------------------
// Default export - the DebugLogger class (construct your own instances).
// The shared singleton is available as the named export `logger`.
// ---------------------------------------------------------------------------
export default DebugLogger;

// ===========================================================================
// v2.1.15 Phase B: logging trio moved from config.ts (values verbatim —
// the published ./system subpath semantics: "Bearer [REDACTED]" style)
// ===========================================================================

/** Antigravity debug-logs directory inside the config directory. */
export const logsDir = (): string => path.join(cfgDir(), "antigravity-logs");

/** Redacts Bearer JWTs and refresh_token substrings from a log line. */
export const redactSecrets = (s: string): string =>
  s
    .replace(/Bearer\s+[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/g, "Bearer [REDACTED]")
    .replace(/refresh_token[^\s]*/gi, "refresh_token=[REDACTED]");

/**
 * Mini debug-logger singleton: 1000-line ring buffer, daily log files under
 * logsDir(), 10MB rotation, 7-day cleanup, secret redaction on every line.
 */
export class debugLogger {
  private static inst: debugLogger | null = null;
  private buffer: string[] = [];
  private maxBuf = 1000;
  static get(): debugLogger {
    if (!debugLogger.inst) debugLogger.inst = new debugLogger();
    return debugLogger.inst!;
  }
  log(msg: string): void {
    const line = `[${new Date().toISOString()}] ${redactSecrets(msg)}`;
    this.buffer.push(line);
    if (this.buffer.length > this.maxBuf) this.buffer.shift();
    try {
      fs.mkdirSync(logsDir(), { recursive: true });
      const p = path.join(logsDir(), `antigravity-${new Date().toISOString().slice(0, 10)}.log`);
      fs.writeFileSync(p, this.buffer.join("\n") + "\n", { flag: "a" });
      const st = fs.statSync(p);
      if (st.size > 10 * 1024 * 1024) {
        const bak = `${p}.1`;
        try {
          fs.renameSync(p, bak);
        } catch { /* the guarded best-effort operation falls through: the outer flow owns the failure */ }
      }
    } catch { /* the guarded best-effort operation falls through: the outer flow owns the failure */ }
  }
  getBuffer(): string[] {
    return [...this.buffer];
  }
  cleanup(): void {
    try {
      const files = fs.readdirSync(logsDir());
      const now = Date.now();
      for (const f of files) {
        const fp = path.join(logsDir(), f);
        try {
          const st = fs.statSync(fp);
          if (now - st.mtimeMs > 7 * 24 * 3600 * 1000) fs.unlinkSync(fp);
        } catch { /* the guarded best-effort operation falls through: the outer flow owns the failure */ }
      }
    } catch { /* the guarded best-effort operation falls through: the outer flow owns the failure */ }
  }
}
