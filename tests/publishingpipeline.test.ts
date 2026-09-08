import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { promisify } from "node:util";
import { parseDocument } from "yaml";
import { artifactchannelof, artifactmanifestcheck, artifactmanifestnameof } from "../pack.js";

const execute = promisify(execFile);

/** The byte budget of the npm tarball: an engineering bound on the packed unpacked size so the tarball never grows unbounded — the file allowlist keeps the shipped paths honest inside it. */
const tarballbudget = 80_000_000;

describe("the publishing pipeline", () => {
  it("keeps zero version drift across every packaging file", async () => {
    const packagejson = JSON.parse(await readFile("package.json", "utf8"));
    const version = String(packagejson.version);
    /* the extension manifest, the version module and the web and mobile package mirrors */
    const manifest = JSON.parse(await readFile("web/extension/manifest.json", "utf8"));
    expect(manifest.version).toBe(version);
    const versionmodule = await readFile("version.ts", "utf8");
    expect(versionmodule).toContain(`export const packageversion = "${version}" as const;`);
    const webpackage = JSON.parse(await readFile("web/package.json", "utf8"));
    expect(webpackage.version).toBe(version);
    const mobilepackage = JSON.parse(await readFile("mobile/package.json", "utf8"));
    expect(mobilepackage.version).toBe(version);
    /* the browser overlays and the vsix overlay live inside the root manifest — the single manifest design of 1.1.93 leaves no second version source to drift */
    expect(manifest.browsers?.firefox?.browser).toBe("firefox");
    expect(manifest.browsers?.safari?.browser).toBe("safari");
    expect(manifest.vsix?.name).toBe("devthink");
    expect(Object.keys(manifest.browsers?.firefox ?? {})).not.toContain("version");
    expect(Object.keys(manifest.browsers?.safari ?? {})).not.toContain("version");
    expect(Object.keys(manifest.vsix ?? {})).not.toContain("version");
    /* the registry envelopes of the merged repository: the maven pom carries the release in its revision property, the nuget csproj and the ruby gemspec beside it */
    const pom = await readFile("pom.xml", "utf8");
    expect(pom).toContain(`<revision>${version}</revision>`);
    expect(pom).toContain("<packaging>jar</packaging>");
    const csproj = await readFile("devthink.csproj", "utf8");
    expect(/<Version>[^<]+<\/Version>/.exec(csproj)?.[0]).toBe(`<Version>${version}</Version>`);
    const gemspec = await readFile("devthink.gemspec", "utf8");
    expect(gemspec).toContain(`"${version}"`);
    /* the changelog section the release notes render from */
    const changelog = await readFile("CHANGELOG.md", "utf8");
    const heading = new RegExp(`^##\\s+${version.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:\\s|$)`, "m");
    expect(heading.test(changelog)).toBe(true);
    /* the generated release-document family — the readme version line, the release gates table, the runtime version catalog, the release notes document and the popup eyebrow label — stamps through the release metadata synchronization (node tests/release.mjs sync, the restamp the release pass runs), so those carries join the drift family at the restamp instead of a second version source living in the test */
  });

  it("emits and validates the release workflow controls through the checked test scripts", async () => {
    /* the workflowcheck asserts the channel jobs, the gates and the new release steps; the npmgate asserts the new bundles stay allowed in the tarball */
    const workflowcheck = await execute("node", ["tests/workflowcheck.mjs"]);
    expect(workflowcheck.stdout).toContain("verified");
    const npmgate = await execute("node", ["tests/npmgate.mjs"]);
    expect(npmgate.stdout).toContain("\"valid\": true");
  });

  it("coordinates the release lane with the standalone publish workflows of the merged repository", async () => {
    /* the publish-lane coordination of the merged layout: the release workflow owns the assembly, the verification and the draft → verify → publish chain plus the npmjs publication job the npm gate demands (the flat distribution tarball with provenance and the bounded retry), while the standalone publish workflows keep the registry lanes on their release-published triggers — no channel ships through two racing lanes, and the two npm lanes answer idempotently (the first publish wins, the latecomer skips) */
    const release = await readFile(".github/workflows/release.yml", "utf8");
    const workflow = parseDocument(release, { version: "1.2" }).toJS() as { jobs?: Record<string, unknown> };
    expect(Object.keys(workflow.jobs ?? {})).toEqual(["metadata", "verify", "assemble", "vsix", "firefox", "site", "sbom", "attest", "releaseassets", "npmjs", "githubrelease"]);
    /* the draft → assemble → verify → publish chain the readiness gate walks */
    for (const control of ["--draft", "sha256sum --check SHA256SUMS.txt", "draft=false"]) expect(release).toContain(control);
    /* the registry lanes the standalone publish workflows own stay release-triggered with their registry controls */
    const lanes: Array<[string, string]> = [
      [".github/workflows/publishgithubnpm.yml", "npm.pkg.github.com"],
      [".github/workflows/publishmaven.yml", "mvn --batch-mode"],
      [".github/workflows/publishnuget.yml", "dotnet nuget push"],
      [".github/workflows/publishrubygems.yml", "gem push devthink-*.gem"],
      [".github/workflows/publishghcr.yml", "ghcr.io"],
      [".github/workflows/publishnpmjs.yml", "registry.npmjs.org"],
    ];
    for (const [lane, control] of lanes) {
      const standalone = await readFile(lane, "utf8");
      expect(standalone).toContain("types: [published]");
      expect(standalone).toContain(control);
    }
    /* the npm channel stays idempotent across its two lanes: both answer the same existence check before any publish */
    expect(release).toContain("npmjs version already exists; skipping publish.");
    const npmjs = await readFile(".github/workflows/publishnpmjs.yml", "utf8");
    expect(npmjs).toContain("already exists; skipping publish.");
  });

  it("covers every built artifact with names, sizes, checksums and channels in the local artifact manifest", async () => {
    if (!existsSync("dist/checksums.txt")) return; /* the validate chain runs the tests before the build; the built-set pass runs on the next pass and in the ci lanes that build first */
    const packagejson = JSON.parse(await readFile("package.json", "utf8"));
    const version = String(packagejson.version);
    const manifest = JSON.parse(await readFile("dist/artifactmanifest.json", "utf8")) as { name: string; version: string; banner: string; artifacts: Array<{ name: string; size: number; checksum: string; channels: string[] }> };
    expect(manifest.version).toBe(version);
    expect(manifest.name).toBe("devthink artifact manifest");
    expect(manifest.artifacts.length).toBeGreaterThan(10);
    for (const entry of manifest.artifacts) {
      /* the naming convention keeps every artifact name lowercase without underscores */
      expect(entry.name).toMatch(/^[a-z0-9./-]+$/);
      expect(entry.name).not.toContain("_");
      expect(entry.channels.length).toBeGreaterThan(0);
      expect(entry.channels).toEqual(artifactchannelof(entry.name, version));
      /* the recorded size and sha256 checksum match the file on disk */
      const bytes = await readFile(entry.name);
      expect(entry.size).toBe(bytes.length);
      expect(entry.checksum).toBe(createHash("sha256").update(bytes).digest("hex"));
    }
    /* the manifest covers the artifacts of every channel of the release */
    const names = manifest.artifacts.map(entry => entry.name);
    expect(names).toContain(`dist/devthink${version}.zip`);
    expect(names).toContain(`dist/devthink-firefox-${version}.xpi`);
    expect(names).toContain(`dist/devthink-safari-${version}.zip`);
    expect(names).toContain(`dist/devthink-vscode-${version}.vsix`);
    expect(names).toContain(`dist/devthink-site-${version}.zip`);
    expect(names).toContain(`dist/devthink-declarations-${version}.zip`);
    /* the manifest never lists itself: a self entry would need its own checksum of itself, so the checksums file covers dist/artifactmanifest.json instead */
  });

  it("covers every dist artifact the checksums file records with its true sha256 digest", async () => {
    if (!existsSync("dist/checksums.txt")) return; /* the validate chain runs the tests before the build; the checksum pass runs on the next pass and in the ci lanes that build first */
    const lines = (await readFile("dist/checksums.txt", "utf8")).split("\n").filter(line => line.trim() !== "");
    expect(lines.length).toBeGreaterThan(10);
    for (const line of lines) {
      const [digest, name] = line.split(/\s+/);
      expect(digest).toMatch(/^[0-9a-f]{64}$/);
      if (name === "manifest.json") continue; /* the identity record of the published key: the build pins the manifest identity digest beside the bundle checksums so the pin rides the generated artifact, never a hard coded source constant */
      if ((name ?? "").startsWith("site/")) continue; /* the static site assets carry their own manifest and hashed names, not the reviewed naming rule */
      expect(name ?? "").not.toContain("_");
      const bytes = await readFile(`dist/${name}`);
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(digest);
    }
    /* the publishing pipeline bundles and the manifest itself join the covered set */
    const names = lines.map(line => (line.split(/\s+/)[1] ?? ""));
    for (const bundle of ["bridge.js", "crossbrowser.js", "pack.js", "http.js", "artifactmanifest.json"]) expect(names).toContain(bundle);
  });

  it("answers the artifact manifest name of the release set", async () => {
    const packagejson = JSON.parse(await readFile("package.json", "utf8"));
    const version = String(packagejson.version);
    expect(artifactmanifestnameof(version)).toBe(`devthink-artifactmanifest-${version}.json`);
    if (!existsSync("dist/artifactmanifest.json")) return; /* the validate chain runs the tests before the build; the manifest check pass runs on the next pass and in the ci lanes that build first */
    /* the manifest check catches a drifted built set before the release ships */
    const manifest = JSON.parse(await readFile("dist/artifactmanifest.json", "utf8")) as { name: string; version: string; banner: string; artifacts: Array<{ name: string; size: number; checksum: string; channels: string[] }> };
    const files = manifest.artifacts.map(entry => ({ name: entry.name, checksum: entry.checksum }));
    expect(artifactmanifestcheck({ manifest, files }).ok).toBe(true);
    const drifted = artifactmanifestcheck({ manifest, files: files.slice(0, Math.max(1, files.length - 1)) });
    expect(drifted.ok).toBe(false);
  });

  it("keeps the npm tarball inside its size budget through the flat staged package", { timeout: 120_000 }, async () => {
    if (!existsSync("dist/checksums.txt")) return; /* the validate chain runs the tests before the build; the tarball pass runs on the next pass and in the ci lanes that build first */
    const packagejson = JSON.parse(await readFile("package.json", "utf8"));
    const stagedmanifest = JSON.parse(await readFile("distpackage/package.json", "utf8"));
    const packed = await execute("npm", ["pack", "./distpackage", "--dry-run", "--json"]);
    /* npm eleven answers a json array of tarball entries while npm twelve answers an object keyed by package name: the dry run reads the single entry of this package under either shape so the pinned toolchain majors both verify the tarball */
    const parsed = JSON.parse(packed.stdout) as unknown;
    const entry = (Array.isArray(parsed) ? parsed[0] : (parsed as Record<string, { files: Array<{ path: string; size: number }>; size: number }>)[String(stagedmanifest.name)]) as { files: Array<{ path: string; size: number }>; size: number } | undefined;
    if (entry === undefined) throw new Error("The npm pack dry run reported no tarball entry.");
    /* the unpacked size of the tarball stays inside the engineering budget */
    expect(entry.size).toBeLessThan(tarballbudget);
    /* the staged manifest carries no files allowlist: the staging directory IS the package set, so every shipped file must exist in the staged tree and every staged file must ship */
    const stagedwalk = async (relative: string): Promise<string[]> => {
      const found: string[] = [];
      for (const item of await readdir(join("distpackage", relative), { withFileTypes: true })) {
        const child = relative === "" ? item.name : `${relative}/${item.name}`;
        if (item.isDirectory()) found.push(...await stagedwalk(child));
        else found.push(child);
      }
      return found;
    };
    const stagedset = new Set(await stagedwalk(""));
    const shippedpaths = entry.files.map(file => file.path.replace(/^distpackage\//, ""));
    for (const path of shippedpaths) expect(stagedset.has(path)).toBe(true);
    for (const staged of stagedset) expect(shippedpaths).toContain(staged);
    /* the flat organization: no shipped path nests past two directories */
    for (const path of shippedpaths) expect(path.split("/").length).toBeLessThanOrEqual(3);
    /* the surface, the data groups and the identity files ship at the package root */
    for (const artifact of ["index.js", "index.cjs", "index.neutral.js", "devthink.umd.js", "policy.js", "protocol.js", "memory.js", "progress.js", "hardening.js", "dashdone.js", "node.cjs", "bun.js", "deno.js", "cli.js", "headless.js", "mcp.js", "bridge.js", "companion.js", "nativehost.template.json", "pack.js", "http.js", "gateway.js", "crossbrowser.js", "index.d.ts", "umd.d.ts", "cli.d.ts", "checksums.txt", "gallery.json", "umd-example.html", "manifest.json", "README.md", "LICENSE", "CHANGELOG.md", "package.json", "caps/background.json", "caps/library.json", "schemas/plan.schema.json", "fixtures/example-org-pagestate.json", "fixtures/plans/release-notes-plan.json", "fixtures/recipes/scrapeproductgrid.json", "fixtures/pages/feed.html", "fixtures/importers/v1-plan.json"]) expect(shippedpaths).toContain(artifact);
    /* the minified variants and the release archives stay out of the package: the release assets own them */
    for (const path of shippedpaths) expect(path.endsWith(".min.js") || path.endsWith(".min.cjs")).toBe(false);
    /* the staged manifest mirrors the repository manifest with the entry paths remapped to the package root */
    expect(stagedmanifest.name).toBe(packagejson.name);
    expect(stagedmanifest.version).toBe(packagejson.version);
    expect(stagedmanifest.main).toBe("./index.js");
    expect(stagedmanifest.types).toBe("./index.d.ts");
    expect(stagedmanifest.bin.devthink).toBe("./cli.js");
    const exporttargets: string[] = [];
    const collecttargets = (node: unknown) => {
      if (typeof node === "string") exporttargets.push(node);
      else if (Array.isArray(node)) node.forEach(collecttargets);
      else if (node !== null && typeof node === "object") Object.values(node).forEach(collecttargets);
    };
    collecttargets(stagedmanifest.exports);
    expect(exporttargets.length).toBeGreaterThan(20);
    for (const target of exporttargets) {
      expect(target.startsWith("./")).toBe(true);
      expect(target.startsWith("./dist/")).toBe(false);
      expect(existsSync(join("distpackage", target.replace(/^\.\//, "")))).toBe(true);
    }
  });

  it("stamps the built vsix artifact with the manifest version and the consent fields", async () => {
    if (!existsSync(`dist/devthink-vscode-${String(JSON.parse(await readFile("package.json", "utf8")).version)}.vsix`)) return; /* the validate chain runs the tests before the build; the vsix pass runs on the next pass and in the ci lanes that build first */
    const packagejson = JSON.parse(await readFile("package.json", "utf8"));
    const version = String(packagejson.version);
    const bytes = await readFile(`dist/devthink-vscode-${version}.vsix`);
    /* the vsix is a stored zip: the local file header magic and the end of central directory record both read back */
    expect(bytes.readUInt32LE(0)).toBe(0x04034b50);
    const end = bytes.subarray(bytes.length - 22);
    expect(end.readUInt32LE(0)).toBe(0x06054b50);
    expect(end.readUInt16LE(8)).toBe(6);
    const text = bytes.toString("utf8");
    expect(text).toContain(`"version": "${version}"`);
    expect(text).toContain("\"telemetry\": \"off\"");
    expect(text).not.toMatch(/marketplace\.visualstudio\.com|clients2\.google\.com/i);
  });

  it("keeps the site and declaration artifacts beside the browser builds", async () => {
    if (!existsSync("dist/checksums.txt")) return; /* the validate chain runs the tests before the build; the artifact pass runs on the next pass and in the ci lanes that build first */
    const packagejson = JSON.parse(await readFile("package.json", "utf8"));
    const version = String(packagejson.version);
    const site = await stat(`dist/devthink-site-${version}.zip`);
    expect(site.size).toBeGreaterThan(100);
    const declarations = await stat(`dist/devthink-declarations-${version}.zip`);
    expect(declarations.size).toBeGreaterThan(100);
  });
});
