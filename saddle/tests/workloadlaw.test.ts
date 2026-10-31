// # workloadlaw.test — the family workload law contract: the catalog covers
// every official app, every lane row carries a demand and never a modality
// name (the nuclear law), every demand resolves against the registry of
// record, the gpu lanes answer planned-only honestly, the join candidates
// satisfy every demand axis, and the report counts derive from the catalog
// so the census can never drift. runnable with vitest:
// pnpm vitest run tests/workloadlaw.test.ts
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { MODALITIES } from "../modalityregistry.ts";
import {
  CATALOGAPPS,
  FAMILYLANES,
  familyjoin,
  getlane,
  lanejoin,
  lanesof,
  workloadreport,
} from "../workloadlaw.ts";

/** the lane row keys the law pins — a row carrying any other key (a
 * modality name smuggled beside the demand) breaks the nuclear law */
const ROWKEYS = new Set(["app", "lane", "role", "demand", "today"]);
/** the demand keys the law pins */
const DEMANDKEYS = new Set(["gpu", "network", "isolation", "bootbudget"]);

/** the modality ids the registry of record carries — the lane vocabulary
 * check reads them to refuse any smuggled name */
const MODALITYIDS = new Set(MODALITIES.map((modality) => modality.id));

describe("the family workload law", () => {
  it("covers every official app of the family with at least one lane", () => {
    assert.equal(CATALOGAPPS.length, 11);
    const expected = [
      "argan",
      "cadria",
      "cobaia",
      "debonair",
      "devthink",
      "forge",
      "foundry",
      "getry",
      "saddle",
      "stealthhead",
      "vault",
    ];
    assert.deepEqual([...CATALOGAPPS], expected);
    for (const app of CATALOGAPPS) {
      const lanes = lanesof(app);
      assert.ok(lanes.length >= 1, `${app} owns no workload lane`);
      for (const row of lanes) assert.equal(row.app, app);
    }
  });

  it("never lets a lane name a modality — the nuclear law", () => {
    for (const row of FAMILYLANES) {
      // the row shape stays pinned: no field beside the law's five
      assert.deepEqual(new Set(Object.keys(row)), ROWKEYS, `${row.app}/${row.lane} carries an off-law key`);
      assert.deepEqual(
        new Set(Object.keys(row.demand)),
        DEMANDKEYS,
        `${row.app}/${row.lane} demand carries an off-law key`,
      );
      // the lane id never collides with a modality id of the registry
      assert.ok(!MODALITYIDS.has(row.lane), `${row.app}/${row.lane} smuggles a modality name`);
      // the role never names a modality id either (the sentence describes
      // the work, the join answers the modality)
      for (const id of MODALITYIDS) {
        assert.ok(!row.role.includes(id), `${row.app}/${row.lane} role names the modality ${id}`);
      }
      assert.ok(["engine-lane", "app-lane"].includes(row.today), `${row.app}/${row.lane} carries no honest today`);
    }
  });

  it("resolves every lane demand against the registry of record", () => {
    for (const row of FAMILYLANES) {
      const join = lanejoin(row);
      assert.notEqual(join.verdict, "unresolved", `${row.app}/${row.lane} resolves nothing — a calibration defect`);
      assert.ok(join.candidates.length > 0);
      // every candidate satisfies every axis of the demand
      for (const candidate of join.candidates) {
        if (row.demand.gpu) assert.equal(candidate.gpu, true, `${candidate.id} lacks the gpu the lane demands`);
        if (row.demand.network) assert.equal(candidate.network, true, `${candidate.id} lacks the network the lane demands`);
        assert.ok(candidate.bootms <= (row.demand.bootbudget ?? 1500), `${candidate.id} exceeds the lane budget`);
      }
      // the live count answers the registry state, never a hand pin
      const livecount = join.candidates.filter((candidate) => candidate.state === "live").length;
      assert.equal(join.livecount, livecount);
    }
  });

  it("answers the gpu wait honestly — the ninety wave made the gpu lanes live", () => {
    // the world bake lane of stealthhead demands a gpu: the ninety
    // modalities wave wired the gpu records live (the virtual hardware
    // composition lanes), so the join the workload law charged as
    // planned-only before the wave now answers dispatchable with live
    // candidates — the census follows the registry, never a hand pin
    const bake = familyjoin("stealthhead", "world-bake");
    assert.ok(bake !== undefined);
    assert.equal(bake.verdict, "dispatchable");
    assert.ok(bake.livecount >= 1);
    assert.ok(bake.candidates.some((candidate) => candidate.state === "live" && candidate.gpu));
  });

  it("answers the engine's own dispatch lane as dispatchable", () => {
    const dispatch = familyjoin("saddle", "edge-dispatch");
    assert.ok(dispatch !== undefined);
    assert.equal(dispatch.verdict, "dispatchable");
    assert.ok(dispatch.livecount >= 1);
    // the best candidate first: the join orders by boot cost
    const boots = dispatch.candidates.map((candidate) => candidate.bootms);
    const sorted = [...boots].sort((a, b) => a - b);
    assert.deepEqual(boots, sorted);
  });

  it("computes the report counts from the catalog — nothing drifts", () => {
    const report = workloadreport();
    assert.equal(report.apps, CATALOGAPPS.length);
    assert.equal(report.lanes, FAMILYLANES.length);
    assert.equal(report.perapp.length, CATALOGAPPS.length);
    let dispatchable = 0;
    let plannedonly = 0;
    let unresolved = 0;
    let applanemigration = 0;
    for (const app of report.perapp) {
      dispatchable += app.dispatchable;
      plannedonly += app.plannedonly;
      unresolved += app.unresolved;
      applanemigration += app.applane;
      assert.equal(app.lanes, app.joins.length);
      assert.equal(app.dispatchable + app.plannedonly + app.unresolved, app.lanes);
      assert.equal(app.applane + app.enginelane, app.lanes);
    }
    assert.equal(report.dispatchable, dispatchable);
    assert.equal(report.plannedonly, plannedonly);
    assert.equal(report.unresolved, unresolved);
    assert.equal(report.applanemigration, applanemigration);
    // the honest truth the first census pins: the family walks a real
    // migration list beside the engine lanes it already drives
    assert.ok(report.dispatchable >= 20, `the family resolves ${report.dispatchable} dispatchable lanes`);
    assert.ok(report.applanemigration >= 10, `the family carries ${report.applanemigration} app-lane rows to migrate`);
  });

  it("answers the lane lookups the api and the mirrors read", () => {
    const chat = getlane("devthink", "chat-sandbox");
    assert.ok(chat !== undefined);
    assert.equal(chat.today, "engine-lane");
    assert.ok(getlane("devthink", "no-such-lane") === undefined);
    assert.ok(familyjoin("no-such-app", "chat-sandbox") === undefined);
    assert.ok(familyjoin("devthink", "no-such-lane") === undefined);
    // lanesof answers catalog order and the frozen law
    const cadria = lanesof("cadria");
    assert.equal(cadria.length, 5);
    assert.deepEqual(cadria.map((row) => row.lane), [
      "analyze-wav",
      "generate-image",
      "render-svg",
      "decode-video",
      "compile-shader",
    ]);
  });
});
