# DevThink v1.1.16 synchronization options

## Decision boundary

DevThink already provides one free, immediate sync path: a paired browser calls the user-owned CLI gateway and therefore reads and writes the same local `devthink.db`. It works while the CLI gateway is available on the user's device. Cross-device or offline web-first work requires a separate authenticated data service; a static deployment cannot safely create one by embedding a repository secret.

> GitHub Actions secrets are supplied to workflow jobs through the `secrets` context. They are not a browser-runtime credential and must not be emitted into the published static artifact.[1]

| Approach | What synchronizes | Tradeoffs | Cost | Setup complexity |
| --- | --- | --- | --- | --- |
| Paired local gateway | The existing local CLI database, sessions, tabs, messages, preferences and public ID while the CLI runs | Immediate and private, but the user must have the CLI gateway running on the same network/device | Free | Low |
| Hosted Postgres with Auth and row-level rules | Explicitly selected user records, encrypted snapshots and operation log between CLI and static web | Requires the user to create an account and configure a hosted project; records are remote, not Git-tracked files | Free tier available subject to provider limits | Medium |
| User-operated sync service | The same record model through a self-hosted API and database | Full control and no vendor account dependency, but requires the user to operate HTTPS hosting and backups | Software is free; hosting is user-provided | High |

## Recommended v1.1.16 direction

The recommended implementation is to retain the paired local gateway as the default and add an **optional remote adapter contract** for a user-configured PostgreSQL service with browser-safe authentication and row-level authorization. A browser may hold a provider's publishable client identifier and its own user session, but never an administrative database key. Every remotely exposed table must enforce ownership through the authenticated user ID; the administrative role remains server-side because it bypasses row-level security.[2]

Drizzle ORM can model schemas and migrations for the CLI adapter or a server-side sync service, but it is not itself an authentication gateway, a managed private database or a synchronization protocol.[3] It must not be used to put a privileged SQLite/Postgres connection into the static bundle.

## Explicitly rejected design

The project must not add a `database/` folder containing user `.db` files to this repository, whether the repository is public or private. Git history, clones, artifacts, CI logs and repository access are not tenant isolation. A GitHub secret can authorize a workflow job, but it cannot make database bytes private once they are committed or shipped in a static site.

The project must also not store a database password in browser storage. The durable identity is a remote-auth subject mapped to the existing local public ID; the browser receives only a short-lived user session from the selected authentication provider. Provider API credentials remain CLI-only by default. An explicitly confirmed browser-only credential may exist in a separate device-local IndexedDB store, but it is never exposed by the gateway, included in exports or sent to a remote adapter.

## Candidate remote record model

The remote adapter replicates operation records rather than raw SQLite files. Each row includes `owner_id`, compact record ID, `updated_at`, `device_id`, monotonically increasing operation revision and tombstone state. The initial tables are `profiles`, `workspaces`, `sessions`, `tabs`, `messages` and `preferences`; provider credentials, raw authentication material and local filesystem paths are excluded.

Conflict handling is deterministic: the adapter applies a per-record revision and retains an operation log. Concurrent edits with incomparable revisions become explicit conflicts in Settings instead of silently overwriting data. A user can keep the local version, accept the remote version or duplicate a session; no background merge runs without displaying its result.

## Delivered browser-local foundation

Version 1.1.16 adds a native IndexedDB store named `devthink.db` to the static workbench. It contains browser-local, non-sensitive workspaces, sessions, tabs, messages and preferences. Each record carries the public owner ID, browser device ID, `updated_at` equivalent, revision and tombstone metadata. A separate, empty-by-default `credentials` store accepts a provider credential only after an explicit user confirmation; it is deliberately outside the record model and every sync path. The browser creates non-sensitive data independently while offline, hydrates it when a local route opens, and refreshes its safe cache after a paired gateway session is read.

The web Settings page now displays `local-only` and `paired-gateway` states. The remote adapter remains deliberately unconfigured: it requires a separately selected authenticated service and must expose conflicts rather than silently merging unrelated browser and CLI updates. Browser credentials remain local only and excluded from the gateway, raw database files, exports, repository artifacts and all synchronization payloads.

## References

[1]: https://docs.github.com/actions/security-guides/using-secrets-in-github-actions "Using secrets in GitHub Actions"
[2]: https://supabase.com/docs/guides/database/postgres/row-level-security "Supabase Row Level Security"
[3]: https://orm.drizzle.team/docs/overview "Drizzle ORM overview"
