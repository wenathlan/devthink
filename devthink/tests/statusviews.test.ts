import { describe, expect, it } from "vitest";
import {
  badgetextof,
  badgecolorof,
  countlabel,
  notifyattentionof,
  notifydoneof,
  notificationrespectsdnd,
  pluralize,
  recenttrayactions,
  recenttrayafter,
  recenttrayentryof,
  statusbadgeof,
  stetoasthistory,
  stetoastof,
  stetoaststackafter,
} from "../views.js";
import { notificationcontentgate } from "../policy.js";

const now = 1_800_000_000_000;

describe("statusbadge, notifications, recenttray and stetoasts", () => {
  it("derives the statusbadge states and counts the waiting gates", () => {
    expect(statusbadgeof({ waitingcount: 0 }).state).toBe("idle");
    expect(statusbadgeof({ planstate: "approved", waitingcount: 0, runid: "run-1" }).state).toBe("running");
    expect(statusbadgeof({ planstate: "pending", waitingcount: 0 }).state).toBe("waiting");
    const attention = statusbadgeof({ planstate: "approved", waitingcount: 2, runid: "run-1" });
    expect(attention.state).toBe("attention");
    expect(attention.waitingcount).toBe(2);
    expect(badgetextof(attention)).toBe("2");
    expect(badgetextof(statusbadgeof({ planstate: "approved", waitingcount: 0 }))).toBe("run");
    expect(badgetextof(statusbadgeof({ waitingcount: 0 }))).toBe("");
    expect(badgecolorof(attention)).toBe(badgecolorof({ ...attention }));
  });

  it("builds the done and attention payloads with deep links and gates the page content", () => {
    const done = notifydoneof({
      runid: "run-1",
      origin: "https://example.com",
      summary: "The pricing table landed in 8 steps.",
      at: now,
    });
    expect(done.kind).toBe("done");
    expect(done.deeplink).toBe("#run-run-1");
    expect(done.content).toBe(false);
    const attention = notifyattentionof({
      runid: "run-1",
      stepid: "step-3",
      cause: "gatewait",
      reason: "The fillform step waits for its consent.",
      at: now,
    });
    expect(attention.kind).toBe("attention");
    expect(attention.deeplink).toBe("#step-step-3");
    expect(attention.content).toBe(false);
    expect(() =>
      notifyattentionof({ runid: "run-1", stepid: " ", cause: "gatewait", reason: "waits", at: now }),
    ).toThrow(/waiting step/);
    expect(notificationcontentgate({ content: false, consent: false }).allowed).toBe(true);
    expect(notificationcontentgate({ content: true, consent: false }).reason).toMatch(
      /never shows without its consent/,
    );
    expect(notificationcontentgate({ content: true, consent: true }).allowed).toBe(true);
    expect(() =>
      notifyattentionof({
        runid: "run-1",
        stepid: "s",
        cause: "phishguard",
        reason: "r",
        content: true,
        consent: false,
        at: now,
      }),
    ).toThrow(/consent/);
    expect(
      notifyattentionof({
        runid: "run-1",
        stepid: "s",
        cause: "phishguard",
        reason: "r",
        content: true,
        consent: true,
        at: now,
      }).content,
    ).toBe(true);
    /* the 2.0.2 plural fix of the rc.2 final polish: the counted fallback bodies read their own grammar while the composers without counts keep their exact legacy sentences */
    const singular = notifydoneof({
      runid: "run-2",
      origin: "https://example.com",
      summary: "",
      steps: 1,
      captures: 1,
      at: now,
    });
    expect(singular.body).toContain("of the 1 step beside 1 capture");
    const plural = notifydoneof({
      runid: "run-2",
      origin: "https://example.com",
      summary: "",
      steps: 8,
      captures: 4,
      at: now,
    });
    expect(plural.body).toContain("of the 8 steps beside 4 captures");
    const countsless = notifydoneof({ runid: "run-2", origin: "https://example.com", summary: "", at: now });
    expect(countsless.body).toBe("The run of https://example.com completed; the runsummary holds every step outcome.");
    const localized = notifydoneof({
      runid: "run-2",
      origin: "https://example.com",
      summary: "",
      steps: 8,
      language: "pt",
      at: now,
    });
    expect(localized.body).toContain("of the 8 etapas");
    const waits = notifyattentionof({
      runid: "run-1",
      stepid: "step-3",
      cause: "gatewait",
      reason: "The fillform step waits for its consent.",
      at: now,
    });
    expect(waits.body).toBe("The fillform step waits for its consent.");
    expect(
      notifyattentionof({
        runid: "run-1",
        stepid: "step-3",
        cause: "gatewait",
        reason: "one gate holds.",
        waitinggates: 1,
        at: now,
      }).body,
    ).toContain("(1 gate waiting)");
    expect(
      notifyattentionof({
        runid: "run-1",
        stepid: "step-3",
        cause: "gatewait",
        reason: "three gates hold.",
        waitinggates: 3,
        at: now,
      }).body,
    ).toContain("(3 gates waiting)");
  });

  it("pluralizes the counted nouns of the notification texts in english and the shipped pt bundle", () => {
    expect(pluralize(1, "step")).toBe("step");
    expect(pluralize(3, "step")).toBe("steps");
    expect(pluralize(0, "step")).toBe("steps");
    expect(pluralize(1, "capture")).toBe("capture");
    expect(pluralize(4, "capture")).toBe("captures");
    expect(pluralize(2, "run")).toBe("runs");
    expect(pluralize(2, "gate")).toBe("gates");
    expect(pluralize(1, "step", "pt")).toBe("etapa");
    expect(pluralize(3, "step", "pt")).toBe("etapas");
    expect(pluralize(1, "capture", "pt")).toBe("captura");
    expect(pluralize(4, "capture", "pt")).toBe("capturas");
    expect(pluralize(2, "run", "pt")).toBe("execuções");
    expect(pluralize(2, "gate", "pt")).toBe("verificações");
    expect(pluralize(1, "selector", "pt")).toBe("selector");
    expect(countlabel(1, "step")).toBe("1 step");
    expect(countlabel(3, "step")).toBe("3 steps");
    expect(countlabel(1, "capture")).toBe("1 capture");
    expect(countlabel(4, "capture")).toBe("4 captures");
    expect(countlabel(0, "run")).toBe("0 runs");
    expect(countlabel(3, "step", "pt")).toBe("3 etapas");
    expect(countlabel(4, "capture", "pt")).toBe("4 capturas");
  });

  it("respects the os do not disturb state while the deep link stays in the history", () => {
    const done = notifydoneof({ runid: "run-1", origin: "https://example.com", summary: "done", at: now });
    const quiet = notificationrespectsdnd(done, true);
    expect(quiet.show).toBe(false);
    expect(quiet.reason).toMatch(/do not disturb/);
    expect(notificationrespectsdnd(done, false).show).toBe(true);
  });

  it("lists the latest runs in the recenttray with resume and reopen offers", () => {
    const halted = recenttrayentryof({
      runid: "run-1",
      origin: "https://example.com",
      outcome: "halted",
      title: "Pricing pass",
      at: now,
    });
    const completed = recenttrayentryof({
      runid: "run-2",
      origin: "https://example.com",
      outcome: "completed",
      title: "Invoice sweep",
      at: now + 1,
    });
    const running = recenttrayentryof({
      runid: "run-3",
      origin: "https://example.com",
      outcome: "running",
      title: "Live pass",
      at: now + 2,
    });
    expect(recenttrayactions(halted)).toEqual(["resume"]);
    expect(recenttrayactions(completed)).toEqual(["reopen"]);
    expect(recenttrayactions(running)).toEqual([]);
    const unbounded = recenttrayafter([halted, completed], running, undefined);
    expect(unbounded.map((entry) => entry.runid)).toEqual(["run-3", "run-1", "run-2"]);
    const bounded = recenttrayafter([halted, completed], running, 2);
    expect(bounded.map((entry) => entry.runid)).toEqual(["run-3", "run-1"]);
    expect(
      recenttrayafter(
        [halted],
        recenttrayentryof({
          runid: "run-1",
          origin: "https://example.com",
          outcome: "completed",
          title: "again",
          at: now,
        }),
        undefined,
      ),
    ).toHaveLength(1);
    expect(() =>
      recenttrayentryof({ runid: " ", origin: "https://example.com", outcome: "halted", title: "t", at: now }),
    ).toThrow(/run id/);
  });

  it("confirms step completion with stetoasts that stack inside the user live count", () => {
    const first = stetoastof({ stepid: "step-1", kind: "readtable", durationms: 250, at: now });
    const second = stetoastof({ stepid: "step-2", kind: "click", durationms: 90, at: now + 1 });
    expect(second.kind).toBe("click");
    const unbounded = stetoaststackafter([first], second, undefined);
    expect(unbounded.live).toHaveLength(2);
    const bounded = stetoaststackafter([first], second, 1);
    expect(bounded.live).toEqual([second]);
    expect(bounded.history).toHaveLength(2);
    expect(stetoasthistory(bounded.history)[0]?.stepid).toBe("step-2");
    expect(() => stetoastof({ stepid: " ", kind: "click", durationms: 1, at: now })).toThrow(/step/);
  });
});
