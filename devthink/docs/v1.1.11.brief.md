# DevThink v1.1.11 brief

## Objective

DevThink v1.1.11 restores and verifies functional parity between the browser workbench and the interactive CLI while replacing the current visual treatment with a single dark, modern, command-first workspace system.

## Required user journey

1. The first surface presents DevThink identity through the canonical ANSI artwork and a centered wordmark, with one unmistakably primary prompt field.
2. A user submits a first intention such as `oi`.
3. The product opens a session workspace with browser-like structure, navigation, tabs, history, context and a persistent composer.
4. The same actions, terminology and navigation hierarchy remain available in the React web workbench and the React Ink CLI renderer, adapted for the capabilities of each medium.

## Visual direction

The intended visual language is original DevThink work, informed by the supplied examples: a Qwen-like dark navigation rail and history hierarchy; ChatGPT/Atlas-style browser chrome and centered composer; Cline-like product density; OpenCode command-first semantics; and polished React TypeScript terminal interactions. The interface keeps DevThink's black, orange and orb-blue palette, uses clear contrast, and favors aligned panels over scattered decorative effects.

## Functional constraints

The work must preserve all existing `/web` routes, local gateway operations, compact identifiers, provider configuration, static-host portability and credential boundaries. Provider credentials remain in user-owned CLI storage; the static web surface must not acquire browser-side secrets, remote-cookie behavior or a hidden hosted backend.

## Acceptance criteria

| Area | Acceptance condition |
| --- | --- |
| Historical coverage | Current and reachable historical web components, pages and routes are inventoried before restoration work begins. |
| Parity | Every user-facing web operation has a CLI or gateway equivalent, and every CLI operation has a visible web mapping or a documented local-only reason. |
| Entry | Logo, wordmark and first command are visually central and work by keyboard. |
| Workspace | Navigation rail, browser tabs, session history, canvas and composer are aligned as one system in dark mode. |
| CLI | Ink retains React rendering and mirrors the web information architecture within terminal constraints. |
| Quality | Type checks, tests, static web build, Bun binary targets, security checks, accessibility and route behavior remain validated. |
