import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { mavenattachedartifacts, mavenjarresources } from "../pack.js";

describe("mavenpack", () => {
  it("embeds every consumption mode as flat root resources inside the single distribution jar", () => {
    expect(mavenjarresources()).toEqual([
      "index.js",
      "index.cjs",
      "devthink.umd.js",
      "checksums.txt",
      "cli.js",
      "headless.js",
      "mcp.js",
      "server.js",
      "http.js",
    ]);
  });

  it("attaches the declarations as classifier artifacts beside the extension zip", () => {
    const attached = mavenattachedartifacts("1.1.99");
    expect(attached).toEqual([
      { classifier: "extension", type: "zip", path: "dist/devthink1.1.99.zip" },
      { classifier: "declarations", type: "zip", path: "dist/devthink-declarations-1.1.99.zip" },
    ]);
    expect(() => mavenattachedartifacts("not-a-version")).toThrow();
  });

  it("records the devthink coordinates and the license the pom carries", async () => {
    const rootpom = await readFile("pom.xml", "utf8");
    expect(rootpom).toContain("<groupId>io.github.wenathlan</groupId>");
    expect(rootpom).toContain("<artifactId>devthink</artifactId>");
    expect(rootpom).toContain("<packaging>jar</packaging>");
    expect(rootpom).toContain("<url>https://github.com/wenathlan/devthink</url>");
    expect(rootpom).toContain("scm:git:https://github.com/wenathlan/devthink.git");
    expect(rootpom).toContain("<name>GPL-3.0-only</name>");
    expect(rootpom).toContain("<url>https://www.gnu.org/licenses/gpl-3.0.html</url>");
    expect(rootpom).not.toContain("wenathlan/extension");
  });

  it("keeps the release version under the revision property so the resolver stamps one source", async () => {
    const rootpom = await readFile("pom.xml", "utf8");
    const packageversion = String(JSON.parse(await readFile("package.json", "utf8")).version);
    expect(rootpom).toContain("<version>${revision}</version>");
    expect(rootpom).toContain(`<revision>${packageversion}</revision>`);
  });

  it("publishes the single distribution to the GitHub Packages repository the pom declares", async () => {
    const rootpom = await readFile("pom.xml", "utf8");
    expect(rootpom).toContain("<distributionManagement>");
    expect(rootpom).toContain("<id>github</id>");
    expect(rootpom).toContain("https://maven.pkg.github.com/wenathlan/devthink");
  });

  it("renders the pom with the single jar packaging and the flat root resource includes of every mode", async () => {
    const rootpom = await readFile("pom.xml", "utf8");
    for (const resource of mavenjarresources()) expect(rootpom).toContain(`<include>${resource}</include>`);
    expect(rootpom).not.toContain("<targetPath>");
    expect(rootpom).not.toMatch(/[0-9a-f]{40,}/);
  });

  it("keeps the checked-in pom mirroring the maven layout so the descriptor never drifts", async () => {
    const rootpom = await readFile("pom.xml", "utf8");
    /* every attached classifier artifact of the pack module lands in the build helper the pom pins, resolved through the project properties so the attachment stays version driven */
    for (const artifact of mavenattachedartifacts("1.1.99")) {
      const attachedfile = "${project.basedir}/" + artifact.path.replace("1.1.99", "${project.version}");
      expect(rootpom).toContain(`<file>${attachedfile}</file>`);
      expect(rootpom).toContain(`<classifier>${artifact.classifier}</classifier>`);
    }
    expect(rootpom).toContain("<artifactId>build-helper-maven-plugin</artifactId>");
    expect(rootpom).toContain("<version>3.6.1</version>");
    expect(rootpom).toContain("<id>attach-extension-zip</id>");
    expect(rootpom).toContain("<goal>attach-artifact</goal>");
  });
});
