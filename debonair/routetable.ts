// # routetable — the route table of the debonair gateway lane, carved out
// as the leaf module of the family ownership law (the wave 2d
// regrouping): the nineteen routes the family audio gateway serves, the
// handler names the table may name, and the pure matchers that walk one
// method + path against the table. The debonair app is the owner of the
// audio gateway (the engine owner of the kathesis graph), and this module
// is the contract's lightest face — the family law the vault routes.ts
// leaf rides: the module declares zero imports (no engine modules, no
// worker graphs, no storage singletons, nothing of the kathesis import
// closure), so any face may import it freely — the gateway server
// (gatewayapi.ts rides the same table through this leaf and keeps its
// handlers), the tests, and the sibling apps through the published
// library specifier ("@wenathlan/debonair/routetable"). The getry lane
// (debonairlane.ts) imports the table through that specifier instead of
// mirroring the rows: the mirror era is over — the day the library
// exports the table has arrived, and the rows answer the same strings
// from the owner's own source, so the lane sees the real table (every
// row, the real handler names) and the route strings are never duplicated
// inside a sibling app.

/** The handler names the route table may name — the catalog seat at the
 * bottom of gatewayapi.ts answers every one (the compile-time lockstep:
 * a table row cannot name a handler the catalog forgot). */
export type GatewayHandlerName =
  | "uploadIngest"
  | "getIngestJob"
  | "listIngestShelf"
  | "getIngest"
  | "deleteIngest"
  | "getBlob"
  | "mineProfile"
  | "listProfiles"
  | "getProfile"
  | "queueRender"
  | "getRenderJob"
  | "queueRecon"
  | "getReconJob"
  | "publishTrack"
  | "listTracks"
  | "queueGenerateRender"
  | "getGenerateJob"
  | "publishTrackById"
  | "listVitrine";

/** One row of the route catalog — the method, the path pattern and the
 * handler name (the family route shape vault/api.ts rides, grown with the
 * method and the pattern the param routes need). */
export interface RouteSpec {
  /** The http method the row answers. */
  method: "GET" | "POST" | "DELETE";
  /** The path pattern — a ":name" segment captures one path parameter. */
  path: string;
  /** The handler seat the row dispatches to. */
  handler: GatewayHandlerName;
}

/** The route catalog of the debonair gateway lane — the nineteen routes
 * the family gateway serves: the ingest job lane (the upload, the
 * progress query, the shelf, the read, the removal), the blob stream,
 * the miner lane (the profile mine, the vitrine list, the profile read),
 * the render lane (the plan queue the generate page posts, the render
 * job the meter polls), the recon lane (the reconstruction queue and the
 * job poll the player's ladder rides), the tracks lane (the publish, the
 * vitrine list) and the generate lane's own four spellings (the render
 * queue, the job poll, the track publish by id and the vitrine surface
 * the automation seats — the mcplane agent, the getry lane — ride). The
 * more specific rows ride first (the jobs route before the document :id
 * route, the mine route before the profile :genre route) — the first
 * match wins and the table order is the law. */
export const routes: readonly RouteSpec[] = [
  { method: "POST", path: "/api/v1/ingest/upload", handler: "uploadIngest" },
  { method: "GET", path: "/api/v1/ingest/jobs/:id", handler: "getIngestJob" },
  { method: "GET", path: "/api/v1/ingest", handler: "listIngestShelf" },
  { method: "GET", path: "/api/v1/ingest/:id", handler: "getIngest" },
  { method: "DELETE", path: "/api/v1/ingest/:id", handler: "deleteIngest" },
  { method: "GET", path: "/api/v1/blob/:id", handler: "getBlob" },
  { method: "POST", path: "/api/v1/profiles/mine", handler: "mineProfile" },
  { method: "GET", path: "/api/v1/profiles", handler: "listProfiles" },
  { method: "GET", path: "/api/v1/profiles/:genre", handler: "getProfile" },
  { method: "POST", path: "/api/v1/render", handler: "queueRender" },
  { method: "GET", path: "/api/v1/render/jobs/:id", handler: "getRenderJob" },
  { method: "POST", path: "/api/v1/recon", handler: "queueRecon" },
  { method: "GET", path: "/api/v1/recon/jobs/:id", handler: "getReconJob" },
  { method: "POST", path: "/api/v1/tracks", handler: "publishTrack" },
  { method: "GET", path: "/api/v1/tracks", handler: "listTracks" },
  { method: "POST", path: "/api/v1/generate/render", handler: "queueGenerateRender" },
  { method: "GET", path: "/api/v1/generate/jobs/:id", handler: "getGenerateJob" },
  { method: "POST", path: "/api/v1/tracks/:id/publish", handler: "publishTrackById" },
  { method: "GET", path: "/api/v1/vitrine", handler: "listVitrine" },
];

/** @section match — the path matcher and the dispatch verdict */

/** Decodes one url-encoded path segment, falling back to the raw text on
 * a malformed escape (the vault safeDecode law). */
function safedecode(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

/**
 * Matches one path against one pattern — hand-rolled and deterministic:
 * no regex, no lookarounds, the segment count must match exactly, a
 * literal segment must equal, a ":name" segment captures (an empty
 * capture never matches — a route param always carries a value). The
 * caller owns the url parse (the vault handle law): the path rides the
 * pathname alone, no query string, no trailing-slash folding.
 *
 * @param pattern the route pattern.
 * @param path the concrete request path.
 * @returns the captured params, or null when the path does not match.
 */
export function matchpath(pattern: string, path: string): Record<string, string> | null {
  const parts = pattern.split("/");
  const segments = path.split("/");
  if (parts.length !== segments.length) return null;
  const params: Record<string, string> = {};
  for (let index = 0; index < parts.length; index++) {
    const part = parts[index];
    if (part.startsWith(":")) {
      if (segments[index] === "") return null;
      params[part.slice(1)] = safedecode(segments[index]);
    } else if (part !== segments[index]) {
      return null;
    }
  }
  return params;
}

/** The dispatch verdict of one request against the table: "routed" (a row
 * matched the method and the path — the params ride along), "method" (the
 * path matches at least one row but the method answers none of them — the
 * 405 shape) or "absent" (no row matches the path — the 404 shape). */
export type RouteVerdict =
  | { kind: "routed"; route: RouteSpec; params: Record<string, string> }
  | { kind: "method"; allowed: readonly string[] }
  | { kind: "absent" };

/**
 * Matches one method + path against the route table — deterministic: the
 * first row whose pattern matches wins; a path that only matches rows of
 * other methods answers the method verdict with the methods the table
 * would have answered; a path no row matches answers absent.
 *
 * @param method the http method (any case — the match normalizes).
 * @param path the request path.
 * @returns the verdict.
 */
export function matchroute(method: string, path: string): RouteVerdict {
  const verb = method.trim().toUpperCase();
  const allowed: string[] = [];
  for (const route of routes) {
    const params = matchpath(route.path, path);
    if (params === null) continue;
    if (route.method === verb) return { kind: "routed", route, params };
    allowed.push(route.method);
  }
  return allowed.length > 0 ? { kind: "method", allowed } : { kind: "absent" };
}
