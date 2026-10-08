import { describe, expect, it } from "vitest";
import {
  createSseParser,
  isDoneFrame,
  jsonDataOf,
  parseSseChunk,
  sseEvents,
  SseDataError,
  SSE_DONE,
} from "../sse.js";

describe("sse canonical SSE parser", () => {
  it("parses a complete frame with event and data", () => {
    const frames = parseSseChunk('event: text\ndata: {"text":"hi"}\n\n');
    expect(frames).toHaveLength(1);
    expect(frames[0].event).toBe("text");
    expect(frames[0].data).toBe('{"text":"hi"}');
  });

  it("assembles a frame cut in half across two chunks (partial JSON)", () => {
    const parser = createSseParser();
    expect(parser.feed('data: {"cand')).toEqual([]); // buffered, nothing yet
    const frames = parser.feed('idates":[]}\n\n');
    expect(frames).toHaveLength(1);
    expect(frames[0].data).toBe('{"candidates":[]}');
  });

  it("assembles a frame cut inside the event name and inside the blank line", () => {
    const parser = createSseParser();
    expect(parser.feed("event: iden")).toEqual([]);
    expect(parser.feed("tity\ndata: {}\n")).toEqual([]);
    expect(parser.feed("\n")).toHaveLength(1);
  });

  it("joins multiple data lines with a newline per the SSE spec", () => {
    const frames = parseSseChunk("data: first\ndata: second\n\n");
    expect(frames[0].data).toBe("first\nsecond");
  });

  it("tolerates CRLF, LF and bare CR terminators", () => {
    expect(parseSseChunk("event: a\r\ndata: 1\r\n\r\n")).toHaveLength(1);
    expect(parseSseChunk("event: a\ndata: 1\n\n")).toHaveLength(1);
    expect(parseSseChunk("event: a\rdata: 1\r\r")).toHaveLength(1);
  });

  it("splits a CRLF that arrives across two chunks", () => {
    const parser = createSseParser();
    expect(parser.feed("data: 1\r")).toEqual([]);
    const frames = parser.feed("\n\n");
    expect(frames).toHaveLength(1);
    expect(frames[0].data).toBe("1");
  });

  it("ignores comment heartbeat lines and strips the UTF-8 BOM", () => {
    expect(parseSseChunk(": keepalive\n\n")).toEqual([]);
    const withComment = parseSseChunk(": keepalive\nevent: text\ndata: 1\n\n");
    expect(withComment).toHaveLength(1);
    expect(parseSseChunk("\uFEFFdata: 1\n\n")[0].data).toBe("1");
  });

  it("recognizes the [DONE] sentinel and carries id/retry fields", () => {
    expect(SSE_DONE).toBe("[DONE]");
    expect(isDoneFrame(parseSseChunk("data: [DONE]\n\n")[0])).toBe(true);
    expect(isDoneFrame(parseSseChunk("data: {\"text\":\"[DONE] is literal\"}\n\n")[0])).toBe(false);
    const frame = parseSseChunk("id: 42\nretry: 1500\ndata: 1\n\n")[0];
    expect(frame.id).toBe("42");
    expect(frame.retry).toBe(1500);
  });

  it("records typed issues for unknown fields and a bad retry hint instead of throwing", () => {
    const parser = createSseParser();
    parser.feed("wat: ???\nretry: soon\ndata: 1\n\n");
    expect(parser.issues.map((issue) => issue.code)).toEqual(["unknown-field", "bad-retry"]);
    expect(parser.issues[0].line).toBe("wat: ???");
  });

  it("flush emits the trailing frame when the gateway forgot the final blank line", () => {
    const parser = createSseParser();
    expect(parser.feed("event: text\ndata: tail")).toEqual([]);
    const frames = parser.flush();
    expect(frames).toHaveLength(1);
    expect(frames[0].data).toBe("tail");
    expect(parser.flush()).toEqual([]); // idempotent after flush
  });

  it("reset drops buffered input and issues", () => {
    const parser = createSseParser();
    parser.feed("data: half");
    parser.feed("wat: ??\n");
    parser.reset();
    expect(parser.feed("data: 1\n\n")).toHaveLength(1);
    expect(parser.issues).toHaveLength(0);
  });
});

describe("sse typed decoding", () => {
  it("jsonDataOf decodes a payload and throws SseDataError carrying it", () => {
    const frame = parseSseChunk('data: {"workspaceId":"w1"}\n\n')[0];
    expect(jsonDataOf<{ workspaceId: string }>(frame).workspaceId).toBe("w1");
    const bad = parseSseChunk("data: {oops\n\n")[0];
    expect(() => jsonDataOf(bad)).toThrow(SseDataError);
    try {
      jsonDataOf(bad);
    } catch (err) {
      expect((err as SseDataError).payload).toBe("{oops");
    }
  });

  it("sseEvents keeps the exact shape the Sol home workbench consumed", () => {
    const chunk = 'event: identity\ndata: {"workspaceId":"w1"}\n\nevent: text\ndata: {"text":"hi"}\n\n';
    const events = sseEvents(chunk);
    expect(events).toEqual([
      { type: "identity", data: { workspaceId: "w1" } },
      { type: "text", data: { text: "hi" } },
    ]);
  });

  it("sseEvents skips frames without an event name or with a malformed payload", () => {
    const chunk = 'data: {"noEvent":true}\n\nevent: text\ndata: {broken}\n\nevent: ok\ndata: {"fine":1}\n\n';
    expect(sseEvents(chunk)).toEqual([{ type: "ok", data: { fine: 1 } }]);
  });
});
