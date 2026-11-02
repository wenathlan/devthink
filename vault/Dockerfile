# vault 2.0.154 — THE STORAGE CONTAINER FILE.
#
# the engine never rode production until this file: the former container
# was the static face only (one nginx stage serving the vite build), so
# createVaultServer/listenVault — the real http surface the battery boots
# on every run — answered nothing in any deploy, and every storage call
# of the face fell to the away lane. this file carries BOTH container
# surfaces of the vault, one build, two targets, orchestrated by the
# docker-compose.yml that rides beside it:
#
#   face-build  the spa build stage (node 26 alpine, the former solbuild
#               discipline verbatim): installs the locked pnpm tree and
#               runs the vite build, then stages the built face surface
#               (the shell, the hashed js/css bundles and the fonts) into
#               /out/face so the runtime stage never ships the sources,
#               the lockfile or the node_modules tree the old whole-tree
#               COPY dragged into the html root.
#   engine-deps the native dependency stage (node 26.13.0-slim, the
#               .nvmrc/engines pin): installs the frozen production tree
#               — better-sqlite3 (the native addon the whole engine
#               rides), drizzle-orm and react (the uistore module head
#               imports the hooks) — with the build toolchain beside it,
#               so the engine stage inherits a ready node_modules and
#               never carries the compiler.
#   engine      THE STORAGE ENGINE (the target the compose service
#               `engine` builds): node 26.13.0-slim running the
#               erasable-typescript sources natively
#               (`node --experimental-strip-types api.ts` — the same
#               direct boot the file tail declares), the vault root
#               sources riding whole (the api.ts import closure resolves
#               inside them), the storage truth on
#               the /data volume (the faun lesson: vault-storage.db and
#               uistore.db live on the named volume, NEVER inside the
#               image — the .dockerignore refuses *.db from the context
#               and this stage points every db env at /data), the token
#               gate of the faun lesson armed by VAULT_TOKEN at runtime,
#               and the health lane (curl /api/health) the compose face
#               gates on.
#   face        the site container (the default target, the former
#               second stage evolved): nginx-unprivileged serving the
#               staged SPA beside the /api/* proxy lane to the engine
#               upstream (nginx-face.conf rides beside this file) — the
#               face and the engine answer one origin, the spa rewrite
#               the vercel/netlify configs declare lands as try_files,
#               and the whole product answers one docker compose up.
#
# the version rides the ARG the metadata lockstep stamps (VAULT_VERSION,
# the package.json envelope version) and the OCI labels declare; the
# registry lanes pass it at build time, nothing is hardcoded beside the
# stamp. the face build bakes the engine door through the VITE_VAULT_URL
# build-arg (the origin vaultclient.ts reads at boot): the house https
# law refuses http, localhost and private hosts, so the value must be the
# public https origin of the engine (or of the face itself, when the
# proxy lane carries the calls same-origin) — empty keeps the honest
# away lane, never an invented number.
#
# build and run (from this directory — the build context is the vault
# tree alone, no sibling staging):
#
#   docker compose up -d --build            # the whole product (the
#                                           # compose file wires both
#                                           # targets, the volume and
#                                           # the dependency order)
#
#   docker build --target engine -t vault-engine .    # the engine alone
#   docker build --target face -t vault-face .        # the face alone
#   docker build -t vault-face .                      # face is the default
#
#   docker run -d --name vault-engine --init \
#     --restart unless-stopped \
#     -v vaultdata:/data \
#     -e VAULT_TOKEN=<the operator bearer> \
#     -e VAULT_PORT=8080 -p 8080:8080 \
#     vault-engine

# ── stage 1: the spa build (the former solbuild discipline) ──────────

FROM node:26-alpine@sha256:40cd011b55415bc894e45b02fdd5a5dfde056921b7d23a64c74f80497af48797 AS face-build

ARG VAULT_VERSION=2.0.154
# the engine door the face bakes at build time: vaultclient.ts reads
# VITE_VAULT_URL (the public https origin of the engine), the token
# header the browser lanes present (VITE_VAULT_TOKEN) and the project
# the console lane queries (VITE_VAULT_PROJECT). all three may stay
# empty — the away lane keeps the declared rehearsal, never a blank and
# never an invented figure.
ARG VITE_VAULT_URL=""
ARG VITE_VAULT_TOKEN=""
ARG VITE_VAULT_PROJECT=""
ENV VITE_VAULT_URL=$VITE_VAULT_URL \
    VITE_VAULT_TOKEN=$VITE_VAULT_TOKEN \
    VITE_VAULT_PROJECT=$VITE_VAULT_PROJECT

WORKDIR /src
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN apk add --no-cache python3 make g++ \
 && npm install -g --no-fund --no-audit pnpm@12.3.4 \
 # the pnpm 12 supply-chain release-age window (one day by default)
 # refuses every lockfile entry younger than twenty-four hours — the
 # same lesson the registry lanes carry: the window pins to zero for the
 # container install, the frozen lockfile keeps answering the same
 # integrity-checked versions.
 && printf '\nminimumReleaseAge: 0\n' >> pnpm-workspace.yaml \
 && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build \
 # stage the built face surface (the family context staging the saddle
 # Dockerfile rides): the hashed bundles land at the app root beside the
 # sources, so the shell, the hashed js/css, the variable fonts, the
 # icons, the manifest and the crawler files move into a clean folder —
 # the runtime stage copies exactly the served surface and never the
 # sources, the tests or the node_modules tree.
 && mkdir -p /out/face \
 && cp index.html manifest.webmanifest favicon.svg icon.svg robots.txt sitemap.xml /out/face/ \
 && find . -maxdepth 1 -type f \( -name '*.js' -o -name '*.css' -o -name '*.woff2' -o -name '*.woff' -o -name '*.png' -o -name '*.ico' \) -exec cp {} /out/face/ \;

# ── stage 2: the native dependency install of the engine ─────────────

FROM node:26.13.0-slim AS engine-deps

WORKDIR /src
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 make g++ \
 && rm -rf /var/lib/apt/lists/* \
 && npm install -g --no-fund --no-audit pnpm@12.3.4 \
 # the release-age window pins to zero for the container install (the
 # registry lane lesson, mirrored from the face stage above).
 && printf '\nminimumReleaseAge: 0\n' >> pnpm-workspace.yaml \
 # the production tree only: better-sqlite3 (the native addon — its
 # build script rides the onlyBuiltDependencies allow list of
 # pnpm-workspace.yaml, and the toolchain above answers the source-build
 # fallback when no prebuild matches), drizzle-orm and react (the
 # uistore module head imports the hooks the copy lane never calls on
 # the server, but node resolves the import all the same).
 && pnpm install --frozen-lockfile --prod \
 # the vendored build corpora the trivy misconfig scanner flags (the
 # saddle runtime prune): nested Dockerfiles of dependency build trees
 # never ride a shipped image.
 && find node_modules -type f -name Dockerfile -delete

# ── stage 3: the storage engine (the compose `engine` service) ───────

FROM node:26.13.0-slim AS engine

ARG VAULT_VERSION=2.0.154

LABEL org.opencontainers.image.title="vault-engine" \
      org.opencontainers.image.description="vault engine — the storage truth of the platform over pure node:http: the sealed ledger, the sha-256 digests and the quota verdicts behind the faun-lesson token gate." \
      org.opencontainers.image.version="${VAULT_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink" \
      org.opencontainers.image.documentation="https://github.com/wenathlan/devthink/tree/main/vault"

WORKDIR /app

# curl for the health probe (slim ships no curl — without this layer the
# /api/health healthcheck answers 127 forever and the compose face never
# leaves the gating wait).
RUN apt-get update \
 && apt-get install -y --no-install-recommends curl \
 && rm -rf /var/lib/apt/lists/*

# the runtime env of the storage truth: VAULT_PORT (the compose service
# and the nginx upstream both answer 8080), the bind host, and the two
# database files pinned to the /data volume — the faun lesson as env:
# the storage truth never rides the image layers, a named volume owns
# it, so a redeploy never orphans the ledger. VAULT_TOKEN never lands
# here: the operator injects it at runtime (compose reads it from the
# environment), and without it the engine boots SEALED — the health lane
# answers, every storage route refuses 503 (fail closed, never open).
# DATABASE_URL is the same insurance for the site-store lane (db.ts
# boots it at import when a lane ever pulls it inside the engine): the
# file answers on the volume too, never in the layer.
ENV NODE_ENV=production \
    VAULT_PORT=8080 \
    VAULT_HOST=0.0.0.0 \
    VAULT_STORAGE_URL=file:/data/vault-storage.db \
    VAULT_UISTORE_DB=/data/uistore.db \
    DATABASE_URL=file:/data/vault.db

# the ready production tree from the deps stage (the pnpm symlink layout
# moves whole — every relative link resolves inside the tree).
COPY --from=engine-deps /src/node_modules ./node_modules
COPY package.json ./
# the vault root sources ride whole (the published library set — the
# same .ts surface the package.json files array packs). the api.ts
# import closure today reads: api.ts pulls accounts.ts, drizzle.ts,
# objectsledger.ts, quota.ts and uistore.ts; accounts.ts pulls quota.ts
# and sha.ts beside the drizzle ledger; objectsledger.ts pulls chunks.ts,
# sha.ts and storage.ts; uistore.ts pulls labels.ts, onboardingstate.ts
# and labelstore.ts — every file erasable typescript, no enums, no
# namespaces, so node --experimental-strip-types runs them natively.
# the closure is NOT spelled as a COPY list on purpose: the accounts
# lane landed mid-wave and the explicit list went stale within the hour
# (the saddle lesson — a missing module crashes the container at boot
# with module-not-found), so the whole root source set rides and node
# resolves exactly the graph api.ts pulls. the site-store lane (db.ts,
# storagelane.ts) and the tool configs (drizzle/vite/vitest/capacitor)
# ride along as dead sources: nothing imports them, nothing runs them,
# and the DATABASE_URL insurance above owns the day a lane ever does.
COPY *.ts ./

# the state home of the engine (the named volume mounts here): owned by
# the unprivileged node user so the fresh volume inherits the ownership
# on first mount and sqlite may create its WAL files beside the base.
RUN mkdir -p /data && chown node:node /data

# the explicit non-root runtime user (the family scan gate refuses an
# image without a pinned unprivileged user).
USER node

# /data is a volume declaration: every deploy mounts a named volume (the
# compose vaultdata) — the databases, the WAL and the shm files live
# there, never in the image.
VOLUME /data

# the port VAULT_PORT answers (8080 by the env above; the compose face
# proxies and the public engine lane both bind it).
EXPOSE 8080

# the health lane the engine serves open (no token — the platform watch
# reads the driver and the gate state from it). curl rides the slim
# image (the task's probe); the shell form expands VAULT_PORT so an
# operator override never blinds the probe.
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -fsS "http://127.0.0.1:${VAULT_PORT:-8080}/api/health" || exit 1

# the direct boot the api.ts tail declares: `node api.ts` serves the
# storage truth on the resolved port — the same entry the package.json
# `engine` script mirrors for bare-metal runs.
CMD ["node", "--experimental-strip-types", "api.ts"]

# ── stage 4: the site container (the compose `face` service) ─────────

FROM nginxinc/nginx-unprivileged:1.29-alpine@sha256:0c79d56aee561a1d81c63f00eee5fb5fe29279560cdc55e91425133104c7fbe6 AS face

ARG VAULT_VERSION=2.0.154

LABEL org.opencontainers.image.title="vault-face" \
      org.opencontainers.image.description="vault face — the static SPA of the vault served by nginx-unprivileged beside the /api/* proxy lane to the engine service." \
      org.opencontainers.image.version="${VAULT_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink" \
      org.opencontainers.image.documentation="https://github.com/wenathlan/devthink/tree/main/vault"

# the face surface: the nginx conf (the spa rewrite as try_files, the
# security headers the _headers file declares, and the /api/* proxy lane
# to the engine upstream) beside the staged build.
COPY nginx-face.conf /etc/nginx/conf.d/default.conf
COPY --from=face-build /out/face/ /usr/share/nginx/html/

# the explicit non-root runtime user (uid 101 is the nginx-unprivileged
# default): the scan gate refuses an image without a pinned unprivileged
# user, so the declaration is spelled out instead of inherited.
USER 101

# the unprivileged image answers 8080; the healthcheck probes the served
# root the same way the pages lane does (the engine lane answers its own
# /api/health probe, and the compose file gates this service on it).
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD ["wget", "-qO-", "http://127.0.0.1:8080/"]
