/**
 * vite config — gateway web build (root first no src per skill)
 * lives inside web/ — the interface folder is self-contained and
 * deploy-ready: index.html app.tsx config.ts globals.css and the
 * platform manifests (vercel.json netlify.toml) all sit together
 *
 * builds the react ui to ../dist for the hono node server to serve
 * dev server proxies /api to the standalone hono server on same port
 */

import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const rootdir = import.meta.dirname ?? ".";

export default defineConfig({
  plugins: [react()],
  root: ".",
  publicDir: "public",
  build: {
    outDir: path.resolve(rootdir, "..", "dist"),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(rootdir),
    },
  },
  server: {
    port: 3001,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
