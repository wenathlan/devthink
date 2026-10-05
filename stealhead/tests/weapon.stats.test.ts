// # weapon.stats.test — honest unit tests for the armory terminal ballistics
// (falloff, shots, ttk, balance), runnable with the node built-in runner:
//   node --test tests/weapon.stats.test.ts
// The falloff specs and balance bounds arrive as parameters — the tests pass
// their own catalog config, exactly as a season would.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { WEAPONCATALOG, type Weapon } from "../weapons.ts";
import { damageatmeters, shotstokill, timetokill, ttkbydistance, validatebalance, weaponstatserror, type FalloffSpec } from "../weapon.stats.ts";

/** the catalog falloff: full damage to 20 m, 60% at 60 m, linear. */
const LINEAR: FalloffSpec = { startmeters: 20, endmeters: 60, retainfraction: 0.6, curve: 1 };

/** the competitor style quadratic falloff (claude-of-duty curve). */
const QUADRATIC: FalloffSpec = { startmeters: 20, endmeters: 60, retainfraction: 0.6, curve: 2 };

/** the standard target health model of the tests. */
const HEALTH = 100;

/** finds one catalog row by id. */
function weapon(id: string): Weapon {
  const row = WEAPONCATALOG.find((candidate) => candidate.id === id);
  assert.ok(row, `catalog weapon ${id} missing`);
  return row;
}

describe("weapon stats damage falloff", () => {
  const rifle = weapon("w-1"); // 28 damage

  it("keeps the full damage up to the falloff start", () => {
    assert.equal(damageatmeters(rifle, 0, LINEAR), 28);
    assert.equal(damageatmeters(rifle, 20, LINEAR), 28);
  });

  it("settles at the retained fraction past the end", () => {
    assert.equal(damageatmeters(rifle, 60, LINEAR), 28 * 0.6);
    assert.equal(damageatmeters(rifle, 200, LINEAR), 28 * 0.6);
  });

  it("fades linearly between start and end", () => {
    const mid = damageatmeters(rifle, 40, LINEAR); // t 0.5
    assert.ok(Math.abs(mid - (28 * (1 - 0.4 * 0.5))) < 1e-9, `expected 22.4, got ${mid}`);
  });

  it("bends the fade with the curve exponent", () => {
    const linear = damageatmeters(rifle, 30, LINEAR);
    const quad = damageatmeters(rifle, 30, QUADRATIC);
    assert.ok(quad > linear, "a quadratic curve keeps more damage near the start");
    assert.ok(Math.abs(linear - 28 * (1 - 0.4 * 0.25)) < 1e-9, `expected 25.2, got ${linear}`);
    assert.ok(Math.abs(quad - 28 * (1 - 0.4 * 0.25 ** 2)) < 1e-9, `expected ${28 * (1 - 0.4 * 0.25 ** 2)}, got ${quad}`);
  });

  it("refuses a bad distance, a bad spec and a bad row", () => {
    assert.throws(() => damageatmeters(rifle, -1, LINEAR), weaponstatserror);
    assert.throws(() => damageatmeters(rifle, 10, { ...LINEAR, endmeters: 10 }), (error: unknown) => {
      assert.ok(error instanceof weaponstatserror);
      assert.equal(error.code, "bad-falloff");
      return true;
    });
    assert.throws(() => damageatmeters({ ...rifle, damage: 0 }, 10, LINEAR), weaponstatserror);
  });
});

describe("weapon stats shots and ttk", () => {
  const rifle = weapon("w-1"); // 28 dmg, 660 rpm, 30 mag, 2.1 s reload

  it("asks more shots as the distance fades the damage", () => {
    const close = shotstokill(rifle, 10, HEALTH, LINEAR);
    const mid = shotstokill(rifle, 40, HEALTH, LINEAR);
    const far = shotstokill(rifle, 200, HEALTH, LINEAR);
    assert.equal(close, 4); // 100 / 28
    assert.ok(mid > close && far > mid, `expected the shots to grow, got ${close}/${mid}/${far}`);
  });

  it("counts the headshot multiplier before the division", () => {
    const body = shotstokill(rifle, 10, HEALTH, LINEAR, { vitalmultiplier: 1 });
    const head = shotstokill(rifle, 10, HEALTH, LINEAR, { vitalmultiplier: 2 });
    assert.equal(head, Math.ceil(body / 2));
  });

  it("computes the ttk from the inter shot gaps and never mutates the row", () => {
    const result = timetokill(rifle, 10, HEALTH, LINEAR);
    assert.equal(result.shots, 4);
    assert.equal(result.reloads, 0);
    const gap = 60 / 660;
    assert.ok(Math.abs(result.seconds - 3 * gap) < 0.0005, `expected ${3 * gap}, got ${result.seconds}`);
    assert.equal(rifle.damage, 28);
  });

  it("charges one reload when the burst outgrows the magazine", () => {
    const shotgun = weapon("w-4"); // 96 dmg, 70 rpm, 6 mag, 2.8 s reload
    const result = timetokill(shotgun, 10, 600, LINEAR); // 600 hp asks 7 shots
    assert.equal(result.shots, 7);
    assert.equal(result.reloads, 1);
    const gap = 60 / 70;
    assert.ok(Math.abs(result.seconds - (6 * gap + 2.8)) < 0.0005, `expected ${6 * gap + 2.8}, got ${result.seconds}`);
  });

  it("sweeps a distance ladder in order for the armory curve", () => {
    const curve = ttkbydistance(rifle, [10, 40, 120], HEALTH, LINEAR);
    assert.equal(curve.length, 3);
    assert.ok(curve[0].seconds < curve[1].seconds && curve[1].seconds < curve[2].seconds);
  });

  it("refuses a bad health pool", () => {
    assert.throws(() => shotstokill(rifle, 10, 0, LINEAR), (error: unknown) => {
      assert.ok(error instanceof weaponstatserror);
      assert.equal(error.code, "bad-health");
      return true;
    });
  });
});

describe("weapon stats balance validation", () => {
  it("accepts every catalog row inside the season bounds", () => {
    const bounds = { damage: { min: 10, max: 100 }, firerate: { min: 60, max: 1000 }, recoil: { min: 10, max: 90 } };
    const violations = WEAPONCATALOG.flatMap((row) => validatebalance(row, bounds));
    assert.equal(violations.length, 0);
  });

  it("reports each field that leaves the configured bounds", () => {
    const bounds = { damage: { min: 20, max: 80 }, reloadseconds: { min: 1, max: 3 } };
    const violations = validatebalance(weapon("w-2"), bounds); // 88 dmg, 3.2 s reload
    assert.equal(violations.length, 2);
    assert.deepEqual(
      violations.map((violation) => violation.field).sort(),
      ["damage", "reloadseconds"],
    );
  });

  it("skips the fields without bounds and passes an empty bounds table", () => {
    assert.deepEqual(validatebalance(weapon("w-4"), {}), []);
  });
});
