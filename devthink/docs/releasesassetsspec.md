# Releases × Assets × GTX Spec

> The release law of the house: one tag, one release for the family, assets per app
> inside it. The gate closes only at 1000+ assets (the thousand asset ladder — the
> owner order "os assets não passam 1000" wins over the old 300+ / 500 laws), the
> Brave extension in the assets, and the family 100% functional. One hundred three
> assets per app is the floor the census pins (1131 across the eleven).

## 0. The asset census (the thousand plus law)

The deterministic census every release-triggered lane answers, derived from the
workflow matrices by `test/publishlanes.test.ts` (the release notes carry the same
table through the asset census section the notes generator renders):

| Axis | Product | Assets |
| --- | --- | ---: |
| The site and next archives | 11 apps × 15 forms (5 shapes, each tar.xz + brotli + zip) | 165 |
| The registry and provenance seats | 11 apps × 7 seats (source, sources jar, javadoc jar, sbom pair, attestations, checksum) | 77 |
| The per-arch container seats | 8 site homes × 7 arch legs × 3 records (save + sha + manifest) | 168 |
| The family envelopes | 10 sibling tarballs the release ladder packs | 10 |
| The os lanes | 13 base assets + sbom + attestations + iso + wasm + manifest + sums | 19 |
| The per-channel checksum umbrellas | 11 distribution channels with staged assets | 11 |
| The publish mirror metadata ladder | 11 apps × 23 metadata assets + 7 family reports | 260 |
| The publish mirror family seats | 9 container archives + 10 gradle sets + 10 go sets | 97 |
| The desktop lane | 9 member apps × 28 platform assets | 252 |
| The mobile lane | 9 member apps × 8 android assets | 72 |
| **The census** | | **1131** |

Every asset is a real build product derived from the tagged tree — never a
placeholder, never a filler file. The per-arch container seats walk the seven
non-amd64 legs of the eight-arch runtime index (the amd64 leg answers the
single-arch save the publish mirror attaches); the engine containers (devthink,
saddle, vault) answer their registry index lanes. The maven classifiers carry the
tracked sources and the javadoc-tool HTML; the sbom pair answers in the cyclonedx
and the spdx 2.3 grammars; the per-app and per-channel umbrellas answer beside the
release-level SHA256SUMS.

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

Every zip answers beside its `tar.xz` twin (maximum xz -9e) and the brotli
quality 11 overlay of the tar — fifteen archive forms per application.

## 2. The per-app seat shape (the eighty-assets floor the census exceeded)

- Binaries: dmg (mac intel + arm), exe (win64 + arm), deb, rpm, AppImage (linux
  x64 + arm) — 8 legs.
- The browser extension (MV3) — the Brave extension is the gate asset.
- Containers: the GHCR image per app (immutable image ≠ UUID instance) beside the
  per-arch docker save seats of section 0 (7 non-amd64 legs × save + sha + manifest).
- tar.xz -9e + Brotli + zip twin of the web core; WASM cores (versawase/katexis) via
  esbuild + javy quickjs ride the tarball.
- The five next zips of section 1.
- The registry seats: the source snapshot (git archive, xz -9e), the maven sources
  and javadoc classifier jars, the sbom pair (cyclonedx + spdx 2.3), the
  attestations record and the per-app checksum umbrella.
- ISO for the OS leg: `devthink-v<version>-install.iso` via xorriso (tar.xz + npm
  tarball + install.sh/ps1).
- SHA256SUMS umbrella generated on the runner scanning `release-*` artifacts — never
  a hardcoded checksum in a workflow — beside the per-channel umbrellas.
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
          language <option> labels; docs/ and test/ stay untranslated
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
