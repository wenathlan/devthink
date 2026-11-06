// # osdistrib.test — the seven system seats of the os distribution
// catalog the saddle container carries (the osdistrib law, the owner's
// pr15 sentence: "iniciar distribuição do container saddle com por
// exemplo, grapheneos, omarchy e outros sistemas dentro do saddle" —
// the container starts its distribution catalog with grapheneos,
// omarchy and the other systems inside the saddle): one honest row per
// system seat (grapheneos a privacy and security hardened version of
// android, omarchy the arch linux-based distribution created by dhh,
// vanilla os based on ubuntu, maru os firmware not an application, the
// v seat the vlang platform the catalog pins at 0.5.2, the normal
// linux baseline and android), the arch pairing against the
// eleven-architecture standard (every paired seat a real seat of the
// standard, the amd64 and arm64 legs the owner's law names derived by
// the join), the engine plan profile binding (the max, balanced and
// lite trio the engineplans table owns — reused from that table, never
// a duplicated tier list) and the plan-resource law (the 50 gb per
// plan example arrives as plan config data the devthink plan logic
// owns, the engine itself stays unlimited — no hardcoded cap lives
// anywhere in the catalog). runnable with vitest:
// pnpm vitest run tests/osdistrib.test.ts
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  CONTAINERARCHIDS,
  getosdistribution,
  OSDISTRIBUTIONCOUNT,
  OSDISTRIBUTIONIDS,
  OSDISTRIBUTIONPLANLAW,
  OSDISTRIBUTIONPROFILEIDS,
  OSDISTRIBUTIONS,
  osdistributioncoverage,
  osdistributiondockerarchs,
  osdistributionerror,
  osdistributionlines,
  osdistributionsforarch,
  osdistributionsforprofile,
  resolveosdistribution,
} from "../containerarch.ts";
import { ENGINELIMITS, ENGINEPLANS } from "../engineplans.ts";

/** the seven system seat ids the owner's law names, in the order the
 * law's sentence rides them (grapheneos and omarchy first — the named
 * examples — then vanilla os, maru os, the v seat, the normal linux
 * baseline and android). */
const LAWIDS = ["grapheneos", "omarchy", "vanillaos", "maruos", "v", "linux", "android"] as const;

/** the honest docker arch legs each system seat rides (the join of the
 * seat's architecture pairings against the carried seats of the
 * eleven-architecture standard — the mobile and firmware seats ride the
 * arm64 legs, the desktop and baseline seats ride amd64 and arm64, the
 * linux seat carries the riscv64 leg beside them). */
const LAWLEGS: Readonly<Record<string, string[]>> = {
  grapheneos: ["arm64"],
  omarchy: ["amd64", "arm64"],
  vanillaos: ["amd64", "arm64"],
  maruos: ["arm64"],
  v: ["amd64", "arm64"],
  linux: ["amd64", "arm64", "riscv64"],
  android: ["arm64"],
};

/** the seats that never present a vgpu path (the honest virtual device
 * law: the firmware seat and the language os seat carry no gpu path,
 * every other seat presents a virtual one). */
const NOVGPU = new Set(["maruos", "v"]);

describe("the os distribution catalog of the saddle container", () => {
  it("carries exactly the seven system seats the owner's law names", () => {
    assert.deepEqual(OSDISTRIBUTIONIDS, [...LAWIDS]);
    assert.equal(OSDISTRIBUTIONS.length, 7);
    assert.equal(OSDISTRIBUTIONCOUNT, 7, "the count derives from the rows' real length");
    const ids = OSDISTRIBUTIONS.map((row) => row.id);
    assert.equal(new Set(ids).size, 7, "every system seat rides exactly once");
    for (const row of OSDISTRIBUTIONS) {
      assert.ok(row.label.length > 0, `${row.id} carries a label`);
      assert.ok(row.note.length > 0, `${row.id} carries the honest note`);
      assert.ok(row.base.length > 0, `${row.id} carries its true base fact`);
      assert.ok(["apk", "apt", "pacman", "abuild", "vpm"].includes(row.package), `${row.id} answers a package grammar`);
    }
  });

  it("carries the true fact per system seat (the owner's law, verbatim)", () => {
    // grapheneos is a privacy and security hardened version of android
    const grapheneos = getosdistribution("grapheneos");
    assert.ok(grapheneos !== undefined);
    assert.equal(grapheneos.kind, "mobile");
    assert.equal(grapheneos.base, "android");
    assert.equal(grapheneos.package, "apk");
    assert.ok(grapheneos.note.includes("privacy and security hardened"), "the hardened android fact rides the note");
    assert.ok(grapheneos.note.includes("android"));
    // omarchy is the arch linux-based distribution created by dhh
    const omarchy = getosdistribution("omarchy");
    assert.ok(omarchy !== undefined);
    assert.equal(omarchy.kind, "desktop");
    assert.equal(omarchy.base, "arch linux");
    assert.equal(omarchy.package, "pacman");
    assert.ok(omarchy.note.includes("arch linux-based distribution created by dhh"), "the dhh fact rides the note");
    // vanilla os is based on ubuntu
    const vanillaos = getosdistribution("vanillaos");
    assert.ok(vanillaos !== undefined);
    assert.equal(vanillaos.base, "ubuntu");
    assert.equal(vanillaos.package, "apt");
    assert.ok(vanillaos.note.includes("based on ubuntu"), "the ubuntu fact rides the note");
    // maru os is firmware, not an application
    const maruos = getosdistribution("maruos");
    assert.ok(maruos !== undefined);
    assert.equal(maruos.kind, "firmware");
    assert.equal(maruos.package, "abuild");
    assert.ok(maruos.note.includes("firmware, not an application"), "the firmware law rides the note");
    // the v seat names the vlang platform the catalog pins at 0.5.2
    const v = getosdistribution("v");
    assert.ok(v !== undefined);
    assert.equal(v.kind, "languageos");
    assert.equal(v.package, "vpm");
    assert.ok(v.base.includes("vlang"), "the vlang platform fact rides the base");
    assert.ok(v.note.includes("0.5.2"), "the 0.5.2 catalog pin rides the note");
    assert.ok(v.note.includes("never a guest distribution"), "the nickname law rides the note");
    // the normal linux baseline and android
    const linux = getosdistribution("linux");
    assert.ok(linux !== undefined);
    assert.equal(linux.kind, "distribution");
    assert.equal(linux.package, "apt");
    assert.ok(linux.note.includes("normal linux seat"), "the linux normal law rides the note");
    const android = getosdistribution("android");
    assert.ok(android !== undefined);
    assert.equal(android.kind, "mobile");
    assert.equal(android.package, "apk");
    assert.ok(android.base.includes("android"), "android builds on the android platform");
  });

  it("pairs every seat with the eleven-architecture standard honestly", () => {
    for (const row of OSDISTRIBUTIONS) {
      assert.ok(row.archs.length > 0, `${row.id} pairs at least one architecture seat`);
      for (const arch of row.archs) {
        assert.ok(
          (CONTAINERARCHIDS as readonly string[]).includes(arch),
          `${row.id} pairs the real seat ${arch} of the eleven-architecture standard (never an invented seat id)`,
        );
      }
      // the derived docker legs follow the owner's law: amd64 and arm64
      // are the legs the seat rides, riscv64 the extra leg only the
      // normal linux baseline carries
      assert.deepEqual(osdistributiondockerarchs(row.id), LAWLEGS[row.id], `${row.id} rides its honest legs`);
    }
    // the mobile, firmware and language seats that never leave the arm64
    // legs (the phones and the v platform's linux legs)
    assert.deepEqual(osdistributiondockerarchs("grapheneos"), ["arm64"]);
    assert.deepEqual(osdistributiondockerarchs("maruos"), ["arm64"]);
    assert.deepEqual(osdistributiondockerarchs("android"), ["arm64"]);
    // the desktop and baseline seats pair both legs the owner names
    assert.deepEqual(osdistributiondockerarchs("omarchy"), ["amd64", "arm64"]);
    assert.deepEqual(osdistributiondockerarchs("vanillaos"), ["amd64", "arm64"]);
    assert.deepEqual(osdistributiondockerarchs("v"), ["amd64", "arm64"]);
    // an unknown seat answers the empty pairing, never a pretended leg
    assert.deepEqual(osdistributiondockerarchs("nixos"), []);
  });

  it("binds the engine plan trio every seat rides — reused from engineplans, never duplicated", () => {
    // the reuse pin: the trio the seats bind IS the engineplans table's
    // own id list (max, balanced, lite in table order), never a second
    // tier list the catalog invented
    assert.deepEqual(OSDISTRIBUTIONPROFILEIDS, ["max", "balanced", "lite"]);
    assert.deepEqual(
      OSDISTRIBUTIONPROFILEIDS,
      ENGINEPLANS.map((plan) => plan.id),
    );
    for (const row of OSDISTRIBUTIONS) {
      assert.deepEqual(row.profiles, OSDISTRIBUTIONPROFILEIDS, `${row.id} binds the full engine plan trio`);
    }
    // the profile join answers every seat for every tier of the trio
    for (const profile of OSDISTRIBUTIONPROFILEIDS) {
      assert.deepEqual(
        osdistributionsforprofile(profile).map((row) => row.id),
        [...LAWIDS],
        `every system seat rides the ${profile} profile`,
      );
    }
    // an unknown tier answers the coded refusal, never a silent empty
    assert.throws(
      () => osdistributionsforprofile("mega"),
      (error: Error & { code?: string }) => error.code === "OS_DISTRIBUTION_PROFILE_UNKNOWN",
    );
  });

  it("keeps the plan-resource law as config, never an engine cap", () => {
    // the 50 gb the owner's law names ("por exemplo, 50gb por plano via
    // config") is plan config data — the example row stamps it, the
    // devthink system plan logic owns it, never the engine
    assert.equal(OSDISTRIBUTIONPLANLAW.examplestoragegb, 50);
    assert.equal(OSDISTRIBUTIONPLANLAW.quotaowner, "devthink");
    // the engine side of the law rides the engineplans limits law
    // verbatim (the reuse law): unlimited on every axis
    assert.equal(OSDISTRIBUTIONPLANLAW.enginelimits, ENGINELIMITS, "the limits law is the engineplans object itself");
    assert.deepEqual(OSDISTRIBUTIONPLANLAW.enginelimits, ENGINELIMITS);
    assert.equal(ENGINELIMITS.workloads, "unlimited");
    assert.equal(ENGINELIMITS.sessions, "unlimited");
    assert.equal(ENGINELIMITS.modalities, "unlimited");
    assert.equal(ENGINELIMITS.artifacts, "unlimited");
    assert.equal(ENGINELIMITS.plansowner, "devthink");
    // the no-hardcoded-caps law: no row of the catalog carries a numeric
    // resource field — every number the plan law needs lives in the plan
    // config data or the engineplans table, never in a catalog row
    for (const row of OSDISTRIBUTIONS) {
      for (const [key, value] of Object.entries(row)) {
        assert.ok(
          typeof value !== "number",
          `${row.id}.${key} carries no numeric cap — the counts arrive from the engine plan profile and the plan config, never the catalog`,
        );
      }
    }
  });

  it("resolves the caller distribution against the catalog", () => {
    assert.equal(resolveosdistribution(undefined).id, "linux", "undefined answers the normal linux baseline");
    assert.equal(resolveosdistribution(null).id, "linux");
    assert.equal(resolveosdistribution("grapheneos").id, "grapheneos");
    assert.equal(resolveosdistribution("  OMARCHY ").id, "omarchy", "the resolver trims and lowercases");
    for (const id of OSDISTRIBUTIONIDS) {
      assert.equal(resolveosdistribution(id).id, id);
    }
    assert.equal(getosdistribution("nixos"), undefined, "an unknown id answers no row");
    assert.throws(() => resolveosdistribution("nixos"), /seven seats the owner's law names/);
    assert.throws(
      () => resolveosdistribution("windows"),
      (error: Error & { code?: string }) => error.code === "OS_DISTRIBUTION_UNKNOWN",
    );
    const refusal = osdistributionerror("templeos");
    assert.equal(refusal.name, "osdistributionerror");
    assert.equal(refusal.code, "OS_DISTRIBUTION_UNKNOWN");
    assert.ok(refusal.message.includes("grapheneos, omarchy, vanillaos, maruos, v, linux, android"));
    assert.throws(() => resolveosdistribution(42), /os distribution catalog carries no system seat/);
  });

  it("answers the arch and profile joins the modality system reads", () => {
    // the arch join: the seats that ride one architecture seat of the
    // standard, catalog order
    assert.deepEqual(
      osdistributionsforarch("linux-riscv64").map((row) => row.id),
      ["linux"],
      "only the normal linux baseline carries the riscv64 seat",
    );
    assert.deepEqual(
      osdistributionsforarch("windows-x64").map((row) => row.id),
      ["v"],
      "the v platform is the only seat that pairs the windows target",
    );
    assert.deepEqual(
      osdistributionsforarch("wasm32").map((row) => row.id),
      ["v"],
      "the v platform is the only seat that pairs the wasm target",
    );
    assert.deepEqual(
      osdistributionsforarch("darwin-arm64").map((row) => row.id),
      ["v"],
    );
    assert.deepEqual(
      osdistributionsforarch("linux-x64").map((row) => row.id),
      ["omarchy", "vanillaos", "v", "linux"],
    );
    assert.deepEqual(
      osdistributionsforarch("linux-arm64").map((row) => row.id),
      [...LAWIDS],
      "every system seat rides the linux-arm64 seat of the standard",
    );
    assert.deepEqual(osdistributionsforarch("linux-nope"), [], "an unknown arch answers no seat");
  });

  it("answers the coverage report and the table lines the container lanes stamp", () => {
    const coverage = osdistributioncoverage();
    assert.equal(coverage.count, 7);
    assert.deepEqual(coverage.profiles, ["max", "balanced", "lite"]);
    assert.equal(coverage.planlaw.examplestoragegb, 50);
    assert.equal(coverage.planlaw.quotaowner, "devthink");
    // the arch seats the catalog pairs follow the standard's own order
    assert.deepEqual(coverage.arches, [
      "linux-x64",
      "darwin-arm64",
      "windows-x64",
      "linux-arm64",
      "darwin-x64",
      "linux-x64-musl",
      "linux-riscv64",
      "wasm32",
      "darwin-arm64-v8",
    ]);
    assert.equal(coverage.rows.length, 7);
    for (const row of coverage.rows) {
      const source = getosdistribution(row.id);
      assert.ok(source !== undefined);
      assert.equal(row.kind, source.kind);
      assert.equal(row.base, source.base);
      assert.deepEqual(row.archs, source.archs);
      assert.deepEqual(row.dockerarchs, osdistributiondockerarchs(row.id));
      assert.deepEqual(row.profiles, OSDISTRIBUTIONPROFILEIDS);
    }
    // the rendered lines: the header law plus one line per system seat
    const lines = osdistributionlines();
    assert.ok(lines.length >= 8, "the header line plus one line per system seat");
    assert.ok(lines[0]?.includes("7 system seats"));
    assert.ok(lines[0]?.includes("max/balanced/lite"));
    assert.ok(lines[0]?.includes("50gb an example of plan config"));
    assert.ok(lines[0]?.includes("the engine unlimited"));
    for (const id of OSDISTRIBUTIONIDS) {
      const line = lines.find((entry) => entry.includes(id.padEnd(11)));
      assert.ok(line !== undefined, `${id} rides the catalog table`);
      assert.ok(
        (NOVGPU.has(id) && line.includes("no vgpu")) || (!NOVGPU.has(id) && line.includes("vgpu")),
        `${id} answers its vgpu law honestly`,
      );
    }
  });
});
