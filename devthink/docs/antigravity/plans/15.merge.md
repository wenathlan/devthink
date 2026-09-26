# Plan 15 — Safe grouping merge (v2.1.15)

Date: 27/08/2026. Goal: every duplicated logic family merges into exactly ONE
owner file; every other file imports from the owner. Model identification lives
ONLY in models.ts, never anywhere else; the same categorical rule applies to
every context. No file may repeat a configuration, a constant value, or a name
that another file owns. Files stay lowercase single words, JSDoc English, no
emoji. The published API surface (index.ts barrel + package.json subpaths)
keeps every currently resolvable export name, but each name resolves to exactly
one canonical implementation.

## Layer DAG (runtime import direction, cycles forbidden; import type cycles allowed)

```
L0 constants.ts        raw shared values only (strings, numbers, arrays, plain objects)
L1 core.ts             generic pure utilities (hash, jitter, ids, retry, timeout)
L1 models.ts           ALL model identification and configuration
L1 debug.ts            logging and redaction
L2 fingerprint.ts      identity masquerade (user agents, client metadata, identity headers)
L2 version.ts          version detection
L2 config.ts           configuration management, validators, config file IO
L2 auth.ts             ALL authentication (oauth clients, scopes, urls, flows, credentials)
L3 accounts.ts         account store and rotation
L3 project.ts          project discovery (loadCodeAssist, onboardUser, projectId cache)
L4 request.ts          request building (transforms, builders, cascade, header stripping)
L4 streaming.ts        response streaming (sse parse, openai/anthropic transforms)
L4 recovery.ts         recovery (toast, error types, signature preservation)
L4 quota.ts            quota
L4 search.ts           search grounding
L5 plugin.ts           opencode plugin entry, hooks only
L5 cli.ts              cli commands
L5 server.ts           local oauth callback server
L5 index.ts            barrel
shim system.ts         pure re-export (published ./system subpath)
shim antigravity-cli.ts pure re-export (published ./antigravity-cli subpath)
```

## Canonical value rules

1. Variants with identical values merge trivially; the owner keeps the value.
2. Divergent variants pick the canonical by precedence: (a) the variant
   exercised by the live-validated v2.1.14 end-to-end chain (request.ts and
   streaming.ts chain for request and streaming families; auth.ts chain for
   auth families); (b) the most complete superset when growth is backward
   compatible; (c) the domain owner variant. The choice is documented in the
   JSDoc of the merged export.
3. One name, one meaning. Same name with different semantics in two files
   (ENDPOINTS host map vs method path map; FORBIDDEN_HEADERS with and without
   x-goog-api-client) is resolved by renaming to an accurate distinct name and
   keeping each semantic exactly once.
4. Runtime imports follow the DAG. A lower layer file never imports a higher
   layer file. import type may cross layers because it erases at runtime.
5. When a value is needed by a file at or below the owner layer, the value
   moves to the lowest common layer (constants.ts when in doubt).
6. Every merged export carries JSDoc; every file header documents which
   families it absorbed in v2.1.15.

## Owner map (family -> owner; source files with local duplicates in parentheses)

### models.ts (model identification ONLY, never anywhere else)
- MODELS_2026 (accounts, auth, config, fingerprint, models, plugin, project, quota, recovery, request, streaming) — canonical is the full union: bare gemini ids plus antigravity aliases, derived from the ModelDefinition catalog
- MODELS_2026_BASE (plugin, project), MODELS_2026_08_25 (constants, models), ALL_MODELS_2026 (constants, plugin), ANTIGRAVITY_MODELS_2026 (constants, models, quota), ANTIGRAVITY_MODELS (constants, models), ANTIGRAVITY_MODEL_IDS_2026 (constants, quota), GEMINI_CLI_ONLY_MODELS (constants, plugin, quota, request), DEFAULT_MODEL (constants, models)
- Model2026 (accounts, config, project, quota, request), ModelId2026 (fingerprint, plugin, recovery, request, streaming), ModelDefinition (constants, models), AntigravityModelDefinition (constants, quota), ThinkingLevel (constants, models, plugin, request)
- isGeminiCLIOnlyModel (constants, plugin, quota, request), isCLIOnly (core, models), isThinkingModel (constants, models), isImageModel (core, models), isImageGenModel (plugin, search), normalizeModelId (constants, models), mapModelToGroup (auth, plugin), endpointsForModel (core), getEndpointsForModel (plugin, request)
- THINKING_LEVELS (constants, models, plugin, request), THINKING_BUDGET_MAP (constants, models, plugin, request), THINKING_BUDGET_MAX_CLAUDE (constants, request), THINKING_BUDGET_MAX_GEMINI (constants, request), CONTEXT_WINDOW_CLAUDE (constants, models), OUTPUT_LIMIT_CLAUDE (constants, models), CONTEXT_WINDOW_GPT_OSS (constants, models), OUTPUT_LIMIT_GPT_OSS (constants, models)
- SEARCH_MODEL (constants, models, request), SEARCH_MODEL_PREVIEW (constants, request), SEARCH_MODEL_FALLBACKS (constants, search)
- buildImageGenConfig (plugin, search)
- ENDPOINT_ORDER (constants, plugin, project), ENDPOINT_ORDER_GEMINI_CLI (models, plugin, request), ENDPOINT_ORDER_ANTIGRAVITY (models, request), CODE_ASSIST_ENDPOINTS host map (constants, models, request) — models owns the per-family routing orders; the raw host map itself lives in constants.ts as ENDPOINTS and models derives routing from it

### project.ts (project discovery ONLY)
- loadCodeAssist (auth, models, plugin, project), onboardUser (auth, models, plugin, project), LoadCodeAssistOptions (models, project), OnboardUserOptions (models, project)
- getCachedProjectId (models, plugin, project), setCachedProjectId (models, plugin, project), clearProjectCache (models, project), clearProjectIdCache (plugin, project), resolveProjectId (auth, plugin, project), ResolveProjectIdOptions (plugin, project), ResolveResult (plugin, project), ProjectDiscoveryError (models, plugin, project)
- The whole project-resolution block currently inside models.ts (lines around 540 to end of resolveProjectId) relocates to project.ts; models.ts ends fully project-free

### constants.ts (raw cross-domain values ONLY)
- PROJECT_FALLBACK (auth, config, constants, models, request), FALLBACK_PROJECT_ID (constants, request)
- ENDPOINTS canonical host map {PROD, DAILY, SANDBOX, AUTOPUSH} (auth list variant, core map variant, request map variant merge here); the fingerprint.ts and quota.ts ENDPOINTS method-path maps rename to API_PATHS and move to request.ts
- CLOUDCODE_BASE_URL (accounts, config, fingerprint), CLOUDCODE_BASE (auth, quota), CLOUDCODE_DAILY_BASE (quota, request), CLOUDCODE_PA_BASE (request, streaming), CLOUDCODE_ENDPOINTS (accounts, auth, config)
- X_GOOG template parts; GEMINI_CLI_USER_AGENT canonical (project, quota, recovery, request, streaming — canonical is the live-validated request variant GeminiCLI/0.57.0/gemini-3-pro-preview (linux; x64; GitHub)); ANTIGRAVITY_USER_AGENT (auth, constants), ANTIGRAVITY_USER_AGENT_FALLBACK (constants, project, quota, search), ANTIGRAVITY_VERSION_FALLBACK (constants, models, request, search, version)
- CLIENT_METADATA (accounts, config, constants, project, request), CLIENT_METADATA_STRING (config, project, quota, request), CLIENT_METADATA_RAW (request, streaming), ANTIGRAVITY_CLIENT_METADATA_TEMPLATE (constants, quota)
- FNV_OFFSET_BASIS (constants, models, request), FNV_PRIME (constants, models, request), JITTER_MIN_MS (constants, quota, search, streaming), JITTER_MAX_MS (constants, quota, search, streaming), FETCH_TIMEOUT_MS (models, search, version), QUOTA_TIMEOUT_MS (constants, models, quota), RETRYABLE_STATUS_CODES (constants, streaming), QUOTA_CACHE_TTL_MAX_MS (constants, quota), QUOTA_HARD_THRESHOLD (constants, quota)
- FORBIDDEN_HEADERS (models, plugin, request) reconciled with HEADERS_TO_STRIP (constants, request): the five-entry base list stays FORBIDDEN_HEADERS in constants.ts; the six-entry strict variant that also strips x-goog-api-client becomes FORBIDDEN_HEADERS_STRICT in constants.ts; HEADERS_TO_STRIP keeps its three-entry interceptor semantic as its own constant when usage proves it distinct, otherwise it aliases the base list
- GEMINI_CLI_VERSION_POOL (constants, fingerprint), GL_NODE_VERSION_POOL (constants, fingerprint), PLATFORM_POOL (constants, fingerprint), ANTIGRAVITY_CLI_VERSION_POOL (auth, fingerprint)
- CONSTANTS namespace object (accounts, constants, quota) — stays in constants.ts and may only aggregate constants.ts locals

### core.ts (generic pure utilities ONLY)
- fnv1a32 (core, fingerprint, models, plugin, project, quota, recovery, request, search, streaming), fnv1a32Hex (plugin, request), fnv1a64 (fingerprint, request)
- getJitter (constants, plugin), jitter (core, fingerprint), getJitterMs (fingerprint, models), pickRandom (constants, fingerprint)
- fetchWithTimeout (models, plugin, project, quota, search, version) and the fetchTimeout variant in auth.ts merge into one core.ts export
- isRetryable (auth, plugin, project), isRetryableStatus (models, request, search, streaming)
- generateDeterministicId (plugin, request), generateUserPromptId (plugin, request), buildUserPromptId (recovery, request), generateSessionId (fingerprint, plugin, request), buildSessionIdFromDir (request, streaming)
- core.ts sheds: transformRequest, parseSSEChunk, normalizePayloads, transformToOpenAI, transformToAnthropic, withAutoRecovery, ua, apiClient, fingerprint fn, ENDPOINTS, endpointsForModel (all relocate to their domain owners)

### fingerprint.ts (identity masquerade ONLY)
- getDynamicUserAgent (constants, models, plugin, quota, version), buildGeminiUserAgent (auth, config), buildClientMetadata (constants, quota, request), getXGoogApiClient (constants), X_GOOG_API_CLIENT computed value (config, constants, project, recovery, request, streaming — canonical is the dynamic getXGoogApiClient result; the static gl-node/22.19.0 copies are stale)
- ua (auth, core), apiClient (auth, core), fingerprint fn (core)
- getGeminiCLIHeaders (constants, plugin), getAntigravityHeaders (constants, plugin), buildAntagravityHeaders (models, plugin, project, quota, search), getFingerprintHeaders (fingerprint, request)
- fingerprint.ts may import constants.js and core.js only

### debug.ts (logging ONLY)
- redactSecrets (config, debug), logsDir (config, system), debugLogger (config, system)

### auth.ts (authentication ONLY)
- CLIENT_ID (auth, plugin), CLIENT_SECRET (auth, plugin), OAUTH_CLIENT_ID (config, fingerprint, project, quota), OAUTH_CLIENT_SECRET (config, fingerprint, project, quota), GEMINI_CLI_CLIENT_ID (plugin, quota, request), GEMINI_CLI_CLIENT_SECRET (plugin, quota, request), GEMINI_CLI_OAUTH_CLIENT_ID (constants, accounts, request), GEMINI_CLI_OAUTH_CLIENT_SECRET (constants, accounts, request), ANTIGRAVITY_CLIENT_ID (constants, quota), ANTIGRAVITY_CLIENT_SECRET (constants, quota)
- OAUTH_SCOPES (accounts, config, constants, fingerprint, quota), ANTIGRAVITY_CLI_OAUTH_SCOPES (antigravity-cli shim source, auth), OAUTH_TOKEN_URL (accounts, auth, constants), OAUTH_USERINFO_URL (accounts, constants)
- resolveOAuthIdentity (antigravity-cli shim source, auth), identityFromAccountType (antigravity-cli shim source, auth), getAntigravityCliHeaders (antigravity-cli shim source, auth)
- The three distinct oauth client identities stay distinct constants (antigravity-cli real client, gemini-cli real client, antigravity IDE blinded decoy); value-level dedupe only where values are truly identical

### accounts.ts (account store and rotation ONLY)
- Account (accounts, plugin, project — plugin and project consume via import type), RotationStrategy (accounts, config), resolveAccountsPath (accounts, cli)

### config.ts (configuration management ONLY)
- cfgDir (auth, config), atomicWrite (auth, config), resolveConfigDir (accounts, config, quota), resolveConfigPath (cli, config), isValidSemver (config, version), validateSemver and every validator (config, system), loadConfigRaw (config, system), saveConfigRaw (config, system)

### version.ts (version detection ONLY)
- VERSION_FALLBACK (config, system), fetchVersionChain (config, system), ANTIGRAVITY_VERSION_MIN_SUPPORTED (constants, version), ANTIGRAVITY_BLOCKED_VERSIONS (constants, version)

### request.ts (request building ONLY)
- transformRequest (core, plugin, request), buildAntigravityRequest (plugin, request), buildGeminiCLIRequest (plugin, request), fetchWithCascade (plugin, request), BuildOptions (plugin, request), BuildResult (plugin, request)
- STREAM_METHOD (plugin, request), GENERATE_METHOD (plugin, request), TOOL_NAME_REGEX (plugin, request), sanitizeToolName (core, request), normalizeRole (core, request), stripForbiddenHeaders (models, plugin, request)
- API method-path maps (the ENDPOINTS method shapes in fingerprint.ts and quota.ts rename to API_PATHS and live here)

### streaming.ts (response streaming ONLY)
- parseSSEChunk (core, streaming), normalizePayloads (core, streaming), transformToOpenAI (core, streaming), transformToAnthropic (core, streaming)

### recovery.ts (recovery ONLY)
- toast (plugin, recovery), detectErrorType (plugin, recovery), sessionRecovery (plugin, recovery), preserveThinkingSignature (plugin, recovery), ThinkingSignatureEntry (recovery, streaming), ThinkingSignatureCache (recovery, streaming), withAutoRecovery (core, recovery)

### quota.ts (quota ONLY)
- QUOTA_METHOD (plugin, quota), QuotaConfig (config, quota), QuotaGroupDef (constants, quota), quota constants per rule 5 (a quota constant used only at or above quota.ts may live in quota.ts; one needed lower moves to constants.ts)

### search.ts (search grounding ONLY)
- search grounding logic only; isImageGenModel, buildImageGenConfig, SEARCH_MODEL* families import from models.ts

### plugin.ts, cli.ts, index.ts
- entry orchestration only; zero local duplicate implementations; every duplicated family they carry today is deleted and imported from the owner

## Execution order (sequential phases, scoped validation after each)

- Phase A: models.ts + project.ts (model and project domains)
- Phase B: constants.ts + core.ts + fingerprint.ts + debug.ts (values, utilities, identity, logging)
- Phase C: auth.ts + accounts.ts + config.ts + version.ts (authentication, accounts, configuration, version)
- Phase D: request.ts + streaming.ts + recovery.ts + quota.ts + search.ts (request, streaming, recovery, quota, search)
- Phase E: plugin.ts + cli.ts + index.ts + package.json + version envelope 2.1.15 + docs + full validation + end-to-end + ship

Each phase ends compilable: tsc --noEmit clean, affected tests green, scoped
bun build of the touched entry points clean.
