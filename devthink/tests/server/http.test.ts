/**
 * http — aggressive stream pipeline tests
 * makestreamresponse is pushed through every transport mode: sse frame
 * parsing, heartbeat discard, model masking, tracking, residual flush,
 * ndjson passthrough, upstream failures and missing bodies
 */

import { describe, expect, it, vi } from "vitest";

import {
  discardheartbeat,
  extractdata,
  isdone,
  kams,
  kasuppressms,
  makechunk,
  makefinalchunk,
  makestreamresponse,
  maskmodel,
  ndjsonheaders,
  parsesseframes,
  safeenqueue,
  sseheaders,
  type trackedstream,
  writedone,
  writeevent,
  writekeepalive,
} from "../../server.js";

// ---------------------------------------------------------------------------
// helpers — mock upstream responses with real read streams
// ---------------------------------------------------------------------------

/** an upstream response carrying the given sse wire text */
function upstream(text: string, contenttype = "text/event-stream"): Response {
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      const encoder = new TextEncoder();
      for (const piece of chunktext(text, 7)) {
        controller.enqueue(encoder.encode(piece));
      }
      controller.close();
    },
  });
  return new Response(body, { headers: { "content-type": contenttype } });
}

/** split text into small chunks to simulate tcp fragmentation — grouping
 * by unicode code points so surrogate pairs never split mid-emoji (a
 * utf16-unit split encoded each half as u+fffd and corrupted the stream) */
function chunktext(text: string, size: number): string[] {
  const points = Array.from(text);
  const parts: string[] = [];
  for (let i = 0; i < points.length; i += size) parts.push(points.slice(i, i + size).join(""));
  return parts.length > 0 ? parts : [""];
}

/** collect the full body text of a response */
async function bodytext(res: Response): Promise<string> {
  return res.text();
}

/** a controller that records enqueues without a real stream */
function recordingcontroller() {
  const chunks: string[] = [];
  const controller = {
    enqueue: (chunk: string) => {
      chunks.push(chunk);
    },
    close: () => {
      /* recording controller — nothing to release */
    },
  } as unknown as ReadableStreamDefaultController;
  return { controller, chunks };
}

// ---------------------------------------------------------------------------
// frame parsing primitives
// ---------------------------------------------------------------------------

describe("parsesseframes — frame splitting", () => {
  it("splits complete frames and keeps the residual", () => {
    const { frames, residual } = parsesseframes("a: 1\n\ndata: b\n\ndata: c");
    expect(frames).toEqual(["a: 1", "data: b"]);
    expect(residual).toBe("data: c");
  });
  it("empty buffer yields nothing", () => {
    const { frames, residual } = parsesseframes("");
    expect(frames).toEqual([]);
    expect(residual).toBe("");
  });
  it("no separator means everything is residual", () => {
    const { frames, residual } = parsesseframes("data: partial");
    expect(frames).toEqual([]);
    expect(residual).toBe("data: partial");
  });
  it("crlf is normalized", () => {
    const { frames } = parsesseframes("data: a\r\n\r\ndata: b\r\n\r\n");
    expect(frames).toEqual(["data: a", "data: b"]);
  });
  it("consecutive separators produce empty frames", () => {
    const { frames } = parsesseframes("\n\n\n\n");
    expect(frames).toEqual(["", ""]);
  });
  it("chunked boundaries survive — frame content is preserved byte exact", () => {
    const input = 'data: {"content":"héllo wörld"}\n\n';
    const { frames } = parsesseframes(input);
    expect(frames).toEqual(['data: {"content":"héllo wörld"}']);
  });
});

describe("extractdata — data line extraction", () => {
  it("extracts single data lines", () => {
    expect(extractdata("data: hello")).toBe("hello");
  });
  it("joins multiple data lines with newline", () => {
    expect(extractdata("data: a\ndata: b")).toBe("a\nb");
  });
  it("the done marker maps to null", () => {
    expect(extractdata("data: [DONE]")).toBeNull();
    expect(extractdata("data: [done]")).toBeNull();
  });
  it("frames with no data lines yield null", () => {
    expect(extractdata("event: x")).toBeNull();
    expect(extractdata(": comment")).toBeNull();
    expect(extractdata("")).toBeNull();
  });
  it("non data lines are skipped in mixed frames", () => {
    expect(extractdata("event: message\ndata: payload\nid: 1")).toBe("payload");
  });
  it("trimstart strips every leading space after the colon", () => {
    expect(extractdata("data:  two spaces")).toBe("two spaces");
  });
});

describe("isdone — done markers", () => {
  it("accepts every spelling", () => {
    expect(isdone("[DONE]")).toBe(true);
    expect(isdone("[done]")).toBe(true);
    expect(isdone("data: [DONE]")).toBe(true);
    expect(isdone("done")).toBe(true);
    expect(isdone("  [done]  ")).toBe(true);
  });
  it("rejects content that merely contains done", () => {
    expect(isdone("not done")).toBe(false);
    expect(isdone("[DONE]extra")).toBe(false);
    expect(isdone("undone")).toBe(false);
  });
});

describe("discardheartbeat — heartbeat detection", () => {
  it("comments heartbeats and blanks are discarded", () => {
    expect(discardheartbeat(": ka")).toBe(true);
    expect(discardheartbeat(":")).toBe(true);
    expect(discardheartbeat("")).toBe(true);
    expect(discardheartbeat("   ")).toBe(true);
  });
  it("event ping and bare data lines are discarded", () => {
    expect(discardheartbeat("event: ping")).toBe(true);
    expect(discardheartbeat("data: ")).toBe(true);
  });
  it("real data frames survive", () => {
    expect(discardheartbeat("data: x")).toBe(false);
    expect(discardheartbeat("event: message\ndata: x")).toBe(false);
  });
});

describe("maskmodel — model id masking", () => {
  it("replaces every model field", () => {
    const out = maskmodel('{"model":"a","choices":[{"delta":{},"model":"a"}]}', "meta");
    expect(out).toBe('{"model":"meta","choices":[{"delta":{},"model":"meta"}]}');
  });
  it("tolerates whitespace around the colon — the match normalizes", () => {
    expect(maskmodel('{"model": "a"}', "m")).toBe('{"model":"m"}');
    expect(maskmodel('{"model"  :  "a"}', "m")).toBe('{"model":"m"}');
  });
  it("leaves other quoted keys untouched", () => {
    const out = maskmodel('{"notmodel":"a","model":"b"}', "m");
    expect(out).toBe('{"notmodel":"a","model":"m"}');
  });
  it("no model field means no change", () => {
    expect(maskmodel('{"x":1}', "m")).toBe('{"x":1}');
  });
  it("empty model strings are replaced too", () => {
    expect(maskmodel('{"model":""}', "m")).toBe('{"model":"m"}');
  });
  it("default target is devthink", () => {
    expect(maskmodel('{"model":"x"}')).toBe('{"model":"devthink"}');
  });
});

// ---------------------------------------------------------------------------
// chunk builders
// ---------------------------------------------------------------------------

describe("makechunk — openai chunk envelope", () => {
  it("carries content and role for non terminal chunks", () => {
    const c = makechunk("id1", "m", "hello") as Record<string, unknown>;
    expect(c["object"]).toBe("chat.completion.chunk");
    expect(c["id"]).toBe("id1");
    expect(c["model"]).toBe("m");
    const choice = (c["choices"] as Array<Record<string, unknown>>)[0];
    const delta = choice["delta"] as Record<string, unknown>;
    expect(delta["content"]).toBe("hello");
    expect(delta["role"]).toBe("assistant");
    expect(choice["finish_reason"]).toBeUndefined();
  });
  it("carries reasoning alongside content", () => {
    const c = makechunk("id", "m", "c", "r") as Record<string, unknown>;
    const delta = (c["choices"] as Array<Record<string, unknown>>)[0]["delta"] as Record<string, unknown>;
    expect(delta["reasoning_content"]).toBe("r");
  });
  it("terminal chunks omit the role and carry the finish reason", () => {
    const c = makechunk("id", "m", "c", undefined, "stop") as Record<string, unknown>;
    const choice = (c["choices"] as Array<Record<string, unknown>>)[0];
    const delta = choice["delta"] as Record<string, unknown>;
    expect(delta["role"]).toBeUndefined();
    expect(choice["finish_reason"]).toBe("stop");
  });
  it("created is a recent epoch second", () => {
    const c = makechunk("id", "m", "c") as Record<string, unknown>;
    expect(Number(c["created"])).toBeGreaterThan(1_600_000_000);
  });
});

describe("makefinalchunk — terminal envelope", () => {
  it("empty delta with finish reason", () => {
    const c = makefinalchunk("id", "m", "length") as Record<string, unknown>;
    const choice = (c["choices"] as Array<Record<string, unknown>>)[0];
    expect(choice["delta"] as Record<string, unknown>).toEqual({});
    expect(choice["finish_reason"]).toBe("length");
  });
  it("usage rides along when provided", () => {
    const c = makefinalchunk("id", "m", "stop", { total_tokens: 5 }) as Record<string, unknown>;
    expect((c["usage"] as Record<string, unknown>)["total_tokens"]).toBe(5);
  });
  it("usage omitted when absent", () => {
    const c = makefinalchunk("id", "m", "stop") as Record<string, unknown>;
    expect(c["usage"]).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// header builders
// ---------------------------------------------------------------------------

describe("sseheaders ndjsonheaders", () => {
  it("sse headers carry the event stream type and no buffering", () => {
    const h = sseheaders();
    expect(h["content-type"]).toBe("text/event-stream");
    expect(h["cache-control"]).toBe("no-cache, no-transform");
    expect(h["x-accel-buffering"]).toBe("no");
    expect(h["access-control-allow-origin"]).toBe("*");
  });
  it("ndjson headers carry the ndjson type", () => {
    const h = ndjsonheaders();
    expect(h["content-type"]).toBe("application/x-ndjson");
    expect(h["connection"]).toBe("keep-alive");
  });
  it("keepalive constants are sane", () => {
    expect(kams).toBe(200);
    expect(kasuppressms).toBe(1000);
  });
});

// ---------------------------------------------------------------------------
// controller writers
// ---------------------------------------------------------------------------

describe("writeevent — format writers", () => {
  it("sse format wraps event and data with the double newline", () => {
    const { controller, chunks } = recordingcontroller();
    writeevent(controller, "message", "x");
    expect(chunks).toEqual(["event: message\ndata: x\n\n"]);
  });
  it("sse without event omits the event line", () => {
    const { controller, chunks } = recordingcontroller();
    writeevent(controller, null, "x");
    expect(chunks).toEqual(["data: x\n\n"]);
  });
  it("objects are stringified", () => {
    const { controller, chunks } = recordingcontroller();
    writeevent(controller, null, { a: 1 });
    expect(chunks).toEqual(['data: {"a":1}\n\n']);
  });
  it("ndjson appends one newline per record", () => {
    const { controller, chunks } = recordingcontroller();
    writeevent(controller, null, { a: 1 }, "ndjson");
    expect(chunks).toEqual(['{"a":1}\n']);
  });
  it("plain writes the raw value with no terminator", () => {
    const { controller, chunks } = recordingcontroller();
    writeevent(controller, null, "raw", "plain");
    expect(chunks).toEqual(["raw"]);
  });
});

describe("writekeepalive writedone safeenqueue", () => {
  it("keepalive is a comment line invisible to parsers", () => {
    const { controller, chunks } = recordingcontroller();
    writekeepalive(controller);
    expect(chunks).toEqual([": ka\n\n"]);
    expect(extractdata(": ka")).toBeNull();
  });
  it("done marker per format", () => {
    const a = recordingcontroller();
    writedone(a.controller);
    expect(a.chunks).toEqual(["data: [done]\n\n"]);
    const b = recordingcontroller();
    writedone(b.controller, "ndjson");
    expect(b.chunks).toEqual(['{"done":true}\n']);
    const c = recordingcontroller();
    writedone(c.controller, "json");
    expect(c.chunks).toEqual([]);
  });
  it("safeenqueue swallows closed controller errors", () => {
    const { controller } = recordingcontroller();
    expect(safeenqueue(controller, "x")).toBe(true);
    const broken = {
      enqueue: () => {
        throw new Error("closed");
      },
    } as unknown as ReadableStreamDefaultController;
    expect(safeenqueue(broken, "x")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// makestreamresponse — the full pipeline
// ---------------------------------------------------------------------------

describe("makestreamresponse — sse passthrough", () => {
  it("forwards data frames unchanged when masking is off", async () => {
    const res = makestreamresponse(upstream('data: {"a":1}\n\ndata: {"b":2}\n\ndata: [DONE]\n\n'), {
      mask: null,
    });
    const text = await bodytext(res);
    expect(text).toContain('data: {"a":1}');
    expect(text).toContain('data: {"b":2}');
    expect(text).toContain("data: [DONE]");
    expect(res.headers.get("content-type")).toBe("text/event-stream");
  });

  it("masks model ids to the meta id when masking is on", async () => {
    const frames = [
      'data: {"model":"nvidia/llama","choices":[{"delta":{"content":"hi"}}]}',
      'data: {"model":"nvidia/llama","choices":[{"delta":{"content":"!"}}]}',
      "data: [DONE]",
    ].join("\n\n");
    const res = makestreamresponse(upstream(frames), { mask: "devthink" });
    const text = await bodytext(res);
    expect(text).toContain('"model":"devthink"');
    expect(text).not.toContain("nvidia/llama");
  });

  it("discards heartbeat comments and tracks them", async () => {
    const onfinal = vi.fn<(t: trackedstream) => void>();
    const frames = [": ka", 'data: {"a":1}', "data: [DONE]"].join("\n\n");
    const res = makestreamresponse(upstream(frames), { mask: null, onfinal });
    await bodytext(res);
    expect(onfinal).toHaveBeenCalledTimes(1);
    const tracked = onfinal.mock.calls[0][0];
    expect(tracked.discarded).toBeGreaterThanOrEqual(1);
  });

  it("tracks content reasoning and usage across frames", async () => {
    const onfinal = vi.fn<(t: trackedstream) => void>();
    const frames = [
      'data: {"choices":[{"delta":{"content":"hel"}}]}',
      'data: {"choices":[{"delta":{"content":"lo"}}]}',
      'data: {"choices":[{"delta":{"reasoning_content":"think"}}]}',
      'data: {"usage":{"total_tokens":42,"prompt_tokens":20,"completion_tokens":22}}',
      "data: [DONE]",
    ].join("\n\n");
    await bodytext(makestreamresponse(upstream(frames), { mask: null, onfinal }));
    const tracked = onfinal.mock.calls[0][0];
    expect(tracked.content).toBe("hello");
    expect(tracked.reasoning).toBe("think");
    expect(tracked.totaltokens).toBe(42);
    expect(tracked.prompttokens).toBe(20);
    expect(tracked.completiontokens).toBe(22);
    expect(tracked.frames).toBe(4);
  });

  it("tracks message bodies too not only deltas", async () => {
    const onfinal = vi.fn<(t: trackedstream) => void>();
    const frames = 'data: {"choices":[{"message":{"content":"full","reasoning_content":"why"}}]}\n\n';
    await bodytext(makestreamresponse(upstream(frames), { mask: null, onfinal }));
    const tracked = onfinal.mock.calls[0][0];
    expect(tracked.content).toBe("full");
    expect(tracked.reasoning).toBe("why");
  });

  it("appends the done marker when the upstream omits it", async () => {
    const res = makestreamresponse(upstream('data: {"a":1}\n\n'), { mask: null });
    const text = await bodytext(res);
    expect(text).toContain("data: [DONE]");
    expect((text.match(/data: \[DONE\]/g) ?? []).length).toBe(1);
  });

  it("a terminated upstream stream carries exactly one done marker", async () => {
    const frames = 'data: {"a":1}\n\ndata: {"b":2}\n\ndata: [DONE]\n\n';
    const res = makestreamresponse(upstream(frames), { mask: null });
    const text = await bodytext(res);
    expect((text.match(/data: \[DONE\]/g) ?? []).length).toBe(1);
    expect(text.endsWith("data: [DONE]\n\n")).toBe(true);
  });

  it("an unterminated trailing done marker still terminates exactly once", async () => {
    // the final marker never receives its double newline — the residual
    // flush must recognize it instead of appending a second marker
    const frames = 'data: {"a":1}\n\ndata: [DONE]';
    const res = makestreamresponse(upstream(frames), { mask: null });
    const text = await bodytext(res);
    expect((text.match(/data: \[DONE\]/g) ?? []).length).toBe(1);
  });

  it("lowercase done markers terminate exactly once too", async () => {
    const frames = 'data: {"a":1}\n\ndata: [done]\n\n';
    const res = makestreamresponse(upstream(frames), { mask: null });
    const text = await bodytext(res);
    expect((text.match(/data: \[DONE\]/g) ?? []).length).toBe(1);
    expect(text).not.toContain("data: [done]");
  });

  it("flushes the trailing residual as a final frame", async () => {
    const res = makestreamresponse(upstream('data: {"a":1}\n\ndata: {"b":2}'), { mask: null });
    const text = await bodytext(res);
    expect(text).toContain('data: {"b":2}');
    expect(text).toContain("data: [DONE]");
  });

  it("frames with no data lines are forwarded raw", async () => {
    const res = makestreamresponse(upstream("event: x\n\n"), { mask: null });
    const text = await bodytext(res);
    expect(text).toContain("event: x");
  });

  it("non json data frames pass through untouched", async () => {
    const res = makestreamresponse(upstream("data: not-json\n\ndata: [DONE]\n\n"), { mask: null });
    const text = await bodytext(res);
    expect(text).toContain("data: not-json");
  });

  it("survives an upstream that errors mid stream", async () => {
    // the error lands AFTER the first chunk was pulled — enqueue followed
    // by a synchronous error discards the queue per the streams spec
    const body = new ReadableStream<Uint8Array>({
      async start(controller) {
        const encoder = new TextEncoder();
        controller.enqueue(encoder.encode('data: {"a":1}\n\n'));
        await new Promise((r) => setTimeout(r, 50));
        controller.error(new Error("upstream exploded"));
      },
    });
    const res = makestreamresponse(new Response(body), { mask: null });
    const text = await bodytext(res);
    expect(text).toContain('data: {"a":1}');
    expect(text).toContain("data: [DONE]");
  });

  it("a bodyless response closes cleanly with the done marker", async () => {
    const res = makestreamresponse(new Response(null), { mask: null });
    const text = await bodytext(res);
    expect(text).toContain("data: [DONE]");
  });

  it("onfinal fires even when the upstream body is missing", async () => {
    const onfinal = vi.fn<(t: trackedstream) => void>();
    await bodytext(makestreamresponse(new Response(null), { mask: null, onfinal }));
    expect(onfinal).toHaveBeenCalledTimes(1);
  });

  it("onfinal throwing does not break the stream", async () => {
    const onfinal = () => {
      throw new Error("callback boom");
    };
    const res = makestreamresponse(upstream('data: {"a":1}\n\ndata: [DONE]\n\n'), {
      mask: null,
      onfinal,
    });
    const text = await bodytext(res);
    expect(text).toContain("data: [DONE]");
  });

  it("unicode content survives the round trip byte exact", async () => {
    // biome-ignore lint/security/noSecrets: synthetic sse fixture — not a credential
    const frames = 'data: {"choices":[{"delta":{"content":"héllo 中文 😀"}}]}\n\ndata: [DONE]\n\n';
    const res = makestreamresponse(upstream(frames), { mask: null });
    const text = await bodytext(res);
    expect(text).toContain("héllo 中文 😀");
  });
});

describe("makestreamresponse — ndjson passthrough", () => {
  it("forwards raw bytes with ndjson headers when no masking", async () => {
    const res = makestreamresponse(upstream('{"a":1}\n{"b":2}\n', "application/x-ndjson"), {
      mask: null,
    });
    expect(res.headers.get("content-type")).toBe("application/x-ndjson");
    const text = await bodytext(res);
    expect(text).toContain('{"a":1}');
    expect(text).toContain('{"b":2}');
  });

  it("ndjson with masking still parses sse style frames", async () => {
    // when a mask is set the pipeline switches to parsing regardless of format
    const res = makestreamresponse(upstream('data: {"model":"x"}\n\ndata: [DONE]\n\n', "text/event-stream"), {
      mask: "meta",
    });
    const text = await bodytext(res);
    expect(text).toContain('"model":"meta"');
  });

  it("format override beats the upstream content type", async () => {
    const res = makestreamresponse(upstream("raw-bytes", "text/plain"), {
      mask: null,
      format: "ndjson",
    });
    expect(res.headers.get("content-type")).toBe("application/x-ndjson");
    expect(await bodytext(res)).toContain("raw-bytes");
  });
});

describe("makestreamresponse — keepalive", () => {
  it("emits keepalive comments during a silent upstream", async () => {
    const body = new ReadableStream<Uint8Array>({
      async start(controller) {
        const encoder = new TextEncoder();
        // first write, then silence, then close
        controller.enqueue(encoder.encode('data: {"a":1}\n\n'));
        await new Promise((r) => setTimeout(r, 350));
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      },
    });
    const res = makestreamresponse(new Response(body), {
      mask: null,
      keepaliveintervalms: 50,
      keepalivesuppressms: 100,
    });
    const text = await bodytext(res);
    expect(text).toContain(": ka");
  });

  it("no keepalive when the stream finishes fast", async () => {
    const res = makestreamresponse(upstream('data: {"a":1}\n\ndata: [DONE]\n\n'), {
      mask: null,
      keepaliveintervalms: 100000,
    });
    const text = await bodytext(res);
    expect(text).not.toContain(": ka");
  });
});
