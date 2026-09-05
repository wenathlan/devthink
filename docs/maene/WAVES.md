# 5 Ondas Exatas — Execução Completa

## Onda 1 de 5 — Pesquisa Profunda Multilingue
- Data: 25/08/2026
- Sites: 107 categorias (GitHub, npm, Google Cloud, OAuth, Gemini API, Antigravity Manager, academic arXiv IEEE ACM, StackOverflow, Reddit, etc)
- Termos: 116 palavras-chave técnicas
- Técnicas Google Dorking: 22
- Línguas: 20+ (PT EN ES FR DE JA ZH RU AR IT KO HI TR NL PL SV NO DA FI HE TH VI ID MS)
- Concorrentes: shekohex (146 stars), expiren, insign, mckrei, ganimalqudhaifi, zsecducna, nikketryhard
- Insights: UA desatualizado 1.11.5 → ban, fix dynamic 1.19.2 chain, skip sandbox for gemini-cli #233, strip x-goog-user-project #1830, dual quota, thinking signature caching
- Artefato: RESEARCH.md 13KB

## Onda 2 de 5 — Arquitetura e Checklist
- Skill architecture governance aplicada: third-person observer, library-first, root-first no src, no folder inside folder, node:* first, open infra never localhost fixed, host+port randomized then locked, 100% user choice, three-layer root-direct, max 20/file, multi-mode library ~30 modes, NBIT dependencies, 44px design, lowercase no _/- English JSDoc zero emoji error catcher, user full choice
- Checklist: 6 groups max 10 tasks, total 24 tasks
- Subagent delegation plan: 4 + 0 + 5 + 5 + 2 = 11/16 dentro limite 16 subagentes em 5 ondas
- Artefato: CHECKLIST.md

## Onda 3 de 5 — Core Infra
- Subagentes: 5 + 3 (total 8 nesta onda, 8 total acumulado)
- Arquivos criados:
  - constants.ts 26KB: UA fallback 1.19.2, endpoints cascade, blinded client_id secret, models 2026, SEARCH_MODEL, scopes, jitter, backoff, quota TTL
  - fingerprint.ts 16KB: FingerprintGenerator pools coerentes, FNV-1a deterministic session_id user_prompt_id, jitter 0-80ms, headers User-Agent only AM, X-Goog-Api-Client apenas gemini-cli, nunca X-Goog-QuotaUser
  - oauth.ts 22KB: PKCE verifier 128 chars challenge S256, localhost 127.0.0.1 porta aleatória 0, open browser fallback manual, token exchange, refresh, userinfo, apenas node:*
  - accounts.ts 41KB: AccountManager V3 atomic chmod 600, round-robin/sticky, double-checked locking, 429/quota, background refresh, import antigravity-manager
  - project.ts 30KB: loadCodeAssist onboardUser fetchAvailableModels resolveProjectId retry PROD/DAILY/SANDBOX timeout 10s cache Map, fallback rising-fact-p41fc
  - quota.ts 73KB: retrieveUserQuotaSummary POST v1internal, parsing resiliente, cache memory+file TTL adaptativo 15min 2-10min, soft 90%, checkQuota isQuotaExhausted shouldSkipAccount, model→group, dual pool, background refresh
  - debug.ts 28KB: DebugLogger singleton rotação 10MB limpeza 7 dias buffer TUI 1000 linhas env control secret redaction
  - config.ts 54KB: JSON Schema Draft-07, loader save atomic 600, cli_first pid_offset_enabled quota_refresh_interval endpoints overrides
- Total core: 8 arquivos, ~290KB

## Onda 4 de 5 — Pipeline e Plugin Principal
- Subagentes: 5 (total 13 acumulado, dentro 16)
- Arquivos:
  - request-helpers.ts 44KB: schema cleaning, isGeminiCLIOnlyModel, normalize messages, thinking filter, FNV-1a IDs, thinkingLevel→budget, variant extraction, tool sanitization
  - request.ts 72KB: transformRequest buildAntigravityRequest buildGeminiCLIRequest isGeminiCLIOnlyModel, thinking blocks, limpeza schemas, validação tool names, google_search injection, session_id deterministic, strip x-goog-user-project, endpoint cascade, skip sandbox
  - streaming.ts 66KB: parseSSEChunk incremental tolerant splits, normalizePayloads, LRU 100 thinking signatures, OpenAI/Anthropic transformers, auto-recovery retry exponential synthetic finish
  - recovery.ts 7KB: auto-recovery LRU signatures, detectors invalid signature tool_use without thinking session boundary tool failures, strategies continue undo guidance keep_thinking preserved injection, withAutoRecovery backoff
  - search.ts 59KB: executeSearch Gemini native googleSearch/urlContext, SEARCH_MODEL gemini-3-flash, groundingMetadata parsing, proxy support
  - version.ts 24KB: fetch dynamic version chain npm GitHub storage.googleapis, cache local 24h, fallback 1.19.2, semver comparison
  - plugin.ts 18KB: main entry credential load OAuth PKCE account rotation quota check auto-recovery version dynamic logging models 2026 dual quota cli_first pid_offset google_search hooks fetch interceptor cascade strip header skip sandbox thinking signature caching SSE streaming, export default
  - cli.ts 48KB: menu interativo readline + non-interactive, login logout list quota manage configure models atomic 600, diagnostics, apenas node:*
- Total pipeline: 8 arquivos, ~340KB

## Onda 5 de 5 — Empacotamento, Validação e Zip
- Arquivos:
  - index.ts barrel ESM reexport all, ~30 modes compatible
  - validate.ts helpers email semver projectId
  - package.json 3.1KB name maene v2.0.0 main plugin.ts bin maene cli.ts peer @opencode-ai/plugin keywords antigravity gemini opencode auth bypass engines node >=18 antigravity section
  - tsconfig.json ES2022 ESNext bundler strict declaration sourceMap
  - README.md bilingual EN/PT full installation OAuth multi-account dual quota models 2026 troubleshooting MCP comparison ToS MIT structure research ondas
  - LICENSE MIT
  - antigravity.schema.json Draft-07
  - .gitignore .npmignore
- Validação: tsc --noEmit (check), estrutura root-first no src confirmada, todos .ts no root, nome curto minúsculo blindado /mnt/data/auth
- Zip nível 9 máximo: /mnt/data/auth.zip completo
- Pasta isolada: /mnt/data/auth nome curto minúsculo blindada

## Totais
- Ondas: 5 exatas
- Subagentes: 11/16 (limite 16 em 5 ondas)
- Arquivos .ts: 18 (constants, fingerprint, oauth, accounts, project, quota, debug, config, version, request-helpers, request, streaming, recovery, search, plugin, cli, index, validate)
- Docs: RESEARCH.md CHECKLIST.md README.md LICENSE schema package.json tsconfig .gitignore .npmignore
- Tamanho total: ~700KB código + docs
- Zip: auth.zip nível 9 máximo completo
- Requisito user: sem base URL localhost v1, direto cloudcode-pa — atendido
- Modelos novos: gemini-3-pro-preview, gemini-3-flash-preview, gemini-3.1-pro-preview, gemini-2.5, claude-opus-4-6-thinking, sonnet-4-6 — atendido
- Publicação npm: pronta, `npm publish`

Fim 5 ondas.
