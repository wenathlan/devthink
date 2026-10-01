# forge

deployable clone of execution only (the sandbox): runs any binary with the Saddle engine and stores nothing.

House tree: one folder per app, no src/ — the app root carries only the loose .ts logics, docs/ and tests/, and the theme folder (Sol/) carries the whole design: App.tsx (the router), index.html, Sol/sol.css, the shared shell, one folder per page with loose TSX components, and the platform deploy copies. The complete site archive and the Next conversions (done by the workflow, no folder duplication) travel as tar.xz assets in the release.

---

# The Sol theme

Forge is the CI and build application of the DevThink family: a sandbox runner surface that registers runners, records run logs and reports outcomes over https. This Sol theme is its web surface — a Vite + React SPA rendering the runner inventory from the same sqlite database that `schema.prisma` and `drizzle.config.ts` describe.

```bash
pnpm install
pnpm dev
```
