# DevThink 1.1.12 local pairing contract

## Durable local state

The local DevThink process owns `~/.config/devthink/devthink.db`. The file is a SQLite relational database used for workspaces, sessions, tabs, messages, local pairing metadata and non-secret workbench preferences. `devthink.json` remains the portable configuration file, while `auth.json` remains permission-restricted and contains only provider credentials accepted by the CLI.

The former `devthink.sqlite` path is treated as a compatibility source. On first access, the CLI moves the existing database to `devthink.db` when the new path does not exist. The runtime never copies a raw provider secret into database rows exposed to the browser.

## Static browser boundary

GitHub Pages, Vercel static output and Netlify static output can serve HTML, JavaScript and assets but cannot host a private mutable local SQLite database by themselves. The static DevThink web build is therefore a browser client. It gains durable shared state only after the user pairs it with a currently running DevThink local gateway.

## Pairing

The CLI creates a compact pairing identifier and one-time confirmation code. The browser sends both to `POST /pairings/consume` over the local gateway and receives a short-lived bearer token. The browser stores the token only in session storage and attaches it to subsequent requests. Revocation removes the active browser sessions at the local gateway; expiry or browser closure requires a new pairing.

## Read and mutation surface

The gateway exposes JSON reads for identity, workspaces, sessions, usage and provider readiness. It exposes explicit JSON mutations for the active provider, session creation, tab creation, tab update and locally safe preferences. Streaming chat uses SSE. Every browser request is origin-checked, bearer-authenticated after pairing and content-type checked for JSON mutation bodies.

| Concern | Owner | Browser visibility |
| --- | --- | --- |
| Workspaces, sessions, tabs and messages | `devthink.db` | Read and write through paired local gateway |
| Theme, rail mode and interface preferences | `devthink.db` | Read and write through paired local gateway |
| Provider base URL and model selection | `devthink.json` plus local database audit state | Read and write through paired local gateway |
| Provider API keys and OAuth refresh data | `auth.json` | Never returned to browser |
| Pairing codes and browser session expiry | `pairings.json` and local database metadata | Token only, no raw code after consumption |

## Web and CLI parity

Every browser operation has a matching CLI flag or interactive command. Every CLI operation that is safe to render in a browser is exposed as a paired gateway endpoint. Provider authentication, file-system paths, local service binding and token lifecycle remain CLI-owned operational boundaries rather than silently imitated browser features.
