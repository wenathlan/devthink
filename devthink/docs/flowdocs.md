# Flow documentation

Last verified release: the documentation completion release; the doccheck gate renews the verification on every run.

Every execution flow of the release draws in the shared mermaid style: one `flowchart TD` per flow, the reviewed decisions as diamonds, the user gates as doubled borders, the module links below every diagram, and no flow ever depicts an unreviewed path — the consent gates stay explicit at every crossing. The doccheck gate verifies every diagram states its mermaid language and links real modules.

## session lifecycle flow

The lifecycle of one reviewed session from the first proposal to the sealed audit: the session opens on the user proposal, every step crosses the consent gate, and the trail seals at completion.

```mermaid
flowchart TD
  proposal[the user drafts the proposal] --> review{the review surface approves}
  review -- refused --> cancel[the run cancels before the first step]
  review -- approved --> gate{the consent gate checks the kind class}
  gate -- sensitive --> window[the consent window asks the user]
  window -- denied --> refuse[the step refuses]
  window -- granted --> step[the step executes]
  gate -- read or interaction --> step
  step --> trail[the immutable loghash chain records the event]
  trail --> complete[the run completes and the trail seals]
```

modules: session.ts, gates.ts, run.ts, security.ts

## proposal and review flow

The proposal travels from the plan author to the reviewer: the planlint findings grade the plan, the review surface shows the diff, and the approval gates the execution.

```mermaid
flowchart TD
  author[the plan author writes the plan file] --> lint[planlint grades the selector grammar and the required fields]
  lint -- findings --> fix[the author repairs the plan]
  lint -- clean --> diff[the review surface renders the step diffs]
  diff --> approve{{the reviewer approves the proposal}}
  approve -- no --> reject[the proposal refuses]
  approve -- yes --> queue[the background run queue accepts the run]
```

modules: plan.ts, planreview surface of views.ts, gates.ts, workflow.ts

## execution pipeline flow

One step of a reviewed run crosses the pipeline: the kind grades into its risk class, the environment resolves, the idempotency key deduplicates, and the observation records the outcome.

```mermaid
flowchart TD
  dequeue[the queue hands the step to the runner] --> idem{the idempotency key replays}
  idem -- replayed --> skip[the step skips as a duplicate]
  idem -- fresh --> risk[the kind grades into its risk class]
  risk --> consent{the consent gate}
  consent -- granted --> env[the environment resolves: pagecontext, isolatedworld, offscreenworker or sandboxframe]
  env --> execute[the adapter executes the kind]
  execute --> observe[the observation records the payload with its schemaversion]
  observe --> next[the cursor advances]
```

modules: run.ts, environments.ts, runtime.ts, capture.ts, progress of run.ts

## consent gate flow

The consent gate decision tree: the class, the window state, the origin profile and the revocation state answer together.

```mermaid
flowchart TD
  kind[the step kind arrives] --> class[the risk class derives from the fixed allowlist]
  class --> revoked{the consent revoked mid run}
  revoked -- yes --> abort[the in flight step aborts]
  revoked -- no --> window{the consent window holds a live grant}
  window -- expired --> expiry[the grant expired on its timer]
  expiry --> ask{{the user re approves}}
  window -- live --> allow[the step proceeds]
  ask -- denied --> refuse[the step refuses]
  ask -- granted --> allow
```

modules: gates.ts, security.ts, session.ts

## capability negotiation flow

The protocol negotiation between a client and the surface: the highest shared major answers, version one messages pass through the deprecation window, and future majors refuse.

```mermaid
flowchart TD
  client[the client offers its protocol major] --> shared{the highest shared major}
  shared -- major two --> serve[the surface serves protocolv2]
  shared -- major one --> deprecate[the deprecation window accepts with one warning per session]
  shared -- above two --> refuse[the refusal answers the supported range]
  serve --> capmanifest[the capmanifest message serves the surface manifest]
```

modules: protocol.ts, serve.ts, mcp.ts, gateway.ts

## capture and ocr flow

The capture path from the reviewed shot to the redacted extract: the consent gate, the redaction overlays, the quarantine and the ocr pass.

```mermaid
flowchart TD
  shot[the capture kind shoots the reviewed region] --> redact[the redactshots overlays mask the sensitive regions]
  redact --> quarantine{the artifact kind needs quarantine}
  quarantine -- yes --> hold[the quarantine holds the artifact until the scan]
  hold --> scan[the local signature scan gate checks]
  quarantine -- no --> store[the artifact stores with provenance]
  scan --> store
  store --> ocr[the ocr pass reads the text]
  ocr --> extract[the extract minimizes before storage]
```

modules: capture.ts, security.ts, export.ts, environments.ts

## network interception flow

The reviewed network path: the origin check, the connect allowlist, the interception rules and the rate limit buckets.

```mermaid
flowchart TD
  request[the network kind prepares the request] --> origin{the origin check}
  origin -- cross origin --> refuse[the request refuses]
  origin -- reviewed --> allow{the connect allowlist knows the caller}
  allow -- unknown --> refuse2[the caller refuses]
  allow -- known --> limit[the rate limit bucket consumes the slot]
  limit -- over the bound --> defer[the call defers until the window resets]
  limit -- inside --> intercept[the interception rules apply]
  intercept --> fetch[the platform fetch executes]
```

modules: http.ts, security.ts, net.ts

## memory and checkpoint flow

The run state persistence: the checkpoints digest, the resume validation, the memory items with provenance and the expiry.

```mermaid
flowchart TD
  step[the step completes] --> checkpoint[the checkpoint records the cursor with its digest]
  checkpoint --> memory[the memory item records the provenance]
  memory --> expiry{the user expiry passes}
  expiry -- yes --> expire[the confirmation gated expirememory retains the summary]
  expiry -- no --> keep[the item stays]
  interruption[a crash interrupts the run] --> resume{the digest validates the checkpoint}
  resume -- valid --> efficient[the efficientresume continues from the cursor]
  resume -- invalid --> restart[the run restarts]
```

modules: run.ts, memory.ts, session.ts

## workflow engine loop flow

The workflow engine: the composition validates the blocks, the loop control advances, and the triggers schedule the next run.

```mermaid
flowchart TD
  compose[composeworkflow validates the document] --> blocks[the blocks resolve]
  blocks --> loop{the control flow kind}
  loop -- loop, repeatuntil, whileloop, foreach --> iterate[the iteration advances]
  loop -- branch, condition --> decide[the condition evaluates]
  loop -- parallel --> fan[the branches fan out]
  loop -- trycatch --> guarded[the guarded block runs]
  iterate --> cursor[the cursor advances]
  decide --> cursor
  fan --> merge[the results merge with provenance]
  guarded --> cursor
  cursor --> trigger{a trigger schedules the next run}
  trigger -- cronrule, intervalrule --> schedule[the scheduler ticks]
  trigger -- event, webhook, visit, url, menu, key, button, urllist --> fire[the rule fires]
  schedule --> compose
  fire --> compose
```

modules: workflow.ts, trigger of workflow.ts, run.ts

## multi agent coordination flow

The coordination topology: the leader delegates through the shared queue, the workers steal within the lock protocol, the critic reviews, and the verifier closes.

```mermaid
flowchart TD
  plan[the plan splits into tasks] --> queue[the shared task queue lanes the tasks]
  queue --> leader[the leader delegates]
  leader --> workers[the workers claim exactly once]
  workers --> steal{a worker idles}
  steal -- yes --> worksteal[the work stealing respects the lock protocol]
  steal -- no --> execute[the worker executes]
  worksteal --> execute
  execute --> blackboard[the blackboard merges the concurrent writes]
  blackboard --> critic[the critic agent reviews the result]
  critic -- revisions --> queue
  critic -- approved --> verifier[the verifier agent confirms]
  verifier -- fails --> escalate{{the escalation gate reaches the human}}
  verifier -- passes --> aggregate[the aggregate report merges every contribution]
  killswitch[the kill switch] -. stops every agent at once .-> queue
```

modules: agent.ts, swarm.ts, memory.ts, run.ts

## import and migration flow

The import path of external artifacts: the schema validation, the quarantine, the secret scan and the migration into the reviewed store.

```mermaid
flowchart TD
  incoming[the import artifact arrives] --> schema{the schema validation}
  schema -- malformed --> refuse[the import refuses]
  schema -- valid --> secrets[the secret scan runs]
  secrets -- leak --> vault[the secretvault holds the value]
  secrets -- clean --> quarantine[the quarantine holds the artifact]
  quarantine --> review{{the review approves the import}}
  review -- no --> refuse
  review -- yes --> store[the reviewed store accepts the artifact]
```

modules: export.ts, security.ts, data.ts, memory.ts

## release pipeline flow

The release chain of the repository: the verify lanes, the assemble, the channels and the checksum verification before the publish.

```mermaid
flowchart TD
  push[the push lands on main] --> verify[the verify lanes run: node, bun, deno, extension, container]
  verify -- failure --> fix[the failure blocks the release]
  verify -- green --> assemble[the assemble builds every artifact]
  assemble --> gates{the release gates: pentest, cspaudit, permdiff, agentcert, costcert, doccheck, apifreeze}
  gates -- gap --> fix
  gates -- green --> tag[the immutable tag resolves]
  tag --> channels[the channels publish: npm, maven, nuget, container, vscode, firefox, safari, site]
  channels --> checksums[the verification step downloads every asset and verifies the checksums]
  checksums -- mismatch --> draft[the release stays a draft]
  checksums -- match --> publish[the github release publishes]
```

modules: tests/build.mjs, tests/release.mjs, .github/workflows/verify.yml, .github/workflows/release.yml
