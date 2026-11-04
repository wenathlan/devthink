/**
 * @file honoservestaticface.ts
 * @module gateway/honoservestaticface
 * @description
 *  The dual-seat face of the hono node-adapter serve-static subpath (the
 *  gateway ownership wave, wave/ownership.gateway): the gateway transport
 *  the getry seat owns imports the static file middleware through the
 *  published specifier ("@hono/node-server/serve-static"), and the os
 *  lanes that pin this app's tsconfig resolve the specifier onto THIS
 *  file — one candidate answers both seats the tsconfig serves. The tsx
 *  subprocess lanes (the cli and e2e runners that boot the moved
 *  sources) load the real middleware through the relative node_modules
 *  path below, the one resolution node's walk from the moved sources
 *  never finds (the os lanes never install the getry tree); the tsc pass
 *  reads the adjacent declaration the package ships beside the entry.
 *  Retires when the published hono envelope ships its declarations
 *  beside the runtime entries.
 *
 *  Architectural constraints:
 *   - One face per specifier: this file owns
 *     "@hono/node-server/serve-static" alone — no other hono subpath
 *     resolves here.
 *   - Verbatim values: the exported middleware IS the serveStatic the
 *     node adapter ships, never a reimplementation — the face only
 *     carries the resolution seats.
 *
 * Version: 2.1.8 — the ownership wave hono seat bridge
 *
 * Related modules:
 *  - tsconfig.json — the hono seat bridge that resolves the specifier here
 *  - ../getry/server.ts — the owner transport that imports the family
 *
 * @author devthink
 * @license MIT
 */

/* the runtime seat — the real serve-static entry of the installed
 * @hono/node-server: the mjs import answers the tsx lanes, and the
 * adjacent .d.mts declaration the package ships beside it types the
 * import for the tsc pass (no suppression rides this line — the cors
 * face carries the one suppression the separated hono types tree
 * demands). */
import { serveStatic as servestaticruntime } from "./node_modules/@hono/node-server/dist/serve-static.mjs";
import type { serveStatic as servestatictypes } from "./node_modules/@hono/node-server/dist/serve-static.d.mts";

/** serveStatic — the same middleware the node adapter ships, typed by the
 * adjacent declaration the package carries. */
export const serveStatic: typeof servestatictypes = servestaticruntime;
