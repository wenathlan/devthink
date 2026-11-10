# mapping — conversa19.txt + upload corpus (the session map)

the structured map of every rule, complaint, goal, feature and expectation the
uploaded documents carry, ordered by stage and by application, divided by rule
type and key category. every complaint below is a mandatory directive. this map
defines the branch and pull request scope directly — one PR per theme per
category, resolved from simplest to most complex.

sources read linearly (bash/sed/grep only, segments line X to Y):
- upload/conversa19.txt (84,966 lines) — lines 1-600 (raw complaints + full
  PR0-PR22 framework, two variants), 40709-50015 (49 numbered historical
  complaint blocks), 83313-84966 (wave-9 dossiers + the final consolidated
  per-app dossiers), all repetition anchors sampled and verified (~155
  instances of the framework)
- upload/polarauth.txt (8,695 lines) — the unified polar.sh device-flow auth
- wormhole.app/mMxXeB payload — downloaded via agent-browser, byte-identical
  (md5) to upload/conversa19.txt + upload/polarauth.txt

---

## stage 0 — operation rules (how the work runs)

| rule | law |
|---|---|
| auth | token captured real-time (polar.sh device-flow in background), all state files in /home/z/my-project (never /tmp), scopes unlimited, vault engine storage |
| sync | remote HEAD synced to local before anything; my-project carries only the devthink repo + the alan study seat |
| reading | linear, hierarchical, exact, progressive — bash/sed/grep segments only, never direct read tools, not one comma changed |
| waves | 100+ waves, up to 300 parallel subagents per wave, collision = skip and advance, never disturb other agents |
| prs | ~50 PRs named by wave/theme (never per-app), 100+ actions each, squash merge to main only when checks 100% green, vitest 900-1000 steps before push |
| identity | commits as iakadion via git/gh cli |
| production check | browser agent verification at https://wenathlan.github.io/devthink/ and /panel — the sandbox lies (white screens happen in production while sandbox looks normal) |
| clock | 1:00h meta, todolist 10,000+ internal key actions (600+ per app, up to 900 per front) |
| priority order | saddle first, then vault, then devthink design + neotemp study, then the remaining apps; debonair/cadria deep engine work only after the configurable files of all 11 apps are standardized |

## stage 0 — project rules (structure laws, PR0-PR2)

| rule | law |
|---|---|
| root layer | exactly 12 folders (.github + argan/cadria/cobaia/debonair/devthink/forge/foundry/getry/saddle/stealthhead/vault) + 2 files (.gitignore, package.json). no dockerignore, no extra md in .github |
| app layer | inside each app: the .ts logic files + the configurable framework files at the root, plus only 3 folders — sol / tests / docs. src/scripts/artifacts/terminal/dist/images/assets/build forbidden |
| build | publish="." / outDir="." (vite flat emit at app root), capacitor webDir=".", tauri frontendDist at root |
| sol architecture | folder = subapp = page name, only the anchor inside, alphabetical, no folder-in-folder; all components in wingets |
| naming | one short keyword per file (auth not authenticationmanager), no dots/hyphens/underscores/spaces/emojis in names, dots only for extensions |
| non-official apps | single visual component answering "em construção" / "jogo em construção" (stealthhead wears it today) |
| root package.json | engines only (node maestro + 15 engines: bun/cargo/corepack/deno/pnpm/babel/yaml/python/go/rust/ruby/v) — no dependencies/devDependencies/overrides at root |
| app package.json | same dependencies across all 11 apps (union, zero removals), same version lockstep, no engines key; qemu/vm deps exclusive to saddle |
| alan seat | competitor corpus at alan/ (machine-local shallow clones, never in the family tree) — already the .gitignore law |

## stage 0 — formatting rules

| rule | law |
|---|---|
| language | all code/comments/ui/filenames in english; pt-br docs start/end sentences coherently |
| punctuation | comma separates different contexts, / joins same-context elements, always % / = symbols (never spelled out) |
| jsdoc | hierarchical block-commented 2026 pattern, lowercase identifiers, flags/tags/tokens, biome-synced |
| css | all css in sol.css (no loose css in tsx), 1000+ properties used honestly, trylle hairline 7.5% both faces |
| zoom lock | viewport maximum-scale=1.0, user-scalable=no (the faun law) |
| por exemplo | illustration only, never an obligation to copy |

## stage 0 — coding rules (PR3-PR6, PR19)

| rule | law |
|---|---|
| logic regrouping | all .ts logic at app root (never inside sol), one file per single responsibility (auth.ts, db.ts, sandbox.ts, storage.ts, protocols.ts, dns.ts, catalog.ts, thinking.ts, gateway.ts, runner.ts, pipeline.ts, match.ts, ranking.ts, world.ts, monetization.ts, copy.ts, agents.ts, security.ts, dist.ts, dashboard.ts, edgelandes.ts, modalities.ts, virtual.ts, scripts.ts, objects.ts, account.ts), 0-4,000+ correlated logics per file |
| zero duplication | each app owns its engine exclusively; siblings import via package.json dependency (npm specifier, never folder paths); the 3d library is cadria's, audio is debonair's, storage is vault's, virtualization is saddle's, gateway is getry's, network is argan's |
| zero hardcoding | no interface strings or catalog rows in .ts/.tsx — everything in the db (better-sqlite3 / vault) pulled via internal apis at build; only tests may hardcode (mocks/fixtures) |
| db cleanliness | purge simulated/fake data (false reviews, invented movies, unsplash links, fake metrics, fake artists) |
| tests | only .ts tests in each app's tests folder (no subfolders, no json/mjs/cjs, no images), full suite green |
| scripts | non-ts scripts live in allan/organizado by extension, then convert to .ts |
| engines unlimited | no component/route/winget/logic/mime (3,000-6,000)/protocol (100-1,000) limits — organization is the only law |
| 15+ node engines | node maestro orchestrating, prefer node-native libraries; go/python/rust/ruby/v free |

## stage 0 — design rules (PR7-PR11)

| rule | law |
|---|---|
| theme | one sol theme (white, not yellow), light/dark only; white logo, no text under it |
| fidelity | 97-99% the allan index.html reference: 6 original buttons, no saddle cloud button, no blue glows, no blue button on the hero, login shadow fixed, topbar 118/140, native-a cut fixed |
| windows | win10/11 + trylle.com refinement: titlebar 28/30px, close rgb(232,17,35), 8 handles, ice accent #a3d7e6, focus #4cc2ff, pill 999px, no white border, no transition:all, mica grain, start menu with sticky avatar+power |
| navbar | floating/docked modes — pull up floats, pull left docks, 1mm off-wall undocks with rounded borders; calendar follows the dock |
| microinteractions | >=44px touch targets, <=200ms transform/opacity animations, fluent icons mandatory |
| wingets | redesign from zero, awwwards level, no infrastructure-revealing text, alphabetical, grouped variants in one file |
| routes | direct url = standalone fullscreen, panel double-click = window inside the system, identical rendering both paths, familyurl fixed (10 collapse points) |
| competitors | repo.case.md links cloned into neo.temp/neo.img, css tokens inspected directly, windows11+trylle.com minimalist standard |
| onboarding | intro → onboarding → panel, state persisted in db via prisma/db.ts |

## stage 0 — distribution rules (PR12-PR14, PR18)

| rule | law |
|---|---|
| architectures | 11 official: linux-x64, darwin-arm64, windows-x64, linux-arm64, darwin-x64, windows-arm64, linux-x64-musl, linux-riscv64, wasm32, darwin-arm64-v8, windows-x64-gnu |
| channels | 11: npmjs, github packages (@wenathlan/<app>), go get, maven, nuget, gradle, rubygems, docker container, cargo crates, pypi, homebrew |
| webpack matrices | 6 per app (nuget/maven/gradle/npmjs/rubygems/github-packages × webpack) = 55-60 packages total |
| releases | 500-1,000+ assets, sha256 signatures generated at build (never hardcoded), release approval cascade restored (broken since commits 118/140) |
| containers | every app container published; the 10 sibling containers carry 11 arch + 11-14 lanes (storage/database/protocol/query); the saddle container is the exotic one: 15+ lanes, max/balanced/lite profiles, full os distributions emulated inside (grapheneos, omarchy, maru os, vanilla os, v os, linux, windows, android arm64+amd64) |
| maven scope | delete io.github.wenathlan.* packages, publish only com.wenathlan.<app> |

## stage 0 — the runtime law (PR13, PR15-PR16)

| rule | law |
|---|---|
| saddle first | 90 modalities (81 live + 9 host): wasm/wasme/webpack/babel/virtual file/vfs/docker/exe+binary (queuebinarylaunch)/qemu/aws/node/e2b/daytona/vgpu/vcpu/gpu/cpu/ports — never touching the visitor browser/gpu/cpu/disk, 24h internet infra |
| transfer | non-virtualization features (web scraper etc.) move from saddle to devthink |
| vault from zero | saas registration, app/db with own id, 2gb ceiling unlocked to 900mb-900gb+ configurable, better-sqlite3 + mysql2/drizzle/prisma/git-lfs/libgit2/blobs/bigint, no supabase sdk, nothing in the browser, db download blocked forever (the faun flaw), internal root + internal apis + thousands of mime types |
| debonair v1 | the payload archaeology: ingest decomposes the song into the structured json document, reverse ingest reconstructs and plays inside the saddle sandbox (pattern/1, timeline/1, soundpayload/1 doors), recon/3 law of 82 seats, blob lane by sha256, 44100 analysis / 48000 mastering |

---

## per-app map (11 apps) — categories: interaction, interactivity, logic, bugs, storage, implementation, organization, regrouping

### saddle (engine mestre de virtualização — first priority)
- organization: modalities registry compiled and published in the envelope, consumed via library bridge (no vendored mirror); non-sandbox features out to devthink
- implementation: 90 modalities with real executors (make/ninja build, git objects fs, dns/doh network, deno/serverless/wasi runners); qemu real drives; sh/yml interpretation via babel; profiles as data (db record + container envelope)
- storage: ram bridge storage, zero-copy mapping, tmpfs, compressed swap, fuse mounts, db-as-ram, cdn load with integrity hashes
- bugs: the container docker build must complete (the icu seat landed at 2.0.175 — the vhe lanes finally walk the trivy scan, ghcr publish and os-distribution catalog)
- distribution: the exotic container — 15+ lanes, max/balanced/lite on every os distribution, 11 architectures
- logic: hypervisor engine (M:N scheduler with vcpu overcommit, topology builder, memory balloon, hotplug, page merge), vm plan generator, snapshots/restore/live migration, warm pool

### vault (armazenamento puro — second priority)
- storage: 1 mib chunks with content-hash dedup, aes-256-gcm at rest, decoy db for anonymous probes, banks multiply with mapping registry, temperature memory layers (hot <1ms / warm <10ms / cold <1s / archive <1h), quorum replication
- implementation: supabase-style signup (app/db registration with own id), the 2gb→900gb+ unlock (configurable per plan), my files panel rebuilt with real numbers from live storage
- bugs: the db download blocked forever; nothing persisted in the visitor browser
- organization: label factory imported by the eleven apps (typed accessors, interface chains live in the db)
- interaction: saas face — hero selling the store directly, plans table, object browser, live db console

### devthink (the os envelope)
- design: the full win11+trylle shell (titlebar, taskbar, start menu, tray, navbar, file explorer with the win11 grammar, window manager with 8 handles), zoom locked, sol theme
- interaction: dual-route law (direct url standalone vs panel window), onboarding flow, boot golden path with zero console errors
- logic: message pipeline with 7 subagents + 1 summarizer, agent swarm (leader/workers/critics/verifiers/mailboxes/blackboard/quorum), tab fusion engine, verdict suite at root (gatekeeper/jury/cache/gates/weights/cascade/evidence/guard/slicer/doc-tree/recovery/summarizer/memory/trainer/calibration)
- implementation: deep search ladder (full-text before model), rss subsystem, streaming social without video bandwidth (replay engine), store selling models/plugins/themes/runners
- organization: consumes argan/cadria/debonair/getry/vault/saddle as libraries — never reimplements

### cadria (estúdio de vídeo/3d/ia visual — focus app)
- interaction: the seven composite wingets landed this session (studio bench + pipeline, edit timeline, gallery wall, home strip, player viewer, settings surface) with the construction face as arming prop
- logic: software raster on the server (visitor gpu never used), edit algebra with typed refusals, 10s-slice video render (preview = final), exact-frame decode sessions, bigint ticks, declarative transcode ladder
- implementation: visualize (image→mesh heightfield), parametric primitives + modifiers, wavefront/stereo/usda/gltf exporters, hear-to-see pipeline, 16 blend modes, background removal matrix
- bugs: compositing/encode of real video in construction — the transcode plan must execute (the pipeline bench now walks the real 24 stages over the gateway lane)

### debonair (engine de áudio — focus app)
- logic: katexis engine at root — ingest.ts (4,122 lines) decomposes, recon.ts (2,020 lines, the recon/3 law of 82 seats), reverseingest.ts (three doors), blobstore by sha256
- implementation: the v1 restoration inside the saddle sandbox (ingest worker + render worker, modality via workloadlaw), pure-synthesis mastering chain (measured loudness, -14 lufs / -1 dbtp, wav 24-bit 48khz)
- interaction: the 8-page daw surface (onboarding/login/mixer/timeline/piano roll/library/master/settings)

### getry (gateway universal de ia)
- logic: 35 routes (7 endpoints × 5 versions), 5 lanes (sandbox/paused/key-pool/anonymous/free-tag), meta-model masking, thought always-on with 7 levels, inference pipeline (4 gates, lru cache, gatekeeper, 3-jury, cascade, calibration), anti-flattery, streaming law, anti-limit backoff, key vault, 12-method auth pallium, multimodal subroutes + million-token slicer

### argan (rede/dns)
- logic: handwritten dns protocol (10 record families), full transports (udp/tcp/dot/doh/doh-json/doq + rate limit), dnssec with ecdsa rotation, hung-domain model, registrar panel, hmac-gossip replica cluster, own naming system, 100+ resolution modality layers, self-hosted email, meta-search crawler

### forge (runner clone)
- logic: binary execution over the saddle engine (queuebinarylaunch), never a new app, zero binaries in release assets, virtual hardware engine (flagship cpu emulated), character decomposition pipeline (9-layer ontology)

### foundry (pipeline clone)
- logic: stages in real sandbox + artifacts in vault (content-addressed chunks), yml slice pipelines with real interpretation, e2b/docker-clone interface, admin control surface, mime handling + tar.xz packaging

### cobaia (monetization surface)
- interaction: public catalog with direct links/prices/support/blog/legal pages, honest ad slots (empty until approval), mrr tracking, checkout/sponsors/ko-fi/tips rails, cashback as store credit
- ethics: absolute limit against dark patterns and invalid traffic

### stealthhead (fps game platform)
- state: the honest "jogo em construção" single visual while not ready
- logic (future): precompilation doctrine, db as virtual gpu/cpu, deterministic physics (axis bisection + spatial hash), 12hz multiplayer, arsenal with real weapon data, enemy state machines, elo/glicko ranking

---

## the three open complaints (this session's verification targets)

| complaint | status at session start | action |
|---|---|---|
| release assets stuck below 1,000+ | the 2.0.175 rung publishes but assets below the 1,000 target | verify the release lane asset count, expand the matrix lanes until the count crosses 1,000+ |
| saddle + sibling containers not published | the vhe lanes skipped below the trivy gate three times (icu wall at 2.0.174); the icu seat landed at 2.0.175 — the tagged source finally walks scan + ghcr publish + os-distribution catalog | verify the 2.0.175 lane run went green end-to-end; fix whatever still reddens |
| os/arch lanes only 2 (linux/arm64 + unknown) instead of 15+ | the os-distribution catalog lane is new at 2.0.175 | verify the lane count; expand to 15+ os lanes (alpine, nixos, v, arch, debian + per-distribution archos matrix) |

## commit verification law

run the 1,600+ commits against the document pendências — per category, per
app, micro → macro. the repo sits at 1,539+ commits locally at session start
(2.0.175 + the cadria wave = 8addca41); the verification sweeps the history
mapping each pendência to the commit that closed it, and any pendência without
a closing commit becomes a new PR.

---

## session results (2026-11-10, this wave)

### landed this session
- 8addca41 — the cadria detailed engine wave: the seven composite wingets (studio bench + pipeline, edit timeline, gallery wall, home strip, player viewer, settings surface) + the gateway pipeline lane (GET/POST /api/pipeline over the real 24-stage walk) + 39 studio.pipeline.* labels + the construction law re-pinned (648 green legs over 47 files)
- b6a81dc7 — the debonair detailed engine wave: the five composite wingets (home strip, ingest bench, library shelf, generate surface, settings surface) over the real engine lanes (kathesis hpss separation, ingest decompose, wavwriter + playerbus + session blob lane, gateway/mirror store, generateclient) + version.ts lockstep module (1,112 green legs over 67 files)
- cherry-picked the hairline doc fix (92019d14) that remote lacked

### commit verification (task 6, read-only agent)
9 of 10 pendência groups closed in git history:
| pendência | closing commit | status |
|---|---|---|
| logics.ts retirement | 9762a6b6 (#603) + 9c679d64 (#592) | closed — zero logics files tracked |
| icu/dotnet container fix | c81cf53c (#619) sealed by d775a1f7 (#620) | closed at source; run verification in flight |
| fifteen-plus saddle lanes | 3a7f7bf5 → fb6673de (#503) → bb3b3cbe (#594: 27 lanes) | closed — 36 lane jobs walking in the 2.0.175 containers run |
| 2gb vault ceiling unlock | 790b6fdb (#467) + 47f358c5 (#440) + 3201c980 | closed — 900MB-900GB+ configurable |
| my files panel rebuild | c5782d61 (#571) | closed |
| zero hardcoding law | 69d9af0b + 8addca41 (27 commits) | closed per-app by batteries |
| family tests restoration | 84dab522 + 8addca41 | closed — all 11 suites green |
| nginx at 11 roots | 1e806b80 + 1c02edc2 | closed — 11/11 nginx.conf |
| maven com.wenathlan scope | ee0e2c85 (#488) + 4f9a5c5b (#493) | closed (saddle pom keeps io.wenathlan adapter by design) |
| registry heal dist-tags | 24379bc5 (#612) + c0d84399 (#614) | closed — manifest-rung dynamic realign |

### production browser verification (the sandbox-lies law)
- https://wenathlan.github.io/devthink/ renders fully (hero, navbar, sign in, launch) — zero console errors, no white screen
- /panel golden path walked live: lock screen → unlock → account creation (google/github/gitlab/cli icons) → create account → desktop with taskbar (start menu, search, pinned chat/console/gateway/docs, quick settings, calendar) + desktop icons — zero errors
- app windows open inside the panel without URL redirect (the dual-route law holds)

### the three complaints — live state
1. release assets 1,000+: v2.0.175 at 641+ and growing (v2.0.174 hit exactly 1,000; the 36-lane expansion + 11-container + 7-webpack assets push past it as the run completes)
2. containers published: the 2.0.175 containers run is actively publishing — saddle max/balanced/lite × 12 os variants (36 lanes) + the eleven-container standard; GHCR shows only the old saddle package until the lanes land; three sibling lanes (forge/cobaia/debonair) reddened at the patience window waiting for the @wenathlan 2.0.175 npmjs envelopes (publish run still queued on runner congestion) — they need the re-run once npm answers
3. os/arch lanes 15+: the fifteen-plus law is implemented — 36 saddle lane jobs (alpine, android, archlinux, debian, fedora, nixos, omarchy, postmarketos, vanillaos, void, linux × max/balanced/lite)

### open items
- the billing E403 wall on the github packages mirrors (npm/nuget/maven/rubygems publish to github registries) — account quota, notices seated, retries idempotent once lifted
- the publish run must complete the npmjs lanes so the three reddened sibling container lanes can re-run
- the next rung (2.0.176) carries the cadria + debonair engine waves into the envelopes
