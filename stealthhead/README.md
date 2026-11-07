# stealthhead

FPS game platform of the wenathlan family — in construction. The owner's law rides the folder: clean everything, leave ONE component saying "game in construction" — the surface carries the under-construction face alone (no routes, no shell chrome, no entry flow), while the engine logics of the platform (match, ranking, weapons, world, physics, netcode, spawner, hud) stay preserved in the theme topic folders for the day the game wakes up. This folder receives the stealthhead application per the complete tree.

---

# The Sol theme

# Stealthhead Sol

Stealthhead is the FPS game application of the DevThink family. This Sol theme is its web surface — a Vite + React SPA whose ONE mounted component is the under-construction face: the drawn brand mark, the scope reticle hologram, the coral scope light, the pulsing construction chip and the label-store copy. Every path answers the same face — there is no route table any more.

```bash
pnpm install
pnpm dev
```

## The preserved engine logics

- `sol/match/match.ts`, `sol/ranking/ranking.ts`, `sol/weapons/weapons.ts`, `sol/world/world.ts` — the match, ladder, armory and pre-compiled world logics, moved off the surface into the theme topic folders (never deleted); `sol/physics/physics.ts`, `sol/netcode/netcode.ts`, `sol/spawner/spawner.ts`, `sol/hud/hud.ts` — the engine companions beside them. The surface imports none of them.
- `db.ts` — the self-hosted database seat: it persists the typed seeds of the preserved logics and the label store; the static interface never imports it.
- `test/*.test.ts` — the batteries pin the preserved logics at their topic paths and the under-construction law of the surface.

## The family contract (wave 7-a)

- `family.ts` — the one table of the spec §12 accents (argan jade, cadria rosa, debonair latão, forge lime-brasa, foundry têmpera, getry violeta, saddle ember, vault gelo) and the sibling slugs in rail order; `test/family.test.ts` pins it (8 cases).
- `familyurl.ts` — the relative sibling-link contract (`"../" + slug + "/"`, verbatim body); `familyurl(slug)` survives any mount point without trusting a build constant; `test/familyurl.test.ts` pins it.
- `test/design.test.ts` — the design-contract cases: the coral `#f4694f` as the one signal (stylesheet alias and mark story alike), the windows accent `#4cc2ff` on focus, zero banned hue (`#3B82F6` / `#2563EB` / `#F97316`), zero pill (no `999px`, no `--r-pill`), zero `transition: all`, zero `scale(0)` entries, the trylle font pair (Inter Variable reading, Geist Mono detail), the source-face entry, the reduced-motion hard stop, tabular numerals and the trylle foundation tokens.
- `test/gameface.test.ts` — the under-construction law: the surface is ONE component, the game pages are gone, no surface file imports the engine logics, and the logics stay real at their topic paths.

## Entry face and `restore:entry`

`index.html` is kept permanently on the SOURCE face: `./App.tsx` script, `./favicon.svg`, `./manifest.webmanifest` and the font triad `<link>`. The Vite build emits hashed bundles (`index-*.js`, `index-*.css`, `favicon-*.svg`, `manifest-*.webmanifest`…) beside it for the pages workflow — every family is barred by `.gitignore`, so the tree keeps the source face only. After a local build, run:

```bash
npm run restore:entry
```

The script is a GUARD, not a blind checkout: if the working tree already rides the source face it is a no-op; if `HEAD` still carries a pre-triad (hashed or triad-less) face it REFUSES with exit 1 — it never revives a stale face over the fix. Land the source-face commit first, and from now on the guard restores the canonical face after any local build.
