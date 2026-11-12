# DevThink v1.1.15 unified capability matrix

## Shared local-person contract

The local CLI owns one `devthink.db` and one durable public `userId`. The paired browser is a short-lived authenticated client of that same local gateway and database. It never creates a browser database, stores a user password, receives provider credentials, or accesses the CLI filesystem directly.

| Data or action | CLI flag or command | Ink surface | Gateway | Web surface |
| --- | --- | --- | --- | --- |
| Inspect public identity | `identity` | Settings view | `GET /identity` | Settings page |
| Set public identity | `identity --id <10-15 chars>` | Settings guidance | `PUT /identity` | Settings page |
| Inspect complete Settings summary | `config settings` | Settings view | `GET /settings` | Settings page |
| Create or revoke pairing | `pair create`, `pair revoke` | Settings guidance | `POST /pairings/consume`, `POST /pairings/revoke` | Settings page |
| Inspect shared preferences | `config preferences` | Settings view | `GET /preferences` | Settings page |
| Change theme, rail, zoom | `config set <key> <value>` | `/settings set …` | `PATCH /preferences` | Settings page |
| Select active provider and model | `config activeProvider <id>`, `config activeModel <id>` | Providers destination | `PATCH /providers/active` | Providers page and Settings summary |
| Read workspaces, sessions, tabs and messages | `projects`, `sessions list` | Projects and History destinations | `GET /workspaces`, `GET /sessions` | Projects page and workspace |
| Create sessions, tabs and messages | `chat`, interactive entry | Chat destination | `POST /sessions`, tab routes, `POST /chat` | Workspace |
| Read usage and routes | `usage`, `routes` | Usage and Routes destinations | `GET /usage`, read-only route catalog | Usage and Routes pages |

## Deliberate local-only boundaries

| Capability | Boundary reason |
| --- | --- |
| `auth login`, `auth clear`, `auth migrate` and provider tokens | Provider credentials are explicit CLI input in `auth.json`; browser fields never receive those values. |
| Local database path, raw SQLite file and filesystem backup | The database is owned by the current CLI process and computer, not by a browser bundle. |
| Browser session token and one-time pairing code | The code is consumed once and the token remains only in session storage for a short browser session. |
| Remote or cross-device replication | A static deployment has no private database runtime; an optional authenticated remote adapter remains a separately configured future service. |

## Settings topology

`/settings` is the browser page for the same settings destination shown by Ink and operated through CLI flags. `web/settings/` owns the web Settings page and its controls. The root `workspace.ts` remains the renderer-neutral navigation contract; it is not a UI component library.
