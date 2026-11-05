# devthink

## Objective

DevThink is the operating system and superplatform of the family: a provider-neutral AI development workbench that merges the terminal CLI, the embedded local gateway, the static web workbench, the browser extension, the npm library and the MCP server into one product, one binary and one metadata. It is also the OS shell that embeds the family apps as native seats — zero iframes, one client-side shell.

## Features

- CLI — streaming chat, provider and model discovery, twenty modes, local sessions, memory, pairing and credential-free snapshot export; the command set covers init, chat, providers, models, modes, config, auth login/status/clear/migrate, identity, pair create/revoke, sync status/export, gateway status, sessions list/export, serve and interactive.
- Local gateway — a loopback-only HTTP and SSE service answering health, identity, settings, providers, models, sessions, workspaces, usage, preferences, pairing consume/revoke and normalized chat streaming.
- Provider layer — OpenAI-compatible, Anthropic Messages and Google Generate Content protocols with user-configured endpoints; the provider families include OpenAI, Z.AI, Qwen, OpenRouter, DeepSeek, Groq, Mistral, xAI, Ollama and Xiaomi MiMo.
- Workbench — the static web workbench with addressable workspace, session, tab and section routes, browser tabs, provider selection, sessions, a command palette, local one-time pairing, settings and responsive layouts.
- OS view — the dissolved OS surface rides one route as native React components: one client-side shell, persisted view state, clean URLs (no hash, no trackers, no index.html in the bar), one persona per family app.
- Aura chat — the gateway answers an OpenAI-compatible chat endpoint where the reasoning stream feeds the collapsible internal cognition panel.
- App seats — the shell carries the family seats (audio, video, image, games, calculator, chat, files, fonts, explore, history, console, docs, gateway, panel, plans, policy, projects, providers, settings, terms, usage, auth, callback, about) plus the intro and onboarding flow.
- Browser extension — a Manifest V3 surface with the background service-worker router, the sidepanel workspace (plan, run and review tabs, grid view, resume controls, provenance log), the popup command surface (task input, quick runs, command palette) and the consent-gated page bridge; the base permission set stays minimal.
- Library — the npm library surface of the frozen protocol contract; every module export behind the package entry.
- MCP server — stdio and HTTP transports, the tool catalog with consent metadata, resource subscriptions and approval gates.
- Local state — atomic JSON preference and compatibility records, a separate 0600-mode credentials file, and the SQLite mirror holding workspaces, sessions, tabs and messages.
- Security boundary — official provider APIs with user-supplied credentials only; no cookie capture, no browser session storage, no CAPTCHA solving, no anti-bot bypass, no credentials in the static bundle.

## OS Shell

- Embedding law — every family app rides as a native seat of the one shell; the standalone law keeps each app full-bleed at its own URL with the identical surface tree embedded.
- View state — single view state persisted with a type-guard through optional storage.
- Clean URL owner rule — internal navigation is state plus history replacement; the bar never shows settings paths, hashes, campaign parameters or duplicate slashes.
- Family domains — the gateway and each sibling answer their own subdomain of the family apex.
- Command surfaces — the shell command menu, the popup palette and the console terminal share the routed action law.

## Interactions

- Route tree — about, audio, auth, calculator, callback, chat, console, docs, explore, files, fonts, games, gateway, history, image, intro, notfound, onboarding, panel, plans, policy, projects, providers, settings, terms, usage, video.
- Chat surface — composer, turn list, markdown rendering, canvas pane, sandbox pane, session panel, sidebar and welcome state.
- Console — terminal, terminal UI, graph view and reference panels.
- Calculator — display, keypad and history.
- Auth — lock face, power menu, provider rows, sign-in and status line.
- Docs, explore, files, fonts, games, image, video — the seat pages of the shell, each with its own anchor and widgets.
- Pairing — the browser pairs with the local gateway through a short-lived one-time code; unpaired traffic never reaches local records.

## Distribution

- Bun-built self-contained binaries for Linux x64, macOS arm64 and Windows x64; the release workflow validates and publishes the static workbench with a repository-scoped base path and SPA fallback.
- The workbench is not distributed as a separate npm package; the library surface is.

## Engine role

OS shell and gateway engine of the family: the AI, workflow and gateway surfaces the siblings import, and the shell that seats them all.

Padrão: seguir o padrão moderno.
