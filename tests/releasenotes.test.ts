import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { artifactchannelof } from "../pack.js";

describe("generated release notes", () => {
  it("contains only the current changelog version content", async () => {
    const packagejson = JSON.parse(await readFile("package.json", "utf8"));
    const changelog = await readFile("CHANGELOG.md", "utf8");
    const releasenotes = await readFile("docs/releasenotes.md", "utf8");
    const heading = new RegExp(`^##\\s+${packagejson.version.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:\\s|$)`, "m");
    const match = changelog.match(heading);
    if (!match || match.index === undefined) throw new Error("Current changelog heading is missing.");
    const section = changelog.slice(match.index + match[0].length).split(/^##\s+/m)[0];
    if (typeof section !== "string") throw new Error("Current changelog section is missing.");
    const expected = section.trim();
    expect(releasenotes.startsWith(`# Devthink ${packagejson.version}\n\n${expected}\n`)).toBe(true);
  });

  it("carries the per channel sections of the publishing pipeline with every channel artifact", async () => {
    const packagejson = JSON.parse(await readFile("package.json", "utf8"));
    const version = String(packagejson.version);
    const releasenotes = await readFile("docs/releasenotes.md", "utf8");
    for (const channel of [
      "npm",
      "nuget",
      "maven",
      "container",
      "rubygems",
      "vscode",
      "firefox",
      "safari",
      "chromium",
      "site",
      "declarations",
      "provenance",
      "github",
    ]) {
      expect(releasenotes).toContain(`### ${channel} channel`);
    }
    /* every version stamped release artifact the channel sections list must map back onto its channel through the artifact manifest resolution, so the notes and the manifest never disagree */
    const expectedartifacts: Array<[string, string]> = [
      [`wenathlan-devthink-${version}.tgz`, "npmjs"],
      [`devthink.${version}.nupkg`, "nuget"],
      [`devthink-${version}.pom`, "maven"],
      [`devthink-${version}.gem`, "rubygems"],
      [`devthink-vscode-${version}.vsix`, "vscode"],
      [`devthink-firefox-${version}.xpi`, "firefox"],
      [`devthink-safari-${version}.zip`, "safari"],
      [`devthink${version}.zip`, "chromium"],
      [`devthink-site-${version}.zip`, "site"],
      [`devthink-declarations-${version}.zip`, "declarations"],
      [`devthink-sbom-${version}.json`, "provenance"],
      [`devthink-attestations-${version}.json`, "provenance"],
      [`devthink-artifactmanifest-${version}.json`, "provenance"],
      [`devthink-container.digest`, "container"],
    ];
    for (const [name, channel] of expectedartifacts) {
      expect(releasenotes).toContain(`\`${name}\``);
      expect(artifactchannelof(name, version)).toContain(channel);
    }
    /* the notes record the checksums and the notes assets of the github channel beside every other artifact */
    expect(releasenotes).toContain("`SHA256SUMS.txt`");
    expect(releasenotes).toContain("`RELEASENOTES.md`");
    expect(releasenotes).toContain("the verification step downloads every asset and verifies the checksums");
  });
});

/* ── The 2.0.13 maintenance ladder closure beside the 2.0.12 ceiling ladder records: the extension lineage's changelog history preserved verbatim by the grand merge. ── */

describe("the 2.0.13 maintenance ladder release notes", () => {
  it("ships the applied dependency updates and the automated dependency ladder", async () => {
    const changelog = await readFile("CHANGELOG.md", "utf8");
    const heading = /^##\s+2\.0\.13(?:\s|$)/m.exec(changelog);
    expect(heading).not.toBeNull();
    const section = changelog.slice(heading?.index ?? 0).split(/^##\s+/m)[1] ?? "";
    for (const marker of [
      "the denoland/setup-deno action of the verification pipeline",
      "the anchore/sbom-action of the security pipeline",
      "derives the next rung with plain arithmetic over package.json",
      "never a hardcoded number anywhere",
      "squashes the green result onto main with linear history",
      "the dependabot configuration is removed with this rung",
      "the denoland/setup-deno entry joins its allowlist",
      "the repository keeps exactly one long-lived branch",
    ])
      expect(section.toLowerCase()).toContain(marker);
    const releasenotes = await readFile("docs/releasenotes.md", "utf8");
    for (const marker of ["linux/amd64 and linux/arm64", "no referrers fallback tag rides the package"])
      expect(releasenotes.toLowerCase()).toContain(marker);
  });

  it("keeps the 2.0.12 marginal ceiling record with the 2.0.11 chain behind it", async () => {
    const changelog = await readFile("CHANGELOG.md", "utf8");
    const twelve = /^##\s+2\.0\.12(?:\s|$)/m.exec(changelog);
    expect(twelve).not.toBeNull();
    const twelvesection = changelog.slice(twelve?.index ?? 0).split(/^##\s+/m)[1] ?? "";
    for (const marker of [
      "a sixteen millisecond overrun of a green test",
      "the native ceiling itself was the defect, not the test",
      "the esm core build reads sixty seconds natively",
      "the whole-matrix build reads one hundred twenty seconds",
      "the same `devthink_test_timeout_ms` the emulated arm64 container leg exports",
    ])
      expect(twelvesection.toLowerCase()).toContain(marker);
  });

  it("keeps the 2.0.11 sanitizer record with the 2.0.10 chain behind it", async () => {
    const changelog = await readFile("CHANGELOG.md", "utf8");
    const eleven = /^##\s+2\.0\.11(?:\s|$)/m.exec(changelog);
    expect(eleven).not.toBeNull();
    const elevensection = changelog.slice(eleven?.index ?? 0).split(/^##\s+/m)[1] ?? "";
    for (const marker of [
      "closes the two code scanning alerts the re-analysis of the security page surfaced",
      "the script stripper of `withoutscripts`",
      "incomplete multi character sanitization",
      "an unterminated block still strips to the fragment end",
      "the sweep answers the same ten of ten checks green",
      "the code scanning page answers zero open alerts",
    ])
      expect(elevensection.toLowerCase()).toContain(marker);
  });

  it("keeps the 2.0.10 emulation record with the 2.0.9 chain behind it", async () => {
    const changelog = await readFile("CHANGELOG.md", "utf8");
    const ten = /^##\s+2\.0\.10(?:\s|$)/m.exec(changelog);
    expect(ten).not.toBeNull();
    const tensection = changelog.slice(ten?.index ?? 0).split(/^##\s+/m)[1] ?? "";
    for (const marker of [
      "the arm64 leg runs interpreted through qemu",
      "fourteen hit the five second vitest default timeout",
      "the linearity budget of the adversarial star storm",
      "nothing is skipped, nothing is relaxed",
      "the vitest config keeps the env-scaled timeout",
    ])
      expect(tensection.toLowerCase()).toContain(marker);
  });

  it("keeps the 2.0.9 browser fix record with the 2.0.8 chain behind it", async () => {
    const changelog = await readFile("CHANGELOG.md", "utf8");
    const nine = /^##\s+2\.0\.9(?:\s|$)/m.exec(changelog);
    expect(nine).not.toBeNull();
    const ninesection = changelog.slice(nine?.index ?? 0).split(/^##\s+/m)[1] ?? "";
    for (const marker of [
      "the delegated browser verification of the 2.0.8 release zip against the sandbox host",
      "cannot read properties of undefined (reading 'length')",
      "the context now unwraps the envelope at the source",
      "the registry now answers the boolean grammar the commands declare",
      "a `line` text helper that never existed",
      "line is not defined",
      "every reviewed step has executed and the plan is closed",
      "zero console errors answer across the host, the popup and the sidepanel",
    ])
      expect(ninesection.toLowerCase()).toContain(marker);
  });

  it("keeps the 2.0.8 metadata and container record with the 2.0.7 chain behind it", async () => {
    const changelog = await readFile("CHANGELOG.md", "utf8");
    const eight = /^##\s+2\.0\.8(?:\s|$)/m.exec(changelog);
    expect(eight).not.toBeNull();
    const eightsection = changelog.slice(eight?.index ?? 0).split(/^##\s+/m)[1] ?? "";
    for (const marker of [
      "the verify lanes caught the release metadata drift before anything published",
      "the apifreeze test refused",
      "points at the commit that never released",
      "the api freeze artifact and the cap manifests re-freeze at 2.0.8",
      "zero added, zero removed, nothing reordered",
      "the runners own the authoritative build",
    ])
      expect(eightsection.toLowerCase()).toContain(marker);
  });

  it("keeps the 2.0.7 security and container record with the 2.0.6 ladder chain behind it", async () => {
    const changelog = await readFile("CHANGELOG.md", "utf8");
    const seven = /^##\s+2\.0\.7(?:\s|$)/m.exec(changelog);
    expect(seven).not.toBeNull();
    const sevensection = changelog.slice(seven?.index ?? 0).split(/^##\s+/m)[1] ?? "";
    for (const marker of [
      "the two open code scanning alerts",
      "linear string scans",
      "the four arch/os entries",
      "linux/amd64, linux/arm64",
      "the attestation feature stays",
      "referrers fallback tag",
      "the digest files that pin the exact image hash",
      "dynamically from the registry answer",
      "no digest written in the workflow",
    ])
      expect(sevensection.toLowerCase()).toContain(marker);
    const six = /^##\s+2\.0\.6(?:\s|$)/m.exec(changelog);
    expect(six).not.toBeNull();
    const sixsection = changelog.slice(six?.index ?? 0).split(/^##\s+/m)[1] ?? "";
    for (const marker of [
      "end-user verification of the published 2.0.5 package",
      "the package-scoped checksums verifying all 141 shipped files",
      "six icon errors and exit one from the installed package",
      "the browser bundle rides the release zip channel",
      "the identity-digest fail-soft",
      "a declared icon missing from a present bundle remains an error",
      "the unbundled context answers the release-zip note with exit zero",
    ])
      expect(sixsection.toLowerCase()).toContain(marker);
    const five = /^##\s+2\.0\.5(?:\s|$)/m.exec(changelog);
    expect(five).not.toBeNull();
    const fivesection = changelog.slice(five?.index ?? 0).split(/^##\s+/m)[1] ?? "";
    for (const marker of ["works-on-my-machine", "the validate:candidate script now runs the soak and the wcag sweeps"])
      expect(fivesection.toLowerCase()).toContain(marker);
    const four = /^##\s+2\.0\.4(?:\s|$)/m.exec(changelog);
    expect(four).not.toBeNull();
    const foursection = changelog.slice(four?.index ?? 0).split(/^##\s+/m)[1] ?? "";
    for (const marker of ["counts the `package/` root prefix", "three real directory segments"])
      expect(foursection.toLowerCase()).toContain(marker);
    const three = /^##\s+2\.0\.3(?:\s|$)/m.exec(changelog);
    expect(three).not.toBeNull();
    const threesection = changelog.slice(three?.index ?? 0).split(/^##\s+/m)[1] ?? "";
    for (const marker of [
      "flat package organization pass",
      "one file per correlated domain",
      "nothing nested past two directories",
    ])
      expect(threesection.toLowerCase()).toContain(marker);
  });

  it("assembles the full chain from the 1.1.31 base into the release notes", async () => {
    const releasenotes = await readFile("docs/releasenotes.md", "utf8");
    expect(releasenotes).toContain("## The chain to this candidate");
    for (const phase of [
      "The base",
      "The agentic core",
      "The platform depth",
      "The interface and ecosystem surface",
      "The operator surface",
      "The freeze, the certification and the candidates",
    ])
      expect(releasenotes).toContain(`### ${phase} (`);
    for (const marker of [
      "1.1.31 — the frozen baseline the chain builds on",
      "1.1.98 — the clean repository shape restoration",
      "1.1.99 — release candidate one",
      "### The migration steps for upgraders",
      "### The frozen protocol guarantees",
      "### The certified scenarios",
      "### The performance budget results",
      "### The security review summary",
    ])
      expect(releasenotes).toContain(marker);
  });
});
