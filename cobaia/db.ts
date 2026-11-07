/**
 * db.ts — the self-hosted sqlite runtime of the cobaia: the better-sqlite3
 * bootstrap and the parameterized query helpers of the family site. Every
 * statement is prepared and bound — no sql is ever assembled by string
 * concatenation. The schema mirrors schema.prisma (the documentation of
 * record) and the boot DDL is the idempotent seed-on-first-run: the tables
 * exist after the first open, always. The platform gateway serves the same
 * tables over HTTPS (GET/POST /api/v1/onboarding, GET /api/v1/ui/content);
 * no server route lives here.
 */
import { createOnboardingStore } from "@wenathlan/vault/onboardingstore";
import { openStorageLane } from "@wenathlan/vault/storage";
import { CONTENTKINDS, type contentrow, seedAdsLabel, seedAdsEmpty, seedAdsSlots, seedPlans, seedPosts, seedRoster, seedSupportLinks } from "./content";
import { LABEL_MANIFEST, LABEL_REVISION } from "./labels";

/** the correlated tables the runtime keeps (the family sync contract names). */
export const tables = ["onboarding_states", "labels", "content_rows"] as const;

/** the one storage lane of the site store (WAL, foreign keys, patient locks — the app's own file, the shared mechanism of the vault). */
const lane = openStorageLane({ defaultFile: "./cobaia.db" });

/** the one sqlite connection of the runtime (re-exported seat of the lane). */
export const db = lane.db;

/** the parameterized helpers of the site store (re-exported seats of the lane). */
export const { execute, queryAll, queryOne } = lane;

/** the parameter types the helpers bind (re-exported seat of the lane). */
export type { SqlParam } from "@wenathlan/vault/storage";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS onboarding_states (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  visitor        TEXT NOT NULL UNIQUE,
  introseen      INTEGER NOT NULL DEFAULT 0,
  onboardingseen INTEGER NOT NULL DEFAULT 0,
  updatedAt      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS labels (
  id         TEXT PRIMARY KEY,
  text       TEXT NOT NULL,
  revision   INTEGER NOT NULL DEFAULT 0,
  updatedAt  TEXT NOT NULL DEFAULT (datetime('now')),
  translated INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS content_rows (
  kind     TEXT NOT NULL,
  ordinal  INTEGER NOT NULL,
  payload  TEXT NOT NULL,
  PRIMARY KEY (kind, ordinal)
);
`;

/** Creates the tables when they do not exist (idempotent, mirrors the prisma schema). */
export function ensureSchema(): void {
  lane.exec(SCHEMA);
}

// the boot seed: the tables exist from the first open, always (idempotent).
ensureSchema();

/** one row of the onboarding_states table (the entry-flow gates of a visitor). */
export type OnboardingStateRow = {
  id: number;
  visitor: string;
  introseen: number;
  onboardingseen: number;
  updatedAt: string;
};

/** the stage flags the entry flow consults, as booleans. */
export type OnboardingFlags = { introseen: boolean; onboardingseen: boolean };

/** the onboarding store of the site: the vault factory over the site's own
 * storage lane (the seen-flags table rides the app schema, the read and the
 * seen-wins upsert ride the shared mechanism — never duplicated inside the
 * app; the storage lane law of the family, the labelstore precedent). */
const onboardingstore = createOnboardingStore(lane);

/**
 * Reads the onboarding stage flags of one visitor (parameterized; undefined
 * before the first write). The browser accessor serves the same flags over
 * GET /api/v1/onboarding.
 *
 * @param visitor the visitor key of the row.
 * @returns the flags, or undefined when the visitor never wrote.
 */
export function getOnboardingState(visitor: string): OnboardingFlags | undefined {
  return onboardingstore.getOnboardingState(visitor);
}

/**
 * Marks one onboarding stage seen for a visitor — the idempotent seen-wins
 * upsert of the vault store (a stage seen anywhere stays seen; the later
 * stage implies the earlier — the flow order), prepared and parameterized,
 * never concatenated SQL.
 *
 * @param visitor the visitor key of the row.
 * @param stage the stage the visitor just saw (or deliberately skipped).
 * @returns the flags after the write.
 */
export function setOnboardingStage(visitor: string, stage: "intro" | "onboarding"): OnboardingFlags {
  onboardingstore.setOnboardingStage(visitor, stage);
  return getOnboardingState(visitor) ?? { introseen: false, onboardingseen: false };
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

/* --------------------------------------------------------------------- */
/* content rows — the site content the pages render                       */
/* --------------------------------------------------------------------- */

/** the manifest seed of one content kind: the rows in ordinal order. */
function seedrowsOf(kind: (typeof CONTENTKINDS)[number]): readonly unknown[] {
  switch (kind) {
    case "posts":
      return seedPosts;
    case "roster":
      return seedRoster;
    case "plans":
      return seedPlans;
    case "supportlinks":
      return [seedSupportLinks];
    case "ads.slots":
      return [seedAdsSlots];
    case "ads.label":
      return [seedAdsLabel];
    case "ads.empty":
      return [seedAdsEmpty];
  }
}

/** Encodes the manifest rows of every kind as content rows (kind, ordinal,
 * json payload) — the encoding the api answers and the client loader parses. */
function seedContentRows(): contentrow[] {
  const rows: contentrow[] = [];
  for (const kind of CONTENTKINDS) {
    seedrowsOf(kind).forEach((value, ordinal) => {
      rows.push({ kind, ordinal, payload: JSON.stringify(value) });
    });
  }
  return rows;
}

/**
 * Ingests the content manifest into the content_rows table — idempotent:
 * every manifest row upserts over its (kind, ordinal) seat, so the db stays
 * the single living config of the site content the pages render (the
 * content law: the literals live in the manifest, the rows live here).
 *
 * @returns the number of rows seated.
 */
export function seedContentTable(): number {
  ensureSchema();
  for (const row of seedContentRows()) {
    execute(
      `INSERT INTO content_rows (kind, ordinal, payload) VALUES (?, ?, ?)
       ON CONFLICT(kind, ordinal) DO UPDATE SET payload = excluded.payload`,
      [row.kind, row.ordinal, row.payload],
    );
  }
  return seedContentRows().length;
}

/**
 * Reads every content row of the store, ordered by kind then ordinal — the
 * rows the platform gateway answers over GET /api/v1/ui/content.
 *
 * @returns the content rows of the site store.
 */
export function readContentRows(): contentrow[] {
  return queryAll<Pick<contentrow, "kind" | "ordinal" | "payload">>(
    "SELECT kind, ordinal, payload FROM content_rows ORDER BY kind ASC, ordinal ASC",
  ).map((row) => ({ kind: row.kind as contentrow["kind"], ordinal: row.ordinal, payload: row.payload }));
}

/* the content law rides the db boot beside the labels: the manifest rows
 * land in the content_rows table from the first open, always (idempotent,
 * best effort — the manifest keeps answering when the store is sealed). */
try {
  seedContentTable();
} catch {
  /* the manifest answers; the store catches up on the next boot */
}
