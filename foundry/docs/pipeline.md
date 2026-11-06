# foundry pipeline

foundry is the complete deployable clone of the devthink family pipeline: one unit that runs and stores — the sandbox floor beside the network database. The engine lives in saddle and the storage mechanism lives in vault; foundry owns only the surface records and the page models. Every rehearsal is deterministic (mulberry32): the same seed answers the same data in node and in the browser.

## overview

- package `@wenathlan/foundry` — the e2b and docker clone interface of the family: it drives sandboxes and images while the engine lives in saddle (`package.json`).
- layout: pure logic as loose `.ts` files at the app root, the ui in `sol/` (one folder per page), the vitest suite in `test/`, this documentation in `docs/` (the house tree law: no `src/`).
- ownership law: the state machine, the mode ladder, the route catalog, the storage lane, the label store and the shared helpers answer from the published library specifiers of saddle and vault — never duplicated inside the app. The local `api.ts`, `runner.ts` and `utils.ts` are ports that re-export.
- every page rehearsal is seeded and honest: the seed is shown on the page, every refusal is a string, no number is invented.
- builds as a static vite bundle that answers any deploy root (workers, netlify, vercel — publish `.`), with the router base riding the build declaration.

## module inventory

- `sandbox.ts` — the sandbox page model: the `Sandbox` record, `drive` (warm / heat / cool / freeze), `step`, `mulberry32`, `seedHerd`, `herdCensus`. The ladder itself (`SANDBOX_STATES`, `canTransition`, `refusalFor`) is imported from `@wenathlan/saddle/sandbox`.
- `graphplan.ts` — the pipeline plan engine: the canonical `PIPELINE` plan, topological staging (`planstages`, `plandepth`), validation (`planvalid`), projection and layout (`plangraphof`, `planpositions`, `planbounds`), the deterministic rehearsal (`planrehearsal`, `planfailindex`) and the tallies (`plantally`, `planprogress`, `planopensteps`).
- `artifact.ts` — the checksum engine: `utf8Bytes`, `fnv1a`, `fnv1aHex` (8 hex), `artifactIdentity` (`name · ext · bytes · payload`), `sealArtifact`, `verifyArtifact`, `artifactLine`, `manifest`, `seedArtifacts`.
- `imagestore.ts` — the image format engine: `FORMATS` (tzst / targz / tarxz), `convertPlan`, `estimateSize`, `pourOrder`, `seedImages`, `formatBytes`, `formatOf`, `formatFromExt`.
- `db.ts` — the sqlite runtime on the vault storage lane (`openStorageLane`, default file `./foundry.db`): the correlated tables, the parameterized helpers (`execute`, `queryAll`, `queryOne`) and the onboarding / label row functions.
- `labels.ts` — the copy law: `LABEL_MANIFEST` (revision 3, `page.widget.key` paths) with `label`, `labelfill` and `seedLabels` riding the vault labelstore; a hardcoded string inside a widget is a defect.
- `onboardingstate.ts` — the first-run accessor and the only writer of the intro / onboarding seen flags: db truth over the platform gateway, offline cache mirror in localstorage.
- `family.ts` / `familyurl.ts` — the spec §12 family accent table (nine siblings plus foundry) and the `../slug/` url resolution of the sibling deploy units.
- `sandboxmodality.ts` — the workload lane declaration: `pipeline-graph` and `image-artifact`; the lane seat resolution behind the `FOUNDRY_SANDBOX_LANE` env name.
- `runner.ts`, `api.ts`, `utils.ts` — ports: re-export `@wenathlan/saddle/modes`, `@wenathlan/vault/routes` and `@wenathlan/vault/utils`.
- `hometypes.ts` — the `HomeProps` contract of the landing.
- `schema.prisma` — the documentation of record for the data model; the runtime mirrors the same columns in its boot ddl.

## data layer

- the lane: `openStorageLane` from `@wenathlan/vault/storagelane` — better-sqlite3 bootstrap, pragma ladder `busy_timeout = 30000` → `journal_mode = WAL` → `foreign_keys = ON`, every statement prepared and bound, no sql ever assembled by string concatenation.
- boot ddl (idempotent `ensureSchema` on first open — the tables exist after the first open, always):
  - `keys` — id, scope (default `store`), payload, createdAt.
  - `payloads` — id, keyId, bytes blob, size, createdAt.
  - `onboarding_states` — visitor (unique), introseen, onboardingseen, updatedAt.
  - `labels` — id, text, revision, updatedAt, translated.
- `schema.prisma` carries the models `Sandbox`, `Image` and `OnboardingState` as the documentation of record; `drizzle.config.ts` rides `DATABASE_URL` (default `file:./foundry.db`).
- the label manifest is ingested at boot (`seedLabelRows`, best effort — a sealed store never blocks the boot); translated rows stay protected from the overwrite.
- the browser never imports `db.ts` (better-sqlite3 cannot ride the static bundle). The onboarding flags are served over the platform gateway: `GET` / `POST /api/v1/onboarding` on the base `VITE_ONBOARDING_URL` — https only, the host validated (localhost, loopback, private and reserved ranges are refused). localstorage `foundry.onboarding.seen` is a pure cache mirror; the visitor id rides `foundry.visitor.id`.

## sol subapps

- `sol/shell/Shell.tsx` — the one application window: full-bleed at the app url (the standalone law — the window chrome exists only inside the devthink os power clip), the page rail (home, sandboxes, images, artifacts), the family foot with one spec §12 accent dot per sibling, the theme flip (light default, in memory per document).
- `sol/sandboxes/sandboxes.tsx` — the machine room: the herd of 7 from `HERD_SEED` 620221; the census band (total, the state ladder, warm share); per-row machine buttons warm / heat / cool / freeze / step; the honest refusal readout (`role="alert"`); reseed.
- `sol/images/images.tsx` — the herd shelf: 6 images from `SHELF_SEED` 314159; per row the tar stream beside the sealed estimate; the conversion plan with from / to chip selectors (default tzst → tarxz) and the 1 GB estimate line; the pour order footnote; reseed.
- `sol/artifacts/artifacts.tsx` — the packaging line: the shelf from `LINE_SEED` 804613 plus sealed drafts; the stage graph (`GraphPanel`) rehearsing `PIPELINE` on the same seed and tick (one run, two views); the seal-a-draft form (name + payload digest, bytes `4096 + payload.length`, sealed as tzst); the manifest readout; walk / rerun.
- `sol/home/home.tsx` — the landing behind the entry gate: the forge console (draft only — the staging surface stores nothing), the format shelf, the run / store / clone capability steps, the family row footer and the meta-quad.
- `sol/intro`, `sol/onboarding`, `sol/notfound` — the entry flow: the splash (brand mark, ~1.6 s hold, 0.8 s slide-up) hands directly to the three-beat onboarding walk; the 404 answer and the catch-all.
- `sol/wingets/` — the shared widgets behind the single `index.ts` surface: `GraphPanel`, `Entry`, `EntryGate`, `Tabs`, `BrandMark`, `EmptyState`.

## saddle and vault integration

- `@wenathlan/saddle/sandbox` — the lifecycle machine (the engine ownership law): states cold / warm / hot; transitions `cold→warm`, `warm→hot|cold`, `hot→warm|cold`; honest refusals (`refusalFor`); the action guard table warm / heat / cool / freeze → warm / hot / cold / cold. foundry binds it and keeps the page-model projection only.
- `@wenathlan/saddle/modes` — the runner-mode ladder, re-exported by `runner.ts`.
- `@wenathlan/saddle/workloadlaw` — the engine lane catalog the `sandboxmodality.ts` mirror is pinned against in the tests (byte-for-byte lockstep through the library bridge).
- `@wenathlan/vault/routes` — the route catalog of the vault http surface, re-exported by `api.ts`; the route strings are never duplicated inside foundry.
- `@wenathlan/vault/storagelane` — the shared sqlite mechanism: the lane factory, the pragma ladder, the parameterized helpers; drivers `better-sqlite3` | `node:sqlite` | `bun:sqlite`.
- `@wenathlan/vault/labelstore` — the copy store factory (`createLabelStore`): typed accessor, placeholder door, idempotent seed, protected translated rows, browser-safe by construction.
- `@wenathlan/vault/utils` — `splitwords`, re-exported by `utils.ts`.
- `vite.config.ts` resolves the specifiers to the monorepo sibling sources (`../vault/labelstore.ts`, `../vault/routes.ts`, `../vault/utils.ts`) until the published envelopes carry them.

## internal api surface

- route catalog (re-exported from `@wenathlan/vault/routes`): `health /api/health`, `uicopy /api/v1/ui/copy`, `signup /api/v1/auth/signup`, `signin /api/v1/auth/signin`, `databases /api/v1/databases`, `query /api/v1/query`, `protocols /api/v1/protocols`, `projects /api/v1/storage/projects`, `objects /api/v1/storage/objects`, `quota /api/v1/storage/quota`, `usage /api/v1/storage/usage`, `sweep /api/v1/storage/sweep`. foundry runs no server route of its own.
- platform gateway (browser accessor): `GET` / `POST /api/v1/onboarding` — the first-run flags, host-validated https.
- module surfaces the pages and tests consume:
  - sandbox: `SANDBOX_STATES`, `canTransition`, `refusalFor`, `drive`, `step`, `seedHerd`, `herdCensus`.
  - graphplan: `PLAN_STATES`, `PIPELINE`, `planstages`, `plandepth`, `planvalid`, `plangraphof`, `planpositions`, `planbounds`, `planrehearsal`, `planfailindex`, `planprogress`, `plantally`, `planopensteps`.
  - artifact: `fnv1a`, `fnv1aHex`, `artifactIdentity`, `sealArtifact`, `verifyArtifact`, `artifactLine`, `manifest`, `seedArtifacts`.
  - imagestore: `FORMATS`, `formatOf`, `formatFromExt`, `convertPlan`, `estimateSize`, `pourOrder`, `seedImages`, `formatBytes`.
  - db: `tables`, `db`, `execute`, `queryAll`, `queryOne`, `ensureSchema`, `getOnboardingState`, `setOnboardingStage`, `saveLabel`, `readLabel`, `readAllLabels`, `seedLabelRows`.
