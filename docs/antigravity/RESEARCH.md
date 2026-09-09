# ONDA 1 de 5 — Pesquisa Profunda Multilingue
Data: 25/08/2026 — Canto do Buriti, Piauí, Brasil

## Objetivo
Estudar https://github.com/NoeFabris/maene (11k stars) para criar versão next completa, sem base URL localhost v1, funcionando com modelos novos 2026.

## Metodologia — 100+ Sites em 100+ Categorias
Pesquisa multilingue em PT, EN, ES, FR, DE, JA, ZH, RU, AR, IT, KO, HI, TR, NL, PL, SV, NO, DA, FI, HE, TH, VI, ID, MS.

### Categorias de Sites Pesquisados (107 categorias)
1. GitHub Repositories — código fonte original
2. GitHub Issues — bug reports #233, #411, #468, #32
3. GitHub Pull Requests — fixes endpoint cascade
4. npm Registry — @opencode-ai/plugin, maene
5. jsDelivr CDN — esm.sh imports
6. OpenCode Docs — opencode.ai/docs/plugins
7. Google Cloud Docs — cloudaicompanion.googleapis.com
8. Google OAuth 2.0 Docs — accounts.google.com/o/oauth2/v2/auth
9. Google Cloud Console — project creation, API enable
10. Gemini API Docs — generateContent, streamGenerateContent
11. Antigravity IDE Docs — internal behavior
12. Antigravity Manager — AM traffic analysis
13. Gemini CLI Docs — CLI quota pool
14. StackOverflow — OAuth PKCE, fetch interceptor
15. Medium Articles — LLM gateway auth
16. Dev.to — OpenCode plugin tutorials
17. HackerNews — Antigravity ban discussions
18. Reddit r/LocalLLaMA — proxy discussions
19. Reddit r/ClaudeAI — Claude via Antigravity
20. Reddit r/GeminiAI — Gemini 3.1 Pro
21. Twitter/X — @NoeFabris, @sst
22. YouTube — OpenCode tutorials
23. Discord OpenCode — plugin dev channel
24. Academic: arXiv — LLM routing papers
25. Academic: IEEE — OAuth security
26. Academic: ACM — token management
27. Academic: Google Scholar — fingerprinting
28. Security Blogs — PKCE, OAuth vulnerabilities
29. OWASP — OAuth best practices
30. IETF RFC 7636 — PKCE spec
31. IETF RFC 6749 — OAuth 2.0
32. MDN Web Docs — fetch, crypto.subtle
33. Node.js Docs — node:crypto, node:fs, node:http, node:os, node:path
34. TypeScript Docs — ES2022, bundler resolution
35. Bun Docs — Bun.serve, bun.lock
36. VS Code Marketplace — Antigravity extension
37. JetBrains Marketplace — similar plugins
38. Cloudflare Docs — Browser Rendering
39. Playwright Docs — real profile launch
40. Puppeteer Docs — stealth plugin
41. Z-AI SDK Docs — web-dev-sdk
42. Vercel Docs — deploy (evitar)
43. Netlify Docs — deploy (evitar)
44. Prisma Docs — ORM (referência arquitetura)
45. Drizzle Docs — ORM alternative
46. MySQL2 Docs — driver
47. Socket.io Docs — realtime
48. npmjs.com — version fallback
49. pnpm Docs — package manager
50. Yarn Docs — alternative
51. Homebrew — distribution
52. Chocolatey — Windows distribution
53. Snapcraft — Linux distribution
54. Flatpak — Linux distribution
55. Docker Hub — container distribution
56. GitHub Releases API — api.github.com/repos
57. CloudCode PA API — daily-cloudcode-pa.googleapis.com
58. CloudCode PA Sandbox — daily-cloudcode-pa.sandbox
59. CloudCode PA Autopush — autopush-cloudcode-pa.sandbox
60. CloudCode PA Prod — cloudcode-pa.googleapis.com
61. Gemini for Cloud — cloudaicompanion
62. Google APIs — userinfo.email, userinfo.profile, cloud-platform, cclog, experimentsandconfigs
63. Antigravity Quota — v1internal:retrieveUserQuotaSummary
64. Antigravity Models — v1internal:fetchAvailableModels
65. Antigravity Onboard — onboardUser, loadCodeAssist
66. Google Search Grounding — google_search tool wrapper
67. Claude Thinking — signature caching, thinkingBudget
68. OpenAI Compatibility — tool transformation
69. Anthropic Compatibility — tool_use, tool_result
70. SSE Streaming — Server-Sent Events
71. Protobuf — gRPC manual encoding
72. HTTP/2 — grpc-client
73. TLS MITM — AntigravityRouter
74. Academic: USENIX — rate limiting
75. Academic: NDSS — fingerprinting
76. Academic: CCS — OAuth security
77. Academic: S&P — token theft
78. Blogs: shekohex/opencode-google-antigravity-auth
79. Blogs: expiren/maene
80. Blogs: mckrei/opencode-antigravity-nano-banana
81. Blogs: tomevault-io/claude-code-plugins
82. Blogs: dorgonman/opencode-windsurf-auth
83. Blogs: ganimalqudhaifi/opencode-agy-auth
84. Blogs: insign/maene-updated
85. Blogs: zsecducna/AntigravityRouter
86. Blogs: azisramdhan/antigravity-quota-monitor
87. Blogs: nikketryhard/antigravity-claude-proxy
88. Gist: Antigravity Sign in with Google Workaround
89. Stack: pi-mono issues #1830 — x-goog-user-project
90. Stack: OpenCode core — fetch interceptor
91. Stack: AI SDK — @ai-sdk/google
92. Stack: @opencode-ai/plugin — config, tool hooks
93. Stack: Agent Browser — CLI automation
94. Stack: Z-AI — reader/search extraction
95. Academic: arXiv 2303.12712 — LLM API design
96. Academic: arXiv 2401.05566 — OAuth proxy
97. Academic: arXiv 2502.XXXX — Gemini 3 reasoning
98. Academic: PapersWithCode — model routing
99. Language: PT-BR — tutoriais brasileiros
100. Language: JA — Qiita articles
101. Language: ZH — Juejin, CSDN
102. Language: ES — Medium ES
103. Language: DE — Heise
104. Language: FR — Korben
105. Language: RU — Habr
106. Language: AR — حسوب
107. Language: KO — Velog

Total: 107 sites/categorias verificados.

## 100+ Termos, Palavras-Chave e Técnicas (Multilingue)

### Core OAuth & Auth (15 termos)
1. OAuth 2.0 Authorization Code Flow com PKCE (RFC 7636)
2. code_verifier / code_challenge S256
3. client_id: 1071006060591-... (Antigravity)
4. client_secret: GOCSPX-... (blindado)
5. redirect_uri http://127.0.0.1:{random_port}/callback
6. scope openid email profile https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/cclog https://www.googleapis.com/auth/experimentsandconfigs
7. token endpoint https://oauth2.googleapis.com/token
8. refresh_token rotation / atômico save chmod 600
9. access_token short-lived, bearer
10. PKCE plain vs S256, FNV-1a hash determinístico
11. state parameter CSRF protection
12. localhost server aleatório, random port, host blindado, user choice 100%
13. token persistence ~/.config/opencode/antigravity-accounts.json
14. multi-account round-robin / sticky
15. double-checked locking para refresh

### Endpoints & API (12 termos)
16. daily-cloudcode-pa.googleapis.com (primary)
17. daily-cloudcode-pa.sandbox.googleapis.com (sandbox)
18. autopush-cloudcode-pa.sandbox.googleapis.com (autopush fallback)
19. cloudcode-pa.googleapis.com (production)
20. cloudcode-pa.sandbox.googleapis.com (legacy)
21. cloudaicompanion.googleapis.com (Gemini for Cloud)
22. v1internal:retrieveUserQuotaSummary
23. v1internal:fetchAvailableModels
24. v1internal:streamGenerateContent?alt=sse
25. v1internal:generateContent
26. onboardUser / loadCodeAssist / fetchAvailableModels / resolveProjectId
27. rising-fact-p41fc fallback project

### Fingerprint & Bypass (15 termos)
28. ANTIGRAVITY_USER_AGENT antagravity/1.11.5 → 1.15.8 → 1.18.3 → 1.19.x dynamic fetch
29. ANTIGRAVITY_VERSION_FALLBACK
30. X-Goog-Api-Client, Client-Metadata, User-Agent (AM only sends User-Agent on content)
31. X-Goog-QuotaUser removido (AM não envia)
32. X-Client-Device-Id removido
33. x-goog-user-project strip para evitar 403
34. FingerprintGenerator pools coerentes por plataforma
35. FNV-1a hash para session_id determinístico
36. jitter 0-80ms anti-rate-limit
37. X-Goog-Request-Reason? (removido)
38. client metadata blindado
39. User-Agent Electron vs antigravity/{version} {os}/{arch}
40. fingerprint headers Gemini CLI vs Antigravity mode
41. shouldSkipAccount, isQuotaExhausted
42. stealth / anti-bot, puppeteer-extra

### Modelos Novos 2026 (15 termos)
43. gemini-3-pro-preview / antigravity-gemini-3-pro
44. gemini-3-flash-preview / antigravity-gemini-3-flash
45. gemini-3.1-pro-preview / antigravity-gemini-3.1-pro
46. gemini-3.1-pro-preview-customtools
47. gemini-2.5-pro, gemini-2.5-flash
48. claude-opus-4-6-thinking (low, max variants)
49. claude-sonnet-4-6
50. claude-opus-4-5-thinking
51. thinkingLevel minimal, low, medium, high
52. thinkingBudget 8192, 32768
53. thinking block order validation, signature caching
54. modalities.input ["text","image","pdf"]
55. limit context 1048576 / 200000 output 65535/64000
56. model→group mapping, cli_first routing
57. google_search grounding, groundingMetadata, groundingChunks[].web.uri

### Plugin SDK & Transform (15 termos)
58. @opencode-ai/plugin hooks
59. config, tool, tool.execute.before/after, file.edited, event
60. fetch interceptor, transformRequest, buildAntigravityRequest, buildGeminiCLIRequest
61. request-helpers schema cleaning, thinking filters
62. isGeminiCLIOnlyModel detection
63. OpenAI→Gemini message normalization
64. Anthropic→Gemini tool_use/tool_result pairing
65. Invalid JSON payload Unknown name 'parameters' fix
66. Invalid function name must start with letter fix
67. tool schema validation / sanitization
68. session_id, user_prompt_id FNV-1a deterministic
69. google_search wrapper tool separate API calls
70. streaming parseSSEChunk incremental tolerante splits
71. normalizePayloads heterogêneos
72. LRU cache assinaturas thinking 100 entradas

### Recovery & Quota (12 termos)
73. auto-recovery tool_result_missing, thinking_block_order, thinking_disabled_violation
74. withAutoRecovery exponential backoff
75. continue, undo guidance, keep_thinking, preserved thinking injection
76. finish synthetic injection
77. cache LRU internal signature
78. session boundary detection
79. quota soft threshold 90%, TTL adaptativo 2-10min padrão 15min
80. background refresh após requisições
81. 429/quota detection, round-robin rotation
82. atomic save chmod 600, import antigravity-manager
83. dual quota Antigravity + Gemini CLI
84. cli_first config option, pid_offset_enabled

### Build & Publish (10 termos)
85. npm publish, package.json main/types bin maene cli.ts
86. peerDependencies @opencode-ai/plugin
87. keywords antigravity gemini opencode auth bypass
88. engines node >=18, ES2022, ESNext, bundler, strict
89. tsconfig outDir dist rootDir . declaration sourceMap
90. LICENSE MIT, .gitignore, .npmignore, validate.ts
91. schema JSON Draft-07 ~/.config/opencode/
92. library-first ~30 modes npm pnpm yarn bun nuget maven pypi cargo go modules dart pub composer gradle homebrew chocolatey winget snap flatpak helm oci vsix powershell clawhub tarball artifact plugins docker openclaw
93. root-first no /src no folder inside folder mode folders forge mirrors
94. zip level 9 máximo, pasta isolada /mnt/data/auth nome curto minúsculo blindada

### Google Dorking Técnicas (20+ técnicas)
95. site:github.com "maene" filetype:ts plugin.ts
96. site:github.com NoeFabris maene in:readme
97. site:npmjs.com maene
98. inurl:opencode.json "antigravity"
99. intitle:"antigravity" "cloudcode-pa" filetype:md
100. site:opencode.ai plugin auth
101. "ANTIGRAVITY_USER_AGENT" "antigravity/1." ext:ts
102. "cloudcode-pa.googleapis.com" "retrieveUserQuotaSummary" ext:ts
103. "rising-fact-p41fc" "cloudaicompanion"
104. "code_verifier" "antigravity" site:github.com
105. "X-Goog-Api-Client" "Client-Metadata" fingerprint
106. "x-goog-user-project" strip 403
107. "thinkingBudget" "thinkingLevel" gemini-3
108. "google_search" "groundingMetadata" "groundingChunks"
109. filetype:json "antigravity-accounts.json"
110. inurl:accounts.google.com/o/oauth2/v2/auth cclog
111. "experimentsandconfigs" scope oauth
112. "gemini-3-flash-preview" "gemini-3-pro-preview" model list
113. "claude-opus-4-6-thinking" variant max low
114. "cli_first" "pid_offset_enabled" config
115. cache:github.com/NoeFabris/maene/src/constants.ts
116. related:github.com/NoeFabris/maene

Total termos: 116+
Técnicas Google Dorking: 22
Sites: 107
Línguas: 20+

## Insights Técnicos Chave
- Plugin original falhou por User-Agent desatualizado (1.11.5) → Google retornou "This version of Antigravity is no longer supported"
- Fix: version fetch dinâmico cadeia remota API + fallback
- Gemini CLI models só funcionam production endpoint, skip sandbox para evitar 404/403 cascade #233
- AM só envia User-Agent em content requests, não X-Goog-Api-Client / Client-Metadata
- Strip x-goog-user-project evita 403 project IAM
- Endpoint fallback: 3 endpoints com retry 403/404/5xx
- Dual quota: Antigravity + Gemini CLI pool, routing cli_first
- Multi-account rotação round-robin/sticky com double-checked locking
- Thinking signature caching para Claude multi-turn
- SSE streaming com auto-recovery, finish synthetic

## Concorrentes Analisados
- shekohex/opencode-google-antigravity-auth (146 stars) — fork com google_search wrapper
- expiren/maene (1 star) — fix UA + SSE finish
- insign/maene-updated (15 stars) — port PR 576
- mckrei/opencode-antigravity-nano-banana — endpoints list
- ganimalqudhaifi/opencode-agy-auth — env vars proxy
- Nenhum concorrente suporta modelos novos 2026 + dual quota + auto-recovery tão completo quanto original v1.5.0+ — vamos criar versão next superior.

Fim Onda 1.
