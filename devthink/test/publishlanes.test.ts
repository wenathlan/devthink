/**
 * publishlanes.test.ts — the publish lanes contract of the release doctrine:
 * the three laws the eleventh wave of the redesign campaign charged. the
 * saddle npmjs registry freshness — the family envelope lanes walk saddle
 * last with the explicit latest stamp (a rung landing below the retired
 * 2.1.6 line still publishes; the graceful skip answers the absent token
 * alone) and the twin-409 race (the release ladder and the publish mirror
 * staging the same envelope inside one release event) answers the
 * idempotent win through the registry's own refusal, never three burned
 * retries. the container distributions — the three vhe profiles the owner
 * doctrine names max, light and palatial ride the house labels max,
 * balanced and lite, every profile shipping the four-architecture index
 * under the -vhe tag family (one tag per version, no rolling alias), the
 * resolver reading the saddle manifest, the mesa digest github-computed,
 * and the legacy saddle container package of the standalone era skipped
 * honestly by the family ghcr loop (the repository token holds no write
 * there; the -vhe lane owns the saddle containers). the release assets
 * census — the structural floor every release-triggered lane promises
 * clears the thousand plus law (the owner order the thousand asset ladder
 * answers: the release assets and the release notes carry MORE than one
 * thousand real assets), so the regression that once lost the four
 * hundred asset era of the 133/134 rungs can never land silently
 * again: the census answers at the pull request gate, before a release
 * ever ships. the registry family seats — the distfamily law: the four
 * github-packages family matrices answer every application envelope
 * (the saddle engine envelope joins the maven seat beside the nuget,
 * rubygems and github npm seats it already answered), and the saddle
 * pom answers the family coordinates the lane deploys, so a leg
 * dropped from a matrix or the dead standalone saddle registry
 * redeclared reddens the gate before a release ever ships.
 */
import { existsSync } from "node:fs";
import { access, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parseDocument } from "yaml";

const repoRoot = resolve(process.cwd(), "..");
/* the container builder stages the app folder alone: the repo root lanes
 * (the workflow files and the sibling manifests) answer only where the
 * whole repository rides beside the suite, so the batteries skip
 * honestly there instead of reading paths that never exist. */
const inrepo = existsSync(join(repoRoot, ".github", "workflows", "publish.yml"));
const workflowdir = join(repoRoot, ".github", "workflows");

const readworkflow = async (file: string) => await readFile(join(workflowdir, file), "utf8");
type workflow = { jobs?: Record<string, Record<string, unknown>> };
const parseworkflow = async (file: string) =>
  parseDocument(await readworkflow(file), { version: "1.2", uniqueKeys: true }).toJS() as workflow;

/** the matrix include of a job, typed for the vhe profile legs. */
type vhmatrix = { profile?: string; platforms?: string; suffix?: string; expectcpu?: string } & Record<string, unknown>;
const matrixof = (workflow: workflow, job: string): vhmatrix[] =>
  ((workflow.jobs?.[job]?.strategy as { matrix?: { include?: vhmatrix[] } } | undefined)?.matrix?.include ??
    []) as vhmatrix[];

/** the member family the release walks beside the os: the ten npm
 * envelopes of the publish mirror with saddle always last, the heaviest
 * pass of the house — the distribution-completeness law answers the gap
 * the mirror once carried (the gateway getry walked the release ladder's
 * loop alone and the monetization cobaia walked no registry lane; both
 * ride every lane now). */
const MIRRORFAMILY = ["argan", "cadria", "cobaia", "debonair", "forge", "foundry", "getry", "stealthhead", "vault", "saddle"];
/** the release ladder's own family loop: the ten envelopes the family job
 * packs, saddle last — the distribution-completeness law rides both lanes
 * (the gateway getry and the monetization cobaia answer beside the eight
 * the lanes always carried). */
const RELEASEFAMILY = ["argan", "cadria", "cobaia", "debonair", "forge", "foundry", "getry", "stealthhead", "vault", "saddle"];
/** the registry family the four github-packages matrix lanes walk in the
 * canonical alphabetical pass order — the distfamily law: every
 * application envelope answers every registry seat (devthink rides its
 * own single lanes, the ten siblings ride the family mirrors, and the
 * saddle engine envelope walks the maven seat beside the nuget, rubygems
 * and github npm seats it already answered). */
const REGISTRYFAMILY = [
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
/** every application folder of the monorepo the version lockstep stamps. */
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

describe.skipIf(!inrepo)("the npmjs registry freshness lane", () => {
  it("the family envelope matrix of the publish mirror walks saddle last", async () => {
    const publish = await parseworkflow("publish.yml");
    const matrix = (publish.jobs?.["family-npmjs"]?.strategy as { matrix?: { package?: string[] } })?.matrix;
    expect(matrix?.package).toEqual(MIRRORFAMILY);
    expect(matrix?.package?.at(-1)).toBe("saddle");
  });

  it("every family publish stamps the explicit latest tag — a rung below the retired line still lands", async () => {
    const publish = await readworkflow("publish.yml");
    /* the owner rule the #81 fix landed on the mirror: npm 12 refuses the
     * IMPLICIT latest when the envelope version sits below the registry
     * latest (the saddle 2.1.6 line), so both invocations carry the
     * explicit tag and the dist-tag step realigns latest to the rung. */
    expect(publish).toContain("npm publish --access public --provenance --tag latest 2>&1");
    expect(publish).toContain("npm publish --access public --tag latest 2>&1");
    expect(publish).toContain('npm dist-tag add "@wenathlan/${{ matrix.package }}@${RELEASE_VERSION}" latest');
    expect(publish).toContain("the envelope publishes ALWAYS while the");
    /* the release ladder's own family loop carries the same stamp: the
     * 2.0.151 rung reddened it with "Cannot implicitly apply the latest
     * tag" three times because the twin loop never received the fix. */
    const release = await readworkflow("release.yml");
    expect(release).toContain("--access public --provenance --tag latest 2>&1");
    expect(release).toContain("explicit latest tag answers the implicit-latest refusal");
  });

  it("the twin-409 race answers the idempotent win in every npm lane", async () => {
    /* the doctrine (rules.distilled d2): the release ladder and the publish
     * mirror stage the same envelope inside one release event; the registry
     * answers the latecomer with "cannot publish over previously
     * staged/published" while the read path lags — the npm view check can
     * never see a staged version, so the registry's own refusal is the win.
     * the 2.0.151 rung reddened npmjs, debonair and forge on the lag. */
    const publish = await readworkflow("publish.yml");
    const twinwins = publish.split('grep -qiE "cannot publish over previously (published|staged)"').length - 1;
    expect(twinwins).toBe(2); /* the application lane and the family mirror */
    expect(publish).toContain("the twin lane already owns ${RELEASE_VERSION}");
    const release = await readworkflow("release.yml");
    expect(release).toContain('grep -qiE "cannot publish over previously (published|staged)"');
    expect(release).toContain("the latecomer answers already published.");
  });

  it("the devthink npm seat rides the release ladder with the sibling guarantees (the npm lane root cause)", async () => {
    /* the owner complaint (the devthink package never answered npmjs while
     * the family envelopes published): the devthink application publishes
     * through its own single lanes — the release ladder's npmjs job and the
     * publish mirror's npmjs/githubnpm jobs — never through the family
     * matrices, so the seat answers the ladder edge that feeds the assemble
     * lane: the assemble needs edge rides the yaml flow sequence form
     * [metadata, verify] (a bare scalar with a stray closing bracket answers
     * an unknown job on the registry's parser and no npm lane — application
     * or family — ever fires), and the application publish carries the
     * EXPLICIT latest tag the sibling envelopes answer (the #81 fix): the
     * devthink registry latest sits on the retired 2.1.x line the heal
     * documents, npm 12 refuses the IMPLICIT latest tag for a rung below
     * it, and a refusal is never a transient failure — the bounded retry
     * burned all three attempts of the 2.0.151 rung on the refusal while
     * the family loop (which stamps the tag) published around it. */
    const release = await readworkflow("release.yml");
    expect(release).toContain("needs: [metadata, verify]");
    expect(release).not.toContain("needs: etadata, verify]");
    /* the assemble lane feeds the npmjs job the built tarball publishes */
    expect(release).toContain("needs: [assemble, releaseassets, release-approval]");
    /* the devthink npm seat carries the same guarantees the sibling
     * envelopes answer: the explicit latest tag beside the provenance
     * signature on BOTH npmjs lanes of the application package. */
    expect(release).toContain(
      'npm publish "./release/wenathlan-devthink-${RELEASE_VERSION}.tgz" --registry=https://registry.npmjs.org --access public --provenance --tag latest',
    );
    const publish = await readworkflow("publish.yml");
    expect(publish).toContain('npm publish "${tarball}" --access public --provenance --tag latest');
    /* the publish mirror seats the application package beside the family:
     * the npmjs job answers the public registry, the githubnpm job answers
     * the github packages registry — the dual npm law of the PR14 seat. */
    const parsed = await parseworkflow("publish.yml");
    expect(parsed.jobs?.npmjs).toBeDefined();
    expect(parsed.jobs?.githubnpm).toBeDefined();
    expect(publish).toContain("registry-url: https://registry.npmjs.org");
    expect(publish).toContain("registry-url: https://npm.pkg.github.com");
    /* the application manifest answers the public registry identity the
     * siblings carry (the saddle pin beside the devthink one) */
    const devthink = JSON.parse(await readFile(join(repoRoot, "devthink", "package.json"), "utf8")) as {
      name?: string;
      private?: boolean;
      publishConfig?: { access?: string; registry?: string };
    };
    expect(devthink.name).toBe("@wenathlan/devthink");
    expect(devthink.private).not.toBe(true);
    /* the manifestemplate law: the public registry identity answers the
     * publish workflow's explicit --access public flag, never a
     * publishConfig tag the application manifest carries */
    expect(devthink.publishConfig, "the app manifest carries no publishConfig tag").toBeUndefined();
    expect(publish).toContain("--access public");
  });

  it("the graceful skip answers the absent token alone", async () => {
    const publish = await readworkflow("publish.yml");
    expect(publish).toContain("skip notice when NPM_TOKEN is not configured");
    expect(publish).toContain("if: steps.token.outputs.available != 'true'");
    expect(publish).toContain("Secret NPM_TOKEN is not configured");
    /* the pre-check tolerance: an envelope the twin already landed answers
     * the skip, never a second publish burn. */
    expect(publish).toContain("envelope version already exists; skipping publish.");
  });

  it("the resolvers read the application manifests, never a foreign tag", async () => {
    const publish = await readworkflow("publish.yml");
    expect(publish).toContain("require('./${{ matrix.package }}/package.json').version");
    expect(publish).toContain("require('./saddle/package.json').version");
    /* the deleted saddle-v* tag resolver never runs again: the saddle
     * block's lanes read the saddle manifest of the checked out source
     * (the retirement of the extension lane kept the same resolver law —
     * the block comment carries the deleted-tag doctrine). */
    expect(publish).toContain("deleted tag pattern never answers a resolver again");
    expect(publish).toContain(
      "version=$(node -p \"JSON.parse(require('fs').readFileSync('saddle/package.json','utf8')).version\")",
    );
  });

  it("the family answers the version lockstep the single release note demands", async () => {
    /* the owner law: one release note fired, so every application carries
     * the same version number synchronized with the root package.json. */
    const root = JSON.parse(await readFile(join(repoRoot, "devthink", "package.json"), "utf8")) as {
      version: string;
    };
    for (const app of ALLAPPS) {
      const manifest = JSON.parse(await readFile(join(repoRoot, app, "package.json"), "utf8")) as { version?: string };
      expect(manifest.version, `${app} drifts from the family lockstep`).toBe(root.version);
    }
  });

  it("the saddle envelope answers the public registry identity", async () => {
    const saddle = JSON.parse(await readFile(join(repoRoot, "saddle", "package.json"), "utf8")) as {
      name?: string;
      private?: boolean;
      publishConfig?: { access?: string };
    };
    expect(saddle.name).toBe("@wenathlan/saddle");
    expect(saddle.private).toBe(false);
    expect(saddle.publishConfig, "the app manifest carries no publishConfig tag").toBeUndefined();
  });
});

describe.skipIf(!inrepo)("the registry family seats (the distfamily law)", () => {
  it("the four github-packages family matrices answer every application envelope", async () => {
    const publish = await parseworkflow("publish.yml");
    for (const lane of ["family-maven", "family-nuget", "family-rubygems", "family-githubnpm"]) {
      const matrix = (publish.jobs?.[lane]?.strategy as { matrix?: { package?: string[] } })?.matrix;
      expect(matrix?.package, `${lane} drifts from the registry family`).toEqual(REGISTRYFAMILY);
    }
    /* the npmjs mirror keeps its own order: saddle walks last, the
     * heaviest pass of the house beside its engine build. */
    const npmjs = (publish.jobs?.["family-npmjs"]?.strategy as { matrix?: { package?: string[] } })?.matrix;
    expect(npmjs?.package).toEqual(MIRRORFAMILY);
  });

  it("the family maven lane walks the one registry path every leg deploys", async () => {
    const publish = await readworkflow("publish.yml");
    /* the existence pre-check and the deploy target share the
     * com/wenathlan coordinate path the saddle pom now answers —
     * one lane, one registry, ten legs. */
    expect(publish).toContain('PUBLISH="https://maven.pkg.github.com/wenathlan/devthink"');
    expect(publish).toContain('"$PUBLISH/com/wenathlan/${PKG}/${VERSION}/${PKG}-${VERSION}.jar"');
  });

  it("the saddle maven envelope answers the family coordinates the lane deploys", async () => {
    const pom = await readFile(join(repoRoot, "saddle", "pom.xml"), "utf8");
    expect(pom).toContain("<groupId>com.wenathlan</groupId>");
    expect(pom).toContain("<artifactId>saddle</artifactId>");
    expect(pom).toContain("https://maven.pkg.github.com/wenathlan/devthink");
    /* the standalone saddle registry the standalone era declared answers
     * no lane the merged repository token can publish. */
    expect(pom).not.toContain("maven.pkg.github.com/wenathlan/saddle");
    /* the revision lockstep: the family poms carry the release the root
     * manifest stamps, the same way every sibling pom does. */
    const root = JSON.parse(await readFile(join(repoRoot, "devthink", "package.json"), "utf8")) as { version: string };
    expect(pom).toContain(`<revision>${root.version}</revision>`);
  });
});

describe.skipIf(!inrepo)("the container distributions lane", () => {
  it("the three vhe profiles answer the owner doctrine — max, light and palatial ride max, balanced and lite", async () => {
    const publish = await parseworkflow("publish.yml");
    const profiles = matrixof(publish, "saddle-vhe-publish");
    /* the seven runnable publish legs: the three profile lanes (max,
     * balanced, lite — nothing removed) beside the four os-distribution
     * flavor lanes the container-lane law adds (linux, omarchy,
     * vanillaos, android — every flavor binds the max plan, the tier
     * axis stays the profile lanes' own). */
    expect(profiles.map((leg) => leg.profile)).toEqual(["max", "balanced", "lite", "max", "max", "max", "max"]);
    expect(profiles.map((leg) => leg.osprofile ?? "")).toEqual(["", "", "", "linux", "omarchy", "vanillaos", "android"]);
    expect(profiles.map((leg) => [leg.target, leg.suffix ?? ""])).toEqual([
      ["max", ""],
      ["balanced", "-balanced"],
      ["lite", "-lite"],
      ["oslinux", "-linux"],
      ["osomarchy", "-omarchy"],
      ["osvanillaos", "-vanillaos"],
      ["osandroid", "-android"],
    ]);
    /* the virtual hardware identity of each profile: the cpu model, the
     * core/thread counts, the memory plan in gibibytes, the gpu profile and
     * count — the constants the runtime stage bakes and the verify leg
     * probes through the spoofed /proc/cpuinfo. */
    expect(profiles[0]).toMatchObject({
      profilecpu: "epyc9965",
      profilevcpus: 192,
      profilethreads: 384,
      profileram: 1024,
      profilegpu: "b200",
      profilegpus: 8,
    });
    expect(profiles[1]).toMatchObject({
      profilecpu: "threadripperpro9995wx",
      profilevcpus: 96,
      profilethreads: 192,
      profileram: 512,
      profilegpu: "b200",
      profilegpus: 2,
    });
    expect(profiles[2]).toMatchObject({
      profilecpu: "ryzen9950x3d",
      profilevcpus: 16,
      profilethreads: 32,
      profileram: 128,
      profilegpu: "rtx5090",
      profilegpus: 1,
    });
    /* every profile ships the build legs the pinned base honestly
     * carries (the eleven-arch container law the saddle container heal
     * landed): amd64 the native x64 leg, arm64, ppc64le and s390x under
     * QEMU — the seven seats the base does not ship answer the
     * standard's honest coded absence, never a pretended build leg. */
    for (const leg of profiles) {
      expect(leg.platforms).toBe("linux/amd64,linux/arm64,linux/ppc64le,linux/s390x");
    }
  });

  it("the dockerfile defaults bake the max profile and never hardcode a digest", async () => {
    const dockerfile = await readFile(join(repoRoot, "saddle", "Dockerfile"), "utf8");
    /* the saddlemod heal law: the argan family doctrine — three explicit
     * profile targets (max / balanced / lite) with the SADDLE_PROFILE stamp
     * and the virtual hardware plan of each leg, no mesa machinery. */
    expect(dockerfile).toContain("ARG SADDLE_PROFILE=max");
    expect(dockerfile).toContain("SADDLE_PROFILE_CPU=");
    expect(dockerfile).toContain("SADDLE_PROFILE_VCPUS=");
    expect(dockerfile).toContain("SADDLE_PROFILE_RAM_GB=");
    expect(dockerfile).toContain("SADDLE_PROFILE_GPU=");
    expect(dockerfile).toContain("SADDLE_PROFILE_GPUS=");
    expect(dockerfile).toContain("--target max");
    expect(dockerfile).toContain("--target balanced");
    expect(dockerfile).toContain("--target lite");
    /* the digest law: no hardcoded sha-256 anywhere in the container
     * sources — the base image resolves at build time on the runner. */
    expect(dockerfile).not.toMatch(/[a-f0-9]{64}/);
  });

  it("the profile tag family never collides with the node engine and never rolls", async () => {
    const publish = await readworkflow("publish.yml");
    /* the saddlemod heal law: max rides the bare :<version> tag of the
     * family pattern, balanced / lite carry the profile suffix, the
     * os-distribution lanes carry the seat suffix (the matrix suffix
     * field owns the grammar — the container-lane law wave), and no leg
     * ever publishes a rolling alias. */
    expect(publish).toContain('suffix="${{ matrix.suffix }}"');
    expect(publish).toContain("no rolling alias");
    const workflow = await parseworkflow("publish.yml");
    const verify = matrixof(workflow, "saddle-vhe-verify");
    /* the twenty verify legs: the three profile lanes, the four
     * os-distribution flavor lanes (runnable) and the thirteen catalog
     * lanes (the no-base seats: grapheneos, maruos, v, windows and the
     * nine honest osdistrib additions the owner's more-than-fifteen
     * directive rides). */
    expect(verify.map((leg) => [leg.profile, leg.suffix ?? "", leg.mode])).toEqual([
      ["max", "", "runnable"],
      ["balanced", "-balanced", "runnable"],
      ["lite", "-lite", "runnable"],
      ["max", "-linux", "runnable"],
      ["max", "-omarchy", "runnable"],
      ["max", "-vanillaos", "runnable"],
      ["max", "-android", "runnable"],
      ["catalog", "-grapheneos", "catalog"],
      ["catalog", "-maruos", "catalog"],
      ["catalog", "-v", "catalog"],
      ["catalog", "-windows", "catalog"],
      ["catalog", "-postmarketos", "catalog"],
      ["catalog", "-lineageos", "catalog"],
      ["catalog", "-calyxos", "catalog"],
      ["catalog", "-archlinux", "catalog"],
      ["catalog", "-alpine", "catalog"],
      ["catalog", "-debian", "catalog"],
      ["catalog", "-fedora", "catalog"],
      ["catalog", "-nixos", "catalog"],
      ["catalog", "-void", "catalog"],
    ]);
    const catalog = matrixof(workflow, "saddle-vhe-catalog");
    expect(catalog.map((leg) => leg.osprofile)).toEqual([
      "grapheneos",
      "maruos",
      "v",
      "windows",
      "postmarketos",
      "lineageos",
      "calyxos",
      "archlinux",
      "alpine",
      "debian",
      "fedora",
      "nixos",
      "void",
    ]);
  });

  it("the published vhe index answers the base-carried build legs and the honest console smokes", async () => {
    const publish = await readworkflow("publish.yml");
    /* the saddle container heal law (the eleven-arch standard of the
     * containerarch table): the build legs answer the four platforms
     * the pinned base honestly carries — the native x64 leg beside the
     * three QEMU-emulated seats — while the seven seats the base does
     * not ship keep the honest coded absence of the standard table. */
    expect(publish).toContain("platforms: linux/amd64,linux/arm64,linux/ppc64le,linux/s390x");
    expect(publish).toContain("platforms: linux/arm64,linux/ppc64le,linux/s390x");
    const standard = await readFile(join(repoRoot, "saddle", "containerarch.ts"), "utf8");
    for (const id of ["x64", "arm64", "armv7", "riscv64", "ppc64le", "s390x", "386", "mips64le", "loong64", "wasm32", "wasip1"]) {
      expect(standard, `the container standard must keep the ${id} seat`).toContain(`"${id}"`);
    }
    /* the saddlemod heal law: the spoofed /proc validations retired with
     * the mesa machinery — the legs verify the image with an honest
     * detached boot, the /health probe and the modalities plancount. */
    expect(publish).toContain("/health");
    expect(publish).toContain("/api/v1/modalities");
  });

  it("the node engine ghcr lane carries the five-architecture family index", async () => {
    const publish = await readworkflow("publish.yml");
    expect(publish).toContain("platforms: linux/amd64,linux/arm64,linux/ppc64le,linux/s390x,linux/riscv64");
    expect(publish).toContain('. == ["amd64", "arm64", "ppc64le", "riscv64", "s390x"]');
  });

  it("the pre-deploy existence check matches the lane family — the saddle lesson", async () => {
    const publish = await readworkflow("publish.yml");
    /* the bare startswith(${version}) once saw the node-engine tag and
     * no-opped the vhe publication; the match carries the lane suffixes.
     * the partial-publish freeze fix tightens the same lesson: the
     * no-op now demands the complete twenty-lane family (the three
     * profile lanes, the four os-distribution flavor lanes and the
     * thirteen catalog lanes all live) instead of any single tag, and
     * the per-leg guard inside the publish matrix skips only the legs
     * that already ship so a re-run completes the missing siblings. */
    expect(publish).toContain('. == \\"${version}\\" or . == \\"${version}-balanced\\" or . == \\"${version}-lite\\" or . == \\"${version}-linux\\" or . == \\"${version}-omarchy\\" or . == \\"${version}-vanillaos\\" or . == \\"${version}-android\\" or . == \\"${version}-grapheneos\\" or . == \\"${version}-maruos\\" or . == \\"${version}-v\\" or . == \\"${version}-windows\\" or . == \\"${version}-postmarketos\\" or . == \\"${version}-lineageos\\" or . == \\"${version}-calyxos\\" or . == \\"${version}-archlinux\\" or . == \\"${version}-alpine\\" or . == \\"${version}-debian\\" or . == \\"${version}-fedora\\" or . == \\"${version}-nixos\\" or . == \\"${version}-void\\"');
    expect(publish).toContain('if [ "${api_out}" = "20" ]');
    expect(publish).toContain('echo "skip=true" >> "$GITHUB_OUTPUT"');
    expect(publish).toContain("if: steps.meta.outputs.skip != 'true'");
  });

  it("the vhe lanes answer the release law — the saddle container publishes with the family", async () => {
    const workflow = await parseworkflow("publish.yml");
    /* the saddle container law: the resolve lane carries the same release
     * guard every application lane carries, so the release published
     * firing, the successful workflow_run completion of the release
     * ladder and the maintenance dispatch all reach the chain (the
     * standalone era kept the lane dispatch-only and the container never
     * published with the family — the gap the owner's law closes). */
    const guard = String(workflow.jobs?.["saddle-vhe-resolve"]?.if ?? "");
    expect(guard).toContain("github.event_name != 'release' || startsWith(github.event.release.tag_name, 'v')");
    expect(guard).toContain("github.event.workflow_run.conclusion == 'success'");
    expect(guard).toContain("github.event.workflow_run.event == 'push' || github.event.workflow_run.event == 'workflow_dispatch'");
    /* the deep validation lane keeps its dispatch-only shape: the
     * twelve-leg firecracker matrix answers the maintenance dispatch
     * alone, where its cost belongs. */
    expect(workflow.jobs?.["saddle-vhe-validate"]?.if).toBe("github.event_name == 'workflow_dispatch'");
    const publish = await readworkflow("publish.yml");
    expect(publish).toContain("the saddle container law");
    /* the race the workflow_run firing carries: the moving head may
     * already answer the next rung, so the resolver detaches the release
     * tag and reads the saddle manifest of the tagged source (the ghcr
     * lane mold), never the moving head. */
    expect(publish).toContain('tag="$(gh release view --json tagName --jq .tagName)"');
    expect(publish).toContain('git checkout --detach "$tag"');
    /* the security gate the publish rides behind: the trivy scan over the
     * same runtime target the publish legs build. */
    expect(publish).toContain("Saddle vhe security gate");
    expect(publish).toContain("--scanners vuln,secret,misconfig");
  });

  it("the saddle container archive lane answers the asset parity law", async () => {
    const workflow = await parseworkflow("publish.yml");
    /* the saddle vhe image ships the same portable release asset the
     * devthink container archive ships: the lane rides behind the
     * resolver and the security gate (a FAILED trivy scan never ships an
     * archive), saves the max profile image the registry lane publishes
     * and attaches the tar.gz beside the devthink one. */
    const archive = workflow.jobs?.["saddle-container"] as
      | { needs?: string[]; if?: string; permissions?: Record<string, string> }
      | undefined;
    expect(archive?.needs).toEqual(["saddle-vhe-resolve", "saddle-vhe-scan"]);
    expect(archive?.if).toBe("needs.saddle-vhe-resolve.outputs.proceed == 'true'");
    expect(archive?.permissions?.contents).toBe("write");
    const publish = await readworkflow("publish.yml");
    expect(publish).toContain('archive="saddle.container.${{ needs.saddle-vhe-resolve.outputs.version }}.tar.gz"');
    expect(publish).toContain('-f saddlebuildctx/saddle/Dockerfile saddlebuildctx');
    /* the sums umbrella walks the archive lane: the SHA256SUMS rebuild
     * answers only after every lane attached its assets. */
    const sums = workflow.jobs?.sums as { needs?: string[] } | undefined;
    expect(sums?.needs).toContain("saddle-container");
  });

  it("the base image resolver answers the digest law — nothing hardcoded rides the container lane", async () => {
    const publish = await readworkflow("publish.yml");
    /* the saddlemod heal law: the mesa resolver and its mirror healing
     * retired with the from-source stages — the family doctrine resolves
     * the base image digest at build time on the runner (the bases step
     * deriving NODE_BASE) and no 64-hex digest ever enters the
     * repository or the workflow body. */
    expect(publish).toContain("NODE_BASE");
    expect(publish).not.toContain("MESA_SHA256");
    expect(publish).not.toMatch(/"[a-f0-9]{64}"/);
  });

  it("the family ghcr loop walks past the legacy saddle package honestly", async () => {
    /* the standalone era published the 2.1.x line to the legacy saddle
     * container package, which keeps its own access list: the merged
     * repository token answers permission_denied on every push and the
     * denial reddened the loop before stealthhead and vault ever built (the
     * 2.0.151 rung). the saddle container distributions answer the vhe
     * lane under the devthink package; the family loop skips the legacy
     * package the same honest way the container shape case map answers. */
    const release = await readworkflow("release.yml");
    expect(release).toContain('if [ "${app}" = "saddle" ]; then');
    expect(release).toContain(
      "the legacy container package keeps the standalone era access list; the saddle containers answer the vhe lane of the publish workflow.",
    );
    /* the container shape law the case map registers: the dead sibling-pin
     * guard the zero app carried left the lane (no manifest pins file:../
     * today), so the three site homes ride the staged familybuildctx the
     * publish lane stages, the workbench builds from the repository root
     * and the self-contained site homes keep their own folder. */
    expect(release).toContain('case "${app}" in');
    expect(release).toContain("rm -rf familybuildctx");
    expect(release).toContain("cp -a vault/. familybuildctx/vault/");
    expect(release).toContain('docker build -t "${image}:${RELEASE_VERSION}" -f devthink/Dockerfile --target runtime .');
    /* the loop still walks every application folder: the skip is the
     * saddle leg alone, the siblings keep their builds. */
    expect(release).toContain(
      "for app in argan cadria cobaia debonair devthink forge foundry getry saddle stealthhead vault; do",
    );
  });
});

describe.skipIf(!inrepo)("the release assets census (the thousand plus law)", () => {
  /** the file-bundle kinds the desktop collect step ships: the -f guard of
   * the find walk skips the .app directory (it never rides as a file), so
   * the census counts the bundle kinds that land as files. */
  const filebundles = (bundles: string): number => bundles.split(",").filter((kind) => kind !== "app").length;

  it("the family desktop lane walks nine member applications over seven platforms", async () => {
    const desktop = await parseworkflow("family-desktop.yml");
    const job = desktop.jobs?.desktop as
      | {
          strategy?: {
            matrix?: { app?: string; platform?: string[]; include?: Array<{ platform?: string; bundles?: string }> };
          };
        }
      | undefined;
    const matrix = job?.strategy?.matrix;
    expect(matrix?.app).toContain("fromJSON(");
    /* the release axis answers the nine member applications (the os rides
     * its own publish lane and never duplicates itself here). */
    const apps = [...String(matrix?.app).matchAll(/"([a-z]+)"/g)].map((match) => match[1]);
    expect(apps).toEqual([
      "argan",
      "cadria",
      "debonair",
      "forge",
      "foundry",
      "getry",
      "saddle",
      "stealthhead",
      "vault",
    ]);
    expect(apps).not.toContain("devthink");
    /* the seven platform entries with their bundle grammar. */
    expect(matrix?.platform).toEqual([
      "linux-x64",
      "linux-arm64",
      "windows-x86",
      "windows-x64",
      "windows-arm64",
      "macos-x64",
      "macos-arm64",
    ]);
    expect(matrix?.include?.length).toBe(7);
    for (const entry of matrix?.include ?? []) expect(entry.bundles).toBeDefined();
  });

  it("the family mobile lane walks the android axis with the four-asset grammar", async () => {
    const mobile = await parseworkflow("family-mobile.yml");
    const android = mobile.jobs?.android as { strategy?: { matrix?: { include?: string } } } | undefined;
    const axis = String(android?.strategy?.matrix?.include);
    /* the release firing walks the nine member applications (devthink rides
     * its own publish lane); every other firing walks the full matrix. */
    expect(axis).toContain("github.event_name == 'release'");
    const releaselist = /fromJson\('(\[\{[^\]]+\}\])'\)/.exec(axis)?.[1] ?? "";
    const apps = [...releaselist.matchAll(/"app":"([a-z]+)"/g)].map((match) => match[1]);
    expect(apps).toEqual([
      "argan",
      "cadria",
      "debonair",
      "forge",
      "foundry",
      "getry",
      "saddle",
      "stealthhead",
      "vault",
    ]);
    expect(apps).not.toContain("devthink");
    /* the four assets every android leg attaches: the apk, the aab, the
     * sha256 record and the manifest. */
    const source = await readworkflow("family-mobile.yml");
    expect(source).toContain('apk="${{ matrix.app }}.android.${version}.apk"');
    expect(source).toContain('aab="${{ matrix.app }}.android.${version}.aab"');
    expect(source).toContain('sha256.android.${version}"');
    expect(source).toContain("manifest.android.${version}.json");
  });

  it("the next conversion walks the eleven applications with the fifteen-asset grammar", async () => {
    const convert = await readFile(join(repoRoot, "devthink", "scripts.ts"), "utf8");
    /* the CONVERT list: every site application of the monorepo, the os
     * included — cobaia joined the conversion lane (wave/firststation):
     * the monetization surface walks the same fifteen-asset grammar as the
     * rest of the family. */
    const list = /const CONVERT = \[([^\]]+)\]/.exec(convert)?.[1] ?? "";
    const apps = [...list.matchAll(/"([a-z]+)"/g)].map((match) => match[1]);
    expect(apps).toEqual([
      "devthink",
      "vault",
      "forge",
      "foundry",
      "argan",
      "cadria",
      "cobaia",
      "debonair",
      "saddle",
      "stealthhead",
      "getry",
    ]);
    /* the complete site archive plus the four next shapes (normal, zai,
     * fifty, personalized), every archive carrying the brotli overlay and
     * the zip twin of the owner spec: fifteen assets per application. */
    expect(convert).toContain("packxz(raw, INSIDE(path.join(out, `${app}.${versionof(app)}.tar.xz`)))");
    expect(convert).toContain("packxz(normal, INSIDE(path.join(out, `${app}.next.normal.${versionof(app)}.tar.xz`)))");
    expect(convert).toContain("packxz(zai, INSIDE(path.join(out, `${app}.next.zai.${versionof(app)}.tar.xz`)))");
    expect(convert).toContain("packxz(fifty, INSIDE(path.join(out, `${app}.next.fifty.${versionof(app)}.tar.xz`)))");
    expect(convert).toContain(
      "packxz(personal, INSIDE(path.join(out, `${app}.next.personalized.${versionof(app)}.tar.xz`)))",
    );
    expect(convert).toContain('if (file.endsWith(".tar.xz")) overlay(INSIDE(path.join(out, file)))');
    /* the zip twins (the thousand asset ladder): the five distribution
     * zips of the owner spec — the web seat of the site archive and the
     * zip twin of every next shape, the windows-native extraction form
     * beside the tar.xz and the brotli overlay. */
    expect(convert).toContain("packzip(raw, INSIDE(path.join(out, `${app}.web.${versionof(app)}.zip`)))");
    expect(convert).toContain("packzip(normal, INSIDE(path.join(out, `${app}.next.normal.${versionof(app)}.zip`)))");
    expect(convert).toContain("packzip(zai, INSIDE(path.join(out, `${app}.next.zai.${versionof(app)}.zip`)))");
    expect(convert).toContain("packzip(fifty, INSIDE(path.join(out, `${app}.next.fifty.${versionof(app)}.zip`)))");
    expect(convert).toContain(
      "packzip(personal, INSIDE(path.join(out, `${app}.next.personalized.${versionof(app)}.zip`)))",
    );
  });

  it("the release ladder packs the nine family envelopes with saddle last", async () => {
    const release = await readworkflow("release.yml");
    expect(release).toContain(`for app in ${RELEASEFAMILY.join(" ")}; do`);
    expect(release).toContain('npm pack "./${app}" --pack-destination familypack');
    /* the version resolution of the family lanes reads the application
     * manifests, never a foreign tag. */
    expect(release).toContain(
      "for app in argan cadria cobaia debonair devthink forge foundry getry saddle stealthhead vault; do",
    );
  });

  it("every family lane resolves the version from the application manifest", async () => {
    for (const file of ["family-desktop.yml", "family-mobile.yml"]) {
      const source = await readworkflow(file);
      expect(source).toContain("require('./${{ matrix.app }}/package.json').version");
    }
  });

  it("the structural census clears the thousand plus law", async () => {
    /* the census counts the deterministic assets every release-triggered
     * lane attaches: the family desktop legs (the file bundles, the
     * manifest and the sha256 record of each platform), the family android
     * legs (the universal apk plus the four abi splits, the aab, the
     * sha256, the manifest), the next conversion (the site archive and the
     * four next shapes of the eleven applications — every shape with the
     * tar.xz, the brotli overlay and the zip twin), the ten family
     * envelopes the release ladder packs, the per-app seat lane (the
     * source snapshot, the maven classifier pair, the sbom pair, the
     * attestations record and the checksum umbrella of every application),
     * the per-arch container seats (the eight site homes across the seven
     * non-amd64 legs of the eight-arch runtime index, every leg with the
     * image save, the checksum and the manifest record), the
     * os-distribution catalog seats (the ten family containers across the
     * thirteen catalog lanes of the osprofiles catalog, every seat with
     * the image save, the checksum and the manifest record), the
     * per-channel checksum umbrellas of the release walk and the os lanes
     * it carries,
     * beside the publish mirror's own deterministic ladders (the metadata
     * ladder, the family reports, the family container archives, the
     * gradle and go module seats). the os rides its own publish lanes
     * (the desktop bundles, the mobile artifacts, the container digest
     * records, the extension packages, the iso and the wasm cores) beside
     * this floor — a lane or a matrix leg deleted reddens the census
     * before a release ever ships. */
    const desktop = await parseworkflow("family-desktop.yml");
    const matrix = (
      desktop.jobs?.desktop as { strategy?: { matrix?: { include?: Array<{ bundles?: string }> } } } | undefined
    )?.strategy?.matrix;
    const bundles = (matrix?.include ?? []).reduce((total, entry) => total + filebundles(String(entry.bundles)), 0);
    const platforms = 7; /* the platform axis of the desktop lane */
    const desktopperapp = bundles + platforms * 2; /* bundle files + manifest + sha256 per platform */
    const desktopfamily = 9 * desktopperapp;
    const androidfamily = 9 * 8; /* universal apk + four abi splits + aab + sha256 + manifest */
    const nextfamily = 11 * 15; /* site archive + four next shapes of the eleven apps, brotli overlays and zip twins included */
    const envelopes = 10; /* the family tgz the release ladder packs (the ten member envelopes, saddle last) */
    const familyseats = 11 * 7; /* source snapshot + sources jar + javadoc jar + sbom pair + attestations record + checksum umbrella per application */
    const containerseats = 8 * 7 * 3; /* the eight site homes x the seven non-amd64 arch legs x (image save + checksum + manifest) */
    const oscatalogseats = 10 * 13 * 3; /* the ten family containers x the thirteen os-distribution catalog lanes x (image save + checksum + manifest) */
    const walkoslanes = 19; /* the thirteen base assets, the sbom, the attestations record, the iso, the wasm cores, the manifest and the sums */
    const channelchecksums = 11; /* one umbrella per distribution channel the walk stages (github answers the release-level sums, nuget answers the publish mirror) */
    /* the publish mirror's deterministic ladders */
    const publish = await parseworkflow("publish.yml");
    const metadatamatrix = (publish.jobs?.["family-metadata"]?.strategy as { matrix?: { app?: string[] } })?.matrix;
    const metadataapps = metadatamatrix?.app?.length ?? 0; /* the eleven applications of the metadata ladder */
    const publishmetadata = metadataapps * 23 + 7; /* 11 metadata assets + 11 arch manifests + the checksum, beside the seven family reports */
    const publishcontainers = 9 * 3; /* the family container archives: tar.gz + checksum + manifest per site home */
    const publishgradle = 10 * 4; /* pom + module + jar + checksum per member envelope */
    const publishgoget = 10 * 3; /* module zip + go.mod + checksum per member envelope */
    const census =
      desktopfamily +
      androidfamily +
      nextfamily +
      envelopes +
      familyseats +
      containerseats +
      oscatalogseats +
      walkoslanes +
      channelchecksums +
      publishmetadata +
      publishcontainers +
      publishgradle +
      publishgoget;
    expect(bundles).toBe(14); /* 3+3 linux, 2+2+2 windows (nsis and msi), 1+1 macos file bundles */
    expect(desktopperapp).toBe(28);
    expect(metadataapps).toBe(11);
    expect(census).toBeGreaterThanOrEqual(1000);
    expect(census).toBe(9 * 28 + 72 + 165 + 10 + 77 + 168 + 19 + 11 + 260 + 27 + 40 + 30 + 390);
    expect(census).toBe(1521);
  });

  it("the thousand asset ladder lanes walk the release workflow itself", async () => {
    /* the two lanes the release walk owns: the per-arch container seats of
     * the eight site homes (the seven non-amd64 legs — the amd64 leg
     * answers the single-arch save the publish mirror attaches) and the
     * per-app seat lane (the source, maven and provenance seats of every
     * application), both feeding the artifact manifest through the
     * releaseassets needs row. */
    const release = await parseworkflow("release.yml");
    const containerseats = release.jobs?.containerseats as
      | { strategy?: { matrix?: { app?: string[] } }; needs?: string[] }
      | undefined;
    expect(containerseats?.strategy?.matrix?.app).toEqual([
      "argan",
      "cadria",
      "cobaia",
      "debonair",
      "forge",
      "foundry",
      "getry",
      "stealthhead",
    ]);
    expect(containerseats?.needs).toBe("assemble");
    const familyseats = release.jobs?.familyseats as { needs?: string[] } | undefined;
    expect(familyseats?.needs).toEqual(["assemble", "nextzips", "family", "containerseats"]);
    const releaseassets = release.jobs?.releaseassets as { needs?: string[] } | undefined;
    expect(releaseassets?.needs).toContain("containerseats");
    expect(releaseassets?.needs).toContain("familyseats");
    /* the per-arch seat grammar and the seat count assertion the lane carries */
    const source = await readworkflow("release.yml");
    expect(source).toContain("for arch in 386 armv6 armv7 arm64 ppc64le riscv64 s390x; do");
    expect(source).toContain('test "$count" -eq 21');
    expect(source).toContain("if (seats !== 77) throw new Error('the family seat lane answers 77 seats, found ' + seats);");
    expect(source).toContain("THE THOUSAND ASSET LADDER");
    /* the per-channel checksum umbrellas and the census block the release
     * body carries */
    expect(source).toContain("sha256.channel.");
    expect(source).toContain("The asset census (the thousand plus law)");
  });
});

describe.skipIf(!inrepo)("the built envelope law (the exports promise)", () => {
  /** the dist entries the exports map, the bin and the main/types pair of
   * the saddle envelope declare — the set every publish lane must compile
   * and assert before the envelope touches a registry (the source and
   * config targets ship as the files field carries them; the dist targets
   * need the engine build). the automation seat retired with the ownership
   * wave — the lane moved to the os (devthink/automation.ts) and the
   * saddle envelope no longer declares it. */
  const SOURCETARGETS = [
    "browser.ts",
    "distribution.ts",
    "execution.ts",
    "foundation.ts",
    "index.ts",
    "isolation.ts",
    "modalityregistry.ts",
    "modes.ts",
    "sandbox.ts",
    "server.ts",
    "virtual.ts",
    "workloadlaw.ts",
  ];
  const LANEASSERTIONS = [
    ...SOURCETARGETS,
    "cli.ts" /* the bin the manifest declares */,
  ];

  /** the steps of a workflow job, name-indexed in declaration order. */
  const stepsof = (workflow: workflow, job: string): Array<{ name?: string; if?: string; run?: string }> =>
    (workflow.jobs?.[job]?.steps as Array<{ name?: string; if?: string; run?: string }>) ?? [];

  it("the saddle manifest promises the sources the registry envelope must carry", async () => {
    const saddle = JSON.parse(await readFile(join(repoRoot, "saddle", "package.json"), "utf8")) as {
      main?: string;
      types?: string;
      bin?: Record<string, string>;
      files?: string[];
      exports?: Record<string, unknown>;
      scripts?: Record<string, string>;
    };
    /* the entry pair, the bin and the files allowlist all answer the root
     * sources — the source-is-library law the vault doctrine brought (the
     * 2.0.151 registry envelope shipped none of the dist era). */
    expect(saddle.main).toBe("./index.ts");
    expect(saddle.types).toBe("./index.ts");
    expect(saddle.bin?.saddle).toBe("./cli.ts");
    expect(saddle.files).toContain("index.ts");
    /* every source target the exports map resolves exists as a committed
     * file, and the core twelve the lanes assert are all present — a new
     * export can never silently promise a file the lanes do not assert. */
    const targets = [
      ...new Set(
        Object.values(saddle.exports ?? {})
          .flatMap((value) => (typeof value === "string" ? [value] : Object.values(value as Record<string, string>)))
          .filter((value): value is string => typeof value === "string" && value.startsWith("./") && value.endsWith(".ts")),
      ),
    ].sort();
    for (const core of SOURCETARGETS) expect(targets).toContain(`./${core}`);
    for (const target of targets)
      await access(join(repoRoot, "saddle", target.replace(/^\.\//, "")));
  });

  it("the saddle manifest gates publish on the source check (the local contract)", async () => {
    /* prepublishOnly → pack:check → check: the chain a LOCAL publish from
     * the saddle folder walks (the tsc no-emit check beside the vitest
     * suite and the formatcheck). the CI lanes cannot lean on it — the
     * saddle .npmrc carries ignore-scripts for the install lanes — so they
     * assert the source faces explicitly; this pin keeps the manifest gate
     * honest for every publish that runs with scripts alive. */
    const saddle = JSON.parse(await readFile(join(repoRoot, "saddle", "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    const scripts = saddle.scripts ?? {};
    expect(scripts.prepublishOnly).toContain("pack:check");
    expect(scripts["pack:check"]).toContain("npm run check");
    expect(scripts.check).toContain("tsc -p tsconfig.json --noEmit");
    expect(scripts["build:engine"]).toContain("scriptsbuildengine.ts");
    expect(scripts.build).toBe("npm run build:engine");
  });

  it("the saddle npmrc silences the manifest gate — the reason the lanes build explicitly", async () => {
    /* the ignore-scripts law of the saddle npmrc exists for the install
     * lanes (the better-sqlite3 gyp rebuild rides a mirror lottery no lane
     * ever depended on); the side effect is that npm publish from the
     * saddle folder never runs prepublishOnly — the 2.0.151 envelope
     * shipped sources-only because of it. the pin holds the hazard visible:
     * if the npmrc ever drops the flag, the explicit lane builds stay (they
     * are the registry contract), and if it keeps it, no lane may lean on
     * the manifest gate alone. */
    const npmrc = await readFile(join(repoRoot, "saddle", ".npmrc"), "utf8");
    expect(npmrc).toContain("ignore-scripts=true");
  });

  it("the release ladder asserts the saddle sources before the family pack", async () => {
    const release = await parseworkflow("release.yml");
    const steps = stepsof(release, "family");
    const names = steps.map((step) => step.name ?? "");
    const buildindex = names.indexOf("Build the saddle engine envelope (the exports promise)");
    const packindex = names.indexOf("Pack every family envelope beside the application tarball");
    expect(buildindex).toBeGreaterThan(-1);
    expect(packindex).toBeGreaterThan(buildindex); /* the build precedes every pack */
    const build = steps[buildindex];
    expect(build?.run).toContain("npm --prefix saddle ci --ignore-scripts");
    for (const entry of LANEASSERTIONS) expect(build?.run).toContain(`test -f saddle/${entry}`);
  });

  it("the publish mirror asserts the saddle sources before the envelope publish", async () => {
    const publish = await parseworkflow("publish.yml");
    const steps = stepsof(publish, "family-npmjs");
    const names = steps.map((step) => step.name ?? "");
    const buildindex = names.indexOf("build the saddle engine envelope (the exports promise)");
    expect(buildindex).toBeGreaterThan(-1);
    /* the build rides between the identity check and the publish, and only
     * the saddle leg with the token present ever installs the toolchain. */
    const identityindex = names.indexOf("verify npm identity");
    const publishindex = names.indexOf("publish the family envelope when absent");
    expect(identityindex).toBeGreaterThan(-1);
    expect(buildindex).toBeGreaterThan(identityindex);
    expect(publishindex).toBeGreaterThan(buildindex);
    const build = steps[buildindex];
    expect(build?.if).toBe("matrix.package == 'saddle' && steps.token.outputs.available == 'true'");
    /* the npmjsprovenance heal (#513) retired the frozen ci lane — the
     * engine build resolves the manifest live (install, never the frozen
     * ci the retired package-lock froze on), so the expectation walks the
     * install command the publish mirror stamps. */
    expect(build?.run).toContain("npm --prefix saddle install --ignore-scripts --no-audit --no-fund");
    for (const entry of LANEASSERTIONS) expect(build?.run).toContain(`test -f saddle/${entry}`);
  });

  it("the release ladder's familynpmjs loop publishes the tarball the built family job packs", async () => {
    /* the twin lane publishes familypack/*.tgz — the tarballs the family
     * job packs AFTER its build step: publishing a tarball never runs
     * lifecycle scripts, so the build-before-pack of the family job is the
     * only thing that puts dist inside the twin's envelope. both lanes
     * fixed means whichever wins the race carries the built set. */
    const release = await readworkflow("release.yml");
    expect(release).toContain('publish_output="$(npm publish "./${tarball}"');
    expect(release).toContain("for tarball in familypack/*.tgz; do");
  });
});

describe.skipIf(!inrepo)("the family os-distribution catalog lanes (the container-lane law)", () => {
  /** the ten container homes the catalog lanes walk: every application
   * folder whose Dockerfile carries the thirteen scratch os targets — the
   * saddle engine owns its own vhe catalog lane in the publish mirror and
   * never duplicates itself here. */
  const CATALOGAPPS = [
    "devthink",
    "argan",
    "cadria",
    "cobaia",
    "debonair",
    "forge",
    "foundry",
    "getry",
    "stealthhead",
    "vault",
  ];
  /** the thirteen os-distribution catalog profiles the scratch targets
   * stamp, in the canonical order the osprofiles catalog rows walk. */
  const CATALOGPROFILES = [
    "grapheneos",
    "maruos",
    "v",
    "windows",
    "postmarketos",
    "lineageos",
    "calyxos",
    "archlinux",
    "alpine",
    "debian",
    "fedora",
    "nixos",
    "void",
  ];

  it("the publish mirror walks the family-oscatalog lane — ten apps x thirteen profiles behind the resolve and approval gates", async () => {
    /* the container-lane law the publish mirror owns: every family
     * container answers its thirteen os-distribution catalog lanes on the
     * registry (the scratch profile images the GHCR mirror pushes), the
     * lane riding behind the same release-resolve and release-approval
     * gates every registry lane of the mirror answers. */
    const publish = await parseworkflow("publish.yml");
    const lane = publish.jobs?.["family-oscatalog"] as
      | { needs?: string[]; strategy?: { matrix?: { app?: string[]; osprofile?: string[] } } }
      | undefined;
    expect(lane?.needs).toEqual(["release-resolve", "release-approval"]);
    expect(lane?.strategy?.matrix?.app).toEqual(CATALOGAPPS);
    expect(lane?.strategy?.matrix?.osprofile).toEqual(CATALOGPROFILES);
  });

  it("the release ladder saves the thirteen catalog seats of every family container and the releaseassets collection waits for the lane", async () => {
    /* the os-catalog seat lane mirrors the per-architecture container
     * seats: the same assemble need, the same ten x thirteen matrix the
     * publish mirror walks, and the portable save (docker save of the
     * built scratch target) feeding the releaseassets collection through
     * the needs row the artifact manifest reads. */
    const release = await parseworkflow("release.yml");
    const seats = release.jobs?.oscatalogseats as
      | {
          needs?: string;
          strategy?: { matrix?: { app?: string[]; osprofile?: string[] } };
          permissions?: Record<string, string>;
        }
      | undefined;
    expect(seats?.needs).toBe("assemble");
    expect(seats?.strategy?.matrix?.app).toEqual(CATALOGAPPS);
    expect(seats?.strategy?.matrix?.osprofile).toEqual(CATALOGPROFILES);
    expect(seats?.permissions?.contents).toBe("read");
    const releaseassets = release.jobs?.releaseassets as { needs?: string[] } | undefined;
    expect(releaseassets?.needs).toContain("oscatalogseats");
    /* the seat grammar and the render the lane carries: the scratch
     * target build answers the portable save with its checksum and
     * manifest records, the artifact name the releaseassets pattern
     * matches, and the import law renders the json the stages COPY. */
    const source = await readworkflow("release.yml");
    expect(source).toContain('import { OSPROFILES } from "./saddle/osprofiles.ts"');
    expect(source).toContain("node osprofile-dump.ts && rm -f osprofile-dump.ts");
    expect(source).toContain('test -s "oscatalogseatctx/osprofiles/${{ matrix.osprofile }}.json"');
    expect(source).toContain('--target "os${PROFILE}"');
    expect(source).toContain('-t "${APP}-oscatalog:${VERSION}-${PROFILE}"');
    expect(source).toContain('seat="release/${APP}.oscatalog.${VERSION}.${PROFILE}.tar.gz"');
    expect(source).toContain('docker save "${APP}-oscatalog:${VERSION}-${PROFILE}" | gzip > "${seat}"');
    expect(source).toContain('> "release/${APP}.sha256.oscatalog.${VERSION}.${PROFILE}"');
    expect(source).toContain('> "release/${APP}.manifest.oscatalog.${VERSION}.${PROFILE}.json"');
    expect(source).toContain(
      "release-oscatalogseats-${{ matrix.app }}-${{ matrix.osprofile }}-${{ needs.assemble.outputs.version }}",
    );
  });

  it("the import law — the osprofile json renders at build time and never commits, and every family Dockerfile carries the thirteen scratch targets in order", async () => {
    for (const app of CATALOGAPPS) {
      /* the catalog lives in the saddle alone: the json the scratch
       * stages COPY renders at build time from saddle/osprofiles.ts, so
       * no application folder ever carries a committed osprofiles
       * directory — a committed json would duplicate the catalog the
       * import law keeps single-sourced in the engine. */
      expect(existsSync(join(repoRoot, app, "osprofiles")), `${app} never commits osprofiles json`).toBe(false);
      const dockerfile = await readFile(join(repoRoot, app, "Dockerfile"), "utf8");
      const targets = [...dockerfile.matchAll(/^FROM scratch AS (os[a-z]+)$/gm)].map((match) => match[1]);
      expect(targets, `${app} drifts from the thirteen catalog targets`).toEqual(
        CATALOGPROFILES.map((profile) => `os${profile}`),
      );
    }
    /* the catalog source the render reads: every lane id the matrices
     * walk resolves onto a row the saddle owns. */
    const catalog = await readFile(join(repoRoot, "saddle", "osprofiles.ts"), "utf8");
    for (const profile of CATALOGPROFILES) expect(catalog).toContain(`id: "${profile}"`);
  });
});
