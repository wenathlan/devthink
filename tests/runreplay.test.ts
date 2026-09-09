import { describe, expect, it } from "vitest";
import { appendlogentry, openrunlog, sealrunlog, verifylogchain } from "../security.js";
import {
  replaycursorof,
  replayjump,
  replaymove,
  replayplay,
  replayrestoredview,
  replaystepof,
  replayviewaction,
  runreplaysessionof,
} from "../run.js";
import { runreplaygate } from "../policy.js";

const now = 1_800_000_000_000;

async function sealedlog() {
  let log = openrunlog({ runid: "run1", sessionid: "run1", now });
  log = await appendlogentry({
    log,
    kind: "step",
    summary: "The focus step s1 completed on https://example.com with observation 4.",
    origin: "https://example.com",
    stepid: "s1",
    at: now + 1000,
  });
  log = await appendlogentry({
    log,
    kind: "gate",
    summary: "The confirmpay gate opened for s2 and resolved after a human action; the capture c-99 evidences it.",
    origin: "https://example.com",
    stepid: "s2",
    at: now + 2000,
  });
  log = await appendlogentry({
    log,
    kind: "step",
    summary: "The click step s2 completed.",
    origin: "https://example.com",
    stepid: "s2",
    at: now + 3000,
  });
  return sealrunlog(log, now + 4000);
}

describe("runreplay of sealed runs", () => {
  it("gates the replay to sealed runs with verified chains", () => {
    expect(runreplaygate({ sealed: false, chainvalid: true }).allowed).toBe(false);
    expect(runreplaygate({ sealed: false, chainvalid: true }).reason).toMatch(/sealed runs only/);
    expect(runreplaygate({ sealed: true, chainvalid: false }).allowed).toBe(false);
    expect(runreplaygate({ sealed: true, chainvalid: true }).allowed).toBe(true);
  });

  it("walks the sealed chain step by step and restores observation and capture refs", async () => {
    const sealed = await sealedlog();
    const gates = [{ gateid: "s2", kind: "confirmpay", resolution: "approve", at: now + 2500 }];
    const session = runreplaysessionof({ runid: sealed.seal.runid, entries: sealed.log.entries, gates, now });
    expect(session.steps).toHaveLength(3);
    expect(session.cursor).toBe(0);
    expect(session.playing).toBe(false);
    expect(session.steps[0]?.observationversion).toBe(4);
    expect(session.steps[1]?.captureid).toBe("c-99");
    expect(session.steps[1]?.gateresolutions).toHaveLength(1);
    expect(session.steps[2]?.gateresolutions).toHaveLength(1);
    expect(session.steps[0]?.gateresolutions).toHaveLength(0);
    expect(() => runreplaysessionof({ runid: " ", entries: sealed.log.entries, now })).toThrow(/run id/);
    expect(() => runreplaysessionof({ runid: "r", entries: [], now })).toThrow(/at least one/);
    const step = replaystepof(sealed.log.entries[0] as never, 0, gates);
    expect(step.summary).toMatch(/observation 4/);
  });

  it("steps forward, backward and jumps to a chosen step with viewer actions recorded", async () => {
    const sealed = await sealedlog();
    const session = runreplaysessionof({ runid: sealed.seal.runid, entries: sealed.log.entries, now });
    const forward = replaymove(session, "forward", now + 10);
    expect(forward.cursor).toBe(1);
    expect(forward.actions[forward.actions.length - 1]?.kind).toBe("step");
    const backward = replaymove(forward, "backward", now + 20);
    expect(backward.cursor).toBe(0);
    const jumped = replayjump(backward, "s2", now + 30);
    expect(jumped.cursor).toBe(1);
    expect(jumped.actions[jumped.actions.length - 1]?.stepid).toBe("s2");
    expect(() => replayjump(backward, "unknown", now)).toThrow(/knows no unknown/);
    const played = replayplay(jumped, true, now + 40);
    expect(played.playing).toBe(true);
    const paused = replayplay(played, false, now + 50);
    expect(paused.playing).toBe(false);
    const acted = replayviewaction(paused, { kind: "pause", at: now + 60 });
    expect(acted.actions).toHaveLength(6);
    const edge = replaymove(session, "backward", now + 70);
    expect(edge.cursor).toBe(0);
    const last = replaymove(replaymove(replaymove(session, "forward", now), "forward", now), "forward", now);
    expect(last.cursor).toBe(2);
    expect(replaymove(last, "forward", now).cursor).toBe(2);
  });

  it("reads the restored view and the stored cursor of the viewed run", async () => {
    const sealed = await sealedlog();
    const gates = [{ gateid: "s2", kind: "confirmpay", resolution: "approve", at: now + 2500 }];
    const session = replaymove(
      runreplaysessionof({ runid: sealed.seal.runid, entries: sealed.log.entries, gates, now }),
      "forward",
      now + 10,
    );
    const restored = replayrestoredview(session.steps[session.cursor] as never);
    expect(restored.captureid).toBe("c-99");
    expect(restored.gateresolutions[0]?.resolution).toBe("approve");
    const cursor = replaycursorof(session);
    expect(cursor).toEqual({ runid: sealed.seal.runid, cursor: 1, playing: false });
    const verification = await verifylogchain(sealed.log.entries);
    expect(verification.valid).toBe(true);
  });
});
