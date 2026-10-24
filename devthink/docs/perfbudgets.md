# Performance budgets

This document records the measured performance budgets of the release candidate: the byte budget every dist target carries, the runtime ceilings the policy gates enforce and the startup, latency and memory windows the run family keeps. The build itself fails when any bundle overgrows its budget, so the table below records the measured state the candidate shipped with — the budgets are the contract, the measurements are the evidence.

## The bundle byte budgets of the candidate

Every dist target answers a byte budget the build enforces at packaging time; a bundle that overgrows its budget fails the release before it ships. The utilization column records how much of its budget the candidate consumes.

| Target | Bundle | Bytes | Budget | Utilization |
| --- | --- | ---: | ---: | ---: |
| index | index.js | 1,971,393 | 2,000,000 | 99% |
| indexcjs | index.cjs | 2,068,360 | 2,100,000 | 98% |
| neutral | index.neutral.js | 1,829,172 | 1,900,000 | 96% |
| umd | devthink.umd.js | 2,025,397 | 2,100,000 | 96% |
| node | node.cjs | 2,068,302 | 2,100,000 | 98% |
| bun | bun.js | 1,971,907 | 2,000,000 | 99% |
| deno | deno.js | 1,971,833 | 2,000,000 | 99% |
| cli | cli.js | 633,929 | 900,000 | 70% |
| headless | headless.js | 522,788 | 900,000 | 58% |
| mcp | mcp.js | 788,055 | 1,400,000 | 56% |
| gateway | gateway.js | 101,466 | 400,000 | 25% |
| http | http.js | 47,948 | 600,000 | 8% |
| bridge | bridge.js | 61,325 | 160,000 | 38% |
| companion | companion.js | 12,070 | 60,000 | 20% |
| policy | policy.js | 517,385 | 600,000 | 86% |
| protocol | protocol.js | 326,281 | 380,000 | 86% |
| memory | memory.js | 285,519 | 500,000 | 57% |
| progress | progress.js | 28,666 | 60,000 | 48% |
| hardening | hardening.js | 8,449 | 60,000 | 14% |
| dashdone | dashdone.js | 15,062 | 120,000 | 13% |
| crossbrowser | crossbrowser.js | 29,011 | 380,000 | 8% |
| pack | pack.js | 32,489 | 600,000 | 5% |

The full library targets run high on utilization by design — the family consolidation of the 1.1.90 wave folded every module into the single index surface, so the library budget tracks the whole platform. The tool targets (cli, headless, mcp, gateway, http, bridge, companion) keep generous headroom for the release candidates to grow into.

## The runtime ceilings the policy gates enforce

| Ceiling | Default | Gate |
| --- | ---: | --- |
| Run heartbeat window | 60,000 ms | `heartbeatwindowof` of run.js, settable through runsettings |
| Session lock window | 30,000 ms | `lockwindowof` of run.js with the session lock gate |
| Task tab ceiling | unbounded until set | `tasktabceiling` of policy.js, settable through runsettings |
| Wait duration per step | 600,000 ms ceiling | `waitduration` of policy.js |
| Capture retention window | unbounded until set | `captureretentionwindow` of policy.js |
| Memory budget ratio | 0.8 of the declared budget | `runbudgetvalid` of policy.js |
| Fetch budget per origin | configurable per consent | `fetchbudgetallowed` of policy.js |
| Rate limit budget | configurable per consent | `ratelimitbudgetallowed` of policy.js |

Every ceiling draws its bound from configuration: the sweep of the release candidate verifies no conditionless loop runs without its termination, and the run budget family halts a run that overruns its declared memory or token budget with the ask gate.

## The startup and measurement discipline

The cold start verdict of the 1.1.93 performance hardening family (`coldstartverdict` of perf.js) grades the startup samples the runtime records, the memory trend family (`memorytrend` of memory.js) tracks the capture store growth against the trimming windows, and the battery aware deferral (`batteryawarestateof` of perf.js) defers the non critical work when the platform reports a constrained state. The measurements of the candidate ride the artifacts of the gate chain: the bundle accounting above, the verification matrix coverage of tests/artifacts/matrixverify.json and the sweep report of tests/artifacts/sweep.json.
