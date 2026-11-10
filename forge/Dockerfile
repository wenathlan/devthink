# forge 2.0.175 — THE SITE CONTAINER FILE
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

ARG FORGE_VERSION=2.0.175

# The family context fix (the staged shape the site containers read): the
# application rides the context nested under app/ with the sibling sources
# the vite alias bridges resolve beside it.
WORKDIR /src/app
COPY app/package.json app/pnpm-workspace.yaml ./
COPY app/pnpmboot.package.json /tmp/pnpmboot/package.json
COPY app/pnpmboot.package-lock.json /tmp/pnpmboot/package-lock.json
RUN apk add --no-cache python3 make g++ \
 && npm ci --prefix /tmp/pnpmboot --no-fund --no-audit \
 && ln -sf /tmp/pnpmboot/node_modules/.bin/pnpm /usr/local/bin/pnpm \
 && pnpm install --no-frozen-lockfile --ignore-scripts
COPY app/ .
# the copy-law vault sibling: the label store, routes and utils bridges resolve the ../vault aliases, so the sibling sources land at /src/vault where those bridges answer inside the container.
COPY vault/ /src/vault/
# The devthink sibling of the family law: routerbase.ts re-exports the
# family routerBase from ../devthink/routerbase.ts, so the devthink
# sources land at /src/devthink where that re-export answers inside the
# container (the same sibling-copy law the vault line above carries).
COPY devthink/ /src/devthink/
# the foundry pipeline the ../foundry import lanes resolve
COPY foundry/ /src/foundry/
# the saddle sibling of the engine ownership: the runner sources import the modes through the @wenathlan/saddle/modes bridge and the vite alias resolves the specifier to ../saddle/modes.ts, so the sibling sources land at /src/saddle where that bridge answers inside the container (sources only - the build never installs the sibling, the alias reads the .ts file).
COPY saddle/ /src/saddle/
# THE SIBLING RESOLUTION LAW (the containerlanes heal): the sibling
# sources resolve their bare specifiers against the app install — the
# monorepo lanes answered every @wenathlan door import from each
# sibling's own node_modules, a tree the container never carries (the
# sources-only copy law), so the app's own install answers every
# sibling path (the devthink graph reads the @wenathlan/getry registry
# doors this way). The link is build-time only — the runtime stage
# never carries it.
RUN ln -s /src/app/node_modules /src/vault/node_modules \
 && ln -s /src/app/node_modules /src/devthink/node_modules \
 && ln -s /src/app/node_modules /src/foundry/node_modules \
 && ln -s /src/app/node_modules /src/saddle/node_modules
RUN pnpm build

# ════════════════════════════════════════════════════════════════════
# THE OS-DISTRIBUTION CATALOG LANES (the container-lane law, the family
# half): the thirteen os-distribution seats the saddle osprofiles catalog
# answers ride the forge container the same law the saddle engine answers
# — every profile with no runnable container base ships as an honest
# catalog lane, a scratch-based image whose config carries the profile
# row the saddle catalog renders at build time (the import law: the json
# the stages COPY renders from saddle/osprofiles.ts, the catalog never
# duplicates here — forge imports the engine catalog the saddle owns).
# the catalog lanes ride before the runtime stage so the default build keeps answering the runtime target (the family builds never pass --target — the saddle lanes always do, the os seats close the saddle file the same law).
# ════════════════════════════════════════════════════════════════════
FROM scratch AS osgrapheneos
ARG FORGE_VERSION=2.0.175
ARG FORGE_OS_PROFILE="grapheneos"
ENV FORGE_OS_PROFILE=grapheneos
LABEL org.opencontainers.image.title="forge (the grapheneos os-distribution catalog lane)" \
      org.opencontainers.image.description="the grapheneos os-distribution seat as a catalog lane of the forge container: a privacy and security hardened version of android — no runnable container base exists for an android firmware seat, the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${FORGE_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/grapheneos.json /forge/osprofile.json

FROM scratch AS osmaruos
ARG FORGE_VERSION=2.0.175
ARG FORGE_OS_PROFILE="maruos"
ENV FORGE_OS_PROFILE=maruos
LABEL org.opencontainers.image.title="forge (the maruos os-distribution catalog lane)" \
      org.opencontainers.image.description="the maruos os-distribution seat as a catalog lane of the forge container: maru os is firmware, not an application: the android firmware seat with the debian desktop — no runnable container base exists for a firmware seat, the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${FORGE_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/maruos.json /forge/osprofile.json

FROM scratch AS osv
ARG FORGE_VERSION=2.0.175
ARG FORGE_OS_PROFILE="v"
ENV FORGE_OS_PROFILE=v
LABEL org.opencontainers.image.title="forge (the v os-distribution catalog lane)" \
      org.opencontainers.image.description="the v os-distribution seat as a catalog lane of the forge container: the v language platform target (vlang): the language engine seat, never a guest distribution — no runnable container base exists for the languageos seat, the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${FORGE_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/v.json /forge/osprofile.json

FROM scratch AS oswindows
ARG FORGE_VERSION=2.0.175
ARG FORGE_OS_PROFILE="windows"
ENV FORGE_OS_PROFILE=windows
LABEL org.opencontainers.image.title="forge (the windows os-distribution catalog lane)" \
      org.opencontainers.image.description="the windows os-distribution seat as a catalog lane of the forge container: the windows guest vocabulary the exe seats execute — no runnable container base exists for the windows seat the engine hosts as a guest, the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${FORGE_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/windows.json /forge/osprofile.json

FROM scratch AS ospostmarketos
ARG FORGE_VERSION=2.0.175
ARG FORGE_OS_PROFILE="postmarketos"
ENV FORGE_OS_PROFILE=postmarketos
LABEL org.opencontainers.image.title="forge (the postmarketos os-distribution catalog lane)" \
      org.opencontainers.image.description="the postmarketos os-distribution seat as a catalog lane of the forge container: the alpine-based mobile distribution — no runnable container base exists for the mobile seat, the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${FORGE_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/postmarketos.json /forge/osprofile.json

FROM scratch AS oslineageos
ARG FORGE_VERSION=2.0.175
ARG FORGE_OS_PROFILE="lineageos"
ENV FORGE_OS_PROFILE=lineageos
LABEL org.opencontainers.image.title="forge (the lineageos os-distribution catalog lane)" \
      org.opencontainers.image.description="the lineageos os-distribution seat as a catalog lane of the forge container: the android community distribution — no runnable container base exists for the mobile seat, the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${FORGE_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/lineageos.json /forge/osprofile.json

FROM scratch AS oscalyxos
ARG FORGE_VERSION=2.0.175
ARG FORGE_OS_PROFILE="calyxos"
ENV FORGE_OS_PROFILE=calyxos
LABEL org.opencontainers.image.title="forge (the calyxos os-distribution catalog lane)" \
      org.opencontainers.image.description="the calyxos os-distribution seat as a catalog lane of the forge container: the privacy-focused android distribution, the hardened mobile seat beside grapheneos — no runnable container base exists for the mobile seat, the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${FORGE_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/calyxos.json /forge/osprofile.json

FROM scratch AS osarchlinux
ARG FORGE_VERSION=2.0.175
ARG FORGE_OS_PROFILE="archlinux"
ENV FORGE_OS_PROFILE=archlinux
LABEL org.opencontainers.image.title="forge (the archlinux os-distribution catalog lane)" \
      org.opencontainers.image.description="the archlinux os-distribution seat as a catalog lane of the forge container: the rolling-release distribution omarchy builds on, the pacman desktop seat — the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${FORGE_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/archlinux.json /forge/osprofile.json

FROM scratch AS osalpine
ARG FORGE_VERSION=2.0.175
ARG FORGE_OS_PROFILE="alpine"
ENV FORGE_OS_PROFILE=alpine
LABEL org.opencontainers.image.title="forge (the alpine os-distribution catalog lane)" \
      org.opencontainers.image.description="the alpine os-distribution seat as a catalog lane of the forge container: the musl-based lightweight distribution, the small-footprint seat the musl legs answer — the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${FORGE_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/alpine.json /forge/osprofile.json

FROM scratch AS osdebian
ARG FORGE_VERSION=2.0.175
ARG FORGE_OS_PROFILE="debian"
ENV FORGE_OS_PROFILE=debian
LABEL org.opencontainers.image.title="forge (the debian os-distribution catalog lane)" \
      org.opencontainers.image.description="the debian os-distribution seat as a catalog lane of the forge container: the universal operating system, the apt desktop seat the widest hardware matrix answers — the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${FORGE_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/debian.json /forge/osprofile.json

FROM scratch AS osfedora
ARG FORGE_VERSION=2.0.175
ARG FORGE_OS_PROFILE="fedora"
ENV FORGE_OS_PROFILE=fedora
LABEL org.opencontainers.image.title="forge (the fedora os-distribution catalog lane)" \
      org.opencontainers.image.description="the fedora os-distribution seat as a catalog lane of the forge container: the red-hat-upstream community distribution, the rpm desktop seat beside the apt rows — the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${FORGE_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/fedora.json /forge/osprofile.json

FROM scratch AS osnixos
ARG FORGE_VERSION=2.0.175
ARG FORGE_OS_PROFILE="nixos"
ENV FORGE_OS_PROFILE=nixos
LABEL org.opencontainers.image.title="forge (the nixos os-distribution catalog lane)" \
      org.opencontainers.image.description="the nixos os-distribution seat as a catalog lane of the forge container: the declarative distribution the nix package manager builds, the reproducible-system seat — the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${FORGE_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/nixos.json /forge/osprofile.json

FROM scratch AS osvoid
ARG FORGE_VERSION=2.0.175
ARG FORGE_OS_PROFILE="void"
ENV FORGE_OS_PROFILE=void
LABEL org.opencontainers.image.title="forge (the void os-distribution catalog lane)" \
      org.opencontainers.image.description="the void os-distribution seat as a catalog lane of the forge container: the independent source-rolling distribution, the xbps seat the musl legs answer beside alpine — the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${FORGE_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/void.json /forge/osprofile.json

FROM scratch AS oslinux
ARG FORGE_VERSION=2.0.174
ARG FORGE_OS_PROFILE="linux"
ENV FORGE_OS_PROFILE=linux
LABEL org.opencontainers.image.title="forge (the linux os-distribution catalog lane)" \
      org.opencontainers.image.description="the linux os-distribution seat as a catalog lane of the forge container: the normal linux guest — the default host profile the sandbox lanes boot (the seventeen-seat standard carries the linux seats) — the lane publishes the profile config the engine reads beside the runnable linux legs the saddle engine's own flavor lanes carry." \
      org.opencontainers.image.version="${FORGE_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/linux.json /forge/osprofile.json

FROM scratch AS osomarchy
ARG FORGE_VERSION=2.0.174
ARG FORGE_OS_PROFILE="omarchy"
ENV FORGE_OS_PROFILE=omarchy
LABEL org.opencontainers.image.title="forge (the omarchy os-distribution catalog lane)" \
      org.opencontainers.image.description="the omarchy os-distribution seat as a catalog lane of the forge container: the arch linux-based distribution created by dhh — the desktop guest profile the sandbox may host with the pacman package grammar — the lane publishes the profile config the engine reads." \
      org.opencontainers.image.version="${FORGE_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
COPY osprofiles/omarchy.json /forge/osprofile.json


FROM nginxinc/nginx-unprivileged:1.29-alpine@sha256:0c79d56aee561a1d81c63f00eee5fb5fe29279560cdc55e91425133104c7fbe6

ARG FORGE_VERSION=2.0.175

LABEL org.opencontainers.image.title="forge" \
      org.opencontainers.image.description="forge — the run only site role of the network: the execution face at the saddle frontier." \
      org.opencontainers.image.version="${FORGE_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink" \
      org.opencontainers.image.documentation="https://github.com/wenathlan/devthink/tree/main/forge"

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
