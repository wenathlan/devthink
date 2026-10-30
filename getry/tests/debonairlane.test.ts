// # debonairlane.test — the debonair api lane of the family gateway (the
// mount adapter contract): the thirteen-route catalog mirrors the debonair
// gateway table in the family shape (first match wins, the params capture,
// an empty capture never matches, the provider lanes answer absent), the
// adapter translates the getry mount shape (the web request) into the
// debonair gateway request (the json lane, the raw lane, the query record)
// and the debonair answer back into the web response (the json body, the
// blob stream with the digest headers, the standardized error shape, the
// 502 lane-faulted guard — never a throw), the origin config rides the
// vite env law under the house https gate, and the forward seat rides the
// wire over a fake fetch (the same routes, the body lanes, the blob
// headers, the error catalog, the unreachable lane). runnable with vitest:
//   pnpm test
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  DEBONAIR_URL_ENV,
  DEBONAIRROUTES,
  type DebonairDispatch,
  type DebonairGatewayAnswer,
  type DebonairGatewayRequest,
  debonaircandidate,
  debonairforward,
  debonairorigin,
  debonairrequest,
  debonairresponse,
  debonairserve,
  matchdebonairpath,
  matchdebonairroute,
} from "../debonairlane.ts";

/** the debonair origin the wire tests ride (a public https host — the law). */
const ORIGIN = "https://debonair.example.com";

/** builds one mounted web request — the getry server shape. */
function mount(method: string, path: string, init: { body?: string; contenttype?: string } = {}): Request {
  const headers: Record<string, string> = {};
  if (init.contenttype !== undefined) headers["content-type"] = init.contenttype;
  return new Request(`${ORIGIN}${path}`, { method, headers, body: init.body });
}

/** builds one fake debonair engine seat — records every gateway request it
 * receives and answers the scripted answer (the value builder, the typed
 * refusal or a fault thrown past the guards).
 *
 * @param serve the answer the seat serves.
 */
function engineseat(
  serve: (request: DebonairGatewayRequest) => DebonairGatewayAnswer | Promise<DebonairGatewayAnswer>,
): { dispatch: DebonairDispatch; calls: DebonairGatewayRequest[] } {
  const calls: DebonairGatewayRequest[] = [];
  const dispatch: DebonairDispatch = async (request) => {
    calls.push(request);
    return serve(request);
  };
  return { dispatch, calls };
}

/** one engine seat serving one ok value (the happy lane builder). */
function valueseat(value: (request: DebonairGatewayRequest) => unknown): {
  dispatch: DebonairDispatch;
  calls: DebonairGatewayRequest[];
} {
  return engineseat((request) => ({ ok: true, status: 200, value: value(request) }));
}

describe("the debonair route catalog (the published contract mirror)", () => {
  it("carries the thirteen debonair routes in the family shape", () => {
    assert.equal(DEBONAIRROUTES.length, 13);
    assert.deepEqual(DEBONAIRROUTES[0], { method: "POST", path: "/api/v1/ingest/upload", handler: "uploadIngest" });
    assert.deepEqual(DEBONAIRROUTES[5], { method: "GET", path: "/api/v1/blob/:id", handler: "getBlob" });
    assert.deepEqual(DEBONAIRROUTES[12], { method: "GET", path: "/api/v1/vitrine", handler: "listVitrine" });
    for (const route of DEBONAIRROUTES) {
      assert.ok(route.path.startsWith("/api/v1/"), `${route.path} rides the api prefix`);
      assert.ok(["GET", "POST", "DELETE"].includes(route.method));
    }
  });

  it("matches the params, refuses the empty capture and answers the method verdict", () => {
    const routed = matchdebonairroute("GET", "/api/v1/ingest/jobs/123");
    assert.ok(routed.kind === "routed");
    assert.equal(routed.route.handler, "getIngestJob");
    assert.deepEqual(routed.params, { id: "123" });
    // the empty capture never matches — a route param always carries a value
    assert.equal(matchdebonairpath("/api/v1/blob/:id", "/api/v1/blob/"), null);
    // the specific rows ride first: the jobs row wins over the :id row
    const shelf = matchdebonairroute("GET", "/api/v1/ingest");
    assert.ok(shelf.kind === "routed" && shelf.route.handler === "listIngestShelf");
    // the path matches, the method does not — the allowed list answers
    const method = matchdebonairroute("PUT", "/api/v1/vitrine");
    assert.ok(method.kind === "method");
    assert.deepEqual(method.allowed, ["GET"]);
    // the provider lanes own their paths — the catalog answers absent
    const foreign = matchdebonairroute("POST", "/v1/chat/completions");
    assert.deepEqual(foreign, { kind: "absent" });
  });

  it("decodes the captured params (the vault safeDecode law)", () => {
    const params = matchdebonairpath("/api/v1/profiles/:genre", "/api/v1/profiles/drill%20beats");
    assert.deepEqual(params, { genre: "drill beats" });
    const malformed = matchdebonairpath("/api/v1/profiles/:genre", "/api/v1/profiles/%zz");
    assert.deepEqual(malformed, { genre: "%zz" }, "a malformed escape keeps the raw text");
  });
});

describe("the mount adapter (the getry server shape to the debonair contract)", () => {
  it("builds the gateway request off the web request — the json lane", async () => {
    const { dispatch, calls } = valueseat(() => ({ jobId: "42" }));
    const response = await debonairserve(
      mount("POST", "/api/v1/ingest/upload", {
        body: JSON.stringify({ bytes: "QUJD", name: "take.wav", ownerId: "123" }),
        contenttype: "application/json",
      }),
      dispatch,
    );
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { jobId: "42" });
    assert.equal(calls.length, 1);
    const seen = calls[0];
    assert.ok(seen);
    assert.equal(seen.method, "POST");
    assert.equal(seen.path, "/api/v1/ingest/upload");
    assert.deepEqual(seen.json, { bytes: "QUJD", name: "take.wav", ownerId: "123" });
    assert.equal(seen.raw, null);
    assert.deepEqual(seen.query, {});
  });

  it("carries the raw body verbatim with the facts in the query (the deposit law)", async () => {
    const { dispatch, calls } = valueseat(() => ({ jobId: "43" }));
    const response = await debonairserve(
      mount("POST", "/api/v1/ingest/upload?name=take.wav&ownerId=123&kind=reference", {
        body: "the verbatim bytes",
      }),
      dispatch,
    );
    assert.equal(response.status, 200);
    const seen = calls[0];
    assert.ok(seen);
    assert.equal(seen.json, null);
    assert.ok(seen.raw instanceof Uint8Array);
    assert.equal(new TextDecoder().decode(seen.raw), "the verbatim bytes");
    assert.deepEqual(seen.query, { name: "take.wav", ownerId: "123", kind: "reference" });
  });

  it("serves the blob stream with the pointer's kind and the digest headers", async () => {
    const bytes = new Uint8Array([1, 2, 3, 4]);
    const pointer = {
      id: "777",
      bytes: bytes.byteLength,
      sha256: "a".repeat(64),
      kind: "audio/wav",
      storedAt: "2026-06-01T00:00:00.000Z",
    };
    const { dispatch, calls } = valueseat(() => ({ bytes, mime: "audio/wav", pointer }));
    const response = await debonairserve(mount("GET", "/api/v1/blob/777"), dispatch);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("content-type"), "audio/wav");
    assert.equal(response.headers.get("x-debonair-blob-sha256"), "a".repeat(64));
    assert.equal(response.headers.get("x-debonair-blob-bytes"), "4");
    assert.equal(response.headers.get("x-debonair-blob-stored-at"), "2026-06-01T00:00:00.000Z");
    assert.deepEqual(new Uint8Array(await response.arrayBuffer()), bytes);
    assert.equal(calls[0]?.path, "/api/v1/blob/777");
  });

  it("answers the standardized error shape with the debonair status", async () => {
    const { dispatch } = engineseat(() => ({
      ok: false,
      status: 405,
      error: { code: "method-not-allowed", message: "PUT does not ride /api/v1/vitrine" },
    }));
    const response = await debonairserve(mount("PUT", "/api/v1/vitrine"), dispatch);
    assert.equal(response.status, 405);
    assert.deepEqual(await response.json(), {
      error: { code: "method-not-allowed", message: "PUT does not ride /api/v1/vitrine" },
    });
  });

  it("guards a seat that faults past the debonair guards — never a throw", async () => {
    const { dispatch } = engineseat(() => {
      throw new Error("the engine faulted");
    });
    const response = await debonairserve(mount("GET", "/api/v1/vitrine"), dispatch);
    assert.equal(response.status, 502);
    const body = (await response.json()) as { error: { code: string; message: string } };
    assert.equal(body.error.code, "lane-faulted");
    assert.match(body.error.message, /the engine faulted/);
  });

  it("serves the 201 registrations and the json refusals through the answer translator", async () => {
    const created = debonairresponse({ ok: true, status: 201, value: { jobId: "9" } });
    assert.equal(created.status, 201);
    assert.deepEqual(await created.json(), { jobId: "9" });
    assert.equal(created.headers.get("content-type")?.split(";")[0], "application/json");
    const refused = debonairresponse({
      ok: false,
      status: 400,
      error: { code: "bad-request", message: "the upload needs a name" },
    });
    assert.equal(refused.status, 400);
    assert.deepEqual(await refused.json(), { error: { code: "bad-request", message: "the upload needs a name" } });
  });

  it("builds the gateway request alone (the translation seat the mount loop reads)", async () => {
    const request = await debonairrequest(
      new Request(`${ORIGIN}/api/v1/ingest?ownerId=123&ownerId=456`, { method: "GET" }),
    );
    assert.equal(request.method, "GET");
    assert.equal(request.path, "/api/v1/ingest");
    assert.deepEqual(request.query, { ownerId: "123" }, "the first value wins (the web law)");
    assert.equal(request.json, null);
    assert.equal(request.raw, null);
    // a broken json body answers the null json lane — the debonair route owns the refusal
    const broken = await debonairrequest(
      new Request(`${ORIGIN}/api/v1/ingest/upload`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{not json",
      }),
    );
    assert.equal(broken.json, null);
    assert.equal(broken.raw, null);
  });
});

describe("the origin config (the vite env law under the house https gate)", () => {
  it("names the environment seat the deploy pins the origin through", () => {
    assert.equal(DEBONAIR_URL_ENV, "VITE_DEBONAIR_URL");
  });

  it("trims the candidate and refuses the unlawful origins", () => {
    assert.equal(debonaircandidate("  https://debonair.example.com/  "), "https://debonair.example.com");
    assert.equal(debonaircandidate(""), "", "the empty candidate keeps the lane closed");
    assert.equal(debonaircandidate("http://debonair.example.com"), "", "http never rides");
    assert.equal(debonaircandidate("https://localhost"), "", "loopback never rides");
    assert.equal(debonaircandidate("https://10.0.0.1"), "", "the private range never rides");
    assert.equal(debonaircandidate("not a url"), "", "a malformed candidate never rides");
  });

  it("answers no origin when the deploy carries none (the lane stays closed)", () => {
    assert.equal(debonairorigin(), "");
  });
});

describe("the forward seat (the debonair engine over the wire)", () => {
  /** one recorded wire call. */
  interface WireCall {
    url: string;
    method: string;
    contenttype: string | null;
    body: string | null;
  }

  /** builds one fake fetch serving the debonair wire law. */
  function fakewire(answer: (call: WireCall) => Response): { fetchImpl: typeof fetch; calls: WireCall[] } {
    const calls: WireCall[] = [];
    const fetchImpl: typeof fetch = async (input, init) => {
      const headers = init?.headers as Record<string, string> | undefined;
      const call: WireCall = {
        url: typeof input === "string" ? input : input.url,
        method: init?.method ?? "GET",
        contenttype:
          headers !== undefined && typeof headers["content-type"] === "string" ? headers["content-type"] : null,
        body: typeof init?.body === "string" ? init.body : null,
      };
      calls.push(call);
      return answer(call);
    };
    return { fetchImpl, calls };
  }

  it("forwards the json lane and parses the json answer back", async () => {
    const { fetchImpl, calls } = fakewire(() => Response.json({ tracks: [], profiles: [] }));
    const dispatch = debonairforward(ORIGIN, fetchImpl);
    const answer = await dispatch({ method: "GET", path: "/api/v1/vitrine", query: {}, json: null, raw: null });
    assert.ok(answer.ok);
    assert.equal(answer.status, 200);
    assert.deepEqual(answer.value, { tracks: [], profiles: [] });
    const call = calls[0];
    assert.ok(call);
    assert.equal(call.method, "GET");
    assert.equal(call.url, `${ORIGIN}/api/v1/vitrine`);
    // the json lane rides the wire with the json content type
    const posted = await dispatch({
      method: "POST",
      path: "/api/v1/profiles/mine",
      query: {},
      json: { genre: "trap", ownerId: "123" },
      raw: null,
    });
    assert.ok(posted.ok);
    const mine = calls[1];
    assert.ok(mine);
    assert.equal(mine.method, "POST");
    assert.equal(mine.url, `${ORIGIN}/api/v1/profiles/mine`);
    assert.equal(mine.contenttype, "application/json");
    assert.deepEqual(JSON.parse(mine.body ?? "{}"), { genre: "trap", ownerId: "123" });
  });

  it("forwards the raw lane and the query facts", async () => {
    const { fetchImpl, calls } = fakewire(() => Response.json({ removed: true }, { status: 200 }));
    const dispatch = debonairforward(ORIGIN, fetchImpl);
    const answer = await dispatch({
      method: "DELETE",
      path: "/api/v1/ingest/123",
      query: {},
      json: null,
      raw: new Uint8Array([9, 9]),
    });
    assert.ok(answer.ok);
    assert.deepEqual(answer.value, { removed: true });
    const call = calls[0];
    assert.ok(call);
    assert.equal(call.method, "DELETE");
    assert.equal(call.url, `${ORIGIN}/api/v1/ingest/123`);
    assert.equal(call.body, null, "the bytes ride the body lane, never the string lane");
  });

  it("forwards the query record with the path (the deposit facts)", async () => {
    const { fetchImpl, calls } = fakewire(() => Response.json({ jobId: "51" }, { status: 201 }));
    const dispatch = debonairforward(ORIGIN, fetchImpl);
    const answer = await dispatch({
      method: "POST",
      path: "/api/v1/ingest/upload",
      query: { name: "take.wav", ownerId: "123", kind: "reference" },
      json: null,
      raw: new Uint8Array([1, 2, 3]),
    });
    assert.ok(answer.ok);
    assert.equal(answer.status, 201);
    assert.equal(
      calls[0]?.url,
      `${ORIGIN}/api/v1/ingest/upload?name=take.wav&ownerId=123&kind=reference`,
      "the query facts ride the wire verbatim",
    );
  });

  it("parses the blob stream headers back into the stream value", async () => {
    const { fetchImpl } = fakewire(
      () =>
        new Response(new Uint8Array([5, 6, 7]), {
          status: 200,
          headers: {
            "content-type": "audio/wav",
            "x-debonair-blob-sha256": "b".repeat(64),
            "x-debonair-blob-bytes": "3",
            "x-debonair-blob-stored-at": "2026-06-02T00:00:00.000Z",
          },
        }),
    );
    const dispatch = debonairforward(ORIGIN, fetchImpl);
    const answer = await dispatch({ method: "GET", path: "/api/v1/blob/321", query: {}, json: null, raw: null });
    assert.ok(answer.ok);
    const stream = answer.value as { bytes: Uint8Array; mime: string; pointer: Record<string, unknown> };
    assert.deepEqual([...stream.bytes], [5, 6, 7]);
    assert.equal(stream.mime, "audio/wav");
    assert.equal(stream.pointer.id, "321");
    assert.equal(stream.pointer.bytes, 3);
    assert.equal(stream.pointer.sha256, "b".repeat(64));
    assert.equal(stream.pointer.storedAt, "2026-06-02T00:00:00.000Z");
  });

  it("parses the standardized error shape and guards the unreachable lane", async () => {
    const { fetchImpl } = fakewire(() =>
      Response.json(
        { error: { code: "bad-owner", message: "the upload needs the owner pointer in the minted decimal form" } },
        { status: 400 },
      ),
    );
    const dispatch = debonairforward(ORIGIN, fetchImpl);
    const refused = await dispatch({
      method: "POST",
      path: "/api/v1/ingest/upload",
      query: {},
      json: { bytes: "QQ==", name: "take.wav" },
      raw: null,
    });
    assert.ok(!refused.ok);
    assert.equal(refused.status, 400);
    assert.equal(refused.error.code, "bad-owner");
    const hanging: typeof fetch = () => {
      throw new Error("the network is down");
    };
    const offline = await debonairforward(
      ORIGIN,
      hanging,
    )({
      method: "GET",
      path: "/api/v1/vitrine",
      query: {},
      json: null,
      raw: null,
    });
    assert.ok(!offline.ok);
    assert.equal(offline.status, 502);
    assert.equal(offline.error.code, "lane-unreachable");
  });

  it("composes the whole lane: the mount request rides the forward seat and answers as the web response", async () => {
    const { fetchImpl } = fakewire(() => Response.json({ records: [] }, { status: 200 }));
    const response = await debonairserve(
      mount("GET", "/api/v1/ingest?ownerId=123"),
      debonairforward(ORIGIN, fetchImpl),
    );
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { records: [] });
  });
});
