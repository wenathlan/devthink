# argan 2.0.167 — THE SITE CONTAINER FILE
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
FROM --platform=$BUILDPLATFORM node:26-alpine@sha256:c6ad9e9c1d80f6eb607c26b4b0a132ff7a2344fad1c78ea3baa2a7d4c8de6d94 AS solbuild

ARG ARGAN_VERSION=2.0.167

# The 2.0.153 family context fix: the application rides the context
# nested under app/ (the uniform shape the three site containers read).
WORKDIR /src/app
COPY app/package.json app/pnpm-lock.yaml app/pnpm-workspace.yaml ./
COPY app/pnpmboot.package.json /tmp/pnpmboot/package.json
COPY app/pnpmboot.package-lock.json /tmp/pnpmboot/package-lock.json
RUN apk add --no-cache python3 make g++ \
 && npm ci --prefix /tmp/pnpmboot --no-fund --no-audit \
 && ln -sf /tmp/pnpmboot/node_modules/.bin/pnpm /usr/local/bin/pnpm \
 && pnpm install --frozen-lockfile --ignore-scripts
COPY app/ .
# The vault sibling of the copy law: labels.ts imports the label store
# through the @wenathlan/vault/labelstore bridge and the vite alias
# resolves the specifier to ../vault/labelstore.ts, so the sibling
# sources land at /src/vault where that bridge answers inside the
# container (the app-only context left the import unloadable and the
# vite step died on labels.ts).
COPY vault/ /src/vault/
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
ARG ARGAN_VERSION=2.0.167
ARG ARGAN_OS_PROFILE="grapheneos"
ENV ARGAN_OS_PROFILE=grapheneos
LABEL org.opencontainers.image.title="argan (the grapheneos os-distribution catalog lane)" \
      org.opencontainers.image.description="the grapheneos os-distribution seat as a catalog lane of the argan container: a privacy and security hardened version of android — no runnable container base exists for an android firmware seat, the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${ARGAN_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/grapheneos.json /argan/osprofile.json

FROM scratch AS osmaruos
ARG ARGAN_VERSION=2.0.167
ARG ARGAN_OS_PROFILE="maruos"
ENV ARGAN_OS_PROFILE=maruos
LABEL org.opencontainers.image.title="argan (the maruos os-distribution catalog lane)" \
      org.opencontainers.image.description="the maruos os-distribution seat as a catalog lane of the argan container: maru os is firmware, not an application: the android firmware seat with the debian desktop — no runnable container base exists for a firmware seat, the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${ARGAN_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/maruos.json /argan/osprofile.json

FROM scratch AS osv
ARG ARGAN_VERSION=2.0.167
ARG ARGAN_OS_PROFILE="v"
ENV ARGAN_OS_PROFILE=v
LABEL org.opencontainers.image.title="argan (the v os-distribution catalog lane)" \
      org.opencontainers.image.description="the v os-distribution seat as a catalog lane of the argan container: the v language platform target (vlang): the language engine seat, never a guest distribution — no runnable container base exists for the languageos seat, the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${ARGAN_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/v.json /argan/osprofile.json

FROM scratch AS oswindows
ARG ARGAN_VERSION=2.0.167
ARG ARGAN_OS_PROFILE="windows"
ENV ARGAN_OS_PROFILE=windows
LABEL org.opencontainers.image.title="argan (the windows os-distribution catalog lane)" \
      org.opencontainers.image.description="the windows os-distribution seat as a catalog lane of the argan container: the windows guest vocabulary the exe seats execute — no runnable container base exists for the windows seat the engine hosts as a guest, the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${ARGAN_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/windows.json /argan/osprofile.json

FROM scratch AS ospostmarketos
ARG ARGAN_VERSION=2.0.167
ARG ARGAN_OS_PROFILE="postmarketos"
ENV ARGAN_OS_PROFILE=postmarketos
LABEL org.opencontainers.image.title="argan (the postmarketos os-distribution catalog lane)" \
      org.opencontainers.image.description="the postmarketos os-distribution seat as a catalog lane of the argan container: the alpine-based mobile distribution — no runnable container base exists for the mobile seat, the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${ARGAN_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/postmarketos.json /argan/osprofile.json

FROM scratch AS oslineageos
ARG ARGAN_VERSION=2.0.167
ARG ARGAN_OS_PROFILE="lineageos"
ENV ARGAN_OS_PROFILE=lineageos
LABEL org.opencontainers.image.title="argan (the lineageos os-distribution catalog lane)" \
      org.opencontainers.image.description="the lineageos os-distribution seat as a catalog lane of the argan container: the android community distribution — no runnable container base exists for the mobile seat, the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${ARGAN_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/lineageos.json /argan/osprofile.json

FROM scratch AS oscalyxos
ARG ARGAN_VERSION=2.0.167
ARG ARGAN_OS_PROFILE="calyxos"
ENV ARGAN_OS_PROFILE=calyxos
LABEL org.opencontainers.image.title="argan (the calyxos os-distribution catalog lane)" \
      org.opencontainers.image.description="the calyxos os-distribution seat as a catalog lane of the argan container: the privacy-focused android distribution, the hardened mobile seat beside grapheneos — no runnable container base exists for the mobile seat, the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${ARGAN_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/calyxos.json /argan/osprofile.json

FROM scratch AS osarchlinux
ARG ARGAN_VERSION=2.0.167
ARG ARGAN_OS_PROFILE="archlinux"
ENV ARGAN_OS_PROFILE=archlinux
LABEL org.opencontainers.image.title="argan (the archlinux os-distribution catalog lane)" \
      org.opencontainers.image.description="the archlinux os-distribution seat as a catalog lane of the argan container: the rolling-release distribution omarchy builds on, the pacman desktop seat — the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${ARGAN_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/archlinux.json /argan/osprofile.json

FROM scratch AS osalpine
ARG ARGAN_VERSION=2.0.167
ARG ARGAN_OS_PROFILE="alpine"
ENV ARGAN_OS_PROFILE=alpine
LABEL org.opencontainers.image.title="argan (the alpine os-distribution catalog lane)" \
      org.opencontainers.image.description="the alpine os-distribution seat as a catalog lane of the argan container: the musl-based lightweight distribution, the small-footprint seat the musl legs answer — the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${ARGAN_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/alpine.json /argan/osprofile.json

FROM scratch AS osdebian
ARG ARGAN_VERSION=2.0.167
ARG ARGAN_OS_PROFILE="debian"
ENV ARGAN_OS_PROFILE=debian
LABEL org.opencontainers.image.title="argan (the debian os-distribution catalog lane)" \
      org.opencontainers.image.description="the debian os-distribution seat as a catalog lane of the argan container: the universal operating system, the apt desktop seat the widest hardware matrix answers — the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${ARGAN_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/debian.json /argan/osprofile.json

FROM scratch AS osfedora
ARG ARGAN_VERSION=2.0.167
ARG ARGAN_OS_PROFILE="fedora"
ENV ARGAN_OS_PROFILE=fedora
LABEL org.opencontainers.image.title="argan (the fedora os-distribution catalog lane)" \
      org.opencontainers.image.description="the fedora os-distribution seat as a catalog lane of the argan container: the red-hat-upstream community distribution, the rpm desktop seat beside the apt rows — the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${ARGAN_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/fedora.json /argan/osprofile.json

FROM scratch AS osnixos
ARG ARGAN_VERSION=2.0.167
ARG ARGAN_OS_PROFILE="nixos"
ENV ARGAN_OS_PROFILE=nixos
LABEL org.opencontainers.image.title="argan (the nixos os-distribution catalog lane)" \
      org.opencontainers.image.description="the nixos os-distribution seat as a catalog lane of the argan container: the declarative distribution the nix package manager builds, the reproducible-system seat — the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${ARGAN_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/nixos.json /argan/osprofile.json

FROM scratch AS osvoid
ARG ARGAN_VERSION=2.0.167
ARG ARGAN_OS_PROFILE="void"
ENV ARGAN_OS_PROFILE=void
LABEL org.opencontainers.image.title="argan (the void os-distribution catalog lane)" \
      org.opencontainers.image.description="the void os-distribution seat as a catalog lane of the argan container: the independent source-rolling distribution, the xbps seat the musl legs answer beside alpine — the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${ARGAN_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/void.json /argan/osprofile.json

FROM nginxinc/nginx-unprivileged:1.29-alpine@sha256:0c79d56aee561a1d81c63f00eee5fb5fe29279560cdc55e91425133104c7fbe6

ARG ARGAN_VERSION=2.0.167

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
