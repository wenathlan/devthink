import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { mavenattachedartifacts, mavenjarresources, mavenpackinfo, mavenpacklayout, mavenpackpomtext } from "../pack.js";

describe("mavenpack", () => {
  it("embeds every consumption mode as flat root resources inside the single distribution jar", () => {
    expect(mavenjarresources()).toEqual(["index.js", "index.cjs", "devthink.umd.js", "checksums.txt", "cli.js", "headless.js", "mcp.js", "gateway.js", "http.js"]);
  });

  it("attaches the declarations as classifier artifacts beside the extension zip", () => {
    const attached = mavenattachedartifacts("1.1.99");
    expect(attached).toEqual([
      { classifier: "extension", type: "zip", path: "dist/devthink1.1.99.zip" },
      { classifier: "declarations", type: "zip", path: "dist/devthink-declarations-1.1.99.zip" },
    ]);
    expect(() => mavenattachedartifacts("not-a-version")).toThrow();
  });

  it("records the project metadata and license the pom carries", () => {
    const metadata = mavenpackinfo();
    expect(metadata.groupid).toBe("io.github.wenathlan");
    expect(metadata.artifactid).toBe("extension");
    expect(metadata.url).toBe("https://github.com/wenathlan/extension");
    expect(metadata.license).toBe("GPL-3.0-only");
    expect(metadata.scmconnection).toBe("scm:git:https://github.com/wenathlan/extension.git");
  });

  it("assembles the full maven layout of one release", () => {
    const layout = mavenpacklayout("1.1.99");
    expect(layout.version).toBe("1.1.99");
    expect(layout.resources).toEqual(mavenjarresources());
    expect(layout.attached).toEqual(mavenattachedartifacts("1.1.99"));
    expect(layout.metadata).toEqual(mavenpackinfo());
    expect(() => mavenpacklayout("not-a-version")).toThrow();
  });

  it("renders the pom text with the single jar packaging and the flat root resource includes of every mode", () => {
    const text = mavenpackpomtext("1.1.99");
    expect(text).toContain("<artifactId>extension</artifactId>");
    expect(text).toContain("<packaging>jar</packaging>");
    expect(text).toContain("<version>1.1.99</version>");
    for (const resource of mavenjarresources()) expect(text).toContain(`<include>${resource}</include>`);
    expect(text).not.toContain("<targetPath>");
    expect(text).toContain('<classifier>extension</classifier>');
    expect(text).toContain('<classifier>declarations</classifier>');
    expect(() => mavenpackpomtext("not-a-version")).toThrow();
  });

  it("keeps the checked-in pom mirroring the maven layout so the descriptor never drifts", async () => {
    const rootpom = await readFile("pom.xml", "utf8");
    const packageversion = String(JSON.parse(await readFile("package.json", "utf8")).version);
    expect(rootpom).toBe(mavenpackpomtext(packageversion));
  });
});
