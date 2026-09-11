# Devthink 2.0.14

— the saddle workflow features answer the container product, the family surface completes

### Changed

| Area | Change |
| --- | --- |
| The four-architecture container index | The publish lane ships the family union surface the saddle publish lane established: linux/amd64, linux/arm64, linux/ppc64le and linux/s390x in one versioned index with provenance and sbom, the qemu setup pinning exactly the three emulated legs, the idempotent publish check comparing the four-arch sorted set, and the post-publish assertion fixing the published surface the same way. The runtime base gains its own arg — the trixie slim line is the only 26.8.x slim tag whose manifest still answers all four architectures (26.8.2 dropped s390x in every variant, an upstream build gap; bookworm never carried it), so the build stages keep the pinned toolchain line while the runtime rides the four-arch base, and the smoke-boot watchdog scales its budget for the ppc64le and s390x legs the same way the builder scales its test timeouts for the emulated arm64 (30 seconds native, 90 under qemu). |
| The security lane at push time | The saddle security features the merge left behind ride the security workflow: the biome security gate (the isolated config that elevates the security rule group to blocking severity over the merged tree, with the family lockfile exclusions the integrity hashes would trip), the container image scan (the runtime target built from the shared registry buildcache, dockle with the publish lane's own tuned accept-key list, the trivy sarif report uploaded to code scanning, the critical gate — informational on push, the hard gates stay at publish time), and the cleanup contract (the gha caches a run creates are deleted when the pipeline finishes, the registry buildcache stays). The maintenance ladder's completion gate keeps firing on the green pipeline the informational scans preserve. |
| The deno compatibility leg | The runtime compatibility matrix gains the deno leg the engines field always declared: the built deno entry answers deno check and the import smoke (the same battery the verify modes job runs, the saddle root-probe doctrine — every runtime the library declares carries its own compatibility lane). |
| The mobile release signing surface | The android lane graduates from debug artifacts to the saddle release recipe: the sdkmanager platform and build-tools step, the version stamp that injects the keystore loader, the signingConfigs.release block and the r8-and-resource-shrinking release buildType, the signing three-way (the caller-owned keystore when the production secrets exist, the clearly labeled ci-test-key when a release fires without them, a hard fail on a manual build that carries neither), the apksigner and jarsigner verification of every shipped apk and aab, and the manifest recording which path answered. The ios ipa lane lands beside the simulator lane: the Apple keychain recipe (the distribution certificate and the provisioning profile the secrets carry, the export options plist), the xcodebuild archive and export, and the guard that keeps it off until the secrets or the repository variable exist — the simulator stays the no-secrets iOS surface. |
| The tauri desktop shell | The desktop workflow gains the gui lane the saddle desktop surface always carried (a desktop application is not a virtualization surface — the whole lane ports): the seven-leg platform matrix (linux x64 and arm64, windows x86, x64 and arm64, macos x64 and arm64), the pinned rust toolchain the security lane's audit already pins (never the moving stable channel), the runner-side scaffold (the cargo manifest, the entry sources and the copied root tauri.conf.json with runner-relative paths — the native wrapper doctrine, the shell is toolchain output, never tracked), the icons derived on every leg from the new web/icon.svg source (the 1024px mark, nothing committed pre-rendered), the signed and unsigned build paths (the caller's windows certificate and the apple notarization when the secrets exist, the unsigned path otherwise), and the per-platform bundle assets beside the compiled binary lane. The root tauri.conf.json joins the version lockstep (the release sync stamps it with every bump), and the build/ workspace the lanes scratch joins the ignore file. |

## Distribution channels

Every artifact of this release ships through the channels below. The artifact manifest records the name, the byte size, the sha256 checksum and the channels of every artifact, the checksums file covers the release set, the sbom inventory documents it and the attestations carry its provenance. Nothing auto-publishes outside the reviewed release workflow.

### npm channel

- `wenathlan-devthink-2.0.14.tgz`

The library tarball publishes to npmjs and GitHub Packages under the `@wenathlan/devthink` scope; the same tarball attaches to the release assets.

### nuget channel

- `devthink.2.0.14.nupkg`

The nupkg carries the cli, headless and mcp entries as content files beside the umd and cjs bundles, the declaration files for ide integration, the sample fixtures and the chromium extension zip.

### maven channel

- `devthink-2.0.14.pom`
- `devthink-2.0.14.jar`
- `devthink2.0.14.zip`
- `devthink-declarations-2.0.14.zip`

The single io.github.wenathlan.devthink distribution with every consumption mode embedded as jar resources; the extension zip and the declarations zip attach with their classifiers beside the one jar.

### container channel

- `devthink-container.txt`
- `devthink-container.digest`
- `devthink-container.json`

The multi stage image publishes for the four linux architectures of the family union surface with the version tag — the index answers linux/amd64, linux/arm64, linux/ppc64le and linux/s390x beside the per platform attestation entries, and no stable channel alias or referrers fallback tag rides the package because the version tag is the immutable coordinate an operator pins and the digest files embed the exact image hash as release assets. The image exposes the mcp server, the static site and the socket relay speaking the servercontract for self hosting.

### rubygems channel

- `devthink-2.0.14.gem`

The ruby process adapter gem of devthink.gemspec builds with the runner shim the publish workflow generates at build time and pushes to the GitHub Packages RubyGems registry beside the other four package channels; the gem spawns the devthink cli without storing credentials.

### vscode channel

- `devthink-vscode-2.0.14.vsix`

The vs code package ships as a pure zip-based vsix the operator installs from the release asset with their own credentials; the manifest declares no telemetry and no network default.

### firefox channel

- `devthink-firefox-2.0.14.xpi`

The firefox build ships as the xpi artifact; the signing and notarization path per browser is documented in docs/18.browsercoverage.md.

### safari channel

- `devthink-safari-2.0.14.zip`

The safari skeleton ships as the source asset the xcode wrapper builds from.

### chromium channel

- `devthink2.0.14.zip`
- `devthink-2.0.14-source.zip`
- `devthink-nativehost-2.0.14.template.json`

The chromium extension zip, the immutable source snapshot and the native host manifest template of the release.

### site channel

- `devthink-site-2.0.14.zip`

The hashed static site of the chatbridge surface with its immutable cache header configuration.

### declarations channel

- `devthink-declarations-2.0.14.zip`

Every declaration file and declaration map of the build for ide integration; the same zip attaches to the maven channel with the declarations classifier.

### provenance channel

- `devthink-sbom-2.0.14.json`
- `devthink-attestations-2.0.14.json`
- `devthink-artifactmanifest-2.0.14.json`

The cyclonedx inventory of every artifact, the provenance attestations of the release set and the artifact manifest with names, sizes, checksums and channels.

### github channel

- `wenathlan-devthink-2.0.14.tgz`
- `devthink.2.0.14.nupkg`
- `devthink-2.0.14.pom`
- `devthink-2.0.14.jar`
- `devthink-2.0.14.gem`
- `devthink-container.txt`
- `devthink-container.digest`
- `devthink-container.json`
- `devthink-vscode-2.0.14.vsix`
- `devthink-firefox-2.0.14.xpi`
- `devthink-safari-2.0.14.zip`
- `devthink2.0.14.zip`
- `devthink-2.0.14-source.zip`
- `devthink-nativehost-2.0.14.template.json`
- `devthink-site-2.0.14.zip`
- `devthink-declarations-2.0.14.zip`
- `devthink-sbom-2.0.14.json`
- `devthink-attestations-2.0.14.json`
- `devthink-artifactmanifest-2.0.14.json`
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

