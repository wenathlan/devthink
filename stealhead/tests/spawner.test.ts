// # spawner.test — honest unit tests for the spawn selection and respawn
// pacing, runnable with the node built-in runner (no dependencies):
//   node --test tests/spawner.test.ts
// The prng is seeded, the seed rows are the real catalog, and every case
// checks exact replayable output — no mocks, no randomness, no dom.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildwave,
  campscore,
  DEFAULTSPAWNCONFIG,
  distance,
  duewaves,
  filterbymindistance,
  isprotected,
  makerng,
  nearestdistance,
  pickspawn,
  protectionuntil,
  respawnwait,
  SPAWNSEED,
  type SpawnPick,
  type SpawnQuery,
  scorepoints,
  selectspawn,
  shortlist,
  spawnpointsformap,
  spawnpointsforteam,
  withdeath,
} from "../spawner.ts";

/** a plain spawn query over steelhead dam for team ember. */
function damquery(extra: Partial<SpawnQuery> = {}): SpawnQuery {
  return { map: "steelhead dam", team: "ember", enemies: [], occupied: [], deaths: [], tick: 0, ...extra };
}

describe("seeded prng", () => {
  it("replays the same sequence for the same seed", () => {
    const a = makerng(7);
    const b = makerng(7);
    const seqa = [a(), a(), a()];
    const seqb = [b(), b(), b()];
    assert.deepEqual(seqa, seqb);
    assert.equal(makerng(7)(), seqa[0]);
  });

  it("stays inside [0, 1) and diverges across seeds", () => {
    const a = makerng(1);
    const b = makerng(2);
    for (let i = 0; i < 16; i++) {
      const va = a();
      assert.ok(va >= 0 && va < 1);
      assert.notEqual(va, b());
    }
  });
});

describe("catalog filters", () => {
  it("filters points by map and by team with neutral flow", () => {
    assert.equal(spawnpointsformap(SPAWNSEED, "steelhead dam").length, 4);
    assert.equal(spawnpointsforteam(SPAWNSEED, "steelhead dam", "ember").length, 2);
    assert.equal(spawnpointsforteam(SPAWNSEED, "rift yard", "tide").length, 4);
    assert.equal(spawnpointsformap(SPAWNSEED, "no such map").length, 0);
  });

  it("drops points inside the hard radius of blocked positions", () => {
    const dam = spawnpointsforteam(SPAWNSEED, "steelhead dam", "ember");
    const kept = filterbymindistance(dam, [dam[0].position], DEFAULTSPAWNCONFIG.mindistance);
    assert.deepEqual(
      kept.map((point) => point.id),
      ["sd-e2"],
    );
    assert.equal(filterbymindistance(dam, [], 12).length, 2);
  });

  it("measures distances and the nearest of a cloud", () => {
    assert.ok(Math.abs(distance({ x: 0, y: 0, z: 0 }, { x: 3, y: 0, z: 4 }) - 5) < 1e-9);
    assert.equal(nearestdistance({ x: 0, y: 0, z: 0 }, []), Infinity);
    assert.equal(
      nearestdistance({ x: 0, y: 0, z: 0 }, [
        { x: 3, y: 0, z: 4 },
        { x: 1, y: 0, z: 0 },
      ]),
      1,
    );
  });
});

describe("scoring and lottery", () => {
  it("decays camp pressure by the half-life inside the radius", () => {
    const point = SPAWNSEED[0];
    assert.equal(campscore(point, [], 0, DEFAULTSPAWNCONFIG), 0);
    const fresh = campscore(point, [{ position: point.position, tick: 400 }], 400, DEFAULTSPAWNCONFIG);
    assert.equal(fresh, 1);
    const aged = campscore(point, [{ position: point.position, tick: 0 }], 400, DEFAULTSPAWNCONFIG);
    assert.ok(Math.abs(aged - 0.5) < 1e-9);
    const far = campscore(point, [{ position: { x: 500, y: 0, z: 500 }, tick: 400 }], 400, DEFAULTSPAWNCONFIG);
    assert.equal(far, 0);
  });

  it("scores full weight when enemies are far and sorts descending", () => {
    const picks = scorepoints(spawnpointsforteam(SPAWNSEED, "steelhead dam", "ember"), damquery(), DEFAULTSPAWNCONFIG);
    assert.equal(picks.length, 2);
    assert.equal(picks[0].score, 1);
    assert.equal(picks[1].score, 0.8);
    assert.equal(picks[0].point.id, "sd-e1");
  });

  it("discounts the score when an enemy camped the point", () => {
    const point = SPAWNSEED[0];
    const query = damquery({ deaths: [{ position: point.position, tick: 100 }], tick: 100 });
    const picks = scorepoints([point], query, DEFAULTSPAWNCONFIG);
    assert.ok(picks[0].score < 0.01);
  });

  it("shortlists and runs the score-proportional lottery", () => {
    const picks: SpawnPick[] = [
      { point: SPAWNSEED[0], score: 1 },
      { point: SPAWNSEED[2], score: 3 },
      { point: SPAWNSEED[4], score: 0.5 },
    ];
    assert.equal(shortlist(picks, 2).length, 2);
    assert.equal(pickspawn(picks, () => 0.1).point.id, "sd-e1");
    assert.equal(pickspawn(picks, () => 0.5).point.id, "sd-t1");
    assert.equal(pickspawn(picks, () => 0.999).point.id, "ch-e1");
  });
});

describe("the spawn pipeline", () => {
  it("picks deterministically for the same seed", () => {
    const first = selectspawn(SPAWNSEED, damquery(), DEFAULTSPAWNCONFIG, makerng(7));
    const second = selectspawn(SPAWNSEED, damquery(), DEFAULTSPAWNCONFIG, makerng(7));
    assert.ok(first);
    assert.equal(first.point.id, second?.point.id);
    assert.ok(SPAWNSEED.some((point) => point.id === first.point.id));
  });

  it("returns null when safety or stacking filters wipe the map", () => {
    const dam = spawnpointsforteam(SPAWNSEED, "steelhead dam", "ember");
    const stacked = selectspawn(
      SPAWNSEED,
      damquery({ occupied: dam.map((point) => point.position) }),
      DEFAULTSPAWNCONFIG,
      makerng(7),
    );
    assert.equal(stacked, null);
    const unsafe = selectspawn(
      SPAWNSEED,
      damquery({ enemies: dam.map((point) => point.position) }),
      DEFAULTSPAWNCONFIG,
      makerng(7),
    );
    assert.equal(unsafe, null);
  });

  it("hard-filters enemies near a point even when others survive", () => {
    const near = SPAWNSEED[0].position;
    const pick = selectspawn(
      SPAWNSEED,
      damquery({ enemies: [{ x: near.x + 5, y: 0, z: near.z }] }),
      DEFAULTSPAWNCONFIG,
      makerng(7),
    );
    assert.ok(pick);
    assert.notEqual(pick.point.id, "sd-e1");
  });
});

describe("respawn pacing", () => {
  it("prunes death marks older than the window", () => {
    const marks = withdeath(
      [
        { position: { x: 0, y: 0, z: 0 }, tick: 0 },
        { position: { x: 1, y: 0, z: 0 }, tick: 500 },
      ],
      { position: { x: 2, y: 0, z: 0 }, tick: 600 },
      400,
    );
    assert.equal(marks.length, 2);
    assert.equal(marks[marks.length - 1].tick, 600);
  });

  it("escalates the respawn wait 1.5x per death and caps it", () => {
    assert.equal(respawnwait(1, DEFAULTSPAWNCONFIG), 50);
    assert.equal(respawnwait(3, DEFAULTSPAWNCONFIG), 113);
    assert.equal(respawnwait(10, DEFAULTSPAWNCONFIG), 400);
  });

  it("grants and expires spawn protection", () => {
    assert.equal(protectionuntil(100, DEFAULTSPAWNCONFIG), 160);
    assert.equal(isprotected(protectionuntil(100, DEFAULTSPAWNCONFIG), 159), true);
    assert.equal(isprotected(protectionuntil(100, DEFAULTSPAWNCONFIG), 160), false);
  });
});

describe("wave scheduling", () => {
  it("schedules waves on the interval grid", () => {
    const config = { waves: 3, countperwave: 5, intervalticks: 100 };
    assert.deepEqual(buildwave(config, 2, 50), { wave: 2, startat: 150, count: 5 });
    assert.deepEqual(buildwave(config, 1, 50), { wave: 1, startat: 50, count: 5 });
  });

  it("lists only the waves due inside the window", () => {
    const config = { waves: 3, countperwave: 5, intervalticks: 100 };
    assert.equal(duewaves(config, 0, 250).length, 3);
    assert.equal(duewaves(config, 0, 150).length, 2);
    assert.equal(duewaves(config, 0, 0).length, 1);
    assert.deepEqual(duewaves(config, 1000, 0), []);
  });
});
