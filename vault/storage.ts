/**
 * storage — consolidated storage engine logics of the vault family.
 * @module storage
 * @family wave/logicfold2
 * @layer blob — the top of the storage stack: bucket → object → chunk → blob.
 *
 * One keyed file per family: the former variant arms (storagelane)
 * retired into this seat with every export preserved under the same name,
 * and the wave/db-vault-subpath seat answered the family law the other
 * way — the sqlite mechanism is a family of its own now, and its keyed
 * file is storagelane.ts (the factory owner the family db seats consume:
 * the seven riding siblings through the published subpath, the vault
 * itself as its own seat, getry's mirror through the computed dynamic
 * import, the saddle node through the monorepo source seat). this
 * seat keeps the blob-storage consolidation whole: the render-leaf
 * contract face and the sqlite factory, both re-exported under the same
 * names, so every published export keeps answering here exactly as the
 * envelope always carried it.
 */

/* the render-leaf law (the debonair precedent): the pure contract face
 * answers in its own leaf (storageface.ts — the record types, the pointer
 * document, the digest discipline, the channel verdict, zero database
 * imports) so the browser graph of the family pages reaches the contract
 * without the native binding; this seat re-exports the leaf whole so every
 * published export keeps answering under the same name. */
export * from "./storageface.ts";

/* the storage lane (storagelane.ts — the sqlite factory owner of the
 * family, keyed by the wave/db-vault-subpath seat): the better-sqlite3
 * bootstrap, the parameterized helpers and the statement cache every
 * family app rides. re-exported whole under the same names so every
 * consumer of this seat — the vault's own db star, the querylane seat and
 * the bridged siblings that cite the "./storage" subpath — keeps
 * answering without a change. */
export * from "./storagelane.ts";
