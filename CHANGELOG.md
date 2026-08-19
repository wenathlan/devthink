# Changelog

## 1.1.0 — DevThink embedded gateway and web workbench

This release turns the audited repository context into the DevThink 1.1.0 implementation map and expands the DevThink CLI with provider-owned endpoints, normalized streaming and a local embedded gateway.

| Area | Change |
| --- | --- |
| Documentation | Adds `docs/DEVTHINK-1.1.0-feature-map.md`, the correction specification, canonical audit coverage, provider families, known regressions, terminal design and web plan |
| Gateway | Adds provider-specific endpoint overrides, embedded streaming diagnostics and secret redaction without a separate proxy subsystem |
| Providers | Adds registry entries for DeepSeek, Groq, Mistral, xAI and Ollama while retaining OpenAI, Z.AI, Anthropic, Google, OpenRouter and Qwen |
| CLI | Adds `gateway status`, explicit `auth login`, canonical `devthink.json` persistence and the terminal logo from `docs/logo.md` |
| Tests | Adds embedded-gateway, nested credential-redaction and configuration-path coverage |
| Web | Adds the DevThink browser-like workbench directly under `web/`, including tabs, provider rail, stream canvas, route inspector, command palette, responsive layout and canonical ANSI branding |
| Security | Keeps cookie capture, CAPTCHA solving, stealth automation and anti-bot evasion outside the product core |

## 1.0.0 — 2026-08-19

### Added

DevThink v1.0.0 introduces a compact AI development CLI with a provider-neutral transport layer, streaming responses, local sessions, internal memory, 20 operational modes, local plugins, ANSI terminal design, and a loopback HTTP API.

The first release supports OpenAI-compatible providers, Z.AI through its documented API endpoint, Anthropic Messages streaming, Google Gemini `streamGenerateContent`, OpenRouter, and a configurable Qwen-compatible transport. Credentials are resolved from environment variables or local configuration and are redacted from status output, sessions, logs, and release artifacts.

The CLI includes `chat`, `providers`, `models`, `modes`, `config`, `auth`, `sessions`, `serve`, `init`, and `interactive` commands. Machine-readable JSON output is available for scripted calls, while the interactive terminal includes slash commands, a status panel, a spinner vocabulary, and a consistent Nord-inspired color system.

### Security

This release deliberately excludes browser-cookie capture, undocumented web-session automation, CAPTCHA solving, anti-bot evasion, device-fingerprint forgery, and credential extraction. Provider failures are surfaced explicitly, and the release workflow scans product files for common embedded-secret patterns before publishing.

### Distribution

GitHub Actions builds self-contained Bun binaries for Linux x64, macOS arm64, and Windows x64 from version tags. The workflow reads the release version from `package.json`, runs tests, generates SHA-256 checksums, and attaches artifacts to the GitHub release.
