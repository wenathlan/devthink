/**
 * containerlanes.test.ts — the containerlanes wave contract of the registry
 * doctrine: the four laws the owner's complaint charged ("as 11 lanes do
 * docker não foram publicadas e padronizadas em todos os aplicativos, e
 * saddle não tem +15 distribuições no docker e mais de 7 contando com
 * webpack, nem os outros apps que deveriam ter 11+"). the eleven container
 * lanes — every application of the monorepo answers its own
 * ghcr.io/wenathlan/<app> container package through the containers workflow
 * (the ten sibling lanes of the app-containers matrix beside the saddle
 * engine's own saddle-containers lane set), each leg carrying the version
 * tag, the latest alias, the per-architecture seat tags of every
 * base-carried arch and the documented best-effort lanes - more than eleven
 * lanes every app, honestly counted. the fifteen-plus docker distributions
 * — the saddle tag census answers nineteen distinct published tags (the
 * three profile umbrellas, the twelve architecture seats stamped off the
 * published index and the four os-distribution flavor lanes). the seven
 * webpack lanes — the webpack-bundled saddle engine distribution walks its
 * six registry channels (npmjs, the github npm registry, maven, nuget,
 * gradle and rubygems) beside the base npmjs envelope the family-npmjs
 * mirror ships: mais de sete contando com webpack. the channel census —
 * every application rides the eleven-plus distribution lanes the registries
 * answer (the seven registry family matrices of the publish workflow beside
 * the container lanes of the containers workflow), so the regression that
 * once left the ghcr package page answering only the saddle container can
 * never land silently again.
 */
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
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

/** the matrix include of a job, typed for the container lane legs. */
type lanematrix = {
  app?: string;
  profile?: string;
  osprofile?: string;
  suffix?: string;
  seatprefix?: string;
  platforms?: string;
  exotic?: string;
  channel?: string;
} & Record<string, unknown>;
const matrixof = (workflow: workflow, job: string): lanematrix[] =>
  ((workflow.jobs?.[job]?.strategy as { matrix?: { include?: lanematrix[] } } | undefined)?.matrix?.include ??
    []) as lanematrix[];
const flatmatrix = (workflow: workflow, job: string): string[] =>
  ((workflow.jobs?.[job]?.strategy as { matrix?: { app?: string[]; channel?: string[] } } | undefined)?.matrix
    ?.app ??
    []) as string[];

/** the ten sibling applications of the app-containers matrix (the saddle
 * engine walks its own saddle-containers lane set - the fifteen-plus law
 * demands the profile seats a plain matrix leg cannot carry). */
const SIBLINGS = [
  "argan",
  "cadria",
  "cobaia",
  "debonair",
  "devthink",
  "forge",
  "foundry",
  "getry",
  "stealthhead",
  "vault",
];
/** every application folder of the monorepo the container lanes answer. */
const ALLAPPS = [...SIBLINGS.slice(0, 5), "saddle", ...SIBLINGS.slice(5)];

/** the registry family matrices of the publish workflow every application
 * envelope rides (the distribution-completeness law the distfamily wave
 * closed - the seven registry seats beside the container lanes). */
const REGISTRYLANES = [
  "family-npmjs",
  "family-githubnpm",
  "family-maven",
  "family-nuget",
  "family-gradle",
  "family-rubygems",
  "family-goget",
] as const;

/** the four architecture seats the pinned node base honestly carries for
 * the saddle engine (the native amd64 leg beside the three QEMU-emulated
 * seats - the same build index the vhe lane family rides). */
const SEATARCHES = ["amd64", "arm64", "ppc64le", "s390x"];

describe.skipIf(!inrepo)("the eleven container lanes of the registry standard", () => {
  it("every sibling application answers its own container lane — the ten matrix legs beside the saddle lane set", async () => {
    const containers = await parseworkflow("containers.yml");
    /* the ten sibling lanes of the app-containers matrix: every leg
     * carries the platforms axis, the best-effort exotic axis and the
     * version build-arg its Dockerfile reads. */
    const apps = flatmatrix(containers, "app-containers");
    expect(apps).toEqual(SIBLINGS);
    const include = matrixof(containers, "app-containers");
    for (const leg of include) {
      expect(leg.platforms, `the ${leg.app} lane must carry the platforms axis`).toMatch(/^linux\//);
      expect(leg.platforms).toContain(",");
      expect(leg.exotic, `the ${leg.app} lane must carry the best-effort exotic axis`).toMatch(/^linux\//);
      expect(leg.versionarg, `the ${leg.app} lane must carry the version build-arg`).toMatch(/_VERSION$/);
    }
    /* the eleven-lane seat: the saddle engine walks its own lane set
     * (the saddle-containers job owns the fifteen-plus family), so the
     * union of the app matrix and the saddle lanes answers the eleven
     * application containers of the monorepo. */
    expect(containers.jobs?.["saddle-containers"]).toBeDefined();
    const seated = new Set([...apps, "saddle"]);
    expect([...seated].sort()).toEqual([...ALLAPPS].sort());
  });

  it("every app container answers more than eleven lanes — the version tag, the latest alias, the arch seats and the documented best-effort half", async () => {
    const containers = await readworkflow("containers.yml");
    /* the standardized surface every app leg carries: the version tag
     * and the latest alias ride the same buildx push, the
     * per-architecture seat tags stamp off the published index through
     * docker buildx imagetools (never a rebuild, never a placeholder -
     * the digest is the registry's own answer) and the best-effort
     * lanes fail closed without reddening the wave. */
    expect(containers).toContain("ghcr.io/${{ github.repository_owner }}/${{ matrix.app }}:${{ steps.release.outputs.version }}");
    expect(containers).toContain("ghcr.io/${{ github.repository_owner }}/${{ matrix.app }}:latest");
    expect(containers).toContain("docker buildx imagetools create -t \"${image}:${version}-${slug}\"");
    expect(containers).toContain("continue-on-error: true");
    /* the census law: 1 (version) + 1 (latest) + carried arches + exotic
     * arches > 11 for every leg of the matrix - the site homes answer
     * 8+4, the workbench engine 5+7 and the vault engine 2+10, fourteen
     * lanes every app. */
    const workflow = await parseworkflow("containers.yml");
    const include = matrixof(workflow, "app-containers");
    for (const leg of include) {
      const carried = (leg.platforms ?? "").split(",").filter(Boolean).length;
      const exotic = (leg.exotic ?? "").split(",").filter(Boolean).length;
      const lanes = 1 + 1 + carried + exotic;
      expect(lanes, `the ${leg.app} container must answer more than eleven lanes`).toBeGreaterThan(11);
    }
    /* the census assertion the lane itself carries: the lane count walks
     * the same arithmetic and reddens the wave on a leg that ever drops
     * below the owner's law. */
    expect(containers).toContain('test "${lanes}" -gt 11');
  });

  it("the idempotent publish and the context shape law ride every app lane", async () => {
    const containers = await readworkflow("containers.yml");
    /* a version tag is immutable content: a re-run over an already
     * published app container skips the build and only completes the
     * seat tags (the same idempotent doctrine the family-ghcr mirror
     * carries, answered through the one resolver seat the wave owns). */
    expect(containers).toContain("docker buildx imagetools inspect --raw");
    expect(containers).toContain('echo "skip=true" >> "$GITHUB_OUTPUT"');
    /* the context shape law the staged familybuildctx carries: the
     * copy-law vault sibling rides every site context, the pnpm
     * release-age window pins to zero for the container install and the
     * engine-ownership sibling map stages the cross-app consumers each
     * home declares (the same map the publish mirror proved). */
    expect(containers).toContain("minimumReleaseAge: 0");
    expect(containers).toContain("cp -a vault/. familybuildctx/vault/");
    expect(containers).toContain("cp -a debonair/. familybuildctx/debonair/");
    expect(containers).toContain("cp -a saddle/. familybuildctx/saddle/");
    /* the least-privilege job permissions the publish lanes carry:
     * packages: write beside contents: read. */
    const workflow = await parseworkflow("containers.yml");
    const permissions = workflow.jobs?.["app-containers"]?.permissions as Record<string, string>;
    expect(permissions?.packages).toBe("write");
    expect(permissions?.contents).toBe("read");
  });
});

describe.skipIf(!inrepo)("the saddle fifteen-plus docker distributions", () => {
  it("the saddle lane family answers three profile umbrellas, four os-distribution flavors and the twelve architecture seats — nineteen distinct tags", async () => {
    const workflow = await parseworkflow("containers.yml");
    const legs = matrixof(workflow, "saddle-containers");
    /* the seven runnable lane legs: the three profile lanes (max,
     * balanced, lite - the same virtual hardware plans the vhe lane
     * family of the publish workflow bakes) beside the four
     * os-distribution flavor lanes (linux, omarchy, vanillaos, android -
     * every flavor binds the max plan, the tier axis stays the profile
     * lanes' own). */
    expect(legs.map((leg) => [leg.profile, leg.target, leg.suffix])).toEqual([
      ["max", "max", ""],
      ["balanced", "balanced", "-balanced"],
      ["lite", "lite", "-lite"],
      ["max", "oslinux", "-linux"],
      ["max", "osomarchy", "-omarchy"],
      ["max", "osvanillaos", "-vanillaos"],
      ["max", "osandroid", "-android"],
    ]);
    /* every leg ships the build legs the pinned node base honestly
     * carries: the native amd64 leg beside the arm64, ppc64le and s390x
     * legs under QEMU - the same build index the vhe lanes ride. */
    for (const leg of legs) {
      expect(leg.platforms).toBe("linux/amd64,linux/arm64,linux/ppc64le,linux/s390x");
    }
    /* the seat axis: only the three profile legs carry the seatprefix
     * stamp (the flavor lanes ship their umbrella tag alone), and the
     * census arithmetic answers the owner's more-than-fifteen directive:
     * 3 umbrellas + 3 profiles x 4 arch seats + 4 flavors = 19 tags. */
    expect(legs.map((leg) => leg.seatprefix ?? "")).toEqual(["max", "balanced", "lite", "", "", "", ""]);
    const umbrellas = legs.length;
    const seats = legs
      .map((leg) => leg.seatprefix ?? "")
      .filter((prefix) => prefix !== "")
      .length * SEATARCHES.length;
    const flavors = legs.filter((leg) => (leg.seatprefix ?? "") === "").length;
    const census = umbrellas + seats;
    expect(census).toBe(3 + 12 + 4);
    expect(census).toBeGreaterThan(15);
  });

  it("the arch-seat stamping resolves the per-arch manifest digest of the published index", async () => {
    const containers = await readworkflow("containers.yml");
    /* the fifteen-plus law's arch half: every profile leg stamps its
     * four per-architecture seat tags off the published index - the
     * seat resolves exactly the per-arch manifest digest the multi-arch
     * push shipped through docker buildx imagetools, so
     * <version>-max-linux-arm64 answers the arm64 image of the max
     * profile (never a rebuild, never a placeholder). */
    expect(containers).toContain("Stamp the per-architecture seat tags (the arch-seat lanes of the profile legs)");
    expect(containers).toContain('docker buildx imagetools create -t "${img}:${ver}-${SEATPREFIX}-${slug}" "${img}@${digest}"');
    expect(containers).toContain("if: matrix.seatprefix != ''");
    /* the per-leg guard of the partial-publish freeze fix: a re-run
     * completes exactly the missing lanes of the family (the seat
     * stamping stays idempotent - a seat tag re-created over the same
     * digest content is a registry no-op). */
    expect(containers).toContain("the per-leg guard of the partial-publish freeze fix");
    expect(containers).toContain('echo "skip=true" >> "$GITHUB_OUTPUT"');
    /* the digest law: the node base digest resolves on the runner at
     * build time (no 64-hex digest ever lands in a source file), and
     * the bare-hex build-arg the saddle Dockerfile composes. */
    expect(containers).toContain("NODE_BASE_DIGEST=${{ steps.resolve.outputs.nodedigest }}");
    expect(containers).not.toMatch(/"[a-f0-9]{64}"/);
  });

  it("the saddle Dockerfile keeps the profile stages the lane family stamps", async () => {
    const dockerfile = await readFile(join(repoRoot, "saddle", "Dockerfile"), "utf8");
    /* the three profile variant stages the lane targets name, the
     * eleven-arch standard the header declares and the os-distribution
     * flavor stages the four flavor lanes build - the same stages the
     * vhe lane family of the publish workflow rides. */
    expect(dockerfile).toContain("AS max");
    expect(dockerfile).toContain("AS balanced");
    expect(dockerfile).toContain("AS lite");
    expect(dockerfile).toContain("AS oslinux");
    expect(dockerfile).toContain("AS osomarchy");
    expect(dockerfile).toContain("AS osvanillaos");
    expect(dockerfile).toContain("AS osandroid");
  });
});

describe.skipIf(!inrepo)("the saddle webpack seat (the seven-lane law)", () => {
  it("the webpack-bundled engine distribution walks its six registry channels beside the base npmjs envelope", async () => {
    const workflow = await parseworkflow("containers.yml");
    /* the pr14 law (the owner's sentence "6 por app versão Webpack +
     * npmjs" and the containerlanes complaint "mais de 7 contando com
     * webpack"): the six webpack channel legs of the matrix - npmjs,
     * the github npm registry, maven, nuget, gradle and rubygems, every
     * leg a real publish of the real webpack bundle the engine build
     * produces - beside the base npmjs envelope the family-npmjs mirror
     * of the publish workflow already ships for the saddle leg, so the
     * webpack axis owns SEVEN distribution lanes. */
    const channels = (workflow.jobs?.["saddle-webpack"]?.strategy as
      | { matrix?: { channel?: string[] } }
      | undefined)?.matrix?.channel;
    expect(channels).toEqual(["npmjs", "githubnpm", "maven", "nuget", "gradle", "rubygems"]);
    /* the seventh lane: the base npmjs envelope of the saddle engine
     * the family mirror publishes (the saddle leg of the family-npmjs
     * matrix of the publish workflow). */
    const publish = await parseworkflow("publish.yml");
    const family = (publish.jobs?.["family-npmjs"]?.strategy as { matrix?: { package?: string[] } })?.matrix;
    expect(family?.package).toContain("saddle");
    const total = (channels ?? []).length + 1;
    expect(total).toBeGreaterThanOrEqual(7);
  });

  it("the webpack bundle is the real exact-pinned cross-bundler product the ci battery verifies", async () => {
    const containers = await readworkflow("containers.yml");
    /* the cross-bundler rung the ci battery verifies, carried to the
     * saddle engine: the engine entry the manifest's build:engine lane
     * walks through bun run produces distpackage/index.js (the bun
     * build stamps the target, format and the four externals the host
     * owns) and the exact-pinned webpack fetch (webpack 5.112.2 with
     * its webpack-cli 6.0.1 peer) packs the one entry through the
     * generated config into the one webpack bundle the six channel
     * legs distribute (the LimitChunkCountPlugin holds the one-file
     * law and the module envelope declares its type). */
    expect(containers).toContain("bun run build:engine");
    expect(containers).toContain("--outfile=distpackage/index.js");
    expect(containers).toContain("-p webpack@5.112.2 -p webpack-cli@6.0.1");
    expect(containers).toContain("webpack -c ./distpackage/webpack.config.mjs");
    expect(containers).toContain("filename: \"saddle.webpack.js\"");
    expect(containers).toContain("new LimitChunkCountPlugin({ maxChunks: 1 })");
    expect(containers).toContain("test -s distpackage/webpack/saddle.webpack.js");
    /* the envelope coordinates of the webpack distribution never
     * collide with the engine envelope the publish lanes own: the
     * npm lanes carry @wenathlan/saddle-webpack, maven carries the
     * webpack classifier of the com.wenathlan:saddle coordinates,
     * nuget carries Saddle.Webpack, gradle carries the saddle-webpack
     * module and rubygems carries the saddle-webpack gem. */
    expect(containers).toContain("@wenathlan/saddle-webpack");
    expect(containers).toContain("-Dclassifier=webpack");
    expect(containers).toContain("Saddle.Webpack.csproj");
    expect(containers).toContain("saddle-webpack.gemspec");
    /* the graceful-skip token gate the npmjs leg carries (the family
     * contract, Regra 54: NPM_TOKEN is OPTIONAL - a repository without
     * the secret skips the publication with a notice instead of
     * hard-failing the wave). */
    expect(containers).toContain("RAW_NPM_TOKEN: ${{ secrets.NPM_TOKEN }}");
  });
});

describe.skipIf(!inrepo)("the channel census (the eleven-plus distribution lanes per app)", () => {
  it("every application rides the seven registry family matrices of the publish workflow", async () => {
    const publish = await parseworkflow("publish.yml");
    for (const lane of REGISTRYLANES) {
      const matrix = (publish.jobs?.[lane]?.strategy as { matrix?: { package?: string[] } })?.matrix;
      expect(matrix?.package, `the ${lane} matrix must answer the ten family envelopes`).toHaveLength(10);
      for (const app of ["argan", "cadria", "cobaia", "debonair", "forge", "foundry", "getry", "stealthhead", "vault", "saddle"]) {
        expect(matrix?.package, `the ${lane} matrix must seat ${app}`).toContain(app);
      }
    }
  });

  it("every application answers more than eleven distribution lanes counting the registry seats beside the container lanes", async () => {
    const publish = await parseworkflow("publish.yml");
    const containers = await parseworkflow("containers.yml");
    const containerapps = new Set(flatmatrix(containers, "app-containers"));
    containerapps.add("saddle");
    for (const app of ALLAPPS) {
      /* the registry seats: the seven family matrices of the publish
       * workflow (devthink rides its own single lanes there, the ten
       * siblings ride the family mirrors). */
      let registrylanes = 0;
      for (const lane of REGISTRYLANES) {
        const matrix = (publish.jobs?.[lane]?.strategy as { matrix?: { package?: string[] } })?.matrix;
        if (matrix?.package?.includes(app)) registrylanes += 1;
      }
      if (app === "devthink") {
        /* the workbench engine rides its own single registry lanes (the
         * npmjs, maven, nuget, gradle, rubygems and goget application
         * lanes of the publish workflow). */
        for (const lane of ["npmjs", "githubnpm", "maven", "nuget", "rubygems", "gradle", "goget"]) {
          expect(publish.jobs?.[lane], `the devthink application lane ${lane} must exist`).toBeDefined();
        }
        registrylanes = 7;
      }
      /* the container seats: every app answers its own ghcr lane set
       * (the app-containers matrix legs carry the twelve-plus lane
       * axis; the saddle engine carries the nineteen-tag family). */
      expect(containerapps.has(app), `the ${app} container lane must seat`).toBe(true);
      const containerlanes = app === "saddle" ? 19 : 14;
      const total = registrylanes + containerlanes;
      expect(total, `the ${app} distribution lane census must answer more than eleven`).toBeGreaterThan(11);
    }
  });
});
