/**
 * webpacklanes.test.ts — the webpack distribution workflow contract of the
 * owner doctrine sealed by the fusion order of the latest breath: the
 * webpack the platform speaks is THE WORKFLOW THAT CREATES THE WEBPACK
 * DISTRIBUTION (the github actions seat the corridor clarified, never a
 * file naming flavor), the reason every application envelope carries the
 * webpack and webpack-cli dependencies beside the esbuild carrier the
 * transpile rides. the fusion law the corridor stamped ("cancela elas,
 * exclui elas e embute elas dentro do original"): the variant registry
 * seats the older wave published under the .webpack names are DEAD — the
 * bundle the webpackseats job builds attaches to the release beside its
 * checksum while the REGISTRY PUBLICATION of that bundle rides INSIDE the
 * original envelopes the publish workflow's family lanes ship (the files
 * field carrying the <app>.webpack.cjs seat, the maven classifier on the
 * normal com.wenathlan.<app> coordinates the owner named — forge, cadria
 * and the eleven — the gradle module, the nuget package and the rubygem
 * the same embed), so a variant lane reappearing, a .webpack package name
 * landing anywhere, the bundle seat losing its esbuild carrier or its
 * frozen lockfile, an asset riding an underscore, or the fusion step
 * dropping from a publish family lane reddens this gate before a release
 * ever ships the seats.
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
 * corridor stamped (the bundle seat rides every leg alike, devthink
 * included: the webpack distribution embeds in every original envelope
 * the family lanes own). */
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

/** the six variant registry lanes the fusion order killed — every one of
 * these job keys must stay absent from webpack.yml forever (the corridor
 * order: the variant seats are canceled, excluded, the feature embedded
 * in the original packages). */
const DEADVARIANTLANES = [
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

describe.skipIf(!inrepo)("the webpack distribution workflow (the fusion law)", () => {
  it("the workflow exists with the bundle seat alone — the variant registry lanes are dead", async () => {
    const webpack = await parseworkflow("webpack.yml");
    expect(webpack.jobs).toBeTruthy();
    expect(webpack.jobs?.["webpackseats"], "the bundle seat answers in webpack.yml").toBeTruthy();
    for (const lane of DEADVARIANTLANES) {
      expect(webpack.jobs?.[lane], `the ${lane} variant lane is dead by the fusion order`).toBeUndefined();
    }
    expect(Object.keys(webpack.jobs ?? {}), "the workflow answers exactly the bundle seat").toEqual(["webpackseats"]);
  });

  it("the bundle seat walks every application — the per-application webpack law", async () => {
    const webpack = await parseworkflow("webpack.yml");
    const job = webpack.jobs?.["webpackseats"] as lanejob | undefined;
    const family = job?.strategy?.matrix?.package ?? [];
    expect(
      [...family].sort(),
      "the bundle seat matrix carries the eleven applications the webpack law covers",
    ).toEqual(WEBPACKFAMILY);
  });

  it("the bundle seat builds through the webpack CLI beside the esbuild carrier", async () => {
    const text = await readworkflow("webpack.yml");
    const seats = text.split("  webpackseats:")[1] ?? "";
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
    expect(seats, "the seat validates the checksum beside the bundle").toContain("sha256sum");
  });

  it("the workflow never names a variant registry seat — the .webpack package grammar is dead", async () => {
    const text = await readworkflow("webpack.yml");
    /* the fusion law the corridor sealed: the registry publication of the
     * bundle rides INSIDE the original packages, so no variant package
     * name (the @wenathlan/<app>.webpack npm envelope, the
     * com.wenathlan.<app>.webpack artifactId, the <app>.webpack nuget
     * packageId or the <app>.webpack gem) ever lands in the webpack
     * workflow again. */
    expect(text).not.toContain("'@wenathlan/${PKG}.webpack'");
    expect(text).not.toContain("-DartifactId=\"${PKG}.webpack\"");
    expect(text).not.toContain("<PackageId>${PKG}.webpack</PackageId>");
    expect(text).not.toContain("${PKG}/${PKG}.webpack.gemspec");
  });

  it("the asset grammar rides the dotted law and never an underscore", async () => {
    const text = await readworkflow("webpack.yml");
    /* the release assets the bundle seat attaches: the cjs bundle beside
     * its sha256 twin, the dotted law, never an underscore. */
    const grammars = ["webpack.${VERSION}.cjs", "sha256.webpack.${VERSION}"];
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
    expect(attachLines.length, "the attach grammar lines answer").toBeGreaterThanOrEqual(2);
    for (const line of attachLines) {
      expect(line, `no underscore ever rides a published asset: ${line}`).not.toMatch(/_\{?[A-Z]|_[a-z]/);
    }
  });

  it("the resolver validates the version lockstep of the seat", async () => {
    const text = await readworkflow("webpack.yml");
    const resolvers = text.split("resolve release version").length - 1;
    expect(resolvers, "the bundle seat resolves the release version").toBe(1);
    expect(text, "every resolver validates the envelope version against the tag").toContain(
      "does not match the ${{ matrix.package }} envelope version",
    );
  });

  it("every action rides the sha pin the house stamps", async () => {
    const text = await readworkflow("webpack.yml");
    const uses = [...text.matchAll(/uses:\s*([^\s]+)/g)].map((match) => match[1]);
    expect(uses.length, "the workflow uses pinned actions").toBeGreaterThanOrEqual(3);
    for (const use of uses) {
      expect(use, `the ${use} action rides the sha pin`).toMatch(/@[0-9a-f]{40}/);
    }
  });

  it("the fusion embeds the bundle inside the original envelopes the publish lanes ship", async () => {
    const publish = await readworkflow("publish.yml");
    /* the embed the fusion law seats in the publish workflow: the family
     * lanes bundle the webpack seat beside the sources their original
     * envelopes already carry — the esbuild carrier, the webpack CLI
     * bundle through the generated config, the cjs landing at the app
     * root where the files field (and the staged distpackage, the maven
     * classifier, the gradle module jar, the nuget package and the
     * rubygem) ship it. */
    const fusionsteps = publish.split("bundle the webpack seat inside the original envelope (the fusion law)").length - 1;
    expect(fusionsteps, "the fusion step rides the publish family lanes (npm, maven, gradle, nuget, rubygems)").toBe(
      8,
    );
    expect(publish).toContain("publish the webpack classifier the fusion embeds on the normal artifact");
    expect(publish).toContain('-DartifactId="${PKG}" -Dversion="${VERSION}" -Dclassifier=webpack');
  });
});
