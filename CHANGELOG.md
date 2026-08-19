# Changelog

## 1.1.5 — Minimal container runtime

This release replaces the container runtime with a nonroot distroless compatibility image. The image contains only the compiled DevThink binary and its required C/C++ runtime libraries, reducing the operating-system package surface scanned before GHCR publication.

## 1.1.4 — Container runtime compatibility

This release runs the Bun-compiled CLI in a Bun runtime image, avoiding dynamic-library mismatches during GHCR smoke tests. Security workflows retain Trivy SARIF evidence even when the configured gate detects a high-severity issue.

## 1.1.3 — Distribution repair

This release corrects the mobile Capacitor configuration and resolves the vulnerable UUID transitively selected by the initial mobile lockfile. It also moves the Bun container runtime to a glibc-compatible base, so the compiled CLI runs in the released image, and limits Maven, NuGet, and RubyGems publication to manual source-backed dispatches.

## 1.1.2 — Distribution surfaces and artifacts

This release keeps `@wenathlan/devthink` as the only npm package and adds source-backed distribution surfaces for a browser extension, a Bun-compiled container, Android development artifacts, and an iOS simulator artifact. Maven, NuGet and RubyGems remain source-gated because the repository does not contain Java, .NET, or Ruby package sources.

| Area | Change |
| --- | --- |
| npm | Publishes only the DevThink CLI package. |
| Browser extension | Packages the static workbench as a Manifest V3 release ZIP with explicit local-gateway host permissions. |
| Container | Compiles the CLI with Bun in a multi-stage image and publishes a container release archive and GHCR image when triggered. |
| Mobile | Uses Capacitor source with Bun-built web assets to produce Android development artifacts and an unsigned iOS simulator application. |

## 1.1.1 — DevThink publication and workflow reconciliation

This release aligns the CLI and static workbench at version 1.1.1, refreshes direct web dependencies, and updates the GitHub Actions toolchain. The workbench remains a static deployment surface and is not published as a separate npm package.

| Area | Change |
| --- | --- |
| Distribution | Publishes only `@wenathlan/devthink` through the credential-safe npm workflow. |
| Workflows | Updates Actions runtimes and adds source-aware guards for optional ecosystem packages. |
| Compatibility | Raises the declared Node.js baseline to 26.7.0 and refreshes direct web dependencies to their current releases. |
| Static web | Preserves the deployable `web/` artifact for GitHub Pages, Vercel and Netlify. |

## Embedded gateway and web workbench implementation

This implementation turns the audited repository context into the DevThink feature map and expands the DevThink CLI with provider-owned endpoints, normalized streaming and a local embedded gateway.

| Area | Change |
| --- | --- |
| Documentation | Adds the DevThink feature-map collection, correction specification, canonical audit coverage, provider families, known regressions, terminal design and web plan |
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
