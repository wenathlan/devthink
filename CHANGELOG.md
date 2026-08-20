# DevThink release notes
## 1.1.13 — Flat domain consolidation

### Added

| Area | Addition |
| --- | --- |
| Flat application entry | `web/App.tsx` now owns React mounting, routing, the error boundary, global stylesheet import and browser notification surface; `main.tsx` is no longer required. |
| Domain-only web tree | Generic `app`, `contexts`, `hooks`, `lib`, `primitives`, `public`, `components`, `pages` and `src` directories have been removed from the workbench. |
| Local ownership | Page-level controls now use native semantic elements, while the Routes map owns its only callback and class-join helpers directly. |
| Compact visual grammar | Historical workspace CSS overrides were replaced with one terminal workspace system for entry, tabs, rail, command bar, pairing, controls and error states. |
| Control frame | Providers, projects, routes and usage share one explicitly named root control shell without a generic application directory. |
| Preserved parity boundary | Web and Ink retain the same safe workspace destinations, settings and local gateway interactions; provider credentials remain CLI-owned. |

## 1.1.12 — Page domains and tabbed interaction

### Added

| Area | Addition |
| --- | --- |
| Page-domain topology | The web workbench now keeps each route anchor and its local visual logic in its named domain, with `home`, `providers`, `projects`, `routes`, `usage`, `notfound`, `app` and `primitives` replacing generic `components` and `pages` directories. |
| Canonical local database | DevThink now uses `~/.config/devthink/devthink.db` as the canonical SQLite path and safely seeds it from the legacy `devthink.sqlite` file when needed. |
| Shared workbench preferences | Theme, rail mode and interface zoom are stored in the CLI-owned database, exposed only through authenticated local gateway endpoints, and configurable with `devthink config set`. |
| Interactive Settings parity | The web Settings panel and Ink `/settings` view can both inspect and change shared presentation preferences without receiving provider credentials. |
| Tab-first workspace frame | The workbench promotes the browser-like tab row as its primary navigation and permits an `always`, `auto` or `off` local navigation rail. |
| Consolidated identity | The entry screen centers the product wordmark over the canonical ANSI mark while the workspace keeps the rail as its single optional identity surface. |
| Mutation boundary | JSON-bearing gateway mutations now require an explicit JSON content type; pairing, bearer authorization and local-only provider credential boundaries remain intact. |

## 1.1.11 — Web-CLI parity and visual renewal

### Added

| Area | Addition |
| --- | --- |
| Shared workspace contract | A renderer-neutral TypeScript destination model aligns chat, history, projects, providers, usage, routes and settings across the React web workbench and React Ink CLI. |
| Real session navigation | The web chrome now renders actual local session tabs, creates and closes tabs, and exposes a local history view without removing direct routes. |
| CLI control views | The interactive CLI now provides keyboard and slash-command access to local history, projects, providers, usage, routes and settings. |
| Browser rail | A responsive dark local rail keeps preserved control pages discoverable from the primary workspace while retaining their bookmarkable routes. |
| Entry refinement | The canonical ANSI mark, product wordmark, primary composer and local suggestions form a quieter first-intention surface. |
| Design records | Version-scoped inventory, reference synthesis and parity contract documents make the product surface and local-only security boundary explicit. |

## 1.1.10 — Entry and browser-workspace redesign

### Added

| Area | Addition |
| --- | --- |
| Landing entry | A first-command introduction with the canonical DevThink ANSI mark behind an oversized wordmark and one focused command field. |
| First-command transition | A submitted natural-language intention creates a local identity, records the first session intent and opens the workspace. |
| Browser workspace | A two-level navigation model with browser-shaped session chrome, an active local tab, task-category pills and a persistent command rail. |
| Visual system | Original black editorial surfaces, layered charcoal browser material, intentional orange states and orb-blue local connection signals. |
| CLI parity | The Ink renderer now starts on the same command-first entry surface and opens the same local workspace semantics after the first command. |
| Release packaging | Locked CLI dependencies are installed before Bun binary compilation and inside the container build so the React Ink renderer is included consistently. |
