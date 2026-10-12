# getry

AI gateway. Five provider gateways (v1 zai, v2 babel, v3 nvidia, v4 opencode+kilo, v5 openrouter) serve 35 OpenAI-compatible routes with the 7-level thinking system, the session store and the key rotation; `schema.prisma` describes the database the gateway lanes consume. This folder receives the getry application per the complete tree.

---

# The Sol theme

# Getry Sol

Getry is the AI gateway application of the DevThink family: provider gateways, route maps, reasoning budgets, session contexts and key pools under one gateway shell. This Sol theme is its web surface — a Vite + React SPA whose home, versions, thinking and sessions routes render from the same database that `schema.prisma` describes.

```bash
pnpm install
pnpm dev
```

---

# The family contract (wave 6-a)

- `family.ts` — the single table of the eight siblings beside getry with the
  spec §12 accent of each one; the shell rail foot and `tests/family.test.ts`
  both consume this one table.
- `familyurl.ts` — the verbatim relative-url contract (`"../" + slug + "/"`,
  consolidated to the family variant) that keeps every cross-app link
  mount-proof.
- `restore:entry` — the entry-face guard: a no-op while `index.html` rides the
  source face (`./App.tsx`), a restore from HEAD otherwise, and a refusal
  (exit 1, nothing touched) while HEAD itself is not the source face. Run it
  after any local `vite build` — the build rewrites the entry to the hashed
  face by design.
- The root build emits hashed bundles into the app folder (publish contract
  `.`); `.gitignore` bars every hashed emit (`index-*`, `favicon-*`,
  `manifest-*`, `icon-*`), so the tree keeps the source faces only.
