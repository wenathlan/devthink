# foundry 2.0.165 — THE SITE CONTAINER FILE
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
FROM --platform=$BUILDPLATFORM node:26-alpine@sha256:40cd011b55415bc894e45b02fdd5a5dfde056921b7d23a64c74f80497af48797 AS solbuild

ARG FOUNDRY_VERSION=2.0.165

# The family context fix (the staged shape the site containers read): the
# application rides the context nested under app/ with the sibling sources
# the vite alias bridges resolve beside it.
WORKDIR /src/app
COPY app/package.json app/pnpm-lock.yaml app/pnpm-workspace.yaml ./
COPY app/pnpmboot.package.json /tmp/pnpmboot/package.json
COPY app/pnpmboot.package-lock.json /tmp/pnpmboot/package-lock.json
RUN apk add --no-cache python3 make g++ \
 && npm ci --prefix /tmp/pnpmboot --no-fund --no-audit \
 && ln -sf /tmp/pnpmboot/node_modules/.bin/pnpm /usr/local/bin/pnpm \
 && pnpm install --frozen-lockfile --ignore-scripts
COPY app/ .
# the copy-law vault sibling: the label store, routes and utils bridges resolve the ../vault aliases, so the sibling sources land at /src/vault where those bridges answer inside the container.
COPY vault/ /src/vault/
# the saddle sibling of the engine ownership: the pipeline sources import the sandbox and the modes through the @wenathlan/saddle bridges and the vite aliases resolve the specifiers to ../saddle/sandbox.ts and ../saddle/modes.ts, so the sibling sources land at /src/saddle where those bridges answer inside the container (sources only - the build never installs the sibling, the aliases read the .ts files).
COPY saddle/ /src/saddle/
RUN pnpm build

FROM nginxinc/nginx-unprivileged:1.29-alpine@sha256:0c79d56aee561a1d81c63f00eee5fb5fe29279560cdc55e91425133104c7fbe6

ARG FOUNDRY_VERSION=2.0.165

LABEL org.opencontainers.image.title="foundry" \
      org.opencontainers.image.description="foundry — the run and store site role of the network: the containers and the buckets under one console." \
      org.opencontainers.image.version="${FOUNDRY_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink" \
      org.opencontainers.image.documentation="https://github.com/wenathlan/devthink/tree/main/foundry"

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
