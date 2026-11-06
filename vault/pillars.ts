// # pillars — the storage pillars catalog of the vault engine: the one
// authored registry that names every storage pillar the self-hosted clone
// rides (LibGit2, MySQL2, the Prisma schema, Drizzle ORM, Git LFS, blobs,
// BigInt and pointers) and pins each pillar to the module that owns it.
// The catalog answers two laws at once. The ownership law: no pillar is a
// wish — every row names the real module of this package that implements
// the pillar today (the tests walk the owner files on disk), and the one
// seam the engine still refuses (the mysql2 network rung) says "seam"
// loudly instead of pretending. The route law: every pillar answers its
// own static-safe route (GET /api/v1/pillars/<key>) beside the list lane —
// read-only, no storage truth, no query execution — the same open registry
// law the protocols pillar rides, so the wingets and the sibling apps pull
// the catalog through the internal api instead of hardcoding it.
//
// The catalog is authored, not generated: eight rows, each the distilled
// law of one pillar of the storage stack. Where the mimetypes and
// protocols pillars parse thousand-row registries off the filesystem, this
// pillar is the short constitution of the engine — the row count stays
// honest at eight because the storage stack has exactly these pillars.
//
// @section catalog — the eight pillars and the counts the pillar announces
// @section lookups — the key index and the group lane
// @section routes — the static-safe route lane

/** @section catalog */

/** The status of one pillar: "live" when the engine runs the pillar today,
 * "seam" when the row names an env-switchable rung the engine guards
 * loudly (the mysql2 wire — the engine refuses MYSQL_URL until the rung
 * lands, never a silent fall to sqlite). */
export type PillarStatus = "live" | "seam";

/** One row of the storage pillars catalog: the pillar, its law, the module
 * that owns it and the governing reference the law follows. */
export interface PillarRow {
  /** the catalog key, lowercase ("libgit2") — the route segment and the lookup key */
  key: string;
  /** the display name of the pillar ("LibGit2") */
  name: string;
  /** the hierarchical family the pillar belongs to ("git", "network", "schema", "bytes") */
  group: string;
  /** the one-sentence law the pillar carries — what the engine does under this pillar */
  law: string;
  /** the module file of this package that owns the pillar (the tests walk these on disk) */
  owner: string;
  /** the governing spec or reference the law follows */
  spec: string;
  /** the status of the pillar (live today, or the guarded seam) */
  status: PillarStatus;
}

/** The catalog itself: every storage pillar in group order, alphabetical
 * inside every group. The eight rows are the constitution of the storage
 * stack — LibGit2, MySQL2, the Prisma schema, Drizzle ORM, Git LFS,
 * blobs, BigInt and pointers. */
export const PILLARS: readonly PillarRow[] = [
  /* ---- the git family: the object model the vault stores under ---- */
  {
    key: "libgit2",
    name: "LibGit2",
    group: "git",
    law: "the git object model of the vault: sha-1 oids and blob objects — the in-db virtual repo rides the libgit2 discipline (the catalog spell the engine implements, not a binding it links)",
    owner: "sha.ts",
    spec: "https://libgit2.org/docs/",
    status: "live",
  },
  {
    key: "gitlfs",
    name: "Git LFS",
    group: "git",
    law: "the large-file pointer law: binary masters ride the lfs channel as sha-256 pointers (the pointer document, the real 1,000,000-byte threshold of the channel chooser) — never in-row bytes",
    owner: "storageface.ts",
    spec: "https://github.com/git-lfs/git-lfs/blob/main/docs/spec.md",
    status: "live",
  },
  /* ---- the network family: the wires the engine may ride ---- */
  {
    key: "mysql2",
    name: "MySQL2",
    group: "network",
    law: "the network database seam: the same declarations answer a mysql wire when MYSQL_URL arms — the engine refuses loudly until that rung lands (storageDriverKind), never a silent fall to sqlite",
    owner: "drizzle.ts",
    spec: "https://github.com/sidorares/node-mysql2",
    status: "seam",
  },
  /* ---- the schema family: declaration and execution ---- */
  {
    key: "prisma",
    name: "Prisma schema",
    group: "schema",
    law: "the declaration seat: schema.prisma declares the same tables the engine executes — prisma declares, drizzle executes, zero drift between the two spellings",
    owner: "schema.prisma",
    spec: "https://www.prisma.io/docs/orm/prisma-schema",
    status: "live",
  },
  {
    key: "drizzle",
    name: "Drizzle ORM",
    group: "schema",
    law: "the executing schema: the drizzle declarations over better-sqlite3 (WAL, foreign keys, the idempotent boot DDL) — every table the engine serves rides these declarations",
    owner: "drizzle.ts",
    spec: "https://orm.drizzle.team/docs",
    status: "live",
  },
  /* ---- the bytes family: the pipeline and the pointers ---- */
  {
    key: "blobs",
    name: "Blobs",
    group: "bytes",
    law: "the blob channel: small text-like rows ride in-db git blobs, and every byte stream splits into 256KB chunks (raw first, brotli only when it wins) under the manifest law",
    owner: "chunks.ts",
    spec: "https://git-scm.com/book/en/v2/Git-Internals-Git-Objects",
    status: "live",
  },
  {
    key: "bigint",
    name: "BigInt",
    group: "bytes",
    law: "the 64-bit pointer law: byte sizes, quota limits and chunk ids ride real bigint end to end (sqlite 64-bit cells, decimal strings on the wire) — no double ever narrows a pointer past the 2^53 safe range",
    owner: "drizzle.ts",
    spec: "https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt",
    status: "live",
  },
  {
    key: "pointers",
    name: "Pointers",
    group: "bytes",
    law: "the pointer discipline: identity pointers are text, the lfs pointer document carries the oid and the 64-bit size, and every digest attests through the shape gates (sha-256 for lfs rows, sha-1 for blobs)",
    owner: "storageface.ts",
    spec: "https://git-scm.com/book/en/v2/Git-Internals-Git-Objects",
    status: "live",
  },
] as const;

/** The row count of the catalog (the storage stack has exactly these pillars). */
export const PILLAR_COUNT = PILLARS.length;

/** Every catalog key, in catalog order (the route segments of the pillar). */
export const PILLAR_KEYS: readonly string[] = PILLARS.map((row) => row.key);

/** The groups the catalog carries, in catalog order (git, network, schema, bytes). */
export const PILLAR_GROUPS: readonly string[] = [...new Set(PILLARS.map((row) => row.group))];

/** The pillars the engine runs today (status "live") — the seam row never
 * rides this lane, the engine says the seam honestly instead. */
export function livePillars(): PillarRow[] {
  return PILLARS.filter((row) => row.status === "live");
}

/** @section lookups */

/** The key index: every catalog key (lowercase) to its row. */
const KEY_INDEX: ReadonlyMap<string, PillarRow> = new Map(PILLARS.map((row) => [row.key, row]));

/**
 * The catalog row of one pillar key.
 *
 * @param key the pillar key ("gitlfs") — trimmed and lowercased.
 * @returns the row, or undefined when the catalog holds no such pillar.
 */
export function pillarOf(key: string): PillarRow | undefined {
  return KEY_INDEX.get(key.trim().toLowerCase());
}

/**
 * The rows of one family group, catalog order.
 *
 * @param group the family keyword ("git", "network", "schema", "bytes").
 * @returns the rows of the group.
 */
export function pillarsByGroup(group: string): PillarRow[] {
  return PILLARS.filter((row) => row.group === group);
}

/** @section routes */

/** The route prefix every pillar row answers under (the static-safe lane,
 * the same prefix law the routes catalog pins: routes.pillars). */
export const PILLAR_ROUTE_PREFIX = "/api/v1/pillars";

/** The static-safe route of one pillar row. */
export function pillarRoute(key: string): string {
  return `${PILLAR_ROUTE_PREFIX}/${key}`;
}

/** The pillar route count the pillar serves: one static-safe route per
 * catalog row plus the list route. */
export const PILLAR_ROUTE_COUNT = PILLAR_COUNT + 1;

/**
 * The static-safe route lane: resolves one pathname to the pillar row it
 * serves — the one read-only handler behind every route of the pillar (no
 * storage truth, no query execution, no mutation: the catalog row answers
 * or the lane refuses).
 *
 * @param pathname the request path ("/api/v1/pillars/gitlfs").
 * @returns the row the route serves, or undefined when the path rides no
 *   pillar route (the caller answers its own refusal).
 */
export function pillarRouteOf(pathname: string): PillarRow | undefined {
  if (!pathname.startsWith(`${PILLAR_ROUTE_PREFIX}/`)) return undefined;
  const key = pathname.slice(PILLAR_ROUTE_PREFIX.length + 1).toLowerCase();
  if (key.length === 0 || key.includes("/")) return undefined;
  return pillarOf(key);
}
