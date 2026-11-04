/**
 * @file honocorsface.ts
 * @module gateway/honocorsface
 * @description
 *  The dual-seat face of the hono cors subpath (the gateway ownership
 *  wave, wave/ownership.gateway): the gateway transport the getry seat
 *  owns imports the cors middleware through the published specifier
 *  ("hono/cors"), and the os lanes that pin this app's tsconfig resolve
 *  the specifier onto THIS file — one candidate answers both seats the
 *  tsconfig serves. The tsx subprocess lanes (the cli and e2e runners
 *  that boot the moved sources) load the real middleware through the
 *  relative node_modules path below, the one resolution node's walk from
 *  the moved sources never finds (the os lanes never install the getry
 *  tree); the tsc pass reads the type the re-export pins from the
 *  declaration tree the package ships. Retires when the published hono
 *  envelope ships its declarations beside the runtime entries.
 *
 *  Architectural constraints:
 *   - One face per specifier: this file owns "hono/cors" alone, the way
 *     saddlefaces.ts owns the saddle library face for the typecheck
 *     build — no other hono subpath resolves here.
 *   - Verbatim values: the exported factory IS the cors hono ships, never
 *     a reimplementation — the face only carries the resolution seats.
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

/* the runtime seat — the real cors entry of the installed hono family:
 * the js import answers the tsx lanes (the declaration tree ships under
 * dist/types, not beside the entry, so the tsc suppression rides the
 * line and the typed re-export below carries the type the program
 * reads). */
// @ts-ignore — the runtime entry carries no adjacent declaration (the types tree ships under dist/types; whichever declaration face a program resolves the line onto, the typed re-export below carries the type)
import { cors as corsruntime } from "./node_modules/hono/dist/middleware/cors/index.js";
import type { cors as corstypes } from "./node_modules/hono/dist/types/middleware/cors/index.d.ts";

/** cors — the same middleware factory hono ships, typed by the
 * declaration tree the package carries. */
export const cors: typeof corstypes = corsruntime;
