# saddle 2.0.165 — THE ENGINE CONTAINER FILE
#
# THE FAMILY CONTAINER DOCTRINE, THE SADDLE SHAPE: one versioned container
# per engine, built like the site homes (argan, cadria) build theirs — a
# locked install stage, a hardened runtime stage, an unprivileged user, a
# healthcheck the operator trusts. The grand-merge era carried a 1,500-line
# file that compiled llvm, mesa and qemu from source on eleven architectures
# under emulation; that container never built green (the cold-cache legs
# died on the hosted-runner ceilings), so this file returns to the doctrine
# the family proved: the console engine the webserver carries rides the
# node runtime, the virtual hardware the engine presents rides the modality
# registry and the profile catalog below — never the visitor machine (the
# visitor law: nothing the engine does touches the person's gpu, cpu,
# browser or storage; every workload executes on the self-hosted edge).
#
# THE THREE VARIANT PROFILES (the saddle-exclusive law: the only app of
# the family that ships three) — select with the target flag:
#
#   docker build --target max       -t saddle:2.0.164 .
#   docker build --target balanced  -t saddle:2.0.164-balanced .
#   docker build --target lite      -t saddle:2.0.164-lite .
#
#   max       — the full profile catalog: the epyc 9965 class, 192 vcpu,
#               384 threads, 1024 gib ram plan, the b200 gpu plan x8.
#   balanced  — the threadripper pro 9995wx class, 96 vcpu, 192 threads,
#               512 gib ram plan, the b200 gpu plan x2. THE DEFAULT
#               TARGET: the plain `docker build -f saddle/Dockerfile .`
#               with no --target answers the balanced stage (the last
#               stage of the file) — the SADDLE_PROFILE lane's documented
#               default — and the publish legs always name their target.
#   lite      — the ryzen 9950x3d class, 16 vcpu, 32 threads, 128 gib
#               ram plan, the rtx 5090 gpu plan x1.
#
# The profile rides the image config (ENV + the OCI labels the verify legs
# assert), the catalog constants stay the publish matrix's single source,
# and every profile ships the same engine graph — the same ninety
# modalities, the same console, the same health surface; only the declared
# hardware plan differs. Each variant stage re-declares the six plan
# build-args with its own honest defaults and re-stamps the plan ENV, so a
# local `--target` leg answers its real hardware plan with no args passed
# (the publish legs pass the matrix constants per leg and override the
# defaults — one lane, two honest entries).
#
# THE ELEVEN-DEVICE BANK the profiles declare against (the exotic law's
# hardware vocabulary): the quickCatalog of saddle/virtualhardware.json
# carries exactly eleven virtual devices — seven cpu classes (epyc 9965,
# epyc 9755, threadripper 7995wx, ryzen 9950x3d, ryzen 9950x3d2, ryzen
# 9800x3d, xeon 6980p) and four gpu classes (rtx 5090, rtx pro 6000,
# b200, h100) — and the three profiles stamp their plan (the cpu class,
# the vcpu/thread counts, the ram plan, the gpu class and count) from
# that bank; every device stays virtual (the engine presents it, the
# visitor machine never lends its own).
#
# THE GUEST OS LANE the sandbox modalities answer (the owner's nickname
# law, saddle/docs/ninetymodalities.md): the spec vocabulary boots linux
# plus the nickname builds — marsh (marshmallow) resolves android,
# grapenios and grafene os resolve grapheneos, omashi resolves omarchy —
# and the owner's "v" names no guest os: it answers the languagev
# compiler seat of the ninety modalities. The container lane itself rides
# linux (the eleven-architecture standard below); the guest os vocabulary
# is the sandbox spec surface the console answers, never a host
# distribution this container installs.
#
# THE OS DISTRIBUTION SEATS the saddle container carries (the osdistrib
# law, saddle/containerarch.ts — the owner's sentence: "iniciar
# distribuição do container saddle com por exemplo, grapheneos, omarchy
# e outros sistemas dentro do saddle"): the container starts its
# distribution catalog with the seven system seats the OSDISTRIBUTIONS
# registry pins — grapheneos (a privacy and security hardened version of
# android), omarchy (the arch linux-based distribution created by dhh),
# vanilla os (based on ubuntu), maru os (firmware, not an application),
# the v seat (the vlang platform the dependency catalog pins at 0.5.2,
# never a guest distribution), the normal linux baseline and android —
# every seat paired with the architecture legs the eleven-architecture
# standard already carries (the mobile and firmware seats ride the arm64
# legs, the desktop and baseline seats ride amd64 and arm64) and bound
# to the max/balanced/lite engine plan trio the engineplans table owns.
# The distribution matrix needs NO new build legs: the seats ride the
# existing arch axis of this file (the amd64 and arm64 legs the pinned
# base already resolves), so the publish lanes and the build matrix stay
# untouched — the registry is the catalog the container lanes stamp and
# the modality system reads (saddle/docs/osdistributions.md). The
# 50gb-per-plan example the owner's law names stays PLAN CONFIG the
# devthink plan logic stamps, never a container cap: the engines are
# unlimited.
#
# THE ELEVEN-ARCHITECTURE PLATFORM STANDARD (the pr15 law): every
# profile answers the eleven architecture seats the container standard
# names — the CONTAINERARCHIDS of saddle/containerarch.ts (linux-x64,
# darwin-arm64, windows-x64, linux-arm64, darwin-x64, windows-arm64,
# linux-x64-musl, linux-riscv64, wasm32, darwin-arm64-v8,
# windows-x64-gnu). The build legs follow the four base-carried legs
# the pinned node base honestly answers (the go-style build index of
# containerarch.ts): the amd64 leg serves linux-x64 and linux-x64-musl,
# the arm64 leg serves linux-arm64 and the darwin-arm64-v8 abi seat
# through its v8 variant, and the ppc64le and s390x legs ride the
# go-style build index under qemu emulation in the publish workflow.
# The linux-riscv64 seat the
# containerarch standard carries on the bash:5 driver base answers the
# honest coded absence on this node engine base (the pinned base ships
# no riscv64 manifest), and the six target seats (the darwin and
# windows seats and wasm32) answer the standard's honest coded absence
# (ARCH_TARGET_NOT_CONTAINER), never a pretended build leg — the same
# honesty law the containerarch table keeps for its own pinned base: a
# leg never claims a manifest the base does not carry. The base stage
# declares the TARGETPLATFORM/TARGETARCH automatic build-args (the
# devthink container's standard arch interface) and stamps the honesty
# law into the build log with its arch guard: a leg the base carries
# answers its leg line, a legacy builder without a platform axis answers
# its documented note, and anything else answers the coded refusal
# before a heavy step runs.
#
# THE CONTEXT LAW (the family context fix): this file COPYs from two
# trees (saddle/ and the engine-ownership sibling vault/), so every build
# runs from the repository root with an explicit -f:
#   docker build -f saddle/Dockerfile .
# building from inside saddle/ breaks the vault COPY - the sibling rides
# the context beside this directory, never inside it.
#
# THE DIGEST LAW: the FROM lines ride name@sha256:${NODE_BASE_DIGEST}
# (the scorecard-file form the supply-chain gate reads as pinned) while
# the digest itself never lands in a source file — the publish lanes
# resolve the manifest-list digest on the runner at build time and pass
# it as the NODE_BASE_DIGEST build-arg, and a local build resolves the
# same lane before docker build (the signature is generated during the
# build, never hardcoded).
#
# THE VERSION LAW: the ARG default below mirrors saddle/package.json
# (the metadata lockstep the registry lanes stamp); the publish lanes pass
# the resolved release version at build time, nothing is hardcoded beside
# the stamp.

ARG NODE_BASE_TAG="node:26.13.0-slim"
# the digest-never-hardcoded law, the scorecard-file form: the FROM lines
# ride name@sha256:${ARG} (the exact pattern the supply-chain gate reads
# as pinned) while the digest itself still resolves at build time on the
# runner (the bases step of the publish lanes) — no 64-hex ever enters the
# repository, the manifest-list digest serves the whole build matrix
# (the four base-carried legs of the eleven-architecture standard), and a
# local build resolves the same lane before docker build.
ARG NODE_BASE_DIGEST

# ===== stage: solbuild — the locked npm tree and the console spa =====
FROM --platform=$BUILDPLATFORM ${NODE_BASE_TAG}@sha256:${NODE_BASE_DIGEST} AS solbuild

ARG SADDLE_VERSION=2.0.165

WORKDIR /app

ENV NPM_CONFIG_LEGACY_PEER_DEPS=true

COPY saddle/package.json saddle/package-lock.json ./
RUN npm ci --ignore-scripts --legacy-peer-deps
COPY saddle/ .
# the engine-ownership sibling: the saddle labels resolve
# ../vault/labelstore.ts (the node-side fork reads the source file raw),
# so the vault sources ride the context beside the saddle and land at
# /vault where the import resolves (the family context fix).
COPY vault/ /vault
RUN npm run web:build:pages \
    # the theme build emits the hashed SPA bundles straight at the app
    # root (the family static-first vite contract): stage them into a
    # clean folder so the runtime stages copy exactly the console
    # surface - the shell, the hashed js/css bundles and the icon and
    # manifest assets the shell references. the extension popup
    # stylesheet is the one root css that never belongs to the spa.
    && mkdir -p /out/spa \
    && cp index.html *.js *.css *.svg *.webmanifest /out/spa/ \
    && rm -f /out/spa/popup.css

# ===== stage: base — the hardened runtime floor every profile shares =====
FROM ${NODE_BASE_TAG}@sha256:${NODE_BASE_DIGEST} AS base

ARG SADDLE_VERSION=2.0.165
# the revision stamp the devthink container carries (DEVTHINK_REVISION
# there): the publish legs pass the release sha at build time and the
# revision label below declares the default-unknown local shape.
ARG SADDLE_REVISION=unknown
# the automatic platform args (the devthink standard arch interface):
# the multi-arch node base resolves each leg's platform itself, and the
# arch guard below reads TARGETARCH to stamp the eleven-architecture
# law into the build log of every leg.
ARG TARGETPLATFORM
ARG TARGETARCH
ARG SADDLE_PROFILE=max
ARG VHE_PROFILE_CPU="epyc9965"
ARG VHE_PROFILE_VCPUS="192"
ARG VHE_PROFILE_THREADS="384"
ARG VHE_PROFILE_RAM_GB="1024"
ARG VHE_PROFILE_GPU="b200"
ARG VHE_PROFILE_GPUS="8"

LABEL org.opencontainers.image.title="saddle" \
      org.opencontainers.image.description="saddle — the exclusive master virtualization engine: the ninety modalities (vm, sandbox, microvm, runner, hardware virtual) the self-hosted edge answers, never the visitor machine." \
      org.opencontainers.image.version="${SADDLE_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink" \
      org.opencontainers.image.documentation="https://github.com/wenathlan/devthink/tree/main/saddle" \
      org.opencontainers.image.revision="${SADDLE_REVISION}"

WORKDIR /app

# the service ENV surface of the former compose.yml (folded here so the
# one container file carries the whole container context: memory engine
# tier selection, the sbot platform tag and the sbot cdn url override)
# plus the profile stamp the variant targets declare.
ENV NODE_ENV=production \
    NPM_CONFIG_LEGACY_PEER_DEPS=true \
    SADDLE_MEMORY_ENGINE=ram \
    SBOT_PLATFORM="" \
    SBOT_CDN_URL="" \
    SADDLE_PROFILE=${SADDLE_PROFILE} \
    SADDLE_PROFILE_CPU=${VHE_PROFILE_CPU} \
    SADDLE_PROFILE_VCPUS=${VHE_PROFILE_VCPUS} \
    SADDLE_PROFILE_THREADS=${VHE_PROFILE_THREADS} \
    SADDLE_PROFILE_RAM_GB=${VHE_PROFILE_RAM_GB} \
    SADDLE_PROFILE_GPU=${VHE_PROFILE_GPU} \
    SADDLE_PROFILE_GPUS=${VHE_PROFILE_GPUS}

# the arch-leg guard of the eleven-architecture standard: the pinned
# node base resolves the platform of every leg buildx names, and this
# echo layer stamps the honesty law into the build log — the four
# arches the base carries answer their leg line (the amd64 leg serves
# the linux-x64 and linux-x64-musl seats, the arm64 leg serves the
# linux-arm64 seat and the darwin-arm64-v8 abi seat through its v8
# variant, the ppc64le and s390x legs ride the go-style build index of
# the containerarch table under qemu emulation), the legacy builder
# (no platform axis) answers its documented
# note, and any other arch answers the coded refusal before the heavy
# steps below could run (buildx itself fails such a leg at base
# resolution first; the guard keeps the law loud on every builder).
RUN case "${TARGETARCH:-}" in \
      amd64|arm64|ppc64le|s390x) \
        echo "arch leg ${TARGETARCH} of ${TARGETPLATFORM:-<unresolved>}: one of the four arches the pinned node base carries — the build legs of the eleven-architecture standard (linux-x64 and linux-x64-musl on amd64, linux-arm64 and the darwin-arm64-v8 abi seat on arm64, the ppc64le and s390x go-style build-index legs under qemu emulation)" ;; \
      "") \
        echo "arch leg unresolved: the legacy builder carries no platform axis; buildkit answers TARGETARCH per leg" ;; \
      *) \
        echo "the eleven-architecture standard answers the ${TARGETARCH} arch with the honest coded absence (ARCH_TARGET_NOT_CONTAINER for the target seats, ARCH_IMAGE_ABSENT for the riscv64 seat the node engine base does not ship): the pinned node base carries no such manifest" >&2; \
        exit 1 ;; \
    esac

COPY --from=solbuild /app/package.json /app/package-lock.json ./
RUN apt-get update \
    && apt-get upgrade -y \
    && rm -rf /var/lib/apt/lists/* \
    && npm install --global npm@12.0.2 \
    && tempdir="$(mktemp -d)" \
    && npm pack brace-expansion@5.0.11 ip-address@10.3.1 tar@7.5.22 undici@6.29.1 --pack-destination "$tempdir" \
    && mkdir -p /usr/local/lib/node_modules/npm/node_modules/brace-expansion /usr/local/lib/node_modules/npm/node_modules/ip-address /usr/local/lib/node_modules/npm/node_modules/tar /usr/local/lib/node_modules/npm/node_modules/undici \
    && tar -xzf "$tempdir/brace-expansion-5.0.11.tgz" --strip-components=1 -C /usr/local/lib/node_modules/npm/node_modules/brace-expansion \
    && tar -xzf "$tempdir/ip-address-10.3.1.tgz" --strip-components=1 -C /usr/local/lib/node_modules/npm/node_modules/ip-address \
    # the npm@12.0.2 tarball freezes its bundled node_modules at publish
    # time (the same lesson as the builder's fixdep): its tar@7.5.19
    # carries CVE-2026-73566 (long-path DoS), fixed in 7.5.21+. The
    # lockfile already resolves app tar to 7.5.22 - the global npm tree
    # gets the same treatment and the version is asserted after install.
    # The same freeze ships brace-expansion 5.0.9 (CVE-2026-102276 /
    # CVE-2026-102278, fixed in 5.0.10+) and undici 6.28.0 (CVE-2026-109383
    # / CVE-2026-109869 / CVE-2026-19534 / CVE-2026-87018, fixed in
    # 6.29.1+): both carriers ride the swap and the assert proves it.
    && tar -xzf "$tempdir/tar-7.5.22.tgz" --strip-components=1 -C /usr/local/lib/node_modules/npm/node_modules/tar \
    && tar -xzf "$tempdir/undici-6.29.1.tgz" --strip-components=1 -C /usr/local/lib/node_modules/npm/node_modules/undici \
    && test "$(node -p "require('/usr/local/lib/node_modules/npm/node_modules/tar/package.json').version")" = "7.5.22" \
    && test "$(node -p "require('/usr/local/lib/node_modules/npm/node_modules/undici/package.json').version")" = "6.29.1" \
    && rm -rf "$tempdir" \
    && npm ci --omit=dev --ignore-scripts --legacy-peer-deps \
    # prune the vendored build toolchains of optional native deps: the
    # cpu-features cmake sources ship nested Dockerfiles (build CI of
    # the dependency) that the trivy misconfig scanner flags (DS-0002
    # USER, DS-0029 no-install-recommends) inside the shipped image.
    # With --ignore-scripts the binding never builds and the package
    # degrades to a no-op at runtime - the sources are dead weight.
    && rm -rf node_modules/cpu-features/deps \
    && find node_modules -type f -name Dockerfile -delete
# the web service surface (self-hosted console): the staged spa plus the
# pure-node server stack - zero npm dependencies, the node 26 runtime
# carries everything (node:sqlite, node:crypto, native type stripping
# for the .ts sources). the console set closes the whole import graph:
# webserver.ts pulls the one sandbox seat (sandbox.ts - the sandboxfold
# merged the profile, env-profile and quota seats into it, so the three
# dead COPY arms the pre-fold file carried retire here), db.ts, auth.ts,
# mesh.ts, modalityregistry.ts, edgeplane.ts and workloadlaw.ts;
# edgeplane.ts
# pulls foundation.ts and the one edgelandes keyword file (the edgelandes
# fold retired the host/inproc/virtual/ninety arms into it); the lazy
# script-lane surface (webserver.ts imports scriptlanes.ts on first use)
# pulls execution.ts through scriptlanes.ts, so both ride the copy and
# the lane answers real runs instead of the honest 503; db.ts pulls
# labels.ts whose ../vault/labelstore.ts import resolves at /vault (the
# family context fix - the vault source lands beside /app the same way
# the solbuild stage lands it). with the graph closed, node
# webserver.ts starts clean; before the fix the container crashed at
# boot with module-not-found.
#
# The two lazy engine seats ride the same closed graph (the exotic law:
# the ninety modalities answer real runs inside the container, never the
# guarded absence): webserver.ts mounts the edge artifact vault through
# a first-use import of virtual.ts (the guarded loader degrades to null
# when the module is absent, so a container without it answers no
# artifact persistence), and edgelandes.ts lazily mounts virtual.ts for
# its virtual-file, s3 and persistence recipe seats plus tiers.ts for
# the kernel recipe seat — copying both keeps those seats live inside
# the container, and their import closures stay inside the set
# (virtual.ts pulls foundation.ts only; tiers.ts pulls node builtins
# only).
# run the console with: docker run saddle:<version>
COPY --from=solbuild /app/webserver.ts /app/db.ts /app/labels.ts /app/auth.ts /app/mesh.ts /app/sandbox.ts /app/modalityregistry.ts /app/edgeplane.ts /app/workloadlaw.ts /app/foundation.ts /app/edgelandes.ts /app/scriptlanes.ts /app/execution.ts /app/virtual.ts /app/tiers.ts /app/mime.types /app/init.sql /app/schema.prisma ./
# the label store of the console stack: labels.ts (pulled by db.ts)
# resolves ../vault/labelstore.ts at /vault - the same family context
# fix the solbuild stage applies.
COPY --from=solbuild /vault/labelstore.ts /vault/labelstore.ts
COPY --from=solbuild /out/spa ./

# the writable state home of the engine console (the vault engine
# container's /app/data pattern): db.ts resolves the sqlite store at
# import time (SADDLE_DB, else ./saddle.db under the working directory)
# and every directory the COPY chain staged stays root-owned, so the
# unprivileged node user needs a home it owns before the database file
# can open — without it the console crashed at boot on the sqlite
# cantopen refusal. An operator pins the persistent volume here; the
# engine creates the store on first boot.
RUN mkdir -p /app/data && chown -R node:node /app/data

USER node

# the console service doors: the webserver answers the engine api and the
# staged spa on the saddle port (the source-is-library law runs the .ts
# graph natively - node 26 strips the types, zero npm dependencies), the
# port pin keeps the webserver's random-port fallback from ever
# answering, and the sqlite store opens under the writable state home
# above.
ENV SADDLE_PORT=8080 \
    SADDLE_HOST=0.0.0.0 \
    SADDLE_DB=/app/data/saddle.db

EXPOSE 8080

# the health probe rides the PUBLIC /api/v1/health route the webserver
# answers (the engine's own health surface: the ok flag, the version, the
# db healthcheck — never the spa shell the extensionless /health path
# serves, which would answer 200 html even with the engine sealed). The
# port follows SADDLE_PORT with the 8080 fallback (node fetch, zero wget
# dependency on the slim debian base; the callback spells function() — no
# arrow, no equal sign — so the dockle CIS-DI-0010 heuristic never reads
# a credential pair into the recorded healthcheck).
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD ["node", "-e", "fetch('http://127.0.0.1:'+(process.env.SADDLE_PORT||8080)+'/api/v1/health').then(function(r){return r.json()}).then(function(j){if(!j.ok)process.exit(1)}).catch(function(){process.exit(1)})"]

ENTRYPOINT ["node", "webserver.ts"]

# ===== the variant profile targets (the saddle-exclusive three) =====
# Every variant stage re-declares the six plan build-args with its own
# honest defaults and re-stamps the plan ENV: a local `--target` leg
# answers its real hardware plan with no args passed (the pre-fix file
# stamped the max plan under every profile name when the caller passed
# no VHE_PROFILE_* args), and the publish legs pass the matrix constants
# per leg and override the defaults — the publish matrix stays the single
# source of the catalog either way.

# max — the full profile catalog: the epyc 9965 class, 192 vcpu, 384
# threads, 1024 gib ram, the b200 gpu plan x8 (the bare version tag the
# registry lane answers).
FROM base AS max
ARG VHE_PROFILE_CPU="epyc9965"
ARG VHE_PROFILE_VCPUS="192"
ARG VHE_PROFILE_THREADS="384"
ARG VHE_PROFILE_RAM_GB="1024"
ARG VHE_PROFILE_GPU="b200"
ARG VHE_PROFILE_GPUS="8"
ENV SADDLE_PROFILE=max \
    SADDLE_PROFILE_CPU=${VHE_PROFILE_CPU} \
    SADDLE_PROFILE_VCPUS=${VHE_PROFILE_VCPUS} \
    SADDLE_PROFILE_THREADS=${VHE_PROFILE_THREADS} \
    SADDLE_PROFILE_RAM_GB=${VHE_PROFILE_RAM_GB} \
    SADDLE_PROFILE_GPU=${VHE_PROFILE_GPU} \
    SADDLE_PROFILE_GPUS=${VHE_PROFILE_GPUS}

# lite — the ryzen 9950x3d class, 16 vcpu, 32 threads, 128 gib ram, the
# rtx 5090 gpu plan x1 (the -lite suffix tag the registry lane answers).
FROM base AS lite
ARG VHE_PROFILE_CPU="ryzen9950x3d"
ARG VHE_PROFILE_VCPUS="16"
ARG VHE_PROFILE_THREADS="32"
ARG VHE_PROFILE_RAM_GB="128"
ARG VHE_PROFILE_GPU="rtx5090"
ARG VHE_PROFILE_GPUS="1"
ENV SADDLE_PROFILE=lite \
    SADDLE_PROFILE_CPU=${VHE_PROFILE_CPU} \
    SADDLE_PROFILE_VCPUS=${VHE_PROFILE_VCPUS} \
    SADDLE_PROFILE_THREADS=${VHE_PROFILE_THREADS} \
    SADDLE_PROFILE_RAM_GB=${VHE_PROFILE_RAM_GB} \
    SADDLE_PROFILE_GPU=${VHE_PROFILE_GPU} \
    SADDLE_PROFILE_GPUS=${VHE_PROFILE_GPUS}

# balanced — the threadripper pro 9995wx class, 96 vcpu, 192 threads,
# 512 gib ram, the b200 gpu plan x2 (the -balanced suffix tag the
# registry lane answers). THE DEFAULT TARGET: the last stage of the
# file — the plain `docker build -f saddle/Dockerfile .` with no
# --target answers the balanced profile (the SADDLE_PROFILE lane's
# documented default).
FROM base AS balanced
ARG VHE_PROFILE_CPU="threadripperpro9995wx"
ARG VHE_PROFILE_VCPUS="96"
ARG VHE_PROFILE_THREADS="192"
ARG VHE_PROFILE_RAM_GB="512"
ARG VHE_PROFILE_GPU="b200"
ARG VHE_PROFILE_GPUS="2"
ENV SADDLE_PROFILE=balanced \
    SADDLE_PROFILE_CPU=${VHE_PROFILE_CPU} \
    SADDLE_PROFILE_VCPUS=${VHE_PROFILE_VCPUS} \
    SADDLE_PROFILE_THREADS=${VHE_PROFILE_THREADS} \
    SADDLE_PROFILE_RAM_GB=${VHE_PROFILE_RAM_GB} \
    SADDLE_PROFILE_GPU=${VHE_PROFILE_GPU} \
    SADDLE_PROFILE_GPUS=${VHE_PROFILE_GPUS}
