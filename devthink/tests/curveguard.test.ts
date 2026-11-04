// # curveguard.test — the version curve battery (the cascade law the
// 2.1.6/2.1.7/2.1.8 breach taught the house): the whole family answers
// one rung. the complaint was three doors — a seat the maintenance rung
// forgot to stage (cobaia, getry and saddle sat at the released number
// only thanks to manual rungs while the automation carried the other
// eight), a minor bump no law refused (the caret ranges once floated the
// family onto the wrong 2.1 curve the realignment had to heal back) and
// a changelog that could drift a rung behind the stamps it answers — and
// the answer is one law in three seats: every package.json of the family
// stamps the same number, that number never leaves the 2.0.x curve the
// house pinned, and the maintenance rung stages every seat so the ladder
// never desyncs again. the engine faces beside the package stamps answer
// the release walk (release.ts check) and the notes battery; this
// battery pins the surfaces those cannot reach: the lockstep itself, the
// curve refusal and the staged set of the landing.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const approot = join(import.meta.dirname, "..");
const reporoot = join(approot, "..");

/** the eleven app seats of the merged repository — every root that
 * carries a package.json the metadata sync restamps on the same rung */
const seats = [
  "devthink",
  "argan",
  "cadria",
  "cobaia",
  "debonair",
  "forge",
  "foundry",
  "getry",
  "saddle",
  "stealthhead",
  "vault",
];

const rootversion = (JSON.parse(readFileSync(join(reporoot, "package.json"), "utf8")) as { version: string }).version;
const seatversions = seats.map((seat) => ({
  seat,
  version: (JSON.parse(readFileSync(join(reporoot, seat, "package.json"), "utf8")) as { version: string }).version,
}));
const maintenance = readFileSync(join(reporoot, ".github", "workflows", "maintenance.yml"), "utf8");
const changelog = readFileSync(join(approot, "CHANGELOG.md"), "utf8");

/** the landing step's staged set — the one git add line the rung commits
 * the whole metadata family through */
const stamp = maintenance.split("\n").find((line) => line.trim().startsWith("git add ")) ?? "";

describe("the rung lockstep (every seat stamps the same number)", () => {
  it("the root and the eleven app seats answer one version string", () => {
    expect(rootversion, "the root carries a version stamp").toMatch(/^\d+\.\d+\.\d+$/);
    for (const { seat, version } of seatversions) {
      expect(version, `${seat} stamps the root rung`).toBe(rootversion);
    }
  });

  it("the shared rung rides the 2.0.x curve — the family never answers a minor bump", () => {
    expect(rootversion).toMatch(/^2\.0\.\d{3,}$/);
    for (const { seat, version } of seatversions) {
      expect(version, `${seat} never leaves the curve`).toMatch(/^2\.0\.\d{3,}$/);
    }
    // the 2.1.6/2.1.7/2.1.8 breach the realignment healed: the refusal is
    // explicit, so a floated range answers red before any rung lands it
    expect(rootversion).not.toMatch(/^2\.1\./);
  });
});

describe("the maintenance rung (the stamp ladder carries every seat)", () => {
  it("the git add of the landing step stages all eleven app package.json paths", () => {
    expect(stamp, "the landing step carries a git add line").toContain("git add ");
    for (const seat of seats) {
      expect(stamp, `${seat} rides the staged set`).toContain(`${seat}/package.json`);
    }
  });

  it("the changelog answers the current rung — no stamp lands without its notes", () => {
    expect(changelog, `the changelog carries the ${rootversion} section`).toMatch(
      new RegExp(`^##\\s+${rootversion.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:\\s|$)`, "m"),
    );
  });
});
