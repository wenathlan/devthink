// # db — the self-hosted sqlite runtime of the site: better-sqlite3 bootstrap and
// parameterized query helpers only. Every statement is prepared and parameterized —
// no sql is ever assembled by string concatenation. The schema mirrors
// prisma/schema.prisma and the seed module provides the first-run rows; the site api
// serves the same tables to the Sol pages over HTTPS (see catalog.ts).

import { openStorageLane } from "@wenathlan/vault/storagelane";
import { LABEL_MANIFEST, LABEL_REVISION } from "./labels.ts";
import {
  seedConfigBlocks,
  seedDnssecAlgorithms,
  seedDnssecKeyCards,
  seedDohFirstCards,
  seedHeroBadges,
  seedLibraryCards,
  seedLocaleChoices,
  seedPublicationSteps,
  seedRecordSets,
  seedResolverChoices,
  seedRolloverSteps,
  seedTransports,
  seedZones,
} from "./seed.ts";

const lane = openStorageLane({ defaultFile: "./local.db" });

/** the one sqlite connection of the runtime (re-exported seat of the lane). */
export const db = lane.db;

/** the parameterized helpers of the site store (re-exported seats of the lane). */
export const { execute, queryAll, queryOne } = lane;

/** the parameter types the helpers bind (re-exported seat of the lane). */
export type { SqlParam } from "@wenathlan/vault/storagelane";


const SCHEMA = `
CREATE TABLE IF NOT EXISTS zones (
  origin TEXT PRIMARY KEY,
  kind   TEXT NOT NULL,
  serial TEXT NOT NULL,
  state  TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS record_sets (
  id     INTEGER PRIMARY KEY AUTOINCREMENT,
  ordinal INTEGER NOT NULL,
  kind   TEXT NOT NULL,
  name   TEXT,
  type   TEXT,
  data   TEXT,
  note   TEXT,
  line   TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS dnssec_keys (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  zone_origin TEXT NOT NULL,
  role       TEXT NOT NULL,
  algorithm  INTEGER NOT NULL DEFAULT 15,
  active     INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS gateway_routes (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  zone_origin TEXT NOT NULL,
  transport   TEXT NOT NULL,
  port        TEXT NOT NULL,
  spec        TEXT,
  state       TEXT NOT NULL DEFAULT 'planned',
  enabled     INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS content_rows (
  kind    TEXT NOT NULL,
  ordinal INTEGER NOT NULL,
  payload TEXT NOT NULL,
  PRIMARY KEY (kind, ordinal)
);
CREATE TABLE IF NOT EXISTS onboarding_state (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  visitor        TEXT NOT NULL UNIQUE,
  introseen      INTEGER NOT NULL DEFAULT 0,
  onboardingseen INTEGER NOT NULL DEFAULT 0,
  "updatedAt"    TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS labels (
  id         TEXT PRIMARY KEY,
  text       TEXT NOT NULL,
  revision   INTEGER NOT NULL DEFAULT 0,
  updatedAt  TEXT NOT NULL DEFAULT (datetime('now')),
  translated INTEGER NOT NULL DEFAULT 0
);
`;

/** Creates the tables when they do not exist (idempotent, mirrors the prisma schema). */
export function ensureSchema(): void {
  lane.exec(SCHEMA);
}

/** Inserts the seed tables of the site when the content rows are still empty. */
export function seedIfEmpty(): void {
  ensureSchema();
  const count = queryOne<{ total: number }>("SELECT COUNT(*) AS total FROM content_rows");
  if (count && count.total > 0) return;

  const insertContent = db.prepare("INSERT OR IGNORE INTO content_rows (kind, ordinal, payload) VALUES (?, ?, ?)");
  const insertZone = db.prepare("INSERT OR IGNORE INTO zones (origin, kind, serial, state) VALUES (?, ?, ?, ?)");
  const insertRecord = db.prepare(
    "INSERT INTO record_sets (ordinal, kind, name, type, data, note, line) VALUES (?, ?, ?, ?, ?, ?, ?)",
  );

  const contentTables: readonly [string, readonly unknown[]][] = [
    ["publication-steps", seedPublicationSteps],
    ["cards.home-library", seedLibraryCards],
    ["cards.dnssec-keys", seedDnssecKeyCards],
    ["cards.doh-first", seedDohFirstCards],
    ["badges.hero", seedHeroBadges],
    ["badges.dnssec-alg", seedDnssecAlgorithms],
    ["transports", seedTransports],
    ["config-blocks", seedConfigBlocks],
    ["rollover-steps", seedRolloverSteps],
    ["choices.resolver", seedResolverChoices],
    ["choices.locale", seedLocaleChoices],
  ];
  const writeContent = db.transaction(() => {
    for (const [kind, rows] of contentTables) {
      rows.forEach((row, ordinal) => {
        insertContent.run(kind, ordinal, JSON.stringify(row));
      });
    }
    for (const zone of seedZones) {
      insertZone.run(zone.origin, zone.kind, zone.serial, zone.state);
    }
    seedRecordSets.forEach((row, ordinal) => {
      insertRecord.run(
        ordinal,
        row.kind,
        row.name ?? null,
        row.type ?? null,
        row.data ?? null,
        row.note ?? null,
        row.line,
      );
    });
  });
  writeContent();
}

/** Typed accessor of the zones table (parameterized by origin). */
export function zoneRow(origin: string): { origin: string; kind: string; serial: string; state: string } | undefined {
  return queryOne("SELECT origin, kind, serial, state FROM zones WHERE origin = ?", [origin]);
}

/** Typed accessor of the record set lines (parameterized by nothing: the apex snapshot). */
export function recordSetRows(): { ordinal: number; kind: string; line: string }[] {
  return queryAll("SELECT ordinal, kind, line FROM record_sets ORDER BY ordinal");
}

/** Typed row of the onboarding_state table (the first-run state of one visitor). */
export type OnboardingStateRow = {
  visitor: string;
  introseen: boolean;
  onboardingseen: boolean;
  updatedAt: string;
};

/** Typed accessor of one visitor's first-run state (parameterized by visitor). */
export function getonboardingstate(visitor: string): OnboardingStateRow | undefined {
  const row = queryOne<{ visitor: string; introseen: number; onboardingseen: number; updatedAt: string }>(
    'SELECT visitor, introseen, onboardingseen, "updatedAt" AS updatedAt FROM onboarding_state WHERE visitor = ?',
    [visitor],
  );
  if (!row) return undefined;
  return {
    visitor: row.visitor,
    introseen: row.introseen === 1,
    onboardingseen: row.onboardingseen === 1,
    updatedAt: row.updatedAt,
  };
}

/** Writes one stage of the first run for a visitor (upsert, seen-monotonic —
 * "intro" marks the splash, "onboarding" marks the splash and the finish). */
export function setonboardingstage(visitor: string, stage: "intro" | "onboarding"): void {
  execute(
    `INSERT INTO onboarding_state (visitor, introseen, onboardingseen, "updatedAt")
     VALUES (?, ?, ?, ?)
     ON CONFLICT(visitor) DO UPDATE SET
       introseen = MAX(introseen, excluded.introseen),
       onboardingseen = MAX(onboardingseen, excluded.onboardingseen),
       "updatedAt" = excluded."updatedAt"`,
    [visitor, 1, stage === "onboarding" ? 1 : 0, new Date().toISOString()],
  );
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

/** the raw labels projection sqlite answers (translated rides the 0/1 cell). */
type LabelRowSql = {
  id: string;
  text: string;
  revision: number;
  updatedAt: string;
  translated: number;
};

/** Projects one raw labels row into the stored label projection. */
function labelRowOf(row: LabelRowSql): LabelRow {
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
 * prepared and parameterized, never concatenated SQL.
 *
 * @param id the page.widget.key path of the label.
 * @param text the surface text.
 * @param revision the manifest revision the text carries.
 * @param translated true when the row carries a runtime translation.
 * @returns the stored label projection.
 */
export function saveLabel(id: string, text: string, revision: number, translated = false): LabelRow {
  execute(
    `INSERT INTO labels (id, text, revision, updatedAt, translated) VALUES (?, ?, ?, datetime('now'), ?)
     ON CONFLICT(id) DO UPDATE SET
       text = excluded.text,
       revision = excluded.revision,
       updatedAt = excluded.updatedAt,
       translated = excluded.translated`,
    [id, text, revision, translated ? 1 : 0],
  );
  const row = queryOne<LabelRowSql>("SELECT id, text, revision, updatedAt, translated FROM labels WHERE id = ?", [id]);
  if (!row) throw new Error(`label "${id}" write did not land`);
  return labelRowOf(row);
}

/**
 * Reads one label row by its page.widget.key path.
 *
 * @param id the label id.
 * @returns the row, or undefined when absent.
 */
export function readLabel(id: string): LabelRow | undefined {
  const row = queryOne<LabelRowSql>("SELECT id, text, revision, updatedAt, translated FROM labels WHERE id = ?", [id]);
  return row ? labelRowOf(row) : undefined;
}

/**
 * Reads every label row of the store ordered by id.
 *
 * @returns the label rows.
 */
export function readAllLabels(): LabelRow[] {
  return queryAll<LabelRowSql>("SELECT id, text, revision, updatedAt, translated FROM labels ORDER BY id ASC").map(
    labelRowOf,
  );
}

/**
 * Ingests the english manifest of labels.ts into the labels table — the
 * db-side twin of the browser seedLabels: idempotent, the changed rows
 * refresh, and the translated rows stay protected from the overwrite.
 *
 * @returns the seeded and protected row counts.
 */
export function seedLabelRows(): { seeded: number; protected: number } {
  ensureSchema();
  const rows = new Map(readAllLabels().map((row) => [row.id, row]));
  let seeded = 0;
  let saved = 0;
  for (const [id, text] of Object.entries(LABEL_MANIFEST)) {
    const row = rows.get(id);
    if (row === undefined || (row.translated !== true && row.text !== text)) {
      saveLabel(id, text, LABEL_REVISION, row?.translated ?? false);
      seeded += 1;
    }
    saved += 1;
  }
  return { seeded, protected: saved - seeded };
}

/* the copy law rides the db boot: the label seed ingests the english manifest
 * of labels.ts beside the schema (the interface strings land in the store,
 * the translated rows protected from the overwrite). best effort: a sealed
 * store never blocks the boot, the manifest always answers the wingets. */
try {
  seedLabelRows();
} catch {
  /* the manifest answers; the store catches up on the next boot */
}
