/**
 * jsonpolicy.test.ts — the confidence policies of the json model (root
 * layer): the bands, the per-use table, the honest measurement, the
 * rollout ladder and the reference router with the rotation by hit history.
 */
import { describe, expect, it } from "vitest";
import {
  buildpolicytable,
  confidenceband,
  createmeasurement,
  createreferencerouter,
  defaultpolicytable,
  policyerror,
  policyfor,
  reviewrollout,
  type MeasurementRecord,
} from "../jsonpolicy.ts";

/** Asserts the action throws and the error answers the checks. */
function throwswith(action: () => void, checks: (error: unknown) => boolean): void {
  let caught: unknown;
  let threw = false;
  try {
    action();
  } catch (error) {
    caught = error;
    threw = true;
  }
  expect(threw).toBe(true);
  expect(checks(caught)).toBe(true);
}

describe("the confidence bands", () => {
  it("acts above the high floor and escalates under the low one", () => {
    expect(confidenceband(0.85)).toBe("act");
    expect(confidenceband(0.6)).toBe("surface");
    expect(confidenceband(0.3)).toBe("escalate");
  });

  it("accepts custom thresholds and refuses inverted ones", () => {
    expect(confidenceband(0.7, { high: 0.65, low: 0.4 })).toBe("act");
    throwswith(
      () => confidenceband(0.5, { high: 0.4, low: 0.6 }),
      (error: unknown) => error instanceof policyerror && error.code === "bad-band"
    );
    throwswith(
      () => confidenceband(Number.NaN),
      (error: unknown) => error instanceof policyerror && error.code === "bad-band"
    );
  });
});

describe("the policy table", () => {
  it("carries the playbook per-use minimums as parameters", () => {
    const table = defaultpolicytable();
    expect(policyfor(table, "choice").minconfidence).toBe(0.55);
    expect(policyfor(table, "reuse").minconfidence).toBe(0.65);
    expect(policyfor(table, "subagent").minconfidence).toBe(0.75);
    expect(policyfor(table, "stopretry").minconfidence).toBe(0.55);
  });

  it("overrides a use wholesale and refuses unknown names", () => {
    const table = defaultpolicytable({ choice: { minconfidence: 0.4, fallback: { value: "proceed", reason: "default work" } } });
    expect(policyfor(table, "choice").minconfidence).toBe(0.4);
    expect(policyfor(table, "choice").fallback?.value).toBe("proceed");
    throwswith(
      () => policyfor(table, "unknown"),
      (error: unknown) => error instanceof policyerror && error.code === "bad-table"
    );
  });

  it("refuses a doubled name, a broken floor and a typed fallback", () => {
    throwswith(
      () => buildpolicytable([{ name: "a", policy: { minconfidence: 0.5 } }, { name: "A", policy: { minconfidence: 0.6 } }]),
      (error: unknown) => error instanceof policyerror && error.code === "bad-table"
    );
    throwswith(
      () => buildpolicytable([{ name: "a", policy: { minconfidence: 1.5 } }]),
      (error: unknown) => error instanceof policyerror && error.code === "bad-table"
    );
    throwswith(
      () => buildpolicytable([{ name: "a", policy: { minconfidence: 0.5, fallback: { value: ["no"] as unknown as string, reason: "x" } } }]),
      (error: unknown) => error instanceof policyerror && error.code === "bad-table"
    );
  });
});

describe("the honest measurement", () => {
  it("rolls the log up per question with the high band accuracy", () => {
    const log = createmeasurement();
    const lines: MeasurementRecord[] = [
      { at: 1, question: "intent", action: "chat_only", confidence: 0.9, mode: "shadow", expected: "chat_only", received: "chat_only" },
      { at: 2, question: "intent", action: "chat_only", confidence: 0.85, mode: "shadow", expected: "chat_only", received: "research_capped" },
      { at: 3, question: "intent", action: "research_capped", confidence: 0.6, mode: "shadow" },
      { at: 4, question: "retry", action: "stop_retry", confidence: 0.4, mode: "active", expected: "stop_retry", received: "stop_retry" },
    ];
    for (const line of lines) log.record(line);
    const summary = log.summary("intent")[0];
    expect(summary.total).toBe(3);
    expect(summary.bands.act).toBe(2);
    expect(summary.bands.surface).toBe(1);
    expect(summary.judgedhigh).toBe(2);
    expect(summary.righthigh).toBe(1);
    expect(log.summary()[0].question).toBe("intent");
    const jsonl = log.tojsonl();
    expect(jsonl.split("\n").length).toBe(4);
    expect(JSON.parse(jsonl.split("\n")[0]).action).toBe("chat_only");
  });

  it("refuses a line without a question or with an out-of-range confidence", () => {
    const log = createmeasurement();
    throwswith(
      () => log.record({ at: 0, question: " ", action: "x", confidence: 0.5, mode: "shadow" }),
      (error: unknown) => error instanceof policyerror && error.code === "bad-record"
    );
    throwswith(
      () => log.record({ at: 0, question: "intent", action: "x", confidence: 1.5, mode: "shadow" }),
      (error: unknown) => error instanceof policyerror && error.code === "bad-record"
    );
  });
});

describe("the rollout ladder", () => {
  it("promotes a question whose high band is right 9 of 10", () => {
    const log = createmeasurement();
    for (let index = 0; index < 20; index += 1) {
      log.record({ at: index, question: "intent", action: "ok", confidence: 0.9, mode: "shadow", expected: "ok", received: index < 19 ? "ok" : "other" });
    }
    const review = reviewrollout(log.summary("intent")[0], { minjudged: 20 });
    expect(review.verdict).toBe("promote");
    expect(review.reason).toMatch(/95%/);
  });

  it("demotes on kill accuracy and on a chronically medium question", () => {
    const log = createmeasurement();
    for (let index = 0; index < 30; index += 1) {
      log.record({ at: index, question: "intent", action: "ok", confidence: 0.85, mode: "active", expected: "ok", received: index < 18 ? "ok" : "other" });
    }
    expect(reviewrollout(log.summary("intent")[0]).verdict).toBe("demote");

    const chronic = createmeasurement();
    for (let index = 0; index < 6; index += 1) {
      chronic.record({ at: index, question: "split", action: "x", confidence: 0.6, mode: "shadow", expected: "x", received: "x" });
    }
    const review = reviewrollout(chronic.summary("split")[0]);
    expect(review.verdict).toBe("demote");
    expect(review.reason).toMatch(/malformed/);
  });

  it("marks a short log insufficient and a healthy low-bar log keep-shadow", () => {
    const log = createmeasurement();
    log.record({ at: 0, question: "intent", action: "ok", confidence: 0.9, mode: "shadow", expected: "ok", received: "ok" });
    expect(reviewrollout(log.summary("intent")[0]).verdict).toBe("insufficient");
    const mid = createmeasurement();
    for (let index = 0; index < 20; index += 1) {
      mid.record({ at: index, question: "intent", action: "ok", confidence: 0.85, mode: "shadow", expected: "ok", received: index < 17 ? "ok" : "other" });
    }
    expect(reviewrollout(mid.summary("intent")[0]).verdict).toBe("keep-shadow");
  });
});

describe("the reference router", () => {
  it("serves the recipe of the form and rotates on a bad history", () => {
    const router = createreferencerouter({ routes: [{ form: "choice-intent", recipe: "triage", alternate: "rank-options" }] });
    expect(router.route("  Choice-Intent ")).toBe("triage");
    for (let index = 0; index < 5; index += 1) router.record("choice-intent", false);
    expect(router.route("choice-intent")).toBe("rank-options");
    const stats = router.stats("choice-intent");
    expect(stats.miss).toBe(5);
    expect(stats.accuracy).toBe(0);
    expect(stats.serving).toBe("rank-options");
  });

  it("keeps the recipe while the history is short or healthy", () => {
    const router = createreferencerouter({ routes: [{ form: "yesno-retry", recipe: "retry-gate", alternate: "triage" }], minjudged: 5 });
    router.record("yesno-retry", true);
    router.record("yesno-retry", true);
    router.record("yesno-retry", false);
    expect(router.route("yesno-retry")).toBe("retry-gate");
    expect(router.stats("yesno-retry").accuracy).toBe(2 / 3);
    const healthy = createreferencerouter({ routes: [{ form: "score-effort", recipe: "triage", alternate: "rank-options" }], minjudged: 3 });
    for (let index = 0; index < 4; index += 1) healthy.record("score-effort", true);
    healthy.record("score-effort", false);
    expect(healthy.route("score-effort")).toBe("triage");
  });

  it("refuses an unknown form and a doubled route", () => {
    const router = createreferencerouter({ routes: [{ form: "a", recipe: "r" }] });
    throwswith(
      () => router.route("b"),
      (error: unknown) => error instanceof policyerror && error.code === "bad-router"
    );
    throwswith(
      () => createreferencerouter({ routes: [{ form: "a", recipe: "r" }, { form: "A", recipe: "s" }] }),
      (error: unknown) => error instanceof policyerror && error.code === "bad-router"
    );
    throwswith(
      () => createreferencerouter({ routes: [] }),
      (error: unknown) => error instanceof policyerror && error.code === "bad-router"
    );
  });
});
