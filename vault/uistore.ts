// # uistore — the ui store of the vault (root layer): every user-visible
// string the product face renders rides the database — the uicopy table of
// the vault's own better-sqlite3 store, served same-origin over
// /api/v1/ui/copy (and one row over /api/v1/ui/copy/:key) — and the
// component never hardcodes text. The literals live HERE and ONLY here as
// the build seed (the copy seed the interface already rides keeps its own
// home in labels.ts and answers through the same chain): the server boot
// ingests the seed rows into the table, the live rows answer the pages,
// and the seed answers the offline static build (the memory-seed law —
// never browser storage). The typed accessor `uicopy(key)` reads the live
// rows the platform answered and falls back to the seed and then to the
// labels store, so the interface never shows a blank where a word belongs
// and the db stays the single living config of the winget copy.
//
// @section 1  seed — the build seed rows the db receives at boot
// @section 2  client — the typed accessor, the live loader and the mount
//             hook the wingets render through (browser side)
// @section 3  store — the better-sqlite3 lane of the uicopy table (server
//             side; the native addon loads lazily through createRequire so
//             the browser bundle never touches it — the sandboxlane sqlite
//             precedent)

import { useEffect, useState } from "react";
import { LABEL_MANIFEST, type LabelKey, label } from "./labels.ts";
import { onboardingbase } from "./onboardingstate.ts";

/* ------------------------------------------------------------------ */
/* @section 1 — seed: the build rows the db receives at boot           */
/* ------------------------------------------------------------------ */

/**
 * The build-time seed of the winget copy: the one place the moved
 * literals live. Every row was authored for the product face the wave 4b
 * redesign renders (the direct-value hero, the bucket plans table, the
 * object browser, the database console, the toast voices and the skeleton
 * readout) — the prose the surfaces answer; the data rows (mime families,
 * byte sizes, digests, channel kinds, thresholds) stay data and keep
 * flowing from the engine tables. Keys use the dotted surface.path
 * address under the face namespace.
 */
const SEED: Readonly<Record<string, string>> = Object.freeze({
  /* ------------------------------ hero ------------------------------ */
  "face.hero.eyebrow": "vault · edge storage for the whole family",
  "face.hero.title": "your state, sealed and served from one deployable store.",
  "face.hero.lede":
    "bucket plans, object storage and a database console in one deployable clone — nothing rides the browser, everything answers from the vault engine.",
  "face.hero.cta": "open the console",
  "face.hero.ctaSecondary": "the storage contract",
  /* --------------------------- console zone -------------------------- */
  "face.zone.eyebrow": "the product, live",
  "face.zone.title": "one console for the plans, the objects and the database",
  "face.zone.lede":
    "every surface below answers from the real rehearsal engines — the same contracts the family serves.",
  /* --------------------------- plans table --------------------------- */
  "face.plans.aria": "the bucket plans of the vault",
  "face.plans.head": "plans",
  "face.plans.caption": "the four bucket plans of the safe — retention window, sealed rows and bytes",
  "face.plans.col.bucket": "plan",
  "face.plans.col.policy": "retention",
  "face.plans.col.rows": "rows",
  "face.plans.col.bytes": "sealed",
  "face.plans.col.share": "lfs share",
  "face.plans.featuredNote": "forever — the safe never forgets a source of truth",
  "face.plans.shareAria": "lfs share {share} percent on {bucket}",
  /* ---------------------------- object browse ------------------------ */
  "face.browse.aria": "the object browser of the vault",
  "face.browse.head": "objects",
  "face.browse.searchAria": "filter the sealed objects by path",
  "face.browse.searchPlaceholder": "filter by path…",
  "face.browse.all": "all buckets",
  "face.browse.col.path": "object",
  "face.browse.col.bucket": "bucket",
  "face.browse.col.channel": "channel",
  "face.browse.col.size": "size",
  "face.browse.col.digest": "digest",
  "face.browse.col.seal": "seal",
  "face.browse.count": "{count} objects · {bytes} under seal",
  "face.browse.empty": "no object answers this filter",
  "face.browse.emptyHint": "clear the filter or reseed the rehearsal to see the ledger again.",
  "face.browse.clear": "clear the filter",
  "face.browse.booting": "opening the ledger",
  /* --------------------------- db console ---------------------------- */
  "face.console.aria": "the database console of the vault",
  "face.console.head": "database console",
  "face.console.caption": "census · channels · sweep plan",
  "face.console.line.census": "census  {rows} rows · {bytes} under seal",
  "face.console.line.lanes": "lanes   lfs {lfsRows} rows · {lfsBytes}  ·  blob {blobRows} rows · {blobBytes}",
  "face.console.line.biggest": "biggest {path} · {bytes}",
  "face.console.line.sweep": "sweep   {rows} rows · {bytes} due at tick {tick} — a plan, never an action",
  "face.console.line.contract": "contract {threshold} threshold · sha-256 lfs · sha-1 blob",
  /* ------------------------------ toasts ----------------------------- */
  "face.toast.sealedTitle": "deposit sealed",
  "face.toast.sealedBody": "{path} rides the {channel} channel — {digest}",
  "face.toast.refusedTitle": "the deposit refused",
  "face.toast.refusedBody": "not a deposit yet — name it as path · mime · size, or paste a git-lfs pointer.",
  "face.toast.reseedTitle": "the rehearsal reseeded",
  "face.toast.reseedBody": "seed {seed} mustered the ledger again.",
  "face.toast.restoreTitle": "the rehearsal restored",
  "face.toast.restoreBody": "the ledger answers the original seed again.",
  "face.toast.rollTitle": "the clock rolled",
  "face.toast.rollBody": "tick {tick} — the sweep plan recomputed.",
  "face.toast.pickTitle": "bucket opened",
  "face.toast.pickBody": "{bucket} · {rows} rows · {bytes} in the drawer.",
  "face.toast.dismiss": "dismiss the notice",
  /* ----------------------------- skeleton ---------------------------- */
  "face.skeleton.aria": "loading the ledger",
});

/**
 * The seed surface: the db fill, the tests and the offline build read it;
 * the components never (they read through uicopy).
 *
 * @returns the frozen seed rows (key to text).
 */
export function uistoreseedrows(): Readonly<Record<string, string>> {
  return SEED;
}

/* ------------------------------------------------------------------ */
/* @section 2 — client: the accessor, the loader and the mount hook    */
/* ------------------------------------------------------------------ */

/** One uicopy row as the db holds it and the api answers it. */
export interface uicopyrow {
  /** The stable dotted key the components cite. */
  key: string;
  /** The text the row serves. */
  value: string;
  /** The locale the row answers (the store seeds the default). */
  locale: string;
  /** The last write of the row (the datetime the db stamped). */
  updated: string;
}

/** The live rows the platform answered (null until the first load). */
let uilive: Readonly<Record<string, string>> | null = null;

/**
 * Loads the live ui rows from the vault database: GET /api/v1/ui/copy over
 * the same validated base the onboarding flags ride (the same-origin lane
 * — the deployed gateway answers it; localhost and private hosts are
 * refused by the same discipline). The failure keeps the seed answering
 * (the offline build law).
 */
export async function loaduicopy(): Promise<void> {
  if (uilive) return;
  const base = onboardingbase();
  if (!base) return;
  try {
    const res = await fetch(new URL("/api/v1/ui/copy", base).toString(), {
      credentials: "include",
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return;
    const answer = (await res.json()) as { rows?: uicopyrow[] };
    if (!Array.isArray(answer.rows)) return;
    const rows: Record<string, string> = {};
    for (const row of answer.rows) {
      if (row && typeof row.key === "string" && typeof row.value === "string") rows[row.key] = row.value;
    }
    uilive = rows;
  } catch {
    /* the platform is away: the seed keeps answering */
  }
}

/**
 * The labels door of the chain: the manifest answers the key (honoring the
 * translation overrides the accessor consults) when the key lives there.
 *
 * @param key the dotted copy key.
 * @returns the labels text, or undefined when the manifest holds no row.
 */
function labelsafe(key: string): string | undefined {
  return (LABEL_MANIFEST as Record<string, string | undefined>)[key] !== undefined ? label(key as LabelKey) : undefined;
}

/**
 * The typed accessor every winget renders through: the live db row when
 * the platform answered, the uistore seed otherwise, then the labels store
 * (its manifest rows and translation overrides — the home the interface
 * copy already rides), the key itself when neither holds it (the missing
 * key is loud, never a blank).
 *
 * @param key the dotted copy key.
 * @returns the text the db (or the seed chain) serves.
 */
export function uicopy(key: string): string {
  return uilive?.[key] ?? SEED[key] ?? labelsafe(key) ?? key;
}

/**
 * The placeholder door: fills the {token} slots of one format key with the
 * runtime values (the store keeps the sentence, the winget passes the
 * data).
 *
 * @param key the dotted copy key.
 * @param values the tokens the row carries.
 * @returns the filled text.
 */
export function uicopyfill(key: string, values: Record<string, string>): string {
  return uicopy(key).replace(/\{(\w+)\}/g, (match, token: string) => values[token] ?? match);
}

/**
 * useUicopy — the mount hook of the store-riding winget: it loads the
 * live rows once per mount and re-renders the face when they land. The
 * seed answers the first paint with the same words the db serves, so the
 * swap never flashes.
 */
export function useUicopy(): void {
  const [, bump] = useState(0);
  useEffect(() => {
    let alive = true;
    void loaduicopy().then(() => {
      if (alive) bump((n) => n + 1);
    });
    return () => {
      alive = false;
    };
  }, []);
}

/* ------------------------------------------------------------------ */
/* @section 3 — store: the better-sqlite3 lane of the uicopy table     */
/* ------------------------------------------------------------------ */

/** The default locale every seed row answers. */
const DEFAULTLOCALE = "en";

/** The schema of the uicopy table: one row per key per locale, the write
 * stamp riding the row (the db is the living config of the copy). */
const UISCHEMA =
  "CREATE TABLE IF NOT EXISTS uicopy (key TEXT NOT NULL, locale TEXT NOT NULL DEFAULT 'en', value TEXT NOT NULL, updated TEXT NOT NULL DEFAULT (datetime('now')), PRIMARY KEY (key, locale))";

/** The narrow prepared surface the lane drives of one sqlite database
 * (the better-sqlite3 runtime — bound parameters only, never a
 * concatenated statement). */
interface UiDatabase {
  prepare(statement: string): {
    get(...params: unknown[]): unknown;
    all(...params: unknown[]): unknown[];
    run(...params: unknown[]): { changes: number; lastInsertRowid: number | bigint };
  };
  pragma(statement: string): unknown;
  close(): void;
}

/** One open lane: the handle plus its prepared statements. */
interface uistorelane {
  db: UiDatabase;
  get: ReturnType<UiDatabase["prepare"]>;
  list: ReturnType<UiDatabase["prepare"]>;
  upsert: ReturnType<UiDatabase["prepare"]>;
}

/** The opened lane of this process (undefined until the first open, null
 * when this host carries no sqlite lane — the browser answers the seed). */
let openedlane: uistorelane | null | undefined;

/** The db file of the ui store (the env points it in the tests; the
 * default lands beside the working directory the way the site store does). */
function uistorefile(): string {
  return process.env.VAULT_UISTORE_DB || "uistore.db";
}

/**
 * uistoreopen — open (and create) the ui store: the uicopy table lays
 * down on first use, the prepared statements ride the handle. The native
 * addon loads through createRequire so the bundle never embeds the addon
 * identifiers, and a host without the sqlite lane answers null — the
 * routes and the ingestion degrade honestly to the build seed.
 */
async function uistoreopen(): Promise<uistorelane | null> {
  if (openedlane !== undefined) return openedlane;
  openedlane = null;
  if (typeof process === "undefined" || !process.versions?.node) return openedlane;
  try {
    const { createRequire } = await import("node:module");
    const runtime = createRequire(import.meta.url);
    const loaded = runtime("better-sqlite3") as unknown;
    const Database = (typeof loaded === "function" ? loaded : (loaded as { default?: unknown }).default) as
      | (new (
          file: string,
        ) => UiDatabase)
      | undefined;
    if (typeof Database !== "function") return openedlane;
    const db = new Database(uistorefile());
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    db.prepare(UISCHEMA).run();
    openedlane = {
      db,
      get: db.prepare("SELECT key, value, locale, updated FROM uicopy WHERE key = ? AND locale = ?"),
      list: db.prepare("SELECT key, value, locale, updated FROM uicopy WHERE locale = ? ORDER BY key"),
      upsert: db.prepare(
        "INSERT INTO uicopy (key, locale, value, updated) VALUES (?, ?, ?, datetime('now')) ON CONFLICT(key, locale) DO UPDATE SET value = excluded.value, updated = datetime('now')",
      ),
    };
  } catch {
    openedlane = null;
  }
  return openedlane;
}

/**
 * uistoreget — one ui copy row of the db by key.
 *
 * @param key the dotted copy key.
 * @param locale the locale the row answers.
 * @returns the row, or null when the lane is away or the key is unknown.
 */
export async function uistoreget(key: string, locale: string = DEFAULTLOCALE): Promise<uicopyrow | null> {
  const lane = await uistoreopen();
  if (!lane) return null;
  const row = lane.get.get(key, locale) as uicopyrow | undefined;
  return row ?? null;
}

/**
 * uistorelist — every ui copy row of one locale (the lane the
 * /api/v1/ui/copy endpoint answers).
 *
 * @param locale the locale to list.
 * @returns the rows sorted by key, or the empty list when the lane is away.
 */
export async function uistorelist(locale: string = DEFAULTLOCALE): Promise<uicopyrow[]> {
  const lane = await uistoreopen();
  if (!lane) return [];
  return lane.list.all(locale) as uicopyrow[];
}

/**
 * uistoreupsert — the write lane: each row upserts in place (equal key
 * and locale update value and stamp), bound parameters only.
 *
 * @param rows the rows to write.
 * @param locale the locale the rows answer.
 * @returns the count of rows written, or null when the lane is away.
 */
export async function uistoreupsert(
  rows: readonly { key: string; value: string }[],
  locale: string = DEFAULTLOCALE,
): Promise<number | null> {
  const lane = await uistoreopen();
  if (!lane) return null;
  let written = 0;
  for (const row of rows) {
    lane.upsert.run(row.key, locale, row.value);
    written += 1;
  }
  return written;
}

/**
 * uistoreingest — the boot seed: the uistore seed rows and the labels
 * manifest rows (the interface copy the pages already ride) fill the table
 * together, so one db answers every surface of the vault. Equal keys
 * update in place; the seed never invents a word.
 *
 * @param locale the locale the seed rows answer.
 * @returns the count of rows ingested, or null when the lane is away.
 */
export async function uistoreingest(locale: string = DEFAULTLOCALE): Promise<number | null> {
  const rows: { key: string; value: string }[] = Object.entries(SEED).map(([key, value]) => ({ key, value }));
  for (const [key, value] of Object.entries(LABEL_MANIFEST)) {
    if (SEED[key] === undefined) rows.push({ key, value });
  }
  return uistoreupsert(rows, locale);
}

/** The one-shot boot ingest of the route lane (memoized; a host without
 * the sqlite lane resolves to null once and the seed keeps answering). */
let bootingest: Promise<number | null> | null = null;

/**
 * ensureuicopyingested — the lazy boot the route lane rides: the seed
 * fills the table on the first copy request, never twice.
 *
 * @returns the ingested row count (null when the lane is away).
 */
export function ensureuicopyingested(): Promise<number | null> {
  bootingest ??= uistoreingest();
  return bootingest;
}
