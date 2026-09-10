# Devthink 2.0.12

— the interface dissolves into the web root, one folder serves every surface

### Changed

| Area | Change |
| --- | --- |
| The flat web root | The web/extension folder dissolves: every interface file it carried now rides flat at the web root — web/manifest.json (the single source manifest the firefox, safari and vsix overlays inherit), web/sitemanifest.json, web/icons.ts (the text-only png family the build materializes), web/design.html (the one design file the surface switcher activates, carrying every surface template and the shared stylesheet) and the five surface modules (web/popup.ts, web/sidepanel.ts, web/optionspage.ts, web/dashboardpage.ts, web/transparencypage.ts) with their root imports re-keyed one level up. The web folder is the one universal interface the whole product answers from — the extension, the deployed site, the android and ios shells, the tv and the desktop — so a second folder named after one of its surfaces no longer exists (the saddle layout: web/manifest.json beside web/index.html, no interface subfolder). The packaged extension stays what it always was — a release-notes asset the runner assembles into dist/devthink<version>.zip — never a folder the repository carries. The web workbench typecheck gains the chrome vocabulary the surface modules speak (the @types/chrome entry the mirror already carried), the build engine, the workflows and every gate read the flat paths, and the npm files allowlist ships the nine flat entries the folder used to cover. |

### Fixed

| Area | Change |
| --- | --- |
| The desktop version gate | The desktop lane's version check asked the compiled binary for --version through a non tty shell, and the cli answered with the usage banner: an empty positional under a piped stdin falls back to the help command, and the help dispatch ran before the version dispatch ever saw the flag — so the gate compared the whole banner against the bare version string and failed every leg. The explicit --version flag now answers before the implicit help fallback (the desktop gate, piped scripts and the container probe all pass the flag without a positional), and --help keeps answering the banner it always printed. |
| The gallery timeout under emulation | The ghcr arm64 leg runs the vitest suite inside the emulated builder, and the recorded-artifact check of the example gallery re-executed the recipes gate on the stale artifact — a pass that costs two seconds native crossed the five second default under QEMU and the builder died at the timeout the test never declared. The check now carries the scalable ceiling the library modes family set first: the DEVTHINK_TEST_TIMEOUT_MS budget the container exports for the emulated legs (120 seconds there, the same ceiling as the suite runner beside it) with the 120 second local default. |

## Distribution channels

Every artifact of this release ships through the channels below. The artifact manifest records the name, the byte size, the sha256 checksum and the channels of every artifact, the checksums file covers the release set, the sbom inventory documents it and the attestations carry its provenance. Nothing auto-publishes outside the reviewed release workflow.

### npm channel

- `wenathlan-devthink-2.0.12.tgz`

The library tarball publishes to npmjs and GitHub Packages under the `@wenathlan/devthink` scope; the same tarball attaches to the release assets.

### nuget channel

- `devthink.2.0.12.nupkg`

The nupkg carries the cli, headless and mcp entries as content files beside the umd and cjs bundles, the declaration files for ide integration, the sample fixtures and the chromium extension zip.

### maven channel

- `devthink-2.0.12.pom`
- `devthink-2.0.12.jar`
- `devthink2.0.12.zip`
- `devthink-declarations-2.0.12.zip`

The single io.github.wenathlan.devthink distribution with every consumption mode embedded as jar resources; the extension zip and the declarations zip attach with their classifiers beside the one jar.

### container channel

- `devthink-container.txt`
- `devthink-container.digest`
- `devthink-container.json`

The multi stage image publishes for both linux architectures with the version tag beside the stable channel alias — the index answers linux/amd64 and linux/arm64 beside the per platform attestation entries, and no referrers fallback tag rides the package because the digest stays embedded through the image index itself and the digest files that pin the exact image hash as release assets. The image exposes the mcp server, the static site and the socket relay speaking the servercontract for self hosting.

### rubygems channel

- `devthink-2.0.12.gem`

The ruby process adapter gem of devthink.gemspec builds with the runner shim the publish workflow generates at build time and pushes to the GitHub Packages RubyGems registry beside the other four package channels; the gem spawns the devthink cli without storing credentials.

### vscode channel

- `devthink-vscode-2.0.12.vsix`

The vs code package ships as a pure zip-based vsix the operator installs from the release asset with their own credentials; the manifest declares no telemetry and no network default.

### firefox channel

- `devthink-firefox-2.0.12.xpi`

The firefox build ships as the xpi artifact; the signing and notarization path per browser is documented in docs/18.browsercoverage.md.

### safari channel

- `devthink-safari-2.0.12.zip`

The safari skeleton ships as the source asset the xcode wrapper builds from.

### chromium channel

- `devthink2.0.12.zip`
- `devthink-2.0.12-source.zip`
- `devthink-nativehost-2.0.12.template.json`

The chromium extension zip, the immutable source snapshot and the native host manifest template of the release.

### site channel

- `devthink-site-2.0.12.zip`

The hashed static site of the chatbridge surface with its immutable cache header configuration.

### declarations channel

- `devthink-declarations-2.0.12.zip`

Every declaration file and declaration map of the build for ide integration; the same zip attaches to the maven channel with the declarations classifier.

### provenance channel

- `devthink-sbom-2.0.12.json`
- `devthink-attestations-2.0.12.json`
- `devthink-artifactmanifest-2.0.12.json`

The cyclonedx inventory of every artifact, the provenance attestations of the release set and the artifact manifest with names, sizes, checksums and channels.

### github channel

- `wenathlan-devthink-2.0.12.tgz`
- `devthink.2.0.12.nupkg`
- `devthink-2.0.12.pom`
- `devthink-2.0.12.jar`
- `devthink-2.0.12.gem`
- `devthink-container.txt`
- `devthink-container.digest`
- `devthink-container.json`
- `devthink-vscode-2.0.12.vsix`
- `devthink-firefox-2.0.12.xpi`
- `devthink-safari-2.0.12.zip`
- `devthink2.0.12.zip`
- `devthink-2.0.12-source.zip`
- `devthink-nativehost-2.0.12.template.json`
- `devthink-site-2.0.12.zip`
- `devthink-declarations-2.0.12.zip`
- `devthink-sbom-2.0.12.json`
- `devthink-attestations-2.0.12.json`
- `devthink-artifactmanifest-2.0.12.json`
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

