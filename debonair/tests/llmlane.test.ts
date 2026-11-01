// # llmlane.test — the ai seat of the generation lane over an injected
// fake fetch: the happy walk (the model answers a valid debonair.pattern/1
// document — the instruction paragraph and the free-text prompt ride the
// chat completions route of the family gateway, the parsed plan answers
// with the seat facts), the honest model refusal (a model that answers no
// parsable pattern fails bad-model, never a silent fallback), the wire
// codes the family clients share (400 bad-request with the gateway's own
// message, the other statuses refused, a 2xx body that fails the shape
// guard bad-response, the silent gateway timeout on the injectable
// window, the network offline), the empty prompt refusal and the
// not-configured origin (the opt-in law — no origin configured answers
// offline before any call leaves the host).
// runnable with vitest: pnpm vitest run tests/llmlane.test.ts
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { composeWithLlm, LLM_DEFAULT_MODEL, llmlaneorigin } from "../llmlane.ts";
import { EMBEDDING_DIM, PATTERN_SCHEMA_VERSION } from "../patternenums.ts";

/** The gateway origin every call rides (a public https host — the law). */
const ORIGIN = "https://gateway.example.com";

/** The valid pattern document the model answers in the happy walk — the
 * same shape the patternenums fixtures ride (the enum vocabulary, the
 * lane laws, the embedding dimension). */
function modelAnswer(): string {
  return JSON.stringify({
    schema: PATTERN_SCHEMA_VERSION,
    bpm: 140,
    root: 9,
    scale: "harmonic-minor",
    bars: 4,
    mood: "dark trap",
    prompt: "808 sub and dark bells",
    drums: {
      kick: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
      snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      hat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
      clap: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    },
    notes: [
      { step: 0, pitch: 33, vel: 0.9, dur: 4, voice: "bass" },
      { step: 0, pitch: 69, vel: 0.8, dur: 2, voice: "pluck" },
      { step: 4, pitch: 72, vel: 0.65, dur: 1, voice: "bell" },
    ],
    embedding: Array.from({ length: EMBEDDING_DIM }, (_, i) => ((i * 7) % 100) / 100),
  });
}

/** Builds one fake fetch answering the given body and status (the seam
 * the tests hand — the lane never touches the host network). */
function fakefetch(body: unknown, status = 200): (input: string, init?: RequestInit) => Promise<Response> {
  return async (input: string, init?: RequestInit) => {
    void input;
    void init;
    return new Response(JSON.stringify(body), { status });
  };
}

/** A fetch that never answers inside the window (the silent gateway — it
 * rejects on the abort signal the way the real fetch seam does). */
const neverfetch = (input: string, init?: RequestInit): Promise<Response> =>
  new Promise<Response>((resolve, reject) => {
    void input;
    init?.signal?.addEventListener("abort", () => {
      reject(new DOMException("The operation was aborted.", "AbortError"));
    });
    void resolve;
  });

/** A fetch that refuses the network (the offline lane). */
const offlinefetch = (): Promise<Response> => Promise.reject(new Error("the network is down"));

describe("the ai lane answers the family gateway seat", () => {
  it("composes one pattern plan from the model answer and pins the seat facts", async () => {
    const calls: { url: string; body: Record<string, unknown> }[] = [];
    const fetchImpl = async (input: string, init?: RequestInit): Promise<Response> => {
      calls.push({ url: input, body: JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown> });
      return new Response(
        JSON.stringify({ choices: [{ message: { content: modelAnswer() } }] }),
        { status: 200 },
      );
    };
    const result = await composeWithLlm({ prompt: "dark trap with 808 sub", origin: ORIGIN, deps: { fetchImpl } });
    assert.ok(result.ok, "the happy walk answers ok");
    assert.equal(result.data.plan.schema, PATTERN_SCHEMA_VERSION);
    assert.equal(result.data.plan.bpm, 140);
    assert.equal(result.data.model, LLM_DEFAULT_MODEL, "the model defaults to the family meta model");
    assert.equal(result.data.origin, ORIGIN);
    assert.equal(calls.length, 1, "one call leaves the host");
    assert.ok(calls[0].url.startsWith(`${ORIGIN}/v1/chat/completions`), "the openai-compatible route carries the call");
    const messages = calls[0].body.messages as { role: string; content: string }[];
    assert.equal(messages.length, 2, "the instruction and the prompt ride the call");
    assert.equal(messages[0].role, "system");
    assert.ok(messages[0].content.includes(PATTERN_SCHEMA_VERSION), "the instruction paragraph carries the schema law");
    assert.equal(messages[1].role, "user");
    assert.equal(messages[1].content, "dark trap with 808 sub");
    assert.equal(calls[0].body.model, LLM_DEFAULT_MODEL);
    assert.equal(calls[0].body.stream, false);
  });

  it("answers bad-model when the model answer fails the pattern law — never a silent fallback", async () => {
    const result = await composeWithLlm({
      prompt: "make it dark",
      origin: ORIGIN,
      deps: { fetchImpl: fakefetch({ choices: [{ message: { content: "here is your song idea!" } }] }) },
    });
    assert.ok(!result.ok);
    assert.equal(result.error.code, "bad-model");
    assert.ok(result.error.message.includes("the pattern law"), "the refusal carries the honest reason");
  });

  it("answers bad-request when the gateway refuses the facts with a 400", async () => {
    const result = await composeWithLlm({
      prompt: "make it dark",
      origin: ORIGIN,
      deps: { fetchImpl: fakefetch({ error: { message: "the model seat is paused" } }, 400) },
    });
    assert.ok(!result.ok);
    assert.equal(result.error.code, "bad-request");
    assert.equal(result.error.message, "the model seat is paused");
    assert.equal(result.error.status, 400);
  });

  it("answers refused when the gateway answers a status outside the 2xx lane", async () => {
    const result = await composeWithLlm({
      prompt: "make it dark",
      origin: ORIGIN,
      deps: { fetchImpl: fakefetch({ error: { message: "overloaded" } }, 503) },
    });
    assert.ok(!result.ok);
    assert.equal(result.error.code, "refused");
    assert.equal(result.error.status, 503);
  });

  it("answers bad-response when the 2xx body fails the shape guard", async () => {
    const result = await composeWithLlm({
      prompt: "make it dark",
      origin: ORIGIN,
      deps: { fetchImpl: fakefetch({ hello: "world" }) },
    });
    assert.ok(!result.ok);
    assert.equal(result.error.code, "bad-response");
  });

  it("answers timeout when the gateway keeps silent past the window", async () => {
    const result = await composeWithLlm({
      prompt: "make it dark",
      origin: ORIGIN,
      timeoutMs: 40,
      deps: { fetchImpl: neverfetch },
    });
    assert.ok(!result.ok);
    assert.equal(result.error.code, "timeout");
  });

  it("answers offline when the network never answers", async () => {
    const result = await composeWithLlm({
      prompt: "make it dark",
      origin: ORIGIN,
      deps: { fetchImpl: offlinefetch },
    });
    assert.ok(!result.ok);
    assert.equal(result.error.code, "offline");
  });

  it("refuses the empty prompt before any call leaves the host", async () => {
    const calls: unknown[] = [];
    const result = await composeWithLlm({
      prompt: "   ",
      origin: ORIGIN,
      deps: {
        fetchImpl: async (input: string) => {
          calls.push(input);
          return new Response("{}", { status: 200 });
        },
      },
    });
    assert.ok(!result.ok);
    assert.equal(result.error.code, "bad-request");
    assert.equal(calls.length, 0, "no byte leaves the host");
  });

  it("answers offline when the family gateway origin is not configured (the opt-in law)", async () => {
    const calls: unknown[] = [];
    const result = await composeWithLlm({
      prompt: "make it dark",
      origin: "",
      deps: {
        fetchImpl: async (input: string) => {
          calls.push(input);
          return new Response("{}", { status: 200 });
        },
      },
    });
    assert.ok(!result.ok);
    assert.equal(result.error.code, "offline");
    assert.ok(result.error.message.includes("VITE_GETRY_URL"), "the refusal names the origin law");
    assert.equal(calls.length, 0, "no byte leaves the host");
    assert.equal(llmlaneorigin(), null, "the deploy seat answers not-configured without an env origin");
  });
});
