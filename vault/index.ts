// # index — the library surface of the vault: the barrel the family
// consumes. Storage belongs to the vault and only to the vault, so the
// sibling applications import this package the way they import saddle for
// sandboxes and getry for thinking — never reimplementing a store. Every
// root engine module keeps its own deep specifier (@wenathlan/vault/storage,
// ./sha, ./chunks, ./drizzle, ./quota, ./objectsledger, ./api, ...); this
// barrel is the one-import door that carries the whole public surface at
// once, and package.json maps every specifier onto it.
//
// the boot law the barrel inherits: db.ts and drizzle.ts open their
// self-hosted sqlite connections at import time (DATABASE_URL and
// VAULT_STORAGE_URL, both overridable, both defaulting to a file: store
// beside the working directory) — importing the barrel boots the engine. A
// consumer that wants the pure surfaces without the connections rides the
// deep specifiers instead: ./storage, ./sha, ./chunks, ./objects,
// ./buckets, ./retention, ./labels, ./onboardingstate, ./family,
// ./familyurl, ./hometypes, ./utils.
//
// the published form is the source itself (the debonair/getry library
// pattern of the family): the engines pin node 26, which runs the
// erasable-typescript sources natively, so every export target is the .ts
// file the tests run — no dist tree, no drift between what is published
// and what is reviewed.

/* ── the storage engine — the real pipeline the siblings borrow ── */

/** the account lane of the clone: the scrypt accounts, the HMAC-signed sessions, the vk_ project keys and the per-peer rate counter. */
export * from "./accounts.ts";
/** the vault http surface: the token gate (the faun lesson) and the storage routes over pure node:http. */
export * from "./api.ts";
/** the 256KB chunk pipeline: split, encode (raw first, brotli only when it wins), the manifest law. */
export * from "./chunks.ts";
/** the executing schema and the self-hosted connection: drizzle over better-sqlite3 (boots at import). */
export * from "./drizzle.ts";
/** the real object ledger: deposits, verified reads, soft deletes, the orphan sweep and the census. */
export * from "./objectsledger.ts";
/** the quota engine: the user-defined limit rows and the pure enforcement verdicts. */
export * from "./quota.ts";
/** the real digest engine: sha-256 and sha-1 over real bytes, the hex shape gates. */
export * from "./sha.ts";
/** the storage contracts of the clone: the LFS pointer law, the record gate and the channel chooser. */
export * from "./storage.ts";

/* ── the wave D rewire — the supabase-law storage engine ── */

/** the mimetypes pillar: the registry corpus the internal root answers every file type with (reads mime.types beside the module at import). */
export * from "./mimetypes.ts";
/** the protocols pillar: the protocol catalog, one static-safe route per wire (reads protocols.types beside the module at import). */
export * from "./protocols.ts";
/** the internal root: the static site surface with the correct content type — and the faun law: the raw .db never rides it. */
export * from "./internalroot.ts";
/** the signup lane: the person's door — an account, a registered database, an api key shown exactly once (stored hashed; boots the site store at import). */
export * from "./signup.ts";
/** the /v2/query lane: bearer plus database-id headers over the per-database sqlite files of the better-sqlite3 core. */
export * from "./querylane.ts";

/* ── the rehearsal shelf — the pure, deterministic page cores ── */

/** the bucket shelf: the retention groups, their policies and the per-bucket census. */
export * from "./buckets.ts";
/** the sealed rehearsal ledger: deterministic from the seed, honest about being a rehearsal. */
export * from "./objects.ts";
/** the retention clock: the verdicts, the sweep plan and the timeline ticks. */
export * from "./retention.ts";

/* ── the site store — the vault's own app database and its accessors ── */

/** the self-hosted site store: the better-sqlite3 bootstrap and the parameterized helpers (boots at import). */
export * from "./db.ts";
/** the copy law: the label manifest, the typed accessor and the seed. */
export * from "./labels.ts";
/** the entry-flow accessor: the seen flags of the visitor, one writer only. */
export * from "./onboardingstate.ts";
/** the storage lane: the shared sqlite mechanism of the family — the factory the siblings open (no boot; SqlParam keeps flowing through the db star, the deep specifier carries it for the bridged siblings). */
export { openStorageLane, PRAGMA_BOOTSTRAP, type StorageLane, type StorageLaneOptions } from "./storagelane.ts";
/** the ui store: the uicopy seed, the accessor chain and the sqlite lane. */
export * from "./uistore.ts";

/* ── the family chrome — the shared identity of the deploy units ── */

/** the family table: the sibling slugs and the spec §12 accents. */
export * from "./family.ts";
/** the two-way family door: the deploy-unit url resolver. */
export * from "./familyurl.ts";
/** the home page types. */
export * from "./hometypes.ts";
/** the shared word splitter. */
export * from "./utils.ts";

/* ── the one-name gates ── */

/* the one-name gates of the barrel: chunks.ts and objects.ts each declare
 * a VaultChannel type (both the mirror of the storage.ts contract) — two
 * star exports would leave the name ambiguous and silently dropped, so the
 * barrel pins the contract-derived declaration of the chunk pipeline (the
 * shapes are identical, the owner is one). CHUNK_BYTES rides chunks.ts and
 * objectsledger.ts re-exports it — the same binding through both paths,
 * pinned here so the barrel stays explicit about the owner. */
export { CHUNK_BYTES, type VaultChannel } from "./chunks.ts";
