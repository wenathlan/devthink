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
