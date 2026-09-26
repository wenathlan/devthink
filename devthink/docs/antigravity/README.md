# maene

> Production-ready OpenCode plugin for Google Antigravity + Gemini CLI dual-quota bypass — zero external dependencies, full OAuth PKCE, multi-account rotation.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20%20%7C%2022%20LTS-green)](https://nodejs.org)
[![Version](https://img.shields.io/badge/version-2.1.15-blue)]()
[![Models 2026](https://img.shields.io/badge/models-11%20%7C%202026-purple)]()

```
Folder: repo root, flat, lowercase single-word files (see the v2.1.15 layer DAG in the main README).
Runtime: node:* builtins + global fetch only.
Auth: OAuth 2.0 PKCE with random port on 127.0.0.1
```

**[English](#english) | [Português](#português-br)**

---

## English

### Table of Contents
- [Why this plugin](#why-this-plugin)
- [How the bypass secret works](#how-the-bypass-secret-works)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [OAuth PKCE Flow - Random Port 127.0.0.1](#oauth-pkce-flow---random-port-127001)
- [Multi-Account](#multi-account)
- [Dual Quota - Antigravity + Gemini CLI](#dual-quota---antigravity--gemini-cli)
- [Models 2026](#models-2026)
- [Usage - opencode auth login & opencode run](#usage---opencode-auth-login--opencode-run)
- [MCP Servers Integration](#mcp-servers-integration)
- [Architecture / File Map](#architecture--file-map)
- [Comparison vs Competitors](#comparison-vs-competitors)
- [Troubleshooting](#troubleshooting)
- [ToS Warning](#tos-warning)
- [License](#license)

### Why this plugin

Google Cloud Code Assist (Antigravity) requires a Cloud Project ID and enforces strict project checks. Gemini CLI uses a different identification path (`IDE_UNSPECIFIED`) that bypasses the project requirement when the request looks exactly like the official CLI.

This plugin implements **100% spoof of Gemini CLI identification** to:

1. Use `rising-fact-p41fc` as public seed project without billing
2. Auto-discover real project via `loadCodeAssist` + fallback chain `v1internal -> daily-v1internal -> v1`
3. Rotate accounts on `429 / 403`, providing dual quota (Antigravity models + Gemini CLI models)
4. Keep fingerprints stable per workspace via deterministic FNV-1a `session_id`

### How the bypass secret works

The core secret is **using the exact same JSON and headers that Gemini CLI sends when it logs in**. Extracted from the official binary:

```ts
// OAuth - public client extracted from Gemini CLI binary
CLIENT_ID: 681255809395-oo8f…b135j.apps.googleusercontent.com
CLIENT_SECRET: GOCSPX-4uHgMPm…lXFsxl
SCOPES: cloud-platform, userinfo.email, userinfo.profile

// Identification headers - THE BYPASS
User-Agent: GeminiCLI/0.35.3/gemini-3-pro-preview (linux; x64; GitHub) google-api-nodejs-client/9.15.1
X-Goog-Api-Client: gl-node/22.19.0 gccl/0.9.2 gl-node/22.19.0
Client-Metadata: ideType=IDE_UNSPECIFIED,platform=PLATFORM_UNSPECIFIED,pluginType=GEMINI
// CRITICAL: no X-Goog-User-Project for Gemini CLI-only models
// Content-Type: application/json

// Project fallback
FALLBACK_PROJECT_ID: rising-fact-p41fc

// Endpoints
CODE_ASSIST_BASE: https://cloudcode-pa.googleapis.com
DAILY_BASE: https://daily-cloudcode-pa.googleapis.com
Endpoints: /v1internal:loadCodeAssist, /v1internal:onboardUser,
           /v1internal:fetchAvailableModels, /v1internal:streamGenerateContent
```

**Implementation in `fingerprint.ts` / `request.ts`:**

- `FINGERPRINT_POOLS` randomizes `cliVersions` (`0.35.3` default), `gapiVersions` `9.15.1`, `gl-node` `22.19.0`, `platforms` weighted (`linux x64` 35%, `darwin arm64` 40%, `win32 x64` 25%)
- `PlatformProfile` coherence check: `win32` never `arm64`, `darwin` prefers `arm64`
- `session_id` = `FNV-1a(cwd)` deterministic, 20 chars, `sess_<hex>...`
- `user_prompt_id` = `FNV-1a(content) + timestamp36`, used for backend deduplication
- Anti-ban jitter: 0-80ms per request (`tool.execute.before`) + 80-350ms between quota checks
- For `gemini-*` (non-antigravity) models: delete `X-Goog-User-Project` and `X-Antigravity-Version` headers, force prod endpoint (fix 404/403 cascade #233 from NoeFabris changelog)

**Request body that bypasses project check:**

```json
{
  "cloudaicompanionProject": "rising-fact-p41fc",
  "metadata": {
    "ideType": "IDE_UNSPECIFIED",
    "platform": "PLATFORM_UNSPECIFIED",
    "pluginType": "GEMINI"
  },
  "session_id": "sess_a1b2c3d4e5f6..."
}
```

Cloud Code treats `IDE_UNSPECIFIED + PLATFORM_UNSPECIFIED + PLUGIN GEMINI` + same OAuth client as Gemini CLI first-party → skips billing project validation.

### Installation

#### 1. Plugin installation (recommended - isolated folder)

```bash
# Clone into isolated short path
mkdir -p /mnt/data/auth
git clone https://github.com/your-org/maene /mnt/data/auth

# Or via opencode plugin registry
opencode plugin install maene
```

#### 2. Dependencies

Zero external. Requires Node >=20 (fetch global).

```json
// opencode.json
{
  "plugin": ["./auth/plugin.ts"],
  "auth": {
    "provider": "antigravity",
    "configFile": "~/.config/opencode/antigravity.json"
  }
}
```

#### 3. Environment

```bash
export OPENCODE_CONFIG_DIR="$HOME/.config/opencode" # default
# auth files resolved via FILE_PATHS:
# ~/.config/opencode/auth/gemini-cli-tokens.json
# ~/.config/opencode/auth/antigravity-credentials.json
# ~/.config/opencode/antigravity-accounts.json
# ~/.config/opencode/cache/antigravity/quota.json
```

### Quick Start

```bash
# 1. login first account (opens browser)
opencode auth login --provider antigravity

# 2. verify
opencode auth status
# > account: you@gmail.com | project: rising-fact-p41fc (discovered: your-project-123) | models: 11

# 3. run with model
opencode run --model antigravity-gemini-3-pro "explain bypass"

# 4. switch quota strategy
echo '{ "cli_first": true }' > ~/.config/opencode/antigravity.json
```

### OAuth PKCE Flow - Random Port 127.0.0.1

Implemented in `auth.ts` (production-ready, ESM/CJS compatible — the full OAuth 2.0 PKCE flow lives there since the v2.1.14 consolidation). No `open` package.

```ts
// Flow defined in auth.ts
1. generatePKCE(): verifier 64 chars crypto.randomBytes -> base64url, challenge = BASE64URL(SHA256(verifier)), method S256
2. createOAuthServerAsync(): http.createServer() listening on 127.0.0.1:0 (random free port)
   - host is HARDCODED 127.0.0.1, never 0.0.0.0 (security)
   - callback path /oauth-callback by default
   - resolves Promise with ?code= from query
3. buildAuthUrl(): https://accounts.google.com/o/oauth2/v2/auth?client_id=681255809395...&scope=cloud-platform...&code_challenge=...
   params: access_type=offline, prompt=consent, response_type=code
4. openBrowser(): platform detection (xdg-open / open / cmd start), respects WSL via wslview
   if isSSH() or !hasDisplay() or --no-browser, skips auto-open and prints URL
5. waitForCode() with 30s timeout -> fallback askManualInput() readline: paste URL with code=
6. exchangeCodeForTokens(): POST https://oauth2.googleapis.com/token with client_secret
7. getUserInfo(): https://www.googleapis.com/oauth2/v2/userinfo Bearer
```

**Handling edge cases:**
- Port 0 => OS assigns random free port, read via `server.address().port`
- WSL: tries `wslview` or `cmd.exe /c start`
- SSH / headless: detects `SSH_CONNECTION`, missing `DISPLAY/WAYLAND_DISPLAY`, prints manual URL in cyan + underline ANSI
- Manual paste parser `extractCodeFromUrl()` handles full URL, bare code, or `?code=` regex
- Token file stores `expires_at` computed locally for `isTokenExpired()` 60s skew

```bash
# Usage
opencode auth login --no-browser  # prints URL for remote servers
# Then paste redirect URL: http://127.0.0.1:54321/oauth-callback?code=4/0A...
```

### Multi-Account

`accounts.ts` + `plugin.ts:loadAccounts()` implements rotation.

**Storage format** `~/.config/opencode/antigravity-accounts.json`:

```json
{
  "accounts": [
    {
      "email": "account1@gmail.com",
      "refreshToken": "1//0g...",
      "accessToken": "ya29...",
      "expiryDate": 1714130000000,
      "projectId": "rising-fact-p41fc",
      "cloudaicompanionProject": "my-real-project",
      "enabled": true,
      "createdAt": 1714000000000,
      "failureCount": 0
    },
    {
      "email": "account2@gmail.com",
      "refreshToken": "1//0g...",
      "enabled": true
    }
  ]
}
```

**Rotation logic:**

```ts
// plugin.ts hooks.fetch
for (const acc of ordered) { // ordered = cli_first ? reversed : default
  refreshTokenIfNeeded()
  projectId = acc.projectId || await loadCodeAssist(token) // with fallback rising-fact-p41fc chain
  headers = getGeminiCLIHeaders(model)
  res = await fetch(url, { headers })
  if (res.status === 429 || res.status === 403) continue // next account
  return res
}
```

- Add accounts: `opencode auth login --add` (appends, does not overwrite)
- Disable: set `enabled:false` or `disabledUntil: timestamp` on 403 burst
- Quota soft-protection 90%: skip account if `quota.json` shows >90% daily used (see `quota.ts`)
- `getSessionId()` deterministic per folder keeps fingerprint stable across restarts

### Dual Quota - Antigravity + Gemini CLI

Two distinct backend pools share same OAuth but different limits.

Configured via `~/.config/opencode/antigravity.json`:

```json
{
  "cli_first": false,          // false = antigravity-first (default), true = gemini-cli-first
  "quotaProtectionPercent": 90,
  "versionFallbackChain": ["v1internal", "daily-v1internal", "v1"]
}
```

**Quota groups - `constants.ts:QUOTA_GROUPS`:**

| Group | Models | Daily | RPM | TPM |
|-------|--------|-------|-----|-----|
| `gemini-3-pro` | antigravity-gemini-3-pro, gemini-3-pro-preview | 1000 | 60 | 1M |
| `gemini-3.1-pro` | antigravity-gemini-3.1-pro, 3.1-pro-preview, customtools | 500 | 30 | 2M |
| `gemini-3-flash` | antigravity-gemini-3-flash, flash-preview | 2000 | 120 | 1M |
| `gemini-2.5-pro` | gemini-2.5-pro | 1500 | 60 | 1M |
| `gemini-2.5-flash` | gemini-2.5-flash | 3000 | 240 | 1M |
| `claude-sonnet` | antigravity-claude-sonnet-4-6 | 500 | 30 | 200K |
| `claude-opus` | antigravity-claude-opus-4-6-thinking | 250 | 15 | 200K |

- Storage: `~/.config/opencode/cache/antigravity/quota.json` cached with TTL 60s
- Endpoint: `v1internal:retrieveUserQuotaSummary` per account
- Strategy `antigravity-first` uses Claude + Gemini 3 pro first; `cli_first` uses gemini-cli models first to preserve Antigravity quota for Claude.

### Models 2026

11 canonical models - `ALL_MODELS_2026` / `MODELS_2026`:

```ts
// Antigravity-wrapped (use Client-Metadata GEMINI but routed via Antigravity)
"antigravity-gemini-3-pro"            // 1M context, 65K output, api: antigravity
"antigravity-gemini-3.1-pro"          // 1M, 65K
"antigravity-gemini-3-flash"          // 1M, 65K
"antigravity-claude-sonnet-4-6"      // 200K, 64K - Claude 4.6 Sonnet via Antigravity proxy
"antigravity-claude-opus-4-6-thinking"// 200K, 64K - Opus thinking

// Gemini CLI native (no X-Goog-User-Project, prod endpoint only)
"gemini-2.5-flash"                    // 1M, 65K
"gemini-2.5-pro"                      // 1M, 65K
"gemini-3-flash-preview"              // 1M, 65K
"gemini-3-pro-preview"                // 1M, 65K default
"gemini-3.1-pro-preview"              // 1M, 65K
"gemini-3.1-pro-preview-customtools"  // 1M, 65K - with custom tool support
```

**Thinking mapping** (`request.ts:THINKING_BUDGET_MAP`):

```ts
low: 8192, medium: 16384, high: 32768, minimal: 1024, none: 0
model.includes("3-pro-preview") => default thinking high
```

### Usage - opencode auth login & opencode run

```bash
# ---- AUTH ----

# Interactive login (PKCE random port 127.0.0.1)
opencode auth login
# Output:
# 🔐 Para autenticar, abra esta URL no navegador:
# https://accounts.google.com/o/oauth2/v2/auth?client_id=681255809395...&code_challenge=...

# Headless / SSH
opencode auth login --no-browser
# Paste manually the callback URL

# Add second account
opencode auth login --add
# or
opencode auth login --email second@gmail.com

# List
opencode auth list
# > 1. you@gmail.com - enabled - project: rising-fact-p41fc
# > 2. second@gmail.com - enabled - quota 40% used

# Status + quota
opencode auth status --quota

# Logout
opencode auth logout --email you@gmail.com
opencode auth logout --all

# ---- RUN ----

# Basic
opencode run "Explain quantum computing"

# Specify model + thinking
opencode run --model gemini-3-pro-preview --thinking high "Build a REST API"

# Antigravity Claude
opencode run --model antigravity-claude-sonnet-4-6 "Refactor this file"

# CustomTools (better tool calling 2026)
opencode run --model gemini-3.1-pro-preview-customtools --tools enabled "Use tools"

# With file context
opencode run --model antigravity-gemini-3-pro --file ./src/index.ts "Review"

# Override project (rarely needed, fallback auto)
opencode run --project rising-fact-p41fc --model antigravity-gemini-3-flash "test"

# Debug fingerprint
OPENCODE_DEBUG=antigravity opencode run --model gemini-3-pro-preview "test"
# prints: User-Agent: GeminiCLI/0.35.3/... X-Goog-Api-Client: gl-node/...
```

**Programmatic API** (`plugin.ts` exports):

```ts
import plugin, { getGeminiCLIHeaders, loadAccounts, refreshToken } from "./auth/plugin.js"
import { generateHeaders, buildLoadCodeAssistRequest } from "./auth/fingerprint.js"
import { buildAntigravityRequest, buildGeminiCLIRequest } from "./auth/request.js"

const headers = generateHeaders("antigravity-gemini-3-pro", "gemini-cli")
const req = buildLoadCodeAssistRequest("rising-fact-p41fc", "gemini-3-pro-preview")
```

### MCP Servers Integration

Compatible with any MCP server that can use OpenCode as backend. Antigravity provides code-assist tool calling compatible with functionCallingConfig AUTO.

```jsonc
// mcp.json - example with opencode as provider
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/workspace"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_TOKEN": "..." }
    }
  },
  // opencode models available as tools
  "models": {
    "antigravity-claude": "antigravity-claude-sonnet-4-6",
    "gemini-3-pro": "antigravity-gemini-3-pro"
  }
}
```

**Usage in MCP-enabled clients:**

```bash
# OpenCode with MCP
opencode run --mcp ./mcp.json --model antigravity-claude-sonnet-4-6 "Refactor filesystem using MCP filesystem server"

# Streaming SSE for MCP tool loops
opencode run --model gemini-3.1-pro-preview-customtools --stream --mcp ./mcp.json

# Example tool schema cleanup (handled in request.ts)
# cleanToolSchema() strips: $schema, additionalProperties illegal, unknown 'name' parameters
# validateToolNames(): sanitizes /^[a-zA-Z0-9_]+$/, max 64 chars
```

For MCP servers that call `generateContent` directly, use `request.ts` (v2.1.15: THE request-building owner — the former `request-helpers.ts` utilities were consolidated into it):

```ts
import { transformRequest } from "./request.js"
// OpenCode messages[] -> Gemini contents[] with role mapping assistant->model
```

### Architecture / File Map

v2.1.15 layer DAG — one owner file per logic family (see the main README for the full table):

```
repo root (short lowercase single-word files)
├── constants.ts        # L0 raw shared values: client ids, ENDPOINTS host map, user agents, timeouts, version pools
├── core.ts             # L1 generic pure utilities: fnv hashes, jitter, fetchWithTimeout, retry classifiers, id generators
├── models.ts           # L1 ALL model identification: catalogs, classifiers, thinking tables, endpoint routing orders
├── debug.ts            # L1 logging and redaction
├── fingerprint.ts      # L2 identity masquerade: getDynamicUserAgent, getXGoogApiClient, buildClientMetadata, header builders
├── version.ts          # L2 version detection (dynamic resolver chains)
├── config.ts           # L2 configuration management, validators, config file IO
├── auth.ts             # L2 ALL authentication: OAuth clients, PKCE, callback server, token exchange/refresh, userinfo
├── accounts.ts         # L3 account store and rotation
├── project.ts          # L3 project discovery: loadCodeAssist, onboardUser, projectId cache
├── request.ts          # L4 request building: transformRequest, dual builders, fetchWithCascade, tool sanitizers, API_PATHS
├── streaming.ts        # L4 response streaming: SSE parser, OpenAI/Anthropic transformers
├── recovery.ts         # L4 recovery: toast, error types, signature preservation
├── quota.ts            # L4 quota: dual-source manager, adaptive TTL cache
├── search.ts           # L4 search grounding
├── plugin.ts           # L5 opencode plugin entry, orchestration only
├── cli.ts / server.ts / index.ts  # L5 entries and barrel
├── system.ts / antigravity-cli.ts # published-subpath re-export shims
└── README.md           # this file
```

**Zero dependencies principle:** Only `node:os`, `node:path`, `node:crypto`, `node:http`, `node:fs`, global `fetch`. No `open`, `googleapis`, `axios`.

### Comparison vs Competitors

| Feature | **maene (this)** | 9router / n9router | omniroute |
|---------|--------------------------------------|---------------------|-----------|
| **Folder** | `/mnt/data/auth` blinded short lowercase | scattered `~/.cache` + remote | central server dependency |
| **Bypass method** | Gemini CLI official client_id `681255...` + `Client-Metadata IDE_UNSPECIFIED` | custom proxy client_id | cloud gateway client_id rotation |
| **Headers spoof** | Full `User-Agent GeminiCLI/0.35.3` + `X-Goog-Api-Client gl-node/22.19.0` + `google-api-nodejs-client/9.15.1` | partial UA | generic `antigravity/1.x` |
| **OAuth** | PKCE S256 random port `127.0.0.1:0` + 30s timeout + manual fallback | PKCE fixed port 8080 | OAuth device code |
| **Project handling** | `rising-fact-p41fc` seed + `loadCodeAssist` discovery + `daily` canary fallback | hardcoded project | server-assigned project |
| **Deps** | zero external | `axios`, `open`, `keytar` | `express`, `ws` |
| **Multi-account** | local `antigravity-accounts.json` rotation on 429/403, 90% soft limit | single token | cloud account |
| **Dual quota** | Antigravity (Claude + Gemini) + Gemini CLI (2.5/3 preview) | Gemini only | Antigravity only |
| **Models 2026** | 11: `antigravity-gemini-3-pro`, `3.1-pro`, `3-flash`, `claude-sonnet-4-6`, `claude-opus-4-6-thinking`, `gemini-2.5-*`, `3-preview`, `customtools` | 6 legacy | 5 |
| **Session stability** | FNV-1a deterministic per directory | random UUID | server session |
| **Anti-ban** | platform coherence (win32 x64 only), weighted random, jitter 0-80ms + 80-350ms, gl-node pool `22.19.0/20.19.3` | no coherence | fixed UA |
| **MCP support** | Native tool schema cleaning `Unknown name parameters` fix | no cleaning | partial |
| **Troubleshooting** | explicit guides for `403 rising-fact-p41fc`, `400 Unknown name` | generic retry | cloud logs |
| **Open** | MIT local transparent | obfuscated proxy | proprietary cloud |
| **Privacy** | tokens stay `~/.config/opencode/auth/`, no third-party call except googleapis | routes via 9router infra | routes via omniroute infra |

**Why this > 9router/n9router/omniroute:**
- No man-in-the-middle — direct to `cloudcode-pa.googleapis.com`
- Real Gemini CLI fingerprint — less detection risk
- `/mnt/data/auth` isolated path avoids conflicts with other plugins
- Full PKCE with random port works on SSH/WSL/CI

### Troubleshooting

#### 403 Forbidden on `rising-fact-p41fc`

Root cause: Project `rising-fact-p41fc` is a public seed without billing; Google sometimes blocks it temporarily if telemetry mismatches.

**Fix implemented in `project.ts` + `plugin.ts`:**

```ts
// 1. Remove X-Goog-User-Project for CLI models
delete headers["X-Goog-User-Project"]

// 2. Use fallback chain
VERSION_FALLBACK_CHAIN: ["v1internal", "daily-v1internal", "v1"]

// 3. Try daily endpoint canary
base = DAILY_CODE_ASSIST_BASE // https://daily-cloudcode-pa.googleapis.com

// 4. If still 403, force loadCodeAssist to discover real user project
projectId = await loadCodeAssist(token) // returns cloudaicompanionProject

// 5. Retry with discovered project + jitter
```

**Manual actions:**
```bash
# Clear quota cache
rm ~/.config/opencode/cache/antigravity/quota.json

# Force re-onboard
opencode auth logout && opencode auth login

# Check if project is onboarded
curl -H "Authorization: Bearer ya29..." \
  -H "User-Agent: GeminiCLI/0.35.3/..." \
  -H "Client-Metadata: ideType=IDE_UNSPECIFIED,platform=PLATFORM_UNSPECIFIED,pluginType=GEMINI" \
  https://cloudcode-pa.googleapis.com/v1internal:loadCodeAssist -d '{}'

# If returns 403 with billing error, create dummy project:
# https://console.cloud.google.com -> New Project -> no billing needed for Code Assist
# Then re-login, plugin will discover it automatically.
```

#### 400 Bad Request `Unknown name "parameters": Cannot find field`

Root cause: Gemini API expects `functionDeclarations[].parameters` without JSON Schema `$schema` or incompatible `additionalProperties` / `name` field that Claude uses. Antigravity proxy strictly validates against Google's internal schema (not OpenAPI).

**Fix implemented in `request.ts`: `cleanToolSchema()` + `transformTools()`:**

```ts
// Before (OpenCode / Claude style) - BREAKS:
{
  name: "read_file",
  parameters: {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
      name: { type: "string" } // 'name' collides with top-level field in Gemini
    },
    additionalProperties: false
  }
}

// After (cleaned):
{
  name: "read_file",
  parameters: {
    type: "object",
    properties: {
      file_path: { type: "string", description: "Path" }
    },
    required: ["file_path"]
  }
}
```

Cleaning steps:

1. Strip `"$schema"`, `" $id"`, `"additionalProperties"` if boolean, `"$ref"`
2. Sanitize `tool.name`: `sanitizeToolName(name)` => `/[^a-zA-Z0-9_]/ -> "_"`, truncate 64, must match `^[a-zA-Z_][a-zA-Z0-9_]*$`
3. Rename property `name` to `file_name` / `tool_name` if collision detected
4. Ensure `type:"object"` always present for parameters
5. Filter empty `required` arrays
6. `validateToolNames()` throws on duplicates after sanitization

If you still see the error:

```bash
# Enable debug to see cleaned schema
OPENCODE_DEBUG=tools opencode run --model gemini-3.1-pro-preview-customtools "..."

# Force customtools model which has more lenient tool validation
opencode run --model gemini-3.1-pro-preview-customtools

# Or temporarily disable tools
opencode run --model antigravity-gemini-3-flash --tools disabled
```

#### Other issues

- **Port already in use**: PKCE uses `:0` random, but if `127.0.0.1` restricted, set `OAUTH_CALLBACK_PORT=8080` env or use `--no-browser` + manual paste
- **Timeout after 30s**: Check firewall, use manual URL paste. Server prints: `Cole abaixo a URL completa...`
- **WSL browser not opening**: Install `wslu` (`sudo apt install wslu`) for `wslview`, or use `--no-browser`
- **Token refresh failed `400 invalid_grant`**: refresh_token revoked, re-login. File `antigravity-accounts.json` auto marks `disabledUntil`
- **`quota.json` stale**: Delete cache, plugin re-fetches `retrieveUserQuotaSummary`

### ToS Warning

> **Disclaimer**: This plugin uses Google OAuth credentials `681255809395-oo8f…b135j.apps.googleusercontent.com` (`GOCSPX-4uHgMPm…lXFsxl`) extracted from the official Gemini CLI binary. These are **public client credentials** intended for `Google Cloud SDK` / `Gemini CLI` first-party usage — not a private secret, but their use outside Gemini CLI may violate Google's Terms of Service for Cloud Code Assist / Antigravity.

- Uses same identification JSON (`Client-Metadata: IDE_UNSPECIFIED`) — Google may detect and block non-Gemini-CLI usage.
- Project `rising-fact-p41fc` is a public demo project, not owned by plugin authors.
- No warranty. Use at your own risk. For educational / interoperability purposes. Consider creating your own GCP project and enabling Cloud Code Assist API for compliant usage.
- Tokens are stored locally, never sent to third-party servers except `*.googleapis.com`.
- This project is not affiliated, endorsed, or sponsored by Google, Anthropic, or OpenCode.
- If Google changes `v1internal` undocumented API, plugin may break — fallback chain `daily-v1internal` exists but not guaranteed.

By using `opencode auth login`, you agree you have read Google's [Terms](https://cloud.google.com/terms) and Antigravity's internal policies.

### License

MIT — see `LICENSE`. Copyright (c) 2026 maene contributors.

---

## Português BR

### Índice
- [Por que este plugin](#por-que-este-plugin)
- [Como o segredo do bypass funciona](#como-o-segredo-do-bypass-funciona)
- [Instalação](#instalação-pt)
- [Início Rápido](#início-rápido)
- [OAuth PKCE - Porta Aleatória 127.0.0.1](#oauth-pkce---porta-aleatória-127001)
- [Multi-Conta](#multi-conta)
- [Dual Quota - Antigravity + Gemini CLI](#dual-quota---antigravity--gemini-cli-pt)
- [Modelos 2026](#modelos-2026-pt)
- [Uso - opencode auth login e opencode run](#uso---opencode-auth-login-e-opencode-run)
- [Servidores MCP](#servidores-mcp)
- [Arquitetura / Mapa de Arquivos](#arquitetura--mapa-de-arquivos)
- [Comparação com Concorrentes](#comparação-com-concorrentes)
- [Solução de Problemas](#solução-de-problemas)
- [Aviso ToS](#aviso-tos)
- [Licença](#licença)

### Por que este plugin

Google Cloud Code Assist (Antigravity) exige Project ID do GCP e valida billing. Gemini CLI usa trilha diferente (`IDE_UNSPECIFIED`) que ignora exigência de projeto quando a requisição é idêntica ao CLI oficial.

Este plugin implementa spoof 100% da identificação do Gemini CLI para:

1. Usar `rising-fact-p41fc` como projeto semente público sem billing
2. Auto-descobrir projeto real via `loadCodeAssist` + chain `v1internal -> daily-v1internal -> v1`
3. Rotacionar contas em `429/403`, entregando quota dupla (modelos Antigravity + Gemini CLI)
4. Manter fingerprint estável por workspace via `session_id` determinístico FNV-1a

### Como o segredo do bypass funciona

O segredo central é **usar exatamente o mesmo JSON e headers que Gemini CLI envia quando loga**. Extraído do binário oficial:

```ts
CLIENT_ID: 681255809395-oo8f…b135j.apps.googleusercontent.com
CLIENT_SECRET: GOCSPX-4uHgMPm…lXFsxl
SCOPES: cloud-platform, userinfo.email, userinfo.profile

// Headers - O BYPASS
User-Agent: GeminiCLI/0.35.3/gemini-3-pro-preview (linux; x64; GitHub) google-api-nodejs-client/9.15.1
X-Goog-Api-Client: gl-node/22.19.0 gccl/0.9.2 gl-node/22.19.0
Client-Metadata: ideType=IDE_UNSPECIFIED,platform=PLATFORM_UNSPECIFIED,pluginType=GEMINI
// CRÍTICO: sem X-Goog-User-Project para modelos Gemini CLI puros

Projeto fallback: rising-fact-p41fc
Endpoints: cloudcode-pa.googleapis.com + daily-cloudcode-pa.googleapis.com
```

**Implementado em `fingerprint.ts`:**

- `FINGERPRINT_POOLS` randomiza versões vistas em telemetry pública GitHub: `cliVersions` `0.35.3` default, `gapi` `9.15.1`, `gl-node` `22.19.0` (pool inclui `20.19.3`, `18.20.4` para jitter anti-ban)
- Coerência de plataforma: `win32` só `x64`, `darwin` prefere `arm64`, peso 35/40/25% para parecer orgânico
- `session_id` = `FNV-1a(cwd)` determinístico, mesmo diretório sempre mesmo ID — essencial para backend não flagar múltiplas sessões
- Jitter anti-rate-limit 0-80ms (`tool.execute.before`) + 80-350ms entre checagens de quota
- Para `gemini-*` sem `antigravity` prefix: remove `X-Goog-User-Project` e `X-Antigravity-Version`, força endpoint prod (fix cascata 404/403 #233 descoberto por NoeFabris)

Body que contorna validação de projeto:

```json
{
  "cloudaicompanionProject": "rising-fact-p41fc",
  "metadata": {
    "ideType": "IDE_UNSPECIFIED",
    "platform": "PLATFORM_UNSPECIFIED",
    "pluginType": "GEMINI"
  },
  "session_id": "sess_a1b2c3..."
}
```

Cloud Code trata `IDE_UNSPECIFIED + PLATFORM_UNSPECIFIED + GEMINI` + mesmo client OAuth como first-party Gemini CLI → pula validação de billing.

### Instalação PT

#### 1. Instalação da pasta isolada

```bash
mkdir -p /mnt/data/auth
git clone https://github.com/sua-org/maene /mnt/data/auth

# Ou via registry opencode
opencode plugin install maene
```

#### 2. Dependências

Zero externas. Node >=20 (fetch global).

```json
// opencode.json
{
  "plugin": ["./auth/plugin.ts"],
  "auth": { "provider": "antigravity" }
}
```

#### 3. Ambiente

```bash
export OPENCODE_CONFIG_DIR="$HOME/.config/opencode" # padrão
# Arquivos:
# ~/.config/opencode/auth/gemini-cli-tokens.json
# ~/.config/opencode/auth/antigravity-credentials.json
# ~/.config/opencode/antigravity-accounts.json -> multi-conta
# ~/.config/opencode/cache/antigravity/quota.json
```

### Início Rápido

```bash
# 1. login primeira conta (abre navegador)
opencode auth login --provider antigravity

# 2. verifica
opencode auth status

# 3. roda com modelo
opencode run --model antigravity-gemini-3-pro "explique o bypass"

# 4. alterna estratégia de quota
echo '{ "cli_first": true }' > ~/.config/opencode/antigravity.json
```

### OAuth PKCE - Porta Aleatória 127.0.0.1

Implementado em `oauth.ts` produção-ready, apenas `node:*` + fetch.

```
1. generatePKCE(): verifier 43-128 chars base64url (crypto.randomBytes 32) -> challenge = BASE64URL(SHA256(verifier)), method S256
2. createOAuthServerAsync(): http.createServer() bind 127.0.0.1:0 (porta aleatória livre)
   host HARDCODED 127.0.0.1 nunca 0.0.0.0 (segurança WSL/SSH)
   callback default /oauth-callback
   retorna { server, callbackUrl: http://127.0.0.1:PORT/oauth-callback, port, waitForCode(), close() }
3. buildAuthUrl(): https://accounts.google.com/o/oauth2/v2/auth?...code_challenge=...&client_id=681255809395...
   params obrigatórios: access_type=offline, prompt=consent, response_type=code, scope=cloud-platform...
4. openBrowser(): detecta plataforma:
   - darwin: open
   - win32: cmd /c start
   - linux: xdg-open, tenta wslview se isWSL()
   - respeita isSSH() e hasDisplay() (DISPLAY/WAYLAND_DISPLAY) - se SSH ou sem display, pula e imprime URL
5. waitForCode() com timeout 30s -> fallback askManualInput() readline: "🔑 Código/URL de callback: " - parse via extractCodeFromUrl() aceita URL completa ou código puro
6. exchangeCodeForTokens(): POST oauth2.googleapis.com/token com client_secret GOCSPX-...
7. getUserInfo(): GET /oauth2/v3/userinfo Bearer
```

Tratamento de edge cases:
- Porta 0 => OS escolhe porta livre, lida via `server.address().port` polling 20ms até bind
- WSL: tenta `wslview` ou `powershell.exe` fallback
- SSH/headless: detecta `SSH_CONNECTION`, ausente display, imprime URL ciano sublinhado ANSI
- Parser manual `extractCodeFromUrl()` lida com URL completa, `?code=` regex, código puro 10+ chars `[A-Za-z0-9-_]+`
- Token armazenado com `expires_at` local para `isTokenExpired()` com skew 60s

```bash
# Uso
opencode auth login --no-browser # imprime URL para servidor remoto
# Cole manualmente: http://127.0.0.1:54321/oauth-callback?code=4/0A...
```

### Multi-Conta

`accounts.ts` + `plugin.ts:loadAccounts()` rotação.

Formato `antigravity-accounts.json` (ver EN section acima para JSON).

Rotação:
- `ordered = cliFirst ? reversed : accounts` - estratégia configurable
- `refreshToken()` usa `client_id 681255...` e secret `GOCSPX-...` com headers Gemini CLI spoof
- Se `429 / 403`, continua para próxima conta, guarda `lastError`
- `failureCount` + `disabledUntil` backoff evita conta bloqueada spam
- `getSessionId(cwd)` FNV-1a por diretório mantém fingerprint estável

```bash
opencode auth login --add
opencode auth list
opencode auth status --quota
opencode auth logout --email conta@gmail.com
```

### Dual Quota - Antigravity + Gemini CLI PT

Dois pools distintos mesmo OAuth, limites diferentes (ver tabela em EN). Config em `~/.config/opencode/antigravity.json`:

```json
{
  "cli_first": false,
  "quotaProtectionPercent": 90
}
```

- `cli_first false` = antigravity-first (default) usa Claude + Gemini 3 pro primeiro, preserva quota CLI para fallback
- `cli_first true` = gemini-cli-first usa `gemini-2.5-flash` etc primeiro, preserva Antigravity para Claude
- Cache quota `quota.json` TTL 60s, endpoint `retrieveUserQuotaSummary`
- Proteção soft 90%: pula conta se >90% gasto diário

### Modelos 2026 PT

11 modelos canônicos - `ALL_MODELS_2026`:

```ts
// Antigravity proxy (Client-Metadata GEMINI mas roteado Antigravity)
antigravity-gemini-3-pro            // 1M context 65K out
antigravity-gemini-3.1-pro
antigravity-gemini-3-flash
antigravity-claude-sonnet-4-6       // 200K 64K Claude Sonnet via proxy Antigravity
antigravity-claude-opus-4-6-thinking// 200K 64K Opus thinking

// Gemini CLI nativo (sem X-Goog-User-Project)
gemini-2.5-flash
gemini-2.5-pro
gemini-3-flash-preview
gemini-3-pro-preview                // default
gemini-3.1-pro-preview
gemini-3.1-pro-preview-customtools  // melhor tool calling 2026
```

Thinking budget: `low 8192, medium 16384, high 32768`. Modelos `3-pro-preview` default `high`.

### Uso - opencode auth login e opencode run

```bash
# AUTH
opencode auth login
opencode auth login --no-browser
opencode auth login --add --email segunda@gmail.com
opencode auth list
opencode auth status --quota
opencode auth logout --all

# RUN
opencode run "Explique computação quântica"
opencode run --model gemini-3-pro-preview --thinking high "Construa API REST"
opencode run --model antigravity-claude-sonnet-4-6 "Refatore este arquivo"
opencode run --model gemini-3.1-pro-preview-customtools --tools enabled "Use tools"
opencode run --model antigravity-gemini-3-pro --file ./src/index.ts "Revise"
opencode run --project rising-fact-p41fc --model antigravity-gemini-3-flash "teste"

# Debug fingerprint completo
OPENCODE_DEBUG=antigravity opencode run --model gemini-3-pro-preview "test"
# imprime User-Agent, X-Goog-Api-Client, Client-Metadata, session_id
```

API programática ver EN section.

### Servidores MCP

Compatível com qualquer MCP server que use OpenCode. Tool calling via `functionCallingConfig AUTO`.

Ver `mcp.json` exemplo em EN. Limpeza de schema `cleanToolSchema()` remove `$schema`, `additionalProperties` booleano, corrige `Unknown name "parameters"`.

```bash
opencode run --mcp ./mcp.json --model antigravity-claude-sonnet-4-6 "Refatore usando MCP filesystem"
opencode run --model gemini-3.1-pro-preview-customtools --stream --mcp ./mcp.json
```

### Arquitetura / Mapa de Arquivos

Ver EN section - mesma estrutura raiz plana em minúsculas, zero deps, DAG de camadas v2.1.15 (um arquivo dono por família de lógica).

- `constants.ts`: L0 valores brutos compartilhados (client_id/secret, ENDPOINTS, timeouts, pools)
- `plugin.ts`: L5 entry principal, apenas orquestração
- `auth.ts`: L2 TODA autenticação — PKCE completo random port 127.0.0.1 (oauth.ts foi consolidado nele na v2.1.14)
- `fingerprint.ts`: L2 masquerade de identidade, PlatformProfile coerência, session_id FNV-1a
- `request.ts`: L4 construção de requisição, transformRequest, buildAntigravityRequest, buildGeminiCLIRequest, fetchWithCascade
- + `models.ts` (L1 identificação de modelos), `streaming.ts`, `quota.ts`, `accounts.ts`, `project.ts`, etc.

### Comparação com Concorrentes

Ver tabela em EN section. Resumo PT:

- **Este plugin**: local transparente MIT, direto para `cloudcode-pa.googleapis.com`, fingerprint 100% Gemini CLI `0.35.3 + gl-node/22.19.0 + Client-Metadata IDE_UNSPECIFIED`, OAuth PKCE porta aleatória `127.0.0.1:0`, multi-conta rotação 429/403, dual quota, 11 modelos 2026, anti-ban pools ponderados, fix `Unknown name parameters`, pasta `/mnt/data/auth` blindada curta minúscula.
- **9router/n9router**: proxy com client_id custom, UA parcial, porta fixa 8080, dep `axios/open/keytar`, 6 modelos legado, single token, sem coerência plataformas, rota via infra 9router (MITM).
- **omniroute**: gateway cloud, client_id rotation, generic `antigravity/1.x` UA, device code OAuth, project server-assigned, dep `express/ws`, 5 modelos, Antigravity only, proprietário, rota via infra omniroute.

Por que este é melhor: sem MITM, fingerprint real menor risco detecção, path isolado evita conflitos, PKCE porta aleatória funciona SSH/WSL/CI, transparência total.

### Solução de Problemas

#### 403 Forbidden no `rising-fact-p41fc`

Causa: projeto semente público sem billing, Google bloqueia temporário se telemetria mismatch.

Fix implementado `project.ts + plugin.ts` (ver EN para detalhes + curl debug):

- Remove `X-Goog-User-Project` para modelos CLI
- Chain fallback `v1internal -> daily-v1internal -> v1`
- Usa `daily` canary `https://daily-cloudcode-pa.googleapis.com`
- Força `loadCodeAssist` para descobrir projeto real do usuário
- Jitter retry

Ações manuais:

```bash
rm ~/.config/opencode/cache/antigravity/quota.json
opencode auth logout && opencode auth login
# Se 403 billing, crie projeto dummy no console.cloud.google.com sem billing e re-login, plugin descobrirá automaticamente
```

#### 400 Bad Request `Unknown name "parameters": Cannot find field`

Causa: Gemini API espera `functionDeclarations[].parameters` sem `$schema` ou campo `name` collision que Claude usa.

Fix `request.ts: cleanToolSchema() + transformTools()`:

1. Strip `$schema`, `$id`, `additionalProperties` boolean, `$ref`
2. Sanitiza `tool.name`: `/[^a-zA-Z0-9_]/ -> "_"`, trunc 64, regex `^[a-zA-Z_][a-zA-Z0-9_]*$`
3. Renomeia prop `name` para `file_name` se colisão detectada
4. Garante `type:"object"` em parameters
5. Filtra `required` vazio
6. `validateToolNames()` throw em duplicata após sanitização

Se ainda falhar:

```bash
OPENCODE_DEBUG=tools opencode run --model gemini-3.1-pro-preview-customtools "..."
opencode run --model gemini-3.1-pro-preview-customtools # mais leniente
opencode run --model antigravity-gemini-3-flash --tools disabled # sem tools
```

#### Outros

- **Porta em uso**: PKCE usa `:0` aleatória, mas se `127.0.0.1` restrito, `OAUTH_CALLBACK_PORT=8080` env ou `--no-browser` + paste manual
- **Timeout 30s**: firewall, use paste manual
- **WSL browser**: `sudo apt install wslu` para `wslview`, ou `--no-browser`
- **Refresh fail `400 invalid_grant`**: refresh_token revogado, re-login, marca `disabledUntil`
- **`quota.json` stale**: delete cache

### Aviso ToS

> **Disclaimer**: Este plugin usa credenciais OAuth públicas `681255809395-oo8f…b135j.apps.googleusercontent.com` (`GOCSPX-4uHgMPm…lXFsxl`) extraídas do binário oficial Gemini CLI. São credenciais públicas de client para `Google Cloud SDK` / `Gemini CLI` first-party — não é secret privado, mas uso fora do Gemini CLI pode violar ToS do Google Cloud Code Assist / Antigravity.

- Usa mesma identificação JSON (`Client-Metadata: IDE_UNSPECIFIED`) — Google pode detectar e bloquear uso não-CLI.
- Projeto `rising-fact-p41fc` é projeto demo público, não pertence aos autores do plugin.
- Sem garantia. Use por sua conta e risco. Para fins educacionais / interoperabilidade. Considere criar seu próprio projeto GCP e habilitar Cloud Code Assist API para uso compliant.
- Tokens ficam locais, nunca enviados para terceiros exceto `*.googleapis.com`.
- Não afiliado, endossado ou patrocinado por Google, Anthropic ou OpenCode.
- Se Google mudar API não documentada `v1internal`, plugin pode quebrar — existe fallback `daily-v1internal` mas não garantido.

Ao usar `opencode auth login`, você concorda que leu os [Termos](https://cloud.google.com/terms) do Google e políticas internas Antigravity.

### Licença

MIT — ver `LICENSE`. Copyright (c) 2026 maene contributors.

---

#### Credenciais extraídas (públicas)

```
client_id: 681255809395-oo8f…b135j.apps.googleusercontent.com
client_secret: GOCSPX-4uHgMPm…lXFsxl
fallback project: rising-fact-p41fc
user-agent: GeminiCLI/0.35.3
x-goog-api-client: gl-node/22.19.0
client-metadata: ideType=IDE_UNSPECIFIED,platform=PLATFORM_UNSPECIFIED,pluginType=GEMINI
```

Folder blindada: `/mnt/data/auth` — nome curto minúsculo isolada, produção-ready, blindada.

