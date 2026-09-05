# Release candidate

This document describes the release candidate process and its gates. The candidate phase of the chain starts at 1.1.99: every release from here to 2.0.0 refuses to ship while any candidate gate stays red, the artifacts of the gates join the release evidence, and the candidate packaging carries the gate results beside the checksums of every artifact.

## The candidate gates

| Gate | Script | Artifact | Evidence |
| --- | --- | --- | --- |
| Defect sweep | `tests/sweep.mjs` | `tests/artifacts/sweep.json` | The audit trail collection with the failure deduplication, the source scans (todo markers, silent catches, unbounded loops, hardcoded origins, secret material, deprecated api usage) and the runtime checks (settings round trip, cancel paths, escape hatch, clean profile load, surface openings). |
| Pool audit | `tests/poolaudit.mjs` | `tests/artifacts/poolcoverage.json` | The 626 consolidated feature pool items of the crx mining evidence cross referenced against the shipped symbol corpus with the per item disposition of implemented and planned. |
| Verification matrix | `tests/matrixverify.mjs` | `tests/artifacts/matrixverify.json` | Every action kind of the frozen catalog against the fake tab provider of every browser kind, every browser surface page, the cli surface in library mode, the mcp handshake, the version one migration paths, the importers on the fixture formats and the standing gates as cells with the coverage percentage. |
| Telemetry free verification | `tests/telemetryfree.mjs` | `tests/artifacts/telemetryfree.json` | The network call site inventory, the network capable path table with the guarding gates, the block all proxy run over the startup, a recipe run and the dashboard render with zero outbound attempts, and the opt in and local only assertions. |

The candidate gates join the validate chain through `pnpm validate:candidate` and the verify workflow runs each of them as its own step beside the standing gates (apifreeze, pentest, cspaudit, permdiff, agentcert, costcert, doccheck). The workflowcheck mirror set carries every candidate gate, so a workflow that drops one fails the chain.

## The rc1 gate results from the matrix

The first release candidate (1.1.99) recorded the following results:

| Gate | Result |
| --- | --- |
| Defect sweep | 16 findings across 5 families, all fixed, zero open blockers — the audit trails hold zero recorded failures since the 1.1.90 consolidation, the replay set is empty, the source scans found no todo marker, no silent catch, no unbounded loop without termination, no origin outside the reviewed deep link catalog, no secret literal in the 59 shipped sources or the 20 compiled bundles and no deprecated api call, and the runtime checks answer the settings round trip, the cancel paths, the escape hatch, the clean profile load contract and the surface openings. |
| Pool audit | 626 pool items parsed, 623 implemented against the 4,072 symbol corpus, 3 planned, 0 unknown — the implemented count holds the recorded floor of 590. |
| Verification matrix | 18 cells, 18 passed, 100% coverage of the candidate matrix — 3 kind cells (one per browser kind of the fake tab provider over the 335 kind catalog), the surface cell, the cli cell, the mcp cell, the migration cell, 3 importer cells and 11 gate cells. |
| Telemetry free verification | 18 network call sites inventoried over 7 bundles, 8 network capable paths each with its policy gate, zero outbound attempts behind the block all proxy over the startup, the recipe run and the dashboard render, and the opt in and local only assertions green. |

## The candidate process

One release at a time, fully validated: the candidate bumps the version, the gates run in the validate chain, the artifacts land in tests/artifacts, the sweep results file their entries in docs/todo.md, the performance budgets record their measurements in docs/perfbudgets.md, the notes assembly merges the chain into docs/releasenotes.md, the candidate packaging carries the gate evidence beside the fixtures, and the release workflow publishes through the same channel chain every release uses. A red gate blocks the release: the exit code of every gate is nonzero while a blocker stays open, and the verify workflow refuses on any failed step.

The remaining candidate work rides the 2.0.0 release candidate sections of the roadmap: the readiness review, the migrateplan command with the outside importers, the version one sunset notice and the final polish list.
