# getry gateway

## overview

- getry is the AI gateway of the wenathlan family (`@wenathlan/getry`, version 2.0.155, GPL-3.0-only).
- five provider gateways (v1 zai, v2 babel, v3 nvidia, v4 opencode+kilo, v5 openrouter) serve 35 OpenAI-compatible routes with the 7-level thinking system, the session store and the key rotation.
- `schema.prisma` describes the database the gateway lanes consume; the app ships as one static Sol surface plus a self-hosted gateway server.
- engine doctrine: one universal engine (`engine.ts`) consumes a config and generates every route handler per version — nothing is hardcoded per provider.

## module inventory

- `gateway.ts` — the gateway versions domain: `GATEWAYROUTES` (the 7 route kinds), `GATEWAYVERSIONS` (the v1–v5 catalog), `PARSERSTEPS` (the streaming parser pattern), `listversions`, `findversion`, `totalroutes`, `liveversions`, and `thinkingchain` (the level-routed cross-provider chain the thinking seat computes over this catalog).
- `gatewayconfig.ts` — the embedded single-version gateway definition (v1 zai sdk, keyless).
- `gatewayviewconfig.ts` — the shipped multi-version catalog (v1–v5) the console page renders; the config loader probes `sol/config.mjs|ts|js` for user overrides.
- `engine.ts` — the universal gateway engine: `createversion(cfg)` produces all route handlers from one `gatewayconfig`.
- `server.ts` — the gateway transport: sse/ndjson writers, heartbeat discard, frame parser, chunk builders, `makestreamresponse`, `createserver`, `main`/`runserver`, plus the config loader (`loadconfig`, `reloadconfig`, `getversion`, `listversions`).
- `auth.ts` — request auth and key resolution: token/session/request id extraction, `resolvekeys`, `buildauthheaders`, `buildauthqueryparams`.
- `types.ts` — the config surface: `gwauthmethod`, `authconfig`, `keysource`, `keyrotationmode`, `rotationconfig`, `retryconfig`, `timeout` types, `versionhandlers`, `gatewaydefinition`.
- `providers.ts` — the workbench chat provider transport: the 12-entry `PROVIDERS` table, per-protocol body/header builders, `streamChat`, `listModels`.
- `llm.ts` — the model call core: request building, provider calls, stream delta parsing, command guard, plan drafting, replan on fail, step reflection, usage accounting.
- `streaming.ts` — the SSE parser and stream normalizer: split-tolerant parsing, payload normalization, thinking signature cache, OpenAI/Anthropic transformers, auto-recovery.
- `streamfallback.ts` — the upstream error catalog and the fallback runner that walks the route chain when one model dies.
- `routerotation.ts` — the model pool rotation math: weighted draws, health-aware round-robin under a persisted cursor (`pickroundrobin`, `rotatepool`) and the cooldown ledger (litellm-style knobs).
- `sessions.ts` — the per-(sessionId, provider) session context store and rotation index.
- `thinking.ts` — the thinking seat (`@wenathlan/getry/thinking`): the registerable 7-level reasoning ladder plus the routing the rungs drive — tier routing (`targettier`), the budget clamp (`clampbudget`), the two-calls verdict (`twocallspattern`, `TWOCALLSTHRESHOLD`), the fallback chain (`fallbackchain`, `modelcapable`), the session/stream lanes (`lanesof`) and the provider catalog chain (`providersserving`, `providerchain`) — pure dependency-free math over structural rows.
- `quota.ts` — dual-source (Antigravity + Gemini CLI) quota manager with adaptive TTL cache.
- `models.ts` — the merged model catalog (frozen 25/08/2026): model definitions, classifiers, thinking tables, endpoint routing.
- `intelligence.ts` — provenance, token estimation, markdown chunking, rag manifest, llms.txt, metric store.
- `oauth.ts` / `accounts.ts` / `recovery.ts` / `project.ts` — the provider oauth family, multi-account manager, recovery and project id discovery.
- `db.ts` — the database contract: typed rows, in-memory seeds, HTTPS accessors, the health-aware round-robin key picker (`nextkeyrow`) and the better-sqlite3 mirror (onboarding states, labels and the `gateway_versions` route table).
- `prismaconfig.ts` / `prismashim.ts` / `nodeshim.ts` — prisma schema path resolution and runtime shims.
- `gatewaycheck.ts` — the two gateway check seats in one file: the offline container smoke (one full request cycle against the recorded openaicompat fixture) and the manual probe (chat round trip against a deployed gateway, `GET /v1/models`, `POST /v1/chat/completions`).
- `registernvidiakeys.ts` — registers the 22 nvidia api keys into the `nvidiaKey` table.
- `cli.ts` / `providercli.ts` — the gateway cli and the provider cli.
- `versionregistry.ts`, `request.ts`, `search.ts`, `fingerprint.ts`, `constants.ts`, `antigravity.ts` — the antigravity/gemini-cli provider lineage: version resolution, request building, search, fingerprinting, endpoint constants.
- `json.ts` / `jsonschema.ts` / `jsonpolicy.ts` — the json model: extraction, declarative schema bridge, confidence policies.
- `family.ts` / `familyurl.ts` / `debonairlane.ts` — the family table, the relative-url contract, the debonair api lane.
- `labels.ts`, `theme.ts`, `reveal.ts`, `onboardingstate.ts`, `sandboxmodality.ts`, `utils.ts`, `typeface.ts` — copy store, theme switch, scroll reveal, first-run flags, workload lanes, shared helpers.

## providers

the gateway serves five provider versions (gateway.ts, gatewayviewconfig.ts):

- `v1` — zai (live). passthrough retransmit via the z ai web dev sdk, `keylesssdk` auth (no token, no chat id). models: devthink meta plus the glm family (glm-5.3, glm-5.3-flash, glm-5.3-fast, glm-5.3-air, glm-5.2, glm-5.1, glm-5, glm-5v, glm-5-turbo, glm-4-plus, glm-4-flash). default model `devthink`, maxtokens 8192, temperature range [0, 2] default 0.7.
- `v2` — babel town (paused). returns 503 with fallback to `/v1/chat/completions` on v1; embeddings disabled; auth via `x-token` header with ephemeral keys from `https://glm.babel.town/api/get_api_key` (60 minute expiry, ip bound). models: babel-glm-5.3, babel-glm-5.3-flash, babel-glm-5.2, babel-devthink.
- `v3` — nvidia nim (live). bearer auth with `roundrobin` key rotation over the 22 registered nvidia keys (db model `nvidiaKey`, env fallback `NVIDIA_API_KEY`). upstream `https://integrate.api.nvidia.com/v1`. 17 chat models (kimi-k3, deepseek-v4-pro, muse-glimmer-30b, laguna-xs-2.1, nemotron-3 family, gpt-oss-120b/20b, gemma-4-31b, mistral-nemotron, llama-3.2 vision) plus the devthink meta. the meta model rotates across the 4 backends (kimi-k3, deepseek-v4-pro-0813, muse-glimmer-30b, laguna-xs-2.1) every 6 messages.
- `v4` — opencode zen plus kilo (live). anonymous free tier, no api key; upstreams `https://opencode.ai/zen/v1` and `https://api.kilo.ai/api/gateway` with mutual fallback; free-tagged model discovery; devthink meta rotates every 6 messages.
- `v5` — openrouter (live). bearer auth over `OPENROUTER_API_KEY` (single-key rotation, signup url `https://openrouter.ai`, ride-along `http-referer`/`x-title` headers); 19 `:free` tagged models plus the devthink meta; the meta rotates per request (everynmessages 1).

beside the gateway versions, `providers.ts` carries the workbench transport table with 12 provider definitions — openai, zai, openrouter, anthropic, google, qwen, deepseek, groq, mistral, xai, ollama, mimo — each with base url, wire protocol and the env var that feeds its credential (never a literal key).

## routes

- every gateway version carries the same 7 route kinds (`GATEWAYROUTES`): `chat/completions`, `completions`, `embeddings`, `keys`, `messages`, `models`, `responses`.
- 5 versions × 7 route kinds = 35 routes (`totalroutes()`).
- `createversion` produces one handler per route kind (`versionhandlers`: handleinfo, handlekeys, handlemodels, handlechatcompletions, handlecompletions, handlemessages, handleresponses, handleembeddings).
- request pipeline per the engine: paused check → model resolution (requested / default / meta rotation pick) → auth resolution → body building (sampling params per policy, thinking param per config) → execution (retry backoff, rotation, timeout, circuit breaker) → streaming (byte passthrough, sse parsing, heartbeat discard, masking) → persistence (`savemsg`) → response building (OpenAI chat completion / anthropic message / response formats).
- the canonical streaming parser pattern (`PARSERSTEPS`): readablestream with safeenqueue/safeclose, 200ms keepalive only after 1s silence, upstream fetch with abortsignal timeout 2147483647, sse frame split on double newline (never partial), heartbeat discard, model masking to `devthink` via regex, normalized delta emission (reasoning before content), finish with stop reason plus single done plus savemsg.

## reasoning levels

the 7-level thinking ladder (`thinking.ts`), each level bound to a token budget:

- `none` — budget 0, no thinking.
- `minimal` — budget 1400, quick reasoning.
- `low` — budget 5500, light reasoning.
- `medium` — budget 17000, balanced.
- `high` — budget 68000, deep reasoning (the default, `DEFAULTTHINKINGLEVEL`).
- `xhigh` — budget 68000, extra deep.
- `max` — budget 68000, maximum.

- helpers: `listlevels`, `budgetof`, `islevel`, `formatbudget`; the registration surface (`registerthinkinglevels`, `GETRY_THINKING_LEVELS`) replaces the whole ladder with any count of rungs.
- the engine maps the budget onto the provider param (`chattemplatekwargs` for v3, `thinking` for v1) and takes the two-calls verdict from the seat (`twocallspattern`): the pattern fires when the thinking budget plus the response cap crosses the threshold (`TWOCALLSTHRESHOLD`, default 98304) or whenever the level thinks at all.
- the routing the level drives (all pure math in `thinking.ts`):
  - tier routing — `targettier` maps the rung POSITION (never the name) to the model tier: none/minimal → 4 (economy), low/medium → 3 (mid), high → 2 (strong), xhigh/max → 1 (flagship); registered ladders route by the same fraction.
  - token budgets — `clampbudget` clamps the level budget to the model's output ceiling.
  - fallback chains — `fallbackchain` orders a catalog by tier distance from the target tier, then full-budget fit, then leaderboard score, then id; `modelcapable` never serves a reasoning-false model a thinking level.
  - lanes — `lanesof` resolves the bind order: the session lane (per-session rotation cursor and budget) before the stream lane (reasoning deltas before content).
  - provider catalog — `providersserving`/`providerchain` build the cross-provider walk (live providers first, paused providers last); `gateway.ts` wires the real v1–v5 rows through `thinkingchain`.

## auth and key rotation

- 13 auth methods (`gwauthmethod` in types.ts): bearer, apikeyheader, queryparam, basic, oauth2clientcredentials, jwtsign, sigv4, hmacsign, cookie, mtls, keylesssdk, anonymous, none.
- key sources resolved in configured order, first hit wins: `db` (prisma model lookup), `env` (single or separator-joined), `inline` (config provided), `ephemeralurl` (babel town pattern).
- key rotation modes when multiple keys exist: `single`, `roundrobin`, `lru`.
- v3 carries the key pool: 22 nvidia keys registered into the `nvidiaKey` table, round-robin per request.
- pool-level rotation (`routerotation.ts`): weight-based picks, health-aware round-robin under a persisted cursor and the cooldown ledger — 3 allowed fails, 5s cooldown, 5s escalation step, 60s ceiling (litellm router defaults lifted as pure math).
- key-row rotation (`db.ts` `nextkeyrow`): health-aware round-robin over the `ApiKeyRow` pool — active, unexpired keys only; never rate-limited, never erroring seats lead; an erroring key rides only when nothing healthy remains; selection answers the row, rendering masks (`maskkey`).
- session-level rotation (`sessions.ts`): the devthink meta model rotates every `ROTATIONEVERY = 6` turns within a session.
- errors from upstream land on the key counters (`applyerrortokey` on `ApiKeyRow`) and feed the fallback chain.

## streaming and fallback

- sse transport (`server.ts`): 200ms keepalive interval, suppressed under 1s of activity; `parsesseframes` splits frames on double newline; `discardheartbeat` drops colon-prefixed and ping lines; `maskmodel` rewrites the upstream model name to `devthink`; `makechunk`/`makefinalchunk` build normalized OpenAI-shaped chunks.
- stream normalizer (`streaming.ts`): split-tolerant SSE parsing, heterogeneous payload unwrapping (response/candidates/parts), LRU thinking signature cache (100 entries), OpenAI and Anthropic transformers, auto-recovery with exponential backoff plus 0–80ms jitter, synthetic finish injection on abrupt close.
- model fallback (`streamfallback.ts`): every upstream failure maps to one error code (transport, timeout, unauthorized, forbidden, notfound, gone, unprocessable, ratelimited); the runner walks the route chain in priority order, excluding already-tried routes, with the doubling backoff curve plus ±20% jitter from `@wenathlan/devthink/queue`.
- retry (`providers.ts` fetchWithRetry): 3 attempts, 5xx and network faults only, backoff 250ms base doubling to a 4000ms cap.

## data layer

- `schema.prisma` — sqlite datasource (prisma client with driver adapters; libsql http/https or file url for serverless deploy via `DATABASE_URL`).
- six models: `ChatMessage` (every interaction log across v1–v5), `NvidiaKey`, `TownKey`, `ApiKey` (the key pools), `SessionContext` (per-session rotation and thinking state), `OnboardingState` (first-run flags).
- `db.ts` — typed rows plus in-memory seeds (`KEYSEED`, `MESSAGESEED`, `SESSIONSEED`, the `GATEWAYVERSIONS` family seed) the static build falls back to; the self-hosted deploy answers the same rows over HTTPS; a better-sqlite3 mirror at the foot of the file runs the local gateway runtime (prepared statements only, idempotent schema, dynamic import the browser never bundles).
- the route table is data-driven: the `gateway_versions` mirror table holds the instance rows (seed-on-first-run from the `GATEWAYVERSIONS` family seed, registration-safe upsert through `savegatewayversion`), the internal api (`readgatewayversionrows`, `listversionrows`) serves them, and the versions/home wingets read the rows — never a hardcoded TSX table.
- family sync contract: identity pointers are text, counts are 32-bit ints, time is datetime or iso text.

## sol surface

- `sol/Sol.tsx` mounts the route table: `/intro`, `/onboarding`, `/`, `/versions`, `/thinking`, `/sessions`, `/404`.
- subapps: `home`, `intro`, `notfound`, `onboarding`, `sessions`, `shell`, `thinking`, `toast`, `versions`, `wingets` (HomeEntrygate, ShellBrandmark, ShellEmptystate).
- `versions` — the gateway registry: five replica rows (version tag, provider chip, live dot, the 7 route chips), the parser pattern rail, quick-start calls. every row reads the db route table lane (`listversionrows`: the sqlite mirror of the gateway runtime, the family seed of `gateway.ts` under the static build).
- `thinking` — the reasoning ladder: 7 rungs with hairline budget bars against the 68k ceiling, the default rung marked. every number reads `thinking.ts`.
- `sessions` — the session registry: session contexts as the ledger table, rotation summary and masked provider keys as the meta rail, the recent chat log below. rows arrive over HTTPS from the self-hosted database with seed fallback.

## family integration

- `family.ts` — the eight siblings beside getry in rail order (argan, cadria, debonair, forge, foundry, saddle, stealthhead, vault), each with its accent and dot ink; getry's own violet `#8b5cf6` lives in the theme tokens.
- `familyurl.ts` — the relative-url contract (`"../" + slug + "/"`) that keeps every cross-app link mount-proof.
- `debonairlane.ts` — the debonair api lane of the family gateway.
- `sandboxmodality.ts` — the workload lanes this app owns in the family catalog.

## tests

- 29 test files under `test/` cover the gateway surface: gateway, gatewayversions (the 5/35 route table law, the sqlite mirror rows, the thinking chain), server (auth, engine, property, utils), llm, modelroute, promptlibrary, keyrotation (the health-aware key round-robin and the masking discipline), routerotation, thinkingladder (the registerable ladder and the tier/budget/chain/lane routing), streamfallback, intelligence, jsonpolicy, family, design, cli, providercli, onboardingstate, sandboxmodality, debonairlane, torture.llm, plus the provider lineage (constants, fingerprint, models, oauth) and the shared fixtures (`gatewayserver.ts`, `providerfixtures.ts`, `researchfixtures.ts`).
