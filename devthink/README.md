# DevThink

**DevThink** is a provider-neutral AI development workbench with a terminal CLI, an embedded local gateway and a static web workbench. The public source lives in the [DevThink repository](https://github.com/wenathlan/devthink); **DevThink** remains the product name.

> **Security boundary.** DevThink uses official provider APIs and credentials supplied explicitly by the user. It does not capture browser cookies, store browser sessions, solve CAPTCHAs, automate browser authentication or bypass anti-bot controls.

| Surface | Capability |
| --- | --- |
| CLI | Streaming chat, provider and model discovery, 20 modes, local sessions, memory, pairing and credential-free snapshot export. |
| Local gateway | Loopback HTTP and SSE service for health, provider models, workspaces, sessions, tabs and normalized chat streaming. |
| Provider layer | OpenAI-compatible, Anthropic Messages and Google Generate Content protocols with user-configured endpoints. |
| Local state | Atomic JSON compatibility records plus SQLite mirrors under `~/.config/devthink/`. |
| Workbench | Static React application under `web/`, with addressable workspace/session/tab/section routes and local one-time pairing. |
| Background | The service-worker surface of the merged browser extension: the request router, the workflow segments, the run state and the capability gates of every background action, frozen by its capmanifest. |
| Sidepanel | The extension workspace surface: plan, run and review tabs, the grid view, the resume controls and the provenance log of the data pipelines. |
| Popup | The extension command surface: the task input, the quick run actions and the command palette with the pipeline counters. |
| Pagebridge | The only injected content script: the paired bridge that frames the page content keys under the explicit consent flag and the audit kind. |
| Library | The npm library surface of the frozen protocolv2 contract: every module export behind the `@wenathlan/devthink` package entry, frozen by the api freeze of the release. |
| MCP | The model context protocol server surface: `serve --stdio` and `serve --http` transports, the tool catalog with consent metadata, the resource subscriptions and the approval gates. |

## Installation

DevThink uses Bun for development and self-contained binary builds. The CLI keeps non-secret preferences in `devthink.json` and user-provided official credentials in a separate `auth.json` file.

```bash
npm install --global @wenathlan/devthink
devthink init
devthink --help
```

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
| `authts.md` | Official credential shapes and inert examples. |
| `providersts.md` | Protocol adapters, retry and error redaction. |
| `gatewayts.md` | Local gateway request and origin contract. |
| `storagets.md` | Credential-free local persistence and sync boundary. |
| `webts.md` | Static base-path and addressable route contract. |

## Validation and release

```bash
bun run check
bun run build:binary

cd web
pnpm check
pnpm build
```

The release workflow builds Bun binaries for Linux x64, macOS arm64 and Windows x64. The Pages workflow validates and publishes the static workbench with a repository-scoped base path and SPA fallback; the workbench is not distributed as a separate npm package.

## References

[1] [Bun documentation](https://bun.sh/docs)

[2] [Anthropic streaming documentation](https://platform.claude.com/docs/en/build-with-claude/streaming)

[3] [Google Gemini Generate Content](https://ai.google.dev/gemini-api/docs/generate-content)

[4] [Z.AI API documentation](https://docs.z.ai/api-reference/introduction)

[5] [Xiaomi MiMo quick start](https://mimo.mi.com/docs/quick-start/first-api-call)

---

# The Sol theme

**DevThink Web** is the browser-like workbench of the DevThink platform. It is a static interface deliberately separated from the provider persistence: credentials and endpoints belong to the `~/.config/devthink/devthink.json` file and to the embedded local gateway, never to the browser bundle.

## Topology

The theme root is the application root and the Sol/ folder carries the component folders (the theme stylesheet lives inside the theme as `Sol/sol.css`); no `src/` and no `client/src/` exists.

```text
the app root carries the theme roots and Sol/ carries the component folders
├── App.tsx
├── capacitor.config.ts
├── control.shell.tsx
├── gateway.ts
├── index.html
├── schema.prisma
├── Sol/
│   ├── sol.css
│   ├── console/
│   ├── gatewayview/
│   ├── home/
│   ├── notfound/
│   ├── os/
│   ├── providers/
│   ├── projects/
│   ├── routes/
│   ├── settings/
│   ├── shell/
│   └── usage/
```

## OS view (dissolved devthink/os)

The former Next.js DevThink OS (`devthink/os`, single route "/") is absorbed as the page folder `os/` and served at the `/os` route of this workbench. The folder owns its components (dotted names: `Os.tsx` anchor, `gateway.home`, `command.menu`, `app.header`, `aura.chat`, one `<app>.view` per family app) and its folder logics (`cleanurl.ts`, `use.stored.state.ts`, `os.events.ts`, `os.types.ts`, `apps.ts`, `osgateway.ts`, `reveal.ts`). The Next.js `page.tsx`/`layout.tsx` pair is not carried over: this is a Vite+wouter SPA, so the anchor is routed from `App.tsx`, the metadata lives in `index.html` and the engine stylesheet was merged into the "OS view" section of `index.css` with the `--sol-*` tokens remapped onto the `--dt-*` workbench tokens (the Sol design prevails).

Still-true rules of the os surface:

- Zero iframe: native React components only, one client-side shell, single view state `{ app, page }` persisted via `useStoredState` (localStorage + type-guard; storage is optional).
- Clean URLs (owner rule): internal navigation is React state + `history.replaceState(null, "", "/")`. The bar never shows `/settings`, `/projects`, `#hash`, `?utm_*`, `index.html` or `//` — cleaned live on `hashchange`/`popstate`. Live demo in Settings → "Clean URLs".
- Aura chat: the gateway answers `POST /v1/chat/completions` (`{model:"devthink", messages:[…]}`, OpenAI-compatible); `reasoning_content` feeds the collapsible Internal Cognition. One persona per app.
- Family domains: gateway/OS devthink.pro, argan argan.devthink.pro, debonair debonair.devthink.pro, cadria cadria.devthink.pro, stealthhead stealthhead.devthink.pro.

## Run locally

```bash
pnpm install
pnpm check
pnpm dev
```

Every page domain carries its own route anchor, visual components and local TypeScript logic. `App.tsx` is the single entry, responsible for the React mount and the universal router. The workbench carries browser tabs, provider selection, sessions, a command palette, local pairing, Settings and responsive layouts. Messages stay local until the browser is paired with the DevThink gateway.

## Gateway boundary

The web client uses the loopback gateway of `devthink serve` for `/health`, `/identity`, `/settings`, `/providers`, `/models`, `/sessions`, `/workspaces`, `/usage`, `/preferences`, `/pairings/consume`, `/pairings/revoke`, `/chat` and SSE events. Settings is equivalent to `devthink config settings`, `devthink config set` and `devthink identity --id`: it reads and changes the same public identity and the same preferences that belong to the local CLI database.

The `devthink.db` database keeps belonging to the CLI and to a single local public id. The paired interface is only a temporary client of that same base through the authenticated gateway; there is no static copy of the database, no database password in the browser, no api key, no refresh token, no browser cookie, no CAPTCHA data and no provider secret in the bundle.

## Design system

The visual direction lives in [`../docs/ideas.md`](../docs/ideas.md), the deployment in [`../docs/deploymentts.md`](../docs/deploymentts.md) and the parity between CLI, Ink, gateway and web in [`../docs/v1115capabilitymatrix.md`](../docs/v1115capabilitymatrix.md). The workbench joins the tab language of a browser with charcoal surfaces, the signature orange and the connection blue. The brand is the canonical ANSI composition of [`../docs/logo.md`](../docs/logo.md), rendered in compact form by the interface.
