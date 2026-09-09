# The provider guide (`@wenathlan/devthink/server`)

The provider lineage of the DevThink grand merge: an OpenCode plugin, a CLI family and a library-first TypeScript module set that talks to Google Antigravity (Cloud Code Assist at `cloudcode-pa.googleapis.com`) using plain Google OAuth tokens with no user-supplied GCP project id — the dual-bypass identity (Antigravity headers plus Gemini CLI identification spoof) and the robin-hood multi-account rotation on top. This guide distills the unique sections of the provider lineage README (Public API, the configuration reference, the project structure, the release scheme and the links), readapted to the merged repository: the grand merge consolidation interned the family in the flat root modules (`oauth.ts` carries the provider oauth, `devthink.ts` the CLI family, `debug.ts` the logging, `versionregistry.ts` the version detection, `server.ts` the server and library barrel, `antigravity.ts` the plugin), the library surface lives in `server.ts` behind the `./server` subpath of `@wenathlan/devthink`, and the CLI routes through the devthink command router.

The plugin lineage context (the bypass faces, the robin-hood rotation and the project-id cascade) is preserved verbatim in the merged sources; this document covers the surfaces a consumer touches.

## Public API

`server.ts` is the library-first ESM surface. Import the default plugin or named helpers:

```text
// plugin root (what opencode loads): the plugin definition + core exports
import plugin, { getPlugin, VERSION, CLIENT_ID } from "@wenathlan/devthink/server";

// full barrel (aggregates, namespaces, all helpers)
import {
  GEMINI_CLI_BYPASS,
  ANTIGRAVITY_CLI_BYPASS,
  ALL_MODELS_2026,
  MODEL_BY_ID,
  MODEL_ROUTING,
} from "@wenathlan/devthink/server";

// or namespace imports
import * as DevThink from "@wenathlan/devthink/server";

const mgr = new DevThink.Accounts.AccountManager();
await mgr.load();
const acc = mgr.getNext("round-robin", 90);
console.log(acc?.email);
```

Top-level named exports:

| Export | Purpose |
| --- | --- |
| `plugin` (default and named) | The OpenCode plugin definition object (the merged `antigravity.ts`). |
| `getPlugin(options?)` | Singleton factory returning the `AntigravityPlugin` instance. |
| `VERSION` | The lineage version string (derives from the `constants.ts` `PLUGIN_VERSION` owner). |
| `PLUGIN_ID` | The constant string `"devthink"`. |
| `GEMINI_CLI_BYPASS` | Frozen aggregate of the Gemini CLI identification (clientId, clientSecret, userAgent, xGoogApiClient, clientMetadata, fallbackProject, endpoints, isolatedDir). |
| `ANTIGRAVITY_CLI_BYPASS` | Frozen aggregate of the official Antigravity CLI (`agy`) identification — clientId, clientSecret, userAgent, xGoogApiClient, official redirect URI, scopes, PKCE flag. The client new logins present since 2.1.8. |
| `ALL_MODELS_2026` | Headline 2026 model catalog (rich `ModelDefinition[]`). |
| `MODEL_BY_ID` | Lookup record by model id. |
| `MODEL_ROUTING` | Routing config record (per model group, endpoint order, sandbox skip flag). |

The namespace re-exports of the barrel (module names as they live in the merged root):

| Namespace | Module | Purpose |
| --- | --- | --- |
| `Constants` | `constants.ts` | L0 raw-value owner: every cross-domain string/number/map declared once — base URLs, the `ENDPOINTS` host map, user agents, timeouts, version pools. |
| `Fingerprint` | `fingerprint.ts` | L2 identity-masquerade owner — weighted platform pools, FNV-1a session ids, `getDynamicUserAgent`, `getXGoogApiClient`. |
| `OAuth` | `oauth.ts` | The full OAuth 2.0 PKCE flow (callback server, token refresh, userinfo) — the provider oauth family. |
| `Accounts` | `accounts.ts` | L3 account-store owner: rich v3 AccountManager, store I/O, atomic chmod-0600 writes, the `Account` type and `RotationStrategy`. |
| `AntigravityCli` | `oauth.ts` | The compatibility namespace over the provider oauth family. |
| `Auth` | `oauth.ts` | THE provider authentication module: every OAuth client identity (the gemini pair declared once), accountManager, robin-hood `getNext`, the full OAuth flow. |
| `Core` | `core.ts` | L1 generic-utility leaf: hashing, jitter, `fetchWithTimeout`, retry classifiers, id generators, the LRU thinking cache. |
| `System` | `config.ts` + `debug.ts` | The system utilities surface: `cfgDir`, the version fallback chain, atomic writes, the legacy validator aliases, the raw JSON IO helpers (config) and the debug logger with `logsDir`/`redactSecrets` (debug). |
| `Models` / `Models2026` | `models.ts` | L1 THE model-identification owner: catalogs, classifiers, thinking tables, routing orders — model names never appear in any other file. |
| `Project` | `project.ts` | L3 THE project-discovery owner: `loadCodeAssist` plus the `onboardUser` cascade, the projectId cache, `resolveProjectId`. |
| `Quota` | `quota.ts` | L4 quota owner: dual-source quota manager, adaptive TTL cache, file-backed quota cache, runtime `QuotaConfig`. |
| `Config` | `config.ts` | L2 THE configuration module: schema-driven config (Draft-07), sync and async loaders, validators, config-file IO. |
| `Debug` | `debug.ts` | L1 logging owner: production logger (10 MB rotation, 7-day retention, secret redaction). |
| `Version` | `versionregistry.ts` | L2 version-detection owner: the dynamic Antigravity version resolver (4-tier legacy plus 4-tier observer chain). |
| `RequestHelpers` | `request.ts` | v2.1.14 alias: the schema-cleaner, message normalizer, thinking-budget mapper and variant parser live in the consolidated request module. |
| `Request` | `request.ts` | L4 THE request-building owner: the OpenAI/Anthropic to Gemini transform, the dual builder, the endpoint cascade, tool sanitizers, `API_PATHS`. |
| `Streaming` | `streaming.ts` | L4 streaming owner: tolerant SSE parser, OpenAI/Anthropic streaming transformers, replay cache, retry. |
| `Recovery` | `recovery.ts` | L4 recovery owner: auto-recovery engine (toast notifier, error detectors, signature preservation, retry wrapper). |
| `Search` | `search.ts` | L4 search-grounding owner: Google Search grounding, urlContext, image-gen config, citation extraction. |
| `CLI` | `devthink.ts` | L5 CLI entry (the provider command family, subcommand handlers, atomic writers). |
| `PluginModule` | `antigravity.ts` | L5 plugin entry, orchestration only (fetch hook, dual-bypass, account selection — every duplicated family imported from its owner). |

The `./server` subpath resolves the built `dist/server.js` bundle (the `types` condition answers `dist/server.d.ts`): the whole provider family — the plugin entry, the oauth flow, the account console, the quota manager and the barrel namespaces — answers through the one tree-shakable entry the build emits beside every other library target. The historical subpaths of the lineage (`./server`, `./constants`, `./cli`, `./auth`, `./core`, `./models`, `./streaming`, `./recovery`, `./search`, `./system`, `./index`) all resolve through this surface — the provider namespaces answer inside it, and the merged package root (`.`) belongs to the frozen extension library surface, which is why the provider surface lives behind its own subpath.

## The CLI surface

The lineage shipped its own bin; the merged repository keeps the single `devthink` bin and routes the family through it — `devthink provider <command>` (the router imports the server console module), the repository script `bun run provider` (`tsx devthink.ts provider`), and the module import `import { runCLI } from "@wenathlan/devthink/server"` (namespace `CLI`). The subcommand surface:

| Command | Action |
| --- | --- |
| `devthink provider login` | Run OAuth 2.0 PKCE against Google, capture a refresh token, add the account to the v3 store. |
| `devthink provider logout [email] [--all]` | Revoke refresh tokens and remove account(s) from the store. |
| `devthink provider accounts [list]` | Print the v3 store: addedAt, createdAt, expiry, projectId, remaining, limit, rateLimitResetTimes, soft-quota cooldowns. |
| `devthink provider accounts add --email <email> --refresh-token <token> [--project <id>]` | Add an account non-interactively. |
| `devthink provider enable <email>` / `devthink provider disable <email>` | Toggle an account in or out of robin-hood rotation. |
| `devthink provider manage` | Interactive per-account enable/disable TUI. |
| `devthink provider quota [email] [--all] [--json]` | Retrieve dual-source quota (Antigravity plus Gemini CLI) per account. |
| `devthink provider config {list,get,set,reset}` | Inspect or mutate `~/.config/opencode/antigravity.json`. |
| `devthink provider configure [--global] [--path <file>]` | Write the 2026 model definitions into `opencode.json` (chmod 0600 atomic write). |
| `devthink provider models {list,info}` | Browse the frozen 2026 catalog. |
| `devthink provider status` | Show active account, version, and endpoint health. |
| `devthink provider doctor` | File, permission, and token-expiry diagnostics. |
| `devthink provider version [--json]` | Print the resolved lineage plus dynamic Antigravity versions. |
| `devthink provider menu` / `devthink provider` (no args, TTY) | Open the interactive menu. |
| `devthink provider help` | Print the help screen. |

Environment overrides: `OPENCODE_CONFIG_DIR` (default `~/.config/opencode`), `ANTIGRAVITY_CLI_AUTORUN=0` (disable auto-run when the console module is imported as a library), `NO_COLOR`, `OPENCODE_IMAGE_ASPECT_RATIO`.

## Configuration reference

The provider family is configured through `~/.config/opencode/antigravity.json` (override the location with `OPENCODE_CONFIG_DIR`). The shipped schema — `docs/schemas/antigravity.json` in the merged repository — is dual-purpose: it is both a JSON Schema (Draft-07) for the user-editable keys and a frozen manifest of the Gemini CLI bypass identity (the `x-antigravity-bypass` object); the strict standalone schema ships beside it as `docs/schemas/antigravity.schema.json`. User keys:

| Key | Type | Default | Purpose |
| --- | --- | --- | --- |
| `oauth_identity` | "auto" or "antigravity-cli" or "gemini-cli" | "auto" | OAuth client identity for NEW logins. `auto`/`antigravity-cli` masquerades as the official Antigravity CLI (`agy`) — its client onboards the current free tier and Google accepts a loopback redirect for it, so the login is fully automatic (no code copy/paste). `gemini-cli` keeps the legacy client. Stored accounts always refresh with the client they authenticated with. |
| `cli_first` | boolean | true | Prefer Gemini CLI pool for Gemini models, preserving Antigravity quota for Claude. |
| `pid_offset_enabled` | boolean | true | 9router PID-offset anti-fingerprint (0 to 1000 ms randomization on `user_prompt_id`). |
| `google_search_enabled` | boolean or "auto" or string | false | Inject googleSearch plus urlContext tools. `"auto"` enables grounding for Gemini models only. |
| `quota_refresh_interval_minutes` | number 1 to 1440 | 15 | Quota cache refresh interval. |
| `soft_quota_cache_ttl_minutes` | number 1 to 1440 or "auto" | 5 | Soft-quota cooldown TTL. |
| `soft_quota_threshold_percent` | number 0 to 100 | 90 | Robin-hood soft-quota rotation threshold. |
| `rotation_strategy` | "round-robin" or "sticky" | "round-robin" | Account selection strategy. |
| `claude_tool_hardening` | boolean | true | Prefix Claude tool descriptions with the `ardening]` hint. |
| `keep_thinking` | boolean | false | Preserve thinking blocks across turns. |
| `toast_scope` | "all" or "project" or "minimal" or "none" or "root_only" | "all" | Toast notification scope. |
| `quota_fallback` | boolean or "auto" or "antigravity-first" or "cli-first" | "antigravity-first" | Quota-exhausted fallback policy. |
| `quiet_mode` | boolean | false | Suppress non-error toasts. |
| `debug` | boolean or object | false | Safe verbose logs (no secret exposure). Object form: `{ level, log_file, retain_days, max_bytes, tui_buffer_lines, redact_secrets }`. |
| `version_cache_ttl` | number 1 to 10080 | 60 | Dynamic Antigravity version cache TTL in minutes. |
| `endpoints` | object | omitted | Per-tier endpoint overrides: `{ prod, daily, sandbox, autopush }`. |

Minimal example:

```json
{
  "cli_first": true,
  "google_search_enabled": "auto",
  "soft_quota_threshold_percent": 90,
  "rotation_strategy": "round-robin",
  "claude_tool_hardening": true,
  "keep_thinking": false
}
```

Validation: the strict schema is Draft-07 with `$id https://opencode.ai/schemas/antigravity.json` and `additionalProperties: false`; the in-code schema (`config.ts` `ANTIGRAVITY_CONFIG_JSON_SCHEMA`) is the third superset that unifies both files. The bypass identity itself (Gemini CLI client id, secret, UA, headers, fallback project) is shipped-frozen and is not user-editable. The account store (`antigravity-accounts.json`, chmod 0600, atomic writes) and the runtime files (`.antigravity`, `opencode.json` model defs, `antigravity-logs`) are gitignored local state — never committed.

## Project structure

Root-first flat layout (no `/src`) — the merged provider family follows the lineage's strict layer DAG, every logic family has exactly one owner file and synchronization between files is import dependency, never copy. Runtime imports point downward only (a lower layer never imports a higher one; `import type` may cross layers because it erases at runtime). The merge renames ride the table:

```text
L0  constants.ts        raw shared values only (strings, numbers, host maps, pools)
L1  core.ts             generic pure utilities (hash, jitter, retry, ids, timeouts)
L1  models.ts           ALL model identification (catalogs, classifiers, routing)
L1  debug.ts            logging and redaction
L2  fingerprint.ts      identity masquerade (user agents, client metadata, headers)
L2  versionregistry.ts  version detection
L2  config.ts           configuration management, validators, config file IO
L2  oauth.ts            ALL authentication (oauth clients, scopes, urls, flows)
L3  accounts.ts         account store and rotation
L3  project.ts          project discovery (loadCodeAssist, onboardUser, projectId cache)
L4  request.ts          request building (transforms, builders, cascade, header stripping)
L4  streaming.ts        response streaming (sse parse, openai/anthropic transforms)
L4  recovery.ts         recovery (toast, error types, signature preservation)
L4  quota.ts            quota
L4  search.ts           search grounding
L5  antigravity.ts / devthink.ts / server.ts   entry orchestration only
```

| Path | Role |
| --- | --- |
| `antigravity.ts` | L5 plugin entry, orchestration only (default export, fetch hook, dual-bypass, account selection — every duplicated family imported from its owner). |
| `devthink.ts` | L5 CLI entry, subcommand dispatch (routed by `devthink provider <command>`). |
| `server.ts` | L5 the opencode server entry (the providerServer registrations for `opencode auth login`: google, antigravity, detected provider) and the library barrel — every export a function, per the opencode loader contract. |
| `server.ts` | L5 the library barrel (namespace re-exports incl. compat aliases, default plugin, named constants) — the `./server` package surface. |
| `config.ts` | L2 THE configuration module (validators and config-file IO; absorbed the system module). |
| `constants.ts` | L0 THE raw-value owner (every cross-domain string/number/map lives here once). |
| `models.ts` | L1 THE model-identification owner (model names never appear in any other file). |
| `accounts.ts` | L3 THE account-store owner (v3 AccountManager, store I/O, rotation). |
| `oauth.ts` | L2 THE authentication module (every OAuth client identity, PKCE flow, callback server, token refresh, userinfo). |
| `core.ts` | L1 THE generic-utility leaf (byte-identical through the merge). |
| `debug.ts` | L1 THE logging owner (production logger, rotation, retention, secret redaction). |
| `fingerprint.ts` | L2 THE identity-masquerade owner (header builders, weighted platform pools). |
| `project.ts` | L3 THE project-discovery owner (`resolveProjectId`). |
| `quota.ts` | L4 THE quota owner (dual-source manager, adaptive TTL cache). |
| `recovery.ts` | L4 THE recovery owner (toast, error detectors, retry wrapper). |
| `request.ts` | L4 THE request-building owner (the live pipeline — transforms, dual builders, `fetchWithCascade`, tool sanitizers). |
| `search.ts` | L4 THE search-grounding owner (googleSearch, urlContext, image-gen config, citations). |
| `streaming.ts` | L4 THE streaming owner (tolerant SSE parser, transformers, replay cache). |
| `versionregistry.ts` | L2 THE version-detection owner (dynamic resolver: legacy plus observer chains). |
| `docs/schemas/antigravity.json` | Dual-purpose schema plus bypass manifest. |
| `docs/schemas/antigravity.schema.json` | Strict standalone JSON Schema (Draft-07). |
| `docs/antigravity/` | The lineage reference docs (README, RESEARCH, WAVES, MODELS, BYPASS, FLUXOGRAMA, CHECKLIST) — preserved verbatim by the merge. |
| `tests/provider/` | The family suite: `node:test` plus `node:assert` (constants, config validators, system shim, oauth PKCE, fingerprint FNV-1a-32, models 9router mapping, system). |
| `SECURITY.md` | Vulnerability reporting policy of the maintained `2.0.x` line. |

The OpenCode plugin hooks (documented in the lineage README, all preserved in `antigravity.ts` and `server.ts`): `auth` (the provider entry with the `oauth` method — `authorize()` starts the PKCE local-callback flow and `callback()` resolves with the exchanged tokens; `auth.loader` supplies the auto-refreshed active account credentials), `config` (the documented injection point used only for the zero-config antigravity provider, add-only and never touching the file on disk — opt out with `["devthink", { "inject_antigravity_provider": false }]`), `chat.headers` (the Gemini CLI identification injected on requests from provider-family models only, detected by model ids), and `tool.execute.before`/`tool.execute.after` (instrumentation passthrough). The legacy library shape (`getPlugin()`, the plugin definition object) remains exported from the barrel for direct consumers; the merged package root belongs to the extension library, so opencode integrations import the plugin surface through the `./server` subpath or a `file:` reference to the repository.

## Releases and CI

Current release: **2.0.1** — the envelope line of the grand merge (the devthink envelopes are THE metadata, documented in the merge commit; the lineage's internal plugin version derives from the `constants.ts` owner). The full history of the lineage (2.1.16 back through 2.0.0) is preserved verbatim in "The maene lineage" section of [CHANGELOG.md](../CHANGELOG.md) — the historical record of the merged provider lineage.

The lineage's own pipeline (eight workflows) was absorbed by the merged DevThink lanes — the e2ugh layout contract holds in the merged repository too: every workflow is a single self-contained file under `.github/workflows/`, no nested `.github/actions` composite folder, and all the build, pack and publish computation happens on the GitHub Actions runners:

- `ci.yml` / `verify.yml` — the family gate ladder: the provider suite runs inside the deterministic vitest run and through `bun run test:node` (node `--experimental-strip-types --test`); lint (biome) and typecheck (`tsc --noEmit`) ride the same chain, and the strict JSON validation covers the tracked schema documents.
- `release.yml` — "DevThink Release": the metadata job resolves the version tag and verifies the CHANGELOG section, the assemble job builds the artifact chain with SHA-256 checksums, and the publish jobs ship every registry. Triggered by `v*` tags and workflow dispatch with a `tag` input.
- `publishnpmjs.yml` / `publishgithubnpm.yml` — the npm registry lanes (`@wenathlan/devthink`): resolve/publish with untrusted-input hardening, `NPM_TOKEN` normalization, `npm whoami` and skip-if-version-exists; the GitHub Packages lane uses the job token (no secret needed).
- `security.yml` — CodeQL analysis (javascript-typescript and actions), dependency review, TruffleHog secret scan of the full git history and the OSSF Scorecard — pushes, PRs and weekly.
- `securitypolicy.yml` — asserts `SECURITY.md` documents the supported `2.0.x` line in lockstep with the shipped package version.
- `cachecleanup.yml` — aggressive cache retention on the twice-daily schedule.
- `maintenance.yml` — the dependency ladder that dispatches the release workflow.

Required secret for the npm lanes: `NPM_TOKEN` — an automation-scoped npm access token with publish rights on `@wenathlan/devthink`, configured under Settings, Secrets and variables, Actions.

## Links

- npm: `https://www.npmjs.com/package/@wenathlan/devthink`
- GitHub: `https://github.com/wenathlan/devthink`
- OpenCode: `https://github.com/opencode-ai`
- The lineage reference docs: `docs/antigravity/` (README, RESEARCH, WAVES, MODELS, BYPASS, FLUXOGRAMA, CHECKLIST)
