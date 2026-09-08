# Devthink 2.0.1

— the grand merge made whole: every lost channel restored, the ladder lands, the suite answers green

### Changed

| Area | Change |
| --- | --- |
| The rich packaging channels | The 2.0.0 merge had replaced the extension's rich distribution with the simple DevThink adapters and left the packaging gates red. The single-distribution maven returns under the DevThink identity: io.github.wenathlan:devthink embeds the nine dist jar resources (index.js, index.cjs, devthink.umd.js, checksums.txt, cli.js, headless.js, mcp.js, gateway.js, http.js) and attaches the extension and the declarations zips as classifier artifacts through build-helper-maven-plugin, with distributionManagement pointing at the GitHub Packages registry of wenathlan/devthink. The NuGet channel restores the netstandard2.0;netstandard2.1 devthink.csproj with the twelve contentFiles entries (the zip, the cli/headless/mcp/umd/index.cjs entries, the declarations and the fixtures) beside the ExtensionDistribution identity class. The rubygems lane restores the workflow_run dual trigger with the tag-to-head and registry-existence guards. The mavenpack and nugetpack batteries gate the restored surfaces green. |
| THE Dockerfile | The 846-byte single-arch compile image becomes THE 620-line container file of the saddle pattern: the restored extension validation pipeline and self-hosting runner (the static site, the websocket relay and the loopback MCP child process) as the default stage, the binary runtime with the ARG TARGETARCH mapping (bun-linux-x64 and bun-linux-arm64 — the arm64 image stops shipping an x64 binary), the gateway-lineage smoke boot with the /healthz poll and the server-death detection, the non-root uid 10000, the OCI labels of wenathlan/devthink and the absorbed compose doctrine (read-only, cap-drop-all, no-new-privileges, the pids limit, the tmpfs, the memory engine and platform env) as documented docker run recipes. The compose.yml file itself is deleted — the rule: the container is managed only by the Dockerfile. |
| The release pipeline | The 4-job release lane grows back the eleven-job chain: the metadata lockstep with the CHANGELOG section contract, the verification ladder call, the assemble step (the full artifact chain from the chromium zip through the firefox xpi, the safari skeleton, the vsix, the site, the declarations, the umd pair, the nativehost template, the source archive and the artifact manifest), the per-channel verification jobs, the sbom and the attestation, the release assets with the SHA256SUMS umbrella, the npmjs lane with the flat distpackage, the provenance and the bounded retries, and the githubrelease job with the draft, the checksum-verified download and the live flip. The readiness gate answers go. |
| The maintenance ladder | The automated dependency ladder of the extension lineage returns adapted to the merged repository: the weekly and daily runs and the security-completion trigger apply every non-breaking npm update, keep the runtime engines current (node, npm, bun with the bounded forms; the pnpm lane follows the workflow pins while the root package manager stays bun), refresh the versioned action pins, derive the next rung with plain arithmetic over package.json, stamp the whole metadata family, run the full verification chain on an archive-tagged automation branch, squash the green result onto main and delete the branch — only main remains — and dispatch the release workflow on the new version tag. The registry gate learns the prerelease fallback: a release candidate riding the latest dist-tag (prisma ships them) never proposes; the ladder walks the published versions back to the newest stable. |
| The verification ladder | The verify lane builds the root distribution before the deterministic suite (the 2.0.0 red: the protocol battery read dist/schemas before any build produced it), restores the twenty-two-gate chain of the extension lane (the apifreeze, permdiff, pentest, cspaudit, agentcert, costcert, doccheck, sweep, poolaudit, matrixverify, telemetryfree, recipes, readiness, the mode matrix and the package verification), and the compatibility lane answers the node runtime through the built artifacts (node dist/cli.js — the source strip-types entry cannot resolve the merged .js specifiers) while the bun lane keeps the source contract. The seven maene and workbench batteries that spoke node:test join the vitest collection. |
| The library surface | The frozen library manifest of apifreeze grows by the twenty-six gateway vocabulary symbols the merge added to the shared types (authconfig through versionhandlers — the library surface of 2.0.0 is the merged surface), the freeze artifact re-freezes at the release, and the two lineage barrels ship as built entries: ./gateway-lib (the engine, the auth, the http, the configloader and the types of the gateway library) and ./maene-lib (the provider-neutral aggregates) — staged in the flat package beside every other entry, gated by the publishing battery. |
| The workflow family | The exchange with the saddle lineage lands: the codeql lane adopts the family style (the static language matrix, the concurrency group, the dispatch), the cache retention gains the scoped workflow_run pass and the java and dotnet families, the targets lane builds real plans from the artifact manifest with the channel matrix, the release sums umbrella rebuilds SHA256SUMS over the current assets with the idempotent re-run, the scorecard lane ships as its own weekly workflow, and the workflowlint pin follows the latest actionlint release. The governance files return: the merged CONTRIBUTING (the union of the three lineages' guides), the code of conduct and the CODEOWNERS. |
| The security posture | The five registry vulnerabilities of the merged lock close through the overrides block (deepmerge-ts 8.0.0, esbuild 0.28.2, mysql2 3.23.1, @xmldom/xmldom 0.9.12, qs 6.16.0) — the numbers only, the gates answer green. The SECURITY policy line moves to the 2.0.x release line. The reviewed provider endpoint catalog of the merged lineages becomes a data file (tests/artifacts/reviewedorigins.json) so the reviewed origins stay data rows, never code literals — the same doctrine the api coverage table carries. The one hundred twelve guarded best-effort catches of the maene lineage state their reason (the sweep doctrine: every catch surfaces its error or states its comment). |
| The metadata lockstep | The web manifest mirrors the root at 2.0.1 with the dependency set unified (the saddle doctrine: every root package lives at the web root and every web package lives at the root), the engines carry the bounded forms (node >=26.8.1 <27, npm >=12.0.2 <13, bun >=1.4.2 <2), the .nvmrc follows the node baseline, the sideEffects and the publish registry ride the package contract, the deno lane map returns (deno.json with the @wenathlan/devthink import), and the runtime baselines (node 26.8.1, npm 12.0.2, bun 1.4.2) land through the maintenance sync. |

### Fixed

| Area | Change |
| --- | --- |
| The 2.0.0 reds | The three merge commits never answered green: the CI lane red on the schema read before the build, the mavenpack and nugetpack batteries red on the replaced packaging, the node compatibility red on the rewritten import specifiers, the security lane red on the five registry vulnerabilities and the audit-gate capture, the secret-scan coverage and the verify dependencies. Every red closed at the root: the build order, the restored packaging, the artifact-based node contract, the number bumps and the gate wiring. |
| The build-heavy ceilings | The env-scaled ceilings of the library mode batteries follow the merged bundle sizes: the policy purity pass and the headless loads read the raised bounds (the doctrine of the 2.0.12 rung — a slow runner never fails a test that builds), and the suite cleanup hook carries the explicit bound the merged tree needs. |
| The generated output | The distpackage staging leaves the repository tree: the runners generate every build artifact (the flat package, the caps, the schemas, the zips) and the repository keeps no build output — the 2.0.0 contract finally holds. |

## Distribution channels

Every artifact of this release ships through the channels below. The artifact manifest records the name, the byte size, the sha256 checksum and the channels of every artifact, the checksums file covers the release set, the sbom inventory documents it and the attestations carry its provenance. Nothing auto-publishes outside the reviewed release workflow.

### npm channel

- `wenathlan-extension-2.0.1.tgz`

The library tarball publishes to npmjs and GitHub Packages under the `@wenathlan/extension` scope; the same tarball attaches to the release assets.

### nuget channel

- `extension.2.0.1.nupkg`

The nupkg carries the cli, headless and mcp entries as content files beside the umd and cjs bundles, the declaration files for ide integration, the sample fixtures and the chromium extension zip.

### maven channel

- `extension-2.0.1.pom`
- `extension-2.0.1.jar`
- `devthink2.0.1.zip`
- `devthink-declarations-2.0.1.zip`

The single io.github.wenathlan.extension distribution with every consumption mode embedded as jar resources; the extension zip and the declarations zip attach with their classifiers beside the one jar.

### container channel

- `extension-container.txt`
- `extension-container.digest`
- `extension-container.json`

The multi stage image publishes for both linux architectures with the version tag beside the stable channel alias — the index answers linux/amd64 and linux/arm64 beside the per platform attestation entries, and no referrers fallback tag rides the package because the digest stays embedded through the image index itself and the digest files that pin the exact image hash as release assets. The image exposes the mcp server, the static site and the socket relay speaking the servercontract for self hosting.

### rubygems channel

- `extension-2.0.1.gem`

The ruby process adapter gem of extension.gemspec builds with the runner shim the publish workflow generates at build time and pushes to the GitHub Packages RubyGems registry beside the other four package channels; the gem spawns the devthink cli without storing credentials.

### vscode channel

- `devthink-vscode-2.0.1.vsix`

The vs code package ships as a pure zip-based vsix the operator installs from the release asset with their own credentials; the manifest declares no telemetry and no network default.

### firefox channel

- `devthink-firefox-2.0.1.xpi`

The firefox build ships as the xpi artifact; the signing and notarization path per browser is documented in docs/18.browsercoverage.md.

### safari channel

- `devthink-safari-2.0.1.zip`

The safari skeleton ships as the source asset the xcode wrapper builds from.

### chromium channel

- `devthink2.0.1.zip`
- `extension-2.0.1-source.zip`
- `devthink-nativehost-2.0.1.template.json`

The chromium extension zip, the immutable source snapshot and the native host manifest template of the release.

### site channel

- `devthink-site-2.0.1.zip`

The hashed static site of the chatbridge surface with its immutable cache header configuration.

### declarations channel

- `devthink-declarations-2.0.1.zip`

Every declaration file and declaration map of the build for ide integration; the same zip attaches to the maven channel with the declarations classifier.

### provenance channel

- `devthink-sbom-2.0.1.json`
- `devthink-attestations-2.0.1.json`
- `devthink-artifactmanifest-2.0.1.json`

The cyclonedx inventory of every artifact, the provenance attestations of the release set and the artifact manifest with names, sizes, checksums and channels.

### github channel

- `wenathlan-extension-2.0.1.tgz`
- `extension.2.0.1.nupkg`
- `extension-2.0.1.pom`
- `extension-2.0.1.jar`
- `extension-2.0.1.gem`
- `extension-container.txt`
- `extension-container.digest`
- `extension-container.json`
- `devthink-vscode-2.0.1.vsix`
- `devthink-firefox-2.0.1.xpi`
- `devthink-safari-2.0.1.zip`
- `devthink2.0.1.zip`
- `extension-2.0.1-source.zip`
- `devthink-nativehost-2.0.1.template.json`
- `devthink-site-2.0.1.zip`
- `devthink-declarations-2.0.1.zip`
- `devthink-sbom-2.0.1.json`
- `devthink-attestations-2.0.1.json`
- `devthink-artifactmanifest-2.0.1.json`
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

