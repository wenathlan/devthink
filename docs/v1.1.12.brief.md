# DevThink 1.1.12 brief

## Objective

Deliver one coherent local-first workbench in which the browser client, interactive CLI and CLI flags expose the same safe workspace operations and the same primary navigation vocabulary. The browser remains a static portable client; the CLI remains the owner of credentials and durable local state.

## Product frames

The product uses three intentional frames. A welcome frame establishes one brand identity. An entry frame layers the canonical DevThink ANSI mark behind one wordmark and one command field. A workspace frame opens after a first intention, places top-level session and section tabs at the top, keeps the composer at the bottom, and treats a rail as an optional navigation mode rather than a competing permanent duplicate.

## Structure

Each web page moves to a same-named domain folder. The local anchor file owns the page route, its view, interaction components and TypeScript-only view logic. `App.tsx` remains the universal router and imports only the anchor for each domain. Shared non-visual runtime contracts may remain at the project root when they are consumed by CLI and web.

## Data boundary

DevThink stores durable user state locally in `~/.config/devthink/devthink.db` alongside its JSON configuration and authentication files. The static browser build must not contain a writable shared database or provider credential. When paired, it issues explicit JSON or SSE requests to the user-owned local DevThink gateway, which validates the temporary pairing token and applies mutations to the local database.

## Explicit exclusions

The implementation does not capture browser cookies, replay third-party browser sessions, bypass CAPTCHAs, embed OAuth codes from supplied examples, or deploy a mutable database into GitHub Pages, Vercel static hosting or Netlify static hosting. Any provider authentication remains an official API key or documented official OAuth flow initiated by the user.

## Acceptance criteria

The interface has one canonical mark per frame, no generic central component bucket, tab-first navigation, direct routes retained, mobile-safe controls, keyboard access, reduced-motion support, and safe local gateway pairing. All supported mutations have matching web and CLI entry points; local-only secrets and gateway ownership remain visibly documented.
