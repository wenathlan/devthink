# foundry

## Objective

Foundry is the complete deployable clone (sandbox plus database): the e2b and docker clone interface whose engine lives in the sandbox platform, while foundry owns the surface records — sandboxes, images and artifacts. It is the pipeline application of the family: the staging surface that runs, is the sandbox and keeps the network databases.

## Features

- Canonical pipeline — the five-step plan (provision, pull, run, collect, store) with one wire per hand-off.
- Step kinds — every plan step wears a role: stage, gate, tool or sink.
- Topological staging — the plan layers into stable stage waves; the depth counts them and the layout geometry is fixed, nothing improvises.
- Plan validation — duplicate ids, self wires, unknown steps and cycles answer problem codes; an empty problem list is a valid plan.
- Graph projection — the plan plus a state map projects into nodes and edges, pending when the map stays silent.
- Deterministic rehearsal — done prefix, running cursor, pending rest; the same seed and tick always answer the same map, and a seeded red rung keeps its failure record while the rest strand skipped.
- Progress and tally — the done share and the state histogram of any rehearsal.
- Open steps — the unsettled prefix the artifacts page narrates.
- Stage graph widget — the plan drawn as an SVG map: one card per step riding its topological stage, hairline bezier wires, the platform accent on running, the close red on failed, every state a dot plus text.
- Sandbox ladder — cold (built, not booted), warm (booted, keeping its working set), hot (executing) — owned by the sandbox engine.
- Guarded transitions — cold to warm, warm to hot or cold, hot to warm or cold; every other move is refused with an honest one-line reason.
- Machine actions — warm (boots), heat, cool (steps down, working set kept) and freeze (cold, boots and steps reset); step counting records execution on a hot sandbox only.
- Seeded herd — deterministic sandbox ids, state rolls, image rolls from the herd formats, boots and steps; the herd census answers totals, by-state histogram and warm share.
- Artifact sealing — FNV-1a checksums over the identity string (name, extension, bytes, payload), byte-identical in node and the browser; sealing builds the record, verification re-seals and compares.
- Artifact shelf — line and manifest rendering in stable order, the seeded line per herd format, and the seal-a-draft form with live digest preview.
- Image formats — three herd formats (quick zstd herd, pack gzip herd, release xz herd) with conversion plans, size estimates, pour order and byte formatting.
- Workload lanes — pipeline-graph and image-artifact lanes declared with process isolation, boot budget, no GPU and no network.

## Pipelines/Gates

- Gate answers — the plan walk refuses duplicate ids, self wires, unknown steps and cycles before anything runs.
- Transition gates — every sandbox state move is validated; a cold sandbox cannot execute and the surface says so.
- Honest no-ops — a same-format conversion ask answers a one-line no-op, never a direct byte-to-byte lie.
- Verified seals — the shelf marks rows intact or mismatch; the walk advances the shelf and the stage graph together (one run, two views of the same rehearsal).

## Interactions

- Route tree — intro, onboarding, home, sandboxes, images, artifacts and the 404 page.
- Sandbox page — the herd rows with state dots, the drive/heat/cool/freeze actions and the honest refusal readouts.
- Images page — from/to format chip selectors with the honest step list and the estimates on a reference stream.
- Artifacts page — the seal-a-draft form, the line summary (count, all-sealed verdict, digest) and the walk/rerun keys.
- Landing — the console prompt drafts a herd name and picks a clone format; the staging surface stores nothing.
- First-run flow — intro splash, three-beat onboarding, entry gate; empty states carry the reseed/rerun action.
- Accessibility — aria labels on every region, alert refusals, status readouts, dot plus text states, never color alone.

## Data

- The clone keeps the network databases: the SQLite store mirrors the schema twins for the prisma and drizzle toolchains through the shared storage lane.
- Runner registry, onboarding rows and label rows ride the same prepared-statement law.

## Engine role

Pipeline and gate surface of the family: the e2b/docker clone face over the sandbox engine, owning sandboxes, images and artifacts while the engine lives next door.

Padrão: seguir o padrão moderno.
