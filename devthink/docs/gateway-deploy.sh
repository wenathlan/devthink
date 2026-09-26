#!/usr/bin/env bash
# deploy.sh — the one deployment script for the gateway interface
# (the former deploy-vercel.sh and deploy-netlify.sh were the same
# context — install, generate, build, platform deploy — so they are
# embedded here as branches of a single file).
#
# usage:  ./scripts/deploy.sh [vercel|netlify]   (default: vercel)
# lives in scripts/ per skill — non-js scripts in scripts folder
# uses relative paths so works standalone no workspace dependency
# rejects vercel/netlify functions per skill — standalone node process
# serving the vite build
# prerequisites: VERCEL_TOKEN / NETLIFY_AUTH_TOKEN env vars and the
# matching platform cli installed
set -euo pipefail
gatewayroot="$(cd "$(dirname "$0")/.." && pwd)"
cd "$gatewayroot"
platform="${1:-vercel}"

echo "[deploy] platform=${platform} root=${gatewayroot}"

case "$platform" in
  vercel)
    if ! command -v vercel >/dev/null 2>&1; then
      echo "[deploy] ERROR vercel cli not found — install with: npm i -g vercel"
      exit 1
    fi
    echo "[deploy] installing deps..."
    bun install
    echo "[deploy] generating prisma client..."
    bun run db:generate
    echo "[deploy] building the web console..."
    bun run build
    echo "[deploy] deploying to vercel..."
    if [ -n "${VERCEL_TOKEN:-}" ]; then
      vercel deploy --prod --token "$VERCEL_TOKEN" --yes
    else
      vercel --prod --yes
    fi
    ;;
  netlify)
    if ! command -v netlify >/dev/null 2>&1; then
      echo "[deploy] ERROR netlify cli not found — install with: npm i -g netlify-cli"
      exit 1
    fi
    echo "[deploy] installing deps..."
    bun install
    echo "[deploy] generating prisma client..."
    bun run db:generate
    echo "[deploy] building the web console..."
    bun run build
    echo "[deploy] deploying to netlify..."
    if [ -n "${NETLIFY_AUTH_TOKEN:-}" ]; then
      netlify deploy --prod --auth "$NETLIFY_AUTH_TOKEN"
    else
      netlify deploy --prod
    fi
    ;;
  *)
    echo "usage: $0 <vercel|netlify>"
    echo "default: vercel"
    exit 1
    ;;
esac

echo "[deploy] done"
