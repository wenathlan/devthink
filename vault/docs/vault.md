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

## Interactions

- The person enters, signs up, registers the app and database, receives the key shown once.
- The API surface the family consumes (saddle leans on vault for storage, vault leans on saddle for edge processing).

## Doctrine

- No account persistence in the visitor browser: the session answers the wire once, memory only.
- Every hard disk is a database.
