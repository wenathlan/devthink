# forge runner

forge is the deployable clone of pure execution of the wenathlan family: it runs any binary through the saddle sandbox engine and keeps no network persistence. package `@wenathlan/forge` (v2.0.155). this document describes the real runner surface: the module inventory, the data layer, the sol pages, the saddle integration and the api surface.

## overview

- the app root carries the loose `.ts` logics (pure, testable engines); the `sol/` theme folder carries the whole ui.
- execution is delegated to the saddle engine boundary: a run asks for one of five runtime targets (the runner-mode ladder), the engine resolves the sandbox and returns the result — forge never re-implements the ladder.
- every floor engine (fleet, queue, graphplan, runstream) is deterministic: one integer seed plus a mulberry32 prng answers the same answer in node and in the browser, so the tests pin the pages line by line.
- the pages are honest rehearsals: the fleet, the queue and the log stream are seeded replays on the saddle engine boundary, never a live floor claim.

## module inventory (app root)

- `runner.ts` — the app seam to the engine: re-exports `runnermodes as modes` and the `RunnerMode` type from `@wenathlan/saddle/modes`. the five runtime targets are `full-virtual`, `runner`, `node-packages`, `docker`, `ghcr` — owned by saddle, never duplicated inside forge (the engine ownership law).
- `fleet.ts` — the runner fleet engine (testable core of the `/runs` page). runner states `idle → starting → busy → draining → offline` (`RUNNER_STATES`), a three-rung health ladder green/amber/red (`HEALTH_LADDER`) with pure thresholds (`RED_FAILURE_RATE = 0.2`, `AMBER_LOAD = 0.85`, `AMBER_FAILURE_RATE = 0.05`), the `mulberry32` seeded prng, `seedFleet(seed, count = 6)`, `healthRungOf`, `failureRate`, `fleetSummary` (state/health histograms, healthy verdict = no red, average busy load), `fleetTick` (deterministic advance: busy runners may finish, idle may start, draining completes, offline stays until a human act) and `pickRunner` (the healthiest non-red runner of the requested mode, lowest rung then lowest load; `undefined` is an honest refusal).
- `queue.ts` — the run queue engine (testable core of the `/queue` page). priorities `express / normal / batch` (`QUEUE_PRIORITIES`, rank 0/1/2), `QueueItem { id, label, mode, priority, seq, enqueuedAt }`, `queueOrder` (priority first, fifo by `seq` inside the lane), `enqueue` (append-only, stamps the next monotonic seq), `cancel`, `dequeue` (pops the head of the serving order), `queueDepth`, `depthByPriority`, `positionOf`, `nextUp` and `queueFromSeed(seed, count = 6)` for the rehearsal queue.
- `graphplan.ts` — the run plan engine. the canonical `RUNPLAN` (`forge-run`): `muster` (stage) → `resolve` (gate, mode `full-virtual`) → `provision` (tool) → `execute` (tool) → `collect` (tool) → `seal` (sink). step states `pending / running / done / failed / skipped` (`PLAN_STATES`), topological staging (`planstages`, `plandepth`), validation (`planvalid`: duplicate ids, self wires, unknown steps, cycles), projection (`plangraphof`), layout (`planpositions`, `planbounds`), tallies (`plantally`, `planprogress`, `planstateissettled`) and the deterministic rehearsal (`planfailindex` — one roll in six rides red; `planrehearsal` — steps before the cursor settle done, the cursor runs, a red run strands the rest skipped).
- `runstream.ts` — the deterministic log stream engine (testable core of the `/logs` page). levels `info / warn / error`, `LogLine { t, level, text }`, `RunOutcome success / failed`. `runLogLines(seed, steps = 5)` replays a run: three boot lines (accept the run on the mode boundary, mount sandbox `full-virtual`, restore the working set `.tzst`), seeded build steps (warn chance ~0.22, at most one error, failure chance 0.25) and the outcome report. helpers: `logOutcome`, `linesWithin` (the prefix visible at `ms`), `logDuration`, `formatLogTime` (`mm:ss.mmm`, fixed width), `logText` (copyable plain text), `logCensus` (per-level counts).
- `db.ts` — the self-hosted sqlite store (see the data layer section).
- `sandboxmodality.ts` — the workload lane declaration: the two lanes forge owns (`binary-run`, `queue-priority`), mirrored as a string contract from `saddle/workloadlaw.ts` (`FAMILYLANES`), plus the lane seat resolution for the `FORGE_SANDBOX_LANE` env (`local` default / `join` / a pinned modality id).
- `onboardingstate.ts` — the first-run state of one visitor (the only writer of the intro/onboarding seen flags).
- `labels.ts` — the copy law: `LABEL_MANIFEST` (english source of truth, `page.widget.key` paths, revision 3), `label`, `labelfill` and the browser `seedLabels` — a hardcoded string inside a widget is a defect.
- `family.ts` — the family keyword file (the fold law): the family table (nine sibling slugs, the spec §12 accent table) and the relative `../slug/` url resolver for the rail foot links — the retired `familyurl.ts` arm rides as the familyurl lane of this one file.
- `theme.ts` — the dark/light theme flip through the `data-theme` attribute; session scope only, no cookies, no storage; the rail foot toggle is the only writer.
- `hometypes.ts` — the `HomeProps` contract of the home page.
- `api.ts` / `utils.ts` — the ports of the family libraries: `routes` from `@wenathlan/vault/routes`, helpers from `@wenathlan/vault/utils` — never duplicated inside forge.

## data layer (better sqlite)

- driver `better-sqlite3` through the vault storage lane: `openStorageLane({ envName: "FORGE_DB_PATH", defaultFile: "./forge.db" })` from `@wenathlan/vault/storagelane` — the lane carries the pragma bootstrap (`busy_timeout = 30000`, `journal_mode = WAL`, `foreign_keys = ON`).
- prepared statements only; every external input rides a bound parameter, never a concatenated string.
- tables: `runners` (id, name, kind, boundary default `saddle`, status default `idle`), `runlogs` (id, runnerId → runners, outcome, detail, createdAt), `onboarding_state` (visitor unique, introseen, onboardingseen, updatedAt — the seen-wins upsert: a stage marked anywhere stays marked), `labels` (id, text, revision, updatedAt, translated — translated rows are protected from the seed overwrite).
- api: `runners()`, `runnerRuns(runnerId)`, `addRunner(id, name, kind, boundary = "saddle", status = "idle")`, `logRun(id, runnerId, outcome, detail = "")`, `getonboardingstate(visitor)`, `setonboardingstage(visitor, stage)`, `saveLabel`, `readLabel`, `readAllLabels`, `seedLabelRows` (ingests the manifest, returns seeded/protected counts).
- `schema.prisma` (SandboxRunner, RunLog, OnboardingState) and `drizzle.config.ts` (dialect sqlite, `DATABASE_URL` default `file:./forge.db`) describe the same store.
- the browser never imports `db.ts` (better-sqlite3 cannot ride the static bundle): the label seed mirrors the rows into the browser cache.

## sol subapps (the pages)

- `sol/runs/runs.tsx` — the runner floor. a seeded rehearsal fleet (`FLOOR_SEED = 20260214`, `FLEET_SIZE = 8`), one row per runner: name, mode, state, load bar, runs/failures record and the three-dot health rung with the honest why. the summary carries total runners, the green/amber/red counts, the busy load and the verdict (healthy while no runner rides red). `advance` ticks the floor and the run plan together (one ride, two views); `reseed` rolls a new floor.
- `sol/queue/queue.tsx` — the execution queue. a seeded rehearsal queue (`QUEUE_SEED = 731004`, 7 items), the serving order (priority first, fifo inside the lane), the summary (depth, per-lane counts, the head run, the last served run), the enqueue form (label, priority chips, runner-mode chips) and per-row cancel. every action drives the real queue engine.
- `sol/logs/logs.tsx` — the log replay. one seed (`LOG_SEED = 421337`, presets 421337, 90012, 5124, 77031) unrolls the line stream; the player walks it on a timer (120 ms cadence, 180 ms of run clock per tick) with play/pause/replay/restart; the facts bar shows the clock, the visible/total lines, the info/warn/error census and the outcome; `prefers-reduced-motion` renders the full stream at once.
- `sol/home/home.tsx` — the landing and the platform entry: the run field with the real runner modes as chips hands over to `/runs`; the capability ledger (register, queue, logs) and the 01–03 run flow (mount, run, report); the family row of the spec §12 accents.
- `sol/intro/intro.tsx` — the first-run splash: the mark holds ~1.6 s, slides up 0.8 s and hands to the onboarding; click, key or reduced motion skips.
- `sol/onboarding/onboarding.tsx` — the three-frame first-run dialog (is / does / enter); finish or skip marks the stage seen and navigates to the gated home.
- `sol/shell/Shell.tsx` — the app surface: full-bleed at its own url, the window chrome only when embedded in the devthink os power clip; the rail pins `/`, `/runs`, `/queue`, `/logs`; the family foot with one identity dot per sibling; the theme flip.
- `sol/wingets/` — the shared components: `GraphPanel` (the run plan drawn as an svg stage graph — card 176×56, one bezier per wire, states as dot plus text, running wears the windows accent `#4cc2ff`, failed rides `rgb(232 17 35)`), `EmptyState`, `BrandMark`, `Entry` (the boot readout), the entry gate and the home tabs — all served through `wingets/index.ts`.
- `sol/notfound/notfound.tsx` — the 404 page.

## saddle integration

- dependency `@wenathlan/saddle ~2.0.155`; the engine owns the runner-mode ladder — forge imports `runnermodes` / `RunnerMode` from the published specifier `@wenathlan/saddle/modes` and re-exports them through the app seam (`runner.ts`), so fleet, queue, runstream and the pages all speak the one ladder.
- the five runtime targets a run asks for: `full-virtual` (the full virtual machine), `runner` (the runner host), `node-packages` (the node packages lane), `docker` (the docker lane), `ghcr` (the ghcr immutable lane).
- the workload lanes are mirrored from `saddle/workloadlaw.ts` (`FAMILYLANES`) as a string contract: `binary-run` (network, namespace isolation, 800 ms boot budget) and `queue-priority` (no network, process isolation, 25 ms boot budget), both `app-lane` today; the app battery pins the mirror against the engine source so the vendor cannot drift in silence.
- the lane seat: the deploy pins `FORGE_SANDBOX_LANE` — `local` (the default, the lanes run in the deploy's own process), `join` (the platform resolves every lane through the engine's join resolver — the workload never names a modality, the join answers) or a pinned modality id validated by the platform's join at dispatch. the module never spawns anything; the platform resolves the sandbox.
- the run plan encodes the delegation on the floor: `muster` the runner → `resolve` the mode (the saddle boundary resolves the runtime target) → `provision` the sandbox → `execute` the run → `collect` the evidence → `seal` the log chain.

## internal api surface

- `api.ts` re-exports the vault route catalog `routes` from `@wenathlan/vault/routes` — the route strings are never duplicated inside forge. the catalog answers `/api/health` and the `/api/v1/...` surface (uicopy, auth signup/signin, databases, query, protocols, storage projects/objects/quota).
- the onboarding flow rides the platform gateway: `GET`/`POST /api/v1/onboarding` over https when `VITE_ONBOARDING_URL` is configured (host validated: localhost, loopback, private, cgnat and reserved ranges are refused; mapped ipv6 hosts normalize to ipv4). without a platform the module answers from the offline layer alone — in-memory state plus the `forge.onboarding.seen` localStorage cache mirror (a cache, never the truth).
- env keys of the surface: `FORGE_DB_PATH` (the sqlite file), `FORGE_SANDBOX_LANE` (the lane seat), `VITE_ONBOARDING_URL` (the gateway base), `DATABASE_URL` (the drizzle config).

## tests

- `tests/fleet.test.ts`, `tests/queue.test.ts`, `tests/runstream.test.ts`, `tests/family.test.ts`, `tests/sandboxmodality.test.ts`, `tests/design.test.ts` — vitest suites pinning the engines and the mirrors (`bunx vitest run tests/<suite>.test.ts`).
