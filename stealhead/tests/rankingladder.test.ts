// # rankingladder.test — honest unit tests for the elo ladder arithmetic,
// runnable with the node built-in runner (no dependencies, no install):
//   node --test tests/rankingladder.test.ts
// Every k table, ceiling and floor arrives as a parameter — the tests pass
// their own season config, exactly as a caller would.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { applydelta, expectedscore, kfactor, laddererror, projectedrating, rankduel, ratingdelta, type LadderOptions } from "../rankingladder.ts";

/** the season config the tests play with: 32/24/16 bands like the classic tables. */
const SEASON: LadderOptions = {
  ktable: [
    { minrating: 0, maxrating: 2100, k: 32 },
    { minrating: 2100, maxrating: 2400, k: 24 },
    { minrating: 2400, maxrating: Number.POSITIVE_INFINITY, k: 16 },
  ],
  maxdelta: 40,
  floorrating: 100,
  scale: 400,
};

describe("ranking ladder expected score", () => {
  it("answers one half for equal ratings", () => {
    assert.equal(expectedscore(1500, 1500, SEASON), 0.5);
  });

  it("answers the classic 0.909 for a 400 point favorite", () => {
    const expected = expectedscore(1900, 1500, SEASON);
    assert.ok(Math.abs(expected - 0.909) < 0.001, `expected ~0.909, got ${expected}`);
    assert.ok(expectedscore(1500, 1900, SEASON) < 0.1);
  });

  it("mirrors around one half", () => {
    const up = expectedscore(1700, 1500, SEASON);
    const down = expectedscore(1500, 1700, SEASON);
    assert.ok(Math.abs(up + down - 1) < 1e-9);
  });

  it("refuses non finite ratings", () => {
    assert.throws(() => expectedscore(Number.NaN, 1500, SEASON), (error: unknown) => {
      assert.ok(error instanceof laddererror);
      assert.equal(error.code, "bad-rating");
      return true;
    });
  });
});

describe("ranking ladder k factor", () => {
  it("picks the band the rating falls into", () => {
    assert.equal(kfactor(1500, SEASON.ktable), 32);
    assert.equal(kfactor(2200, SEASON.ktable), 24);
    assert.equal(kfactor(2500, SEASON.ktable), 16);
    assert.equal(kfactor(2399.9, SEASON.ktable), 24);
  });

  it("serves a different table when the season passes one", () => {
    assert.equal(kfactor(1500, [{ minrating: 0, maxrating: Number.POSITIVE_INFINITY, k: 10 }]), 10);
  });

  it("refuses an empty table, a non positive k and an uncovered rating", () => {
    assert.throws(() => kfactor(1500, []), (error: unknown) => {
      assert.ok(error instanceof laddererror);
      assert.equal(error.code, "bad-ktable");
      return true;
    });
    assert.throws(() => kfactor(1500, [{ minrating: 0, maxrating: 1000, k: 32 }]), laddererror);
    assert.throws(() => kfactor(1500, [{ minrating: 0, maxrating: Number.POSITIVE_INFINITY, k: 0 }]), laddererror);
  });
});

describe("ranking ladder deltas", () => {
  it("rewards a win by k * (1 - expected) and penalizes the mirrored loss", () => {
    const win = ratingdelta(1500, 1500, "win", SEASON);
    assert.equal(win, 16); // k 32, expected 0.5
    const loss = ratingdelta(1500, 1500, "loss", SEASON);
    assert.equal(loss, -16);
  });

  it("pays less to the favorite and more to the underdog", () => {
    const favorite = ratingdelta(1900, 1500, "win", SEASON);
    const underdog = ratingdelta(1500, 1900, "win", SEASON);
    assert.ok(favorite > 0 && favorite < 4, `favorite should earn little, got ${favorite}`);
    assert.ok(underdog > 28, `underdog should earn a lot, got ${underdog}`);
  });

  it("scales with the k table the caller passes", () => {
    const low = ratingdelta(1500, 1500, "win", { ...SEASON, ktable: [{ minrating: 0, maxrating: Number.POSITIVE_INFINITY, k: 8 }] });
    assert.equal(low, 4);
  });

  it("clamps the delta to the season ceiling", () => {
    const clamped = ratingdelta(1500, 3500, "win", { ...SEASON, maxdelta: 20 });
    assert.ok(clamped <= 20, `expected the clamp to hold, got ${clamped}`);
    const floored = ratingdelta(3500, 900, "loss", { ...SEASON, maxdelta: 20 });
    assert.ok(floored >= -20, `expected the clamp to hold, got ${floored}`);
  });

  it("grades a draw as half a win against an equal opponent", () => {
    assert.equal(ratingdelta(1500, 1500, "draw", SEASON), 0);
    assert.ok(ratingdelta(1500, 1900, "draw", SEASON) > 0);
  });

  it("refuses an unknown outcome", () => {
    assert.throws(() => ratingdelta(1500, 1500, "forfeit" as "win", SEASON), (error: unknown) => {
      assert.ok(error instanceof laddererror);
      assert.equal(error.code, "bad-outcome");
      return true;
    });
  });
});

describe("ranking ladder duels and projections", () => {
  it("applies the floor when a big loss sinks the rating", () => {
    assert.equal(applydelta(120, -90, 100), 100);
    assert.equal(applydelta(1500, -30, 100), 1470);
  });

  it("rates both sides of a duel with mirrored deltas", () => {
    const result = rankduel({ id: "vanta.k", rating: 1600 }, { id: "coldsnap", rating: 1400 }, "win", SEASON);
    assert.ok(result.player.delta > 0 && result.opponent.delta < 0);
    assert.ok(Math.abs(result.expected - 0.76) < 0.001, `expected ~0.760, got ${result.expected}`);
    assert.equal(result.player.rating, 1600 + result.player.delta);
    assert.equal(result.opponent.rating, 1400 + result.opponent.delta);
  });

  it("compounds a winning streak through the running rating", () => {
    const opponents = [1500, 1500, 1500, 1500];
    const after = projectedrating(1500, opponents.map((opponent) => ({ opponent, outcome: "win" as const })), SEASON);
    assert.ok(after > 1550, `a streak should compound, got ${after}`);
    const recovered = projectedrating(after, opponents.map((opponent) => ({ opponent, outcome: "loss" as const })), SEASON);
    assert.ok(recovered < after);
  });
});
