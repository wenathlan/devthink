/**
 * @file honoface.ts
 * @module gateway/honoface
 * @description
 *  The dual-seat face of the bare hono package (the gateway ownership
 *  wave, wave/ownership.gateway): the gateway transport the getry seat
 *  owns imports the hono core through the published specifier ("hono"),
 *  and the os lanes that pin this app's tsconfig resolve the specifier
 *  onto THIS file — one candidate answers both seats the tsconfig
 *  serves. The tsx subprocess lanes (the cli and e2e runners that boot
 *  the moved sources) load the real core entry through the relative
 *  node_modules path below, the one resolution node's walk from the
 *  moved sources never finds (the os lanes never install the getry
 *  tree); the tsc pass reads the declarations the type imports pin from
 *  the types tree the package ships (the core entry carries no adjacent
 *  declaration, so the suppression rides the runtime line and the typed
 *  re-exports below carry the program). Retires when the published hono
 *  envelope ships its declarations beside the runtime entries.
 *
 *  Architectural constraints:
 *   - One face per specifier: this file owns the bare "hono" seat alone
 *     (the cors subpath rides its own face, the node adapter family
 *     theirs).
 *   - Verbatim values: the exported class IS the Hono hono ships, never
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

/* the runtime seat — the real core entry of the installed hono family:
 * the js import answers the tsx lanes (the declaration tree ships under
 * dist/types, not beside the entry, so the suppression rides the line
 * and the typed re-exports below carry the type the program reads). */
// @ts-ignore — the runtime entry carries no adjacent declaration (the types tree ships under dist/types; whichever declaration face a program resolves the line onto, the typed re-exports below carry the type)
import { Hono as honoruntime } from "./node_modules/hono/dist/index.js";
import type { Context as honocontext, Hono as honoinstance } from "./node_modules/hono/dist/types/index.d.ts";
type honomodule = typeof import("./node_modules/hono/dist/types/index.d.ts");

/** Context — the hono context type the declaration tree carries. */
export type Context = honocontext;
/** Hono — the hono app instance type the declaration tree carries. */
export type Hono = honoinstance;
/** Hono — the same class hono ships (the constructor, typed by the
 * declaration tree the package carries). */
export const Hono: honomodule["Hono"] = honoruntime;
