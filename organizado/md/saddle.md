# saddle

## Objective

Saddle is the binary computing engine of the family: storage-backed jobs, ninety sandbox modalities and portable runners that turn distributed storage into a publishable working set. The grand merge landed the virtual-hardware engine beside the sandbox domains, so one engine spans compute, virtualization, media, mesh and automation — published as one package across six registries, with the runner replaceable and the artifact as the durable boundary.

## Features

- Job lifecycle — prepare, process, sync, cleanup over serializable contracts; the engine coordinates storage, working set, runner, protocol and delivery adapters around the durable artifact boundary.
- Storage adapters — local, chunked, content-addressed, S3-compatible, GitHub Contents and file-hosting stores answering durable objects, ranges, dedupe and sync.
- Working set — the storage-to-compute bridge stages bounded working sets through memory, filesystem, tmpfs, mmap or caller-owned adapters; the physical limits stay explicit.
- Ninety sandbox modalities — one honest record per modality (isolation family, drivers, hardening gates, boot budget, GPU and network paths, live/host/planned state) with the join resolver and the honest census (81 live, 9 host, 0 planned at the current rung).
- Join resolver — the workload never names a modality: the platform resolves base profile, GPU, network, isolation depth and boot budget into the modality set that satisfies it.
- Edge lanes — ninety lanes probing their host runtime (sandbox jails, language toolchains, runner seats, ram recipes, delivery protocols, virtual compositions), every run in a private temp dir under a hard deadline, absent runtimes answering coded absences.
- Script lanes — sh plan interpretation, the house YAML subset and detached background runs through the universal runner.
- Browser agent — caller-owned navigation, click, type and screenshot actions without a mandatory provider.
- Operations — queues, idempotency keys, saga compensation, bounded retry, circuit breaker, health and heartbeat contracts.
- Protocols — JSON envelopes, NDJSON events, SSE progress streams, structured blocks, API envelopes and MCP over JSONL or HTTP.
- Delivery — manifests, workflow registry, extension packaging and release assets (checksums, SBOM in CycloneDX shape, provenance in the in-toto shape).
- Integrations — GitHub, GitLab, Forgejo, app lifecycle, command scopes and delivery adapters, all caller-owned.
- Execution law — denied-by-default privileged-effect planning with typed execution request, decision and handoff contracts; the internal API answers pure typed envelopes for plan, policy, materialization, execution, persistence and evidence.
- Release evidence — serializable release-evidence creation and evaluation, readiness assessment from caller-supplied verification.
- Virtual engine — engine lifecycle, specification validation and normalization, endpoint allocation without fixed addresses, the memory bank, the metrics store and the engine event bus.
- CLI — the published executable answers help, modes, runexample and mcp as stable inspection commands; local invocation never becomes remote dispatch.
- Self-hosted surface — the zero-dependency API answers its version at the health endpoint and publishes the modality census and the lane table; the web console, dashboard and playground render the same engine state.
- Workload law — every family app declares the heavy workload lanes its work rides; the same join resolver answers them.

## Virtualization

- Virtual hardware catalog — processors, GPUs, cores and boards with the qemu, mttg, passage, docker and VM envelopes as package exports.
- Virtual domains — virtual CPU, virtual memory and virtual GPU contracts beside grid orchestration, job scheduler, batch compute, benchmark planning, media pipeline, GPU registry, quantum simulation and tier policy.
- Hardware planes — the hypervisor seed answers M:N threading, vCPU overcommit, topology construction, host passthrough, memory ballooning, virtio-mem, hugepages, GPU passthrough, mediated devices, snapshots, live migration and confidential-memory options as documented modality knobs.
- Sandbox runtime — the three-state ladder (cold, warm, hot) with guarded transitions that the pipeline surface consumes.
- Runtime modes — library, browser, headless, CLI or binary, and the computer (storage-to-compute bridge) — the same contracts in every seat.
- Eleven-architecture container family — the container targets the eleven linux architectures; the legs the pinned base does not ship answer honest coded absences.
- Browser-pure engine port — the sandbox domain runs browser-pure beside the node surfaces.

## Distribution

- Six registries from one release tag — GHCR container, GitHub Packages npm, public npmjs, Maven, NuGet and RubyGems receive the same validated version; the release tag is the intentional publication boundary and must match the package version.
- One engine, many shells — npm library, application archive, computer runtime, desktop installer, Android APK/AAB, iOS IPA, CLI, binary, browser package, Manifest V3 extension, web/PWA artifact, LibreOffice OXT, VSIX, webhook server, MCP transport, workflow action, container image, Maven, NuGet and RubyGem surfaces as declarative target plans.
- Deterministic release assets — checksums, SBOM and provenance metadata for caller-selected artifacts; version tags validated against the manifest.

## Security

- Caller-injected credentials — never committed, never printed; the transport-neutral root requires no cloud account, database, browser binary or secret.
- Edge lane law — private temp dir plus hard deadline on every lane run; the visitor law guard holds on every run.
- Replaceable adapters — storage, runners, browser transports and persistence stay caller-owned; the core owns no provider account.
- Unsigned honesty — release notes identify each artifact as unsigned, ci-test-key, caller-owned or notarized according to the actual build state.

## Engine role

Virtualization and sandbox engine of the family: the binary computing engine every execution surface (the CI floor, the pipeline clone, the OS sandboxes) rides.

Padrão: seguir o padrão moderno.
