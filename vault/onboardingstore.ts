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
 * binding — the labelstore precedent. the browser engine of the entry
 * flow rides this seat since the wave 14 onboarding consolidation (the
 * audit ranking four): the host gate that validates a candidate platform
 * base and the seen-wins stage merges are pure and stateless, so they
 * live here once — the plain law the vault, cobaia and stealthhead seats
 * ride (hostallowed, mergeStage) and the strict law the debonair, getry
 * and saddle seats ride (hostallowedstrict, mergeStageordered — the
 * mapped ipv6 normalization, the flow order that lets the later stage
 * imply the earlier) — while every app onboardingstate.ts keeps its own
 * stateful glue (its cache key, its visitor seat, its accessors) and
 * re-exports the engine under the names its importers already cite, the
 * cadria door-shim precedent.
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
   * before the app schema ran. the ddl runs lazily on the first accessor
   * call, memoized once: a module-load creation never touches the driver
   * (the browser graph imports the mechanism whole behind the node seam —
   * the lazy law of the family), while the first use still finds the
   * table in place. only the developer-pinned table name rides the text;
   * every value rides a bound parameter. */
  let seated = false;
  const ensure = (): void => {
    if (seated) return;
    seated = true;
    lane.exec(`CREATE TABLE IF NOT EXISTS ${table} (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  visitor        TEXT NOT NULL UNIQUE,
  introseen      INTEGER NOT NULL DEFAULT 0,
  onboardingseen INTEGER NOT NULL DEFAULT 0,
  updatedAt      TEXT NOT NULL DEFAULT (datetime('now'))
)`);
  };

  /** the flag read: parameterized by visitor, undefined before the first
   * write, the 0/1 cells coerced to the booleans the gates consult. */
  function getOnboardingState(visitor: string): OnboardingFlags | undefined {
    ensure();
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
    ensure();
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
    ensure();
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

/* the browser engine of the entry flow (the wave 14 onboarding
 * consolidation): everything below is pure, zero-import and stateless, so
 * the owner seat carries it without breaking its no-import law — the six
 * app onboardingstate.ts seats that carried these bodies verbatim (the
 * vault, cobaia and stealthhead seats under the plain names, the
 * debonair, getry and saddle seats re-exporting the strict law under the
 * plain names their pages and lanes read) now answer them from here. */

/**
 * Validates a platform base url: HTTPS only, and the host must be public —
 * localhost, loopback, private, link-local, CGNAT, unique-local and reserved
 * documentation ranges are refused; an IPv4-mapped IPv6 literal is normalized
 * back to its IPv4 octets before the range check and any other IPv6 literal
 * is refused (the gateway rides a name).
 *
 * @param base the configured base url candidate.
 * @returns true when the base may be consulted.
 */
export function hostallowed(base: string): boolean {
  try {
    const url = new URL(base);
    if (url.protocol !== "https:") return false;
    const host = url.hostname
      .toLowerCase()
      .replace(/\.+$/, "")
      .replace(/^\[|\]$/g, "");
    if (host.length === 0) return false;
    if (host === "localhost" || host === "0.0.0.0" || host === "::1") return false;
    if (host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) return false;
    // the ipv4-mapped ipv6 form normalizes back to its ipv4 octets
    if (host.startsWith("::ffff:")) {
      const mapped = host.slice("::ffff:".length).match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
      return mapped !== null && publicipv4(Number(mapped[1]), Number(mapped[2]));
    }
    const v4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (v4) return publicipv4(Number(v4[1]), Number(v4[2]));
    // every other ipv6 literal: the gateway rides a name, not an address
    if (host.includes(":")) return false;
    return true;
  } catch {
    return false;
  }
}

/** the public side of an ipv4 address (the first two octets decide). */
function publicipv4(a: number, b: number): boolean {
  if (a === 0 || a === 10 || a === 127) return false;
  if (a === 172 && b >= 16 && b <= 31) return false;
  if (a === 192 && b === 168) return false;
  if (a === 169 && b === 254) return false;
  if (a === 100 && b >= 64 && b <= 127) return false;
  if (a === 192 && b === 0) return false;
  if (a === 198 && (b === 51 || b === 52)) return false;
  if (a === 203 && b === 0) return false;
  return true;
}

/**
 * Validates a platform base url under the strict host law the first-run
 * seats ride: HTTPS only, and the host must be public — localhost,
 * loopback, private, link-local, CGNAT, benchmarking, unique-local and the
 * reserved documentation ranges are refused; a mapped IPv6 literal is
 * normalized to its embedded IPv4 first; any other IPv6 literal is refused
 * (the gateway rides a name).
 *
 * @param base the configured base url candidate.
 * @returns true when the base may be consulted.
 */
export function hostallowedstrict(base: string): boolean {
  try {
    const url = new URL(base);
    if (url.protocol !== "https:") return false;
    const host = url.hostname
      .toLowerCase()
      .replace(/\.+$/, "")
      .replace(/^\[|\]$/g, "");
    if (host.length === 0) return false;
    if (host === "localhost" || host === "0.0.0.0" || host === "::1" || host === "::") return false;
    if (host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) return false;
    if (host.endsWith(".home.arpa")) return false;
    if (host.includes(":")) return mappedipv6(host);
    const v4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (v4) return publicipv4strict(Number(v4[1]), Number(v4[2]));
    return true;
  } catch {
    return false;
  }
}

/**
 * Answers whether an IPv6 literal is the IPv4-mapped form of a PUBLIC
 * address (the url parser normalizes `::ffff:127.0.0.1` to hex hextets, so
 * both spellings are normalized here and the embedded IPv4 decides).
 *
 * @param host the bracket-free ipv6 literal.
 * @returns true when the literal maps to a public ipv4 address.
 */
function mappedipv6(host: string): boolean {
  if (!host.startsWith("::ffff:")) return false;
  const tail = host.slice("::ffff:".length);
  const decimals = tail.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (decimals) return publicipv4strict(Number(decimals[1]), Number(decimals[2]));
  // the hex spelling the url parser produces: the first hextet of the pair
  // carries the first two ipv4 octets, and they alone decide the ranges
  const hextets = tail.match(/^([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
  if (hextets) {
    const high = Number.parseInt(hextets[1], 16);
    return publicipv4strict((high >> 8) & 0xff, high & 0xff);
  }
  return false;
}

/** the public side of an ipv4 address under the strict law (the first two octets decide — benchmarking and multicast refuse too). */
function publicipv4strict(a: number, b: number): boolean {
  if (a === 0 || a === 10 || a === 127) return false;
  if (a === 172 && b >= 16 && b <= 31) return false;
  if (a === 192 && b === 168) return false;
  if (a === 169 && b === 254) return false;
  if (a === 100 && b >= 64 && b <= 127) return false;
  if (a === 192 && b === 0) return false;
  if (a === 198 && (b === 18 || b === 19)) return false;
  if (a === 198 && (b === 51 || b === 52)) return false;
  if (a === 203 && b === 0) return false;
  if (a >= 224) return false;
  return true;
}

/**
 * Answers the flags after one stage was marked seen (pure: the writer and
 * the tests share this merge — seen-wins, a stage never unsees).
 *
 * @param state the flags before the write.
 * @param stage the stage being marked seen.
 * @returns the flags after the write.
 */
export function mergeStage(state: OnboardingFlags, stage: OnboardingStage): OnboardingFlags {
  return stage === "intro" ? { ...state, introseen: true } : { ...state, onboardingseen: true };
}

/**
 * Answers the flags after one stage was marked seen under the flow order
 * the first-run seats ride (pure: the writer and the tests share this
 * merge — seen-wins, a stage never unsees, and the later stage implies
 * the earlier: "onboarding" marks the splash and the finish together).
 *
 * @param state the flags before the write.
 * @param stage the stage being marked seen.
 * @returns the flags after the write.
 */
export function mergeStageordered(state: OnboardingFlags, stage: OnboardingStage): OnboardingFlags {
  return stage === "intro" ? { ...state, introseen: true } : { ...state, introseen: true, onboardingseen: true };
}
