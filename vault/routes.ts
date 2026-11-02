// # routes — the route catalog of the vault http surface, carved out as
// the client-safe module of the family health law: the sites (forge,
// foundry) re-export this catalog through the published library specifier
// ("@wenathlan/vault/routes") instead of duplicating the route strings,
// the ownership law the family carries. The module declares no engine
// imports — no node:http, no storage singletons — so any face (browser or
// node) may import it freely; the server (api.ts) rides the same catalog
// and keeps its handlers, and the barrel keeps spreading ./api unchanged.

/** the route catalog of the vault http surface (health kept verbatim from the declaration it grew from). */
export const routes = {
  health: "/api/health",
  uicopy: "/api/v1/ui/copy",
  signup: "/api/v1/auth/signup",
  signin: "/api/v1/auth/signin",
  projects: "/api/v1/storage/projects",
  objects: "/api/v1/storage/objects",
  quota: "/api/v1/storage/quota",
  usage: "/api/v1/storage/usage",
  sweep: "/api/v1/storage/sweep",
} as const;
