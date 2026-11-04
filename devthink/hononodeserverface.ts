/**
 * @file hononodeserverface.ts
 * @module gateway/hononodeserverface
 * @description
 *  The dual-seat face of the hono node adapter (the gateway ownership
 *  wave, wave/ownership.gateway): the gateway transport the getry seat
 *  owns boots through the published specifier
 *  ("@hono/node-server"), and the os lanes that pin this app's tsconfig
 *  resolve the specifier onto THIS file — one candidate answers both
 *  seats the tsconfig serves. The tsx subprocess lanes (the cli and e2e
 *  runners that boot the moved sources) load the real adapter entry
 *  through the relative node_modules path below, the one resolution
 *  node's walk from the moved sources never finds (the os lanes never
 *  install the getry tree); the tsc pass reads the adjacent declaration
 *  the package ships beside the entry (the adapter carries its types
 *  beside the runtime the cors face's separated types tree does not).
 *  Retires when the published hono envelope ships its declarations
 *  beside the runtime entries.
 *
 *  Architectural constraints:
 *   - One face per specifier: this file owns the bare "@hono/node-server"
 *     seat alone (the serve-static subpath rides its own face, the hono
 *     core family theirs).
 *   - Verbatim values: the exported boot IS the serve the node adapter
 *     ships, never a reimplementation — the face only carries the
 *     resolution seats.
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

/* the runtime seat — the real adapter entry of the installed
 * @hono/node-server: the mjs import answers the tsx lanes, and the
 * adjacent .d.mts declaration the package ships beside it types the
 * import for the tsc pass (no suppression rides this line — the cors
 * face carries the one suppression the separated hono types tree
 * demands). */
import { serve as serveruntime } from "./node_modules/@hono/node-server/dist/index.mjs";

/** serve — the same boot the node adapter ships, typed by the adjacent
 * declaration the package carries. */
export const serve = serveruntime;
