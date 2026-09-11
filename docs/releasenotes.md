# Devthink 2.0.16

— the workflow grouping pass, the built package fix and the five-architecture container

### Changed

| Area | Change |
| --- | --- |
| The workflow grouping | The twenty-five workflow files the 2.0.15 board answered scattered and desynchronized fold into seven files grouped by correlated logic (the owner directive): the post-release lanes — the six registry publishes (npmjs, the github npm registry, maven, nuget, rubygems and the ghcr container index), the platform artifact lanes (the compiled desktop binaries, the tauri bundles, the android and ios mobile artifacts, the container archive, the browser extension package and the target plans) and the SHA256SUMS umbrella that closes the wave — ride one DevThink Publish file wired by the needs chain; the runtime compatibility lanes join the DevThink CI file the manual orchestrator always carried; the codeql analysis, the OSSF scorecard, the security policy drift gate and the workflow lint ride the DevThink Security battery; the package retirement lane and the cache retention job ride the DevThink Maintenance ladder. Every job keeps its own conclusion guard, its own resolver and its own timeout — the lanes are the same lanes, the files they answer from are seven. |
| The npm package ships built | The 2.0.15 registry answered a source tarball: the publish lanes published the repository root manifest (whose files field carried the development tree and whose main resolved a dist path no tarball carried) while the release ladder's own npmjs job — the one that publishes the packed flat distribution — lost the race the dual-trigger fires. The lanes now pack the staged tree (npm pack ./distpackage) and publish that tarball: the built entries at the package root, the generated manifest with root-level entry paths, the package-scoped checksums.txt signature the extension release always carried, and the provenance attestation on the npmjs publish (the release signature that goes to npm — the owner demand). The race the dual trigger answers becomes harmless: both lanes publish the identical built content, the existence check and the race-tolerant retry resolve the overlap, and the root manifest's files field now answers the staging tree alone so no publish path can ever ship the source tree again. |
| The five-architecture container | The container index gains its fifth architecture: linux/riscv64 beside amd64, arm64, ppc64le and s390x (the owner directive — the architectures are five). The node image manifests cannot answer that surface (the official node images carry four), so the runtime stage rides the multi-architecture debian:trixie-slim base and the node tree arrives from the verified nodejs.org tarballs a new native nodefetch stage extracts — the four official arches from the nodejs.org distribution and riscv64 from the unofficial-builds pointer-compression release, every tarball checksum-verified against the published SHASUMS256 before it enters the image. The qemu pin installs the riscv64 binfmt handler, the publish ceiling rides the family 240-minute QEMU doctrine, and the index assertion fixes the five-arch surface the registry answers. |
| The container latest realignment | The container never landed on latest through 2.0.15 (the owner report: the container is not deploying and never stays on latest): the publish failed at the dockle gate before the push, and the version-only tagging doctrine left the latest alias unmoved. The publish now answers with the version tag and the latest alias together — the version stays the immutable coordinate an operator pins, latest moves to the version this pipeline published (the maene dist-tag doctrine the npm lanes always carried), and the dockle FATAL that killed the publish is closed at the root: the runtime stage no longer declares the TARGETARCH build arg whose layer history the CIS-DI-0010 heuristic misread as a credential holder — the smoke-boot watchdog reads the runtime's own machine name (uname -m) instead. |
| The embedded build cache | The registry buildcache package is gone (the owner directive: the build cache embeds inside the workflow, never published beside the product): the container builds of the publish lane and the security scan read and write the gha cache storage the workflow run owns — created, used and cleaned inside the run — and the retired devthink-buildcache package reference leaves every workflow file (the workflow control gate now forbids it). The cache retention the maintenance ladder runs and the post-run cleanup the security battery carries answer the bounded lifecycle. |
| The sums umbrella closure | The release checksum signature was a one-line umbrella on 2.0.15: the standalone sums lane fired beside the artifact lanes and summed an asset set the lanes had not attached yet. The umbrella now rides the needs chain over every publish and artifact lane of the merged file — it rebuilds only after the lanes attached their assets, the rebuild stays idempotent and byte-reproducible over whatever landed, and the SHA256SUMS the release carries covers the complete asset surface. |
| The web tauri configuration | The tauri configuration joins the web root (the design center owns every platform surface — the owner directive): web/tauri.conf.json answers where the interface sources live, the desktop tauri lane gates on it and copies it into the runner-side scaffold with runner-relative paths, and the release metadata sync stamps it in lockstep with every other version coordinate. |
| The desktop macos legs | The 2.0.15 desktop tauri legs died on the macos runners twice: the collect step called sha256sum (a coreutils binary the macos images never carried — the lane answers shasum -a 256 there, the same wire format) and the intel leg could not install the standalone pnpm binary at all (the upstream Node.js SEA bug the pnpm error names — the intel leg falls back to the npm-managed install the pnpm workaround documents while every other leg keeps the self-contained binary). |
| The toolchain line | The package manager rides the current line: pnpm 12.3.4 (the lockfile regenerated under it, the supply-chain policy pass green, the web typecheck green), the runtime dependency set answers the latest non-breaking surface (@libsql/client 0.18, vitest 5, the node 26 types line), and the engines floors stay the node 26.8.2 / npm 12.0.2 / bun 1.4.2 pins the registry verifies. |

## Distribution channels

Every artifact of this release ships through the channels below. The artifact manifest records the name, the byte size, the sha256 checksum and the channels of every artifact, the checksums file covers the release set, the sbom inventory documents it and the attestations carry its provenance. Nothing auto-publishes outside the reviewed release workflow.

### npm channel

- `wenathlan-devthink-2.0.16.tgz`

The library tarball publishes to npmjs and GitHub Packages under the `@wenathlan/devthink` scope; the same tarball attaches to the release assets.

### nuget channel

- `devthink.2.0.16.nupkg`

The nupkg carries the cli, headless and mcp entries as content files beside the umd and cjs bundles, the declaration files for ide integration, the sample fixtures and the chromium extension zip.

### maven channel

- `devthink-2.0.16.pom`
- `devthink-2.0.16.jar`
- `devthink2.0.16.zip`
- `devthink-declarations-2.0.16.zip`

The single io.github.wenathlan.devthink distribution with every consumption mode embedded as jar resources; the extension zip and the declarations zip attach with their classifiers beside the one jar.

### container channel

- `devthink-container.txt`
- `devthink-container.digest`
- `devthink-container.json`

The multi stage image publishes for the five linux architectures of the family union surface — the index answers linux/amd64, linux/arm64, linux/ppc64le, linux/s390x and linux/riscv64 beside the per platform attestation entries — with the version tag and the latest channel alias the 2.0.16 realignment carries: the version tag stays the immutable coordinate an operator pins, the latest alias moves to the version this pipeline published (the maene dist-tag doctrine the npm lanes always carried, so docker pull devthink:latest answers the current release), and no referrers fallback tag rides the package because the digest files embed the exact image hash as release assets. The node runtime arrives from the verified nodejs.org tarballs on the debian trixie slim base whose manifest carries every architecture of the index. The image exposes the mcp server, the static site and the socket relay speaking the servercontract for self hosting.

### rubygems channel

- `devthink-2.0.16.gem`

The ruby process adapter gem of devthink.gemspec builds with the runner shim the publish workflow generates at build time and pushes to the GitHub Packages RubyGems registry beside the other four package channels; the gem spawns the devthink cli without storing credentials.

### vscode channel

- `devthink-vscode-2.0.16.vsix`

The vs code package ships as a pure zip-based vsix the operator installs from the release asset with their own credentials; the manifest declares no telemetry and no network default.

### firefox channel

- `devthink-firefox-2.0.16.xpi`

The firefox build ships as the xpi artifact; the signing and notarization path per browser is documented in docs/18.browsercoverage.md.

### safari channel

- `devthink-safari-2.0.16.zip`

The safari skeleton ships as the source asset the xcode wrapper builds from.

### chromium channel

- `devthink2.0.16.zip`
- `devthink-2.0.16-source.zip`
- `devthink-nativehost-2.0.16.template.json`

The chromium extension zip, the immutable source snapshot and the native host manifest template of the release.

### site channel

- `devthink-site-2.0.16.zip`

The hashed static site of the chatbridge surface with its immutable cache header configuration.

### declarations channel

- `devthink-declarations-2.0.16.zip`

Every declaration file and declaration map of the build for ide integration; the same zip attaches to the maven channel with the declarations classifier.

### provenance channel

- `devthink-sbom-2.0.16.json`
- `devthink-attestations-2.0.16.json`
- `devthink-artifactmanifest-2.0.16.json`

The cyclonedx inventory of every artifact, the provenance attestations of the release set and the artifact manifest with names, sizes, checksums and channels.

### github channel

- `wenathlan-devthink-2.0.16.tgz`
- `devthink.2.0.16.nupkg`
- `devthink-2.0.16.pom`
- `devthink-2.0.16.jar`
- `devthink-2.0.16.gem`
- `devthink-container.txt`
- `devthink-container.digest`
- `devthink-container.json`
- `devthink-vscode-2.0.16.vsix`
- `devthink-firefox-2.0.16.xpi`
- `devthink-safari-2.0.16.zip`
- `devthink2.0.16.zip`
- `devthink-2.0.16-source.zip`
- `devthink-nativehost-2.0.16.template.json`
- `devthink-site-2.0.16.zip`
- `devthink-declarations-2.0.16.zip`
- `devthink-sbom-2.0.16.json`
- `devthink-attestations-2.0.16.json`
- `devthink-artifactmanifest-2.0.16.json`
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

