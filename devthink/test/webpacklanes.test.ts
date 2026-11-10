/**
 * webpacklanes.test.ts — the webpack distribution workflow contract of the
 * owner doctrine: the webpack the platform speaks is THE WORKFLOW THAT
 * CREATES THE WEBPACK DISTRIBUTION (the github actions seat the corridor
 * clarified, never a file naming flavor), the reason every application
 * envelope carries the webpack and webpack-cli dependencies beside the
 * esbuild carrier the transpile rides. the six main matrices the
 * distribution law stamps — NuGet x Webpack, Maven x Webpack, Gradle x
 * Webpack, npmjs x Webpack, RubyGems x Webpack and GitHub Packages x
 * Webpack — walk every one of the eleven applications through the one
 * bundle seat, so a lane dropped from the workflow, a leg dropped from
 * a matrix, a publish walking without the release-approval gate, an
 * asset riding an underscore, a notice pattern lost (the absent
 * NPM_TOKEN skip, the billing wall mirror seat) or the bounded retry
 * unbound reddens this gate before a release ever ships the seats.
 */
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parseDocument } from "yaml";

const repoRoot = resolve(process.cwd(), "..");
/* the container builder stages the app folder alone: the repo root lanes
 * (the workflow files and the sibling manifests) answer only where the
 * whole repository rides beside the suite, so the battery skips
 * honestly there instead of reading paths that never exist. */
const inrepo = existsSync(join(repoRoot, ".github", "workflows", "webpack.yml"));
const workflowdir = join(repoRoot, ".github", "workflows");

const readworkflow = async (file: string) => await readFile(join(workflowdir, file), "utf8");
type workflow = { jobs?: Record<string, Record<string, unknown>> };
const parseworkflow = async (file: string) =>
  parseDocument(await readworkflow(file), { version: "1.2", uniqueKeys: true }).toJS() as workflow;

/** every application of the monorepo the webpack law covers — the
 * envelope beside the ten siblings, the per-application doctrine the
 * corridor stamped (the six matrices ride every leg alike, devthink
 * included: the @wenathlan/devthink.webpack envelope and the
 * com.wenathlan classifier seats never collide with the documentation
 * envelopes the family lanes own). */
const WEBPACKFAMILY = [
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

/** the six registry matrices the distribution law stamps. */
const WEBPACKLANES = [
  "webpacknpmjs",
  "webpackgithubnpm",
  "webpackmaven",
  "webpackgradle",
  "webpacknuget",
  "webpackrubygems",
] as const;

type lanejob = {
  needs?: string | string[];
  strategy?: { matrix?: { package?: string[] } };
  permissions?: Record<string, string>;
  steps?: Array<Record<string, unknown>>;
};

describe.skipIf(!inrepo)("the webpack distribution workflow", () => {
  it("the workflow exists with the bundle seat and the six registry matrices", async () => {
    const webpack = await parseworkflow("webpack.yml");
    expect(webpack.jobs).toBeTruthy();
    for (const lane of ["webpackseats", ...WEBPACKLANES]) {
      expect(webpack.jobs?.[lane], `the ${lane} lane answers in webpack.yml`).toBeTruthy();
    }
  });

  it("the six matrices walk every application — the per-application webpack law", async () => {
    const webpack = await parseworkflow("webpack.yml");
    for (const lane of WEBPACKLANES) {
      const job = webpack.jobs?.[lane] as lanejob | undefined;
      const family = job?.strategy?.matrix?.package ?? [];
      expect(
        [...family].sort(),
        `the ${lane} matrix carries the eleven applications the webpack law covers`,
      ).toEqual(WEBPACKFAMILY);
    }
  });

  it("every registry lane needs the bundle seat and the release-approval gate", async () => {
    const webpack = await parseworkflow("webpack.yml");
    for (const lane of WEBPACKLANES) {
      const job = webpack.jobs?.[lane] as lanejob | undefined;
      const needs = Array.isArray(job?.needs) ? job?.needs : [job?.needs].filter(Boolean);
      expect(needs, `the ${lane} lane needs its parents`).toContain("webpackseats");
      expect(
        needs,
        `the ${lane} publish walks only after the release-approval gate (the house doctrine)`,
      ).toContain("release-approval");
    }
    const gate = webpack.jobs?.["release-approval"] as { environment?: string } | undefined;
    expect(gate?.environment, "the gate carries the release-approval environment").toBe(
      "release-approval",
    );
  });

  it("the bundle seat builds through the webpack CLI beside the esbuild carrier", async () => {
    const text = await readworkflow("webpack.yml");
    const seats = text.split("  webpackseats:")[1]?.split("\n  webpack")[0] ?? "";
    expect(seats, "the seat transpiles the typescript entry through the esbuild carrier").toContain(
      "npx esbuild cli.ts",
    );
    expect(
      seats,
      "the seat bundles the carrier through the webpack CLI (the webpack distribution law)",
    ).toContain("npx webpack --config webpack.config.cjs");
    expect(seats, "the frozen lockfile install the house stamps").toContain(
      "bun install --frozen-lockfile --ignore-scripts",
    );
    expect(seats, "the seat validates the bundle exists").toContain("test -s");
  });

  it("every publish answers the existence pre-check and the bounded retry", async () => {
    const text = await readworkflow("webpack.yml");
    /* the idempotency grammar the registries answer: the npm lanes and the
     * maven seats pre-check the registry before the push, the rubygems
     * lane rescues the registry's own already-pushed refusal and the
     * nuget lane rides the registry's --skip-duplicate refusal — every
     * lane answers at least one idempotent form. */
    const idempotent = ["is already published", "already exists", "has already been pushed", "--skip-duplicate"];
    for (const lane of WEBPACKLANES) {
      const laneblock = text.split(`  ${lane}:`)[1]?.split("\n  webpack")[0] ?? "";
      expect(
        idempotent.some((form) => laneblock.includes(form)),
        `the ${lane} lane answers an idempotent existence form`,
      ).toBe(true);
      expect(
        laneblock.split("for attempt in 1 2 3").length - 1,
        `the ${lane} lane walks the bounded three-attempt retry`,
      ).toBe(1);
    }
  });

  it("the npmjs lane carries the provenance permission and the absent-token notice", async () => {
    const webpack = await parseworkflow("webpack.yml");
    const npmjs = webpack.jobs?.["webpacknpmjs"] as lanejob | undefined;
    expect(npmjs?.permissions?.["id-token"], "the npmjs publish answers the attestation endpoint").toBe(
      "write",
    );
    const text = await readworkflow("webpack.yml");
    const laneblock = text.split("  webpacknpmjs:")[1]?.split("\n  webpackgithubnpm")[0] ?? "";
    expect(laneblock, "the absent NPM_TOKEN answers the graceful skip notice").toContain(
      "Secret NPM_TOKEN is not configured",
    );
    expect(laneblock, "the npmjs webpack publish stamps the public access").toContain("--access public");
  });

  it("the github registry lanes carry the billing wall mirror notices", async () => {
    const text = await readworkflow("webpack.yml");
    for (const lane of ["webpackgithubnpm", "webpackmaven", "webpackgradle", "webpacknuget", "webpackrubygems"]) {
      const laneblock = text.split(`  ${lane}:`)[1]?.split("\n  webpack")[0] ?? "";
      expect(
        laneblock,
        `the ${lane} lane keeps its seat unpublished behind the billing warning (never a red)`,
      ).toMatch(/billing|403/);
    }
  });

  it("the asset grammar rides the dotted law and never an underscore", async () => {
    const text = await readworkflow("webpack.yml");
    const grammars = [
      "npmjs.webpack.${VERSION}.tgz",
      "github.webpack.${VERSION}.tgz",
      "maven.webpack.${VERSION}.jar",
      "gradle.webpack.${VERSION}.jar",
      "nuget.webpack.${VERSION}.nupkg",
      "rubygems.webpack.${VERSION}.gem",
      "webpack.${VERSION}.cjs",
    ];
    for (const grammar of grammars) {
      expect(text, `the ${grammar} asset grammar answers the dotted law`).toContain(grammar);
    }
    const attachLines = text
      .split("\n")
      .filter((line) => line.includes("gh release upload"))
      .flatMap((line) => line.split("\n").slice(1))
      .concat(
        text
          .split("\n")
          .filter((line) => line.trim().startsWith('"${{ matrix.package }}.'))
          .map((line) => line.trim()),
      );
    expect(attachLines.length, "the attach grammar lines answer").toBeGreaterThan(12);
    for (const line of attachLines) {
      expect(line, `no underscore ever rides a published asset: ${line}`).not.toMatch(/_\{?[A-Z]|_[a-z]/);
    }
  });

  it("the resolver validates the version lockstep of every leg", async () => {
    const text = await readworkflow("webpack.yml");
    const resolvers = text.split("resolve release version").length - 1;
    expect(resolvers, "the seven jobs (the seat and the six lanes) resolve the release version").toBe(7);
    expect(text, "every resolver validates the envelope version against the tag").toContain(
      "does not match the ${{ matrix.package }} envelope version",
    );
  });

  it("every action rides the sha pin the house stamps", async () => {
    const text = await readworkflow("webpack.yml");
    const uses = [...text.matchAll(/uses:\s*([^\s]+)/g)].map((match) => match[1]);
    expect(uses.length, "the workflow uses pinned actions").toBeGreaterThan(20);
    for (const use of uses) {
      expect(use, `the ${use} action rides the sha pin`).toMatch(/@[0-9a-f]{40}/);
    }
  });

  it("the registry lanes never collide with the family envelopes", async () => {
    const text = await readworkflow("webpack.yml");
    expect(text, "the npm lanes publish the scoped webpack envelopes").toContain(
      "'@wenathlan/${PKG}.webpack'",
    );
    expect(text, "the maven lane attaches the webpack classifier").toContain("-Dclassifier=webpack");
    expect(text, "the gradle lane rides the dotted artifactId").toContain("-DartifactId=\"${PKG}.webpack\"");
    expect(text, "the nuget lane rides the dotted packageId").toContain("<PackageId>${PKG}.webpack</PackageId>");
    expect(text, "the rubygems lane derives from the folder gemspec").toContain("${PKG}/${PKG}.gemspec");
  });
});
