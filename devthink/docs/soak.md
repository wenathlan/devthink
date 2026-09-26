# Soak run walkthrough

This walkthrough drives the soak run of the 2.0.0 roadmap item 51: a long workflow stays alive across the full retention window without drift. The gate of `tests/soak.mjs` composes one long workflow of three loop passes over the rows of a fixture pricing table — a repeated extraction — and runs it through the real compiled engine with one keepalive heartbeat, one audit event, one hash chained log entry and one provenance carrying memory item per iteration, in the fake clock mode so the whole run replays byte identical. The run spans the audit retention window read back from the library settings three times over, checkpoints mid-run, resumes from the checkpoint after a simulated service worker restart, and proves the no drift contract four ways. The evidence lands in `tests/artifacts/soak.json` with no timestamps so reruns stay byte identical, and the gate exits nonzero on any failed check.

## 1. Build the compiled modules

```bash
pnpm build
```

The soak gate drives the compiled library, policy and memory bundles (`dist/index.js`, `dist/policy.js` and `dist/memory.js`), so the build runs first. No network call runs during the gate: the workflow executes through the injected executor seam the engine already accepts, the memory persists through the in memory adapter seam the real `sessionmemory` takes, and the audit trail hashes through the web crypto the platform offers.

## 2. Run the soak gate

```bash
node tests/soak.mjs
```

The gate prints one line per executed check with its outcome and answers the final JSON summary (`release`, `artifact`, `total`, `passed`, `failed`); any failed check prints to stderr, sets the exit code nonzero and lands in the artifact with its failure detail. The artifact is `tests/artifacts/soak.json`.

## 3. The retention window semantics

The retention window the soak spans is a user setting, never an engine constant: `auditretention` of the run settings bounds the audit trail to the newest events, an absent setting keeps every event, and `heartbeatwindow` keeps the documented roadmap default of 60000 ms unless the user configures it. The gate sets the window to eight events through the real settings store, reads it back, and composes the long workflow so the run crosses the window three times over: three loop passes of eight rows each, twenty four iterations in total, so the retention genuinely cycles while the run stays alive. The memory expiry rules of the same family mirror the window in time — one lifetime of eight seconds at the one second heartbeat tick — so the purge pass inside the window answers the aged items while every purge summary keeps its provenance for the audit trail.

## 4. The long workflow composition

The workflow composes through the real `composeworkflow` against the frozen kind catalog of the policy module: three loop steps (the reviewed payload of a list variable, its item and index variables, its safety bound and its body), one count expression after each pass, and the two summing expressions that total every row. The body of every pass is one `readtext` step with its reviewed regex rule that extracts the row id and its cells, so each iteration binds one row of the fixture pricing table into the scope the next steps read. The gate validates the composed record through `validateworkflow` with the runtime inputs the loop and the expressions declare, grades it through the risk table and freezes it — the same review path every shipped workflow takes.

## 5. The liveness contract

The run opens through `openrun` (the keepalive port opens at the fixed epoch with the one second heartbeat interval), every dispatched step emits one heartbeat through `runheartbeat` and `beatrun`, and the zombie reaper stays honest: `zombiesweep` with the tolerated three silent intervals never reaps the beating run while a deliberately silent twin of the same run reaps, so the check proves the reaper works rather than proving nothing. The heartbeat freshness reads `heartbeatisstale` against the documented window — fresh inside the window, stale one tick past it — and the run closes through `closerun` with its keepalive port stopped. The liveness sweep runs on the fake tab of every browser kind the extension ships (chromium, firefox and safari) so the tab isolation namespace binds the run the same way everywhere.

## 6. The checkpoint resume

Mid-run — after the second pass and its count expression — the gate runs the segment before the boundary, marks the pending step through `markpending`, simulates the service worker restart through `reattachrun` and reads the recovery plan that names the single step the executor resumes. The run record checkpoint captures the completed step ids with the page digest of the fixture page through `makecheckpoint`; `checkpointisvalid` accepts the checkpoint of its own run and digest and refuses a changed digest; `resumecheckpoint` answers exactly the steps past the checkpoint. The resume then continues from the paused cursor with the partial log, outputs and scopes, and the completed outcome must serialize byte identical to the uninterrupted outcome of the same workflow — the run, every log entry and every step output.

## 7. The no drift contract

The drift contract answers four ways, all inside the fake clock mode (the wall clock stays patched to the fixed epoch with one tick per dispatched step, so every `startedat`, `at`, `endedat` and `duration` the engine stamps rides the same clock):

- **The resumed outcome matches the uninterrupted outcome byte for byte** — the checkpoint, the restart and the resume change nothing the audit reads.
- **Two full soak runs seal the identical audit hash** — the immutable log of the same event sequence hashes to the same seal hash, entry by entry, because the entry ids, summaries, provenance and times replay exactly.
- **The whole hash chain verifies** — `verifylogchain` walks every entry from the genesis hash to the seal, `readverifiedlog` and `exportlogchain` return the sealed chain, a tampered summary breaks the chain at its index, and the sealed log refuses the late append because the seal stays terminal.
- **The memory provenance never drifts** — every memory item carries the same origin, run and step provenance across the full window, the purge summaries keep their provenance after the expiry pass, and the audit export round trips through its chunks with the same numbers.

## 8. The bounded memory answer

The retention bounds hold while the run records: the audit trail stays at the eight event retention window across twenty four recorded events, the immutable log keeps every row (the audit family never purges), the memory expiry pass under the user rule purges the aged items with their provenance surviving in the summaries, and the kept item count lands inside the window. The audit export bundles the runs, the kept items, the expiry rules and the timeline and streams through `exportchunks` without a size cap, so the export reads back the same record.

## The automated checklist

| Check | Family | Module | Verification |
| --- | --- | --- | --- |
| 1 | retention window | memory.js and run.js | The audit retention window loads from the library settings and bounds the stored counts: the window read back from the settings store bounded the probe trail at the newest events, the absent setting kept everything and the heartbeat window kept the documented default unless configured. |
| 2 | composition | workflow.js and policy.js | The long workflow composes and validates against the frozen kind catalog: the eight step soak workflow froze with every kind inside the catalog, the interaction risk grade of the loop family and the validateworkflow allowance under the declared runtime inputs. |
| 3 | liveness | run.js and workflow.js | The soak run stays alive across the full retention window: the keepalive beats stay fresh inside the window, the zombie sweep never reaps the beating run while the silent twin reaps, and the run closes done with the total rows expression answering twenty four. |
| 4 | resume | run.js and workflow.js | The checkpoint mid-run resumes and completes identically: the segment before the boundary completed, the restart marked the pending step and reattached the keepalive port, the checkpoint validated against its digest and refused a changed one, and the resumed outcome serialized byte identical to the uninterrupted outcome. |
| 5 | audit trail | security.js | The audit trail hash chain verifies end to end: the chain walked from the genesis hash to the seal, the verified read and the export returned the whole sealed chain with its seal hash, the tampered entry broke the chain at its index and the sealed log refused the late append. |
| 6 | no drift | workflow.js and security.js | Repeated soak runs seal the identical audit hash: two full runs from the same fixed epoch produced byte identical outcomes over the run, the log entries and the outputs and sealed the identical seal hash. |
| 7 | memory | memory.js | The memory items keep their provenance inside the retention bounds: every item kept the identical provenance across the window, the audit trail stayed bounded, the expiry pass purged the aged items with every purge summary keeping its provenance and the audit export round tripped through its chunks. |
| 8 | browser matrix | run.js | Every browser kind keeps the run alive on its fake tab: the beating runs survived every zombie sweep on chromium, firefox and safari while their silent twins reaped, the tab isolation namespace bound each run and the run state export answered the beats. |
| 9 | report | soak.mjs | The soak report records every check and the exit answers the failures: the report carries the executed checks with their outcomes and details and the gate sets its nonzero exit the moment any failed check lands in the artifact. |

The retention settings the window reads live in `docs/configuration.md`, the run lifecycle family the gate drives lives in the run and workflow modules the architecture doc maps, and the release gate row that lands this walkthrough lives in `docs/releasegates.md`.
