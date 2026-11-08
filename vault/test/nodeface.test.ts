/**
 * nodeface.test.ts — the node face law battery: the vault envelope's
 * runtime faces (the two seats the family's node lanes import — the
 * saddle webserver's db.ts reads ./onboardingstore, its labels.ts reads
 * ./labelstore) answer plain node's refusal to type-strip .ts under
 * node_modules with self-contained build bundles, because the published
 * envelope ships its faces as sources (the source-is-library doctrine)
 * and the node condition is the one surface every external node consumer
 * resolves before the registry envelope's .ts import face.
 */
import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const approot = join(dirname(fileURLToPath(import.meta.url)), "..");
const inrepo = existsSync(join(approot, "build.ts"));

describe.skipIf(!inrepo)("the node face law (the vault envelope's runtime faces)", () => {
  it("the two runtime faces carry the node condition beside the source import face", () => {
    const manifest = JSON.parse(readFileSync(join(approot, "package.json"), "utf8")) as {
      exports: Record<string, Record<string, string>>;
      files: string[];
    };
    for (const face of ["onboardingstore", "labelstore"] as const) {
      const seat = manifest.exports[`./${face}`];
      expect(seat, `the ./${face} export must exist`).toBeDefined();
      expect(seat.types, `./${face} types stay the source`).toBe(`./${face}.ts`);
      expect(seat.node, `./${face} answers node with the build bundle`).toBe(`./build/${face}.js`);
      expect(seat.import, `./${face} keeps the source import face`).toBe(`./${face}.ts`);
      expect(seat.default, `./${face} keeps the source default face`).toBe(`./${face}.ts`);
      for (const artifact of [`${face}.js`, `${face}.js.map`]) {
        expect(
          manifest.files.some((entry) => entry === `build/${artifact}`),
          `the files list must carry build/${artifact}`,
        ).toBe(true);
      }
    }
  });

  it("the builder emits the faces the exports promise", () => {
    /* the same script the publish lane and the release family pack run:
     * the build is fast (two zero-import modules), so the battery proves
     * the emitted bundle exists rather than trusting the files list. */
    execFileSync(process.execPath, ["--experimental-strip-types", join(approot, "build.ts")], {
      cwd: approot,
      stdio: "ignore",
    });
    for (const face of ["onboardingstore", "labelstore"] as const) {
      const bundle = readFileSync(join(approot, "build", `${face}.js`), "utf8");
      expect(bundle.length, `build/${face}.js must be a real bundle`).toBeGreaterThan(200);
      expect(bundle, `the bundle stays esm`).toContain("export");
    }
  });
});
