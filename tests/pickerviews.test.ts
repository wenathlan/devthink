import { describe, expect, it } from "vitest";
import {
  guidedtipdismiss,
  guidedtiprecall,
  guidedtips,
  haloof,
  halocolorof,
  lockcandidate,
  pagechipof,
  pagechipresolve,
  pickercandidateof,
  pickersessionstart,
  rankcandidates,
  stabilityscoreof,
} from "../views.js";
import { pickeroverlaygate } from "../policy.js";

const now = 1_800_000_000_000;

describe("pickeroverlay, targethalo, guidedtips and pagechips", () => {
  it("starts the picker session on the granted origin and refuses ungranted reads", () => {
    const candidates = [
      pickercandidateof({
        selector: "#pricing",
        text: "Pricing",
        role: "table",
        hasid: true,
        hasstableattributes: true,
        hasrole: true,
        textunique: true,
      }),
      pickercandidateof({
        selector: "div:nth-child(3) > table",
        hasid: false,
        hasstableattributes: false,
        hasrole: false,
        textunique: false,
      }),
    ];
    const session = pickersessionstart({
      origin: "https://example.com",
      granted: ["https://example.com"],
      candidates,
      at: now,
    });
    expect(session.candidates[0]?.selector).toBe("#pricing");
    expect(session.candidates[0]?.stabilityscore).toBe(90);
    expect(session.candidates[1]?.stabilityscore).toBeLessThan(session.candidates[0]?.stabilityscore ?? 0);
    expect(session.candidates[1]?.reason).toMatch(/positional/);
    expect(() =>
      pickersessionstart({ origin: "https://other.example", granted: ["https://example.com"], candidates, at: now }),
    ).toThrow(/allowlist/);
    expect(pickeroverlaygate({ origin: "https://example.com", granted: ["https://example.com"] }).allowed).toBe(true);
    expect(pickeroverlaygate({ origin: "https://other.example", granted: ["https://example.com"] }).reason).toMatch(
      /granted origins/,
    );
  });

  it("scores the selector stability and ranks the most stable candidate first", () => {
    expect(
      stabilityscoreof({ selector: "#id", hasid: true, hasstableattributes: true, hasrole: true, textunique: true }),
    ).toBe(90);
    expect(
      stabilityscoreof({
        selector: "div",
        hasid: false,
        hasstableattributes: false,
        hasrole: false,
        textunique: false,
      }),
    ).toBe(0);
    const ranked = rankcandidates([
      pickercandidateof({
        selector: "div:nth-child(2)",
        hasid: false,
        hasstableattributes: false,
        hasrole: false,
        textunique: false,
      }),
      pickercandidateof({
        selector: "[data-testid=price]",
        hasid: false,
        hasstableattributes: true,
        hasrole: false,
        textunique: true,
      }),
    ]);
    expect(ranked[0]?.selector).toBe("[data-testid=price]");
  });

  it("locks one candidate for the proposed step and refuses a second lock", () => {
    const session = pickersessionstart({
      origin: "https://example.com",
      granted: ["https://example.com"],
      candidates: [
        pickercandidateof({
          selector: "#pricing",
          hasid: true,
          hasstableattributes: true,
          hasrole: false,
          textunique: true,
        }),
      ],
      at: now,
    });
    const locked = lockcandidate(session, 0, "step-2");
    expect(locked.lockedstepid).toBe("step-2");
    expect(locked.lockedselector).toBe("#pricing");
    expect(() => lockcandidate(locked, 0, "step-3")).toThrow(/one candidate/);
    expect(() => lockcandidate(session, 5, "step-2")).toThrow(/candidate/);
  });

  it("colors the targethalo outline by step state", () => {
    const halo = haloof({
      stepid: "step-1",
      selector: "#pricing",
      rect: { x: 10, y: 20, width: 300, height: 80 },
      state: "running",
    });
    expect(halo.rect.width).toBe(300);
    const colors = new Set(
      ["pending", "running", "waiting", "done", "failed", "halted"].map((state) => halocolorof(state as "pending")),
    );
    expect(colors.size).toBe(6);
    expect(() =>
      haloof({ stepid: "s", selector: " ", rect: { x: 0, y: 0, width: 0, height: 0 }, state: "pending" }),
    ).toThrow(/selector/);
  });

  it("dismisses and recalls the guidedtips bound to the picker sessions", () => {
    const tips = guidedtips();
    expect(tips.length).toBeGreaterThanOrEqual(3);
    expect(tips.every((tip) => tip.pickerstep !== undefined)).toBe(true);
    const dismissed = guidedtipdismiss(tips, [], "selectorstability");
    expect(dismissed).toEqual(["selectorstability"]);
    expect(guidedtiprecall(dismissed)).toEqual([]);
    expect(() => guidedtipdismiss(tips, [], "unknown")).toThrow(/know no/);
  });

  it("resolves the pagechips to the immutable log like stepapprove", () => {
    const chip = pagechipof({ stepid: "step-4", selector: "#submit", origin: "https://example.com", at: now });
    const approved = pagechipresolve(chip, "approve", "page", now + 1);
    expect(approved.chip.resolution).toBe("approve");
    expect(approved.chip.resolvedat).toBe(now + 1);
    expect(approved.logevent.kind).toBe("review");
    expect(approved.logevent.summary).toMatch(/approved the step step-4/);
    expect(approved.logevent.summary).toMatch(/one distinct human action/);
    const rejected = pagechipresolve(chip, "reject", "sidepanel", now + 2);
    expect(rejected.logevent.summary).toMatch(/rejected the step step-4/);
    expect(() => pagechipresolve(chip, "approve", "background", now)).toThrow(/background never resolves/);
    expect(() => pagechipof({ stepid: " ", selector: "#submit", origin: "https://example.com", at: now })).toThrow(
      /step/,
    );
  });
});
