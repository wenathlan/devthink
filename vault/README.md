# vault

deployable clone of storage only (the network DB): keeps every site database and receives the data backups.

House tree: one folder per app, no src/ — the app root carries only the loose .ts logics, docs/ and tests/, and the theme folder (Sol/) carries the whole design: App.tsx (the router), index.html, sol.css (the theme stylesheet living inside Sol/), the shared shell, one folder per page with loose TSX components, and the platform deploy copies. The complete site archive and the Next conversions (done by the workflow, no folder duplication) travel as tar.xz assets in the release.

## The library face (the npm exports)

Vault is the storage library of the family, and storage answers the family ownership law as a published library: any consumer — a sibling app, an embedder, a script — imports the engine through `@wenathlan/vault` subpaths instead of ever reimplementing a store. The package.json exports map answers one subpath per root module with the family publish shape (the `types`/`import`/`default` conditions over the root source files, the same source doctrine `@wenathlan/getry/thinking` and the debonair engine ride — no build step, the source is the library, the node 26 pin runs the erasable-typescript sources natively), the npm files array packs every exported module with its local import closure, and `tests/package.test.ts` pins the whole contract: every declared target exists, imports in Node, ships in the files list, and the barrel carries the engine.

The boot law of the map: `./db` and `./drizzle` open their self-hosted sqlite connections at import time (`DATABASE_URL` and `VAULT_STORAGE_URL`, both overridable, both defaulting to a file: store beside the working directory), and `./api`, `./objectsledger` and `./quota` ride `./drizzle` transitively — so the barrel `@wenathlan/vault` boots the engine. A consumer that wants the pure surfaces without the connections rides the deep specifiers instead: `./storage`, `./sha`, `./chunks`, `./objects`, `./buckets`, `./retention`, `./labels`, `./onboardingstate`, `./family`, `./familyurl`, `./hometypes`, `./utils`.

| Subpath | What it answers |
| --- | --- |
| `@wenathlan/vault` | the barrel — the whole public surface in one import (boots the engine) |
| `@wenathlan/vault/api` | the http surface — `createVaultServer`, `listenVault`, the token gate `tokenVerdict` and the storage `routes` over pure node:http |
| `@wenathlan/vault/buckets` | the bucket shelf — the retention groups, their policies and the per-bucket census |
| `@wenathlan/vault/chunks` | the 256KB chunk pipeline — `split`/`reassemble`, `encodeChunk`/`decodeChunk`, the manifest law, `CHUNK_BYTES` and the `VaultChannel` contract |
| `@wenathlan/vault/db` | the site store — the better-sqlite3 bootstrap and the parameterized helpers (boots at import) |
| `@wenathlan/vault/drizzle` | the executing schema — the drizzle tables, `openStorage`/`closeStorage` and `storageDriverKind` (boots at import) |
| `@wenathlan/vault/family` | the family table — `FAMILY_SLUGS` and the spec §12 accents of `FAMILY_ACCENTS` |
| `@wenathlan/vault/familyurl` | the two-way family door — `familyurl` resolves the deploy-unit urls |
| `@wenathlan/vault/hometypes` | the home page types — `HomeProps` |
| `@wenathlan/vault/labels` | the copy law — `LABEL_MANIFEST`, the typed accessor `label` and the seed |
| `@wenathlan/vault/objects` | the sealed rehearsal ledger — deterministic from the seed, honest about being a rehearsal |
| `@wenathlan/vault/objectsledger` | the real object ledger — `putObject`, `getObject`, `deleteObject`, `sweepOrphans` and `storageCensus` |
| `@wenathlan/vault/onboardingstate` | the entry-flow accessor — the visitor's seen flags, one writer only |
| `@wenathlan/vault/quota` | the quota engine — `quotaVerdict`, the limit rows and `QUOTA_FLOOR_BYTES` |
| `@wenathlan/vault/retention` | the retention clock — `retentionVerdicts`, the `sweepPlan` and the timeline ticks |
| `@wenathlan/vault/sha` | the real digest engine — `sha256Hex`, `sha1Hex` and the hex shape gates |
| `@wenathlan/vault/storage` | the storage contracts — the LFS pointer law, the record gate and the channel chooser |
| `@wenathlan/vault/utils` | the shared word splitter — `splitwords` |

A sibling app consumes the engine the way it consumes saddle for sandboxes and getry for thinking:

```ts
import { createVaultServer, putObject, sha256Hex, quotaVerdict } from "@wenathlan/vault";
// or the pure surfaces without the sqlite boot:
import { sha256Hex } from "@wenathlan/vault/sha";
import { split } from "@wenathlan/vault/chunks";
```

---

# The Sol theme

# Vault Sol

Vault is the storage library of the DevThink family: the self-hosted supabase clone holding projects, accounts and storage objects served over https. This Sol theme is its web surface — a Vite + React SPA rendering the storage inventory from the same sqlite database that `schema.prisma` and `drizzle.config.ts` describe.

```bash
pnpm install
pnpm dev
```
