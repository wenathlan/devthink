/**
 * db.ts — the database contract of the gateway (root layer).
 *
 * schema.prisma describes the kinds the gateway lanes consume
 * (ChatMessage, ApiKey, SessionContext, TownKey, OnboardingState) with the
 * family sync contract: identity pointers are text, counts are 32-bit ints,
 * time is datetime or iso text. the self-hosted deploy answers those rows
 * over HTTPS through the Prisma 7 client with the libsql adapter; this
 * module carries the typed rows, the small typed in-memory seeds and the
 * HTTPS accessors the static interface calls — the visitor machine stores
 * nothing and falls back to the seeds when the endpoint is absent.
 *
 * The sqlite mirror (better-sqlite3, the local runtime of the gateway)
 * lives at the foot of this file: prepared statements only, never
 * concatenated SQL, DATABASE_URL env, idempotent schema on first use. The
 * driver is loaded through a computed dynamic import that vite never
 * bundles — the Sol pages reach this module, so the node layer stays behind
 * a process guard and the browser never fetches the addon.
 */

/// <reference types="better-sqlite3" />

import { LABEL_MANIFEST, LABEL_REVISION } from "./labels";

/** fetch budget for the HTTPS answers of the self-hosted DB. */
const fetchbudget = 2500;

/** one logged gateway request/response (the ChatMessage kind). */
export type ChatMessageRow = {
  id: string;
  chatId: string;
  chatSubId?: string | null;
  provider: string;
  route: string;
  model: string;
  role: "user" | "assistant" | "system";
  content: string;
  reasoningContent?: string | null;
  ip?: string | null;
  keyId?: string | null;
  finishReason?: string | null;
  promptTokens?: number | null;
  completionTokens?: number | null;
  totalTokens?: number | null;
  durationMs?: number | null;
  createdAt: string;
};

/** one registered provider key (the ApiKey kind). */
export type ApiKeyRow = {
  id: string;
  provider: string;
  key: string;
  label?: string | null;
  active: boolean;
  status: "active" | "revoked" | "expired";
  useCount: number;
  rotationCount: number;
  errorCount: number;
  rateLimitHit: boolean;
  createdAt: string;
  expiresAt?: string | null;
};

/** one ephemeral IP-bound Babel key (the TownKey kind, 60min expiry). */
export type TownKeyRow = {
  id: string;
  key: string;
  ip?: string | null;
  ua?: string | null;
  active: boolean;
  createdAt: string;
  expiresAt: string;
};

/** masks a provider key the way the /keys routes answer it. */
export function maskkey(key: string): string {
  if (key.length <= 12) return `${key.slice(0, 4)}****`;
  return `${key.slice(0, 8)}****${key.slice(-4)}`;
}

/**
 * SECURITY: the seed rows carry masked demo placeholders — no real provider
 * credential is stored in the repository. each value is read from the
 * environment when present (GETRY_SEED_KEY_01 … GETRY_SEED_KEY_05) and
 * falls back to a non-credential-shaped demo id, so the committed sources
 * never embed a provider token shape (no nvapi-/sk- literals).
 *
 * @param slot zero-padded seed slot of the key row.
 * @returns the environment-provided placeholder or the demo fallback.
 */
function seedkey(slot: string): string {
  const name = `GETRY_SEED_KEY_${slot}`;
  const fromenv = typeof process !== "undefined" && process.env ? process.env[name] : undefined;
  return fromenv ?? `demo-gateway-key-${slot}`;
}

/** the in-memory key seed the static build serves (masked on render). */
export const KEYSEED: ApiKeyRow[] = [
  {
    id: "key-01",
    provider: "nvidia",
    key: seedkey("01"),
    label: "nim rotation 01",
    active: true,
    status: "active",
    useCount: 412,
    rotationCount: 18,
    errorCount: 0,
    rateLimitHit: false,
    createdAt: "2026-09-12T10:00:00.000Z",
    expiresAt: null,
  },
  {
    id: "key-02",
    provider: "nvidia",
    key: seedkey("02"),
    label: "nim rotation 02",
    active: true,
    status: "active",
    useCount: 388,
    rotationCount: 18,
    errorCount: 1,
    rateLimitHit: false,
    createdAt: "2026-09-12T10:05:00.000Z",
    expiresAt: null,
  },
  {
    id: "key-03",
    provider: "nvidia",
    key: seedkey("03"),
    label: "nim rotation 03",
    active: true,
    status: "active",
    useCount: 401,
    rotationCount: 18,
    errorCount: 0,
    rateLimitHit: true,
    createdAt: "2026-09-12T10:10:00.000Z",
    expiresAt: null,
  },
  {
    id: "key-04",
    provider: "zai",
    key: seedkey("04"),
    label: "sdk internal",
    active: true,
    status: "active",
    useCount: 0,
    rotationCount: 0,
    errorCount: 0,
    rateLimitHit: false,
    createdAt: "2026-09-12T10:15:00.000Z",
    expiresAt: null,
  },
  {
    id: "key-05",
    provider: "openrouter",
    key: seedkey("05"),
    label: "free tier",
    active: true,
    status: "active",
    useCount: 97,
    rotationCount: 2,
    errorCount: 0,
    rateLimitHit: false,
    createdAt: "2026-09-20T08:00:00.000Z",
    expiresAt: null,
  },
];

/** the in-memory chat log seed the static build serves. */
export const MESSAGESEED: ChatMessageRow[] = [
  {
    id: "msg-01",
    chatId: "chat-9f21",
    provider: "zai",
    route: "/v1/chat/completions",
    model: "devthink",
    role: "user",
    content: "ping the gateway",
    ip: null,
    keyId: null,
    finishReason: "stop",
    promptTokens: 12,
    completionTokens: 26,
    totalTokens: 38,
    durationMs: 742,
    createdAt: "2026-09-30T14:02:11.000Z",
  },
  {
    id: "msg-02",
    chatId: "chat-9f21",
    provider: "zai",
    route: "/v1/chat/completions",
    model: "devthink",
    role: "assistant",
    content: "gateway alive, v1 answered with session id and usage",
    reasoningContent: "decided to answer directly, no tool call needed",
    ip: null,
    keyId: null,
    finishReason: "stop",
    promptTokens: 12,
    completionTokens: 26,
    totalTokens: 38,
    durationMs: 742,
    createdAt: "2026-09-30T14:02:11.742Z",
  },
  {
    id: "msg-03",
    chatId: "chat-4c07",
    provider: "nvidia",
    route: "/v3/chat/completions",
    model: "devthink",
    role: "user",
    content: "summarize the rotation state",
    ip: null,
    keyId: "key-02",
    finishReason: "stop",
    promptTokens: 18,
    completionTokens: 41,
    totalTokens: 59,
    durationMs: 1187,
    createdAt: "2026-09-30T14:07:40.000Z",
  },
  {
    id: "msg-04",
    chatId: "chat-4c07",
    provider: "nvidia",
    route: "/v3/chat/completions",
    model: "devthink",
    role: "assistant",
    content: "22 keys in round robin, the meta model rotates every 6 messages",
    reasoningContent: "read the rotation index before answering",
    ip: null,
    keyId: "key-02",
    finishReason: "stop",
    promptTokens: 18,
    completionTokens: 41,
    totalTokens: 59,
    durationMs: 1187,
    createdAt: "2026-09-30T14:07:41.187Z",
  },
];

/** the in-memory answer cache for the document lifetime (no storage). */
let keyscache: ApiKeyRow[] | null = null;
let messagescache: ChatMessageRow[] | null = null;

/**
 * lists the registered provider keys: asks the self-hosted DB over HTTPS
 * first and falls back to the in-memory seed when the endpoint is absent
 * (static build). never touches the visitor machine.
 *
 * @returns the key rows.
 */
export async function listkeys(): Promise<ApiKeyRow[]> {
  if (keyscache) return keyscache;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), fetchbudget);
    const response = await fetch("/api/v1/keys", { signal: controller.signal });
    clearTimeout(timer);
    if (!response.ok) throw new Error(`keys answered ${response.status}`);
    const rows = (await response.json()) as ApiKeyRow[];
    keyscache = rows;
    return rows;
  } catch {
    return KEYSEED;
  }
}

/**
 * lists the recent gateway chat log entries (bound to no chat id).
 *
 * @returns the message rows, newest last.
 */
export async function listmessages(): Promise<ChatMessageRow[]> {
  if (messagescache) return messagescache;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), fetchbudget);
    const response = await fetch("/api/v1/messages", { signal: controller.signal });
    clearTimeout(timer);
    if (!response.ok) throw new Error(`messages answered ${response.status}`);
    const rows = (await response.json()) as ChatMessageRow[];
    messagescache = rows;
    return rows;
  } catch {
    return MESSAGESEED;
  }
}

/**
 * summarizes the rotation state of one provider key pool.
 *
 * @param keys the key rows to summarize.
 * @returns the active, rotating and erroring key counts.
 */
export function rotationsummary(keys: ApiKeyRow[]): { active: number; rotating: number; erroring: number } {
  return {
    active: keys.filter((key) => key.active && key.status === "active").length,
    rotating: keys.filter((key) => key.rotationCount > 0).length,
    erroring: keys.filter((key) => key.errorCount > 0).length,
  };
}

/* ============================== sqlite mirror ==============================
   the local runtime of the gateway: better-sqlite3 over DATABASE_URL (the
   family convention), prepared statements only — every statement is bound,
   no sql is ever assembled by string concatenation. The schema mirrors
   schema.prisma (the onboarding_states table) and is created idempotently on
   first use; the gateway layer serves the same rows over /api/v1/*. The
   driver loads only in a node process: the browser graph reaches this
   module, so the import rides a computed specifier with @vite-ignore behind
   a process guard — vite never bundles the addon.
   ========================================================================== */

/** true when this module runs inside a node process (the gateway runtime). */
function isnode(): boolean {
  return typeof process !== "undefined" && process.versions?.node != null;
}

/** the database url of the local runtime (DATABASE_URL env, file: default). */
const DATABASE_URL = (typeof process !== "undefined" && process.env?.DATABASE_URL) || "file:./local.db";

/** the onboarding_states schema of the sqlite mirror (idempotent, mirrors the prisma model). */
const ONBOARDING_SCHEMA = `
CREATE TABLE IF NOT EXISTS onboarding_states (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  visitor        TEXT NOT NULL UNIQUE,
  introseen      INTEGER NOT NULL DEFAULT 0,
  onboardingseen INTEGER NOT NULL DEFAULT 0,
  updatedAt      TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

/** the labels schema of the sqlite mirror (idempotent — the interface copy store). */
const LABELS_SCHEMA = `
CREATE TABLE IF NOT EXISTS labels (
  id         TEXT PRIMARY KEY,
  text       TEXT NOT NULL,
  revision   INTEGER NOT NULL DEFAULT 0,
  updatedAt  TEXT NOT NULL DEFAULT (datetime('now')),
  translated INTEGER NOT NULL DEFAULT 0
);
`;

/** the prepared statements of the mirror, created once per process. */
type OnboardingStatements = {
  select: import("better-sqlite3").Statement;
  upsert: import("better-sqlite3").Statement;
};

/** the prepared label statements of the mirror, created once per process. */
type LabelStatements = {
  select: import("better-sqlite3").Statement;
  selectAll: import("better-sqlite3").Statement;
  upsert: import("better-sqlite3").Statement;
};

/** the cached driver bundle (null until the first node call). */
let mirror: { db: import("better-sqlite3").Database; statements: OnboardingStatements; labels: LabelStatements } | null =
  null;

/**
 * Boots the sqlite mirror exactly once per process: opens DATABASE_URL
 * (creating parent folders), rides WAL and the busy timeout, creates the
 * onboarding_states and labels tables when absent (idempotent seed-on-
 * first-run) and prepares every statement — never concatenated SQL.
 *
 * @returns the open database with its prepared statements.
 */
async function openMirror(): Promise<{
  db: import("better-sqlite3").Database;
  statements: OnboardingStatements;
  labels: LabelStatements;
}> {
  if (mirror) return mirror;
  const nodefs = await import(/* @vite-ignore */ "node:fs");
  const nodepath = await import(/* @vite-ignore */ "node:path");
  const driver = "better-sqlite3";
  const Database = (await import(/* @vite-ignore */ driver)).default;
  const file = DATABASE_URL.startsWith("file:") ? DATABASE_URL.slice("file:".length) : DATABASE_URL;
  nodefs.mkdirSync(nodepath.dirname(nodepath.resolve(file)), { recursive: true });
  const db = new Database(file);
  db.pragma("journal_mode = WAL");
  db.pragma("busy_timeout = 5000");
  db.exec(ONBOARDING_SCHEMA);
  db.exec(LABELS_SCHEMA);
  mirror = {
    db,
    statements: {
      select: db.prepare(
        "SELECT id, visitor, introseen, onboardingseen, updatedAt FROM onboarding_states WHERE visitor = ?",
      ),
      upsert: db.prepare(
        `INSERT INTO onboarding_states (visitor, introseen, onboardingseen, updatedAt)
         VALUES (?, ?, ?, datetime('now'))
         ON CONFLICT(visitor) DO UPDATE SET
           introseen = MAX(introseen, excluded.introseen),
           onboardingseen = MAX(onboardingseen, excluded.onboardingseen),
           updatedAt = datetime('now')`,
      ),
    },
    labels: {
      select: db.prepare("SELECT id, text, revision, updatedAt, translated FROM labels WHERE id = ?"),
      selectAll: db.prepare("SELECT id, text, revision, updatedAt, translated FROM labels ORDER BY id ASC"),
      upsert: db.prepare(
        `INSERT INTO labels (id, text, revision, updatedAt, translated) VALUES (?, ?, ?, datetime('now'), ?)
         ON CONFLICT(id) DO UPDATE SET
           text = excluded.text,
           revision = excluded.revision,
           updatedAt = excluded.updatedAt,
           translated = excluded.translated`,
      ),
    },
  };
  return mirror;
}

/** the stage flags the entry flow consults, as booleans. */
export type OnboardingFlags = { introseen: boolean; onboardingseen: boolean };

/**
 * Reads the onboarding stage flags of one visitor (bound parameters only;
 * undefined before the first write). The browser accessor serves the same
 * flags over GET /api/v1/onboarding (onboardingstate.ts).
 *
 * @param visitor the visitor key of the row.
 * @returns the flags, or undefined when the visitor never wrote.
 */
export async function getonboardingstate(visitor: string): Promise<OnboardingFlags | undefined> {
  if (!isnode()) return undefined;
  const { statements } = await openMirror();
  const row = statements.select.get(visitor) as { introseen: number; onboardingseen: number } | undefined;
  if (!row) return undefined;
  return { introseen: row.introseen === 1, onboardingseen: row.onboardingseen === 1 };
}

/**
 * Marks one onboarding stage seen for a visitor — idempotent seen-wins
 * upsert (a stage seen anywhere stays seen), prepared and bound, never
 * concatenated SQL.
 *
 * @param visitor the visitor key of the row.
 * @param stage the stage the visitor just saw (or deliberately skipped).
 * @returns the flags after the write.
 */
export async function setonboardingstage(visitor: string, stage: "intro" | "onboarding"): Promise<OnboardingFlags> {
  if (!isnode()) return { introseen: false, onboardingseen: false };
  const { statements } = await openMirror();
  statements.upsert.run(visitor, stage === "intro" ? 1 : 0, stage === "onboarding" ? 1 : 0);
  return (await getonboardingstate(visitor)) ?? { introseen: false, onboardingseen: false };
}

/* --------------------------------------------------------------------- */
/* labels — the interface copy store                                      */
/* --------------------------------------------------------------------- */

/** one labels row: the interface copy store. the id is the page.widget.key
 * path, the text rides the english source of truth (labels.ts), and the
 * translated flag protects a runtime translation from the seed overwrite.
 * the shape mirrors the browser seed rows in labels.ts one to one. */
export type LabelRow = {
  id: string;
  text: string;
  revision: number;
  updatedAt: string;
  translated?: boolean;
};

/** Projects one raw labels row into the stored label projection (translated
 * rides the 0/1 cell of the mirror). */
function labelRowOf(row: {
  id: string;
  text: string;
  revision: number;
  updatedAt: string;
  translated: number;
}): LabelRow {
  return {
    id: row.id,
    text: row.text,
    revision: row.revision,
    updatedAt: row.updatedAt,
    ...(row.translated === 1 ? { translated: true } : {}),
  };
}

/**
 * Writes one label row (idempotent upsert; the caller owns the revision),
 * prepared and bound, never concatenated SQL.
 *
 * @param id the page.widget.key path of the label.
 * @param text the surface text.
 * @param revision the manifest revision the text carries.
 * @param translated true when the row carries a runtime translation.
 * @returns the stored label projection (undefined outside a node process).
 */
export async function saveLabel(id: string, text: string, revision: number, translated = false): Promise<LabelRow | undefined> {
  if (!isnode()) return undefined;
  const { labels } = await openMirror();
  labels.upsert.run(id, text, revision, translated ? 1 : 0);
  const row = labels.select.get(id) as
    | { id: string; text: string; revision: number; updatedAt: string; translated: number }
    | undefined;
  if (!row) throw new Error(`label "${id}" write did not land`);
  return labelRowOf(row);
}

/**
 * Reads one label row by its page.widget.key path.
 *
 * @param id the label id.
 * @returns the row, or undefined when absent (or outside a node process).
 */
export async function readLabel(id: string): Promise<LabelRow | undefined> {
  if (!isnode()) return undefined;
  const { labels } = await openMirror();
  const row = labels.select.get(id) as
    | { id: string; text: string; revision: number; updatedAt: string; translated: number }
    | undefined;
  return row ? labelRowOf(row) : undefined;
}

/**
 * Reads every label row of the store ordered by id.
 *
 * @returns the label rows (empty outside a node process).
 */
export async function readAllLabels(): Promise<LabelRow[]> {
  if (!isnode()) return [];
  const { labels } = await openMirror();
  return (
    labels.selectAll.all() as { id: string; text: string; revision: number; updatedAt: string; translated: number }[]
  ).map(labelRowOf);
}

/**
 * Ingests the english manifest of labels.ts into the labels table — the
 * gateway-side twin of the browser seedLabels: idempotent, the changed rows
 * refresh, and the translated rows stay protected from the overwrite.
 *
 * @returns the seeded and protected row counts (zeros outside a node process).
 */
export async function seedLabelRows(): Promise<{ seeded: number; protected: number }> {
  if (!isnode()) return { seeded: 0, protected: 0 };
  const { labels } = await openMirror();
  const rows = new Map(
    (
      labels.selectAll.all() as {
        id: string;
        text: string;
        revision: number;
        updatedAt: string;
        translated: number;
      }[]
    ).map((row) => [row.id, labelRowOf(row)]),
  );
  let seeded = 0;
  let saved = 0;
  for (const [id, text] of Object.entries(LABEL_MANIFEST)) {
    const row = rows.get(id);
    if (row === undefined || (row.translated !== true && row.text !== text)) {
      labels.upsert.run(id, text, LABEL_REVISION, row?.translated === true ? 1 : 0);
      seeded += 1;
    }
    saved += 1;
  }
  return { seeded, protected: saved - seeded };
}

/* the copy law rides the mirror boot: the label seed ingests the english
 * manifest of labels.ts when the gateway runtime opens the store (the
 * interface strings land in the labels table, the translated rows protected
 * from the overwrite). best effort: a sealed store never blocks the boot,
 * the manifest always answers the widgets; the browser never runs this —
 * the visitor machine mirrors the rows through seedLabels in labels.ts. */
if (isnode()) void seedLabelRows().catch(() => {});
