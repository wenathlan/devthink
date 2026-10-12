# stealthhead

FPS game platform. Imports versawase from cadria and audio from debonair via the published library, with no engine file of its own; only game logics (match, ranking, weapons, world). This folder receives the stealthhead application per the complete tree.

---

# The Sol theme

# Stealthhead Sol

Stealthhead is the FPS world and game application of the DevThink family: matches, rounds, ranking ladders, weapons and world assets under one game shell. This Sol theme is its web surface — a Vite + React SPA whose home, match, ranking, weapons and world routes render from the same sqlite database that `schema.prisma` and `drizzle.config.ts` describe.

```bash
pnpm install
pnpm dev
```

## The family contract (wave 7-a)

- `family.ts` — the one table of the spec §12 accents (argan jade, cadria rosa, debonair latão, forge lime-brasa, foundry têmpera, getry violeta, saddle ember, vault gelo) and the sibling slugs in rail order; the chrome rail foot and the landing footer both render it, and `tests/family.test.ts` pins it (8 cases).
- `familyurl.ts` — the relative sibling-link contract (`"../" + slug + "/"`, verbatim body); `familyurl(slug)` survives any mount point without trusting a build constant.
- `tests/design.test.ts` — 12 design-contract cases: the ember `#e8563f` as the one signal (mark story `#f4694f`), zero banned hue (`#3B82F6` / `#2563EB` / `#F97316`), zero pill (no `999px`, no `--r-pill`), zero `transition: all`, zero `scale(0)` entries, the font triad (Bricolage Grotesque / Outfit / JetBrains Mono), the source-face entry, the reduced-motion hard stop, tabular numerals, the landing logo discipline (`data-landing`), the sticky-footer law and the honest page set of `devthink.toml`.

## Entry face and `restore:entry`

`index.html` is kept permanently on the SOURCE face: `./App.tsx` script, `./favicon.svg`, `./manifest.webmanifest` and the font triad `<link>`. The Vite build emits hashed bundles (`index-*.js`, `index-*.css`, `favicon-*.svg`, `manifest-*.webmanifest`…) beside it for the pages workflow — every family is barred by `.gitignore`, so the tree keeps the source face only. After a local build, run:

```bash
npm run restore:entry
```

The script is a GUARD, not a blind checkout: if the working tree already rides the source face it is a no-op; if `HEAD` still carries a pre-triad (hashed or triad-less) face it REFUSES with exit 1 — it never revives a stale face over the fix. Land the source-face commit first, and from then on the guard restores the canonical face after any local build.
