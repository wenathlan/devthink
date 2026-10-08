/**
 * stream.parse.ts — the canonical SSE parser of the house: a stateful,
 * incremental reader that survives network splits (a frame cut in half by a
 * chunk boundary), CRLF/LF/CR terminators, multi `data:` lines, `id:`/`retry:`
 * fields, comment lines and the OpenAI `[DONE]` sentinel. Pure TypeScript,
 * node + browser, zero DOM — the caller owns the byte stream and only feeds
 * decoded strings.
 *
 * Strategy extracted from the competitors: jan's chat transport feeds a
 * buffered reader and only dispatches complete frames; goose's providers
 * consume an event stream that never trusts a chunk boundary. This module is
 * the single shared implementation — the legacy copy inside home.tsx was
 * extracted here and Sol/panel/panel.tsx now imports it (zero duplication).
 *
 * The parser never throws on malformed input: it skips what it cannot use and
 * records typed issues. JSON decoding is explicit (`jsonDataOf`) so callers
 * choose between resilient and strict.
 */

/** The OpenAI streaming sentinel that closes a chat-completions stream. */
export const SSE_DONE = "[DONE]" as const;

/** One complete Server-Sent Event frame. */
export type SseFrame = {
  /** The `event:` field, empty string when the frame carries none. */
  event: string;
  /** Every `data:` line joined with `\n` per the SSE spec. */
  data: string;
  /** The last `id:` field seen on the frame, when present. */
  id?: string;
  /** The reconnection hint from `retry:`, in milliseconds, when valid. */
  retry?: number;
};

/** A malformed piece of input the parser skipped instead of throwing. */
export type SseIssue = {
  code: "bad-retry" | "unknown-field";
  /** The offending raw line, trimmed. */
  line: string;
};

/** Thrown by `jsonDataOf` when a frame payload is not valid JSON. */
export class SseDataError extends Error {
  constructor(
    message: string,
    /** The raw payload that failed to decode. */
    readonly payload: string,
  ) {
    super(message);
    this.name = "SseDataError";
  }
}

export type SseParser = {
  /** Feeds one network chunk and returns every frame it completes. */
  feed(chunk: string): SseFrame[];
  /** At end of stream, emits a trailing frame left without a blank line. */
  flush(): SseFrame[];
  /** Drops buffered partial input and issues. */
  reset(): void;
  /** Typed notes about input skipped so far. */
  readonly issues: readonly SseIssue[];
};

/**
 * createSseParser — the stateful core. Feed chunks as they arrive; a frame
 * split across any number of chunks is delivered once, exactly whole.
 *
 * @returns an incremental SSE parser.
 */
export function createSseParser(): SseParser {
  let buffer = "";
  let seenBom = false;
  const issueLog: SseIssue[] = [];
  let pending: { event: string; data: string[]; id?: string; retry?: number } | null = null;

  const dispatch = (): SseFrame | null => {
    const frame = pending;
    pending = null;
    if (!frame || (frame.event === "" && frame.data.length === 0 && frame.id === undefined)) return null;
    const out: SseFrame = { event: frame.event, data: frame.data.join("\n") };
    if (frame.id !== undefined) out.id = frame.id;
    if (frame.retry !== undefined) out.retry = frame.retry;
    return out;
  };

  const handleLine = (line: string): SseFrame | null => {
    if (line === "") return dispatch();
    if (line.startsWith(":")) return null; // SSE comment — heartbeat keepalive
    const colon = line.indexOf(":");
    if (colon < 0) {
      issueLog.push({ code: "unknown-field", line: line.trim() });
      return null;
    }
    const field = line.slice(0, colon);
    // the spec strips ONE optional leading space after the colon
    let value = line.slice(colon + 1);
    if (value.startsWith(" ")) value = value.slice(1);
    if (field === "event") {
      pending ??= { event: "", data: [] };
      pending.event = value;
    } else if (field === "data") {
      pending ??= { event: "", data: [] };
      pending.data.push(value);
    } else if (field === "id") {
      pending ??= { event: "", data: [] };
      pending.id = value;
    } else if (field === "retry") {
      const ms = Number.parseInt(value, 10);
      if (Number.isInteger(ms) && ms >= 0) {
        pending ??= { event: "", data: [] };
        pending.retry = ms;
      } else {
        issueLog.push({ code: "bad-retry", line: line.trim() });
      }
    } else {
      issueLog.push({ code: "unknown-field", line: line.trim() });
    }
    return null;
  };

  /** Splits complete lines on CRLF, LF or CR. A trailing lone `\r` is held —
   * it may be the first half of a CRLF arriving in the next chunk. */
  const extractLines = (): string[] => {
    const lines: string[] = [];
    let start = 0;
    const terminators = /\r\n|\n|\r/g;
    for (let match = terminators.exec(buffer); match !== null; match = terminators.exec(buffer)) {
      if (match[0] === "\r" && match.index === buffer.length - 1) break;
      lines.push(buffer.slice(start, match.index));
      start = match.index + match[0].length;
    }
    buffer = buffer.slice(start);
    return lines;
  };

  return {
    feed(chunk) {
      if (!seenBom) {
        // a UTF-8 BOM at stream start is not part of the first field name
        buffer = chunk.replace(/^\uFEFF/, "");
        seenBom = true;
      } else {
        buffer += chunk;
      }
      const frames: SseFrame[] = [];
      for (const line of extractLines()) {
        const frame = handleLine(line);
        if (frame) frames.push(frame);
      }
      return frames;
    },
    flush() {
      // a gateway that forgot the final blank line still gets its frame
      let rest = buffer;
      buffer = "";
      if (rest.endsWith("\r")) rest = rest.slice(0, -1);
      const frames: SseFrame[] = [];
      if (rest !== "") {
        for (const line of rest.split(/\r\n|\n|\r/)) {
          const frame = handleLine(line);
          if (frame) frames.push(frame);
        }
      }
      const last = dispatch();
      if (last) frames.push(last);
      return frames;
    },
    reset() {
      buffer = "";
      seenBom = false;
      pending = null;
      issueLog.length = 0;
    },
    get issues() {
      return issueLog;
    },
  };
}

/**
 * parseSseChunk — stateless convenience for text known to be complete
 * (tests, replayed fixtures). For live network streams prefer `createSseParser`.
 *
 * @param chunk the complete SSE text.
 * @returns every frame found, in order.
 */
export function parseSseChunk(chunk: string): SseFrame[] {
  const parser = createSseParser();
  const frames = parser.feed(chunk);
  return [...frames, ...parser.flush()];
}

/**
 * isDoneFrame — whether the frame is the OpenAI `[DONE]` sentinel.
 *
 * @param frame the frame to test.
 */
export function isDoneFrame(frame: SseFrame): boolean {
  return frame.data.trim() === SSE_DONE;
}

/**
 * jsonDataOf — strict JSON decode of a frame payload with a typed error.
 *
 * @typeParam T the expected decoded shape.
 * @param frame the frame carrying the payload.
 * @returns the decoded value.
 * @throws SseDataError when the payload is not valid JSON.
 */
export function jsonDataOf<T>(frame: SseFrame): T {
  try {
    return JSON.parse(frame.data) as T;
  } catch {
    throw new SseDataError(`the SSE frame payload is not valid JSON (${frame.data.slice(0, 60)}…)`, frame.data);
  }
}

/** The typed event shape the Sol workbench streams carry: `event:` + JSON `data:`. */
export type SseEvent<T = Record<string, unknown>> = { type: string; data: T };

/**
 * sseEvents — the drop-in extraction of the parser that used to live inside
 * Sol/panel/panel.tsx: every frame that carries both an `event:` name and a
 * JSON `data:` payload. Frames without either, and payloads that fail to
 * decode, are skipped (the stream keeps flowing) — same contract, now backed
 * by the canonical resilient core.
 *
 * @param chunk a complete slice of SSE text (between blank-line boundaries).
 * @returns the decoded events in order.
 */
export function sseEvents<T = Record<string, unknown>>(chunk: string): SseEvent<T>[] {
  const out: SseEvent<T>[] = [];
  for (const frame of parseSseChunk(chunk)) {
    if (frame.event === "" || frame.data === "") continue;
    try {
      out.push({ type: frame.event, data: JSON.parse(frame.data) as T });
    } catch {
      // malformed payload: skip, never break the stream
    }
  }
  return out;
}
