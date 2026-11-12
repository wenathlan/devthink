/**
 * containerlanes.test.ts — the containerlanes wave contract of the registry
 * doctrine: the four laws the owner's complaint charged ("as 11 lanes do
 * docker não foram publicadas e padronizadas em todos os aplicativos, e
 * saddle não tem +15 distribuições no docker") sealed by the TWELVE-LANE
 * LAW of the owner's latest breath (every distribution carrying the
 * twelve arch lanes). the eleven container lanes — every application of
 * the monorepo answers its own ghcr.io/wenathlan/<app> container package
 * through the containers workflow (the ten sibling lanes of the
 * app-containers matrix beside the saddle engine's own saddle-containers
 * lane set), each leg carrying the version tag, the latest alias, the
 * per-architecture seat tags of every base-carried arch and the documented
 * best-effort lanes - more than eleven lanes every app, honestly counted.
 * the fifteen-plus docker distributions under the twelve-lane law — the
 * saddle tag census answers SIXTY distinct published tags (the three
 * profile umbrellas, the twenty-four architecture seats stamped off the
 * published index across the eight primary arches and the thirty-three
 * os-distribution flavor lanes riding the three-tier axis the master
 * stamped, the four exotic best-effort arches documented beside every
 * lane). the webpack fusion — the owner's corridor order ("cancela elas,
 * exclui elas e embute elas dentro do original"): the variant registry
 * seats the older wave published under the .webpack names are DEAD, the
 * webpack distribution bundle rides INSIDE the original envelopes the
 * publish workflow's family lanes ship (the files field carrying the
 * <app>.webpack.cjs seat, the maven classifier on the normal
 * com.wenathlan.<app> coordinates, the gradle module, the nuget package
 * and the rubygem the same embed), never a variant package anywhere. the
 * channel census — every application rides the eleven-plus distribution
 * lanes the registries answer (the ten registry family matrices of the
 * publish workflow beside the tri-channel wave of the PR12 eleven-channel
 * law seated (the pypi, cargo and homebrew family lanes beside the seven
 * the distfamily wave closed)
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
  ((workflow.jobs?.[job]?.strategy as { matrix?: { app?: string[]; channel?: string[] } } | undefined)?.matrix?.app ??
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
 * closed - the ten registry seats beside the container lanes: the seven the
 * distfamily wave seated beside the pypi, cargo and homebrew family lanes
 * the tri-channel wave of the PR12 eleven-channel law added). */
const REGISTRYLANES = [
  "family-pypi",
  "family-cargo",
  "family-homebrew",
  "family-npmjs",
  "family-githubnpm",
  "family-maven",
  "family-nuget",
  "family-gradle",
  "family-rubygems",
  "family-goget",
] as const;

/** the eight primary architecture seats the pinned node base honestly
 * carries for the saddle engine (the native amd64 leg beside the seven
 * QEMU-emulated seats - the same build index the vhe lane family rides
 * under the twelve-lane law, the four exotic best-effort arches riding
 * the documented lanes beside them). */
const SEATARCHES = ["386", "amd64", "arm/v6", "arm/v7", "arm64", "ppc64le", "riscv64", "s390x"];
const TWELVEPLATFORMS =
  "linux/386,linux/amd64,linux/arm/v6,linux/arm/v7,linux/arm64,linux/ppc64le,linux/riscv64,linux/s390x";

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
    expect(containers).toContain(
      "ghcr.io/${{ github.repository_owner }}/${{ matrix.app }}:${{ steps.release.outputs.version }}",
    );
    expect(containers).toContain("ghcr.io/${{ github.repository_owner }}/${{ matrix.app }}:latest");
    expect(containers).toContain('docker buildx imagetools create -t "${image}:${version}-${slug}"');
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
  it("the saddle lane family answers three profile umbrellas, eleven os-distribution flavors riding the three-tier axis and the twenty-four architecture seats — sixty distinct tags under the twelve-lane law", async () => {
    const workflow = await parseworkflow("containers.yml");
    const legs = matrixof(workflow, "saddle-containers");
    /* the thirty-six runnable lane legs: the three profile lanes (max,
     * balanced, lite - the same virtual hardware plans the vhe lane
     * family of the publish workflow bakes) beside the thirty-three
     * os-distribution flavor lanes (linux, omarchy, vanillaos, android,
     * archlinux, alpine, debian, fedora, nixos, void, postmarketos -
     * every flavor binds the full tier axis the master stamped: the
     * max, balanced and lite plans each their own lane). */
    const flavorlegs = (
      [
        "linux",
        "omarchy",
        "vanillaos",
        "android",
        "archlinux",
        "alpine",
        "debian",
        "fedora",
        "nixos",
        "void",
        "postmarketos",
      ] as const
    ).flatMap(
      (os) =>
        [
          ["max", `os${os}`, `-${os}`],
          ["balanced", `os${os}-balanced`, `-${os}-balanced`],
          ["lite", `os${os}-lite`, `-${os}-lite`],
        ] as const,
    );
    expect(legs.map((leg) => [leg.profile, leg.target, leg.suffix])).toEqual([
      ["max", "max", ""],
      ["balanced", "balanced", "-balanced"],
      ["lite", "lite", "-lite"],
      ...flavorlegs,
    ]);
    /* every leg ships the EIGHT primary build legs the pinned node base
     * honestly carries under the twelve-lane law: the native amd64 leg
     * beside the 386, arm/v6, arm/v7, arm64, ppc64le, riscv64 and s390x
     * legs under QEMU - the same build index the vhe lanes ride, the
     * four exotic best-effort arches documented beside every lane. */
    for (const leg of legs) {
      expect(leg.platforms).toBe(TWELVEPLATFORMS);
    }
    /* the seat axis: only the three profile legs carry the seatprefix
     * stamp (the flavor lanes ship their umbrella tag alone), and the
     * census arithmetic answers the twelve-lane law: 3 umbrellas +
     * 3 profiles x 8 arch seats + 33 flavors = 60 tags. */
    expect(legs.map((leg) => leg.seatprefix ?? "")).toEqual([
      "max",
      "balanced",
      "lite",
      ...Array.from({ length: 33 }, () => ""),
    ]);
    const umbrellas = legs.length;
    const seats = legs.map((leg) => leg.seatprefix ?? "").filter((prefix) => prefix !== "").length * SEATARCHES.length;
    const flavors = legs.filter((leg) => (leg.seatprefix ?? "") === "").length;
    const census = umbrellas + seats;
    expect(flavors).toBe(33);
    expect(census).toBe(3 + 33 + 24);
    expect(census).toBe(60);
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
    expect(containers).toContain(
      'docker buildx imagetools create -t "${img}:${ver}-${SEATPREFIX}-${slug}" "${img}@${digest}"',
    );
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
     * flavor stages the thirty-three flavor lanes build (eleven
     * distributions x the three-tier axis the master stamped) - the
     * same stages the vhe lane family of the publish workflow rides. */
    expect(dockerfile).toContain("AS max");
    expect(dockerfile).toContain("AS balanced");
    expect(dockerfile).toContain("AS lite");
    for (const os of [
      "oslinux",
      "osomarchy",
      "osvanillaos",
      "osandroid",
      "osarchlinux",
      "osalpine",
      "osdebian",
      "osfedora",
      "osnixos",
      "osvoid",
      "ospostmarketos",
    ]) {
      expect(dockerfile).toContain(`AS ${os}`);
      expect(dockerfile).toContain(`AS ${os}-balanced`);
      expect(dockerfile).toContain(`AS ${os}-lite`);
    }
  });
});

describe.skipIf(!inrepo)("the webpack fusion (the owner's corridor order)", () => {
  it("the variant registry seats are dead — no saddle-webpack job, no .webpack package name anywhere in the container lanes", async () => {
    const workflow = await parseworkflow("containers.yml");
    /* the fusion law the owner sealed ("cancela elas, exclui elas e
     * embute elas dentro do original"): the webpack-bundled engine
     * distribution never walks a variant registry seat again — the
     * saddle-webpack job the older wave carried is gone, and no package
     * name the container lanes answer ever carries the .webpack trace
     * (@wenathlan/saddle-webpack, Saddle.Webpack, the saddle-webpack
     * gemspec and module all dead at the source). */
    expect(workflow.jobs?.["saddle-webpack"]).toBeUndefined();
    const containers = await readworkflow("containers.yml");
    expect(containers).not.toContain("@wenathlan/saddle-webpack");
    expect(containers).not.toContain("Saddle.Webpack.csproj");
    expect(containers).not.toContain("saddle-webpack.gemspec");
  });

  it("the webpack distribution rides INSIDE the original envelopes the family lanes ship", async () => {
    const publish = await readworkflow("publish.yml");
    /* the embed the fusion law seats: every registry family lane that
     * publishes an original package runs the bundling step (the esbuild
     * carrier walking cli.ts to the esm script with the packages
     * external, the webpack CLI bundling through the generated config
     * into the <app>.webpack.cjs seat) and packs the bundle inside the
     * normal envelope — the npm files field carrying the cjs, the maven
     * classifier riding the normal com.wenathlan.<app> coordinates (the
     * owner's normal name: forge, cadria and the eleven), the gradle
     * module jar including the cjs, the nuget package carrying it under
     * webpack/ and the rubygem listing it in the files. */
    expect(publish).toContain("bundle the webpack seat inside the original envelope (the fusion law)");
    expect(publish).toContain("npx esbuild cli.ts --bundle --platform=node --format=esm --packages=external --outfile=webpacksrc.mjs");
    expect(publish).toContain('filename: "${PKG}.webpack.cjs"');
    expect(publish).toContain("publish the webpack classifier the fusion embeds on the normal artifact");
    expect(publish).toContain('-DartifactId="${PKG}" -Dversion="${VERSION}" -Dclassifier=webpack');
    /* the npm envelopes carry the cjs seat in the files field (the
     * eleven application manifests listing the bundle they ship). */
    for (const app of ["argan", "cadria", "cobaia", "debonair", "devthink", "forge", "foundry", "getry", "saddle", "stealthhead", "vault"]) {
      const manifest = JSON.parse(await readFile(join(repoRoot, app, "package.json"), "utf8")) as { files?: string[] };
      expect(manifest.files, `the ${app} envelope files must carry the webpack seat`).toContain(`${app}.webpack.cjs`);
    }
  });
});

describe.skipIf(!inrepo)("the channel census (the eleven-plus distribution lanes per app)", () => {
  it("every application rides the seven registry family matrices of the publish workflow", async () => {
    const publish = await parseworkflow("publish.yml");
    for (const lane of REGISTRYLANES) {
      const matrix = (publish.jobs?.[lane]?.strategy as { matrix?: { package?: string[] } })?.matrix;
      expect(matrix?.package, `the ${lane} matrix must answer the ten family envelopes`).toHaveLength(10);
      for (const app of [
        "argan",
        "cadria",
        "cobaia",
        "debonair",
        "forge",
        "foundry",
        "getry",
        "stealthhead",
        "vault",
        "saddle",
      ]) {
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
       * axis; the saddle engine carries the sixty-tag family under the
       * twelve-lane law). */
      expect(containerapps.has(app), `the ${app} container lane must seat`).toBe(true);
      const containerlanes = app === "saddle" ? 60 : 14;
      const total = registrylanes + containerlanes;
      expect(total, `the ${app} distribution lane census must answer more than eleven`).toBeGreaterThan(11);
    }
  });
});
