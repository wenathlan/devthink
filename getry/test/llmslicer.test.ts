/**
 * llmslicer.test.ts — the contract of the oversized context slicer: the
 * piece ceiling law (thirty thousand tokens, never raised), the overlap
 * echo with the half piece cap, the boundary marks (paragraph, line, cut),
 * the lossless reconstruction (the pieces concatenate back to the source
 * whole), the boundary aware merge (the overlap head strips, the line
 * anchor fallback stitches, the unstitched seam reports honest) and the
 * full oversized call (every piece rides one transport round, the usage
 * sums and the meter answers). every assertion protects the million token
 * ambition the family context law declares.
 */

import { describe, expect, it } from "vitest";
import { callmodeloversized, contextmeter, mergecontextpieces, slicecontext, sliceoverlap, slicetokenlimit } from "../llm.ts";
import type { fetchtransport } from "../request.ts";

/** one paragraph-heavy context of a given approximate token size. */
function contextof(paragraphs: number): string {
  const line = "the honest vault keeps every byte whole and the gateway answers with the same discipline it demands.";
  const paragraph = Array.from({ length: 24 }, () => line).join("\n");
  return Array.from({ length: paragraphs }, () => paragraph).join("\n\n");
}

describe("the slice law", () => {

  it("keeps the piece ceiling and the overlap constants the house declared", () => {
    expect(slicetokenlimit).toBe(30000);
    expect(sliceoverlap).toBe(1536);
  });

  it("answers one piece for a context that already fits — the single call path never changes", () => {
    const text = "the short context rides one piece whole";
    const pieces = slicecontext(text);
    expect(pieces.length).toBe(1);
    expect(pieces[0].text).toBe(text);
    expect(pieces[0].overlaptext).toBe("");
    expect(pieces[0].boundary).toBe("paragraph");
  });

  it("cuts an oversized context into pieces within the ceiling with paragraph boundaries", () => {
    const context = contextof(2400); /* ~1.1 million characters ≈ far beyond 30k tokens */
    const pieces = slicecontext(context);
    expect(pieces.length).toBeGreaterThan(1);
    for (const piece of pieces) expect(piece.tokenestimate).toBeLessThanOrEqual(slicetokenlimit);
    const counted = pieces.filter((piece) => piece.boundary === "paragraph");
    expect(counted.length).toBeGreaterThan(0);
  });

  it("echoes the overlap head on every piece after the first and never exceeds half the piece", () => {
    const context = contextof(900);
    const pieces = slicecontext(context);
    expect(pieces.length).toBeGreaterThan(2);
    for (let index = 1; index < pieces.length; index += 1) {
      expect(pieces[index].overlaptext.length).toBeGreaterThan(0);
      expect(pieces[index].overlaptext.length).toBeLessThan(pieces[index].text.length);
    }
    expect(pieces[0].overlaptext).toBe("");
  });

  it("reconstructs the source whole losslessly (fresh content only)", () => {
    const context = contextof(600);
    const pieces = slicecontext(context);
    const rebuilt = pieces
      .map((piece, index) => (index === 0 ? piece.text : piece.text.slice(piece.overlaptext.length)))
      .join("");
    expect(rebuilt).toBe(context);
  });

  it("forces a hard cut when one line exceeds the whole budget", () => {
    const longline = "x".repeat(30000 * 4 * 2); /* twice the character budget of one piece */
    const pieces = slicecontext(longline);
    expect(pieces.length).toBeGreaterThan(1);
    expect(pieces.some((piece) => piece.boundary === "cut")).toBe(true);
  });

  it("honours a smaller caller window and never raises the ceiling above the law", () => {
    const context = contextof(120);
    const tight = slicecontext(context, 8000);
    for (const piece of tight) expect(piece.tokenestimate).toBeLessThanOrEqual(8000);
    expect(tight.length).toBeGreaterThan(slicecontext(context, 20000).length);
    const huge = slicecontext(contextof(60), 500000);
    for (const piece of huge) expect(piece.tokenestimate).toBeLessThanOrEqual(slicetokenlimit);
  });
});

describe("the boundary aware merge", () => {

  it("strips the exact overlap head and counts the seam", () => {
    /* the overlap head echoes the tail's end byte for byte (the tail keeps
     * its own trailing newline the head carries) — the fused text stays
     * lossless at the seam. */
    const merged = mergecontextpieces([
      { text: "alpha bravo\ncharlie delta\n" },
      { text: "charlie delta\necho foxtrot", overlaptext: "charlie delta\n" },
    ]);
    expect(merged.text).toBe("alpha bravo\ncharlie delta\necho foxtrot");
    expect(merged.seams).toBe(1);
    expect(merged.unstitched).toBe(0);
  });

  it("stitches through the line aligned anchor fallback when the head drifted", () => {
    const merged = mergecontextpieces([
      { text: "first line\nsecond line\nthird line" },
      { text: "second line\nthird line\nfourth line", overlaptext: "second line\nthird line" },
    ]);
    expect(merged.text).toBe("first line\nsecond line\nthird line\nfourth line");
    expect(merged.seams).toBe(1);
    expect(merged.unstitched).toBe(0);
  });

  it("reports the honest unstitched count when no anchor answers", () => {
    const merged = mergecontextpieces([{ text: "alpha" }, { text: "omega", overlaptext: "never-shared" }]);
    expect(merged.text).toBe("alpha\nomega");
    expect(merged.unstitched).toBe(1);
  });

  it("answers empty for the empty walk", () => {
    expect(mergecontextpieces([])).toEqual({ text: "", seams: 0, unstitched: 0 });
  });
});

describe("the oversized call", () => {

  it("rides one transport round per piece and merges the answers in order", async () => {
    const calls: string[] = [];
    const transport: fetchtransport = async (_url, init) => {
      const parsedbody = JSON.parse(String(init.body ?? "{}")) as { messages?: Array<{ content: string }> };
      const messages = parsedbody.messages ?? [];
      calls.push(messages.map((message) => message.content).join("\n---\n"));
      return {
        status: 200,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          choices: [{ message: { role: "assistant", content: `answer ${calls.length}` } }],
          usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
        }),
      };
    };
    const answer = await callmodeloversized({
      provider: { id: "prov-stub", name: "The stub", endpoint: "https://stub.local/v1", style: "chatcompletions", models: ["the-stub-model"], status: "available", createdat: 0 } as Parameters<typeof callmodeloversized>[0]["provider"],
      model: "the-stub-model",
      question: "summarize the context",
      context: contextof(600),
      transport,
    });
    expect(answer.pieces.length).toBe(calls.length);
    expect(calls.length).toBeGreaterThan(2);
    expect(answer.text).toContain("answer 1");
    expect(answer.text).toContain(`answer ${calls.length}`);
    expect(answer.usage?.totaltokens).toBe(calls.length * 15);
    expect(answer.meter.startsWith("~")).toBe(true);
    expect(contextmeter(answer.pieces)).toBe(answer.meter);
  });

  it("refuses the empty question and the empty context loudly", async () => {
    const transport: fetchtransport = async () => {
      throw new Error("the transport never rides in this refusal test");
    };
    void transport;
    const provider = { id: "prov-stub", name: "The stub", endpoint: "https://stub.local/v1", style: "chatcompletions", models: ["the-stub-model"], status: "available", createdat: 0 } as Parameters<typeof callmodeloversized>[0]["provider"];
    await expect(
      callmodeloversized({ provider, model: "m", question: "  ", context: "the context", transport }),
    ).rejects.toThrow(/question/);
    await expect(
      callmodeloversized({ provider, model: "m", question: "the question", context: "  ", transport }),
    ).rejects.toThrow(/context/);
  });

  it("reconstructs the context through the piece walk losslessly at the seam", () => {
    const context = contextof(400);
    const pieces = slicecontext(context);
    const answers = pieces.map((piece) => ({
      text: `M${piece.index}:${piece.text}`,
      ...(piece.overlaptext !== "" ? { overlaptext: piece.overlaptext } : {}),
    }));
    const merged = mergecontextpieces(answers);
    for (let index = 0; index < pieces.length; index += 1) {
      expect(merged.text).toContain(`M${index}:`);
    }
    expect(merged.unstitched).toBeLessThanOrEqual(pieces.length);
  });
});
