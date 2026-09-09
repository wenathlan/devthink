# The server library (`@wenathlan/devthink/server`)

The universal AI gateway library of the DevThink grand merge — any LLM, any base URL, any API key. This document carries the library documentation of the merged server lineage, consolidated for the merged repository: the module family lives as `engine.ts`, `oauth.ts`, `http.ts`, `config.ts`, `database.ts`, `utils.ts` and the `server.ts` surface (the console cli and the library barrel interned there by the grand merge consolidation), and the npm library surface lives behind the `./server` subpath of `@wenathlan/devthink`.

The surface stays node only: the engine, the hono server and the prisma persistence ride node adapters, so the family keeps its own entry beside the neutral browser surface the root `index.ts` freezes (the workbench embedded gateway speaks through the workbench server — a different surface, not this library).

Current release: **2.0.1** — see [CHANGELOG.md](../CHANGELOG.md) (the gateway lineage section) and [SECURITY.md](../SECURITY.md) for the supported release line.

## Features

- **12 auth methods**: bearer, apikeyheader, queryparam, basic, oauth2clientcredentials, jwtsign, sigv4, hmacsign, cookie, mtls, keylesssdk, anonymous
- **7 routes per version** (auto-generated): chat/completions, completions, messages, responses, embeddings, keys, models
- **Unlimited versions**: create v1 through v9 and beyond
- **Model rotation**: persession or perrequest, every N messages
- **Base URL rotation**: round-robin or on-failure upstream switching
- **Retry with backoff**: exponential + cryptographically secure jitter, configurable retryable statuses
- **429 handling**: retry, rotate model, rotate base URL or fallback — per status class
- **Cross-provider fallback**: opencode-kilo style chain
- **2-calls thinking pattern**: zai SDK style with fresh response guarantee
- **SSE anti-parse streaming**: brace-depth parser, heartbeat discard, broken-chunk recovery, model masking
- **Context sharing**: optional session history restoration + truncation, shared or isolated
- **Meta-models**: compose multiple individual models behind one dispatch id
- **Universal DB**: Prisma 7 + LibSQL adapter (works on Vercel, Netlify, any Node host)
- **Intelligent scaffolding CLI**: `devthink gateway init` scaffolds everything interactively
- **No platform Functions**: standalone Node process — runs anywhere

## Quick start (CLI)

```text
# scaffold a new gateway
npx @wenathlan/devthink gateway init

# add a version
npx @wenathlan/devthink gateway add v6

# register keys
npx @wenathlan/devthink gateway keys v6

# push the database (prisma 7: the datasource url lives in the
# scaffolded prisma.config.ts, the client generates into node_modules)
npm i -D prisma
npx prisma db push --config prisma.config.ts && npx prisma generate --config prisma.config.ts

# validate the configuration
npx @wenathlan/devthink gateway validate

# serve locally (PORT defaults to 3001, HOST to 0.0.0.0)
npx @wenathlan/devthink gateway serve
```

The full command surface is `gateway <init|add|list|show|validate|keys|models|serve|export|help>`, routed by the `devthink` CLI (`devthink gateway …` or the repository script `bun run server`). The `export` command writes the web folder scaffold (`web/config.mjs`, schema and env) for a standalone deployment.

## Library mode

The library surface imports from the subpath:

```ts
import { createversion, loadconfig } from "@wenathlan/devthink/server";

const def = await loadconfig();
const handlers = createversion(def.versions.v1!);
const response = await handlers.handlechatcompletions(request);
```

Or embed the full server:

```ts
import { createserver } from "@wenathlan/devthink/server";
import { serve } from "@hono/node-server";

const app = await createserver();
serve({ fetch: app.fetch, port: 3001 });
```

Or bootstrap the configured server in one call (`PORT`/`HOST` honored from the environment):

```ts
import { runserver } from "@wenathlan/devthink/server";
await runserver();
```

A hand-built configuration (the config file bridge is optional — the engine consumes plain `gatewayconfig` objects):

```ts
import { createversion } from "@wenathlan/devthink/server";

const handlers = createversion({
  id: "v1",
  routes: ["chat/completions", "completions", "messages", "responses", "embeddings", "keys", "models"],
  auth: { method: "bearer", token: () => process.env.MY_TOKEN },
  models: [
    { id: "gpt-x", upstream: "gpt-x", context: 128000, maxoutput: 16384 },
  ],
  rotation: { mode: "persession", everyN: 12, models: ["gpt-x"] },
  retry: { max: 3, backoffbasems: 400, backoffcapms: 8000 },
  upstreams: [{ baseurl: "https://api.example.com/v1" }],
});
```

### The exported surface

| Group | Exports |
| --- | --- |
| engine | `createversion` (one `gatewayconfig` in, the seven `versionhandlers` out — every behavior config driven, nothing hardcoded), `engineinternals` (the test and tooling seam into the engine internals) |
| server | `createserver` (build the hono app from the loaded config), `runserver` (bootstrap on the configured port with the global error guards) |
| config | `loadconfig`, `reloadconfig`, `validateconfig`, `getversion`, `listversions` — the bridge to the user customization layer |
| auth (12 helpers) | `buildauthheaders`, `buildauthqueryparams`, `appendqueryparams`, `resolvekeys`, `getkey`, `getkeycount`, `masktoken`, `validatetoken`, `extracttoken`, `extractchatid`, `extractsessionid`, `extractrequestid` |
| sse/ndjson stream utilities | `makestreamresponse`, `parsesseframes`, `extractdata`, `isdone`, `discardheartbeat`, `makechunk`, `makefinalchunk`, `maskmodel`, `writeevent`, `writekeepalive`, `writedone`, `safeenqueue`, `safeclose`, `sseheaders`, `ndjsonheaders`, `kams`, `kasuppressms` |
| database | `db`, `getsession`, `getsessionmessages`, `savemsg` (prisma + libsql persistence) |
| types | `gatewaydefinition`, `gatewayconfig`, `versionhandlers`, `authconfig`, `authmethod`, `bodybuildconfig`, `contextconfig`, `dbconfig`, `headersconfig`, `intelligencerank`, `keysource`, `metamodelconfig`, `modeldef`, `resolvedkey`, `retryconfig`, `rotationconfig`, `rotationmode`, `routesconfig`, `sessionstate`, `thinkingconfig`, `thinkinglevel`, `timeoutconfig`, `transportconfig`, `transporttype`, `upstreamdef`, `streamoptions`, `trackedstream` |
| utils | `clamp`, `corsheaders`, `jsonheaders`, `handlecors`, `detectcontenttype`, `esttokens`, `genid`, `getip`, `levenshtein`, `makethinker`, `safejsonparse`, `safestringify`, `thinkingbudget`, `truncatemessages`, `defaultmaxtokens`, `auton`, `autotemp`, `autotopp`, `autoseed`, `automaxtokens`, `autopresencepenalty`, `autofrequencypenalty`, `autothinking` |

The subpath resolves the built `dist/server.js` bundle with its `dist/server.d.ts` declarations — the grand merge consolidation interned the whole server surface (the engine, the auth, the transport, the console cli and the barrel) in the one `server.ts` module the build emits as a single tree-shakable entry beside every other library target. `node tests/build.mjs` emits it together with the full dist family; the engine and the transport ride inside the same bundle.

## Repository layout

```text
devthink/
  server.ts               # the library surface — the ./server entry (the console cli,
                         # the opencode server registrations and the barrel interned)
  engine.ts               # universal engine — routes, rotation, retry, fallback
  http.ts                 # the http transport seam the core freezes
  config.ts               # config validation + the standard web/config.* probe
  oauth.ts                # the provider oauth family (the request auth pair beside it)
  database.ts             # prisma + libsql client
  utils.ts                # shared helpers (secure randomness, ids, headers)
  types.ts                # the public types of every family (gateway section)
  web/                    # the design room of the whole project (the workbench)
    App.tsx               # the workbench entry — one router, one mount
    gatewayview/          # the embedded gateway console (self-contained, no main.tsx)
      Gateway.tsx         # the gateway console page (overview + version detail)
      config.ts           # the shipped v1–v5 definitions (data only)
      definition.ts       # the view-side structural contract of the catalog
    schema.prisma         # the database schema
    console/              # the canonical design page of the cli
    capacitor.config.ts   # android wrapper — same interface
    vercel.json, netlify.toml  # platform manifests — deploy from here
  prisma.config.ts        # prisma 7 config (datasource url, client output)
  scripts/build-lib.mjs   # the library bundle generator (esm + declarations)
  Dockerfile              # THE one container file (see Container)
  pom.xml, devthink.csproj, devthink.gemspec  # the registry envelopes
  tests/server/           # the family suite (engine, http, oauth, config, cli…)
```

The root modules are the universal library (dry, no hardcoding). Everything project-specific lives in `web/` as data — the shipped catalog under `web/gatewayview/config.ts`, the schema at `web/schema.prisma`.

## Deploy

The gateway web console deploys as a static build behind the platform manifests of the web root (`web/vercel.json` and `web/netlify.toml` — the same manifests the workbench deploys through):

- **Vercel** — `web/vercel.json`: `pnpm --dir web build`, output `web/dist/public`, the SPA rewrites and the `/api/*` CORS and streaming headers preconfigured.
- **Netlify** — `web/netlify.toml`: the same build command and publish directory with the matching header block.

The server itself stays a standalone Node process — no platform Functions. Point the deployed console at your running gateway (the console reads its gateway url from the pairing/configuration flow), and host the process anywhere Node runs:

```bash
npx @wenathlan/devthink gateway serve --port 3001
```

The Prisma 7 + LibSQL persistence works on Vercel, Netlify and any Node host — push the schema with `npx prisma db push --config prisma.config.ts` and let the datasource url of the scaffolded `prisma.config.ts` carry the database location (a local file or a remote LibSQL endpoint).

## Container

The merged repository manages every container concern in THE one `Dockerfile` (the saddle standard — a single file, compose absorbed into it): the default `runtime` target is the DevThink self-hosting runner (static site + relay + loopback MCP listener, non-root uid 10000, published multi-arch as `ghcr.io/wenathlan/devthink:<version>`), and the explicit `binary-runtime` target compiles the workbench single binary resolved from `TARGETARCH`. The hardened run recipe (compose absorbed as flags) lives in the Dockerfile header:

```bash
docker build -t devthink:selfhosted .
docker run -d --name devthink --restart unless-stopped --init \
  --cap-drop ALL --security-opt no-new-privileges:true \
  --pids-limit 512 --network none --tmpfs /tmp:size=2g,mode=1777 \
  devthink:selfhosted
```

The library-mode server (`createserver`/`runserver`) embeds in your own runtime — the lineage's dedicated server image was retired by the merge in favor of the one container file, and `gateway serve` on a plain Node host (or an embedded `createserver()` behind your own image) covers the library deployment path. The server honors `PORT` (default 3001) and `HOST` (default 0.0.0.0) from the environment; the database location follows the datasource url of the prisma config, so mount or point it at your persistent store.

## Publish chain

The gateway lineage published through the family release pipeline; the merged repository keeps one chain for every lineage — bumping `package.json` + adding the matching `CHANGELOG.md` section and pushing the tag dispatches the DevThink release workflow, which builds every artifact and publishes npmjs, GitHub Packages npm, Maven, NuGet, RubyGems and GHCR. Every root metadata file (pom.xml `<revision>`, devthink.csproj, devthink.gemspec, the extension manifest, the web package mirror) must carry the package version — the envelopes gate enforces the lockstep.
