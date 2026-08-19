# DevThink CLI Architecture

## Product boundary

DevThink is a provider-neutral development CLI with a polished terminal interface, explicit configuration, local session and memory persistence, streaming responses, a small plugin contract, and a loopback HTTP API. It supports documented API and OAuth credentials supplied by the user. It does not capture browser cookies, automate third-party web sessions, bypass CAPTCHA, forge device signals, or use undocumented endpoints.

## Repository shape

The root remains intentionally compact. Runtime logic lives in flat TypeScript modules at the repository root, while tests and CI stay in their conventional top-level directories. There is no `src` directory because the audited design documents require direct discoverability and simple packaging.

| Module | Responsibility |
| --- | --- |
| `devthink.ts` | CLI entrypoint, flags, commands, interactive loop |
| `config.ts` | platform paths, configuration, credential lookup, redaction |
| `providers.ts` | provider registry, model discovery, request routing |
| `stream.ts` | SSE framing and provider-specific delta normalization |
| `session.ts` | sessions, messages, exports, local persistence |
| `memory.ts` | session, project, and global memory layers |
| `modes.ts` | the 20 named operational modes and prompt metadata |
| `server.ts` | local loopback HTTP API |
| `plugin.ts` | opt-in local plugin manifest and hook contract |
| `ui.ts` | ANSI design tokens, panels, spinners, status output |
| `build.ts` | Bun build helper for local and CI use |

## Provider contract

The provider layer uses a normalized `ChatRequest`, `ChatMessage`, `ModelInfo`, and `ChatEvent` contract. OpenAI-compatible providers, including Z.AI when used through its documented API endpoint, share one transport. Anthropic Messages and Google Gemini use dedicated request and SSE adapters. Every credential is read from an environment variable or local configuration owned by the user. Errors are redacted before display or logging.

Provider selection is explicit. The CLI uses `--provider` or the configured provider; it does not silently rotate across accounts or services. Fallback is available only through a user-authored ordered provider list in configuration. A provider can be health-checked without sending a prompt.

## Persistence and privacy

Configuration is stored under the platform-appropriate DevThink directory or `DEVTHINK_HOME`. Sessions and memory are local JSON documents. External memory is never contacted automatically. Session, project, and global memory are resolved in that order. API keys are never written to logs, exported sessions, or release artifacts.

## HTTP server

The server binds to `127.0.0.1`. When no port is provided, a cryptographically random candidate in the documented range is selected and retried when occupied. The server exposes `/health`, `/models`, and `/chat`; it does not expose credentials or filesystem operations by default.

## Build and release

Bun is the release compiler. The GitHub Actions workflow obtains the package version directly from `package.json`, builds Linux, macOS, and Windows binaries, runs the test suite, scans the repository for obvious credential patterns, and publishes checksummed artifacts on a version tag. The workflow uses `GITHUB_TOKEN` from the runner environment and never stores a token in source.

## v1.0 acceptance criteria

The release is accepted when help, version, config, auth status, model listing, chat streaming, session persistence, memory resolution, mode listing, loopback health, and tests work without third-party dependencies installed at runtime. Provider calls remain opt-in and require user credentials. The release documentation must clearly distinguish supported official/API transports from unsupported browser automation and anti-bot circumvention.
