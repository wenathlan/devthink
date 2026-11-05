# vault

## Objective

Vault is the storage library of the family — the self-hosted database, auth and storage surface (the supabase clone): it keeps every site database, receives the data backups and owns the object store, accounts and quotas. Siblings consume it the way they consume the sandbox engine for execution and the AI gateway for thinking: through the published library, never by reimplementing a store.

## Features

- Account lane — account creation, credential verification, HMAC session issuing and verification, project keys and a per-peer rate counter.
- HTTP surface — a pure node:http server with a token gate, the storage routes and the listen helper; the route catalog is client-safe and re-exported by the sibling sites instead of being duplicated.
- Object ledger — put, get, delete, orphan sweep and the storage census over the executing schema.
- Sealed rehearsal ledger — a deterministic, honest-about-being-a-rehearsal object view for the surface.
- Chunk pipeline — 256KB chunks with split and reassemble, encode and decode, the manifest law and the channel contract.
- Bucket shelf — retention groups, their policies and the per-bucket census.
- Retention clock — retention verdicts, the sweep plan and the timeline ticks.
- Quota engine — quota verdicts, limit rows and the floor bytes law.
- Digest engine — real SHA-256 and SHA-1 hex digests with shape gates.
- Storage contracts — the LFS pointer law, the record gate and the channel chooser.
- Shared storage lane — the SQLite mechanism (open, pragma ladder, cached helpers) every sibling opens its own database through, with no boot at import.
- Query lane — a bearer-plus-database query endpoint where the token is compared timing-safe against the boot digest or the stored key digests, and the database header routes the query onto that database's own file.
- Protocol catalog — 1322 rows (231 curated family rows with governing specs and security postures, plus the 1091 IANA service-name and port rows), one static-safe route per row.
- Media type registry — the 3217-type catalog with family ordering and extension resolution.
- Decoy database — browser-shaped anonymous probes on the read routes receive a plausible ledger of fake projects instead of the honest refusal, so enumeration dies in the decoy.
- Internal static root — the site surface serves itself with correct content types while every raw database file request is refused on the static root.
- Library face — one subpath per module; the barrel boots the engine while the deep specifiers serve the pure surfaces without connections; the contract is pinned by its own test.

## Storage

- Site store — the SQLite bootstrap with parameterized helpers boots at import; the executing schema answers the tables, open and close, and the storage driver kind.
- Serverless adapter — HTTP/HTTPS or file URLs through the configured database URL with driver adapters; a better-sqlite3 mirror serves the local runtime.
- Backup seat — the deployable clone keeps every site database and receives the data backups.
- Per-database routing — one file, one lane, one ladder: the query lane routes by database identity.

## Interactions

- Route tree — intro, onboarding, home, buckets, objects, retention and the 404 page.
- Home widgets — object browse, plans table, database console, signup gate, toaster, halo, reveal, entry, skeleton and tabs.
- Bucket, object and retention consoles — the inventory surfaces of the shelf, the ledger and the clock.
- First-run flow — intro splash and onboarding frames behind the entry gate.

## Security

- Faun law — the real base stays sealed forever: the static root never serves database files, and the anonymous browser-shaped probe cannot distinguish a loaded vault from an empty one.
- Key hygiene — no plaintext key ever lands on the store; issued keys compare as SHA-256 digests; the master door compares timing-safe.
- Signup and auth routes — the route catalog carries the auth surface the sites share.

## Engine role

Storage engine of the family: every sibling's database, object and label need answers through this library; the OS imports it as the storage law.

Padrão: seguir o padrão moderno.
