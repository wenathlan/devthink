// # containerarch.test — the 11-architecture container standard the
// container drivers (container-max and container-lite) honestly cover
// (the ownership law, wave a, actions 91-101 and the test battery of
// actions 113-120): the eleven ids the owner's law names (x64, arm64,
// armv7, riscv64, ppc64le, s390x, 386, mips64le, loong64, wasm32,
// wasip1), one honest row per architecture (the docker platform spec,
// the arch the daemon reports, the cpu family, the pinned multi-arch
// base and whether that base really carries the arch), the resolver
// the drivers read (the x64 default, the known ids, the coded refusal
// naming the standard), the honest availability law (the three archs
// the pinned bash base does not ship declare the absence the drivers
// answer with ARCH_IMAGE_ABSENT, never a pretended pull) and the
// coverage report the drivers stamp on every profile run. runnable
// with vitest: pnpm vitest run tests/containerarch.test.ts
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  CONTAINERARCHES,
  CONTAINERARCHIDS,
  CONTAINERBASEIMAGE,
  containerarchcoverage,
  containerarchlines,
  getcontainerarch,
  resolvecontainerarch,
} from "../containerarch.ts";

/** the eleven architecture ids the owner's law names, in order. */
const LAWIDS = [
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
] as const;

/** the three architectures the pinned multi-arch base honestly does not
 * carry (the bash base ships no loong64, wasm32 or wasip1 rows). */
const HONESTABSENT = ["loong64", "wasm32", "wasip1"] as const;

describe("the 11-architecture container standard", () => {
  it("carries exactly the eleven architectures the owner's law names", () => {
    assert.deepEqual(CONTAINERARCHIDS, LAWIDS);
    assert.equal(CONTAINERARCHES.length, 11);
    const ids = CONTAINERARCHES.map((row) => row.id);
    assert.equal(new Set(ids).size, 11, "every architecture id rides exactly once");
    for (const row of CONTAINERARCHES) {
      assert.ok(row.label.length > 0, `${row.id} carries a label`);
      assert.ok(row.note.length > 0, `${row.id} carries the honest note`);
      assert.equal(row.baseimage, CONTAINERBASEIMAGE, `${row.id} rides the pinned multi-arch base`);
    }
  });

  it("carries an honest docker platform spec per architecture", () => {
    const platforms = new Set<string>();
    for (const row of CONTAINERARCHES) {
      assert.ok(
        row.platform.startsWith("linux/") || row.platform === "wasm32/wasip1" || row.platform === "wasip1/wasm",
        `${row.id} carries the platform spec ${row.platform}`,
      );
      assert.ok(row.dockerarch.length > 0, `${row.id} carries the docker arch the daemon reports`);
      assert.ok(
        ["x86", "arm", "riscv", "power", "mainframe", "mips", "loong", "wasm"].includes(row.family),
        `${row.id} carries a cpu family`,
      );
      platforms.add(row.platform);
    }
    assert.equal(platforms.size, 11, "every platform spec is distinct");
    assert.equal(getcontainerarch("x64")?.platform, "linux/amd64");
    assert.equal(getcontainerarch("armv7")?.platform, "linux/arm/v7");
    assert.equal(getcontainerarch("wasm32")?.platform, "wasm32/wasip1");
    assert.equal(getcontainerarch("wasip1")?.platform, "wasip1/wasm");
  });

  it("keeps the availability honest: the three base-less archs declare the absence", () => {
    const carried = CONTAINERARCHES.filter((row) => row.baseimagecarries).map((row) => row.id);
    const absent = CONTAINERARCHES.filter((row) => !row.baseimagecarries).map((row) => row.id);
    assert.deepEqual(absent, [...HONESTABSENT]);
    assert.equal(carried.length, 8);
    for (const id of HONESTABSENT) {
      const row = getcontainerarch(id);
      assert.ok(row !== undefined);
      assert.equal(row.baseimagecarries, false, `${id} never claims a base row it does not carry`);
      assert.ok(row.note.includes("ARCH_IMAGE_ABSENT"), `${id} names the coded refusal in its note`);
    }
  });

  it("resolves the caller architecture against the standard", () => {
    assert.equal(resolvecontainerarch(undefined).id, "x64", "undefined answers the daemon default");
    assert.equal(resolvecontainerarch(null).id, "x64");
    assert.equal(resolvecontainerarch("arm64").id, "arm64");
    assert.equal(resolvecontainerarch("  S390X ").id, "s390x", "the resolver trims and lowercases");
    for (const id of CONTAINERARCHIDS) {
      assert.equal(resolvecontainerarch(id).id, id);
    }
    assert.throws(() => resolvecontainerarch("mips"), /CONTAINER_ARCH_UNKNOWN|mips/);
    assert.throws(() => resolvecontainerarch("sparc64"), /eleven architectures/);
    assert.throws(() => resolvecontainerarch(42), /container standard carries no architecture/);
  });

  it("answers the coverage report the drivers stamp on every profile run", () => {
    const coverage = containerarchcoverage();
    assert.equal(coverage.count, 11);
    assert.equal(coverage.carries, 8);
    assert.deepEqual(coverage.drivers, ["container-max", "container-lite"]);
    assert.equal(coverage.rows.length, 11);
    const carried = coverage.rows.filter((row) => row.baseimagecarries);
    assert.equal(carried.length, 8);
    for (const row of coverage.rows) {
      const source = getcontainerarch(row.id);
      assert.ok(source !== undefined);
      assert.equal(row.platform, source.platform);
      assert.equal(row.dockerarch, source.dockerarch);
      assert.equal(row.baseimagecarries, source.baseimagecarries);
    }
  });

  it("renders the coverage table lines the profile runs answer", () => {
    const lines = containerarchlines();
    assert.ok(lines.length >= 12, "the header line plus one line per architecture");
    assert.ok(lines[0]?.includes("11 architectures"));
    assert.ok(lines[0]?.includes("container-max and container-lite"));
    for (const id of CONTAINERARCHIDS) {
      const line = lines.find((entry) => entry.includes(id.padEnd(8)));
      assert.ok(line !== undefined, `${id} rides the coverage table`);
      assert.ok(
        line.includes("base carries") || line.includes("ARCH_IMAGE_ABSENT"),
        `${id} answers its availability honestly`,
      );
    }
  });
});
