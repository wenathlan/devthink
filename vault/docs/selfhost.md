# Self-hosting the vault

The vault answers two ways: as the published library (`@wenathlan/vault` —
the storage engine every family app imports) and as a deployable surface.
This page owns the second: how the site and the engine ship, and the one
law every lane rides.

## The faun seal (the deploy safety law)

The engine keeps its runtime sqlite stores beside the working directory —
`vault-storage.db` (the storage truth, `VAULT_STORAGE_URL`), `uistore.db`
(the interface copy) — with their `-wal` and `-shm` sidecars. A deploy lane
that publishes the **application root** ships the whole database over
https: the store, the write-ahead log, everything. The seal is layered and
every layer is pinned by `tests/deploysafety.test.ts`:

1. **The build emits into `dist`, never the root.** `vite.config.ts`
   declares `outDir: dist` and the build copies the deploy faces
   (`_headers`, `_redirects`, `robots.txt`, `sitemap.xml`, the unhashed
   icons the webmanifest cites) into it — the output is self-contained.
2. **Every publish lane mounts `dist` only.** `netlify.toml`
   (`publish = "dist"`), `vercel.json` (`"outputDirectory": "dist"`),
   `wrangler.toml` (`directory = "dist"`), the capacitor `webDir`, and the
   container's static root all point at the build output.
3. **`_headers` seals the database faces.** A stray `*.db`, `*.db-shm`,
   `*.db-wal` or `*.db-journal` inside the publish tree answers
   `no-store`, `noindex` and never renders inline.
4. **The engine refuses the faces itself.** The api.ts static lane answers
   404 for any database pathname, even a stray store inside the static
   root — the seal holds where the engine owns the door.

## The static lanes (netlify · vercel · workers · pages)

The Sol theme is a static SPA; every static host mounts the same build:

```bash
pnpm install --frozen-lockfile
pnpm build          # emits the site into dist/
```

- **Netlify** — `publish = "dist"`, the SPA rewrite rides the `[[redirects]]`
  entry of `netlify.toml`, and the `_headers` / `_redirects` faces land in
  the publish dir through the build itself.
- **Vercel** — `outputDirectory: "dist"`, the SPA rewrite rides the
  `rewrites` entry of `vercel.json`.
- **Cloudflare Workers** — `[assets] directory = "dist"` in `wrangler.toml`.
- **GitHub Pages** — the family pages workflow stages the vault leg out of
  `dist` under the site subpath (the flat root emit the lane used to read
  is retired).

The static lanes serve the site face only — the storage engine never runs
on them (the pages render the rehearsal surfaces; the live api lane below
is what answers the real deposits).

## The engine container (docker)

The container is the engine, not a static mirror: one process, one port.
`node api.ts` serves the token-gated storage truth (`/api/*`) **and** the
built site face from `/app/dist` — the api.ts static lane owns the content
types and the spa fallback, so no proxy sits in front.

```bash
docker build -t vault .
docker run -d \
  -e VAULT_TOKEN="$(openssl rand -hex 32)" \
  -p 3210:3210 \
  -v vault-data:/app/data \
  vault
```

The boot refuses to start without `VAULT_TOKEN` (fail closed — the engine
would seal every storage route anyway; the operator gets the loud refusal
instead of the quiet 503s). The environment the container answers:

| Variable | Default | What it owns |
| --- | --- | --- |
| `VAULT_TOKEN` | — (required) | the total admin bearer every `/api/v1/*` data route accepts (`Authorization: Bearer …` or `x-vault-token`) |
| `VAULT_PORT` / `VAULT_HOST` | `3210` / `0.0.0.0` | the listen surface of the engine |
| `VAULT_STORAGE_URL` | `file:/app/data/vault-storage.db` | the storage truth (sqlite, WAL) |
| `VAULT_UISTORE_DB` | `/app/data/uistore.db` | the interface copy store |
| `VAULT_STATIC_DIR` | `/app/dist` | the site face root — unset it when a platform gateway owns the site lane |
| `VAULT_SESSION_SECRET` | derived from `VAULT_TOKEN` | the HMAC key that signs the `vs_` session bearers — pin your own to decouple the account door from the operator token (rotating it retires every standing session) |
| `VAULT_SESSION_TTL` | `604800` (one week) | the session lifetime in seconds |
| `VAULT_AUTH_RATE_MAX` | `30` | the signup/signin ceiling per peer per minute (429 `VAULT_RATE` past it) |

The runtime state lives under `/app/data` (mount it as a volume — the
engine creates the stores on first boot) and never inside the served tree.
The health probe is the open route the engine keeps for the platform:

```bash
curl http://127.0.0.1:3210/api/health
# { "ok": true, "service": "vault", "storage": { "driver": "sqlite" }, "auth": { "required": true, "configured": true } }
```

## The api surface

The routes the engine answers (the catalog lives in `api.ts`):

| Route | What it owns |
| --- | --- |
| `GET /api/health` | the open health probe (no bearer) |
| `GET /api/v1/ui/copy` · `GET /api/v1/ui/copy/:key` | the interface copy (open — the words carry no secret) |
| `POST /api/v1/auth/signup` | the public account door — `{ email, password }`, 201 with the account id, the password only as its scrypt digest (rate limited per peer) |
| `POST /api/v1/auth/signin` | the public password door — 200 with the signed `vs_` session bearer (the answer is the token alone; nothing saves in a browser) |
| `POST` · `GET /api/v1/storage/projects` | create the owner scope (quota floor 900MB) / list the scopes paginated (`?limit=&offset=` — a session sees its own only) |
| `POST` · `GET /api/v1/storage/projects/:id/keys` · `DELETE /api/v1/storage/projects/:id/keys/:keyid` | mint one `vk_` key (the secret answers once), list labels + last-used, revoke |
| `POST /api/v1/storage/objects` | the deposit — raw body bytes, `x-project-id` / `x-object-path` / `x-object-mime` headers |
| `GET /api/v1/storage/objects?project=` | the live rows of one project |
| `GET` · `DELETE /api/v1/storage/objects/:id` | the verified bytes back / the soft delete |
| `GET` · `POST /api/v1/storage/quota?project=` | the usage and the user-defined limit |
| `GET /api/v1/storage/usage?project=` | the usage census |
| `POST /api/v1/storage/sweep` | the orphan sweep (the operator token alone — it walks the whole catalog) |

### The three doors of the data gate

Every data route accepts one of three bearers, each one scoped (the
`Authorization: Bearer` or `x-vault-token` lanes both work):

1. **The operator token** (`VAULT_TOKEN`) — total admin, every project and
   every lane (the retrocompatible door: standing callers keep riding).
2. **A project key** (`vk_…`) — authorizes its own project only; the gate
   stamps `last_used_at` on every ride, and a revoked key answers 401.
3. **A session token** (`vs_…`, from the signin) — authorizes the projects
   of the signed-in account (the ones it minted).

A route that names a project outside the caller's scope answers
`403 VAULT_FORBIDDEN`; the sweep answers the operator token alone. Every
data route answers `401 VAULT_AUTH` without an honest bearer and `503
VAULT_AUTH` while no door is configured at all (fail closed, never fail
open).
