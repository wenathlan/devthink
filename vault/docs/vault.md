# vault — the dossier

The pure storage app: the self-hosted database, auth and storage surface — the supabase competitor the family and any person can deploy.

## Identity

- Category: storage engine.
- Competitor space: Supabase, the S3 bucket model, Drizzle-style storage.
- Consumer law: storage belongs to vault; the family imports it as a library.

## Objective

Answer the coherent storage engine: every byte the family stores rides vault — signup, app registration, buckets, the network database and the edge storage — never the visitor browser.

## Features

- The signup and app registration flow: the person signs up, registers an app and database, receives the own ID (the acct and db seats) — the supabase flow.
- Buckets: the content-addressed object store with chunks.
- The network database: per-database sqlite (better-sqlite3 as the main storage layer, WAL, prepared-only).
- The query lane: the per-database query surface.
- The decoy defense and the faun block: the direct database download is refused on every face (the engine 403, the netlify 410, the vercel redirect, the nginx 403, the header seal) — the old faun mistake never returns.
- The quota law: per-project limits the person defines (from megabytes to terabytes, unlimited when null) — never a hard engine ceiling.
- The protocols and the internal root: the internal APIs, MIME types and HTTPS seats the static serving rides.
- Open-source library distribution: npmjs and GitHub Packages under the @wenathlan scope.

## Driver paths

The storage engine rides better-sqlite3 in development — WAL, prepared-only statements, the pragma ladder (busy_timeout armed before WAL, foreign keys on) — and the alternate paths stay declared beside it, documented rather than hidden:

- Drizzle executes: the tables live as drizzle declarations in drizzle.ts, the boot DDL lays them down idempotently on first open, no .sql files exist in the repo and migrations stay CI-only.
- Prisma declares: schema.prisma is the documentation of record — the same columns, pointers and byte-scale law the drizzle declarations and the boot DDL mirror, with the prisma tooling reading DATABASE_URL.
- The mysql2 rung: MYSQL_URL selects the driver kind through the seam (storageDriverKind); until that rung lands the engine refuses loudly with the typed StorageDriverError instead of a silent fallback, and clearing the variable rides sqlite again.
- Blobs and bigint: byte-scale pointers (sizes, limits, chunk ids) ride 64-bit bigint cells on the rows and answer as decimal strings on the wire; blob bytes never ride a row raw — the content-addressed chunk catalog holds them in packed windows, and stored bytes answer as base64.

| surface | meaning |
| --- | --- |
| VAULT_STORAGE_URL | the engine store url (default file:./vault-storage.db) |
| VAULT_DATABASES_DIR | the directory the per-database store files answer under |
| MYSQL_URL | the mysql2 rung selector — a set value answers the loud refusal until the rung lands |
| DATABASE_URL | the datasource the prisma declaration reads |

## Interactions

- The person enters, signs up, registers the app and database, receives the key shown once.
- The API surface the family consumes (saddle leans on vault for storage, vault leans on saddle for edge processing).

## Doctrine

- No account persistence in the visitor browser: the session answers the wire once, memory only.
- Every hard disk is a database.
