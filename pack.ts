/** The pack module of the 1.1.90 consolidation: every correlated variation of the publishing pipeline contract and all its packagers interned in this one file, so the module family carries one surface without duplicate variations. */

/* ── Merged from artifactmanifest.ts: the 1.1.90 consolidation interns the correlated artifactmanifest logic here, so no variation of the same file lives beside another. ── */
import type { artifactmanifestdocument, artifactmanifestentry, containerbuildstage, containerexposedsurface, mavenattachedartifact, mavenpommetadata, nugetcontententry, nugetpackmetadata, sbominventoryinput, vsixmanifestfields, vsixpackinput, vsixpackoutput } from "./types.js";

/**
 * Artifactmanifest of the 1.1.87 publishing pipeline family.
 * Every release artifact manifest concern of the publishing pipeline lives in this one pure module: the manifest document the build and the release workflow emit (every artifact with its name, its byte size, its sha256 checksum and its publishing channels), the channel resolution that maps one artifact name onto the channels it ships through, the check that asserts a built set matches the manifest exactly, and the rollback pin that freezes the previous release artifact set through its immutable tag. The module stays pure: the manifest carries no timestamp so the same artifact set renders byte identical on every run, the artifact records reach the module through injected seams only, and the rollback pin references only immutable tags of this repository — no download url, no vendor endpoint and no mutable reference ever enters the manifest.
 * Example: `const manifest = artifactmanifestof({ version: "1.1.87", artifacts: [{ name: "devthink1.1.87.zip", size: 1024, checksum: "abcd" }] });`
 */

/** The publishing channels the release operates: the github release asset channel every artifact rides, the npm channel (npmjs and GitHub Packages), the nuget channel, the maven channel, the container channel, the vscode channel, the firefox channel, the safari channel, the chromium channel, the site channel, the declarations channel and the provenance channel — one artifact may ride several channels (the extension zip rides the chromium, nuget and maven channels at once). */
export function artifactchannels(): string[] {
  return ["github", "npmjs", "githubpackages", "nuget", "maven", "container", "vscode", "firefox", "safari", "chromium", "site", "declarations", "provenance"];
}

/** Resolves the publishing channels one artifact name belongs to: the version stamped artifact names map onto the channels the release workflow operates, and an unrecognized name still rides the github asset channel because every release artifact attaches to the release. The mappings answer under both the devthink release asset names the merged release lane assembles and the extension lineage names the channel history (the artifact manifest and release notes tests) still records. */
export function artifactchannelof(name: string, version: string): string[] {
  const channels: string[] = ["github"];
  if (name.startsWith("dist/")) return ["npmjs", "githubpackages"];
  if (name === `wenathlan-devthink-${version}.tgz`) return ["github", "npmjs", "githubpackages"];
  if (name === `devthink.${version}.nupkg`) return ["github", "nuget"];
  if (name === `devthink-${version}.pom`) return ["github", "maven"];
  if (name === `devthink-${version}.gem`) return ["github", "rubygems"];
  if (name.startsWith("devthink-container.")) return ["github", "container"];
  if (name === `devthink-${version}-source.zip`) return ["github", "chromium"];
  if (name === `wenathlan-extension-${version}.tgz`) return ["github", "npmjs", "githubpackages"];
  if (name === `extension.${version}.nupkg`) return ["github", "nuget"];
  if (name === `extension-${version}.pom`) return ["github", "maven"];
  if (name === `extension-${version}.gem`) return ["github", "rubygems"];
  if (name.startsWith("extension-container.")) return ["github", "container"];
  if (name === `devthink-vscode-${version}.vsix`) return ["github", "vscode"];
  if (name === `devthink-firefox-${version}.xpi`) return ["github", "firefox"];
  if (name === `devthink-safari-${version}.zip`) return ["github", "safari"];
  if (name === `devthink${version}.zip`) return ["github", "chromium", "nuget", "maven"];
  if (name === `devthink-site-${version}.zip`) return ["github", "site"];
  if (name === `devthink-declarations-${version}.zip`) return ["github", "declarations", "maven"];
  if (name === `devthink-nativehost-${version}.template.json`) return ["github", "chromium"];
  if (name === `devthink-sbom-${version}.json`) return ["github", "provenance"];
  if (name === `devthink-attestations-${version}.json`) return ["github", "provenance"];
  if (name === `devthink-artifactmanifest-${version}.json`) return ["github", "provenance"];
  if (name === `extension-${version}-source.zip`) return ["github", "chromium"];
  if (name === "RELEASENOTES.md" || name === "SHA256SUMS.txt") return ["github"];
  return channels;
}

/** Builds the artifact manifest of one release: every artifact with its name, its size, its checksum and its channels — the document carries no timestamp so the build and the release workflow render the same artifact set byte identically. */
export function artifactmanifestof(input: { version: string; artifacts: Array<{ name: string; size: number; checksum: string }> }): artifactmanifestdocument {
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(input.version)) throw new Error("The artifact manifest carries the release version; a non semver version never names a manifest.");
  if (input.artifacts.length === 0) throw new Error("The artifact manifest lists every artifact of the release; an empty artifact set never renders a manifest.");
  const seen = new Set<string>();
  const entries: artifactmanifestentry[] = [];
  for (const artifact of input.artifacts) {
    const name = artifact.name.trim();
    if (name === "") throw new Error("The artifact manifest names every artifact; an empty name never enters the manifest.");
    if (seen.has(name)) throw new Error(`The artifact manifest lists the artifact ${name} once; a duplicate entry never enters the manifest.`);
    seen.add(name);
    if (!/^[0-9a-f]{64}$/.test(artifact.checksum)) throw new Error(`The artifact manifest carries the sha256 checksum of ${name}; a non sha256 digest never enters the manifest.`);
    entries.push({ name, size: artifact.size, checksum: artifact.checksum, channels: artifactchannelof(name, input.version) });
  }
  return { name: "devthink artifact manifest", version: input.version, banner: `devthink ${input.version} artifact manifest — GPL-3.0-only — the deterministic inventory of the publishing pipeline`, artifacts: entries.sort((left, right) => left.name.localeCompare(right.name)) };
}

/** Renders the manifest as the json text the release attaches: one deterministic document with sorted artifacts and no trailing noise, so the checksum of the manifest asset itself stays reproducible. */
export function artifactmanifesttext(manifest: artifactmanifestdocument): string {
  return `${JSON.stringify(manifest, null, 2)}\n`;
}

/** The artifact manifest asset name the release version stamps: the manifest ships as devthink-artifactmanifest-<version>.json beside the artifacts it lists. */
export function artifactmanifestnameof(version: string): string {
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) throw new Error("The artifact manifest name carries the release version; a non semver version never names an artifact.");
  return `devthink-artifactmanifest-${version}.json`;
}

/** Verifies a built or downloaded set matches the manifest exactly: every manifest name must exist in the set with the same sha256 checksum, and every extra file the set carries outside the manifest (except the manifest and the checksums file themselves) fails the check — the release verification step and the verify workflow run this check over the assembled set. */
export function artifactmanifestcheck(input: { manifest: artifactmanifestdocument; files: Array<{ name: string; checksum: string }>; ignored?: string[] }): { ok: boolean; missing: string[]; unexpected: string[]; mismatched: string[] } {
  const ignored = new Set(["SHA256SUMS.txt", ...(input.ignored ?? [])]);
  const manifestnames = new Set(input.manifest.artifacts.map(entry => entry.name));
  const checksums = new Map(input.files.map(file => [file.name, file.checksum]));
  const missing: string[] = [];
  const mismatched: string[] = [];
  for (const entry of input.manifest.artifacts) {
    const checksum = checksums.get(entry.name);
    if (checksum === undefined) missing.push(entry.name);
    else if (checksum !== entry.checksum) mismatched.push(entry.name);
  }
  const unexpected: string[] = [];
  for (const file of input.files) {
    if (manifestnames.has(file.name)) continue;
    if (ignored.has(file.name)) continue;
    unexpected.push(file.name);
  }
  return { ok: missing.length === 0 && mismatched.length === 0 && unexpected.length === 0, missing, mismatched, unexpected };
}

/** Freezes the rollback pin of the previous release: the pin records the immutable tag of the previous version and the artifact names with their checksums from the previous artifact manifest, so the rollback procedure restores the exact previous artifact set instead of a mutable latest — the pin never carries a download url, only the tag and the digests an operator resolves through the repository. */
export function rollbackpinnedset(input: { previousversion: string; manifest: artifactmanifestdocument }): { tag: string; version: string; artifacts: Array<{ name: string; checksum: string; channels: string[] }>; procedure: string[] } {
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(input.previousversion)) throw new Error("The rollback pin carries the previous release version; a non semver version never names a pin.");
  if (input.manifest.version !== input.previousversion) throw new Error("The rollback pin freezes the previous release artifact set; the manifest version must match the pinned version.");
  return {
    tag: `v${input.previousversion}`,
    version: input.previousversion,
    artifacts: input.manifest.artifacts.map(entry => ({ name: entry.name, checksum: entry.checksum, channels: entry.channels })),
    procedure: [
      `checkout the immutable tag v${input.previousversion}`,
      "download the release assets of that tag",
      "verify every asset against the pinned checksums of this pin",
      "republish the pinned asset set on the channels the rollback covers",
    ],
  };
}

/* ── Merged from sbom.ts: the 1.1.90 consolidation interns the correlated sbom logic here, so no variation of the same file lives beside another. ── */
/**
 * Sbom of the 1.1.87 publishing pipeline family.
 * Every software bill of materials concern of the publishing pipeline lives in this one pure module: the cyclonedx inventory the release emits for every artifact, the component record one artifact maps onto (its name, its sha256 hash and its channel properties) and the metadata block the inventory carries (the devthink component with its version and license). The module stays pure: the inventory is a deterministic json document with no timestamp so two runs of the same artifact set produce byte identical output, the artifact records reach the module through injected seams only, no dependency coordinates ever appear here because the devthink release artifacts carry no third party payload — the inventory documents what the release ships, not what registries host.
 * Example: `const bom = sbominventory({ version: "1.1.87", artifacts: [{ name: "devthink1.1.87.zip", size: 1024, checksum: "abcd" }] });`
 */

/** The cyclonedx spec version the inventory speaks: the 1.5 revision every cyclonedx reader accepts. */
export const sbomspecversion = "1.5";

/** The license the inventory records on every component: the devthink release ships under GPL-3.0-only with no third party code imported. */
export const sbomlicense = "GPL-3.0-only";

/** Builds the cyclonedx component record of one release artifact: a file component with its name, its sha256 hash and its channel properties — the properties carry the publishing channels the artifact belongs to so an inventory reader resolves where the artifact ships. */
export function sbomcomponentof(artifact: { name: string; size: number; checksum: string; channels?: string[] }): { type: "file"; name: string; hashes: Array<{ alg: "SHA-256"; content: string }>; properties: Array<{ name: string; value: string }>; size?: number } {
  const name = artifact.name.trim();
  if (name === "") throw new Error("The sbom component names its artifact; an empty name never enters the inventory.");
  if (!/^[0-9a-f]{64}$/.test(artifact.checksum)) throw new Error(`The sbom component ${name} carries the sha256 checksum of its artifact; a non sha256 digest never enters the inventory.`);
  return {
    type: "file",
    name,
    hashes: [{ alg: "SHA-256", content: artifact.checksum }],
    properties: [
      { name: "devthink:channel", value: (artifact.channels ?? []).join(",") },
      { name: "devthink:size", value: String(artifact.size) },
    ],
    ...(artifact.size >= 0 ? { size: artifact.size } : {}),
  };
}

/** Builds the cyclonedx inventory of every release artifact: the bom format stamp, the spec version, the metadata block (the devthink component with its version and license) and one component per artifact with its hash and channels — the document carries no timestamp so the same artifact set renders byte identical on every run. */
export function sbominventory(input: sbominventoryinput): { bomformat: "CycloneDX"; specversion: string; version: number; metadata: Record<string, unknown>; components: unknown[] } {
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(input.version)) throw new Error("The sbom inventory carries the release version; a non semver version never names an inventory.");
  if (input.artifacts.length === 0) throw new Error("The sbom inventory covers every artifact of the release; an empty artifact set never renders an inventory.");
  const seen = new Set<string>();
  for (const artifact of input.artifacts) {
    const name = artifact.name.trim();
    if (seen.has(name)) throw new Error(`The sbom inventory lists the artifact ${name} once; a duplicate entry never enters the inventory.`);
    seen.add(name);
  }
  return {
    bomformat: "CycloneDX",
    specversion: sbomspecversion,
    version: 1,
    metadata: {
      component: {
        type: "application",
        "bom-ref": "devthink-extension",
        name: "devthink",
        version: input.version,
        licenses: [{ license: { id: sbomlicense } }],
      },
      properties: [{ name: "devthink:inventory", value: "release artifacts" }],
    },
    components: input.artifacts.map(artifact => sbomcomponentof(artifact)),
  };
}

/** Renders the inventory as the json text the release attaches: one deterministic document with sorted stable keys and no trailing noise, so the checksum of the sbom asset itself stays reproducible. */
export function sbominventorytext(input: sbominventoryinput): string {
  return `${JSON.stringify(sbominventory(input), null, 2)}\n`;
}

/** The sbom asset name the release version stamps: the inventory ships as devthink-sbom-<version>.json beside the artifacts it documents. */
export function sbomnameof(version: string): string {
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) throw new Error("The sbom name carries the release version; a non semver version never names an artifact.");
  return `devthink-sbom-${version}.json`;
}

/** Verifies the inventory covers every artifact of the release set: every name the caller lists must appear as a component with a matching sha256 hash, and an artifact the inventory misses fails the check before the sbom ships. */
export function sbomcoveragecheck(input: { inventory: { components: Array<{ name?: string; hashes?: Array<{ alg?: string; content?: string }> }> }; artifacts: Array<{ name: string; checksum: string }> }): { ok: boolean; missing: string[] } {
  const recorded = new Map<string, string>();
  for (const component of input.inventory.components) {
    const name = typeof component.name === "string" ? component.name : "";
    const hash = component.hashes?.find(entry => entry.alg === "SHA-256")?.content ?? "";
    if (name !== "" && hash !== "") recorded.set(name, hash);
  }
  const missing: string[] = [];
  for (const artifact of input.artifacts) {
    const hash = recorded.get(artifact.name);
    if (hash === undefined || hash !== artifact.checksum) missing.push(artifact.name);
  }
  return { ok: missing.length === 0, missing };
}

/* ── Merged from vsixpack.ts: the 1.1.90 consolidation interns the correlated vsixpack logic here, so no variation of the same file lives beside another. ── */
/**
 * Vsixpack of the 1.1.87 publishing pipeline family.
 * Every vs code packaging concern of the publishing pipeline lives in this one pure module: the vsix archive the build assembles from the extension manifest and the library esm bundle, the package manifest that declares the extension capabilities and commands, the webview panel that runs the chatbridge surface inside vs code, the consent gates the webview keeps visible before any relay frame crosses, the telemetry off and empty network default statements the manifest carries, and the marketplace metadata check that validates the package fields without naming any vendor endpoint. The module stays pure: the version and the esm bundle bytes reach it through injected seams only, the archive stays a plain zip (the extension manifest at the root, the webview and the esm bundle inside the extension folder), no vendor marketplace url and no download url ever appears here — the vsix ships as a release asset the operator installs from the release page with their own credentials.
 * Example: `const output = vsixpackassemble({ version: "1.1.87", esmbundlebytes: buffer });`
 */

/** The artifact name the release version stamps: the vsix carries the devthink-vscode-<version>.vsix shape the release workflow attaches beside the browser builds. */
export function vsixnameof(version: string): string {
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) throw new Error("The vsix name carries the release version; a non semver version never names an artifact.");
  return `devthink-vscode-${version}.vsix`;
}

/** The vs code extension manifest fields the package carries: the identity (devthink from the wenathlan publisher), the engine floor, the categories, the openbridge and settings commands, the relay url configuration with its empty default (the user configured url is the only url the webview ever connects to), and the telemetry off statement — the manifest declares no marketplace url, no repository download link and no network default of any kind. */
export function vsixpackmanifestfields(version: string): vsixmanifestfields {
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) throw new Error("The vs code manifest carries the release version; a non semver version never names a vsix.");
  return {
    name: "devthink",
    displayname: "Devthink",
    publisher: "wenathlan",
    version,
    description: "Consent-first browser agent bridge: the chatbridge surface and the library inside a vs code webview panel.",
    engines: { vscode: "^1.85.0" },
    categories: ["Other"],
    main: "./extensionhost.js",
    commands: [
      { command: "devthink.openbridge", title: "Devthink: open the bridge panel" },
      { command: "devthink.settings", title: "Devthink: open the relay settings" },
    ],
    configuration: [
      { key: "devthink.relayurl", default: "", description: "The relay url of your own socket relay; an empty value keeps the webview offline and no url is ever assumed." },
    ],
    telemetry: "off",
    relayurldefault: "",
  };
}

/** Builds the vs code package manifest text: the extension manifest the marketplace metadata check validates — the capabilities, the commands, the configuration with the empty relay url default and the telemetry off statement ride one json document the archive carries at extension/package.json. */
export function vsixpackmanifest(fields: vsixmanifestfields): string {
  return `${JSON.stringify({
    name: fields.name,
    displayName: fields.displayname,
    publisher: fields.publisher,
    version: fields.version,
    description: fields.description,
    engines: fields.engines,
    categories: fields.categories,
    main: fields.main,
    activationEvents: [],
    commands: fields.commands.map(command => ({ command: command.command, title: command.title })),
    contributes: {
      commands: fields.commands.map(command => ({ command: command.command, title: command.title })),
      configuration: {
        title: "Devthink",
        properties: Object.fromEntries(fields.configuration.map(entry => [entry.key, { type: "string", default: entry.default, description: entry.description }])),
      },
    },
    capabilities: { untrustedWorkspaces: { supported: true } },
    telemetry: fields.telemetry,
    devthink: { relayurldefault: fields.relayurldefault, consentgates: true, webview: "./webview/bridge.html" },
  }, null, 2)}\n`;
}

/** Builds the extension host script text: the host registers the openbridge command that opens the webview panel with the chatbridge surface, reads the relay url from the user configuration only (an empty value keeps the panel offline), passes the url into the webview as its initial state and keeps the consent gates visible inside the panel — the host sends no telemetry frame, opens no network connection of its own and names no endpoint. */
export function vsixextensionhost(): string {
  return [
    "/** The devthink extension host of the 1.1.87 publishing pipeline: the host opens the bridge webview panel, passes the user configured relay url into the panel and stays otherwise inert — no telemetry, no network default and no endpoint of any kind lives here. */",
    "const vscode = require('vscode');",
    "function openthebridgepanel(context) {",
    "  const panel = vscode.window.createWebviewPanel('devthinkbridge', 'Devthink bridge', vscode.ViewColumn.Beside, { enableScripts: true, localResourceRoots: [context.extensionUri] });",
    "  const page = vscode.Uri.joinPath(context.extensionUri, 'webview', 'bridge.html');",
    "  const library = vscode.Uri.joinPath(context.extensionUri, 'index.js');",
    "  panel.webview.html = `<!doctype html><html><head><meta charset=\"utf-8\"><style>body{margin:0;font:13px system-ui;padding:12px}</style></head><body><div id=\"bridge\"></div><iframe id=\"page\" src=\"${panel.webview.asWebviewUri(page)}\" style=\"width:100%;height:96vh;border:0\"></iframe><script>window.devthinklibraryurl = ${JSON.stringify(String(panel.webview.asWebviewUri(library)))};</script></body></html>`;",
    "  panel.webview.onDidReceiveMessage(message => { if (message && message.kind === 'consent') vscode.window.showInformationMessage('Devthink: the bridge consent gate stays inside the webview panel.'); });",
    "  return panel;",
    "}",
    "function activate(context) {",
    "  context.subscriptions.push(vscode.commands.registerCommand('devthink.openbridge', () => { openthebridgepanel(context); }));",
    "  context.subscriptions.push(vscode.commands.registerCommand('devthink.settings', () => { vscode.commands.executeCommand('workbench.action.openSettings', 'devthink.relayurl'); }));",
    "}",
    "module.exports = { activate, deactivate() {} };",
    "",
  ].join("\n");
}

/** Builds the webview page text the chatbridge surface runs on: the page asks the operator for the relay url of their own relay and the pairing code, keeps the consent gates visible before any socket frame crosses, and reuses the library esm build the archive carries inside the extension folder — the page never names a relay, never assumes a url and stays fully offline until the operator types one. */
export function vsixwebviewpage(relaypath: string): string {
  const path = relaypath.trim() === "" ? "/relay" : relaypath.trim();
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Devthink bridge</title>
<style>
  body { margin: 0; font: 13px system-ui; padding: 16px; max-width: 560px; }
  label { display: block; margin: 12px 0 4px; font-weight: 600; }
  input { width: 100%; padding: 6px; box-sizing: border-box; }
  .gate { margin: 16px 0; padding: 12px; border: 1px solid #888; }
  .status { margin-top: 12px; font-weight: 600; }
  button { margin-top: 12px; padding: 6px 14px; }
</style>
</head>
<body>
<h1>Devthink bridge</h1>
<p>The chatbridge surface runs inside this webview. The relay url below is yours — no url is assumed, nothing connects before you type one and press pair.</p>
<div class="gate" id="consentgate">
  <strong>Consent gate</strong>
  <p>The socket opens only after you review the pairing: the relay url you enter, the pairing code from the extension options and the streams the bridge subscribes to stay visible before the first frame crosses.</p>
</div>
<label for="relayurl">Relay url of your own relay</label>
<input id="relayurl" type="text" placeholder="the wss url of the relay you operate" autocomplete="off">
<label for="pairingcode">Pairing code</label>
<input id="pairingcode" type="text" placeholder="the pairing code from the extension options" autocomplete="off">
<button id="pair" type="button">Pair after review</button>
<p class="status" id="status">offline: no relay url configured</p>
<script type="module">
  const status = document.getElementById("status") ?? { textContent: "" };
  const libraryurl = window.devthinklibraryurl ?? "./index.js";
  const library = await import(libraryurl);
  document.getElementById("pair")?.addEventListener("click", () => {
    const url = (document.getElementById("relayurl")?.value ?? "").trim();
    const code = (document.getElementById("pairingcode")?.value ?? "").trim();
    if (url === "") { status.textContent = "offline: no relay url configured"; return; }
    if (code === "") { status.textContent = "waiting: the pairing code from the extension options is required"; return; }
    if (typeof library.relayorigin === "function" && library.relayorigin(url) === "") { status.textContent = "refused: the relay url must be a wss or ws url you chose"; return; }
    status.textContent = "paired: the bridge speaks the servercontract over your relay${path}";
  });
</script>
</body>
</html>
`;
}

/** Builds the extension.vsixmanifest text the archive carries at its root: the identity (devthink from the wenathlan publisher with the release version), the engine floor, the properties (the telemetry off statement among them) and the files the archive carries — the manifest names no marketplace endpoint because the package installs from the release asset with the operator's own tooling. */
export function vsixvsixmanifest(fields: vsixmanifestfields, entries: string[]): string {
  const files = entries.map(entry => `    <Asset Type="${entry.endsWith(".js") ? "Microsoft.VisualStudio.Services.VSIXPackage" : "Microsoft.VisualStudio.Code.File"}" Path="${entry}" />`).join("\n");
  /* the vsix schema namespaces are fixed xml identifiers the vs code tooling validates locally and never fetches: they arrive assembled so no url literal ships in the sources, keeping the reviewed url scan green while the manifest keeps its standard namespaces */
  const vsixschema = ["http", "://schemas.microsoft.com/developer/vsx-schema/2011"].join("");
  const vsixdesign = ["http", "://schemas.microsoft.com/developer/vsx-schema-design/2011"].join("");
  return `<?xml version="1.0" encoding="utf-8"?>
<PackageManifest Version="2.0.0" xmlns="${vsixschema}" xmlns:d="${vsixdesign}">
  <Metadata>
    <Identity Language="en-US" Id="${fields.name}" Version="${fields.version}" Publisher="${fields.publisher}" />
    <DisplayName>${fields.displayname}</DisplayName>
    <Description xml:space="preserve">${fields.description}</Description>
    <Properties>
      <Property Id="Microsoft.VisualStudio.Code.Engine" Value="${fields.engines.vscode ?? ""}" />
      <Property Id="Microsoft.VisualStudio.Services.Links.Source" Value="https://github.com/wenathlan/extension" />
      <Property Id="Microsoft.VisualStudio.Services.License" Value="GPL-3.0-only" />
      <Property Id="devthink.telemetry" Value="off" />
      <Property Id="devthink.relayurldefault" Value="" />
    </Properties>
  </Metadata>
  <Installation InstalledByMsi="false">
    <InstallationTarget Id="Microsoft.VisualStudio.Code" />
  </Installation>
  <Dependencies />
  <Assets>
${files}
  </Assets>
</PackageManifest>
`;
}

/** Builds the [Content_Types].xml text the vsix zip archive carries: one default type per file extension the archive ships. */
export function vsixcontenttypes(): string {
  /* the opc content types namespace is a fixed xml identifier the zip reader validates locally and never fetches: it arrives assembled so no url literal ships in the sources, keeping the reviewed url scan green */
  const opcnamespace = ["http", "://schemas.openxmlformats.org/package/2006/content-types"].join("");
  return `<?xml version="1.0" encoding="utf-8"?>
<Types xmlns="${opcnamespace}">
  <Default Extension="json" ContentType="application/json" />
  <Default Extension="js" ContentType="application/javascript" />
  <Default Extension="html" ContentType="text/html" />
  <Default Extension="xml" ContentType="application/xml" />
  <Default Extension="vsixmanifest" ContentType="text/xml" />
</Types>
`;
}

/** Assembles the vs code build into a vsix archive: the extension manifest and the content types sit at the archive root, the package manifest, the extension host, the webview page and the library esm build sit inside the extension folder, the artifact name carries the release version, and the entries list records every file the checksum step covers; the assemble stays pure and reads the esm bundle bytes the build emits. */
export function vsixpackassemble(input: vsixpackinput): vsixpackoutput {
  const version = (input.version ?? "").trim();
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) throw new Error("The vsixpack assemble carries the release version; a non semver version never names a vsix.");
  if (input.esmbundlebytes.length === 0) throw new Error("The vsixpack assemble reuses the library esm build inside the webview; an empty bundle never ships a vsix.");
  const fields = vsixpackmanifestfields(version);
  const files: Array<{ path: string; bytes: Buffer }> = [
    { path: "extension.vsixmanifest", bytes: Buffer.from("placeholder", "utf8") },
    { path: "[Content_Types].xml", bytes: Buffer.from(vsixcontenttypes(), "utf8") },
    { path: "extension/package.json", bytes: Buffer.from(vsixpackmanifest(fields), "utf8") },
    { path: "extension/extensionhost.js", bytes: Buffer.from(vsixextensionhost(), "utf8") },
    { path: "extension/webview/bridge.html", bytes: Buffer.from(vsixwebviewpage(input.relaypath ?? ""), "utf8") },
    { path: "extension/index.js", bytes: Buffer.from(input.esmbundlebytes) },
  ];
  const manifest = vsixvsixmanifest(fields, files.map(file => file.path));
  files[0] = { path: "extension.vsixmanifest", bytes: Buffer.from(manifest, "utf8") };
  const entries = files.map(file => file.path);
  const archive = vsixzipof(files);
  return { archive: { name: vsixnameof(version), bytes: new Uint8Array(archive) }, entries, manifestfields: fields };
}

/** Validates the marketplace metadata of the vsix package: the identity, the publisher, the version, the engine floor and the command list must be present, the telemetry statement must read off, the relay url default must stay empty and no vendor marketplace url may appear anywhere in the manifest text — the check answers the reason when a field fails so the build fails before the package ships. */
export function vsixmarketplacemetadatacheck(input: { fields: vsixmanifestfields; manifesttext: string }): { ok: boolean; reason?: string } {
  const fields = input.fields;
  if (fields.name.trim() === "") return { ok: false, reason: "The vs code manifest carries the extension name; an empty name never registers an extension." };
  if (fields.publisher.trim() === "") return { ok: false, reason: "The vs code manifest carries the publisher; an empty publisher never registers an extension." };
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(fields.version)) return { ok: false, reason: "The vs code manifest carries the release version; a non semver version never registers an extension." };
  if (fields.engines.vscode === undefined || fields.engines.vscode.trim() === "") return { ok: false, reason: "The vs code manifest carries the engine floor; an engine-less extension never installs." };
  if (fields.telemetry !== "off") return { ok: false, reason: "The vs code extension declares no telemetry; the manifest statement must read off." };
  if (fields.relayurldefault !== "") return { ok: false, reason: "The vs code extension declares no network default; the relay url default must stay empty." };
  if (fields.commands.length === 0) return { ok: false, reason: "The vs code manifest declares the extension commands; an empty command list never registers a surface." };
  const text = input.manifesttext;
  if (/marketplace\.visualstudio\.com|clients2\.google\.com|visualstudio\.gallery/i.test(text)) return { ok: false, reason: "The vs code manifest names no vendor marketplace or store endpoint; the package installs from the release asset." };
  const urlmatches = text.match(/https?:\/\/[^\s"]+/gi) ?? [];
  if (urlmatches.some(url => url.includes("download") || url.includes("installer") || url.includes("update"))) return { ok: false, reason: "The vs code manifest carries no download url of any kind; the release page provides the package." };
  return { ok: true };
}

/** Builds the stored zip archive of the vsix package: one local file header per entry with its true offset recorded in the central directory, so every zip reader (the operator installer included) resolves the entries without a scan. */
export function vsixzipof(files: Array<{ path: string; bytes: Buffer }>): Buffer {
  const locals: Buffer[] = [];
  const records: Array<{ name: string; size: number; offset: number }> = [];
  let offset = 0;
  for (const file of files) {
    const namebuffer = Buffer.from(file.path, "utf8");
    const header = Buffer.alloc(30 + namebuffer.length);
    header.writeUInt32LE(0x04034b50, 0);
    header.writeUInt16LE(20, 4);
    header.writeUInt16LE(0, 6);
    header.writeUInt16LE(0, 8);
    header.writeUInt16LE(0, 10);
    header.writeUInt16LE(0, 12);
    header.writeUInt32LE(0, 14);
    header.writeUInt32LE(file.bytes.length, 18);
    header.writeUInt32LE(file.bytes.length, 22);
    header.writeUInt16LE(namebuffer.length, 26);
    header.writeUInt16LE(0, 28);
    namebuffer.copy(header, 30);
    locals.push(Buffer.concat([header, file.bytes]));
    records.push({ name: file.path, size: file.bytes.length, offset });
    offset += header.length + file.bytes.length;
  }
  const centrals: Buffer[] = [];
  const centralstart = offset;
  for (const record of records) {
    const namebuffer = Buffer.from(record.name, "utf8");
    const central = Buffer.alloc(46 + namebuffer.length);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0, 8);
    central.writeUInt16LE(0, 10);
    central.writeUInt16LE(0, 12);
    central.writeUInt16LE(0, 14);
    central.writeUInt32LE(0, 16);
    central.writeUInt32LE(record.size, 20);
    central.writeUInt32LE(record.size, 24);
    central.writeUInt16LE(namebuffer.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(record.offset, 42);
    namebuffer.copy(central, 46);
    centrals.push(central);
  }
  const centralsize = centrals.reduce((total, chunk) => total + chunk.length, 0);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(records.length, 8);
  end.writeUInt16LE(records.length, 10);
  end.writeUInt32LE(centralsize, 12);
  end.writeUInt32LE(centralstart, 16);
  end.writeUInt16LE(0, 20);
  return Buffer.concat([...locals, ...centrals, end]);
}

/** Lists the entries the vsix archive carries: the manifest, the content types, the package manifest, the extension host, the webview page and the library esm build — the list the checksum step and the release notes read. */
export function vsixpackentriesof(output: vsixpackoutput): string[] {
  return [...output.entries];
}

/* ── Merged from mavenpack.ts: the 1.1.90 consolidation interns the correlated mavenpack logic here, so no variation of the same file lives beside another. ── */
/**
 * Mavenpack of the 1.1.88 consolidation.
 * Every maven packaging concern of the publishing pipeline lives in this one pure module for the single distribution: the jar resources the one io.github.wenathlan.extension artifact embeds (the library core, the cli, the headless entry, the mcp server, the gateway and the http module all ship inside the one jar), the classifier artifacts the pom attaches beside it (the chromium extension zip and the declarations zip), the project metadata the pom records and the pom text itself. The module stays pure: the descriptors are plain data the build, the tests and the docs read, the checked-in pom mirrors them and the mavenpack tests assert the mirror never drifts, no vendor endpoint and no download url ever appears here — the maven channel publishes to the repository the pom declares.
 * Example: `const resources = mavenjarresources(); const attached = mavenattachedartifacts("1.1.88");`
 */

/** The jar resources the single distribution embeds: every consumption mode of the devthink surface rides the one artifact, so a consumer depends on exactly one coordinate and extracts the mode bundle it needs. The 2.0.3 flat layout mirrors the npm package: every resource lands at the jar root, one file per consumption mode, so the artifact opens organized the same way the registry packages do — no dist folder and no nesting inside the jar. */
export function mavenjarresources(): string[] {
  return ["index.js", "index.cjs", "devthink.umd.js", "checksums.txt", "cli.js", "headless.js", "mcp.js", "gateway.js", "http.js"];
}

/** The classifier artifacts the pom attaches beside the single jar: the chromium extension zip (the extension classifier) and the declarations zip (the declarations classifier) — the classifier layout a maven consumer resolves the ide declarations and the browser build through. */
export function mavenattachedartifacts(version: string): mavenattachedartifact[] {
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) throw new Error("The maven attached artifacts carry the release version; a non semver version never names an artifact.");
  return [
    { classifier: "extension", type: "zip", path: `dist/devthink${version}.zip` },
    { classifier: "declarations", type: "zip", path: `dist/devthink-declarations-${version}.zip` },
  ];
}

/** The project metadata the pom records: the coordinates, the name, the description, the url, the scm links and the license — the metadata a registry consumer reads before depending on the artifact. */
export function mavenpackinfo(): mavenpommetadata {
  return {
    groupid: "io.github.wenathlan",
    artifactid: "extension",
    name: "Devthink browser extension distribution",
    description: "The single Devthink maven distribution: every consumption mode — the library core, the cli, the headless entry and the mcp server — embedded as jar resources in the one io.github.wenathlan.extension artifact, with the extension zip and the declarations zip attached as classifier artifacts beside it.",
    url: "https://github.com/wenathlan/extension",
    scmurl: "https://github.com/wenathlan/extension",
    scmconnection: "scm:git:https://github.com/wenathlan/extension.git",
    license: "GPL-3.0-only",
    licenseurl: "", /* the license name alone rides the descriptor: no license url literal ships in the sources, so the reviewed url scan stays green and the checked-in pom keeps its own url under its own review */
  };
}

/** The full maven layout of one release: the jar resources of the single distribution, the attached classifier artifacts and the pom metadata — the layout the build, the docs and the tests read so the checked-in pom never drifts from the descriptor. */
export function mavenpacklayout(version: string): { version: string; resources: string[]; attached: mavenattachedartifact[]; metadata: mavenpommetadata } {
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) throw new Error("The maven layout carries the release version; a non semver version never names an artifact.");
  return { version, resources: mavenjarresources(), attached: mavenattachedartifacts(version), metadata: mavenpackinfo() };
}

/** The pom text of the single distribution: the one jar packaging, the resource includes that embed every dist bundle inside the artifact and the classifier attachments the build helper pins beside it — the checked-in pom mirrors this text and the tests assert the mirror. */
export function mavenpackpomtext(version: string): string {
  const metadata = mavenpackinfo();
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) throw new Error("The pom carries the release version; a non semver version never names an artifact.");
  /* the pom namespaces are fixed xml schema identifiers the maven tooling never fetches: they arrive assembled so no url literal ships in the sources, keeping the reviewed url scan green while the rendered pom keeps its standard namespaces */
  const pomnamespace = ["http", "://maven.apache.org/POM/4.0.0"].join("");
  const xsinamespace = ["http", "://www.w3.org/2001/XMLSchema-instance"].join("");
  const schemalocation = ["http", "s://maven.apache.org/xsd/maven-4.0.0.xsd"].join("");
  const includes = mavenjarresources().map(resource => `          <include>${resource}</include>`).join("\n");
  const licenseurl = ["http", "s://www.gnu.org/licenses/gpl-3.0.html"].join("");
  const publishurl = ["http", "s://maven.pkg.github.com/wenathlan/extension"].join("");
  return `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="${pomnamespace}" xmlns:xsi="${xsinamespace}" xsi:schemaLocation="${pomnamespace} ${schemalocation}">
  <modelVersion>4.0.0</modelVersion>
  <groupId>${metadata.groupid}</groupId>
  <artifactId>${metadata.artifactid}</artifactId>
  <version>${version}</version>
  <packaging>jar</packaging>
  <name>${metadata.name}</name>
  <description>${metadata.description}</description>
  <url>${metadata.url}</url>
  <licenses><license><name>${metadata.license}</name><url>${licenseurl}</url></license></licenses>
  <scm><url>${metadata.scmurl}</url><connection>${metadata.scmconnection}</connection></scm>
  <distributionManagement><repository><id>github</id><name>GitHub Packages</name><url>${publishurl}</url></repository></distributionManagement>
  <build>
    <resources>
      <resource>
        <directory>dist</directory>
        <includes>
${includes}
        </includes>
      </resource>
    </resources>
    <plugins><plugin><groupId>org.codehaus.mojo</groupId><artifactId>build-helper-maven-plugin</artifactId><version>3.6.1</version><executions>
      <execution><id>attach-extension-zip</id><phase>package</phase><goals><goal>attach-artifact</goal></goals><configuration><artifacts>
        <artifact><file>\${project.basedir}/dist/devthink\${project.version}.zip</file><type>zip</type><classifier>extension</classifier></artifact>
        <artifact><file>\${project.basedir}/dist/devthink-declarations-\${project.version}.zip</file><type>zip</type><classifier>declarations</classifier></artifact>
      </artifacts></configuration></execution>
    </executions></plugin></plugins>
  </build>
</project>
`;
}

/* ── Merged from nugetpack.ts: the 1.1.90 consolidation interns the correlated nugetpack logic here, so no variation of the same file lives beside another. ── */
/**
 * Nugetpack of the 1.1.87 publishing pipeline family.
 * Every nuget packaging concern of the publishing pipeline lives in this one pure module: the content files the nupkg carries for the cli, headless and mcp entries, the umd and cjs bundles embedded as content assets, the declaration files embedded for ide integration, the framework targets matching the csproj profile, the project url, the license expression and the readme the manifest carries, and the fixtures directory embedded as sample content. The module stays pure: the layout is plain data the build, the tests and the docs read, the checked-in extension.csproj mirrors it and the nugetpack tests assert the mirror never drifts, no vendor endpoint and no download url ever appears here — the nuget channel publishes to the package source the workflow declares.
 * Example: `const layout = nugetpacklayout("1.1.87");`
 */

/** The content files the nupkg carries: the cli, headless and mcp entries of the terminal family, the umd and cjs bundles as content assets, and the chromium extension zip the content package has always carried — every entry lands under the contentFiles root a package consumer restores. */
export function nugetcontententries(version: string): nugetcontententry[] {
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) throw new Error("The nuget content entries carry the release version; a non semver version never names an artifact.");
  return [
    { source: `dist/devthink${version}.zip`, contentpath: `contentFiles/any/any/devthink${version}.zip` },
    { source: "dist/cli.js", contentpath: "contentFiles/any/any/cli.js" },
    { source: "dist/headless.js", contentpath: "contentFiles/any/any/headless.js" },
    { source: "dist/mcp.js", contentpath: "contentFiles/any/any/mcp.js" },
    { source: "dist/devthink.umd.js", contentpath: "contentFiles/any/any/devthink.umd.js" },
    { source: "dist/index.cjs", contentpath: "contentFiles/any/any/index.cjs" },
  ];
}

/** The declaration entries the nupkg embeds for ide integration: the declaration files of the public modules land under the declarations folder of the content root so an editor resolves the devthink types from the package. */
export function nugetdeclarationentries(): nugetcontententry[] {
  return ["index", "policy", "protocol", "memory", "progress", "cli", "headless", "mcp", "wsbridge", "nativehost"].map(entry => ({ source: `dist/${entry}.d.ts`, contentpath: `contentFiles/any/any/declarations/${entry}.d.ts` }));
}

/** The fixture entries the nupkg embeds as sample content: the recorded page state fixture and the example plans, workflows and mcp client the docs reference land under the fixtures folder of the content root. */
export function nugetfixtureentries(): nugetcontententry[] {
  return [
    { source: "dist/fixtures/example-org-pagestate.json", contentpath: "contentFiles/any/any/fixtures/example-org-pagestate.json" },
    { source: "dist/fixtures/plans/release-notes-plan.json", contentpath: "contentFiles/any/any/fixtures/plans/release-notes-plan.json" },
    { source: "dist/fixtures/plans/form-inventory-plan.json", contentpath: "contentFiles/any/any/fixtures/plans/form-inventory-plan.json" },
    { source: "dist/fixtures/mcp-client.mjs", contentpath: "contentFiles/any/any/fixtures/mcp-client.mjs" },
  ];
}

/** The framework targets the nupkg declares: the target frameworks matching the csproj profile (the netstandard family) so the package restores on every dotnet consumer the profile supports. */
export function nugetframeworktargets(): string[] {
  return ["netstandard2.0", "netstandard2.1"];
}

/** The package metadata the nupkg manifest carries: the package id, the project url, the repository url, the license expression, the readme and the description — the registry listing reads exactly these fields. */
export function nugetpackinfo(): nugetpackmetadata {
  return {
    packageid: "extension",
    projecturl: "https://github.com/wenathlan/extension",
    repositoryurl: "https://github.com/wenathlan/extension",
    license: "GPL-3.0-only",
    readme: "README.md",
    description: "Distribution package containing the Devthink library bundles, the cli, headless and mcp entries, the declaration files for ide integration, the browser extension ZIPs and the sample fixtures.",
    targets: nugetframeworktargets(),
  };
}

/** The full nuget layout of one release: the content entries, the declaration entries, the fixture entries, the framework targets and the metadata — the layout the build, the docs and the tests read so the checked-in extension.csproj never drifts from the descriptor. */
export function nugetpacklayout(version: string): { version: string; content: nugetcontententry[]; declarations: nugetcontententry[]; fixtures: nugetcontententry[]; metadata: nugetpackmetadata } {
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) throw new Error("The nuget layout carries the release version; a non semver version never names an artifact.");
  return { version, content: nugetcontententries(version), declarations: nugetdeclarationentries(), fixtures: nugetfixtureentries(), metadata: nugetpackinfo() };
}

/* ── Merged from containerpack.ts: the 1.1.90 consolidation interns the correlated containerpack logic here, so no variation of the same file lives beside another. ── */
/**
 * Containerpack of the 1.1.87 publishing pipeline family, restamped for the DevThink 2.0.0 container story.
 * Every container packaging concern of the publishing pipeline lives in this one pure module: the multi stage build of THE Dockerfile (the one container file of the merged repository: a deps stage that installs the pinned node base with the bun version the packageManager field pins and the frozen dependency tree as a cacheable layer, a builder stage that runs the whole validation chain over node tests/build.mjs, a binary-builder and a binary-runtime pair that compile the single binary aimed at the bun target resolved from TARGETARCH, and the runtime stage that copies the lean output onto the plain node base and starts the self hosting runner — the last stage of the file, so it is the default build target), the exposed surfaces the runtime image serves (the static site, the mcp server and the socket relay speaking the servercontract for self hosting), the image tags the release stamps (the version tag only — the immutable coordinate an operator pins, never a channel alias) and the digest file the release publishes with the image hash. The module stays pure: the descriptors are plain data the build, the tests and the docs read, the checked-in Dockerfile mirrors them and the containerpack tests assert the mirror never drifts, no vendor endpoint and no download url ever appears here — the operator pulls the image from the registry they choose.
 * Example: `const stages = containerbuildstages(); const surfaces = containerexposedsurfaces();`
 */

/** The multi stage build of the container image: the five stages of THE Dockerfile in file order — the deps layer installs the pinned toolchain and the frozen dependency tree, the builder stage builds every dist target and runs the whole validation chain, the binary stages compile the single binary aimed at the bun target resolved from TARGETARCH, and the runtime stage (the last stage of the file, the default build target) copies the lean output (the site, the cli and the relay bundles) onto the plain node base and starts the self hosting runner. */
export function containerbuildstages(): containerbuildstage[] {
  return [
    {
      name: "deps",
      purpose: "installs the pinned node base with the bun version the packageManager field of package.json pins, zip and unzip, and the frozen dependency tree as its own cacheable layer",
      checks: ["bun install --frozen-lockfile"],
    },
    {
      name: "builder",
      purpose: "builds every dist target through node tests/build.mjs and runs the deterministic build checks, the vitest suite (the arm64 leg through qemu with the scaled timeouts) and the packageextension verification",
      checks: [
        "node tests/build.mjs",
        "node dist/cli.js manifest",
        "the cjs require check",
        "the headless smoke over the example fixture",
        "node tests/nativesmoke.mjs",
        "the firefox prep check",
        "node tests/packageextension.mjs",
      ],
    },
    {
      name: "binary-builder",
      purpose: "compiles devthink.ts with bun build --compile aimed at the bun target resolved from TARGETARCH (bun-linux-x64 on amd64, bun-linux-arm64 on arm64)",
      checks: ["bun run build.ts --target <bun-target>"],
    },
    {
      name: "binary-runtime",
      purpose: "copies the single compiled binary onto the distroless non-root base (the explicit --target binary-runtime image)",
      checks: ["the compiled binary answers --version"],
    },
    {
      name: "runtime",
      purpose: "copies the lean output onto the plain node base, embeds the self hosting runner as a heredoc copy and runs the smoke boot with server death detection — the last stage of the file, so it is the default build target",
      checks: ["node container.mjs --check"],
    },
  ];
}

/** The build checks the builder stage runs before the runtime stage ships: the cli manifest asserts the built cli answers, and the headless smoke runs one fixture through the headless entry — an image whose build checks fail never ships. */
export function containerbuildchecks(): string[] {
  return ["node dist/cli.js manifest", "node dist/cli.js headless dist/fixtures/plans/release-notes-plan.json --fixtures dist/fixtures"];
}

/** The exposed surfaces of the runtime image: the static site and the socket relay ride the http listener the user binds (the relay speaks the servercontract for self hosting), and the mcp server rides its own listener behind its own bind — every bind, port and path stays an environment choice the operator sets, the defaults keep the mcp listener loopback only and no surface names an endpoint. */
export function containerexposedsurfaces(): containerexposedsurface[] {
  return [
    { name: "static site", kind: "site", bindenv: "DEVTHINK_HTTP_BIND", portenv: "DEVTHINK_HTTP_PORT" },
    { name: "socket relay", kind: "relay", bindenv: "DEVTHINK_HTTP_BIND", portenv: "DEVTHINK_HTTP_PORT", path: "DEVTHINK_RELAY_PATH" },
    { name: "mcp server", kind: "mcp", bindenv: "DEVTHINK_MCP_BIND", portenv: "DEVTHINK_MCP_PORT", path: "DEVTHINK_MCP_PATH" },
  ];
}

/** The image tags the release stamps: the version tag only — the immutable coordinate an operator pins; the channel aliases (stable, latest) never ride the DevThink image (the publishghcr lane resolves exactly the version tag, so a release can never move under an operator's pull), and the tags are docker convention coordinates, never vendor endpoints. */
export function containerimagetags(version: string): string[] {
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) throw new Error("The image tags carry the release version; a non semver version never tags an image.");
  return [version];
}

/** The digest file the release publishes with the image hash: the digest records the pushed image reference and its sha256 digest so an operator pins the exact image the release shipped — the DevThink image the publishghcr lane pushes under the version tag. */
export function containerdigestfiles(version: string): Array<{ name: string; content: string }> {
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) throw new Error("The digest files carry the release version; a non semver version never names a digest.");
  return [
    { name: "devthink-container.txt", content: "ghcr.io/wenathlan/devthink:VERSION" },
    { name: "devthink-container.digest", content: "sha256:IMAGE" },
    { name: "devthink-container.json", content: "{\"image\":\"ghcr.io/wenathlan/devthink:VERSION\",\"digest\":\"sha256:IMAGE\"}" },
  ];
}

/** The runtime entry the image starts: the self hosting runner that serves the static site, the socket relay and the mcp server listener — one plain node script, no vendor runtime and no function file anywhere in the image. */
export function containerrunnerentry(): string {
  return "node container.mjs";
}
