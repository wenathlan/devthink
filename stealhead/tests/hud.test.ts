// # hud.test — honest unit tests for the hud state logic (vital bands,
// minimap transforms, hitmarkers, killfeed, damage pings), runnable with
// the node built-in runner (no dependencies, no install):
//   node --test tests/hud.test.ts
// Every case feeds plain structs and checks exact numbers — no dom, no
// rendering, no mocks, no randomness.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  activehitmarkers,
  applydamage,
  DAMAGESTRENGTHFLOOR,
  directionaldamage,
  effectivepool,
  HITWINDOWS,
  type Hitmarker,
  healthfraction,
  hitmarkerfor,
  hitmarkerwindow,
  isalive,
  KILLFEEDCAP,
  KILLFEEDTTL,
  type KillfeedEntry,
  killfeedline,
  minimapbounds,
  minimapconfig,
  poolfraction,
  prunekillfeed,
  pushhitmarker,
  pushkillfeed,
  sectorof,
  shieldfraction,
  tominimap,
  VITALTHRESHOLDS,
  type Vitals,
  vitaltier,
} from "../hud.ts";

/** full vitals: 100 health behind 50 shield. */
const FULL: Vitals = { health: 100, maxhealth: 100, shields: 50, maxshields: 50 };

/** a widget transform over a 100x100 world on a 200px map (10px rim). */
const WIDGET = { bounds: { minx: -50, minz: -50, maxx: 50, maxz: 50 }, sizepx: 200, padding: 10, yaw: 0 };

/** one killfeed row builder. */
function kill(id: string, at: number): KillfeedEntry {
  return { id, killer: "ember-1", victim: "tide-2", weapon: "raven", at, headshot: false };
}

describe("vital bands", () => {
  it("reads the pool fraction clamped to [0, 1]", () => {
    assert.equal(poolfraction(FULL), 1);
    assert.ok(Math.abs(poolfraction({ health: 40, maxhealth: 100, shields: 20, maxshields: 50 }) - 0.4) < 1e-9);
    assert.equal(poolfraction({ health: 999, maxhealth: 100, shields: 999, maxshields: 50 }), 1);
    assert.equal(poolfraction({ health: 0, maxhealth: 0, shields: 0, maxshields: 0 }), 0);
  });

  it("bands the vitals through the four thresholds", () => {
    assert.equal(vitaltier(FULL), "healthy");
    assert.equal(vitaltier({ health: 70, maxhealth: 100, shields: 10, maxshields: 50 }), "wounded");
    assert.equal(vitaltier({ health: 40, maxhealth: 100, shields: 10, maxshields: 50 }), "low");
    assert.equal(vitaltier({ health: 20, maxhealth: 100, shields: 0, maxshields: 50 }), "critical");
    assert.equal(VITALTHRESHOLDS.critical, 0.25);
    assert.equal(VITALTHRESHOLDS.wounded, 0.75);
  });

  it("applies damage with shields first and counts the overflow", () => {
    const shielded = applydamage(FULL, 30);
    assert.equal(shielded.absorbed, 30);
    assert.deepEqual(shielded.vitals, { health: 100, maxhealth: 100, shields: 20, maxshields: 50 });
    const spillover = applydamage({ health: 100, maxhealth: 100, shields: 20, maxshields: 50 }, 70);
    assert.equal(spillover.absorbed, 20);
    assert.equal(spillover.vitals.health, 50);
    assert.equal(spillover.overflow, 0);
    const lethal = applydamage({ health: 100, maxhealth: 100, shields: 0, maxshields: 50 }, 200);
    assert.equal(lethal.vitals.health, 0);
    assert.equal(lethal.overflow, 100);
    assert.equal(applydamage(FULL, -5).overflow, 0);
  });

  it("answers life and the armor-perk effective pool", () => {
    assert.equal(healthfraction(FULL), 1);
    assert.ok(Math.abs(healthfraction({ ...FULL, health: 25 }) - 0.25) < 1e-9);
    assert.ok(Math.abs(shieldfraction({ ...FULL, shields: 25 }) - 0.5) < 1e-9);
    assert.equal(shieldfraction({ health: 1, maxhealth: 1, shields: 0, maxshields: 0 }), 0);
    assert.equal(isalive(FULL), true);
    assert.equal(isalive({ health: 0, maxhealth: 100, shields: 50, maxshields: 50 }), false);
    assert.equal(effectivepool({ health: 50, maxhealth: 100, shields: 40, maxshields: 50 }, 0.5), 70);
    assert.equal(effectivepool({ health: 50, maxhealth: 100, shields: 40, maxshields: 50 }, 2), 90);
    assert.equal(effectivepool({ health: 50, maxhealth: 100, shields: 40, maxshields: 50 }, -1), 50);
  });
});

describe("minimap transform", () => {
  it("computes the padded bounds of a position cloud", () => {
    assert.deepEqual(
      minimapbounds(
        [
          { x: 0, z: 10 },
          { x: 30, z: -10 },
        ],
        5,
      ),
      { minx: -5, minz: -15, maxx: 35, maxz: 15 },
    );
    assert.deepEqual(minimapbounds([], 5), { minx: -5, minz: -5, maxx: 5, maxz: 5 });
  });

  it("maps the world with facing up and z flipped into screen y", () => {
    assert.deepEqual(tominimap(WIDGET, { x: 0, z: 0 }), { x: 90, y: 90, clamped: false });
    assert.deepEqual(tominimap(WIDGET, { x: 0, z: 40 }), { x: 90, y: 18, clamped: false });
    assert.deepEqual(tominimap(WIDGET, { x: 40, z: 0 }), { x: 162, y: 90, clamped: false });
  });

  it("rotates the world by the receiver yaw", () => {
    const rotated = minimapconfig(WIDGET.bounds, WIDGET.sizepx, Math.PI / 2, WIDGET.padding);
    assert.deepEqual(tominimap(rotated, { x: 40, z: 0 }), { x: 90, y: 18, clamped: false });
    assert.deepEqual(tominimap(rotated, { x: 0, z: -40 }), { x: 162, y: 90, clamped: false });
  });

  it("clamps outside positions onto the rim with the flag", () => {
    const rimmed = tominimap(WIDGET, { x: 100, z: 0 });
    assert.equal(rimmed.x, 190);
    assert.equal(rimmed.y, 90);
    assert.equal(rimmed.clamped, true);
    assert.equal(tominimap(WIDGET, { x: 10, z: 10 }).clamped, false);
  });
});

describe("hitmarkers", () => {
  it("ranks the kinds and exposes their windows", () => {
    assert.equal(hitmarkerfor(true, true), "kill");
    assert.equal(hitmarkerfor(false, true), "headshot");
    assert.equal(hitmarkerfor(false, false), "body");
    assert.equal(hitmarkerwindow("body"), HITWINDOWS.body);
    assert.equal(hitmarkerwindow("headshot"), HITWINDOWS.headshot);
    assert.equal(hitmarkerwindow("kill"), HITWINDOWS.kill);
  });

  it("keeps only the markers still inside their window", () => {
    const markers: Hitmarker[] = [
      { id: "m1", at: 0, kind: "body" },
      { id: "m2", at: 100, kind: "headshot" },
      { id: "m3", at: 300, kind: "kill" },
    ];
    assert.deepEqual(
      activehitmarkers(markers, 400).map((marker) => marker.id),
      ["m2", "m3"],
    );
    assert.equal(activehitmarkers(markers, 900).length, 0);
    assert.equal(pushhitmarker(markers, { id: "m4", at: 500, kind: "body" }).length, 4);
  });
});

describe("killfeed", () => {
  it("dedups by id and caps the feed", () => {
    const feed = pushkillfeed([], kill("k1", 100));
    const refreshed = pushkillfeed(feed, { ...kill("k1", 150), victim: "tide-3" });
    assert.equal(refreshed.length, 1);
    assert.equal(refreshed[0].at, 150);
    assert.equal(refreshed[0].victim, "tide-3");
    let capped: KillfeedEntry[] = [];
    for (let i = 0; i < 8; i++) capped = pushkillfeed(capped, kill(`k${i}`, i * 100));
    assert.equal(capped.length, KILLFEEDCAP);
    assert.equal(capped[0].id, "k2");
    assert.equal(capped[capped.length - 1].id, "k7");
  });

  it("expires rows past the ttl", () => {
    const feed = [kill("k1", 1000), kill("k2", 7000)];
    assert.deepEqual(
      prunekillfeed(feed, 8500, KILLFEEDTTL).map((row) => row.id),
      ["k1", "k2"],
    );
    assert.deepEqual(
      prunekillfeed(feed, 9100, KILLFEEDTTL).map((row) => row.id),
      ["k2"],
    );
  });

  it("renders the plain feed line with the headshot mark", () => {
    assert.equal(killfeedline(kill("k1", 0)), "ember-1 [raven] tide-2");
    assert.equal(killfeedline({ ...kill("k1", 0), headshot: true }), "ember-1 [raven] tide-2 ⊕");
  });
});

describe("directional damage", () => {
  it("points front, right, behind and left relative to the yaw", () => {
    assert.equal(directionaldamage({ x: 0, z: 20 }, { x: 0, z: 0 }, 0).sector, "front");
    assert.equal(directionaldamage({ x: 20, z: 0 }, { x: 0, z: 0 }, 0).sector, "right");
    assert.equal(directionaldamage({ x: 0, z: -20 }, { x: 0, z: 0 }, 0).sector, "behind");
    assert.equal(directionaldamage({ x: -20, z: 0 }, { x: 0, z: 0 }, 0).sector, "left");
    const faced = directionaldamage({ x: 20, z: 0 }, { x: 0, z: 0 }, Math.PI / 2);
    assert.equal(faced.sector, "front");
    assert.ok(Math.abs(faced.angle) < 1e-9);
  });

  it("fades the ping strength with distance to the floor", () => {
    assert.ok(Math.abs(directionaldamage({ x: 0, z: 20 }, { x: 0, z: 0 }, 0).strength - 0.5) < 1e-9);
    assert.equal(directionaldamage({ x: 0, z: 200 }, { x: 0, z: 0 }, 0).strength, DAMAGESTRENGTHFLOOR);
    assert.equal(sectorof(Math.PI), "behind");
    assert.equal(sectorof((7 * Math.PI) / 4), "left");
  });
});
