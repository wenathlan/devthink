// # uistore — the ui store of the vault (root layer): every user-visible
// string the product face renders rides the database — the uicopy table of
// the vault's own better-sqlite3 store, served same-origin over
// /api/v1/ui/copy (and one row over /api/v1/ui/copy/:key) — and the
// component never hardcodes text. Wave 14, the uistore consolidation (the
// audit ranking two): the engine the devthink os seat once carried as its
// near-identical twin — the uicopy table schema, the same-origin copy
// loader, the typed accessor chain, the {token} fill door, the mount hook
// and the whole better-sqlite3 store lane (the lazy createRequire open, the
// get/list/upsert seats, the boot ingest and its memoized ensure) — rides
// HERE once as the createuistore factory the family seats drive over their
// own data (the onboardingstore law: the vault owns the storage mechanism,
// each app keeps its seed rows, its db door, its base validator and its
// fallback chain as app data, never duplicated logic), and the devthink os
// seat ports the factory through the published library specifier
// ("@wenathlan/vault/uistore") keeping only the os copy — its winget seed,
// its copy store and its label seat. The literals of the vault face live
// HERE and ONLY here as the build seed (the copy seed the interface already
// rides keeps its own home in labels.ts and answers through the same
// chain): the server boot ingests the seed rows into the table, the live
// rows answer the pages, and the seed answers the offline static build (the
// memory-seed law — never browser storage). The typed accessor `uicopy(key)`
// reads the live rows the platform answered and falls back to the seed and
// then to the labels store, so the interface never shows a blank where a
// word belongs and the db stays the single living config of the winget copy.
//
// @section 1  engine — the createuistore factory: the shared uicopy store
//             mechanism (the client loader, the accessor chain, the fill
//             door, the mount hook and the better-sqlite3 lane — the native
//             addon loads lazily through createRequire so the browser bundle
//             never touches it, the sandboxlane sqlite precedent)
// @section 2  seat — the vault data over the factory: the seed rows, the
//             labels door and the exported surface every vault importer
//             keeps resolving

import { useEffect, useState } from "react";
import { LABEL_MANIFEST, type LabelKey, label } from "./labels.ts";
import { onboardingbase } from "./onboardingstate.ts";

/* ------------------------------------------------------------------ */
/* @section 1 — engine: the createuistore factory                       */
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

/** The default locale every seed row answers. */
const DEFAULTLOCALE = "en";

/** The schema of the uicopy table: one row per key per locale, the write
 * stamp riding the row (the db is the living config of the copy). */
const UISCHEMA =
  "CREATE TABLE IF NOT EXISTS uicopy (key TEXT NOT NULL, locale TEXT NOT NULL DEFAULT 'en', value TEXT NOT NULL, updated TEXT NOT NULL DEFAULT (datetime('now')), PRIMARY KEY (key, locale))";

/** The narrow prepared surface the lane drives of one sqlite database
 * (the better-sqlite3 seat first, the node:sqlite builtin behind it — bound
 * parameters only, never a concatenated statement; the builtin answers
 * the pragmas through exec, so the pragma seat rides optional). */
interface UiDatabase {
  prepare(statement: string): {
    get(...params: unknown[]): unknown;
    all(...params: unknown[]): unknown[];
    run(...params: unknown[]): { changes: number; lastInsertRowid: number | bigint };
  };
  pragma?(statement: string): unknown;
  exec(statement: string): unknown;
  close(): void;
}

/** One open lane: the handle plus its prepared statements. */
interface uistorelane {
  db: UiDatabase;
  get: ReturnType<UiDatabase["prepare"]>;
  list: ReturnType<UiDatabase["prepare"]>;
  upsert: ReturnType<UiDatabase["prepare"]>;
}

/** The factory options: the app data and the app doors every seat wires
 * (the engine owns the mechanism, the seat owns the data — the
 * onboardingstore factory law). */
export interface uistoreoptions {
  /** The build seed of the seat: the one place the app's copy literals
   * live (frozen rows, dotted key to text). */
  seed: Readonly<Record<string, string>>;
  /** The db file door of the seat: resolves lazily at first open so the
   * env can point the tests (the vault seat reads VAULT_UISTORE_DB, the os
   * seat DEVTHINK_UISTORE_DB; the default lands beside the working
   * directory the way the site store does). */
  dbfile: () => string;
  /** The validated base door the live loader rides: answers the
   * same-origin origin the platform serves /api/v1/ui/copy over, or null
   * when no base answers — the seed keeps answering (the offline build
   * law). */
  base: () => string | URL | null;
  /** The chain door below the seed: the store the accessor consults when
   * neither the live rows nor the seed carry the key (the vault seat rides
   * the labels store, the os seat its copy store); an undefined answer
   * falls to the key itself (the missing key is loud, never a blank). */
  fallback?: (key: string) => string | undefined;
  /** The second seed the boot ingest merges: the rows the seat's own seed
   * does not already carry fill the table together, so one db answers
   * every surface of the app (the vault seat merges the labels manifest,
   * the os seat the copy seed) — equal keys update in place; the seed
   * never invents a word. */
  extraseed?: () => Readonly<Record<string, string>>;
}

/** The seat surface the factory returns: the names every family app
 * already exports over its own uistore door, so each importer keeps
 * resolving the same surface. */
export interface uistoreseat {
  /** The frozen seed rows (key to text). */
  uistoreseedrows(): Readonly<Record<string, string>>;
  /** Loads the live ui rows over the seat's validated base. */
  loaduicopy(): Promise<void>;
  /** The typed accessor the wingets render through. */
  uicopy(key: string): string;
  /** The placeholder door: fills the {token} slots of one format key. */
  uicopyfill(key: string, values: Record<string, string>): string;
  /** One ui copy row of the db by key. */
  uistoreget(key: string, locale?: string): Promise<uicopyrow | null>;
  /** Every ui copy row of one locale. */
  uistorelist(locale?: string): Promise<uicopyrow[]>;
  /** The write lane: each row upserts in place. */
  uistoreupsert(rows: readonly { key: string; value: string }[], locale?: string): Promise<number | null>;
  /** The boot seed: the seed rows and the extra seed fill the table. */
  uistoreingest(locale?: string): Promise<number | null>;
  /** The lazy boot the route lane rides: the seed fills the table on the
   * first copy request, never twice. */
  ensureuicopyingested(): Promise<number | null>;
}

/**
 * createuistore — the shared ui-copy store factory of the family (the wave
 * 14 uistore consolidation): builds one seat over the app's data and doors.
 * The client lane — the live loader (GET /api/v1/ui/copy over the seat's
 * validated base, the failure keeps the seed answering), the typed accessor
 * chain (the live rows, the seed, the seat's fallback door, then the key
 * itself), the {token} fill door and the mount hook — and the store lane —
 * the uicopy table on the app's own better-sqlite3 database (the native
 * addon loads through createRequire so the bundle never embeds the addon
 * identifiers, and a host without the sqlite lane answers null so the
 * routes and the ingestion degrade honestly to the build seed) — answer
 * from this one factory, never duplicated inside a seat.
 *
 * @param options the app data and doors (seed, dbfile, base, fallback, extraseed).
 * @returns the seat surface the app's importers keep resolving.
 */
export function createuistore(options: uistoreoptions): uistoreseat {
  const SEED = options.seed;

  /** The live rows the platform answered (null until the first load). */
  let uilive: Readonly<Record<string, string>> | null = null;

  /**
   * Loads the live ui rows over the seat's validated base: GET
   * /api/v1/ui/copy (the same-origin lane — the deployed gateway answers
   * it; the base door refuses the hosts its validator refuses). The
   * failure keeps the seed answering (the offline build law).
   */
  async function loaduicopy(): Promise<void> {
    if (uilive) return;
    const base = options.base();
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
   * The typed accessor every winget renders through: the live db row when
   * the platform answered, the uistore seed otherwise, then the seat's
   * fallback door (the store the app's other copy already rides), the key
   * itself when neither holds it (the missing key is loud, never a blank).
   *
   * @param key the dotted copy key.
   * @returns the text the db (or the seed chain) serves.
   */
  function uicopy(key: string): string {
    return uilive?.[key] ?? SEED[key] ?? options.fallback?.(key) ?? key;
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
  function uicopyfill(key: string, values: Record<string, string>): string {
    return uicopy(key).replace(/\{(\w+)\}/g, (match, token: string) => values[token] ?? match);
  }

  /** The opened lane of this seat (undefined until the first open, null
   * when this host carries no sqlite lane — the browser answers the seed). */
  let openedlane: uistorelane | null | undefined;

  /** walks the pragma ladder on whichever driver answered: the family
   * seat carries the pragma method, the node builtin answers through
   * exec — one law, both faces (the storage doctrine's walkPragmas pair). */
  const walkuipragmas = (db: UiDatabase): void => {
    if (typeof db.pragma === "function") {
      db.pragma("journal_mode = WAL");
      db.pragma("foreign_keys = ON");
    } else {
      db.exec("PRAGMA journal_mode = WAL;");
      db.exec("PRAGMA foreign_keys = ON;");
    }
  };

  /** binds the prepared statement triple over whichever driver answered
   * (the same bound-parameter surface both seats carry). */
  const uistorelaneof = (db: UiDatabase): uistorelane => ({
    db,
    get: db.prepare("SELECT key, value, locale, updated FROM uicopy WHERE key = ? AND locale = ?"),
    list: db.prepare("SELECT key, value, locale, updated FROM uicopy WHERE locale = ? ORDER BY key"),
    upsert: db.prepare(
      "INSERT INTO uicopy (key, locale, value, updated) VALUES (?, ?, ?, datetime('now')) ON CONFLICT(key, locale) DO UPDATE SET value = excluded.value, updated = datetime('now')",
    ),
  });

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
      if (typeof Database !== "function") throw new Error("the better-sqlite3 seat is absent on this host");
      const db = new Database(options.dbfile());
      walkuipragmas(db);
      db.exec(UISCHEMA);
      openedlane = uistorelaneof(db);
    } catch {
      /* the family seat could not answer (the ci lanes install with
       * ignore-scripts, so the native binding never builds — the mirror
       * lottery the saddle npmrc pin keeps visible): the node:sqlite
       * builtin rides the same prepared surface the family seat carries
       * (the sandboxlane sqlite precedent, the vaulthandoff driver pair
       * the storage doctrine names), and only a host with neither seat
       * answers null — the routes and the ingestion degrade honestly to
       * the build seed. */
      try {
        const builtin = (process as unknown as { getBuiltinModule?: (id: string) => unknown }).getBuiltinModule?.(
          "node:sqlite",
        ) as { DatabaseSync?: new (file: string) => UiDatabase } | undefined;
        if (typeof builtin?.DatabaseSync !== "function") return openedlane;
        const db = new builtin.DatabaseSync(options.dbfile());
        walkuipragmas(db);
        db.exec(UISCHEMA);
        openedlane = uistorelaneof(db);
      } catch {
        openedlane = null;
      }
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
  async function uistoreget(key: string, locale: string = DEFAULTLOCALE): Promise<uicopyrow | null> {
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
  async function uistorelist(locale: string = DEFAULTLOCALE): Promise<uicopyrow[]> {
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
  async function uistoreupsert(
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
   * uistoreingest — the boot seed: the uistore seed rows and the seat's
   * extra seed rows (the copy the app's other surfaces already ride) fill
   * the table together, so one db answers every winget of the app. Equal
   * keys update in place; the seed never invents a word.
   *
   * @param locale the locale the seed rows answer.
   * @returns the count of rows ingested, or null when the lane is away.
   */
  async function uistoreingest(locale: string = DEFAULTLOCALE): Promise<number | null> {
    const rows: { key: string; value: string }[] = Object.entries(SEED).map(([key, value]) => ({ key, value }));
    for (const [key, value] of Object.entries(options.extraseed?.() ?? {})) {
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
  function ensureuicopyingested(): Promise<number | null> {
    bootingest ??= uistoreingest();
    return bootingest;
  }

  /**
   * The seed surface: the db fill, the tests and the offline build read it;
   * the components never (they read through uicopy).
   *
   * @returns the frozen seed rows (key to text).
   */
  function uistoreseedrows(): Readonly<Record<string, string>> {
    return SEED;
  }

  return {
    uistoreseedrows,
    loaduicopy,
    uicopy,
    uicopyfill,
    uistoreget,
    uistorelist,
    uistoreupsert,
    uistoreingest,
    ensureuicopyingested,
  };
}

/* ------------------------------------------------------------------ */
/* @section 2 — seat: the vault data over the factory                  */
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
  /* the live lane of the browse — the honest ledger declaration */
  "face.browse.live": "live {count} objects · {bytes} — the engine answered the real ledger",
  "face.browse.rehearsal":
    "a seeded rehearsal of the safe — the engine lane is away, the declared seed answers (never live bytes)",
  "face.browse.seal.live": "engine-verified",
  /* the deposit widget — the live ledger door */
  "face.browse.deposit.aria": "seal a deposit into the real ledger",
  "face.browse.deposit.head": "deposit into the live ledger",
  "face.browse.deposit.pathPlaceholder": "/uploads/note.txt",
  "face.browse.deposit.pathAria": "the absolute path of the deposit",
  "face.browse.deposit.mimePlaceholder": "text/plain",
  "face.browse.deposit.mimeAria": "the content type of the deposit",
  "face.browse.deposit.bodyPlaceholder": "the bytes to seal…",
  "face.browse.deposit.bodyAria": "the bytes the engine seals",
  "face.browse.deposit.cta": "seal the deposit",
  "face.browse.deposit.busy": "sealing…",
  "face.browse.deposit.away": "the engine lane is away — the deposit door opens when the configured origin answers.",
  /* --------------------------- db console ---------------------------- */
  "face.console.aria": "the database console of the vault",
  "face.console.head": "database console",
  "face.console.caption": "census · channels · sweep plan",
  "face.console.line.census": "census  {rows} rows · {bytes} under seal",
  "face.console.line.live": "live    {objects} objects · {bytes} · {chunks} chunks — the engine answered",
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
  /* -------------------------- signup gate ----------------------------- */
  "face.signup.aria": "the signup gate of the vault",
  "face.signup.head": "open your database",
  "face.signup.lede":
    "sign up, register an app database and the vault answers your database id with an api key shown exactly once — the key is hashed the moment it lands, so the one display is the only display.",
  "face.signup.email": "email",
  "face.signup.emailAria": "the email of the account",
  "face.signup.password": "password",
  "face.signup.passwordAria": "the password of the account (stored only as its salted digest)",
  "face.signup.name": "database name",
  "face.signup.nameAria": "the name of the app database",
  "face.signup.cta": "open the database",
  "face.signup.busy": "opening the database…",
  "face.signup.away":
    "the engine lane is away — the signup gate needs the configured origin before it can open a database.",
  "face.signup.failure": "the gate refused: {message}",
  "face.signup.once.title": "your database is open",
  "face.signup.once.warning":
    "shown exactly once — the vault stores only the sha-256 digest of this key; copy it now, it never answers again.",
  "face.signup.once.databaseId": "database id",
  "face.signup.once.key": "api key (shown once)",
  "face.signup.once.copy": "copy the key",
  "face.signup.once.copied": "copied — store it somewhere safe, the vault cannot show it again",
  /* --------------------------- plans live ------------------------------ */
  "face.plans.liveQuota": "live {state} · {usage} sealed of {limit} — the engine answered",
  "face.plans.liveQuotaAria": "the live quota verdict of the pinned project",
  /* ----------------------------- my files ----------------------------- */
  "face.myfiles.aria": "the my files surface of the vault",
  "face.myfiles.head": "my files",
  "face.myfiles.caption": "the person's drive — the live ledger, the quota verdict and the hd unlock",
  "face.myfiles.count": "{count} objects · {bytes} yours",
  "face.myfiles.col.path": "object",
  "face.myfiles.col.channel": "channel",
  "face.myfiles.col.size": "size",
  "face.myfiles.col.digest": "digest",
  "face.myfiles.empty": "no object answers your project yet",
  "face.myfiles.emptyHint": "deposit through the object browser — the ledger answers here the moment it seals.",
  "face.myfiles.awayTitle": "the engine lane is away",
  "face.myfiles.away": "my files answers the live origin only — never a rehearsal of your bytes.",
  "face.myfiles.meterAria": "the capacity of the drive — the real usage against the limit",
  "face.myfiles.meter.label": "{usage} of {limit} — {pct}% sealed",
  "face.myfiles.meter.unlimited": "unlimited — the row on the database holds no cap",
  "face.myfiles.quota.usageLabel": "usage",
  "face.myfiles.quota.limitLabel": "limit",
  "face.myfiles.quota.remainingLabel": "remaining",
  "face.myfiles.quota.stateLabel": "state",
  "face.myfiles.quota.stateValue": "{state} — the engine verdict",
  "face.myfiles.quota.census": "{chunks} chunks · {bytes} under seal",
  "face.myfiles.refresh": "reread",
  "face.myfiles.refresh.aria": "reread the drive — the quota verdict and the ledger answer fresh",
  "face.myfiles.unlock.aria": "the hd unlock of the vault",
  "face.myfiles.unlock.head": "unlock the drive",
  "face.myfiles.unlock.lede":
    "the limit is yours: megabytes at any scale, or unlimited — the floor the operator configured never caps the row.",
  "face.myfiles.unlock.mbAria": "the new limit in megabytes",
  "face.myfiles.unlock.mbPlaceholder": "megabytes of the new limit",
  "face.myfiles.unlock.cta": "set the limit",
  "face.myfiles.unlock.unlimited": "unlock unlimited",
  "face.myfiles.unlock.busy": "unlocking…",
  "face.myfiles.unlock.invalid": "the limit must be whole megabytes — one or more.",
  "face.myfiles.unlock.setTitle": "the limit answered",
  "face.myfiles.unlock.set": "the limit answers {limit} now — the row on the database, set at the owner's word.",
  "face.myfiles.unlock.setUnlimited": "the drive is unlimited — no cap rides the row anymore.",
  "face.myfiles.unlock.refusedTitle": "the unlock refused",
  "face.myfiles.unlock.refused": "the unlock refused: {message}",
  "face.myfiles.unlimited": "unlimited",
  /* ------------------------------ tabs ------------------------------- */
  "home.tabs.myfiles": "my files",
  /* ----------------------------- skeleton ---------------------------- */
  "face.skeleton.aria": "loading the ledger",
});

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

/* the seat wiring of the vault (the wave 14 uistore consolidation): the
 * engine rides the factory once and this seat wires the vault doors — the
 * face seed above, the VAULT_UISTORE_DB db door, the onboarding base the
 * same-origin loader rides, the labels store the accessor chain consults
 * and the labels manifest the boot ingest merges — so every vault importer
 * keeps resolving the same exported surface over the one engine. */
const vaultseat = createuistore({
  seed: SEED,
  dbfile: () => process.env.VAULT_UISTORE_DB || "uistore.db",
  base: () => onboardingbase() || null,
  fallback: labelsafe,
  extraseed: () => LABEL_MANIFEST,
});

/* the mount hook of the store-riding winget, hoisted to the module level
 * the react law demands (a hook born inside a factory loses its identity
 * across renders — the biome gate catches exactly this): the core takes
 * the seat's load lane, every seat binds its own — the seed answers the
 * first paint with the same words the db serves, so the swap never
 * flashes. */
export function useUicopyCore(load: () => Promise<void>): void {
  const [, bump] = useState(0);
  useEffect(() => {
    let alive = true;
    void load().then(() => {
      if (alive) bump((n) => n + 1);
    });
    return () => {
      alive = false;
    };
  }, [load]);
}

/* the vault mount face of the core hook (the vault seat's own load lane —
 * a module-level binding, never a factory-born hook). */
export function useUicopy(): void {
  useUicopyCore(vaultseat.loaduicopy);
}

export const {
  uistoreseedrows,
  loaduicopy,
  uicopy,
  uicopyfill,
  uistoreget,
  uistorelist,
  uistoreupsert,
  uistoreingest,
  ensureuicopyingested,
} = vaultseat;
