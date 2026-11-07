/**
 * onboardingstore.ts — the shared sqlite mechanism of the onboarding lane:
 * the seen-flags table, the parameterized reads and the seen-wins upsert
 * every family app rides. the vault owns the onboarding storage lane (the
 * storage law of the family): each app keeps its schema, its table name and
 * its exported accessor surface — app data, never duplicated logic — and
 * builds its accessors over this factory with the storage lane it already
 * opened. every statement is prepared and bound — no sql is ever assembled
 * by string concatenation (only the developer-pinned table name rides the
 * ddl text; every value the queries touch rides a bound parameter) — and a
 * stage marked anywhere stays marked: the flags only ever move forward, the
 * flow is never forced twice.
 *
 * the module is browser-safe by construction: zero imports (no
 * better-sqlite3, no node builtins — the lane and the parameter types are
 * owned here so not even a type-only db edge rides the graph), and the
 * lane is an injected structural interface, never a concrete storage
 * import, so the browser graph of the apps that reach their db module
 * (the lazy getry mirror) bundles the mechanism without the native
 * binding — the labelstore precedent.
 */

/** the parameter types the lane binds (sqlite stores them narrow; owned
 * here so the store carries no import edge — the labelstore precedent). */
export type SqlParam = string | number | bigint | boolean | null;

/** the structural lane seat the store rides: the parameterized helpers
 * every storage lane of the family answers (the vault StorageLane
 * satisfies it whole; the apps that ride their own driver — the
 * node:sqlite saddle, the lazy getry mirror — adapt their seats onto
 * it). an injected interface, never a concrete storage import. */
export type OnboardingLane = {
  /** runs a parameterized statement (the upsert seat). */
  execute(sql: string, params?: readonly SqlParam[]): unknown;
  /** runs a parameterized query and answers the first row. */
  queryOne(sql: string, params?: readonly SqlParam[]): unknown;
  /** runs raw sql (the idempotent ddl seat). */
  exec(ddl: string): void;
};

/** the stage flags the entry flow consults, as booleans (the two gates of
 * the app: the intro splash and the first-run onboarding). */
export type OnboardingFlags = { introseen: boolean; onboardingseen: boolean };

/** the stages one call can mark seen. */
export type OnboardingStage = "intro" | "onboarding";

/** the mirrored row of the onboarding table: the flags beside the visitor
 * key and the write stamp (the accessors that answer the whole row ride
 * this door). */
export type OnboardingStateRow = {
  id: number;
  visitor: string;
  introseen: boolean;
  onboardingseen: boolean;
  updatedAt: string;
};

/** the raw sqlite projection the row read answers (the flags ride the 0/1
 * cells before the boolean coercion). */
type OnboardingStateRowSql = {
  id: number;
  visitor: string;
  introseen: number;
  onboardingseen: number;
  updatedAt: string;
};

/** the store the factory returns: the flag read, the row read and the
 * seen-wins stage write — the three doors every family app already
 * exports over its own lane. */
export type OnboardingStore = {
  /** reads the stage flags of one visitor (undefined before the first write). */
  getOnboardingState(visitor: string): OnboardingFlags | undefined;
  /** reads the whole mirrored row of one visitor (undefined before the
   * first write). */
  getOnboardingRow(visitor: string): OnboardingStateRow | undefined;
  /** marks one stage seen — the idempotent seen-wins upsert: "intro" marks
   * the splash, "onboarding" marks the splash and the finish (the flow
   * order — the later stage implies the earlier). */
  setOnboardingStage(visitor: string, stage: OnboardingStage): void;
};

/** the factory options: the table name answers the app's own schema (the
 * family default onboarding_states; the apps that drifted a singular or a
 * lowercase seat keep their name — app data, never logic). */
export type OnboardingStoreOptions = {
  /** the table the store reads and writes (default "onboarding_states"). */
  tableName?: string;
};

/** Builds one onboarding store over the app's storage lane: the idempotent
 * table, the parameterized reads and the seen-wins upsert. the mechanism
 * is owned here — the vault storage engine — and every family app
 * consumes it as a library over the lane it already opened; the schema,
 * the table name and the exported accessor surface stay app data. */
export function createOnboardingStore(lane: OnboardingLane, options: OnboardingStoreOptions = {}): OnboardingStore {
  const table = options.tableName ?? "onboarding_states";
  /* the idempotent ddl (the cadria shape — the cleanest seat the family
   * rides): the app's own schema block usually creates the table first,
   * and this block is the belt-and-braces seat so the lane answers even
   * before the app schema ran. only the developer-pinned table name rides
   * the text; every value rides a bound parameter. */
  lane.exec(`CREATE TABLE IF NOT EXISTS ${table} (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  visitor        TEXT NOT NULL UNIQUE,
  introseen      INTEGER NOT NULL DEFAULT 0,
  onboardingseen INTEGER NOT NULL DEFAULT 0,
  updatedAt      TEXT NOT NULL DEFAULT (datetime('now'))
)`);

  /** the flag read: parameterized by visitor, undefined before the first
   * write, the 0/1 cells coerced to the booleans the gates consult. */
  function getOnboardingState(visitor: string): OnboardingFlags | undefined {
    const row = lane.queryOne(`SELECT introseen, onboardingseen FROM ${table} WHERE visitor = ?`, [visitor]) as
      | Pick<OnboardingStateRowSql, "introseen" | "onboardingseen">
      | undefined;
    if (!row) return undefined;
    return { introseen: row.introseen === 1, onboardingseen: row.onboardingseen === 1 };
  }

  /** the row read: the whole mirrored row of one visitor — the alias
   * normalizes the drifted column spellings the family tables declare
   * (the lowercase seat the game app rides) so every row answers the same
   * key whatever the schema spelled. */
  function getOnboardingRow(visitor: string): OnboardingStateRow | undefined {
    const row = lane.queryOne(
      `SELECT id, visitor, introseen, onboardingseen, updatedAt AS updatedAt FROM ${table} WHERE visitor = ?`,
      [visitor],
    ) as OnboardingStateRowSql | undefined;
    if (!row) return undefined;
    return {
      id: row.id,
      visitor: row.visitor,
      introseen: row.introseen === 1,
      onboardingseen: row.onboardingseen === 1,
      updatedAt: row.updatedAt,
    };
  }

  /** the stage write: the idempotent seen-wins upsert — "intro" marks the
   * splash, "onboarding" marks the splash and the finish (the flow order),
   * and the MAX arms keep a replayed or out-of-order write from ever
   * unseeing a stage. */
  function setOnboardingStage(visitor: string, stage: OnboardingStage): void {
    lane.execute(
      `INSERT INTO ${table} (visitor, introseen, onboardingseen, updatedAt)
       VALUES (?, ?, ?, datetime('now'))
       ON CONFLICT(visitor) DO UPDATE SET
         introseen = MAX(introseen, excluded.introseen),
         onboardingseen = MAX(onboardingseen, excluded.onboardingseen),
         updatedAt = datetime('now')`,
      [visitor, 1, stage === "onboarding" ? 1 : 0],
    );
  }

  return { getOnboardingState, getOnboardingRow, setOnboardingStage };
}
