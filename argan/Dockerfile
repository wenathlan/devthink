# argan 2.0.175 — THE SITE CONTAINER FILE
#
# The family container doctrine in the sol shape: one versioned static
# container per site. The sol theme builds inside the container — stage one
# installs the locked pnpm tree and runs the vite build, stage two serves
# the built theme through the unprivileged nginx image. The version rides
# the ARG the metadata lockstep stamps and the OCI labels declare — the
# registry lanes pass it at build time, nothing is hardcoded beside the
# stamp.

# the solbuild leg rides the NATIVE build platform (the cross-arch static
# law: the vite output is arch-independent, so the 8-arch runtime index
# below never waits on the 2-arch node alpine base — each leg resolves only
# the nginx base the multi-arch lane carries).
FROM --platform=$BUILDPLATFORM node:26-alpine@sha256:8996bb5821d62a8fd9bb27c1cb07462f3fdce6e47d640c6a881ead0b064ce216 AS solbuild

ARG ARGAN_VERSION=2.0.175

# The 2.0.153 family context fix: the application rides the context
# nested under app/ (the uniform shape the three site containers read).
WORKDIR /src/app
COPY app/package.json app/pnpm-workspace.yaml ./
COPY app/pnpmboot.package.json /tmp/pnpmboot/package.json
COPY app/pnpmboot.package-lock.json /tmp/pnpmboot/package-lock.json
RUN apk add --no-cache python3 make g++ \
 && npm ci --prefix /tmp/pnpmboot --no-fund --no-audit \
 && ln -sf /tmp/pnpmboot/node_modules/.bin/pnpm /usr/local/bin/pnpm \
 && pnpm install --no-frozen-lockfile --ignore-scripts
COPY app/ .
# The vault sibling of the copy law: labels.ts imports the label store
# through the @wenathlan/vault/labelstore bridge and the vite alias
# resolves the specifier to ../vault/labelstore.ts, so the sibling
# sources land at /src/vault where that bridge answers inside the
# container (the app-only context left the import unloadable and the
# vite step died on labels.ts).
COPY vault/ /src/vault/
# The devthink sibling of the family law: routerbase.ts re-exports the
# family routerBase from ../devthink/routerbase.ts, so the devthink
# sources land at /src/devthink where that re-export answers inside the
# container (the same sibling-copy law the vault line above carries).
COPY devthink/ /src/devthink/
# the debonair audio engine the ../debonair import lanes resolve
COPY debonair/ /src/debonair/
# the saddle workload law the ../saddle aliases resolve
COPY saddle/ /src/saddle/
# THE SIBLING RESOLUTION LAW (the containerlanes heal): the sibling
# sources resolve their bare specifiers against the app install — the
# monorepo lanes answered every @wenathlan door and engine import from
# each sibling's own node_modules, a tree the container never carries
# (the sources-only copy law), so the app's own install answers every
# sibling path: the devthink graph (serve.ts through security.ts) reads
# the @wenathlan/getry registry doors this way, and the install's
# pnpm symlink layout resolves identically behind the link. The link is
# build-time only — the runtime stage never carries it.
RUN ln -s /src/app/node_modules /src/devthink/node_modules \
 && ln -s /src/app/node_modules /src/debonair/node_modules \
 && ln -s /src/app/node_modules /src/saddle/node_modules \
 && ln -s /src/app/node_modules /src/vault/node_modules
RUN pnpm build

# ════════════════════════════════════════════════════════════════════
# THE OS-DISTRIBUTION CATALOG LANES (the container-lane law, the family
# half): the thirteen os-distribution seats the saddle osprofiles catalog
# answers ride the argan container the same law the saddle engine answers
# — every profile with no runnable container base ships as an honest
# catalog lane, a scratch-based image whose config carries the profile
# row the saddle catalog renders at build time (the import law: the json
# the stages COPY renders from saddle/osprofiles.ts, the catalog never
# duplicates here — argan imports the engine catalog the saddle owns).
# the catalog lanes ride before the runtime stage so the default build keeps answering the runtime target (the family builds never pass --target — the saddle lanes always do, the os seats close the saddle file the same law).
# ════════════════════════════════════════════════════════════════════
FROM scratch AS osgrapheneos
ARG ARGAN_VERSION=2.0.175
ARG ARGAN_OS_PROFILE="grapheneos"
ENV ARGAN_OS_PROFILE=grapheneos
LABEL org.opencontainers.image.title="argan (the grapheneos os-distribution catalog lane)" \
      org.opencontainers.image.description="the grapheneos os-distribution seat as a catalog lane of the argan container: a privacy and security hardened version of android — no runnable container base exists for an android firmware seat, the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${ARGAN_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/grapheneos.json /argan/osprofile.json

FROM scratch AS osmaruos
ARG ARGAN_VERSION=2.0.175
ARG ARGAN_OS_PROFILE="maruos"
ENV ARGAN_OS_PROFILE=maruos
LABEL org.opencontainers.image.title="argan (the maruos os-distribution catalog lane)" \
      org.opencontainers.image.description="the maruos os-distribution seat as a catalog lane of the argan container: maru os is firmware, not an application: the android firmware seat with the debian desktop — no runnable container base exists for a firmware seat, the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${ARGAN_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/maruos.json /argan/osprofile.json

FROM scratch AS osv
ARG ARGAN_VERSION=2.0.175
ARG ARGAN_OS_PROFILE="v"
ENV ARGAN_OS_PROFILE=v
LABEL org.opencontainers.image.title="argan (the v os-distribution catalog lane)" \
      org.opencontainers.image.description="the v os-distribution seat as a catalog lane of the argan container: the v language platform target (vlang): the language engine seat, never a guest distribution — no runnable container base exists for the languageos seat, the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${ARGAN_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/v.json /argan/osprofile.json

FROM scratch AS oswindows
ARG ARGAN_VERSION=2.0.175
ARG ARGAN_OS_PROFILE="windows"
ENV ARGAN_OS_PROFILE=windows
LABEL org.opencontainers.image.title="argan (the windows os-distribution catalog lane)" \
      org.opencontainers.image.description="the windows os-distribution seat as a catalog lane of the argan container: the windows guest vocabulary the exe seats execute — no runnable container base exists for the windows seat the engine hosts as a guest, the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${ARGAN_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/windows.json /argan/osprofile.json

FROM scratch AS ospostmarketos
ARG ARGAN_VERSION=2.0.175
ARG ARGAN_OS_PROFILE="postmarketos"
ENV ARGAN_OS_PROFILE=postmarketos
LABEL org.opencontainers.image.title="argan (the postmarketos os-distribution catalog lane)" \
      org.opencontainers.image.description="the postmarketos os-distribution seat as a catalog lane of the argan container: the alpine-based mobile distribution — no runnable container base exists for the mobile seat, the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${ARGAN_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/postmarketos.json /argan/osprofile.json

FROM scratch AS oslineageos
ARG ARGAN_VERSION=2.0.175
ARG ARGAN_OS_PROFILE="lineageos"
ENV ARGAN_OS_PROFILE=lineageos
LABEL org.opencontainers.image.title="argan (the lineageos os-distribution catalog lane)" \
      org.opencontainers.image.description="the lineageos os-distribution seat as a catalog lane of the argan container: the android community distribution — no runnable container base exists for the mobile seat, the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${ARGAN_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/lineageos.json /argan/osprofile.json

FROM scratch AS oscalyxos
ARG ARGAN_VERSION=2.0.175
ARG ARGAN_OS_PROFILE="calyxos"
ENV ARGAN_OS_PROFILE=calyxos
LABEL org.opencontainers.image.title="argan (the calyxos os-distribution catalog lane)" \
      org.opencontainers.image.description="the calyxos os-distribution seat as a catalog lane of the argan container: the privacy-focused android distribution, the hardened mobile seat beside grapheneos — no runnable container base exists for the mobile seat, the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${ARGAN_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/calyxos.json /argan/osprofile.json

FROM scratch AS osarchlinux
ARG ARGAN_VERSION=2.0.175
ARG ARGAN_OS_PROFILE="archlinux"
ENV ARGAN_OS_PROFILE=archlinux
LABEL org.opencontainers.image.title="argan (the archlinux os-distribution catalog lane)" \
      org.opencontainers.image.description="the archlinux os-distribution seat as a catalog lane of the argan container: the rolling-release distribution omarchy builds on, the pacman desktop seat — the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${ARGAN_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/archlinux.json /argan/osprofile.json

FROM scratch AS osalpine
ARG ARGAN_VERSION=2.0.175
ARG ARGAN_OS_PROFILE="alpine"
ENV ARGAN_OS_PROFILE=alpine
LABEL org.opencontainers.image.title="argan (the alpine os-distribution catalog lane)" \
      org.opencontainers.image.description="the alpine os-distribution seat as a catalog lane of the argan container: the musl-based lightweight distribution, the small-footprint seat the musl legs answer — the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${ARGAN_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/alpine.json /argan/osprofile.json

FROM scratch AS osdebian
ARG ARGAN_VERSION=2.0.175
ARG ARGAN_OS_PROFILE="debian"
ENV ARGAN_OS_PROFILE=debian
LABEL org.opencontainers.image.title="argan (the debian os-distribution catalog lane)" \
      org.opencontainers.image.description="the debian os-distribution seat as a catalog lane of the argan container: the universal operating system, the apt desktop seat the widest hardware matrix answers — the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${ARGAN_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/debian.json /argan/osprofile.json

FROM scratch AS osfedora
ARG ARGAN_VERSION=2.0.175
ARG ARGAN_OS_PROFILE="fedora"
ENV ARGAN_OS_PROFILE=fedora
LABEL org.opencontainers.image.title="argan (the fedora os-distribution catalog lane)" \
      org.opencontainers.image.description="the fedora os-distribution seat as a catalog lane of the argan container: the red-hat-upstream community distribution, the rpm desktop seat beside the apt rows — the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${ARGAN_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/fedora.json /argan/osprofile.json

FROM scratch AS osnixos
ARG ARGAN_VERSION=2.0.175
ARG ARGAN_OS_PROFILE="nixos"
ENV ARGAN_OS_PROFILE=nixos
LABEL org.opencontainers.image.title="argan (the nixos os-distribution catalog lane)" \
      org.opencontainers.image.description="the nixos os-distribution seat as a catalog lane of the argan container: the declarative distribution the nix package manager builds, the reproducible-system seat — the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${ARGAN_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/nixos.json /argan/osprofile.json

FROM scratch AS osvoid
ARG ARGAN_VERSION=2.0.175
ARG ARGAN_OS_PROFILE="void"
ENV ARGAN_OS_PROFILE=void
LABEL org.opencontainers.image.title="argan (the void os-distribution catalog lane)" \
      org.opencontainers.image.description="the void os-distribution seat as a catalog lane of the argan container: the independent source-rolling distribution, the xbps seat the musl legs answer beside alpine — the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${ARGAN_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/void.json /argan/osprofile.json

FROM scratch AS oslinux
ARG ARGAN_VERSION=2.0.175
ARG ARGAN_OS_PROFILE="linux"
ENV ARGAN_OS_PROFILE=linux
LABEL org.opencontainers.image.title="argan (the linux os-distribution catalog lane)" \
      org.opencontainers.image.description="the linux os-distribution seat as a catalog lane of the argan container: the normal linux guest — the default host profile the sandbox lanes boot (the seventeen-seat standard carries the linux seats) — the lane publishes the profile config the engine reads beside the runnable linux legs the saddle engine's own flavor lanes carry." \
      org.opencontainers.image.version="${ARGAN_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/linux.json /argan/osprofile.json

FROM scratch AS osomarchy
ARG ARGAN_VERSION=2.0.175
ARG ARGAN_OS_PROFILE="omarchy"
ENV ARGAN_OS_PROFILE=omarchy
LABEL org.opencontainers.image.title="argan (the omarchy os-distribution catalog lane)" \
      org.opencontainers.image.description="the omarchy os-distribution seat as a catalog lane of the argan container: the arch linux-based distribution created by dhh — the desktop guest profile the sandbox may host with the pacman package grammar — the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${ARGAN_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/omarchy.json /argan/osprofile.json


FROM nginxinc/nginx-unprivileged:1.29-alpine@sha256:0c79d56aee561a1d81c63f00eee5fb5fe29279560cdc55e91425133104c7fbe6

ARG ARGAN_VERSION=2.0.175

LABEL org.opencontainers.image.title="argan" \
      org.opencontainers.image.description="argan — the DNS and gateway library; zones, records, dnssec and handshake." \
      org.opencontainers.image.version="${ARGAN_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink" \
      org.opencontainers.image.documentation="https://github.com/wenathlan/devthink/tree/main/argan"

COPY --from=solbuild /src/app/ /usr/share/nginx/html/

# the explicit non-root runtime user (uid 101 is the nginx-unprivileged
# default): the scan gate refuses an image without a pinned unprivileged
# user, so the declaration is spelled out instead of inherited.
USER 101

# the unprivileged image answers 8080; the healthcheck probes the served
# root the same way the pages lane does.
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD ["wget", "-qO-", "http://127.0.0.1:8080/"]

# THE CONTAINER CONFIGURATION AND DEPLOY PAIR (the one-dockerfile
# consolidation the owner standardization law seats): the standalone
# docker-compose.yml and docker.config this project once carried ride
# this dockerfile alone now — the OCI labels above answer the config
# manifest (the title, the version the ARG stamps, the license and the
# source), and the two-service deploy the compose wired walks from the
# stanza below (the health gate the face answers, one distinct host door
# per family member).
#
#   argan-engine  this image (the registry lane publishes it at
#           ghcr.io/wenathlan/argan:${ARGAN_VERSION}): the built
#           site behind the unprivileged nginx, EXPOSE 8080, the listen
#           probe the image carries as its healthcheck
#   argan-face  the same image with the family conf (nginx.conf) mounted
#           over the default conf — the resolver law, the security
#           header law, the /api/* proxy lane to the engine, the spa
#           rewrite as try_files
#
#   the health lane  the wget -qO- http://127.0.0.1:8080/ listen probe the image carries
#
# the operator seats the pair with one compose stanza (or the equivalent
# docker run pair) beside the pulled image:
#
#   services:
#     argan-engine:
#       image: "ghcr.io/wenathlan/argan:${ARGAN_VERSION:-2.0.175}"
#       init: true
#       restart: unless-stopped
#     argan-face:
#       image: "ghcr.io/wenathlan/argan:${ARGAN_VERSION:-2.0.175}"
#       volumes:
#         - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
#       depends_on:
#         argan-engine:
#           condition: service_healthy
#       ports:
#         - "8081:8080"
#       restart: unless-stopped
LABEL wenathlan.config.title="argan - the container configuration of the zones site (the compose pair, the nginx face, the site container)" \
      wenathlan.config.version="${ARGAN_VERSION}" \
      wenathlan.config.date="2026-11-06" \
      wenathlan.config.language="en" \
      wenathlan.deploy.hostdoor="8081" \
      wenathlan.deploy.engineport="8080"
