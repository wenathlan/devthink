# vault 2.0.154 — THE ENGINE CONTAINER FILE
#
# The family container doctrine in the engine shape: the container IS the
# vault engine, not a static mirror of the source tree. Stage one (solbuild)
# installs the locked pnpm tree and runs the vite build into dist; stage two
# (enginedeps) installs the production-only dependency tree (the compiled
# better-sqlite3 seat the engine rides); stage three runs the engine itself
# — `node api.ts` serves the token-gated storage truth AND the built site
# face from /app/dist (one process, one port, zero proxies: the api.ts
# static lane owns the content types and the spa fallback). The version
# rides the ARG the metadata lockstep stamps and the OCI labels declare —
# the registry lanes pass it at build time, nothing is hardcoded beside the
# stamp.
#
# THE FAUN SEAL (the deploy safety wave): the http surface only ever serves
# the dist tree — the source root, the node_modules and the runtime sqlite
# stores (VAULT_STORAGE_URL and VAULT_UISTORE_DB, pinned under /app/data)
# never answer over http, and the api.ts static lane refuses a database
# file outright. The container refuses to boot without VAULT_TOKEN (fail
# closed, the same law the engine rides: no token, no storage truth).

FROM node:26-alpine@sha256:40cd011b55415bc894e45b02fdd5a5dfde056921b7d23a64c74f80497af48797 AS solbuild

ARG VAULT_VERSION=2.0.154

WORKDIR /src
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN apk add --no-cache python3 make g++ \
 && npm install -g --no-fund --no-audit pnpm@12.3.4 \
 && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:26-alpine@sha256:40cd011b55415bc894e45b02fdd5a5dfde056921b7d23a64c74f80497af48797 AS enginedeps

ARG VAULT_VERSION=2.0.154

# the production-only dependency tree of the engine: better-sqlite3
# compiles against the same alpine toolchain the solbuild leg installs, so
# the binary the runtime copies answers the exact platform it rides.
WORKDIR /deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN apk add --no-cache python3 make g++ \
 && npm install -g --no-fund --no-audit pnpm@12.3.4 \
 && pnpm install --prod --frozen-lockfile

FROM node:26-alpine@sha256:40cd011b55415bc894e45b02fdd5a5dfde056921b7d23a64c74f80497af48797

ARG VAULT_VERSION=2.0.154

LABEL org.opencontainers.image.title="vault" \
      org.opencontainers.image.description="vault — the storage engine of the platform: every app imports the storage from it, and only from it." \
      org.opencontainers.image.version="${VAULT_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink" \
      org.opencontainers.image.documentation="https://github.com/wenathlan/devthink/tree/main/vault"

WORKDIR /app

# the site face — the ONLY tree the http surface ever serves (the build
# output, never the source root: the faun seal).
COPY --from=solbuild /src/dist/ /app/dist/

# the engine: the erasable-typescript sources the node 26 pin runs natively
# (the source-is-the-library doctrine — api.ts and its import closure) and
# the production dependency tree with the compiled better-sqlite3 seat.
COPY --from=enginedeps /deps/node_modules/ /app/node_modules/
COPY --from=solbuild /src/api.ts /src/chunks.ts /src/drizzle.ts /src/labels.ts /src/labelstore.ts /src/objectsledger.ts /src/onboardingstate.ts /src/quota.ts /src/sha.ts /src/storage.ts /src/uistore.ts /app/

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
ENV VAULT_STATIC_DIR=/app/dist \
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
CMD ["sh", "-c", "test -n \"$VAULT_TOKEN\" || { echo 'VAULT_TOKEN is not set — the vault engine refuses to boot (pin the bearer the storage routes demand)'; exit 1; }; exec node api.ts"]
