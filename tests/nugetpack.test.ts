import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { nugetcontententries, nugetdeclarationentries, nugetfixtureentries, nugetframeworktargets } from "../pack.js";

describe("nugetpack", () => {
  it("gains the content files for the cli, headless and mcp entries beside the bundles and the extension zip", () => {
    const entries = nugetcontententries("1.1.87");
    const paths = entries.map(entry => entry.contentpath);
    expect(paths).toContain("contentFiles/any/any/cli.js");
    expect(paths).toContain("contentFiles/any/any/headless.js");
    expect(paths).toContain("contentFiles/any/any/mcp.js");
    expect(paths).toContain("contentFiles/any/any/devthink.umd.js");
    expect(paths).toContain("contentFiles/any/any/index.cjs");
    expect(paths).toContain("contentFiles/any/any/devthink1.1.87.zip");
    /* every content entry resolves to a real source path the pack reads at build time */
    expect(entries.every(entry => entry.source.length > 0)).toBe(true);
  });

  it("embeds the declaration files for ide integration", () => {
    const declarations = nugetdeclarationentries();
    expect(declarations.length).toBeGreaterThanOrEqual(10);
    for (const entry of declarations) {
      expect(entry.contentpath.startsWith("contentFiles/any/any/declarations/")).toBe(true);
      expect(entry.source.endsWith(".d.ts")).toBe(true);
    }
  });

  it("embeds the fixtures directory as sample content", () => {
    const fixtures = nugetfixtureentries();
    const paths = fixtures.map(entry => entry.contentpath);
    expect(paths).toContain("contentFiles/any/any/fixtures/example-org-pagestate.json");
    expect(paths).toContain("contentFiles/any/any/fixtures/plans/release-notes-plan.json");
    expect(paths).toContain("contentFiles/any/any/fixtures/plans/form-inventory-plan.json");
    expect(paths).toContain("contentFiles/any/any/fixtures/mcp-client.mjs");
  });

  it("declares the framework targets matching the csproj profile", () => {
    expect(nugetframeworktargets()).toEqual(["netstandard2.0", "netstandard2.1"]);
  });

  it("carries the devthink package identity, url, license and readme in the manifest metadata", async () => {
    const csproj = await readFile("devthink.csproj", "utf8");
    expect(csproj).toContain("<PackageId>devthink</PackageId>");
    expect(csproj).toContain("<AssemblyName>devthink</AssemblyName>");
    expect(csproj).toContain("<RootNamespace>DevThink</RootNamespace>");
    expect(csproj).toContain("<PackageProjectUrl>https://github.com/wenathlan/devthink</PackageProjectUrl>");
    expect(csproj).toContain("<RepositoryUrl>https://github.com/wenathlan/devthink</RepositoryUrl>");
    expect(csproj).toContain("<PackageLicenseExpression>GPL-3.0-only</PackageLicenseExpression>");
    expect(csproj).toContain("<PackageReadmeFile>README.md</PackageReadmeFile>");
    expect(csproj).not.toContain("wenathlan/extension");
  });

  it("keeps the version in lockstep with the package metadata of the release", async () => {
    const packageversion = String(JSON.parse(await readFile("package.json", "utf8")).version);
    const csproj = await readFile("devthink.csproj", "utf8");
    expect(csproj).toContain(`<Version>${packageversion}</Version>`);
  });

  it("compiles the distribution marker class into the netstandard assembly", async () => {
    const csproj = await readFile("devthink.csproj", "utf8");
    expect(csproj).toContain('<Compile Include="ExtensionDistribution.cs" />');
    const source = await readFile("ExtensionDistribution.cs", "utf8");
    expect(source).toContain("namespace DevThink");
    expect(source).toContain('"@wenathlan/devthink"');
  });

  it("keeps the checked-in csproj mirroring the nuget layout so the descriptor never drifts", async () => {
    const csproj = await readFile("devthink.csproj", "utf8");
    for (const entry of [...nugetcontententries("1.1.87"), ...nugetfixtureentries()]) {
      /* the extension zip packs through the $(PackageVersion) property so the pack stays version driven; every other content entry lands at its exact content path */
      const zipentry = entry.contentpath === "contentFiles/any/any/devthink1.1.87.zip";
      const include = zipentry ? "dist/devthink$(PackageVersion).zip" : entry.source;
      const packagepath = zipentry ? "contentFiles/any/any/" : entry.contentpath;
      expect(csproj).toContain(`Include="${include}"`);
      expect(csproj).toContain(`PackagePath="${packagepath}"`);
    }
    /* the csproj packs the declarations as a directory include and the readme at the package root */
    expect(csproj).toContain('dist/*.d.ts" Pack="true" PackagePath="contentFiles/any/any/declarations/"');
    expect(csproj).toContain('<None Include="README.md" Pack="true" PackagePath="/" />');
    /* the framework targets match the profile */
    expect(csproj).toContain("<TargetFrameworks>netstandard2.0;netstandard2.1</TargetFrameworks>");
  });
});
