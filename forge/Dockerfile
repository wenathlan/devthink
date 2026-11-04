# forge 2.0.155 — THE SITE CONTAINER FILE
#
# The family container doctrine in the sol shape: one versioned static
# container per site. The sol theme builds inside the container — stage one
# installs the locked pnpm tree and runs the vite build, stage two serves
# the built theme through the unprivileged nginx image. The version rides
# the ARG the metadata lockstep stamps and the OCI labels declare — the
# registry lanes pass it at build time, nothing is hardcoded beside the
# stamp.
#
# The 2.0.155 family context law: the application rides the context nested
# under app/ (the staged shape the family site containers read) with the
# sibling sources beside it — labels.ts bridges the copy law through the
# @wenathlan/vault/labelstore specifier, runner.ts reads the sandbox modes
# through @wenathlan/saddle/modes and the workload law reads
# @wenathlan/saddle/workloadlaw, so the vault and saddle sources land in
# the context where the vite aliases resolve them (sources only, the build
# never installs the siblings, the aliases read the .ts files directly).

FROM node:26-alpine@sha256:40cd011b55415bc894e45b02fdd5a5dfde056921b7d23a64c74f80497af48797 AS solbuild

ARG FORGE_VERSION=2.0.155

WORKDIR /src/app
COPY app/package.json app/pnpm-lock.yaml app/pnpm-workspace.yaml ./
COPY app/pnpmboot.package.json /tmp/pnpmboot/package.json
COPY app/pnpmboot.package-lock.json /tmp/pnpmboot/package-lock.json
RUN apk add --no-cache python3 make g++ \
 && npm ci --prefix /tmp/pnpmboot --no-fund --no-audit \
 && ln -sf /tmp/pnpmboot/node_modules/.bin/pnpm /usr/local/bin/pnpm \
 && pnpm install --frozen-lockfile
COPY app/ .
# the vault sibling of the copy law: labels.ts imports the label store
# through the @wenathlan/vault/labelstore bridge and the vite alias
# resolves the specifier to ../vault/labelstore.ts, so the sibling
# sources land at /src/vault where that bridge answers inside the
# container (the app-only context left the import unloadable and the
# vite step died on labels.ts).
COPY vault/ /src/vault/
# the saddle sibling of the execution frontier: runner.ts reads
# @wenathlan/saddle/modes and the workload lane reads
# @wenathlan/saddle/workloadlaw through the ../saddle vite aliases, so
# the sibling sources land at /src/saddle the same way (sources only).
COPY saddle/ /src/saddle/
RUN pnpm build

FROM nginxinc/nginx-unprivileged:1.29-alpine@sha256:0c79d56aee561a1d81c63f00eee5fb5fe29279560cdc55e91425133104c7fbe6

ARG FORGE_VERSION=2.0.155

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
