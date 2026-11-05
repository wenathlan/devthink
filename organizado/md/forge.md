# forge

## Objective

Forge is the deployable clone of execution only: the CI and build application that runs any binary with the sandbox engine and stores nothing. It registers runners, records run logs and reports outcomes over HTTPS while the engine boundary belongs to the sandbox platform — forge owns the runner surface.

## Features

- Runner mode ladder — five runtime targets (full-virtual, runner, node-packages, docker, ghcr) owned by the sandbox engine and imported through one seam, never duplicated.
- Run plan graph — the canonical six-step plan (muster, resolve, provision, execute, collect, seal) as a directed graph of steps and wires.
- Plan validation — duplicate ids, self wires, unknown steps and cycles detected and answered as problem codes.
- Topological staging — the plan layers into stable stage waves; depth, feeders and successors answer as pure functions.
- Deterministic rehearsal — the same seed and tick always answer the same step states; a seeded red run strands the remaining steps skipped.
- Progress tally — per-state counts and the done share of a rehearsal map.
- SVG plan panel — the plan drawn as a stage graph with one card per step, one bezier per wire and every state a dot plus text.
- Priority queue — express, normal and batch lanes with rank order; express cuts ahead, batch rides last.
- Queue operations — enqueue with stamped monotonic sequence, dequeue of the serving head, cancel by id, depth answers per lane and position of one item.
- Fleet ladder — runner states (idle, starting, busy, draining, offline) with green, amber and red health rungs from pure thresholds and the one-line honest reason per rung.
- Fleet dynamics — deterministic seeded fleet, a tick that advances runners honestly (a tick never heals a red runner by hiding its record), state and health histograms, and the healthiest-runner pick with an honest refusal when nobody is able.
- Run log streaming — a seeded log stream with boot lines, build steps with warns and at most one error, and the outcome report; info, warn and error levels with millisecond offsets.
- Log replay player — play, pause, replay and restart over the live tail, the facts bar (clock, lines, census, outcome), the stream table and the tailing cursor; reduced motion renders the full stream at once.
- Workload lanes — the two lanes forge owns (binary-run, queue-priority) mirrored from the sandbox workload law, with the lane seat resolved by the platform.

## Binary

- Binary-run lane — any binary runs over the sandbox engine boundary; the five runtime targets carry the execution surface while forge stores nothing.
- Honest execution — the runner floor records outcomes and failure rates without inventing names: a blank draft label falls back to the honest default.
- Determinism — one integer seed unrolls the whole run log, the queue and the fleet identically in node and in the browser.

## Interactions

- Route tree — intro, onboarding, home, runs, queue, logs and the 404 page.
- Runs page — the runner rows with load bars and health rungs, the summary cells, the advance and reseed keys, and the run plan rehearsed on the same seed.
- Queue page — the seeded queue with depth/lane/head/served summary, the enqueue form (label, priority chips, mode chips), serve-next, reseed and per-row cancel, all driving the real engine.
- Logs page — the replay player over the seeded streams with preset seeds.
- Landing — the hero with the run field and the real runner modes as chips, the capability ledger, the three-step run flow (mount, run, report) and the footer meta quad.
- First-run flow — intro splash and three-frame onboarding that never replays; entry gate decides.
- Rail navigation — home, runs, queue and logs pins with tooltips; theme flip; family row with sibling accent dots.

## Data

- SQLite store through the shared storage lane with prepared statements only: runner registry, run log entries, onboarding rows and label rows with revision tracking and translated-row protection.
- API port — the route catalog and family helpers answer through the published storage library instead of being duplicated; the health probe serves the deploy checks.

## Engine role

Binary execution surface of the family: the CI floor that runs any binary over the sandbox engine and reports honestly, storing nothing.

Padrão: seguir o padrão moderno.
