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
// never desyncs again. the container cut ships the family subset the
// lanes build, so the seat walk answers the package.json files the
// running tree carries — the subset law the config parity gate walks —
// and the automation-tree walk answers only where the landing step
// ships (the repository), never inside the container the app lanes cut. the engine faces beside the package stamps answer
// the release walk (release.ts check) and the notes battery; this
// battery pins the surfaces those cannot reach: the lockstep itself, the
// curve refusal and the staged set of the landing.
import { existsSync, readFileSync } from "node:fs";
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

/** the seats the running tree carries: the full repository answers all
 * eleven, while the container cut ships the family subset the lanes
 * build — the walk answers the seats it finds, the same graceful subset
 * law the config parity gate already walks, and the lockstep holds over
 * every seat that ships together. */
const presentseats = seats.filter((seat) => existsSync(join(reporoot, seat, "package.json")));
const seatversions = presentseats.map((seat) => ({
  seat,
  version: (JSON.parse(readFileSync(join(reporoot, seat, "package.json"), "utf8")) as { version: string }).version,
}));

/** the automation tree ships only in the repository: the container cut
 * carries the app surfaces, never the workflow ladder, so the staged-set
 * walk answers where the landing step lives and skips where it cannot. */
const maintenancepath = join(reporoot, ".github", "workflows", "maintenance.yml");
const maintenance = existsSync(maintenancepath) ? readFileSync(maintenancepath, "utf8") : "";
const changelog = readFileSync(join(approot, "CHANGELOG.md"), "utf8");

/** the landing step's staged set — the one git add command the rung
 * commits the whole metadata family through, read the way the shell reads
 * it: the backslash continuations of the block fold into the one command,
 * so every pathspec the rung stages answers from the folded text */
const stamp = (() => {
  const lines = maintenance.split("\n");
  const start = lines.findIndex((line) => line.trim().startsWith("git add "));
  const folded: string[] = [];
  for (const line of lines.slice(start < 0 ? lines.length : start)) {
    folded.push(line);
    if (!line.trimEnd().endsWith("\\")) break;
  }
  return folded.join("\n");
})();

describe("the rung lockstep (every seat stamps the same number)", () => {
  it("the root and every app seat the tree carries answer one version string", () => {
    expect(rootversion, "the root carries a version stamp").toMatch(/^\d+\.\d+\.\d+$/);
    expect(presentseats.length, "the tree carries at least one app seat beside the root").toBeGreaterThan(0);
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
  it.skipIf(maintenance === "")(
    "the git add of the landing step stages all eleven app package.json paths",
    () => {
      expect(stamp, "the landing step carries a git add line").toContain("git add ");
      for (const seat of seats) {
        expect(stamp, `${seat} rides the staged set`).toContain(`${seat}/package.json`);
      }
    },
  );

  it("the changelog answers the current rung — no stamp lands without its notes", () => {
    expect(changelog, `the changelog carries the ${rootversion} section`).toMatch(
      new RegExp(`^##\\s+${rootversion.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:\\s|$)`, "m"),
    );
  });
});
