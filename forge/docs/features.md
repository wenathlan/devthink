# forge features

the real feature list of the forge app, read from the code and grouped by category. every entry names a behavior that exists in the source.

## execution

- runner mode ladder — five runtime targets (`full-virtual`, `runner`, `node-packages`, `docker`, `ghcr`) owned by the saddle engine and imported through the `runner.ts` seam, never duplicated.
- run plan graph — the canonical six-step plan (`muster → resolve → provision → execute → collect → seal`) as a directed graph of steps and wires (`graphplan.ts`).
- plan validation — duplicate ids, self wires, unknown steps and cycles are detected and answered as problem codes (`planvalid`).
- topological staging — the plan layers into stable stage waves; the depth, the feeders and the successors of every step answer in pure functions (`planstages`, `plandepth`, `planfeeders`, `plannext`).
- deterministic rehearsal — the same seed and tick always answer the same step states; a seeded red run (one roll in six) strands the remaining steps skipped (`planrehearsal`, `planfailindex`).
- progress tally — per-state counts and the done share (0–100) of a rehearsal map (`plantally`, `planprogress`).
- svg plan panel — the plan drawn as a stage graph: one card per step, one bezier per wire, running wears the windows accent, failed rides the close red, every state a dot plus text (`sol/wingets/RunsGraphpanel.tsx`).
- workload lanes — the two lanes forge owns (`binary-run`, `queue-priority`) mirrored from the saddle workload law as a string contract, pinned by the battery (`sandboxmodality.ts`).
- lane seat resolution — `FORGE_SANDBOX_LANE` answers local (default), join or a pinned modality id; the module never spawns, the platform resolves (`lanesandbox`, `lanesandboxfromenv`).

## queue

- priority lanes — express, normal and batch with rank 0/1/2; express cuts ahead, batch rides last (`QUEUE_PRIORITIES`, `PRIORITY_RANK`).
- serving order — priority first, fifo by arrival seq inside the lane, derived as a pure snapshot; storage stays append-only (`queueOrder`).
- enqueue — appends a run with a stamped monotonic seq and the requested mode and priority; a blank draft label falls back to the honest default, never an invented name (`enqueue`).
- dequeue — pops the head of the serving order and answers the item that left; an empty queue answers `undefined` (`dequeue`, `nextUp`).
- cancel — removes one queued run by id (`cancel`).
- depth answers — the total depth, the depth per priority lane and the position of one item in the serving order (`queueDepth`, `depthByPriority`, `positionOf`).
- seeded rehearsal queue — a deterministic queue from one integer seed with honest build-work labels (`queueFromSeed`).
- queue page — the seeded queue (seed 731004, 7 items) with the depth/lane/head/served summary, the enqueue form (label, priority chips, mode chips), serve-next, reseed and per-row cancel, all driving the real engine (`sol/queue/queue.tsx`).

## fleet

- runner states — idle, starting, busy, draining and offline, the floor ladder every runner holds (`RUNNER_STATES`).
- health ladder — green, amber and red rungs from pure thresholds: offline or a failure rate over 20% is red; draining, load over 85% or a failure rate over 5% is amber (`healthRungOf`).
- honest why — every rung answer carries the one-line reason (offline, near saturation, watched failure rate, running inside its budget) (`HealthRung.why`).
- seeded fleet — the same seed musters the same runners (id, name, mode, state, load, runs, failures) every time, in node and in the browser (`seedFleet`, `mulberry32`).
- fleet tick — a deterministic advance: busy runners may finish (load falls, record grows), idle runners may start, draining completes to idle, offline stays until a human act — a tick never heals a red runner by hiding its record (`fleetTick`).
- fleet summary — state and health histograms, the average busy load and the verdict: the floor is healthy while no runner rides red (`fleetSummary`).
- runner picking — the healthiest non-red runner of the requested mode (lowest rung, then lowest load); nobody able is an honest refusal (`pickRunner`).
- runs page — the seeded rehearsal floor (seed 20260214, 8 runners): the runner rows with load bars and health rungs, the summary cells, the advance and reseed keys, and the run plan rehearsed on the same seed and tick (`sol/runs/runs.tsx`).

## streaming

- seeded log stream — one integer seed unrolls the whole run log: boot lines (accept the run, mount the sandbox, restore the working set), seeded build steps with warns and at most one error, and the outcome report (`runLogLines`).
- log levels — info, warn and error per line with a millisecond offset into the run (`LogLevel`, `LogLine`).
- outcome derivation — the stream fails when an error line exists, otherwise succeeds (`logOutcome`).
- live tail — the prefix of the stream visible at `ms` into the run, pure so the page can render it on a timer (`linesWithin`).
- tabular clock — the fixed-width `mm:ss.mmm` rendering of every offset (`formatLogTime`).
- copyable text — the plain-text form of the stream for the copy action (`logText`).
- level census — the info/warn/error counts of a stream (`logCensus`).
- logs page — the replay player (seed 421337, presets 421337/90012/5124/77031): play/pause/replay/restart, the facts bar (clock, lines, census, outcome), the stream table and the tailing cursor; reduced motion renders the full stream at once (`sol/logs/logs.tsx`).

## ui

- anchor architecture — app → theme anchor (`sol/Sol.tsx`) → page anchors → loose components; nothing is imported directly (`App.tsx`).
- standalone law — full-bleed at the app's own url; the draggable window chrome exists only when embedded in the devthink os power clip (`sol/shell/Shell.tsx`).
- rail navigation — four pins: home, runs, queue and logs, with acrylic tooltips and the 48px press hands (`RAIL_APPS`).
- theme flip — dark and light finishes through the `data-theme` attribute, session scope only, no cookies, no storage (`theme.ts`).
- family row — the nine sibling deploy units with the spec §12 accent dots, resolved to relative urls (`family.ts` — the fold of the retired `familyurl.ts` arm into the familyurl lane).
- copy law — every interface string lives in the label store (`LABEL_MANIFEST`, revision 3); the seed refreshes changed rows and never overwrites a translated row (`labels.ts`, `seedLabels`).
- label interpolation — `labelfill` fills the placeholders of a label with runtime values (seeds, counts, percents).
- landing — the hero with the run field and the real runner modes as chips, the capability ledger, the 01–03 run flow (mount, run, report) and the footer meta-quad (`sol/home/home.tsx`).
- first-run flow — the intro splash (~1.6s hold, skippable) hands to the three-frame onboarding dialog; finish or skip marks the stage seen and the flow never replays (`sol/intro`, `sol/onboarding`).
- onboarding persistence — the db is the truth via the platform gateway (`/api/v1/onboarding` over https, host validated), the localStorage key is a cache mirror only (`onboardingstate.ts`).
- entry gate — the home entry gate reads the onboarding state and decides whether the splash plays (`sol/wingets/HomeEntrygate.tsx`).
- error boundary — the boot boundary renders the reload card when a page frame fails to render (`App.tsx`).
- notfound — the 404 page for unknown routes (`sol/notfound`).
- accessible states — every state on the floor pages is a dot plus text, never color alone; load bars and health rungs carry aria labels.

## data

- sqlite store — better-sqlite3 through the vault storage lane (wal, busy timeout, foreign keys) with prepared statements and bound parameters only (`db.ts`).
- runner registry — the `runners` table with the saddle boundary default and the idle status default (`addRunner`, `runners`).
- run log entries — the `runlogs` table tied to a runner with outcome, detail and creation time (`logRun`, `runnerRuns`).
- onboarding rows — the seen-wins upsert: the intro/onboarding flags only ever move forward (`setonboardingstage`, `getonboardingstate`).
- label rows — the idempotent label upsert with revision tracking and translated-row protection (`saveLabel`, `readLabel`, `readAllLabels`, `seedLabelRows`).
- schema twins — `schema.prisma` and `drizzle.config.ts` describe the same sqlite store for the prisma/drizzle toolchains.

## api

- route catalog port — the vault routes answer through `api.ts`; the route strings are never duplicated inside forge.
- family helpers port — the vault utils answer through `utils.ts` (`splitwords` and siblings).
- health probe — the catalog carries `/api/health` for the deploy probes.
- gateway client — the onboarding module talks to the platform gateway with host validation (loopback, private, cgnat and reserved ranges refused, mapped ipv6 normalized).
