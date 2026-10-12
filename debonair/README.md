# debonair

Audio and DAW. Isolated marketing app for the operating system. Houses the katexis engine at the root; imports gateway, AI and workflow from devthink and versawase from cadria. This folder receives the debonair application per the complete tree.

---

# The Sol theme

# Debonair Sol

Debonair is the audio workstation (DAW) of the DevThink family, running on the katexis engine. This Sol theme is the workstation's web surface — a Vite + React SPA whose library, generate, studio and settings routes drive real engine plans (no mock anywhere: the studio plays the WebAudio transport of `Sol/studio/audioengine.ts` over the plans `arranger.ts` composes).

```bash
pnpm install
pnpm dev
```

## The contract (campaign 5-b)

- **test** — `pnpm test` runs `vitest run` over `tests/` (223+ cases across 20 files, node environment). `bun test` answers green on the same suite (bun aliases the vitest API).
- **typecheck** — `pnpm typecheck` (`tsc --noEmit`) must exit 0.
- **lint** — `npx biome check .` must answer 0 errors and 0 warnings.
- **restore:entry** — the vite build emits hashed bundles beside the sources and rewrites `index.html` to the hashed face. `pnpm restore:entry` restores the source face from HEAD, with two guards: it REFUSES (exit 1, nothing touched) while HEAD itself is not the source face (`script … App.tsx`), and it REFUSES while the HEAD face still carries the Google Fonts CDN link (the type triad self-hosts via `@fontsource`, imported by `App.tsx` — the face must never ride a font CDN again).
- **build hygiene** — `.gitignore` bars every hashed emit (`/index-*.js|css`, `/favicon-*.svg|png|ico`, `/manifest-*.webmanifest`, `/icon-*.png`, `/apple-touch-icon*.png`, `/registerSW-*.js`, `/sw.js`, `/*.woff2`); the pages workflow rebuilds per deploy, so only the canonical unhashed faces stay tracked. After a local build, run `pnpm restore:entry` to put `index.html` back on the source face. NEVER build twice without the source face back on disk: the build entry is the root `index.html`, so a second build over the hashed face compiles the previous emit (the double-hash signature — `favicon-XXXX-XXXX.svg` — the legacy tree carried).

## The family contract

The chrome links the sibling deploy units through `familyurl.ts` (the verbatim family body) over the one accent table of `family.ts` (spec §12) — the rail foot, the landing footer and `tests/family.test.ts` read the same table, so the row cannot drift.
