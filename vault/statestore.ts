/**
 * statestore.ts — the shared sqlite mechanism of the visitor state lane:
 * the generic per-visitor keyed state rows the os persistence hook rides.
 * the vault owns the visitor state storage lane (the storage law of the
 * family): each consumer keys its rows by the anonymous visitor id and the
 * state key it names — app data, never duplicated logic. every statement
 * is prepared and bound — the values ride parameters, never concatenated
 * user input — and a write lands last-write-wins: the newest payload for a
 * visitor and key pair is the one the read answers.
 *
 * the module is browser-safe by construction: zero imports (no
 * better-sqlite3, no node builtins — the lane and the parameter types are
 * owned here so not even a type-only db edge rides the graph), and the
 * lane is an injected structural interface, never a concrete storage
 * import, so the browser graph of the consumers bundles the mechanism
 * without the native binding — the onboardingstore precedent.
 */

/** the parameter types the lane binds (sqlite stores them narrow; owned
 * here so the store carries no import edge — the onboardingstore
 * precedent). */
export type SqlParam = string | number | bigint | boolean | null;

/** the structural lane seat the store rides: the parameterized helpers
 * every storage lane of the family answers (the vault StorageLane
 * satisfies it whole; the onboarding lane is the same shape). an injected
 * interface, never a concrete storage import. */
export type StateLane = {
  /** runs one parameterized statement (the ddl and upsert seats). */
  execute(statement: string, params?: readonly SqlParam[]): unknown;
  /** runs a parameterized query and answers the first row. */
  queryOne(query: string, placeholders: readonly SqlParam[]): unknown;
};

/** the mirrored row of the state table: the payload text beside the
 * visitor and key pair and the write stamp. */
export type StateRow = {
  id: number;
  visitor: string;
  stateKey: string;
  payload: string;
  updatedAt: string;
};

/** the store the factory returns: the payload read and the
 * last-write-wins upsert — the two doors the os persistence hook rides
 * over its own lane. */
export type StateStore = {
  /** reads the stored payload text of one visitor and key pair (undefined
   * before the first write). */
  getState(visitor: string, stateKey: string): string | undefined;
  /** reads the whole mirrored row of one visitor and key pair (undefined
   * before the first write). */
  getRow(visitor: string, stateKey: string): StateRow | undefined;
  /** writes the payload text of one visitor and key pair — the
   * last-write-wins upsert: the newest write is the one the read answers. */
  putState(visitor: string, stateKey: string, payload: string): void;
};

/** Builds one visitor state store over the consumer's storage lane: the
 * idempotent state_states table, the parameterized reads and the
 * last-write-wins upsert. the mechanism is owned here — the vault storage
 * engine — and every consumer imports it as a library over the lane it
 * already opened. */
export function createStateStore(lane: StateLane): StateStore {
  /* the idempotent ddl through the parameterized statement seat (the
   * single-statement CREATE TABLE the lane runs). */
  lane.execute(`CREATE TABLE IF NOT EXISTS state_states (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  visitor    TEXT NOT NULL,
  stateKey   TEXT NOT NULL,
  payload    TEXT NOT NULL,
  updatedAt  TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(visitor, stateKey)
)`);

  /** the payload read: parameterized by the visitor and key pair,
   * undefined before the first write. */
  function getState(visitor: string, stateKey: string): string | undefined {
    const row = lane.queryOne(
      "SELECT payload FROM state_states WHERE visitor = ? AND stateKey = ?",
      [visitor, stateKey],
    ) as Pick<StateRow, "payload"> | undefined;
    return row?.payload;
  }

  /** the row read: the whole mirrored row of one visitor and key pair. */
  function getRow(visitor: string, stateKey: string): StateRow | undefined {
    const row = lane.queryOne(
      "SELECT id, visitor, stateKey, payload, updatedAt AS updatedAt FROM state_states WHERE visitor = ? AND stateKey = ?",
      [visitor, stateKey],
    ) as StateRow | undefined;
    return row ?? undefined;
  }

  /** the payload write: the last-write-wins upsert — the newest write for
   * the pair is the one the read answers. */
  function putState(visitor: string, stateKey: string, payload: string): void {
    lane.execute(
      `INSERT INTO state_states (visitor, stateKey, payload, updatedAt)
       VALUES (?, ?, ?, datetime('now'))
       ON CONFLICT(visitor, stateKey) DO UPDATE SET
         payload = excluded.payload,
         updatedAt = datetime('now')`,
      [visitor, stateKey, payload],
    );
  }

  return { getState, getRow, putState };
}
