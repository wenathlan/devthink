/**
 * json.policy.test.ts — the confidence policies of the json model (root
 * layer): the bands, the per-use table, the honest measurement, the
 * rollout ladder and the reference router with the rotation by hit history.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
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
} from "../json.policy.ts";

describe("the confidence bands", () => {
  it("acts above the high floor and escalates under the low one", () => {
    assert.equal(confidenceband(0.85), "act");
    assert.equal(confidenceband(0.6), "surface");
    assert.equal(confidenceband(0.3), "escalate");
  });

  it("accepts custom thresholds and refuses inverted ones", () => {
    assert.equal(confidenceband(0.7, { high: 0.65, low: 0.4 }), "act");
    assert.throws(
      () => confidenceband(0.5, { high: 0.4, low: 0.6 }),
      (error: unknown) => error instanceof policyerror && error.code === "bad-band"
    );
    assert.throws(
      () => confidenceband(Number.NaN),
      (error: unknown) => error instanceof policyerror && error.code === "bad-band"
    );
  });
});

describe("the policy table", () => {
  it("carries the playbook per-use minimums as parameters", () => {
    const table = defaultpolicytable();
    assert.equal(policyfor(table, "choice").minconfidence, 0.55);
    assert.equal(policyfor(table, "reuse").minconfidence, 0.65);
    assert.equal(policyfor(table, "subagent").minconfidence, 0.75);
    assert.equal(policyfor(table, "stopretry").minconfidence, 0.55);
  });

  it("overrides a use wholesale and refuses unknown names", () => {
    const table = defaultpolicytable({ choice: { minconfidence: 0.4, fallback: { value: "proceed", reason: "default work" } } });
    assert.equal(policyfor(table, "choice").minconfidence, 0.4);
    assert.equal(policyfor(table, "choice").fallback?.value, "proceed");
    assert.throws(
      () => policyfor(table, "unknown"),
      (error: unknown) => error instanceof policyerror && error.code === "bad-table"
    );
  });

  it("refuses a doubled name, a broken floor and a typed fallback", () => {
    assert.throws(
      () => buildpolicytable([{ name: "a", policy: { minconfidence: 0.5 } }, { name: "A", policy: { minconfidence: 0.6 } }]),
      (error: unknown) => error instanceof policyerror && error.code === "bad-table"
    );
    assert.throws(
      () => buildpolicytable([{ name: "a", policy: { minconfidence: 1.5 } }]),
      (error: unknown) => error instanceof policyerror && error.code === "bad-table"
    );
    assert.throws(
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
    assert.equal(summary.total, 3);
    assert.equal(summary.bands.act, 2);
    assert.equal(summary.bands.surface, 1);
    assert.equal(summary.judgedhigh, 2);
    assert.equal(summary.righthigh, 1);
    assert.equal(log.summary()[0].question, "intent");
    const jsonl = log.tojsonl();
    assert.equal(jsonl.split("\n").length, 4);
    assert.equal(JSON.parse(jsonl.split("\n")[0]).action, "chat_only");
  });

  it("refuses a line without a question or with an out-of-range confidence", () => {
    const log = createmeasurement();
    assert.throws(
      () => log.record({ at: 0, question: " ", action: "x", confidence: 0.5, mode: "shadow" }),
      (error: unknown) => error instanceof policyerror && error.code === "bad-record"
    );
    assert.throws(
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
    assert.equal(review.verdict, "promote");
    assert.match(review.reason, /95%/);
  });

  it("demotes on kill accuracy and on a chronically medium question", () => {
    const log = createmeasurement();
    for (let index = 0; index < 30; index += 1) {
      log.record({ at: index, question: "intent", action: "ok", confidence: 0.85, mode: "active", expected: "ok", received: index < 18 ? "ok" : "other" });
    }
    assert.equal(reviewrollout(log.summary("intent")[0]).verdict, "demote");

    const chronic = createmeasurement();
    for (let index = 0; index < 6; index += 1) {
      chronic.record({ at: index, question: "split", action: "x", confidence: 0.6, mode: "shadow", expected: "x", received: "x" });
    }
    const review = reviewrollout(chronic.summary("split")[0]);
    assert.equal(review.verdict, "demote");
    assert.match(review.reason, /malformed/);
  });

  it("marks a short log insufficient and a healthy low-bar log keep-shadow", () => {
    const log = createmeasurement();
    log.record({ at: 0, question: "intent", action: "ok", confidence: 0.9, mode: "shadow", expected: "ok", received: "ok" });
    assert.equal(reviewrollout(log.summary("intent")[0]).verdict, "insufficient");
    const mid = createmeasurement();
    for (let index = 0; index < 20; index += 1) {
      mid.record({ at: index, question: "intent", action: "ok", confidence: 0.85, mode: "shadow", expected: "ok", received: index < 17 ? "ok" : "other" });
    }
    assert.equal(reviewrollout(mid.summary("intent")[0]).verdict, "keep-shadow");
  });
});

describe("the reference router", () => {
  it("serves the recipe of the form and rotates on a bad history", () => {
    const router = createreferencerouter({ routes: [{ form: "choice-intent", recipe: "triage", alternate: "rank-options" }] });
    assert.equal(router.route("  Choice-Intent "), "triage");
    for (let index = 0; index < 5; index += 1) router.record("choice-intent", false);
    assert.equal(router.route("choice-intent"), "rank-options");
    const stats = router.stats("choice-intent");
    assert.equal(stats.miss, 5);
    assert.equal(stats.accuracy, 0);
    assert.equal(stats.serving, "rank-options");
  });

  it("keeps the recipe while the history is short or healthy", () => {
    const router = createreferencerouter({ routes: [{ form: "yesno-retry", recipe: "retry-gate", alternate: "triage" }], minjudged: 5 });
    router.record("yesno-retry", true);
    router.record("yesno-retry", true);
    router.record("yesno-retry", false);
    assert.equal(router.route("yesno-retry"), "retry-gate");
    assert.equal(router.stats("yesno-retry").accuracy, 2 / 3);
    const healthy = createreferencerouter({ routes: [{ form: "score-effort", recipe: "triage", alternate: "rank-options" }], minjudged: 3 });
    for (let index = 0; index < 4; index += 1) healthy.record("score-effort", true);
    healthy.record("score-effort", false);
    assert.equal(healthy.route("score-effort"), "triage");
  });

  it("refuses an unknown form and a doubled route", () => {
    const router = createreferencerouter({ routes: [{ form: "a", recipe: "r" }] });
    assert.throws(
      () => router.route("b"),
      (error: unknown) => error instanceof policyerror && error.code === "bad-router"
    );
    assert.throws(
      () => createreferencerouter({ routes: [{ form: "a", recipe: "r" }, { form: "A", recipe: "s" }] }),
      (error: unknown) => error instanceof policyerror && error.code === "bad-router"
    );
    assert.throws(
      () => createreferencerouter({ routes: [] }),
      (error: unknown) => error instanceof policyerror && error.code === "bad-router"
    );
  });
});
