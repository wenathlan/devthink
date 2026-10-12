# cadria

Video and image player, editor and studio. Absorbs iukka (player) and create (editor). Houses the versawase engine at the root; imports katexis from debonair and gateway, AI and workflow from devthink. This folder receives the cadria application per the complete tree.

---

# The Sol theme

# Cadria Sol

Cadria is the video, image and 3D studio of the DevThink family, running on the versawase engine. This Sol theme is the studio's web surface — a Vite + React SPA with the intro (the public presentation), and the platform chrome carrying the home, player, studio, editor (the timeline), gallery and settings routes. Projects, assets and render jobs ride the same sqlite database that `schema.prisma` and `drizzle.config.ts` describe.

```bash
pnpm install
pnpm dev
```

## Tests

The suite rides the node built-in runner — zero extra dependencies, exactly as the test headers document:

```bash
pnpm test        # node --test "tests/*.test.ts" — the engine, the algebra, the view models
pnpm typecheck   # tsc --noEmit
```

## Build hygiene (read before building locally)

The vite emit lands in the app root (`outDir "."` — the deploy contract of
netlify/vercel is `publish "."`), so a local build rewrites `index.html` into
its hashed face and drops the hashed bundles beside the source. The
`.gitignore` keeps every hashed artifact (`index-*.js`, `index-*.css`,
`favicon-*.svg`, `manifest-*.webmanifest`) out of the tree — after building
locally, restore the source entry with:

```bash
pnpm restore:entry
```

`restore:entry` is guarded: it refuses to run while HEAD's `index.html` is
still a hashed face (the source-face fix not landed yet) — a premature
restore would clobber the uncommitted fix, so the script checks both the
working tree and HEAD and answers with a clear refusal instead of touching
the file.

The deploy hosts (pages workflow, netlify, vercel) rewrite the entry inside
their own builds, so the committed `index.html` always stays the source face
(`./App.tsx` + the canonical `favicon.svg` / `manifest.webmanifest`).
