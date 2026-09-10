# Devthink 2.0.3

— the prisma context home, the boundary completed, the release lane of the family

### Changed

| Area | Change |
| --- | --- |
| The prisma context home | The whole prisma context answers the web workbench the doctrine owns: the repository root carries no prisma folder anymore — the local sqlite home of the gateway lineage moves inside web/ (web/prisma/, the marker keeps the directory present so a fresh checkout resolves the local file urls without a bootstrap step), the schema stays canonical at web/schema.prisma, and every default url (prisma.config.ts, database.ts, the scaffolded templates of server.ts, the .env example, the engine silent test database) resolves file:./web/prisma/devthink.db against the new home. The scaffold creates web/prisma/ beside web/schema.prisma for the consumer, the gitignore tracks the db artifacts at their new path, and the doc trees (the gateway console page, the type documentation) draw the folder the consumer will actually see. |
| The boundary completed | The interior audit of the root surface closes the interface-versus-logic doctrine the 2.0.2 release opened: the ansi render family of ui.ts (banner, box, status bar, spinner, the format helpers — pure terminal drawing, zero business logic) merges into web/terminal-ui.tsx where the design of the whole project lives, the command family imports the drawing from the design room, and the legacy ui.ts dissolves; the glyph and destination vocabulary of workspace.ts crosses the same way (every consumer already lived in the web pages). The root keeps the logic the library owns and the web owns the drawing — the direction the doctrine pinned: the web imports the root, the root never imports the web except through the design room contract the terminal entry already carried. |
| The release lane of the family | The release workflow learns the auto-tag doctrine of the saddle line: a push to main that touches package.json and CHANGELOG.md resolves the bumped version against the latest existing tag, extracts the changelog section of the version (a version without a section refuses to ship — the release body contract), cuts the tag, archives the tagged tree at zip -9 under the family asset name and creates the release — the whole pipeline fires without a manual step, and the maintenance ladder that pre-cuts its own tags finds nothing left to cut (the version equals the tag, the detector skips). |
| The asset lanes | The four asset lanes of the rich distribution (the extension build, the container, the desktop binaries and the mobile shells) restore the workflow_run dual trigger the grand merge dropped: the release event the githubrelease job publishes with the repository token never reaches a workflow (the anti-recursion suppression the family documented), so each lane now listens to the completed DevThink Release workflow with the tag and conclusion guards, resolves the release tag from the live release when the event carries none, checks the tagged source out and attaches its artifacts on the automatic path — the sixteen assets of the 2.0.2 release needed a manual dispatch, the 2.0.3 chain assembles itself. |
| The publish lanes | The five registry lanes gain the conclusion guard (a failed release never fires a publish), the event-scoped concurrency groups (a push and its workflow_run twin run side by side, no lane cancels its sibling), the rubygems lane reads the node baseline from the .nvmrc the engines pin, and the npmjs lane degrades gracefully without NPM_TOKEN the way the family contract always stated (the token rides the environment, never an if condition). |
| The pin family | One version per action across the whole workflow corpus: setup-java answers v6.0.1 everywhere (the mobile and maven lanes carried v5.7.0, the verify lane v6.0.1), deploy-pages answers v5.0.1, the codeql action family answers v4.38.0 (the bare v4 the scorecard lane carried), and the runtime setups pin what they run (dotnet 10.0.112, ruby 3.4.10, the rust toolchain 1.120) — the mutable latest and stable the lanes carried never build the same artifact twice. |
| The envelope family | The metadata lockstep closes its gaps: DevThink.java and DevThinkCli.cs join the version stamps at 2.0.3 (they answered 2.0.0 since the merge — no gate watched them), the Dockerfile carries the version in every default the build args ride (the five places the 2.0.0 defaults stamped), the .npmrc answers the family engine policy (engine-strict false — the registry install of a consumer with a different toolchain never fails), and the extension remnants of the release machinery (the artifact catalog of release.mjs, the maven and nuget identities of pack.ts, the release notes tests) answer the devthink names the channels actually publish. The dead configs of the extension folder (the zero-byte netlify manifest, the vercel manifest, the capacitor json with the appId of the old identity) leave the tree — zero references, the mobile lane derives the real capacitor config from web/capacitor.config.ts. |
| The container hardening | The Dockerfile adopts the apt retry of the saddle standard: the update and the install retry together (five attempts, the mirror drift the family documented never fails a build), the comments of the pinned build stages drop the emulation talk the $BUILDPLATFORM pin retired, and the web netlify baseline answers the node line the .nvmrc pins (26.8.2 — the 22 the manifest carried predates the merge). |

### Fixed

| Area | Change |
| --- | --- |
| The typecheck of the root | The exactOptionalPropertyTypes discipline reaches the gateway pairing client: the context builder never assigns an explicit undefined to an optional property (the pre-generate error the whole-project typecheck carried since the merge, invisible to the build tsconfig the declaration emit rides) — and the biome config loses its duplicate suspicious block (the second key shadowed the first, the linter answered one error on its own config file). |
| The maintenance lane | The propose job of the maintenance ladder answers a real run every firing: outside its window it reports the no-op as a notice instead of skipping — the board carries green runs, never skipped jobs (the nothing-skipped doctrine). The cache retention of the cleaner and the maintenance sweep align on the family baseline (6h — the drift the two lanes carried). |
| The secrets check | The scanner gate answers its own rename: checksecrets.ts (the lowercase-no-hyphen naming doctrine) with every reference — the package script, the Dockerfile step and the internal file list — reading the same module. |

## Distribution channels

Every artifact of this release ships through the channels below. The artifact manifest records the name, the byte size, the sha256 checksum and the channels of every artifact, the checksums file covers the release set, the sbom inventory documents it and the attestations carry its provenance. Nothing auto-publishes outside the reviewed release workflow.

### npm channel

- `wenathlan-devthink-2.0.3.tgz`

The library tarball publishes to npmjs and GitHub Packages under the `@wenathlan/devthink` scope; the same tarball attaches to the release assets.

### nuget channel

- `devthink.2.0.3.nupkg`

The nupkg carries the cli, headless and mcp entries as content files beside the umd and cjs bundles, the declaration files for ide integration, the sample fixtures and the chromium extension zip.

### maven channel

- `devthink-2.0.3.pom`
- `devthink-2.0.3.jar`
- `devthink2.0.3.zip`
- `devthink-declarations-2.0.3.zip`

The single io.github.wenathlan.devthink distribution with every consumption mode embedded as jar resources; the extension zip and the declarations zip attach with their classifiers beside the one jar.

### container channel

- `devthink-container.txt`
- `devthink-container.digest`
- `devthink-container.json`

The multi stage image publishes for both linux architectures with the version tag beside the stable channel alias — the index answers linux/amd64 and linux/arm64 beside the per platform attestation entries, and no referrers fallback tag rides the package because the digest stays embedded through the image index itself and the digest files that pin the exact image hash as release assets. The image exposes the mcp server, the static site and the socket relay speaking the servercontract for self hosting.

### rubygems channel

- `devthink-2.0.3.gem`

The ruby process adapter gem of devthink.gemspec builds with the runner shim the publish workflow generates at build time and pushes to the GitHub Packages RubyGems registry beside the other four package channels; the gem spawns the devthink cli without storing credentials.

### vscode channel

- `devthink-vscode-2.0.3.vsix`

The vs code package ships as a pure zip-based vsix the operator installs from the release asset with their own credentials; the manifest declares no telemetry and no network default.

### firefox channel

- `devthink-firefox-2.0.3.xpi`

The firefox build ships as the xpi artifact; the signing and notarization path per browser is documented in docs/18.browsercoverage.md.

### safari channel

- `devthink-safari-2.0.3.zip`

The safari skeleton ships as the source asset the xcode wrapper builds from.

### chromium channel

- `devthink2.0.3.zip`
- `devthink-2.0.3-source.zip`
- `devthink-nativehost-2.0.3.template.json`

The chromium extension zip, the immutable source snapshot and the native host manifest template of the release.

### site channel

- `devthink-site-2.0.3.zip`

The hashed static site of the chatbridge surface with its immutable cache header configuration.

### declarations channel

- `devthink-declarations-2.0.3.zip`

Every declaration file and declaration map of the build for ide integration; the same zip attaches to the maven channel with the declarations classifier.

### provenance channel

- `devthink-sbom-2.0.3.json`
- `devthink-attestations-2.0.3.json`
- `devthink-artifactmanifest-2.0.3.json`

The cyclonedx inventory of every artifact, the provenance attestations of the release set and the artifact manifest with names, sizes, checksums and channels.

### github channel

- `wenathlan-devthink-2.0.3.tgz`
- `devthink.2.0.3.nupkg`
- `devthink-2.0.3.pom`
- `devthink-2.0.3.jar`
- `devthink-2.0.3.gem`
- `devthink-container.txt`
- `devthink-container.digest`
- `devthink-container.json`
- `devthink-vscode-2.0.3.vsix`
- `devthink-firefox-2.0.3.xpi`
- `devthink-safari-2.0.3.zip`
- `devthink2.0.3.zip`
- `devthink-2.0.3-source.zip`
- `devthink-nativehost-2.0.3.template.json`
- `devthink-site-2.0.3.zip`
- `devthink-declarations-2.0.3.zip`
- `devthink-sbom-2.0.3.json`
- `devthink-attestations-2.0.3.json`
- `devthink-artifactmanifest-2.0.3.json`
- `SHA256SUMS.txt`
- `RELEASENOTES.md`

Every artifact above attaches to the release of the immutable tag beside the checksums file and these notes; the release stays a draft until the verification step downloads every asset and verifies the checksums.

## The chain to this candidate

Every release from the 1.1.31 base to this candidate, grouped by the phases the roadmap declared: 112 released versions the changelog records, 69 roadmap sections the phases draw their titles from.

### The base (1.1.31)

- 1.1.31 — the frozen baseline the chain builds on

### The agentic core (1.1.32 – 1.1.47)

- 1.1.47 — debugging part three
- 1.1.46 — debugging part two
- 1.1.45 — debugging part one
- 1.1.44 — network control
- 1.1.43 — network observation part two
- 1.1.42 — network observation part one
- 1.1.41 — media capture part two
- 1.1.40 — media capture part one
- 1.1.39 — files clipboard and downloads
- 1.1.38 — forms and data part two
- 1.1.37 — forms and data part one
- 1.1.36 — tabs and windows command
- 1.1.35 — navigation mastery
- 1.1.34 — observation depth
- 1.1.33 — interaction universe completion
- 1.1.32 — unlimited agentic core

### The platform depth (1.1.48 – 1.1.63)

- 1.1.63 — session interface
- 1.1.62 — security part two
- 1.1.61 — security part one
- 1.1.60 — execution environments
- 1.1.59 — multi agent part two
- 1.1.58 — multi agent part one
- 1.1.57 — llm integration
- 1.1.56 — agent protocol part three
- 1.1.55 — agent protocol part two
- 1.1.54 — agent protocol part one
- 1.1.53 — workflow editor interface
- 1.1.52 — triggers and scheduling
- 1.1.51 — workflow engine part two
- 1.1.50 — workflow engine part one
- 1.1.49 — memory part one
- 1.1.48 — emulation

### The interface and ecosystem surface (1.1.64 – 1.1.79)

- 1.1.79 — data minimization
- 1.1.78 — capture forensics
- 1.1.77 — vision and ocr
- 1.1.76 — web api coverage
- 1.1.75 — data pipelines
- 1.1.74 — navigation intelligence
- 1.1.73 — multi agent part four
- 1.1.72 — multi agent part three
- 1.1.71 — state depth
- 1.1.70 — resilience
- 1.1.69 — performance part two
- 1.1.68 — performance part one
- 1.1.67 — ecosystem part two
- 1.1.66 — ecosystem part one
- 1.1.65 — interface surfaces part two
- 1.1.64 — interface surfaces part one

### The operator surface (1.1.80 – 1.1.90)

- 1.1.90 — feature audit
- 1.1.89 — quality gates
- 1.1.88 — documentation
- 1.1.87 — publishing pipeline
- 1.1.86 — browser coverage
- 1.1.85 — native host bridge
- 1.1.84 — mcp server mode
- 1.1.83 — gateway integration
- 1.1.82 — site integration
- 1.1.81 — library modes
- 1.1.80 — cli expansion

### The freeze, the certification and the candidates (1.1.91 – 1.1.99)

- 1.1.99 — release candidate one
- 1.1.98 — the clean repository shape restoration
- 1.1.97 — example gallery
- 1.1.96 — documentation completion
- 1.1.95 — multi agent certification
- 1.1.94 — security hardening
- 1.1.93 — performance hardening
- 1.1.92 — migration tools
- 1.1.91 — api freeze

### The migration steps for upgraders

The wire speaks protocol major two since the 1.1.91 api freeze while every version one message stays accepted through the deprecation window that closes at 2.0.0 with one warning per session; upgraders from the 1.1.x line keep their storage, their sessions and their settings because the storage schemas stay frozen under the freeze artifact, the permission set stays pinned by the permission diff baseline and no data migration step is required before 2.0.0. The 2.0.0 release candidate carries the migrateplan command with the automa, selenium, ui vision and tabular importers for plans authored outside devthink.

### The frozen protocol guarantees

The 1.1.91 api freeze pins the wire: the frozen message catalog of twenty three messages with their ten schemas, the immutable action kind identifiers of the three hundred thirty five kind vocabulary, the five wire error codes beside the six terminal exit codes, the per tool versions of the mcp catalog and the seven capability manifests — every surface answers the freeze gate with the same hashes the artifact records, and a client that speaks major one keeps working through the deprecation window.

### The certified scenarios

The agent certification of the 1.1.96 release drives thirty coordination scenarios end to end over the fake tabs of every browser kind with the fake clock: the leader worker topology, the planner executor critic verifier split, the shared queue with its lanes and work stealing, the blackboard, the tab handoffs, the resource locks, the result merging, the consensus rounds, the emergency stops, the sub agent depth limits and the pool item coverage. The cost certification adds its nine budget checks and the first release candidate adds the defect sweep, the verification matrix and the telemetry free verification of this release.

### The performance budget results

The build enforces a byte budget on every dist target and fails when a bundle overgrows it; the budgets with the measured sizes of this candidate live in docs/perfbudgets.md beside the startup, latency and memory ceilings the run budget gates keep (the heartbeat window default, the task tab ceiling, the timeout ceilings and the memory budget ratio the run budget validation enforces).

### The security review summary

The security posture of the candidate: the permission set stays at its pinned baseline with the permission diff gate, the content security policy stays strict with its hashes audited, the pentest gate drives its twenty one checklist entries against the shipped bundles, the code scanning alerts of the 1.1.89 fixes stayed closed and the telemetry free verification of this release proves zero outbound requests behind the block all proxy.

