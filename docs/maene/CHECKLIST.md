# Checklist Interno — Architecture Governance
Date: 25/08/2026 — specialist third-person observer mode

## Step 0: Date & Research (done)
- consult current date day/month/year: 25/08/2026
- research best implementation, design pattern, dependency versions of that date
- research recurs through every module — date-first governance

## Grouped To-Do List — Max 10 per group, finish group before next

### Group 1: Core Infra & Constants (3/10)
1. constants.ts — endpoints, headers, API config, system prompts, models 2026, blinded secrets, UA dynamic, fallback rising-fact-p41fc
2. fingerprint.ts — FingerprintGenerator, pools coerentes, FNV-1a session_id, jitter 0-80ms, headers
3. version.ts — dynamic version fetch remote API chain, semver comparison, fallback 1.19.2, cache

### Group 2: Auth & Account (3/10)
4. oauth.ts — OAuth PKCE verifier/challenge S256, localhost random port, browser open fallback manual, token exchange, refresh, userinfo
5. accounts.ts — AccountManager V3 types, load/save atômico chmod 600, round-robin/sticky rotation, double-checked locking refresh, 429/quota detection, background refresh, import antigravity-manager
6. project.ts — loadCodeAssist, onboardUser, fetchAvailableModels, resolveProjectId retry PROD/DAILY/SANDBOX 10s timeout, Map cache, metadata save

### Group 3: Quota & Config & Debug (4/10)
7. quota.ts — retrieveUserQuotaSummary POST v1internal, rate limits parsing, cache TTL adaptativo 15min padrão 2-10min, soft threshold 90%, checkQuota, isQuotaExhausted, shouldSkipAccount, model→group, dual pool
8. config/loader.ts + schema.ts — JSON Schema Draft-07 ~/.config/opencode/, properties defaults enums examples bilingual, cli_first, pid_offset_enabled, quota_refresh_interval
9. debug.ts — DebugLogger singleton, rotação 10MB, limpeza 7 dias, buffer TUI circular 1000 linhas, env control, secret redaction, node: builtins only
10. validate.ts — validation helpers, schema

### Group 4: Request Pipeline (4/10)
11. request-helpers.ts — schema cleaning, só-Antigravity detection, OpenCode→Gemini normalize, thinking filter, FNV-1a IDs, thinkingLevel→thinkingBudget, model variant extraction, tool name sanitization
12. request.ts — transformRequest, buildAntigravityRequest, buildGeminiCLIRequest, isGeminiCLIOnlyModel, google_search injection, deterministic session_id
13. streaming.ts — parseSSEChunk incremental tolerante splits, normalizePayloads heterogêneos, OpenAI/Anthropic transformers, LRU cache thinking signatures 100, preserved thinking, auto-recovery retry exponential, synthetic finish
14. recovery.ts — auto-recovery engine, LRU signature cache, detectors signature inválida tool_use sem thinking session boundary tool failures, strategies continue undo guidance keep_thinking preserved injection, withAutoRecovery backoff

### Group 5: Plugin Core & CLI & Index (4/10)
15. plugin.ts — main entry, credential load, OAuth PKCE, account rotation, quota check, auto-recovery, version dinâmico, logging, modelos 2026, dual quota, cli_first, pid_offset_enabled, google_search tool, hooks event/config, fetch interceptor, endpoint cascade 403/404/5xx, strip x-goog-user-project, skip sandbox for gemini-cli models
16. cli.ts — menu interativo, comandos não interativos, escrita atômica 600, integração sem deps externas, configure models action, check quotas, manage accounts
17. index.ts — barrel ESM reexport constants accounts oauth project quota config debug request streaming recovery version fingerprint plugin, named + namespace + default
18. search.ts — executeSearch Gemini native googleSearch/urlContext, SEARCH_MODEL, thinking budget, groundingMetadata parsing

### Group 6: Package & Docs (6/10)
19. package.json — name maene version 2.0.0 description exata main/types plugin.ts bin maene cli.ts peerDeps @opencode-ai/plugin scripts build keywords antigravity gemini opencode auth bypass license MIT author repo files engine node >=18 antigravity section client_id secret UA metadata fallback
20. tsconfig.json — ES2022 ESNext bundler strict esModuleInterop skipLibCheck outDir dist rootDir . include .ts declaration sourceMap
21. README.md — bilingual EN/PT installation OAuth PKCE multi-account dual quota models 2026 troubleshooting MCP comparação concorrentes ToS warning
22. antigravity.schema.json — JSON Schema
23. LICENSE MIT
24. .gitignore + .npmignore

Total 24 tasks, 6 groups, max 10 per group — governance ok.

## Workflow
1. checklist built (done)
2. delegate subagents first — 0-16 subagents grouped by correlated category/theme
3. execute inline
4. local file last resort
5. cleanup temp scripts

## Subagent Delegation Plan — 5 ondas, 16 subagents total
- Onda 1: 4 pesquisadores (falha, fallback para inline research) — done
- Onda 2: 0 subagents (arquitetura inline)
- Onda 3: 5 subagents core (fingerprint, oauth, accounts, project, quota)
- Onda 4: 5 subagents pipeline (request-helpers, request, streaming, recovery, plugin+cli+index)
- Onda 5: 2 subagents package/docs/zip
Total: 11 subagents ≤16 limite — ok

## Governance Verificações (10 pontos)
1. Deploy open — no Netlify/Vercel Functions — usa Prisma/Drizzle/MySQL2/Socket/JS pattern? No functions.
2. Open infra — never localhost fixed? Mas OAuth precisa 127.0.0.1 random port — host+port randomized then locked, user 100% choice ok. Base URL nunca localhost v1 — usa cloudcode-pa.googleapis.com direto — requisito user satisfeito.
3. Structure root-first no src no folder inside folder — todos .ts no root de /mnt/data/auth, mode folders forge mirrors root config fixed — ok
4. Architecture three-layer root-direct logic grouped hierarchically max 20/file modular internal — ok
5. Library + binary across ~30 modes internal memory not bound runtime — TypeScript library-first, export ESM, bin, npm, etc.
6. Dependencies version-catalog + module-config NBIT simplest robust blend — usa node:* first, zero external deps
7. Design fit text to box strict grid no dust 44px fast hover/scramble/cut — README clean
8. Style lowercase no _/- English JSDoc third person zero emoji error catcher — aplicado
9. Coding meticulous verify modern CSS variables external tags descriptive comments — aplicado
10. User full choice no rigid rule forced — cli_first, pid_offset, config schema user choice

Fim checklist onda 2.
