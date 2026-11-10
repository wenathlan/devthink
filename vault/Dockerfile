# vault 2.0.175 — THE ENGINE CONTAINER FILE
#
# The family container doctrine in the engine shape: the container IS the
# vault engine, not a static mirror of the source tree. Stage one (solbuild)
# installs the locked pnpm tree, runs the vite build at the application root
# (the family law — the hashed bundles land flat beside the entry) and
# assembles the served faces into /site; stage two (enginedeps) installs the
# production-only dependency tree (the compiled better-sqlite3 seat the
# engine rides); stage three runs the engine itself — `node api.ts` serves
# the token-gated storage truth AND the assembled site face from /app/site
# (one process, one port, zero proxies: the api.ts static lane owns the
# content types, the spa fallback and the face allowlist). The version rides
# the ARG the metadata lockstep stamps and the OCI labels declare — the
# registry lanes pass it at build time, nothing is hardcoded beside the
# stamp.
#
# THE FAUN SEAL (the root-emit wave): the http surface only ever serves the
# assembled /site tree — the source root, the node_modules and the runtime
# sqlite stores (VAULT_STORAGE_URL and VAULT_UISTORE_DB, pinned under
# /app/data) never answer over http, and the api.ts static lane refuses a
# database file and every non-face extension outright. The container refuses
# to boot without VAULT_TOKEN (fail closed, the same law the engine rides:
# no token, no storage truth).

FROM node:26-alpine@sha256:8996bb5821d62a8fd9bb27c1cb07462f3fdce6e47d640c6a881ead0b064ce216 AS solbuild

ARG VAULT_VERSION=2.0.175

WORKDIR /src
COPY package.json pnpm-workspace.yaml ./
COPY pnpmboot.package.json /tmp/pnpmboot/package.json
COPY pnpmboot.package-lock.json /tmp/pnpmboot/package-lock.json
RUN apk add --no-cache python3 make g++ \
 && npm ci --prefix /tmp/pnpmboot --no-fund --no-audit \
 && ln -sf /tmp/pnpmboot/node_modules/.bin/pnpm /usr/local/bin/pnpm \
 && pnpm install --no-frozen-lockfile --ignore-scripts
COPY . .
# The devthink sibling of the family law: vault/routerbase.ts re-exports
# the family routerBase from ../devthink/routerbase.ts, so the devthink
# sources land at /devthink where that re-export answers (the staged
# vaultbuildctx closure the container lane resolves carries them).
COPY devthink/ /devthink
# the foundry sibling the vault pipeline imports resolve (the ../foundry lanes)
COPY foundry/ /foundry
# the saddle sibling the vault sandbox modality imports resolve (the ../saddle lanes)
COPY saddle/ /saddle
RUN pnpm build \
 && sh -c 'mkdir /site && for f in index.html *.js *.css *.webmanifest *.svg *.ico *.png *.woff2 _headers _redirects robots.txt sitemap.xml; do cp "$f" /site/ 2>/dev/null || true; done' 

FROM node:26-alpine@sha256:8996bb5821d62a8fd9bb27c1cb07462f3fdce6e47d640c6a881ead0b064ce216 AS enginedeps

ARG VAULT_VERSION=2.0.175

# the production-only dependency tree of the engine: better-sqlite3
# compiles against the same alpine toolchain the solbuild leg installs, so
# the binary the runtime copies answers the exact platform it rides.
WORKDIR /deps
COPY package.json pnpm-workspace.yaml ./
COPY pnpmboot.package.json /tmp/pnpmboot/package.json
COPY pnpmboot.package-lock.json /tmp/pnpmboot/package-lock.json
RUN apk add --no-cache python3 make g++ \
 && npm ci --prefix /tmp/pnpmboot --no-fund --no-audit \
 && ln -sf /tmp/pnpmboot/node_modules/.bin/pnpm /usr/local/bin/pnpm \
 && pnpm install --prod --no-frozen-lockfile

# ════════════════════════════════════════════════════════════════════
# THE OS-DISTRIBUTION CATALOG LANES (the container-lane law, the family
# half): the thirteen os-distribution seats the saddle osprofiles catalog
# answers ride the vault container the same law the saddle engine answers
# — every profile with no runnable container base ships as an honest
# catalog lane, a scratch-based image whose config carries the profile
# row the saddle catalog renders at build time (the import law: the json
# the stages COPY renders from saddle/osprofiles.ts, the catalog never
# duplicates here — vault imports the engine catalog the saddle owns).
# the catalog lanes ride before the runtime stage so the default build keeps answering the runtime target (the family builds never pass --target — the saddle lanes always do, the os seats close the saddle file the same law).
# ════════════════════════════════════════════════════════════════════

FROM scratch AS osgrapheneos
ARG VAULT_VERSION=2.0.175
ARG VAULT_OS_PROFILE="grapheneos"
ENV VAULT_OS_PROFILE=grapheneos
LABEL org.opencontainers.image.title="vault (the grapheneos os-distribution catalog lane)" \
      org.opencontainers.image.description="the grapheneos os-distribution seat as a catalog lane of the vault container: a privacy and security hardened version of android — no runnable container base exists for an android firmware seat, the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${VAULT_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/grapheneos.json /vault/osprofile.json

FROM scratch AS osmaruos
ARG VAULT_VERSION=2.0.175
ARG VAULT_OS_PROFILE="maruos"
ENV VAULT_OS_PROFILE=maruos
LABEL org.opencontainers.image.title="vault (the maru os os-distribution catalog lane)" \
      org.opencontainers.image.description="the maru os os-distribution seat as a catalog lane of the vault container: maru os is firmware, not an application: the android firmware seat with the debian desktop — no runnable container base exists for a firmware seat, the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${VAULT_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/maruos.json /vault/osprofile.json

FROM scratch AS osv
ARG VAULT_VERSION=2.0.175
ARG VAULT_OS_PROFILE="v"
ENV VAULT_OS_PROFILE=v
LABEL org.opencontainers.image.title="vault (the v os-distribution catalog lane)" \
      org.opencontainers.image.description="the v os-distribution seat as a catalog lane of the vault container: the v language platform target (vlang): the language engine seat, never a guest distribution — no runnable container base exists for the languageos seat, the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${VAULT_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/v.json /vault/osprofile.json

FROM scratch AS oswindows
ARG VAULT_VERSION=2.0.175
ARG VAULT_OS_PROFILE="windows"
ENV VAULT_OS_PROFILE=windows
LABEL org.opencontainers.image.title="vault (the windows os-distribution catalog lane)" \
      org.opencontainers.image.description="the windows os-distribution seat as a catalog lane of the vault container: the windows guest vocabulary the exe seats execute — no runnable container base exists for the windows seat the engine hosts as a guest, the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${VAULT_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/windows.json /vault/osprofile.json

FROM scratch AS ospostmarketos
ARG VAULT_VERSION=2.0.175
ARG VAULT_OS_PROFILE="postmarketos"
ENV VAULT_OS_PROFILE=postmarketos
LABEL org.opencontainers.image.title="vault (the postmarketos os-distribution catalog lane)" \
      org.opencontainers.image.description="the postmarketos os-distribution seat as a catalog lane of the vault container: the alpine-based mobile distribution — no runnable container base exists for the mobile seat, the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${VAULT_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/postmarketos.json /vault/osprofile.json

FROM scratch AS oslineageos
ARG VAULT_VERSION=2.0.175
ARG VAULT_OS_PROFILE="lineageos"
ENV VAULT_OS_PROFILE=lineageos
LABEL org.opencontainers.image.title="vault (the lineageos os-distribution catalog lane)" \
      org.opencontainers.image.description="the lineageos os-distribution seat as a catalog lane of the vault container: the android community distribution — no runnable container base exists for the mobile seat, the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${VAULT_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/lineageos.json /vault/osprofile.json

FROM scratch AS oscalyxos
ARG VAULT_VERSION=2.0.175
ARG VAULT_OS_PROFILE="calyxos"
ENV VAULT_OS_PROFILE=calyxos
LABEL org.opencontainers.image.title="vault (the calyxos os-distribution catalog lane)" \
      org.opencontainers.image.description="the calyxos os-distribution seat as a catalog lane of the vault container: the privacy-focused android distribution, the hardened mobile seat beside grapheneos — no runnable container base exists for the mobile seat, the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${VAULT_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/calyxos.json /vault/osprofile.json

FROM scratch AS osarchlinux
ARG VAULT_VERSION=2.0.175
ARG VAULT_OS_PROFILE="archlinux"
ENV VAULT_OS_PROFILE=archlinux
LABEL org.opencontainers.image.title="vault (the archlinux os-distribution catalog lane)" \
      org.opencontainers.image.description="the archlinux os-distribution seat as a catalog lane of the vault container: the rolling-release distribution omarchy builds on, the pacman desktop seat — the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${VAULT_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/archlinux.json /vault/osprofile.json

FROM scratch AS osalpine
ARG VAULT_VERSION=2.0.175
ARG VAULT_OS_PROFILE="alpine"
ENV VAULT_OS_PROFILE=alpine
LABEL org.opencontainers.image.title="vault (the alpine os-distribution catalog lane)" \
      org.opencontainers.image.description="the alpine os-distribution seat as a catalog lane of the vault container: the musl-based lightweight distribution, the small-footprint seat the musl legs answer — the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${VAULT_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/alpine.json /vault/osprofile.json

FROM scratch AS osdebian
ARG VAULT_VERSION=2.0.175
ARG VAULT_OS_PROFILE="debian"
ENV VAULT_OS_PROFILE=debian
LABEL org.opencontainers.image.title="vault (the debian os-distribution catalog lane)" \
      org.opencontainers.image.description="the debian os-distribution seat as a catalog lane of the vault container: the universal operating system, the apt desktop seat the widest hardware matrix answers — the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${VAULT_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/debian.json /vault/osprofile.json

FROM scratch AS osfedora
ARG VAULT_VERSION=2.0.175
ARG VAULT_OS_PROFILE="fedora"
ENV VAULT_OS_PROFILE=fedora
LABEL org.opencontainers.image.title="vault (the fedora os-distribution catalog lane)" \
      org.opencontainers.image.description="the fedora os-distribution seat as a catalog lane of the vault container: the red-hat-upstream community distribution, the rpm desktop seat beside the apt rows — the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${VAULT_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/fedora.json /vault/osprofile.json

FROM scratch AS osnixos
ARG VAULT_VERSION=2.0.175
ARG VAULT_OS_PROFILE="nixos"
ENV VAULT_OS_PROFILE=nixos
LABEL org.opencontainers.image.title="vault (the nixos os-distribution catalog lane)" \
      org.opencontainers.image.description="the nixos os-distribution seat as a catalog lane of the vault container: the declarative distribution the nix package manager builds, the reproducible-system seat — the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${VAULT_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/nixos.json /vault/osprofile.json

FROM scratch AS osvoid
ARG VAULT_VERSION=2.0.175
ARG VAULT_OS_PROFILE="void"
ENV VAULT_OS_PROFILE=void
LABEL org.opencontainers.image.title="vault (the void os-distribution catalog lane)" \
      org.opencontainers.image.description="the void os-distribution seat as a catalog lane of the vault container: the independent source-rolling distribution, the xbps seat the musl legs answer beside alpine — the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${VAULT_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/void.json /vault/osprofile.json

FROM scratch AS oslinux
ARG VAULT_VERSION=2.0.175
ARG VAULT_OS_PROFILE="linux"
ENV VAULT_OS_PROFILE=linux
LABEL org.opencontainers.image.title="vault (the linux os-distribution catalog lane)" \
      org.opencontainers.image.description="the linux os-distribution seat as a catalog lane of the vault container: the normal linux guest — the default host profile the sandbox lanes boot (the seventeen-seat standard carries the linux seats) — the lane publishes the profile config the engine reads beside the runnable linux legs the saddle engine's own flavor lanes carry." \
      org.opencontainers.image.version="${VAULT_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/linux.json /vault/osprofile.json

FROM scratch AS osomarchy
ARG VAULT_VERSION=2.0.175
ARG VAULT_OS_PROFILE="omarchy"
ENV VAULT_OS_PROFILE=omarchy
LABEL org.opencontainers.image.title="vault (the omarchy os-distribution catalog lane)" \
      org.opencontainers.image.description="the omarchy os-distribution seat as a catalog lane of the vault container: the arch linux-based distribution created by dhh — the desktop guest profile the sandbox may host with the pacman package grammar — the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${VAULT_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/omarchy.json /vault/osprofile.json


FROM nginxinc/nginx-unprivileged:1.29-alpine@sha256:0c79d56aee561a1d81c63f00eee5fb5fe29279560cdc55e91425133104c7fbe6 AS face

ARG VAULT_VERSION=2.0.175

LABEL org.opencontainers.image.title="vault (the face)" \
      org.opencontainers.image.description="vault face — the nginx surface of the storage container pair: the staged SPA the solbuild leg assembled served beside the /api proxy lane the mounted nginx.conf declares." \
      org.opencontainers.image.version="${VAULT_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink" \
      org.opencontainers.image.documentation="https://github.com/wenathlan/devthink/tree/main/vault"

# the staged SPA the solbuild leg assembled rides the unprivileged nginx
# html seat (the argan deploy precedent — the same nginx-unprivileged
# base the family faces carry): the compose face service builds this
# target, mounts the family nginx.conf over the default site conf and
# serves the static surface beside the /api/* proxy lane. until this
# stage the compose face service pointed at a target that never existed
# — the pair the file documents never booted.
COPY --from=solbuild /site/ /usr/share/nginx/html/

FROM node:26-alpine@sha256:8996bb5821d62a8fd9bb27c1cb07462f3fdce6e47d640c6a881ead0b064ce216

ARG VAULT_VERSION=2.0.175

LABEL org.opencontainers.image.title="vault" \
      org.opencontainers.image.description="vault — the storage engine of the platform: every app imports the storage from it, and only from it." \
      org.opencontainers.image.version="${VAULT_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink" \
      org.opencontainers.image.documentation="https://github.com/wenathlan/devthink/tree/main/vault"

WORKDIR /app

# the site face — the ONLY tree the http surface ever serves (the built
# faces the solbuild stage assembled, never the source root: the faun seal).
COPY --from=solbuild /site/ /app/site/

# the engine: the erasable-typescript sources the node 26 pin runs natively
# (the source-is-the-library doctrine — api.ts and its import closure) and
# the production dependency tree with the compiled better-sqlite3 seat.
COPY --from=enginedeps /deps/node_modules/ /app/node_modules/
COPY --from=solbuild /src/account.ts /src/chunks.ts /src/db.ts /src/decoy.ts /src/drizzle.ts /src/internalroot.ts /src/labels.ts /src/labelstore.ts /src/mimetypes.ts /src/objects.ts /src/onboardingstate.ts /src/protocols.ts /src/querylane.ts /src/quota.ts /src/routes.ts /src/sha.ts /src/storage.ts /src/uistore.ts /app/

# the runtime state home: the sqlite stores mount here (a named volume —
# never inside dist, never beside the served tree; the engine creates the
# files on first boot).
RUN mkdir -p /app/data && chown -R node:node /app

# the explicit non-root runtime user (uid 1000 is the node image default):
# the scan gate refuses an image without a pinned unprivileged
# user, so the declaration is spelled out instead of inherited.
USER node

# the engine doors: the static face, the storage url, the ui store and the
# listen port. VAULT_TOKEN stays unpinned — the operator injects it and the
# entrypoint refuses to boot without it (fail closed).
ENV VAULT_STATIC_DIR=/app/site \
    VAULT_STORAGE_URL=file:/app/data/vault-storage.db \
    VAULT_UISTORE_DB=/app/data/uistore.db \
    VAULT_HOST=0.0.0.0 \
    VAULT_PORT=3210

EXPOSE 3210

# the health probe stays open the way the engine keeps it: /api/health
# answers without the bearer (the container is the engine now, not the
# static mirror the nginx leg used to be).
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${VAULT_PORT:-3210}/api/health" || exit 1

# fail closed: without VAULT_TOKEN the container refuses to boot — the
# engine would seal every storage route anyway (503 on each data call), so
# the operator gets the loud refusal at boot instead of the quiet seal.
CMD ["sh", "-c", "test -n \"$VAULT_TOKEN\" || { echo 'VAULT_TOKEN is not set — the vault engine refuses to boot (pin the bearer the storage routes demand)'; exit 1; }; exec node account.ts"]
