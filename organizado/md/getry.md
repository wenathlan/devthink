# getry

## Objective

Getry is the AI gateway of the family: five provider gateway versions (zai, babel, nvidia, opencode+kilo, openrouter) serving 35 OpenAI-compatible routes with the seven-level thinking system, the session store and the key rotation. Every version behavior is config-driven — one universal engine turns one config into all route handlers.

## Features

- Universal gateway engine — one config becomes all seven route handlers per version; behavior is config driven.
- Five gateway versions — v1 zai, v2 babel, v3 nvidia, v4 opencode+kilo, v5 openrouter, cataloged with provider chips, live dots and route chips.
- 35 OpenAI-compatible routes — seven route kinds (chat completions, completions, embeddings, keys, messages, models, responses) per version.
- Paused fallback — a paused version answers 503 with a fallback route to the first version; the paused flag is checked before every post route.
- Dynamic version config — a user definition is probed from the theme config surface; an example catalog ships the five versions.
- Route info endpoints — every version answers a descriptor with models, routes, fusion context and the meta model.
- Key status endpoint — the keys route reports auth mode, environment key count, signup and key URLs per version.
- Model catalog endpoint — the models route lists context windows, max output and the thinking/streaming/tools/vision flags, with the platform meta model riding first.
- Request hygiene — malformed bodies answer 400 before any upstream call; CORS and preflight handled on every route; three response shapes built from one pipeline.
- Gateway tooling — a CLI that scaffolds and inspects configs, a manual chat probe against a deployed host, and an offline container smoke over the recorded fixture.
- Twelve-provider table — openai, zai, openrouter, anthropic, google, qwen, deepseek, groq, mistral, xai, ollama and mimo with base URLs and credential environment variables.
- Three wire protocols — openai, anthropic and google request/response mapping with per-family header builders.
- Credential hygiene — keys resolve from environment variables only, never literals; provider errors are redacted before any surface.
- Transport retry — bounded attempts on 5xx and network faults with exponential backoff.
- Antigravity provider plugin — OAuth with PKCE, token exchange and refresh, account files, request building, search and fingerprinting for the antigravity/gemini-cli/cloudcode lineage.
- Multi-account manager — round-robin plus sticky rotation, atomic 600-mode account writes, quota and 429 detection with automatic rotation.

## Gateway/AI

- Seven-level thinking ladder — none, minimal, low, medium, high, xhigh and max with token budgets from 0 to 68000; high is the default when the request names none.
- Two-calls pattern — the engine splits reasoning from response when the thinking budget plus response cap crosses the threshold, with a fresh-response guarantee and reasoning-first emission.
- Thinking signature cache — an LRU cache preserves thinking blocks between chunks of a stream.
- Thirteen auth methods — bearer, api key header, query param, basic, OAuth2 client credentials, JWT signing, sigv4, HMAC signing, cookie, mTLS, keyless SDK, anonymous and none.
- Four key sources — database, environment, inline and ephemeral URL, resolved in order, first hit wins.
- Three rotation modes — single, round-robin and LRU.
- Weighted pool rotation — weight-based route picks with a cooldown ledger (three allowed fails, short cooldown, escalation, ceiling).
- Meta model rotation — the platform meta model rotates across the version backend pool every six turns or per request; rotation triggers on specific statuses and per-attempt timeouts.
- Retry and protection — retry with backoff and jitter, an optional per-version circuit breaker, and a model fallback runner that walks the route chain excluding tried routes.
- Key pools — registered nvidia key table rotated round-robin; ephemeral IP-bound keys with a sixty-minute life for the paused provider.
- Session store — one row per session and provider with rotation index, thinking level and budget, context window and message count; rotation every six turns; freshest-first ordering with context share; history restore per config; every request and response row persisted.
- Quota engine — dual-source quota summaries, an adaptive TTL cache with background refresh, quota groups over weekly, five-hour, daily, hourly and monthly windows, exhausted-account skipping and an on-disk cache.
- Provider CLI — inspects the provider surface; model listing resolves catalogs with context windows and streaming flags.

## Interactions

- Route tree — intro, onboarding, home, versions, thinking, sessions and the 404 page.
- Versions page — five gateway replica rows with provider chips, live dots, route chips, the parser pattern rail and quick-start calls.
- Thinking page — the seven-level ladder with hairline budget bars against the ceiling and the default rung marked.
- Sessions page — the session ledger with rotation summary, masked key meta rail and the recent chat log.
- Entry flow — intro and onboarding guarded by first-run flags; toast, scroll reveal, theme switch and the typed label accessor law.

## Data

- Prisma plus SQLite with six models (chat messages, nvidia keys, town keys, api keys, session contexts, onboarding state); a serverless adapter over HTTP/file URLs; a better-sqlite3 mirror behind a dynamic import the browser never bundles; typed in-memory seeds answer the static build; keys render masked (first eight plus last four).

## Engine role

Gateway and AI engine of the family: the debonair generation lane, the OS chat and every sibling AI consumer ride this gateway.

Padrão: seguir o padrão moderno.
