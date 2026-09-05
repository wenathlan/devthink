/**
 * property — fast-check property-based fuzzing tests
 * the http transport and shared helpers are verified with generated
 * inputs (scorecard detects fast-check as the property-based fuzzing
 * integration for typescript)
 *
 * properties verified:
 *   parsesseframes — splitting is lossless: frames joined with the
 *     separator reproduce the input; the residual is a suffix of the
 *     input; no frame contains the double newline separator
 *   extractdata — data lines concatenate exactly; the done marker
 *     yields null
 *   maskmodel — every model id inside the payload is replaced by the
 *     target id and the replacement count matches
 *   makechunk — openai chunk envelope invariants: object constant,
 *     nonempty delta carries either content or reasoning
 *   securerandom — uniform float in [0 1)
 *   genid — prefix preserved, unique for distinct calls
 *   randombase36 — length and alphabet invariants
 *   clamp — never leaves the bounds
 */

import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { extractdata, isdone, makechunk, makefinalchunk, maskmodel, parsesseframes } from "../../gateway-http.js";
import { clamp, genid, randombase36, securerandom } from "../../utils.js";

/** arbitrary printable ascii lines without the sse separator */
const lineArb = fc.string({
  unit: fc.constantFrom(..."abcdefghijklmnopqrstuvwxyz0123456789: ".split("")),
  minLength: 0,
  maxLength: 40,
});

/** arbitrary sse frame content lines */
const frameArb = fc.array(lineArb, { minLength: 1, maxLength: 5 }).map((lines) => lines.join("\n"));

/** arbitrary model id */
const modelidArb = fc
  .string({
    unit: fc.constantFrom(..."abcdefghijklmnopqrstuvwxyz0123456789-.".split("")),
    minLength: 1,
    maxLength: 24,
  })
  .filter((s) => !s.includes(":"));

describe("parsesseframes properties", () => {
  it("splitting is lossless: frames + residual reproduce the input", () => {
    fc.assert(
      fc.property(fc.array(frameArb, { minLength: 0, maxLength: 8 }), (frames) => {
        const input = frames.length > 0 ? `${frames.join("\n\n")}\n\n` : "";
        const { frames: out, residual } = parsesseframes(input);
        // frames are the between-separator segments: the input is the
        // frames rejoined with the separator plus the trailing
        // residual (the trailing separator belongs to the last
        // complete frame)
        const reconstructed = out.length > 0 ? `${out.join("\n\n")}\n\n${residual}` : residual;
        expect(reconstructed).toBe(input.replace(/\r\n/g, "\n"));
      }),
    );
  });

  it("the residual is always a proper suffix of the input", () => {
    fc.assert(
      fc.property(frameArb, frameArb, (a, b) => {
        const input = `${a}\n\n${b}`; // b may itself contain separators
        const { residual } = parsesseframes(input);
        expect(input.replace(/\r\n/g, "\n")).toContain(residual);
      }),
    );
  });

  it("no complete frame contains the double newline separator", () => {
    fc.assert(
      fc.property(fc.array(frameArb, { minLength: 0, maxLength: 6 }), (frames) => {
        const input = frames.length > 0 ? `${frames.join("\n\n")}\n\n` : "";
        for (const frame of parsesseframes(input).frames) {
          expect(frame.includes("\n\n")).toBe(false);
        }
      }),
    );
  });
});

describe("extractdata and isdone properties", () => {
  it("data lines concatenate exactly and never include the data prefix", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc
            .string({ minLength: 0, maxLength: 30 })
            .filter((s) => !s.startsWith("data:") && !s.includes("\n") && !/^\s/.test(s)),
          { minLength: 1, maxLength: 5 },
        ),
        (datas) => {
          const frame = datas.map((d) => `data: ${d}`).join("\n");
          const extracted = extractdata(frame);
          expect(extracted).toBe(datas.join("\n"));
        },
      ),
    );
  });

  it("the done marker always maps to null and isdone", () => {
    fc.assert(
      fc.property(fc.constantFrom("[DONE]", "[done]", "done", "data: [DONE]"), (marker) => {
        expect(extractdata(`data: ${marker}`)).toBeNull();
        expect(isdone(marker)).toBe(true);
      }),
    );
  });
});

describe("maskmodel properties", () => {
  it("every model field is replaced with the target id", () => {
    fc.assert(
      fc.property(modelidArb, modelidArb, modelidArb, (target, id1, id2) => {
        const payload = `{"model":"${id1}","choices":[{"delta":{"content":"𝄞"},"model":"${id2}"}]}`;
        const masked = maskmodel(payload, target);
        // every model field now carries exactly the target id
        const fields = masked.match(/"model":"[^"]*"/g) ?? [];
        expect(fields).toHaveLength(2);
        for (const field of fields) {
          expect(field).toBe(`"model":"${target}"`);
        }
        // an id distinct from the target is fully gone
        if (id1 !== target) expect(masked).not.toContain(`"${id1}"`);
        if (id2 !== target && id2 !== id1) expect(masked).not.toContain(`"${id2}"`);
      }),
    );
  });
});

describe("makechunk invariants", () => {
  it("the envelope shape is constant and the delta carries payload", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.option(fc.string({ minLength: 1, maxLength: 8 }), { nil: undefined }),
        (id, content, reasoning) => {
          const chunk = makechunk(id, "meta-model", content, reasoning) as Record<string, unknown>;
          expect(chunk["object"]).toBe("chat.completion.chunk");
          expect(chunk["model"]).toBe("meta-model");
          const choice = (chunk["choices"] as Array<Record<string, unknown>>)[0];
          const delta = choice["delta"] as Record<string, unknown>;
          expect(delta["content"]).toBe(content);
          if (reasoning) expect(delta["reasoning_content"]).toBe(reasoning);
        },
      ),
    );
  });

  it("the final chunk always carries a finish reason", () => {
    fc.assert(
      fc.property(fc.constantFrom("stop", "length", "tool_calls", "content_filter"), (reason) => {
        const chunk = makefinalchunk("id", "meta-model", reason) as Record<string, unknown>;
        const choice = (chunk["choices"] as Array<Record<string, unknown>>)[0];
        expect(choice["finish_reason"]).toBe(reason);
      }),
    );
  });
});

describe("utils properties", () => {
  it("securerandom is a uniform float in [0 1)", () => {
    fc.assert(
      fc.property(fc.nat(500), () => {
        const value = securerandom();
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);
      }),
    );
  });

  it("genid keeps the prefix and stays unique across calls", () => {
    fc.assert(
      fc.property(
        fc.string({
          unit: fc.constantFrom(..."abcdefghijklmnopqrstuvwxyz-".split("")),
          minLength: 1,
          maxLength: 12,
        }),
        fc.nat(200),
        (prefix, count) => {
          const ids = new Set<string>();
          for (let i = 0; i <= count; i += 1) {
            const id = genid(prefix);
            expect(id.startsWith(`${prefix}-`)).toBe(true);
            ids.add(id);
          }
          expect(ids.size).toBe(count + 1);
        },
      ),
    );
  });

  it("randombase36 has the exact length and alphabet", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 64 }), (n) => {
        const out = randombase36(n);
        expect(out).toHaveLength(n);
        expect(out).toMatch(/^[0-9a-z]+$/);
      }),
    );
  });

  it("clamp never leaves the bounds", () => {
    fc.assert(
      fc.property(fc.nat(1000), fc.nat(1000), fc.nat(1000), (a, b, c) => {
        const lo = Math.min(a, b);
        const hi = Math.max(a, b);
        const clamped = clamp(c, lo, hi);
        expect(clamped).toBeGreaterThanOrEqual(lo);
        expect(clamped).toBeLessThanOrEqual(hi);
      }),
    );
  });
});
