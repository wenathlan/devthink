/**
 * honoshim — the browser face of the hono node adapter (the serve and
 * serve-static seats the dev server graph never calls).
 *
 * The devthink dev server walks the gateway graph through the published
 * faces ("@wenathlan/getry/server" re-exports the config helpers the
 * browser consumes), and the walk reaches the node adapter the transport
 * boots on node: "@hono/node-server" and its serve-static subpath. The
 * real adapter probes the node version at module scope (the
 * process.versions.node read the readable-to-web gate answers), and the
 * browser bundle dies at import time — the whole os blanks before the
 * first component mounts (the failed-to-fetch lamp, no console line).
 *
 * This module answers the honest refusal the family doctrine pins:
 * nothing server-only is faked. The serve and serveStatic exports the
 * browser graph links against resolve to functions that throw the same
 * way they would on a host without the adapter — called, never imported
 * — because no browser lane ever boots the transport (the gateway rides
 * the node lanes the dev script and the cli spawn; the browser speaks
 * the same-origin http the proxy carries). The node lanes keep
 * resolving the real adapter untouched: this face only rides the vite
 * dev-server resolution the devthink nodebuiltinshim plugin pins.
 *
 * Architectural constraints:
 *  - One face per specifier: the bare "@hono/node-server" seat and its
 *    serve-static subpath both resolve here, no other hono family
 *    member does (the hono core, cors and ws faces keep their own
 *    bridges the vite config carries).
 *  - Verbatim surface: the export names mirror the adapter's own (serve,
 *    serveStatic, the default), so the importers' named imports link
 *    without a runtime error — only the call answers the refusal.
 *
 * Version: 2.0.161 — the dev boot heal (the hono seat browser face)
 *
 * Related modules:
 *  - devthink/vite.config.ts — the nodebuiltinshim resolveId that pins
 *    the two adapter specifiers onto this face for the browser graph
 *  - server.ts — the gateway transport that boots the real adapter on
 *    the node lanes
 *
 * @author getry
 * @license MIT
 */

/** serve — the adapter's boot: refuses on the browser host.
 *
 * @param args the arguments the node lane would pass (never read).
 * @returns never — the throw below answers every call.
 */
export function serve(...args: unknown[]): never {
  void args;
  throw new Error("[getry browser face] @hono/node-server serve is absent on this host — the gateway boots on the node lanes");
}

/** serveStatic — the adapter's static middleware: refuses on the browser host.
 *
 * @param args the options the node lane would pass (never read).
 * @returns never — the throw below answers every call.
 */
export function serveStatic(...args: unknown[]): never {
  void args;
  throw new Error("[getry browser face] @hono/node-server serveStatic is absent on this host — the static serving boots on the node lanes");
}

export default serve;
