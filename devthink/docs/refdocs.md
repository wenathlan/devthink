# Reference documentation

Last verified release: the documentation completion release; the doccheck gate renews the verification on every run.

Every reference table of the release 1.1.96 states its schema version and mirrors the code the gate reads: the cli command table mirrors the cli help, the protocol message table mirrors the frozen message catalog, the error code table mirrors the response envelope, the audit event table mirrors the audit kind vocabulary, the configuration key table mirrors the documented keys, the storage schema table mirrors the frozen schema files, the capability manifest table mirrors the caps surfaces, the mcp tool table mirrors the built tool catalog, the trigger table mirrors the scheduler kinds and the permission table mirrors the manifest classes. The doccheck gate refuses any drift between a table and its source.

## cli command reference

schema version: the cli surface of the release; every command below appears in the cli help the terminal prints.

| Command | Purpose |
| --- | --- |
| `manifest` | validate the extension manifest with the deep manifest checks |
| `describe` | print the frozen capability manifest of every surface with the protocol negotiation line |
| `commands` | print the shared command registry of the palette and the cli |
| `planlint` | lint plan files |
| `migrateplan` | convert a foreign plan source (v1, automa, selenium, ui vision or tabular) into the reviewed plan grammar |
| `flowrun` | run a plan file |
| `runworkflow` | run a saved workflow with checkpoints and an audit trail file |
| `exportdata` | export session, audit or extraction data |
| `headless` | replay a plan against recorded page state fixtures |
| `serve` | serve the mcp server mode over stdio and a localhost http listener |
| `native` | install, remove or diagnose the optional native host of the native bridge |
| `export` | export runs, extractions and notes |
| `init` | scaffold a plan file |
| `doctor` | probe runtime capabilities |
| `help` | list every command with the version banner and the exit codes |

## protocol message reference

schema version: protocolv2 major 2 of the 1.1.91 api freeze; every message below appears in the frozen message catalog the protocol module serves.

| Message | Family | Schema | Envelope | Carrier |
| --- | --- | --- | --- | --- |
| `proposalrequest` | proposal | schemas/proposal.schema.json | protocolversion | requestbody |
| `proposalresponse` | proposal | schemas/proposal.schema.json | protocolversion | parseproposal |
| `plan` | plan | schemas/plan.schema.json | protocolversion | parseproposal |
| `planstep` | plan | schemas/plan.schema.json | protocolversion | parseproposal |
| `workflowproposal` | plan | schemas/plan.schema.json | protocolversion | parseworkflowproposal |
| `workflowoutcome` | plan | schemas/plan.schema.json | protocolversion | workflowoutcome |
| `sessionstart` | session | schemas/session.schema.json | runtime | handlerequest |
| `sessionpause` | session | schemas/session.schema.json | runtime | handlerequest |
| `sessionresume` | session | schemas/session.schema.json | runtime | handlerequest |
| `sessionrecord` | session | schemas/session.schema.json | protocolversion | requestbody |
| `observation` | observation | schemas/observation.schema.json | protocolversion | requestbody |
| `observationresponse` | observation | schemas/observation.schema.json | protocolversion | observationresponse |
| `responseenvelope` | envelope | schemas/envelope.schema.json | protocolversion | outcomeresponse |
| `jsonrpcresponse` | envelope | schemas/envelope.schema.json | jsonrpcframe | handleframe |
| `serverenvelope` | envelope | schemas/envelope.schema.json | serverenvelope | composeenvelope |
| `capabilityreport` | capability | schemas/capability.schema.json | protocolversion | requestbody |
| `auditevent` | audit | schemas/audit.schema.json | protocolversion | auditexportreport |
| `auditexport` | audit | schemas/audit.schema.json | protocolversion | auditexportreport |
| `memoryitem` | memory | schemas/memory.schema.json | protocolversion | memoryitemframe |
| `planprogress` | progress | schemas/progress.schema.json | runtime | recordstep |
| `stepoutcome` | progress | schemas/progress.schema.json | protocolversion | outcomeresponse |
| `tooldef` | tool | schemas/tool.schema.json | jsonrpcframe | listtools |
| `toolcall` | tool | schemas/tool.schema.json | jsonrpcframe | dispatchtool |

## error code reference

schema version: the response envelope of protocolv2; the five wire error codes beside the six terminal exit codes.

| Code | Class | Retry |
| --- | --- | --- |
| `parse` | the payload failed the schema parse | no — the caller repairs the payload |
| `method` | the method stays unknown | no — the caller names a served method |
| `params` | the parameters failed validation | yes — the caller fixes the parameters |
| `internal` | the server failed internally | yes — the bounded retry policy retries inside three attempts |
| `consentrefused` | the consent gate refused the call | no — the user re-approves through the review surface |
| exit `ok` | the run completed | terminal |
| exit `consentrefused` | the review refused before the first step | terminal |
| exit `stepfailed` | a step failed | terminal |
| exit `schemaerror` | a document failed validation | terminal |
| exit `unsupported` | the runtime lacks the capability | terminal |
| exit `cancelled` | the user cancelled the run | terminal |

## audit event reference

schema version: the audit trail of the release; every kind below appears in the audit kind vocabulary the types module freezes.

| Audit kind | Trail |
| --- | --- |
| `configure` | the immutable loghash chain records the event with its provenance |
| `session` | the immutable loghash chain records the event with its provenance |
| `observe` | the immutable loghash chain records the event with its provenance |
| `proposal` | the immutable loghash chain records the event with its provenance |
| `approval` | the immutable loghash chain records the event with its provenance |
| `action` | the immutable loghash chain records the event with its provenance |
| `error` | the immutable loghash chain records the event with its provenance |
| `stop` | the immutable loghash chain records the event with its provenance |
| `pause` | the immutable loghash chain records the event with its provenance |
| `resume` | the immutable loghash chain records the event with its provenance |
| `complete` | the immutable loghash chain records the event with its provenance |
| `capability` | the immutable loghash chain records the event with its provenance |
| `tab` | the immutable loghash chain records the event with its provenance |
| `window` | the immutable loghash chain records the event with its provenance |
| `download` | the immutable loghash chain records the event with its provenance |
| `pointer` | the immutable loghash chain records the event with its provenance |
| `dialog` | the immutable loghash chain records the event with its provenance |
| `hold` | the immutable loghash chain records the event with its provenance |
| `retry` | the immutable loghash chain records the event with its provenance |
| `observation` | the immutable loghash chain records the event with its provenance |
| `watch` | the immutable loghash chain records the event with its provenance |
| `diff` | the immutable loghash chain records the event with its provenance |
| `navigation` | the immutable loghash chain records the event with its provenance |
| `redirect` | the immutable loghash chain records the event with its provenance |
| `auth` | the immutable loghash chain records the event with its provenance |
| `prefetch` | the immutable loghash chain records the event with its provenance |
| `rate` | the immutable loghash chain records the event with its provenance |
| `group` | the immutable loghash chain records the event with its provenance |
| `layout` | the immutable loghash chain records the event with its provenance |
| `discard` | the immutable loghash chain records the event with its provenance |
| `badge` | the immutable loghash chain records the event with its provenance |
| `fill` | the immutable loghash chain records the event with its provenance |
| `submit` | the immutable loghash chain records the event with its provenance |
| `consent` | the immutable loghash chain records the event with its provenance |
| `handoff` | the immutable loghash chain records the event with its provenance |
| `scrape` | the immutable loghash chain records the event with its provenance |
| `export` | the immutable loghash chain records the event with its provenance |
| `stream` | the immutable loghash chain records the event with its provenance |
| `provenance` | the immutable loghash chain records the event with its provenance |
| `resume` | the immutable loghash chain records the event with its provenance |
| `intercept` | the immutable loghash chain records the event with its provenance |
| `clipboard` | the immutable loghash chain records the event with its provenance |
| `quarantine` | the immutable loghash chain records the event with its provenance |
| `cleanup` | the immutable loghash chain records the event with its provenance |
| `capture` | the immutable loghash chain records the event with its provenance |
| `media` | the immutable loghash chain records the event with its provenance |
| `call` | the immutable loghash chain records the event with its provenance |
| `socket` | the immutable loghash chain records the event with its provenance |
| `replay` | the immutable loghash chain records the event with its provenance |
| `control` | the immutable loghash chain records the event with its provenance |
| `timeline` | the immutable loghash chain records the event with its provenance |
| `debugger` | the immutable loghash chain records the event with its provenance |
| `profile` | the immutable loghash chain records the event with its provenance |
| `emulation` | the immutable loghash chain records the event with its provenance |
| `workflow` | the immutable loghash chain records the event with its provenance |
| `trigger` | the immutable loghash chain records the event with its provenance |
| `protocol` | the immutable loghash chain records the event with its provenance |
| `tool` | the immutable loghash chain records the event with its provenance |
| `model` | the immutable loghash chain records the event with its provenance |
| `swarm` | the immutable loghash chain records the event with its provenance |
| `environment` | the immutable loghash chain records the event with its provenance |
| `worker` | the immutable loghash chain records the event with its provenance |
| `sandbox` | the immutable loghash chain records the event with its provenance |
| `grant` | the immutable loghash chain records the event with its provenance |
| `expiry` | the immutable loghash chain records the event with its provenance |
| `revoke` | the immutable loghash chain records the event with its provenance |
| `deny` | the immutable loghash chain records the event with its provenance |
| `seal` | the immutable loghash chain records the event with its provenance |
| `mask` | the immutable loghash chain records the event with its provenance |
| `vault` | the immutable loghash chain records the event with its provenance |
| `gate` | the immutable loghash chain records the event with its provenance |
| `phish` | the immutable loghash chain records the event with its provenance |
| `defer` | the immutable loghash chain records the event with its provenance |
| `schema` | the immutable loghash chain records the event with its provenance |
| `inbound` | the immutable loghash chain records the event with its provenance |
| `transparency` | the immutable loghash chain records the event with its provenance |
| `notes` | the immutable loghash chain records the event with its provenance |
| `scratchpad` | the immutable loghash chain records the event with its provenance |
| `summary` | the immutable loghash chain records the event with its provenance |
| `recall` | the immutable loghash chain records the event with its provenance |
| `correction` | the immutable loghash chain records the event with its provenance |
| `consentmemory` | the immutable loghash chain records the event with its provenance |
| `cancel` | the immutable loghash chain records the event with its provenance |
| `search` | the immutable loghash chain records the event with its provenance |
| `palette` | the immutable loghash chain records the event with its provenance |
| `surface` | the immutable loghash chain records the event with its provenance |
| `onboarding` | the immutable loghash chain records the event with its provenance |
| `logstream` | the immutable loghash chain records the event with its provenance |
| `datagrid` | the immutable loghash chain records the event with its provenance |
| `quickaction` | the immutable loghash chain records the event with its provenance |
| `shortcut` | the immutable loghash chain records the event with its provenance |
| `omnibox` | the immutable loghash chain records the event with its provenance |
| `notify` | the immutable loghash chain records the event with its provenance |
| `picker` | the immutable loghash chain records the event with its provenance |
| `shotpanel` | the immutable loghash chain records the event with its provenance |
| `compare` | the immutable loghash chain records the event with its provenance |
| `siteprofile` | the immutable loghash chain records the event with its provenance |
| `theme` | the immutable loghash chain records the event with its provenance |
| `locale` | the immutable loghash chain records the event with its provenance |
| `importexport` | the immutable loghash chain records the event with its provenance |
| `tour` | the immutable loghash chain records the event with its provenance |
| `pagechip` | the immutable loghash chain records the event with its provenance |
| `toast` | the immutable loghash chain records the event with its provenance |
| `recent` | the immutable loghash chain records the event with its provenance |
| `dropimport` | the immutable loghash chain records the event with its provenance |
| `library` | the immutable loghash chain records the event with its provenance |
| `syncbridge` | the immutable loghash chain records the event with its provenance |
| `attention` | the immutable loghash chain records the event with its provenance |
| `backgroundrun` | the immutable loghash chain records the event with its provenance |
| `runreplay` | the immutable loghash chain records the event with its provenance |
| `outputcompare` | the immutable loghash chain records the event with its provenance |
| `planlint` | the immutable loghash chain records the event with its provenance |
| `flowrun` | the immutable loghash chain records the event with its provenance |
| `exporttool` | the immutable loghash chain records the event with its provenance |
| `headless` | the immutable loghash chain records the event with its provenance |
| `platform` | the immutable loghash chain records the event with its provenance |
| `adapter` | the immutable loghash chain records the event with its provenance |
| `doctor` | the immutable loghash chain records the event with its provenance |
| `scaffold` | the immutable loghash chain records the event with its provenance |
| `lazyload` | the immutable loghash chain records the event with its provenance |
| `debounce` | the immutable loghash chain records the event with its provenance |
| `batchquery` | the immutable loghash chain records the event with its provenance |
| `incrsnapshot` | the immutable loghash chain records the event with its provenance |
| `selcache` | the immutable loghash chain records the event with its provenance |
| `virtlist` | the immutable loghash chain records the event with its provenance |
| `streamparse` | the immutable loghash chain records the event with its provenance |
| `chunkextract` | the immutable loghash chain records the event with its provenance |
| `perf` | the immutable loghash chain records the event with its provenance |
| `schedule` | the immutable loghash chain records the event with its provenance |
| `budget` | the immutable loghash chain records the event with its provenance |
| `timeout` | the immutable loghash chain records the event with its provenance |
| `suspend` | the immutable loghash chain records the event with its provenance |
| `runcache` | the immutable loghash chain records the event with its provenance |
| `sessionreuse` | the immutable loghash chain records the event with its provenance |
| `compress` | the immutable loghash chain records the event with its provenance |
| `logprune` | the immutable loghash chain records the event with its provenance |
| `startup` | the immutable loghash chain records the event with its provenance |
| `battery` | the immutable loghash chain records the event with its provenance |
| `network` | the immutable loghash chain records the event with its provenance |
| `warm` | the immutable loghash chain records the event with its provenance |
| `slowmo` | the immutable loghash chain records the event with its provenance |
| `queue` | the immutable loghash chain records the event with its provenance |
| `checkpoint` | the immutable loghash chain records the event with its provenance |
| `rollback` | the immutable loghash chain records the event with its provenance |
| `reap` | the immutable loghash chain records the event with its provenance |
| `lock` | the immutable loghash chain records the event with its provenance |
| `purge` | the immutable loghash chain records the event with its provenance |
| `visit` | the immutable loghash chain records the event with its provenance |
| `escalate` | the immutable loghash chain records the event with its provenance |
| `review` | the immutable loghash chain records the event with its provenance |
| `vote` | the immutable loghash chain records the event with its provenance |
| `kill` | the immutable loghash chain records the event with its provenance |
| `spawn` | the immutable loghash chain records the event with its provenance |
| `arbitrate` | the immutable loghash chain records the event with its provenance |
| `lesson` | the immutable loghash chain records the event with its provenance |
| `lane` | the immutable loghash chain records the event with its provenance |
| `scale` | the immutable loghash chain records the event with its provenance |
| `preconnect` | the immutable loghash chain records the event with its provenance |
| `reopen` | the immutable loghash chain records the event with its provenance |
| `safecheck` | the immutable loghash chain records the event with its provenance |
| `batch` | the immutable loghash chain records the event with its provenance |
| `transform` | the immutable loghash chain records the event with its provenance |
| `dedupe` | the immutable loghash chain records the event with its provenance |
| `sample` | the immutable loghash chain records the event with its provenance |
| `subscribe` | the immutable loghash chain records the event with its provenance |
| `poll` | the immutable loghash chain records the event with its provenance |
| `post` | the immutable loghash chain records the event with its provenance |
| `cache` | the immutable loghash chain records the event with its provenance |
| `correlate` | the immutable loghash chain records the event with its provenance |
| `ocr` | the immutable loghash chain records the event with its provenance |
| `vision` | the immutable loghash chain records the event with its provenance |
| `redact` | the immutable loghash chain records the event with its provenance |
| `ground` | the immutable loghash chain records the event with its provenance |
| `timelapse` | the immutable loghash chain records the event with its provenance |
| `thumb` | the immutable loghash chain records the event with its provenance |
| `sync` | the immutable loghash chain records the event with its provenance |
| `minimize` | the immutable loghash chain records the event with its provenance |
| `bridge` | the immutable loghash chain records the event with its provenance |
| `gateway` | the immutable loghash chain records the event with its provenance |
| `mcpmode` | the immutable loghash chain records the event with its provenance |
| `native` | the immutable loghash chain records the event with its provenance |

## configuration key reference

schema version: the configuration surface of the release; every documented key below appears in docs/configuration.md.

| Key | Type | Default |
| --- | --- | --- |
| `devthink.relayurl` | string | empty — the webview stays offline and no url is ever assumed |
| `devthink.phishguard threshold` | number 0 to 1 | the user threshold the lookalike watch applies |
| `devthink.ratelimit bound` | positive integer | the per origin command bound the bucket enforces |
| `devthink.ratelimit window` | positive milliseconds | the window the bucket resets on |
| `DEVTHINK_HTTP_BIND` | host string | loopback only — remote bindings refuse by default |
| `DEVTHINK_HTTP_PORT` | port number | the localhost http listener port |
| `DEVTHINK_MCP_BIND` | host string | loopback only — the mcp transport refuses plaintext remote connections |
| `DEVTHINK_MCP_PORT` | port number | the stdio and http mcp listener port |
| `DEVTHINK_MCP_PATH` | path string | the served mcp path |
| `DEVTHINK_RELAY_PATH` | path string | the socket relay path |

## storage schema reference

schema version: the frozen schema files of the 1.1.91 api freeze; every schema below lives under the dist/schemas build artifacts the tests/code sources emit.

| Schema | Scope |
| --- | --- |
| `session.schema.json` | the session lifecycle fields |
| `proposal.schema.json` | the proposal and review surface |
| `plan.schema.json` | the plan steps, the step fields and the option carrier |
| `observation.schema.json` | the observation payload with the schemaversion forward compatibility |
| `envelope.schema.json` | the response envelope outcomes |
| `capability.schema.json` | the capability manifest format |
| `audit.schema.json` | the audit event fields |
| `memory.schema.json` | the memory envelope and provenance |
| `progress.schema.json` | the progress records |
| `tool.schema.json` | the tool catalog entries with per tool versions |

## capability manifest reference

schema version: the capmanifest format of release 1.1.96 with the frozen protocol major 2; every surface below serves its manifest through the capmanifest message.

| Surface | Manifest |
| --- | --- |
| background | caps/background.json |
| cli | caps/cli.json |
| library | caps/library.json |
| mcp | caps/mcp.json |
| pagebridge | caps/pagebridge.json |
| popup | caps/popup.json |
| sidepanel | caps/sidepanel.json |

## mcp tool reference

schema version: the tool catalog of the release; every tool below appears in the built catalog the mcp server exposes with its per tool version.

| Tool | Version | Namespace |
| --- | --- | --- |
| `browser.snapshot` | 2 | browser |
| `browser.extract` | 2 | browser |
| `browser.readtext` | 2 | browser |
| `browser.readtable` | 2 | browser |
| `browser.readlinks` | 2 | browser |
| `browser.a11ytree` | 2 | browser |
| `browser.observe` | 2 | browser |
| `browser.tablist` | 2 | browser |
| `browser.windowlist` | 2 | browser |
| `browser.click` | 2 | browser |
| `browser.type` | 2 | browser |
| `browser.presskey` | 2 | browser |
| `browser.navigate` | 2 | browser |
| `browser.back` | 2 | browser |
| `browser.forward` | 2 | browser |
| `browser.reload` | 2 | browser |
| `browser.tabcreate` | 2 | browser |
| `browser.tabactivate` | 2 | browser |
| `browser.tabclose` | 2 | browser |
| `browser.windowcreate` | 2 | browser |
| `browser.windowclose` | 2 | browser |
| `browser.windowresize` | 2 | browser |
| `workflow.list` | 2 | workflow |
| `workflow.plan` | 2 | workflow |
| `workflow.review` | 2 | workflow |
| `workflow.dryrun` | 2 | workflow |
| `workflow.run` | 2 | workflow |
| `workflow.triggers` | 2 | workflow |
| `memory.list` | 2 | memory |
| `memory.variables` | 2 | memory |
| `memory.audit` | 2 | memory |
| `system.status` | 2 | system |
| `system.version` | 2 | system |
| `system.session` | 2 | system |
| `system.capabilities` | 2 | system |

## trigger and scheduler reference

schema version: the workflow trigger kinds of the immutable vocabulary; every trigger below runs inside the workflow engine.

| Trigger | Schedule |
| --- | --- |
| `visitrule` | the page visit the rule matches |
| `urlrule` | the url pattern the rule matches |
| `menurule` | the menu entry the rule fires on |
| `keyrule` | the shortcut the rule fires on |
| `buttonrule` | the button the rule fires on |
| `cronrule` | the cron expression the scheduler reads |
| `intervalrule` | the fixed interval the scheduler ticks on |
| `urllistrule` | the url list the rule matches |
| `webhookrule` | the reviewed webhook the rule answers |
| `eventrule` | the runtime event the rule listens for |

## permission and consent reference

schema version: the permission classes of the release; the three consent classes every kind grades into.

| Class | Meaning |
| --- | --- |
| `read` | the kind observes without side effects; the activeTab grant covers it |
| `interaction` | the kind moves the page; the scripting grant covers it after the review |
| `sensitive` | the kind changes state, money, credentials or the origin set; the consent window approves it beside the review |

The reference tables match the capmanifest surfaces exactly: the 23 protocol messages, the 35 mcp tools, the 181 audit kinds and the 15 cli commands of the release 1.1.96; the doccheck gate refuses any drift between a table and its source.
