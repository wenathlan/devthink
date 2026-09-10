# Devthink 2.0.13

— the watchdog learns a finished check is a pass, the emulated leg answers green

### Fixed

| Area | Change |
| --- | --- |
| The container smoke race | The ghcr lane's arm64 leg died at the build-time smoke boot with "the container runner died" while the runner's own log carried the check's success line two seconds earlier — the qemu-emulated leg spawns each watchdog probe as a fresh node process that boots slowly enough for the runner to finish its whole check lifecycle (health endpoint, site index, relay refusal, mcp ping) and exit zero before the probe's fetch ever lands, so the closed server read as a dead one. The death branch of the smoke now waits for the runner's recorded exit status: a zero answers the pass the self-check already proved (the check mode exits nonzero the moment any surface misbehaves), a nonzero keeps the death message it always carried, and the post-healthz wait keeps catching a runner that dies after the watchdog sees it live. The emulated and the native legs answer the same smoke, and the native window the ladder always passed keeps its behavior byte for byte. |

## Distribution channels

Every artifact of this release ships through the channels below. The artifact manifest records the name, the byte size, the sha256 checksum and the channels of every artifact, the checksums file covers the release set, the sbom inventory documents it and the attestations carry its provenance. Nothing auto-publishes outside the reviewed release workflow.

### npm channel

- `wenathlan-devthink-2.0.13.tgz`

The library tarball publishes to npmjs and GitHub Packages under the `@wenathlan/devthink` scope; the same tarball attaches to the release assets.

### nuget channel

- `devthink.2.0.13.nupkg`

The nupkg carries the cli, headless and mcp entries as content files beside the umd and cjs bundles, the declaration files for ide integration, the sample fixtures and the chromium extension zip.

### maven channel

- `devthink-2.0.13.pom`
- `devthink-2.0.13.jar`
- `devthink2.0.13.zip`
- `devthink-declarations-2.0.13.zip`

The single io.github.wenathlan.devthink distribution with every consumption mode embedded as jar resources; the extension zip and the declarations zip attach with their classifiers beside the one jar.

### container channel

- `devthink-container.txt`
- `devthink-container.digest`
- `devthink-container.json`

The multi stage image publishes for both linux architectures with the version tag beside the stable channel alias — the index answers linux/amd64 and linux/arm64 beside the per platform attestation entries, and no referrers fallback tag rides the package because the digest stays embedded through the image index itself and the digest files that pin the exact image hash as release assets. The image exposes the mcp server, the static site and the socket relay speaking the servercontract for self hosting.

### rubygems channel

- `devthink-2.0.13.gem`

The ruby process adapter gem of devthink.gemspec builds with the runner shim the publish workflow generates at build time and pushes to the GitHub Packages RubyGems registry beside the other four package channels; the gem spawns the devthink cli without storing credentials.

### vscode channel

- `devthink-vscode-2.0.13.vsix`

The vs code package ships as a pure zip-based vsix the operator installs from the release asset with their own credentials; the manifest declares no telemetry and no network default.

### firefox channel

- `devthink-firefox-2.0.13.xpi`

The firefox build ships as the xpi artifact; the signing and notarization path per browser is documented in docs/18.browsercoverage.md.

### safari channel

- `devthink-safari-2.0.13.zip`

The safari skeleton ships as the source asset the xcode wrapper builds from.

### chromium channel

- `devthink2.0.13.zip`
- `devthink-2.0.13-source.zip`
- `devthink-nativehost-2.0.13.template.json`

The chromium extension zip, the immutable source snapshot and the native host manifest template of the release.

### site channel

- `devthink-site-2.0.13.zip`

The hashed static site of the chatbridge surface with its immutable cache header configuration.

### declarations channel

- `devthink-declarations-2.0.13.zip`

Every declaration file and declaration map of the build for ide integration; the same zip attaches to the maven channel with the declarations classifier.

### provenance channel

- `devthink-sbom-2.0.13.json`
- `devthink-attestations-2.0.13.json`
- `devthink-artifactmanifest-2.0.13.json`

The cyclonedx inventory of every artifact, the provenance attestations of the release set and the artifact manifest with names, sizes, checksums and channels.

### github channel

- `wenathlan-devthink-2.0.13.tgz`
- `devthink.2.0.13.nupkg`
- `devthink-2.0.13.pom`
- `devthink-2.0.13.jar`
- `devthink-2.0.13.gem`
- `devthink-container.txt`
- `devthink-container.digest`
- `devthink-container.json`
- `devthink-vscode-2.0.13.vsix`
- `devthink-firefox-2.0.13.xpi`
- `devthink-safari-2.0.13.zip`
- `devthink2.0.13.zip`
- `devthink-2.0.13-source.zip`
- `devthink-nativehost-2.0.13.template.json`
- `devthink-site-2.0.13.zip`
- `devthink-declarations-2.0.13.zip`
- `devthink-sbom-2.0.13.json`
- `devthink-attestations-2.0.13.json`
- `devthink-artifactmanifest-2.0.13.json`
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

