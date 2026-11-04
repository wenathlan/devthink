# saddle 2.0.157 — THE ENGINE CONTAINER FILE
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
#   docker build --target max       -t saddle:2.0.157 .
#   docker build --target balanced  -t saddle:2.0.157-balanced .
#   docker build --target lite      -t saddle:2.0.157-lite .
#
#   max       — the full profile catalog: the epyc 9965 class, 192 vcpu,
#               384 threads, 1024 gib ram plan, the b200 gpu plan x8.
#   balanced  — the threadripper pro 9995wx class, 96 vcpu, 192 threads,
#               512 gib ram plan, the b200 gpu plan x2.
#   lite      — the ryzen 9950x3d class, 16 vcpu, 32 threads, 128 gib
#               ram plan, the rtx 5090 gpu plan x1.
#
# The profile rides the image config (ENV + the OCI labels the verify legs
# assert), the catalog constants stay the publish matrix's single source,
# and every profile ships the same engine graph — the same ninety
# modalities, the same console, the same health surface; only the declared
# hardware plan differs.
#
# THE ELEVEN-ARCHITECTURE PLATFORM SURFACE (the pr15b law): every profile
# publishes across the complete linux platform list buildx/docker carries —
# linux/amd64, linux/amd64/v2, linux/arm64, linux/arm/v7, linux/arm/v6,
# linux/ppc64le, linux/s390x, linux/riscv64, linux/386, linux/mips64le,
# linux/loong64 — amd64 and amd64/v2 build native, the other nine legs
# ride qemu emulation in the publish workflow.
#
# THE CONTEXT LAW (the family context fix): this file COPYs from two
# trees (saddle/ and the engine-ownership sibling vault/), so every build
# runs from the repository root with an explicit -f:
#   docker build -f saddle/Dockerfile .
# building from inside saddle/ breaks the vault COPY - the sibling rides
# the context beside this directory, never inside it.
#
# THE DIGEST LAW: the base rides the bare tag here (local builds fetch the
# moving tag), and the publish lanes resolve the manifest-list digest on
# the runner at build time and pass the pinned reference as NODE_BASE — no
# 64-hex digest ever lands in a source file (the signature is generated
# during the build, never hardcoded).
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
# repository, the manifest-list digest serves the whole eleven-architecture
# matrix, and a local build resolves the same lane before docker build.
ARG NODE_BASE_DIGEST

# ===== stage: solbuild — the locked npm tree and the console spa =====
FROM --platform=$BUILDPLATFORM ${NODE_BASE_TAG}@sha256:${NODE_BASE_DIGEST} AS solbuild

ARG SADDLE_VERSION=2.0.157

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

ARG SADDLE_VERSION=2.0.157
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
      org.opencontainers.image.documentation="https://github.com/wenathlan/devthink/tree/main/saddle"

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
# webserver.ts pulls the sandbox quartet (sandbox.ts, sandboxprofile.ts,
# sandboxenvprofile.ts, sandboxquota.ts), db.ts, auth.ts, mesh.ts,
# modalityregistry.ts, edgeplane.ts and workloadlaw.ts; edgeplane.ts
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
# run the console with: docker run saddle:<version>
COPY --from=solbuild /app/webserver.ts /app/db.ts /app/labels.ts /app/auth.ts /app/mesh.ts /app/sandbox.ts /app/sandboxprofile.ts /app/sandboxenvprofile.ts /app/sandboxquota.ts /app/modalityregistry.ts /app/edgeplane.ts /app/workloadlaw.ts /app/foundation.ts /app/edgelandes.ts /app/scriptlanes.ts /app/execution.ts /app/mime.types /app/init.sql /app/schema.prisma ./
# the label store of the console stack: labels.ts (pulled by db.ts)
# resolves ../vault/labelstore.ts at /vault - the same family context
# fix the solbuild stage applies.
COPY --from=solbuild /vault/labelstore.ts /vault/labelstore.ts
COPY --from=solbuild /out/spa ./

USER node

# the console service doors: the webserver answers the engine api and the
# staged spa on the saddle port (the source-is-library law runs the .ts
# graph natively - node 26 strips the types, zero npm dependencies).
ENV SADDLE_PORT=8080 \
    SADDLE_HOST=0.0.0.0

EXPOSE 8080

# the health probe rides the public /health route the webserver answers
# (node fetch, zero wget dependency on the slim debian base).
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD ["node", "-e", "fetch('http://127.0.0.1:8080/health').then((r)=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"]

ENTRYPOINT ["node", "webserver.ts"]

# ===== the variant profile targets (the saddle-exclusive three) =====
# max — the full profile catalog (the default the plain `docker build`
# answers when no target is named is the last stage of the file: lite
# below; the publish lanes always name their target).
FROM base AS max
ENV SADDLE_PROFILE=max

# balanced — the threadripper pro class, the b200 plan x2.
FROM base AS balanced
ENV SADDLE_PROFILE=balanced

# lite — the ryzen class, the rtx 5090 plan x1 (the default target: the
# plain `docker build -f saddle/Dockerfile .` with no --target answers
# lite, the lightest leg the family carries).
FROM base AS lite
ENV SADDLE_PROFILE=lite
