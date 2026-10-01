# foundry

complete deployable clone (sandbox + DB): runs, is the sandbox and keeps the network databases.

House tree: one folder per app, no src/ — the app root carries only the loose .ts logics, docs/ and tests/, and the theme folder (Sol/) carries the whole design: App.tsx (the router), index.html, index.css, the shared shell, one folder per page with loose TSX components, and the platform deploy copies. The complete site archive and the Next conversions (done by the workflow, no folder duplication) travel as tar.xz assets in the release.

---

# The Sol theme

Foundry is the pipeline application of the DevThink family: the e2b and docker clone interface whose engine lives in saddle, while foundry owns the surface records (sandboxes and images). This Sol theme is its web surface — a Vite + React SPA rendering the pipeline state from the same sqlite database that `schema.prisma` and `drizzle.config.ts` describe.

```bash
pnpm install
pnpm dev
```
