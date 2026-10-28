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
 * clears the three hundred plus law, so the regression that once lost the
 * four hundred asset era of the 133/134 rungs can never land silently
 * again: the census answers at the pull request gate, before a release
 * ever ships.
 */
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parseDocument } from "yaml";

const repoRoot = resolve(process.cwd(), "..");
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

/** the member family the release walks beside the os: the eight npm
 * envelopes of the publish mirror (getry rides the release ladder's own
 * loop — the gateway is born next and publishes through the family pack of
 * the release lane) with saddle always last, the heaviest pass of the
 * house. */
const MIRRORFAMILY = ["argan", "cadria", "debonair", "forge", "foundry", "stealthhead", "vault", "saddle"];
/** the release ladder's own family loop: the nine envelopes the family job
 * packs, saddle last, getry included. */
const RELEASEFAMILY = ["argan", "cadria", "debonair", "forge", "foundry", "stealthhead", "vault", "getry", "saddle"];
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

describe("the npmjs registry freshness lane", () => {
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
    /* the deleted saddle-v* tag resolver never runs again: the vhe lane
     * reads the saddle manifest of the checked out source. */
    expect(publish).toContain("saddle-v* tag resolver never runs again");
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
    expect(saddle.publishConfig?.access).toBe("public");
  });
});

describe("the container distributions lane", () => {
  it("the three vhe profiles answer the owner doctrine — max, light and palatial ride max, balanced and lite", async () => {
    const publish = await parseworkflow("publish.yml");
    const profiles = matrixof(publish, "saddle-vhe-publish");
    expect(profiles.map((leg) => leg.profile)).toEqual(["max", "balanced", "lite"]);
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
    /* every profile ships the four-architecture family standard. */
    for (const leg of profiles) expect(leg.platforms).toBe("linux/amd64,linux/arm64,linux/ppc64le,linux/s390x");
  });

  it("the dockerfile defaults bake the max profile and never hardcode a digest", async () => {
    const dockerfile = await readFile(join(repoRoot, "saddle", "Dockerfile"), "utf8");
    expect(dockerfile).toContain('ARG VHE_PROFILE_CPU="epyc9965"');
    expect(dockerfile).toContain('ARG VHE_PROFILE_VCPUS="192"');
    expect(dockerfile).toContain('ARG VHE_PROFILE_THREADS="384"');
    expect(dockerfile).toContain('ARG VHE_PROFILE_RAM_GB="1024"');
    expect(dockerfile).toContain('ARG VHE_PROFILE_GPU="b200"');
    expect(dockerfile).toContain('ARG VHE_PROFILE_GPUS="8"');
    /* the gateway family policy: no hardcoded sha-256 anywhere in the
     * container sources — the mesa digest arrives as the github-computed
     * MESA_SHA256 build-arg (an empty default, verified at build time). */
    expect(dockerfile).toContain('ARG MESA_SHA256=""');
    expect(dockerfile).not.toMatch(/[a-f0-9]{64}/);
  });

  it("the -vhe tag family never collides with the node engine and never rolls", async () => {
    const publish = await readworkflow("publish.yml");
    expect(publish).toContain('suffix="-vhe"');
    expect(publish).toContain('if [ "${PROFILE}" != "max" ]; then suffix="-vhe-${PROFILE}"; fi');
    expect(publish).toContain("No latest, no");
    expect(publish).toContain("no rolling alias.");
    /* the verify legs inspect the same tag family: max -> -vhe, balanced ->
     * -vhe-balanced, lite -> -vhe-lite; inspecting the bare :<version> tag
     * would verify the node-engine image of the ghcr lane instead. */
    const workflow = await parseworkflow("publish.yml");
    const verify = matrixof(workflow, "saddle-vhe-verify");
    expect(verify.map((leg) => [leg.profile, leg.suffix])).toEqual([
      ["max", "-vhe"],
      ["balanced", "-vhe-balanced"],
      ["lite", "-vhe-lite"],
    ]);
  });

  it("the published vhe index answers the four architectures and the spoofing probe", async () => {
    const publish = await readworkflow("publish.yml");
    expect(publish).toContain('| . == ["amd64", "arm64", "ppc64le", "s390x"]');
    expect(publish).toContain('grep -q "${EXPECTCPU}" <<< "${cpuinfo}"');
    expect(publish).toContain('test "${actual_version}" = "${VERSION}"');
  });

  it("the node engine ghcr lane carries the five-architecture family index", async () => {
    const publish = await readworkflow("publish.yml");
    expect(publish).toContain("platforms: linux/amd64,linux/arm64,linux/ppc64le,linux/s390x,linux/riscv64");
    expect(publish).toContain('. == ["amd64", "arm64", "ppc64le", "riscv64", "s390x"]');
  });

  it("the pre-deploy existence check matches the -vhe suffix — the saddle lesson", async () => {
    const publish = await readworkflow("publish.yml");
    /* the bare startswith(${version}) once saw the node-engine tag and
     * no-opped the vhe publication; the match carries the -vhe suffix. */
    expect(publish).toContain('startswith(\\"${version}-vhe\\")');
  });

  it("the vhe lanes keep the dispatch-only contract with the reason stated", async () => {
    const workflow = await parseworkflow("publish.yml");
    for (const job of ["saddle-vhe-validate", "saddle-vhe-resolve"]) {
      expect(workflow.jobs?.[job]?.if).toBe("github.event_name == 'workflow_dispatch'");
    }
    const publish = await readworkflow("publish.yml");
    expect(publish).toContain("awaits its per-application adaptation pass");
    /* the security gate the publish rides behind: the trivy scan over the
     * same runtime target the publish legs build. */
    expect(publish).toContain("Saddle vhe security gate");
    expect(publish).toContain("scanners: vuln,secret,misconfig");
  });

  it("the family ghcr loop walks past the legacy saddle package honestly", async () => {
    /* the standalone era published the 2.1.x line to the legacy saddle
     * container package, which keeps its own access list: the merged
     * repository token answers permission_denied on every push and the
     * denial reddened the loop before stealthhead and vault ever built (the
     * 2.0.151 rung). the saddle container distributions answer the vhe
     * lane under the devthink package; the family loop skips the legacy
     * package the same honest way the sibling-pin envelopes skip. */
    const release = await readworkflow("release.yml");
    expect(release).toContain('if [ "${app}" = "saddle" ]; then');
    expect(release).toContain(
      "the legacy container package keeps the standalone era access list; the saddle containers answer the vhe lane of the publish workflow.",
    );
    expect(release).toContain("the manifest pins a sibling tree; the container waits for the family-context lane.");
    /* the loop still walks every application folder: the skip is the
     * saddle leg alone, the siblings keep their builds. */
    expect(release).toContain(
      "for app in argan cadria cobaia debonair devthink forge foundry getry saddle stealthhead vault; do",
    );
  });
});

describe("the release assets census (the 300 plus law)", () => {
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

  it("the next conversion walks the ten applications with the ten-asset grammar", async () => {
    const convert = await readFile(join(repoRoot, "devthink", "tests", "scripts", "nextconvert.ts"), "utf8");
    /* the CONVERT list: every site application of the monorepo, the os
     * included. */
    const list = /const CONVERT = \[([^\]]+)\]/.exec(convert)?.[1] ?? "";
    const apps = [...list.matchAll(/"([a-z]+)"/g)].map((match) => match[1]);
    expect(apps).toEqual([
      "devthink",
      "vault",
      "forge",
      "foundry",
      "argan",
      "cadria",
      "debonair",
      "saddle",
      "stealthhead",
      "getry",
    ]);
    /* the complete site archive plus the four next shapes (normal, zai,
     * fifty, personalized), every archive carrying the brotli overlay: ten
     * assets per application. */
    expect(convert).toContain("packxz(raw, DENTRO(path.join(out, `${app}.${versionof(app)}.tar.xz`)))");
    expect(convert).toContain("packxz(normal, DENTRO(path.join(out, `${app}.next.normal.${versionof(app)}.tar.xz`)))");
    expect(convert).toContain("packxz(zai, DENTRO(path.join(out, `${app}.next.zai.${versionof(app)}.tar.xz`)))");
    expect(convert).toContain("packxz(fifty, DENTRO(path.join(out, `${app}.next.fifty.${versionof(app)}.tar.xz`)))");
    expect(convert).toContain(
      "packxz(personal, DENTRO(path.join(out, `${app}.next.personalized.${versionof(app)}.tar.xz`)))",
    );
    expect(convert).toContain('if (file.endsWith(".tar.xz")) overlay(DENTRO(path.join(out, file)))');
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

  it("the structural census clears the 300 plus law", async () => {
    /* the census counts the deterministic assets every release-triggered
     * lane attaches: the family desktop legs (the file bundles, the
     * manifest and the sha256 record of each platform), the family android
     * legs (apk, aab, sha256, manifest), the next conversion (the site
     * archive and the four next shapes, each with the brotli overlay) and
     * the nine family envelopes the release ladder packs. the os rides its
     * own publish lanes (the desktop bundles, the mobile artifacts, the
     * container digest records, the extension packages, the iso and the
     * wasm cores) beside this floor — the 2.0.151 release carried 455
     * assets against this structural promise. the regression that lost the
     * four hundred asset era of the 133/134 rungs answers here: a lane or a
     * matrix leg deleted reddens the census before a release ever ships. */
    const desktop = await parseworkflow("family-desktop.yml");
    const matrix = (
      desktop.jobs?.desktop as { strategy?: { matrix?: { include?: Array<{ bundles?: string }> } } } | undefined
    )?.strategy?.matrix;
    const bundles = (matrix?.include ?? []).reduce((total, entry) => total + filebundles(String(entry.bundles)), 0);
    const platforms = 7; /* the platform axis of the desktop lane */
    const desktopperapp = bundles + platforms * 2; /* bundle files + manifest + sha256 per platform */
    const desktopfamily = 9 * desktopperapp;
    const androidfamily = 9 * 4; /* apk, aab, sha256, manifest */
    const nextfamily = 10 * 10; /* site archive + four next shapes, brotli overlays included */
    const envelopes = 9; /* the family tgz the release ladder packs */
    const census = desktopfamily + androidfamily + nextfamily + envelopes;
    expect(bundles).toBe(12); /* 3+3 linux, 1+2+1 windows, 1+1 macos file bundles */
    expect(desktopperapp).toBe(26);
    expect(census).toBeGreaterThanOrEqual(300);
    expect(census).toBe(9 * 26 + 36 + 100 + 9);
  });
});
