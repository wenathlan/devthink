// # osdistrib.test — the sixteen system seats of the os distribution
// catalog the saddle container carries (the osdistrib law, the owner's
// sentences: "iniciar distribuição do container saddle com por
// exemplo, grapheneos, omarchy e outros sistemas dentro do saddle"
// and "o saddle nao ta com mais de 15 devido as disvbriçoe s com
// sistem aoperacional como graphene os e etc" — the catalog rides
// more than fifteen system seats): one honest row per
// system seat (grapheneos a privacy and security hardened version of
// android, omarchy the arch linux-based distribution created by dhh,
// vanilla os based on ubuntu, maru os firmware not an application, the
// v seat the vlang platform the catalog pins at 0.5.2, the normal
// linux baseline and android — the seven named law seats — beside the
// nine honest additions the more-than-fifteen directive rides:
// postmarketos the alpine-based mobile distribution, lineageos the
// community android continuation, calyxos the privacy-focused android
// distribution, archlinux the rolling-release distribution omarchy
// builds on, alpine the musl-based lightweight distribution, debian
// the universal operating system, fedora the red-hat-upstream
// community distribution, nixos the declarative distribution the nix
// package manager builds and void the independent source-rolling
// distribution), the arch pairing against the
// eleven-architecture standard (every paired seat a real seat of the
// standard, the amd64 and arm64 legs the owner's law names derived by
// the join), the engine plan profile binding (the max, balanced and
// lite trio the engineplans table owns — reused from that table, never
// a duplicated tier list) and the plan-resource law (the 50 gb per
// plan example arrives as plan config data the devthink plan logic
// owns, the engine itself stays unlimited — no hardcoded cap lives
// anywhere in the catalog). runnable with vitest:
// pnpm vitest run test/osdistrib.test.ts
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

/** the sixteen system seat ids the catalog carries, in the law order
 * (the seven named law seats first — grapheneos and omarchy, vanilla
 * os, maru os, the v seat, the normal linux baseline and android —
 * then the nine honest additions the more-than-fifteen directive
 * rides: postmarketos, lineageos, calyxos, archlinux, alpine, debian,
 * fedora, nixos and void). */
const LAWIDS = [
  "grapheneos",
  "omarchy",
  "vanillaos",
  "maruos",
  "v",
  "linux",
  "android",
  "postmarketos",
  "lineageos",
  "calyxos",
  "archlinux",
  "alpine",
  "debian",
  "fedora",
  "nixos",
  "void",
] as const;

/** the honest docker arch legs each system seat rides (the join of the
 * seat's architecture pairings against the carried seats of the
 * eleven-architecture standard — the mobile and firmware seats ride the
 * arm64 legs, the desktop and baseline seats ride amd64 and arm64, the
 * linux and alpine seats carry the riscv64 leg beside them, the musl
 * seats alpine and void answer the musl legs on the amd64 leg). */
const LAWLEGS: Readonly<Record<string, string[]>> = {
  grapheneos: ["arm64"],
  omarchy: ["amd64", "arm64"],
  vanillaos: ["amd64", "arm64"],
  maruos: ["arm64"],
  v: ["amd64", "arm64"],
  linux: ["amd64", "arm64", "riscv64"],
  android: ["arm64"],
  postmarketos: ["arm64"],
  lineageos: ["arm64"],
  calyxos: ["arm64"],
  archlinux: ["amd64", "arm64"],
  alpine: ["amd64", "arm64", "riscv64"],
  debian: ["amd64", "arm64"],
  fedora: ["amd64", "arm64"],
  nixos: ["amd64", "arm64"],
  void: ["amd64", "arm64"],
};

/** the seats that never present a vgpu path (the honest virtual device
 * law: the firmware seat and the language os seat carry no gpu path,
 * every other seat — including every one of the nine additions —
 * presents a virtual one). */
const NOVGPU = new Set(["maruos", "v"]);

/** the nine honest additions the more-than-fifteen directive rides
 * (the ids after the seven named law seats). */
const ADDITIONIDS = [
  "postmarketos",
  "lineageos",
  "calyxos",
  "archlinux",
  "alpine",
  "debian",
  "fedora",
  "nixos",
  "void",
] as const;

describe("the os distribution catalog of the saddle container", () => {
  it("carries exactly the sixteen system seats the owner's law charges (more than fifteen)", () => {
    assert.deepEqual(OSDISTRIBUTIONIDS, [...LAWIDS]);
    assert.equal(OSDISTRIBUTIONS.length, 16);
    assert.equal(OSDISTRIBUTIONCOUNT, 16, "the count derives from the rows' real length");
    const ids = OSDISTRIBUTIONS.map((row) => row.id);
    assert.equal(new Set(ids).size, 16, "every system seat rides exactly once");
    for (const row of OSDISTRIBUTIONS) {
      assert.ok(row.label.length > 0, `${row.id} carries a label`);
      assert.ok(row.note.length > 0, `${row.id} carries the honest note`);
      assert.ok(row.base.length > 0, `${row.id} carries its true base fact`);
      assert.ok(
        ["apk", "apt", "pacman", "abuild", "vpm", "rpm", "nix", "xbps"].includes(row.package),
        `${row.id} answers a package grammar`,
      );
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

  it("carries the true fact per addition seat (the nine honest additions, the owner's more-than-fifteen directive)", () => {
    // postmarketos is the alpine-based mobile distribution real devices boot
    const postmarketos = getosdistribution("postmarketos");
    assert.ok(postmarketos !== undefined);
    assert.equal(postmarketos.kind, "mobile");
    assert.equal(postmarketos.base, "alpine linux");
    assert.equal(postmarketos.package, "apk");
    assert.ok(postmarketos.note.includes("alpine-based mobile distribution"), "the alpine mobile fact rides the note");
    // lineageos is the community android continuation
    const lineageos = getosdistribution("lineageos");
    assert.ok(lineageos !== undefined);
    assert.equal(lineageos.kind, "mobile");
    assert.equal(lineageos.base, "android");
    assert.equal(lineageos.package, "apk");
    assert.ok(lineageos.note.includes("community android continuation"), "the continuation fact rides the note");
    // calyxos is the privacy-focused android distribution
    const calyxos = getosdistribution("calyxos");
    assert.ok(calyxos !== undefined);
    assert.equal(calyxos.kind, "mobile");
    assert.equal(calyxos.base, "android");
    assert.equal(calyxos.package, "apk");
    assert.ok(calyxos.note.includes("privacy-focused android distribution"), "the privacy fact rides the note");
    // archlinux is the rolling-release distribution omarchy builds on
    const archlinux = getosdistribution("archlinux");
    assert.ok(archlinux !== undefined);
    assert.equal(archlinux.kind, "desktop");
    assert.equal(archlinux.base, "arch linux");
    assert.equal(archlinux.package, "pacman");
    assert.ok(archlinux.note.includes("rolling-release distribution omarchy builds on"), "the omarchy base fact rides the note");
    // alpine is the musl-based lightweight distribution
    const alpine = getosdistribution("alpine");
    assert.ok(alpine !== undefined);
    assert.equal(alpine.kind, "distribution");
    assert.equal(alpine.base, "musl libc busybox");
    assert.equal(alpine.package, "apk");
    assert.ok(alpine.note.includes("musl-based lightweight distribution"), "the musl fact rides the note");
    // debian is the universal operating system
    const debian = getosdistribution("debian");
    assert.ok(debian !== undefined);
    assert.equal(debian.kind, "desktop");
    assert.equal(debian.base, "the debian project");
    assert.equal(debian.package, "apt");
    assert.ok(debian.note.includes("universal operating system"), "the universal fact rides the note");
    // fedora is the red-hat-upstream community distribution
    const fedora = getosdistribution("fedora");
    assert.ok(fedora !== undefined);
    assert.equal(fedora.kind, "desktop");
    assert.equal(fedora.base, "red hat linux upstream");
    assert.equal(fedora.package, "rpm");
    assert.ok(fedora.note.includes("red-hat-upstream community distribution"), "the red hat fact rides the note");
    // nixos is the declarative distribution the nix package manager builds
    const nixos = getosdistribution("nixos");
    assert.ok(nixos !== undefined);
    assert.equal(nixos.kind, "distribution");
    assert.equal(nixos.base, "the nix package manager");
    assert.equal(nixos.package, "nix");
    assert.ok(nixos.note.includes("declarative distribution the nix package manager builds"), "the declarative fact rides the note");
    // void is the independent source-rolling distribution
    const voidlinux = getosdistribution("void");
    assert.ok(voidlinux !== undefined);
    assert.equal(voidlinux.kind, "distribution");
    assert.equal(voidlinux.base, "xbps");
    assert.equal(voidlinux.package, "xbps");
    assert.ok(voidlinux.note.includes("independent source-rolling distribution"), "the independent fact rides the note");
    // the nine additions all present a vgpu path and ride the vcpu bank
    for (const id of ADDITIONIDS) {
      const row = getosdistribution(id);
      assert.ok(row !== undefined);
      assert.equal(row.vgpu, true, `${id} presents a vgpu path`);
      assert.equal(row.vcpu, true, `${id} rides the vcpu bank`);
    }
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
      // are the legs the seat rides, riscv64 the extra leg the normal
      // linux baseline and the alpine seat carry
      assert.deepEqual(osdistributiondockerarchs(row.id), LAWLEGS[row.id], `${row.id} rides its honest legs`);
    }
    // the mobile, firmware and language seats that never leave the arm64
    // legs (the phones and the v platform's linux legs)
    assert.deepEqual(osdistributiondockerarchs("grapheneos"), ["arm64"]);
    assert.deepEqual(osdistributiondockerarchs("maruos"), ["arm64"]);
    assert.deepEqual(osdistributiondockerarchs("android"), ["arm64"]);
    assert.deepEqual(osdistributiondockerarchs("postmarketos"), ["arm64"]);
    assert.deepEqual(osdistributiondockerarchs("lineageos"), ["arm64"]);
    assert.deepEqual(osdistributiondockerarchs("calyxos"), ["arm64"]);
    // the desktop and baseline seats pair both legs the owner names
    assert.deepEqual(osdistributiondockerarchs("omarchy"), ["amd64", "arm64"]);
    assert.deepEqual(osdistributiondockerarchs("vanillaos"), ["amd64", "arm64"]);
    assert.deepEqual(osdistributiondockerarchs("v"), ["amd64", "arm64"]);
    assert.deepEqual(osdistributiondockerarchs("archlinux"), ["amd64", "arm64"]);
    assert.deepEqual(osdistributiondockerarchs("debian"), ["amd64", "arm64"]);
    assert.deepEqual(osdistributiondockerarchs("fedora"), ["amd64", "arm64"]);
    assert.deepEqual(osdistributiondockerarchs("nixos"), ["amd64", "arm64"]);
    assert.deepEqual(osdistributiondockerarchs("void"), ["amd64", "arm64"]);
    // the alpine seat carries the riscv64 leg beside both legs, the
    // musl legs the alpine and void seats answer ride the amd64 leg
    assert.deepEqual(osdistributiondockerarchs("alpine"), ["amd64", "arm64", "riscv64"]);
    // an unknown seat answers the empty pairing, never a pretended leg
    assert.deepEqual(osdistributiondockerarchs("guix"), []);
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
    assert.equal(getosdistribution("guix"), undefined, "an unknown id answers no row");
    assert.throws(() => resolveosdistribution("guix"), /sixteen seats the owner's law names/);
    assert.throws(
      () => resolveosdistribution("windows"),
      (error: Error & { code?: string }) => error.code === "OS_DISTRIBUTION_UNKNOWN",
    );
    const refusal = osdistributionerror("templeos");
    assert.equal(refusal.name, "osdistributionerror");
    assert.equal(refusal.code, "OS_DISTRIBUTION_UNKNOWN");
    assert.ok(
      refusal.message.includes(
        "grapheneos, omarchy, vanillaos, maruos, v, linux, android, postmarketos, lineageos, calyxos, archlinux, alpine, debian, fedora, nixos, void",
      ),
      "the refusal names the sixteen seats in law order",
    );
    assert.throws(() => resolveosdistribution(42), /os distribution catalog carries no system seat/);
  });

  it("answers the arch and profile joins the modality system reads", () => {
    // the arch join: the seats that ride one architecture seat of the
    // standard, catalog order
    assert.deepEqual(
      osdistributionsforarch("linux-riscv64").map((row) => row.id),
      ["linux", "alpine"],
      "the normal linux baseline and the alpine seat carry the riscv64 seat",
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
      ["omarchy", "vanillaos", "v", "linux", "archlinux", "alpine", "debian", "fedora", "nixos", "void"],
    );
    assert.deepEqual(
      osdistributionsforarch("linux-x64-musl").map((row) => row.id),
      ["omarchy", "vanillaos", "linux", "alpine", "void"],
      "the musl seat the omarchy, vanilla os, linux, alpine and void seats answer",
    );
    assert.deepEqual(
      osdistributionsforarch("linux-arm64").map((row) => row.id),
      [...LAWIDS],
      "every system seat rides the linux-arm64 seat of the standard",
    );
    assert.deepEqual(
      osdistributionsforarch("darwin-arm64-v8").map((row) => row.id),
      ["grapheneos", "maruos", "android", "postmarketos", "lineageos", "calyxos"],
      "the mobile and firmware seats ride the arm64/v8 abi seat",
    );
    assert.deepEqual(osdistributionsforarch("linux-nope"), [], "an unknown arch answers no seat");
  });

  it("answers the coverage report and the table lines the container lanes stamp", () => {
    const coverage = osdistributioncoverage();
    assert.equal(coverage.count, 16);
    assert.deepEqual(coverage.profiles, ["max", "balanced", "lite"]);
    assert.equal(coverage.planlaw.examplestoragegb, 50);
    assert.equal(coverage.planlaw.quotaowner, "devthink");
    // the arch seats the catalog pairs follow the standard's own order
    // (the nine additions pair no seat the seven named seats do not
    // already carry — the arch axis stays the standard's own)
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
    assert.equal(coverage.rows.length, 16);
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
    assert.ok(lines.length >= 17, "the header line plus one line per system seat");
    assert.ok(lines[0]?.includes("16 system seats"));
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
