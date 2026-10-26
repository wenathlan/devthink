/**
 * @file prismashim.ts
 * @module engine/prismashim
 * @description
 *  The browser face of the prisma client edge. The lazy db surface of
 *  storagefamily.ts speaks a dynamic import("@prisma/client") on the first
 *  database touch, and the browser condition of that package lands on
 *  index-browser.js — a bare require of the generated .prisma/client that
 *  only exists after prisma generate, so a fresh checkout (the runner)
 *  refused the whole web bundle at build time while the local machines kept
 *  passing by resolving a generated client their environments happened to
 *  carry. The browser never touches the real client (the os HD is the
 *  IndexedDB store of storagefamily.ts §db): the vite shim plugin resolves
 *  every @prisma/client and .prisma/client specifier onto this one honest
 *  module, whose PrismaClient throws the same way a host without the client
 *  would — nothing server-only is faked, and the node and cli lanes keep
 *  the real client untouched (this module only ever serves the vite browser
 *  build).
 *
 *  @section prismaclient — the throwing PrismaClient face
 *  @depends-on the vite resolveId hook in vite.config.ts
 *  @consumed-by storagefamily.ts (the lazy db proxy, through the shim plugin)
 */

// ---------------------------------------------------------------------------
// @section prismaclient — the throwing PrismaClient face
// ---------------------------------------------------------------------------

export class PrismaClient {
  constructor() {
    throw new Error(
      "[devthink browser bundle] @prisma/client PrismaClient is absent on this host — the browser answers the IndexedDB store of storagefamily.ts §db",
    );
  }
}

/** the cjs interop face: a commonjs @prisma/client resolution exposes the
 * class on the default export, so the lazy db proxy of storagefamily.ts
 * accepts both spellings the same way it does against the real client */
export default { PrismaClient };
