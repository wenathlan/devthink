# vault

deployable clone of storage only (the network DB): keeps every site database and receives the data backups.

House tree: one folder per app, no src/ — the app root carries only the loose .ts logics, docs/ and tests/, and the theme folder (Sol/) carries the whole design: App.tsx (the router), index.html, sol.css (the theme stylesheet living inside Sol/), the shared shell, one folder per page with loose TSX components, and the platform deploy copies. The complete site archive and the Next conversions (done by the workflow, no folder duplication) travel as tar.xz assets in the release.

---

# The Sol theme

# Vault Sol

Vault is the storage library of the DevThink family: the self-hosted supabase clone holding projects, accounts and storage objects served over https. This Sol theme is its web surface — a Vite + React SPA rendering the storage inventory from the same sqlite database that `schema.prisma` and `drizzle.config.ts` describe.

```bash
pnpm install
pnpm dev
```
