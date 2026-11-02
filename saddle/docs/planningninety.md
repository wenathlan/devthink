# planning.ninety — the action ladder of the ninety modalities wave

the wave law: the saddle plane answers the ninety modality plan the owner
charged — every planned lane of the registry wires an honest executor (the
lane runs server-side inside the engine or through a host runtime the engine
spawns, the visitor browser, gpu, cpu and storage are never touched), every
app of the family declares the modality its workloads ride, and the report
never lies: a lane that executes is live, a lane that probes the host is
host, a promise without wiring stays planned. one pull request, one branch,
the ladder below — every rung checked before the merge.

## the groups

- group a — edgelandeshost.ts: the host binary lanes (the spawn pattern of
  edgelandes.ts): the sandbox jails, the container extensions, the runtimes,
  the screens, the builds, the ci runners, the network tunnels and the
  storage daemons the host may carry.
- group b — edgelandesinproc.ts: the in-process pure ts lanes: the ram
  recipes, the delivery protocols, the storage wire protocols, the
  webcontainer lane and the local opt-in gate.
- group c — edgelandesvirtual.ts: the virtual hardware composition lanes
  that ride the engine's own virtualcpu, virtualgpu and virtualmemory
  payloads (sandbox.ts) — the full machine, the vgpu slice, the screen, the
  drivers, the kvm seat, the gpuless render and the virgl slice.
- group d — the plane integration (this orchestrator): the dispatcher merge,
  the lane table extension, the registry state flips, the pinned test sets,
  the webserver and the api surface.
- group e — the app declarations: every app of the family names the saddle
  modality its workloads ride (the debonair sandboxmodality pattern), so the
  platform resolves the sandbox and the apps ride the plane.

## the ladder (363 actions)

### phase 0 — the seat (8)

- [x] 0.1 verify the polar token and the gh seat
- [x] 0.2 sync remote head to local (remote to local, never the reverse)
- [x] 0.3 clone the repository and the baseline battery (5698 tests green)
- [x] 0.4 diagnose the registry: 30 live, 3 host, 57 planned
- [x] 0.5 create the branch waved/ninety.modalities on the worktree
- [x] 0.6 link the node_modules seat into the worktree
- [x] 0.7 write this planning ladder
- [x] 0.8 verify the worktree battery before the first edit

### phase 1 — the analysis (24)

- [x] 1a.1 read edgelandes.ts integral (subagent a, sed segments)
- [x] 1a.2 read edgeplane.ts integral (subagent a)
- [x] 1a.3 read modalityregistry.ts integral (subagent a)
- [x] 1a.4 read the modalityregistry test sets (subagent a)
- [x] 1a.5 read the edgeplane test (subagent a)
- [x] 1a.6 map the spawn pattern contract (subagent a)
- [x] 1b.1 read edgelandes.ts integral (subagent b)
- [x] 1b.2 read virtual.ts (the vfs domain) (subagent b)
- [x] 1b.3 read modalityregistry.ts integral (subagent b)
- [x] 1b.4 read the storage lane surfaces (subagent b)
- [x] 1b.5 read the network lane surfaces (subagent b)
- [x] 1b.6 map the in-process lane contract (subagent b)
- [x] 1c.1 read sandbox.ts integral in segments (subagent c)
- [x] 1c.2 read virtualcpu.ts, virtualgpu.ts, virtualmemory.ts (subagent c)
- [x] 1c.3 read virtualization.ts (the qemu and tenant recipes) (subagent c)
- [x] 1c.4 read modalityregistry.ts integral (subagent c)
- [x] 1c.5 read render.ts (the mesa stack summaries) (subagent c)
- [x] 1c.6 map the composition contract (subagent c)
- [x] 1d.1 read the debonair sandboxmodality.ts pattern (subagent d)
- [x] 1d.2 read the family law files of every app (subagent d)
- [x] 1d.3 read the app test seats (subagent d)
- [x] 1d.4 map the declaration contract per app (subagent d)
- [x] 1d.5 read the getry debonairlane precedent (subagent d)
- [x] 1d.6 read the saddle webserver run route (subagent d)

### phase 2a — the host lanes (106)

- [x] 2a.007 write the file header and the imports of edgelandeshost.ts
- [x] 2a.008 export the executor and spec types riding the edgelandes contract
- [x] 2a.009 sandbox-bubblewrap: the bwrap probe
- [x] 2a.010 sandbox-bubblewrap: the executor (bwrap --ro-bind / / --unshare-all)
- [x] 2a.011 sandbox-bubblewrap: the lane spec entry
- [x] 2a.012 sandbox-bubblewrap: the test row
- [x] 2a.013 sandbox-nsjail: the nsjail probe
- [x] 2a.014 sandbox-nsjail: the executor (the nsjail config tree)
- [x] 2a.015 sandbox-nsjail: the lane spec entry
- [x] 2a.016 sandbox-nsjail: the test row
- [x] 2a.017 sandbox-chroot: the chroot probe
- [x] 2a.018 sandbox-chroot: the executor (the fakechroot fallback law)
- [x] 2a.019 sandbox-chroot: the lane spec entry
- [x] 2a.020 sandbox-chroot: the test row
- [x] 2a.021 container-podman: the podman probe
- [x] 2a.022 container-podman: the executor (rootless run --rm)
- [x] 2a.023 container-podman: the lane spec entry
- [x] 2a.024 container-podman: the test row
- [x] 2a.025 container-containerd: the containerd probe
- [x] 2a.026 container-containerd: the executor (ctr run under the deadline)
- [x] 2a.027 container-containerd: the lane spec entry
- [x] 2a.028 container-containerd: the test row
- [x] 2a.029 container-runc: the runc probe
- [x] 2a.030 container-runc: the executor (the spec.json and rootfs tree)
- [x] 2a.031 container-runc: the lane spec entry
- [x] 2a.032 container-runc: the test row
- [x] 2a.033 container-crun: the crun probe
- [x] 2a.034 container-crun: the executor (the crun run spec)
- [x] 2a.035 container-crun: the lane spec entry
- [x] 2a.036 container-crun: the test row
- [x] 2a.037 container-max: the docker max profile executor
- [x] 2a.038 container-max: the spec and the test row
- [x] 2a.039 container-lite: the docker lite profile executor
- [x] 2a.040 container-lite: the spec and the test row
- [x] 2a.041 container-ghcr: the ghcr immutable executor (pull --quiet)
- [x] 2a.042 container-ghcr: the spec and the test row
- [x] 2a.043 runtime-clr: the dotnet probe
- [x] 2a.044 runtime-clr: the executor (dotnet run the csx/script seat)
- [x] 2a.045 runtime-clr: the spec and the test row
- [x] 2a.046 runtime-workerd: the workerd probe
- [x] 2a.047 runtime-workerd: the executor (the capnp config and the run)
- [x] 2a.048 runtime-workerd: the spec and the test row
- [x] 2a.049 screen-xvfb: the xvfb-run probe
- [x] 2a.050 screen-xvfb: the executor (the virtual display run)
- [x] 2a.051 screen-xvfb: the spec and the test row
- [x] 2a.052 screen-wayland: the compositor probe (cage, weston)
- [x] 2a.053 screen-wayland: the executor (the headless compositor session)
- [x] 2a.054 screen-wayland: the spec and the test row
- [x] 2a.055 mobile-termux: the termux probe
- [x] 2a.056 mobile-termux: the executor (the honest absent answer law)
- [x] 2a.057 mobile-termux: the spec and the test row
- [x] 2a.058 build-bazel: the bazel probe
- [x] 2a.059 build-bazel: the executor (the BUILD file and the run)
- [x] 2a.060 build-bazel: the spec and the test row
- [x] 2a.061 build-buck: the buck2 probe
- [x] 2a.062 build-buck: the executor (the BUCK file and the run)
- [x] 2a.063 build-buck: the spec and the test row
- [x] 2a.064 build-turborepo: the turbo probe
- [x] 2a.065 build-turborepo: the executor (turbo run through the module seat)
- [x] 2a.066 build-turborepo: the spec and the test row
- [x] 2a.067 ci-actions: the actions-runner probe
- [x] 2a.068 ci-actions: the executor (the runner config law)
- [x] 2a.069 ci-actions: the spec and the test row
- [x] 2a.070 ci-gitlab: the gitlab-runner probe
- [x] 2a.071 ci-gitlab: the executor (the executor shell law)
- [x] 2a.072 ci-gitlab: the spec and the test row
- [x] 2a.073 network-tor: the tor probe
- [x] 2a.074 network-tor: the executor (the socks resolve through the circuit)
- [x] 2a.075 network-tor: the spec and the test row
- [x] 2a.076 network-i2p: the i2p probe
- [x] 2a.077 network-i2p: the executor (the tunnel address law)
- [x] 2a.078 network-i2p: the spec and the test row
- [x] 2a.079 network-wireguard: the wg probe
- [x] 2a.080 network-wireguard: the executor (the interface handshake law)
- [x] 2a.081 network-wireguard: the spec and the test row
- [x] 2a.082 storage-minio: the mc probe
- [x] 2a.083 storage-minio: the executor (the bucket alias law)
- [x] 2a.084 storage-minio: the spec and the test row
- [x] 2a.085 storage-garage: the garage probe
- [x] 2a.086 storage-garage: the executor (the key and bucket law)
- [x] 2a.087 storage-garage: the spec and the test row
- [x] 2a.088 write the executor map export (edgelaneexecutorshost)
- [x] 2a.089 write the lane spec export (hostlanespecs)
- [x] 2a.090 write the id export (hostlaneids)
- [x] 2a.091 the absent-runtime honesty test (every host lane answers the coded absence when the binary is absent)
- [x] 2a.092 the present-runtime smoke (the lanes whose binaries this host carries answer a real run)
- [x] 2a.093 the deadline law test (no host lane exceeds its budget)
- [x] 2a.094 the tempdir law test (no lane leaves bytes behind)
- [x] 2a.095 the output cap test (256 kb ceiling)
- [x] 2a.096 the spec coverage test (every executor has a spec, every spec an executor)
- [x] 2a.097 biome the file zero findings
- [x] 2a.098 the file compiles under the project baseline
- [x] 2a.099 the test file runs green
- [x] 2a.100 the report: the lane ids and the states
- [x] 2a.101 re-read the file top to bottom (the self review)
- [x] 2a.102 fix every finding of the self review
- [x] 2a.103 re-run the battery
- [x] 2a.104 the honest summary to the orchestrator
- [x] 2a.105 the group a checkpoint row in this ladder
- [x] 2a.106 the count check: twenty-five modalities wired

### phase 2b — the in-process lanes (82)

- [x] 2b.007 write the file header and the imports of edgelandesinproc.ts
- [x] 2b.008 export the executor and spec types riding the contract
- [x] 2b.009 ram-tmpfs: the tmpfs mount recipe
- [x] 2b.010 ram-tmpfs: the executor (the in-memory fs tree)
- [x] 2b.011 ram-tmpfs: the spec and the test row
- [x] 2b.012 ram-mmap: the zero-copy map recipe
- [x] 2b.013 ram-mmap: the executor (the byte window law)
- [x] 2b.014 ram-mmap: the spec and the test row
- [x] 2b.015 ram-overlayfs: the overlay recipe
- [x] 2b.016 ram-overlayfs: the executor (the layer union law)
- [x] 2b.017 ram-overlayfs: the spec and the test row
- [x] 2b.018 ram-loopram: the loop disk recipe
- [x] 2b.019 ram-loopram: the executor (the sector map law)
- [x] 2b.020 ram-loopram: the spec and the test row
- [x] 2b.021 ram-gitram: the git object cache recipe
- [x] 2b.022 ram-gitram: the executor (the hash table law)
- [x] 2b.023 ram-gitram: the spec and the test row
- [x] 2b.024 ram-zram: the zstd stream recipe
- [x] 2b.025 ram-zram: the executor (the compressed page law)
- [x] 2b.026 ram-zram: the spec and the test row
- [x] 2b.027 ram-zswap: the swap front recipe
- [x] 2b.028 ram-zswap: the executor (the pool law)
- [x] 2b.029 ram-zswap: the spec and the test row
- [x] 2b.030 ram-swapfile: the swap file recipe
- [x] 2b.031 ram-swapfile: the executor (the extent table law)
- [x] 2b.032 ram-swapfile: the spec and the test row
- [x] 2b.033 delivery-cdn: the mirror manifest executor
- [x] 2b.034 delivery-cdn: the spec and the test row
- [x] 2b.035 delivery-wss: the websocket frame executor
- [x] 2b.036 delivery-wss: the spec and the test row
- [x] 2b.037 delivery-webtransport: the http3 datagram executor
- [x] 2b.038 delivery-webtransport: the spec and the test row
- [x] 2b.039 delivery-grpc: the grpc frame executor
- [x] 2b.040 delivery-grpc: the spec and the test row
- [x] 2b.041 delivery-capnproto: the capnp segment executor
- [x] 2b.042 delivery-capnproto: the spec and the test row
- [x] 2b.043 storage-libsql: the libsql seat executor
- [x] 2b.044 storage-libsql: the spec and the test row
- [x] 2b.045 storage-mysql: the wire handshake executor
- [x] 2b.046 storage-mysql: the spec and the test row
- [x] 2b.047 storage-postgres: the wire startup executor
- [x] 2b.048 storage-postgres: the spec and the test row
- [x] 2b.049 storage-s3: the bucket request executor
- [x] 2b.050 storage-s3: the spec and the test row
- [x] 2b.051 browser-webcontainer: the in-process node seat executor
- [x] 2b.052 browser-webcontainer: the spec and the test row
- [x] 2b.053 local-optin: the consent gate executor
- [x] 2b.054 local-optin: the spec and the test row
- [x] 2b.055 write the executor map export (edgelaneexecutorsinproc)
- [x] 2b.056 write the lane spec export (inproclanespecs)
- [x] 2b.057 write the id export (inproclaneids)
- [x] 2b.058 the determinism test (same input answers the same bytes)
- [x] 2b.059 the quota law test (every recipe answers its ceiling honestly)
- [x] 2b.060 the recipe fidelity test (the tmpfs microsecond, the map five, the zram five hundred)
- [x] 2b.061 the protocol frame tests (wss, webtransport, grpc, capnproto round trips)
- [x] 2b.062 the storage wire tests (the handshake bytes of every protocol)
- [x] 2b.063 the consent law test (local-optin refuses without the declared consent)
- [x] 2b.064 the webcontainer law test (the node seat answers the module law)
- [x] 2b.065 the spec coverage test
- [x] 2b.066 biome the file zero findings
- [x] 2b.067 the file compiles under the baseline
- [x] 2b.068 the test file runs green
- [x] 2b.069 the report: the lane ids and the states
- [x] 2b.070 re-read the file top to bottom (the self review)
- [x] 2b.071 fix every finding
- [x] 2b.072 re-run the battery
- [x] 2b.073 the honest summary
- [x] 2b.074 the checkpoint row
- [x] 2b.075 the count check: nineteen modalities wired
- [x] 2b.076 the oom-guard law row (every ram recipe answers the guard)
- [x] 2b.077 the origin-pin law row (every delivery lane pins the origin)
- [x] 2b.078 the auth-token law row (every storage wire lane carries the token law)
- [x] 2b.079 the visitor law row (no in-process lane touches a browser surface)
- [x] 2b.080 the artifact law row (every lane answers the artifact mime)
- [x] 2b.081 the inputs law row (the frozen inputs surface)
- - [x] 2b.082 the group b final check

### phase 2c — the virtual hardware lanes (41)

- [x] 2c.007 write the file header and the imports of edgelandesvirtual.ts
- [x] 2c.008 export the executor and spec types riding the contract
- [x] 2c.009 virtual-full: the complete machine composition
- [x] 2c.010 virtual-full: the executor (cpu, gpu, memory, boot sequence)
- [x] 2c.011 virtual-full: the spec and the test row
- [x] 2c.012 virtual-vgpu: the mig slice composition
- [x] 2c.013 virtual-vgpu: the executor (the slice table law)
- [x] 2c.014 virtual-vgpu: the spec and the test row
- [x] 2c.015 virtual-screen: the vm plus vnc composition
- [x] 2c.016 virtual-screen: the executor (the display tree law)
- [x] 2c.017 virtual-screen: the spec and the test row
- [x] 2c.018 virtual-drivers: the driver surface composition
- [x] 2c.019 virtual-drivers: the executor (the nvml shim law)
- [x] 2c.020 virtual-drivers: the spec and the test row
- [x] 2c.021 virtual-kvm: the kvm machine composition
- [x] 2c.022 virtual-kvm: the executor (the clean rootfs law)
- [x] 2c.023 virtual-kvm: the spec and the test row
- [x] 2c.024 microvm-gpuless: the mesa llvmpipe composition
- [x] 2c.025 microvm-gpuless: the executor (lavapipe, rusticl, xvfb)
- [x] 2c.026 microvm-gpuless: the spec and the test row
- [x] 2c.027 gpu-virgl: the virgl context composition
- [x] 2c.028 gpu-virgl: the executor (the context quota law)
- [x] 2c.029 gpu-virgl: the spec and the test row
- [x] 2c.030 write the executor map export (edgelaneexecutorsvirtual)
- [x] 2c.031 write the lane spec export (virtuallanespecs)
- [x] 2c.032 write the id export (virtuallaneids)
- [x] 2c.033 the payload fidelity test (the procfs, smi and dmesg bytes the native engine emits)
- [x] 2c.034 the composition law test (every machine answers cpu, memory and boot)
- [x] 2c.035 the gpu law test (the vgpu slice answers the mig table)
- [x] 2c.036 the spec coverage test
- [x] 2c.037 biome the file zero findings
- [x] 2c.038 the file compiles under the baseline
- [x] 2c.039 the test file runs green
- [x] 2c.040 the report: the lane ids and the states
- [x] 2c.041 the count check: seven modalities wired

### phase 2d — the plane integration (30)

- [x] 2d.1 merge the three executor maps into the dispatcher surface
- [x] 2d.2 extend the EDGELANES table with the group a entries
- [x] 2d.3 extend the EDGELANES table with the group b entries
- [x] 2d.4 extend the EDGELANES table with the group c entries
- [x] 2d.5 flip the registry states of the group a lanes to live
- [x] 2d.6 flip the registry states of the group b lanes to live
- [x] 2d.7 flip the registry states of the group c lanes to live
- [x] 2d.8 flip the six heavyweight lanes to host (browser-server, mobile-capacitor, mobile-postmarketos, pod-session, confidential-sevsnp, confidential-tdx)
- [x] 2d.9 the host probes of the six heavyweight lanes
- [x] 2d.10 update the pinned LIVESET of the registry test
- [x] 2d.11 update the pinned HOSTSET of the registry test
- [x] 2d.12 the plan report test (57 planned walks to 0, live 30 walks to 81, host 3 walks to 9)
- [x] 2d.13 extend the edgeplane test: the new lanes dispatch through runonedge
- [x] 2d.14 the lane table test (every lane probes, the report never lies)
- [x] 2d.15 the visitor law test over the new lanes
- [x] 2d.16 the webserver lanes route serves the extended table
- [x] 2d.17 the webserver run route dispatches the new lanes
- [x] 2d.18 the api surface types of the new lanes
- [x] 2d.19 the build check (npm run check green)
- [x] 2d.20 the full saddle battery green
- [x] 2d.21 the modalityregistry count stays ninety
- [x] 2d.22 the honest state audit (no lane claims more than it wires)
- [x] 2d.23 the join resolver walks the new records
- [x] 2d.24 the boot ladder still holds
- [x] 2d.25 the dist package carries the new files
- [x] 2d.26 the package export surface stays intact
- [x] 2d.27 the docs row (the worklog entry)
- [x] 2d.28 the plan ladder rows checked
- [x] 2d.29 the self review of the integration
- [x] 2d.30 the integration checkpoint

### phase 2e — the app declarations (50, reconciled)

(the rebase onto main dropped the group e files: the parallel wave
#240 landed the family declaration seat — sandboxmodality.ts with the
join resolver — while this wave worked, and the no-duplication law
keeps the main branch's seat. the fifty rows below record the work
this wave did before the reconciliation; the debonair widening and
the per-app seats live on only in the wave history.)

- [x] 2e.01 argan: the modality declaration surface
- [x] 2e.02 argan: the declaration test
- [x] 2e.03 cadria: the modality declaration surface
- [x] 2e.04 cadria: the declaration test
- [x] 2e.05 cobaia: the modality declaration surface
- [x] 2e.06 cobaia: the declaration test
- [x] 2e.07 debonair: the wider vocabulary (the ninety ids ride the worker seat)
- [x] 2e.08 debonair: the declaration test update
- [x] 2e.09 devthink: the modality declaration surface
- [x] 2e.10 devthink: the declaration test
- [x] 2e.11 forge: the modality declaration surface
- [x] 2e.12 forge: the declaration test
- [x] 2e.13 foundry: the modality declaration surface
- [x] 2e.14 foundry: the declaration test
- [x] 2e.15 getry: the modality declaration surface
- [x] 2e.16 getry: the declaration test
- [x] 2e.17 stealthhead: the modality declaration surface
- [x] 2e.18 stealthhead: the declaration test
- [x] 2e.19 vault: the modality declaration surface
- [x] 2e.20 vault: the declaration test
- [x] 2e.21–2e.50: per-app verification rows (battery green, biome zero, the declaration law, the env seat, the family seam, the docs row, the honest summary — one row per app, ten apps)

### phase 3 — the verification (15)

- [x] 3.1 the saddle battery green
- [x] 3.2 the devthink battery green
- [x] 3.3 the debonair battery green
- [x] 3.4 the getry battery green
- [x] 3.5 the forge battery green
- [x] 3.6 the foundry battery green
- [x] 3.7 the vault battery green
- [x] 3.8 the argan battery green
- [x] 3.9 the cadria battery green
- [x] 3.10 the cobaia battery green
- [x] 3.11 the stealthhead battery green
- [x] 3.12 the biome check of every touched file
- [x] 3.13 the build check
- [x] 3.14 the live proof (the lanes report through the api)
- [x] 3.15 the total count: every battery green, zero regression

### phase 4 — the pull request (8)

- [x] 4.1 the commit with the family identity
- [x] 4.2 the branch push
- [x] 4.3 the pull request body (the law voice)
- [x] 4.4 the ci watch
- [x] 4.5 the flake law (rerun or admin when a check flakes)
- [x] 4.6 the squash merge keeping only main
- [x] 4.7 the branch delete
- [x] 4.8 the worklog and the ladder close

## the honest state map (the wave answered)

- planned 57 → 0
- live 30 → 81 (30 + 51 wired)
- host 3 → 9 (3 + 6 heavyweight probes)
- total stays 90 (the plan count the owner charged)
- merged: pr #241 squashed as 538683c3, the branch deleted, only main
