/** Synchronizes release metadata from package.json and renders deterministic GitHub release notes with the per channel artifact sections. */
import { readFile, writeFile } from "node:fs/promises";

/** The baseline one engine declaration carries (the >= floor of the bounded range): the version catalog records the floor every artifact of the release was verified against. */
function enginebaseline(declaration) {
  const match = />=([0-9A-Za-z.-]+)/.exec(String(declaration ?? ""));
  return match === null ? "" : match[1];
}

/** The release artifact names of one version: the list mirrors the channel resolution of the artifactmanifest module so the notes, the manifest and the docs speak the same catalog; the publishing pipeline tests assert the mirror never drifts. */
function releaseartifactnames(version) {
  return [
    `wenathlan-devthink-${version}.tgz`,
    `devthink.${version}.nupkg`,
    `devthink-${version}.pom`,
    `devthink-${version}.jar`,
    `devthink-${version}.gem`,
    "devthink-container.txt",
    "devthink-container.digest",
    "devthink-container.json",
    `devthink-vscode-${version}.vsix`,
    `devthink-firefox-${version}.xpi`,
    `devthink-safari-${version}.zip`,
    `devthink${version}.zip`,
    `devthink-${version}-source.zip`,
    `devthink-nativehost-${version}.template.json`,
    `devthink-site-${version}.zip`,
    `devthink-declarations-${version}.zip`,
    `devthink-sbom-${version}.json`,
    `devthink-attestations-${version}.json`,
    `devthink-artifactmanifest-${version}.json`,
    "SHA256SUMS.txt",
    "RELEASENOTES.md",
  ];
}

/** The publishing channel sections of the release notes: one section per channel with every artifact that rides it, so the release body records every artifact per channel before the github release links them. */
function channelsectionsof(version) {
  const names = releaseartifactnames(version);
  const byname = (name) => names.includes(name);
  const channel = (title, artifacts, note) =>
    `### ${title}\n\n${artifacts
      .filter(byname)
      .map((name) => `- \`${name}\``)
      .join("\n")}${note === "" ? "" : `\n\n${note}`}`;
  return [
    "## Distribution channels",
    "",
    "Every artifact of this release ships through the channels below. The artifact manifest records the name, the byte size, the sha256 checksum and the channels of every artifact, the checksums file covers the release set, the sbom inventory documents it and the attestations carry its provenance. Nothing auto-publishes outside the reviewed release workflow.",
    "",
    channel(
      "npm channel",
      [`wenathlan-devthink-${version}.tgz`],
      `The library tarball publishes to npmjs and GitHub Packages under the \`@wenathlan/devthink\` scope; the same tarball attaches to the release assets.`,
    ),
    "",
    channel(
      "nuget channel",
      [`devthink.${version}.nupkg`],
      `The nupkg carries the cli, headless and mcp entries as content files beside the umd and cjs bundles, the declaration files for ide integration, the sample fixtures and the chromium extension zip.`,
    ),
    "",
    channel(
      "maven channel",
      [
        `devthink-${version}.pom`,
        `devthink-${version}.jar`,
        `devthink${version}.zip`,
        `devthink-declarations-${version}.zip`,
      ],
      `The single io.github.wenathlan.devthink distribution with every consumption mode embedded as jar resources; the extension zip and the declarations zip attach with their classifiers beside the one jar.`,
    ),
    "",
    channel(
      "container channel",
      ["devthink-container.txt", "devthink-container.digest", "devthink-container.json"],
      `The multi stage image publishes for both linux architectures with the version tag beside the stable channel alias — the index answers linux/amd64 and linux/arm64 beside the per platform attestation entries, and no referrers fallback tag rides the package because the digest stays embedded through the image index itself and the digest files that pin the exact image hash as release assets. The image exposes the mcp server, the static site and the socket relay speaking the servercontract for self hosting.`,
    ),
    "",
    channel(
      "rubygems channel",
      [`devthink-${version}.gem`],
      `The ruby process adapter gem of devthink.gemspec builds with the runner shim the publish workflow generates at build time and pushes to the GitHub Packages RubyGems registry beside the other four package channels; the gem spawns the devthink cli without storing credentials.`,
    ),
    "",
    channel(
      "vscode channel",
      [`devthink-vscode-${version}.vsix`],
      `The vs code package ships as a pure zip-based vsix the operator installs from the release asset with their own credentials; the manifest declares no telemetry and no network default.`,
    ),
    "",
    channel(
      "firefox channel",
      [`devthink-firefox-${version}.xpi`],
      `The firefox build ships as the xpi artifact; the signing and notarization path per browser is documented in docs/18.browsercoverage.md.`,
    ),
    "",
    channel(
      "safari channel",
      [`devthink-safari-${version}.zip`],
      `The safari skeleton ships as the source asset the xcode wrapper builds from.`,
    ),
    "",
    channel(
      "chromium channel",
      [`devthink${version}.zip`, `devthink-${version}-source.zip`, `devthink-nativehost-${version}.template.json`],
      `The chromium extension zip, the immutable source snapshot and the native host manifest template of the release.`,
    ),
    "",
    channel(
      "site channel",
      [`devthink-site-${version}.zip`],
      `The hashed static site of the chatbridge surface with its immutable cache header configuration.`,
    ),
    "",
    channel(
      "declarations channel",
      [`devthink-declarations-${version}.zip`],
      `Every declaration file and declaration map of the build for ide integration; the same zip attaches to the maven channel with the declarations classifier.`,
    ),
    "",
    channel(
      "provenance channel",
      [
        `devthink-sbom-${version}.json`,
        `devthink-attestations-${version}.json`,
        `devthink-artifactmanifest-${version}.json`,
      ],
      `The cyclonedx inventory of every artifact, the provenance attestations of the release set and the artifact manifest with names, sizes, checksums and channels.`,
    ),
    "",
    channel(
      "github channel",
      names.slice(),
      "Every artifact above attaches to the release of the immutable tag beside the checksums file and these notes; the release stays a draft until the verification step downloads every asset and verifies the checksums.",
    ),
    "",
  ].join("\n");
}

/** The full release notes document of one version: the changelog section of the version followed by the per channel artifact sections and the chain section the notes assembly merges from the roadmap phases. */
function notesof(version, section, chain) {
  return `# Devthink ${version}\n\n${section}\n\n${channelsectionsof(version)}\n${chain}`;
}

/** The chain section of the notes assembly: the phase groups of the roadmap declare the chain every release from the 1.1.31 base to the candidate builds on, so the assembly reads the roadmap headings, groups the released versions into their phases and appends the migration steps, the frozen protocol guarantees, the certified scenarios, the performance budget results and the security review summary the candidate carries. */
async function chainsectionsof(changelog) {
  const roadmap = await readFile("docs/13.evolutionroadmap.md", "utf8");
  const titles = new Map();
  for (const match of roadmap.matchAll(/^##\s+(\d+\.\d+\.\d+(?:-rc\.\d+)?)\s+(.+)$/gm))
    titles.set(match[1], match[2].trim());
  const released = [...changelog.matchAll(/^##\s+(\d+\.\d+\.\d+)\s*$/gm)].map((match) => match[1]);
  const baselabels = new Map([
    ["1.1.31", "the frozen baseline the chain builds on"],
    ["1.1.98", "the clean repository shape restoration"],
    ["1.1.99", "the first release candidate"],
  ]);
  const phases = [
    ["The base", "1.1.31", "1.1.31"],
    ["The agentic core", "1.1.32", "1.1.47"],
    ["The platform depth", "1.1.48", "1.1.63"],
    ["The interface and ecosystem surface", "1.1.64", "1.1.79"],
    ["The operator surface", "1.1.80", "1.1.90"],
    ["The freeze, the certification and the candidates", "1.1.91", "1.1.99"],
  ];
  const versionof = (label) => {
    const parts = label.split(".").map(Number);
    return parts[0] * 10000 + parts[1] * 100 + parts[2];
  };
  const ingroup = (label, from, to) => versionof(label) >= versionof(from) && versionof(label) <= versionof(to);
  const groups = phases
    .map(([name, from, to]) => {
      const versions = released.filter((label) => ingroup(label, from, to));
      return [
        `### ${name} (${from}${to === from ? "" : ` – ${to}`})`,
        "",
        ...versions.map(
          (label) =>
            `- ${label} — ${titles.get(label) ?? baselabels.get(label) ?? "the release entry of the changelog"}`,
        ),
      ].join("\n");
    })
    .filter((group) => group.split("\n").length > 2);
  return [
    "## The chain to this candidate",
    "",
    `Every release from the 1.1.31 base to this candidate, grouped by the phases the roadmap declared: ${released.length} released versions the changelog records, ${titles.size} roadmap sections the phases draw their titles from.`,
    "",
    groups.join("\n\n"),
    "",
    "### The migration steps for upgraders",
    "",
    "The wire speaks protocol major two since the 1.1.91 api freeze while every version one message stays accepted through the deprecation window that closes at 2.0.0 with one warning per session; upgraders from the 1.1.x line keep their storage, their sessions and their settings because the storage schemas stay frozen under the freeze artifact, the permission set stays pinned by the permission diff baseline and no data migration step is required before 2.0.0. The 2.0.0 release candidate carries the migrateplan command with the automa, selenium, ui vision and tabular importers for plans authored outside devthink.",
    "",
    "### The frozen protocol guarantees",
    "",
    "The 1.1.91 api freeze pins the wire: the frozen message catalog of twenty three messages with their ten schemas, the immutable action kind identifiers of the three hundred thirty five kind vocabulary, the five wire error codes beside the six terminal exit codes, the per tool versions of the mcp catalog and the seven capability manifests — every surface answers the freeze gate with the same hashes the artifact records, and a client that speaks major one keeps working through the deprecation window.",
    "",
    "### The certified scenarios",
    "",
    "The agent certification of the 1.1.96 release drives thirty coordination scenarios end to end over the fake tabs of every browser kind with the fake clock: the leader worker topology, the planner executor critic verifier split, the shared queue with its lanes and work stealing, the blackboard, the tab handoffs, the resource locks, the result merging, the consensus rounds, the emergency stops, the sub agent depth limits and the pool item coverage. The cost certification adds its nine budget checks and the first release candidate adds the defect sweep, the verification matrix and the telemetry free verification of this release.",
    "",
    "### The performance budget results",
    "",
    "The build enforces a byte budget on every dist target and fails when a bundle overgrows it; the budgets with the measured sizes of this candidate live in docs/perfbudgets.md beside the startup, latency and memory ceilings the run budget gates keep (the heartbeat window default, the task tab ceiling, the timeout ceilings and the memory budget ratio the run budget validation enforces).",
    "",
    "### The security review summary",
    "",
    "The security posture of the candidate: the permission set stays at its pinned baseline with the permission diff gate, the content security policy stays strict with its hashes audited, the pentest gate drives its twenty one checklist entries against the shipped bundles, the code scanning alerts of the 1.1.89 fixes stayed closed and the telemetry free verification of this release proves zero outbound requests behind the block all proxy.",
    "",
  ].join("\n");
}

/** The version catalog block of docs/runtimeversions.md: the current devthink release beside the runtime baselines the release was verified against; the maintenance workflow re-runs the synchronization after each release so the catalog never drifts from package.json. */
function versioncatalogof(version, packagejson) {
  const rows = [
    ["devthink release", version],
    ["node baseline", enginebaseline(packagejson.engines?.node)],
    ["npm baseline", enginebaseline(packagejson.engines?.npm)],
    ["package manager baseline", String(packagejson.packageManager ?? "").replace(/^[A-Za-z]+@/, "")],
    ["bun baseline", enginebaseline(packagejson.engines?.bun)],
  ];
  for (const [, value] of rows)
    if (!/^[0-9A-Za-z.-]+$/.test(value))
      throw new Error(
        "The version catalog records the release and the runtime baselines; a missing baseline never renders the catalog.",
      );
  return `## Version catalog\n\nThe catalog records the current devthink release and the runtime baselines every artifact of that release was built and verified against. The release metadata synchronization regenerates the table on every release and the maintenance workflow re-runs the synchronization after each release, so the catalog never drifts from package.json.\n\n| Entry | Version |\n| --- | --- |\n${rows.map(([entry, value]) => `| ${entry} | ${value} |`).join("\n")}\n`;
}

const mode = process.argv[2] ?? "check";
const packagejson = JSON.parse(await readFile("package.json", "utf8"));
const version = packagejson.version;
if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) throw new Error("package.json version must be SemVer.");
const changelog = await readFile("CHANGELOG.md", "utf8");
const heading = new RegExp(`^##\\s+${version.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:\\s|$)`, "m");
if (!heading.test(changelog)) throw new Error(`CHANGELOG.md must contain a ## ${version} heading.`);
const headingmatch = changelog.match(heading);
if (!headingmatch || headingmatch.index === undefined)
  throw new Error(`Unable to locate the ${version} changelog heading.`);
const section = changelog
  .slice(headingmatch.index + headingmatch[0].length)
  .split(/^##\s+/m)[0]
  .trim();
if (!section) throw new Error(`CHANGELOG.md ${version} must contain release-note content.`);
const chain = await chainsectionsof(changelog);
const edits = [
  ["web/manifest.json", (content) => JSON.stringify({ ...JSON.parse(content), version }, null, 2) + "\n"],
  [
    "version.ts",
    () =>
      `/** Canonical package version synchronized from package.json. */\nexport const packageversion = "${version}" as const;\n\n/** The frozen protocolv2 major of the 1.1.91 api freeze: the wire speaks major two from this release on, the deprecation window closed at 2.0.0 and every major above two refuses until a future major bump. */\nexport const protocolmajor = 2 as const;\n\n/** The lowest protocol major this build accepts: the deprecation window closed at 2.0.0, so the line speaks major two only — a client that declares major one answers the refusal below the floor while version one assets ride the migrateplan command and the migration guide. */\nexport const protocolfloormajor = 2 as const;\n`,
  ],
  [
    "deno.json",
    (content) => content.replace(/npm:@wenathlan\/devthink@[0-9A-Za-z.-]+/, `npm:@wenathlan/devthink@${version}`),
  ],
  ["web/package.json", (content) => content.replace(/"version": "[0-9A-Za-z.-]+"/, `"version": "${version}"`)],
  ["web/design.html", (content) => content.replace(/DEVTHINK\s+[0-9][0-9A-Za-z.-]*/, `DEVTHINK ${version}`)],
  ["pom.xml", (content) => content.replace(/<revision>[^<]+<\/revision>/, `<revision>${version}</revision>`)],
  ["devthink.csproj", (content) => content.replace(/<Version>[^<]+<\/Version>/, `<Version>${version}</Version>`)],
  [
    "devthink.gemspec",
    (content) =>
      content.replace(
        /ENV\.fetch\("DEVTHINK_VERSION", "[0-9A-Za-z.-]+"\)/,
        `ENV.fetch("DEVTHINK_VERSION", "${version}")`,
      ),
  ],
  [
    "devthink.java",
    (content) => content.replace(/VERSION = "[0-9A-Za-z.-]+"/, `VERSION = "${version}"`),
  ],
  ["devthinkcli.cs", (content) => content.replace(/Version = "[0-9A-Za-z.-]+"/, `Version = "${version}"`)],
  [
    "Dockerfile",
    (content) =>
      content
        .replace(/# devthink [0-9][0-9A-Za-z.-]* — THE ONE CONTAINER FILE/, `# devthink ${version} — THE ONE CONTAINER FILE`)
        .replace(/DEVTHINK_VERSION   baked into the OCI version label, default [0-9][0-9A-Za-z.-]*/, `DEVTHINK_VERSION   baked into the OCI version label, default ${version}`)
        .replace(/ghcr\.io\/wenathlan\/devthink:[0-9][0-9A-Za-z.-]*/g, `ghcr.io/wenathlan/devthink:${version}`)
        .replace(/ARG DEVTHINK_VERSION=[0-9][0-9A-Za-z.-]*/g, `ARG DEVTHINK_VERSION=${version}`),
  ],
  [
    "docs/runtimeversions.md",
    (content) => {
      const catalog = versioncatalogof(version, packagejson);
      return /## Version catalog/.test(content)
        ? content.replace(/## Version catalog[\s\S]*$/, catalog)
        : `${content.replace(/\s*$/, "\n")}\n${catalog}`;
    },
  ],
  [
    "README.md",
    (content) =>
      content
        .replace(/Version: \*\*[0-9A-Za-z.-]+\*\*/, `Version: **${version}**`)
        .replace(/Behavior in [0-9A-Za-z.-]+/g, `Behavior in ${version}`)
        .replace(/"version": "[0-9A-Za-z.-]+"/, `"version": "${version}"`),
  ],
  [
    "docs/releasegates.md",
    (content) =>
      content
        .replace(
          /\| Gate \| Required evidence \| [0-9A-Za-z.-]+ status \|/,
          `| Gate | Required evidence | ${version} status |`,
        )
        .replace(/(?:extension|dist)\/devthink[0-9A-Za-z.-]+\.zip/g, `dist/devthink${version}.zip`)
        .replace(/Local validation for [0-9A-Za-z.-]+/g, `Local validation for ${version}`)
        .replace(
          /NuGet package contains `contentFiles\/any\/any\/devthink[0-9A-Za-z.-]+\.zip`/g,
          `NuGet package contains \`contentFiles/any/any/devthink${version}.zip\``,
        ),
  ],
  ["docs/releasenotes.md", () => `${notesof(version, section, chain)}\n`],
];
let drift = false;
for (const [path, transform] of edits) {
  let current = "";
  try {
    current = await readFile(path, "utf8");
  } catch {
    if (
      ![
        "pom.xml",
        "devthink.csproj",
        "README.md",
        "docs/releasegates.md",
        "docs/releasenotes.md",
        "docs/runtimeversions.md",
      ].includes(path)
    )
      throw new Error(`Missing required metadata file: ${path}`);
  }
  const next = transform(current);
  if (current !== next) {
    drift = true;
    if (mode === "sync" || (mode === "notes" && path === "docs/releasenotes.md")) await writeFile(path, next);
  }
}
if (mode === "check" && drift) throw new Error("Release metadata drift detected. Run pnpm sync:metadata.");
if (mode === "notes") await writeFile("docs/releasenotes.md", `${notesof(version, section, chain)}\n`);
console.log(JSON.stringify({ version, changelog: `CHANGELOG.md#${version}`, drift, mode }, null, 2));
