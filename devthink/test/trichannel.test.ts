/**
 * trichannel.test.ts — the tri-channel wave contract of the PR12
 * eleven-channel law: the three distribution seats the wave added (pypi,
 * cargo and homebrew) complete the eleven channels the publish workflow
 * operates — npmjs, the github npm registry, maven, nuget, rubygems,
 * gradle, goget and the container lanes beside the three new seats. the
 * lane families: the pypi and family-pypi jobs build the python
 * documentation envelopes with the stock runner python and ship them
 * through twine under the __token__ username law, the detect-cargo gate
 * seats the cargo and family-cargo jobs that package the rust version
 * envelopes with --no-verify --allow-dirty (the envelope carrier declares
 * no test target — the argan.java precedent in rust), and the homebrew and
 * family-homebrew jobs stamp the formula templates from the real release
 * asset on the runner (the #540 law: every checksum is born on the runner,
 * never from a constant) and push them to the wenathlan/homebrew-devthink
 * tap under the iakadion identity. every graceful-skip gate reads its
 * token through env alone (the Regra 56 law: a secret never rides an
 * `if:` condition), a repository without the secret skipping with a notice
 * instead of hard-failing the release pipeline. the packaging faces — the
 * pyproject.toml, the Cargo.toml with its <app>.rs carrier, the homebrew.rb
 * template and the MANIFEST.in of every application — and the pack channel
 * vocabulary that seats the wheel, the sdist and the crate onto the pypi
 * and cargo channels (additive, nothing removed) all redden this gate
 * before a release ever ships.
 */
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parse } from "smol-toml";
import { parseDocument } from "yaml";
import { artifactchannelof } from "../pack.js";

const repoRoot = resolve(process.cwd(), "..");
/* the container builder stages the app folder alone: the repo root lanes
 * (the workflow files and the sibling packaging faces) answer only where
 * the whole repository rides beside the suite, so the batteries skip
 * honestly there instead of reading paths that never exist. */
const inrepo = existsSync(join(repoRoot, ".github", "workflows", "publish.yml"));
const workflowdir = join(repoRoot, ".github", "workflows");

const readworkflow = async (file: string) => await readFile(join(workflowdir, file), "utf8");
type workflow = { jobs?: Record<string, Record<string, unknown>> };
const parseworkflow = async (file: string) =>
  parseDocument(await readworkflow(file), { version: "1.2", uniqueKeys: true }).toJS() as workflow;

/** the `if:` lines of a workflow source (the job guards and the step
 * gates) — the Regra 56 walker asserts no token secret ever rides one. */
const iflines = (source: string): string[] =>
  source.split("\n").filter((line) => /^\s*-?\s*if:/.test(line));

/** the ten sibling envelopes the family tri-channel matrices walk — the
 * workbench engine (devthink) rides its own single lanes, the same family
 * split the registry mirrors of the publish workflow carry. */
const TRICHANNELFAMILY = [
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
/** every application folder of the monorepo the tri-channel packaging
 * faces answer. */
const ALLAPPS = [
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

describe.skipIf(!inrepo)("the tri-channel wave (the PR12 eleven-channel law)", () => {
  it("the pypi lane family answers the publish workflow", async () => {
    const publish = await parseworkflow("publish.yml");
    expect(publish.jobs?.pypi).toBeDefined();
    expect(publish.jobs?.["family-pypi"]).toBeDefined();
    /* the family matrix the rubygems lane precedent set: the ten sibling
     * envelopes, every leg answering its own publish with fail-fast off. */
    const family = (publish.jobs?.["family-pypi"]?.strategy as { matrix?: { package?: string[] } })?.matrix;
    expect(family?.package, "the family-pypi matrix must answer the ten sibling envelopes").toEqual(TRICHANNELFAMILY);
    const source = await readworkflow("publish.yml");
    expect(source).toContain("\n  pypi:\n");
    expect(source).toContain("\n  family-pypi:\n");
    /* the graceful-skip gate (the family contract, Regra 54: the token is
     * OPTIONAL): the token rides env only — RAW_PYPI_TOKEN binds
     * secrets.PYPI_API_TOKEN — and no `if:` line of the workflow ever
     * references the secret directly (the Regra 56 law). */
    expect(source).toContain("RAW_PYPI_TOKEN: ${{ secrets.PYPI_API_TOKEN }}");
    for (const line of iflines(source))
      expect(line, "the Regra 56 law: the pypi token never rides an if gate").not.toContain("secrets.PYPI");
    /* the twine upload rides the __token__ username law pypi.org answers,
     * the password only through env */
    expect(source).toContain("TWINE_USERNAME: __token__");
    /* the wheel and the sdist the lane builds attach to the release as
     * evidence even when the publication skipped for the missing token */
    expect(source).toContain("dist/wenathlan_devthink-*.whl");
    expect(source).toContain("dist/wenathlan_devthink-*.tar.gz");
  });

  it("the cargo lane family answers the publish workflow", async () => {
    const publish = await parseworkflow("publish.yml");
    expect(publish.jobs?.["detect-cargo"]).toBeDefined();
    expect(publish.jobs?.cargo).toBeDefined();
    expect(publish.jobs?.["family-cargo"]).toBeDefined();
    /* the detect gate answers the Cargo.toml presence of the workbench
     * engine, and the publish lane cascades off its output alone. */
    const cargojob = publish.jobs?.cargo as { needs?: string[]; if?: string };
    expect(cargojob.needs).toContain("detect-cargo");
    expect(cargojob.if).toBe("needs.detect-cargo.outputs.present == 'true'");
    const family = (publish.jobs?.["family-cargo"]?.strategy as { matrix?: { package?: string[] } })?.matrix;
    expect(family?.package, "the family-cargo matrix must answer the ten sibling envelopes").toEqual(TRICHANNELFAMILY);
    const source = await readworkflow("publish.yml");
    expect(source).toContain("test -f devthink/Cargo.toml");
    /* the rust toolchain rides the house pin the desktop-tauri lane
     * stamps — the full-sha pin law, never a mutable tag */
    expect(source).toContain("dtolnay/rust-toolchain@b725eda525362e7cf34af9a7243cac1e3f01a7ec # stable");
    /* the graceful-skip gate reads the token through env only (Regra 56) */
    expect(source).toContain("RAW_CARGO_TOKEN: ${{ secrets.CARGO_REGISTRY_TOKEN }}");
    for (const line of iflines(source))
      expect(line, "the Regra 56 law: the cargo token never rides an if gate").not.toContain("secrets.CARGO");
    /* the envelope carrier declares no test target — the crate is the
     * version constant the registry lanes reference — and the version
     * stamp leaves the checkout one sed away from clean */
    expect(source).toContain("cargo package --no-verify --allow-dirty");
    /* the crate the lane packages attaches to the release as evidence */
    expect(source).toContain("target/package/wenathlan-devthink-*.crate");
  });

  it("the homebrew lane family answers the publish workflow", async () => {
    const publish = await parseworkflow("publish.yml");
    expect(publish.jobs?.homebrew).toBeDefined();
    expect(publish.jobs?.["family-homebrew"]).toBeDefined();
    const family = (publish.jobs?.["family-homebrew"]?.strategy as { matrix?: { package?: string[] } })?.matrix;
    expect(family?.package, "the family-homebrew matrix must answer the ten sibling envelopes").toEqual(
      TRICHANNELFAMILY,
    );
    const source = await readworkflow("publish.yml");
    /* the sha256 derives on the runner from the real downloaded release
     * asset (the #540 law: never from a constant, never hardcoded in the
     * workflow), and the length guard keeps the derivation honest */
    expect(source).toContain('sha256sum "/tmp/asset/wenathlan-devthink-${RELEASE_TAG#v}.tgz"');
    expect(source).toContain('test "${#ASSET_SHA256}" -eq 64');
    /* the stamp step exists: the sed rewrites the 64-hex placeholder the
     * template carries and the grep guard proves the derived checksum
     * landed in the formula, so the 64-zero placeholder never ships */
    expect(source).toContain("Stamp the formula from the template");
    expect(source).toContain('s/^  sha256 \\"[0-9a-f]\\\\{64\\\\}\\"/  sha256 \\"${sha256}\\"/');
    expect(source).toContain('grep -q "sha256 \\"${sha256}\\""');
    expect(source, "the 64-zero placeholder never ships through the workflow").not.toContain("0".repeat(64));
    /* the tap push targets the family tap (the tap naming law: brew tap
     * wenathlan/devthink answers the wenathlan/homebrew-devthink repo)
     * under the iakadion commit identity the family law stamps */
    expect(source).toContain("github.com/wenathlan/homebrew-devthink.git");
    expect(source).toContain("Formula/wenathlan-devthink.rb");
    expect(source).toContain('git config user.name "iakadion"');
    /* the graceful-skip gate reads the token through env only (Regra 56) */
    expect(source).toContain("RAW_BREW_TOKEN: ${{ secrets.HOMEBREW_GITHUB_TOKEN }}");
    for (const line of iflines(source))
      expect(line, "the Regra 56 law: the homebrew token never rides an if gate").not.toContain("secrets.HOMEBREW");
  });

  it("the tri-channel packaging faces answer the eleven apps", async () => {
    /* the lockstep version the root manifest stamps (2.0.166 at the wave)
     * — the same law the family lockstep test walks, so every face answers
     * the release the metadata sync propagates and a stamp the bump pass
     * forgets reddens the gate (the drift-gate law the publishing pipeline
     * suite carries for the java and csharp carriers). */
    const root = JSON.parse(await readFile("package.json", "utf8")) as { version: string };
    const version = String(root.version);
    for (const app of ALLAPPS) {
      const pyproject = await readFile(join(repoRoot, app, "pyproject.toml"), "utf8");
      expect(pyproject, `the ${app} pyproject must answer the pypi name law`).toContain(`name = "wenathlan-${app}"`);
      expect(pyproject, `the ${app} pyproject must carry the lockstep version`).toContain(`version = "${version}"`);
      const cargo = await readFile(join(repoRoot, app, "Cargo.toml"), "utf8");
      expect(cargo, `the ${app} crate manifest must answer the cargo name law`).toContain(`name = "wenathlan-${app}"`);
      expect(cargo, `the ${app} crate manifest must carry the lockstep version`).toContain(`version = "${version}"`);
      expect(cargo, `the ${app} lib target must answer the ${app}.rs carrier`).toContain(`path = "${app}.rs"`);
      const carrier = await readFile(join(repoRoot, app, `${app}.rs`), "utf8");
      expect(carrier, `the ${app} rust carrier must declare the version constant`).toContain("pub const VERSION");
      expect(carrier, `the ${app} rust carrier must carry the lockstep version`).toContain(
        `pub const VERSION: &str = "${version}";`,
      );
      const formula = await readFile(join(repoRoot, app, "homebrew.rb"), "utf8");
      expect(formula, `the ${app} formula must answer the family class law`).toContain("class Wenathlan");
      expect(formula, `the ${app} formula must ride the node dependency`).toContain('depends_on "node"');
      expect(
        existsSync(join(repoRoot, app, "MANIFEST.in")),
        `the ${app} pypi file manifest must exist`,
      ).toBe(true);
    }
  });

  it("the pack channel vocabulary seats the tri-channel artifacts", async () => {
    const root = JSON.parse(await readFile("package.json", "utf8")) as { version: string };
    const version = String(root.version);
    /* the three new seats: the wheel and the sdist of the python envelope
     * ride the pypi channel, the crate rides the cargo channel — every one
     * beside the github release asset channel every artifact rides. */
    expect(artifactchannelof(`wenathlan_devthink-${version}-py3-none-any.whl`, version)).toContain("pypi");
    expect(artifactchannelof(`wenathlan_devthink-${version}.tar.gz`, version)).toContain("pypi");
    expect(artifactchannelof(`wenathlan-devthink-${version}.crate`, version)).toContain("cargo");
    for (const name of [
      `wenathlan_devthink-${version}-py3-none-any.whl`,
      `wenathlan_devthink-${version}.tar.gz`,
      `wenathlan-devthink-${version}.crate`,
    ])
      expect(artifactchannelof(name, version)).toContain("github");
    /* the version anchored grammar keeps the seats honest: a name answers
     * its seat only under the release version it stamps, and the sdist
     * rule never shadows the container tar.gz saves the ladder attaches. */
    expect(artifactchannelof("wenathlan_devthink-0.0.0.tar.gz", version)).toEqual(["github"]);
    expect(artifactchannelof(`argan.container.${version}.arm64.tar.gz`, version)).toContain("container");
    /* the additive law (nothing removed): the pre-existing mappings still
     * answer — the tgz rides the npm channels, the nupkg rides nuget and
     * the gem rides rubygems exactly as the vocabulary always seated
     * them. */
    expect(artifactchannelof(`wenathlan-devthink-${version}.tgz`, version)).toContain("npmjs");
    expect(artifactchannelof(`devthink.${version}.nupkg`, version)).toContain("nuget");
    expect(artifactchannelof(`devthink-${version}.gem`, version)).toContain("rubygems");
  });

  it("the pyproject envelopes parse and the versions lockstep", async () => {
    /* smol-toml already rides the devthink dependency manifest, so the
     * envelopes parse through the real TOML reader instead of a regex walk
     * — the parsed document answers the name, the lockstep version and
     * the requires-python floor every envelope declares. */
    const root = JSON.parse(await readFile("package.json", "utf8")) as { version: string };
    const version = String(root.version);
    for (const app of ALLAPPS) {
      const text = await readFile(join(repoRoot, app, "pyproject.toml"), "utf8");
      const envelope = parse(text) as {
        project?: { name?: string; version?: string; "requires-python"?: string };
        "build-system"?: { requires?: string[]; "build-backend"?: string };
      };
      expect(envelope.project?.name, `the ${app} pyproject must parse under the pypi name law`).toBe(
        `wenathlan-${app}`,
      );
      expect(envelope.project?.version, `the ${app} pyproject must parse under the lockstep version`).toBe(version);
      expect(envelope.project?.["requires-python"], `the ${app} pyproject must declare the python floor`).toMatch(
        /^>=3/,
      );
      expect(envelope["build-system"]?.["build-backend"]).toBe("setuptools.build_meta");
    }
  });
});
