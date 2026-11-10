// # versiondrift.test — the drift gate of the about row: the settings page
//   reads the canonical version module, never a hand-synced literal (the
//   fifty five rung drift the 2.0.97 literal once carried while the manifest
//   answered 2.0.152), and the release sync of the rung ritual carries the
//   cadria version.ts entry so the module answers the family lockstep every
//   rung. runnable with vitest: pnpm vitest run test/versiondrift.test.ts
import { readFile } from "node:fs/promises";
import { access, constants } from "node:fs/promises";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const approot = process.cwd();
const reporoot = resolve(approot, "..");

describe("the version drift gate", () => {
  it("the about row answers the canonical version module the manifest carries", async () => {
    const manifest = JSON.parse(await readFile(join(approot, "package.json"), "utf8")) as { version: string };
    const versionmodule = await readFile(join(approot, "version.ts"), "utf8");
    expect(versionmodule).toContain(`export const packageversion = "${manifest.version}" as const;`);
    // the detailed engine wave moved the about row into the SettingsSurface
    // composite — the anchor stays thin, the surface owns the version read
    const surface = await readFile(join(approot, "sol", "wingets", "SettingsSurface.tsx"), "utf8");
    expect(surface).toContain('from "../../version.ts"');
    expect(surface).not.toMatch(/const VERSION = "2\./);
    const settings = await readFile(join(approot, "sol", "settings", "settings.tsx"), "utf8");
    expect(settings).not.toMatch(/const VERSION = "2\./);
  });

  it("the release sync stamps the cadria version module every rung", async () => {
    /* the drift gate answers only where the monorepo rides beside the app:
     * the container builder runs this suite from the application context
     * alone and skips the sibling read honestly. */
    const releaseritual = join(reporoot, "devthink", "release.ts");
    await expect(access(releaseritual, constants.F_OK)).resolves.toBeUndefined();
    const release = await readFile(releaseritual, "utf8");
    expect(release).toContain('"../cadria/version.ts"');
    expect(release).toContain(`export const packageversion = "\${version}" as const;`);
  });
});
