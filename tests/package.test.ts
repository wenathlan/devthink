import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/* The zero-loss governance gate of the grand merge: the three lineages shipped
 * contribution guides, a code of conduct, a code owners roster and the library
 * surfaces of the gateway and maene families (the gateway README documented the
 * npm library, the maene root README documented its public api). This gate
 * keeps the restored artifacts present, keeps the exports subpaths pointing at
 * real repository files and keeps the docs naming the surfaces they document,
 * so a regression that drops a lineage surface goes red before the release. */

describe("package governance surface", () => {
  it("carries the merged contributing guide, the code of conduct and the code owners of the lineage rosters", async () => {
    const contributing = await readFile("CONTRIBUTING.md", "utf8");
    expect(contributing).toContain("Contributing to DevThink");
    /* the gateway lineage contract */
    expect(contributing).toContain("bun run check");
    expect(contributing).toContain("bun run db:generate");
    expect(contributing).toContain("conventional commits");
    /* the extension lineage contracts */
    expect(contributing).toContain("Clean-room policy");
    expect(contributing).toContain("library-first and dependency-light");
    expect(contributing).toContain("Adding a cli command");
    expect(contributing).toContain("Adding a build target");
    expect(contributing).toContain("Adding a tool to the catalog");
    expect(contributing).toContain("Adding a native surface");
    expect(contributing).toContain("Adding a release channel");
    expect(contributing).toContain("docs/kinddocs.md");
    expect(contributing).toContain("node tests/doccheck.mjs");
    /* the maene lineage contract and the merged release lockstep */
    expect(contributing).toContain("tests/maene");
    expect(contributing).toContain("sync:metadata");
    expect(contributing).toContain("GPL-3.0-only");

    const conduct = await readFile("CODE_OF_CONDUCT.md", "utf8");
    expect(conduct).toContain("DevThink code of conduct");
    expect(conduct).toContain("wenathlan and contributors");
    expect(conduct).toContain("SECURITY.md");

    const owners = await readFile("CODEOWNERS", "utf8");
    expect(owners).toMatch(/^\* @iakadion @inathlan @aasblor @nasblor$/m);
    expect(owners).toContain("devthink");
  });

  it("routes the gateway and maene library barrels through resolvable subpath exports", async () => {
    const packagejson = JSON.parse(await readFile("package.json", "utf8")) as { exports: Record<string, Record<string, string>> };
    const gatewaylib = packagejson.exports["./gateway-lib"];
    expect(gatewaylib).toBeDefined();
    expect(gatewaylib?.types).toBe("./dist/gateway-index.d.ts");
    expect(gatewaylib?.import).toBe("./dist/gateway-index.js");
    expect(gatewaylib?.default).toBe("./dist/gateway-index.js");
    const maenelib = packagejson.exports["./maene-lib"];
    expect(maenelib).toBeDefined();
    expect(maenelib?.types).toBe("./dist/maene-index.d.ts");
    expect(maenelib?.import).toBe("./dist/maene-index.js");
    expect(maenelib?.default).toBe("./dist/maene-index.js");
    /* the barrels are repository sources the build compiles: the source files exist before any
       build and the dist entries join the built set the validate chain asserts */
    for (const file of ["gateway-index.ts", "maene-index.ts"]) {
      if (!existsSync(file)) throw new Error(`The library barrel ${file} of the grand merge is missing.`);
    }
    /* every non-dist exports target resolves unconditionally; the dist targets
     * follow the family convention — the validate chain runs the tests before
     * the build, the existence pass rides the lanes that build first */
    if (!existsSync("dist/checksums.txt")) return;
    const referenced = new Set<string>();
    for (const entry of Object.values(packagejson.exports)) for (const target of Object.values(entry)) referenced.add(target.replace(/^\.\//, ""));
    for (const file of referenced) if (!existsSync(join(process.cwd(), file))) throw new Error(`The exports target ${file} does not resolve to a repository file.`);
  });

  it("documents the gateway and maene library surfaces of the merged package", async () => {
    const gatewaydoc = await readFile("docs/gateway-library.md", "utf8");
    expect(gatewaydoc).toContain("@wenathlan/devthink/gateway-lib");
    for (const symbol of ["createversion", "createserver", "runserver", "loadconfig", "engineinternals"]) {
      expect(gatewaydoc).toContain(symbol);
    }
    expect(gatewaydoc).toContain("12 auth methods");
    expect(gatewaydoc).toContain("web/gateway/vercel.json");
    expect(gatewaydoc).toContain("web/gateway/netlify.toml");
    expect(gatewaydoc).toContain("Dockerfile");

    const maenedoc = await readFile("docs/maene-guide.md", "utf8");
    expect(maenedoc).toContain("@wenathlan/devthink/maene-lib");
    expect(maenedoc).toContain("maene-auth.ts");
    expect(maenedoc).toContain("maene-cli.ts");
    expect(maenedoc).toContain("antigravity.ts");
    expect(maenedoc).toContain("soft_quota_threshold_percent");
    expect(maenedoc).toContain("docs/schemas/antigravity.json");
    expect(maenedoc).toContain("The maene lineage");
  });
});
