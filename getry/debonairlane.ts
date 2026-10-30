/**
 * debonairlane.ts — the debonair api lane of the family gateway (root layer).
 *
 * getry fronts the debonair engine by contract, the way every lane of this
 * app fronts its engines: the engine (kathesis, the audio and daw engine of
 * the family) lives in the debonair app and the family consumes it as a
 * library or over the shared gateway contract — never a sibling-folder
 * import. this module carries the three seats that contract needs:
 *
 * - the route catalog: the thirteen debonair routes (the ingest job lane,
 *   the blob stream, the miner lane, the generate lane) mirrored from the
 *   debonair gateway table — the published @wenathlan/debonair envelope
 *   carries the docs and the tests today, so the rows are mirrored the same
 *   honest way the family accents mirror the devthink table: the strings
 *   are the contract, and the day the library exports the table the rows
 *   answer the same strings (the lockstep is the published contract, not
 *   the import).
 * - the mount adapter: the translation between the debonair gateway
 *   request/answer contract and the server shape this gateway speaks (the
 *   web Request in, the web Response out — the fetch mount every lane of
 *   this gateway rides). the engine seat is injected: the deploy binds the
 *   published debonair library in-process or the forward seat over the
 *   configured origin; this module never imports the engine.
 * - the origin config: the debonair gateway origin arrives through
 *   VITE_DEBONAIR_URL (the same law VITE_ONBOARDING_URL rides) and every
 *   candidate passes the house https law (hostallowed of
 *   onboardingstate.ts) before the lane forwards a byte.
 *
 * the wire law mirrors the debonair gateway verbatim: the json lane parses
 * the body, the raw lane carries the verbatim bytes with the facts in the
 * query, the ok values serialize as the response body, the blob stream
 * answers the bytes with the pointer's kind as the content type and the
 * x-debonair-blob-* digest headers, and every failure answers the
 * standardized { error: { code, message } } shape. never a throw: a seat
 * that faults past the debonair guards answers the lane's own typed
 * refusal.
 */

import { hostallowed } from "./onboardingstate.ts";

/** one row of the debonair route catalog (the mirror of the debonair
 * gateway table — method, path pattern, handler name). */
export type DebonairRoute = {
  method: "GET" | "POST" | "DELETE";
  path: string;
  handler: string;
};

/** the thirteen debonair routes the family gateway serves (mirrored from
 * the debonair gateway table by contract): the ingest job lane (the
 * upload, the progress query, the shelf, the read, the removal), the blob
 * stream, the miner lane (the profile mine, the vitrine list, the profile
 * read) and the generate lane (the render queue, the render job progress,
 * the track publish, the vitrine list). the more specific rows ride first
 * — the first match wins and the table order is the debonair law. */
export const DEBONAIRROUTES: readonly DebonairRoute[] = [
  { method: "POST", path: "/api/v1/ingest/upload", handler: "uploadIngest" },
  { method: "GET", path: "/api/v1/ingest/jobs/:id", handler: "getIngestJob" },
  { method: "GET", path: "/api/v1/ingest", handler: "listIngestShelf" },
  { method: "GET", path: "/api/v1/ingest/:id", handler: "getIngest" },
  { method: "DELETE", path: "/api/v1/ingest/:id", handler: "deleteIngest" },
  { method: "GET", path: "/api/v1/blob/:id", handler: "getBlob" },
  { method: "POST", path: "/api/v1/profiles/mine", handler: "mineProfile" },
  { method: "GET", path: "/api/v1/profiles", handler: "listProfiles" },
  { method: "GET", path: "/api/v1/profiles/:genre", handler: "getProfile" },
  { method: "POST", path: "/api/v1/generate/render", handler: "queueRender" },
  { method: "GET", path: "/api/v1/generate/jobs/:id", handler: "getRenderJob" },
  { method: "POST", path: "/api/v1/tracks/:id/publish", handler: "publishTrack" },
  { method: "GET", path: "/api/v1/vitrine", handler: "listVitrine" },
];

/** the debonair app of the family this lane fronts (the slug of the
 * family table — the engine owner of the audio domain). */
export const DEBONAIR_APP = "debonair";

/** decodes one url-encoded path segment, falling back to the raw text on a
 * malformed escape (the vault safeDecode law, the same discipline the
 * debonair matcher rides). */
function safedecode(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

/** matches one path against one debonair pattern — hand-rolled and
 * deterministic, the debonair matcher law mirrored: the segment count must
 * match exactly, a literal segment must equal, a ":name" segment captures
 * (an empty capture never matches — a route param always carries a value),
 * and the path rides the pathname alone (no query string, no
 * trailing-slash folding).
 *
 * @param pattern the debonair route pattern.
 * @param path the concrete request path.
 * @returns the captured params, or null when the path does not match.
 */
export function matchdebonairpath(pattern: string, path: string): Record<string, string> | null {
  const parts = pattern.split("/");
  const segments = path.split("/");
  if (parts.length !== segments.length) return null;
  const params: Record<string, string> = {};
  for (let index = 0; index < parts.length; index++) {
    const part = parts[index];
    if (part === undefined) return null;
    const segment = segments[index];
    if (segment === undefined) return null;
    if (part.startsWith(":")) {
      if (segment === "") return null;
      params[part.slice(1)] = safedecode(segment);
    } else if (part !== segment) {
      return null;
    }
  }
  return params;
}

/** the mount verdict of one request against the debonair catalog:
 * "routed" (a row matched the method and the path — the lane owns the
 * request), "method" (the path matches at least one row but the method
 * answers none of them — the lane still owns the path, the debonair
 * engine answers the 405) or "absent" (no row matches — the request rides
 * the other lanes of this gateway). */
export type DebonairMountVerdict =
  | { kind: "routed"; route: DebonairRoute; params: Record<string, string> }
  | { kind: "method"; allowed: string[] }
  | { kind: "absent" };

/** matches one method + path against the debonair catalog — the lane
 * ownership seat the gateway mount loop reads: a routed or method verdict
 * hands the request to the debonair lane, an absent verdict leaves it to
 * the provider lanes.
 *
 * @param method the http method (any case — the match normalizes).
 * @param path the request path.
 * @returns the verdict.
 */
export function matchdebonairroute(method: string, path: string): DebonairMountVerdict {
  const verb = method.trim().toUpperCase();
  const allowed: string[] = [];
  for (const route of DEBONAIRROUTES) {
    const params = matchdebonairpath(route.path, path);
    if (params === null) continue;
    if (route.method === verb) return { kind: "routed", route, params };
    allowed.push(route.method);
  }
  return allowed.length > 0 ? { kind: "method", allowed } : { kind: "absent" };
}

/** the debonair gateway request contract (mirrored from the debonair
 * gateway table): the transport adapter builds it — the json lane carries
 * the parsed body object, the raw lane carries the verbatim bytes with the
 * facts in the query. */
export type DebonairGatewayRequest = {
  method: string;
  /** the pathname alone, no query string (the matcher is strict). */
  path: string;
  /** the query parameters, already decoded. */
  query: Record<string, string>;
  /** the parsed json body (null when absent, not json, or not an object). */
  json: Record<string, unknown> | null;
  /** the raw body bytes (null on the json lane). */
  raw: Uint8Array<ArrayBuffer> | null;
};

/** one debonair blob pointer (the digest row the stream route answers —
 * the same shape the debonair manifest rows carry). */
export type DebonairBlobPointer = {
  id: string;
  bytes: number;
  sha256: string;
  kind: string;
  storedAt: string;
};

/** the blob stream the debonair blob route answers (mirrored): the bytes,
 * the mime (the pointer's kind) and the pointer facts — the adapter serves
 * the bytes with the digest headers the debonair clients read back. */
export type DebonairBlobStream = {
  bytes: Uint8Array<ArrayBuffer>;
  mime: string;
  pointer: DebonairBlobPointer;
};

/** the debonair gateway answer contract (mirrored): the typed ok carries
 * the value with its status, the err carries the machine code and the
 * readable message — the wire shape is the standardized
 * { error: { code, message } } the vault surface speaks. */
export type DebonairGatewayAnswer =
  | { ok: true; status: number; value: unknown }
  | { ok: false; status: number; error: { code: string; message: string } };

/** the engine seat the deploy binds: the published debonair library
 * mounted in-process or the forward seat over the configured origin — the
 * debonair dispatch contract, injected so this module never imports the
 * engine (the family law: the engine has one owner). */
export type DebonairDispatch = (request: DebonairGatewayRequest) => Promise<DebonairGatewayAnswer>;

/** the wire headers the blob stream rides (the debonair client contract —
 * the digest, the byte count and the stored-at instant the debonair
 * gateway blob store reads back). */
const BLOB_SHA_HEADER = "x-debonair-blob-sha256";
const BLOB_BYTES_HEADER = "x-debonair-blob-bytes";
const BLOB_STORED_AT_HEADER = "x-debonair-blob-stored-at";

/** guards one debonair answer value as the blob stream shape (the adapter
 * serves it as bytes; every other value serializes as json). */
function blobstream(value: unknown): value is DebonairBlobStream {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  if (!(candidate.bytes instanceof Uint8Array)) return false;
  if (typeof candidate.mime !== "string" || candidate.mime.length === 0) return false;
  const pointer = candidate.pointer;
  if (typeof pointer !== "object" || pointer === null) return false;
  const facts = pointer as Record<string, unknown>;
  return (
    typeof facts.id === "string" &&
    typeof facts.bytes === "number" &&
    typeof facts.sha256 === "string" &&
    typeof facts.kind === "string" &&
    typeof facts.storedAt === "string"
  );
}

/** reads one request body under the debonair body law: the json lane
 * parses the application/json body (null when absent, not json or not an
 * object — the debonair routes answer their own bad-request), every other
 * content type rides the raw lane (the verbatim bytes, the facts in the
 * query).
 *
 * @param request the mounted web request.
 * @returns the json object and the raw bytes pair of the body law.
 */
async function bodyof(
  request: Request,
): Promise<{ json: Record<string, unknown> | null; raw: Uint8Array<ArrayBuffer> | null }> {
  const contenttype = (request.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  if (contenttype === "application/json") {
    try {
      const parsed: unknown = await request.json();
      if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
        return { json: parsed as Record<string, unknown>, raw: null };
      }
      return { json: null, raw: null };
    } catch {
      return { json: null, raw: null };
    }
  }
  const bytes = new Uint8Array(await request.arrayBuffer());
  return { json: null, raw: bytes.byteLength > 0 ? bytes : null };
}

/** builds the debonair gateway request off one mounted web request — the
 * query params fold into the record (the first value wins, the web law),
 * the path rides the pathname alone and the body answers the debonair
 * body law.
 *
 * @param request the mounted web request.
 * @returns the debonair gateway request.
 */
export async function debonairrequest(request: Request): Promise<DebonairGatewayRequest> {
  const url = new URL(request.url);
  const query: Record<string, string> = {};
  for (const key of url.searchParams.keys()) {
    const value = url.searchParams.get(key);
    if (value !== null) query[key] = value;
  }
  const body = await bodyof(request);
  return { method: request.method, path: url.pathname, query, json: body.json, raw: body.raw };
}

/** translates one debonair answer into the gateway response shape:
 * the blob stream answers the bytes with the pointer's kind as the content
 * type and the digest headers, every other ok value serializes as the
 * json body, and the err answers the standardized error shape with the
 * debonair status.
 *
 * @param answer the debonair gateway answer.
 * @returns the web response the gateway serves.
 */
export function debonairresponse(answer: DebonairGatewayAnswer): Response {
  if (!answer.ok) {
    return Response.json(
      { error: { code: answer.error.code, message: answer.error.message } },
      { status: answer.status },
    );
  }
  if (blobstream(answer.value)) {
    const stream = answer.value;
    return new Response(stream.bytes, {
      status: answer.status,
      headers: {
        "content-type": stream.mime,
        [BLOB_SHA_HEADER]: stream.pointer.sha256,
        [BLOB_BYTES_HEADER]: String(stream.pointer.bytes),
        [BLOB_STORED_AT_HEADER]: stream.pointer.storedAt,
      },
    });
  }
  return Response.json(answer.value, { status: answer.status });
}

/** serves one mounted request through the debonair engine seat — the
 * mount adapter of the lane: the web request becomes the debonair gateway
 * request, the engine answers through the injected seat, and the answer
 * translates back into the web response. never a throw: a seat that
 * faults past the debonair guards answers the lane's own typed refusal
 * (502, the standardized shape).
 *
 * @param request the mounted web request (the getry server shape).
 * @param dispatch the bound debonair engine seat.
 * @returns the web response.
 */
export async function debonairserve(request: Request, dispatch: DebonairDispatch): Promise<Response> {
  let answer: DebonairGatewayAnswer;
  try {
    answer = await dispatch(await debonairrequest(request));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return Response.json(
      { error: { code: "lane-faulted", message: `the debonair lane faulted past its guards: ${message}` } },
      { status: 502 },
    );
  }
  return debonairresponse(answer);
}

/** the environment name the debonair origin arrives through (the same law
 * VITE_ONBOARDING_URL rides — the vite env seat this gateway reads). */
export const DEBONAIR_URL_ENV = "VITE_DEBONAIR_URL";

/** the configured debonair origin at module load (raw, before the https
 * law — the candidate helper trims and validates). */
const ORIGIN =
  (typeof import.meta !== "undefined" ? (import.meta.env?.[DEBONAIR_URL_ENV] as string | undefined) : undefined) ?? "";

/** validates one debonair origin candidate: the trim law (no trailing
 * slashes), then the house https law (https only, public hosts —
 * hostallowed of onboardingstate.ts). an unlawful or empty candidate
 * answers "" and the lane stays closed.
 *
 * @param raw the configured origin candidate.
 * @returns the lawful origin, or "" when the candidate refuses the law.
 */
export function debonaircandidate(raw: string): string {
  const trimmed = raw.trim().replace(/\/+$/, "");
  if (trimmed.length === 0) return "";
  return hostallowed(trimmed) ? trimmed : "";
}

/** the configured debonair gateway origin under the house https law —
 * "" when the deploy carries none (the lane then serves only through the
 * in-process engine seat) and "" when the candidate refuses the law (the
 * lane never forwards a byte to an unlawful origin).
 *
 * @returns the lawful origin, or "".
 */
export function debonairorigin(): string {
  return debonaircandidate(ORIGIN);
}

/** builds the debonair engine seat over the wire — the forward seat: the
 * gateway request rides fetch against the configured origin (the same
 * routes, the same body lanes) and the wire answer parses back into the
 * debonair gateway answer (the json body, the blob stream headers, the
 * standardized error shape). the deploy binds this seat when the debonair
 * engine answers on its own origin instead of riding in-process.
 *
 * @param origin the configured debonair origin (https, a public host).
 * @param fetchImpl the fetch seam (the tests hand doubles; the default is
 * the host fetch).
 * @returns the debonair dispatch seat.
 */
export function debonairforward(origin: string, fetchImpl: typeof fetch = globalThis.fetch): DebonairDispatch {
  return async (request) => {
    const query = new URLSearchParams(request.query).toString();
    const wirepath = query.length > 0 ? `${request.path}?${query}` : request.path;
    let init: RequestInit;
    if (request.json !== null) {
      init = {
        method: request.method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(request.json),
      };
    } else if (request.raw !== null) {
      init = { method: request.method, body: request.raw };
    } else {
      init = { method: request.method };
    }
    let response: Response;
    try {
      response = await fetchImpl(`${origin}${wirepath}`, init);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { ok: false, status: 502, error: { code: "lane-unreachable", message } };
    }
    if (!response.ok) {
      let code = "refused";
      let message = `the debonair origin answered ${response.status}`;
      try {
        const parsed: unknown = await response.json();
        if (typeof parsed === "object" && parsed !== null) {
          const error = (parsed as Record<string, unknown>).error;
          if (typeof error === "object" && error !== null) {
            const record = error as Record<string, unknown>;
            if (typeof record.code === "string") code = record.code;
            if (typeof record.message === "string") message = record.message;
          }
        }
      } catch {
        // a body that fails the parse keeps the status lane
      }
      return { ok: false, status: response.status, error: { code, message } };
    }
    const sha = response.headers.get(BLOB_SHA_HEADER);
    const contenttype = (response.headers.get("content-type") ?? "").split(";")[0].trim();
    if (sha !== null || (contenttype.length > 0 && contenttype !== "application/json")) {
      const bytes = new Uint8Array(await response.arrayBuffer());
      const id = request.path.split("/").pop() ?? "";
      const rawbytes = response.headers.get(BLOB_BYTES_HEADER);
      const storedat = response.headers.get(BLOB_STORED_AT_HEADER);
      return {
        ok: true,
        status: response.status,
        value: {
          bytes,
          mime: contenttype,
          pointer: {
            id,
            bytes: rawbytes !== null && /^\d+$/.test(rawbytes) ? Number(rawbytes) : bytes.byteLength,
            sha256: sha ?? "",
            kind: contenttype,
            storedAt: storedat ?? "",
          },
        },
      };
    }
    let value: unknown = null;
    try {
      value = await response.json();
    } catch {
      value = null;
    }
    return { ok: true, status: response.status, value };
  };
}
