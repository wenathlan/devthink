// # devtoolsguard.test — the wall contract of the single module: the guard
// arms only in production builds, the install never self-trips (the
// console probe is never read by the module itself), the toggle seam
// arms/suspends through the status reader, and the trip response is the
// interstitial element — an append-only overlay, never a DOM wipe. The
// trap timing itself is not testable without devtools attached, so the
// suite asserts the structure (the source contract), not the timing.
// runnable with vitest: npx vitest run tests/devtoolsguard.test.ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "vitest";
import {
  devtoolsguardstatus,
  devtoolstripped,
  devtoolswallid,
  guardarmed,
  installdevtoolsguard,
  ondevtoolstrip,
  showdevtoolsinterstitial,
  suspenddevtoolsguard,
} from "../devthink/devtoolsguard.ts";

/** the module source, read once: the structural contracts (no wipe
 * vector, no size heuristic) are asserted against the bytes the build
 * ships — the honest form of testing a timing trap without devtools. */
const source = readFileSync(new URL("../devthink/devtoolsguard.ts", import.meta.url), "utf8");

describe("the devtools guard", () => {
  it("stays unarmed on the dev build (the dev machine keeps its tools)", () => {
    assert.equal(guardarmed(), false, "vitest rides the dev build");
  });

  it("never self-trips on install (install + immediate status read answers untripped)", () => {
    let trips = 0;
    const drop = ondevtoolstrip(() => {
      trips += 1;
    });
    const disarm = installdevtoolsguard();
    // the dev build arms nothing: the state answers clean and the probe
    // never fired (the old shield's self-read tripped every boot)
    const status = devtoolsguardstatus();
    assert.equal(status.tripped, false, "the install never trips the wall");
    assert.equal(status.armed, false, "the dev build keeps the wall unarmed");
    assert.equal(devtoolstripped(), false, "the wall answer stays quiet");
    assert.equal(trips, 0, "no listener fired on install");
    disarm();
    drop();
    assert.equal(devtoolstripped(), false, "the disarm never trips either");
  });

  it("answers the toggle seam through the status reader (arms and suspends)", () => {
    suspenddevtoolsguard(true);
    assert.equal(devtoolsguardstatus().suspended, true, "the owner toggle suspends the wall");
    suspenddevtoolsguard(false);
    assert.equal(devtoolsguardstatus().suspended, false, "the owner toggle re-arms the wall");
    // the seam never trips anything by itself
    assert.equal(devtoolstripped(), false);
  });

  it("answers a trip with the interstitial element id, never a wipe (the root keeps its children)", () => {
    // the id is the stable, non-empty answer of the trip response
    const id = devtoolswallid();
    assert.equal(typeof id, "string");
    assert.ok(id.length > 0, "the interstitial carries a real element id");
    assert.equal(id, "dtdevtoolswall");
    // the node runtime has no document: the response is a safe no-op
    // there (the browser is the only place the overlay mounts)
    assert.equal(showdevtoolsinterstitial(), null, "no document, no overlay, no throw");
    // the structural contract, against the shipped source: the response
    // is append-only — every wipe vector is absent from the module
    assert.ok(source.includes("appendChild"), "the response appends the overlay");
    for (const wipe of ["innerHTML", "removeChild", "replaceChildren"]) {
      assert.equal(source.includes(wipe), false, ["the wall never touches", wipe].join(" "));
    }
  });

  it("carries no window-size heuristic (the false-positive factory the study refuses)", () => {
    assert.equal(source.includes("outerWidth"), false, "no outer width probe");
    assert.equal(source.includes("innerWidth"), false, "no inner width probe");
    assert.equal(source.includes("outerHeight"), false, "no outer height probe");
  });

  it("keeps the console probe free of self reads and format strings (the lazy getter form)", () => {
    assert.equal(source.includes("String(probe)"), false, "the probe is never stringified");
    assert.equal(source.includes("`${"), false, "no template literal rides the module");
    // the percent c lesson of the live false positive: the format directive
    // stringifies its argument eagerly for every visitor — the plain object
    // log is the only lazy form the wall may feed
    assert.equal(source.includes('console.log("%c"'), false, "no format directive rides the probe log");
    assert.equal(source.includes("console.log(consoleprobe)"), true, "the probe logs the plain object form");
    // the probe is report-only: the wall stands on the debugger trap alone
    assert.ok(source.includes("function report(signal: string): void"), "the report seam exists");
    assert.ok(!/trip\("console\.getter"\)/.test(source), "the probe never stands the wall");
  });
});
