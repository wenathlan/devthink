# Devthink 2.0.2

— the design room boundary, the freeze resync, the latent red of the dissolved envelope

### Changed

| Area | Change |
| --- | --- |
| The design room boundary | The interior of every root logic answers the interface-versus-logic doctrine: the browser gateway pairing client (gateway.ts) leaves the web design room for the repository root — the one piece of web that was logic all along (the pairing context, the token store, the fetch wrapper: pure TypeScript against the DOM surface, no design) — while the ink terminal workspace (terminal-ui.tsx) crosses the other way: the terminal design is design, so the component that draws the compact workspace grammar joins the web design room where the design of the whole project lives (the cli, the pages, the vercel and netlify surfaces, the tv and android shells). Six workbench pages (providers, console, routes, usage, settings, projects) import the gateway client from the root across the boundary, the devthink command family imports the terminal workspace from the design room, and the vite server of the workbench opens its file-system allow to the repository root so the dev server serves the shared sources the same way the build bundles them. The root tsconfig keeps the logic check, the web tsconfig typechecks the design with the shared logic it imports, and both answer green over the moved files. |
| The frozen contract resync | The 2.0.1 consolidation re-keyed the merged lineages behind devthink surfaces and the frozen contract hashes moved with the text: the audit event names, the frozen message catalog, the error code table and the permission coverage drifted from the pinned hashes without a release bump, so the verify gate refused the release candidate (the readiness review answered no-go at twenty-six of twenty-seven). This release is the bump the freeze doctrine demands: the version moves, the freeze artifact re-freezes at the release, the permission baseline re-records, and the ladder answers green again. |
| The metadata envelope catalog | The release metadata sync stops requiring the mobile package envelope the 2.0.1 consolidation dissolved: the mobile identity lives at the web root (web/capacitor.config.ts) and the shell builds in the mobile lane, so no mobile/package.json ever exists again — the sync catalog of required envelopes drops the entry and the latent red (the maintenance metadata gate would refuse every future sync over a file the standard retired) closes at the root. The maintenance ladder learns the container image clock: the official node images publish behind the nodejs.org releases, so the node baseline walks the stable line back to the newest release whose pinned bookworm-slim image exists — the 2.0.2 candidate stamped 26.8.1 when the registry carried no image of the 26.8.2 the index shipped, and the registry published the image hours later while the release lane verified the tag, so the baseline rides 26.8.2 the moment the image lands. The workflow renders compose per file so no pin entry resurrects the bytes a sibling entry retired (the duplicate render the container gate caught), and every workflow lane — the six build lanes beside the four publish lanes and the security lane the 26.7.0 pins carried — reads the one baseline the runtime policy pins across the engines, the nvmrc and the container image arg. |

### Fixed

| Area | Change |
| --- | --- |
| The verify lane red | The release candidate lane of 2.0.1 failed the api freeze step and the readiness review behind it; this bump re-synchronizes the freeze and the baseline so the gate ladder answers green end to end again. |
| The security posture | The one hundred open code scanning alerts of the merged repository answer the family policy: the ninety-six pinned-dependencies findings carry the documented version-tag contract dismissal (the maintenance ladder owns the update cycle, the version tag is the dependency contract of the family), the two cache-poisoning findings carry the release lockstep dismissal (the ref resolves under the tag-equals-head, the version lockstep and the changelog section gates — tags are cut by the bump loop alone), the best-practices badge finding carries the won't-fix (the security posture is the lane chain, not the badge), and the code-review finding closes through the branch protection of the main line the green cascade lands (the same doctrine the saddle line carries). |

## Distribution channels

Every artifact of this release ships through the channels below. The artifact manifest records the name, the byte size, the sha256 checksum and the channels of every artifact, the checksums file covers the release set, the sbom inventory documents it and the attestations carry its provenance. Nothing auto-publishes outside the reviewed release workflow.

### npm channel

- `wenathlan-extension-2.0.2.tgz`

The library tarball publishes to npmjs and GitHub Packages under the `@wenathlan/extension` scope; the same tarball attaches to the release assets.

### nuget channel

- `extension.2.0.2.nupkg`

The nupkg carries the cli, headless and mcp entries as content files beside the umd and cjs bundles, the declaration files for ide integration, the sample fixtures and the chromium extension zip.

### maven channel

- `extension-2.0.2.pom`
- `extension-2.0.2.jar`
- `devthink2.0.2.zip`
- `devthink-declarations-2.0.2.zip`

The single io.github.wenathlan.extension distribution with every consumption mode embedded as jar resources; the extension zip and the declarations zip attach with their classifiers beside the one jar.

### container channel

- `extension-container.txt`
- `extension-container.digest`
- `extension-container.json`

The multi stage image publishes for both linux architectures with the version tag beside the stable channel alias — the index answers linux/amd64 and linux/arm64 beside the per platform attestation entries, and no referrers fallback tag rides the package because the digest stays embedded through the image index itself and the digest files that pin the exact image hash as release assets. The image exposes the mcp server, the static site and the socket relay speaking the servercontract for self hosting.

### rubygems channel

- `extension-2.0.2.gem`

The ruby process adapter gem of extension.gemspec builds with the runner shim the publish workflow generates at build time and pushes to the GitHub Packages RubyGems registry beside the other four package channels; the gem spawns the devthink cli without storing credentials.

### vscode channel

- `devthink-vscode-2.0.2.vsix`

The vs code package ships as a pure zip-based vsix the operator installs from the release asset with their own credentials; the manifest declares no telemetry and no network default.

### firefox channel

- `devthink-firefox-2.0.2.xpi`

The firefox build ships as the xpi artifact; the signing and notarization path per browser is documented in docs/18.browsercoverage.md.

### safari channel

- `devthink-safari-2.0.2.zip`

The safari skeleton ships as the source asset the xcode wrapper builds from.

### chromium channel

- `devthink2.0.2.zip`
- `extension-2.0.2-source.zip`
- `devthink-nativehost-2.0.2.template.json`

The chromium extension zip, the immutable source snapshot and the native host manifest template of the release.

### site channel

- `devthink-site-2.0.2.zip`

The hashed static site of the chatbridge surface with its immutable cache header configuration.

### declarations channel

- `devthink-declarations-2.0.2.zip`

Every declaration file and declaration map of the build for ide integration; the same zip attaches to the maven channel with the declarations classifier.

### provenance channel

- `devthink-sbom-2.0.2.json`
- `devthink-attestations-2.0.2.json`
- `devthink-artifactmanifest-2.0.2.json`

The cyclonedx inventory of every artifact, the provenance attestations of the release set and the artifact manifest with names, sizes, checksums and channels.

### github channel

- `wenathlan-extension-2.0.2.tgz`
- `extension.2.0.2.nupkg`
- `extension-2.0.2.pom`
- `extension-2.0.2.jar`
- `extension-2.0.2.gem`
- `extension-container.txt`
- `extension-container.digest`
- `extension-container.json`
- `devthink-vscode-2.0.2.vsix`
- `devthink-firefox-2.0.2.xpi`
- `devthink-safari-2.0.2.zip`
- `devthink2.0.2.zip`
- `extension-2.0.2-source.zip`
- `devthink-nativehost-2.0.2.template.json`
- `devthink-site-2.0.2.zip`
- `devthink-declarations-2.0.2.zip`
- `devthink-sbom-2.0.2.json`
- `devthink-attestations-2.0.2.json`
- `devthink-artifactmanifest-2.0.2.json`
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

