# Releases × Assets × GTX Spec

> The release law of the house: one tag, one release for the family, assets per app
> inside it. The gate closes only at 300+ assets, the Brave extension in the assets,
> and the family 100% functional. Eighty assets per app is the target.

## 1. The five distribution zips per app

```text
<app>.web.<version>.zip              the web build (vite dist)
<app>.next.personalizado.<v>.zip     next without src/, app/ bridge at the root
<app>.next.zai.<v>.zip               skill gateway + prisma schema + DEPLOY.md (z.ai)
<app>.next.fifty.<v>.zip             fifty: banned folders, deploy reads the root
<app>.next.normal.<v>.zip            next with free folders
order of use: personalizado → zai → fifty → normal
rule: never a next folder in the repository — only zips in the release assets
```

## 2. The eighty-assets shape (per app)

- Binaries: dmg (mac intel + arm), exe (win64 + arm), deb, rpm, AppImage (linux
  x64 + arm) — 8 legs.
- The browser extension (MV3) — the Brave extension is the gate asset.
- Containers: the GHCR image per app (immutable image ≠ UUID instance).
- tar.xz -9e + Brotli of the web core; WASM cores (versawase/katexis) via
  esbuild + javy quickjs ride the tarball.
- The five next zips of section 1.
- ISO for the OS leg: `devthink-v<version>-install.iso` via xorriso (tar.xz + npm
  tarball + install.sh/ps1).
- SHA256SUMS umbrella generated on the runner scanning `release-*` artifacts — never
  a hardcoded checksum in a workflow.
- Release gradual: lanes publish per app as each one finishes, without waiting for
  the set.

## 3. Triggers and workflow rules

- Release triggers on change of `package.json`, `.gitignore` or `CHANGELOG.md`.
- Workflows are YML only (CJS/TS never; TOML/JSON as exception), self-contained,
  one responsibility each, actions pinned by TAG (never SHA), commits under iakadion.
- The auto-tag lane reads the app package.json (devthink), not the root envelope.
- Vitest is the test runner the CI accepts (node:test gets rejected — 2.0.86 lesson).
- pnpm 12: `allowBuilds` in pnpm-workspace.yaml (not onlyBuiltDependencies).
- Dependency age: npm 7 days, bun/pnpm/uv 3 days; allowlist only for AI SDKs,
  toolchains and browser binaries; triple mirror dependencies=devDependencies=
  overrides with `$package` self-reference.

## 4. Envelopes (the public packages)

- npm `@wenathlan/<app>` (devthink, cadria, debonair, stealhead, argan), Maven,
  NuGet, gemspec, Java envelopes and ghcr images per app.
- Licenses: GPL-3.0-only (saddle, devthink, stealhead) / MIT (argan, debonair,
  cadria, getry).
- The four clones (vault, forge, foundry, getry) publish the library but never
  distribute the clone itself: no binary in their assets — the deployable clone is
  the zips of section 1 only.

## 5. GTX translation (the gl module)

```text
endpoint  https://translate.googleapis.com/...translate_a/single
          client=gtx, sl=auto, tl=<chosen>
transport batches with a marker; answers return in order; cache per person with a
          versioned key; originals preserved in a WeakMap (DOM untouched)
boot      initautotranslate() lives in the theme anchor (Sol.tsx); the observer arms
          ONLY when a saved choice exists; currentlang() defaults to "en"
copy      technical-direct tone, sentence case headings, no marketing verbs, same
          paragraph count, JSX markup preserved, final grep proves zero pt-BR left
never     translate Storage/Working Set/Runner, VHD/FUSE/VRAM, class names, the
          language <option> labels; docs/ and tests/ stay untranslated
```

## 6. Mimetypes registry (recovered)

- `docs/mimetypes.txt` — 28,583 lines, 5,584 types, Debian media-types format (the
  nginx scheme). Recovered from the allan blobs (added 11349cde, removed db641c69).
- It feeds the saddle rune and the Caddy layer as `web/data/mime-types.json`.
- Family VDR types: `application/vnd.vdr-stream+bin`,
  `application/vnd.vdr-instruction+json`, `application/vnd.vdr-block+bin`; headers
  X-VDR-Address / X-VDR-Origin-Node / X-VDR-Timestamp / X-VDR-Chunk-Index /
  X-VDR-Compression; slices 16-64MB → SHA-256 + gzip; magic-bytes validation;
  backend denylist (.db/.sqlite/.log/fonts/.ts never served).
- 90+ HTTPS protocols carry the platform; the browser of the person only renders.

## 7. Corpus references for the competitor campaign

- `docs/corpusgithublinks.txt` — 16,511 unique GitHub links extracted from the
  allan corpus (neodocs + temp + neodevthink; one from commit messages).
- Clones for study land in `allan/docs/temp/` (never inside devthink); competitor
  PROJECTS are studied and rewritten as native TS at the app root; published
  frameworks may become `@wenathlan/*` dependencies.
