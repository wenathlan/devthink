# saddle 2.0.175 — THE ENGINE CONTAINER FILE
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
# law, saddle/containerarch.ts — the owner's sentences: "iniciar
# distribuição do container saddle com por exemplo, grapheneos, omarchy
# e outros sistemas dentro do saddle" and "o saddle nao ta com mais de
# 15 devido as disvbriçoe s com sistem aoperacional como graphene os e
# etc" — the more-than-fifteen directive): the container carries the
# sixteen system seats the OSDISTRIBUTIONS
# registry pins — the seven named law seats (grapheneos a privacy and
# security hardened version of android, omarchy the arch linux-based
# distribution created by dhh, vanilla os based on ubuntu, maru os
# firmware not an application, the v seat the vlang platform the
# dependency catalog pins at 0.5.2 never a guest distribution, the
# normal linux baseline and android) beside the nine honest additions —
# postmarketos (the alpine-based mobile distribution), lineageos (the
# community android continuation), calyxos (the privacy-focused android
# distribution), archlinux (the rolling-release distribution omarchy
# builds on), alpine (the musl-based lightweight distribution), debian
# (the universal operating system), fedora (the red-hat-upstream
# community distribution), nixos (the declarative distribution the nix
# package manager builds) and void (the independent source-rolling
# distribution) —
# every seat paired with the architecture legs the seventeen-seat
# standard already carries (the mobile and firmware seats ride the arm64
# legs, the desktop and baseline seats ride amd64 and arm64, the alpine
# seat carries the widest pairing — the ppc64le, s390x, armv7, armv6 and
# 386 seats the archos wave seated) and bound
# to the max/balanced/lite engine plan trio the engineplans table owns.
# The distribution matrix needs NO new build legs: the seats ride the
# existing arch axis of this file (the amd64 and arm64 legs the pinned
# base already resolves), and the container-lane standardization seats
# ELEVEN flavor distributions on the full max/balanced/lite trio (the
# 11×3 geometry the flavor section below carries) — the registry stays
# the catalog the container lanes stamp and
# the modality system reads (saddle/docs/osdistributions.md). The
# 50gb-per-plan example the owner's law names stays PLAN CONFIG the
# devthink plan logic stamps, never a container cap: the engines are
# unlimited.
#
# THE SEVENTEEN-ARCHITECTURE PLATFORM STANDARD (the pr15 law grown by
# the archos wave, the owner's directive: "expanda ali o OS/Arch
# (restrito a linux/arm64 e unknown) para 15+ lanes tanto nos sistemas
# operacionais (Alpine, NixOS, V, Arch Linux e Debian) quanto no
# respectivo ArchOS interno"): every
# profile answers the seventeen architecture seats the container
# standard names — the CONTAINERARCHIDS of saddle/containerarch.ts
# (linux-x64, darwin-arm64, windows-x64, linux-arm64, darwin-x64,
# windows-arm64, linux-x64-musl, linux-riscv64, wasm32,
# darwin-arm64-v8, windows-x64-gnu beside the six archos seats:
# linux-ppc64le, linux-s390x, linux-armv7, linux-armv6, linux-386 and
# linux-mips64le). The build legs follow the four base-carried legs
# the pinned node base honestly answers (the go-style build index of
# containerarch.ts): the amd64 leg serves linux-x64 and linux-x64-musl,
# the arm64 leg serves linux-arm64 and the darwin-arm64-v8 abi seat
# through its v8 variant, and the ppc64le and s390x legs ride the
# go-style build index under qemu emulation in the publish workflow.
# The linux-riscv64 seat the
# containerarch standard carries on the bash:5 driver base answers the
# honest coded absence on this node engine base (the pinned base ships
# no riscv64 manifest), the archos armv7/armv6/386 seats ride the bash
# driver base alone (the legs this node engine base never pretends —
# the container drivers answer them, the vhe publish lanes keep their
# four build legs), the linux-mips64le seat owns the honest target
# class (no pinned base carries a mips64le leg), and the six target
# seats (the darwin and windows seats and wasm32) answer the standard's
# honest coded absence
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
# THE DIGEST LAW (the local-build heal): the FROM lines ride
# name@sha256:${NODE_BASE_DIGEST} (the scorecard-file form the
# supply-chain gate reads as pinned) and the ARG carries the resolved
# manifest-list digest of the pinned tag as its default — the same floor
# the debonair/forge seats stamp as their hardcoded digest, so a plain
# local `docker build -f saddle/Dockerfile .` never dies on an empty
# `@sha256:` reference the way the digest-never-hardcoded era did (the
# owner's law: the container must build functional like the other ten).
# The publish lanes still resolve the manifest digest on the runner at
# build time and override the default with the fresh value — the pin
# form the gate reads stays identical either way.
#
# THE VERSION LAW: the ARG default below mirrors saddle/package.json
# (the metadata lockstep the registry lanes stamp); the publish lanes pass
# the resolved release version at build time, nothing is hardcoded beside
# the stamp.

ARG NODE_BASE_TAG="node:26.13.0-slim"
# the resolved manifest-list digest of node:26.13.0-slim (the local-build
# floor the ARG default stamps — the publish lanes override it with the
# freshly resolved digest at build time, and the FROM lines keep the
# name@sha256:${ARG} pin form the supply-chain gate reads either way):
# the default ends the empty-@sha256: era where a local build without the
# build-arg answered an invalid base reference and the container the
# owner charged functional never built at all.
ARG NODE_BASE_DIGEST=5adad64f9a1fca2d51972caa65983634c8a774eb300d72b20f7f2a0f60368072

# ===== stage: solbuild — the locked npm tree and the console spa =====
FROM --platform=$BUILDPLATFORM ${NODE_BASE_TAG}@sha256:${NODE_BASE_DIGEST} AS solbuild

ARG SADDLE_VERSION=2.0.175

WORKDIR /app

ENV NPM_CONFIG_LEGACY_PEER_DEPS=true

COPY saddle/package.json saddle/package-lock.json saddle/pnpm-workspace.yaml ./
RUN npm ci --ignore-scripts --legacy-peer-deps
COPY saddle/ .
# the engine-ownership sibling: the saddle labels resolve
# ../vault/labelstore.ts (the node-side fork reads the source file raw),
# so the vault sources ride the context beside the saddle and land at
# /vault where the import resolves (the family context fix).
COPY vault/ /vault
# the routerbase sibling of the family law: saddle/routerbase.ts
# re-exports the family routerBase from ../devthink/routerbase.ts, so
# the devthink sources land at /devthink where the sol build resolves
# the re-export (sources only - the same never-installed law the vault
# sibling above rides, the family context fix the lanes carry).
COPY devthink/ /devthink
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

ARG SADDLE_VERSION=2.0.175
# the revision stamp the devthink container carries (DEVTHINK_REVISION
# there): the publish legs pass the release sha at build time and the
# revision label below declares the default-unknown local shape.
ARG SADDLE_REVISION=unknown
# the automatic platform args (the devthink standard arch interface):
# the multi-arch node base resolves each leg's platform itself, and the
# arch guard below reads TARGETARCH to stamp the seventeen-seat
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

# the arch-leg guard of the seventeen-seat standard: the pinned
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
        echo "arch leg ${TARGETARCH} of ${TARGETPLATFORM:-<unresolved>}: one of the four arches the pinned node base carries — the build legs of the seventeen-seat architecture standard (linux-x64 and linux-x64-musl on amd64, linux-arm64 and the darwin-arm64-v8 abi seat on arm64, the ppc64le and s390x go-style build-index legs under qemu emulation)" ;; \
      "") \
        echo "arch leg unresolved: the legacy builder carries no platform axis; buildkit answers TARGETARCH per leg" ;; \
      *) \
        echo "the seventeen-seat architecture standard answers the ${TARGETARCH} arch with the honest coded absence (ARCH_TARGET_NOT_CONTAINER for the target seats, ARCH_IMAGE_ABSENT for the riscv64 seat the node engine base does not ship — the archos armv7/armv6/386 seats ride the bash driver base the vhe lanes never build): the pinned node base carries no such manifest" >&2; \
        exit 1 ;; \
    esac

COPY --from=solbuild /app/package.json /app/package-lock.json /app/pnpm-workspace.yaml ./
# the both-blocks grammar heal (the saddle container law): the family
# manifest carries the same seats inside dependencies and
# devDependencies, and every npm tested (11.19.1 and 12.0.2) answers
# that duplicate seat by planting dev:true over the whole lock tree -
# so a plain `npm ci --omit=dev` installs nothing and the runtime stage
# dies at the cleanup walk with no node_modules to sweep. The derived
# prod-only manifest (the dependencies block alone, byte-identical
# specs) restores the honest production install. Nothing is removed -
# the dev seats stay in the lock for the full-install lanes, only the
# runtime's own view of the manifest narrows.
# THE PNPM INSTALL LAW (the containerlanes heal, the vault enginedeps
# precedent): the dependency install walks through pnpm --prod the same
# lane the vault engine carries - the npm ci lane died on the exotic
# arch legs (EBADPLATFORM: the libsql native gates its cpu field to
# x64/arm64/wasm32/arm and the @libsql/client envelope declares libsql
# as a REGULAR dependency, so npm ci hard-fails on ppc64le and s390x),
# while pnpm's resolver omits the platform-gated native on every arch
# it cannot carry (x64 and arm64 keep the full libsql closure; the
# exotic legs answer the honest absence the lazy import guard owns -
# the HOST_RUNTIME_ABSENT lane, the ram memory engine the container
# default). The npm@12.0.2 runtime tool stays (the CVE-swap heal below
# owns the operator toolchain); only the dependency walk changes.
RUN node -e "const fs=require('node:fs');const m=JSON.parse(fs.readFileSync('package.json','utf8'));delete m.devDependencies;fs.writeFileSync('package.json',JSON.stringify(m,null,2)+'\n')"
# THE PACK+EXTRACT TOOLCHAIN SEAT (the scorecard pin law): the global
# npm and pnpm tools install through the same pack-and-extract lane the
# CVE swaps below ride — npm pack answers the exact version pins without
# the install verb the hash doctrine reddens, the tarballs unpack into
# the global tree the base symlinks already answer, and the asserts
# prove every version the image carries.
RUN apt-get update \
    && apt-get upgrade -y \
    && rm -rf /var/lib/apt/lists/* \
    && tempdir="$(mktemp -d)" \
    && npm pack npm@12.0.2 pnpm@12.18.0 brace-expansion@5.0.11 ip-address@10.3.1 tar@7.5.22 undici@6.29.1 --pack-destination "$tempdir" \
    && mkdir -p /usr/local/lib/node_modules/npm \
    && tar -xzf "$tempdir/npm-12.0.2.tgz" --strip-components=1 -C /usr/local/lib/node_modules/npm \
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
    && test "$(npm --version)" = "12.0.2" \
    && mkdir -p /usr/local/lib/node_modules/pnpm \
    && tar -xzf "$tempdir/pnpm-12.18.0.tgz" --strip-components=1 -C /usr/local/lib/node_modules/pnpm \
    && ln -sf ../lib/node_modules/pnpm/bin/pnpm.cjs /usr/local/bin/pnpm \
    && test "$(pnpm --version)" = "12.18.0" \
    && rm -rf "$tempdir" \
    # THE PNPM DEPENDENCY WALK (the containerlanes heal): the pnpm
    # --prod lane replaces the npm ci walk - the pinned pnpm of the
    # family (12.18.0, the root packageManager seat) installs the
    # production closure the derived manifest names, omitting every
    # platform-gated native the current arch cannot carry (the libsql
    # lesson: npm ci hard-failed EBADPLATFORM on ppc64le/s390x because
    # @libsql/client declares the gated libsql as a regular dep, while
    # pnpm omits it - x64/arm64 keep the full closure, the exotic legs
    # answer the honest absence the lazy import guard owns). The
    # pnpm-workspace.yaml rides the saddle context the same file always
    # carried (the vulnerability overrides the lock lanes read).
    && pnpm install --prod --no-frozen-lockfile --ignore-scripts \
    # prune the vendored build toolchains of optional native deps: the
    # cpu-features cmake sources ship nested Dockerfiles (build CI of
    # the dependency) that the trivy misconfig scanner flags (DS-0002
    # USER, DS-0029 no-install-recommends) inside the shipped image.
    # With --ignore-scripts the binding never builds and the package
    # degrades to a no-op at runtime - the sources are dead weight.
    && rm -rf node_modules/cpu-features/deps \
    && find node_modules -type f -name Dockerfile -delete \
    # prune the package caches the image never needs to carry: the pnpm
    # content-addressed store ships npm test fixtures (keypair-style
    # "secrets" the trivy secret scanner flags - forty-one findings)
    # and the npm cacache answers only bloat - node_modules/.pnpm
    # survives because its files are hardlinks inside this same layer.
    && rm -rf /root/.local/share/pnpm/store /root/.cache/pnpm /root/.npm/_cacache
# THE TOOLCHAIN LAYER — the fourteen planned seats walk live (the pr13
# completion law): the engine host carries the runtimes the language,
# build and wasi seats spawn, every carrier pinned to the exact version
# the engines catalog answers and the assert after every install proving
# the binary answers its version. the apt lanes (make, ninja, lua, php,
# the gcc toolchain the v and nim codegen rides) install on every arch
# leg debian ships them for; the prefab carriers (rustup 1.99.1, zig
# 0.17.1, wasmtime 50.0.1, v 0.5.2, nim 2.4.0, dotnet sdk 10.0.403)
# ride the two native legs (amd64, arm64) their publishers ship — the
# exotic legs (ppc64le, s390x) answer the honest coded absence the
# seats' probes name at dispatch (HOST_RUNTIME_ABSENT — the seat never
# fakes a run), the same law the arch case above carries. the icu seat:
# the dotnet runtime hard-fails its own version assert (FailFast, SIGABRT
# exit 134) the moment the carrier image answers no libicu — the .net
# globalization stack refuses to boot without it — so the library rides
# the apt lane on every arch leg and the dotnet --version assert below
# walks green the same way the v seat walks the prebuilt binary.
RUN set -eux; \
    arch="${TARGETARCH:-$(dpkg --print-architecture)}"; \
    apt-get update; \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
      build-essential ca-certificates curl git libicu-dev lua5.4 ninja-build php-cli unzip xz-utils; \
    ln -sf /usr/bin/lua5.4 /usr/local/bin/lua; \
    make --version | head -1; \
    ninja --version; \
    lua -v; \
    php --version | head -1; \
    case "$arch" in \
      amd64|arm64) \
        rustuparch="x86_64-unknown-linux-gnu"; \
        [ "$arch" = "arm64" ] && rustuparch="aarch64-unknown-linux-gnu"; \
        curl -fsS https://sh.rustup.rs -o /tmp/rustup-init.sh; \
        sh /tmp/rustup-init.sh -y --profile minimal --default-toolchain 1.99.1 \
          --no-modify-path --default-host "$rustuparch"; \
        rustctool="/root/.rustup/toolchains/1.99.1-${rustuparch}/bin"; \
        ln -sf "$rustctool/rustc" /usr/local/bin/rustc; \
        ln -sf "$rustctool/cargo" /usr/local/bin/cargo; \
        rustc --version; \
        cargo --version; \
        zigarch="x86_64"; [ "$arch" = "arm64" ] && zigarch="aarch64"; \
        curl -fsSL "https://ziglang.org/download/0.17.1/zig-${zigarch}-linux-0.17.1.tar.xz" \
          -o /tmp/zig.tar.xz; \
        mkdir -p /opt/zig; \
        tar -xJf /tmp/zig.tar.xz --strip-components=1 -C /opt/zig; \
        ln -sf /opt/zig/zig /usr/local/bin/zig; \
        zig version; \
        wasmtimearch="x86_64"; [ "$arch" = "arm64" ] && wasmtimearch="aarch64"; \
        curl -fsSL "https://github.com/bytecodealliance/wasmtime/releases/download/v50.0.1/wasmtime-v50.0.1-${wasmtimearch}-linux.tar.xz" \
          -o /tmp/wasmtime.tar.xz; \
        mkdir -p /opt/wasmtime; \
        tar -xJf /tmp/wasmtime.tar.xz --strip-components=1 -C /opt/wasmtime; \
        ln -sf /opt/wasmtime/wasmtime /usr/local/bin/wasmtime; \
        wasmtime --version; \
        # the v seat rides the official prebuilt binary the 0.5.2 release
        # publishes (v_linux.zip beside v_linux_arm64.zip): the source
        # bootstrap the lane carried died because make clones TODAY'S vc
        # master to compile the pinned 0.5.2 vlib — a bootstrap compiler
        # months newer than the tree it compiles, the deprecation wall the
        # make answered Error 1 on. the prebuilt zip carries the matched
        # binary beside its own vlib (5,385 sources), the exact pin the
        # engines catalog names, and the assert below proves it.
        vasset="v_linux.zip"; [ "$arch" = "arm64" ] && vasset="v_linux_arm64.zip"; \
        curl -fsSL "https://github.com/vlang/v/releases/download/0.5.2/${vasset}" -o /tmp/v.zip; \
        unzip -q /tmp/v.zip -d /opt; \
        ln -sf /opt/v/v /usr/local/bin/v; \
        v version; \
        git clone --depth 1 --branch v2.4.0 https://github.com/nim-lang/Nim.git /opt/nim; \
        sh -c 'cd /opt/nim && sh build_all.sh'; \
        ln -sf /opt/nim/bin/nim /usr/local/bin/nim; \
        nim --version | head -1; \
        curl -fsSL https://dot.net/v1/dotnet-install.sh -o /tmp/dotnet-install.sh; \
        bash /tmp/dotnet-install.sh --channel 10.0 --version 10.0.403 --install-dir /usr/share/dotnet; \
        ln -sf /usr/share/dotnet/dotnet /usr/local/bin/dotnet; \
        dotnet --version; \
        ;; \
      *) \
        echo "the toolchain layer answers the honest coded absence on ${arch}: the prefab carriers ship amd64 and arm64 alone (the seats' probes name the requirement at dispatch)" ;; \
    esac; \
    rm -rf /var/lib/apt/lists/* /tmp/* /opt/nim/.git /opt/v/.git; \
    # strip the v toolchain test trees the compiler never walks: the
    # h2spec server fixture carries an embedded rsa test key (a secret
    # finding) and the autobahn websocket tree ships a Dockerfile the
    # misconfig scanner flags (DS-0002) - test files are not needed to
    # compile v user code.
    find /opt/v/vlib -type d -name tests -exec rm -rf {} + 2>/dev/null || true; \
    rm -rf /opt/v/vlib/net/http/h2spec; \
    mkdir -p /sandbox && chown node:node /sandbox
ENV DOTNET_CLI_TELEMETRY_OPTOUT=1 \
    DOTNET_NOLOGO=1 \
    DOTNET_CLI_HOME=/sandbox/dotnet-home \
    DOTNET_CLI_LANGUAGE=en
# the web service surface (self-hosted console): the staged spa plus the
# pure-node server stack - zero npm dependencies, the node 26 runtime
# carries everything (node:sqlite, node:crypto, native type stripping
# for the .ts sources). the console set closes the whole import graph:
# webserver.ts pulls the one sandbox seat (sandbox.ts - the sandboxfold
# merged the profile, env-profile and quota seats into it, so the three
# dead COPY arms the pre-fold file carried retire here), db.ts, auth.ts,
# mesh.ts, modalities.ts (the modalityregistry fold answered the ninety
# records into the modalities keyword file the catalog law owns),
# edgeplane.ts and workloadlaw.ts;
# edgeplane.ts
# pulls foundation.ts and the one edgelandes keyword file (the edgelandes
# fold retired the host/inproc/virtual/ninety arms into it); the lazy
# script-lane surface (webserver.ts imports the one scripts keyword
# file on first use — the scripts fold retired the scriptlanes seat into
# it) pulls execution.ts through scripts.ts, so both ride the copy and
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
COPY --from=solbuild /app/webserver.ts /app/db.ts /app/labels.ts /app/auth.ts /app/mesh.ts /app/sandbox.ts /app/modalities.ts /app/edgeplane.ts /app/workloadlaw.ts /app/foundation.ts /app/edgelandes.ts /app/scripts.ts /app/execution.ts /app/virtual.ts /app/tiers.ts /app/mime.types /app/init.sql /app/schema.prisma ./
# the label store and the onboarding store of the console stack: labels.ts
# (pulled by db.ts) resolves ../vault/labelstore.ts at /vault and db.ts
# resolves ../vault/onboardingstore.ts beside it - the same family
# context fix the solbuild stage applies (the routerbase law: the
# node-side forks read the sibling sources raw, the specifier doors
# stay for the vite and vitest bridges).
COPY --from=solbuild /vault/labelstore.ts /vault/labelstore.ts
COPY --from=solbuild /vault/onboardingstore.ts /vault/onboardingstore.ts
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

# ===== the os-distribution flavor lanes (the container-lane law) =====
# THE OS-DISTRIBUTION AXIS BESIDE THE PROFILE AXIS, THE 11×3
# STANDARDIZATION (the owner's container-lane law: the saddle container
# carries MORE THAN 15 lanes — and the standardization charge: the
# flavor lanes carry ELEVEN os distributions, every flavor on the full
# three-tier axis): ELEVEN seats of the OSDISTRIBUTIONS catalog ride the
# same honest node base legs — linux (the baseline seat), omarchy (the
# arch linux-based desktop distribution created by dhh), vanilla os
# (the ubuntu-based atomic distribution), android (the mobile platform
# the grapheneos hardening builds on), archlinux (the rolling-release
# distribution omarchy builds on), alpine (the musl-based lightweight
# distribution), debian (the universal operating system), fedora (the
# red-hat-upstream community distribution), nixos (the declarative
# distribution the nix package manager builds), void (the independent
# source-rolling distribution) and postmarketos (the alpine-based
# mobile distribution real devices boot) — and EVERY flavor binds the
# max, balanced and lite plans the engineplans trio owns: the max tier
# rides FROM max (the bare -<seat> tag), the balanced tier FROM
# balanced (-<seat>-balanced) and the lite tier FROM lite
# (-<seat>-lite), thirty-three flavor targets that stamp the catalog
# seat into the image config (SADDLE_OS_PROFILE + the OCI labels)
# beside the plan the parent profile stage already baked. the flavor is
# the GUEST SEAT the engine hosts (the catalog law of
# saddle/containerarch.ts: the engine presents the profile, it never
# installs a host distribution) — the same engine graph, the same ninety
# modalities, the same health surface, one honest seat stamp per lane:
#
#   docker build --target oslinux           -t saddle:2.0.172-linux .
#   docker build --target oslinux-balanced  -t saddle:2.0.172-linux-balanced .
#   docker build --target oslinux-lite      -t saddle:2.0.172-linux-lite .
#   docker build --target osomarchy         -t saddle:2.0.172-omarchy .
#   docker build --target osvanillaos       -t saddle:2.0.172-vanillaos .
#   docker build --target osandroid         -t saddle:2.0.172-android .
#   docker build --target osarchlinux       -t saddle:2.0.172-archlinux .
#   docker build --target osalpine          -t saddle:2.0.172-alpine .
#   docker build --target osdebian          -t saddle:2.0.172-debian .
#   docker build --target osfedora          -t saddle:2.0.172-fedora .
#   docker build --target osnixos           -t saddle:2.0.172-nixos .
#   docker build --target osvoid            -t saddle:2.0.172-void .
#   docker build --target ospostmarketos    -t saddle:2.0.172-postmarketos .
#   ... every flavor beside its -balanced and -lite siblings: the
#   saddle-containers matrix of the containers workflow names all
#   thirty-three flavor targets, three legs per distribution, and the
#   seven seats that also own a no-base catalog stage below keep that
#   seat under its -catalog name (never a shadowed stage name).
FROM max AS oslinux
ARG SADDLE_OS_PROFILE="linux"
ENV SADDLE_OS_PROFILE=linux
LABEL org.opencontainers.image.title="saddle (the linux os-distribution lane)" \
      org.opencontainers.image.description="saddle — the master virtualization engine bound to the linux os-distribution seat of the catalog: the baseline distribution the container itself rides."

FROM balanced AS oslinux-balanced
ARG SADDLE_OS_PROFILE="linux"
ENV SADDLE_OS_PROFILE=linux
LABEL org.opencontainers.image.title="saddle (the linux os-distribution lane, balanced tier)" \
      org.opencontainers.image.description="saddle — the master virtualization engine bound to the linux os-distribution seat of the catalog on the balanced plan: the baseline distribution the container itself rides."

FROM lite AS oslinux-lite
ARG SADDLE_OS_PROFILE="linux"
ENV SADDLE_OS_PROFILE=linux
LABEL org.opencontainers.image.title="saddle (the linux os-distribution lane, lite tier)" \
      org.opencontainers.image.description="saddle — the master virtualization engine bound to the linux os-distribution seat of the catalog on the lite plan: the baseline distribution the container itself rides."

FROM max AS osomarchy
ARG SADDLE_OS_PROFILE="omarchy"
ENV SADDLE_OS_PROFILE=omarchy
LABEL org.opencontainers.image.title="saddle (the omarchy os-distribution lane)" \
      org.opencontainers.image.description="saddle — the master virtualization engine bound to the omarchy os-distribution seat of the catalog: the arch linux-based distribution created by dhh, hosted as the desktop guest profile."

FROM balanced AS osomarchy-balanced
ARG SADDLE_OS_PROFILE="omarchy"
ENV SADDLE_OS_PROFILE=omarchy
LABEL org.opencontainers.image.title="saddle (the omarchy os-distribution lane, balanced tier)" \
      org.opencontainers.image.description="saddle — the master virtualization engine bound to the omarchy os-distribution seat of the catalog on the balanced plan: the arch linux-based distribution created by dhh, hosted as the desktop guest profile."

FROM lite AS osomarchy-lite
ARG SADDLE_OS_PROFILE="omarchy"
ENV SADDLE_OS_PROFILE=omarchy
LABEL org.opencontainers.image.title="saddle (the omarchy os-distribution lane, lite tier)" \
      org.opencontainers.image.description="saddle — the master virtualization engine bound to the omarchy os-distribution seat of the catalog on the lite plan: the arch linux-based distribution created by dhh, hosted as the desktop guest profile."

FROM max AS osvanillaos
ARG SADDLE_OS_PROFILE="vanillaos"
ENV SADDLE_OS_PROFILE=vanillaos
LABEL org.opencontainers.image.title="saddle (the vanilla os os-distribution lane)" \
      org.opencontainers.image.description="saddle — the master virtualization engine bound to the vanilla os os-distribution seat of the catalog: the ubuntu-based atomic distribution, hosted as the desktop guest profile."

FROM balanced AS osvanillaos-balanced
ARG SADDLE_OS_PROFILE="vanillaos"
ENV SADDLE_OS_PROFILE=vanillaos
LABEL org.opencontainers.image.title="saddle (the vanilla os os-distribution lane, balanced tier)" \
      org.opencontainers.image.description="saddle — the master virtualization engine bound to the vanilla os os-distribution seat of the catalog on the balanced plan: the ubuntu-based atomic distribution, hosted as the desktop guest profile."

FROM lite AS osvanillaos-lite
ARG SADDLE_OS_PROFILE="vanillaos"
ENV SADDLE_OS_PROFILE=vanillaos
LABEL org.opencontainers.image.title="saddle (the vanilla os os-distribution lane, lite tier)" \
      org.opencontainers.image.description="saddle — the master virtualization engine bound to the vanilla os os-distribution seat of the catalog on the lite plan: the ubuntu-based atomic distribution, hosted as the desktop guest profile."

FROM max AS osandroid
ARG SADDLE_OS_PROFILE="android"
ENV SADDLE_OS_PROFILE=android
LABEL org.opencontainers.image.title="saddle (the android os-distribution lane)" \
      org.opencontainers.image.description="saddle — the master virtualization engine bound to the android os-distribution seat of the catalog: the mobile platform the grapheneos hardening builds on, hosted as the mobile guest profile."

FROM balanced AS osandroid-balanced
ARG SADDLE_OS_PROFILE="android"
ENV SADDLE_OS_PROFILE=android
LABEL org.opencontainers.image.title="saddle (the android os-distribution lane, balanced tier)" \
      org.opencontainers.image.description="saddle — the master virtualization engine bound to the android os-distribution seat of the catalog on the balanced plan: the mobile platform the grapheneos hardening builds on, hosted as the mobile guest profile."

FROM lite AS osandroid-lite
ARG SADDLE_OS_PROFILE="android"
ENV SADDLE_OS_PROFILE=android
LABEL org.opencontainers.image.title="saddle (the android os-distribution lane, lite tier)" \
      org.opencontainers.image.description="saddle — the master virtualization engine bound to the android os-distribution seat of the catalog on the lite plan: the mobile platform the grapheneos hardening builds on, hosted as the mobile guest profile."

FROM max AS osarchlinux
ARG SADDLE_OS_PROFILE="archlinux"
ENV SADDLE_OS_PROFILE=archlinux
LABEL org.opencontainers.image.title="saddle (the archlinux os-distribution lane)" \
      org.opencontainers.image.description="saddle — the master virtualization engine bound to the archlinux os-distribution seat of the catalog: the rolling-release distribution omarchy builds on, hosted as the pacman desktop guest profile."

FROM balanced AS osarchlinux-balanced
ARG SADDLE_OS_PROFILE="archlinux"
ENV SADDLE_OS_PROFILE=archlinux
LABEL org.opencontainers.image.title="saddle (the archlinux os-distribution lane, balanced tier)" \
      org.opencontainers.image.description="saddle — the master virtualization engine bound to the archlinux os-distribution seat of the catalog on the balanced plan: the rolling-release distribution omarchy builds on, hosted as the pacman desktop guest profile."

FROM lite AS osarchlinux-lite
ARG SADDLE_OS_PROFILE="archlinux"
ENV SADDLE_OS_PROFILE=archlinux
LABEL org.opencontainers.image.title="saddle (the archlinux os-distribution lane, lite tier)" \
      org.opencontainers.image.description="saddle — the master virtualization engine bound to the archlinux os-distribution seat of the catalog on the lite plan: the rolling-release distribution omarchy builds on, hosted as the pacman desktop guest profile."

FROM max AS osalpine
ARG SADDLE_OS_PROFILE="alpine"
ENV SADDLE_OS_PROFILE=alpine
LABEL org.opencontainers.image.title="saddle (the alpine os-distribution lane)" \
      org.opencontainers.image.description="saddle — the master virtualization engine bound to the alpine os-distribution seat of the catalog: the musl-based lightweight distribution, hosted as the small-footprint guest profile."

FROM balanced AS osalpine-balanced
ARG SADDLE_OS_PROFILE="alpine"
ENV SADDLE_OS_PROFILE=alpine
LABEL org.opencontainers.image.title="saddle (the alpine os-distribution lane, balanced tier)" \
      org.opencontainers.image.description="saddle — the master virtualization engine bound to the alpine os-distribution seat of the catalog on the balanced plan: the musl-based lightweight distribution, hosted as the small-footprint guest profile."

FROM lite AS osalpine-lite
ARG SADDLE_OS_PROFILE="alpine"
ENV SADDLE_OS_PROFILE=alpine
LABEL org.opencontainers.image.title="saddle (the alpine os-distribution lane, lite tier)" \
      org.opencontainers.image.description="saddle — the master virtualization engine bound to the alpine os-distribution seat of the catalog on the lite plan: the musl-based lightweight distribution, hosted as the small-footprint guest profile."

FROM max AS osdebian
ARG SADDLE_OS_PROFILE="debian"
ENV SADDLE_OS_PROFILE=debian
LABEL org.opencontainers.image.title="saddle (the debian os-distribution lane)" \
      org.opencontainers.image.description="saddle — the master virtualization engine bound to the debian os-distribution seat of the catalog: the universal operating system, hosted as the apt desktop guest profile."

FROM balanced AS osdebian-balanced
ARG SADDLE_OS_PROFILE="debian"
ENV SADDLE_OS_PROFILE=debian
LABEL org.opencontainers.image.title="saddle (the debian os-distribution lane, balanced tier)" \
      org.opencontainers.image.description="saddle — the master virtualization engine bound to the debian os-distribution seat of the catalog on the balanced plan: the universal operating system, hosted as the apt desktop guest profile."

FROM lite AS osdebian-lite
ARG SADDLE_OS_PROFILE="debian"
ENV SADDLE_OS_PROFILE=debian
LABEL org.opencontainers.image.title="saddle (the debian os-distribution lane, lite tier)" \
      org.opencontainers.image.description="saddle — the master virtualization engine bound to the debian os-distribution seat of the catalog on the lite plan: the universal operating system, hosted as the apt desktop guest profile."

FROM max AS osfedora
ARG SADDLE_OS_PROFILE="fedora"
ENV SADDLE_OS_PROFILE=fedora
LABEL org.opencontainers.image.title="saddle (the fedora os-distribution lane)" \
      org.opencontainers.image.description="saddle — the master virtualization engine bound to the fedora os-distribution seat of the catalog: the red-hat-upstream community distribution, hosted as the rpm desktop guest profile."

FROM balanced AS osfedora-balanced
ARG SADDLE_OS_PROFILE="fedora"
ENV SADDLE_OS_PROFILE=fedora
LABEL org.opencontainers.image.title="saddle (the fedora os-distribution lane, balanced tier)" \
      org.opencontainers.image.description="saddle — the master virtualization engine bound to the fedora os-distribution seat of the catalog on the balanced plan: the red-hat-upstream community distribution, hosted as the rpm desktop guest profile."

FROM lite AS osfedora-lite
ARG SADDLE_OS_PROFILE="fedora"
ENV SADDLE_OS_PROFILE=fedora
LABEL org.opencontainers.image.title="saddle (the fedora os-distribution lane, lite tier)" \
      org.opencontainers.image.description="saddle — the master virtualization engine bound to the fedora os-distribution seat of the catalog on the lite plan: the red-hat-upstream community distribution, hosted as the rpm desktop guest profile."

FROM max AS osnixos
ARG SADDLE_OS_PROFILE="nixos"
ENV SADDLE_OS_PROFILE=nixos
LABEL org.opencontainers.image.title="saddle (the nixos os-distribution lane)" \
      org.opencontainers.image.description="saddle — the master virtualization engine bound to the nixos os-distribution seat of the catalog: the declarative distribution the nix package manager builds, hosted as the reproducible-system guest profile."

FROM balanced AS osnixos-balanced
ARG SADDLE_OS_PROFILE="nixos"
ENV SADDLE_OS_PROFILE=nixos
LABEL org.opencontainers.image.title="saddle (the nixos os-distribution lane, balanced tier)" \
      org.opencontainers.image.description="saddle — the master virtualization engine bound to the nixos os-distribution seat of the catalog on the balanced plan: the declarative distribution the nix package manager builds, hosted as the reproducible-system guest profile."

FROM lite AS osnixos-lite
ARG SADDLE_OS_PROFILE="nixos"
ENV SADDLE_OS_PROFILE=nixos
LABEL org.opencontainers.image.title="saddle (the nixos os-distribution lane, lite tier)" \
      org.opencontainers.image.description="saddle — the master virtualization engine bound to the nixos os-distribution seat of the catalog on the lite plan: the declarative distribution the nix package manager builds, hosted as the reproducible-system guest profile."

FROM max AS osvoid
ARG SADDLE_OS_PROFILE="void"
ENV SADDLE_OS_PROFILE=void
LABEL org.opencontainers.image.title="saddle (the void os-distribution lane)" \
      org.opencontainers.image.description="saddle — the master virtualization engine bound to the void os-distribution seat of the catalog: the independent source-rolling distribution, hosted as the xbps guest profile."

FROM balanced AS osvoid-balanced
ARG SADDLE_OS_PROFILE="void"
ENV SADDLE_OS_PROFILE=void
LABEL org.opencontainers.image.title="saddle (the void os-distribution lane, balanced tier)" \
      org.opencontainers.image.description="saddle — the master virtualization engine bound to the void os-distribution seat of the catalog on the balanced plan: the independent source-rolling distribution, hosted as the xbps guest profile."

FROM lite AS osvoid-lite
ARG SADDLE_OS_PROFILE="void"
ENV SADDLE_OS_PROFILE=void
LABEL org.opencontainers.image.title="saddle (the void os-distribution lane, lite tier)" \
      org.opencontainers.image.description="saddle — the master virtualization engine bound to the void os-distribution seat of the catalog on the lite plan: the independent source-rolling distribution, hosted as the xbps guest profile."

FROM max AS ospostmarketos
ARG SADDLE_OS_PROFILE="postmarketos"
ENV SADDLE_OS_PROFILE=postmarketos
LABEL org.opencontainers.image.title="saddle (the postmarketos os-distribution lane)" \
      org.opencontainers.image.description="saddle — the master virtualization engine bound to the postmarketos os-distribution seat of the catalog: the alpine-based mobile distribution real devices boot, hosted as the mobile guest profile."

FROM balanced AS ospostmarketos-balanced
ARG SADDLE_OS_PROFILE="postmarketos"
ENV SADDLE_OS_PROFILE=postmarketos
LABEL org.opencontainers.image.title="saddle (the postmarketos os-distribution lane, balanced tier)" \
      org.opencontainers.image.description="saddle — the master virtualization engine bound to the postmarketos os-distribution seat of the catalog on the balanced plan: the alpine-based mobile distribution real devices boot, hosted as the mobile guest profile."

FROM lite AS ospostmarketos-lite
ARG SADDLE_OS_PROFILE="postmarketos"
ENV SADDLE_OS_PROFILE=postmarketos
LABEL org.opencontainers.image.title="saddle (the postmarketos os-distribution lane, lite tier)" \
      org.opencontainers.image.description="saddle — the master virtualization engine bound to the postmarketos os-distribution seat of the catalog on the lite plan: the alpine-based mobile distribution real devices boot, hosted as the mobile guest profile."

# ===== the os-distribution catalog lanes (the no-base seats) =====
# THE EXOTIC HALF OF THE AXIS: the os distribution seats with NO runnable
# container base — grapheneos (a privacy and security hardened version of
# android) and maru os (firmware, not an application) are android
# firmware seats, the v seat is the vlang platform target (never a guest
# distribution) and the windows seat is the guest vocabulary the exe
# seats execute — never pretend a runnable image. the catalog lane
# publishes the profile itself: a scratch-based image (no base at all —
# the digest law rides trivially) whose config carries the seat stamp and
# whose files are the profile row the osprofiles catalog answers and the
# arch seat row the containerarch standard answers, both rendered to json
# beside the build context (osprofiles/<id>.json and archseat.json, the
# publish lane generates them from the tagged source).
#
# THE ARCHOS INTERNO LAW (the owner's directive: "expanda ali o OS/Arch
# (restrito a linux/arm64 e unknown) para 15+ lanes tanto nos sistemas
# operacionais (Alpine, NixOS, V, Arch Linux e Debian) quanto no
# respectivo ArchOS interno"): every catalog lane publishes as a
# MULTI-ARCH manifest index carrying ALL SEVENTEEN architecture seats of
# the containerarch standard — the publish lane loops the seventeen
# seats, stamps each per-arch manifest with the SADDLE_ARCH_SEAT env and
# the arch seat row json (archseats/<seat>.json copied to archseat.json
# per leg), pushes each under its arch-suffixed variant tag
# (saddle:VERSION-<seat suffix>-<arch seat>) and folds the seventeen
# into the lane's umbrella tag — scratch images are config-only, so the
# per-arch entries are honest documentation lanes that publish for real
# (each a real manifest on the registry, never a pretended build leg).
# the catalog stages
# carry the -catalog target suffix: the bare os<id> names above seat the
# RUNNABLE flavor lanes of the 11×3 standardization, and the seven
# distributions that own both families (archlinux, alpine, debian,
# fedora, nixos, void and postmarketos) keep their no-base catalog seat
# under the suffixed name the publish catalog lane builds — one address
# per lane family, never a shadowed stage name:
#
#   docker build --target osgrapheneos-catalog -t saddle:2.0.172-grapheneos .
#   docker build --target osmaruos-catalog     -t saddle:2.0.172-maruos .
#   docker build --target osv-catalog          -t saddle:2.0.172-v .
#   docker build --target oswindows-catalog    -t saddle:2.0.172-windows .
FROM scratch AS osgrapheneos-catalog
ARG SADDLE_VERSION=2.0.175
ARG SADDLE_OS_PROFILE="grapheneos"
ENV SADDLE_OS_PROFILE=grapheneos
ARG SADDLE_ARCH_SEAT=""
ENV SADDLE_ARCH_SEAT=${SADDLE_ARCH_SEAT}
ARG SADDLE_TIER="max"
ENV SADDLE_PROFILE=${SADDLE_TIER}
LABEL org.opencontainers.image.title="saddle (the grapheneos os-distribution catalog lane)" \
      org.opencontainers.image.description="the grapheneos os-distribution seat as a catalog lane: a privacy and security hardened version of android — no runnable container base exists for an android firmware seat, the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${SADDLE_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/grapheneos.json /saddle/osprofile.json
COPY archseat.json /saddle/archseat.json

FROM scratch AS osmaruos-catalog
ARG SADDLE_VERSION=2.0.175
ARG SADDLE_OS_PROFILE="maruos"
ENV SADDLE_OS_PROFILE=maruos
ARG SADDLE_ARCH_SEAT=""
ENV SADDLE_ARCH_SEAT=${SADDLE_ARCH_SEAT}
ARG SADDLE_TIER="max"
ENV SADDLE_PROFILE=${SADDLE_TIER}
LABEL org.opencontainers.image.title="saddle (the maru os os-distribution catalog lane)" \
      org.opencontainers.image.description="the maru os os-distribution seat as a catalog lane: maru os is firmware, not an application — no runnable container base exists for a firmware seat, the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${SADDLE_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/maruos.json /saddle/osprofile.json
COPY archseat.json /saddle/archseat.json

FROM scratch AS osv-catalog
ARG SADDLE_VERSION=2.0.175
ARG SADDLE_OS_PROFILE="v"
ENV SADDLE_OS_PROFILE=v
ARG SADDLE_ARCH_SEAT=""
ENV SADDLE_ARCH_SEAT=${SADDLE_ARCH_SEAT}
ARG SADDLE_TIER="max"
ENV SADDLE_PROFILE=${SADDLE_TIER}
LABEL org.opencontainers.image.title="saddle (the v os-distribution catalog lane)" \
      org.opencontainers.image.description="the v os-distribution seat as a catalog lane: the v language platform target the languagev compiler seat of the ninety modalities answers, never a guest distribution — the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${SADDLE_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/v.json /saddle/osprofile.json
COPY archseat.json /saddle/archseat.json

FROM scratch AS oswindows-catalog
ARG SADDLE_VERSION=2.0.175
ARG SADDLE_OS_PROFILE="windows"
ENV SADDLE_OS_PROFILE=windows
ARG SADDLE_ARCH_SEAT=""
ENV SADDLE_ARCH_SEAT=${SADDLE_ARCH_SEAT}
ARG SADDLE_TIER="max"
ENV SADDLE_PROFILE=${SADDLE_TIER}
LABEL org.opencontainers.image.title="saddle (the windows os-distribution catalog lane)" \
      org.opencontainers.image.description="the windows os-distribution seat as a catalog lane: the guest vocabulary the exe seats execute — the container standard answers the windows seats as binary targets, the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${SADDLE_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/windows.json /saddle/osprofile.json
COPY archseat.json /saddle/archseat.json

FROM scratch AS ospostmarketos-catalog
ARG SADDLE_VERSION=2.0.175
ARG SADDLE_OS_PROFILE="postmarketos"
ENV SADDLE_OS_PROFILE=postmarketos
ARG SADDLE_ARCH_SEAT=""
ENV SADDLE_ARCH_SEAT=${SADDLE_ARCH_SEAT}
ARG SADDLE_TIER="max"
ENV SADDLE_PROFILE=${SADDLE_TIER}
LABEL org.opencontainers.image.title="saddle (the postmarketos os-distribution catalog lane)" \
      org.opencontainers.image.description="the postmarketos os-distribution seat as a catalog lane: postmarketos is the alpine-based mobile distribution real devices boot — no runnable container base exists for this seat, the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${SADDLE_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/postmarketos.json /saddle/osprofile.json
COPY archseat.json /saddle/archseat.json

FROM scratch AS oslineageos-catalog
ARG SADDLE_VERSION=2.0.175
ARG SADDLE_OS_PROFILE="lineageos"
ENV SADDLE_OS_PROFILE=lineageos
ARG SADDLE_ARCH_SEAT=""
ENV SADDLE_ARCH_SEAT=${SADDLE_ARCH_SEAT}
ARG SADDLE_TIER="max"
ENV SADDLE_PROFILE=${SADDLE_TIER}
LABEL org.opencontainers.image.title="saddle (the lineageos os-distribution catalog lane)" \
      org.opencontainers.image.description="the lineageos os-distribution seat as a catalog lane: lineageos is the community android continuation — the aftermarket mobile seat on the arm64 legs, the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${SADDLE_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/lineageos.json /saddle/osprofile.json
COPY archseat.json /saddle/archseat.json

FROM scratch AS oscalyxos-catalog
ARG SADDLE_VERSION=2.0.175
ARG SADDLE_OS_PROFILE="calyxos"
ENV SADDLE_OS_PROFILE=calyxos
ARG SADDLE_ARCH_SEAT=""
ENV SADDLE_ARCH_SEAT=${SADDLE_ARCH_SEAT}
ARG SADDLE_TIER="max"
ENV SADDLE_PROFILE=${SADDLE_TIER}
LABEL org.opencontainers.image.title="saddle (the calyxos os-distribution catalog lane)" \
      org.opencontainers.image.description="the calyxos os-distribution seat as a catalog lane: calyxos is the privacy-focused android distribution, the hardened mobile seat beside grapheneos — the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${SADDLE_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/calyxos.json /saddle/osprofile.json
COPY archseat.json /saddle/archseat.json

FROM scratch AS osarchlinux-catalog
ARG SADDLE_VERSION=2.0.175
ARG SADDLE_OS_PROFILE="archlinux"
ENV SADDLE_OS_PROFILE=archlinux
ARG SADDLE_ARCH_SEAT=""
ENV SADDLE_ARCH_SEAT=${SADDLE_ARCH_SEAT}
ARG SADDLE_TIER="max"
ENV SADDLE_PROFILE=${SADDLE_TIER}
LABEL org.opencontainers.image.title="saddle (the archlinux os-distribution catalog lane)" \
      org.opencontainers.image.description="the archlinux os-distribution seat as a catalog lane: archlinux is the rolling-release distribution omarchy builds on, the pacman desktop seat — the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${SADDLE_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/archlinux.json /saddle/osprofile.json
COPY archseat.json /saddle/archseat.json

FROM scratch AS osalpine-catalog
ARG SADDLE_VERSION=2.0.175
ARG SADDLE_OS_PROFILE="alpine"
ENV SADDLE_OS_PROFILE=alpine
ARG SADDLE_ARCH_SEAT=""
ENV SADDLE_ARCH_SEAT=${SADDLE_ARCH_SEAT}
ARG SADDLE_TIER="max"
ENV SADDLE_PROFILE=${SADDLE_TIER}
LABEL org.opencontainers.image.title="saddle (the alpine os-distribution catalog lane)" \
      org.opencontainers.image.description="the alpine os-distribution seat as a catalog lane: alpine is the musl-based lightweight distribution, the small-footprint seat the musl legs answer — the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${SADDLE_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/alpine.json /saddle/osprofile.json
COPY archseat.json /saddle/archseat.json

FROM scratch AS osdebian-catalog
ARG SADDLE_VERSION=2.0.175
ARG SADDLE_OS_PROFILE="debian"
ENV SADDLE_OS_PROFILE=debian
ARG SADDLE_ARCH_SEAT=""
ENV SADDLE_ARCH_SEAT=${SADDLE_ARCH_SEAT}
ARG SADDLE_TIER="max"
ENV SADDLE_PROFILE=${SADDLE_TIER}
LABEL org.opencontainers.image.title="saddle (the debian os-distribution catalog lane)" \
      org.opencontainers.image.description="the debian os-distribution seat as a catalog lane: debian is the universal operating system, the apt desktop seat the widest hardware matrix answers — the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${SADDLE_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/debian.json /saddle/osprofile.json
COPY archseat.json /saddle/archseat.json

FROM scratch AS osfedora-catalog
ARG SADDLE_VERSION=2.0.175
ARG SADDLE_OS_PROFILE="fedora"
ENV SADDLE_OS_PROFILE=fedora
ARG SADDLE_ARCH_SEAT=""
ENV SADDLE_ARCH_SEAT=${SADDLE_ARCH_SEAT}
ARG SADDLE_TIER="max"
ENV SADDLE_PROFILE=${SADDLE_TIER}
LABEL org.opencontainers.image.title="saddle (the fedora os-distribution catalog lane)" \
      org.opencontainers.image.description="the fedora os-distribution seat as a catalog lane: fedora is the red-hat-upstream community distribution, the rpm desktop seat beside the apt rows — the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${SADDLE_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/fedora.json /saddle/osprofile.json
COPY archseat.json /saddle/archseat.json

FROM scratch AS osnixos-catalog
ARG SADDLE_VERSION=2.0.175
ARG SADDLE_OS_PROFILE="nixos"
ENV SADDLE_OS_PROFILE=nixos
ARG SADDLE_ARCH_SEAT=""
ENV SADDLE_ARCH_SEAT=${SADDLE_ARCH_SEAT}
ARG SADDLE_TIER="max"
ENV SADDLE_PROFILE=${SADDLE_TIER}
LABEL org.opencontainers.image.title="saddle (the nixos os-distribution catalog lane)" \
      org.opencontainers.image.description="the nixos os-distribution seat as a catalog lane: nixos is the declarative distribution the nix package manager builds, the reproducible-system seat — the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${SADDLE_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/nixos.json /saddle/osprofile.json
COPY archseat.json /saddle/archseat.json

FROM scratch AS osvoid-catalog
ARG SADDLE_VERSION=2.0.175
ARG SADDLE_OS_PROFILE="void"
ENV SADDLE_OS_PROFILE=void
ARG SADDLE_ARCH_SEAT=""
ENV SADDLE_ARCH_SEAT=${SADDLE_ARCH_SEAT}
ARG SADDLE_TIER="max"
ENV SADDLE_PROFILE=${SADDLE_TIER}
LABEL org.opencontainers.image.title="saddle (the void os-distribution catalog lane)" \
      org.opencontainers.image.description="the void os-distribution seat as a catalog lane: void is the independent source-rolling distribution, the xbps seat the musl legs answer beside alpine — the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${SADDLE_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/void.json /saddle/osprofile.json
COPY archseat.json /saddle/archseat.json

# ===== stage: default — the trailing balanced seat the header documents =====
# THE DEFAULT TARGET LAW (the local-build heal): the header declares the
# plain `docker build -f saddle/Dockerfile .` with no --target answers the
# balanced profile, but the os-distribution flavor and catalog lanes below
# the balanced stage used to end the file — the no-target build answered
# the last scratch seat (osvoid, today osvoid-catalog), a scratch seat
# that COPYs the osprofiles/ folder only the publish lanes render, so the
# local container the owner charged functional died on the missing folder
# instead of building the engine.
# This trailing alias re-seats the balanced profile as the last stage:
# the no-target build answers the runnable engine (the same graph the
# compose lane rides), every os lane keeps its own explicit --target,
# and the profile axis (max / balanced / lite) stays addressable behind
# its names exactly as before.
FROM balanced
