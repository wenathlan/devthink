# DevThink

**DevThink** is a provider-neutral AI development workbench with a terminal CLI, an embedded local gateway and a static web workbench. The public source lives in the [DevTink repository](https://github.com/wenathlan/Devthink); **DevThink** remains the product name.

> **Security boundary.** DevThink uses official provider APIs and credentials supplied explicitly by the user. It does not capture browser cookies, store browser sessions, solve CAPTCHAs, automate browser authentication or bypass anti-bot controls.

| Surface | Capability |
| --- | --- |
| CLI | Streaming chat, provider and model discovery, 20 modes, local sessions, memory, pairing and credential-free snapshot export. |
| Local gateway | Loopback HTTP and SSE service for health, provider models, workspaces, sessions, tabs and normalized chat streaming. |
| Provider layer | OpenAI-compatible, Anthropic Messages and Google Generate Content protocols with user-configured endpoints. |
| Local state | Atomic JSON compatibility records plus SQLite mirrors under `~/.config/devthink/`. |
| Workbench | Static React application under `web/`, with addressable workspace/session/tab/section routes and local one-time pairing. |

## Installation

DevThink uses Bun for development and self-contained binary builds. The CLI keeps non-secret preferences in `devthink.json` and user-provided official credentials in a separate `auth.json` file.

```bash
bun install
bun run devthink.ts init
bun run devthink.ts --help
```

```bash
devthink auth login zai --token "$ZAI_API_KEY" --kind api-key
devthink config activeModel glm-5
devthink chat --prompt "Summarize this repository in three points."
```

On Linux, the default local paths are:

| File | Purpose |
| --- | --- |
| `~/.config/devthink/devthink.json` | Non-secret preferences and provider endpoint configuration. |
| `~/.config/devthink/auth.json` | Explicit official API keys, bearer values or OAuth records; file mode is `0600`. |
| `~/.config/devthink/devthink.sqlite` | Local workspaces, sessions, tabs and messages. |

The examples below are deliberately inert and must be replaced locally by an official credential supplied by the user.

```json
{
  "version": 1,
  "providers": {
    "zai": {
      "kind": "api-key",
      "value": "example_api_key_not_a_secret",
      "updatedAt": "2026-08-19T00:00:00.000Z"
    }
  }
}
```

## Provider endpoints

DevThink does not use a separate proxy module. A provider-specific endpoint belongs in `providers.<id>.baseUrl` within the user-owned `devthink.json` file.

```json
{
  "activeProvider": "zai",
  "activeModel": "glm-5",
  "gateway": { "mode": "embedded", "stream": true },
  "providers": {
    "zai": {
      "baseUrl": "https://api.z.ai/api/paas/v4",
      "transport": "openai-compatible"
    }
  },
  "web": { "enabled": true }
}
```

| Provider family | Protocol |
| --- | --- |
| OpenAI, Z.AI, Qwen, OpenRouter, DeepSeek, Groq, Mistral, xAI, Ollama and Xiaomi MiMo | OpenAI-compatible streaming. |
| Anthropic | Messages streaming. |
| Google Gemini | Generate Content streaming. |

## CLI commands

```text
devthink init
devthink chat --provider <id> --model <id> --prompt <text>
devthink providers
devthink models --provider <id>
devthink modes
devthink config [key] [value]
devthink auth login <provider> --token <credential> [--kind api-key|bearer|oauth]
devthink auth status
devthink auth clear <provider>
devthink auth migrate
devthink identity
devthink pair create [--web-url <url>] [--gateway <url>]
devthink pair revoke
devthink sync status
devthink sync export
devthink gateway status
devthink sessions list
devthink sessions export <id> --format markdown
devthink serve
devthink interactive
```

`devthink serve` listens only on the local loopback interface. The web workbench must pair through a short-lived, one-time code before a browser origin can access local records. Provider credentials remain local and are never sent to GitHub Pages.

## Workbench and GitHub Pages

The workbench lives directly under [`web/`](./web), with no `web/src` or `web/client/src` nesting. Its route preserves the same stable identifiers used by the CLI and local gateway.

```text
/w/:workspaceId/s/:sessionId/t/:tabId/:sectionId
```

```bash
cd web
pnpm install --frozen-lockfile
pnpm check
pnpm build
```

The GitHub Pages build is static. It never embeds a provider credential or remote database. To interact with the CLI, users run `devthink serve` locally and pair the browser explicitly.

## TypeScript documentation

The public `docs/` directory contains compact `category.ts.md` collections. Legacy non-TypeScript executable documentation was rewritten as typed, JSDoc-described TypeScript contracts. The root code integrates the safe parts of those contracts: bounded retry behavior, error redaction, exact allowed-origin matching, secure remote-endpoint validation and Pages base-path normalization.

| Collection | Focus |
| --- | --- |
| `auth.ts.md` | Official credential shapes and inert examples. |
| `providers.ts.md` | Protocol adapters, retry and error redaction. |
| `gateway.ts.md` | Local gateway request and origin contract. |
| `storage.ts.md` | Credential-free local persistence and sync boundary. |
| `web.ts.md` | Static base-path and addressable route contract. |

## Validation and release

```bash
bun run check
bun run build:binary

cd web
pnpm check
pnpm build
```

The release workflow builds Bun binaries for Linux x64, macOS arm64 and Windows x64. The Pages workflow validates and publishes the static workbench with a repository-scoped base path and SPA fallback.

## References

[1] [Bun documentation](https://bun.sh/docs)

[2] [Anthropic streaming documentation](https://platform.claude.com/docs/en/build-with-claude/streaming)

[3] [Google Gemini Generate Content](https://ai.google.dev/gemini-api/docs/generate-content)

[4] [Z.AI API documentation](https://docs.z.ai/api-reference/introduction)

[5] [Xiaomi MiMo quick start](https://mimo.mi.com/docs/quick-start/first-api-call)
