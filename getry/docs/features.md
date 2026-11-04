# getry features

every feature below is read from the code of the getry app root and the Sol theme.

## gateway

- universal engine — `engine.ts` `createversion(cfg)` turns one config into all 7 route handlers; every version behavior is config driven.
- five gateway versions — v1 zai, v2 babel, v3 nvidia, v4 opencode+kilo, v5 openrouter, cataloged in `gateway.ts`.
- 35 OpenAI-compatible routes — 7 route kinds (chat/completions, completions, embeddings, keys, messages, models, responses) per version, counted by `totalroutes()`.
- paused fallback — v2 babel answers 503 with a fallback route to v1; the engine checks the paused flag before every post route.
- dynamic version config — the config loader probes `Sol/config.mjs|ts|js` for a user definition; `gatewayviewconfig.ts` ships the v1–v5 example catalog.
- route info endpoints — every version answers a get info descriptor (models, routes, fusion context, meta model).
- key status endpoint — the keys route reports auth mode, env key count, signup url and key url per version.
- model catalog endpoint — the models route lists the version models with context, max output, thinking/streaming/tools/vision flags; the devthink meta model rides first.
- request validation — malformed or non-object bodies answer 400 before any upstream call.
- cors handling — preflight and cors headers on every route.
- response formats — chat completion, anthropic message and response shapes built from one pipeline.
- gateway cli — `cli.ts` scaffolds and inspects gateway configs.
- gateway probe — `gatewayprobe.ts` runs a manual chat round trip against a deployed host.
- container smoke — `gatewaysmoke.ts` runs one full offline request cycle against the recorded openaicompat fixture.

## providers

- 12-entry provider table — openai, zai, openrouter, anthropic, google, qwen, deepseek, groq, mistral, xai, ollama, mimo with base urls and credential env vars (`providers.ts`).
- three wire protocols — openai, anthropic and google request/response mapping with per-family header builders.
- credential hygiene — keys resolve from env vars only, never literals; `redactProviderError` strips bearer values before any surface.
- transport retry — 3 attempts on 5xx and network faults with 250ms→4000ms exponential backoff.
- model listing — `listModels` resolves the provider catalog with context window and streaming flags.
- provider cli — `providercli.ts` inspects the provider surface.
- antigravity lineage — `antigravity.ts`, `oauth.ts`, `accounts.ts`, `request.ts`, `search.ts`, `fingerprint.ts`, `versionregistry.ts`, `constants.ts` carry the antigravity/gemini-cli/cloudcode-pa provider plugin: oauth with PKCE, token exchange and refresh, account files, request building, search and fingerprinting.
- multi-account manager — round-robin plus sticky account rotation, chmod 600 atomic writes, quota/429 detection with automatic rotation (`accounts.ts`).

## reasoning

- 7-level thinking ladder — none, minimal, low, medium, high, xhigh, max with budgets 0, 1400, 5500, 17000, 68000, 68000, 68000 (`thinking.ts`).
- default level — high (68000) resolved when the request names none.
- level validation — `islevel` checks request values against the ladder; `budgetof` resolves the token budget.
- provider param mapping — budgets map onto `thinking` (v1) or `chattemplatekwargs` (v3) per version config.
- two-calls pattern — the engine splits reasoning from response when the thinking budget plus response cap crosses the threshold (default 98304), with a fresh-response guarantee.
- reasoning-first emission — normalized chunks emit reasoning delta before content.
- thinking signature cache — LRU 100-entry cache preserves thinking blocks between chunks (`streaming.ts`).

## keys and rotation

- 13 auth methods — bearer, apikeyheader, queryparam, basic, oauth2clientcredentials, jwtsign, sigv4, hmacsign, cookie, mtls, keylesssdk, anonymous, none (`types.ts`).
- four key sources — db, env, inline, ephemeralurl resolved in order, first hit wins (`auth.ts`).
- three key rotation modes — single, roundrobin, lru.
- 22 nvidia keys — registered into the `nvidiaKey` table and rotated round-robin on v3 (`registernvidiakeys.ts`).
- ephemeral keys — v2 babel resolves ip-bound 60-minute keys from the provider key endpoint.
- weighted pool rotation — weight-based route picks with a cooldown ledger: 3 allowed fails, 5s cooldown, 5s escalation, 60s ceiling (`routerotation.ts`).
- meta model rotation — the devthink meta rotates across the version backend pool every 6 messages (v3, v4) or per request (v5).
- model rotation triggers — rotate on statuses (v3: 529, 404, 410) and on per-attempt timeout.
- retry with backoff — v3 config: 3 retries, 400ms base, 8000ms cap, ±20% jitter, retry statuses 429/502/503/504, 400 non-retryable.
- circuit breaker — optional per-version breaker that opens after n consecutive failures for a cooldown.
- model fallback — error-code catalog plus a fallback runner that walks the route chain, excluding tried routes, applying errors to key counters (`streamfallback.ts`).

## sessions

- session context store — one row per (sessionId, provider) with rotation index, thinking level and budget, context window, message count (`sessions.ts`).
- rotation cadence — `ROTATIONEVERY = 6` turns per rotation.
- session ordering — `freshestfirst` by last message; `contextshare` computes context window usage.
- history restore — v3 restores session history per config (limit 1000, truncate margin 4096).
- chat log persistence — every request/response row lands in `ChatMessage` via `savemsg` with version-specific fields.

## quota

- dual-source quota — antigravity plus gemini-cli quota summary retrieval (`quota.ts`).
- adaptive TTL cache — 15 minute default TTL, soft threshold at 90% remaining.
- background refresh — quota refreshes ahead of expiry at a 15 minute default interval.
- quota-aware account handling — `canProceedWithRequest`, exhausted detection and account skip by summary.
- quota groups — per-group definitions over weekly, 5h, daily, hourly and monthly windows.
- on-disk cache — `~/.config/opencode/cache/antigravity/quota.json`.

## data layer

- prisma + sqlite — `schema.prisma` with six models: ChatMessage, NvidiaKey, TownKey, ApiKey, SessionContext, OnboardingState.
- serverless adapter — libsql http/https or file url through `DATABASE_URL` with driver adapters.
- better-sqlite3 mirror — prepared-statement-only local runtime behind a dynamic import the browser never bundles (`db.ts`).
- typed in-memory seeds — KEYSEED, MESSAGESEED, SESSIONSEED answer the static build when the HTTPS endpoint is absent.
- key masking — `maskkey` renders keys as first 8 + last 4 characters.

## ui (Sol theme)

- route table — /intro, /onboarding, /, /versions, /thinking, /sessions, /404 mounted by `Sol/Sol.tsx`.
- versions page — five gateway replica rows with provider chips, live dots and route chips, the parser pattern rail and quick-start calls.
- thinking page — the 7-level ladder with hairline budget bars against the 68k ceiling and the default rung marked.
- sessions page — the session ledger with rotation summary, masked keys meta rail and recent chat log.
- entry flow — intro and onboarding pages guarded by first-run flags (`onboardingstate.ts`).
- wingets — HomeEntrygate, ShellBrandmark, ShellEmptystate shared components.
- toast — the toast notification surface.
- copy law — every interface string lives in the label store (`labels.ts`); pages read through the typed accessor.
- scroll reveal — observeReveals drives the entrance animations (`reveal.ts`).
- theme switch — dark/light toggle over the Sol tokens (`theme.ts`).

## family integration

- family table — eight siblings (argan, cadria, debonair, forge, foundry, saddle, stealthhead, vault) with accents, consumed by the shell rail and the test suite (`family.ts`).
- family urls — the `"../" + slug + "/"` relative contract keeps cross-app links mount-proof (`familyurl.ts`).
- debonair lane — the debonair api lane of the family gateway (`debonairlane.ts`).
- workload lanes — `sandboxmodality.ts` declares the lanes this app owns in the family catalog.
