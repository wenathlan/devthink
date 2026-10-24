# planning.engine — the saddle engine ladder (the sandbox that actually runs)

> the owner order: the interface exists, the engine must WORK — the saddle
> engine planned for real and wired into the whole system, 100% customizable
> (storage, ram, aliases, drivers, every knob editable through the api), the
> git storage and the github tree system living in the db, the sandbox
> modalities opening with their drivers (vgpu, vcpu, memory) running real on
> the hosts and NEVER touching the person's machine. the flows of the
> competitors (the telas files: z.ai, grok, manus, bolt, ai studio, vercel,
> netlify, cloudflare) are the recipe the engine follows; the framework, the
> library and the package choice stay open as long as node and the engines
> orchestrate behind. everything rides mime types + https.
>
> ## the competitor recipe the engine copies (from telas-sandbox-fluxo)
>
> - one sandbox per session, created implicitly at the first send, discovered
>   never hand-built: workspaces/up (z.ai), /api/preview/{id} (grok),
>   preview/resolve (manus).
> - the sandbox state streams: checking → quota ok → initializing → ready
>   (sse of states with explicit quotas per user), the pod id in the ready
>   payload.
> - the preview lives in its own subdomain with the port in it:
>   preview-chat-<id>.devthink.pro, <port>-<hash>.<region>.devthink.run.
> - versioned storage OUTSIDE the sandbox: versions/<uuid> per write
>   (z.ai), codestorage + commitSha (bolt), git repo in s3 (manus) — the
>   saddle form: git objects inside the db (vault, libgit2) with the
>   commitSha pointer the sandbox rootfs commits against.
> - ephemeral credentials only: jwt 300s per preview session (grok), otp per
>   vnc (manus) — the saddle form: session-scoped tokens minted per sandbox
>   bind, never a long-lived secret at the edge.
> - capabilities announced as an event (computer.capabilities.updated): the
>   image inventory (node 26, git, ffmpeg, playwright-headless) reaches the
>   front so features toggle by real capacity.
> - quotas explicit and queryable (x/min, y/4h, z/global) and the 429 typed
>   before the bind.
> - the runtime daemon inside the sandbox: supervisord + runtime service
>   (manus :8330/:8340 form) → devthink-runtime on its own port with the
>   watcher loop and the upgrade lock, env in two layers (platform + user).
> - zero captcha anywhere, zero traffic from the person's browser: the code
>   never transits the visitor, the agent's own headless browser runs inside
>   the sandbox.

## wave SV0 — what already stands (verified, 411 tests green)

- [x] SV0.001 the virtual hardware engine: cpu/gpu banks, topology solver,
      the host inventory probes (meminfo, nvidia-smi, glxinfo, vulkan)
- [x] SV0.002 the vgpu drivers lane: pci ids, nvml shim env, vfio
      bind/unbind, rom dump, looking glass b7, nvidia vgpu profiles, mig
      layouts (blackwell) with density validation, intel sriov dkms, nvenc
      dual engine
- [x] SV0.003 the vcpu and memory lanes: topology composition, the mttg and
      passage envelopes, the qemu and docker envelopes, the tier policy
- [x] SV0.004 the orchestrator with the gitops flux planning, the scheduler,
      the queue and the quota lanes, the isolation and security gates
- [x] SV0.005 the webserver (health, specs, sandbox lifecycle, exec, spa
      shell) and the browser-pure engine port with the transport-neutral
      bundle set
- [x] SV0.006 the build engine riding node directly (the windows spawnSync
      EINVAL wall gone), the lockstep version stamp across the envelope
- [x] SV0.007 the competitor flows captured (the telas files live beside the
      md corpus) and the recipe distilled into this plan

## wave SV1 — the modality registry (the fifty, one catalog, the join)

- [ ] SV1.001 modalityregistry.ts: every sandbox modality as a record (id,
      family, isolation level, driver requirements, boot cost class, the
      mime contract, the driver modules it mounts) — the catalog grows
      toward the fifty the owner counts, seeded from the rules list
- [ ] SV1.002 the families: complete virtual (drivers, cpu, gpu, memory, the
      three profiles), universal runner, node packages, docker hardened,
      ghcr immutable, microvm per workflow, browser/webcontainer server side,
      mobile (capacitor, termux, postmarketos), confidential (sev-snp, tdx),
      qemu and firecracker, pod per session, local opt-in, vm+vnc,
      wasm/wasi, vfs, cdn
- [ ] SV1.003 the join resolver: the workload asks, the engine answers the
      modality set (the nuclear modality — the person chooses none, the
      platform resolves the join of all)
- [ ] SV1.004 the capability contract per modality: what the workload may
      ask (net off, dropped caps, read-only root, pid limits for the docker
      hardened; the clean rootfs, injected vcpu count, mesa llvmpipe,
      lavapipe, rusticl, xvfb for the microvm)
- [ ] SV1.005 the boot ladder per modality: cold, warm, hot classes with
      the measured budgets (gvisor without kvm about 200 ms, firecracker
      125 ms boot the sandbox.ts banner already answers, v8 isolates for
      serverless)
- [ ] SV1.006 tests: the registry determinism, the join resolution on the
      three base profiles (max, balanced, lite), every record complete

## wave SV2 — the vfs and the cdn lane (the packages never touch the visitor)

- [ ] SV2.001 vfs.ts: the virtual file system born from prisma/git/db —
      read(path) → chunk pointers from the db, write(path, bytes) → chunk
      catalog with sha-256 and compression, automatic reuse of equal chunks
- [ ] SV2.002 the cdn lane: the ~45 cdns (esm.sh among them) fetched INSIDE
      the sandbox over https through the vfs mirror — the person's browser
      never loads a cdn byte of a sandbox workload
- [ ] SV2.003 the granular materialization: packages install ten by ten,
      forty by forty inside the sandbox from the catalog (package.10 law) —
      never on the build host
- [ ] SV2.004 the mime contract: every vfs object answers its mimetype, the
      api serves content-type on every read (the mimetypes file feeds the
      mapping)
- [ ] SV2.005 tests: chunk dedupe round trip, sha-256 stability, the cdn
      mirror mock, the mime headers on every route

## wave SV3 — the git storage and the github tree (the code survives the sandbox)

- [ ] SV3.001 gitobjects.ts: git objects and blobs inside the db through
      libgit2 semantics — the tree system the github tree law names: read
      tree(path) → entries, write tree, commit with the parent chain
- [ ] SV3.002 the versioned write: every sandbox write stamps versions/<uuid>
      with the commitSha — the bolt/z.ai pattern with the vault storage
- [ ] SV3.003 the github tree lane: read the live tree of a repository over
      the api (authenticated), mirror into the git objects table, the
      sandbox mounts the tree as its rootfs through the vfs
- [ ] SV3.004 the rollback: checkout any commitSha back into a running
      sandbox (the history the vitrine clicks through)
- [ ] SV3.005 tests: tree round trip, commit chain integrity, the github
      mirror with a recorded fixture, rollback determinism

## wave SV4 — the session sandbox law (pod per session, the states stream)

- [ ] SV4.001 sandboxup: one sandbox per session created implicitly at the
      first send, discovered by session id — never a hand-built url
- [ ] SV4.002 the states stream over sse: checking → quota ok →
      initializing → ready with the sandbox id, quotas per user explicit in
      the handshake
- [ ] SV4.003 the capabilities event: the image inventory (node 26, git,
      ffmpeg, playwright-headless, ffmpeg) announced when the sandbox turns
      ready
- [ ] SV4.004 the preview subdomain: preview-<session>.devthink.pro with the
      port binding, the ephemeral jwt 300s per bind (claims sub, session,
      port)
- [ ] SV4.005 the runtime daemon: devthink-runtime inside the sandbox (the
      supervisord + watcher loop + upgrade lock the manus form proves), env
      in two layers (platform + session)
- [ ] SV4.006 the sweep: ttl 15 minutes, the sweep period the webserver
      already carries, the workspace quota answering with the sandbox id
- [ ] SV4.007 tests: the state ladder order, the quota refusal typed 429,
      the jwt expiry, the capabilities payload

## wave SV5 — config and aliases (100% customizable through the api)

- [ ] SV5.001 sandboxconfig.ts: every knob editable — base (max, balanced,
      lite), os image (android, grapheneos, linux, omarchy, windows,
      distros), arch (arm64, amd64), vcpu count, vram mib, storage quota,
      the modality join, the driver set
- [ ] SV5.002 the aliases table: user-defined aliases per sandbox (the
      short names the shell and the api resolve), add/rename/remove through
      the api, unique per owner
- [ ] SV5.003 the config store: rows in sqlite through parameter binding,
      the api serves and accepts the whole surface (the ui edits the same
      rows), defaults from the seed catalog never hardcoded in components
- [ ] SV5.004 the presets: named profiles (the three bases plus user
      presets) shareable and versioned
- [ ] SV5.005 tests: config round trip, alias uniqueness, preset apply,
      the api contract with a fake request

## wave SV6 — the runners (forge at the frontier, foundry the face)

- [ ] SV6.001 the docker hardened runner: no network, dropped caps,
      read-only root, pid limits, runsc option
- [ ] SV6.002 the microvm runner: clean rootfs, injected vcpu count, the
      cpu id via ld_preload, mesa llvmpipe + lavapipe + rusticl + xvfb for
      the gpu-less render, iso-style and ghcr sources
- [ ] SV6.003 the wasm/wasi runner: wasmer and wasmedge behind the same
      dispatch contract
- [ ] SV6.004 the universal runner: any binary of the market through the
      binfmt form, the platform processes included
- [ ] SV6.005 the dispatch result: the same SandboxState/DispatchResult
      shape every runner answers (the contract the tests already pin)
- [ ] SV6.006 tests: per-runner dispatch on the recorded fixtures, the
      hardening gates refusing the forbidden flags

## wave SV7 — the verification (the owner reads the live proof)

- [ ] SV7.001 the full battery green on every wave's modules
- [ ] SV7.002 the live proof: sandbox up through the api, the states stream
      answering, exec inside, the vfs fetch of a cdn package, the git
      commit with the commitSha, the preview subdomain bound with the
      ephemeral jwt
- [ ] SV7.003 the live proof: the config edited through the api (ram,
      storage, alias), the next boot honoring it
- [ ] SV7.004 the debonair bridge: the render jobs of the audio engine run
      inside a saddle sandbox (the no-client-dsp law of the music pipeline)
- [ ] SV7.005 the worklog and the ladder ticked, the wave committed
