# archaeology restore report

read-only git archaeology of wenathlan/devthink. reference for "current" is `origin/main` = `4f25ec04ccbfb86f69ba3de49f21508d292f5e68` (2026-10-24, "chore(family): the freeze artifacts re-stamp at 2.0.135 (#59)"). all claims carry a commit sha.

## summary

- commit count on origin/main: **704** (`git rev-list --count origin/main`).
- era refs: `v2.0.133` = `883797878b73e0e0e84fcb402c351c66b91b6242` (2026-10-21, "chore: land the automated maintenance rung v2.0.133"), `v2.0.134` = `4e2f210c8c20aa7d73676dbb86dc6a3f66c3a249` (2026-10-22). tags exist; the CHANGELOG entry "## 2.0.134" at that sha confirms the rung.
- tree size: v2.0.133 = **1993** files, v2.0.134 = **2001** files, origin/main = **1846** files. window v2.0.134..origin/main = 79 commits: 374 paths disappear, 219 appear, net -155.
- of the 374 disappearing paths: **227 are docs files** (devthink 122, saddle 94, debonair 6, getry 2, plus forge/foundry/vault `docs/.gitkeep`), 2 are `devthink/biome.json` and `saddle/biome.json` (renamed to `biome.jsonc`), and **147 are `Sol/<area>/<name>.tsx` widget files that were all flattened into `Sol/widgets/<area>.<name>.tsx`** — content-verified renames (e.g. `devthink/Sol/chat/chatbody.tsx` @ v2.0.134, 1710 lines -> `devthink/Sol/widgets/chat.body.tsx` @ main, 1716 lines), not losses.
- the single largest removal event between v2.0.134 and main is commit `00b66b8334791e5a6a170345c0d081d6d1a18ea9` (2026-10-23, "the wave of the official documents lands — the full reading, the docs purge, ..."): it deletes **242 files** (devthink/docs 141, saddle/docs 93, debonair/docs 6, getry/docs 2).
- earlier removals still visible in history: `skills/` = **1071 files** deleted at `fb317a96a2c7ccff654f09b165ecf0ad14468076` (2026-10-12, "chore(repo): the scaffold skills leave the tree and the local scratch stays out"); `saddle/assets/` = 4 webp images deleted at `e31176f2c83c72adcbd783ae7aa24cec4dcc6c62` (2026-10-03). top-level `web/` (52 files) and `tests/` (332 files) were NOT lost: they moved into `devthink/` at `9352e265bf42419885f42a1c166f4fc843dab9bb` (release 2.0.30, 2026-09-26; e.g. `web/gateway.ts` -> `devthink/Sol/gateway.ts`, `tests/agentcert.test.ts` -> `devthink/tests/agentcert.test.ts`). `saddle/web/` (86 files) was absorbed into `saddle/Sol/` at `3f33b6c900a379831a5c9d014fe5cd6d6a4725d0` (2026-09-30; e.g. `saddle/web/Console/ApiBadge.tsx` -> `saddle/Sol/console/ApiBadge.tsx`, still present at v2.0.134).
- "more than 400 assets" check: at v2.0.134 the repo carried 282 `.md` + 31 `.txt` + 24 `.svg` + 11 `.png` + 20 `.example` + 20 `.gitkeep` + 7 `.zip` + 1 `.gpg` + 1 `.ico` = **397 non-code static/doc files**; at origin/main that class is down to 69 md + 25 txt + 24 svg + 11 png + 20 example + 17 gitkeep + 7 zip + 1 gpg + 1 ico = **175**. the docs corpus (`*/docs/`) alone went **283 -> 57**. binary assets (png/svg/zip) are unchanged; the shrinkage is entirely documentation and reference material.
- dependencies: **zero losses**. union of dependencies/devDependencies across commits 660-704 (samples 2f79c81f, 8cbd2b76, 83e8c708, 30734f5c, 2c7289fc, 4f25ec04) contains 125 entries, all still present at main; per-app diff v2.0.133 vs main shows no removals and one addition (`devthink` gained `motion@^12.43.0`). deeper tags v2.0.100/v2.0.120/v2.0.130 also show zero losses.
- configs: **zero entries/options lost**. tsconfig, vite.config, wrangler.toml, netlify.toml, vercel.json diffs v2.0.134 -> main are purely additive (version stamps 2.0.134 -> 2.0.135, security overrides added). main actually ADDED `Dockerfile` to cobaia, forge, foundry, getry, stealthhead, vault at `4441d87f5e6317a1cda5040eb3965dcd6c3cda44` (2026-10-23).
- workflows: the 10 current workflow files are at or near their richest historical versions; every deleted workflow file's logic was absorbed into the consolidated files (mapping below with shas). no restoration is required for job coverage; the one genuinely replaced feature is the pages.yml inline landing page.

## workflow restorations

current files at origin/main (all under `.github/workflows/`): ci.yml (431 lines, richest ever), verify.yml (491, richest ever), release.yml (946, richest ever), publish.yml (4919, richest ever), pages.yml (383), security.yml (676), maintenance.yml (538, richest ever), family-desktop.yml (356, richest ever), family-mobile.yml (501, richest ever), workflowlint.yml (51, richest ever), plus actionlint-config.cfg and labeler-config.cfg.

workflow files that existed historically and are deleted today, with the sha of their last full version and where the logic went:

| deleted file | last full sha | lines | absorbed into (verified job id) |
| --- | --- | --- | --- |
| configs.yml | 4441d87f | 39 | ci.yml `configparity` (deleted 6e5b2c26 "the workflows fold into one correlated battery", 2026-10-23) |
| familyrelease.yml | dc32b497 | 144 | release.yml `auto-tag` + `family` (deleted 155126d3, 2026-10-01) |
| nuget-cleanup.yml | 871d8921 | 29 | NOT absorbed — one-shot dispatch that deleted retired `pro.devthink.*` nuget envelopes (deleted 367abd9f, 2026-10-03); purpose is spent |
| labeler.yml | c4edb406 | 27 | maintenance.yml `label` (deleted 9986657c, 2026-10-01) |
| webpack.yml | 9065bfc1 | 55 | ci.yml `webpack` (deleted 9986657c) |
| saddle-extension.yml | 4c1c956f | 122 | publish.yml `saddle-extension` (deleted 9986657c) |
| saddle-targets.yml | 4c1c956f | 143 | publish.yml `saddle-target-plans` (deleted 9986657c) |
| saddle-publishghcrvhe.yml | c4edb406 | 693 | publish.yml `saddle-vhe-*` (validate/resolve/scan/publish/verify/cleanup) (deleted 9986657c) |
| buildextension.yml | da7ce199 | 167 | release.yml `vsix` + `firefox` jobs (deleted 66920931, 2026-09-11) |
| compatibility.yml | f1ac8ffc | 185 | ci.yml `cli-runtime`, `lts-typecheck`, `static-web` — identical job ids (deleted 66920931) |
| cachecleanup.yml | 60164b2c | 135 | maintenance.yml `cachecleanup` (deleted 66920931) |
| codeql.yml | 60164b2c | 79 | security.yml `analyze`; its wednesday cron `25 4 * * 3` is kept verbatim in security.yml's `on:` (deleted 66920931) |
| scorecard.yml | 60164b2c | 61 | security.yml `scorecard`; monday cron `17 3 * * 1` kept (deleted 66920931) |
| securitypolicy.yml | 60164b2c | 57 | security.yml step "Assert the supported line in SECURITY.md" (line 640) (deleted 66920931) |
| releasesums.yml | 327d427d | 140 | publish.yml `sums` (deleted 66920931) |
| targets.yml | 60164b2c | 236 | publish.yml `target-plans` (deleted 66920931) |
| desktop.yml | 87981cda | 604 | family-desktop.yml `desktop` + publish.yml `desktop`/`desktop-tauri` (deleted 66920931) |
| mobile.yml | 163ae41a | 711 | family-mobile.yml `android`/`ios` + publish.yml `android`/`ios`/`ios-simulator` (deleted 66920931) |
| publishghcr.yml | a4ecafcf | 336 | publish.yml `ghcr` + `family-ghcr` (deleted 66920931) |
| publishnpmjs.yml | a4ecafcf | 180 | publish.yml `npmjs` + `family-npmjs` (deleted 66920931) |
| publishgithubnpm.yml | a4ecafcf | 164 | publish.yml `githubnpm` + `family-githubnpm` (deleted 66920931) |
| publishmaven.yml | 2656e07c | 194 | publish.yml `detect-maven`/`maven`/`family-maven` (deleted 66920931) |
| publishnuget.yml | 2656e07c | 184 | publish.yml `detect-nuget`/`nuget`/`family-nuget` (deleted 66920931) |
| publishrubygems.yml | 60164b2c | 225 | publish.yml `rubygems-resolve`/`rubygems`/`family-rubygems` (deleted 66920931) |
| packagecleanup.yml | 327d427d | 66 | maintenance.yml `retire` (job id identical) (deleted 66920931) |
| container.yml | 60164b2c | 130 | publish.yml `container` (deleted 66920931) |
| misc early files (.github.ci.yml, action.yml, action2.yml, ci2.yml, compose.yml, dependabot.yml, dependency-review.yml, github.ci.yml, pages1.yml, "release (2).yml", uka-tests.yml, .persist_test) | 15a04cbe / 8f6e8990 / 83fec5a1 | — | import-era scratch and duplicates, no unique logic (2026-08-19 / 2026-10-10) |

the only historical feature with no current counterpart:

1. **pages.yml "Write the site landing page" step** — last existed at `c43de132` (and `6aded9a1`, 584-line file). the `assemble` job carried a ~230-line inline HTML landing page (`_site/index.html`, the "family console" slate/ember theme with Space Grotesk + IBM Plex Mono, ten app links). replaced by the "Write the deep-link dispatcher" `_site/404.html` step when "the OS answers at the site root" (`f6e2fce9`, then `e8691b17`, `b0d40ea1`). fragment of the lost feature (from `git show c43de132:.github/workflows/pages.yml`, assemble job):

```yaml
      - name: Write the site landing page
        # GitHub serves one Pages site per repository, so the site root
        # answers the navigation page the owner doctrine asks for ...
        run: |
          set -euo pipefail
          cat > _site/index.html <<'LANDING_EOF'
          <!doctype html>
          <html lang="en">
            <head> ... --dt-base: #17191f; --dt-orange: #ff5f00; ...
```

restoring it would conflict with the current root-OS routing; if wanted, restore as a separate "family console" page (e.g. `_site/family/index.html`) rather than replacing `_site/index.html`.

2. **configs.yml as a standalone gate** (sha 4441d87f) — restored equivalently as ci.yml `configparity`; the standalone file itself is gone. no action needed unless the owner wants the dedicated lane back (its full 39-line yaml is recoverable from 4441d87f).

## asset restorations

per-era counts (files in tree):

| corpus | v2.0.133 | v2.0.134 | origin/main |
| --- | --- | --- | --- |
| whole tree | 1993 | 2001 | 1846 |
| `*/docs/` corpus | 279 | 283 | 57 |
| markdown (all) | 278 | 282 | 69 |
| devthink/docs | 153 | 157 | 39 |
| saddle/docs | 106 | 106 | 12 |
| debonair/docs | 7 | 7 | 0 |
| getry/docs | 2 | 2 | 0 |
| devthink/tests | 369 | 369 | 374 |
| devthink/tests/artifacts | 23 | 23 | 23 |
| svg / png / zip | 24/11/7 | 24/11/7 | 24/11/7 |

restoration targets, ordered by size:

1. **devthink/docs purged set — 122 files missing at main vs v2.0.134** (141 deleted by `00b66b83` itself). full list recoverable with `git diff --diff-filter=D --name-only v2.0.134 origin/main -- devthink/docs/`. includes the whole numbered architecture series (02.browseragentbaseline, 03.extensionarchitecture, 03.chromiumextensionarchitecture, 04.publicprojectcatalog, 04.releasepipeline, 05.agentalgorithms, 06.userstorecatalog, 07.featureflowmatrix, 08.artifactinventory, 09.artifactstaticmetrics, 10.artifacttransportmatrix, 14.executionenvironments, 14.servercontract, 15.consentmodel, 16.mcpserver, 16.securitymodel, 17.memorymodel, 17.nativebridge, 18.interfacesurfaces, 19.distribution, 19.interfaceinventory, 20.workflowlibrary, 21.librarymodes, 22.performancemodel, 23.schedulingandbudgets, 24.gatewayguide, 25.waveplan), the module references (`archive.ts.md`, `auth.ts.md`, `conversations.ts.md`, `deployment.ts.md`, `gateway.ts.md`, `identity.ts.md`, `providers.ts.md`, `release.ts.md`, `research.ts.md`, `storage.ts.md`, `streaming.ts.md`, `testing.ts.md`, `todo.ts.md`, `web.ts.md`, `web.parity.ts.md`, `workflows.ts.md`, `other.ts.md`), the antigravity subfolder (BYPASS, CHECKLIST, FLUXOGRAMA, MODELS, README, RESEARCH, WAVES, plans/15.merge), v1.1.11-1.1.16 brief/plan/matrix docs, and reference corpora (corpus.all.links.txt, corpus.github.links.txt, inputextensionids.txt, inputrequirements.txt, mimetypes.txt). evidence sha: last present at `4e2f210c` (v2.0.134), deleted at `00b66b83`.
2. **saddle/docs purged set — 94 files missing at main** (93 deleted by `00b66b83`): the 1.8.x engineering history (architecture, containerplatforms, documentmap, flatbuildresearch, licenseaudit, mobileconversionresearch, nativeidentityresearch, releasenotes 1.8.12-1.8.19, reorganization, repo-research/repo-synthesis 1.8.16/1.8.21, scanningresearch, securityresearch, signingresearch, tauri-glib-risk, toolchainresearch, todo-1.8.x), plus releaseassets.md, release18x notes, workflowimprovements-2026-08-19.md, CONVERSA.txt and ~60 more. evidence: present at `4e2f210c`, deleted at `00b66b83`.
3. **debonair/docs — 6 files** (competitor-dissection.md, enginemap.md, planning.ladder.md, planning.pipeline.md, planning.v2.28-completo.md, planning.versions.2.0.97-3.0.md), deleted at `00b66b83`.
4. **getry/docs — 2 files** (docs/skills/gateway.md, docs/skills/gateway-deploy.md), deleted at `00b66b83`. note `devthink/docs/gateway-deploy.sh` still exists at main.
5. **saddle/assets — 4 webp images** (saddle-browser-trace.webp, saddle-hero-bridge.webp, saddle-mark.webp, saddle-runtime-map.webp), deleted at `e31176f2` ("the media areas ride the catalog instead of asset folders"). last full tree: `git ls-tree e31176f2^ --name-only saddle/assets/`.
6. **skills/ — 1071 files** (design 561, ui-ux-pro-max 56, pdf 38, docx 35, quiz-mastery 29, xlsx 21, skill-creator 18, experiment-suite 18, resume-builder 13, gaokao-* ~40, aminer-* ~20, plus ~40 more kits), deleted at `fb317a96` (2026-10-12). caution: the root `.gitignore` at origin/main carries the explicit rule "# the scaffold skills folder never enters the repository (user rule)" — restoring this tree would contradict a standing owner rule; last full copy: `git ls-tree fb317a96^ -r --name-only skills/`.
7. `forge/docs/.gitkeep`, `foundry/docs/.gitkeep`, `vault/docs/.gitkeep` — placeholders deleted at `00b66b83`; restore only if those docs dirs are restored.

not restorations (verified moves, do not re-add): 147 `Sol/<area>/<name>.tsx` files -> `Sol/widgets/<area>.<name>.tsx` (renames with edits; verify pair examples: content hash equal or near-equal line counts); `web/` and top-level `tests/` -> `devthink/` at `9352e265`; `saddle/web/` -> `saddle/Sol/` at `3f33b6c9`; `getry/public/` (2 files, absorbed at `c4edb406`); top-level `tests/artifacts` (18 files, era of 2.0.28/2.0.29, folded into `devthink/tests/artifacts`).

## dependency restorations

**none required.** evidence:

- window commits 660-704 (`git rev-list --reverse origin/main | sed -n '660,710p'` — the range holds 45 commits, 2026-10-23..24, since main has 704 total). sampled 6 commits spread across it (2f79c81f, 8cbd2b76, 83e8c708, 30734f5c, 2c7289fc, 4f25ec04), parsed all 12 package.json files per commit (11 apps + root): the union of dependencies/devDependencies/optionalDependencies/peerDependencies has **125 entries; 0 are missing from every current package.json**.
- per-app v2.0.133 vs origin/main: **0 lost, 0 gained for every app except devthink, which gained `dependencies: motion@^12.43.0`**.
- deeper eras v2.0.100 / v2.0.120 / v2.0.130 for devthink/saddle/argan/vault: 0 losses.
- package.json scripts: historic union for devthink (48 script names ever, 48 current) and saddle (54 ever, 54 current) — **no script ever existed that is gone today**; devthink gained `test:runtime` after v2.0.133.

## config restorations

**no config entries/options/scripts/stages were removed.** evidence per file class (v2.0.134 vs origin/main):

- tsconfig.json / tsconfig.node.json / vite.config.ts / wrangler.toml / netlify.toml / vercel.json: diffs contain **zero removed lines** in any app; devthink/vite.config.ts (192 lines), devthink/netlify.toml (71), saddle/tsconfig.json (34) are at their richest-ever versions.
- pnpm-workspace.yaml per app: only additive changes (security overrides `undici ^7.30.1`, `zod ^4.6.7`, `follow-redirects ^1.16.1`, `fast-uri ^3.1.9`, `body-parser ^2.4.0` and `minimumReleaseAgeExclude` added); the only removed line is the cosmetic comment `# application policy: <app>` (commits f7901263 / 520f2ac6 era).
- Dockerfile per app: only the version stamp changed (`ARG <APP>_VERSION=2.0.134` -> `2.0.135`). main **added** Dockerfiles for cobaia, forge, foundry, getry, stealthhead, vault at `4441d87f`.
- docker-compose files: never existed anywhere in history (`git log --all -- '*docker-compose*'` is empty).
- biome: `devthink/biome.json` and `saddle/biome.json` deleted, replaced by `biome.jsonc` at `4441d87f` ("the biome baseline rides byte identical across the eleven apps"). semantic deltas to be aware of (not losses, but the only behavioral changes): schema 2.5.11 -> 2.5.15; `vcs.enabled: false -> true` (with `clientKind: git`, `useIgnoreFile: true`); saddle's bespoke explicit include-list (~55 named engine files: alternatives.ts, compute.ts, quantum.ts, virtualcpu.ts, ... plus boards.json, cores.json, gpus.json, processors.json, vm.config.json, virtualhardware.json) was replaced by the family glob `**/*.ts, **/*.tsx, **/*.js, **/*.mjs, **/*.cjs, **/*.css, **/*.json` with exclusions — coverage is strictly wider, but if the owner wants the old allow-list semantics they live at `git show v2.0.134:saddle/biome.json`.

## other removed features

- **dangling references at main**: 47 distinct `docs/<name>.md|.txt` references inside surviving files point at purged documents. carrying files (at origin/main): `devthink/CONTRIBUTING.md`, `devthink/docs/configuration.md`, `devthink/docs/todo.md`, `devthink/docs/01.extensionpermissions.md`, `devthink/docs/13.evolutionroadmap.md`. examples: `docs/16.mcpserver.md`, `docs/agentprotocol.md`, `docs/apifreeze.md`, `docs/14.servercontract.md`, `docs/24.gatewayguide.md`. restoring the purged docs (or redirecting these links) is required for the docs graph to be coherent again.
- **getry skills docs**: `getry/docs/skills/gateway.md` + `gateway-deploy.md` were getry's operator skill pages (distinct from the root `skills/` tree); gone with `00b66b83`.
- exported modules / source files: none lost in the v2.0.134 -> main window (the only non-docs, non-widget deletions are the two biome.json renames); widget renames are import-rewired (commit `4457dc935739465a7b8bb990061a0266d6e41170` "the os widgets wave lands the naming law ..." for devthink, `c09971ec942b86ed212b2c0642cbb43d710663a4` for saddle).
- `.github/COMMITSIGNING.md` + `.github/commitkey.asc` were ADDED at `00b66b83` (not a loss; listed so the direction of change is clear).

## prioritized restoration plan

1. **restore the purged docs corpus — highest value, safe.** additive restore from `v2.0.134` of: devthink/docs (122 files), saddle/docs (94), debonair/docs (6), getry/docs (2), and the three `docs/.gitkeep`. commands: `git checkout v2.0.134 -- devthink/docs saddle/docs debonair/docs getry/docs` then re-add any file the "official documents" doctrine intentionally kept (the 39 surviving devthink/docs and 12 saddle/docs files at main are a subset — the restore must not overwrite the newer versions of files that still exist, e.g. `devthink/docs/readme.md` at v2.0.134 is older than main's curated set: prefer copying into `docs/archive/` or skipping identical names). this alone fixes the 47 dangling references and returns ~224 files. no conflict with code, tests, or workflows.
2. **restore saddle/assets webp images — safe, tiny.** 4 files from `e31176f2^`; the docs that referenced them (`saddle/docs/releaseassets.md` etc.) come back with item 1.
3. **optional: standalone `.github/workflows/configs.yml`** from `4441d87f` — only if the owner wants the parity gate as its own lane again; current ci.yml `configparity` job already runs the same `devthink/tests/configparity.mjs` gate (added at `6e5b2c26`). safe but redundant.
4. **optional: pages.yml family landing page** from `c43de132` — restore as an additional page (`_site/family/index.html`), not as the site root; conflicts with the current root-OS dispatch design (`f6e2fce9`, `e8691b17`).
5. **do not restore without an explicit owner decision: `skills/` (1071 files)** — the deletion at `fb317a96` is backed by the standing ".gitignore user rule" (`skills/` line). restoring it would re-violate that rule; if the owner wants it back, the rule must be removed first.
6. **no action needed**: dependencies (nothing lost), per-app configs (nothing lost), package.json scripts (nothing lost), workflow job coverage (fully absorbed — see mapping table), the widget flattening (renames), `web/`//`tests/`/`saddle/web/` moves (absorbed), `nuget-cleanup.yml` (one-shot, purpose spent), import-era scratch workflows.
7. **conflict watch**: when restoring docs under their original names, keep the curated versions of the 39 surviving devthink/docs files; the biome baseline parity gate (`devthink/tests/configparity.mjs`, run by ci.yml) checks `biome.jsonc` byte-identity across apps, so do not reintroduce `biome.json` alongside `biome.jsonc` — the restore of item 1 touches only `docs/`, which the biome baseline excludes (`!**/docs`).
