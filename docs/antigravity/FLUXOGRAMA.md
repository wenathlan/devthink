# maene v5.0.0 — definitive pesquisas varias

> enable opencode to authenticate against antigravity via oauth — direct cloudcode-pa no localhost v1, dual bypass antigravity+gemini-cli definitive, all models 25/08/2026 including gemini-3.7-flash ga aug 13 2026, robin hood multi-account v3 format addedAt createdAt lastUsed expiry activeIndex activeIndexByFamily rateLimitResetTimes.

## pesquisas varias repos similares semelhantes alternativas

pesquisado:
- NoeFabris/maene original — multi-account, dual quota, thinking signature caching, google search grounding, auto-recovery, image generation, schema cleaner, version dynamic chain, soft quota 90%, login mode selection, fingerprint headers align to AM behavior, accounts file v3 format version 3 accounts activeIndex activeIndexByFamily addedAt lastUsed rateLimitResetTimes projectId managedProjectId, 403 rising-fact-p41fc permission denied, banned/shadow-banned terms violation
- cuongdev/9router — universal ai proxy, prefix routing gc/ cc/ kr/ vertex/, model catalog matrix, auto fallback rtk token saver, 40+ providers, usage storage ~/.9router, model list gc/gemini-3-flash-preview gc/gemini-2.5-pro, claude opus 4.6 sonnet 4.5
- diegosouzapw/omniroute — ai gateway multi-provider, agy provider (antigravity cli) standalone provider with cli token import reuses identical client_id + daily-cloudcode-pa endpoint, executor translator token-refresh own catalog account pool, fix refresh gemini cli project id via loadCodeAssist every 30s to prevent 403 has not been used in project X, fix reuse gemini cli project id for quota checks, oauth client ids ANTIGRAVITY_OAUTH_CLIENT_ID GEMINI_OAUTH_CLIENT_ID
- google/gemini-cli — CodeAssistServer loadCodeAssist without projectId metadata ideType GEMINI platform PLATFORM_UNSPECIFIED pluginType GEMINI, onboardUser FREE tier LRO polling operations, cache Map SHA256 token TTL 1h, X-Goog-Api-Client antigrvity/{ver} gl-node/{node} gccl/1.0.0, User-Agent antigravity/{ver} {os}/{arch}
- zsecducna/AntigravityRouter — parser accepts openai-style anthropic-style model containers, forwards Antigravity internal fetchAvailableModels to google first then injects provider model ids into models object and agentModelSorts
- fdkgenie/9router — universal ai proxy claude code codex cursor amp openai claude gemini copilot

## fluxograma de funcionamento v5 definitive

```
[CLI] opencode auth login
  -> genVerifier 128 + genChallenge S256 + genState CSRF
  -> cbServer random port 0 locked 127.0.0.1 (100% user choice host fixed loopback no 0.0.0.0)
  -> openBrowser https://accounts.google.com/o/oauth2/v2/auth?client_id=1071006060591...&scope=openid email profile cloud-platform userinfo.email userinfo.profile cclog experimentsandconfigs&code_challenge=S256
  -> exchangeCode oauth2.googleapis.com/token + userInfo
  -> accountManager.add {email, refreshToken, accessToken, expiry=now+3600s, createdAt=now, addedAt=now, lastUsed=now, rateLimitResetTimes={}, projectId, managedProjectId, remaining, limit, activeIndex, activeIndexByFamily}
  -> atomicWrite ~/.config/opencode/antigravity-accounts.json chmod 600 tmp+rename v3 format {version:3, accounts:[{email, refreshToken, accessToken, expiry, createdAt, addedAt, lastUsed, projectId, managedProjectId, rateLimitResetTimes:{claude:ts, gemini-antigravity:antigravity-gemini-3-pro:ts}, quotaExhaustedUntil, softQuotaUntil, remaining, limit, disabled}], activeIndex:0, activeIndexByFamily:{claude:0, gemini:0}}

[Plugin Fetch Interceptor] opencode run --model=google/antigravity-gemini-3.7-flash --variant=high
  -> shouldHandle gemini|claude|gpt-oss|image
  -> accountManager.getNext round-robin/sticky robin hood
     filter disabled, quotaExhaustedUntil, softQuotaUntil, rateLimitResetTimes not expired, soft_quota_threshold_percent 90%
     -> activeIndex update, sticky email
  -> refreshIfNeeded double-checked locking
  -> resolveProjectId dual bypass definitive:
     try loadCodeAssist AG ideType ANTIGRAVITY -> projectId
     else loadCodeAssistGeminiCLI ideType GEMINI -> projectId
     else onboardUser FREE tier LRO polling 500ms-8s 5x -> reload
     else fallback rising-fact-p41fc warning (works antigravity, 403 gemini-cli documented)
  -> resolveModelId prefix routing antigravity- -> antigravity group, preview/gemini-3 -> gemini-cli group, claude/gpt-oss -> antigravity
  -> transformRequest:
     cleanSchema remove unsupported json schema -> description hint
     sanitizeToolName regex ^[a-zA-Z][a-zA-Z0-9_]{0,63}$
     normalizeRole, mapBudget minimal 1024 low 8192 medium 16384 high 32768 max 64000 tiered 16384
     parseVariant base thinking isPreview
     isImageModel strip tools buildImageConfig aspect ratio OPENCODE_IMAGE_ASPECT_RATIO safetySettings BLOCK_NONE
     claudeToolHardening param injection
     googleSearch grounding buildSearchTools googleSearch urlContext
  -> buildAntigravity / buildGeminiCLI:
     endpointsForModel: cliOnly -> PROD+DAILY, else PROD+DAILY+SANDBOX skip sandbox #233
     fingerprint: User-Agent antigravity/{ver} {os}/{arch} only, X-Goog-Api-Client antigravity/{ver} gl-node/{node} gccl/1.0.0 for gemini-cli, stripForbidden x-goog-user-project fix #1830
     body: project projects/{projectId} model request contents tools systemInstruction generationConfig thinkingConfig sessionId sessId userPromptId upId jitter 0-80ms
  -> fetchCascade 403/404/5xx retry with jitter
  -> if 429 quota rate limit markExhausted setRateLimit rateLimitResetTimes modelKey 1h toast rotating
  -> background quota refresh retrieveUserQuotaSummary dual pool remaining/limit/used save to account
  -> streaming parseSSEChunk normalizePayloads handleThinkingBlock filter cache_control LRU 100 thinkingCache signatureCache saveSignature
  -> transformToOpenAI / transformToAnthropic with grounding parseGrounding uri title citations
  -> withAutoRecovery exponential backoff 250*2^i+jitter max 10s sessionRecovery contextErrorRecovery
```

## verifica salvando arquivo autenticacao local sharing config entry gravity accounts

accountsPath: ~/.config/opencode/antigravity-accounts.json (all platforms, windows ~ resolves to C:\Users\YourName, not %APPDATA% for new, but legacy migration from %APPDATA%\opencode)

v3 format definitive pesquisas:
```json
{
  "version": 3,
  "accounts": [
    {
      "email": "user@gmail.com",
      "refreshToken": "1//0g...",
      "accessToken": "ya29...",
      "expiry": 1768462905767,
      "createdAt": 1768461573840,
      "addedAt": 1768461573840,
      "lastUsed": 1768462905767,
      "projectId": "my-project-id",
      "managedProjectId": "managed-project-id",
      "remaining": 95,
      "limit": 1000,
      "rateLimitResetTimes": {
        "claude": 1768461898000,
        "gemini-antigravity:antigravity-gemini-3-pro": 1768462966808
      },
      "quotaExhaustedUntil": null,
      "softQuotaUntil": null,
      "disabled": false
    }
  ],
  "activeIndex": 0,
  "activeIndexByFamily": {
    "claude": 0,
    "gemini": 0
  }
}
```

verifica: escreve tudo direitinho — data expiracao expiry, data criacao createdAt, data adicao addedAt, lastUsed, token refreshToken accessToken, projectId, rateLimitResetTimes, activeIndex, activeIndexByFamily, version.

## verifica esquema antigrvity e user agent respeitando

- antigravity.schema.json draft-07, properties cli_first boolean, google_search_enabled boolean|string, quota_refresh_interval_minutes number, rotation_strategy round-robin|sticky, soft_quota_threshold_percent number, claude_tool_hardening boolean, keep_thinking boolean — schema certo
- user agent: antigravity/1.19.2 {os}/{arch} — respeitando, dynamic version fetch chain remote api auto-updater, npm, github, fallback 1.19.2, pesquisas 9router omniroute gemini-cli usam mesmo
- X-Goog-Api-Client: antigravity/{ver} gl-node/{node} gccl/1.0.0 gax/1.0.0 — Google Cloud SDK style, como Gemini CLI age, researches confirm
- fingerprint minimal: only User-Agent on content requests per fix align fingerprint headers to match AM behavior, remove X-Goog-QuotaUser X-Client-Device-Id X-Goog-Api-Client Client-Metadata from fingerprint headers (AM only User-Agent)
- Device ID: original had X-Client-Device-Id but removed to minimize rate limiting per research — v5 respects removal, but can be re-added if needed via config pid_offset_enabled
- API Client: Google Cloud SDK, device id, rate limit, refresh token, active index, accounts — all present in v5 accounts file and headers

## mesmas features originais do open code anti-gravity out, melhorado, bypass project id porque bloqueado baniram

original bloqueado jan 15 2026 IAM_PERMISSION_DENIED Permission cloudaicompanion.companions.generateChat denied on resource //cloudaicompanion.googleapis.com/projects/rising-fact-p41fc/locations/global — google revogou, termos violacao unofficial tool.

v5 melhorado: bypass project id como gemini cli age + proprio antigravity useragent pegando fios Geortips do proprio antigravity — loadCodeAssist sem projectId metadata ideType ANTIGRAVITY platform PLATFORM_UNSPECIFIED pluginType GEMINI + retry GEMINI + onboardUser FREE LRO + cache SHA256 TTL 1h + fallback rising-fact-p41fc warning. pesquisas 9router #1428 omniroute # etc confirmam fix refresh project id every 30s to prevent 403 has not been used.

pasta isolada: /mnt/data/auth — nome curto minusculo blindada, zip nivel 9 maximo completo.
