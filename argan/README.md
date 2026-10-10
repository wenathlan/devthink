# argan

DNS and gateway library. Zones, records, dnssec and handshake. The system network library; each site shares the unified database. This folder receives the argan application per the complete tree.

---

# The Sol theme

# Argan Sol

Argan is the DNS and gateway library of the DevThink family: authoritative zones with DNSSEC signing and a gateway that serves the same zones over classic port 53, DoT, DoH, DoQ, DoH3, DNSCrypt and ODoH. This Sol theme is the web surface of that stack — a Vite + React SPA whose routes (home, zones, dnssec, gateway, settings) render from the same sqlite database that `db.ts`, `schema.prisma` and `drizzle.config.ts` describe.

```bash
pnpm install
pnpm dev
```

---

# The family contract (wave 6-a)

- `family.ts` — the single table of the eight siblings beside argan with the
  spec §12 accent of each one; the shell rail foot, the landing footer and
  `tests/family.test.ts` all consume this one table.
- `familyurl.ts` — the verbatim relative-url contract (`"../" + slug + "/"`)
  that keeps every cross-app link mount-proof.
- `restore:entry` — the entry-face guard: a no-op while `index.html` rides the
  canonical source face (the `./App.tsx` script plus the font triad link), a
  restore from HEAD otherwise, and a refusal (exit 1, nothing touched) while
  HEAD itself is not the canonical face. Run it after any local `vite build` —
  the build rewrites the entry to the hashed face by design. Until the
  source-face fix lands in a commit, HEAD carries the stale pre-triad face, so
  the guard refuses instead of restoring an older face over the fix.
- The root build emits hashed bundles into the app folder (publish contract
  `.`); `.gitignore` bars every hashed emit (`index-*`, `favicon-*`,
  `manifest-*`, `icon-*`), so the tree keeps the source faces only.
