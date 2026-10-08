// # remixplan.test — honest unit tests for the remix planner (beat similarity,
// joint scoring, piece plans, crossfade gains), runnable with the node
// built-in runner (no dependencies, no install):
//   node --test tests/remixplan.test.ts
// The fixtures synthesise a 32-beat loop whose features repeat every 3 beats.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  beatSimilarity,
  bestTargetBeat,
  chromaMatch,
  cosineSimilarity,
  equalPowerGain,
  identityPlan,
  jumpScore,
  MINPIECEBEATS,
  pieceAtOutputBeat,
  planCuts,
  planJoints,
  planLength,
  planRemix,
  type RemixPlan,
  segmentCount,
  selfSimilarity,
  similarityAt,
  timbreMatch,
  validatePlan,
  variationWindow,
  XFADESECONDS,
} from "../remixplan.ts";

/** One-hot chroma cycling through three pitch classes, cepstra varying per beat. */
function analysis(beats = 32): { beatcount: number; chroma: number[][]; cepstra: number[][] } {
  const chroma = Array.from({ length: beats }, (_, i) => {
    const v = new Array(12).fill(0);
    v[i % 3] = 1;
    return v;
  });
  const cepstra = Array.from({ length: beats }, (_, i) => Array.from({ length: 12 }, (_, k) => 0.1 * ((i + k) % 5)));
  return { beatcount: beats, chroma, cepstra };
}

describe("feature similarity", () => {
  it("scores identical chroma high, orthogonal chroma mid, and differs by timbre", () => {
    const one = new Array(12).fill(0);
    one[4] = 2;
    const other = new Array(12).fill(0);
    other[7] = 1;
    assert.ok(Math.abs(chromaMatch(one, one) - 1) < 1e-9);
    assert.ok(Math.abs(chromaMatch(one, other) - 0.5) < 1e-9);
    assert.equal(cosineSimilarity([], []), 0);
    const a = analysis().cepstra[1];
    assert.ok(timbreMatch(a, a) > 0.99);
    assert.ok(timbreMatch(a, analysis().cepstra[2]) < timbreMatch(a, a));
    assert.ok(beatSimilarity(analysis(), 0, 3) > beatSimilarity(analysis(), 0, 1));
  });

  it("builds a symmetric self-similarity matrix with unit diagonal", () => {
    const matrix = selfSimilarity(analysis(12));
    assert.equal(matrix.size, 12);
    assert.equal(similarityAt(matrix, 3, 3), 1);
    assert.equal(similarityAt(matrix, 1, 4), similarityAt(matrix, 4, 1));
    assert.ok(similarityAt(matrix, 1, 4) > similarityAt(matrix, 1, 2));
    assert.equal(similarityAt(matrix, 99, 0), 0);
  });

  it("scores jumps along the period diagonals best", () => {
    const matrix = selfSimilarity(analysis(12));
    assert.ok(jumpScore(matrix, 2, 5) > jumpScore(matrix, 2, 6));
    assert.equal(jumpScore(matrix, 2, 5, 0), 0);
    assert.equal(bestTargetBeat(matrix, 8, 5, 11), 8);
  });
});

describe("plan construction", () => {
  it("plans a deterministic retime whose pieces cover the target exactly", () => {
    const params = { segments: 50, variations: 50, targetbeats: 16 };
    const plan = planRemix(analysis(), params);
    assert.ok(plan.ok, plan.ok ? "" : plan.message);
    const value: RemixPlan = plan.value;
    assert.equal(planLength(value), 16);
    assert.equal(value.xfadeseconds, XFADESECONDS);
    assert.equal(segmentCount(50), 2);
    assert.ok(value.pieces.every((piece) => piece.lengthbeats >= MINPIECEBEATS));
    assert.ok(value.pieces.every((piece) => piece.startbeat >= 0 && piece.startbeat + piece.lengthbeats <= 32));
    assert.equal(validatePlan(value, 32).ok, true);
    const again = planRemix(analysis(), params);
    assert.deepEqual(again.ok ? again.value : {}, value);
  });

  it("keeps intro and outro and lands joints at similar contexts", () => {
    const plan = planRemix(analysis(), { segments: 0, variations: 100, targetbeats: 20 });
    assert.ok(plan.ok);
    const [piece] = plan.value.pieces;
    assert.equal(piece.startbeat, 0);
    const cuts = planCuts(plan.value);
    assert.ok(
      cuts.every(
        ([outgoing, incoming]) => Math.abs(outgoing - incoming) % 3 === 0 || Math.abs(outgoing - incoming) > 3,
      ),
    );
  });

  it("refuses short music, short targets and mismatched features", () => {
    assert.equal(
      planRemix(analysis(10), { segments: 50, variations: 50, targetbeats: 8 }).ok ? "" : "too-short",
      "too-short",
    );
    assert.equal(
      planRemix(analysis(), { segments: 50, variations: 50, targetbeats: 5 }).ok ? "" : "target-too-short",
      "target-too-short",
    );
    assert.equal(
      planRemix(analysis(), { segments: 100, variations: 50, targetbeats: 5 }).ok ? "" : "target-too-short",
      "target-too-short",
    );
    const broken = analysis();
    broken.chroma = broken.chroma.slice(0, 20);
    assert.equal(
      planRemix(broken, { segments: 50, variations: 50, targetbeats: 16 }).ok ? "" : "bad-params",
      "bad-params",
    );
  });

  it("answers the identity plan and reads pieces by output beat", () => {
    const plan = identityPlan(12);
    assert.equal(plan.pieces.length, 1);
    assert.equal(planLength(plan), 12);
    assert.deepEqual(planJoints(plan), []);
    assert.equal(pieceAtOutputBeat(plan, 3), plan.pieces[0]);
    const spliced = planRemix(analysis(), { segments: 34, variations: 0, targetbeats: 16 });
    assert.ok(spliced.ok);
    assert.deepEqual(planJoints(spliced.value), [5, 11]);
    assert.ok(pieceAtOutputBeat(spliced.value, 10).startbeat > 0);
  });
});

describe("crossfade and validation", () => {
  it("gives the equal-power pair with constant loudness at the middle", () => {
    assert.deepEqual(equalPowerGain(0)[1].toFixed(6), "0.000000");
    const [midOut, midIn] = equalPowerGain(0.5);
    assert.ok(Math.abs(midOut - Math.SQRT1_2) < 1e-9);
    assert.ok(Math.abs(midOut ** 2 + midIn ** 2 - 1) < 1e-9);
    const [endOut] = equalPowerGain(1);
    assert.equal(endOut.toFixed(6), "0.000000");
    const clamped = equalPowerGain(5);
    assert.equal(clamped[0].toFixed(6), "0.000000");
  });

  it("rejects plans whose pieces leave the source or break the minimum", () => {
    assert.equal(validatePlan(identityPlan(12), 12).ok, true);
    const bad = planRemix(analysis(), { segments: 50, variations: 50, targetbeats: 16 });
    assert.ok(bad.ok);
    const damaged: RemixPlan = { pieces: [{ startbeat: 28, lengthbeats: 10 }], xfadeseconds: 0.02 };
    assert.equal(validatePlan(damaged, 32).ok ? "" : "bad-plan", "bad-plan");
    const stutter: RemixPlan = {
      pieces: [
        { startbeat: 0, lengthbeats: 2 },
        { startbeat: 4, lengthbeats: 14 },
      ],
      xfadeseconds: 0.02,
    };
    assert.equal(validatePlan(stutter, 32).ok ? "" : "bad-plan", "bad-plan");
    assert.equal(variationWindow(100), 8);
    assert.equal(variationWindow(-5), 1);
  });
});
