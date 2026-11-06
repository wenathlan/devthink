// # containerarch.test — the 11-architecture container standard the
// container drivers (container-max and container-lite) honestly cover
// (the pr15 law, the family platform axis): the eleven seat ids the
// owner's law names (linux-x64, darwin-arm64, windows-x64, linux-arm64,
// darwin-x64, windows-arm64, linux-x64-musl, linux-riscv64, wasm32,
// darwin-arm64-v8, windows-x64-gnu), one honest row per seat (the
// docker platform spec, the arch the daemon reports, the os family, the
// npm target triple, the pinned multi-arch base and whether that base
// carries the seat), the resolver the drivers read (the linux-x64
// default, the known ids, the coded refusal naming the standard), the
// honest availability law (the six target seats the pinned base cannot
// answer as containers declare ARCH_TARGET_NOT_CONTAINER, never a
// pretended pull) and the coverage report the drivers stamp on every
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

/** the eleven architecture seat ids the owner's law names, in order. */
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
] as const;

/** the six target seats the pinned multi-arch base honestly does not
 * answer as containers (the darwin and windows seats and the wasm seat
 * are binary/npm targets — the drivers answer ARCH_TARGET_NOT_CONTAINER,
 * never a pretended pull). */
const HONESTTARGETS = [
  "darwin-arm64",
  "windows-x64",
  "darwin-x64",
  "windows-arm64",
  "wasm32",
  "windows-x64-gnu",
] as const;

/** the five seats the pinned base carries (the amd64 leg serves linux-x64
 * and linux-x64-musl, the arm64 leg serves linux-arm64, the arm64/v8 leg
 * serves the darwin-arm64-v8 abi seat and the riscv64 leg serves
 * linux-riscv64). */
const CARRIED = ["linux-x64", "linux-arm64", "linux-x64-musl", "linux-riscv64", "darwin-arm64-v8"] as const;

describe("the 11-architecture container standard", () => {
  it("carries exactly the eleven architecture seats the owner's law names", () => {
    assert.deepEqual(CONTAINERARCHIDS, LAWIDS);
    assert.equal(CONTAINERARCHES.length, 11);
    const ids = CONTAINERARCHES.map((row) => row.id);
    assert.equal(new Set(ids).size, 11, "every architecture id rides exactly once");
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
    // own design — one build leg, two abi-qualified seats), so the ten
    // distinct platform rows answer the eleven seats
    assert.equal(platforms.size, 10, "the carried legs and the target seats answer distinct rows");
    assert.equal(getcontainerarch("linux-x64")?.platform, "linux/amd64");
    assert.equal(getcontainerarch("linux-arm64")?.platform, "linux/arm64");
    assert.equal(getcontainerarch("linux-riscv64")?.platform, "linux/riscv64");
    assert.equal(getcontainerarch("darwin-arm64-v8")?.platform, "linux/arm64/v8");
    assert.equal(getcontainerarch("wasm32")?.target, "wasm32-wasip1");
  });

  it("keeps the availability honest: the six target seats declare the coded absence", () => {
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
    assert.throws(() => resolvecontainerarch("ppc64le"), /CONTAINER_ARCH_UNKNOWN|ppc64le/);
    assert.throws(() => resolvecontainerarch("wasip1"), /eleven seats/);
    assert.throws(() => resolvecontainerarch(42), /11-architecture standard carries no seat/);
  });

  it("answers the coverage report the drivers stamp on every profile run", () => {
    const coverage = containerarchcoverage();
    assert.equal(coverage.count, 11);
    assert.equal(coverage.carries, 5);
    assert.equal(coverage.targets, 6);
    assert.deepEqual(coverage.drivers, ["containermax", "containerlite"]);
    assert.equal(coverage.rows.length, 11);
    const carried = coverage.rows.filter((row) => row.availability === "carried");
    assert.equal(carried.length, 5);
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
    assert.ok(lines.length >= 12, "the header line plus one line per seat");
    assert.ok(lines[0]?.includes("11 seats"));
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

  it("carries the eleven go-style build architecture seats the publish lanes stamp", () => {
    // the build index answers the go-style arch vocabulary beside the
    // npm-style standard seats: the four base-carried legs (the native
    // x64 leg beside the three QEMU-emulated seats) and the seven honest
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
    ]);
    assert.equal(CONTAINERBUILDARCHES.length, 11);
    assert.equal(new Set(CONTAINERBUILDARCHES.map((row) => row.arch)).size, 11, "every build arch rides exactly once");
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
    assert.equal(coverage.count, 11);
    assert.equal(coverage.carries, 4, "the native x64 leg beside the three QEMU-emulated legs");
    assert.equal(coverage.absences, 7, "the seven seats the base does not ship answer the coded absence");
    assert.deepEqual(coverage.carriedplatforms, ["linux/amd64", "linux/arm64", "linux/ppc64le", "linux/s390x"]);
    assert.equal(getcontainerbuildarch("armv7")?.baseimagecarries, false);
    assert.equal(getcontainerbuildarch("ppc64le")?.baseimagecarries, true);
    assert.equal(getcontainerbuildarch("wasip1")?.platform, "wasm32-wasip1");
    assert.equal(getcontainerbuildarch("no-such-arch"), undefined);
    // the go-style vocabulary never leaks into the standard's resolver:
    // the eleven seats of the standard stay the resolvable ids
    assert.throws(() => resolvecontainerarch("armv7"), /armv7/);
    assert.throws(
      () => resolvecontainerarch("ppc64le"),
      (error: Error & { code?: string }) => error.code === "CONTAINER_ARCH_UNKNOWN",
    );
  });
});
