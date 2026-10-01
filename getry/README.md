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
