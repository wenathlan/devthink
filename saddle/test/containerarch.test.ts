// # containerarch.test — the seventeen-seat architecture standard the
// container drivers (container-max and container-lite) honestly cover
// (the pr15 law grown by the archos wave, the family platform axis —
// the owner's directive: "expanda ali o OS/Arch (restrito a
// linux/arm64 e unknown) para 15+ lanes tanto nos sistemas operacionais
// (Alpine, NixOS, V, Arch Linux e Debian) quanto no respectivo ArchOS
// interno"): the seventeen seat ids the owner's law names (linux-x64,
// darwin-arm64, windows-x64, linux-arm64, darwin-x64, windows-arm64,
// linux-x64-musl, linux-riscv64, wasm32, darwin-arm64-v8,
// windows-x64-gnu beside the six archos seats — linux-ppc64le,
// linux-s390x, linux-armv7, linux-armv6, linux-386 and
// linux-mips64le), one honest row per seat (the
// docker platform spec, the arch the daemon reports, the os family, the
// npm target triple, the pinned multi-arch base and whether that base
// carries the seat), the resolver the drivers read (the linux-x64
// default, the known ids, the coded refusal naming the standard), the
// honest availability law (the seven target seats the pinned bases
// cannot answer as containers declare ARCH_TARGET_NOT_CONTAINER, never
// a pretended pull) and the coverage report the drivers stamp on every
// profile run. the same source file also carries the os distribution
// catalog — the sixteen system seats the saddle container carries (the
// osdistrib law, the owner's more-than-fifteen directive) — pinned by
// the sister battery test/osdistrib.test.ts. runnable with vitest:
// pnpm vitest run test/containerarch.test.ts
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  CONTAINERARCHES,
  CONTAINERARCHIDS,
  CONTAINERBASEIMAGE,
  CONTAINERBUILDARCHES,
  CONTAINERBUILDARCHIDS,
  containerarchcoverage,
  containerarchlines,
  containerbuildarchcoverage,
  getcontainerarch,
  getcontainerbuildarch,
  resolvecontainerarch,
} from "../containerarch.ts";

/** the seventeen architecture seat ids the owner's law names, in order
 * (the eleven pr15 seats first, the six archos seats appended). */
const LAWIDS = [
  "linux-x64",
  "darwin-arm64",
  "windows-x64",
  "linux-arm64",
  "darwin-x64",
  "windows-arm64",
  "linux-x64-musl",
  "linux-riscv64",
  "wasm32",
  "darwin-arm64-v8",
  "windows-x64-gnu",
  "linux-ppc64le",
  "linux-s390x",
  "linux-armv7",
  "linux-armv6",
  "linux-386",
  "linux-mips64le",
] as const;

/** the seven target seats the pinned bases honestly do not
 * answer as containers (the darwin and windows seats, the wasm seat
 * and the archos mips64le seat are binary/npm targets — the drivers
 * answer ARCH_TARGET_NOT_CONTAINER, never a pretended pull). */
const HONESTTARGETS = [
  "darwin-arm64",
  "windows-x64",
  "darwin-x64",
  "windows-arm64",
  "wasm32",
  "windows-x64-gnu",
  "linux-mips64le",
] as const;

/** the ten seats the pinned bases carry (the amd64 leg serves linux-x64
 * and linux-x64-musl, the arm64 leg serves linux-arm64, the arm64/v8 leg
 * serves the darwin-arm64-v8 abi seat, the riscv64 leg serves
 * linux-riscv64 — all on the bash driver base — beside the five archos
 * seats: the ppc64le and s390x legs both pinned bases carry, and the
 * armv7, armv6 and 386 legs the container drivers' pinned bash base
 * carries alone, the legs the vhe image's node base never pretends). */
const CARRIED = [
  "linux-x64",
  "linux-arm64",
  "linux-x64-musl",
  "linux-riscv64",
  "darwin-arm64-v8",
  "linux-ppc64le",
  "linux-s390x",
  "linux-armv7",
  "linux-armv6",
  "linux-386",
] as const;

describe("the seventeen-seat architecture container standard", () => {
  it("carries exactly the seventeen architecture seats the owner's law names", () => {
    assert.deepEqual(CONTAINERARCHIDS, LAWIDS);
    assert.equal(CONTAINERARCHES.length, 17);
    const ids = CONTAINERARCHES.map((row) => row.id);
    assert.equal(new Set(ids).size, 17, "every architecture id rides exactly once");
    for (const row of CONTAINERARCHES) {
      assert.ok(row.label.length > 0, `${row.id} carries a label`);
      assert.ok(row.note.length > 0, `${row.id} carries the honest note`);
      assert.equal(row.baseimage, CONTAINERBASEIMAGE, `${row.id} rides the pinned multi-arch base`);
      assert.ok(row.target.length > 0, `${row.id} carries the npm target triple`);
    }
  });

  it("carries an honest docker platform spec per seat", () => {
    const platforms = new Set<string>();
    for (const row of CONTAINERARCHES) {
      if (row.availability === "carried") {
        assert.ok(row.platform.startsWith("linux/"), `${row.id} carries a linux platform spec`);
        assert.ok(row.dockerarch.length > 0, `${row.id} carries the docker arch the daemon reports`);
      } else {
        assert.equal(row.platform, "", `${row.id} is a target seat: no pretended platform spec`);
        assert.equal(row.dockerarch, "", `${row.id} is a target seat: no pretended docker arch`);
      }
      assert.ok(["linux", "darwin", "windows", "wasm"].includes(row.family), `${row.id} carries an os family`);
      platforms.add(row.platform || `target:${row.id}`);
    }
    // the musl seat rides the same amd64 leg as linux-x64 (the standard's
    // own design — one build leg, two abi-qualified seats), while the six
    // archos seats each contribute their own distinct platform or target
    // row — so the sixteen distinct platform rows answer the seventeen
    // seats
    assert.equal(platforms.size, 16, "the carried legs and the target seats answer distinct rows");
    assert.equal(getcontainerarch("linux-x64")?.platform, "linux/amd64");
    assert.equal(getcontainerarch("linux-arm64")?.platform, "linux/arm64");
    assert.equal(getcontainerarch("linux-riscv64")?.platform, "linux/riscv64");
    assert.equal(getcontainerarch("darwin-arm64-v8")?.platform, "linux/arm64/v8");
    assert.equal(getcontainerarch("linux-ppc64le")?.platform, "linux/ppc64le");
    assert.equal(getcontainerarch("linux-s390x")?.platform, "linux/s390x");
    assert.equal(getcontainerarch("linux-armv7")?.platform, "linux/arm/v7");
    assert.equal(getcontainerarch("linux-armv6")?.platform, "linux/arm/v6");
    assert.equal(getcontainerarch("linux-386")?.platform, "linux/386");
    assert.equal(getcontainerarch("wasm32")?.target, "wasm32-wasip1");
  });

  it("keeps the availability honest: the seven target seats declare the coded absence", () => {
    const carried = CONTAINERARCHES.filter((row) => row.availability === "carried").map((row) => row.id);
    const targets = CONTAINERARCHES.filter((row) => row.availability !== "carried").map((row) => row.id);
    assert.deepEqual(carried, [...CARRIED]);
    assert.deepEqual(targets, [...HONESTTARGETS]);
    for (const id of HONESTTARGETS) {
      const row = getcontainerarch(id);
      assert.ok(row !== undefined);
      assert.equal(row.baseimagecarries, false, `${id} never claims a base leg it does not carry`);
      assert.ok(row.note.includes("ARCH_TARGET_NOT_CONTAINER"), `${id} names the coded refusal in its note`);
    }
    for (const id of CARRIED) {
      assert.equal(getcontainerarch(id)?.baseimagecarries, true, `${id} rides a leg the pinned base carries`);
    }
  });

  it("resolves the caller architecture against the standard", () => {
    assert.equal(resolvecontainerarch(undefined).id, "linux-x64", "undefined answers the standard's first seat");
    assert.equal(resolvecontainerarch(null).id, "linux-x64");
    assert.equal(resolvecontainerarch("linux-arm64").id, "linux-arm64");
    assert.equal(resolvecontainerarch("  WINDOWS-X64 ").id, "windows-x64", "the resolver trims and lowercases");
    for (const id of CONTAINERARCHIDS) {
      assert.equal(resolvecontainerarch(id).id, id);
    }
    assert.throws(() => resolvecontainerarch("ppc64"), /CONTAINER_ARCH_UNKNOWN|ppc64/);
    assert.throws(() => resolvecontainerarch("wasip1"), /seventeen seats/);
    assert.throws(() => resolvecontainerarch(42), /seventeen-seat architecture standard carries no seat/);
  });

  it("answers the coverage report the drivers stamp on every profile run", () => {
    const coverage = containerarchcoverage();
    assert.equal(coverage.count, 17);
    assert.equal(coverage.carries, 10);
    assert.equal(coverage.targets, 7);
    assert.deepEqual(coverage.drivers, ["containermax", "containerlite"]);
    assert.equal(coverage.rows.length, 17);
    const carried = coverage.rows.filter((row) => row.availability === "carried");
    assert.equal(carried.length, 10);
    for (const row of coverage.rows) {
      const source = getcontainerarch(row.id);
      assert.ok(source !== undefined);
      assert.equal(row.platform, source.platform);
      assert.equal(row.dockerarch, source.dockerarch);
      assert.equal(row.availability, source.availability);
    }
  });

  it("renders the coverage table lines the profile runs answer", () => {
    const lines = containerarchlines();
    assert.ok(lines.length >= 18, "the header line plus one line per seat");
    assert.ok(lines[0]?.includes("17 seats"));
    assert.ok(lines[0]?.includes("container-max and container-lite"));
    for (const id of CONTAINERARCHIDS) {
      const line = lines.find((entry) => entry.includes(id.padEnd(17)));
      assert.ok(line !== undefined, `${id} rides the coverage table`);
      assert.ok(
        line.includes("base carries") || line.includes("ARCH_TARGET_NOT_CONTAINER"),
        `${id} answers its availability honestly`,
      );
    }
  });

  it("carries the sixteen go-style build architecture seats the publish lanes stamp", () => {
    // the build index answers the go-style arch vocabulary beside the
    // npm-style standard seats: the four node-base-carried legs (the
    // native x64 leg beside the three QEMU-emulated seats) beside the
    // armv6 leg the bash driver base carries and the eleven honest
    // coded absences the publish lanes never pretend to build
    assert.deepEqual(CONTAINERBUILDARCHIDS, [
      "x64",
      "arm64",
      "armv7",
      "riscv64",
      "ppc64le",
      "s390x",
      "386",
      "mips64le",
      "loong64",
      "wasm32",
      "wasip1",
      "armv6",
      "ppc64",
      "mipsle",
      "mips64",
      "mips",
    ]);
    assert.equal(CONTAINERBUILDARCHES.length, 16);
    assert.equal(new Set(CONTAINERBUILDARCHES.map((row) => row.arch)).size, 16, "every build arch rides exactly once");
    for (const row of CONTAINERBUILDARCHES) {
      assert.ok(row.platform.length > 0, `${row.arch} carries its platform spec`);
      assert.ok(row.note.length > 0, `${row.arch} carries the honest note`);
      if (!row.baseimagecarries) {
        assert.ok(row.note.includes("ARCH_LEG_NOT_BUILT"), `${row.arch} names the coded refusal in its note`);
      }
    }
  });

  it("answers the build index coverage the publish lanes read", () => {
    const coverage = containerbuildarchcoverage();
    assert.equal(coverage.count, 16);
    assert.equal(coverage.carries, 5, "the native x64 leg beside the three QEMU-emulated legs and the armv6 leg the bash driver base carries");
    assert.equal(coverage.absences, 11, "the eleven seats the bases do not ship a vhe build leg for answer the coded absence");
    assert.deepEqual(coverage.carriedplatforms, [
      "linux/amd64",
      "linux/arm64",
      "linux/ppc64le",
      "linux/s390x",
      "linux/arm/v6",
    ]);
    assert.equal(getcontainerbuildarch("armv7")?.baseimagecarries, false);
    assert.equal(getcontainerbuildarch("armv6")?.baseimagecarries, true);
    assert.equal(getcontainerbuildarch("ppc64le")?.baseimagecarries, true);
    assert.equal(getcontainerbuildarch("ppc64")?.baseimagecarries, false);
    assert.equal(getcontainerbuildarch("mips")?.baseimagecarries, false);
    assert.equal(getcontainerbuildarch("wasip1")?.platform, "wasm32-wasip1");
    assert.equal(getcontainerbuildarch("no-such-arch"), undefined);
    // the go-style vocabulary never leaks into the standard's resolver:
    // the seventeen seats of the standard stay the resolvable ids
    assert.throws(() => resolvecontainerarch("armv7"), /armv7/);
    assert.throws(
      () => resolvecontainerarch("ppc64"),
      (error: Error & { code?: string }) => error.code === "CONTAINER_ARCH_UNKNOWN",
    );
  });
});
