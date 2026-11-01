// # uistore — the ui store of the os (root layer): every user-visible
// string the wingets render rides the database — the uicopy table of the
// app's own better-sqlite3 store, served same-origin over /api/v1/ui/copy
// (and one row over /api/v1/ui/copy/:key) — and the component never
// hardcodes text. The literals live HERE and ONLY here as the build seed
// (the copy seed the auth surfaces ride keeps its own home in copy.ts and
// rides the same table): the server boot ingests the seed rows into the
// table, the live rows answer the pages, and the seed answers the offline
// static build (the memory-seed law — never browser storage). The typed
// accessor `uicopy(key)` reads the live rows the platform answered and
// falls back to the seed and then to the copy store, so the interface
// never shows a blank where a word belongs and the db stays the single
// living config of the winget copy.
//
// @section 1  seed — the build seed rows the db receives at boot
// @section 2  client — the typed accessor, the live loader and the mount
//             hook the wingets render through (browser side)
// @section 3  store — the better-sqlite3 lane of the uicopy table (server
//             side; the native addon loads lazily through createRequire so
//             the browser bundle never touches it — the sandboxlane sqlite
//             precedent)

import { useEffect, useState } from "react";
import { copy, copyseed } from "./copy.ts";
import { ispublichttpsbase, onboardingapibase } from "./onboardingstate.ts";

/* ------------------------------------------------------------------ */
/* @section 1 — seed: the build rows the db receives at boot           */
/* ------------------------------------------------------------------ */

/**
 * The build-time seed of the winget copy: the one place the moved
 * literals live. Every row was extracted verbatim from the winget that
 * renders it (the intro hero statement and keys, the workspace tab strip
 * of the panel, the empty states of the explore sidebar and the files
 * explorer) — nothing invented, nothing dropped. Keys use the dotted
 * surface.path address.
 */
const SEED: Readonly<Record<string, string>> = Object.freeze({
  /* --------------------------- intro hero --------------------------- */
  "intro.hero.leada": "An OS",
  "intro.hero.leadb": "built for",
  "intro.hero.leadc": "every AI",
  "intro.hero.modetoggle": "Toggle OS Mode",
  "intro.hero.mode.agents": "and your agents",
  "intro.hero.mode.studios": "and your studios",
  "intro.hero.subtitle": "Create stream and run any studio or AI team in one unified OS",
  "intro.hero.keyprimary": "Get Started",
  "intro.hero.keysecondary": "Why DevThink?",
  "intro.hero.rating": "4,9",
  "intro.hero.organizer": "The perfect organizer and team builder",
  "intro.hero.timetitle": "Use time to your advantage every day",
  "intro.hero.timebody": "Studios agents and streams in sync",
  "intro.hero.shader": "Neural Shader Core",
  "intro.hero.exploreraria": "Explorer",
  "intro.hero.cadriaaria": "Open Cadria",
  "intro.hero.debonairaria": "Open Debonair",
  /* --------------------- panel nav (workspace tabs) ----------------- */
  "panel.nav.tabs.aria": "Open sessions",
  "panel.nav.tabs.new": "Open a new session",
  "panel.nav.tabs.close": "Close {label}",
  /* ------------------- explore sidebar empty states ----------------- */
  "explore.sidebar.recentsEmpty": "nothing made yet — the studios answer the catalog first.",
  "explore.sidebar.familyEmpty": "the family list is still loading.",
  /* --------------------- files explorer empty states ---------------- */
  "explorer.planEmpty": "No folders yet",
  "explorer.empty": "This folder is empty.",
  /* --------------------- workspace history window -------------------- */
  "workspace.history.localTabs": "Open session tabs remain local to this workspace.",
  /* --------------------- shell navbar (the two modes) --------------- */
  "navbar.mode.aria": "Navbar mode",
  "navbar.mode.desc": "Floating lets the bar loose from the walls; docked pins it to one edge.",
  "navbar.mode.floating": "Floating",
  "navbar.mode.docked": "Docked",
  "navbar.edge.aria": "Dock edge",
  "navbar.edge.bottom": "Bottom edge",
  "navbar.edge.left": "Left edge",
  "navbar.edge.right": "Right edge",
  "navbar.edge.locked": "The edge answers the docked mode — dock the bar first.",
  "navbar.drag.hint":
    "Drag the bar — pull it up to float it, sideways to dock it, off the wall to float it again.",
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
 * Loads the live ui rows from the app database: GET /api/v1/ui/copy over
 * the same validated base the onboarding and the copy ride (the
 * same-origin lane — the dev proxy and the deployed origin answer it).
 * The failure keeps the seed answering (the offline build law).
 */
export async function loaduicopy(): Promise<void> {
  if (uilive) return;
  const base = onboardingapibase();
  if (!base || !ispublichttpsbase(base.toString())) return;
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
 * The typed accessor every winget renders through: the live db row when
 * the platform answered, the uistore seed otherwise, then the copy store
 * (its own live rows and its seed — the home the auth surfaces already
 * ride), the key itself when neither holds it (the missing key is loud,
 * never a blank).
 *
 * @param key the dotted copy key.
 * @returns the text the db (or the seed chain) serves.
 */
export function uicopy(key: string): string {
  return uilive?.[key] ?? SEED[key] ?? copy(key);
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
 * default lands beside the app the way admin.db does). */
function uistorefile(): string {
  return process.env.DEVTHINK_UISTORE_DB || "uistore.db";
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
 * uistorelist — every ui copy row of one locale (the lane the /api/v1/ui/
 * copy endpoint answers).
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
 * uistoreingest — the boot seed: the uistore seed rows and the copy seed
 * rows (the auth titles and buttons the components already ride) fill the
 * table together, so one db answers every winget of the os. Equal keys
 * update in place; the seed never invents a word.
 *
 * @param locale the locale the seed rows answer.
 * @returns the count of rows ingested, or null when the lane is away.
 */
export async function uistoreingest(locale: string = DEFAULTLOCALE): Promise<number | null> {
  const rows: { key: string; value: string }[] = Object.entries(SEED).map(([key, value]) => ({ key, value }));
  for (const [key, value] of Object.entries(copyseed())) {
    if (SEED[key] === undefined) rows.push({ key, value });
  }
  return uistoreupsert(rows, locale);
}
