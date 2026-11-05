# vault features

the real feature list of the vault app, read from the code and grouped by category. every entry names a behavior that exists in the source.

## the person's door (the supabase law)

- signup lane — `signupAccount` (accounts.ts) provisions one account: the password lands only as its salted scrypt digest, the email normalizes, the public route `/api/v1/auth/signup` answers 201 with the account id and a per-peer rate counter guards the door (`authRateVerdict`).
- signin lane — `signinAccount` answers the signed `vs_` session bearer exactly once (HMAC over `VAULT_SESSION_SECRET` or its derivation from `VAULT_TOKEN`, `issueSession` / `verifySession`); nothing ever saves in a browser.
- database registration — `registerDatabase` provisions one app database per verified account (`db-` plus 12 hex, filesystem-safe) with the 900MB configurable floor (`QUOTA_FLOOR_BYTES`, `VAULT_QUOTA_MB`), and issues the first `vault_` api key shown exactly once — the store keeps only the sha-256 digest (`apiKeyLookup` refuses the revoked, stamps last-use).
- per-database quota — `setDatabaseQuota` / `readQuota` (accounts.ts) ride the databases row: decimal bytes at any scale or null for unlimited, never a fixed cap.

## the query lane (the helix-style door)

- per-database routing — `databasesDir` / `databaseFileOf` / `laneOf` (querylane.ts) route every registered database onto its own sqlite file (busy_timeout before WAL, foreign keys armed — the `openStorageLane` factory of storage.ts).
- the digest gate — `queryVerdict` answers the operator token (timing-safe against the boot digest) or an issued `vault_` key (sha-256 digest against the stored hashes); the wrong bearer answers 401 `VAULT_QUERY_AUTH`, a key asked for a foreign database answers 403 `VAULT_QUERY_SCOPE`.
- one-statement execution — `runQuery` prepares one statement on the lane: readers answer `columns` and `rows`, writers answer `changes` and `lastInsertRowid` (bigint pointers as decimal strings, stored bytes as base64 — `jsonSafe`); the body rides the 65,536-byte sql ceiling and the 512-parameter bound.
- the quota gate — every write passes the coarse gate first (`databaseUsageOf`, the file's own bytes against the database's quota row); a database at its limit answers the 413 `VAULT_QUOTA` refusal before the write runs, and reads never meet the gate.
- the route — `POST /api/v1/query` (api.ts `postQuery`) reads the `x-database-id` header (or the body id) beside the bearer.

## the real object ledger

- deposit pipeline — `putObject` (objects.ts) digests the bytes whole through real sha-256, splits into 256KB windows, upserts each window into the content-addressed catalog by digest (refs increment — automatic reuse), keeps the ordered json manifest and the bigint pointers, all inside one transaction with the quota verdict inside.
- the bucket dimension — every row carries its retention group (`bucket`, defaulting to `family-state`; `bucketValid` pins the shape): the deposit names it with `x-object-bucket`, the list lane filters it (`listObjects(project, bucket)`), and a store opened before the wave climbs the `ensureColumn` ladder on the next boot (drizzle.ts).
- verified reads — `getObject` reassembles the manifest in order, re-digests every chunk and the whole, and refuses drift as `corrupt` — one moved byte answers corrupt, never a shrug.
- soft delete and sweep — `deleteObject` tombstones the row and detaches the chunk refs; `sweepOrphans` collects the chunks nobody references and purges the tombstones.
- census — `storageCensus` answers the live objects, bytes, unique chunks and stored bytes of the whole engine; `usageOf` answers one project.

## the storage stack

- chunk pipeline — `chunks.ts`: the 256KB split, raw-first brotli encoding (only when it wins), the manifest law (`manifestEntryOf`, `reassemble`).
- storage contracts — `storageface.ts` / `storage.ts`: the LFS pointer law, the record gate (`storageRecordValid`), the channel chooser (`storageModeFor` — the real 1,000,000-byte threshold), the storage lane factory every family app opens (`openStorageLane`, `PRAGMA_BOOTSTRAP`).
- digests — `sha.ts`: sha-256 and sha-1 over real bytes with the hex shape gates.
- quota engine — `quota.ts`: the pure verdicts (`quotaVerdict`), the honest limit parse (`quotaLimitFrom` — decimal bytes or the unlimited words), the row ensure/set (`ensureQuota` / `setQuota` — the floor is a creation default, never a cap).
- executing schema — `drizzle.ts`: the drizzle declarations over better-sqlite3 (WAL, foreign keys), the idempotent boot DDL and the pragma-guarded column ladder, no .sql files anywhere.

## the http surface

- the token gate — `tokenVerdict` / `requestAuth` (api.ts): the operator bearer stays total admin, a `vk_` project key authorizes its own project, a `vs_` session authorizes its account's projects; the sealed environment answers 503 fail-closed, the bearerless data call answers 401, and the browser-shaped probe reads the decoy ledger (`decoyledger`, decoy.ts).
- the site face — the container doctrine: `serveStatic` serves the built site with the correct content types and the spa fallback, `serveInternal` (internalroot.ts) serves the deployable unit's internal root with the registry mimes, and the faun law holds on every face — the raw `.db` never rides (`rawDatabaseRequest` answers 403 `VAULT_DBFILE` before any lane).
- the copy lane — `/api/v1/ui/copy` serves the interface copy from the uistore table (`uistore.ts`), open beside the health probe.
- the client door — `vaultclient.ts`: every route as one typed call (`signup`, `signin`, `registerDatabase`, `listProjects`, `createKey` / `listKeys` / `revokeKey`, `usage`, `listObjects` with the bucket filter, `deposit` with the object headers, `query` with the database header, `getQuota` / `setQuota`, `sweep`), the away lane declaring the rehearsal honestly, and the mount hooks (`useVaultUsage`, `useVaultQuota`, `useVaultObjects`) the wingets render through.

## the pillars

- protocols — `protocols.ts`: every wire of the catalog answers its own static-safe route (`/api/v1/protocols`, `protocolRouteOf`, `PROTOCOL_ROUTE_COUNT`).
- mimetypes — `mimetypes.ts`: the family mimetype corpus the internal root answers every file type with (reads `mime.types` beside the module at import).
- labels and copy — `labels.ts` / `labelstore.ts` / `uistore.ts`: the interface copy manifest, the db-backed store and the browser accessor chain.

## the rehearsal shelf (the deterministic page cores)

- the sealed rehearsal — `seedVault` / `sealObject` / `verifyObject` / `vaultCensus` (objectface.ts): the same seed always seals the same objects through the real storage contract; the surface says the ledger is a rehearsal, never a live claim.
- the bucket shelf — `buckets.ts`: the retention groups, their policies (`seedRules`) and the per-bucket census (`shelfOf`, `bucketShelf`, `retentionLabel`).
- the retention rehearsal — `retention.ts`: the clock verdicts (`verdictOf`), the sweep plan (`sweepPlan` — a plan, never an action) and the timeline ticks (`firstDueTick`, `horizonTick`, `ROLL_STEP`).

## the deploy safety law

- the faun seal — the layered law `tests/deploysafety.test.ts` pins: the build emits into `dist` never the root, every publish lane mounts `dist` only (netlify, vercel, workers, the capacitor webDir, the container static root), `_headers` seals the database faces, and the engine itself refuses the raw database file on every face.
- the container — the engine shape: one process, one port (`node api.ts` serves the token-gated storage truth and the assembled site face), `VAULT_TOKEN` demanded at boot (fail closed), the runtime state under `/app/data` never inside the served tree.

## Dependencies

- synchronized dependency union — the eleven family apps share one dependency tree: identical `dependencies`, `devDependencies` and `peerDependencies` (same keys, same versions, nothing removed, highest semver wins on conflicts) and one `engines` catalog with node as maestro and the V 0.5.2 seat as catalog annotation (@family wave/depssync).
